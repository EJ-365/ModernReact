import test from 'node:test';
import assert from 'node:assert/strict';
import { austinManifest } from '../src/cities/austin/manifest.js';
import { houstonManifest } from '../src/cities/houston/manifest.js';
import { isCityManifest, CITY_IDS } from '../src/cities/types.js';
import { resolveCity, CITY_PACKS } from '../src/cities/registry.js';
import { buildAustinRuntimePack } from '../src/cities/austin/runtime.js';
import { AUSTIN_ROAD_LATLNG, AUSTIN_DISTRICTS, AUSTIN_AIRPORTS } from '../src/cities/austin/pack.js';
import { tomtomAdapter } from '../src/feeds/tomtom.js';
import { transtarAdapter } from '../src/feeds/transtar.js';
import { makeGeo } from '../src/core/geo.js';

test('austin manifest shape', () => {
  assert.equal(isCityManifest(austinManifest), true);
  assert.equal(austinManifest.id, 'austin');
  assert.equal(austinManifest.feeds.primaryTraffic, 'tomtom');
  assert.ok(Math.abs(austinManifest.origin.lat - 30.2672) < 0.001);
  assert.ok(CITY_IDS.includes('austin'));
  assert.ok(CITY_PACKS.austin);
});

test('adapter swap: Austin uses TomTom, not TranStar', () => {
  assert.equal(tomtomAdapter.supports(austinManifest), true);
  assert.equal(transtarAdapter.supports(austinManifest), false);
  assert.equal(transtarAdapter.supports(houstonManifest), true);
  assert.equal(tomtomAdapter.supports(houstonManifest), true); /* Houston fallback */
});

test('resolveCity defaults and austin id', () => {
  assert.equal(resolveCity('austin').id, 'austin');
  assert.equal(resolveCity('nope').id, 'houston');
  assert.equal(resolveCity().id, 'houston');
});

test('austin researched pack has I-35 / MoPac / AUS', () => {
  assert.ok(AUSTIN_ROAD_LATLNG.some((r) => r.id === 'i35'));
  assert.ok(AUSTIN_ROAD_LATLNG.some((r) => r.id === 'mopac'));
  assert.ok(AUSTIN_DISTRICTS.some((d) => d.id === 'downtown'));
  assert.ok(AUSTIN_DISTRICTS.some((d) => d.id === 'roundrock'));
  assert.equal(AUSTIN_AIRPORTS[0].code, 'AUS');
});

test('austin runtime pack converts downtown near origin', () => {
  const geo = makeGeo(austinManifest.origin);
  const pack = buildAustinRuntimePack(geo);
  assert.equal(pack.id, 'austin');
  assert.equal(pack.skipOsmCorridors, true);
  assert.ok(pack.roads.length >= 8);
  const dt = pack.districts.find((d) => d.id === 'downtown');
  assert.ok(dt);
  assert.ok(Math.hypot(dt.x - 60, dt.z - 60) < 80);
  assert.deepEqual(pack.boardApts, ['AUS', 'EDC']);
  assert.ok(pack.corridors.some((c) => /I-35/.test(c.label)));
});
