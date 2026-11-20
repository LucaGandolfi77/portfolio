/* Steel Waves Meta — profilo, risorse, missioni, pass, classifica */
(function(){
'use strict';

var KEY = 'sw_meta_v1';
var I = window.SW_I18N;

function defaults(){
  return {
    anchors: 640,
    shards: {}, owned: {}, resonance: {}, newShips: {}, camos: [],
    pity: 0, ssrSinceUR: 0, pulls: 0, legendaries: 0, urCamos: 0,
    streak: 0, lastLogin: '', dailyFree: '',
    counters: { daily: {}, weekly: {} },
    periodKeys: { daily: '', weekly: '' },
    claimed: [],
    seasonXp: 0, seasonClaimed: [],
    stats: { battles:0, waves:0, kills:0, gold:0, shipPlays:{} },
    leaderboard: [],
    lang: I ? I.getLang() : 'it'
  };
}

var data = load();

function load(){
  try{
    var raw = localStorage.getItem(KEY);
    if(!raw) return defaults();
    var parsed = JSON.parse(raw), d = defaults();
    return Object.assign(d, parsed, {
      shards: Object.assign({}, d.shards, parsed.shards || {}),
      owned: Object.assign({}, d.owned, parsed.owned || {}),
      resonance: Object.assign({}, d.resonance, parsed.resonance || {}),
      newShips: Object.assign({}, d.newShips, parsed.newShips || {}),
      camos: parsed.camos || [],
      counters: Object.assign({}, d.counters, parsed.counters || {}),
      stats: Object.assign({}, d.stats, parsed.stats || {}),
      claimed: parsed.claimed || [], seasonClaimed: parsed.seasonClaimed || []
    });
  }catch(e){ return defaults(); }
}
function save(){ try{ localStorage.setItem(KEY, JSON.stringify(data)); }catch(e){} }

function syncBattle(){
  try{ window.dispatchEvent(new CustomEvent('steelwaves:meta:sync')); }catch(e){}
}

function dateKey(date){ return date.toISOString().slice(0,10); }
function weekKey(date){
  var d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  var day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  var year = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return d.getUTCFullYear() + '-W' + Math.ceil((((d - year)/86400000)+1)/7);
}
function checkPeriods(){
  var now = new Date(), dk = dateKey(now), wk = weekKey(now);
  if(data.periodKeys.daily !== dk){ data.periodKeys.daily = dk; data.counters.daily = {}; }
  if(data.periodKeys.weekly !== wk){ data.periodKeys.weekly = wk; data.counters.weekly = {}; }
  if(data.lastLogin !== dk){
    var yesterday = dateKey(new Date(Date.now() - 86400000));
    data.streak = data.lastLogin === yesterday ? data.streak + 1 : 1;
    data.lastLogin = dk;
    data.anchors += 80 + Math.min(120, data.streak * 10);
    data.dailyFree = '';
  }
  save();
}

function inc(metric, amount){
  ['daily','weekly'].forEach(function(p){
    data.counters[p][metric] = (data.counters[p][metric] || 0) + amount;
  });
}

function recordBattle(detail){
  checkPeriods();
  var earnedAnchors = 18 + (detail.wave || 0) * 8 + (detail.kills || 0) * 2;
  data.anchors += earnedAnchors;
  data.seasonXp += (detail.wave || 0) * 12;
  data.stats.battles++;
  data.stats.waves += detail.wave || 0;
  data.stats.kills += detail.kills || 0;
  data.stats.gold += detail.earn || 0;
  data.stats.shipPlays[detail.ship] = (data.stats.shipPlays[detail.ship] || 0) + 1;
  inc('battles', 1); inc('waves', detail.wave || 0); inc('kills', detail.kills || 0);
  data.leaderboard.push({
    wave: detail.wave || 0, mode: detail.mode || 'wave',
    ship: detail.ship, score: (detail.wave || 0) * 100 + (detail.kills || 0) * 10,
    date: Date.now()
  });
  data.leaderboard.sort(function(a,b){ return b.score - a.score; });
  data.leaderboard = data.leaderboard.slice(0, 10);
  save();
  return { anchors: earnedAnchors };
}

function canPull(count){
  checkPeriods();
  if(count === 1 && data.dailyFree === '') return true;
  return data.anchors >= (count === 1 ? 160 : 1600);
}
function payPull(count){
  checkPeriods();
  if(count === 1 && data.dailyFree === ''){ data.dailyFree = dateKey(new Date()); save(); return true; }
  var cost = count === 1 ? 160 : 1600;
  if(data.anchors < cost) return false;
  data.anchors -= cost; save(); return true;
}

function enhance(shipId){
  var level = data.resonance[shipId] || 0;
  if(level >= 5) return false;
  var cost = window.SW_GACHA.enhanceCost(level);
  if((data.shards[shipId] || 0) < cost) return false;
  data.shards[shipId] -= cost;
  data.resonance[shipId] = level + 1;
  save(); syncBattle();
  return true;
}

var DAILY_DEFS = [
  { id:'d_battles', metric:'battles', target:2, anchors:120 },
  { id:'d_waves', metric:'waves', target:6, anchors:100 },
  { id:'d_kills', metric:'kills', target:18, anchors:100 },
  { id:'d_pulls', metric:'pulls', target:2, anchors:140 }
];
var WEEKLY_DEFS = [
  { id:'w_battles', metric:'battles', target:8, anchors:400 },
  { id:'w_waves', metric:'waves', target:30, anchors:450 },
  { id:'w_kills', metric:'kills', target:90, anchors:500 },
  { id:'w_pulls', metric:'pulls', target:12, anchors:450 }
];
var seasonRewards = [];
for(var t = 1; t <= 20; t++){
  seasonRewards.push({ id:'season_'+t, tier:t, anchors:t*60, xp:t*100 });
}

function missionList(kind){
  checkPeriods();
  var defs = kind === 'daily' ? DAILY_DEFS : kind === 'weekly' ? WEEKLY_DEFS : [];
  return defs.map(function(m){
    var value = data.counters[kind][m.metric] || 0;
    return {
      id: m.id, target: m.target, progress: Math.min(m.target, value),
      reward: { anchors: m.anchors }, claimed: data.claimed.indexOf(m.id) !== -1
    };
  });
}
function claimMission(id){
  checkPeriods();
  var all = missionList('daily').concat(missionList('weekly'));
  var m = all.filter(function(x){ return x.id === id; })[0];
  if(!m || m.claimed || m.progress < m.target) return false;
  data.claimed.push(id);
  data.anchors += m.reward.anchors;
  save(); return true;
}
function seasonList(){
  return seasonRewards.map(function(r){
    return {
      id:r.id, tier:r.tier, target:r.tier*150,
      progress:Math.min(r.tier*150, data.seasonXp),
      reward:{anchors:r.anchors,xp:r.xp},
      claimed:data.seasonClaimed.indexOf(r.id) !== -1
    };
  });
}
function claimSeason(id){
  var m = seasonList().filter(function(x){ return x.id === id; })[0];
  if(!m || m.claimed || m.progress < m.target) return false;
  data.seasonClaimed.push(id);
  data.anchors += m.reward.anchors;
  save(); return true;
}
function setLang(l){ data.lang = l; if(I) I.setLang(l); save(); }

window.SW_META = {
  data: data, save: save, syncBattle: syncBattle, checkPeriods: checkPeriods,
  recordBattle: recordBattle, canPull: canPull, payPull: payPull,
  enhance: enhance, missionList: missionList, claimMission: claimMission,
  seasonList: seasonList, claimSeason: claimSeason, setLang: setLang,
  resonanceMult: function(id){ return window.SW_GACHA ? window.SW_GACHA.resonanceMult(id) : 1; }
};
})();
