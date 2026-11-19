/* DITTOPIA — bootstrap, gameplay loop and interactions */

import { TILE, SPECIES, ITEMS, MOVE_ORDER, QUESTS, DIALOGUES, HABITATS, ACHIEVEMENTS } from './config.js';
import { state, freshState, hasSave, saveState, loadInto, reset as resetSave } from './state.js';
import { t, applyI18n } from './i18n.js';
import * as AUDIO from './audio.js';
import { world } from './world.js';
import { pokemon } from './pokemon.js';
import { Renderer } from './render.js';
import { createEffects, updateEffects, burst, weatherOf, seasonOf, photo, downloadPhoto } from './effects.js';
import { ui } from './ui.js';
import { advance, passive, setFlag, objectiveFor } from './quests.js';
import { drawPlayer } from './sprites.js';

const canvas = document.getElementById('game');
const renderer = new Renderer(canvas);
const effects = createEffects();

const PALETTES = {
  skin: [[232,184,148],[200,150,110],[150,100,70],[240,210,180]],
  hair: [[60,40,30],[140,80,40],[180,140,60],[60,60,80],[200,60,60]],
  shirt: [[60,90,150],[200,60,60],[60,160,80],[180,60,160],[230,160,40]]
};

const keys = {};
const touch = { x: 0, y: 0 };
let last = performance.now();
let hudClock = 0;
let day = 0;
let saveClock = 0;

function isNight() {
  const hour = Math.floor(state.time / 60) % 24;
  return hour < 6 || hour >= 20;
}

function notify(message) { ui.notify(message); }

function dialogue(name, text, cb) { ui.dialogue(name, text, cb); }
function dialogueMulti(lines, cb) { ui.dialogueMulti(lines, cb); }

function checkAchievements() {
  const unlock = (id, condition) => {
    if (!condition || state.achievements[id]) return;
    state.achievements[id] = Date.now();
    const achievement = ACHIEVEMENTS.find(a => a.id === id);
    if (achievement) notify(`Obiettivo: ${achievement.label}`);
  };
  unlock('firstFriend', pokemon.friendsCount() >= 1);
  unlock('dex10', pokemon.dexCount() >= 10);
  unlock('friends12', pokemon.friendsCount() >= 12);
  unlock('crafter', state.stats.crafted >= 10);
  unlock('nightOwl', isNight());
  unlock('shiny', pokemon.all().some(m => m.shiny));
  unlock('finale', !!state.quest.flags.mew_met);
}

function spawnInitialPokemon() {
  const specials = world.getSpecials();
  const snorlax = pokemon.spawn('snorlax', specials.snorlax.x, specials.snorlax.y, { questOnly: true });
  snorlax.questOnly = true;
  const squirtle = pokemon.spawn('squirtle', specials.squirtle.x, specials.squirtle.y, { questOnly: true });
  squirtle.questOnly = true;
  const farfetchd = pokemon.spawn('farfetchd', specials.farfetchd.x, specials.farfetchd.y, { questOnly: true });
  farfetchd.questOnly = true;
}

function newGame() {
  Object.assign(state, freshState());
  world.gen();
  pokemon.reset();
  spawnInitialPokemon();
  AUDIO.resume();
  AUDIO.playMusic('day');
  ui.hideTitle();
  ui.showCustomize(onPalette);
}

function onPalette(selection) {
  return {
    skin: PALETTES.skin[selection.skin][0],
    hair: PALETTES.hair[selection.hair][0],
    shirt: PALETTES.shirt[selection.shirt][0]
  };
}

function renderPreview(selection, container) {
  if (!container) return;
  container.innerHTML = '';
  const preview = document.createElement('canvas');
  preview.width = 96;
  preview.height = 96;
  preview.className = 'pixel-preview';
  const ctx = preview.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  const colors = onPalette(selection);
  drawPlayer(ctx, 16, 4, 4, colors);
  container.appendChild(preview);
}

function startAdventure(colors) {
  Object.assign(state.player, colors);
  const specials = world.getSpecials();
  state.player.x = specials.start.x;
  state.player.y = specials.start.y;
  renderer.follow(state.player);
  dialogueMulti([
    'Professor Tangrowth: Sciocco piccolo blob viola... ma guardati! Sei un Ditto trasformato in umano!',
    'Professor Tangrowth: Gli umani hanno lasciato la Kanto tempo fa. Noi Pokémon siamo ancora qui.',
    'Professor Tangrowth: Io studio questo luogo. Tu lo coltiverai. Tutto inizia da una tartarughina assetata. Avanti!'
  ], () => {
    setFlag(state, 'talked_tangrowth');
  });
}

function continueGame() {
  const saved = loadInto(state);
  if (!saved) { notify(t('noSave')); return; }
  world.load(saved.world);
  pokemon.load(saved.pokemon, state.dex);
  AUDIO.resume();
  AUDIO.playMusic(isNight() ? 'night' : 'day');
  ui.hideTitle();
  renderer.follow(state.player);
  notify('Bentornato a Dittopia 🌸');
}

function giveRes(key, amount) {
  state.player.inv[key] = (state.player.inv[key] || 0) + amount;
  notify(`+${amount} ${ITEMS[key].name}`);
  AUDIO.sfxPickup();
}

function makeFriend(mon) {
  const sp = SPECIES[mon.species];
  pokemon.interact(mon, {
    player: state.player,
    notify,
    dialogue,
    onFriend: () => { checkAchievements(); advance(state, notify, dialogueMulti); }
  });
  if (mon.shiny) state.stats.caught++;
}

function interactMon(mon) {
  const sp = SPECIES[mon.species];

  // Squirtle: insegna subito Pistolacqua, poi chiede acqua (niente deadlock)
  if (mon.species === 'squirtle' && mon.friendship === 0) {
    if (!state.player.moves.pistolacqua) {
      state.player.moves.pistolacqua = true;
      dialogWithSquirtle();
    } else {
      dialogWithSquirtle();
    }
    return;
  }

  if (mon.species === 'snorlax' && state.quest.current === 'q7' && !state.quest.flags.snorlax_awake) {
    startFlute();
    return;
  }

  pokemon.interact(mon, {
    player: state.player,
    notify,
    dialogue,
    onFriend: () => { checkAchievements(); advance(state, notify, dialogueMulti); }
  });
}

function dialogWithSquirtle() {
  dialogue('Squirtle', '*gluglu* Ti insegno Pistolacqua! Ora innaffia le piantine e aiuta il tuo nuovo amico!', () => {
    const squirtle = pokemon.all().find(m => m.species === 'squirtle');
    if (squirtle) makeFriend(squirtle);
    setFlag(state, 'squirtle_helped');
  });
}

function startFlute() {
  const sequence = Array.from({ length: 4 }, () => Math.floor(Math.random() * 6));
  ui.startFlute(sequence, success => {
    if (!success) { notify('La melodia non è riuscita. Riprova!'); return; }
    state.quest.flags.snorlax_awake = true;
    const snorlax = pokemon.all().find(m => m.species === 'snorlax');
    if (snorlax) makeFriend(snorlax);
    const cave = world.getSpecials().caveEntrance;
    pokemon.spawn('dratini', cave.x, cave.y - 1, { questOnly: true });
    state.quest.current = 'q8';
    AUDIO.sfxFanfare();
    notify('Mosslax si sveglia e si unisce a te! ❤');
    advance(state, notify, dialogueMulti);
  });
}

function wakeGenerator(obj) {
  if ((state.player.inv.metallo || 0) < 6) {
    dialogue('Generatore', 'Rotto. Servono 6 Metallo e la mossa Energia per ripararlo.');
    return;
  }
  state.player.inv.metallo -= 6;
  obj.state.broken = false;
  AUDIO.sfxCraft();
  notify('Generatore riparato! Le luci delle rovine si accendono.');
  if (!state.quest.flags.gen_fixed) {
    state.quest.flags.gen_fixed = true;
    const generator = world.getSpecials().generator;
    const pikachu = pokemon.spawn('pikachu', generator.x, generator.y + 1, { questOnly: true });
    pikachu.questOnly = true;
    pokemon.interact(pikachu, {
      player: state.player,
      notify,
      dialogue,
      onFriend: () => checkAchievements()
    });
  }
}

function triggerMew(obj) {
  if (state.quest.flags.mew_met) { dialogue('Mew', 'Mew~ (già tuo amico) 🌸'); return; }
  const mew = pokemon.spawn('mew', obj.x, obj.y - 1, { questOnly: true });
  dialogueMulti([
    '???: ...',
    'Mew: Mew... mew mew~ (Vedo un cuore puro. Ti dono la mia amicizia, Ditto.)',
    'Professor Tangrowth: Non posso crederci... Mew! La leggenda era vera! La Kanto tornerà a fiorire grazie a te.'
  ], () => {
    makeFriend(mew);
    state.quest.flags.mew_met = true;
    state.quest.current = null;
    advance(state, notify, dialogueMulti);
    dialogue('Fine', '★ DITTOPIA — FINE ★\n\nHai riportato la vita nella Kanto post-apocalittica. Grazie, da parte di tutti i Pokémon. 🌸');
  });
}

function interactObject(obj, tx, ty) {
  switch (obj.type) {
    case 'detrito':
      giveRes(Math.random() < 0.6 ? 'rametto' : 'ciottolo', 1 + Math.floor(Math.random() * 2));
      world.removeObj(tx, ty);
      advance(state, notify, dialogueMulti);
      return;
    case 'cespuglio': giveRes('fibra', 1 + Math.floor(Math.random() * 2)); world.removeObj(tx, ty); return;
    case 'spruzzabacche': giveRes('bacca', 1 + Math.floor(Math.random() * 3)); world.removeObj(tx, ty); return;
    case 'rovina_metallo': giveRes('metallo', 1 + Math.floor(Math.random() * 2)); world.removeObj(tx, ty); return;
    case 'cristallo_nat': giveRes('cristallo', 1 + Math.floor(Math.random() * 2)); world.removeObj(tx, ty); return;
    case 'albero':
      if (state.player.moves.taglio) { giveRes('legno', 2 + Math.floor(Math.random() * 2)); world.removeObj(tx, ty); AUDIO.sfxChop(); }
      else { notify('Serve la mossa Taglio!'); AUDIO.sfxError(); }
      return;
    case 'roccia':
      if (state.player.moves.spaccaroccia) { giveRes('pietra', 2 + Math.floor(Math.random() * 2)); world.removeObj(tx, ty); AUDIO.sfxSmash(); }
      else { notify('Serve la mossa Spaccaroccia!'); AUDIO.sfxError(); }
      return;
    case 'generatore': wakeGenerator(obj); return;
    case 'altare':
      if (isNight()) {
        if (pokemon.friendsCount() >= 12) triggerMew(obj);
        else dialogue('Altare', `Vedi un altare antico... servono 12 amici. Amici: ${pokemon.friendsCount()}/12.`);
      } else dialogue('Altare', 'L’altare è silenzioso. Torna di notte.');
      return;
    case 'tangrowth':
      dialogue('Professor Tangrowth', DIALOGUES.sign[0]);
      setFlag(state, 'talked_tangrowth');
      return;
    case 'sign': {
      const lines = DIALOGUES.sign;
      dialogue('Cartello', lines[Math.floor(Math.random() * lines.length)]);
      return;
    }
  }
  if (ITEMS[obj.type] && ITEMS[obj.type].kind === 'place') {
    const removed = world.removePlaced(tx, ty);
    if (removed) {
      const def = ITEMS[removed.type];
      if (def.cost) for (const [key, amount] of Object.entries(def.cost)) giveRes(key, Math.ceil(amount / 2));
      notify(`Rimosso: ${def.name}`);
      AUDIO.sfxPickup();
    }
    return;
  }
  dialogue(obj.type, '...');
}

function interactSprout(sprout) {
  if (state.player.curMove !== 'pistolacqua' && !state.player.moves.pistolacqua) {
    notify('Serve Pistolacqua (tasto 2)!');
    AUDIO.sfxError();
    return;
  }
  if (sprout.watered) return;
  sprout.watered = true;
  world.setTile(sprout.x, sprout.y, TILE.FLOWER);
  AUDIO.sfxWater();
  notify('Piantina innaffiata! 🌱');
  const watered = (world.getSpecials().sprouts || []).filter(s => s.watered).length;
  if (watered >= 3) setFlag(state, 'watered3');
}

function tryPlace(type, x, y) {
  const item = ITEMS[type];
  if (!item) { state.player.placeSel = null; return; }
  if ((state.player.inv[type] || 0) <= 0) {
    notify(`Non hai ${item.name}. Craftalo al banco (C).`);
    state.player.placeSel = null;
    return;
  }
  if (world.objAt(x, y) || !world.walkable(x, y)) {
    notify('Non puoi piazzarlo qui.');
    AUDIO.sfxError();
    return;
  }
  if (type === 'flauto') { startFlute(); return; }
  world.placeItem(x, y, type);
  state.player.inv[type]--;
  AUDIO.sfxCraft();
  notify(`Piazzato: ${item.name}`);
  if (state.player.inv[type] <= 0) state.player.placeSel = null;
  advance(state, notify, dialogueMulti);
}

function frontTile(player = state.player) {
  let x = Math.round(player.x), y = Math.round(player.y);
  if (player.dir === 'U') y--; else if (player.dir === 'D') y++; else if (player.dir === 'L') x--; else x++;
  return { x, y };
}

function doInteract() {
  if (ui.isModal()) return;
  const { x, y } = frontTile();
  const mon = pokemon.at(x, y);
  if (mon) { interactMon(mon); return; }
  const obj = world.objAt(x, y);
  if (obj) { interactObject(obj, x, y); return; }
  const sprout = (world.getSpecials().sprouts || []).find(s => s.x === x && s.y === y && !s.watered);
  if (sprout) { interactSprout(sprout); return; }
  const tile = world.getTile(x, y);
  const move = state.player.curMove;
  if (move === 'scava' && [TILE.DIRT, TILE.GRASS, TILE.TGRASS].includes(tile)) {
    world.setTile(x, y, TILE.WATER);
    AUDIO.sfxWater();
    return;
  }
  if (move === 'fogliame' && tile === TILE.DIRT) { world.setTile(x, y, TILE.GRASS); AUDIO.sfxCraft(); return; }
  if (state.player.placeSel) tryPlace(state.player.placeSel, x, y);
}

function clickTile(x, y) {
  if (ui.isModal()) return;
  if (state.player.placeSel) {
    if (Math.hypot(x - state.player.x, y - state.player.y) < 3) tryPlace(state.player.placeSel, x, y);
    return;
  }
  const p = state.player;
  if (x < p.x) p.dir = 'L'; else if (x > p.x) p.dir = 'R'; else if (y < p.y) p.dir = 'U'; else p.dir = 'D';
  doInteract();
}

function update(dt) {
  state.frame++;
  state.time = (state.time + dt * 60) % 1440;
  state.stats.playtime += dt;
  const night = isNight();
  const expected = night ? 'night' : 'day';
  if (state._music !== expected) { AUDIO.playMusic(expected); state._music = expected; }

  if (!ui.isModal()) {
    let vx = 0, vy = 0;
    if (keys.ArrowUp || keys.w) vy = -1; else if (keys.ArrowDown || keys.s) vy = 1;
    if (keys.ArrowLeft || keys.a) vx = -1; else if (keys.ArrowRight || keys.d) vx = 1;
    if (touch.x || touch.y) { vx = touch.x; vy = touch.y; }
    const length = Math.hypot(vx, vy);
    if (length > 0) {
      vx = vx / length * 2.5;
      vy = vy / length * 2.5;
      state.player.moving = true;
      const nx = state.player.x + vx * dt, ny = state.player.y + vy * dt;
      if (world.walkable(Math.round(nx), Math.round(state.player.y))) state.player.x = nx;
      if (world.walkable(Math.round(state.player.x), Math.round(ny))) state.player.y = ny;
      state.player.dir = Math.abs(vx) > Math.abs(vy) ? (vx > 0 ? 'R' : 'L') : (vy > 0 ? 'D' : 'U');
      state.stats.steps++;
      if ((state.frame & 7) === 0) AUDIO.sfxStep();
    } else state.player.moving = false;
  }

  renderer.follow(state.player);
  pokemon.update(dt, state.player, night);
  if (state.frame % 120 === 0) pokemon.scanHabitats(night ? 'night' : 'day', state.player);
  passive(state, notify, dialogueMulti);
  checkAchievements();

  const zone = world.zoneAt(state.player.x, state.player.y);
  const season = seasonOf(day);
  const weather = weatherOf(zone, season, night);
  updateEffects(effects, dt, window.innerWidth, window.innerHeight, weather);

  hudClock += dt;
  if (hudClock > 0.25) {
    hudClock = 0;
    ui.refreshHUD(state, { season, weather });
  }
  saveClock += dt;
  if (saveClock > 20) { saveClock = 0; saveState(state, world, pokemon); }
}

function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
  last = now;
  if (state && ui.modeOf() !== 'title' && ui.modeOf() !== 'customize') update(dt);
  ui.update(dt);
  if (state) renderer.draw({ state, pokemon, effects, isNight: isNight(), modal: ui.isModal() });
}

function setupInput() {
  document.addEventListener('keydown', e => {
    if (['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName)) return;
    if (!ui.isModal()) {
      if (e.key >= '1' && e.key <= '9') {
        const move = MOVE_ORDER[Number(e.key) - 1];
        if (move && state.player.moves[move]) {
          state.player.curMove = move;
          state.player.placeSel = null;
          AUDIO.sfxSelect();
          ui.refreshHUD(state);
        }
        return;
      }
      if (e.key === 'c' || e.key === 'C') { ui.openCraft(state); return; }
      if (e.key === 't' || e.key === 'T') { ui.openDex(); return; }
      if (e.key === 'j' || e.key === 'J') { ui.openJournal(); return; }
      if (e.key === 'm' || e.key === 'M') { ui.openMap(); return; }
      if (e.key === 'p' || e.key === 'P' || e.key === 'Escape' || e.key === 'Tab') { e.preventDefault(); ui.openMenu(); return; }
      if (e.key === 'e' || e.key === 'E') { doInteract(); return; }
    }
    if (ui.handleKey(e, state)) return;
    keys[e.key] = true;
    keys[e.key.toLowerCase()] = true;
    if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key)) e.preventDefault();
  });
  document.addEventListener('keyup', e => { keys[e.key] = false; keys[e.key.toLowerCase()] = false; });
  canvas.addEventListener('click', e => {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor(renderer.cam.x + (e.clientX - rect.left) / 24);
    const y = Math.floor(renderer.cam.y + (e.clientY - rect.top) / 24);
    clickTile(x, y);
  });
  document.addEventListener('click', e => ui.onClick(e));

  const pad = document.getElementById('touchpad');
  if (pad) {
    const center = () => { const r = pad.getBoundingClientRect(); return { cx: r.left + r.width / 2, cy: r.top + r.height / 2 }; };
    pad.addEventListener('touchstart', e => e.preventDefault(), { passive: false });
    pad.addEventListener('touchmove', e => {
      e.preventDefault();
      if (!e.touches.length) return;
      const c = center();
      touch.x = (e.touches[0].clientX - c.cx) / 45;
      touch.y = (e.touches[0].clientY - c.cy) / 45;
      const magnitude = Math.hypot(touch.x, touch.y);
      if (magnitude > 1) { touch.x /= magnitude; touch.y /= magnitude; }
      if (Math.abs(touch.x) < 0.15) touch.x = 0;
      if (Math.abs(touch.y) < 0.15) touch.y = 0;
    }, { passive: false });
    pad.addEventListener('touchend', () => { touch.x = 0; touch.y = 0; });
  }
  document.getElementById('btnA')?.addEventListener('touchstart', e => { e.preventDefault(); doInteract(); }, { passive: false });
  document.getElementById('btnB')?.addEventListener('touchstart', e => {
    e.preventDefault();
    if (ui.isModal()) ui.handleKey({ key: 'Escape' }, state);
    else { state.player.placeSel = null; notify('Piazzamento annullato.'); }
  }, { passive: false });

  window.addEventListener('beforeunload', () => {
    if (state && ui.modeOf() !== 'title') saveState(state, world, pokemon);
  });
  const wake = () => { AUDIO.resume(); document.removeEventListener('pointerdown', wake); };
  document.addEventListener('pointerdown', wake);
}

function boot() {
  applyI18n(document);
  ui.init({
    onNewGame: newGame,
    onContinue: continueGame,
    onStartAdventure: startAdventure,
    onPalette: onPalette,
    onPreview: renderPreview,
    onSave: () => saveState(state, world, pokemon),
    onCraft: key => advance(state, notify, dialogueMulti),
    onPhoto: () => {
      const data = photo(canvas);
      if (data) { downloadPhoto(data); state.stats.photos++; notify(t('photoSaved')); }
      return data;
    },
    onMap: target => renderer.drawMinimap(target, state.player)
  });
  setupInput();
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(() => {});
  requestAnimationFrame(frame);
}

boot();
