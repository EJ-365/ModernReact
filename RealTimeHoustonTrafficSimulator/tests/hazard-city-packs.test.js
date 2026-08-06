import test from 'node:test';
import assert from 'node:assert/strict';
import { buildCityHazards, HOUSTON_NUKE, AUSTIN_NUKE } from '../src/cities/hazard-packs.js';
import { makeGeo } from '../src/core/geo.js';
import { resolveCity } from '../src/cities/registry.js';
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
import { buildPhoenixRuntimePack } from '../src/cities/phoenix/runtime.js';
import { buildPhiladelphiaRuntimePack } from '../src/cities/philadelphia/runtime.js';
import { buildMinneapolisRuntimePack } from '../src/cities/minneapolis/runtime.js';
import { buildNewOrleansRuntimePack } from '../src/cities/neworleans/runtime.js';

/** Houston-only landmark phrases that must never appear in other metros' hazard copy/targets. */
const HOUSTON_ONLY = /ship channel|galleria\s*\/\s*uptown|meyerland|addicks|barker pool|energy corridor|baytown exxon|pasadena refin|nrg park|nasa johnson|texas medical center|galveston bay|clear lake\s*\/\s*nasa|i-45 n|hobby airport|ellington field|greenspoint|katy prairie|buffalo bayou/i;

const PACKS = [
  ['sanantonio', buildSanAntonioRuntimePack],
  ['dallas', buildDallasRuntimePack],
  ['losangeles', buildLosAngelesRuntimePack],
  ['newyork', buildNewYorkRuntimePack],
  ['boston', buildBostonRuntimePack],
  ['chicago', buildChicagoRuntimePack],
  ['miami', buildMiamiRuntimePack],
  ['seattle', buildSeattleRuntimePack],
  ['denver', buildDenverRuntimePack],
  ['atlanta', buildAtlantaRuntimePack],
  ['phoenix', buildPhoenixRuntimePack],
  ['philadelphia', buildPhiladelphiaRuntimePack],
  ['minneapolis', buildMinneapolisRuntimePack],
  ['neworleans', buildNewOrleansRuntimePack],
];

const HOUSTON_SHORTS = new Set(HOUSTON_NUKE.map((t) => t.short.toLowerCase()));

test('New Orleans nuclear targets are local (not Houston suburbs)', () => {
  const m = resolveCity('neworleans');
  const geo = makeGeo(m.origin);
  const pack = buildNewOrleansRuntimePack(geo);
  const haz = buildCityHazards({
    cityId: 'neworleans',
    pack,
    cityName: pack.name,
    metroName: pack.metroName,
    geoToWorld: geo.geoToWorld,
  });
  const names = haz.nukeTargets.map((t) => t.short + '|' + t.n).join(' ;; ');
  assert.ok(/CBD|Superdome|MSY|French|Port/i.test(names), names);
  assert.equal(/Galleria|Ship Channel|Meyerland|IAH|Hobby|NRG|Energy Corridor/i.test(names), false, names);
  assert.equal(haz.floodRibbonMode, 'pack');
  assert.ok((haz.floodZones || []).length >= 3);
  assert.equal(HOUSTON_ONLY.test(JSON.stringify(haz.scenarios)), false);
});

for (const [id, build] of PACKS) {
  test(id + ' hazard pack has no Houston-only leakage', () => {
    const m = resolveCity(id);
    const geo = makeGeo(m.origin);
    const pack = build(geo);
    const haz = buildCityHazards({
      cityId: id,
      pack,
      cityName: pack.name,
      metroName: pack.metroName,
      geoToWorld: geo.geoToWorld,
    });
    assert.ok(haz.nukeTargets.length >= 4, id + ' nuke count');
    for (const t of haz.nukeTargets) {
      const blob = [t.id, t.n, t.short, t.why].join(' ');
      assert.equal(HOUSTON_ONLY.test(blob), false, id + ' nuke leak: ' + blob);
      /* Exact Houston short labels (Ship Channel, Uptown-as-Galleria shorthand, etc.) */
      if (HOUSTON_SHORTS.has(String(t.short).toLowerCase()) && /ship channel|energy corridor|nrg park|nasa jsc/i.test(t.short)) {
        assert.fail(id + ' reused Houston short: ' + t.short);
      }
    }
    const scen = JSON.stringify(haz.scenarios);
    assert.equal(HOUSTON_ONLY.test(scen), false, id + ' scenario leak: ' + (scen.match(HOUSTON_ONLY) || [])[0]);
    assert.equal(haz.floodRibbonMode, 'pack');
    assert.ok((haz.floodZones || []).length >= 1, id + ' flood zones');
    assert.ok(haz.wildfireLatLng && haz.wildfireLatLng.length >= 3, id + ' wildfire cells');
    assert.ok(Math.abs(haz.downtownLatLng[0] - pack.originLat) < 0.05);
  });
}

test('Houston and Austin keep curated nuke lists', () => {
  const geoH = makeGeo(resolveCity('houston').origin);
  const h = buildCityHazards({
    cityId: 'houston',
    pack: null,
    cityName: 'Houston',
    metroName: 'Greater Houston',
    geoToWorld: geoH.geoToWorld,
  });
  assert.ok(h.nukeTargets.some((t) => /Ship Channel/i.test(t.n)));
  assert.equal(h.floodRibbonMode, 'houston');

  const geoA = makeGeo(resolveCity('austin').origin);
  const a = buildCityHazards({
    cityId: 'austin',
    pack: { originLat: 30.2672, originLng: -97.7431, name: 'Austin', metroName: 'Greater Austin' },
    cityName: 'Austin',
    metroName: 'Greater Austin',
    geoToWorld: geoA.geoToWorld,
  });
  assert.equal(a.nukeTargets.length, AUSTIN_NUKE.length);
  assert.ok(a.nukeTargets.some((t) => /Capitol/i.test(t.n)));
  assert.equal(a.floodRibbonMode, 'austin');
});
