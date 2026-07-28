/**
 * Philadelphia city pack — researched metro content.
 */
import { isCityManifest } from '../types.js';

/** @type {import('../types.js').CityManifest} */
export const philadelphiaManifest = {
  id: 'philadelphia',
  name: 'Philadelphia',
  shortName: 'PHL',
  origin: { lat: 39.9526, lng: -75.1652, unitsPerMile: 220 },
  bbox: { south: 39.85, west: -75.35, north: 40.12, east: -74.95 },
  feeds: {
    primaryTraffic: 'tomtom',
    tomtomFallback: false,
    weatherProvider: 'open-meteo',
    timezone: 'America/New_York',
  },
  airportCodes: ['PHL', 'PNE'],
  boardAirports: {
    PHL: 'Philadelphia International',
    PNE: 'Northeast Philadelphia',
  },
};

if (!isCityManifest(philadelphiaManifest)) {
  console.warn('[HTS] philadelphiaManifest failed shape check');
}
export default philadelphiaManifest;
