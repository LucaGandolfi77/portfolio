/* Italy 2D Flight Sim — dependency-free static build for GitHub Pages / any host.
   Produces a self-contained dist/: the game plus the shared kit modules and the
   site top bar are copied in, so no relative path escapes the deployed folder. */

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

for (const file of ['index.html', 'styles.css', 'manifest.webmanifest', 'sw.js']) {
  await cp(join(SRC, file), join(DIST, file));
}
for (const dir of ['js', 'icons']) {
  await cp(join(SRC, dir), join(DIST, dir), { recursive: true });
}
await mkdir(join(DIST, '_kit'), { recursive: true });
for (const file of ['core.js', 'storage.js', 'i18n.js', 'audio.js', 'pwa.js']) {
  await cp(join(REPO, 'games', '_kit', file), join(DIST, '_kit', file));
}
await cp(join(REPO, 'top_buttons.js'), join(DIST, 'top_buttons.js'));
await writeFile(join(DIST, '.nojekyll'), '');

// ES modules live in dist/js/, kit modules in dist/_kit/.
for (const file of await readdir(join(DIST, 'js'))) {
  if (!file.endsWith('.js')) continue;
  const path = join(DIST, 'js', file);
  const text = await readFile(path, 'utf8');
  await writeFile(path, text.replaceAll("'../../_kit/", "'../_kit/"));
}

const htmlPath = join(DIST, 'index.html');
const html = await readFile(htmlPath, 'utf8');
await writeFile(htmlPath, html.replaceAll('../../top_buttons.js', './top_buttons.js'));

const swPath = join(DIST, 'sw.js');
let sw = await readFile(swPath, 'utf8');
sw = sw.replace('italy-2d-flight-sim-v1', `italy-2d-flight-sim-${BUILD_ID}`)
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
    const path = join(dir, name);
    if ((await stat(path)).isDirectory()) await walk(path, out);
    else out.push(path);
  }
  return out;
}

const files = await walk(DIST);
let bytes = 0;
for (const file of files) {
  bytes += (await stat(file)).size;
  console.log('  ' + file.slice(DIST.length + 1));
}
console.log(`\nBuild ${BUILD_ID}: ${files.length} files, ${(bytes / 1024).toFixed(1)} KB -> ${DIST}`);
