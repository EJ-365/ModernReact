import { proxyRequest } from "./_proxy.mjs";

export async function handler(event) {
  const key = process.env.TOMTOM_API_KEY || "";
  if (!key) {
    return {
      statusCode: 500,
      headers: { "content-type": "application/json", "access-control-allow-origin": "*" },
      body: JSON.stringify({
        error: "TOMTOM_API_KEY_missing",
        hint: "Set TOMTOM_API_KEY in Netlify env vars (optional).",
      }),
    };
  }
  const q = { ...(event.queryStringParameters || {}) };
  if (!q.key) q.key = key;
  const event2 = {
    ...event,
    queryStringParameters: q,
    rawQuery: undefined,
    rawQueryString: undefined,
  };
  return proxyRequest(event2, {
    upstreamOrigin: "https://api.tomtom.com",
    stripPrefixes: ["/.netlify/functions/tomtom", "/api/tomtom"],
  });
}
