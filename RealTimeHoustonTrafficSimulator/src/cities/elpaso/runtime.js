import { buildLatLngRuntimePack } from '../build-runtime-pack.js';
import {
  ELPASO_ROAD_LATLNG as roads,
  ELPASO_DISTRICTS as districts,
  ELPASO_AIRPORTS as airports,
  ELPASO_POIS as pois,
  ELPASO_HOTSPOTS as hotspots,
  ELPASO_CORRIDORS as corridors,
  ELPASO_JUMP_GROUPS as jumpGroups,
  ELPASO_NWS as nws,
  ELPASO_WATERS as waters,
  ELPASO_CAM_EXTRAS as camExtras,
  ELPASO_SKYLINE as skyline,
  ELPASO_SKYLINE_POCKETS as skylinePockets,
  ELPASO_ATTRACTIONS as attractions,
  ELPASO_RIVER_LATLNG as riverLatLng,
  ELPASO_META as meta,
} from './pack.js';

export function buildElPasoRuntimePack(geo) {
  return buildLatLngRuntimePack(geo, {
    ...meta,
    roads, districts, airports, pois, hotspots, corridors,
    jumpGroups, nws, waters, camExtras, skyline, skylinePockets, attractions, riverLatLng,
  });
}
