/**
 * Quest line. Completion is expressed as a "trigger tag" matched by QuestSystem:
 *   talk:<npcId>              → talked to that NPC
 *   bug:<zoneId>             → defeated a bug in that zone (count = how many)
 *   deliver:<item>:<npcId>   → talked to NPC while carrying item
 *   boss                     → defeated the final boss
 *
 * State per quest is tracked at runtime: 'locked' | 'active' | 'done'.
 */
export const QUESTS = [
  {
    id: 'q_intro',
    title: 'Erste Schicht',
    desc: 'Verschaffe dir einen Überblick – sprich mit Jessi am Empfang.',
    giver: 'sam',
    trigger: 'talk:sam',
    count: 1,
    reward: 10,
    startActive: true
  },
  {
    id: 'q_css',
    title: 'Endlosschleife',
    desc: 'Sprich mit Melina im Open-Space und löse die CSS-Endlosschleife im Code-Duell.',
    giver: 'lena',
    trigger: 'bug:frontend',
    count: 1,
    reward: 30,
    startActive: false
  },
  {
    id: 'q_meeting',
    title: 'Ticket-Chaos',
    desc: 'Sprich mit Mehmet im Open-Space und sortiere das agile Board im Code-Duell.',
    giver: 'mehmet',
    trigger: 'bug:meeting',
    count: 1,
    reward: 35,
    startActive: false
  },
  {
    id: 'q_digital',
    title: 'API-Ausfall',
    desc: 'Fahr ins 3. OG zu den Digital Solutions und bring mit Sven die API zurück.',
    giver: 'sven',
    trigger: 'bug:digital',
    count: 1,
    reward: 40,
    startActive: false
  },
  {
    id: 'q_design',
    title: 'Kontrast-Katastrophe',
    desc: 'Hilf Aylin im 4. OG, das Design im Inclusive Design Lab wieder barrierefrei zu machen.',
    giver: 'aylin',
    trigger: 'bug:design',
    count: 1,
    reward: 40,
    startActive: false
  },
  {
    id: 'q_mobile',
    title: 'App-Crash',
    desc: 'Stabilisiere mit Emre in der App Factory (5. OG) den abstürzenden App-Build.',
    giver: 'tobias',
    trigger: 'bug:mobile',
    count: 1,
    reward: 40,
    startActive: false
  },
  {
    id: 'q_facility',
    title: 'Gebäude-Alarm',
    desc: 'Bring mit Frank im Facility Management (6. OG) die Gebäudetechnik wieder zur Ruhe.',
    giver: 'frank',
    trigger: 'bug:facility',
    count: 1,
    reward: 40,
    startActive: false
  },
  {
    id: 'q_people',
    title: 'Onboarding-Stau',
    desc: 'Hilf Petra bei People · Culture · Places (7. OG), das Onboarding wieder flott zu machen.',
    giver: 'petra',
    trigger: 'bug:people',
    count: 1,
    reward: 45,
    startActive: false
  },
  {
    id: 'q_coffee',
    title: 'Backend-Blackout',
    desc: 'Sprich mit Viktor im Serverraum (8. OG) und bring den Service mit Backend-Wissen zurück.',
    giver: 'jonas',
    trigger: 'deliver:coffee:jonas',
    count: 1,
    reward: 50,
    startActive: false
  },
  {
    id: 'q_boss',
    title: 'Der Ur-Bug',
    desc: 'Wenn alle Abteilungen gerettet sind: Stell dich mit Kristof im 8. OG dem Legacy-Code-Monster.',
    giver: 'klein',
    trigger: 'boss',
    count: 1,
    reward: 100,
    startActive: false
  }
];

export function questById(id) {
  return QUESTS.find((q) => q.id === id) || null;
}
