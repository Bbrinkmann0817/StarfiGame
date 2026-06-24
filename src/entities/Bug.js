import * as THREE from 'three';
import { glow } from '../world/materials.js';

/**
 * A floating neon "Glitch-Anomalie". Bobs and wanders inside its home zone;
 * touching it starts a quiz duel. Bosses are larger, jittery and multi-shape.
 */
export class Bug {
  constructor(scene, { zone, pos, isBoss = false, name = 'Glitch-Anomalie' }) {
    this.scene = scene;
    this.zone = zone;
    this.isBoss = isBoss;
    this.name = name;
    this.defeated = false;
    this.contactRadius = isBoss ? 2.4 : 1.5;
    this.cooldown = 0; // brief pause after a failed duel so you can step back

    this.home = new THREE.Vector3(pos[0], isBoss ? 2.0 : 1.4, pos[1]);
    this.group = new THREE.Group();
    this.group.position.copy(this.home);

    const color = isBoss ? 0xe2001a : neonColor();
    this.color = color;

    // Core solid shape
    const coreGeo = isBoss
      ? new THREE.IcosahedronGeometry(1.4, 0)
      : new THREE.OctahedronGeometry(0.6, 0);
    this.core = new THREE.Mesh(coreGeo, glow(color));
    this.group.add(this.core);

    // Wireframe shell for the "digital glitch" feel
    const shellGeo = isBoss
      ? new THREE.IcosahedronGeometry(2.0, 0)
      : new THREE.OctahedronGeometry(1.0, 0);
    this.shell = new THREE.Mesh(
      shellGeo,
      new THREE.MeshBasicMaterial({ color, wireframe: true, transparent: true, opacity: 0.7, toneMapped: false })
    );
    this.group.add(this.shell);

    // Point light so it casts neon onto the room
    this.light = new THREE.PointLight(color, isBoss ? 3 : 1.2, isBoss ? 18 : 8);
    this.group.add(this.light);

    if (isBoss) {
      // extra orbiting shards
      this.shards = [];
      for (let i = 0; i < 5; i++) {
        const shard = new THREE.Mesh(new THREE.TetrahedronGeometry(0.5), glow(0xdb9b4d));
        this.shards.push(shard);
        this.group.add(shard);
      }
    }

    scene.add(this.group);
    this.phase = Math.random() * Math.PI * 2;
    this.wander = new THREE.Vector2(pos[0], pos[1]);
    this.wanderTarget = this.wander.clone();
    this._pickWander();
  }

  get position() {
    return this.group.position;
  }

  _pickWander() {
    const r = this.isBoss ? 0 : 4;
    this.wanderTarget.set(this.home.x + rand(-r, r), this.home.z + rand(-r, r));
    this._wanderTimer = rand(2, 4);
  }

  update(dt) {
    if (this.defeated) return;
    this.phase += dt;
    if (this.cooldown > 0) this.cooldown -= dt;

    // spin
    this.core.rotation.x += dt * 1.2;
    this.core.rotation.y += dt * 1.6;
    this.shell.rotation.x -= dt * 0.8;
    this.shell.rotation.y -= dt * 1.1;

    // glitch jitter on scale
    const j = 1 + Math.sin(this.phase * 22) * (this.isBoss ? 0.06 : 0.03);
    this.core.scale.setScalar(j);

    // bob
    this.group.position.y = this.home.y + Math.sin(this.phase * 1.6) * 0.3;

    // wander (non-boss)
    if (!this.isBoss) {
      this._wanderTimer -= dt;
      if (this._wanderTimer <= 0) this._pickWander();
      this.group.position.x += (this.wanderTarget.x - this.group.position.x) * Math.min(1, dt * 0.6);
      this.group.position.z += (this.wanderTarget.y - this.group.position.z) * Math.min(1, dt * 0.6);
    }

    // boss shards orbit
    if (this.shards) {
      this.shards.forEach((s, i) => {
        const a = this.phase * 1.5 + (i / this.shards.length) * Math.PI * 2;
        s.position.set(Math.cos(a) * 2.6, Math.sin(a * 1.3) * 0.8, Math.sin(a) * 2.6);
        s.rotation.x += dt * 3;
        s.rotation.y += dt * 2;
      });
    }
  }

  distanceTo(pos) {
    const dx = pos.x - this.position.x;
    const dz = pos.z - this.position.z;
    return Math.sqrt(dx * dx + dz * dz);
  }

  /** Visually dissolve and remove from the scene. */
  defeat() {
    this.defeated = true;
    const start = performance.now();
    const tick = () => {
      const t = (performance.now() - start) / 450;
      if (t >= 1) {
        this.scene.remove(this.group);
        this.group.traverse((o) => {
          if (o.geometry) o.geometry.dispose();
          if (o.material) o.material.dispose?.();
        });
        return;
      }
      this.group.scale.setScalar(1 - t);
      this.group.rotation.y += 0.4;
      this.light.intensity = (1 - t) * (this.isBoss ? 3 : 1.2);
      requestAnimationFrame(tick);
    };
    tick();
  }
}

function neonColor() {
  // Star Finanz brand-tinted glitch palette (red, magenta, teal, gold, coral)
  const palette = [0xe2001a, 0x8f0682, 0x00707f, 0xdb9b4d, 0xe36e6e];
  return palette[Math.floor(Math.random() * palette.length)];
}
function rand(a, b) {
  return a + Math.random() * (b - a);
}
