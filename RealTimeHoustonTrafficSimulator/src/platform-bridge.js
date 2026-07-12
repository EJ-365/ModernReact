/**
 * Loads the active city pack onto window for the classic app.html script.
 */
import { houstonManifest } from './cities/houston/manifest.js';
import { isCityManifest } from './cities/types.js';
import { transtarAdapter } from './feeds/transtar.js';

const city = houstonManifest;

if (!isCityManifest(city)) {
  console.error('[HTS] Invalid city manifest');
} else {
  window.HTS_CITY = city;
  window.HTS_FEEDS = {
    transtar: transtarAdapter,
  };
  window.HTS_PLATFORM = {
    version: 'transition-1',
    cityId: city.id,
    phase: 1,
  };
  console.log(
    '%cHTS platform · city=' + city.id + ' · phase 1 scaffold',
    'color:#7fd6a0',
  );
}
