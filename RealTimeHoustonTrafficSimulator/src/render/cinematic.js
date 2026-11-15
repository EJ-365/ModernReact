/**
 * Cinematic render pipeline v2 — "Glow".
 *
 * HDR scene → (SSAO) → bloom → color grade → ACES tone map.
 *  - Real bloom: headlights, tail lights, lit windows, street lamps, sun and moon glow.
 *  - Weather aware grade: clear days are warm and punchy, rain and overcast go cool and soft,
 *    wet nights get wider, softer light halos.
 *  - Auto quality: drops post FX when frames get slow and brings them back when there is headroom,
 *    so the sim stays smooth on any GPU.
 *  - Keys: Shift+G cycles Auto, Cinematic, Balanced, Performance. URL: ?fx=cinematic|balanced|performance|auto
 */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { SSAOPass } from 'three/addons/postprocessing/SSAOPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

/* Tiers: 0 performance (plain render), 1 balanced (bloom + grade), 2 cinematic (+ SSAO where supported) */
const TIER_NAMES = ['Performance', 'Balanced', 'Cinematic'];
const MODES = ['auto', 'cinematic', 'balanced', 'performance'];

const GradeShader = {
  name: 'HTSGradeShader',
  uniforms: {
    tDiffuse: { value: null },
    uRes: { value: new THREE.Vector2(1, 1) },
    uSat: { value: 1.08 },
    uContrast: { value: 1.06 },
    uVig: { value: 0.22 },
    uGrain: { value: 0.022 },
    uTime: { value: 0 },
    uLift: { value: new THREE.Vector3(0.98, 1.0, 1.03) },
    uGain: { value: new THREE.Vector3(1.03, 1.0, 0.96) },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse; uniform vec2 uRes;
    uniform float uSat, uContrast, uVig, uGrain, uTime;
    uniform vec3 uLift, uGain;
    varying vec2 vUv;
    float hash(vec2 p){ p = fract(p * vec2(443.897, 441.423)); p += dot(p, p.yx + 19.19); return fract((p.x + p.y) * p.x); }
    void main(){
      vec4 t = texture2D(tDiffuse, vUv);
      vec3 c = max(t.rgb, 0.0);
      float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
      c = mix(vec3(l), c, uSat);
      /* contrast in linear light around 18% grey, so highlights keep their HDR energy */
      c = 0.18 * pow(c / 0.18 + 1e-5, vec3(uContrast));
      /* split tone: cool shadows, warm highlights (film look) */
      float lw = l / (l + 0.35);
      c *= mix(uLift, uGain, lw);
      vec2 q = vUv - 0.5; q.x *= uRes.x / max(1.0, uRes.y);
      c *= 1.0 - uVig * smoothstep(0.45, 1.15, length(q));
      c *= 1.0 + (hash(vUv * uRes + uTime) - 0.5) * uGrain;
      gl_FragColor = vec4(c, t.a);
    }`,
};

const lerp = (a, b, t) => a + (b - a) * t;
const clamp01 = (v) => Math.max(0, Math.min(1, v));

/**
 * @param {object} opts
 * @param {THREE.WebGLRenderer} opts.renderer
 * @param {THREE.Scene} opts.scene
 * @param {THREE.Camera} opts.camera
 * @param {THREE.DirectionalLight} opts.sun
 * @param {THREE.Mesh} [opts.ground]
 * @param {boolean} [opts.isAus] — F4 clay: longer soft shadows, quieter env/SSAO
 * @param {boolean} [opts.lowGpu] — recovering from a GPU reset: start in performance
 */
export function createCinematic(opts) {
  const { renderer, scene, camera, sun, ground, isAus, lowGpu } = opts;
  if (!renderer || !scene || !camera || !sun) {
    return {
      enabled: false,
      render() { renderer.render(scene, camera); },
      renderScene(s, c) { renderer.render(s, c); },
      update() {},
      resize() {},
      markShadowCasters() {},
    };
  }

  const _win = typeof navigator !== 'undefined' && /Windows/i.test(navigator.userAgent || '');
  const _mobile = typeof innerWidth !== 'undefined' && innerWidth < 900;
  const reversedZ = !!(renderer.capabilities && renderer.capabilities.reversedDepthBuffer);
  const toneMap = renderer.toneMapping === THREE.NoToneMapping ? THREE.ACESFilmicToneMapping : renderer.toneMapping;
  renderer.toneMapping = toneMap;

  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap; /* PCFSoft is deprecated in 0.185; PCF + shadow.radius is the soft path */
  /* Only rebuild the shadow map when the view moves — big free FPS when parked */
  renderer.shadowMap.autoUpdate = false;
  renderer.shadowMap.needsUpdate = true;

  /* Soft studio env — fill light for Lambert/Standard city (skipping this made Windows go muddy/dark) */
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
  /* Windows: smaller shadow map = faster first frame + steadier FPS */
  const shadowRes = _win ? 1024 : (isAus ? 3072 : 2048);
  sun.shadow.mapSize.set(shadowRes, shadowRes);
  sun.shadow.bias = reversedZ ? -0.0003 : -0.00015;
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

  /* ---------- post chain ---------- */
  let composer = null, renderPass = null, ssaoPass = null, bloomPass = null, gradePass = null, outputPass = null;
  let useComposer = false;
  const _sz = new THREE.Vector2();
  let _cw = 0, _ch = 0, _cpr = 0;
  try {
    const pr = renderer.getPixelRatio();
    renderer.getSize(_sz);
    const w = Math.max(1, Math.round(_sz.x * pr)), h = Math.max(1, Math.round(_sz.y * pr));
    /* HDR target so lights above 1.0 survive into the bloom. MSAA keeps edges as clean as the plain canvas.
       Reversed-Z needs a float depth buffer in the target or far land z-fights again. */
    const msaa = _win || lowGpu || _mobile ? 0 : 4;
    const rt = new THREE.WebGLRenderTarget(w, h, {
      type: THREE.HalfFloatType,
      samples: msaa,
      depthTexture: reversedZ ? new THREE.DepthTexture(w, h, THREE.FloatType) : null,
    });
    composer = new EffectComposer(renderer, rt);
    renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);
    /* SSAO reads a standard depth buffer; with reversed-Z it mis-shades, so it only runs without it */
    if (!_win && !reversedZ && !_mobile) {
      ssaoPass = new SSAOPass(scene, camera, _sz.x, _sz.y);
      ssaoPass.kernelRadius = isAus ? 8 : 12;
      ssaoPass.minDistance = 0.0005;
      ssaoPass.maxDistance = isAus ? 0.05 : 0.08;
      ssaoPass.output = SSAOPass.OUTPUT.Default;
      ssaoPass.enabled = false;
      composer.addPass(ssaoPass);
    }
    bloomPass = new UnrealBloomPass(new THREE.Vector2(_sz.x, _sz.y), 0.4, 0.5, 1.2);
    composer.addPass(bloomPass);
    gradePass = new ShaderPass(GradeShader);
    composer.addPass(gradePass);
    outputPass = new OutputPass();
    composer.addPass(outputPass);
    composer.setPixelRatio(pr);
    composer.setSize(_sz.x, _sz.y);
    _cw = _sz.x; _ch = _sz.y; _cpr = pr;
    useComposer = true;
  } catch (e) {
    console.warn('[HTS] cinematic post unavailable', e && e.message);
    composer = null;
    useComposer = false;
  }

  /* ---------- quality tiers ---------- */
  const maxTier = !useComposer ? 0 : 2;
  let mode = 'auto';
  try {
    const q = (typeof location !== 'undefined' && /[?&]fx=(\w+)/.exec(location.search)) || null;
    const saved = typeof localStorage !== 'undefined' ? localStorage.getItem('hts-fx') : null;
    const m = (q && q[1]) || saved;
    if (m === 'off') mode = 'performance';
    else if (MODES.includes(m)) mode = m;
  } catch (_e) { /* storage blocked */ }
  /* old integrated GPUs (Intel HD 2000–5000, GMA, UHD 6xx on low power) can't afford post FX on a whole metro: start in Performance */
  let gpuName = '';
  try { const gl = renderer.getContext(), ext = gl.getExtension('WEBGL_debug_renderer_info'); gpuName = ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : ''; } catch (_e) { /* blocked */ }
  const weakGpu = /Intel.*(HD Graphics( [2-5]\d{3})?\b|GMA)|SwiftShader|llvmpipe|Mali-[GT][1-7]\d\b|Adreno \(TM\) [3-5]\d\d/i.test(gpuName)
    && !/Iris/i.test(gpuName);
  let autoTier = !useComposer ? 0 : (lowGpu || weakGpu ? 0 : (_win || _mobile ? 1 : 2));
  let _lowT = 0, _hiT = 0, _coolT = 0, _lastT = performance.now();
  const tierFor = () => Math.min(maxTier,
    mode === 'cinematic' ? 2 : mode === 'balanced' ? 1 : mode === 'performance' ? 0 : autoTier);

  function stepAuto(fps) {
    const now = performance.now(), dt = Math.min(1, (now - _lastT) / 1000);
    _lastT = now;
    if (mode !== 'auto' || fps == null || !useComposer) return;
    _coolT = Math.max(0, _coolT - dt);
    _lowT = fps < 30 ? _lowT + dt : 0;
    _hiT = fps > 56 ? _hiT + dt : 0;
    if (_coolT > 0) return;
    if (_lowT > 2.5 && autoTier > 0) { autoTier--; _lowT = 0; _coolT = 6; }
    else if (_hiT > 9 && autoTier < maxTier) { autoTier++; _hiT = 0; _coolT = 8; }
  }

  let toastEl = null, toastT = 0;
  function toast(msg) {
    if (typeof document === 'undefined') return;
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.style.cssText = 'position:fixed;left:50%;bottom:84px;transform:translateX(-50%);z-index:9999;'
        + 'padding:8px 16px;border-radius:999px;background:rgba(12,18,28,.82);color:#e8f4ff;font:600 13px system-ui;'
        + 'letter-spacing:.02em;pointer-events:none;transition:opacity .3s;backdrop-filter:blur(6px);box-shadow:0 0 18px rgba(120,200,255,.35)';
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.style.opacity = '1';
    clearTimeout(toastT);
    toastT = setTimeout(() => { if (toastEl) toastEl.style.opacity = '0'; }, 1800);
  }
  function setMode(m) {
    if (!MODES.includes(m)) return;
    mode = m;
    try { localStorage.setItem('hts-fx', m); } catch (_e) { /* ignore */ }
    const t = tierFor();
    toast('Graphics: ' + (m === 'auto' ? 'Auto (' + TIER_NAMES[t] + ')' : TIER_NAMES[t]));
  }
  if (typeof addEventListener !== 'undefined') {
    addEventListener('keydown', (e) => {
      if (!e.shiftKey || (e.key !== 'G' && e.key !== 'g')) return;
      const tg = e.target && e.target.tagName;
      if (tg === 'INPUT' || tg === 'TEXTAREA' || (e.target && e.target.isContentEditable)) return;
      setMode(MODES[(MODES.indexOf(mode) + 1) % MODES.length]);
    });
  }

  /* ---------- per frame look ---------- */
  let shadowsOn = false;
  let ssaoOn = false;
  let ssaoBudget = false;
  let _shTx = 1e9, _shTz = 1e9, _shR = -1, _shT = 0;
  const look = { night: 0, wet: 0, grey: 0 };

  function markShadowCasters(root) {
    if (!root) return;
    root.traverse((o) => {
      if (!o.isMesh) return;
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

  function applyLook(nightF, wet, grey, k) {
    look.night = lerp(look.night, nightF, k);
    look.wet = lerp(look.wet, wet, k);
    look.grey = lerp(look.grey, grey, k);
    const n = look.night, w = look.wet, g = look.grey;
    if (bloomPass) {
      /* day: only the sun, glints and the brightest whites bloom. night: every lamp, window and headlight glows.
         rain at night: wider, softer halos like light through a wet windshield */
      bloomPass.threshold = lerp(1.35, 0.72, n) - w * 0.1 * n;
      bloomPass.strength = lerp(0.2, 0.58, n) + w * 0.16 * n + g * 0.04;
      bloomPass.radius = lerp(0.35, 0.52, n) + w * 0.14;
    }
    if (gradePass) {
      const u = gradePass.uniforms;
      u.uSat.value = lerp(lerp(1.1, 1.02, n), 0.86, Math.max(w, g * 0.7));
      u.uContrast.value = lerp(lerp(1.07, 1.1, n), 0.98, g * 0.8);
      u.uVig.value = lerp(0.12, 0.22, n); /* the HUD already has a soft CSS vignette */
      u.uGrain.value = lerp(0.018, 0.04, n);
      const cool = Math.max(g * 0.6, w * 0.5);
      u.uLift.value.set(lerp(lerp(0.98, 0.9, n), 0.96, cool), lerp(1.0, 0.97, n), lerp(lerp(1.03, 1.1, n), 1.06, cool));
      u.uGain.value.set(lerp(lerp(1.04, 1.07, n), 0.99, cool), 1.0, lerp(lerp(0.95, 0.92, n), 1.02, cool));
    }
  }

  /**
   * @param {object} camState — {radius, target}
   * @param {number} nightF — 0 day … 1 night
   * @param {number} [fpsAvg]
   * @param {object} [wx] — {rain, cloud} 0…1 (Houston wxBlend)
   */
  function update(camState, nightF, fpsAvg, wx) {
    stepAuto(fpsAvg);
    const radius = (camState && camState.radius) || 4000;
    const tx = (camState && camState.target && camState.target.x) || 0;
    const tz = (camState && camState.target && camState.target.z) || 0;
    const altY = camera.position.y || 0;
    const tier = tierFor();
    /* hysteresis everywhere: shadows used to pop on/off every time fps or zoom crossed a threshold (the flicker) */
    const perfOk = fpsAvg == null || fpsAvg > (shadowsOn ? 22 : 34);
    if (fpsAvg != null) ssaoBudget = ssaoOn ? fpsAvg > 46 : fpsAvg > 55;
    const aerial = altY > (shadowsOn ? 460 : 380);
    const rMax = (isAus ? 4200 : 2400) * (shadowsOn ? 1.15 : 1);
    const wantShadow = !aerial && radius < rMax && nightF < (shadowsOn ? 0.9 : 0.8) && perfOk;
    const wantSsao = !!ssaoPass && tier >= 2 && !aerial && radius < (isAus ? 1800 : 1600) && ssaoBudget && nightF < 0.9;

    /* ALWAYS aim the sun at the look-at — even when shadows are off */
    sun.target.position.set(tx, 0, tz);
    if (!sun.target.parent) scene.add(sun.target);

    if (wantShadow !== shadowsOn) {
      shadowsOn = wantShadow;
      sun.castShadow = shadowsOn;
      renderer.shadowMap.enabled = shadowsOn;
      if (shadowsOn) {
        _shTx = 1e9;
        renderer.shadowMap.needsUpdate = true;
      }
    }

    if (shadowsOn) {
      /* cover what the camera actually sees in oblique views, so there is no hard lit/unlit rectangle */
      const ext = Math.max(320, Math.min(isAus ? 1600 : 1400, radius * (isAus ? 0.85 : 0.8)));
      const sc = sun.shadow.camera;
      sc.left = -ext;
      sc.right = ext;
      sc.top = ext;
      sc.bottom = -ext;
      sc.far = Math.max(1200, radius * 2.2);
      sc.updateProjectionMatrix();
      const moved = Math.hypot(tx - _shTx, tz - _shTz) > 55 || Math.abs(radius - _shR) > 90;
      const now = performance.now();
      /* the sun keeps moving: refresh shadows every 2 s even when the camera is parked */
      if (moved || now - _shT > 2000) {
        _shT = now;
        _shTx = tx; _shTz = tz; _shR = radius;
        renderer.shadowMap.needsUpdate = true;
      }
    }

    ssaoOn = wantSsao;
    if (ssaoPass) {
      ssaoPass.enabled = ssaoOn;
      if (ssaoOn) ssaoPass.kernelRadius = isAus ? (radius < 400 ? 12 : 7) : radius < 400 ? 18 : 11;
    }

    const rain = clamp01((wx && wx.rain) || 0);
    const cloud = clamp01((wx && (wx.cLow != null ? Math.max(wx.cLow, (wx.cMid || 0) * 0.65) : wx.cloud)) || 0);
    applyLook(nightF, rain, cloud, 0.08);

    if (scene.environmentIntensity != null) {
      scene.environmentIntensity = isAus
        ? 0.02 + (1 - nightF) * 0.2
        : 0.04 + (1 - nightF) * 0.55;
    }
  }

  function syncSize() {
    if (!composer) return;
    const pr = renderer.getPixelRatio();
    renderer.getSize(_sz);
    if (_sz.x === _cw && _sz.y === _ch && pr === _cpr) return;
    _cw = _sz.x; _ch = _sz.y; _cpr = pr;
    composer.setPixelRatio(pr);
    composer.setSize(_sz.x, _sz.y);
    if (gradePass) gradePass.uniforms.uRes.value.set(_sz.x * pr, _sz.y * pr);
  }
  function resize() { syncSize(); }

  function runComposer(s, c, ssao) {
    syncSize();
    renderer.toneMapping = toneMap;
    renderPass.scene = s;
    renderPass.camera = c;
    if (ssaoPass) ssaoPass.enabled = !!ssao;
    if (gradePass) gradePass.uniforms.uTime.value = (performance.now() * 0.001) % 100;
    composer.render();
  }

  function render() {
    renderer.toneMapping = toneMap;
    if (useComposer && tierFor() >= 1) runComposer(scene, camera, ssaoOn);
    else renderer.render(scene, camera);
  }

  /**
   * Render another scene (globe, world cities) through the same glow chain.
   * @param {THREE.Scene} s @param {THREE.Camera} c
   * @param {{kind?:'globe'|'city'}} [o]
   */
  function renderScene(s, c, o) {
    if (!(useComposer && tierFor() >= 1)) { renderer.render(s, c); return; }
    const kind = (o && o.kind) || 'city';
    const bt = bloomPass.threshold, bs = bloomPass.strength, br = bloomPass.radius;
    if (kind === 'globe') { bloomPass.threshold = 0.82; bloomPass.strength = 0.6; bloomPass.radius = 0.55; }
    else { bloomPass.threshold = 1.15; bloomPass.strength = 0.38; bloomPass.radius = 0.45; }
    try { runComposer(s, c, false); }
    finally {
      bloomPass.threshold = bt; bloomPass.strength = bs; bloomPass.radius = br;
      renderPass.scene = scene; renderPass.camera = camera;
    }
  }

  applyLook(0, 0, 0, 1);
  if (gradePass) gradePass.uniforms.uRes.value.set(_cw * _cpr, _ch * _cpr);
  window.HTS_FX = { renderScene, setMode, get mode() { return mode; }, get tier() { return TIER_NAMES[tierFor()]; } };
  console.log('%cCinematic render v2 · HDR bloom + grade' + (ssaoPass ? ' + SSAO' : '') + (reversedZ ? ' · reversed-Z' : '')
    + ' · ' + mode + ' (' + TIER_NAMES[tierFor()] + ')' + (weakGpu ? ' · light GPU mode for ' + gpuName.replace(/^ANGLE \(|\)$/g, '').slice(0, 60) : '') + ' · Shift+G to change', 'color:#7fd6a0');

  return {
    enabled: true,
    envMap,
    markShadowCasters,
    update,
    resize,
    render,
    renderScene,
    setMode,
    get tier() { return TIER_NAMES[tierFor()]; },
  };
}

/**
 * F4 Map–style clay materials (legacy). OSM buildings now use windowed façades
 * in osm-city.js — kept so old imports don’t break.
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
