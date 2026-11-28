#!/usr/bin/env node
/* Turns the painted renders (blender/out/*.png) into art/*.webp. Needs cwebp.
   The lagoon (world.png, 1.5 pixels per map unit) becomes sharp tiles to walk
   on, world-0…5, and one small world.webp for the minimap and the atlas. */
import { execFileSync } from 'node:child_process';
import { readdirSync, mkdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { WORLD } from '../js/world/layout.js';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'blender', 'out');
const OUT = join(ROOT, 'art');
const TILE = 1024, SHARP = 1.5;
mkdirSync(OUT, { recursive: true });
let total = 0;
function pack(source, name, extra = [], quality = '78') {
  const out = join(OUT, `${name}.webp`);
  execFileSync('cwebp', ['-quiet', '-q', quality, '-m', '6', '-sharp_yuv', ...extra, source, '-o', out]);
  const kb = statSync(out).size / 1024;
  total += kb;
  console.log(`${`${name}.webp`.padEnd(22)} → ${kb.toFixed(0)} KB`);
}
for (const f of readdirSync(SRC).filter((n) => n.endsWith('.png'))) {
  const source = join(SRC, f);
  if (f !== 'world.png') { pack(source, f.replace(/\.png$/, '')); continue; }
  // the PNG header holds the size at bytes 16–23
  const head = execFileSync('head', ['-c', '24', source]);
  const width = head.readUInt32BE(16);
  if (width !== WORLD.w * SHARP) throw new Error(`world.png is ${width} px wide, expected ${WORLD.w * SHARP}`);
  pack(source, 'world', ['-resize', '1024', '1536']);
  const size = TILE * SHARP, columns = WORLD.w / TILE, rows = WORLD.h / TILE;
  for (let i = 0; i < columns * rows; i++) pack(source, `world-${i}`, ['-crop', String((i % columns) * size), String(Math.floor(i / columns) * size), String(size), String(size)], '74');
}
console.log(`total ${total.toFixed(0)} KB`);
