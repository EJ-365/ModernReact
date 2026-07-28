/**
 * City pack registry — resolve active metro without forking app-main.
 */
import { houstonManifest } from './houston/manifest.js';
import { austinManifest } from './austin/manifest.js';
import { sanantonioManifest } from './sanantonio/manifest.js';
import { dallasManifest } from './dallas/manifest.js';
import { losangelesManifest } from './losangeles/manifest.js';
import { newyorkManifest } from './newyork/manifest.js';
import { bostonManifest } from './boston/manifest.js';
import { chicagoManifest } from './chicago/manifest.js';
import { miamiManifest } from './miami/manifest.js';
import { seattleManifest } from './seattle/manifest.js';
import { denverManifest } from './denver/manifest.js';
import { atlantaManifest } from './atlanta/manifest.js';
import { phoenixManifest } from './phoenix/manifest.js';
import { philadelphiaManifest } from './philadelphia/manifest.js';
import { minneapolisManifest } from './minneapolis/manifest.js';
import { neworleansManifest } from './neworleans/manifest.js';
import { isCityManifest, CITY_IDS as TYPE_CITY_IDS } from './types.js';

/** @type {Record<string, import('./types.js').CityManifest>} */
export const CITY_PACKS = Object.freeze({
  houston: houstonManifest,
  austin: austinManifest,
  sanantonio: sanantonioManifest,
  dallas: dallasManifest,
  losangeles: losangelesManifest,
  newyork: newyorkManifest,
  boston: bostonManifest,
  chicago: chicagoManifest,
  miami: miamiManifest,
  seattle: seattleManifest,
  denver: denverManifest,
  atlanta: atlantaManifest,
  phoenix: phoenixManifest,
  philadelphia: philadelphiaManifest,
  minneapolis: minneapolisManifest,
  neworleans: neworleansManifest,
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
    if (q && CITY_PACKS[String(q).toLowerCase()]) {
      const id = String(q).toLowerCase();
      try { window.localStorage.setItem('hts-city', id); } catch { /* ignore */ }
      return id;
    }
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
