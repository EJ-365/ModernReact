import { proxyRequest } from "./_proxy.mjs";

export async function handler(event) {
  const key = process.env.FLIGHTAWARE_API_KEY || "";
  return proxyRequest(event, {
    upstreamOrigin: "https://aeroapi.flightaware.com",
    stripPrefixes: ["/.netlify/functions/flightaware", "/api/flightaware"],
    requireEnv: "FLIGHTAWARE_API_KEY",
    injectHeaders: key ? { "x-apikey": key } : {},
  });
}
