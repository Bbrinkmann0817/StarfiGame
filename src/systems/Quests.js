import { QUESTS, questById } from '../data/quests.js';

/**
 * Tracks quest state and progress. Quests advance through string "trigger tags"
 * emitted by the game (e.g. 'talk:sam', 'bug:meeting', 'deliver:coffee:jonas').
 */
export class QuestSystem {
  constructor() {
    this.state = {}; // id -> { status, progress }
    for (const q of QUESTS) {
      this.state[q.id] = { status: q.startActive ? 'active' : 'locked', progress: 0 };
    }
    this.onChange = null; // () => void
    this.onComplete = null; // (quest) => void
  }

  status(id) {
    return this.state[id]?.status ?? 'locked';
  }
  isActive(id) {
    return this.status(id) === 'active';
  }
  isDone(id) {
    return this.status(id) === 'done';
  }

  /** Offer a quest (locked → active). No-op if already active/done. */
  offer(id) {
    const st = this.state[id];
    if (st && st.status === 'locked') {
      st.status = 'active';
      this.onChange?.();
      return true;
    }
    return false;
  }

  /**
   * Force a quest to completion (e.g. after winning a colleague's quiz). Marks
   * it active→done regardless of trigger/count and fires onComplete once.
   */
  complete(id) {
    const st = this.state[id];
    if (!st || st.status === 'done') return false;
    st.status = 'done';
    st.progress = questById(id)?.count || 1;
    this.onComplete?.(questById(id));
    this.onChange?.();
    return true;
  }

  /**
   * Record a trigger tag. Advances any active quest whose trigger matches,
   * completing it (and firing onComplete) when its required count is met.
   */
  record(tag) {
    let changed = false;
    for (const q of QUESTS) {
      const st = this.state[q.id];
      if (st.status !== 'active') continue;
      if (q.trigger === tag) {
        st.progress++;
        changed = true;
        if (st.progress >= (q.count || 1)) {
          st.status = 'done';
          this.onComplete?.(q);
        }
      }
    }
    if (changed) this.onChange?.();
    return changed;
  }

  /** The text shown in the HUD objective tracker. */
  objectiveText() {
    // Prefer the first active, non-intro quest; fall back to intro or done.
    const order = ['q_css', 'q_meeting', 'q_coffee', 'q_boss', 'q_intro'];
    for (const id of order) {
      if (this.isActive(id)) {
        const q = questById(id);
        const c = q.count || 1;
        const p = this.state[id].progress;
        const suffix = c > 1 ? ` (${p}/${c})` : '';
        return q.title + ': ' + q.desc.replace(/\.$/, '') + suffix;
      }
    }
    if (Object.values(this.state).every((s) => s.status === 'done')) {
      return 'Alle Probleme gelöst – Release gerettet! 🎉';
    }
    return 'Sprich die Teams in den Abteilungen an und löse ihre Probleme.';
  }

  /** Snapshot for the quest-log UI. */
  list() {
    return QUESTS.filter((q) => this.state[q.id].status !== 'locked').map((q) => ({
      id: q.id,
      title: q.title,
      desc: q.desc,
      status: this.state[q.id].status,
      progress: this.state[q.id].progress,
      count: q.count || 1
    }));
  }

  allDone() {
    return QUESTS.every((q) => this.state[q.id].status === 'done');
  }
}
