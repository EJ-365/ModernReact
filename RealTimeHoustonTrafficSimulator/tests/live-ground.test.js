import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { shouldProcessGroundTrack } from '../src/live-ground.js';

const appMainSource = readFileSync(new URL('../src/app-main.js', import.meta.url), 'utf8');

test('new parked ground traffic is excluded', () => {
  assert.equal(
    shouldProcessGroundTrack({ distanceMi: 1, groundSpeedKts: 0, wasTracked: false }),
    false,
  );
  assert.equal(
    shouldProcessGroundTrack({ distanceMi: 1, groundSpeedKts: null, wasTracked: false }),
    false,
  );
});

test('moving ground traffic near an airport can enter the scene', () => {
  assert.equal(
    shouldProcessGroundTrack({ distanceMi: 1, groundSpeedKts: 32, wasTracked: false }),
    true,
  );
  assert.equal(
    shouldProcessGroundTrack({ distanceMi: 5, groundSpeedKts: 32, wasTracked: false }),
    false,
  );
});

test('tracked aircraft retain their landing and parking updates', () => {
  assert.equal(
    shouldProcessGroundTrack({ distanceMi: 1, groundSpeedKts: 0, wasTracked: true }),
    true,
  );
  assert.equal(
    shouldProcessGroundTrack({ distanceMi: 1, groundSpeedKts: null, wasTracked: true }),
    true,
  );
});

test('ground updates with missing speed clear stale cruise state', () => {
  assert.match(
    appMainSource,
    /else if\(x\.onGround\)\{\s*\/\* Parked\/unknown ground speed:[\s\S]*?f\.kts=0;f\.gsKts=0;/,
  );
});
