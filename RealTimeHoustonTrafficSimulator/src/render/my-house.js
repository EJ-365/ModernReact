import * as THREE from 'three';
/**
 * The owner's home (16623 Red Gully Dr, Sugar Land) modelled from a photo: two storeys, light vinyl siding
 * upstairs, red brick downstairs, front-loading double garage, grey shingle hip roofs, wood fence and a big live oak.
 * Footprint from OSM / Microsoft building footprints (~11.6 m square). Front (+z) faces the street.
 */
/* true hip roof: rectangular eave w×d, ridge along the longer side, height h */
function hipGeo(w, d, h) {
  const long = w >= d, a = long ? w : d, b = long ? d : w, r = Math.max(0, (a - b) / 2);
  const P = (u, y, v) => (long ? [u, y, v] : [v, y, u]);
  const A = P(-a / 2, 0, b / 2), B = P(a / 2, 0, b / 2), C = P(a / 2, 0, -b / 2), D = P(-a / 2, 0, -b / 2);
  const R1 = P(-r, h, 0), R2 = P(r, h, 0);
  const tris = [A, B, R2, A, R2, R1, C, D, R1, C, R1, R2, D, A, R1, B, C, R2];
  if (!long) for (let i = 0; i < tris.length; i += 3) { const t = tris[i + 1]; tris[i + 1] = tris[i + 2]; tris[i + 2] = t; }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(tris.flat(), 3));
  geo.computeVertexNormals();
  return geo;
}
export function createMyHouse({ parent, x, z, yaw = 0, y = 0.25 }) {
  const g = new THREE.Group(); g.name = 'my-house'; g.position.set(x, y, z); g.rotation.y = yaw; parent.add(g);
  const M = (c, o = {}) => new THREE.MeshLambertMaterial({ color: c, ...o });
  const brick = M(0xa4553f), siding = M(0xe9e4d6), trim = M(0xf6f4ee), roof = M(0x5d6066, { side: THREE.DoubleSide }), door = M(0xf2f1ec);
  const glass = M(0x3c4652, { emissive: 0xffc888, emissiveIntensity: 0 }), fence = M(0x8a6a48), conc = M(0xc9c4b9);
  const box = (w, h, d, m, px, py, pz) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(px, py + h / 2, pz); o.castShadow = o.receiveShadow = true; g.add(o); return o; };
  const hip = (w, d, h, px, py, pz) => { const o = new THREE.Mesh(hipGeo(w, d, h), roof); o.position.set(px, py, pz); o.castShadow = true; g.add(o); return o; };
  /* ground floor: brick body + garage bay projecting toward the street */
  box(11.6, 3.0, 9.4, brick, 0, 0, -1.1);
  box(6.2, 3.0, 2.2, brick, -2.7, 0, 4.7);
  /* upper storey (siding) over the right half */
  box(7.0, 2.8, 9.0, siding, 2.3, 3.0, -1.1);
  box(7.2, 0.18, 9.2, trim, 2.3, 5.8, -1.1);
  /* roofs (0.35 m eave overhang) */
  hip(7.7, 9.7, 2.3, 2.3, 5.95, -1.1);                 /* main upper hip */
  hip(5.3, 10.1, 1.5, -3.45, 3.0, -1.1);                /* lower hip over the left (garage-side) ground floor */
  hip(6.9, 2.6, 0.9, -2.7, 3.0, 4.85);                  /* garage bay */
  box(11.8, 0.16, 9.6, trim, 0, 2.95, -1.1);           /* frieze board between floors */
  /* double garage door with panel lines, driveway */
  box(5.0, 2.3, 0.1, door, -2.7, 0, 5.83);
  for (let i = 1; i < 4; i++) box(5.0, 0.04, 0.12, M(0xd7d5cf), -2.7, i * 0.57, 5.86);
  box(5.6, 0.06, 7.0, conc, -2.7, -0.2, 9.3);
  /* front door + small porch, walk to the drive */
  box(1.0, 2.1, 0.1, M(0x6b4a34), 1.4, 0, 3.66);
  box(2.2, 0.12, 1.4, conc, 1.4, -0.12, 4.3);
  box(1.0, 0.05, 3.6, conc, 1.4, -0.2, 6.6);
  /* windows: two upstairs front, one downstairs right, side windows */
  for (const wx of [0.8, 3.8]) { box(1.2, 1.3, 0.08, glass, wx, 3.8, 3.42); box(1.4, 0.1, 0.12, trim, wx, 3.72, 3.44); }
  box(1.4, 1.2, 0.08, glass, 4.3, 0.9, 3.66);
  box(0.08, 1.2, 1.2, glass, 5.84, 3.9, -1.5);
  box(0.08, 1.1, 1.2, glass, 5.84, 0.9, -2.5);
  /* backyard wood fence, tied into the back corners of the house */
  box(13.2, 1.9, 0.1, fence, 0, 0, -11.2);
  for (const sx of [-6.6, 6.6]) box(0.1, 1.9, 5.4, fence, sx, 0, -8.5);
  /* the big live oak in the front yard */
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.45, 4.5, 7), M(0x5a4632)); trunk.position.set(7.6, 2.25, 7.6); g.add(trunk);
  for (const [r, px, py, pz] of [[3.4, 7.6, 6.0, 7.6], [2.6, 5.8, 5.4, 6.8], [2.5, 9.2, 5.2, 8.4]]) {
    const c = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 1), M(0x3a5a2a)); c.scale.y = 0.8; c.position.set(px, py, pz); c.castShadow = true; g.add(c);
  }
  return {
    group: g,
    update(camX, camZ, nightF) {
      g.visible = Math.hypot(camX - x, camZ - z) < 3000;
      glass.emissiveIntensity = nightF * 0.9;
    },
  };
}
