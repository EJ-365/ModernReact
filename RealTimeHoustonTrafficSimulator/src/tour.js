/**
 * Tour Houston — guided car / plane tours to a chosen place, plus free drive and free flight.
 * Car tour: shortest-time route over the live OSM carriageway graph (houston-traffic), driven in-lane at
 * the road's free-flow speed scaled by what the simulated traffic around it is doing, slowing for curves.
 * Plane tour: Cessna-class aircraft rolls down the nearest airport's OSM runway, rotates at 55 kt, climbs at
 * ~700 ft/min to 1,500 ft, cruises at 110 kt, descends to 1,000 ft and circles the destination.
 */
import * as THREE from 'three';

const MPH = 0.44704, KT = 0.514444, FT = 0.3048, G = 9.81;
const LANDMARKS = [
  ['Downtown Houston', 29.7604, -95.3698], ['Galleria / Uptown', 29.739, -95.463], ['Texas Medical Center', 29.707, -95.398],
  ['NRG Stadium', 29.6847, -95.4107], ['Hermann Park', 29.7135, -95.3905], ['Rice University', 29.7174, -95.4018],
  ['University of Houston', 29.7199, -95.3422], ['Texas Southern University', 29.7220, -95.3578],
  ['Lamar High School', 29.7428, -95.4265], ['Bellaire High School', 29.7019, -95.4645],
  ['Museum District', 29.724, -95.39], ['Daikin Park (Minute Maid)', 29.7573, -95.3555], ['Toyota Center', 29.7508, -95.3621],
  ['Buffalo Bayou Park', 29.762, -95.386], ['Memorial Park', 29.765, -95.441], ['Space Center Houston', 29.5519, -95.0981],
  ['NASA Johnson Space Center', 29.5593, -95.0899], ['San Jacinto Monument', 29.7499, -95.0807],
  ['Kemah Boardwalk', 29.5466, -95.02], ['The Woodlands Waterway', 30.163, -95.464],
  ['Houston Ship Channel', 29.735, -95.205], ['Ellington Airport', 29.6073, -95.1588],
];
const VIEWS = { car: [['chase', 'Chase'], ['driver', 'Driver'], ['side', 'Side'], ['top', 'Top'], ['orbit', 'Free look']],
  plane: [['chase', 'Chase'], ['cockpit', 'Cockpit'], ['wing', 'Wing'], ['top', 'Top'], ['orbit', 'Free look']] };
const CAR_STYLES = [['sedan', 'Sedan'], ['suv', 'SUV'], ['pickup', 'Pickup']];
const PLANE_STYLES = [['prop', 'Cessna'], ['jet', 'Jet']];
const CAR_COLORS = [0xb3202a, 0x1e4d8c, 0x22262c, 0xe8e8ea, 0xd4a017, 0x2f7a4a];
const PLANE_COLORS = [0xc23a2c, 0x2b5ea8, 0xf3f4f6, 0xd9a441, 0x1a6b4a, 0x5a2d7a];
const PREF_KEY = 'hts-tour-veh';
function loadPrefs() {
  try {
    const j = JSON.parse(localStorage.getItem(PREF_KEY) || '{}');
    return {
      carColor: CAR_COLORS.includes(+j.carColor) ? +j.carColor : CAR_COLORS[0],
      carStyle: CAR_STYLES.some((s) => s[0] === j.carStyle) ? j.carStyle : 'sedan',
      planeColor: PLANE_COLORS.includes(+j.planeColor) ? +j.planeColor : PLANE_COLORS[0],
      planeStyle: PLANE_STYLES.some((s) => s[0] === j.planeStyle) ? j.planeStyle : 'prop',
      hudX: Number.isFinite(+j.hudX) ? +j.hudX : null,
      hudY: Number.isFinite(+j.hudY) ? +j.hudY : null,
    };
  } catch (e) { return { carColor: CAR_COLORS[0], carStyle: 'sedan', planeColor: PLANE_COLORS[0], planeStyle: 'prop', hudX: null, hudY: null }; }
}
function savePrefs(p) { try { localStorage.setItem(PREF_KEY, JSON.stringify(p)); } catch (e) { /* ignore */ } }

/* Lambert materials — cheaper than Standard for the single tour vehicle */
function makeTourCar(color, style) {
  const g = new THREE.Group();
  const paint = new THREE.MeshLambertMaterial({ color });
  const glass = new THREE.MeshLambertMaterial({ color: 0x15191e });
  const tyre = new THREE.MeshLambertMaterial({ color: 0x16181b });
  const box = (w, h, l, m, x, y, z) => { const me = new THREE.Mesh(new THREE.BoxGeometry(w, h, l), m); me.position.set(x, y, z); g.add(me); return me; };
  if (style === 'suv') {
    box(1.95, 0.72, 4.7, paint, 0, 0.72, 0);
    box(1.78, 0.78, 2.55, glass, 0, 1.42, -0.15);
    box(1.7, 0.08, 2.2, paint, 0, 1.82, -0.2);
  } else if (style === 'pickup') {
    box(1.9, 0.62, 3.1, paint, 0, 0.62, 0.55);
    box(1.7, 0.55, 1.7, glass, 0, 1.18, 0.7);
    box(1.85, 0.55, 1.9, paint, 0, 0.85, -1.45);
  } else {
    box(1.84, 0.62, 4.62, paint, 0, 0.62, 0);
    box(1.62, 0.56, 2.3, glass, 0, 1.2, -0.25);
    box(1.6, 0.06, 2.0, paint, 0, 1.5, -0.3);
  }
  const yWheel = style === 'suv' ? 0.38 : 0.34;
  for (const [x, z] of [[-0.86, 1.42], [0.86, 1.42], [-0.86, -1.38], [0.86, -1.38]]) {
    const w = new THREE.Mesh(new THREE.CylinderGeometry(style === 'suv' ? 0.38 : 0.34, style === 'suv' ? 0.38 : 0.34, 0.24, 12), tyre);
    w.rotation.z = Math.PI / 2; w.position.set(x, yWheel, z); g.add(w);
  }
  const head = new THREE.MeshBasicMaterial({ color: 0xfff6dc }), tail = new THREE.MeshBasicMaterial({ color: 0xd0141c });
  for (const x of [-0.62, 0.62]) { box(0.36, 0.14, 0.05, head, x, 0.74, style === 'pickup' ? 2.05 : 2.32); box(0.4, 0.14, 0.05, tail, x, 0.78, style === 'pickup' ? -2.35 : -2.32); }
  g.userData.paint = paint;
  return g;
}

export function createTour({ scene, camera, cam, camGoal, geoToWorld, getTraffic, getRoads, airports, makePlane, makeJet, stopFollow, isFollowing, $, getUserGeo = () => null }) {
  const prefs = loadPrefs();
  const S = { mode: null, kind: 'car', view: 'chase', speedX: 1, obj: null, p: new THREE.Vector3(), hd: 0, v: 0, pitch: 0, roll: 0,
    route: null, s: 0, dest: null, phase: '', keys: {}, info: '', hudT: 0, orbitR: 900, runways: null, cruise: 0, odo: 0, yawRate: 0, th0: 0, ph0: 1, limit: 0, sm: null,
    carColor: prefs.carColor, carStyle: prefs.carStyle, planeColor: prefs.planeColor, planeStyle: prefs.planeStyle, acClass: 'prop' };
  const dests = [];
  let destId = 0;
  function pushDest(g, n, x, z) {
    const id = 'd' + (destId++);
    dests.push({ id, g, n, x, z });
    return id;
  }
  for (const [n, lat, lng] of LANDMARKS) {
    const w = geoToWorld(lat, lng);
    pushDest('Landmarks', n, w.x, w.z);
  }
  fetch('/data/houston/places.json').then((r) => r.json()).then((d) => {
    for (const [x, z, rk, n] of d.p || []) if (rk <= 2) pushDest(rk <= 1 ? 'Cities & towns' : 'Neighbourhoods', n, x, z);
    fillDest();
  }).catch(() => fillDest());
  fetch('/data/houston/airports.json').then((r) => r.json()).then((d) => { S.runways = d.runways || []; S.aeros = d.aerodromes || []; }).catch(() => { S.runways = []; });

  /* ---------- UI ---------- */
  function fillDest() {
    const sel = $('tourDest'); if (!sel) return;
    const keep = sel.value;
    const groups = {};
    dests.forEach((d) => { (groups[d.g] || (groups[d.g] = [])).push(d); });
    sel.innerHTML = '<option value="">— pick a place to tour —</option>' + Object.entries(groups).map(([g, l]) => '<optgroup label="' + g + '">'
      + l.slice().sort((a, b) => a.n.localeCompare(b.n)).map((d) => '<option value="' + d.id + '">' + d.n + '</option>').join('') + '</optgroup>').join('');
    if (keep && dests.some((d) => d.id === keep)) sel.value = keep;
  }
  function findDest(id) { return dests.find((d) => d.id === id) || null; }
  const vehBtns = document.querySelectorAll('#tourVeh .btn');
  vehBtns.forEach((b) => b.addEventListener('click', () => {
    S.kind = b.getAttribute('data-veh'); vehBtns.forEach((x) => x.classList.toggle('on', x === b));
    const fb = $('tourFree'); if (fb) fb.textContent = S.kind === 'car' ? 'Free drive' : 'Free flight';
  }));
  const goBtn = $('tourGo'); if (goBtn) goBtn.addEventListener('click', () => {
    const v = $('tourDest') && $('tourDest').value;
    if (v === '' || v == null) { note('Pick a place first.'); return; }
    const dest = findDest(v);
    if (!dest) { note('That place list refreshed — pick it again, then Start tour.'); return; }
    const kind = (document.querySelector('#tourVeh .btn.on') || {}).getAttribute?.('data-veh') || S.kind || 'car';
    S.kind = kind;
    start(kind, 'tour', dest);
  });
  const freeBtn = $('tourFree'); if (freeBtn) freeBtn.addEventListener('click', () => {
    const kind = (document.querySelector('#tourVeh .btn.on') || {}).getAttribute?.('data-veh') || S.kind || 'car';
    S.kind = kind;
    start(kind, 'free', null);
  });
  function note(t) { const n = $('tourNote'); if (n) n.textContent = t; }

  const css = document.createElement('style');
  css.textContent = '#tourHud{position:fixed;left:50%;bottom:18px;transform:translateX(-50%);z-index:40;background:linear-gradient(165deg,rgba(28,23,18,.94),rgba(14,12,10,.96));border:1px solid rgba(232,168,56,.28);border-radius:14px;padding:12px 14px;color:#f3ebe0;font:12px/1.35 Overpass,system-ui,sans-serif;min-width:300px;max-width:min(440px,94vw);box-shadow:0 12px 36px rgba(0,0,0,.5),inset 0 1px 0 rgba(255,220,160,.08);display:none;touch-action:none}'
    + '#tourHud.on{display:block}#tourHud.dragged{left:0;bottom:auto;transform:none}'
    + '#tourHud .tt{font-weight:700;font-size:13px;margin-bottom:6px;display:flex;justify-content:space-between;gap:12px;align-items:center;cursor:grab;user-select:none;color:#fff6ea}'
    + '#tourHud .tt:active{cursor:grabbing}#tourHud .tt .drag{color:#8a7e70;font-size:11px;font-weight:600;letter-spacing:.04em;margin-right:6px}'
    + '#tourHud .tm{display:flex;gap:14px;font-family:"Overpass Mono",monospace;font-size:12px;color:#e8c49a;margin-bottom:6px;flex-wrap:wrap}'
    + '#tourHud .tm b{font-size:17px;color:#fff6ea}#tourHud .row{display:flex;gap:6px;flex-wrap:wrap;margin-top:4px;align-items:center}'
    + '#tourHud button{background:rgba(255,236,210,.08);border:1px solid rgba(255,236,210,.16);color:#f3ebe0;border-radius:8px;padding:6px 10px;font-size:11px;font-weight:700;cursor:pointer}'
    + '#tourHud button.on{background:linear-gradient(135deg,#e8a838,#c96a28);border-color:transparent;color:#1a1008}#tourHud .x{background:#5a1d22;border-color:#a8323c;color:#f3ebe0}'
    + '#tourHud .tbar{margin:6px 0 2px;height:8px;background:rgba(20,12,8,.65);border-radius:6px;overflow:visible;position:relative;border:1px solid rgba(232,168,56,.2)}'
    + '#tourHud .tbar i{display:block;height:100%;width:0;background:linear-gradient(90deg,#c96a28,#e8a838);border-radius:5px}'
    + '#tourHud .tbar .tplane{position:absolute;top:50%;transform:translate(-50%,-50%);font-size:12px;line-height:1;pointer-events:none;filter:drop-shadow(0 1px 2px #000)}'
    + '#tourHud .sw{width:18px;height:18px;border-radius:50%;border:2px solid rgba(255,236,210,.25);padding:0;cursor:pointer}'
    + '#tourHud .sw.on{border-color:#fff6ea;box-shadow:0 0 0 1px #e8a838}'
    + '#tourPad{position:fixed;right:18px;bottom:18px;z-index:40;display:none;grid-template-columns:repeat(3,52px);gap:6px}#tourPad.on{display:grid}'
    + '#tourPad button{height:52px;border-radius:12px;background:rgba(28,23,18,.9);border:1px solid rgba(232,168,56,.28);color:#fff6ea;font-size:18px;touch-action:none}'
    + '#tourDash{position:fixed;left:0;right:0;bottom:0;height:min(38vh,320px);z-index:35;pointer-events:none;display:none}#tourDash.on{display:block}#tourDash svg{width:100%;height:100%;display:block}'
    + '#tourDash.jetCockpit{height:min(42vh,360px)}';
  document.head.appendChild(css);
  const hud = document.createElement('div'); hud.id = 'tourHud'; document.body.appendChild(hud);
  const dash = document.createElement('div'); dash.id = 'tourDash'; document.body.appendChild(dash);
  function applyHudPos() {
    if (prefs.hudX == null || prefs.hudY == null) { hud.classList.remove('dragged'); hud.style.left = ''; hud.style.top = ''; return; }
    hud.classList.add('dragged');
    const maxX = Math.max(8, innerWidth - hud.offsetWidth - 8);
    const maxY = Math.max(8, innerHeight - hud.offsetHeight - 8);
    hud.style.left = Math.max(8, Math.min(maxX, prefs.hudX)) + 'px';
    hud.style.top = Math.max(8, Math.min(maxY, prefs.hudY)) + 'px';
  }
  (function bindHudDrag() {
    let drag = null;
    hud.addEventListener('pointerdown', (e) => {
      const handle = e.target.closest('.tt');
      if (!handle || e.target.closest('button,select,a,.sw')) return;
      const r = hud.getBoundingClientRect();
      if (!hud.classList.contains('dragged')) {
        hud.classList.add('dragged');
        hud.style.left = r.left + 'px'; hud.style.top = r.top + 'px';
      }
      drag = { dx: e.clientX - r.left, dy: e.clientY - r.top, id: e.pointerId };
      try { hud.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
      e.preventDefault();
    });
    hud.addEventListener('pointermove', (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      const x = e.clientX - drag.dx, y = e.clientY - drag.dy;
      const maxX = Math.max(8, innerWidth - hud.offsetWidth - 8);
      const maxY = Math.max(8, innerHeight - hud.offsetHeight - 8);
      prefs.hudX = Math.max(8, Math.min(maxX, x));
      prefs.hudY = Math.max(8, Math.min(maxY, y));
      hud.style.left = prefs.hudX + 'px'; hud.style.top = prefs.hudY + 'px';
    });
    const end = (e) => {
      if (!drag || (e && e.pointerId !== drag.id)) return;
      drag = null; savePrefs(prefs);
    };
    hud.addEventListener('pointerup', end); hud.addEventListener('pointercancel', end);
  })();
  const ticks = (cx, cy, r, max, step, a0, a1, lab) => { let t = ''; for (let v = 0; v <= max; v += step) { const a = (a0 + (a1 - a0) * v / max) * Math.PI / 180, big = v % (step * 2) === 0; t += '<line x1="' + (cx + Math.cos(a) * r) + '" y1="' + (cy + Math.sin(a) * r) + '" x2="' + (cx + Math.cos(a) * (r - (big ? 14 : 7))) + '" y2="' + (cy + Math.sin(a) * (r - (big ? 14 : 7))) + '" stroke="#e8eef4" stroke-width="' + (big ? 3 : 1.5) + '"/>'; if (big && lab) t += '<text x="' + (cx + Math.cos(a) * (r - 30)) + '" y="' + (cy + Math.sin(a) * (r - 30) + 5) + '" fill="#cfd8e0" font-size="14" text-anchor="middle">' + lab(v) + '</text>'; } return t; };
  const CAR_DASH = '<svg viewBox="0 0 1000 300" preserveAspectRatio="xMidYMax slice">'
    + '<path d="M0,120 Q500,60 1000,120 L1000,300 L0,300 Z" fill="#0d1014"/><path d="M0,120 Q500,60 1000,120" stroke="#2a3138" stroke-width="3" fill="none"/>'
    + '<circle cx="640" cy="200" r="88" fill="#06080a" stroke="#3a434c" stroke-width="3"/>' + ticks(640, 200, 82, 140, 10, 135, 405, (v) => v)
    + '<line id="dNeedle" x1="640" y1="200" x2="640" y2="130" stroke="#ff4b2b" stroke-width="4" stroke-linecap="round"/><circle cx="640" cy="200" r="8" fill="#ff4b2b"/>'
    + '<text id="dSpd" x="640" y="262" fill="#fff" font-size="26" font-weight="700" text-anchor="middle" font-family="Overpass Mono,monospace">0</text><text x="640" y="280" fill="#8a96a3" font-size="11" text-anchor="middle">MPH</text>'
    + '<circle cx="360" cy="200" r="74" fill="#06080a" stroke="#3a434c" stroke-width="3"/>' + ticks(360, 200, 68, 8, 1, 135, 405, (v) => v)
    + '<line id="dRpm" x1="360" y1="200" x2="360" y2="142" stroke="#f5b942" stroke-width="3.5" stroke-linecap="round"/><text x="360" y="262" fill="#8a96a3" font-size="11" text-anchor="middle">RPM ×1000</text>'
    + '<g id="dWheel" transform="translate(500,300)"><circle r="150" fill="none" stroke="#1b1f24" stroke-width="26"/><circle r="150" fill="none" stroke="#2b3138" stroke-width="4"/>'
    + '<rect x="-150" y="-12" width="300" height="24" rx="10" fill="#1b1f24"/><rect x="-14" y="-12" width="28" height="160" fill="#1b1f24"/><circle r="42" fill="#15191d" stroke="#2b3138" stroke-width="3"/><text y="6" fill="#8a96a3" font-size="13" text-anchor="middle">HTS</text></g>'
    + '<rect x="120" y="150" width="130" height="92" rx="10" fill="#06080a" stroke="#3a434c"/><text x="185" y="172" fill="#8a96a3" font-size="11" text-anchor="middle">TRIP · ODO</text><text id="dTrip" x="185" y="198" fill="#fff" font-size="20" text-anchor="middle" font-family="Overpass Mono,monospace">0.0 mi</text><text id="dGear" x="185" y="228" fill="#7fd6a0" font-size="18" font-weight="700" text-anchor="middle">D</text>'
    + '<rect x="770" y="150" width="96" height="112" rx="10" fill="#fff" stroke="#111" stroke-width="3"/><text x="818" y="176" fill="#111" font-size="13" font-weight="700" text-anchor="middle">SPEED</text><text x="818" y="192" fill="#111" font-size="13" font-weight="700" text-anchor="middle">LIMIT</text><text id="dLim" x="818" y="244" fill="#111" font-size="42" font-weight="800" text-anchor="middle">—</text>'
    + '<text id="dRoad" x="500" y="128" fill="#cfe3f5" font-size="15" text-anchor="middle"></text></svg>';
  /* Jet glass-cockpit PFD: coaming + side pillars frame the outside view; center ADI with speed/alt tapes */
  const PLANE_DASH = '<svg viewBox="0 0 1000 320" preserveAspectRatio="xMidYMax slice">'
    + '<defs>'
    + '<linearGradient id="coam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a0c10"/><stop offset="1" stop-color="#151a22"/></linearGradient>'
    + '<linearGradient id="pfdBezel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#222831"/><stop offset="1" stop-color="#0e1218"/></linearGradient>'
    + '<clipPath id="ahClip"><rect x="368" y="108" width="264" height="168" rx="6"/></clipPath>'
    + '<clipPath id="spdClip"><rect x="292" y="108" width="68" height="168" rx="4"/></clipPath>'
    + '<clipPath id="altClip"><rect x="640" y="108" width="68" height="168" rx="4"/></clipPath>'
    + '</defs>'
    /* glare shield / coaming */
    + '<path d="M0,0 H1000 V78 Q780,118 500,122 Q220,118 0,78 Z" fill="url(#coam)"/>'
    + '<path d="M0,70 Q220,108 500,112 Q780,108 1000,70 L1000,78 Q780,118 500,122 Q220,118 0,78 Z" fill="#1a2028" opacity=".9"/>'
    /* side window pillars */
    + '<path d="M0,78 L110,118 L95,320 H0 Z" fill="#0c1016"/><path d="M1000,78 L890,118 L905,320 H1000 Z" fill="#0c1016"/>'
    /* panel base */
    + '<rect x="0" y="280" width="1000" height="40" fill="#0a0d12"/>'
    + '<rect x="250" y="96" width="500" height="196" rx="12" fill="url(#pfdBezel)" stroke="#2a3340" stroke-width="2"/>'
    /* airspeed tape */
    + '<rect x="292" y="108" width="68" height="168" rx="4" fill="#06090d" stroke="#2a3340"/>'
    + '<g clip-path="url(#spdClip)"><rect x="292" y="108" width="68" height="168" fill="#0a1018"/>'
    + '<text x="326" y="128" fill="#6a7580" font-size="10" text-anchor="middle" font-family="Overpass,sans-serif">IAS</text></g>'
    + '<rect x="298" y="172" width="56" height="40" rx="4" fill="#111820" stroke="#e8a838" stroke-width="1.5"/>'
    + '<text id="dKt" x="326" y="200" fill="#fff" font-size="26" font-weight="700" text-anchor="middle" font-family="Overpass Mono,monospace">0</text>'
    + '<text x="326" y="262" fill="#6a7580" font-size="10" text-anchor="middle">KT</text>'
    /* attitude (ADI) */
    + '<rect x="368" y="108" width="264" height="168" rx="6" fill="#05080c" stroke="#2a3340"/>'
    + '<g clip-path="url(#ahClip)"><g id="dHz">'
    + '<rect x="200" y="-80" width="600" height="272" fill="#2a6fad"/>'
    + '<rect x="200" y="192" width="600" height="272" fill="#7a5230"/>'
    + '<line x1="200" y1="192" x2="800" y2="192" stroke="#f2f4f7" stroke-width="3"/>'
    + [-20, -10, 10, 20].map((p) => '<line x1="470" x2="530" y1="' + (192 - p * 3.2) + '" y2="' + (192 - p * 3.2) + '" stroke="#fff" stroke-width="2"/>'
      + '<text x="458" y="' + (192 - p * 3.2 + 4) + '" fill="#fff" font-size="11" text-anchor="end" font-family="Overpass Mono,monospace">' + Math.abs(p) + '</text>').join('')
    + '</g></g>'
    + '<path d="M468,192 H492 L500,204 L508,192 H532" stroke="#ffcf3a" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'
    + '<line x1="368" y1="192" x2="400" y2="192" stroke="#ffcf3a" stroke-width="3"/><line x1="600" y1="192" x2="632" y2="192" stroke="#ffcf3a" stroke-width="3"/>'
    /* altitude tape */
    + '<rect x="640" y="108" width="68" height="168" rx="4" fill="#06090d" stroke="#2a3340"/>'
    + '<text x="674" y="128" fill="#6a7580" font-size="10" text-anchor="middle" font-family="Overpass,sans-serif">ALT</text>'
    + '<rect x="646" y="172" width="56" height="40" rx="4" fill="#111820" stroke="#7fd6a0" stroke-width="1.5"/>'
    + '<text id="dFt" x="674" y="200" fill="#fff" font-size="20" font-weight="700" text-anchor="middle" font-family="Overpass Mono,monospace">0</text>'
    + '<text x="674" y="248" fill="#6a7580" font-size="10" text-anchor="middle">FT</text>'
    + '<text id="dVs" x="674" y="268" fill="#7fd6a0" font-size="12" text-anchor="middle" font-family="Overpass Mono,monospace">0</text>'
    /* heading / mode line */
    + '<rect x="368" y="284" width="264" height="28" rx="6" fill="#0c1118" stroke="#2a3340"/>'
    + '<text id="dHdg" x="500" y="303" fill="#ffcf3a" font-size="13" font-weight="700" text-anchor="middle" font-family="Overpass Mono,monospace">HDG 000°</text>'
    + '</svg>';
  let dashKind = '';
  function hdgDeg() { return (((180 - S.hd * 180 / Math.PI) % 360) + 360) % 360; }
  function altFt() {
    /* AGL: deck sits ~1.4 m on runway; show feet above ground for roll/rollout/parked */
    if (S.kind === 'plane' && /roll|rollout|parked/.test(S.phase)) return Math.max(0, Math.round((S.p.y - 1.4) / FT));
    return Math.round(S.p.y / FT);
  }
  function vsFpm() { return Math.round(((S.vy || 0) / FT) * 60 / 10) * 10; }
  function drawDash() {
    const show = S.view === 'driver' || S.view === 'cockpit';
    dash.classList.toggle('on', show);
    if (!show) return;
    if (dashKind !== S.kind) { dash.innerHTML = S.kind === 'car' ? CAR_DASH : PLANE_DASH; dashKind = S.kind; }
    dash.classList.toggle('jetCockpit', S.kind === 'plane' && S.acClass === 'jet');
    const q = (id) => dash.querySelector('#' + id);
    if (S.kind === 'car') {
      const mph = Math.abs(S.v) / MPH, a = (135 + Math.min(140, mph) / 140 * 270) * Math.PI / 180;
      const n = q('dNeedle'); if (n) { n.setAttribute('x2', 640 + Math.cos(a) * 70); n.setAttribute('y2', 200 + Math.sin(a) * 70); }
      const ds = q('dSpd'); if (ds) ds.textContent = Math.round(mph);
      const gear = mph < 1 ? 1 : Math.min(6, 1 + Math.floor(mph / 16)), rpm = mph < 1 ? 0.75 : Math.min(7.5, 1.2 + (mph - (gear - 1) * 16) / 16 * 3.2 + gear * 0.1);
      const ra = (135 + rpm / 8 * 270) * Math.PI / 180; const rp = q('dRpm'); if (rp) { rp.setAttribute('x2', 360 + Math.cos(ra) * 56); rp.setAttribute('y2', 200 + Math.sin(ra) * 56); }
      const dg = q('dGear'); if (dg) dg.textContent = S.v < -0.2 ? 'R' : mph < 0.5 ? 'P' : 'D' + gear;
      const dt = q('dTrip'); if (dt) dt.textContent = (S.odo / 1609.344).toFixed(1) + ' mi';
      const dl = q('dLim'); if (dl) dl.textContent = S.limit ? S.limit : '—';
      const dr = q('dRoad'); if (dr) dr.textContent = S.info || '';
      const steer = Math.abs(S.v) > 0.5 ? Math.atan(2.7 * S.yawRate / S.v) : 0;
      const wh = q('dWheel'); if (wh) wh.setAttribute('transform', 'translate(500,300) rotate(' + Math.max(-540, Math.min(540, -steer * 15 * 180 / Math.PI)).toFixed(1) + ')');
    } else {
      const kt = q('dKt'); if (kt) kt.textContent = Math.round(S.v / KT);
      const ft = q('dFt'); if (ft) ft.textContent = altFt().toLocaleString();
      const vs = q('dVs'); if (vs) {
        const v = vsFpm();
        vs.textContent = (v >= 0 ? '+' : '') + v;
        vs.setAttribute('fill', v >= 0 ? '#7fd6a0' : '#f0a0a0');
      }
      const hd = q('dHdg'); if (hd) hd.textContent = 'HDG ' + String(Math.round(hdgDeg())).padStart(3, '0') + '° · ' + (S.info || S.phase || '');
      const hz = q('dHz'); if (hz) hz.setAttribute('transform', 'rotate(' + (-S.roll * 180 / Math.PI).toFixed(1) + ' 500 192) translate(0 ' + (S.pitch * 180 / Math.PI * 3.2).toFixed(1) + ')');
    }
  }
  const pad = document.createElement('div'); pad.id = 'tourPad'; document.body.appendChild(pad);
  [['', ''], ['▲', 'KeyW'], ['', ''], ['◀', 'KeyA'], ['▼', 'KeyS'], ['▶', 'KeyD'], ['−', 'KeyX'], ['', ''], ['+', 'ShiftLeft']].forEach(([t, k]) => {
    const b = document.createElement('button'); b.textContent = t; if (!k) b.style.visibility = 'hidden';
    const on = (e) => { e.preventDefault(); S.keys[k] = true; }, off = () => { S.keys[k] = false; };
    b.addEventListener('pointerdown', on); b.addEventListener('pointerup', off); b.addEventListener('pointerleave', off); b.addEventListener('pointercancel', off);
    pad.appendChild(b);
  });
  const FREE_KEYS = new Set(['KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyQ', 'KeyE', 'KeyX', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ShiftLeft', 'ShiftRight', 'Space']);
  addEventListener('keydown', (e) => {
    if (!S.mode) return;
    if (e.key === 'Escape') { stop(); return; }
    if (e.target && /INPUT|SELECT|TEXTAREA/.test(e.target.tagName)) return;
    if (/^Digit[1-5]$/.test(e.code)) { const v = VIEWS[S.kind][+e.code.slice(5) - 1]; if (v) setView(v[0]); return; }
    if (S.mode === 'free' && FREE_KEYS.has(e.code)) { S.keys[e.code] = true; e.preventDefault(); e.stopImmediatePropagation(); }
  }, true);
  addEventListener('keyup', (e) => { S.keys[e.code] = false; }, true);
  const key = (...c) => c.some((k) => S.keys[k]);

  function persistVeh() {
    prefs.carColor = S.carColor; prefs.carStyle = S.carStyle; prefs.planeColor = S.planeColor; prefs.planeStyle = S.planeStyle;
    savePrefs(prefs);
  }
  function spawnVehicle() {
    const pos = S.p.clone(), hd = S.hd, pitch = S.pitch, roll = S.roll;
    clearObj();
    if (S.kind === 'car') {
      S.obj = makeTourCar(S.carColor, S.carStyle); S.acClass = 'car';
    } else {
      const jet = S.planeStyle === 'jet' && typeof makeJet === 'function';
      S.obj = jet ? makeJet(S.planeColor) : makePlane(S.planeColor);
      S.acClass = jet ? 'jet' : 'prop';
      S.obj.scale.setScalar(jet ? 0.55 : 1);
      if (S.obj.userData && S.obj.userData.gear) S.obj.userData.gear.visible = /roll|rollout|parked|final/.test(S.phase);
    }
    scene.add(S.obj);
    S.obj.position.copy(pos);
    if (S.kind === 'car') S.obj.rotation.set(0, hd, 0);
    else S.obj.rotation.set(-pitch, hd, roll, 'YXZ');
  }
  function renderHud() {
    const views = VIEWS[S.kind].map(([id, n], i) => '<button data-view="' + id + '" class="' + (S.view === id ? 'on' : '') + '" title="key ' + (i + 1) + '">' + n + '</button>').join('');
    const speeds = S.kind === 'car' && S.mode === 'tour'
      ? '<span style="color:#8a96a3;align-self:center">Cruise</span>' + [0, 30, 40, 50, 60, 70, 80, 90].map((x) => '<button data-cruise="' + x + '" class="' + (S.cruise === x ? 'on' : '') + '">' + (x ? x : 'Limit +5') + '</button>').join('')
      : [1, 2, 4, 10].map((x) => '<button data-sx="' + x + '" class="' + (S.speedX === x ? 'on' : '') + '">×' + x + '</button>').join('');
    const styles = (S.kind === 'car' ? CAR_STYLES : PLANE_STYLES).map(([id, n]) => '<button data-style="' + id + '" class="' + ((S.kind === 'car' ? S.carStyle : S.planeStyle) === id ? 'on' : '') + '">' + n + '</button>').join('');
    const cols = (S.kind === 'car' ? CAR_COLORS : PLANE_COLORS).map((c) => {
      const on = (S.kind === 'car' ? S.carColor : S.planeColor) === c;
      return '<button type="button" class="sw' + (on ? ' on' : '') + '" data-col="' + c + '" style="background:#' + c.toString(16).padStart(6, '0') + '" title="Paint"></button>';
    }).join('');
    hud.innerHTML = '<div class="tt"><span><span class="drag" title="Drag panel">⠿</span><span id="tourTitle"></span></span><button class="x" data-exit="1">Exit (Esc)</button></div>'
      + (S.mode === 'tour' ? '<div class="tbar" id="tourBar" title="Tour progress"><i id="tourBarFill"></i><span class="tplane" id="tourBarIcon">' + (S.kind === 'plane' ? '✈' : '●') + '</span></div>' : '')
      + '<div class="tm" id="tourMeters">'
      + '<span><b id="mSpd">0</b> <span id="mSpdU">mph</span></span>'
      + '<span id="mAltWrap" style="display:none"><b id="mAlt">0</b> ft</span>'
      + '<span id="mVsWrap" style="display:none"><b id="mVs">0</b> fpm</span>'
      + '<span id="mHdgWrap" style="display:none">HDG <b id="mHdg">000</b>°</span>'
      + '<span id="mRemWrap" style="display:none"><b id="mRem">0.0</b> mi to go</span>'
      + '<span id="mEtaWrap" style="display:none">ETA <b id="mEta">—</b></span>'
      + '<span>trip <b id="mTrip">0.0</b> mi</span>'
      + '<span id="mLimWrap" style="display:none">limit <b id="mLim">—</b></span>'
      + '</div>'
      + '<div class="row">' + views + '</div>'
      + '<div class="row" style="margin-top:6px">' + speeds
      + (S.kind === 'plane' && S.mode === 'tour' ? '<span style="color:#8a96a3;align-self:center;margin-left:6px">Land at</span><select data-land="1" style="background:#1b232c;color:#dbe6f0;border:1px solid #34404c;border-radius:7px;padding:4px">' + airports().map((a) => '<option' + (a.code === S.landApt ? ' selected' : '') + '>' + a.code + '</option>').join('') + '</select><button data-landnow="1">Land now</button>' : '')
      + (S.mode === 'free' ? '<span style="color:#8a96a3;align-self:center;margin-left:6px">' + (S.kind === 'car' ? 'W/S throttle · A/D steer' : 'W/S pitch · A/D bank · Q/E yaw · Shift/X throttle') + '</span>' : '') + '</div>'
      + '<div class="row" style="margin-top:6px"><span style="color:#8a96a3">Vehicle</span>' + styles + '<span style="color:#8a96a3;margin-left:4px">Color</span>' + cols + '</div>';
    applyHudPos();
    hud.querySelectorAll('[data-view]').forEach((b) => b.addEventListener('click', () => setView(b.getAttribute('data-view'))));
    hud.querySelectorAll('[data-sx]').forEach((b) => b.addEventListener('click', () => { S.speedX = +b.getAttribute('data-sx'); renderHud(); }));
    hud.querySelectorAll('[data-cruise]').forEach((b) => b.addEventListener('click', () => { S.cruise = +b.getAttribute('data-cruise'); renderHud(); }));
    hud.querySelector('[data-exit]').addEventListener('click', stop);
    const ls = hud.querySelector('[data-land]'); if (ls) ls.addEventListener('change', () => {
      S.landApt = ls.value;
      if (/toFaf|final/.test(S.phase)) { S.phase = 'cruise'; S.landNow = false; startLanding({ force: true }); }
    });
    const ln = hud.querySelector('[data-landnow]'); if (ln) ln.addEventListener('click', () => {
      if (/roll|parked|rollout/.test(S.phase)) { note('Wait until you’re airborne, then Land now.'); return; }
      if (/toFaf|final/.test(S.phase)) { note('Already on approach to ' + (S.rw ? S.rw.code : S.landApt) + '.'); return; }
      if (!startLanding({ force: true })) note('Could not start landing — check the airport list.');
    });
    hud.querySelectorAll('[data-style]').forEach((b) => b.addEventListener('click', () => {
      if (S.kind === 'car') S.carStyle = b.getAttribute('data-style');
      else S.planeStyle = b.getAttribute('data-style');
      persistVeh(); spawnVehicle(); renderHud();
    }));
    hud.querySelectorAll('[data-col]').forEach((b) => b.addEventListener('click', () => {
      const c = +b.getAttribute('data-col');
      if (S.kind === 'car') S.carColor = c; else S.planeColor = c;
      persistVeh(); spawnVehicle(); renderHud();
    }));
  }
  function refreshMeters() {
    const mSpd = hud.querySelector('#mSpd'), mSpdU = hud.querySelector('#mSpdU');
    if (!mSpd) return;
    if (S.kind === 'car') {
      mSpd.textContent = String(Math.round(Math.abs(S.v) / MPH));
      if (mSpdU) mSpdU.textContent = 'mph';
      const lw = hud.querySelector('#mLimWrap'), ml = hud.querySelector('#mLim');
      if (lw) lw.style.display = S.limit ? '' : 'none';
      if (ml && S.limit) ml.textContent = String(S.limit);
      ['mAltWrap', 'mVsWrap', 'mHdgWrap'].forEach((id) => { const el = hud.querySelector('#' + id); if (el) el.style.display = 'none'; });
    } else {
      mSpd.textContent = String(Math.round(S.v / KT));
      if (mSpdU) mSpdU.textContent = 'kt';
      const aw = hud.querySelector('#mAltWrap'), vw = hud.querySelector('#mVsWrap'), hw = hud.querySelector('#mHdgWrap');
      if (aw) { aw.style.display = ''; const a = hud.querySelector('#mAlt'); if (a) a.textContent = altFt().toLocaleString(); }
      if (vw) { vw.style.display = ''; const v = hud.querySelector('#mVs'); if (v) { const fpm = vsFpm(); v.textContent = (fpm >= 0 ? '+' : '') + fpm; } }
      if (hw) { hw.style.display = ''; const h = hud.querySelector('#mHdg'); if (h) h.textContent = String(Math.round(hdgDeg())).padStart(3, '0'); }
      const lw = hud.querySelector('#mLimWrap'); if (lw) lw.style.display = 'none';
    }
    const trip = hud.querySelector('#mTrip'); if (trip) trip.textContent = (S.odo / 1609.344).toFixed(1);
    const rw = hud.querySelector('#mRemWrap'), ew = hud.querySelector('#mEtaWrap');
    if (S.mode === 'tour' && S.remain != null && S.phase !== 'arrived' && S.phase !== 'parked') {
      if (rw) { rw.style.display = ''; const r = hud.querySelector('#mRem'); if (r) r.textContent = (S.remain / 1609.344).toFixed(1); }
      const et = S.kind === 'car' ? etaSec() : planeEtaSec();
      if (ew && et != null) {
        ew.style.display = '';
        const at = new Date(Date.now() + et * 1000 / Math.max(1, S.speedX));
        const e = hud.querySelector('#mEta');
        if (e) e.textContent = Math.max(1, Math.round(et / 60)) + ' min · ' + at.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
      } else if (ew) ew.style.display = 'none';
    } else {
      if (rw) rw.style.display = 'none';
      if (ew) ew.style.display = 'none';
    }
    const fill = hud.querySelector('#tourBarFill'), icon = hud.querySelector('#tourBarIcon');
    if (fill && S.mode === 'tour') {
      const pct = Math.round(tourProgress() * 100);
      fill.style.width = pct + '%';
      if (icon) icon.style.left = pct + '%';
    }
  }
  function setView(v) {
    S.view = v; renderHud();
    window._followOff = { x: 0, z: 0 };
    S.th0 = camGoal.theta;
    const car = S.kind === 'car';
    if (v === 'orbit') { camGoal.radius = car ? 45 : 160; camGoal.phi = 1.1; }
    if (v === 'chase') { camGoal.radius = car ? 14 : 45; camGoal.phi = 1.25; }
    if (v === 'top') { camGoal.radius = car ? 160 : 600; }
    if (v === 'driver' || v === 'cockpit' || v === 'side' || v === 'wing') camGoal.phi = 1.5;
    S.ph0 = camGoal.phi;
  }

  /* ---------- car routing over the live carriageway graph ---------- */
  /* Prefer real corridors over ramps: traffic `next` links drop sharp turns, so ramps often
     become dead-ends for Dijkstra. Tour routing uses node keys (from→to) without the angle gate. */
  function cwScore(c, d) {
    let s = d;
    if (c.link || /_link$/.test(c.h || '')) s += 900;
    else if (c.h === 'motorway' || c.h === 'trunk') s -= 80;
    else if (c.h === 'primary') s -= 40;
    else if (c.street) s += 120;
    return s;
  }
  function nearestCw(C, x, z, maxD, preferMajor) {
    let best = null, bd = maxD, bs = Infinity;
    for (const c of C) {
      if (x < c.x0 - bd || x > c.x1 + bd || z < c.z0 - bd || z > c.z1 + bd) continue;
      if (preferMajor && c.street) continue;
      const f = c.f;
      for (let i = 0; i < f.n; i++) {
        const d = Math.hypot(f.pts[2 * i] - x, f.pts[2 * i + 1] - z);
        if (d > bd && d > maxD) continue;
        const sc = cwScore(c, d);
        if (sc < bs) { bs = sc; bd = Math.max(d, 40); best = { c, i }; }
      }
    }
    return best;
  }
  function nearestCwList(C, x, z, maxD, n, preferMajor) {
    const hits = [];
    for (const c of C) {
      if (x < c.x0 - maxD || x > c.x1 + maxD || z < c.z0 - maxD || z > c.z1 + maxD) continue;
      if (preferMajor && c.street) continue;
      const f = c.f;
      let bi = 0, bd = Infinity;
      for (let i = 0; i < f.n; i++) {
        const d = Math.hypot(f.pts[2 * i] - x, f.pts[2 * i + 1] - z);
        if (d < bd) { bd = d; bi = i; }
      }
      if (bd <= maxD) hits.push({ c, i: bi, sc: cwScore(c, bd) });
    }
    hits.sort((a, b) => a.sc - b.sc);
    const out = [], seen = new Set();
    for (const h of hits) {
      if (seen.has(h.c)) continue;
      seen.add(h.c);
      out.push(h);
      if (out.length >= n) break;
    }
    return out;
  }
  function routeIndex(C) {
    const byFrom = new Map();
    for (const c of C) {
      let l = byFrom.get(c.from);
      if (!l) byFrom.set(c.from, (l = []));
      l.push(c);
    }
    return byFrom;
  }
  function dijkstra(a, b, byFrom) {
    const dist = new Map([[a.c, 0]]), prev = new Map(), heap = [[0, a.c]];
    const pushH = (e) => { heap.push(e); let i = heap.length - 1; while (i) { const p = (i - 1) >> 1; if (heap[p][0] <= heap[i][0]) break; [heap[p], heap[i]] = [heap[i], heap[p]]; i = p; } };
    const popH = () => { const top = heap[0], last = heap.pop(); if (heap.length) { heap[0] = last; let i = 0; for (;;) { const l = 2 * i + 1, r = l + 1; let m = i; if (l < heap.length && heap[l][0] < heap[m][0]) m = l; if (r < heap.length && heap[r][0] < heap[m][0]) m = r; if (m === i) break; [heap[m], heap[i]] = [heap[i], heap[m]]; i = m; } } return top; };
    const goals = b instanceof Set ? b : new Set([b.c]);
    let it = 0, hit = null;
    while (heap.length && it++ < 900000) {
      const [d, c] = popH();
      if (goals.has(c)) { hit = c; break; }
      if (d > dist.get(c)) continue;
      const nbrs = byFrom ? (byFrom.get(c.to) || []) : null;
      if (nbrs) {
        for (const e of nbrs) {
          if (e === c) continue;
          const nd = d + e.L / Math.max(8, e.ff * MPH);
          if (nd < (dist.has(e) ? dist.get(e) : Infinity)) { dist.set(e, nd); prev.set(e, c); pushH([nd, e]); }
        }
      } else {
        for (const nx of c.next) {
          const e = nx.c, nd = d + e.L / Math.max(8, e.ff * MPH);
          if (nd < (dist.has(e) ? dist.get(e) : Infinity)) { dist.set(e, nd); prev.set(e, c); pushH([nd, e]); }
        }
      }
    }
    if (!hit) return null;
    const seq = []; for (let c = hit; c; c = prev.get(c)) { seq.push(c); if (c === a.c) break; }
    return seq[seq.length - 1] === a.c ? seq.reverse() : null;
  }
  function findRoute(T, ox, oz, dx, dz) {
    const C = T.carriageways;
    if (!C || !C.length) return null;
    const byFrom = routeIndex(C);
    const starts = nearestCwList(C, ox, oz, 18000, 10, true);
    if (!starts.length) {
      const a = nearestCw(C, ox, oz, 25000, false);
      if (a) starts.push(a);
    }
    const ends = nearestCwList(C, dx, dz, 18000, 12, true);
    if (!ends.length) {
      const b = nearestCw(C, dx, dz, 30000, false);
      if (b) ends.push(b);
    }
    if (!starts.length || !ends.length) return null;
    const goalSet = new Set(ends.map((e) => e.c));
    const endByCw = new Map(ends.map((e) => [e.c, e]));
    for (const a of starts) {
      const seq = dijkstra(a, goalSet, byFrom);
      if (!seq) continue;
      const last = seq[seq.length - 1];
      const b = endByCw.get(last) || { c: last, i: Math.floor(last.f.n / 2) };
      const path = buildPath(seq, a, b);
      if (path) return path;
    }
    /* Hub via Downtown when origin/dest lie in poorly linked components */
    const hub = nearestCwList(C, 60, 60, 12000, 6, true);
    if (hub.length) {
      for (const a of starts) {
        const toHub = dijkstra(a, new Set(hub.map((h) => h.c)), byFrom);
        if (!toHub) continue;
        const hCw = toHub[toHub.length - 1];
        const hSnap = hub.find((h) => h.c === hCw) || { c: hCw, i: Math.floor(hCw.f.n / 2) };
        const fromHub = dijkstra(hSnap, goalSet, byFrom);
        if (!fromHub) continue;
        const last = fromHub[fromHub.length - 1];
        const b = endByCw.get(last) || { c: last, i: Math.floor(last.f.n / 2) };
        const merged = toHub.concat(fromHub.slice(1));
        const path = buildPath(merged, a, b);
        if (path) return path;
      }
    }
    return null;
  }
  function buildPath(seq, a, b) {
    const P = [];
    seq.forEach((c, k) => {
      const f = c.f, n = f.n, li = Math.max(0, c.nl - 1);
      const off = (c.hw - 0.6 - (li + 0.5) * c.laneW) * c.sign;
      const idx = []; for (let j = 0; j < n; j++) idx.push(c.sign > 0 ? j : n - 1 - j);
      let from = 0, to = n - 1;
      if (k === 0) from = Math.max(0, idx.indexOf(a.i));
      if (k === seq.length - 1) to = Math.max(from + 1, idx.indexOf(b.i));
      for (let q = k ? Math.max(from, 1) : from; q <= to; q++) {
        const i = idx[q];
        P.push({ x: f.pts[2 * i] + f.nx[i] * f.m[i] * off, z: f.pts[2 * i + 1] + f.nz[i] * f.m[i] * off,
          y: c.y0 + (f.ys ? f.ys[i] : 0) + 0.02, ff: c.ff, ref: c.ref || '' });
      }
    });
    let s = 0; P.forEach((p, i) => { if (i) s += Math.hypot(p.x - P[i - 1].x, p.z - P[i - 1].z); p.s = s; });
    return P.length > 1 ? P : null;
  }
  function sampleAt(P, s, o) {
    let i = S._si || 0;
    while (i < P.length - 2 && P[i + 1].s < s) i++;
    while (i > 0 && P[i].s > s) i--;
    S._si = i;
    const a = P[i], b = P[i + 1], t = Math.min(1, Math.max(0, (s - a.s) / ((b.s - a.s) || 1)));
    o.x = a.x + (b.x - a.x) * t; o.y = a.y + (b.y - a.y) * t; o.z = a.z + (b.z - a.z) * t; o.hd = Math.atan2(b.x - a.x, b.z - a.z); o.ff = a.ff; o.ref = a.ref; o.i = i;
    return o;
  }
  /* sharpest heading change over the next ~60 m → max cornering speed (≈3 m/s² lateral) */
  function curveLimit(P, i) {
    let j = i, h0 = Math.atan2(P[Math.min(i + 1, P.length - 1)].x - P[i].x, P[Math.min(i + 1, P.length - 1)].z - P[i].z), turn = 0, dist = 0;
    while (j < P.length - 2 && dist < 60) {
      const h = Math.atan2(P[j + 2].x - P[j + 1].x, P[j + 2].z - P[j + 1].z);
      let d = h - h0; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI;
      turn = Math.max(turn, Math.abs(d)); dist = P[j + 1].s - P[i].s; j++;
    }
    if (turn < 0.05) return 1e9;
    return Math.sqrt(3 * Math.max(15, dist) / turn);
  }

  /* ---------- start / stop ---------- */
  function clearObj() { if (S.obj) { scene.remove(S.obj); S.obj.traverse((o) => { if (o.geometry) o.geometry.dispose(); }); S.obj = null; } }
  function nearestAptTo(x, z) {
    const list = airports() || [];
    if (!list.length) return null;
    return list.map((q) => ({ q, d: Math.hypot(q.x - x, q.z - z) })).sort((a, b) => a.d - b.d)[0];
  }
  /* Prefer already-known GPS; otherwise a short browser ask; never block the tour for long. */
  function locate() {
    const g = getUserGeo && getUserGeo();
    if (g && Number.isFinite(g.lat)) return Promise.resolve(g);
    if (!navigator.geolocation) return Promise.resolve(null);
    return new Promise((res) => {
      const t = setTimeout(() => res(null), 2500);
      navigator.geolocation.getCurrentPosition(
        (p) => { clearTimeout(t); res({ lat: p.coords.latitude, lng: p.coords.longitude }); },
        () => { clearTimeout(t); res(null); },
        { enableHighAccuracy: false, timeout: 2200, maximumAge: 120000 },
      );
    });
  }
  async function waitTraffic(ms) {
    const t0 = performance.now();
    while (performance.now() - t0 < (ms || 10000)) {
      const T = getTraffic && getTraffic();
      if (T && T.carriageways && T.carriageways.length > 20) return T;
      note('Loading Houston roads for the tour…');
      await new Promise((r) => setTimeout(r, 250));
    }
    return getTraffic && getTraffic();
  }
  async function start(kind, mode, dest) {
    if (S._starting) return;
    S._starting = true;
    try {
      note(kind === 'car' && mode === 'tour' ? 'Starting car tour…' : 'Starting…');
      const g = await locate();
      let origin = null, fromUser = false;
      if (g) {
        const w = geoToWorld(g.lat, g.lng);
        if (Math.hypot(w.x, w.z) < 90000) { origin = w; fromUser = true; }
      }
      /* Map centre is the reliable default — GPS is a bonus when inside the metro. */
      if (!origin) origin = { x: cam.target.x, z: cam.target.z };
      S.fromTxt = fromUser ? 'your location' : (g ? 'map centre (outside Houston metro GPS)' : 'map centre');
      await begin(kind, mode, dest, origin);
    } finally {
      S._starting = false;
    }
  }
  async function begin(kind, mode, dest, origin) {
    stopFollow && stopFollow();
    clearObj();
    window._followOff = { x: 0, z: 0 };
    S.kind = kind; S.mode = mode; S.dest = dest; S.view = 'chase'; S.v = 0; S.pitch = 0; S.roll = 0; S.s = 0; S._si = 0; S.route = null; S.phase = ''; S.odo = 0; S.vy = 0;
    S.th0 = camGoal.theta; S.ph0 = camGoal.phi; camGoal.radius = kind === 'car' ? 14 : 45; camGoal.phi = 1.25; S.ph0 = 1.25;
    const cx = origin.x, cz = origin.z;
    S.origin = { x: cx, z: cz }; S.leg = 'out'; S.waitT = 0; S.orbT = 0;
    if (kind === 'car') {
      const T = mode === 'tour' ? await waitTraffic(12000) : (getTraffic && getTraffic());
      if (!T || !T.carriageways || !T.carriageways.length) {
        note('Houston road network is still loading — wait a few seconds, then tap Start tour again.');
        S.mode = null; clearObj(); return;
      }
      let a = nearestCw(T.carriageways, cx, cz, 18000, true)
        || nearestCw(T.carriageways, cx, cz, 25000, false)
        || nearestCw(T.carriageways, 60, 60, 30000, true);
      if (!a) {
        note('No driveable road nearby yet — pan over a freeway or street, then Start tour again.');
        S.mode = null; clearObj(); return;
      }
      const f = a.c.f, i = a.i, j = Math.min(f.n - 1, i + 1), i0 = j === i ? Math.max(0, i - 1) : i;
      S.p.set(f.pts[2 * i], a.c.y0 + 0.02, f.pts[2 * i + 1]);
      S.hd = Math.atan2(f.pts[2 * j] - f.pts[2 * i0], f.pts[2 * j + 1] - f.pts[2 * i0 + 1]) + (a.c.sign > 0 ? 0 : Math.PI);
      if (mode === 'tour') {
        try {
          const R = getRoads && getRoads();
          if (R && R.update) R.update(dest.x, dest.z, 0);
        } catch (e) { /* ignore */ }
        S.route = findRoute(T, a.c.f.pts[2 * a.i], a.c.f.pts[2 * a.i + 1], dest.x, dest.z)
          || findRoute(T, cx, cz, dest.x, dest.z)
          || findRoute(T, 60, 60, dest.x, dest.z);
        if (!S.route) {
          note('No connected road route to ' + dest.n + ' yet — wait for roads to finish loading, then try again.');
          S.mode = null; clearObj(); return;
        }
        const p0 = S.route[0];
        S.p.set(p0.x, p0.y, p0.z);
        if (S.route.length > 1) S.hd = Math.atan2(S.route[1].x - p0.x, S.route[1].z - p0.z);
        S.phase = 'drive'; S.tripLen = S.route[S.route.length - 1].s;
      }
      spawnVehicle();
    } else {
      if (mode === 'tour') {
        const apStart = nearestAptTo(cx, cz) || nearestAptTo(dest.x, dest.z);
        const apLand = nearestAptTo(dest.x, dest.z) || apStart;
        if (!apStart) { note('No airports loaded yet — try again in a moment.'); S.mode = null; clearObj(); return; }
        const ap = apStart;
        const rws = (S.runways || []).filter((r) => Math.hypot(r.p[0] - ap.q.x, r.p[1] - ap.q.z) < 4500 && r.w >= 15);
        rws.sort((r1, r2) => Math.hypot(r2.p[r2.p.length - 2] - r2.p[0], r2.p[r2.p.length - 1] - r2.p[1]) - Math.hypot(r1.p[r1.p.length - 2] - r1.p[0], r1.p[r1.p.length - 1] - r1.p[1]));
        const r = rws[0];
        if (r) {
          let ax = r.p[0], az = r.p[1], bx = r.p[r.p.length - 2], bz = r.p[r.p.length - 1];
          const h1 = Math.atan2(bx - ax, bz - az), toD = Math.atan2(dest.x - ax, dest.z - az);
          const df = (u) => Math.abs(Math.atan2(Math.sin(u - toD), Math.cos(u - toD)));
          if (df(h1 + Math.PI) < df(h1)) [ax, az, bx, bz] = [bx, bz, ax, az];
          S.p.set(ax, 1.4, az); S.hd = Math.atan2(bx - ax, bz - az); S.rwLen = Math.hypot(bx - ax, bz - az);
        } else { S.p.set(ap.q.x, 1.4, ap.q.z); S.hd = Math.atan2(dest.x - ap.q.x, dest.z - ap.q.z); S.rwLen = 1500; }
        S.apt = ap.q.code; S.homeApt = ap.q.code;
        S.landApt = (apLand && apLand.q.code) || ap.q.code;
        S.phase = 'roll'; S.rollS = 0;
        S.trip0 = Math.hypot(dest.x - S.p.x, dest.z - S.p.z);
        S.flightT0 = performance.now();
        const cruiseKt = S.planeStyle === 'jet' ? 220 : 110;
        S.flightEta0 = S.trip0 / (cruiseKt * KT) + 90;
      } else {
        S.p.set(cx, 600, cz); S.hd = cam.theta + Math.PI; S.v = 55; S.phase = 'free';
      }
      spawnVehicle();
    }
    renderHud(); hud.classList.add('on'); applyHudPos();
    pad.classList.toggle('on', mode === 'free' && matchMedia('(pointer:coarse)').matches);
    if (mode === 'tour' && kind === 'plane') {
      note('Departing ' + S.apt + ' for ' + dest.n + ' — will land at ' + S.landApt + ' (nearest airport to the destination). Starting from ' + S.fromTxt + '.');
    } else {
      note((mode === 'tour' ? (kind === 'car' ? 'Driving to ' + dest.n : 'Departing ' + S.apt + ' for ' + dest.n) : (kind === 'car' ? 'Free drive (W/S, A/D)' : 'Free flight (W/S pitch, A/D bank)')) + ' · starting from ' + S.fromTxt + '.');
    }
  }
  function stop() {
    S.mode = null; clearObj(); hud.classList.remove('on'); pad.classList.remove('on'); dash.classList.remove('on'); window._followOff = { x: 0, z: 0 };
    if (camera.fov !== 55) { camera.fov = 55; camera.updateProjectionMatrix(); }
    camera.up.set(0, 1, 0); camGoal.radius = Math.max(camGoal.radius, 600); camGoal.phi = 0.95;
  }

  /* ---------- per-frame ---------- */
  const o = {}, v3 = new THREE.Vector3(), look = new THREE.Vector3();
  /* nearest simulated car ahead in our lane, and red/amber stop lines ahead → IDM virtual leaders */
  function leaderAhead(T, px, pz, hd, maxD) {
    let gap = maxD, lv = 30;
    const fx = Math.sin(hd), fz = Math.cos(hd);
    if (T && T.active) for (const c of T.active) {
      if (px < c.x0 - maxD || px > c.x1 + maxD || pz < c.z0 - maxD || pz > c.z1 + maxD || !c.lanes) continue;
      for (const lane of c.lanes) for (const car of lane) {
        if (car._px == null) continue;
        const dx = car._px - px, dz = car._pz - pz, along = dx * fx + dz * fz;
        if (along < 1 || along - 4.6 > gap) continue;
        if (Math.abs(dx * fz - dz * fx) > 1.7 || (car._fx * fx + car._fz * fz) < 0.75) continue;
        gap = along - 4.6; lv = car.v;
      }
    }
    if (T && T.signalsNear) T.signalsNear(px, pz, Math.min(maxD, 160), (sx, sy, sz, inX, inZ, tx, tz, state, hw) => {
      if (state === 'g' || tx * fx + tz * fz < 0.8) return;
      const dx = sx - px, dz = sz - pz, along = dx * fx + dz * fz;
      if (along < 0.5 || Math.abs(dx * fz - dz * fx) > hw + 2.5) return;
      if (state === 'y' && along < (S.v * S.v) / (2 * 3.5)) return; /* too close to stop on amber: go */
      if (along - 1.5 < gap) { gap = along - 1.5; lv = 0; }
    });
    return [gap, lv];
  }
  function idm(v, v0, gap, lv) {
    const a = 2.2, b = 3.2, s0 = 3, Th = 1.3;
    const ss = s0 + Math.max(0, v * Th + (v * (v - lv)) / (2 * Math.sqrt(a * b)));
    return a * (1 - Math.pow(Math.max(0, v) / Math.max(1, v0), 4) - Math.pow(ss / Math.max(0.5, gap), 2));
  }
  /* Houston drive times mirror typical Google/Apple ranges: peak freeways ~45–55% of posted,
     midday ~80–90%, late night near limit. Sugar Land→Downtown (~20 mi) ≈ 26–40 min. */
  function houDriveFactor() {
    const d = new Date();
    const h = ((d.getUTCHours() - 5 + 24) % 24) + d.getUTCMinutes() / 60;
    const weekend = d.getUTCDay() === 0 || d.getUTCDay() === 6;
    if (h >= 7 && h < 9) return weekend ? 0.72 : 0.48;
    if (h >= 16 && h < 19) return weekend ? 0.70 : 0.45;
    if (h >= 6 && h < 7) return 0.62;
    if (h >= 9 && h < 10) return 0.68;
    if (h >= 15 && h < 16) return 0.58;
    if (h >= 19 && h < 20.5) return 0.65;
    if (h >= 0 && h < 5) return 0.95;
    return 0.78; /* midday / off-peak — still under free-flow like real Houston apps */
  }
  function cruiseMps(ff, x, z) {
    if (S.cruise) return S.cruise * MPH;
    const limit = Math.max(20, ff || 45);
    let mph = limit * houDriveFactor();
    /* Live probe / modelled congestion near this point when traffic is warm */
    try {
      const T = getTraffic && getTraffic();
      if (T && T.speedNear && x != null) {
        const live = T.speedNear(x, z, 120);
        if (live && live.n >= 2 && live.ratio > 0.1) {
          const probe = limit * Math.min(1.08, Math.max(0.22, live.ratio));
          mph = Math.min(limit * 1.02, Math.max(12, probe * 0.75 + mph * 0.25));
        }
      }
    } catch (e) { /* ignore */ }
    /* Arterials crawl more than freeways in Houston peaks */
    if (limit <= 45) mph = Math.min(mph, limit * Math.max(0.42, houDriveFactor() - 0.05));
    return Math.max(8, Math.min(limit + 2, mph)) * MPH;
  }
  function stepCar(dt) {
    const T = getTraffic && getTraffic();
    const h0 = S.hd;
    if (S.mode === 'tour') {
      const P = S.route, end = P[P.length - 1].s;
      sampleAt(P, S.s, o);
      S.limit = o.ff;
      const v0 = Math.min(cruiseMps(o.ff, o.x, o.z), curveLimit(P, o.i));
      let [gap, lv] = leaderAhead(T, S.p.x, S.p.z, S.hd, 200);
      if (end - S.s - 2 < gap) { gap = Math.max(0.1, end - S.s - 2); lv = 0; }
      const acc = Math.max(-7, idm(S.v, v0, gap, lv));
      S.v = Math.max(0, S.v + acc * dt);
      const ds = S.v * dt; S.s = Math.min(end, S.s + ds); S.odo += ds;
      sampleAt(P, S.s, o);
      S.p.set(o.x, o.y, o.z);
      let d = o.hd - S.hd; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; S.hd += d * Math.min(1, dt * 8);
      S.info = o.ref; S.remain = end - S.s;
      if (S.remain < 3 && S.v < 0.5 && S.phase === 'drive') {
        if (S.leg === 'out') { S.phase = 'arrived'; S.waitT = 0; note('Arrived at ' + S.dest.n + ' — heading back to where you started in a few seconds.'); }
        else { S.phase = 'home'; note('Back where you started. Pick another place to tour.'); }
      }
      if (S.phase === 'arrived' && (S.waitT += dt) > 6) {
        const P2 = T && findRoute(T, S.p.x, S.p.z, S.origin.x, S.origin.z);
        if (P2) { S.route = P2; S.s = 0; S._si = 0; S.leg = 'back'; S.phase = 'drive'; S.tripLen = P2[P2.length - 1].s; note('Driving back to where you started.'); }
        else { S.phase = 'home'; note('No road route back from here — tour ended.'); }
      }
    } else {
      const thr = key('KeyW', 'ArrowUp') ? 3.2 : 0, brk = key('KeyS', 'ArrowDown') ? 6 : 0;
      if (brk && S.v <= 0.3) S.v = Math.max(-6, S.v - 2 * dt); else S.v += (thr - brk * Math.sign(S.v)) * dt - S.v * 0.04 * dt;
      S.v = Math.min(45, S.v);
      const steer = (key('KeyA', 'ArrowLeft') ? 1 : 0) - (key('KeyD', 'ArrowRight') ? 1 : 0);
      const ang = steer * 0.52 / (1 + Math.abs(S.v) / 14);
      S.hd += S.v / 2.7 * Math.tan(ang) * dt;
      S.p.x += Math.sin(S.hd) * S.v * dt; S.p.z += Math.cos(S.hd) * S.v * dt; S.odo += Math.abs(S.v) * dt;
      const R = getRoads && getRoads(), h = R && R.heightAt ? R.heightAt(S.p.x, S.p.z, S.p.y) : null;
      const gy = h != null && Math.abs(h - S.p.y) < 2.5 ? h + 0.02 : (S.p.y > 1.2 && h == null ? S.p.y : 0.27);
      S.p.y += (gy - S.p.y) * Math.min(1, dt * 10);
      S.info = ''; S.limit = 0;
    }
    let dh = S.hd - h0; while (dh > Math.PI) dh -= 2 * Math.PI; while (dh < -Math.PI) dh += 2 * Math.PI;
    S.yawRate += ((dt > 0 ? dh / dt : 0) - S.yawRate) * Math.min(1, dt * 6);
    S.obj.position.copy(S.p); S.obj.rotation.set(0, S.hd, 0);
  }
  /* time to go along the rest of the route at the speed you would actually hold (cruise, limit, curves) */
  /* landing runway at an airport: longest OSM runway, landing in the direction we arrive from */
  function pickRunway(code, fx, fz) {
    const ap = airports().find((q) => q.code === code); if (!ap) return null;
    /* only runways inside that airport's real OSM aerodrome outline (midpoint test), never a road */
    const inR = (f, x, z) => { let c = false; for (let i = 0, j = f.length - 2; i < f.length; j = i, i += 2) { const xi = f[i], zi = f[i + 1], xj = f[j], zj = f[j + 1]; if ((zi > z) !== (zj > z) && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) c = !c; } return c; };
    const aero = (S.aeros || []).find((a) => a.iata === code);
    const mid = (r) => { const n = r.p.length; return [(r.p[0] + r.p[n - 2]) / 2, (r.p[1] + r.p[n - 1]) / 2]; };
    const rws = (S.runways || []).filter((r) => r.w >= 15 && (aero ? inR(aero.r, ...mid(r)) : Math.hypot(mid(r)[0] - ap.x, mid(r)[1] - ap.z) < 4500));
    if (!rws.length) return null;
    const len = (r) => Math.hypot(r.p[r.p.length - 2] - r.p[0], r.p[r.p.length - 1] - r.p[1]);
    rws.sort((a, b) => len(b) - len(a));
    const r = rws[0]; let ax = r.p[0], az = r.p[1], bx = r.p[r.p.length - 2], bz = r.p[r.p.length - 1];
    if (Math.hypot(bx - fx, bz - fz) < Math.hypot(ax - fx, az - fz)) [ax, az, bx, bz] = [bx, bz, ax, az];
    const hd = Math.atan2(bx - ax, bz - az), num = Math.round(((((180 - hd * 180 / Math.PI) % 360) + 360) % 360) / 10) || 36;
    return { code, tx: ax, tz: az, ex: bx, ez: bz, hd, len: len(r), name: String(num).padStart(2, '0') };
  }
  function startLanding(opts) {
    if (S.kind !== 'plane' || S.mode !== 'tour' || /toFaf|final|rollout|parked/.test(S.phase)) return false;
    const force = !!(opts && opts.force);
    /* Respect the Land-at dropdown; only auto-pick nearest-to-dest when none chosen */
    if (!S.landApt && S.dest) {
      const near = nearestAptTo(S.dest.x, S.dest.z);
      if (near) S.landApt = near.q.code;
    }
    const code = S.landApt || S.homeApt;
    const rw = pickRunway(code, S.p.x, S.p.z);
    if (!rw) { note('No runway data for ' + code + ' — pick another airport.'); return false; }
    S.rw = rw; S.landNow = force;
    const distRw = Math.hypot(rw.tx - S.p.x, rw.tz - S.p.z);
    /* Already near the field: skip the long FAF intercept and join final */
    if (force && distRw < 9000) {
      S.phase = 'final';
      note('Short final · ' + rw.code + ' runway ' + rw.name + '.');
    } else {
      S.phase = 'toFaf';
      note((force ? 'Landing now' : 'Landing') + ' at ' + rw.code + ' runway ' + rw.name
        + (S.dest ? ' (for ' + S.dest.n + ')' : '') + '.');
    }
    return true;
  }
  function etaSec() {
    const P = S.route; if (!P) return null;
    let t = 0;
    const i0 = Math.max(1, (S._si || 0) + 1);
    /* Sample every ~N points for speed; still realtime as you drive */
    const step = Math.max(1, Math.floor((P.length - i0) / 180));
    for (let i = i0; i < P.length; i += step) {
      const a = P[Math.max(i0 - 1, i - step)], b = P[i];
      const ds = b.s - a.s;
      const v = Math.max(4.5, Math.min(cruiseMps(b.ff || a.ff, b.x, b.z), curveLimit(P, i)));
      t += ds / v;
    }
    const cur = Math.max(4.5, S.v || cruiseMps(P[Math.min(P.length - 1, S._si || 0)].ff, S.p.x, S.p.z));
    t += Math.max(0, (P[Math.min(P.length - 1, (S._si || 0) + 1)].s - S.s)) / cur;
    /* Blend with “how long at current pace” so the HUD tracks live speed */
    const rem = P[P.length - 1].s - S.s;
    const live = rem / Math.max(4.5, S.v || cur);
    return t * 0.72 + live * 0.28;
  }
  function stepPlane(dt) {
    let wantHd = S.hd, wantY = S.p.y, wantV = S.v;
    const jet = S.acClass === 'jet';
    const cruiseKt = jet ? 220 : 110, climbKt = jet ? 160 : 95, rotateKt = jet ? 130 : 55, cruiseAlt = jet ? 3500 : 1500;
    if (S.mode === 'tour') {
      const D = S.dest, dx = D.x - S.p.x, dz = D.z - S.p.z, dist = Math.hypot(dx, dz), brg = Math.atan2(dx, dz);
      if (S.phase === 'roll') {
        S.v += (jet ? 4.5 : 2.2) * dt; S.rollS += S.v * dt; S.p.y = 1.4; S.vy = 0;
        if (S.v >= rotateKt * KT) S.phase = 'climb';
      } else if (S.phase === 'rollout' || S.phase === 'parked') {
        S.p.y = 1.4; S.vy = 0; S.v = Math.max(0, S.v - (jet ? 4 : 2.6) * dt);
        if (S.phase === 'rollout' && S.v < 0.5) {
          S.phase = 'parked';
          note('Landed at ' + S.rw.code + ' (near ' + (S.dest ? S.dest.n : 'destination') + '), runway ' + S.rw.name + '. Pick another place to fly.');
        }
      } else {
        const agl = S.p.y;
        if (S.phase === 'climb') { wantV = climbKt * KT; wantY = cruiseAlt * FT; if (agl > 150) wantHd = brg; if (agl > (cruiseAlt - 100) * FT) S.phase = 'cruise'; }
        if (S.phase === 'cruise') {
          wantV = cruiseKt * KT; wantY = dist < (jet ? 6000 : 3500) ? Math.min(1000, cruiseAlt * 0.65) * FT : cruiseAlt * FT; wantHd = brg;
          if (dist < S.orbitR * 1.35) {
            const near = nearestAptTo(D.x, D.z);
            if (near) S.landApt = near.q.code;
            S.phase = 'orbit'; S.orbT = 0;
            note('Over ' + D.n + ' — lining up to land at ' + S.landApt + '.');
          }
        }
        if (S.phase === 'orbit') {
          if ((S.orbT += dt) > 14) startLanding();
          wantV = (jet ? 140 : 95) * KT; wantY = 1000 * FT;
          const err = (dist - S.orbitR) / S.orbitR;
          wantHd = brg - Math.PI / 2 * (1 - Math.max(-0.8, Math.min(0.8, err)));
        }
        if (S.phase === 'toFaf' || S.phase === 'final') {
          const rw = S.rw, ux = Math.sin(rw.hd), uz = Math.cos(rw.hd);
          const ax = rw.tx + ux * 300, az = rw.tz + uz * 300;
          const along = (S.p.x - ax) * ux + (S.p.z - az) * uz, xt = (S.p.x - ax) * uz - (S.p.z - az) * ux;
          if (S.phase === 'toFaf') {
            const fafDist = S.landNow ? Math.min(7000, Math.max(2500, Math.hypot(rw.tx - S.p.x, rw.tz - S.p.z) * 0.65)) : 9000;
            const fx = rw.tx - ux * fafDist, fz = rw.tz - uz * fafDist;
            wantHd = Math.atan2(fx - S.p.x, fz - S.p.z);
            wantV = (jet ? 140 : 100) * KT; wantY = Math.max(800, Math.min(cruiseAlt, 1500)) * FT;
            const dFaf = Math.hypot(fx - S.p.x, fz - S.p.z);
            if (dFaf < (S.landNow ? 700 : 900) || (along < -800 && along > -fafDist - 500 && Math.abs(xt) < (S.landNow ? 900 : 600))) S.phase = 'final';
            S.remain = Math.hypot(rw.tx - S.p.x, rw.tz - S.p.z);
          } else {
            /* Aim at threshold; stronger intercept when Land now */
            const kXt = S.landNow ? 0.008 : 0.004;
            wantHd = Math.atan2(ax - S.p.x, az - S.p.z);
            if (along > -4500 && Math.abs(xt) < 1200) wantHd = rw.hd + Math.max(-0.7, Math.min(0.7, xt * kXt));
            wantV = (jet ? 90 : 65) * KT;
            wantY = Math.max(1.4, (-along) * Math.tan(3 * Math.PI / 180) + 1.4);
            S.remain = Math.max(0, Math.hypot(rw.tx - S.p.x, rw.tz - S.p.z));
            if ((S.p.y <= 12 && along > -350) || along > 40 || (S.landNow && along > -120 && Math.abs(xt) < 80)) {
              S.phase = 'rollout'; S.p.y = 1.4; S.vy = 0; S.pitch = 0; S.roll = 0; S.hd = rw.hd; S.landNow = false;
              S.p.x = rw.tx + ux * Math.max(0, Math.min(rw.len * 0.35, Math.max(0, along + 200)));
              S.p.z = rw.tz + uz * Math.max(0, Math.min(rw.len * 0.35, Math.max(0, along + 200)));
            }
          }
        }
        const climb = Math.max(-5, Math.min(S.phase === 'climb' ? 3.6 : 3.2, (wantY - S.p.y) * (S.phase === 'final' ? 0.65 : 0.1)));
        S.vy += (climb - (S.vy || 0)) * Math.min(1, dt * 0.9);
        S.p.y = Math.max(1.4, S.p.y + S.vy * dt);
        if (S.phase === 'final') {
          const gy = wantY;
          S.p.y += (gy - S.p.y) * Math.min(1, dt * (S.landNow ? 2.4 : 1.8));
          if (S.p.y > gy + 2) S.p.y = gy + 2;
          S.vy = -Math.tan(3 * Math.PI / 180) * S.v;
        }
        S.v += Math.max(-1.8 * dt, Math.min(2.2 * dt, wantV - S.v));
        let d = wantHd - S.hd; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI;
        const maxRate = S.landNow || S.phase === 'toFaf' || S.phase === 'final' ? 0.12 : 0.0524;
        const rate = Math.max(-maxRate, Math.min(maxRate, d * (S.landNow ? 1.1 : 0.6)));
        S.hd += rate * dt;
        S.roll += (Math.atan(-rate * S.v / G) - S.roll) * Math.min(1, dt * 2);
        S.pitch += (Math.atan2(S.vy, S.v) + 0.04 - S.pitch) * Math.min(1, dt * 2);
      }
      if (!/toFaf|final|rollout|parked/.test(S.phase)) S.remain = dist; else if (S.phase !== 'toFaf' && S.phase !== 'final') S.remain = 0;
      S.info = S.phase === 'roll' ? 'Takeoff roll · ' + S.apt : S.phase === 'climb' ? 'Climbing' : S.phase === 'cruise' ? 'Cruise → ' + D.n : S.phase === 'orbit' ? 'Arriving · ' + D.n
        : S.phase === 'toFaf' ? 'Approach · ' + S.rw.code : S.phase === 'final' ? 'Final · ' + S.rw.code + ' RWY ' + S.rw.name : S.phase === 'rollout' ? 'Landing rollout' : 'Landed · ' + (S.rw ? S.rw.code : S.landApt);
    } else {
      const rollIn = (key('KeyD', 'ArrowRight') ? 1 : 0) - (key('KeyA', 'ArrowLeft') ? 1 : 0);
      const pitchIn = (key('KeyS', 'ArrowDown') ? 1 : 0) - (key('KeyW', 'ArrowUp') ? 1 : 0);
      S.roll += rollIn ? rollIn * 1.1 * dt : -S.roll * Math.min(1, dt * 0.9);
      S.roll = Math.max(-1.05, Math.min(1.05, S.roll));
      S.pitch = Math.max(-0.5, Math.min(0.45, S.pitch + pitchIn * 0.55 * dt));
      if (key('ShiftLeft', 'ShiftRight')) S.v += 6 * dt;
      if (key('KeyX')) S.v -= 6 * dt;
      S.v = Math.max(28, Math.min(95, S.v - Math.sin(S.pitch) * G * 0.25 * dt));
      S.hd += (-G * Math.tan(S.roll) / S.v + ((key('KeyQ') ? 1 : 0) - (key('KeyE') ? 1 : 0)) * 0.12) * dt;
      S.vy = S.v * Math.sin(S.pitch);
      S.p.y += S.vy * dt;
      if (S.p.y < 25) { S.p.y = 25; S.pitch = Math.max(S.pitch, 0.02); }
      if (S.p.y > 6000) { S.p.y = 6000; S.pitch = Math.min(S.pitch, 0); }
      S.info = 'Free flight';
    }
    const hv = S.v * Math.cos(S.pitch);
    S.p.x += Math.sin(S.hd) * hv * dt; S.p.z += Math.cos(S.hd) * hv * dt; S.odo += hv * dt;
    if (S.obj) {
      S.obj.position.copy(S.p); S.obj.rotation.set(-S.pitch, S.hd, S.roll, 'YXZ');
      if (S.obj.userData && S.obj.userData.gear) S.obj.userData.gear.visible = /roll|rollout|parked|final|toFaf/.test(S.phase) || S.p.y < 80;
      const prop = S.obj.userData && S.obj.userData.prop;
      if (prop) prop.rotation.z += S.v * dt * 2.4;
    }
  }
  /* every view can be dragged to look around and scrolled to zoom (driver/cockpit: zoom = field of view) */
  const smooth = new THREE.Vector3(), up0 = new THREE.Vector3(0, 1, 0);
  function placeCamera(dt) {
    const car = S.kind === 'car', ob = S.obj; ob.updateMatrixWorld();
    const off = window._followOff || { x: 0, z: 0 };
    camGoal.target.set(S.p.x + off.x, S.p.y, S.p.z + off.z);
    if (S.view === 'orbit') {
      if (ob) ob.visible = true;
      camera.up.copy(up0);
      if (camera.fov !== 55) { camera.fov = 55; camera.updateProjectionMatrix(); }
      return;
    }
    cam.target.copy(camGoal.target);
    const yaw = camGoal.theta - S.th0, pitchOff = (S.ph0 - camGoal.phi);
    const L = (x, y, z) => v3.set(x, y, z).applyMatrix4(ob.matrixWorld);
    const hdv = S.hd + yaw, fx = Math.sin(hdv), fz = Math.cos(hdv);
    let near = 0.3, fov = 55;
    camera.up.copy(up0);
    if (S.view === 'chase') {
      const d = Math.max(car ? 5 : 16, Math.min(car ? 80 : 400, camGoal.radius));
      const el = Math.max(0.03, Math.min(1.3, 0.22 + pitchOff * 0.8));
      const want = new THREE.Vector3(S.p.x - fx * d * Math.cos(el), S.p.y + (car ? 1.2 : 1.5) + d * Math.sin(el), S.p.z - fz * d * Math.cos(el));
      if (smooth.lengthSq() === 0 || smooth.distanceTo(want) > d * 3) smooth.copy(want); else smooth.lerp(want, Math.min(1, dt * (car ? 6 : 3)));
      camera.position.copy(smooth);
      look.set(S.p.x + fx * (car ? 6 : 14), S.p.y + (car ? 1.1 : 1.2), S.p.z + fz * (car ? 6 : 14));
      near = Math.max(0.3, d * 0.03);
    } else if (S.view === 'driver' || S.view === 'cockpit') {
      const lp = Math.max(-0.9, Math.min(0.9, pitchOff * 1.2)), ly = Math.max(-2.6, Math.min(2.6, yaw));
      if (car) {
        camera.position.copy(L(0.38, 1.18, 0.15));
        look.copy(L(Math.sin(-ly) * 30 + 0.38, 1.05 + Math.sin(lp) * 30, Math.cos(ly) * 30));
        if (ob) ob.visible = true;
      } else if (S.acClass === 'jet') {
        /* Sit just forward of the nose so the fuselage doesn't clip the view; dash SVG frames the cockpit */
        camera.position.copy(L(0, 0.9, 17.6));
        look.copy(L(Math.sin(-ly) * 90, 0.7 + Math.sin(lp) * 90, 17.6 + Math.cos(ly) * 90));
        camera.up.set(0, 1, 0).applyQuaternion(ob.quaternion);
        if (ob) ob.visible = false;
      } else {
        /* Cessna cabin — eye height behind the windshield */
        camera.position.copy(L(0, 0.95, 2.05));
        look.copy(L(Math.sin(-ly) * 40, 0.85 + Math.sin(lp) * 40, 2.05 + Math.cos(ly) * 40));
        camera.up.set(0, 1, 0).applyQuaternion(ob.quaternion);
        if (ob) ob.visible = true;
      }
      fov = Math.max(28, Math.min(78, (S.acClass === 'jet' ? 58 : 62) * Math.sqrt(Math.max(4, camGoal.radius) / 14)));
      near = 0.12;
    } else if (S.view === 'side' || S.view === 'wing') {
      if (ob) ob.visible = true;
      const d = car ? 4.6 : 15;
      camera.position.copy(L(-d * Math.cos(yaw), car ? 1.4 : 2.4, d * Math.sin(yaw) + (car ? 0.6 : -2)));
      look.copy(L(0, car ? 0.9 : 0.6, car ? 2.5 : 8));
      near = 0.3;
    } else {
      if (ob) ob.visible = true;
      const hgt = Math.max(car ? 30 : 80, Math.min(car ? 3000 : 8000, camGoal.radius * 1.6));
      camera.position.set(S.p.x + off.x - Math.sin(camGoal.theta) * 0.01, S.p.y + hgt, S.p.z + off.z - Math.cos(camGoal.theta) * 0.01);
      look.set(S.p.x + off.x, S.p.y, S.p.z + off.z);
      camera.up.set(-Math.sin(camGoal.theta), 0, -Math.cos(camGoal.theta));
      near = Math.max(1, hgt * 0.01);
    }
    if (S.view === 'chase' || S.view === 'orbit') { if (ob) ob.visible = true; }
    camera.lookAt(look);
    if (Math.abs(camera.near - near) > 0.01 || camera.fov !== fov) { camera.near = near; camera.fov = fov; camera.updateProjectionMatrix(); }
  }
  function update(dt) {
    if (!S.mode || !S.obj) return;
    if (isFollowing && isFollowing()) { stop(); return; }
    const sdt = Math.min(0.1, dt) * S.speedX;
    /* Cap substeps on Windows — fewer physics iterations = smoother frames */
    const n = Math.max(1, Math.min(/Windows/i.test(navigator.userAgent || '') ? 3 : 6, Math.ceil(sdt / 0.05)));
    for (let i = 0; i < n; i++) (S.kind === 'car' ? stepCar : stepPlane)(sdt / n);
    placeCamera(sdt / Math.max(0.001, S.speedX));
    drawDash();
    refreshMeters();
    const now = performance.now();
    if (now - S.hudT > 250) {
      S.hudT = now;
      const t = hud.querySelector('#tourTitle');
      if (t) t.textContent = (S.mode === 'tour' ? (S.kind === 'car' ? (S.leg === 'back' ? 'Driving back from ' : 'Car tour → ') : 'Plane tour → ') + S.dest.n : S.kind === 'car' ? 'Free drive' : 'Free flight') + (S.info ? ' · ' + S.info : '');
    }
  }
  function planeEtaSec() {
    if (S.kind !== 'plane' || S.mode !== 'tour') return null;
    if (S.phase === 'parked') return 0;
    if (S.phase === 'rollout') return Math.max(0, S.v) / 3;
    if (S.phase === 'toFaf' || S.phase === 'final') {
      const appr = (S.remain || 0) / Math.max(28, S.v || 65 * KT);
      return appr + (S.phase === 'toFaf' ? 45 : 20);
    }
    if (S.phase === 'orbit') return Math.max(0, 14 - (S.orbT || 0)) + (S.acClass === 'jet' ? 100 : 160);
    const dist = S.dest ? Math.hypot(S.dest.x - S.p.x, S.dest.z - S.p.z) : (S.remain || 0);
    const cruise = (S.acClass === 'jet' ? 220 : 110) * KT;
    const ground = Math.max(35, S.v || cruise) * Math.max(0.85, Math.cos(S.pitch || 0));
    let t = dist / ground;
    if (S.phase === 'roll') t += 35;
    else if (S.phase === 'climb') t += 25;
    else t += 18; /* pattern / landing buffer */
    /* Blend with elapsed vs planned so ETA shrinks smoothly in realtime */
    if (S.trip0 > 0 && S.flightEta0 > 0) {
      const flown = Math.min(1, 1 - dist / S.trip0);
      const plannedLeft = Math.max(0, S.flightEta0 * (1 - flown));
      t = t * 0.65 + plannedLeft * 0.35;
    }
    return t;
  }
  function tourProgress() {
    if (S.mode !== 'tour') return 0;
    if (S.kind === 'car' && S.route && S.tripLen) return Math.min(1, S.s / S.tripLen);
    if (S.kind === 'plane') {
      if (S.phase === 'parked' || S.phase === 'rollout') return 1;
      if (S.phase === 'toFaf' || S.phase === 'final') return 0.82 + 0.16 * (1 - Math.min(1, (S.remain || 0) / 12000));
      if (S.phase === 'orbit') return 0.72 + 0.1 * Math.min(1, (S.orbT || 0) / 14);
      const trip0 = S.trip0 || 1;
      const left = S.dest ? Math.hypot(S.dest.x - S.p.x, S.dest.z - S.p.z) : trip0;
      const flown = Math.max(0, 1 - left / trip0);
      if (S.phase === 'roll') return 0.02 * Math.min(1, (S.rollS || 0) / Math.max(200, S.rwLen || 1000));
      if (S.phase === 'climb') return 0.05 + 0.1 * Math.min(1, S.p.y / (1500 * FT));
      return 0.15 + 0.55 * Math.min(1, flown);
    }
    return 0;
  }
  return { start, stop, update, setView, land: startLanding, get active() { return !!S.mode; }, state: S };
}
