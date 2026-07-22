import { buildLatLngRuntimePack } from '../build-runtime-pack.js';
import {
  CHICAGO_ROAD_LATLNG as roads, CHICAGO_DISTRICTS as districts, CHICAGO_AIRPORTS as airports,
  CHICAGO_POIS as pois, CHICAGO_HOTSPOTS as hotspots, CHICAGO_CORRIDORS as corridors,
  CHICAGO_JUMP_GROUPS as jumpGroups, CHICAGO_NWS as nws, CHICAGO_WATERS as waters,
  CHICAGO_CAM_EXTRAS as camExtras, CHICAGO_SKYLINE as skyline, CHICAGO_SKYLINE_POCKETS as skylinePockets,
  CHICAGO_ATTRACTIONS as attractions,
  CHICAGO_RIVER_LATLNG as riverLatLng, CHICAGO_META as meta,
} from './pack.js';
export function buildChicagoRuntimePack(geo) {
  return buildLatLngRuntimePack(geo, {
    ...meta, roads, districts, airports, pois, hotspots, corridors,
    jumpGroups, nws, waters, camExtras, skyline, skylinePockets, attractions, riverLatLng,
  });
}
