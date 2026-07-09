import { proxyRequest } from "./_proxy.mjs";

export async function handler(event) {
  return proxyRequest(event, {
    upstreamOrigin: "https://traffic.houstontranstar.org",
    stripPrefixes: ["/.netlify/functions/transtar", "/api/transtar"],
  });
}
