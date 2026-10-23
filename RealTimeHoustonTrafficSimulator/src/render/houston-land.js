/**
 * Houston land cover from OpenStreetMap at true scale (public/data/houston/tiles/land).
 * Polygons (residential, commercial, industrial, parking, parks, woods, scrub, water,
 * wetland, golf, cemetery, farm) are triangulated into one merged mesh per 4 km tile.
 * Detail is instanced per tile: trees in woods/parks/yards, bushes in scrub, and houses
 * lined up along the real residential streets (from the local road tiles), facing the street.
 * Input metres; `k` maps metres → world units (1 in Houston metre mode).
 */
import * as THREE from 'three';

const LAND = {
  residential: { c: 0x9aa486, y: 0.05 }, commercial: { c: 0xa9a59c, y: 0.05 }, industrial: { c: 0x9d988c, y: 0.05 },
  farm: { c: 0xa9a477, y: 0.04 }, cemetery: { c: 0x7f9a62, y: 0.06 }, grass: { c: 0x73894f, y: 0.07 },
  pitch: { c: 0x638a45, y: 0.08 }, golf: { c: 0x628f47, y: 0.07 }, park: { c: 0x5f7f44, y: 0.08 },
  scrub: { c: 0x76804e, y: 0.07 }, wood: { c: 0x3f5a2e, y: 0.09 }, wetland: { c: 0x6a7e58, y: 0.08 },
  parking: { c: 0x8a8b8c, y: 0.11 }, water: { c: 0x3a6f8a, y: 0.12 },
};
const ORDER = ['farm', 'residential', 'commercial', 'industrial', 'cemetery', 'grass', 'golf', 'pitch', 'park', 'scrub', 'wetland', 'wood', 'parking', 'water'];
const TREE_DENS = { wood: 1 / 90, park: 1 / 700, golf: 1 / 900, cemetery: 1 / 500, wetland: 1 / 400, residential: 0, scrub: 1 / 260 };
/* land uses where no house may stand (most Houston suburbs have no landuse=residential polygon) */
const NO_HOUSE = { commercial: 1, industrial: 1, parking: 1, park: 1, wood: 1, water: 1, wetland: 1, golf: 1, cemetery: 1, pitch: 1 };
const HOUSE_COLS = [0xcfc4ad, 0xbfae90, 0xd8d0c0, 0xa9aeb0, 0xb48c70, 0xc9bfa6, 0xe0d8c8, 0x9c8f80];
const ROOF_COLS = [0x55504a, 0x6a5848, 0x4c5056, 0x6f655a, 0x3f4245];
/* Houston canopy: dark glossy live oak, loblolly pine, yaupon/wax myrtle, crepe myrtle (lighter), water oak */
const TREE_COLS = [0x2f4824, 0x37522a, 0x2a3f22, 0x41592e, 0x4b6533, 0x334a2a];

/* airfields (houston-airports.js) stay clear of trees and houses */
const inField = (x, z) => !!(globalThis.HTS_AIRPORTS2 && globalThis.HTS_AIRPORTS2.inAerodrome(x, z));
function hash(n) { n = (n ^ 61) ^ (n >>> 16); n = n + (n << 3); n ^= n >>> 4; n = Math.imul(n, 0x27d4eb2d); n ^= n >>> 15; return (n >>> 0) / 4294967296; }
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }

function ringArea(f) { let a = 0; for (let i = 0, j = f.length - 2; i < f.length; j = i, i += 2) a += (f[j] - f[i]) * (f[j + 1] + f[i + 1]); return a / 2; }
function inRing(f, x, z) {
  let c = false;
  for (let i = 0, j = f.length - 2; i < f.length; j = i, i += 2) {
    const xi = f[i], zi = f[i + 1], xj = f[j], zj = f[j + 1];
    if ((zi > z) !== (zj > z) && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) c = !c;
  }
  return c;
}
function bbox(f) { let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9; for (let i = 0; i < f.length; i += 2) { x0 = Math.min(x0, f[i]); x1 = Math.max(x1, f[i]); z0 = Math.min(z0, f[i + 1]); z1 = Math.max(z1, f[i + 1]); } return [x0, z0, x1, z1]; }

/** Uniform-grid lookup of residential polygons for house placement. */
class PolyGrid {
  constructor(cell) { this.cell = cell; this.m = new Map(); }
  add(poly) {
    const [x0, z0, x1, z1] = bbox(poly[0]), c = this.cell;
    for (let gx = Math.floor(x0 / c); gx <= Math.floor(x1 / c); gx++) for (let gz = Math.floor(z0 / c); gz <= Math.floor(z1 / c); gz++) {
      const kk = gx + ',' + gz; let a = this.m.get(kk); if (!a) this.m.set(kk, (a = [])); a.push(poly);
    }
  }
  hit(x, z) {
    const a = this.m.get(Math.floor(x / this.cell) + ',' + Math.floor(z / this.cell)); if (!a) return false;
    for (const p of a) if (inRing(p[0], x, z)) { let hole = false; for (let h = 1; h < p.length; h++) if (inRing(p[h], x, z)) { hole = true; break; } if (!hole) return true; }
    return false;
  }
}

function makeTreeGeos() {
  /* live-oak style crown: three merged lobes (wide, slightly flat), baked light-top / dark-underside shading */
  const lobes = [[0, 1.6, 0, 1], [0.55, 1.35, 0.25, 0.72], [-0.5, 1.4, -0.2, 0.75]], P = [];
  for (const [lx, ly, lz, ls] of lobes) {
    const g = new THREE.IcosahedronGeometry(ls, 0); g.scale(1.15, 0.78, 1.15); g.translate(lx, ly, lz);
    const a = g.attributes.position.array; for (let i = 0; i < a.length; i++) P.push(a[i]); g.dispose();
  }
  const crown = new THREE.BufferGeometry(); crown.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); crown.computeVertexNormals();
  { let y0 = 1e9, y1 = -1e9; for (let i = 1; i < P.length; i += 3) { y0 = Math.min(y0, P[i]); y1 = Math.max(y1, P[i]); }
    const col = new Float32Array(P.length); for (let i = 0; i < P.length; i += 3) { const k = 0.55 + 0.45 * (P[i + 1] - y0) / (y1 - y0); col[i] = col[i + 1] = col[i + 2] = k; }
    crown.setAttribute('color', new THREE.BufferAttribute(col, 3)); }
  const trunk = new THREE.CylinderGeometry(0.09, 0.13, 1, 5); trunk.translate(0, 0.5, 0);
  const body = new THREE.BoxGeometry(1, 1, 1); body.translate(0, 0.5, 0);
  /* top/bottom faces map to the dark corner of the window texture (no "windows" on roofs) */
  { const uv = body.attributes.uv; for (let i = 8; i < 16; i++) uv.setXY(i, 0.02, 0.02); uv.needsUpdate = true; }
  const roof = new THREE.BufferGeometry();
  roof.setAttribute('position', new THREE.Float32BufferAttribute([
    -0.55, 0, -0.55, 0.55, 0, -0.55, 0, 0.42, -0.55, -0.55, 0, 0.55, 0, 0.42, 0.55, 0.55, 0, 0.55,
    -0.55, 0, -0.55, 0, 0.42, -0.55, 0, 0.42, 0.55, -0.55, 0, -0.55, 0, 0.42, 0.55, -0.55, 0, 0.55,
    0.55, 0, -0.55, 0.55, 0, 0.55, 0, 0.42, 0.55, 0.55, 0, -0.55, 0, 0.42, 0.55, 0, 0.42, -0.55], 3));
  roof.computeVertexNormals();
  return { crown, trunk, body, roof };
}

export function createHoustonLand({ parent, k = 1, base = '/data/houston/', offset = 60, slice = 16, radius = 12000, detailRadius = 5200, onHouse = null }) {
  const root = new THREE.Group(); root.name = 'houston-land'; parent.add(root);
  const X = (x) => (x - offset) * k + offset;
  const geos = makeTreeGeos();
  const mats = {
    land: new THREE.MeshLambertMaterial({ vertexColors: true, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 }),
    water: new THREE.MeshLambertMaterial({ color: LAND.water.c, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 }),
    crown: new THREE.MeshLambertMaterial({ color: 0xffffff, vertexColors: true }),
    trunk: new THREE.MeshLambertMaterial({ color: 0x5a4632 }),
    body: new THREE.MeshLambertMaterial({ color: 0xffffff, emissive: 0xffc27a, emissiveIntensity: 0, emissiveMap: (() => {
      /* two warm windows per wall — lit by app night logic (HTS_LAND2.materials.body) */
      const cv = document.createElement('canvas'); cv.width = cv.height = 64; const x = cv.getContext('2d');
      x.fillStyle = '#000'; x.fillRect(0, 0, 64, 64); x.fillStyle = '#ffd9a0';
      x.fillRect(10, 22, 13, 15); x.fillStyle = '#c99a62'; x.fillRect(40, 22, 13, 15);
      const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t;
    })() }),
    roof: new THREE.MeshLambertMaterial({ color: 0xffffff, side: THREE.DoubleSide }),
    rail: new THREE.MeshLambertMaterial({ color: 0x5d564e }),
  };
  const stats = { tiles: 0, tris: 0, trees: 0, houses: 0 };
  const tiles = new Map();
  let index = null, busy = false, majorBy = null;
  /* major roads (freeways, frontage roads, arterials) bucketed by land tile, so houses never sit on them */
  const majorRoads = () => majorBy || (majorBy = fetch(base + 'roads-major.json').then((r) => r.json()).then((d) => {
    const T = index.tile, m = new Map(), M = 40;
    for (const r of d.roads || []) {
      const p = r.p; let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9;
      for (let i = 0; i < p.length; i += 2) { x0 = Math.min(x0, p[i]); x1 = Math.max(x1, p[i]); z0 = Math.min(z0, p[i + 1]); z1 = Math.max(z1, p[i + 1]); }
      for (let tx = Math.floor((x0 - M) / T); tx <= Math.floor((x1 + M) / T); tx++) for (let tz = Math.floor((z0 - M) / T); tz <= Math.floor((z1 + M) / T); tz++) {
        const kk = tx + '_' + tz; let l = m.get(kk); if (!l) m.set(kk, (l = [])); l.push(r);
      }
    }
    return m;
  }).catch(() => new Map()));
  const ready = fetch(base + 'tiles/index.json').then((r) => r.json()).then((d) => { index = d; index.land = new Set(d.layers.land); index.local = new Set(d.layers.local || []); index.minor = new Set(d.layers.minor || []); return d; });

  /**
   * Drop sprawling OSM “water” that floods neighborhoods (e.g. Magnolia Park /
   * East End tagged as riverbank / ship-channel). Real ponds & compact lakes stay;
   * the Ship Channel / Brays still draw from waterways ribbons.
   *
   * Magnolia Park (East End) is dry residential south of the Turning Basin —
   * only the channel north edge and Brays on the east should read as water.
   */
  function inMagnoliaParkBand(x0, z0, x1, z1) {
    /* ~29.725–29.752 N, 95.31–95.27 W in world metres */
    return !(x1 < 6000 || x0 > 9800 || z1 < 1100 || z0 > 4200);
  }
  function isSpuriousWater(outer) {
    if (!outer || outer.length < 6) return true;
    const A = Math.abs(ringArea(outer));
    const [x0, z0, x1, z1] = bbox(outer);
    const bw = x1 - x0, bh = z1 - z0;
    const boxA = Math.max(1, bw * bh);
    const fill = A / boxA;
    const eastEnd = inMagnoliaParkBand(x0, z0, x1, z1);
    /* East End / Magnolia Park is dry residential — drop neighborhood-scale water fills */
    if (eastEnd) {
      if (A > 80000) return true;
      if ((bw > 900 || bh > 900) && fill < 0.62) return true;
      if (A > 400000 && (bw > 2500 || bh > 2500)) return true;
    }
    if (A < 200000) return false; /* small ponds / turning basins OK */
    if (A > 5e6 && fill > 0.4) return false; /* keep real bay / lake chunks */
    /* sprawling ship-channel mis-tags: huge bbox, low fill fraction */
    if ((bw > 1800 || bh > 1800) && fill < 0.45) return true;
    if (A > 600000 && fill < 0.38) return true;
    return false;
  }

  function polyTris(poly, y, col, P, C, I) {
    const outer = poly[0];
    if (outer.length < 6) return;
    const v2 = (f) => { const a = []; for (let i = 0; i < f.length; i += 2) a.push(new THREE.Vector2(f[i], f[i + 1])); if (a.length > 2 && a[0].equals(a[a.length - 1])) a.pop(); return a; };
    let contour = v2(outer); if (THREE.ShapeUtils.isClockWise(contour)) contour.reverse();
    const holes = poly.slice(1).map(v2).map((h) => (THREE.ShapeUtils.isClockWise(h) ? h : h.reverse()));
    let tris; try { tris = THREE.ShapeUtils.triangulateShape(contour, holes); } catch { return; }
    const all = contour.concat(...holes), b = P.length / 3;
    for (const p of all) { P.push(X(p.x), y, X(p.y)); C.push(col.r, col.g, col.b); }
    for (const t of tris) I.push(b + t[0], b + t[2], b + t[1]);
  }

  function ribbon(pts, w, y, P, I) {
    const n = pts.length / 2; if (n < 2) return;
    const b = P.length / 3;
    for (let i = 0; i < n; i++) {
      const i0 = Math.max(0, i - 1), i1 = Math.min(n - 1, i + 1);
      let tx = pts[2 * i1] - pts[2 * i0], tz = pts[2 * i1 + 1] - pts[2 * i0 + 1]; const l = Math.hypot(tx, tz) || 1; tx /= l; tz /= l;
      const nx = -tz * w / 2, nz = tx * w / 2;
      P.push(X(pts[2 * i] + nx), y, X(pts[2 * i + 1] + nz), X(pts[2 * i] - nx), y, X(pts[2 * i + 1] - nz));
      if (i) { const a = b + 2 * (i - 1); I.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); }
    }
  }

  function mesh(P, I, mat, C) {
    if (!I.length) return null;
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
    if (C) g.setAttribute('color', new THREE.Float32BufferAttribute(C, 3));
    g.setIndex(P.length / 3 > 65535 ? new THREE.Uint32BufferAttribute(I, 1) : new THREE.Uint16BufferAttribute(I, 1));
    const nrm = new Float32Array(P.length); for (let i = 1; i < nrm.length; i += 3) nrm[i] = 1;
    g.setAttribute('normal', new THREE.BufferAttribute(nrm, 3));
    g.computeBoundingSphere();
    const m = new THREE.Mesh(g, mat); m.receiveShadow = true; m.matrixAutoUpdate = false; m.updateMatrix();
    stats.tris += I.length / 3;
    return m;
  }

  function instanced(geo, mat, list, shadow) {
    if (!list.length) return null;
    const im = new THREE.InstancedMesh(geo, mat, list.length);
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), up = new THREE.Vector3(0, 1, 0), t = new THREE.Vector3(), s = new THREE.Vector3(), c = new THREE.Color();
    list.forEach((o, i) => {
      q.setFromAxisAngle(up, o.r || 0); t.set(X(o.x), o.y || 0, X(o.z)); s.set(o.sx * k, o.sy * k, o.sz * k);
      m4.compose(t, q, s); im.setMatrixAt(i, m4);
      if (o.c != null) im.setColorAt(i, c.setHex(o.c));
    });
    im.castShadow = !!shadow; im.receiveShadow = true; im.computeBoundingSphere();
    return im;
  }

  const yieldIf = async (st) => { if (performance.now() - st.t > slice) { await new Promise((r) => setTimeout(r, 0)); st.t = performance.now(); } };
  const MAX_TREES = 3200, MAX_HOUSES = 2400;
  const TREE_SCALE = 1;
  const HOUSE_STEP = 17;

  /** Base layer: land-use polygons, water, bayous, rail. Cheap; kept for the whole 12 km ring. */
  async function buildTile(key) {
    const d = await fetch(base + 'tiles/land/' + key + '.json').then((r) => r.json()).catch(() => null);
    if (!d) return null;
    const g = new THREE.Group();
    const P = [], C = [], I = [], WP = [], WI = [], RP = [], RI = [];
    const col = new THREE.Color(), st = { t: performance.now() };
    const resid = new PolyGrid(250), block = new PolyGrid(250), treeAreas = [];
    for (const cls of ORDER) {
      const multis = d.classes[cls]; if (!multis) continue;
      const spec = LAND[cls];
      /* each entry is one OSM area: a list of polygons, each [outerRing, ...holeRings] */
      for (const poly of multis.flat(1)) {
        if (cls === 'water') {
          if (isSpuriousWater(poly[0])) continue; /* Magnolia Park / East End flood fix */
          polyTris(poly, spec.y * k, col.setHex(spec.c), WP, [], WI);
        } else {
          col.setHex(spec.c).offsetHSL(0, 0, (hash(poly[0].length * 977 + (poly[0][0] | 0)) - 0.5) * 0.06);
          polyTris(poly, spec.y * k, col, P, C, I);
        }
        if (cls === 'residential') resid.add(poly);
        else if (NO_HOUSE[cls]) block.add(poly);
        if (TREE_DENS[cls]) treeAreas.push([cls, poly]);
        await yieldIf(st);
      }
    }
    /* Cap waterway ribbon width — OSM sometimes marks canal width as neighborhood-wide.
       East End / Magnolia Park: keep Brays & Ship Channel as thin channels, not swamp fill. */
    for (const wl of d.waterways || []) {
      let w = Math.min(wl.w || 8, 48);
      const p = wl.p;
      if (p && p.length >= 4) {
        let inEast = false;
        for (let i = 0; i < p.length; i += 2) {
          if (p[i] > 6000 && p[i] < 9800 && p[i + 1] > 1100 && p[i + 1] < 4200) { inEast = true; break; }
        }
        if (inEast) w = Math.min(w, 28);
      }
      ribbon(p, w, LAND.water.y * k + 0.01 * k, WP, WI);
    }
    for (const rl of d.rail || []) ribbon(rl.p, 3.4, 0.13 * k, RP, RI);
    for (const m of [mesh(P, I, mats.land, C), mesh(WP, WI, mats.water), mesh(RP, RI, mats.rail)]) if (m) g.add(m);
    return { g, resid, block, treeAreas };
  }

  /** Detail layer (trees, bushes, houses): built lazily only for tiles near the camera. */
  /* small LRU of local street tiles (shared by neighbouring tiles' house checks) */
  const _lt = new Map();
  function localTile(k) {
    let pr = _lt.get(k);
    if (!pr) { pr = fetch(base + 'tiles/local/' + k + '.json').then((r) => r.json()).catch(() => null); _lt.set(k, pr); if (_lt.size > 48) _lt.delete(_lt.keys().next().value); }
    return pr;
  }
  async function buildDetail(key, t) {
    const seed = key.split('_').reduce((a, v) => a * 131 + (+v + 997), 7), rnd = rng(seed), st = { t: performance.now() };
    const trees = [], bushes = [], houses = [], roofs = [], flats = [], garages = [];
    for (const [cls, poly] of t.treeAreas) {
      const area = Math.abs(ringArea(poly[0])), n = Math.min(cls === 'wood' ? 700 : 200, Math.floor(area * TREE_DENS[cls] * TREE_SCALE));
      const [x0, z0, x1, z1] = bbox(poly[0]);
      for (let i = 0, tries = 0; i < n && tries < n * 3 && trees.length + bushes.length < MAX_TREES; tries++) {
        const x = x0 + rnd() * (x1 - x0), z = z0 + rnd() * (z1 - z0);
        if (!inRing(poly[0], x, z) || inField(x, z)) continue; i++;
        const h = cls === 'scrub' ? 1 + rnd() * 1.6 : 7 + rnd() * 9;
        (cls === 'scrub' ? bushes : trees).push({ x, z, sx: h * 0.42, sy: h * 0.5, sz: h * 0.42, r: rnd() * 6.28, c: TREE_COLS[(rnd() * TREE_COLS.length) | 0] });
      }
      await yieldIf(st);
    }
    /* houses: both sides of real residential streets, inside residential land use, facing the street */
    if (index.local.has(key)) {
      const lr = await localTile(key);
      /* streets of the 8 neighbouring tiles too, so houses near a tile edge don't land on a street from the next tile */
      const [kx, kz] = key.split('_').map(Number), nbr = [];
      for (let dx = -1; dx <= 1; dx++) for (let dz = -1; dz <= 1; dz++) { const nk = (kx + dx) + '_' + (kz + dz); if ((dx || dz) && index.local.has(nk)) nbr.push(localTile(nk)); }
      const nbRoads = (await Promise.all(nbr)).flatMap((d) => (d && d.roads) || []);
      const mr = index.minor && index.minor.has(key) ? await fetch(base + 'tiles/minor/' + key + '.json').then((r) => r.json()).catch(() => null) : null;
      /* 4 m occupancy grid of every carriageway so houses never sit on a street */
      const occ = new Set(), cell = 4, ck = (gx, gz) => gx * 1000003 + gz;
      const maj = (await majorRoads()).get(key) || [];
      for (const r of ((lr && lr.roads) || []).concat((mr && mr.roads) || [], maj, nbRoads)) {
        const p = r.p, R = Math.ceil((r.w / 2 + 3) / cell);
        for (let i = 2; i < p.length; i += 2) {
          const ax = p[i - 2], az = p[i - 1], L = Math.hypot(p[i] - ax, p[i + 1] - az), n = Math.max(1, Math.ceil(L / cell));
          for (let j = 0; j <= n; j++) {
            const gx = Math.floor((ax + (p[i] - ax) * j / n) / cell), gz = Math.floor((az + (p[i + 1] - az) * j / n) / cell);
            for (let dx = -R; dx <= R; dx++) for (let dz = -R; dz <= R; dz++) occ.add(ck(gx + dx, gz + dz));
          }
        }
        await yieldIf(st);
      }
      const free = (x, z) => { for (const ox of [-6, 0, 6]) for (const oz of [-6, 0, 6]) if (occ.has(ck(Math.floor((x + ox) / cell), Math.floor((z + oz) / cell)))) return false; return true; };
      outer: for (const r of (lr && lr.roads) || []) {
        if (r.h !== 'residential' && r.h !== 'living_street' && r.h !== 'unclassified') continue;
        const p = r.p, setback = r.w / 2 + 18;
        let acc = 6 + rnd() * 8;
        for (let i = 2; i < p.length; i += 2) {
          const ax = p[i - 2], az = p[i - 1], dx = p[i] - ax, dz = p[i + 1] - az, L = Math.hypot(dx, dz);
          if (L < 1) continue;
          const ux = dx / L, uz = dz / L, ang = Math.atan2(ux, uz);
          for (; acc < L - 6; acc += HOUSE_STEP + rnd() * 6) {
            for (const sd of [-1, 1]) {
              const x = ax + ux * acc - uz * setback * sd, z = az + uz * acc + ux * setback * sd;
              if (rnd() < 0.08 || t.block.hit(x, z) || !free(x, z) || inField(x, z) || (window.HTS_HOUSE_EXCL && window.HTS_HOUSE_EXCL(X(x), X(z)))) continue;
              const w = 11 + rnd() * 5, dep = 12 + rnd() * 6, h = rnd() < 0.25 ? 6.8 + rnd() * 1.4 : 3.6 + rnd() * 1.2;
              houses.push({ x, z, sx: w, sy: h, sz: dep, r: ang, c: HOUSE_COLS[(rnd() * HOUSE_COLS.length) | 0] });
              roofs.push({ x, z, y: h * k, sx: w * 1.06, sy: 3 + rnd() * 1.5, sz: dep * 1.06, r: ang, c: ROOF_COLS[(rnd() * ROOF_COLS.length) | 0] });
              /* front garage + driveway to the kerb, backyard fence, sometimes a pool (common in Houston) */
              const px = -uz * sd, pz = ux * sd, gs = rnd() < 0.5 ? -1 : 1, ga = gs * (dep / 2 - 3.2);
              const gFront = setback - w / 2 - 6, dLen = Math.max(1.5, gFront - r.w / 2);
              if (rnd() < 0.7) {
                const gd = setback - w / 2 - 3;
                garages.push({ x: ax + ux * (acc + ga) + px * gd, z: az + uz * (acc + ga) + pz * gd, sx: 6, sy: 3.1, sz: 6.3, r: ang, c: houses[houses.length - 1].c });
              }
              const dd = r.w / 2 + dLen / 2;
              flats.push({ x: ax + ux * (acc + ga) + px * dd, z: az + uz * (acc + ga) + pz * dd, y: 0.1 * k, sx: dLen + 0.4, sy: 0.08, sz: 5, r: ang, c: 0xb9b6ae });
              const back = setback + w / 2 + 10;
              flats.push({ x: ax + ux * acc + px * back, z: az + uz * acc + pz * back, y: 0, sx: 0.12, sy: 1.8, sz: 20, r: ang, c: 0x86705a });
              if (rnd() < 0.14) { const pd = setback + w / 2 + 4.5; flats.push({ x: ax + ux * (acc - ga * 0.4) + px * pd, z: az + uz * (acc - ga * 0.4) + pz * pd, y: 0.1 * k, sx: 4.2, sy: 0.06, sz: 8, r: ang, c: 0x3fa6cc }); }
              if (rnd() < 0.6 && trees.length < MAX_TREES * 1.4) { const th = 6 + rnd() * 7; trees.push({ x: x - uz * sd * (dep * 0.5 + 6) + ux * (rnd() - 0.5) * 10, z: z + ux * sd * (dep * 0.5 + 6) + uz * (rnd() - 0.5) * 10, sx: th * 0.42, sy: th * 0.5, sz: th * 0.42, r: rnd() * 6.28, c: TREE_COLS[(rnd() * TREE_COLS.length) | 0] }); }
              if (onHouse) onHouse(x, z);
              if (houses.length >= MAX_HOUSES) break outer;
            }
          }
          acc -= L;
          await yieldIf(st);
        }
      }
    }
    const detail = new THREE.Group();
    for (const im of [
      instanced(geos.crown, mats.crown, trees.concat(bushes), true),
      instanced(geos.trunk, mats.trunk, trees.map((o) => ({ x: o.x, z: o.z, sx: o.sx, sy: o.sy * 2.2, sz: o.sx, r: 0 })), false),
      instanced(geos.body, mats.body, houses.concat(garages), true),
      instanced(geos.roof, mats.roof, roofs, true),
      instanced(geos.body, mats.body, flats, false),
    ]) if (im) detail.add(im);
    stats.trees += trees.length + bushes.length; stats.houses += houses.length;
    return detail;
  }

  const disposeGroup = (g) => g.traverse((o) => { if (o.isInstancedMesh) o.dispose(); else if (o.geometry && !Object.values(geos).includes(o.geometry)) o.geometry.dispose(); });

  let lastCam = null;
  async function update(camX, camZ, camDist = 0) {
    if (!index || busy) return;
    busy = true;
    try {
      /* while the camera is moving, skip heavy builds so panning stays smooth; catch up once it settles */
      const moved = lastCam ? Math.hypot(camX - lastCam[0], camZ - lastCam[1]) : 0;
      lastCam = [camX, camZ];
      const moving = moved > 120 * k;
      const mx = (camX - offset) / k + offset, mz = (camZ - offset) / k + offset, T = index.tile;
      const showDetail = camDist < 9000 * k;
      const dist = (key) => { const [ax, az] = key.split('_').map(Number); return Math.hypot((ax + 0.5) * T - mx, (az + 0.5) * T - mz); };
      /* detail: show/hide, drop far ones, build at most one nearby per tick */
      let nextDetail = null;
      for (const [key, t] of tiles) {
        if (!t.base) continue;
        const dd = dist(key), near = showDetail && dd < detailRadius + T * 0.7;
        if (t.detail) {
          t.detail.visible = near;
          if (dd > detailRadius * 1.8 + T) { disposeGroup(t.detail); t.base.g.remove(t.detail); t.detail = null; }
        } else if (near && (!nextDetail || dd < nextDetail[0])) nextDetail = [dd, key, t];
      }
      let built = false;
      if (nextDetail && !moving) { const [, key, t] = nextDetail; t.detail = await buildDetail(key, t.base); t.base.g.add(t.detail); built = true; }
      const r = Math.ceil(radius / T), tx0 = Math.floor(mx / T), tz0 = Math.floor(mz / T), want = [];
      for (let dz = -r; dz <= r; dz++) for (let dx = -r; dx <= r; dx++) {
        const key = (tx0 + dx) + '_' + (tz0 + dz), dd = dist(key);
        if (dd < radius + T * 0.7 && index.land.has(key) && !tiles.has(key)) want.push([dd, key]);
      }
      want.sort((a, b) => a[0] - b[0]);
      for (const [, key] of want.slice(0, built ? 0 : 1)) {
        const t = { base: null, detail: null }; tiles.set(key, t);
        t.base = await buildTile(key);
        if (t.base) { root.add(t.base.g); stats.tiles++; }
      }
      for (const [key, t] of tiles) {
        if (t.base && dist(key) > radius * 1.5 + T) { disposeGroup(t.base.g); root.remove(t.base.g); tiles.delete(key); }
      }
    } finally { busy = false; }
  }

  return { root, ready, update, stats, materials: mats, landmarks: () => (index && index.landmarks) || [] };
}
