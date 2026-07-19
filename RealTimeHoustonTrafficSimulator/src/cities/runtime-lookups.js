export function mergePackAirportCoords(baseCoords, pack) {
  const packCoords = pack && pack.aptCoords;
  if (!packCoords || typeof packCoords !== 'object') return { ...baseCoords };
  return { ...baseCoords, ...packCoords };
}
