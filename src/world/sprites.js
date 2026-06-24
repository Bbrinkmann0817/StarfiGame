import * as THREE from 'three';

/**
 * Canvas-based billboard sprites for floating labels and status markers.
 * These always face the camera and keep text crisp without external fonts.
 */
export function makeTextSprite(text, opts = {}) {
  const {
    color = '#e6edf3',
    bg = 'rgba(13,17,23,0.85)',
    border = '#30363d',
    font = 700,
    size = 64,
    padding = 18
  } = opts;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx.font = `${font} ${size}px Segoe UI, system-ui, sans-serif`;
  const metrics = ctx.measureText(text);
  const w = Math.ceil(metrics.width) + padding * 2;
  const h = size + padding * 2;
  canvas.width = w;
  canvas.height = h;

  // re-set after resize (resizing clears the context)
  ctx.font = `${font} ${size}px Segoe UI, system-ui, sans-serif`;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';

  roundRect(ctx, 2, 2, w - 4, h - 4, 16);
  ctx.fillStyle = bg;
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = border;
  ctx.stroke();

  ctx.fillStyle = color;
  ctx.fillText(text, w / 2, h / 2 + 2);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: true })
  );
  const aspect = w / h;
  const scale = 0.9;
  sprite.scale.set(scale * aspect, scale, 1);
  sprite.userData.canvas = canvas;
  sprite.userData.ctx = ctx;
  sprite.userData.texture = tex;
  return sprite;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
