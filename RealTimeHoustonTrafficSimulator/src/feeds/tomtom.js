/**
 * Shared TomTom traffic adapter (fallback for Houston; primary for future cities).
 * Full poll still in app-main.js — this documents the boundary.
 */
import { applyLiveTrafficSnapshot } from './types.js';

/** @type {import('./types.js').LiveTrafficAdapter} */
export const tomtomAdapter = {
  id: 'tomtom',
  label: 'TomTom Traffic',
  supports(city) {
    return !!(city && city.feeds && (city.feeds.tomtomFallback || city.feeds.primaryTraffic === 'tomtom'));
  },
  async refresh(city) {
    if (!this.supports(city)) {
      return {
        ok: false,
        err: 'TomTom not configured for city',
        at: Date.now(),
        flows: new Map(),
        incidents: [],
      };
    }
    return {
      ok: !!(typeof window !== 'undefined' && window.LIVE_TRAFFIC && window.LIVE_TRAFFIC.tomtom),
      src: 'tomtom-delegated',
      at: Date.now(),
      flows: new Map(),
      incidents: [],
    };
  },
};

/**
 * @param {import('../cities/types.js').CityManifest} city
 */
export async function refreshTomtomViaAdapter(city) {
  const snap = await tomtomAdapter.refresh(city);
  applyLiveTrafficSnapshot(snap);
  return snap;
}

export default tomtomAdapter;
