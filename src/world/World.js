import * as THREE from 'three';
import { BUILDING, OUTSIDE, ELEVATOR, FLOORS } from '../data/rooms.js';
import { toon, glow } from './materials.js';
import { makeTextSprite } from './sprites.js';

/**
 * Star Finanz brand palette (Sparkasse signal red + the Sparkassen-Finanzgruppe
 * gradient). Used across the office so the whole world reads "on brand".
 */
export const BRAND = {
  red: 0xe2001a,
  redSoft: 0xdc1b42,
  magenta: 0x8f0682,
  coral: 0xe36e6e,
  teal: 0x00707f,
  gold: 0xdb9b4d,
  gray: 0x575756,
  wall: 0xf2f4f8,
  wallTrim: 0xe2001a,
  floor: 0xdce1ea,
  sky: 0xeef1f6
};

/**
 * Builds and owns the world as a set of self-contained AREAS:
 *   outside       – the plaza + building facade with the entrance
 *   eg/og1..og8   – the floors you reach with the elevator (one department each)
 *
 * Only one area is visible (and collidable) at a time; `setArea(id)` switches.
 */
export class World {
  constructor(scene, assets) {
    this.scene = scene;
    this.assets = assets;
    this.wallMat = toon(BRAND.wall);
    this.trimMat = toon(BRAND.wallTrim);

    this.areas = {}; // id -> { group, colliders[], bounds }
    this.activeArea = null;
    this.activeColliders = [];
    this.activeBounds = BUILDING;

    // build-time pointers (set by _buildArea while an area is constructed)
    this._g = null;
    this._cur = null;
  }

  build() {
    this._buildLighting();
    this._buildArea('outside', OUTSIDE, () => this._buildOutside());
    for (const f of FLOORS) {
      this._buildArea(f.id, BUILDING, () => this._buildFloor(f.id));
    }
    this.setArea('outside');
  }

  // ---------------------------------------------------------------- area infra
  _buildArea(id, bounds, fn) {
    const group = new THREE.Group();
    group.visible = false;
    this.scene.add(group);
    this.areas[id] = { group, colliders: [], bounds };
    this._g = group;
    this._cur = this.areas[id];
    fn();
    this._g = null;
    this._cur = null;
  }

  _add(obj) {
    this._g.add(obj);
    return obj;
  }

  addCollider(minX, maxX, minZ, maxZ) {
    this._cur.colliders.push({ minX, maxX, minZ, maxZ });
  }

  /** Show one area; switch active colliders + bounds + backdrop. */
  setArea(id) {
    if (!this.areas[id]) return;
    for (const k of Object.keys(this.areas)) this.areas[k].group.visible = k === id;
    this.activeArea = id;
    this.activeColliders = this.areas[id].colliders;
    this.activeBounds = this.areas[id].bounds;
    const tint = id === 'outside' ? 0xdfeaf5 : BRAND.sky;
    this.scene.background = new THREE.Color(tint);
    this.scene.fog = new THREE.Fog(tint, id === 'outside' ? 60 : 40, id === 'outside' ? 140 : 90);
  }

  // ---------------------------------------------------------------- lighting
  _buildLighting() {
    this.scene.add(new THREE.HemisphereLight(0xffffff, 0xd2d8e2, 1.05));
    const sun = new THREE.DirectionalLight(0xfff6ec, 1.3);
    sun.position.set(18, 34, 16);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    const s = 40;
    Object.assign(sun.shadow.camera, { left: -s, right: s, top: s, bottom: -s, near: 1, far: 100 });
    sun.shadow.bias = -0.0004;
    this.scene.add(sun);
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.42));
  }

  // ================================================================ OUTSIDE
  _buildOutside() {
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(120, 120),
      new THREE.MeshStandardMaterial({ color: 0xb9c2cf, roughness: 1 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(0, 0, 10);
    ground.receiveShadow = true;
    this._add(ground);

    const path = new THREE.Mesh(
      new THREE.PlaneGeometry(7, 26),
      new THREE.MeshStandardMaterial({ color: 0xd7dde6, roughness: 1 })
    );
    path.rotation.x = -Math.PI / 2;
    path.position.set(0, 0.01, 15);
    this._add(path);

    // building mass behind the facade (visual only)
    const mass = new THREE.Mesh(new THREE.BoxGeometry(46, 26, 24), toon(BRAND.wall));
    mass.position.set(0, 13, -12);
    mass.castShadow = true;
    this._add(mass);

    // window rows
    for (let row = 0; row < 4; row++) {
      for (let col = -4; col <= 4; col++) {
        if (Math.abs(col) < 1 && row === 0) continue; // leave room for the door
        const win = new THREE.Mesh(new THREE.PlaneGeometry(3, 2.2), glow(0x9fd0e8));
        win.position.set(col * 4.6, 5 + row * 5.2, 0.31);
        this._add(win);
      }
    }

    // facade base band + entrance portal in brand red
    const band = new THREE.Mesh(new THREE.BoxGeometry(46.4, 1.2, 24.4), this.trimMat);
    band.position.set(0, 0.6, -12);
    this._add(band);

    const portal = new THREE.Mesh(new THREE.BoxGeometry(7, 6, 0.6), this.trimMat);
    portal.position.set(0, 3, 0.5);
    this._add(portal);
    const doorway = new THREE.Mesh(new THREE.PlaneGeometry(5, 5), toon(0x1b1f27));
    doorway.position.set(0, 2.5, 0.85);
    this._add(doorway);
    const enterTxt = makeTextSprite('▶ EINGANG', { size: 38, color: '#ffffff', bg: '#e2001a', border: '#ffffff' });
    enterTxt.position.set(0, 6.4, 1);
    this._add(enterTxt);

    this._logoSign(0, 9.2, 0.9);

    this._tree(-12, 16);
    this._tree(12, 16);
    this._tree(-16, 24);
    this._tree(16, 24);

    // facade colliders (block everything except the door gap x∈[-2.6,2.6])
    this.addCollider(-24, -2.6, 1.2, 2.4);
    this.addCollider(2.6, 24, 1.2, 2.4);
  }

  _tree(x, z) {
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, 1.6, 8), toon(0x7a5a3c));
    trunk.position.set(x, 0.8, z);
    this._add(trunk);
    const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(1.5, 0), toon(0x2f9e44, { flatShading: true }));
    crown.position.set(x, 2.6, z);
    crown.castShadow = true;
    this._add(crown);
    this.addCollider(x - 0.5, x + 0.5, z - 0.5, z + 0.5);
  }

  // ================================================================ FLOORS
  _buildFloor(id) {
    const meta = FLOORS.find((f) => f.id === id);
    this._roomShell(meta);
    this._elevator(meta);

    switch (id) {
      case 'eg':
        this._logoWall(0, BUILDING.minZ + 0.4);
        this._plant(-12, -10);
        this._plant(12, -10);
        this._plant(-12, 12);
        this._floorSign('WILLKOMMEN BEI STAR FINANZ', 0, 6, meta.accent);
        break;
      case 'og1':
        // Empfang / Office Management (Jessi)
        this._reception(0, -9);
        this._logoWall(0, BUILDING.minZ + 0.4);
        this._plant(-13, 10);
        this._plant(13, -2);
        this._floorSign('EMPFANG · OFFICE MANAGEMENT', 0, 6, meta.accent);
        break;
      case 'og2':
        // Open Space: Frontend (Melina) + Produkt/Agile (Mehmet)
        for (let i = 0; i < 3; i++) this._desk(-12 + i * 6, -8, 0);
        this._meetingTable(-6, 9);
        this._whiteboard(-6, BUILDING.minZ + 0.4);
        this._plant(-15, 13);
        this._floorSign('OPEN SPACE · FRONTEND & PRODUKT', 0, 14, meta.accent);
        break;
      case 'og3':
        // Digital Solutions (Sven)
        for (let i = 0; i < 2; i++) this._desk(-12 + i * 6, -10, 0);
        this._serverRack(8, -12);
        this._serverRack(12, -12);
        this._whiteboard(-6, BUILDING.minZ + 0.4);
        this._plant(-15, 12);
        this._plant(15, 6);
        this._floorSign('DIGITAL SOLUTIONS · APIs & CLOUD', 0, 14, meta.accent);
        break;
      case 'og4':
        // Inclusive Design Lab (Aylin)
        this._designBoard(-6, BUILDING.minZ + 0.4);
        this._desk(-12, -10, 0);
        this._sofa(-13, 8);
        this._coffeeTable(-13, 3);
        this._plant(-16, -2);
        this._plant(15, 10);
        this._floorSign('INCLUSIVE DESIGN LAB · UX FÜR ALLE', 0, 14, meta.accent);
        break;
      case 'og5':
        // App Factory (Emre)
        for (let i = 0; i < 2; i++) this._desk(-12 + i * 6, -10, 0);
        this._phoneMock(7, -8);
        this._phoneMock(10, -8);
        this._whiteboard(-6, BUILDING.minZ + 0.4);
        this._plant(-15, 12);
        this._floorSign('APP FACTORY · iOS & ANDROID', 0, 14, meta.accent);
        break;
      case 'og6':
        // Facility Management (Frank)
        this._toolCabinet(-12, -11);
        this._toolCabinet(-8, -11);
        this._kitchen(8, -8);
        this._plant(-15, 6);
        this._plant(14, 8);
        this._floorSign('FACILITY MANAGEMENT · HAUS & TECHNIK', 0, 14, meta.accent);
        break;
      case 'og7':
        // People · Culture · Places (Petra)
        this._sofa(-12, -10);
        this._coffeeTable(-12, -5);
        this._meetingTable(6, 8);
        this._plant(-16, 6);
        this._plant(14, -8);
        this._floorSign('PEOPLE · CULTURE · PLACES', 0, 14, meta.accent);
        break;
      case 'og8':
        // Backend & Serverraum: Viktor + Kristof (boss)
        this._kitchen(-11, -10);
        for (let i = 0; i < 4; i++) this._serverRack(2 + i * 3.4, -12);
        this._sofa(-13, 8);
        this._coffeeTable(-13, 3);
        this._plant(-16, -2);
        this._floorSign('BACKEND · SERVERRAUM', 0, 14, meta.accent);
        break;
    }
  }

  /** Floor + 4 perimeter walls + red cornice. */
  _roomShell(meta) {
    const { minX, maxX, minZ, maxZ, wallThickness: t } = BUILDING;
    const w = maxX - minX;
    const d = maxZ - minZ;

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(w, d),
      new THREE.MeshStandardMaterial({ color: BRAND.floor, roughness: 0.85 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.set((minX + maxX) / 2, 0, (minZ + maxZ) / 2);
    floor.receiveShadow = true;
    this._add(floor);

    const grid = new THREE.GridHelper(Math.max(w, d), Math.max(w, d) / 2, meta.accent, 0xc2c8d4);
    grid.position.set((minX + maxX) / 2, 0.02, (minZ + maxZ) / 2);
    grid.material.transparent = true;
    grid.material.opacity = 0.18;
    this._add(grid);

    this._wallBox((minX + maxX) / 2, minZ - t / 2, w + t * 2, t);
    this._wallBox((minX + maxX) / 2, maxZ + t / 2, w + t * 2, t);
    this._wallBox(minX - t / 2, (minZ + maxZ) / 2, t, d);
    this._wallBox(maxX + t / 2, (minZ + maxZ) / 2, t, d);
  }

  _wallBox(cx, cz, w, d) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, BUILDING.wallHeight, d), this.wallMat);
    mesh.position.set(cx, BUILDING.wallHeight / 2, cz);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    this._add(mesh);
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(w + 0.04, 0.3, d + 0.04), this.trimMat);
    stripe.position.set(cx, BUILDING.wallHeight - 0.55, cz);
    this._add(stripe);
    this.addCollider(cx - w / 2, cx + w / 2, cz - d / 2, cz + d / 2);
    return mesh;
  }

  /** Elevator alcove at ELEVATOR (back-right corner of every floor). */
  _elevator(meta) {
    const { x, z } = ELEVATOR;
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(4.2, 5, 1.6), toon(0x9aa4b2));
    cabin.position.set(x, 2.5, z + 1.3);
    cabin.castShadow = true;
    this._add(cabin);

    const doorMat = toon(BRAND.gray);
    for (const dx of [-0.95, 0.95]) {
      const door = new THREE.Mesh(new THREE.BoxGeometry(1.8, 4.4, 0.22), doorMat);
      door.position.set(x + dx, 2.2, z + 0.55);
      this._add(door);
    }
    const seam = new THREE.Mesh(new THREE.BoxGeometry(0.12, 4.4, 0.26), this.trimMat);
    seam.position.set(x, 2.2, z + 0.56);
    this._add(seam);

    const btn = new THREE.Mesh(new THREE.CircleGeometry(0.16, 16), glow(BRAND.red));
    btn.position.set(x + 2.4, 1.5, z + 0.46);
    this._add(btn);

    const sign = makeTextSprite(`🛗 ${meta.short}`, {
      size: 36, color: '#ffffff', bg: '#' + meta.accent.toString(16).padStart(6, '0'), border: '#ffffff'
    });
    sign.position.set(x, 5.2, z + 0.6);
    this._add(sign);

    // cabin collider (you stand in front of the doors)
    this.addCollider(x - 2.1, x + 2.1, z + 0.5, z + 2.1);
  }

  _floorSign(text, x, z, accent) {
    const sign = makeTextSprite(text, {
      size: 40, color: '#ffffff', bg: '#' + accent.toString(16).padStart(6, '0'), border: '#ffffff'
    });
    sign.position.set(x, 4.6, z);
    this._add(sign);
  }

  // ---------------------------------------------------------------- furniture
  _desk(x, z, rot) {
    const g = new THREE.Group();
    const top = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.12, 1.2), toon(0xeef1f6));
    top.position.y = 1.0;
    top.castShadow = true;
    g.add(top);
    for (const dx of [-1.0, 1.0]) for (const dz of [-0.5, 0.5]) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.0, 0.12), toon(BRAND.gray));
      leg.position.set(dx, 0.5, dz);
      g.add(leg);
    }
    const monitor = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.75, 0.08), toon(0x111419));
    monitor.position.set(0, 1.7, -0.3);
    g.add(monitor);
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(1.05, 0.6), glow(0x1f6feb));
    screen.position.set(0, 1.7, -0.255);
    g.add(screen);
    const stand = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.4, 0.1), toon(BRAND.gray));
    stand.position.set(0, 1.26, -0.3);
    g.add(stand);
    const chair = this._chairMesh();
    chair.position.set(0, 0, 0.9);
    g.add(chair);
    g.position.set(x, 0, z);
    g.rotation.y = rot;
    this._add(g);
    if (Math.abs(Math.sin(rot)) > 0.5) this.addCollider(x - 0.7, x + 0.7, z - 1.3, z + 1.3);
    else this.addCollider(x - 1.3, x + 1.3, z - 0.7, z + 0.7);
  }

  _chairMesh() {
    const c = new THREE.Group();
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.12, 0.6), toon(0x30363d));
    seat.position.y = 0.55;
    c.add(seat);
    const back = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.6, 0.1), toon(0x30363d));
    back.position.set(0, 0.85, 0.28);
    c.add(back);
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.5, 8), toon(BRAND.gray));
    pole.position.y = 0.28;
    c.add(pole);
    c.traverse((m) => (m.castShadow = true));
    return c;
  }

  _meetingTable(x, z) {
    const top = new THREE.Mesh(new THREE.BoxGeometry(6, 0.18, 2.4), toon(0x8a6f55));
    top.position.set(x, 1.0, z);
    top.castShadow = true;
    this._add(top);
    for (const dx of [-2.5, 2.5]) for (const dz of [-0.9, 0.9]) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.16, 1.0, 0.16), toon(BRAND.gray));
      leg.position.set(x + dx, 0.5, z + dz);
      this._add(leg);
    }
    for (let i = -2; i <= 2; i++) {
      [-1.8, 1.8].forEach((dz) => {
        const c = this._chairMesh();
        c.position.set(x + i * 1.2, 0, z + dz);
        c.rotation.y = dz > 0 ? Math.PI : 0;
        this._add(c);
      });
    }
    this.addCollider(x - 3, x + 3, z - 1.4, z + 1.4);
  }

  _whiteboard(x, z) {
    const board = new THREE.Mesh(new THREE.BoxGeometry(5, 2.2, 0.12), toon(0xffffff));
    board.position.set(x, 2.2, z + 0.2);
    this._add(board);
    const note = makeTextSprite('Sprint 42 · Backlog', { size: 30, color: '#e2001a', bg: 'rgba(0,0,0,0)', border: 'rgba(0,0,0,0)' });
    note.position.set(x, 2.6, z + 0.3);
    this._add(note);
  }

  /** Colourful design/accessibility board for the Inclusive Design Lab. */
  _designBoard(x, z) {
    const board = new THREE.Mesh(new THREE.BoxGeometry(5, 2.4, 0.12), toon(0xffffff));
    board.position.set(x, 2.3, z + 0.2);
    this._add(board);
    const swatches = [BRAND.red, BRAND.magenta, BRAND.teal, BRAND.gold, BRAND.coral];
    swatches.forEach((c, i) => {
      const sw = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.7), glow(c));
      sw.position.set(x - 1.8 + i * 0.9, 2.7, z + 0.27);
      this._add(sw);
    });
    const note = makeTextSprite('A11Y · Kontrast · UX', { size: 28, color: '#8f0682', bg: 'rgba(0,0,0,0)', border: 'rgba(0,0,0,0)' });
    note.position.set(x, 1.7, z + 0.3);
    this._add(note);
  }

  /** Oversized smartphone mock-up on a stand for the App Factory. */
  _phoneMock(x, z) {
    const g = new THREE.Group();
    const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.6, 0.2, 12), toon(BRAND.gray));
    stand.position.y = 0.1;
    g.add(stand);
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 1.4, 8), toon(BRAND.gray));
    pole.position.y = 0.8;
    g.add(pole);
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.1, 2.0, 0.14), toon(0x14181f));
    body.position.y = 2.1;
    body.castShadow = true;
    g.add(body);
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.92, 1.8), glow(0x1f6feb));
    screen.position.set(0, 2.1, 0.08);
    g.add(screen);
    g.position.set(x, 0, z);
    this._add(g);
    this.addCollider(x - 0.6, x + 0.6, z - 0.6, z + 0.6);
  }

  /** Tall tool / supply cabinet for Facility Management. */
  _toolCabinet(x, z) {
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.8, 3.0, 1.0), toon(BRAND.teal));
    body.position.y = 1.5;
    body.castShadow = true;
    g.add(body);
    for (const dy of [1.0, 2.0]) {
      const handle = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.5, 0.08), toon(0xeef1f6));
      handle.position.set(0.5, dy, 0.52);
      g.add(handle);
    }
    const seam = new THREE.Mesh(new THREE.BoxGeometry(0.06, 2.8, 0.04), toon(0x14181f));
    seam.position.set(0, 1.5, 0.51);
    g.add(seam);
    g.position.set(x, 0, z);
    this._add(g);
    this.addCollider(x - 0.9, x + 0.9, z - 0.5, z + 0.5);
  }

  _serverRack(x, z) {
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.4, 3.2, 1.2), toon(0x14181f));
    body.position.y = 1.6;
    body.castShadow = true;
    g.add(body);
    for (let i = 0; i < 8; i++) {
      const led = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.02), glow(i % 2 ? 0x3fb950 : BRAND.gold));
      led.position.set(-0.4 + (i % 2) * 0.25, 0.6 + i * 0.28, 0.61);
      g.add(led);
    }
    g.position.set(x, 0, z);
    this._add(g);
    this.addCollider(x - 0.7, x + 0.7, z - 0.6, z + 0.6);
  }

  _kitchen(x, z) {
    const counter = new THREE.Mesh(new THREE.BoxGeometry(5, 1.0, 1.2), toon(0x9aa4b2));
    counter.position.set(x, 0.5, z);
    counter.castShadow = true;
    this._add(counter);
    const machine = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.9, 0.7), toon(0x202531));
    machine.position.set(x - 1.5, 1.45, z);
    this._add(machine);
    const mLight = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.2), glow(BRAND.red));
    mLight.position.set(x - 1.5, 1.6, z + 0.36);
    this._add(mLight);
    const sign = makeTextSprite('☕ Star Café', { size: 30, color: '#db9b4d', bg: 'rgba(27,31,39,0.7)', border: '#db9b4d' });
    sign.position.set(x, 2.4, z);
    this._add(sign);
    this.addCollider(x - 2.5, x + 2.5, z - 0.7, z + 0.7);
  }

  _sofa(x, z) {
    const base = new THREE.Mesh(new THREE.BoxGeometry(3, 0.6, 1.2), toon(BRAND.teal));
    base.position.set(x, 0.4, z);
    base.castShadow = true;
    this._add(base);
    const back = new THREE.Mesh(new THREE.BoxGeometry(3, 0.8, 0.3), toon(BRAND.teal));
    back.position.set(x, 0.9, z - 0.45);
    this._add(back);
    this.addCollider(x - 1.5, x + 1.5, z - 0.6, z + 0.6);
  }

  _coffeeTable(x, z) {
    const t = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.4, 0.9), toon(0x8a6f55));
    t.position.set(x, 0.3, z);
    this._add(t);
    this.addCollider(x - 0.8, x + 0.8, z - 0.45, z + 0.45);
  }

  _reception(x, z) {
    const desk = new THREE.Mesh(new THREE.BoxGeometry(5, 1.1, 1.4), toon(BRAND.red));
    desk.position.set(x, 0.55, z);
    desk.castShadow = true;
    this._add(desk);
    const top = new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.12, 1.7), toon(0xffffff));
    top.position.set(x, 1.15, z);
    this._add(top);
    const strip = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 0.18), glow(BRAND.red));
    strip.position.set(x, 0.72, z + 0.71);
    this._add(strip);
    const sign = makeTextSprite('EMPFANG', { size: 32, color: '#ffffff', bg: '#e2001a', border: '#ffffff' });
    sign.position.set(x, 2.4, z);
    this._add(sign);
    this.addCollider(x - 2.6, x + 2.6, z - 0.85, z + 0.85);
  }

  _plant(x, z) {
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.28, 0.5, 10), toon(0x8a5a3c));
    pot.position.set(x, 0.25, z);
    this._add(pot);
    const leaves = new THREE.Mesh(new THREE.IcosahedronGeometry(0.7, 0), toon(0x2f9e44, { flatShading: true }));
    leaves.position.set(x, 1.1, z);
    leaves.castShadow = true;
    this._add(leaves);
    this.addCollider(x - 0.35, x + 0.35, z - 0.35, z + 0.35);
  }

  /** Logo on an interior wall (north wall, faces into the room). */
  _logoWall(x, z) {
    const logoTex = this.assets.getTexture('logo');
    if (logoTex) {
      const aspect = 1417 / 472;
      const logoW = 6.6;
      const logoH = logoW / aspect;
      const pad = 0.55;
      const plaque = new THREE.Mesh(
        new THREE.PlaneGeometry(logoW + pad * 2, logoH + pad * 2),
        new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide })
      );
      plaque.position.set(x, 3.0, z + 0.05);
      this._add(plaque);
      const logo = new THREE.Mesh(
        new THREE.PlaneGeometry(logoW, logoH),
        new THREE.MeshBasicMaterial({ map: logoTex, side: THREE.DoubleSide })
      );
      logo.position.set(x, 3.0, z + 0.06);
      this._add(logo);
    } else {
      const txt = makeTextSprite('★ STAR FINANZ', { size: 60, color: '#e2001a', bg: 'rgba(0,0,0,0)', border: 'rgba(0,0,0,0)' });
      txt.position.set(x, 3.0, z + 0.06);
      this._add(txt);
    }
  }

  /** Logo sign on the outside facade (faces +z toward the plaza). */
  _logoSign(x, y, z) {
    const logoTex = this.assets.getTexture('logo');
    if (logoTex) {
      const aspect = 1417 / 472;
      const logoW = 9;
      const logoH = logoW / aspect;
      const plaque = new THREE.Mesh(
        new THREE.PlaneGeometry(logoW + 1, logoH + 1),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
      );
      plaque.position.set(x, y, z - 0.02);
      this._add(plaque);
      const logo = new THREE.Mesh(
        new THREE.PlaneGeometry(logoW, logoH),
        new THREE.MeshBasicMaterial({ map: logoTex })
      );
      logo.position.set(x, y, z);
      this._add(logo);
    } else {
      const txt = makeTextSprite('★ STAR FINANZ', { size: 70, color: '#e2001a', bg: '#ffffff', border: '#e2001a' });
      txt.position.set(x, y, z);
      this._add(txt);
    }
  }

  // ---------------------------------------------------------------- collision
  resolveCollision(x, z, r) {
    const b = this.activeBounds;
    x = clamp(x, b.minX + r, b.maxX - r);
    z = clamp(z, b.minZ + r, b.maxZ - r);
    for (let iter = 0; iter < 2; iter++) {
      for (const c of this.activeColliders) {
        const exMinX = c.minX - r, exMaxX = c.maxX + r;
        const exMinZ = c.minZ - r, exMaxZ = c.maxZ + r;
        if (x > exMinX && x < exMaxX && z > exMinZ && z < exMaxZ) {
          const dl = x - exMinX, dr = exMaxX - x, dt = z - exMinZ, db = exMaxZ - z;
          const m = Math.min(dl, dr, dt, db);
          if (m === dl) x = exMinX;
          else if (m === dr) x = exMaxX;
          else if (m === dt) z = exMinZ;
          else z = exMaxZ;
        }
      }
    }
    return { x, z };
  }
}

// --------------------------------------------------------------- helpers
function clamp(v, a, b) {
  return Math.max(a, Math.min(b, v));
}
