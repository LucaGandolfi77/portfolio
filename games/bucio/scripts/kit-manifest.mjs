/**
 * Scrive blender/manifest.json per blender/build_kit.py: per ogni
 * ambientazione la palette completa (base + ritocchi del tema) e gli oggetti
 * che vi compaiono. Così Blender cuoce ogni oggetto con i colori giusti del
 * tema in cui finisce, senza tenere due copie della palette.
 */
import { writeFileSync } from 'node:fs';
import { P } from '../src/world/palette.js';
import { THEMES, THEME_IDS } from '../src/world/themes.js';
import { PropWorld } from '../src/world/propworld.js';

const base = { ...P };
const out = {};
for (const id of THEME_IDS) {
  out[id] = {
    palette: { ...base, ...THEMES[id].palette },
    props: PropWorld.defsFor(id).map((d) => d.id),
  };
}
const file = new URL('../blender/manifest.json', import.meta.url);
writeFileSync(file, JSON.stringify(out, null, 1) + '\n');
console.log(`manifest: ${THEME_IDS.length} ambientazioni, ${Object.values(out).reduce((n, t) => n + t.props.length, 0)} oggetti`);
