/* Scalpel Meta — missioni giornaliere, settimanali, permanenti, contratti e battle pass */
(function(){
'use strict';

var P = window.SCALPEL_META_PROFILE;

var DAILY_TEMPLATES = [
  { id:'daily_surgeries', metric:'surgeries', min:2, max:3, baseXp:120, baseCredits:40 },
  { id:'daily_steps', metric:'steps', min:12, max:20, baseXp:90, baseCredits:30 },
  { id:'daily_accuracy', metric:'bestAccuracy', min:85, max:95, baseXp:140, baseCredits:45 },
  { id:'daily_boss', metric:'boss', min:1, max:1, baseXp:180, baseCredits:60 },
  { id:'daily_endless', metric:'endlessPatients', min:2, max:4, baseXp:100, baseCredits:35 }
];

var WEEKLY_TEMPLATES = [
  { id:'weekly_surgeries', metric:'surgeries', min:8, max:14, baseXp:400, baseCredits:150 },
  { id:'weekly_perfect', metric:'perfect', min:2, max:4, baseXp:500, baseCredits:180 },
  { id:'weekly_steps', metric:'steps', min:60, max:100, baseXp:350, baseCredits:130 },
  { id:'weekly_boss', metric:'boss', min:1, max:2, baseXp:550, baseCredits:200 },
  { id:'weekly_contracts', metric:'contracts', min:2, max:4, baseXp:450, baseCredits:170 }
];

var PERMANENT = [
  { id:'perm_surgeries', metric:'surgeries', target:25, xp:600, credits:250 },
  { id:'perm_perfect', metric:'perfect', target:10, xp:800, credits:300 },
  { id:'perm_steps', metric:'steps', target:200, xp:700, credits:280 },
  { id:'perm_boss', metric:'boss', target:1, xp:500, credits:200 },
  { id:'perm_endless', metric:'endlessBest', target:10, xp:750, credits:300 },
  { id:'perm_zombie', metric:'zombiePlays', target:1, xp:450, credits:180 },
  { id:'perm_alien', metric:'alienPlays', target:1, xp:450, credits:180 }
];

var seasonRewards = [];
for(var tier = 1; tier <= 20; tier++){
  seasonRewards.push({
    id: 'season_' + tier,
    tier: tier,
    xp: tier * 100,
    credits: tier * 40,
    title: tier % 5 === 0 ? 'Season ' + tier + ' Veteran' : null
  });
}

var daily = null;
var weekly = null;

function dateKey(date){ return date.toISOString().slice(0, 10); }
function weekKey(date){
  var d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  var day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  var week = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return d.getUTCFullYear() + '-W' + week;
}
function hashString(text){
  var h = 0;
  for(var i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) | 0;
  return Math.abs(h);
}
function counter(){
  return { surgeries:0, steps:0, boss:0, contracts:0, endlessPatients:0, bestAccuracy:0 };
}

function ensurePeriods(){
  var now = new Date();
  var dKey = dateKey(now);
  var wKey = weekKey(now);
  var data = P.data;
  if(data.lastDaily !== dKey){
    data.lastDaily = dKey;
    daily = { key: dKey, counters: counter(), missions: generate(DAILY_TEMPLATES, 3, dKey, 'daily') };
    P.save();
  } else if(!daily){
    daily = { key: dKey, counters: counter(), missions: generate(DAILY_TEMPLATES, 3, dKey, 'daily') };
  }
  if(data.lastWeekly !== wKey){
    data.lastWeekly = wKey;
    weekly = { key: wKey, counters: counter(), missions: generate(WEEKLY_TEMPLATES, 4, wKey, 'weekly') };
    P.save();
  } else if(!weekly){
    weekly = { key: wKey, counters: counter(), missions: generate(WEEKLY_TEMPLATES, 4, wKey, 'weekly') };
  }
}

function generate(templates, count, seed, prefix){
  var h = hashString(seed + prefix);
  var pool = templates.slice();
  var chosen = [];
  for(var i = 0; i < count && pool.length; i++){
    chosen.push(pool.splice((h + i * 7) % pool.length, 1)[0]);
  }
  return chosen.map(function(t, index){
    var spread = t.max - t.min;
    var target = spread > 0 ? t.min + ((h >> (index + 1)) % (spread + 1)) : t.min;
    return {
      id: prefix + '_' + t.id + '_' + seed,
      key: 'm.' + t.id + '.name',
      nameKey: 'm.' + t.id + '.name',
      descKey: 'm.' + t.id + '.desc',
      metric: t.metric,
      target: target,
      reward: { xp: t.baseXp + Math.round(target * 8), credits: t.baseCredits + target * 3 }
    };
  });
}

function update(detail){
  ensurePeriods();
  if(!detail) return;
  var increment = function(key, amount){
    daily.counters[key] = (daily.counters[key] || 0) + amount;
    weekly.counters[key] = (weekly.counters[key] || 0) + amount;
  };
  if(detail.type === 'stepComplete'){
    increment('steps', 1);
  } else if(detail.type === 'runComplete'){
    increment('surgeries', 1);
    if(typeof detail.accuracy === 'number'){
      daily.counters.bestAccuracy = Math.max(daily.counters.bestAccuracy, detail.accuracy);
      weekly.counters.bestAccuracy = Math.max(weekly.counters.bestAccuracy, detail.accuracy);
    }
    if(detail.mode === 'bossrush') increment('boss', 1);
    if(detail.mode === 'contract') increment('contracts', 1);
    if(detail.mode === 'endless') increment('endlessPatients', detail.patients || 1);
  }
  P.save();
}

function metricValue(metric, period){
  var stats = P.data.stats;
  if(period === 'daily' && daily && daily.counters[metric] !== undefined) return daily.counters[metric];
  if(period === 'weekly' && weekly && weekly.counters[metric] !== undefined) return weekly.counters[metric];
  var map = {
    surgeries: stats.surgeries,
    perfect: stats.perfect,
    steps: stats.steps,
    boss: stats.boss,
    contracts: stats.contracts,
    endlessBest: stats.endlessBest || 0,
    endlessPatients: stats.endlessBest || 0,
    zombiePlays: (stats.modePlays && stats.modePlays.zombie) || 0,
    alienPlays: (stats.modePlays && stats.modePlays.alien) || 0,
    bestAccuracy: P.averageAccuracy()
  };
  return map[metric] || 0;
}

function all(){
  ensurePeriods();
  var result = [];
  [['daily', daily], ['weekly', weekly]].forEach(function(pair){
    pair[1].missions.forEach(function(m){
      result.push({
        id: m.id, category: pair[0], key: m.key,
        target: m.target, progress: Math.min(m.target, metricValue(m.metric, pair[0])),
        reward: m.reward, claimed: P.isClaimed(m.id)
      });
    });
  });
  PERMANENT.forEach(function(m){
    result.push({
      id: m.id, category: 'permanent',
      key: 'm.perm.' + m.id.replace('perm_', '') + '.name',
      nameKey: 'm.perm.' + m.id.replace('perm_', '') + '.name',
      descKey: 'm.perm.' + m.id.replace('perm_', '') + '.desc',
      target: m.target, progress: Math.min(m.target, metricValue(m.metric, 'permanent')),
      reward: { xp: m.xp, credits: m.credits }, claimed: P.isClaimed(m.id)
    });
  });

  var chapters = (window.SCALPEL && window.SCALPEL.CHAPTERS) || [];
  for(var i = 0; i < chapters.length; i++){
    var ch = chapters[i];
    if(!ch || ch.isAlien) continue;
    var acc = (P.data.stats.chapterAcc || {})[ch.id] || 0;
    var time = (P.data.stats.chapterTime || {})[ch.id] || 0;
    result.push({ id:'ch'+ch.id+'_acc', category:'chapter', chapter:ch.id,
      key:'m.chapter.acc.name', nameKey:'m.chapter.acc.name', descKey:'m.chapter.acc.desc',
      target:95, progress:Math.min(95, acc), reward:{xp:80,credits:30}, claimed:P.isClaimed('ch'+ch.id+'_acc'), descVars:{n:95} });
    result.push({ id:'ch'+ch.id+'_time', category:'chapter', chapter:ch.id,
      key:'m.chapter.time.name', nameKey:'m.chapter.time.name', descKey:'m.chapter.time.desc',
      target:60, progress: time > 0 ? (time <= 60 ? 60 : 0) : 0, reward:{xp:80,credits:30}, claimed:P.isClaimed('ch'+ch.id+'_time'), descVars:{n:60} });
    result.push({ id:'ch'+ch.id+'_perfect', category:'chapter', chapter:ch.id,
      key:'m.chapter.perfect.name', nameKey:'m.chapter.perfect.name', descKey:'m.chapter.perfect.desc',
      target:100, progress: acc >= 100 ? 100 : 0, reward:{xp:120,credits:50}, claimed:P.isClaimed('ch'+ch.id+'_perfect'), descVars:{} });
  }

  seasonRewards.forEach(function(r){
    result.push({
      id: r.id, category: 'season', tier: r.tier, key: 'common.level',
      nameKey: 'common.level', descKey: 'profile.season',
      target: r.tier * 500, progress: Math.min(r.tier * 500, P.data.seasonXp || 0),
      reward: { xp: r.xp, credits: r.credits, title: r.title },
      claimed: P.isClaimed(r.id), descVars: { n: r.tier }
    });
  });
  return result;
}

function claim(id){
  var mission = all().filter(function(m){ return m.id === id; })[0];
  if(!mission || mission.claimed || mission.progress < mission.target) return false;
  if(!P.claim(id)) return false;
  P.addXp(mission.reward.xp || 0);
  P.addCredits(mission.reward.credits || 0);
  if(mission.reward.title){
    if(P.data.titles.indexOf(mission.reward.title) === -1) P.data.titles.push(mission.reward.title);
    P.data.title = mission.reward.title;
    P.save();
  }
  return true;
}

function seasonInfo(){
  var xp = P.data.seasonXp || 0;
  var tier = Math.min(20, Math.floor(xp / 500) + 1);
  return { tier: tier, xp: xp, next: tier * 500, progress: xp % 500 };
}

window.SCALPEL_META_MISSIONS = {
  all: all,
  claim: claim,
  update: update,
  seasonInfo: seasonInfo,
  ensurePeriods: ensurePeriods
};
})();
