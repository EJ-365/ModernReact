export function normalizeAirportCodes(input, fallback = []) {
  const seen = new Set();
  const out = [];
  const values = Array.isArray(input) ? input : [];
  const source = values.length ? values : fallback;
  for (const raw of source) {
    const code = String(raw || '').trim().toUpperCase();
    if (!code || seen.has(code)) continue;
    seen.add(code);
    out.push(code);
  }
  return out;
}

export function resolveBoardAirportCodes(city, pack, fallback = []) {
  const cityCodes = Array.isArray(city && city.airportCodes) ? city.airportCodes : [];
  const packCodes = Array.isArray(pack && pack.boardApts) ? pack.boardApts : [];
  return normalizeAirportCodes(cityCodes, [...packCodes, ...fallback]);
}

export function preferredBoardAirport(city, pack, fallback = []) {
  const codes = resolveBoardAirportCodes(city, pack, fallback);
  return codes[0] || String((fallback && fallback[0]) || 'IAH').trim().toUpperCase();
}