/**
 * Tour Houston — guided car / plane tours to a chosen place, plus free drive and free flight.
 * Car tour: shortest-time route over the live OSM carriageway graph (houston-traffic), driven in-lane at
 * the road's free-flow speed scaled by what the simulated traffic around it is doing, slowing for curves.
 * Plane tour: Cessna-class aircraft rolls down the nearest airport's OSM runway, rotates at 55 kt, climbs at
 * ~700 ft/min to 1,500 ft, cruises at 110 kt, descends to 1,000 ft and circles the destination.
 */
import * as THREE from 'three';
import { findRoute, houDriveFactor, nearestCw, nearestCwList } from './route/houston-route.js';
import { createTourAudio } from './tour-audio.js';
import { dashSvg, updateDash } from './cockpit-dash.js';
import { createTourMusic } from './tour-music.js';
import { attachPlaceSearch } from './ui/place-search.js';
import { clockTz } from './world/tz.js';

const MPH = 0.44704, KT = 0.514444, FT = 0.3048, G = 9.81;
const _isWin = typeof navigator !== 'undefined' && /Windows/i.test(navigator.userAgent || '');
const LANDMARKS = [
  ['Downtown Houston', 29.7604, -95.3698], ['Galleria / Uptown', 29.739, -95.463], ['Texas Medical Center', 29.707, -95.398],
  ['NRG Stadium', 29.6847, -95.4107], ['Hermann Park', 29.7135, -95.3905], ['Rice University', 29.7174, -95.4018],
  ['University of Houston', 29.72208, -95.34696], ['Texas Southern University', 29.7220, -95.3578],
  ['Lamar High School', 29.7428, -95.4265], ['Bellaire High School', 29.69228, -95.47026],
  ['Museum District', 29.724, -95.39], ['Daikin Park (Minute Maid)', 29.7573, -95.3555], ['Toyota Center', 29.7508, -95.3621],
  ['Buffalo Bayou Park', 29.762, -95.386], ['Memorial Park', 29.765, -95.441], ['Space Center Houston', 29.5519, -95.0981],
  ['NASA Johnson Space Center', 29.5593, -95.0899], ['San Jacinto Monument', 29.7499, -95.0807],
  ['Kemah Boardwalk', 29.5466, -95.02], ['The Woodlands Waterway', 30.163, -95.464],
  ['Houston Ship Channel', 29.735, -95.205], ['Ellington Airport', 29.6073, -95.1588],
  ['Discovery Green', 29.7525, -95.3594], ['Gerald D. Hines Waterwall', 29.7372, -95.4614],
  ['The Heights', 29.7989, -95.3987], ['Montrose', 29.7435, -95.3915], ['EaDo / East Downtown', 29.7520, -95.3455],
  ['Houston Zoo', 29.7161, -95.3900], ['Astrodome', 29.6850, -95.4078], ['Moody Gardens (Galveston)', 29.2736, -94.8519],
  ['Hobby Airport (HOU)', 29.6454, -95.2789], ['Bush Intercontinental (IAH)', 29.9902, -95.3368],
  ['Energy Corridor', 29.7805, -95.6340], ['Katy Mills', 29.77562, -95.80949], ['Sugar Land Town Square', 29.59555, -95.62289],
  ['Bayou Place', 29.7618, -95.3685], ['Market Square Park', 29.7629, -95.3617],
];
const DEST_BLURB = {
  'Downtown Houston': 'Skyline loop — tunnels below, neon above.',
  'Galleria / Uptown': 'Post Oak glitter and the Waterwall nearby.',
  'Texas Medical Center': 'World’s largest medical city — keep it smooth.',
  'NRG Stadium': 'Rodeo, Texans, and the Astrodome next door.',
  'Hermann Park': 'Oak alleys, zoo, and museum lawns.',
  'Space Center Houston': 'Mission Control country — wave at NASA.',
  'NASA Johnson Space Center': 'Where Houston said “we have a problem.”',
  'San Jacinto Monument': 'Taller than the Washington Monument — ship channel views.',
  'Kemah Boardwalk': 'Gulf breeze and ferris-wheel nights.',
  'The Woodlands Waterway': 'North-side canal stroll from the air.',
  'Buffalo Bayou Park': 'Sabine-to-Shepherd green ribbon.',
  'Memorial Park': '1,500 acres of pine shade west of downtown.',
  'Discovery Green': 'Lawn between the towers — perfect flyby.',
  'Gerald D. Hines Waterwall': 'Uptown’s curtain of water.',
  'Houston Ship Channel': 'Cargo spine of the Gulf Coast.',
  'Hobby Airport (HOU)': 'Southwest’s Houston home field.',
  'Bush Intercontinental (IAH)': 'United hub — five terminals of traffic.',
};
const VIEWS = { car: [['chase', 'Chase'], ['driver', 'Driver'], ['side', 'Side'], ['top', 'Top'], ['orbit', 'Free look']],
  plane: [['chase', 'Chase'], ['cockpit', 'Cockpit'], ['window', 'Window'], ['wing', 'Wing'], ['top', 'Top'], ['orbit', 'Free look']] };
const CAR_STYLES = [['sedan', 'Sedan'], ['suv', 'SUV'], ['pickup', 'Pickup'], ['coupe', 'Coupe'], ['van', 'Van']];
const PLANE_STYLES = [['prop', 'Cessna'], ['jet', 'Jet'], ['heli', 'Helicopter'], ['fighter', 'F-16 fighter'], ['b2', 'B-2 Spirit'], ['c130', 'C-130 Hercules']];
/* tour aircraft picker: [id, name, family]; family drives physics/cockpit/audio, id picks the airliner model */
const AIRCRAFT = [['b737', 'Boeing 737-800', 'jet'], ['b747', 'Boeing 747-8', 'jet'], ['b777', 'Boeing 777-300ER', 'jet'], ['b787', 'Boeing 787-9 Dreamliner', 'jet'],
  ['a320', 'Airbus A320neo', 'jet'], ['a350', 'Airbus A350-900', 'jet'], ['a380', 'Airbus A380', 'jet'],
  ['prop', 'Cessna 172', 'prop'], ['c130', 'C-130 Hercules', 'c130'], ['fighter', 'F-16 Fighting Falcon', 'fighter'], ['b2', 'B-2 Spirit', 'b2'], ['heli', 'Bell 206 helicopter', 'heli']];
/* minimum runway (m) each type may depart from / land on — widebodies only fit IAH-class runways */
const RWY_NEED = { b737: 2000, a320: 2000, b787: 2700, a350: 2700, b777: 2900, b747: 3000, a380: 3000, c130: 1200, fighter: 1500, prop: 0, heli: 0 };
const CAR_COLORS = [0xb3202a, 0x1e4d8c, 0x22262c, 0xe8e8ea, 0xd4a017, 0x2f7a4a, 0x6b3d8c, 0xc45a2a, 0x14a3a3, 0x5bb8ff, 0xd94f8a, 0x8cc63f, 0x9aa3ad, 0x6e1f2b];
/* accent palette (cheat-line, tail, nose, engines); -1 = none */
const PLANE_ACCENTS = [0xc23a2c, 0x5bb8ff, 0x2b5ea8, 0x1b2a4a, 0xd9a441, 0xe6c34a, 0xf3f4f6, 0x9aa3ad, 0x1a1c22, 0x1a6b4a, 0xff7a1a, 0xd94f8a, 0x5a2d7a, 0x14a3a3];
const PLANE_COLORS = [0xc23a2c, 0x2b5ea8, 0xf3f4f6, 0xd9a441, 0x1a6b4a, 0x5a2d7a, 0x9aa3ad, 0x1a1c22, 0x14a3a3, 0xff7a1a, 0x5bb8ff, 0xd94f8a, 0x1b2a4a]; /* one white; silver instead of a second off-white */
const PREF_KEY = 'hts-tour-veh';
function loadPrefs() {
  try {
    const j = JSON.parse(localStorage.getItem(PREF_KEY) || '{}');
    return {
      carColor: CAR_COLORS.includes(+j.carColor) ? +j.carColor : CAR_COLORS[0],
      carStyle: CAR_STYLES.some((s) => s[0] === j.carStyle) ? j.carStyle : 'sedan',
      planeColor: PLANE_COLORS.includes(+j.planeColor) ? +j.planeColor : PLANE_COLORS[0],
      planeAccent: PLANE_ACCENTS.includes(+j.planeAccent) ? +j.planeAccent : -1,
      planeStyle: PLANE_STYLES.some((s) => s[0] === j.planeStyle) ? j.planeStyle : 'prop',
      jetModel: AIRCRAFT.some((a) => a[0] === j.jetModel && a[2] === 'jet') ? j.jetModel : 'b737',
      hudX: Number.isFinite(+j.hudX) ? +j.hudX : null,
      hudY: Number.isFinite(+j.hudY) ? +j.hudY : null,
      cpX: Number.isFinite(+j.cpX) ? +j.cpX : null,
      cpY: Number.isFinite(+j.cpY) ? +j.cpY : null,
      cpW: Number.isFinite(+j.cpW) ? +j.cpW : null,
      cpH: Number.isFinite(+j.cpH) ? +j.cpH : null,
      soundOn: j.soundOn !== false,
      soundVol: Number.isFinite(+j.soundVol) ? Math.max(0, Math.min(1, +j.soundVol)) : 0.45,
      radioOn: j.radioOn !== false,
      musicOn: !!j.musicOn,
    };
  } catch (e) {
    return { carColor: CAR_COLORS[0], carStyle: 'sedan', planeColor: PLANE_COLORS[0], planeAccent: -1, planeStyle: 'prop', jetModel: 'b737', hudX: null, hudY: null, cpX: null, cpY: null, cpW: null, cpH: null, soundOn: true, soundVol: 0.45, radioOn: true, musicOn: false };
  }
}
function savePrefs(p) { try { localStorage.setItem(PREF_KEY, JSON.stringify(p)); } catch (e) { /* ignore */ } }

/* Tour car — Lambert mats for FPS; full cabin only on the player vehicle (detail=true) */
function makeTourCar(color, style, detail = true) {
  const g = new THREE.Group();
  /* clear-coated metallic paint, tinted glass and real chrome (PBR) so the tour car reads like a real car, not a toy */
  const paint = new THREE.MeshPhysicalMaterial({ color, metalness: 0.45, roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.08 });
  const darkPaint = new THREE.MeshStandardMaterial({ color: new THREE.Color(color).multiplyScalar(0.55).getHex(), metalness: 0.35, roughness: 0.45 });
  const glass = new THREE.MeshStandardMaterial({
    color: 0x55707f, metalness: 0.6, roughness: 0.05, transparent: true, opacity: 0.5, depthWrite: false, side: THREE.DoubleSide,
  });
  const tint = new THREE.MeshStandardMaterial({
    color: 0x141c24, metalness: 0.5, roughness: 0.08, transparent: true, opacity: 0.66, depthWrite: false, side: THREE.DoubleSide,
  });
  const chrome = new THREE.MeshStandardMaterial({ color: 0xe2e6ea, metalness: 1, roughness: 0.18 });
  const black = new THREE.MeshLambertMaterial({ color: 0x141618 });
  const tyre = new THREE.MeshStandardMaterial({ color: 0x121416, roughness: 0.92, metalness: 0 });
  const leather = new THREE.MeshLambertMaterial({ color: 0x2a2420 });
  const dashM = new THREE.MeshLambertMaterial({ color: 0x1a1e24 });
  const plastic = new THREE.MeshLambertMaterial({ color: 0x22262c });
  const box = (w, h, l, m, x, y, z, rx = 0, ry = 0, rz = 0) => {
    const me = new THREE.Mesh(new THREE.BoxGeometry(w, h, l), m);
    me.position.set(x, y, z); me.rotation.set(rx, ry, rz); g.add(me); return me;
  };
  const suv = style === 'suv', pick = style === 'pickup', coupe = style === 'coupe', van = style === 'van';
  const bodyW = suv || van ? 1.98 : pick ? 1.92 : coupe ? 1.86 : 1.88;
  const bodyH = suv ? 0.78 : van ? 0.95 : pick ? 0.64 : coupe ? 0.56 : 0.62;
  const bodyL = pick ? 3.15 : van ? 5.05 : coupe ? 4.45 : suv ? 4.75 : 4.65;
  const cabinH = suv ? 0.92 : van ? 1.15 : pick ? 0.62 : coupe ? 0.52 : 0.58;
  const cabinL = pick ? 1.65 : van ? 3.4 : coupe ? 1.85 : suv ? 2.65 : 2.35;
  const cabinZ = pick ? 0.72 : van ? -0.15 : coupe ? -0.15 : suv ? -0.12 : -0.22;
  const roofY = bodyH + cabinH * 0.55 + 0.08;
  box(bodyW, bodyH, bodyL, paint, 0, bodyH * 0.55 + 0.12, pick ? 0.5 : 0);
  box(bodyW * 0.98, 0.12, bodyL * 0.96, darkPaint, 0, 0.22, pick ? 0.5 : 0);
  const zNose = pick ? 2.08 : van ? 2.45 : coupe ? 2.28 : 2.35;
  box(bodyW * 0.92, 0.14, pick ? 1.1 : 1.35, paint, 0, bodyH + 0.115, zNose - 0.55, 0.08, 0, 0); /* hood sits clear of the body top (no z-fight shimmer) */
  box(bodyW * 0.88, cabinH, cabinL, glass, 0, bodyH + cabinH * 0.55 + 0.1, cabinZ);
  box(bodyW * 0.82, 0.07, cabinL * 0.88, paint, 0, roofY + cabinH * 0.35, cabinZ + (coupe ? 0.08 : 0));
  if (pick) box(bodyW * 0.96, 0.52, 1.95, paint, 0, 0.78, -1.42);
  if (van) box(bodyW * 0.9, cabinH * 0.85, 1.1, tint, 0, bodyH + cabinH * 0.5, -1.85);
  for (const sd of [-1, 1]) {
    box(0.08, cabinH * 0.95, 0.12, black, sd * bodyW * 0.42, bodyH + cabinH * 0.5 + 0.1, cabinZ + cabinL * 0.42);
    if (detail && !coupe) box(0.08, cabinH * 0.85, 0.12, black, sd * bodyW * 0.42, bodyH + cabinH * 0.48 + 0.1, cabinZ - cabinL * 0.4);
  }
  box(bodyW * 0.78, cabinH * 0.85, 0.06, glass, 0, bodyH + cabinH * 0.55 + 0.12, cabinZ + cabinL * 0.48, -0.35, 0, 0);
  box(bodyW * 0.72, cabinH * 0.7, 0.05, tint, 0, bodyH + cabinH * 0.5 + 0.1, cabinZ - cabinL * 0.48, 0.28, 0, 0);
  if (detail) {
    for (const sd of [-1, 1]) {
      box(0.04, cabinH * 0.55, cabinL * 0.38, tint, sd * bodyW * 0.45, bodyH + cabinH * 0.55 + 0.12, cabinZ + cabinL * 0.12);
    }
  }
  box(bodyW * 0.7, 0.28, 0.08, black, 0, 0.55, zNose);
  box(bodyW * 1.02, 0.18, 0.22, darkPaint, 0, 0.28, zNose + 0.05);
  const zTail = pick ? -2.38 : van ? -2.55 : -2.35;
  box(bodyW * 1.02, 0.16, 0.2, darkPaint, 0, 0.3, zTail);
  if (detail) {
    for (const sd of [-1, 1]) {
      box(0.22, 0.1, 0.14, paint, sd * (bodyW * 0.52 + 0.08), bodyH + 0.45, cabinZ + cabinL * 0.35);
    }
  }
  /* Cabin interior — player only (escorts skip for draw-call cost) */
  if (detail) {
    const cabin = new THREE.Group(); cabin.name = 'cabin'; g.add(cabin);
    const cbox = (w, h, l, m, x, y, z) => {
      const me = new THREE.Mesh(new THREE.BoxGeometry(w, h, l), m);
      me.position.set(x, y, z); cabin.add(me); return me;
    };
    cbox(bodyW * 0.78, 0.04, cabinL * 0.85, plastic, 0, 0.42, cabinZ);
    for (const sx of [-0.38, 0.38]) {
      cbox(0.42, 0.14, 0.48, leather, sx, 0.58, cabinZ + 0.15);
      cbox(0.42, 0.52, 0.12, leather, sx, 0.88, cabinZ - 0.05);
    }
    if (!coupe && !pick) {
      cbox(bodyW * 0.7, 0.14, 0.42, leather, 0, 0.58, cabinZ - cabinL * 0.28);
      cbox(bodyW * 0.7, 0.45, 0.1, leather, 0, 0.82, cabinZ - cabinL * 0.38);
    }
    cbox(bodyW * 0.82, 0.28, 0.35, dashM, 0, 0.95, cabinZ + cabinL * 0.38);
    cbox(0.28, 0.22, 0.45, plastic, 0, 0.78, cabinZ + 0.2);
    const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.028, 6, 12), black);
    wheel.position.set(0.38, 1.05, cabinZ + cabinL * 0.28); wheel.rotation.x = Math.PI / 2.4; cabin.add(wheel);
    g.userData.cabin = cabin;
  }
  const wr = suv || van ? 0.4 : 0.35;
  const zFront = pick ? 1.35 : coupe ? 1.38 : 1.45;
  const zRear = pick ? -1.55 : coupe ? -1.32 : -1.4;
  const wheelSeg = detail ? 12 : 8;
  for (const [x, z] of [[-bodyW * 0.46, zFront], [bodyW * 0.46, zFront], [-bodyW * 0.46, zRear], [bodyW * 0.46, zRear]]) {
    const tire = new THREE.Mesh(new THREE.CylinderGeometry(wr, wr, 0.26, wheelSeg), tyre);
    tire.rotation.z = Math.PI / 2; tire.position.set(x, wr, z); g.add(tire);
    if (detail) {
      const rim = new THREE.Mesh(new THREE.CylinderGeometry(wr * 0.62, wr * 0.62, 0.14, 8), chrome);
      rim.rotation.z = Math.PI / 2; rim.position.set(x, wr, z); g.add(rim);
    }
  }
  const head = new THREE.MeshBasicMaterial({ color: 0xfff2c8, transparent: true, opacity: 1 });
  const tail = new THREE.MeshBasicMaterial({ color: 0xd0141c, transparent: true, opacity: 1 });
  const headX = [-0.62, 0.62];
  for (const x of headX) {
    box(0.42, 0.16, 0.06, head, x, 0.72, zNose);
    box(0.44, 0.14, 0.05, tail, x, 0.78, zTail);
  }
  /*
   * Player headlights: glowing lenses + soft road pools + SpotLights.
   * No air-cone “rays” — those read as fake geometry.
   */
  const mkTex = (w, h, draw) => {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    draw(c.getContext('2d'), w, h);
    const t = new THREE.CanvasTexture(c); t.needsUpdate = true; return t;
  };
  /* Soft LED-style ground beams (white, elongated) — no air cones */
  const poolTex = mkTex(64, 256, (x, w, h) => {
    x.clearRect(0, 0, w, h);
    for (let i = 0; i < 72; i++) {
      const t = i / 71;
      const y = 10 + t * 236;
      const halfW = 4 + t * t * 22;
      const halfH = 3.5 + t * 14;
      const a = Math.pow(1 - t, 1.35) * 0.88;
      const g = x.createRadialGradient(32, y, 0.5, 32, y, halfW);
      g.addColorStop(0, `rgba(255,255,255,${a})`);
      g.addColorStop(0.35, `rgba(255,255,255,${a * 0.38})`);
      g.addColorStop(0.72, `rgba(255,255,255,${a * 0.1})`);
      g.addColorStop(1, 'rgba(255,255,255,0)');
      x.fillStyle = g;
      x.beginPath(); x.ellipse(32, y, halfW, halfH, 0, 0, Math.PI * 2); x.fill();
    }
  });
  const lensTex = mkTex(64, 64, (x, w, h) => {
    const g = x.createRadialGradient(32, 32, 1, 32, 32, 30);
    g.addColorStop(0, 'rgba(255,252,240,1)');
    g.addColorStop(0.25, 'rgba(255,240,200,0.75)');
    g.addColorStop(0.55, 'rgba(255,220,160,0.25)');
    g.addColorStop(1, 'rgba(255,200,140,0)');
    x.fillStyle = g; x.fillRect(0, 0, w, h);
  });
  const poolMats = [], lensMats = [], spots = [];
  if (detail) {
    const beamLen = 18;
    for (const x of headX) {
      const lensMat = new THREE.MeshBasicMaterial({
        map: lensTex, transparent: true, opacity: 0, depthWrite: false,
        blending: THREE.AdditiveBlending, fog: false, side: THREE.DoubleSide,
      });
      const lens = new THREE.Mesh(new THREE.PlaneGeometry(0.85, 0.55), lensMat);
      lens.position.set(x, 0.72, zNose + 0.08);
      lens.renderOrder = 6;
      g.add(lens);
      lensMats.push(lensMat);

      const poolMat = new THREE.MeshBasicMaterial({
        map: poolTex, color: 0xeef4ff, transparent: true, opacity: 0,
        depthWrite: false, blending: THREE.AdditiveBlending, fog: false,
        side: THREE.DoubleSide,
      });
      const pool = new THREE.Mesh(new THREE.PlaneGeometry(3.4, beamLen), poolMat);
      pool.rotation.x = -Math.PI / 2;
      pool.position.set(x * 0.85, 0.08, zNose + beamLen * 0.42);
      pool.renderOrder = 4;
      pool.userData.lit = true; g.add(pool);
      poolMats.push(poolMat);

      /* SpotLights are expensive on Windows — lenses + road pools are enough */
      if (!_isWin) {
        const spot = new THREE.SpotLight(0xeef4ff, 0, 42, Math.PI / 7.5, 0.58, 1.25);
        spot.position.set(x, 0.78, zNose + 0.05);
        spot.target.position.set(x * 1.2, -0.35, zNose + 24);
        spot.castShadow = false;
        spot.userData.lit = spot.target.userData.lit = true;
        g.add(spot);
        g.add(spot.target);
        spots.push(spot);
      }
    }
  }
  g.userData.paint = paint;
  g.userData.carLights = {
    head, tail,
    pools: poolMats, lenses: lensMats, spots,
    pool: poolMats[0] || null,
  };
  return g;
}

export function createTour({ scene, camera, cam, camGoal, geoToWorld, getTraffic, getRoads, airports, makePlane, makeJet, makeHeli, makeMil, stopFollow, isFollowing, $, getUserGeo = () => null }) {
  const prefs = loadPrefs();
  const audio = createTourAudio();
  const music = createTourMusic();
  const S = { mode: null, kind: 'car', view: 'chase', speedX: 1, obj: null, p: new THREE.Vector3(), hd: 0, v: 0, pitch: 0, roll: 0,
    route: null, s: 0, dest: null, phase: '', keys: {}, info: '', roadName: '', hudT: 0, orbitR: 900, runways: null, cruise: 0, odo: 0, yawRate: 0, th0: 0, ph0: 1, limit: 0, sm: null,
    carColor: prefs.carColor, carStyle: prefs.carStyle, planeColor: prefs.planeColor, planeAccent: prefs.planeAccent, planeStyle: prefs.planeStyle, jetModel: prefs.jetModel, acClass: 'prop',
    soundOn: prefs.soundOn !== false, soundVol: Number.isFinite(prefs.soundVol) ? prefs.soundVol : 0.45,
    radioOn: prefs.radioOn !== false, musicOn: !!prefs.musicOn };
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
  fetch('/data/houston/airports.json').then((r) => r.json()).then((d) => {
    S.runways = d.runways || []; S.aeros = d.aerodromes || [];
    /* every OSM aerodrome in the metro that has a real paved/grass runway inside its outline (no heliports/gliderports) */
    S.apts = [];
    for (const a of S.aeros) {
      if (!a.r || a.r.length < 6 || /heliport|gliderport/i.test(a.n || '')) continue;
      const rws = S.runways.filter((r) => r.w >= 15 && inPoly(a.r, ...rwMid(r)));
      if (!rws.length) continue;
      let x = 0, z = 0; const k = a.r.length / 2;
      for (let i = 0; i < a.r.length; i += 2) { x += a.r[i]; z += a.r[i + 1]; }
      S.apts.push({ code: a.iata || a.icao || (a.n || 'APT').replace(/\s+(Municipal |Regional |Memorial |International )?(Airport|Airpark|Field).*$/i, '').slice(0, 14), n: a.n, x: x / k, z: z / k, r: a.r, rws });
    }
    const big = ['IAH', 'HOU', 'EFD', 'SGR', 'DWH', 'IWS'];
    S.apts.sort((p, q) => ((big.indexOf(p.code) + 1 || 99) - (big.indexOf(q.code) + 1 || 99)) || p.n.localeCompare(q.n));
    fillApts();
  }).catch(() => { S.runways = []; });
  function inPoly(f, x, z) { let c = false; for (let i = 0, j = f.length - 2; i < f.length; j = i, i += 2) { const xi = f[i], zi = f[i + 1], xj = f[j], zj = f[j + 1]; if ((zi > z) !== (zj > z) && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) c = !c; } return c; }
  function rwMid(r) { const n = r.p.length; return [(r.p[0] + r.p[n - 2]) / 2, (r.p[1] + r.p[n - 1]) / 2]; }
  function aptList() { return S.apts && S.apts.length ? S.apts : (airports() || []); }
  function aptName(code) { const a = aptList().find((q) => q.code === code); return a && a.n ? a.n.replace(/ - Houston$/, '') + ' (' + code + ')' : code; }
  function fillApts() {
    const opts = aptList().map((a) => '<option value="' + a.code + '">' + (a.n ? a.n.replace(/ - Houston$/, '') + ' · ' + a.code : a.code) + '</option>').join('');
    const d = $('tourDep'), l = $('tourArr');
    if (d) { const k = d.value; d.innerHTML = '<option value="">Nearest to me</option>' + opts; d.value = k; }
    if (l) { const k = l.value; l.innerHTML = '<option value="">Nearest to destination</option><option value="=dep">Back to departure airport</option>' + opts; l.value = k; }
  }

  /* ---------- UI ---------- */
  function fillDest() {
    const sel = $('tourDest'); if (!sel) return;
    const keep = sel.value;
    const groups = {};
    dests.forEach((d) => { (groups[d.g] || (groups[d.g] = [])).push(d); });
    sel.innerHTML = '<option value="">— pick a place to tour —</option>' + Object.entries(groups).map(([g, l]) => '<optgroup label="' + g + '">'
      + l.slice().sort((a, b) => a.n.localeCompare(b.n)).map((d) => '<option value="' + d.id + '">' + d.n + '</option>').join('') + '</optgroup>').join('');
    if (keep && dests.some((d) => d.id === keep)) sel.value = keep;
    attachPlaceSearch(sel, { placeholder: 'Search tour places…', ariaLabel: 'Search tour destinations' });
  }
  function findDest(id) { return dests.find((d) => d.id === id) || null; }
  const vehBtns = document.querySelectorAll('#tourVeh .btn');
  vehBtns.forEach((b) => b.addEventListener('click', () => {
    S.kind = b.getAttribute('data-veh'); vehBtns.forEach((x) => x.classList.toggle('on', x === b));
    const ar = $('tourAptRow'); if (ar) ar.style.display = S.kind === 'plane' ? '' : 'none';
    const dr = $('tourDriveRow'); if (dr) dr.style.display = S.kind === 'car' ? '' : 'none';
    const fb = $('tourFree'); if (fb) fb.textContent = S.kind === 'car' ? 'Free drive' : 'Free flight';
  }));
  function acName() { const id = S.planeStyle === 'jet' ? S.jetModel : S.planeStyle; const a = AIRCRAFT.find((q) => q[0] === id); return a ? a[1] : 'Plane'; }
  function acRows() {
    const v = ($('tourAc') || {}).value || '', heli = v === 'heli';
    const rw = $('tourRwRow'); if (rw) rw.style.display = heli ? 'none' : '';
    const a = AIRCRAFT.find((q) => q[0] === v);
    const hn = $('tourAcNote');
    if (hn) hn.textContent = !a ? 'Choose an aircraft — it decides where you take off.'
      : heli ? 'Lifts straight up from your location and lands at the destination — no runway.'
        : 'Takes off from an airport runway' + (RWY_NEED[v] >= 2600 ? ' long enough for the ' + a[1] : '') + ', then lands at an airport.';
  }
  { const sel = $('tourAc');
    if (sel) {
      const grp = { Airliners: AIRCRAFT.filter((a) => a[2] === 'jet'), 'Other aircraft': AIRCRAFT.filter((a) => a[2] !== 'jet') };
      sel.innerHTML = '<option value="">— choose your aircraft —</option>' + Object.entries(grp).map(([g, l]) => '<optgroup label="' + g + '">' + l.map((a) => '<option value="' + a[0] + '">' + a[1] + '</option>').join('') + '</optgroup>').join('');
      sel.addEventListener('change', acRows);
    }
    acRows(); }
  /* planes: the aircraft must be chosen before every flight (it decides runway vs. lift-off spot) */
  function chooseAircraft() {
    const v = ($('tourAc') || {}).value || '', a = AIRCRAFT.find((q) => q[0] === v);
    if (!a) { note('Choose your aircraft first — Boeing, Airbus, Cessna, C-130, F-16 or helicopter.'); const sl = $('tourAc'); if (sl) sl.focus(); return false; }
    S.planeStyle = a[2]; if (a[2] === 'jet') S.jetModel = a[0];
    persistVeh(); return true;
  }
  function beginTour(dest, opts) {
    if (!dest) { note('Pick a place first — or tap Surprise me.'); return; }
    const kind = (document.querySelector('#tourVeh .btn.on') || {}).getAttribute?.('data-veh') || S.kind || 'car';
    if (kind === 'plane' && !chooseAircraft()) return;
    S.kind = kind;
    start(kind, 'tour', dest, opts || {});
  }
  const goBtn = $('tourGo'); if (goBtn) goBtn.addEventListener('click', () => {
    const carNow = ((document.querySelector('#tourVeh .btn.on') || {}).getAttribute?.('data-veh') || S.kind || 'car') === 'car';
    const wp = carNow ? window.HTS_DRIVE_PENDING : window.HTS_WORLD_PENDING;
    if (carNow && ($('tourDrive') || {}).value && !(wp && wp.dest)) { note('Loading the highway route…'); return; }
    if (wp && wp.dest) { beginTour(wp.dest, wp.opts); return; } /* another city: the same tour, all the way there on the flat map */
    const v = $('tourDest') && $('tourDest').value;
    if (v === '' || v == null) { note('Pick a place first — or tap Surprise me.'); return; }
    const dest = findDest(v);
    if (!dest) { note('That place list refreshed — pick it again, then Start tour.'); return; }
    beginTour(dest);
  });
  const surpriseBtn = $('tourSurprise');
  if (surpriseBtn) surpriseBtn.addEventListener('click', () => {
    if (!dests.length) { note('Places still loading — try again in a second.'); return; }
    const pick = dests[Math.floor(Math.random() * dests.length)];
    const sel = $('tourDest'); if (sel) sel.value = pick.id;
    beginTour(pick);
  });
  const freeBtn = $('tourFree'); if (freeBtn) freeBtn.addEventListener('click', () => {
    const kind = (document.querySelector('#tourVeh .btn.on') || {}).getAttribute?.('data-veh') || S.kind || 'car';
    if (kind === 'plane' && !chooseAircraft()) return;
    S.kind = kind;
    start(kind, 'free', null);
  });
  function note(t) { const n = $('tourNote'); if (n) n.textContent = t; }
  function destBlurb(d) {
    if (!d) return '';
    if (S.icDrive && d === S.dest && S.route && S.route[0].rr) return Math.round(S.route[0].rr / 1609.344) + ' mi on real highways · ×2 ×4 ×10 to speed it up.';
    return DEST_BLURB[d.n] || ('Houston highlight — enjoy the ride to ' + d.n + '.');
  }

  const css = document.createElement('style');
  css.textContent = '#tourHud{position:fixed;left:50%;bottom:18px;transform:translateX(-50%);z-index:40;background:linear-gradient(165deg,rgba(28,23,18,.94),rgba(14,12,10,.96));border:1px solid rgba(232,168,56,.28);border-radius:14px;padding:12px 14px;color:#f3ebe0;font:12px/1.35 Overpass,system-ui,sans-serif;min-width:300px;max-width:min(440px,94vw);box-shadow:0 12px 36px rgba(0,0,0,.5),inset 0 1px 0 rgba(255,220,160,.08);display:none;touch-action:none}'
    + '#tourHud.on{display:block}#tourHud.on.hid{display:none}#tourHud.dragged{left:0;bottom:auto;transform:none}'
    + '#tourHud .tt{font-weight:700;font-size:13px;margin-bottom:6px;display:flex;justify-content:space-between;gap:12px;align-items:center;cursor:grab;user-select:none;color:#fff6ea}'
    + '#tourHud .tt:active{cursor:grabbing}#tourHud .tt .drag{color:#8a7e70;font-size:11px;font-weight:600;letter-spacing:.04em;margin-right:6px}'
    + '#tourHud .tt .acts{display:flex;gap:6px;align-items:center;flex-shrink:0}'
    + '#tourHud .tm{display:flex;gap:14px;font-family:"Overpass Mono",monospace;font-size:12px;color:#e8c49a;margin-bottom:6px;flex-wrap:wrap}'
    + '#tourHud .tm b{font-size:17px;color:#fff6ea}#tourHud .row{display:flex;gap:6px;flex-wrap:wrap;margin-top:4px;align-items:center}'
    + '#tourHud button{background:rgba(255,236,210,.08);border:1px solid rgba(255,236,210,.16);color:#f3ebe0;border-radius:8px;padding:6px 10px;font-size:11px;font-weight:700;cursor:pointer}'
    + '#tourHud button.on{background:linear-gradient(135deg,#e8a838,#c96a28);border-color:transparent;color:#1a1008}#tourHud .x{background:#5a1d22;border-color:#a8323c;color:#f3ebe0}'
    + '#tourHud .hide{background:rgba(255,236,210,.06);border-color:rgba(232,168,56,.35)}'
    + '#tourHud .snd{display:flex;align-items:center;gap:6px;margin-left:4px;color:#8a96a3;font-weight:600}'
    + '#tourHud .snd input[type=range]{width:72px;accent-color:#e8a838;cursor:pointer}'
    + '#tourHud button.mute.on{background:rgba(90,29,34,.55);border-color:#a8323c}'
    + '#tourHud .tbar{margin:6px 0 2px;height:8px;background:rgba(20,12,8,.65);border-radius:6px;overflow:visible;position:relative;border:1px solid rgba(232,168,56,.2)}'
    + '#tourHud .tbar i{display:block;height:100%;width:0;background:linear-gradient(90deg,#c96a28,#e8a838);border-radius:5px}'
    + '#tourHud .tbar .tplane{position:absolute;top:50%;transform:translate(-50%,-50%);font-size:12px;line-height:1;pointer-events:none;filter:drop-shadow(0 1px 2px #000)}'
    + '#tourHud .sw{width:18px;height:18px;border-radius:50%;border:2px solid rgba(255,236,210,.25);padding:0;cursor:pointer}'
    + '#tourHud .sw.on{border-color:#fff6ea;box-shadow:0 0 0 1px #e8a838}'
    + '#tourHud .sw.none{background:linear-gradient(135deg,transparent 44%,#e03a2f 44%,#e03a2f 56%,transparent 56%),#2a2f36}'
    + '#tourHudPeek{position:fixed;left:50%;bottom:18px;transform:translateX(-50%);z-index:40;display:none;align-items:center;gap:8px;padding:8px 14px;border-radius:999px;background:linear-gradient(165deg,rgba(28,23,18,.94),rgba(14,12,10,.96));border:1px solid rgba(232,168,56,.35);color:#fff6ea;font:12px/1 Overpass,system-ui,sans-serif;font-weight:700;cursor:pointer;box-shadow:0 8px 24px rgba(0,0,0,.45)}'
    + '#tourHudPeek.on{display:flex}#tourHudPeek:hover{border-color:rgba(232,168,56,.6)}'
    + '#tourPad{position:fixed;right:18px;bottom:18px;z-index:40;display:none;grid-template-columns:repeat(3,52px);gap:6px}#tourPad.on{display:grid}'
    + '#tourPad button{height:52px;border-radius:12px;background:rgba(28,23,18,.9);border:1px solid rgba(232,168,56,.28);color:#fff6ea;font-size:18px;touch-action:none}'
    + '#tourDash{position:fixed;left:0;right:0;bottom:0;height:max(min(38vw,52vh),min(30vh,260px));z-index:35;pointer-events:none;display:none}#tourDash.on{display:block}'
    + '#tourDash .dashSvg{position:absolute;inset:0;width:100%;height:100%;display:block}'
    + '#tourDash .jetGlass{position:fixed;left:0;top:0;width:100vw;height:100vh;pointer-events:none;z-index:-1}'
    /* night: backlit nav screen and red button LEDs (class toggled in updateLights) */
    + '#tourDash .dashSvg .led{fill:#6a1c1c}#tourDash.night .dashSvg .led{fill:#ff3b3b;filter:drop-shadow(0 0 3px #ff3030)}'
    + '#tourDash.night .dashSvg .gl{fill:#0f2c48;filter:drop-shadow(0 0 9px rgba(80,180,255,.8))}'
    + '#tourDash.night .dashSvg text{fill-opacity:1}#tourDash.night .dashSvg .dLeft circle:first-child{filter:drop-shadow(0 0 5px rgba(255,140,70,.45))}'
    + '#tourDash .carGlass{position:fixed;left:0;top:0;width:100vw;height:100vh;pointer-events:none;z-index:-1;display:none}#tourDash.carOn .carGlass{display:block}'
    + '#tourDash.jetCockpit{height:max(min(27vw,34vh),min(22vh,190px))}'
    /* CarPlay — drag eyebrow + explicit resize grip (CSS resize is unreliable on fixed) */
    + '#tourDash .carplay{position:absolute;left:auto;right:1.5%;top:11%;bottom:auto;width:min(22vw,240px);height:min(18vh,140px);z-index:4;pointer-events:auto;'
    + 'display:none;flex-direction:column;justify-content:center;gap:3px;padding:10px 12px 18px;border-radius:14px;background:linear-gradient(165deg,#0e1620,#0a1018);'
    + 'border:1px solid rgba(120,160,200,.55);box-shadow:0 8px 22px rgba(0,0,0,.45);font:11px/1.25 Overpass,system-ui,sans-serif;color:#e8f0f8;'
    + 'overflow:hidden;min-width:160px;min-height:96px;max-width:min(480px,78vw);max-height:min(280px,40vh);box-sizing:border-box}'
    + '#tourDash.carOn .carplay{display:flex}'
    + '#tourDash .carplay.placed{position:fixed;left:0;right:auto;top:0;bottom:auto;transform:none;z-index:37}'
    + '#tourDash .carplay .cpEyebrow{font-size:9px;font-weight:700;letter-spacing:.08em;color:#7a92a8;text-transform:uppercase;cursor:grab;user-select:none;touch-action:none;display:flex;justify-content:space-between;gap:6px}'
    + '#tourDash .carplay .cpEyebrow:active{cursor:grabbing}'
    + '#tourDash .carplay .cpReset{appearance:none;background:transparent;border:0;padding:0;margin:0;color:#8ab0c8;font:700 9px Overpass,system-ui,sans-serif;'
    + 'cursor:pointer;letter-spacing:0;text-transform:none}'
    + '#tourDash .carplay .cpReset:hover{color:#fff}'
    + '#tourDash .carplay .cpStreet{font-size:clamp(16px,2.2vw,24px);font-weight:800;color:#fff;letter-spacing:.01em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-family:"Overpass Mono",monospace}'
    + '#tourDash .carplay .cpSub{font-size:11px;color:#b8cce0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}'
    + '#tourDash .carplay .cpRow{display:flex;justify-content:space-between;gap:8px;margin-top:2px;font-size:11px;font-weight:700;color:#e0eefc}'
    + '#tourDash .carplay .cpRow span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}'
    + '#tourDash .carplay .cpResize{position:absolute;right:2px;bottom:2px;width:18px;height:18px;cursor:nwse-resize;touch-action:none;'
    + 'background:linear-gradient(135deg,transparent 50%,rgba(140,180,220,.55) 50%);border-radius:0 0 10px 0;z-index:6}'
    + '#tourDash .carplay .cpResize:hover{background:linear-gradient(135deg,transparent 45%,rgba(180,210,240,.85) 45%)}'
    /* Legacy slot marker (player mounts on #tourDash itself, left of RPM) */
    + '#tourDash .dashMusic{display:none!important}'
  document.head.appendChild(css);
  const hud = document.createElement('div'); hud.id = 'tourHud'; document.body.appendChild(hud);
  const hudPeek = document.createElement('button');
  hudPeek.id = 'tourHudPeek'; hudPeek.type = 'button'; hudPeek.title = 'Show tour panel (H)';
  hudPeek.textContent = 'Show tour panel';
  document.body.appendChild(hudPeek);
  const dash = document.createElement('div'); dash.id = 'tourDash'; document.body.appendChild(dash);
  function setHudHidden(hid) {
    S.hudHid = !!hid;
    hud.classList.toggle('hid', S.hudHid);
    hudPeek.classList.toggle('on', !!(S.mode && S.hudHid));
    if (!S.hudHid) applyHudPos();
  }
  hudPeek.addEventListener('click', () => setHudHidden(false));
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
  /* each body style gets its own cluster: sedan twin dials, SUV/van digital screens, pickup rugged dials + aux gauges, coupe sport tach */
  const CAR_THEMES = {
    sedan: { ring: '#4a5560', face: '#06080a', nd: '#ff4b2b', rp: '#f5b942', acc: '#c8a070', badge: 'HTS', lay: 'twin' },
    suv: { ring: '#2f6f9f', face: '#040a12', nd: '#46b4ff', rp: '#46b4ff', acc: '#7fc8ff', badge: 'SUV', lay: 'digital' },
    pickup: { ring: '#aab2ba', face: '#0b0a08', nd: '#ffb020', rp: '#ffb020', acc: '#e8c43a', badge: '4X4', lay: 'twin', extra: 1 },
    coupe: { ring: '#b3202a', face: '#050505', nd: '#ff2a2a', rp: '#ff2a2a', acc: '#ff5a3a', badge: 'GT', lay: 'sport' },
    van: { ring: '#56606a', face: '#0a0c0e', nd: '#ffffff', rp: '#31d06a', acc: '#9aa3ab', badge: 'VAN', lay: 'digital' },
  };
  const ndl = (id, cx, cy, r, max, col, w) => '<line id="' + id + '" data-c="' + cx + ',' + cy + ',' + r + ',' + max + '" x1="' + cx + '" y1="' + cy + '" x2="' + cx + '" y2="' + (cy - r) + '" stroke="' + col + '" stroke-width="' + w + '" stroke-linecap="round"/>';
  const arcP = (cx, cy, r, f0, f1) => { const A = (f) => (135 + f * 270) * Math.PI / 180, p0 = [cx + Math.cos(A(f0)) * r, cy + Math.sin(A(f0)) * r], p1 = [cx + Math.cos(A(f1)) * r, cy + Math.sin(A(f1)) * r]; return 'M' + p0[0].toFixed(1) + ',' + p0[1].toFixed(1) + ' A' + r + ',' + r + ' 0 ' + ((f1 - f0) * 270 > 180 ? 1 : 0) + ' 1 ' + p1[0].toFixed(1) + ',' + p1[1].toFixed(1); };
  function carDashSvg(style) {
    const t = CAR_THEMES[style] || CAR_THEMES.sedan;
    /* "meet" so nothing is ever cropped (wide laptops lost the gauge tops and the speed-limit sign); the dash
       surface is drawn past x 0..1000 so side margins on wide screens still show dash */
    let hood = '#4a525c'; try { hood = '#' + (S.carColor >>> 0).toString(16).padStart(6, '0'); } catch (e) { /* tour state not ready */ }
    let g = '<svg class="dashSvg" viewBox="0 60 1000 380" preserveAspectRatio="xMidYMax meet">'
      + '<defs><linearGradient id="dashTop" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a1e24"/><stop offset="1" stop-color="#0c0e12"/></linearGradient>'
      + '<linearGradient id="hoodSh" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".12"/><stop offset="1" stop-color="#000" stop-opacity=".55"/></linearGradient><linearGradient id="leather" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2c2620"/><stop offset="1" stop-color="#1a1612"/></linearGradient></defs>'
      + '<path d="M40,124 Q500,10 960,124 Z" fill="' + hood + '"/><path d="M40,124 Q500,10 960,124 Z" fill="url(#hoodSh)"/><path d="M150,112 Q500,30 850,112" fill="none" stroke="#fff" stroke-opacity=".18" stroke-width="3"/><path d="M-900,0 L120,96 L92,440 H-900 Z" fill="#12151a"/><path d="M1900,0 L930,100 L948,440 H1900 Z" fill="#12151a"/>'
      + '<path d="M95,95 Q500,48 905,95" fill="none" stroke="#2a3138" stroke-width="10"/>'
      + '<path d="M-900,150 L0,118 Q500,60 1000,118 L1900,150 L1900,440 L-900,440 Z" fill="url(#dashTop)"/>'
      + '<path d="M80,126 Q500,78 920,126" fill="none" stroke="' + t.ring + '" stroke-opacity=".55" stroke-width="2"/>'
      + '<rect x="40" y="140" width="100" height="12" rx="3" fill="#15191e" stroke="#2a3138"/><rect x="730" y="140" width="100" height="12" rx="3" fill="#15191e" stroke="#2a3138"/>';
    if (t.lay === 'digital') {
      g += '<g transform="translate(-10,17.4) scale(.72)">' + '<g class="dLeft"><rect x="148" y="184" width="204" height="120" rx="16" fill="' + t.face + '" stroke="' + t.ring + '" stroke-width="3"/>'
        + '<text x="250" y="208" fill="' + t.acc + '" font-size="11" font-weight="700" text-anchor="middle" letter-spacing="2">RPM ×1000</text>'
        + '<text id="dRpmTxt" x="250" y="244" fill="#fff" font-size="30" font-weight="700" text-anchor="middle" font-family="Overpass Mono,monospace">0.8</text>'
        + '<rect x="170" y="262" width="160" height="14" rx="7" fill="#1a222c"/><rect id="dRpmBar" x="170" y="262" width="0" height="14" rx="7" fill="' + t.rp + '"/>'
        + '<text x="250" y="294" fill="#7a8a9a" font-size="10" text-anchor="middle">ECO · ' + t.badge + '</text></g>'
        + '</g>' + '<g transform="translate(-207.2,17.4) scale(.72)">'
        + '<rect x="652" y="174" width="208" height="134" rx="18" fill="' + t.face + '" stroke="' + t.ring + '" stroke-width="3"/>'
        + '<path id="dSpdArc" d="' + arcP(760, 250, 58, 0, 1) + '" fill="none" stroke="#1a222c" stroke-width="7" stroke-linecap="round"/>'
        + '<text x="760" y="206" fill="' + t.acc + '" font-size="11" font-weight="700" text-anchor="middle" letter-spacing="2">DRIVE</text>'
        + '<text id="dSpd" x="760" y="266" fill="#fff" font-size="50" font-weight="800" text-anchor="middle" font-family="Overpass Mono,monospace">0</text>'
        + '<text x="760" y="292" fill="#8a96a3" font-size="11" text-anchor="middle">MPH</text>' + '</g>';
    } else if (t.lay === 'sport') {
      g += '<g transform="translate(-10,17.4) scale(.72)">' + '<g class="dLeft"><circle cx="250" cy="250" r="66" fill="' + t.face + '" stroke="#3a3f46" stroke-width="4"/>' + ticks(250, 250, 60, 160, 10, 135, 405, (v) => (v % 40 ? '' : v))
        + ndl('dNeedle', 250, 250, 52, 160, '#f2f2f2', 3) + '<circle cx="250" cy="250" r="6" fill="#f2f2f2"/>'
        + '<text x="250" y="304" fill="#8a96a3" font-size="10" text-anchor="middle">MPH</text></g>'
        + '</g>' + '<g transform="translate(-207.2,17.4) scale(.72)">'
        + '<circle cx="760" cy="244" r="88" fill="' + t.face + '" stroke="' + t.ring + '" stroke-width="5"/>'
        + '<path d="' + arcP(760, 244, 80, 6.5 / 8, 1) + '" fill="none" stroke="#e03a2f" stroke-width="7"/>' + ticks(760, 244, 82, 8, 1, 135, 405, (v) => v)
        + ndl('dRpm', 760, 244, 74, 8, t.nd, 4) + '<circle cx="760" cy="244" r="9" fill="' + t.nd + '"/>'
        + '<text id="dSpd" x="760" y="296" fill="#fff" font-size="28" font-weight="800" text-anchor="middle" font-family="Overpass Mono,monospace">0</text>'
        + '<text x="760" y="314" fill="#8a96a3" font-size="9" text-anchor="middle">MPH · RPM ×1000</text>' + '</g>';
    } else {
      g += '<g transform="translate(-10,17.4) scale(.72)">' + '<g class="dLeft"><circle cx="250" cy="248" r="70" fill="' + t.face + '" stroke="' + t.ring + '" stroke-width="4"/>' + ticks(250, 248, 64, 8, 1, 135, 405, (v) => v)
        + ndl('dRpm', 250, 248, 52, 8, t.rp, 3.5)
        + '<text x="250" y="308" fill="#8a96a3" font-size="10" text-anchor="middle">RPM ×1000</text></g>'
        + '</g>' + '<g transform="translate(-207.2,17.4) scale(.72)">'
        + '<circle cx="760" cy="248" r="80" fill="' + t.face + '" stroke="' + t.ring + '" stroke-width="4"/>' + ticks(760, 248, 74, 140, 10, 135, 405, (v) => v)
        + ndl('dNeedle', 760, 248, 64, 140, t.nd, 4) + '<circle cx="760" cy="248" r="8" fill="' + t.nd + '"/>'
        + '<text id="dSpd" x="760" y="300" fill="#fff" font-size="24" font-weight="700" text-anchor="middle" font-family="Overpass Mono,monospace">0</text>'
        + '<text x="760" y="318" fill="#8a96a3" font-size="10" text-anchor="middle">MPH</text>' + '</g>';
      if (t.extra) {
        for (const [cy, lab, f] of [[172, 'FUEL', 0.72], [222, 'TEMP', 0.48]]) {
          const A = (135 + f * 270) * Math.PI / 180;
          /* fuel/temp sit between the tach and the wheel rim so the left of the dash stays free for the music player */
          g += '<g class="dLeft"><circle cx="92" cy="' + cy + '" r="22" fill="' + t.face + '" stroke="' + t.ring + '" stroke-width="3"/>'
            + '<line x1="92" y1="' + cy + '" x2="' + (92 + Math.cos(A) * 15).toFixed(1) + '" y2="' + (cy + Math.sin(A) * 15).toFixed(1) + '" stroke="' + t.nd + '" stroke-width="2.5" stroke-linecap="round"/>'
            + '<text x="92" y="' + (cy + 15) + '" fill="#9aa3ab" font-size="8" text-anchor="middle">' + lab + '</text></g>';
        }
        g += '<rect x="530" y="132" width="40" height="18" rx="4" fill="#1d1a10" stroke="#e8c43a"/><text x="550" y="145" fill="#e8c43a" font-size="10" font-weight="800" text-anchor="middle">4WD</text>';
      }
    }
    /* instrument-cluster hood over the gauges (behind the wheel, driver side) and the centre stack to its right */
    g = g.replace('<g class="dLeft">', '<path d="M66,138 Q255,96 444,138 L444,150 Q255,112 66,150 Z" fill="#090b0e"/><g class="dLeft">');
    const vent = (cx, cy, r) => '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="#0a0c0f" stroke="#2f353d" stroke-width="3"/>'
      + [-0.5, -0.17, 0.17, 0.5].map((k) => '<line x1="' + (cx - r * 0.78) + '" x2="' + (cx + r * 0.78) + '" y1="' + (cy + k * r) + '" y2="' + (cy + k * r) + '" stroke="#262b32" stroke-width="2.4"/>').join('');
    /* passenger side: recessed panel the media player docks into (tour-music placeDashOverlay), round vents like a real dash */
    g += '<path d="M836,146 Q920,138 1000,150 L1000,300 L836,300 Z" fill="#0f1216"/>'
      + '<rect id="dMediaSlot" x="842" y="152" width="150" height="144" rx="10" fill="#0a0c0f" stroke="#232830" stroke-width="2"/>'
      + vent(500, 200, 20) + vent(680, 312, 15) + vent(764, 312, 15)
      + [704, 716, 728, 740].map((x) => '<rect class="led" x="' + x + '" y="318" width="8" height="4" rx="1.5" fill="#7a1f1f"/>').join('')
      + '<rect id="dNavScr" x="612" y="142" width="220" height="134" rx="14" fill="#050608" stroke="#2a3138" stroke-width="3"/>'
      + '<rect class="gl" x="632" y="160" width="180" height="98" rx="7" fill="#0d1620"/>'
      + '<path d="M650,240 L690,204 L728,220 L756,186" fill="none" stroke="' + t.acc + '" stroke-opacity=".75" stroke-width="5" stroke-linecap="round"/>'
      + '<circle cx="756" cy="186" r="6" fill="' + t.acc + '"/><text x="644" y="176" fill="#8a96a3" font-size="10">NAV</text>'
      + '<rect x="660" y="282" width="124" height="14" rx="4" fill="#15191e" stroke="#2a3138"/><polygon points="722,284 728,294 716,294" fill="#d2453b"/>';
    return g + '<rect x="10" y="156" width="44" height="56" rx="5" fill="#fff" stroke="#111" stroke-width="2"/>'
      + '<text x="32" y="168" fill="#111" font-size="7" font-weight="700" text-anchor="middle">SPEED</text>'
      + '<text x="32" y="176" fill="#111" font-size="7" text-anchor="middle" font-weight="700">LIMIT</text>'
      + '<text id="dLim" x="32" y="203" fill="#111" font-size="18" font-weight="800" text-anchor="middle">—</text>'
      + '<rect x="-900" y="330" width="2800" height="110" fill="#171a20"/><path d="M70,440 Q255,392 440,440 Z" fill="#08090c"/>'
      + '<rect x="241" y="372" width="28" height="68" fill="#15181d"/>'
      + '<g id="dWheel" transform="translate(255,318) scale(.7)"><circle r="122" fill="none" stroke="url(#leather)" stroke-width="26"/><circle r="122" fill="none" stroke="#3a322c" stroke-width="4"/>'
      + '<rect x="-122" y="-11" width="244" height="22" rx="10" fill="#1b1f24"/><rect x="-13" y="-11" width="26" height="120" fill="#1b1f24"/>'
      + '<rect class="led" x="-80" y="-4" width="12" height="7" rx="2" fill="#7a1f1f"/><rect class="led" x="68" y="-4" width="12" height="7" rx="2" fill="#7a1f1f"/>'
      + '<circle id="dHorn" r="34" fill="#15191d" stroke="' + t.ring + '" stroke-width="3" style="pointer-events:all;cursor:pointer"><title>Horn (tap the wheel hub, or press N)</title></circle><text y="5" fill="' + t.acc + '" font-size="11" text-anchor="middle" font-weight="700">' + t.badge + '</text>'
      + '</g>'
      + '</svg>';
  }
  /* windshield seen from the driver's seat (US left-hand drive): thick driver-side A-pillar, thinner passenger one, roof header, sun visor, mirror, tinted glass */
  const CAR_GLASS = '<svg class="carGlass" viewBox="0 0 1600 900" preserveAspectRatio="none" aria-hidden="true">'
    + '<defs><linearGradient id="cgTint" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0e2a3a" stop-opacity=".34"/><stop offset=".22" stop-color="#0e2a3a" stop-opacity=".08"/><stop offset="1" stop-color="#0e2a3a" stop-opacity="0"/></linearGradient>'
    + '<linearGradient id="cgSide" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#0b1a24" stop-opacity=".42"/><stop offset="1" stop-color="#0b1a24" stop-opacity=".12"/></linearGradient></defs>'
    + '<path d="M180,46 L1450,46 L1520,900 L96,900 Z" fill="url(#cgTint)"/>'
    + '<path d="M0,40 L150,40 L40,620 L0,640 Z" fill="url(#cgSide)"/>'
    + '<path d="M520,60 L760,60 L420,900 L330,900 Z" fill="#fff" opacity=".035"/>'
    + '<path d="M0,0 H1600 V52 Q800,30 0,52 Z" fill="#0d0f12"/>'
    + '<path d="M150,40 L238,46 L72,700 L0,760 L0,650 L40,620 Z" fill="#111418"/><path d="M238,46 L72,700" stroke="#2a3038" stroke-width="3"/>'
    + '<path d="M1462,48 L1520,44 L1600,560 L1600,640 L1556,600 Z" fill="#111418"/>'
    + '<rect x="250" y="34" width="360" height="58" rx="14" fill="#1a1d22" stroke="#272b31" stroke-width="2"/><rect x="300" y="52" width="90" height="20" rx="4" fill="#22262c"/>'
    + '<rect x="905" y="40" width="12" height="34" fill="#15181c"/><rect x="800" y="70" width="230" height="60" rx="16" fill="#15181c"/><rect x="810" y="78" width="210" height="44" rx="11" fill="#5a6e80" opacity=".55"/>'
    + '</svg>';
  const CAR_DASH_REST = CAR_GLASS + '<div class="dashMusic" id="dashMusic" title="YouTube music"></div>'
    + '<div class="carplay" id="dashCarplay">'
    + '<div class="cpEyebrow" title="Drag to move · grip to resize · Reset recenters">'
    + '<span>⠿ Now on</span><button type="button" class="cpReset" data-cp-reset="1" title="Reset position">Reset</button></div>'
    + '<div class="cpStreet" id="cpStreet">—</div>'
    + '<div class="cpSub" id="cpSub">Looking for road…</div>'
    + '<div class="cpRow"><span id="cpHead">000°</span><span id="dGear">D</span><span id="dTrip">0.0 mi</span></div>'
    + '<div class="cpRow"><span id="cpDest">—</span><span id="dRem">— mi</span><span id="dEta">ETA —</span></div>'
    + '<div class="cpResize" data-cp-resize="1" title="Drag to resize"></div>'
    + '</div>';
  const carDash = (st) => carDashSvg(st) + CAR_DASH_REST;
  let dashKind = '';
  function hdgDeg() { return (((180 - S.hd * 180 / Math.PI) % 360) + 360) % 360; }
  function altFt() {
    /* AGL: deck sits ~1.4 m on runway; show feet above ground for roll/rollout/parked */
    if (S.kind === 'plane' && /roll|rollout|parked/.test(S.phase)) return Math.max(0, Math.round((S.p.y - 1.4) / FT));
    return Math.round(S.p.y / FT);
  }
  function vsFpm() { return Math.round(((S.vy || 0) / FT) * 60 / 10) * 10; }
  function dashType() { const s = S.planeStyle; return s === 'b2' ? 'jet' : s === 'heli' || s === 'fighter' || s === 'c130' || s === 'jet' ? s : 'prop'; }
  function planeDashHtml() { return dashSvg(dashType()); }
  let _cpBound = false, _streetT = 0, _unsubMusic = null;
  /** Normalize a highway tag from OSM ref/name text. */
  function formatHwyTag(raw) {
    const s = String(raw || '').replace(/\s+/g, ' ').trim();
    if (!s) return '';
    let m = s.match(/\b(FM|RM|SH|TX)\s*-?\s*(\d+[A-Za-z]?)\b/i);
    if (m) return m[1].toUpperCase() + ' ' + m[2].toUpperCase();
    m = s.match(/\b(?:IH|I)\s*-?\s*(\d+[A-Za-z]?)\b/i);
    if (m) return 'I-' + m[1].toUpperCase();
    m = s.match(/\bUS\s*-?\s*(\d+[A-Za-z]?)\b/i);
    if (m) return 'US ' + m[1].toUpperCase();
    m = s.match(/\b(?:BW|Beltway)\s*-?\s*(\d+[A-Za-z]?)\b/i);
    if (m) return 'Beltway ' + m[1];
    return '';
  }
  /** Live road label from the carriageway you are on (not a fixed placeholder). */
  function liveRoadLabel(ref, name) {
    const r = String(ref || '').replace(/\s+/g, ' ').trim();
    const n = String(name || '').replace(/\s+/g, ' ').trim();
    const hwy = formatHwyTag(r) || formatHwyTag(n);
    const street = n && (!hwy || n.toLowerCase() !== hwy.toLowerCase()) ? n : '';
    /* Prefer “FM 1464” then add local name when it adds detail */
    if (hwy && street && !street.toLowerCase().includes(hwy.replace(/-/g, ' ').toLowerCase())
      && !hwy.toLowerCase().includes(street.toLowerCase())) {
      const combo = hwy + ' · ' + street;
      return combo.length > 34 ? hwy : combo;
    }
    if (hwy) return hwy;
    if (street) return street.length > 32 ? street.slice(0, 31) + '…' : street;
    if (r) return r.length > 32 ? r.slice(0, 31) + '…' : r;
    return '';
  }
  function refreshStreetInfo() {
    /* Free-drive: probe the carriageway under the car. Tour uses route sample in stepCar. */
    if (S.mode === 'tour') return;
    try {
      const T = getTraffic && getTraffic();
      const C = T && T.carriageways;
      if (!C || !C.length) return;
      const hit = nearestCw(C, S.p.x, S.p.z, 70, false) || nearestCw(C, S.p.x, S.p.z, 140, false);
      if (hit && hit.c) {
        const cref = hit.c.ref || '';
        const cname = hit.c.name || '';
        if (cref || cname) {
          S.info = cref || cname;
          S.roadName = cname;
        }
        if (hit.c.ff) S.limit = hit.c.ff;
      }
    } catch (e) { /* ignore */ }
  }
  function syncDriverMusic(showDriverCar) {
    try {
      if (showDriverCar) music.pinToDriverSlot(dash.querySelector('#dashMusic'));
      else music.clearDriverPin();
    } catch (e) { /* ignore */ }
    if (showDriverCar && !_cpBound) {
      _cpBound = true;
      if (_unsubMusic) _unsubMusic();
      _unsubMusic = music.subscribe((st) => {
        if (st.on !== S.musicOn) {
          S.musicOn = !!st.on;
          persistVeh();
          renderHud();
        }
      });
    }
  }
  let _cpDragBound = false, _cpDragging = false, _cpResizing = false;
  function resetCarplayLayout() {
    prefs.cpX = null; prefs.cpY = null; prefs.cpW = null; prefs.cpH = null;
    savePrefs(prefs);
    const el = dash.querySelector('#dashCarplay');
    if (!el) return;
    el.classList.remove('placed');
    el.style.left = ''; el.style.top = ''; el.style.bottom = '';
    el.style.width = ''; el.style.height = ''; el.style.transform = '';
  }
  function carplayPosOk(x, y, w, h) {
    if (x == null || y == null) return false;
    const ww = w || 220, hh = h || 130;
    return x >= 4 && y >= 4 && x + 48 < innerWidth && y + 48 < innerHeight
      && x + ww > 40 && y + hh > 40;
  }
  function applyCarplayLayout() {
    const el = dash.querySelector('#dashCarplay');
    if (!el || _cpDragging || _cpResizing) return;
    if (!carplayPosOk(prefs.cpX, prefs.cpY, prefs.cpW, prefs.cpH)) {
      prefs.cpX = null; prefs.cpY = null;
    }
    if (prefs.cpX != null && prefs.cpY != null) {
      el.classList.add('placed');
      el.style.left = prefs.cpX + 'px';
      el.style.top = prefs.cpY + 'px';
      el.style.bottom = 'auto';
      el.style.transform = 'none';
    } else {
      el.classList.remove('placed');
      el.style.left = '';
      el.style.top = '';
      el.style.bottom = '';
      el.style.transform = '';
    }
    if (prefs.cpW) el.style.width = prefs.cpW + 'px';
    else el.style.width = '';
    if (prefs.cpH) el.style.height = prefs.cpH + 'px';
    else el.style.height = '';
    /* default home of the Now-on card: inside the nav tablet on the centre stack */
    const nv = prefs.cpX == null && dash.querySelector('#dNavScr'), nb = nv && nv.getBoundingClientRect();
    if (nb && nb.width > 120 && nb.height > 70) {
      el.classList.add('placed'); el.style.transform = 'none'; el.style.bottom = 'auto';
      el.style.left = Math.round(nb.left + 4) + 'px'; el.style.top = Math.round(nb.top + 4) + 'px';
      el.style.width = Math.round(nb.width - 8) + 'px'; el.style.height = Math.round(nb.height - 8) + 'px';
    }
  }
  function bindCarplayChrome() {
    const el = dash.querySelector('#dashCarplay');
    if (!el) return;
    applyCarplayLayout();
    if (!_cpDragBound) {
      _cpDragBound = true;
      let drag = null, resize = null;
      const onMove = (e) => {
        if (resize && e.pointerId === resize.id) {
          const maxW = Math.min(480, innerWidth * 0.78);
          const maxH = Math.min(280, innerHeight * 0.4);
          const w = Math.max(160, Math.min(maxW, e.clientX - resize.x0));
          const h = Math.max(96, Math.min(maxH, e.clientY - resize.y0));
          prefs.cpW = Math.round(w);
          prefs.cpH = Math.round(h);
          el.style.width = prefs.cpW + 'px';
          el.style.height = prefs.cpH + 'px';
          e.preventDefault();
          return;
        }
        if (!drag || e.pointerId !== drag.id) return;
        const w = el.offsetWidth, h = el.offsetHeight;
        const x = Math.max(8, Math.min(innerWidth - w - 8, e.clientX - drag.dx));
        const y = Math.max(8, Math.min(innerHeight - h - 8, e.clientY - drag.dy));
        prefs.cpX = x; prefs.cpY = y;
        el.style.left = x + 'px';
        el.style.top = y + 'px';
      };
      const onEnd = (e) => {
        if (resize && (!e || e.pointerId === resize.id)) {
          resize = null;
          _cpResizing = false;
          window.removeEventListener('pointermove', onMove);
          window.removeEventListener('pointerup', onEnd);
          window.removeEventListener('pointercancel', onEnd);
          savePrefs(prefs);
          return;
        }
        if (!drag || (e && e.pointerId !== drag.id)) return;
        drag = null;
        _cpDragging = false;
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onEnd);
        window.removeEventListener('pointercancel', onEnd);
        savePrefs(prefs);
      };
      el.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-cp-reset]');
        if (!btn) return;
        e.preventDefault();
        e.stopPropagation();
        resetCarplayLayout();
      });
      el.addEventListener('dblclick', (e) => {
        if (!e.target.closest('.cpEyebrow')) return;
        e.preventDefault();
        resetCarplayLayout();
      });
      el.addEventListener('pointerdown', (e) => {
        if (e.target.closest('[data-cp-reset]')) return;
        const grip = e.target.closest('[data-cp-resize]');
        if (grip) {
          const r = el.getBoundingClientRect();
          /* Pin to fixed coords so size changes don't jump under transform centering */
          el.classList.add('placed');
          el.style.left = r.left + 'px';
          el.style.top = r.top + 'px';
          el.style.bottom = 'auto';
          el.style.transform = 'none';
          prefs.cpX = r.left; prefs.cpY = r.top;
          prefs.cpW = Math.round(r.width); prefs.cpH = Math.round(r.height);
          el.style.width = prefs.cpW + 'px';
          el.style.height = prefs.cpH + 'px';
          resize = { id: e.pointerId, x0: r.left, y0: r.top };
          _cpResizing = true;
          window.addEventListener('pointermove', onMove, { passive: false });
          window.addEventListener('pointerup', onEnd);
          window.addEventListener('pointercancel', onEnd);
          try { grip.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        const handle = e.target.closest('.cpEyebrow');
        if (!handle) return;
        const r = el.getBoundingClientRect();
        el.classList.add('placed');
        el.style.left = r.left + 'px';
        el.style.top = r.top + 'px';
        el.style.bottom = 'auto';
        el.style.transform = 'none';
        prefs.cpX = r.left; prefs.cpY = r.top;
        drag = { dx: e.clientX - r.left, dy: e.clientY - r.top, id: e.pointerId };
        _cpDragging = true;
        window.addEventListener('pointermove', onMove, { passive: false });
        window.addEventListener('pointerup', onEnd);
        window.addEventListener('pointercancel', onEnd);
        try { el.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
        e.preventDefault();
        e.stopPropagation();
      });
    }
  }
  function drawDash() {
    const show = S.view === 'driver' || S.view === 'cockpit';
    const carDriver = show && S.kind === 'car';
    dash.classList.toggle('on', show);
    dash.classList.toggle('carOn', carDriver);
    if (!show) {
      syncDriverMusic(false);
      return;
    }
    const want = S.kind === 'car' ? 'car:' + S.carStyle : dashType();
    if (dashKind !== want) {
      _cpBound = false;
      _cpDragBound = false;
      try { music.clearDriverPin(); } catch (e) { /* ignore */ }
      dash.innerHTML = S.kind === 'car' ? carDash(S.carStyle) : planeDashHtml();
      dashKind = want;
    }
    dash.classList.toggle('jetCockpit', S.kind === 'plane' && S.acClass === 'jet');
    syncDriverMusic(carDriver);
    if (carDriver) bindCarplayChrome();
    const q = (id) => dash.querySelector('#' + id);
    if (S.kind === 'car') {
      const mph = Math.abs(S.v) / MPH;
      const nd = (id, val) => { const n = q(id); if (!n) return; const c = n._c || (n._c = n.getAttribute('data-c').split(',').map(Number)); const an = (135 + Math.min(1, Math.max(0, val / c[3])) * 270) * Math.PI / 180; n.setAttribute('x2', (c[0] + Math.cos(an) * c[2]).toFixed(1)); n.setAttribute('y2', (c[1] + Math.sin(an) * c[2]).toFixed(1)); };
      nd('dNeedle', mph);
      const ds = q('dSpd'); if (ds) ds.textContent = Math.round(mph);
      const gear = mph < 1 ? 1 : Math.min(6, 1 + Math.floor(mph / 16)), rpm = mph < 1 ? 0.75 : Math.min(7.5, 1.2 + (mph - (gear - 1) * 16) / 16 * 3.2 + gear * 0.1);
      nd('dRpm', rpm);
      const rb = q('dRpmBar'); if (rb) { rb.setAttribute('width', (Math.min(8, rpm) / 8 * 160).toFixed(1)); rb.setAttribute('fill', rpm > 6.5 ? '#e03a2f' : (CAR_THEMES[S.carStyle] || CAR_THEMES.sedan).rp); }
      const rt = q('dRpmTxt'); if (rt) rt.textContent = rpm.toFixed(1);
      const dg = q('dGear'); if (dg) dg.textContent = S.v < -0.2 ? 'R' : mph < 0.5 ? 'P' : 'D' + gear;
      const dt = q('dTrip'); if (dt) dt.textContent = (S.odo / 1609.344).toFixed(1) + ' mi';
      const dl = q('dLim'); if (dl) dl.textContent = S.limit ? S.limit : '—';
      const remMi = S.remain != null ? S.remain / 1609.344 : null;
      const dRem = q('dRem'); if (dRem) dRem.textContent = remMi != null && S.phase !== 'arrived' ? remMi.toFixed(1) + ' mi' : '— mi';
      const et = (S.mode === 'tour' && S.phase !== 'arrived') ? etaSec() : null;
      const dEta = q('dEta');
      if (dEta) {
        if (et == null) dEta.textContent = 'ETA —';
        else if (et < 25) dEta.textContent = 'ETA Now';
        else if (et < 105) dEta.textContent = 'ETA ' + Math.round(et) + 's';
        else dEta.textContent = 'ETA ' + fmtDur(et);
      }
      const steer = Math.abs(S.v) > 0.5 ? Math.atan(2.7 * S.yawRate / S.v) : 0;
      const wh = q('dWheel'); if (wh) wh.setAttribute('transform', 'translate(255,318) scale(.7) rotate(' + Math.max(-540, Math.min(540, -steer * 15 * 180 / Math.PI)).toFixed(1) + ')');
      const now = performance.now();
      if (now - _streetT > 280) {
        _streetT = now;
        refreshStreetInfo();
        const street = liveRoadLabel(S.info, S.roadName);
        const cs = q('cpStreet'); if (cs) cs.textContent = street || '—';
        const sub = q('cpSub');
        if (sub) {
          if (S.dest && S.phase !== 'arrived' && S.phase !== 'home') sub.textContent = '→ ' + S.dest.n;
          else if (S.mode === 'free') sub.textContent = street ? 'Free drive' : 'Find a road…';
          else if (S.phase === 'arrived') sub.textContent = 'Arrived · ' + (S.dest ? S.dest.n : '');
          else sub.textContent = street ? (S.limit ? S.limit + ' mph zone' : 'On route') : 'Looking for road…';
        }
        const ch = q('cpHead'); if (ch) ch.textContent = String(Math.round(hdgDeg())).padStart(3, '0') + '°';
        const cd = q('cpDest');
        if (cd) cd.textContent = S.dest ? S.dest.n.slice(0, 28) : '—';
      }
    } else {
      updateDash(dash, { type: dashType(), kt: S.v / KT, ft: altFt(), vs: vsFpm(), hdg: hdgDeg(), roll: S.roll || 0, pitch: S.pitch || 0,
        pwr: S._pwr || 0, gear: S._gearK == null ? 1 : S._gearK, phase: S.phase || '', info: S.info || '' });
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
    if (e.code === 'KeyH' && !e.ctrlKey && !e.metaKey && !e.altKey) {
      setHudHidden(!S.hudHid); e.preventDefault(); return;
    }
    if (e.code === 'KeyN' && S.kind === 'car' && !e.ctrlKey && !e.metaKey && !e.altKey) { horn(); e.preventDefault(); return; }
    if (e.code === 'KeyM' && !e.ctrlKey && !e.metaKey && !e.altKey) {
      S.soundOn = !S.soundOn; audio.setMuted(!S.soundOn); persistVeh(); renderHud(); e.preventDefault(); return;
    }
    if (/^Digit[1-5]$/.test(e.code)) { const v = VIEWS[S.kind][+e.code.slice(5) - 1]; if (v) setView(v[0]); return; }
    if (S.mode === 'free' && FREE_KEYS.has(e.code)) { S.keys[e.code] = true; e.preventDefault(); e.stopImmediatePropagation(); }
  }, true);
  addEventListener('keyup', (e) => { S.keys[e.code] = false; }, true);
  const key = (...c) => c.some((k) => S.keys[k]);

  function persistVeh() {
    prefs.carColor = S.carColor; prefs.carStyle = S.carStyle; prefs.planeColor = S.planeColor; prefs.planeAccent = S.planeAccent; prefs.planeStyle = S.planeStyle; prefs.jetModel = S.jetModel;
    prefs.soundOn = S.soundOn; prefs.soundVol = S.soundVol;
    prefs.radioOn = S.radioOn; prefs.musicOn = S.musicOn;
    savePrefs(prefs);
  }
  function audioKind() {
    if (S.kind === 'car') return 'car';
    const s = S.planeStyle;
    return s === 'heli' ? 'heli' : s === 'fighter' ? 'fighter' : s === 'c130' ? 'turboprop' : s === 'jet' || s === 'b2' ? 'jet' : 'prop';
  }
  /* Model origin → wheel / skid bottom (userData.gearDrop) so tyres sit on the runway deck instead of sinking into it */
  function groundClear() { const ud = S.obj && S.obj.userData; return ud && ud.gearDrop != null ? ud.gearDrop * S.obj.scale.y + 0.15 - 1.4 : 0; }
  /* Retractable gear (jet, F-16, C-130): down on the ground, up once climbing past ~200 ft, down again ~5 nm out. Cessna gear and heli skids are fixed. */
  function gearWanted() {
    if (!/^(jet|fighter|turboprop)$/.test(S.acClass || '')) return true;
    const ph = S.phase || '';
    if (/roll|rollout|taxi|parked|final/.test(ph)) return true;
    if (ph === 'toFaf') return (S.remain || 1e9) < 9300;
    if (ph === 'climb') return S.p.y < 60;
    return S.p.y < 12;
  }
  function animGear(want, dt) {
    const g = S.obj && S.obj.userData && S.obj.userData.gear; if (!g) return;
    const t = want ? 1 : 0, step = dt / 6; /* ~6 s gear cycle */
    S._gearK = S._gearK == null ? t : S._gearK + Math.max(-step, Math.min(step, t - S._gearK));
    g.scale.y = Math.max(0.02, S._gearK); g.visible = S._gearK > 0.03;
  }
  /* Engine power 0–1 by flight phase (drives N1/RPM gauges and engine sound) */
  function enginePwr(dt) {
    if (S.kind !== 'plane') return 0;
    const ph = S.phase || '', v = Math.abs(S.v);
    let t;
    if (ph === 'taxi') t = 0.16;
    else if (ph === 'parked' || ph === 'home' || ph === 'arrived') t = v > 2 ? 0.12 : 0.02;
    else if (ph === 'roll') t = 1;
    else if (ph === 'climb') t = 0.93;
    else if (ph === 'rollout') t = v > 30 ? 0.72 : 0.06;
    else if (ph === 'final') t = S.p.y < 8 ? 0.15 : 0.42;
    else if (ph === 'toFaf') t = 0.5;
    else if (ph === 'cruise' || ph === 'orbit') t = 0.8;
    else t = 0.25 + 0.6 * Math.min(1, v / (S.acClass === 'jet' ? 120 : 55));
    return S._pwr == null ? t : S._pwr + (t - S._pwr) * Math.min(1, dt * 0.7);
  }
  function startTourAudio() {
    audio.start(audioKind(), { muted: !S.soundOn, vol: S.soundVol, radioOn: S.radioOn });
    music.setOn(!!S.musicOn);
  }
  function nudgeMusicHint() {
    if (S.musicOn || !S.mode) return;
    note((S.kind === 'plane' ? 'Airborne tip: ' : 'Drive tip: ') + 'tap Music · shuffle play · Autoplay next is on.');
  }
  function spawnVehicle() {
    const pos = S.p.clone(), hd = S.hd, pitch = S.pitch, roll = S.roll;
    if (S.obj) { disposeGroup(S.obj); S.obj = null; }
    if (S.kind === 'car') {
      S.obj = makeTourCar(S.carColor, S.carStyle); S.acClass = 'car';
    } else {
      const jet = S.planeStyle === 'jet' && typeof makeJet === 'function';
      const heli = S.planeStyle === 'heli' && typeof makeHeli === 'function';
      const mil = /^(fighter|c130|b2)$/.test(S.planeStyle) && typeof makeMil === 'function';
      const acc = S.planeAccent >= 0 ? S.planeAccent : null;
      S.obj = jet ? makeJet(S.planeColor, acc, S.jetModel) : heli ? makeHeli(S.planeColor, acc) : mil ? makeMil(S.planeStyle, S.planeColor, acc) : makePlane(S.planeColor, acc);
      S.acClass = (jet || mil) ? 'jet' : 'prop';
      S.obj.scale.setScalar(jet ? 0.55 : 1);
      S._gearK = null; S._pwr = null; animGear(gearWanted(), 1e3);
    }
    scene.add(S.obj);
    S.obj.position.copy(pos);
    if (S.kind === 'plane') S.obj.position.y += groundClear();
    if (S.kind === 'car') S.obj.rotation.set(0, hd, 0);
    else S.obj.rotation.set(-pitch, hd, roll, 'YXZ');
  }
  function renderHud() {
    const views = VIEWS[S.kind].map(([id, n], i) => '<button data-view="' + id + '" class="' + (S.view === id ? 'on' : '') + '" title="key ' + (i + 1) + '">' + n + '</button>').join('');
    const speeds = S.kind === 'car' && S.mode === 'tour'
      ? '<span style="color:#8a96a3;align-self:center">Cruise</span>' + [0, 30, 40, 50, 60, 70, 80, 90, 100].map((x) => '<button data-cruise="' + x + '" class="' + (S.cruise === x ? 'on' : '') + '">' + (x ? x : 'Limit +5') + '</button>').join('')
      : [1, 2, 4, 10].map((x) => '<button data-sx="' + x + '" class="' + (S.speedX === x ? 'on' : '') + '">×' + x + '</button>').join('')
        + (S.kind === 'plane' && S.wx && /^(jet|fighter)$/.test(S.planeStyle) ? '<button data-ss="1" class="' + (S.supersonic ? 'on' : '') + '" title="Optional: cruise at Mach 2 (about 1,150 kt) once above 30,000 ft. The ETA follows your real speed.">Supersonic</button>' : '')
        + (S.kind === 'plane' && S.planeStyle !== 'heli' ? '<button data-park="1" class="' + (S.taxiPark !== false ? 'on' : '') + '" title="After landing, leave the runway and taxi to an apron parking spot">Taxi to park</button>' : '')
        + (flyOnHtml());
    function flyOnHtml() {
      /* landed in a world city: fly on from the same airport */
      const C = window.HTS_WORLD_CAT, at = S.wx && S.wx.to;
      if (S.kind !== 'plane' || !at || !S._flyOn || !C || !window.HTS_INTERCITY_FLY) return '';
      const here = C.cities.find((q) => q.id === at); if (!here || !here.apt) return '';
      const opts = C.cities.filter((q) => q.apt && q.id !== at).sort((a, b) => a.name.localeCompare(b.name)).map((q) => '<option value="' + q.id + '">' + q.name + ' (' + q.apt.code + ')</option>').join('');
      return '<span style="flex-basis:100%;height:0"></span><select data-flyto style="max-width:170px">' + opts + '</select><button data-flyon="1" class="on" title="Take off again from ' + here.apt.code + ' with the same aircraft">Take off from ' + here.apt.code + '</button>';
    }
    const styles = (S.kind === 'car' ? CAR_STYLES : PLANE_STYLES).map(([id, n]) => '<button data-style="' + id + '" class="' + ((S.kind === 'car' ? S.carStyle : S.planeStyle) === id ? 'on' : '') + '">' + n + '</button>').join('');
    const cols = (S.kind === 'car' ? CAR_COLORS : PLANE_COLORS).map((c) => {
      const on = (S.kind === 'car' ? S.carColor : S.planeColor) === c;
      return '<button type="button" class="sw' + (on ? ' on' : '') + '" data-col="' + c + '" style="background:#' + c.toString(16).padStart(6, '0') + '" title="' + (S.kind === 'car' ? 'Paint' : 'Main colour') + '"></button>';
    }).join('');
    const accs = S.kind === 'car' ? '' : '<span style="flex-basis:100%;height:0"></span><span style="color:#8a96a3">Accent</span>'
      + '<button type="button" class="sw none' + (S.planeAccent < 0 ? ' on' : '') + '" data-acc="-1" title="No accent — one solid colour"></button>'
      + PLANE_ACCENTS.map((c) => '<button type="button" class="sw' + (S.planeAccent === c ? ' on' : '') + '" data-acc="' + c + '" style="background:#' + c.toString(16).padStart(6, '0') + '" title="Accent: stripe, tail, nose, engines"></button>').join('');
    hud.innerHTML = '<div class="tt"><span><span class="drag" title="Drag panel">⠿</span><span id="tourTitle"></span></span>'
      + '<span class="acts"><button type="button" class="hide" data-hide="1" title="Hide panel (H)">Hide</button>'
      + '<button type="button" class="x" data-exit="1">Exit (Esc)</button></span></div>'
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
      + (S.kind === 'plane' && S.mode === 'tour' && window.HTS_WORLD_PENDING && window.HTS_WORLD_PENDING.dest === S.dest ? '<span style="color:#8a96a3;align-self:center;margin-left:6px">Land at</span><b style="align-self:center;margin-left:4px">' + window.HTS_WORLD_PENDING.apt + '</b>' : '')
      + (S.kind === 'plane' && S.mode === 'tour' && !(window.HTS_WORLD_PENDING && window.HTS_WORLD_PENDING.dest === S.dest) ? '<span style="color:#8a96a3;align-self:center;margin-left:6px">Land at</span><select data-land="1" style="background:#1b232c;color:#dbe6f0;border:1px solid #34404c;border-radius:7px;padding:4px">' + aptList().map((a) => '<option value="' + a.code + '"' + (a.code === S.landApt ? ' selected' : '') + '>' + a.code + '</option>').join('') + '</select><button data-landnow="1">Land now</button>' : '')
      + (S.mode === 'free' ? '<span style="color:#8a96a3;align-self:center;margin-left:6px">' + (S.kind === 'car' ? 'W/S throttle · A/D steer' : 'W/S pitch · A/D bank · Q/E yaw · Shift/X throttle') + '</span>' : '') + '</div>'
      + '<div class="row" style="margin-top:6px;flex-wrap:wrap"><span style="color:#8a96a3">' + (S.kind === 'car' ? 'Vehicle</span>' + styles : 'Aircraft</span><b style="align-self:center;margin:0 4px">' + acName() + '</b>') + '<span style="color:#8a96a3;margin-left:4px">' + (S.kind === 'car' ? 'Color' : 'Main') + '</span>' + cols + accs
      + '<span class="snd"><button type="button" class="mute' + (S.soundOn ? '' : ' on') + '" data-mute="1" title="Mute engine sound (M)">' + (S.soundOn ? 'Sound' : 'Muted') + '</button>'
      + (S.kind === 'plane' ? '<button type="button" class="' + (S.radioOn ? 'on' : '') + '" data-radio="1" title="ATC radio chatter">Radio</button>' : '')
      + '<button type="button" class="' + (S.musicOn ? 'on' : '') + '" data-music="1" title="Shuffle music · ' + music.trackCount + ' songs">Music</button>'
      + '<input type="range" min="0" max="100" value="' + Math.round(S.soundVol * 100) + '" data-vol="1" title="Engine / radio volume" aria-label="Tour volume"/></span></div>';
    applyHudPos();
    hud.classList.toggle('hid', !!S.hudHid);
    hudPeek.classList.toggle('on', !!(S.mode && S.hudHid));
    hud.querySelectorAll('[data-view]').forEach((b) => b.addEventListener('click', () => setView(b.getAttribute('data-view'))));
    hud.querySelectorAll('[data-ss]').forEach((b) => b.addEventListener('click', () => { S.supersonic = !S.supersonic; note(S.supersonic ? 'Supersonic: Mach 2 above 30,000 ft' : 'Normal cruise speed'); renderHud(); }));
    hud.querySelectorAll('[data-sx]').forEach((b) => b.addEventListener('click', () => { S.speedX = +b.getAttribute('data-sx'); renderHud(); }));
    hud.querySelectorAll('[data-cruise]').forEach((b) => b.addEventListener('click', () => { S.cruise = +b.getAttribute('data-cruise'); renderHud(); }));
    hud.querySelectorAll('[data-park]').forEach((b) => b.addEventListener('click', () => { S.taxiPark = S.taxiPark === false; renderHud(); }));
    hud.querySelectorAll('[data-flyon]').forEach((b) => b.addEventListener('click', () => {
      const sel = hud.querySelector('[data-flyto]'), from = S.wx && S.wx.to, ac = S.planeStyle === 'jet' ? S.jetModel : S.planeStyle;
      if (!sel || !from) return;
      Promise.resolve(window.HTS_INTERCITY_FLY(from, sel.value, ac)).catch((e) => note(e.message || String(e)));
    }));
    const hb = hud.querySelector('[data-hide]'); if (hb) hb.addEventListener('click', () => setHudHidden(true));
    hud.querySelector('[data-exit]').addEventListener('click', stop);
    const mb = hud.querySelector('[data-mute]');
    if (mb) mb.addEventListener('click', () => {
      S.soundOn = !S.soundOn;
      audio.setMuted(!S.soundOn);
      persistVeh();
      renderHud();
    });
    const rb = hud.querySelector('[data-radio]');
    if (rb) rb.addEventListener('click', () => {
      S.radioOn = !S.radioOn;
      audio.setRadio(S.radioOn && S.kind === 'plane');
      persistVeh();
      renderHud();
    });
    const yb = hud.querySelector('[data-music]');
    if (yb) yb.addEventListener('click', () => {
      S.musicOn = !S.musicOn;
      music.setOn(S.musicOn);
      persistVeh();
      renderHud();
    });
    const vr = hud.querySelector('[data-vol]');
    if (vr) vr.addEventListener('input', () => {
      S.soundVol = Math.max(0, Math.min(1, (+vr.value || 0) / 100));
      audio.setVolume(S.soundVol);
      if (S.soundVol > 0 && !S.soundOn) { S.soundOn = true; audio.setMuted(false); }
      persistVeh();
      const lab = hud.querySelector('[data-mute]');
      if (lab) { lab.textContent = S.soundOn ? 'Sound' : 'Muted'; lab.classList.toggle('on', !S.soundOn); }
    });
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
      persistVeh(); spawnVehicle();
      if (S.mode === 'tour') spawnEscorts();
      audio.setKind(audioKind());
      dashKind = '';
      renderHud();
    }));
    hud.querySelectorAll('[data-col]').forEach((b) => b.addEventListener('click', () => {
      const c = +b.getAttribute('data-col');
      if (S.kind === 'car') S.carColor = c; else S.planeColor = c;
      persistVeh(); spawnVehicle(); renderHud();
    }));
    hud.querySelectorAll('[data-acc]').forEach((b) => b.addEventListener('click', () => {
      S.planeAccent = +b.getAttribute('data-acc');
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
        if (e) {
          const clock = clockTz(S.destTz, at);
          if (et < 25) e.textContent = 'Now · ' + clock;
          else if (et < 105) e.textContent = Math.round(et) + 's · ' + clock;
          else e.textContent = fmtDur(et) + ' · ' + clock;
        }
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
    const car = S.kind === 'car';
    /* Leave driver/cockpit → show floating music again */
    if (v !== 'driver' && v !== 'cockpit') {
      try { syncDriverMusic(false); } catch (e) { /* ignore */ }
    }
    if (v === 'orbit') {
      /* Sync free-look spherical state from the live camera so applyCam doesn't yank */
      const tx = S.p.x, ty = S.p.y, tz = S.p.z;
      camGoal.target.set(tx, ty, tz);
      cam.target.copy(camGoal.target);
      const dx = camera.position.x - tx, dy = camera.position.y - ty, dz = camera.position.z - tz;
      let r = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (!Number.isFinite(r) || r < 1) r = car ? 45 : 160;
      camGoal.radius = Math.min(car ? 140 : 520, Math.max(car ? 18 : 55, r));
      cam.radius = camGoal.radius;
      camGoal.theta = Math.atan2(dx, dz);
      cam.theta = camGoal.theta;
      const sp = Math.hypot(dx, dz);
      camGoal.phi = Math.max(0.12, Math.min(1.42, Math.atan2(sp, Math.max(0.01, dy))));
      cam.phi = camGoal.phi;
      S.th0 = camGoal.theta;
      S.ph0 = camGoal.phi;
    } else {
      S.th0 = camGoal.theta;
      if (v === 'chase') { camGoal.radius = car ? 14 : 45; camGoal.phi = 1.25; }
      /* Plane Top stays modest — large radius put the cam inside the cumulus deck (white wash) */
      if (v === 'top') { camGoal.radius = car ? 160 : 260; camGoal.phi = 0.1; }
      if (v === 'driver' || v === 'cockpit' || v === 'side' || v === 'wing') camGoal.phi = 1.5;
      S.ph0 = camGoal.phi;
    }
  }

  /* ---------- car routing over the live carriageway graph ---------- */
  /* intercity flight: real great-circle metres from a Houston-map point to the destination airport */
/* 45 min, 1 h 05 min, 12 h 40 min */
function fmtDur(sec) { const m = Math.round(sec / 60); return m < 60 ? m + ' min' : Math.floor(m / 60) + 'h ' + String(m % 60).padStart(2, '0') + 'm'; }
function icRealLeft(x, z, t) {
  const R = Math.PI / 180, lat = 29.7604 - (z - 60) / (69 * 1609.344), lng = -95.3698 + (x - 60) / (59.9 * 1609.344);
  const h = Math.sin((t.lat - lat) * R / 2) ** 2 + Math.cos(lat * R) * Math.cos(t.lat * R) * Math.sin((t.lng - lng) * R / 2) ** 2;
  return 2 * 6371008.8 * Math.asin(Math.min(1, Math.sqrt(h)));
}
/* intercity drive: Houston streets from where you are to the edge of Houston's road map, then the highway route */
  /* another city -> Houston: the real highway the whole way; the highway mesh stops where Houston's own roads take over */
  function icJoinRev(T, ic) {
    let x0 = 1e12, x1 = -1e12, z0 = 1e12, z1 = -1e12;
    for (const c of T.carriageways) { const p = c.f.pts; for (let i = 0; i < p.length; i += 8) { const x = p[i], z = p[i + 1]; if (x < x0) x0 = x; if (x > x1) x1 = x; if (z < z0) z0 = z; if (z > z1) z1 = z; } }
    x0 += 6000; x1 -= 6000; z0 += 6000; z1 -= 6000;
    const P = ic.map((p) => ({ ...p })); let en = P.findIndex((p) => p.x > x0 && p.x < x1 && p.z > z0 && p.z < z1); if (en < 0) en = P.length - 1;
    S.icFrom = 0; S.icTo = en;
    let s = 0; P.forEach((p, i) => { if (i) s += Math.hypot(p.x - P[i - 1].x, p.z - P[i - 1].z); p.s = s; });
    let rr = 0; for (let i = P.length - 1; i >= 0; i--) { if (i < P.length - 1) rr += (P[i + 1].s - P[i].s) / (P[i].k || 1); P[i].rr = rr; if (rr < 2500) P[i].ff = 35; else if (rr < 20000) P[i].ff = Math.min(P[i].ff || 55, 55); }
    return P;
  }
  function icJoin(T, ic, a) {
    S.icTo = 0;
    let x0 = 1e12, x1 = -1e12, z0 = 1e12, z1 = -1e12;
    for (const c of T.carriageways) { const p = c.f.pts; for (let i = 0; i < p.length; i += 8) { const x = p[i], z = p[i + 1]; if (x < x0) x0 = x; if (x > x1) x1 = x; if (z < z0) z0 = z; if (z > z1) z1 = z; } }
    x0 += 6000; x1 -= 6000; z0 += 6000; z1 -= 6000;
    let ex = ic.findIndex((p) => p.x < x0 || p.x > x1 || p.z < z0 || p.z > z1); if (ex < 0) ex = ic.length - 1;
    const H = a ? findRoute(T, a.c.f.pts[2 * a.i], a.c.f.pts[2 * a.i + 1], ic[ex].x, ic[ex].z) : null;
    let P;
    if (H && H.length > 1) {
      const L = H[H.length - 1]; let k = ex, bd = 1e12;
      for (let j = ex; j < Math.min(ic.length, ex + 80); j++) { const d = Math.hypot(ic[j].x - L.x, ic[j].z - L.z); if (d < bd) { bd = d; k = j; } }
      P = H.map((p) => ({ ...p, k: 1 })).concat(ic.slice(Math.min(ic.length - 1, k + 2)).map((p) => ({ ...p })));
      S.icFrom = H.length;
    } else { P = ic.map((p) => ({ ...p })); S.icFrom = 0; }
    let s = 0; P.forEach((p, i) => { if (i) s += Math.hypot(p.x - P[i - 1].x, p.z - P[i - 1].z); p.s = s; });
    let rr = 0; for (let i = P.length - 1; i >= 0; i--) { if (i < P.length - 1) rr += (P[i + 1].s - P[i].s) / (P[i].k || 1); P[i].rr = rr; }
    return P;
  }
  function sampleAt(P, s, o) {
    let i = S._si || 0;
    while (i < P.length - 2 && P[i + 1].s < s) i++;
    while (i > 0 && P[i].s > s) i--;
    S._si = i;
    const a = P[i], b = P[i + 1], t = Math.min(1, Math.max(0, (s - a.s) / ((b.s - a.s) || 1)));
    o.x = a.x + (b.x - a.x) * t; o.y = a.y + (b.y - a.y) * t; o.z = a.z + (b.z - a.z) * t;
    o.hd = Math.atan2(b.x - a.x, b.z - a.z); o.ff = a.ff; o.ref = a.ref || ''; o.name = a.name || ''; o.i = i; o.k = a.k || 1;
    o.rr = a.rr != null ? a.rr - (s - a.s) / o.k : null;
    o.ln = a.ln || 1; o.lw = a.lw || 3.5; o.lx = a.lx || 0; o.lz = a.lz || 0;
    { const k = Math.hypot(o.lx, o.lz); if (k > 1.15) { o.lx /= k / 1.15; o.lz /= k / 1.15; } } /* no mitre blow-up at sharp bends */
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
  function disposeGroup(root) {
    if (!root) return;
    scene.remove(root);
    root.traverse((o) => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) {
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        for (const m of mats) {
          if (m.map) m.map.dispose();
          m.dispose();
        }
      }
    });
  }
  function clearEscorts() {
    for (const e of S.escorts || []) disposeGroup(e.mesh);
    S.escorts = [];
  }
  function clearObj() {
    clearEscorts();
    if (S.obj) { disposeGroup(S.obj); S.obj = null; }
  }
  /* Lite escorts only — low mesh count so tours stay smooth on Windows */
  function spawnEscorts() {
    clearEscorts();
    S.escorts = [];
    if (S.kind === 'car' && S.route && S.route.length > 4) {
      const styles = ['sedan', 'suv', 'pickup', 'coupe'];
      const offsets = _isWin ? [48, -55] : [48, 95, -55, -120];
      for (let i = 0; i < offsets.length; i++) {
        const mesh = makeTourCar(CAR_COLORS[(i + 2) % CAR_COLORS.length], styles[i % styles.length], false);
        scene.add(mesh);
        S.escorts.push({
          mesh, kind: 'car', ds: offsets[i], si: 0,
          lane: (i % 2 ? 3.1 : -3.1),
          spd: 0.9 + (i % 3) * 0.03,
        });
      }
    }
    /* Plane tours: no escort aircraft — only your aircraft */
  }
  function sampleRoute(P, s, out, esc) {
    /* Independent of S._si; reuse per-escort index to avoid O(n) scans */
    let i = (esc && esc.si) || 0;
    while (i < P.length - 2 && P[i + 1].s < s) i++;
    while (i > 0 && P[i].s > s) i--;
    if (esc) esc.si = i;
    const a = P[i], b = P[Math.min(i + 1, P.length - 1)];
    const t = Math.min(1, Math.max(0, (s - a.s) / ((b.s - a.s) || 1)));
    out.x = a.x + (b.x - a.x) * t; out.y = a.y + (b.y - a.y) * t; out.z = a.z + (b.z - a.z) * t;
    out.hd = Math.atan2(b.x - a.x, b.z - a.z);
    return out;
  }
  function updateEscorts(dt) {
    if (!S.escorts || !S.escorts.length) return;
    if (S.kind !== 'car' || !S.route) return;
    /* every frame (only 2-4 cars): the old 20 Hz throttle made them jump ~1.5 m per step at highway speed */
    const tmp = o;
    const end = S.route[S.route.length - 1].s;
    for (const e of S.escorts) {
      const want = S.s + e.ds * e.spd;
      /* off either end of the route: hide instead of stacking on the start/end point next to your car */
      if (want < 0 || want > end) { e.mesh.visible = false; e.hd = null; continue; }
      sampleRoute(S.route, want, tmp, e);
      /* ease heading through route vertices instead of snapping */
      if (e.hd == null) e.hd = tmp.hd;
      else { let d = tmp.hd - e.hd; d = Math.atan2(Math.sin(d), Math.cos(d)); e.hd += d * Math.min(1, dt * 6); }
      const nx = Math.cos(e.hd), nz = -Math.sin(e.hd);
      e.mesh.position.set(tmp.x + nx * e.lane, tmp.y + 0.02, tmp.z + nz * e.lane);
      e.mesh.rotation.set(0, e.hd, 0);
      e.mesh.visible = Math.abs(e.ds) < 420 || Math.hypot(e.mesh.position.x - S.p.x, e.mesh.position.z - S.p.z) < 380;
    }
  }
  function aptByCode(code) { const q = aptList().find((a) => a.code === code); return q ? { q, d: 0 } : null; }
  function curNeed() { return S.kind !== 'plane' || S.planeStyle === 'heli' ? 0 : (RWY_NEED[S.planeStyle === 'jet' ? S.jetModel : S.planeStyle] || 0) * 0.97; }
  function rwOk(q, need) {
    if (!need || !q || !q.rws || !q.rws.length) return true;
    return Math.max(...q.rws.map((r) => Math.hypot(r.p[r.p.length - 2] - r.p[0], r.p[r.p.length - 1] - r.p[1]))) >= need;
  }
  function nearestAptTo(x, z, need = curNeed()) {
    const list = aptList().filter((q) => rwOk(q, need));
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
    while (performance.now() - t0 < (ms || 8000)) {
      const T = getTraffic && getTraffic();
      if (T && T.carriageways && T.carriageways.length > 20) return T;
      note('Loading Houston roads for the tour…');
      await new Promise((r) => setTimeout(r, 120));
    }
    return getTraffic && getTraffic();
  }
  async function start(kind, mode, dest, opts = {}) {
    /* a new trip never inherits the last trip's title ("Car tour: Atlanta → Houston" on a flight) */
    S.icDrive = false; S.icTitle = null;
    if (S._starting) return;
    S._starting = true;
    try {
      note(kind === 'car' && mode === 'tour' ? 'Starting car tour…' : 'Starting…');
      /* Route planner "Drive it": its From point and planned route win over GPS */
      if (opts.origin && Number.isFinite(opts.origin.x)) {
        S.fromTxt = opts.origin.n || 'your From point';
        await begin(kind, mode, dest, { x: opts.origin.x, z: opts.origin.z }, opts);
        return;
      }
      const g = await locate();
      let origin = null, fromUser = false;
      if (g) {
        const w = geoToWorld(g.lat, g.lng);
        if (Math.hypot(w.x, w.z) < 90000) { origin = w; fromUser = true; }
      }
      /* Map centre is the reliable default — GPS is a bonus when inside the metro. */
      if (!origin) origin = { x: cam.target.x, z: cam.target.z };
      S.fromTxt = fromUser ? 'your location' : (g ? 'map centre (outside Houston metro GPS)' : 'map centre');
      await begin(kind, mode, dest, origin, opts);
    } finally {
      S._starting = false;
    }
  }
  async function begin(kind, mode, dest, origin, opts = {}) {
    stopFollow && stopFollow();
    clearObj();
    window._followOff = { x: 0, z: 0 };
    S.kind = kind; S.mode = mode; S.dest = dest; S.destTz = (dest && dest.tz) || null; S.view = 'chase'; S.v = 0; S.pitch = 0; S.roll = 0; S.s = 0; S._si = 0; S.route = null; S._eta = null; S._etaF = 0; S._cm = null; S.phase = ''; S.odo = 0; S.vy = 0; S.taxi = null;
    S.th0 = camGoal.theta; S.ph0 = camGoal.phi; camGoal.radius = kind === 'car' ? 14 : 45; camGoal.phi = 1.25; S.ph0 = 1.25;
    const cx = origin.x, cz = origin.z;
    S.origin = { x: cx, z: cz }; S.leg = 'out'; S.waitT = 0; S.orbT = 0;
    if (kind === 'car') {
      /* stream road tiles around the start even when the camera is zoomed out to the metro view */
      try { const R0 = getRoads && getRoads(); if (R0 && R0.update) R0.update(cx, cz, 0); } catch (e) { /* ignore */ }
      const T = mode === 'tour' ? await waitTraffic(180000) : (getTraffic && getTraffic());
      if (!T || !T.carriageways || !T.carriageways.length) {
        note('Houston road network is still loading — wait a few seconds, then tap Start tour again.');
        S.mode = null; clearObj(); return;
      }
      /* start on the street the user is actually on: preferring major roads first snapped every trip within 18 km
         onto the nearest FM road / freeway (e.g. FM 1464 from a west-side home) */
      let a = nearestCw(T.carriageways, cx, cz, 450, false)
        || nearestCw(T.carriageways, cx, cz, 18000, true)
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
          if (R && R.update && !opts.icRoute) R.update(dest.x, dest.z, 0);
        } catch (e) { /* ignore */ }
        /* streets around the destination stream in as tiles — wait briefly so the route can end at the curb, not on the freeway */
        for (let k = 0; !opts.icRoute && k < 60 && !localNear(T, dest); k++) { if (!k) note('Loading streets around ' + (dest.n || 'your destination') + '…'); await new Promise((r) => setTimeout(r, 150)); }
        const tries = [
          () => (opts.icRoute ? (opts.icRev ? icJoinRev(T, opts.icRoute) : icJoin(T, opts.icRoute, a)) : null),
          () => (Array.isArray(opts.route) && opts.route.length > 1 ? opts.route.map((p) => ({ ...p })) : null),
          () => findRoute(T, a.c.f.pts[2 * a.i], a.c.f.pts[2 * a.i + 1], dest.x, dest.z, { local: true }),
          () => findRoute(T, cx, cz, dest.x, dest.z, { local: true }),
          () => findRoute(T, a.c.f.pts[2 * a.i], a.c.f.pts[2 * a.i + 1], dest.x, dest.z),
          () => findRoute(T, 60, 60, dest.x, dest.z),
        ];
        S._rdbg = { loc: localNear(T, dest), n: T.carriageways.length, via: -1 };
        for (let k = 0; k < tries.length && !S.route; k++) { S.route = tries[k](); if (S.route) S._rdbg.via = k; }
        if (!S.route) {
          note('No connected road route to ' + dest.n + ' yet — wait for roads to finish loading, then try again.');
          S.mode = null; clearObj(); return;
        }
        const p0 = S.route[0];
        S.p.set(p0.x, p0.y, p0.z);
        if (S.route.length > 1) S.hd = Math.atan2(S.route[1].x - p0.x, S.route[1].z - p0.z);
        S.icDrive = !!opts.icRoute; S.icTitle = (S.icDrive && opts.title) || null;
        if (S.icDrive) { if (opts.onRoute) try { opts.onRoute(S.icTo ? S.route.slice(0, S.icTo + 1) : S.route, S.icFrom || 0); } catch (e) { console.warn('[intercity] highway', e); }
          note('Driving to ' + dest.n + ' · ' + Math.round(S.route[0].rr / 1609.344) + ' mi on real highways · ×2 ×4 ×10 speed it up.'); }
        S.phase = 'drive'; S.tripLen = S.route[S.route.length - 1].s; S.lane = null; S.latCur = 0; S._lcw = null; S._ffT = 0; S._ffTry = 0;
      }
      spawnVehicle();
      if (mode === 'tour') spawnEscorts();
    } else {
      if (mode === 'tour') {
        if (opts.arrive) { S.planeStyle = 'jet'; S.jetModel = opts.arrive.type || 'b787'; }
        if (opts.ac) { const a = AIRCRAFT.find((q) => q[0] === opts.ac); if (a) { S.planeStyle = a[2]; if (a[2] === 'jet') S.jetModel = a[0]; } }
        /* intercity: the trip's real airports join the list so Land at / runways work exactly like Houston's */
        { const base = (S.apts && S.apts.length ? S.apts : (airports() || [])).filter((a) => !a.world);
          S.apts = opts.world ? base.concat(opts.world.apts || []) : base; }
        S.wx = opts.world || null; S._flyOn = false;
        /* helicopters can't fly between cities; small props stay under ~1,200 km, longer trips get an airliner */
        /* your pick is kept: F-16, B-2 and C-130 fly any distance; a helicopter is limited to ~700 km and a Cessna to ~1,200 km */
        if (S.wx && ((S.planeStyle === 'heli' && (S.wx.km || 0) > 700) || (S.planeStyle === 'prop' && (S.wx.km || 0) > 1200))) { note('The ' + acName() + " can't fly that far — taking a Boeing 787 instead."); S.planeStyle = 'jet'; S.jetModel = 'b787'; }
        const depSel = opts.dep != null ? opts.dep : (($('tourDep') || {}).value || '');
        const arrSel = opts.arr != null ? opts.arr : (($('tourArr') || {}).value || '');
        const need = curNeed(), shortRw = (c) => ' (' + c + "'s runway is too short for the " + acName() + ')';
        let depPick = depSel ? aptByCode(depSel) : null; S._why = '';
        if (depPick && !rwOk(depPick.q, need)) { S._why += shortRw(depPick.q.code); depPick = null; }
        const apStart = depPick || nearestAptTo(cx, cz) || nearestAptTo(dest.x, dest.z) || nearestAptTo(cx, cz, 0);
        let arrPick = arrSel === '=dep' ? apStart : (arrSel ? aptByCode(arrSel) : null);
        if (arrPick && arrPick !== apStart && !rwOk(arrPick.q, need)) { S._why += shortRw(arrPick.q.code); arrPick = null; }
        const apLand = arrPick || nearestAptTo(dest.x, dest.z) || apStart;
        if (!apStart) { note('No airports loaded yet — try again in a moment.'); S.mode = null; clearObj(); return; }
        const ap = apStart;
        /* takeoff from the threshold on the far side from the destination, on a runway inside the real OSM airfield */
        const away = Math.atan2(ap.q.x - dest.x, ap.q.z - dest.z);
        const rwT = pickRunway(ap.q.code, ap.q.x + Math.sin(away) * 2e5, ap.q.z + Math.cos(away) * 2e5);
        if (S.planeStyle === 'heli') {
          /* helicopters don't use runways: lift straight up from where you are and fly point to point */
          S.p.set(cx, 1.4, cz); S.hd = Math.atan2(dest.x - cx, dest.z - cz); S.rwLen = 0;
        } else if (rwT) {
          S.p.set(rwT.tx, 1.4, rwT.tz); S.hd = rwT.hd; S.rwLen = rwT.len;
        } else { S.p.set(ap.q.x, 1.4, ap.q.z); S.hd = Math.atan2(dest.x - ap.q.x, dest.z - ap.q.z); S.rwLen = 1500; }
        S.apt = ap.q.code; S.homeApt = ap.q.code;
        if (S.wx) { S.wx.ox = S.p.x; S.wx.oz = S.p.z; }
        S.landApt = (apLand && apLand.q.code) || ap.q.code;
        S.phase = S.planeStyle === 'heli' ? 'heliLift' : 'roll'; S.rollS = 0; clearGround();
        { const AP3 = window.HTS_AIRPORTS2; if (AP3 && AP3.clearTaxiLane) AP3.clearTaxiLane(); }
        S.trip0 = Math.hypot(dest.x - S.p.x, dest.z - S.p.z);
        /* flat map metres per real metre along this route, so speed / ETA match the real great-circle trip */
        S._todNote = 0; S.icK = S.wx && S.wx.km ? Math.max(0.3, S.trip0 / (S.wx.km * 1000)) : 1; S.icKNow = 1;
        S.flightT0 = performance.now();
        const cruiseKt = S.planeStyle === 'jet' ? 220 : 110;
        /* Cruise + takeoff + short orbit + short-final approach (matches planeEtaSec) */
        S.flightEta0 = S.trip0 / (cruiseKt * KT) + 28 + 22 + (S.planeStyle === 'jet' ? 55 : 85);
        S._ga = 0;
        if (opts.arrive) { /* arriving from another city on the world map: already airborne, inbound to the landing airport */
          S.p.set(opts.arrive.x, 3500 * FT, opts.arrive.z); S.hd = Math.atan2(dest.x - S.p.x, dest.z - S.p.z);
          S.v = 220 * KT; S.phase = 'cruise'; S.rwLen = 0;
        }
      } else {
        S.p.set(cx, 600, cz); S.hd = cam.theta + Math.PI; S.v = 55; S.phase = 'free';
      }
      spawnVehicle();
      if (mode === 'tour') spawnEscorts();
      if (opts.arrive) startLanding();
    }
    S.hudHid = false;
    startTourAudio();
    renderHud(); hud.classList.add('on'); hud.classList.remove('hid'); hudPeek.classList.remove('on'); applyHudPos();
    pad.classList.toggle('on', mode === 'free' && matchMedia('(pointer:coarse)').matches);
    if (mode === 'tour' && kind === 'plane' && opts.arrive) {
      note(acName() + ' ' + S.fromTxt + ' · approach to ' + S.landApt + '.');
    } else if (mode === 'tour' && kind === 'plane') {
      note(S.planeStyle === 'heli' ? acName() + ' lifting off from your location → ' + dest.n + '. ' + destBlurb(dest)
        : acName() + ' departing ' + S.apt + ' → ' + dest.n + ' · land at ' + S.landApt + (S._why || '') + '. ' + destBlurb(dest));
    } else if (mode === 'tour') {
      note('Driving to ' + dest.n + ' · ' + destBlurb(dest));
    } else {
      note((kind === 'car' ? 'Free drive (W/S, A/D)' : 'Free flight (W/S pitch, A/D bank)') + ' · starting from ' + S.fromTxt + '.');
    }
    if (mode === 'tour' && !S.musicOn) setTimeout(() => { if (S.mode) nudgeMusicHint(); }, 9000);
  }
  /* airport ground crew: a yellow FOLLOW ME car leads the plane along the taxi route, then a marshaller
     with lit wands and a tug wait at the stand (like IAH/HOU ramp ops). Low-poly, 1 group, removed when done. */
  const ground = { g: null, car: null, man: null, tug: null, t: 0 };
  function groundMat(c, e) { return new THREE.MeshLambertMaterial({ color: c, emissive: e || 0x000000 }); }
  function buildGround() {
    const g = new THREE.Group();
    const car = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.9, 4.4), groundMat(0xf2c200)); body.position.y = 0.75; car.add(body);
    const cab = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.7, 2.2), groundMat(0x22262c)); cab.position.set(0, 1.5, -0.3); car.add(cab);
    const sign = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.5, 0.12), groundMat(0x111111, 0x222200)); sign.position.set(0, 2.1, -0.6); car.add(sign);
    const c2 = document.createElement('canvas'); c2.width = 128; c2.height = 40; const x = c2.getContext('2d');
    x.fillStyle = '#111'; x.fillRect(0, 0, 128, 40); x.fillStyle = '#ffd400'; x.font = 'bold 22px sans-serif'; x.textAlign = 'center'; x.fillText('FOLLOW ME', 64, 28);
    const sTex = new THREE.CanvasTexture(c2);
    for (const zz of [-0.67, -0.53]) { const f = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.45), new THREE.MeshBasicMaterial({ map: sTex })); f.position.set(0, 2.1, zz); if (zz > -0.6) f.rotation.y = Math.PI; car.add(f); }
    const bar = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.18, 0.3), new THREE.MeshBasicMaterial({ color: 0xffa000 })); bar.position.set(0, 1.95, 0.5); car.add(bar);
    car.userData.bar = bar; g.add(car);
    const man = new THREE.Group();
    const vest = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.8, 0.3), groundMat(0xff7a00)); vest.position.y = 1.2; man.add(vest);
    const legs = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.8, 0.25), groundMat(0x223040)); legs.position.y = 0.4; man.add(legs);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.17, 8, 6), groundMat(0x7a5236)); head.position.y = 1.78; man.add(head);
    const muffs = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.14, 0.14), groundMat(0x111111)); muffs.position.y = 1.8; man.add(muffs);
    const wandMat = new THREE.MeshBasicMaterial({ color: 0xff5a1a });
    man.userData.arms = [];
    for (const sx of [-1, 1]) {
      const arm = new THREE.Group(); arm.position.set(sx * 0.33, 1.55, 0);
      const a = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.6, 0.12), groundMat(0xff7a00)); a.position.y = 0.3; arm.add(a);
      const w = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.5, 6), wandMat); w.position.y = 0.82; arm.add(w);
      man.add(arm); man.userData.arms.push(arm);
    }
    man.visible = false; g.add(man);
    const tug = new THREE.Group();
    const tb = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.9, 5.2), groundMat(0xe8e8e2)); tb.position.y = 0.7; tug.add(tb);
    const tc = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.9, 1.1), groundMat(0x1d2228)); tc.position.set(0.5, 1.55, 1.6); tug.add(tc);
    const bar2 = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.15, 5), groundMat(0x333333)); bar2.position.set(0, 0.5, -4.6); tug.add(bar2);
    tug.visible = false; g.add(tug);
    scene.add(g);
    Object.assign(ground, { g, car, man, tug, t: 0 });
  }
  function clearGround() {
    if (!ground.g) return;
    scene.remove(ground.g);
    ground.g.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) { if (o.material.map) o.material.map.dispose(); o.material.dispose(); } });
    ground.g = ground.car = ground.man = ground.tug = null;
  }
  /* point `ahead` metres further along the taxi path from the plane */
  function alongPath(P, i, px, pz, ahead) {
    let ax = px, az = pz, left = ahead;
    for (let j = i; j < P.length; j++) {
      const d = Math.hypot(P[j].x - ax, P[j].z - az);
      if (d >= left) { const f = left / d; return { x: ax + (P[j].x - ax) * f, z: az + (P[j].z - az) * f, h: Math.atan2(P[j].x - ax, P[j].z - az), end: false }; }
      left -= d; ax = P[j].x; az = P[j].z;
    }
    const n = P.length, h = n > 1 ? Math.atan2(P[n - 1].x - P[n - 2].x, P[n - 1].z - P[n - 2].z) : 0;
    return { x: ax, z: az, h, end: true };
  }
  function updateGround(dt) {
    if (!ground.g) return;
    ground.t += dt;
    const car = ground.car;
    if (car) car.userData.bar.material.color.setHex(Math.sin(ground.t * 9) > 0 ? 0xffb000 : 0x553300);
    if (S.phase === 'taxi' && S.taxi) {
      const P = S.taxi.path, jet = S.planeStyle === 'jet' || S.planeStyle === 'c130' || S.planeStyle === 'b2';
      const lead = alongPath(P, S.taxi.i, S.p.x, S.p.z, (jet ? 70 : 45));
      if (lead.end) {
        /* near the stand: the car pulls aside and the marshaller takes over */
        const ox = Math.cos(lead.h) * 28, oz = -Math.sin(lead.h) * 28;
        car.position.x += (lead.x + ox - car.position.x) * Math.min(1, dt * 0.8); car.position.z += (lead.z + oz - car.position.z) * Math.min(1, dt * 0.8);
      } else {
        car.position.x += (lead.x - car.position.x) * Math.min(1, dt * 2.5); car.position.z += (lead.z - car.position.z) * Math.min(1, dt * 2.5);
        let dh = lead.h - car.rotation.y; while (dh > Math.PI) dh -= 2 * Math.PI; while (dh < -Math.PI) dh += 2 * Math.PI;
        car.rotation.y += dh * Math.min(1, dt * 3);
      }
      const end = P[P.length - 1], prev = P[Math.max(0, P.length - 2)], hEnd = Math.atan2(end.x - prev.x, end.z - prev.z);
      const standD = Math.hypot(end.x - S.p.x, end.z - S.p.z);
      ground.man.visible = standD < 400;
      ground.man.position.set(end.x + Math.sin(hEnd) * (jet ? 26 : 12), 0.2, end.z + Math.cos(hEnd) * (jet ? 26 : 12));
      ground.man.rotation.y = hEnd + Math.PI;
      /* "come ahead" signal: both wands sweep up and back */
      const sw = 1.2 + Math.sin(ground.t * 4) * 0.9;
      ground.man.userData.arms[0].rotation.z = sw; ground.man.userData.arms[1].rotation.z = -sw;
    } else if (S.phase === 'parked') {
      /* "stop" (wands crossed), then the follow-me car leaves and the tug hooks up at the nose */
      ground.man.userData.arms[0].rotation.z = 2.6; ground.man.userData.arms[1].rotation.z = -2.6;
      if (!ground.tug.visible) {
        ground.tug.visible = true; ground.parkT = ground.t;
        const jet = S.planeStyle === 'jet' || S.planeStyle === 'c130' || S.planeStyle === 'b2';
        ground.tug.position.set(S.p.x + Math.sin(S.hd) * (jet ? 30 : 9), 0.2, S.p.z + Math.cos(S.hd) * (jet ? 30 : 9));
        ground.tug.rotation.y = S.hd;
      }
      car.position.x += Math.sin(car.rotation.y) * 9 * dt; car.position.z += Math.cos(car.rotation.y) * 9 * dt;
      if (ground.t - ground.parkT > 25) car.visible = false;
    } else clearGround();
  }
  function stop() {
    S.mode = null; S.hudHid = false; clearObj(); clearGround();
    { const T = getTraffic && getTraffic(); if (T && T.setEgo) T.setEgo(null); }
    { const AP3 = window.HTS_AIRPORTS2; if (AP3 && AP3.clearTaxiLane) AP3.clearTaxiLane(); }
    audio.stop();
    try { music.clearDriverPin(); } catch (e) { /* ignore */ }
    music.stop();
    hud.classList.remove('on', 'hid'); hudPeek.classList.remove('on');
    pad.classList.remove('on'); dash.classList.remove('on', 'carOn'); window._followOff = { x: 0, z: 0 };
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
  function cruiseMps(ff, x, z) {
    if (S.cruise) return S.cruise * MPH;
    const limit = Math.max(20, ff || 45);
    /* open highway / other cities on an intercity drive: no Houston rush hour or Houston probe data */
    if (S.icDrive && x != null && Math.hypot(x - 60, z - 60) > 60000) return limit * 0.97 * MPH;
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
  /* Lanes: 0 = curb (right) lane … ln-1 = median lane. Route points sit in the median lane (buildPath),
     so the car is shifted right by (ln-1-lane)·lw along the route's right-hand normal (lx, lz). */
  function laneClear(T, x, z, hd) {
    if (!T || !T.active) return true;
    const fx = Math.sin(hd), fz = Math.cos(hd);
    for (const c of T.active) {
      if (x < c.x0 - 40 || x > c.x1 + 40 || z < c.z0 - 40 || z > c.z1 + 40 || !c.lanes) continue;
      for (const lane of c.lanes) for (const car of lane) {
        if (car._px == null) continue;
        const dx = car._px - x, dz = car._pz - z, along = dx * fx + dz * fz;
        if (along < -14 || along > 22) continue;
        if (Math.abs(dx * fz - dz * fx) < 2 && (car._fx * fx + car._fz * fz) > 0.5) return false;
      }
    }
    return true;
  }
  function exitAhead(P, i, dist) {
    const s0 = P[i].s, h0 = P[i].h || '';
    for (let j = i + 1; j < P.length && P[j].s - s0 < dist; j++) {
      const h = P[j].h || '';
      if (h !== h0 && (/_link$/.test(h) || !/^(motorway|trunk)/.test(h))) return true;
    }
    return false;
  }
  /* car horn: two detuned sawtooth tones through a low-pass, like a dual-note car horn (Web Audio, no files) */
  let hornCtx = null;
  /* tap the steering-wheel hub to honk (like a real car) */
  document.addEventListener('pointerdown', (e) => { if (S.kind === 'car' && e.target && e.target.closest && e.target.closest('#dHorn')) { horn(); e.preventDefault(); } });
  function horn() {
    if (S.kind !== 'car' || S.soundOn === false) return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
      const ac = hornCtx || (hornCtx = new AC()); if (ac.state === 'suspended') ac.resume();
      const t = ac.currentTime, g = ac.createGain(), lp = ac.createBiquadFilter();
      lp.type = 'lowpass'; lp.frequency.value = 1800;
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.22, t + 0.02); g.gain.setValueAtTime(0.22, t + 0.42); g.gain.linearRampToValueAtTime(0, t + 0.5);
      for (const f of [415, 523]) { const o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; o.connect(lp); o.start(t); o.stop(t + 0.52); }
      lp.connect(g); g.connect(ac.destination);
    } catch (e) { /* ignore */ }
  }
  function laneStep(T, P, o, dt, v0, gap, lv) {
    const ln = Math.max(1, o.ln || 1), lw = o.lw || 3.5;
    S._ln = ln;
    /* honk once when a slower car cuts in close ahead */
    if ((S._hornT = (S._hornT || 0) - dt) <= 0 && gap < 9 && S.v > 7 && lv < S.v * 0.6) { horn(); S._hornT = 15; }
    if (S.lane == null) { S.lane = ln >= 3 ? 1 : 0; S.latCur = (ln - 1 - S.lane) * lw; S._lcT = 3; S._laneManT = 0; }
    if (S.lane > ln - 1) S.lane = ln - 1;
    S._lcT = (S._lcT || 0) - dt; S._laneManT = Math.max(0, (S._laneManT || 0) - dt);
    const remain = S.remain != null ? S.remain : 1e9;
    const at = (k) => [o.x + o.lx * (ln - 1 - k) * lw, o.z + o.lz * (ln - 1 - k) * lw];
    if (remain < 140) S.lane = 0; /* destination: stop in the kerb-side lane, centred */
    else if (S.lane < 0) S.lane = 0;
    else if (S._lcT <= 0 && S.v > 4 && ln > 1) {
      S._lcT = 1;
      const mustRight = remain < 900 || exitAhead(P, o.i, 700);
      if (mustRight && S.lane > 0) { const q = at(S.lane - 1); if (laneClear(T, q[0], q[1], S.hd)) { S.lane--; S._lcT = 4; } }
      else if (!S._laneManT && !mustRight) {
        if (gap < 80 && lv < v0 * 0.8 && S.lane < ln - 1) {
          const q = at(S.lane + 1);
          if (laneClear(T, q[0], q[1], S.hd) && leaderAhead(T, q[0], q[1], S.hd, 160)[0] > gap + 25) { S.lane++; S._lcT = 6; }
        } else if (S.lane > 0 && gap > 120) {
          const q = at(S.lane - 1);
          if (laneClear(T, q[0], q[1], S.hd) && leaderAhead(T, q[0], q[1], S.hd, 160)[0] > 120) { S.lane--; S._lcT = 8; }
        }
      }
    }
    /* the offset is measured from the route's lane line, which itself jumps at every road change (freeway -> 1-lane ramp):
       re-target instantly there and always clamp to the paved lanes, so the car can never slide off the road */
    const hi = (ln - 1) * lw; /* never past the centre of the kerb-side lane */
    const tgt = Math.max(0, Math.min(hi, (ln - 1 - S.lane) * lw)), step = Math.max(0.6, lw / 3) * dt; /* ~3 s per lane */
    const cw = ln + ':' + lw.toFixed(2) + ':' + (o.name || '');
    let prev = Math.max(0, Math.min(hi, S.latCur || 0));
    if (S._lcw !== cw) { if (S._lcw != null) prev = tgt; S._lcw = cw; }
    S.latCur = prev + Math.max(-step, Math.min(step, tgt - prev));
    S.latYaw = S.v > 1 ? Math.atan2(-(S.latCur - prev) / Math.max(dt, 1e-3), S.v) : 0;
    S.p.x += o.lx * S.latCur; S.p.z += o.lz * S.latCur;
  }
  const isFwy = (h) => /^(motorway|trunk)/.test(h || '');
  function localNear(T, d) {
    return nearestCwList(T.carriageways, d.x, d.z, 900, 40, false).some((e) => !e.c.link && !isFwy(e.c.h));
  }
  /* the route was planned before the destination's streets had loaded and ends on a freeway: once close, re-plan the last
     stretch so the car takes the exit and parks at the curb on a street next to the place */
  function fixFinalLeg(T) {
    const P = S.route, e = P[P.length - 1];
    if (S.leg !== 'out' || !S.dest || !isFwy(e.h) || S._ffTry > 8) return;
    if ((S._ffT = (S._ffT || 0) - 1) > 0) return;
    S._ffT = 90; S._ffTry = (S._ffTry || 0) + 1;
    const P2 = findRoute(T, S.p.x, S.p.z, S.dest.x, S.dest.z, { local: true });
    if (!P2 || P2.length < 2 || isFwy(P2[P2.length - 1].h)) { S._ffWhy = P2 ? 'fwy-end' : 'no-route'; return; }
    const q0 = P2[0], q1 = P2[Math.min(P2.length - 1, 3)];
    if (Math.hypot(q0.x - S.p.x, q0.z - S.p.z) > 40) { S._ffWhy = 'far-start'; return; }
    if (Math.sin(S.hd) * (q1.x - q0.x) + Math.cos(S.hd) * (q1.z - q0.z) < 0.3 * Math.hypot(q1.x - q0.x, q1.z - q0.z)) { S._ffWhy = 'wrong-way'; return; }
    const end2 = P2[P2.length - 1];
    if (end2.s > S.remain * 2 + 2500) { S._ffWhy = 'too-long ' + Math.round(end2.s); return; }
    S._ffWhy = 'ok';
    S.route = P2; S.s = 0; S._si = 0; S.tripLen = end2.s; S._eta = null; S._etaF = 0;
    note('Taking the exit for ' + (S.dest.n || 'your destination') + ' · parking on ' + (end2.name || 'a side street') + '.');
  }
  function stepCar(dt) {
    const T = getTraffic && getTraffic();
    if (T && T.setEgo) T.setEgo(S.p.x, S.p.z, Math.abs(S.v));
    const h0 = S.hd;
    if (S.mode === 'tour') {
      if (T && !S.icDrive && S.phase === 'drive' && S.remain != null && S.remain < 3000) fixFinalLeg(T);
      const P = S.route, end = P[P.length - 1].s;
      sampleAt(P, S.s, o);
      S.limit = o.ff;
      /* live-traffic speed target refreshed twice a second, not every frame */
      if (!S._cm || (S._cmT -= dt) <= 0 || S._cm.ff !== o.ff || S._cm.cr !== S.cruise) { S._cm = { v: cruiseMps(o.ff, o.x, o.z), ff: o.ff, cr: S.cruise }; S._cmT = 0.5; }
      const v0 = Math.min(S._cm.v, curveLimit(P, o.i));
      let [gap, lv] = leaderAhead(T, S.p.x, S.p.z, S.hd, 200);
      if (end - S.s - 2 < gap) { gap = Math.max(0.1, end - S.s - 2); lv = 0; }
      const acc = Math.max(-7, idm(S.v, v0, gap, lv));
      S.v = Math.max(0, S.v + acc * dt);
      const ds = S.v * dt; S.s = Math.min(end, S.s + ds * (o.k || 1)); S.odo += ds; /* intercity: map metres per real metre */
      sampleAt(P, S.s, o);
      S.p.set(o.x, o.y, o.z);
      laneStep(T, P, o, dt, v0, gap, lv);
      let d = o.hd - S.hd; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; S.hd += d * Math.min(1, dt * 8);
      S.info = o.ref || o.name || '';
      S.roadName = o.name || '';
      S.remain = o.rr != null ? Math.max(0, o.rr) : end - S.s;
      if (S.remain < 3 && S.v < 0.5 && S.phase === 'drive') {
        if (S.leg === 'out') { S.phase = 'arrived'; S.waitT = 0; const dm = S.dest && S.dest.x != null ? Math.round(Math.hypot(S.dest.x - S.p.x, S.dest.z - S.p.z)) : null; note('Arrived · parked at the curb' + (S.roadName ? ' on ' + S.roadName : '') + (dm != null ? ', about ' + dm + ' m from ' : ' by ') + S.dest.n + ' — ' + destBlurb(S.dest) + ' Heading back in a few seconds.'); }
        else { S.phase = 'home'; note('Back where you started. Surprise me for another Houston run — or tap Music.'); }
      }
      if (S.phase === 'arrived' && !S.icDrive && (S.waitT += dt) > 6) {
        const P2 = T && findRoute(T, S.p.x, S.p.z, S.origin.x, S.origin.z, { local: true });
        if (P2) { S.route = P2; S.s = 0; S._si = 0; S._eta = null; S._etaF = 0; S.leg = 'back'; S.phase = 'drive'; S.tripLen = P2[P2.length - 1].s; note('Driving back to where you started.'); }
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
      /* Street / limit filled by CarPlay probe in drawDash (throttled) */
    }
    let dh = S.hd - h0; while (dh > Math.PI) dh -= 2 * Math.PI; while (dh < -Math.PI) dh += 2 * Math.PI;
    S.yawRate += ((dt > 0 ? dh / dt : 0) - S.yawRate) * Math.min(1, dt * 6);
    S.obj.position.copy(S.p); S.obj.rotation.set(0, S.hd + (S.mode === 'tour' ? S.latYaw || 0 : 0), 0);
  }
  /* time to go along the rest of the route at the speed you would actually hold (cruise, limit, curves) */
  /* landing runway at an airport: longest OSM runway, landing in the direction we arrive from */
  /* real painted designator from the OSM ref ("15L/33R"), falling back to the true-heading number */
  function rwName(r, num) {
    const parts = String(r.ref || '').split('/');
    let best = null, bd = 99;
    for (const t of parts) { const m = /^\s*(\d{1,2})([LRC]?)\s*$/.exec(t); if (!m) continue; let d = Math.abs(+m[1] - num) % 36; d = Math.min(d, 36 - d); if (d < bd) { bd = d; best = m[1].padStart(2, '0') + m[2]; } }
    return best && bd <= 3 ? best : String(num).padStart(2, '0');
  }
  function pickRunway(code, fx, fz) {
    const ap = aptList().find((q) => q.code === code); if (!ap) return null;
    if (ap.rws && ap.rws.length) {
      const rws0 = ap.rws.slice();
      const len0 = (r) => Math.hypot(r.p[r.p.length - 2] - r.p[0], r.p[r.p.length - 1] - r.p[1]);
      rws0.sort((a, b) => len0(b) - len0(a));
      const r = rws0[0]; let ax = r.p[0], az = r.p[1], bx = r.p[r.p.length - 2], bz = r.p[r.p.length - 1];
      if (Math.hypot(bx - fx, bz - fz) < Math.hypot(ax - fx, az - fz)) [ax, az, bx, bz] = [bx, bz, ax, az];
      const hd = Math.atan2(bx - ax, bz - az), num = Math.round(((((180 - hd * 180 / Math.PI) % 360) + 360) % 360) / 10) || 36;
      return { code, tx: ax, tz: az, ex: bx, ez: bz, hd, len: len0(r), name: rwName(r, num) };
    }
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
    return { code, tx: ax, tz: az, ex: bx, ez: bz, hd, len: len(r), name: rwName(r, num) };
  }
  function startLanding(opts) {
    if (S.kind !== 'plane' || S.mode !== 'tour' || /toFaf|final|rollout|taxi|parked/.test(S.phase)) return false;
    if (S.planeStyle === 'heli') { if (/^heli(Lift|Cruise)$/.test(S.phase)) S.phase = 'heliCruise', S.heliLandNow = true; return true; }
    const force = !!(opts && opts.force);
    /* Respect the Land-at dropdown; only auto-pick nearest-to-dest when none chosen */
    if (!S.landApt && S.dest) {
      const near = nearestAptTo(S.dest.x, S.dest.z);
      if (near) S.landApt = near.q.code;
    }
    const code = S.landApt || S.homeApt;
    { const lsel = document.querySelector('#tourHud [data-land]'); if (lsel && code && lsel.value !== code) lsel.value = code; }
    const rw = pickRunway(code, S.p.x, S.p.z);
    if (!rw) { note('No runway data for ' + code + ' — pick another airport.'); return false; }
    S.rw = rw; S.appT = 0;
    const distRw = Math.hypot(rw.tx - S.p.x, rw.tz - S.p.z);
    /* After landmark orbit (or Land now) we're already near the field — join short final.
       The old always-toFaf path flew a 9 km intercept and looked like a respawn. */
    if (distRw < 9500 || force) {
      S.landNow = true;
      S.phase = 'final';
      S.flare = 0;
      note('Short final · ' + rw.code + ' runway ' + rw.name + '.');
    } else {
      S.landNow = force;
      S.phase = 'toFaf';
      note('Landing at ' + rw.code + ' runway ' + rw.name
        + (S.dest ? ' (for ' + S.dest.n + ')' : '') + '.');
    }
    return true;
  }
  /* static drive time along the route (limits, curves, cruise) — built once per route, then O(1) lookups */
  function routeTimes(P) {
    if (P._tf && P._tfCr === S.cruise) return P._tf;
    const tf = new Float64Array(P.length), hf = houDriveFactor();
    for (let i = 1; i < P.length; i++) {
      const lim = Math.max(20, P[i - 1].ff || 45);
      /* Houston rush-hour factor only applies on Houston's own roads, not the open highway between cities */
      const hfi = S.icDrive && Math.hypot(P[i - 1].x - 60, P[i - 1].z - 60) > 60000 ? 0.97 : hf;
      let mph = S.cruise ? S.cruise : lim * hfi;
      if (!S.cruise && lim <= 45) mph = Math.min(mph, lim * Math.max(0.42, hf - 0.05));
      const v = Math.max(4.5, Math.min(Math.max(8, Math.min(lim + 2, mph)) * MPH, curveLimit(P, i - 1)));
      tf[i] = tf[i - 1] + (P[i].s - P[i - 1].s) / (P[i - 1].k || 1) / v;
    }
    P._tf = tf; P._tfCr = S.cruise;
    return tf;
  }
  /* live traffic slow-down on the road ahead, resampled every 3 s and eased (no per-frame jumps) */
  function trafficFactor(P, tf) {
    const now = performance.now();
    if (S._etaFT && now - S._etaFT < 3000 && S._etaF) return S._etaF;
    S._etaFT = now;
    let tb = 0, tl = 0;
    const i0 = S._si || 0, n = 14, span = Math.max(20, Math.round((P.length - i0) / n));
    for (let k = 0, i = i0; k < n && i < P.length - 1; k++, i += span) {
      const j = Math.min(P.length - 1, i + span), dt0 = tf[j] - tf[i];
      if (dt0 <= 0) continue;
      const vb = (P[j].s - P[i].s) / dt0, vl = Math.max(3, Math.min(vb, cruiseMps(P[i].ff, P[i].x, P[i].z)));
      tb += dt0; tl += dt0 * vb / vl;
    }
    const f = tb > 0 ? Math.min(3, Math.max(1, tl / tb)) : 1;
    S._etaF = S._etaF ? S._etaF + (f - S._etaF) * 0.35 : f;
    return S._etaF;
  }
  function etaSec() {
    const P = S.route; if (!P) return null;
    const rem = Math.max(0, P[P.length - 1].s - S.s);
    if (rem < 2) return 0;
    const now = performance.now();
    if (S._eta != null && S._etaT && now - S._etaT < 250) return S._eta;
    const tf = routeTimes(P), i = Math.min(P.length - 2, S._si || 0), a = P[i], b = P[i + 1];
    const tHere = tf[i] + (tf[i + 1] - tf[i]) * Math.min(1, Math.max(0, (S.s - a.s) / ((b.s - a.s) || 1)));
    let raw = (tf[P.length - 1] - tHere) * trafficFactor(P, tf);
    /* last few hundred metres: what you're actually doing matters most */
    if (rem < 300) raw = raw * 0.5 + 0.5 * rem / Math.max(4.5, S.v);
    const dtE = S._etaT ? Math.min(2, (now - S._etaT) / 1000) : 1; S._etaT = now;
    if (S._eta == null || Math.abs(raw - S._eta) > 180) S._eta = raw;
    else S._eta += (raw - S._eta) * Math.min(1, dtE * 0.6);
    S._eta = Math.max(0, S._eta);
    return S._eta;
  }
  function stepPlane(dt) {
    let wantHd = S.hd, wantY = S.p.y, wantV = S.v;
    const jet = S.acClass === 'jet';
    const icx = !!(S.wx && S.mode === 'tour');
    const cruiseKt = icx ? (S.supersonic && /^(jet|fighter)$/.test(S.planeStyle) && S.p.y > 29000 * FT ? 1150 : jet ? 480 : 260) : jet ? 220 : 110, climbKt = icx ? (jet ? 250 : 160) : jet ? 160 : 95, rotateKt = jet ? 130 : 55, cruiseAlt = icx ? S.wx.alt : jet ? 3500 : 1500;
    if (S.mode === 'tour') {
      const D = S.dest, dx = D.x - S.p.x, dz = D.z - S.p.z, dist = Math.hypot(dx, dz), brg = Math.atan2(dx, dz);
      if (icx) {
        /* real-scale near both airports, map-scale en route (the flat map stretches long routes) */
        /* real great-circle metres left (map position -> lat/lng); map step = real step x (map left / real left),
           so the HUD distance and ETA are the real trip; true scale within ~60 km of both airports */
        const fromO = Math.hypot(S.p.x - S.wx.ox, S.p.z - S.wx.oz);
        S.icReal = S.wx.tll ? icRealLeft(S.p.x, S.p.z, S.wx.tll) : dist / S.icK;
        const w = Math.min(1, Math.max(0, Math.min(fromO, dist) - 60000) / 150000);
        S.icKNow = 1 + (dist / Math.max(1, S.icReal) - 1) * w;
      }
      const rr = icx ? (dist < 210000 ? dist + (S.icReal - dist) * Math.min(1, Math.max(0, dist - 60000) / 150000) : S.icReal) : dist, tod = Math.max(0, S.p.y / FT - 3000) / 1000 * 3 * 1852 + 30000;
      if (S.phase === 'roll') {
        S.v += (jet ? 4.5 : 2.2) * dt; S.rollS += S.v * dt; S.p.y = 1.4; S.vy = 0;
        if (S.v >= rotateKt * KT) S.phase = 'climb';
      } else if (S.phase === 'taxi') {
        /* taxi at ~15–20 kt along the OSM taxiway route (green lane) to the apron spot, slowing for turns and the stop */
        const T2 = S.taxi, P = T2.path;
        let tgt = P[T2.i];
        while (T2.i < P.length - 1 && Math.hypot(tgt.x - S.p.x, tgt.z - S.p.z) < Math.max(9, S.v * 2.2)) tgt = P[++T2.i];
        const tdx = tgt.x - S.p.x, tdz = tgt.z - S.p.z, td = Math.hypot(tdx, tdz);
        let rem = td;
        for (let j = T2.i; j < P.length - 1; j++) rem += Math.hypot(P[j + 1].x - P[j].x, P[j + 1].z - P[j].z);
        const wrapA = (a) => { while (a > Math.PI) a -= 2 * Math.PI; while (a < -Math.PI) a += 2 * Math.PI; return a; };
        const dH = wrapA(Math.atan2(tdx, tdz) - S.hd);
        let turn = 0;
        if (T2.i < P.length - 1 && td < 60) { const b = P[T2.i + 1]; turn = Math.abs(wrapA(Math.atan2(b.x - tgt.x, b.z - tgt.z) - Math.atan2(tdx, tdz))); }
        S.hd += Math.max(-0.45 * dt, Math.min(0.45 * dt, dH * 1.6));
        const wantT = rem < 40 ? Math.max(1.2, rem * 0.12) : Math.abs(dH) > 0.6 || turn > 0.9 ? 3.5 : turn > 0.4 ? 5.5 : rem > 300 && turn < 0.2 ? 11 : 8.5;
        S.v += Math.max(-1.8 * dt, Math.min(1.0 * dt, wantT - S.v));
        S.p.y += (1.4 - S.p.y) * Math.min(1, dt * 4); S.vy = 0;
        S.pitch += (0 - S.pitch) * Math.min(1, dt * 3); S.roll += (0 - S.roll) * Math.min(1, dt * 3);
        S.remain = rem;
        if ((T2.i >= P.length - 1 && td < 5) || (T2.t = (T2.t || 0) + dt) > 600) {
          S.phase = 'parked'; S.v = 0; S.remain = 0;
          const AP3 = window.HTS_AIRPORTS2; if (AP3 && AP3.clearTaxiLane) AP3.clearTaxiLane();
          note('Parked at the gate on the ' + (S.rw ? S.rw.code : S.landApt) + ' apron (near ' + (S.dest ? S.dest.n : 'destination') + ') — engines off, tug connected. Pick another place to fly.');
        }
      } else if (S.phase === 'parked' && S.taxi) {
        /* parked at the stand after taxiing — hold there (the runway roll-out logic would drag it back to the centreline) */
        S.v = 0; S.vy = 0; S.p.y += (1.4 - S.p.y) * Math.min(1, dt * 4);
        S.pitch += (0 - S.pitch) * Math.min(1, dt * 3); S.roll += (0 - S.roll) * Math.min(1, dt * 3);
      } else if (S.phase === 'rollout' || S.phase === 'parked') {
        if (S.wx && !S._flyOn && S.v < 2) { S._flyOn = true; renderHud(); }
        const rw = S.rw;
        if (rw) {
          const ux = Math.sin(rw.hd), uz = Math.cos(rw.hd);
          /* Ease onto centerline instead of snapping */
          const along = (S.p.x - rw.tx) * ux + (S.p.z - rw.tz) * uz;
          const xt = (S.p.x - rw.tx) * uz - (S.p.z - rw.tz) * ux;
          S.p.x -= xt * Math.min(1, dt * 1.8) * uz;
          S.p.z += xt * Math.min(1, dt * 1.8) * ux;
          let dHd = rw.hd - S.hd; while (dHd > Math.PI) dHd -= 2 * Math.PI; while (dHd < -Math.PI) dHd += 2 * Math.PI;
          S.hd += dHd * Math.min(1, dt * 2.2);
          /* Forward motion comes from shared hv step below — avoid double-speed jump */
          S.p.y += (1.4 - S.p.y) * Math.min(1, dt * 4);
          S.vy *= Math.max(0, 1 - dt * 6);
          S.rollT = (S.rollT || 0) + dt;
          S.pitch += ((S.phase === 'rollout' && S.rollT < 2.5 ? 0.055 : 0.0) - S.pitch) * Math.min(1, dt * 1.6);
          S.roll += (0 - S.roll) * Math.min(1, dt * 3);
          S._needDecel = S.v * S.v / (2 * Math.max(5, rw.len * 0.92 - along));
          /* never roll off the end: hard braking near the end, full stop before the last 25 m */
          if (S.phase === 'rollout' && along > rw.len - 25) S.v = 0;
        } else {
          S.p.y += (1.4 - S.p.y) * Math.min(1, dt * 4);
        }
        {
          /* nose-wheel down first, then brakes/reversers, easing off as we slow to taxi speed */
          const rt = S.rollT || 0, base = rt < 2 ? 0.8 : jet ? (S.v > 20 ? 2.1 : 1.5) : 1.3;
          S.v = Math.max(0, S.v - Math.max(base, S.rw && S.phase === 'rollout' ? (S._needDecel || 0) * 1.15 : 0) * dt);
        }
        const AP2 = window.HTS_AIRPORTS2, spot = S.phase === 'rollout' && S.v < 9 && S.taxiPark !== false && (S.planeStyle === 'jet' || S.planeStyle === 'c130' || S.planeStyle === 'b2') && AP2 && AP2.nearestSpot ? AP2.nearestSpot(S.p.x, S.p.z, 3500) : null;
        if (spot) {
          const tp = AP2.taxiToPark ? AP2.taxiToPark(S.p.x, S.p.z, S.hd, 3500) : null, pk = (tp && tp.spot) || spot, route = tp && tp.route;
          S.phase = 'taxi'; S.taxi = { x: pk.x, z: pk.z, t: 0, i: route ? 1 : 0, path: route || [{ x: pk.x, z: pk.z }] };
          if (route && AP2.showTaxiLane) AP2.showTaxiLane(route);
          clearGround(); if (route && route.length > 2) { buildGround(); const st = alongPath(route, 1, S.p.x, S.p.z, 90); ground.car.position.set(st.x, 0.2, st.z); ground.car.rotation.y = st.h; }
          note('Landed ' + (S.rw ? S.rw.code + ' runway ' + S.rw.name : S.landApt) + ' — vacating the runway, taxiing to parking.');
        } else if (S.phase === 'rollout' && S.v < 0.45) {
          S.phase = 'parked'; S.v = 0; S.vy = 0; S.pitch = 0; S.roll = 0;
          note('Landed at ' + (S.rw ? S.rw.code : S.landApt) + ' (near ' + (S.dest ? S.dest.n : 'destination') + ')'
            + (S.rw ? ', runway ' + S.rw.name : '') + '. Pick another place to fly.');
        }
      } else if (/^heli(Lift|Cruise|Land|Down|Parked)$/.test(S.phase)) {
        /* helicopter: vertical lift-off, direct ~115 kt cruise at ~1000 ft, slow approach, vertical touchdown next to the destination */
        const wrapH = (a) => { while (a > Math.PI) a -= 2 * Math.PI; while (a < -Math.PI) a += 2 * Math.PI; return a; };
        const ease = (cur, tgt, r) => cur + Math.max(-r * dt, Math.min(r * dt, tgt - cur));
        const padD = Math.max(0, dist - 45);
        let vy = 0, wantVH = 0, turn = 1;
        if (S.phase === 'heliLift') {
          vy = 5; wantVH = S.p.y > 25 ? 12 : 0; turn = S.p.y > 25 ? 1 : 0;
          if (S.p.y > 70) S.phase = 'heliCruise';
        } else if (S.phase === 'heliCruise') {
          vy = Math.max(-6, Math.min(6, (300 - S.p.y) * 0.25)); wantVH = 59;
          if (padD < 1400) S.phase = 'heliLand';
        } else if (S.phase === 'heliLand') {
          /* glide down toward ~40 m (never climb on approach) and keep at least walking pace so it actually reaches the pad */
          const tgtY = Math.min(S.p.y, Math.max(40, padD * 0.18));
          vy = Math.max(-6, Math.min(0, (tgtY - S.p.y) * 0.3)); wantVH = padD < 8 ? 0 : Math.min(59, 2.5 + padD * 0.08);
          if (padD < 8 && S.v < 4) S.phase = 'heliDown';
        } else if (S.phase === 'heliDown') {
          vy = -Math.max(0.6, Math.min(4, (S.p.y - 1.4) * 0.35)); wantVH = 0; turn = 0;
          if (S.p.y <= 1.5) {
            S.phase = 'heliParked'; S.p.y = 1.4;
            note('Landed next to ' + (S.dest ? S.dest.n : 'the destination') + '. Pick another place to fly.');
          }
        } else { wantVH = 0; turn = 0; S.p.y = 1.4; }
        S.v = ease(S.v, wantVH, S.phase === 'heliLand' ? 2.2 : 3);
        const dH = wrapH(brg - S.hd), rate = turn ? Math.max(-0.35, Math.min(0.35, dH * 0.9)) : 0;
        S.hd += rate * dt;
        S.vy = vy; S.p.y = Math.max(1.4, S.p.y + vy * dt);
        S.pitch += ((S.v > 1 ? -Math.min(0.12, (wantVH - S.v) * 0.01 + S.v * 0.0012) : 0) - S.pitch) * Math.min(1, dt * 1.5);
        S.roll += (Math.atan(-rate * S.v / G) * 0.8 - S.roll) * Math.min(1, dt * 1.5);
      } else {
        const agl = S.p.y;
        if (S.phase === 'climb') {
          wantV = (icx && agl > 3000 ? cruiseKt * 0.8 : climbKt) * KT; wantY = cruiseAlt * FT; if (agl > 150) wantHd = brg;
          if (agl > (cruiseAlt - 100) * FT || (icx && rr < tod && agl > 600)) S.phase = 'cruise';
        }
        if (S.phase === 'cruise' && icx) {
          /* top of descent on a 3° path, then the normal Houston approach to the destination runway */
          const desc = rr < tod;
          wantV = (desc ? Math.max(250, Math.min(cruiseKt, 250 + (rr - 30000) / 400)) : cruiseKt) * KT;
          wantY = (desc ? Math.min(cruiseAlt, 3000 + Math.max(0, rr - 30000) / 5556 * 1000) : cruiseAlt) * FT; wantHd = brg;
          if (desc && !S._todNote) { S._todNote = 1; note('Top of descent · ' + Math.round(rr / 1609.344) + ' mi to ' + D.n + ' · approach to ' + S.landApt + '.'); }
          if (rr < 28000) startLanding();
        } else if (S.phase === 'cruise') {
          wantV = cruiseKt * KT; wantY = dist < (jet ? 6000 : 3500) ? Math.min(1000, cruiseAlt * 0.65) * FT : cruiseAlt * FT; wantHd = brg;
          if (dist < S.orbitR * 1.35) {
            /* keep the airport the user picked in Land at; only fall back to nearest when none was chosen */
            const near = !S.landApt && nearestAptTo(D.x, D.z);
            if (near) S.landApt = near.q.code;
            S.phase = 'orbit'; S.orbT = 0;
            note('Over ' + D.n + ' — ' + destBlurb(D) + ' Circling, then landing at ' + S.landApt + '.');
          }
        }
        if (S.phase === 'orbit') {
          /* Linger over the landmark so the flyby reads before approach */
          if ((S.orbT += dt) > 22) startLanding();
          wantV = (jet ? 140 : 95) * KT; wantY = 1000 * FT;
          const err = (dist - S.orbitR) / S.orbitR;
          wantHd = brg - Math.PI / 2 * (1 - Math.max(-0.8, Math.min(0.8, err)));
        }
        if (S.phase === 'toFaf' || S.phase === 'final') {
          const rw = S.rw, ux = Math.sin(rw.hd), uz = Math.cos(rw.hd);
          const aim = jet ? 200 : 120, ax = rw.tx + ux * aim, az = rw.tz + uz * aim;
          const along = (S.p.x - ax) * ux + (S.p.z - az) * uz, xt = (S.p.x - ax) * uz - (S.p.z - az) * ux;
          let hErr = S.hd - rw.hd; while (hErr > Math.PI) hErr -= 2 * Math.PI; while (hErr < -Math.PI) hErr += 2 * Math.PI;
          if (S.phase === 'final') S.appT = (S.appT || 0) + dt;
          if (S.phase === 'toFaf') {
            const distToRw = Math.hypot(rw.tx - S.p.x, rw.tz - S.p.z);
            const fafDist = S.landNow ? (jet ? 5500 : 3800) : (jet ? 7500 : 5000);
            const fx = rw.tx - ux * fafDist, fz = rw.tz - uz * fafDist;
            wantHd = Math.atan2(fx - S.p.x, fz - S.p.z);
            wantV = (jet ? 140 : 100) * KT; wantY = Math.max(800, Math.min(cruiseAlt, 1500)) * FT;
            const dFaf = Math.hypot(fx - S.p.x, fz - S.p.z);
            /* join at the fix (inside one turn radius, so it can't orbit it), or anywhere on the extended centreline heading in */
            if (dFaf < Math.max(700, S.v / 0.1 * 1.3) || (along < -1500 && Math.abs(xt) < -along * 0.3 && Math.abs(hErr) < 0.9)) {
              S.phase = 'final';
              S.flare = 0;
            }
            S.remain = distToRw;
          } else {
            /* Smooth final: glide path + flare, no teleport on touchdown */
            const kXt = S.landNow ? 0.0035 : 0.0025;
            /* steer back toward the centreline (+xt is right of it, so turn left) */
            wantHd = along < -6500 || Math.abs(xt) > 2500 ? Math.atan2(ax - S.p.x, az - S.p.z) : rw.hd - Math.max(-0.6, Math.min(0.6, xt * kXt));
            const lined = Math.abs(xt) < Math.max(120, -along * 0.35) && Math.abs(hErr) < 0.9;
            if (!lined && along > -1800 && S.p.y > 12 && !(S.flare > 0.05)) {
              /* too close to line up: fly back out to the fix instead of circling the runway */
              S.phase = 'toFaf'; S.landNow = true; S.flare = 0;
              note('Lining up · flying out to final for ' + rw.code + ' runway ' + rw.name + '.');
            }
            /* Soft lateral nudge toward centerline while still airborne */
            if (Math.abs(xt) < 220 && along > -4500) {
              S.p.x -= xt * Math.min(0.45, dt * 0.7) * uz;
              S.p.z += xt * Math.min(0.45, dt * 0.7) * ux;
            }
            const gsY = Math.max(1.4, (-along) * Math.tan(3 * Math.PI / 180) + 1.4);
            const flareH = jet ? 10 : 6;
            if ((S.p.y < flareH && along > -700) || along > -aim + 30) {
              S.flare = Math.min(1, (S.flare || 0) + dt * 0.9);
              wantV = (jet ? 84 : 58) * KT * (1 - 0.08 * S.flare);
              wantY = 1.4;
            } else {
              S.flare = Math.max(0, (S.flare || 0) - dt * 0.4);
              wantV = (jet ? 92 : 65) * KT;
              wantY = gsY;
            }
            S.remain = Math.max(0, Math.hypot(rw.tx - S.p.x, rw.tz - S.p.z));
            /* touchdown = wheels on the deck past the threshold; rollout eases any residual offset onto the centreline */
            if (S.p.y <= 1.5 && along > -aim - 200 && along < rw.len - aim && Math.abs(xt) < 120) {
              S.phase = 'rollout';
              S.landNow = false;
              S.flare = 0; S.rollT = 0;
              S.p.y = 1.4; S.vy = 0;
            } else if ((along > rw.len + 350 && S.p.y > 10) || (S.appT > 360 && !lined)) {
              /* Missed — one short go-around, then plant on second try */
              if (!S._ga) {
                S._ga = 1;
                S.landNow = true;
                S.phase = 'toFaf';
                S.flare = 0;
                note('Go-around · re-intercepting ' + rw.code + ' runway ' + rw.name + '.');
              } else {
                S.phase = 'parked';
                S.landNow = false;
                S.flare = 0;
                S.v = 0; S.vy = 0; S.pitch = 0; S.roll = 0;
                S.p.y = 1.4;
                S.p.x = rw.tx + ux * (rw.len * 0.35);
                S.p.z = rw.tz + uz * (rw.len * 0.35);
                S.hd = rw.hd;
                S.remain = 0;
                note('Landed at ' + rw.code + ' runway ' + rw.name + ' (near ' + (S.dest ? S.dest.n : 'destination') + '). Pick another place to fly.');
              }
            }
          }
        }
        if (S.phase !== 'rollout' && S.phase !== 'parked' && S.phase !== 'taxi') {
          let climbRate = (wantY - S.p.y) * (S.phase === 'final' ? 0.35 : S.phase === 'climb' ? 0.12 : 0.1);
          if (S.phase === 'final') {
            /* Cap sink so we don't slam into the deck */
            if ((S.flare || 0) > 0) {
              /* flare: sink decays with height down to a ~90 fpm touchdown, blended in as the flare builds */
              const flareRate = -Math.max(0.45, (S.p.y - 1.4) * 0.5);
              climbRate = climbRate + (flareRate - climbRate) * S.flare;
            }
            climbRate = Math.max(-3.6, Math.min(2.4, climbRate));
            S.vy += (climbRate - (S.vy || 0)) * Math.min(1, dt * 1.4);
            S.p.y = Math.max(1.4, S.p.y + S.vy * dt);
            /* hold the glide path while stabilised; the flare is flown on sink rate alone */
            if (!(S.flare > 0.05)) S.p.y += (wantY - S.p.y) * Math.min(1, dt * 0.6);
            if (S.p.y < 1.45) { S.p.y = 1.4; S.vy = Math.min(0, S.vy); }
          } else {
            climbRate = Math.max(icx && S.p.y > 900 ? -11 : -5, Math.min(icx && S.p.y > 300 ? 12.5 : S.phase === 'climb' ? 3.6 : 3.2, climbRate));
            S.vy += (climbRate - (S.vy || 0)) * Math.min(1, dt * 0.9);
            S.p.y = Math.max(1.4, S.p.y + S.vy * dt);
          }
          S.v += Math.max(-1.4 * dt, Math.min(1.8 * dt, wantV - S.v));
          let d = wantHd - S.hd; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI;
          const maxRate = S.phase === 'final' ? 0.08 : (S.landNow || S.phase === 'toFaf' ? 0.1 : 0.0524);
          const rate = Math.max(-maxRate, Math.min(maxRate, d * (S.phase === 'final' ? 0.7 : S.landNow ? 1.0 : 0.6)));
          S.hd += rate * dt;
          const wantRoll = Math.atan(-rate * S.v / G);
          const wantPitch = S.phase === 'final'
            ? Math.atan2(S.vy, Math.max(8, S.v)) + 0.02 + 0.06 * (S.flare || 0)
            : Math.atan2(S.vy, Math.max(8, S.v)) + 0.04;
          S.roll += (wantRoll - S.roll) * Math.min(1, dt * 1.6);
          S.pitch += (wantPitch - S.pitch) * Math.min(1, dt * 1.8);
        }
      }
      if (!/toFaf|final|rollout|parked/.test(S.phase)) S.remain = rr; else if (S.phase !== 'toFaf' && S.phase !== 'final') S.remain = 0;
      S.info = S.phase === 'roll' ? 'Takeoff roll · ' + S.apt : S.phase === 'climb' ? 'Climbing' : S.phase === 'cruise' ? 'Cruise → ' + D.n : S.phase === 'orbit' ? 'Arriving · ' + D.n
        : S.phase === 'toFaf' ? 'Approach · ' + S.rw.code : S.phase === 'final' ? 'Final · ' + S.rw.code + ' RWY ' + S.rw.name : S.phase === 'rollout' ? 'Landing rollout' : S.phase === 'taxi' ? 'Taxiing to parking · ' + (S.rw ? S.rw.code : S.landApt) : 'Landed · ' + (S.rw ? S.rw.code : S.landApt);
      if (/^heli/.test(S.phase)) S.info = S.phase === 'heliLift' ? 'Lifting off' : S.phase === 'heliCruise' ? 'Cruise → ' + D.n : S.phase === 'heliParked' ? 'Landed · ' + D.n : 'Landing · ' + D.n;
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
    const hv = S.v * Math.cos(S.pitch), hk = S.wx && S.mode === 'tour' ? S.icKNow || 1 : 1;
    S.p.x += Math.sin(S.hd) * hv * hk * dt; S.p.z += Math.cos(S.hd) * hv * hk * dt; S.odo += hv * dt;
    if (S.obj) {
      S.obj.position.copy(S.p); S.obj.position.y += groundClear(); S.obj.rotation.set(-S.pitch, S.hd, S.roll, 'YXZ');
      animGear(gearWanted(), dt);
      const prop = S.obj.userData && S.obj.userData.prop;
      if (prop) { if (S.planeStyle === 'heli') prop.rotation.x += dt * 40; else prop.rotation.z += S.v * dt * 2.4; }
      const rotor = S.obj.userData && S.obj.userData.rotor;
      if (rotor) rotor.rotation.y += dt * 32;
      const rb = S.obj.userData.rotorBlur;
      if (rb) { const ck = S.view === 'cockpit' || S.view === 'driver'; rb.disc.material.opacity = ck ? 0.2 : 0.12; rb.blade.opacity = ck ? 0.22 : 0.55; }
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
      /* Lock free-look target to the aircraft — only theta/phi/radius lerp in applyCam */
      cam.target.copy(camGoal.target);
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
      /* smooth the offset from the vehicle, not the world position: at jet/×10 speeds a world-space lerp lagged
         past its snap distance and alternated snap/lerp every frame (chase-cam jitter) */
      const want = v3.set(-fx * d * Math.cos(el), (car ? 1.2 : 1.5) + d * Math.sin(el), -fz * d * Math.cos(el));
      if (smooth.lengthSq() === 0) smooth.copy(want); else smooth.lerp(want, 1 - Math.exp(-Math.min(dt, 0.1) * (car ? 6 : 3)));
      camera.position.copy(S.p).add(smooth);
      look.set(S.p.x + fx * (car ? 6 : 14), S.p.y + (car ? 1.1 : 1.2), S.p.z + fz * (car ? 6 : 14));
      near = Math.max(0.3, d * 0.03);
    } else if (S.view === 'driver' || S.view === 'cockpit') {
      const lp = Math.max(-0.9, Math.min(0.9, pitchOff * 1.2)), ly = Math.max(-2.6, Math.min(2.6, yaw));
      if (car) {
        camera.position.copy(L(0.38, 1.22, 0.22));
        look.copy(L(Math.sin(-ly) * 30 + 0.38, 1.12 + Math.sin(lp) * 30, Math.cos(ly) * 30 + 0.5));
        /* the dashboard overlay is the cabin; hide the exterior so SUV/pickup/van hoods never block the road ahead,
           but keep the headlight pools/spots so the road ahead is lit at night */
        if (ob) { ob.visible = true; if (!ob.userData._shellOff) { for (const c of ob.children) c.visible = !!c.userData.lit; ob.userData._shellOff = true; } }
      } else if (S.acClass === 'jet') {
        /* Sit just forward of the nose so the fuselage doesn't clip the view; dash SVG frames the cockpit */
        const ud = ob.userData || {}, ckZ = ud.ckZ != null ? ud.ckZ : 17.6, ckY = ud.ckY != null ? ud.ckY : 0.9;
        camera.position.copy(L(0, ckY, ckZ));
        look.copy(L(Math.sin(-ly) * 90, ckY - 0.2 + Math.sin(lp) * 90, ckZ + Math.cos(ly) * 90));
        camera.up.set(0, 1, 0).applyQuaternion(ob.quaternion);
        if (ob) ob.visible = false;
      } else if (S.planeStyle === 'heli') {
        /* Bell 407 cockpit: pilot's eye under the canopy bubble (right seat), rotor overhead as a blur disc */
        camera.position.copy(L(0.32, 1.5, 1.25));
        look.copy(L(Math.sin(-ly) * 40 + 0.32, 1.3 + Math.sin(lp) * 40, 1.25 + Math.cos(ly) * 40));
        camera.up.set(0, 1, 0).applyQuaternion(ob.quaternion);
        if (ob) ob.visible = true;
      } else {
        /* Cessna cabin — eye height behind the windshield */
        camera.position.copy(L(0, 0.95, 2.05));
        look.copy(L(Math.sin(-ly) * 40, 0.85 + Math.sin(lp) * 40, 2.05 + Math.cos(ly) * 40));
        camera.up.set(0, 1, 0).applyQuaternion(ob.quaternion);
        if (ob) ob.visible = true;
      }
      fov = Math.max(28, Math.min(78, (S.acClass === 'jet' ? 58 : 62) * Math.sqrt(Math.max(4, camGoal.radius) / 14)));
      near = 0.12;
    } else if (S.view === 'window' && !car) {
      /* look-around offsets are scoped to the cockpit branch; the window seat needs its own (was a ReferenceError every frame = frozen view) */
      const lp = Math.max(-0.6, Math.min(0.6, pitchOff)), ly = Math.max(-1.2, Math.min(1.2, yaw));
      /* passenger window seat: just outside the left cabin wall ahead of the wing, looking out and down past the wing */
      if (ob) ob.visible = true;
      /* seat from the model's own size: beside the fuselage ahead of the wing root, looking out, down and back over the wing */
      if (ob && !ob.userData.winBox) { ob.updateMatrixWorld(true); ob.userData.winBox = new THREE.Box3().setFromObject(ob).applyMatrix4(ob.matrixWorld.clone().invert()); }
      const bb = ob && ob.userData.winBox, len = bb ? Math.max(4, bb.max.z - bb.min.z) : 40, z0 = bb ? bb.min.z : -20;
      const fw = len * 0.045, cz = z0 + len * 0.8, cy = len * 0.03; /* ahead of the wing root, so the wing sits low in the window instead of filling it */
      camera.position.copy(L(-fw - 0.25, cy, cz));
      look.copy(L(-fw - len * 0.5 + Math.sin(-ly) * len * 0.2, cy - len * 0.2 + Math.sin(lp) * len * 0.2, cz - len * 0.38));
      camera.up.set(0, 1, 0).applyQuaternion(ob.quaternion);
      fov = 55;
      near = 0.1;
    } else if (S.view === 'side' || S.view === 'wing') {
      if (ob) ob.visible = true;
      const d = car ? 4.6 : ((ob && ob.userData.sideD) || 15);
      camera.position.copy(L(-d * Math.cos(yaw), car ? 1.4 : 2.4, d * Math.sin(yaw) + (car ? 0.6 : -2)));
      look.copy(L(0, car ? 0.9 : 0.6, car ? 2.5 : 8));
      near = 0.3;
    } else {
      if (ob) ob.visible = true;
      /* Cap plane Top under ~1.05 km AGL so we never sit inside soft white cloud sprites */
      let hgt = Math.max(car ? 30 : 80, Math.min(car ? 3000 : 8000, camGoal.radius * 1.6));
      if (!car) {
        const maxCamY = S.p.y > 900 ? S.p.y + 220 : 1050;
        hgt = Math.max(80, Math.min(hgt, maxCamY - S.p.y));
      }
      camera.position.set(S.p.x + off.x - Math.sin(camGoal.theta) * 0.01, S.p.y + hgt, S.p.z + off.z - Math.cos(camGoal.theta) * 0.01);
      look.set(S.p.x + off.x, S.p.y, S.p.z + off.z);
      camera.up.set(-Math.sin(camGoal.theta), 0, -Math.cos(camGoal.theta));
      near = Math.max(1, hgt * 0.01);
    }
    if (S.view === 'chase' || S.view === 'orbit') { if (ob) ob.visible = true; }
    camera.lookAt(look);
    camera.userData.tourNearT = performance.now();
    /* high above the ground a tiny near plane wastes depth precision and the ground layers flicker: push it out with altitude */
    if (!car) { const agl = Math.max(0, camera.position.y); near = Math.max(near, Math.min(S.view === 'driver' || S.view === 'cockpit' ? 3 : Math.max(0.3, camera.position.distanceTo(S.p) * 0.35), agl * 0.012)); near = Math.round(near * 4) / 4 || near; }
    if (Math.abs(camera.near - near) > 0.01 || camera.fov !== fov) { camera.near = near; camera.fov = fov; camera.updateProjectionMatrix(); }
  }
  function updateLights() {
    const nf = typeof window !== 'undefined' && window._nightF != null ? window._nightF : 0;
    if (dash && dash.classList.contains('night') !== nf > 0.35) dash.classList.toggle('night', nf > 0.35);
    const ud = S.obj && S.obj.userData;
    if (!ud) return;
    if (ud._shellOff && S.view !== 'driver') { for (const c of S.obj.children) c.visible = true; ud._shellOff = false; }
    if (S.kind === 'car' && ud.carLights) {
      const L = ud.carLights;
      const on = nf > 0.08;
      L.head.opacity = on ? 0.65 + 0.35 * nf : 0.2;
      L.tail.opacity = 0.3 + 0.7 * nf;
      const poolOp = on ? nf * 0.88 : 0;
      const lensOp = on ? 0.55 + nf * 0.45 : 0;
      if (L.pools) for (const m of L.pools) m.opacity = poolOp;
      else if (L.pool) L.pool.opacity = poolOp;
      if (L.lenses) for (const m of L.lenses) m.opacity = lensOp;
      if (L.spots) for (const s of L.spots) s.intensity = on ? nf * 55 : 0;
    }
    if (S.kind === 'plane') {
      const t = (performance.now() * 0.001) % 1.3;
      const dbl = (t < 0.06) || (t > 0.14 && t < 0.2);
      const beaconOn = Math.floor(performance.now() * 0.002) % 2 === 1;
      if (ud.strobe && ud.strobe.opacity !== undefined) ud.strobe.opacity = dbl ? (0.25 + 0.55 * nf) : 0;
      if (ud.beacon && ud.beacon.opacity !== undefined) ud.beacon.opacity = beaconOn ? (0.25 + 0.45 * nf) : 0.04;
      if (ud.nav) {
        const low = S.p.y < 90;
        for (const [m, kind] of ud.nav) {
          if (kind === 'nav') m.opacity = 0.2 + 0.8 * Math.max(nf, 0.35);
          else if (kind === 'st') m.opacity = dbl ? (0.45 + 0.55 * nf) : 0;
          else m.opacity = low ? (0.2 + 0.8 * nf) : nf * 0.35;
        }
      }
    }
  }
  function update(dt) {
    if (!S.mode || !S.obj) return;
    if (isFollowing && isFollowing()) { stop(); return; }
    const sdt = Math.min(0.1, dt) * S.speedX;
    /* Cap substeps on Windows — fewer physics iterations = smoother frames */
    const n = Math.max(1, Math.min(/Windows/i.test(navigator.userAgent || '') ? 3 : 6, Math.ceil(sdt / 0.05)));
    for (let i = 0; i < n; i++) (S.kind === 'car' ? stepCar : stepPlane)(sdt / n);
    placeCamera(sdt / Math.max(0.001, S.speedX));
    if (ground.g) updateGround(sdt);
    updateEscorts(sdt / Math.max(0.001, S.speedX));
    updateLights();
    S._pwr = enginePwr(sdt);
    audio.update(Math.abs(S.v), audioKind(), S.phase || (S.mode === 'free' ? 'free' : ''), S._pwr);
    const now = performance.now();
    drawDash();
    /* HUD meters ~10 Hz — avoid querySelector thrash every frame on long flights */
    if (now - (S._mT || 0) > 100) { S._mT = now; refreshMeters(); }
    if (now - S.hudT > 250) {
      S.hudT = now;
      const t = hud.querySelector('#tourTitle');
      if (t) t.textContent = S.icTitle && S.mode === 'tour' ? S.icTitle + (S.info ? ' · ' + S.info : '') : (S.mode === 'tour' ? (S.kind === 'car' ? (S.leg === 'back' ? 'Driving back from ' : 'Car tour → ') : acName() + ' → ') + S.dest.n : S.kind === 'car' ? 'Free drive' : 'Free flight · ' + acName()) + (S.info ? ' · ' + S.info : '');
    }
  }
  function planeEtaSec() {
    if (S.kind !== 'plane' || S.mode !== 'tour') return null;
    if (S.phase === 'parked') return 0;
    if (S.phase === 'taxi') return Math.max(5, (S.remain || 0) / Math.max(2, S.v || 0));
    if (S.phase === 'rollout') return Math.max(2, Math.min(25, (S.v || 0) / 2.4));
    const jet = S.acClass === 'jet';
    if (S.wx && /^(roll|climb|cruise)$/.test(S.phase)) {
      /* intercity: cruise at ~460 kt over the ground, slower on the descent, then a few minutes of approach */
      const rr = S.remain || 0, cr = (S.acClass === 'jet' ? 480 : 260) * KT, gs = S.phase === 'cruise' ? Math.max(S.v || 0, cr * 0.6) : cr;
      return Math.max(0, rr - 60000) / gs + Math.min(rr, 60000) / (230 * KT) + 240 + (S.phase === 'roll' ? 60 : 0);
    }
    /* Short-final approach after orbit (matches startLanding joining final when near) */
    const apprSec = jet ? 55 : 85;
    if (S.phase === 'toFaf' || S.phase === 'final') {
      const rem = S.remain || 0;
      const v = Math.max(28, S.v || (jet ? 90 : 65) * KT);
      return rem / v;
    }
    if (S.phase === 'orbit') return Math.max(0, 22 - (S.orbT || 0));
    const dist = S.dest ? Math.hypot(S.dest.x - S.p.x, S.dest.z - S.p.z) : (S.remain || 0);
    const cruise = (jet ? 220 : 110) * KT;
    const ground = Math.max(40, Math.min(cruise, (S.v || cruise) * Math.max(0.85, Math.cos(S.pitch || 0))));
    let t = dist / ground; void apprSec;
    if (S.phase === 'roll') t += 28;
    else if (S.phase === 'climb') t += 16;
    /* Light planned blend only en-route — freeze once circling / landing */
    if ((S.phase === 'cruise' || S.phase === 'climb' || S.phase === 'roll') && S.trip0 > 0 && S.flightEta0 > 0) {
      const flown = Math.min(1, Math.max(0, 1 - dist / S.trip0));
      const plannedLeft = Math.max(0, S.flightEta0 * (1 - flown));
      t = t * 0.78 + plannedLeft * 0.22;
    }
    return Math.max(0, t);
  }
  function tourProgress() {
    if (S.mode !== 'tour') return 0;
    if (S.kind === 'car' && S.route && S.tripLen) return Math.min(1, S.s / S.tripLen);
    if (S.kind === 'plane') {
      if (S.phase === 'parked' || S.phase === 'rollout' || S.phase === 'taxi') return 1;
      if (S.phase === 'toFaf' || S.phase === 'final') return 0.82 + 0.16 * (1 - Math.min(1, (S.remain || 0) / 12000));
      if (S.phase === 'orbit') return 0.72 + 0.1 * Math.min(1, (S.orbT || 0) / 22);
      const trip0 = S.trip0 || 1;
      const left = S.dest ? Math.hypot(S.dest.x - S.p.x, S.dest.z - S.p.z) : trip0;
      const flown = Math.max(0, 1 - left / trip0);
      if (S.phase === 'roll') return 0.02 * Math.min(1, (S.rollS || 0) / Math.max(200, S.rwLen || 1000));
      if (S.phase === 'climb') return 0.05 + 0.1 * Math.min(1, S.p.y / (1500 * FT));
      return 0.15 + 0.55 * Math.min(1, flown);
    }
    return 0;
  }
  return { start, stop, update, setView, land: startLanding, planeEtaSec, get active() { return !!S.mode; }, state: S, get ground() { return ground; } };
}
