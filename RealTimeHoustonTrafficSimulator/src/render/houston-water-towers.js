/**
 * Houston-area water towers from OSM (scripts/extract-houston-water-towers.py), each in its city's
 * own paint scheme with the city name around the tank. Three common Texas designs: composite
 * (concrete column + steel bowl), pedestal sphere and multi-leg. Instanced (a few draws in total);
 * true size near the ground; they grow (up to 14x) only when viewed from well above, so they stay visible on the zoomed-out map.
 */
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

/* paint / lettering per city (s: design, p: tank paint, i: lettering, b: trim bands, f: serif lettering, seal) */
const STYLE = {
  'Sugar Land': { s: 'composite', p: 0xf3f4f1, i: 0x22409a, b: 0x22409a, f: 1, seal: 1 },
  Houston: { s: 'sphere', p: 0xedf1f3, i: 0x1b3d6e, b: 0x5d9fd3 },
  Pasadena: { s: 'sphere', p: 0xf1f1ec, i: 0xa52628, b: 0x1b3d6e },
  Pearland: { s: 'composite', p: 0xf3f4f0, i: 0x0f3a6c, b: 0x2f9bc1 },
  Katy: { s: 'legged', p: 0xdfe4e7, i: 0x7a1e2c, b: 0x7a1e2c },
  'League City': { s: 'composite', p: 0xf1f3ef, i: 0x2a6a3c, b: 0x2a6a3c, f: 1 },
  Baytown: { s: 'sphere', p: 0xf0f4f6, i: 0x12508c, b: 0x3a8ec8 },
  'The Woodlands': { s: 'composite', p: 0xe7ece3, i: 0x2e5832, b: 0x6b8e39, f: 1 },
  'Missouri City': { s: 'composite', p: 0xf2f3f2, i: 0x15397a, b: 0xb3272f },
  Friendswood: { s: 'sphere', p: 0xf0f3ee, i: 0x23633a, b: 0x23633a },
  'Texas City': { s: 'sphere', p: 0xf0f2f3, i: 0x173f7a, b: 0xb02a2a },
  Humble: { s: 'legged', p: 0xe8ebec, i: 0x1d3b6a, b: 0x1d3b6a },
  Tomball: { s: 'legged', p: 0xe4e8ea, i: 0x8a1c22, b: 0x8a1c22 },
  Bellaire: { s: 'sphere', p: 0xeef2f1, i: 0x1c4f3d, b: 0x1c4f3d, f: 1 },
  'Jersey Village': { s: 'composite', p: 0xeff2f4, i: 0x21407a, b: 0xc8a23a },
  'Deer Park': { s: 'sphere', p: 0xf0f2ef, i: 0x6b3d1f, b: 0x2c5a2e },
  'La Porte': { s: 'sphere', p: 0xf0f3f5, i: 0x0f4d82, b: 0x0f4d82 },
  Richmond: { s: 'legged', p: 0xe5e8e9, i: 0x5a1f22, b: 0x5a1f22, f: 1 },
  Rosenberg: { s: 'composite', p: 0xf0f2f2, i: 0x1d3c78, b: 0xb5262b },
  Fulshear: { s: 'composite', p: 0xece8df, i: 0x3a3a3a, b: 0x8c6d3c, f: 1 },
  Webster: { s: 'sphere', p: 0xf1f3f4, i: 0x18407c, b: 0x18407c },
  Seabrook: { s: 'sphere', p: 0xf0f4f5, i: 0x0e6a83, b: 0x0e6a83 },
  Dickinson: { s: 'sphere', p: 0xf1f2ef, i: 0x1f4b80, b: 0xb02a2e },
  Alvin: { s: 'legged', p: 0xe3e7e9, i: 0x1d3a6e, b: 0x1d3a6e },
  Stafford: { s: 'sphere', p: 0xf0f2f3, i: 0x153e74, b: 0x153e74 },
  'Galena Park': { s: 'legged', p: 0xe4e7e8, i: 0x223e6a, b: 0x223e6a },
  'Mont Belvieu': { s: 'composite', p: 0xf0f1ee, i: 0x1d3e6f, b: 0x1d3e6f },
};
const PAL = [[0x1d3e6f, 0x1d3e6f], [0x8a1e25, 0x1d3e6f], [0x23603a, 0x23603a], [0x0f5d7e, 0x0f5d7e], [0x5a2a6e, 0x5a2a6e]];
const DESIGNS = ['composite', 'sphere', 'legged'];
const hash = (s) => { let h = 2166136261; for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619); return h >>> 0; };
function styleFor(city, lat, lng) {
  if (STYLE[city]) return STYLE[city];
  const h = hash(city || lat.toFixed(3) + lng.toFixed(3)), c = PAL[h % PAL.length];
  /* unincorporated utility-district (MUD) towers: plain pale paint, a trim band, no city name */
  return { s: DESIGNS[(h >>> 4) % 3], p: city ? 0xf0f2f1 : [0xeef1f2, 0xe3ece9, 0xe9e6dc, 0xdfe8ee][(h >>> 8) % 4], i: c[0], b: c[1], f: (h >>> 12) % 2 };
}

function bandTexture(name, st) {
  const cv = document.createElement('canvas'); cv.width = 2048; cv.height = 256;
  const g = cv.getContext('2d'), hex = (c) => '#' + c.toString(16).padStart(6, '0');
  g.fillStyle = hex(st.p); g.fillRect(0, 0, 2048, 256);
  g.fillStyle = hex(st.b); g.fillRect(0, 0, 2048, 22); g.fillRect(0, 234, 2048, 22);
  if (name) {
    const txt = name.toUpperCase(), fam = st.f ? 'Georgia, "Times New Roman", serif' : '"Arial Black", Arial, sans-serif';
    let px = 150; g.font = 'bold ' + px + 'px ' + fam;
    const room = st.seal ? 720 : 880; while (g.measureText(txt).width > room && px > 50) { px -= 6; g.font = 'bold ' + px + 'px ' + fam; }
    g.fillStyle = hex(st.i); g.textAlign = 'center'; g.textBaseline = 'middle';
    for (const cx of [512, 1536]) {
      const tx = st.seal ? cx + 70 : cx; g.fillText(txt, tx, 132);
      if (st.seal) { /* city seal: ring + star */
        const sx = tx - g.measureText(txt).width / 2 - 80;
        g.lineWidth = 9; g.strokeStyle = hex(st.i); g.beginPath(); g.arc(sx, 128, 60, 0, 7); g.stroke();
        g.beginPath(); for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, r = k % 2 ? 18 : 42; g.lineTo(sx + Math.cos(a) * r, 128 + Math.sin(a) * r); } g.fill();
      }
    }
  }
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
}

const at = (geo, x, y, z, sy = 1) => { if (sy !== 1) geo.scale(1, sy, 1); geo.translate(x, y, z); return geo; };
/* geometry per design (metres, base at y=0): paint (instance-coloured), structure (concrete/steel), band (lettering) */
function design(s) {
  if (s === 'composite') {
    const paint = [at(new THREE.CylinderGeometry(13.5, 5.2, 8, 40, 1, true), 0, 35.2, 0), at(new THREE.CylinderGeometry(12.6, 13.6, 1.2, 40), 0, 43.8, 0),
      at(new THREE.CylinderGeometry(1.4, 12.6, 2.4, 40), 0, 45.6, 0), at(new THREE.CircleGeometry(5.2, 24).rotateX(Math.PI / 2), 0, 31.2, 0)];
    const struct = [at(new THREE.CylinderGeometry(4.3, 5.0, 31, 28), 0, 15.5, 0), at(new THREE.CylinderGeometry(5.5, 5.5, 1.2, 28), 0, 31.0, 0),
      at(new THREE.BoxGeometry(2.4, 3.2, 0.4), 0, 1.6, 4.95)];
    return { paint, struct, band: at(new THREE.CylinderGeometry(13.6, 13.6, 8.4, 56, 1, true), 0, 39.4, 0), top: 47.2, structCol: 0xb9b8b2 };
  }
  if (s === 'sphere') {
    const paint = [at(new THREE.CylinderGeometry(2.7, 6.2, 7, 24), 0, 3.5, 0), at(new THREE.CylinderGeometry(2.5, 2.7, 26, 24), 0, 20, 0),
      at(new THREE.SphereGeometry(11, 40, 24), 0, 41, 0, 0.88)];
    const struct = [at(new THREE.BoxGeometry(2.2, 3, 0.4), 0, 1.5, 5.4), at(new THREE.CylinderGeometry(0.15, 0.15, 3, 6), 0, 51.9, 0)];
    return { paint, struct, band: at(new THREE.SphereGeometry(11.08, 56, 6, 0, Math.PI * 2, Math.PI * 0.36, Math.PI * 0.26), 0, 41, 0, 0.88), top: 53.4, structCol: 0x8b9096 };
  }
  const paint = [at(new THREE.SphereGeometry(8, 32, 10, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), 0, 28, 0, 0.6), at(new THREE.CylinderGeometry(0.8, 8.4, 4, 40), 0, 40, 0)];
  const struct = [at(new THREE.CylinderGeometry(1.2, 1.2, 28, 12), 0, 14, 0), at(new THREE.CylinderGeometry(9, 9, 0.35, 40), 0, 28.2, 0)];
  for (const [dx, dz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) {
    const a = new THREE.Vector3(dx * 10, 0, dz * 10), b = new THREE.Vector3(dx * 5.4, 29, dz * 5.4), L = a.distanceTo(b);
    const leg = new THREE.CylinderGeometry(0.42, 0.6, L, 8); leg.translate(0, L / 2, 0);
    leg.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize())); leg.translate(a.x, 0, a.z);
    struct.push(leg);
  }
  return { paint, struct, band: at(new THREE.CylinderGeometry(8.05, 8.05, 10, 48, 1, true), 0, 33, 0), top: 42.2, structCol: 0xc6cacd };
}
const merge = (list) => mergeGeometries(list.map((g) => (g.index ? g.toNonIndexed() : g)), false);

export function createWaterTowers({ parent, geoToWorld, url = '/data/houston/water-towers.json', baseY = 0 }) {
  const root = new THREE.Group(); root.name = 'water-towers'; parent.add(root);
  const towers = [], meshes = [], _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _s = new THREE.Vector3(), _p = new THREE.Vector3();
  let frame = 0, lastK = -1;
  const ready = fetch(url).then((r) => r.json()).then((d) => {
    const byDesign = new Map();
    for (const [lat, lng, city, , h] of d.t || []) {
      const st = styleFor(city, lat, lng), w = geoToWorld(lat, lng);
      const o = { x: w.x, z: w.z, city, st, k: 1, yaw: (hash(lat + ',' + lng) % 628) / 100 };
      if (!byDesign.has(st.s)) byDesign.set(st.s, []);
      byDesign.get(st.s).push(o); towers.push(o);
    }
    const col = new THREE.Color();
    for (const [s, list] of byDesign) {
      const D = design(s);
      for (const o of list) o.k = 1;
      const paint = new THREE.InstancedMesh(merge(D.paint), new THREE.MeshLambertMaterial({ color: 0xffffff }), list.length);
      const struct = new THREE.InstancedMesh(merge(D.struct), new THREE.MeshLambertMaterial({ color: D.structCol }), list.length);
      list.forEach((o, i) => { paint.setColorAt(i, col.setHex(o.st.p)); o.slots = [[paint, i], [struct, i]]; o.top = D.top; });
      meshes.push(paint, struct);
      /* lettering band: one instanced mesh per city (its own texture) */
      const byCity = new Map(); for (const o of list) { const key = o.city || '#' + o.st.p + o.st.b; if (!byCity.has(key)) byCity.set(key, []); byCity.get(key).push(o); }
      const bandGeo = D.band.index ? D.band : D.band;
      for (const [, grp] of byCity) {
        const mat = new THREE.MeshLambertMaterial({ map: bandTexture(grp[0].city, grp[0].st), polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -2 });
        const band = new THREE.InstancedMesh(bandGeo, mat, grp.length);
        grp.forEach((o, i) => o.slots.push([band, i])); meshes.push(band);
      }
    }
    /* red obstruction light on every tank top */
    const lamp = new THREE.InstancedMesh(new THREE.SphereGeometry(0.6, 8, 6), new THREE.MeshBasicMaterial({ color: 0xff3020 }), towers.length);
    towers.forEach((o, i) => o.slots.push([lamp, i, o.top])); meshes.push(lamp);
    for (const m of meshes) { m.frustumCulled = false; m.castShadow = m !== lamp; m.matrixAutoUpdate = false; root.add(m); }
    lastK = -1; place(1e9);
  }).catch((e) => console.warn('[HTS] water towers', e && e.message));

  function place(camY, cam) {
    for (const o of towers) {
      /* true size near the ground, so it isn't seen on the horizon miles away (hidden past ~4 km + 3x eye height);
         grows only when the map is viewed from well above (eye over ~1.5 km), so it still reads from the zoomed-out map */
      const h = cam ? cam.y - baseY : 1e9, hd = cam ? Math.hypot(cam.x - o.x, cam.z - o.z) : 0;
      const up = Math.max(0, Math.min(1, (h - 1500) / 1500)), d = Math.hypot(hd, h);
      const k = hd > 4000 + Math.max(0, h) * 3 ? 0 : 1 + up * (Math.min(14, Math.max(1, d / 1500)) - 1);
      o.k = k; _q.setFromAxisAngle(_s.set(0, 1, 0), o.yaw); _s.set(k, k, k);
      for (const [m, i, top] of o.slots) {
        _p.set(o.x, baseY + (top ? top * k : 0), o.z); _m.compose(_p, _q, top ? _s.set(k, k, k) : _s); m.setMatrixAt(i, _m);
      }
    }
    for (const m of meshes) m.instanceMatrix.needsUpdate = true;
  }
  function update(cam, night = 0) {
    if (!towers.length || (++frame % 6)) return;
    const k = Math.round(Math.log(1 + Math.hypot(cam.x, cam.y, cam.z) / 50) * 40 + cam.y);
    if (k !== lastK) { lastK = k; place(cam.y, cam); }
    const lamp = meshes[meshes.length - 1]; if (lamp) lamp.visible = night > 0.25 || ((performance.now() / 1000) % 2) < 1;
  }
  return { root, ready, update, get count() { return towers.length; } };
}
