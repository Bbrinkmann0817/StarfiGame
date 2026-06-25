/**
 * Simon Says with four color pads.
 * Click (or use keys 1-4) to repeat the generated sequence.
 */
export class SimonSays {
  constructor(audio) {
    this.audio = audio;
    this.root = document.getElementById('simon-overlay');
    this.roundEl = document.getElementById('simon-round');
    this.statusEl = document.getElementById('simon-status');
    this.closeBtn = document.getElementById('simon-close');
    this.startBtn = document.getElementById('simon-start');
    this.restartBtn = document.getElementById('simon-restart');
    this.pads = Array.from(document.querySelectorAll('[data-simon]'));

    this.onClose = null;
    this.onWin = null;
    this.running = false;
    this.targetRounds = 8;
    this.sequence = [];
    this.inputIndex = 0;
    this.round = 0;
    this.phase = 'idle';
    this.timers = [];

    this._bindDom();
    this._render();
  }

  _bindDom() {
    this.closeBtn?.addEventListener('click', () => this.close());
    this.startBtn?.addEventListener('click', () => this.start());
    this.restartBtn?.addEventListener('click', () => this.start());
    for (const pad of this.pads) {
      pad.addEventListener('click', () => this._handleInput(Number(pad.dataset.simon)));
    }
  }

  show({ onClose, onWin } = {}) {
    this.onClose = onClose || null;
    this.onWin = onWin || null;
    this.running = true;
    this._reset();
    this.root?.classList.remove('hidden');
    window.addEventListener('keydown', this._onKeyDown);
  }

  close() {
    if (!this.root || this.root.classList.contains('hidden')) return;
    this.running = false;
    this._clearTimers();
    this.root.classList.add('hidden');
    window.removeEventListener('keydown', this._onKeyDown);
    const cb = this.onClose;
    this.onClose = null;
    this.onWin = null;
    if (cb) cb();
  }

  _onKeyDown = (e) => {
    if (e.code === 'Escape') {
      e.preventDefault();
      this.close();
      return;
    }
    if (e.code === 'Digit1') this._handleInput(0);
    if (e.code === 'Digit2') this._handleInput(1);
    if (e.code === 'Digit3') this._handleInput(2);
    if (e.code === 'Digit4') this._handleInput(3);
  };

  _reset() {
    this._clearTimers();
    this.sequence = [];
    this.inputIndex = 0;
    this.round = 0;
    this.phase = 'idle';
    this._setStatus('Merke dir die Farbfolge und tippe sie nach.');
    this._setPadsEnabled(false);
    this._render();
  }

  start() {
    if (!this.running) return;
    this._clearTimers();
    this.sequence = [this._nextPad()];
    this.round = 1;
    this.inputIndex = 0;
    this.phase = 'show';
    this._setStatus('Aufgepasst ...');
    this._render();
    this._playSequence();
  }

  _playSequence() {
    this.phase = 'show';
    this._setPadsEnabled(false);
    this._setStatus(`Runde ${this.round}: Folge wird gezeigt ...`);

    const stepMs = 640;
    const onMs = 350;
    this._clearTimers();

    this.sequence.forEach((idx, i) => {
      this.timers.push(setTimeout(() => this._flash(idx, onMs), 360 + i * stepMs));
    });

    const total = 460 + this.sequence.length * stepMs;
    this.timers.push(setTimeout(() => {
      this.phase = 'input';
      this.inputIndex = 0;
      this._setPadsEnabled(true);
      this._setStatus(`Jetzt du: Runde ${this.round} nachspielen.`);
    }, total));
  }

  _handleInput(idx) {
    if (!this.running || this.phase !== 'input') return;
    if (!Number.isInteger(idx) || idx < 0 || idx > 3) return;

    this._flash(idx, 170);

    const expected = this.sequence[this.inputIndex];
    if (idx !== expected) {
      this.phase = 'fail';
      this._setPadsEnabled(false);
      this._setStatus('Falsche Farbe. Neu starten und nochmal!');
      this._playSfx('hit');
      return;
    }

    this.inputIndex += 1;
    if (this.inputIndex < this.sequence.length) return;

    if (this.round >= this.targetRounds) {
      this.phase = 'win';
      this._setPadsEnabled(false);
      this._setStatus('Perfekt! Du hast Simon Says geschafft.');
      this._playSfx('win');
      const cb = this.onWin;
      if (cb) cb({ rounds: this.round });
      return;
    }

    this.round += 1;
    this.sequence.push(this._nextPad());
    this._render();
    this._playSfx('select');
    this.timers.push(setTimeout(() => this._playSequence(), 500));
  }

  _flash(idx, ms) {
    const pad = this.pads[idx];
    if (!pad) return;
    pad.classList.add('is-on');
    this._playSfx('select');
    this.timers.push(setTimeout(() => pad.classList.remove('is-on'), ms));
  }

  _render() {
    if (this.roundEl) this.roundEl.textContent = `Runde ${this.round} / ${this.targetRounds}`;
  }

  _setStatus(text) {
    if (this.statusEl) this.statusEl.textContent = text;
  }

  _setPadsEnabled(enabled) {
    for (const pad of this.pads) pad.disabled = !enabled;
  }

  _clearTimers() {
    for (const id of this.timers) clearTimeout(id);
    this.timers.length = 0;
    for (const pad of this.pads) pad.classList.remove('is-on');
  }

  _nextPad() {
    return Math.floor(Math.random() * 4);
  }

  _playSfx(name) {
    try {
      this.audio?.playSfx?.(name);
    } catch {
      // minigame should never crash because of optional SFX
    }
  }
}
