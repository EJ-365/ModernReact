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
      return true;
    } catch (e) {
      return false;
    }
  }

  function makeNoiseBuffer() {
    const len = Math.floor(ctx.sampleRate * 1.2);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * 0.35;
    return buf;
  }

  function stopBedNodes() {
    for (const n of [oscA, oscB, noise, noiseFilter]) {
      try { if (n) n.disconnect(); } catch (e) { /* ignore */ }
      try { if (n && n.stop) n.stop(); } catch (e) { /* ignore */ }
    }
    oscA = oscB = noise = noiseFilter = null;
  }

  function startBed(k) {
    if (!ensure() || !ctx) return;
    stopBedNodes();
    kind = k;
    const t = ctx.currentTime;

    oscA = ctx.createOscillator();
    oscB = ctx.createOscillator();
    const gA = ctx.createGain();
    const gB = ctx.createGain();
    noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.value = k === 'car' ? 900 : 1400;
    noiseFilter.Q.value = 0.6;

    if (k === 'car') {
      oscA.type = 'sawtooth'; oscA.frequency.value = 48;
      oscB.type = 'triangle'; oscB.frequency.value = 96;
      gA.gain.value = 0.12; gB.gain.value = 0.08;
    } else if (k === 'jet') {
      oscA.type = 'sawtooth'; oscA.frequency.value = 70;
      oscB.type = 'sine'; oscB.frequency.value = 140;
      gA.gain.value = 0.1; gB.gain.value = 0.06;
      noiseFilter.frequency.value = 2200;
    } else {
      /* prop / Cessna */
      oscA.type = 'triangle'; oscA.frequency.value = 85;
      oscB.type = 'sine'; oscB.frequency.value = 170;
      gA.gain.value = 0.11; gB.gain.value = 0.07;
    }

    oscA.connect(gA); gA.connect(bedGain);
    oscB.connect(gB); gB.connect(bedGain);

    noise = ctx.createBufferSource();
    noise.buffer = makeNoiseBuffer();
    noise.loop = true;
    const nGain = ctx.createGain();
    nGain.gain.value = k === 'car' ? 0.045 : 0.035;
    noise.connect(noiseFilter);
    noiseFilter.connect(nGain);
    nGain.connect(bedGain);

    oscA.start(t); oscB.start(t); noise.start(t);
  }

  function applyMaster() {
    if (!master || !ctx) return;
    const target = muted || !running ? 0 : Math.max(0, Math.min(1, vol)) * 0.55;
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
    startBed(k === 'jet' ? 'jet' : k === 'plane' || k === 'prop' ? 'prop' : 'car');
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
    const next = k === 'jet' ? 'jet' : (k === 'plane' || k === 'prop' ? 'prop' : 'car');
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

  /** Call each frame: speed m/s, kind car|prop|jet, phase string */
  function update(speedMps, vehKind, phase) {
    if (!running || !ctx || !bedGain) return;
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});

    const k = vehKind === 'jet' ? 'jet' : vehKind === 'car' ? 'car' : 'prop';
    if (k !== kind) startBed(k);

    const spd = Math.max(0, speedMps || 0);
    const norm = k === 'car'
      ? Math.min(1, spd / 40)
      : Math.min(1, spd / (k === 'jet' ? 120 : 55));
    const idle = k === 'car' ? 0.04 : 0.06;
    const level = muted ? 0.0001 : (idle + norm * (k === 'car' ? 0.22 : 0.28));
    bedGain.gain.setTargetAtTime(level, ctx.currentTime, 0.08);

    if (oscA) {
      const base = k === 'car' ? 42 : k === 'jet' ? 65 : 78;
      const span = k === 'car' ? 70 : k === 'jet' ? 90 : 100;
      oscA.frequency.setTargetAtTime(base + norm * span, ctx.currentTime, 0.1);
    }
    if (oscB) {
      const base = k === 'car' ? 84 : k === 'jet' ? 130 : 156;
      const span = k === 'car' ? 110 : k === 'jet' ? 140 : 160;
      oscB.frequency.setTargetAtTime(base + norm * span, ctx.currentTime, 0.1);
    }
    if (noiseFilter) {
      const f0 = k === 'car' ? 700 : k === 'jet' ? 1600 : 1100;
      noiseFilter.frequency.setTargetAtTime(f0 + norm * (k === 'car' ? 900 : 1800), ctx.currentTime, 0.12);
    }

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
