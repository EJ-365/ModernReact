/**
 * Shared OSM carriageway routing for Tour + Route Planner.
 * Shortest-time Dijkstra over node keys (from→to), not the angle-gated sim `next` links.
 */
const MPH = 0.44704;

function cwScore(c, d) {
  let s = d;
  if (c.link || /_link$/.test(c.h || '')) s += 900;
  else if (c.h === 'motorway' || c.h === 'trunk') s -= 80;
  else if (c.h === 'primary') s -= 40;
  else if (c.street) s += 120;
  return s;
}

export function nearestCw(C, x, z, maxD, preferMajor) {
  let best = null, bd = maxD, bs = Infinity;
  for (const c of C) {
    if (x < c.x0 - bd || x > c.x1 + bd || z < c.z0 - bd || z > c.z1 + bd) continue;
    if (preferMajor && c.street) continue;
    const f = c.f;
    for (let i = 0; i < f.n; i++) {
      const d = Math.hypot(f.pts[2 * i] - x, f.pts[2 * i + 1] - z);
      if (d > bd && d > maxD) continue;
      const sc = cwScore(c, d);
      if (sc < bs) { bs = sc; bd = Math.max(d, 40); best = { c, i }; }
    }
  }
  return best;
}

export function nearestCwList(C, x, z, maxD, n, preferMajor) {
  const hits = [];
  for (const c of C) {
    if (x < c.x0 - maxD || x > c.x1 + maxD || z < c.z0 - maxD || z > c.z1 + maxD) continue;
    if (preferMajor && c.street) continue;
    const f = c.f;
    let bi = 0, bd = Infinity;
    for (let i = 0; i < f.n; i++) {
      const d = Math.hypot(f.pts[2 * i] - x, f.pts[2 * i + 1] - z);
      if (d < bd) { bd = d; bi = i; }
    }
    if (bd <= maxD) hits.push({ c, i: bi, sc: cwScore(c, bd) });
  }
  hits.sort((a, b) => a.sc - b.sc);
  const out = [], seen = new Set();
  for (const h of hits) {
    if (seen.has(h.c)) continue;
    seen.add(h.c);
    out.push(h);
    if (out.length >= n) break;
  }
  return out;
}

export function routeIndex(C) {
  const byFrom = new Map();
  for (const c of C) {
    let l = byFrom.get(c.from);
    if (!l) byFrom.set(c.from, (l = []));
    l.push(c);
  }
  return byFrom;
}

/** Travel-time cost (seconds) for one carriageway — optional traffic / avoid penalties. */
export function edgeCost(e, opts = {}) {
  if (opts.ban && opts.ban.has(e)) return 1e12;
  let mph = Math.max(8, e.ff || 35);
  const cong = Number.isFinite(e.cong) ? e.cong : 0;
  if (opts.trafficAware) {
    /* Prefer clearer roads: heavy cong multiplies travel time */
    mph *= Math.max(0.12, 1 - 0.88 * cong);
    if (e.v0 > 0) mph = Math.min(mph, (e.v0 / MPH) * 1.05);
  }
  if (opts.avoid && opts.avoid.has(e)) mph *= 0.07; /* route around jammed segments */
  return e.L / Math.max(2.5, mph * MPH);
}

export function dijkstra(a, b, byFrom, opts = {}) {
  const dist = new Map([[a.c, 0]]), prev = new Map(), heap = [[0, a.c]];
  const pushH = (e) => {
    heap.push(e);
    let i = heap.length - 1;
    while (i) {
      const p = (i - 1) >> 1;
      if (heap[p][0] <= heap[i][0]) break;
      [heap[p], heap[i]] = [heap[i], heap[p]];
      i = p;
    }
  };
  const popH = () => {
    const top = heap[0], last = heap.pop();
    if (heap.length) {
      heap[0] = last;
      let i = 0;
      for (;;) {
        const l = 2 * i + 1, r = l + 1;
        let m = i;
        if (l < heap.length && heap[l][0] < heap[m][0]) m = l;
        if (r < heap.length && heap[r][0] < heap[m][0]) m = r;
        if (m === i) break;
        [heap[m], heap[i]] = [heap[i], heap[m]];
        i = m;
      }
    }
    return top;
  };
  const goals = b instanceof Set ? b : new Set([b.c]);
  let it = 0, hit = null;
  while (heap.length && it++ < 900000) {
    const [d, c] = popH();
    if (goals.has(c)) { hit = c; break; }
    if (d > dist.get(c)) continue;
    const nbrs = byFrom ? (byFrom.get(c.to) || []) : null;
    if (nbrs) {
      for (const e of nbrs) {
        if (e === c) continue;
        const nd = d + edgeCost(e, opts);
        if (nd >= 1e11) continue;
        if (nd < (dist.has(e) ? dist.get(e) : Infinity)) {
          dist.set(e, nd);
          prev.set(e, c);
          pushH([nd, e]);
        }
      }
    } else {
      for (const nx of c.next) {
        const e = nx.c, nd = d + edgeCost(e, opts);
        if (nd >= 1e11) continue;
        if (nd < (dist.has(e) ? dist.get(e) : Infinity)) {
          dist.set(e, nd);
          prev.set(e, c);
          pushH([nd, e]);
        }
      }
    }
  }
  if (!hit) return null;
  const seq = [];
  for (let c = hit; c; c = prev.get(c)) {
    seq.push(c);
    if (c === a.c) break;
  }
  return seq[seq.length - 1] === a.c ? seq.reverse() : null;
}

export function buildPath(seq, a, b) {
  const P = [];
  seq.forEach((c, k) => {
    const f = c.f, n = f.n, li = Math.max(0, c.nl - 1);
    const off = (c.hw - 0.6 - (li + 0.5) * c.laneW) * c.sign;
    const idx = [];
    for (let j = 0; j < n; j++) idx.push(c.sign > 0 ? j : n - 1 - j);
    let from = 0, to = n - 1;
    if (k === 0) from = Math.max(0, idx.indexOf(a.i));
    if (k === seq.length - 1) to = Math.max(from + 1, idx.indexOf(b.i));
    for (let q = k ? Math.max(from, 1) : from; q <= to; q++) {
      const i = idx[q];
      P.push({
        x: f.pts[2 * i] + f.nx[i] * f.m[i] * off,
        z: f.pts[2 * i + 1] + f.nz[i] * f.m[i] * off,
        y: c.y0 + (f.ys ? f.ys[i] : 0) + 0.02,
        ff: c.ff,
        ref: c.ref || '',
        name: c.name || '',
        h: c.h || '',
      });
    }
  });
  let s = 0;
  P.forEach((p, i) => {
    if (i) s += Math.hypot(p.x - P[i - 1].x, p.z - P[i - 1].z);
    p.s = s;
  });
  return P.length > 1 ? P : null;
}

/**
 * @returns {{ path, seq, a, b } | null}
 */
export function findRouteDetailed(T, ox, oz, dx, dz, opts = {}) {
  const C = T.carriageways;
  if (!C || !C.length) return null;
  const byFrom = routeIndex(C);
  const starts = nearestCwList(C, ox, oz, 22000, 14, true);
  if (!starts.length) {
    const a = nearestCw(C, ox, oz, 32000, false);
    if (a) starts.push(a);
  }
  const ends = nearestCwList(C, dx, dz, 22000, 16, true);
  if (!ends.length) {
    const b = nearestCw(C, dx, dz, 36000, false);
    if (b) ends.push(b);
  }
  if (!starts.length || !ends.length) return null;
  const goalSet = new Set(ends.map((e) => e.c));
  const endByCw = new Map(ends.map((e) => [e.c, e]));
  const tryBuild = (seq, a) => {
    if (!seq) return null;
    const last = seq[seq.length - 1];
    const b = endByCw.get(last) || { c: last, i: Math.floor(last.f.n / 2) };
    const path = buildPath(seq, a, b);
    return path ? { path, seq, a, b } : null;
  };
  for (const a of starts) {
    const hit = tryBuild(dijkstra(a, goalSet, byFrom, opts), a);
    if (hit) return hit;
  }
  const hub = nearestCwList(C, 60, 60, 14000, 8, true);
  if (hub.length) {
    for (const a of starts) {
      const toHub = dijkstra(a, new Set(hub.map((h) => h.c)), byFrom, opts);
      if (!toHub) continue;
      const hCw = toHub[toHub.length - 1];
      const hSnap = hub.find((h) => h.c === hCw) || { c: hCw, i: Math.floor(hCw.f.n / 2) };
      const fromHub = dijkstra(hSnap, goalSet, byFrom, opts);
      if (!fromHub) continue;
      const hit = tryBuild(toHub.concat(fromHub.slice(1)), a);
      if (hit) return hit;
    }
  }
  return null;
}

/** Path only — used by tour + simple callers */
export function findRoute(T, ox, oz, dx, dz, opts) {
  const r = findRouteDetailed(T, ox, oz, dx, dz, opts);
  return r ? r.path : null;
}

/** Carriageways on a route that are jammed (cong / slow vs free-flow). */
export function jammedOnSeq(seq, minCong = 0.48) {
  const out = [];
  for (const c of seq || []) {
    const cong = Number.isFinite(c.cong) ? c.cong : 0;
    const slow = c.v0 > 0 && c.ff > 0 && c.v0 < c.ff * MPH * 0.55;
    if (cong >= minCong || slow) out.push(c);
  }
  return out;
}

/**
 * Primary route (traffic-aware) + alternate that avoids jammed segments when possible.
 * @returns {{ primary, alt, jammed, jamRefs:string[] } | null}
 */
export function planRoutesWithAlt(T, ox, oz, dx, dz) {
  const primary = findRouteDetailed(T, ox, oz, dx, dz, { trafficAware: true });
  if (!primary) {
    const bare = findRouteDetailed(T, ox, oz, dx, dz, {});
    if (!bare) return null;
    return { primary: bare, alt: null, jammed: [], jamRefs: [] };
  }
  const jammed = jammedOnSeq(primary.seq);
  const jamRefs = [...new Set(jammed.map((c) => c.ref).filter(Boolean))].slice(0, 5);
  let alt = null;
  if (jammed.length) {
    alt = findRouteDetailed(T, ox, oz, dx, dz, {
      trafficAware: true,
      avoid: new Set(jammed),
    });
    /* Reject alt if it's basically the same path or much worse */
    if (alt) {
      const same = alt.seq.length === primary.seq.length
        && alt.seq.every((c, i) => c === primary.seq[i]);
      const pLen = primary.path[primary.path.length - 1].s;
      const aLen = alt.path[alt.path.length - 1].s;
      if (same || aLen > pLen * 1.65) alt = null;
    }
  }
  return { primary, alt, jammed, jamRefs };
}

/** Houston-typical free-flow → actual speed factor by clock hour (Central). */
export function houDriveFactor(date = new Date()) {
  const h = ((date.getUTCHours() - 5 + 24) % 24) + date.getUTCMinutes() / 60;
  const weekend = date.getUTCDay() === 0 || date.getUTCDay() === 6;
  if (h >= 7 && h < 9) return weekend ? 0.72 : 0.48;
  if (h >= 16 && h < 19) return weekend ? 0.70 : 0.45;
  if (h >= 6 && h < 7) return 0.62;
  if (h >= 9 && h < 10) return 0.68;
  if (h >= 15 && h < 16) return 0.58;
  if (h >= 19 && h < 20.5) return 0.65;
  if (h >= 0 && h < 5) return 0.95;
  return 0.78;
}

/**
 * ETA along a findRoute path. Uses time-of-day factor + optional traffic.speedNear probes.
 * @returns {{ miles:number, minutes:number, freeMin:number, delayMin:number, refs:string[] }}
 */
export function estimateRouteEta(path, traffic, date = new Date()) {
  if (!path || path.length < 2) {
    return { miles: 0, minutes: 0, freeMin: 0, delayMin: 0, refs: [] };
  }
  const factor = houDriveFactor(date);
  let freeSec = 0, liveSec = 0;
  const refs = [];
  let lastRef = '', lastProbe = -1e9;
  for (let i = 1; i < path.length; i++) {
    const a = path[i - 1], b = path[i];
    const ds = b.s - a.s;
    if (ds <= 0) continue;
    const ff = Math.max(20, a.ff || 45);
    freeSec += ds / (ff * MPH);
    let mph = ff * factor;
    if (traffic && traffic.speedNear && b.s - lastProbe > 350) {
      lastProbe = b.s;
      try {
        const live = traffic.speedNear(a.x, a.z, 140);
        if (live && live.n >= 3 && live.ratio > 0.08) {
          const probe = ff * Math.min(1.08, Math.max(0.2, live.ratio));
          mph = Math.min(ff * 1.02, Math.max(10, probe * 0.7 + mph * 0.3));
        }
      } catch (e) { /* ignore */ }
    }
    if ((a.ff || 45) <= 45) mph = Math.min(mph, ff * Math.max(0.4, factor - 0.05));
    liveSec += ds / (Math.max(8, mph) * MPH);
    if (a.ref && a.ref !== lastRef) {
      lastRef = a.ref;
      if (refs.length < 6) refs.push(a.ref);
    }
  }
  const miles = path[path.length - 1].s / 1609.344;
  const minutes = liveSec / 60;
  const freeMin = freeSec / 60;
  return {
    miles,
    minutes,
    freeMin,
    delayMin: Math.max(0, minutes - freeMin),
    refs,
  };
}
