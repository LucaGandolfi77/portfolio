/* Italy 3D Flight Sim — dependency-free static build for GitHub Pages / any host. */

import { cp, mkdir, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises';
import { dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SRC = dirname(fileURLToPath(import.meta.url));
const DIST = join(SRC, 'dist');
const REPO = resolve(SRC, '../..');
const BUILD_ID = process.env.BUILD_ID || process.env.GITHUB_SHA || 'dev';
const BASE_PATH = (process.env.BASE_PATH || '').replace(/\/?$/, '/');

await rm(DIST, { recursive: true, force: true });
await mkdir(DIST, { recursive: true });

for (const file of ['index.html', 'styles.css', 'manifest.webmanifest', 'sw.js']) await cp(join(SRC, file), join(DIST, file));
for (const dir of ['js', 'icons', 'data']) await cp(join(SRC, dir), join(DIST, dir), { recursive: true });
await mkdir(join(DIST, '_vendor'), { recursive: true });
await mkdir(join(DIST, '_kit'), { recursive: true });
await cp(join(REPO, 'games', '_vendor', 'three.module.js'), join(DIST, '_vendor', 'three.module.js'));
for (const file of ['core.js', 'storage.js', 'i18n.js', 'audio.js', 'pwa.js']) {
  await cp(join(REPO, 'games', '_kit', file), join(DIST, '_kit', file));
}
await cp(join(REPO, 'top_buttons.js'), join(DIST, 'top_buttons.js'));
await cp(join(REPO, 'i18n'), join(DIST, 'i18n'), { recursive: true });
await writeFile(join(DIST, '.nojekyll'), '');

for (const file of await readdir(join(DIST, 'js'))) {
  if (!file.endsWith('.js')) continue;
  const path = join(DIST, 'js', file);
  const text = await readFile(path, 'utf8');
  await writeFile(path, text
    .replaceAll("'../../_vendor/", "'../_vendor/")
    .replaceAll("'../../_kit/", "'../_kit/"));
}
const htmlPath = join(DIST, 'index.html');
await writeFile(htmlPath, (await readFile(htmlPath, 'utf8')).replaceAll('../../top_buttons.js', './top_buttons.js'));

const swPath = join(DIST, 'sw.js');
let sw = await readFile(swPath, 'utf8');
sw = sw.replace('italy-3d-flight-sim-v3', `italy-3d-flight-sim-${BUILD_ID}`)
  .replaceAll("'../_vendor/three.module.js'", "'./_vendor/three.module.js'")
  .replaceAll("'../../top_buttons.js'", "'./top_buttons.js'")
  .replaceAll("'../_kit/", "'./_kit/");
await writeFile(swPath, sw);

if (BASE_PATH !== '/') {
  const manifestPath = join(DIST, 'manifest.webmanifest');
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  manifest.start_url = `${BASE_PATH}index.html`;
  manifest.scope = BASE_PATH;
  manifest.id = BASE_PATH;
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
}

async function walk(dir, out = []) {
  for (const name of await readdir(dir)) {
    const p = join(dir, name);
    if ((await stat(p)).isDirectory()) await walk(p, out); else out.push(p);
  }
  return out;
}
const files = await walk(DIST);
let bytes = 0;
for (const f of files) bytes += (await stat(f)).size;
console.log(`Build ${BUILD_ID}: ${files.length} files, ${(bytes / 1024 / 1024).toFixed(2)} MB -> ${DIST}`);
