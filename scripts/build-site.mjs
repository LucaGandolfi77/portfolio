#!/usr/bin/env node
/**
 * build-site.mjs — costruisce _site/, l'unico artefatto pubblicato su GitHub Pages.
 *
 * Prima il deploy caricava l'intero repository (`path: '.'`): libri, script
 * Python, progetti nativi Capacitor, keystore. Qui invece si parte da ciò che
 * è tracciato in git (mai file locali come chiavi API o node_modules) e si
 * copia solo il sito:
 *
 *   radice      index.html, games.html, projects.html, manifest.json, sw.js,
 *               robots.txt, top_buttons.js, .nojekyll
 *   cartelle    assets/, i18n/, pages/, projects/, games/
 *   mai         labs/, docs/, scripts/, tools/, config/, .github/, ...
 *
 * Dentro projects/ e games/ vengono scartati sorgenti e tooling che non
 * servono al browser (package.json, config TS/Vite/Capacitor, test, progetti
 * android/ios, copie www/, keystore, script shell/Python).
 *
 * App con build (Vite/TS): dichiarano nel proprio package.json
 *   "portfolio": { "build": "build", "test": "test", "out": "dist",
 *                  "publishAt": "verso-il-17", "basePath": true }
 * Lo script esegue `npm ci`, i test, la build e copia `out/` in
 * `_site/<publishAt>/`. Il sorgente dell'app non viene pubblicato.
 *
 * Service worker: in ogni sw.js `__BUILD_ID__` diventa lo SHA del commit;
 * i SW senza segnaposto ricevono un commento con lo SHA, così il browser
 * vede un worker nuovo a ogni deploy.
 *
 * Uso:
 *   node scripts/build-site.mjs                # build completa
 *   node scripts/build-site.mjs --skip-builds  # salta le app Vite (più veloce)
 *   BUILD_ID=abc123 node scripts/build-site.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { generateSitemap } from './lib/sitemap.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, '_site');
const SKIP_BUILDS = process.argv.includes('--skip-builds');
const BUILD_ID = (process.env.BUILD_ID || process.env.GITHUB_SHA || gitSha()).slice(0, 12);
const REPO = (process.env.GITHUB_REPOSITORY || '/portfolio').split('/').pop();

const ROOT_FILES = new Set(['index.html', 'games.html', 'projects.html', 'manifest.json', 'sw.js', 'robots.txt', 'top_buttons.js', '.nojekyll']);
const ROOT_DIRS = ['assets/', 'i18n/', 'pages/', 'projects/', 'games/'];

// Percorsi dentro projects/ e games/ che non servono al browser.
const EXCLUDE = [
  /(^|\/)(node_modules|android|ios|www|tests?|\.github|\.vscode)\//,
  /(^|\/)(package(-lock)?\.json|tsconfig[\w.-]*\.json|vite\.config\.\w+|vitest\.config\.\w+|capacitor\.config\.\w+|bubblewrap\.json|vercel\.json|twa-manifest\.json)$/,
  /(^|\/)\.(gitignore|gitattributes|env[\w.-]*|nvmrc|DS_Store)$/,
  /\.(keystore|jks|pem|key|p12|sh|py|pyc|ts|tsx|map)$/i,
  /(^|\/)(build|preview)\.mjs$/,
  /^(projects|games)\/[^/]+\/(tools|scripts|docs)\//,
  /\.md$/i
];

function gitSha() {
  try { return execFileSync('git', ['rev-parse', 'HEAD'], { cwd: ROOT, encoding: 'utf8' }).trim(); }
  catch { return 'local'; }
}

function log(msg) { console.log(`[build-site] ${msg}`); }

function trackedFiles() {
  return execFileSync('git', ['ls-files', '-z'], { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
    .split('\0').filter(Boolean)
    .filter((f) => fs.existsSync(path.join(ROOT, f)));
}

function buildApps() {
  const apps = [];
  for (const section of ['projects', 'games']) {
    for (const e of fs.readdirSync(path.join(ROOT, section), { withFileTypes: true })) {
      if (!e.isDirectory()) continue;
      const pkgPath = path.join(ROOT, section, e.name, 'package.json');
      if (!fs.existsSync(pkgPath)) continue;
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      if (pkg.portfolio && pkg.portfolio.build) apps.push({ dir: `${section}/${e.name}`, cfg: pkg.portfolio });
    }
  }
  return apps;
}

function copyFile(rel, destRel = rel) {
  const dest = path.join(OUT, destRel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(path.join(ROOT, rel), dest);
}

function npm(dir, args, env = {}) {
  log(`  ${dir}: npm ${args.join(' ')}`);
  const r = spawnSync('npm', args, { cwd: path.join(ROOT, dir), stdio: 'inherit', env: { ...process.env, ...env } });
  if (r.status !== 0) throw new Error(`npm ${args.join(' ')} failed in ${dir}`);
}

function stampServiceWorkers(dir) {
  let stamped = 0;
  const walk = (d) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) { walk(p); continue; }
      if (!/(^|[-_])sw\.js$|^service-worker\.js$/.test(e.name)) continue;
      const src = fs.readFileSync(p, 'utf8');
      const out = src.includes('__BUILD_ID__')
        ? src.replaceAll('__BUILD_ID__', BUILD_ID)
        : `// build: ${BUILD_ID}\n${src}`;
      fs.writeFileSync(p, out);
      stamped++;
    }
  };
  walk(dir);
  return stamped;
}

function dirSize(dir) {
  let bytes = 0; let files = 0;
  const walk = (d) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p); else { bytes += fs.statSync(p).size; files++; }
    }
  };
  walk(dir);
  return { bytes, files };
}

// ---------------------------------------------------------------- main
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
log(`build ${BUILD_ID} · repo /${REPO}/`);

const apps = buildApps();
const appDirs = apps.map((a) => `${a.dir}/`);

// 1) file statici tracciati
let copied = 0;
for (const f of trackedFiles()) {
  if (!(ROOT_FILES.has(f) || ROOT_DIRS.some((d) => f.startsWith(d)))) continue;
  if (appDirs.some((d) => f.startsWith(d))) continue; // pubblicate dalla loro build
  if ((f.startsWith('projects/') || f.startsWith('games/')) && EXCLUDE.some((re) => re.test(f))) continue;
  copyFile(f);
  copied++;
}
if (!fs.existsSync(path.join(OUT, '.nojekyll'))) fs.writeFileSync(path.join(OUT, '.nojekyll'), '');
log(`${copied} file statici copiati`);

// 2) app con build
for (const { dir, cfg } of apps) {
  if (SKIP_BUILDS) { log(`skip build: ${dir}`); continue; }
  log(`build app: ${dir}`);
  npm(dir, ['ci', '--no-audit', '--no-fund']);
  const env = cfg.basePath ? { BASE_PATH: `/${REPO}/${cfg.publishAt}/` } : {};
  if (cfg.test) npm(dir, ['run', cfg.test], env);
  npm(dir, ['run', cfg.build], env);
  const from = path.join(ROOT, dir, cfg.out);
  const to = path.join(OUT, cfg.publishAt);
  fs.cpSync(from, to, { recursive: true });
  // L'URL della cartella dell'app deve portare alla build pubblicata.
  const appRoot = path.join(OUT, dir);
  if (cfg.publishAt.startsWith(`${dir}/`) && !fs.existsSync(path.join(appRoot, 'index.html'))) {
    const rel = path.relative(appRoot, to).split(path.sep).join('/');
    fs.writeFileSync(path.join(appRoot, 'index.html'),
      `<!doctype html><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=./${rel}/">` +
      `<link rel="canonical" href="./${rel}/"><title>Redirect</title><a href="./${rel}/">Open app</a>\n`);
  }
}

// 3) service worker versionati
log(`${stampServiceWorkers(OUT)} service worker versionati`);

// 4) sitemap completa dal catalogo
const urls = generateSitemap({ root: ROOT, out: path.join(OUT, 'sitemap.xml') });
log(`sitemap.xml: ${urls} URL`);

const { bytes, files } = dirSize(OUT);
log(`_site/: ${files} file, ${(bytes / 1024 / 1024).toFixed(1)} MB`);
