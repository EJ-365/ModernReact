import { Rng, hash, noise1D, clamp } from './rng.js';
import { PENS } from './config.js';
import { renderPaper } from './paper.js';

const DEG = Math.PI / 180;

function makeCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h));
  return c;
}

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function shade([r, g, b], f, dl = 0) {
  return `rgb(${clamp(Math.round(r * f + dl), 0, 255)},${clamp(Math.round(g * f + dl), 0, 255)},${clamp(Math.round(b * f + dl), 0, 255)})`;
}

// Scratch surfaces reused for every glyph (two passes: draw, then warp).
class Scratch {
  constructor() { this.a = makeCanvas(64, 64); this.b = makeCanvas(64, 64); this.ax = this.a.getContext('2d'); this.bx = this.b.getContext('2d'); }
  fit(w, h) {
    for (const c of [this.a, this.b]) if (c.width < w || c.height < h) { c.width = Math.max(c.width, Math.ceil(w)); c.height = Math.max(c.height, Math.ceil(h)); }
    this.ax = this.a.getContext('2d'); this.bx = this.b.getContext('2d');
  }
}

/**
 * Draw one unit (a letter, or a whole word for joined cursive) with its own
 * affine distortion, stroke-weight change, pressure gradient and a gentle
 * non-linear warp, so no two instances of a letter are pixel-identical.
 */
function drawUnit(ink, S, s, xPx, yPx, emPx, p) {
  const ax = S.ax;
  ax.setTransform(1, 0, 0, 1, 0, 0);
  ax.font = `${emPx}px "${p.family}"`;
  const w = ax.measureText(s).width;
  const pad = Math.ceil(emPx * 0.7 + Math.abs(p.thick) * 2);
  const cw = Math.ceil(w * p.sc * 1.15 + pad * 2 + emPx * Math.abs(p.skew));
  const ch = Math.ceil(emPx * p.sc * 1.9 + pad);
  S.fit(cw, ch);
  const ox = pad, oy = Math.round(ch * 0.64);
  ax.setTransform(1, 0, 0, 1, 0, 0);
  ax.clearRect(0, 0, cw, ch);
  ax.globalCompositeOperation = 'source-over';
  ax.setTransform(p.sc * p.sx, 0, -p.skew * p.sc, p.sc, ox, oy);
  ax.font = `${emPx}px "${p.family}"`;
  ax.textBaseline = 'alphabetic';
  ax.fillStyle = p.color;
  ax.strokeStyle = p.color;
  ax.lineJoin = 'round'; ax.lineCap = 'round';
  ax.fillText(s, 0, 0);
  if (p.thick > 0.05) { ax.lineWidth = p.thick; ax.strokeText(s, 0, 0); }
  else if (p.thick < -0.05) {
    ax.globalCompositeOperation = 'destination-out';
    ax.lineWidth = -p.thick * 2; ax.strokeText(s, 0, 0);
    ax.globalCompositeOperation = 'source-over';
  }
  if (p.pool > 0) {
    // wet ink collects at the edges of the stroke (fountain / felt)
    ax.globalCompositeOperation = 'source-atop';
    ax.globalAlpha = p.pool;
    ax.strokeStyle = p.dark;
    ax.lineWidth = Math.max(0.6, emPx * 0.022);
    ax.strokeText(s, 0, 0);
    ax.globalAlpha = 1;
  }
  ax.setTransform(1, 0, 0, 1, 0, 0);
  if (p.grad < 0.999) {
    // pressure: one end of the stroke is lighter than the other
    ax.globalCompositeOperation = 'destination-in';
    const a = p.gradAng, r = Math.max(cw, ch) / 2;
    const g = ax.createLinearGradient(cw / 2 - Math.cos(a) * r, ch / 2 - Math.sin(a) * r, cw / 2 + Math.cos(a) * r, ch / 2 + Math.sin(a) * r);
    g.addColorStop(0, `rgba(0,0,0,${p.grad})`);
    g.addColorStop(1, 'rgba(0,0,0,1)');
    ax.fillStyle = g; ax.fillRect(0, 0, cw, ch);
  }
  ax.globalCompositeOperation = 'source-over';

  let src = S.a;
  if (p.warpA > 0.15) {
    const bx = S.bx;
    bx.setTransform(1, 0, 0, 1, 0, 0);
    bx.clearRect(0, 0, cw, ch);
    const sw = Math.max(1, Math.round(emPx / 22));
    for (let x = 0; x < cw; x += sw) {
      const t = (x - ox) / emPx;
      const dy = p.warpA * Math.sin(t * p.warpF + p.warpPh) + p.warpA * 0.5 * Math.sin(t * p.warpF * 2.3 + p.warpPh * 1.7);
      bx.drawImage(S.a, x, 0, sw, ch, x, dy, sw, ch);
    }
    src = S.b;
  }
  ink.save();
  ink.globalAlpha = clamp(p.alpha, 0.05, 1);
  ink.translate(xPx, yPx);
  ink.rotate(p.rot);
  ink.drawImage(src, 0, 0, cw, ch, -ox, -oy, cw, ch);
  ink.restore();
  return w * p.sc;
}

const grainCache = new Map();
function grainTile(kind) {
  if (grainCache.has(kind)) return grainCache.get(kind);
  const N = 256;
  const c = makeCanvas(N, N);
  const x = c.getContext('2d');
  const img = x.createImageData(N, N);
  const rng = new Rng(hash('ink-grain', kind));
  for (let i = 0; i < N * N; i++) {
    const v = rng.next();
    let a = 0;
    if (kind === 'pencil') a = Math.pow(v, 1.6) * 0.75;
    else if (kind === 'ballpoint') a = v < 0.07 ? rng.range(0.35, 0.85) : 0;
    else if (kind === 'felt') a = v < 0.04 ? rng.range(0.15, 0.35) : 0;
    else a = v < 0.02 ? rng.range(0.15, 0.4) : 0;
    img.data[i * 4 + 3] = Math.round(a * 255);
  }
  x.putImageData(img, 0, 0);
  if (kind === 'ballpoint' || kind === 'pencil') {
    // skip streaks: the ball/lead loses contact on fast strokes
    x.strokeStyle = kind === 'pencil' ? 'rgba(0,0,0,0.35)' : 'rgba(0,0,0,0.55)';
    x.lineCap = 'round';
    for (let i = 0; i < (kind === 'pencil' ? 160 : 55); i++) {
      const sx = rng.range(0, N), sy = rng.range(0, N), l = rng.range(2, 7), a = rng.range(-0.9, -0.4);
      x.lineWidth = rng.range(0.5, 1.2);
      x.beginPath(); x.moveTo(sx, sy); x.lineTo(sx + Math.cos(a) * l, sy + Math.sin(a) * l); x.stroke();
    }
  }
  grainCache.set(kind, c);
  return c;
}

function wavyStroke(ctx, x0, y0, x1, y1, amp, rng, lw) {
  const n = Math.max(3, Math.round(Math.hypot(x1 - x0, y1 - y0) / (lw * 6)));
  const ph = rng.range(0, 6.28);
  ctx.lineWidth = lw;
  ctx.beginPath();
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t + Math.sin(t * 5.5 + ph) * amp + rng.g() * amp * 0.25;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.stroke();
}

/**
 * Renders a laid-out page to a canvas at pxPerMm.
 * doc = layoutDocument() result, pi = page index.
 */
export function renderPage(doc, cfg, pi, pxPerMm, assets = {}) {
  const { L, paper, em, xh, family } = doc;
  const pg = doc.pages[pi];
  const k = pxPerMm;
  const sheet = renderPaper(paper, L, k, { seed: cfg.seed, page: pi, torn: cfg.torn, image: assets.paperImage });
  const ink = makeCanvas(sheet.width, sheet.height);
  const ix = ink.getContext('2d');
  const pen = PENS[cfg.pen] || PENS.ballpoint;
  const rgb = hexToRgb(cfg.ink);
  const S = new Scratch();
  const rng = new Rng(hash('page', cfg.seed, pi));
  const emPx = em * k;
  const nat = cfg.natural;
  const unruled = !L.ruled;
  const nWave = noise1D(hash('wave', cfg.seed, pi), 2);
  const nMargin = noise1D(hash('margin', cfg.seed), 2);
  const nPress = noise1D(hash('press', cfg.seed, pi), 3);
  const nSize = noise1D(hash('size', cfg.seed, pi), 2);
  const pageSlope = rng.g() * 0.35 * nat * cfg.lineSlope * (unruled ? 2.2 : 1);
  const baseSlant = cfg.slant * DEG;
  const thick0 = (cfg.thickness - 1 + pen.thick) * emPx * 0.05;
  const totalLines = Math.max(1, pg.lines.length);
  const strikes = [];
  const unders = [];
  let charIdx = 0, wordIdx = 0;
  let flow = rng.range(0.85, 1);

  const allLines = [...pg.fields, ...pg.lines];
  allLines.forEach((ln, li) => {
    const lrng = new Rng(hash('line', cfg.seed, pi, li, ln.kind));
    const progress = li / totalLines;
    const fat = cfg.fatigue ? 1 + 0.45 * clamp((pi + progress) / 3, 0, 1) : 1;
    const m = nat * fat;
    if (ln.kind === 'rule') {
      const y = ln.y * k, x0 = (ln.x0 + (L.right - L.left - ln.width) / 2) * k;
      ix.strokeStyle = cfg.ink; ix.lineCap = 'round'; ix.globalAlpha = pen.alpha;
      wavyStroke(ix, x0, y, x0 + ln.width * k, y + lrng.g() * 0.4 * k, 0.25 * k * (0.5 + m), lrng, Math.max(1, emPx * 0.06 + thick0 * 0.5));
      ix.globalAlpha = 1;
      return;
    }
    const slope = (pageSlope + lrng.g() * 0.32 * m * cfg.lineSlope * (unruled ? 1.7 : 1)) * DEG;
    const sitsAbove = L.ruled && ln.kind !== 'field' ? -(0.12 + lrng.range(0, 0.22)) * xh : 0;
    const baseOff = sitsAbove + lrng.g() * 0.07 * xh * m * cfg.baseline * (unruled ? 2 : 1);
    const marginX = ln.kind === 'body' || ln.kind === 'heading' ? nMargin((pi * 40 + li) * 0.23) * 1.6 * m * cfg.marginDrift * (unruled ? 2 : 1) : 0;
    const x0 = ln.x0 + marginX;
    const y0 = ln.y + baseOff;
    const cosS = Math.cos(slope), sinS = Math.sin(slope);
    let drift = 0;

    for (const tk of ln.tokens) {
      wordIdx++;
      const wsc = (tk.scale || 1) * (1 + (lrng.g() * 0.022 + nSize(wordIdx * 0.08) * 0.03) * m * cfg.sizeVar);
      const wordDy = lrng.g() * 0.05 * xh * m * cfg.baseline;
      const wordRot = lrng.g() * 0.5 * DEG * m * cfg.jitter;
      drift += lrng.g() * 0.035 * em * m;
      const lightness = lrng.g() * 0.04;
      if (pen.flow) { flow -= lrng.range(0.004, 0.012); if (flow < 0.72 || lrng.chance(0.015)) flow = lrng.range(0.95, 1.03); }
      const tkX = tk.x + drift;
      const bold = tk.bold ? emPx * 0.035 : 0;
      const baseColor = shade(rgb, 1 + lightness, pen.pencil ? 6 : 0);
      const dark = shade(rgb, 0.55);
      const glyphParams = (extraRot) => {
        const pr = nPress(charIdx * 0.13) * 0.5 + 0.5;
        const alpha = (pen.alpha - pen.alphaVar * (1 - pr) * cfg.pressure + lrng.g() * 0.025) * (pen.flow ? flow : 1);
        return {
          family, color: baseColor, dark,
          sc: wsc * (1 + lrng.g() * 0.03 * m * cfg.sizeVar),
          sx: 1 + lrng.g() * 0.025 * m * cfg.jitter,
          skew: Math.tan(baseSlant + lrng.g() * 2 * DEG * m * cfg.jitter),
          rot: slope + wordRot + extraRot,
          thick: thick0 + bold + lrng.g() * emPx * 0.006,
          alpha: tk.bold ? Math.min(1, alpha + 0.05) : alpha,
          pool: pen.pool || 0,
          grad: 1 - (1 - pen.grad) * cfg.pressure * lrng.range(0.5, 1),
          gradAng: Math.PI / 2 + lrng.g() * 0.9,
          warpA: emPx * 0.018 * m * cfg.warp * lrng.range(0.6, 1.3),
          warpF: lrng.range(2.2, 4.4),
          warpPh: lrng.range(0, 6.28),
        };
      };

      const place = (dxMm, dyMm) => {
        // position along the (sloped, wavy) line in px
        const lx = tkX + dxMm;
        const wave = nWave((x0 + lx) / 38 + li * 7.3) * 0.12 * xh * m * cfg.baseline * (unruled ? 1.6 : 1);
        const ly = wordDy + wave + dyMm;
        return [(x0 + lx * cosS - ly * sinS) * k, (y0 + lx * sinS + ly * cosS) * k];
      };

      if (doc.connected || tk.t.length === 1) {
        const p = glyphParams(0);
        p.warpA *= doc.connected ? 0.7 : 1;
        const [px, py] = place(0, 0);
        drawUnit(ix, S, tk.t, px, py, emPx, p);
        charIdx += tk.t.length;
      } else {
        const chars = [...tk.t];
        let prefix = '';
        for (let ci = 0; ci < chars.length; ci++) {
          const c = chars[ci];
          // kerning-preserving advance: width of the prefix
          const adv = (prefixWidth(ix, family, prefix, emPx) / k) * wsc + cfg.letterSpacing * em * ci;
          prefix += c;
          charIdx++;
          if (c === ' ') continue;
          const p = glyphParams(lrng.g() * 2.2 * DEG * m * cfg.jitter);
          const dy = lrng.g() * 0.075 * xh * m * cfg.jitter;
          const dx = lrng.g() * 0.02 * em * m * cfg.jitter;
          const [px, py] = place(adv + dx, dy);
          drawUnit(ix, S, c, px, py, emPx, p);
        }
      }

      // ballpoint blobs / fountain blots
      if (pen.blob && lrng.chance(pen.blob * (0.5 + nat))) {
        const [bx, by] = place(lrng.range(0, tk.w), -xh * lrng.range(0.1, 0.9));
        ix.fillStyle = dark; ix.globalAlpha = 0.55;
        ix.beginPath(); ix.ellipse(bx, by, emPx * lrng.range(0.018, 0.035), emPx * lrng.range(0.015, 0.03), lrng.range(0, 3), 0, Math.PI * 2); ix.fill();
        ix.globalAlpha = 1;
      }
      if (tk.kind === 'strike') strikes.push({ tk, place, lrng, wsc });
      if (tk.under) unders.push({ tk, place, lrng, level: ln.headingLevel });
    }
  });

  // cross-outs over the mistakes
  ix.strokeStyle = cfg.ink; ix.lineCap = 'round'; ix.lineJoin = 'round';
  const lw = Math.max(1, emPx * 0.065 + thick0 * 0.6);
  for (const { tk, place, lrng } of strikes) {
    const short = tk.t.length <= 3 || lrng.chance(0.3);
    ix.globalAlpha = pen.alpha;
    if (short) {
      // scribbled out: overlapping loops that fully cover the word, often gone over twice
      const span = tk.w + 1.2;
      const loops = Math.max(4, Math.round(span / (xh * 0.42)));
      const passes = tk.w > xh * 3 && lrng.chance(0.6) ? 2 : 1;
      ix.lineWidth = lw * 0.8;
      for (let pass = 0; pass < passes; pass++) {
        ix.beginPath();
        let [px, py] = place(-0.6, -0.4 * xh);
        ix.moveTo(px, py);
        for (let i = 0; i < loops; i++) {
          const t0 = (i + 0.5) / loops, t1 = (i + 1) / loops;
          const top = -(1.15 + lrng.g() * 0.12) * xh, bot = (0.2 + lrng.g() * 0.1) * xh;
          const [cx1, cy1] = place(-0.6 + t0 * span + lrng.g() * 0.4, (pass ? bot : top) * 1.25);
          const [ex1, ey1] = place(-0.6 + t1 * span - span / loops * 0.25, -0.45 * xh + lrng.g() * 0.1 * xh);
          ix.quadraticCurveTo(cx1, cy1, ex1, ey1);
          const [cx2, cy2] = place(-0.6 + t1 * span - span / loops * 0.6, (pass ? top : bot) * 1.25);
          const [ex2, ey2] = place(-0.6 + t1 * span + lrng.g() * 0.2, -0.5 * xh + lrng.g() * 0.1 * xh);
          ix.quadraticCurveTo(cx2, cy2, ex2, ey2);
        }
        ix.stroke();
      }
    } else {
      const passes = lrng.chance(0.55) ? 2 : 1;
      for (let i = 0; i < passes; i++) {
        const [ax, ay] = place(-0.6, -xh * (0.42 + i * 0.22) + lrng.g() * 0.08 * xh);
        const [bx, by] = place(tk.w + 0.6, -xh * (0.5 + i * 0.12) + lrng.g() * 0.1 * xh);
        wavyStroke(ix, ax, ay, bx, by, emPx * 0.012, lrng, lw);
      }
    }
  }
  for (const { tk, place, lrng, level } of unders) {
    ix.globalAlpha = pen.alpha;
    const [ax, ay] = place(-0.4, xh * 0.32);
    const [bx, by] = place(tk.w + 0.8, xh * (0.32 + lrng.g() * 0.08));
    wavyStroke(ix, ax, ay, bx, by, emPx * 0.012, lrng, lw * 0.85);
    if (level === 1 && lrng.chance(0.4)) {
      const [cx, cy] = place(0.5, xh * 0.6);
      const [dx, dy] = place(tk.w * 0.9, xh * 0.62);
      wavyStroke(ix, cx, cy, dx, dy, emPx * 0.01, lrng, lw * 0.75);
    }
  }
  ix.globalAlpha = 1;

  // ink texture
  if (pen.grain !== 'none') {
    const tile = grainTile(pen.grain);
    const pat = ix.createPattern(tile, 'repeat');
    const sc = (pen.grain === 'pencil' ? 0.07 : 0.06) * k;
    pat.setTransform(new DOMMatrix([sc, 0, 0, sc, rng.range(0, 200), rng.range(0, 200)]));
    ix.globalCompositeOperation = 'destination-out';
    ix.fillStyle = pat;
    ix.fillRect(0, 0, ink.width, ink.height);
    ix.globalCompositeOperation = 'source-over';
  }

  // smudge: side of the hand drags through wet ink
  if (cfg.smudges && pg.lines.length > 4 && rng.chance(0.55 + nat * 0.3)) {
    const ln = pg.lines[rng.int(1, pg.lines.length - 2)];
    if (ln && ln.tokens.length) {
      const t = rng.pick(ln.tokens);
      const sx = (ln.x0 + t.x + t.w * rng.range(0.3, 0.9)) * k, sy = (ln.y - xh * 0.4) * k;
      const sm = makeCanvas(emPx * 6, emPx * 3);
      const smx = sm.getContext('2d');
      smx.filter = `blur(${emPx * 0.18}px)`;
      smx.fillStyle = cfg.ink; smx.globalAlpha = rng.range(0.07, 0.13);
      smx.beginPath(); smx.ellipse(sm.width / 2, sm.height / 2, emPx * rng.range(1.4, 2.4), emPx * rng.range(0.25, 0.4), rng.range(-0.25, 0.1), 0, Math.PI * 2); smx.fill();
      ix.drawImage(sm, sx - sm.width / 2, sy - sm.height / 2);
    }
  }

  // composite: ink soaks into paper (multiply keeps rules & fibres visible)
  const sx = sheet.getContext('2d');
  sx.save();
  if (pen.bleed > 0) {
    sx.globalCompositeOperation = 'multiply';
    sx.globalAlpha = pen.bleed * 0.55;
    sx.filter = `blur(${Math.max(0.4, (pen.blur || 0.05) * k)}px)`;
    sx.drawImage(ink, 0, 0);
    sx.filter = 'none';
  }
  sx.globalAlpha = 1;
  sx.globalCompositeOperation = 'multiply';
  if (k > 4.5) sx.filter = `blur(${Math.min(0.6, 0.035 * k)}px)`;
  sx.drawImage(ink, 0, 0);
  sx.restore();
  return sheet;
}

const pwCache = new Map();
function prefixWidth(ctx, family, prefix, emPx) {
  if (!prefix) return 0;
  const key = family + '|' + emPx.toFixed(2) + '|' + prefix;
  let w = pwCache.get(key);
  if (w === undefined) {
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.font = `${emPx}px "${family}"`;
    w = ctx.measureText(prefix).width;
    ctx.restore();
    if (pwCache.size > 80000) pwCache.clear();
    pwCache.set(key, w);
  }
  return w;
}
