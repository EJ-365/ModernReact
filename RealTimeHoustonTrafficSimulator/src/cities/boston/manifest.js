/**
 * Boston city pack — researched metro content.
 */
import { isCityManifest } from '../types.js';

/** @type {import('../types.js').CityManifest} */
export const bostonManifest = {
  id: 'boston',
  name: 'Boston',
  shortName: 'BOS',
  origin: { lat: 42.36008, lng: -71.05888, unitsPerMile: 210 },
  bbox: { south: 42.05, west: -71.55, north: 42.55, east: -70.75 },
  feeds: {
    primaryTraffic: 'tomtom',
    tomtomFallback: false,
    weatherProvider: 'open-meteo',
    timezone: 'America/New_York',
  },
  airportCodes: ['BOS'],
  boardAirports: {
    BOS: 'Boston Logan International',
  },
};

if (!isCityManifest(bostonManifest)) {
  console.warn('[HTS] bostonManifest failed shape check');
}
export default bostonManifest;
