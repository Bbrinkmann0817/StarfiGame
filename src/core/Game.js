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
import { Story } from '../systems/Story.js';
import { NPCS } from '../data/npcs.js';
import { questById } from '../data/quests.js';
import { resetAsked } from '../data/questions.js';
import {
  OUTSIDE_SPAWN, ENTRANCE, ELEVATOR, ELEVATOR_EXIT, floorById
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
    resetAsked(); // fresh question pool for this playthrough — no repeats
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
    this.hud.toast(`Willkommen, <strong>${this.playerName}</strong>! Klick ins Bild für die Maus · <kbd>E</kbd> interagieren`, '');
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
      case STATE.PAUSE:
        if (this.input.wasPressed('Escape')) this._resume();
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

    if (near) {
      const label = kind === 'talk' ? `Sprechen mit ${near.data.name}`
        : kind === 'elevator' ? 'Fahrstuhl rufen'
        : 'Cafeteria-Upgrades öffnen';
      this.hud.showPrompt(label);
      if (this.input.wasPressed('KeyE')) {
        if (kind === 'talk') this._talk(near);
        else if (kind === 'elevator') this._openElevator();
        else this._openShop();
      }
    } else {
      this.hud.hidePrompt();
    }
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

  _enterBuilding() {
    this.unlockedFloors.add('eg');
    this.unlockedFloors.add('og1');
    this.story.advanceTo('lift1');
    this._travelTo('eg', () => {
      this.hud.toast('Du bist im Foyer. Nimm den Fahrstuhl (E) ins 1. OG.', '');
    });
  }

  _openElevator() {
    this.hud.hidePrompt();
    this._setState(STATE.ELEVATOR);
    this.elevator.show(this.world.activeArea, this.unlockedFloors, (id) => this._travelTo(id));
  }

  /** Fade out, switch floor, drop the player at the elevator, fade back in. */
  _travelTo(area, after) {
    this._setState(STATE.TRAVEL);
    this.input.exitPointerLock();
    const fade = document.getElementById('travel-fade');
    fade.classList.add('on');
    this.audio.playSfx('select');
    setTimeout(() => {
      this.world.setArea(area);
      const spawn = this._pickTravelSpawn();
      this.player.setPosition(spawn.x, spawn.z);
      this.player.heading = ELEVATOR_EXIT.heading;
      this.camYaw = ELEVATOR_EXIT.heading;
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
      og5: ['lift5', 'tobias'],
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
      this.dialog.start(data, this._lines(data.lines.done), () => this._setState(STATE.EXPLORE));
      return;
    }

    // Briefing colleague (Jessi): explain the situation, then direct the player.
    if (!data.challenge) {
      this.dialog.start(data, this._lines(data.lines.intro), () => {
        if (qid) this.quests.complete(qid);
        if (data.id === 'sam') {
          this.unlockedFloors.add('og2');
          this.story.advanceTo('lift2');
          this.hud.toast('Jessi: Fahr mit dem Fahrstuhl ins 2. OG zu Melina!', 'good');
        }
        this._syncObjective();
        this._setState(STATE.EXPLORE);
      });
      return;
    }

    const ch = data.challenge;

    // Gated challenge (boss): require the other teams to be stable first.
    if (ch.requires && !ch.requires.every((id) => this.quests.isDone(id))) {
      this.dialog.start(data, this._lines(data.lines.locked || data.lines.intro), () =>
        this._setState(STATE.EXPLORE)
      );
      return;
    }

    // Explain the problem, then start the quiz directly as the way to solve it.
    this.quests.offer(qid); // make sure it's active in the log
    this.dialog.start(data, this._lines(data.lines.intro), () => this._startChallenge(npc));
  }

  // ============================================================ shop
  _openShop() {
    this.hud.hidePrompt();
    this._setState(STATE.SHOP);
    this.shop.show(this.inventory, (item) => this._buy(item));
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
    this.quiz.start({
      topics,
      enemyName: ch.problem,
      emoji: ch.emoji || (ch.isBoss ? '🐉' : '🐛'),
      enemyHP: ch.hp || 3,
      isBoss: !!ch.isBoss,
      maxDifficulty: ch.maxDifficulty,
      timePerQuestion: ch.time || 12,
      playerDamage: ch.damage || 16,
      hooks: {
        getHP: () => this.focus,
        getMaxHP: () => this.maxFocus,
        getTimeBonus: () => this.timeBonus,
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
    else if (data.id === 'tobias') { this.story.advanceTo('lift6'); this.unlockedFloors.add('og6'); }
    else if (data.id === 'frank') { this.story.advanceTo('lift7'); this.unlockedFloors.add('og7'); }
    else if (data.id === 'petra') { this.story.advanceTo('lift8'); this.unlockedFloors.add('og8'); }
    else if (data.id === 'jonas') this.story.advanceTo('kristof');

    // small heal, then the colleague's closing line
    this.focus = Math.min(this.maxFocus, this.focus + 20);
    this._syncHud();
    this._setState(STATE.DIALOG);
    this.dialog.start(data, this._lines(data.lines.done), () => {
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
    document.getElementById('end-title').textContent = 'RELEASE GERETTET';
    document.getElementById('end-title').setAttribute('data-text', 'RELEASE GERETTET');
    document.getElementById('end-text').innerHTML =
      `Stark gemacht, <strong>${this.playerName}</strong>! Der Master-Commit ist durch, die Pipeline leuchtet grün ` +
      `und der Ur-Bug ist Geschichte. Du hast <strong>${this.inventory.coins} Jira-Münzen</strong> gesammelt, ` +
      `<strong>${entry.score} Punkte</strong> erzielt und dich von Level 1 bis zum Boss durchgekämpft. ` +
      `Zeit für ein wohlverdientes Feierabend-Getränk! 🍻`;
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
}

function clamp(v, a, b) {
  return Math.max(a, Math.min(b, v));
}
