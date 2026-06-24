import * as THREE from 'three';

/**
 * Shared materials & helpers for the clean low-poly / cel-shaded look.
 * Uses MeshToonMaterial with a banded gradient map for that flat, comic shading.
 */

let _gradientMap = null;

/** A 3-band gradient ramp gives toon materials their cel-shaded steps. */
export function gradientMap() {
  if (_gradientMap) return _gradientMap;
  const colors = new Uint8Array([90, 90, 160, 255]); // 4 luminance steps
  const tex = new THREE.DataTexture(colors, colors.length, 1, THREE.RedFormat);
  tex.needsUpdate = true;
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  _gradientMap = tex;
  return tex;
}

/** Cel-shaded material. */
export function toon(color, opts = {}) {
  return new THREE.MeshToonMaterial({
    color,
    gradientMap: gradientMap(),
    ...opts
  });
}

/** Flat emissive-ish material for glowing neon things (bugs, screens). */
export function glow(color, intensity = 0.8) {
  return new THREE.MeshBasicMaterial({ color, toneMapped: false });
}

/**
 * Inverted-hull outline: a slightly larger black back-faced copy that reads as
 * a comic ink outline. Use for characters and hero props (not whole rooms).
 */
export function addOutline(mesh, thickness = 0.04, color = 0x0a0d12) {
  const outline = new THREE.Mesh(
    mesh.geometry,
    new THREE.MeshBasicMaterial({ color, side: THREE.BackSide })
  );
  outline.scale.multiplyScalar(1 + thickness);
  outline.raycast = () => {}; // don't interfere with picking
  mesh.add(outline);
  return outline;
}
