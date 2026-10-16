/**
 * Fetch real OSM 3D building footprints (Simple 3D Buildings) for every metro pack
 * → public/data/cities/<id>/buildings.json
 *
 * Usage:
 *   node scripts/fetch-osm-buildings.mjs houston
 *   node scripts/fetch-osm-buildings.mjs all
 *
 * Output format (compact, v2):
 *   { v:2, city, origin:[lat,lng], q:1e-5, buildings:[[hM, minHM, colorHex|0, roofHex|0, name, ring, holes?], …] }
 *   ring = flat int array of (lat-originLat)/q, (lng-originLng)/q pairs (open ring, CCW not guaranteed)
 * Buildings with building:part children are replaced by their parts (OSM S3DB convention).
 */
import { writeFile, mkdir, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_ROOT = join(__dirname, "..", "public", "data", "cities");

const OVERPASS_URLS = [
  "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
  "https://overpass-api.de/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
  "https://lz4.overpass-api.de/api/interpreter",
];

/** Researched cores per metro: [south, west, north, east] tiles (downtown + major high-rise districts). */
export const CITIES = {
  houston: { origin: [29.7604, -95.3698], max: 9000, tiles: [
    [29.744, -95.386, 29.774, -95.350], /* Downtown / Theater District / EaDo */
    [29.735, -95.470, 29.760, -95.445], /* Uptown / Galleria / Williams Tower */
    [29.700, -95.410, 29.716, -95.390], /* Texas Medical Center */
    [29.725, -95.440, 29.735, -95.425], /* Greenway Plaza */
  ] },
  austin: { origin: [30.2672, -97.7431], max: 7000, tiles: [
    [30.252, -97.757, 30.290, -97.728], /* CBD / Capitol / Rainey / UT south */
  ] },
  sanantonio: { origin: [29.4246, -98.4951], max: 6000, tiles: [
    [29.410, -98.506, 29.440, -98.476], /* Downtown / River Walk / Alamo */
  ] },
  dallas: { origin: [32.7797, -96.7980], max: 7000, tiles: [
    [32.770, -96.815, 32.800, -96.780], /* Downtown / Arts District / Uptown edge */
  ] },
  losangeles: { origin: [34.05223, -118.24368], max: 8000, tiles: [
    [34.035, -118.272, 34.065, -118.235], /* DTLA / Bunker Hill / Financial District */
    [34.052, -118.425, 34.065, -118.405], /* Century City */
  ] },
  newyork: { origin: [40.71278, -74.00601], max: 14000, tiles: [
    [40.700, -74.020, 40.722, -73.998], /* Lower Manhattan / FiDi / WTC */
    [40.740, -74.005, 40.770, -73.965], /* Midtown / Hudson Yards / Billionaires' Row */
  ] },
  boston: { origin: [42.36008, -71.05888], max: 7000, tiles: [
    [42.343, -71.090, 42.368, -71.045], /* Downtown / Back Bay / Financial District */
  ] },
  chicago: { origin: [41.8781, -87.6298], max: 9000, tiles: [
    [41.864, -87.645, 41.905, -87.610], /* Loop / River North / Streeterville */
  ] },
  miami: { origin: [25.7617, -80.1918], max: 7000, tiles: [
    [25.752, -80.205, 25.795, -80.180], /* Brickell / Downtown / Edgewater */
  ] },
  seattle: { origin: [47.6062, -122.3321], max: 7000, tiles: [
    [47.595, -122.352, 47.628, -122.320], /* Downtown / Belltown / SLU / Space Needle */
  ] },
  denver: { origin: [39.7392, -104.9903], max: 6000, tiles: [
    [39.735, -105.010, 39.760, -104.980], /* Downtown / LoDo / Union Station */
  ] },
  atlanta: { origin: [33.7490, -84.3880], max: 8000, tiles: [
    [33.745, -84.400, 33.795, -84.375], /* Downtown / Midtown */
    [33.838, -84.390, 33.852, -84.355], /* Buckhead */
  ] },
  phoenix: { origin: [33.4484, -112.0740], max: 6000, tiles: [
    [33.440, -112.085, 33.468, -112.060], /* Downtown Phoenix */
  ] },
  philadelphia: { origin: [39.9526, -75.1652], max: 7000, tiles: [
    [39.944, -75.182, 39.962, -75.140], /* Center City / Old City */
  ] },
  minneapolis: { origin: [44.9778, -93.2650], max: 6000, tiles: [
    [44.965, -93.285, 44.988, -93.255], /* Downtown Minneapolis */
    [44.940, -93.105, 44.955, -93.085], /* Downtown St. Paul */
  ] },
  neworleans: { origin: [29.9511, -90.0715], max: 6000, tiles: [
    [29.940, -90.085, 29.962, -90.058], /* CBD / French Quarter / Superdome */
  ] },
};

const CSS = { white:"#f2f2f2", black:"#2a2a2a", grey:"#8c8c8c", gray:"#8c8c8c", silver:"#b8bcc2", red:"#9a3b2e", brown:"#7a5a40",
  beige:"#d8c8a8", tan:"#c8b08a", yellow:"#d8c070", orange:"#c87a40", blue:"#5d7fa8", lightblue:"#9cb8d0", darkblue:"#2f4466",
  green:"#5a7a5a", lightgrey:"#c4c4c4", lightgray:"#c4c4c4", darkgrey:"#4a4a4a", darkgray:"#4a4a4a", cream:"#efe6cf", maroon:"#6a2a22", pink:"#d8a8a8", ivory:"#efe9d6", gold:"#c8a850", sandstone:"#c8b08a" };
const MAT = { glass:"#6d8aa6", brick:"#8e4f3c", concrete:"#a8a49c", stone:"#c2b49a", metal:"#9aa2ac", steel:"#9aa2ac",
  plaster:"#d8d0c0", wood:"#8a6a48", limestone:"#d6cbb0", granite:"#8e7f78", sandstone:"#c8a878", marble:"#e2ddd2", cement_block:"#b0aca2", aluminium:"#b4bac2", copper:"#6a9a88" };

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

async function overpass(query, label) {
  let lastErr;
  for (const url of OVERPASS_URLS) {
    for (let attempt = 1; attempt <= 1; attempt++) {
      try {
        process.stdout.write(`[${label}] ${url.split("/")[2]} try${attempt}… `);
        const r = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8", Accept: "application/json",
            "User-Agent": "LiveTrafficSimulator/11 (osm 3d buildings; github.com/EJ-365)" },
          body: "data=" + encodeURIComponent(query),
          signal: AbortSignal.timeout(100000),
        });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const j = await r.json();
        console.log(`${(j.elements || []).length} els`);
        return j;
      } catch (e) {
        lastErr = e;
        console.log("fail:", e.message);
        await sleep(5000 * attempt);
      }
    }
  }
  throw lastErr || new Error("Overpass failed");
}

function num(v) {
  if (v == null) return NaN;
  const s = String(v).trim().toLowerCase().replace(/,/g, "");
  const n = parseFloat(s);
  if (!Number.isFinite(n)) return NaN;
  if (/ft|feet|'/.test(s)) return n * 0.3048;
  return n;
}
function colorOf(v) {
  if (!v) return 0;
  const s = String(v).trim().toLowerCase().replace(/[\s_-]/g, "");
  if (/^#[0-9a-f]{6}$/.test(s)) return s;
  if (/^#[0-9a-f]{3}$/.test(s)) return "#" + s[1] + s[1] + s[2] + s[2] + s[3] + s[3];
  return CSS[s] || 0;
}
function heights(t) {
  let h = num(t.height ?? t["building:height"]);
  const lv = num(t["building:levels"]);
  const rl = num(t["roof:levels"]);
  if (!Number.isFinite(h) && Number.isFinite(lv)) h = Math.min(lv, 130) * 3.3 + (Number.isFinite(rl) ? rl * 2.5 : 0) + 1.5;
  if (!Number.isFinite(h)) {
    const b = t.building || t["building:part"] || "";
    h = { skyscraper: 120, tower: 60, office: 24, commercial: 14, hotel: 30, apartments: 18, residential: 9, house: 7,
      detached: 7, retail: 7, church: 16, cathedral: 30, stadium: 32, parking: 12, garage: 4, industrial: 10,
      warehouse: 9, school: 10, university: 16, hospital: 24, civic: 14, government: 16, train_station: 14 }[b] ?? 9;
  }
  if (h > 600) h *= 0.3048;
  let mh = num(t.min_height);
  if (!Number.isFinite(mh)) { const ml = num(t["building:min_level"]); mh = Number.isFinite(ml) ? ml * 3.3 : 0; }
  return [Math.round(Math.min(h, 560) * 10) / 10, Math.round(Math.max(0, Math.min(mh, h - 1)) * 10) / 10];
}

function closeRing(pts) {
  if (pts.length < 3) return null;
  const a = pts[0], b = pts[pts.length - 1];
  if (a[0] === b[0] && a[1] === b[1]) pts = pts.slice(0, -1);
  return pts.length >= 3 ? pts : null;
}
function stitch(segs) {
  const rings = [];
  const pool = segs.map((s) => s.slice());
  while (pool.length) {
    let cur = pool.shift();
    let guard = 0;
    while (guard++ < 500) {
      const end = cur[cur.length - 1];
      if (cur.length > 3 && end[0] === cur[0][0] && end[1] === cur[0][1]) break;
      const i = pool.findIndex((s) => (s[0][0] === end[0] && s[0][1] === end[1]) || (s[s.length - 1][0] === end[0] && s[s.length - 1][1] === end[1]));
      if (i < 0) break;
      let s = pool.splice(i, 1)[0];
      if (!(s[0][0] === end[0] && s[0][1] === end[1])) s = s.reverse();
      cur = cur.concat(s.slice(1));
    }
    const r = closeRing(cur);
    if (r) rings.push(r);
  }
  return rings;
}
function pip(pt, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [yi, xi] = ring[i], [yj, xj] = ring[j];
    if ((yi > pt[0]) !== (yj > pt[0]) && pt[1] < ((xj - xi) * (pt[0] - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
function centroid(r) { let a = 0, b = 0; for (const p of r) { a += p[0]; b += p[1]; } return [a / r.length, b / r.length]; }
function areaM2(r) {
  let s = 0; const k = 111320, c = Math.cos((r[0][0] * Math.PI) / 180);
  for (let i = 0; i < r.length; i++) { const p = r[i], q = r[(i + 1) % r.length]; s += p[1] * c * k * q[0] * k - q[1] * c * k * p[0] * k; }
  return Math.abs(s) / 2;
}

function buildQuery([s, w, n, e]) {
  const bb = `(${s},${w},${n},${e})`;
  return `[out:json][timeout:90];(way["building"]${bb};way["building:part"]${bb};relation["type"="multipolygon"]["building"]${bb};relation["type"="multipolygon"]["building:part"]${bb};);out tags geom qt;`;
}

/** Busy mirrors time out on big bboxes: on failure split the tile into quarters (up to 2 levels). */
async function fetchTile(bb, label, depth = 0) {
  try {
    return (await overpass(buildQuery(bb), label)).elements || [];
  } catch (e) {
    if (depth >= 3) throw e;
    const [s, w, n, ea] = bb, mLat = (s + n) / 2, mLng = (w + ea) / 2;
    const quads = [[s, w, mLat, mLng], [s, mLng, mLat, ea], [mLat, w, n, mLng], [mLat, mLng, n, ea]];
    const out = [];
    for (let i = 0; i < 4; i++) { out.push(...(await fetchTile(quads[i], `${label}.${i}`, depth + 1))); await sleep(2000); }
    return out;
  }
}

async function fetchCity(id) {
  const cfg = CITIES[id];
  const feats = [];
  const seen = new Set();
  for (let ti = 0; ti < cfg.tiles.length; ti++) {
    const elements = await fetchTile(cfg.tiles[ti], `${id}#${ti}`);
    for (const el of elements) {
      const key = el.type + el.id;
      if (seen.has(key)) continue;
      seen.add(key);
      const t = el.tags || {};
      if (t.building === "no" || t["building:part"] === "no") continue;
      if (t.location === "underground" || t.layer && Number(t.layer) < 0) continue;
      let outers = [], inners = [];
      if (el.type === "way" && el.geometry) {
        const r = closeRing(el.geometry.map((g) => [g.lat, g.lon]));
        if (r) outers.push(r);
      } else if (el.type === "relation" && el.members) {
        const o = [], inn = [];
        for (const m of el.members) {
          if (m.type !== "way" || !m.geometry) continue;
          (m.role === "inner" ? inn : o).push(m.geometry.map((g) => [g.lat, g.lon]));
        }
        outers = stitch(o); inners = stitch(inn);
      }
      for (const ring of outers) {
        const holes = inners.filter((h) => pip(h[0], ring));
        feats.push({ part: !!t["building:part"] && !t.building, t, ring, holes, c: centroid(ring), a: areaM2(ring) });
      }
    }
    await sleep(3000);
  }
  /* S3DB: outlines that contain parts are represented by those parts */
  const parts = feats.filter((f) => f.part);
  const grid = new Map(); const G = 0.002;
  for (const p of parts) { const k = Math.floor(p.c[0] / G) + ":" + Math.floor(p.c[1] / G); (grid.get(k) || grid.set(k, []).get(k)).push(p); }
  const out = [];
  for (const f of feats) {
    if (f.a < 12) continue;
    if (!f.part) {
      let hasPart = false;
      const k0 = Math.floor(f.c[0] / G), k1 = Math.floor(f.c[1] / G);
      outer: for (let i = -2; i <= 2; i++) for (let j = -2; j <= 2; j++) {
        for (const p of grid.get(k0 + i + ":" + (k1 + j)) || []) if (pip(p.c, f.ring)) { hasPart = true; break outer; }
      }
      if (hasPart) continue;
    }
    const [h, mh] = heights(f.t);
    if (h < 2.5 || h - mh < 1) continue;
    const col = colorOf(f.t["building:colour"]) || MAT[String(f.t["building:material"] || "").toLowerCase()] || 0;
    const roof = colorOf(f.t["roof:colour"]) || 0;
    const name = String(f.t.name || "").slice(0, 60);
    out.push({ h, mh, col, roof, name, ring: f.ring, holes: f.holes, score: f.a * Math.sqrt(h) });
  }
  out.sort((a, b) => b.score - a.score);
  const q = 1e-5, [oLat, oLng] = cfg.origin;
  const enc = (r) => { const a = []; for (const [la, ln] of r) a.push(Math.round((la - oLat) / q), Math.round((ln - oLng) / q)); return a; };
  const buildings = out.slice(0, cfg.max).map((b) => {
    const row = [b.h, b.mh, b.col, b.roof, b.name, enc(b.ring)];
    if (b.holes.length) row.push(b.holes.map(enc));
    return row;
  });
  const pack = { v: 2, city: id, generatedAt: new Date().toISOString(), source: "OpenStreetMap", attribution: "© OpenStreetMap contributors (ODbL)",
    origin: cfg.origin, q, tiles: cfg.tiles, count: buildings.length, buildings };
  const dir = join(OUT_ROOT, id);
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, "buildings.json"), JSON.stringify(pack));
  console.log(`[${id}] wrote ${buildings.length} buildings (of ${out.length}; ${parts.length} parts)`);
}

const arg = (process.argv[2] || "all").toLowerCase();
const list = arg === "all" ? Object.keys(CITIES) : arg === "missing" ? Object.keys(CITIES).filter((k) => !existsSync(join(OUT_ROOT, k, "buildings.json"))) : arg.split(",").filter((k) => CITIES[k]);
if (!list.length) { console.error("Usage: node scripts/fetch-osm-buildings.mjs [all|houston,austin,…]"); process.exit(1); }
for (const id of list) {
  try { await fetchCity(id); } catch (e) { console.error(`[${id}] FAILED`, e.message); }
  await sleep(3000);
}
/* Coverage module: lets the app skip procedural towers where real OSM buildings exist (sync, before fetch). */
const cover = {};
for (const id of Object.keys(CITIES)) {
  const f = join(OUT_ROOT, id, "buildings.json");
  if (!existsSync(f)) continue;
  try { const j = JSON.parse(await readFile(f, "utf8")); if (j.count > 0) cover[id] = j.tiles; } catch {}
}
await writeFile(join(__dirname, "..", "src", "cities", "osm-coverage.js"),
  "/* Generated by scripts/fetch-osm-buildings.mjs — OSM 3D building tiles [s,w,n,e] per city. */\nexport const OSM_BUILDING_COVERAGE = " + JSON.stringify(cover) + ";\n");
console.log("Done. Coverage:", Object.keys(cover).join(", "));
