import test from 'node:test';
import assert from 'node:assert/strict';
import {
  sanitizeLiveMph,
  applyTranStarTravelTimes,
  applyTranStarSpeedJson,
} from '../src/feeds/transtar-apply.js';

function fakeRoad(id, ff = 65, total = 210 * 20) {
  return {
    def: { id, ff },
    s: { total },
  };
}

test('sanitizeLiveMph clamps freeway and arterial', () => {
  const fwy = fakeRoad('i10', 65);
  assert.equal(sanitizeLiveMph(120, 65, fwy), Math.min(65 * 1.05, 78));
  assert.equal(sanitizeLiveMph(3, 65, fwy), 8);
  const art = fakeRoad('main', 40);
  art.def.arterial = true;
  assert.ok(sanitizeLiveMph(80, 40, art) <= 52);
});

test('applyTranStarTravelTimes writes median flow', () => {
  const flows = new Map();
  const road = fakeRoad('i45', 60, 210 * 30);
  const got = applyTranStarTravelTimes(
    [
      {
        title: 'IH-45 North Southbound from SH-242 to Downtown',
        desc: 'Travel Time: 40 min',
      },
      {
        title: 'IH-45 North Southbound from SH-242 to Downtown',
        desc: 'Travel Time: 50 min',
      },
    ],
    {
      findRoadByKey: (id) => (id === 'i45' ? road : null),
      nearestArc: () => 0,
      unitsPerMile: 210,
      flows,
      mapDirSign: () => 1,
    },
  );
  assert.equal(got, 1);
  const sample = flows.get('i45_1');
  assert.ok(sample);
  assert.equal(sample.src, 'transtar');
  assert.ok(sample.cur >= 8 && sample.cur <= 78);
  assert.ok(sample.cong >= 0 && sample.cong <= 1);
});

test('applyTranStarSpeedJson uses ff before sanitize', () => {
  const flows = new Map();
  const road = fakeRoad('i10', 65);
  const got = applyTranStarSpeedJson(
    [{ RoadwayName: 'I-10 Katy Freeway', Direction: 'Eastbound', AverageSpeed: 48, FreeFlowSpeed: 65 }],
    {
      findRoadByKey: (id) => (id === 'i10' ? road : null),
      flows,
      mapDirSign: () => 1,
    },
  );
  assert.equal(got, 1);
  const sample = [...flows.values()][0];
  assert.equal(sample.cur, 48);
  assert.equal(sample.src, 'transtar-json');
});
