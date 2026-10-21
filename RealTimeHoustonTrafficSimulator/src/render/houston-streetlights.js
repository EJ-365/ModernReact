/**
 * Houston street lighting from OSM (public/data/houston/streetlights.json): mapped street_lamp
 * nodes plus poles along every lit=yes road. Major roads reuse the rendered OSM deck frame so
 * freeway/bridge poles stand on the deck edge (twin-arm median poles on divided freeways).
 * Instanced per 2 km cell; only cells near the camera draw, heads + light pools glow at night.
 */
import * as THREE from 'three';

const CELL = 2000;
const SPACING = { motorway: 60, motorway_link: 50, trunk: 55, trunk_link: 50, primary: 45, primary_link: 45, secondary: 42, secondary_link: 42 };

function poleGeometry(h, arm) {
  const pole = new THREE.CylinderGeometry(0.11, 0.17, h, 5, 1, true); pole.translate(0, h / 2, 0);
  const parts = [pole];
  for (const sd of arm === 2 ? [1, -1] : arm ? [1] : []) {
    const a = new THREE.BoxGeometry(0.12, 0.12, 2.6); a.translate(0, h - 0.15, sd * 1.3); parts.push(a);
  }
  return mergeSimple(parts);
}
function headGeometry(h, arm) {
  const parts = [];
  if (!arm) { const g = new THREE.CylinderGeometry(0.38, 0.26, 0.7, 6); g.translate(0, h + 0.25, 0); parts.push(g); }
  for (const sd of arm === 2 ? [1, -1] : arm ? [1] : []) { const g = new THREE.BoxGeometry(0.5, 0.24, 1.05); g.translate(0, h - 0.25, sd * 2.55); parts.push(g); }
  return mergeSimple(parts);
}
function mergeSimple(geos) {
  const P = [], N = [], I = [];
  for (const g of geos) {
    const ng = g.index ? g : g;
    const b = P.length / 3, p = ng.attributes.position.array, n = ng.attributes.normal.array;
    for (let i = 0; i < p.length; i++) { P.push(p[i]); N.push(n[i]); }
    if (ng.index) for (const ix of ng.index.array) I.push(b + ix); else for (let i = 0; i < p.length / 3; i++) I.push(b + i);
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
  out.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3));
  out.setIndex(I);
  return out;
}

export function createHoustonStreetlights({ parent, net, baseY = 0, kv = 1, url = '/data/houston/streetlights.json', range = 5200 }) {
  const root = new THREE.Group(); root.name = 'houston-streetlights'; parent.add(root);
  const poleMat = new THREE.MeshLambertMaterial({ color: 0x6d7378 });
  const headMat = new THREE.MeshBasicMaterial({ color: 0x8a8f94, transparent: true, opacity: 1, depthWrite: false });
  const poolTex = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d');
    const g = x.createRadialGradient(32, 32, 1, 32, 32, 31);
    g.addColorStop(0, 'rgba(255,220,160,0.85)'); g.addColorStop(0.3, 'rgba(255,200,120,0.35)'); g.addColorStop(0.65, 'rgba(255,190,110,0.1)'); g.addColorStop(1, 'rgba(255,190,110,0)');
    x.fillStyle = g; x.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c);
  })();
  const poolMat = new THREE.MeshBasicMaterial({ map: poolTex, transparent: true, opacity: 0, blending: THREE.NormalBlending, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -6, polygonOffsetUnits: -12 });
  /* pools sit just above every road deck (max 0.17) — at +0.08 they z-fought the asphalt and flickered */
  const poolGeo = new THREE.PlaneGeometry(1, 1); poolGeo.rotateX(-Math.PI / 2);
  const KINDS = [
    { h: 12, arm: 1 },
    { h: 13, arm: 2 },
    { h: 8.5, arm: 1 },
    { h: 4.2, arm: 0 },
  ].map((k) => ({ ...k, pg: poleGeometry(k.h, k.arm), hg: headGeometry(k.h, k.arm) }));
  const cells = new Map();
  const taken = new Set();
  const stats = { lamps: 0, cells: 0, visibleCells: 0 };
  function add(kind, x, y, z, yaw, poolR) {
    const tk = Math.round(x / 14) + ',' + Math.round(z / 14) + ',' + Math.round(y / 4);
    if (taken.has(tk)) return; taken.add(tk);
    const ck = Math.floor(x / CELL) + ',' + Math.floor(z / CELL);
    let c = cells.get(ck); if (!c) cells.set(ck, (c = { x: (Math.floor(x / CELL) + 0.5) * CELL, z: (Math.floor(z / CELL) + 0.5) * CELL, items: [[], [], [], []], g: null }));
    c.items[kind].push([x, y, z, yaw, poolR]); stats.lamps++;
  }
  function build(c) {
    const g = new THREE.Group(), d = new THREE.Object3D();
    const pools = [];
    c.items.forEach((list, ki) => {
      if (!list.length) return;
      const K = KINDS[ki];
      const pm = new THREE.InstancedMesh(K.pg, poleMat, list.length), hm = new THREE.InstancedMesh(K.hg, headMat, list.length);
      list.forEach(([x, y, z, yaw, r], i) => {
        d.position.set(x, y, z); d.rotation.set(0, yaw, 0); d.scale.set(1, 1, 1); d.updateMatrix();
        pm.setMatrixAt(i, d.matrix); hm.setMatrixAt(i, d.matrix);
        for (const sd of K.arm === 2 ? [1, -1] : K.arm ? [1] : [0]) pools.push([x + Math.sin(yaw) * sd * 2.55, y, z + Math.cos(yaw) * sd * 2.55, r]);
      });
      pm.computeBoundingSphere(); hm.computeBoundingSphere();
      g.add(pm, hm);
    });
    const lp = new THREE.InstancedMesh(poolGeo, poolMat, pools.length);
    pools.forEach(([x, y, z, r], i) => { d.position.set(x, y + 0.24, z); d.rotation.set(0, 0, 0); d.scale.set(r, 1, r); d.updateMatrix(); lp.setMatrixAt(i, d.matrix); });
    lp.computeBoundingSphere(); lp.renderOrder = 2; g.add(lp);
    g.userData.pool = lp;
    c.g = g; root.add(g);
  }
  /* pavement grid: a pole is never planted on any carriageway (parallel frontage roads, ramps, the other direction) */
  const PG = 24, pave = new Map();
  function addPave(w) {
    const f = w.f, r = w.r; if (!f || !r) return;
    const hw = (r.w || 7) / 2;
    for (let i = 1; i < f.n; i++) {
      const ax = f.pts[2 * i - 2], az = f.pts[2 * i - 1], bx = f.pts[2 * i], bz = f.pts[2 * i + 1];
      const y = ((w.ys ? (w.ys[i - 1] + w.ys[i]) / 2 : 0) + (w.cy || 0)) * kv;
      const seg = [ax, az, bx, bz, hw, y, r];
      const L = Math.hypot(bx - ax, bz - az), n = Math.max(1, Math.ceil(L / (PG * 0.5)));
      const seen = new Set();
      for (let j = 0; j <= n; j++) {
        const key = Math.floor((ax + (bx - ax) * j / n) / PG) + ',' + Math.floor((az + (bz - az) * j / n) / PG);
        if (seen.has(key)) continue; seen.add(key);
        let a = pave.get(key); if (!a) pave.set(key, (a = [])); a.push(seg);
      }
    }
  }
  function onPave(x, z, y) {
    const gx = Math.floor(x / PG), gz = Math.floor(z / PG);
    for (let dz = -1; dz <= 1; dz++) for (let dx = -1; dx <= 1; dx++) {
      const a = pave.get((gx + dx) + ',' + (gz + dz)); if (!a) continue;
      for (const [ax, az, bx, bz, hw, sy] of a) {
        if (Math.abs(sy - (y - baseY)) > 3 * kv) continue;
        const ex = bx - ax, ez = bz - az, L2 = ex * ex + ez * ez || 1;
        const t = Math.max(0, Math.min(1, ((x - ax) * ex + (z - az) * ez) / L2));
        if (Math.hypot(x - ax - ex * t, z - az - ez * t) < hw + 1.2) return true;
      }
    }
    return false;
  }
  const ready = fetch(url).then((r) => r.json()).then((d) => {
    const lit = new Set(d.lit);
    for (const w of net || []) addPave(w);
    for (const w of net || []) {
      const r = w.r; if (!lit.has(r.id) && !/^(trunk|primary|secondary|tertiary)/.test(r.h)) continue;
      const f = w.f, sp = SPACING[r.h] || 45, hw = r.w / 2;
      const median = r.h === 'motorway' && !r.o && hw > 9;
      let next = sp * 0.5, side = 1;
      for (let i = 1; i < f.n; i++) {
        while (f.cum[i] >= next) {
          const t = (next - f.cum[i - 1]) / Math.max(1e-3, f.cum[i] - f.cum[i - 1]);
          const x = f.pts[2 * i - 2] + (f.pts[2 * i] - f.pts[2 * i - 2]) * t, z = f.pts[2 * i - 1] + (f.pts[2 * i + 1] - f.pts[2 * i - 1]) * t;
          const yv = baseY + (((w.ys ? w.ys[i - 1] + (w.ys[i] - w.ys[i - 1]) * t : 0)) + w.cy) * kv;
          const nx = f.nx[i], nz = f.nz[i], yaw = Math.atan2(nx, nz);
          if (median) add(1, x, yv, z, yaw, 12);
          else {
            const s = r.o ? 1 : side; side = -side;
            const px = x + nx * (hw + 2) * s, pz = z + nz * (hw + 2) * s;
            if (!onPave(px, pz, yv)) add(0, px, yv, pz, s > 0 ? yaw + Math.PI : yaw, 11);
          }
          next += sp;
        }
      }
    }
    for (const m of d.litMinor) {
      const p = m.p; let acc = 20, side = 1;
      for (let i = 2; i < p.length; i += 2) {
        const dx = p[i] - p[i - 2], dz = p[i + 1] - p[i - 1], L = Math.hypot(dx, dz); if (L < 0.5) continue;
        const nx = -dz / L, nz = dx / L, yaw = Math.atan2(nx, nz);
        for (let s = acc; s < L; s += 42) {
          const x = p[i - 2] + dx * s / L, z = p[i - 1] + dz * s / L;
          const px = x + nx * 6.2 * side, pz = z + nz * 6.2 * side;
          if (!onPave(px, pz, baseY)) add(2, px, baseY, pz, side > 0 ? yaw + Math.PI : yaw, 8); side = -side;
          acc = s + 42 - L;
        }
        if (acc >= L) acc -= L;
      }
    }
    for (let i = 0; i < d.lamps.length; i += 2) if (!onPave(d.lamps[i], d.lamps[i + 1], baseY)) add(3, d.lamps[i], baseY, d.lamps[i + 1], 0, 6);
    stats.cells = cells.size;
    return stats;
  });
  let lastX = 1e9, lastZ = 1e9, night = 0, wasNight = false;
  const day = new THREE.Color(0x8a8f94), warm = new THREE.Color(0xffe0a8);
  function update(nightF, camPos, camR) {
    night = nightF;
    const r = camR != null ? camR : 0;
    /* Lit through freeway / district views; only fade at huge city overview */
    const zoomFade = r < 2400 ? 1 : r > 5200 ? 0.08 : 1 - (r - 2400) / 2800 * 0.92;
    const onNight = nightF > 0.12;
    headMat.color.copy(day).lerp(warm, onNight ? Math.min(1, nightF * 1.5) : 0);
    headMat.opacity = onNight ? (0.65 + nightF * 0.35) * zoomFade : 0.9;
    poolMat.opacity = onNight ? nightF * 0.42 * zoomFade : 0;
    const far = r > 4800;
    root.visible = !far;
    if (far || !camPos) return;
    const cellR = range * (0.65 + 0.2 * zoomFade);
    const moved = Math.hypot(camPos.x - lastX, camPos.z - lastZ) >= 200;
    const rangeChanged = Math.abs((root.userData._cellR || 0) - cellR) >= 120;
    const nightFlip = onNight !== wasNight;
    if (moved || rangeChanged || nightFlip || !root.userData._built) {
      lastX = camPos.x; lastZ = camPos.z; root.userData._cellR = cellR;
      root.userData._built = true; wasNight = onNight;
      let v = 0;
      for (const c of cells.values()) {
        const near = Math.hypot(c.x - camPos.x, c.z - camPos.z) < cellR;
        if (near && !c.g) build(c);
        if (c.g) {
          c.g.visible = near;
          if (near) {
            v++;
            c.g.userData.pool.visible = onNight && zoomFade > 0.08;
          }
        }
      }
      stats.visibleCells = v;
    }
  }
  /* suburbs: residential / collector streets streamed in later tiles get lamps too (OSM rarely tags lit=yes there) */
  const RES = /^(residential|unclassified|living_street|tertiary|tertiary_link|secondary|secondary_link)$/;
  function addWays(ways) {
    const touched = new Set();
    for (const w of ways || []) addPave(w);
    for (const w of ways || []) {
      const r = w.r; if (!r || !RES.test(r.h) || !w.f) continue;
      const f = w.f, hw = (r.w || 7) / 2, sp = r.h.startsWith('secondary') ? 45 : 58;
      let next = sp * 0.5, side = 1;
      for (let i = 1; i < f.n; i++) {
        while (f.cum[i] >= next) {
          const t = (next - f.cum[i - 1]) / Math.max(1e-3, f.cum[i] - f.cum[i - 1]);
          const x = f.pts[2 * i - 2] + (f.pts[2 * i] - f.pts[2 * i - 2]) * t, z = f.pts[2 * i - 1] + (f.pts[2 * i + 1] - f.pts[2 * i - 1]) * t;
          const yv = baseY + (((w.ys ? w.ys[i - 1] + (w.ys[i] - w.ys[i - 1]) * t : 0)) + (w.cy || 0)) * kv;
          const nx = f.nx[i], nz = f.nz[i], yaw = Math.atan2(nx, nz);
          const px = x + nx * (hw + 2) * side, pz = z + nz * (hw + 2) * side;
          if (!onPave(px, pz, yv)) add(2, px, yv, pz, side > 0 ? yaw + Math.PI : yaw, 8);
          touched.add(Math.floor(px / CELL) + ',' + Math.floor(pz / CELL));
          side = -side; next += sp;
        }
      }
    }
    for (const ck of touched) {
      const cc = cells.get(ck);
      if (cc && cc.g) { root.remove(cc.g); cc.g.traverse((o) => { if (o.isInstancedMesh) o.dispose(); }); cc.g = null; }
    }
    if (touched.size) root.userData._built = false;
  }
  return { root, ready, update, stats, addWays };
}
