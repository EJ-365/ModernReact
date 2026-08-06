/**
 * Shared numeric helpers for core modules (no DOM).
 * @param {number} v
 * @param {number} a
 * @param {number} b
 */
export function clamp(v, a, b) {
  return v < a ? a : v > b ? b : v;
}
