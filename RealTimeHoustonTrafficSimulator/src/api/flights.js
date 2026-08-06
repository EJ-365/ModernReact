/** OpenSky ADS-B states in a Houston bounding box (free, rate-limited). */

const BBOX = { lamin: 28.7, lamax: 30.6, lomin: -96.6, lomax: -94.3 };

export async function fetchFlightsNearHouston() {
  const { lamin, lamax, lomin, lomax } = BBOX;
  const url = `/api/opensky/api/states/all?lamin=${lamin}&lomin=${lomin}&lamax=${lamax}&lomax=${lomax}`;
  const r = await fetch(url, { cache: "no-store" });
  if (!r.ok) throw new Error(`opensky ${r.status}`);
  const j = await r.json();
  if (!Array.isArray(j?.states)) return [];

  return j.states
    .map((s) => ({
      icao24: s[0],
      callsign: String(s[1] ?? "").trim(),
      country: s[2],
      lon: s[5],
      lat: s[6],
      altM: s[7],
      velocity: s[9],
      track: s[10],
      onGround: s[8],
    }))
    .filter((f) => Number.isFinite(f.lat) && Number.isFinite(f.lon) && !f.onGround);
}

/** Placeholder for paid traffic providers (HERE, TomTom, Google, TxDOT). */
export async function fetchLiveTrafficSegments() {
  // Wire to /api/traffic when TRAFFIC_API_KEY is configured server-side.
  return null;
}
