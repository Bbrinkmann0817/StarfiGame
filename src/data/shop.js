/**
 * Cafeteria upgrades, bought with Jira-Münzen. Each upgrade is a one-time
 * purchase whose `effect` key is applied by the Game/Player when bought.
 */
export const SHOP_ITEMS = [
  {
    id: 'glasses',
    name: 'Clean-Code-Brille',
    desc: 'Hebt Münzen und Kaffee quer durchs Gebäude hervor (Wallhack für Loot).',
    icon: '🤓',
    cost: 40,
    effect: 'reveal'
  },
  {
    id: 'espresso',
    name: 'Doppelter Espresso',
    desc: 'Dauerhaft +15% Grundtempo. Kein Zittern, versprochen.',
    icon: '☕',
    cost: 25,
    effect: 'speed'
  },
  {
    id: 'duck',
    name: 'Debugging-Ente',
    desc: '+30 maximaler Fokus. Erklär ihr dein Problem, dann ist es gelöst.',
    icon: '🦆',
    cost: 35,
    effect: 'maxhp'
  },
  {
    id: 'keyboard',
    name: 'Mechanische Tastatur',
    desc: '+4 Sekunden Zeit pro Quizfrage. Klackklackklack.',
    icon: '⌨️',
    cost: 50,
    effect: 'time'
  }
];

export function shopItemById(id) {
  return SHOP_ITEMS.find((s) => s.id === id) || null;
}
