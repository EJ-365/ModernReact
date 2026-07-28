/**
 * Metro weather zones — one Open-Meteo sample per suburb/district so
 * rain in downtown does not paint Sugar Land (or Round Rock, Santa Monica, …).
 */

/**
 * Build one weather zone per suburb/district (all of them).
 * @param {Array<{id:string,n:string,lat?:number,lng?:number,x:number,z:number,r?:number}>} districts
 * @param {{lat:number,lng:number,x:number,z:number,name:string,unitsPerMile?:number,maxZones?:number,minSepMi?:number,allSuburbs?:boolean,worldToGeo?:(x:number,z:number)=>{lat:number,lng:number}}} origin
 */
export function buildWeatherZones(districts, origin) {
  const upm = origin.unitsPerMile || 210;
  const allSuburbs = origin.allSuburbs !== false;
  const minSepMi = allSuburbs ? 0 : (origin.minSepMi != null ? origin.minSepMi : 7.5);
  const minSep = minSepMi * upm;
  const maxZones = allSuburbs
    ? Number.POSITIVE_INFINITY
    : (origin.maxZones != null ? origin.maxZones : 14);
  const toGeo = typeof origin.worldToGeo === 'function' ? origin.worldToGeo : null;

  /** @type {Array<{id:string,n:string,lat:number,lng:number,x:number,z:number,r:number,wx:any}>} */
  const zones = [];

  function resolveLatLng(d) {
    if (Number.isFinite(d.lat) && Number.isFinite(d.lng)) return { lat: d.lat, lng: d.lng };
    if (toGeo && Number.isFinite(d.x) && Number.isFinite(d.z)) {
      const g = toGeo(d.x, d.z);
      if (g && Number.isFinite(g.lat) && Number.isFinite(g.lng)) return { lat: g.lat, lng: g.lng };
    }
    return null;
  }

  function push(z) {
    const ll = resolveLatLng(z);
    if (!ll) return false;
    if (!Number.isFinite(z.x) || !Number.isFinite(z.z)) return false;
    if (minSep > 0) {
      for (const e of zones) {
        if (Math.hypot(z.x - e.x, z.z - e.z) < minSep) return false;
      }
    }
    if (zones.some((e) => e.id === z.id)) return false;
    zones.push({
      id: z.id,
      n: z.n,
      lat: ll.lat,
      lng: ll.lng,
      x: z.x,
      z: z.z,
      r: z.r || Math.max(280, (allSuburbs ? 0.9 : 0.55) * Math.max(minSep || upm * 3, upm * 2)),
      wx: null,
    });
    return true;
  }

  push({
    id: 'core',
    n: origin.name + ' · Downtown',
    lat: origin.lat,
    lng: origin.lng,
    x: origin.x,
    z: origin.z,
    r: 520,
  });

  const list = (districts || [])
    .filter((d) => d && d.id !== 'downtown' && d.id !== 'core')
    .slice()
    .sort((a, b) => (b.r || 0) - (a.r || 0));

  for (const d of list) {
    if (zones.length >= maxZones) break;
    push({
      id: d.id,
      n: d.n || d.id,
      lat: d.lat,
      lng: d.lng,
      x: d.x,
      z: d.z,
      r: Math.max(d.r || 300, 280),
    });
  }

  return zones;
}

/**
 * @param {Array<any>} zones
 * @param {number} [size]
 */
export function chunkWeatherZones(zones, size) {
  const n = Math.max(8, size || 40);
  const out = [];
  for (let i = 0; i < (zones || []).length; i += n) out.push(zones.slice(i, i + n));
  return out;
}

/**
 * Nearest suburb owning (x,z) — never borrow a distant city's weather.
 * @param {Array<{x:number,z:number,r:number,wx:any,n:string,id:string}>} zones
 * @param {number} x
 * @param {number} z
 */
export function nearestWeatherZone(zones, x, z) {
  if (!zones || !zones.length) return null;
  let best = null;
  let bestD = 1e18;
  for (const zn of zones) {
    if (!zn) continue;
    const d = Math.hypot(x - zn.x, z - zn.z);
    if (d < bestD) {
      bestD = d;
      best = zn;
    }
  }
  return best ? { zone: best, dist: bestD } : null;
}

/**
 * Rain 0..1 for world point — STRICTLY the nearest suburb's sample.
 * Dry if that suburb has no feed yet (do NOT steal downtown rain).
 * @param {Array<{x:number,z:number,r:number,wx:any}>} zones
 * @param {number} x
 * @param {number} z
 */
export function rainIntensityAt(zones, x, z) {
  const hit = nearestWeatherZone(zones, x, z);
  if (!hit || !hit.zone) return 0;
  const zn = hit.zone;
  const homeR = Math.max(zn.r || 320, 280);
  /* Outside this suburb's cell → no borrowed rain from a far wet city */
  if (hit.dist > homeR * 1.35) return 0;
  const wx = zn.wx;
  if (!wx) return 0;
  const codeRain = wx.rainAmt != null ? wx.rainAmt : 0;
  /* Soft precip hint only — don’t turn a light drizzle code into a downpour */
  const precipBoost = wx.precip != null ? Math.min(0.85, wx.precip * 3.5) : 0;
  if (codeRain <= 0 && precipBoost <= 0) return 0;
  if (codeRain <= 0) return Math.max(0, Math.min(1, precipBoost));
  /* Prefer the weather-code intensity; only lift toward precip when precip is clearly wetter */
  return Math.max(0, Math.min(1, Math.max(codeRain, Math.min(codeRain + 0.12, precipBoost))));
}

/**
 * Camera / UI weather for the suburb under (x,z).
 * @param {Array<{x:number,z:number,r:number,wx:any,n:string,id:string}>} zones
 * @param {number} x
 * @param {number} z
 */
export function sampleZoneWeather(zones, x, z) {
  const hit = nearestWeatherZone(zones, x, z);
  if (!hit || !hit.zone) return null;
  const best = hit.zone;
  const bestD = hit.dist;
  if (!best.wx) {
    return {
      place: best.n,
      zoneId: best.id,
      zoneDist: bestD,
      rainAmt: 0,
      cloud: 0,
      temp: null,
      wind: null,
      windDir: 0,
      precip: 0,
      label: 'Loading…',
      preset: 'clear',
      pending: true,
    };
  }

  const homeR = Math.max(best.r || 320, 280);
  const inside = bestD < homeR * 1.2;
  const wx = best.wx;
  const rainAmt = rainIntensityAt(zones, x, z);

  return {
    ...wx,
    place: best.n,
    zoneId: best.id,
    zoneDist: bestD,
    rainAmt,
    cloud: wx.cloud || 0,
    temp: wx.temp,
    wind: wx.wind,
    windDir: wx.windDir,
    precip: wx.precip || 0,
    label: wx.label,
    preset: wx.preset || (rainAmt > 0.55 ? 'storm' : rainAmt > 0.15 ? 'rain' : wx.preset),
    inside,
  };
}

/**
 * Build Open-Meteo multi-coordinate URL.
 * @param {Array<{lat:number,lng:number}>} zones
 * @param {string} host
 * @param {string} timezone
 * @param {boolean} [hourly]
 */
export function openMeteoMultiUrl(zones, host, timezone, hourly) {
  const lats = zones.map((z) => Number(z.lat).toFixed(5)).join(',');
  const lngs = zones.map((z) => Number(z.lng).toFixed(5)).join(',');
  const tz = encodeURIComponent(timezone || 'America/Chicago');
  return (
    host +
    '/v1/forecast?latitude=' +
    lats +
    '&longitude=' +
    lngs +
    '&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,' +
    'weather_code,cloud_cover,wind_speed_10m,wind_direction_10m,dew_point_2m,pressure_msl,uv_index,visibility' +
    (hourly
      ? '&hourly=temperature_2m,apparent_temperature,relative_humidity_2m,dew_point_2m,pressure_msl,uv_index,weather_code,cloud_cover,wind_speed_10m,wind_direction_10m,precipitation&forecast_days=2'
      : '') +
    '&past_minutes=15&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timezone=' +
    tz
  );
}
