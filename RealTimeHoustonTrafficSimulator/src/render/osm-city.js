/**
 * Real-world 3D city fabric from OpenStreetMap (Simple 3D Buildings).
 * Footprints sit at their true map position/size; heights use one uniform
 * vertical scale so the skyline keeps real relative proportions.
 * Buildings are merged into a few draw calls per spatial chunk + facade class,
 * built in time slices so loading never freezes camera movement.
 */
import * as THREE from 'three';

const CHUNK = 520;
const GLASS = ['#6f8fae', '#58789a', '#7e98ac', '#4d6680', '#8ea4b4', '#62778a', '#9aa9b4'];
const STONE = ['#c8bca6', '#b6a990', '#d2c8b4', '#a89a84', '#bdb4a4', '#9c958a', '#d8d0c0', '#b39a84', '#8e5446', '#a6aeb3', '#e2ded6', '#7d8790', '#b7704f', '#cfc6b0'];
const LOW = ['#c4b296', '#9a5a44', '#e4ddd0', '#8f8a84', '#b26b4c', '#d9cfb8', '#6f7880', '#a88566', '#c9c3bb', '#7c5b48', '#e8e2d6', '#9fa8ad', '#b8845e', '#5f6a72', '#cdb69a', '#8a4c3c'];
const ROOF = ['#73767b', '#86888b', '#64686e', '#93948f', '#7a746c', '#5b5f63'];

function hash(n) { n = (n ^ 61) ^ (n >>> 16); n = n + (n << 3); n ^= n >>> 4; n = Math.imul(n, 0x27d4eb2d); n ^= n >>> 15; return (n >>> 0) / 4294967296; }

function facadeCanvas(kind, night, bays, floors) {
  const S = 512, c = document.createElement('canvas');
  c.width = c.height = S;
  const x = c.getContext('2d');
  const bw = S / bays, fh = S / floors;
  if (night) { x.fillStyle = '#000'; x.fillRect(0, 0, S, S); }
  else {
    x.fillStyle = kind === 'glass' ? '#c9d3dc' : kind === 'stone' ? '#f1ece2' : '#efe8dc';
    x.fillRect(0, 0, S, S);
  }
  for (let f = 0; f < floors; f++) {
    for (let b = 0; b < bays; b++) {
      const r = hash(f * 97 + b * 13 + (kind === 'glass' ? 7 : kind === 'stone' ? 11 : 3));
      let wx, wy, ww, wh;
      if (kind === 'glass') { wx = b * bw + 2; ww = bw - 4; wy = f * fh + fh * 0.18; wh = fh * 0.78; }
      else if (kind === 'stone') { wx = b * bw + bw * 0.2; ww = bw * 0.6; wy = f * fh + fh * 0.22; wh = fh * 0.58; }
      else { wx = b * bw + bw * 0.26; ww = bw * 0.48; wy = f * fh + fh * 0.28; wh = fh * 0.48; }
      if (night) {
        const litP = kind === 'low' ? 0.26 : 0.4;
        if (r < litP) {
          const warm = hash(f * 31 + b * 7) < 0.78;
          x.fillStyle = warm ? '#f2d18e' : '#bcd4ec';
          x.globalAlpha = 0.45 + hash(f + b * 101) * 0.45;
          x.fillRect(wx, wy, ww, wh);
          x.globalAlpha = 1;
        }
      } else {
        if (kind === 'glass') {
          const g = x.createLinearGradient(0, wy, 0, wy + wh);
          const t = 0.78 + r * 0.22;
          g.addColorStop(0, `rgba(${Math.round(150 * t)},${Math.round(176 * t)},${Math.round(200 * t)},1)`);
          g.addColorStop(1, `rgba(${Math.round(70 * t)},${Math.round(88 * t)},${Math.round(108 * t)},1)`);
          x.fillStyle = g;
        } else {
          x.fillStyle = r < 0.12 ? '#6b737c' : '#434b55';
        }
        x.fillRect(wx, wy, ww, wh);
        if (kind !== 'glass') { x.fillStyle = 'rgba(0,0,0,0.18)'; x.fillRect(wx - 1, wy + wh, ww + 2, 2); }
      }
    }
    if (!night && kind === 'glass') { x.fillStyle = 'rgba(40,52,64,0.55)'; x.fillRect(0, f * fh, S, fh * 0.14); }
  }
  if (!night && kind === 'glass') {
    x.fillStyle = 'rgba(235,242,248,0.5)';
    for (let b = 0; b <= bays; b++) x.fillRect(b * bw - 1, 0, 2, S);
  }
  return c;
}

function tex(canvas, aniso) {
  const t = new THREE.CanvasTexture(canvas);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = aniso || 4;
  t.colorSpace = THREE.SRGBColorSpace;
  t.generateMipmaps = true;
  t.minFilter = THREE.LinearMipmapLinearFilter;
  return t;
}

function makeMaterials(aniso) {
  const spec = { glass: [8, 8], stone: [8, 8], low: [8, 8] };
  const out = {};
  for (const k of Object.keys(spec)) {
    const [bays, floors] = spec[k];
    const map = tex(facadeCanvas(k, false, bays, floors), aniso);
    const em = tex(facadeCanvas(k, true, bays, floors), aniso);
    out[k] = k === 'glass'
      ? new THREE.MeshPhongMaterial({ map, emissiveMap: em, emissive: new THREE.Color(0xe8d4b0), emissiveIntensity: 0,
        vertexColors: true, shininess: 80, specular: 0x6c7c8c })
      : new THREE.MeshLambertMaterial({ map, emissiveMap: em, emissive: new THREE.Color(0xe0c898), emissiveIntensity: 0, vertexColors: true });
    out[k].userData._shin = out[k].shininess;
  }
  out.roof = new THREE.MeshLambertMaterial({ vertexColors: true });
  return out;
}

class Bucket {
  constructor() { this.p = []; this.n = []; this.u = []; this.c = []; this.i = []; this.v = 0; this.tri = []; }
}

const _c = new THREE.Color();
const _box = new THREE.Box3();
const _hit = new THREE.Vector3();

function norm(s) { return String(s || '').toLowerCase().replace(/[^a-z0-9]/g, ''); }

/**
 * @param {object} o
 * @param {string} o.cityId
 * @param {(lat:number,lng:number)=>{x:number,z:number}} o.geoToWorld
 * @param {THREE.Object3D} o.parent
 * @param {number} o.hScale   world units per real metre (vertical)
 * @param {number} o.unitsPerMetre  world units per metre on the ground (for window bay sizing)
 * @param {(x:number,z:number,r:number)=>boolean} [o.blocked]  skip parcels on sim roads / water
 * @param {{x:number,z:number,r:number}[]} [o.skipNear]  hand-modelled landmarks
 * @param {{n:string,d:string,x?:number,z?:number}[]} [o.landmarks]  info cards for real towers
 * @param {number} [o.aniso]
 */
export async function loadOsmCity(o) {
  const url = `/data/cities/${o.cityId}/buildings.json`;
  const r = await fetch(url, { cache: 'force-cache' });
  if (!r.ok) throw new Error('HTTP ' + r.status + ' ' + url);
  const pack = await r.json();
  if (!pack || pack.v !== 2 || !Array.isArray(pack.buildings)) throw new Error('bad pack');
  const [oLat, oLng] = pack.origin, q = pack.q || 1e-5;
  const hs = o.hScale;
  const chunkSz = (o.unitsPerMetre || 0.13) > 0.5 ? CHUNK * 4 : CHUNK;
  const floorW = 3.5 * hs; /* one storey in world units */
  const bayW = Math.max(floorW * 0.85, 3.2 * (o.unitsPerMetre || 0.13)); /* keep windows near real proportion */
  const mats = makeMaterials(o.aniso);
  const buckets = new Map();
  const picks = [];
  const lmByName = new Map();
  for (const L of o.landmarks || []) lmByName.set(norm(L.n), L);
  const skip = o.skipNear || [];
  const geoLm = (o.landmarks || []).filter((L) => Number.isFinite(L.x));
  const lmBest = new Map();

  function bucket(cls, x, z) {
    const k = cls + ':' + Math.floor(x / chunkSz) + ':' + Math.floor(z / chunkSz);
    let b = buckets.get(k);
    if (!b) { b = new Bucket(); b.cls = cls; buckets.set(k, b); }
    return b;
  }
  function ringWorld(arr) {
    const pts = [];
    for (let i = 0; i + 1 < arr.length; i += 2) {
      const w = o.geoToWorld(oLat + arr[i] * q, oLng + arr[i + 1] * q);
      if (!Number.isFinite(w.x) || !Number.isFinite(w.z)) return null;
      const prev = pts[pts.length - 1];
      if (prev && Math.abs(prev.x - w.x) < 1e-4 && Math.abs(prev.y - w.z) < 1e-4) continue;
      pts.push(new THREE.Vector2(w.x, w.z));
    }
    return pts.length >= 3 ? pts : null;
  }
  function area(pts) { let s = 0; for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i + 1) % pts.length]; s += a.x * b.y - b.x * a.y; } return s / 2; }

  function walls(B, pts, outwardSign, y0, y1, rgb, uOff) {
    let acc = uOff;
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i], b = pts[(i + 1) % pts.length];
      const dx = b.x - a.x, dz = b.y - a.y, len = Math.hypot(dx, dz);
      if (len < 1e-3) continue;
      let nx = dz / len * outwardSign, nz = -dx / len * outwardSign;
      const v = B.v;
      B.p.push(a.x, y0, a.y, b.x, y0, b.y, b.x, y1, b.y, a.x, y1, a.y);
      for (let k = 0; k < 4; k++) { B.n.push(nx, 0, nz); B.c.push(rgb[0], rgb[1], rgb[2]); }
      const u0 = acc / (bayW * 8), u1 = (acc + len) / (bayW * 8), v0 = y0 / (floorW * 8), v1 = y1 / (floorW * 8);
      B.u.push(u0, v0, u1, v0, u1, v1, u0, v1);
      /* winding: triangle (a0,b0,b1) faces (-dz,dx) */
      const facesPlain = (-dz * nx + dx * nz) > 0;
      if (facesPlain) B.i.push(v, v + 1, v + 2, v, v + 2, v + 3);
      else B.i.push(v, v + 2, v + 1, v, v + 3, v + 2);
      B.v += 4;
      acc += len;
    }
  }
  function roof(B, outer, holes, y, rgb) {
    let tris;
    try { tris = THREE.ShapeUtils.triangulateShape(outer, holes); } catch { return; }
    const all = outer.concat(...holes);
    const v = B.v;
    for (const p of all) { B.p.push(p.x, y, p.y); B.n.push(0, 1, 0); B.u.push(0, 0); B.c.push(rgb[0], rgb[1], rgb[2]); }
    for (const t of tris) {
      const a = all[t[0]], b = all[t[1]], c = all[t[2]];
      const cy = (b.y - a.y) * (c.x - a.x) - (b.x - a.x) * (c.y - a.y);
      if (cy > 0) B.i.push(v + t[0], v + t[1], v + t[2]); else B.i.push(v + t[0], v + t[2], v + t[1]);
    }
    B.v += all.length;
  }

  /* bases first, so raised parts (min_height > 0) can be checked against something to stand on */
  const list = pack.buildings.slice().sort((a, b) => (a[1] > 0) - (b[1] > 0));
  const baseGrid = new Map(), BG = 60, bgKey = (x, z) => Math.floor(x / BG) + ',' + Math.floor(z / BG);
  const supported = (cx, cz, y0) => {
    const a = baseGrid.get(bgKey(cx, cz)); if (!a) return false;
    for (const b of a) if (cx >= b.minX && cx <= b.maxX && cz >= b.minZ && cz <= b.maxZ && b.y1 >= y0 - 3 * hs) return true;
    return false;
  };
  let built = 0, sliceT = performance.now();
  const rej = { ring: 0, tiny: 0, skip: 0, blocked: 0, area: 0, floating: 0 };
  for (let bi = 0; bi < list.length; bi++) {
    if (performance.now() - sliceT > 22) { await new Promise((res) => setTimeout(res, 0)); sliceT = performance.now(); }
    const [hM, mhM, col, roofCol, name, ringArr, holesArr] = list[bi];
    const outer = ringWorld(ringArr);
    if (!outer) { rej.ring++; continue; }
    let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
    for (const p of outer) { if (p.x < minX) minX = p.x; if (p.x > maxX) maxX = p.x; if (p.y < minZ) minZ = p.y; if (p.y > maxZ) maxZ = p.y; }
    const cx = (minX + maxX) / 2, cz = (minZ + maxZ) / 2, rad = Math.hypot(maxX - minX, maxZ - minZ) / 2;
    if (rad < 0.35) { rej.tiny++; continue; }
    let near = false;
    for (const s of skip) if (Math.hypot(cx - s.x, cz - s.z) < s.r) { near = true; break; }
    if (near) { rej.skip++; continue; }
    if (o.blocked && o.blocked(cx, cz, rad)) { rej.blocked++; continue; }
    const holes = (holesArr || []).map(ringWorld).filter(Boolean);
    const sa = area(outer);
    if (Math.abs(sa) < 0.08) { rej.area++; continue; }
    const y0 = mhM * hs + 0.03, y1 = Math.max(y0 + 0.6, hM * hs);
    if (mhM > 2 && !supported(cx, cz, y0)) { rej.floating++; continue; }
    if (mhM <= 2) { for (let gx = Math.floor(minX / BG); gx <= Math.floor(maxX / BG); gx++) for (let gz = Math.floor(minZ / BG); gz <= Math.floor(maxZ / BG); gz++) { const kk = gx + ',' + gz; let a = baseGrid.get(kk); if (!a) baseGrid.set(kk, (a = [])); a.push({ minX, maxX, minZ, maxZ, y1 }); } }
    const seed = (ringArr[0] * 7919 + ringArr[1] * 104729) | 0;
    const rv = hash(seed);
    const cls = hM >= 45 ? 'glass' : hM >= 13 ? 'stone' : 'low';
    const pal = cls === 'glass' ? GLASS : cls === 'stone' ? STONE : LOW;
    _c.set(col || pal[Math.floor(rv * pal.length)]);
    if (col) _c.lerp(new THREE.Color(pal[Math.floor(rv * pal.length)]), 0.25);
    _c.offsetHSL((hash(seed + 5) - 0.5) * 0.04, (hash(seed + 6) - 0.5) * 0.12, (hash(seed + 7) - 0.5) * 0.1);
    const k = 0.9 + hash(seed + 1) * 0.2;
    const wall = [_c.r * k, _c.g * k, _c.b * k];
    _c.set(roofCol || ROOF[Math.floor(hash(seed + 2) * ROOF.length)]);
    const rc = [_c.r, _c.g, _c.b];
    const B = bucket(cls, cx, cz);
    const outSign = sa > 0 ? 1 : -1;
    const uOff = Math.floor(hash(seed + 3) * 8) * bayW;
    walls(B, outer, outSign, y0, y1, wall, uOff);
    for (const h of holes) walls(B, h, area(h) > 0 ? -1 : 1, y0, y1, wall, uOff);
    const R = bucket('roof', cx, cz);
    roof(R, outer, holes, y1, rc);
    built++;
    const pk = { minX, maxX, minZ, maxZ, y0, y1, hM, name: name || '', cx, cz, info: null };
    if (name) { const L = lmByName.get(norm(name)); if (L) pk.info = { n: L.n, d: L.d }; }
    for (const L of geoLm) {
      if (Math.hypot(cx - L.x, cz - L.z) > 28) continue;
      const cur = lmBest.get(L);
      if (!cur || pk.hM > cur.hM) lmBest.set(L, pk);
    }
    if (hM >= 9 || name) picks.push(pk);
  }
  for (const [L, pk] of lmBest) if (!pk.info) pk.info = { n: L.n, d: L.d };

  const group = new THREE.Group();
  group.name = 'osm-city';
  const chunks = [];
  for (const B of buckets.values()) {
    if (!B.v) continue;
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(B.p, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(B.n, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(B.u, 2));
    g.setAttribute('color', new THREE.Float32BufferAttribute(B.c, 3));
    g.setIndex(B.v > 65535 ? new THREE.Uint32BufferAttribute(B.i, 1) : new THREE.Uint16BufferAttribute(B.i, 1));
    g.computeBoundingSphere();
    const m = new THREE.Mesh(g, mats[B.cls]);
    m.matrixAutoUpdate = false;
    m.castShadow = B.cls === 'glass' || B.cls === 'stone';
    m.receiveShadow = true;
    m.userData.cls = B.cls;
    group.add(m);
    chunks.push(m);
  }
  o.parent.add(group);

  const LOD = { glass: Infinity, stone: 11000, low: 5200, roof: 11000 };
  function update(camera) {
    const px = camera.position.x, pz = camera.position.z, py = Math.max(0, camera.position.y);
    for (const m of chunks) {
      const s = m.geometry.boundingSphere;
      const d = Math.hypot(s.center.x - px, s.center.z - pz, py * 0.6) - s.radius;
      m.visible = d < LOD[m.userData.cls];
    }
  }
  const _rayLocal = new THREE.Ray();
  /** Nearest building hit by a world-space ray (cheap AABB test, no triangle raycast). */
  function pick(ray) {
    _rayLocal.copy(ray);
    let best = null, bestD = Infinity;
    for (const p of picks) {
      _box.min.set(p.minX, p.y0, p.minZ); _box.max.set(p.maxX, p.y1, p.maxZ);
      if (!_rayLocal.intersectBox(_box, _hit)) continue;
      const d = _hit.distanceToSquared(ray.origin);
      if (d < bestD) { bestD = d; best = p; }
    }
    return best ? { b: best, distance: Math.sqrt(bestD) } : null;
  }
  const facadeMats = [mats.glass, mats.stone, mats.low];
  return { group, count: built, rejected: rej, chunks, update, pick, facadeMats, roofMat: mats.roof, attribution: pack.attribution };
}
