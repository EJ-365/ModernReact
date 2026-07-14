import { buildLatLngRuntimePack } from '../build-runtime-pack.js';
import {
  SANANTONIO_ROAD_LATLNG as roads,
  SANANTONIO_DISTRICTS as districts,
  SANANTONIO_AIRPORTS as airports,
  SANANTONIO_POIS as pois,
  SANANTONIO_HOTSPOTS as hotspots,
  SANANTONIO_CORRIDORS as corridors,
  SANANTONIO_JUMP_GROUPS as jumpGroups,
  SANANTONIO_NWS as nws,
  SANANTONIO_WATERS as waters,
  SANANTONIO_CAM_EXTRAS as camExtras,
  SANANTONIO_SKYLINE as skyline,
  SANANTONIO_ATTRACTIONS as attractions,
  SANANTONIO_RIVER_LATLNG as riverLatLng,
  SANANTONIO_META as meta,
} from './pack.js';

export function buildSanAntonioRuntimePack(geo) {
  return buildLatLngRuntimePack(geo, {
    ...meta,
    roads, districts, airports, pois, hotspots, corridors,
    jumpGroups, nws, waters, camExtras, skyline, attractions, riverLatLng,
  });
}
