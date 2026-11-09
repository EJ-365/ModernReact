/* Aircraft emergency / crash simulator for the plane tour (no people are drawn).
   Point-mass flight model: speed, flight-path angle, bank; lift limited by stall speed; drag polar from the
   type's best glide ratio; thrust from engines that can fail. Scenarios follow real accident reports. */
import * as THREE from 'three';

const KT = 0.514444, FT = 0.3048, G = 9.81, DEG = Math.PI / 180;

export const CRASH_SCENARIOS = [
  { id: 'dual', n: 'Dual engine failure after bird strike', real: 'US Airways 1549, New York, 15 Jan 2009',
    what: 'Canada geese were ingested by both engines at 2,818 ft, 3 minutes after takeoff. With no thrust the A320 became a glider with a glide ratio of about 17:1.',
    avoid: ['Lower the nose at once to the best-glide speed; airspeed is your only energy.', 'Start the APU and run the dual-engine-failure checklist while flying the airplane.', 'Decide early: return, another runway, or a forced landing or ditching straight ahead. Turning back below about 1,000 ft usually ends in a stall.', 'Airports reduce bird strikes with bird radar, habitat control and wildlife patrols.'],
    late: 'Delayed: the crew holds the nose up for 15 s while the engines spool down, the speed bleeds away and the wing stalls.' },
  { id: 'efire', n: 'Engine fire on the takeoff roll', real: 'British Airways 2276, Las Vegas, 8 Sep 2015',
    what: 'The left engine of a 777 failed uncontained at about 75 kt and fuel fed a fire. The crew rejected the takeoff and stopped on the runway.',
    avoid: ['Below V1 reject: thrust idle, maximum braking, reversers. Above V1 continue and come back.', 'Stop on the runway, pull the fire handles and fire the bottles, then evacuate away from the fire.', 'Engine inspections catch fatigue cracks in spools before they fail.'],
    late: 'Delayed: the reject starts 5 s late at a higher speed, so the aircraft needs far more runway to stop.' },
  { id: 'stall', n: 'Aerodynamic stall on approach', real: 'Colgan Air 3407, Buffalo, 12 Feb 2009',
    what: 'Speed decayed on approach with the power back. When the stick shaker fired, the captain pulled back instead of pushing, and the wing stalled.',
    avoid: ['Watch the speed: a stabilised approach has the target speed and thrust set by 1,000 ft.', 'Stall recovery: push to reduce the angle of attack, roll wings level, then add thrust.', 'Never pull against the stick shaker; height is only lost briefly when you push.'],
    late: 'Wrong response: the pilot pulls up against the shaker, the wing stalls and drops, and the aircraft falls.' },
  { id: 'windshear', n: 'Microburst windshear on final', real: 'Delta 191, Dallas/Fort Worth, 2 Aug 1985',
    what: 'A thunderstorm downburst first gave a headwind gain, then a strong downdraft and tailwind. Airspeed dropped about 40 kt while the aircraft sank toward the ground.',
    avoid: ['Do not fly an approach under or next to a thunderstorm; wait or divert.', 'Windshear escape: full thrust, pitch about 15 degrees, wings level, ride the stick shaker and do not change configuration.', 'Doppler weather radar and predictive windshear warnings now give crews a minute of notice.'],
    late: 'Delayed: the crew keeps trying to land for 8 s, then lowers the nose to save airspeed instead of holding the escape pitch, and the downdraft drives the jet into the ground short of the runway (as on Delta 191).' },
  { id: 'gearup', n: 'Gear-up belly landing', real: 'LOT 16, Warsaw, 1 Nov 2011',
    what: 'A hydraulic leak and a tripped circuit breaker left the 767 landing gear up. The crew circled to burn fuel and landed on the belly; the aircraft slid to a stop on foam-free runway with only sparks and smoke.',
    avoid: ['Run every alternate gear-extension method and check every circuit breaker.', 'Burn or dump fuel, land at the slowest safe speed with a gentle sink rate and shut down the engines just before touchdown.', 'Have fire crews standing by along the runway.'],
    late: 'Hard: the touchdown is flown with a higher sink rate, so the belly hits harder and an engine catches fire.' },
  { id: 'overrun', n: 'Runway overrun on a wet runway', real: 'Air France 358, Toronto, 2 Aug 2005',
    what: 'The A340 landed fast and long in heavy rain, touching down about 1,200 m along a 2,700 m runway. It could not stop and ran into a ravine.',
    avoid: ['Fly a stabilised approach; if fast, high or touching down long, go around.', 'Check the landing distance for a wet or contaminated runway before the approach.', 'Engineered arresting systems (EMAS) at runway ends stop overruns safely.'],
    late: 'Pressing on: the pilot lands long and fast instead of going around and runs off the end into the grass.' },
  { id: 'lj60', n: 'High-altitude upset in icing (Learjet 60)', real: 'Learjet 60 N722BD, Palm Beach County, Florida, 1 Nov 2026 (NTSB investigation open)',
    what: 'Cruising east at 35,000 ft from Austin to the Bahamas, the crew reported turbulence, altitude swings of about 700 ft, icing and -47 °C, and asked to climb to 37,000 ft. Soon after, the jet entered a steep dive of more than 30,000 ft per minute and fell from 35,250 ft to 8,750 ft in about a minute. All nine on board died. The cause is still under investigation.',
    avoid: ['Near the ceiling the gap between stall speed and maximum speed is small ("coffin corner"); ice and turbulence shrink it further. Descend, do not climb, when you pick up ice up high.', 'Turn on engine and wing anti-ice early and leave the weather; ask ATC for a lower level or a deviation.', 'Upset recovery: unload (push to reduce the angle of attack), roll wings level, set thrust, then recover gently to level flight.', 'In severe turbulence fly the turbulence speed and let the altitude wander; chasing altitude with pitch loads the wing toward a stall.'],
    late: 'Wrong response: the crew climbs and keeps pulling as the iced wing stalls, and the jet rolls into a steep spiral dive.' },
  { id: 'kegworth', n: 'Engine failure: wrong engine shut down', real: 'British Midland 92 (Kegworth), East Midlands, 8 Jan 1989',
    what: 'A fan blade broke in the left engine of a Boeing 737-400 climbing through 28,300 ft. Smoke and vibration followed; the crew believed the right engine was at fault and shut down the healthy one. On the approach the damaged left engine failed completely and the aircraft struck the M1 motorway embankment short of the runway.',
    avoid: ['Identify before you act: confirm the failed engine with the vibration and engine gauges (both pilots agree) before closing a thrust lever.', 'A symptom that goes away when you throttle back does not prove you picked the right engine.', 'Listen to what the cabin crew and passengers report (they saw flames on the left).', 'Fly the airplane, then return and land on the good engine with a normal circuit.'],
    late: 'Wrong response: the crew shuts down the good engine; the damaged one fails on final and the restart comes too late.' },
  { id: 'asiana', n: 'Low-speed approach, thrust left at idle', real: 'Asiana 214, San Francisco, 6 Jul 2013',
    what: 'On a visual approach the Boeing 777 autothrottle was left in a mode that did not hold speed. Thrust stayed at idle and the speed decayed 30 kt below the target. The crew noticed below 200 ft and called go-around too late; the tail hit the seawall.',
    avoid: ['Monitor airspeed on every approach; call out a speed 5 kt below target.', 'Be stable by 500 ft (on speed, on path, thrust set) or go around.', 'Know your automation modes: if thrust is not responding, fly it by hand.', 'Jet engines take about 6 s to spool up from idle: go around early, not at 100 ft.'],
    late: 'Delayed: nobody notices the speed decay until about 100 ft.' },
  { id: 'depress', n: 'Cabin depressurisation at cruise', real: 'Helios 522, Greece, 14 Aug 2005 (and Southwest 1380, 2018)',
    what: 'The cabin lost pressure at high altitude. On Helios 522 the pressurisation switch was left in manual; the crew misread the warning horn, became hypoxic and passed out. The Boeing 737 flew on autopilot until the fuel ran out and it crashed into hills. On Southwest 1380 an engine failure broke a window and the crew made a textbook emergency descent and landing.',
    avoid: ['On any cabin-altitude warning: oxygen masks on first, then talk.', 'Emergency descent at once to 10,000 ft (about 6,000 ft per minute, speed brakes out) where the air is breathable.', 'Check the pressurisation panel on the before-takeoff checks; do not reset a warning you do not understand.', 'Divert and land at the nearest suitable airport.'],
    late: 'Wrong response: the crew mistakes the horn for another warning, does not put masks on and loses consciousness.' },
  { id: 'fuel', n: 'Fuel exhaustion glide', real: 'Air Canada 143 "Gimli Glider", 23 Jul 1983',
    what: 'A fuel-quantity error left the 767 with no fuel at 41,000 ft. Both engines stopped and the crew glided to a former air force runway, side-slipping to lose height.',
    avoid: ['Cross-check fuel on board by two independent methods before every flight.', 'At once fly best-glide speed and work out how far you can glide.', 'If high on the glide, add drag (side-slip, gear) rather than flying slow.'],
    late: 'Stretching: the pilot flies slower than best-glide speed to "stretch" it, sinks faster and lands short of the runway.' },
];

/* per-type flight constants: stall speed (landing flaps), clean stall, best glide speed and ratio, thrust/weight */
function acParams(S) {
  const st = S.planeStyle, big = /b747|b777|a380|a350|b787|a330|b767|c130/.test(S.jetModel || st);
  if (st === 'prop') return { vs: 48 * KT, vsC: 55 * KT, vmd: 68 * KT, ld: 9, tw: 0.22, vref: 65 * KT, eng: 1, big: false };
  if (st === 'fighter') return { vs: 135 * KT, vsC: 150 * KT, vmd: 210 * KT, ld: 8, tw: 0.9, vref: 150 * KT, eng: 1, big: false };
  return { vs: (big ? 118 : 110) * KT, vsC: (big ? 145 : 135) * KT, vmd: (big ? 240 : 210) * KT, ld: big ? 18 : 17, tw: 0.28, vref: (big ? 150 : 140) * KT, eng: st === 'c130' ? 4 : S.jetModel === 'b747' || S.jetModel === 'a380' ? 4 : 2, big };
}

function softTex() {
  const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d');
  const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.4, 'rgba(255,255,255,.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c);
}

export function createCrashSim({ scene, S, note }) {
  let tex = null, pool = [], debris = [], ac = null, cr = null, A = null;
  const v3 = new THREE.Vector3(), q = new THREE.Quaternion(), e3 = new THREE.Euler();

  /* ---------- particles: smoke, fire, sparks, dust (pooled sprites) ---------- */
  function emit(kind, x, y, z, n = 1, spread = 2) {
    if (!tex) tex = softTex();
    for (let i = 0; i < n; i++) {
      let p = pool.find((o) => !o.live);
      if (!p) {
        if (pool.length >= 420) return;
        const m = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, fog: true });
        p = { s: new THREE.Sprite(m), live: false }; scene.add(p.s); pool.push(p);
      }
      const m = p.s.material, fire = kind === 'fire' || kind === 'ball', spark = kind === 'spark';
      m.blending = fire || spark ? THREE.AdditiveBlending : THREE.NormalBlending;
      m.color.set(kind === 'smoke' ? 0x2a2a2a : kind === 'wsmoke' ? 0xd8d8d8 : kind === 'dust' ? 0xb8a07a : kind === 'splash' ? 0xffffff : spark ? 0xffd070 : kind === 'ball' ? 0xff8a2a : 0xff6a1a);
      p.live = true; p.k = kind; p.t = 0;
      p.life = kind === 'smoke' ? 9 : kind === 'wsmoke' ? 4 : kind === 'dust' ? 3.5 : spark ? 0.5 : kind === 'ball' ? 2.2 : 0.9;
      p.s.position.set(x + (Math.random() - 0.5) * spread, y + (Math.random() - 0.5) * spread * 0.5, z + (Math.random() - 0.5) * spread);
      const up = kind === 'smoke' ? 4 + Math.random() * 3 : kind === 'ball' ? 6 + Math.random() * 10 : fire ? 3 + Math.random() * 3 : spark ? 2 + Math.random() * 4 : 1;
      p.vx = (Math.random() - 0.5) * (spark ? 14 : kind === 'ball' ? 16 : 1.5); p.vz = (Math.random() - 0.5) * (spark ? 14 : kind === 'ball' ? 16 : 1.5); p.vy = up;
      p.s0 = kind === 'smoke' ? 5 : kind === 'ball' ? 14 : fire ? 3.5 : spark ? 0.5 : 4;
      p.s1 = kind === 'smoke' ? 26 : kind === 'ball' ? 34 : fire ? 1.2 : spark ? 0.2 : 14;
      p.a0 = kind === 'smoke' ? 0.55 : spark ? 1 : fire || kind === 'ball' ? 0.95 : 0.5;
      p.s.visible = true;
    }
  }
  function stepParticles(dt) {
    for (const p of pool) {
      if (!p.live) continue;
      p.t += dt; const k = p.t / p.life;
      if (k >= 1) { p.live = false; p.s.visible = false; continue; }
      p.s.position.x += p.vx * dt; p.s.position.y += p.vy * dt; p.s.position.z += p.vz * dt;
      if (p.k === 'spark') p.vy -= G * dt; else { p.vx *= 1 - dt * 0.4; p.vz *= 1 - dt * 0.4; }
      p.s.scale.setScalar(p.s0 + (p.s1 - p.s0) * Math.sqrt(k));
      p.s.material.opacity = p.a0 * (1 - k) * (p.k === 'smoke' ? Math.min(1, p.t * 2) : 1);
    }
    for (const d of debris) {
      if (d.rest) continue;
      d.vy -= G * dt; d.m.position.x += d.vx * dt; d.m.position.y += d.vy * dt; d.m.position.z += d.vz * dt;
      d.m.rotation.x += d.wx * dt; d.m.rotation.z += d.wz * dt;
      if (d.m.position.y < 0.3) { d.m.position.y = 0.3; d.vy *= -0.25; d.vx *= 0.5; d.vz *= 0.5; d.wx *= 0.5; d.wz *= 0.5; if (Math.abs(d.vy) < 1) d.rest = true; }
    }
  }
  function clearFx() {
    for (const p of pool) { scene.remove(p.s); p.s.material.dispose(); }
    pool = [];
    for (const d of debris) { scene.remove(d.m); d.m.geometry.dispose(); }
    debris = [];
    if (tex) { tex.dispose(); tex = null; }
  }
  /* world position of a point on the aircraft (local metres: x right, y up, z forward) */
  function wpt(lx, ly, lz) {
    e3.set(-S.pitch, S.hd, S.roll, 'YXZ'); q.setFromEuler(e3);
    return v3.set(lx, ly, lz).applyQuaternion(q).add(S.p);
  }
  function engPos(i) {
    const span = A.big ? 22 : 15, n = A.eng;
    if (S.planeStyle === 'prop' || S.planeStyle === 'fighter') return wpt(0, 0, S.planeStyle === 'prop' ? 3 : -7);
    const side = i % 2 ? 1 : -1, out = n === 4 ? (i < 2 ? 0.28 : 0.5) : 0.33;
    return wpt(side * span * out, -1.2, 2);
  }

  /* ---------- sound: chimes, shaker, voice callouts, impact (Web Audio + speech, all free) ---------- */
  let actx = null;
  function ctx() { if (!S.soundOn) return null; try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); if (actx.state === 'suspended') actx.resume(); } catch (e) { return null; } return actx; }
  function tone(f, dur, type = 'sine', vol = 0.15, f2) {
    const c = ctx(); if (!c) return; const o = c.createOscillator(), g = c.createGain(), t = c.currentTime;
    o.type = type; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur);
    g.gain.setValueAtTime(vol * (S.soundVol ?? 0.7), t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(c.destination); o.start(t); o.stop(t + dur + 0.05);
  }
  function noise(dur, vol = 0.5, lp = 600) {
    const c = ctx(); if (!c) return; const n = Math.floor(c.sampleRate * dur), b = c.createBuffer(1, n, c.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 2);
    const s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain(); f.type = 'lowpass'; f.frequency.value = lp;
    g.gain.value = vol * (S.soundVol ?? 0.7); s.buffer = b; s.connect(f).connect(g).connect(c.destination); s.start();
  }
  function say(t) {
    if (!S.soundOn || !window.speechSynthesis) return;
    try { const u = new SpeechSynthesisUtterance(t); u.rate = 1.05; u.pitch = 0.8; u.volume = Math.min(1, (S.soundVol ?? 0.7) + 0.2); speechSynthesis.speak(u); } catch (e) { /* ignore */ }
  }
  const chime = () => { tone(1250, 0.5, 'triangle', 0.12); setTimeout(() => tone(1250, 0.5, 'triangle', 0.12), 260); };
  const bell = () => { for (let i = 0; i < 6; i++) setTimeout(() => tone(900, 0.18, 'square', 0.06), i * 120); };
  const shaker = () => tone(28, 0.9, 'sawtooth', 0.25);

  /* cockpit annunciators: flashing master warning / caution and the failure lights, plus the repeating warning chime */
  let warnEl = null, warnT = 0, chimeT = 0;
  function warnPanel() {
    if (warnEl) return warnEl;
    if (!document.getElementById('crashWarnCss')) {
      const st = document.createElement('style'); st.id = 'crashWarnCss';
      st.textContent = '#crashWarn{position:fixed;left:50%;top:132px;transform:translateX(-50%);z-index:60;display:flex;gap:6px;flex-wrap:wrap;justify-content:center;max-width:92vw;pointer-events:none;font:800 11px/1 system-ui,sans-serif;letter-spacing:.06em}'
        + '#crashWarn b{padding:7px 9px;border-radius:4px;border:1px solid #3a2020;background:#1a0f0f;color:#5a3a3a}'
        + '#crashWarn b.w{background:#c4151c;color:#fff;border-color:#ff5a5a;box-shadow:0 0 18px rgba(255,40,40,.7);animation:cwF .5s steps(2) infinite}'
        + '#crashWarn b.c{background:#d98a00;color:#1a1000;border-color:#ffc04a;box-shadow:0 0 14px rgba(255,170,0,.55)}'
        + '@keyframes cwF{50%{background:#5a0a0d;color:#ffb0b0}}';
      document.head.appendChild(st);
    }
    warnEl = document.createElement('div'); warnEl.id = 'crashWarn'; warnEl.setAttribute('aria-live', 'polite'); document.body.appendChild(warnEl);
    return warnEl;
  }
  function annunciate(dt) {
    warnT += dt; if (warnT < 0.15) return; warnT = 0;
    const agl = cr.agl ?? S.p.y, fire = cr.fire.some((f) => f > 0), engOut = !cr.stopped && cr.eng.some((e) => e === 0), cabin = !!cr.cabin && S.p.y > 10500 * FT;
    const pull = !cr.ground && !cr.crashed && agl < 2500 * FT && S.vy < -8, ws = cr.wsT != null && cr.t - cr.wsT < 34 && !cr.ground;
    const gear = !cr.gear && !cr.ground && agl < 1000 * FT && /approach|final|flare|glide/.test(cr.mode);
    const L = [['MASTER WARNING', fire || cr.stall || pull || ws || cabin || cr.crashed, 'w'], ['MASTER CAUTION', engOut || gear || cr.offEnd, 'c'],
      ['STALL', cr.stall, 'w'], ['PULL UP', pull, 'w'], ['WINDSHEAR', ws, 'w'], ['ENG FIRE', fire, 'w'], ['ENG FAIL', engOut, 'c'], ['GEAR', gear, 'c'], ['CABIN ALT', cabin, 'w'], ['OVERRUN', !!cr.offEnd, 'c']];
    const html = L.map(([n, on, k]) => '<b class="' + (on ? k : '') + '">' + n + '</b>').join('');
    const el = warnPanel(); if (el._h !== html) { el._h = html; el.innerHTML = html; }
    const master = L[0][1] && !cr.stopped;
    chimeT -= 0.15; if (master && chimeT <= 0) { chimeT = 1.25; tone(1400, 0.16, 'square', 0.07); setTimeout(() => tone(1050, 0.16, 'square', 0.07), 190); }
  }
  function log(t) { cr.log.unshift(t); cr.log.length = Math.min(cr.log.length, 12); note(t); cr.dirty = true; }
  function event(key, fn) { if (cr.ev[key]) return false; cr.ev[key] = 1; fn(); return true; }

  /* ---------- scenario setup ---------- */
  function begin(cfg, rw) {
    clearFx(); A = acParams(S); ac = CRASH_SCENARIOS.find((s) => s.id === cfg.scn) || CRASH_SCENARIOS[0];
    const ux = Math.sin(rw.hd), uz = Math.cos(rw.hd);
    cr = { scn: ac.id, wrong: !!cfg.wrong, t: 0, rw, ux, uz, eng: new Array(A.eng).fill(1), fire: new Array(A.eng).fill(0), thr: 0.5,
      gamma: 0, mode: 'approach', gear: true, brake: 0, ground: false, crashed: false, done: false, out: '', log: [], ev: {}, shake: 0, wind: 0, wDown: 0, slide: 0, dirty: true };
    S.cr = cr; S._ownMove = true; S.roll = 0; S.vy = 0;
    const put = (along, alt, v, hd = rw.hd) => { S.p.set(rw.tx + ux * along, Math.max(1.4, alt), rw.tz + uz * along); S.hd = hd; S.v = v; };
    const gs = 3 * DEG;
    if (ac.id === 'dual') { put(rw.len + 3000, 2818 * FT, 215 * KT); cr.mode = 'climb'; cr.gamma = 5 * DEG; cr.thr = 0.9; cr.gear = false; }
    else if (ac.id === 'efire') { put(40, 1.4, 0); cr.mode = 'takeoff'; cr.thr = 1; cr.ground = true; }
    else if (ac.id === 'stall') { put(-7000, 7000 * Math.tan(gs) + 15, A.vref + 10 * KT); }
    else if (ac.id === 'windshear') { put(-5600, 5600 * Math.tan(gs) + 15, A.vref + 5 * KT); }
    else if (ac.id === 'gearup') { put(-6000, 6000 * Math.tan(gs) + 15, A.vref); cr.gear = false; }
    else if (ac.id === 'overrun') { put(-6000, 6000 * Math.tan(gs) + 15, A.vref + 22 * KT); }
    else if (ac.id === 'lj60') { put(-80000, 35000 * FT, 430 * KT); cr.mode = 'cruise'; cr.gear = false; cr.thr = 0.75; cr.targetY = 35000 * FT; cr.vT = 430 * KT; }
    else if (ac.id === 'kegworth') { put(rw.len + 3000, 3200 * FT, 230 * KT); cr.mode = 'climb'; cr.gamma = 5 * DEG; cr.thr = 0.9; cr.gear = false; }
    else if (ac.id === 'asiana') { put(-6000, 6000 * Math.tan(gs) + 15, A.vref); cr.spool = 6; cr.pwr = 0.45; }
    else if (ac.id === 'depress') { put(-110000, 37000 * FT, 450 * KT); cr.mode = 'cruise'; cr.gear = false; cr.thr = 0.8; cr.targetY = 37000 * FT; cr.vT = 450 * KT; }
    else if (ac.id === 'fuel') { put(-17000, 4300 * FT, A.vmd); cr.mode = 'glide'; cr.gear = false; cr.eng.fill(0); cr.thr = 0; }
    if (!cr.ground) cr.gamma = cr.mode === 'approach' ? -gs : cr.gamma;
    S.pitch = cr.gamma; S.phase = 'crash';
    S.info = ac.n;
    log(ac.real + ' · ' + (cfg.wrong ? 'delayed / wrong response' : 'textbook response'));
    if (ac.id === 'fuel') { say('Both engines flamed out'); chime(); }
  }

  /* pitch for speed: hold the steady glide angle, nose down when slow, up when fast (no runaway phugoid) */
  function glideLaw(vT) { const gG = -Math.atan(1 / A.ld) * (cr.gear ? 1.25 : 1); return Math.max(-12 * DEG, Math.min(4 * DEG, gG + (S.v - vT) * 0.012)); }
  /* ---------- crew "autopilot": what a pilot commands each moment ---------- */
  function crew(dt) {
    const t = cr.t, rw = cr.rw, along = (S.p.x - rw.tx) * cr.ux + (S.p.z - rw.tz) * cr.uz, xt = (S.p.x - rw.tx) * cr.uz - (S.p.z - rw.tz) * cr.ux;
    const aim = 330 + (ac.id === 'overrun' && cr.wrong ? 900 : 0), dAim = aim - along, agl = S.p.y - 1.4;
    let gCmd = cr.gamma, nMax = 1.6, thr = cr.thr, wantRoll = 0;
    const alive = cr.eng.reduce((a, b) => a + b, 0) / A.eng;
    /* stay on the extended centreline: bank toward it */
    if (!cr.ground && Math.abs(along) < 30000 && !/^(climb|glideFree|circuit|cruise)$/.test(cr.mode)) {
      let hErr = rw.hd - S.hd; while (hErr > Math.PI) hErr -= 2 * Math.PI; while (hErr < -Math.PI) hErr += 2 * Math.PI;
      wantRoll = Math.max(-0.35, Math.min(0.35, -(hErr * 1.2 - xt * 0.004)));
    }
    switch (cr.mode) {
      case 'climb': gCmd = 5 * DEG; thr = 0.9; break;
      case 'approach': case 'final': {
        gCmd = Math.max(-6 * DEG, Math.min(2 * DEG, -Math.atan2(agl, Math.max(50, dAim)) * 1.0 + (-3 * DEG - (-Math.atan2(agl, Math.max(50, dAim)))) * 0.0));
        if (alive > 0) thr = Math.max(0, Math.min(1, cr.thr + ((A.vref + (ac.id === 'overrun' && !cr.survived ? 22 * KT : 0)) - S.v) * 0.04 * dt + 0.0));
        if (cr.survived) cr.brake = S.v > A.vref + 8 * KT ? 1 : 0; /* speed brakes / flaps to get back on speed */
        if (agl < 15) cr.mode = 'flare';
        break;
      }
      case 'flare': { const sink = cr.wrong && ac.id === 'gearup' ? 3.4 : agl > 4 ? 2.2 : 1.0; gCmd = -Math.atan2(sink, Math.max(20, S.v)); thr = ac.id === 'gearup' ? 0 : Math.max(0, thr - dt * 0.4); break; }
      case 'glide': {
        /* pitch for best-glide speed (or slower when "stretching"); add drag if high on the path to the aim point */
        const vT = cr.wrong && ac.id === 'fuel' ? A.vmd * 0.68 : A.vmd;
        gCmd = glideLaw(vT);
        const need = -Math.atan2(agl, Math.max(200, dAim));
        if (along < aim && gCmd > need && !(cr.wrong && ac.id === 'fuel')) cr.brake = Math.min(1, (gCmd - need) * 30); else cr.brake = 0;
        if (along < aim && dAim < 4500 && !(cr.wrong && ac.id === 'fuel')) cr.gear = true;
        if (agl < 28) cr.mode = 'flare';
        thr = 0; break;
      }
      case 'glideFree': gCmd = glideLaw(A.vmd); thr = 0; if (agl < 28) cr.mode = 'flare'; break;
      case 'hold': gCmd = 8 * DEG; nMax = 2.2; thr = cr.thr; break; /* holding the nose up: speed bleeds off */
      case 'pullup': gCmd = 15 * DEG; nMax = 2.5; thr = cr.wrongThr ?? 0.2; break;
      case 'recover': { const vsI = A.vsC * (1 + 1.9 * (cr.ice || 0)); gCmd = S.v < vsI * 1.3 ? -4 * DEG : 6 * DEG; thr = alive ? 1 : 0; wantRoll = 0;
        if (S.v > vsI * 1.35 && cr.gamma > 0) {
          if (ac.id === 'lj60') { cr.mode = 'circuit'; cr.wp = 0; cr.survived = 1; log('Recovered: anti-ice on, upset recovery flown. Descending out of the icing to land at the nearest airport.'); }
          else cr.mode = 'goaround';
        } break; }
      case 'escape': gCmd = (cr.wrong ? 1.5 : 12) * DEG; /* delayed crew lowers the nose to save airspeed, as on Delta 191 */ nMax = 2.5; thr = 1; wantRoll = 0; break;
      case 'goaround': gCmd = 6 * DEG; thr = 1; cr.gear = false; cr.wind = 0; cr.wDown = 0; cr.done = false; cr.out = '';
        if (agl > 300) { cr.mode = 'circuit'; cr.wp = 0; cr.survived = 1; log('Climbing away. Flying a circuit to land on runway ' + (rw.name || '') + '.'); } break;
      case 'circuit': {
        /* real traffic pattern flown as heading legs: upwind, crosswind, downwind 4.5 km abeam, base, then intercept final.
           Too high on base? fly another descending lap (a hold) before turning final. */
        const lat = (S.p.x - rw.tx) * cr.uz - (S.p.z - rw.tz) * cr.ux, legHd = cr.wp === 4 ? rw.hd - Math.max(-0.6, Math.min(0.6, lat * 0.0012)) : [rw.hd, rw.hd + Math.PI / 2, rw.hd + Math.PI, rw.hd - Math.PI / 2][cr.wp];
        let hE = legHd - S.hd; while (hE > Math.PI) hE -= 2 * Math.PI; while (hE < -Math.PI) hE += 2 * Math.PI;
        wantRoll = -Math.max(-0.44, Math.min(0.44, hE * 1.3));
        const hi = S.p.y > 3000;
        gCmd = Math.max((hi ? -7 : -4) * DEG, Math.min(5 * DEG, (1500 * FT - S.p.y) * 0.002));
        const vT = hi ? 280 * KT : cr.wp >= 3 ? A.vref + 10 * KT : cr.wp === 2 ? A.vref + 25 * KT : 200 * KT; thr = Math.max(hi ? 0 : 0.15, Math.min(1, 0.5 + (vT - S.v) * 0.04)); cr.thr = thr;
        if (cr.wp === 0 && along > rw.len + 1500) { cr.wp = 1; log('Crosswind turn.'); }
        else if (cr.wp === 1 && lat > 4500) { cr.wp = 2; log('Downwind, ' + Math.round(S.p.y / FT).toLocaleString() + ' ft.'); }
        else if (cr.wp === 2 && along < -7000) { cr.wp = 3; if (S.p.y <= 2300 * FT) { cr.gear = ac.id !== 'gearup'; log('Base turn, gear down.'); say('Gear down'); } else log('Base turn.'); }
        else if (cr.wp === 3 && lat < 2600) {
          if (S.p.y > 2300 * FT) { cr.wp = 0; cr.gear = false; log('Still high: one more lap of the hold to lose height.'); }
          else { cr.wp = 4; log('Turning final.'); }
        } else if (cr.wp === 4 && Math.abs(lat) < 120 && Math.abs(hE) < 0.12) {
          { cr.mode = 'approach'; cr.gear = ac.id !== 'gearup'; cr.out = ''; cr.done = false; log('Turning final, gear down. Landing on runway ' + (rw.name || '') + '.'); say('Gear down, landing checklist'); }
        }
        break;
      }
      case 'nopilot': gCmd = -12 * DEG; wantRoll = 0.25; thr = 0; break;
      case 'lowspd': gCmd = Math.max(-6 * DEG, Math.min(2 * DEG, -Math.atan2(agl, Math.max(50, dAim)))); thr = 0; cr.thr = 0; if (agl < 15) cr.mode = 'flare'; break;
      case 'cruise': gCmd = Math.max((cr.emerg ? -9 : -4) * DEG, Math.min(3 * DEG, (cr.targetY - S.p.y) * 0.0015)); thr = Math.max(0, Math.min(1, cr.thr + (cr.vT - S.v) * 0.05 * dt)); break;
      default: break;
    }
    cr.thr += (thr - cr.thr) * Math.min(1, dt * 1.2);
    if (cr.spiral) { wantRoll = 1.35; gCmd = 15 * DEG; }
    cr.gCmd = gCmd; cr.nMax = nMax; cr.wantRoll = wantRoll; cr.along = along; cr.agl = agl;
  }

  /* ---------- scripted events per scenario ---------- */
  function script() {
    const t = cr.t, W = cr.wrong, agl = cr.agl;
    if (ac.id === 'dual') {
      if (t > 4 && event('birds', () => { cr.eng.fill(0); noise(0.4, 0.9, 1400); log('Bird strike! Both engines rolling back.'); say('Birds'); })) { cr.fire.fill(0.3); }
      if (t > 4.5 && !W && event('glide', () => { cr.mode = 'glideFree'; log('Nose down to best-glide speed (' + Math.round(A.vmd / KT) + ' kt). No runway in reach: forced landing straight ahead.'); chime(); })) { /* */ }
      if (t > 4.5 && W && event('hold', () => { cr.mode = 'hold'; log('Crew holds the nose up, hoping the engines relight…'); })) { /* */ }
      if (t > 19.5 && W && event('late', () => { cr.mode = 'recover'; log('Too late: the speed is gone.'); })) { /* */ }
      if (t > 11 && !cr.crashed && event('fireout', () => cr.fire.fill(0))) { /* the bird-strike flames die once the engines spool down */ }
      if (agl < 300 && !cr.ground && event('brace', () => say('Brace, brace, brace'))) { /* */ }
    } else if (ac.id === 'efire') {
      if (S.v > 75 * KT && event('fail', () => { cr.eng[0] = 0; cr.fire[0] = 1; noise(0.8, 1, 900); bell(); log('BANG — engine 1 failure and fire at ' + Math.round(S.v / KT) + ' kt (below V1).'); say('Engine fire'); })) cr.tFail = t;
      if (cr.tFail != null && t > cr.tFail + (W ? 5 : 1.5) && event('rto', () => { cr.mode = 'rto'; cr.thr = 0; log((W ? 'Late reject' : 'Reject!') + ' Thrust idle, maximum braking, reversers.'); say('Stop'); })) { /* */ }
    } else if (ac.id === 'stall') {
      if (t > 3 && event('decay', () => { cr.thr = 0; cr.mode = 'hold'; log('Power at idle on the approach; the speed is decaying.'); })) cr.thrLock = 0;
      if (S.v < A.vs * 1.12 && event('shaker', () => { shaker(); say('Stall, stall'); log('Stick shaker!'); cr.mode = W ? 'pullup' : 'recover'; if (!W) log('Push: nose down, wings level, full thrust.'); else log('Pilot pulls back against the shaker…'); })) { /* */ }
    } else if (ac.id === 'windshear') {
      if (agl < 800 * FT && !cr.ev.ws) { cr.ev.ws = 1; cr.wsT = t; log('Entering a microburst: headwind gain…'); }
      if (cr.wsT != null && !cr.survived) {
        const k = t - cr.wsT;
        cr.wind = k < 6 ? 15 * KT * Math.sin(k / 6 * Math.PI / 2) : Math.max(-40 * KT, 15 * KT - (k - 6) * 6 * KT);
        cr.wDown = k > 4 && k < 30 ? Math.min(W ? 13 : 11, (k - 4) * 2.5) : 0;
        if (k > 6 && event('wsw', () => { say('Windshear, windshear, windshear'); chime(); })) { /* */ }
        if (k > (W ? 14 : 6.5) && event('esc', () => { cr.mode = 'escape'; log((W ? 'Late ' : '') + 'windshear escape: full thrust, pitch 15°, ride the shaker.'); })) { /* */ }
        if (k > 34 && cr.mode === 'escape' && !cr.crashed && event('out', () => { cr.done = true; cr.out = 'Survived: the escape manoeuvre flew out of the downburst.'; cr.mode = 'goaround'; })) { /* */ }
      }
    } else if (ac.id === 'gearup') {
      if (t > 2 && event('gear', () => { chime(); say('Too low, gear'); log('Gear will not extend: no green lights. Belly landing on the runway.'); })) { /* */ }
      if (agl < 8 && event('off', () => { cr.eng.fill(0); log('Engines shut down just before touchdown.'); })) { /* */ }
    } else if (ac.id === 'overrun') {
      if (t > 2 && event('fast', () => log('Heavy rain, 22 kt fast on final. Wet runway.'))) { /* */ }
      if (!W && agl < 60 * FT && event('ga', () => { cr.mode = 'goaround'; log('Go around! Too fast and floating; a wet runway will not stop us.'); say('Go around'); })) { /* */ }
    }
    if (ac.id === 'kegworth') {
      if (t > 4 && event('bang', () => { cr.eng[0] = 0.6; noise(0.6, 1, 700); chime(); log('BANG: heavy vibration, smoke smell in the cockpit. Engine 1 vibration gauge at maximum.'); say('Engine failure'); })) { /* */ }
      if (t > 9 && event('id', () => {
        if (W) { cr.eng[1] = 0; log('Crew believes it is engine 2 and shuts it down. The vibration eases (by chance).'); }
        else { cr.eng[0] = 0; cr.fire[0] = 0; log('Engine 1 identified on the vibration gauge and confirmed by both pilots: shut down. Returning to land on engine 2.'); cr.survived = 1; }
        cr.mode = 'circuit'; cr.wp = 0; })) { /* */ }
      if (W && cr.mode === 'approach' && agl < 900 * FT && event('fail2', () => { cr.eng[0] = 0; cr.fire[0] = 1; bell(); log('Engine 1 fails completely on final. Engine 2 restart attempted, too late.'); say('Engine fire'); })) { /* */ }
    } else if (ac.id === 'asiana') {
      if (t > 2 && event('idle', () => { cr.mode = 'lowspd'; log('Autothrottle not holding speed: thrust stays at idle.'); })) { /* */ }
      if (cr.mode === 'lowspd' && (W ? agl < 110 * FT : S.v < A.vref - 8 * KT) && event('ga', () => { cr.mode = 'goaround'; log((W ? 'Late: ' : '') + 'Speed! Go around, TOGA thrust (the engines take ~6 s to spool up).'); say('Go around'); if (!W) cr.survived = 1; })) { /* */ }
    } else if (ac.id === 'depress') {
      if (t > 5 && event('dec', () => { cr.cabin = 1; noise(0.5, 1, 1200); chime(); log('Cabin altitude warning horn: the cabin is losing pressure. Masks drop in the cabin.'); say('Cabin altitude'); })) { /* */ }
      if (!W && t > 9 && event('masks', () => { cr.emerg = true; cr.targetY = 10000 * FT; cr.vT = 330 * KT; cr.thr = 0; log('Masks on. Emergency descent to 10,000 ft, speed brakes out.'); say('Emergency descent'); })) { /* */ }
      if (!W && cr.emerg && S.p.y < 10600 * FT && event('lvl', () => { cr.emerg = false; cr.mode = 'circuit'; cr.wp = 0; cr.survived = 1; log('Level at 10,000 ft, the air is breathable. Diverting to land.'); })) { /* */ }
      if (W && t > 35 && event('hyp', () => log('Crew hypoxic and unresponsive; the autopilot flies on.'))) { /* */ }
      if (W && t > 80 && event('fuel', () => { cr.eng.fill(0); cr.mode = 'nopilot'; log('Fuel exhausted. Both engines flame out with nobody at the controls.'); })) { /* */ }
    }
    if (ac.id === 'lj60') {
      if (t > 4 && event('turb', () => { log('Turbulence, altitude swings of 700 ft, icing, -47 °C.'); say("I've got turbulence, I've got ice"); })) cr.iceT = t;
      if (cr.iceT != null) { cr.ice = cr.antiIce ? Math.max(0, (cr.ice || 0) - 0.01) : Math.min(1, (t - cr.iceT) / 22); cr.wDown = cr.ground ? 0 : Math.sin(t * 1.3) * 3 + Math.sin(t * 3.1) * 1.5; }
      if (t > 10 && event('climb', () => { cr.targetY = 37000 * FT; log('ATC: climb and maintain flight level 370.'); })) { /* */ }
      if (S.v < A.vsC * (1 + 1.9 * (cr.ice || 0)) * 1.1 && event('shake', () => { shaker(); say('Stall, stall'); log('Stick shaker at ' + Math.round(S.p.y / FT).toLocaleString() + ' ft!'); cr.mode = W ? 'pullup' : 'recover'; if (W) { cr.spiral = true; cr.wrongThr = 0.9; log('The iced wing stalls and drops; the jet rolls into a steep spiral dive.'); } if (!W) { cr.antiIce = true; log('Unload, wings level, anti-ice on.'); } })) { /* */ }
    }
    if (!cr.ground && !cr.crashed && agl < 500 * FT && S.vy < -9 && event('gpws', () => say('Terrain, terrain, pull up'))) { /* */ }
  }

  /* ---------- physics ---------- */
  function step(dt) {
    if (!cr) return;
    cr.t += dt;
    if (!cr.crashed && (!cr.done || /^(goaround|climb|circuit|cruise)$/.test(cr.mode))) crew(dt);
    script();
    const alive = cr.eng.reduce((a, b) => a + b, 0) / A.eng;
    cr.pwr = cr.spool ? (cr.pwr ?? 0) + (cr.thr * alive - (cr.pwr ?? 0)) * Math.min(1, dt / cr.spool) : cr.thr * alive;
    if (cr.ground) groundRoll(dt, alive);
    else {
      const vAir = Math.max(15, S.v + cr.wind), vs = (cr.gear || cr.mode === 'flare' || /approach|final|glide/.test(cr.mode) ? A.vs : A.vsC) * (1 + 1.9 * (cr.ice || 0));
      const nLim = Math.pow(vAir / vs, 2) * 1.0;
      const nCmd = Math.cos(cr.gamma) + (cr.gCmd - cr.gamma) * vAir / G * 1.2;
      cr.stall = nCmd > nLim && vAir < vs * 1.05;
      /* past the critical angle of attack lift collapses; it only comes back once the nose is lowered */
      const post = cr.stall && cr.mode === 'pullup' ? 0.55 : 1;
      const n = Math.max(0, Math.min(nCmd, nLim * post, cr.nMax || 2));
      if (cr.stall) { cr.shake += dt; if (cr.shake > 0.9) { cr.shake = 0; shaker(); } cr.wantRoll += Math.sin(cr.t * 1.7) * (cr.wrong ? 0.9 : 0.3); }
      const dr = 1 / (2 * A.ld) * (Math.pow(vAir / A.vmd, 2) + Math.pow(A.vmd / vAir, 2)) * (cr.gear ? 1.25 : 1) * (1 + (cr.brake || 0) * 0.5) * (cr.mode === 'flare' || /approach/.test(cr.mode) ? 1.35 : 1);
      S.v += G * (A.tw * cr.pwr - dr - Math.sin(cr.gamma)) * dt;
      if (S.v > 470 * KT) S.v -= (S.v - 470 * KT) * 0.6 * dt; /* compressibility drag near Mach 1 */
      cr.gamma += G * (n * Math.cos(S.roll) - Math.cos(cr.gamma)) / vAir * dt;
      cr.gamma = Math.max(-80 * DEG, Math.min(25 * DEG, cr.gamma));
      S.roll += (cr.wantRoll - S.roll) * Math.min(1, dt * (cr.stall ? 0.8 : 1.4));
      S.hd += -G * n * Math.sin(S.roll) / vAir * dt;
      const alpha = Math.min(0.32, 0.1 * n / Math.max(0.2, Math.pow(vAir / vs, 2))) + (cr.stall ? 0.06 : 0);
      S.pitch += (cr.gamma + alpha - S.pitch) * Math.min(1, dt * 3);
      const hv = S.v * Math.cos(cr.gamma);
      S.vy = S.v * Math.sin(cr.gamma) - cr.wDown;
      S.p.x += Math.sin(S.hd) * hv * dt; S.p.z += Math.cos(S.hd) * hv * dt; S.p.y += S.vy * dt;
      if (S.p.y <= 1.4) touchdown();
    }
    S.odo = (S.odo || 0) + S.v * dt;
    effects(dt);
    stepParticles(dt);
    annunciate(dt);
    S.info = cr.crashed ? 'Crashed · ' + ac.n : cr.done ? 'Stopped · ' + ac.n : ac.n + (cr.stall ? ' · STALL' : '');
  }
  function touchdown() {
    const sink = -S.vy, rw = cr.rw, along = (S.p.x - rw.tx) * cr.ux + (S.p.z - rw.tz) * cr.uz, xt = Math.abs((S.p.x - rw.tx) * cr.uz - (S.p.z - rw.tz) * cr.ux);
    S.p.y = 1.4; cr.ground = true; cr.onRw = along > 0 && along < rw.len && xt < 30; cr.tdAlong = along;
    const lim = cr.gear ? 3.6 : 2.6;
    if (sink > lim * 2.2 || Math.abs(S.roll) > 0.45 || cr.gamma < -14 * DEG) impact(sink);
    else if (!cr.gear) { cr.slide = 1; noise(1.6, 0.9, 500); log('Belly touchdown at ' + Math.round(sink * 197) + ' fpm — sliding on the fuselage.'); if (sink > lim) { cr.fire[0] = 1; bell(); log('Hard contact: an engine nacelle is on fire.'); } }
    else { noise(0.3, 0.5, 300); log('Touchdown ' + Math.round(sink * 197) + ' fpm ' + (cr.onRw ? 'on the runway' : 'off the airport') + (sink > lim ? ' — very hard, gear damaged' : '') + '.'); if (sink > lim) cr.collapse = 1; }
    cr.gamma = 0; S.vy = 0; S.roll *= 0.3;
  }
  function impact(sink) {
    cr.crashed = true; cr.slide = 1; cr.fire.fill(1); cr.eng.fill(0); cr.gear = false;
    noise(2.5, 1.2, 380); setTimeout(() => noise(1.5, 0.6, 200), 300);
    log('Impact at ' + Math.round(sink * 197) + ' fpm and ' + Math.round(S.v / KT) + ' kt. Aircraft destroyed.');
    cr.out = 'Crashed. ' + (cr.wrong ? ac.late : 'The impact was beyond what the airframe can take.');
    cr.dbg = { sink: +sink.toFixed(1), roll: +S.roll.toFixed(2), gam: +(cr.gamma / DEG).toFixed(1), mode: cr.mode, along: Math.round(cr.along || 0) };
    emit('ball', S.p.x, 4, S.p.z, 40, 14);
    const gm = new THREE.BoxGeometry(1, 1, 1), mat = new THREE.MeshLambertMaterial({ color: 0x3a3c40 });
    for (let i = 0; i < 26; i++) {
      const m = new THREE.Mesh(gm.clone(), mat); m.scale.set(0.6 + Math.random() * 3, 0.2 + Math.random() * 0.8, 0.6 + Math.random() * 4);
      m.position.copy(S.p); scene.add(m);
      debris.push({ m, vx: Math.sin(S.hd) * S.v * 0.5 + (Math.random() - 0.5) * 30, vz: Math.cos(S.hd) * S.v * 0.5 + (Math.random() - 0.5) * 30, vy: 4 + Math.random() * 14, wx: (Math.random() - 0.5) * 8, wz: (Math.random() - 0.5) * 8 });
    }
    gm.dispose();
    S.pitch = -0.12; S.roll = S.roll > 0 ? 0.5 : -0.5;
  }
  function groundRoll(dt, alive) {
    const rw = cr.rw, along = (S.p.x - rw.tx) * cr.ux + (S.p.z - rw.tz) * cr.uz, onRw = along > -10 && along < rw.len + 10;
    let dec = 0;
    if (cr.mode === 'takeoff') S.v += G * (A.tw * cr.pwr - 0.02) * dt;
    else {
      const wet = ac.id === 'overrun', mu = cr.crashed ? 0.55 : cr.slide ? 0.35 : !onRw ? 0.3 : (wet ? 0.09 : 0.32) + (S.v > 30 ? 0.04 : 0);
      dec = G * mu + (alive && !cr.slide && cr.mode === 'rto' ? 1.2 : 0) + (cr.survived && alive && !cr.slide ? 1.0 : 0);
      if (cr.mode !== 'rto' && !cr.crashed && !cr.slide && cr.t > 0) cr.thr = 0;
      S.v = Math.max(0, S.v - dec * dt);
    }
    if (cr.onRw && !onRw && along > rw.len && !cr.offEnd) { cr.offEnd = 1; log('Off the end of the runway at ' + Math.round(S.v / KT) + ' kt, into the grass.'); if (S.v > 30 * KT) { cr.collapse = 1; cr.gear = false; cr.fire[0] = 1; bell(); log('Nose gear collapses; fuel line ruptured, fire.'); } }
    S.p.x += Math.sin(S.hd) * S.v * dt; S.p.z += Math.cos(S.hd) * S.v * dt; S.p.y = 1.4 - (cr.slide ? 1.6 : 0) - (cr.collapse ? 0.8 : 0);
    S.pitch += ((cr.collapse ? -0.07 : cr.slide ? 0 : 0) - S.pitch) * Math.min(1, dt * 2);
    S.roll *= 1 - Math.min(1, dt); S.vy = 0;
    if (!onRw || cr.slide) S.pitch += (Math.random() - 0.5) * 0.01 * Math.min(1, S.v / 30);
    if (S.v < 0.3 && cr.mode !== 'takeoff' && !cr.stopped) {
      cr.stopped = true; cr.done = true;
      if (!cr.out) cr.out = !cr.onRw && cr.tdAlong < 0 && cr.tdAlong > -8000 ? 'Landed ' + Math.round(-cr.tdAlong) + ' m short of the runway. ' + (cr.wrong ? ac.late : '') : cr.offEnd ? 'Overran the runway. ' + (cr.wrong ? ac.late : '') : cr.slide ? 'Stopped on the belly ' + (cr.onRw ? 'on the runway' : 'off the airport') + ': survivable.' : cr.onRw || ac.id === 'efire' ? 'Stopped on the runway: survivable.' : 'Forced landing done: survivable.';
      if (cr.survived && !cr.crashed && !cr.offEnd && !cr.slide && cr.onRw) cr.out = 'Survived and landed: emergency handled, circuit flown and the aircraft stopped safely on runway ' + (cr.rw.name || '') + '.';
      log(cr.out); if (!cr.crashed) say(cr.fire.some((f) => f > 0) ? 'Evacuate, evacuate' : 'Aircraft stopped');
    }
  }
  function effects(dt) {
    cr.fxT = (cr.fxT || 0) + dt; if (cr.fxT < 0.06) return; const k = cr.fxT; cr.fxT = 0;
    for (let i = 0; i < A.eng; i++) {
      if (cr.fire[i] > 0) { const p = engPos(i); emit('fire', p.x, p.y, p.z, 2, 1.5); if (Math.random() < 0.7) emit('smoke', p.x, p.y + 1, p.z, 1, 2); }
      else if (cr.eng[i] === 0 && cr.ev.birds && cr.t - 4 < 6) { const p = engPos(i); emit('smoke', p.x, p.y, p.z, 1, 1); }
    }
    if (cr.ground && cr.slide && S.v > 3) { const p = wpt(0, -2, -8); emit('spark', p.x, 0.6, p.z, 6, 4); emit('wsmoke', p.x, 1, p.z, 1, 3); }
    if (cr.ground && (cr.offEnd || (!cr.onRw && ac.id !== 'efire')) && S.v > 3) { emit('dust', S.p.x, 1, S.p.z, 2, 8); }
    if (cr.crashed) { emit('fire', S.p.x, 2, S.p.z, 3, 10); emit('smoke', S.p.x, 6, S.p.z, 1, 8); }
    if (cr.ground && ac.id === 'efire' && cr.mode === 'rto' && S.v > 20) { const p = wpt(0, -3, -6); emit('wsmoke', p.x, 0.8, p.z, 1, 3); }
    void k;
  }
  function hudHtml() {
    if (!cr || !ac) return '';
    const sel = CRASH_SCENARIOS.map((s) => '<option value="' + s.id + '"' + (s.id === ac.id ? ' selected' : '') + '>' + s.n + '</option>').join('');
    return '<div class="crashCard" style="margin:6px 0;padding:8px 10px;border-radius:10px;background:rgba(120,20,10,.22);border:1px solid rgba(255,120,80,.35);font-size:12px;line-height:1.4">'
      + '<b style="color:#ffb08a">' + ac.n + '</b><div style="color:#c9b8ae">Real case: ' + ac.real + '</div>'
      + '<div id="crashLog" style="margin:4px 0;color:#fff">' + (cr.log[0] && cr.log[0] !== cr.out ? cr.log[0] : '') + '</div>'
      + '<div id="crashOut" style="color:#ffd27a;font-weight:600">' + (cr.out || '') + '</div>'
      + '<div id="crashData" style="margin:4px 0;font:11px/1.35 ui-monospace,Menlo,Consolas,monospace;color:#e8ddd6;display:grid;grid-template-columns:repeat(3,auto);gap:1px 10px"></div>'
      + '<details style="margin-top:2px"><summary style="cursor:pointer;color:#ffb08a">Event timeline</summary><ol id="crashTl" style="margin:2px 0;padding-left:18px;color:#ddd"></ol></details>'
      + '<details style="margin-top:4px"><summary style="cursor:pointer;color:#ffb08a">What happened and how pilots avoid it</summary><p style="margin:4px 0">' + ac.what + '</p><ul style="margin:0;padding-left:16px">' + ac.avoid.map((a) => '<li>' + a + '</li>').join('') + '</ul><p style="margin:4px 0;color:#c9b8ae">' + ac.late + '</p></details>'
      + '<div class="row" style="margin-top:6px;flex-wrap:wrap"><select data-crscn style="max-width:220px">' + sel + '</select>'
      + '<button type="button" data-crwrong="1" class="' + (cr.wrong ? 'on' : '') + '" title="Fly it the way the crew in the real accident did, or late">' + (cr.wrong ? 'Response: delayed / wrong' : 'Response: textbook') + '</button>'
      + '<button type="button" data-crreplay="1" class="on">Replay</button></div></div>';
  }
  function flightData(hud) {
    /* live instrument strip: altitude, speed, vertical speed, thrust, stall margin (+ wing ice on the Learjet) */
    const el = hud.querySelector('#crashData'); if (!el || cr.t - (cr.fdT || -1) < 0.25) return; cr.fdT = cr.t;
    const ice = cr.ice || 0, vsI = (cr.gear ? A.vs : A.vsC) * (1 + 1.9 * ice), marg = (S.v - vsI) / KT;
    const c = (v, bad, warn) => '<span style="color:' + (bad ? '#ff6b5a' : warn ? '#ffd27a' : '#9fe0a8') + '">' + v + '</span>';
    const vs = S.vy / FT * 60, alt = Math.max(0, S.p.y / FT);
    el.innerHTML = '<span>ALT ' + c(Math.round(alt).toLocaleString() + ' ft', alt < 500 && vs < -1500, false) + '</span>'
      + '<span>IAS ' + c(Math.round(S.v / KT) + ' kt', marg < 5, marg < 20) + '</span>'
      + '<span>V/S ' + c((vs > 0 ? '+' : '') + Math.round(vs / 50) * 50 + ' fpm', vs < -6000 || (alt < 1000 && vs < -1500), vs < -3000) + '</span>'
      + '<span>THR ' + c(Math.round((cr.pwr || 0) * 100) + '%', false, (cr.pwr || 0) < 0.2 && !cr.ground) + '</span>'
      + '<span>STALL ' + c((marg >= 0 ? '+' : '') + Math.round(marg) + ' kt', marg < 5, marg < 20) + '</span>'
      + (ac.id === 'lj60' ? '<span>ICE ' + c(Math.round(ice * 100) + '%' + (cr.antiIce ? ' A/I' : ''), ice > 0.5, ice > 0.15) + '</span>' : '<span>GEAR ' + c(cr.gear ? 'DOWN' : 'UP', false, false) + '</span>');
    const tl = hud.querySelector('#crashTl');
    if (tl && tl.childElementCount !== cr.log.length) tl.innerHTML = cr.log.slice(0, 12).map((m) => '<li>' + String(m).replace(/</g, '&lt;') + '</li>').join('');
  }
  function refresh(hud) {
    if (cr && hud) flightData(hud);
    if (!cr || !cr.dirty || !hud) return; cr.dirty = false;
    const l = hud.querySelector('#crashLog'), o = hud.querySelector('#crashOut');
    if (l) l.textContent = cr.log[0] && cr.log[0] !== cr.out ? cr.log[0] : ''; if (o) o.textContent = cr.out || '';
  }
  function clear() { clearFx(); if (warnEl) { warnEl.remove(); warnEl = null; } cr = null; S.cr = null; S._ownMove = false; try { speechSynthesis.cancel(); } catch (e) { /* ignore */ } }
  return { begin, step, hudHtml, refresh, clear, get cr() { return cr; } };
}
