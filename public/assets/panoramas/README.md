# 360°-Panoramen (echte Büro-Räume)

Hier liegen die **echten 360°-Aufnahmen** aus dem Star-Finanz-Rundgang
(3DVista-Tour von Nexpics), aufbereitet als **Cube-Map-Skybox** für das Spiel.

Pro Raum ein Ordner mit 6 Würfelseiten (je 2048×2048):

```
<raum>/f.jpg  b.jpg  l.jpg  r.jpg  u.jpg  d.jpg
```

Aktuell enthaltene Räume (Spielbereich → Ordner):

| Spielbereich | Ordner | Tour-Aufnahme |
|--------------|--------|---------------|
| Eingang & Empfang | `eingang/` | IMG_1618 – Eingang |
| WAP · Open Space | `wap/` | IMG_4238 – WAP |
| Meetingraum · Speicherstadt | `meetingraum/` | IMG_3694 – Speicherstadt |
| Star Café & Lounge | `starcafe/` | IMG_4134 – Star Café |
| (Reserve) Loungebereich | `lounge/` | IMG_4778 – Loungebereich |

Der Serverraum bleibt bewusst im stilisierten Low-Poly-Look (passt zur
„infizierten" Stimmung des Bosskampfs).

## Neu laden / Qualität ändern

Die Bilder werden mit einem Tool direkt aus der Tour geladen und zusammengesetzt:

```bash
npm run fetch-panoramas
```

In `tools/fetch-panoramas.mjs`:
- `LEVEL` steuert die Auflösung (0 = 4096², 1 = 2048² Standard, 2 = 1024²).
- `ROOMS` ordnet Spielräume den Tour-Panorama-IDs zu – weitere Räume einfach
  ergänzen (die IDs/Labels stehen in der Tour-Konfiguration).

## Ausrichtung anpassen

Falls ein Raum spiegelverkehrt oder „verdreht" wirkt, lässt sich das an **einer**
Stelle korrigieren: der Flächen-Reihenfolge in `src/core/AssetManager.js` →
`loadRoomCube()` (`r↔l` tauschen gegen Spiegelung, `f↔b` gegen 180°-Drehung).

