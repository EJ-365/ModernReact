/**
 * Corridor ETA sanity — physics floors + TranStar pad.
 * Pure functions; no DOM / road graph.
 */
import { clamp } from './math.js';

/**
 * @typedef {Object} CorridorLike
 * @property {number} [realMi]
 * @property {number} [miles]
 * @property {number} [typMin]
 * @property {number} [baseMin]
 * @property {number} [minMin]
 * @property {number} [maxMin]
 * @property {number} [tsPadMin]
 * @property {boolean} [toDt]
 */

/**
 * @param {CorridorLike} c
 */
export function corridorDriveMiles(c) {
  if (c.toDt && c.realMi) return c.realMi;
  const anchor = c.realMi || c.miles || 20;
  const mi = c.miles || anchor;
  return mi < anchor * 0.72 ? anchor : mi;
}

/**
 * @param {CorridorLike} c
 */
export function corridorAbsMinMinutes(c) {
  const mi = corridorDriveMiles(c);
  const maxAvgMph = c.toDt ? 62 : 70;
  return Math.max(8, Math.ceil((mi / maxAvgMph) * 60));
}

/**
 * @param {CorridorLike} c
 * @param {number} mins
 * @returns {number|null}
 */
export function saneCorridorMinutes(c, mins) {
  const usual = c.typMin || c.baseMin || c.realMi || 20;
  if (!(mins > 0)) return null;
  const abs = corridorAbsMinMinutes(c);
  const lo = Math.max(abs, c.minMin != null ? c.minMin : Math.round(usual * 0.72));
  const hi = c.maxMin != null ? c.maxMin : Math.round(usual * 2.6);
  if (mins < lo || mins > hi) return null;
  return Math.round(mins);
}

/**
 * @param {CorridorLike} c
 * @param {number} mins
 */
export function clampCorridorMinutes(c, mins) {
  const usual = c.typMin || c.baseMin || c.realMi || 20;
  const abs = corridorAbsMinMinutes(c);
  const lo = Math.max(abs, c.minMin != null ? c.minMin : Math.round(usual * 0.85));
  const hi = c.maxMin != null ? c.maxMin : Math.round(usual * 2.4);
  return clamp(Math.round(mins > 0 ? mins : usual), lo, hi);
}

/**
 * @param {CorridorLike} c
 * @param {number} mins
 */
export function applyCorridorPad(c, mins) {
  return (mins > 0 ? mins : 0) + (c.tsPadMin || 0);
}
