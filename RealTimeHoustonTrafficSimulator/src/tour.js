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
  ['Museum District', 29.724, -95.39], ['Daikin Park (Minute Maid)', 29.7573, -95.3555], ['Toyota Center', 29.7508, -95.3621],
  ['Buffalo Bayou Park', 29.762, -95.386], ['Memorial Park', 29.765, -95.441], ['Space Center Houston', 29.5519, -95.0981],
  ['San Jacinto Monument', 29.7499, -95.0807], ['Kemah Boardwalk', 29.5466, -95.02], ['The Woodlands Waterway', 30.163, -95.464],
  ['Houston Ship Channel', 29.735, -95.205],
];
const VIEWS = { car: [['chase', 'Chase'], ['driver', 'Driver'], ['side', 'Side'], ['top', 'Top'], ['orbit', 'Free look']],
  plane: [['chase', 'Chase'], ['cockpit', 'Cockpit'], ['wing', 'Wing'], ['top', 'Top'], ['orbit', 'Free look']] };

function makeCar() {
  const g = new THREE.Group();
  const paint = new THREE.MeshStandardMaterial({ color: 0xb3202a, metalness: 0.55, roughness: 0.35 });
  const glass = new THREE.MeshStandardMaterial({ color: 0x15191e, metalness: 0.2, roughness: 0.15 });
  const tyre = new THREE.MeshLambertMaterial({ color: 0x16181b });
  const box = (w, h, l, m, x, y, z) => { const me = new THREE.Mesh(new THREE.BoxGeometry(w, h, l), m); me.position.set(x, y, z); me.castShadow = true; g.add(me); return me; };
  box(1.84, 0.62, 4.62, paint, 0, 0.62, 0);
  box(1.62, 0.56, 2.3, glass, 0, 1.2, -0.25);
  box(1.6, 0.06, 2.0, paint, 0, 1.5, -0.3);
  for (const [x, z] of [[-0.86, 1.42], [0.86, 1.42], [-0.86, -1.38], [0.86, -1.38]]) {
    const w = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.24, 14), tyre); w.rotation.z = Math.PI / 2; w.position.set(x, 0.34, z); g.add(w);
  }
  const head = new THREE.MeshBasicMaterial({ color: 0xfff6dc }), tail = new THREE.MeshBasicMaterial({ color: 0xd0141c });
  for (const x of [-0.62, 0.62]) { box(0.36, 0.14, 0.05, head, x, 0.74, 2.32); box(0.4, 0.14, 0.05, tail, x, 0.78, -2.32); }
  return g;
}

export function createTour({ scene, camera, cam, camGoal, geoToWorld, getTraffic, getRoads, airports, makePlane, stopFollow, isFollowing, $, getUserGeo = () => null }) {
  const S = { mode: null, kind: 'car', view: 'chase', speedX: 1, obj: null, p: new THREE.Vector3(), hd: 0, v: 0, pitch: 0, roll: 0,
    route: null, s: 0, dest: null, phase: '', keys: {}, info: '', hudT: 0, orbitR: 900, runways: null, cruise: 0, odo: 0, yawRate: 0, th0: 0, ph0: 1, limit: 0, sm: null };
  const dests = [];
  for (const [n, lat, lng] of LANDMARKS) { const w = geoToWorld(lat, lng); dests.push({ g: 'Landmarks', n, x: w.x, z: w.z }); }
  fetch('/data/houston/places.json').then((r) => r.json()).then((d) => {
    for (const [x, z, rk, n] of d.p || []) if (rk <= 2) dests.push({ g: rk <= 1 ? 'Cities & towns' : 'Neighbourhoods', n, x, z });
    fillDest();
  }).catch(() => fillDest());
  fetch('/data/houston/airports.json').then((r) => r.json()).then((d) => { S.runways = d.runways || []; S.aeros = d.aerodromes || []; }).catch(() => { S.runways = []; });

  /* ---------- UI ---------- */
  function fillDest() {
    const sel = $('tourDest'); if (!sel) return;
    const groups = {};
    dests.forEach((d, i) => { (groups[d.g] || (groups[d.g] = [])).push([d.n, i]); });
    sel.innerHTML = '<option value="">— pick a place to tour —</option>' + Object.entries(groups).map(([g, l]) => '<optgroup label="' + g + '">'
      + l.sort((a, b) => a[0].localeCompare(b[0])).map(([n, i]) => '<option value="' + i + '">' + n + '</option>').join('') + '</optgroup>').join('');
  }
  const vehBtns = document.querySelectorAll('#tourVeh .btn');
  vehBtns.forEach((b) => b.addEventListener('click', () => {
    S.kind = b.getAttribute('data-veh'); vehBtns.forEach((x) => x.classList.toggle('on', x === b));
    const fb = $('tourFree'); if (fb) fb.textContent = S.kind === 'car' ? 'Free drive' : 'Free flight';
  }));
  const goBtn = $('tourGo'); if (goBtn) goBtn.addEventListener('click', () => {
    const v = $('tourDest') && $('tourDest').value;
    if (v === '' || v == null) { note('Pick a place first.'); return; }
    start(S.kind, 'tour', dests[+v]);
  });
  const freeBtn = $('tourFree'); if (freeBtn) freeBtn.addEventListener('click', () => start(S.kind, 'free', null));
  function note(t) { const n = $('tourNote'); if (n) n.textContent = t; }

  const css = document.createElement('style');
  css.textContent = '#tourHud{position:fixed;left:50%;bottom:18px;transform:translateX(-50%);z-index:40;background:rgba(14,18,23,.9);border:1px solid #2b333c;border-radius:12px;padding:10px 14px;color:#e6edf3;font:12px/1.35 Inter,system-ui,sans-serif;min-width:320px;max-width:92vw;box-shadow:0 8px 28px rgba(0,0,0,.45);display:none}'
    + '#tourHud.on{display:block}#tourHud .tt{font-weight:700;font-size:13px;margin-bottom:4px;display:flex;justify-content:space-between;gap:12px}'
    + '#tourHud .tm{display:flex;gap:16px;font-family:"Overpass Mono",monospace;font-size:12px;color:#cfe3f5;margin-bottom:8px;flex-wrap:wrap}'
    + '#tourHud .tm b{font-size:18px;color:#fff}#tourHud .row{display:flex;gap:6px;flex-wrap:wrap;margin-top:4px}'
    + '#tourHud button{background:#1b232c;border:1px solid #34404c;color:#dbe6f0;border-radius:7px;padding:5px 9px;font-size:11px;cursor:pointer}'
    + '#tourHud button.on{background:#1f4f7a;border-color:#4ea3e0;color:#fff}#tourHud .x{background:#5a1d22;border-color:#a8323c}'
    + '#tourPad{position:fixed;right:18px;bottom:18px;z-index:40;display:none;grid-template-columns:repeat(3,52px);gap:6px}#tourPad.on{display:grid}'
    + '#tourPad button{height:52px;border-radius:12px;background:rgba(20,26,33,.85);border:1px solid #3a4652;color:#fff;font-size:18px;touch-action:none}';
  document.head.appendChild(css);
  const hud = document.createElement('div'); hud.id = 'tourHud'; document.body.appendChild(hud);
  css.textContent += '#tourDash{position:fixed;left:0;right:0;bottom:0;height:34vh;z-index:35;pointer-events:none;display:none}#tourDash.on{display:block}#tourDash svg{width:100%;height:100%}'
    + '#tourHud.dashUp{bottom:auto;top:64px}';
  const dash = document.createElement('div'); dash.id = 'tourDash'; document.body.appendChild(dash);
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
  const PLANE_DASH = '<svg viewBox="0 0 1000 300" preserveAspectRatio="xMidYMax slice">'
    + '<rect x="0" y="90" width="1000" height="210" fill="#1a1d21"/><rect x="0" y="86" width="1000" height="8" fill="#0d0f12"/>'
    + '<defs><clipPath id="ahClip"><circle cx="500" cy="195" r="86"/></clipPath></defs>'
    + '<g clip-path="url(#ahClip)"><g id="dHz"><rect x="300" y="-5" width="400" height="200" fill="#2f78c4"/><rect x="300" y="195" width="400" height="200" fill="#7a4e2a"/><line x1="300" y1="195" x2="700" y2="195" stroke="#fff" stroke-width="3"/>'
    + [-20, -10, 10, 20].map((p) => '<line x1="470" x2="530" y1="' + (195 - p * 3) + '" y2="' + (195 - p * 3) + '" stroke="#fff" stroke-width="2"/>').join('') + '</g></g>'
    + '<circle cx="500" cy="195" r="86" fill="none" stroke="#3a434c" stroke-width="5"/><path d="M450,195 L485,195 L500,208 L515,195 L550,195" stroke="#ffcf3a" stroke-width="4" fill="none"/>'
    + '<rect x="230" y="125" width="130" height="140" rx="10" fill="#06080a" stroke="#3a434c"/><text x="295" y="150" fill="#8a96a3" font-size="12" text-anchor="middle">AIRSPEED</text><text id="dKt" x="295" y="200" fill="#fff" font-size="34" font-weight="700" text-anchor="middle" font-family="Overpass Mono,monospace">0</text><text x="295" y="222" fill="#8a96a3" font-size="12" text-anchor="middle">KT</text>'
    + '<rect x="640" y="125" width="130" height="140" rx="10" fill="#06080a" stroke="#3a434c"/><text x="705" y="150" fill="#8a96a3" font-size="12" text-anchor="middle">ALTITUDE</text><text id="dFt" x="705" y="200" fill="#fff" font-size="30" font-weight="700" text-anchor="middle" font-family="Overpass Mono,monospace">0</text><text x="705" y="222" fill="#8a96a3" font-size="12" text-anchor="middle">FT</text><text id="dVs" x="705" y="250" fill="#7fd6a0" font-size="14" text-anchor="middle">0 fpm</text>'
    + '<rect x="440" y="286" width="120" height="0" /><text id="dHdg" x="500" y="122" fill="#ffcf3a" font-size="18" font-weight="700" text-anchor="middle" font-family="Overpass Mono,monospace">HDG 000°</text></svg>';
  let dashKind = '';
  function drawDash() {
    const show = S.view === 'driver' || S.view === 'cockpit';
    dash.classList.toggle('on', show); hud.classList.toggle('dashUp', show);
    if (!show) return;
    if (dashKind !== S.kind) { dash.innerHTML = S.kind === 'car' ? CAR_DASH : PLANE_DASH; dashKind = S.kind; }
    const q = (id) => dash.querySelector('#' + id);
    if (S.kind === 'car') {
      const mph = Math.abs(S.v) / MPH, a = (135 + Math.min(140, mph) / 140 * 270) * Math.PI / 180;
      q('dNeedle').setAttribute('x2', 640 + Math.cos(a) * 70); q('dNeedle').setAttribute('y2', 200 + Math.sin(a) * 70);
      q('dSpd').textContent = Math.round(mph);
      /* 6-speed automatic: shift every ~16 mph, 750 rpm idle */
      const gear = mph < 1 ? 1 : Math.min(6, 1 + Math.floor(mph / 16)), rpm = mph < 1 ? 0.75 : Math.min(7.5, 1.2 + (mph - (gear - 1) * 16) / 16 * 3.2 + gear * 0.1);
      const ra = (135 + rpm / 8 * 270) * Math.PI / 180; q('dRpm').setAttribute('x2', 360 + Math.cos(ra) * 56); q('dRpm').setAttribute('y2', 200 + Math.sin(ra) * 56);
      q('dGear').textContent = S.v < -0.2 ? 'R' : mph < 0.5 ? 'P' : 'D' + gear;
      q('dTrip').textContent = (S.odo / 1609.344).toFixed(1) + ' mi';
      q('dLim').textContent = S.limit ? S.limit : '—';
      q('dRoad').textContent = S.info || '';
      /* steering ratio ~15:1 → wheel angle from the yaw rate the car is actually doing */
      const steer = Math.abs(S.v) > 0.5 ? Math.atan(2.7 * S.yawRate / S.v) : 0;
      q('dWheel').setAttribute('transform', 'translate(500,300) rotate(' + Math.max(-540, Math.min(540, -steer * 15 * 180 / Math.PI)).toFixed(1) + ')');
    } else {
      q('dKt').textContent = Math.round(S.v / KT);
      q('dFt').textContent = Math.round(S.p.y / FT).toLocaleString();
      q('dVs').textContent = (S.vy >= 0 ? '+' : '') + Math.round((S.vy || 0) / FT * 60 / 10) * 10 + ' fpm';
      /* world +z is south, so compass bearing = 180° − hd */
      q('dHdg').textContent = 'HDG ' + String(Math.round((((180 - S.hd * 180 / Math.PI) % 360) + 360) % 360)).padStart(3, '0') + '°';
      q('dHz').setAttribute('transform', 'rotate(' + (-S.roll * 180 / Math.PI).toFixed(1) + ' 500 195) translate(0 ' + (S.pitch * 180 / Math.PI * 3).toFixed(1) + ')');
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

  function renderHud() {
    const views = VIEWS[S.kind].map(([id, n], i) => '<button data-view="' + id + '" class="' + (S.view === id ? 'on' : '') + '" title="key ' + (i + 1) + '">' + n + '</button>').join('');
    const speeds = S.kind === 'car' && S.mode === 'tour'
      ? '<span style="color:#8a96a3;align-self:center">Cruise</span>' + [0, 30, 40, 50, 60, 70, 80, 90].map((x) => '<button data-cruise="' + x + '" class="' + (S.cruise === x ? 'on' : '') + '">' + (x ? x : 'Limit +5') + '</button>').join('')
      : [1, 2, 4, 10].map((x) => '<button data-sx="' + x + '" class="' + (S.speedX === x ? 'on' : '') + '">×' + x + '</button>').join('');
    hud.innerHTML = '<div class="tt"><span id="tourTitle"></span><button class="x" data-exit="1">Exit (Esc)</button></div><div class="tm" id="tourMeters"></div>'
      + '<div class="row">' + views + '</div>' + '<div class="row" style="margin-top:6px">' + speeds
      + (S.kind === 'plane' && S.mode === 'tour' ? '<span style="color:#8a96a3;align-self:center;margin-left:6px">Land at</span><select data-land="1" style="background:#1b232c;color:#dbe6f0;border:1px solid #34404c;border-radius:7px;padding:4px">' + airports().map((a) => '<option' + (a.code === S.landApt ? ' selected' : '') + '>' + a.code + '</option>').join('') + '</select><button data-landnow="1">Land now</button>' : '')
      + (S.mode === 'free' ? '<span style="color:#8a96a3;align-self:center;margin-left:6px">' + (S.kind === 'car' ? 'W/S throttle · A/D steer' : 'W/S pitch · A/D bank · Q/E yaw · Shift/X throttle') + '</span>' : '') + '</div>';
    hud.querySelectorAll('[data-view]').forEach((b) => b.addEventListener('click', () => setView(b.getAttribute('data-view'))));
    hud.querySelectorAll('[data-sx]').forEach((b) => b.addEventListener('click', () => { S.speedX = +b.getAttribute('data-sx'); renderHud(); }));
    hud.querySelectorAll('[data-cruise]').forEach((b) => b.addEventListener('click', () => { S.cruise = +b.getAttribute('data-cruise'); renderHud(); }));
    hud.querySelector('[data-exit]').addEventListener('click', stop);
    const ls = hud.querySelector('[data-land]'); if (ls) ls.addEventListener('change', () => { S.landApt = ls.value; if (/toFaf|final/.test(S.phase)) { S.phase = 'orbit'; S.orbT = 1e9; } });
    const ln = hud.querySelector('[data-landnow]'); if (ln) ln.addEventListener('click', () => { if (/climb|cruise|orbit/.test(S.phase)) { S.phase = 'orbit'; startLanding(); } });
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
  function nearestCw(C, x, z, maxD) {
    let best = null, bd = maxD;
    for (const c of C) {
      if (x < c.x0 - bd || x > c.x1 + bd || z < c.z0 - bd || z > c.z1 + bd) continue;
      const f = c.f;
      for (let i = 0; i < f.n; i++) { const d = Math.hypot(f.pts[2 * i] - x, f.pts[2 * i + 1] - z); if (d < bd) { bd = d; best = { c, i }; } }
    }
    return best;
  }
  function dijkstra(a, b) {
    const dist = new Map([[a.c, 0]]), prev = new Map(), heap = [[0, a.c]];
    const pushH = (e) => { heap.push(e); let i = heap.length - 1; while (i) { const p = (i - 1) >> 1; if (heap[p][0] <= heap[i][0]) break; [heap[p], heap[i]] = [heap[i], heap[p]]; i = p; } };
    const popH = () => { const top = heap[0], last = heap.pop(); if (heap.length) { heap[0] = last; let i = 0; for (;;) { const l = 2 * i + 1, r = l + 1; let m = i; if (l < heap.length && heap[l][0] < heap[m][0]) m = l; if (r < heap.length && heap[r][0] < heap[m][0]) m = r; if (m === i) break; [heap[m], heap[i]] = [heap[i], heap[m]]; i = m; } } return top; };
    let it = 0;
    while (heap.length && it++ < 400000) {
      const [d, c] = popH();
      if (c === b.c) break;
      if (d > dist.get(c)) continue;
      for (const nx of c.next) {
        const e = nx.c, nd = d + e.L / (e.ff * MPH);
        if (nd < (dist.has(e) ? dist.get(e) : Infinity)) { dist.set(e, nd); prev.set(e, c); pushH([nd, e]); }
      }
    }
    if (!dist.has(b.c)) return null;
    const seq = []; for (let c = b.c; c; c = prev.get(c)) { seq.push(c); if (c === a.c) break; }
    return seq[seq.length - 1] === a.c ? seq.reverse() : null;
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
  /* the tour starts where the user is (browser location, asked once), else at the map centre */
  function locate() {
    const g = getUserGeo && getUserGeo();
    if (g && Number.isFinite(g.lat)) return Promise.resolve(g);
    if (!navigator.geolocation) return Promise.resolve(null);
    return new Promise((res) => {
      const t = setTimeout(() => res(null), 9000);
      navigator.geolocation.getCurrentPosition((p) => { clearTimeout(t); res({ lat: p.coords.latitude, lng: p.coords.longitude }); }, () => { clearTimeout(t); res(null); }, { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 });
    });
  }
  async function start(kind, mode, dest) {
    note('Finding your location…');
    const g = await locate();
    let origin = null, fromUser = false;
    if (g) { const w = geoToWorld(g.lat, g.lng); if (Math.hypot(w.x, w.z) < 90000) { origin = w; fromUser = true; } }
    if (!origin) origin = { x: cam.target.x, z: cam.target.z };
    S.fromTxt = fromUser ? 'your location' : (g ? 'map centre (you are outside the Houston map)' : 'map centre (location not shared)');
    begin(kind, mode, dest, origin);
  }
  function begin(kind, mode, dest, origin) {
    stopFollow && stopFollow();
    clearObj();
    window._followOff = { x: 0, z: 0 };
    S.kind = kind; S.mode = mode; S.dest = dest; S.view = 'chase'; S.v = 0; S.pitch = 0; S.roll = 0; S.s = 0; S._si = 0; S.route = null; S.phase = ''; S.odo = 0; S.vy = 0;
    S.th0 = camGoal.theta; S.ph0 = camGoal.phi; camGoal.radius = kind === 'car' ? 14 : 45; camGoal.phi = 1.25; S.ph0 = 1.25;
    const cx = origin.x, cz = origin.z;
    S.origin = { x: cx, z: cz }; S.leg = 'out'; S.waitT = 0; S.orbT = 0;
    if (kind === 'car') {
      S.obj = makeCar(); scene.add(S.obj);
      const T = getTraffic && getTraffic();
      if (!T) { note('Roads are still loading — try again in a moment.'); S.mode = null; clearObj(); return; }
      const a = nearestCw(T.carriageways, cx, cz, 4000);
      if (!a) { note('No road near the view — move the map over a street and try again.'); S.mode = null; clearObj(); return; }
      const f = a.c.f, i = a.i, j = Math.min(f.n - 1, i + 1), i0 = j === i ? i - 1 : i;
      S.p.set(f.pts[2 * i], a.c.y0 + 0.02, f.pts[2 * i + 1]);
      S.hd = Math.atan2(f.pts[2 * j] - f.pts[2 * i0], f.pts[2 * j + 1] - f.pts[2 * i0 + 1]) + (a.c.sign > 0 ? 0 : Math.PI);
      if (mode === 'tour') {
        const b = nearestCw(T.carriageways, dest.x, dest.z, 3000);
        const seq = b && dijkstra(a, b);
        S.route = seq && buildPath(seq, a, b);
        if (!S.route) { note('No connected road route to ' + dest.n + ' from here yet — try another place or move closer.'); S.mode = null; clearObj(); return; }
        S.phase = 'drive';
      }
    } else {
      S.obj = makePlane(0xf3f4f6); S.obj.scale.setScalar(1); scene.add(S.obj);
      if (mode === 'tour') {
        const ap = airports().map((q) => ({ q, d: Math.hypot(q.x - dest.x, q.z - dest.z) + 0.6 * Math.hypot(q.x - cx, q.z - cz) })).sort((u, w) => u.d - w.d)[0];
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
        S.apt = ap.q.code; S.homeApt = ap.q.code; S.landApt = ap.q.code; S.phase = 'roll'; S.rollS = 0;
      } else {
        S.p.set(cx, 600, cz); S.hd = cam.theta + Math.PI; S.v = 55; S.phase = 'free';
      }
    }
    S.obj.position.copy(S.p);
    renderHud(); hud.classList.add('on'); pad.classList.toggle('on', mode === 'free' && matchMedia('(pointer:coarse)').matches);
    note((mode === 'tour' ? (kind === 'car' ? 'Driving to ' + dest.n : 'Departing ' + S.apt + ' for ' + dest.n) : (kind === 'car' ? 'Free drive (W/S, A/D)' : 'Free flight (W/S pitch, A/D bank)')) + ' · starting from ' + S.fromTxt + '.');
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
  function cruiseMps(ff) { return (S.cruise ? S.cruise : ff + 5) * MPH; }
  function stepCar(dt) {
    const T = getTraffic && getTraffic();
    const h0 = S.hd;
    if (S.mode === 'tour') {
      const P = S.route, end = P[P.length - 1].s;
      sampleAt(P, S.s, o);
      S.limit = o.ff;
      const v0 = Math.min(cruiseMps(o.ff), curveLimit(P, o.i));
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
        const a = T && nearestCw(T.carriageways, S.p.x, S.p.z, 600), b = T && nearestCw(T.carriageways, S.origin.x, S.origin.z, 3000);
        const seq = a && b && dijkstra(a, b), P2 = seq && buildPath(seq, a, b);
        if (P2) { S.route = P2; S.s = 0; S._si = 0; S.leg = 'back'; S.phase = 'drive'; note('Driving back to where you started.'); }
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
  function startLanding() {
    if (S.kind !== 'plane' || S.mode !== 'tour' || /toFaf|final|rollout|parked/.test(S.phase)) return;
    const rw = pickRunway(S.landApt || S.homeApt, S.p.x, S.p.z);
    if (!rw) { note('No runway data for ' + S.landApt + '.'); return; }
    S.rw = rw; S.phase = 'toFaf'; note('Returning to land at ' + rw.code + ' runway ' + rw.name + '.');
  }
  function etaSec() {
    const P = S.route; if (!P) return null;
    let t = 0;
    for (let i = Math.max(1, (S._si || 0) + 1); i < P.length; i++) t += (P[i].s - P[i - 1].s) / Math.max(4, Math.min(cruiseMps(P[i].ff), 40));
    return t + Math.max(0, (P[Math.min(P.length - 1, (S._si || 0) + 1)].s - S.s)) / Math.max(4, S.v || cruiseMps(P[0].ff));
  }
  function stepPlane(dt) {
    let wantHd = S.hd, wantY = S.p.y, wantV = S.v;
    if (S.mode === 'tour') {
      const D = S.dest, dx = D.x - S.p.x, dz = D.z - S.p.z, dist = Math.hypot(dx, dz), brg = Math.atan2(dx, dz);
      if (S.phase === 'roll') {
        S.v += 2.2 * dt; S.rollS += S.v * dt; S.p.y = 1.4;
        if (S.v >= 55 * KT) S.phase = 'climb';
      } else if (S.phase === 'rollout' || S.phase === 'parked') {
        S.p.y = 1.4; S.v = Math.max(0, S.v - 2.6 * dt);
        if (S.phase === 'rollout' && S.v < 0.5) { S.phase = 'parked'; note('Landed at ' + S.rw.code + ' runway ' + S.rw.name + '. Pick another place to fly.'); }
      } else {
        const agl = S.p.y;
        if (S.phase === 'climb') { wantV = 95 * KT; wantY = 1500 * FT; if (agl > 150) wantHd = brg; if (agl > 1400 * FT) S.phase = 'cruise'; }
        if (S.phase === 'cruise') { wantV = 110 * KT; wantY = dist < 3500 ? 1000 * FT : 1500 * FT; wantHd = brg; if (dist < S.orbitR * 1.15) S.phase = 'orbit'; }
        if (S.phase === 'orbit') {
          if ((S.orbT += dt) > 150) startLanding();
          wantV = 95 * KT; wantY = 1000 * FT;
          const err = (dist - S.orbitR) / S.orbitR;
          wantHd = brg - Math.PI / 2 * (1 - Math.max(-0.8, Math.min(0.8, err)));
        }
        if (S.phase === 'toFaf' || S.phase === 'final') {
          const rw = S.rw, ux = Math.sin(rw.hd), uz = Math.cos(rw.hd);
          /* final approach fix 9 km out on the extended centreline; then a 3° glide to the touchdown zone (300 m in) */
          const ax = rw.tx + ux * 300, az = rw.tz + uz * 300;
          const along = (S.p.x - ax) * ux + (S.p.z - az) * uz, xt = (S.p.x - ax) * uz - (S.p.z - az) * ux;
          if (S.phase === 'toFaf') {
            const fx = rw.tx - ux * 9000, fz = rw.tz - uz * 9000;
            wantHd = Math.atan2(fx - S.p.x, fz - S.p.z); wantV = 100 * KT; wantY = 1500 * FT;
            if (Math.hypot(fx - S.p.x, fz - S.p.z) < 900 || (along < -2000 && along > -9500 && Math.abs(xt) < 600)) S.phase = 'final';
            S.remain = Math.hypot(rw.tx - S.p.x, rw.tz - S.p.z);
          } else {
            wantHd = rw.hd + Math.max(-0.6, Math.min(0.6, xt * 0.004));
            wantV = 65 * KT; wantY = Math.max(0, -along * Math.tan(3 * Math.PI / 180)) + 1.4;
            S.remain = Math.max(0, -along);
            if (S.p.y <= 2.2 && along > -150) { S.phase = 'rollout'; S.p.y = 1.4; S.vy = 0; S.pitch = 0; S.roll = 0; S.hd = rw.hd; }
          }
        }
        const climb = Math.max(-4, Math.min(S.phase === 'climb' ? 3.6 : 3, (wantY - S.p.y) * (S.phase === 'final' ? 0.5 : 0.08)));
        S.vy += (climb - (S.vy || 0)) * Math.min(1, dt * 0.8);
        S.p.y = Math.max(1.4, S.p.y + S.vy * dt);
        /* on final, hold the 3° glide path tightly so the wheels only meet the ground on the runway */
        if (S.phase === 'final') { const gy = wantY; S.p.y += (gy - S.p.y) * Math.min(1, dt * 1.5); S.p.y = Math.max(S.p.y, gy * 0.9); S.vy = -Math.tan(3 * Math.PI / 180) * S.v; }
        S.v += Math.max(-1.2 * dt, Math.min(1.5 * dt, wantV - S.v));
        let d = wantHd - S.hd; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI;
        const rate = Math.max(-0.0524, Math.min(0.0524, d * 0.6)); /* standard-rate turn, 3°/s */
        S.hd += rate * dt;
        S.roll += (Math.atan(-rate * S.v / G) - S.roll) * Math.min(1, dt * 2);
        S.pitch += (Math.atan2(S.vy, S.v) + 0.04 - S.pitch) * Math.min(1, dt * 2);
      }
      if (!/toFaf|final|rollout|parked/.test(S.phase)) S.remain = dist; else if (S.phase !== 'toFaf' && S.phase !== 'final') S.remain = 0;
      S.info = S.phase === 'roll' ? 'Takeoff roll · ' + S.apt : S.phase === 'climb' ? 'Climbing' : S.phase === 'cruise' ? 'Cruise' : S.phase === 'orbit' ? 'Circling ' + D.n
        : S.phase === 'toFaf' ? 'Returning to ' + S.rw.code : S.phase === 'final' ? 'Final approach · ' + S.rw.code + ' RWY ' + S.rw.name : S.phase === 'rollout' ? 'Landing rollout' : 'Landed · ' + S.rw.code;
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
    S.obj.position.copy(S.p); S.obj.rotation.set(-S.pitch, S.hd, S.roll, 'YXZ');
  }
  /* every view can be dragged to look around and scrolled to zoom (driver/cockpit: zoom = field of view) */
  const smooth = new THREE.Vector3(), up0 = new THREE.Vector3(0, 1, 0);
  function placeCamera(dt) {
    const car = S.kind === 'car', ob = S.obj; ob.updateMatrixWorld();
    const off = window._followOff || { x: 0, z: 0 };
    camGoal.target.set(S.p.x + off.x, S.p.y, S.p.z + off.z);
    if (S.view === 'orbit') { camera.up.copy(up0); if (camera.fov !== 55) { camera.fov = 55; camera.updateProjectionMatrix(); } return; }
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
      camera.position.copy(car ? L(0.38, 1.18, 0.15) : L(0, 1.3, 1.2));
      const lp = Math.max(-0.9, Math.min(0.9, pitchOff * 1.2)), ly = Math.max(-2.6, Math.min(2.6, yaw));
      look.copy(L(Math.sin(-ly) * 30 + (car ? 0.38 : 0), (car ? 1.05 : 1.0) + Math.sin(lp) * 30, Math.cos(ly) * 30));
      if (!car) camera.up.set(0, 1, 0).applyQuaternion(ob.quaternion);
      fov = Math.max(25, Math.min(80, 60 * Math.sqrt(Math.max(4, camGoal.radius) / 14)));
      near = 0.15;
    } else if (S.view === 'side' || S.view === 'wing') {
      const d = car ? 4.6 : 15;
      camera.position.copy(L(-d * Math.cos(yaw), car ? 1.4 : 2.4, d * Math.sin(yaw) + (car ? 0.6 : -2)));
      look.copy(L(0, car ? 0.9 : 0.6, car ? 2.5 : 8));
      near = 0.3;
    } else {
      const hgt = Math.max(car ? 30 : 80, Math.min(car ? 3000 : 8000, camGoal.radius * 1.6));
      camera.position.set(S.p.x + off.x - Math.sin(camGoal.theta) * 0.01, S.p.y + hgt, S.p.z + off.z - Math.cos(camGoal.theta) * 0.01);
      look.set(S.p.x + off.x, S.p.y, S.p.z + off.z);
      camera.up.set(-Math.sin(camGoal.theta), 0, -Math.cos(camGoal.theta));
      near = Math.max(1, hgt * 0.01);
    }
    camera.lookAt(look);
    if (Math.abs(camera.near - near) > 0.01 || camera.fov !== fov) { camera.near = near; camera.fov = fov; camera.updateProjectionMatrix(); }
  }
  function update(dt) {
    if (!S.mode || !S.obj) return;
    if (isFollowing && isFollowing()) { stop(); return; }
    const sdt = Math.min(0.1, dt) * S.speedX;
    const n = Math.max(1, Math.ceil(sdt / 0.05));
    for (let i = 0; i < n; i++) (S.kind === 'car' ? stepCar : stepPlane)(sdt / n);
    placeCamera(sdt / Math.max(0.001, S.speedX));
    drawDash();
    const now = performance.now();
    if (now - S.hudT > 200) {
      S.hudT = now;
      const t = $('tourTitle'), m = $('tourMeters');
      if (t) t.textContent = (S.mode === 'tour' ? (S.kind === 'car' ? (S.leg === 'back' ? 'Driving back from ' : 'Car tour → ') : 'Plane tour → ') + S.dest.n : S.kind === 'car' ? 'Free drive' : 'Free flight') + (S.info ? ' · ' + S.info : '');
      if (m) {
        const spd = S.kind === 'car' ? '<span><b>' + Math.round(Math.abs(S.v) / MPH) + '</b> mph</span>' : '<span><b>' + Math.round(S.v / KT) + '</b> kt</span><span><b>' + Math.round(S.p.y / FT).toLocaleString() + '</b> ft</span>';
        let rem = '';
        if (S.mode === 'tour' && S.remain != null) {
          rem = '<span><b>' + (S.remain / 1609.344).toFixed(1) + '</b> mi to go</span>';
          const et = S.kind === 'car' ? etaSec() : (S.phase === 'orbit' ? null : S.remain / Math.max(20, S.v));
          if (et != null && S.phase !== 'arrived') { const at = new Date(Date.now() + et * 1000 / Math.max(1, S.speedX)); rem += '<span>ETA <b>' + Math.max(1, Math.round(et / 60)) + '</b> min · ' + at.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) + '</span>'; }
        }
        m.innerHTML = spd + rem + '<span>trip <b>' + (S.odo / 1609.344).toFixed(1) + '</b> mi</span>' + (S.limit ? '<span>limit <b>' + S.limit + '</b></span>' : '');
      }
    }
  }
  return { start, stop, update, setView, land: startLanding, get active() { return !!S.mode; }, state: S };
}
