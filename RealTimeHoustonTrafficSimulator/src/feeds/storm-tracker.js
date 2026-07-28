/** Live tornado / hurricane tracking — NHC, SPC, NWS (free public feeds). */
import { strFromU8, unzipSync } from 'fflate';

const HTS_UA = 'HoustonTrafficSimulator/1.0 (edu; github.com/EJ-365/ModernReact)';

const CITY_NWS_STATES = {
  houston: ['TX'],
  austin: ['TX'],
  dallas: ['TX'],
  sanantonio: ['TX'],
  losangeles: ['CA'],
  newyork: ['NY', 'NJ', 'CT'],
  boston: ['MA', 'RI', 'NH', 'CT'],
  chicago: ['IL', 'IN', 'WI'],
  miami: ['FL'],
  seattle: ['WA'],
  denver: ['CO'],
  atlanta: ['GA'],
  phoenix: ['AZ'],
  philadelphia: ['PA', 'NJ', 'DE'],
  minneapolis: ['MN', 'WI'],
  neworleans: ['LA'],
};

const CITY_CENTERS = {
  houston: [29.7604, -95.3698],
  austin: [30.2672, -97.7431],
  dallas: [32.7767, -96.7970],
  sanantonio: [29.4241, -98.4936],
  losangeles: [34.0522, -118.2437],
  newyork: [40.7128, -74.0060],
  boston: [42.3601, -71.0589],
  chicago: [41.8781, -87.6298],
  miami: [25.7617, -80.1918],
  seattle: [47.6062, -122.3321],
  denver: [39.7392, -104.9903],
  atlanta: [33.7490, -84.3880],
  phoenix: [33.4484, -112.0740],
  philadelphia: [39.9526, -75.1652],
  minneapolis: [44.9778, -93.2650],
  neworleans: [29.9511, -90.0715],
};

function apiHost(kind) {
  try {
    if (/^https?:$/i.test(location.protocol) && location.hostname) {
      if (kind === 'nhc') return '/api/nhc';
      if (kind === 'spc') return '/api/spc';
      if (kind === 'nws') return '/api/nws';
    }
  } catch (e) { /* file:// */ }
  if (kind === 'nhc') return 'https://www.nhc.noaa.gov';
  if (kind === 'spc') return 'https://mapservices.weather.noaa.gov';
  return 'https://api.weather.gov';
}

export function nwsStatesForCity(cityId) {
  return CITY_NWS_STATES[cityId] || ['TX'];
}

export function classifyStormAlert(event) {
  const e = String(event || '').toLowerCase();
  if (/tornado warning/.test(e)) return { kind: 'tornado', tier: 'warning', label: 'Tornado warning' };
  if (/tornado watch/.test(e)) return { kind: 'tornado', tier: 'watch', label: 'Tornado watch' };
  if (/severe thunderstorm warning/.test(e)) return { kind: 'tornado', tier: 'severe', label: 'Severe t-storm' };
  if (/hurricane warning|typhoon warning/.test(e)) return { kind: 'hurricane', tier: 'warning', label: 'Hurricane warning' };
  if (/hurricane watch|typhoon watch/.test(e)) return { kind: 'hurricane', tier: 'watch', label: 'Hurricane watch' };
  if (/tropical storm warning/.test(e)) return { kind: 'hurricane', tier: 'warning', label: 'Tropical storm warning' };
  if (/tropical storm watch/.test(e)) return { kind: 'hurricane', tier: 'watch', label: 'Tropical storm watch' };
  if (/storm surge warning/.test(e)) return { kind: 'hurricane', tier: 'surge', label: 'Storm surge warning' };
  if (/storm surge watch/.test(e)) return { kind: 'hurricane', tier: 'watch', label: 'Storm surge watch' };
  if (/extreme wind warning/.test(e)) return { kind: 'hurricane', tier: 'warning', label: 'Extreme wind' };
  return null;
}

export function nhcClassLabel(code) {
  const c = String(code || '').toUpperCase();
  if (c === 'HU') return 'Hurricane';
  if (c === 'TS') return 'Tropical storm';
  if (c === 'TD') return 'Tropical depression';
  if (c === 'PT') return 'Post-tropical';
  if (c === 'LO') return 'Low';
  if (c === 'DB') return 'Disturbance';
  if (c === 'EX') return 'Extratropical';
  if (c === 'SD') return 'Subtropical depression';
  if (c === 'SS') return 'Subtropical storm';
  return code || 'Storm';
}

export function nhcWindCat(mph) {
  const w = Number(mph) || 0;
  if (w >= 157) return 5;
  if (w >= 130) return 4;
  if (w >= 111) return 3;
  if (w >= 96) return 2;
  if (w >= 74) return 1;
  return 0;
}

/** Rough 12 h steps from current motion (when GIS track zip isn't parsed in-browser). */
export function projectStormTrack(lat, lng, dirDeg, speedKt, hours = 120) {
  const pts = [[lng, lat]];
  let la = lat;
  let ln = lng;
  const steps = Math.max(1, Math.round(hours / 12));
  const nm12 = (Number(speedKt) || 0) * 12;
  const km12 = nm12 * 1.852;
  const rad = ((Number(dirDeg) || 0) * Math.PI) / 180;
  for (let i = 1; i <= steps; i++) {
    const dLat = (km12 / 111) * Math.cos(rad);
    const cosLat = Math.max(0.15, Math.cos((la * Math.PI) / 180));
    const dLng = ((km12 / 111) / cosLat) * Math.sin(rad);
    la += dLat;
    ln += dLng;
    pts.push([ln, la]);
  }
  return pts;
}

function proxyNhcAsset(url) {
  if (!url) return null;
  try {
    const u = new URL(url);
    return `${apiHost('nhc')}${u.pathname}${u.search}`;
  } catch {
    return url;
  }
}

function parseCoordinateText(text) {
  return String(text || '')
    .trim()
    .split(/\s+/)
    .map((token) => token.split(',').slice(0, 2).map(Number))
    .filter(([lng, lat]) => Number.isFinite(lng) && Number.isFinite(lat));
}

function kmlCoordinateSets(kml, tag) {
  const sets = [];
  const re = new RegExp(`<${tag}\\b[\\s\\S]*?<coordinates[^>]*>([\\s\\S]*?)<\\/coordinates>[\\s\\S]*?<\\/${tag}>`, 'gi');
  let match;
  while ((match = re.exec(kml))) {
    const points = parseCoordinateText(match[1]);
    if (points.length) sets.push(points);
  }
  return sets;
}

async function fetchKmzKml(url) {
  if (!url) return null;
  const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timer = ctrl ? setTimeout(() => ctrl.abort(), 15000) : null;
  try {
    const response = await fetch(proxyNhcAsset(url), {
      cache: 'no-store',
      signal: ctrl ? ctrl.signal : undefined,
    });
    if (!response.ok) throw new Error(`NHC GIS ${response.status}`);
    const files = unzipSync(new Uint8Array(await response.arrayBuffer()));
    const name = Object.keys(files).find((key) => /\.kml$/i.test(key));
    return name ? strFromU8(files[name]) : null;
  } finally {
    if (timer) clearTimeout(timer);
  }
}

async function fetchOfficialNhcGeometry(storm) {
  const [trackKml, coneKml] = await Promise.all([
    fetchKmzKml(storm.forecastTrack && storm.forecastTrack.kmzFile).catch(() => null),
    fetchKmzKml(storm.trackCone && storm.trackCone.kmzFile).catch(() => null),
  ]);
  const trackLines = trackKml ? kmlCoordinateSets(trackKml, 'LineString') : [];
  const coneRings = coneKml ? kmlCoordinateSets(coneKml, 'LinearRing') : [];
  return {
    officialTrack: trackLines.sort((a, b) => b.length - a.length)[0] || null,
    cone: coneRings.sort((a, b) => b.length - a.length)[0] || null,
  };
}

function alertHasGeometry(f) {
  const g = f && f.geometry;
  return !!(g && g.type && g.coordinates && g.coordinates.length);
}

function geometryPoints(geometry) {
  if (!geometry || !geometry.coordinates) return [];
  const points = [];
  const walk = (value) => {
    if (!Array.isArray(value)) return;
    if (value.length >= 2 && Number.isFinite(value[0]) && Number.isFinite(value[1])) {
      points.push(value);
      return;
    }
    value.forEach(walk);
  };
  walk(geometry.coordinates);
  return points;
}

export function distanceMi(lat1, lng1, lat2, lng2) {
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * 3958.8 * Math.asin(Math.min(1, Math.sqrt(a)));
}

export function bearingDeg(lat1, lng1, lat2, lng2) {
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

export function compassFromBearing(deg) {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round((((deg % 360) + 360) % 360) / 45) % 8];
}

/** Point MAX_MI toward a far storm so cameras stay on the local map. */
export function clampTowardPoint(fromLat, fromLng, toLat, toLng, maxMi) {
  const mi = distanceMi(fromLat, fromLng, toLat, toLng);
  if (!Number.isFinite(mi) || mi <= maxMi) {
    return { lat: toLat, lng: toLng, mi: mi || 0, clamped: false };
  }
  const frac = maxMi / mi;
  return {
    lat: fromLat + (toLat - fromLat) * frac,
    lng: fromLng + (toLng - fromLng) * frac,
    mi,
    clamped: true,
  };
}

function geometryContainsPoint(geometry, lng, lat) {
  if (!geometry || !geometry.coordinates) return false;
  const polys = geometry.type === 'Polygon' ? [geometry.coordinates]
    : (geometry.type === 'MultiPolygon' ? geometry.coordinates : []);
  return polys.some((poly) => {
    if (!poly || !poly[0] || !pointInRing(lng, lat, poly[0])) return false;
    return !poly.slice(1).some((hole) => pointInRing(lng, lat, hole));
  });
}

/** Keep alerts only when they cover this metro (or a tight nearby zone). */
function filterMetroAlert(f, pack, cityId) {
  const p = f.properties || {};
  if (p.status && p.status !== 'Actual') return false;
  const area = `${p.areaDesc || ''} ${p.event || ''} ${p.headline || ''}`;
  const counties = pack && pack.nws && pack.nws.counties;
  const places = pack && pack.nws && pack.nws.places;
  const textHit = !!(counties && counties.test(area)) || !!(places && places.test(area));
  const center = CITY_CENTERS[cityId];
  if (!center) return textHit;
  const [clat, clng] = center;
  const cls = classifyStormAlert(p.event);
  const tropical = cls && cls.kind === 'hurricane';
  /* Tropical polygons can span entire coastlines — require metro inside the polygon or local text. */
  if (tropical) {
    if (geometryContainsPoint(f.geometry, clng, clat)) return true;
    if (textHit) return true;
    return false;
  }
  if (textHit) return true;
  if (geometryContainsPoint(f.geometry, clng, clat)) return true;
  /* Tornado / severe cells: allow nearby polygon vertices within ~90 mi */
  return geometryPoints(f.geometry).some(([lng, lat]) => distanceMi(clat, clng, lat, lng) <= 90);
}

async function fetchJson(url, headers, ms) {
  const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const t = ctrl ? setTimeout(() => ctrl.abort(), ms || 12000) : null;
  try {
    const r = await fetch(url, { headers, cache: 'no-store', signal: ctrl ? ctrl.signal : undefined });
    if (!r.ok) throw new Error(String(r.status));
    return await r.json();
  } finally {
    if (t) clearTimeout(t);
  }
}

export async function fetchNhcStorms() {
  const host = apiHost('nhc');
  const j = await fetchJson(`${host}/CurrentStorms.json`, { Accept: 'application/json' }, 12000);
  const list = (j && j.activeStorms) || [];
  return Promise.all(list.map(async (s) => {
    const mph = Number(s.intensity) || 0;
    const cat = nhcWindCat(mph);
    const estimate = projectStormTrack(
      s.latitudeNumeric,
      s.longitudeNumeric,
      s.movementDir,
      s.movementSpeed,
      120,
    );
    const official = await fetchOfficialNhcGeometry(s).catch(() => ({
      officialTrack: null,
      cone: null,
    }));
    return {
      id: s.id,
      name: s.name,
      classification: s.classification,
      classLabel: nhcClassLabel(s.classification),
      intensity: mph,
      cat,
      pressure: s.pressure,
      lat: s.latitudeNumeric,
      lng: s.longitudeNumeric,
      movementDir: s.movementDir,
      movementSpeed: s.movementSpeed,
      lastUpdate: s.lastUpdate,
      track: official.officialTrack || estimate,
      cone: official.cone,
      trackSource: official.officialTrack ? 'NHC official' : 'motion estimate',
      basin: String(s.id || '').startsWith('ep') ? 'EP' : 'AT',
      advisoryUrl: s.publicAdvisory && s.publicAdvisory.url,
    };
  }));
}

export async function fetchSpcTornadoOutlook() {
  const host = apiHost('spc');
  const url = `${host}/vector/rest/services/outlooks/SPC_wx_outlks/MapServer/3/query`
    + '?f=geojson&where=1%3D1&outFields=label,dn,valid,issue&returnGeometry=true&outSR=4326';
  const j = await fetchJson(url, { Accept: 'application/json,application/geo+json' }, 15000);
  const feats = (j && j.features) || [];
  return feats.map((f) => {
    const p = f.properties || {};
    const raw = Number(p.label);
    const pct = Number.isFinite(raw)
      ? `${raw > 0 && raw <= 1 ? Math.round(raw * 100) : raw}%`
      : (p.dn != null ? `${p.dn}%` : 'SPC risk');
    return {
      label: pct,
      dn: p.dn,
      valid: p.valid,
      issue: p.issue,
      geometry: f.geometry,
    };
  });
}

async function fetchNwsAlertsByEvent(event, states) {
  const host = apiHost('nws');
  const hdr = { Accept: 'application/geo+json', 'User-Agent': HTS_UA };
  const out = [];
  const q = encodeURIComponent(event);
  for (const st of states) {
    try {
      const j = await fetchJson(`${host}/alerts/active?area=${st}&event=${q}`, hdr, 12000);
      out.push(...((j && j.features) || []));
    } catch (e) { /* skip state */ }
  }
  try {
    const j = await fetchJson(`${host}/alerts/active?event=${q}`, hdr, 12000);
    for (const f of (j && j.features) || []) {
      if (!out.some((x) => x.id === f.id)) out.push(f);
    }
  } catch (e) { /* optional national pull */ }
  return out;
}

export async function fetchStormAlerts(pack, cityId) {
  const states = nwsStatesForCity(cityId);
  const events = [
    'Tornado Warning',
    'Tornado Watch',
    'Severe Thunderstorm Warning',
    'Hurricane Warning',
    'Hurricane Watch',
    'Tropical Storm Warning',
    'Tropical Storm Watch',
    'Storm Surge Warning',
    'Storm Surge Watch',
    'Extreme Wind Warning',
  ];
  const seen = new Set();
  const all = [];
  const batches = await Promise.all(events.map((ev) => fetchNwsAlertsByEvent(ev, states)));
  for (const batch of batches) {
    for (const f of batch) {
      if (!f || !f.id || seen.has(f.id)) continue;
      seen.add(f.id);
      const cls = classifyStormAlert((f.properties || {}).event);
      if (!cls) continue;
      if (!filterMetroAlert(f, pack, cityId)) continue;
      all.push({ feature: f, ...cls });
    }
  }
  all.sort((a, b) => {
    const rank = { warning: 4, surge: 3, severe: 2, watch: 1 };
    return (rank[b.tier] || 0) - (rank[a.tier] || 0);
  });
  return {
    tornado: all.filter((a) => a.kind === 'tornado'),
    hurricane: all.filter((a) => a.kind === 'hurricane'),
    all,
  };
}

function pointInRing(lng, lat, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if ((yi > lat) !== (yj > lat) && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

/** Highest-probability SPC outlook area containing the point, or null. */
export function spcRiskAtPoint(outlooks, lat, lng) {
  if (!outlooks || !outlooks.length || lat == null || lng == null) return null;
  let best = null;
  for (const o of outlooks) {
    const g = o.geometry;
    if (!g || !g.coordinates) continue;
    const polys = g.type === 'Polygon' ? [g.coordinates]
      : (g.type === 'MultiPolygon' ? g.coordinates : []);
    const hit = polys.some((poly) => {
      if (!poly || !poly[0] || !pointInRing(lng, lat, poly[0])) return false;
      return !poly.slice(1).some((hole) => pointInRing(lng, lat, hole));
    });
    if (hit && (!best || (o.dn || 0) > (best.dn || 0))) best = o;
  }
  return best;
}

export function spcRiskLabel(outlooks) {
  if (!outlooks || !outlooks.length) return 'No SPC tornado risk area today';
  const best = outlooks.reduce((a, b) => ((a.dn || 0) > (b.dn || 0) ? a : b), outlooks[0]);
  const pct = best.label || 'risk';
  return `SPC Day 1 tornado outlook · ${pct} within shaded area`;
}

export function stormsNearMetro(storms, lat, lng, maxMi = 280) {
  if (!storms || !storms.length || lat == null || lng == null) return [];
  const R = 3958.8;
  return storms.filter((s) => {
    if (s.lat == null || s.lng == null) return false;
    const dLat = ((s.lat - lat) * Math.PI) / 180;
    const dLng = ((s.lng - lng) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) ** 2
      + Math.cos((lat * Math.PI) / 180) * Math.cos((s.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
    const mi = 2 * R * Math.asin(Math.min(1, Math.sqrt(a)));
    return mi <= maxMi;
  });
}
