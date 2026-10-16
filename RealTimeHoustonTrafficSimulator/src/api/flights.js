/**
 * Houston ADS-B multi-source flight feed.
 * Priority: adsb.lol (open, community, fast) → airplanes.live → opensky (rate-limited).
 * All sources return the same normalized shape that app-main expects.
 *
 * Houston bbox: lat 28.7–30.6, lon -96.6 to -94.3 (covers IAH, HOU, EFD, The Woodlands, Galveston Bay)
 */

const BBOX = { lamin: 28.7, lamax: 30.6, lomin: -96.6, lomax: -94.3 };

// Preferred source tracks across polls — avoids source-switching churn
let _preferred = 'adsblol';
let _lastOk = 0;

/** Normalize an adsb.lol / airplanes.live aircraft entry → standard HTS flight object */
function normAdsbLol(ac) {
  const onGround = ac.alt_baro === 'ground' || ac.on_ground === true || ac.gnd === true;
  const altBaro = (typeof ac.alt_baro === 'number') ? ac.alt_baro : null;
  const altGeom = (typeof ac.alt_geom === 'number') ? ac.alt_geom : null;
  return {
    icao24:   String(ac.hex || ac.icao24 || '').toLowerCase().trim(),
    callsign: String(ac.flight || ac.cs || ac.callsign || '').trim(),
    country:  ac.country || '',
    lon:      ac.lon ?? ac.lng,
    lat:      ac.lat,
    /* Convert barometric alt (ft) → metres; prefer baro over geometric */
    altM:     altBaro != null ? altBaro * 0.3048 : (altGeom != null ? altGeom * 0.3048 : null),
    /* Ground speed knots → m/s */
    velocity: ac.gs != null ? ac.gs * 0.514444 : (ac.spd != null ? ac.spd * 0.514444 : null),
    track:    ac.track ?? ac.hdg,
    onGround,
    /* Extra fields app-main uses for enrichment */
    vsFpm:    ac.baro_rate ?? ac.vsi ?? null,
    category: ac.category ?? null,
    squawk:   ac.squawk ?? null,
    actype:   ac.t ?? ac.type ?? null,
    reg:      ac.r ?? ac.reg ?? null,
    _src:     'adsbLol',
  };
}

/** Normalize an OpenSky Network state vector (array of 17 elements) */
function normOpenSky(s) {
  return {
    icao24:   String(s[0] || '').toLowerCase().trim(),
    callsign: String(s[1] || '').trim(),
    country:  s[2],
    lon:      s[5],
    lat:      s[6],
    altM:     s[7],
    velocity: s[9],
    track:    s[10],
    onGround: !!s[8],
    vsFpm:    s[11] != null ? s[11] * 196.85 : null,  // m/s → ft/min
    category: null,
    squawk:   s[14] || null,
    actype:   null,
    reg:      null,
    _src:     'opensky',
  };
}

/** adsb.lol — 80 nmi radius around Houston IAH centroid */
async function _fetchAdsbLol() {
  // 80 nmi ≈ 148 km covers all Houston area airports (IAH, HOU, EFD, SGR, DWH, IWS, CXO)
  const url = '/api/adsblol/v2/lat/29.98/lon/-95.34/dist/80';
  const r = await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(7000) });
  if (!r.ok) throw new Error(`adsb.lol HTTP ${r.status}`);
  const j = await r.json();
  const ac = j.ac ?? j.aircraft ?? (Array.isArray(j) ? j : null);
  if (!Array.isArray(ac)) throw new Error('adsb.lol: no ac array in response');
  return ac
    .map(normAdsbLol)
    .filter(f => Number.isFinite(f.lat) && Number.isFinite(f.lon) && !f.onGround);
}

/** airplanes.live — alternative open community source */
async function _fetchAirplanesLive() {
  const url = '/api/airplanes/v2/lat/29.98/lon/-95.34/dist/80';
  const r = await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(7000) });
  if (!r.ok) throw new Error(`airplanes.live HTTP ${r.status}`);
  const j = await r.json();
  const ac = j.ac ?? j.aircraft ?? (Array.isArray(j) ? j : null);
  if (!Array.isArray(ac)) throw new Error('airplanes.live: no ac array');
  return ac
    .map(normAdsbLol)
    .filter(f => Number.isFinite(f.lat) && Number.isFinite(f.lon) && !f.onGround);
}

/** OpenSky Network — free but rate-limited (1 req/10s unauthenticated) */
async function _fetchOpenSky() {
  const { lamin, lamax, lomin, lomax } = BBOX;
  const url = `/api/opensky/api/states/all?lamin=${lamin}&lomin=${lomin}&lamax=${lamax}&lomax=${lomax}`;
  const r = await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(12000) });
  if (!r.ok) throw new Error(`opensky HTTP ${r.status}`);
  const j = await r.json();
  if (!Array.isArray(j?.states)) return [];
  return j.states
    .map(normOpenSky)
    .filter(f => Number.isFinite(f.lat) && Number.isFinite(f.lon) && !f.onGround);
}

/**
 * Fetch live flights near Houston from the best available free ADS-B source.
 * Tries sources in priority order; falls back gracefully on network errors.
 * Returns an array of normalized flight objects.
 */
export async function fetchFlightsNearHouston() {
  // If preferred source worked recently, try it first
  const tryPreferred = _preferred === 'adsblol' ? _fetchAdsbLol
    : _preferred === 'airplanes' ? _fetchAirplanesLive
    : _fetchOpenSky;

  try {
    const flights = await tryPreferred();
    _lastOk = Date.now();
    return flights;
  } catch (e) {
    console.warn(`[HTS flights] ${_preferred} failed (${e.message}), trying fallbacks…`);
  }

  // Fallback chain
  for (const [name, fn] of [
    ['adsblol',   _fetchAdsbLol],
    ['airplanes', _fetchAirplanesLive],
    ['opensky',   _fetchOpenSky],
  ]) {
    if (name === _preferred) continue;
    try {
      const flights = await fn();
      _preferred = name;
      _lastOk = Date.now();
      console.info(`[HTS flights] switched to ${name} (${flights.length} aircraft)`);
      return flights;
    } catch (e2) {
      console.warn(`[HTS flights] ${name} also failed: ${e2.message}`);
    }
  }

  return []; // all sources failed — app-main will show stale/simulated aircraft
}

/** Placeholder for paid traffic providers (HERE, TomTom, Google, TxDOT). */
export async function fetchLiveTrafficSegments() {
  // Wire to /api/traffic when TRAFFIC_API_KEY is configured server-side.
  return null;
}

/** Nearest Houston airport code to a given lat/lon (used for route enrichment) */
const _APT = [
  { iata: 'IAH', lat: 29.9844, lon: -95.3414 },
  { iata: 'HOU', lat: 29.6454, lon: -95.2789 },
  { iata: 'EFD', lat: 29.6073, lon: -95.1588 },
  { iata: 'SGR', lat: 29.6223, lon: -95.6565 },
  { iata: 'DWH', lat: 30.0619, lon: -95.5528 },
  { iata: 'IWS', lat: 29.8182, lon: -95.6726 },
  { iata: 'CXO', lat: 30.3518, lon: -95.4145 },
];
export function nearestHoustonAirport(lat, lon) {
  let best = 'IAH', bd = 1e9;
  for (const a of _APT) {
    const d = Math.hypot((a.lat - lat) * 69, (a.lon - lon) * 59.9 * Math.cos(lat * Math.PI / 180));
    if (d < bd) { bd = d; best = a.iata; }
  }
  return best;
}
