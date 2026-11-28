/* ===== MORFALIA · Core Simulation Engine ===== */
import {
  MAP_W, MAP_H, DAY_LENGTH_SECONDS, TILES, POWERS, REGIONS, WEATHERS, getTimePeriod, getHarmonyLevel
} from '../data/config.js';
import { ITEMS, CROPS, RECIPES } from '../data/items.js';
import { BIOMINI_BY_ID } from '../data/biomini.js';
import { HABITATS } from '../data/habitats.js';
import { CHAPTERS, QUESTS, LORE_LOGS } from '../data/story.js';
import { generateRegionWorld, replenishRegionNodes } from './worldgen.js';
import { sound } from './audio.js';
import { saveGame } from './storage.js';

export const NODE_DROPS = {
  node_wood: { item: 'wood', qty: 2, label: 'Rami raccolti' },
  node_stone: { item: 'stone', qty: 2, label: 'Pietre raccolte' },
  node_clay: { item: 'clay', qty: 2, label: 'Argilla raccolta' },
  node_berry: { item: 'berry', qty: 2, label: 'Bacche raccolte' },
  node_herb: { item: 'herb', qty: 2, label: 'Erbe raccolte' },
  node_sand: { item: 'sand_ore', qty: 2, label: 'Sabbia silicea raccolta' },
  node_shell: { item: 'shell', qty: 2, label: 'Conchiglie raccolte' },
  node_iron: { item: 'iron_ore', qty: 2, label: 'Ferro grezzo raccolto' },
  node_spark: { item: 'spark_core', qty: 1, label: 'Nucleo Scintilla trovato' },
  node_mushroom: { item: 'glow_mushroom', qty: 2, label: 'Funghi luminosi raccolti' },
  node_pollen: { item: 'pollen', qty: 2, label: 'Polline dorato raccolto' },
  node_crystal: { item: 'crystal', qty: 2, label: 'Cristallo armonico raccolto' }
};

export function createInitialState() {
  const regions = {};
  for (const r of REGIONS) {
    regions[r.id] = generateRegionWorld(r.id);
  }
  return {
    version: 1,
    chapter: 1,
    epilogue: false,
    day: 1,
    timeOfDay: 8.0, // 0..24
    weather: 'sunny',
    currentRegion: 'landa',
    unlockedRegions: ['landa'],
    visitedRegions: ['landa'],
    unlockedPowers: ['hand'],
    activePower: 'hand',
    buildItemId: null,
    player: {
      x: 21.0,
      y: 18.2,
      facingX: 0,
      facingY: 1,
      energy: 100,
      maxEnergy: 100,
      morphPower: null,
      morphTimer: 0
    },
    inventory: {
      wood: 3,
      stone: 2,
      berry: 3,
      seed_turnip: 2
    },
    befriended: [],
    discoveredHabitats: [],
    completedQuests: [],
    readLogs: [],
    seenChapters: [],
    stats: {
      gathered: {},
      crafted: 0,
      cooked: 0,
      harvested: 0
    },
    regions
  };
}

export class GameSimulation {
  constructor(state, callbacks = {}) {
    this.state = state;
    this.cb = callbacks; // { onToast, onDialog, onHudDirty, onHabitat }
    this.particles = [];
    this.floatingTexts = [];
    this.habitatRings = [];
    this.walkTarget = null; // { x, y, onArrive }
    this.saveCooldown = 8;
    this.stepSoundTimer = 0;
    this.energyRegenTimer = 0;
    this.profPos = this.computeProfPos();
  }

  get region() {
    return this.state.regions[this.state.currentRegion];
  }

  get regionMeta() {
    return REGIONS.find((r) => r.id === this.state.currentRegion);
  }

  computeProfPos() {
    const meta = this.regionMeta;
    return { x: meta.spawnPos.x + 1.4, y: meta.spawnPos.y - 1.2 };
  }

  notifyDirty() {
    this.cb.onHudDirty && this.cb.onHudDirty();
  }

  toast(msg, gold = false) {
    this.cb.onToast && this.cb.onToast(msg, gold);
  }

  openDialog(entries, onDone) {
    this.cb.onDialog && this.cb.onDialog(entries, onDone);
  }

  spawnParticles(wx, wy, color, count = 10, speed = 2.2) {
    for (let i = 0; i < count; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = (0.4 + Math.random() * 0.9) * speed;
      this.particles.push({
        x: wx,
        y: wy,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd - 0.8,
        life: 0.45 + Math.random() * 0.4,
        maxLife: 0.85,
        color,
        size: 3 + Math.random() * 4
      });
    }
  }

  spawnText(wx, wy, text, color = '#fff7d4') {
    this.floatingTexts.push({ x: wx, y: wy, text, color, life: 1.35, maxLife: 1.35 });
  }

  addItem(itemId, qty = 1, trackGather = false) {
    if (!ITEMS[itemId] || qty <= 0) return;
    this.state.inventory[itemId] = (this.state.inventory[itemId] || 0) + qty;
    if (trackGather) {
      this.state.stats.gathered[itemId] = (this.state.stats.gathered[itemId] || 0) + qty;
    }
    this.notifyDirty();
    this.checkQuests();
  }

  consumeItems(cost) {
    for (const [id, need] of Object.entries(cost)) {
      if ((this.state.inventory[id] || 0) < need) return false;
    }
    for (const [id, need] of Object.entries(cost)) {
      this.state.inventory[id] -= need;
      if (this.state.inventory[id] <= 0) delete this.state.inventory[id];
    }
    this.notifyDirty();
    return true;
  }

  hasItems(cost) {
    for (const [id, need] of Object.entries(cost)) {
      if ((this.state.inventory[id] || 0) < need) return false;
    }
    return true;
  }

  addHarmony(pts, regionId = this.state.currentRegion) {
    const reg = this.state.regions[regionId];
    const prevLv = getHarmonyLevel(reg.harmony).level;
    reg.harmony += pts;
    const nextLv = getHarmonyLevel(reg.harmony).level;
    sound.setHarmonyLevel(nextLv);
    if (nextLv > prevLv) {
      sound.playQuest();
      this.toast(`🌟 Armonia di ${this.regionMeta.name} salita al Livello ${nextLv}!`, true);
    }
    this.notifyDirty();
    this.checkQuests();
  }

  unlockPower(powerId) {
    if (!this.state.unlockedPowers.includes(powerId)) {
      this.state.unlockedPowers.push(powerId);
      const p = POWERS.find((x) => x.id === powerId);
      if (p) {
        sound.playQuest();
        this.toast(`✨ Nuovo Potere Mimetico: ${p.icon} ${p.name}!`, true);
      }
      this.notifyDirty();
    }
  }

  setActivePower(powerId) {
    if (!this.state.unlockedPowers.includes(powerId)) {
      const p = POWERS.find((x) => x.id === powerId);
      const teacher = p && p.taughtBy ? BIOMINI_BY_ID[p.taughtBy] : null;
      this.toast(`🔒 Fai amicizia con ${teacher ? teacher.name : 'un Biomino'} per imparare ${p ? p.name : ''}!`);
      return;
    }
    this.state.buildItemId = null;
    this.state.activePower = powerId;
    this.notifyDirty();
  }

  setBuildItem(itemId) {
    if (!itemId || !(this.state.inventory[itemId] > 0)) {
      this.state.buildItemId = null;
    } else {
      this.state.buildItemId = itemId;
    }
    this.notifyDirty();
  }

  isWalkable(tx, ty) {
    if (tx < 0 || ty < 0 || tx >= MAP_W || ty >= MAP_H) return false;
    const tile = TILES[this.region.tiles[ty][tx]];
    if (!tile || !tile.walkable) return false;
    const obj = this.region.objects[`${tx},${ty}`];
    if (obj && obj.solid) return false;
    return true;
  }

  movePlayerBy(dx, dy, dt) {
    if (Math.abs(dx) < 0.01 && Math.abs(dy) < 0.01) return;
    this.walkTarget = null; // manual stick cancels tap-to-walk
    const len = Math.hypot(dx, dy);
    const nx = dx / len;
    const ny = dy / len;
    const speed = 5.4;
    const p = this.state.player;
    p.facingX = nx;
    p.facingY = ny;

    const tryX = p.x + nx * speed * dt;
    const tryY = p.y + ny * speed * dt;
    if (this.canStandAt(tryX, p.y)) p.x = tryX;
    if (this.canStandAt(p.x, tryY)) p.y = tryY;

    this.stepSoundTimer -= dt;
    if (this.stepSoundTimer <= 0) {
      sound.playStep();
      this.stepSoundTimer = 0.28;
    }
  }

  canStandAt(wx, wy) {
    const r = 0.28;
    const pts = [
      [wx - r, wy - r],
      [wx + r, wy - r],
      [wx - r, wy + r],
      [wx + r, wy + r]
    ];
    for (const [px, py] of pts) {
      if (!this.isWalkable(Math.floor(px), Math.floor(py))) return false;
    }
    return true;
  }

  setTapTarget(worldX, worldY) {
    const tx = Math.floor(worldX);
    const ty = Math.floor(worldY);
    if (tx < 0 || ty < 0 || tx >= MAP_W || ty >= MAP_H) return;

    // Check if tapped Prof. Intreccio
    if (Math.hypot(worldX - this.profPos.x, worldY - this.profPos.y) < 0.95) {
      this.walkTarget = { x: this.profPos.x, y: this.profPos.y + 0.9, interactType: 'prof' };
      return;
    }

    // Check if tapped a Biomino resident
    for (const res of this.region.residents) {
      if (Math.hypot(worldX - res.x, worldY - res.y) < 0.85) {
        this.walkTarget = { x: res.x, y: res.y, interactType: 'resident', residentId: res.id };
        return;
      }
    }

    // Otherwise walk near tile and trigger action on arrival
    const dist = Math.hypot(worldX - this.state.player.x, worldY - this.state.player.y);
    if (dist <= 1.85) {
      this.state.player.facingX = worldX - this.state.player.x;
      this.state.player.facingY = worldY - this.state.player.y;
      this.interactAtTile(tx, ty);
      return;
    }
    this.walkTarget = { x: tx + 0.5, y: ty + 0.5, interactType: 'tile', tx, ty };
  }

  triggerPrimaryAction() {
    const p = this.state.player;
    // First check nearby Prof or Resident if using Hand and not in build mode
    if (!this.state.buildItemId && this.state.activePower === 'hand') {
      if (Math.hypot(p.x - this.profPos.x, p.y - this.profPos.y) < 1.7) {
        this.talkToProfessor();
        return;
      }
      for (const res of this.region.residents) {
        if (Math.hypot(p.x - res.x, p.y - res.y) < 1.6) {
          this.interactWithResident(res);
          return;
        }
      }
    }
    const len = Math.hypot(p.facingX, p.facingY) || 1;
    const fx = p.facingX / len;
    const fy = p.facingY / len;
    const tx = Math.floor(p.x + fx * 0.95);
    const ty = Math.floor(p.y + fy * 0.95);
    this.interactAtTile(tx, ty);
  }

  interactAtTile(tx, ty) {
    if (tx < 0 || ty < 0 || tx >= MAP_W || ty >= MAP_H) return;
    const k = `${tx},${ty}`;
    const obj = this.region.objects[k];
    const tile = this.region.tiles[ty][tx];

    // 1. Build / Seed Placement mode
    if (this.state.buildItemId) {
      this.placeSelectedItem(tx, ty);
      return;
    }

    // 2. Always allow interacting with Sanctuary, Lore Capsules, Terrarium
    if (obj && obj.type === 'sanctuary') {
      this.interactSanctuary(obj);
      return;
    }
    if (obj && obj.type === 'lore_capsule') {
      this.readLoreCapsule(obj);
      return;
    }
    if (obj && obj.type === 'terrarium') {
      this.openDialog([
        { speaker: 'Teca del Risveglio', role: 'Ricordo', portrait: '🫧', text: 'La teca di vetro in cui Mimo ha dormito per secoli. Una targhetta incisa recita: "Per quando la valle sarà pronta a fiorire di nuovo".' }
      ]);
      return;
    }

    // 3. Dispatch active Mimic Power
    const powerId = this.state.activePower;
    const powerMeta = POWERS.find((p) => p.id === powerId);
    if (powerMeta && powerMeta.energy > 0) {
      if (this.state.player.energy < powerMeta.energy) {
        this.toast('⚡ Energia bassa! Mangia una bacca/piatto dallo Zaino o riposa toccando l\'orologio.');
        return;
      }
    }

    // Visual morph feedback
    if (powerId !== 'hand') {
      this.state.player.morphPower = powerId;
      this.state.player.morphTimer = 0.7;
    }

    if (powerId === 'hand') {
      this.useHand(tx, ty, obj);
    } else if (powerId === 'sprout') {
      this.useSprout(tx, ty, tile, obj, powerMeta.energy);
    } else if (powerId === 'splash') {
      this.useSplash(tx, ty, tile, obj, powerMeta.energy);
    } else if (powerId === 'flame') {
      this.useFlame(tx, ty, tile, obj, powerMeta.energy);
    } else if (powerId === 'cut') {
      this.useCut(tx, ty, obj, powerMeta.energy);
    } else if (powerId === 'smash') {
      this.useSmash(tx, ty, obj, powerMeta.energy);
    } else if (powerId === 'spark') {
      this.useSpark(tx, ty, obj, powerMeta.energy);
    } else if (powerId === 'breeze') {
      this.useBreeze(tx, ty, tile, obj, powerMeta.energy);
    } else if (powerId === 'echo') {
      this.useEcho(tx, ty, powerMeta.energy);
    }
  }

  spendEnergy(amount) {
    this.state.player.energy = Math.max(0, this.state.player.energy - amount);
    this.notifyDirty();
  }

  useHand(tx, ty, obj) {
    const k = `${tx},${ty}`;
    if (!obj) {
      // Check adjacent Prof / Resident
      const p = this.state.player;
      if (Math.hypot(tx + 0.5 - this.profPos.x, ty + 0.5 - this.profPos.y) < 1.2) {
        this.talkToProfessor();
        return;
      }
      for (const res of this.region.residents) {
        if (Math.hypot(tx + 0.5 - res.x, ty + 0.5 - res.y) < 1.2) {
          this.interactWithResident(res);
          return;
        }
      }
      return;
    }

    // Harvestable natural node
    if (NODE_DROPS[obj.type]) {
      const drop = NODE_DROPS[obj.type];
      delete this.region.objects[k];
      this.addItem(drop.item, drop.qty, true);
      sound.playGather();
      this.spawnParticles(tx + 0.5, ty + 0.5, '#a8f0b6', 10);
      this.spawnText(tx + 0.5, ty + 0.2, `+${drop.qty} ${ITEMS[drop.item].icon}`, '#b4ffb8');
      return;
    }

    // Ready crop harvest
    if (obj.type === 'crop') {
      if (obj.stage >= 2) {
        const crop = CROPS[obj.cropId];
        delete this.region.objects[k];
        this.addItem(crop.produce, 2, true);
        this.state.stats.harvested++;
        this.addHarmony(6);
        sound.playGather();
        this.spawnParticles(tx + 0.5, ty + 0.5, crop.color, 12);
        this.spawnText(tx + 0.5, ty + 0.2, `+2 ${ITEMS[crop.produce].icon}`, '#ffe680');
      } else {
        this.toast(obj.watered ? '🌱 Sta crescendo bene!' : '💧 Innaffia questa pianta con Zampillo!');
      }
      return;
    }

    // Obstacles hints
    if (obj.type === 'dead_tree') {
      this.toast('🪓 Usa il potere Taglio (da Ramosauro) o Fiammata per abbattere questo tronco.');
      return;
    }
    if (obj.type === 'bramble') {
      this.toast('🔥 Usa Fiammata (da Bracino) o Taglio per liberare i rovi!');
      return;
    }
    if (obj.type === 'boulder') {
      this.toast('🪨 Usa Spacca (da Ciotolino) per frantumare questo masso!');
      return;
    }

    // Campfire rest option
    if (obj.type === 'campfire') {
      this.openDialog([
        {
          speaker: 'Falò Accogliente', role: 'Riposo', portrait: '🔥',
          text: 'Il crepitio del falò rilassa Mimo. Vuoi riposare fino al prossimo momento del giorno per ricaricare l\'energia?',
          choices: [
            { label: '😴 Riposa (+100⚡, +6 ore)', action: () => this.restAtCamp() },
            { label: '📦 Raccogli Falò nello Zaino', action: () => this.pickupPlacedObject(tx, ty) },
            { label: 'Annulla', action: () => {} }
          ]
        }
      ]);
      return;
    }

    // Workstations open craft/cook directly or pickup
    if (obj.type === 'workbench' || obj.type === 'furnace' || obj.type === 'kitchen') {
      const tab = obj.type === 'kitchen' ? 'cook' : obj.type === 'furnace' ? 'material' : 'build';
      this.openDialog([
        {
          speaker: ITEMS[obj.type]?.name || 'Stazione', role: 'Artigianato', portrait: ITEMS[obj.type]?.icon || '🛠️',
          text: 'Cosa desideri fare con questa stazione?',
          choices: [
            { label: '🔨 Apri Ricette', action: () => this.cb.onOpenPanel && this.cb.onOpenPanel('craft', tab) },
            { label: '📦 Riponi nello Zaino', action: () => this.pickupPlacedObject(tx, ty) },
            { label: 'Chiudi', action: () => {} }
          ]
        }
      ]);
      return;
    }

    // Any other player-placed furniture can be picked up cleanly
    if (ITEMS[obj.type]) {
      this.pickupPlacedObject(tx, ty);
    }
  }

  pickupPlacedObject(tx, ty) {
    const k = `${tx},${ty}`;
    const obj = this.region.objects[k];
    if (!obj || !ITEMS[obj.type]) return;
    delete this.region.objects[k];
    this.addItem(obj.type, 1);
    sound.playPlace();
    this.spawnText(tx + 0.5, ty + 0.2, `Riposto ${ITEMS[obj.type].icon}`);
  }

  useSprout(tx, ty, tile, obj, cost) {
    if (obj) {
      this.toast('Libera la casella prima di far germogliare il terreno.');
      return;
    }
    let nextTile = null;
    if (tile === 'withered' || tile === 'ash' || tile === 'rock') nextTile = 'grass';
    else if (tile === 'grass') nextTile = 'tall_grass';
    else if (tile === 'tall_grass') nextTile = 'flowers';
    else {
      this.toast('🌱 Germoglio funziona su terra arida, prato o erba alta!');
      return;
    }
    this.spendEnergy(cost);
    this.region.tiles[ty][tx] = nextTile;
    sound.playPower('sprout');
    this.spawnParticles(tx + 0.5, ty + 0.5, '#86ef96', 12);
    this.addHarmony(nextTile === 'flowers' ? 4 : 2);
    if (Math.random() < 0.35) this.addItem('herb', 1, true);
    this.scanHabitatsAround(tx, ty);
  }

  useSplash(tx, ty, tile, obj, cost) {
    // Water a crop
    if (obj && obj.type === 'crop') {
      this.spendEnergy(cost);
      obj.watered = true;
      sound.playPower('splash');
      this.spawnParticles(tx + 0.5, ty + 0.5, '#68d2ff', 12);
      this.spawnText(tx + 0.5, ty + 0.2, '💧 Innaffiato!', '#8fe2ff');
      return;
    }
    // Wash ash into golden sand!
    if (tile === 'ash') {
      this.spendEnergy(cost);
      this.region.tiles[ty][tx] = 'sand';
      sound.playPower('splash');
      this.spawnParticles(tx + 0.5, ty + 0.5, '#72d4ff', 12);
      this.addHarmony(4);
      if (Math.random() < 0.4) this.addItem('sand_ore', 1, true);
      this.scanHabitatsAround(tx, ty);
      return;
    }
    // Dig a small pond on empty ground (not directly under player)
    if (!obj && (tile === 'withered' || tile === 'grass' || tile === 'sand')) {
      const p = this.state.player;
      if (Math.floor(p.x) === tx && Math.floor(p.y) === ty) {
        this.toast('Fai un passo indietro per scavare uno stagno qui!');
        return;
      }
      this.spendEnergy(cost);
      this.region.tiles[ty][tx] = 'water';
      sound.playPower('splash');
      this.spawnParticles(tx + 0.5, ty + 0.5, '#59c7ff', 14);
      this.addHarmony(3);
      this.scanHabitatsAround(tx, ty);
      return;
    }
    this.toast('💧 Usa Zampillo su colture, sabbia di cenere o terra libera!');
  }

  useFlame(tx, ty, tile, obj, cost) {
    const k = `${tx},${ty}`;
    if (obj && (obj.type === 'bramble' || obj.type === 'dead_tree')) {
      this.spendEnergy(cost);
      delete this.region.objects[k];
      this.addItem('wood', 2, true);
      sound.playPower('flame');
      this.spawnParticles(tx + 0.5, ty + 0.5, '#ff9955', 16);
      this.spawnText(tx + 0.5, ty + 0.2, '+2 🪵', '#ffc478');
      this.addHarmony(3);
      return;
    }
    if (obj && (obj.type === 'campfire' || obj.type === 'lantern' || obj.type === 'furnace')) {
      this.spendEnergy(cost);
      obj.lit = true;
      sound.playPower('flame');
      this.spawnParticles(tx + 0.5, ty + 0.5, '#ffbb55', 14);
      this.spawnText(tx + 0.5, ty + 0.2, '🔥 Acceso!', '#ffd97d');
      this.scanHabitatsAround(tx, ty);
      return;
    }
    if (tile === 'sand' && !obj) {
      this.spendEnergy(cost);
      this.addItem('glass', 1, true);
      sound.playPower('flame');
      this.spawnParticles(tx + 0.5, ty + 0.5, '#ffd480', 12);
      this.spawnText(tx + 0.5, ty + 0.2, '+1 🪟 Vetro!', '#c4f5ff');
      return;
    }
    this.toast('🔥 Usa Fiammata su rovi, tronchi, falò/fornaci o sulla sabbia dorata!');
  }

  useCut(tx, ty, obj, cost) {
    const k = `${tx},${ty}`;
    if (obj && (obj.type === 'dead_tree' || obj.type === 'bramble')) {
      this.spendEnergy(cost);
      delete this.region.objects[k];
      this.addItem('wood', 3, true);
      if (obj.type === 'dead_tree') this.addItem('lumber', 1, true);
      sound.playPower('cut');
      this.spawnParticles(tx + 0.5, ty + 0.5, '#a8e878', 14);
      this.spawnText(tx + 0.5, ty + 0.2, '+3 🪵', '#c4ff96');
      this.addHarmony(3);
      return;
    }
    this.toast('🌿 Usa Taglio su tronchi secchi o rovi spinosi!');
  }

  useSmash(tx, ty, obj, cost) {
    const k = `${tx},${ty}`;
    if (obj && (obj.type === 'boulder' || obj.type === 'node_iron' || obj.type === 'node_stone' || obj.type === 'node_crystal')) {
      this.spendEnergy(cost);
      delete this.region.objects[k];
      if (obj.type === 'boulder') {
        this.addItem('stone', 3, true);
        this.addItem('iron_ore', 2, true);
        this.spawnText(tx + 0.5, ty + 0.2, '+3 🪨 +2 ⛏️', '#ffe0a3');
      } else {
        const drop = NODE_DROPS[obj.type];
        this.addItem(drop.item, drop.qty + 1, true);
        this.spawnText(tx + 0.5, ty + 0.2, `+${drop.qty + 1} ${ITEMS[drop.item].icon}`, '#ffe0a3');
      }
      sound.playPower('smash');
      this.spawnParticles(tx + 0.5, ty + 0.5, '#d6c2a5', 16);
      this.addHarmony(3);
      return;
    }
    this.toast('🪨 Usa Spacca su massi di basalto o vene minerali!');
  }

  useSpark(tx, ty, obj, cost) {
    if (obj && (obj.type === 'generator' || obj.type === 'street_lamp' || obj.type === 'crystal_pillar')) {
      this.spendEnergy(cost);
      obj.powered = true;
      obj.lit = true;
      sound.playPower('spark');
      this.spawnParticles(tx + 0.5, ty + 0.5, '#ffe866', 16);
      this.spawnText(tx + 0.5, ty + 0.2, '⚡ Caricato!', '#fff28c');
      this.addHarmony(5);
      this.scanHabitatsAround(tx, ty);
      return;
    }
    this.toast('⚡ Usa Scintilla su Generatori Solari, Lampioni Elettrici o Pilastri!');
  }

  useBreeze(tx, ty, tile, obj, cost) {
    if (tile === 'mist') {
      this.spendEnergy(cost);
      // Clear a 3x3 patch of mist!
      let cleared = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nx = tx + dx;
          const ny = ty + dy;
          if (nx >= 0 && ny >= 0 && nx < MAP_W && ny < MAP_H && this.region.tiles[ny][nx] === 'mist') {
            this.region.tiles[ny][nx] = 'grass';
            cleared++;
          }
        }
      }
      sound.playPower('breeze');
      this.spawnParticles(tx + 0.5, ty + 0.5, '#9bf5e5', 18);
      this.addItem('pollen', 1, true);
      this.addHarmony(cleared * 4);
      this.spawnText(tx + 0.5, ty + 0.2, '🍃 Spore dissolte!', '#aefcf0');
      this.scanHabitatsAround(tx, ty);
      return;
    }
    if (obj && obj.type === 'windmill') {
      this.spendEnergy(cost);
      sound.playPower('breeze');
      this.spawnParticles(tx + 0.5, ty + 0.5, '#aefcf0', 16);
      this.addItem('pollen', 2, true);
      this.spawnText(tx + 0.5, ty + 0.2, '+2 🌼', '#ffe785');
      return;
    }
    this.toast('🍃 Usa Brezza sulle Spore viola nella Foresta o sui Mulini a Vento!');
  }

  useEcho(tx, ty, cost) {
    this.spendEnergy(cost);
    sound.playPower('echo');
    let affected = 0;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const nx = tx + dx;
        const ny = ty + dy;
        if (nx < 1 || ny < 1 || nx >= MAP_W - 1 || ny >= MAP_H - 1) continue;
        const t = this.region.tiles[ny][nx];
        const o = this.region.objects[`${nx},${ny}`];
        if (t === 'withered' || t === 'mist') { this.region.tiles[ny][nx] = 'flowers'; affected++; }
        else if (t === 'ash') { this.region.tiles[ny][nx] = 'sand'; affected++; }
        else if (t === 'grass') { this.region.tiles[ny][nx] = 'flowers'; affected++; }
        if (o && o.type === 'crop') { o.watered = true; o.progress = (o.progress || 0) + 25; affected++; }
        if (o && (o.type === 'generator' || o.type === 'street_lamp' || o.type === 'campfire')) { o.lit = true; o.powered = true; affected++; }
      }
    }
    this.spawnParticles(tx + 0.5, ty + 0.5, '#f2b8ff', 24, 3.2);
    this.habitatRings.push({ x: tx + 0.5, y: ty + 0.5, r: 0.2, maxR: 2.5, life: 1.0, color: '#f2b8ff' });
    this.addHarmony(Math.max(4, affected * 2));
    this.scanHabitatsAround(tx, ty);
  }

  placeSelectedItem(tx, ty) {
    const itemId = this.state.buildItemId;
    const item = ITEMS[itemId];
    if (!item || !(this.state.inventory[itemId] > 0)) {
      this.state.buildItemId = null;
      this.notifyDirty();
      return;
    }
    const k = `${tx},${ty}`;
    const existing = this.region.objects[k];
    const tile = this.region.tiles[ty][tx];

    // Seed planting
    if (item.cat === 'seed') {
      if (existing || tile === 'water' || tile === 'mist') {
        this.toast('Pianta i semi su terra coltivata o prato libero!');
        return;
      }
      if (tile !== 'soil') this.region.tiles[ty][tx] = 'soil';
      this.consumeItems({ [itemId]: 1 });
      this.region.objects[k] = {
        x: tx, y: ty, type: 'crop', cropId: item.cropId, solid: false,
        watered: this.state.weather === 'rain', progress: 0, stage: 0
      };
      sound.playPlace();
      this.spawnParticles(tx + 0.5, ty + 0.5, '#9bf096', 8);
      if (!(this.state.inventory[itemId] > 0)) this.state.buildItemId = null;
      this.scanHabitatsAround(tx, ty);
      this.notifyDirty();
      return;
    }

    // Tile placement (path, bridge, soil)
    if (item.placeTile) {
      if (item.placeTile === 'bridge' && tile !== 'water') {
        this.toast('🌉 Il Ponte di Legno si posiziona sopra l\'Acqua!');
        return;
      }
      if (item.placeTile !== 'bridge' && (tile === 'water' || tile === 'mist')) {
        this.toast('Non puoi posizionare questo su acqua o spore.');
        return;
      }
      this.consumeItems({ [itemId]: 1 });
      this.region.tiles[ty][tx] = item.placeTile;
      sound.playPlace();
      this.spawnParticles(tx + 0.5, ty + 0.5, '#e8d5a7', 8);
      this.addHarmony(2);
      if (!(this.state.inventory[itemId] > 0)) this.state.buildItemId = null;
      this.scanHabitatsAround(tx, ty);
      this.notifyDirty();
      return;
    }

    // Placeable object/furniture
    if (item.objType) {
      if (existing || tile === 'water' || tile === 'mist') {
        this.toast('Casella occupata o non edificabile!');
        return;
      }
      const p = this.state.player;
      if (item.solid && Math.floor(p.x) === tx && Math.floor(p.y) === ty) {
        this.toast('Spostati di un passo per costruire qui!');
        return;
      }
      this.consumeItems({ [itemId]: 1 });
      this.region.objects[k] = {
        x: tx, y: ty, type: item.objType, solid: !!item.solid,
        lit: !!item.light, powered: false
      };
      sound.playPlace();
      this.spawnParticles(tx + 0.5, ty + 0.5, '#ffe79e', 12);
      this.addHarmony(item.harmony || 6);
      if (!(this.state.inventory[itemId] > 0)) this.state.buildItemId = null;
      this.scanHabitatsAround(tx, ty);
      this.notifyDirty();
    }
  }

  scanHabitatsAround(cx, cy) {
    // Check generous 7×7 window centered on (cx, cy) so rows & gardens register effortlessly
    const tileCounts = {};
    const objCounts = {};
    for (let y = Math.max(0, cy - 3); y <= Math.min(MAP_H - 1, cy + 3); y++) {
      for (let x = Math.max(0, cx - 3); x <= Math.min(MAP_W - 1, cx + 3); x++) {
        const t = this.region.tiles[y][x];
        tileCounts[t] = (tileCounts[t] || 0) + 1;
        const o = this.region.objects[`${x},${y}`];
        if (o) objCounts[o.type] = (objCounts[o.type] || 0) + 1;
      }
    }

    for (const hab of HABITATS) {
      if (hab.region && hab.region !== this.state.currentRegion) continue;
      if (this.region.habitatsFound.includes(hab.id)) continue;

      let ok = true;
      if (hab.reqs.tiles) {
        for (const [t, need] of Object.entries(hab.reqs.tiles)) {
          if ((tileCounts[t] || 0) < need) { ok = false; break; }
        }
      }
      if (ok && hab.reqs.objs) {
        for (const [o, need] of Object.entries(hab.reqs.objs)) {
          if ((objCounts[o] || 0) < need) { ok = false; break; }
        }
      }

      if (ok) {
        this.registerHabitatDiscovery(hab, cx, cy);
      }
    }
  }

  registerHabitatDiscovery(hab, cx, cy) {
    this.region.habitatsFound.push(hab.id);
    if (!this.state.discoveredHabitats.includes(hab.id)) {
      this.state.discoveredHabitats.push(hab.id);
    }
    sound.playHabitat();
    this.habitatRings.push({ x: cx + 0.5, y: cy + 0.5, r: 0.3, maxR: 3.2, life: 1.6, color: '#ffe078' });
    this.spawnParticles(cx + 0.5, cy + 0.5, '#ffe078', 24, 3.0);
    this.toast(`🏡 Nuovo Habitat scoperto: ${hab.icon} ${hab.name}!`, true);
    this.addHarmony(hab.harmony);

    // Invite the attracted Biomino!
    const bio = BIOMINI_BY_ID[hab.attracts];
    if (bio) {
      const alreadyHere = this.region.residents.some((r) => r.id === bio.id);
      if (!alreadyHere) {
        this.region.residents.push({
          id: bio.id,
          x: Math.max(2, Math.min(MAP_W - 2, cx + 0.5)),
          y: Math.max(2, Math.min(MAP_H - 2, cy + 1.1)),
          targetX: cx + 0.5,
          targetY: cy + 1.1,
          hearts: 1,
          giftTimer: 30,
          hasGift: false,
          met: true
        });
      }
      if (!this.state.befriended.includes(bio.id)) {
        this.state.befriended.push(bio.id);
        this.toast(`🐾 ${bio.icon} ${bio.name} è venuto a vivere qui!`, true);
      }
      if (bio.teaches) {
        this.unlockPower(bio.teaches);
      }
    }
    this.cb.onHabitat && this.cb.onHabitat(hab, bio);
    this.checkQuests();
    this.notifyDirty();
    saveGame(this.state);
  }

  interactSanctuary(obj) {
    const meta = this.regionMeta;
    if (this.region.sanctuaryRepaired) {
      this.openDialog([
        {
          speaker: meta.sanctuaryName, role: 'Santuario Riparato', portrait: '🏛️',
          text: `${meta.sanctuaryName} risplende d'armonia! Vuoi riposare qui per ricaricare l'energia e avanzare il giorno?`,
          choices: [
            { label: '✨ Riposa (+100⚡, Mattino)', action: () => this.restAtCamp(true) },
            { label: 'Chiudi', action: () => {} }
          ]
        }
      ]);
      return;
    }

    const costText = Object.entries(meta.sanctuaryCost)
      .map(([id, n]) => `${ITEMS[id].icon} ${ITEMS[id].name} (${this.state.inventory[id] || 0}/${n})`)
      .join(' · ');

    const canRepair = this.hasItems(meta.sanctuaryCost);
    this.openDialog([
      {
        speaker: meta.sanctuaryName, role: 'Rovina Antica', portrait: '🏚️',
        text: `Questo santuario attende di essere restaurato.\nOccorrente: ${costText}`,
        choices: canRepair
          ? [
              { label: '🔨 Ripara il Santuario!', action: () => this.repairSanctuary(obj) },
              { label: 'Più tardi', action: () => {} }
            ]
          : [{ label: 'Cercherò i materiali', action: () => {} }]
      }
    ]);
  }

  repairSanctuary(obj) {
    const meta = this.regionMeta;
    if (!this.consumeItems(meta.sanctuaryCost)) return;
    obj.repaired = true;
    this.region.sanctuaryRepaired = true;
    sound.playHabitat();
    this.spawnParticles(obj.x + 0.5, obj.y + 0.5, '#ffe57f', 30, 3.5);
    this.habitatRings.push({ x: obj.x + 0.5, y: obj.y + 0.5, r: 0.4, maxR: 4.5, life: 1.8, color: '#9bf7b5' });
    this.addHarmony(55);
    this.toast(`🏛️ ${meta.sanctuaryName} restaurato! (+55 Armonia)`, true);
    this.checkQuests();
    saveGame(this.state);
  }

  readLoreCapsule(obj) {
    const log = LORE_LOGS.find((l) => l.id === obj.logId);
    if (!log) return;
    const isNew = !this.state.readLogs.includes(log.id);
    if (isNew) {
      this.state.readLogs.push(log.id);
      obj.read = true;
      this.addHarmony(18);
      sound.playQuest();
    }
    this.openDialog([
      {
        speaker: log.title,
        role: log.author,
        portrait: '📜',
        text: log.text + (isNew ? '\n\n(+18 Armonia · Salvato nel Diario Storia)' : '')
      }
    ]);
    this.notifyDirty();
    saveGame(this.state);
  }

  interactWithResident(res) {
    const bio = BIOMINI_BY_ID[res.id];
    if (!bio) return;
    const firstMeet = !this.state.befriended.includes(bio.id);
    if (firstMeet) {
      this.state.befriended.push(bio.id);
      res.met = true;
      this.addHarmony(20);
    }
    if (bio.teaches && !this.state.unlockedPowers.includes(bio.teaches)) {
      this.unlockPower(bio.teaches);
    }

    // Collect passive gift if ready
    if (res.hasGift) {
      res.hasGift = false;
      res.giftTimer = 42;
      this.addItem(bio.gift, 2, true);
      sound.playGather();
      this.spawnParticles(res.x, res.y, '#ffe27a', 12);
      this.spawnText(res.x, res.y - 0.5, `Dono +2 ${ITEMS[bio.gift].icon}!`, '#ffe88f');
    }

    const favItem = ITEMS[bio.favFood];
    const hasFav = favItem && (this.state.inventory[bio.favFood] || 0) > 0;
    const anyFoodId = Object.keys(this.state.inventory).find((id) => ITEMS[id]?.cat === 'food' && this.state.inventory[id] > 0);
    const quote = bio.quotes[Math.floor(Math.random() * bio.quotes.length)];

    const choices = [
      {
        label: '💛 Accarezza (+Amicizia)',
        action: () => {
          res.hearts = Math.min(5, (res.hearts || 1) + 1);
          sound.playPet();
          this.spawnParticles(res.x, res.y, '#ff9ec4', 12);
          this.spawnText(res.x, res.y - 0.5, '💛 Felice!', '#ffb8d6');
          this.addHarmony(4);
        }
      }
    ];
    if (hasFav) {
      choices.push({
        label: `🍽️ Offri ${favItem.icon} ${favItem.name}`,
        action: () => {
          if (this.consumeItems({ [bio.favFood]: 1 })) {
            res.hearts = Math.min(5, (res.hearts || 1) + 2);
            this.addItem(bio.gift, 3, true);
            sound.playHabitat();
            this.spawnParticles(res.x, res.y, '#ffe078', 16);
            this.toast(`${bio.name} adora ${favItem.name}! Ti regala 3× ${ITEMS[bio.gift].icon}!`, true);
            this.addHarmony(12);
          }
        }
      });
    } else if (anyFoodId) {
      const f = ITEMS[anyFoodId];
      choices.push({
        label: `🫐 Offri ${f.icon} ${f.name}`,
        action: () => {
          if (this.consumeItems({ [anyFoodId]: 1 })) {
            res.hearts = Math.min(5, (res.hearts || 1) + 1);
            sound.playPet();
            this.spawnParticles(res.x, res.y, '#9bf5b2', 12);
            this.addHarmony(6);
          }
        }
      });
    }
    choices.push({ label: 'A presto!', action: () => {} });

    this.openDialog([
      {
        speaker: `${bio.name} ${'♥'.repeat(res.hearts || 1)}`,
        role: `Biomino ${bio.element}`,
        portrait: bio.icon,
        text: quote + (firstMeet && bio.teaches ? `\n\n✨ ${bio.name} ti ha insegnato una nuova Morfomimosi!` : ''),
        choices
      }
    ]);
    this.checkQuests();
    this.notifyDirty();
  }

  talkToProfessor() {
    const activeQuest = this.getCurrentQuest();
    const lines = [];
    if (activeQuest) {
      lines.push({
        speaker: 'Prof. Intreccio', role: 'Custode Botanico', portrait: '🌿',
        text: `Obiettivo attuale — ${activeQuest.title}:\n${activeQuest.desc}\n(${activeQuest.progress(this.state)})`
      });
    } else {
      lines.push({
        speaker: 'Prof. Intreccio', role: 'Custode Botanico', portrait: '🌿',
        text: 'Morfalia risplende come nei giorni migliori, Mimo! Divertiti a completare tutti i 30 Habitat, i 24 Biomini e i 10 Diari dei Custodi.'
      });
    }
    lines.push({
      speaker: 'Prof. Intreccio', role: 'Custode Botanico', portrait: '🌿',
      text: 'Vuoi riposare un momento sotto i miei rami o dare un\'occhiata ai consigli sugli Habitat?',
      choices: [
        { label: '😴 Riposa (+100⚡)', action: () => this.restAtCamp() },
        { label: '🏡 Apri Diario Habitat', action: () => this.cb.onOpenPanel && this.cb.onOpenPanel('habitats') },
        { label: 'Grazie Professore!', action: () => {} }
      ]
    });
    this.openDialog(lines);
  }

  craftRecipe(recipeId) {
    const rec = RECIPES.find((r) => r.id === recipeId);
    if (!rec) return false;
    if (!this.consumeItems(rec.cost)) {
      this.toast('Materiali insufficienti!');
      return false;
    }
    this.addItem(rec.out, rec.qty);
    if (rec.tab === 'cook') this.state.stats.cooked++;
    else this.state.stats.crafted++;
    sound.playCraft();
    const outItem = ITEMS[rec.out];
    this.toast(`✨ Creato: ${outItem.icon} ${outItem.name} ×${rec.qty}!`);
    this.addHarmony(2);
    return true;
  }

  eatItem(itemId) {
    const item = ITEMS[itemId];
    if (!item || item.cat !== 'food') return;
    if (!this.consumeItems({ [itemId]: 1 })) return;
    this.state.player.energy = Math.min(this.state.player.maxEnergy, this.state.player.energy + (item.energy || 20));
    sound.playPet();
    this.spawnParticles(this.state.player.x, this.state.player.y, '#9bf5b2', 12);
    this.toast(`😋 Mangiato ${item.icon} ${item.name} (+${item.energy}⚡)!`);
    this.notifyDirty();
  }

  restAtCamp(toMorning = false) {
    this.state.player.energy = this.state.player.maxEnergy;
    if (toMorning) {
      this.state.day += 1;
      this.state.timeOfDay = 7.5;
      this.onNewDay();
    } else {
      this.state.timeOfDay += 6;
      if (this.state.timeOfDay >= 24) {
        this.state.timeOfDay -= 24;
        this.state.day += 1;
        this.onNewDay();
      }
    }
    sound.playPet();
    this.toast(`🌅 Riposato! Energia al massimo (Giorno ${this.state.day}).`);
    this.notifyDirty();
    saveGame(this.state);
  }

  onNewDay() {
    // Rotate weather
    const pick = WEATHERS[Math.floor(Math.random() * WEATHERS.length)];
    this.state.weather = pick.id;
    // Replenish resources across all unlocked regions
    for (const rid of this.state.unlockedRegions) {
      replenishRegionNodes(this.state.regions[rid]);
      // Rain waters all crops automatically!
      if (this.state.weather === 'rain') {
        for (const obj of Object.values(this.state.regions[rid].objects)) {
          if (obj.type === 'crop') obj.watered = true;
        }
      }
    }
  }

  travelToRegion(regionId) {
    if (!this.state.unlockedRegions.includes(regionId)) {
      this.toast('🔒 Regione ancora bloccata! Segui le Richieste Importanti.');
      return false;
    }
    this.state.currentRegion = regionId;
    if (!this.state.visitedRegions.includes(regionId)) {
      this.state.visitedRegions.push(regionId);
    }
    const meta = this.regionMeta;
    this.state.player.x = meta.spawnPos.x;
    this.state.player.y = meta.spawnPos.y;
    this.walkTarget = null;
    this.profPos = this.computeProfPos();
    this.particles = [];
    this.floatingTexts = [];
    sound.setHarmonyLevel(getHarmonyLevel(this.region.harmony).level);
    sound.playPower('breeze');
    this.toast(`🧭 Benvenuto in: ${meta.icon} ${meta.name}!`);
    this.checkQuests();
    this.notifyDirty();
    saveGame(this.state);
    return true;
  }

  getCurrentQuest() {
    return QUESTS.find((q) => q.chapter <= this.state.chapter && !this.state.completedQuests.includes(q.id)) || null;
  }

  triggerChapterIntro(chapterNum) {
    if (this.state.seenChapters.includes(chapterNum)) return;
    const ch = CHAPTERS.find((c) => c.id === chapterNum);
    if (!ch) return;
    this.state.seenChapters.push(chapterNum);
    this.openDialog(ch.introDialog);
  }

  checkQuests() {
    let progressed = true;
    while (progressed) {
      progressed = false;
      const q = this.getCurrentQuest();
      if (!q) break;
      if (q.check(this.state)) {
        this.state.completedQuests.push(q.id);
        progressed = true;
        sound.playQuest();
        this.toast(`⭐ Richiesta completata: ${q.title}!`, true);

        if (q.reward) {
          for (const [id, qty] of Object.entries(q.reward)) {
            this.state.inventory[id] = (this.state.inventory[id] || 0) + qty;
          }
        }
        if (q.unlockRegion && !this.state.unlockedRegions.includes(q.unlockRegion)) {
          this.state.unlockedRegions.push(q.unlockRegion);
          const rm = REGIONS.find((r) => r.id === q.unlockRegion);
          if (rm) this.toast(`🗺️ Nuova Regione sbloccata: ${rm.icon} ${rm.name}!`, true);
        }
        if (q.advanceChapter && this.state.chapter < q.advanceChapter) {
          this.state.chapter = q.advanceChapter;
          this.triggerChapterIntro(q.advanceChapter);
        } else if (q.onCompleteDialog) {
          this.openDialog(q.onCompleteDialog);
        }
        if (q.isFinale) {
          this.state.epilogue = true;
        }
        saveGame(this.state);
        this.notifyDirty();
      }
    }
  }

  update(dt) {
    // 1. Time progression
    this.state.timeOfDay += (24 / DAY_LENGTH_SECONDS) * dt;
    if (this.state.timeOfDay >= 24) {
      this.state.timeOfDay -= 24;
      this.state.day += 1;
      this.onNewDay();
    }

    // Gentle passive energy regeneration
    this.energyRegenTimer += dt;
    if (this.energyRegenTimer >= 3.5) {
      this.energyRegenTimer = 0;
      if (this.state.player.energy < this.state.player.maxEnergy) {
        this.state.player.energy = Math.min(this.state.player.maxEnergy, this.state.player.energy + 1);
      }
    }

    // Morph animation decay
    if (this.state.player.morphTimer > 0) {
      this.state.player.morphTimer = Math.max(0, this.state.player.morphTimer - dt);
      if (this.state.player.morphTimer === 0) this.state.player.morphPower = null;
    }

    // 2. Tap-to-walk steering
    if (this.walkTarget) {
      const p = this.state.player;
      const dx = this.walkTarget.x - p.x;
      const dy = this.walkTarget.y - p.y;
      const dist = Math.hypot(dx, dy);
      const stopDist = this.walkTarget.interactType === 'tile' ? 1.05 : 1.0;
      if (dist <= stopDist) {
        const wt = this.walkTarget;
        this.walkTarget = null;
        if (wt.interactType === 'prof') this.talkToProfessor();
        else if (wt.interactType === 'resident') {
          const r = this.region.residents.find((x) => x.id === wt.residentId);
          if (r) this.interactWithResident(r);
        } else if (wt.interactType === 'tile') {
          p.facingX = wt.tx + 0.5 - p.x;
          p.facingY = wt.ty + 0.5 - p.y;
          this.interactAtTile(wt.tx, wt.ty);
        }
      } else {
        const nx = dx / dist;
        const ny = dy / dist;
        const speed = 5.4;
        p.facingX = nx;
        p.facingY = ny;
        const nextX = p.x + nx * speed * dt;
        const nextY = p.y + ny * speed * dt;
        let moved = false;
        if (this.canStandAt(nextX, p.y)) { p.x = nextX; moved = true; }
        if (this.canStandAt(p.x, nextY)) { p.y = nextY; moved = true; }
        if (!moved) {
          // Blocked by obstacle -> stop walk target cleanly
          this.walkTarget = null;
        } else {
          this.stepSoundTimer -= dt;
          if (this.stepSoundTimer <= 0) {
            sound.playStep();
            this.stepSoundTimer = 0.28;
          }
        }
      }
    }

    // 3. Crops growth
    for (const obj of Object.values(this.region.objects)) {
      if (obj.type === 'crop' && obj.stage < 2) {
        if (this.state.weather === 'rain') obj.watered = true;
        if (obj.watered) {
          const crop = CROPS[obj.cropId];
          obj.progress = (obj.progress || 0) + dt;
          if (obj.progress >= crop.growTime) obj.stage = 2;
          else if (obj.progress >= crop.growTime * 0.45) obj.stage = 1;
        }
      }
    }

    // 4. Biomini wander AI & passive gift timers
    for (const res of this.region.residents) {
      if (!res.hasGift) {
        res.giftTimer = (res.giftTimer || 30) - dt;
        if (res.giftTimer <= 0) res.hasGift = true;
      }
      const dx = res.targetX - res.x;
      const dy = res.targetY - res.y;
      const d = Math.hypot(dx, dy);
      if (d > 0.12) {
        const sp = 1.15;
        const nx = res.x + (dx / d) * sp * dt;
        const ny = res.y + (dy / d) * sp * dt;
        if (this.isWalkable(Math.floor(nx), Math.floor(ny))) {
          res.x = nx;
          res.y = ny;
        } else {
          res.targetX = res.x;
          res.targetY = res.y;
        }
      } else if (Math.random() < dt * 0.35) {
        const rx = Math.max(2, Math.min(MAP_W - 2, res.x + (Math.random() - 0.5) * 4.5));
        const ry = Math.max(2, Math.min(MAP_H - 2, res.y + (Math.random() - 0.5) * 4.5));
        if (this.isWalkable(Math.floor(rx), Math.floor(ry))) {
          res.targetX = rx;
          res.targetY = ry;
        }
      }
    }

    // 5. Particles, rings & floating texts
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const pt = this.particles[i];
      pt.x += pt.vx * dt;
      pt.y += pt.vy * dt;
      pt.vy += 1.6 * dt;
      pt.life -= dt;
      if (pt.life <= 0) this.particles.splice(i, 1);
    }
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y -= 0.7 * dt;
      ft.life -= dt;
      if (ft.life <= 0) this.floatingTexts.splice(i, 1);
    }
    for (let i = this.habitatRings.length - 1; i >= 0; i--) {
      const hr = this.habitatRings[i];
      hr.life -= dt;
      hr.r += (hr.maxR - hr.r) * Math.min(1, dt * 3.5);
      if (hr.life <= 0) this.habitatRings.splice(i, 1);
    }

    // 6. Periodic auto-save
    this.saveCooldown -= dt;
    if (this.saveCooldown <= 0) {
      this.saveCooldown = 12;
      saveGame(this.state);
    }
  }

  getTimeInfo() {
    const h = Math.floor(this.state.timeOfDay);
    const m = Math.floor((this.state.timeOfDay - h) * 60);
    const clock = `G${this.state.day} · ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    const period = getTimePeriod(this.state.timeOfDay);
    const weather = WEATHERS.find((w) => w.id === this.state.weather) || WEATHERS[0];
    return { clock, period, weather };
  }
}
