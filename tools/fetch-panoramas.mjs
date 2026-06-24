/**
 * Tooling: download & stitch 360° cube-face panoramas from the Star Finanz
 * 3DVista office tour (https://tours.nexpics.com/star-finanz-gmbh/) into single
 * per-face JPEGs the game can load as a Three.js CubeTexture skybox.
 *
 * The tour stores each panorama as 6 tiled cube faces (f/b/l/r/u/d). At a given
 * zoom level each face is a grid of 512px tiles. We fetch the tiles and stitch
 * them with `sharp` into one image per face.
 *
 * Usage:  node tools/fetch-panoramas.mjs
 * Output: public/assets/panoramas/<room>/{f,b,l,r,u,d}.jpg
 *
 * This only needs to be run once (or when you want to refresh/raise quality).
 * Re-run with a different LEVEL for more/less resolution.
 */
import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_ROOT = resolve(__dirname, '../public/assets/panoramas');
const BASE = 'https://tours.nexpics.com/star-finanz-gmbh/media';

// Zoom level → face grid. Tiles are 512px. From the tour config:
//   level 0: 8x8 (4096² face)   level 1: 4x4 (2048²)
//   level 2: 2x2 (1024²)        level 3: 1x1 (512²)
const LEVEL = 1; // 2048² faces — crisp enough to stand inside
const GRID = { 0: 8, 1: 4, 2: 2, 3: 1 }[LEVEL];
const TILE = 512;
const FACES = ['f', 'b', 'l', 'r', 'u', 'd'];

// Game room id → tour panorama id (derived from the tour's IMG_* labels).
const ROOMS = {
  eingang: 'panorama_77A1DB5B_5838_72CD_41CC_A4E9507F77F4', // IMG_1618-A-Eingang_01
  wap: 'panorama_21A67425_2B72_7724_41C4_D94202386316', // IMG_4238-C_4.OG-WAP_001
  meetingraum: 'panorama_F725ED0A_E4C8_5628_41DE_20C64D068AF5', // IMG_3694-Speicherstadt_01
  starcafe: 'panorama_21AB09AF_2B76_D124_41C5_2DB3911ECFCD', // IMG_4134-Starcafe_001
  lounge: 'panorama_215428C3_2B9E_3F5C_4199_D24FD14E293F' // IMG_4778-Loungebereich_01
};

async function fetchTile(panoId, face, row, col) {
  const url = `${BASE}/${panoId}_0/${face}/${LEVEL}/${row}_${col}.jpg`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

async function buildFace(panoId, face) {
  const size = GRID * TILE;
  const composites = [];
  for (let row = 0; row < GRID; row++) {
    for (let col = 0; col < GRID; col++) {
      const buf = await fetchTile(panoId, face, row, col);
      composites.push({ input: buf, left: col * TILE, top: row * TILE });
    }
  }
  return sharp({
    create: { width: size, height: size, channels: 3, background: { r: 0, g: 0, b: 0 } }
  })
    .composite(composites)
    .jpeg({ quality: 88 })
    .toBuffer();
}

async function run() {
  console.log(`Fetching panoramas at level ${LEVEL} (${GRID * TILE}² per face)…`);
  for (const [room, panoId] of Object.entries(ROOMS)) {
    const dir = resolve(OUT_ROOT, room);
    await mkdir(dir, { recursive: true });
    process.stdout.write(`\n${room}: `);
    for (const face of FACES) {
      const jpg = await buildFace(panoId, face);
      await writeFile(resolve(dir, `${face}.jpg`), jpg);
      process.stdout.write(`${face} `);
    }
  }
  console.log('\n\nDone. Faces saved under public/assets/panoramas/<room>/.');
}

run().catch((err) => {
  console.error('\nFailed:', err.message);
  process.exit(1);
});
