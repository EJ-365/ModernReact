/**
 * Ambient soundscapes for exploring the map — all generated with Web Audio (no files, no cost).
 * Plays only while looking around; silenced automatically inside a car or aircraft tour.
 */
export const AMBIENT_SCENES = [
  { id: 'city', name: 'Downtown city' },
  { id: 'rain', name: 'Gulf rain' },
  { id: 'park', name: 'Park birds' },
  { id: 'bayou', name: 'Bayou night' },
  { id: 'shore', name: 'Galveston shore' },
  { id: 'wind', name: 'Prairie wind' }
];

export function createAmbient() {
  let ctx = null, out = null, nodes = [], timers = [], scene = null, vol = 0.5, blocked = false;

  function ensure() {
    if (ctx) return true;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ctx = new AC();
    out = ctx.createGain(); out.gain.value = 0; out.connect(ctx.destination);
    const unlock = () => { if (ctx.state === 'suspended') ctx.resume().catch(() => {}); };
    for (const ev of ['pointerdown', 'keydown', 'touchend']) window.addEventListener(ev, unlock, { passive: true });
    return true;
  }
  function noiseBuf(kind) {
    const len = ctx.sampleRate * 3, b = ctx.createBuffer(1, len, ctx.sampleRate), d = b.getChannelData(0);
    let l = 0, p0 = 0, p1 = 0, p2 = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      if (kind === 'brown') { l = (l + 0.02 * w) / 1.02; d[i] = l * 3.5; }
      else if (kind === 'pink') { p0 = 0.997 * p0 + w * 0.029; p1 = 0.985 * p1 + w * 0.032; p2 = 0.95 * p2 + w * 0.048; d[i] = (p0 + p1 + p2 + w * 0.02) * 2.2; }
      else d[i] = w;
    }
    return b;
  }
  function bed(kind, type, freq, q, gain, lfoHz, lfoDepth) {
    const src = ctx.createBufferSource(); src.buffer = noiseBuf(kind); src.loop = true;
    const f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q || 0.7;
    const g = ctx.createGain(); g.gain.value = gain;
    src.connect(f); f.connect(g); g.connect(out); src.start();
    nodes.push(src, f, g);
    if (lfoHz) {
      const o = ctx.createOscillator(), og = ctx.createGain();
      o.frequency.value = lfoHz; og.gain.value = gain * lfoDepth; o.connect(og); og.connect(g.gain); o.start();
      nodes.push(o, og);
    }
    return g;
  }
  /* repeating one-shot events (bird chirps, frogs, distant horns) at random intervals */
  function every(minS, maxS, fn) {
    const tick = () => { if (!scene) return; try { fn(ctx.currentTime); } catch (_) {} timers.push(setTimeout(tick, (minS + Math.random() * (maxS - minS)) * 1000)); };
    timers.push(setTimeout(tick, 400 + Math.random() * 1500));
  }
  function tone(t, type, f0, f1, dur, gain, bend) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur * (bend || 1));
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(gain, t + Math.min(0.03, dur * 0.2)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(out); o.start(t); o.stop(t + dur + 0.05);
  }
  const chirp = (t) => { const base = 2600 + Math.random() * 2200, n = 2 + (Math.random() * 4 | 0); for (let i = 0; i < n; i++) tone(t + i * 0.11, 'sine', base, base * (0.7 + Math.random() * 0.6), 0.08, 0.05); };
  const frog = (t) => { const f = 160 + Math.random() * 120; for (let i = 0; i < 2; i++) tone(t + i * 0.22, 'square', f, f * 0.8, 0.14, 0.03); };
  const cricket = (t) => { const f = 4200 + Math.random() * 600; for (let i = 0; i < 6; i++) tone(t + i * 0.045, 'sine', f, f, 0.03, 0.025); };
  const horn = (t) => { const f = 330 + Math.random() * 120; tone(t, 'sawtooth', f, f, 0.35 + Math.random() * 0.4, 0.012); };
  const gull = (t) => { tone(t, 'triangle', 1500, 900, 0.35, 0.03); tone(t + 0.4, 'triangle', 1400, 850, 0.3, 0.025); };
  const thunder = () => { const g = bed('brown', 'lowpass', 140, 0.5, 0.0001); const t = ctx.currentTime; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.9, t + 0.4); g.gain.exponentialRampToValueAtTime(0.0001, t + 5); };

  const BUILD = {
    city() { bed('brown', 'lowpass', 380, 0.7, 0.55, 0.07, 0.25); bed('pink', 'bandpass', 1100, 0.6, 0.05, 0.13, 0.5); every(5, 14, horn); every(9, 20, chirp); },
    rain() { bed('white', 'highpass', 1400, 0.5, 0.22, 0.05, 0.2); bed('pink', 'lowpass', 700, 0.6, 0.35); every(25, 60, thunder); },
    park() { bed('pink', 'lowpass', 900, 0.5, 0.12, 0.09, 0.6); every(0.8, 3, chirp); every(15, 30, horn); },
    bayou() { bed('pink', 'lowpass', 500, 0.6, 0.12, 0.05, 0.4); every(1.2, 3.5, frog); every(0.4, 1.4, cricket); },
    shore() { bed('pink', 'lowpass', 650, 0.6, 0.5, 0.11, 0.85); bed('white', 'highpass', 2500, 0.5, 0.05, 0.11, 0.9); every(6, 16, gull); },
    wind() { bed('pink', 'bandpass', 420, 1.4, 0.35, 0.05, 0.7); bed('brown', 'lowpass', 200, 0.5, 0.25, 0.031, 0.6); every(4, 12, chirp); }
  };

  function teardown() {
    for (const t of timers) clearTimeout(t); timers = [];
    for (const n of nodes) { try { n.stop && n.stop(); } catch (_) {} try { n.disconnect(); } catch (_) {} }
    nodes = [];
  }
  function apply() {
    if (!ctx) return;
    const want = scene && !blocked && !document.hidden ? vol * 0.6 : 0;
    out.gain.setTargetAtTime(want, ctx.currentTime, 0.4);
  }
  function play(id) {
    if (!BUILD[id]) id = null;
    if (id && !ensure()) return;
    teardown(); scene = id;
    if (id) { if (ctx.state === 'suspended') ctx.resume().catch(() => {}); BUILD[id](); }
    apply();
  }
  document.addEventListener('visibilitychange', apply);
  return {
    play,
    stop: () => play(null),
    get scene() { return scene; },
    setVolume(v) { vol = Math.max(0, Math.min(1, v)); apply(); },
    /* true while driving or flying: ambient fades out and resumes when you're back to exploring */
    setBlocked(b) { if (b !== blocked) { blocked = b; apply(); } },
    get blocked() { return blocked; }
  };
}
