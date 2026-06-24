import * as THREE from 'three';
import { toon, addOutline } from '../world/materials.js';

/**
 * Builds a chunky low-poly humanoid used for the player and NPCs.
 * Returns the root group plus limb references so callers can animate a walk.
 * Feet rest at y = 0.
 */
export function buildCharacter(color, { outline = true, skin = 0xf2c8a0 } = {}) {
  const group = new THREE.Group();
  const bodyMat = toon(color);
  const skinMat = toon(skin);
  const darkMat = toon(0x2b2f3a);

  // Legs (pivot at hip so they can swing)
  const legGeo = new THREE.BoxGeometry(0.26, 0.7, 0.26);
  const mkLeg = (x) => {
    const pivot = new THREE.Group();
    pivot.position.set(x, 0.7, 0);
    const mesh = new THREE.Mesh(legGeo, darkMat);
    mesh.position.y = -0.35;
    mesh.castShadow = true;
    pivot.add(mesh);
    group.add(pivot);
    return pivot;
  };
  const leftLeg = mkLeg(-0.16);
  const rightLeg = mkLeg(0.16);

  // Torso
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.8, 0.36), bodyMat);
  torso.position.y = 1.12;
  torso.castShadow = true;
  group.add(torso);

  // Arms (pivot at shoulder)
  const armGeo = new THREE.BoxGeometry(0.18, 0.66, 0.18);
  const mkArm = (x) => {
    const pivot = new THREE.Group();
    pivot.position.set(x, 1.45, 0);
    const mesh = new THREE.Mesh(armGeo, bodyMat);
    mesh.position.y = -0.33;
    mesh.castShadow = true;
    pivot.add(mesh);
    group.add(pivot);
    return pivot;
  };
  const leftArm = mkArm(-0.42);
  const rightArm = mkArm(0.42);

  // Head
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), skinMat);
  head.position.y = 1.82;
  head.castShadow = true;
  group.add(head);

  // Simple hair/cap for silhouette
  const cap = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.18, 0.54), darkMat);
  cap.position.y = 2.05;
  group.add(cap);

  if (outline) {
    [torso, head].forEach((m) => addOutline(m, 0.05));
  }

  return { group, leftLeg, rightLeg, leftArm, rightArm, head, torso };
}

/** Animate a walk cycle. `speed01` is 0..1 of max speed; `phase` accumulates. */
export function animateWalk(parts, phase, speed01) {
  const swing = Math.sin(phase) * 0.6 * speed01;
  parts.leftLeg.rotation.x = swing;
  parts.rightLeg.rotation.x = -swing;
  parts.leftArm.rotation.x = -swing;
  parts.rightArm.rotation.x = swing;
  // subtle idle breathing when still
  const idle = (1 - speed01) * Math.sin(phase * 0.4) * 0.04;
  parts.torso.position.y = 1.12 + idle;
}
