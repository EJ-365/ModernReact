/**
 * City pack contract — every metro must provide this shape.
 * Phase 1: JS + JSDoc. Phase 2: migrate to TypeScript interfaces.
 */

/**
 * @typedef {Object} CityOrigin
 * @property {number} lat
 * @property {number} lng
 * @property {number} unitsPerMile
 */

/**
 * @typedef {Object} CityBBox
 * @property {number} south
 * @property {number} west
 * @property {number} north
 * @property {number} east
 */

/**
 * @typedef {Object} CityFeeds
 * @property {'transtar'|'tomtom'|'none'} primaryTraffic
 * @property {string[]} [transtarRss]  e.g. ['traveltimes','incidents','closures']
 * @property {boolean} [tomtomFallback]
 * @property {string} weatherProvider  e.g. 'open-meteo'
 * @property {string} [timezone]
 */

/**
 * @typedef {Object} CityManifest
 * @property {string} id                 // 'houston'
 * @property {string} name
 * @property {string} shortName
 * @property {CityOrigin} origin
 * @property {CityBBox} bbox
 * @property {CityFeeds} feeds
 * @property {string} [roadsCorridorsUrl] // '/data/roads-corridors.js'
 * @property {string} [roadsBootUrl]
 * @property {string[]} airportCodes
 * @property {Object.<string, string>} [boardAirports] // IAH → 'Houston Intercontinental'
 */

/**
 * Lightweight runtime check (no deps).
 * @param {any} m
 * @returns {m is CityManifest}
 */
export function isCityManifest(m) {
  return !!(
    m &&
    typeof m.id === 'string' &&
    m.origin &&
    Number.isFinite(m.origin.lat) &&
    Number.isFinite(m.origin.lng) &&
    Number.isFinite(m.origin.unitsPerMile) &&
    m.bbox &&
    m.feeds &&
    m.feeds.primaryTraffic
  );
}

export const CITY_IDS = Object.freeze([
  'houston',
  'austin',
  'sanantonio',
  'dallas',
  'losangeles',
  'newyork',
  'boston',
  'chicago',
  'miami',
]);
