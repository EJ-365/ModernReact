/**
 * Index TranStar travel-time RSS into corridorTimes Map (suburb↔downtown chips).
 */
import {
  TRANSTAR_CORRIDOR_HINTS,
  mapTranStarRoadId,
  mapTranStarDirSign,
  parseTravelMinutes,
} from './transtar-map.js';
import {
  saneCorridorMinutes,
  applyCorridorPad,
} from '../core/corridor-eta.js';

/**
 * @param {{ road: string, ax: number, az: number, bx: number, bz: number }} c
 * @param {number} sign
 */
export function corridorPanelKey(c, sign) {
  return c.road + '|' + c.ax + ',' + c.az + '|' + c.bx + ',' + c.bz + '|' + sign;
}

/**
 * @param {string} title
 * @param {string} roadId
 * @param {any[]} corridors
 */
export function findCorridorForTranStarItem(title, roadId, corridors) {
  const t = String(title || '');
  const tl = t.toLowerCase();
  const list = corridors || [];
  for (const c of list) {
    if (c.road !== roadId) continue;
    const dest = (c.label.split(' · ')[1] || '').toLowerCase();
    const token = dest.split(/[\s/]+/)[0];
    if (token.length > 2 && tl.includes(token)) return c;
  }
  const hints = TRANSTAR_CORRIDOR_HINTS[roadId];
  if (hints) {
    for (const h of hints) {
      if (h.re && !h.re.test(t)) continue;
      for (const c of list) {
        if (c.road !== roadId) continue;
        if (
          Math.abs(c.ax - h.ax) < 900 &&
          Math.abs(c.az - h.az) < 900 &&
          Math.abs(c.bx - h.bx) < 900 &&
          Math.abs(c.bz - h.bz) < 900
        )
          return c;
      }
    }
  }
  return null;
}

/**
 * @typedef {Object} CorridorIndexDeps
 * @property {any[]} corridors
 * @property {(c: any, outbound: boolean) => number} travelSign
 * @property {(title: string, roadId: string) => 1|-1} [mapDirSign]
 * @property {Map<string, any>} [corridorTimes]
 * @property {(c: any, mins: number) => number|null} [saneMinutes]
 * @property {(c: any, mins: number) => number} [applyPad]
 */

/**
 * @param {Array<{ title?: string, desc?: string }>} items
 * @param {CorridorIndexDeps} deps
 * @returns {number} entries written
 */
export function indexTranStarCorridorTimes(items, deps) {
  if (!deps || !Array.isArray(deps.corridors)) return 0;
  const corridors = deps.corridors;
  const travelSign = deps.travelSign;
  if (typeof travelSign !== 'function') return 0;
  const mapDir = deps.mapDirSign || mapTranStarDirSign;
  const sane = deps.saneMinutes || saneCorridorMinutes;
  const pad = deps.applyPad || applyCorridorPad;

  let store = deps.corridorTimes;
  if (!store) {
    if (typeof window === 'undefined') return 0;
    if (!window.LIVE_TRAFFIC) {
      window.LIVE_TRAFFIC = {
        flows: new Map(),
        incidents: [],
        corridorTimes: new Map(),
        ok: false,
        at: 0,
      };
    }
    if (!window.LIVE_TRAFFIC.corridorTimes) window.LIVE_TRAFFIC.corridorTimes = new Map();
    store = window.LIVE_TRAFFIC.corridorTimes;
  }

  const list = items || [];
  let got = 0;

  for (const c of corridors) {
    if (!c.toDt) continue;
    for (const outbound of [false, true]) {
      const re = outbound ? c.tsOut : c.tsIn;
      if (!re) continue;
      let best = null;
      for (const it of list) {
        const title = String(it.title || '');
        if (/\bHOV\b/i.test(title)) continue;
        if (!re.test(title)) continue;
        const mins = parseTravelMinutes(it.desc);
        if (!(mins > 0)) continue;
        if (!best || mins < best.mins) best = { mins, title };
      }
      if (!best) continue;
      const okMins = sane(c, pad(c, best.mins));
      if (okMins == null) continue;
      const sign = travelSign(c, outbound);
      store.set(corridorPanelKey(c, sign), {
        mins: okMins,
        at: Date.now(),
        src: 'transtar',
        title: best.title.trim(),
        rawMins: best.mins,
        pad: c.tsPadMin || 0,
      });
      got++;
    }
  }

  for (const it of list) {
    const title = String(it.title || '');
    if (/\bHOV\b/i.test(title)) continue;
    const roadId = mapTranStarRoadId(title);
    if (!roadId) continue;
    const mins = parseTravelMinutes(it.desc);
    if (!(mins > 0)) continue;
    const corr = findCorridorForTranStarItem(title, roadId, corridors);
    if (!corr) continue;
    if (corr.toDt && (corr.tsIn || corr.tsOut)) continue;
    const okMins = sane(corr, pad(corr, mins));
    if (okMins == null) continue;
    const sign = mapDir(title, roadId);
    const key = corridorPanelKey(corr, sign);
    if (store.has(key)) continue;
    store.set(key, {
      mins: okMins,
      at: Date.now(),
      src: 'transtar',
      title: title.trim(),
    });
    got++;
  }
  return got;
}
