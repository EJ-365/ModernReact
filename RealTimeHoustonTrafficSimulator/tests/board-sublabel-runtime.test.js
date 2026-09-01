import test from 'node:test';
import assert from 'node:assert/strict';
import { buildLatLngRuntimePack } from '../src/cities/build-runtime-pack.js';
import { buildSanAntonioRuntimePack } from '../src/cities/sanantonio/runtime.js';
import { buildDallasRuntimePack } from '../src/cities/dallas/runtime.js';
import { makeGeo } from '../src/core/index.js';
import { sanantonioManifest } from '../src/cities/sanantonio/manifest.js';
import { dallasManifest } from '../src/cities/dallas/manifest.js';

test('buildLatLngRuntimePack does not throw on missing boardSublabel', () => {
  const geo = makeGeo({ lat: 29.42, lng: -98.49, unitsPerMile: 210 });
  const pack = buildLatLngRuntimePack(geo, {
    id: 'sanantonio',
    name: 'San Antonio',
    originLat: 29.42,
    originLng: -98.49,
    roads: [],
    airports: [{ code: 'SAT', lat: 29.53, lng: -98.47 }],
  });
  assert.equal(pack.id, 'sanantonio');
  assert.match(pack.boardSublabel, /San Antonio airports/);
});

test('buildLatLngRuntimePack prefers src.boardSublabel', () => {
  const geo = makeGeo({ lat: 29.42, lng: -98.49, unitsPerMile: 210 });
  const pack = buildLatLngRuntimePack(geo, {
    id: 'sanantonio',
    name: 'San Antonio',
    boardSublabel: 'Custom board label',
    roads: [],
    airports: [],
  });
  assert.equal(pack.boardSublabel, 'Custom board label');
});

test('San Antonio and Dallas runtime packs boot after free-feeds boardSublabel fix', () => {
  const sa = buildSanAntonioRuntimePack(makeGeo(sanantonioManifest.origin));
  const dfw = buildDallasRuntimePack(makeGeo(dallasManifest.origin));
  assert.equal(sa.id, 'sanantonio');
  assert.equal(dfw.id, 'dallas');
  assert.ok(sa.boardSublabel);
  assert.ok(dfw.boardSublabel);
});
