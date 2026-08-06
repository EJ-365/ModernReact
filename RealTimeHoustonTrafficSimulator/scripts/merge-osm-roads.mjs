/**
 * Merge fragmented OSM freeway ways into longer corridors by ref/name,
 * and build a lightweight spatial index for streaming arterials/locals.
 *
 * Input: public/data/roads-*.json from fetch-osm-roads.mjs
 * Output: public/data/roads-freeway-merged.json + roads-index.json
 */
import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA = join(__dirname, "..", "public", "data");

function dist2(a, b) {
  const dx = a[0] - b[0];
  const dz = a[1] - b[1];
  return dx * dx + dz * dz;
}
function lengthOf(pts) {
  let L = 0;
  for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  return L;
}

/** Drop duplicate / near-duplicate vertices that make CatmullRom ribbons explode. */
function cleanPts(pts, minStep = 2.5) {
  if (!pts || pts.length < 2) return [];
  const out = [pts[0]];
  for (let i = 1; i < pts.length; i++) {
    const a = out[out.length - 1];
    const b = pts[i];
    if (Math.hypot(b[0] - a[0], b[1] - a[1]) >= minStep) out.push(b);
  }
  return out;
}

function reversalRate(pts) {
  if (!pts || pts.length < 3) return 0;
  let rev = 0;
  for (let i = 2; i < pts.length; i++) {
    const c = pts[i - 2];
    const a = pts[i - 1];
    const b = pts[i];
    const ax = a[0] - c[0];
    const az = a[1] - c[1];
    const bx = b[0] - a[0];
    const bz = b[1] - a[1];
    const la = Math.hypot(ax, az);
    const lb = Math.hypot(bx, bz);
    if (la > 0.2 && lb > 0.2 && ax * bx + az * bz < -0.55 * la * lb) rev++;
  }
  return rev / Math.max(1, pts.length - 2);
}

function corridorKey(r) {
  const ref = (r.ref || "").toUpperCase().replace(/\s+/g, "");
  if (ref) return "ref:" + ref;
  const n = (r.name || "").toUpperCase().replace(/\s+/g, " ").trim();
  if (n) return "name:" + n;
  return "id:" + r.id;
}

/**
 * Greedy chain merge — only accept joins that keep the path forward-facing.
 * Previous merge glued opposite carriageways / stubs and produced self-reversing
 * spaghetti (black screen + invisible close-up roads in the sim).
 */
function mergeGroup(ways, joinDist = 45) {
  if (!ways.length) return [];
  const unused = ways
    .map((w) => ({ ...w, pts: cleanPts(w.pts) }))
    .filter((w) => w.pts.length >= 2 && lengthOf(w.pts) >= 40 && reversalRate(w.pts) < 0.18);
  const out = [];
  while (unused.length) {
    let cur = unused.shift();
    let pts = cur.pts.slice();
    let grew = true;
    while (grew) {
      grew = false;
      for (let i = 0; i < unused.length; i++) {
        const o = unused[i];
        const a0 = pts[0];
        const a1 = pts[pts.length - 1];
        const b0 = o.pts[0];
        const b1 = o.pts[o.pts.length - 1];
        const j2 = joinDist * joinDist;
        const candidates = [];
        if (dist2(a1, b0) < j2) candidates.push(pts.concat(o.pts.slice(1)));
        if (dist2(a1, b1) < j2) candidates.push(pts.concat(o.pts.slice(0, -1).reverse()));
        if (dist2(a0, b1) < j2) candidates.push(o.pts.slice(0, -1).concat(pts));
        if (dist2(a0, b0) < j2) candidates.push(o.pts.slice().reverse().slice(0, -1).concat(pts));
        let best = null;
        let bestScore = Infinity;
        for (const cand of candidates) {
          const cleaned = cleanPts(cand);
          if (cleaned.length < 3) continue;
          const rr = reversalRate(cleaned);
          if (rr > 0.1) continue; /* reject U-turn spaghetti */
          if (rr < bestScore) {
            bestScore = rr;
            best = cleaned;
          }
        }
        if (best) {
          pts = best;
          unused.splice(i, 1);
          grew = true;
          break;
        }
      }
    }
    pts = cleanPts(pts);
    const L = lengthOf(pts);
    if (L < 80 || reversalRate(pts) > 0.12) continue;
    /* Resample control points */
    const maxPts = 120;
    let simp = pts;
    if (simp.length > maxPts) {
      const step = Math.ceil(simp.length / maxPts);
      const th = [];
      for (let i = 0; i < simp.length; i += step) th.push(simp[i]);
      if (th[th.length - 1] !== simp[simp.length - 1]) th.push(simp[simp.length - 1]);
      simp = cleanPts(th, 1.5);
    }
    const closed = dist2(simp[0], simp[simp.length - 1]) < 90 * 90 && simp.length > 12 && reversalRate(simp) < 0.08;
    out.push({
      ...cur,
      id: String(cur.id || "road").replace(/-\d+$/, "") + "-m" + out.length,
      closed,
      pts: closed ? simp.slice(0, -1) : simp,
      _len: Math.round(L),
    });
  }
  return out.sort((a, b) => b._len - a._len);
}

function cellKey(x, z, cell = 400) {
  return Math.floor(x / cell) + ":" + Math.floor(z / cell);
}

function buildIndex(roads, cell = 400) {
  const index = {};
  for (let i = 0; i < roads.length; i++) {
    const r = roads[i];
    const seen = new Set();
    for (const p of r.pts) {
      const k = cellKey(p[0], p[1], cell);
      if (seen.has(k)) continue;
      seen.add(k);
      if (!index[k]) index[k] = [];
      index[k].push(i);
    }
  }
  return { cell, index, count: roads.length };
}

async function main() {
  const freeway = JSON.parse(await readFile(join(DATA, "roads-freeway.json"), "utf8")).roads;
  const ramp = JSON.parse(await readFile(join(DATA, "roads-ramp.json"), "utf8")).roads;
  const arterial = JSON.parse(await readFile(join(DATA, "roads-arterial.json"), "utf8")).roads;
  const local = JSON.parse(await readFile(join(DATA, "roads-local.json"), "utf8")).roads;

  const groups = new Map();
  for (const r of freeway) {
    const k = corridorKey(r);
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k).push(r);
  }
  let merged = [];
  for (const [, ways] of groups) merged = merged.concat(mergeGroup(ways));
  /* Keep longest corridors; still include unnamed scraps up to a cap */
  merged = merged.sort((a, b) => b._len - a._len);
  const primary = merged.filter((r) => r._len > 800).slice(0, 120);
  const secondary = merged.filter((r) => r._len > 200 && r._len <= 800).slice(0, 200);
  const freewayMerged = primary.concat(secondary);
  console.log(`Freeway ways ${freeway.length} → merged ${freewayMerged.length}`);

  /* Ramps: keep longer ones only (visual clutter otherwise) */
  const rampsKept = ramp
    .map((r) => ({ ...r, _len: lengthOf(r.pts) }))
    .filter((r) => r._len > 60)
    .sort((a, b) => b._len - a._len)
    .slice(0, 2500);
  console.log(`Ramps ${ramp.length} → kept ${rampsKept.length}`);

  /* Arterials: keep longer segments for streaming index */
  const arts = arterial
    .map((r) => ({ ...r, _len: lengthOf(r.pts) }))
    .filter((r) => r._len > 120)
    .sort((a, b) => b._len - a._len)
    .slice(0, 8000);
  console.log(`Arterials ${arterial.length} → kept ${arts.length}`);

  /* Locals: length filter + cap for streaming */
  const locs = local
    .map((r) => ({ ...r, _len: lengthOf(r.pts) }))
    .filter((r) => r._len > 80)
    .sort((a, b) => b._len - a._len)
    .slice(0, 25000);
  console.log(`Locals ${local.length} → kept ${locs.length}`);

  await writeFile(join(DATA, "roads-freeway-merged.json"), JSON.stringify({ roads: freewayMerged }));
  await writeFile(join(DATA, "roads-ramp-kept.json"), JSON.stringify({ roads: rampsKept }));
  await writeFile(join(DATA, "roads-arterial-kept.json"), JSON.stringify({ roads: arts }));
  await writeFile(join(DATA, "roads-local-kept.json"), JSON.stringify({ roads: locs }));

  /* Boot set: longest freeways for traffic sim + enough ramps for interchanges */
  const bootFreeways = freewayMerged.slice(0, 90).map((r) => {
    const { _len, osmId, highway, layer, ref, ramp, ...rest } = r;
    return {
      ...rest,
      arterial: false,
      surface: false,
      share: Math.max(0.35, Math.min(1.6, (r.share || 0.8) * (r._len > 5000 ? 1.2 : 1))),
    };
  });
  const bootRamps = rampsKept.slice(0, 180).map((r) => {
    const { _len, osmId, highway, layer, ref, ...rest } = r;
    return {
      ...rest,
      arterial: false,
      surface: false,
      share: 0.12,
      prio: Math.max(rest.prio || 6, 6),
    };
  });
  const boot = { roads: bootFreeways.concat(bootRamps) };
  await writeFile(join(DATA, "roads-boot.json"), JSON.stringify(boot));
  /* Classic script tag can load this before app.html runs */
  await writeFile(
    join(DATA, "roads-boot.js"),
    "window.OSM_ROAD_BOOT=" + JSON.stringify(boot) + ";\n",
  );

  const index = {
    generatedAt: new Date().toISOString(),
    freeway: "/data/roads-freeway-merged.json",
    ramp: "/data/roads-ramp-kept.json",
    arterial: "/data/roads-arterial-kept.json",
    local: "/data/roads-local-kept.json",
    boot: "/data/roads-boot.json",
    arterialIndex: buildIndex(arts, 500),
    localIndex: buildIndex(locs, 400),
    counts: {
      freeway: freewayMerged.length,
      ramp: rampsKept.length,
      arterial: arts.length,
      local: locs.length,
      boot: boot.roads.length,
    },
  };
  await writeFile(join(DATA, "roads-index.json"), JSON.stringify(index));
  console.log("Wrote merged + index + boot", index.counts);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
