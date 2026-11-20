/* Scalpel Meta — profilo, XP, crediti, statistiche */
(function(){
'use strict';

var KEY = 'scalpel_meta_v1';
var I = window.SCALPEL_META_I18N;

var defaults = function(){
  return {
    xp: 0,
    credits: 0,
    level: 1,
    title: 'Intern',
    titles: ['Intern'],
    cosmetics: [],
    stats: {
      surgeries: 0, steps: 0, perfect: 0, boss: 0, contracts: 0,
      bestScore: 0, accuracySum: 0, accuracyCount: 0,
      modePlays: {}, chapterStars: {}, chapterAcc: {}, chapterTime: {}, endlessBest: 0
    },
    seasonXp: 0,
    claimed: [],
    lastDaily: '',
    lastWeekly: '',
    settings: {
      sound: true, haptics: true, reducedMotion: false,
      contrast: false, textSize: 'normal', language: I ? I.getLang() : 'en'
    }
  };
};

var data = load();

function load(){
  try {
    var raw = localStorage.getItem(KEY);
    if(!raw) return defaults();
    var parsed = JSON.parse(raw);
    var base = defaults();
    return {
      xp: parsed.xp || 0,
      credits: parsed.credits || 0,
      level: parsed.level || 1,
      title: parsed.title || base.title,
      titles: parsed.titles || base.titles,
      cosmetics: parsed.cosmetics || [],
      stats: Object.assign(base.stats, parsed.stats || {}),
      seasonXp: parsed.seasonXp || 0,
      claimed: parsed.claimed || [],
      lastDaily: parsed.lastDaily || '',
      lastWeekly: parsed.lastWeekly || '',
      settings: Object.assign(base.settings, parsed.settings || {})
    };
  } catch(e){ return defaults(); }
}

function save(){
  try { localStorage.setItem(KEY, JSON.stringify(data)); } catch(e){ /* ignore */ }
}

function xpNeeded(level){ return 400 * level; }

function addXp(amount){
  data.xp += amount;
  data.seasonXp += amount;
  var gained = 0;
  while(data.xp >= xpNeeded(data.level)){
    data.xp -= xpNeeded(data.level);
    data.level++;
    gained++;
  }
  if(gained){
    var titles = ['Intern','Resident','Attending','Surgeon','Specialist','Chief','Legend'];
    var idx = Math.min(titles.length - 1, Math.floor((data.level - 1) / 3));
    data.title = titles[idx];
    if(data.titles.indexOf(data.title) === -1) data.titles.push(data.title);
  }
  save();
  return { gained: gained, level: data.level };
}

function addCredits(amount){
  data.credits = Math.max(0, data.credits + amount);
  save();
}

function recordEvent(detail){
  if(!detail) return;
  var type = detail.type;
  var stats = data.stats;
  if(type === 'stepComplete'){
    stats.steps++;
  } else if(type === 'runComplete'){
    stats.surgeries++;
    var mode = detail.mode || 'story';
    stats.modePlays[mode] = (stats.modePlays[mode] || 0) + 1;
    stats.bestScore = Math.max(stats.bestScore || 0, detail.score || 0);
    if(typeof detail.accuracy === 'number'){
      stats.accuracySum += detail.accuracy;
      stats.accuracyCount++;
      if(detail.accuracy >= 95) stats.perfect++;
    }
    if(mode === 'bossrush') stats.boss++;
    if(mode === 'contract') stats.contracts++;
    if(mode === 'endless') stats.endlessBest = Math.max(stats.endlessBest || 0, detail.patients || 1);
    if(detail.chapter && detail.accuracy){
      var stars = detail.accuracy >= 95 ? 3 : detail.accuracy >= 85 ? 2 : 1;
      stats.chapterStars[detail.chapter] = Math.max(stats.chapterStars[detail.chapter] || 0, stars);
      stats.chapterAcc[detail.chapter] = Math.max(stats.chapterAcc[detail.chapter] || 0, detail.accuracy);
      if(detail.timeUsed > 0){
        var prevTime = stats.chapterTime[detail.chapter] || 0;
        stats.chapterTime[detail.chapter] = prevTime ? Math.min(prevTime, detail.timeUsed) : detail.timeUsed;
      }
    }
  } else if(type === 'contractStart'){
    // il conteggio dei contratti completati avviene su runComplete
  }
  save();
}

function averageAccuracy(){
  return data.stats.accuracyCount
    ? Math.round(data.stats.accuracySum / data.stats.accuracyCount)
    : 0;
}

function setSetting(key, value){
  data.settings[key] = value;
  if(key === 'language' && window.SCALPEL_META_I18N) window.SCALPEL_META_I18N.setLang(value);
  save();
}

function reset(){
  data = defaults();
  save();
}

window.SCALPEL_META_PROFILE = {
  get data(){ return data; },
  addXp: addXp,
  addCredits: addCredits,
  recordEvent: recordEvent,
  averageAccuracy: averageAccuracy,
  setSetting: setSetting,
  reset: reset,
  save: save,
  xpNeeded: function(){ return xpNeeded(data.level); },
  claim: function(id){ if(data.claimed.indexOf(id) === -1){ data.claimed.push(id); save(); return true; } return false; },
  isClaimed: function(id){ return data.claimed.indexOf(id) !== -1; }
};
})();
