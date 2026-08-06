/**
 * Cinematic lighting / post — shadows, HDRI env, optional SSAO.
 * Keeps the traffic kernel; upgrades the look toward “sim cinematic,” not Unreal photoreal.
 */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { SSAOPass } from 'three/addons/postprocessing/SSAOPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

/**
 * @param {object} opts
 * @param {THREE.WebGLRenderer} opts.renderer
 * @param {THREE.Scene} opts.scene
 * @param {THREE.Camera} opts.camera
 * @param {THREE.DirectionalLight} opts.sun
 * @param {THREE.Mesh} [opts.ground]
 * @param {boolean} [opts.isAus] — F4 clay: longer soft shadows, quieter env/SSAO
 */
export function createCinematic(opts) {
  const { renderer, scene, camera, sun, ground, isAus } = opts;
  if (!renderer || !scene || !camera || !sun) {
    return {
      enabled: false,
      render() {
        renderer.render(scene, camera);
      },
      update() {},
      resize() {},
      markShadowCasters() {},
    };
  }

  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.shadowMap.autoUpdate = true;
  /* Tone mapping moves to OutputPass when composer is active */
  const hadTone = renderer.toneMapping;
  const hadExposure = renderer.toneMappingExposure;

  /* Soft studio env — quieter for Austin clay (F4 is lit by sun + soft AO, not HDRI glass) */
  let envMap = null;
  try {
    const pmrem = new THREE.PMREMGenerator(renderer);
    pmrem.compileEquirectangularShader();
    envMap = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envMap;
    scene.environmentIntensity = isAus ? 0.18 : 0.55;
    pmrem.dispose();
  } catch (e) {
    console.warn('[HTS] cinematic env', e && e.message);
  }

  sun.castShadow = true;
  sun.shadow.mapSize.set(isAus ? 3072 : 2048, isAus ? 3072 : 2048);
  sun.shadow.bias = -0.00015;
  sun.shadow.normalBias = 2.0;
  sun.shadow.radius = isAus ? 3.8 : 2.5;
  sun.shadow.camera.near = 20;
  sun.shadow.camera.far = isAus ? 4200 : 3500;
  const sh = isAus ? 1200 : 900;
  sun.shadow.camera.left = -sh;
  sun.shadow.camera.right = sh;
  sun.shadow.camera.top = sh;
  sun.shadow.camera.bottom = -sh;
  sun.shadow.camera.updateProjectionMatrix();

  if (ground) {
    ground.receiveShadow = true;
    /* Austin keeps Lambert (matte clay ground); Houston upgrades toward PBR */
    if (!isAus && ground.material && ground.material.isMeshLambertMaterial) {
      const old = ground.material;
      ground.material = new THREE.MeshStandardMaterial({
        map: old.map,
        color: old.color.clone(),
        roughness: 0.92,
        metalness: 0.02,
        envMapIntensity: 0.35,
        polygonOffset: true,
        polygonOffsetFactor: 2,
        polygonOffsetUnits: 4,
      });
      if (envMap) ground.material.envMap = envMap;
      old.dispose();
    } else if (ground.material && !isAus) {
      ground.material.roughness = 0.92;
      ground.material.metalness = 0.02;
    }
  }

  let composer = null;
  let ssaoPass = null;
  let useComposer = false;
  try {
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    ssaoPass = new SSAOPass(scene, camera, innerWidth, innerHeight);
    /* Soft contact shadow — F4 reads depth from sun shadows more than SSAO */
    ssaoPass.kernelRadius = isAus ? 8 : 12;
    ssaoPass.minDistance = 0.0005;
    ssaoPass.maxDistance = isAus ? 0.05 : 0.08;
    ssaoPass.output = SSAOPass.OUTPUT.Default;
    composer.addPass(ssaoPass);
    composer.addPass(new OutputPass());
    renderer.toneMapping = THREE.NoToneMapping;
    useComposer = true;
  } catch (e) {
    console.warn('[HTS] cinematic SSAO unavailable', e && e.message);
    useComposer = false;
    renderer.toneMapping = hadTone;
    renderer.toneMappingExposure = hadExposure;
  }

  let shadowsOn = false;
  let ssaoOn = false;

  function markShadowCasters(root) {
    if (!root) return;
    root.traverse((o) => {
      if (!o.isMesh) return;
      /* Skip huge water planes / sprites */
      if (o.material && o.material.map && o.isSprite) return;
      const n = (o.name || '') + ((o.parent && o.parent.name) || '');
      if (/water|lake|bayou|cloud|sky/i.test(n)) {
        o.castShadow = false;
        o.receiveShadow = true;
        return;
      }
      o.castShadow = true;
      o.receiveShadow = true;
    });
  }

  function update(camState, nightF, fpsAvg) {
    const radius = (camState && camState.radius) || 4000;
    const tx = (camState && camState.target && camState.target.x) || 0;
    const tz = (camState && camState.target && camState.target.z) || 0;
    const perfOk = fpsAvg == null || fpsAvg > 38;
    /* Austin metro view is more oblique — keep soft shadows farther out */
    const wantShadow = radius < (isAus ? 4200 : 2400) && nightF < 0.85 && perfOk;
    const wantSsao = useComposer && radius < (isAus ? 1800 : 1600) && perfOk && nightF < 0.9;

    if (wantShadow !== shadowsOn) {
      shadowsOn = wantShadow;
      sun.castShadow = shadowsOn;
      renderer.shadowMap.enabled = shadowsOn;
    }

    if (shadowsOn) {
      /* Keep shadow frustum centered on look-at so CBD stays crisp */
      const sp = sun.position;
      const dir = new THREE.Vector3(tx - sp.x, 80 - sp.y, tz - sp.z).normalize();
      /* Light already positioned by envUpdate; aim shadow cam at target */
      sun.target.position.set(tx, 0, tz);
      if (!sun.target.parent) scene.add(sun.target);
      const ext = Math.max(280, Math.min(isAus ? 1400 : 1100, radius * (isAus ? 0.7 : 0.55)));
      const sc = sun.shadow.camera;
      sc.left = -ext;
      sc.right = ext;
      sc.top = ext;
      sc.bottom = -ext;
      sc.far = Math.max(1200, radius * 2.2);
      sc.updateProjectionMatrix();
      void dir;
    }

    if (ssaoPass) {
      ssaoOn = wantSsao;
      ssaoPass.enabled = ssaoOn;
      if (ssaoOn) {
        ssaoPass.kernelRadius = isAus ? (radius < 400 ? 12 : 7) : radius < 400 ? 18 : 11;
      }
    }

    if (scene.environmentIntensity != null) {
      /* Env bounce reads as fill light — crush it at night so darkness feels real */
      scene.environmentIntensity = isAus
        ? 0.02 + (1 - nightF) * 0.2
        : 0.04 + (1 - nightF) * 0.55;
    }
  }

  function resize(w, h) {
    if (composer) composer.setSize(w, h);
    if (ssaoPass) ssaoPass.setSize(w, h);
  }

  function render() {
    if (useComposer && composer && (ssaoOn || true)) {
      /* Always use composer when available so OutputPass matches ACES path */
      if (ssaoPass) ssaoPass.enabled = ssaoOn;
      composer.render();
    } else {
      renderer.render(scene, camera);
    }
  }

  console.log('%cCinematic render · shadows + env' + (useComposer ? ' + SSAO' : ''), 'color:#7fd6a0');

  return {
    enabled: true,
    envMap,
    markShadowCasters,
    update,
    resize,
    render,
  };
}

/**
 * F4 Map–style clay materials (legacy). Austin OSM now uses windowed façades
 * in osm-buildings.js — kept so old imports don’t break.
 */
export function createOsmClayMaterials() {
  const wall = new THREE.MeshLambertMaterial({ color: 0xf4f1ea });
  const wallWarm = new THREE.MeshLambertMaterial({ color: 0xebe6dc });
  const wallCool = new THREE.MeshLambertMaterial({ color: 0xf0f2f4 });
  const roof = new THREE.MeshLambertMaterial({ color: 0xdcd8d0 });
  const roofDark = new THREE.MeshLambertMaterial({ color: 0xc8c4bc });
  return { wall, wallWarm, wallCool, roof, roofDark };
}

/** @deprecated use createOsmClayMaterials — kept for imports */
export function createOsmPbrMaterials() {
  return createOsmClayMaterials();
}
