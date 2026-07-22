import { buildLatLngRuntimePack } from '../build-runtime-pack.js';
import {
  DENVER_ROAD_LATLNG as roads, DENVER_DISTRICTS as districts, DENVER_AIRPORTS as airports,
  DENVER_POIS as pois, DENVER_HOTSPOTS as hotspots, DENVER_CORRIDORS as corridors,
  DENVER_JUMP_GROUPS as jumpGroups, DENVER_NWS as nws, DENVER_WATERS as waters,
  DENVER_CAM_EXTRAS as camExtras, DENVER_SKYLINE as skyline, DENVER_SKYLINE_POCKETS as skylinePockets,
  DENVER_ATTRACTIONS as attractions,
  DENVER_RIVER_LATLNG as riverLatLng, DENVER_META as meta,
} from './pack.js';
export function buildDenverRuntimePack(geo) {
  return buildLatLngRuntimePack(geo, {
    ...meta, roads, districts, airports, pois, hotspots, corridors,
    jumpGroups, nws, waters, camExtras, skyline, skylinePockets, attractions, riverLatLng,
  });
}
