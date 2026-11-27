/** Comprime con gltfpack (meshopt) ogni blender/kit-<tema>.raw.glb in public/models/kit-<tema>.glb. */
import { execFileSync } from 'node:child_process';
import { readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const dir = fileURLToPath(new URL('../', import.meta.url));
const bin = fileURLToPath(new URL('../node_modules/.bin/gltfpack', import.meta.url));
for (const f of readdirSync(`${dir}blender`).filter((n) => /^kit-[\w-]+\.raw\.glb$/.test(n))) {
  const out = `public/models/${f.replace('.raw', '')}`;
  execFileSync(bin, ['-i', `blender/${f}`, '-o', out, '-cc', '-kn', '-kv', '-vtf'], { cwd: dir, stdio: 'inherit' });
  console.log(`${out}: ${(statSync(`${dir}${out}`).size / 1024).toFixed(0)} kB`);
}
