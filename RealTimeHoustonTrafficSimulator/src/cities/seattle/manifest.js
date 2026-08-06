/**
 * Seattle city pack — researched metro content.
 */
import { isCityManifest } from '../types.js';

/** @type {import('../types.js').CityManifest} */
export const seattleManifest = {
  id: 'seattle',
  name: 'Seattle',
  shortName: 'SEA',
  origin: { lat: 47.6062, lng: -122.3321, unitsPerMile: 210 },
  bbox: { south: 47.35, west: -122.55, north: 47.85, east: -122.05 },
  feeds: {
    primaryTraffic: 'tomtom',
    tomtomFallback: false,
    weatherProvider: 'open-meteo',
    timezone: 'America/Los_Angeles',
  },
  airportCodes: ['SEA', 'BFI'],
  boardAirports: {
    SEA: 'Seattle–Tacoma International',
    BFI: 'King County International (Boeing Field)',
  },
};

if (!isCityManifest(seattleManifest)) {
  console.warn('[HTS] seattleManifest failed shape check');
}
export default seattleManifest;
