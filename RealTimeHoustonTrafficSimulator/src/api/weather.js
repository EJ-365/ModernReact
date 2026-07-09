const HOUSTON = { lat: 29.7604, lng: -95.3698, tz: "America/Chicago" };

const WMO_MAP = [
  [[0], "clear", "Clear", 0],
  [[1], "partly", "Mostly clear", 0],
  [[2], "partly", "Partly cloudy", 0],
  [[3], "overcast", "Overcast", 0],
  [[45, 48], "fog", "Fog", 0],
  [[51, 53, 56], "rain", "Light drizzle", 0.3],
  [[55, 57], "rain", "Drizzle", 0.45],
  [[61, 80], "rain", "Light rain", 0.5],
  [[63, 81], "rain", "Rain", 0.7],
  [[65, 66, 67, 82], "rain", "Heavy rain", 0.95],
  [[71, 73, 75, 77, 85, 86], "overcast", "Wintry mix", 0.2],
  [[95], "storm", "Thunderstorm", 0.9],
  [[96, 99], "storm", "Severe thunderstorm", 1.0],
];

export function wmoLookup(code) {
  for (const [codes, preset, label, rain] of WMO_MAP) {
    if (codes.includes(code)) return { preset, label, rain };
  }
  return { preset: "partly", label: "Partly cloudy", rain: 0 };
}

/** Live + 2-day hourly forecast for Houston (Open-Meteo, no API key). */
export async function fetchHoustonWeather() {
  const { lat, lng, tz } = HOUSTON;
  const url =
    `/api/openmeteo/v1/forecast?latitude=${lat}&longitude=${lng}` +
    `&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,` +
    `weather_code,cloud_cover,wind_speed_10m,wind_direction_10m,dew_point_2m,pressure_msl,uv_index,visibility` +
    `&hourly=temperature_2m,weather_code,cloud_cover,wind_speed_10m,precipitation,relative_humidity_2m` +
    `&forecast_days=2&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timezone=${encodeURIComponent(tz)}`;

  const r = await fetch(url, { cache: "no-store" });
  if (!r.ok) throw new Error(`weather ${r.status}`);
  const j = await r.json();
  const c = j.current;
  const m = wmoLookup(c.weather_code);

  return {
    temp: Math.round(c.temperature_2m),
    feels: Math.round(c.apparent_temperature),
    hum: Math.round(c.relative_humidity_2m),
    wind: Math.round(c.wind_speed_10m),
    windDir: c.wind_direction_10m,
    precip: c.precipitation,
    cloud: c.cloud_cover / 100,
    dew: Math.round(c.dew_point_2m),
    press: (c.pressure_msl * 0.02953).toFixed(2),
    uv: Math.round(c.uv_index),
    vis: Math.round((c.visibility || 24000) / 1609),
    preset: m.preset,
    label: m.label,
    rainAmt: m.rain,
    at: Date.now(),
    hourly: j.hourly || null,
  };
}

export { HOUSTON };
