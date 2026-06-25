/**
 * Linear, guided story for the FIAE learning campaign. Each step has an
 * `objective` shown in the HUD and the `area` (floor) where it happens. The
 * Game advances the story explicitly as the player completes each milestone.
 *
 * Difficulty rises floor by floor (see each colleague's challenge in npcs.js):
 *   Melina L1 · Mehmet L2 · Sven L3 · Aylin L4 · Emre L5 · Britta/Jennifer L5 (StarMoney) ·
 *   Frank L6 · Petra L7 · Viktor L8 · Kristof/Boss L9.
 */
export const STEPS = [
  { id: 'enter', area: 'outside', objective: 'Geh zum Eingang und betritt das Star-Finanz-Gebäude.' },
  { id: 'lift1', area: 'eg', objective: 'Nimm den Fahrstuhl (E) und fahr ins 1. OG zum Empfang.' },
  { id: 'jessi', area: 'og1', objective: 'Sprich am Empfang mit Jessi (E).' },
  { id: 'lift2', area: 'og1', objective: 'Fahr mit dem Fahrstuhl ins 2. OG (Open Space).' },
  { id: 'melina', area: 'og2', objective: 'Level 1 · Frontend – Hilf Melina, die CSS-Endlosschleife zu fixen.' },
  { id: 'mehmet', area: 'og2', objective: 'Level 2 · Produkt – Hilf Mehmet, das Ticket-Chaos zu sortieren.' },
  { id: 'lift3', area: 'og2', objective: 'Fahr mit dem Fahrstuhl ins 3. OG (Digital Solutions).' },
  { id: 'sven', area: 'og3', objective: 'Level 3 · Digital Solutions – Hilf Sven, die API zurückzuholen.' },
  { id: 'lift4', area: 'og3', objective: 'Fahr mit dem Fahrstuhl ins 4. OG (Inclusive Design Lab).' },
  { id: 'aylin', area: 'og4', objective: 'Level 4 · Design – Hilf Aylin, das Design wieder barrierefrei zu machen.' },
  { id: 'lift5', area: 'og4', objective: 'Fahr mit dem Fahrstuhl ins 5. OG (App Factory).' },
  { id: 'emre', area: 'og5', objective: 'Level 5 · App Factory – Hilf Emre, den App-Build zu stabilisieren.' },
  { id: 'britta', area: 'og5', objective: 'Level 5 · StarMoney – Hilf Britta und Jennifer beim gemeinsamen StarMoney-Faktencheck.' },
  { id: 'lift6', area: 'og5', objective: 'Fahr mit dem Fahrstuhl ins 6. OG (Facility Management).' },
  { id: 'frank', area: 'og6', objective: 'Level 6 · Facility – Hilf Frank, die Gebäudetechnik zu beruhigen.' },
  { id: 'lift7', area: 'og6', objective: 'Fahr mit dem Fahrstuhl ins 7. OG (People · Culture · Places).' },
  { id: 'petra', area: 'og7', objective: 'Level 7 · People & Culture – Hilf Petra, das Onboarding flottzumachen.' },
  { id: 'lift8', area: 'og7', objective: 'Fahr mit dem Fahrstuhl ins 8. OG (Backend & Serverraum).' },
  { id: 'viktor', area: 'og8', objective: 'Level 8 · Backend – Hilf Viktor, den Backend-Service zu retten.' },
  { id: 'kristof', area: 'og8', objective: 'Level 9 · Boss – Stell dich mit Kristof dem Ur-Bug (Bosskampf).' },
  { id: 'done', area: null, objective: 'Release gerettet! 🎉 Schönes Wochenende!' }
];

export class Story {
  constructor() {
    this.index = 0;
  }

  current() {
    return STEPS[this.index];
  }

  is(id) {
    return this.current()?.id === id;
  }

  /** Jump the story to a given step id (no-op if it would move backwards). */
  advanceTo(id) {
    const i = STEPS.findIndex((s) => s.id === id);
    if (i > this.index) {
      this.index = i;
      return true;
    }
    return false;
  }

  objective() {
    return this.current()?.objective ?? '';
  }

  /** Which area the current step expects the player to be in (or act in). */
  targetArea() {
    return this.current()?.area ?? null;
  }

  done() {
    return this.is('done');
  }
}
