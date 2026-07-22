import { buildLatLngRuntimePack } from '../build-runtime-pack.js';
import {
  SEATTLE_ROAD_LATLNG as roads, SEATTLE_DISTRICTS as districts, SEATTLE_AIRPORTS as airports,
  SEATTLE_POIS as pois, SEATTLE_HOTSPOTS as hotspots, SEATTLE_CORRIDORS as corridors,
  SEATTLE_JUMP_GROUPS as jumpGroups, SEATTLE_NWS as nws, SEATTLE_WATERS as waters,
  SEATTLE_CAM_EXTRAS as camExtras, SEATTLE_SKYLINE as skyline, SEATTLE_SKYLINE_POCKETS as skylinePockets,
  SEATTLE_ATTRACTIONS as attractions,
  SEATTLE_RIVER_LATLNG as riverLatLng, SEATTLE_META as meta,
} from './pack.js';
export function buildSeattleRuntimePack(geo) {
  return buildLatLngRuntimePack(geo, {
    ...meta, roads, districts, airports, pois, hotspots, corridors,
    jumpGroups, nws, waters, camExtras, skyline, skylinePockets, attractions, riverLatLng,
  });
}
