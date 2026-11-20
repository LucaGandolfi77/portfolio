/* Run every game logic test + structural audit (no dependencies) */

import { spawnSync } from 'node:child_process';
import { readdirSync, existsSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = new URL('../../', import.meta.url).pathname;
const REPO = new URL('../../../', import.meta.url).pathname;

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

const tests = walk(ROOT)
  .filter(p => /\/test\/[^/]+\.mjs$/.test(p) && !p.endsWith('run-all.mjs'))
  .sort();

let passed = 0, failed = 0, suites = 0;
for (const test of tests) {
  const r = spawnSync(process.execPath, [test], { encoding: 'utf8' });
  const output = (r.stdout || '') + (r.stderr || '');
  const match = output.match(/(\d+)\/(\d+) tests passed/);
  if (r.status === 0 && match) {
    passed += Number(match[1]); suites++;
    console.log(`  ok  ${relative(REPO, test)} (${match[1]}/${match[2]})`);
  } else {
    failed++;
    console.error(`FAIL  ${relative(REPO, test)}\n${output.slice(0, 400)}`);
  }
}

// catalog + service worker audit
const catalog = readFileSync(join(REPO, 'assets/js/catalog-data.js'), 'utf8');
const gamePaths = [...catalog.matchAll(/'games\/([^']+)'/g)].map(m => m[1]);
const missingPaths = gamePaths.filter(p => !existsSync(join(REPO, 'games', p)));
if (missingPaths.length) {
  failed++;
  console.error('Missing catalog paths:', missingPaths);
}

let swChecked = 0;
for (const sw of walk(ROOT).filter(p => /-sw\.js$|\/sw\.js$/.test(p))) {
  const base = sw.endsWith('-sw.js') ? join(REPO, 'games') : join(sw, '..');
  const text = readFileSync(sw, 'utf8');
  const assets = [...text.matchAll(/'(\.\.?\/[^']+)'/g)].map(m => m[1]);
  const missing = assets.filter(a => !existsSync(join(base, a)));
  if (missing.length) {
    failed++;
    console.error(`SW precache gaps in ${relative(REPO, sw)}:`, missing);
  } else swChecked++;
}

console.log(`\n${passed} tests passed across ${suites} suites · ${gamePaths.length} catalog paths · ${swChecked} service workers clean`);
if (failed) { console.error(`${failed} failure(s)`); process.exit(1); }
