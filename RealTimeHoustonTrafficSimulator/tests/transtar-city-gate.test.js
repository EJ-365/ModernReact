import test from 'node:test';
import assert from 'node:assert/strict';
import { applyTranStarTravelTimes } from '../src/feeds/transtar-apply.js';
import { mapTranStarRoadId } from '../src/feeds/transtar-map.js';
import { transtarAdapter } from '../src/feeds/transtar.js';
import { CITY_PACKS } from '../src/cities/registry.js';
import { SANANTONIO_ROAD_LATLNG } from '../src/cities/sanantonio/pack.js';
import { DALLAS_ROAD_LATLNG } from '../src/cities/dallas/pack.js';

/** Minimal road stub matching applyTranStarTravelTimes expectations. */
function stubRoad(id, ff = 65) {
  return { def: { id, ff, arterial: false, surface: false }, s: { total: 8000 } };
}

test('Houston TranStar titles map onto shared freeway ids used by other metros', () => {
  assert.equal(mapTranStarRoadId('IH-10 Katy Freeway Westbound'), 'i10');
  assert.equal(mapTranStarRoadId('IH-45 Gulf Freeway Southbound'), 'i45');
  assert.ok(SANANTONIO_ROAD_LATLNG.some((r) => r.id === 'i10'));
  assert.ok(DALLAS_ROAD_LATLNG.some((r) => r.id === 'i45'));
});

test('applying Houston travel times without a city gate poisons San Antonio i10', () => {
  const roads = new Map(
    SANANTONIO_ROAD_LATLNG.filter((r) => r.id === 'i10').map((r) => [r.id, stubRoad(r.id, r.ff)]),
  );
  const flows = new Map();
  const n = applyTranStarTravelTimes(
    [
      {
        title: 'IH-10 Katy Freeway Westbound at Beltway 8',
        desc: 'Travel Time: 28 minutes',
      },
    ],
    {
      findRoadByKey: (id) => roads.get(id) || null,
      flows,
    },
  );
  assert.ok(n > 0, 'Houston I-10 sample must match San Antonio road id i10');
  assert.ok(
    [...flows.keys()].some((k) => k.startsWith('i10_')),
    'shared id bleed writes LIVE_TRAFFIC.flows for San Antonio i10',
  );
});

test('transtar adapter rejects every non-Houston pack city', () => {
  for (const city of Object.values(CITY_PACKS)) {
    if (city.id === 'houston') {
      assert.equal(transtarAdapter.supports(city), true);
    } else {
      assert.equal(
        transtarAdapter.supports(city),
        false,
        `${city.id} must not use Houston TranStar`,
      );
    }
  }
});
