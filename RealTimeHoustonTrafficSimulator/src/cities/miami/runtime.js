import { buildLatLngRuntimePack } from '../build-runtime-pack.js';
import {
  MIAMI_ROAD_LATLNG as roads, MIAMI_DISTRICTS as districts, MIAMI_AIRPORTS as airports,
  MIAMI_POIS as pois, MIAMI_HOTSPOTS as hotspots, MIAMI_CORRIDORS as corridors,
  MIAMI_JUMP_GROUPS as jumpGroups, MIAMI_NWS as nws, MIAMI_WATERS as waters,
  MIAMI_CAM_EXTRAS as camExtras, MIAMI_SKYLINE as skyline, MIAMI_SKYLINE_POCKETS as skylinePockets,
  MIAMI_ATTRACTIONS as attractions,
  MIAMI_RIVER_LATLNG as riverLatLng, MIAMI_META as meta,
} from './pack.js';
export function buildMiamiRuntimePack(geo) {
  return buildLatLngRuntimePack(geo, {
    ...meta, roads, districts, airports, pois, hotspots, corridors,
    jumpGroups, nws, waters, camExtras, skyline, skylinePockets, attractions, riverLatLng,
  });
}
