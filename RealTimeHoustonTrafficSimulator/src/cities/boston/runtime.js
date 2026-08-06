import { buildLatLngRuntimePack } from '../build-runtime-pack.js';
import {
  BOSTON_ROAD_LATLNG as roads, BOSTON_DISTRICTS as districts, BOSTON_AIRPORTS as airports,
  BOSTON_POIS as pois, BOSTON_HOTSPOTS as hotspots, BOSTON_CORRIDORS as corridors,
  BOSTON_JUMP_GROUPS as jumpGroups, BOSTON_NWS as nws, BOSTON_WATERS as waters,
  BOSTON_CAM_EXTRAS as camExtras, BOSTON_SKYLINE as skyline, BOSTON_SKYLINE_POCKETS as skylinePockets,
  BOSTON_ATTRACTIONS as attractions,
  BOSTON_RIVER_LATLNG as riverLatLng, BOSTON_META as meta,
} from './pack.js';
export function buildBostonRuntimePack(geo) {
  return buildLatLngRuntimePack(geo, {
    ...meta, roads, districts, airports, pois, hotspots, corridors,
    jumpGroups, nws, waters, camExtras, skyline, skylinePockets, attractions, riverLatLng,
  });
}
