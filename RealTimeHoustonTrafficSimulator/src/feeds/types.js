/**
 * Live traffic feed adapter contract.
 * Implementations refresh into the shared LIVE_TRAFFIC shape used by app.html.
 */

/**
 * @typedef {Object} LiveFlowSample
 * @property {number} cur          // mph
 * @property {number} ff           // free-flow mph
 * @property {number} [ratio]
 * @property {number} cong         // 0..1
 * @property {number} at           // Date.now()
 * @property {string} src
 */

/**
 * @typedef {Object} LiveCorridorTime
 * @property {number} mins
 * @property {number} at
 * @property {string} src
 * @property {string} [title]
 * @property {number} [miles]
 */

/**
 * @typedef {Object} LiveTrafficSnapshot
 * @property {Map<string, LiveFlowSample>} flows
 * @property {Array<Object>} incidents
 * @property {Map<string, LiveCorridorTime>} [corridorTimes]
 * @property {boolean} ok
 * @property {string} [src]
 * @property {string} [err]
 * @property {number} at
 */

/**
 * @typedef {Object} LiveTrafficAdapter
 * @property {string} id
 * @property {string} label
 * @property {(city: import('../cities/types.js').CityManifest) => boolean} supports
 * @property {(city: import('../cities/types.js').CityManifest) => Promise<Partial<LiveTrafficSnapshot>>} refresh
 */

/**
 * Merge adapter output into window.LIVE_TRAFFIC (shared store).
 * @param {Partial<LiveTrafficSnapshot>} snap
 */
export function applyLiveTrafficSnapshot(snap) {
  if (typeof window === 'undefined') return;
  if (!window.LIVE_TRAFFIC) {
    window.LIVE_TRAFFIC = {
      flows: new Map(),
      incidents: [],
      corridorTimes: new Map(),
      ok: false,
      at: 0,
      src: '',
      err: '',
    };
  }
  const lt = window.LIVE_TRAFFIC;
  if (snap.flows) {
    for (const [k, v] of snap.flows) lt.flows.set(k, v);
  }
  if (Array.isArray(snap.incidents)) lt.incidents = snap.incidents;
  if (snap.corridorTimes) {
    if (!lt.corridorTimes) lt.corridorTimes = new Map();
    for (const [k, v] of snap.corridorTimes) lt.corridorTimes.set(k, v);
  }
  if (snap.ok != null) lt.ok = snap.ok;
  if (snap.src) lt.src = snap.src;
  if (snap.err != null) lt.err = snap.err;
  lt.at = snap.at || Date.now();
}
