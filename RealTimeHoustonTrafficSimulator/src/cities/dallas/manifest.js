/**
 * Dallas–Fort Worth city pack — researched metro content.
 */
import { isCityManifest } from '../types.js';

/** @type {import('../types.js').CityManifest} */
export const dallasManifest = {
  id: 'dallas',
  name: 'Dallas',
  shortName: 'DFW',
  origin: { lat: 32.7797, lng: -96.7980, unitsPerMile: 210 },
  bbox: { south: 32.40, west: -97.55, north: 33.25, east: -96.35 },
  feeds: {
    primaryTraffic: 'tomtom',
    tomtomFallback: false,
    weatherProvider: 'open-meteo',
    timezone: 'America/Chicago',
  },
  airportCodes: ['DFW', 'DAL', 'ADS'],
  boardAirports: {
    DFW: 'Dallas/Fort Worth International',
    DAL: 'Dallas Love Field',
    ADS: 'Addison Airport',
  },
};

if (!isCityManifest(dallasManifest)) {
  console.warn('[HTS] dallasManifest failed shape check');
}
export default dallasManifest;
