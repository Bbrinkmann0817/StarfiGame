/**
 * Quiz question bank for the "Code-Duell" learning game.
 *
 * Questions are tagged by TOPIC so every department only asks questions from its
 * own field (Frontend → Frontend questions, App Factory → mobile questions, …).
 *
 * Each question:
 *   { topic, difficulty: 1|2|3, q, answers:[4], correct:<index> }
 *
 * Topics map 1:1 to the departments/levels:
 *   frontend  · product · backend · digital · design · mobile · facility · people · security
 *
 * `q` and `answers` may contain light inline HTML (<code>…</code>) because the
 * content is fully static and authored here — never user/network input.
 */

export const TOPIC_LABELS = {
  frontend: 'FRONTEND',
  product: 'PRODUKT & AGILE',
  backend: 'BACKEND',
  digital: 'DIGITAL SOLUTIONS',
  design: 'INCLUSIVE DESIGN',
  mobile: 'APP FACTORY',
  facility: 'FACILITY MANAGEMENT',
  people: 'PEOPLE · CULTURE · PLACES',
  security: 'IT-SECURITY'
};

const BASE_QUESTIONS = [
  // ============================== FRONTEND (Level 1) ==============================
  { topic: 'frontend', difficulty: 1, q: 'Wofür steht <strong>HTML</strong>?', answers: ['Hypertext Markup Language', 'High Tech Modern Language', 'Home Tool Markup Language', 'Hyperlink Management Layer'], correct: 0 },
  { topic: 'frontend', difficulty: 1, q: 'Mit welchem HTML-Tag erstellt man einen Link?', answers: ['<code>&lt;a&gt;</code>', '<code>&lt;link&gt;</code>', '<code>&lt;href&gt;</code>', '<code>&lt;url&gt;</code>'], correct: 0 },
  { topic: 'frontend', difficulty: 1, q: 'Welche CSS-Eigenschaft ändert die Textfarbe?', answers: ['<code>color</code>', '<code>font-color</code>', '<code>text-style</code>', '<code>background</code>'], correct: 0 },
  { topic: 'frontend', difficulty: 1, q: 'Welche CSS-Eigenschaft setzt die Hintergrundfarbe?', answers: ['<code>background-color</code>', '<code>color</code>', '<code>fill</code>', '<code>bg</code>'], correct: 0 },
  { topic: 'frontend', difficulty: 1, q: 'Welches HTML-Tag bindet ein Bild ein?', answers: ['<code>&lt;img&gt;</code>', '<code>&lt;image&gt;</code>', '<code>&lt;pic&gt;</code>', '<code>&lt;src&gt;</code>'], correct: 0 },
  { topic: 'frontend', difficulty: 1, q: 'Mit welchem JavaScript-Schlüsselwort deklariert man eine blockweite Variable?', answers: ['<code>let</code>', '<code>dim</code>', '<code>variable</code>', '<code>def</code>'], correct: 0 },
  { topic: 'frontend', difficulty: 1, q: 'Wie kommentiert man eine Zeile in JavaScript?', answers: ['<code>// Kommentar</code>', '<code># Kommentar</code>', '<code>&lt;!-- Kommentar --&gt;</code>', '<code>* Kommentar</code>'], correct: 0 },
  { topic: 'frontend', difficulty: 1, q: 'Welches HTML-Element erzeugt eine Überschrift erster Ordnung?', answers: ['<code>&lt;h1&gt;</code>', '<code>&lt;head&gt;</code>', '<code>&lt;title&gt;</code>', '<code>&lt;top&gt;</code>'], correct: 0 },
  { topic: 'frontend', difficulty: 1, q: 'Wofür steht <strong>CSS</strong>?', answers: ['Cascading Style Sheets', 'Creative Style System', 'Computer Styled Sites', 'Central Style Service'], correct: 0 },
  { topic: 'frontend', difficulty: 1, q: 'Welche Einheit ist in CSS <em>relativ</em> zur Schriftgröße des Elements?', answers: ['<code>em</code>', '<code>px</code>', '<code>cm</code>', '<code>pt</code>'], correct: 0 },
  { topic: 'frontend', difficulty: 1, q: 'Welches Tag erstellt eine ungeordnete Liste?', answers: ['<code>&lt;ul&gt;</code>', '<code>&lt;ol&gt;</code>', '<code>&lt;list&gt;</code>', '<code>&lt;li&gt;</code>'], correct: 0 },
  { topic: 'frontend', difficulty: 2, q: 'Welches CSS-Layout-Modell ist <em>eindimensional</em>?', answers: ['Flexbox', 'Grid', 'Float', 'Table'], correct: 0 },
  { topic: 'frontend', difficulty: 2, q: 'Was steuert die CSS-Eigenschaft <code>z-index</code>?', answers: ['Die Stapelreihenfolge von Elementen', 'Die Schriftgröße', 'Die Zoomstufe', 'Die Animationsdauer'], correct: 0 },
  { topic: 'frontend', difficulty: 2, q: 'Was gibt <code>typeof "42"</code> in JavaScript zurück?', answers: ['<code>"string"</code>', '<code>"number"</code>', '<code>"text"</code>', '<code>"42"</code>'], correct: 0 },
  { topic: 'frontend', difficulty: 2, q: 'Womit wählt man in CSS ein Element mit der ID <code>menu</code>?', answers: ['<code>#menu</code>', '<code>.menu</code>', '<code>*menu</code>', '<code>menu</code>'], correct: 0 },
  { topic: 'frontend', difficulty: 2, q: 'Welche JS-Methode wählt das erste passende Element per CSS-Selektor?', answers: ['<code>document.querySelector()</code>', '<code>document.getAll()</code>', '<code>document.find()</code>', '<code>document.select()</code>'], correct: 0 },
  { topic: 'frontend', difficulty: 3, q: 'Was beschreibt das <strong>DOM</strong>?', answers: ['Die Baumstruktur eines HTML-Dokuments im Browser', 'Eine CSS-Animation', 'Ein Datenbankschema', 'Ein JavaScript-Framework'], correct: 0 },

  // ============================== PRODUKT & AGILE (Level 2) ==============================
  { topic: 'product', difficulty: 1, q: 'Was ist ein <strong>Sprint</strong> in Scrum?', answers: ['Ein fester Zeitraum, in dem ein Inkrement entsteht', 'Eine Mittagspause', 'Ein einmaliges Meeting', 'Ein Server-Neustart'], correct: 0 },
  { topic: 'product', difficulty: 1, q: 'Wie lange dauert ein <strong>Daily Standup</strong> idealerweise?', answers: ['Etwa 15 Minuten', 'Etwa 2 Stunden', 'Den ganzen Vormittag', 'Genau 1 Minute'], correct: 0 },
  { topic: 'product', difficulty: 1, q: 'Wer priorisiert in Scrum das Product Backlog?', answers: ['Product Owner', 'Scrum Master', 'Entwicklungsteam', 'Geschäftsführung'], correct: 0 },
  { topic: 'product', difficulty: 1, q: 'Was steht im <strong>Product Backlog</strong>?', answers: ['Die priorisierten Anforderungen für das Produkt', 'Die Urlaubsplanung', 'Der Quellcode', 'Die Server-Logs'], correct: 0 },
  { topic: 'product', difficulty: 1, q: 'Was ist eine <strong>User Story</strong>?', answers: ['Eine Anforderung aus Sicht der Nutzer:innen', 'Ein Fehlerbericht', 'Ein Vertrag', 'Ein Logfile'], correct: 0 },
  { topic: 'product', difficulty: 1, q: 'Wofür steht <strong>MVP</strong> im Produktkontext?', answers: ['Minimum Viable Product', 'Most Valued Person', 'Maximum Value Plan', 'Master Version Push'], correct: 0 },
  { topic: 'product', difficulty: 1, q: 'Was ist das Ziel eines <strong>Sprint Reviews</strong>?', answers: ['Das Ergebnis zeigen und Feedback einholen', 'Den Code zu kompilieren', 'Urlaub zu planen', 'Server zu warten'], correct: 0 },
  { topic: 'product', difficulty: 1, q: 'Welche Rolle moderiert und beseitigt Hindernisse im Scrum-Team?', answers: ['Scrum Master', 'Product Owner', 'CEO', 'Tester'], correct: 0 },
  { topic: 'product', difficulty: 2, q: 'Was beschreibt die <strong>Definition of Done</strong>?', answers: ['Gemeinsame Kriterien, wann eine Aufgabe fertig ist', 'Die Deadline des Projekts', 'Das Budget', 'Der Name des Sprints'], correct: 0 },
  { topic: 'product', difficulty: 2, q: 'Wozu dient ein <strong>Kanban-Board</strong>?', answers: ['Den Arbeitsfluss sichtbar zu machen', 'Passwörter zu speichern', 'Code zu kompilieren', 'E-Mails zu sortieren'], correct: 0 },
  { topic: 'product', difficulty: 2, q: 'Was misst die <strong>Velocity</strong> eines Teams?', answers: ['Wie viel Arbeit pro Sprint geschafft wird', 'Die WLAN-Geschwindigkeit', 'Die Anzahl der Bugs', 'Die Teamgröße'], correct: 0 },
  { topic: 'product', difficulty: 2, q: 'Was passiert in der <strong>Sprint Retrospektive</strong>?', answers: ['Das Team reflektiert die Zusammenarbeit und verbessert sie', 'Es wird neuer Code geschrieben', 'Der Release wird deployt', 'Die Tickets werden geschätzt'], correct: 0 },
  { topic: 'product', difficulty: 2, q: 'Welche Schätzmethode nutzt Karten mit Zahlenwerten?', answers: ['Planning Poker', 'Pair Programming', 'Code Review', 'Standup'], correct: 0 },
  { topic: 'product', difficulty: 3, q: 'Was bedeutet ein hoher <strong>Business Value</strong> bei einem Backlog-Item?', answers: ['Es bringt dem Kunden/Unternehmen besonders viel Nutzen', 'Es ist technisch besonders schwierig', 'Es kostet wenig Zeit', 'Es betrifft nur das Design'], correct: 0 },

  // ============================== BACKEND (Level 8) ==============================
  { topic: 'backend', difficulty: 1, q: 'Welches Zeichen beendet in Java eine Anweisung?', answers: ['<code>;</code>', '<code>:</code>', '<code>.</code>', '<code>,</code>'], correct: 0 },
  { topic: 'backend', difficulty: 1, q: 'Welcher Java-Datentyp speichert ganze Zahlen?', answers: ['<code>int</code>', '<code>String</code>', '<code>boolean</code>', '<code>char</code>'], correct: 0 },
  { topic: 'backend', difficulty: 1, q: 'Welche Werte kann ein <code>boolean</code> annehmen?', answers: ['<code>true</code> oder <code>false</code>', '0 bis 255', '<code>null</code> oder 1', 'A bis Z'], correct: 0 },
  { topic: 'backend', difficulty: 1, q: 'Welche SQL-Anweisung liest Daten aus einer Tabelle?', answers: ['<code>SELECT</code>', '<code>INSERT</code>', '<code>UPDATE</code>', '<code>DROP</code>'], correct: 0 },
  { topic: 'backend', difficulty: 1, q: 'Was macht ein <strong>Compiler</strong>?', answers: ['Er übersetzt Quellcode in ausführbaren Code', 'Er zeigt Webseiten an', 'Er sichert Dateien', 'Er entwirft das UI'], correct: 0 },
  { topic: 'backend', difficulty: 2, q: 'Welche SQL-Klausel filtert einzelne Zeilen?', answers: ['<code>WHERE</code>', '<code>ORDER BY</code>', '<code>GROUP BY</code>', '<code>LIMIT</code>'], correct: 0 },
  { topic: 'backend', difficulty: 2, q: 'Was ist ein <strong>Primärschlüssel</strong>?', answers: ['Eine eindeutige Kennung eines Datensatzes', 'Das Passwort der Datenbank', 'Die erste Spalte links', 'Ein verschlüsseltes Feld'], correct: 0 },
  { topic: 'backend', difficulty: 2, q: 'Was beschreibt <strong>Vererbung</strong> in der OOP?', answers: ['Eine Klasse übernimmt Eigenschaften einer Oberklasse', 'Variablen werden gelöscht', 'Code wird kompiliert', 'Daten werden verschlüsselt'], correct: 0 },
  { topic: 'backend', difficulty: 2, q: 'Wodurch entsteht eine <code>NullPointerException</code>?', answers: ['Zugriff auf eine <code>null</code>-Referenz', 'Division durch null', 'Zu großer <code>int</code>', 'Endlosschleife'], correct: 0 },
  { topic: 'backend', difficulty: 2, q: 'Welche HTTP-Methode fragt typischerweise Daten ab, ohne sie zu ändern?', answers: ['<code>GET</code>', '<code>POST</code>', '<code>DELETE</code>', '<code>PUT</code>'], correct: 0 },
  { topic: 'backend', difficulty: 2, q: 'Was gibt <code>System.out.println(1 + 2 + "3")</code> aus?', answers: ['<code>"33"</code>', '<code>"123"</code>', '<code>"6"</code>', '<code>"15"</code>'], correct: 0 },
  { topic: 'backend', difficulty: 3, q: 'Welcher JOIN liefert nur Zeilen mit Treffer in <em>beiden</em> Tabellen?', answers: ['<code>INNER JOIN</code>', '<code>LEFT JOIN</code>', '<code>FULL OUTER JOIN</code>', '<code>CROSS JOIN</code>'], correct: 0 },
  { topic: 'backend', difficulty: 3, q: 'Wofür steht <strong>ACID</strong> bei Transaktionen?', answers: ['Atomicity, Consistency, Isolation, Durability', 'Access, Control, Identity, Data', 'Array, Class, Index, Database', 'Auth, Cache, Init, Deploy'], correct: 0 },
  { topic: 'backend', difficulty: 3, q: 'Was ist das Ziel der <strong>Normalisierung</strong>?', answers: ['Redundanzen vermeiden und Daten konsistent strukturieren', 'Die Datenbank schneller starten', 'Passwörter verschlüsseln', 'Tabellen farbig markieren'], correct: 0 },
  { topic: 'backend', difficulty: 3, q: 'Welcher Java-Typ ist für Geldbeträge am sichersten?', answers: ['<code>BigDecimal</code>', '<code>double</code>', '<code>float</code>', '<code>int</code>'], correct: 0 },
  { topic: 'backend', difficulty: 3, q: 'Was ist ein <strong>Fremdschlüssel</strong> (Foreign Key)?', answers: ['Ein Verweis auf den Primärschlüssel einer anderen Tabelle', 'Ein zweites Passwort', 'Ein Suchindex', 'Ein verschlüsseltes Feld'], correct: 0 },

  // ============================== DIGITAL SOLUTIONS (Level 3) ==============================
  { topic: 'digital', difficulty: 1, q: 'Wofür steht <strong>API</strong>?', answers: ['Application Programming Interface', 'Automatic Process Integration', 'Advanced Program Index', 'Applied Personal Identity'], correct: 0 },
  { topic: 'digital', difficulty: 1, q: 'Was ist <strong>Cloud Computing</strong> vereinfacht?', answers: ['IT-Ressourcen über das Internet nutzen', 'Eine Wetter-App', 'Ein lokaler USB-Stick', 'Ein Drucker im Büro'], correct: 0 },
  { topic: 'digital', difficulty: 1, q: 'Was ist <strong>Online-Banking</strong>?', answers: ['Bankgeschäfte über das Internet erledigen', 'Ein Geldautomat', 'Eine Filiale', 'Ein Sparschwein'], correct: 0 },
  { topic: 'digital', difficulty: 1, q: 'Was beschreibt eine <strong>Schnittstelle</strong> zwischen zwei Systemen?', answers: ['Eine definierte Art, Daten auszutauschen', 'Ein Netzwerkkabel', 'Ein Passwort', 'Eine Tabelle'], correct: 0 },
  { topic: 'digital', difficulty: 1, q: 'Wofür steht <strong>SaaS</strong>?', answers: ['Software as a Service', 'Secure Access and Storage', 'System and Application Support', 'Simple Authentication Service'], correct: 0 },
  { topic: 'digital', difficulty: 1, q: 'Welches Format wird häufig für den Datenaustausch über APIs genutzt?', answers: ['JSON', 'MP3', 'PNG', 'DOCX'], correct: 0 },
  { topic: 'digital', difficulty: 2, q: 'Was ist eine <strong>REST-API</strong>?', answers: ['Eine Web-Schnittstelle nach festen Prinzipien (z. B. über HTTP)', 'Eine Pause im Code', 'Ein Datenbank-Backup', 'Ein Verschlüsselungsverfahren'], correct: 0 },
  { topic: 'digital', difficulty: 2, q: 'Was regelt die EU-Richtlinie <strong>PSD2</strong>?', answers: ['Zahlungsdienste & Open Banking', 'Datenschutz allgemein', 'Produktsicherheit', 'Steuerrecht'], correct: 0 },
  { topic: 'digital', difficulty: 2, q: 'Was beschreibt <strong>Open Banking</strong>?', answers: ['Zugriff Dritter auf Kontodaten über sichere APIs (mit Einwilligung)', 'Filialen ohne Türen', 'Kostenlose Konten', 'Bargeldloses Zahlen per NFC'], correct: 0 },
  { topic: 'digital', difficulty: 2, q: 'Was bedeutet <strong>Skalierbarkeit</strong> einer Lösung?', answers: ['Sie kann mit steigender Last mitwachsen', 'Sie ist besonders bunt', 'Sie läuft nur lokal', 'Sie braucht keine Wartung'], correct: 0 },
  { topic: 'digital', difficulty: 2, q: 'Welche bekannte Banking-Software stammt von der Star Finanz?', answers: ['StarMoney', 'MoneyStar', 'BankPilot', 'FinTrack'], correct: 0 },
  { topic: 'digital', difficulty: 2, q: 'Wofür steht der HTTP-Statuscode <code>200</code>?', answers: ['OK / erfolgreich', 'Nicht gefunden', 'Serverfehler', 'Weiterleitung'], correct: 0 },
  { topic: 'digital', difficulty: 3, q: 'Was ist ein <strong>Webhook</strong>?', answers: ['Ein automatischer Aufruf, ausgelöst durch ein Ereignis', 'Ein Browser-Lesezeichen', 'Ein WLAN-Router', 'Ein CSS-Stil'], correct: 0 },
  { topic: 'digital', difficulty: 3, q: 'Was ist der Vorteil von <strong>Microservices</strong>?', answers: ['Unabhängig entwickel-, deploy- und skalierbare Teildienste', 'Ein einziges riesiges Programm', 'Weniger Tests nötig', 'Kein Netzwerk nötig'], correct: 0 },

  // ============================== INCLUSIVE DESIGN LAB (Level 4) ==============================
  { topic: 'design', difficulty: 1, q: 'Wofür steht <strong>UX</strong>?', answers: ['User Experience', 'Universal Export', 'Ultra X-Ray', 'User Extension'], correct: 0 },
  { topic: 'design', difficulty: 1, q: 'Was bedeutet <strong>Barrierefreiheit</strong> (Accessibility)?', answers: ['Alle Menschen können das Produkt nutzen – auch mit Einschränkungen', 'Die App ist kostenlos', 'Die Website ist sehr bunt', 'Es gibt keine Werbung'], correct: 0 },
  { topic: 'design', difficulty: 1, q: 'Warum ist ausreichender <strong>Farbkontrast</strong> wichtig?', answers: ['Damit Texte auch bei Sehschwäche lesbar sind', 'Damit die Seite schneller lädt', 'Damit der Code kürzer ist', 'Damit es teurer aussieht'], correct: 0 },
  { topic: 'design', difficulty: 1, q: 'Wofür dient ein <strong>Alt-Text</strong> bei Bildern?', answers: ['Beschreibung für Screenreader und wenn das Bild fehlt', 'Eine größere Schrift', 'Ein zweites Bild', 'Ein Wasserzeichen'], correct: 0 },
  { topic: 'design', difficulty: 1, q: 'Was ist ein <strong>Screenreader</strong>?', answers: ['Software, die Bildschirminhalte vorliest', 'Ein zweiter Monitor', 'Eine Webcam', 'Ein Drucker'], correct: 0 },
  { topic: 'design', difficulty: 1, q: 'Wofür steht <strong>UI</strong>?', answers: ['User Interface (Benutzeroberfläche)', 'Unique Identifier', 'Universal Input', 'User Information'], correct: 0 },
  { topic: 'design', difficulty: 1, q: 'Was beschreibt <strong>Inclusive Design</strong>?', answers: ['Gestaltung, die möglichst viele Menschen einschließt', 'Nur Design für Profis', 'Design ohne Farben', 'Design nur für Smartphones'], correct: 0 },
  { topic: 'design', difficulty: 2, q: 'Wofür steht der Standard <strong>WCAG</strong>?', answers: ['Web Content Accessibility Guidelines', 'Web Color And Graphics', 'Wide Caching Access Gateway', 'World Computer Access Group'], correct: 0 },
  { topic: 'design', difficulty: 2, q: 'Was ist ein <strong>Wireframe</strong>?', answers: ['Ein schlichter Entwurf des Layouts/Aufbaus', 'Ein WLAN-Kabel', 'Ein fertiges Produktfoto', 'Eine Datenbank'], correct: 0 },
  { topic: 'design', difficulty: 2, q: 'Welche Mindest-Größe für Touch-Ziele gilt als gut bedienbar?', answers: ['Etwa 44×44 Pixel', '5×5 Pixel', '500×500 Pixel', '1×1 Pixel'], correct: 0 },
  { topic: 'design', difficulty: 2, q: 'Warum sollte Information nicht <em>nur</em> über Farbe vermittelt werden?', answers: ['Farbfehlsichtige könnten sie sonst nicht erkennen', 'Farben laden langsamer', 'Farben sind verboten', 'Es spart Speicher'], correct: 0 },
  { topic: 'design', difficulty: 2, q: 'Was ist eine <strong>Persona</strong> im UX-Design?', answers: ['Ein fiktiver, typischer Nutzer als Gestaltungshilfe', 'Ein echter Mitarbeiter', 'Ein Passwort', 'Ein Logo'], correct: 0 },
  { topic: 'design', difficulty: 2, q: 'Was bringt <strong>Usability-Testing</strong>?', answers: ['Echte Nutzer:innen decken Probleme im Bedienfluss auf', 'Der Code wird schneller', 'Die Datenbank wird kleiner', 'Es ersetzt das Backend'], correct: 0 },
  { topic: 'design', difficulty: 3, q: 'Was bedeutet das WCAG-Prinzip „<strong>wahrnehmbar</strong>“?', answers: ['Inhalte müssen für die Sinne erfassbar sein (z. B. Text-Alternativen)', 'Die Seite muss animiert sein', 'Der Code muss offen sein', 'Es darf keine Bilder geben'], correct: 0 },

  // ============================== APP FACTORY (Level 5) ==============================
  { topic: 'mobile', difficulty: 1, q: 'Welche Programmiersprache nutzt man typisch für native <strong>iOS</strong>-Apps?', answers: ['Swift', 'Kotlin', 'PHP', 'Ruby'], correct: 0 },
  { topic: 'mobile', difficulty: 1, q: 'Welche Sprache ist heute Standard für native <strong>Android</strong>-Apps?', answers: ['Kotlin', 'Swift', 'C#', 'Perl'], correct: 0 },
  { topic: 'mobile', difficulty: 1, q: 'Über welchen Store werden iPhone-Apps veröffentlicht?', answers: ['App Store', 'Play Store', 'Microsoft Store', 'Steam'], correct: 0 },
  { topic: 'mobile', difficulty: 1, q: 'Mit welchem Schlüsselwort deklariert man in Swift eine Konstante?', answers: ['<code>let</code>', '<code>const</code>', '<code>var</code>', '<code>final</code>'], correct: 0 },
  { topic: 'mobile', difficulty: 1, q: 'Was ist eine <strong>Push-Benachrichtigung</strong>?', answers: ['Eine Mitteilung, die die App vom Server erhält', 'Ein Knopf zum Drücken', 'Ein Ladebalken', 'Ein App-Icon'], correct: 0 },
  { topic: 'mobile', difficulty: 1, q: 'Wie heißt Apples deklaratives UI-Framework?', answers: ['SwiftUI', 'UIKit', 'AppKit', 'Cocoa'], correct: 0 },
  { topic: 'mobile', difficulty: 1, q: 'Was bedeutet <strong>responsives Design</strong> bei Apps?', answers: ['Das Layout passt sich an verschiedene Bildschirmgrößen an', 'Die App antwortet auf E-Mails', 'Die App ist sehr schnell', 'Die App nutzt viel Akku'], correct: 0 },
  { topic: 'mobile', difficulty: 2, q: 'Was ist ein <code>Optional</code> in Swift?', answers: ['Ein Typ, der einen Wert oder <code>nil</code> enthalten kann', 'Eine optionale Funktion', 'Ein nicht benötigter Parameter', 'Ein UI-Element'], correct: 0 },
  { topic: 'mobile', difficulty: 2, q: 'Was prüft Apple vor der Veröffentlichung im App Store?', answers: ['Den App-Review nach Richtlinien', 'Die Lieblingsfarbe', 'Die Anzahl der Entwickler', 'Den WLAN-Namen'], correct: 0 },
  { topic: 'mobile', difficulty: 2, q: 'Was beschreibt der <strong>App-Lifecycle</strong>?', answers: ['Die Zustände einer App (z. B. aktiv, im Hintergrund, beendet)', 'Den Akkustand', 'Die App-Bewertung', 'Den Download-Ordner'], correct: 0 },
  { topic: 'mobile', difficulty: 2, q: 'Was ist <strong>Cross-Platform-Entwicklung</strong>?', answers: ['Eine Codebasis für iOS und Android (z. B. mit Flutter)', 'Apps nur für iOS', 'Apps ohne UI', 'Apps nur im Browser'], correct: 0 },
  { topic: 'mobile', difficulty: 2, q: 'Warum sollte eine App auch <strong>offline</strong> sinnvoll reagieren?', answers: ['Mobile Verbindungen brechen oft ab – Nutzbarkeit erhalten', 'Offline ist verboten', 'Spart Speicher auf dem Server', 'Macht die App teurer'], correct: 0 },
  { topic: 'mobile', difficulty: 2, q: 'Was ist eine <strong>API-Anbindung</strong> in einer App?', answers: ['Die App holt/sendet Daten über eine Schnittstelle zum Server', 'Ein App-Icon', 'Ein Ladebildschirm', 'Eine Schriftart'], correct: 0 },
  { topic: 'mobile', difficulty: 3, q: 'Wozu dient <strong>Biometrie</strong> (Face ID / Fingerabdruck) in Banking-Apps?', answers: ['Sichere, bequeme Authentifizierung der Nutzer:innen', 'Schönere Animationen', 'Schnelleres WLAN', 'Mehr Speicherplatz'], correct: 0 },

  // ============================== FACILITY MANAGEMENT (Level 6) ==============================
  { topic: 'facility', difficulty: 1, q: 'Was tust du, wenn der Feueralarm losgeht?', answers: ['Ruhig über den Fluchtweg ins Freie gehen', 'Den Aufzug nehmen', 'Erst die Mails fertig schreiben', 'Das Fenster öffnen und warten'], correct: 0 },
  { topic: 'facility', difficulty: 1, q: 'Wer darf einen <strong>Erste-Hilfe-Kasten</strong> benutzen?', answers: ['Alle im Notfall – Inhalt danach melden/auffüllen', 'Nur die Geschäftsführung', 'Niemand', 'Nur am Wochenende'], correct: 0 },
  { topic: 'facility', difficulty: 1, q: 'Wozu dient ein <strong>Mitarbeiterausweis</strong> mit Chip?', answers: ['Zugang zu Gebäude/Bereichen kontrollieren', 'Zum Bezahlen im Supermarkt', 'Als Fahrkarte', 'Als Personalausweis-Ersatz'], correct: 0 },
  { topic: 'facility', difficulty: 1, q: 'Was gehört NICHT in den Papiermüll?', answers: ['Vertrauliche Unterlagen (→ Aktenvernichter)', 'Eine leere Pappschachtel', 'Ein bedrucktes Blatt', 'Ein Notizzettel'], correct: 0 },
  { topic: 'facility', difficulty: 1, q: 'Warum sollte man im Winter trotzdem regelmäßig <strong>lüften</strong>?', answers: ['Frische Luft und weniger Keime im Raum', 'Um Strom zu sparen', 'Damit es lauter wird', 'Um den Drucker zu kühlen'], correct: 0 },
  { topic: 'facility', difficulty: 1, q: 'Was ist eine <strong>Fluchtwegkennzeichnung</strong>?', answers: ['Grüne Schilder, die zum Notausgang weisen', 'Die WLAN-Anleitung', 'Der Parkplatzplan', 'Die Kantinenkarte'], correct: 0 },
  { topic: 'facility', difficulty: 1, q: 'Was bedeutet eine <strong>ergonomische</strong> Arbeitsplatzeinrichtung?', answers: ['Gesundes, an den Menschen angepasstes Arbeiten', 'Möglichst viele Monitore', 'Ein besonders teurer Stuhl', 'Kein Tageslicht'], correct: 0 },
  { topic: 'facility', difficulty: 1, q: 'Wohin gehört eine leere Glasflasche?', answers: ['In den Glas-/Pfandbehälter', 'In den Papiermüll', 'In den Aktenvernichter', 'In die Spülmaschine'], correct: 0 },
  { topic: 'facility', difficulty: 2, q: 'Was beschreibt <strong>Nachhaltigkeit</strong> im Gebäudebetrieb?', answers: ['Ressourcen schonen (Energie, Wasser, Material)', 'Möglichst viel Strom verbrauchen', 'Alles neu kaufen', 'Heizung immer auf Maximum'], correct: 0 },
  { topic: 'facility', difficulty: 2, q: 'Wozu dient eine <strong>Brandschutztür</strong>?', answers: ['Sie hält im Brandfall Feuer/Rauch auf', 'Sie ist nur Dekoration', 'Sie spart Heizkosten', 'Sie dämmt Schall – sonst nichts'], correct: 0 },
  { topic: 'facility', difficulty: 2, q: 'Was ist ein <strong>Hausmeister-/Ticketsystem</strong> im Facility Management?', answers: ['Damit melden Mitarbeitende Defekte und Aufträge', 'Ein Spiel in der Pause', 'Das Lohnsystem', 'Der Kalender für Meetings'], correct: 0 },
  { topic: 'facility', difficulty: 2, q: 'Warum ist eine <strong>Clean-Desk-Policy</strong> auch fürs Facility relevant?', answers: ['Sauberkeit, Sicherheit und einfache Reinigung der Flächen', 'Mehr Pflanzen am Platz', 'Nur ein Monitor erlaubt', 'Tägliches Staubsaugen durch Mitarbeitende'], correct: 0 },
  { topic: 'facility', difficulty: 2, q: 'Was prüft eine regelmäßige <strong>Wartung</strong> der Klimaanlage u. a.?', answers: ['Filter und Funktion für gesunde Raumluft', 'Die WLAN-Geschwindigkeit', 'Die Mitarbeiterzahl', 'Die Bürofarbe'], correct: 0 },

  // ============================== PEOPLE · CULTURE · PLACES (Level 7) ==============================
  { topic: 'people', difficulty: 1, q: 'Was passiert beim <strong>Onboarding</strong>?', answers: ['Neue Mitarbeitende werden eingearbeitet und integriert', 'Mitarbeitende werden entlassen', 'Server werden gestartet', 'Urlaub wird gebucht'], correct: 0 },
  { topic: 'people', difficulty: 1, q: 'Was bedeutet <strong>konstruktives Feedback</strong>?', answers: ['Hilfreich, wertschätzend und auf Verbesserung gerichtet', 'Nur Lob', 'Nur Kritik ohne Beispiele', 'Hinter dem Rücken reden'], correct: 0 },
  { topic: 'people', difficulty: 1, q: 'Was ist ein <strong>Mentor</strong> bzw. eine <strong>Mentorin</strong>?', answers: ['Eine erfahrene Person, die andere begleitet und berät', 'Der Chef der Firma', 'Ein externer Kunde', 'Ein Bewerber'], correct: 0 },
  { topic: 'people', difficulty: 1, q: 'Wofür steht <strong>HR</strong>?', answers: ['Human Resources (Personalwesen)', 'High Range', 'Hardware Room', 'Hourly Rate'], correct: 0 },
  { topic: 'people', difficulty: 1, q: 'Was fördert eine gute <strong>Teamkultur</strong>?', answers: ['Vertrauen, Respekt und offene Kommunikation', 'Konkurrenz um jeden Preis', 'Geheimniskrämerei', 'Niemandem helfen'], correct: 0 },
  { topic: 'people', difficulty: 1, q: 'Was ist ein <strong>Azubi-Pate</strong> typischerweise?', answers: ['Ansprechpartner:in, die Auszubildende unterstützt', 'Ein Vorgesetzter im HR', 'Ein externer Prüfer', 'Ein Lieferant'], correct: 0 },
  { topic: 'people', difficulty: 1, q: 'Was bedeutet <strong>Work-Life-Balance</strong>?', answers: ['Ein gesundes Gleichgewicht von Arbeit und Privatleben', 'Möglichst viele Überstunden', 'Nie Pause machen', 'Arbeit am Wochenende'], correct: 0 },
  { topic: 'people', difficulty: 2, q: 'Was ist das Ziel eines <strong>Mitarbeitergesprächs</strong>?', answers: ['Austausch zu Zielen, Leistung und Entwicklung', 'Kündigung aussprechen', 'Den PC reparieren', 'Pizza bestellen'], correct: 0 },
  { topic: 'people', difficulty: 2, q: 'Was beschreibt <strong>Diversity & Inclusion</strong>?', answers: ['Vielfalt wertschätzen und alle einbeziehen', 'Nur ein Team-Typ', 'Eine Programmiersprache', 'Ein Software-Update'], correct: 0 },
  { topic: 'people', difficulty: 2, q: 'Was ist eine gängige <strong>Feedback-Regel</strong>?', answers: ['Konkret, zeitnah und auf das Verhalten bezogen', 'Möglichst allgemein und spät', 'Immer öffentlich kritisieren', 'Nie ansprechen'], correct: 0 },
  { topic: 'people', difficulty: 2, q: 'Wozu dienen <strong>flexible Arbeitsorte</strong> (Places)?', answers: ['Arbeit dort ermöglichen, wo sie am besten gelingt (Büro, Homeoffice …)', 'Nur im Keller arbeiten', 'Reisekosten erhöhen', 'Mehr Meetings erzwingen'], correct: 0 },
  { topic: 'people', difficulty: 2, q: 'Was ist <strong>aktives Zuhören</strong>?', answers: ['Aufmerksam zuhören, nachfragen und gehörtes spiegeln', 'Nebenbei E-Mails lesen', 'Sofort unterbrechen', 'Das Thema wechseln'], correct: 0 },
  { topic: 'people', difficulty: 3, q: 'Was bedeutet <strong>psychologische Sicherheit</strong> im Team?', answers: ['Fehler und Fragen sind ohne Angst möglich', 'Niemand darf Fehler machen', 'Nur der Chef redet', 'Alles ist geheim'], correct: 0 },

  // ============================== IT-SECURITY (Boss-Mix) ==============================
  { topic: 'security', difficulty: 1, q: 'Was ist <strong>Phishing</strong>?', answers: ['Betrügerisches Abgreifen von Daten über gefälschte Nachrichten', 'Ein Backup-Verfahren', 'Eine Programmiersprache', 'Ein Druckertreiber'], correct: 0 },
  { topic: 'security', difficulty: 1, q: 'Was bedeutet <strong>2FA</strong>?', answers: ['Zwei-Faktor-Authentifizierung', 'Zweite Festplatte aktiv', 'Two File Archive', 'Zwei freie Arbeitsplätze'], correct: 0 },
  { topic: 'security', difficulty: 1, q: 'Ein Kollege hat seinen Bildschirm nicht gesperrt. Was tust du?', answers: ['Bildschirm sperren & freundlich erinnern', 'Privatnachrichten lesen', 'Ignorieren', 'Den PC ausschalten'], correct: 0 },
  { topic: 'security', difficulty: 2, q: 'Was macht <strong>Ransomware</strong>?', answers: ['Sie verschlüsselt Daten und fordert Lösegeld', 'Sie beschleunigt den PC', 'Sie sichert das Postfach', 'Sie installiert Updates'], correct: 0 },
  { topic: 'security', difficulty: 2, q: 'Was ist <strong>Social Engineering</strong>?', answers: ['Menschen manipulieren, um an Informationen zu kommen', 'Ein soziales Netzwerk programmieren', 'Ein Teamevent', 'Eine Server-Wartung'], correct: 0 },
  { topic: 'security', difficulty: 2, q: 'Woran erkennt man eine verschlüsselte Website?', answers: ['An <code>https://</code> und dem Schloss-Symbol', 'An vielen Bildern', 'An einer langen URL', 'An roter Schrift'], correct: 0 },
  { topic: 'security', difficulty: 2, q: 'Warum sind <strong>Updates/Patches</strong> wichtig?', answers: ['Sie schließen bekannte Sicherheitslücken', 'Sie machen den Bildschirm heller', 'Sie löschen alte Dateien', 'Sie sparen Strom'], correct: 0 },
  { topic: 'security', difficulty: 3, q: 'Was besagt das <strong>Need-to-know-Prinzip</strong>?', answers: ['Zugriff nur, soweit für die Aufgabe nötig', 'Jeder darf alles wissen', 'Daten werden öffentlich geteilt', 'Passwörter werden im Team geteilt'], correct: 0 },
  { topic: 'security', difficulty: 3, q: 'Was regelt die <strong>DSGVO</strong>?', answers: ['Den Schutz personenbezogener Daten', 'Die Höhe der Dispozinsen', 'Den Aktienhandel', 'Die Kartengebühren'], correct: 0 },
  { topic: 'security', difficulty: 3, q: 'Was verlangt die <strong>Starke Kundenauthentifizierung</strong> (SCA)?', answers: ['Mindestens zwei unabhängige Faktoren zur Freigabe', 'Nur ein langes Passwort', 'Eine Unterschrift auf Papier', 'Den Ausweis im Original'], correct: 0 }
];

const PERSIST_KEY = 'starfigame_question_history_v1';

function loadPersistentAsked() {
  try {
    const raw = localStorage.getItem(PERSIST_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

function savePersistentAsked(set) {
  try {
    localStorage.setItem(PERSIST_KEY, JSON.stringify([...set]));
  } catch {
    // ignore storage failures
  }
}

function rotateAnswers(question, shift, suffix) {
  const n = question.answers.length;
  const answers = question.answers.map((_, i) => question.answers[(i + shift) % n]);
  const correct = (question.correct - shift + n) % n;
  return {
    id: `${question.id}${suffix}`,
    baseId: question.baseId,
    topic: question.topic,
    difficulty: question.difficulty,
    q: question.q,
    answers,
    correct
  };
}

/**
 * +200% question volume: each authored question spawns 2 additional variants.
 * Variants rotate answer slots so pattern memory is less useful.
 */
function expandQuestions(base) {
  const baseWithIds = base.map((q, idx) => {
    const baseId = `q${idx + 1}`;
    return { ...q, id: baseId, baseId };
  });
  const expanded = [];
  for (const q of baseWithIds) {
    expanded.push(q);
    expanded.push(rotateAnswers(q, 1, '_v2'));
    expanded.push(rotateAnswers(q, 2, '_v3'));
  }
  return expanded;
}

export const QUESTIONS = expandQuestions(BASE_QUESTIONS);

/** All questions of a given topic. */
export function byTopic(topic) {
  return QUESTIONS.filter((q) => q.topic === topic);
}

/** Fisher–Yates shuffle (returns a new array). */
export function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ------------------------------------------------------------------
 * No-repeat tracking for one playthrough.
 * `_asked` holds question objects already shown this round (object identity is
 * stable because QUESTIONS is a module-level constant).
 * ------------------------------------------------------------------ */
const _askedSession = new Set();
const _askedPersistent = loadPersistentAsked();

function qKey(q) {
  return q?.baseId || q?.id;
}

/** Begin a new playthrough: forget which questions were already asked. */
export function resetAsked(options = {}) {
  const { keepPersistent = true } = options;
  _askedSession.clear();
  if (!keepPersistent) {
    _askedPersistent.clear();
    savePersistentAsked(_askedPersistent);
  }
}

/** Mark a question as shown so it won't be asked again this round. */
export function markAsked(q) {
  if (!q) return;
  const k = qKey(q);
  if (!k) return;
  _askedSession.add(k);
  _askedPersistent.add(k);
  savePersistentAsked(_askedPersistent);
}

/**
 * Build a randomized deck, preferring questions not yet asked this round and
 * drawing only from the given topics (so each department asks its own field).
 * Already-asked questions are reused only as a fallback, so the game never
 * softlocks.
 *
 * @param {string[]} topics - which topics to draw from
 * @param {number} count - how many questions
 * @param {number} [maxDifficulty=3] - cap difficulty (levels rise over the game)
 */
export function buildDeck(topics, count, maxDifficulty = 3) {
  const inScope = QUESTIONS.filter(
    (q) => topics.includes(q.topic) && q.difficulty <= maxDifficulty
  );
  const unseen = inScope.filter((q) => {
    const k = qKey(q);
    return !_askedSession.has(k) && !_askedPersistent.has(k);
  });
  const fresh = shuffle(unseen);
  const deck = fresh.slice(0, count);

  // If a topic/difficulty pool is exhausted globally, allow not-yet-this-run
  // questions so the game stays playable in very late rounds.
  if (deck.length < count) {
    const lateRoundPool = shuffle(inScope.filter((q) => !_askedSession.has(qKey(q))));
    for (const q of lateRoundPool) {
      if (deck.length >= count) break;
      if (!deck.includes(q)) deck.push(q);
    }
  }

  if (deck.length < count) {
    const reused = shuffle(inScope.filter((q) => _askedSession.has(qKey(q))));
    for (const q of reused) {
      if (deck.length >= count) break;
      deck.push(q);
    }
  }
  return deck;
}
