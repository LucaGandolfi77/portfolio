/* Pocket Wild — Node test harness
 * Stubs the browser environment (DOM/localStorage/window/location) and builds
 * the game core from ../js/*.js (load order = filename order), exposing the
 * internal functions needed by the test suite. No browser required. */
'use strict';
const fs = require('fs');
const path = require('path');

const noop = () => {};
const ctxStub = new Proxy({}, { get: (t, p) => p === 'canvas' ? { width: 0, height: 0 } : (() => ctxStub), set: () => true });
function mkEl() {
  const el = { value: '', textContent: '', innerHTML: '', onclick: null, dataset: {}, style: {},
    classList: { add: noop, remove: noop, toggle: () => false }, width: 0, height: 0 };
  return new Proxy(el, {
    get(t, p) {
      if (p in t) return t[p];
      if (p === 'getContext') return () => ctxStub;
      if (p === 'addEventListener') return noop;
      if (p === 'querySelector') return () => mkEl();
      if (p === 'querySelectorAll') return () => [];
      if (p === 'appendChild' || p === 'removeChild') return noop;
      if (p === 'getBoundingClientRect') return () => ({ left: 0, top: 0 });
      if (p === 'setPointerCapture' || p === 'closest') return noop;
      return t[p];
    },
    set(t, p, v) { t[p] = v; return true; }
  });
}
globalThis.document = { getElementById: () => mkEl(), querySelectorAll: () => [], createElement: () => mkEl(), querySelector: () => mkEl(), createTextNode: () => ({ nodeType: 3, nodeValue: '', textContent: '' }) };
globalThis.window = { AudioContext: undefined, webkitAudioContext: undefined, addEventListener: noop };
globalThis.addEventListener = noop;
const __ls = {};
globalThis.localStorage = { getItem: k => k in __ls ? __ls[k] : null, setItem: (k, v) => { __ls[k] = String(v); }, removeItem: k => { delete __ls[k]; } };
globalThis.performance = { now: () => 0 };
globalThis.requestAnimationFrame = noop;
globalThis.devicePixelRatio = 1; globalThis.innerWidth = 800; globalThis.innerHeight = 600;
globalThis.location = { hash: '', pathname: '/index.html', search: '', origin: 'http://test.local', protocol: 'http:' };
globalThis.history = { replaceState: () => {} };
globalThis.__TEST__ = true; /* cutscene: niente typewriter timer, testo immediato */

const EXPORTS = [
  'enterDungeon','spawnDungeonWave','dungeonTraps','dungeonClearReward','updateDungeon','enterTower','spawnTowerWave','updateTower',
  'makeTrainerTeam','updateTrainer','challengeTrainer','updateTrainerDuel','updateMira','updateBram','talkMira','buyUpgrade','renderSmith',
  'startFishing','updateFishing','reelIn','nearWater','defeatPal','spawnWild','startDuel','renderDex','renderEdit','renderLab','renderAch','renderTest',
  'newWorld','findSpawn','initRuins','initBosses','initQuests','questEvent','questChapterDone','questUnlocked','questReward',
  'maybeSpawnRift','spawnFinalBoss','updateFinalBoss','gameComplete','eclipseMult','startEclipse','spawnEcho','updateEvent',
  'createCustomPal','copyShareLink','spawnCustomWild','importCustomPal','sanitizeCustom','encodePal','decodePal',
  'snapshotG','restoreG','botDecide','botMove','botTick','stepSim','startSim','stopSim','simReport','testGive','seasonForTest',
  'checkAch','saveProfile','gatherMultOf','setSilent','stylePush','maybeImprint','toggleRide',
  'showStory','storyNext','skipStory','drawStory','addSphere',
  'G','SPECIES','CUSTOM_SPECIES','SEASONS','seasonOf','curSeason','anytimePool','weatherFor','updateTime','updateWorkPals','updateFarms',
  'speciesOf','makeWild','makeOwned','scalePal','addXp','TILE','dist','biomeAt','solidAt','circleHitsSolid',
  'hashSeed','mulberry32','clamp','toast','saveGame','xpNeed','TRAITS','TYPES','E','SKILL_POOL',
  'ACH','ACH_DEFS','BOT','RECIPES','STORY','MIRA_LINES','BRAM_LINES','AVERY_LINES','UPGRADES','WORLD_T','BIOMES','HABITS','SEA_POOL','CUTSCENES','playCutscene','cutNext','CUT','renderDiary','whisper','sovereignSays','updateBiomeVoice','BIOME_WHISPERS','LINA_NOTES','DIARY_FAVOURITES','diaryPageState','applyLang','renderOpts','t','setLang','diffMult','DIFFS','L','updateHunger','faint','setSeed','tradeSell','tradeBuy','renderPanel','spliceGene','fusePals','teachSkill','placeBuild','tryPlace','renderTeam','renderCraft','renderBuild','renderChest','renderTrade','renderQuests','updateWeather','loadGame','updateTrader','render','renderMinimap','refreshHud','moveInput','resize','throwSphere','attack','shoot','interact','updateProjectiles','plantModeToggle','tryPlant','breedAtRanch','updateRanches','drawPalShape','STRUCTURES','catchChance','dmgCalc'
];

function buildCore() {
  const dir = path.join(__dirname, '..', 'js');
  const files = fs.readdirSync(dir).sort();
  const code = files.map(f => fs.readFileSync(path.join(dir, f), 'utf8')).join('');
  const modulePath = path.join(__dirname, '.core.cjs');
  fs.writeFileSync(modulePath, code + '\nmodule.exports={' + EXPORTS.join(',') + ',get pendingCustom(){return pendingCustom;},get SEED(){return SEED;}};');
  const M = require(modulePath);
  return M;
}

module.exports = { buildCore };
