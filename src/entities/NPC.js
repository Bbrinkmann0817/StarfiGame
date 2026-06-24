import * as THREE from 'three';
import { buildCharacter, animateWalk } from './character.js';
import { makeTextSprite } from '../world/sprites.js';

/**
 * A colleague NPC: a low-poly character with a floating name plate and a
 * status marker (! offer / ? in progress / ✓ done) above the head.
 */
export class NPC {
  constructor(scene, data) {
    this.data = data;
    this.id = data.id;
    this.radius = 1.6; // interaction range

    const built = buildCharacter(data.color);
    this.model = built.group;
    this.parts = built;
    this.model.position.set(data.pos[0], 0, data.pos[1]);
    this.model.rotation.y = data.heading ?? 0;
    scene.add(this.model);

    // name plate
    this.namePlate = makeTextSprite(data.name, { size: 40, color: '#e6edf3' });
    this.namePlate.position.set(0, 2.6, 0);
    this.model.add(this.namePlate);

    // status marker
    this.marker = makeTextSprite('!', {
      size: 80,
      color: '#ffce5c',
      bg: 'rgba(13,17,23,0.0)',
      border: 'rgba(0,0,0,0)'
    });
    this.marker.position.set(0, 3.4, 0);
    this.model.add(this.marker);

    this.phase = Math.random() * Math.PI * 2;
  }

  get position() {
    return this.model.position;
  }

  setMarker(symbol, color) {
    const ctx = this.marker.userData.ctx;
    const canvas = this.marker.userData.canvas;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = color;
    ctx.fillText(symbol, canvas.width / 2, canvas.height / 2 + 2);
    this.marker.userData.texture.needsUpdate = true;
    this.marker.visible = !!symbol;
  }

  update(dt, playerPos) {
    this.phase += dt;
    // idle breathing
    animateWalk(this.parts, this.phase * 2, 0);
    // bob the marker
    this.marker.position.y = 3.4 + Math.sin(this.phase * 2) * 0.12;
    // turn head/body toward player when close
    const dx = playerPos.x - this.position.x;
    const dz = playerPos.z - this.position.z;
    if (dx * dx + dz * dz < 36) {
      const target = Math.atan2(dx, dz);
      this.model.rotation.y += angleDelta(this.model.rotation.y, target) * Math.min(1, dt * 4);
    }
  }

  distanceTo(pos) {
    const dx = pos.x - this.position.x;
    const dz = pos.z - this.position.z;
    return Math.sqrt(dx * dx + dz * dz);
  }
}

function angleDelta(a, b) {
  let d = b - a;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}
