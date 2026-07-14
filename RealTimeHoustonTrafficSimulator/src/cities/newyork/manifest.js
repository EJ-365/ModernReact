/**
 * New York City pack — researched metro content.
 */
import { isCityManifest } from '../types.js';

/** @type {import('../types.js').CityManifest} */
export const newyorkManifest = {
  id: 'newyork',
  name: 'New York',
  shortName: 'NYC',
  origin: { lat: 40.71278, lng: -74.00601, unitsPerMile: 210 },
  bbox: { south: 40.48, west: -74.35, north: 41.05, east: -73.55 },
  feeds: {
    primaryTraffic: 'tomtom',
    tomtomFallback: false,
    weatherProvider: 'open-meteo',
    timezone: 'America/New_York',
  },
  airportCodes: ['JFK', 'LGA', 'EWR'],
  boardAirports: {
    JFK: 'John F. Kennedy International',
    LGA: 'LaGuardia',
    EWR: 'Newark Liberty International',
  },
};

if (!isCityManifest(newyorkManifest)) {
  console.warn('[HTS] newyorkManifest failed shape check');
}
export default newyorkManifest;
