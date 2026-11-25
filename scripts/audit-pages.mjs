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

/* App compilate da scripts/build-site.mjs ("portfolio" nel package.json):
   il loro output esiste solo in _site/, quindi i path pubblicati non si
   controllano qui (li verifica la build stessa). */
const BUILT = [];
for (const section of ['games', 'projects']) {
  for (const entry of fs.readdirSync(path.join(ROOT, section), { withFileTypes:true })) {
    const pkg = path.join(ROOT, section, entry.name, 'package.json');
    if (!entry.isDirectory() || !fs.existsSync(pkg)) continue;
    const cfg = JSON.parse(fs.readFileSync(pkg, 'utf8')).portfolio;
    if (cfg && cfg.publishAt) BUILT.push({ dir: `${section}/${entry.name}`, publishAt: cfg.publishAt });
  }
}
const ROOT_CATALOGUED = new Set(BUILT.map(b => b.dir));
const isBuilt = href => BUILT.some(b => href === b.publishAt || href.startsWith(b.publishAt + '/'));

/* ---- catalog paths ---- */
const catalogSources = ['assets/js/catalog-data.js', 'assets/js/projects-data.js'];
const catalogText = catalogSources.map(read).join('\n');
const hrefs = [...new Set([...catalogText.matchAll(/['"]((?:games|projects|verso-il-17)\/[^'"]+)['"]/g)].map(m => m[1]))].sort();

for (const href of hrefs) {
  if (isBuilt(href)) continue;
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

/* ---- nested SW hygiene ----
 * Tutte le PWA condividono l'origin lucagandolfi77.github.io: un SW che in
 * activate cancella ogni cache diversa dalla propria distrugge l'offline delle
 * altre app. Ogni cleanup deve essere limitato al proprio prefisso.
 */
for (const section of ['games', 'projects']) {
  const dir = path.join(ROOT, section);
  for (const entry of fs.readdirSync(dir, { withFileTypes:true })) {
    if (!entry.isDirectory() || entry.name.startsWith('_')) continue;
    const rel = `${section}/${entry.name}/sw.js`;
    const swPath = path.join(ROOT, rel);
    if (!fs.existsSync(swPath)) continue;
    const src = fs.readFileSync(swPath, 'utf8');
    const chain = src.match(/caches\.keys\(\)[\s\S]{0,400}?caches\.delete\(/);
    if (chain && !/startsWith|indexOf\([^)]*\)\s*[!=]==\s*0|replace\(\/-\[\^-\]\*\$\/|sameApp/.test(chain[0])) {
      add(errors, rel, 'sw-cross-app-cleanup', 'activate deletes caches of other apps on the same origin');
    }
    if (/serviceWorker\.register\(\s*['"]\//.test(src)) add(errors, rel, 'sw-absolute', 'absolute SW path breaks on GitHub Pages');
  }
}

/* ---- web app manifests ----
 * JSON valido, start_url/scope relativi (un "/" punta alla radice del dominio
 * e rompe l'installazione sotto /portfolio/), almeno un'icona per installarla.
 */
for (const section of ['games', 'projects']) {
  for (const entry of fs.readdirSync(path.join(ROOT, section), { withFileTypes:true })) {
    if (!entry.isDirectory() || entry.name.startsWith('_')) continue;
    const dir = path.join(ROOT, section, entry.name);
    for (const file of fs.readdirSync(dir)) {
      if (!/^(manifest\.json|[\w.-]*\.webmanifest)$/.test(file) || file.startsWith('legacy-')) continue;
      const rel = `${section}/${entry.name}/${file}`;
      let m;
      try { m = JSON.parse(read(rel)); } catch (e) { add(errors, rel, 'manifest-json', `invalid JSON: ${e.message}`); continue; }
      for (const key of ['start_url', 'scope', 'id']) {
        if (typeof m[key] === 'string' && m[key].startsWith('/')) add(errors, rel, 'manifest-absolute', `${key} "${m[key]}" is root-relative`);
      }
      const icons = Array.isArray(m.icons) ? m.icons : [];
      if (!icons.length) add(warnings, rel, 'manifest-icons', 'no icons: the app is not installable');
      for (const icon of icons) {
        if (!icon.src || EXTERNAL.test(icon.src)) continue;
        if (!fs.existsSync(path.resolve(dir, icon.src.split('?')[0]))) add(errors, rel, 'manifest-icon-missing', icon.src);
      }
    }
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
