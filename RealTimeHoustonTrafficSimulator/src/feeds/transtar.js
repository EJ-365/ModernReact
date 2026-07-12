/**
 * Houston TranStar adapter — mapping + RSS fetch live here.
 * Flow apply / corridor index still run in app.html (need road graph).
 */
import { applyLiveTrafficSnapshot } from './types.js';
import {
  TRANSTAR_ROAD_MAP,
  TRANSTAR_CORRIDOR_HINTS,
  mapTranStarRoadId,
  mapTranStarDirSign,
  mapTranStarDirSignHeuristic,
  parseTravelMinutes,
} from './transtar-map.js';
import {
  parseRssItems,
  fetchTranStarRss,
  fetchTranStarOptionalJson,
  pullTranStarPublicFeeds,
} from './transtar-rss.js';
import {
  sanitizeLiveMph,
  applyTranStarTravelTimes,
  applyTranStarSpeedJson,
} from './transtar-apply.js';
import {
  corridorPanelKey,
  findCorridorForTranStarItem,
  indexTranStarCorridorTimes,
} from './transtar-corridor-index.js';

/** @type {import('./types.js').LiveTrafficAdapter & Record<string, any>} */
export const transtarAdapter = {
  id: 'transtar',
  label: 'Houston TranStar',
  ROAD_MAP: TRANSTAR_ROAD_MAP,
  CORRIDOR_HINTS: TRANSTAR_CORRIDOR_HINTS,
  mapRoadId: mapTranStarRoadId,
  mapDirSign: mapTranStarDirSign,
  mapDirSignHeuristic: mapTranStarDirSignHeuristic,
  parseTravelMinutes,
  parseRssItems,
  fetchRss: fetchTranStarRss,
  fetchOptionalJson: fetchTranStarOptionalJson,
  pullPublicFeeds: pullTranStarPublicFeeds,
  sanitizeLiveMph,
  applyTravelTimes: applyTranStarTravelTimes,
  applySpeedJson: applyTranStarSpeedJson,
  corridorPanelKey,
  findCorridorForItem: findCorridorForTranStarItem,
  indexCorridorTimes: indexTranStarCorridorTimes,
  supports(city) {
    return city?.id === 'houston' && city?.feeds?.primaryTraffic === 'transtar';
  },
  /**
   * Fetch public RSS. Pass roadDeps to also build flow samples.
   * @param {import('../cities/types.js').CityManifest} city
   * @param {{ fetchWithTimeout?: Function } & import('./transtar-apply.js').TranStarRoadDeps} [opts]
   */
  async refresh(city, opts = {}) {
    if (!this.supports(city)) {
      return {
        ok: false,
        err: 'TranStar only supports Houston',
        at: Date.now(),
        flows: new Map(),
        incidents: [],
      };
    }
    try {
      const feeds = await pullTranStarPublicFeeds(opts);
      const activeClosures = (feeds.closures || []).filter(
        (x) => !/status:\s*inactive/i.test(x.desc || ''),
      );
      const flows = opts.flows || new Map();
      let flowGot = 0;
      if (typeof opts.findRoadByKey === 'function' && feeds.travelTimes.length) {
        flowGot = applyTranStarTravelTimes(feeds.travelTimes, {
          ...opts,
          flows,
        });
      }
      return {
        ok:
          flowGot > 0 ||
          feeds.travelTimes.length > 0 ||
          feeds.incidents.length > 0 ||
          activeClosures.length > 0,
        src: 'transtar-rss',
        at: feeds.at,
        flows,
        flowGot,
        incidents: feeds.incidents,
        closures: activeClosures,
        travelTimes: feeds.travelTimes,
        err: feeds.errors.travelTimes || '',
      };
    } catch (e) {
      return {
        ok: false,
        err: String(e && e.message ? e.message : e),
        at: Date.now(),
        flows: new Map(),
        incidents: [],
      };
    }
  },
};

/**
 * @param {import('../cities/types.js').CityManifest} city
 * @param {{ fetchWithTimeout?: Function }} [opts]
 */
export async function refreshTranstarViaAdapter(city, opts) {
  const snap = await transtarAdapter.refresh(city, opts);
  applyLiveTrafficSnapshot({
    ok: snap.ok,
    src: snap.src,
    at: snap.at,
    err: snap.err,
    incidents: snap.incidents,
    flows: snap.flows,
  });
  return snap;
}

export {
  TRANSTAR_ROAD_MAP,
  TRANSTAR_CORRIDOR_HINTS,
  mapTranStarRoadId,
  mapTranStarDirSign,
  mapTranStarDirSignHeuristic,
  parseTravelMinutes,
  parseRssItems,
  fetchTranStarRss,
  fetchTranStarOptionalJson,
  pullTranStarPublicFeeds,
  sanitizeLiveMph,
  applyTranStarTravelTimes,
  applyTranStarSpeedJson,
  corridorPanelKey,
  findCorridorForTranStarItem,
  indexTranStarCorridorTimes,
};

export default transtarAdapter;
