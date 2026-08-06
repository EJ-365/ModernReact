import test from 'node:test';
import assert from 'node:assert/strict';
import { geoToWorld, worldToGeo, makeGeo, HOUSTON_GEO_ORIGIN } from '../src/core/geo.js';
import { chicagoParts, partsToHourWeekend } from '../src/core/clock.js';
import {
  corridorAbsMinMinutes,
  clampCorridorMinutes,
  saneCorridorMinutes,
  applyCorridorPad,
  corridorDriveMiles,
} from '../src/core/corridor-eta.js';

test('geo Houston downtown round-trip', () => {
  const w = geoToWorld(HOUSTON_GEO_ORIGIN.lat, HOUSTON_GEO_ORIGIN.lng);
  assert.ok(Math.abs(w.x - 60) < 0.01);
  assert.ok(Math.abs(w.z - 60) < 0.01);
  const g = worldToGeo(w.x, w.z);
  assert.ok(Math.abs(g.lat - HOUSTON_GEO_ORIGIN.lat) < 1e-9);
  assert.ok(Math.abs(g.lng - HOUSTON_GEO_ORIGIN.lng) < 1e-9);
});

test('makeGeo uses city origin', () => {
  const geo = makeGeo({ lat: 30.27, lng: -97.74, unitsPerMile: 210 });
  const w = geo.geoToWorld(30.27, -97.74);
  assert.ok(Math.abs(w.x - 60) < 0.01);
  assert.ok(Math.abs(w.z - 60) < 0.01);
});

test('clock parts weekend', () => {
  /* Fixed UTC instant that is Saturday afternoon in Chicago */
  const d = new Date('2026-07-11T20:00:00Z'); /* Sat 3pm CDT */
  const r = partsToHourWeekend(chicagoParts(d, 'America/Chicago'));
  assert.equal(r.we, true);
  assert.ok(r.h >= 14 && r.h < 16);
});

test('Sugar Land corridor never claims ~13 min', () => {
  const sugar = {
    toDt: true,
    realMi: 22,
    typMin: 30,
    minMin: 22,
    maxMin: 80,
    tsPadMin: 8,
  };
  assert.equal(corridorDriveMiles(sugar), 22);
  assert.ok(corridorAbsMinMinutes(sugar) >= 22);
  assert.equal(saneCorridorMinutes(sugar, 13), null);
  assert.ok(clampCorridorMinutes(sugar, 13) >= 22);
  assert.equal(applyCorridorPad(sugar, 20), 28);
});
