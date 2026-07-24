import test from 'node:test';
import assert from 'node:assert/strict';
import {
  boardCacheStorageKey,
  pickBoardCacheForApts,
  flattenBoardFlights,
  flightBoardTimeZone,
} from '../src/boards/cache-scope.js';

test('board cache keys are scoped per metro', () => {
  assert.equal(boardCacheStorageKey('dallas'), 'houstonSim.boardCache.v1.dallas');
  assert.equal(boardCacheStorageKey('Boston'), 'houstonSim.boardCache.v1.boston');
  assert.equal(boardCacheStorageKey(''), 'houstonSim.boardCache.v1.houston');
  assert.notEqual(boardCacheStorageKey('sanantonio'), boardCacheStorageKey('dallas'));
});

test('pickBoardCacheForApts drops foreign metro airports', () => {
  const cache = {
    SAT: { departures: [{ cs: 'AA100', dep: 'SAT', arr: 'DFW' }], arrivals: [], at: 1 },
    DFW: { departures: [{ cs: 'AA200', dep: 'DFW', arr: 'LAX' }], arrivals: [], at: 1 },
    IAH: { departures: [{ cs: 'UA300', dep: 'IAH', arr: 'ORD' }], arrivals: [], at: 1 },
  };
  const dallas = pickBoardCacheForApts(cache, ['DFW', 'DAL', 'ADS']);
  assert.deepEqual(Object.keys(dallas).sort(), ['DFW']);
  assert.equal(dallas.DFW.departures[0].cs, 'AA200');
  assert.equal(dallas.SAT, undefined);
  assert.equal(dallas.IAH, undefined);
});

test('flattenBoardFlights only includes active metro airports', () => {
  const boards = {
    SAT: {
      departures: [{ cs: 'AA111', dep: 'SAT', arr: 'DFW' }],
      arrivals: [{ cs: 'WN50', dep: 'DEN', arr: 'SAT' }],
    },
    DFW: {
      departures: [{ cs: 'AA222', dep: 'DFW', arr: 'ORD' }],
      arrivals: [],
    },
  };
  const flat = flattenBoardFlights(boards, ['DFW', 'DAL']);
  assert.equal(flat.length, 1);
  assert.equal(flat[0].cs, 'AA222');
});

test('cross-city SAT→DFW board row must not pollute Dallas flat board', () => {
  /* Concrete trigger: visit SAT, cache AA123 SAT→DFW, then launch Dallas.
     Without scoping, isHoustonFlight(AA123) is true for Dallas because arr=DFW,
     so the San Antonio board row would feed enrichment / panel fallback. */
  const polluted = {
    SAT: { departures: [{ cs: 'AA123', dep: 'SAT', arr: 'DFW', etd: '2026-07-24T16:00:00Z' }], arrivals: [], at: Date.now() },
    DFW: { departures: [{ cs: 'AA999', dep: 'DFW', arr: 'LGA' }], arrivals: [], at: Date.now() },
  };
  const scoped = pickBoardCacheForApts(polluted, ['DFW', 'DAL', 'ADS']);
  const flat = flattenBoardFlights(scoped, ['DFW', 'DAL', 'ADS']);
  assert.equal(flat.some((f) => f.cs === 'AA123'), false);
  assert.equal(flat.some((f) => f.cs === 'AA999'), true);
});

test('flightBoardTimeZone uses city feed timezone', () => {
  assert.equal(flightBoardTimeZone({ feeds: { timezone: 'America/New_York' } }), 'America/New_York');
  assert.equal(flightBoardTimeZone({ feeds: { timezone: 'America/Los_Angeles' } }), 'America/Los_Angeles');
  assert.equal(flightBoardTimeZone(null), 'America/Chicago');
});

test('Eastern board times are not formatted as Central', () => {
  const iso = '2026-07-24T18:00:00Z'; /* 14:00 EDT / 13:00 CDT */
  const eastern = new Date(iso).toLocaleTimeString('en-US', {
    timeZone: flightBoardTimeZone({ feeds: { timezone: 'America/New_York' } }),
    hour: 'numeric',
    minute: '2-digit',
  });
  const central = new Date(iso).toLocaleTimeString('en-US', {
    timeZone: 'America/Chicago',
    hour: 'numeric',
    minute: '2-digit',
  });
  assert.notEqual(eastern, central);
  assert.match(eastern, /2:00/);
});
