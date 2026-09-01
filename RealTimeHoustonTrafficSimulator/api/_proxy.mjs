/** Shared proxy helper for Vercel serverless (Node 18+). */

function collectQuery(req) {
  const params = new URLSearchParams();
  const url = new URL(req.url, 'https://example.com');
  for (const [k, v] of url.searchParams.entries()) {
    if (v != null) params.set(k, v);
  }
  return params;
}

function stripPath(path, stripPrefixes) {
  let p = path || '/';
  try {
    if (/^https?:\/\//i.test(p)) p = new URL(p).pathname;
  } catch (_) {}
  p = p.split('?')[0].split('#')[0];
  for (const prefix of stripPrefixes) {
    if (p === prefix || p.startsWith(prefix + '/')) {
      p = p.slice(prefix.length);
      break;
    }
  }
  return p.replace(/^\/+/, '');
}

function resolveIncomingPath(req, stripPrefixes) {
  const url = new URL(req.url, 'https://example.com');
  const fromQ = url.searchParams.get('path') || url.searchParams.get('p');
  if (fromQ) return String(fromQ).replace(/^\/+/, '');

  const pathParam = req.query?.path;
  if (Array.isArray(pathParam) && pathParam.length) {
    return pathParam.join('/');
  }
  if (typeof pathParam === 'string' && pathParam) {
    return pathParam.replace(/^\/+/, '');
  }

  return stripPath(url.pathname, stripPrefixes);
}

export async function proxyRequest(req, {
  upstreamOrigin,
  stripPrefixes = [],
  injectHeaders = {},
  requireEnv,
  defaultQuery = {},
  injectQuery = {},
}) {
  const headersOut = {
    'content-type': 'application/json',
    'cache-control': 'no-store',
    'access-control-allow-origin': '*',
  };

  if (req.method === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        ...headersOut,
        'access-control-allow-methods': 'GET,OPTIONS',
        'access-control-allow-headers': 'Content-Type, Accept',
      },
      body: '',
    };
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return { statusCode: 405, headers: headersOut, body: JSON.stringify({ error: 'method_not_allowed' }) };
  }

  if (requireEnv && !process.env[requireEnv]) {
    return {
      statusCode: 500,
      headers: headersOut,
      body: JSON.stringify({
        error: `${requireEnv}_missing`,
        hint: `Set ${requireEnv} in Vercel project Environment Variables, then redeploy.`,
      }),
    };
  }

  const path = resolveIncomingPath(req, stripPrefixes);
  if (!path) {
    return {
      statusCode: 400,
      headers: headersOut,
      body: JSON.stringify({
        error: 'missing_upstream_path',
        hint: 'Use /api/tomtom/traffic/... or /api/airplanes/... (airplanes.live)',
      }),
    };
  }

  const qsParams = collectQuery(req);
  qsParams.delete('path');
  qsParams.delete('p');
  for (const [k, v] of Object.entries(defaultQuery || {})) {
    if (!qsParams.has(k)) qsParams.set(k, String(v));
  }
  for (const [k, v] of Object.entries(injectQuery || {})) {
    if (!qsParams.has(k) && v != null) qsParams.set(k, String(v));
  }
  const qs = qsParams.toString();
  const target = `${upstreamOrigin.replace(/\/$/, '')}/${path}${qs ? `?${qs}` : ''}`;

  try {
    const upstream = await fetch(target, {
      method: 'GET',
      headers: {
        accept: 'application/json,*/*',
        'user-agent': 'HoustonTrafficSimulator/1.0 (Vercel)',
        ...injectHeaders,
      },
    });
    const text = await upstream.text();
    const ct = upstream.headers.get('content-type') || 'application/json';
    return {
      statusCode: upstream.status,
      headers: { ...headersOut, 'content-type': ct },
      body: text,
    };
  } catch (e) {
    return {
      statusCode: 502,
      headers: headersOut,
      body: JSON.stringify({ error: 'proxy_failed', detail: String(e?.message || e) }),
    };
  }
}

export function sendVercel(res, result) {
  for (const [k, v] of Object.entries(result.headers || {})) {
    res.setHeader(k, v);
  }
  res.status(result.statusCode).send(result.body);
}
