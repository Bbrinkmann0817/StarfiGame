import { Game } from './core/Game.js';

/**
 * Operation: Go-Live – Das Büro-Abenteuer
 * Entry point: boots the game once the DOM is ready.
 */
const canvas = document.getElementById('game-canvas');
const game = new Game(canvas);

game.boot().catch((err) => {
  console.error('Boot failed:', err);
  const btn = document.getElementById('start-button');
  if (btn) btn.textContent = 'Fehler beim Laden – siehe Konsole';
});

// expose for debugging in the browser console
window.__game = game;
