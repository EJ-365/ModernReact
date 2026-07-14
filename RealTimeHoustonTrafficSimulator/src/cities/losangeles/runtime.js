import { buildLatLngRuntimePack } from '../build-runtime-pack.js';
import {
  LOSANGELES_ROAD_LATLNG as roads, LOSANGELES_DISTRICTS as districts, LOSANGELES_AIRPORTS as airports,
  LOSANGELES_POIS as pois, LOSANGELES_HOTSPOTS as hotspots, LOSANGELES_CORRIDORS as corridors,
  LOSANGELES_JUMP_GROUPS as jumpGroups, LOSANGELES_NWS as nws, LOSANGELES_WATERS as waters,
  LOSANGELES_CAM_EXTRAS as camExtras, LOSANGELES_SKYLINE as skyline, LOSANGELES_ATTRACTIONS as attractions,
  LOSANGELES_RIVER_LATLNG as riverLatLng, LOSANGELES_META as meta,
} from './pack.js';
export function buildLosAngelesRuntimePack(geo) {
  return buildLatLngRuntimePack(geo, {
    ...meta, roads, districts, airports, pois, hotspots, corridors,
    jumpGroups, nws, waters, camExtras, skyline, attractions, riverLatLng,
  });
}
