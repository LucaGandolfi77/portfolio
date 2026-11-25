/* Guard: the deployed entry point must actually wire the CelloOS modules.
   Regression covered: commit 2660e02 added the OS files but left index.html
   pointing at the retired single-window app, producing "PAGES is not defined"
   on GitHub Pages. */
import { test, ok, summary } from '../../../games/_kit/test-harness.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const html = fs.readFileSync(path.join(DIR, 'index.html'), 'utf8');
const sw = fs.readFileSync(path.join(DIR, 'sw.js'), 'utf8');

const MODULES = [
  'pages.js', 'js/core/bus.js', 'js/core/state.js', 'js/core/vfs.js', 'js/core/html.js',
  'js/wm.js', 'js/apps/browser.js', 'js/apps/files.js', 'js/apps/notepad.js',
  'js/apps/settings.js', 'js/apps/about.js', 'js/apps/terminal.js', 'js/apps/calculator.js',
  'js/shell.js', 'js/main.js'
];
const IDS = [
  'boot', 'desktop', 'desktop-icons', 'windows', 'taskbar', 'start-btn', 'start-menu',
  'start-apps', 'start-docs', 'task-buttons', 'tray-sound', 'tray-notify', 'notify-badge',
  'notify-list', 'notify-clear', 'notify-panel', 'clock', 'os-modal', 'os-modal-title',
  'os-modal-text', 'os-modal-actions', 'os-toast', 'lock-screen', 'lock-on'
];

let passed = 0, total = 0;
const run = (name, fn) => { total++; if (test(name, fn)) passed++; };

run('entry point loads every CelloOS module', () => {
  MODULES.forEach(m => {
    ok(html.includes('src="./' + m + '"'), 'missing script tag: ' + m);
    ok(fs.existsSync(path.join(DIR, m)), 'missing file: ' + m);
  });
});
run('entry point does not load the retired app.js', () => ok(!html.includes('app.js')));
run('entry point provides all DOM hooks used by the OS', () => {
  IDS.forEach(id => ok(html.includes('id="' + id + '"'), 'missing #' + id));
});
run('entry point wires manifest and service worker', () => {
  ok(html.includes('rel="manifest"') && html.includes('href="./manifest.webmanifest"'));
  ok(html.includes("register('./sw.js'"));
});
run('service worker cache is versioned', () => ok(/const CACHE = 'cello-os-v\d+'/.test(sw)));
run('service worker precaches every OS module', () => {
  MODULES.forEach(m => ok(sw.includes("'./" + m + "'"), 'not precached: ' + m));
});

summary(passed, total);
