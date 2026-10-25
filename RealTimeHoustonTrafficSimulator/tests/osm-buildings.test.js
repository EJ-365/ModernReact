/**
 * OSM 3D building packs (v2, compact) — shape only (no Overpass).
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { OSM_BUILDING_COVERAGE } from '../src/cities/osm-coverage.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const citiesDir = join(root, 'public/data/cities');

test('houston + austin OSM building packs exist (run npm run buildings:fetch)', () => {
  for (const id of ['houston', 'austin']) assert.equal(existsSync(join(citiesDir, id, 'buildings.json')), true, id);
});

test('every OSM pack is v2 with real footprints and matches the coverage module', () => {
  for (const id of readdirSync(citiesDir)) {
    const f = join(citiesDir, id, 'buildings.json');
    if (!existsSync(f)) continue;
    const pack = JSON.parse(readFileSync(f, 'utf8'));
    assert.equal(pack.v, 2, id);
    assert.equal(pack.city, id);
    assert.ok(pack.count >= 200, `${id}: expected hundreds of buildings`);
    assert.equal(pack.count, pack.buildings.length);
    assert.match(pack.attribution, /OpenStreetMap/);
    assert.deepEqual(OSM_BUILDING_COVERAGE[id], pack.tiles, `${id}: osm-coverage.js out of date`);
    for (const b of pack.buildings.slice(0, 50)) {
      const [h, mh, , , name, ring] = b;
      assert.ok(h > mh && h < 850, `${id}: bad height ${h}`); /* Burj Khalifa is 828 m */
      assert.equal(typeof name, 'string');
      assert.ok(Array.isArray(ring) && ring.length >= 6 && ring.length % 2 === 0);
    }
  }
});
