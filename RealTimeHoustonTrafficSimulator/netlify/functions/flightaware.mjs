import { proxyRequest } from "./_proxy.mjs";

/** Simple in-memory cache shared across warm function instances. */
const CACHE = globalThis.__htsFaCache || (globalThis.__htsFaCache = new Map());
const TTL_MS = 5 * 60 * 1000; // 5 minutes — boards don't need second-level freshness
const NEG_TTL_MS = 60 * 1000; // short cache for errors (except 429, longer)
const COOLDOWN_429_MS = 10 * 60 * 1000;

function cacheKey(event) {
  const qp = event.queryStringParameters || {};
  const path = qp.path || event.path || "";
  const qs = event.rawQuery || event.rawQueryString || "";
  return String(path) + "?" + String(qs);
}

export async function handler(event) {
  const key = process.env.FLIGHTAWARE_API_KEY || "";
  const ck = cacheKey(event);
  const now = Date.now();
  const hit = CACHE.get(ck);
  if (hit && now < hit.expires) {
    return {
      statusCode: hit.statusCode,
      headers: {
        "content-type": hit.contentType || "application/json",
        "cache-control": "public, max-age=60",
        "access-control-allow-origin": "*",
        "x-hts-cache": "HIT",
      },
      body: hit.body,
    };
  }

  const result = await proxyRequest(event, {
    upstreamOrigin: "https://aeroapi.flightaware.com",
    stripPrefixes: ["/.netlify/functions/flightaware", "/api/flightaware"],
    requireEnv: "FLIGHTAWARE_API_KEY",
    injectHeaders: key ? { "x-apikey": key } : {},
  });

  /* Don't cache OPTIONS / missing-key / bad path */
  if (result.statusCode === 204 || result.statusCode === 400 || result.statusCode === 405) {
    return result;
  }
  if (result.statusCode === 500 && /FLIGHTAWARE_API_KEY_missing/.test(result.body || "")) {
    return result;
  }

  let ttl = TTL_MS;
  if (result.statusCode === 429) ttl = COOLDOWN_429_MS;
  else if (result.statusCode >= 400) ttl = NEG_TTL_MS;
  else if (result.statusCode >= 200 && result.statusCode < 300) ttl = TTL_MS;

  CACHE.set(ck, {
    statusCode: result.statusCode,
    body: result.body,
    contentType: (result.headers && result.headers["content-type"]) || "application/json",
    expires: now + ttl,
  });

  /* Cap map size */
  if (CACHE.size > 80) {
    const first = CACHE.keys().next().value;
    if (first != null) CACHE.delete(first);
  }

  return {
    ...result,
    headers: {
      ...(result.headers || {}),
      "cache-control": result.statusCode === 200 ? "public, max-age=120" : "no-store",
      "x-hts-cache": "MISS",
    },
  };
}
