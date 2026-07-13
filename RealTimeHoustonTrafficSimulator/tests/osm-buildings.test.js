/**
 * OSM CBD buildings pack smoke — shape only (no Overpass).
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const austinPath = join(root, 'public/data/cities/austin/buildings-cbd.json');

test('austin OSM CBD buildings pack exists and has footprints', () => {
  assert.equal(existsSync(austinPath), true, 'run npm run buildings:fetch');
  const pack = JSON.parse(readFileSync(austinPath, 'utf8'));
  assert.equal(pack.city, 'austin');
  assert.ok(pack.count >= 40, 'expected dozens of CBD buildings');
  assert.ok(Array.isArray(pack.buildings));
  const b = pack.buildings[0];
  assert.ok(b.ring && b.ring.length >= 4);
  assert.ok(Number(b.h) > 0);
  assert.equal(b.ring[0].length, 2);
});
