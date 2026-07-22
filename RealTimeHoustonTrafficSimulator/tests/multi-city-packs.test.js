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
import { buildChicagoRuntimePack } from '../src/cities/chicago/runtime.js';
import { buildMiamiRuntimePack } from '../src/cities/miami/runtime.js';
import { buildSeattleRuntimePack } from '../src/cities/seattle/runtime.js';
import { buildDenverRuntimePack } from '../src/cities/denver/runtime.js';
import { buildAtlantaRuntimePack } from '../src/cities/atlanta/runtime.js';
import { SANANTONIO_ROAD_LATLNG, SANANTONIO_AIRPORTS } from '../src/cities/sanantonio/pack.js';
import { DALLAS_ROAD_LATLNG, DALLAS_AIRPORTS } from '../src/cities/dallas/pack.js';
import { LOSANGELES_ROAD_LATLNG, LOSANGELES_AIRPORTS } from '../src/cities/losangeles/pack.js';
import { NEWYORK_ROAD_LATLNG, NEWYORK_AIRPORTS } from '../src/cities/newyork/pack.js';
import { BOSTON_ROAD_LATLNG, BOSTON_AIRPORTS } from '../src/cities/boston/pack.js';
import { CHICAGO_ROAD_LATLNG, CHICAGO_AIRPORTS } from '../src/cities/chicago/pack.js';
import { MIAMI_ROAD_LATLNG, MIAMI_AIRPORTS } from '../src/cities/miami/pack.js';
import { SEATTLE_ROAD_LATLNG, SEATTLE_AIRPORTS } from '../src/cities/seattle/pack.js';
import { DENVER_ROAD_LATLNG, DENVER_AIRPORTS } from '../src/cities/denver/pack.js';
import { ATLANTA_ROAD_LATLNG, ATLANTA_AIRPORTS } from '../src/cities/atlanta/pack.js';

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
  {
    id: 'chicago',
    build: buildChicagoRuntimePack,
    roads: CHICAGO_ROAD_LATLNG,
    airports: CHICAGO_AIRPORTS,
    needRoads: ['i90', 'i290', 'lsd'],
    apt: 'ORD',
  },
  {
    id: 'miami',
    build: buildMiamiRuntimePack,
    roads: MIAMI_ROAD_LATLNG,
    airports: MIAMI_AIRPORTS,
    needRoads: ['i95', 'dolph', 'i395'],
    apt: 'MIA',
  },
  {
    id: 'seattle',
    build: buildSeattleRuntimePack,
    roads: SEATTLE_ROAD_LATLNG,
    airports: SEATTLE_AIRPORTS,
    needRoads: ['i5', 'i90', 'i405'],
    apt: 'SEA',
  },
  {
    id: 'denver',
    build: buildDenverRuntimePack,
    roads: DENVER_ROAD_LATLNG,
    airports: DENVER_AIRPORTS,
    needRoads: ['i25', 'i70', 'i225'],
    apt: 'DEN',
  },
  {
    id: 'atlanta',
    build: buildAtlantaRuntimePack,
    roads: ATLANTA_ROAD_LATLNG,
    airports: ATLANTA_AIRPORTS,
    needRoads: ['i75', 'i85', 'i285'],
    apt: 'ATL',
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
    'chicago',
    'miami',
    'seattle',
    'denver',
    'atlanta',
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
    assert.ok(pack.skyline.length >= 10, c.id + ' researched skyline');
    assert.ok((pack.skylinePockets || []).length >= 3, c.id + ' CBD fabric pockets');
    assert.ok(pack.boardApts.includes(c.apt));
    const dt = pack.districts.find(
      (d) => d.id === 'downtown' || d.id === 'dtla' || d.id === 'fidi' || d.id === 'midtown',
    );
    assert.ok(dt);
    assert.ok(Math.hypot(dt.x - 60, dt.z - 60) < 900, c.id + ' downtown near origin');
  });
}
