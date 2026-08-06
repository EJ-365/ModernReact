/**
 * Apply TranStar travel-time / speed samples → LIVE_TRAFFIC flow Map.
 * Road graph is injected (findRoadByKey, nearestArc) so this stays city-portable.
 */
import { clamp } from '../core/math.js';
import {
  TRANSTAR_CORRIDOR_HINTS,
  mapTranStarRoadId,
  mapTranStarDirSign,
  parseTravelMinutes,
} from './transtar-map.js';

/**
 * @typedef {Object} TranStarRoadDeps
 * @property {(id: string) => any} findRoadByKey
 * @property {(road: any, x: number, z: number) => number} [nearestArc]
 * @property {number} [unitsPerMile]
 * @property {Map<string, any>} [flows]  target map (defaults to window.LIVE_TRAFFIC.flows)
 * @property {(title: string, roadId: string) => 1|-1} [mapDirSign]
 */

/**
 * @param {number} cur
 * @param {number} ff
 * @param {any} road
 */
export function sanitizeLiveMph(cur, ff, road) {
  const limit = (road && road.def && road.def.ff) || ff || 60;
  const isArt = road && road.def && (road.def.arterial || road.def.surface);
  const cap = isArt ? Math.min(limit, 52) : Math.min(limit * 1.05, 78);
  return clamp(Math.round(cur || 0), 8, cap);
}

/**
 * @param {any} road
 * @param {number} ax
 * @param {number} az
 * @param {number} bx
 * @param {number} bz
 * @param {TranStarRoadDeps} deps
 */
function estimateCorridorMiles(road, ax, az, bx, bz, deps) {
  if (!road || !deps.nearestArc) return null;
  const units = deps.unitsPerMile || 210;
  const a = deps.nearestArc(road, ax, az);
  const b = deps.nearestArc(road, bx, bz);
  return Math.max(0.5, Math.abs(b - a) / units);
}

/**
 * @param {TranStarRoadDeps} deps
 * @returns {Map<string, any>}
 */
function resolveFlows(deps) {
  if (deps.flows) return deps.flows;
  if (typeof window !== 'undefined') {
    if (!window.LIVE_TRAFFIC) {
      window.LIVE_TRAFFIC = { flows: new Map(), incidents: [], corridorTimes: new Map(), ok: false, at: 0 };
    }
    if (!window.LIVE_TRAFFIC.flows) window.LIVE_TRAFFIC.flows = new Map();
    return window.LIVE_TRAFFIC.flows;
  }
  return new Map();
}

/**
 * Build congestion flows from TranStar travel-time RSS items.
 * @param {Array<{ title?: string, desc?: string }>} items
 * @param {TranStarRoadDeps} deps
 * @returns {number} samples written
 */
export function applyTranStarTravelTimes(items, deps) {
  if (!deps || typeof deps.findRoadByKey !== 'function') return 0;
  const units = deps.unitsPerMile || 210;
  const mapDir = deps.mapDirSign || mapTranStarDirSign;
  const flows = resolveFlows(deps);
  let got = 0;
  const buckets = new Map();

  for (const it of items || []) {
    const roadId = mapTranStarRoadId(it.title);
    if (!roadId) continue;
    const mins = parseTravelMinutes(it.desc);
    if (!(mins > 0)) continue;
    const road = deps.findRoadByKey(roadId);
    if (!road) continue;
    const sign = mapDir(it.title, roadId);
    const key = road.def.id + '_' + sign;
    let miles = null;
    const hints = TRANSTAR_CORRIDOR_HINTS[roadId];
    if (hints) {
      for (const h of hints) {
        if (h.re.test(it.title)) {
          miles = estimateCorridorMiles(road, h.ax, h.az, h.bx, h.bz, deps);
          break;
        }
      }
      if (miles == null) {
        miles = estimateCorridorMiles(
          road,
          hints[0].ax,
          hints[0].az,
          hints[0].bx,
          hints[0].bz,
          deps,
        );
      }
    }
    if (!(miles > 0)) miles = Math.max(4, (road.s && road.s.total ? road.s.total : 0) / units * 0.35);
    if (!buckets.has(key)) buckets.set(key, { mins: [], miles: [], road, sign });
    const b = buckets.get(key);
    b.mins.push(mins);
    b.miles.push(miles);
  }

  for (const [key, b] of buckets) {
    const ff = b.road.def.ff || 60;
    const mphs = [];
    for (let i = 0; i < b.mins.length; i++) {
      const mi = b.miles[i];
      if (!(mi > 0) || !(b.mins[i] > 0)) continue;
      mphs.push(sanitizeLiveMph(mi / (b.mins[i] / 60), ff, b.road));
    }
    if (!mphs.length) continue;
    mphs.sort((a, c) => a - c);
    const cur = mphs[mphs.length >> 1];
    const ratio = ff > 0 ? clamp(cur / ff, 0.08, 1.25) : 1;
    const cong = clamp(1 - ratio, 0, 1);
    flows.set(key, {
      cur: Math.round(cur),
      ff,
      ratio,
      cong,
      at: Date.now(),
      src: 'transtar',
    });
    got++;
  }
  return got;
}

/**
 * @param {any} data
 * @param {TranStarRoadDeps} deps
 * @returns {number}
 */
export function applyTranStarSpeedJson(data, deps) {
  if (!deps || typeof deps.findRoadByKey !== 'function') return 0;
  const mapDir = deps.mapDirSign || mapTranStarDirSign;
  const flows = resolveFlows(deps);
  const rows = Array.isArray(data)
    ? data
    : (data && (data.segments || data.SegmentSpeeds || data.Speeds || data.data)) || [];
  if (!Array.isArray(rows) || !rows.length) return 0;
  let got = 0;
  for (const row of rows) {
    const title =
      row.RoadwayName || row.roadway || row.Road || row.name || row.SegmentName || row.Description || '';
    const roadId = mapTranStarRoadId(title) || mapTranStarRoadId(row.Direction || '');
    if (!roadId) continue;
    const road = deps.findRoadByKey(roadId);
    if (!road) continue;
    const dirTxt = String(row.Direction || row.direction || title || '');
    const sign = mapDir(dirTxt + ' ' + title, roadId);
    const ff = Number(row.FreeFlowSpeed || row.PostedSpeed || road.def.ff) || road.def.ff;
    const cur = sanitizeLiveMph(
      Number(row.AverageSpeed || row.Speed || row.speed || row.CurrentSpeed || row.avgSpeed),
      ff,
      road,
    );
    if (!(cur > 0)) continue;
    const ratio = ff > 0 ? clamp(cur / ff, 0.08, 1.25) : 1;
    const cong = clamp(1 - ratio, 0, 1);
    flows.set(roadId + '_' + sign, {
      cur: Math.round(cur),
      ff,
      ratio,
      cong,
      at: Date.now(),
      src: 'transtar-json',
    });
    got++;
  }
  return got;
}
