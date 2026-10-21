/**
 * Seasonal night-sky celebrations: Christmas-light strands across the sky, a glowing greeting and
 * fireworks with synthesized sound (Web Audio, no files). Auto mode runs on Jan 1 (New Year),
 * Dec 9 (Ejay's birthday) and Dec 25 (Christmas) after dark; On previews now; Off disables.
 */
import * as THREE from 'three';

const KEY = 'hts.celebrate.v1';
export const EVENTS = [
  { id: 'newyear', name: 'New Year', m: 1, d: 1, msg: 'Happy New Year from Ejay Gabriel', pal: [0xffd25a, 0xff4d6d, 0x4dd2ff, 0x7dff7a, 0xffffff, 0xc77dff] },
  { id: 'birthday', name: "Ejay's birthday", m: 12, d: 9, msg: 'Happy Birthday Ejay Gabriel', pal: [0xff6ec7, 0xffd25a, 0x9b7dff, 0x5ae0ff, 0xffffff] },
  { id: 'christmas', name: 'Christmas', m: 12, d: 25, msg: 'Merry Christmas', pal: [0xff3030, 0x30ff60, 0xffd700, 0xffffff, 0x40a0ff] },
];

export function eventFor(date) {
  const m = date.getMonth() + 1, d = date.getDate();
  if (m === 12 && d === 31 && date.getHours() >= 22) return EVENTS[0];
  return EVENTS.find((e) => e.m === m && e.d === d) || null;
}

function nextEvent(now) {
  let best = null;
  for (const e of EVENTS) {
    let t = new Date(now.getFullYear(), e.m - 1, e.d);
    if (t < new Date(now.getFullYear(), now.getMonth(), now.getDate())) t = new Date(now.getFullYear() + 1, e.m - 1, e.d);
    const days = Math.round((t - new Date(now.getFullYear(), now.getMonth(), now.getDate())) / 864e5);
    if (!best || days < best.days) best = { e, days };
  }
  return best;
}

function loadCfg() {
  try { return { mode: 'auto', msg: '', sound: true, ...JSON.parse(localStorage.getItem(KEY) || '{}') }; } catch (e) { return { mode: 'auto', msg: '', sound: true }; }
}

function glowTex() {
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const g = c.getContext('2d'), r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.25, 'rgba(255,255,255,0.85)'); r.addColorStop(0.6, 'rgba(255,255,255,0.18)'); r.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = r; g.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

function textTex(msg) {
  const c = document.createElement('canvas'); c.width = 2048; c.height = 384;
  const g = c.getContext('2d');
  let fs = 170; g.font = `800 ${fs}px Georgia, 'Times New Roman', serif`;
  while (g.measureText(msg).width > 1900 && fs > 60) { fs -= 8; g.font = `800 ${fs}px Georgia, 'Times New Roman', serif`; }
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.shadowColor = 'rgba(255,190,80,0.95)'; g.shadowBlur = 48;
  const gr = g.createLinearGradient(0, 100, 0, 290); gr.addColorStop(0, '#fff6d8'); gr.addColorStop(0.5, '#ffd25a'); gr.addColorStop(1, '#ff9a3c');
  g.fillStyle = gr; g.fillText(msg, 1024, 196); g.shadowBlur = 16; g.fillText(msg, 1024, 196);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

const _gv = new THREE.Vector3();
export function createCelebrations({ scene, camera, u = 1 }) {
  const cfg = loadCfg();
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(cfg)); } catch (e) { /* ignore */ } };
  const root = new THREE.Group(); root.name = 'celebrations'; root.visible = false; scene.add(root);
  const glow = glowTex();
  let built = false, lights, lightCol, lightBase, lightPhase, sprite, spriteMsg = '', fw, fwPos, fwCol, fwSize, fwSeed, fwBase;
  const MAXP = 16000, vel = new Float32Array(MAXP * 3), life = new Float32Array(MAXP), life0 = new Float32Array(MAXP), age = new Float32Array(MAXP);
  /* 0 dead, 1 rocket, 2 star, 3 trail spark, 4 crackling star, 5 crossette star, 6 crackle flash */
  const kind = new Uint8Array(MAXP), dragK = new Float32Array(MAXP), grav = new Float32Array(MAXP);
  const trailT = new Float32Array(MAXP), trailR = new Float32Array(MAXP), sz0 = new Float32Array(MAXP);
  const rocketInfo = new Map(), flashes = [];
  let hwm = 0, seedDirty = false;
  let nextP = 0, launchT = 0, twT = 0, ev = null, alpha = 0;
  const tmpC = new THREE.Color();

  function build() {
    built = true;
    /* light strands hung across the sky dome (camera-centred, so they stay overhead while you move) */
    const pts = [], cols = [];
    const R = 2600 * u, N = 16, B = 70;
    for (let s = 0; s < N; s++) {
      const a0 = (s / N) * Math.PI * 2, a1 = a0 + Math.PI * (0.55 + 0.25 * Math.sin(s * 2.3));
      const e0 = 0.1 + 0.05 * (s % 3), e1 = 0.12 + 0.06 * ((s + 1) % 3);
      for (let i = 0; i < B; i++) {
        const t = i / (B - 1), az = a0 + (a1 - a0) * t;
        const el = e0 + (e1 - e0) * t + 0.38 * Math.sin(Math.PI * t) - 0.06 * Math.sin(Math.PI * t * 2) ** 2;
        pts.push(Math.sin(az) * Math.cos(el) * R, Math.sin(el) * R, Math.cos(az) * Math.cos(el) * R);
        cols.push(1, 1, 1);
      }
    }
    const lg = new THREE.BufferGeometry();
    lg.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    lightCol = new THREE.Float32BufferAttribute(cols, 3); lg.setAttribute('color', lightCol);
    lightBase = new Float32Array(cols.length); lightPhase = new Float32Array(cols.length / 3).map(() => Math.random() * 6.28);
    lights = new THREE.Points(lg, new THREE.PointsMaterial({ size: 9, sizeAttenuation: false, map: glow, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
    lights.frustumCulled = false; lights.renderOrder = 5; root.add(lights);
    sprite = new THREE.Sprite(new THREE.SpriteMaterial({ transparent: true, depthWrite: false, fog: false, blending: THREE.AdditiveBlending }));
    sprite.renderOrder = 6; root.add(sprite);
    const fg = new THREE.BufferGeometry();
    const dyn = (n) => { const b = new THREE.BufferAttribute(new Float32Array(MAXP * n), n); b.setUsage(THREE.DynamicDrawUsage); return b; };
    fwPos = dyn(3); fwPos.array.fill(-1e7); fwCol = dyn(3); fwSize = dyn(1); fwSeed = dyn(1);
    fwBase = new Float32Array(MAXP * 3);
    fg.setAttribute('position', fwPos); fg.setAttribute('tint', fwCol); fg.setAttribute('size', fwSize); fg.setAttribute('seed', fwSeed);
    /* soft round sparks: hot white core + coloured halo, sized in metres, optional glitter twinkle (seed > 0) */
    fw = new THREE.Points(fg, new THREE.ShaderMaterial({
      uniforms: { uScale: { value: 400 }, uTime: { value: 0 } },
      vertexShader: `attribute vec3 tint; attribute float size; attribute float seed;
        uniform float uScale; varying vec3 vC; varying float vS;
        #include <common>
        #include <logdepthbuf_pars_vertex>
        void main() {
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = clamp(size * uScale / max(1.0, -mv.z), 1.5, 64.0);
          vC = tint; vS = seed;
          #include <logdepthbuf_vertex>
        }`,
      fragmentShader: `uniform float uTime; varying vec3 vC; varying float vS;
        #include <common>
        #include <logdepthbuf_pars_fragment>
        void main() {
          #include <logdepthbuf_fragment>
          vec2 p = gl_PointCoord * 2.0 - 1.0; float r = dot(p, p); if (r > 1.0) discard;
          float core = exp(-r * 10.0), halo = exp(-r * 3.0) * (1.0 - r);
          float tw = vS > 0.0 ? 0.3 + 0.7 * pow(0.5 + 0.5 * sin(uTime * (14.0 + vS * 24.0) + vS * 97.0), 2.0) : 1.0;
          vec3 c = vC * (core * 1.15 + halo * 0.5) + vec3(core * 0.3) * max(vC.r, max(vC.g, vC.b));
          gl_FragColor = vec4(c * tw, 1.0);
        }`,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    }));
    fw.frustumCulled = false; fw.renderOrder = 7; scene.add(fw);
  }

  function paint(e) {
    const pal = e.pal.map((h) => new THREE.Color(h));
    for (let i = 0; i < lightBase.length / 3; i++) { const c = pal[i % pal.length]; lightBase[3 * i] = c.r; lightBase[3 * i + 1] = c.g; lightBase[3 * i + 2] = c.b; }
  }

  /* ---------- sound (Web Audio, synthesized) ---------- */
  let ctx = null, master = null, noise = null;
  const unlock = () => { try { if (ctx && ctx.state === 'suspended') ctx.resume(); } catch (e) { /* ignore */ } };
  addEventListener('pointerdown', unlock, { passive: true }); addEventListener('keydown', unlock);
  function audio() {
    if (!cfg.sound || document.visibilityState !== 'visible') return null;
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null;
      ctx = new AC(); master = ctx.createGain(); master.gain.value = 0.55; master.connect(ctx.destination);
      noise = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
      const d = noise.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    return ctx.state === 'running' ? ctx : null;
  }
  function burstNoise(t, dur, type, freq, vol, attack = 0.004) {
    const s = ctx.createBufferSource(); s.buffer = noise; s.playbackRate.value = 0.7 + Math.random() * 0.6;
    const f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq;
    const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + attack); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(master); s.start(t, Math.random()); s.stop(t + dur + 0.05);
  }
  function soundBurst(distM, big, crackle = 0) {
    const a = audio(); if (!a) return;
    const t = a.currentTime + Math.min(6, distM / 343), v = Math.max(0.12, Math.min(1, 1500 / distM)) * (big ? 1 : 0.75);
    burstNoise(t, 1.6, 'lowpass', 380, 0.9 * v);
    const o = a.createOscillator(), g = a.createGain(); o.frequency.setValueAtTime(70, t); o.frequency.exponentialRampToValueAtTime(32, t + 0.8);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.7 * v, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.9);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + 1);
    if (crackle) for (let i = 0; i < 44; i++) burstNoise(t + crackle + Math.random() * 0.5, 0.03 + Math.random() * 0.03, 'highpass', 2800, 0.28 * v, 0.002);
  }
  function soundLaunch(distM) {
    const a = audio(); if (!a || Math.random() > 0.4) return;
    const t = a.currentTime + Math.min(6, distM / 343), v = Math.max(0.05, Math.min(0.35, 600 / distM));
    const o = a.createOscillator(), g = a.createGain(); o.type = 'sine';
    o.frequency.setValueAtTime(900, t); o.frequency.exponentialRampToValueAtTime(2600, t + 1.4);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.06 * v * 3, t + 0.2); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.5);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + 1.6);
  }

  /* ---------- fireworks ----------
     Rockets climb with a sparking tail and burst at 320-700 m into one of several real shell types (peony, chrysanthemum,
     willow, ring, crackle, strobe, crossette, palm). Stars are born white-hot, cool to their colour, slow under air drag,
     sag under gravity and fade out; trails and glitter are separate short-lived sparks. */
  const rnd = (a, b) => a + Math.random() * (b - a);
  const GOLD = new THREE.Color(1, 0.62, 0.22), SILVER = new THREE.Color(0.85, 0.9, 1), WHITE = new THREE.Color(1, 0.96, 0.88);
  const tmpC2 = new THREE.Color(), _a = new THREE.Vector3(), _b = new THREE.Vector3(), _n = new THREE.Vector3();
  function spawn(x, y, z, vx, vy, vz, l, c, k, size, drag = 0, g = 1, trail = 0, tw = 0) {
    const i = nextP; nextP = (nextP + 1) % MAXP; if (i + 1 > hwm) hwm = i + 1;
    rocketInfo.delete(i);
    const P = fwPos.array; P[3 * i] = x; P[3 * i + 1] = y; P[3 * i + 2] = z;
    vel[3 * i] = vx; vel[3 * i + 1] = vy; vel[3 * i + 2] = vz; life[i] = life0[i] = l; age[i] = 0; kind[i] = k;
    dragK[i] = drag; grav[i] = g; trailR[i] = trail; trailT[i] = trail ? Math.random() / trail : 0; sz0[i] = size * 1.3;
    const sd = tw ? 0.2 + Math.random() : 0; if (fwSeed.array[i] !== sd) { fwSeed.array[i] = sd; seedDirty = true; }
    fwBase[3 * i] = c.r; fwBase[3 * i + 1] = c.g; fwBase[3 * i + 2] = c.b;
    return i;
  }
  function flash(x, y, z, c, s, a) {
    let f = flashes.find((q) => !q.visible);
    if (!f) {
      if (flashes.length >= 8) return;
      f = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
      f.renderOrder = 7; scene.add(f); flashes.push(f);
    }
    f.visible = true; f.position.set(x, y, z); f.material.color.copy(c).lerp(WHITE, 0.6); f.userData = { t: 0, s, a };
    f.material.opacity = a; f.scale.setScalar(s * 0.6);
  }
  function launch(spread = 2.4) {
    const fwd = new THREE.Vector3(); camera.getWorldDirection(fwd); fwd.y = 0; if (fwd.lengthSq() < 1e-6) fwd.set(0, 0, -1); fwd.normalize();
    const yaw = Math.atan2(fwd.x, fwd.z) + (Math.random() - 0.5) * spread, dist = rnd(1100, 2600) * u;
    const x = camera.position.x + Math.sin(yaw) * dist, z = camera.position.z + Math.cos(yaw) * dist;
    const h = rnd(320, 700) * u, T = rnd(1.6, 2.4);
    const i = spawn(x, 0, z, rnd(-3, 3) * u, h / T + 4.9 * u * T, rnd(-3, 3) * u, T, GOLD, 1, 30 * u, 0, 1, 60);
    rocketInfo.set(i, { big: Math.random() < 0.35 });
    soundLaunch(dist / u);
  }
  function emitTrail(i) {
    const j = 3 * i, P = fwPos.array, rocket = kind[i] === 1;
    const c = rocket ? GOLD : tmpC.setRGB(fwBase[j], fwBase[j + 1], fwBase[j + 2]).lerp(GOLD, 0.65);
    const l = rocket ? rnd(0.3, 0.6) : rnd(0.7, 1.1) * (0.25 * life0[i] + 0.3);
    spawn(P[j] + rnd(-1, 1) * u, P[j + 1], P[j + 2] + rnd(-1, 1) * u,
      vel[j] * 0.08 + rnd(-2, 2) * u, vel[j + 1] * 0.08 + rnd(-2, 1) * u, vel[j + 2] * 0.08 + rnd(-2, 2) * u,
      l, c, 3, (rocket ? 20 : 22) * u, 2, 0.25, 0, Math.random() < 0.25 ? 1 : 0);
  }
  const TYPES = [['peony', 26], ['chrys', 18], ['willow', 14], ['ring', 10], ['crackle', 12], ['strobe', 10], ['crossette', 6], ['palm', 4]];
  const TWT = TYPES.reduce((a, t) => a + t[1], 0);
  function pickType() { let r = Math.random() * TWT; for (const t of TYPES) if ((r -= t[1]) < 0) return t[0]; return 'peony'; }
  /* evenly spread directions (Fibonacci sphere): real shells break as a clean round sphere */
  function sphere(n, cb) { const rot = Math.random() * 6.283; for (let k = 0; k < n; k++) { const y = 1 - (2 * (k + 0.5)) / n, r = Math.sqrt(1 - y * y), th = k * 2.399963 + rot; cb(Math.cos(th) * r, y, Math.sin(th) * r, k); } }
  function burst(i) {
    const P = fwPos.array, x = P[3 * i], y = P[3 * i + 1], z = P[3 * i + 2];
    const info = rocketInfo.get(i) || {}; rocketInfo.delete(i);
    const pal = ev.pal, c1 = new THREE.Color(pal[(Math.random() * pal.length) | 0]), c2 = new THREE.Color(pal[(Math.random() * pal.length) | 0]);
    const big = !!info.big, S = (big ? 1.25 : 1) * u, N = big ? 1.4 : 1, jit = () => 1 + (Math.random() - 0.5) * 0.08;
    const star = (dx, dy, dz, sp, l, c, k, size, drag, g, trail = 0, tw = 0) => spawn(x, y, z, dx * sp * 1.55, dy * sp * 1.55, dz * sp * 1.55, l, c, k, size, drag, g, trail, tw);
    let crackle = 0, fc = c1;
    switch (pickType()) {
      case 'peony':
        sphere((150 * N) | 0, (dx, dy, dz, k) => star(dx, dy, dz, 120 * S * jit(), rnd(2, 2.8), k % 4 ? c1 : c2, 2, 40 * u, 1.4, 0.4, 6));
        if (Math.random() < 0.35) sphere((60 * N) | 0, (dx, dy, dz) => star(dx, dy, dz, 50 * S * jit(), rnd(1.6, 2.2), c2, 2, 36 * u, 1.4, 0.4));
        break;
      case 'chrys':
        sphere((120 * N) | 0, (dx, dy, dz) => star(dx, dy, dz, 120 * S * jit(), rnd(1.8, 2.4), c1, 2, 38 * u, 1.4, 0.4, 14));
        break;
      case 'willow':
        fc = GOLD;
        sphere((100 * N) | 0, (dx, dy, dz) => star(dx, dy, dz, 105 * S * jit(), rnd(3.6, 4.6), GOLD, 2, 34 * u, 2.3, 0.75, 12));
        break;
      case 'ring': {
        _n.set(rnd(-1, 1), rnd(0.3, 1.5), rnd(-1, 1)).normalize(); _a.set(1, 0, 0).cross(_n).normalize(); _b.crossVectors(_n, _a);
        const n = (110 * N) | 0;
        for (let k = 0; k < n; k++) { const t = (k / n) * 6.283, ca = Math.cos(t), sa = Math.sin(t); star(_a.x * ca + _b.x * sa, _a.y * ca + _b.y * sa, _a.z * ca + _b.z * sa, 115 * S * jit(), rnd(2, 2.6), c1, 2, 40 * u, 1.4, 0.4); }
        sphere(40, (dx, dy, dz) => star(dx, dy, dz, 35 * S * jit(), rnd(1.4, 1.9), c2, 2, 34 * u, 1.4, 0.4));
        break;
      }
      case 'crackle':
        fc = GOLD; crackle = 1.1;
        sphere((110 * N) | 0, (dx, dy, dz) => star(dx, dy, dz, 110 * S * jit(), rnd(1.1, 1.5), GOLD, 4, 34 * u, 1.6, 0.4, 10));
        break;
      case 'strobe':
        fc = SILVER;
        sphere((140 * N) | 0, (dx, dy, dz) => star(dx, dy, dz, 110 * S * jit(), rnd(2.4, 3.2), SILVER, 2, 36 * u, 1.5, 0.35, 0, 1));
        break;
      case 'crossette':
        sphere(16, (dx, dy, dz) => star(dx, dy, dz, 140 * S * jit(), rnd(0.8, 1), c1, 5, 42 * u, 1, 0.3, 26));
        break;
      default: /* palm: a few thick gold comets */
        fc = GOLD;
        sphere(9, (dx, dy, dz) => star(dx, dy * 0.6 + 0.4, dz, 120 * S * jit(), rnd(2.2, 2.6), GOLD, 2, 60 * u, 1.2, 0.6, 30));
    }
    flash(x, y, z, fc, (big ? 340 : 260) * u, 0.9);
    const dCam = Math.hypot(x - camera.position.x, y - camera.position.y, z - camera.position.z) / u;
    soundBurst(dCam, big, crackle);
  }
  function crackleAt(i) {
    const P = fwPos.array, x = P[3 * i], y = P[3 * i + 1], z = P[3 * i + 2];
    for (let m = 0; m < 3; m++) spawn(x + rnd(-4, 4) * u, y + rnd(-4, 4) * u, z + rnd(-4, 4) * u, 0, 0, 0, rnd(0.04, 0.11), WHITE, 6, 30 * u, 0, 0);
  }
  function split(i) {
    const j = 3 * i, P = fwPos.array, x = P[j], y = P[j + 1], z = P[j + 2];
    _n.set(vel[j], vel[j + 1], vel[j + 2]); if (_n.lengthSq() < 1e-9) _n.set(0, 1, 0); _n.normalize();
    _a.set(0, 1, 0).cross(_n); if (_a.lengthSq() < 1e-6) _a.set(1, 0, 0); _a.normalize(); _b.crossVectors(_n, _a);
    const c = tmpC2.setRGB(fwBase[j], fwBase[j + 1], fwBase[j + 2]), sp = 100 * u;
    for (let m = 0; m < 4; m++) {
      const s1 = m < 2 ? (m ? -1 : 1) : 0, s2 = m < 2 ? 0 : (m === 3 ? -1 : 1);
      spawn(x, y, z, (_a.x * s1 + _b.x * s2 + _n.x * 0.3) * sp, (_a.y * s1 + _b.y * s2 + _n.y * 0.3) * sp, (_a.z * s1 + _b.z * s2 + _n.z * 0.3) * sp,
        rnd(0.9, 1.3), c, 2, 34 * u, 1.6, 0.4, 20);
    }
    flash(x, y, z, c, 60 * u, 0.5);
  }

  function activeEvent(nightF) {
    if (cfg.mode === 'off') return null;
    const now = new Date();
    if (cfg.mode === 'on') return eventFor(now) || EVENTS[0];
    return nightF > 0.3 ? eventFor(now) : null;
  }

  function update(dt, nightF) {
    dt = Math.min(0.1, Math.max(0, dt || 0));
    const e = activeEvent(nightF);
    alpha += ((e ? 1 : 0) - alpha) * Math.min(1, dt * 1.5);
    if (e) ev = e;
    if (!ev || alpha < 0.01) { root.visible = false; if (fw) fw.visible = false; for (const f of flashes) f.visible = false; return; }
    if (!built) build();
    root.visible = true; fw.visible = true;
    root.position.copy(camera.position);
    const msg = (cfg.msg || '').trim() || ev.msg;
    if (msg !== spriteMsg || lights.userData.ev !== ev.id) {
      spriteMsg = msg; if (sprite.material.map) sprite.material.map.dispose();
      sprite.material.map = textTex(msg); sprite.material.needsUpdate = true; paint(ev); lights.userData.ev = ev.id;
    }
    /* greeting floats ahead of the view, ~20° up */
    const fwd = new THREE.Vector3(); camera.getWorldDirection(fwd); fwd.y = 0; if (fwd.lengthSq() < 1e-6) fwd.set(0, 0, -1); fwd.normalize();
    const D = 2200 * u; sprite.scale.set(1500 * u, 281 * u, 1);
    /* keep it below the compass / location pill at the top of the screen, whatever the camera pitch */
    _gv.set(camera.position.x + fwd.x * D, camera.position.y + D * 0.36, camera.position.z + fwd.z * D).project(camera);
    const ny = _gv.z < 1 ? Math.max(0.1, Math.min(0.34, _gv.y)) : 0.34;
    _gv.set(0, ny, 0.5).unproject(camera).sub(camera.position).normalize().multiplyScalar(D);
    sprite.position.copy(_gv);
    sprite.material.opacity = alpha * (0.85 + 0.15 * Math.sin(performance.now() / 600));
    if ((twT -= dt) <= 0) {
      twT = 0.08; const t = performance.now() / 1000, a = lightCol.array;
      for (let i = 0; i < lightPhase.length; i++) {
        const tw = alpha * (0.55 + 0.45 * Math.sin(t * 2.2 + lightPhase[i]) ** 2);
        a[3 * i] = lightBase[3 * i] * tw; a[3 * i + 1] = lightBase[3 * i + 1] * tw; a[3 * i + 2] = lightBase[3 * i + 2] * tw;
      }
      lightCol.needsUpdate = true;
    }
    const d = Math.min(dt, 0.05);
    if (e && (launchT -= d) <= 0) {
      launchT = rnd(0.5, 1.4);
      if (Math.random() < 0.06) { const m = 4 + ((Math.random() * 4) | 0); for (let k = 0; k < m; k++) launch(1.4); launchT = 2.6; } /* salvo */
      else { launch(); if (Math.random() < 0.18) launch(); }
    }
    const P = fwPos.array, C = fwCol.array, Z = fwSize.array, g = 9.8 * u;
    for (let i = 0; i < hwm; i++) {
      const k = kind[i]; if (!k) continue;
      const j = 3 * i;
      life[i] -= d; age[i] += d;
      if (life[i] <= 0) {
        kind[i] = 0; C[j] = C[j + 1] = C[j + 2] = 0; Z[i] = 0;
        if (k === 1) burst(i); else if (k === 4) crackleAt(i); else if (k === 5) split(i);
        if (!kind[i]) P[j + 1] = -1e7;
        continue;
      }
      if (dragK[i]) { const f = Math.exp(-dragK[i] * d); vel[j] *= f; vel[j + 1] *= f; vel[j + 2] *= f; }
      vel[j + 1] -= g * grav[i] * d;
      P[j] += vel[j] * d; P[j + 1] += vel[j + 1] * d; P[j + 2] += vel[j + 2] * d;
      if (trailR[i]) { trailT[i] -= d; let m = 0; while (trailT[i] <= 0 && m++ < 4) { trailT[i] += 1 / trailR[i]; emitTrail(i); } }
      const lr = life[i] / life0[i];
      let b, h = 1, sz;
      if (k === 1) { b = 0.9 + 0.1 * Math.sin(age[i] * 40); sz = 1; }
      else if (k === 3) { b = Math.pow(lr, 1.2); sz = 0.5 + 0.5 * lr; }
      else if (k === 6) { b = 1.6; h = 0; sz = 1; }
      else { h = Math.min(1, age[i] / 0.12); b = (lr > 0.3 ? 1 : Math.pow(lr / 0.3, 1.5)) * (1.15 - 0.3 * h); sz = 0.55 + 0.45 * Math.min(1, lr * 1.5); }
      const w = 1 - h;
      C[j] = (fwBase[j] * h + WHITE.r * w) * b; C[j + 1] = (fwBase[j + 1] * h + WHITE.g * w) * b; C[j + 2] = (fwBase[j + 2] * h + WHITE.b * w) * b;
      Z[i] = sz0[i] * sz;
    }
    fw.geometry.setDrawRange(0, hwm);
    fwPos.needsUpdate = true; fwCol.needsUpdate = true; fwSize.needsUpdate = true;
    if (seedDirty) { fwSeed.needsUpdate = true; seedDirty = false; }
    fw.material.uniforms.uTime.value = performance.now() / 1000;
    fw.material.uniforms.uScale.value = (innerHeight * Math.min(2, devicePixelRatio || 1)) / 2;
    for (const f of flashes) {
      if (!f.visible) continue;
      const q = (f.userData.t += d) / 0.28;
      if (q >= 1) f.visible = false; else { f.material.opacity = (1 - q) ** 2 * f.userData.a; f.scale.setScalar(f.userData.s * (0.6 + 0.4 * q)); }
    }
  }

  function status() {
    const now = new Date(), today = eventFor(now);
    if (cfg.mode === 'off') return 'Off.';
    if (cfg.mode === 'on') return 'Showing ' + (today || EVENTS[0]).name + ' now.';
    if (today) return today.name + ' today: the sky lights up after dark.';
    const n = nextEvent(now);
    return 'Next: ' + n.e.name + ' in ' + n.days + (n.days === 1 ? ' day.' : ' days.');
  }

  function bindUI() {
    const mode = document.getElementById('celebMode'), msg = document.getElementById('celebMsg'), snd = document.getElementById('celebSound'), hint = document.getElementById('celebStatus');
    const refresh = () => { if (hint) hint.textContent = status(); };
    if (mode) { mode.value = cfg.mode; mode.addEventListener('change', () => { cfg.mode = mode.value; save(); refresh(); unlock(); }); }
    if (msg) { msg.value = cfg.msg; msg.addEventListener('input', () => { cfg.msg = msg.value.slice(0, 60); save(); }); }
    if (snd) { snd.checked = cfg.sound; snd.addEventListener('change', () => { cfg.sound = snd.checked; save(); }); }
    refresh(); setInterval(refresh, 60000);
  }

  return { update, bindUI, cfg, status };
}
