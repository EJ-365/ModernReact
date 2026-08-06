/**
 * Miami city pack — researched metro content.
 */
import { isCityManifest } from '../types.js';

/** @type {import('../types.js').CityManifest} */
export const miamiManifest = {
  id: 'miami',
  name: 'Miami',
  shortName: 'MIA',
  origin: { lat: 25.7617, lng: -80.1918, unitsPerMile: 210 },
  bbox: { south: 25.45, west: -80.55, north: 26.15, east: -80.05 },
  feeds: {
    primaryTraffic: 'tomtom',
    tomtomFallback: false,
    weatherProvider: 'open-meteo',
    timezone: 'America/New_York',
  },
  airportCodes: ['MIA', 'FLL'],
  boardAirports: {
    MIA: 'Miami International',
    FLL: 'Fort Lauderdale–Hollywood International',
  },
};

if (!isCityManifest(miamiManifest)) {
  console.warn('[HTS] miamiManifest failed shape check');
}
export default miamiManifest;
