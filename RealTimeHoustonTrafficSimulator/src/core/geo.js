/**
 * World ↔ lat/lng mapping anchored at a city origin.
 * Formula matches the Downtown Houston mapping historically used in app.html.
 */

/**
 * @typedef {Object} GeoOrigin
 * @property {number} lat
 * @property {number} lng
 * @property {number} unitsPerMile
 */

/** @type {GeoOrigin} */
export const HOUSTON_GEO_ORIGIN = Object.freeze({
  lat: 29.7604,
  lng: -95.3698,
  unitsPerMile: 210,
});

/**
 * @param {Partial<GeoOrigin>|null|undefined} origin
 */
export function makeGeo(origin) {
  const lat0 = origin && Number.isFinite(origin.lat) ? origin.lat : HOUSTON_GEO_ORIGIN.lat;
  const lng0 = origin && Number.isFinite(origin.lng) ? origin.lng : HOUSTON_GEO_ORIGIN.lng;
  const units =
    origin && Number.isFinite(origin.unitsPerMile)
      ? origin.unitsPerMile
      : HOUSTON_GEO_ORIGIN.unitsPerMile;

  return {
    origin: { lat: lat0, lng: lng0, unitsPerMile: units },
    unitsPerMile: units,
    /**
     * @param {number} lat
     * @param {number} lng
     */
    geoToWorld(lat, lng) {
      return {
        x: (lng - lng0) * 59.9 * units + 60,
        z: -(lat - lat0) * 69 * units + 60,
      };
    },
    /**
     * @param {number} x
     * @param {number} z
     */
    worldToGeo(x, z) {
      return {
        lng: (x - 60) / (59.9 * units) + lng0,
        lat: lat0 - (z - 60) / (69 * units),
      };
    },
  };
}

/** Default Houston geo helpers (same numbers as legacy UNITS_PER_MILE / Downtown). */
export const houstonGeo = makeGeo(HOUSTON_GEO_ORIGIN);

export function geoToWorld(lat, lng) {
  return houstonGeo.geoToWorld(lat, lng);
}

export function worldToGeo(x, z) {
  return houstonGeo.worldToGeo(x, z);
}
