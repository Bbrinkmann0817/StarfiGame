/** Quest-log overlay (toggled with Tab). */
export class QuestLog {
  constructor() {
    this.overlay = document.getElementById('quest-log');
    this.listEl = document.getElementById('quest-list');
    this.open = false;
  }

  toggle(quests) {
    if (this.open) this.close();
    else this.show(quests);
  }

  show(quests) {
    this.open = true;
    this._render(quests);
    this.overlay.classList.remove('hidden');
  }

  _render(quests) {
    this.listEl.innerHTML = '';
    if (!quests.length) {
      this.listEl.innerHTML = '<li><div class="q-title">Noch keine Aufträge</div></li>';
      return;
    }
    for (const q of quests) {
      const li = document.createElement('li');
      if (q.status === 'done') li.classList.add('done');
      const progress = q.count > 1 ? ` (${Math.min(q.progress, q.count)}/${q.count})` : '';
      const badge = q.status === 'done' ? '✓ ' : '';
      li.innerHTML = `<div class="q-title">${badge}${q.title}${progress}</div>
                      <div class="q-desc">${q.desc}</div>`;
      this.listEl.appendChild(li);
    }
  }

  close() {
    this.open = false;
    this.overlay.classList.add('hidden');
  }
}
