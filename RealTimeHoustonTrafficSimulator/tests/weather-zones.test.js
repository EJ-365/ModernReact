import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildWeatherZones,
  chunkWeatherZones,
  sampleZoneWeather,
  rainIntensityAt,
  openMeteoMultiUrl,
} from '../src/weather-zones.js';

test('buildWeatherZones includes ALL suburbs by default', () => {
  const districts = [
    { id: 'downtown', n: 'Downtown', lat: 29.76, lng: -95.37, x: 60, z: 60, r: 400 },
    { id: 'sugarland', n: 'Sugar Land', lat: 29.62, lng: -95.63, x: -2800, z: 2200, r: 500 },
    { id: 'near_dt', n: 'Midtown', lat: 29.74, lng: -95.38, x: 80, z: 120, r: 250 },
    { id: 'katy', n: 'Katy', lat: 29.78, lng: -95.82, x: -3520, z: -180, r: 560 },
  ];
  const zones = buildWeatherZones(districts, {
    lat: 29.76,
    lng: -95.37,
    x: 60,
    z: 60,
    name: 'Houston',
    unitsPerMile: 210,
  });
  assert.equal(zones[0].id, 'core');
  assert.ok(zones.some((z) => z.id === 'near_dt'));
  assert.equal(zones.length, 1 + districts.filter((d) => d.id !== 'downtown').length);
});

test('rain is STRICTLY local — downtown storm must not paint Sugar Land', () => {
  const zones = [
    {
      id: 'core',
      n: 'Downtown',
      lat: 29.76,
      lng: -95.37,
      x: 0,
      z: 0,
      r: 500,
      wx: { preset: 'storm', label: 'Thunderstorm', rainAmt: 1, cloud: 1, temp: 78, wind: 20, windDir: 180, precip: 0.4 },
    },
    {
      id: 'sugarland',
      n: 'Sugar Land',
      lat: 29.62,
      lng: -95.63,
      x: 3000,
      z: 0,
      r: 500,
      wx: { preset: 'clear', label: 'Clear', rainAmt: 0, cloud: 0.1, temp: 84, wind: 8, windDir: 90, precip: 0 },
    },
    {
      id: 'conroe',
      n: 'Conroe',
      lat: 30.31,
      lng: -95.46,
      x: -1600,
      z: -4950,
      r: 540,
      wx: { preset: 'rain', label: 'Light drizzle', rainAmt: 0.3, cloud: 0.9, temp: 70, wind: 10, windDir: 90, precip: 0.02 },
    },
  ];
  assert.ok(rainIntensityAt(zones, 3000, 0) < 0.05, 'Sugar Land stays dry');
  assert.ok(rainIntensityAt(zones, 0, 0) > 0.5, 'Downtown is wet');
  assert.ok(rainIntensityAt(zones, -1600, -4950) >= 0.28, 'Conroe drizzle is wet');
  const conroe = sampleZoneWeather(zones, -1600, -4950);
  assert.equal(conroe.place, 'Conroe');
  assert.match(conroe.label, /drizzle/i);
});

test('missing local feed does NOT borrow rain from another suburb', () => {
  const zones = [
    {
      id: 'core',
      n: 'Downtown',
      x: 0,
      z: 0,
      r: 500,
      lat: 29.76,
      lng: -95.37,
      wx: { preset: 'storm', label: 'Thunderstorm', rainAmt: 1, precip: 0.5 },
    },
    {
      id: 'conroe',
      n: 'Conroe',
      x: -1600,
      z: -4950,
      r: 540,
      lat: 30.31,
      lng: -95.46,
      wx: null,
    },
  ];
  assert.equal(rainIntensityAt(zones, -1600, -4950), 0);
});

test('chunkWeatherZones batches large metros', () => {
  const zones = Array.from({ length: 85 }, (_, i) => ({ id: 'z' + i, lat: 29 + i * 0.01, lng: -95 }));
  const batches = chunkWeatherZones(zones, 40);
  assert.equal(batches.length, 3);
});

test('openMeteoMultiUrl encodes multiple coordinates', () => {
  const url = openMeteoMultiUrl(
    [
      { lat: 29.76, lng: -95.37 },
      { lat: 29.62, lng: -95.63 },
    ],
    '/api/openmeteo',
    'America/Chicago',
    false,
  );
  assert.match(url, /latitude=29\.76000,29\.62000/);
});

test('pack-city suburbs all become weather zones (NYC / Austin / DFW pattern)', async () => {
  const { NEWYORK_DISTRICTS } = await import('../src/cities/newyork/pack.js');
  const { AUSTIN_DISTRICTS } = await import('../src/cities/austin/pack.js');
  const { DALLAS_DISTRICTS } = await import('../src/cities/dallas/pack.js');
  for (const [name, list, origin] of [
    ['nyc', NEWYORK_DISTRICTS, { lat: 40.7128, lng: -74.006, name: 'New York' }],
    ['austin', AUSTIN_DISTRICTS, { lat: 30.2672, lng: -97.7431, name: 'Austin' }],
    ['dallas', DALLAS_DISTRICTS, { lat: 32.7797, lng: -96.798, name: 'Dallas' }],
  ]) {
    const districts = list.map((d, i) => ({
      ...d,
      x: (d.lng - origin.lng) * 6000,
      z: (origin.lat - d.lat) * 6900,
    }));
    const zones = buildWeatherZones(districts, {
      ...origin,
      x: 0,
      z: 0,
      unitsPerMile: 210,
      allSuburbs: true,
    });
    const expected = 1 + districts.filter((d) => d.id !== 'downtown' && d.id !== 'core').length;
    assert.equal(zones.length, expected, name + ' should include every suburb');
    assert.ok(zones.every((z) => Number.isFinite(z.lat) && Number.isFinite(z.lng)), name + ' lat/lng');
  }
});
