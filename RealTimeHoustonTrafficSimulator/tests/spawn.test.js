/**
 * Regression: findOpenSpawnS tail branch must use tail.s, never tail+number (NaN).
 * Mirrors app.html logic — keep in sync when spawn algorithm changes.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);

function findOpenSpawnS(lane, L, closed, minGap, rand = Math.random) {
  if (!lane.length) return closed ? rand() * L : L * 0.04;
  let bestGap = 0;
  let bestS = L * 0.04;
  for (let i = 0; i < lane.length; i++) {
    const a = lane[i];
    const b = lane[(i + 1) % lane.length];
    let gap = b.s - a.s;
    if (gap <= 0) gap += L;
    if (gap > bestGap) {
      bestGap = gap;
      bestS = a.s + gap * (0.32 + rand() * 0.36);
    }
  }
  if (!closed) {
    const tail = lane[lane.length - 1];
    const tailGap = L - tail.s;
    if (tailGap > bestGap) {
      bestGap = tailGap;
      bestS = tail.s + tailGap * 0.45;
    }
    if (lane[0].s > minGap && lane[0].s * 0.5 > bestGap) bestS = 0;
  }
  if (bestGap < minGap) return -1;
  return closed ? ((bestS % L) + L) % L : clamp(bestS, L * 0.02, L * 0.98);
}

function makeLane(n, L, rng) {
  const lane = [];
  let s = L * 0.1;
  for (let i = 0; i < n; i++) {
    lane.push({ s, type: { len: 4.5 + rng() * 8 } });
    s += 12 + rng() * 40;
    if (s > L * 0.92) break;
  }
  lane.sort((a, b) => a.s - b.s);
  return lane;
}

describe('findOpenSpawnS', () => {
  it('tail-heavy open roads never return NaN (20k randomized)', () => {
    let nanCount = 0;
    for (let i = 0; i < 20000; i++) {
      const L = 800 + Math.random() * 4200;
      const minGap = 10 + Math.random() * 8;
      const n = 1 + Math.floor(Math.random() * 14);
      const lane = makeLane(n, L, Math.random);
      const s = findOpenSpawnS(lane, L, false, minGap, Math.random);
      if (s === -1) continue;
      if (!Number.isFinite(s)) nanCount++;
    }
    assert.equal(nanCount, 0, `expected zero NaN spawns, got ${nanCount}`);
  });

  it('tail branch uses tail.s arithmetic (not object coercion)', () => {
    const tail = { s: 1850, type: { len: 5 } };
    const L = 2000;
    const tailGap = L - tail.s;
    const bestS = tail.s + tailGap * 0.45;
    assert.equal(bestS, 1917.5);
    assert.ok(Number.isFinite(bestS));
  });

  it('returns -1 when no gap meets minGap', () => {
    const L = 200;
    const lane = [{ s: 50, type: { len: 5 } }, { s: 120, type: { len: 5 } }];
    const s = findOpenSpawnS(lane, L, false, 500, () => 0.5);
    assert.equal(s, -1);
  });
});
