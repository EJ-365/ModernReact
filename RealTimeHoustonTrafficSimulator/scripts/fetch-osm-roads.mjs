/**
 * Build Houston road network JSON for the Three.js ribbon sim.
 *
 * Primary: tiled Overpass queries (freeways → ramps → arterials → local)
 * Fallback: BBBike Houston OSM XML extract
 *
 * Usage: npm run roads:fetch
 * Output: public/data/roads-*.json
 * Local only — does not deploy to Netlify.
 */
import { writeFile, mkdir, readFile, unlink } from "node:fs/promises";
import { createWriteStream, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { pipeline } from "node:stream/promises";
import { createGunzip } from "node:zlib";
import { Readable } from "node:stream";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const OUT = join(ROOT, "public", "data");
const CACHE = join(ROOT, "scripts", ".cache");

const ORIGIN_LAT = 29.7604;
const UNITS_PER_MILE = 210;

/* Metro tiles (S,W,N,E) — smaller than one giant bbox so Overpass stays happy */
const TILES = [
  [29.55, -95.75, 29.90, -95.40], // west / Katy / Energy Corridor
  [29.55, -95.40, 29.90, -95.10], // central / downtown / loop
  [29.55, -95.10, 29.90, -94.85], // east / ship channel / Baytown fringe
  [29.90, -95.75, 30.20, -95.40], // NW / Tomball / Cypress
  [29.90, -95.40, 30.20, -95.10], // north / IAH / Spring
  [29.90, -95.10, 30.20, -94.85], // NE
  [29.35, -95.75, 29.55, -95.40], // SW / Sugar Land fringe
  [29.35, -95.40, 29.55, -95.10], // south / Pearland / 288
  [29.35, -95.10, 29.55, -94.85], // SE / Clear Lake / Galveston fringe
];

const OVERPASS_URLS = [
  "https://lz4.overpass-api.de/api/interpreter",
  "https://overpass-api.de/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
];

const BBBIKE_URL = "https://download.bbbike.org/osm/bbbike/Houston/Houston.osm.gz";

function toWorld(lat, lng) {
  return {
    x: (lng + 95.3698) * 59.9 * UNITS_PER_MILE + 60,
    z: -(lat - ORIGIN_LAT) * 69 * UNITS_PER_MILE + 60,
  };
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function overpass(query, label) {
  let lastErr;
  for (const url of OVERPASS_URLS) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        process.stdout.write(`[${label}] ${url.split("/")[2]} try${attempt}… `);
        const r = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
            Accept: "application/json,text/plain,*/*",
            "User-Agent": "HoustonTrafficSimulator/1.0 (road-import; local-dev)",
          },
          body: "data=" + encodeURIComponent(query),
        });
        if (!r.ok) {
          const t = await r.text().catch(() => "");
          throw new Error(`HTTP ${r.status} ${t.slice(0, 80)}`);
        }
        const j = await r.json();
        console.log(`${(j.elements || []).length} els`);
        return j;
      } catch (e) {
        lastErr = e;
        console.log("fail:", e.message);
        await sleep(4000 * attempt);
      }
    }
  }
  throw lastErr || new Error("Overpass failed");
}

function classify(tags = {}) {
  const h = tags.highway || "";
  const ref = (tags.ref || "").replace(/\s+/g, " ").trim();
  const name = tags.name || ref || h;
  let short = ref || name;
  if (short.length > 18) short = short.slice(0, 16) + "…";

  const lanesTag = parseInt(tags.lanes || tags["lanes:forward"] || "0", 10);
  let lanes = Number.isFinite(lanesTag) && lanesTag > 0 ? Math.min(lanesTag, 6) : 2;
  let width = 18;
  let ff = 35;
  let share = 0.2;
  let baseY = 0.65;
  let prio = 0;
  let arterial = false;
  let surface = false;
  let ramp = false;
  let layer = "local";

  if (h === "motorway") {
    layer = "freeway";
    lanes = Math.max(lanes, 3);
    width = 12 + lanes * 8;
    ff = 65;
    share = 1.0;
    baseY = 0.82;
    prio = 7;
  } else if (h === "motorway_link") {
    layer = "ramp";
    ramp = true;
    lanes = Math.max(1, Math.min(lanes, 2));
    width = 10 + lanes * 6;
    ff = 45;
    share = 0.15;
    baseY = 1.2;
    prio = 6.5;
  } else if (h === "trunk") {
    layer = "freeway";
    lanes = Math.max(lanes, 2);
    width = 12 + lanes * 7;
    ff = 55;
    share = 0.7;
    baseY = 0.82;
    prio = 5;
  } else if (h === "trunk_link") {
    layer = "ramp";
    ramp = true;
    lanes = 1;
    width = 12;
    ff = 40;
    share = 0.1;
    baseY = 1.0;
    prio = 4.5;
  } else if (h === "primary") {
    layer = "arterial";
    arterial = true;
    surface = true;
    lanes = Math.max(lanes, 2);
    width = 10 + lanes * 5;
    ff = 45;
    share = 0.45;
    baseY = 0.7;
    prio = 2;
  } else if (h === "primary_link" || h === "secondary_link") {
    layer = "ramp";
    ramp = true;
    arterial = true;
    lanes = 1;
    width = 10;
    ff = 35;
    share = 0.08;
    baseY = 0.75;
    prio = 1.5;
  } else if (h === "secondary") {
    layer = "arterial";
    arterial = true;
    surface = true;
    lanes = Math.max(lanes, 2);
    width = 9 + lanes * 4.5;
    ff = 40;
    share = 0.35;
    baseY = 0.65;
    prio = 1.2;
  } else if (h === "tertiary") {
    layer = "local";
    arterial = true;
    surface = true;
    lanes = Math.max(1, Math.min(lanes, 2));
    width = 8 + lanes * 4;
    ff = 35;
    share = 0.2;
    baseY = 0.6;
    prio = 0.5;
  } else {
    layer = "local";
    arterial = true;
    surface = true;
    lanes = 1;
    width = h === "service" ? 7 : 9;
    ff = 28;
    share = 0.08;
    baseY = 0.55;
    prio = 0;
  }

  let id = `osm-${tags.id || Math.random().toString(36).slice(2, 9)}`;
  const refKey = ref.toUpperCase().replace(/[^A-Z0-9]/g, "");
  const known = {
    I10: "i10",
    I45: "i45",
    I610: "i610",
    I69: "us59",
    US59: "us59",
    US290: "us290",
    SH288: "sh288",
    TX288: "sh288",
    SH249: "sh249",
    TX249: "sh249",
    SH225: "sh225",
    TX225: "sh225",
    SH146: "sh146",
    TX99: "tx99",
    SH99: "tx99",
    BW8: "bw8",
    BELTWAY8: "bw8",
  };
  for (const [k, v] of Object.entries(known)) {
    if (refKey.includes(k)) {
      id = `${v}-${tags.id || id.slice(-6)}`;
      break;
    }
  }

  return {
    id,
    name,
    short,
    ref,
    highway: h,
    layer,
    closed: false,
    width: Math.round(width * 10) / 10,
    lanes,
    ff,
    share,
    baseY,
    prio,
    arterial,
    surface,
    ramp,
    osmId: tags.id || null,
  };
}

function simplify(pts, epsilon) {
  if (pts.length <= 2) return pts;
  let maxD = 0;
  let idx = 0;
  const a = pts[0];
  const b = pts[pts.length - 1];
  const dx = b[0] - a[0];
  const dz = b[1] - a[1];
  const len2 = dx * dx + dz * dz || 1;
  for (let i = 1; i < pts.length - 1; i++) {
    const p = pts[i];
    const t = ((p[0] - a[0]) * dx + (p[1] - a[1]) * dz) / len2;
    const projX = a[0] + t * dx;
    const projZ = a[1] + t * dz;
    const d = Math.hypot(p[0] - projX, p[1] - projZ);
    if (d > maxD) {
      maxD = d;
      idx = i;
    }
  }
  if (maxD > epsilon) {
    const left = simplify(pts.slice(0, idx + 1), epsilon);
    const right = simplify(pts.slice(idx), epsilon);
    return left.slice(0, -1).concat(right);
  }
  return [a, b];
}

function wayToRoad(way, nodes) {
  const tags = { ...(way.tags || {}), id: way.id };
  if (!tags.highway) return null;
  const meta = classify(tags);
  const pts = [];
  for (const nid of way.nodes || []) {
    const n = nodes.get(nid);
    if (!n) continue;
    const w = toWorld(n.lat, n.lon);
    pts.push([Math.round(w.x * 10) / 10, Math.round(w.z * 10) / 10]);
  }
  if (pts.length < 2) return null;

  const dedup = [pts[0]];
  for (let i = 1; i < pts.length; i++) {
    if (Math.hypot(pts[i][0] - dedup.at(-1)[0], pts[i][1] - dedup.at(-1)[1]) > 2) {
      dedup.push(pts[i]);
    }
  }
  if (dedup.length < 2) return null;

  const eps = meta.layer === "local" ? 28 : meta.layer === "arterial" ? 18 : meta.ramp ? 10 : 14;
  let simp = simplify(dedup, eps);
  if (simp.length < 2) simp = dedup;

  const maxPts = meta.layer === "local" ? 24 : meta.layer === "arterial" ? 48 : 80;
  if (simp.length > maxPts) {
    const step = Math.ceil(simp.length / maxPts);
    const thinned = [];
    for (let i = 0; i < simp.length; i += step) thinned.push(simp[i]);
    const last = simp[simp.length - 1];
    if (thinned.at(-1) !== last) thinned.push(last);
    simp = thinned;
  }

  const closed =
    Math.hypot(simp[0][0] - simp.at(-1)[0], simp[0][1] - simp.at(-1)[1]) < 80 && simp.length > 8;
  if (closed) simp = simp.slice(0, -1);

  return { ...meta, closed, pts: simp };
}

function parseOverpassJson(data) {
  const nodes = new Map();
  const ways = [];
  for (const el of data.elements || []) {
    if (el.type === "node") nodes.set(el.id, { lat: el.lat, lon: el.lon });
    else if (el.type === "way" && el.tags?.highway) ways.push(el);
  }
  return { nodes, ways };
}

function buildTileQuery(bbox, highways) {
  const [s, w, n, e] = bbox;
  const filters = highways.map((h) => `way["highway"="${h}"](${s},${w},${n},${e});`).join("\n  ");
  return `
[out:json][timeout:180];
(
  ${filters}
);
out body;
>;
out skel qt;
`.trim();
}

async function fetchLayerTiled(name, highways) {
  const byId = new Map();
  for (let i = 0; i < TILES.length; i++) {
    const bbox = TILES[i];
    const label = `${name}-t${i + 1}/${TILES.length}`;
    try {
      const data = await overpass(buildTileQuery(bbox, highways), label);
      const { nodes, ways } = parseOverpassJson(data);
      for (const way of ways) {
        if (byId.has(way.id)) continue;
        const road = wayToRoad(way, nodes);
        if (road) byId.set(way.id, road);
      }
    } catch (e) {
      console.warn(`[${label}] skipped: ${e.message}`);
    }
    await sleep(1500);
  }
  const roads = [...byId.values()];
  console.log(`[${name}] unique roads: ${roads.length}`);
  return roads;
}

/** Minimal OSM XML parser for ways + nodes (BBBike fallback). */
function parseOsmXml(xml) {
  const nodes = new Map();
  const ways = [];
  const nodeRe = /<node\s+id="(\d+)"[^>]*lat="([^"]+)"[^>]*lon="([^"]+)"/g;
  let m;
  while ((m = nodeRe.exec(xml))) {
    nodes.set(Number(m[1]), { lat: Number(m[2]), lon: Number(m[3]) });
  }
  const wayRe = /<way\s+id="(\d+)"([\s\S]*?)<\/way>/g;
  while ((m = wayRe.exec(xml))) {
    const id = Number(m[1]);
    const body = m[2];
    const tags = { id };
    const tagRe = /<tag\s+k="([^"]*)"\s+v="([^"]*)"\s*\/>/g;
    let tm;
    while ((tm = tagRe.exec(body))) tags[tm[1]] = tm[2];
    if (!tags.highway) continue;
    const nds = [];
    const ndRe = /<nd\s+ref="(\d+)"\s*\/>/g;
    let nm;
    while ((nm = ndRe.exec(body))) nds.push(Number(nm[1]));
    ways.push({ id, tags, nodes: nds });
  }
  return { nodes, ways };
}

async function downloadBbbike() {
  await mkdir(CACHE, { recursive: true });
  const gzPath = join(CACHE, "Houston.osm.gz");
  const osmPath = join(CACHE, "Houston.osm");
  if (!existsSync(osmPath)) {
    console.log("Downloading BBBike Houston OSM extract…");
    const r = await fetch(BBBIKE_URL, {
      headers: { "User-Agent": "HoustonTrafficSimulator/1.0 (road-import)" },
    });
    if (!r.ok) throw new Error(`BBBike download ${r.status}`);
    await pipeline(Readable.fromWeb(r.body), createWriteStream(gzPath));
    await pipeline(createReadStreamCompat(gzPath), createGunzip(), createWriteStream(osmPath));
    try {
      await unlink(gzPath);
    } catch (_) {}
    console.log("Extracted", osmPath);
  } else {
    console.log("Using cached", osmPath);
  }
  return readFile(osmPath, "utf8");
}

function createReadStreamCompat(path) {
  return import("node:fs").then((fs) => fs.createReadStream(path));
}

async function fromBbbike() {
  const { createReadStream } = await import("node:fs");
  await mkdir(CACHE, { recursive: true });
  const gzPath = join(CACHE, "Houston.osm.gz");
  const osmPath = join(CACHE, "Houston.osm");
  if (!existsSync(osmPath)) {
    console.log("Downloading BBBike Houston OSM extract…");
    const r = await fetch(BBBIKE_URL, {
      headers: { "User-Agent": "HoustonTrafficSimulator/1.0 (road-import)" },
    });
    if (!r.ok) throw new Error(`BBBike download ${r.status}`);
    await pipeline(Readable.fromWeb(r.body), createWriteStream(gzPath));
    await pipeline(createReadStream(gzPath), createGunzip(), createWriteStream(osmPath));
    try {
      await unlink(gzPath);
    } catch (_) {}
  }
  console.log("Parsing OSM XML (this can take a minute)…");
  const xml = await readFile(osmPath, "utf8");
  const { nodes, ways } = parseOsmXml(xml);
  console.log(`BBBike: ${nodes.size} nodes, ${ways.length} highway ways`);
  const buckets = { freeway: [], ramp: [], arterial: [], local: [] };
  for (const way of ways) {
    const road = wayToRoad(way, nodes);
    if (!road) continue;
    if (road.layer === "freeway") buckets.freeway.push(road);
    else if (road.layer === "ramp") buckets.ramp.push(road);
    else if (road.layer === "arterial") buckets.arterial.push(road);
    else buckets.local.push(road);
  }
  return buckets;
}

async function writeBuckets(buckets) {
  await mkdir(OUT, { recursive: true });
  const counts = {
    freeway: buckets.freeway.length,
    ramp: buckets.ramp.length,
    arterial: buckets.arterial.length,
    local: buckets.local.length,
    total:
      buckets.freeway.length +
      buckets.ramp.length +
      buckets.arterial.length +
      buckets.local.length,
  };
  const manifest = {
    generatedAt: new Date().toISOString(),
    origin: { lat: ORIGIN_LAT, lng: -95.3698 },
    unitsPerMile: UNITS_PER_MILE,
    counts,
    files: {
      freeway: "/data/roads-freeway.json",
      ramp: "/data/roads-ramp.json",
      arterial: "/data/roads-arterial.json",
      local: "/data/roads-local.json",
    },
  };
  await writeFile(join(OUT, "roads-freeway.json"), JSON.stringify({ roads: buckets.freeway }));
  await writeFile(join(OUT, "roads-ramp.json"), JSON.stringify({ roads: buckets.ramp }));
  await writeFile(join(OUT, "roads-arterial.json"), JSON.stringify({ roads: buckets.arterial }));
  await writeFile(join(OUT, "roads-local.json"), JSON.stringify({ roads: buckets.local }));
  await writeFile(join(OUT, "roads-manifest.json"), JSON.stringify(manifest, null, 2));
  console.log("\nWrote", OUT);
  console.log(JSON.stringify(counts, null, 2));
  return counts;
}

async function main() {
  await mkdir(OUT, { recursive: true });

  /* Prefer BBBike extract — one download, full Houston metro, no Overpass quotas */
  try {
    const buckets = await fromBbbike();
    if (buckets.freeway.length + buckets.ramp.length > 50) {
      await writeBuckets(buckets);
      return;
    }
    console.warn("BBBike extract looked thin — falling back to Overpass tiles");
  } catch (e) {
    console.warn("BBBike failed:", e.message, "— trying Overpass tiles");
  }

  const freeway = await fetchLayerTiled("freeway", ["motorway", "trunk"]);
  const ramps = await fetchLayerTiled("ramps", [
    "motorway_link",
    "trunk_link",
    "primary_link",
    "secondary_link",
  ]);
  const arterial = await fetchLayerTiled("arterial", ["primary", "secondary"]);
  const local = await fetchLayerTiled("local", [
    "tertiary",
    "residential",
    "unclassified",
    "living_street",
  ]);
  await writeBuckets({ freeway, ramp: ramps, arterial, local });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
