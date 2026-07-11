import { proxyRequest, sendVercel } from '../_proxy.mjs';

const CACHE = globalThis.__htsFaCache || (globalThis.__htsFaCache = new Map());
const TTL_MS = 5 * 60 * 1000;
const NEG_TTL_MS = 60 * 1000;
const COOLDOWN_429_MS = 10 * 60 * 1000;

function cacheKey(req) {
  const url = new URL(req.url, 'https://example.com');
  return `${url.pathname}|${url.search}`;
}

export default async function handler(req, res) {
  const key = process.env.FLIGHTAWARE_API_KEY || '';
  const ck = cacheKey(req);
  const now = Date.now();
  const hit = CACHE.get(ck);
  if (hit && now < hit.expires) {
    res.setHeader('content-type', hit.contentType || 'application/json');
    res.setHeader('cache-control', 'public, max-age=60');
    res.setHeader('access-control-allow-origin', '*');
    res.setHeader('x-hts-cache', 'HIT');
    return res.status(hit.statusCode).send(hit.body);
  }

  const result = await proxyRequest(req, {
    upstreamOrigin: 'https://aeroapi.flightaware.com',
    stripPrefixes: ['/api/flightaware', '/flightaware'],
    requireEnv: 'FLIGHTAWARE_API_KEY',
    injectHeaders: key ? { 'x-apikey': key } : {},
    defaultQuery: { max_pages: '1' },
  });

  if (result.statusCode === 204 || result.statusCode === 400 || result.statusCode === 405) {
    return sendVercel(res, result);
  }
  if (result.statusCode === 500 && /FLIGHTAWARE_API_KEY_missing/.test(result.body || '')) {
    return sendVercel(res, result);
  }

  let ttl = TTL_MS;
  if (result.statusCode === 429) ttl = COOLDOWN_429_MS;
  else if (result.statusCode >= 400) ttl = NEG_TTL_MS;

  CACHE.set(ck, {
    statusCode: result.statusCode,
    body: result.body,
    contentType: result.headers?.['content-type'] || 'application/json',
    expires: now + ttl,
  });
  if (CACHE.size > 80) {
    const first = CACHE.keys().next().value;
    if (first != null) CACHE.delete(first);
  }

  result.headers = {
    ...(result.headers || {}),
    'cache-control': result.statusCode === 200 ? 'public, max-age=120' : 'no-store',
    'x-hts-cache': 'MISS',
  };
  sendVercel(res, result);
}
