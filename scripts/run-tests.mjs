#!/usr/bin/env node
/**
 * run-tests.mjs — scopre ed esegue i test di ogni app in projects/ e games/.
 *
 * Convenzione (nessuna lista da mantenere a mano in CI):
 *   <app>/test(s)/*.test.{mjs,js,cjs}   -> eseguiti con `node --test`
 *   <app>/test(s)/*test*.{mjs,cjs,js}   -> script autonomi, eseguiti con `node`
 *                                          (es. logic-test.mjs, run-tests.cjs)
 * File che iniziano con "." o "_" sono helper e vengono ignorati.
 * Le app con package.json e script "test" che richiede dipendenze (Vite/TS)
 * sono testate da scripts/build-site.mjs, non qui.
 *
 * I test girano con TZ=UTC come in CI (alcuni dipendono dal fuso orario).
 *
 * Uso:
 *   node scripts/run-tests.mjs              # tutte le app
 *   node scripts/run-tests.mjs games/snake  # solo alcune app
 *   node scripts/run-tests.mjs --list       # elenca cosa verrebbe eseguito
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const argv = process.argv.slice(2);
const LIST = argv.includes('--list');
const only = argv.filter((a) => !a.startsWith('--')).map((a) => a.replace(/\/$/, ''));

function appDirs() {
  const out = [];
  for (const section of ['projects', 'games']) {
    for (const e of fs.readdirSync(path.join(ROOT, section), { withFileTypes: true })) {
      if (e.isDirectory()) out.push(`${section}/${e.name}`);
    }
  }
  return out.filter((d) => !only.length || only.includes(d));
}

function discover(app) {
  const unit = [];
  const scripts = [];
  for (const dirName of ['test', 'tests']) {
    const dir = path.join(ROOT, app, dirName);
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir).sort()) {
      if (/^[._]/.test(f) || !/\.(mjs|cjs|js)$/.test(f)) continue;
      const rel = path.join(app, dirName, f);
      if (!fs.statSync(path.join(ROOT, rel)).isFile()) continue;
      if (/\.test\.(mjs|cjs|js)$/.test(f)) unit.push(rel);
      else if (/test|spec/i.test(f)) scripts.push(rel);
    }
  }
  return { unit, scripts };
}

const results = [];
for (const app of appDirs()) {
  const { unit, scripts } = discover(app);
  if (!unit.length && !scripts.length) continue;
  if (LIST) {
    console.log(app, [...unit, ...scripts].map((f) => path.basename(f)).join(' '));
    continue;
  }
  const runs = [];
  if (unit.length) runs.push(['--test', ...unit]);
  for (const s of scripts) runs.push([s]);
  for (const args of runs) {
    const t0 = Date.now();
    const r = spawnSync(process.execPath, args, { cwd: ROOT, encoding: 'utf8', timeout: 180_000, env: { ...process.env, TZ: 'UTC' } });
    const ok = r.status === 0;
    results.push({ app, cmd: args.join(' '), ok, ms: Date.now() - t0 });
    console.log(`${ok ? 'ok  ' : 'FAIL'} ${app} :: ${args.filter((a) => a !== '--test').map((a) => path.basename(a)).join(', ')} (${Date.now() - t0} ms)`);
    if (!ok) {
      const tail = `${r.stdout || ''}\n${r.stderr || ''}`.trim().split('\n').slice(-25).join('\n');
      console.log(tail.replace(/^/gm, '      '));
    }
  }
}

if (!LIST) {
  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} test run passed`);
  process.exit(failed.length ? 1 : 0);
}
