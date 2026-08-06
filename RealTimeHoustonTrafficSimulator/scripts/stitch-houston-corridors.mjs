#!/usr/bin/env node
/**
 * Stitch OSM freeway/arterial fragments into continuous Houston corridors
 * for LEGACY_ROAD_DEFS.pts replacement. Writes public/data/roads-corridors.json
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const fw = JSON.parse(fs.readFileSync(path.join(root, 'public/data/roads-freeway-merged.json'), 'utf8'));
const art = JSON.parse(fs.readFileSync(path.join(root, 'public/data/roads-arterial-kept.json'), 'utf8'));
const pool = [...(fw.roads || []), ...(art.roads || [])];

function len(pts) {
  let L = 0;
  for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  return L;
}
function rev(pts) { return pts.slice().reverse(); }
function endDist(a, b) { return Math.hypot(a[0] - b[0], a[1] - b[1]); }
function quality(pts) {
  if (!pts || pts.length < 3) return 0;
  let revN = 0, dup = 0, L = 0;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1], b = pts[i];
    const dx = b[0] - a[0], dz = b[1] - a[1];
    const d = Math.hypot(dx, dz); L += d;
    if (d < 0.05) dup++;
    if (i >= 2) {
      const c = pts[i - 2];
      const ax = a[0] - c[0], az = a[1] - c[1], bx = b[0] - a[0], bz = b[1] - a[1];
      const la = Math.hypot(ax, az), lb = Math.hypot(bx, bz);
      if (la > 0.2 && lb > 0.2 && (ax * bx + az * bz) < -0.55 * la * lb) revN++;
    }
  }
  if (L < 200) return 0;
  if (revN / Math.max(1, pts.length - 2) > 0.12) return 0;
  if (dup / Math.max(1, pts.length - 1) > 0.08) return 0;
  return L;
}
function decimate(pts, maxPts = 90) {
  if (pts.length <= maxPts) return pts.map(p => [Math.round(p[0] * 10) / 10, Math.round(p[1] * 10) / 10]);
  const out = [pts[0]];
  const step = (pts.length - 1) / (maxPts - 1);
  for (let i = 1; i < maxPts - 1; i++) out.push(pts[Math.round(i * step)]);
  out.push(pts[pts.length - 1]);
  return out.map(p => [Math.round(p[0] * 10) / 10, Math.round(p[1] * 10) / 10]);
}
function stitch(cands, joinT = 320) {
  const segs = cands
    .map(r => ({ pts: r.pts.map(p => [+p[0], +p[1]]), used: false, L: len(r.pts) }))
    .filter(s => s.L > 140 && quality(s.pts) > 0)
    .sort((a, b) => b.L - a.L);
  if (!segs.length) return null;
  /* Try a few seeds — longest isn't always the best spine */
  let best = null;
  const seeds = segs.slice(0, Math.min(6, segs.length));
  for (const seed of seeds) {
    segs.forEach(s => { s.used = false; });
    seed.used = true;
    let path = seed.pts.slice();
    let guard = 0;
    while (guard++ < segs.length * 4) {
      let hit = null, bestD = joinT, bestRev = false, bestFront = false;
      const head = path[0], tail = path[path.length - 1];
      for (const s of segs) {
        if (s.used) continue;
        const a = s.pts[0], b = s.pts[s.pts.length - 1];
        const trials = [
          [endDist(tail, a), false, false],
          [endDist(tail, b), true, false],
          [endDist(head, b), false, true],
          [endDist(head, a), true, true],
        ];
        for (const [d, rv, fr] of trials) {
          if (d < bestD) { bestD = d; hit = s; bestRev = rv; bestFront = fr; }
        }
      }
      if (!hit) break;
      hit.used = true;
      let add = bestRev ? rev(hit.pts) : hit.pts.slice();
      path = bestFront ? add.concat(path.slice(1)) : path.concat(add.slice(1));
    }
    const q = quality(path);
    if (q && (!best || q > best.L)) best = { pts: decimate(path, 96), L: q | 0, rawN: path.length };
  }
  return best;
}

const CORRIDORS = [
  { id: 'i10', match: (t) => /\bI\s*10\b/i.test(t) || /East Freeway|Katy Freeway/i.test(t) },
  { id: 'i45', match: (t) => /\bI\s*45\b/i.test(t) || /North Freeway|Gulf Freeway/i.test(t) },
  { id: 'i610', match: (t) => /\bI\s*610\b/i.test(t) },
  { id: 'us59', match: (t) => /\bI\s*69\b/i.test(t) || /\bUS\s*59\b/i.test(t) },
  { id: 'us290', match: (t) => /\bUS\s*290\b/i.test(t) },
  { id: 'bw8', match: (t) => /\bBW\s*8\b/i.test(t) || /^SHT$/i.test(t.trim()) || /Sam Houston Tollway/i.test(t) },
  { id: 'tx99', match: (t) => /\bTX\s*99\b/i.test(t) },
  { id: 'sh288', match: (t) => /\bTX\s*288\b/i.test(t) || /\bSH\s*288\b/i.test(t) },
  { id: 'sh225', match: (t) => /\bTX\s*225\b/i.test(t) || /\bSH\s*225\b/i.test(t) },
  { id: 'sh146', match: (t) => /\bTX\s*146\b/i.test(t) || /\bSH\s*146\b/i.test(t) },
  { id: 'sh249', match: (t) => /\bTX\s*249\b/i.test(t) || /\bSH\s*249\b/i.test(t) },
  { id: 'westpark', match: (t) => /^WPT$/i.test(t.trim()) || /Westpark/i.test(t) },
  { id: 'hardy', match: (t) => /^HTR$/i.test(t.trim()) || /Hardy Toll/i.test(t) },
  { id: 'fbpkwy', match: (t) => /^FBP$/i.test(t.trim()) || /Fort Bend/i.test(t) },
  { id: 'westheimer', match: (t) => /Westheimer/i.test(t) },
  { id: 'memorial', match: (t) => /\bMemorial\b/i.test(t) && /Dr|Drive|Rd/i.test(t) },
  { id: 'fm1960', match: (t) => /FM\s*1960|Cypress Creek Pkwy/i.test(t) },
  { id: 'sh6', match: (t) => /\bSH\s*6\b|\bTX\s*6\b/i.test(t) && !/290/.test(t) },
  { id: 'fm1093', match: (t) => /FM\s*1093|Westpark Tollway Frontage|Westheimer.*west/i.test(t) },
];

const out = { generatedAt: new Date().toISOString(), corridors: {} };
for (const c of CORRIDORS) {
  const cands = pool.filter(r => c.match([r.short, r.ref, r.name].filter(Boolean).join(' | ')));
  const st = stitch(cands, c.id === 'i610' || c.id === 'bw8' || c.id === 'tx99' ? 420 : 320);
  if (st) {
    out.corridors[c.id] = { pts: st.pts, length: st.L, rawN: st.rawN, candidates: cands.length };
    console.log('OK', c.id, 'cands=' + cands.length, 'L=' + st.L, 'pts=' + st.pts.length);
  } else {
    console.log('FAIL', c.id, 'cands=' + cands.length);
  }
}
const dest = path.join(root, 'public/data/roads-corridors.json');
fs.writeFileSync(dest, JSON.stringify(out));
console.log('Wrote', dest, Object.keys(out.corridors).length, 'corridors');
