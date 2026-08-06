import test from 'node:test';
import assert from 'node:assert/strict';
import {
  corridorPanelKey,
  indexTranStarCorridorTimes,
} from '../src/feeds/transtar-corridor-index.js';

test('corridorPanelKey is stable', () => {
  assert.equal(
    corridorPanelKey({ road: 'us59', ax: 1, az: 2, bx: 3, bz: 4 }, 1),
    'us59|1,2|3,4|1',
  );
});

test('indexTranStarCorridorTimes matches exact downtown titles + pad', () => {
  const store = new Map();
  const sugar = {
    road: 'us59',
    label: 'US-59 · Sugar Land',
    ax: -2900,
    az: 2000,
    bx: 260,
    bz: 60,
    toDt: true,
    typMin: 30,
    minMin: 22,
    maxMin: 80,
    realMi: 22,
    tsPadMin: 8,
    tsIn: /IH-69\s+Southwest\s+Northbound\s+from\s+Beltway\s+8-West\s+to\s+Downtown/i,
    tsOut: /IH-69\s+Southwest\s+Southbound\s+from\s+Downtown\s+to\s+Beltway\s+8-West/i,
  };
  const got = indexTranStarCorridorTimes(
    [
      {
        title: 'IH-69 Southwest Northbound from Beltway 8-West to Downtown',
        desc: 'Travel Time: 20 min',
      },
    ],
    {
      corridors: [sugar],
      travelSign: () => 1,
      corridorTimes: store,
    },
  );
  assert.ok(got >= 1);
  const entry = [...store.values()][0];
  assert.ok(entry);
  assert.equal(entry.src, 'transtar');
  /* 20 + pad 8 = 28, clamped by minMin/physics ≥ 22 */
  assert.ok(entry.mins >= 22);
  assert.equal(entry.pad, 8);
});
