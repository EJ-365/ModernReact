import test from 'node:test';
import assert from 'node:assert/strict';
import { buildBostonRuntimePack } from '../src/cities/boston/runtime.js';
import { makeGeo } from '../src/core/geo.js';
import { bostonManifest } from '../src/cities/boston/manifest.js';

/** Mirrors app-main nearestDecorAirport + APT_COORDS sync after pack load. */
function syncAptCoords(APT_COORDS, pack, airports) {
  if (pack?.aptCoords) {
    for (const [code, c] of Object.entries(pack.aptCoords)) {
      if (c && Number.isFinite(c.lat) && Number.isFinite(c.lng)) APT_COORDS[code] = c;
    }
  }
  for (const a of airports) {
    if (a.code && Number.isFinite(a.lat) && Number.isFinite(a.lng)) {
      APT_COORDS[a.code] = { lat: a.lat, lng: a.lng, x: a.x, z: a.z };
    }
  }
}

function aptDistMi(APT_COORDS, code, lat, lon) {
  const a = APT_COORDS[code];
  if (!a) return null;
  return Math.hypot((a.lat - lat) * 69, (a.lng - lon) * 59.9 * Math.cos((lat * Math.PI) / 180));
}

function nearestDecorAirport(APT_COORDS, airports, lat, lon) {
  let best = null;
  let bd = 1e9;
  for (const a of airports) {
    const d = aptDistMi(APT_COORDS, a.code, lat, lon);
    if (d != null && d < bd) {
      bd = d;
      best = a;
    }
  }
  return best ? { apt: best, mi: bd } : null;
}

test('pack airport coords resolve Boston Logan for live flight proximity', () => {
  const geo = makeGeo(bostonManifest.origin);
  const pack = buildBostonRuntimePack(geo);
  const APT_COORDS = {};
  syncAptCoords(APT_COORDS, pack, pack.airports);
  const bos = pack.airports[0];
  const near = nearestDecorAirport(APT_COORDS, pack.airports, bos.lat, bos.lng);
  assert.ok(near, 'BOS must resolve after sync');
  assert.equal(near.apt.code, 'BOS');
  assert.ok(near.mi < 1, 'on-field proximity under 1 mi');
});
