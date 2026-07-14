/**
 * Los Angeles city pack — researched metro content.
 */
import { isCityManifest } from '../types.js';

/** @type {import('../types.js').CityManifest} */
export const losangelesManifest = {
  id: 'losangeles',
  name: 'Los Angeles',
  shortName: 'LA',
  origin: { lat: 34.05223, lng: -118.24368, unitsPerMile: 210 },
  bbox: { south: 33.45, west: -118.95, north: 34.85, east: -117.40 },
  feeds: {
    primaryTraffic: 'tomtom',
    tomtomFallback: false,
    weatherProvider: 'open-meteo',
    timezone: 'America/Los_Angeles',
  },
  airportCodes: ['LAX', 'BUR', 'LGB', 'SNA'],
  boardAirports: {
    LAX: 'Los Angeles International',
    BUR: 'Hollywood Burbank',
    LGB: 'Long Beach',
    SNA: 'John Wayne / Orange County',
  },
};

if (!isCityManifest(losangelesManifest)) {
  console.warn('[HTS] losangelesManifest failed shape check');
}
export default losangelesManifest;
