import test from 'node:test';
import assert from 'node:assert/strict';
import { rainIntensityAt } from '../src/weather-zones.js';

/**
 * Mirrors rain.js mosaicDriving decision: suburb cull only when the
 * camera-local zone matches sky blend; otherwise paint from blend (forced Storm, pending feeds).
 */
function mosaicDriving(zonesLive, camRain, blendRain) {
  return !!zonesLive && camRain >= blendRain - 0.12;
}

function localAt(mosaic, zones, rainF, x, z) {
  if (!mosaic) return rainF;
  return rainIntensityAt(zones, x, z);
}

test('forced storm still paints rain when suburb mosaic says clear', () => {
  const zones = [
    {
      id: 'core',
      n: 'Downtown',
      x: 0,
      z: 0,
      r: 500,
      wx: { rainAmt: 0, precip: 0 },
    },
  ];
  const blendRain = 1;
  const camRain = rainIntensityAt(zones, 0, 0);
  assert.equal(camRain, 0);
  const mosaic = mosaicDriving(true, camRain, blendRain);
  assert.equal(mosaic, false);
  assert.ok(localAt(mosaic, zones, blendRain, 0, 0) > 0.5);
});

test('live suburb drizzle paints locally and skips dry neighbor', () => {
  const zones = [
    {
      id: 'core',
      n: 'Downtown',
      x: 0,
      z: 0,
      r: 500,
      wx: { rainAmt: 0.4, precip: 0.05 },
    },
    {
      id: 'dry',
      n: 'Dry Town',
      x: 4000,
      z: 0,
      r: 500,
      wx: { rainAmt: 0, precip: 0 },
    },
  ];
  const camRain = rainIntensityAt(zones, 0, 0);
  const blendRain = camRain;
  const mosaic = mosaicDriving(true, camRain, blendRain);
  assert.equal(mosaic, true);
  assert.ok(localAt(mosaic, zones, blendRain, 0, 0) >= 0.35);
  assert.ok(localAt(mosaic, zones, blendRain, 4000, 0) < 0.05);
});

test('pending mosaic (no zone wx) falls back to sky blend', () => {
  const zones = [{ id: 'core', n: 'Downtown', x: 0, z: 0, r: 500, wx: null }];
  const blendRain = 0.7;
  const camRain = 0;
  const mosaic = mosaicDriving(false, camRain, blendRain);
  assert.equal(mosaic, false);
  assert.equal(localAt(mosaic, zones, blendRain, 0, 0), 0.7);
});
