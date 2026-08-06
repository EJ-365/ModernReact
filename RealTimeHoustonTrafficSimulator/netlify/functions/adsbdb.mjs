import { proxyRequest } from "./_proxy.mjs";

export async function handler(event) {
  return proxyRequest(event, {
    upstreamOrigin: "https://api.adsbdb.com",
    stripPrefixes: ["/.netlify/functions/adsbdb", "/api/adsbdb"],
  });
}
