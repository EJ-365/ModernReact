/**
 * Houston road signage from the real OSM network (true scale, metres).
 * - Green freeway guide signs on cantilever posts at every exit (motorway_link leaving a
 *   motorway), reading "EXIT" + the named road the ramp leads to.
 * - Route shields (I-45, US-59 …) beside freeways about every 2.5 km.
 * - Green street-name blades on posts at intersections of named streets (from streamed tiles).
 * - MUTCD regulatory: STOP / YIELD / SPEED LIMIT at local intersections & arterials.
 * Signs are built lazily near the camera and capped, so they cost a few hundred draw calls at most.
 */
import * as THREE from 'three';

const texCache = new Map();
function signTex(lines, kind) {
  const key = kind + '|' + lines.join('|');
  let t = texCache.get(key);
  if (t) return t;
  const c = document.createElement('canvas');
  const W = kind === 'blade' ? 256 : kind === 'speed' ? 192 : 256;
  const H = kind === 'blade' ? 48 : kind === 'shield' ? 128 : kind === 'speed' ? 240 : (kind === 'stop' || kind === 'yield') ? 256 : 128;
  c.width = W; c.height = H;
  const g = c.getContext('2d');
  if (kind === 'shield') {
    const isI = /^I[- ]?\d/.test(lines[0]);
    g.fillStyle = isI ? '#1d4fa0' : '#ffffff'; g.fillRect(0, 0, W, H);
    if (isI) { g.fillStyle = '#c8202c'; g.fillRect(0, 0, W, 30); }
    g.strokeStyle = isI ? '#ffffff' : '#111'; g.lineWidth = 8; g.strokeRect(6, 6, W - 12, H - 12);
    g.fillStyle = isI ? '#ffffff' : '#111'; g.font = 'bold 64px Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(lines[0].replace(/^(I|US|SH|TX|FM|Beltway|BW)[- ]?/i, ''), W / 2, H / 2 + (isI ? 12 : 4), W - 30);
  } else if (kind === 'stop') {
    g.fillStyle = '#111'; g.beginPath();
    for (let i = 0; i < 8; i++) {
      const a = (i + 0.5) / 8 * Math.PI * 2 - Math.PI / 2, r = 118;
      const x = 128 + Math.cos(a) * r, y = 128 + Math.sin(a) * r;
      i ? g.lineTo(x, y) : g.moveTo(x, y);
    }
    g.closePath(); g.fill();
    g.fillStyle = '#c8202c'; g.beginPath();
    for (let i = 0; i < 8; i++) {
      const a = (i + 0.5) / 8 * Math.PI * 2 - Math.PI / 2, r = 108;
      const x = 128 + Math.cos(a) * r, y = 128 + Math.sin(a) * r;
      i ? g.lineTo(x, y) : g.moveTo(x, y);
    }
    g.closePath(); g.fill();
    g.fillStyle = '#fff'; g.font = 'bold 58px Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText('STOP', 128, 132);
  } else if (kind === 'yield') {
    g.fillStyle = '#c8202c'; g.beginPath(); g.moveTo(128, 236); g.lineTo(20, 28); g.lineTo(236, 28); g.closePath(); g.fill();
    g.fillStyle = '#fff'; g.beginPath(); g.moveTo(128, 210); g.lineTo(48, 48); g.lineTo(208, 48); g.closePath(); g.fill();
    g.fillStyle = '#c8202c'; g.font = 'bold 42px Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText('YIELD', 128, 100);
  } else if (kind === 'speed') {
    g.fillStyle = '#fff'; g.fillRect(0, 0, W, H);
    g.strokeStyle = '#111'; g.lineWidth = 14; g.strokeRect(10, 10, W - 20, H - 20);
    g.fillStyle = '#111'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = 'bold 28px Arial, sans-serif'; g.fillText('SPEED', W / 2, 48);
    g.font = 'bold 26px Arial, sans-serif'; g.fillText('LIMIT', W / 2, 78);
    g.font = 'bold 96px Arial, sans-serif'; g.fillText(String(lines[0] || '35'), W / 2, 155);
  } else {
    g.fillStyle = '#106b3a'; g.fillRect(0, 0, W, H);
    g.strokeStyle = '#f2f2ee'; g.lineWidth = kind === 'blade' ? 3 : 5; g.strokeRect(4, 4, W - 8, H - 8);
    g.fillStyle = '#f7f7f2'; g.textAlign = 'center'; g.textBaseline = 'middle';
    if (kind === 'blade') { g.font = 'bold 28px Arial, sans-serif'; g.fillText(lines[0], W / 2, H / 2 + 1, W - 16); }
    else {
      g.font = 'bold 22px Arial, sans-serif'; g.fillStyle = '#f2c230'; g.fillText(lines[0], W / 2, 24, W - 20);
      g.fillStyle = '#f7f7f2'; g.font = 'bold 34px Arial, sans-serif'; g.fillText(lines[1] || '', W / 2, 74, W - 20);
      if (lines[2]) { g.font = '20px Arial, sans-serif'; g.fillText(lines[2], W / 2, 108, W - 20); }
    }
  }
  t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  texCache.set(key, t);
  return t;
}

const nodeKey = (x, z) => `${Math.round(x * 0.5)},${Math.round(z * 0.5)}`;
const shortName = (n) => String(n || '').replace(/\bStreet\b/g, 'St').replace(/\bAvenue\b/g, 'Ave').replace(/\bBoulevard\b/g, 'Blvd').replace(/\bDrive\b/g, 'Dr').replace(/\bRoad\b/g, 'Rd').replace(/\bParkway\b/g, 'Pkwy').replace(/\bFreeway\b/g, 'Fwy').replace(/\bNorth\b/g, 'N').replace(/\bSouth\b/g, 'S').replace(/\bEast\b/g, 'E').replace(/\bWest\b/g, 'W');
const SPEED_FOR = { residential: 30, living_street: 20, unclassified: 30, tertiary: 35, secondary: 40, primary: 45, motorway: 65, trunk: 55 };

/** Pure planner (testable): exit signs + shields from the major network. */
export function planFreewaySigns(roads) {
  const byNode = new Map();
  const add = (k, r, end) => { let a = byNode.get(k); if (!a) byNode.set(k, (a = [])); a.push({ r, end }); };
  for (const r of roads) { const p = r.p; if (!p || p.length < 4) continue; add(nodeKey(p[0], p[1]), r, 0); add(nodeKey(p[p.length - 2], p[p.length - 1]), r, 1); }
  const exits = [], shields = [];
  for (const r of roads) {
    if (r.h !== 'motorway_link' || !r.p || r.p.length < 4) continue;
    const p = r.p, k0 = nodeKey(p[0], p[1]);
    const from = (byNode.get(k0) || []).find((o) => o.r !== r && o.r.h === 'motorway');
    if (!from) continue;
    let cur = r, dest = null;
    for (let hop = 0; hop < 6 && cur; hop++) {
      const q = cur.p, kk = nodeKey(q[q.length - 2], q[q.length - 1]);
      const nxt = (byNode.get(kk) || []).map((o) => o.r).filter((o) => o !== cur);
      const named = nxt.find((o) => !/_link$/.test(o.h) && (o.n || o.r));
      if (named) { dest = named; break; }
      cur = nxt.find((o) => /_link$/.test(o.h)) || null;
    }
    if (!dest) continue;
    const dx = p[2] - p[0], dz = p[3] - p[1], L = Math.hypot(dx, dz) || 1;
    exits.push({ x: p[0], z: p[1], ux: dx / L, uz: dz / L, w: from.r.w, text: ['EXIT', shortName(dest.n || dest.r).slice(0, 22), dest.r && dest.n ? dest.r.split(';')[0] : ''], bridge: !!(from.r.b || from.r.y > 0) });
  }
  const seen = new Map();
  for (const r of roads) {
    if (r.h !== 'motorway' || !r.r || r.b || !r.p || r.p.length < 4) continue;
    const ref = r.r.split(';')[0].trim();
    const p = r.p, cx = p[0], cz = p[1];
    const list = seen.get(ref) || []; if (list.some(([x, z]) => Math.hypot(x - cx, z - cz) < 2500)) continue;
    list.push([cx, cz]); seen.set(ref, list);
    const dx = p[2] - p[0], dz = p[3] - p[1], L = Math.hypot(dx, dz) || 1;
    shields.push({ x: cx, z: cz, ux: dx / L, uz: dz / L, w: r.w, ref });
  }
  return { exits, shields };
}

export function createHoustonSigns({ parent, roadsMajorUrl = '/data/houston/roads-major.json', base = '/data/houston/', radius = 3200, maxSigns = 140, maxBlades = 160, maxReg = 90 }) {
  const root = new THREE.Group(); root.name = 'houston-signs'; parent.add(root);
  const postMat = new THREE.MeshLambertMaterial({ color: 0x8b8f93 });
  const postGeo = new THREE.CylinderGeometry(0.18, 0.22, 1, 6); postGeo.translate(0, 0.5, 0);
  const armGeo = new THREE.BoxGeometry(1, 0.25, 0.25);
  const panelGeo = new THREE.PlaneGeometry(1, 1);
  let plan = null; const live = new Map(); const blades = new Map(); const regs = new Map(); let bladeTiles = new Set();
  const ready = fetch(roadsMajorUrl).then((r) => r.json()).then((d) => { plan = planFreewaySigns(d.roads); return plan; });

  function panel(tex, w, h, x, y, z, yaw) {
    const m = new THREE.Mesh(panelGeo, new THREE.MeshLambertMaterial({ map: tex, side: THREE.DoubleSide }));
    m.scale.set(w, h, 1); m.position.set(x, y, z); m.rotation.y = yaw; return m;
  }
  function post(x, z, h) { const m = new THREE.Mesh(postGeo, postMat); m.scale.set(1, h, 1); m.position.set(x, 0, z); return m; }

  function makeExit(s) {
    const g = new THREE.Group();
    const nx = -s.uz, nz = s.ux, off = s.w / 2 + 2.5, H = 7.2;
    const px = s.x + nx * off - s.ux * 60, pz = s.z + nz * off - s.uz * 60;
    const yaw = Math.atan2(s.ux, s.uz) + Math.PI;
    g.add(post(px, pz, H));
    const arm = new THREE.Mesh(armGeo, postMat); arm.scale.set(7, 1, 1); arm.position.set(px - nx * 3.5, H - 0.4, pz - nz * 3.5); arm.rotation.y = Math.atan2(-nz, nx) * -1 + Math.PI / 2; g.add(arm);
    g.add(panel(signTex(s.text, 'guide'), 6.4, 3.2, px - nx * 4, H + 0.9, pz - nz * 4, yaw));
    return g;
  }
  function makeShield(s) {
    const g = new THREE.Group();
    const nx = -s.uz, nz = s.ux, off = s.w / 2 + 3, x = s.x + nx * off, z = s.z + nz * off;
    g.add(post(x, z, 3.2));
    g.add(panel(signTex([s.ref], 'shield'), 1.8, 1.8, x, 3.6, z, Math.atan2(s.ux, s.uz) + Math.PI));
    return g;
  }
  function makeBlade(b) {
    const g = new THREE.Group();
    g.add(post(b.x, b.z, 3.4));
    g.add(panel(signTex([b.a], 'blade'), 2.6, 0.48, b.x, 3.55, b.z, b.yaw));
    g.add(panel(signTex([b.b], 'blade'), 2.6, 0.48, b.x, 3.05, b.z, b.yaw + Math.PI / 2));
    return g;
  }
  function makeReg(r) {
    const g = new THREE.Group();
    const h = r.kind === 'speed' ? 2.8 : 2.6;
    g.add(post(r.x, r.z, h));
    if (r.kind === 'stop') g.add(panel(signTex(['STOP'], 'stop'), 0.95, 0.95, r.x, h + 0.55, r.z, r.yaw));
    else if (r.kind === 'yield') g.add(panel(signTex(['YIELD'], 'yield'), 1.0, 1.0, r.x, h + 0.55, r.z, r.yaw));
    else g.add(panel(signTex([String(r.mph || 35)], 'speed'), 0.85, 1.05, r.x, h + 0.6, r.z, r.yaw));
    return g;
  }
  const dispose = (g) => g.traverse((o) => { if (o.isMesh && o.geometry === panelGeo) o.material.dispose(); });

  async function loadLocalSigns(key) {
    const d = await fetch(base + 'tiles/local/' + key + '.json').then((r) => r.json()).catch(() => null);
    const ends = new Map(), bladesOut = [], regsOut = [];
    for (const r of (d && d.roads) || []) {
      const p = r.p; if (!p || p.length < 4) continue;
      for (const [i, j] of [[0, 2], [p.length - 2, p.length - 4]]) {
        if (j < 0 || j >= p.length) continue;
        const k = nodeKey(p[i], p[i + 1]); let a = ends.get(k); if (!a) ends.set(k, (a = []));
        a.push({ r, x: p[i], z: p[i + 1], ux: p[j] - p[i], uz: p[j + 1] - p[i + 1] });
      }
    }
    for (const a of ends.values()) {
      const named = a.filter((o) => o.r.n);
      const u = named[0], v = named.find((o) => o.r.n !== (u && u.r.n));
      if (u && v) {
        const L = Math.hypot(u.ux, u.uz) || 1, nx = -u.uz / L, nz = u.ux / L, off = u.r.w / 2 + 2.2;
        bladesOut.push({ x: u.x + nx * off + u.ux / L * -3, z: u.z + nz * off + u.uz / L * -3, a: shortName(u.r.n).slice(0, 20), b: shortName(v.r.n).slice(0, 20), yaw: Math.atan2(u.ux, u.uz) + Math.PI / 2 });
      }
      /* STOP when a local street meets a higher-class road; YIELD on link-ish meets; SPEED on arterials */
      if (a.length >= 2) {
        const rank = (h) => ({ living_street: 1, residential: 2, unclassified: 2, tertiary: 3, secondary: 4, primary: 5, trunk: 6, motorway: 7 }[h] || 0);
        const minor = a.reduce((m, o) => (rank(o.r.h) < rank(m.r.h) ? o : m), a[0]);
        const major = a.reduce((m, o) => (rank(o.r.h) > rank(m.r.h) ? o : m), a[0]);
        if (rank(major.r.h) >= 3 && rank(minor.r.h) <= 2 && rank(major.r.h) > rank(minor.r.h)) {
          const L = Math.hypot(minor.ux, minor.uz) || 1, nx = -minor.uz / L, nz = minor.ux / L;
          const off = minor.r.w / 2 + 1.8;
          regsOut.push({
            x: minor.x + nx * off - minor.ux / L * 8,
            z: minor.z + nz * off - minor.uz / L * 8,
            yaw: Math.atan2(minor.ux, minor.uz) + Math.PI,
            kind: rank(major.r.h) >= 5 ? 'yield' : 'stop',
          });
        }
      }
    }
    /* Speed-limit posts every ~400 m along tertiary+ */
    for (const r of (d && d.roads) || []) {
      if (!SPEED_FOR[r.h] || r.h === 'residential' || r.h === 'living_street' || r.h === 'unclassified') continue;
      const p = r.p; if (!p || p.length < 6) continue;
      let acc = 80;
      for (let i = 2; i < p.length; i += 2) {
        const ax = p[i - 2], az = p[i - 1], dx = p[i] - ax, dz = p[i + 1] - az, L = Math.hypot(dx, dz);
        if (L < 1) continue;
        for (; acc < L; acc += 420) {
          const t = acc / L, ux = dx / L, uz = dz / L, nx = -uz, nz = ux;
          regsOut.push({
            x: ax + ux * acc + nx * (r.w / 2 + 2.4),
            z: az + uz * acc + nz * (r.w / 2 + 2.4),
            yaw: Math.atan2(ux, uz) + Math.PI,
            kind: 'speed',
            mph: SPEED_FOR[r.h],
          });
        }
        acc -= L;
      }
    }
    return { blades: bladesOut, regs: regsOut };
  }

  let busy = false;
  async function update(camX, camZ, camDist) {
    if (!plan || busy) return;
    busy = true;
    try {
      const show = camDist < 2600;
      root.visible = camDist < 6000;
      const want = [];
      for (const [i, s] of plan.exits.entries()) { const d = Math.hypot(s.x - camX, s.z - camZ); if (d < radius) want.push([d, 'e' + i, s]); }
      for (const [i, s] of plan.shields.entries()) { const d = Math.hypot(s.x - camX, s.z - camZ); if (d < radius) want.push([d, 's' + i, s]); }
      want.sort((a, b) => a[0] - b[0]);
      const keep = new Set(want.slice(0, maxSigns).map((w) => w[1]));
      for (const [id, g] of live) if (!keep.has(id)) { dispose(g); root.remove(g); live.delete(id); }
      for (const [, id, s] of want.slice(0, maxSigns)) if (!live.has(id)) { const g = id[0] === 'e' ? makeExit(s) : makeShield(s); live.set(id, g); root.add(g); }
      const T = 4000, key = Math.floor(camX / T) + '_' + Math.floor(camZ / T);
      if (show && !bladeTiles.has(key)) {
        bladeTiles.add(key);
        const pack = await loadLocalSigns(key);
        for (const b of pack.blades) blades.set(b.x.toFixed(0) + ',' + b.z.toFixed(0), { b, g: null });
        for (const r of pack.regs) regs.set(r.kind[0] + r.x.toFixed(0) + ',' + r.z.toFixed(0), { r, g: null });
      }
      const bw = [];
      for (const [id, o] of blades) { const d = Math.hypot(o.b.x - camX, o.b.z - camZ); if (show && d < 1400) bw.push([d, id, o]); else if (o.g) { dispose(o.g); root.remove(o.g); o.g = null; } }
      bw.sort((a, b) => a[0] - b[0]);
      bw.forEach(([, , o], i) => { if (i < maxBlades) { if (!o.g) { o.g = makeBlade(o.b); root.add(o.g); } } else if (o.g) { dispose(o.g); root.remove(o.g); o.g = null; } });
      const rw = [];
      for (const [id, o] of regs) { const d = Math.hypot(o.r.x - camX, o.r.z - camZ); if (show && d < 1100) rw.push([d, id, o]); else if (o.g) { dispose(o.g); root.remove(o.g); o.g = null; } }
      rw.sort((a, b) => a[0] - b[0]);
      rw.forEach(([, , o], i) => { if (i < maxReg) { if (!o.g) { o.g = makeReg(o.r); root.add(o.g); } } else if (o.g) { dispose(o.g); root.remove(o.g); o.g = null; } });
    } finally { busy = false; }
  }
  return {
    root, ready, update,
    get counts() {
      return {
        exits: plan ? plan.exits.length : 0,
        shields: plan ? plan.shields.length : 0,
        live: live.size,
        blades: [...blades.values()].filter((o) => o.g).length,
        regs: [...regs.values()].filter((o) => o.g).length,
      };
    },
  };
}
