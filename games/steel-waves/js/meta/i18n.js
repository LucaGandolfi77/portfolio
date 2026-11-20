/* Steel Waves — dizionario IT/EN autonomo */
(function(){
'use strict';
var DICT = {
  it: {
    'nav.games': '🎮 Giochi',
    'menu.gacha': '🎲 RECUPERO NAVI',
    'menu.collection': '📖 COLLEZIONE',
    'menu.missions': '🎯 MISSIONI',
    'menu.pass': '🏅 PASS STAGIONALE',
    'menu.stats': '📊 STATISTICHE',
    'menu.rank': '🏆 CLASSIFICA',

    'gacha.title': 'Cantiere Navale',
    'gacha.subtitle': 'Recupera nuove navi dal relitto del Leviatano.',
    'gacha.pull1': 'Recupero ×1',
    'gacha.pull10': 'Recupero ×10',
    'gacha.cost1': '⚓ 160',
    'gacha.cost10': '⚓ 1600',
    'gacha.free': '🎁 Recupero gratuito',
    'gacha.freeUsed': 'Gratuito già usato oggi',
    'gacha.needAnchors': 'Ti servono più ⚓ Ancore',
    'gacha.pity': 'Garanzia SSR tra {n} recuperi',
    'gacha.rateup': 'RATE UP: {name}',
    'gacha.guaranteed': 'SSR garantita al prossimo recupero!',
    'gacha.banner': 'BANNER ATTIVO',
    'gacha.bannerDesc': 'Navi da guerra d’elite, recuperate dagli abissi.',
    'gacha.result': 'Risultato recupero',
    'gacha.new': 'NUOVA NAVE!',
    'gacha.duplicate': 'DUPLICATO → FRAMMENTI',
    'gacha.shards': '+{n} frammenti',
    'gacha.continue': 'Continua',
    'gacha.exclusive': 'ESCLUSIVA GACHA',

    'rarity.N': 'Comune', 'rarity.R': 'Rara', 'rarity.SR': 'Epica',
    'rarity.SSR': 'Leggendaria', 'rarity.UR': 'Mitológica',

    'collection.title': 'Registro delle navi',
    'collection.owned': 'Possedute',
    'collection.total': 'Totale',
    'collection.resonance': 'Risonanza',
    'collection.shards': 'Frammenti',
    'collection.enhance': 'Potenzia',
    'collection.max': 'Risonanza massima',
    'collection.select': 'Seleziona',
    'collection.inUse': 'In uso',
    'collection.locked': 'Non recuperata',
    'collection.skins': 'Livree esclusive',
    'collection.needShards': 'Frammenti insufficienti',

    'mission.title': 'Ordini della flotta',
    'mission.daily': 'Giornalieri',
    'mission.weekly': 'Settimanali',
    'mission.claim': 'Riscatta',
    'mission.claimed': 'Riscattato ✓',
    'mission.progress': '{a}/{b}',
    'mission.login': 'Accesso giornaliero',
    'mission.loginStreak': 'Serie: {n} giorni',

    'pass.title': 'Pass Stagionale',
    'pass.tier': 'Livello {n}',
    'pass.season': 'XP stagione',
    'pass.claim': 'Riscatta',

    'stats.title': 'Statistiche di carriera',
    'stats.battles': 'Battaglie',
    'stats.waves': 'Onde totali',
    'stats.kills': 'Navi affondate',
    'stats.gold': 'Oro guadagnato',
    'stats.pulls': 'Recuperi',
    'stats.ssr': 'Leggendari ottenuti',
    'stats.best': 'Miglior onda',
    'stats.favorite': 'Nave preferita',

    'rank.title': 'Classifica locale',
    'rank.empty': 'Nessuna battaglia registrata',
    'rank.wave': 'Onda {n}',
    'rank.mode': 'Modalità',

    'event.title': 'Evento limitato',
    'event.desc': 'Banner a tema con probabilità aumentata.',
    'challenge.title': 'Sfide di recupero',
    'challenge.desc': 'Usa solo navi di una rarità per premi extra.',
    'challenge.reward': 'Ricompensa: ⚓ {n}',
    'challenge.start': 'Avvia sfida',

    'common.close': 'Chiudi', 'common.back': 'Indietro',
    'common.reward': 'Ricompensa', 'common.locked': 'Bloccato',
    'common.on': 'Attivo', 'common.off': 'Disattivato'
  },
  en: {
    'nav.games': '🎮 Games',
    'menu.gacha': '🎲 SHIP SALVAGE',
    'menu.collection': '📖 COLLECTION',
    'menu.missions': '🎯 MISSIONS',
    'menu.pass': '🏅 SEASON PASS',
    'menu.stats': '📊 STATISTICS',
    'menu.rank': '🏆 LEADERBOARD',

    'gacha.title': 'Naval Yard',
    'gacha.subtitle': 'Salvage new ships from the Leviathan wreckage.',
    'gacha.pull1': 'Salvage ×1',
    'gacha.pull10': 'Salvage ×10',
    'gacha.cost1': '⚓ 160',
    'gacha.cost10': '⚓ 1600',
    'gacha.free': '🎁 Free salvage',
    'gacha.freeUsed': 'Free salvage used today',
    'gacha.needAnchors': 'You need more ⚓ Anchors',
    'gacha.pity': 'SSR guaranteed in {n} pulls',
    'gacha.rateup': 'RATE UP: {name}',
    'gacha.guaranteed': 'SSR guaranteed on next pull!',
    'gacha.banner': 'ACTIVE BANNER',
    'gacha.bannerDesc': 'Elite warships, salvaged from the abyss.',
    'gacha.result': 'Salvage result',
    'gacha.new': 'NEW SHIP!',
    'gacha.duplicate': 'DUPLICATE → SHARDS',
    'gacha.shards': '+{n} shards',
    'gacha.continue': 'Continue',
    'gacha.exclusive': 'GACHA EXCLUSIVE',

    'rarity.N': 'Common', 'rarity.R': 'Rare', 'rarity.SR': 'Epic',
    'rarity.SSR': 'Legendary', 'rarity.UR': 'Mythic',

    'collection.title': 'Ship registry',
    'collection.owned': 'Owned',
    'collection.total': 'Total',
    'collection.resonance': 'Resonance',
    'collection.shards': 'Shards',
    'collection.enhance': 'Enhance',
    'collection.max': 'Max resonance',
    'collection.select': 'Select',
    'collection.inUse': 'In use',
    'collection.locked': 'Not salvaged',
    'collection.skins': 'Exclusive skins',
    'collection.needShards': 'Not enough shards',

    'mission.title': 'Fleet orders',
    'mission.daily': 'Daily',
    'mission.weekly': 'Weekly',
    'mission.claim': 'Claim',
    'mission.claimed': 'Claimed ✓',
    'mission.progress': '{a}/{b}',
    'mission.login': 'Daily login',
    'mission.loginStreak': 'Streak: {n} days',

    'pass.title': 'Season Pass',
    'pass.tier': 'Tier {n}',
    'pass.season': 'Season XP',
    'pass.claim': 'Claim',

    'stats.title': 'Career statistics',
    'stats.battles': 'Battles',
    'stats.waves': 'Total waves',
    'stats.kills': 'Ships sunk',
    'stats.gold': 'Gold earned',
    'stats.pulls': 'Salvages',
    'stats.ssr': 'Legendaries obtained',
    'stats.best': 'Best wave',
    'stats.favorite': 'Favorite ship',

    'rank.title': 'Local leaderboard',
    'rank.empty': 'No battles recorded',
    'rank.wave': 'Wave {n}',
    'rank.mode': 'Mode',

    'event.title': 'Limited event',
    'event.desc': 'Themed banner with increased rates.',
    'challenge.title': 'Salvage challenges',
    'challenge.desc': 'Use only ships of one rarity for extra rewards.',
    'challenge.reward': 'Reward: ⚓ {n}',
    'challenge.start': 'Start challenge',

    'common.close': 'Close', 'common.back': 'Back',
    'common.reward': 'Reward', 'common.locked': 'Locked',
    'common.on': 'On', 'common.off': 'Off'
  }
};
var listeners = [];
var current = 'it';
try {
  var raw = JSON.parse(localStorage.getItem('sw_meta_v1') || '{}');
  if(raw && raw.lang) current = raw.lang;
} catch(e){}
function t(key, vars){
  var dict = DICT[current] || DICT.en;
  var value = dict[key] || DICT.en[key] || key;
  if(vars) Object.keys(vars).forEach(function(k){
    value = value.replace(new RegExp('\\{' + k + '\\}', 'g'), String(vars[k]));
  });
  return value;
}
window.SW_I18N = {
  t: t,
  getLang: function(){ return current; },
  setLang: function(l){
    if(l !== 'it' && l !== 'en') return;
    current = l;
    listeners.forEach(function(fn){ try{ fn(l); }catch(e){} });
  },
  onLangChange: function(fn){ listeners.push(fn); }
};
})();
