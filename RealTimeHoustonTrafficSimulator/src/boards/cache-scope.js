/**
 * Scope FlightAware board disk cache to the active metro.
 * A shared key caused SAT/IAH/etc. rows to leak into other cities' flat boards.
 */

export function boardCacheStorageKey(cityId) {
  const id = String(cityId || 'houston').trim().toLowerCase() || 'houston';
  return 'houstonSim.boardCache.v1.' + id;
}

/** Keep only airports that belong to the active metro board list. */
export function pickBoardCacheForApts(cache, boardApts) {
  const out = {};
  if (!cache || typeof cache !== 'object' || Array.isArray(cache)) return out;
  const allow = new Set(
    (boardApts || []).map((a) => String(a || '').trim().toUpperCase()).filter(Boolean),
  );
  if (!allow.size) return out;
  for (const apt of Object.keys(cache)) {
    const code = String(apt || '').trim().toUpperCase();
    if (!allow.has(code)) continue;
    out[code] = cache[apt];
  }
  return out;
}

/** Flatten board packs for enrichment / panel fallback — current metro apts only. */
export function flattenBoardFlights(boards, boardApts) {
  const flat = [];
  if (!boards || typeof boards !== 'object') return flat;
  const apts =
    boardApts && boardApts.length
      ? boardApts
      : Object.keys(boards);
  for (const apt of apts) {
    const code = String(apt || '').trim().toUpperCase();
    const p = boards[code] || boards[apt];
    if (!p) continue;
    for (const f of p.departures || []) flat.push(f);
    for (const f of p.arrivals || []) flat.push(f);
  }
  return flat;
}

export function flightBoardTimeZone(city) {
  return (city && city.feeds && city.feeds.timezone) || 'America/Chicago';
}
