import test from 'node:test';
import assert from 'node:assert/strict';
import {
  mapTranStarRoadId,
  mapTranStarDirSignHeuristic,
  parseTravelMinutes,
  TRANSTAR_ROAD_MAP,
} from '../src/feeds/transtar-map.js';
import { transtarAdapter } from '../src/feeds/transtar.js';
import { houstonManifest } from '../src/cities/houston/manifest.js';

test('TranStar road title mapping', () => {
  assert.equal(mapTranStarRoadId('I-10 Katy Freeway Eastbound'), 'i10');
  assert.equal(mapTranStarRoadId('IH-69 Southwest Freeway Northbound'), 'us59');
  assert.equal(mapTranStarRoadId('IH-45 North Southbound from SH-242 to Downtown'), 'i45');
  assert.equal(mapTranStarRoadId('US-290 Northwest Freeway'), 'us290');
  assert.equal(mapTranStarRoadId('Beltway 8 Westbound'), 'bw8');
  assert.equal(mapTranStarRoadId('totally unknown road'), null);
  /* First-match: titles that name SH-99 before the freeway id hit tx99 (legacy order). */
  assert.equal(
    mapTranStarRoadId('SH-99 Grand Parkway near IH-10 Katy'),
    'tx99',
  );
  assert.ok(TRANSTAR_ROAD_MAP.length >= 15);
});

test('TranStar travel minutes parse', () => {
  assert.equal(parseTravelMinutes('Travel Time: 28 min'), 28);
  assert.equal(parseTravelMinutes('About 41 minutes with traffic'), 41);
  assert.equal(parseTravelMinutes('no times here'), null);
});

test('TranStar direction heuristic', () => {
  assert.equal(mapTranStarDirSignHeuristic('IH-10 Katy Eastbound …', 'i10'), 1);
  assert.equal(mapTranStarDirSignHeuristic('IH-10 Katy Westbound …', 'i10'), -1);
  assert.equal(mapTranStarDirSignHeuristic('US-290 Northwest Eastbound …', 'us290'), -1);
});

test('adapter exposes mapping API', () => {
  assert.equal(transtarAdapter.supports(houstonManifest), true);
  assert.equal(typeof transtarAdapter.mapRoadId, 'function');
  assert.equal(transtarAdapter.mapRoadId('I-45 Gulf Freeway'), 'i45');
});
