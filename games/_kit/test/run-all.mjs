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

const projectsData = readFileSync(join(REPO, 'assets/js/projects-data.js'), 'utf8');
const projectPaths = [
  ...[...catalog.matchAll(/'projects\/([^']+)'/g)].map(m => m[1]),
  ...[...projectsData.matchAll(/"projects\/([^"]+)"/g)].map(m => m[1])
];
const missingProjectPaths = projectPaths.filter(p => !existsSync(join(REPO, 'projects', p)));
if (missingProjectPaths.length) {
  failed++;
  console.error('Missing project catalog paths:', missingProjectPaths);
}

// Ogni legacy-*.html dentro una cartella deve essere uno stub PWA verso index.html.
let stubsChecked = 0;
for (const section of ['games', 'projects']) {
  const dirs = readdirSync(join(REPO, section), { withFileTypes: true }).filter(d => d.isDirectory() && !d.name.startsWith('_'));
  for (const dir of dirs) {
    const gameDir = join(REPO, section, dir.name);
    for (const name of readdirSync(gameDir).filter(f => /^legacy-.*\.html$/.test(f))) {
      const html = readFileSync(join(gameDir, name), 'utf8');
      const suffix = name.replace(/\.html$/, '');
      const pwaOk = existsSync(join(gameDir, `${suffix}.webmanifest`)) &&
        existsSync(join(gameDir, `${suffix}-sw.js`)) &&
        html.includes(`./${suffix}.webmanifest`) && html.includes(`./${suffix}-sw.js`);
      const targetOk = existsSync(join(gameDir, 'index.html')) && html.includes('./index.html');
      if (!pwaOk || !targetOk) {
        failed++;
        console.error(`Invalid PWA redirect stub: ${section}/${dir.name}/${name}`);
      } else stubsChecked++;
    }
  }
}

// Stub storici alla radice di games/ (es. watermelon.html) devono puntare a una pagina esistente.
for (const name of readdirSync(join(REPO, 'games')).filter(f => f.endsWith('.html') && f !== 'index.html')) {
  const html = readFileSync(join(REPO, 'games', name), 'utf8');
  const target = html.match(/content="\d+\s*;\s*url=(\.\/[^"']+\.html)"/)?.[1];
  if (!target || !existsSync(join(REPO, 'games', target))) {
    failed++;
    console.error(`Invalid root redirect stub: games/${name}`);
  } else stubsChecked++;
}

let swChecked = 0;
const swFiles = [
  ...walk(ROOT).filter(p => /-sw\.js$|\/sw\.js$/.test(p)),
  ...walk(join(REPO, 'projects')).filter(p => /-sw\.js$|\/sw\.js$/.test(p) &&
    !p.includes('node_modules') && !p.includes('/dist/'))
];
for (const sw of swFiles) {
  const base = join(sw, '..');
  const text = readFileSync(sw, 'utf8');
  const assets = [...text.matchAll(/'(\.\.?\/[^']+)'/g)].map(m => m[1]);
  const missing = assets.filter(a => !existsSync(join(base, a)));
  if (missing.length) {
    failed++;
    console.error(`SW precache gaps in ${relative(REPO, sw)}:`, missing);
  } else swChecked++;
}

console.log(`\n${passed} tests passed across ${suites} suites · ${gamePaths.length} game + ${projectPaths.length} project catalog paths · ${stubsChecked} redirect stubs · ${swChecked} service workers clean`);
if (failed) { console.error(`${failed} failure(s)`); process.exit(1); }
