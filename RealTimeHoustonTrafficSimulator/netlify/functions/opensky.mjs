import { proxyRequest } from "./_proxy.mjs";

export async function handler(event) {
  return proxyRequest(event, {
    upstreamOrigin: "https://opensky-network.org",
    stripPrefixes: ["/.netlify/functions/opensky", "/api/opensky"],
  });
}
