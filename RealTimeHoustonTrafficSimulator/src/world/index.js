/**
 * World mode: one globe with every catalog city. Zoom into a city for its OSM 3D core,
 * live weather (Open-Meteo) and live aircraft (airplanes.live / adsb.lol), fly airport to
 * airport on great circles, and drive in the Americas. Houston keeps its full simulator.
 * Loaded on demand — no cost to the Houston start-up.
 */
import * as THREE from 'three';
import catalog from './catalog.json';
import { createGlobe, gcDist, gcLerp, bearing, llToVec } from './globe.js';
import { createCityScene } from './city-scene.js';
import { Takeoff, Approach, Cruise, planeCam } from './flight.js';
import { Drive } from './drive.js';
import { WORLD_AIRCRAFT, airliner } from './models.js';
import { dashSvg, updateDash } from '../cockpit-dash.js';

const CITIES = catalog.cities;
const byId = Object.fromEntries(CITIES.map((c) => [c.id, c]));
const mobile = matchMedia('(pointer:coarse)').matches || innerWidth < 820;
const WX = {
  0: 'Clear', 1: 'Mostly clear', 2: 'Partly cloudy', 3: 'Overcast', 45: 'Fog', 48: 'Fog', 51: 'Drizzle', 53: 'Drizzle', 55: 'Drizzle',
  56: 'Freezing drizzle', 57: 'Freezing drizzle', 61: 'Light rain', 63: 'Rain', 65: 'Heavy rain', 66: 'Freezing rain', 67: 'Freezing rain',
  71: 'Light snow', 73: 'Snow', 75: 'Heavy snow', 77: 'Snow grains', 80: 'Showers', 81: 'Showers', 82: 'Heavy showers', 85: 'Snow showers',
  86: 'Snow showers', 95: 'Thunderstorm', 96: 'Thunderstorm, hail', 99: 'Thunderstorm, hail',
};
const usesF = (c) => c.country === 'United States';

const CSS = `
#wRoot{position:fixed;inset:0;z-index:10;display:none;pointer-events:none;font:14px/1.35 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#e8edf2;user-select:none;-webkit-user-select:none}
#wRoot>*{pointer-events:auto}
body.hts-world #incidentPanel,body.hts-world #panel,body.hts-world #leftCol,body.hts-world #legend,body.hts-world #stats,body.hts-world #drivetimes,body.hts-world #whereami,body.hts-world #poiCard,body.hts-world #tip,body.hts-world #followChip,body.hts-world #vignette,body.hts-world #mHud,body.hts-world #houPlaces,body.hts-world #worldWrap,body.hts-world #tollWrap,body.hts-world #ambWrap,body.hts-world #locBtn,body.hts-world #camhint,body.hts-world .panelCollapseBtn{display:none!important}
body.hts-world .railToggle,body.hts-world #bottomDock{display:none!important}
#wCard .wAcc{cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:8px}
#wCard .wChev{font-size:13px;opacity:.7;transition:transform .2s}
#wCard.wMin .wChev{transform:rotate(-90deg)}
#wCard.wMin .wBody{display:none}
.wHide{display:none!important}
#wLabels{position:absolute;inset:0;pointer-events:none;overflow:hidden}
.wcity{position:absolute;left:0;top:0;pointer-events:auto;display:flex;align-items:center;gap:5px;padding:2px 7px 2px 4px;border-radius:12px;border:0;background:rgba(8,14,24,.62);color:#e8edf2;font:600 12px system-ui,sans-serif;cursor:pointer;white-space:nowrap;transform:translate(-6px,-50%);backdrop-filter:blur(3px)}
.wcity i{width:8px;height:8px;border-radius:50%;background:#7fd3ff;box-shadow:0 0 0 2px rgba(127,211,255,.3);flex:none}
.wcity.hou{z-index:2;background:rgba(40,28,8,.78)}
.wcity.hou i{background:#ffb347;box-shadow:0 0 0 3px rgba(255,179,71,.35)}
.wcity.nodrive i{background:#b7c4ff}
.wcity small{font-weight:500;opacity:.75}
.wcity:hover,.wcity:focus-visible{background:rgba(30,60,96,.9);outline:none}
.wbar{position:absolute;top:10px;left:10px;right:10px;display:flex;gap:8px;align-items:flex-start;pointer-events:none}
.wbar>*{pointer-events:auto}
.wbtn{border:0;border-radius:10px;background:rgba(14,22,34,.86);color:#e8edf2;padding:8px 12px;font:600 13px system-ui,sans-serif;cursor:pointer;box-shadow:0 2px 10px rgba(0,0,0,.35)}
.wbtn:hover{background:rgba(32,52,80,.95)}.wbtn:disabled{opacity:.45;cursor:default}
.wbtn.pri{background:#2c7be5}.wbtn.pri:hover{background:#3b8af0}
#wSearchBox{position:relative;flex:0 1 300px}
#wSearch{width:100%;box-sizing:border-box;border:0;border-radius:10px;background:rgba(14,22,34,.86);color:#e8edf2;padding:9px 12px;font:14px system-ui,sans-serif;outline:none}
#wSearch:focus{box-shadow:0 0 0 2px #2c7be5}
#wResults{position:absolute;top:40px;left:0;right:0;max-height:50vh;overflow:auto;background:rgba(10,16,26,.96);border-radius:10px;display:none;padding:4px 0}
#wResults div{padding:6px 12px;cursor:pointer;display:flex;justify-content:space-between;gap:8px}
#wResults div.on,#wResults div:hover{background:#1f3f66}
#wResults span{opacity:.65;font-size:12px}
#wTitle{margin-left:auto;text-align:right;text-shadow:0 1px 4px #000;font-weight:600}
#wTitle small{display:block;font-weight:400;opacity:.75}
#wCard{position:absolute;right:10px;bottom:12px;width:min(330px,calc(100vw - 20px));background:rgba(10,16,26,.9);border-radius:14px;padding:12px 14px;display:none;box-shadow:0 6px 24px rgba(0,0,0,.45)}
#wCard h3{margin:0 0 2px;font-size:17px}#wCard .sub{opacity:.7;font-size:12px;margin-bottom:8px}
#wCard .row{display:flex;justify-content:space-between;padding:3px 0;border-top:1px solid rgba(255,255,255,.06);font-size:13px}
#wCard .row b{font-weight:600}
#wCard .acts{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}
#wFly{margin-top:8px;display:none}
#wFly select{width:100%;margin:4px 0;padding:7px;border-radius:8px;background:#141e2c;color:#e8edf2;border:1px solid #2a3a50;font:13px system-ui,sans-serif}
#wHud{position:absolute;left:50%;top:58px;transform:translateX(-50%);background:rgba(10,16,26,.82);border-radius:12px;padding:8px 14px;display:none;text-align:center;font-variant-numeric:tabular-nums;max-width:calc(100vw - 20px)}
#wHud b{font-size:15px}#wHud .k{opacity:.7;font-size:12px}
#wHud .acts{margin-top:6px;display:flex;gap:6px;justify-content:center;flex-wrap:wrap}
#wLoad{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);background:rgba(10,16,26,.9);padding:14px 20px;border-radius:12px;display:none;text-align:center}
#wLoad .bar{width:220px;height:4px;background:#22324a;border-radius:2px;margin-top:8px;overflow:hidden}#wLoad .bar i{display:block;height:100%;width:0;background:#2c7be5;transition:width .3s}
#wToast{position:absolute;left:50%;bottom:16px;transform:translateX(-50%);background:rgba(10,16,26,.92);padding:8px 14px;border-radius:10px;display:none;max-width:90vw;text-align:center}
#wHelp{position:absolute;left:10px;bottom:12px;font-size:11px;opacity:.6;text-shadow:0 1px 3px #000;pointer-events:none;max-width:50vw}
#wDash{position:absolute;left:0;right:0;bottom:0;height:min(40vh,360px);display:none;pointer-events:none}#wDash svg{width:100%;height:100%}
#wAttr{position:absolute;right:10px;top:54px;font-size:10px;opacity:.55;text-shadow:0 1px 3px #000;pointer-events:none}
@media (max-width:640px){#wTitle{display:none}#wCard{left:10px;right:10px;width:auto;bottom:10px}#wHelp{display:none}.wcity{font-size:11px}}
`;

let root, canvas, renderer, globe, land, labels = {}, active = false, raf = 0, last = 0;
let mode = 'globe', city = null, cs = null, focusCity = byId.houston, flight = null, drive = null, camView = 'chase';
let weather = {}, wxAt = 0, traffic = [], trafficFor = null, trafficAt = 0, trafficBusy = false;
const orbit = { tx: 0, tz: 0, r: 4200, theta: 0.6, phi: 0.95, goal: null };
let ui = {};
const seenAir = {};
const SIM_ROUTES = [];
for (let i = 0; i < CITIES.length; i++) for (let j = i + 1; j < CITIES.length; j++) {
  const a = CITIES[i].apt, b = CITIES[j].apt, km = gcDist(a, b);
  if (((i * 31 + j * 17) % 7) !== 0 && !CITIES[i].full) continue; /* Houston links everywhere, others a sample */
  SIM_ROUTES.push({ a, b, km, off: (i * 7919 + j * 104729) % 9e6 });
  SIM_ROUTES.push({ a: b, b: a, km, off: (j * 7919 + i * 104729) % 9e6 });
}

function el(tag, attrs, html) { const e = document.createElement(tag); if (attrs) for (const k in attrs) e.setAttribute(k, attrs[k]); if (html != null) e.innerHTML = html; return e; }
function toast(msg, ms = 3200) { ui.toast.textContent = msg; ui.toast.style.display = 'block'; clearTimeout(toast._t); toast._t = setTimeout(() => { ui.toast.style.display = 'none'; }, ms); }
function localTime(c) {
  try { return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', weekday: 'short', timeZone: c.tz }).format(new Date()); } catch (e) { return ''; }
}
function tempStr(c, w) { if (!w) return ''; const f = Math.round(w.temp * 9 / 5 + 32), cc = Math.round(w.temp); return usesF(c) ? f + '°F' : cc + '°C'; }

function buildDom() {
  const st = el('style'); st.textContent = CSS; document.head.appendChild(st);
  root = el('div', { id: 'wRoot', role: 'application', 'aria-label': 'World map' });
  ui.labels = el('div', { id: 'wLabels' }); root.appendChild(ui.labels);
  const bar = el('div', { class: 'wbar' });
  ui.back = el('button', { class: 'wbtn', type: 'button', title: 'Back (Esc)' }, '← Houston');
  ui.globeBtn = el('button', { class: 'wbtn', type: 'button', title: 'Back to the globe' }, 'Globe');
  const sb = el('div', { id: 'wSearchBox' });
  ui.search = el('input', { id: 'wSearch', type: 'search', placeholder: 'Search cities  ( / )', autocomplete: 'off', 'aria-label': 'Search cities' });
  ui.results = el('div', { id: 'wResults', role: 'listbox' });
  sb.append(ui.search, ui.results);
  ui.title = el('div', { id: 'wTitle' });
  bar.append(ui.back, ui.globeBtn, sb, ui.title); root.appendChild(bar);
  ui.card = el('div', { id: 'wCard' }); root.appendChild(ui.card);
  ui.hud = el('div', { id: 'wHud' }); root.appendChild(ui.hud);
  ui.load = el('div', { id: 'wLoad' }, '<div id="wLoadT">Loading…</div><div class="bar"><i></i></div>'); root.appendChild(ui.load);
  ui.toast = el('div', { id: 'wToast' }); root.appendChild(ui.toast);
  ui.dash = el('div', { id: 'wDash' }, dashSvg('jet')); root.appendChild(ui.dash);
  ui.help = el('div', { id: 'wHelp' }); root.appendChild(ui.help);
  root.appendChild(el('div', { id: 'wAttr' }, '© OpenStreetMap contributors · Natural Earth · Open-Meteo · airplanes.live / adsb.lol'));
  document.body.appendChild(root);
  for (const c of CITIES) {
    const b = el('button', { class: 'wcity' + (c.full ? ' hou' : '') + (c.drive ? '' : ' nodrive'), type: 'button', title: c.name + ', ' + c.country }, `<i></i>${c.name}<small></small>`);
    b.addEventListener('click', (e) => { e.stopPropagation(); selectCity(c, true); });
    ui.labels.appendChild(b); labels[c.id] = b;
  }
  ui.back.addEventListener('click', back);
  ui.globeBtn.addEventListener('click', () => toGlobe());
  wireSearch();
  /* ‹ › in a world city: left shows/hides the trip HUD, right the city card (fly / drive / airport) */
  document.addEventListener('click', (e) => {
    if (!document.body.classList.contains('hts-world')) return;
    const t = e.target.closest && e.target.closest('#leftRailToggle,#rightRailToggle'); if (!t) return;
    e.stopImmediatePropagation(); e.preventDefault();
    const el2 = t.id === 'leftRailToggle' ? ui.hud : ui.card;
    if (el2 === ui.card && !el2.classList.contains('wHide') && getComputedStyle(el2).display === 'none') { renderCard(); t.setAttribute('aria-expanded', 'true'); return; }
    const hide = !el2.classList.contains('wHide'); el2.classList.toggle('wHide', hide); t.setAttribute('aria-expanded', String(!hide));
  }, true);
}

/* ---------- search (quick-pick: ↑↓ to move, Enter to go, Esc to close) ---------- */
function wireSearch() {
  let sel = 0, list = [];
  const render = () => {
    const q = ui.search.value.trim().toLowerCase();
    list = CITIES.filter((c) => !q || (c.name + ' ' + c.country + ' ' + c.region + ' ' + c.apt.code).toLowerCase().includes(q)).slice(0, 40);
    sel = Math.min(sel, Math.max(0, list.length - 1));
    ui.results.innerHTML = list.map((c, i) => `<div role="option" data-i="${i}" class="${i === sel ? 'on' : ''}">${c.name}<span>${c.country} · ${c.apt.code}</span></div>`).join('');
    ui.results.style.display = list.length && document.activeElement === ui.search ? 'block' : 'none';
  };
  const go = (c) => { ui.search.value = ''; ui.results.style.display = 'none'; ui.search.blur(); if (c) selectCity(c, true); };
  ui.search.addEventListener('input', () => { sel = 0; render(); });
  ui.search.addEventListener('focus', render);
  ui.search.addEventListener('blur', () => setTimeout(() => { ui.results.style.display = 'none'; }, 150));
  ui.search.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { sel = Math.min(list.length - 1, sel + 1); render(); e.preventDefault(); }
    else if (e.key === 'ArrowUp') { sel = Math.max(0, sel - 1); render(); e.preventDefault(); }
    else if (e.key === 'Enter') { go(list[sel]); e.preventDefault(); }
    else if (e.key === 'Escape') { go(null); e.stopPropagation(); }
  });
  ui.results.addEventListener('mousedown', (e) => { const d = e.target.closest('div[data-i]'); if (d) go(list[+d.dataset.i]); });
}

/* ---------- input ---------- */
let wired = false;
function wireInput() {
  if (wired) return; wired = true;
  let drag = null; const touches = new Map(); let pinch = 0;
  const own = (e) => { if (!active) return false; e.stopImmediatePropagation(); return true; };
  const C = { capture: true };
  canvas.addEventListener('pointerdown', (e) => { if (!own(e) || e.pointerType === 'touch') return; canvas.setPointerCapture(e.pointerId); drag = { x: e.clientX, y: e.clientY, pan: e.button !== 0 || e.shiftKey }; }, C);
  canvas.addEventListener('pointermove', (e) => {
    if (!own(e) || !drag || e.pointerType === 'touch') return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y; drag.x = e.clientX; drag.y = e.clientY;
    look(dx, dy, drag.pan);
  }, C);
  addEventListener('pointerup', (e) => { if (active) { e.stopImmediatePropagation(); drag = null; } }, C);
  canvas.addEventListener('wheel', (e) => { if (!own(e)) return; e.preventDefault(); zoom(Math.pow(1.0016, THREE.MathUtils.clamp(e.deltaY, -240, 240))); }, { capture: true, passive: false });
  canvas.addEventListener('touchstart', (e) => {
    if (!own(e)) return; e.preventDefault(); for (const t of e.changedTouches) touches.set(t.identifier, { x: t.clientX, y: t.clientY });
    if (touches.size === 2) { const a = [...touches.values()]; pinch = Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y); }
  }, { capture: true, passive: false });
  canvas.addEventListener('touchmove', (e) => {
    if (!own(e)) return; e.preventDefault();
    if (e.touches.length === 1) { const t = e.touches[0], p = touches.get(t.identifier); if (!p) return; look(t.clientX - p.x, t.clientY - p.y, false); p.x = t.clientX; p.y = t.clientY; }
    else if (e.touches.length === 2) {
      const a = e.touches; const d = Math.hypot(a[0].clientX - a[1].clientX, a[0].clientY - a[1].clientY);
      if (pinch) zoom(pinch / d); pinch = d;
      const mx = (a[0].clientX + a[1].clientX) / 2, my = (a[0].clientY + a[1].clientY) / 2;
      const p0 = touches.get(a[0].identifier), p1 = touches.get(a[1].identifier);
      if (p0 && p1 && mode === 'city') look(mx - (p0.x + p1.x) / 2, my - (p0.y + p1.y) / 2, true);
      for (const t of a) touches.set(t.identifier, { x: t.clientX, y: t.clientY });
    }
  }, { capture: true, passive: false });
  canvas.addEventListener('touchend', (e) => { if (!own(e)) return; for (const t of e.changedTouches) touches.delete(t.identifier); if (touches.size < 2) pinch = 0; }, C);
  addEventListener('keydown', onKey, true);
}
function onKey(e) {
  if (!active) return;
  const typing = e.target === ui.search || (e.target && /INPUT|SELECT|TEXTAREA/.test(e.target.tagName));
  if (typing) return;
  if (e.key === 'Escape') { back(); e.preventDefault(); e.stopImmediatePropagation(); return; }
  if (e.key === '/') { ui.search.focus(); e.preventDefault(); e.stopImmediatePropagation(); return; }
  if ((e.key === 'c' || e.key === 'C') && flight) { camView = camView === 'chase' ? 'cockpit' : 'chase'; e.stopImmediatePropagation(); return; }
  if (drive) {
    if (e.key === 'ArrowLeft') { drive.turn = 'left'; toast('Turning left at the next junction', 1400); }
    else if (e.key === 'ArrowRight') { drive.turn = 'right'; toast('Turning right at the next junction', 1400); }
    else if (e.key === 'ArrowUp') drive.speedK = Math.min(1.3, drive.speedK + 0.1);
    else if (e.key === 'ArrowDown') drive.speedK = Math.max(0.2, drive.speedK - 0.1);
    else if (e.key === 'v' || e.key === 'V') drive.view = drive.view === 'chase' ? 'driver' : 'chase';
    else return;
    e.preventDefault(); e.stopImmediatePropagation(); return;
  }
  e.stopImmediatePropagation(); /* keep Houston shortcuts quiet while the world is open */
}
function look(dx, dy, pan) {
  if (flight && flight.phase === 'cruise') { flight.cyaw = (flight.cyaw || 0) - dx * 0.006; return; }
  if (flight) { const o = flight.orb || (flight.orb = { yaw: 0, pitch: 0.21, dist: 1 }); o.yaw -= dx * 0.006; o.pitch = THREE.MathUtils.clamp(o.pitch + dy * 0.004, -0.05, 1.3); return; }
  if (drive && mode === 'city') { const o = drive.orb || (drive.orb = { yaw: 0, pitch: 0.36, dist: 1 }); o.yaw -= dx * 0.006; o.pitch = THREE.MathUtils.clamp(o.pitch + dy * 0.004, 0.04, 1.35); return; }
  if (mode === 'globe') { globe.drag(dx, dy, canvas.clientHeight); return; }
  if (mode !== 'city') return;
  if (pan) {
    const k = orbit.r * 0.0016, c = Math.cos(orbit.theta), s = Math.sin(orbit.theta);
    orbit.tx -= (c * dx + s * dy) * k; orbit.tz -= (-s * dx + c * dy) * k;
    const lim = 30000; orbit.tx = THREE.MathUtils.clamp(orbit.tx, -lim, lim); orbit.tz = THREE.MathUtils.clamp(orbit.tz, -lim, lim);
  } else { orbit.theta -= dx * 0.005; orbit.phi = THREE.MathUtils.clamp(orbit.phi - dy * 0.004, 0.12, 1.45); }
}
let outTicks = 0;
function zoom(f) {
  if (flight && flight.phase === 'cruise') { flight.cdist = THREE.MathUtils.clamp((flight.cdist || 1) * f, 0.15, 6); return; }
  if (flight) { const o = flight.orb || (flight.orb = { yaw: 0, pitch: 0.21, dist: 1 }); o.dist = THREE.MathUtils.clamp(o.dist * f, 0.35, 12); return; }
  if (drive && mode === 'city') { const o = drive.orb || (drive.orb = { yaw: 0, pitch: 0.36, dist: 1 }); o.dist = THREE.MathUtils.clamp(o.dist * f, 0.3, 8); return; }
  if (mode === 'globe') {
    globe.zoom(f);
    if (f < 1 && globe.goal.alt < 66 && !flight) {
      const n = nearest(globe.goal);
      if (n && n.c.full && n.d < 160) { close({ lat: globe.state.lat, lng: globe.state.lng, zoomIn: true }); return; }
      if (n && n.d < 120) selectCity(n.c, false);
    }
    return;
  }
  if (mode !== 'city') return;
  const r = orbit.r * f;
  if (r > 52000 && f > 1) { if (++outTicks > 3) { outTicks = 0; toGlobe(); } return; }
  outTicks = 0; orbit.r = THREE.MathUtils.clamp(r, 25, 52000);
}
function nearest(ll) {
  let best = null;
  for (const c of CITIES) { const d = gcDist(ll, c); if (!best || d < best.d) best = { c, d }; }
  return best;
}

/* ---------- live data ---------- */
const deadHosts = new Set(); /* hosts that failed (CORS / 4xx) are skipped for the session */
const hostOf = (u) => (/^https?:/.test(u) ? u.split('/')[2] : u.split('/').slice(0, 3).join('/'));
async function fetchJson(urls, ms = 9000) {
  for (const u of urls) {
    if (deadHosts.has(hostOf(u))) continue;
    try {
      const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), ms);
      const r = await fetch(u, { signal: ctl.signal, cache: 'no-store' }); clearTimeout(t);
      if (r.ok) return await r.json();
      if (r.status === 403 || r.status === 404) deadHosts.add(hostOf(u));
    } catch (e) { if (!(e && e.name === 'AbortError')) deadHosts.add(hostOf(u)); }
  }
  return null;
}
async function loadWeather() {
  if (Date.now() - wxAt < 10 * 60e3) return; wxAt = Date.now();
  const lat = CITIES.map((c) => c.lat).join(','), lng = CITIES.map((c) => c.lng).join(',');
  const j = await fetchJson([`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,weather_code,cloud_cover,wind_speed_10m,wind_direction_10m,precipitation,is_day&wind_speed_unit=ms`], 12000);
  const arr = Array.isArray(j) ? j : j ? [j] : [];
  arr.forEach((d, i) => {
    const c = CITIES[i], cu = d && d.current; if (!c || !cu) return;
    weather[c.id] = { temp: cu.temperature_2m, code: cu.weather_code, cloud: cu.cloud_cover, wind: cu.wind_speed_10m, windDir: cu.wind_direction_10m, precip: cu.precipitation, isDay: cu.is_day };
  });
  if (!arr.length) wxAt = Date.now() - 9 * 60e3; /* retry in a minute */
  for (const c of CITIES) { const s = labels[c.id] && labels[c.id].querySelector('small'); if (s) s.textContent = tempStr(c, weather[c.id]); }
  if (cs && city) cs.setWeather(weather[city.id] || null);
  renderCard();
}
async function loadTraffic(c, nm) {
  if (trafficBusy || (trafficFor === c.id && Date.now() - trafficAt < 15000)) return;
  trafficBusy = true;
  const local = /localhost|127\.0\.0\.1/.test(location.hostname);
  const path = `/v2/point/${c.apt.lat.toFixed(4)}/${c.apt.lng.toFixed(4)}/${nm}`;
  const hosts = [['https://api.airplanes.live' + path, '/api/airplanes' + path], ['https://api.adsb.lol' + path, '/api/adsblol' + path]];
  let rows = [];
  for (const [d, p] of hosts) {
    const j = await fetchJson(local ? [p, d] : [d, p]);
    if (j && Array.isArray(j.ac) && j.ac.length) {
      rows = j.ac.filter((a) => Number.isFinite(a.lat) && Number.isFinite(a.lon)).map((a) => ({
        lat: a.lat, lng: a.lon, onGround: a.alt_baro === 'ground', altFt: typeof a.alt_baro === 'number' ? a.alt_baro : 0,
        hdg: a.track || a.true_heading || 0, gs: a.gs || 0, call: (a.flight || '').trim(), type: a.t || '',
      }));
      break;
    }
  }
  trafficBusy = false; trafficFor = c.id; trafficAt = Date.now(); traffic = rows;
  if (cs && city && city.id === c.id) cs.setTraffic(rows);
  renderCard();
}

/* ---------- modes ---------- */
function setLoading(on, text, k) {
  ui.load.style.display = on ? 'block' : 'none';
  if (text) ui.load.querySelector('#wLoadT').textContent = text;
  if (k != null) ui.load.querySelector('.bar i').style.width = Math.round(k * 100) + '%';
}
function selectCity(c, fly) {
  focusCity = c; renderCard();
  if (mode !== 'globe') { toGlobe(() => selectCity(c, fly)); return; }
  if (c.full) { /* Houston keeps the full simulator */
    globe.flyTo(c.lat, c.lng, 40, fly ? 2.6 : 0.6, () => close({ lat: c.lat, lng: c.lng })); return;
  }
  globe.flyTo(c.lat, c.lng, 45, fly ? 2.6 : 0.6, () => enterCity(c));
}
async function loadCity(c) {
  setLoading(true, 'Loading ' + c.name + '…', 0.1);
  try {
    const s = await createCityScene({ city: c, renderer, mobile, onProgress: (k) => setLoading(true, null, k) });
    s.resize(canvas.clientWidth, canvas.clientHeight);
    s.setWeather(weather[c.id] || null);
    if (trafficFor === c.id) s.setTraffic(traffic);
    return s;
  } finally { setLoading(false); }
}
function disposeCity() { if (drive) { drive.dispose(); drive = null; } if (cs) { cs.dispose(); cs = null; } city = null; }
async function enterCity(c, keepPose) {
  if (city && city.id === c.id && cs) { mode = 'city'; renderCard(); return; }
  disposeCity();
  try { cs = await loadCity(c); } catch (e) { toast('Could not load ' + c.name + ' (' + e.message + ')'); mode = 'globe'; return; }
  city = c; mode = 'city';
  if (!keepPose) Object.assign(orbit, { tx: 0, tz: 0, r: 3600, theta: 0.6, phi: 0.92 });
  loadTraffic(c, 80); renderCard();
}
function toGlobe(cb) {
  if (flight) endFlight();
  if (drive) { drive.dispose(); drive = null; }
  const c = city || focusCity;
  disposeCity(); mode = 'globe';
  globe.jump(c.lat, c.lng, 80); globe.flyTo(c.lat, c.lng, 2600, 1.6, cb);
  renderCard();
}
function back() {
  if (flight) { endFlight(); if (cs) { mode = 'city'; renderCard(); } else toGlobe(); return; }
  if (drive) { drive.dispose(); drive = null; mode = 'city'; renderCard(); return; }
  if (mode === 'city') { toGlobe(); return; }
  close();
}

/* ---------- flights ---------- */
async function startFlight(destId, type) {
  const from = city, to = byId[destId];
  if (!from || !to || from.id === to.id) return;
  if (drive) { drive.dispose(); drive = null; }
  flight = { from, to, type, phase: 'takeoff', ph: new Takeoff(cs, type), destScene: null };
  mode = 'flight'; camView = 'chase'; renderCard();
  toast(`${flight.ph.plane.userData.name}: ${from.apt.code} → ${to.apt.code}. Press C for the cockpit view.`, 4500);
}
function endFlight() {
  if (!flight) return;
  if (flight.ph && flight.ph.dispose) flight.ph.dispose();
  if (flight.destScene && flight.destScene !== cs) flight.destScene.dispose();
  globe.setRoute(null); globe.setPlane(null); if (globe) globe.chaseOn = false;
  flight = null;
}
async function stepFlight(dt) {
  const f = flight;
  if (f.phase === 'takeoff') {
    if (f.ph.update(dt)) {
      f.ph.dispose(); disposeCity();
      f.cruise = new Cruise(f.from, f.to); f.phase = 'cruise'; mode = 'globe'; f.cyaw = 0; f.cdist = 1; globe.chaseOn = true;
      globe.jump(f.from.apt.lat, f.from.apt.lng, 60);
      globe.setRoute(f.from.apt, f.to.apt);
      if (!f.to.full) createCityScene({ city: f.to, renderer, mobile }).then((s) => {
        if (flight !== f) { s.dispose(); return; }
        s.resize(canvas.clientWidth, canvas.clientHeight); s.setWeather(weather[f.to.id] || null); f.destScene = s;
      }).catch(() => { f.destFail = true; });
      loadTraffic(f.to, 80);
    }
  } else if (f.phase === 'cruise') {
    const done = f.cruise.update(dt); const p = f.cruise.pos;
    globe.goal.lat = globe.state.lat = p.lat; globe.goal.lng = globe.state.lng = p.lng;
    const k = f.cruise.k; f.camAlt = (18 + 260 * Math.sin(Math.PI * k) ** 1.5) * f.cdist; globe.goal.alt = globe.state.alt = f.camAlt;
    if (!f.hero) {
      f.hero = new THREE.Scene(); f.heroCam = new THREE.PerspectiveCamera(55, canvas.clientWidth / canvas.clientHeight, 1, 5000);
      f.heroPlane = airliner(f.type); f.hero.add(f.heroPlane);
      f.hero.add(new THREE.HemisphereLight(0xdfeaff, 0x40382c, 1.4)); f.heroSun = new THREE.DirectionalLight(0xffffff, 2.2); f.hero.add(f.heroSun);
    }
    if (done) {
      if (f.to.full) { /* Houston is the full simulator: hand the plane to the Houston plane tour for the approach to IAH */
        const arr = { from: f.from.apt, type: f.type };
        close({ lat: f.to.apt.lat, lng: f.to.apt.lng });
        if (window.HTS_ARRIVE_HOUSTON) window.HTS_ARRIVE_HOUSTON(arr);
        return;
      }
      if (!f.destScene && !f.destFail) { f.cruise.t -= 0.5; return; } /* wait for the destination to finish loading */
      globe.setRoute(null); globe.setPlane(null); globe.chaseOn = false;
      if (f.destFail) { toast('Could not load ' + f.to.name); endFlight(); toGlobe(); return; }
      cs = f.destScene; city = f.to; f.phase = 'approach'; mode = 'flight';
      if (trafficFor === city.id) cs.setTraffic(traffic);
      f.ph = new Approach(cs, f.type);
      toast('Approach to ' + f.to.apt.name, 3000);
    }
  } else if (f.phase === 'approach') {
    if (f.ph.update(dt)) {
      const to = f.to; f.ph.dispose(); flight = null; mode = 'city';
      const rw = cs.apt; const w = cs.geo.toW(rw.lat, rw.lng); Object.assign(orbit, { tx: w.x, tz: w.z, r: 2600, theta: 0.6, phi: 0.9 });
      if (to.full) { toast('Welcome to Houston — opening the full Houston simulator', 2600); setTimeout(() => close({ lat: to.apt.lat, lng: to.apt.lng }), 2200); }
      else toast('Arrived at ' + to.apt.name + ', ' + to.name, 3500);
      renderCard();
    }
  }
}

/* ---------- UI ---------- */
let flyOpen = false, flySel = { dest: null, type: 'b787' };
let cardMin = (() => { try { return localStorage.getItem('hts-wcard-min') === '1'; } catch { return false; } })();
function renderCard() {
  if (!root) return;
  const c = city || focusCity;
  if (ui.card.contains(document.activeElement) && document.activeElement.tagName === 'SELECT') return; /* don't yank an open dropdown */
  const w = weather[c.id];
  ui.back.textContent = mode === 'globe' && !flight ? '← Houston' : '← Back';
  ui.globeBtn.style.display = mode === 'globe' ? 'none' : '';
  ui.title.innerHTML = mode === 'globe' ? `World<small>${CITIES.length} cities · zoom in or pick one</small>` : `${c.name}<small>${c.country} · ${localTime(c)}</small>`;
  ui.labels.style.display = mode === 'globe' ? '' : 'none';
  if (flight) { ui.card.style.display = 'none'; renderHud(); return; }
  ui.hud.style.display = drive ? 'block' : 'none';
  if (drive) renderHud();
  const wx = w ? `${tempStr(c, w)} · ${WX[w.code] || '—'}` : 'loading…';
  const wind = w ? `${Math.round(w.wind * 2.237)} mph from ${Math.round(w.windDir)}°` : '—';
  const n = trafficFor === c.id ? traffic.length : null;
  const others = CITIES.filter((x) => x.id !== c.id).sort((a, b) => gcDist(c, a) - gcDist(c, b));
  ui.card.style.display = 'block';
  ui.card.classList.toggle('wMin', cardMin);
  ui.card.innerHTML = `<h3 class="wAcc" data-a="min" role="button" aria-expanded="${!cardMin}" title="${cardMin ? 'Show' : 'Hide'} details">${c.name}<span class="wChev">▾</span></h3><div class="sub">${c.region === c.country ? c.country : c.region + ' · ' + c.country}</div><div class="wBody">
    <div class="row"><span>Local time</span><b>${localTime(c)}</b></div>
    <div class="row"><span>Weather</span><b>${wx}</b></div>
    <div class="row"><span>Wind</span><b>${wind}</b></div>
    <div class="row"><span>Airport</span><b>${c.apt.code} · ${c.apt.name}</b></div>
    <div class="row"><span>Live aircraft nearby</span><b>${n == null ? '…' : n}</b></div>
    ${city && cs ? `<div class="row"><span>3D buildings</span><b>${cs.buildings ? cs.buildings.toLocaleString() : (c.full ? 'full simulator' : '—')}</b></div>` : ''}
    <div class="acts">
      ${mode === 'globe' ? `<button class="wbtn pri" data-a="visit">${c.full ? 'Open Houston' : 'Visit ' + c.name}</button>` : ''}
      ${city ? `<button class="wbtn pri" data-a="fly">Fly to…</button>` : ''}
      ${city ? `<button class="wbtn" data-a="drive" ${c.drive ? '' : 'disabled title="Driving is available in the Americas"'}>Drive to Houston</button>` : ''}
      ${city ? `<button class="wbtn" data-a="apt">Airport</button>` : ''}
      ${mode === 'globe' && !c.full ? `<button class="wbtn" data-a="from">Fly from here</button>` : ''}
    </div>
    ${c.drive ? '' : `<div class="sub" style="margin:6px 0 0">${c.region === 'South America' ? 'No road link to Houston (Darién Gap) — fly instead.' : 'Driving is available in the Americas cities.'}</div>`}
    <div id="wFly" style="display:${flyOpen && city ? 'block' : 'none'}"><select id="wDest">${others.map((o) => `<option value="${o.id}"${o.id === flySel.dest ? ' selected' : ''}>${o.name} (${o.apt.code}) · ${Math.round(gcDist(c, o)).toLocaleString()} km</option>`).join('')}</select>
      <select id="wType">${WORLD_AIRCRAFT.map((a) => `<option value="${a[0]}"${a[0] === flySel.type ? ' selected' : ''}>${a[1]}</option>`).join('')}</select>
      <button class="wbtn pri" data-a="go" style="width:100%">Take off from ${c.apt.code}</button></div></div>`;
  ui.card.querySelectorAll('[data-a]').forEach((b) => b.addEventListener('click', () => cardAction(b.dataset.a)));
  for (const [id, k] of [['#wDest', 'dest'], ['#wType', 'type']]) { const e = ui.card.querySelector(id); if (e) e.addEventListener('change', () => { flySel[k] = e.value; }); }
  ui.help.textContent = mode === 'globe' ? 'Drag to spin · scroll or pinch to zoom · tap a city · / to search · Esc back to Houston'
    : drive ? '← → turn at next junction · ↑ ↓ speed · V driver view · Esc stop'
    : 'Drag to rotate · right-drag or Shift-drag to pan · scroll to zoom (zoom far out for the globe) · Esc back';
}
async function cardAction(a) {
  const c = city || focusCity;
  if (a === 'min') { cardMin = !cardMin; try { localStorage.setItem('hts-wcard-min', cardMin ? '1' : '0'); } catch { /* private mode */ } renderCard(); return; }
  if (a === 'visit') selectCity(c, true);
  else if (a === 'from') { await enterCity(c); cardAction('fly'); }
  else if (a === 'fly') { flyOpen = !flyOpen; const f = ui.card.querySelector('#wFly'); if (f) f.style.display = flyOpen ? 'block' : 'none'; }
  else if (a === 'go') {
    const d = ui.card.querySelector('#wDest').value, t = ui.card.querySelector('#wType').value; flyOpen = false;
    if (window.HTS_INTERCITY_FLY) { window.HTS_INTERCITY_FLY(c.id, d, t); return; }
    if (!cs) await enterCity(c);
    startFlight(d, t);
  } else if (a === 'apt' && cs) {
    const w = cs.geo.toW(cs.apt.lat, cs.apt.lng); Object.assign(orbit, { tx: w.x, tz: w.z, r: 3800, phi: 0.85 });
  } else if (a === 'drive' && c.drive && !c.full && window.HTS_INTERCITY_DRIVE) {
    window.HTS_INTERCITY_DRIVE(c.id).catch((e) => toast(e.message));
  } else if (a === 'drive' && cs && c.drive) {
    try { drive = new Drive(cs, { x: orbit.tx, z: orbit.tz }); mode = 'city'; toast('Driving on ' + (drive.road.name || 'the nearest main road') + ' · ← → pick turns', 3500); }
    catch (e) { toast(e.message); }
    renderCard();
  }
}
let hudT = 0;
function renderHud() {
  ui.hud.style.display = 'block';
  if (flight) {
    const f = flight, p = f.phase;
    const ph = p === 'takeoff' ? 'Take-off roll & climb' : p === 'cruise' ? 'Cruise (time-lapse)' : 'ILS approach & landing';
    const alt = p === 'cruise' ? '35,000 ft' : Math.round(f.ph.altFt).toLocaleString() + ' ft';
    const spd = p === 'cruise' ? '480 kt' : Math.round(f.ph.speedKt) + ' kt';
    const rem = p === 'cruise' ? Math.round(f.cruise.remainingKm).toLocaleString() + ' km to go · real flight ≈ ' + f.cruise.realH.toFixed(1) + ' h' : '';
    ui.hud.innerHTML = `<b>${f.from.apt.code} → ${f.to.apt.code}</b> <span class="k">${f.to.name}</span><br><span class="k">${ph}</span> · ${alt} · ${spd}${rem ? '<br><span class="k">' + rem + '</span>' : ''}
      <div class="acts">${p !== 'cruise' ? '<button class="wbtn" data-h="view">' + (camView === 'chase' ? 'Cockpit (C)' : 'Chase (C)') + '</button>' : ''}<button class="wbtn" data-h="stop">End flight</button></div>`;
  } else if (drive) {
    ui.hud.innerHTML = `<b>${Math.round(drive.mph)} mph</b> <span class="k">${drive.road.name || 'Local road'} · ${city.name}</span>
      <div class="acts"><button class="wbtn" data-h="left">◀ Left</button><button class="wbtn" data-h="right">Right ▶</button><button class="wbtn" data-h="dview">${drive.view === 'chase' ? 'Driver view (V)' : 'Chase view (V)'}</button><button class="wbtn" data-h="dstop">Stop</button></div>`;
  }
  ui.hud.querySelectorAll('[data-h]').forEach((b) => b.addEventListener('click', () => {
    const h = b.dataset.h;
    if (h === 'view') camView = camView === 'chase' ? 'cockpit' : 'chase';
    else if (h === 'stop') back();
    else if (h === 'left' && drive) drive.turn = 'left';
    else if (h === 'right' && drive) drive.turn = 'right';
    else if (h === 'dview' && drive) drive.view = drive.view === 'chase' ? 'driver' : 'chase';
    else if (h === 'dstop') back();
    renderHud();
  }));
}

/* ---------- loop ---------- */
function resize() {
  const w = canvas.clientWidth || innerWidth, h = canvas.clientHeight || innerHeight;
  globe.resize(w, h); if (cs) cs.resize(w, h);
  if (flight && flight.destScene && flight.destScene !== cs) flight.destScene.resize(w, h);
}
const _cd = new THREE.Vector3(); let roseEl = null;
function cityCam(dt) {
  const cam = cs.camera;
  const sp = Math.sin(orbit.phi), cp = Math.cos(orbit.phi);
  cam.position.set(orbit.tx + orbit.r * sp * Math.sin(orbit.theta), orbit.r * cp + 2, orbit.tz + orbit.r * sp * Math.cos(orbit.theta));
  cam.up.set(0, 1, 0); cam.lookAt(orbit.tx, 0, orbit.tz);
  cam.near = Math.max(0.5, orbit.r * 0.004); cam.far = 90000; cam.updateProjectionMatrix();
  void dt;
}
function setNear(cam, n) { if (cam.near !== n) { cam.near = n; cam.updateProjectionMatrix(); } }
let lastW = 0, lastH = 0;
/* the Houston renderer may run with autoClear off (cinematic pass): always start from a clean frame */
function draw(scene, cam) { const ac = renderer.autoClear; renderer.setRenderTarget(null); renderer.autoClear = true; renderer.render(scene, cam); renderer.autoClear = ac; }
export function frame(now) {
  if (!active) return;
  if (canvas.clientWidth !== lastW || canvas.clientHeight !== lastH) { lastW = canvas.clientWidth; lastH = canvas.clientHeight; resize(); }
  const dt = Math.max(0, Math.min(0.06, (now - last) / 1000 || 0.016)); last = now; /* rAF stamps can precede performance.now() */
  if (flight) stepFlight(dt);
  hudT -= dt; if (hudT <= 0) { hudT = 0.5; if (flight || drive) renderHud(); ui.title.querySelector('small') && city && (ui.title.innerHTML = `${city.name}<small>${city.country} · ${localTime(city)}</small>`); }
  ui.labels.style.display = mode === 'globe' ? '' : 'none';
  ui.dash.style.display = flight && camView === 'cockpit' && flight.phase !== 'cruise' ? 'block' : 'none';
  if (mode === 'globe' && flight && flight.phase === 'cruise' && flight.hero && flight.cruise.pos) {
    const f = flight, p = f.cruise.pos;
    globe.update(dt);
    globe.chase(p.lat, p.lng, p.hdg + f.cyaw * 57.3, f.camAlt, f.camAlt * 1.8);
    draw(globe.scene, globe.camera);
    /* the aircraft itself, drawn on top at chase distance — no icon */
    const L = f.heroPlane.userData.len || 40, cam = f.heroCam;
    cam.aspect = canvas.clientWidth / canvas.clientHeight; cam.updateProjectionMatrix();
    f.heroPlane.rotation.set(0, 0, Math.sin(performance.now() / 2400) * 0.02);
    const a = f.cyaw; cam.position.set(Math.sin(a) * L * 2.2, L * 0.55, Math.cos(a) * L * 2.2); cam.lookAt(0, L * 0.05, 0);
    const sunUp = globe.sunUpAt ? globe.sunUpAt(p.lat, p.lng) : 1; f.heroSun.intensity = 0.3 + 2.0 * sunUp; f.heroSun.position.set(-40, 80, -30);
    const ac = renderer.autoClear; renderer.autoClear = false; renderer.clearDepth(); renderer.render(f.hero, cam); renderer.autoClear = ac;
    placeLabels();
  } else if (mode === 'globe') {
    globe.update(dt);
    /* live aircraft over the whole globe: each city's 250 nm feed is kept, the one nearest the view is refreshed */
    const near = nearest(globe.state);
    if (near) { loadTraffic(near.c, 250); if (trafficFor === near.c.id) seenAir[near.c.id] = { t: Date.now(), rows: traffic }; }
    const all = []; const now2 = Date.now();
    for (const k in seenAir) { const v = seenAir[k]; if (now2 - v.t < 10 * 60e3) for (const r of v.rows) all.push(r); }
    /* scheduled intercity traffic between the catalog airports (simulated, ~870 km/h, real great-circle tracks) */
    for (const r of SIM_ROUTES) {
      const dur = r.km / 870 * 3600e3, k = ((now2 + r.off) % dur) / dur, p = gcLerp(r.a, r.b, k), n = gcLerp(r.a, r.b, Math.min(1, k + 0.001));
      all.push({ lat: p.lat, lng: p.lng, altFt: 35000 * Math.min(1, Math.min(k, 1 - k) * 25), hdg: bearing(p, n), sim: true });
    }
    globe.setFlights(all);
    draw(globe.scene, globe.camera);
    placeLabels();
  } else if (cs) {
    const cam = cs.camera;
    if (flight && flight.ph && flight.ph.plane) {
      planeCam(cam, flight.ph.plane, camView, dt, flight.orb); setNear(cam, camView === 'cockpit' ? 0.3 : 1);
      if (camView === 'cockpit') { /* same glass cockpit as the Houston jet tour */
        const pl = flight.ph.plane, up = flight.phase === 'takeoff';
        updateDash(ui.dash, { type: 'jet', kt: flight.ph.speedKt, ft: flight.ph.altFt, vs: Math.round((up ? 1 : -1) * Math.min(2200, flight.ph.altFt > 5 ? 800 : 0)),
          hdg: ((-pl.rotation.y * 180 / Math.PI) % 360 + 360) % 360, roll: 0, pitch: pl.rotation.x, pwr: up ? 0.95 : 0.35, gear: up && flight.ph.altFt > 400 ? 0 : 1,
          phase: up ? (flight.ph.altFt < 5 ? 'roll' : 'climb') : (flight.ph.altFt < 5 ? 'rollout' : 'final'), info: flight.from.apt.code + ' → ' + flight.to.apt.code });
      }
    }
    else if (drive) { drive.update(dt); drive.camera(cam, dt); setNear(cam, 0.2); }
    else cityCam(dt);
    cs.update(dt, cam);
    if (roseEl || (roseEl = document.getElementById('rose'))) { cam.getWorldDirection(_cd); roseEl.style.transform = 'rotate(' + (Math.atan2(-_cd.x, -_cd.z) * 180 / Math.PI).toFixed(1) + 'deg)'; }
    if (city && !flight) loadTraffic(city, 80);
    draw(cs.scene, cam);
  }
  loadWeather();
}
function placeLabels() {
  const w = canvas.clientWidth, h = canvas.clientHeight;
  const far = globe.state.alt > 14000;
  for (const c of CITIES) {
    const b = labels[c.id]; const p = globe.project(c.lat, c.lng, w, h);
    if (!p) { b.style.display = 'none'; continue; }
    b.style.display = ''; b.style.transform = `translate(${(p.x - 6) | 0}px,${(p.y) | 0}px) translateY(-50%)`;
    b.style.opacity = far && !c.full ? '0.8' : '1';
  }
}

/* ---------- open / close (shares the Houston canvas + renderer: one map) ---------- */
/** Build the globe ahead of time (idle) so zooming out of Houston turns into the globe without a pause. */
export async function preload(opts = {}) {
  if (globe || !opts.renderer) return;
  try {
    if (!land) { const r = await fetch('/data/world/land.json?r=1', { cache: 'force-cache' }); land = await r.json(); }
    if (!globe) globe = createGlobe({ catalog: CITIES, land, mobile, maxTex: opts.renderer.capabilities.maxTextureSize });
    renderer = opts.renderer; renderer.compile(globe.scene, globe.camera);
  } catch (e) { console.warn('[world] preload', e); }
}
export async function openWorld(opts = {}) {
  if (active) return;
  canvas = opts.canvas; renderer = opts.renderer;
  if (!canvas || !renderer) throw new Error('world needs the Houston canvas');
  if (!root) buildDom();
  wireInput();
  try {
    if (!land) { const r = await fetch('/data/world/land.json?r=1', { cache: 'force-cache' }); land = await r.json(); }
    if (!globe) globe = createGlobe({ catalog: CITIES, land, mobile, maxTex: renderer.capabilities.maxTextureSize });
  } catch (e) { console.warn('[world]', e); return; }
  active = true; window.HTS_WORLD_ACTIVE = true;
  root.style.display = 'block'; document.body.classList.add('hts-world');
  lastW = lastH = 0;
  const from = opts.from || { lat: 29.76, lng: -95.37 };
  mode = 'globe'; focusCity = byId.houston;
  /* continue the Houston zoom: start at the height the Houston map stops at and keep climbing */
  globe.jump(from.lat, from.lng, opts.alt || 70);
  if (opts.fly) globe.flyTo(from.lat, from.lng, 9000, 2.4);
  else globe.goal.alt = Math.max(globe.goal.alt, (opts.alt || 70) * 1.6);
  renderCard(); loadWeather();
  last = performance.now();
  if (opts.cruiseFrom && byId[opts.flyTo]) {
    /* Houston's own plane tour flew the take-off; pick up the climb-out over the globe */
    flight = { from: byId[opts.cruiseFrom], to: byId[opts.flyTo], type: opts.type || 'b787', phase: 'takeoff', destScene: null,
      ph: { update: () => true, dispose() {}, plane: null, altFt: 9000, speedKt: 280 } };
    camView = 'chase'; renderCard();
  } else if (opts.flyTo) { await enterCity(byId[opts.flyFrom || 'houston']); startFlight(opts.flyTo, opts.type || 'b787'); }
}
export function close(focus) {
  if (!active) return;
  active = false; window.HTS_WORLD_ACTIVE = false;
  endFlight(); disposeCity();
  root.style.display = 'none'; document.body.classList.remove('hts-world');
  if (mobile && globe) { globe.dispose(); globe = null; }
  if (window.HTS_WORLD_RETURN) window.HTS_WORLD_RETURN(focus ? focus.lat : 29.76, focus ? focus.lng : -95.37, focus && focus.zoomIn);
}

window.HTS_WORLD = { open: openWorld, close, frame, preload, get active() { return active; }, cities: CITIES,
  debug: () => ({ mode, city: city && city.id, globe: globe && { ...globe.state }, cam: globe && globe.camera.position.toArray().map(Math.round), hou: labels.houston && labels.houston.style.cssText }) };
