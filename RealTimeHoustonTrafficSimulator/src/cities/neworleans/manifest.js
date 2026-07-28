/**
 * New Orleans city pack — researched metro content.
 */
import { isCityManifest } from '../types.js';

/** @type {import('../types.js').CityManifest} */
export const neworleansManifest = {
  id: 'neworleans',
  name: 'New Orleans',
  shortName: 'MSY',
  origin: { lat: 29.9511, lng: -90.0715, unitsPerMile: 210 },
  bbox: { south: 29.85, west: -90.25, north: 30.10, east: -89.85 },
  feeds: {
    primaryTraffic: 'tomtom',
    tomtomFallback: false,
    weatherProvider: 'open-meteo',
    timezone: 'America/Chicago',
  },
  airportCodes: ['MSY', 'NEW'],
  boardAirports: {
    MSY: 'Louis Armstrong New Orleans International',
    NEW: 'Lakefront Airport',
  },
};

if (!isCityManifest(neworleansManifest)) {
  console.warn('[HTS] neworleansManifest failed shape check');
}
export default neworleansManifest;
