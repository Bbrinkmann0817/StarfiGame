import { buildDeck, markAsked, TOPIC_LABELS, shuffle } from '../data/questions.js';

/**
 * Quiz combat ("Code-Duell"). Touching a bug opens this overlay; answer
 * questions under time pressure to drain the bug's HP. Wrong answers / timeouts
 * cost the player Fokus (HP). Bosses have more HP and randomly scramble the
 * keyboard mapping (mouse clicks stay reliable).
 *
 * Question/answer strings are authored statically, so innerHTML is safe here.
 */
export class QuizSystem {
  constructor(audio) {
    this.audio = audio;
    this.el = {
      overlay: document.getElementById('quiz-overlay'),
      frame: document.querySelector('.quiz-frame'),
      playerHP: document.getElementById('quiz-player-hp'),
      enemyHP: document.getElementById('quiz-enemy-hp'),
      enemyName: document.getElementById('quiz-enemy-name'),
      sprite: document.getElementById('quiz-enemy-sprite'),
      category: document.getElementById('quiz-category'),
      timer: document.getElementById('quiz-timer-fill'),
      question: document.getElementById('quiz-question'),
      answers: document.getElementById('quiz-answers'),
      feedback: document.getElementById('quiz-feedback'),
      hint: document.getElementById('quiz-hint'),
      joker: document.getElementById('quiz-joker')
    };
    this.active = false;
    this._raf = null;
    this._onKey = (e) => this._handleKey(e);
    this.el.joker?.addEventListener('click', () => this._useJoker());
  }

  /**
   * @param {object} cfg
   * @param {string[]} cfg.topics
   * @param {string} cfg.enemyName
   * @param {string} cfg.emoji
   * @param {number} cfg.enemyHP   number of correct answers needed
   * @param {boolean} cfg.isBoss
   * @param {number} cfg.timePerQuestion seconds
   * @param {object} cfg.hooks  { getHP, getMaxHP, damage(n), onWin(), onLose() }
   */
  start(cfg) {
    this.cfg = cfg;
    this.enemyMaxHP = cfg.enemyHP;
    this.enemyHP = cfg.enemyHP;
    this.maxDiff = cfg.maxDifficulty ?? (cfg.isBoss ? 3 : 2);
    // Build a generous deck of fresh questions (enough even if some are missed).
    this.deck = buildDeck(cfg.topics, cfg.enemyHP + 8, this.maxDiff);
    this.deckIndex = 0;
    this.active = true;
    this.locked = false;
    this.timerPaused = false;
    this.jokerUsed = false; // one Telefonjoker per duel

    this.el.enemyName.textContent = cfg.enemyName;
    this.el.sprite.textContent = cfg.emoji || '🐛';
    this.el.sprite.classList.toggle('boss', !!cfg.isBoss);
    this.el.overlay.classList.remove('hidden');
    this._updateEnemyBar();
    this._updatePlayerBar();

    window.addEventListener('keydown', this._onKey);
    this.audio?.start('battle');
    this._nextQuestion();
  }

  _nextQuestion() {
    if (this.enemyHP <= 0) return this._win();
    this.locked = false;
    this.timerPaused = false;
    this.el.feedback.textContent = '';
    this.el.feedback.className = 'quiz-feedback';

    // Out of deck (e.g. many wrong answers) → pull a fresh batch of unasked
    // questions so nothing repeats within the fight when possible.
    if (this.deckIndex >= this.deck.length) {
      const refill = buildDeck(this.cfg.topics, 8, this.maxDiff);
      if (refill.length) {
        this.deck = refill;
        this.deckIndex = 0;
      }
    }

    const q = this.deck[this.deckIndex % this.deck.length];
    this.deckIndex++;
    markAsked(q); // remember it so it won't be asked again this round
    this.current = q;

    this.el.category.textContent = TOPIC_LABELS[q.topic] || q.topic.toUpperCase();
    this.el.question.innerHTML = q.q;

    // Shuffle the answer options so the correct one isn't always in slot A.
    // `this.order` maps display position → original index; `this.correctIdx`
    // is the correct answer's NEW (displayed) position.
    this.order = shuffle([0, 1, 2, 3]);
    this.view = this.order.map((i) => q.answers[i]);
    this.correctIdx = this.order.indexOf(q.correct);
    this.eliminated = new Set();

    // reset per-question UI (hint hidden, joker available if not used yet)
    this.el.hint.classList.add('hidden');
    this.el.hint.innerHTML = '';
    if (this.el.joker) {
      this.el.joker.disabled = this.jokerUsed;
      this.el.joker.textContent = '';
      this.el.joker.innerHTML = this.jokerUsed
        ? '📞 Jochen (schon angerufen)'
        : '📞 Jochen anrufen <span class="joker-tag">Telefonjoker</span>';
    }

    // keyboard mapping; scrambled randomly during boss fights
    this.scrambled = this.cfg.isBoss && Math.random() < 0.45;
    this.el.frame.classList.toggle('scrambled', this.scrambled);
    this.keyMap = [0, 1, 2, 3];
    if (this.scrambled) this.keyMap = shuffle(this.keyMap);

    // render answers (from the shuffled view)
    const keys = ['A', 'B', 'C', 'D'];
    this.el.answers.innerHTML = '';
    this.view.forEach((ans, i) => {
      const btn = document.createElement('button');
      btn.className = 'quiz-answer';
      btn.innerHTML = `<span class="key">${keys[i]}</span><span class="text">${ans}</span>`;
      btn.addEventListener('click', () => this._answer(i));
      this.el.answers.appendChild(btn);
    });

    // timer
    const bonus = this.cfg.hooks.getTimeBonus?.() || 0;
    this.timeTotal = this.cfg.timePerQuestion + bonus;
    this.timeLeft = this.timeTotal;
    this._lastTick = performance.now();
    this._runTimer();
  }

  _runTimer() {
    cancelAnimationFrame(this._raf);
    const tick = () => {
      const now = performance.now();
      const dt = (now - this._lastTick) / 1000;
      this._lastTick = now;
      if (!this.locked && !this.timerPaused) {
        this.timeLeft -= dt;
        const pct = Math.max(0, (this.timeLeft / this.timeTotal) * 100);
        this.el.timer.style.width = pct + '%';
        if (this.timeLeft <= 0) {
          this._answer(-1); // timeout = wrong
          return;
        }
      }
      this._raf = requestAnimationFrame(tick);
    };
    this._raf = requestAnimationFrame(tick);
  }

  _handleKey(e) {
    if (!this.active || this.locked) return;
    let pos = -1;
    if (['Digit1', 'KeyA'].includes(e.code)) pos = 0;
    else if (['Digit2', 'KeyB'].includes(e.code)) pos = 1;
    else if (['Digit3', 'KeyC'].includes(e.code)) pos = 2;
    else if (['Digit4', 'KeyD'].includes(e.code)) pos = 3;
    if (pos >= 0) {
      e.preventDefault();
      const target = this.keyMap[pos]; // keyMap scrambles during boss
      if (this.eliminated && this.eliminated.has(target)) return; // struck out by joker
      this._answer(target);
    }
  }

  _answer(index) {
    if (this.locked) return;
    this.locked = true;
    cancelAnimationFrame(this._raf);

    const correctIdx = this.correctIdx;
    const buttons = [...this.el.answers.children];
    buttons.forEach((b) => (b.disabled = true));
    buttons[correctIdx]?.classList.add('correct');
    if (this.el.joker) this.el.joker.disabled = true;

    const isCorrect = index === correctIdx;
    if (isCorrect) {
      this.enemyHP--;
      this._updateEnemyBar();
      this.el.sprite.classList.add('hit');
      setTimeout(() => this.el.sprite.classList.remove('hit'), 300);
      this.el.feedback.textContent = pickPraise();
      this.el.feedback.className = 'quiz-feedback good';
      this.audio?.playSfx('correct');
    } else {
      if (index >= 0) buttons[index]?.classList.add('wrong');
      this.cfg.hooks.damage(this.cfg.playerDamage || 16);
      this._updatePlayerBar();
      this.el.feedback.textContent =
        index < 0 ? '⏱ Zeit abgelaufen!' : 'Falsch! Der Bug schlägt zurück.';
      this.el.feedback.className = 'quiz-feedback bad';
      this.audio?.playSfx('wrong');
    }

    setTimeout(() => {
      if (this.cfg.hooks.getHP() <= 0) return this._lose();
      if (this.enemyHP <= 0) return this._win();
      this._nextQuestion();
    }, 1050);
  }

  /**
   * Telefonjoker "Jochen": call him once per duel for a hint. He eliminates two
   * wrong options (50:50) and nudges the player toward the remaining ones.
   */
  _useJoker() {
    if (!this.active || this.locked || this.jokerUsed) return;
    this.jokerUsed = true;
    this.timerPaused = true;
    this._lastTick = performance.now();
    if (this.el.joker) {
      this.el.joker.disabled = true;
      this.el.joker.innerHTML = '📞 Jochen (schon angerufen)';
    }
    this.audio?.playSfx('select');

    // strike two WRONG display positions (classic 50:50 hint)
    const keys = ['A', 'B', 'C', 'D'];
    const wrong = [0, 1, 2, 3].filter((i) => i !== this.correctIdx);
    const strike = shuffle(wrong).slice(0, 2);
    const buttons = [...this.el.answers.children];
    for (const i of strike) {
      this.eliminated.add(i);
      buttons[i]?.classList.add('eliminated');
      buttons[i]?.setAttribute('disabled', 'disabled');
    }

    // the two options still in play (correct + one wrong)
    const remaining = [0, 1, 2, 3]
      .filter((i) => !this.eliminated.has(i))
      .map((i) => keys[i]);
    this.el.hint.innerHTML =
      `<span class="who">📞 Jochen:</span> „${pickJochenTip()} ` +
      `Zwei davon kannst du streichen – es bleibt <strong>${remaining[0]}</strong> ` +
      `oder <strong>${remaining[1]}</strong>. Geh die Sache logisch an!“`;
    this.el.hint.classList.remove('hidden');
  }

  _updateEnemyBar() {
    const pct = Math.max(0, (this.enemyHP / this.enemyMaxHP) * 100);
    this.el.enemyHP.style.width = pct + '%';
  }
  _updatePlayerBar() {
    const pct = Math.max(0, (this.cfg.hooks.getHP() / this.cfg.hooks.getMaxHP()) * 100);
    this.el.playerHP.style.width = pct + '%';
  }

  _cleanup() {
    this.active = false;
    cancelAnimationFrame(this._raf);
    window.removeEventListener('keydown', this._onKey);
    this.el.overlay.classList.add('hidden');
    this.el.frame.classList.remove('scrambled');
  }

  _win() {
    this._cleanup();
    this.audio?.playSfx('win');
    this.cfg.hooks.onWin();
  }
  _lose() {
    this._cleanup();
    this.audio?.playSfx('lose');
    this.cfg.hooks.onLose();
  }
}

function pickPraise() {
  const p = ['Bug gefixt! ✅', 'Sauberer Commit! 💚', 'Tests grün! 🟢', 'Merged! 🚀', 'Code-Review bestanden!'];
  return p[Math.floor(Math.random() * p.length)];
}

function pickJochenTip() {
  const t = [
    'Moin, Jochen hier!',
    'Kein Stress, hör zu:',
    'Klarer Fall, pass auf:',
    'Das hatten wir doch im Lehrgang:',
    'Vertrau mir, ich kenn das:'
  ];
  return t[Math.floor(Math.random() * t.length)];
}
