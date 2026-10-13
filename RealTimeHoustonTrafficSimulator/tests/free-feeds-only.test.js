import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(join(root, p), 'utf8');

test('FlightAware proxies have been removed', () => {
  const netlifyPath = join(root, 'netlify/functions/flightaware.mjs');
  const vercelPath = join(root, 'api/flightaware/[...path].mjs');
  // Files should no longer exist since we switched to airplanes.live
  assert.equal(existsSync(netlifyPath), false, 'FlightAware Netlify function should be removed');
  assert.equal(existsSync(vercelPath), false, 'FlightAware Vercel proxy should be removed');
  // But vite.config should not have FlightAware middleware anymore
  const vite = read('vite.config.js');
  assert.equal(/\/api\/flightaware/.test(vite), false, 'FlightAware API path should be removed from vite config');
});

test('TomTom proxies stay hard-disabled', () => {
  const netlify = read('netlify/functions/tomtom.mjs');
  const vercel = read('api/tomtom/[...path].mjs');
  const vite = read('vite.config.js');
  const vercelJson = read('vercel.json');
  assert.match(netlify, /tomtom_disabled/);
  assert.match(vercel, /tomtom_disabled/);
  assert.match(vite, /tomtom_disabled/);
  assert.equal(/api\.tomtom\.com/.test(netlify), false);
  assert.equal(/api\.tomtom\.com/.test(vercel), false);
  assert.equal(/api\.tomtom\.com/.test(vite), false);
  assert.equal(/api\.tomtom\.com/.test(vercelJson), false);
});

test('app-main uses free feeds only', () => {
  const main = read('src/app-main.js');
  // Should use airplanes.live for tracking
  assert.match(main, /airplanes\.live/);
  // Should not have FlightAware AeroAPI enabled
  assert.equal(/HTS_FLIGHTAWARE_ENABLED\s*=\s*true/.test(main), false);
  // TomTom should remain disabled
  assert.match(main, /throw new Error\('tomtom_disabled'\)/);
  assert.equal(/https:\/\/api\.tomtom\.com/.test(main), false);
  assert.equal(/aeroapi\.flightaware\.com/.test(main), false);
});

test('env example does not instruct setting paid keys', () => {
  const ex = read('.env.example');
  assert.match(ex, /PAID APIs|DISABLED|billing/i);
  assert.match(ex, /# TOMTOM_API_KEY=/);
});

test('live-flight HUD source line does not throw leftover FlightAware fa flag', () => {
  const main = read('src/app-main.js');
  const marker = 'in sky + panel';
  const idx = main.indexOf(marker);
  assert.ok(idx > 0, 'expected live-flight HUD source label');
  const assign = main.lastIndexOf('flSrc.textContent=', idx);
  const end = main.indexOf(';', idx);
  assert.ok(assign >= 0 && end > assign, 'expected flSrc.textContent assignment');
  const expr = main.slice(assign + 'flSrc.textContent='.length, end);
  assert.equal(/\bfa\b/.test(expr), false, 'undefined fa would ReferenceError in updateHUD once live aircraft appear');
  const fn = new Function('list', 'CITY_NAME', 'src', 'houN', `'use strict'; return (${expr});`);
  const text = fn([{ _houston: true }], 'Houston', 'ADS-B', 1);
  assert.equal(text, '· 1 in sky + panel · 1 Houston-verified · ADS-B');
});
