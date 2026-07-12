/**
 * Houston TranStar adapter — Phase 1 scaffold.
 * Full RSS parsing still lives in app.html; this module documents the boundary
 * and will own mapping in Phase 2.
 */
import { applyLiveTrafficSnapshot } from './types.js';

/** @type {import('./types.js').LiveTrafficAdapter} */
export const transtarAdapter = {
  id: 'transtar',
  label: 'Houston TranStar',
  supports(city) {
    return city?.id === 'houston' && city?.feeds?.primaryTraffic === 'transtar';
  },
  async refresh(city) {
    if (!this.supports(city)) {
      return { ok: false, err: 'TranStar only supports Houston', at: Date.now(), flows: new Map(), incidents: [] };
    }
    /* Phase 2: move fetchTranStarRss / applyTranStarTravelTimes / indexTranStarCorridorTimes here.
       For now, signal that the classic app.html poller remains authoritative. */
    return {
      ok: !!(typeof window !== 'undefined' && window.LIVE_TRAFFIC && window.LIVE_TRAFFIC.ok),
      src: 'transtar-delegated',
      at: Date.now(),
      flows: new Map(),
      incidents: [],
    };
  },
};

/**
 * Optional: pull a refresh through the adapter API (no-op merge today).
 * @param {import('../cities/types.js').CityManifest} city
 */
export async function refreshTranstarViaAdapter(city) {
  const snap = await transtarAdapter.refresh(city);
  applyLiveTrafficSnapshot(snap);
  return snap;
}

export default transtarAdapter;
