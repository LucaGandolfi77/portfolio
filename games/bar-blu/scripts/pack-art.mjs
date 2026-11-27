#!/usr/bin/env node
/* Turns the Blender renders (blender/out/*.png) into the WebP backgrounds the game loads (art/*.webp). Needs cwebp. */
import { execFileSync } from 'node:child_process';
import { readdirSync, mkdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'blender', 'out');
const OUT = join(ROOT, 'art');
mkdirSync(OUT, { recursive: true });
let total = 0;
for (const f of readdirSync(SRC).filter((n) => n.endsWith('.png'))) {
  const out = join(OUT, f.replace(/\.png$/, '.webp'));
  execFileSync('cwebp', ['-quiet', '-q', '78', '-m', '6', '-sharp_yuv', join(SRC, f), '-o', out]);
  const kb = statSync(out).size / 1024;
  total += kb;
  console.log(`${f.padEnd(22)} → ${kb.toFixed(0)} KB`);
}
console.log(`total ${total.toFixed(0)} KB`);
