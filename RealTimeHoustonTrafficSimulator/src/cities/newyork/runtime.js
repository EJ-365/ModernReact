import { buildLatLngRuntimePack } from '../build-runtime-pack.js';
import {
  NEWYORK_ROAD_LATLNG as roads, NEWYORK_DISTRICTS as districts, NEWYORK_AIRPORTS as airports,
  NEWYORK_POIS as pois, NEWYORK_HOTSPOTS as hotspots, NEWYORK_CORRIDORS as corridors,
  NEWYORK_JUMP_GROUPS as jumpGroups, NEWYORK_NWS as nws, NEWYORK_WATERS as waters,
  NEWYORK_CAM_EXTRAS as camExtras, NEWYORK_SKYLINE as skyline, NEWYORK_SKYLINE_POCKETS as skylinePockets,
  NEWYORK_ATTRACTIONS as attractions,
  NEWYORK_RIVER_LATLNG as riverLatLng, NEWYORK_META as meta,
} from './pack.js';
export function buildNewYorkRuntimePack(geo) {
  return buildLatLngRuntimePack(geo, {
    ...meta, roads, districts, airports, pois, hotspots, corridors,
    jumpGroups, nws, waters, camExtras, skyline, skylinePockets, attractions, riverLatLng,
  });
}
