/**
 * Houston road network at true scale from OpenStreetMap (public/data/houston).
 * - Every way is a lane-width ribbon; widths come from OSM lanes/width tags.
 * - Bridges/overpasses use OSM bridge + layer tags; approaches ramp at a real
 *   ~4.5% grade through the connected way graph, so decks never jump or morph.
 * - Geometry is merged per chunk and material (a handful of draw calls), built in
 *   time slices; minor/local streets stream in 4 km tiles around the camera.
 * Input coordinates are metres (unitsPerMile 1609.344); `k` maps metres → world units.
 */
import * as THREE from 'three';

const GRADE = 0.045;
const LAYER_H = 6.8;
const CHUNK = 3000;
const CLASS = {
  motorway: { c: 0xa3a39c, y: 0.16, edge: 1 }, trunk: { c: 0x9c9c96, y: 0.15, edge: 1 },
  motorway_link: { c: 0xa09f99, y: 0.17, edge: 1 }, trunk_link: { c: 0x9a9a94, y: 0.15, edge: 1 },
  primary: { c: 0x6a6b6c, y: 0.12, edge: 1 }, primary_link: { c: 0x6a6b6c, y: 0.12, edge: 1 },
  secondary: { c: 0x646566, y: 0.09 }, secondary_link: { c: 0x646566, y: 0.09 },
  tertiary: { c: 0x5f6061, y: 0.07 }, tertiary_link: { c: 0x5f6061, y: 0.07 },
  residential: { c: 0x77787a, y: 0.04 }, unclassified: { c: 0x6e6f70, y: 0.04 }, living_street: { c: 0x7a7b7c, y: 0.04 },
};

function canvasTex(w, h, draw, repeat) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  if (repeat) t.repeat.set(repeat[0], repeat[1]);
  return t;
}

function makeMaterials() {
  let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const asphalt = canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = '#c8c8c8'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 9000; i++) { const v = 150 + rnd() * 105 | 0; g.fillStyle = `rgb(${v},${v},${v})`; g.fillRect(rnd() * w, rnd() * h, 1 + rnd() * 1.5, 1 + rnd() * 1.5); }
    g.globalAlpha = 0.18; g.strokeStyle = '#555';
    for (let i = 0; i < 14; i++) { g.beginPath(); g.moveTo(rnd() * w, rnd() * h); g.lineTo(rnd() * w, rnd() * h); g.stroke(); }
  });
  const dash = canvasTex(4, 64, (g) => { g.fillStyle = '#000'; g.fillRect(0, 0, 4, 64); g.fillStyle = '#fff'; g.fillRect(0, 0, 4, 16); });
  /* Soft concrete — low-contrast grit (bright speckles caused night “glitter” under city fill) */
  const concrete = canvasTex(128, 128, (g, w, h) => {
    g.fillStyle = '#7a7872'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 1400; i++) {
      const v = 110 + rnd() * 28 | 0;
      g.fillStyle = `rgb(${v},${v - 1},${v - 4})`;
      g.fillRect(rnd() * w, rnd() * h, 1 + (rnd() * 2 | 0), 1);
    }
    g.fillStyle = 'rgba(40,40,40,0.28)'; g.fillRect(0, h - 6, w, 6);
  });
  const po = { polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -2 };
  return {
    surface: new THREE.MeshLambertMaterial({ map: asphalt, vertexColors: true, emissive: 0x000000, emissiveIntensity: 0 }),
    deck: new THREE.MeshLambertMaterial({ map: concrete, color: 0x8e8c86, side: THREE.DoubleSide }),
    under: new THREE.MeshLambertMaterial({ color: 0x5c5b56, side: THREE.DoubleSide }),
    lineW: new THREE.MeshBasicMaterial({ color: 0xe6e6e0, ...po }),
    lineY: new THREE.MeshBasicMaterial({ color: 0xe0b12c, ...po }),
    dashW: new THREE.MeshBasicMaterial({ color: 0xe6e6e0, alphaMap: dash, alphaTest: 0.5, ...po }),
    pier: new THREE.MeshLambertMaterial({ map: concrete, color: 0x85837d }),
    berm: new THREE.MeshLambertMaterial({ color: 0xb9b4a8, side: THREE.DoubleSide }),
  };
}

/** Accumulates indexed triangle strips for one (chunk, material) bucket. */
class Bucket {
  constructor(color) { this.p = []; this.n = []; this.uv = []; this.c = color ? [] : null; this.i = []; }
  get vc() { return this.p.length / 3; }
  vert(x, y, z, nx, ny, nz, u, v, col) {
    this.p.push(x, y, z); this.n.push(nx, ny, nz); this.uv.push(u, v);
    if (this.c) this.c.push(col.r, col.g, col.b);
  }
  /* counter-clockwise seen from above (+Y) so FrontSide road surfaces face the camera */
  quad(a) { this.i.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
  geometry() {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(this.p, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(this.n, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(this.uv, 2));
    if (this.c) g.setAttribute('color', new THREE.Float32BufferAttribute(this.c, 3));
    g.setIndex(this.vc > 65535 ? new THREE.Uint32BufferAttribute(this.i, 1) : new THREE.Uint16BufferAttribute(this.i, 1));
    g.computeBoundingSphere();
    return g;
  }
}

/** Polyline with per-point height, tangent-normal frames and arc length. */
function frame(pts, ys) {
  const n = pts.length / 2, nx = new Float32Array(n), nz = new Float32Array(n), m = new Float32Array(n), cum = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const i0 = Math.max(0, i - 1), i1 = Math.min(n - 1, i + 1);
    let ax = 0, az = 0, bx = 0, bz = 0;
    if (i > 0) { ax = pts[2 * i] - pts[2 * i0]; az = pts[2 * i + 1] - pts[2 * i0 + 1]; const l = Math.hypot(ax, az) || 1; ax /= l; az /= l; }
    if (i < n - 1) { bx = pts[2 * i1] - pts[2 * i]; bz = pts[2 * i1 + 1] - pts[2 * i + 1]; const l = Math.hypot(bx, bz) || 1; bx /= l; bz /= l; }
    let tx = ax + bx, tz = az + bz; const tl = Math.hypot(tx, tz) || 1; tx /= tl; tz /= tl;
    nx[i] = -tz; nz[i] = tx;
    const sx = i > 0 ? ax : bx, sz = i > 0 ? az : bz;
    m[i] = 1 / Math.max(0.5, Math.abs(nx[i] * -sz + nz[i] * sx));
    if (i > 0) cum[i] = cum[i - 1] + Math.hypot(pts[2 * i] - pts[2 * i - 2], pts[2 * i + 1] - pts[2 * i - 1]);
  }
  return { n, pts, ys, nx, nz, m, cum };
}

function resample(p, step, need) {
  const out = [p[0], p[1]];
  let s = 0;
  for (let i = 2; i < p.length; i += 2) {
    const x0 = p[i - 2], z0 = p[i - 1], x1 = p[i], z1 = p[i + 1];
    const L = Math.hypot(x1 - x0, z1 - z0), k = !need || need(s, s + L) ? Math.max(1, Math.ceil(L / step)) : 1;
    s += L;
    for (let j = 1; j <= k; j++) out.push(x0 + (x1 - x0) * j / k, z0 + (z1 - z0) * j / k);
  }
  return out;
}

const nodeKey = (x, z) => `${Math.round(x * 0.5)},${Math.round(z * 0.5)}`;
function wayLen(p) { let L = 0; for (let i = 2; i < p.length; i += 2) L += Math.hypot(p[i] - p[i - 2], p[i + 1] - p[i - 1]); return L; }
function deckH(r) {
  if (r.y > 0) return r.y * LAYER_H;
  if (r.b) return /^(motorway|trunk)/.test(r.h) ? 5.5 : 1.6;
  return 0;
}

/** Heights at way endpoints: bridges pin their layer height; approaches relax at GRADE. */
export function solveHeights(roads) {
  const H = new Map();
  const ends = roads.map((r) => {
    const p = r.p, L = wayLen(p);
    return { a: nodeKey(p[0], p[1]), b: nodeKey(p[p.length - 2], p[p.length - 1]), L, d: deckH(r) };
  });
  /* at-grade junctions (3+ ordinary ways, no bridge) stay on the ground: before, a short ramp could lift the
     frontage road / cross street it joins, which made roads hump up and "merge" into each other */
  const deg = new Map(), bridgeNode = new Set();
  ends.forEach((e) => { for (const k of [e.a, e.b]) { deg.set(k, (deg.get(k) || 0) + 1); if (e.d) bridgeNode.add(k); } });
  const pinned = new Set();
  for (const [k, n] of deg) if (n >= 3 && !bridgeNode.has(k)) pinned.add(k);
  const bump = (k, h) => { if (pinned.has(k)) return false; if (h > (H.get(k) || 0)) { H.set(k, h); return true; } return false; };
  ends.forEach((e) => { if (e.d) { bump(e.a, e.d); bump(e.b, e.d); } });
  for (let it = 0; it < 12; it++) {
    let changed = false;
    for (const e of ends) {
      const ha = H.get(e.a) || 0, hb = H.get(e.b) || 0;
      if (bump(e.b, Math.max(e.d, ha - GRADE * e.L))) changed = true;
      if (bump(e.a, Math.max(e.d, hb - GRADE * e.L))) changed = true;
    }
    if (!changed) break;
  }
  return { H, ends };
}

function profile(r, e, H) {
  const ha = H ? H.get(e.a) || 0 : 0, hb = H ? H.get(e.b) || 0 : 0;
  if (!ha && !hb && !e.d) return null;
  const L0 = wayLen(r.p);
  /* a ramp too short for the normal 4.5 % grade gets steeper (up to the real end height) instead of ending in mid-air */
  const gA = !e.d && ha > hb ? Math.max(GRADE, (ha - hb) / Math.max(L0, 1)) : GRADE;
  const gB = !e.d && hb > ha ? Math.max(GRADE, (hb - ha) / Math.max(L0, 1)) : GRADE;
  const ra = ha / gA + 30, rb = L0 - hb / gB - 30;
  const p = e.d ? resample(r.p, 10) : resample(r.p, 8, (s0, s1) => s0 < ra || s1 > rb);
  const n = p.length / 2, ys = new Float32Array(n);
  let s = 0; const L = wayLen(p);
  for (let i = 0; i < n; i++) {
    if (i) s += Math.hypot(p[2 * i] - p[2 * i - 2], p[2 * i + 1] - p[2 * i - 1]);
    let y = Math.max(e.d, ha - gA * s, hb - gB * (L - s), 0);
    if (!H && e.d) { const t = Math.min(s, L - s); y = e.d * Math.min(1, t / Math.max(8, e.d / GRADE)); }
    ys[i] = y;
  }
  for (let pass = 0; pass < 2; pass++) for (let i = 1; i < n - 1; i++) ys[i] = (ys[i - 1] + 2 * ys[i] + ys[i + 1]) / 4;
  return { p, ys };
}

export function createHoustonRoads({ parent, k = 1, kv = k, base = '/data/houston/', baseY = 0, offset = 60, slice = 18 }) {
  const root = new THREE.Group(); root.name = 'houston-roads'; parent.add(root);
  const mats = makeMaterials();
  const tmpC = new THREE.Color();
  const X = (x) => (x - offset) * k + offset, Z = X;
  const pierGeo = new THREE.BoxGeometry(1, 1, 1); pierGeo.translate(0, 0.5, 0);
  const stats = { ways: 0, tris: 0, tiles: 0 };
  /* 10 m grid of deck heights on the major network: heightAt(x,z,hint) → world Y of the surface */
  const HG = 10, hgrid = new Map();
  function noteHeights(pts, ys, cls) {
    for (let i = 0; i < pts.length / 2; i++) {
      const key = Math.floor(pts[2 * i] / HG) + ',' + Math.floor(pts[2 * i + 1] / HG);
      let a = hgrid.get(key); if (!a) hgrid.set(key, (a = []));
      a.push(baseY + ((ys ? ys[i] : 0) + cls.y) * kv);
    }
  }
  function heightAt(x, z, hint) {
    const mx = (x - offset) / k + offset, mz = (z - offset) / k + offset;
    const gx = Math.floor(mx / HG), gz = Math.floor(mz / HG);
    let best = null, bd = 1e9;
    for (let dx = -1; dx <= 1; dx++) for (let dz = -1; dz <= 1; dz++) {
      const a = hgrid.get((gx + dx) + ',' + (gz + dz)); if (!a) continue;
      for (const y of a) { const d = Math.abs(y - (hint == null ? 0 : hint)); if (d < bd) { bd = d; best = y; } }
    }
    return best;
  }
  const paint = [];
  const net = [];
  const PAINT = { lineW: 1, lineY: 1, dashW: 1 };

  function emitWay(r, prof, buckets) {
    const cls = CLASS[r.h] || CLASS.residential;
    const pts = prof ? prof.p : r.p, ys = prof ? prof.ys : null;
    const f = frame(pts, ys);
    if (buckets.major) { noteHeights(pts, ys, cls); net.push({ r, f, ys, cy: cls.y }); }
    else if (buckets.tileNet) buckets.tileNet.push({ r, f, ys, cy: cls.y });
    const w = r.w, hw = w / 2;
    const elevated = ys && ys.some((y) => y > 0.9);
    /* only real OSM bridges stand on piers; approaches sit on earth fill (Houston TxDOT style) */
    const isBridge = !!(r.b || r.y > 0) && elevated;
    const raised = isBridge;
    tmpC.setHex(isBridge ? 0xb2b0a9 : cls.c);
    const yAt = (i) => (baseY + ((ys ? ys[i] : 0) + cls.y) * kv);
    const strip = (bk, lo, hi, dy, uScale, vScale, col) => {
      const b = bk.vc;
      for (let i = 0; i < f.n; i++) {
        const x = f.pts[2 * i], z = f.pts[2 * i + 1], mm = f.m[i], y = yAt(i) + dy * kv;
        bk.vert(X(x + f.nx[i] * lo * mm), y, Z(z + f.nz[i] * lo * mm), 0, 1, 0, lo * uScale, f.cum[i] * vScale, col);
        bk.vert(X(x + f.nx[i] * hi * mm), y, Z(z + f.nz[i] * hi * mm), 0, 1, 0, hi * uScale, f.cum[i] * vScale, col);
        if (i) bk.quad(b + 2 * (i - 1));
      }
    };
    const wall = (bk, off, y0, y1) => {
      const b = bk.vc;
      for (let i = 0; i < f.n; i++) {
        const x = X(f.pts[2 * i] + f.nx[i] * off * f.m[i]), z = Z(f.pts[2 * i + 1] + f.nz[i] * off * f.m[i]), y = yAt(i);
        const sn = Math.sign(off);
        bk.vert(x, y + y0 * kv, z, f.nx[i] * sn, 0, f.nz[i] * sn, f.cum[i] / 6, 0);
        bk.vert(x, y + y1 * kv, z, f.nx[i] * sn, 0, f.nz[i] * sn, f.cum[i] / 6, 1);
        if (i) bk.quad(b + 2 * (i - 1));
      }
    };
    strip(buckets('surface'), -hw, hw, 0, 1 / 7, 1 / 7, tmpC);
    const lanes = r.l, two = !r.o && lanes >= 2 && r.h !== 'residential' && r.h !== 'living_street';
    const lw = 0.15;
    if (cls.edge || elevated) { strip(buckets('lineW'), hw - 0.55 - lw, hw - 0.55, 0.02, 0, 0); strip(buckets(r.o ? 'lineY' : 'lineW'), -hw + 0.55, -hw + 0.55 + lw, 0.02, 0, 0); }
    if (two) {
      strip(buckets('lineY'), -0.22, -0.08, 0.02, 0, 0); strip(buckets('lineY'), 0.08, 0.22, 0.02, 0, 0);
      const per = Math.max(1, Math.floor(lanes / 2)), laneW = (hw - 0.6) / per;
      for (let j = 1; j < per; j++) for (const sg of [-1, 1]) { const o = sg * j * laneW; strip(buckets('dashW'), o - 0.07, o + 0.07, 0.02, 0, 1 / 12); }
    } else if (lanes >= 2) {
      const laneW = (w - 1.2) / lanes;
      for (let j = 1; j < lanes; j++) { const o = -hw + 0.6 + j * laneW; strip(buckets('dashW'), o - 0.07, o + 0.07, 0.02, 0, 1 / 12); }
    }
    if (elevated && !isBridge) {
      const dk = buckets('deck'), bm = buckets('berm');
      wall(dk, hw + 0.25, 0, 0.85); wall(dk, -hw - 0.25, 0, 0.85);
      for (const sg of [1, -1]) {
        const b = bm.vc, off = (hw + 0.25) * sg;
        for (let i = 0; i < f.n; i++) {
          const x = X(f.pts[2 * i] + f.nx[i] * off * f.m[i]), z = Z(f.pts[2 * i + 1] + f.nz[i] * off * f.m[i]), y = yAt(i);
          bm.vert(x, y, z, f.nx[i] * sg, 0, f.nz[i] * sg, f.cum[i] / 6, 0);
          bm.vert(x, baseY, z, f.nx[i] * sg, 0, f.nz[i] * sg, f.cum[i] / 6, 1);
          if (i) bm.quad(b + 2 * (i - 1));
        }
      }
    }
    if (raised) {
      const dk = buckets('deck');
      wall(dk, hw + 0.25, -1.7, 0.9); wall(dk, -hw - 0.25, -1.7, 0.9);
      strip(dk, hw, hw + 0.25, 0.9, 0, 0); strip(dk, -hw - 0.25, -hw, 0.9, 0, 0);
      const un = buckets('under'), b = un.vc;
      for (let i = 0; i < f.n; i++) {
        const x = f.pts[2 * i], z = f.pts[2 * i + 1], mm = f.m[i], y = yAt(i) - 1.7 * kv;
        un.vert(X(x + f.nx[i] * (hw + 0.25) * mm), y, Z(z + f.nz[i] * (hw + 0.25) * mm), 0, -1, 0, 0, 0);
        un.vert(X(x - f.nx[i] * (hw + 0.25) * mm), y, Z(z - f.nz[i] * (hw + 0.25) * mm), 0, -1, 0, 0, 0);
        if (i) un.quad(b + 2 * (i - 1));
      }
      let next = 12;
      for (let i = 0; i < f.n; i++) if (f.cum[i] >= next && ys[i] > 3.2) {
        next = f.cum[i] + 34;
        buckets.piers.push([f.pts[2 * i], f.pts[2 * i + 1], ys[i] + cls.y - 1.7, Math.atan2(f.nx[i], f.nz[i]), w]);
      }
    }
    stats.ways++;
  }

  function makeBucketSet() {
    const map = new Map();
    const get = (chunkKey) => (name) => {
      const key = chunkKey + '|' + name;
      let b = map.get(key); if (!b) { b = new Bucket(name === 'surface'); b.mat = name; map.set(key, b); }
      return b;
    };
    return { map, get, piers: [] };
  }

  function flush(set, group) {
    for (const b of set.map.values()) {
      if (!b.i.length) continue;
      const mesh = new THREE.Mesh(b.geometry(), mats[b.mat]);
      mesh.receiveShadow = b.mat === 'surface' || b.mat === 'deck';
      mesh.castShadow = b.mat === 'deck' || b.mat === 'under';
      mesh.matrixAutoUpdate = false; mesh.updateMatrix();
      if (PAINT[b.mat]) { mesh.userData.paint = true; paint.push(mesh); mesh.visible = false; }
      stats.tris += b.i.length / 3;
      group.add(mesh);
    }
    if (set.piers.length) {
      const P = set.piers.length * 2, im = new THREE.InstancedMesh(pierGeo, mats.pier, P);
      const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), up = new THREE.Vector3(0, 1, 0), s = new THREE.Vector3(), t = new THREE.Vector3();
      let j = 0;
      for (const [x, z, top, ang, w] of set.piers) {
        q.setFromAxisAngle(up, ang);
        const colH = Math.max(0.5, top - 1.2);
        t.set(X(x), baseY, Z(z)); s.set(Math.min(2.2, w * 0.12) * k, colH * kv, 1.7 * k); m4.compose(t, q, s); im.setMatrixAt(j++, m4);
        t.set(X(x), baseY + colH * kv, Z(z)); s.set(w * 0.92 * k, 1.2 * kv, 2.0 * k); m4.compose(t, q, s); im.setMatrixAt(j++, m4);
      }
      im.castShadow = true; im.receiveShadow = true; im.computeBoundingSphere();
      group.add(im);
    }
  }

  async function build(roads, heights, group, tileNet) {
    const set = makeBucketSet();
    let t0 = performance.now();
    for (let i = 0; i < roads.length; i++) {
      const r = roads[i];
      if (!r.p || r.p.length < 4 || r.t) continue;
      const e = heights ? heights.ends[i] : { d: deckH(r) };
      const prof = profile(r, e, heights ? heights.H : null);
      const cx = Math.floor(r.p[0] / CHUNK), cz = Math.floor(r.p[1] / CHUNK);
      const bk = set.get(cx + ',' + cz); bk.piers = set.piers; bk.major = !!heights; bk.tileNet = tileNet;
      emitWay(r, prof, bk);
      if (performance.now() - t0 > slice) { await new Promise((res) => setTimeout(res, 0)); t0 = performance.now(); }
    }
    flush(set, group);
  }

  const majorGroup = new THREE.Group(); root.add(majorGroup);
  const ready = fetch(base + 'roads-major.json').then((r) => r.json()).then(async (d) => {
    await build(d.roads, solveHeights(d.roads), majorGroup);
    return stats;
  });

  const tiles = new Map();
  /* streamed minor/local ways (same frames as the meshes) so traffic can drive every street */
  const tileNets = new Map(), tileListeners = [];
  function onTile(fn) { tileListeners.push(fn); for (const [id, ways] of tileNets) fn('add', id, ways); }
  let index = null;
  const indexReady = fetch(base + 'tiles/index.json').then((r) => r.json()).then((d) => { index = d; index.sets = {}; for (const [kk, v] of Object.entries(d.layers)) index.sets[kk] = new Set(v); }).catch(() => null);
  const RADIUS = { minor: 10000, local: 7200 };
  let busy = false;
  /** Lane paint only near the camera (it is most of the triangles and sub-pixel far away). */
  function lod(camX, camZ, camDist) {
    /* Hide lane paint early — at city overview BasicMat dashes become night glitter */
    const lim = (camDist < 2800 * k ? 1600 : 0) * k;
    for (let i = paint.length - 1; i >= 0; i--) {
      const m = paint[i];
      if (!m.parent) { paint.splice(i, 1); continue; }
      const bs = m.geometry.boundingSphere;
      m.visible = lim > 0 && Math.hypot(bs.center.x - camX, bs.center.z - camZ) < lim + bs.radius;
    }
  }
  /* pinned world points (route corridor): tiles near them are never evicted by camera moves */
  let pins = [];
  update.setPins = (p) => { pins = p || []; };
  async function update(camX, camZ, camDist = 0) {
    lod(camX, camZ, camDist);
    if (!index || busy) return;
    busy = true;
    try {
      const mx = (camX - offset) / k + offset, mz = (camZ - offset) / k + offset, T = index.tile;
      for (const layer of ['local', 'minor']) {
        const R = RADIUS[layer], r = Math.ceil(R / T);
        const tx0 = Math.floor(mx / T), tz0 = Math.floor(mz / T);
        const want = [];
        for (let dz = -r; dz <= r; dz++) for (let dx = -r; dx <= r; dx++) {
          const key = (tx0 + dx) + '_' + (tz0 + dz);
          const d = Math.hypot((tx0 + dx + 0.5) * T - mx, (tz0 + dz + 0.5) * T - mz);
          if (d < R + T * 0.7 && index.sets[layer].has(key) && !tiles.has(layer + key)) want.push([d, key]);
        }
        want.sort((a, b) => a[0] - b[0]);
        /* Load more local tiles near the camera so suburb streets get traffic sooner */
        for (const [, key] of want.slice(0, layer === 'local' ? 7 : 3)) {
          const g = new THREE.Group(); tiles.set(layer + key, { g, layer, key });
          root.add(g);
          const d = await fetch(base + 'tiles/' + layer + '/' + key + '.json').then((x) => x.json()).catch(() => null);
          const tnet = [];
          if (d) await build(d.roads, null, g, tnet);
          if (tiles.has(layer + key)) { tileNets.set(layer + key, tnet); for (const fn of tileListeners) fn('add', layer + key, tnet); }
          stats.tiles++;
        }
        for (const [id, t] of tiles) {
          if (t.layer !== layer) continue;
          const [ax, az] = t.key.split('_').map(Number);
          if (Math.hypot((ax + 0.5) * T - mx, (az + 0.5) * T - mz) > R * 1.6 + T
            && !pins.some(([px, pz]) => Math.hypot((ax + 0.5) * T - ((px - offset) / k + offset), (az + 0.5) * T - ((pz - offset) / k + offset)) < R * 1.2 + T)) {
            t.g.traverse((o) => { if (o.geometry && o.geometry !== pierGeo) o.geometry.dispose(); });
            root.remove(t.g); tiles.delete(id);
            if (tileNets.delete(id)) for (const fn of tileListeners) fn('drop', id);
          }
        }
      }
    } finally { busy = false; }
  }

  return { root, ready, indexReady, update, stats, materials: mats, heightAt, net, onTile };
}
