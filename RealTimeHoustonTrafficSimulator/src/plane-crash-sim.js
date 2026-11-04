/**
 * Educational plane-crash flight dynamics (sim only — not a certified aircraft model).
 * Tour airliner meshes · real OSM runway centreline · takeoff roll → rotate → climb past
 * the field → fail → glide / upset into ground or buildings.
 * Soft camera follow (orbit free; pan releases). Jet bed + impact boom via tour-audio.
 */
import * as THREE from 'three';
import { createTourAudio } from './tour-audio.js';

export const CRASH_SCENARIOS = [
  /* clearRw: fail only after departing past the far runway end (real EFATO / climb-out) */
  {
    id: 'engine', n: 'Engine failure after takeoff', blurb: 'Full takeoff, clear the runway, then dual flame-out — glide beyond the field into open ground or structures.',
    phase: 'takeoff', failAt: 28, failAlt: 220, clearRw: true, fail: 'engine',
    tipLive: 'EFATO drill: pitch for V2, wings level, land straight ahead if still low — never force a 180 back to the runway below ~800–1000 ft AGL.',
    tipFail: 'Thrust is gone. Protect best-glide pitch (~7–10° nose-up clean), pick a field in the windshield, then talk to ATC.',
    lesson: {
      cause: 'Dual engine failure after takeoff (EFATO) once past V1 — no runway left to reject, and thrust drops to zero in the climb.',
      avoid: [
        'Brief the departure: engine-out procedure, acceleration altitude, and a forced-landing option off the SID before you roll.',
        'If both engines quit below ~800–1000 ft AGL, do not attempt the “impossible turn” back to the airport — land mostly straight ahead into the least-bad terrain.',
        'Memory items first: pitch for V2 / best glide, clean up drag when able, then MAYDAY and squawk 7700.',
        'Know published engine-out SIDs and drift-down corridors for that runway so you are not inventing a path over houses.',
      ],
      memory: 'Aviate → Navigate → Communicate. Low + no thrust = straight ahead, not a hero turn.',
    },
  },
  {
    id: 'urban', n: 'Engine-out into city', blurb: 'Clear the departure end, lose both engines, then drift toward the metro fabric — impact buildings or streets past the airport.',
    phase: 'takeoff', failAt: 30, failAlt: 260, clearRw: true, fail: 'engine', urban: true,
    tipLive: 'Urban EFATO: the hazard is people and buildings under the climb path — energy + heading management matter more than “reaching the airport.”',
    tipFail: 'Turn away from dense metro if you still have altitude. Trade height for a highway, park, or open industrial patch — not a CBD canyon.',
    lesson: {
      cause: 'Engine-out after departure while the flight path drifts toward metro fabric — low energy plus a heading that keeps the city in the windshield.',
      avoid: [
        'Airport emergency brief should name “no-go” sectors (downtown, stadiums, dense housing) and preferred off-field options (highways, golf courses, bayous).',
        'At the first thrust loss, prioritize a heading that points away from the densest population, then refine to a specific landing site.',
        'Do not stretch a glide to “make the airport” if that path crosses high-rises — a controlled off-airport site beats an uncontrolled city strike.',
        'Configure early (gear/flaps as the QRH says) so you are not still dirty when the only open ground appears.',
      ],
      memory: 'Turn away from the city first. Then pick the field. Then talk.',
    },
  },
  {
    id: 'stall', n: 'Approach stall', blurb: 'Too slow on short final — wing drop and mush into the overrun.',
    phase: 'approach', alt: 55, spd: 48, pitch: 14, fail: 'stall',
    tipLive: 'Short final: airspeed is life. If you are slow and high AoA, add power or go around — do not pull harder to “hold the glidepath.”',
    tipFail: 'Stall on final: reduce AoA, add power if available, wings level — a go-around beats a mush into the overrun.',
    lesson: {
      cause: 'Approach stall — airspeed bled below a safe margin with a high angle of attack on short final, so the wing quit flying.',
      avoid: [
        'Be stabilized by 1000 ft IMC / 500 ft VMC: on path, on speed (Vref + wind additives), configured, checklist done.',
        'Pitch primarily for airspeed; use power to correct path. Chasing the glideslope with aft stick is how you stall.',
        'Gusty or hot/heavy days: add the published wind additives and brief a firm go-around trigger (e.g. “unstable below 500 → GA”).',
        'At the first stick-shaker or sink you cannot arrest with power, go around — do not “save” an unstabilized landing.',
      ],
      memory: 'Unstable? Go around. Pitch for airspeed, power for path.',
    },
  },
  {
    id: 'bird', n: 'Bird strike on climb', blurb: 'Flock hit after you are past the departure end — asymmetric thrust and altitude loss into the departure path.',
    phase: 'takeoff', failAt: 22, failAlt: 160, clearRw: true, fail: 'bird',
    tipLive: 'Bird activity: delay if flocks are reported on the departure. After a strike — fly the jet first, then identify which engine is hurt.',
    tipFail: 'Asymmetric thrust: rudder toward the live engine, wings level, climb attitude. Identify–verify before you shut anything down.',
    lesson: {
      cause: 'Bird strike on initial climb — one (or both) engines damaged, thrust becomes asymmetric, and climb performance collapses.',
      avoid: [
        'Check bird-hazard NOTAMs / ATIS and delay or use an alternate runway/SID when flocking is reported on the climb corridor.',
        'After impact: fly the airplane (pitch/bank/yaw), then identify which engine is damaged — never shut down the wrong one.',
        'Use the engine-out climb profile and return/divert only once you are under control and above a safe pattern altitude.',
        'Report the strike so following traffic gets a warning; request bird patrol if the airport can provide it.',
      ],
      memory: 'Fly → identify → verify → secure. Do not rush the shutdown.',
    },
  },
  {
    id: 'midair', n: 'Structural upset (wake)', blurb: 'Wake turbulence rolls the jet after a proper climb-out past the runway — energy dumps into the terrain or skyline.',
    phase: 'takeoff', failAt: 34, failAlt: 380, clearRw: true, fail: 'wake', roll: 155,
    tipLive: 'Behind a heavy/super: extra spacing, rotate past their lift-off point, and stay above their flight path.',
    tipFail: 'Wake roll: unload (ease AoA), stop the roll, wings level, then recover pitch — fighting with full aft stick deepens the upset.',
    lesson: {
      cause: 'Wake turbulence upset — rolling moment from a preceding heavy/super exceeded roll authority and dumped energy toward the ground.',
      avoid: [
        'Take the full ATC wake separation; visually confirm the heavy’s rotation point and lift off beyond it when practical.',
        'Climb above their path; if you must cross, cross above. Upwind of the vortex when wind is significant.',
        'If rolled inverted or past 90°: reduce AoA (unload), neutralize ailerons carefully, roll shortest way to wings-level, then pull — classic upset recovery.',
        'Brief “wake risk” on every departure behind heavies so both pilots expect the bump and the recovery callouts.',
      ],
      memory: 'Upwind, above, and past the heavy. Upset: unload, roll, recover.',
    },
  },
  {
    id: 'ditch', n: 'Water ditching', blurb: 'Clear the field, then both engines out — glide and flare for a ditching attitude.',
    phase: 'takeoff', failAt: 30, failAlt: 260, clearRw: true, fail: 'ditch', water: true,
    tipLive: 'Over water with no thrust: gear usually up, parallel to the swell, flare to a low sink rate — prepare cabin for brace/evacuate.',
    tipFail: 'Ditching picture: wings level, slight nose-up, hit parallel to the primary swell. Cabin: brace, then rafts/doors per QRH.',
    lesson: {
      cause: 'Dual flame-out with water as the only reachable surface — survival depends on ditching attitude and evacuation, not “stretching” to land.',
      avoid: [
        'Configure per ditching checklist (typically gear up on jets) so the belly presents a clean planing surface.',
        'Align parallel to the primary swell / into the wind as the QRH prioritizes; flare to minimize vertical speed at touchdown.',
        'Brief brace and exit paths early; after impact, evacuate to rafts before the cabin floods or shifts.',
        'If any land option still exists within glide range, take it — ditching is the last resort, not the first.',
      ],
      memory: 'Gear up, parallel to swell, flare, brace, evacuate.',
    },
  },
  {
    id: 'hard', n: 'Hard landing bounce', blurb: 'Excess sink rate on touchdown — gear collapse and runway departure.',
    phase: 'approach', alt: 22, spd: 58, pitch: -8, fail: 'hard',
    tipLive: 'High sink on short final: add power early. A firm landing is fine; a bounced nose-first arrival is not.',
    tipFail: 'Big bounce: go around. Do not push the nose down to “stick” it — that is how gear collapses.',
    lesson: {
      cause: 'Hard landing / bounce — excess sink rate at touchdown overloaded the gear and threw the jet back into the air out of control.',
      avoid: [
        'Stabilize the approach; correct a high sink with power by ~200–300 ft, not with a last-second pitch shove.',
        'Aim for the touchdown zone at the right attitude; if you float long, go around instead of forcing it on.',
        'After a high bounce: thrust up, pitch for climb, go around — never chase the runway with forward stick.',
        'In gusts, use the additive and expect a firmer touchdown; brief the bounce/go-around callout as a crew.',
      ],
      memory: 'Big bounce = go around. Do not force a second touchdown.',
    },
  },
];

export const CRASH_AIRCRAFT = [
  { id: 'b737', n: 'Boeing 737-800' },
  { id: 'a320', n: 'Airbus A320neo' },
  { id: 'b787', n: 'Boeing 787-9' },
  { id: 'b777', n: 'Boeing 777-300ER' },
  { id: 'e175', n: 'Embraer E175' },
];

function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
function lerp(a, b, t) { return a + (b - a) * t; }

function inRing(f, x, z) {
  let c = false;
  for (let i = 0, j = f.length - 2; i < f.length; j = i, i += 2) {
    const xi = f[i], zi = f[i + 1], xj = f[j], zj = f[j + 1];
    if ((zi > z) !== (zj > z) && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) c = !c;
  }
  return c;
}

function rwLen(r) {
  const p = r.p; let L = 0;
  for (let i = 2; i < p.length; i += 2) L += Math.hypot(p[i] - p[i - 2], p[i + 1] - p[i - 1]);
  return L;
}

function rwMid(r) {
  const n = r.p.length;
  return [(r.p[0] + r.p[n - 2]) / 2, (r.p[1] + r.p[n - 1]) / 2];
}

function rwName(r, num) {
  const parts = String(r.ref || '').split('/');
  let best = null, bd = 99;
  for (const t of parts) {
    const m = /^\s*(\d{1,2})([LRC]?)\s*$/.exec(t); if (!m) continue;
    let d = Math.abs(+m[1] - num) % 36; d = Math.min(d, 36 - d);
    if (d < bd) { bd = d; best = m[1].padStart(2, '0') + m[2]; }
  }
  return best && bd <= 3 ? best : String(num).padStart(2, '0');
}

function makeFx(parent) {
  const smoke = [];
  const trail = [];
  const fireTex = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d');
    const g = x.createRadialGradient(32, 32, 2, 32, 32, 30);
    g.addColorStop(0, 'rgba(255,230,140,1)'); g.addColorStop(0.35, 'rgba(255,100,20,.85)'); g.addColorStop(1, 'rgba(40,15,5,0)');
    x.fillStyle = g; x.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  })();
  const smokeTex = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d');
    const g = x.createRadialGradient(32, 32, 4, 32, 32, 30);
    g.addColorStop(0, 'rgba(70,70,72,.7)'); g.addColorStop(0.45, 'rgba(45,45,48,.4)'); g.addColorStop(1, 'rgba(20,20,22,0)');
    x.fillStyle = g; x.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  })();
  const fires = [];
  for (let i = 0; i < 3; i++) {
    const fire = new THREE.Sprite(new THREE.SpriteMaterial({ map: fireTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 }));
    fire.scale.set(18, 18, 1); fire.visible = false; parent.add(fire);
    fires.push(fire);
  }
  for (let i = 0; i < 36; i++) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: smokeTex, transparent: true, depthWrite: false, opacity: 0 }));
    s.scale.set(10, 10, 1); s.visible = false; parent.add(s);
    smoke.push({ s, life: 0, max: 1, vx: 0, vy: 0, vz: 0 });
  }
  for (let i = 0; i < 12; i++) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: smokeTex, transparent: true, depthWrite: false, opacity: 0 }));
    s.scale.set(5, 5, 1); s.visible = false; parent.add(s);
    trail.push({ s, life: 0, max: 1, vx: 0, vy: 0, vz: 0 });
  }
  const debris = [];
  const dMat = new THREE.MeshLambertMaterial({ color: 0xb8c0c8 });
  const dGeo = new THREE.BoxGeometry(0.9, 0.35, 1.8);
  for (let i = 0; i < 14; i++) {
    const m = new THREE.Mesh(dGeo, dMat); m.visible = false; parent.add(m);
    debris.push({ m, vx: 0, vy: 0, vz: 0, life: 0, spin: 0 });
  }
  return { fires, smoke, trail, debris, plumeT: 0, trailAcc: 0, smokeAcc: 0 };
}

/**
 * @param {{ scene: THREE.Scene, makeAircraft?: Function, getAirports?: Function, airportsUrl?: string, probeBuilding?: Function, cityAim?: Function }} opts
 */
export function createPlaneCrashSim({ scene, makeAircraft, getAirports, airportsUrl = '/data/houston/airports.json', probeBuilding, cityAim }) {
  const root = new THREE.Group(); root.name = 'plane-crash-sim'; root.visible = false; scene.add(root);
  let jet = null;
  const fx = makeFx(root);
  const audio = createTourAudio();
  let osm = { runways: [], aeros: [], ready: false };
  fetch(airportsUrl).then((r) => r.json()).then((d) => {
    osm.runways = d.runways || [];
    osm.aeros = d.aerodromes || [];
    osm.ready = true;
  }).catch(() => { osm.ready = true; });

  const st = {
    active: false, done: false, scenario: null, airport: null, acType: 'b737',
    phase: 'idle',
    x: 0, y: 0, z: 0,
    vx: 0, vy: 0, vz: 0,
    pitch: 0, yaw: 0, roll: 0,
    pitchRate: 0, rollRate: 0, yawRate: 0,
    thrust: 0, mass: 62000,
    g: 9.81, stall: false, impact: false, t: 0, failArmed: false, failed: false,
    follow: true, status: 'Idle',
    view: 'chase', /* chase | cockpit | window | wing | top | orbit — tour-style angles */
    speedX: 1, th0: 0, ph0: 1.25,
    station: 0, Vr: 78, V2: 88, gearDown: true,
    rw: null,
    failAlong: 0, failAlt: 0, failSpd: 0, impactKind: '',
    odo: 0, peakAlt: 0, camShake: 0,
    tip: '', lessonPhase: 'brief', /* brief | live | fail | debrief */
  };

  function airports() {
    const list = (getAirports && getAirports()) || [];
    return list.filter((a) => a && Number.isFinite(a.x) && Number.isFinite(a.z));
  }

  function pickAirport(code) {
    const list = airports();
    if (!list.length) return null;
    if (code) {
      const hit = list.find((a) => String(a.code).toUpperCase() === String(code).toUpperCase());
      if (hit) return hit;
    }
    return list.find((a) => a.code === 'IAH') || list[0];
  }

  /** Longest paved OSM runway inside the airport aerodrome — same logic as tour.js */
  function pickRunway(code, preferHd) {
    const apt = pickAirport(code);
    if (!apt) return null;
    const aero = osm.aeros.find((a) => a.iata === code);
    const mid = rwMid;
    let rws = osm.runways.filter((r) => r.w >= 18 && (aero ? inRing(aero.r, ...mid(r)) : Math.hypot(mid(r)[0] - apt.x, mid(r)[1] - apt.z) < 4500));
    if (!rws.length) rws = osm.runways.filter((r) => r.w >= 15 && Math.hypot(mid(r)[0] - apt.x, mid(r)[1] - apt.z) < 5500);
    if (!rws.length) {
      const dx = apt.dx != null ? apt.dx : Math.cos(apt.rot || 0);
      const dz = apt.dz != null ? apt.dz : -Math.sin(apt.rot || 0);
      const L = apt.runLen || 600;
      const hd = Math.atan2(dx, dz);
      return {
        code, name: '??', tx: apt.x - dx * L * 0.48, tz: apt.z - dz * L * 0.48,
        ex: apt.x + dx * L * 0.48, ez: apt.z + dz * L * 0.48, hd, len: L, fallback: true,
      };
    }
    rws.sort((a, b) => rwLen(b) - rwLen(a));
    const r = rws[0];
    let ax = r.p[0], az = r.p[1], bx = r.p[r.p.length - 2], bz = r.p[r.p.length - 1];
    if (preferHd != null) {
      const hdA = Math.atan2(bx - ax, bz - az);
      let d = Math.abs(hdA - preferHd); while (d > Math.PI) d = Math.abs(d - 2 * Math.PI);
      if (d > Math.PI / 2) [ax, az, bx, bz] = [bx, bz, ax, az];
    }
    const hd = Math.atan2(bx - ax, bz - az);
    const num = Math.round(((((180 - hd * 180 / Math.PI) % 360) + 360) % 360) / 10) || 36;
    return { code, tx: ax, tz: az, ex: bx, ez: bz, hd, len: rwLen(r), name: rwName(r, num), ref: r.ref };
  }

  function alongRw(rw, s) {
    const u = clamp(s / Math.max(1, rw.len), 0, 1.35);
    return {
      x: rw.tx + Math.sin(rw.hd) * s,
      z: rw.tz + Math.cos(rw.hd) * s,
      u,
    };
  }

  function setGear(down) {
    st.gearDown = !!down;
    if (!jet || !jet.userData || !jet.userData.gear) return;
    const g = jet.userData.gear;
    g.visible = !!down;
    g.scale.y = down ? 1 : 0.02;
  }

  function disposeJet(obj) {
    if (!obj) return;
    obj.traverse((o) => {
      if (o.geometry) try { o.geometry.dispose(); } catch (_e) { /* ignore */ }
      const mats = o.material ? (Array.isArray(o.material) ? o.material : [o.material]) : [];
      for (const m of mats) {
        if (!m) continue;
        try { if (m.map) m.map.dispose(); } catch (_e) { /* ignore */ }
        try { m.dispose(); } catch (_e) { /* ignore */ }
      }
    });
  }
  function swapAircraft(type) {
    const id = CRASH_AIRCRAFT.some((a) => a.id === type) ? type : 'b737';
    st.acType = id;
    if (jet) {
      root.remove(jet);
      disposeJet(jet);
      jet = null;
    }
    if (makeAircraft) {
      try { jet = makeAircraft(id); } catch (e) { console.warn('[HTS] crash aircraft', e); jet = null; }
    }
    if (!jet) {
      jet = new THREE.Group();
      const m = new THREE.Mesh(new THREE.BoxGeometry(18, 4, 4), new THREE.MeshLambertMaterial({ color: 0xe8eef4 }));
      m.position.y = 2; jet.add(m);
    }
    root.add(jet);
    setGear(true);
  }

  function gearClear() {
    if (!jet || !jet.userData || jet.userData.gearDrop == null) return 5.4;
    return jet.userData.gearDrop + 0.15;
  }

  function poseJet() {
    if (!jet) return;
    jet.position.set(st.x, st.y + gearClear(), st.z);
    jet.rotation.order = 'YXZ';
    jet.rotation.set(-st.pitch, st.yaw, st.roll);
  }

  /** Ground-track heading from velocity (chase cam / turns must follow this — not a free-yaw nose). */
  function trackHdg() {
    const hs = Math.hypot(st.vx, st.vz);
    return hs > 1.5 ? Math.atan2(st.vx, st.vz) : st.yaw;
  }

  /** Rotate horizontal velocity with a yaw change so the jet never slides nose-first "backward". */
  function yawBy(d) {
    if (!Number.isFinite(d) || Math.abs(d) < 1e-8) return;
    const c = Math.cos(d), s = Math.sin(d);
    const vx = st.vx, vz = st.vz;
    st.vx = vx * c + vz * s;
    st.vz = vz * c - vx * s;
    st.yaw += d;
  }

  function clearFx() {
    fx.plumeT = 0; fx.trailAcc = 0; fx.smokeAcc = 0;
    for (const f of fx.fires) { f.visible = false; f.material.opacity = 0; }
    for (const s of fx.smoke) { s.life = 0; s.s.visible = false; }
    for (const s of fx.trail) { s.life = 0; s.s.visible = false; }
    for (const d of fx.debris) { d.life = 0; d.m.visible = false; }
  }

  function spawnSmoke(pool, x, y, z, life, spread, rise) {
    let slot = pool.find((p) => p.life <= 0);
    if (!slot) {
      slot = pool[0];
      for (const p of pool) if (p.life < slot.life) slot = p;
    }
    slot.life = life; slot.max = life;
    slot.s.visible = true;
    slot.s.position.set(x + (Math.random() - 0.5) * spread, y + Math.random() * 2, z + (Math.random() - 0.5) * spread);
    slot.vx = (Math.random() - 0.5) * 3; slot.vy = rise + Math.random() * 2.5; slot.vz = (Math.random() - 0.5) * 3;
    slot.s.material.opacity = 0.55;
    const sc0 = 6 + Math.random() * 4; slot.s.scale.set(sc0, sc0, 1);
  }

  /** Metres past the takeoff threshold along the runway heading (can exceed runway length). */
  function alongTrack() {
    const rw = st.rw;
    if (!rw) return st.station || 0;
    return (st.x - rw.tx) * Math.sin(rw.hd) + (st.z - rw.tz) * Math.cos(rw.hd);
  }

  /** Past far end + margin, with climb altitude — failure must not dump you back on the asphalt. */
  function clearedDeparture() {
    const rw = st.rw;
    const along = alongTrack();
    if (!rw) return st.y >= 100;
    /* ~450 m past departure end, ~250 ft AGL — enough to be off the paved field */
    return along > rw.len + 450 && st.y >= 75;
  }

  /** Still over the paved strip / immediate overrun — don't treat as "off-field" crash yet. */
  function overRunwayBand() {
    const rw = st.rw;
    if (!rw) return false;
    const along = alongTrack();
    const cross = -(st.x - rw.tx) * Math.cos(rw.hd) + (st.z - rw.tz) * Math.sin(rw.hd);
    return along > -80 && along < rw.len + 180 && Math.abs(cross) < 90;
  }

  function setTip(kind) {
    const sc = st.scenario || {};
    if (kind === 'fail' && sc.tipFail) { st.tip = sc.tipFail; st.lessonPhase = 'fail'; return; }
    if (kind === 'live' && sc.tipLive) { st.tip = sc.tipLive; st.lessonPhase = 'live'; return; }
    if (kind === 'debrief' && sc.lesson) {
      st.lessonPhase = 'debrief';
      const L = sc.lesson;
      const where = st.impactKind === 'building' ? 'a building strike'
        : (st.impactKind === 'water' ? 'a water impact' : 'terrain impact');
      const mi = (st.odo / 1609.344);
      st.tip = `Debrief: ${where} after ${mi < 0.1 ? Math.round(st.odo) + ' m' : mi.toFixed(1) + ' mi'}. ${L.memory}`;
      return;
    }
    st.tip = (sc.tipLive || sc.blurb || '');
    st.lessonPhase = 'brief';
  }

  function armFailure() {
    st.failed = true; st.phase = 'fail';
    st.failAlong = alongTrack();
    st.failAlt = st.y;
    st.failSpd = Math.hypot(st.vx, st.vy, st.vz);
    const sc = st.scenario || {};
    if (sc.fail === 'engine' || sc.fail === 'ditch') {
      st.thrust = 0;
      /* Best-glide ~7–8° pitch for a clean twin — keep flying past the field */
      st.pitchRate = (0.10 - st.pitch) * 2.2;
      st.stall = false;
    }
    if (sc.fail === 'bird') {
      st.thrust = Math.min(st.thrust, 0.22);
      st.yawRate = (Math.random() < 0.5 ? -1 : 1) * 0.22; /* asymmetric */
      st.rollRate = Math.sign(st.yawRate) * 0.35;
    }
    if (sc.fail === 'wake') { st.rollRate = 2.1; st.pitchRate = -0.42; st.yawRate = (Math.random() < 0.5 ? -1 : 1) * 0.25; }
    if (sc.fail === 'stall') st.pitchRate = 0.55;
    if (sc.urban) st.yawRate = (Math.random() < 0.5 ? -1 : 1) * 0.1;
    const past = Math.max(0, Math.round(st.failAlong - (st.rw ? st.rw.len : 0)));
    st.status = (st.rw ? st.rw.code + ' · RWY ' + st.rw.name + ' · ' : '')
      + (sc.n || 'Failure') + ' · emergency · ' + Math.round(st.failAlt) + ' m · ' + past + ' m past end';
    setTip('fail');
    try { audio.cue('fail'); } catch (_e) { /* ignore */ }
  }

  function resetTakeoff(sc, apt) {
    const rw = pickRunway(apt.code);
    st.rw = rw;
    st.station = 40;
    const p = alongRw(rw, st.station);
    st.x = p.x; st.y = 0; st.z = p.z;
    st.yaw = rw.hd;
    st.pitch = 0; st.roll = 0; st.pitchRate = 0; st.rollRate = 0; st.yawRate = 0;
    st.vx = 0; st.vy = 0; st.vz = 0;
    st.thrust = 1; st.phase = 'roll'; st.failArmed = true; st.failed = false;
    st.Vr = 78; st.V2 = 90;
    st.failAlong = 0; st.failAlt = 0; st.failSpd = 0; st.impactKind = '';
    setGear(true);
    st.status = `${rw.code} · RWY ${rw.name} · takeoff roll`;
  }

  function resetApproach(sc, apt) {
    const rw = pickRunway(apt.code);
    st.rw = rw;
    st.station = -380;
    const alt = sc.alt != null ? sc.alt : 50;
    const p = alongRw(rw, st.station);
    st.x = p.x; st.y = alt; st.z = p.z;
    st.yaw = rw.hd;
    st.pitch = ((sc.pitch != null ? sc.pitch : 8) * Math.PI) / 180;
    st.roll = ((sc.roll || 0) * Math.PI) / 180;
    const spd = sc.spd || 55;
    st.vx = Math.sin(st.yaw) * spd; st.vz = Math.cos(st.yaw) * spd; st.vy = -Math.abs(spd) * 0.12;
    st.thrust = sc.fail === 'hard' ? 0.15 : 0.35;
    st.phase = 'approach'; st.failArmed = false; st.failed = true;
    st.pitchRate = sc.fail === 'stall' ? 0.35 : -0.05;
    st.rollRate = 0; st.yawRate = 0;
    st.failAlong = alongTrack(); st.failAlt = alt; st.failSpd = spd; st.impactKind = '';
    setGear(true);
    st.status = `${rw.code} · RWY ${rw.name} · short final`;
  }

  function resetFromScenario(sc, aptCode, acType) {
    const apt = pickAirport(aptCode);
    if (!apt) { st.status = 'No airport available'; return sc; }
    clearFx();
    swapAircraft(acType || st.acType);
    st.active = true; st.done = false; st.impact = false; st.stall = false; st.t = 0;
    st.scenario = sc; st.airport = apt; st.follow = true;
    st.view = 'chase'; st.speedX = 1; st.th0 = 0; st.ph0 = 1.25;
    st.odo = 0; st.peakAlt = 0; st.camShake = 0;
    setTip('live');
    if (sc.phase === 'approach') resetApproach(sc, apt);
    else resetTakeoff(sc, apt);
    poseJet();
    root.visible = true;
    try {
      audio.start('jet', { muted: false, vol: 0.5, radioOn: true });
      audio.cue('start');
    } catch (_e) { /* ignore */ }
    return sc;
  }

  function start(opts) {
    const o = typeof opts === 'string' ? { scenario: opts } : (opts || {});
    const sc = CRASH_SCENARIOS.find((s) => s.id === (o.scenario || o.id)) || CRASH_SCENARIOS[0];
    const run = () => resetFromScenario(sc, o.airport, o.aircraft);
    if (!osm.ready) {
      st.status = 'Loading runway data…';
      const wait = setInterval(() => {
        if (!osm.ready) return;
        clearInterval(wait);
        run();
      }, 50);
      setTimeout(() => { clearInterval(wait); if (!st.active) run(); }, 2500);
      return sc;
    }
    return run();
  }

  function stop() {
    st.active = false; st.done = false; st.phase = 'idle'; root.visible = false; st.status = 'Idle';
    st.view = 'chase'; st.follow = false; st.speedX = 1; st.camShake = 0;
    st.impact = false; st.failed = false; st.lessonPhase = 'brief'; st.tip = '';
    clearFx();
    if (jet) jet.visible = true;
    try { audio.stop(); } catch (_e) { /* ignore */ }
  }

  function impact(kind) {
    if (st.impact) return;
    st.impact = true; st.done = true; st.thrust = 0; st.phase = 'impact';
    st.impactKind = kind || 'ground';
    const spd = Math.hypot(st.vx, st.vy, st.vz);
    const past = st.rw ? Math.max(0, Math.round(alongTrack() - st.rw.len)) : 0;
    const distNote = st.failed
      ? ` · fail@${Math.round(st.failAlt)}m / ${Math.round(Math.max(0, st.failAlong - (st.rw ? st.rw.len : 0)))}m past`
      : '';
    const where = st.impactKind === 'building' ? 'Building strike'
      : (st.impactKind === 'water' ? 'Water impact' : (overRunwayBand() ? 'Runway / overrun impact' : 'Off-field impact'));
    const tripMi = st.odo / 1609.344;
    st.status = (st.rw ? st.rw.code + ' · RWY ' + st.rw.name + ' · ' : '')
      + where + ' · ' + Math.round(spd * 1.94) + ' kt · trip ' + (tripMi < 0.1 ? Math.round(st.odo) + ' m' : tripMi.toFixed(1) + ' mi')
      + ' · ' + past + ' m past end' + distNote;

    /* Energy scales wreck FX — high-alt / long-glide hits are fiercer than a short mush */
    const energy = clamp(spd / 35 + (st.failAlt || 0) / 320 + (st.impactKind === 'building' ? 0.35 : 0), 0.75, 3.0);
    st.camShake = clamp(0.45 + energy * 0.28, 0.5, 1.1);
    fx.plumeT = 70 + energy * 40;
    for (let i = 0; i < fx.fires.length; i++) {
      const f = fx.fires[i];
      f.visible = true;
      f.position.set(st.x + (Math.random() - 0.5) * 8, 2.2 + i * 1.2, st.z + (Math.random() - 0.5) * 8);
      f.material.opacity = Math.min(1, 0.5 + energy * 0.25);
      const sca = (14 + spd * 0.05 + i * 4) * lerp(0.9, 1.35, energy / 3); f.scale.set(sca, sca * 1.15, 1);
    }
    /* Cap burst so Windows GPUs don't hitch / lose context on impact */
    const smokeN = Math.min(14, 10 + Math.floor(energy * 4));
    for (let i = 0; i < smokeN; i++) spawnSmoke(fx.smoke, st.x, 3, st.z, 14 + Math.random() * 14, 14, 2.8);
    for (const d of fx.debris) {
      d.life = 4 + Math.random() * 5; d.m.visible = true;
      d.m.position.set(st.x, Math.max(1.5, st.y * 0.3), st.z);
      const a = Math.random() * Math.PI * 2;
      const kick = (14 + Math.random() * 28) * energy;
      d.vx = Math.cos(a) * kick; d.vz = Math.sin(a) * kick;
      d.vy = 8 + Math.random() * 18 * energy; d.spin = (Math.random() - 0.5) * 10;
    }
    if (st.impactKind === 'building') {
      st.pitch = -0.72; st.roll = (Math.random() - 0.5) * 2.2;
      st.y = Math.max(st.y * 0.35, 6);
    } else if (st.impactKind === 'water') {
      st.pitch = -0.18; st.roll = (Math.random() - 0.5) * 0.6;
    } else {
      st.pitch = -0.48; st.roll = (Math.random() - 0.5) * 1.5;
    }
    st.vx *= 0.05; st.vz *= 0.05; st.vy = 0;
    setTip('debrief');
    try { audio.cue('crash'); } catch (_e) { /* ignore */ }
  }

  function tickFx(h) {
    if (fx.plumeT > 0) {
      fx.plumeT -= h;
      fx.smokeAcc += h;
      while (fx.smokeAcc > 0.18) {
        fx.smokeAcc -= 0.18;
        spawnSmoke(fx.smoke, st.x, 2.5, st.z, 12 + Math.random() * 18, 16, 2.5 + Math.random() * 2);
      }
      for (let i = 0; i < fx.fires.length; i++) {
        const f = fx.fires[i];
        if (!f.visible) continue;
        f.position.x = st.x + Math.sin(st.t * 3 + i) * 2;
        f.position.z = st.z + Math.cos(st.t * 2.5 + i) * 2;
        f.position.y = 2.4 + i * 1.1 + Math.sin(st.t * 9 + i) * 0.5;
        f.material.opacity = clamp(0.35 + 0.25 * Math.sin(st.t * 11 + i) + Math.min(0.4, fx.plumeT / 40), 0, 1);
        if (fx.plumeT < 8) f.material.opacity *= fx.plumeT / 8;
      }
    } else {
      for (const f of fx.fires) {
        if (!f.visible) continue;
        f.material.opacity = Math.max(0, f.material.opacity - h * 0.15);
        if (f.material.opacity <= 0.02) f.visible = false;
      }
    }

    if (st.failed && !st.impact && (st.scenario?.fail === 'engine' || st.scenario?.fail === 'bird' || st.scenario?.fail === 'ditch')) {
      fx.trailAcc += h;
      while (fx.trailAcc > 0.12) {
        fx.trailAcc -= 0.12;
        spawnSmoke(fx.trail, st.x - Math.sin(st.yaw) * 8, st.y + gearClear() + 1, st.z - Math.cos(st.yaw) * 8, 2.2 + Math.random() * 1.5, 4, 1.2);
      }
    }

    for (const pool of [fx.smoke, fx.trail]) {
      for (const s of pool) {
        if (s.life <= 0) { s.s.visible = false; continue; }
        s.life -= h;
        s.s.position.x += s.vx * h; s.s.position.y += s.vy * h; s.s.position.z += s.vz * h;
        s.vy += 0.6 * h; s.vx *= 0.99; s.vz *= 0.99;
        const k = clamp(s.life / s.max, 0, 1);
        s.s.material.opacity = Math.max(0, k * 0.5);
        const sca = 8 + (1 - k) * 22; s.s.scale.set(sca, sca, 1);
        if (s.life <= 0) s.s.visible = false;
      }
    }
    for (const d of fx.debris) {
      if (d.life <= 0) { d.m.visible = false; continue; }
      d.life -= h; d.vy -= st.g * h;
      d.m.position.x += d.vx * h; d.m.position.y += d.vy * h; d.m.position.z += d.vz * h;
      d.m.rotation.x += d.spin * h; d.m.rotation.z += d.spin * 0.6 * h;
      if (d.m.position.y < 0.3) { d.m.position.y = 0.3; d.vy *= -0.22; d.vx *= 0.65; d.vz *= 0.65; }
    }
  }

  const _fwd = new THREE.Vector3();
  const _vel = new THREE.Vector3();
  const _side = new THREE.Vector3();
  const _lift = new THREE.Vector3();

  function addOdo(h) {
    const spd = Math.hypot(st.vx || 0, st.vy || 0, st.vz || 0);
    if (spd > 0.4) st.odo += spd * h;
    if ((st.y || 0) > st.peakAlt) st.peakAlt = st.y;
    if (st.camShake > 0) st.camShake = Math.max(0, st.camShake - h * 1.15);
  }

  /** One physics tick (h seconds). Called in substeps so ×2/×4/×10 actually accelerate wall-clock. */
  function step(h) {
    st.t += h;
    const sc = st.scenario || {};
    const rw = st.rw;
    const tag = rw ? `${rw.code} · RWY ${rw.name}` : (st.airport?.code || '');

    if (st.impact) {
      if (st.camShake > 0) st.camShake = Math.max(0, st.camShake - h * 1.15);
      tickFx(h);
      poseJet();
      return;
    }

    /* ——— Takeoff roll on real OSM centreline ——— */
    if (st.phase === 'roll' && rw) {
      st.thrust = 1;
      const spd = Math.hypot(st.vx, st.vz);
      const accel = 14;
      const next = Math.min(st.Vr + 12, spd + accel * h);
      st.vx = Math.sin(st.yaw) * next;
      st.vz = Math.cos(st.yaw) * next;
      st.vy = 0;
      st.station += next * h;
      const p = alongRw(rw, st.station);
      st.x = p.x; st.y = 0; st.z = p.z;
      st.pitch = 0;
      addOdo(h);
      const ias = next * 1.94384;
      st.status = `${tag} · takeoff roll · ${Math.round(ias)} kt`;
      if (next >= st.Vr) {
        st.phase = 'rotate';
        st.pitchRate = 0.62;
        st.status = `${tag} · rotate`;
        try { audio.cue('takeoff'); } catch (_e) { /* ignore */ }
      }
      poseJet();
      return;
    }

    if (st.phase === 'rotate' && rw) {
      st.thrust = 1;
      const spd = Math.max(st.Vr, Math.hypot(st.vx, st.vz));
      st.pitch = Math.min(0.24, st.pitch + st.pitchRate * h);
      st.vx = Math.sin(st.yaw) * spd;
      st.vz = Math.cos(st.yaw) * spd;
      st.vy = Math.sin(st.pitch) * spd * 0.72;
      st.station += spd * h;
      const p = alongRw(rw, st.station);
      st.x = p.x; st.z = p.z;
      st.y = Math.max(0, st.y + st.vy * h);
      addOdo(h);
      st.status = `${tag} · rotate · ${Math.round(spd * 1.94384)} kt`;
      if (st.y > 12 || st.pitch >= 0.2) {
        st.phase = 'climb';
        const v2 = Math.max(st.V2, spd);
        st.vx = Math.sin(st.yaw) * v2;
        st.vz = Math.cos(st.yaw) * v2;
        st.vy = Math.max(8, Math.sin(st.pitch) * v2 * 0.55);
        st.status = `${tag} · initial climb`;
      }
      poseJet();
      return;
    }

    if (rw && (st.phase === 'climb' || st.phase === 'fail' || st.phase === 'approach')) {
      st.station = alongTrack();
    }

    if (!st.failed && st.failArmed && st.phase === 'climb') {
      const tNeed = sc.failAt != null ? sc.failAt : 28;
      const aNeed = sc.failAlt != null ? sc.failAlt : 220;
      const mustClear = !!sc.clearRw;
      const ready = mustClear
        ? clearedDeparture() && (st.t >= tNeed || st.y >= aNeed)
        : (st.t >= tNeed || st.y >= aNeed);
      if (ready) armFailure();
      else if (mustClear && !clearedDeparture()) {
        const left = Math.max(0, Math.round((rw ? rw.len + 450 : 2000) - alongTrack()));
        st.status = `${tag} · climb-out · clear runway (${left} m) · ${Math.round(st.y)} m`;
      }
    }

    if (st.phase === 'climb' && st.gearDown && st.y > 35 && st.vy > 3) setGear(false);

    if (sc.fail === 'bird' && st.failed) {
      st.thrust = Math.max(0, st.thrust - h * 0.1);
      yawBy(st.yawRate * h);
      st.roll += (st.yawRate * 0.45 + st.rollRate) * h;
      st.rollRate *= 0.992;
    }
    if (sc.fail === 'wake' && st.failed) {
      st.rollRate *= 0.994;
      st.roll += st.rollRate * h;
      yawBy(st.yawRate * h * 0.6);
      st.pitchRate += Math.sin(st.t * 2.4) * 0.22 * h;
    }
    if (sc.fail === 'stall' && st.failed) st.pitchRate += 0.22 * h;
    if (sc.fail === 'hard' && st.failed) st.pitchRate -= 0.08 * h;
    if ((sc.fail === 'engine' || sc.fail === 'ditch') && st.failed && !st.impact) {
      const glidePitch = st.failAlt > 300 ? 0.09 : 0.11;
      st.pitchRate += (glidePitch - st.pitch) * 1.6 * h;
    }

    if (!st.impact) {
      const th = trackHdg();
      let dAlign = th - st.yaw;
      while (dAlign > Math.PI) dAlign -= Math.PI * 2;
      while (dAlign < -Math.PI) dAlign += Math.PI * 2;
      /* Wake/bird keep intentional yaw error longer so the upset reads */
      const alignK = (sc.fail === 'wake' || sc.fail === 'bird') && st.failed ? 1.2 : 4;
      st.yaw += clamp(dAlign, -0.9, 0.9) * Math.min(1, h * alignK);
    }

    if (st.failed && !st.impact && sc.urban) {
      const aim = typeof cityAim === 'function' ? cityAim() : null;
      if (aim && Number.isFinite(aim.x)) {
        const want = Math.atan2(aim.x - st.x, aim.z - st.z);
        let dYaw = want - st.yaw;
        while (dYaw > Math.PI) dYaw -= Math.PI * 2;
        while (dYaw < -Math.PI) dYaw += Math.PI * 2;
        const turn = clamp(dYaw, -0.28, 0.28) * 0.45 * h;
        yawBy(turn);
        st.roll = lerp(st.roll, clamp(turn * 22, -0.5, 0.5), 0.1);
      }
    }

    if (!st.failed && st.phase === 'climb') {
      st.thrust = 1;
      const targetPitch = clearedDeparture() ? 0.14 : 0.20;
      st.pitchRate += (targetPitch - st.pitch) * 2.0 * h;
      const horiz = Math.hypot(st.vx, st.vz) || 0.01;
      const targetSpd = st.V2 + 6;
      if (horiz < targetSpd) {
        const add = (targetSpd - horiz) * 1.8 * h;
        st.vx += Math.sin(st.yaw) * add;
        st.vz += Math.cos(st.yaw) * add;
      }
      if (!clearedDeparture()) st.vy = Math.max(st.vy, 10);
      else st.vy = Math.max(st.vy, 4);
    }

    const spd = Math.hypot(st.vx, st.vy, st.vz) || 0.01;
    const rho = 1.2, wing = 125;
    const flaps = (st.gearDown || st.y < 120) && !st.failed ? 0.72 : (st.failed ? 0.15 : 0.25);
    const Cl0 = 0.42 + flaps, Cla = 5.2, Cd0 = 0.026 + flaps * 0.02, kDrag = 0.042;
    let aoa = st.pitch - Math.atan2(st.vy, Math.hypot(st.vx, st.vz) || 0.01);
    const stallSpd = st.failed ? 52 : 58;
    if (Math.abs(aoa) > 0.32 || spd < stallSpd) {
      st.stall = true;
      aoa *= 0.4;
      if (st.failed || st.phase === 'approach') st.pitchRate -= Math.sign(aoa || 1) * 0.4 * h;
    } else st.stall = false;
    const Cl = clamp(Cl0 + Cla * aoa, -0.4, 2.05);
    const Cd = Cd0 + kDrag * Cl * Cl + (st.stall ? 0.28 : 0);
    const q = 0.5 * rho * spd * spd;
    const lift = q * wing * Cl;
    const drag = q * wing * Cd;
    const thrustN = st.thrust * 240000;

    _fwd.set(Math.sin(st.yaw), 0, Math.cos(st.yaw));
    _vel.set(st.vx, st.vy, st.vz);
    _side.set(Math.cos(st.yaw), 0, -Math.sin(st.yaw));
    _lift.crossVectors(_vel, _side);
    if (_lift.lengthSq() < 1e-8) _lift.set(0, 1, 0);
    else _lift.normalize();
    if (_lift.y < 0) _lift.negate();

    const ax = (_fwd.x * thrustN - _vel.x / spd * drag + _lift.x * lift) / st.mass;
    const ay = (-st.g * st.mass - _vel.y / spd * drag + _lift.y * lift + Math.sin(st.pitch) * thrustN * 0.2) / st.mass;
    const az = (_fwd.z * thrustN - _vel.z / spd * drag + _lift.z * lift) / st.mass;

    st.vx += ax * h; st.vy += ay * h; st.vz += az * h;
    if (!st.failed && st.phase === 'climb' && !clearedDeparture()) st.vy = Math.max(st.vy, 8);

    st.x += st.vx * h; st.y += st.vy * h; st.z += st.vz * h;
    addOdo(h);
    if (!Number.isFinite(st.x) || !Number.isFinite(st.y) || !Number.isFinite(st.z)) {
      st.x = st.airport ? st.airport.x : 0; st.y = 40; st.z = st.airport ? st.airport.z : 0;
      st.vx = 0; st.vy = 0; st.vz = 0; impact('ground'); poseJet(); return;
    }

    st.pitch += st.pitchRate * h;
    st.pitch = clamp(st.pitch, -0.85, 0.55);
    st.pitchRate *= 0.985;
    if (!st.failed) st.roll *= 0.992;

    /* Building probe once per frame (caller sets _probeBldg), not every physics substep */
    if (st._probeBldg && st.failed && typeof probeBuilding === 'function' && !overRunwayBand()) {
      st._probeBldg = false;
      const hit = probeBuilding(st.x, st.y + gearClear() * 0.5, st.z);
      if (hit) {
        impact('building');
        tickFx(h);
        poseJet();
        return;
      }
    }

    const water = !!(sc.water && st.failed);
    const ground = water ? -2 : 0;
    const canGroundHit = st.failed || st.phase === 'approach' || (st.phase === 'climb' && clearedDeparture());
    if (canGroundHit && st.y <= ground + 1.4) {
      st.y = ground + 1.0;
      impact(water ? 'water' : 'ground');
    } else if (!canGroundHit && st.y < 2) {
      st.y = Math.max(st.y, 2);
      st.vy = Math.max(st.vy, 6);
    }

    tickFx(h);

    const ias = Math.hypot(st.vx, st.vy, st.vz) * 1.94384;
    let phaseLbl = st.failed ? (sc.n || 'Fail') : (st.phase === 'approach' ? 'final' : 'climb');
    if (!st.failed && sc.clearRw && st.phase === 'climb' && !clearedDeparture()) {
      const left = Math.max(0, Math.round((rw ? rw.len + 450 : 2000) - alongTrack()));
      phaseLbl = `climb-out · ${left} m past end`;
    } else if (st.failed && !st.impact) {
      const past = rw ? Math.max(0, Math.round(alongTrack() - rw.len)) : 0;
      phaseLbl = `${sc.n || 'Fail'} · ${past} m past`;
    }
    st.status = `${tag} · ${phaseLbl} · ${Math.round(st.y)} m · ${Math.round(ias)} kt${st.stall ? ' · STALL' : ''}`;
    poseJet();
  }

  function update(dt) {
    if (!st.active) return st;
    /* Tour-style time compression — keep Windows substeps modest to avoid frame stalls / context loss */
    const sx = st.speedX || 1;
    const sdt = Math.min(0.12, Math.max(0, dt)) * sx;
    const win = typeof navigator !== 'undefined' && /Windows/i.test(navigator.userAgent || '');
    const n = Math.max(1, Math.min(win ? 3 : 6, Math.ceil(sdt / 0.04)));
    const h = sdt / n;
    st._probeBldg = true;
    for (let i = 0; i < n; i++) {
      try { step(h); } catch (e) {
        console.warn('[HTS] crash step', e && e.message);
        break;
      }
      if (st.impact) break;
    }
    try {
      const spd = Math.hypot(st.vx, st.vy, st.vz);
      const pwr = st.impact ? 0.05 : (st.failed ? Math.max(0.08, st.thrust * 0.35) : Math.max(0.35, st.thrust));
      audio.update(spd, 'jet', st.phase, pwr);
    } catch (_e) { /* ignore */ }
    return st;
  }

  /* Defer heavy tourJet mesh until Run — creating it on page load was blowing Windows GPU memory */
  root.visible = false;

  const VIEWS = [['chase', 'Chase'], ['cockpit', 'Cockpit'], ['window', 'Window'], ['wing', 'Wing'], ['top', 'Top'], ['orbit', 'Free look']];

  return {
    start, stop, update,
    scenarios: CRASH_SCENARIOS,
    aircraft: CRASH_AIRCRAFT,
    views: VIEWS,
    airports,
    releaseFollow() { st.follow = false; if (st.view !== 'orbit') st.view = 'orbit'; },
    setView(v) {
      const ok = VIEWS.some((x) => x[0] === v);
      if (!ok) return;
      st.view = v;
      /* Free look still tracks the jet (tour-style); releaseFollow turns tracking off */
      st.follow = true;
    },
    setSpeedX(x) {
      const n = +x;
      st.speedX = (n === 1 || n === 2 || n === 4 || n === 10) ? n : 1;
    },
    get jet() { return jet; },
    get state() { return st; },
    set follow(v) { st.follow = !!v; },
    get audio() { return audio; },
  };
}
