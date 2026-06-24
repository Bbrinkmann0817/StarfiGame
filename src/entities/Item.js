import * as THREE from 'three';
import { toon, glow } from '../world/materials.js';

/**
 * Pickups scattered around the building.
 *   type 'coin'   → Jira-Münze (currency)
 *   type 'coffee' → Kaffeetasse (sprint boost + quest item)
 */
export class Item {
  constructor(scene, { type, pos, value = 1 }) {
    this.scene = scene;
    this.type = type;
    this.value = value;
    this.collected = false;
    this.contactRadius = 1.2;

    this.group = new THREE.Group();
    this.group.position.set(pos[0], 1.0, pos[1]);

    if (type === 'coin') {
      const coin = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.08, 18), toon(0xffce5c));
      coin.rotation.x = Math.PI / 2;
      this.group.add(coin);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.05, 8, 18), glow(0xfff0b0));
      ring.rotation.x = Math.PI / 2;
      this.group.add(ring);
      this.spinAxis = 'y';
    } else {
      // coffee cup: mug + handle + steam-ish top
      const mug = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.22, 0.45, 16), toon(0xffffff));
      this.group.add(mug);
      const coffee = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.04, 16), toon(0x4b2e1e));
      coffee.position.y = 0.2;
      this.group.add(coffee);
      const handle = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.04, 8, 14), toon(0xffffff));
      handle.position.set(0.3, 0, 0);
      handle.rotation.y = Math.PI / 2;
      this.group.add(handle);
      this.spinAxis = 'y';
    }

    scene.add(this.group);
    this.phase = Math.random() * Math.PI * 2;
  }

  get position() {
    return this.group.position;
  }

  update(dt) {
    if (this.collected) return;
    this.phase += dt;
    this.group.rotation.y += dt * 1.6;
    this.group.position.y = 1.0 + Math.sin(this.phase * 2) * 0.15;
  }

  distanceTo(pos) {
    const dx = pos.x - this.position.x;
    const dz = pos.z - this.position.z;
    return Math.sqrt(dx * dx + dz * dz);
  }

  collect() {
    this.collected = true;
    this.scene.remove(this.group);
    this.group.traverse((o) => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) o.material.dispose?.();
    });
  }
}
