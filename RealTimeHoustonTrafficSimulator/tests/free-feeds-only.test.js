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

test('trafficPrimary does not remap TomTom metros onto Houston TranStar', () => {
  const main = read('src/app-main.js');
  /* Regression: v10.16.62 remapped tomtom→transtar, so San Antonio/Dallas/LA
     pulled Houston RSS and painted shared road ids (i10/i45). */
  assert.equal(/raw===['"]tomtom['"]\s*\?\s*['"]transtar['"]/.test(main), false);
  assert.match(main, /if\s*\(\s*raw===['"]tomtom['"]\s*\)\s*return\s*['"]none['"]/);
  assert.match(
    main,
    /raw===['"]transtar['"]\s*&&\s*city\s*&&\s*city\.id\s*&&\s*city\.id\s*!==\s*['"]houston['"]\s*\)\s*return\s*['"]none['"]/,
  );
});
