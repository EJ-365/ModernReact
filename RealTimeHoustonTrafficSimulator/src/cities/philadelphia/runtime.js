import { buildLatLngRuntimePack } from '../build-runtime-pack.js';
import {
  PHILADELPHIA_ROAD_LATLNG as roads, PHILADELPHIA_DISTRICTS as districts, PHILADELPHIA_AIRPORTS as airports,
  PHILADELPHIA_POIS as pois, PHILADELPHIA_HOTSPOTS as hotspots, PHILADELPHIA_CORRIDORS as corridors,
  PHILADELPHIA_JUMP_GROUPS as jumpGroups, PHILADELPHIA_NWS as nws, PHILADELPHIA_WATERS as waters,
  PHILADELPHIA_CAM_EXTRAS as camExtras, PHILADELPHIA_SKYLINE as skyline, PHILADELPHIA_SKYLINE_POCKETS as skylinePockets,
  PHILADELPHIA_ATTRACTIONS as attractions,
  PHILADELPHIA_RIVER_LATLNG as riverLatLng, PHILADELPHIA_META as meta,
} from './pack.js';
export function buildPhiladelphiaRuntimePack(geo) {
  return buildLatLngRuntimePack(geo, {
    ...meta, roads, districts, airports, pois, hotspots, corridors,
    jumpGroups, nws, waters, camExtras, skyline, skylinePockets, attractions, riverLatLng,
  });
}
