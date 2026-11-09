/* Detailed near-camera models for heavy road traffic (bus, box truck, 18-wheeler).
   Geometry is built once per type and merged per material, so each model is ~8 draw calls. */
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

const M = {
  glass: new THREE.MeshStandardMaterial({ color: 0x18222c, metalness: 0.6, roughness: 0.12 }),
  dark: new THREE.MeshStandardMaterial({ color: 0x1b1d20, roughness: 0.8 }),
  chrome: new THREE.MeshStandardMaterial({ color: 0xc4c9ce, metalness: 0.5, roughness: 0.32 }),
  tyre: new THREE.MeshStandardMaterial({ color: 0x111214, roughness: 0.95 }),
  rim: new THREE.MeshStandardMaterial({ color: 0xb8bec4, metalness: 0.45, roughness: 0.35 }),
  white: new THREE.MeshStandardMaterial({ color: 0xe9eaec, roughness: 0.55 }),
  head: new THREE.MeshBasicMaterial({ color: 0xfff6dc }),
  tail: new THREE.MeshBasicMaterial({ color: 0xd01418 }),
  amber: new THREE.MeshBasicMaterial({ color: 0xffa21a }),
};

function bx(list, w, h, l, x, y, z, r = 0) {
  const g = (r > 0 ? new RoundedBoxGeometry(w, h, l, 2, r) : new THREE.BoxGeometry(w, h, l)).toNonIndexed();
  g.deleteAttribute('uv'); g.translate(x, y, z); list.push(g);
}
function cyl(list, r, len, x, y, z, axis = 'x', seg = 14) {
  const g = new THREE.CylinderGeometry(r, r, len, seg).toNonIndexed();
  g.deleteAttribute('uv');
  if (axis === 'x') g.rotateZ(Math.PI / 2); else if (axis === 'z') g.rotateX(Math.PI / 2);
  g.translate(x, y, z); list.push(g);
}
/* one tyre + rim per side at axle z; dual=true adds the inner tyre of a dual-wheel axle */
function axle(P, z, r, halfW, dual) {
  for (const s of [-1, 1]) {
    cyl(P.tyre, r, 0.3, s * halfW, r, z);
    cyl(P.rim, r * 0.58, 0.32, s * (halfW + 0.005), r, z);
    cyl(P.dark, r * 1.12, 0.04, s * (halfW - 0.2), r, z);
    if (dual) cyl(P.tyre, r, 0.28, s * (halfW - 0.31), r, z);
  }
}
function lamps(P, w, y, zf, zr, hy = 0.22) {
  for (const s of [-1, 1]) {
    if (zf != null) bx(P.head, 0.36, hy, 0.06, s * (w / 2 - 0.3), y, zf);
    bx(P.tail, 0.3, hy, 0.06, s * (w / 2 - 0.25), y, zr);
  }
}

function busParts() {
  const P = { paint: [], glass: [], dark: [], chrome: [], tyre: [], rim: [], white: [], head: [], tail: [], amber: [] };
  const L = 12.5, W = 2.6, H = 3.2, z0 = L / 2;
  bx(P.paint, W, H - 0.45, L - 0.1, 0, 0.45 + (H - 0.45) / 2, 0, 0.16);
  bx(P.white, W - 0.3, 0.12, L - 1.4, 0, H + 0.04, -0.2);
  bx(P.white, 1.5, 0.3, 2.6, 0, H + 0.2, -2.2, 0.08);
  for (const s of [-1, 1]) {
    bx(P.glass, 0.04, 1.0, L - 2.6, s * (W / 2 + 0.01), 2.25, -0.9);
    for (let z = -z0 + 0.9; z < z0 - 1.5; z += 1.35) bx(P.paint, 0.06, 1.02, 0.1, s * (W / 2 + 0.02), 2.25, z);
    bx(P.dark, 0.05, 0.12, L - 0.4, s * (W / 2 + 0.01), 0.62, 0);
    bx(P.chrome, 0.08, 0.2, 0.26, s * (W / 2 + 0.2), 2.6, z0 - 0.4);
  }
  bx(P.glass, 0.05, 2.1, 1.1, -(W / 2 + 0.015), 1.6, z0 - 1.0);
  bx(P.glass, 0.05, 2.1, 1.2, -(W / 2 + 0.015), 1.6, -0.6);
  bx(P.glass, W - 0.16, 1.55, 0.06, 0, 2.0, z0 - 0.02);
  bx(P.amber, 1.8, 0.26, 0.05, 0, 2.95, z0 + 0.01);
  bx(P.glass, W - 0.5, 0.7, 0.05, 0, 2.4, -z0 + 0.02);
  bx(P.dark, W + 0.04, 0.32, 0.25, 0, 0.6, z0);
  bx(P.dark, W + 0.04, 0.32, 0.25, 0, 0.6, -z0);
  bx(P.chrome, 1.0, 0.5, 0.06, 0, 1.0, z0 + 0.03);
  lamps(P, W, 0.95, z0 + 0.04, -z0 - 0.04, 0.26);
  axle(P, z0 - 2.0, 0.5, W / 2 - 0.12, false);
  axle(P, -z0 + 3.2, 0.5, W / 2 - 0.12, true);
  return P;
}

function boxParts() {
  const P = { paint: [], glass: [], dark: [], chrome: [], tyre: [], rim: [], white: [], head: [], tail: [], amber: [] };
  const L = 9, W = 2.5, z0 = L / 2;
  bx(P.dark, 1.0, 0.25, L - 0.6, 0, 0.62, 0);
  bx(P.paint, W - 0.15, 1.15, 1.0, 0, 1.05, z0 - 0.55, 0.12);
  bx(P.paint, W - 0.1, 1.35, 1.6, 0, 1.95, z0 - 1.55, 0.14);
  bx(P.glass, W - 0.35, 0.75, 0.06, 0, 2.15, z0 - 0.74);
  for (const s of [-1, 1]) {
    bx(P.glass, 0.05, 0.7, 0.9, s * (W / 2 - 0.04), 2.15, z0 - 1.35);
    bx(P.chrome, 0.06, 0.32, 0.2, s * (W / 2 + 0.16), 2.1, z0 - 0.9);
  }
  bx(P.chrome, 1.3, 0.45, 0.05, 0, 1.1, z0 - 0.03);
  bx(P.dark, W, 0.28, 0.2, 0, 0.62, z0 - 0.05);
  bx(P.white, 2.6, 2.75, L - 2.55, 0, 0.82 + 1.375, -1.25, 0.05);
  bx(P.dark, 0.04, 2.6, 0.03, 0, 2.2, -z0 - 0.02);
  bx(P.dark, 2.4, 0.15, 0.3, 0, 0.55, -z0 + 0.1);
  lamps(P, W, 1.0, z0 - 0.02, -z0 - 0.04);
  for (const s of [-1, 1]) bx(P.amber, 0.1, 0.06, 0.06, s * 1.15, 3.6, z0 - 2.3);
  axle(P, z0 - 1.0, 0.46, W / 2 - 0.1, false);
  axle(P, -z0 + 2.0, 0.46, W / 2 - 0.1, true);
  return P;
}

function semiParts() {
  const P = { paint: [], paint2: [], glass: [], dark: [], chrome: [], tyre: [], rim: [], white: [], head: [], tail: [], amber: [] };
  const L = 18, W = 2.55, z0 = L / 2;
  // tractor (long-nose US conventional)
  bx(P.dark, 1.0, 0.3, 6.6, 0, 0.75, z0 - 3.4);
  bx(P.paint, 2.15, 1.25, 2.3, 0, 1.55, z0 - 1.25, 0.22);
  bx(P.chrome, 1.25, 1.1, 0.08, 0, 1.55, z0 - 0.08);
  bx(P.chrome, W - 0.1, 0.32, 0.3, 0, 0.72, z0 - 0.1);
  bx(P.paint, W - 0.05, 2.1, 1.7, 0, 2.15, z0 - 3.25, 0.16);
  bx(P.paint, W - 0.05, 2.5, 1.7, 0, 2.35, z0 - 4.9, 0.16);
  bx(P.paint, W - 0.25, 0.55, 1.6, 0, 3.75, z0 - 4.4, 0.2);
  bx(P.glass, W - 0.3, 0.75, 0.06, 0, 2.75, z0 - 2.39);
  for (const s of [-1, 1]) {
    bx(P.glass, 0.05, 0.7, 1.0, s * (W / 2 - 0.01), 2.75, z0 - 3.2);
    cyl(P.chrome, 0.32, 1.3, s * 0.95, 0.85, z0 - 3.6, 'z');
    cyl(P.chrome, 0.08, 2.6, s * (W / 2 - 0.1), 3.2, z0 - 4.1, 'y', 8);
    bx(P.chrome, 0.06, 0.5, 0.22, s * (W / 2 + 0.2), 2.7, z0 - 2.5);
    bx(P.dark, 0.05, 0.6, 0.45, s * (W / 2 - 0.15), 0.55, z0 - 6.5);
    bx(P.amber, 0.12, 0.08, 0.08, s * 0.9, 3.25, z0 - 2.45);
  }
  // trailer
  bx(P.paint2, 2.6, 2.75, 13.4, 0, 1.3 + 1.375, -z0 + 6.7, 0.05);
  bx(P.dark, 2.0, 0.25, 12.8, 0, 1.15, -z0 + 6.7);
  for (const s of [-1, 1]) {
    bx(P.dark, 0.1, 0.9, 0.12, s * 0.8, 0.6, -z0 + 11.2);
    bx(P.tail, 0.08, 0.06, 0.12, s * 1.31, 1.4, -z0 + 3.5);
    bx(P.tail, 0.08, 0.06, 0.12, s * 1.31, 1.4, -z0 + 9.0);
  }
  bx(P.dark, 0.04, 2.6, 0.03, 0, 2.65, -z0 - 0.02);
  bx(P.dark, 2.5, 0.12, 0.2, 0, 0.6, -z0 + 0.15);
  lamps(P, W, 1.2, z0 + 0.0, -z0 - 0.04);
  axle(P, z0 - 1.55, 0.5, W / 2 - 0.12, false);
  axle(P, z0 - 5.0, 0.5, W / 2 - 0.12, true);
  axle(P, z0 - 6.3, 0.5, W / 2 - 0.12, true);
  axle(P, -z0 + 2.0, 0.5, W / 2 - 0.12, true);
  axle(P, -z0 + 3.3, 0.5, W / 2 - 0.12, true);
  return P;
}

const BUILDERS = { bus: busParts, box: boxParts, semi: semiParts };
const cache = {};
function geos(id) {
  if (!cache[id]) {
    const P = BUILDERS[id](), out = {};
    for (const k in P) if (P[k].length) out[k] = mergeGeometries(P[k]);
    cache[id] = out;
  }
  return cache[id];
}

/** Detailed model for a heavy traffic type (forward +z, ground y=0, metres). userData.paint / paint2 = body / trailer paint. */
export function makeTrafficHeavy(id) {
  const G = geos(id), g = new THREE.Group();
  const paint = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.3, roughness: 0.4 });
  const paint2 = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.1, roughness: 0.6 });
  for (const k in G) {
    const m = new THREE.Mesh(G[k], k === 'paint' ? paint : k === 'paint2' ? paint2 : M[k]);
    m.castShadow = k === 'paint' || k === 'paint2' || k === 'white';
    g.add(m);
  }
  g.userData.paint = paint; g.userData.paint2 = paint2; g.userData.lampHead = M.head; g.userData.lampTail = M.tail;
  return g;
}
