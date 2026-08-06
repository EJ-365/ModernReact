/**
 * San Antonio city pack — researched metro content.
 */
import { isCityManifest } from '../types.js';

/** @type {import('../types.js').CityManifest} */
export const sanantonioManifest = {
  id: 'sanantonio',
  name: 'San Antonio',
  shortName: 'SAT',
  origin: { lat: 29.4246, lng: -98.4951, unitsPerMile: 210 },
  bbox: { south: 29.15, west: -98.85, north: 29.75, east: -98.15 },
  feeds: {
    primaryTraffic: 'tomtom',
    tomtomFallback: false,
    weatherProvider: 'open-meteo',
    timezone: 'America/Chicago',
  },
  airportCodes: ['SAT', 'SSF'],
  boardAirports: {
    SAT: 'San Antonio International',
    SSF: 'Stinson Municipal',
  },
};

if (!isCityManifest(sanantonioManifest)) {
  console.warn('[HTS] sanantonioManifest failed shape check');
}
export default sanantonioManifest;
