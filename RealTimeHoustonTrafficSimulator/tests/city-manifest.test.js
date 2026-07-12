import test from 'node:test';
import assert from 'node:assert/strict';
import { houstonManifest } from '../src/cities/houston/manifest.js';
import { isCityManifest, CITY_IDS } from '../src/cities/types.js';
import { transtarAdapter } from '../src/feeds/transtar.js';

test('houston manifest', async (t) => {
  await t.test('passes shape check', () => {
    assert.equal(isCityManifest(houstonManifest), true);
  });
  await t.test('has Houston origin downtown', () => {
    assert.equal(houstonManifest.id, 'houston');
    assert.ok(Math.abs(houstonManifest.origin.lat - 29.7604) < 0.001);
    assert.equal(houstonManifest.origin.unitsPerMile, 210);
  });
  await t.test('lists in CITY_IDS', () => {
    assert.ok(CITY_IDS.includes('houston'));
  });
});

test('transtar adapter', async (t) => {
  await t.test('supports houston only', () => {
    assert.equal(transtarAdapter.supports(houstonManifest), true);
    assert.equal(transtarAdapter.supports({ id: 'austin', feeds: { primaryTraffic: 'tomtom' } }), false);
  });
  await t.test('refresh returns a snapshot shape', async () => {
    const snap = await transtarAdapter.refresh(houstonManifest);
    assert.ok(snap.at > 0);
    assert.ok(snap.flows instanceof Map);
    assert.ok(Array.isArray(snap.incidents));
  });
});
