/**
 * Houston v2 traffic: cars drive the real OSM major network (the same ways houston-roads renders),
 * lane by lane. Lane counts/widths come from OSM, car-following is IDM per lane (no overlaps),
 * cars hand over to the connected way at shared OSM nodes (same route preferred, exits only from
 * the right lane), and ride the exact bridge/ramp deck profile. Speeds follow live probes or
 * modelled congestion via `env`. Only carriageways near the camera are simulated.
 */
/* Houston posted speed limits — TxDOT: urban freeway 65-75 mph, arterials 35-45 mph.
   I-10 Katy is one of the widest freeways in the world (26 lanes) at 75 mph limit. */
const FF = {
  motorway: 75, trunk: 65, primary: 45, motorway_link: 55, trunk_link: 45, primary_link: 35,
  secondary: 40, secondary_link: 35, tertiary: 35, tertiary_link: 28, residential: 30, unclassified: 28, living_street: 15,
};
/* streets: [spacing multiplier, max sim radius]. Lower spacing = more cars on suburb roads. */
const STREET = {
  secondary: [1.25, 5600], secondary_link: [1.6, 5600], tertiary: [1.8, 4800], tertiary_link: [1.8, 4800],
  residential: [2.6, 3800], unclassified: [2.4, 3600], living_street: [5.5, 2200],
};
const oneWay = (o) => !!o && o !== '0' && o !== 'no' && o !== '-1';
const MPH = 0.44704;
/* Texan driving style: aggressive following (shorter headway, higher decel comfort) */
const IDM = { a: 2.0, b: 2.8, s0: 1.8, T: 1.05 };
/* Houston rush hours: 7-9am and 4-7pm Central time */
function rushHourFactor() {
  const d = new Date();
  const h = ((d.getUTCHours() - 5 + 24) % 24) + d.getUTCMinutes() / 60;
  if (h >= 7.0 && h < 9.0)   return 1.60; // morning peak
  if (h >= 16.0 && h < 19.0) return 1.65; // evening peak
  if (h >= 6.0 && h < 7.0)   return 1.30; // morning shoulder
  if (h >= 9.0 && h < 10.0)  return 1.20; // post-morning
  if (h >= 15.0 && h < 16.0) return 1.35; // pre-evening
  if (h >= 19.0 && h < 20.5) return 1.25; // post-evening
  if (h >= 0 && h < 5.0)     return 0.28; // late night
  return 1.0;
}
const nodeKey = (x, z) => `${Math.round(x * 0.5)},${Math.round(z * 0.5)}`;
const CELL = 1000;
/* signal timing: two-phase (E-W / N-S approaches), shared offset per intersection cluster */
const CYC = 72, GREEN = 31, AMBER = 3.5, SIG_SNAP = 7, STOP_BACK = 6.5;

function tangentAt(f, i0, i1) {
  const dx = f.pts[2 * i1] - f.pts[2 * i0], dz = f.pts[2 * i1 + 1] - f.pts[2 * i0 + 1], l = Math.hypot(dx, dz) || 1;
  return [dx / l, dz / l];
}

export function createHoustonTraffic({ net, k = 1, kv = k, offset = 60, baseY = 0, env, mkCar, rand = Math.random, budget = 5000 }) {
  const X = (x) => (x - offset) * k + offset;
  const active = new Set();
  const stats = { carriageways: 0, active: 0, cars: 0, spawned: 0, removed: 0, waits: 0 };
  const sig = { grid: new Map(), n: 0 };
  const C = [], byFrom = new Map(), byTo = new Map(), grid = new Map(), tagged = new Map();
  const push = (m, key, c) => { let l = m.get(key); if (!l) m.set(key, (l = [])); l.push(c); };
  const pull = (m, key, c) => { const l = m.get(key); if (!l) return; const i = l.indexOf(c); if (i >= 0) l.splice(i, 1); if (!l.length) m.delete(key); };
  function cellsOf(c, fn) {
    for (let gx = Math.floor(c.x0 / CELL); gx <= Math.floor(c.x1 / CELL); gx++) for (let gz = Math.floor(c.z0 / CELL); gz <= Math.floor(c.z1 / CELL); gz++) fn(gx + ',' + gz);
  }
  /** OSM highway=traffic_signals nodes sit on way vertices: give each carriageway its signal stop lines */
  function findStops(c) {
    c.stops = null;
    if (!sig.n || c.h === 'motorway') return;
    const f = c.f, n = f.n;
    for (let i = 0; i < n; i++) {
      const x = f.pts[2 * i], z = f.pts[2 * i + 1];
      let hit = null;
      for (let gx = -1; gx <= 1 && !hit; gx++) for (let gz = -1; gz <= 1 && !hit; gz++) {
        for (const q of sig.grid.get((Math.floor(x / 50) + gx) + ',' + (Math.floor(z / 50) + gz)) || []) if (Math.hypot(q[0] - x, q[1] - z) < SIG_SNAP) { hit = q; break; }
      }
      if (!hit) continue;
      const u = c.sign > 0 ? f.cum[i] : c.L - f.cum[i];
      if (u < STOP_BACK + 3) continue;
      const j0 = Math.max(0, i - 1), j1 = Math.min(n - 1, i + 1);
      const tx = f.pts[2 * j1] - f.pts[2 * j0], tz = f.pts[2 * j1 + 1] - f.pts[2 * j0 + 1];
      (c.stops || (c.stops = [])).push({ u: Math.min(c.L, u) - STOP_BACK, axis: Math.abs(tx) >= Math.abs(tz) ? 0 : 1, off: hit[2], x, z });
    }
    if (c.stops) { c.stops.sort((a, b) => a.u - b.u); for (let i = c.stops.length - 1; i > 0; i--) if (c.stops[i].u - c.stops[i - 1].u < 12) c.stops.splice(i, 1); }
  }
  /** signals: [[x,z],...] in the road frame (metres). Nearby nodes of one junction share a phase offset. */
  function setSignals(list) {
    sig.grid.clear(); sig.n = 0;
    const centers = new Map();
    for (const [x, z] of list) {
      const ck = Math.floor(x / 90) + ',' + Math.floor(z / 90);
      let off = null;
      for (let gx = -1; gx <= 1 && off == null; gx++) for (let gz = -1; gz <= 1 && off == null; gz++) {
        const k2 = (Math.floor(x / 90) + gx) + ',' + (Math.floor(z / 90) + gz);
        for (const q of centers.get(k2) || []) if (Math.hypot(q[0] - x, q[1] - z) < 75) { off = q[2]; break; }
      }
      if (off == null) {
        off = (((Math.imul(Math.round(x) | 0, 73856093) ^ Math.imul(Math.round(z) | 0, 19349663)) >>> 0) % 1000) / 1000 * CYC;
        let l = centers.get(ck); if (!l) centers.set(ck, (l = [])); l.push([x, z, off]);
      }
      const g = Math.floor(x / 50) + ',' + Math.floor(z / 50);
      let l = sig.grid.get(g); if (!l) sig.grid.set(g, (l = [])); l.push([x, z, off]);
      sig.n++;
    }
    for (const c of C) findStops(c);
    stats.signals = sig.n;
    stats.signalled = C.filter((c) => c.stops).length;
  }
  /** 'g' | 'y' | 'r' for a stop line right now */
  function sigState(st) {
    let t = (simT + st.off) % CYC;
    if (st.axis) t = (t + CYC / 2) % CYC;
    return t < GREEN ? 'g' : t < GREEN + AMBER ? 'y' : 'r';
  }
  function addWays(ways) {
  const made = [];
  for (const w of ways) {
    const f = w.f, n = f.n;
    if (n < 2) continue;
    const L = f.cum[n - 1];
    if (!(L > 2)) continue;
    const r = w.r, rw = +r.w || 7, hw = rw / 2, two = !oneWay(r.o);
    /* same lane count the road renderer paints (one-way carriageways without lanes= are inferred from width) */
    const rl = +r.l >= 2 ? +r.l : (!two && rw >= 6.5 ? Math.max(2, Math.round((rw - 1.2) / 3.6)) : (+r.l || 2));
    const nl = two ? Math.max(1, Math.floor(rl / 2)) : Math.max(1, rl);
    const laneW = two ? (hw - 0.6) / nl : (rw - 1.2) / nl;
    const st = STREET[r.h];
    const a = nodeKey(f.pts[0], f.pts[1]), b = nodeKey(f.pts[2 * n - 2], f.pts[2 * n - 1]);
    let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9;
    for (let i = 0; i < n; i++) { const x = f.pts[2 * i], z = f.pts[2 * i + 1]; if (x < x0) x0 = x; if (x > x1) x1 = x; if (z < z0) z0 = z; if (z > z1) z1 = z; }
    for (const sign of two ? [1, -1] : [1]) {
      const c = {
        w, f, L, sign, nl, laneW, hw, from: sign > 0 ? a : b, to: sign > 0 ? b : a,
        ref: r.r || '', name: r.n || '', link: /_link$/.test(r.h), h: r.h, ff: FF[r.h] || 35,
        y0: baseY + (w.cy || 0) * kv, x0, x1, z0, z1,
        t0: sign > 0 ? tangentAt(f, 0, 1) : tangentAt(f, n - 1, n - 2),
        t1: sign > 0 ? tangentAt(f, n - 2, n - 1) : tangentAt(f, 1, 0),
        next: [], prev: [], lanes: null, active: false, feed: false, acc: 0, v0: (FF[r.h] || 35) * MPH, sp: 60, congT: -1,
        street: !!st, sparse: st ? st[0] : 1, rmax: st ? st[1] : 1e9, stops: null,
      };
      findStops(c);
      C.push(c); made.push(c);
      push(byFrom, c.from, c); push(byTo, c.to, c);
      cellsOf(c, (kk) => push(grid, kk, c));
    }
  }
  const link = (c, d) => {
    if (d.w === c.w) return;
    const dot = c.t1[0] * d.t0[0] + c.t1[1] * d.t0[1];
    const ang = Math.acos(Math.max(-1, Math.min(1, dot)));
    if (ang > 1.75) return;
    const lab = c.ref || c.name, dlab = d.ref || d.name;
    c.next.push({ c: d, ang, same: !!lab && lab === dlab });
    d.prev.push(c);
  };
  const fresh = new Set(made);
  for (const c of made) {
    for (const d of byFrom.get(c.to) || []) link(c, d);
    for (const p of byTo.get(c.from) || []) if (!fresh.has(p)) link(p, c);
  }
  stats.carriageways = C.length;
  return made;
  }
  /** streamed street tiles: add their carriageways, and remove them again when the tile unloads */
  function addTile(tag, ways) { removeTile(tag); tagged.set(tag, addWays(ways)); }
  function removeTile(tag) {
    const list = tagged.get(tag); if (!list) return;
    tagged.delete(tag);
    const gone = new Set(list);
    for (const c of list) {
      if (c.active) drop(c);
      pull(byFrom, c.from, c); pull(byTo, c.to, c);
      cellsOf(c, (kk) => pull(grid, kk, c));
      for (const p of c.prev) p.next = p.next.filter((o) => !gone.has(o.c));
      for (const o of c.next) o.c.prev = o.c.prev.filter((p) => !gone.has(p));
    }
    for (let i = C.length - 1; i >= 0; i--) if (gone.has(C[i])) C.splice(i, 1);
    stats.carriageways = C.length;
  }

  let densF = 1, densS = 1, step = 0, simT = 0, lastAct = -1, total = 0, totS = 0;
  const dOf = (c) => (c.street ? densS : densF);
  const cnt = (c, d) => { total += d; if (c.street) totS += d; };
  const capOf = (c) => (c.street ? total < budget : total - totS < budget - Math.min(budget * 0.4, sWant));
  let sWant = 0;

  function laneOff(c, li) { return c.hw - 0.6 - (li + 0.5) * c.laneW; }
  function pickNext(c, li) {
    let sum = 0;
    const opts = [];
    for (const o of c.next) {
      let wgt;
      if (o.c.link && !c.link) wgt = li === 0 ? (o.ang < 0.7 ? 1.4 : 0.6) : 0;
      else if (o.same && o.ang < 0.7) wgt = 12;
      else wgt = o.ang < 0.45 ? 5 : o.ang < 1.0 ? 1.2 : 0.35;
      if (wgt > 0) { opts.push([o.c, wgt]); sum += wgt; }
    }
    if (!opts.length) return null;
    let r = rand() * sum;
    for (const [d, wgt] of opts) { if ((r -= wgt) <= 0) return d; }
    return opts[opts.length - 1][0];
  }
  function refreshCong(c) {
    const f = c.f, mi = (f.n / 2) | 0;
    /* corridor probes describe freeways/arterials only; streets run near their limit, scaled by weather */
    const q = env && !c.street ? env.cong(X(f.pts[2 * mi]), X(f.pts[2 * mi + 1]), c.t0[0] * c.sign, c.t0[1] * c.sign, c) : null;
    const cong = q ? q.cong || 0 : 0;
    let mph = q && q.mph != null ? Math.min(q.mph, c.ff * 1.08) : c.ff * (1 - 0.86 * cong) * (env && env.wx ? env.wx() : 1);
    if (c.link) mph = Math.min(mph, c.ff);
    c.cong = cong;
    c.v0 = Math.max(2.5, mph) * MPH;
    const th = env && env.headway ? env.headway() : 2;
    c.sp = (6.2 + IDM.s0 + c.v0 * th) * (1 + 0.6 * (1 - Math.min(1, cong * 1.6))) * c.sparse;
  }
  function makeCar(c, li, u, v) {
    const car = mkCar(c.h);
    car.c = c; car.li = li; car.u = u; car.v = v; car.lat = laneOff(c, li);
    car.len = car.len || 6; car.aggr = car.aggr || 1; car.si = 0; car._st = step; car.cd = simT + 3 + rand() * 6;
    car.nx = pickNext(c, li);
    cnt(c, 1); stats.spawned++; car.sk = 0;
    return car;
  }
  function seed(c) {
    c.lanes = [];
    for (let li = 0; li < c.nl; li++) {
      const lane = [];
      const dens = dOf(c);
      let u = rand() * c.sp / dens;
      while (u < c.L - 3 && capOf(c)) {
        lane.push(makeCar(c, li, u, c.v0 * (0.8 + rand() * 0.2)));
        u += Math.max(lane[lane.length - 1].len + IDM.s0 + 2, c.sp * (0.7 + rand() * 0.6) / dens);
      }
      c.lanes.push(lane);
    }
  }
  function drop(c) {
    for (const lane of c.lanes || []) { cnt(c, -lane.length); stats.removed += lane.length; }
    c.lanes = null; c.active = false; active.delete(c);
  }
  function bboxDist(c, x, z) {
    const dx = Math.max(c.x0 - x, 0, x - c.x1), dz = Math.max(c.z0 - z, 0, z - c.z1);
    return Math.hypot(dx, dz);
  }

  function activate(camX, camZ, camR) {
    const mx = (camX - offset) / k + offset, mz = (camZ - offset) / k + offset;
    /* Keep a generous near-camera ring so suburb streets stay populated when zoomed in */
    const R = Math.min(8200, Math.max(2200, camR * 1.85)), Rout = R * 1.25;
    for (const c of [...active]) if (bboxDist(c, mx, mz) > Math.min(Rout, c.rmax * 1.25)) drop(c);
    const cand = [];
    const g0x = Math.floor((mx - R) / CELL), g1x = Math.floor((mx + R) / CELL), g0z = Math.floor((mz - R) / CELL), g1z = Math.floor((mz + R) / CELL);
    for (let gx = g0x; gx <= g1x; gx++) for (let gz = g0z; gz <= g1z; gz++) {
      for (const c of grid.get(gx + ',' + gz) || []) if (!c.active && !c._seen && bboxDist(c, mx, mz) < Math.min(R, c.rmax)) { c._seen = true; cand.push(c); }
    }
    for (const c of cand) c._seen = false;
    for (const c of cand) { c.active = true; active.add(c); refreshCong(c); c.congT = simT + 2 + rand() * 3; }
    let wF = 0, wS = 0;
    for (const c of active) { const w = c.L * c.nl / c.sp; if (c.street) wS += w; else wF += w; }
    sWant = wS;
    /* Reserve ~40% of budget for streets/suburbs so freeways don't starve neighborhood roads */
    const capS = Math.min(budget * 0.4, wS);
    densS = Math.max(0.22, Math.min(1, capS * 0.95 / Math.max(1, wS)));
    densF = Math.max(0.14, Math.min(1, (budget - capS) * 0.95 / Math.max(1, wF)));
    cand.sort((a, b) => bboxDist(a, mx, mz) - bboxDist(b, mx, mz));
    for (const c of cand) seed(c);
    for (const c of active) c.feed = !c.prev.some((p) => p.active);
    for (const c of active) c.drive = c.street && !c.feed;
    stats.active = active.size;
  }

  /** the next stop line ahead of this car that it must (and still can) stop at */
  function redGap(car) {
    const st = car.c.stops;
    if (!st) return 1e4;
    while (car.sk < st.length && st[car.sk].u < car.u + car.len / 2 - 1.5) car.sk++;
    const s = st[car.sk];
    if (!s) return 1e4;
    const g = s.u - car.u - car.len / 2;
    if (g > 160) return 1e4;
    const state = sigState(s);
    if (state === 'g') return 1e4;
    const need = car.v * car.v / (2 * IDM.b * (state === 'y' ? 1.1 : 2.2));
    return g < need - 2 ? 1e4 : Math.max(0.1, g);
  }
  function leaderAhead(car, lane, i) {
    const rg = redGap(car);
    const [g, v] = leaderPlain(car, lane, i);
    return rg < g ? [rg, 0] : [g, v];
  }
  function leaderPlain(car, lane, i) {
    if (i + 1 < lane.length) {
      const ld = lane[i + 1];
      return [ld.u - car.u - (ld.len + car.len) / 2, ld.v];
    }
    const nx = car.nx;
    if (nx && nx.active && nx.lanes) {
      const nl = nx.lanes[Math.min(car.li, nx.nl - 1)];
      if (nl.length) { const ld = nl[0]; return [car.c.L - car.u + ld.u - (ld.len + car.len) / 2, ld.v]; }
    }
    return [1e4, car.v];
  }
  function tryLaneChange(c, lane, i, car, gapF, vF) {
    if (c.nl < 2 || simT < car.cd) return false;
    car.cd = simT + 5 + rand() * 6;
    for (const tl of rand() < 0.5 ? [car.li + 1, car.li - 1] : [car.li - 1, car.li + 1]) {
      if (tl < 0 || tl >= c.nl) continue;
      const t = c.lanes[tl];
      let j = 0; while (j < t.length && t[j].u < car.u) j++;
      const back = j > 0 ? t[j - 1] : null, front = j < t.length ? t[j] : null;
      const gb = back ? car.u - back.u - (back.len + car.len) / 2 : 1e4;
      const gf = front ? front.u - car.u - (front.len + car.len) / 2 : 1e4;
      const fv = front ? front.v : c.v0;
      if (gb > IDM.s0 + 3 + Math.max(0, (back ? back.v : 0) - car.v) * 1.5 && gf > IDM.s0 + car.v * 0.7 && (gf > gapF + 8 || fv > vF + 1.5)) {
        lane.splice(i, 1); t.splice(j, 0, car); car.li = tl;
        if (car.nx && car.nx.link && tl !== 0) car.nx = pickNext(c, tl);
        return true;
      }
    }
    return false;
  }
  function handover(c, lane, car) {
    const nx = car.nx;
    if (!nx || !nx.active || !nx.lanes) { lane.pop(); cnt(c, -1); stats.removed++; return; }
    const over = car.u - c.L, pref = Math.min(car.li, nx.nl - 1);
    for (const li of [pref, pref + 1, pref - 1]) {
      if (li < 0 || li >= nx.nl) continue;
      const t = nx.lanes[li], first = t[0];
      if (first && first.u - over < (first.len + car.len) / 2 + 0.8) continue;
      lane.pop();
      if (nx.street !== c.street) { cnt(c, -1); cnt(nx, 1); }
      car.c = nx; car.li = li; car.u = over; car.si = 0; car.sk = 0; car.nx = pickNext(nx, li);
      t.unshift(car);
      return;
    }
    car.u = c.L - 0.01; car.v = 0; stats.waits++;
  }

  /* the player's tour car: traffic in the same lane brakes for it instead of driving through it */
  let ego = null;
  function setEgo(x, z, v) { ego = x == null ? null : { x, z, v: v || 0 }; }
  function egoGap(car) {
    if (!ego || car._px == null) return 1e4;
    const dx = ego.x - car._px, dz = ego.z - car._pz;
    if (dx * dx + dz * dz > 3600) return 1e4;
    const fwd = dx * car._fx + dz * car._fz, lat = Math.abs(dx * car._fz - dz * car._fx);
    return fwd > 0 && lat < 2.4 * kv ? Math.max(0.1, fwd - car.len * 0.5 - 2.6 * kv) : 1e4;
  }
  function simulate(dt) {
    step++;
    for (const c of active) {
      if (simT > c.congT) { refreshCong(c); c.congT = simT + 3 + rand() * 2; }
      const lanes = c.lanes;
      for (let li = 0; li < lanes.length; li++) {
        const lane = lanes[li];
        for (let i = lane.length - 1; i >= 0; i--) {
          const car = lane[i];
          if (!car || car._st === step) continue;
          car._st = step;
          let [gap, lv] = leaderAhead(car, lane, i);
          if (ego) { const eg = egoGap(car); if (eg < gap) { gap = eg; lv = ego.v; } }
          const v0 = Math.max(0.5, c.v0 * car.aggr);
          if (gap < 40 && car.v < v0 * 0.8 && !(c.stops && car.v < 3) && tryLaneChange(c, lane, i, car, gap, lv)) continue;
          const ss = IDM.s0 + Math.max(0, car.v * IDM.T + car.v * (car.v - lv) / (2 * Math.sqrt(IDM.a * IDM.b)));
          const g = Math.max(0.1, gap);
          let acc = IDM.a * (1 - Math.pow(car.v / v0, 4) - (ss / g) * (ss / g));
          if (acc < -9) acc = -9;
          car.v = Math.max(0, car.v + acc * dt);
          let nu = car.u + car.v * dt;
          if (i + 1 < lane.length) {
            const ld = lane[i + 1], lim = ld.u - (ld.len + car.len) / 2 - 0.3;
            if (nu > lim) { nu = Math.max(car.u, lim); car.v = Math.min(car.v, ld.v); }
          }
          car.u = nu;
          car.brake = acc < -0.6 || car.v < 0.5;
          if (car.u >= c.L && i === lane.length - 1) handover(c, lane, car);
          else if (car.u >= c.L) car.u = c.L - 0.01;
        }
      }
      /* entries: open road ends feed at flow rate; streets also gain cars from driveways/parking */
      if ((c.feed || c.drive) && capOf(c)) {
        c.acc += dt * c.nl * (c.v0 / c.sp) * dOf(c) * (c.feed ? 1 : 0.18);
        if (c.acc >= 1) {
          c.acc -= 1;
          const li = (rand() * c.nl) | 0, lane = c.lanes[li], first = lane[0];
          if (!first || first.u > Math.max(first.len + IDM.s0 + 4, c.sp * 0.5)) lane.unshift(makeCar(c, li, 0, c.v0 * 0.9));
        }
      }
    }
  }

  function place(car, dt) {
    const c = car.c, f = car.c.f, n = f.n;
    const s = c.sign > 0 ? car.u : c.L - car.u;
    let i = Math.min(Math.max(0, car.si), n - 2);
    while (i < n - 2 && f.cum[i + 1] < s) i++;
    while (i > 0 && f.cum[i] > s) i--;
    car.si = i;
    const seg = f.cum[i + 1] - f.cum[i], t = seg > 0 ? Math.min(1, Math.max(0, (s - f.cum[i]) / seg)) : 0;
    const ax = f.pts[2 * i], az = f.pts[2 * i + 1], bx = f.pts[2 * i + 2], bz = f.pts[2 * i + 3];
    const nxm = f.nx[i] * f.m[i] * (1 - t) + f.nx[i + 1] * f.m[i + 1] * t, nzm = f.nz[i] * f.m[i] * (1 - t) + f.nz[i + 1] * f.m[i + 1] * t;
    const tl = laneOff(c, car.li);
    car.lat += (tl - car.lat) * Math.min(1, dt * 1.1);
    const off = car.lat * c.sign;
    car._px = X(ax + (bx - ax) * t + nxm * off);
    car._pz = X(az + (bz - az) * t + nzm * off);
    const ys = f.ys;
    car._py = c.y0 + (ys ? (ys[i] * (1 - t) + ys[i + 1] * t) * kv : 0) + 0.03 * kv;
    let fx = (bx - ax) * c.sign, fz = (bz - az) * c.sign;
    const fl = Math.hypot(fx, fz) || 1; fx /= fl; fz /= fl;
    const hd = Math.atan2(fx, fz);
    if (car._hd == null) car._hd = hd;
    else { let d = hd - car._hd; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; car._hd += d * Math.min(1, dt * 9); }
    car._fx = Math.sin(car._hd); car._fz = Math.cos(car._hd);
    const deadEnd = !car.nx || !car.nx.active;
    car._sc = deadEnd ? Math.max(0, Math.min(1, (c.L - car.u) / 14)) : 1;
    if (c.feed && car.u < 14 && car._grow == null) car._grow = 0;
    if (car._grow != null) { car._grow = Math.min(1, car._grow + dt / 1.2); car._sc = Math.min(car._sc, car._grow); if (car._grow >= 1) car._grow = null; }
  }

  function tick(dt, camX, camZ, camR) {
    simT += dt;
    if (simT - lastAct > 0.5 || lastAct < 0) { lastAct = simT; activate(camX, camZ, camR); }
    /* Slightly coarser substeps under load — still stable IDM, fewer CPU passes */
    const stepMs = total > 1800 ? 0.07 : 0.055;
    const n = Math.max(1, Math.ceil(dt / stepMs)), h = dt / n;
    for (let j = 0; j < n; j++) simulate(h);
    stats.cars = total;
  }
  function forEach(cb, dt = 0.016, opts) {
    const cx = opts && opts.cx, cz = opts && opts.cz, r2 = opts && opts.r2;
    const cull = r2 != null && cx != null && cz != null;
    /* Carriageway bbox is in road metres; camera is world — match activate() */
    const mx = cull ? (cx - offset) / k + offset : 0;
    const mz = cull ? (cz - offset) / k + offset : 0;
    const rr2 = cull ? r2 / (k * k) : 0;
    for (const c of active) {
      if (cull) {
        const dx = Math.max(c.x0 - mx, 0, mx - c.x1), dz = Math.max(c.z0 - mz, 0, mz - c.z1);
        if (dx * dx + dz * dz > rr2) continue;
      }
      for (const lane of c.lanes) for (const car of lane) {
        place(car, dt);
        if (cull) {
          const dx = car._px - cx, dz = car._pz - cz;
          if (dx * dx + dz * dz > r2) continue;
        }
        cb(car);
      }
    }
  }
  /* what the simulated cars are actually doing near (x,z): speed as a share of free-flow */
  function speedNear(x, z, r) {
    let n = 0, sum = 0;
    const r2 = r * r;
    for (const c of active) {
      const ff = c.ff * MPH;
      for (const lane of c.lanes) for (const car of lane) {
        if (car._px == null) continue;
        const dx = car._px - x, dz = car._pz - z;
        if (dx * dx + dz * dz > r2) continue;
        n++; sum += Math.min(1.2, car.v / ff);
      }
    }
    return { n, ratio: n ? sum / n : 1 };
  }
  /** stop lines of simulated carriageways near (x,z) in world units: cb(x, y, z, inX, inZ, travelX, travelZ, state, halfWidth) */
  function signalsNear(x, z, r, cb) {
    const r2 = r * r;
    for (const c of active) {
      if (!c.stops) continue;
      const f = c.f, n = f.n;
      for (const st of c.stops) {
        const wx = X(st.x), wz = X(st.z);
        if ((wx - x) ** 2 + (wz - z) ** 2 > r2) continue;
        const s = c.sign > 0 ? st.u : c.L - st.u;
        let i = 0; while (i < n - 2 && f.cum[i + 1] < s) i++;
        const seg = f.cum[i + 1] - f.cum[i], t = seg > 0 ? Math.min(1, Math.max(0, (s - f.cum[i]) / seg)) : 0;
        const ax = f.pts[2 * i], az = f.pts[2 * i + 1], bx = f.pts[2 * i + 2], bz = f.pts[2 * i + 3];
        const off = (c.hw + 0.4) * c.sign, nxv = f.nx[i], nzv = f.nz[i];
        const px = X(ax + (bx - ax) * t + nxv * off), pz = X(az + (bz - az) * t + nzv * off);
        const py = c.y0 + (f.ys ? (f.ys[i] * (1 - t) + f.ys[i + 1] * t) * kv : 0);
        const tl = Math.hypot(bx - ax, bz - az) || 1;
        cb(px, py, pz, -nxv * c.sign, -nzv * c.sign, (bx - ax) * c.sign / tl, (bz - az) * c.sign / tl, sigState(st), c.hw * k);
      }
    }
  }
  addWays(net);
  return { tick, forEach, stats, carriageways: C, active, speedNear, addTile, removeTile, setSignals, signalsNear, setEgo };
}
