import * as THREE from 'three';
import { Input } from './Input.js';
import { AssetManager } from './AssetManager.js';
import { World } from '../world/World.js';
import { Player } from '../entities/Player.js';
import { NPC } from '../entities/NPC.js';
import { Item } from '../entities/Item.js';
import { QuestSystem } from '../systems/Quests.js';
import { Inventory } from '../systems/Inventory.js';
import { AudioSystem } from '../systems/Audio.js';
import { QuizSystem } from '../systems/Quiz.js';
import { HUD } from '../ui/HUD.js';
import { Dialog } from '../ui/Dialog.js';
import { Shop } from '../ui/Shop.js';
import { QuestLog } from '../ui/QuestLog.js';
import { Elevator } from '../ui/Elevator.js';
import { PhoneCall } from '../ui/PhoneCall.js';
import { PingPong } from '../ui/PingPong.js';
import { SimonSays } from '../ui/SimonSays.js';
import { Story } from '../systems/Story.js';
import { NPCS } from '../data/npcs.js';
import { questById } from '../data/quests.js';
import { buildDeck, markAsked, resetAsked } from '../data/questions.js';
import {
  OUTSIDE_SPAWN, ENTRANCE, BUILDING_ENTRY_SPAWN, ELEVATOR, ELEVATOR_EXIT, floorById
} from '../data/rooms.js';

const STATE = {
  LOADING: 'loading',
  TITLE: 'title',
  NAME: 'name',
  PHONE: 'phone',
  EXPLORE: 'explore',
  DIALOG: 'dialog',
  QUIZ: 'quiz',
  SHOP: 'shop',
  ELEVATOR: 'elevator',
  MINIGAME: 'minigame',
  JENS: 'jens',
  TRAVEL: 'travel',
  QUESTLOG: 'questlog',
  PAUSE: 'pause',
  END: 'end'
};

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.state = STATE.LOADING;

    // stats
    this.maxFocus = 100;
    this.focus = 100;
    this.timeBonus = 0;
    this.timeBudget = 600; // seconds of in-fiction afternoon
    this.elapsed = 0;

    // camera orbit
    this.camYaw = Math.PI;
    this.camPitch = 0.42;
    this.camDist = 7.5;
    this.sensitivity = 0.0024;

    // campaign
    this.playerName = 'Azubi';
    this.story = new Story();
    this.unlockedFloors = new Set(['eg']);
    this._enteredBuilding = false;
    this.highscoreKey = 'starfigame_highscores_v1';
    this.progressKey = 'starfigame_progress_v1';
    this.secretTextBuffer = '';
    this.secretInputHistory = [];
    this.unlockedSecrets = new Set();
    this.retroSpots = this._buildRetroSpots();
    this.secretLog = new Map();
    this.progress = this._loadProgress();
    this.round = this.progress.round;
    this.jensTimer = 0;
    this.nextJensIn = this._randJensInterval();
    this.jensBusy = false;
    this.dialogVariantCount = 10;
    this.simonRewardClaimed = false;

    this._tmpTarget = new THREE.Vector3();
  }

  // ============================================================ boot
  async boot() {
    this._initRenderer();
    this.input = new Input(this.canvas);
    this.audio = new AudioSystem();
    this.assets = new AssetManager();

    // Optional branded assets — safe if the files don't exist yet.
    this.assets.queueTexture('logo', '/assets/images/logo.png');
    this.assets.queueTexture('floor_bodenbelag', '/assets/images/Bodenbelag.png');

    this.world = new World(this.scene, this.assets);

    // loading bar
    const bar = document.getElementById('loading-bar');
    this.assets.onProgress = (r) => (bar.style.width = Math.round(r * 100) + '%');
    await this.assets.load();

    this.world.build();
    this.player = new Player(this.scene, this.world, OUTSIDE_SPAWN);
    this._spawnEntities();
    this._initSystems();
    this._initUIEvents();

    this.clock = new THREE.Clock();
    this.state = STATE.TITLE;
    this._enableStart();
    this._loop();
  }

  _initRenderer() {
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      60, window.innerWidth / window.innerHeight, 0.1, 200
    );

    window.addEventListener('resize', () => this._onResize());
  }

  _onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  // ============================================================ spawn
  _spawnEntities() {
    // NPCs — each lives on a floor; only the current floor's NPCs are shown.
    this.npcs = NPCS.map((data) => new NPC(this.scene, data));

    // Loot, tagged per floor (only current-floor items are active/visible).
    const mk = (type, pos, floor, value) => {
      const it = new Item(this.scene, { type, pos, value });
      it.floor = floor;
      return it;
    };
    this.items = [
      mk('coin', [-12, 4], 'eg', 5),
      mk('coin', [6, 9], 'eg', 5),
      mk('coin', [11, 4], 'og3', 5),
      mk('coffee', [-12, -4], 'og3'),
      mk('coin', [8, -5], 'og2', 5),
      mk('coffee', [9, 10], 'og2'),
      mk('coin', [-6, 11], 'og4', 5),
      mk('coffee', [-12, 6], 'og4')
    ];

    // Cafeteria upgrade terminal (Star Café on the 6th floor).
    this.shopPoint = { x: 4.8, z: -8, r: 2.8, floor: 'og6' };
    this.pingPongPoint = { x: 11, z: -8, r: 2.8, floor: 'og7' };

    this._applyFloorVisibility('outside');
  }

  _initSystems() {
    this.inventory = new Inventory();
    this.quests = new QuestSystem();
    this.hud = new HUD();
    this.dialog = new Dialog(this.audio);
    this.shop = new Shop(this.audio);
    this.questLog = new QuestLog();
    this.quiz = new QuizSystem(this.audio);
    this.elevator = new Elevator(this.audio);
    this.phone = new PhoneCall(this.audio);
    this.pingPong = new PingPong(this.audio);
    this.simonSays = new SimonSays(this.audio);

    this.inventory.onChange = () => this._syncHud();
    this.quests.onChange = () => {
      if (this.questLog.open) this.questLog.show(this.quests.list());
      this._updateNpcMarkers();
    };
    this.quests.onComplete = (q) => {
      this.inventory.addCoins(q.reward);
      this.hud.toast(`✅ Gelöst: <strong>${q.title}</strong> (+${q.reward} 🪙)`, 'good');
    };

    this.shop.onClose = () => this._setState(STATE.EXPLORE);
    this.elevator.onClose = () => this._setState(STATE.EXPLORE);
    this._syncHud();
    this._syncObjective();
    this._updateNpcMarkers();
  }

  _initUIEvents() {
    document.getElementById('start-button').addEventListener('click', () => this._startGame());
    document.getElementById('resume-button').addEventListener('click', () => this._resume());
    document.getElementById('end-restart').addEventListener('click', () => location.reload());

    // name entry
    const nameInput = document.getElementById('name-input');
    const submit = () => this._submitName();
    document.getElementById('name-submit').addEventListener('click', submit);
    nameInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') submit();
    });

    // canvas click: pointer-lock for mouse-look + unlock the audio context
    this.canvas.addEventListener('click', () => {
      this.audio.start(this.state === STATE.QUIZ ? 'battle' : 'explore');
      if (this.state === STATE.EXPLORE) this.input.requestPointerLock();
    });
  }

  _enableStart() {
    const btn = document.getElementById('start-button');
    btn.disabled = false;
    btn.textContent = '▶  Schicht beginnen';
  }

  // ============================================================ intro flow
  _startGame() {
    this.audio.init();
    this.audio.playSfx('start');
    document.getElementById('loading-screen').classList.add('hidden');
    document.getElementById('name-screen').classList.remove('hidden');
    this._setState(STATE.NAME);
    setTimeout(() => document.getElementById('name-input').focus(), 50);
  }

  _submitName() {
    const raw = document.getElementById('name-input').value.trim();
    this.playerName = raw ? raw.slice(0, 20) : 'Azubi';
    document.getElementById('name-screen').classList.add('hidden');
    this._startPhone();
  }

  _startPhone() {
    this._setState(STATE.PHONE);
    const n = this.playerName;
    this.phone.start(
      {
        caller: 'Maik (Geschäftsführung)',
        lines: [
          `${n}, hier ist Maik! Gut, dass ich dich erreiche. 📞`,
          'Mir ist heute früh ein Monster ins System gekrochen – kurz VOR dem großen Release, kannst du dir das vorstellen? Mehrere Teams sind lahmgelegt, das ist eine Katastrophe.',
          `Ich brauch dich heute als unseren Spezialist für Abteilungs-übergreifende Probleme. Komm sofort ins Gebäude, das Empfang-Team erwartet dich bereits.`,
          'Die Teams warten auf deinen Input – jede Etage ein anderes Problem, und es wird immer kniffliger. Zeig mir, dass der FIAE-Kurs bei dir angekommen ist. Danke dir! 💪'
        ]
      },
      () => this._beginShift()
    );
  }

  _beginShift() {
    resetAsked({ keepPersistent: true });
    this.jensTimer = 0;
    this.nextJensIn = this._randJensInterval();
    this.jensBusy = false;
    this.simonRewardClaimed = false;
    this.hud.show();
    this.audio.start('explore');
    this.world.setArea('outside');
    this.player.setPosition(OUTSIDE_SPAWN.x, OUTSIDE_SPAWN.z);
    this.player.heading = OUTSIDE_SPAWN.heading;
    this.camYaw = OUTSIDE_SPAWN.heading;
    this._applyFloorVisibility('outside');
    this._setFloorIndicator('outside');
    this._syncObjective();
    this._setState(STATE.EXPLORE);
    this.input.requestPointerLock();
    this.hud.toast(`Willkommen, <strong>${this.playerName}</strong>! Spielrunde ${this.round} · Klick ins Bild für die Maus · <kbd>E</kbd> interagieren`, '');
  }

  // ============================================================ state
  _setState(s) {
    this.state = s;
    const lockStates = [STATE.EXPLORE];
    if (!lockStates.includes(s)) this.input.exitPointerLock();
  }

  _resume() {
    document.getElementById('pause-screen').classList.add('hidden');
    this._setState(STATE.EXPLORE);
  }

  // ============================================================ loop
  _loop() {
    requestAnimationFrame(() => this._loop());
    const dt = Math.min(this.clock.getDelta(), 0.05);
    this._update(dt);
    this.renderer.render(this.scene, this.camera);
    this.input.endFrame();
  }

  _update(dt) {
    // global keys
    if (this.input.wasPressed('KeyM')) {
      const muted = this.audio.toggleMute();
      this.hud.toast(muted ? '🔇 Ton aus' : '🔊 Ton an');
    }

    switch (this.state) {
      case STATE.TITLE:
        this._updateTitle(dt);
        break;
      case STATE.EXPLORE:
        this._updateExplore(dt);
        break;
      case STATE.DIALOG:
        if (this.input.anyPressed('Space', 'KeyE', 'Enter')) this.dialog.advance();
        break;
      case STATE.QUESTLOG:
        if (this.input.anyPressed('Tab', 'Escape')) {
          this.questLog.close();
          this._setState(STATE.EXPLORE);
        }
        break;
      case STATE.SHOP:
        if (this.input.wasPressed('Escape')) this.shop.close();
        break;
      case STATE.ELEVATOR:
        if (this.input.wasPressed('Escape')) this.elevator.close();
        break;
      case STATE.MINIGAME:
        if (this.input.wasPressed('Escape')) {
          this.pingPong.close();
          this.simonSays.close();
        }
        break;
      case STATE.PAUSE:
        if (this.input.wasPressed('Escape')) this._resume();
        break;
      case STATE.JENS:
        break;
      default:
        break;
    }
  }

  _updateTitle(dt) {
    this.camYaw += dt * 0.15;
    this._tmpTarget.set(0, 1.4, 8);
    const horiz = Math.cos(this.camPitch) * 14;
    this.camera.position.set(
      this._tmpTarget.x - Math.sin(this.camYaw) * horiz,
      this._tmpTarget.y + Math.sin(this.camPitch) * 14,
      this._tmpTarget.z + Math.cos(this.camYaw) * horiz
    );
    this.camera.lookAt(this._tmpTarget);
    this.player.parts && (this.player.walkPhase += dt);
  }

  _updateExplore(dt) {
    this._checkSecrets();
    this._updateJens(dt);

    // pause
    if (this.input.wasPressed('Escape')) return this._pause();
    // quest log
    if (this.input.wasPressed('Tab')) {
      this.questLog.show(this.quests.list());
      return this._setState(STATE.QUESTLOG);
    }

    // mouse-look
    if (this.input.pointerLocked) {
      const { dx, dy } = this.input.consumeMouse();
      this.camYaw += dx * this.sensitivity;
      this.camPitch = clamp(this.camPitch - dy * this.sensitivity, 0.05, 1.15);
    }

    // player + entities
    this.player.update(dt, this.input, this.camYaw);
    for (const npc of this.npcs) npc.update(dt, this.player.position);
    for (const item of this.items) item.update(dt);

    this._updateCamera();
    this._handlePickups();
    this._handleInteraction();

    // afternoon clock
    this.elapsed = Math.min(this.timeBudget, this.elapsed + dt);
    this.hud.setClock(this._clockString());
  }

  _updateCamera() {
    const p = this.player.position;
    this._tmpTarget.set(p.x, p.y + 1.6, p.z);
    const horiz = Math.cos(this.camPitch) * this.camDist;
    let cx = this._tmpTarget.x - Math.sin(this.camYaw) * horiz;
    let cz = this._tmpTarget.z + Math.cos(this.camYaw) * horiz;
    const cy = this._tmpTarget.y + Math.sin(this.camPitch) * this.camDist;
    // keep camera from clipping through outer walls
    const resolved = this.world.resolveCollision(cx, cz, 0.4);
    cx = resolved.x;
    cz = resolved.z;
    this.camera.position.set(cx, cy, cz);
    this.camera.lookAt(this._tmpTarget);
  }

  // ---------------------------------------------------------- interaction
  _handlePickups() {
    const area = this.world.activeArea;
    for (const item of this.items) {
      if (item.collected || item.floor !== area) continue;
      if (item.distanceTo(this.player.position) <= item.contactRadius) {
        item.collect();
        if (item.type === 'coin') {
          this.inventory.addCoins(item.value);
          this.audio.playSfx('coin');
          this.hud.toast(`🪙 +${item.value} Jira-Münzen`, 'coin');
        } else {
          this.inventory.addCoffee(1);
          this.player.grantSprintBoost(8);
          this.audio.playSfx('pickup');
          this.hud.toast('☕ Kaffeetasse eingesammelt – Sprint-Boost!', 'good');
        }
      }
    }
  }

  _handleInteraction() {
    const area = this.world.activeArea;
    const p = this.player.position;

    // Outside: walking into the entrance enters the building.
    if (area === 'outside') {
      const ed = Math.hypot(ENTRANCE.x - p.x, ENTRANCE.z - p.z);
      if (ed < ENTRANCE.r || (Math.abs(p.x) < 2.4 && p.z < 3.4)) {
        this.hud.hidePrompt();
        return this._enterBuilding();
      }
      this.hud.showPrompt('Geh zum Eingang ▶');
      return;
    }

    // Indoors: nearest of (NPC on this floor) / elevator / shop.
    let near = null;
    let nearDist = Infinity;
    let kind = null;

    for (const npc of this.npcs) {
      if (npc.data.floor !== area) continue;
      const d = npc.distanceTo(p);
      if (d < npc.radius && d < nearDist) {
        near = npc;
        nearDist = d;
        kind = 'talk';
      }
    }

    const ld = Math.hypot(ELEVATOR.x - p.x, ELEVATOR.z - p.z);
    if (ld < ELEVATOR.r && ld < nearDist) {
      near = 'elevator';
      nearDist = ld;
      kind = 'elevator';
    }

    if (this.shopPoint.floor === area) {
      const sd = Math.hypot(this.shopPoint.x - p.x, this.shopPoint.z - p.z);
      if (sd < this.shopPoint.r && sd < nearDist) {
        near = this.shopPoint;
        nearDist = sd;
        kind = 'shop';
      }
    }

    if (this.pingPongPoint.floor === area) {
      const pd = Math.hypot(this.pingPongPoint.x - p.x, this.pingPongPoint.z - p.z);
      if (pd < this.pingPongPoint.r && pd < nearDist) {
        near = this.pingPongPoint;
        nearDist = pd;
        kind = 'pingpong';
      }
    }

    for (const spot of this.retroSpots) {
      if (spot.floor !== area || this.secretLog.has(spot.id)) continue;
      const d = Math.hypot(spot.x - p.x, spot.z - p.z);
      if (d < spot.r && d < nearDist) {
        near = spot;
        nearDist = d;
        kind = 'inspect';
      }
    }

    if (near) {
      const label = kind === 'talk' ? `Sprechen mit ${near.data.name}`
        : kind === 'elevator' ? 'Fahrstuhl rufen'
        : kind === 'shop' ? 'Cafeteria-Upgrades öffnen'
        : kind === 'pingpong' ? 'Tischtennis spielen'
        : near.title;
      this.hud.showPrompt(label);
      if (this.input.wasPressed('KeyE')) {
        if (kind === 'talk') this._talk(near);
        else if (kind === 'elevator') this._openElevator();
        else if (kind === 'shop') this._openShop();
        else if (kind === 'pingpong') this._openPingPong();
        else this._inspectRetroSpot(near);
      }
    } else {
      this.hud.hidePrompt();
    }
  }

  _buildRetroSpots() {
    return [
      {
        id: 'spot_og2_arcade',
        floor: 'og2',
        x: 15,
        z: -13,
        r: 1.8,
        title: 'Retro-Poster lesen',
        reward: 4,
        label: 'Open Space Poster',
        message: 'Running Gag gefunden: "Die Torte ist vielleicht doch nur ein Frontend-Mythos."'
      },
      {
        id: 'spot_og3_terminal',
        floor: 'og3',
        x: -16,
        z: 14,
        r: 1.8,
        reward: 4,
        title: 'Terminal prüfen',
        label: 'Digital Terminal',
        message: 'Running Gag gefunden: "Would you kindly den Build-Status auf grün setzen?"'
      },
      {
        id: 'spot_og4_note',
        floor: 'og4',
        x: 15,
        z: 14,
        r: 1.8,
        reward: 4,
        title: 'Sticky-Note lesen',
        label: 'Design Lab Notiz',
        message: 'Running Gag gefunden: "Ich war auch mal Abenteuer-Designer, bis ein Bug mein Knie traf."'
      },
      {
        id: 'spot_og5_console',
        floor: 'og5',
        x: -16,
        z: -13,
        r: 1.8,
        reward: 4,
        title: 'Dev-Konsole lesen',
        label: 'App Factory Konsole',
        message: 'Running Gag gefunden: "Type mobile ist sehr effektiv gegen Legacy-Code."'
      },
      {
        id: 'spot_og6_manual',
        floor: 'og6',
        x: 16,
        z: 0,
        r: 1.8,
        reward: 4,
        title: 'Wartungshandbuch öffnen',
        label: 'Facility Handbuch',
        message: 'Running Gag gefunden: "Es ist gefährlich, ohne Kaffee allein loszuziehen."'
      },
      {
        id: 'spot_og7_board',
        floor: 'og7',
        x: 0,
        z: 15,
        r: 1.8,
        reward: 4,
        title: 'Culture-Board lesen',
        label: 'People Board',
        message: 'Running Gag gefunden: "YOU DIED" wurde ersetzt durch "Nimm dir Zeit zum Lernen".'
      },
      {
        id: 'spot_og8_alert',
        floor: 'og8',
        x: -16,
        z: 14,
        r: 1.8,
        reward: 6,
        title: 'Security-Hinweis prüfen',
        label: 'Serverraum Alert',
        message: 'Running Gag gefunden: "!" - der Security-Moment kam wieder zu nah.'
      }
    ];
  }

  _inspectRetroSpot(spot) {
    if (this.secretLog.has(spot.id)) return;
    this.secretLog.set(spot.id, spot.label);
    if (spot.reward > 0) {
      this.inventory.addCoins(spot.reward);
      this._syncHud();
      this.audio.playSfx('coin');
    }
    this.hud.toast(`🕹️ ${spot.message}${spot.reward > 0 ? ` (+${spot.reward} 🪙)` : ''}`, 'coin');
  }

  // ============================================================ campaign
  _applyFloorVisibility(area) {
    for (const npc of this.npcs) npc.model.visible = npc.data.floor === area;
    for (const item of this.items) {
      if (item.group) item.group.visible = !item.collected && item.floor === area;
    }
  }

  _setFloorIndicator(area) {
    const el = document.getElementById('floor-indicator');
    if (!el) return;
    if (area === 'outside') { el.textContent = '📍 Draußen'; return; }
    const f = floorById(area);
    el.textContent = '📍 ' + (f ? f.label : area);
  }

  _syncObjective() {
    this.hud.setObjective(this.story.objective());
  }

  /** Replace {name} tokens in dialog lines with the player's name. */
  _lines(arr) {
    return (arr || []).map((s) => s.replace(/\{name\}/g, this.playerName));
  }

  _dialogVariant(lines, key) {
    const base = this._lines(lines);
    if (!base.length) return base;
    const profiles = [
      [],
      [[/\bGut, dass\b/g, 'Super, dass'], [/\blass uns\b/g, 'wir sollten']],
      [[/\bGerade\b/g, 'Aktuell'], [/\blos geht’s\b/g, 'legen wir los']],
      [[/\bkurz vorm\b/g, 'unmittelbar vor dem'], [/\bwackelt\b/g, 'ist instabil']],
      [[/\bHilfe,\b/g, 'Bitte hilf mir,'], [/\bzusammen\b/g, 'gemeinsam']],
      [[/\bsauber\b/g, 'stabil'], [/\bfixen\b/g, 'lösen']],
      [[/\bBug\b/g, 'Fehler'], [/\bRelease\b/g, 'Go-Live']],
      [[/\bwieder\b/g, 'erneut'], [/\bstabil\b/g, 'zuverlässig']],
      [[/\bpacken wir’s an\b/g, 'gehen wir es direkt an'], [/\bheute\b/g, 'diesmal']],
      [[/\bdu schaffst das\b/gi, 'du kriegst das hin'], [/\bsaubere\b/g, 'gute']]
    ];

    // Randomized phrasing, but no unrelated extra remarks before/after lines.
    const idx = Math.abs(hashCode(`${key}|${this.round}|${Math.random()}`)) % this.dialogVariantCount;
    const rules = profiles[idx] || [];
    return base.map((line) => {
      let out = line;
      for (const [pattern, repl] of rules) out = out.replace(pattern, repl);
      return out;
    });
  }

  _enterBuilding() {
    this.unlockedFloors.add('eg');
    this.unlockedFloors.add('og1');
    this.story.advanceTo('lift1');
    this._travelTo('eg', () => {
      this.hud.toast('Du bist im Foyer. Nimm den Fahrstuhl (E) ins 1. OG.', '');
    }, BUILDING_ENTRY_SPAWN);
  }

  _openElevator() {
    this.hud.hidePrompt();
    this._setState(STATE.ELEVATOR);
    this.elevator.show(this.world.activeArea, this.unlockedFloors, (id) => this._travelTo(id));
  }

  /** Fade out, switch floor, drop the player at the elevator, fade back in. */
  _travelTo(area, after, spawnOverride = null) {
    this._setState(STATE.TRAVEL);
    this.input.exitPointerLock();
    const fade = document.getElementById('travel-fade');
    fade.classList.add('on');
    this.audio.playSfx('select');
    setTimeout(() => {
      this.world.setArea(area);
      const spawn = spawnOverride || this._pickTravelSpawn();
      this.player.setPosition(spawn.x, spawn.z);
      const heading = spawn.heading ?? ELEVATOR_EXIT.heading;
      this.player.heading = heading;
      this.camYaw = heading;
      this._applyFloorVisibility(area);
      this._setFloorIndicator(area);
      this._onArrive(area);
      this._syncObjective();
      fade.classList.remove('on');
      this._setState(STATE.EXPLORE);
      this.input.requestPointerLock();
      if (after) after();
    }, 420);
  }

  /** Choose an elevator exit spot where the camera is less likely to spawn inside geometry. */
  _pickTravelSpawn() {
    const baseX = ELEVATOR_EXIT.x;
    const baseZ = ELEVATOR_EXIT.z;
    const candidates = [
      [0, 0],
      [0, -1.2],
      [0, -2.2],
      [-1.3, -1.1],
      [1.3, -1.1],
      [-2.3, -1.8],
      [2.3, -1.8]
    ];

    let best = { x: baseX, z: baseZ, score: Number.POSITIVE_INFINITY };
    for (const [dx, dz] of candidates) {
      const pos = this.world.resolveCollision(baseX + dx, baseZ + dz, this.player.radius);
      const score = this._cameraSpawnPenalty(pos.x, pos.z);
      if (score < best.score) best = { x: pos.x, z: pos.z, score };
    }
    return best;
  }

  _cameraSpawnPenalty(px, pz) {
    const horiz = Math.cos(this.camPitch) * this.camDist;
    const desiredCamX = px - Math.sin(ELEVATOR_EXIT.heading) * horiz;
    const desiredCamZ = pz + Math.cos(ELEVATOR_EXIT.heading) * horiz;
    const resolvedCam = this.world.resolveCollision(desiredCamX, desiredCamZ, 0.4);
    const cameraPush = Math.hypot(resolvedCam.x - desiredCamX, resolvedCam.z - desiredCamZ);
    const elevatorDist = Math.hypot(ELEVATOR.x - px, ELEVATOR.z - pz);
    // Prefer free camera space first; then keep spawn reasonably near the elevator.
    return cameraPush * 100 + Math.abs(elevatorDist - 5.5);
  }

  _onArrive(area) {
    // Arriving on the expected floor advances the story to that floor's task.
    const map = {
      og1: ['lift1', 'jessi'],
      og2: ['lift2', 'melina'],
      og3: ['lift3', 'sven'],
      og4: ['lift4', 'aylin'],
      og5: ['lift5', 'emre'],
      og6: ['lift6', 'frank'],
      og7: ['lift7', 'petra'],
      og8: ['lift8', 'viktor']
    };
    const step = map[area];
    if (step && this.story.is(step[0])) this.story.advanceTo(step[1]);
  }

  // ============================================================ dialog
  _talk(npc) {
    this.hud.hidePrompt();
    this._setState(STATE.DIALOG);
    const data = npc.data;
    const qid = data.quest;
    const status = qid ? this.quests.status(qid) : null;

    // Already solved → friendly closing line.
    if (status === 'done') {
      this.dialog.start(data, this._dialogVariant(data.lines.done, `${data.id}:done`), () => this._setState(STATE.EXPLORE));
      return;
    }

    if (data.id === 'sam' && status !== 'done') {
      this.quests.offer(qid);
      this.dialog.start(data, this._dialogVariant(data.lines.intro, `${data.id}:intro`), () => {
        this._openSimonSays({
          reward: true,
          onWin: () => {
            if (qid) this.quests.complete(qid);
            this.unlockedFloors.add('og2');
            this.story.advanceTo('lift2');
            this._setState(STATE.DIALOG);
            this.dialog.start(data, this._dialogVariant(data.lines.done, `${data.id}:done`), () => {
              this._syncObjective();
              this._setState(STATE.EXPLORE);
              this.input.requestPointerLock();
            });
          },
          onFailClose: () => {
            this.hud.toast('Jessi: Noch nicht geschafft. Versuch Simon Says bitte nochmal.', 'bad');
            this._setState(STATE.EXPLORE);
            this.input.requestPointerLock();
          }
        });
      });
      return;
    }

    // Briefing colleague without challenge: just conversation and completion.
    if (!data.challenge) {
      this.dialog.start(data, this._dialogVariant(data.lines.intro, `${data.id}:intro`), () => {
        if (qid) this.quests.complete(qid);
        this._syncObjective();
        this._setState(STATE.EXPLORE);
      });
      return;
    }

    const ch = data.challenge;

    // Gated challenge (boss): require the other teams to be stable first.
    if (ch.requires && !ch.requires.every((id) => this.quests.isDone(id))) {
      this.dialog.start(data, this._dialogVariant(data.lines.locked || data.lines.intro, `${data.id}:locked`), () =>
        this._setState(STATE.EXPLORE)
      );
      return;
    }

    // Explain the problem, then start the quiz directly as the way to solve it.
    this.quests.offer(qid); // make sure it's active in the log
    this.dialog.start(data, this._dialogVariant(data.lines.intro, `${data.id}:intro`), () => this._startChallenge(npc));
  }

  // ============================================================ shop
  _openShop() {
    this.hud.hidePrompt();
    this._setState(STATE.SHOP);
    this.shop.show(this.inventory, (item) => this._buy(item));
  }

  _openPingPong() {
    this.hud.hidePrompt();
    this._setState(STATE.MINIGAME);
    this.pingPong.show({
      onClose: () => {
        this._setState(STATE.EXPLORE);
        this.input.requestPointerLock();
      }
    });
  }

  _openSimonSays({ onWin, onClose, onFailClose, reward = true } = {}) {
    this.hud.hidePrompt();
    this._setState(STATE.MINIGAME);
    let solved = false;
    this.simonSays.show({
      onWin: () => {
        solved = true;
        if (reward && !this.simonRewardClaimed) {
          this.simonRewardClaimed = true;
          this.inventory.addCoins(12);
          this._syncHud();
          this.hud.toast('🎨 Simon Says geschafft! +12 🪙', 'good');
        }
        if (onWin) onWin();
      },
      onClose: () => {
        if (solved) {
          if (onClose) onClose();
          else {
            this._setState(STATE.EXPLORE);
            this.input.requestPointerLock();
          }
          return;
        }

        if (onFailClose) onFailClose();
        else {
          this._setState(STATE.EXPLORE);
          this.input.requestPointerLock();
        }
      }
    });
  }

  _buy(item) {
    if (this.inventory.ownsUpgrade(item.id)) return false;
    if (!this.inventory.spendCoins(item.cost)) {
      this.hud.toast('Nicht genug Jira-Münzen 🪙', 'bad');
      return false;
    }
    this.inventory.addUpgrade(item.id);
    this._applyUpgrade(item.effect);
    this.hud.toast(`Gekauft: <strong>${item.name}</strong>`, 'good');
    return true;
  }

  _applyUpgrade(effect) {
    switch (effect) {
      case 'speed':
        this.player.speedMul *= 1.15;
        break;
      case 'maxhp':
        this.maxFocus += 30;
        this.focus += 30;
        this._syncHud();
        break;
      case 'time':
        this.timeBonus += 4;
        break;
      case 'reveal':
        this._revealAll();
        break;
    }
  }

  /** Clean-Code-Brille: render remaining loot through walls. */
  _revealAll() {
    const reveal = (mesh) => {
      mesh.traverse((o) => {
        if (o.material) {
          o.material.depthTest = false;
          o.renderOrder = 999;
        }
      });
    };
    this.items.forEach((i) => !i.collected && reveal(i.group));
  }

  // ============================================================ combat
  _startChallenge(npc) {
    const ch = npc.data.challenge;
    this._setState(STATE.QUIZ);
    this.hud.hidePrompt();
    this.activeNpc = npc;
    const topics = ch.topics || ['frontend'];
    const roundBoost = Math.max(0, this.round - 1);
    const maxDifficulty = Math.min(3, (ch.maxDifficulty ?? 2) + Math.floor(roundBoost / 2));
    const hp = (ch.hp || 3) + Math.floor(roundBoost / 2);
    const timePerQuestion = Math.max(7, (ch.time || 12) - Math.floor(roundBoost / 3));
    const playerDamage = (ch.damage || 16) + Math.floor(roundBoost / 4);
    this.quiz.start({
      topics,
      enemyName: ch.problem,
      emoji: ch.emoji || (ch.isBoss ? '🐉' : '🐛'),
      enemyHP: hp,
      isBoss: !!ch.isBoss,
      maxDifficulty,
      timePerQuestion,
      playerDamage,
      hooks: {
        getHP: () => this.focus,
        getMaxHP: () => this.maxFocus,
        getTimeBonus: () => this.timeBonus,
        awardCoins: (n) => {
          if (!n) return;
          this.inventory.addCoins(n);
          this._syncHud();
        },
        damage: (n) => this._damageFocus(n),
        onWin: () => this._onChallengeWin(npc),
        onLose: () => this._onChallengeLose(npc)
      }
    });
  }

  _damageFocus(n) {
    this.focus = Math.max(0, this.focus - n);
    this._syncHud();
    this.hud.damageFlash();
    this.audio.playSfx('hit');
  }

  _onChallengeWin(npc) {
    this.audio.start('explore');
    const data = npc.data;
    const ch = data.challenge;

    // Completing the quest fires its reward + toast (see _initSystems).
    this.quests.complete(data.quest);

    if (ch.isBoss) {
      this.focus = this.maxFocus;
      this._syncHud();
      this.story.advanceTo('done');
      return this._win();
    }

    // advance the guided story + unlock the next floor where needed
    if (data.id === 'lena') this.story.advanceTo('mehmet');
    else if (data.id === 'mehmet') { this.story.advanceTo('lift3'); this.unlockedFloors.add('og3'); }
    else if (data.id === 'sven') { this.story.advanceTo('lift4'); this.unlockedFloors.add('og4'); }
    else if (data.id === 'aylin') { this.story.advanceTo('lift5'); this.unlockedFloors.add('og5'); }
    else if (data.id === 'emre') this.story.advanceTo('britta');
    else if (data.id === 'britta') { this.story.advanceTo('lift6'); this.unlockedFloors.add('og6'); }
    else if (data.id === 'frank') { this.story.advanceTo('lift7'); this.unlockedFloors.add('og7'); }
    else if (data.id === 'petra') { this.story.advanceTo('lift8'); this.unlockedFloors.add('og8'); }
    else if (data.id === 'jonas') this.story.advanceTo('kristof');

    // small heal, then the colleague's closing line
    this.focus = Math.min(this.maxFocus, this.focus + 20);
    this._syncHud();
    this._setState(STATE.DIALOG);
    this.dialog.start(data, this._dialogVariant(data.lines.done, `${data.id}:done`), () => {
      this._syncObjective();
      this._setState(STATE.EXPLORE);
    });
  }

  _onChallengeLose(npc) {
    this.audio.start('explore');
    this._setState(STATE.EXPLORE);
    // forgiving: restore focus; the quest stays active so the player can simply
    // talk to the colleague again to retry.
    this.focus = this.maxFocus;
    this._syncHud();
    this.hud.toast(
      `☕ Fokus aufgebraucht! Sprich ${npc.data.name.split(' ')[0]} erneut an, um es nochmal zu versuchen.`,
      'bad'
    );
  }

  // ============================================================ end states
  _pause() {
    this._setState(STATE.PAUSE);
    document.getElementById('pause-screen').classList.remove('hidden');
  }

  _win() {
    this._setState(STATE.END);
    this.hud.hide();
    this.audio.stopMusic();
    this.audio.playSfx('win');
    const entry = this._buildScoreEntry();
    const list = this._saveHighscore(entry);
    this._renderHighscores(list, entry.id);
    this._renderSecretStats();
    this._advanceRoundProgress();
    document.getElementById('end-title').textContent = 'RELEASE GERETTET';
    document.getElementById('end-title').setAttribute('data-text', 'RELEASE GERETTET');
    document.getElementById('end-text').innerHTML =
      `Stark gemacht, <strong>${this.playerName}</strong>! Der Master-Commit ist durch, die Pipeline leuchtet grün ` +
      `und der Ur-Bug ist Geschichte. Du hast <strong>${this.inventory.coins} Jira-Münzen</strong> gesammelt, ` +
      `<strong>${entry.score} Punkte</strong> erzielt und dich von Level 1 bis zum Boss durchgekämpft. ` +
      `Spielrunde <strong>${this.round}</strong> abgeschlossen. Nächste Runde wird härter. 🍻`;
    document.getElementById('end-screen').classList.remove('hidden');
  }

  _buildScoreEntry() {
    const remaining = Math.max(0, Math.floor(this.timeBudget - this.elapsed));
    const score = Math.max(0, Math.round(this.inventory.coins * 12 + this.focus * 4 + remaining));
    return {
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      name: this.playerName,
      score,
      coins: this.inventory.coins,
      focus: this.focus,
      remaining,
      createdAt: Date.now()
    };
  }

  _saveHighscore(entry) {
    let list = [];
    try {
      const raw = localStorage.getItem(this.highscoreKey);
      const parsed = raw ? JSON.parse(raw) : [];
      if (Array.isArray(parsed)) list = parsed;
    } catch {
      list = [];
    }

    list.push(entry);
    list = list
      .filter((x) => x && typeof x.score === 'number' && typeof x.name === 'string')
      .sort((a, b) => (b.score - a.score) || ((b.createdAt || 0) - (a.createdAt || 0)))
      .slice(0, 10);

    try {
      localStorage.setItem(this.highscoreKey, JSON.stringify(list));
    } catch {
      // ignore storage issues (private mode / quota)
    }
    return list;
  }

  _renderHighscores(list, currentId) {
    const root = document.getElementById('highscore-list');
    if (!root) return;
    root.innerHTML = '';
    if (!list.length) {
      const li = document.createElement('li');
      li.className = 'highscore-empty';
      li.textContent = 'Noch keine Einträge vorhanden.';
      root.appendChild(li);
      return;
    }

    list.forEach((entry, idx) => {
      const li = document.createElement('li');
      li.className = 'highscore-item' + (entry.id === currentId ? ' is-current' : '');

      const rank = document.createElement('span');
      rank.className = 'rank';
      rank.textContent = `#${idx + 1}`;

      const name = document.createElement('span');
      name.className = 'name';
      name.textContent = entry.name;

      const meta = document.createElement('span');
      meta.className = 'meta';
      const coins = Number(entry.coins || 0);
      meta.textContent = `${coins} 🪙`;

      const score = document.createElement('span');
      score.className = 'score';
      score.textContent = `${Math.round(Number(entry.score || 0))} pts`;

      li.append(rank, name, meta, score);
      root.appendChild(li);
    });
  }

  _renderSecretStats() {
    const total = 4 + this.retroSpots.length;
    const found = this.secretLog.size;
    const text = document.getElementById('secret-stats');
    if (text) text.textContent = `Easter Eggs gefunden: ${found}/${total}`;

    const list = document.getElementById('secret-list');
    if (!list) return;
    list.innerHTML = '';
    if (!this.secretLog.size) {
      const li = document.createElement('li');
      li.className = 'secret-empty';
      li.textContent = 'Keine Geheimnisse entdeckt.';
      list.appendChild(li);
      return;
    }

    for (const label of this.secretLog.values()) {
      const li = document.createElement('li');
      li.className = 'secret-item';
      li.textContent = '✓ ' + label;
      list.appendChild(li);
    }
  }

  // ============================================================ helpers
  _syncHud() {
    this.hud.setHealth(this.focus, this.maxFocus);
    this.hud.setCoins(this.inventory.coins);
    this.hud.setCoffee(this.inventory.coffees);
  }

  _updateNpcMarkers() {
    for (const npc of this.npcs) {
      const qid = npc.data.quest;
      if (!qid) {
        npc.setMarker('', '#fff');
        continue;
      }
      const status = this.quests.status(qid);
      if (status === 'done') npc.setMarker('✓', '#3fb950');
      else if (status === 'active') npc.setMarker('?', '#00e5ff');
      else npc.setMarker('!', '#ffce5c');
    }
  }

  _clockString() {
    const pct = this.elapsed / this.timeBudget;
    const totalMinutes = 15 * 60 + Math.floor(pct * 120); // 15:00 → 17:00
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  _loadProgress() {
    try {
      const raw = localStorage.getItem(this.progressKey);
      const parsed = raw ? JSON.parse(raw) : null;
      const round = Math.max(1, Number(parsed?.round || 1));
      return { round };
    } catch {
      return { round: 1 };
    }
  }

  _saveProgress() {
    try {
      localStorage.setItem(this.progressKey, JSON.stringify(this.progress));
    } catch {
      // ignore
    }
  }

  _advanceRoundProgress() {
    this.progress.round = Math.max(1, this.round + 1);
    this.round = this.progress.round;
    this._saveProgress();
  }

  _randJensInterval() {
    return 35 + Math.random() * 55;
  }

  _updateJens(dt) {
    if (this.jensBusy) return;
    this.jensTimer += dt;
    if (this.jensTimer < this.nextJensIn) return;
    this.jensTimer = 0;
    this.nextJensIn = this._randJensInterval();
    const r = Math.random();
    if (r < 0.45) this._jensQuestionEvent();
    else if (r < 0.8) this._jensJokeEvent();
    else this._jensCoffeeEvent();
  }

  _openJensPopup({ title, text, answers = [], onClose }) {
    this.jensBusy = true;
    this._setState(STATE.JENS);
    const overlay = document.getElementById('jens-overlay');
    const titleEl = document.getElementById('jens-title');
    const textEl = document.getElementById('jens-text');
    const answersEl = document.getElementById('jens-answers');
    const closeBtn = document.getElementById('jens-close');
    if (!overlay || !titleEl || !textEl || !answersEl || !closeBtn) {
      this.jensBusy = false;
      this._setState(STATE.EXPLORE);
      return;
    }
    titleEl.textContent = title;
    textEl.innerHTML = text;
    textEl.classList.remove('jens-result');
    answersEl.innerHTML = '';
    answersEl.classList.remove('hidden');
    closeBtn.classList.add('hidden');

    if (answers.length) {
      answers.forEach((a) => {
        const btn = document.createElement('button');
        btn.className = 'jens-answer';
        btn.innerHTML = a.label;
        btn.addEventListener('click', () => {
          answersEl.querySelectorAll('button').forEach((b) => (b.disabled = true));
          const resultText = a.onPick?.();
          answersEl.innerHTML = '';
          answersEl.classList.add('hidden');
          if (resultText) {
            textEl.innerHTML += `<br><br><strong>${resultText}</strong>`;
            textEl.classList.add('jens-result');
          }

          // Quiz-like flow: brief feedback, then continue automatically.
          setTimeout(() => {
            overlay.classList.add('hidden');
            this.jensBusy = false;
            this._setState(STATE.EXPLORE);
            onClose?.();
          }, 1250);
        });
        answersEl.appendChild(btn);
      });
    } else {
      closeBtn.classList.remove('hidden');
    }

    closeBtn.onclick = () => {
      overlay.classList.add('hidden');
      this.jensBusy = false;
      this._setState(STATE.EXPLORE);
      onClose?.();
    };

    overlay.classList.remove('hidden');
  }

  _jensQuestionEvent() {
    const topics = ['frontend', 'product', 'backend', 'digital', 'design', 'mobile', 'starmoney', 'facility', 'people', 'security'];
    const q = buildDeck(topics, 1, Math.min(3, 1 + Math.floor((this.round - 1) / 2)))[0];
    if (!q) return;
    markAsked(q);
    this._openJensPopup({
      title: '🚨 Jens im Anmarsch',
      text: `Jens kontrolliert kurz deine Arbeit und stellt eine Zusatzfrage:<br><br><strong>${q.q}</strong>`,
      answers: q.answers.map((ans, idx) => ({
        label: `<span class="key">${String.fromCharCode(65 + idx)}</span><span>${ans}</span>`,
        onPick: () => {
          if (idx === q.correct) {
            this.inventory.addCoins(5);
            this._syncHud();
            this.hud.toast('Jens nickt zufrieden. +5 Jira-Münzen.', 'coin');
            const praise = [
              'Jens: Sauber gelöst. Gute Antwort.',
              'Jens: Genau so wollte ich das hören.',
              'Jens: Stark, das passt. Weiter so.'
            ];
            const line = praise[Math.floor(Math.random() * praise.length)];
            return `${line}<br>Jens schenkt dir für die korrekte Antwort <span class="jens-good">+5 Jira-Münzen</span>.`;
          } else {
            this._damageFocus(10);
            this.hud.toast('Jens war nicht begeistert. -10 Fokus.', 'bad');
            const blame = [
              'Jens: Nicht ganz, da musst du nochmal ran.',
              'Jens: Nope, das war daneben.',
              'Jens: Das prüfen wir lieber nochmal gemeinsam.'
            ];
            const line = blame[Math.floor(Math.random() * blame.length)];
            return `${line}<br><span class="jens-bad">-10 Fokus</span>.`;
          }
        }
      }))
    });
  }

  _jensJokeEvent() {
    const jokes = [
      'Jens schaut kurz rein: "Wer Kommentare schreibt, braucht weniger Meetings."',
      'Jens murmelt: "Das ist kein Bug, das ist ein undocumented Feature."',
      'Jens grinst: "Wenn es Freitag nicht läuft, nenn es Montagsthema."',
      'Jens sagt: "Die beste Doku ist immer noch Code, der lesbar ist."',
      'Jens flüstert: "Ich prüfe nur, ob ihr wirklich testet. Macht weiter."'
    ];
    const text = jokes[Math.floor(Math.random() * jokes.length)];
    this._openJensPopup({ title: '👀 Jens kontrolliert', text });
  }

  _jensCoffeeEvent() {
    this.inventory.addCoins(10);
    this._syncHud();
    this._openJensPopup({
      title: '☕ Jens geht nur vorbei',
      text: 'Jens holt sich nur schnell einen Kaffee und zieht weiter. Glück gehabt!<br><br><strong>+10 Jira-Münzen</strong>'
    });
  }

  // ============================================================ easter eggs
  _checkSecrets() {
    const letters = ['A', 'B', 'C', 'D', 'F', 'I', 'K', 'Q', 'X', 'Y', 'Z'];
    for (const ch of letters) {
      if (this.input.wasPressed('Key' + ch)) {
        this.secretTextBuffer = (this.secretTextBuffer + ch).slice(-24);
      }
    }

    const arrows = [
      ['ArrowUp', 'U'],
      ['ArrowDown', 'D'],
      ['ArrowLeft', 'L'],
      ['ArrowRight', 'R'],
      ['KeyB', 'B'],
      ['KeyA', 'A']
    ];
    for (const [code, token] of arrows) {
      if (this.input.wasPressed(code)) {
        this.secretInputHistory.push(token);
        if (this.secretInputHistory.length > 20) this.secretInputHistory.shift();
      }
    }

    const unlock = (id, label, fn) => {
      if (this.unlockedSecrets.has(id)) return false;
      this.unlockedSecrets.add(id);
      this.secretLog.set(id, label);
      fn();
      return true;
    };

    if (this.secretTextBuffer.endsWith('IDDQD')) {
      unlock('iddqd', 'Code: IDDQD', () => {
        this.focus = this.maxFocus;
        this._syncHud();
        this.audio.playSfx('win');
        this.hud.toast('🕹️ Easter Egg: IDDQD erkannt · Fokus vollständig regeneriert!', 'good');
      });
    }

    if (this.secretTextBuffer.endsWith('IDKFA')) {
      unlock('idkfa', 'Code: IDKFA', () => {
        this.inventory.addCoins(30);
        this._syncHud();
        this.audio.playSfx('coin');
        this.hud.toast('🕹️ Easter Egg: IDKFA erkannt · +30 Jira-Münzen freigeschaltet!', 'coin');
      });
    }

    if (this.secretTextBuffer.endsWith('XYZZY')) {
      unlock('xyzzy', 'Code: XYZZY', () => {
        this.inventory.addCoffee(1);
        this.player.grantSprintBoost(18);
        this._syncHud();
        this.audio.playSfx('pickup');
        this.hud.toast('🕹️ Easter Egg: XYZZY · Ein geheimer Kaffee erscheint aus dem Nichts.', 'good');
      });
    }

    if (this.secretTextBuffer.endsWith('ABBA')) {
      unlock('abba', 'Code: ABBA', () => {
        this.unlockedFloors = new Set(['eg', 'og1', 'og2', 'og3', 'og4', 'og5', 'og6', 'og7', 'og8']);
        this.audio.playSfx('win');
        this.hud.toast('🕹️ Cheat aktiv: ABBA · Alle Etagen wurden zum Testen freigeschaltet!', 'good');
      });
    }

    const konami = 'UUDDLRLRBA';
    const tail = this.secretInputHistory.slice(-konami.length).join('');
    if (tail === konami) {
      unlock('konami', 'Code: Konami', () => {
        this.timeBonus += 2;
        this.audio.playSfx('select');
        this.hud.toast('🕹️ Easter Egg: Konami-Code · +2s Zeitbonus pro Quizfrage!', 'good');
      });
    }
  }
}

function clamp(v, a, b) {
  return Math.max(a, Math.min(b, v));
}

function hashCode(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) | 0;
  }
  return h;
}
