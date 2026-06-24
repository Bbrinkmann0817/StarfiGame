/**
 * Phone-call intro cutscene. The phone rings; the player answers; the caller
 * explains the emergency line by line; then the game starts outside.
 */
export class PhoneCall {
  constructor(audio) {
    this.audio = audio;
    this.overlay = document.getElementById('phone-overlay');
    this.ring = document.getElementById('phone-ring');
    this.caller = document.getElementById('phone-caller');
    this.textEl = document.getElementById('phone-text');
    this.answerBtn = document.getElementById('phone-answer');
    this.continueBtn = document.getElementById('phone-continue');

    this.answerBtn.addEventListener('click', () => this._answer());
    this.continueBtn.addEventListener('click', () => this._next());
  }

  /**
   * @param {object} cfg { caller, lines:string[] }
   * @param {() => void} onDone
   */
  start({ caller, lines }, onDone) {
    this.cfg = { caller, lines };
    this.lines = lines;
    this.index = 0;
    this.onDone = onDone;
    this.caller.textContent = '📞 Eingehender Anruf …';
    this.textEl.textContent = '';
    this.ring.classList.remove('answered');
    this.answerBtn.classList.remove('hidden');
    this.continueBtn.classList.add('hidden');
    this.overlay.classList.remove('hidden');
    this._ringTimer = setInterval(() => this.audio?.playSfx('select'), 900);
  }

  _answer() {
    clearInterval(this._ringTimer);
    this.audio?.playSfx('start');
    this.ring.classList.add('answered');
    this.ring.textContent = '📲';
    this.caller.textContent = this.cfg.caller;
    this.answerBtn.classList.add('hidden');
    this.continueBtn.classList.remove('hidden');
    this._render();
  }

  _render() {
    this.textEl.textContent = this.lines[this.index] || '';
    this.continueBtn.textContent = this.index >= this.lines.length - 1 ? 'Los geht’s ▸' : 'Weiter ▸';
  }

  _next() {
    this.audio?.playSfx('select');
    this.index++;
    if (this.index >= this.lines.length) {
      this.overlay.classList.add('hidden');
      this.onDone?.();
    } else {
      this._render();
    }
  }
}
