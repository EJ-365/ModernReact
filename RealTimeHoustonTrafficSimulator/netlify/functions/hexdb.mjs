import { proxyRequest } from "./_proxy.mjs";

export async function handler(event) {
  return proxyRequest(event, {
    upstreamOrigin: "https://hexdb.io",
    stripPrefixes: ["/.netlify/functions/hexdb", "/api/hexdb"],
  });
}
