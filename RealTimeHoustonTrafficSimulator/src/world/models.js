/** Low-poly airliners (real length / span per type) and a sedan for world cities. */
import * as THREE from 'three';

export const WORLD_AIRCRAFT = [
  ['b737', 'Boeing 737-800', 39.5, 35.8, 2, 3.8],
  ['b787', 'Boeing 787-9 Dreamliner', 62.8, 60.1, 2, 5.8],
  ['b777', 'Boeing 777-300ER', 73.9, 64.8, 2, 6.2],
  ['b747', 'Boeing 747-8', 76.3, 68.4, 4, 6.5],
  ['a320', 'Airbus A320neo', 37.6, 35.8, 2, 4.0],
  ['a350', 'Airbus A350-900', 66.8, 64.8, 2, 6.0],
  ['a380', 'Airbus A380', 72.7, 79.8, 4, 7.1],
];

const white = new THREE.MeshStandardMaterial({ color: 0xf3f5f7, roughness: 0.45, metalness: 0.15 });
const grey = new THREE.MeshStandardMaterial({ color: 0xaab0b6, roughness: 0.5, metalness: 0.4, side: THREE.DoubleSide });
const dark = new THREE.MeshStandardMaterial({ color: 0x22262b, roughness: 0.35, metalness: 0.2 });
const accent = new THREE.MeshStandardMaterial({ color: 0x1f4e9c, roughness: 0.5 });

/** The Houston tour airliner (same livery, nose and engines), rescaled to real metres. */
function houstonJet(id, t) {
  if (typeof window === 'undefined' || !window.HTS_MAKE_TOUR_JET) return null;
  let src; try { src = window.HTS_MAKE_TOUR_JET(id); } catch (e) { return null; }
  if (!src) return null;
  const box = new THREE.Box3().setFromObject(src), sz = box.getSize(new THREE.Vector3());
  const D0 = src.userData && src.userData.dims;
  /* Houston airliners are built nose/tail along z (dims.zF / zB); wingspan can exceed length, so don't guess from the box */
  const alongZ = D0 && Number.isFinite(D0.zF) ? true : sz.z >= sz.x, len = alongZ ? sz.z : sz.x; if (!(len > 0)) return null;
  const k = t[2] / len, inner = new THREE.Group(); inner.add(src); inner.scale.setScalar(k);
  const D = src.userData && src.userData.dims;
  /* our convention: nose toward -z */
  if (alongZ) { if (D && Number.isFinite(D.zF) && D.zF > 0) inner.rotation.y = Math.PI; }
  else inner.rotation.y = Math.PI / 2;
  const g = new THREE.Group(); g.add(inner);
  g.updateMatrixWorld(true); const b2 = new THREE.Box3().setFromObject(g);
  const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 6), new THREE.MeshBasicMaterial({ color: 0xff2a2a }));
  beacon.position.set(0, b2.max.y + 0.1, (b2.min.z + b2.max.z) / 2); g.add(beacon);
  g.userData = { len: t[2], span: t[3], gearH: -b2.min.y, beacon, name: t[1],
    cockpit: new THREE.Vector3(0, b2.max.y * 0.25 + b2.min.y * 0.05 + 0.6, b2.min.z + t[2] * 0.045) };
  return g;
}

export function airliner(id) {
  const t = WORLD_AIRCRAFT.find((a) => a[0] === id) || WORLD_AIRCRAFT[0];
  const hj = houstonJet(t[0], t); if (hj) return hj;
  const [, , L, S, eng, D] = t; const r = D / 2;
  const g = new THREE.Group();
  const add = (geo, mat, x, y, z) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; g.add(m); return m; };
  const body = new THREE.CylinderGeometry(r, r, L * 0.74, 20); body.rotateX(Math.PI / 2);
  add(body, white, 0, 0, 0);
  const nose = new THREE.SphereGeometry(r, 20, 14, 0, Math.PI * 2, 0, Math.PI / 2); nose.rotateX(-Math.PI / 2); nose.scale(1, 0.92, 2.0);
  add(nose, white, 0, 0, -L * 0.37);
  const tail = new THREE.ConeGeometry(r, L * 0.2, 20); tail.rotateX(Math.PI / 2); tail.scale(1, 0.85, 1);
  add(tail, white, 0, r * 0.25, L * 0.47);
  const wind = new THREE.BoxGeometry(r * 1.1, r * 0.22, r * 0.5); add(wind, dark, 0, r * 0.45, -L * 0.37 - r * 1.05);
  const belly = new THREE.CylinderGeometry(r * 1.005, r * 1.005, L * 0.74, 20, 1, true, Math.PI * 0.62, Math.PI * 0.76); belly.rotateX(Math.PI / 2);
  add(belly, accent, 0, 0, 0);
  if (id === 'a380') add(new THREE.BoxGeometry(D * 0.08, D * 0.05, L * 0.6), dark, r * 1.0, r * 0.45, -L * 0.02).clone();
  if (id === 'b747') { const hump = new THREE.SphereGeometry(r * 0.8, 16, 10); hump.scale(1, 0.7, 3.4); add(hump, white, 0, r * 0.55, -L * 0.22); }
  /* swept wings */
  const ws = new THREE.Shape(); const root = L * 0.2, tip = L * 0.06, sweep = S * 0.22;
  ws.moveTo(0, 0); ws.lineTo(S / 2, sweep); ws.lineTo(S / 2, sweep + tip); ws.lineTo(0, root); ws.closePath();
  const wg = new THREE.ExtrudeGeometry(ws, { depth: r * 0.16, bevelEnabled: false }); wg.rotateX(Math.PI / 2);
  for (const sgn of [1, -1]) {
    const m = add(wg, grey, 0, -r * 0.35, -L * 0.1); m.scale.x = sgn;
    const wl = add(new THREE.BoxGeometry(0.3, S * 0.05, tip * 0.8), white, sgn * S / 2, -r * 0.35 + S * 0.025, -L * 0.1 + sweep + tip * 0.4);
    void wl;
    const pos = eng === 4 ? [0.22, 0.38] : [0.3];
    for (const f of pos) {
      const nac = new THREE.CylinderGeometry(r * 0.42, r * 0.36, L * 0.09, 16); nac.rotateX(Math.PI / 2);
      add(nac, grey, sgn * S * f, -r * 0.95, -L * 0.1 + sweep * f * 2 - L * 0.04);
    }
  }
  const hS = S * 0.34; /* horizontal stabilisers, swept back */
  for (const sgn of [1, -1]) {
    const m = add(new THREE.BoxGeometry(hS / 2, 0.35, L * 0.07), white, sgn * hS / 4, r * 0.35, L * 0.42);
    m.rotation.y = -sgn * 0.45;
  }
  const fs = new THREE.Shape(); fs.moveTo(0, 0); fs.lineTo(L * 0.13, D * 1.55); fs.lineTo(L * 0.2, D * 1.55); fs.lineTo(L * 0.2, 0); fs.closePath();
  const fg = new THREE.ExtrudeGeometry(fs, { depth: 0.35, bevelEnabled: false }); fg.rotateY(-Math.PI / 2);
  add(fg, accent, 0.17, r * 0.6, L * 0.33);
  /* gear */
  for (const [x, z] of [[0, -L * 0.33], [r * 0.9, L * 0.02], [-r * 0.9, L * 0.02]]) add(new THREE.CylinderGeometry(0.55, 0.55, 0.5, 10).rotateZ(Math.PI / 2), dark, x, -r - 1.4, z);
  const beacon = add(new THREE.SphereGeometry(0.35, 8, 6), new THREE.MeshBasicMaterial({ color: 0xff2a2a }), 0, r + 0.2, 0);
  g.userData = { len: L, span: S, gearH: r + 1.9, beacon, cockpit: new THREE.Vector3(0, r * 0.45, -L * 0.37 - r * 0.6), name: t[1] };
  return g;
}

export function sedan(color = 0xb3202a) {
  const g = new THREE.Group();
  const paint = new THREE.MeshStandardMaterial({ color, roughness: 0.35, metalness: 0.5 });
  const glass = new THREE.MeshStandardMaterial({ color: 0x1b2430, roughness: 0.1, metalness: 0.6 });
  const add = (geo, mat, x, y, z) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; g.add(m); return m; };
  add(new THREE.BoxGeometry(1.85, 0.62, 4.6), paint, 0, 0.62, 0);
  add(new THREE.BoxGeometry(1.6, 0.55, 2.3), glass, 0, 1.18, 0.25);
  add(new THREE.BoxGeometry(1.5, 0.06, 2.0), paint, 0, 1.47, 0.3);
  for (const [x, z] of [[0.86, -1.45], [-0.86, -1.45], [0.86, 1.4], [-0.86, 1.4]]) add(new THREE.CylinderGeometry(0.34, 0.34, 0.26, 14).rotateZ(Math.PI / 2), dark, x, 0.34, z);
  const hl = new THREE.MeshBasicMaterial({ color: 0xfff6d8 });
  const tl = new THREE.MeshBasicMaterial({ color: 0xff2020 });
  for (const s of [0.62, -0.62]) { add(new THREE.BoxGeometry(0.42, 0.14, 0.05), hl, s, 0.74, -2.31); add(new THREE.BoxGeometry(0.42, 0.14, 0.05), tl, s, 0.74, 2.31); }
  const beam = new THREE.SpotLight(0xfff2d0, 0, 90, 0.5, 0.6, 1.2); beam.position.set(0, 0.8, -2.2); beam.target.position.set(0, 0, -30);
  g.add(beam); g.add(beam.target);
  g.userData = { beam };
  return g;
}
