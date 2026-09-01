/**
 * Loads the active city pack + core helpers onto window for the classic app.html script.
 * Default city remains Houston; other metros via ?city=<id> (lat/lng content packs).
 */
import { activeCity, activeCityId, CITY_IDS, CITY_PACKS } from './cities/registry.js';
import { isCityManifest } from './cities/types.js';
import { preferredBoardAirport } from './cities/airport-set.js';
import { buildAustinRuntimePack } from './cities/austin/runtime.js';
import { buildSanAntonioRuntimePack } from './cities/sanantonio/runtime.js';
import { buildDallasRuntimePack } from './cities/dallas/runtime.js';
import { buildLosAngelesRuntimePack } from './cities/losangeles/runtime.js';
import { buildNewYorkRuntimePack } from './cities/newyork/runtime.js';
import { buildBostonRuntimePack } from './cities/boston/runtime.js';
import { buildChicagoRuntimePack } from './cities/chicago/runtime.js';
import { buildMiamiRuntimePack } from './cities/miami/runtime.js';
import { buildSeattleRuntimePack } from './cities/seattle/runtime.js';
import { buildDenverRuntimePack } from './cities/denver/runtime.js';
import { buildAtlantaRuntimePack } from './cities/atlanta/runtime.js';
import { buildPhoenixRuntimePack } from './cities/phoenix/runtime.js';
import { buildPhiladelphiaRuntimePack } from './cities/philadelphia/runtime.js';
import { buildMinneapolisRuntimePack } from './cities/minneapolis/runtime.js';
import { buildNewOrleansRuntimePack } from './cities/neworleans/runtime.js';
import { transtarAdapter } from './feeds/transtar.js';
import { tomtomAdapter } from './feeds/tomtom.js';
import * as core from './core/index.js';

const PACK_BUILDERS = {
  austin: buildAustinRuntimePack,
  sanantonio: buildSanAntonioRuntimePack,
  dallas: buildDallasRuntimePack,
  losangeles: buildLosAngelesRuntimePack,
  newyork: buildNewYorkRuntimePack,
  boston: buildBostonRuntimePack,
  chicago: buildChicagoRuntimePack,
  miami: buildMiamiRuntimePack,
  seattle: buildSeattleRuntimePack,
  denver: buildDenverRuntimePack,
  atlanta: buildAtlantaRuntimePack,
  phoenix: buildPhoenixRuntimePack,
  philadelphia: buildPhiladelphiaRuntimePack,
  minneapolis: buildMinneapolisRuntimePack,
  neworleans: buildNewOrleansRuntimePack,
};

const city = activeCity();

if (!isCityManifest(city)) {
  console.error('[HTS] Invalid city manifest');
} else {
  const geo = core.makeGeo(city.origin);
  window.HTS_CITY = city;
  window.HTS_CITIES = CITY_PACKS;
  window.HTS_CITY_IDS = CITY_IDS;
  window.HTS_FEEDS = {
    transtar: transtarAdapter,
    tomtom: tomtomAdapter,
    primary:
      city.feeds.primaryTraffic === 'tomtom' ? tomtomAdapter : transtarAdapter,
  };
  window.HTS_CORE = {
    clamp: core.clamp,
    geoToWorld: (lat, lng) => geo.geoToWorld(lat, lng),
    worldToGeo: (x, z) => geo.worldToGeo(x, z),
    unitsPerMile: geo.unitsPerMile,
    chicagoParts: (d) =>
      core.chicagoParts(d, city.feeds.timezone || 'America/Chicago'),
    partsToHourWeekend: core.partsToHourWeekend,
    corridorDriveMiles: core.corridorDriveMiles,
    corridorAbsMinMinutes: core.corridorAbsMinMinutes,
    saneCorridorMinutes: core.saneCorridorMinutes,
    clampCorridorMinutes: core.clampCorridorMinutes,
    applyCorridorPad: core.applyCorridorPad,
    createCityClock: core.createCityClock,
  };

  /** @type {any} */
  let pack = null;
  const buildPack = PACK_BUILDERS[city.id];
  if (typeof buildPack === 'function') {
    pack = buildPack(geo);
  } else {
    pack = {
      id: 'houston',
      useBuiltinRoads: true,
      skipOsmLod: false,
      skipOsmCorridors: false,
      slogan: 'Space City · Texas',
      loadingSub: 'Paving 700 sq mi of freeway…',
      wxPlace: 'Houston · Downtown',
      metroName: 'Greater Houston',
      areaName: 'Houston-area',
      nws: {
        counties:
          /\b(Harris|Fort Bend|Montgomery|Brazoria|Galveston|Chambers|Liberty|Waller|Austin|San Jacinto)\b/i,
        places:
          /Houston|Galveston Bay|Clear Lake|The Woodlands|Woodlands|Sugar Land|Katy|Brazoria|Conroe|Pearland|Pasadena|Baytown|Cypress|Spring|League City|Humble|Kingwood|Missouri City|Stafford|Richmond|Rosenberg|Fulshear|Tomball|Jersey Village|Alief|Bellaire|West University|Heights|Montrose|Midtown|Galleria|Energy Corridor|Medical Center|Hobby|Intercontinental|IAH/i,
        foot: 'Official NWS alerts for Houston-area counties',
        empty: 'No active NWS warnings for the Houston metro.',
      },
    };
  }
  window.HTS_PACK = pack;

  window.HTS_PLATFORM = {
    version: 'transition-3',
    cityId: city.id,
    activeCityId: activeCityId(),
    phase: city.id === 'houston' ? 2 : 3,
  };
  applyCityChrome(city, pack);
  if (pack && pack.jumpGroups) applyJumpSelect(pack);
  if (pack && pack.boardApts) applyBoardChrome(pack);
  if (pack && pack.shields) applyShields(pack);
  console.log(
    '%cHTS platform · city=' +
      city.id +
      ' · feed=' +
      city.feeds.primaryTraffic +
      ' · phase ' +
      window.HTS_PLATFORM.phase,
    'color:#7fd6a0',
  );
}

/**
 * @param {import('./cities/types.js').CityManifest} city
 * @param {any} pack
 */
function applyCityChrome(city, pack) {
  if (typeof document === 'undefined') return;
  const name = city.name || 'Houston';
  const slogan = (pack && pack.slogan) || 'Space City · Texas';
  document.title = name + ' Traffic Simulator · 3D Live';
  const h1 = document.querySelector('#sign h1');
  if (h1) h1.innerHTML = name + '<br>Traffic Simulator';
  const sub = document.querySelector('#sign .sub');
  if (sub) {
    const vtag = document.getElementById('vtag');
    const badge = vtag ? vtag.outerHTML : '';
    sub.innerHTML = slogan + ' · Live conditions ' + badge;
  }
  const wx = document.getElementById('wxPlace');
  if (wx) wx.textContent = (pack && pack.wxPlace) || name + ' · Downtown';
  /* Loading screen is city-agnostic — do not rewrite Houston→Austin mid-boot */
  const wa = document.getElementById('waDist');
  if (wa) {
    wa.textContent =
      (pack && pack.metroName) ||
      (city.id === 'houston' ? 'Greater Houston' : 'Greater ' + name);
  }
  try {
    document.documentElement.dataset.city = city.id || 'houston';
    if (document.body) document.body.classList.add('city-' + (city.id || 'houston'));
  } catch (_) {}
  const meta = document.querySelector('meta[name="description"]');
  if (meta) {
    meta.setAttribute(
      'content',
      'Live 3D ' +
        name +
        ' metro simulator: traffic, weather, flights, hazard predictions. Created by Ejay Gabriel.',
    );
  }
  const hud = document.getElementById('mHudDesc');
  if (hud) hud.textContent = name;
  const wr = document.getElementById('wrSub');
  if (wr) wr.textContent = name + ' metro · NWS';
  const tod = document.getElementById('todSelect');
  if (tod && pack && pack.liveTimeLabel) {
    const liveOpt = tod.querySelector('option[value="live"]');
    if (liveOpt) liveOpt.textContent = '● ' + pack.liveTimeLabel;
  }
  const hint = document.getElementById('timeHint');
  if (hint && pack && pack.timeHint) hint.textContent = pack.timeHint;
  const flEmpty = document.getElementById('flEmpty');
  if (flEmpty && pack && pack.flightsEmpty) flEmpty.textContent = pack.flightsEmpty;
  const boardSub = document.querySelector('#tourBoardGrp .sublabel');
  if (boardSub && pack && pack.boardSublabel) boardSub.textContent = pack.boardSublabel;
}

/** @param {any} pack */
function applyJumpSelect(pack) {
  const sel = document.getElementById('locSelect');
  if (!sel || !pack.jumpGroups) return;
  const parts = ['<option value="city" selected>Full metro view</option>'];
  for (const g of pack.jumpGroups) {
    parts.push('<optgroup label="' + esc(g.label) + '">');
    for (const [val, label] of g.options) {
      parts.push(
        '<option value="' + esc(val) + '">' + esc(label) + '</option>',
      );
    }
    parts.push('</optgroup>');
  }
  if (pack.freewayJumpLabel) {
    parts.push(
      '<option value="freeway">' + esc(pack.freewayJumpLabel) + '</option>',
    );
  }
  sel.innerHTML = parts.join('');
}

/** @param {any} pack */
function applyBoardChrome(pack) {
  const row = document.getElementById('boardAptBtns');
  if (!row || !pack.boardApts || !pack.boardApts.length) return;
  const preferred = Array.isArray(window.HTS_CITY && window.HTS_CITY.airportCodes)
    ? window.HTS_CITY.airportCodes
    : [];
  const order = [...new Set([...preferred, ...pack.boardApts.filter((code) => !preferred.includes(code))])];
  const first = preferredBoardAirport(window.HTS_CITY, pack, order);
  const selectedIndex = order.indexOf(first);
  const ordered = selectedIndex > 0 ? [order[selectedIndex], ...order.slice(0, selectedIndex), ...order.slice(selectedIndex + 1)] : order;
  row.innerHTML = ordered
    .map((code, i) => {
      const on = i === 0 ? ' on' : '';
      return (
        '<button class="btn' +
        on +
        '" data-apt="' +
        esc(code) +
        '">' +
        esc(code) +
        '</button>'
      );
    })
    .join('');
}

/** @param {any} pack */
function applyShields(pack) {
  const row = document.querySelector('.shields');
  if (!row || !pack.shields || !pack.shields.length) return;
  row.innerHTML = pack.shields
    .map((s) => {
      const cls = s.us ? 'shield small us' : s.small ? 'shield small' : 'shield';
      const svg = s.us
        ? '<svg viewBox="0 0 34 30"><path d="M6 2 C11 5 23 5 28 2 C32 6 33 13 30 19 C27 25 21 29 17 29 C13 29 7 25 4 19 C1 13 2 6 6 2 Z" fill="#fff" stroke="#111" stroke-width="1.8"/></svg>'
        : s.circle
          ? '<svg viewBox="0 0 34 30"><circle cx="17" cy="15" r="13.4" fill="#26417a" stroke="#fff" stroke-width="1.8"/></svg>'
          : '<svg viewBox="0 0 34 30"><path d="M17 1 C12 4 6 4.6 1.5 4.2 C1.5 16 6 25 17 29 C28 25 32.5 16 32.5 4.2 C28 4.6 22 4 17 1 Z" fill="#003f87" stroke="#fff" stroke-width="1.6"/><path d="M2 4.4 L32 4.4 L32 9.5 L2 9.5 Z" fill="#c8102e"/></svg>';
      return (
        '<div class="' +
        cls +
        '">' +
        svg +
        '<span' +
        (s.circle ? ' style="padding-top:0"' : '') +
        '>' +
        esc(s.label) +
        '</span></div>'
      );
    })
    .join('');
}

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/"/g, '&quot;');
}
