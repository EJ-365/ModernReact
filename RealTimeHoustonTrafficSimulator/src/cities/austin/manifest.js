/**
 * Austin city pack — Phase 3 thin proof (TomTom-only traffic, no TranStar).
 * Not wired as the default sim city yet; select via ?city=austin or localStorage hts-city.
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
  /* Road packs not stitched yet — Houston geometry remains until Phase 4 OSM generalize */
  airportCodes: ['AUS'],
  boardAirports: {
    AUS: 'Austin-Bergstrom International',
  },
};

if (!isCityManifest(austinManifest)) {
  console.warn('[HTS] austinManifest failed shape check');
}

export default austinManifest;
