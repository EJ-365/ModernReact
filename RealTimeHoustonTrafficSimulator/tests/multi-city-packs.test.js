import test from 'node:test';
import assert from 'node:assert/strict';
import { isCityManifest, CITY_IDS } from '../src/cities/types.js';
import { resolveCity, CITY_PACKS } from '../src/cities/registry.js';
import { makeGeo } from '../src/core/geo.js';
import { tomtomAdapter } from '../src/feeds/tomtom.js';
import { buildSanAntonioRuntimePack } from '../src/cities/sanantonio/runtime.js';
import { buildDallasRuntimePack } from '../src/cities/dallas/runtime.js';
import { buildLosAngelesRuntimePack } from '../src/cities/losangeles/runtime.js';
import { buildNewYorkRuntimePack } from '../src/cities/newyork/runtime.js';
import { buildBostonRuntimePack } from '../src/cities/boston/runtime.js';
import { SANANTONIO_ROAD_LATLNG, SANANTONIO_AIRPORTS } from '../src/cities/sanantonio/pack.js';
import { DALLAS_ROAD_LATLNG, DALLAS_AIRPORTS } from '../src/cities/dallas/pack.js';
import { LOSANGELES_ROAD_LATLNG, LOSANGELES_AIRPORTS } from '../src/cities/losangeles/pack.js';
import { NEWYORK_ROAD_LATLNG, NEWYORK_AIRPORTS } from '../src/cities/newyork/pack.js';
import { BOSTON_ROAD_LATLNG, BOSTON_AIRPORTS } from '../src/cities/boston/pack.js';

const PACK_CITIES = [
  {
    id: 'sanantonio',
    build: buildSanAntonioRuntimePack,
    roads: SANANTONIO_ROAD_LATLNG,
    airports: SANANTONIO_AIRPORTS,
    needRoads: ['i10', 'i35', 'loop410'],
    apt: 'SAT',
  },
  {
    id: 'dallas',
    build: buildDallasRuntimePack,
    roads: DALLAS_ROAD_LATLNG,
    airports: DALLAS_AIRPORTS,
    needRoads: ['i35e', 'i30', 'i635'],
    apt: 'DFW',
  },
  {
    id: 'losangeles',
    build: buildLosAngelesRuntimePack,
    roads: LOSANGELES_ROAD_LATLNG,
    airports: LOSANGELES_AIRPORTS,
    needRoads: ['i405', 'i10', 'i110'],
    apt: 'LAX',
  },
  {
    id: 'newyork',
    build: buildNewYorkRuntimePack,
    roads: NEWYORK_ROAD_LATLNG,
    airports: NEWYORK_AIRPORTS,
    needRoads: ['fdr', 'i95', 'i278'],
    apt: 'JFK',
  },
  {
    id: 'boston',
    build: buildBostonRuntimePack,
    roads: BOSTON_ROAD_LATLNG,
    airports: BOSTON_AIRPORTS,
    needRoads: ['i93', 'i90', 'i95'],
    apt: 'BOS',
  },
];

test('CITY_IDS lists all live metros', () => {
  for (const id of [
    'houston',
    'austin',
    'sanantonio',
    'dallas',
    'losangeles',
    'newyork',
    'boston',
  ]) {
    assert.ok(CITY_IDS.includes(id), id);
    assert.ok(CITY_PACKS[id], id + ' in registry');
    assert.equal(isCityManifest(CITY_PACKS[id]), true, id + ' manifest');
  }
});

for (const c of PACK_CITIES) {
  test(c.id + ' researched pack + runtime', () => {
    const m = resolveCity(c.id);
    assert.equal(m.id, c.id);
    assert.equal(m.feeds.primaryTraffic, 'tomtom');
    assert.equal(tomtomAdapter.supports(m), true);
    for (const rid of c.needRoads) {
      assert.ok(
        c.roads.some((r) => r.id === rid),
        c.id + ' missing road ' + rid,
      );
    }
    assert.ok(c.airports.some((a) => a.code === c.apt));
    const geo = makeGeo(m.origin);
    const pack = c.build(geo);
    assert.equal(pack.id, c.id);
    assert.equal(pack.useBuiltinRoads, false);
    assert.equal(pack.skipOsmCorridors, true);
    assert.ok(pack.roads.length >= 4);
    assert.ok(pack.districts.some((d) =>
      d.id === 'downtown' || d.id === 'dtla' || d.id === 'fidi' || d.id === 'midtown'
    ));
    assert.ok(pack.skyline.length >= 4);
    assert.ok(pack.boardApts.includes(c.apt));
    const dt = pack.districts.find(
      (d) => d.id === 'downtown' || d.id === 'dtla' || d.id === 'fidi' || d.id === 'midtown',
    );
    assert.ok(dt);
    assert.ok(Math.hypot(dt.x - 60, dt.z - 60) < 900, c.id + ' downtown near origin');
  });
}
