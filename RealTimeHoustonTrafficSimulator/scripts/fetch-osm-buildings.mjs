/**
 * Fetch OSM building footprints for CBD tiles → public/data/cities/<id>/buildings-cbd.json
 *
 * Usage:
 *   node scripts/fetch-osm-buildings.mjs austin
 *   node scripts/fetch-osm-buildings.mjs houston
 *   node scripts/fetch-osm-buildings.mjs all
 *
 * Keeps lat/lng rings (runtime converts via city origin). Traffic/sim untouched.
 */
import { writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const OUT_ROOT = join(ROOT, "public", "data", "cities");

const OVERPASS_URLS = [
  "https://lz4.overpass-api.de/api/interpreter",
  "https://overpass-api.de/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
];

/** CBD bboxes [south, west, north, east] — tight cores for place fidelity */
const CITIES = {
  austin: {
    id: "austin",
    /* Lamar–I-35–MLK–Lady Bird + Rainey fringe */
    bbox: [30.254, -97.754, 30.285, -97.732],
    maxBuildings: 1200,
  },
  houston: {
    id: "houston",
    /* Inner downtown / Theater District / EaDo fringe */
    bbox: [29.748, -95.385, 29.772, -95.345],
    maxBuildings: 1400,
  },
};

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function overpass(query, label) {
  let lastErr;
  for (const url of OVERPASS_URLS) {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        process.stdout.write(`[${label}] ${url.split("/")[2]} try${attempt}… `);
        const r = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
            Accept: "application/json",
            "User-Agent": "HoustonTrafficSimulator/1.0 (buildings-cbd; local-dev)",
          },
          body: "data=" + encodeURIComponent(query),
        });
        if (!r.ok) {
          const t = await r.text().catch(() => "");
          throw new Error(`HTTP ${r.status} ${t.slice(0, 100)}`);
        }
        const j = await r.json();
        console.log(`${(j.elements || []).length} els`);
        return j;
      } catch (e) {
        lastErr = e;
        console.log("fail:", e.message);
        await sleep(3500 * attempt);
      }
    }
  }
  throw lastErr || new Error("Overpass failed");
}

function parseHeightM(tags = {}) {
  const raw = tags.height || tags["building:height"];
  if (raw) {
    const s = String(raw).trim().toLowerCase();
    const num = parseFloat(s.replace(/,/g, ""));
    if (Number.isFinite(num) && num > 0) {
      if (s.includes("ft") || s.includes("'") || s.includes("feet")) return num * 0.3048;
      if (s.includes("m") && !s.includes("ft")) return num;
      /* OSM default: meters when unit omitted */
      return num > 600 ? num * 0.3048 : num; /* absurd meter heights → likely feet */
    }
  }
  const levels = parseFloat(tags["building:levels"] || tags.levels || "");
  if (Number.isFinite(levels) && levels > 0) return Math.min(levels, 120) * 3.15;
  const b = tags.building || "";
  if (b === "skyscraper") return 80;
  if (b === "tower") return 45;
  if (b === "apartments" || b === "residential") return 18;
  if (b === "commercial" || b === "office") return 22;
  if (b === "retail" || b === "yes") return 10;
  if (b === "garage" || b === "parking" || b === "shed" || b === "roof") return 6;
  return 11;
}

function wayRing(way, nodes) {
  const ring = [];
  for (const id of way.nodes || []) {
    const n = nodes.get(id);
    if (!n) continue;
    ring.push([n.lat, n.lon]);
  }
  if (ring.length < 3) return null;
  const a = ring[0],
    b = ring[ring.length - 1];
  if (a[0] !== b[0] || a[1] !== b[1]) ring.push([a[0], a[1]]);
  if (ring.length < 4) return null;
  return ring;
}

function ringAreaApprox(ring) {
  /* shoelace on lon/lat — relative only */
  let a = 0;
  for (let i = 0; i < ring.length - 1; i++) {
    a += ring[i][1] * ring[i + 1][0] - ring[i + 1][1] * ring[i][0];
  }
  return Math.abs(a) * 0.5;
}

function buildQuery(bbox) {
  const [s, w, n, e] = bbox;
  return `
[out:json][timeout:120];
(
  way["building"](${s},${w},${n},${e});
);
(._;>;);
out body;
`;
}

async function fetchCity(cfg) {
  const data = await overpass(buildQuery(cfg.bbox), cfg.id);
  const nodes = new Map();
  const ways = [];
  for (const el of data.elements || []) {
    if (el.type === "node") nodes.set(el.id, el);
    else if (el.type === "way" && el.tags && el.tags.building) ways.push(el);
  }

  const buildings = [];
  for (const way of ways) {
    const tags = way.tags || {};
    if (tags["building:part"] === "yes") continue; /* outer shells only for v1 */
    if (tags.building === "no") continue;
    const ring = wayRing(way, nodes);
    if (!ring) continue;
    const area = ringAreaApprox(ring);
    if (area < 1e-10) continue; /* tiny junk */
    const h = parseHeightM(tags);
    if (h < 3) continue;
    buildings.push({
      id: "w" + way.id,
      name: tags.name || tags["addr:housename"] || "",
      building: tags.building || "yes",
      h: Math.round(h * 10) / 10,
      levels: tags["building:levels"] ? parseFloat(tags["building:levels"]) : null,
      material: tags["building:material"] || tags["building:colour"] || "",
      ring,
      _area: area,
    });
  }

  /* Prefer larger footprints if over cap */
  buildings.sort((a, b) => b._area - a._area);
  const trimmed = buildings.slice(0, cfg.maxBuildings).map(({ _area, ...rest }) => rest);

  const outDir = join(OUT_ROOT, cfg.id);
  await mkdir(outDir, { recursive: true });
  const pack = {
    city: cfg.id,
    generatedAt: new Date().toISOString(),
    source: "OpenStreetMap",
    attribution: "© OpenStreetMap contributors",
    bbox: cfg.bbox,
    count: trimmed.length,
    buildings: trimmed,
  };
  const jsonPath = join(outDir, "buildings-cbd.json");
  await writeFile(jsonPath, JSON.stringify(pack));
  await writeFile(
    join(outDir, "buildings-cbd.js"),
    "window.HTS_OSM_BUILDINGS=" + JSON.stringify(pack) + ";\n",
  );
  console.log(`[${cfg.id}] wrote ${trimmed.length} buildings → ${jsonPath}`);
  return pack;
}

const arg = (process.argv[2] || "austin").toLowerCase();
const list =
  arg === "all" ? Object.keys(CITIES) : CITIES[arg] ? [arg] : null;
if (!list) {
  console.error("Usage: node scripts/fetch-osm-buildings.mjs [austin|houston|all]");
  process.exit(1);
}

for (const id of list) {
  await fetchCity(CITIES[id]);
  if (list.length > 1) await sleep(2000);
}
console.log("Done.");
