/**
 * Lean Web Audio for Tour Houston — no sample files, cheap oscillators.
 * Engine/road bed + short event cues. Muteable; starts only after a user gesture.
 */

export function createTourAudio() {
  let ctx = null, master = null, bedGain = null, cueGain = null, radioGain = null;
  let oscA = null, oscB = null, noise = null, noiseFilter = null;
  let kind = 'car', muted = false, vol = 0.45, running = false;
  let radioOn = true, lastPhase = '', lastCueAt = 0, nextRadioAt = 0;

  function ensure() {
    if (ctx) return true;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0;
      master.connect(ctx.destination);
      bedGain = ctx.createGain();
      bedGain.gain.value = 0.0001;
      bedGain.connect(master);
      cueGain = ctx.createGain();
      cueGain.gain.value = 0.7;
      cueGain.connect(master);
      radioGain = ctx.createGain();
      radioGain.gain.value = 0.55;
      radioGain.connect(master);
      /* if the context was created outside a click (async tour start), resume it on the next tap or key */
      const unlock = () => { if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {}); };
      for (const ev of ['pointerdown', 'keydown', 'touchend']) window.addEventListener(ev, unlock, { passive: true });
      return true;
    } catch (e) {
      return false;
    }
  }

  const KINDS = ['car', 'prop', 'turboprop', 'heli', 'jet', 'fighter'];
  const normKind = (k) => (KINDS.includes(k) ? k : k === 'plane' ? 'prop' : 'car');
  let amp = null, toneLP = null, gTone = null, gWhine = null, lfo = null, lfoGain = null;
  /* Per-vehicle engine bed — in-cabin character:
     car: engine growl + road hiss · prop: 4-cyl piston buzz at firing rate · turboprop: constant-speed prop drone
     heli: 27.5 Hz blade-pass + per-rev rotor thump + turbine whine · jet: deep cabin rumble + fan whine · fighter: roar + whine */
  const BED = {
    car: { a: 'sawtooth', b: 'triangle', ga: 0.26, gb: 0.14, lp: 1400, nLp: 900, nG: 0.07, brown: false, lfoF: 0, lfoD: 0 },
    prop: { a: 'sawtooth', b: 'square', ga: 0.16, gb: 0.035, lp: 450, nLp: 500, nG: 0.9, brown: true, lfoF: 4, lfoD: 0.06 },
    turboprop: { a: 'sawtooth', b: 'sine', ga: 0.14, gb: 0.05, lp: 380, nLp: 420, nG: 1.0, brown: true, lfoF: 1.3, lfoD: 0.08 },
    heli: { a: 'sawtooth', b: 'sine', ga: 0.16, gb: 0.006, lp: 220, nLp: 600, nG: 0.8, brown: true, lfoF: 6.9, lfoD: 0.35, whine: true },
    jet: { a: 'sine', b: 'sine', ga: 0.07, gb: 0.006, lp: 200, nLp: 350, nG: 1.3, brown: true, lfoF: 0.25, lfoD: 0.03, whine: true },
    fighter: { a: 'sawtooth', b: 'sine', ga: 0.09, gb: 0.008, lp: 300, nLp: 700, nG: 1.4, brown: true, lfoF: 0, lfoD: 0, whine: true },
  };

  function makeNoiseBuffer(brown) {
    const len = Math.floor(ctx.sampleRate * 2);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      if (brown) { last = (last + 0.02 * w) / 1.02; d[i] = last * 3.2; } else d[i] = w * 0.35;
    }
    return buf;
  }

  function stopBedNodes() {
    for (const n of [oscA, oscB, noise, noiseFilter, lfo, lfoGain, amp, toneLP, gTone, gWhine]) {
      try { if (n) n.disconnect(); } catch (e) { /* ignore */ }
      try { if (n && n.stop) n.stop(); } catch (e) { /* ignore */ }
    }
    oscA = oscB = noise = noiseFilter = lfo = lfoGain = amp = toneLP = gTone = gWhine = null;
  }

  function startBed(k) {
    if (!ensure() || !ctx) return;
    stopBedNodes();
    kind = normKind(k);
    const c = BED[kind], t = ctx.currentTime;
    amp = ctx.createGain(); amp.gain.value = 1; amp.connect(bedGain);
    toneLP = ctx.createBiquadFilter(); toneLP.type = 'lowpass'; toneLP.frequency.value = c.lp; toneLP.Q.value = 0.7; toneLP.connect(amp);
    oscA = ctx.createOscillator(); oscA.type = c.a; oscA.frequency.value = 60;
    oscB = ctx.createOscillator(); oscB.type = c.b; oscB.frequency.value = 120;
    gTone = ctx.createGain(); gTone.gain.value = c.ga;
    gWhine = ctx.createGain(); gWhine.gain.value = c.gb;
    oscA.connect(gTone); gTone.connect(toneLP);
    oscB.connect(gWhine); gWhine.connect(c.whine ? amp : toneLP);
    noise = ctx.createBufferSource(); noise.buffer = makeNoiseBuffer(c.brown); noise.loop = true;
    noiseFilter = ctx.createBiquadFilter(); noiseFilter.type = 'lowpass'; noiseFilter.frequency.value = c.nLp; noiseFilter.Q.value = 0.6;
    const nGain = ctx.createGain(); nGain.gain.value = c.nG;
    noise.connect(noiseFilter); noiseFilter.connect(nGain); nGain.connect(amp);
    if (c.lfoF) {
      lfo = ctx.createOscillator(); lfo.type = 'sine'; lfo.frequency.value = c.lfoF;
      lfoGain = ctx.createGain(); lfoGain.gain.value = c.lfoD;
      lfo.connect(lfoGain); lfoGain.connect(amp.gain); lfo.start(t);
    }
    oscA.start(t); oscB.start(t); noise.start(t);
  }

  function applyMaster() {
    if (!master || !ctx) return;
    const target = muted || !running ? 0 : Math.max(0, Math.min(1, vol)) * 0.8;
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setTargetAtTime(target, ctx.currentTime, 0.05);
  }

  function start(k, opts = {}) {
    if (opts.muted != null) muted = !!opts.muted;
    if (Number.isFinite(opts.vol)) vol = Math.max(0, Math.min(1, opts.vol));
    if (opts.radioOn != null) radioOn = !!opts.radioOn;
    if (!ensure()) return false;
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    running = true;
    lastPhase = '';
    nextRadioAt = performance.now() + 2500;
    startBed(normKind(k));
    applyMaster();
    return true;
  }

  function setRadio(on) {
    radioOn = !!on;
    if (radioOn && running) nextRadioAt = performance.now() + 800;
  }

  /* Short ATC-style squawk bursts — band-limited noise + tone (not speech synthesis) */
  function radioBurst() {
    if (!ctx || muted || !running || !radioOn || !radioGain) return;
    const t = ctx.currentTime;
    const dur = 0.55 + Math.random() * 0.9;
    const src = ctx.createBufferSource();
    src.buffer = makeNoiseBuffer();
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 900 + Math.random() * 700;
    bp.Q.value = 2.2;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.09 + Math.random() * 0.05, t + 0.04);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(bp); bp.connect(g); g.connect(radioGain);
    src.start(t); src.stop(t + dur + 0.02);
    /* carrier beep like a keyed mic */
    const o = ctx.createOscillator();
    const og = ctx.createGain();
    o.type = 'square';
    o.frequency.value = 380 + Math.random() * 220;
    og.gain.setValueAtTime(0.0001, t);
    og.gain.exponentialRampToValueAtTime(0.035, t + 0.02);
    og.gain.exponentialRampToValueAtTime(0.0001, t + Math.min(0.35, dur * 0.45));
    o.connect(og); og.connect(radioGain);
    o.start(t); o.stop(t + dur);
  }

  function setKind(k) {
    if (!running) return;
    const next = normKind(k);
    if (next !== kind) startBed(next);
  }

  function setMuted(m) {
    muted = !!m;
    applyMaster();
  }

  function setVolume(v) {
    vol = Math.max(0, Math.min(1, +v || 0));
    applyMaster();
  }

  function stop() {
    running = false;
    lastPhase = '';
    nextRadioAt = 0;
    if (ctx && master) {
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setTargetAtTime(0, ctx.currentTime, 0.04);
    }
    stopBedNodes();
  }

  function beep(freq, dur, type, gain) {
    if (!ctx || muted || !running) return;
    const t = ctx.currentTime;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type || 'sine';
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain || 0.18, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(cueGain);
    o.start(t); o.stop(t + dur + 0.02);
  }

  function cue(name) {
    if (!ctx || muted || !running) return;
    const now = performance.now();
    if (now - lastCueAt < 400 && name !== 'arrive') return;
    lastCueAt = now;
    if (name === 'takeoff') {
      beep(220, 0.18, 'triangle', 0.14);
      setTimeout(() => beep(330, 0.22, 'triangle', 0.12), 120);
    } else if (name === 'land') {
      beep(180, 0.12, 'sine', 0.16);
      setTimeout(() => beep(140, 0.28, 'triangle', 0.1), 80);
    } else if (name === 'arrive') {
      beep(392, 0.16, 'sine', 0.14);
      setTimeout(() => beep(523, 0.22, 'sine', 0.12), 140);
      setTimeout(() => beep(659, 0.28, 'sine', 0.1), 280);
    } else if (name === 'start') {
      beep(262, 0.1, 'sine', 0.08);
      setTimeout(() => beep(330, 0.12, 'sine', 0.07), 90);
    }
  }

  /** Call each frame: speed m/s, kind car|prop|turboprop|heli|jet|fighter, phase string, engine power 0–1 (aircraft) */
  function update(speedMps, vehKind, phase, power) {
    if (!running || !ctx || !bedGain) return;
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});

    const k = normKind(vehKind);
    if (k !== kind) startBed(k);

    const spd = Math.max(0, speedMps || 0);
    const p = k === 'car' ? Math.min(1, spd / 40)
      : Number.isFinite(power) ? Math.max(0, Math.min(1, power)) : Math.min(1, spd / (k === 'jet' || k === 'fighter' ? 120 : 55));
    /* measured: car bed was -58 dBFS at idle and mostly below 180 Hz, so laptop speakers dropped it; aircraft -40…-30 dBFS */
    const level = muted ? 0.0001 : k === 'car' ? 0.16 + p * 0.3 : k === 'heli' ? 0.32 + p * 0.18 : 0.24 + p * 0.38;
    const T = ctx.currentTime, at = (prm, v, tc = 0.12) => { if (prm) prm.setTargetAtTime(v, T, tc); };
    at(bedGain && bedGain.gain, level, 0.15);
    let fa, fb, lp, nlp;
    if (k === 'car') { fa = 58 + p * 120; fb = fa * 2; lp = 1300 + p * 1500; nlp = 800 + p * 1400; }
    else if (k === 'prop') { const rpm = 600 + Math.sqrt(p) * 1850, f = rpm / 60 * 2; fa = f; fb = f * 2; lp = 380 + p * 500; nlp = 380 + p * 600; }
    else if (k === 'turboprop') { fa = 68; fb = 136; lp = 300 + p * 300; nlp = 330 + p * 500; }
    else if (k === 'heli') { fa = 27.5; fb = 5600 + p * 500; lp = 220; nlp = 450 + p * 400; }
    else if (k === 'jet') { fa = 50 + p * 25; fb = 900 + p * 2400; lp = 200; nlp = 260 + p * 520; at(gWhine && gWhine.gain, 0.003 + p * 0.01); }
    else { fa = 35 + p * 40; fb = 1800 + p * 3200; lp = 300; nlp = 450 + p * 1600; at(gWhine && gWhine.gain, 0.004 + p * 0.012); }
    at(oscA && oscA.frequency, fa, 0.25);
    at(oscB && oscB.frequency, fb, 0.35);
    at(toneLP && toneLP.frequency, lp, 0.2);
    at(noiseFilter && noiseFilter.frequency, nlp, 0.25);

    if (phase && phase !== lastPhase) {
      const prev = lastPhase;
      lastPhase = phase;
      if (phase === 'climb' && (prev === 'roll' || prev === '')) { cue('takeoff'); nextRadioAt = performance.now() + 600; }
      else if (phase === 'rollout' && (prev === 'final' || prev === 'toFaf')) { cue('land'); nextRadioAt = performance.now() + 400; }
      else if ((phase === 'arrived' || phase === 'orbit') && prev && prev !== phase) cue('arrive');
      else if ((phase === 'drive' || phase === 'roll' || phase === 'free') && !prev) cue('start');
      else if (phase === 'toFaf' || phase === 'final') nextRadioAt = Math.min(nextRadioAt, performance.now() + 500);
    }

    const now = performance.now();
    if (radioOn && !muted && now >= nextRadioAt) {
      radioBurst();
      nextRadioAt = now + 7000 + Math.random() * 9000;
      if (/roll|toFaf|final|climb/.test(phase || '')) nextRadioAt = now + 4000 + Math.random() * 4000;
    }
  }

  return {
    start, stop, update, setMuted, setVolume, setKind, setRadio, cue,
    get muted() { return muted; },
    get volume() { return vol; },
    get radioOn() { return radioOn; },
    get ok() { return !!ctx; },
  };
}
