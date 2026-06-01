/**
 * Generates pixel-art capybara PNG icons for the PWA.
 * Run: node scripts/gen-icons.mjs
 * Requires no external deps — uses built-in zlib.
 */
import { deflateSync } from 'zlib';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '..', 'public');
mkdirSync(OUT, { recursive: true });

// ─── CRC32 (needed for PNG chunks) ────────────────────────────────────────
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const lenBuf = Buffer.alloc(4); lenBuf.writeUInt32BE(data.length);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf  = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])));
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

// ─── Pixel art capybara (12×14 grid) ──────────────────────────────────────
const _ = null;
const A = [0xa0, 0x78, 0x48]; // body brown
const B = [0x7b, 0x58, 0x30]; // dark brown
const C = [0xd4, 0xb8, 0x96]; // cream
const D = [0x1a, 0x08, 0x00]; // dark
const BG = [0xff, 0xfd, 0xf9]; // background

const GRID = [
  [_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,A,A,A,A,A,A,_,_,_],
  [_,_,A,_,A,A,A,A,_,A,_,_],
  [_,_,A,A,A,A,A,A,A,A,_,_],
  [_,_,A,A,D,_,_,D,A,A,_,_],
  [_,_,A,A,A,D,_,A,A,A,_,_],
  [_,_,A,A,A,A,A,A,A,A,_,_],
  [_,A,A,A,A,A,A,A,A,A,A,_],
  [_,A,A,C,C,C,C,C,C,C,A,_],
  [_,A,A,C,C,C,C,C,C,C,A,_],
  [_,A,A,A,A,A,A,A,A,A,A,_],
  [_,_,A,B,_,_,_,_,B,A,_,_],
  [_,_,_,B,_,_,_,_,B,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_],
];

const GRID_W = 12;
const GRID_H = 14;

function makePNG(outputSize) {
  const scale = Math.floor(outputSize / Math.max(GRID_W, GRID_H));
  const imgW = GRID_W * scale;
  const imgH = GRID_H * scale;

  // Raw RGBA pixel data with filter bytes
  const rawSize = imgH * (1 + imgW * 4);
  const raw = Buffer.alloc(rawSize, 0xff);

  for (let gy = 0; gy < GRID_H; gy++) {
    for (let gx = 0; gx < GRID_W; gx++) {
      const color = GRID[gy][gx] ?? BG;
      for (let sy = 0; sy < scale; sy++) {
        for (let sx = 0; sx < scale; sx++) {
          const py = gy * scale + sy;
          const px = gx * scale + sx;
          const off = py * (1 + imgW * 4) + 1 + px * 4;
          raw[off]     = color[0]; // R
          raw[off + 1] = color[1]; // G
          raw[off + 2] = color[2]; // B
          raw[off + 3] = 0xff;     // A
        }
      }
    }
    // Set filter bytes to 0 (None)
    for (let ry = 0; ry < scale; ry++) {
      raw[(gy * scale + ry) * (1 + imgW * 4)] = 0;
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(imgW, 0);
  ihdr.writeUInt32BE(imgH, 4);
  ihdr[8]  = 8; // bit depth
  ihdr[9]  = 6; // color type: RGBA
  ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;

  const idat = deflateSync(raw, { level: 6 });

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), // PNG signature
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', idat),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

writeFileSync(join(OUT, 'icon-192.png'), makePNG(192));
writeFileSync(join(OUT, 'icon-512.png'), makePNG(512));
console.log('✅ Icons written to public/icon-192.png and public/icon-512.png');
