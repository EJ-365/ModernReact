import { buildLatLngRuntimePack } from '../build-runtime-pack.js';
import {
  MINNEAPOLIS_ROAD_LATLNG as roads, MINNEAPOLIS_DISTRICTS as districts, MINNEAPOLIS_AIRPORTS as airports,
  MINNEAPOLIS_POIS as pois, MINNEAPOLIS_HOTSPOTS as hotspots, MINNEAPOLIS_CORRIDORS as corridors,
  MINNEAPOLIS_JUMP_GROUPS as jumpGroups, MINNEAPOLIS_NWS as nws, MINNEAPOLIS_WATERS as waters,
  MINNEAPOLIS_CAM_EXTRAS as camExtras, MINNEAPOLIS_SKYLINE as skyline, MINNEAPOLIS_SKYLINE_POCKETS as skylinePockets,
  MINNEAPOLIS_ATTRACTIONS as attractions,
  MINNEAPOLIS_RIVER_LATLNG as riverLatLng, MINNEAPOLIS_META as meta,
} from './pack.js';
export function buildMinneapolisRuntimePack(geo) {
  return buildLatLngRuntimePack(geo, {
    ...meta, roads, districts, airports, pois, hotspots, corridors,
    jumpGroups, nws, waters, camExtras, skyline, skylinePockets, attractions, riverLatLng,
  });
}
