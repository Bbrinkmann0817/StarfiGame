import { FLOORS } from '../data/rooms.js';

/** Fahrstuhl floor-select panel. */
export class Elevator {
  constructor(audio) {
    this.audio = audio;
    this.overlay = document.getElementById('elevator-overlay');
    this.floorsEl = document.getElementById('elevator-floors');
    this.closeBtn = document.getElementById('elevator-close');
    this.open = false;
    this.onPick = null;
    this.onClose = null;

    this.closeBtn.addEventListener('click', () => this.close());
  }

  /**
   * @param {string} currentFloor  the floor the player is on (disabled in list)
   * @param {Set<string>} unlocked  floor ids the player may visit
   * @param {(id:string)=>void} onPick
   */
  show(currentFloor, unlocked, onPick) {
    this.open = true;
    this.onPick = onPick;
    this.floorsEl.innerHTML = '';
    for (const f of FLOORS) {
      const isCurrent = f.id === currentFloor;
      const locked = !unlocked.has(f.id);
      const row = document.createElement('button');
      row.className = 'elevator-floor' + (isCurrent ? ' current' : '');
      row.disabled = isCurrent || locked;
      row.innerHTML = `
        <span class="badge">${f.short}</span>
        <span>
          <span class="name">${f.label.split('·')[1]?.trim() || f.label}</span><br />
          <span class="sub">${locked ? '🔒 noch gesperrt' : isCurrent ? 'aktuelle Etage' : 'hierher fahren'}</span>
        </span>`;
      if (!row.disabled) {
        row.addEventListener('click', () => {
          this.audio?.playSfx('select');
          this.close();
          this.onPick?.(f.id);
        });
      }
      this.floorsEl.appendChild(row);
    }
    this.overlay.classList.remove('hidden');
  }

  close() {
    this.open = false;
    this.overlay.classList.add('hidden');
    this.onClose?.();
  }
}
