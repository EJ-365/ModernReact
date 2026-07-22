/**
 * Chicago city pack — researched metro content.
 */
import { isCityManifest } from '../types.js';

/** @type {import('../types.js').CityManifest} */
export const chicagoManifest = {
  id: 'chicago',
  name: 'Chicago',
  shortName: 'CHI',
  origin: { lat: 41.8781, lng: -87.6298, unitsPerMile: 210 },
  bbox: { south: 41.55, west: -88.05, north: 42.15, east: -87.35 },
  feeds: {
    primaryTraffic: 'tomtom',
    tomtomFallback: false,
    weatherProvider: 'open-meteo',
    timezone: 'America/Chicago',
  },
  airportCodes: ['ORD', 'MDW'],
  boardAirports: {
    ORD: 'Chicago O\'Hare International',
    MDW: 'Chicago Midway International',
  },
};

if (!isCityManifest(chicagoManifest)) {
  console.warn('[HTS] chicagoManifest failed shape check');
}
export default chicagoManifest;
