/**
 * Lightweight world city: OSM roads, rail, water, sea, parks, airport and core buildings,
 * lit by the city's real sun position and its live Open-Meteo weather. Units: metres.
 */
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { loadOsmCity } from '../render/osm-city.js';
import { subSolar, llToVec } from './globe.js';

const D2R = Math.PI / 180;
const DRY = new Set(['cairo', 'dubai', 'delhi', 'mexicocity', 'guadalajara', 'losangeles', 'madrid', 'sanantonio', 'austin', 'dallas']);
const RIGHT_HAND_CENTRE_YELLOW = new Set(['United States', 'Canada', 'Mexico']);

export function localGeo(lat0, lng0) {
  const kx = 111320 * Math.cos(lat0 * D2R), kz = 110574;
  return {
    toW: (lat, lng) => ({ x: (lng - lng0) * kx, z: -(lat - lat0) * kz }),
    toG: (x, z) => ({ lat: lat0 - z / kz, lng: lng0 + x / kx }),
    kx, kz,
  };
}

/** Delta / absolute quantized ints → [x0,z0,x1,z1…] metres. */
function dec(arr, delta, q, kx, kz) {
  const out = new Float32Array(arr.length);
  let a = 0, b = 0;
  for (let i = 0; i + 1 < arr.length; i += 2) {
    if (delta) { a += arr[i]; b += arr[i + 1]; } else { a = arr[i]; b = arr[i + 1]; }
    out[i] = b * q * kx; out[i + 1] = -a * q * kz;
  }
  return out;
}

class Strip {
  constructor() { this.p = []; this.u = []; this.i = []; this.n = 0; }
  /** Ribbon along a polyline. off = lateral offset (+ right of travel). */
  add(pts, width, y, off = 0, uScale = 0) {
    const m = pts.length / 2; if (m < 2) return;
    const hw = width / 2; let dist = 0; const base = this.n;
    for (let k = 0; k < m; k++) {
      const x = pts[k * 2], z = pts[k * 2 + 1];
      const pk = Math.max(0, k - 1), nk = Math.min(m - 1, k + 1);
      let dx = pts[nk * 2] - pts[pk * 2], dz = pts[nk * 2 + 1] - pts[pk * 2 + 1];
      const L = Math.hypot(dx, dz) || 1; dx /= L; dz /= L;
      let nx = -dz, nz = dx; /* left normal */
      if (k > 0 && k < m - 1) { /* miter */
        let ax = x - pts[pk * 2], az = z - pts[pk * 2 + 1]; const la = Math.hypot(ax, az) || 1; ax /= la; az /= la;
        const mx = -az, mz = ax; const c = mx * nx + mz * nz;
        const s = 1 / Math.max(0.5, (1 + c) / 2) ** 0.5; nx = (nx + mx); nz = (nz + mz); const ln = Math.hypot(nx, nz) || 1; nx = nx / ln * Math.min(s, 2); nz = nz / ln * Math.min(s, 2);
      }
      if (k > 0) dist += Math.hypot(x - pts[(k - 1) * 2], z - pts[(k - 1) * 2 + 1]);
      const cx = x - nx * off, cz = z - nz * off;
      this.p.push(cx + nx * hw, y, cz + nz * hw, cx - nx * hw, y, cz - nz * hw);
      const u = uScale ? dist / uScale : 0; this.u.push(u, 0, u, 1);
      if (k > 0) { const a = base + (k - 1) * 2; this.i.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
    }
    this.n += m * 2;
  }
  mesh(mat) {
    if (!this.n) return null;
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(this.p, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(this.u, 2));
    const nrm = new Float32Array(this.n * 3); for (let i = 1; i < nrm.length; i += 3) nrm[i] = 1;
    g.setAttribute('normal', new THREE.BufferAttribute(nrm, 3));
    g.setIndex(this.n > 65535 ? new THREE.Uint32BufferAttribute(this.i, 1) : new THREE.Uint16BufferAttribute(this.i, 1));
    g.computeBoundingSphere();
    const m = new THREE.Mesh(g, mat); m.matrixAutoUpdate = false; m.receiveShadow = true;
    return m;
  }
}

function shapeOf(rings, delta, q, kx, kz) {
  const mk = (arr) => { const f = dec(arr, delta, q, kx, kz); const v = []; for (let i = 0; i < f.length; i += 2) v.push(new THREE.Vector2(f[i], -f[i + 1])); return v; };
  const s = new THREE.Shape(mk(rings[0]));
  for (let i = 1; i < rings.length; i++) s.holes.push(new THREE.Path(mk(rings[i])));
  return s;
}
function polyMesh(list, mat, y, delta, q, kx, kz) {
  if (!list.length) return null;
  const shapes = [];
  for (const r of list) { try { shapes.push(shapeOf(r, delta, q, kx, kz)); } catch (e) { /* bad ring */ } }
  const g = new THREE.ShapeGeometry(shapes, 1); g.rotateX(-Math.PI / 2); g.translate(0, y, 0);
  g.computeBoundingSphere();
  const m = new THREE.Mesh(g, mat); m.matrixAutoUpdate = false; m.receiveShadow = true; return m;
}
function flatMat(color, layer, extra) {
  return new THREE.MeshLambertMaterial(Object.assign({ color, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -layer, polygonOffsetUnits: -layer * 4 }, extra || {}));
}
function dashTex() {
  const c = document.createElement('canvas'); c.width = 64; c.height = 4;
  const g = c.getContext('2d'); g.fillStyle = '#000'; g.fillRect(0, 0, 64, 4); g.fillStyle = '#fff'; g.fillRect(0, 0, 26, 4);
  const t = new THREE.CanvasTexture(c); t.wrapS = THREE.RepeatWrapping; return t;
}
function groundTex(dry) {
  /* farmland / grass patchwork like the view from a plane window: fields of greens with a few harvested tans, hedge lines */
  const c = document.createElement('canvas'); c.width = c.height = 512; const g = c.getContext('2d');
  const F = dry ? ['#6f7d4c', '#7d8a55', '#8a8a5c', '#5f7444', '#9a8f66', '#6b7f4a'] : ['#4f7a3a', '#5d8a40', '#46703a', '#6a9147', '#3f6a34', '#7a9a52', '#8e8a5e'];
  g.fillStyle = F[0]; g.fillRect(0, 0, 512, 512);
  for (let y = 0; y < 512;) { const h = 40 + Math.random() * 70 | 0; for (let x = 0; x < 512;) { const w = 40 + Math.random() * 90 | 0; g.fillStyle = F[Math.random() * F.length | 0]; g.fillRect(x, y, w, h); x += w; } y += h; }
  /* soft field edges (no dark crack lines) and small, faint tree clumps */
  g.strokeStyle = 'rgba(60,80,44,.18)'; g.lineWidth = 1;
  for (let y = 0; y < 512; y += 64) { g.beginPath(); g.moveTo(0, y); g.lineTo(512, y); g.stroke(); }
  for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(52,78,40,${0.12 + Math.random() * 0.12})`; g.beginPath(); g.arc(Math.random() * 512, Math.random() * 512, 2 + Math.random() * 5, 0, 7); g.fill(); }
  for (let i = 0; i < 3000; i++) { const l = Math.random(); g.fillStyle = `rgba(${l > 0.5 ? '240,250,220' : '20,34,14'},${0.03 + Math.random() * 0.05})`; g.fillRect(Math.random() * 512, Math.random() * 512, 1 + Math.random() * 4, 1 + Math.random() * 4); }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(60, 60); t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
function cloudSpriteTex() {
  const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d');
  for (let i = 0; i < 14; i++) {
    const x = 30 + Math.random() * 68, y = 44 + Math.random() * 40, r = 18 + Math.random() * 26;
    const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(255,255,255,0.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
  }
  return new THREE.CanvasTexture(c);
}

/** Simple airliner for the live-traffic layer (≈ 40 m). */
export function trafficPlaneGeometry() {
  const parts = [];
  const fus = new THREE.CylinderGeometry(2, 2, 38, 10); fus.rotateX(Math.PI / 2); parts.push(fus);
  const nose = new THREE.SphereGeometry(2, 10, 8); nose.scale(1, 1, 2.2); nose.translate(0, 0, -19); parts.push(nose);
  const wing = new THREE.BoxGeometry(36, 0.6, 6); wing.translate(0, -0.6, 1); parts.push(wing);
  const stab = new THREE.BoxGeometry(13, 0.4, 3.2); stab.translate(0, 0.6, 17); parts.push(stab);
  const fin = new THREE.BoxGeometry(0.5, 7, 4.5); fin.translate(0, 4.2, 17); parts.push(fin);
  let p = 0, idx = 0; const pos = [], ind = [];
  for (const g of parts) { const gi = g.toNonIndexed(); const a = gi.attributes.position.array; for (let i = 0; i < a.length; i++) pos.push(a[i]); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.computeVertexNormals();
  void p; void idx; void ind;
  return g;
}

export async function createCityScene({ city, renderer, mobile, onProgress }) {
  const scene = new THREE.Scene();
  const geo = localGeo(city.lat, city.lng);
  const camera = new THREE.PerspectiveCamera(55, 1, 2, 90000);
  let r = await fetch(`/data/world/${city.id}.json?r=1`, { cache: 'force-cache' }).catch(() => null);
  /* a stale cached 404 / offline miss: go to the network once before giving up */
  if (!r || !r.ok) r = await fetch(`/data/world/${city.id}.json?r=${Date.now()}`, { cache: 'reload' });
  if (!r.ok) throw new Error('city data ' + r.status);
  const P = await r.json();
  onProgress && onProgress(0.35);
  const q = P.q || 1e-5, dl = !!P.d, kx = geo.kx, kz = geo.kz;
  const dry = DRY.has(city.id);
  /* sky dome */
  const skyU = { top: { value: new THREE.Color() }, hor: { value: new THREE.Color() }, sunV: { value: new THREE.Vector3(0, 1, 0) }, glow: { value: new THREE.Color() } };
  const sky = new THREE.Mesh(new THREE.SphereGeometry(80000, 32, 16), new THREE.ShaderMaterial({
    uniforms: skyU, side: THREE.BackSide, depthWrite: false, fog: false,
    vertexShader: 'varying vec3 vD; void main(){ vD=normalize(position); vec4 p=modelViewMatrix*vec4(position,1.0); gl_Position=projectionMatrix*p; gl_Position.z=gl_Position.w*0.9999; }',
    fragmentShader: `uniform vec3 top; uniform vec3 hor; uniform vec3 sunV; uniform vec3 glow; varying vec3 vD;
      void main(){ float h=clamp(vD.y,0.0,1.0); vec3 c=mix(hor,top,pow(h,0.55)); float s=max(dot(normalize(vD),sunV),0.0);
        c+=glow*pow(s,9.0)*0.55+vec3(1.0,0.95,0.85)*pow(s,900.0)*2.5; if(vD.y<0.0)c=hor*0.85; gl_FragColor=vec4(c,1.0);
        #include <colorspace_fragment>
      }`,
  }));
  sky.frustumCulled = false; scene.add(sky);
  scene.fog = new THREE.Fog(0xbfd2e6, 4000, 38000);
  const hemi = new THREE.HemisphereLight(0xcfe2ff, 0x5a5444, 1.1); scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xffffff, 2.4); scene.add(sun); scene.add(sun.target);
  /* ground + layers */
  /* subdivided: one 90 km quad gives imprecise depth near the camera, so it covered roads and the car's tyres */
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(90000, 90000, 96, 96), new THREE.MeshLambertMaterial({ map: Object.assign(groundTex(dry), { anisotropy: Math.min(8, renderer.capabilities.getMaxAnisotropy()) }), polygonOffset: true, polygonOffsetFactor: 2, polygonOffsetUnits: 8 }));
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
  const waterMat = flatMat(0x2f5f7a, 2, { emissive: 0x05121c });
  const add = (m) => { if (m) scene.add(m); return m; };
  add(polyMesh(P.sea || [], waterMat, 0.1, dl, q, kx, kz));
  add(polyMesh((P.water || []).filter((w) => w[0] !== 'line'), waterMat, 0.15, dl, q, kx, kz));
  const parks = { park: [], wood: [], sand: [] };
  for (const p of P.parks || []) (parks[p[0]] || parks.park).push(p.slice(1));
  add(polyMesh(parks.park, flatMat(dry ? 0x7f8a5a : 0x5f7f48, 1), 0.08, dl, q, kx, kz));
  add(polyMesh(parks.wood, flatMat(0x46623a, 1), 0.08, dl, q, kx, kz));
  add(polyMesh(parks.sand, flatMat(0xcfc29c, 0), 0.06, dl, q, kx, kz)); /* beaches under parks: no fighting stripes */
  add(polyMesh(P.aprons || [], flatMat(0x7a7d80, 3), 0.2, dl, q, kx, kz));
  onProgress && onProgress(0.5);
  const rivers = new Strip();
  for (const w of P.water || []) if (w[0] === 'line') rivers.add(dec(w[2], dl, q, kx, kz), w[1], 0.15);
  add(rivers.mesh(waterMat));
  /* roads */
  const W = [24, 19, 14, 12, 10, 7.5];
  const sMaj = new Strip(), sArt = new Strip(), sMin = new Strip(), sDash = new Strip(), sEdge = new Strip(), sRail = new Strip();
  const yellow = RIGHT_HAND_CENTRE_YELLOW.has(city.country);
  const graph = [];
  for (const rd of P.roads || []) {
    const [cls, bridge, oneway, name, arr] = rd;
    const pts = dec(arr, dl, q, kx, kz);
    const y = 0.3 + (5 - cls) * 0.04 + (bridge ? 0.06 : 0);
    (cls <= 1 ? sMaj : cls <= 3 ? sArt : sMin).add(pts, W[cls], y);
    if (cls >= 2 && cls <= 4 && !oneway) sDash.add(pts, 0.3, y + 0.03, 0, 12);
    if (cls <= 1) { sEdge.add(pts, 0.3, y + 0.03, W[cls] / 2 - 1); sEdge.add(pts, 0.3, y + 0.03, -W[cls] / 2 + 1); }
    graph.push({ cls, oneway: !!oneway, name, pts });
  }
  for (const a of P.rail || []) sRail.add(dec(a, dl, q, kx, kz), 4, 0.26);
  /* suburbs like Houston: houses along residential streets outside the OSM building core, street trees */
  {
    const coreM = (P.core || 2.3) * 1000 * 0.98, maxR = 7000, aptW = geo.toW(city.apt.lat, city.apt.lng);
    const cell = 12, occ = new Set(), key = (x, z) => Math.floor(x / cell) + ',' + Math.floor(z / cell);
    for (const g of graph) { const p = g.pts; for (let i = 0; i + 3 < p.length; i += 2) { const x0 = p[i], z0 = p[i + 1], x1 = p[i + 2], z1 = p[i + 3], L = Math.hypot(x1 - x0, z1 - z0), n = Math.ceil(L / 8); for (let k = 0; k <= n; k++) { const t = k / n; occ.add(key(x0 + (x1 - x0) * t, z0 + (z1 - z0) * t)); } } }
    const near = (x, z) => { const cx = Math.floor(x / cell), cz = Math.floor(z / cell); for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) if (occ.has((cx + a) + ',' + (cz + b))) return true; return false; };
    const MAXH = mobile ? 6000 : 15000, H = [], T = [];
    let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (const g of graph) {
      if (g.cls !== 5 || H.length >= MAXH) continue;
      const p = g.pts; let carry = 6;
      for (let i = 0; i + 3 < p.length && H.length < MAXH; i += 2) {
        const x0 = p[i], z0 = p[i + 1], dx = p[i + 2] - x0, dz = p[i + 3] - z0, L = Math.hypot(dx, dz); if (L < 1) continue;
        const ux = dx / L, uz = dz / L, nx = -uz, nz = ux;
        for (let d = carry; d < L; d += 21 + rnd() * 6) {
          for (const sd of [1, -1]) {
            const off = W[5] / 2 + 10 + rnd() * 3, x = x0 + ux * d + nx * off * sd, z = z0 + uz * d + nz * off * sd;
            if (Math.abs(x) < coreM && Math.abs(z) < coreM) continue;
            if (Math.hypot(x, z) > maxR || Math.hypot(x - aptW.x, z - aptW.z) < 3800 || near(x, z)) continue;
            H.push([x, z, Math.atan2(ux, uz), rnd()]);
            if (rnd() < 0.5) T.push([x0 + ux * (d + 9) + nx * (W[5] / 2 + 2.5) * sd, z0 + uz * (d + 9) + nz * (W[5] / 2 + 2.5) * sd, rnd()]);
          }
          carry = d;
        }
        carry = Math.max(0, carry - L);
      }
    }
    if (H.length) {
      const body = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), houseMat, H.length);
      const roof = new THREE.InstancedMesh(new THREE.ConeGeometry(0.75, 1, 4, 1).rotateY(Math.PI / 4), roofMat, H.length);
      const m = new THREE.Matrix4(), qq = new THREE.Quaternion(), e = new THREE.Euler(), sc = new THREE.Vector3(), ps = new THREE.Vector3(), col = new THREE.Color();
      const WALLS = dry ? [0xe2d3b4, 0xd8c39a, 0xeee6d6, 0xc9a77c, 0xf1ece2] : [0xe9e4da, 0xcfc6b8, 0xb9a48c, 0xd8d2c4, 0x9c7c64, 0xeae7e0];
      const ROOFS = dry ? [0xa65a3a, 0x8f4a32, 0xb7714c] : [0x4a4d52, 0x5a4234, 0x3c3f45, 0x6b4a3a];
      H.forEach(([x, z, h, r], i) => {
        const w = 10 + r * 6, dd = 9 + ((r * 7) % 1) * 5, ht = 4.2 + ((r * 13) % 1) * 3.2;
        e.set(0, h, 0); qq.setFromEuler(e);
        m.compose(ps.set(x, ht / 2, z), qq, sc.set(w, ht, dd)); body.setMatrixAt(i, m); body.setColorAt(i, col.setHex(WALLS[(r * 97 | 0) % WALLS.length]));
        m.compose(ps.set(x, ht + 1.5, z), qq, sc.set(w * 1.06, 3, dd * 1.06)); roof.setMatrixAt(i, m); roof.setColorAt(i, col.setHex(ROOFS[(r * 53 | 0) % ROOFS.length]));
      });
      body.computeBoundingSphere(); roof.computeBoundingSphere(); scene.add(body, roof);
    }
    if (T.length) {
      const trees = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 1), treeMat, T.length);
      const m = new THREE.Matrix4(), col = new THREE.Color();
      T.forEach(([x, z, r], i) => { const s2 = 3 + r * 2.5; m.makeScale(s2, s2 * 1.15, s2); m.setPosition(x, s2 * 1.3, z); trees.setMatrixAt(i, m); trees.setColorAt(i, col.setHSL(dry ? 0.2 : 0.27, 0.35, 0.22 + r * 0.1)); });
      trees.computeBoundingSphere(); scene.add(trees);
    }
    houseCount = H.length;
  }
  const roadMats = [flatMat(0x6a6c70, 6, { emissive: 0 }), flatMat(0x737579, 5, { emissive: 0 }), flatMat(0x7c7e82, 4, { emissive: 0 })];
  add(sMaj.mesh(roadMats[0])); add(sArt.mesh(roadMats[1])); add(sMin.mesh(roadMats[2]));
  add(sRail.mesh(flatMat(0x5a4f45, 3)));
  add(sDash.mesh(flatMat(yellow ? 0xd8b23a : 0xe8e8e0, 8, { alphaMap: dashTex(), transparent: true, alphaTest: 0.5 })));
  add(sEdge.mesh(flatMat(0xdedbd2, 8)));
  onProgress && onProgress(0.65);
  /* airport */
  const sRwy = new Strip(), sRwyMk = new Strip(), sTwy = new Strip(), sTwyLn = new Strip();
  const sRwySh = new Strip(), sKeys = new Strip();
  for (const [w, , arr] of P.runways || []) {
    const pts = dec(arr, dl, q, kx, kz);
    sRwy.add(pts, w, 0.5);
    sRwySh.add(pts, w + 16, 0.46);
    /* threshold piano keys + touchdown bars at both ends */
    const n = pts.length / 2;
    if (n >= 2) for (const [i0, i1] of [[0, 1], [n - 1, n - 2]]) {
      const x0 = pts[i0 * 2], z0 = pts[i0 * 2 + 1]; let dx = pts[i1 * 2] - x0, dz = pts[i1 * 2 + 1] - z0; const L = Math.hypot(dx, dz) || 1; dx /= L; dz /= L;
      const seg = (a, b) => [x0 + dx * a, z0 + dz * a, x0 + dx * b, z0 + dz * b];
      const keys = Math.max(4, Math.min(16, Math.round(w / 3.6)));
      for (let k = 0; k < keys; k++) sKeys.add(seg(8, 8 + Math.min(45, L * 0.05)), 1.8, 0.56, (k - (keys - 1) / 2) * (w - 6) / keys);
      if (L > 700) for (const d of [300, 450, 600]) for (const sg of [-1, 1]) sKeys.add(seg(d, d + 22), 3, 0.56, sg * w * 0.25);
    } sRwyMk.add(pts, 0.9, 0.55, 0, 60);
    sRwyMk.add(pts, 0.9, 0.55, w / 2 - 1.5); sRwyMk.add(pts, 0.9, 0.55, -w / 2 + 1.5);
  }
  for (const [w, , arr] of P.taxiways || []) { const pts = dec(arr, dl, q, kx, kz); sTwy.add(pts, Math.min(w, 25), 0.42); sTwyLn.add(pts, 0.35, 0.47); }
  add(sRwySh.mesh(flatMat(0x5b5e60, 4))); add(sTwy.mesh(flatMat(0x43464a, 5))); add(sRwy.mesh(flatMat(0x2c2e31, 7))); add(sKeys.mesh(flatMat(0xf2f2ee, 9)));
  add(sTwyLn.mesh(flatMat(0xd9b53c, 9)));
  add(sRwyMk.mesh(flatMat(0xf2f2ee, 9, { alphaMap: dashTex(), transparent: true, alphaTest: 0.5 })));
  if ((P.aptBuildings || []).length) {
    const shapes = []; const geoms = [];
    for (const [h, ring] of P.aptBuildings) {
      try { const s = shapeOf([ring], dl, q, kx, kz); const g = new THREE.ExtrudeGeometry(s, { depth: Math.min(h, 22), bevelEnabled: false }); g.rotateX(-Math.PI / 2); geoms.push(g); } catch (e) { /* skip */ }
    }
    void shapes;
    const merged = geoms.length ? mergeGeometries(geoms, true) : null;
    for (const g of geoms) g.dispose();
    if (merged) { const m = new THREE.Mesh(merged, aptBldMat); m.matrixAutoUpdate = false; m.castShadow = true; scene.add(m); }
  }
  /* buildings (shared OSM renderer) */
  let osm = null;
  if (!city.full) {
    try {
      osm = await loadOsmCity({ cityId: city.id, geoToWorld: geo.toW, parent: scene, hScale: 1, unitsPerMetre: 1, aniso: mobile ? 2 : 4 });
    } catch (e) { console.warn('[world] buildings', city.id, e); }
  }
  onProgress && onProgress(0.9);
  /* clouds */
  const cloudTex = cloudSpriteTex();
  const cloudGroup = new THREE.Group(); scene.add(cloudGroup);
  function setClouds(cover) {
    while (cloudGroup.children.length) { const s = cloudGroup.children.pop(); s.material.dispose(); }
    const n = Math.round((cover / 100) * (mobile ? 40 : 80));
    for (let i = 0; i < n; i++) {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: cloudTex, transparent: true, depthWrite: false, opacity: 0.75, fog: true }));
      const sc = 900 + Math.random() * 1600; s.scale.set(sc, sc * 0.55, 1);
      s.position.set((Math.random() - 0.5) * 36000, 1300 + Math.random() * 1200, (Math.random() - 0.5) * 36000);
      cloudGroup.add(s);
    }
  }
  /* rain */
  const RN = mobile ? 1500 : 4000; const rainPos = new Float32Array(RN * 6);
  const rainGeo = new THREE.BufferGeometry(); rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));
  const rain = new THREE.LineSegments(rainGeo, new THREE.LineBasicMaterial({ color: 0xaabbcc, transparent: true, opacity: 0.45 }));
  rain.frustumCulled = false; rain.visible = false; scene.add(rain);
  for (let i = 0; i < RN; i++) { rainPos[i * 6 + 1] = Math.random() * 400; }
  /* live traffic */
  const MAXT = 160;
  const tMesh = new THREE.InstancedMesh(trafficPlaneGeometry(), new THREE.MeshLambertMaterial({ color: 0xf4f6f8 }), MAXT);
  tMesh.count = 0; tMesh.frustumCulled = false; scene.add(tMesh);
  let traffic = [];
  const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _p = new THREE.Vector3(), _s = new THREE.Vector3(1, 1, 1);
  function setTraffic(list) {
    const now = performance.now();
    traffic = list.slice(0, MAXT).map((f) => { const w = geo.toW(f.lat, f.lng); return Object.assign({}, f, { x: w.x, z: w.z, t0: now }); });
  }
  let weather = null;
  function setWeather(w) { weather = w; setClouds(w ? w.cloud || 0 : 20); }
  setWeather(null);
  /* sun / sky */
  const up = new THREE.Vector3(), east = new THREE.Vector3(), north = new THREE.Vector3(), sv = new THREE.Vector3();
  llToVec(city.lat, city.lng, 1, up); east.set(-Math.sin(city.lng * D2R), 0, -Math.cos(city.lng * D2R)); north.crossVectors(up, east).normalize();
  const C = (h) => new THREE.Color(h);
  const DAY_T = C(0x3d7fd6), DAY_H = C(0xbcd6ee), SET_T = C(0x2b3f73), SET_H = C(0xf0a464), NIGHT_T = C(0x02050d), NIGHT_H = C(0x0d1626), GREY = C(0x8a939c);
  let nightK = 0;
  function sky_(date) {
    const s = subSolar(date); llToVec(s.lat, s.lng, 1, sv);
    const lx = sv.dot(east), ly = sv.dot(up), lz = -sv.dot(north);
    const el = Math.asin(THREE.MathUtils.clamp(ly, -1, 1)) / D2R;
    skyU.sunV.value.set(lx, ly, lz).normalize();
    sun.position.set(lx, Math.max(0.05, ly), lz).multiplyScalar(8000); sun.target.position.set(0, 0, 0);
    const day = THREE.MathUtils.smoothstep(el, -6, 8), dusk = THREE.MathUtils.clamp(1 - Math.abs(el - 1) / 10, 0, 1);
    const cover = weather ? (weather.cloud || 0) / 100 : 0.2;
    const top = NIGHT_T.clone().lerp(DAY_T, day).lerp(SET_T, dusk * 0.5).lerp(GREY, cover * 0.55 * day);
    const hor = NIGHT_H.clone().lerp(DAY_H, day).lerp(SET_H, dusk * 0.7).lerp(GREY, cover * 0.5 * day);
    skyU.top.value.copy(top); skyU.hor.value.copy(hor); skyU.glow.value.set(1, 0.75, 0.45).multiplyScalar(0.3 + dusk);
    scene.fog.color.copy(hor);
    const foggy = weather && (weather.code === 45 || weather.code === 48);
    scene.fog.near = foggy ? 200 : 4000 - cover * 1500; scene.fog.far = foggy ? 3500 : 38000 - cover * 12000;
    sun.intensity = 2.6 * day * (1 - cover * 0.55);
    sun.color.setHSL(0.1, 0.6 * dusk, 0.9);
    hemi.intensity = 0.55 + 0.65 * day; /* moonlit floor so night cities still read */
    hemi.color.setRGB(0.55 + 0.26 * day, 0.62 + 0.27 * day, 0.85 + 0.15 * day);
    if (osm) { for (const m of osm.facadeMats) m.emissiveIntensity = 0.95 * (1 - day); }
    nightK = 1 - day;
    houseMat.emissive.setRGB(0.16 * nightK, 0.11 * nightK, 0.05 * nightK); /* porch / window glow */
    for (const m of roadMats) m.emissive.setRGB(0.05 * nightK, 0.042 * nightK, 0.025 * nightK); /* sodium streetlight wash */
    for (const s of cloudGroup.children) s.material.color.copy(hor).lerp(C(0xffffff), day * 0.6);
    return { el, day };
  }
  /* 'live' = real local sun; 'day' / 'night' preview the city at local solar noon / midnight */
  let look = 'live';
  function lookDate() {
    if (look === 'live') return new Date();
    const now = new Date(), solarH = (now.getUTCHours() + now.getUTCMinutes() / 60 + city.lng / 15 + 48) % 24;
    const want = look === 'day' ? 12.5 : 0.5;
    return new Date(now.getTime() + (((want - solarH) % 24) + 24) % 24 * 3600e3);
  }
  function setLook(m) { look = m === 'day' || m === 'night' ? m : 'live'; skyT = 0; }
  let skyT = 0, sunInfo = sky_(new Date());
  function update(dt, cam) {
    skyT -= dt; if (skyT <= 0) { skyT = 5; sunInfo = sky_(lookDate()); }
    sky.position.copy(cam.position);
    if (osm) osm.update(cam);
    const wind = weather ? weather.wind || 3 : 3, wd = ((weather ? weather.windDir || 0 : 0) + 180) * D2R;
    const vx = Math.sin(wd) * wind * 0.28, vz = -Math.cos(wd) * wind * 0.28;
    for (const s of cloudGroup.children) {
      s.position.x += vx * dt * 3; s.position.z += vz * dt * 3;
      if (s.position.x > 18000) s.position.x -= 36000; if (s.position.x < -18000) s.position.x += 36000;
      if (s.position.z > 18000) s.position.z -= 36000; if (s.position.z < -18000) s.position.z += 36000;
    }
    const wet = weather && (weather.precip > 0 || [51, 53, 55, 61, 63, 65, 80, 81, 82, 95, 96, 99].includes(weather.code));
    rain.visible = !!wet && cam.position.y < 1500;
    if (rain.visible) {
      const cx = cam.position.x, cy = cam.position.y, cz = cam.position.z;
      for (let i = 0; i < RN; i++) {
        const o = i * 6; let y = rainPos[o + 1] - dt * 60;
        if (y < cy - 200 || Math.abs(rainPos[o] - cx) > 220 || Math.abs(rainPos[o + 2] - cz) > 220) {
          rainPos[o] = cx + (Math.random() - 0.5) * 440; rainPos[o + 2] = cz + (Math.random() - 0.5) * 440; y = cy + 200 * Math.random();
        }
        rainPos[o + 1] = y; rainPos[o + 3] = rainPos[o] + vx * 0.1; rainPos[o + 4] = y - 3; rainPos[o + 5] = rainPos[o + 2] + vz * 0.1;
      }
      rainGeo.attributes.position.needsUpdate = true;
    }
    const now = performance.now();
    let n = 0;
    for (const f of traffic) {
      const t = Math.min(60, (now - f.t0) / 1000), v = (f.gs || 0) * 0.5144, h = (f.hdg || 0) * D2R;
      const x = f.x + Math.sin(h) * v * t, z = f.z - Math.cos(h) * v * t;
      const y = f.onGround ? 3 : Math.max(30, (f.altFt || 0) * 0.3048);
      _e.set(0, -h, 0); _q.setFromEuler(_e); _p.set(x, y, z);
      f.wx = x; f.wy = y; f.wz = z;
      _m.compose(_p, _q, _s); tMesh.setMatrixAt(n++, _m);
    }
    tMesh.count = n; tMesh.instanceMatrix.needsUpdate = true;
  }
  function resize(w, h) { camera.aspect = w / h; camera.updateProjectionMatrix(); }
  function dispose() {
    scene.traverse((o) => {
      if (o.geometry) o.geometry.dispose();
      const ms = Array.isArray(o.material) ? o.material : o.material ? [o.material] : [];
      for (const m of ms) { for (const k of ['map', 'alphaMap']) if (m[k]) m[k].dispose(); m.dispose(); }
    });
    renderer.renderLists.dispose();
  }
  const apt = P.apt || city.apt;
  /* nearest live aircraft to a screen point (NDC), within ~22 px */
  const _pp = new THREE.Vector3();
  function pickTraffic(nx, ny, w, h) {
    let best = null, bd = 22 * 22;
    for (const f of traffic) {
      if (f.wx == null) continue;
      _pp.set(f.wx, f.wy, f.wz).project(camera); if (_pp.z > 1) continue;
      const dx = (_pp.x - nx) * w / 2, dy = (_pp.y - ny) * h / 2, d = dx * dx + dy * dy;
      if (d < bd) { bd = d; best = f; }
    }
    return best;
  }
  return { scene, camera, geo, graph, apt, update, pickTraffic, setLook, get look() { return look; }, setTraffic, setWeather, resize, dispose, get night() { return nightK; }, get sun() { return sunInfo; },
    buildings: osm ? osm.count : 0, houses: houseCount };
}
const aptBldMat = [new THREE.MeshLambertMaterial({ color: 0xc4c8cc }), new THREE.MeshLambertMaterial({ color: 0xffffff, map: terminalTex() })];
function terminalTex() {
  /* terminal facade: glass curtain wall bands with mullions (side UVs are in metres) */
  const cv = document.createElement('canvas'); cv.width = 64; cv.height = 64; const g = cv.getContext('2d');
  g.fillStyle = '#b9bec4'; g.fillRect(0, 0, 64, 64); g.fillStyle = '#3d5466'; g.fillRect(0, 8, 64, 40);
  g.fillStyle = '#8fa6b8'; for (let x = 0; x < 64; x += 8) g.fillRect(x, 8, 1, 40); g.fillRect(0, 27, 64, 1);
  const t = new THREE.CanvasTexture(cv); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1 / 12, 1 / 12); t.colorSpace = THREE.SRGBColorSpace; return t;
}
const houseMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
const roofMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
const treeMat = new THREE.MeshLambertMaterial({ color: 0xffffff, flatShading: true });
let houseCount = 0;
