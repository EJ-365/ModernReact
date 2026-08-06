import { buildLatLngRuntimePack } from '../build-runtime-pack.js';
import {
  PHOENIX_ROAD_LATLNG as roads, PHOENIX_DISTRICTS as districts, PHOENIX_AIRPORTS as airports,
  PHOENIX_POIS as pois, PHOENIX_HOTSPOTS as hotspots, PHOENIX_CORRIDORS as corridors,
  PHOENIX_JUMP_GROUPS as jumpGroups, PHOENIX_NWS as nws, PHOENIX_WATERS as waters,
  PHOENIX_CAM_EXTRAS as camExtras, PHOENIX_SKYLINE as skyline, PHOENIX_SKYLINE_POCKETS as skylinePockets,
  PHOENIX_ATTRACTIONS as attractions,
  PHOENIX_RIVER_LATLNG as riverLatLng, PHOENIX_META as meta,
} from './pack.js';
export function buildPhoenixRuntimePack(geo) {
  return buildLatLngRuntimePack(geo, {
    ...meta, roads, districts, airports, pois, hotspots, corridors,
    jumpGroups, nws, waters, camExtras, skyline, skylinePockets, attractions, riverLatLng,
  });
}
