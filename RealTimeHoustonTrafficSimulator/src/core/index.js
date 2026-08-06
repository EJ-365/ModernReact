/**
 * Core platform surface — geo, clock parts, corridor ETA.
 * Loaded by platform-bridge onto window.HTS_CORE for the classic app.html script.
 */
export { clamp } from './math.js';
export {
  HOUSTON_GEO_ORIGIN,
  makeGeo,
  houstonGeo,
  geoToWorld,
  worldToGeo,
} from './geo.js';
export {
  chicagoParts,
  partsToHourWeekend,
  createCityClock,
} from './clock.js';
export {
  corridorDriveMiles,
  corridorAbsMinMinutes,
  saneCorridorMinutes,
  clampCorridorMinutes,
  applyCorridorPad,
} from './corridor-eta.js';
