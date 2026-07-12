import test from 'node:test';
import assert from 'node:assert/strict';
import { austinManifest } from '../src/cities/austin/manifest.js';
import { houstonManifest } from '../src/cities/houston/manifest.js';
import { isCityManifest, CITY_IDS } from '../src/cities/types.js';
import { resolveCity, CITY_PACKS } from '../src/cities/registry.js';
import { tomtomAdapter } from '../src/feeds/tomtom.js';
import { transtarAdapter } from '../src/feeds/transtar.js';

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
