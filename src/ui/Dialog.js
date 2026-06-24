/**
 * Linear dialog box: shows a colleague's lines one at a time; advance with
 * Space / E / click. Calls `onDone` after the last line.
 */
export class Dialog {
  constructor(audio) {
    this.audio = audio;
    this.box = document.getElementById('dialog-box');
    this.portrait = document.getElementById('dialog-portrait');
    this.nameEl = document.getElementById('dialog-name');
    this.textEl = document.getElementById('dialog-text');
    this.optionsEl = document.getElementById('dialog-options');
    this.open = false;
    this.lines = [];
    this.index = 0;
    this.onDone = null;

    this.box.addEventListener('click', () => this.advance());
  }

  start(npc, lines, onDone) {
    this.open = true;
    this.lines = lines;
    this.index = 0;
    this.onDone = onDone;

    if (npc.photo) {
      this.portrait.innerHTML = `<img src="${npc.photo}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:12px">`;
    } else {
      this.portrait.textContent = npc.emoji || '🧑‍💻';
    }
    this.nameEl.textContent = npc.name;
    this.optionsEl.innerHTML = '';
    this.box.classList.remove('hidden');
    this._render();
  }

  _render() {
    this.textEl.innerHTML = this.lines[this.index] || '';
    this.audio?.playSfx('select');
  }

  advance() {
    if (!this.open) return;
    this.index++;
    if (this.index >= this.lines.length) {
      this.close();
      this.onDone?.();
    } else {
      this._render();
    }
  }

  close() {
    this.open = false;
    this.box.classList.add('hidden');
  }
}
