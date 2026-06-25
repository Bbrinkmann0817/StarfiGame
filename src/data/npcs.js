/**
 * Colleague NPCs for the guided FIAE learning campaign.
 *
 * Talking to a colleague opens a conversation that explains their "problem",
 * then — for colleagues with a `challenge` — the quiz starts immediately with
 * questions ONLY from that colleague's field (`challenge.topics`).
 *
 * Each NPC:
 *   id, name, role, emoji (portrait), color (body),
 *   floor (which elevator floor they live on), pos:[x,z], heading,
 *   quest (id this colleague's challenge completes),
 *   challenge (optional quiz config), lines: { intro, done, [locked] }
 *
 * challenge:
 *   problem, emoji, topics[] (question pool), hp (correct answers needed),
 *   time, damage, level (narrative), maxDifficulty (question cap),
 *   isBoss, requires[] (quest ids gating it)
 *
 * {name} in dialog lines is replaced with the player's entered name.
 */
export const NPCS = [
  // ----- 1. OG · Empfang -----
  {
    id: 'sam',
    name: 'Jessi · Empfang',
    role: 'Office Management',
    emoji: '🧑‍💼',
    color: 0xe2001a,
    floor: 'og1',
    pos: [0, -5],
    heading: 0,
    quest: 'q_intro',
    photo: null,
    lines: {
      intro: [
        'Da bist du ja, {name}! Gott sei Dank – wir brauchen dich heute dringend. 🙏',
        'Ein Ur-Bug hat das System infiziert und legt nach und nach alle Etagen lahm.',
        'Bevor ich dich hoch zu Melina schicke, musst du mir erst zeigen, dass du fokussiert bist: eine Runde Simon Says.',
        'Jede Etage ist eine eigene Fachabteilung mit eigenem Code-Duell – und es wird Level für Level kniffliger. Du schaffst das, {name}!',
        'Und falls jemand nach Kettensägen-Benzin fragt: einfach lächeln und weiter deployen. 😄'
      ],
      done: ['Stark, {name}! Simon Says bestanden. Fahr jetzt mit dem Fahrstuhl ins 2. OG und hilf Melina im Frontend. ☕']
    }
  },

  // ----- 2. OG · Open Space (Frontend + Produkt) -----
  {
    id: 'lena',
    name: 'Melina · Frontend',
    role: 'Frontend Engineer',
    emoji: '👩‍💻',
    color: 0x8f0682,
    floor: 'og2',
    pos: [-8, -4],
    heading: 0,
    quest: 'q_css',
    photo: null,
    challenge: {
      problem: 'CSS-Endlosschleife',
      emoji: '🌀',
      topics: ['frontend'],
      hp: 3, time: 14, damage: 16, level: 1, maxDifficulty: 1
    },
    lines: {
      intro: [
        'Hilfe, {name}! Wir hängen in einer unendlichen CSS-Schleife fest. 🌀',
        'Jedes Mal beim Speichern springt das Layout zurück auf <code>z-index: 9999</code>.',
        'Du kennst dich mit HTML, CSS und JavaScript aus? Dann lass uns die Schleife jetzt zusammen aufbrechen – Frontend-Fragen, los geht’s!',
        'Und nein, die Torte im Pausenraum ist wahrscheinlich keine echte Quest-Belohnung.'
      ],
      done: ['Endlich! Das Layout rendert wieder sauber. Du bist ein Lebensretter, {name}. 💜']
    }
  },
  {
    id: 'mehmet',
    name: 'Stefan · Product',
    role: 'Product Manager',
    emoji: '🧑‍🏫',
    color: 0x00707f,
    floor: 'og2',
    pos: [-8, 7],
    heading: 0,
    quest: 'q_meeting',
    photo: null,
    challenge: {
      problem: 'Ticket-Chaos',
      emoji: '📝',
      topics: ['product'],
      hp: 3, time: 13, damage: 14, level: 2, maxDifficulty: 2
    },
    lines: {
      intro: [
        'Gut, dass du da bist, {name}! Unser Board ist im totalen Chaos. 📝',
        'Bevor ich neu priorisieren kann, müssen wir das agile Vorgehen wieder geradeziehen.',
        'Ich stell dir ein paar Fragen rund um Scrum, Backlog & Co. Sortieren wir das Board zusammen!',
        'Und diesmal bitte kein "nur noch eine Side-Quest" mitten im Sprint. 😅'
      ],
      done: ['Das Backlog ist wieder priorisiert. Du gehörst ins Produktteam, {name}! 🟢']
    }
  },

  // ----- 3. OG · Digital Solutions -----
  {
    id: 'sven',
    name: 'Sven · Digital Solutions',
    role: 'Solutions Architect',
    emoji: '🧑‍🔧',
    color: 0x00707f,
    floor: 'og3',
    pos: [-4, -6],
    heading: 0,
    quest: 'q_digital',
    photo: null,
    challenge: {
      problem: 'API-Ausfall',
      emoji: '🔌',
      topics: ['digital'],
      hp: 4, time: 13, damage: 14, level: 3, maxDifficulty: 2
    },
    lines: {
      intro: [
        'Willkommen in den Digital Solutions, {name}! Hier laufen unsere digitalen Banking-Lösungen zusammen.',
        'Gerade ist eine zentrale API ausgefallen – ohne sie kommunizieren die Systeme nicht mehr. 🔌',
        'Hilf mir mit ein paar Fragen zu APIs, Cloud und Online-Banking, dann bringen wir die Schnittstelle zurück!',
        'Ein bisschen klingt das schon wie: "Would you kindly fix this endpoint?"'
      ],
      done: ['Die API antwortet wieder – sauber gemacht, {name}! Die Systeme atmen auf. 🔵']
    }
  },

  // ----- 4. OG · Inclusive Design Lab -----
  {
    id: 'aylin',
    name: 'Aylin · Design Lab',
    role: 'Inclusive Designer',
    emoji: '👩‍🎨',
    color: 0x8f0682,
    floor: 'og4',
    pos: [-4, -6],
    heading: 0,
    quest: 'q_design',
    photo: null,
    challenge: {
      problem: 'Kontrast-Katastrophe',
      emoji: '🎨',
      topics: ['design'],
      hp: 4, time: 13, damage: 14, level: 4, maxDifficulty: 2
    },
    lines: {
      intro: [
        'Schön, dass du im Inclusive Design Lab vorbeischaust, {name}! 🎨',
        'Bei einem Update ist die Barrierefreiheit zerschossen – grauer Text auf hellgrauem Grund, niemand kann das lesen.',
        'Wir müssen das Design wieder inklusiv machen. Ein paar Fragen zu UX und Accessibility – packen wir’s an!',
        'Ich war übrigens auch mal Abenteuer-Designerin, bis ein Bug mein Knie traf.'
      ],
      done: ['Jetzt ist es wieder für alle nutzbar. Danke, {name} – Design ist für Menschen! 💜']
    }
  },

  // ----- 5. OG · App Factory -----
  {
    id: 'emre',
    name: 'Emre · App Factory',
    role: 'Mobile Developer',
    emoji: '🧑‍💻',
    color: 0xdb9b4d,
    floor: 'og5',
    pos: [-9, -4],
    heading: 0,
    quest: 'q_mobile',
    photo: null,
    challenge: {
      problem: 'App-Crash',
      emoji: '📱',
      topics: ['mobile'],
      hp: 4, time: 13, damage: 15, level: 5, maxDifficulty: 2
    },
    lines: {
      intro: [
        'Hey {name}, willkommen in der App Factory – hier bauen wir die Banking-Apps! 📱',
        'Unsere App stürzt beim Login ab und der App-Store-Release wackelt.',
        'Hilf mir mit Fragen rund um iOS, Android und Mobile-Entwicklung, dann kriegen wir den Build stabil!',
        'Danach warten Britta und Jennifer mit dem StarMoney-Teil auf dich.'
      ],
      done: ['Build ist grün, die App läuft wieder rund. Stark, {name}! Sprich jetzt Britta und Jennifer gemeinsam für den StarMoney-Teil an. 🟡']
    }
  },
  {
    id: 'britta',
    name: 'Britta · StarMoney',
    role: 'Product Specialist & Business Analyst',
    emoji: '👩‍💼👩‍💻',
    color: 0xe36e6e,
    floor: 'og5',
    pos: [3.0, -6.3],
    heading: 0,
    quest: 'q_starmoney',
    photo: null,
    challenge: {
      problem: 'StarMoney-Faktencheck',
      emoji: '📊',
      topics: ['starmoney'],
      hp: 4, time: 13, damage: 15, level: 5, maxDifficulty: 2
    },
    lines: {
      intro: [
        'Hey {name}, perfekt dass du da bist! Wir bereiten gerade zusammen eine Präsentation über StarMoney vor. 📊',
        'Bei einigen Antworten zu den Kennzahlen sind wir uns unsicher und wollen auf keinen Fall etwas Falsches präsentieren.',
        'Kannst du uns helfen und die richtigen Antworten mit uns durchgehen?',
        'Wenn das sitzt, sind wir durch und die Präsentation kann raus.'
      ],
      done: ['Top! Ohne dich hätten wir das nicht geschafft, wir sind beide durch und die Präsentation steht. Vielen Dank, {name}! ✨']
    }
  },
  {
    id: 'jennifer',
    name: 'Jennifer · StarMoney',
    role: 'Business Analyst',
    emoji: '👩‍💻',
    color: 0xdb9b4d,
    floor: 'og5',
    pos: [6.1, -6.1],
    heading: 0,
    photo: null,
    lines: {
      intro: [
        'Hi {name}, ich bin Jennifer. Ich stehe Britta beim StarMoney-Faktencheck zur Seite. 👍',
        'Britta führt dich durch das Duell, ich halte die Zahlen und Notizen bereit.'
      ],
      done: ['Mega, {name}! Mit dir steht unsere StarMoney-Präsentation wieder bombenfest.']
    }
  },

  // ----- 6. OG · Facility Management -----
  {
    id: 'frank',
    name: 'Finnja · Facility',
    role: 'Facility Manager',
    emoji: '🧑‍🏭',
    color: 0x00707f,
    floor: 'og6',
    pos: [-4, -6],
    heading: 0,
    quest: 'q_facility',
    photo: null,
    challenge: {
      problem: 'Gebäude-Alarm',
      emoji: '🏢',
      topics: ['facility'],
      hp: 4, time: 14, damage: 13, level: 6, maxDifficulty: 2
    },
    lines: {
      intro: [
        'Moin {name}, hier im Facility Management halten wir den Laden am Laufen. 🏢',
        'Die Gebäudetechnik spielt verrückt: Alarm, Türen, Klima – alles meldet sich gleichzeitig.',
        'Zeig mir, dass du dich mit Sicherheit, Ordnung und Nachhaltigkeit auskennst, dann bekommen wir das Haus wieder ruhig!',
        'Es ist gefährlich, ohne Kaffee allein in den Technikraum zu gehen.'
      ],
      done: ['Alles wieder unter Kontrolle. Danke, {name} – ohne Facility läuft hier nichts! 🟢']
    }
  },

  // ----- 7. OG · People · Culture · Places -----
  {
    id: 'petra',
    name: 'Anneke · People & Culture',
    role: 'People & Culture',
    emoji: '🧑‍🤝‍🧑',
    color: 0xe36e6e,
    floor: 'og7',
    pos: [-4, -6],
    heading: 0,
    quest: 'q_people',
    photo: null,
    challenge: {
      problem: 'Onboarding-Stau',
      emoji: '🤝',
      topics: ['people'],
      hp: 5, time: 13, damage: 14, level: 7, maxDifficulty: 3
    },
    lines: {
      intro: [
        'Hallo {name}, willkommen bei People · Culture · Places! ❤️',
        'Unser Onboarding hängt fest und die neuen Azubis warten auf ihre Einarbeitung.',
        'Du als Azubi weißt am besten, was gute Kultur und Zusammenarbeit ausmacht. Ein paar Fragen dazu – dann läuft’s wieder!',
        'Respawn ist im echten Teamleben keine Option, also machen wir es gleich ordentlich.'
      ],
      done: ['Die Neuen sind an Bord und fühlen sich willkommen. Herzlich gemacht, {name}! 🧡']
    }
  },

  // ----- 8. OG · Backend & Serverraum (Backend + Boss) -----
  {
    id: 'jonas',
    name: 'Viktor · Backend',
    role: 'Backend Engineer',
    emoji: '🧔‍♂️',
    color: 0xdb9b4d,
    floor: 'og8',
    pos: [-9, -4],
    heading: 0,
    quest: 'q_coffee',
    photo: null,
    challenge: {
      problem: 'Backend-Blackout',
      emoji: '🗄️',
      topics: ['backend'],
      hp: 5, time: 12, damage: 16, level: 8, maxDifficulty: 3
    },
    lines: {
      intro: [
        'Endlich Verstärkung, {name}! Im Backend brennt’s lichterloh. 🗄️',
        'Datenbank, Services, Logik – alles wackelt, kurz vorm großen Release.',
        'Zeig mir, dass Java, SQL und OOP sitzen, dann fahren wir den Service wieder hoch!',
        'Wenn du plötzlich ein lautes Ausrufezeichen hörst: besser einmal mehr auf die Logs schauen.'
      ],
      done: ['Service ist wieder stabil. Wahnsinn, {name} – nur noch der Ur-Bug! 🟡']
    }
  },
  {
    id: 'klein',
    name: 'Kristof · IT-Security',
    role: 'IT & Security',
    emoji: '🦸',
    color: 0xdc1b42,
    floor: 'og8',
    pos: [3, -8],
    heading: 0,
    quest: 'q_boss',
    photo: null,
    challenge: {
      problem: 'Legacy-Code-Monster',
      emoji: '🐉',
      topics: ['security', 'backend', 'digital', 'frontend', 'mobile', 'starmoney'],
      hp: 6, time: 10, damage: 12, level: 9, maxDifficulty: 3, isBoss: true,
      requires: ['q_css', 'q_meeting', 'q_digital', 'q_design', 'q_mobile', 'q_starmoney', 'q_facility', 'q_people', 'q_coffee']
    },
    lines: {
      intro: [
        'Da bist du also, {name}. Mutig – der Ur-Bug hat sich tief im Legacy-Code eingenistet. 🐉',
        'Das Monster mischt Fragen aus allen Abteilungen und vertauscht im Kampf sogar deine Tasten.',
        'Bleib konzentriert, nutz notfalls die Maus – und dann pushen wir gemeinsam den finalen Master-Commit!',
        'Denk dran: In Bossfights hilft manchmal ein geheimer Code ... oder sehr saubere Namensgebung.'
      ],
      locked: [
        'Noch nicht, {name}! Solange nicht alle Abteilungen wieder stabil laufen, frisst uns das Monster auf.',
        'Bring erst Frontend, Produkt, Digital Solutions, Design, App Factory, Facility, People und Backend in Ordnung – dann stellen wir uns dem Ur-Bug.'
      ],
      done: ['Unglaublich, {name}. Du hast es wirklich geschafft. Schönes Wochenende – du hast es dir verdient! 💪']
    }
  }
];

export function npcById(id) {
  return NPCS.find((n) => n.id === id) || null;
}
