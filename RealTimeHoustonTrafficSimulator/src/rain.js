/**
 * Hyper-realistic Houston rain — wind-slanted streaks, pavement splashes,
 * underpass puddles, visibility fog, wet asphalt. Wired from app.html.
 */

export function createRainSystem(deps) {
  const {
    THREE,
    scene,
    roadMats,
    getUnderpasses,
    rand,
    lerp,
    clamp,
    getLiveWx,
    getWxBlend,
    getCam,
  } = deps;

  const RAIN_N = 1900;
  const SPLASH_N = 40;
  const PUDDLE_N = 24;

  const rainGeo = new THREE.BufferGeometry();
  const rainPos = new Float32Array(RAIN_N * 2 * 3);
  const rainDrop = new Float32Array(RAIN_N * 3);
  for (let i = 0; i < RAIN_N; i++) {
    rainDrop[i * 3] = (rand() - 0.5) * 1500;
    rainDrop[i * 3 + 1] = rand() * 620;
    rainDrop[i * 3 + 2] = (rand() - 0.5) * 1500;
  }
  rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));
  const rain = new THREE.LineSegments(
    rainGeo,
    new THREE.LineBasicMaterial({
      color: 0xb8d4ea,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      fog: true,
    }),
  );
  scene.add(rain);

  const splashTex = (() => {
    const c = document.createElement('canvas');
    c.width = 64;
    c.height = 64;
    const x = c.getContext('2d');
    const g = x.createRadialGradient(32, 32, 2, 32, 32, 30);
    g.addColorStop(0, 'rgba(200,230,255,.85)');
    g.addColorStop(0.45, 'rgba(160,200,240,.35)');
    g.addColorStop(1, 'rgba(140,180,220,0)');
    x.fillStyle = g;
    x.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  })();

  const splashGeo = new THREE.PlaneGeometry(1, 1);
  splashGeo.rotateX(-Math.PI / 2);
  const splashMat = new THREE.MeshBasicMaterial({
    map: splashTex,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    fog: true,
  });
  const splashes = new THREE.InstancedMesh(splashGeo, splashMat, SPLASH_N);
  splashes.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  splashes.count = 0;
  scene.add(splashes);

  const dummy = new THREE.Object3D();
  const splashLife = new Float32Array(SPLASH_N);
  const splashPos = new Float32Array(SPLASH_N * 3);
  const splashScale = new Float32Array(SPLASH_N);
  for (let i = 0; i < SPLASH_N; i++) splashLife[i] = 0;

  const puddleGrp = new THREE.Group();
  scene.add(puddleGrp);
  const puddleMeshes = [];
  let puddlesBuilt = false;

  let cumRain = 0;
  let wetLevel = 0;
  let dryTimer = 0;

  function buildPuddles() {
    if (puddlesBuilt) return;
    const ups = (getUnderpasses && getUnderpasses()) || [];
    const picks = ups.slice(0, PUDDLE_N);
    for (const up of picks) {
      const r = 9 + rand() * 14;
      const geo = new THREE.CircleGeometry(r, 20);
      geo.rotateX(-Math.PI / 2);
      const mat = new THREE.MeshLambertMaterial({
        color: 0x1a2228,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        emissive: 0x0a1824,
        emissiveIntensity: 0,
      });
      const m = new THREE.Mesh(geo, mat);
      m.position.set(0, 0, 0);
      m.userData.offX = up.x;
      m.userData.offZ = up.z;
      m.userData.baseY = (up.py != null ? up.py : 0.52) + 0.04;
      puddleGrp.add(m);
      puddleMeshes.push(m);
    }
    puddlesBuilt = true;
  }

  function spawnSplash(x, z, intensity) {
    let slot = -1;
    let oldest = 1e9;
    for (let i = 0; i < SPLASH_N; i++) {
      if (splashLife[i] <= 0) {
        slot = i;
        break;
      }
      if (splashLife[i] < oldest) {
        oldest = splashLife[i];
        slot = i;
      }
    }
    if (slot < 0) return;
    const sz = lerp(2.5, 7.5, intensity) * (0.7 + rand() * 0.6);
    splashPos[slot * 3] = x;
    splashPos[slot * 3 + 1] = 0.58 + rand() * 0.35;
    splashPos[slot * 3 + 2] = z;
    splashScale[slot] = sz;
    splashLife[slot] = lerp(0.14, 0.32, intensity);
  }

  function applyWetRoadMaterials(wet, nightF) {
    if (!roadMats) return;
    for (const m of roadMats) {
      if (!m.userData._baseEm) m.userData._baseEm = m.emissive ? m.emissive.getHex() : 0x232529;
      if (!m.userData._baseEmI) m.userData._baseEmI = m.emissiveIntensity || 0;
      const w = clamp(wet, 0, 1);
      m.color.setScalar(1 - 0.32 * w);
      if (m.emissive) {
        m.emissive.setHex(w > 0.12 ? 0x1a2838 : m.userData._baseEm);
        m.emissiveIntensity = m.userData._baseEmI + w * 0.38 + nightF * 0.18;
      }
    }
  }

  function applyVisibilityFog(sceneFog, wxBlend, liveWx, baseFar, nightF, rainF) {
    const visMi = liveWx && liveWx.vis != null ? liveWx.vis : 10;
    const visK = clamp(visMi / 10, 0.28, 1);
    const murk = visMi < 3 ? clamp((3 - visMi) / 3, 0, 0.55) : 0;
    const far =
      baseFar *
      lerp(1, 0.82, rainF) *
      visK *
      (1 - murk * 0.45) *
      lerp(1, 1.05, nightF);
    sceneFog.far = lerp(sceneFog.far, far, 0.06);
    sceneFog.near = sceneFog.far * lerp(0.08, 0.12, nightF);
  }

  function update(dt, nightF, wxBlend, rainWindX, rainWindZ, liveWx) {
    buildPuddles();
    const rainF = clamp(wxBlend?.rain || 0, 0, 1);
    /* Prefer blended rain so time-lapse forecast drives streaks — live precip only fills when blend is dry */
    const precip = rainF > 0.015 ? rainF * 5 : (liveWx?.precip != null ? liveWx.precip : 0);
    const active = rainF > 0.02 || precip > 0.05;

    if (active) {
      cumRain = clamp(cumRain + dt * (0.15 + precip * 0.08), 0, 120);
      wetLevel = clamp(wetLevel + dt * (0.25 + rainF * 0.55), 0, 1);
      dryTimer = 0;
    } else {
      dryTimer += dt;
      if (dryTimer > 2) wetLevel = clamp(wetLevel - dt / 120, 0, 1);
    }

    const wet = clamp(wetLevel * lerp(1, 1.25, rainF), 0, 1);
    if (Math.abs(wet - (applyWetRoadMaterials._last || -1)) > 0.02 || rainF > 0.02) {
      applyWetRoadMaterials(wet, nightF);
      applyWetRoadMaterials._last = wet;
    }

    rain.material.opacity = active
      ? rainF * lerp(0.35, 0.88, clamp(precip / 6, 0, 1))
      : 0;

    const cam = getCam();
    if (active && cam) {
      rain.position.set(cam.target.x, 0, cam.target.z);
      const p = rainGeo.getAttribute('position');
      const fallSpd = 220 + 240 * rainF + precip * 8;
      const fall = dt * fallSpd;
      const slantX = rainWindX + (liveWx?.wind ? Math.sin(((liveWx.windDir || 0) + 180) * Math.PI / 180) * 0.02 * liveWx.wind : 0);
      const slantZ = rainWindZ + (liveWx?.wind ? Math.cos(((liveWx.windDir || 0) + 180) * Math.PI / 180) * 0.02 * liveWx.wind : 0);
      const streakLen = lerp(0.2, 2.5, rainF) * lerp(12, 4, rainF);
      const splashRate = clamp(precip * rainF * 0.35, 0, 1);
      /* Light rain / low FPS: update a subset of streaks each frame */
      const stride = rainF < 0.12 ? 3 : rainF < 0.35 ? 2 : 1;
      const start = (update._tick = ((update._tick || 0) + 1) % stride);

      for (let i = start; i < RAIN_N; i += stride) {
        let y = rainDrop[i * 3 + 1] - fall;
        let x = rainDrop[i * 3] + slantX * fall;
        let z = rainDrop[i * 3 + 2] + slantZ * fall;
        if (y < 2.2) {
          if (y < 1.1 && rand() < splashRate) spawnSplash(x, z, rainF);
          y = 480 + rand() * 200;
          x = cam.target.x + (rand() - 0.5) * 1500;
          z = cam.target.z + (rand() - 0.5) * 1500;
        }
        rainDrop[i * 3] = x;
        rainDrop[i * 3 + 1] = y;
        rainDrop[i * 3 + 2] = z;
        const ang = Math.atan2(slantX, fallSpd * 0.004 + 0.08);
        const dx = Math.sin(ang) * streakLen;
        const dz = Math.cos(ang) * streakLen * 0.35;
        p.setXYZ(i * 2, x, y, z);
        p.setXYZ(i * 2 + 1, x - dx - slantX * streakLen * 1.4, y + streakLen, z - dz - slantZ * streakLen * 1.4);
      }
      p.needsUpdate = true;
    } else if (!active && rain.material.opacity > 0.001) {
      rain.material.opacity = 0;
    }

    let splashCount = 0;
    for (let i = 0; i < SPLASH_N; i++) {
      if (splashLife[i] <= 0) continue;
      splashLife[i] -= dt;
      splashCount++;
      const life = splashLife[i];
      const grow = 1 + (0.28 - life) * 3.5;
      dummy.position.set(
        splashPos[i * 3],
        splashPos[i * 3 + 1] + (0.28 - life) * 0.15,
        splashPos[i * 3 + 2],
      );
      const s = splashScale[i] * grow;
      dummy.scale.set(s, s, 1);
      dummy.updateMatrix();
      splashes.setMatrixAt(i, dummy.matrix);
    }
    splashes.count = splashCount;
    splashes.instanceMatrix.needsUpdate = splashCount > 0;
    splashMat.opacity = rainF > 0.05 ? lerp(0.25, 0.7, rainF) : 0;

    const puddleWet = clamp(cumRain / 45, 0, 1) * wet;
    for (const m of puddleMeshes) {
      m.material.opacity = puddleWet * lerp(0.12, 0.42, rainF);
      m.material.emissiveIntensity = puddleWet * lerp(0.05, 0.35, rainF);
      m.scale.setScalar(0.85 + puddleWet * 0.35);
    }
    puddleGrp.visible = puddleWet > 0.02;
    if (cam) {
      for (const m of puddleMeshes) {
        m.position.set(
          m.userData.offX - cam.target.x,
          m.userData.baseY,
          m.userData.offZ - cam.target.z,
        );
      }
    }
  }

  function updateFog(sceneFog, wxBlend, liveWx, baseFar, nightF) {
    const rainF = clamp(wxBlend?.rain || 0, 0, 1);
    applyVisibilityFog(sceneFog, wxBlend, liveWx, baseFar, nightF, rainF);
  }

  return { update, updateFog, rain };
}
