#!/usr/bin/env node
/**
 * check-syntax.mjs — `node --check` su tutto il JavaScript pubblicato.
 *
 * Sostituisce le liste di file scritte a mano in quality.yml: ogni nuovo file
 * in projects/, games/, assets/ o scripts/ viene controllato in automatico.
 * Esclusi: librerie vendorizzate/minificate, output di build e progetti nativi.
 *
 * Uso: node scripts/check-syntax.mjs [--verbose]
 */
import path from 'node:path';
import os from 'node:os';
import { execFileSync, spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const VERBOSE = process.argv.includes('--verbose');

const SKIP = [
  /(^|\/)(node_modules|dist|build|www|android|ios|vendor|_vendor|site\/assets)\//,
  /\.min\.js$/,
  /(^|\/)(three|pixi|phaser|gsap)[\w.-]*\.js$/i,
  /^labs\//
];

const files = execFileSync('git', ['ls-files', '-z', '--', '*.js', '*.mjs', '*.cjs'], { cwd: ROOT, encoding: 'utf8' })
  .split('\0')
  .filter(Boolean)
  .filter((f) => !SKIP.some((re) => re.test(f)));

function check(file) {
  return new Promise((resolve) => {
    const p = spawn(process.execPath, ['--check', file], { cwd: ROOT });
    let err = '';
    p.stderr.on('data', (d) => { err += d; });
    p.on('close', (code) => resolve({ file, ok: code === 0, err }));
  });
}

const queue = [...files];
const failures = [];
const workers = Array.from({ length: Math.max(2, os.cpus().length) }, async () => {
  while (queue.length) {
    const r = await check(queue.shift());
    if (!r.ok) failures.push(r);
    else if (VERBOSE) console.log('ok', r.file);
  }
});
await Promise.all(workers);

for (const f of failures.sort((a, b) => a.file.localeCompare(b.file))) {
  console.log(`FAIL ${f.file}\n${f.err.trim().split('\n').slice(0, 6).join('\n').replace(/^/gm, '     ')}`);
}
console.log(`${files.length - failures.length}/${files.length} file JS sintatticamente validi`);
process.exit(failures.length ? 1 : 0);
