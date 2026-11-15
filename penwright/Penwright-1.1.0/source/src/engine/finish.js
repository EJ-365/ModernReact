import { Rng, hash, noise2D, clamp } from './rng.js';

function makeCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(w)); c.height = Math.max(1, Math.round(h));
  return c;
}

const noiseTiles = new Map();
function sensorNoise(mono = true) {
  const key = 'n' + mono;
  if (noiseTiles.has(key)) return noiseTiles.get(key);
  const N = 256, c = makeCanvas(N, N), x = c.getContext('2d');
  const img = x.createImageData(N, N);
  const rng = new Rng(hash('sensor', mono));
  for (let i = 0; i < N * N; i++) {
    const v = 128 + rng.g(3) * 42;
    img.data[i * 4] = mono ? v : 128 + rng.g(3) * 42;
    img.data[i * 4 + 1] = v;
    img.data[i * 4 + 2] = mono ? v : 128 + rng.g(3) * 42;
    img.data[i * 4 + 3] = 255;
  }
  x.putImageData(img, 0, 0);
  noiseTiles.set(key, c);
  return c;
}

function overlayNoise(ctx, w, h, alpha, mono = true) {
  ctx.save();
  ctx.globalCompositeOperation = 'overlay';
  ctx.globalAlpha = alpha;
  ctx.fillStyle = ctx.createPattern(sensorNoise(mono), 'repeat');
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

// --- desk surfaces (procedural, cached per size) -----------------------------
const surfCache = new Map();
export function renderSurface(kind, w, h, seed = 1) {
  const key = `${kind}:${w}x${h}:${seed}`;
  if (surfCache.has(key)) return surfCache.get(key);
  const sc = 0.5;
  const sw = Math.ceil(w * sc), sh = Math.ceil(h * sc);
  const c = makeCanvas(sw, sh), x = c.getContext('2d');
  const img = x.createImageData(sw, sh);
  const n = noise2D(hash('surf', kind, seed));
  const n2 = noise2D(hash('surf2', kind, seed));
  const rng = new Rng(hash('surf3', kind, seed));
  const pal = {
    oak: [[176, 128, 82], [138, 92, 54]],
    walnut: [[96, 62, 40], [58, 36, 24]],
    white: [[232, 231, 228], [214, 213, 210]],
    slate: [[58, 61, 66], [40, 42, 46]],
    linen: [[214, 204, 186], [190, 178, 158]],
    concrete: [[160, 158, 154], [128, 126, 122]],
  }[kind] || [[176, 128, 82], [138, 92, 54]];
  const plank = Math.max(60, sh / rng.range(3.2, 4.4));
  const plankOff = [];
  for (let i = 0; i < 40; i++) plankOff.push(rng.range(0, 1000));
  for (let y = 0; y < sh; y++) {
    for (let xx = 0; xx < sw; xx++) {
      let t;
      if (kind === 'oak' || kind === 'walnut') {
        const pi = Math.floor(y / plank);
        const o = plankOff[pi % 40];
        const warp = n((xx + o) * 0.004, y * 0.02) * 6 + n2((xx + o) * 0.02, y * 0.08) * 0.6;
        const ring = Math.sin((y * 0.33 + warp * 3.2) * 1.0) * 0.5 + 0.5;
        const fine = n2((xx + o) * 0.3, y * 1.4) * 0.5 + 0.5;
        t = clamp(ring * 0.55 + fine * 0.3 + n(xx * 0.01, y * 0.05) * 0.25, 0, 1);
        const seam = Math.abs((y % plank) - plank + 0.5) < 1.2 || (y % plank) < 1 ? 0.45 : 1;
        const [a, b] = pal;
        const i = (y * sw + xx) * 4;
        img.data[i] = (a[0] + (b[0] - a[0]) * t) * seam;
        img.data[i + 1] = (a[1] + (b[1] - a[1]) * t) * seam;
        img.data[i + 2] = (a[2] + (b[2] - a[2]) * t) * seam;
        img.data[i + 3] = 255;
        continue;
      }
      if (kind === 'linen') {
        const weave = (Math.sin(xx * 1.9) * Math.sin(y * 1.9) * 0.5 + 0.5) * 0.35;
        t = clamp(weave + n(xx * 0.05, y * 0.05) * 0.2 + n2(xx * 0.9, y * 0.12) * 0.25 + 0.3, 0, 1);
      } else if (kind === 'concrete') {
        t = clamp(0.5 + n(xx * 0.02, y * 0.02) * 0.3 + n2(xx * 0.4, y * 0.4) * 0.25 + (rng.next() - 0.5) * 0.25, 0, 1);
      } else {
        t = clamp(0.5 + n(xx * 0.008, y * 0.008) * 0.35 + (rng.next() - 0.5) * 0.12, 0, 1);
      }
      const [a, b] = pal;
      const i = (y * sw + xx) * 4;
      img.data[i] = a[0] + (b[0] - a[0]) * t;
      img.data[i + 1] = a[1] + (b[1] - a[1]) * t;
      img.data[i + 2] = a[2] + (b[2] - a[2]) * t;
      img.data[i + 3] = 255;
    }
  }
  x.putImageData(img, 0, 0);
  const out = makeCanvas(w, h);
  const ox = out.getContext('2d');
  ox.imageSmoothingQuality = 'high';
  ox.drawImage(c, 0, 0, w, h);
  if (kind === 'oak' || kind === 'walnut') {
    // varnish sheen
    const g = ox.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, 'rgba(255,240,220,0.10)'); g.addColorStop(0.5, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(0,0,0,0.12)');
    ox.fillStyle = g; ox.fillRect(0, 0, w, h);
  }
  if (surfCache.size > 6) surfCache.clear();
  surfCache.set(key, out);
  return out;
}

// --- finishes ------------------------------------------------------------------
export function applyFinish(page, cfg, pi, k) {
  const f = cfg.finish;
  if (f === 'scan') return scanFinish(page, cfg, pi, k, false);
  if (f === 'copy') return scanFinish(page, cfg, pi, k, true);
  if (f === 'photo') return photoFinish(page, cfg, pi, k);
  const c = makeCanvas(page.width, page.height), x = c.getContext('2d');
  x.fillStyle = '#ffffff'; x.fillRect(0, 0, c.width, c.height);
  x.drawImage(page, 0, 0);
  return c;
}

function scanFinish(page, cfg, pi, k, copy) {
  const rng = new Rng(hash('scan', cfg.seed, pi));
  const W = page.width, H = page.height;
  const c = makeCanvas(W, H), x = c.getContext('2d');
  x.fillStyle = copy ? '#fafafa' : '#f1f1ee';
  x.fillRect(0, 0, W, H);
  const ang = rng.g() * (copy ? 0.5 : 0.35) * (Math.PI / 180) * (0.5 + cfg.tilt);
  const s = 0.985;
  x.save();
  x.translate(W / 2 + rng.g() * 1.2 * k, H / 2 + rng.g() * 1.2 * k);
  x.rotate(ang);
  x.shadowColor = 'rgba(0,0,0,0.25)';
  x.shadowBlur = 1.6 * k;
  x.drawImage(page, (-W / 2) * s, (-H / 2) * s, W * s, H * s);
  x.restore();
  // lid shadow along one edge + uneven lamp
  const side = rng.chance(0.5);
  const g = x.createLinearGradient(side ? 0 : W, 0, side ? 7 * k : W - 7 * k, 0);
  g.addColorStop(0, `rgba(0,0,0,${copy ? 0.5 : 0.16})`); g.addColorStop(1, 'rgba(0,0,0,0)');
  x.fillStyle = g; x.fillRect(0, 0, W, H);
  const lamp = x.createLinearGradient(0, 0, 0, H);
  lamp.addColorStop(0, 'rgba(255,255,255,0.03)'); lamp.addColorStop(rng.range(0.3, 0.7), 'rgba(0,0,0,0.025)'); lamp.addColorStop(1, 'rgba(255,255,255,0.02)');
  x.fillStyle = lamp; x.fillRect(0, 0, W, H);

  const out = makeCanvas(W, H), o = out.getContext('2d');
  o.filter = copy
    ? `grayscale(1) contrast(1.75) brightness(1.12) blur(${Math.max(0.3, 0.06 * k)}px)`
    : `contrast(1.08) saturate(0.86) brightness(1.02) blur(${Math.max(0.2, 0.03 * k)}px)`;
  o.drawImage(c, 0, 0);
  o.filter = 'none';
  overlayNoise(o, W, H, copy ? 0.12 : 0.06);
  if (copy) {
    // toner specks and drum streak
    for (let i = 0; i < 220; i++) {
      o.fillStyle = `rgba(0,0,0,${rng.range(0.25, 0.7)})`;
      o.beginPath(); o.arc(rng.range(0, W), rng.range(0, H), rng.range(0.05, 0.22) * k, 0, Math.PI * 2); o.fill();
    }
    const sx = rng.range(0.1, 0.9) * W;
    o.fillStyle = 'rgba(0,0,0,0.04)'; o.fillRect(sx, 0, rng.range(0.6, 2) * k, H);
    o.strokeStyle = 'rgba(0,0,0,0.55)'; o.lineWidth = rng.range(1.5, 4) * k;
    o.strokeRect(0, 0, W, H);
  }
  return out;
}

// Perspective by scanline: each row of the page is drawn narrower toward the far edge.
function perspective(page, topScale, shift) {
  const W = page.width, H = page.height;
  const c = makeCanvas(W, H), x = c.getContext('2d');
  x.imageSmoothingQuality = 'high';
  const step = 2;
  for (let y = 0; y < H; y += step) {
    const t = y / H;
    const s = topScale + (1 - topScale) * t;
    const rw = W * s;
    const xo = (W - rw) / 2 + shift * (1 - t) * W;
    x.drawImage(page, 0, y, W, step, xo, y, rw, step + 0.6);
  }
  return c;
}

function photoFinish(page, cfg, pi, k) {
  const rng = new Rng(hash('photo', cfg.seed, pi));
  const W = page.width, H = page.height;
  const OW = Math.round(W * 1.2), OH = Math.round(H * 1.16);
  const c = makeCanvas(OW, OH), x = c.getContext('2d');
  x.drawImage(renderSurface(cfg.surface, OW, OH, cfg.seed % 7), 0, 0);

  // paper: gentle curl/bend shading before perspective
  const p = makeCanvas(W, H), px = p.getContext('2d');
  px.drawImage(page, 0, 0);
  px.globalCompositeOperation = 'source-atop';
  const curl = px.createLinearGradient(0, 0, W, 0);
  const cpos = rng.range(0.25, 0.75);
  curl.addColorStop(0, 'rgba(0,0,0,0.06)');
  curl.addColorStop(cpos, 'rgba(255,255,255,0.05)');
  curl.addColorStop(Math.min(0.99, cpos + 0.12), 'rgba(0,0,0,0.035)');
  curl.addColorStop(1, 'rgba(0,0,0,0.08)');
  px.fillStyle = curl; px.fillRect(0, 0, W, H);
  px.globalCompositeOperation = 'source-over';

  const tilt = cfg.tilt;
  const warped = perspective(p, 1 - rng.range(0.015, 0.05) * (0.3 + tilt), rng.g() * 0.006 * tilt);
  const ang = rng.g() * 1.6 * (Math.PI / 180) * (0.25 + tilt);
  const scale = 0.94;

  x.save();
  x.translate(OW / 2 + rng.g() * 0.01 * OW, OH / 2 + rng.g() * 0.01 * OH);
  x.rotate(ang);
  x.shadowColor = 'rgba(0,0,0,0.42)';
  x.shadowBlur = 5 * k;
  x.shadowOffsetX = 1.5 * k;
  x.shadowOffsetY = 2.5 * k;
  x.drawImage(warped, (-W / 2) * scale, (-H / 2) * scale, W * scale, H * scale);
  x.shadowColor = 'rgba(0,0,0,0.25)';
  x.shadowBlur = 0.6 * k; x.shadowOffsetX = 0.2 * k; x.shadowOffsetY = 0.3 * k;
  x.globalCompositeOperation = 'source-over';
  x.restore();

  // hand / phone shadow
  if (cfg.handShadow) {
    const hx = rng.chance(0.5) ? OW * rng.range(0.85, 1.05) : OW * rng.range(-0.05, 0.15);
    const hy = OH * rng.range(0.75, 1.05);
    const g = x.createRadialGradient(hx, hy, 0, hx, hy, OW * 0.55);
    g.addColorStop(0, 'rgba(10,8,5,0.34)'); g.addColorStop(0.55, 'rgba(10,8,5,0.16)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = g; x.fillRect(0, 0, OW, OH);
  }

  // window light: bright side & falloff
  const L = 0.4 + cfg.light * 0.8;
  const lx = rng.range(0.1, 0.9) * OW, ly = rng.range(-0.1, 0.3) * OH;
  const hl = x.createRadialGradient(lx, ly, 0, lx, ly, Math.max(OW, OH) * 1.05);
  hl.addColorStop(0, `rgba(255,250,235,${0.14 * L})`);
  hl.addColorStop(0.5, 'rgba(255,250,235,0)');
  hl.addColorStop(1, `rgba(0,0,0,${0.3 * (1.3 - L * 0.5)})`);
  x.fillStyle = hl; x.fillRect(0, 0, OW, OH);
  const vg = x.createRadialGradient(OW / 2, OH / 2, Math.min(OW, OH) * 0.35, OW / 2, OH / 2, Math.max(OW, OH) * 0.75);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.28)');
  x.fillStyle = vg; x.fillRect(0, 0, OW, OH);

  // camera: warm white balance, slight softness, sensor noise
  const out = makeCanvas(OW, OH), o = out.getContext('2d');
  o.filter = `saturate(1.04) contrast(1.03) sepia(0.06) blur(${Math.max(0.3, 0.05 * k)}px)`;
  o.drawImage(c, 0, 0);
  o.filter = 'none';
  overlayNoise(o, OW, OH, 0.09, false);
  return out;
}
