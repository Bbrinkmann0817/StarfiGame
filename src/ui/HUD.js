/** In-game HUD: focus bar, currency, clock, objective tracker, prompts, toasts. */
export class HUD {
  constructor() {
    this.root = document.getElementById('hud');
    this.healthFill = document.getElementById('health-fill');
    this.coinCount = document.getElementById('coin-count');
    this.coffeeCount = document.getElementById('coffee-count');
    this.clock = document.getElementById('clock');
    this.objective = document.getElementById('objective-text');
    this.prompt = document.getElementById('interaction-prompt');
    this.promptText = document.getElementById('interaction-text');
    this.toasts = document.getElementById('toast-container');
  }

  show() {
    this.root.classList.remove('hidden');
  }
  hide() {
    this.root.classList.add('hidden');
  }

  setHealth(hp, max) {
    const pct = Math.max(0, Math.min(100, (hp / max) * 100));
    this.healthFill.style.width = pct + '%';
    // shift color from green → amber → red as focus drops
    let color;
    if (pct > 60) color = 'linear-gradient(90deg,#3fb950,#7ee787)';
    else if (pct > 30) color = 'linear-gradient(90deg,#ffce5c,#ffb347)';
    else color = 'linear-gradient(90deg,#ff4d4d,#ff7a7a)';
    this.healthFill.style.background = color;
  }

  setCoins(n) {
    this.coinCount.textContent = n;
  }
  setCoffee(n) {
    this.coffeeCount.textContent = n;
  }
  setClock(str) {
    this.clock.textContent = str;
  }
  setObjective(text) {
    this.objective.textContent = text;
  }

  showPrompt(text) {
    this.promptText.textContent = text;
    this.prompt.classList.remove('hidden');
  }
  hidePrompt() {
    this.prompt.classList.add('hidden');
  }

  toast(msg, type = '') {
    const el = document.createElement('div');
    el.className = 'toast ' + type;
    el.innerHTML = msg;
    this.toasts.appendChild(el);
    setTimeout(() => el.remove(), 3200);
  }

  damageFlash() {
    this.root.classList.remove('damage-flash');
    // force reflow so the animation re-triggers
    void this.root.offsetWidth;
    this.root.classList.add('damage-flash');
  }
}
