/**
 * Loads the active city pack + core helpers onto window for the classic app.html script.
 * Default city remains Houston; Austin via ?city=austin (Phase 3 thin pack).
 */
import { activeCity, activeCityId, CITY_IDS, CITY_PACKS } from './cities/registry.js';
import { isCityManifest } from './cities/types.js';
import { transtarAdapter } from './feeds/transtar.js';
import { tomtomAdapter } from './feeds/tomtom.js';
import * as core from './core/index.js';

const city = activeCity();

if (!isCityManifest(city)) {
  console.error('[HTS] Invalid city manifest');
} else {
  const geo = core.makeGeo(city.origin);
  window.HTS_CITY = city;
  window.HTS_CITIES = CITY_PACKS;
  window.HTS_CITY_IDS = CITY_IDS;
  window.HTS_FEEDS = {
    transtar: transtarAdapter,
    tomtom: tomtomAdapter,
    primary:
      city.feeds.primaryTraffic === 'tomtom' ? tomtomAdapter : transtarAdapter,
  };
  window.HTS_CORE = {
    clamp: core.clamp,
    geoToWorld: (lat, lng) => geo.geoToWorld(lat, lng),
    worldToGeo: (x, z) => geo.worldToGeo(x, z),
    unitsPerMile: geo.unitsPerMile,
    chicagoParts: (d) =>
      core.chicagoParts(d, city.feeds.timezone || 'America/Chicago'),
    partsToHourWeekend: core.partsToHourWeekend,
    corridorDriveMiles: core.corridorDriveMiles,
    corridorAbsMinMinutes: core.corridorAbsMinMinutes,
    saneCorridorMinutes: core.saneCorridorMinutes,
    clampCorridorMinutes: core.clampCorridorMinutes,
    applyCorridorPad: core.applyCorridorPad,
    createCityClock: core.createCityClock,
  };
  window.HTS_PLATFORM = {
    version: 'transition-3',
    cityId: city.id,
    activeCityId: activeCityId(),
    phase: city.id === 'houston' ? 2 : 3,
  };
  console.log(
    '%cHTS platform · city=' +
      city.id +
      ' · feed=' +
      city.feeds.primaryTraffic +
      ' · phase ' +
      window.HTS_PLATFORM.phase,
    'color:#7fd6a0',
  );
}
