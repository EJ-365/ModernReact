/**
 * Loads the active city pack + core helpers onto window for the classic app.html script.
 */
import { houstonManifest } from './cities/houston/manifest.js';
import { isCityManifest } from './cities/types.js';
import { transtarAdapter } from './feeds/transtar.js';
import { tomtomAdapter } from './feeds/tomtom.js';
import * as core from './core/index.js';

const city = houstonManifest;

if (!isCityManifest(city)) {
  console.error('[HTS] Invalid city manifest');
} else {
  const geo = core.makeGeo(city.origin);
  window.HTS_CITY = city;
  window.HTS_FEEDS = {
    transtar: transtarAdapter,
    tomtom: tomtomAdapter,
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
    version: 'transition-2',
    cityId: city.id,
    phase: 2,
  };
  console.log(
    '%cHTS platform · city=' + city.id + ' · phase 2 three+transtar',
    'color:#7fd6a0',
  );
}
