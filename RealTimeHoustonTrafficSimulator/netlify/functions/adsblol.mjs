import { proxyRequest } from "./_proxy.mjs";

export async function handler(event) {
  return proxyRequest(event, {
    upstreamOrigin: "https://api.adsb.lol",
    stripPrefixes: ["/.netlify/functions/adsblol", "/api/adsblol"],
  });
}
