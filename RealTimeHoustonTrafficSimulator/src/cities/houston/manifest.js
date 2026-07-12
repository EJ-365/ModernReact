/**
 * Houston city pack — single source for origin / bbox / feeds / airports.
 * app.html still owns most logic; it can gradually read window.HTS_CITY.
 */
import { isCityManifest } from '../types.js';

/** @type {import('../types.js').CityManifest} */
export const houstonManifest = {
  id: 'houston',
  name: 'Houston',
  shortName: 'HOU',
  origin: {
    lat: 29.7604,
    lng: -95.3698,
    unitsPerMile: 210,
  },
  bbox: {
    south: 28.7,
    west: -96.6,
    north: 30.6,
    east: -94.3,
  },
  feeds: {
    primaryTraffic: 'transtar',
    transtarRss: ['traveltimes', 'incidents', 'closures'],
    tomtomFallback: true,
    weatherProvider: 'open-meteo',
    timezone: 'America/Chicago',
  },
  roadsCorridorsUrl: '/data/roads-corridors.js',
  roadsBootUrl: '/data/roads-boot.js',
  airportCodes: ['IAH', 'HOU', 'EFD', 'SGR', 'DWH', 'IWS', 'CXO'],
  boardAirports: {
    IAH: 'George Bush Intercontinental',
    HOU: 'William P. Hobby',
  },
};

if (!isCityManifest(houstonManifest)) {
  console.warn('[HTS] houstonManifest failed shape check');
}

export default houstonManifest;
