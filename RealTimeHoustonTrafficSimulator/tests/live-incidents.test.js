import test from 'node:test';
import assert from 'node:assert/strict';
import { CITY_PACKS } from '../src/cities/registry.js';
import { incidentCoordinateInBounds } from '../src/live-incidents.js';

test('incident coordinates use the active city bounds', () => {
  for (const city of Object.values(CITY_PACKS)) {
    assert.equal(
      incidentCoordinateInBounds(city.origin.lat, city.origin.lng, city.bbox),
      true,
      city.id + ' rejects its own incident coordinates',
    );
  }

  assert.equal(
    incidentCoordinateInBounds(
      CITY_PACKS.losangeles.origin.lat,
      CITY_PACKS.losangeles.origin.lng,
      CITY_PACKS.houston.bbox,
    ),
    false,
    'coordinates must not be accepted against a different metro',
  );
});

test('incident coordinates reject invalid values and use Houston fallback bounds', () => {
  assert.equal(incidentCoordinateInBounds(NaN, -95.36, CITY_PACKS.houston.bbox), false);
  assert.equal(incidentCoordinateInBounds(29.76, Infinity, CITY_PACKS.houston.bbox), false);
  assert.equal(incidentCoordinateInBounds(29.76, -95.36), true);
  assert.equal(incidentCoordinateInBounds(34.05, -118.24), false);
});
