/**
 * Procedural soundtrack & SFX via the Web Audio API — no external audio files.
 *   - exploration: mellow lo-fi pad + soft bass + sparse bells
 *   - battle: driving 8-bit square arpeggio + punchy bass
 *
 * Music starts lazily on the first user gesture (browser autoplay policy).
 * Drop real tracks in /public/assets/audio and swap this out later if desired.
 */
export class AudioSystem {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.musicGain = null;
    this.sfxGain = null;
    this.mode = null; // 'explore' | 'battle' | null
    this.muted = false;
    this._timer = null;
    this._step = 0;
    this._nextTime = 0;
    this._stepDur = 0.3;
  }

  init() {
    if (this.ctx) return;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    this.ctx = new Ctx();
    this.master = this.ctx.createGain();
    this.master.gain.value = this.muted ? 0 : 0.5;
    this.master.connect(this.ctx.destination);

    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.value = 0.5;
    const lp = this.ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 3200;
    this.musicGain.connect(lp);
    lp.connect(this.master);

    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.value = 0.7;
    this.sfxGain.connect(this.master);
  }

  _ensure() {
    if (!this.ctx) this.init();
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  }

  /** Begin/continue music in a given mode. */
  start(mode) {
    this._ensure();
    if (!this.ctx) return;
    this.mode = mode;
    this._stepDur = mode === 'battle' ? 0.15 : 0.3;
    if (!this._timer) {
      this._nextTime = this.ctx.currentTime + 0.05;
      this._timer = setInterval(() => this._scheduler(), 25);
    }
  }

  stopMusic() {
    this.mode = null;
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.master) this.master.gain.value = this.muted ? 0 : 0.5;
    return this.muted;
  }

  // ------------------------------------------------------ scheduler
  _scheduler() {
    if (!this.ctx) return;
    const lookahead = 0.12;
    while (this._nextTime < this.ctx.currentTime + lookahead) {
      if (this.mode) this._scheduleStep(this._nextTime);
      this._nextTime += this._stepDur;
      this._step = (this._step + 1) % 64;
    }
  }

  _scheduleStep(t) {
    const battle = this.mode === 'battle';
    const bar = Math.floor(this._step / 16) % 4;
    const roots = battle ? [45, 45, 43, 41] : [45, 41, 43, 40]; // A,F,G,E-ish
    const root = roots[bar];
    const scale = battle
      ? [0, 2, 3, 5, 7, 8, 10, 12] // natural minor
      : [0, 3, 5, 7, 10, 12]; // minor pentatonic

    // Bass on the beat
    if (this._step % (battle ? 2 : 4) === 0) {
      this._tone(this.freq(root - 12), t, battle ? 0.14 : 0.28,
        battle ? 'square' : 'triangle', battle ? 0.22 : 0.18);
    }

    // Pad chord at the top of each bar (explore only)
    if (!battle && this._step % 16 === 0) {
      [0, 3, 7].forEach((iv) =>
        this._tone(this.freq(root + iv), t, 2.4, 'sine', 0.05));
    }

    // Lead
    const chance = battle ? 0.85 : 0.28;
    if (Math.random() < chance) {
      const note = root + 12 + scale[Math.floor(Math.random() * scale.length)];
      this._tone(this.freq(note), t, battle ? 0.13 : 0.5,
        battle ? 'square' : 'triangle', battle ? 0.12 : 0.07);
    }

    // Battle hi-hat-ish tick
    if (battle && this._step % 1 === 0) {
      this._noise(t, 0.03, 0.04, 6000);
    }
  }

  // ------------------------------------------------------ synth helpers
  _tone(freq, time, dur, type = 'sine', gain = 0.1) {
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.setValueAtTime(0, time);
    g.gain.linearRampToValueAtTime(gain, time + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, time + dur);
    o.connect(g);
    g.connect(this.musicGain);
    o.start(time);
    o.stop(time + dur + 0.02);
  }

  _noise(time, dur, gain, hpFreq = 4000) {
    const len = Math.floor(this.ctx.sampleRate * dur);
    const buffer = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    const hp = this.ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = hpFreq;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(gain, time);
    g.gain.exponentialRampToValueAtTime(0.0001, time + dur);
    src.connect(hp);
    hp.connect(g);
    g.connect(this.musicGain);
    src.start(time);
    src.stop(time + dur);
  }

  freq(midi) {
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  // ------------------------------------------------------ SFX
  playSfx(name) {
    this._ensure();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const blip = (f, d, type, g, slideTo) => {
      const o = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      o.type = type;
      o.frequency.setValueAtTime(f, t);
      if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + d);
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(g, t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + d);
      o.connect(gain);
      gain.connect(this.sfxGain);
      o.start(t);
      o.stop(t + d + 0.02);
    };
    switch (name) {
      case 'correct': blip(660, 0.12, 'square', 0.3); blip(990, 0.16, 'square', 0.25); break;
      case 'wrong': blip(200, 0.3, 'sawtooth', 0.3, 80); break;
      case 'pickup': blip(880, 0.12, 'triangle', 0.3, 1320); break;
      case 'coin': blip(1318, 0.08, 'square', 0.25); blip(1760, 0.12, 'square', 0.2); break;
      case 'hit': blip(140, 0.18, 'square', 0.35, 60); this._noise(t, 0.12, 0.2, 1200); break;
      case 'win': [523, 659, 784, 1046].forEach((f, i) => blip(f, 0.18, 'square', 0.25)); break;
      case 'lose': blip(330, 0.5, 'sawtooth', 0.3, 110); break;
      case 'select': blip(520, 0.05, 'square', 0.15); break;
      case 'start': [392, 523, 659, 784].forEach((f) => blip(f, 0.16, 'square', 0.22)); break;
      default: break;
    }
  }
}
