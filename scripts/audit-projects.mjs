#!/usr/bin/env node
/**
 * audit-projects.mjs — controllo statico di /projects.
 *
 * Non richiede dipendenze. Controlla:
 *  - sintassi degli script inline (node --check)
 *  - riferimenti locali mancanti
 *  - ID duplicati, immagini senza alt, viewport/lang/h1
 *  - user-scalable=no / maximum-scale=1
 *  - CDN non pinnate, handler inline, target=_blank senza noopener
 *  - doppia barra (top_buttons.js + Project Shell)
 *  - chiavi localStorage fuori convenzione
 *
 * Uso:
 *   node scripts/audit-projects.mjs
 *   node scripts/audit-projects.mjs --strict
 *   node scripts/audit-projects.mjs --json
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const PROJECTS_ROOT = path.resolve(REPO_ROOT, 'projects');
const REPORTS_DIR = path.resolve(REPO_ROOT, 'reports');

const args = new Set(process.argv.slice(2));
const STRICT = args.has('--strict');
const FAIL_ON_WARNINGS = args.has('--fail-on-warnings');
const JSON_ONLY = args.has('--json');
const UPDATE_BASELINE = args.has('--update-baseline');
const baselineArg = [...args].find((arg) => arg.startsWith('--baseline='));
const BASELINE_PATH = path.resolve(
  REPO_ROOT,
  baselineArg ? baselineArg.slice('--baseline='.length) : 'tools/quality/audit-baseline.json'
);

const SKIP_DIRS = new Set([
  'node_modules',
  'dist',
  'build',
  '.git',
  '.next',
  'coverage',
  'public' // spesso copia di build/source: evita doppi conteggi
]);

const ALLOWED_STORAGE_KEYS = new Set([
  'lang',
  'site_lang',
  'theme',
  'index_scroll',
  'projects_scroll',
  'cookie_consent',
  'cookies'
]);

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pf-audit-'));

function walk(dir, out = []) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      walk(path.join(dir, entry.name), out);
    } else if (/\.html?$/i.test(entry.name)) {
      out.push(path.join(dir, entry.name));
    }
  }
  return out;
}

function lineOf(source, index) {
  if (index < 0) return 0;
  return source.slice(0, index).split('\n').length;
}

function add(issues, severity, code, message, line = 0) {
  issues.push({ severity, code, message, line });
}

function getTitle(source) {
  const m = source.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return m ? m[1].replace(/\s+/g, ' ').trim() : '';
}

function getAttr(source, re) {
  const m = source.match(re);
  return m ? (m[1] || '').trim() : '';
}

function checkScriptSyntax(issues, code, isModule, fileLabel, index) {
  const name = `chunk-${path.basename(fileLabel).replace(/[^\w.-]+/g, '_')}-${index}.${isModule ? 'mjs' : 'js'}`;
  const tmp = path.join(tmpDir, name);
  try {
    fs.writeFileSync(tmp, code, 'utf8');
    const res = spawnSync(process.execPath, ['--check', tmp], {
      encoding: 'utf8',
      timeout: 15000
    });
    if (res.status !== 0) {
      const detail = (res.stderr || res.stdout || '').split('\n').filter(Boolean).slice(0, 3).join(' | ');
      add(issues, 'error', 'js-syntax', `Script inline non valido: ${detail}`, lineOf('', 0));
    }
  } catch (err) {
    add(issues, 'error', 'js-syntax', `Impossibile controllare lo script: ${err.message}`);
  } finally {
    try { fs.unlinkSync(tmp); } catch { /* ignore */ }
  }
}

function checkCdn(url) {
  let u;
  try { u = new URL(url); } catch { return null; }
  if (u.hostname === 'unpkg.com') {
    const first = u.pathname.split('/').filter(Boolean)[0] || '';
    if (!first.includes('@') || /@(latest|next|beta|canary)\b/i.test(first)) {
      return 'unpkg senza versione esatta';
    }
  }
  if (u.hostname === 'cdn.jsdelivr.net') {
    const parts = u.pathname.split('/').filter(Boolean);
    if (parts[0] === 'npm') {
      const first = parts[1] || '';
      const second = parts[2] || '';
      const pinned = first.startsWith('@')
        ? second.includes('@')
        : first.includes('@');
      if (!pinned || /@(latest|next|beta|canary)\b/i.test(first + '/' + second)) {
        return 'jsDelivr npm senza versione esatta';
      }
    }
  }
  if (u.hostname === 'cdnjs.cloudflare.com') {
    const parts = u.pathname.split('/').filter(Boolean);
    if (parts[0] === 'ajax' && parts[1] === 'libs') {
      const version = parts[3] || '';
      if (!version || !/\d/.test(version)) return 'cdnjs senza versione';
    }
  }
  return null;
}

/**
 * The folder of a Vite app, when `file` is its index.html. Vite serves what is
 * in public/ from the page's own folder and resolves /src/… from the app root.
 */
function viteRoot(file) {
  const dir = path.dirname(file);
  if (path.basename(file) !== 'index.html') return null;
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf8'));
    return pkg.dependencies?.vite || pkg.devDependencies?.vite ? dir : null;
  } catch {
    return null;
  }
}

/** A Vite page registers its service worker from the bundled sources. */
function registersFromSources(app) {
  const entry = path.join(app, 'src', 'main.ts');
  return fs.existsSync(entry) && /serviceWorker\.register/.test(fs.readFileSync(entry, 'utf8'));
}

function analyse(file) {
  const source = fs.readFileSync(file, 'utf8');
  const rel = path.relative(REPO_ROOT, file).split(path.sep).join('/');
  const issues = [];

  const title = getTitle(source);
  const lang = getAttr(source, /<html\b[^>]*\blang\s*=\s*["']([^"']+)["']/i);
  const viewport = /<meta\b[^>]*name\s*=\s*["']viewport["']/i.test(source);
  const description = getAttr(source, /<meta\b[^>]*name\s*=\s*["']description["'][^>]*content\s*=\s*["']([^"']*)["']/i)
    || getAttr(source, /<meta\b[^>]*content\s*=\s*["']([^"']*)["'][^>]*name\s*=\s*["']description["']/i);
  const h1Count = (source.match(/<h1\b/gi) || []).length;
  const canonical = /<link\b[^>]*rel\s*=\s*["']canonical["']/i.test(source);
  const manifest = /<link\b[^>]*rel\s*=\s*["']manifest["']/i.test(source) || /rel=["']manifest["']/i.test(source);
  const app = viteRoot(file);
  const serviceWorker = /serviceWorker/.test(source) || (!!app && registersFromSources(app));
  const topButtons = /top_buttons\.js/.test(source);
  const projectShell = /data-project-shell/.test(source);
  const inlineScripts = [];
  const scriptRe = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  let sm;
  let scriptIndex = 0;
  while ((sm = scriptRe.exec(source))) {
    const attrs = sm[1] || '';
    const code = sm[2] || '';
    if (/\bsrc\s*=/i.test(attrs)) continue;
    if (/type\s*=\s*["'](?:application\/(?:ld\+)?json|importmap|text\/template|text\/x-handlebars-template)["']/i.test(attrs)) continue;
    const isModule = /type\s*=\s*["']module["']/i.test(attrs);
    inlineScripts.push({ code, isModule });
    checkScriptSyntax(issues, code, isModule, rel, scriptIndex++);
  }

  // Riferimenti locali
  const refRe = /\b(?:src|href|poster)\s*=\s*("([^"]*)"|'([^']*)')/gi;
  let rm;
  const seenRefs = new Set();
  while ((rm = refRe.exec(source))) {
    const raw = (rm[2] ?? rm[3] ?? '').trim();
    if (!raw || seenRefs.has(raw)) continue;
    seenRefs.add(raw);
    if (/^(?:https?:|\/\/|data:|blob:|mailto:|tel:|javascript:|about:|#|\$\{)/i.test(raw)) continue;
    // Riferimenti costruiti a runtime (template string, concatenazioni): non
    // sono verificabili staticamente.
    if (/[+'"`]/.test(raw)) continue;
    const clean = raw.split('#')[0].split('?')[0];
    if (!clean) continue;
    let target;
    const absolute = clean.startsWith('/');
    if (absolute) {
      // I path assoluti dipendono dalla base del deploy (GitHub Pages / Vite):
      // non sono errori statici, al massimo un'informazione.
      target = path.resolve(REPO_ROOT, clean.slice(1));
    } else {
      target = path.resolve(path.dirname(file), clean);
    }
    const fromVite = !!app && fs.existsSync(path.join(app, absolute ? '' : 'public', clean.replace(/^\//, '')));
    if (!fs.existsSync(target) && !fromVite) {
      add(issues, absolute ? 'info' : 'error', absolute ? 'absolute-ref' : 'missing-ref',
        `Riferimento locale ${absolute ? 'assoluto ' : ''}non trovato: ${raw}`, lineOf(source, rm.index));
    }
    const cdnIssue = checkCdn(raw);
    if (cdnIssue) {
      add(issues, 'warning', 'cdn-unpinned', `${cdnIssue}: ${raw}`, lineOf(source, rm.index));
    }
  }

  // CDN anche nei link/script non catturati? Il loop sopra copre src/href.
  for (const m of source.matchAll(/url\((['"]?)(https?:\/\/[^)'"]+)\1\)/gi)) {
    const cdnIssue = checkCdn(m[2]);
    if (cdnIssue) add(issues, 'warning', 'cdn-unpinned', `${cdnIssue}: ${m[2]}`, lineOf(source, m.index));
  }

  // ID duplicati
  const ids = new Map();
  for (const m of source.matchAll(/\bid\s*=\s*("([^"]*)"|'([^']*)')/gi)) {
    const value = m[2] ?? m[3] ?? '';
    if (!value || value.includes('${')) continue;
    ids.set(value, (ids.get(value) || 0) + 1);
  }
  for (const [id, count] of ids) {
    if (count > 1) {
      add(issues, 'error', 'duplicate-id', `ID duplicato (${count}x): ${id}`);
    }
  }

  // Immagini senza alt
  for (const m of source.matchAll(/<img\b[^>]*>/gi)) {
    if (!/\balt\s*=/i.test(m[0])) {
      add(issues, 'warning', 'img-alt', 'Immagine senza attributo alt', lineOf(source, m.index));
    }
  }

  // Zoom bloccato
  if (/user-scalable\s*=\s*no/i.test(source) || /maximum-scale\s*=\s*1(?:\.0+)?\b/i.test(source)) {
    add(issues, 'warning', 'zoom-blocked', 'Viewport blocca lo zoom (user-scalable=no / maximum-scale=1)');
  }

  // Handler inline
  for (const m of source.matchAll(/<[a-z][^>]*>/gi)) {
    const tag = m[0];
    if (/^<script\b/i.test(tag)) continue;
    if (/\son[a-z]+\s*=/i.test(tag)) {
      add(issues, 'warning', 'inline-handler', 'Handler inline (onclick, onload, ...) nella pagina', lineOf(source, m.index));
      break;
    }
  }

  // target=_blank senza noopener
  for (const m of source.matchAll(/<a\b[^>]*target\s*=\s*["']_blank["'][^>]*>/gi)) {
    if (!/rel\s*=\s*["'][^"']*noopener/i.test(m[0])) {
      add(issues, 'warning', 'target-blank', 'target="_blank" senza rel="noopener"', lineOf(source, m.index));
    }
  }

  // Chiavi storage
  const storageKeys = new Set();
  for (const m of source.matchAll(/localStorage\.(?:getItem|setItem|removeItem)\(\s*['"]([^'"]+)['"]/g)) {
    const key = m[1];
    storageKeys.add(key);
    if (!key.startsWith('pf.') && !ALLOWED_STORAGE_KEYS.has(key)) {
      add(issues, 'info', 'storage-key', `Chiave localStorage fuori convenzione: ${key}`);
    }
  }

  // Base quality
  if (!title) add(issues, 'warning', 'title', 'Titolo mancante');
  if (!lang) add(issues, 'warning', 'lang', 'Attributo lang mancante su <html>');
  if (!viewport) add(issues, 'warning', 'viewport', 'Meta viewport mancante');
  if (h1Count === 0) add(issues, 'warning', 'h1', 'Nessun <h1>');
  if (h1Count > 1) add(issues, 'warning', 'h1-multiple', `${h1Count} tag <h1> nella pagina`);
  if (!description) add(issues, 'info', 'description', 'Meta description mancante');
  if (projectShell && topButtons) add(issues, 'warning', 'double-chrome', 'Presenti sia Project Shell sia top_buttons.js');
  if (projectShell && !/projects\/_shared\/shell\.js/.test(source) && !/\.\.\/_shared\/shell\.js/.test(source)) {
    add(issues, 'warning', 'shell-script', 'Project Shell senza script shell.js');
  }
  if (manifest && !serviceWorker) add(issues, 'info', 'pwa-sw', 'Manifest senza registrazione service worker');
  if (serviceWorker && !manifest) add(issues, 'info', 'pwa-manifest', 'Service worker senza manifest');
  if (!canonical) add(issues, 'info', 'canonical', 'Link canonical mancante');

  return {
    file: rel,
    title,
    lang,
    viewport,
    h1Count,
    description: Boolean(description),
    manifest,
    serviceWorker,
    topButtons,
    projectShell,
    canonical,
    scriptCount: inlineScripts.length,
    storageKeys: [...storageKeys],
    issues,
    summary: {
      errors: issues.filter((i) => i.severity === 'error').length,
      warnings: issues.filter((i) => i.severity === 'warning').length,
      info: issues.filter((i) => i.severity === 'info').length
    }
  };
}

function countBy(issues, key) {
  const map = new Map();
  for (const issue of issues) map.set(issue[key], (map.get(issue[key]) || 0) + 1);
  return [...map.entries()].sort((a, b) => b[1] - a[1]);
}

function fingerprint(file, issue) {
  return `${file}::${issue.code}::${issue.message}`;
}

function compareBaseline(analysed, totals) {
  const current = analysed.flatMap((file) =>
    file.issues.map((issue) => ({ file: file.file, issue, key: fingerprint(file.file, issue) }))
  );
  const currentKeys = new Set(current.map((entry) => entry.key));

  if (UPDATE_BASELINE) {
    const baseline = {
      generatedAt: new Date().toISOString(),
      totals,
      issues: [...currentKeys].sort()
    };
    fs.mkdirSync(path.dirname(BASELINE_PATH), { recursive: true });
    fs.writeFileSync(BASELINE_PATH, JSON.stringify(baseline, null, 2) + '\n');
    console.log(`Baseline aggiornata: ${path.relative(REPO_ROOT, BASELINE_PATH)} (${currentKeys.size} problemi)`);
    return;
  }

  if (!fs.existsSync(BASELINE_PATH)) {
    console.error(`Baseline non trovata: ${path.relative(REPO_ROOT, BASELINE_PATH)}`);
    process.exitCode = 1;
    return;
  }

  const baseline = JSON.parse(fs.readFileSync(BASELINE_PATH, 'utf8'));
  const known = new Set(Array.isArray(baseline.issues) ? baseline.issues : []);
  const added = current.filter((entry) => !known.has(entry.key));
  const fixed = [...known].filter((key) => !currentKeys.has(key)).length;

  console.log(
    `Baseline audit: ${added.length} nuovi problemi, ${fixed} risolti (${path.relative(REPO_ROOT, BASELINE_PATH)})`
  );
  if (added.length) {
    console.log('Nuovi problemi rispetto alla baseline:');
    for (const entry of added) {
      const line = entry.issue.line ? `riga ${entry.issue.line}: ` : '';
      console.log(`  [${entry.issue.severity}] ${entry.file} — ${line}${entry.issue.code}: ${entry.issue.message}`);
    }
    process.exitCode = 1;
  }
}

function toMarkdown(result) {
  const files = result.files.slice().sort((a, b) => {
    const diff = (b.summary.errors * 10 + b.summary.warnings) - (a.summary.errors * 10 + a.summary.warnings);
    return diff || a.file.localeCompare(b.file);
  });
  const lines = [];
  lines.push('# Projects health report');
  lines.push('');
  lines.push(`Generato: ${result.generatedAt}`);
  lines.push(`Radice: \`${result.root}\``);
  lines.push(`File analizzati: **${result.files.length}**`);
  lines.push('');
  lines.push('## Riepilogo');
  lines.push('');
  lines.push('| Gravità | Conteggio |');
  lines.push('|---|---:|');
  lines.push(`| Errori | ${result.totals.errors} |`);
  lines.push(`| Warning | ${result.totals.warnings} |`);
  lines.push(`| Info | ${result.totals.info} |`);
  lines.push('');
  lines.push('## Problemi per codice');
  lines.push('');
  lines.push('| Codice | Gravità | Conteggio |');
  lines.push('|---|---|---:|');
  for (const [code, count] of result.codes) {
    const severity = result.codeSeverity.get(code) || 'info';
    lines.push(`| \`${code}\` | ${severity} | ${count} |`);
  }
  lines.push('');
  lines.push('## File con errori');
  lines.push('');
  const errorFiles = files.filter((f) => f.summary.errors > 0);
  if (!errorFiles.length) {
    lines.push('Nessun errore.');
  } else {
    lines.push('| File | Errori | Warning | Info |');
    lines.push('|---|---:|---:|---:|');
    for (const f of errorFiles) {
      lines.push(`| \`${f.file}\` | ${f.summary.errors} | ${f.summary.warnings} | ${f.summary.info} |`);
    }
  }
  lines.push('');
  lines.push('## Dettaglio errori');
  lines.push('');
  if (!errorFiles.length) {
    lines.push('Nessun errore.');
  } else {
    for (const f of errorFiles) {
      lines.push(`### \`${f.file}\``);
      for (const issue of f.issues.filter((i) => i.severity === 'error')) {
        lines.push(`- ${issue.line ? `riga ${issue.line}: ` : ''}\`${issue.code}\` — ${issue.message}`);
      }
      lines.push('');
    }
  }
  lines.push('## Tabella salute');
  lines.push('');
  lines.push('| File | Errori | Warning | Info | H1 | Viewport | Shell |');
  lines.push('|---|---:|---:|---:|---:|---|---|');
  for (const f of files) {
    lines.push(`| \`${f.file}\` | ${f.summary.errors} | ${f.summary.warnings} | ${f.summary.info} | ${f.h1Count} | ${f.viewport ? 'sì' : 'no'} | ${f.projectShell ? 'sì' : '—'} |`);
  }
  lines.push('');
  lines.push('_Report completo: `reports/projects-health.json`._');
  return lines.join('\n');
}

function main() {
  if (!fs.existsSync(PROJECTS_ROOT)) {
    console.error(`Cartella non trovata: ${PROJECTS_ROOT}`);
    process.exit(1);
  }

  const files = walk(PROJECTS_ROOT);
  const analysed = files.map(analyse);
  const allIssues = analysed.flatMap((f) => f.issues);
  const totals = {
    errors: allIssues.filter((i) => i.severity === 'error').length,
    warnings: allIssues.filter((i) => i.severity === 'warning').length,
    info: allIssues.filter((i) => i.severity === 'info').length
  };
  const codes = countBy(allIssues, 'code');
  const codeSeverity = new Map();
  for (const issue of allIssues) if (!codeSeverity.has(issue.code)) codeSeverity.set(issue.code, issue.severity);

  const result = {
    generatedAt: new Date().toISOString(),
    root: path.relative(REPO_ROOT, PROJECTS_ROOT).split(path.sep).join('/'),
    totals,
    codes,
    codeSeverity,
    files: analysed
  };

  if (JSON_ONLY) {
    process.stdout.write(JSON.stringify(result, null, 2) + '\n');
  } else {
    fs.mkdirSync(REPORTS_DIR, { recursive: true });
    const jsonPath = path.join(REPORTS_DIR, 'projects-health.json');
    const mdPath = path.join(REPORTS_DIR, 'projects-health.md');
    fs.writeFileSync(jsonPath, JSON.stringify(result, null, 2) + '\n');
    fs.writeFileSync(mdPath, toMarkdown(result) + '\n');
    console.log('Projects health report');
    console.log(`  file: ${analysed.length}`);
    console.log(`  errori: ${totals.errors}`);
    console.log(`  warning: ${totals.warnings}`);
    console.log(`  info: ${totals.info}`);
    console.log(`  report: ${path.relative(REPO_ROOT, jsonPath)}`);
    console.log(`  report: ${path.relative(REPO_ROOT, mdPath)}`);
    if (totals.errors > 0) {
      console.log('\nFile con errori:');
      for (const f of analysed.filter((x) => x.summary.errors > 0)) {
        console.log(`  ${f.file} (${f.summary.errors})`);
      }
    }
  }

  try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch { /* ignore */ }

  if (UPDATE_BASELINE || baselineArg) compareBaseline(analysed, totals);

  if (STRICT && totals.errors > 0) process.exitCode = 1;
  if (FAIL_ON_WARNINGS && (totals.errors > 0 || totals.warnings > 0)) process.exitCode = 1;
}

main();
