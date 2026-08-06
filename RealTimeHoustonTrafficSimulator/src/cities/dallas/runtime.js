import { buildLatLngRuntimePack } from '../build-runtime-pack.js';
import {
  DALLAS_ROAD_LATLNG as roads, DALLAS_DISTRICTS as districts, DALLAS_AIRPORTS as airports,
  DALLAS_POIS as pois, DALLAS_HOTSPOTS as hotspots, DALLAS_CORRIDORS as corridors,
  DALLAS_JUMP_GROUPS as jumpGroups, DALLAS_NWS as nws, DALLAS_WATERS as waters,
  DALLAS_CAM_EXTRAS as camExtras, DALLAS_SKYLINE as skyline, DALLAS_SKYLINE_POCKETS as skylinePockets,
  DALLAS_ATTRACTIONS as attractions,
  DALLAS_RIVER_LATLNG as riverLatLng, DALLAS_META as meta,
} from './pack.js';

export function buildDallasRuntimePack(geo) {
  return buildLatLngRuntimePack(geo, {
    ...meta, roads, districts, airports, pois, hotspots, corridors,
    jumpGroups, nws, waters, camExtras, skyline, skylinePockets, attractions, riverLatLng,
  });
}
