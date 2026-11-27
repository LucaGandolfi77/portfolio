import { execFileSync } from 'node:child_process';
import { mkdirSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const dir = fileURLToPath(new URL('../', import.meta.url));
const bin = fileURLToPath(new URL('../node_modules/.bin/gltfpack', import.meta.url));
mkdirSync(`${dir}public/models`, { recursive: true });

for (const f of readdirSync(`${dir}blender`).filter((n) => /^kit-[\w-]+\.raw\.glb$/.test(n))) {
  const out = `public/models/${f.replace('.raw', '')}`;
  execFileSync(bin, ['-i', `blender/${f}`, '-o', out, '-cc', '-kn', '-kv', '-vtf'], { cwd: dir, stdio: 'inherit' });
  console.log(`${out}: ${(statSync(`${dir}${out}`).size / 1024).toFixed(0)} kB`);
}
