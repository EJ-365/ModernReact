import test from 'node:test';
import assert from 'node:assert/strict';
import { mergeNwsFeatures, nwsAreaCodes } from '../src/feeds/nws.js';
import { BOSTON_NWS } from '../src/cities/boston/pack.js';
import { LOSANGELES_NWS } from '../src/cities/losangeles/pack.js';
import { NEWYORK_NWS } from '../src/cities/newyork/pack.js';

test('NWS state queries follow each non-Texas city pack', () => {
  assert.deepEqual(nwsAreaCodes({ nws: BOSTON_NWS }), ['MA']);
  assert.deepEqual(nwsAreaCodes({ nws: LOSANGELES_NWS }), ['CA']);
  assert.deepEqual(nwsAreaCodes({ nws: NEWYORK_NWS }), ['NY', 'NJ']);
  assert.deepEqual(nwsAreaCodes(null), ['TX']);
});

test('multi-state NWS responses are combined without duplicate alerts', () => {
  const shared = { id: 'shared-alert', properties: { event: 'Flood Warning' } };
  const nyOnly = { id: 'ny-alert', properties: { event: 'Heat Advisory' } };
  assert.deepEqual(
    mergeNwsFeatures([
      { features: [shared, nyOnly] },
      { features: [shared] },
    ]),
    [shared, nyOnly],
  );
});
