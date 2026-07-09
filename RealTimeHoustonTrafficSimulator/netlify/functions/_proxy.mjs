/** Shared proxy helper for Netlify Functions (Node 18+). */

function buildQuery(event) {
  if (event.rawQuery) return event.rawQuery;
  if (event.rawQueryString) return event.rawQueryString;
  const q = event.queryStringParameters;
  if (!q || typeof q !== "object") return "";
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(q)) {
    if (v == null) continue;
    if (Array.isArray(v)) v.forEach((x) => params.append(k, x));
    else params.set(k, String(v));
  }
  return params.toString();
}

function stripPath(path, stripPrefixes) {
  let p = path || "/";
  try {
    if (/^https?:\/\//i.test(p)) p = new URL(p).pathname;
  } catch (_) {}
  for (const prefix of stripPrefixes) {
    if (p === prefix || p.startsWith(prefix + "/")) {
      p = p.slice(prefix.length);
      break;
    }
  }
  return p.replace(/^\/+/, "");
}

/** Prefer original browser path (Netlify rewrite keeps event.path as the public URL). */
function resolveIncomingPath(event, stripPrefixes) {
  const candidates = [
    event.path,
    event.rawPath,
    event.headers && (event.headers["x-forwarded-path"] || event.headers["X-Forwarded-Path"]),
    event.headers && (event.headers["x-original-url"] || event.headers["X-Original-Url"]),
    event.rawUrl,
  ].filter(Boolean);

  for (const c of candidates) {
    const stripped = stripPath(String(c), stripPrefixes);
    if (stripped) return stripped;
  }
  return "";
}

export async function proxyRequest(event, {
  upstreamOrigin,
  stripPrefixes = [],
  injectHeaders = {},
  requireEnv,
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
        hint: "Request must look like /api/flightaware/aeroapi/...",
        debug: { path: event.path, rawUrl: event.rawUrl || null },
      }),
    };
  }

  const qs = buildQuery(event);
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
