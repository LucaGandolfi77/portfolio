/* Steel Waves — motore gacha: rarità, pity, rate-up, duplicati */
(function(){
'use strict';

var EXCLUSIVE = [
  {id:'sentinella', cls:'Fregata', name:'Sentinella', emoji:'🛰️', cost:99999,
   hp:1250,spd:175,turn:2.2,range:540,dmg:72,rld:0.8,shells:2,
   torp:false,trld:0,tn:0,tdmg:0,ts:0,aa:28,aar:300,
   sp:{ico:'📡',name:'Rete di sorveglianza',cd:17,kind:'slow'},
   desc:'Fregata furtiva con radar a lungo raggio.',len:64,wid:15,rarity:'R',exclusive:true},
  {id:'sirena', cls:'Sottomarino d’elite', name:'Sirena', emoji:'🧜', cost:99999,
   hp:1400,spd:205,turn:2.6,range:480,dmg:60,rld:0.9,shells:1,
   torp:true,trld:7,tn:5,tdmg:690,ts:210,aa:6,aar:170,
   sp:{ico:'🌊',name:'Corrente sottomarina',cd:15,kind:'dive'},
   desc:'Siluri letali e immersione prolungata.',len:60,wid:12,rarity:'SR',exclusive:true},
  {id:'tempesta', cls:'Cacciatorpediniere', name:'Tempesta', emoji:'⛈️', cost:99999,
   hp:1550,spd:225,turn:3.0,range:450,dmg:52,rld:0.42,shells:2,
   torp:true,trld:8,tn:4,tdmg:760,ts:200,aa:16,aar:250,
   sp:{ico:'⚡',name:'Fulmine a catena',cd:11,kind:'burst'},
   desc:'Cadenza di fuoco impossibile da eguagliare.',len:52,wid:12,rarity:'SSR',exclusive:true},
  {id:'aurora', cls:'Portaerei d’elite', name:'Aurora', emoji:'🌅', cost:99999,
   hp:1950,spd:150,turn:1.8,range:640,dmg:105,rld:1.3,shells:3,
   torp:false,trld:0,tn:0,tdmg:0,ts:0,aa:40,aar:350,
   sp:{ico:'🛩️',name:'Alba di fuoco',cd:20,kind:'strike'},
   desc:'Sciami di aerei che oscurano il sole.',len:96,wid:23,rarity:'SSR',exclusive:true},
  {id:'leviatano', cls:'Corazzata mitologica', name:'Leviatano', emoji:'👹', cost:99999,
   hp:3600,spd:128,turn:1.4,range:740,dmg:240,rld:2.5,shells:6,
   torp:true,trld:14,tn:4,tdmg:980,ts:190,aa:26,aar:290,
   sp:{ico:'🌊',name:'Marea nera',cd:22,kind:'broadside'},
   desc:'La nave del mostro, domata e arruolata.',len:118,wid:30,rarity:'UR',exclusive:true},
  {id:'ammiraglio', cls:'Super-corazzata', name:'Ammiraglio', emoji:'⭐', cost:99999,
   hp:4100,spd:122,turn:1.3,range:760,dmg:265,rld:2.7,shells:7,
   torp:false,trld:0,tn:0,tdmg:0,ts:0,aa:30,aar:310,
   sp:{ico:'☄️',name:'Volontà di ferro',cd:18,kind:'shock'},
   desc:'Il comandante supremo della flotta.',len:124,wid:32,rarity:'UR',exclusive:true}
];

var RARITY = {
  vedetta:'N', lampo:'R', aliseo:'R', diana:'SR', pegaso:'SR', vittoria:'SR',
  leonardo:'SSR', impepero:'SSR', rex:'UR', aquila:'SSR', delfino:'SR', ombra:'SSR'
};
EXCLUSIVE.forEach(function(s){ RARITY[s.id] = s.rarity; });

var WEIGHTS = { N:50, R:30, SR:14, SSR:5, UR:1 };
var SHARDS = { N:5, R:10, SR:25, SSR:80, UR:200 };
var ORDER = ['N','R','SR','SSR','UR'];
var profile = null;

function bind(profileObject){
  var store = (profileObject && profileObject.data) ? profileObject.data : profileObject;
  if(store && !store.save && profileObject && profileObject.save) store.save = profileObject.save;
  profile = store;
}

function registerShips(){
  var ships = window.__sw && window.__sw.SHIPS;
  if(!ships) return;
  EXCLUSIVE.forEach(function(s){
    if(!ships.some(function(x){ return x.id === s.id; })) ships.push(s);
  });
}

function rarityOf(id){ return RARITY[id] || 'N'; }
function shardsFor(rarity){ return SHARDS[rarity] || 5; }

function bannerFeatured(){
  var day = Math.floor(Date.now() / 86400000);
  var pool = EXCLUSIVE.filter(function(s){ return s.rarity === 'SSR' || s.rarity === 'UR'; });
  return pool[day % pool.length];
}

function rollRarity(pity, ssrSinceUR){
  var pullNumber = pity + 1;
  if(pity >= 79) return 'SSR';
  var weights = Object.assign({}, WEIGHTS);
  if(pullNumber >= 70){
    var bonus = Math.min(60, (pullNumber - 69) * 6);
    weights.SSR += bonus;
    weights.UR += Math.floor(bonus / 3);
  }
  if(ssrSinceUR >= 2) return 'UR';
  var total = ORDER.reduce(function(a,r){ return a + weights[r]; }, 0);
  var roll = Math.random() * total;
  for(var i = 0; i < ORDER.length; i++){
    roll -= weights[ORDER[i]];
    if(roll <= 0) return ORDER[i];
  }
  return 'N';
}

function pickShip(rarity, featured){
  if(featured && RARITY[featured.id] === rarity && Math.random() < 0.5) return featured.id;
  var pool = Object.keys(RARITY).filter(function(id){ return RARITY[id] === rarity; });
  if(!pool.length) pool = Object.keys(RARITY);
  return pool[Math.floor(Math.random() * pool.length)];
}

/** Esegue N recuperi. Restituisce {results, newShips, shards}. */
function pull(count){
  if(!profile) return { results: [], newShips: 0, shards: 0 };
  var results = [];
  var featured = bannerFeatured();
  for(var i = 0; i < count; i++){
    var rarity = rollRarity(profile.pity, profile.ssrSinceUR);
    var shipId = pickShip(rarity, featured);
    var isNew = !profile.owned[shipId];
    var shards = 0;
    var camoUnlocked = null;
    if(isNew){
      profile.owned[shipId] = 1;
      profile.newShips[shipId] = true;
      if(rarity === 'UR'){
        camoUnlocked = 8 + ((profile.urCamos || 0) % 4);
        if(!profile.camos) profile.camos = [];
        if(profile.camos.indexOf(camoUnlocked) === -1) profile.camos.push(camoUnlocked);
        profile.urCamos = (profile.urCamos || 0) + 1;
      }
    } else {
      shards = shardsFor(rarity);
      profile.shards[shipId] = (profile.shards[shipId] || 0) + shards;
    }
    if(rarity === 'SSR' || rarity === 'UR'){
      profile.pity = 0;
      profile.ssrSinceUR++;
      if(rarity === 'UR') profile.ssrSinceUR = 0;
      profile.legendaries++;
    } else {
      profile.pity++;
    }
    profile.pulls++;
    results.push({ id: shipId, rarity: rarity, isNew: isNew, shards: shards,
      featured: shipId === featured.id, camo: camoUnlocked });
  }
  profile.save();
  return {
    results: results,
    newShips: results.filter(function(r){ return r.isNew; }).length,
    shards: results.reduce(function(a,r){ return a + r.shards; }, 0)
  };
}

function resonanceMult(shipId){
  if(!profile) return 1;
  var level = profile.resonance[shipId] || 0;
  return 1 + level * 0.06;
}

function enhanceCost(level){ return 40 + level * 30; }

window.SW_GACHA = {
  EXCLUSIVE: EXCLUSIVE, RARITY: RARITY, WEIGHTS: WEIGHTS, SHARDS: SHARDS,
  bind: bind, registerShips: registerShips, rarityOf: rarityOf,
  shardsFor: shardsFor, bannerFeatured: bannerFeatured,
  pull: pull, resonanceMult: resonanceMult, enhanceCost: enhanceCost
};
})();
