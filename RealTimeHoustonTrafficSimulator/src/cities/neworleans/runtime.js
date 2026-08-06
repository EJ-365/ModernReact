import { buildLatLngRuntimePack } from '../build-runtime-pack.js';
import {
  NEWORLEANS_ROAD_LATLNG as roads, NEWORLEANS_DISTRICTS as districts, NEWORLEANS_AIRPORTS as airports,
  NEWORLEANS_POIS as pois, NEWORLEANS_HOTSPOTS as hotspots, NEWORLEANS_CORRIDORS as corridors,
  NEWORLEANS_JUMP_GROUPS as jumpGroups, NEWORLEANS_NWS as nws, NEWORLEANS_WATERS as waters,
  NEWORLEANS_CAM_EXTRAS as camExtras, NEWORLEANS_SKYLINE as skyline, NEWORLEANS_SKYLINE_POCKETS as skylinePockets,
  NEWORLEANS_ATTRACTIONS as attractions,
  NEWORLEANS_RIVER_LATLNG as riverLatLng, NEWORLEANS_META as meta,
} from './pack.js';
export function buildNewOrleansRuntimePack(geo) {
  return buildLatLngRuntimePack(geo, {
    ...meta, roads, districts, airports, pois, hotspots, corridors,
    jumpGroups, nws, waters, camExtras, skyline, skylinePockets, attractions, riverLatLng,
  });
}
