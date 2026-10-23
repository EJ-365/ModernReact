/**
 * Houston stadiums from OpenStreetMap leisure=stadium outlines (public/data/houston/stadiums.json,
 * built by tools/stadiums.py from the local OSM extract). Pro/college venues get a two-tier raked
 * seating bowl inside a concrete facade ring around the pitch; school stadiums get home/visitor
 * bleachers with a press box, a track and four light masts. One vertex-coloured mesh + one light mesh.
 * NRG Stadium, the Astrodome, Daikin Park and Toyota Center are modelled elsewhere; covered arenas
 * (Fertitta Center, H&PE Arena…) are already OSM buildings and are skipped here.
 */
import * as THREE from 'three';

/* name → [stand height m, seat colour] for venues with a full bowl */
const MAJOR = {
  'TDECU Stadium': [34, 0xc8102e], 'Rice Stadium': [30, 0x1d3f7a], 'Shell Energy Stadium': [21.3, 0xf26b1d],
  'Constellation Field': [19, 0x24456e], 'Planet Ford Stadium': [17], 'Darrell Tully Stadium': [14],
  'Legacy Stadium': [16], 'Woodforest Bank Stadium': [15], 'Cy-Fair FCU Stadium': [14], 'Reckling Park': [13, 0x1d3f7a],
  'Schroeder Park': [12, 0xc8102e], 'Delmar Stadium': [12], 'SaberCats Stadium': [10, 0x1b5e9e], 'Butler Stadium': [12],
  'Turner Stadium': [12], 'Klein Memorial Stadium': [12], 'Pearland ISD Stadium': [12], 'Randall Reed Stadium': [13],
};
const CONC = 0xb8b3a9, DARK = 0x2b2e33, TURF = 0x3d8a3b, TRACK = 0x9a4a3c, BLEACH = 0x9aa1a8;

export function createHoustonStadiums({ parent, geoToWorld, baseY = 0, url = '/data/houston/stadiums.json' }) {
  const root = new THREE.Group(); root.name = 'houston-stadiums'; parent.add(root);
  const ready = fetch(url).then((r) => r.json()).then((list) => {
    const S = { p: [], c: [] }, L = { p: [], c: [] }, col = new THREE.Color();
    const tri = (A, a, b, c, hex) => { A.p.push(...a, ...b, ...c); col.setHex(hex); for (let k = 0; k < 3; k++) A.c.push(col.r, col.g, col.b); };
    const quad = (A, a, b, c, d, hex) => { tri(A, a, b, c, hex); tri(A, a, c, d, hex); };
    const box = (A, x, y, z, sx, sy, sz, hex, ang = 0) => {
      const ca = Math.cos(ang), sa = Math.sin(ang);
      const v = (i, j, k) => { const lx = i * sx / 2, lz = k * sz / 2; return [x + lx * ca - lz * sa, y + (j > 0 ? sy : 0), z + lx * sa + lz * ca]; };
      const q = (a, b, c, d) => quad(A, v(...a), v(...b), v(...c), v(...d), hex);
      q([-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]); q([1, -1, -1], [-1, -1, -1], [-1, 1, -1], [1, 1, -1]);
      q([-1, -1, -1], [-1, -1, 1], [-1, 1, 1], [-1, 1, -1]); q([1, -1, 1], [1, -1, -1], [1, 1, -1], [1, 1, 1]);
      q([-1, 1, 1], [1, 1, 1], [1, 1, -1], [-1, 1, -1]);
    };
    const mast = (x, z, h, ang) => { box(S, x, baseY, z, 0.8, h, 0.8, 0x8c939a); box(L, x, baseY + h, z, 6, 3, 0.7, 0xfff4d6, ang); };
    const fill = (ring, y, hex) => {
      const t = THREE.ShapeUtils.triangulateShape(ring.map(([x, z]) => new THREE.Vector2(x, z)), []);
      for (const [a, b, c] of t) tri(S, [ring[a][0], y, ring[a][1]], [ring[b][0], y, ring[b][1]], [ring[c][0], y, ring[c][1]], hex);
    };
    let n = 0;
    for (const s of list) {
      if (s.c) continue;
      const pts = s.p.map(([la, ln]) => { const w = geoToWorld(la, ln); return [w.x, w.z]; });
      const N = pts.length; if (N < 3) continue;
      let cx = 0, cz = 0; for (const [x, z] of pts) { cx += x; cz += z; } cx /= N; cz /= N;
      const m = MAJOR[s.n]; n++;
      if (m) {
        const H = m[0], seat = m[1] || 0x5b6570;
        const rad = pts.reduce((a, [x, z]) => a + Math.hypot(x - cx, z - cz), 0) / N, D = Math.min(H * 1.8, rad * 0.34);
        const inset = (d) => pts.map(([x, z]) => { const dx = cx - x, dz = cz - z, l = Math.hypot(dx, dz) || 1, k = Math.min(d, l * 0.75) / l; return [x + dx * k, z + dz * k]; });
        const mid = inset(D * 0.5), inn = inset(D), y = (h) => baseY + h;
        const sd = new THREE.Color(seat).multiplyScalar(0.72).getHex();
        for (let i = 0; i < N; i++) {
          const j = (i + 1) % N, o = pts, P = (r, k, h) => [r[k][0], y(h), r[k][1]];
          quad(S, P(o, i, 0), P(o, j, 0), P(o, j, H), P(o, i, H), CONC);
          quad(S, P(o, i, H), P(o, j, H), P(o, j, H + 1.2), P(o, i, H + 1.2), DARK);
          quad(S, P(o, i, H + 1.2), P(o, j, H + 1.2), P(mid, j, H * 0.56), P(mid, i, H * 0.56), sd);
          quad(S, P(mid, i, H * 0.56), P(mid, j, H * 0.56), P(mid, j, H * 0.46), P(mid, i, H * 0.46), DARK);
          quad(S, P(mid, i, H * 0.46), P(mid, j, H * 0.46), P(inn, j, 1.4), P(inn, i, 1.4), seat);
          quad(S, P(inn, i, 1.4), P(inn, j, 1.4), P(inn, j, 0), P(inn, i, 0), DARK);
        }
        fill(inn, baseY + 0.35, TURF);
        for (let q = 0; q < 4; q++) { const k = Math.floor((q + 0.5) * N / 4) % N, [x, z] = pts[k]; mast(x, z, H + 16, Math.atan2(cz - z, cx - x) + Math.PI / 2); }
        continue;
      }
      /* school stadium: principal axis of the outline → long sides get bleachers */
      let sxx = 0, szz = 0, sxz = 0; for (const [x, z] of pts) { sxx += (x - cx) ** 2; szz += (z - cz) ** 2; sxz += (x - cx) * (z - cz); }
      const th = 0.5 * Math.atan2(2 * sxz, sxx - szz), ux = Math.cos(th), uz = Math.sin(th);
      let u0 = 1e9, u1 = -1e9, v0 = 1e9, v1 = -1e9;
      for (const [x, z] of pts) { const u = (x - cx) * ux + (z - cz) * uz, v = -(x - cx) * uz + (z - cz) * ux; u0 = Math.min(u0, u); u1 = Math.max(u1, u); v0 = Math.min(v0, v); v1 = Math.max(v1, v); }
      const W = (u, v, h) => [cx + u * ux - v * uz, baseY + h, cz + u * uz + v * ux];
      const uc = (u0 + u1) / 2, vc = (v0 + v1) / 2, Lu = u1 - u0, Wv = v1 - v0;
      if (Lu < 60 || Wv < 30) continue;
      const fu = Math.min(Lu * 0.4, 60), fv = Math.min(Wv * 0.3, 30);
      const flat = (a0, a1, b0, b1, h, hex) => quad(S, W(a0, b0, h), W(a1, b0, h), W(a1, b1, h), W(a0, b1, h), hex);
      flat(uc - fu - 9, uc + fu + 9, vc - fv - 8, vc + fv + 8, 0.3, TRACK);
      flat(uc - fu, uc + fu, vc - fv, vc + fv, 0.36, TURF);
      for (const side of [1, -1]) {
        const h = side > 0 ? 8 : 5, d = Math.min(16, (Wv / 2 - fv - 8) * 0.9); if (d < 4) continue;
        const vo = vc + side * (fv + 9 + d), vi = vc + side * (fv + 9), a = uc - fu * 0.8, b = uc + fu * 0.8;
        quad(S, W(a, vi, 0.9), W(b, vi, 0.9), W(b, vo, h), W(a, vo, h), BLEACH);
        quad(S, W(a, vo, 0), W(b, vo, 0), W(b, vo, h), W(a, vo, h), 0x7d848b);
        tri(S, W(a, vi, 0), W(a, vo, 0), W(a, vo, h), 0x7d848b); tri(S, W(b, vi, 0), W(b, vo, 0), W(b, vo, h), 0x7d848b);
        if (side > 0) { const [px, , pz] = W(uc, vo - 2, 0); box(S, px, baseY + h, pz, 22, 5, 5, 0x6d747c, th); }
      }
      for (const su of [-1, 1]) for (const sv of [-1, 1]) { const [x, , z] = W(uc + su * fu * 0.75, vc + sv * (fv + 12), 0); mast(x, z, 24, th); }
    }
    const mk = (A, mat) => {
      if (!A.p.length) return;
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(A.p, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(A.c, 3));
      g.computeVertexNormals(); g.computeBoundingSphere();
      const me = new THREE.Mesh(g, mat); me.castShadow = me.receiveShadow = mat.type !== 'MeshBasicMaterial'; root.add(me);
    };
    mk(S, new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide }));
    mk(L, new THREE.MeshBasicMaterial({ vertexColors: true }));
    return { stadiums: n };
  });
  return { root, ready };
}
