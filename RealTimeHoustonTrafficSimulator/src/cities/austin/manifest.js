/**
 * Austin city pack — researched metro content (roads, districts, airports, POIs).
 * Select via ?city=austin or localStorage hts-city. Houston remains default.
 */
import { isCityManifest } from '../types.js';

/** @type {import('../types.js').CityManifest} */
export const austinManifest = {
  id: 'austin',
  name: 'Austin',
  shortName: 'AUS',
  origin: {
    lat: 30.2672,
    lng: -97.7431,
    unitsPerMile: 210,
  },
  bbox: {
    south: 30.05,
    west: -98.05,
    north: 30.55,
    east: -97.45,
  },
  feeds: {
    primaryTraffic: 'tomtom',
    tomtomFallback: false,
    weatherProvider: 'open-meteo',
    timezone: 'America/Chicago',
  },
  airportCodes: ['AUS', 'EDC'],
  boardAirports: {
    AUS: 'Austin-Bergstrom International',
    EDC: 'Austin Executive',
  },
};

if (!isCityManifest(austinManifest)) {
  console.warn('[HTS] austinManifest failed shape check');
}

export default austinManifest;
