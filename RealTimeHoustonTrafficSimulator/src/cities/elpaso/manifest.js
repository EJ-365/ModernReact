/**
 * El Paso city pack — Far West Texas / Chihuahuan Desert metro on the Rio Grande.
 */
import { isCityManifest } from '../types.js';

/** @type {import('../types.js').CityManifest} */
export const elpasoManifest = {
  id: 'elpaso',
  name: 'El Paso',
  shortName: 'ELP',
  origin: { lat: 31.7619, lng: -106.4850, unitsPerMile: 210 },
  bbox: { south: 31.55, west: -106.75, north: 32.05, east: -106.05 },
  feeds: {
    primaryTraffic: 'tomtom',
    tomtomFallback: false,
    weatherProvider: 'open-meteo',
    timezone: 'America/Denver',
  },
  airportCodes: ['ELP', 'BIF'],
  boardAirports: {
    ELP: 'El Paso International',
    BIF: 'Biggs Army Airfield',
  },
};

if (!isCityManifest(elpasoManifest)) {
  console.warn('[HTS] elpasoManifest failed shape check');
}
export default elpasoManifest;
