import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(join(root, p), 'utf8');

test('FlightAware proxies stay hard-disabled', () => {
  const netlify = read('netlify/functions/flightaware.mjs');
  const vercel = read('api/flightaware/[...path].mjs');
  const vite = read('vite.config.js');
  assert.match(netlify, /flightaware_disabled/);
  assert.match(vercel, /flightaware_disabled/);
  assert.match(vite, /flightaware_disabled/);
  assert.equal(/aeroapi\.flightaware\.com/.test(netlify), false);
  assert.equal(/aeroapi\.flightaware\.com/.test(vercel), false);
  assert.equal(/aeroapi\.flightaware\.com/.test(vite), false);
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

test('app-main never enables paid FA/TomTom calls', () => {
  const main = read('src/app-main.js');
  assert.match(main, /HTS_PAID_APIS_DISABLED\s*=\s*true/);
  assert.match(main, /HTS_FLIGHTAWARE_ENABLED\s*=\s*false/);
  assert.match(main, /throw new Error\('tomtom_disabled'\)/);
  assert.match(main, /async function fetchAeroAPI[\s\S]*?return null;/);
  assert.equal(/https:\/\/api\.tomtom\.com/.test(main), false);
  assert.equal(/aeroapi\.flightaware\.com/.test(main), false);
});

test('env example does not instruct setting paid keys', () => {
  const ex = read('.env.example');
  assert.match(ex, /PAID APIs|DISABLED|billing/i);
  assert.match(ex, /# FLIGHTAWARE_API_KEY=/);
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
