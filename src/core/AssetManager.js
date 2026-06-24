import * as THREE from 'three';

/**
 * Loads optional user-supplied assets (office photos, 360° panoramas) and
 * reports progress. The game runs fully with procedural placeholders, so the
 * queue may be empty — in that case loading resolves immediately.
 *
 * To add real assets later, drop files into /public/assets/** and queue them
 * here (or set a zone's `panorama` path in src/data/rooms.js).
 */
export class AssetManager {
  constructor() {
    this.manager = new THREE.LoadingManager();
    this.texLoader = new THREE.TextureLoader(this.manager);
    this.textures = {};
    this._queue = [];
    this.onProgress = null; // (ratio 0..1) => void
  }

  /** Queue a flat texture (poster, logo, photo) to load before start. */
  queueTexture(key, url) {
    this._queue.push({ key, url });
    return this;
  }

  getTexture(key) {
    return this.textures[key] || null;
  }

  /** Load everything queued; resolves when done (or immediately if empty). */
  load() {
    return new Promise((resolve) => {
      const total = this._queue.length;
      if (total === 0) {
        this.onProgress?.(1);
        resolve();
        return;
      }

      let loaded = 0;
      const tick = () => {
        loaded++;
        this.onProgress?.(loaded / total);
        if (loaded >= total) resolve();
      };

      for (const { key, url } of this._queue) {
        this.texLoader.load(
          url,
          (tex) => {
            tex.colorSpace = THREE.SRGBColorSpace;
            this.textures[key] = tex;
            tick();
          },
          undefined,
          () => {
            // Missing asset is non-fatal: keep going with placeholders.
            console.warn(`[assets] could not load ${url} — using placeholder.`);
            tick();
          }
        );
      }
    });
  }
}
