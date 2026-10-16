import test from 'node:test';
import assert from 'node:assert/strict';
import { createHoustonTraffic } from '../src/render/houston-traffic.js';

function frame(pts) {
  const n = pts.length / 2, nx = new Float32Array(n), nz = new Float32Array(n), m = new Float32Array(n).fill(1), cum = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const i0 = Math.max(0, i - 1), i1 = Math.min(n - 1, i + 1);
    const dx = pts[2 * i1] - pts[2 * i0], dz = pts[2 * i1 + 1] - pts[2 * i0 + 1], l = Math.hypot(dx, dz) || 1;
    nx[i] = -dz / l; nz[i] = dx / l;
    if (i) cum[i] = cum[i - 1] + Math.hypot(pts[2 * i] - pts[2 * i - 2], pts[2 * i + 1] - pts[2 * i - 1]);
  }
  return { n, pts, ys: null, nx, nz, m, cum };
}
function seeded(s) { return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }
const way = (p, extra) => ({ r: { h: 'motorway', l: 3, w: 14, o: 1, r: 'I 10', ...extra }, f: frame(p), ys: null, cy: 0.16 });

test('v2 traffic: cars fill lanes, move at speed, never overlap, hand over between ways', () => {
  const net = [way([0, 0, 1000, 0, 2000, 0]), way([2000, 0, 3000, 0, 4000, 0]), way([2000, 0, 2400, 300], { h: 'motorway_link', l: 1, w: 5 })];
  const T = createHoustonTraffic({
    net, k: 1, offset: 60, rand: seeded(7), budget: 800,
    env: { cong: () => ({ cong: 0.1, mph: null }), headway: () => 1.6 },
    mkCar: () => ({ type: { len: 4.8 }, len: 6.1 }),
  });
  T.tick(0.016, 2000, 0, 800);
  assert.ok(T.stats.cars > 40, 'seeded ' + T.stats.cars);
  let sumV = 0, n = 0;
  for (let f = 0; f < 600; f++) T.tick(0.05, 2000, 0, 800);
  for (const c of T.active) for (const lane of c.lanes) {
    for (let i = 1; i < lane.length; i++) assert.ok(lane[i].u - lane[i - 1].u >= (lane[i].len + lane[i - 1].len) / 2 - 0.01, 'overlap');
    for (const car of lane) { sumV += car.v; n++; assert.ok(car.li < c.nl); }
  }
  const avgMph = sumV / n / 0.44704;
  assert.ok(avgMph > 35 && avgMph < 75, 'avg mph ' + avgMph);
  const pos = [];
  T.forEach((car) => pos.push(car));
  assert.ok(pos.every((c) => Number.isFinite(c._px) && Math.abs(c._pz) < 320), 'positions on road');
  /* lane centres sit inside the carriageway */
  for (const c of pos.filter((c) => c.c.w === net[0])) assert.ok(Math.abs(c._pz) <= 7, 'lane ' + c._pz);
});

test('v2 traffic: congestion slows cars and packs them tighter', () => {
  const run = (cong) => {
    const T = createHoustonTraffic({
      net: [way([0, 0, 3000, 0])], rand: seeded(3), budget: 2000,
      env: { cong: () => ({ cong, mph: null }), headway: () => 1.6 }, mkCar: () => ({ type: { len: 4.8 }, len: 6.1 }),
    });
    T.tick(0.016, 1500, 0, 900);
    for (let f = 0; f < 200; f++) T.tick(0.05, 1500, 0, 900);
    let v = 0, n = 0; for (const c of T.active) for (const l of c.lanes) for (const car of l) { v += car.v; n++; }
    return { n, mph: v / n / 0.44704 };
  };
  const free = run(0.05), jam = run(0.9);
  assert.ok(jam.mph < free.mph * 0.4, JSON.stringify({ free, jam }));
  assert.ok(jam.n > free.n * 1.5, JSON.stringify({ free, jam }));
});

test('v2 traffic: cars stop at red OSM signals, queue, and go on green', () => {
  const net = [way([0, 0, 250, 0, 500, 0, 750, 0, 1000, 0], { h: 'primary', l: 2, w: 8, o: 'yes', r: '' })];
  const T = createHoustonTraffic({
    net, k: 1, offset: 60, rand: seeded(3), budget: 400,
    env: { cong: () => ({ cong: 0, mph: null }), headway: () => 1.5 },
    mkCar: () => ({ len: 4.8 }),
  });
  T.setSignals([[500, 0]]);
  assert.equal(T.stats.signalled, 1);
  T.tick(0.016, 500, 0, 600);
  let queued = 0, redRuns = 0, moved = 0;
  const prev = new Map();
  for (let f = 0; f < 3000; f++) {
    T.tick(0.05, 500, 0, 600);
    let st = 'g'; T.signalsNear(500, 0, 50, (...a) => { st = a[7]; });
    let q = 0;
    for (const c of T.active) for (const lane of c.lanes) for (const car of lane) {
      const p = prev.get(car);
      if (car.v < 0.3 && car.u > 380 && car.u < 494) q++;
      if (p && p.u < 491 && car.u >= 494 && st === 'r' && p.v < 2) redRuns++;
      if (p && p.u < 494 && car.u >= 494) moved++;
      prev.set(car, { u: car.u, v: car.v });
    }
    queued = Math.max(queued, q);
  }
  assert.ok(queued >= 2, 'queue at red ' + queued);
  assert.equal(redRuns, 0, 'stopped cars never start on red');
  assert.ok(moved > 10, 'cars pass on green ' + moved);
});

test('v2 traffic: streets keep their own share of cars next to a busy freeway', () => {
  const net = [way([0, 0, 2000, 0, 4000, 0])];
  for (let i = 0; i < 8; i++) net.push(way([i * 400, 100, i * 400, 600], { h: 'residential', l: 2, w: 7, o: '', r: '' }));
  const T = createHoustonTraffic({
    net, k: 1, offset: 60, rand: seeded(11), budget: 120,
    env: { cong: () => ({ cong: 0.4, mph: null }), headway: () => 1.4 },
    mkCar: () => ({ len: 4.8 }),
  });
  for (let f = 0; f < 400; f++) T.tick(0.05, 1500, 300, 800);
  let s = 0, m = 0;
  for (const c of T.active) for (const lane of c.lanes) for (const car of lane) if (car.c.street) s++; else m++;
  assert.ok(s >= 3, 'street cars ' + s);
  assert.ok(m > 40, 'freeway cars ' + m);
});
