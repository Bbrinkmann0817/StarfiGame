/**
 * Keyboard + mouse input with pointer-lock support for the third-person camera.
 *
 * - `isDown(code)`     → continuous key state (movement)
 * - `wasPressed(code)` → single-fire edge for the current frame (actions)
 * - `consumeMouse()`   → accumulated pointer-lock delta since last call
 *
 * Call `endFrame()` once per frame (after update) to clear edge state.
 */
export class Input {
  constructor(canvas) {
    this.canvas = canvas;
    this.keys = new Set();
    this.justPressed = new Set();
    this.mouseDX = 0;
    this.mouseDY = 0;
    this.pointerLocked = false;
    this.enabled = true;

    this._onKeyDown = (e) => {
      if (!this.enabled) return;
      // Avoid hijacking browser shortcuts with modifiers.
      if (e.metaKey || e.ctrlKey) return;
      if (['Tab', 'Space'].includes(e.code)) e.preventDefault();
      if (!e.repeat) this.justPressed.add(e.code);
      this.keys.add(e.code);
    };
    this._onKeyUp = (e) => this.keys.delete(e.code);
    this._onMouseMove = (e) => {
      if (this.pointerLocked) {
        this.mouseDX += e.movementX || 0;
        this.mouseDY += e.movementY || 0;
      }
    };
    this._onLockChange = () => {
      this.pointerLocked = document.pointerLockElement === this.canvas;
    };
    this._onBlur = () => this.keys.clear();

    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);
    window.addEventListener('mousemove', this._onMouseMove);
    document.addEventListener('pointerlockchange', this._onLockChange);
    window.addEventListener('blur', this._onBlur);
  }

  isDown(code) {
    return this.keys.has(code);
  }

  /** True only on the first frame the key went down. */
  wasPressed(code) {
    return this.justPressed.has(code);
  }

  /** Any of the supplied codes pressed this frame. */
  anyPressed(...codes) {
    return codes.some((c) => this.justPressed.has(c));
  }

  consumeMouse() {
    const d = { dx: this.mouseDX, dy: this.mouseDY };
    this.mouseDX = 0;
    this.mouseDY = 0;
    return d;
  }

  requestPointerLock() {
    if (!this.pointerLocked && this.canvas.requestPointerLock) {
      this.canvas.requestPointerLock();
    }
  }

  exitPointerLock() {
    if (this.pointerLocked && document.exitPointerLock) {
      document.exitPointerLock();
    }
  }

  endFrame() {
    this.justPressed.clear();
  }

  dispose() {
    window.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('keyup', this._onKeyUp);
    window.removeEventListener('mousemove', this._onMouseMove);
    document.removeEventListener('pointerlockchange', this._onLockChange);
    window.removeEventListener('blur', this._onBlur);
  }
}
