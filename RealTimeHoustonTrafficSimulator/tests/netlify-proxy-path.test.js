import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveIncomingPath, proxyRequest } from '../netlify/functions/_proxy.mjs';
import { handler as tomtomHandler } from '../netlify/functions/tomtom.mjs';

const TOMTOM_STRIP = ['/.netlify/functions/tomtom', '/api/tomtom'];
const FA_STRIP = ['/.netlify/functions/flightaware', '/api/flightaware', '/flightaware'];

test('resolveIncomingPath accepts TomTom traffic paths from /api/tomtom/*', () => {
  const path = resolveIncomingPath(
    {
      path: '/api/tomtom/traffic/services/5/incidentDetails',
      queryStringParameters: { bbox: '-97,30,-96,31' },
      headers: {},
    },
    TOMTOM_STRIP,
  );
  assert.equal(path, 'traffic/services/5/incidentDetails');
});

test('resolveIncomingPath accepts FlightAware aeroapi paths', () => {
  const path = resolveIncomingPath(
    {
      path: '/api/flightaware/aeroapi/flights/search',
      queryStringParameters: {},
      headers: {},
    },
    FA_STRIP,
  );
  assert.equal(path, 'aeroapi/flights/search');
});

test('resolveIncomingPath accepts query path for non-aeroapi upstreams', () => {
  const path = resolveIncomingPath(
    {
      path: '/.netlify/functions/tomtom',
      queryStringParameters: { path: 'traffic/services/4/flowSegmentData/absolute/10/json' },
      headers: {},
    },
    TOMTOM_STRIP,
  );
  assert.equal(path, 'traffic/services/4/flowSegmentData/absolute/10/json');
});

test('resolveIncomingPath rejects path traversal in query path', () => {
  const path = resolveIncomingPath(
    {
      path: '/.netlify/functions/tomtom',
      queryStringParameters: { path: '../secrets' },
      headers: {},
    },
    TOMTOM_STRIP,
  );
  assert.equal(path, '');
});

test('tomtom Netlify handler no longer returns missing_upstream_path for traffic routes', async () => {
  const prev = process.env.TOMTOM_API_KEY;
  process.env.TOMTOM_API_KEY = 'test-key';
  const originalFetch = globalThis.fetch;
  let upstreamUrl = '';
  globalThis.fetch = async (url) => {
    upstreamUrl = String(url);
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  };
  try {
    const res = await tomtomHandler({
      httpMethod: 'GET',
      path: '/api/tomtom/traffic/services/5/incidentDetails',
      headers: {},
      queryStringParameters: { bbox: '1,2,3,4' },
    });
    assert.equal(res.statusCode, 200);
    assert.match(upstreamUrl, /^https:\/\/api\.tomtom\.com\/traffic\/services\/5\/incidentDetails\?/);
    assert.match(upstreamUrl, /[?&]key=test-key/);
    assert.match(upstreamUrl, /[?&]bbox=1%2C2%2C3%2C4|[?&]bbox=1,2,3,4/);
  } finally {
    globalThis.fetch = originalFetch;
    if (prev == null) delete process.env.TOMTOM_API_KEY;
    else process.env.TOMTOM_API_KEY = prev;
  }
});

test('proxyRequest hint mentions tomtom and flightaware when path missing', async () => {
  const res = await proxyRequest(
    { httpMethod: 'GET', path: '/.netlify/functions/tomtom', headers: {}, queryStringParameters: {} },
    { upstreamOrigin: 'https://api.tomtom.com', stripPrefixes: TOMTOM_STRIP },
  );
  assert.equal(res.statusCode, 400);
  const body = JSON.parse(res.body);
  assert.equal(body.error, 'missing_upstream_path');
  assert.match(body.hint, /tomtom/i);
  assert.match(body.hint, /flightaware/i);
});
