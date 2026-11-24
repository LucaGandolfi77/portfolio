#!/usr/bin/env node
/* Audit that every catalogued project/game is reachable on GitHub Pages.
   No dependencies. Usage: node scripts/audit-pages.mjs [--json] */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const JSON_ONLY = process.argv.includes('--json');
const SKIP_DIRS = new Set(['node_modules', 'dist', 'build', 'coverage', '.git', 'public', 'src', 'www']);
const EXTERNAL = /^(?:https?:|\/\/|data:|blob:|mailto:|javascript:|about:|chrome:|tel:)/i;
const errors = [], warnings = [], info = [];
const add = (level, file, code, message) => level.push(`${file}::${code}::${message}`);

const read = rel => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const exists = rel => fs.existsSync(path.join(ROOT, rel));
const ROOT_CATALOGUED = new Set(['projects/verso-il-17']);

/* ---- catalog paths ---- */
const catalogSources = ['assets/js/catalog-data.js', 'assets/js/projects-data.js'];
const catalogText = catalogSources.map(read).join('\n');
const hrefs = [...new Set([...catalogText.matchAll(/['"]((?:games|projects)\/[^'"]+)['"]/g)].map(m => m[1]))].sort();

for (const href of hrefs) {
  let target = path.join(ROOT, href);
  if (fs.existsSync(target) && fs.statSync(target).isDirectory()) target = path.join(target, 'index.html');
  if (!fs.existsSync(target)) add(errors, href, 'catalog-path', 'catalog path does not resolve to an HTML file');
}

/* ---- pages present on disk but not catalogued ---- */
for (const section of ['games', 'projects']) {
  const dir = path.join(ROOT, section);
  for (const entry of fs.readdirSync(dir, { withFileTypes:true })) {
    if (!entry.isDirectory() || entry.name.startsWith('_') || SKIP_DIRS.has(entry.name)) continue;
    const rel = `${section}/${entry.name}`;
    if (ROOT_CATALOGUED.has(rel) || hrefs.some(h => h.startsWith(rel + '/'))) continue;
    if (fs.existsSync(path.join(dir, entry.name, 'index.html')))
      add(warnings, rel, 'not-catalogued', 'index.html exists but no catalog entry links to it');
    else
      add(info, rel, 'no-web-page', 'directory has no index.html (source or assets only)');
  }
}

/* ---- local src/href resolution in catalogued pages ---- */
const SKIP_HTML = /(?:^|\/)(?:public|src|dist|node_modules)\//;
for (const href of hrefs) {
  let rel = href;
  let abs = path.join(ROOT, rel);
  if (fs.existsSync(abs) && fs.statSync(abs).isDirectory()) rel = path.join(rel, 'index.html');
  if (!exists(rel) || SKIP_HTML.test(rel)) continue;
  const html = read(rel);
  for (const m of html.matchAll(/(?:src|href)="([^"]+)"/gi)) {
    const url = m[1].trim();
    if (!url || EXTERNAL.test(url) || url.startsWith('#') || url.includes('${') || /['"`+]/.test(url)) continue;
    const clean = url.split('?')[0].split('#')[0];
    if (!clean) continue;
    if (clean.startsWith('/')) { add(errors, rel, 'absolute-root-asset', `root-relative path breaks under /portfolio/: ${clean}`); continue; }
    const target = path.resolve(path.dirname(path.join(ROOT, rel)), clean);
    if (!fs.existsSync(target) && !clean.includes('${')) add(errors, rel, 'missing-local-asset', clean);
  }
}

/* ---- legacy redirect stubs ---- */
for (const section of ['games', 'projects']) {
  const dir = path.join(ROOT, section);
  for (const entry of fs.readdirSync(dir, { withFileTypes:true })) {
    if (!entry.isDirectory() || entry.name.startsWith('_')) continue;
    for (const file of fs.readdirSync(path.join(dir, entry.name))) {
      if (!/^legacy-.*\.html$/.test(file)) continue;
      const rel = `${section}/${entry.name}/${file}`;
      const html = read(rel);
      const suffix = file.replace(/\.html$/, '');
      const pwaOk = exists(`${section}/${entry.name}/${suffix}.webmanifest`) && exists(`${section}/${entry.name}/${suffix}-sw.js`) &&
        html.includes(`./${suffix}.webmanifest`) && html.includes(`./${suffix}-sw.js`);
      if (!pwaOk) add(errors, rel, 'legacy-pwa', 'legacy stub must reference its manifest and service worker');
      if (!html.includes('./index.html')) add(errors, rel, 'legacy-target', 'legacy stub must point to ./index.html');
    }
  }
}

/* ---- root SW allowlist coverage ---- */
const rootSw = read('sw.js');
const prefixes = [...rootSw.matchAll(/cacheName\.indexOf\('([^']+)'\)\s*===\s*0/g)].map(m => m[1]);
for (const section of ['games', 'projects']) {
  const dir = path.join(ROOT, section);
  for (const entry of fs.readdirSync(dir, { withFileTypes:true })) {
    if (!entry.isDirectory() || entry.name.startsWith('_')) continue;
    const swPath = path.join(dir, entry.name, 'sw.js');
    if (!fs.existsSync(swPath)) continue;
    const m = fs.readFileSync(swPath, 'utf8').match(/const CACHE\s*=\s*'([^']+)'/);
    if (!m) continue;
    const prefix = m[1].replace(/-v\d+.*$/, '-').replace(/^(?:pf-)?/, 'pf-');
    const cacheName = m[1];
    const covered = prefixes.some(p => cacheName.startsWith(p.replace(/-$/, '-')) || cacheName.startsWith(prefix));
    if (!covered) add(warnings, `${section}/${entry.name}/sw.js`, 'sw-allowlist', `cache ${cacheName} not covered by root sw.js allowlist`);
  }
}

const report = { generatedAt:new Date().toISOString(), catalogPaths:hrefs.length, errors, warnings, info };
if (!JSON_ONLY) {
  console.log(`Catalog paths: ${hrefs.length}`);
  console.log(`Errors: ${errors.length} · Warnings: ${warnings.length} · Info: ${info.length}`);
  for (const line of [...errors.map(e => '  [error] ' + e), ...warnings.map(w => '  [warn] ' + w)]) console.log(line);
}
if (JSON_ONLY) {
  const out = path.join(ROOT, 'reports');
  fs.mkdirSync(out, { recursive:true });
  fs.writeFileSync(path.join(out, 'pages-health.json'), JSON.stringify(report, null, 2));
  console.log(`Wrote reports/pages-health.json (${errors.length} errors)`);
}
if (errors.length) process.exitCode = 1;
