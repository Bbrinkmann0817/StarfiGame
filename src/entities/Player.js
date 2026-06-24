import * as THREE from 'three';
import { buildCharacter, animateWalk } from './character.js';

/**
 * Third-person player: movement relative to the camera yaw, sprinting,
 * wall collision (delegated to World), and a simple walk animation.
 */
export class Player {
  constructor(scene, world, spawn) {
    this.world = world;
    this.radius = 0.45;
    this.baseSpeed = 6.5;
    this.speedMul = 1; // permanent upgrades (espresso)
    this.sprintMul = 1.8;
    this.sprintBoost = 0; // temporary boost timer from coffee pickups

    const built = buildCharacter(0x00e5ff);
    this.model = built.group;
    this.parts = built;
    this.model.position.set(spawn.x, 0, spawn.z);
    this.heading = spawn.heading ?? 0;
    this.model.rotation.y = this.heading;
    scene.add(this.model);

    this.velocity = new THREE.Vector3();
    this.walkPhase = 0;
    this.moving = false;
  }

  get position() {
    return this.model.position;
  }

  /** @returns {number} current movement speed including all modifiers. */
  currentSpeed(sprinting) {
    let s = this.baseSpeed * this.speedMul;
    if (sprinting) s *= this.sprintMul;
    if (this.sprintBoost > 0) s *= 1.25;
    return s;
  }

  update(dt, input, cameraYaw) {
    // --- gather input direction relative to camera ---
    let ix = 0;
    let iz = 0;
    if (input.isDown('KeyW') || input.isDown('ArrowUp')) iz -= 1;
    if (input.isDown('KeyS') || input.isDown('ArrowDown')) iz += 1;
    if (input.isDown('KeyA') || input.isDown('ArrowLeft')) ix -= 1;
    if (input.isDown('KeyD') || input.isDown('ArrowRight')) ix += 1;

    const sprinting = input.isDown('ShiftLeft') || input.isDown('ShiftRight');
    if (this.sprintBoost > 0) this.sprintBoost -= dt;

    let dir = new THREE.Vector3(ix, 0, iz);
    this.moving = dir.lengthSq() > 0;

    if (this.moving) {
      dir.normalize();
      // rotate input by camera yaw so "forward" is where the camera looks
      const sin = Math.sin(cameraYaw);
      const cos = Math.cos(cameraYaw);
      const wx = dir.x * cos - dir.z * sin;
      const wz = dir.x * sin + dir.z * cos;
      const speed = this.currentSpeed(sprinting);

      const desiredX = this.position.x + wx * speed * dt;
      const desiredZ = this.position.z + wz * speed * dt;
      const resolved = this.world.resolveCollision(desiredX, desiredZ, this.radius);
      this.position.x = resolved.x;
      this.position.z = resolved.z;

      // face movement direction (smoothly)
      const targetHeading = Math.atan2(wx, wz);
      this.heading = lerpAngle(this.heading, targetHeading, 1 - Math.pow(0.001, dt));

      this.walkPhase += dt * speed * 1.1;
    } else {
      this.walkPhase += dt * 2;
    }

    this.model.rotation.y = this.heading;
    const speed01 = this.moving ? (sprinting ? 1 : 0.6) : 0;
    animateWalk(this.parts, this.walkPhase, speed01);
  }

  setPosition(x, z) {
    this.position.x = x;
    this.position.z = z;
  }

  grantSprintBoost(seconds = 6) {
    this.sprintBoost = Math.max(this.sprintBoost, seconds);
  }
}

/** Shortest-path angle lerp. */
function lerpAngle(a, b, t) {
  let diff = b - a;
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  return a + diff * t;
}
