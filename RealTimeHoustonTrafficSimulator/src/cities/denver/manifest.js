/**
 * Denver city pack — researched metro content.
 */
import { isCityManifest } from '../types.js';

/** @type {import('../types.js').CityManifest} */
export const denverManifest = {
  id: 'denver',
  name: 'Denver',
  shortName: 'DEN',
  origin: { lat: 39.7392, lng: -104.9903, unitsPerMile: 210 },
  bbox: { south: 39.45, west: -105.25, north: 40.05, east: -104.65 },
  feeds: {
    primaryTraffic: 'tomtom',
    tomtomFallback: false,
    weatherProvider: 'open-meteo',
    timezone: 'America/Denver',
  },
  airportCodes: ['DEN'],
  boardAirports: {
    DEN: 'Denver International',
  },
};

if (!isCityManifest(denverManifest)) {
  console.warn('[HTS] denverManifest failed shape check');
}
export default denverManifest;
