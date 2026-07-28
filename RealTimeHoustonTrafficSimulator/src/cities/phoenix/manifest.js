/**
 * Phoenix city pack — researched metro content.
 */
import { isCityManifest } from '../types.js';

/** @type {import('../types.js').CityManifest} */
export const phoenixManifest = {
  id: 'phoenix',
  name: 'Phoenix',
  shortName: 'PHX',
  origin: { lat: 33.4484, lng: -112.0740, unitsPerMile: 210 },
  bbox: { south: 33.20, west: -112.45, north: 33.75, east: -111.70 },
  feeds: {
    primaryTraffic: 'tomtom',
    tomtomFallback: false,
    weatherProvider: 'open-meteo',
    timezone: 'America/Phoenix',
  },
  airportCodes: ['PHX'],
  boardAirports: {
    PHX: 'Phoenix Sky Harbor International',
  },
};

if (!isCityManifest(phoenixManifest)) {
  console.warn('[HTS] phoenixManifest failed shape check');
}
export default phoenixManifest;
