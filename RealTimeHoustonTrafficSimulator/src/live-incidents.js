const HOUSTON_BBOX = Object.freeze({
  south: 28.7,
  west: -96.6,
  north: 30.6,
  east: -94.3,
});

/**
 * Keep incident geometry inside the metro requested from TomTom.
 * Falls back to Houston for the legacy boot path without a city manifest.
 */
export function incidentCoordinateInBounds(lat, lng, bbox) {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false;
  const bounds =
    bbox &&
    Number.isFinite(bbox.south) &&
    Number.isFinite(bbox.west) &&
    Number.isFinite(bbox.north) &&
    Number.isFinite(bbox.east)
      ? bbox
      : HOUSTON_BBOX;
  return (
    lat >= bounds.south &&
    lat <= bounds.north &&
    lng >= bounds.west &&
    lng <= bounds.east
  );
}
