/**
 * Simple V1 ping-pong minigame (arcade style).
 * Opens as a fullscreen overlay and can be closed any time with ESC.
 */
export class PingPong {
  constructor(audio) {
    this.audio = audio;
    this.root = document.getElementById('pingpong-overlay');
    this.canvas = document.getElementById('pingpong-canvas');
    this.ctx = this.canvas?.getContext('2d');
    this.scoreEl = document.getElementById('pingpong-score');
    this.statusEl = document.getElementById('pingpong-status');
    this.closeBtn = document.getElementById('pingpong-close');
    this.restartBtn = document.getElementById('pingpong-restart');

    this.onClose = null;
    this.running = false;
    this.rafId = null;
    this.lastTs = 0;
    this.keys = new Set();

    this.w = 880;
    this.h = 500;
    this.canvas.width = this.w;
    this.canvas.height = this.h;

    this.paddleW = 14;
    this.paddleH = 92;
    this.ballR = 10;
    this.maxScore = 7;

    this._bindDom();
    this._resetMatch();
  }

  _bindDom() {
    this.closeBtn?.addEventListener('click', () => this.close());
    this.restartBtn?.addEventListener('click', () => this._resetMatch());
  }

  show({ onClose } = {}) {
    this.onClose = onClose || null;
    this._resetMatch();
    this.root.classList.remove('hidden');
    this.running = true;
    this.lastTs = performance.now();
    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);
    this._loop();
  }

  close() {
    if (!this.root || this.root.classList.contains('hidden')) return;
    this.running = false;
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.rafId = null;
    this.root.classList.add('hidden');
    window.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('keyup', this._onKeyUp);
    this.keys.clear();
    const cb = this.onClose;
    this.onClose = null;
    if (cb) cb();
  }

  _onKeyDown = (e) => {
    if (e.code === 'Escape') {
      e.preventDefault();
      this.close();
      return;
    }
    this.keys.add(e.code);
  };

  _onKeyUp = (e) => {
    this.keys.delete(e.code);
  };

  _resetMatch() {
    this.playerScore = 0;
    this.aiScore = 0;
    this.playerY = (this.h - this.paddleH) / 2;
    this.aiY = (this.h - this.paddleH) / 2;
    this.phase = 'serve';
    this.serveTimer = 0.6;
    this._resetBall(Math.random() > 0.5 ? 1 : -1);
    this._setStatus('Spiele bis 7 Punkte. Steuerung: W/S oder Pfeil hoch/runter');
    this._syncScore();
    this._draw();
  }

  _setStatus(text) {
    if (this.statusEl) this.statusEl.textContent = text;
  }

  _syncScore() {
    if (this.scoreEl) this.scoreEl.textContent = `${this.playerScore} : ${this.aiScore}`;
  }

  _resetBall(dir) {
    this.ballX = this.w / 2;
    this.ballY = this.h / 2;
    this.ballVX = dir * (260 + Math.random() * 70);
    this.ballVY = (Math.random() * 2 - 1) * 160;
  }

  _loop = () => {
    if (!this.running) return;
    const now = performance.now();
    const dt = Math.min((now - this.lastTs) / 1000, 0.033);
    this.lastTs = now;
    this._update(dt);
    this._draw();
    this.rafId = requestAnimationFrame(this._loop);
  };

  _update(dt) {
    const playerSpeed = 420;
    const aiSpeed = 350;

    if (this.keys.has('KeyW') || this.keys.has('ArrowUp')) this.playerY -= playerSpeed * dt;
    if (this.keys.has('KeyS') || this.keys.has('ArrowDown')) this.playerY += playerSpeed * dt;
    this.playerY = clamp(this.playerY, 0, this.h - this.paddleH);

    const aiTarget = this.ballY - this.paddleH / 2;
    if (aiTarget > this.aiY + 6) this.aiY += aiSpeed * dt;
    else if (aiTarget < this.aiY - 6) this.aiY -= aiSpeed * dt;
    this.aiY = clamp(this.aiY, 0, this.h - this.paddleH);

    if (this.phase === 'serve') {
      this.serveTimer -= dt;
      if (this.serveTimer <= 0) {
        this.phase = 'play';
        this._setStatus('Ballwechsel läuft!');
      }
      return;
    }

    if (this.phase === 'end') return;

    this.ballX += this.ballVX * dt;
    this.ballY += this.ballVY * dt;

    if (this.ballY - this.ballR <= 0) {
      this.ballY = this.ballR;
      this.ballVY *= -1;
    }
    if (this.ballY + this.ballR >= this.h) {
      this.ballY = this.h - this.ballR;
      this.ballVY *= -1;
    }

    const leftX = 28;
    const rightX = this.w - 28 - this.paddleW;

    // Player paddle collision
    if (
      this.ballVX < 0 &&
      this.ballX - this.ballR <= leftX + this.paddleW &&
      this.ballY >= this.playerY &&
      this.ballY <= this.playerY + this.paddleH
    ) {
      this.ballX = leftX + this.paddleW + this.ballR;
      this.ballVX = Math.abs(this.ballVX) * 1.04;
      const impact = (this.ballY - (this.playerY + this.paddleH / 2)) / (this.paddleH / 2);
      this.ballVY += impact * 160;
      this._playSfx('select');
    }

    // AI paddle collision
    if (
      this.ballVX > 0 &&
      this.ballX + this.ballR >= rightX &&
      this.ballY >= this.aiY &&
      this.ballY <= this.aiY + this.paddleH
    ) {
      this.ballX = rightX - this.ballR;
      this.ballVX = -Math.abs(this.ballVX) * 1.03;
      const impact = (this.ballY - (this.aiY + this.paddleH / 2)) / (this.paddleH / 2);
      this.ballVY += impact * 130;
      this._playSfx('hit');
    }

    if (this.ballX < -40) {
      this.aiScore++;
      this._afterPoint(-1);
    } else if (this.ballX > this.w + 40) {
      this.playerScore++;
      this._afterPoint(1);
    }
  }

  _afterPoint(nextServeDir) {
    this._syncScore();
    if (this.playerScore >= this.maxScore || this.aiScore >= this.maxScore) {
      this.phase = 'end';
      if (this.playerScore > this.aiScore) {
        this._setStatus('Stark! Du hast das Match gewonnen.');
        this._playSfx('win');
      } else {
        this._setStatus('Knapp verloren. Mit Neustart sofort Revanche!');
      }
      return;
    }

    this.phase = 'serve';
    this.serveTimer = 0.75;
    this._resetBall(nextServeDir);
    this._setStatus('Nächster Ballwechsel startet ...');
  }

  _draw() {
    const ctx = this.ctx;
    if (!ctx) return;

    ctx.fillStyle = '#0e141a';
    ctx.fillRect(0, 0, this.w, this.h);

    // center line
    ctx.strokeStyle = 'rgba(230,237,243,0.25)';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(this.w / 2, 0);
    ctx.lineTo(this.w / 2, this.h);
    ctx.stroke();
    ctx.setLineDash([]);

    const leftX = 28;
    const rightX = this.w - 28 - this.paddleW;

    ctx.fillStyle = '#3fb950';
    ctx.fillRect(leftX, this.playerY, this.paddleW, this.paddleH);

    ctx.fillStyle = '#e2001a';
    ctx.fillRect(rightX, this.aiY, this.paddleW, this.paddleH);

    ctx.fillStyle = '#f1f3f7';
    ctx.beginPath();
    ctx.arc(this.ballX, this.ballY, this.ballR, 0, Math.PI * 2);
    ctx.fill();
  }

  _playSfx(name) {
    try {
      this.audio?.playSfx?.(name);
    } catch {
      // minigame should never crash because of optional SFX
    }
  }
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}
