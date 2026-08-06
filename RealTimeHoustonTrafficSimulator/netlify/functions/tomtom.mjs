/**
 * TomTom Traffic API proxy — HARD DISABLED to stop billing.
 * Traffic uses free Houston TranStar RSS + modeled flow only.
 */
export async function handler() {
  return {
    statusCode: 503,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
      "access-control-allow-origin": "*",
    },
    body: JSON.stringify({
      error: "tomtom_disabled",
      hint: "TomTom is turned off. Free TranStar / modeled traffic only.",
    }),
  };
}
