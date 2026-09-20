import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const appMainSource = readFileSync(new URL('../src/app-main.js', import.meta.url), 'utf8');

/** Mirrors liveFlightEligible ground-cull rules after the AUS freeze fix. */
function keepLiveGroundTrack({ onGround, gsNow, estGs, posMoved, altFt }) {
  if (!onGround) return true;
  const taxiGs = Math.max(gsNow || 0, (posMoved && estGs) || 0);
  if (taxiGs < 25 && (altFt == null || altFt < 400)) return false;
  return true;
}

function flyGsWhileGround({ onGround, gs, estGs, posMoved, lastGoodGs }) {
  if (!onGround) return lastGoodGs || gs || 0;
  if (gs >= 8 && gs < 90) return gs;
  if (posMoved && estGs >= 8 && estGs < 90) return estGs;
  return 0; /* never coast on cruise lastGoodGs */
}

test('parked gate jets with stale cruise GS are culled', () => {
  assert.equal(
    keepLiveGroundTrack({ onGround: true, gsNow: 0, estGs: 0, posMoved: false, altFt: 50 }),
    false,
  );
  /* Stale cruise cache must NOT count — eligibility uses current/taxi GS only */
  assert.equal(
    keepLiveGroundTrack({ onGround: true, gsNow: 0, estGs: 180, posMoved: false, altFt: 50 }),
    false,
  );
});

test('active taxi near the field stays eligible', () => {
  assert.equal(
    keepLiveGroundTrack({ onGround: true, gsNow: 32, estGs: 0, posMoved: false, altFt: 40 }),
    true,
  );
  assert.equal(
    keepLiveGroundTrack({ onGround: true, gsNow: 0, estGs: 32, posMoved: true, altFt: 40 }),
    true,
  );
});

test('ground update never coasts at last cruise groundspeed', () => {
  assert.equal(
    flyGsWhileGround({ onGround: true, gs: 0, estGs: 0, posMoved: false, lastGoodGs: 280 }),
    0,
  );
  assert.equal(
    flyGsWhileGround({ onGround: true, gs: 28, estGs: 0, posMoved: false, lastGoodGs: 280 }),
    28,
  );
  assert.equal(
    flyGsWhileGround({ onGround: true, gs: 0, estGs: 28, posMoved: true, lastGoodGs: 0 }),
    28,
  );
});

test('runtime ground motion reads the movement flag written by feed refresh', () => {
  assert.match(appMainSource, /f\._fixMoved=!!posMoved/);
  assert.match(appMainSource, /f\._fixMoved&&f\._estGs/);
  assert.doesNotMatch(appMainSource, /f\._posMoved/);
});
