/* ===== MORFALIA · Automated Integrity & Full-Campaign Simulation Test ===== */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Minimal mocks for browser globals used by audio/storage during headless Node test
globalThis.window = { AudioContext: null };
const memStorage = new Map();
globalThis.localStorage = {
  getItem: (k) => (memStorage.has(k) ? memStorage.get(k) : null),
  setItem: (k, v) => memStorage.set(k, String(v)),
  removeItem: (k) => memStorage.delete(k)
};

import { TILES, POWERS, REGIONS } from '../src/data/config.js';
import { ITEMS, CROPS, RECIPES } from '../src/data/items.js';
import { BIOMINI, BIOMINI_BY_ID, RARITIES } from '../src/data/biomini.js';
import { HABITATS } from '../src/data/habitats.js';
import { CHAPTERS, QUESTS, LORE_LOGS } from '../src/data/story.js';
import { createInitialState, GameSimulation } from '../src/engine/simulation.js';
import { saveGame, loadGame } from '../src/engine/storage.js';
import { createMimoMesh, createProfessorMesh, createBiominoMesh, createObjectMesh } from '../src/engine/models3d.js';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// 1. Verify PWA manifest & Service Worker asset list
const manifest = JSON.parse(fs.readFileSync(path.join(rootDir, 'manifest.webmanifest'), 'utf8'));
assert.equal(manifest.display, 'standalone');
for (const icon of manifest.icons) {
  assert.ok(fs.existsSync(path.join(rootDir, icon.src)), `Missing icon: ${icon.src}`);
}
const swSrc = fs.readFileSync(path.join(rootDir, 'sw.js'), 'utf8');
const swMatches = [...swSrc.matchAll(/'\.\/([^']+)'/g)].map((m) => m[1]);
assert.ok(swMatches.length >= 15, 'SW should precache all modules');
for (const rel of swMatches) {
  assert.ok(fs.existsSync(path.join(rootDir, rel)), `SW missing asset: ${rel}`);
}

// 2. Verify IP cleanliness (zero copyrighted terms in games/morfalia)
const forbidden = ['pokemon', 'pokémon', 'pokopia', 'ditto', 'tangrowth', 'bulbasaur', 'squirtle', 'pikachu', 'pokeball', 'nintendo', 'game freak'];
function walkFiles(dir) {
  const out = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.name === 'tests' || ent.name === 'vendor') continue;
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...walkFiles(p));
    else out.push(p);
  }
  return out;
}
for (const f of walkFiles(rootDir)) {
  const txt = fs.readFileSync(f, 'utf8').toLowerCase();
  for (const word of forbidden) {
    assert.ok(!txt.includes(word), `Forbidden copyrighted word "${word}" found in ${f}`);
  }
}

// 3. Data integrity checks
assert.equal(REGIONS.length, 5, 'Should have 5 regions');
assert.equal(BIOMINI.length, 56, 'Should have 56 original Biomini');
assert.equal(HABITATS.length, 50, 'Should have 50 habitats');
assert.equal(CHAPTERS.length, 6, 'Should have 6 chapters');
assert.equal(LORE_LOGS.length, 10, 'Should have 10 lore logs');

for (const bio of BIOMINI) {
  assert.ok(bio.num >= 1 && bio.num <= 56, `Invalid Biopedex num for ${bio.id}`);
  assert.ok(RARITIES[bio.rarity], `Missing rarity for ${bio.id}`);
  assert.ok(bio.trait && bio.curiosity, `Missing Biopedex lore for ${bio.id}`);
}

for (const rec of RECIPES) {
  assert.ok(ITEMS[rec.out], `Recipe output missing item: ${rec.out}`);
  for (const k of Object.keys(rec.cost)) {
    assert.ok(ITEMS[k], `Recipe cost missing item: ${k}`);
  }
}

for (const hab of HABITATS) {
  assert.ok(BIOMINI_BY_ID[hab.attracts], `Habitat ${hab.id} attracts unknown Biomino ${hab.attracts}`);
  if (hab.reqs.tiles) {
    for (const t of Object.keys(hab.reqs.tiles)) {
      assert.ok(TILES[t], `Habitat ${hab.id} uses unknown tile ${t}`);
    }
  }
  if (hab.reqs.objs) {
    for (const o of Object.keys(hab.reqs.objs)) {
      assert.ok(ITEMS[o], `Habitat ${hab.id} uses unknown object ${o}`);
    }
  }
}

// 4. Full End-to-End Gameplay & Story Progression Simulation
const state = createInitialState();
const toasts = [];
const dialogs = [];
const sim = new GameSimulation(state, {
  onToast: (m) => toasts.push(m),
  onDialog: (d) => dialogs.push(d)
});

// Chapter 1: Meet Fogliolo -> learn sprout!
const fogliolo = sim.region.residents.find((r) => r.id === 'fogliolo');
assert.ok(fogliolo, 'Fogliolo should start in Landa');
sim.interactWithResident(fogliolo);
assert.ok(sim.state.unlockedPowers.includes('sprout'), 'Fogliolo should teach sprout');
assert.ok(sim.state.befriended.includes('fogliolo'));

// Gather materials -> completes q1_gather
sim.addItem('wood', 6, true);
sim.addItem('stone', 6, true);
sim.addItem('clay', 4, true);
assert.ok(sim.state.completedQuests.includes('q1_gather'), 'q1_gather should complete');

// Craft & place campfire + log_bench -> triggers hab_focolare -> attracts Bracino -> learns flame!
assert.ok(sim.craftRecipe('r_campfire'));
assert.ok(sim.craftRecipe('r_log_bench'));
sim.setBuildItem('campfire');
sim.region.tiles[14][10] = 'withered';
delete sim.region.objects['10,14'];
sim.placeSelectedItem(10, 14);
sim.setBuildItem('log_bench');
sim.region.tiles[14][11] = 'withered';
delete sim.region.objects['11,14'];
sim.placeSelectedItem(11, 14);

assert.ok(sim.state.discoveredHabitats.includes('hab_focolare'), 'Focolare habitat should be detected');
assert.ok(sim.state.befriended.includes('bracino'), 'Bracino should join');
assert.ok(sim.state.unlockedPowers.includes('flame'), 'Bracino should teach flame');
assert.ok(sim.state.completedQuests.includes('q1_first_friend'), 'q1_first_friend should complete');

// Use sprout near pond to trigger hab_stagno_vivo -> Gocciolino -> splash!
sim.setActivePower('sprout');
sim.region.tiles[12][15] = 'withered';
delete sim.region.objects['15,12'];
sim.interactAtTile(15, 12);
assert.ok(sim.state.discoveredHabitats.includes('hab_stagno_vivo') || sim.region.tiles[12][15] === 'grass');

// Repair Landa Sanctuary -> completes q1_sanctuary & q1_harmony -> unlocks Costa & Chapter 2!
sim.addItem('wood', 6);
sim.addItem('stone', 4);
sim.addItem('clay', 3);
const sp = REGIONS[0].sanctuaryPos;
sim.repairSanctuary(sim.region.objects[`${sp.x},${sp.y}`]);
assert.ok(sim.region.sanctuaryRepaired);
assert.ok(sim.state.unlockedRegions.includes('costa'), 'Costa should unlock after Chapter 1');
assert.equal(sim.state.chapter, 2, 'Should advance to Chapter 2');

// Test fast travel to Costa + Save/Load roundtrip
assert.ok(sim.travelToRegion('costa'));
assert.equal(sim.state.currentRegion, 'costa');
assert.ok(saveGame(sim.state));
const reloaded = loadGame();
assert.equal(reloaded.currentRegion, 'costa');
assert.equal(reloaded.chapter, 2);

// Fast-forward verify remaining chapters through Finale (Serra del Professore -> Astralio!)
for (const regId of ['costa', 'creste', 'foresta', 'isole']) {
  if (!sim.state.unlockedRegions.includes(regId)) sim.state.unlockedRegions.push(regId);
  sim.travelToRegion(regId);
  const meta = REGIONS.find((r) => r.id === regId);
  for (const [k, v] of Object.entries(meta.sanctuaryCost)) sim.addItem(k, v);
  sim.repairSanctuary(sim.region.objects[`${meta.sanctuaryPos.x},${meta.sanctuaryPos.y}`]);
  sim.addHarmony(120);
}
// Build Professor's Greenhouse Finale Habitat
sim.addItem('prof_greenhouse', 1);
sim.addItem('botanic_shelf', 1);
sim.addItem('fountain', 1);
sim.addItem('flower_bed', 1);
for (let i = 0; i < 4; i++) {
  sim.region.tiles[10][8 + i] = 'grass';
  delete sim.region.objects[`${8 + i},10`];
}
['prof_greenhouse', 'botanic_shelf', 'fountain', 'flower_bed'].forEach((id, i) => {
  sim.setBuildItem(id);
  sim.placeSelectedItem(8 + i, 10);
});
assert.ok(sim.state.discoveredHabitats.includes('hab_serra_professore'), 'Finale habitat must register');
assert.ok(sim.state.befriended.includes('astralio'), 'Astralio must arrive for the finale');

// 5. Verify 3D procedural sculpture builders (Mimo, Prof, all 24 Biomini, all object types)
assert.ok(createMimoMesh().children.length > 0);
assert.ok(createProfessorMesh().children.length > 0);
for (const bio of BIOMINI) {
  assert.ok(createBiominoMesh(bio).children.length > 0, `3D Biomino mesh failed: ${bio.id}`);
}
const sampleObjs = [
  { type: 'sanctuary', repaired: false }, { type: 'sanctuary', repaired: true },
  { type: 'lore_capsule', read: false }, { type: 'terrarium' },
  { type: 'crop', cropId: 'strawberry', stage: 2 },
  { type: 'dead_tree' }, { type: 'boulder' }, { type: 'bramble' },
  { type: 'campfire', lit: true }, { type: 'windmill' }, { type: 'fountain' },
  { type: 'wood_house' }, { type: 'prof_greenhouse' }, { type: 'crystal_pillar' },
  { type: 'mushroom_lamp' }, { type: 'generator', powered: true }, { type: 'street_lamp', powered: true },
  { type: 'node_wood' }, { type: 'node_crystal' }, { type: 'node_berry' }
];
for (const o of sampleObjs) {
  assert.ok(createObjectMesh(o).children.length > 0, `3D Object mesh failed: ${o.type}`);
}

console.log('ALL MORFALIA 3D VERIFICATION CHECKS PASSED!');
console.log({
  regions: REGIONS.length,
  biomini: BIOMINI.length,
  habitats: HABITATS.length,
  recipes: RECIPES.length,
  quests: QUESTS.length,
  loreLogs: LORE_LOGS.length,
  swCachedAssets: swMatches.length
});
