import { Rng, hash, noise1D } from './rng.js';

export const PAGE_SIZES = {
  letter: { label: 'US Letter (8.5 \u00d7 11 in)', w: 215.9, h: 279.4 },
  a4: { label: 'A4 (210 \u00d7 297 mm)', w: 210, h: 297 },
  a5: { label: 'A5 (148 \u00d7 210 mm)', w: 148, h: 210 },
  legal: { label: 'US Legal (8.5 \u00d7 14 in)', w: 215.9, h: 355.6 },
  card: { label: 'Index card (5 \u00d7 3 in)', w: 127, h: 76.2 },
  sticky: { label: 'Sticky note (3 \u00d7 3 in)', w: 76.2, h: 76.2 },
};

const IN = 25.4;
const BLUE = '#86afd9';
// Paper models are based on real stationery measurements (US college/wide rule,
// European 8 mm lined, legal pads, quarter-inch graph, 3x5 index cards).
export const PAPERS = [
  { id: 'college', label: 'College ruled', desc: '9/32" lines, red margin, 3 holes', bg: '#fbfbf7', rule: { sp: (9 / 32) * IN, top: 1.25 * IN, bottom: 12, color: BLUE }, margin: { x: 1.25 * IN, color: '#e8838c' }, holes: 'us', sizes: ['letter', 'a4'], size: 'letter', tex: 1, edge: true },
  { id: 'wide', label: 'Wide ruled', desc: '11/32" lines for younger hands', bg: '#fbfbf6', rule: { sp: (11 / 32) * IN, top: 1.25 * IN, bottom: 12, color: BLUE }, margin: { x: 1.25 * IN, color: '#e8838c' }, holes: 'us', sizes: ['letter', 'a4'], size: 'letter', tex: 1, edge: true },
  { id: 'a4lined', label: 'A4 lined pad', desc: '8 mm feint & margin, 2 holes', bg: '#fcfcf9', rule: { sp: 8, top: 26, bottom: 14, color: '#93b4d6' }, margin: { x: 25, color: '#de7680' }, holes: 'eu', sizes: ['a4', 'a5', 'letter'], size: 'a4', tex: 1, edge: true },
  { id: 'legal', label: 'Yellow legal pad', desc: 'Canary paper, double margin', bg: '#fbf1a6', rule: { sp: (11 / 32) * IN, top: 1.6 * IN, bottom: 12, color: '#7ea6c8' }, margin: { x: 1.25 * IN, color: '#d9555f', double: true }, sizes: ['letter', 'legal', 'a4'], size: 'legal', tex: 1.2, top: true },
  { id: 'exam', label: 'Assignment sheet', desc: 'Printed Name / Date box', bg: '#fcfcfa', rule: { sp: 8, top: 52, bottom: 16, color: '#9ab8d6' }, margin: { x: 25, color: '#de7680', double: true }, exam: true, sizes: ['a4', 'letter'], size: 'a4', tex: 0.8 },
  { id: 'graph', label: 'Graph paper', desc: '1/4" grid', bg: '#fbfcfb', grid: { pitch: IN / 4, color: '#9cc7d6' }, gridText: { left: 4, top: 4 }, sizes: ['letter', 'a4', 'a5'], size: 'letter', tex: 0.8 },
  { id: 'dots', label: 'Dot grid journal', desc: '6 mm dots, bullet-journal', bg: '#f8f6f0', dots: { pitch: 6, color: '#a7a6ad' }, gridText: { left: 3, top: 3 }, sizes: ['a5', 'a4'], size: 'a5', tex: 0.9 },
  { id: 'printer', label: 'Printer paper', desc: 'Plain white, no guide lines', bg: '#fdfdfd', blank: { sp: 9, top: 26, left: 24, right: 22, bottom: 22 }, sizes: ['letter', 'a4', 'a5', 'legal'], size: 'letter', tex: 0.6 },
  { id: 'cream', label: 'Cream stationery', desc: 'Laid writing paper for letters', bg: '#f6eedc', blank: { sp: 10, top: 34, left: 26, right: 24, bottom: 26 }, laid: true, sizes: ['a5', 'a4', 'letter'], size: 'a5', tex: 1 },
  { id: 'aged', label: 'Aged parchment', desc: 'Old letter, foxing & stains', bg: '#ecdcb8', blank: { sp: 10, top: 30, left: 26, right: 24, bottom: 26 }, aged: true, sizes: ['a4', 'letter', 'a5'], size: 'a4', tex: 1.6 },
  { id: 'kraft', label: 'Kraft paper', desc: 'Brown recycled stock', bg: '#c8a67b', blank: { sp: 9.5, top: 24, left: 22, right: 20, bottom: 22 }, kraft: true, sizes: ['a5', 'a4', 'letter'], size: 'a5', tex: 1.5 },
  { id: 'card', label: 'Index card', desc: '3 \u00d7 5 ruled flashcard', bg: '#fdfdfb', rule: { sp: IN / 4, top: 0.6 * IN + IN / 4, bottom: 4, color: '#8fb4d8' }, cardLine: 0.6 * IN, left: 6, right: 5, sizes: ['card'], size: 'card', tex: 0.7 },
  { id: 'sticky', label: 'Sticky note', desc: 'Canary 3 \u00d7 3 note', bg: '#fbef86', blank: { sp: 7.2, top: 10, left: 6, right: 5, bottom: 6 }, sticky: true, sizes: ['sticky'], size: 'sticky', tex: 0.8 },
  { id: 'custom', label: 'Your own image', desc: 'Upload a photo/scan of paper', bg: '#ffffff', blank: { sp: 9, top: 25, left: 24, right: 22, bottom: 22 }, custom: true, sizes: ['letter', 'a4', 'a5', 'legal'], size: 'letter', tex: 0 },
];

export function getPaper(id) { return PAPERS.find((p) => p.id === id) || PAPERS[0]; }

export function pageSize(paper, sizeId) {
  const id = paper.sizes.includes(sizeId) ? sizeId : paper.size;
  return { id, ...PAGE_SIZES[id] };
}

// Writing guide geometry in mm: baselines of each writable line + margins.
export function paperLayout(paper, sizeId, opts = {}) {
  const S = pageSize(paper, sizeId);
  const lines = [];
  let left, right, ruled = false, headerY = null, sp;
  if (paper.rule) {
    ruled = true;
    sp = paper.rule.sp;
    for (let y = paper.rule.top; y <= S.h - paper.rule.bottom + 0.01; y += sp) lines.push(y);
    left = paper.margin ? paper.margin.x + (paper.margin.double ? 2.2 : 0) + 2.2 : paper.left || 8;
    right = S.w - (paper.right || 9);
    if (paper.cardLine) headerY = paper.cardLine;
  } else if (paper.gridText) {
    ruled = true;
    const p = (paper.grid || paper.dots).pitch;
    sp = p * (opts.gridRows || 1);
    const ox = gridOrigin(S.w, p), oy = gridOrigin(S.h, p);
    for (let y = oy + p * (paper.gridText.top + 1); y <= S.h - p * 2; y += sp) lines.push(y);
    left = ox + p * paper.gridText.left;
    right = S.w - ox - p * 2;
  } else {
    const b = paper.blank;
    sp = opts.lineSpacing || b.sp;
    for (let y = b.top; y <= S.h - b.bottom + 0.01; y += sp) lines.push(y);
    left = b.left; right = S.w - b.right;
  }
  return { W: S.w, H: S.h, size: S.id, lines, left, right, ruled, sp, headerY };
}

function gridOrigin(len, p) { return ((len % p) / 2) + p * 0; }

const tileCache = new Map();
function grainTile(seed, strength, kraft) {
  const key = seed + ':' + strength + ':' + !!kraft;
  if (tileCache.has(key)) return tileCache.get(key);
  const N = 384;
  const c = document.createElement('canvas');
  c.width = c.height = N;
  const x = c.getContext('2d');
  const img = x.createImageData(N, N);
  const rng = new Rng(seed);
  for (let i = 0; i < N * N; i++) {
    const v = rng.next();
    const dark = v < 0.5;
    const a = Math.abs(v - 0.5) * 2;
    img.data[i * 4] = img.data[i * 4 + 1] = img.data[i * 4 + 2] = dark ? (kraft ? 60 : 30) : 255;
    if (kraft && dark) { img.data[i * 4] = 70; img.data[i * 4 + 1] = 45; img.data[i * 4 + 2] = 20; }
    img.data[i * 4 + 3] = Math.round(a * a * (kraft ? 26 : 15) * strength);
  }
  x.putImageData(img, 0, 0);
  // paper fibres
  const fibres = Math.round(140 * strength);
  for (let i = 0; i < fibres; i++) {
    const fx = rng.range(0, N), fy = rng.range(0, N), len = rng.range(3, kraft ? 26 : 12), ang = rng.range(0, Math.PI * 2);
    x.strokeStyle = rng.chance(0.5) ? `rgba(0,0,0,${kraft ? 0.12 : 0.035})` : 'rgba(255,255,255,0.08)';
    x.lineWidth = rng.range(0.4, kraft ? 1.4 : 0.9);
    x.beginPath(); x.moveTo(fx, fy);
    x.quadraticCurveTo(fx + Math.cos(ang + 0.6) * len * 0.6, fy + Math.sin(ang + 0.6) * len * 0.6, fx + Math.cos(ang) * len, fy + Math.sin(ang) * len);
    x.stroke();
  }
  tileCache.set(key, c);
  return c;
}

export function holePositions(paper, L) {
  if (!paper.holes) return [];
  const sz = L.size;
  if (paper.holes === 'us') {
    const cx = 0.375 * IN, cy = L.H / 2, d = sz === 'letter' ? 4.25 * IN : 108;
    return [cy - d, cy, cy + d].map((y) => ({ x: cx, y, r: 0.14 * IN }));
  }
  const cx = 11, cy = L.H / 2;
  return [cy - 40, cy + 40].map((y) => ({ x: cx, y, r: 2.8 }));
}

// Draws the sheet at pxPerMm. Returns a canvas (holes/torn edge transparent).
export function renderPaper(paper, L, pxPerMm, opts = {}) {
  const W = Math.round(L.W * pxPerMm), H = Math.round(L.H * pxPerMm);
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const x = c.getContext('2d');
  const k = pxPerMm;
  const rng = new Rng(hash('paper', paper.id, opts.seed || 1, opts.page || 0));

  if (paper.custom && opts.image) {
    const img = opts.image;
    const s = Math.max(W / img.width, H / img.height);
    x.drawImage(img, (W - img.width * s) / 2, (H - img.height * s) / 2, img.width * s, img.height * s);
  } else {
    x.fillStyle = paper.bg;
    x.fillRect(0, 0, W, H);
  }

  // large-scale mottling: real sheets are never one flat colour
  const blobs = Math.round(10 + 14 * (paper.tex || 0));
  for (let i = 0; i < blobs; i++) {
    const bx = rng.range(0, W), by = rng.range(0, H), r = rng.range(0.15, 0.5) * Math.max(W, H);
    const g = x.createRadialGradient(bx, by, 0, bx, by, r);
    const dark = rng.chance(0.55);
    const a = (paper.aged ? 0.07 : 0.018) * (paper.tex || 0.5) * rng.range(0.4, 1);
    g.addColorStop(0, dark ? `rgba(${paper.aged ? '120,80,30' : '90,80,60'},${a})` : `rgba(255,255,250,${a})`);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = g; x.fillRect(0, 0, W, H);
  }

  if (paper.sticky) {
    const g = x.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, 'rgba(255,255,255,0.0)'); g.addColorStop(0.12, 'rgba(255,255,255,0)');
    g.addColorStop(0.85, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(120,90,0,0.09)');
    x.fillStyle = g; x.fillRect(0, 0, W, H);
    const t = x.createLinearGradient(0, 0, 0, 14 * k);
    t.addColorStop(0, 'rgba(160,130,0,0.10)'); t.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = t; x.fillRect(0, 0, W, 14 * k); // adhesive strip
  }

  if (paper.laid) {
    x.strokeStyle = 'rgba(140,120,80,0.05)';
    x.lineWidth = Math.max(0.6, 0.12 * k);
    for (let yy = 0; yy < H; yy += 1.1 * k) { x.beginPath(); x.moveTo(0, yy); x.lineTo(W, yy); x.stroke(); }
    x.strokeStyle = 'rgba(140,120,80,0.07)';
    for (let xx = 12 * k; xx < W; xx += 25 * k) { x.beginPath(); x.moveTo(xx, 0); x.lineTo(xx, H); x.stroke(); }
  }

  if (paper.rule) drawRules(x, paper, L, k, rng);
  if (paper.grid) drawGrid(x, paper, L, k, rng);
  if (paper.dots) drawDots(x, paper, L, k, rng);
  if (paper.exam) drawExamHeader(x, L, k);
  if (paper.cardLine) {
    x.strokeStyle = 'rgba(226,92,104,0.85)'; x.lineWidth = 0.28 * k;
    x.beginPath(); x.moveTo(0, paper.cardLine * k); x.lineTo(W, paper.cardLine * k); x.stroke();
  }
  if (paper.top) {
    // legal pads: heavier top rule
    x.strokeStyle = 'rgba(120,150,190,0.85)'; x.lineWidth = 0.3 * k;
    x.beginPath(); x.moveTo(0, (paper.rule.top - paper.rule.sp) * k); x.lineTo(W, (paper.rule.top - paper.rule.sp) * k); x.stroke();
  }

  if (paper.tex) {
    const tile = grainTile(hash('grain', paper.id), paper.tex, paper.kraft);
    const pat = x.createPattern(tile, 'repeat');
    x.fillStyle = pat; x.fillRect(0, 0, W, H);
  }

  if (paper.aged) drawAging(x, W, H, k, rng);

  // tiny edge darkening from handling
  const eg = x.createLinearGradient(0, 0, W, 0);
  eg.addColorStop(0, 'rgba(0,0,0,0.035)'); eg.addColorStop(0.02, 'rgba(0,0,0,0)');
  eg.addColorStop(0.98, 'rgba(0,0,0,0)'); eg.addColorStop(1, 'rgba(0,0,0,0.035)');
  x.fillStyle = eg; x.fillRect(0, 0, W, H);

  // punched holes
  for (const h of holePositions(paper, L)) {
    x.save();
    x.globalCompositeOperation = 'destination-out';
    x.beginPath(); x.arc(h.x * k, h.y * k, h.r * k, 0, Math.PI * 2); x.fill();
    x.restore();
    x.strokeStyle = 'rgba(0,0,0,0.10)'; x.lineWidth = 0.35 * k;
    x.beginPath(); x.arc(h.x * k, h.y * k, h.r * k + 0.15 * k, 0, Math.PI * 2); x.stroke();
  }

  if (opts.torn && paper.edge) tearLeftEdge(x, W, H, k, rng);
  return c;
}

function wobblyLine(x, x0, y0, x1, y1, k, rng, alpha) {
  // printed rules: slight density variation along the run
  const seg = 18 * k;
  const len = Math.hypot(x1 - x0, y1 - y0);
  const n = Math.max(1, Math.round(len / seg));
  for (let i = 0; i < n; i++) {
    const t0 = i / n, t1 = (i + 1) / n;
    x.globalAlpha = alpha * rng.range(0.82, 1);
    x.beginPath();
    x.moveTo(x0 + (x1 - x0) * t0, y0 + (y1 - y0) * t0);
    x.lineTo(x0 + (x1 - x0) * t1, y0 + (y1 - y0) * t1);
    x.stroke();
  }
  x.globalAlpha = 1;
}

function drawRules(x, paper, L, k, rng) {
  const W = L.W * k;
  x.strokeStyle = paper.rule.color;
  x.lineWidth = Math.max(0.7, 0.2 * k);
  x.lineCap = 'butt';
  const start = paper.cardLine ? paper.rule.top : paper.rule.top;
  for (let y = start; y <= L.H - paper.rule.bottom + 0.01; y += paper.rule.sp) {
    wobblyLine(x, 0, y * k, W, y * k, k, rng, 0.9);
  }
  if (paper.margin) {
    x.strokeStyle = paper.margin.color;
    x.lineWidth = Math.max(0.8, 0.24 * k);
    const mx = paper.margin.x * k;
    wobblyLine(x, mx, 0, mx, L.H * k, k, rng, 0.85);
    if (paper.margin.double) wobblyLine(x, mx + 2.2 * k, 0, mx + 2.2 * k, L.H * k, k, rng, 0.85);
  }
}

function drawGrid(x, paper, L, k, rng) {
  const p = paper.grid.pitch;
  const ox = gridOrigin(L.W, p), oy = gridOrigin(L.H, p);
  x.strokeStyle = paper.grid.color;
  x.lineWidth = Math.max(0.5, 0.13 * k);
  for (let gx = ox; gx <= L.W; gx += p) wobblyLine(x, gx * k, 0, gx * k, L.H * k, k, rng, 0.75);
  for (let gy = oy; gy <= L.H; gy += p) wobblyLine(x, 0, gy * k, L.W * k, gy * k, k, rng, 0.75);
}

function drawDots(x, paper, L, k, rng) {
  const p = paper.dots.pitch;
  const ox = gridOrigin(L.W, p), oy = gridOrigin(L.H, p);
  x.fillStyle = paper.dots.color;
  const r = Math.max(0.6, 0.28 * k);
  for (let gx = ox + p; gx < L.W - 1; gx += p) {
    for (let gy = oy + p; gy < L.H - 1; gy += p) {
      x.globalAlpha = rng.range(0.6, 0.85);
      x.beginPath(); x.arc(gx * k, gy * k, r, 0, Math.PI * 2); x.fill();
    }
  }
  x.globalAlpha = 1;
}

export const EXAM_FIELDS = [
  { key: 'name', label: 'Name', x: 0.08, w: 0.5 },
  { key: 'date', label: 'Date', x: 0.62, w: 0.3 },
  { key: 'subject', label: 'Subject', x: 0.08, w: 0.5, row: 1 },
  { key: 'class', label: 'Class / Period', x: 0.62, w: 0.3, row: 1 },
];

export function examFieldSlots(L) {
  return EXAM_FIELDS.map((f) => ({ ...f, px: L.W * f.x + (f.key === 'class' ? 26 : f.key === 'subject' ? 16 : f.key === 'date' ? 11 : 12), py: 18 + (f.row || 0) * 12, pw: L.W * f.w - 14 }));
}

function drawExamHeader(x, L, k) {
  x.fillStyle = 'rgba(40,50,70,0.88)';
  x.font = `600 ${3.2 * k}px Inter, Arial, sans-serif`;
  x.textBaseline = 'alphabetic';
  x.strokeStyle = 'rgba(40,50,70,0.6)';
  x.lineWidth = Math.max(0.6, 0.18 * k);
  for (const f of EXAM_FIELDS) {
    const fx = L.W * f.x * k, fy = (18 + (f.row || 0) * 12) * k;
    x.fillText(f.label + ':', fx, fy);
    const tw = x.measureText(f.label + ': ').width;
    x.beginPath(); x.moveTo(fx + tw, fy + 0.6 * k); x.lineTo(fx + L.W * f.w * k, fy + 0.6 * k); x.stroke();
  }
  x.lineWidth = Math.max(0.8, 0.3 * k);
  x.beginPath(); x.moveTo(L.W * 0.06 * k, 38 * k); x.lineTo(L.W * 0.94 * k, 38 * k); x.stroke();
}

function drawAging(x, W, H, k, rng) {
  // edge burn
  const g = x.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.3, W / 2, H / 2, Math.max(W, H) * 0.75);
  g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(110,60,15,0.32)');
  x.fillStyle = g; x.fillRect(0, 0, W, H);
  // foxing spots & a coffee ring
  for (let i = 0; i < 40; i++) {
    const fx = rng.range(0, W), fy = rng.range(0, H), r = rng.range(0.3, 2.2) * k;
    x.fillStyle = `rgba(130,80,30,${rng.range(0.05, 0.18)})`;
    x.beginPath(); x.arc(fx, fy, r, 0, Math.PI * 2); x.fill();
  }
  const cx = rng.range(0.55, 0.85) * W, cy = rng.range(0.6, 0.85) * H, cr = rng.range(28, 38) * k;
  x.strokeStyle = 'rgba(120,70,25,0.12)';
  x.lineWidth = 1.6 * k;
  x.beginPath(); x.arc(cx, cy, cr, 0.2, Math.PI * 1.75); x.stroke();
  x.lineWidth = 0.6 * k; x.strokeStyle = 'rgba(120,70,25,0.08)';
  x.beginPath(); x.arc(cx + k, cy - k, cr - 1.5 * k, 0, Math.PI * 2); x.stroke();
  // fold creases
  for (const fy of [H / 3, (2 * H) / 3]) {
    const cg = x.createLinearGradient(0, fy - 2 * k, 0, fy + 2 * k);
    cg.addColorStop(0, 'rgba(0,0,0,0)'); cg.addColorStop(0.48, 'rgba(90,55,20,0.12)');
    cg.addColorStop(0.52, 'rgba(255,250,235,0.18)'); cg.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = cg; x.fillRect(0, fy - 2 * k, W, 4 * k);
  }
}

function tearLeftEdge(x, W, H, k, rng) {
  const n = noise1D(rng.int(1, 1e9), 3);
  x.save();
  x.globalCompositeOperation = 'destination-out';
  x.beginPath();
  x.moveTo(0, 0);
  for (let y = 0; y <= H; y += 0.8 * k) {
    const d = (1.6 + n(y / (6 * k)) * 1.1 + (rng.chance(0.05) ? rng.range(0.5, 1.6) : 0)) * k;
    x.lineTo(d, y);
  }
  x.lineTo(0, H); x.closePath(); x.fill();
  x.restore();
  // torn fibres look lighter/rougher
  x.strokeStyle = 'rgba(255,255,255,0.6)';
  x.lineWidth = 0.5 * k;
  x.beginPath();
  for (let y = 0; y <= H; y += 0.8 * k) {
    const d = (1.75 + n(y / (6 * k)) * 1.1) * k;
    if (y === 0) x.moveTo(d, y); else x.lineTo(d, y);
  }
  x.stroke();
}
