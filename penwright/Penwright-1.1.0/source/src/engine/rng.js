// Seeded randomness + smooth noise. Everything visual is driven from these so a
// seed always reproduces the same page at any resolution.
export function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hash(...parts) {
  let h = 2166136261 >>> 0;
  for (const p of parts) {
    const s = String(p);
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    h ^= 0x9e3779b9; h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export class Rng {
  constructor(seed) { this.r = mulberry32(seed >>> 0); this._g = null; }
  next() { return this.r(); }
  range(a, b) { return a + (b - a) * this.r(); }
  int(a, b) { return Math.floor(this.range(a, b + 1)); }
  chance(p) { return this.r() < p; }
  pick(arr) { return arr[Math.floor(this.r() * arr.length)]; }
  gauss() {
    if (this._g !== null) { const g = this._g; this._g = null; return g; }
    let u = 0, v = 0;
    while (u === 0) u = this.r();
    v = this.r();
    const m = Math.sqrt(-2 * Math.log(u));
    this._g = m * Math.sin(2 * Math.PI * v);
    return m * Math.cos(2 * Math.PI * v);
  }
  // gaussian clipped to +-limit sigmas (handwriting has no wild outliers)
  g(limit = 2.2) { const x = this.gauss(); return Math.max(-limit, Math.min(limit, x)); }
}

// 1D value noise with cosine interpolation, range ~[-1, 1].
export function noise1D(seed, octaves = 2) {
  const rng = mulberry32(seed);
  const N = 512, lat = new Float32Array(N);
  for (let i = 0; i < N; i++) lat[i] = rng() * 2 - 1;
  const one = (x) => {
    const i = Math.floor(x), f = x - i;
    const a = lat[((i % N) + N) % N], b = lat[(((i + 1) % N) + N) % N];
    const t = (1 - Math.cos(f * Math.PI)) / 2;
    return a + (b - a) * t;
  };
  return (x) => {
    let v = 0, amp = 1, freq = 1, norm = 0;
    for (let o = 0; o < octaves; o++) { v += one(x * freq + o * 31.7) * amp; norm += amp; amp *= 0.5; freq *= 2.03; }
    return v / norm;
  };
}

export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const lerp = (a, b, t) => a + (b - a) * t;

// 2D value noise, range ~[-1, 1]
export function noise2D(seed) {
  const rng = mulberry32(seed);
  const N = 256, perm = new Uint16Array(N * 2), val = new Float32Array(N);
  for (let i = 0; i < N; i++) { perm[i] = i; val[i] = rng() * 2 - 1; }
  for (let i = N - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [perm[i], perm[j]] = [perm[j], perm[i]]; }
  for (let i = 0; i < N; i++) perm[N + i] = perm[i];
  const v = (ix, iy) => val[perm[(perm[ix & 255] + iy) & 511] & 255];
  const s = (t) => t * t * (3 - 2 * t);
  return (x, y) => {
    const ix = Math.floor(x), iy = Math.floor(y), fx = s(x - ix), fy = s(y - iy);
    const a = v(ix, iy), b = v(ix + 1, iy), c = v(ix, iy + 1), d = v(ix + 1, iy + 1);
    return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
  };
}
