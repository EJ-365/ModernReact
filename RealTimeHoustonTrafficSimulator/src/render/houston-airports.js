/**
 * Houston airports from OpenStreetMap aeroway data (public/data/houston/airports.json):
 * mown airfield grass, concrete aprons, asphalt taxiways with yellow centrelines, runways with
 * threshold/centreline/edge paint, and extruded terminals + hangars. Everything sits flush on the
 * ground (a few cm apart, polygon-offset) so nothing floats. `inAerodrome` keeps trees/houses out.
 * Terminals get glazed curtain-wall facades, OSM jet bridges are drawn at gates, airliners park at
 * OSM stands next to terminals, and each towered airport gets a proper control tower (OSM position,
 * or a clear spot beside the terminal core when OSM has none).
 */
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

function ringArr(f) { const out = []; for (let i = 0; i < f.length; i += 2) out.push(new THREE.Vector2(f[i], f[i + 1])); return out; }
function inRing(f, x, z) {
  let c = false;
  for (let i = 0, j = f.length - 2; i < f.length; j = i, i += 2) {
    const xi = f[i], zi = f[i + 1], xj = f[j], zj = f[j + 1];
    if ((zi > z) !== (zj > z) && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) c = !c;
  }
  return c;
}
function facadeTex(base, glass, mull, ribbed) {
  const c = document.createElement('canvas'); c.width = 256; c.height = 128;
  const x = c.getContext('2d');
  x.fillStyle = base; x.fillRect(0, 0, 256, 128);
  if (ribbed) { x.fillStyle = mull; for (let i = 0; i < 256; i += 8) x.fillRect(i, 0, 3, 128); }
  else {
    const gr = x.createLinearGradient(0, 18, 0, 118); gr.addColorStop(0, glass); gr.addColorStop(1, base);
    x.fillStyle = gr; x.fillRect(0, 16, 256, 104);
    x.fillStyle = mull; for (let i = 0; i < 256; i += 16) x.fillRect(i, 16, 2, 104);
    x.fillRect(0, 64, 256, 2); x.fillRect(0, 0, 256, 14);
  }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1 / 24, 1 / 14); t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
function mat(color, off) {
  return new THREE.MeshLambertMaterial({ color, polygonOffset: true, polygonOffsetFactor: -off, polygonOffsetUnits: -off * 2 });
}

export function createHoustonAirports({ parent, k = 1, offset = 60, url = '/data/houston/airports.json', planeTemplate = null, gaTemplate = null, liveryFor = null, nightMats = null }) {
  const root = new THREE.Group(); root.name = 'houston-airports'; parent.add(root);
  const X = (v) => (v - offset) * k + offset;
  const fields = [];
  const mats = {
    grass: mat(0x8aa25e, 1), apron: mat(0xa9abad, 2), taxi: mat(0x44474b, 3), runway: mat(0x34373b, 4),
    yellow: mat(0xe2b52a, 5), white: mat(0xf2f2ee, 5), wall: new THREE.MeshLambertMaterial({ color: 0xc9ccd0 }),
    hangar: new THREE.MeshLambertMaterial({ color: 0x9aa0a6 }), glass: new THREE.MeshLambertMaterial({ color: 0x40556a }),
    roof: new THREE.MeshLambertMaterial({ color: 0xc4c7ca }), concrete: new THREE.MeshLambertMaterial({ color: 0xd9d5cc }),
    cab: new THREE.MeshLambertMaterial({ color: 0x2f5368, emissive: 0x0d1820 }), dark: new THREE.MeshLambertMaterial({ color: 0x3a3d42 }),
    bridge: new THREE.MeshLambertMaterial({ color: 0xb7bcc2 }), red: new THREE.MeshBasicMaterial({ color: 0xff2a1a }),
  };
  mats.facade = new THREE.MeshLambertMaterial({ map: facadeTex('#3b5163', '#6f8aa0', '#d8dde2'), color: 0xffffff });
  mats.hangarSide = new THREE.MeshLambertMaterial({ map: facadeTex('#9ba1a8', '#8a9096', '#aab0b6', true), color: 0xffffff });
  function poly(rings, y, P, I) {
    for (const f of rings) {
      const pts = ringArr(f);
      if (pts.length < 3) continue;
      if (THREE.ShapeUtils.isClockWise(pts)) pts.reverse();
      const tris = THREE.ShapeUtils.triangulateShape(pts, []), b = P.length / 3;
      for (const p of pts) P.push(X(p.x), y, X(p.y));
      for (const t of tris) I.push(b + t[0], b + t[2], b + t[1]);
    }
  }
  function ribbon(p, w, y, P, I, dash) {
    for (let i = 2; i < p.length; i += 2) {
      const ax = p[i - 2], az = p[i - 1], dx = p[i] - ax, dz = p[i + 1] - az, L = Math.hypot(dx, dz);
      if (L < 0.5) continue;
      const nx = -dz / L * w / 2, nz = dx / L * w / 2;
      const pieces = dash ? Math.floor(L / (dash[0] + dash[1])) : 1;
      for (let j = 0; j < Math.max(1, pieces); j++) {
        const s0 = dash ? j * (dash[0] + dash[1]) / L : 0, s1 = dash ? Math.min(1, s0 + dash[0] / L) : 1;
        const x0 = ax + dx * s0, z0 = az + dz * s0, x1 = ax + dx * s1, z1 = az + dz * s1, b = P.length / 3;
        P.push(X(x0 - nx), y, X(z0 - nz), X(x0 + nx), y, X(z0 + nz), X(x1 - nx), y, X(z1 - nz), X(x1 + nx), y, X(z1 + nz));
        I.push(b, b + 1, b + 2, b + 1, b + 3, b + 2);
      }
    }
  }
  function extrude(items, m) {
    const g = [];
    for (const it of items) {
      const pts = ringArr(it.r);
      if (pts.length < 3) continue;
      const sh = new THREE.Shape(pts.map((p) => new THREE.Vector2(X(p.x), -X(p.y))));
      const geo = new THREE.ExtrudeGeometry(sh, { depth: Math.max(6, it.h || 12) * k, bevelEnabled: false });
      geo.rotateX(-Math.PI / 2);
      g.push(geo);
    }
    if (!g.length) return;
    /* ExtrudeGeometry groups: 0 = roof/floor caps, 1 = walls (world-metre UVs, so the facade tiles at real size) */
    for (const geo of g) { const mesh = new THREE.Mesh(geo, [mats.roof, m]); mesh.castShadow = mesh.receiveShadow = true; root.add(mesh); }
  }
  function add(P, I, m) {
    if (!I.length) return;
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); geo.setIndex(I); geo.computeVertexNormals();
    const mesh = new THREE.Mesh(geo, m); mesh.receiveShadow = true; root.add(mesh);
  }
  const nearRing = (r, x, z) => { let b = 1e9; for (let i = 0; i < r.length; i += 2) b = Math.min(b, Math.hypot(r[i] - x, r[i + 1] - z)); return b; };
  function fieldOf(d, x, z) { return d.aerodromes.find((a) => inRing(a.r, x, z)); }
  function jetBridges(lines) {
    if (!lines.length) return;
    const tube = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), mats.bridge, lines.length);
    const leg = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.35, 0.35, 1, 6), mats.dark, lines.length);
    const o = new THREE.Object3D();
    lines.forEach((p, i) => {
      const n = p.length, ax = p[0], az = p[1], bx = p[n - 2], bz = p[n - 1], L = Math.hypot(bx - ax, bz - az) || 1;
      o.position.set(X((ax + bx) / 2), 5 * k, X((az + bz) / 2)); o.rotation.set(0, Math.atan2(bx - ax, bz - az), 0); o.scale.set(3.4 * k, 3 * k, L * k);
      o.updateMatrix(); tube.setMatrixAt(i, o.matrix);
      o.position.set(X(bx - (bx - ax) / L * 3), 1.8 * k, X(bz - (bz - az) / L * 3)); o.rotation.set(0, 0, 0); o.scale.set(k, 3.6 * k, k);
      o.updateMatrix(); leg.setMatrixAt(i, o.matrix);
    });
    tube.castShadow = true; root.add(tube, leg);
  }
  /** airliners at OSM stands near terminals; one instanced draw per livery part */
  function parkPlanes(d) {
    if (!planeTemplate || !d.terminals.length) return 0;
    const spots = [];
    for (const s of d.stands || []) {
      const x = s[0], z = s[1];
      let best = 1e9, tr = null;
      for (const t of d.terminals) { const dd = nearRing(t.r, x, z); if (dd < best) { best = dd; tr = t; } }
      if (best > 160) continue;
      let hx, hz;
      if (s.length === 4) { hx = s[2] - s[0]; hz = s[3] - s[1]; }
      else { let cx = 0, cz = 0; for (let i = 0; i < tr.r.length; i += 2) { cx += tr.r[i]; cz += tr.r[i + 1]; } cx /= tr.r.length / 2; cz /= tr.r.length / 2; hx = cx - x; hz = cz - z; }
      const px = s.length === 4 ? s[2] : x, pz = s.length === 4 ? s[3] : z;
      if (spots.some((q) => Math.hypot(q[0] - px, q[1] - pz) < 40)) continue;
      /* real gates are rarely all occupied at once: keep roughly 3 in 5 */
      if (((Math.imul(Math.round(px) | 0, 2246822519) ^ Math.round(pz)) >>> 0) % 5 >= 3) continue;
      const f = fieldOf(d, px, pz);
      spots.push([px, pz, Math.atan2(hx, hz), f ? f.iata || '' : '']);
    }
    if (!spots.length) return 0;
    const meshes = bakeFleet(planeTemplate, spots.length);
    const o = new THREE.Object3D(), col = new THREE.Color();
    const SC = 1.5;
    spots.forEach(([x, z, hd, iata], i) => {
      o.position.set(X(x), 3.1 * SC * k, X(z)); o.rotation.set(0, hd, 0); o.scale.setScalar(SC * k); o.updateMatrix();
      for (const im of Object.values(meshes)) im.setMatrixAt(i, o.matrix);
      const r = (Math.imul(i + 1, 2654435761) >>> 0) / 4294967296;
      const cs = iata === 'HOU' ? (r < 0.8 ? 'SWA' : r < 0.9 ? 'DAL' : 'AAL') : iata === 'IAH' ? (r < 0.62 ? 'UAL' : ['AAL', 'DAL', 'SWA', 'SKW', 'UAE', 'BAW', 'DLH', 'AFR', 'KLM', 'QTR', 'AMX', 'VIV', 'FDX', 'ACA'][(r * 1000 | 0) % 14]) : 'SKW';
      const lv = liveryFor ? liveryFor(cs, i) : [0xf4f5f7, 0x9aa2ab, 0x2b5ea8, 0x9aa2ab];
      if (meshes.body) meshes.body.setColorAt(i, col.setHex(lv[0]));
      if (meshes.fin) meshes.fin.setColorAt(i, col.setHex(lv[2]));
    });
    return spots.length + parkGA(d);
  }
  /** template group -> instanced meshes: 0x00ff00 parts = livery body, 0xff00ff = tail, the rest keep their own colours */
  function bakeFleet(tpl, n) {
    const parts = { body: [], fin: [], rest: [] }, c = new THREE.Color();
    tpl.updateMatrixWorld(true);
    tpl.traverse((m) => {
      if (!m.isMesh || !m.material || Array.isArray(m.material) || m.material.isMeshBasicMaterial || m.material.transparent) return;
      const hex = m.material.color ? m.material.color.getHex() : 0x9aa2ab;
      const g = m.geometry.index ? m.geometry.toNonIndexed() : m.geometry.clone();
      for (const a of Object.keys(g.attributes)) if (a !== 'position' && a !== 'normal') g.deleteAttribute(a);
      g.applyMatrix4(m.matrixWorld);
      const key = hex === 0x00ff00 ? 'body' : hex === 0xff00ff ? 'fin' : 'rest';
      if (key === 'rest') { c.setHex(hex); const cl = new Float32Array(g.attributes.position.count * 3); for (let i = 0; i < cl.length; i += 3) { cl[i] = c.r; cl[i + 1] = c.g; cl[i + 2] = c.b; } g.setAttribute('color', new THREE.BufferAttribute(cl, 3)); }
      parts[key].push(g);
    });
    const meshes = {};
    for (const [key, list] of Object.entries(parts)) {
      if (!list.length) continue;
      const im = new THREE.InstancedMesh(mergeGeometries(list), new THREE.MeshLambertMaterial({ color: 0xffffff, vertexColors: key === 'rest' }), n);
      im.castShadow = true; im.receiveShadow = true; meshes[key] = im; root.add(im);
    }
    return meshes;
  }
  /** light aircraft tied down in rows on general-aviation aprons (not at IAH/HOU airline ramps) */
  function parkGA(d) {
    if (!gaTemplate) return 0;
    const spots = [];
    for (const ap of d.aprons) {
      const f = fieldOf(d, ap.r[0], ap.r[1]);
      if (!f || f.iata === 'IAH' || f.iata === 'HOU') continue;
      const [x0, z0, x1, z1] = ringBox(ap.r);
      /* rows along the apron's long axis */
      const long = x1 - x0 > z1 - z0, hd = long ? 0 : Math.PI / 2;
      let n = 0;
      for (let a = (long ? x0 : z0) + 10; a < (long ? x1 : z1) - 10 && n < 36; a += 15) for (let b = (long ? z0 : x0) + 12; b < (long ? z1 : x1) - 12 && n < 36; b += 26) {
        const x = long ? a : b, z = long ? b : a;
        const h = ((Math.imul(Math.round(x) | 0, 2654435761) ^ Math.imul(Math.round(z) | 0, 40503)) >>> 0) / 4294967296;
        if (h > 0.42 || !inRing(ap.r, x, z) || nearRing(ap.r, x, z) < 9 || d.hangars.some((t) => inRing(t.r, x, z) || nearRing(t.r, x, z) < 10)) continue;
        if (d.taxiways.some((w) => segNear(w.p, x, z, w.w / 2 + 8))) continue;
        spots.push([x, z, hd + (h < 0.21 ? 0 : Math.PI)]); n++;
      }
    }
    if (!spots.length) return 0;
    const meshes = bakeFleet(gaTemplate, spots.length), o = new THREE.Object3D(), col = new THREE.Color();
    const GA_COLS = [0xf4f5f7, 0xf4f5f7, 0xeceef0, 0xe8e2d0, 0xf4f5f7, 0xd8dde3];
    const GA_TRIM = [0x1d3f7a, 0xb3261e, 0x2b5ea8, 0x1f7a3a, 0x6b6f75, 0xd9861f, 0x1a1a1a];
    spots.forEach(([x, z, hd], i) => {
      /* sit on the gear above the apron slab (fuselage is centred on its axis) */
      o.position.set(X(x), 1.5 * k, X(z)); o.rotation.set(0, hd, 0); o.scale.setScalar(1.15 * k); o.updateMatrix();
      for (const im of Object.values(meshes)) im.setMatrixAt(i, o.matrix);
      if (meshes.body) meshes.body.setColorAt(i, col.setHex(GA_COLS[i % GA_COLS.length]));
      if (meshes.fin) meshes.fin.setColorAt(i, col.setHex(GA_TRIM[(i * 7 + 3) % GA_TRIM.length]));
    });
    return spots.length;
  }
  function ringBox(r) { let x0 = 1e9, z0 = 1e9, x1 = -1e9, z1 = -1e9; for (let i = 0; i < r.length; i += 2) { x0 = Math.min(x0, r[i]); x1 = Math.max(x1, r[i]); z0 = Math.min(z0, r[i + 1]); z1 = Math.max(z1, r[i + 1]); } return [x0, z0, x1, z1]; }
  /** concrete shaft + flared base, slanted octagonal glass cab, dark roof, antenna and red obstruction light */
  function tower(x, z, h, rot) {
    const g = new THREE.Group();
    const sh = h - 9;
    const add = (geo, m, y, sx = 1, sz = 1) => { const me = new THREE.Mesh(geo, m); me.position.y = y; me.scale.set(sx, 1, sz); me.castShadow = true; g.add(me); return me; };
    const base = add(new THREE.BoxGeometry(26, 9, 16), mats.concrete, 4.5); base.position.x = 9;
    add(new THREE.CylinderGeometry(2.7, 4.2, sh, 16), mats.concrete, sh / 2);
    for (let i = 0; i < 4; i++) { const rib = add(new THREE.BoxGeometry(0.7, sh * 0.92, 1.4), mats.dark, sh * 0.46); rib.position.x = Math.cos(i * Math.PI / 2) * 3.3; rib.position.z = Math.sin(i * Math.PI / 2) * 3.3; rib.rotation.y = -i * Math.PI / 2; }
    add(new THREE.CylinderGeometry(6.4, 2.9, 3.4, 8), mats.concrete, sh + 1.7);
    add(new THREE.CylinderGeometry(7.4, 6.3, 4.6, 8), mats.cab, sh + 5.7);
    add(new THREE.CylinderGeometry(7.9, 7.6, 0.9, 8), mats.dark, sh + 8.45);
    add(new THREE.CylinderGeometry(7.75, 7.75, 0.35, 8), mats.dark, sh + 3.55);
    add(new THREE.CylinderGeometry(0.12, 0.2, 7, 5), mats.dark, sh + 12.4);
    add(new THREE.SphereGeometry(0.45, 8, 6), mats.red, sh + 16);
    g.position.set(X(x), 0, X(z)); g.rotation.y = rot;
    g.scale.setScalar(k);
    root.add(g);
  }
  function buildTowers(d) {
    const out = [];
    const TALL = { IAH: 85, HOU: 58, EFD: 42 };
    for (const t of d.towers || []) {
      const f = fieldOf(d, t.x, t.z);
      if (out.some((q) => Math.hypot(q.x - t.x, q.z - t.z) < 60)) continue;
      out.push({ x: t.x, z: t.z, h: t.h >= 18 && t.h <= 120 ? t.h : (f && TALL[f.iata]) || 28, iata: f ? f.iata : '' });
    }
    for (const a of d.aerodromes) {
      if (!TALL[a.iata] || out.some((t) => inRing(a.r, t.x, t.z))) continue;
      /* OSM has no tower here: stand it on open ground beside the terminal core, clear of pavement */
      const terms = d.terminals.filter((t) => inRing(a.r, t.r[0], t.r[1]));
      if (!terms.length) continue;
      let cx = 0, cz = 0, n = 0;
      for (const t of terms) for (let i = 0; i < t.r.length; i += 2) { cx += t.r[i]; cz += t.r[i + 1]; n++; }
      cx /= n; cz /= n;
      const clear = (x, z) => inRing(a.r, x, z)
        && !d.aprons.some((p) => inRing(p.r, x, z) || nearRing(p.r, x, z) < 25)
        && !terms.some((t) => inRing(t.r, x, z) || nearRing(t.r, x, z) < 40)
        && !d.taxiways.some((w) => segNear(w.p, x, z, w.w / 2 + 35))
        && !d.runways.some((w) => segNear(w.p, x, z, w.w / 2 + 160));
      let spot = null;
      for (let rr = 120; rr <= 1400 && !spot; rr += 60) for (let q = 0; q < 24 && !spot; q++) { const ang = q / 24 * Math.PI * 2, x = cx + Math.cos(ang) * rr, z = cz + Math.sin(ang) * rr; if (clear(x, z)) spot = [x, z]; }
      if (spot) out.push({ x: spot[0], z: spot[1], h: TALL[a.iata], iata: a.iata });
    }
    for (const t of out) tower(t.x, t.z, t.h, Math.atan2(t.x, t.z));
    return out.length;
  }
  function segNear(p, x, z, r) {
    for (let i = 2; i < p.length; i += 2) {
      const ax = p[i - 2], az = p[i - 1], dx = p[i] - ax, dz = p[i + 1] - az, l2 = dx * dx + dz * dz || 1;
      const t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / l2));
      if (Math.hypot(ax + dx * t - x, az + dz * t - z) < r) return true;
    }
    return false;
  }
  /** runway lighting: white edge lights every 60 m, centreline lights every 30 m, green threshold bars at both ends.
   *  Each set is one InstancedMesh whose material joins the app's night-lighting list (bright at night, faint by day). */
  function runwayLights(rws) {
    const edge = [], cl = [], thr = [];
    for (const r of rws) {
      const hw = r.w / 2 + 1;
      for (let i = 2; i < r.p.length; i += 2) {
        const ax = r.p[i - 2], az = r.p[i - 1], dx = r.p[i] - ax, dz = r.p[i + 1] - az, L = Math.hypot(dx, dz);
        if (L < 1) continue;
        for (let s = 0; s < L; s += 60) for (const sd of [-1, 1]) edge.push(ax + dx * s / L - dz / L * hw * sd, az + dz * s / L + dx / L * hw * sd);
        for (let s = 15; s < L; s += 30) cl.push(ax + dx * s / L, az + dz * s / L);
      }
      const n = r.p.length;
      for (const e of [0, 1]) {
        const i = e ? n - 2 : 0, j = e ? n - 4 : 2, dx = r.p[j] - r.p[i], dz = r.p[j + 1] - r.p[i + 1], l = Math.hypot(dx, dz) || 1;
        for (let o = -hw; o <= hw + 0.1; o += 3.2) thr.push(r.p[i] - dz / l * o, r.p[i + 1] + dx / l * o);
      }
    }
    const set = (pts, color, rad, y) => {
      if (!pts.length) return;
      const m = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0 });
      const im = new THREE.InstancedMesh(new THREE.SphereGeometry(rad, 6, 4), m, pts.length / 2);
      const o = new THREE.Object3D();
      for (let i = 0; i < pts.length; i += 2) { o.position.set(X(pts[i]), y * k, X(pts[i + 1])); o.updateMatrix(); im.setMatrixAt(i / 2, o.matrix); }
      root.add(im);
      if (nightMats) nightMats.push(m);
    };
    set(edge, 0xfff2d0, 1.1, 0.9);
    set(cl, 0xe8f0ff, 0.7, 0.45);
    set(thr, 0x3dff6a, 1.0, 0.8);
  }
  /** painted runway designators ("17", "35L"…) just past the threshold piano keys, one atlas + one merged mesh */
  function runwayNumbers(rws) {
    const labels = [];
    for (const r of rws) {
      if (!r.ref || r.p.length < 4) continue;
      const parts = String(r.ref).split('/').map((t) => t.trim()).filter(Boolean), n = r.p.length;
      for (const e of [0, 1]) {
        const i = e ? n - 2 : 0, j = e ? n - 4 : 2, dx = r.p[j] - r.p[i], dz = r.p[j + 1] - r.p[i + 1], l = Math.hypot(dx, dz) || 1;
        const ux = dx / l, uz = dz / l, brg = ((Math.atan2(ux, -uz) * 180 / Math.PI) + 360) % 360;
        let best = null, bd = 1e9;
        for (const t of parts) { const m = /^(\d{1,2})([LRC]?)$/.exec(t); if (!m) continue; let d = Math.abs(+m[1] * 10 - brg) % 360; d = Math.min(d, 360 - d); if (d < bd) { bd = d; best = m; } }
        if (!best || bd > 40) continue;
        labels.push({ num: best[1].padStart(2, '0'), side: best[2], x: r.p[i] + ux * 72, z: r.p[i + 1] + uz * 72, ux, uz, w: Math.min(r.w * 0.55, 20) });
      }
    }
    if (!labels.length) return;
    const CW = 128, CH = 192, cols = 16, rows = Math.ceil(labels.length / cols);
    const c = document.createElement('canvas'); c.width = CW * cols; c.height = CH * rows;
    const x = c.getContext('2d'); x.fillStyle = '#fff'; x.textAlign = 'center'; x.textBaseline = 'middle';
    const pos = [], uv = [], idx = [];
    labels.forEach((L, q) => {
      const cx = (q % cols) * CW, cy = Math.floor(q / cols) * CH;
      x.font = 'bold 112px Arial, sans-serif'; x.fillText(L.num, cx + CW / 2, cy + (L.side ? 62 : 96));
      if (L.side) { x.font = 'bold 74px Arial, sans-serif'; x.fillText(L.side, cx + CW / 2, cy + 150); }
      const h = L.w * 1.5, rx = -L.uz, rz = L.ux, y = 0.3 * k, b = pos.length / 3;
      const P = (s, t) => pos.push(X(L.x + rx * L.w * s + L.ux * h * t), y, X(L.z + rz * L.w * s + L.uz * h * t));
      P(-0.5, -0.5); P(0.5, -0.5); P(0.5, 0.5); P(-0.5, 0.5);
      const u0 = cx / c.width, u1 = (cx + CW) / c.width, vb = 1 - (cy + CH) / c.height, vt = 1 - cy / c.height;
      uv.push(u0, vb, u1, vb, u1, vt, u0, vt);
      idx.push(b, b + 1, b + 2, b, b + 2, b + 3);
    });
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    geo.setIndex(idx); geo.computeVertexNormals();
    const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
    const m = new THREE.MeshLambertMaterial({ map: tex, emissive: 0x6a6a6a, emissiveMap: tex, transparent: true, alphaTest: 0.35, depthWrite: false, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -6, polygonOffsetUnits: -12 });
    const me = new THREE.Mesh(geo, m); me.renderOrder = 2; root.add(me);
  }
  /** apron parking spots (OSM apron interiors) for the tour aircraft to taxi to after landing */
  const spots = [];
  function nearestSpot(x, z, maxD = 4500) {
    let best = null, bd = maxD;
    for (const s of spots) { const d = Math.hypot(s.x - x, s.z - z); if (d < bd) { bd = d; best = s; } }
    return best;
  }
  const ready = fetch(url).then((r) => r.json()).then((d) => {
    const L = {};
    for (const n of ['grass', 'apron', 'taxi', 'runway', 'yellow', 'white']) L[n] = [[], []];
    for (const a of d.aerodromes) {
      poly([a.r], 0.16 * k, ...L.grass);
      let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9;
      for (let i = 0; i < a.r.length; i += 2) { x0 = Math.min(x0, a.r[i]); x1 = Math.max(x1, a.r[i]); z0 = Math.min(z0, a.r[i + 1]); z1 = Math.max(z1, a.r[i + 1]); }
      fields.push({ r: a.r, x0, x1, z0, z1 });
    }
    for (const a of d.aprons) poly([a.r], 0.2 * k, ...L.apron);
    for (const a of d.aprons) {
      let cx = 0, cz = 0; const m = a.r.length / 2;
      for (let i = 0; i < a.r.length; i += 2) { cx += a.r[i]; cz += a.r[i + 1]; }
      cx /= m; cz /= m;
      if (!inRing(a.r, cx, cz)) { cx = (cx + a.r[0]) / 2; cz = (cz + a.r[1]) / 2; if (!inRing(a.r, cx, cz)) continue; }
      spots.push({ x: X(cx), z: X(cz) });
    }
    for (const t of d.taxiways) { ribbon(t.p, t.w, 0.23 * k, ...L.taxi); ribbon(t.p, 0.35, 0.25 * k, ...L.yellow); }
    for (const r of d.runways) {
      ribbon(r.p, r.w, 0.26 * k, ...L.runway);
      ribbon(r.p, 0.9, 0.28 * k, ...L.white, [36, 24]);
      const n = r.p.length, hw = r.w / 2 - 1.5;
      for (const sd of [-1, 1]) {
        const off = [];
        for (let i = 0; i < n; i += 2) {
          const j = Math.min(i + 2, n - 2), i0 = j === i ? i - 2 : i, dx = r.p[j] - r.p[i0], dz = r.p[j + 1] - r.p[i0 + 1], l = Math.hypot(dx, dz) || 1;
          off.push(r.p[i] - dz / l * hw * sd, r.p[i + 1] + dx / l * hw * sd);
        }
        ribbon(off, 0.9, 0.28 * k, ...L.white);
      }
      /* threshold piano keys at both ends */
      for (const e of [0, 1]) {
        const i = e ? n - 2 : 0, j = e ? n - 4 : 2, dx = r.p[j] - r.p[i], dz = r.p[j + 1] - r.p[i + 1], l = Math.hypot(dx, dz) || 1, ux = dx / l, uz = dz / l;
        for (let b = -5; b <= 5; b++) {
          if (!b) continue;
          const o = b * r.w / 13, cx = r.p[i] + ux * 8 - uz * o, cz = r.p[i + 1] + uz * 8 + ux * o;
          ribbon([cx, cz, cx + ux * 45, cz + uz * 45], 1.6, 0.28 * k, ...L.white);
        }
      }
    }
    for (const n of Object.keys(L)) add(L[n][0], L[n][1], mats[n]);
    extrude(d.terminals, mats.facade);
    extrude(d.hangars, mats.hangarSide);
    jetBridges(d.bridges || []);
    const parked = parkPlanes(d);
    const towers = buildTowers(d);
    runwayLights(d.runways);
    runwayNumbers(d.runways);
    return { parked, towers, bridges: (d.bridges || []).length, aerodromes: d.aerodromes.length, runways: d.runways.length, taxiways: d.taxiways.length, terminals: d.terminals.length, hangars: d.hangars.length };
  });
  function inAerodrome(x, z) {
    for (const f of fields) if (x >= f.x0 && x <= f.x1 && z >= f.z0 && z <= f.z1 && inRing(f.r, x, z)) return true;
    return false;
  }
  return { root, ready, inAerodrome, nearestSpot };
}
