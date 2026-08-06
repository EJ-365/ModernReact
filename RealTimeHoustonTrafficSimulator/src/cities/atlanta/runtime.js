import { buildLatLngRuntimePack } from '../build-runtime-pack.js';
import {
  ATLANTA_ROAD_LATLNG as roads, ATLANTA_DISTRICTS as districts, ATLANTA_AIRPORTS as airports,
  ATLANTA_POIS as pois, ATLANTA_HOTSPOTS as hotspots, ATLANTA_CORRIDORS as corridors,
  ATLANTA_JUMP_GROUPS as jumpGroups, ATLANTA_NWS as nws, ATLANTA_WATERS as waters,
  ATLANTA_CAM_EXTRAS as camExtras, ATLANTA_SKYLINE as skyline, ATLANTA_SKYLINE_POCKETS as skylinePockets,
  ATLANTA_ATTRACTIONS as attractions,
  ATLANTA_RIVER_LATLNG as riverLatLng, ATLANTA_META as meta,
} from './pack.js';
export function buildAtlantaRuntimePack(geo) {
  return buildLatLngRuntimePack(geo, {
    ...meta, roads, districts, airports, pois, hotspots, corridors,
    jumpGroups, nws, waters, camExtras, skyline, skylinePockets, attractions, riverLatLng,
  });
}
