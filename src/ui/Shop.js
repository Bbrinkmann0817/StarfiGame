import { SHOP_ITEMS } from '../data/shop.js';

/** Cafeteria shop overlay: spend Jira-Münzen on one-time upgrades. */
export class Shop {
  constructor(audio) {
    this.audio = audio;
    this.overlay = document.getElementById('shop-overlay');
    this.balance = document.getElementById('shop-balance');
    this.itemsEl = document.getElementById('shop-items');
    this.closeBtn = document.getElementById('shop-close');
    this.open = false;
    this.onClose = null;

    this.closeBtn.addEventListener('click', () => this.close());
  }

  show(inventory, onBuy) {
    this.open = true;
    this.inventory = inventory;
    this.onBuy = onBuy;
    this.overlay.classList.remove('hidden');
    this._render();
  }

  _render() {
    this.balance.textContent = this.inventory.coins;
    this.itemsEl.innerHTML = '';
    for (const item of SHOP_ITEMS) {
      const owned = this.inventory.ownsUpgrade(item.id);
      const affordable = this.inventory.coins >= item.cost;
      const row = document.createElement('div');
      row.className = 'shop-item' + (owned ? ' owned' : '');
      row.innerHTML = `
        <span class="icon">${item.icon}</span>
        <div class="info">
          <div class="name">${item.name}</div>
          <div class="desc">${item.desc}</div>
        </div>
        <button ${owned || !affordable ? 'disabled' : ''}>
          ${owned ? 'Gekauft ✓' : item.cost + ' 🪙'}
        </button>`;
      const btn = row.querySelector('button');
      if (!owned) {
        btn.addEventListener('click', () => {
          if (this.onBuy(item)) {
            this.audio?.playSfx('coin');
            this._render();
          }
        });
      }
      this.itemsEl.appendChild(row);
    }
  }

  close() {
    this.open = false;
    this.overlay.classList.add('hidden');
    this.onClose?.();
  }
}
