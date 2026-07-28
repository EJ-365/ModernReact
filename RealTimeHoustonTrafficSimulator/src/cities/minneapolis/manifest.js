/**
 * Minneapolis city pack — researched metro content.
 */
import { isCityManifest } from '../types.js';

/** @type {import('../types.js').CityManifest} */
export const minneapolisManifest = {
  id: 'minneapolis',
  name: 'Minneapolis',
  shortName: 'MSP',
  origin: { lat: 44.9778, lng: -93.2650, unitsPerMile: 210 },
  bbox: { south: 44.80, west: -93.55, north: 45.15, east: -92.95 },
  feeds: {
    primaryTraffic: 'tomtom',
    tomtomFallback: false,
    weatherProvider: 'open-meteo',
    timezone: 'America/Chicago',
  },
  airportCodes: ['MSP'],
  boardAirports: {
    MSP: 'Minneapolis–Saint Paul International',
  },
};

if (!isCityManifest(minneapolisManifest)) {
  console.warn('[HTS] minneapolisManifest failed shape check');
}
export default minneapolisManifest;
