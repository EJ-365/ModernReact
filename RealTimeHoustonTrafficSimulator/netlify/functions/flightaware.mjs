/**
 * FlightAware AeroAPI proxy — HARD DISABLED to stop billing.
 * Live sky uses free OpenSky / ADS-B / adsb.lol / airplanes.live only.
 * Re-enable only intentionally (and with a key + spend limit).
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
      error: "flightaware_disabled",
      hint: "FlightAware AeroAPI is turned off. Free open-source flight feeds only.",
    }),
  };
}
