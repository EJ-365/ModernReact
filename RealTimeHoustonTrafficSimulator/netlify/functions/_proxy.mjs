/** Shared proxy helper for Netlify Functions (Node 18+). */

function headersLower(event) {
  const out = {};
  const h = event.headers || {};
  for (const [k, v] of Object.entries(h)) out[String(k).toLowerCase()] = v;
  return out;
}

/** Collect query params from every place Netlify might put them. */
function collectQuery(event) {
  const params = new URLSearchParams();
  const qp = event.queryStringParameters;
  if (qp && typeof qp === "object") {
    for (const [k, v] of Object.entries(qp)) {
      if (v == null) continue;
      if (Array.isArray(v)) v.forEach((x) => params.append(k, String(x)));
      else params.set(k, String(v));
    }
  }
  const mvp = event.multiValueQueryStringParameters;
  if (mvp && typeof mvp === "object") {
    for (const [k, arr] of Object.entries(mvp)) {
      if (!Array.isArray(arr)) continue;
      for (const v of arr) {
        if (v == null) continue;
        if (!params.has(k)) params.set(k, String(v));
      }
    }
  }
  /* rawUrl / rawQuery often survive when queryStringParameters does not */
  const rawBits = [event.rawQuery, event.rawQueryString];
  if (event.rawUrl) {
    try {
      const u = new URL(event.rawUrl, "https://example.com");
      rawBits.push(u.search.replace(/^\?/, ""));
    } catch (_) {}
  }
  const hdrs = headersLower(event);
  if (hdrs["x-forwarded-uri"]) {
    try {
      const u = new URL(hdrs["x-forwarded-uri"], "https://example.com");
      rawBits.push(u.search.replace(/^\?/, ""));
    } catch (_) {}
  }
  for (const bit of rawBits) {
    if (!bit) continue;
    try {
      const extra = new URLSearchParams(String(bit));
      for (const [k, v] of extra.entries()) {
        if (!params.has(k)) params.set(k, v);
      }
    } catch (_) {}
  }
  return params;
}

function buildQuery(event, { omitKeys = ["path"] } = {}) {
  const params = collectQuery(event);
  for (const k of omitKeys) params.delete(k);
  return params.toString();
}

function stripPath(path, stripPrefixes) {
  let p = path || "/";
  try {
    if (/^https?:\/\//i.test(p)) p = new URL(p).pathname;
  } catch (_) {}
  /* Drop query/hash if somehow present */
  p = p.split("?")[0].split("#")[0];
  for (const prefix of stripPrefixes) {
    if (p === prefix || p.startsWith(prefix + "/")) {
      p = p.slice(prefix.length);
      break;
    }
  }
  return p.replace(/^\/+/, "");
}

function looksLikeAeroPath(p) {
  if (!p) return false;
  const s = String(p).replace(/^\/+/, "");
  return s.startsWith("aeroapi/") || s === "aeroapi";
}

function resolveIncomingPath(event, stripPrefixes) {
  const params = collectQuery(event);
  const fromQ = params.get("path") || params.get("p");
  if (fromQ && looksLikeAeroPath(fromQ)) {
    return String(fromQ).replace(/^\/+/, "");
  }

  const hdrs = headersLower(event);
  const candidates = [
    event.path,
    event.rawPath,
    hdrs["x-forwarded-path"],
    hdrs["x-original-url"],
    hdrs["x-forwarded-uri"],
    event.rawUrl,
  ].filter(Boolean);

  for (const c of candidates) {
    let raw = String(c);
    try {
      if (/^https?:\/\//i.test(raw) || raw.startsWith("/")) {
        raw = new URL(raw, "https://example.com").pathname;
      }
    } catch (_) {}
    const stripped = stripPath(raw, stripPrefixes);
    if (looksLikeAeroPath(stripped)) return stripped;
    /* Direct function invoke: /.netlify/functions/flightaware/aeroapi/... */
    if (stripped.startsWith("flightaware/")) {
      const rest = stripped.slice("flightaware/".length);
      if (looksLikeAeroPath(rest)) return rest;
    }
  }
  return "";
}

export async function proxyRequest(event, {
  upstreamOrigin,
  stripPrefixes = [],
  injectHeaders = {},
  requireEnv,
  defaultQuery = {},
}) {
  const headersOut = {
    "content-type": "application/json",
    "cache-control": "no-store",
    "access-control-allow-origin": "*",
  };

  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: {
        ...headersOut,
        "access-control-allow-methods": "GET,OPTIONS",
        "access-control-allow-headers": "Content-Type, Accept",
      },
      body: "",
    };
  }

  if (event.httpMethod !== "GET" && event.httpMethod !== "HEAD") {
    return { statusCode: 405, headers: headersOut, body: JSON.stringify({ error: "method_not_allowed" }) };
  }

  if (requireEnv && !process.env[requireEnv]) {
    return {
      statusCode: 500,
      headers: headersOut,
      body: JSON.stringify({
        error: `${requireEnv}_missing`,
        hint: `Set ${requireEnv} in Netlify Site settings → Environment variables, then redeploy.`,
      }),
    };
  }

  const path = resolveIncomingPath(event, stripPrefixes);
  if (!path) {
    return {
      statusCode: 400,
      headers: headersOut,
      body: JSON.stringify({
        error: "missing_upstream_path",
        hint: "Use /api/flightaware/aeroapi/... or /api/flightaware?path=aeroapi/...",
        debug: {
          path: event.path || null,
          rawUrl: event.rawUrl || null,
          query: event.queryStringParameters || null,
        },
      }),
    };
  }

  const qsParams = new URLSearchParams(buildQuery(event));
  for (const [k, v] of Object.entries(defaultQuery || {})) {
    if (!qsParams.has(k)) qsParams.set(k, String(v));
  }
  const qs = qsParams.toString();
  const target = `${upstreamOrigin.replace(/\/$/, "")}/${path}${qs ? `?${qs}` : ""}`;

  try {
    const upstream = await fetch(target, {
      method: "GET",
      headers: {
        accept: event.headers?.accept || event.headers?.Accept || "application/json,*/*",
        "user-agent": "HoustonTrafficSimulator/1.0 (Netlify)",
        ...injectHeaders,
      },
    });
    const text = await upstream.text();
    const ct = upstream.headers.get("content-type") || "application/json";
    return {
      statusCode: upstream.status,
      headers: { ...headersOut, "content-type": ct },
      body: text,
    };
  } catch (e) {
    return {
      statusCode: 502,
      headers: headersOut,
      body: JSON.stringify({ error: "proxy_failed", detail: String(e && e.message ? e.message : e) }),
    };
  }
}
