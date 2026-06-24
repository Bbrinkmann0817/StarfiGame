# Operation: Go-Live – Das Büro-Abenteuer

Ein 3D-Third-Person-Büroabenteuer mit Quiz-Kampfsystem, gebaut mit
[Three.js](https://threejs.org/) und [Vite](https://vitejs.dev/). Du kämpfst
dich durch die Abteilungen eines Software-Büros, hilfst den Teams, sammelst
Loot und besiegst den **Ur-Bug** im Serverraum, um den Release zu retten.

![Status](https://img.shields.io/badge/Status-Vertical%20Slice%20spielbar-00e5ff)

---

## 🚀 Schnellstart

```bash
npm install
npm run dev
```

Vite öffnet das Spiel automatisch im Browser (Standard: <http://localhost:5173>).
Auf **„Schicht beginnen"** klicken – fertig.

Produktions-Build:

```bash
npm run build      # erzeugt /dist
npm run preview    # Build lokal testen
```

---

## 🎮 Steuerung

| Taste | Aktion |
|-------|--------|
| `W` `A` `S` `D` / Pfeile | Bewegen |
| Maus (nach Klick ins Bild) | Umsehen / Kamera |
| `Shift` | Sprinten |
| `E` | Interagieren (Kollegen ansprechen, Cafeteria) |
| `Leertaste` / `E` | Dialog weiter |
| `Tab` | Quest-Log öffnen/schließen |
| `Esc` | Pause |
| `M` | Ton an/aus |
| Maus / `A`–`D` / `1`–`4` | Antwort im Quiz-Kampf wählen |

---

## 🕹️ Spielprinzip

- **Erkundung:** Fünf Abteilungen – Lobby, Open-Space (Frontend), Meetingraum,
  Lounge/Küche und Serverraum.
- **Kollegen-Quests:** NPCs geben Aufträge (CSS-Endlosschleife, Post-it-Plage,
  Koffein-Notstand …). Quest-Marker über den Köpfen: `!` neu · `?` aktiv · `✓` erledigt.
- **Loot:** ☕ Kaffeetassen (Sprint-Boost) und 🪙 Jira-Münzen (Währung).
- **Cafeteria-Upgrades:** In der Lounge gegen Münzen kaufen – Clean-Code-Brille,
  Espresso, Debugging-Ente, mechanische Tastatur.
- **Quiz-Kämpfe:** Bugs als Glitch-Anomalien berühren → Code-Duell. Drei
  Kategorien: **Tech-Stack**, **Finanz & Banking**, **Büro-Lore**.
- **Bosskampf:** Das **Legacy-Code-Monster** im Serverraum hat mehr HP und
  vertauscht zwischendurch deine Tastenbelegung (Maus bleibt zuverlässig!).

---

## 🗂️ Projektstruktur

```
StarGame/
├── index.html              # UI-Gerüst (Titel, HUD, Dialog, Quiz, Shop …)
├── styles/main.css         # gesamtes UI-Styling inkl. Glitch-Effekte
├── public/assets/          # ← hier kommen eure Bilder / 360°-Fotos / Audio rein
│   ├── images/             #   Logo, Team-Portraits, Poster
│   ├── panoramas/          #   equirectangulare 360°-Aufnahmen der Räume
│   └── audio/              #   optionale eigene Musik/SFX
└── src/
    ├── main.js             # Einstieg
    ├── core/               # Game-Loop, Input, Asset-Loader
    ├── world/              # Gebäude, Materialien (Cel-Shading), Sprites
    ├── entities/           # Player, NPC, Bug, Item, Charaktermodell
    ├── systems/            # Quiz, Quests, Inventar, Audio (prozedural)
    ├── ui/                 # HUD, Dialog, Shop, Quest-Log
    └── data/               # Fragen, NPCs, Quests, Shop, Raum-Layout
```

---

## 🖼️ Eigene Assets einbinden (für später)

Das Spiel läuft komplett mit prozeduralen Platzhaltern – **es werden keine
externen Dateien benötigt.** Sobald ihr echtes Material liefert:

1. **Logo:** `public/assets/images/logo.png` → erscheint automatisch in der Lobby.
2. **360°-Räume:** Fotos nach `public/assets/panoramas/` legen, Details in
   `public/assets/panoramas/README.md`.
3. **Team-Portraits:** in `src/data/npcs.js` beim NPC `photo` setzen.
4. **Eigene Musik:** nach `public/assets/audio/`, siehe README dort.

Inhaltliche Anpassungen (Fragen, Texte, NPC-Namen, Raum-Layout) liegen
übersichtlich in `src/data/` und lassen sich ohne Programmierkenntnisse ändern.

---

## 🎨 Stil

Cleaner Low-Poly-/Cel-Shading-Look (Three.js `MeshToonMaterial` + Outline),
helle Büro-Atmosphäre mit neonfarbenen Glitch-Effekten für die Bugs.
Soundtrack prozedural: Lo-Fi beim Erkunden, 8-Bit im Kampf.

---

## 🛠️ Tech

- Three.js (3D), Vite (Build/Dev-Server), Vanilla JS (ES-Module)
- Web Audio API (prozeduraler Soundtrack & SFX)
- Keine Backend-Abhängigkeit, läuft vollständig im Browser
