/**
 * Realistic sky layers for the world cities, driven by live Open-Meteo data.
 * Same cloud art as the Houston sim (cumulus towers, altocumulus, cirrus streaks, stratus sheets),
 * chosen per layer from cloud_cover_low / _mid / _high and the weather code:
 *   low  → fair-weather cumulus, or a grey stratus / nimbostratus deck when overcast or raining
 *   mid  → altocumulus cells
 *   high → cirrus streaks
 * Lit like real clouds: white crowns by day, gold/pink at sunset, dark blue-grey at night,
 * heavy grey bases under rain. Textures are built once and shared by every city.
 */
import * as THREE from 'three';

const TAU = Math.PI * 2;
let seed = 90127;
const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

function fadeEdges(x, w, h) {
  x.save(); x.globalCompositeOperation = 'destination-in'; x.translate(w / 2, h / 2); x.scale(w / 2, h / 2);
  const g = x.createRadialGradient(0, 0, 0, 0, 0, 1); g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(0.62, 'rgba(0,0,0,1)'); g.addColorStop(1, 'rgba(0,0,0,0)');
  x.fillStyle = g; x.fillRect(-1, -1, 2, 2); x.restore();
}
function tex(c) { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 2; return t; }

/* cumulus: hundreds of soft puffs in a lumpy dome with 2–3 towers, sun-lit crown, flat shaded base */
function cumulus() {
  const W = 512, H = 256, c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d');
  const base = H * 0.8, cx0 = W * 0.5, half = W * (0.34 + rand() * 0.11), top = H * (0.42 + rand() * 0.2);
  const towers = []; for (let k = 0, n = 2 + Math.floor(rand() * 2); k < n; k++) towers.push([rand() * 1.4 - 0.7, 0.18 + rand() * 0.2, 0.35 + rand() * 0.45]);
  const prof = (u) => { let h = Math.pow(Math.max(0, 1 - u * u), 0.65) * 0.55; for (const [tu, tw, th] of towers) h += th * Math.exp(-((u - tu) * (u - tu)) / (2 * tw * tw)); return Math.min(1, h) * top; };
  for (let k = 0; k < 420; k++) {
    const u = (rand() * 2 - 1) * Math.pow(rand(), 0.35), hh = prof(u); if (hh < 6) continue;
    const v = Math.pow(rand(), 0.8), px = cx0 + u * half, py = base - v * hh, pr = (7 + rand() * 16) * (0.6 + 0.6 * (1 - v * 0.5));
    const lit = 0.82 + 0.18 * v, a = 0.16 + rand() * 0.16, cc = Math.round(255 * lit), cb = Math.min(255, Math.round(cc * 0.985 + 4));
    const g = x.createRadialGradient(px - pr * 0.2, py - pr * 0.3, pr * 0.1, px, py, pr);
    g.addColorStop(0, `rgba(${cc},${cc},${cb},${a})`); g.addColorStop(0.6, `rgba(${cc},${cc},${cb},${a * 0.55})`); g.addColorStop(1, `rgba(${cc},${cc},${cb},0)`);
    x.fillStyle = g; x.beginPath(); x.arc(px, py, pr, 0, TAU); x.fill();
  }
  x.globalCompositeOperation = 'source-atop';
  const sg = x.createLinearGradient(0, base - top, 0, base);
  sg.addColorStop(0, 'rgba(255,255,255,.25)'); sg.addColorStop(0.5, 'rgba(150,162,184,.10)'); sg.addColorStop(1, 'rgba(98,112,138,.5)');
  x.fillStyle = sg; x.fillRect(0, 0, W, H);
  x.globalCompositeOperation = 'destination-out';
  const cut = x.createLinearGradient(0, base - 8, 0, base + 6); cut.addColorStop(0, 'rgba(0,0,0,0)'); cut.addColorStop(1, 'rgba(0,0,0,1)');
  x.fillStyle = cut; x.fillRect(0, base - 8, W, H - base + 8);
  x.globalCompositeOperation = 'source-over';
  fadeEdges(x, W, H);
  return tex(c);
}
/* altocumulus: rows of soft overlapping cells */
function altocumulus() {
  const c = document.createElement('canvas'); c.width = 512; c.height = 256; const x = c.getContext('2d');
  const rows = 6 + Math.floor(rand() * 4), cols = 14 + Math.floor(rand() * 8), skew = (rand() - 0.5) * 0.5;
  x.filter = 'blur(2px)';
  for (let r = 0; r < rows; r++) for (let k = 0; k < cols; k++) {
    const u = (k + 0.5 + (r % 2) * 0.5) / cols, v = (r + 0.5) / rows;
    const ex = Math.pow(Math.sin(u * Math.PI), 0.7) * Math.pow(Math.sin(v * Math.PI), 0.9);
    if (rand() > ex * 1.25) continue;
    const px = u * 512 + skew * v * 120 + (rand() - 0.5) * 22, py = v * 256 + (rand() - 0.5) * 16, pr = (13 + rand() * 12) * (0.6 + ex * 0.6);
    const g = x.createRadialGradient(px, py - pr * 0.25, pr * 0.05, px, py, pr);
    g.addColorStop(0, 'rgba(255,255,255,.7)'); g.addColorStop(0.5, 'rgba(244,247,252,.35)'); g.addColorStop(1, 'rgba(235,240,250,0)');
    x.fillStyle = g; x.beginPath(); x.ellipse(px, py, pr * 1.35, pr, 0, 0, TAU); x.fill();
  }
  x.filter = 'none';
  fadeEdges(x, 512, 256);
  return tex(c);
}
/* cirrus: thin high ice streaks */
function cirrus() {
  const c = document.createElement('canvas'); c.width = 512; c.height = 128; const x = c.getContext('2d');
  x.lineCap = 'round';
  for (let i = 0; i < 26; i++) {
    const y0 = 20 + rand() * 88, x0 = rand() * 160, len = 180 + rand() * 300, curl = (rand() - 0.5) * 40;
    const g = x.createLinearGradient(x0, 0, x0 + len, 0);
    g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.3, 'rgba(255,255,255,.55)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    x.strokeStyle = g; x.lineWidth = 1.5 + rand() * 4; x.beginPath(); x.moveTo(x0, y0); x.quadraticCurveTo(x0 + len * 0.5, y0 + curl, x0 + len, y0 - curl * 0.4); x.stroke();
  }
  fadeEdges(x, 512, 128);
  return tex(c);
}
/* stratus / nimbostratus: broad soft sheet with lumpy grey underside */
function stratus() {
  const c = document.createElement('canvas'); c.width = 512; c.height = 256; const x = c.getContext('2d');
  for (let i = 0; i < 90; i++) {
    const px = rand() * 512, py = 60 + rand() * 136, pr = 40 + rand() * 70, v = 222 + Math.round(rand() * 22);
    const g = x.createRadialGradient(px, py, 0, px, py, pr);
    g.addColorStop(0, `rgba(${v},${v + 2},${v + 6},.42)`); g.addColorStop(1, `rgba(${v},${v + 2},${v + 6},0)`);
    x.fillStyle = g; x.beginPath(); x.arc(px, py, pr, 0, TAU); x.fill();
  }
  /* darker belly */
  x.globalCompositeOperation = 'source-atop';
  const sg = x.createLinearGradient(0, 40, 0, 220); sg.addColorStop(0, 'rgba(255,255,255,.1)'); sg.addColorStop(1, 'rgba(90,100,118,.35)');
  x.fillStyle = sg; x.fillRect(0, 0, 512, 256);
  x.globalCompositeOperation = 'source-over';
  fadeEdges(x, 512, 256);
  return tex(c);
}

let TEX = null;
function textures() {
  if (!TEX) TEX = { cu: [cumulus(), cumulus(), cumulus(), cumulus()], ac: [altocumulus(), altocumulus()], ci: [cirrus(), cirrus()], st: [stratus(), stratus()] };
  return TEX;
}

const RAIN = new Set([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99]);
const STORM = new Set([95, 96, 99]);

/** Cloud amounts per layer (0–1) from live weather. Falls back to total cover + weather code. */
export function cloudLayers(w) {
  if (!w) return { low: 0.2, mid: 0.1, high: 0.15, overcast: false, rain: false, storm: false };
  const tot = (w.cloud ?? 20) / 100;
  const has = w.cLow != null || w.cMid != null || w.cHigh != null;
  const low = has ? (w.cLow || 0) / 100 : tot * 0.7, mid = has ? (w.cMid || 0) / 100 : tot * 0.35, high = has ? (w.cHigh || 0) / 100 : tot * 0.4;
  const rain = RAIN.has(w.code) || (w.precip || 0) > 0.05;
  return { low, mid, high, overcast: w.code === 3 || low > 0.78 || rain, rain, storm: STORM.has(w.code) };
}

/**
 * Fill `group` with sprites for the given weather. Area: ±half around the city centre (world metres).
 * @returns {{storm:number}} darkness factor for tinting
 */
export function buildClouds(group, w, { mobile = false, half = 18000 } = {}) {
  const T = textures();
  while (group.children.length) { const s = group.children.pop(); s.material.dispose(); }
  const L = cloudLayers(w);
  const k = mobile ? 0.5 : 1;
  const add = (type, n, list, wMin, wMax, aspect, yMin, yMax, op) => {
    for (let i = 0; i < n; i++) {
      const m = new THREE.SpriteMaterial({ map: list[i % list.length], transparent: true, depthWrite: false, opacity: op, fog: true });
      m.rotation = type === 'cu' ? 0 : (rand() - 0.5) * 0.4;
      const s = new THREE.Sprite(m), wd = wMin + rand() * (wMax - wMin);
      s.scale.set(wd, wd * aspect * (0.8 + rand() * 0.4), 1);
      s.position.set((rand() - 0.5) * half * 2, yMin + rand() * (yMax - yMin), (rand() - 0.5) * half * 2);
      s.userData.type = type; s.userData.baseOp = op;
      group.add(s);
    }
  };
  if (L.overcast) {
    /* overcast / rain: a continuous low deck (lower and denser when it is raining) */
    add('st', Math.round((L.rain ? 70 : 55) * k * Math.max(0.6, L.low)), T.st, 5000, 9500, 0.42, L.rain ? 700 : 900, L.rain ? 1100 : 1500, L.rain ? 0.95 : 0.88);
    if (!L.rain && L.low < 0.95) add('cu', Math.round(10 * k), T.cu, 1400, 2600, 0.5, 1300, 1900, 0.8);
  } else {
    add('cu', Math.round(L.low * 130 * k), T.cu, 1100 + L.low * 900, 3000 + L.low * 1200, 0.5, 1300, 2300, 0.9);
  }
  add('ac', Math.round(L.mid * 26 * k), T.ac, 3500, 7000, 0.45, 3500, 5000, 0.7);
  add('ci', Math.round(L.high * 22 * k), T.ci, 6000, 12000, 0.22, 7500, 9500, 0.6);
  return { storm: L.storm ? 1 : L.rain ? 0.65 : L.overcast ? 0.3 : 0 };
}

const _c = new THREE.Color(), _w = new THREE.Color(1, 1, 1), _gold = new THREE.Color(1.0, 0.72, 0.5), _pink = new THREE.Color(1.0, 0.62, 0.66), _night = new THREE.Color(0.1, 0.12, 0.18), _storm = new THREE.Color(0.42, 0.45, 0.5);
/**
 * Light the clouds like the real sky.
 * @param {THREE.Group} group @param {number} day 0 night … 1 day @param {number} dusk 0…1 golden hour
 * @param {number} storm 0…1 darkness from buildClouds
 */
export function tintClouds(group, day, dusk, storm) {
  for (const s of group.children) {
    const t = s.userData.type;
    _c.copy(_w);
    /* high clouds catch sunset colour first and keep it longest */
    if (dusk > 0) _c.lerp(t === 'ci' || t === 'ac' ? _pink : _gold, dusk * (t === 'ci' ? 0.85 : t === 'ac' ? 0.75 : 0.55));
    if (storm > 0 && (t === 'st' || t === 'cu')) _c.lerp(_storm, storm);
    _c.lerp(_night, 1 - day);
    s.material.color.copy(_c);
  }
}
