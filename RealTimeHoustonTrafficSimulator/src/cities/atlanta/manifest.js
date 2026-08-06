/**
 * Atlanta city pack — researched metro content.
 */
import { isCityManifest } from '../types.js';

/** @type {import('../types.js').CityManifest} */
export const atlantaManifest = {
  id: 'atlanta',
  name: 'Atlanta',
  shortName: 'ATL',
  origin: { lat: 33.7490, lng: -84.3880, unitsPerMile: 210 },
  bbox: { south: 33.45, west: -84.75, north: 34.05, east: -84.05 },
  feeds: {
    primaryTraffic: 'tomtom',
    tomtomFallback: false,
    weatherProvider: 'open-meteo',
    timezone: 'America/New_York',
  },
  airportCodes: ['ATL'],
  boardAirports: {
    ATL: 'Hartsfield–Jackson Atlanta International',
  },
};

if (!isCityManifest(atlantaManifest)) {
  console.warn('[HTS] atlantaManifest failed shape check');
}
export default atlantaManifest;
