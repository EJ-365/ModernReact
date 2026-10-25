import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { gcDist, llToVec, vecToLL, subSolar, gcLerp, bearing } from '../src/world/globe.js';

const cat = JSON.parse(fs.readFileSync(new URL('../src/world/catalog.json', import.meta.url)));
const AMERICAS = new Set(['United States', 'Canada', 'Mexico']);

test('world catalog: unique ids, valid coords, driving only in the Americas', () => {
  const ids = new Set();
  for (const c of cat.cities) {
    assert.ok(!ids.has(c.id), 'dup ' + c.id); ids.add(c.id);
    assert.ok(Math.abs(c.lat) <= 90 && Math.abs(c.lng) <= 180, c.id);
    assert.ok(c.apt && /^[A-Z]{3}$/.test(c.apt.code), c.id + ' airport');
    assert.ok(gcDist(c, c.apt) < 60, c.id + ' airport within 60 km');
    assert.equal(!!c.drive, AMERICAS.has(c.country), c.id + ' drive flag');
    assert.ok(c.tz && c.tz.includes('/'), c.id + ' tz');
  }
  assert.ok(cat.cities.length >= 30);
  assert.equal(cat.cities.filter((c) => c.full).map((c) => c.id).join(), 'houston');
});

test('world catalog: requested cities present', () => {
  const ids = new Set(cat.cities.map((c) => c.id));
  for (const id of ['houston', 'austin', 'dallas', 'sanantonio', 'toronto', 'lagos', 'accra', 'cairo', 'rome', 'mexicocity', 'sydney', 'singapore', 'mumbai', 'tokyo'])
    assert.ok(ids.has(id), id);
});

test('every world city has a data pack with an airport runway', () => {
  for (const c of cat.cities) {
    const f = new URL(`../public/data/world/${c.id}.json`, import.meta.url);
    assert.ok(fs.existsSync(f), c.id + ' pack');
    const p = JSON.parse(fs.readFileSync(f));
    assert.equal(p.v, 1); assert.ok(p.roads.length > 100, c.id + ' roads');
    assert.ok(p.runways.length > 0 && p.apt.rwy, c.id + ' runway');
    if (!c.full) assert.ok(fs.existsSync(new URL(`../public/data/cities/${c.id}/buildings.json`, import.meta.url)), c.id + ' buildings');
  }
});

test('great-circle helpers', () => {
  const hou = { lat: 29.99, lng: -95.34 }, lhr = { lat: 51.47, lng: -0.45 };
  const d = gcDist(hou, lhr); assert.ok(d > 7700 && d < 7900, String(d));
  const m = gcLerp(hou, lhr, 0.5); assert.ok(Math.abs(gcDist(hou, m) - d / 2) < 5);
  const b = bearing(hou, lhr); assert.ok(b > 30 && b < 50, String(b));
  const v = vecToLL(llToVec(-33.9, 151.2)); assert.ok(Math.abs(v.lat + 33.9) < 1e-9 && Math.abs(v.lng - 151.2) < 1e-9);
  const s = subSolar(new Date(Date.UTC(2026, 5, 21, 12, 0))); assert.ok(Math.abs(s.lat - 23.44) < 0.6 && Math.abs(s.lng) < 3);
});
