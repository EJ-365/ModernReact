/**
 * City pack registry — resolve active metro without forking app-main.
 */
import { houstonManifest } from './houston/manifest.js';
import { austinManifest } from './austin/manifest.js';
import { isCityManifest, CITY_IDS as TYPE_CITY_IDS } from './types.js';

/** @type {Record<string, import('./types.js').CityManifest>} */
export const CITY_PACKS = Object.freeze({
  houston: houstonManifest,
  austin: austinManifest,
});

export const CITY_IDS = TYPE_CITY_IDS;

/**
 * @param {string} [id]
 * @returns {import('./types.js').CityManifest}
 */
export function resolveCity(id) {
  const key = String(id || 'houston').toLowerCase();
  const pack = CITY_PACKS[key] || houstonManifest;
  return isCityManifest(pack) ? pack : houstonManifest;
}

/**
 * Browser: ?city=austin or localStorage `hts-city`. Default Houston.
 * @returns {string}
 */
export function activeCityId() {
  if (typeof window === 'undefined') return 'houston';
  try {
    const q = new URLSearchParams(window.location.search).get('city');
    if (q && CITY_PACKS[String(q).toLowerCase()]) return String(q).toLowerCase();
    const stored = window.localStorage.getItem('hts-city');
    if (stored && CITY_PACKS[String(stored).toLowerCase()]) return String(stored).toLowerCase();
  } catch {
    /* ignore */
  }
  return 'houston';
}

/**
 * @returns {import('./types.js').CityManifest}
 */
export function activeCity() {
  return resolveCity(activeCityId());
}
