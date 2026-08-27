/* Pocket Wild — Parallel Engine Fuzz: axes mirati
 * Run:  node tests/fuzz-axes.cjs
 *
 * Oltre alla campagna generica (tests/fuzz.cjs), stressa assi specifici:
 * NPC (trader/Mira/Bram/trainer), dungeon & torre, narrativa (cutscene/whisper/
 * voce Sovereign/diario), pesca & volo, custom Pals, pannelli UI, economia e
 * cicli stagionali/meteo. Ogni asse verifica invarianti e ripristina lo stato.
 * Esce con codice 1 se trova problemi. */
'use strict';
const { buildCore } = require('./harness');
const M = buildCore();
const { G } = M;

M.setSilent(true);
let issues = 0, exceptions = 0;
const problems = [];
function issue(axis, msg) { issues++; problems.push(`[${axis}] ${msg}`); console.log('  ⚠ ' + problems[problems.length - 1]); }
function check(axis, cond, msg) { if (!cond) issue(axis, msg); }
function invariants(axis) {
  const p = G.player;
  check(axis, !isNaN(p.x) && !isNaN(p.y) && !isNaN(p.hp) && !isNaN(G.hunger), 'NaN state');
  check(axis, p.hp >= 0 && G.hunger >= 0, 'negative hp/hunger');
  check(axis, !G.flying && !M.solidAt(p.x, p.y), 'player stuck on solid');
  check(axis, G.wilds.length <= 160, 'wild count ' + G.wilds.length);
  for (const w of G.wilds) { check(axis, !isNaN(w.hp) && w.maxHp > 0, 'bad wild ' + w.id); break; }
  for (const t of G.team) check(axis, t.maxHp > 0 && !isNaN(t.atk) && t.spd > 0, 'bad team pal');
  for (const q of G.quests) check(axis, q.done <= q.t, 'quest over target ' + q.id);
  for (const k in G.inv) if (typeof G.inv[k] === 'number' && G.inv[k] < 0) issue(axis, 'negative inv.' + k);
}
function fresh(seed, diff, mode) {
  M.setSeed(seed); G.mode = mode; G.diff = diff;
  M.newWorld();
  G.sph = [10, 5, 2]; G.inv.ess = 80; G.inv.grass = 20; G.inv.wood = 20; G.inv.stone = 20; G.inv.coins = 60;
  G.team = [M.makeOwned(M.speciesOf('groveheart'), 12), M.makeOwned(M.speciesOf('emberpup'), 8)];
  G.active = 0; G.player.hp = G.player.maxHp;
}
function guard(axis, fn) { try { fn(); } catch (e) { exceptions++; issue(axis, 'threw: ' + e.message); } }

/* ============ ASSE 1: NPC (trader / Mira / Bram / trainer) ============ */
function axisNPC() {
  const a = 'npc';
  fresh(7, 'normal', 'story');
  for (let i = 0; i < 40; i++) {
    guard(a, () => {
      G.trader = { x: G.player.x + 2 * M.TILE, y: G.player.y, t: 30 };
      M.tradeSell('grass'); M.tradeSell('wood'); M.tradeBuy(0); M.tradeBuy(1);
      G.mira = { x: G.player.x, y: G.player.y, t: 30, cd: 0 };
      M.talkMira(); M.talkMira(); /* il secondo è a cooldown */
      G.bram = { x: G.player.x, y: G.player.y, t: 30 };
      M.buyUpgrade(0); M.buyUpgrade(2);
      G.trainer = { x: G.player.x + 1 * M.TILE, y: G.player.y, t: 30, rematchT: 0, defeated: false, name: 'Ace Avery', col: '#fff', team: [M.makeWild(M.speciesOf('emberpup'), { x: 0, y: 0 })], idx: 0 };
      M.challengeTrainer();
      if (G.duel && G.duel.e) { G.duel.e.hp = 0; M.defeatPal(G.duel.e); }
      M.updateTrainer(0.1); M.updateMira(0.1); M.updateBram(0.1);
      M.updateTrader(0.1);
    });
    invariants(a);
  }
  check(a, (G.inv.coins || 0) >= 0, 'coins negative');
  return a;
}

/* ============ ASSE 2: dungeon & torre ============ */
function axisDungeonTower() {
  const a = 'dungeon/tower';
  fresh(42, 'hard', 'story');
  guard(a, () => { M.initRuins(); M.initBosses(); });
  for (let r = 0; r < G.ruins.length; r++) {
    guard(a, () => {
      G.player.x = G.ruins[r].x; G.player.y = G.ruins[r].y;
      M.enterDungeon(G.ruins[r]);
      for (let f = 0; f < 4 && G.dungeon; f++) {
        G.wilds = G.wilds.filter(w => !w.dungeon);
        G.dungeon.spawnT = 0;
        M.updateDungeon(0.1);
        if (G.dungeon && G.dungeon.vault) { G.player.x = G.dungeon.vault.x; G.player.y = G.dungeon.vault.y; M.updateDungeon(0.1); }
      }
      invariants(a);
    });
  }
  /* torre: costruita sulla posizione sicura corrente del giocatore */
  guard(a, () => {
    G.buildings.push({ id: 'tower', x: G.player.x, y: G.player.y });
    M.enterTower();
    for (let f = 0; f < 12 && G.tower; f++) {
      G.wilds = G.wilds.filter(w => !w.tower);
      G.tower.spawnT = 0;
      M.updateTower(0.1);
    }
    check(a, G.tower === null, 'tower not conquered');
    invariants(a);
  });
  return a;
}

/* ============ ASSE 3: narrativa (cutscene/whisper/voce/diario/storia) ============ */
function axisNarrative() {
  const a = 'narrative';
  fresh(42, 'normal', 'story');
  M.setSilent(false); /* con __TEST__ i toast/timer sono safe */
  guard(a, () => {
    for (const id of Object.keys(M.CUTSCENES)) {
      G.memories = {};
      M.playCutscene(id);
      check(a, G.memories[id] === 1, 'cutscene ' + id + ' not flagged');
      for (let i = 0; i < 20; i++) M.cutNext(); /* drena la coda */
    }
    for (const b of Object.keys(M.BIOME_WHISPERS)) { G.stat.biomeVoices = {}; M.whisper(M.BIOME_WHISPERS[b]); }
    M.sovereignSays('test');
    M.renderDiary();
    M.showStory();
    for (let i = 0; i < 10; i++) M.storyNext();
  });
  M.setSilent(true);
  check(a, Object.keys(G.memories).length >= 0, 'memories ok');
  invariants(a);
  return a;
}

/* ============ ASSE 4: pesca & volo ============ */
function axisFishFly() {
  const a = 'fish/fly';
  fresh(1234, 'normal', 'story');
  G.inv.rod = 1;
  /* trova una riva e pesca molte volte */
  outer:
  for (let tx = 100; tx < 300; tx++) for (let ty = 100; ty < 300; ty++) {
    let wet = false;
    for (const [ox, oy] of [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]]) if (M.biomeAt(tx + ox, ty + oy) === 'ocean') { wet = true; break; }
    if (wet && !M.solidAt(tx * M.TILE + 8, ty * M.TILE + 8)) {
      G.player.x = tx * M.TILE + 8; G.player.y = ty * M.TILE + 8;
      for (let i = 0; i < 25; i++) {
        guard(a, () => {
          M.startFishing();
          if (G.fishing) { G.fishing.t = G.fishing.biteT + 0.1; M.updateFishing(0.05); M.reelIn(); }
        });
      }
      break outer;
    }
  }
  check(a, Object.values(G.dex).some(v => v >= 1), 'no fish caught');
  /* volo: attraversa l'oceano */
  guard(a, () => {
    G.team[0] = M.makeOwned(M.speciesOf('prismoth'), 15); G.active = 0;
    M.toggleRide();
    check(a, G.flying === true, 'not flying');
    let crossed = false;
    for (let i = 0; i < 300 && !crossed; i++) {
      G.stickVec = { x: 1, y: 0 };
      M.stepSim(0.05);
      if (M.biomeAt(Math.floor(G.player.x / M.TILE), Math.floor(G.player.y / M.TILE)) === 'ocean') crossed = true;
    }
    check(a, crossed, 'flight did not cross ocean');
    /* torna su un tile non solido (e non-oceano) prima di atterrare */
    for (let i = 0; i < 900; i++) {
      if (!M.solidAt(G.player.x, G.player.y) && M.biomeAt(Math.floor(G.player.x / M.TILE), Math.floor(G.player.y / M.TILE)) !== 'ocean') break;
      G.stickVec = { x: -1, y: 0 };
      M.stepSim(0.05);
    }
    G.stickVec = null; M.toggleRide();
    check(a, !M.solidAt(G.player.x, G.player.y), 'landed on a solid tile');
  });
  invariants(a);
  return a;
}

/* ============ ASSE 5: custom Pals (sintesi/import/spawn/cattura) ============ */
function axisCustom() {
  const a = 'custom';
  fresh(7, 'normal', 'story');
  G.inv.ess = 500;
  guard(a, () => {
    for (let i = 0; i < 6; i++) {
      Object.assign(M.E, M.sanitizeCustom({ n: 'Fuzz' + i, col: '#ff00ff', shape: i % 6, type: 'fire', hp: 90, atk: 25, spd: 1.8, trait: 'Berserk', skills: [['Ember', 12, 2.0]] }));
      M.createCustomPal();
    }
    check(a, G.team.length >= 6, 'customs not added');
    const sp = M.sanitizeCustom({ n: 'Visitor', col: '#00ff88', shape: 2, type: 'ice', hp: 60, atk: 15, spd: 1.4, skills: [['Frost Shard', 12, 2.0]] });
    sp.id = 'custom_visitor';
    M.spawnCustomWild(sp);
    check(a, G.wilds.some(w => w.isCustom), 'custom wild not spawned');
    const enc = M.encodePal({ n: 'ViaUrl', col: '#ff8800', shape: 1, type: 'water', hp: 50, atk: 12, spd: 1.3, skills: [['Bubble Bite', 7, 1.0]] });
    globalThis.location.hash = '#pal=' + enc;
    M.importCustomPal();
    check(a, M.pendingCustom !== null, 'url import failed');
    globalThis.location.hash = '';
  });
  invariants(a);
  return a;
}

/* ============ ASSE 6: pannelli UI ============ */
function axisPanels() {
  const a = 'panels';
  fresh(42, 'easy', 'story');
  G.team.push(M.makeOwned(M.speciesOf('grassling'), 5));
  guard(a, () => {
    for (const id of ['pTeam', 'pCraft', 'pLab', 'pBuild', 'pQuests', 'pChest', 'pTrade', 'pDex', 'pDiary', 'pEdit', 'pAch', 'pTest', 'pSmith']) {
      G.quests.forEach(q => q.done = q.t);
      M.renderPanel(id);
    }
    M.renderQuests(); M.renderDex(); M.renderDiary(); M.renderAch(); M.renderTest(); M.renderSmith();
    M.applyLang(); M.renderOpts();
  });
  return a;
}

/* ============ ASSE 7: economia (compravendita random) ============ */
function axisEconomy() {
  const a = 'economy';
  fresh(99, 'normal', 'story');
  G.inv = { grass: 100, wood: 100, berry: 100, stone: 100, ess: 100, coins: 100, potion: 5, arrows: 5, sword: 1, bow: 1, cooked: 0, stew: 0, seeds: 5, scroll: 2 };
  G.sph = [5, 3, 1];
  for (let i = 0; i < 200; i++) {
    guard(a, () => {
      const r = Math.random();
      if (r < 0.25) M.tradeSell(['grass', 'wood', 'berry', 'stone', 'ess'][i % 5]);
      else if (r < 0.5) M.tradeBuy(i % 8);
      else if (r < 0.75) M.buyUpgrade(i % 3);
      else { G.inv.coins += 5; M.tradeBuy(7); }
    });
  }
  check(a, G.inv.coins >= 0, 'coins negative');
  for (const k in G.inv) if (typeof G.inv[k] === 'number' && G.inv[k] < 0) issue(a, 'negative inv.' + k);
  return a;
}

/* ============ ASSE 8: stagioni & meteo (fast-forward 56 giorni) ============ */
function axisSeasons() {
  const a = 'seasons/weather';
  fresh(1234, 'nightmare', 'story');
  guard(a, () => {
    for (let d = 0; d < 70; d++) { /* due cicli stagionali completi + eclissi */
      G.time = 0.999;
      M.updateTime(10); /* un roll di giorno */
      G.time = 0.9; /* notte: qui scattano meteore ed eclissi */
      G.weatherT = 0;
      M.updateWeather(0.01);
      check(a, ['clear', 'rain', 'sandstorm', 'aurora'].includes(G.weather), 'bad weather ' + G.weather);
      M.updateEvent(30); /* dt alto: gli eventi scadono subito e l'eclissi può scattare */
    }
  });
  check(a, Object.keys(G.stat.seasonsSeen || {}).length >= 4, 'not all seasons seen: ' + JSON.stringify(G.stat.seasonsSeen));
  check(a, (G.stat.eclipse || 0) >= 1, 'no eclipse in 56 days');
  invariants(a);
  return a;
}

/* ============ ASSE 9: crescita (XP/evoluzioni/fusioni/splice) ============ */
function axisGrowth() {
  const a = 'growth';
  fresh(7, 'hard', 'story');
  G.inv.ess = 300; G.inv.scroll = 10;
  guard(a, () => {
    for (let i = 0; i < 120; i++) M.addXp(G.team[0], 60); /* fino a Lv alto + evoluzione */
    G.team.push(M.makeOwned(M.speciesOf('grassling'), 5));
    M.fusePals(0, 1);
    M.spliceGene(0, 1, 'atk');
    M.teachSkill(0);
    check(a, G.team[0].lv >= 20, 'not leveled');
    check(a, G.team[0].maxHp > 0 && G.team[0].atk > 0 && G.team[0].spd > 0, 'bad stats after growth');
  });
  invariants(a);
  return a;
}

/* ============ ASSE 10: save/load round-trip ============ */
function axisSaveLoad() {
  const a = 'save/load';
  fresh(99, 'normal', 'speedrun');
  G.team.push(M.makeOwned(M.speciesOf('prismoth'), 10));
  G.customs.push(M.sanitizeCustom({ n: 'Saved', col: '#fff', shape: 3, type: 'void', hp: 60, atk: 14, spd: 1.4, skills: [['Shadow Lick', 12, 1.8]] }));
  G.customs[G.customs.length - 1].id = 'custom_saved';
  G.memories = { day7: 1, first_catch: 1 };
  G.speedrun.elapsed = 123;
  guard(a, () => { M.saveGame(); });
  const snap = M.snapshotG();
  G.player.x = 1; G.player.y = 1; G.team = []; G.memories = {};
  guard(a, () => { M.loadGame(); });
  check(a, G.player.x === snap.player.x, 'player not restored');
  check(a, G.team.length === snap.team.length, 'team not restored');
  check(a, G.memories.day7 === 1, 'memories not restored');
  check(a, M.speciesOf('custom_saved').n === 'Saved', 'custom species not restored');
  check(a, G.diff === 'normal' && G.mode === 'speedrun', 'mode/diff not restored');
  invariants(a);
  return a;
}

/* ============ ASSE 11: rendering (tutti gli stati) ============ */
function axisRender() {
  const a = 'render';
  fresh(42, 'hard', 'story');
  M.resize();
  guard(a, () => {
    /* stati di luce/giorno */
    for (const tm of [0.2, 0.6, 0.7, 0.9]) { G.time = tm; M.render(); M.renderMinimap(); M.refreshHud(); }
    /* meteo */
    for (const w of ['rain', 'sandstorm', 'aurora']) { G.weather = w; M.render(); }
    /* eclissi */
    G.event = { type: 'eclipse', t: 30 }; G.stat.eclipse = 1; M.render();
    G.event = { type: 'meteor', t: 25 }; M.render(); G.event = null;
    /* volo */
    G.team[0] = M.makeOwned(M.speciesOf('prismoth'), 12); M.toggleRide(); M.render(); M.toggleRide();
    /* dungeon e torre */
    M.initRuins();
    G.player.x = G.ruins[0].x; G.player.y = G.ruins[0].y; M.enterDungeon(G.ruins[0]); M.render();
    G.dungeon = null;
    G.buildings.push({ id: 'tower', x: G.player.x, y: G.player.y }); M.enterTower(); M.render(); G.tower = null;
    /* pesca */
    G.fishing = { t: 1, biteT: 2, bitten: true, win: 1 }; M.render(); G.fishing = null;
    /* boss / rift / echo / custom */
    G.rift = { x: G.player.x, y: G.player.y }; M.render();
    M.spawnFinalBoss(); M.render();
    const sp = M.sanitizeCustom({ n: 'R', col: '#f0f', shape: 1, type: 'fire', hp: 60, atk: 12, spd: 1.4, skills: [['Ember', 12, 2]] });
    sp.id = 'custom_r'; M.spawnCustomWild(sp); M.render();
    M.whisper('x'); M.sovereignSays('y');
  });
  check(a, true, 'render ran');
  return a;
}

/* ============ ASSE 12: chaos / monkey driver ============ */
function axisChaos() {
  const a = 'chaos';
  fresh(7, 'nightmare', 'story');
  G.sph = [9, 9, 9]; G.inv.ess = 500; G.inv.coins = 500; G.inv.grass = 50; G.inv.wood = 50; G.inv.stone = 50; G.inv.arrows = 50;
  G.inv.rod = 1; G.team.push(M.makeOwned(M.speciesOf('prismoth'), 10));
  const acts = [
    () => M.throwSphere([0, 1, 2][Math.floor(Math.random() * 3)]),
    () => M.attack(),
    () => M.shoot(),
    () => M.interact(),
    () => { G.stickVec = { x: Math.random() * 2 - 1, y: Math.random() * 2 - 1 }; },
    () => M.testGive(['spheres', 'ess', 'coins', 'heal', 'pal', 'wild', 'trainer', 'alpha', 'rift', 'quests'][Math.floor(Math.random() * 10)]),
    () => M.tradeBuy(Math.floor(Math.random() * 8)),
    () => M.tradeSell(['grass', 'wood', 'berry', 'stone', 'ess'][Math.floor(Math.random() * 5)]),
    () => { if (G.inv.rod && M.nearWater()) M.startFishing(); },
    () => { if (G.fishing) { G.fishing.t = G.fishing.biteT + 0.1; M.updateFishing(0.05); M.reelIn(); } },
    () => M.buyUpgrade(Math.floor(Math.random() * 3)),
    () => M.plantModeToggle(),
    () => { if (G.plantMode) M.tryPlant(G.player.x, G.player.y); }
  ];
  for (let i = 0; i < 1500; i++) {
    guard(a, acts[Math.floor(Math.random() * acts.length)]);
    guard(a, () => M.stepSim(0.05));
    if (i % 100 === 0) invariants(a);
  }
  invariants(a);
  return a;
}

/* ============ ASSE 13: endgame completo ============ */
function axisEndgame() {
  const a = 'endgame';
  fresh(42, 'normal', 'story');
  G.team = [M.makeOwned(M.speciesOf('groveheart'), 25), M.makeOwned(M.speciesOf('prismoth'), 20)];
  G.active = 0; G.inv.ess = 200; G.sph = [9, 9, 9];
  M.initQuests();
  guard(a, () => {
    /* completa cap.1-3 → si apre la rift */
    for (const q of G.quests) if (q.ch <= 3) q.done = q.t;
    M.maybeSpawnRift();
    check(a, !!G.rift, 'rift did not open');
    /* eclissi + echi durante la via */
    M.startEclipse();
    check(a, G.wilds.filter(w => w.echo).length === 3, 'echoes missing');
    G.event = null;
    /* confessione → boss (SILENT=false: voci + cutscene devono girare) */
    M.setSilent(false);
    M.playCutscene('confession', M.spawnFinalBoss);
    for (let i = 0; i < 10; i++) M.cutNext();
    const boss = G.wilds.find(w => w.isFinal);
    check(a, !!boss, 'boss not spawned');
    /* voce alle soglie + minion */
    boss.hp = boss.maxHp * 0.74; M.updateFinalBoss(0.01);
    boss.hp = boss.maxHp * 0.49; M.updateFinalBoss(0.01);
    boss.hp = boss.maxHp * 0.29; M.updateFinalBoss(0.01);
    check(a, G.wilds.some(w => w.isMinion), 'minions not summoned');
    check(a, G.lastBossVoice && G.lastBossVoice.includes('forgive'), 'no 30% voice');
    /* sconfitta → redenzione → complete */
    M.defeatPal(boss);
    check(a, G.complete === true, 'not complete');
    check(a, G.memories.redemption === 1, 'redemption cutscene missing');
    for (let i = 0; i < 10; i++) M.cutNext();
    check(a, G.quests.find(q => q.id === 'fb1').done === 1, 'final quest not done');
    M.setSilent(true);
    invariants(a);
  });
  return a;
}

/* ============ ASSE 14: asset / PWA ============ */
function axisAssets() {
  const a = 'assets';
  const fs = require('fs'), path = require('path');
  const base = path.join(__dirname, '..');
  guard(a, () => {
    const jsFiles = fs.readdirSync(path.join(base, 'js')).sort();
    check(a, jsFiles.length >= 25, 'js files count ' + jsFiles.length);
    /* index.html referenzia tutti i js in ordine */
    const html = fs.readFileSync(path.join(base, 'index.html'), 'utf8');
    let pos = -1, ordered = true;
    for (const f of jsFiles) {
      const idx = html.indexOf('js/' + f);
      if (idx < 0 || idx < pos) { ordered = false; break; }
      pos = idx;
    }
    check(a, ordered, 'index.html script order mismatch');
    /* sw.js compila */
    new Function(fs.readFileSync(path.join(base, 'sw.js'), 'utf8'));
    /* manifest JSON valido */
    const man = JSON.parse(fs.readFileSync(path.join(base, 'manifest.webmanifest'), 'utf8'));
    check(a, man.start_url && man.display === 'standalone' && man.icons.length === 2, 'manifest invalid');
    /* icone PNG valide (firma + IHDR) */
    for (const ic of ['icon-192.png', 'icon-512.png']) {
      const b = fs.readFileSync(path.join(base, ic));
      check(a, b.slice(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])), ic + ' bad signature');
      check(a, b.readUInt32BE(16) === (ic.includes('192') ? 192 : 512), ic + ' bad size');
    }
    /* README e test presenti */
    check(a, fs.existsSync(path.join(base, 'README.md')) && fs.existsSync(path.join(base, 'tests', 'README.md')), 'docs missing');
    /* il manifest SW copre i file js */
    const sw = fs.readFileSync(path.join(base, 'sw.js'), 'utf8');
    check(a, sw.includes("'./js/"), 'sw does not cache js/');
  });
  return a;
}

/* ============ ASSE 15: condivisione end-to-end (URL Pal) ============ */
function axisShare() {
  const a = 'share';
  fresh(7, 'normal', 'story');
  G.inv.ess = 300;
  guard(a, () => {
    Object.assign(M.E, M.sanitizeCustom({ n: 'Gift', col: '#ffaa00', shape: 4, type: 'void', hp: 80, atk: 20, spd: 1.7, trait: 'Berserk', skills: [['Void Pulse', 38, 4]] }));
    M.createCustomPal();
    const gifted = G.team[G.team.length - 1];
    const enc = M.encodePal({ n: 'Gift', col: '#ffaa00', shape: 4, type: 'void', hp: 80, atk: 20, spd: 1.7, trait: 'Berserk', skills: [['Void Pulse', 38, 4]] });
    /* "un altro giocatore": mondo nuovo, importa il link */
    M.newWorld();
    G.team = [M.makeOwned(M.speciesOf('grassling'), 6)]; G.active = 0;
    globalThis.location.hash = '#pal=' + enc;
    M.importCustomPal();
    check(a, M.pendingCustom !== null, 'import failed');
    M.spawnCustomWild(M.pendingCustom);
    const w = G.wilds.find(x => x.isCustom);
    check(a, !!w, 'custom wild not spawned');
    /* catturalo: lancia fino a quando non entra in squadra */
    w.hp = 1;
    const dx = w.x - G.player.x, dy = w.y - G.player.y;
    G.player.dir = Math.atan2(dy, dx);
    G.sph = [5, 0, 0];
    for (let t = 0; t < 10 && !G.team.some(p => String(p.id).startsWith('custom')); t++) {
      G.player.dir = Math.atan2(w.y - G.player.y, w.x - G.player.x);
      M.throwSphere(0);
      for (let i = 0; i < 20; i++) M.updateProjectiles(0.05);
    }
    check(a, G.team.some(p => String(p.id).startsWith('custom')), 'custom pal not caught');
    check(a, Object.keys(G.dex).some(k => String(k).startsWith('custom')), 'custom id not in dex');
    globalThis.location.hash = '';
    invariants(a);
  });
  return a;
}

/* ============ ASSE 16: i18n (tutti i pannelli in EN/IT) ============ */
function axisi18n() {
  const a = 'i18n';
  fresh(42, 'easy', 'story');
  guard(a, () => {
    for (const lang of ['en', 'it']) {
      M.setLang(lang);
      M.applyLang(); M.renderOpts();
      check(a, M.t('btnTeam') === M.L[lang].btnTeam, lang + ' btnTeam mismatch');
      for (const id of ['pTeam', 'pCraft', 'pLab', 'pBuild', 'pQuests', 'pChest', 'pTrade', 'pDex', 'pDiary', 'pEdit', 'pAch', 'pTest', 'pSmith']) M.renderPanel(id);
      M.renderQuests(); M.renderDex(); M.renderDiary(); M.renderAch(); M.renderTest(); M.renderSmith();
    }
    /* simmetria chiavi */
    check(a, Object.keys(M.L.en).length === Object.keys(M.L.it).length, 'key count mismatch');
    check(a, Object.keys(M.L.en).every(k => M.L.it[k]), 'en→it missing');
    check(a, Object.keys(M.L.it).every(k => M.L.en[k]), 'it→en missing');
  });
  return a;
}

/* ============ ASSE 17: movimento (tasti/stick/cavalcatura/volo/collisioni/clamp) ============ */
function axisMovement() {
  const a = 'movement';
  fresh(1234, 'normal', 'story');
  guard(a, () => {
    /* disattiva il bot: in questo asse muoviamo noi il giocatore */
    M.BOT.t = 1e9; M.BOT.data = null; M.BOT.goal = 'wander';
    /* helper: posizione sicura con almeno un vicino cardinale libero */
    const openSpot = () => {
      for (let r = 0; r < 300; r++) {
        for (let a = 0; a < 12; a++) {
          const tx = Math.floor(750 + Math.cos(a / 12 * 6.28) * r), ty = Math.floor(750 + Math.sin(a / 12 * 6.28) * r);
          const px = tx * M.TILE + 8, py = ty * M.TILE + 8;
          if (M.solidAt(px, py) || M.biomeAt(tx, ty) === 'ocean') continue;
          let free = 0;
          for (const [ox, oy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
            if (!M.solidAt(px + ox * M.TILE, py + oy * M.TILE) && M.biomeAt(tx + ox, ty + oy) !== 'ocean') free++;
          }
          if (free >= 2) return { x: px, y: py };
        }
      }
      return M.findSpawn();
    };
    const respawn = () => { const s = openSpot(); G.player.x = s.x; G.player.y = s.y; if (G.team[G.active]) { G.team[G.active].x = s.x; G.team[G.active].y = s.y; } };
    /* WASD: prova tutte le direzioni da una posizione fresca, almeno una deve muovere */
    respawn();
    let moved = false;
    const dirs = [['KeyW', 0, -1], ['KeyS', 0, 1], ['KeyA', -1, 0], ['KeyD', 1, 0]];
    for (const [k, dx, dy] of dirs) {
      respawn();
      const before = { x: G.player.x, y: G.player.y };
      G.keys[k] = true;
      for (let i = 0; i < 15; i++) M.stepSim(0.05);
      G.keys[k] = false;
      if (Math.hypot(G.player.x - before.x, G.player.y - before.y) > 8) moved = true;
    }
    check(a, moved, 'no WASD direction moved (stuck?)');
    /* stick: prova tutte le direzioni */
    respawn();
    let stickMoved = false;
    for (const [sx, sy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      respawn();
      const before = { x: G.player.x, y: G.player.y };
      for (let i = 0; i < 15; i++) { G.stickVec = { x: sx, y: sy }; M.stepSim(0.05); } /* re-imposta ogni step: il bot lo azzera */
      G.stickVec = null;
      if (Math.hypot(G.player.x - before.x, G.player.y - before.y) > 8) stickMoved = true;
    }
    check(a, stickMoved, 'no stick direction moved (stuck?)');
    /* collisione con un albero: trova un tile solido e prova ad attraversarlo */
    let tree = null;
    for (let tx = 0; tx < 400 && !tree; tx++) for (let ty = 0; ty < 400; ty++) {
      if (M.solidAt(tx * M.TILE + 8, ty * M.TILE + 8)) { tree = { x: tx * M.TILE + 8, y: ty * M.TILE + 8 }; break; }
    }
    if (tree) {
      const before = { x: G.player.x, y: G.player.y };
      /* cammina verso l'albero per 40 step */
      const ang = Math.atan2(tree.y - G.player.y, tree.x - G.player.x);
      G.stickVec = { x: Math.cos(ang), y: Math.sin(ang) };
      for (let i = 0; i < 40; i++) M.stepSim(0.05);
      G.stickVec = null;
      check(a, M.solidAt(G.player.x, G.player.y) === false, 'walked into solid');
    }
    /* clamp dungeon: il giocatore resta dentro il cerchio */
    M.initRuins();
    G.player.x = G.ruins[0].x; G.player.y = G.ruins[0].y;
    M.enterDungeon(G.ruins[0]);
    G.stickVec = { x: 1, y: 1 };
    for (let i = 0; i < 200; i++) M.stepSim(0.05);
    G.stickVec = null;
    const d = M.G.dungeon;
    if (d) check(a, Math.hypot(G.player.x - d.x, G.player.y - d.y) <= d.R + 2, 'player escaped dungeon bounds');
    else check(a, true, 'dungeon cleared early — ok');
    G.dungeon = null;
    invariants(a);
  });
  return a;
}

/* ============ ASSE 18: craft-everything (tutte le ricette/strutture/upgrade) ============ */
function axisCraft() {
  const a = 'craft';
  fresh(99, 'easy', 'zen');
  G.inv = { grass: 999, wood: 999, berry: 999, stone: 999, ess: 999, coins: 999, potion: 0, arrows: 0, sword: 0, bow: 0, cooked: 0, stew: 0, seeds: 0, scroll: 0, rod: 0, lure: 0 };
  G.sph = [0, 0, 0];
  guard(a, () => {
    /* tutte le ricette */
    for (let i = 0; i < M.RECIPES.length; i++) {
      M.RECIPES[i].give();
      check(a, true, 'recipe ' + i);
    }
    check(a, G.sph[0] >= 1 && G.sph[1] >= 1 && G.sph[2] >= 1, 'spheres not crafted');
    check(a, G.inv.rod === 1 && G.inv.lure >= 1, 'fishing gear not crafted');
    /* tutte le strutture */
    for (const st of M.STRUCTURES) {
      G.buildMode = st.id;
      M.tryPlace(G.player.x, G.player.y);
      check(a, G.buildings.some(b => b.id === st.id), 'structure ' + st.id + ' not placed');
      G.buildMode = null;
    }
    /* tutti gli upgrade */
    for (let i = 0; i < M.UPGRADES.length; i++) M.buyUpgrade(i);
    check(a, G.inv.swordLv >= 1 && G.inv.bowLv >= 1, 'upgrades not applied');
    /* ranch: breeding */
    G.buildings.push({ id: 'ranch', x: G.player.x, y: G.player.y, b: null });
    G.team = [M.makeOwned(M.speciesOf('grassling'), 6), M.makeOwned(M.speciesOf('grassling'), 6)];
    const ranch = G.buildings.find(b => b.id === 'ranch');
    M.breedAtRanch(ranch);
    check(a, !!ranch.b, 'egg not started');
    ranch.b.t = 31; M.updateRanches(0.1);
    check(a, ranch.b.ready === true, 'egg not ready');
    M.breedAtRanch(ranch);
    check(a, G.team.length === 3, 'egg not hatched');
    for (const k in G.inv) if (typeof G.inv[k] === 'number' && G.inv[k] < 0) issue(a, 'negative inv.' + k);
  });
  invariants(a);
  return a;
}

/* ============ ASSE 19: proiettili & catture ============ */
function axisProjectiles() {
  const a = 'projectiles';
  fresh(42, 'normal', 'story');
  G.sph = [30, 30, 30];
  guard(a, () => {
    /* il boss finale NON è catturabile */
    G.team = [M.makeOwned(M.speciesOf('groveheart'), 20)]; G.active = 0;
    G.rift = { x: G.player.x + 2 * M.TILE, y: G.player.y };
    M.spawnFinalBoss();
    const boss = G.wilds.find(w => w.isFinal);
    boss.hp = 1;
    const before = G.wilds.length;
    G.player.dir = Math.atan2(boss.y - G.player.y, boss.x - G.player.x);
    for (let t = 0; t < 5; t++) { M.throwSphere(2); for (let i = 0; i < 20; i++) M.updateProjectiles(0.05); }
    check(a, G.wilds.some(w => w.isFinal), 'final boss was caught!');
    check(a, G.wilds.length === before, 'boss removed by spheres');
    /* frecce e proiettili multipli in volo */
    G.inv.arrows = 50; G.equip = 'bow';
    for (let i = 0; i < 20; i++) { M.shoot(); M.throwSphere(0); }
    check(a, G.projectiles.length >= 20, 'projectiles not stacking');
    for (let i = 0; i < 40; i++) M.updateProjectiles(0.05);
    check(a, G.projectiles.length === 0, 'projectiles leaked');
    /* cattura normale con molte sfere */
    G.wilds = [M.makeWild(M.speciesOf('grassling'), { x: G.player.x + 2 * M.TILE, y: G.player.y })];
    const w = G.wilds[0]; w.hp = 1;
    G.player.dir = Math.atan2(w.y - G.player.y, w.x - G.player.x);
    let caught = false;
    for (let t = 0; t < 8 && !caught; t++) { M.throwSphere(0); for (let i = 0; i < 20; i++) M.updateProjectiles(0.05); caught = G.team.some(p => p.id === 'grassling'); }
    check(a, caught, 'normal catch failed');
    invariants(a);
  });
  return a;
}

/* ============ ASSE 20: inventario & valute (zero/negativi/overflow) ============ */
function axisInventory() {
  const a = 'inventory';
  fresh(7, 'normal', 'story');
  guard(a, () => {
    /* zero e negativi */
    G.inv = { grass: 0, wood: 0, berry: 0, stone: 0, ess: 0, coins: 0, potion: 0, arrows: 0, sword: 0, bow: 0, cooked: 0, stew: 0, seeds: 0, scroll: 0, rod: 0, lure: 0 };
    G.sph = [0, 0, 0];
    M.tradeSell('grass'); M.tradeBuy(0); M.buyUpgrade(0);
    check(a, G.inv.coins === 0 && G.sph[0] === 0, 'trade at zero broke invariants');
    /* importi enormi */
    G.inv.coins = 999999; G.inv.ess = 999999; G.inv.grass = 999999;
    for (let i = 0; i < 30; i++) { M.tradeBuy(0); M.tradeBuy(3); M.tradeSell('grass'); }
    check(a, G.inv.coins >= 0 && G.inv.ess >= 0 && G.inv.grass >= 0, 'negative after big trades');
    /* craft con risorse sufficienti e insufficienti */
    G.inv.grass = 0; G.inv.ess = 0;
    const rec = M.RECIPES[0];
    rec.give(); /* give senza costo: è il flow del gioco? no: il gioco sottrae dopo */
    G.inv.ess = 5; G.inv.grass = 5;
    rec.give(); G.inv.grass -= 2; G.inv.ess -= 1;
    check(a, G.sph[0] >= 2 && G.inv.grass >= 0 && G.inv.ess >= 0, 'craft math wrong');
    for (const k in G.inv) if (typeof G.inv[k] === 'number' && G.inv[k] < 0) issue(a, 'negative inv.' + k);
  });
  return a;
}

/* ============ ASSE 21: breeding & gene lab profondi ============ */
function axisBreedLab() {
  const a = 'breed/lab';
  fresh(42, 'easy', 'story');
  G.inv.ess = 500; G.inv.scroll = 20;
  guard(a, () => {
    /* catena di breeding */
    G.buildings.push({ id: 'ranch', x: G.player.x, y: G.player.y, b: null });
    const ranch = G.buildings.find(b => b.id === 'ranch');
    for (let gen = 0; gen < 3; gen++) {
      G.team = [M.makeOwned(M.speciesOf('grassling'), 8), M.makeOwned(M.speciesOf('grassling'), 8)];
      M.breedAtRanch(ranch);
      check(a, !!ranch.b, 'gen ' + gen + ' egg not started');
      ranch.b.t = 31; M.updateRanches(0.1);
      M.breedAtRanch(ranch);
      check(a, G.team.length === 3, 'gen ' + gen + ' not hatched');
    }
    /* splice di tutti i geni + fusione */
    G.team = [M.makeOwned(M.speciesOf('grassling'), 6), M.makeOwned(M.speciesOf('emberpup'), 6)];
    for (const gene of ['hp', 'atk', 'spd', 'color', 'trait']) { M.spliceGene(0, 1, gene); }
    check(a, G.team[0].atk > 0 && G.team[0].maxHp > 0, 'splice broke stats');
    G.team[1] = M.makeOwned(M.speciesOf('grassling'), 6);
    M.fusePals(0, 1);
    check(a, G.team.length === 1, 'fusion did not merge');
    check(a, G.team[0].maxHp > 0, 'fusion broke stats');
    M.teachSkill(0);
    check(a, (G.team[0].skills || []).length >= 1, 'skill not taught');
    invariants(a);
  });
  return a;
}

/* ============ ASSE 22: trappole dungeon (danno/cooldown/volta senza chiave) ============ */
function axisTraps() {
  const a = 'traps';
  fresh(99, 'normal', 'story');
  guard(a, () => {
    M.initRuins();
    G.player.x = G.ruins[0].x; G.player.y = G.ruins[0].y;
    M.enterDungeon(G.ruins[0]);
    /* salta al floor 3 per le trappole */
    G.dungeon.floor = 2; G.dungeon.left = 0; G.dungeon.spawnT = 0; G.wilds = G.wilds.filter(w => !w.dungeon);
    M.updateDungeon(0.1); /* → floor 3 con trappole + chiave */
    check(a, G.dungeon.traps.length >= 4, 'no traps on floor 3');
    check(a, G.dungeon.key === true, 'no key on floor 3');
    /* cammina sulle trappole: danno + cooldown */
    const tr = G.dungeon.traps[0];
    G.player.x = tr.x; G.player.y = tr.y;
    const hp0 = G.player.hp;
    G.player.hp = Math.min(G.player.hp, 100);
    M.updateDungeon(0.05);
    check(a, G.player.hp < hp0, 'trap dealt no damage');
    check(a, tr.t > 0, 'trap did not re-arm');
    const hpAfter = G.player.hp;
    M.updateDungeon(0.05);
    check(a, G.player.hp === hpAfter, 'trap hit twice without cooldown');
    /* volta senza chiave (reset) */
    G.dungeon = null; G.wilds = [];
    G.player.x = G.ruins[1].x; G.player.y = G.ruins[1].y;
    M.enterDungeon(G.ruins[1]);
    G.dungeon.key = false; G.dungeon.floor = 3; G.dungeon.left = 0; G.dungeon.spawnT = 0; G.dungeon.vault = null;
    G.wilds = G.wilds.filter(w => !w.dungeon);
    const ess0 = G.inv.ess;
    M.updateDungeon(0.1);
    check(a, G.dungeon === null, 'no-key clear did not end dungeon');
    check(a, G.inv.ess >= ess0 + 8, 'no-key reward wrong');
    invariants(a);
  });
  return a;
}

/* ============ ASSE 23: matrice combattimento (tipi × meteo × eclipse × difficoltà) ============ */
function axisCombatMatrix() {
  const a = 'combat-matrix';
  fresh(7, 'normal', 'story');
  guard(a, () => {
    const types = ['grass', 'fire', 'ice', 'water', 'void'];
    let total = 0, min = 1e9, max = 0;
    for (const at of types) for (const df of types) {
      const d = M.dmgCalc(20, at, df, 1, undefined, 'clear');
      check(a, d >= 1 && d <= 40, at + '>' + df + ' out of range ' + d);
      total += d; min = Math.min(min, d); max = Math.max(max, d);
    }
    check(a, max > min, 'type table flat');
    /* meteo: acqua+25% pioggia, fuoco-20% */
    const rainFire = M.dmgCalc(20, 'fire', 'grass', 1, undefined, 'rain');
    const clearFire = M.dmgCalc(20, 'fire', 'grass', 1, undefined, 'clear');
    check(a, rainFire < clearFire, 'rain does not nerf fire');
    /* doppio tipo: difesa col tipo più forte (media su 240 campioni — c'è random) */
    const mean = f => { let s = 0; for (let i = 0; i < 240; i++) s += f(); return s / 240; };
    const vsDual = mean(() => M.dmgCalc(20, 'fire', 'grass', 1, 'fire', 'clear'));
    const vsSingle = mean(() => M.dmgCalc(20, 'fire', 'grass', 1, undefined, 'clear'));
    check(a, vsDual <= vsSingle + 1.0, 'dual defense not honored');
    /* eclissi ×1.5 e difficoltà */
    G.event = { type: 'eclipse', t: 10 };
    const dmgE = M.dmgCalc(20, 'grass', 'grass', 1, undefined, 'clear') * M.eclipseMult();
    G.event = null;
    check(a, dmgE >= 20, 'eclipse mult wrong');
    G.diff = 'nightmare';
    check(a, M.diffMult('dmgIn') === 1.8 && M.diffMult('hp') === 1.5, 'diff mults wrong');
    G.diff = 'normal';
  });
  return a;
}

/* ============ ASSE 24: passi temporali estremi / autosave ai confini ============ */
function axisTimestep() {
  const a = 'timestep';
  fresh(1234, 'normal', 'story');
  guard(a, () => {
    /* dt estremi e negativi */
    for (const dt of [0.001, 0.049, 0.05, 0.3, 1.0]) {
      for (let i = 0; i < 20; i++) M.stepSim(dt);
      invariants(a);
    }
    /* dt negativi non devono rompere lo stato */
    M.stepSim(-0.05);
    invariants(a);
    /* autosave al confine di giorno (via saveGame diretto, il timer è nel loop) */
    G.time = 0.999;
    for (let i = 0; i < 5; i++) M.updateTime(10);
    M.saveGame();
    const saved = JSON.parse(globalThis.localStorage.getItem('pocketwild_save'));
    check(a, saved.day === G.day && saved.player.hp === G.player.hp, 'autosave mismatch');
  });
  return a;
}

/* ============ ASSE 25: flood di spawn (cap + meteore + eclissi) ============ */
function axisSpawnFlood() {
  const a = 'spawn-flood';
  fresh(42, 'nightmare', 'story');
  guard(a, () => {
    G.event = { type: 'meteor', t: 100 };
    for (let i = 0; i < 400; i++) M.spawnWild();
    check(a, G.wilds.length <= 70, 'wild cap broken: ' + G.wilds.length);
    G.event = { type: 'eclipse', t: 100 };
    G.stat.eclipse = 1;
    for (let i = 0; i < 400; i++) M.spawnWild();
    check(a, G.wilds.length <= 70, 'eclipse flood broke cap');
    G.event = null;
    /* boss + wild insieme */
    M.initBosses();
    for (const b of G.bosses) G.wilds.push(b);
    for (let i = 0; i < 300; i++) M.spawnWild();
    check(a, G.wilds.length <= 100, 'wilds+bosses too many');
    let allSane = true;
    for (const w of G.wilds) if (isNaN(w.hp) || !w.maxHp || w.maxHp <= 0) allSane = false;
    check(a, allSane, 'insane wild after flood');
  });
  return a;
}

/* ============ ASSE 26: isolamento tra mondi (due save non si mescolano) ============ */
function axisSaveIsolation() {
  const a = 'save-isolation';
  fresh(7, 'normal', 'story');
  guard(a, () => {
    /* posizione A su terraferma (loadGame migra via dall'oceano) */
    let landA = null;
    for (let tx = 10; tx < 400 && !landA; tx++) for (let ty = 10; ty < 400; ty++) {
      const px = tx * M.TILE + 8, py = ty * M.TILE + 8;
      if (!M.solidAt(px, py) && M.biomeAt(tx, ty) !== 'ocean') { landA = { x: px, y: py }; break; }
    }
    G.player.x = landA.x; G.player.y = landA.y; G.team = [M.makeOwned(M.speciesOf('grassling'), 4)];
    M.saveGame();
    const saveA = globalThis.localStorage.getItem('pocketwild_save'); /* stringa A */
    /* mondo B: newWorld non deve far trapelare lo stato di A */
    M.newWorld();
    check(a, G.team.length === 0 && G.player.x !== 100, 'newWorld leaked world A state');
    /* posizione B su terraferma (loadGame migra via dall'oceano per i save vecchi) */
    let landB = null;
    for (let tx = 10; tx < 400 && !landB; tx++) for (let ty = 10; ty < 400; ty++) {
      const px = tx * M.TILE + 8, py = ty * M.TILE + 8;
      if (!M.solidAt(px, py) && M.biomeAt(tx, ty) !== 'ocean') { landB = { x: px, y: py }; break; }
    }
    G.player.x = landB.x; G.player.y = landB.y;
    G.team = [M.makeOwned(M.speciesOf('emberpup'), 9)];
    M.saveGame();
    const saveB = globalThis.localStorage.getItem('pocketwild_save');
    check(a, saveA !== saveB, 'saves identical');
    /* loadGame ripristina B */
    M.loadGame();
    check(a, G.player.x === landB.x && G.player.y === landB.y && G.team.length === 1 && G.team[0].id === 'emberpup', 'world B not restored');
    /* rimetti A nello storage → loadGame la ripristina fedelmente (niente contaminazione) */
    globalThis.localStorage.setItem('pocketwild_save', saveA);
    M.loadGame();
    check(a, G.player.x === landA.x && G.player.y === landA.y && G.team.length === 1 && G.team[0].id === 'grassling', 'world A not restored from its own save');
  });
  return a;
}

/* ============ ASSE 27: robustezza URL/hash ============ */
function axisUrlRobust() {
  const a = 'url';
  fresh(7, 'normal', 'story');
  guard(a, () => {
    /* hash malformati non devono crashare né registrare */
    for (const bad of ['#pal=!!!', '#pal=AAAA', '#pal=', '#pal=abc', '#pal=_-_', '#pal=eyJmb28iOiJiYXIifQ']) {
      globalThis.location.hash = bad;
      M.importCustomPal();
      check(a, true, 'bad hash ' + bad);
    }
    /* payload con unicode/emoji e campi mancanti → sanitize */
    const evil = { n: '🚀 Ñ ñ 😀', col: '#zz', shape: 99, type: 'bogus', hp: NaN, atk: 'x', spd: -5, skills: 'nope', trait: 'zz' };
    const enc = M.encodePal(evil);
    globalThis.location.hash = '#pal=' + enc;
    M.importCustomPal();
    const p = M.pendingCustom;
    check(a, !!p, 'evil payload not imported');
    if (p) {
      check(a, p.n === '🚀 Ñ ñ 😀', 'unicode name lost');
      check(a, p.shape >= 0 && p.shape <= 5 && p.type === 'grass' && p.hp >= 30 && p.hp <= 130, 'sanitize failed');
      check(a, Array.isArray(p.skills), 'skills not array');
    }
    globalThis.location.hash = '';
    /* payload gigante (molte skill) → slice(0,3) */
    const big = { n: 'Big', col: '#fff', shape: 0, type: 'fire', hp: 60, atk: 12, spd: 1.2, skills: [['A', 1, 1], ['B', 2, 1], ['C', 3, 1], ['D', 4, 1], ['E', 5, 1]] };
    globalThis.location.hash = '#pal=' + M.encodePal(big);
    M.importCustomPal();
    check(a, (M.pendingCustom.skills || []).length <= 3, 'skills not capped');
    globalThis.location.hash = '';
  });
  return a;
}

/* ============ ASSE 28: completamento totale (achievement ai confini) ============ */
function axisCompletion() {
  const a = 'completion';
  fresh(42, 'easy', 'story');
  guard(a, () => {
    M.ACH.a = {};
    /* riempi il mondo: 33 specie viste e catturate */
    for (const sp of M.SPECIES) { G.seen[sp.id] = true; G.dex[sp.id] = 1; }
    G.stat.catches = 30; G.stat.evolves = 1; G.stat.eggs = 1; G.stat.trainers = 3;
    G.stat.alphas = 1; G.stat.splices = 1; G.stat.fusions = 1; G.stat.customs = 1;
    G.stat.eclipse = 1; G.stat.towerWins = 1; G.stat.fished = 1;
    G.stat.seasonsSeen = { 0: 1, 1: 1, 2: 1, 3: 1 };
    G.complete = true; G.day = 20; G.inv.coins = 150;
    G.buildings = [{}, {}, {}, {}, {}];
    G.running = true;
    M.checkAch();
    check(a, Object.keys(M.ACH.a).length >= 19, 'not all achievements: ' + Object.keys(M.ACH.a).length);
    /* diario e quest complete */
    M.initQuests();
    for (const q of G.quests) q.done = q.t;
    M.checkAch();
  });
  invariants(a);
  return a;
}

/* ============ RUN ============ */
const t0 = Date.now();
const axes = [axisNPC, axisDungeonTower, axisNarrative, axisFishFly, axisCustom, axisPanels, axisEconomy, axisSeasons, axisGrowth, axisSaveLoad,
  axisRender, axisChaos, axisEndgame, axisAssets, axisShare, axisi18n, axisMovement, axisCraft,
  axisProjectiles, axisInventory, axisBreedLab, axisTraps, axisCombatMatrix, axisTimestep, axisSpawnFlood, axisSaveIsolation, axisUrlRobust, axisCompletion];
let done = 0;
for (const ax of axes) {
  const name = ax();
  done++;
  const axisIssues = problems.filter(p => p.startsWith('[' + name + ']')).length;
  console.log(`  ${done}/${axes.length} ${name}: ${axisIssues === 0 ? '✓' : '✗ ' + axisIssues + ' issues'}`);
}
const wall = ((Date.now() - t0) / 1000).toFixed(1);
console.log(`\nAxes: ${axes.length} · Exceptions: ${exceptions} · Issues: ${issues} · Wall time: ${wall}s`);
if (issues || exceptions) {
  console.log('\nProblems found:');
  for (const p of problems) console.log('  - ' + p);
  process.exit(1);
}
console.log('✅ ALL AXES CLEAN');
process.exit(0);
