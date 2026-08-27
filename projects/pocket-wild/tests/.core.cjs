
'use strict';
/* ================= UTILS ================= */
const $=id=>document.getElementById(id);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,t)=>a+(b-a)*t;
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
function mulberry32(seed){let a=seed>>>0;return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function hashSeed(str){let h=2166136261;for(let i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
function toast(msg,color){if(SILENT)return;const d=document.createElement('div');d.className='toast';d.textContent=msg;if(color)d.style.borderLeftColor=color;$('toasts').appendChild(d);setTimeout(()=>{d.style.opacity='0';d.style.transition='opacity .4s';setTimeout(()=>d.remove(),420);},3000);}
let SILENT=false; /* il motore di test mette a tacere toast/audio durante le simulazioni */
function setSilent(v){SILENT=!!v;}

/* ================= WORLD ================= */
const TILE=16, WORLD_T=2200, WORLD_PX=WORLD_T*TILE;
let SEED=1;
function hash2(x,y,s){let h=s^Math.imul(x,374761393)^Math.imul(y,668265263);h=Math.imul(h^(h>>>13),1274126177);h^=h>>>16;return(h>>>0)/4294967296;}
const BIOMES=['grass','forest','desert','snow','ocean','volcano','crystal'];
const BIOME_COL={grass:'#3d8f4f',forest:'#2e6b3f',desert:'#c9a35f',snow:'#dbe6f2',ocean:'#2456a8',volcano:'#8a3a24',crystal:'#7a5ac8'};
function biomeAt(tx,ty){
  const n=hash2(tx,ty,SEED);
  if(n>0.86)return'ocean';
  if(n<0.28)return'grass';
  if(n<0.46)return'forest';
  if(n<0.62)return'desert';
  if(n<0.74)return'snow';
  if(n<0.82)return'volcano';
  return'crystal';
}
function tileObj(tx,ty){
  if(biomeAt(tx,ty)==='ocean')return null;
  const n=hash2(tx,ty,SEED^0x9e3779b9);
  if(n<0.09)return'tree';
  if(n<0.15)return'rock';
  if(n<0.21)return'berry';
  if(n<0.26)return'bush';
  return null;
}
function solidAt(px,py){
  const tx=Math.floor(px/TILE),ty=Math.floor(py/TILE);
  if(biomeAt(tx,ty)==='ocean')return true;
  const o=tileObj(tx,ty);
  return o==='tree'||o==='rock';
}
function circleHitsSolid(x,y,r){
  for(let tx=Math.floor((x-r)/TILE);tx<=Math.floor((x+r)/TILE);tx++)
    for(let ty=Math.floor((y-r)/TILE);ty<=Math.floor((y+r)/TILE);ty++)
      if(solidAt(tx*TILE,ty*TILE)){ /* AABB vs circle approx */
        const cx=clamp(x,tx*TILE,(tx+1)*TILE),cy=clamp(y,ty*TILE,(ty+1)*TILE);
        if(Math.hypot(x-cx,y-cy)<r)return true;
      }
  return false;
}

/* ================= SPECIES ================= */
const TYPES={grass:'grass',fire:'fire',ice:'ice',water:'water',void:'void'};
const TYPE_MULT={grass:{grass:1,fire:.7,ice:1.2,water:1.3,void:.9},fire:{grass:1.4,fire:.7,ice:1.1,water:.6,void:1},ice:{grass:1.2,fire:.9,ice:.6,water:1,void:1.1},water:{grass:1.1,fire:1.4,ice:1,water:.7,void:1},void:{grass:1,fire:1,ice:1,water:1,void:1.2}};
const SPECIES=[
 {id:'grassling',n:'Grassling',col:'#52c96b',shape:0,type:'grass',biome:'grass',hp:40,atk:7,spd:1.5,rar:0,evLv:8,evTo:'bushelder',skills:[['Tackle',6,1.0],['Leaf Shot',10,2.2]],desc:'A shy grass orb.'},
 {id:'bushelder',n:'Bushelder',col:'#2f9e5a',shape:1,type:'grass',biome:'grass',hp:70,atk:12,spd:1.35,rar:1,evLv:16,evTo:'groveheart',skills:[['Tackle',8,1.0],['Leaf Shot',13,2.0],['Thorn Slam',20,3.2]],desc:'Older, thornier.'},
 {id:'groveheart',n:'Groveheart',col:'#1d7a44',shape:2,type:'grass',biome:'grass',hp:120,atk:22,spd:1.15,rar:2,skills:[['Tackle',12,1.0],['Leaf Shot',18,1.8],['Thorn Slam',28,2.8],['Grovequake',40,4.5]],desc:'Heart of the forest.'},
 {id:'emberpup',n:'Emberpup',col:'#ff8a4c',shape:2,type:'fire',biome:'desert',hp:36,atk:9,spd:1.6,rar:0,evLv:8,evTo:'flarefang',skills:[['Bite',7,1.0],['Ember',11,2.0]],desc:'Warm to the touch.'},
 {id:'flarefang',n:'Flarefang',col:'#e2573f',shape:3,type:'fire',biome:'desert',hp:64,atk:15,spd:1.4,rar:1,evLv:16,evTo:'magmalord',skills:[['Bite',9,1.0],['Ember',14,1.9],['Fire Claw',22,3.0]],desc:'Smoldering jaws.'},
 {id:'magmalord',n:'Magmalord',col:'#c2273a',shape:4,type:'fire',biome:'desert',hp:110,atk:26,spd:1.2,rar:2,skills:[['Bite',13,1.0],['Ember',19,1.7],['Fire Claw',28,2.7],['Magma Burst',44,4.5]],desc:'Ruler of the dunes.'},
 {id:'frostbite',n:'Frostbite',col:'#7fd4ff',shape:3,type:'ice',biome:'snow',hp:34,atk:8,spd:1.55,rar:0,evLv:8,evTo:'glaciowl',skills:[['Bite',6,1.0],['Frost Shard',10,2.1]],desc:'Cold as a whisper.'},
 {id:'glaciowl',n:'Glaciowl',col:'#4fb8f0',shape:1,type:'ice',biome:'snow',hp:60,atk:13,spd:1.4,rar:1,evLv:16,evTo:'blizzarion',skills:[['Bite',8,1.0],['Frost Shard',13,2.0],['Glacier Wing',20,3.0]],desc:'Hunts under auroras.'},
 {id:'blizzarion',n:'Blizzarion',col:'#3f8fe0',shape:4,type:'ice',biome:'snow',hp:105,atk:24,spd:1.2,rar:2,skills:[['Bite',12,1.0],['Frost Shard',17,1.8],['Glacier Wing',26,2.8],['Avalanche',40,4.5]],desc:'A walking storm.'},
 {id:'puddlin',n:'Puddlin',col:'#3ee6ff',shape:0,type:'water',biome:'grass',hp:32,atk:7,spd:1.65,rar:0,evLv:10,evTo:'torrentail',skills:[['Splash',6,1.0],['Water Jet',10,2.0]],desc:'Made of rain.'},
 {id:'torrentail',n:'Torrentail',col:'#26b8d8',shape:1,type:'water',biome:'grass',hp:58,atk:12,spd:1.45,rar:1,skills:[['Splash',8,1.0],['Water Jet',13,1.9],['Tide Crash',21,3.0]],desc:'Swims through sand.'},
 {id:'duskbat',n:'Duskbat',col:'#a06bf0',shape:2,type:'void',biome:'void',hp:30,atk:9,spd:1.9,rar:1,noct:true,evLv:12,evTo:'nightwing',skills:[['Nip',6,.8],['Shadow Lick',11,1.8]],desc:'Only out at night.'},
 {id:'nightwing',n:'Nightwing',col:'#7a48d8',shape:4,type:'void',biome:'void',hp:60,atk:16,spd:1.7,rar:2,noct:true,skills:[['Nip',9,.8],['Shadow Lick',14,1.7],['Eclipse Dive',24,2.9]],desc:'Silent over the dark.'},
 {id:'sparklet',n:'Sparklet',col:'#ffe14d',shape:5,type:'void',biome:'void',hp:28,atk:11,spd:2.0,rar:2,skills:[['Zap',8,.7],['Static Field',14,2.0]],desc:'Static on four legs.'},
 {id:'sporeling',n:'Sporeling',col:'#c9b26b',shape:1,type:'grass',type2:'void',biome:'forest',hp:38,atk:8,spd:1.35,rar:1,noct:true,evLv:14,evTo:'fungalord',skills:[['Spore Puff',7,1.1],['Toxic Bite',12,2.2]],desc:'A glowing mushroom.'},
 {id:'fungalord',n:'Fungalord',col:'#a08a4a',shape:2,type:'grass',type2:'void',biome:'forest',hp:95,atk:20,spd:1.1,rar:2,noct:true,skills:[['Spore Puff',10,1.1],['Toxic Bite',16,2.0],['Spore Storm',30,3.4]],desc:'Warden of the fungal wood.'},
 {id:'cindercrab',n:'Cindercrab',col:'#d94a2a',shape:3,type:'fire',type2:'grass',biome:'desert',hp:42,atk:10,spd:1.3,rar:1,skills:[['Pinch',8,1.0],['Heat Wave',13,2.2]],desc:'Clacks with embers.'},
 {id:'snowhare',n:'Snowhare',col:'#b8e0ff',shape:0,type:'ice',biome:'snow',hp:30,atk:7,spd:1.8,rar:0,evLv:10,evTo:'frosthoof',skills:[['Hop',6,.9],['Ice Kick',10,1.8]],desc:'Bounces on powder.'},
 {id:'frosthoof',n:'Frosthoof',col:'#8cc8f0',shape:3,type:'ice',type2:'water',biome:'snow',hp:62,atk:13,spd:1.5,rar:1,skills:[['Hop',8,.9],['Ice Kick',13,1.7],['Hoarfrost Stomp',22,3.0]],desc:'Its hooves freeze ponds.'},
 {id:'tideling',n:'Tideling',col:'#5ee0e8',shape:1,type:'water',type2:'ice',biome:'grass',hp:34,atk:8,spd:1.5,rar:0,skills:[['Bubble',7,1.0],['Cold Splash',11,2.0]],desc:'Tides follow it.'},
 {id:'voltmouse',n:'Voltmouse',col:'#ffe14d',shape:5,type:'void',type2:'fire',biome:'void',hp:32,atk:12,spd:1.9,rar:2,skills:[['Spark Bite',9,.8],['Overcharge',15,2.1]],desc:'Chews through cables.'},
 {id:'glimmerfly',n:'Glimmerfly',col:'#ffd6a0',shape:4,type:'grass',type2:'ice',biome:'forest',hp:26,atk:9,spd:2.2,rar:2,noct:true,skills:[['Pollen Gust',7,.8],['Shimmer Wing',13,1.9]],desc:'A living aurora mote.'},
 /* — seasonal species (spawn only in their season) — */
 {id:'bloompuff',n:'Bloompuff',col:'#ff9ecf',shape:5,type:'grass',type2:'void',biome:'grass',hp:30,atk:8,spd:1.6,rar:1,season:0,skills:[['Petal Whip',8,1.0],['Pollen Burst',13,2.1]],desc:'A spring blossom spirit.'},
 {id:'suncub',n:'Suncub',col:'#ffd166',shape:0,type:'fire',biome:'desert',hp:36,atk:10,spd:1.5,rar:1,season:1,skills:[['Sunbite',9,1.0],['Solar Flare',14,2.0]],desc:'Basks in summer heat.'},
 {id:'maplewisp',n:'Maplewisp',col:'#ff9e3f',shape:4,type:'grass',type2:'fire',biome:'forest',hp:34,atk:9,spd:1.7,rar:1,season:2,skills:[['Leaf Slash',8,1.0],['Ember Drift',13,2.1]],desc:'Rides autumn winds.'},
 {id:'snowfawn',n:'Snowfawn',col:'#c8e8ff',shape:2,type:'ice',biome:'snow',hp:32,atk:8,spd:1.8,rar:1,season:3,skills:[['Frost Hop',7,0.9],['Icy Leap',12,1.9]],desc:'Appears only in deep winter.'},
 /* — volcano & crystal (nuovi biomi) — */
 {id:'lavad',n:'Lavad',col:'#ff5f3f',shape:3,type:'fire',biome:'volcano',hp:40,atk:12,spd:1.35,rar:1,skills:[['Magma Bite',10,1.0],['Lava Spew',16,2.2]],desc:'Molten to the core.'},
 {id:'ashmoth',n:'Ashmoth',col:'#9a8aa8',shape:4,type:'fire',type2:'void',biome:'volcano',hp:34,atk:13,spd:1.7,rar:2,fly:true,skills:[['Ash Wing',11,1.0],['Ember Storm',18,2.4]],desc:'Flies on heat plumes.'},
 {id:'crystalmite',n:'Crystalmite',col:'#c26bff',shape:1,type:'void',biome:'crystal',hp:36,atk:10,spd:1.5,rar:1,skills:[['Shard Bite',9,1.0],['Crystal Beam',15,2.2]],desc:'A living shard.'},
 {id:'prismoth',n:'Prismoth',col:'#8ae0ff',shape:5,type:'ice',type2:'void',biome:'crystal',hp:32,atk:11,spd:1.8,rar:2,fly:true,skills:[['Prism Wing',10,1.0],['Refract Burst',17,2.3]],desc:'Bends starlight.'},
 /* — marine (si catturano solo pescando) — */
 {id:'finling',n:'Finling',col:'#3ec8e8',shape:1,type:'water',biome:'ocean',hp:30,atk:7,spd:1.7,rar:0,skills:[['Bubble Bite',7,1.0],['Tail Slap',11,2.0]],desc:'Curious about the shore.'},
 {id:'jellyvolt',n:'Jellyvolt',col:'#8ae0a0',shape:5,type:'water',type2:'void',biome:'ocean',hp:34,atk:10,spd:1.5,rar:1,skills:[['Tingle Sting',9,1.1],['Static Surge',15,2.2]],desc:'Lights up the deep.'},
 {id:'abyssoul',n:'Abyssoul',col:'#4a58d8',shape:2,type:'water',type2:'ice',biome:'ocean',hp:40,atk:12,spd:1.3,rar:2,skills:[['Abyssal Glare',11,1.2],['Frozen Tide',19,2.6]],desc:'Remembers the surface world.'}
];
const SPHERE_TIERS=[{n:'Sphere',col:'#3ee6ff',cost:{grass:2,ess:1},mult:1.0},{n:'Great Sphere',col:'#52ff9e',cost:{wood:3,ess:2},mult:1.35},{n:'Ultra Sphere',col:'#ff5f9e',cost:{stone:3,ess:4,berry:1},mult:1.8}];
const RARITY_BASE=[1.0,0.62,0.38]; /* common/uncommon/rare */

/* ================= SEASONS =================
   Ciclo di 4 stagioni × 7 giorni: Spring → Summer → Autumn → Winter.
   Ogni stagione: Pal esclusivi, pesi di spawn, meteo e raccolta modificati,
   tinte della mappa + decorazioni (fiori in primavera, foglie in autunno). */
const SEASONS=[
 {n:'Spring',icon:'🌸',fx:'Bloom Festival',desc:'Flowers bloom — berries grow faster, wilds teem.',spawnMult:1.25,weath:{suppress:'rain',aurora:0},gather:{berry:2},tint:{grass:'#5fbf6e',forest:'#4a8f5f',desert:'#d9b877',snow:'#e6eef8',ocean:'#2a60b8',volcano:'#a04a30',crystal:'#8a6ad8'}},
 {n:'Summer',icon:'☀️',fx:'Heatwave',desc:'Scorching sun — fire Pals thrive, rain is rare.',spawnMult:1.1,weath:{suppress:'rain',sandstorm:0.55,aurora:0},gather:{},tint:{grass:'#4faf5a',forest:'#3a7a48',desert:'#e0ae5f',snow:'#d9e4ef',ocean:'#2a5cb0',volcano:'#b04a28',crystal:'#7a5ac8'}},
 {n:'Autumn',icon:'🍂',fx:'Harvest Moon',desc:'Golden leaves — gathering is twice as fruitful.',spawnMult:1.1,weath:{suppress:'',aurora:0},gather:{wood:2,berry:1.5,grass:1.5},tint:{grass:'#8a9e4f',forest:'#8a5a2a',desert:'#c9a35f',snow:'#dde6f0',ocean:'#2a5cb0',volcano:'#8a4a2a',crystal:'#6a4ab8'}},
 {n:'Winter',icon:'❄️',fx:'Aurora Nights',desc:'Deep frost — auroras roam, ice Pals thrive.',spawnMult:1.15,weath:{suppress:'',aurora:0.6},gather:{},tint:{grass:'#7fa8a8',forest:'#5a7a8a',desert:'#a9b8c8',snow:'#f4faff',ocean:'#2a66b8',volcano:'#6a4a48',crystal:'#8a7ae8'}}
];
function seasonOf(day){return Math.floor((Math.max(1,day)-1)/7)%4;}
function curSeason(){return seasonOf(G.day);}
/* pool di spawn coerente con la stagione (esclude i Pal stagionali fuori stagione) */
function anytimePool(base){
  const s=curSeason();
  return base.filter(x=>(x.season===undefined||x.season===s));
}


/* ================= DIFFICOLTÀ ================= */
const DIFFS={
 easy:{n:'Easy',icon:'🌱',dmgIn:0.7,hp:0.8,dmgOut:1.2,catch:1.2,spawn:0.8,hunger:0.7},
 normal:{n:'Normal',icon:'⚖️',dmgIn:1,hp:1,dmgOut:1,catch:1,spawn:1,hunger:1},
 hard:{n:'Hard',icon:'🔥',dmgIn:1.4,hp:1.25,dmgOut:0.85,catch:0.85,spawn:1.15,hunger:1.2},
 nightmare:{n:'Nightmare',icon:'💀',dmgIn:1.8,hp:1.5,dmgOut:0.7,catch:0.7,spawn:1.3,hunger:1.4}
};
function diffMult(k){return (DIFFS[G.diff||'normal']||DIFFS.normal)[k];}

/* ================= LINGUA ================= */
let LANG='en';
const L={
 en:{
  mode:'Mode',modeStory:'Story',modeZen:'Zen / Sandbox',modeSpeedrun:'Speedrun',
  difficulty:'Difficulty',language:'Language',diffEasy:'Easy',diffNormal:'Normal',diffHard:'Hard',diffNightmare:'Nightmare',
  diffHelp:'Enemies are stronger, catches harder, hunger faster. Rewards stay fair.',
  team:'YOUR PALS',craft:'CRAFTING',lab:'GENE LAB',build:'BUILD',dex:'PAL DEX',diary:"LINA'S DIARY",ach:'ACHIEVEMENTS',quests:'QUESTS',chest:'CHEST',trade:'WANDERING TRADER',edit:'CUSTOM PAL LAB',test:'PARALLEL TEST ENGINE',smith:'BLACKSMITH BRAM',
  btnTeam:'📦 Team',btnCraft:'🎒 Craft',btnLab:'🧬 Lab',btnBuild:'🏗 Build',btnDex:'📖 Paldex',btnDiary:'📓',btnAch:'🏆',btnQuests:'📋',btnSound:'🔊',btnTest:'🧪 Test',btnInstall:'📲 Install',btnSave:'💾',
  throw:'🔮 Throw',attack:'⚔️ Attack',shoot:'🏹 Shoot',ride:'🐎 Ride',dismount:'🐎 Dismount',descend:'🐉 Descend',interact:'🤝 Interact',
  seed:'World seed (optional)',newWorld:'🌍 NEW WORLD',continue:'💾 CONTINUE',
  sub:'Catch geometric creatures. Build a base. Splice their genes. Survive the night.',
  storySkip:'⏭ Skip',storyNext:'Continue ▶',storyBegin:'Begin the journey ✦',
  respawnTitle:'You fainted…',respawnSub:'Your active Pal saved you. Wake up at the bed.',wake:'🌅 Wake up',
  completeTitle:'🏆 GAME COMPLETE',keepExploring:'🌍 Keep exploring',newRun:'🔄 New world',
  ch1:'🌱 First Steps',ch2:'⬆ Rise',ch3:'🗺 Frontiers',ch4:'🌑 The Reckoning',ch5:'🗻 The Wilds Beyond',
  q1:'Catch 3 wild Pals',q2:'Gather 15 resources',q3:'Build a campfire',q4:'Craft 2 spheres',
  q5:'Catch 8 wild Pals',q6:'Defeat 6 wild Pals',q7:'Build any 3 structures',q8:'Evolve a Pal',
  q9:'Defeat 12 wild Pals',q10:'Defeat an Alpha boss',q11:'Clear a Ruin dungeon',q12:'Beat a wandering trainer',
  q13:'Defeat the VOID SOVEREIGN',q14:'Catch a Pal from the Volcano',q15:'Catch a Pal from the Crystal Plains',
  q16:'Travel 3,000 tiles across the wilds',q17:'Witness an aurora over the crystals',q18:'Listen to Elder Mira 3 times',
  q19:'Fish up a Pal from the deep',q20:'Conquer the Tower of Trials',q21:"Complete Lina's diary (see all 33 species)"
 },
 it:{
  mode:'Modalità',modeStory:'Storia',modeZen:'Zen / Sandbox',modeSpeedrun:'Speedrun',
  difficulty:'Difficoltà',language:'Lingua',diffEasy:'Facile',diffNormal:'Normale',diffHard:'Difficile',diffNightmare:'Incubo',
  diffHelp:'Nemici più forti, catture più dure, fame più veloce. Le ricompense restano oneste.',
  team:'I TUOI PAL',craft:'CREAZIONE',lab:'LAB GENETICO',build:'COSTRUZIONE',dex:'PAL DEX',diary:'DIARIO DI LINA',ach:'RISULTATI',quests:'MISSIONI',chest:'CASSA',trade:'MERCANTE ERRANTE',edit:'LAB PAL CUSTOM',test:'MOTORE DI TEST PARALLELO',smith:'FABBRO BRAM',
  btnTeam:'📦 Squadra',btnCraft:'🎒 Crea',btnLab:'🧬 Lab',btnBuild:'🏗 Costruisci',btnDex:'📖 Paldex',btnDiary:'📓',btnAch:'🏆',btnQuests:'📋',btnSound:'🔊',btnTest:'🧪 Test',btnInstall:'📲 Installa',btnSave:'💾',
  throw:'🔮 Lancia',attack:'⚔️ Attacca',shoot:'🏹 Tira',ride:'🐎 Cavalca',dismount:'🐎 Smonta',descend:'🐉 Scendi',interact:'🤝 Interagisci',
  seed:'Seme del mondo (opzionale)',newWorld:'🌍 NUOVO MONDO',continue:'💾 CONTINUA',
  sub:'Cattura creature geometriche. Costruisci una base. Mescola i geni. Sopravvivi alla notte.',
  storySkip:'⏭ Salta',storyNext:'Continua ▶',storyBegin:'Inizia il viaggio ✦',
  respawnTitle:'Sei svenuto…',respawnSub:'Il tuo Pal attivo ti ha salvato. Risvegliati al letto.',wake:'🌅 Risvegliati',
  completeTitle:'🏆 GIOCO COMPLETATO',keepExploring:'🌍 Continua a esplorare',newRun:'🔄 Nuovo mondo',
  ch1:'🌱 Primi Passi',ch2:'⬆ Ascesa',ch3:'🗺 Frontiere',ch4:'🌑 La Resa dei Conti',ch5:'🗻 Oltre i Confini',
  q1:'Cattura 3 Pal selvatici',q2:'Raccogli 15 risorse',q3:'Costruisci un falò',q4:'Crea 2 sfere',
  q5:'Cattura 8 Pal selvatici',q6:'Sconfiggi 6 Pal selvatici',q7:'Costruisci 3 strutture',q8:'Fai evolvere un Pal',
  q9:'Sconfiggi 12 Pal selvatici',q10:'Sconfiggi un boss Alpha',q11:'Pulisci un dungeon di rovine',q12:'Batti un allenatore errante',
  q13:'Sconfiggi il SOVRANO DEL VUOTO',q14:'Cattura un Pal del Vulcano',q15:'Cattura un Pal delle Pianure di Cristallo',
  q16:'Viaggia per 3.000 caselle',q17:'Assisti a un\'aurora sui cristalli',q18:'Ascolta l\'Anziana Mira 3 volte',
  q19:'Pesca un Pal dagli abissi',q20:'Conquista la Torre delle Prove',q21:"Completa il diario di Lina (vedi tutte le 33 specie)"
 }
};
function t(k){const d=L[LANG]||L.en;return d[k]||L.en[k]||k;}
function setLang(v){if(L[v])LANG=v;}
/* ================= GAME STATE ================= */
const G={
  seed:1,player:{x:WORLD_PX/2,y:WORLD_PX/2,hp:100,maxHp:100,dir:0,invT:0},
  wilds:[],sph:[3,0,0],projectiles:[],
  team:[],active:-1,dex:{}, /* id -> count caught */
  inv:{grass:0,wood:0,berry:0,stone:0,ess:0,potion:0,arrows:0,sword:0,bow:0,cooked:0,stew:0,seeds:0,scroll:0,coins:0},
  chestInv:{grass:0,wood:0,berry:0,stone:0,ess:0},
  buildings:[],buildMode:null,
  farms:[],plantMode:false,riding:false,muted:false,
  trader:null,traderT:0,trainer:null,trainerT:0,mira:null,miraT:0,bram:null,bramT:0,miraLine:0,dungeon:null,duel:null,event:null,ruins:[],
  seen:{},minimapT:0,
  time:0.3,day:1,quests:[],bosses:[],
  hunger:100,weather:'clear',weatherT:0,equip:'none',
  complete:false,rift:null,customs:[],tower:null,fishing:null,flying:false,memories:{},
  stat:{catches:0,evolves:0,eggs:0,trainers:0,alphas:0,splices:0,fusions:0,customs:0,seasonsSeen:{},deaths:0,travel:0,style:{fight:0,gather:0,travel:0,catch:0,death:0},habits:0,eclipse:0,towerWins:0,fished:0,biomeVoices:{}},
  cam:{x:0,y:0},keys:{},running:false,respawn:false,stickVec:null,lastBiome:null,diff:'normal',mode:'story',speedrun:{on:false,elapsed:0}
};

/* ================= SAVE ================= */
const SAVE_KEY='pocketwild_save';
function saveGame(){
  try{localStorage.setItem(SAVE_KEY,JSON.stringify({seed:G.seed,player:G.player,sph:G.sph,inv:G.inv,chest:G.chestInv,team:G.team,active:G.active,dex:G.dex,seen:G.seen,time:G.time,day:G.day,buildings:G.buildings,quests:G.quests,bosses:G.bosses,hunger:G.hunger,weather:G.weather,weatherT:G.weatherT,equip:G.equip,farms:G.farms,complete:G.complete,customs:G.customs,stat:G.stat,memories:G.memories,diff:G.diff,mode:G.mode,speedrun:G.speedrun}));toast('💾 Saved','var(--cyan)');}catch(e){}
}
function loadGame(){
  try{const d=JSON.parse(localStorage.getItem(SAVE_KEY));if(!d||!d.seed)return false;
    Object.assign(G,{seed:d.seed,player:d.player,sph:d.sph||[3,0,0],inv:d.inv,chest:d.chestInv,team:d.team,active:d.active,dex:d.dex,seen:d.seen||{},time:d.time,day:d.day,buildings:d.buildings,quests:d.quests,bosses:d.bosses,hunger:d.hunger!==undefined?d.hunger:100,weather:d.weather||'clear',weatherT:d.weatherT||0,equip:d.equip||'none',farms:d.farms||[],complete:!!d.complete,customs:d.customs||[],flying:false,tower:null,fishing:null,memories:d.memories||{},diff:DIFFS[d.diff]?d.diff:'normal',mode:['story','zen','speedrun'].includes(d.mode)?d.mode:'story',speedrun:d.speedrun||{on:false,elapsed:0},stat:Object.assign({catches:0,evolves:0,eggs:0,trainers:0,alphas:0,splices:0,fusions:0,customs:0,seasonsSeen:{},deaths:0,travel:0,style:{fight:0,gather:0,travel:0,catch:0,death:0},habits:0,eclipse:0,towerWins:0,fished:0,biomeVoices:{}},d.stat||{})});
    (G.customs||[]).forEach(sp=>{if(sp&&sp.id)CUSTOM_SPECIES[sp.id]=sp;});
    /* migrazione: save vecchi che spawnavano nell'oceano → riporta su terra */
    if(solidAt(G.player.x,G.player.y)||biomeAt(Math.floor(G.player.x/TILE),Math.floor(G.player.y/TILE))==='ocean'){
      const sp=findSpawn();G.player.x=sp.x;G.player.y=sp.y;
    }
    $('weathtag').textContent=WEATHER_ICON[G.weather];
    return true;}catch(e){return false;}
}

/* ================= PALS ================= */
function makeWild(species,spawn){
  const lv=1+Math.floor(Math.random()*4);
  const p={id:species.id,x:spawn.x,y:spawn.y,hp:species.hp,lv,atk:species.atk,spd:species.spd,dir:Math.random()*6.28,t:0,state:'wander',cd:0,fx:0,isBoss:false};
  scalePal(p,lv);
  p.maxHp=Math.round(p.maxHp*diffMult('hp'));p.hp=p.maxHp;
  return p;
}
function scalePal(p,lv){p.maxHp=Math.round(p.hp*(1+0.35*(lv-1)));p.hp=p.maxHp;p.atk=Math.round(p.atk*(1+0.3*(lv-1)));}
function makeOwned(species,lv){
  const p={id:species.id,x:G.player.x,y:G.player.y,hp:species.hp,lv,atk:species.atk,spd:species.spd,xp:0,cd:0,genes:{},trait:null,dir:0,work:'follow',wanderD:0,wanderT:0};
  scalePal(p,lv);
  return p;
}
/* Pal custom (sintetizzati dal giocatore o importati da link): speciesOf li risolve per primi */
const CUSTOM_SPECIES={};
function speciesOf(id){return CUSTOM_SPECIES[id]||SPECIES.find(s=>s.id===id);}
function xpNeed(lv){return Math.round(20*Math.pow(lv,1.35));}
function addXp(p,amount){
  p.xp+=Math.round(amount*(p.habitXp||1)); /* abitudine Wanderer: +XP */
  while(p.xp>=xpNeed(p.lv)){
    p.xp-=xpNeed(p.lv);p.lv++;
    const sp=speciesOf(p.id);
    p.maxHp+=6;p.hp=p.maxHp;p.atk+=2;p.spd+=0.06;
    /* evolution */
    if(sp.evTo&&p.lv>=sp.evLv){
      p.id=sp.evTo;
      const nsp=speciesOf(p.id);
      p.maxHp=Math.round(nsp.hp*(1+0.35*(p.lv-1)));
      p.hp=p.maxHp;
      p.atk=Math.round(nsp.atk*(1+0.3*(p.lv-1)));
      SFX.evolve();
      toast('✨ '+nsp.n+' evolved!','var(--gold)');
      G.stat.evolves++;
      questEvent('evolve');
      if(G.stat.evolves===1)playCutscene('first_evolve');
    }
    SFX.level();
    toast('⬆ '+speciesOf(p.id).n+' reached Lv '+p.lv,'var(--green)');
  }
}
/* ================= PLAYSTYLE IMPRINTING =================
   Il motore (o il giocatore vero) lascia "abitudini": le statistiche di stile
   crescono con le tue azioni e ogni ~40 azioni il Pal attivo imprime
   permanentemente l'abitudine dominante. Il gioco impara da te. */
const HABITS=[
 {n:'Brawler',icon:'👊',d:'+15% ATK',e:p=>p.atk=Math.round(p.atk*1.15),k:'fight'},
 {n:'Forager',icon:'🌿',d:'+12% SPD',e:p=>p.spd=Math.round(p.spd*1.12*100)/100,k:'gather'},
 {n:'Wanderer',icon:'🥾',d:'+15% XP gain',e:p=>p.habitXp=1.15,k:'travel'},
 {n:'Collector',icon:'📖',d:'+15% max HP',e:p=>{p.maxHp=Math.round(p.maxHp*1.15);p.hp=p.maxHp;},k:'catch'},
 {n:'Undying',icon:'💀',d:'+20% max HP',e:p=>{p.maxHp=Math.round(p.maxHp*1.2);p.hp=p.maxHp;},k:'death'}
];
function stylePush(k,amt=1){
  if(!G.stat.style)G.stat.style={fight:0,gather:0,travel:0,catch:0,death:0};
  G.stat.style[k]=(G.stat.style[k]||0)+amt;
  maybeImprint();
}
function maybeImprint(){
  const st=G.stat.style;
  const total=(st.fight||0)+(st.gather||0)+(st.travel||0)+(st.catch||0)+(st.death||0);
  const next=(G.stat.habits+1)*40;
  if(total>=next&&G.team.length){
    G.stat.habits++;
    let best=null,bv=-1;
    for(const h of HABITS){if((st[h.k]||0)>bv){bv=st[h.k];best=h;}}
    const cands=G.team.filter(p=>!p.habit);
    if(cands.length){
      const ap=cands[Math.floor(Math.random()*cands.length)];
      ap.habit=best.n;
      best.e(ap);
      toast('🤖 Your '+speciesOf(ap.id).n+' imprinted your style: '+best.icon+' '+best.n+' ('+best.d+')','var(--violet)');
      SFX.evolve();
      saveGame();
    }
  }
}
function dmgCalc(base,type,defType,mult,defType2,weather){
  let m=TYPE_MULT[type][defType]||1;
  if(defType2)m=Math.max(m,TYPE_MULT[type][defType2]||1);
  if(weather==='rain'){if(type==='water')m*=1.25;if(type==='fire')m*=0.8;}
  if(weather==='sandstorm'){if(type==='fire')m*=1.2;if(type==='water')m*=0.85;}
  if(weather==='aurora'){if(type==='ice')m*=1.2;}
  return Math.max(1,Math.round(base*m*(0.85+Math.random()*0.3)));
}
function catchChance(pal,sphereTier){
  const sp=speciesOf(pal.id);
  const base=RARITY_BASE[sp.rar];
  const hpFrac=clamp(pal.hp/pal.maxHp,0,1);
  const rate=base*(1-hpFrac*0.72)*sphereTier.mult;
  return clamp(rate,0.05,0.95);
}

/* ================= QUESTS (chain) ================= */
/*
 * Le quest sono organizzate in CAPITOLI: una quest del capitolo N+1 si
 * sblocca solo quando TUTTE le quest dei capitoli precedenti sono complete.
 * Capitolo 4 sblocca la VOID RIFT (boss finale).
 */
const QUEST_DEFS=[
 /* — Chapter 1: First Steps — */
 {id:'c1',ch:1,desc:'Catch 3 wild Pals',type:'catch',t:3,r:{ess:3,sphere0:1},done:0},
 {id:'g1',ch:1,desc:'Gather 15 resources',type:'gather',t:15,r:{ess:2},done:0},
 {id:'b1',ch:1,desc:'Build a campfire',type:'build',t:1,r:{ess:4},done:0},
 {id:'cr1',ch:1,desc:'Craft 2 spheres',type:'craftSphere',t:2,r:{ess:2},done:0},
 /* — Chapter 2: Rise — */
 {id:'c2',ch:2,desc:'Catch 8 wild Pals',type:'catch',t:8,r:{ess:6,sphere1:1},done:0},
 {id:'k1',ch:2,desc:'Defeat 6 wild Pals',type:'defeat',t:6,r:{ess:8},done:0},
 {id:'b2',ch:2,desc:'Build any 3 structures',type:'build',t:3,r:{sphere1:1,ess:5},done:0},
 {id:'ev1',ch:2,desc:'Evolve a Pal',type:'evolve',t:1,r:{ess:6},done:0},
 /* — Chapter 3: Frontiers — */
 {id:'k2',ch:3,desc:'Defeat 12 wild Pals',type:'defeat',t:12,r:{ess:12,sphere2:1},done:0},
 {id:'bo1',ch:3,desc:'Defeat an Alpha boss',type:'boss',t:1,r:{sphere2:1,ess:10},done:0},
 {id:'ruin1',ch:3,desc:'Clear a Ruin dungeon',type:'ruin',t:1,r:{ess:8,sphere1:1},done:0},
 {id:'tr1',ch:3,desc:'Beat a wandering trainer',type:'trainer',t:1,r:{ess:8,coins:15},done:0},
 /* — Chapter 4: The Reckoning — */
 {id:'fb1',ch:4,desc:'Defeat the VOID SOVEREIGN',type:'finalboss',t:1,r:{},done:0},
 /* — Chapter 5: The Wilds Beyond (dopo il boss finale) — */
 {id:'v1',ch:5,desc:'Catch a Pal from the Volcano',type:'catchVolcano',t:1,r:{ess:10,sphere2:1},done:0},
 {id:'c1',ch:5,desc:'Catch a Pal from the Crystal Plains',type:'catchCrystal',t:1,r:{ess:10,sphere2:1},done:0},
 {id:'far1',ch:5,desc:'Travel 3,000 tiles across the wilds',type:'travel',t:3000,r:{ess:15},done:0},
 {id:'wea1',ch:5,desc:'Witness an aurora over the crystals',type:'aurora',t:1,r:{ess:8},done:0},
 {id:'mira1',ch:5,desc:'Listen to Elder Mira 3 times',type:'talk',t:3,r:{ess:6},done:0},
 {id:'sea1',ch:5,desc:'Fish up a Pal from the deep',type:'catchSea',t:1,r:{ess:8,sphere1:1},done:0},
 {id:'tw1',ch:5,desc:'Conquer the Tower of Trials',type:'tower',t:1,r:{ess:20,sphere2:2},done:0},
 {id:'dia1',ch:5,desc:'Complete Lina\'s diary (see all 33 species)',type:'diary',t:33,r:{ess:30,sphere2:2},done:0}
];
const QUEST_CHAPTERS={1:'🌱 First Steps',2:'⬆ Rise',3:'🗺 Frontiers',4:'🌑 The Reckoning',5:'🗻 The Wilds Beyond'};
function initQuests(){G.quests=QUEST_DEFS.map(q=>Object.assign({done:0},q));}
function questChapterDone(ch){
  return G.quests.filter(q=>q.ch<=ch).every(q=>q.done>=q.t);
}
function questUnlocked(q){
  return q.ch<=1||questChapterDone(q.ch-1);
}
function questEvent(type,amt=1){
  for(const q of G.quests){
    if(q.done>=q.t)continue;
    if(!questUnlocked(q))continue; /* capitolo bloccato */
    if(q.type===type){
      q.done=Math.min(q.t,q.done+amt);
      if(q.done>=q.t){
        SFX.quest();
        toast('📋 Quest complete: '+q.desc,'var(--gold)');
        questReward(q);
        /* nuova quest sbloccata? */
        if(questChapterDone(q.ch)&&!questChapterDone(q.ch+1)){
          toast('🔓 Chapter '+Math.min(q.ch+1,4)+' unlocked!','var(--cyan)');
          if(q.ch+1===4)maybeSpawnRift();
        }
      }
    }
  }
}
function questReward(q){
  if(q.r.ess)G.inv.ess+=q.r.ess;
  if(q.r.coins)G.inv.coins=(G.inv.coins||0)+q.r.coins;
  if(q.r.sphere!==undefined)addSphere(q.r.sphere,1);
  if(q.r.sphere0!==undefined)addSphere(0,1);
  if(q.r.sphere1!==undefined)addSphere(1,1);
  if(q.r.sphere2!==undefined)addSphere(2,1);
}
function addSphere(tier,n){G.sph[tier]=(G.sph[tier]||0)+n;}

/* ================= ACHIEVEMENTS (profilo persistente) ================= */
const ACH_DEFS=[
 {id:'first_catch',n:'First Catch',d:'Catch your first Pal',icon:'🔮'},
 {id:'catcher',n:'Collector',d:'Catch 10 different species',icon:'📖'},
 {id:'paldexer',n:'Paldexer',d:'See 20 different species',icon:'🌍'},
 {id:'evolver',n:'Evolutionist',d:'Evolve a Pal',icon:'✨'},
 {id:'builder',n:'Architect',d:'Build 5 structures',icon:'🏗️'},
 {id:'trader',n:'Trader',d:'Hold 30 coins',icon:'🪙'},
 {id:'rich',n:'Rich',d:'Hold 100 coins',icon:'💰'},
 {id:'breeder',n:'Breeder',d:'Hatch an egg at the Ranch',icon:'🥚'},
 {id:'trainer_slayer',n:'Trainer Slayer',d:'Beat 3 wandering trainers',icon:'⚔️'},
 {id:'alpha',n:'Alpha Hunter',d:'Defeat an Alpha boss',icon:'🏆'},
 {id:'hero',n:'Hero of the Wilds',d:'Defeat the Void Sovereign',icon:'🌑'},
 {id:'survivor',n:'Survivor',d:'Reach day 7',icon:'⛺'},
 {id:'seasoned',n:'Seasoned',d:'See all 4 seasons',icon:'🌸'},
 {id:'splicer',n:'Splicer',d:'Splice a gene',icon:'🧬'},
 {id:'fuseman',n:'Fusionist',d:'Fuse two Pals',icon:'🔀'},
 {id:'creator',n:'Creator',d:'Synthesize a custom Pal',icon:'🎨'},
 {id:'eclipse',n:'Eclipse Watcher',d:'Witness the Eclipse Night',icon:'🌒'},
 {id:'tower',n:'Tower Legend',d:'Conquer the Tower of Trials',icon:'🗼'},
 {id:'angler',n:'Angler',d:'Catch a Pal while fishing',icon:'🎣'},
 {id:'diarist',n:'Keeper of Dreams',d:'Complete Lina\'s diary (see all 33 species)',icon:'📓'}
];
const PROFILE_KEY='pocketwild_profile';
let ACH={a:{}};
try{const d=JSON.parse(localStorage.getItem(PROFILE_KEY));if(d&&d.a)ACH={a:d.a};}catch(e){}
function saveProfile(){try{localStorage.setItem(PROFILE_KEY,JSON.stringify(ACH));}catch(e){}}
function checkAch(){
  if(!G.running)return;
  const st=G.stat;
  const tryAch=(id,cond)=>{
    if(cond&&!ACH.a[id]){
      ACH.a[id]=1;saveProfile();
      if(!SILENT){
        const def=ACH_DEFS.find(a=>a.id===id);
        toast('🏆 Achievement: '+def.icon+' '+def.n+' — '+def.d,'var(--gold)');
        SFX.quest();
      }
    }
  };
  tryAch('first_catch',st.catches>=1);
  tryAch('catcher',Object.keys(G.dex).length>=10);
  tryAch('paldexer',Object.keys(G.seen).length>=20);
  tryAch('evolver',st.evolves>=1);
  tryAch('builder',G.buildings.length>=5);
  tryAch('trader',(G.inv.coins||0)>=30);
  tryAch('rich',(G.inv.coins||0)>=100);
  tryAch('breeder',st.eggs>=1);
  tryAch('trainer_slayer',st.trainers>=3);
  tryAch('alpha',st.alphas>=1);
  tryAch('hero',G.complete===true);
  tryAch('survivor',G.day>=7);
  tryAch('seasoned',Object.keys(st.seasonsSeen||{}).length>=4);
  tryAch('splicer',st.splices>=1);
  tryAch('fuseman',st.fusions>=1);
  tryAch('creator',st.customs>=1);
  tryAch('eclipse',(st.eclipse||0)>=1);
  tryAch('tower',(st.towerWins||0)>=1);
  tryAch('angler',(st.fished||0)>=1);
  tryAch('diarist',Object.keys(G.seen).length>=SPECIES.length);
  /* quest diario: avanza col numero di specie viste */
  const dq=G.quests.find(q=>q.type==='diary');
  if(dq&&dq.done<dq.t&&questUnlocked(dq)){
    const seenN=Object.keys(G.seen).length;
    if(seenN>dq.done){
      dq.done=Math.min(dq.t,seenN);
      if(dq.done>=dq.t){
        questReward(dq);
        if(!SILENT){toast('📓 Diary complete: '+dq.desc,'var(--gold)');SFX.quest();}
      }
    }
  }
}

/* ================= CRAFTING ================= */
const RECIPES=[
 {n:'Sphere',icon:'🔮',cost:{grass:2,ess:1},give:()=>addSphere(0,1),desc:'Catch basic Pals'},
 {n:'Great Sphere',icon:'🔵',cost:{wood:3,ess:2},give:()=>addSphere(1,1),desc:'Better catch rate'},
 {n:'Ultra Sphere',icon:'💗',cost:{stone:3,ess:4,berry:1},give:()=>addSphere(2,1),desc:'Rare Pals'},
 {n:'Potion',icon:'🧪',cost:{berry:3},give:()=>{G.inv.potion=(G.inv.potion||0)+1;},desc:'Heal 60 HP'},
 {n:'Cooked Berries',icon:'🍡',cost:{berry:3},give:()=>{G.inv.cooked=(G.inv.cooked||0)+2;},desc:'+40 hunger'},
 {n:'Stew',icon:'🍲',cost:{berry:2,grass:2},give:()=>{G.inv.stew=(G.inv.stew||0)+1;},desc:'+60 hunger'},
 {n:'Sword',icon:'⚔️',cost:{wood:3,stone:2},give:()=>{G.inv.sword=1;G.equip='sword';},desc:'Melee weapon (18 dmg)'},
 {n:'Bow',icon:'🏹',cost:{wood:3,grass:2},give:()=>{G.inv.bow=1;G.equip='bow';},desc:'Ranged weapon'},
 {n:'Arrow ×3',icon:'➶',cost:{stone:1},give:()=>{G.inv.arrows=(G.inv.arrows||0)+3;},desc:'Ammo for the bow'},
 {n:'Berry Seeds',icon:'🌱',cost:{berry:2},give:()=>{G.inv.seeds=(G.inv.seeds||0)+1;},desc:'Plant on grass, harvest berries'},
 {n:'Skill Scroll',icon:'📜',cost:{ess:3,wood:2},give:()=>{G.inv.scroll=(G.inv.scroll||0)+1;},desc:'Teach a Pal a new skill'},
 {n:'Fishing Rod',icon:'🎣',cost:{wood:3,grass:2},give:()=>{G.inv.rod=1;},desc:'Fish sea Pals from any shore'},
 {n:'Lure',icon:'🪱',cost:{berry:2},give:()=>{G.inv.lure=(G.inv.lure||0)+1;},desc:'Bites come faster (fishing)'}
];
const STRUCTURES=[
 {id:'campfire',n:'Campfire',icon:'🔥',cost:{wood:3,stone:2},desc:'Light + slow heal at night'},
 {id:'lantern',n:'Lantern',icon:'🏮',cost:{stone:2,grass:2},desc:'Pushes back the dark at night'},
 {id:'bed',n:'Bed',icon:'🛏️',cost:{grass:4,wood:3},desc:'Full heal + respawn point'},
 {id:'workbench',n:'Workbench',icon:'🛠️',cost:{wood:5},desc:'Crafting station'},
 {id:'chest',n:'Chest',icon:'📦',cost:{wood:4},desc:'Extra storage'},
 {id:'ranch',n:'Ranch',icon:'🥚',cost:{wood:6,grass:4},desc:'Breed two Pals → eggs'},
 {id:'arena',n:'Arena',icon:'⚔️',cost:{stone:6,wood:3},desc:'Duel an AI trainer'},
 {id:'tower',n:'Tower of Trials',icon:'🗼',cost:{stone:8,wood:5,ess:3},desc:'Climb 10 floors of trials'}
];

/* ================= SPAWNING ================= */
function spawnWild(force){
  if(G.wilds.length>70)return;
  if(G.dungeon||G.tower)return; /* niente spawn normali in dungeon/torre */
  const season=curSeason();
  for(let tries=0;tries<4;tries++){
    const a=Math.random()*6.28,d=7+Math.random()*9;
    const x=G.player.x+Math.cos(a)*d*TILE,y=G.player.y+Math.sin(a)*d*TILE;
    if(solidAt(x,y))continue;
    const tx=Math.floor(x/TILE),ty=Math.floor(y/TILE);
    const bm=biomeAt(tx,ty);if(bm==='ocean')continue;
    const night=G.time>0.68;
    const meteor=G.event&&G.event.type==='meteor';
    const pool=SPECIES.filter(s=>{
      if(meteor&&s.rar<1&&s.type!=='void'&&s.type!=='fire')return false;
      return (s.biome==='void'||s.biome===bm)&&(night||!s.noct)&&!s.evTo&&(s.season===undefined||s.season===season);
    });
    if(!pool.length)pool.push(SPECIES[0]);
    /* peso: Pal di stagione molto più comuni; bonus per tipo dominante */
    const wp=[];
    for(const s of pool){
      let w=1;
      if(s.season===season)w+=4;
      if(G.event&&G.event.type==='eclipse'&&(s.type==='void'||s.type==='fire'))w+=6;
      if(season===0&&s.type==='grass')w+=1;
      if(season===1&&s.type==='fire')w+=2;
      if(season===2&&(s.type==='grass'||s.type==='fire'))w+=1;
      if(season===3&&s.type==='ice')w+=2;
      for(let i=0;i<w;i++)wp.push(s);
    }
    const sp=wp[Math.floor(Math.random()*wp.length)];
    G.seen[sp.id]=true;
    G.wilds.push(makeWild(sp,{x,y}));
    break;
  }
}
function initBosses(){
  G.bosses=[];
  const bossMap={grass:'groveheart',desert:'magmalord',snow:'blizzarion',volcano:'ashmoth',crystal:'prismoth'};
  const bmList=['grass','desert','snow','volcano','crystal'];
  bmList.forEach((bm,i)=>{
    for(let tries=0;tries<260;tries++){
      const tx=clamp(Math.floor(180+i*430+Math.random()*400),90,WORLD_T-90);
      const ty=clamp(Math.floor(250+Math.random()*1150),90,WORLD_T-90);
      if(biomeAt(tx,ty)===bm&&!solidAt(tx*TILE,ty*TILE)){
        const sp=SPECIES.find(s=>s.id===bossMap[bm]);
        const b=makeWild(sp,{x:tx*TILE,y:ty*TILE});
        b.isBoss=true;b.lv=12;b.maxHp=b.hp*6;b.hp=b.maxHp;b.atk=b.atk*2;b.spd=b.spd*0.9;b.fx=1;
        G.bosses.push(b);break;
      }
    }
  });
}
function wildsNear(){return G.wilds.filter(w=>dist(w,G.player)<24*TILE);}

/* ================= GENE LAB ================= */
const TRAITS=[{n:'Swift',d:'+20% speed',e:p=>p.spd*=1.2},{n:'Vampiric',d:'heal on hit',e:p=>p.traitVamp=1},{n:'Berserk',d:'+25% ATK',e:p=>p.atk*=1.25},{n:'Tough',d:'+25% HP',e:p=>{p.maxHp=Math.round(p.maxHp*1.25);p.hp=p.maxHp;}}];
function spliceGene(targetIdx,donorIdx,gene){
  if(G.inv.ess<5){toast('Need 5 🧪 essence','var(--red)');return;}
  const t=G.team[targetIdx],d=G.team[donorIdx];
  if(!t||!d)return;
  G.inv.ess-=5;
  const ts=speciesOf(t.id),ds=speciesOf(d.id);
  if(gene==='hp'){t.maxHp=Math.round(lerp(t.maxHp,ds.hp*(1+0.35*(d.lv-1)),0.3)+Math.random()*6);t.hp=t.maxHp;}
  else if(gene==='atk'){t.atk=Math.round(lerp(t.atk,ds.atk*(1+0.3*(d.lv-1)),0.3)+Math.random()*3);}
  else if(gene==='spd'){t.spd=lerp(t.spd,ds.spd,0.3);}
  else if(gene==='color'){t.spliceCol=ds.col;}
  else if(gene==='trait'){if(!t.trait){const tr=TRAITS[Math.floor(Math.random()*TRAITS.length)];t.trait=tr.n;tr.e(t);toast('🧬 Trait: '+tr.n+' — '+tr.d,'var(--violet)');}else toast('Already has a trait','var(--amber)');}
  toast('🧬 Gene spliced!','var(--violet)');
  G.stat.splices++;
  questEvent('lab');
  saveGame();
}
function fusePals(aIdx,bIdx){
  const a=G.team[aIdx],b=G.team[bIdx];
  if(!a||!b||a.id!==b.id){toast('Fusion needs two Pals of the SAME species','var(--amber)');return;}
  if(G.inv.ess<8){toast('Need 8 🧪 essence','var(--red)');return;}
  G.inv.ess-=8;
  const nl=Math.round((a.lv+b.lv)/2)+1;
  a.lv=clamp(nl,1,50);a.maxHp=Math.round((a.maxHp+b.maxHp)*0.7);a.hp=a.maxHp;a.atk=Math.round((a.atk+b.atk)*0.75);
  G.team.splice(bIdx,1);
  if(G.active>=G.team.length)G.active=G.team.length-1;
  toast('🔀 Fusion complete: stronger '+speciesOf(a.id).n+'!','var(--magenta)');
  G.stat.fusions++;
  questEvent('fusion');
  saveGame();
}

/* ================= CUSTOM PAL EDITOR ================= */
const SHAPE_ICON=['⬤','✿','△','□','◇','★'];
const SKILL_POOL={
 grass:[['Leaf Shot',12,2.0],['Thorn Slam',20,3.0],['Grovequake',36,4.5]],
 fire:[['Ember',12,2.0],['Fire Claw',22,3.0],['Magma Burst',40,4.5]],
 ice:[['Frost Shard',12,2.0],['Glacier Wing',20,3.0],['Avalanche',36,4.5]],
 water:[['Water Jet',12,2.0],['Tide Crash',20,3.0],['Tsunami',36,4.5]],
 void:[['Shadow Lick',12,1.8],['Eclipse Dive',24,3.0],['Void Pulse',38,4.0]]
};
const CUSTOM_COST=20; /* essenza per sintetizzare */
let E={shape:0,col:'#3ee6ff',type:'grass',hp:70,atk:16,spd:1.4,trait:null,skills:[],name:''};
function encodePal(sp){
  const j=JSON.stringify(sp);
  return btoa(unescape(encodeURIComponent(j))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}
function decodePal(s){
  try{
    const b=s.replace(/-/g,'+').replace(/_/g,'/');
    return JSON.parse(decodeURIComponent(escape(atob(b))));
  }catch(e){return null;}
}
function sanitizeCustom(sp){
  if(!sp||typeof sp!=='object')return null;
  sp.shape=clamp(sp.shape|0,0,5);sp.col=typeof sp.col==='string'?sp.col:'#3ee6ff';
  sp.type=TYPES[sp.type]?sp.type:'grass';
  sp.hp=clamp(Math.round(sp.hp)||70,30,130);
  sp.atk=clamp(Math.round(sp.atk)||16,6,34);
  sp.spd=clamp(+sp.spd||1.4,0.9,2.0);
  sp.rar=1;
  if(!Array.isArray(sp.skills))sp.skills=[];
  sp.skills=sp.skills.slice(0,3).filter(s=>Array.isArray(s)&&s.length>=3&&!isNaN(s[1]));
  sp.n=typeof sp.n==='string'&&sp.n.trim()?sp.n.slice(0,18):'Custom';
  sp.trait=TRAITS.some(t=>t.n===sp.trait)?sp.trait:null;
  sp.custom=true;sp.desc='A custom-synthesized Pal.';
  return sp;
}
function createCustomPal(){
  if((G.inv.ess||0)<CUSTOM_COST){toast('Need '+CUSTOM_COST+' 🧪 essence to synthesize','var(--red)');return;}
  if(!E.skills.length){toast('Pick at least 1 skill','var(--amber)');return;}
  G.inv.ess-=CUSTOM_COST;
  const sp=sanitizeCustom({n:E.name||'Custom',col:E.col,shape:E.shape,type:E.type,hp:E.hp,atk:E.atk,spd:E.spd,trait:E.trait,skills:E.skills});
  sp.id='custom_'+hashSeed(sp.n+sp.col+sp.hp+sp.atk+sp.spd+Math.random()).toString(36)+Math.random().toString(36).slice(2,6);
  CUSTOM_SPECIES[sp.id]=sp;G.customs.push(sp);
  const p=makeOwned(sp,1);
  if(sp.trait){const tr=TRAITS.find(t=>t.n===sp.trait);if(tr)tr.e(p);p.trait=sp.trait;}
  G.team.push(p);
  if(G.active<0)G.active=0;
  toast('🧬 '+sp.n+' synthesized!','var(--violet)');
  SFX.evolve();
  G.stat.customs++;
  saveGame();
  renderPanel('pTeam');
}
function copyShareLink(){
  const sp=sanitizeCustom({n:E.name||'Custom',col:E.col,shape:E.shape,type:E.type,hp:E.hp,atk:E.atk,spd:E.spd,trait:E.trait,skills:E.skills});
  const link=location.origin+location.pathname+'#pal='+encodePal(sp);
  const done=()=>toast('🔗 Share link copied!','var(--green)');
  if(navigator.clipboard&&navigator.clipboard.writeText){
    navigator.clipboard.writeText(link).then(done,()=>{const i=document.createElement('input');i.value=link;document.body.appendChild(i);i.select();try{document.execCommand('copy');}catch(e){}i.remove();done();});
  }else{const i=document.createElement('input');i.value=link;document.body.appendChild(i);i.select();try{document.execCommand('copy');}catch(e){}i.remove();done();}
}
function spawnCustomWild(sp){
  for(let t=0;t<80;t++){
    const a=Math.random()*6.28,d=6+Math.random()*8;
    const x=G.player.x+Math.cos(a)*d*TILE,y=G.player.y+Math.sin(a)*d*TILE;
    if(solidAt(x,y)||biomeAt(Math.floor(x/TILE),Math.floor(y/TILE))==='ocean')continue;
    const w=makeWild(sp,{x,y});
    w.lv=Math.max(3,Math.round((G.team.length?Math.max(...G.team.map(p=>p.lv)):1)*0.8));
    scalePal(w,w.lv);
    w.isCustom=true;w.fx=1;
    G.seen[sp.id]=true;
    G.wilds.push(w);
    toast('🌠 A wild '+sp.n+' has appeared!','var(--violet)');
    return;
  }
}
let pendingCustom=null;
function importCustomPal(){
  const h=location.hash.match(/#pal=([A-Za-z0-9\-_]+)/);
  if(!h)return;
  const sp=sanitizeCustom(decodePal(h[1]));
  if(!sp)return;
  sp.id=sp.id||('custom_'+hashSeed(sp.n+sp.col+sp.hp).toString(36));
  CUSTOM_SPECIES[sp.id]=sp;G.customs.push(sp);
  pendingCustom=sp;
  try{history.replaceState(null,'',location.pathname+location.search);}catch(e){}
}

/* ================= ACHIEVEMENTS UI ================= */
function renderAch(){
  const box=$('achList');box.innerHTML='';
  let got=0;
  for(const a of ACH_DEFS){
    const on=!!ACH.a[a.id];
    if(on)got++;
    const div=document.createElement('div');div.className='row';
    div.style.cssText=on?'':'opacity:.5';
    div.innerHTML='<span>'+(on?a.icon:'🔒')+'</span><span class="nm">'+a.n+'</span><span class="st">'+a.d+'</span>'+(on?'<span style="color:var(--gold)">✓</span>':'');
    box.appendChild(div);
  }
  $('achCountTxt').textContent=got+' / '+ACH_DEFS.length;
}

/* ================= PARALLEL TEST ENGINE =================
   Un "motore parallelo": mette in pausa il gioco live, scatta un'istantanea,
   lascia che un bot giochi da solo (stesse funzioni di update del gioco reale,
   a velocità moltiplicata), registra un report e alla fine RIPRISTINA lo stato
   (o lo mantiene se chiedi "keep"). Serve a provare cose senza rischiare il save. */
const BOT={on:false,t:0,goal:null,goalT:0,log:[],simT:0,snap:null,keep:false,speed:5,intv:null,startDay:1,startEss:0,startCoins:0,startDex:0};
function snapshotG(){return JSON.parse(JSON.stringify(G));}
function restoreG(s){Object.assign(G,s);(G.customs||[]).forEach(sp=>{if(sp&&sp.id)CUSTOM_SPECIES[sp.id]=sp;});}
function botLog(msg){BOT.log.push(msg);if(BOT.log.length>40)BOT.log.shift();}
function nearestBy(cond,from){
  let best=null,bd=1e9;
  const items=G.wilds.filter(cond);
  for(const w of items){const d=dist(w,from);if(d<bd){bd=d;best=w;}}
  return best;
}
function nearestTileObj(kind,from){
  let best=null,bd=1e9;
  const tx=Math.floor(from.x/TILE),ty=Math.floor(from.y/TILE);
  for(let dy=-20;dy<=20;dy++)for(let dx=-20;dx<=20;dx++){
    if(tileObj(tx+dx,ty+dy)===kind){
      const d=Math.hypot(dx,dy);
      if(d<bd){bd=d;best={x:(tx+dx)*TILE+8,y:(ty+dy)*TILE+8};}
    }
  }
  return best;
}
function bestSphere(sp){
  const tier=sp.rar>=2?2:sp.rar>=1?1:0;
  if(G.sph[tier]>0)return tier;
  for(let t=2;t>=0;t--)if(G.sph[t]>0)return t;
  return-1;
}
function botSet(goal,data){BOT.goal=goal;BOT.data=data;BOT.goalT=0;}
function botDecide(){
  const p=G.player;
  if(G.respawn){botSet('respawn');return;}
  if(p.hp<p.maxHp*0.32){
    const bed=G.buildings.find(b=>b.id==='bed');
    botSet('rest',bed?{x:bed.x,y:bed.y}:null);
    return;
  }
  if(G.hunger<28){botSet('eat',nearestTileObj('berry',p));return;}
  if(!G.buildings.some(b=>b.id==='bed')&&G.inv.grass>=4&&G.inv.wood>=3){botSet('buildBed');return;}
  if(G.duel){botSet('fight');return;}
  if(G.dungeon||G.tower){botSet('dungeon');return;}
  const twB=G.buildings.find(b=>b.id==='tower');
  if(twB){botSet('towerGo',{x:twB.x,y:twB.y});return;}
  if(G.rift){botSet('rift');return;}
  const q=G.quests.find(q=>q.done<q.t&&(q.ch<=1||questChapterDone(q.ch-1)));
  if(q){
    if(q.type==='catch'){botSet('catch');return;}
    if(q.type==='defeat'||q.type==='boss'){botSet('fight');return;}
    if(q.type==='ruin'){botSet('dungeon');return;}
    if(q.type==='trainer'){botSet('trainer');return;}
    if(q.type==='build'){botSet('build');return;}
    if(q.type==='gather'){botSet('gather');return;}
    if(q.type==='craftSphere'){botSet('craft');return;}
    if(q.type==='talk'){botSet('talk');return;}
  }
  if(G.trainer&&!G.trainer.defeated){botSet('trainer');return;}
  if(G.mira&&G.mira.cd<=0&&G.quests.find(q=>q.type==='talk'&&q.done<q.t)){botSet('talk');return;}
  if(G.bram&&(G.inv.coins||0)>=20&&G.player.maxHp<200){botSet('smith');return;}
  botSet('wander');
}
function botMove(dt){
  const p=G.player;
  /* azioni immediate (non richiedono di raggiungere un punto) */
  if(BOT.goal==='build'){
    if(G.buildings.length<2&&G.inv.wood>=3&&G.inv.stone>=2&&!solidAt(p.x,p.y)){
      placeBuild('campfire');
      tryPlace(p.x,p.y);
      botLog('🔥 Built a campfire');
    }
    botSet('wander');
    return;
  }
  if(BOT.goal==='buildBed'){
    if(!G.buildings.some(b=>b.id==='bed')&&G.inv.grass>=4&&G.inv.wood>=3&&!solidAt(p.x,p.y)){
      placeBuild('bed');
      tryPlace(p.x,p.y);
      botLog('🛏️ Built a bed');
    }
    botSet('wander');
    return;
  }
  if(BOT.goal==='craft'){
    if(G.inv.grass>=2&&G.inv.ess>=1){
      RECIPES[0].give();G.inv.grass-=2;G.inv.ess-=1;
      questEvent('craftSphere');
      botLog('🛠 Crafted a Sphere');
    }else{
      const res=G.inv.grass<2?nearestTileObj('bush',p):nearestTileObj('tree',p);
      if(res){BOT.data=res;botSet('gather');}
      else botSet('wander');
    }
    return;
  }
  const goal=BOT.data;
  if(!goal){G.stickVec=null;return;}
  const dx=goal.x-p.x,dy=goal.y-p.y,d=Math.hypot(dx,dy)||1;
  if(d>1.4*TILE){
    G.stickVec={x:dx/d,y:dy/d};
  }else{
    G.stickVec=null;
    /* azione al raggiungimento */
    switch(BOT.goal){
      case'rest':{
        const bed=G.buildings.find(b=>b.id==='bed');
        if(bed&&dist(bed,p)<2*TILE){p.hp=p.maxHp;botSet('wander');botLog('😴 Rested at the bed');}
        else botSet('wander');
        break;}
      case'eat':{
        const bush=nearestTileObj('berry',p);
        if(bush&&dist(bush,p)<2*TILE){botSet('wander');botLog('🍓 Foraging berries');}
        else botSet('wander');
        break;}
      case'catch':{
        const w=BOT.data;
        if(!w||!G.wilds.includes(w)){botSet('wander');break;}
        if(BOT.throwT>0)break;
        const tier=bestSphere(speciesOf(w.id));
        if(tier<0){botSet('wander');break;}
        p.dir=Math.atan2(w.y-p.y,w.x-p.x);
        throwSphere(tier);
        botLog('🔮 Threw a sphere at '+speciesOf(w.id).n);
        BOT.throwT=0.9;
        break;}
      case'fight':{
        const w=BOT.data;
        if(w&&G.wilds.includes(w)){
          p.dir=Math.atan2(w.y-p.y,w.x-p.x);
          if(G.equip==='sword')attack();else interact();
        }
        BOT.data=null;botSet('wander');
        break;}
      case'dungeon':{
        if(G.dungeon){
          const w=nearestBy(w=>w.dungeon,p);
          if(w){BOT.data=w;botSet('fight');}
          else botSet('wander');
        }else if(G.tower){
          const w=nearestBy(w=>w.tower,p);
          if(w){BOT.data=w;botSet('fight');}
          else botSet('wander');
        }else{
          const ru=G.ruins.sort((a,b)=>dist(a,p)-dist(b,p))[0];
          if(ru)interact();
          botSet('wander');
        }
        break;}
      case'towerGo':{
        const twB=G.buildings.find(b=>b.id==='tower');
        if(twB&&dist(twB,p)<2.4*TILE){interact();}
        botSet('wander');
        break;}
      case'trainer':{
        if(G.trainer&&dist(G.trainer,p)<2.2*TILE){challengeTrainer();botSet('fight');}
        else botSet('wander');
        break;}
      case'talk':{
        if(G.mira&&dist(G.mira,p)<2.4*TILE){interact();}
        botSet('wander');
        break;}
      case'smith':{
        if(G.bram&&dist(G.bram,p)<2.4*TILE&&(G.inv.coins||0)>=20){buyUpgrade(2);}
        botSet('wander');
        break;}
      case'rift':{
        if(G.rift&&dist(G.rift,p)<2.2*TILE){interact();botSet('fight');}
        else botSet('wander');
        break;}
      default:botSet('wander');
    }
  }
}
function botTick(dt){
  BOT.t-=dt;
  if(BOT.t<=0){BOT.t=0.3;botDecide();}
  /* fuga: a HP bassi scappa dal pericolo più vicino */
  if(G.player.hp<G.player.maxHp*0.45&&!G.respawn){
    const threat=nearestBy(w=>!w.dungeon&&(w.isFinal||w.isBoss||w.isDuel),G.player)||nearestBy(w=>!w.dungeon&&w.state==='chase',G.player);
    if(threat&&dist(threat,G.player)<5*TILE){
      const dx=G.player.x-threat.x,dy=G.player.y-threat.y,d=Math.hypot(dx,dy)||1;
      G.stickVec={x:dx/d,y:dy/d};
      if(BOT.goal!=='rest')botLog('🏃 Fleeing from '+speciesOf(threat.id).n);
      return;
    }
  }
  /* ricompatta gli obiettivi dinamici */
  if(BOT.goal==='catch'||BOT.goal==='fight'||BOT.goal==='dungeon'){
    if(!BOT.data||(BOT.data&&!G.wilds.includes(BOT.data))){
      let near=null;
      if(BOT.goal==='catch')near=nearestBy(w=>!w.isBoss&&!w.isFinal&&!w.isDuel&&!w.dungeon&&w.hp<w.maxHp*0.8,G.player)
        ||nearestBy(w=>!w.isBoss&&!w.isFinal&&!w.isDuel&&!w.dungeon,G.player);
      else if(BOT.goal==='fight')near=nearestBy(w=>w.isFinal||w.isBoss||w.isDuel||w.dungeon,G.player)||nearestBy(w=>!w.isDuel&&!w.dungeon,G.player);
      else near=nearestBy(w=>w.dungeon||w.tower,G.player);
      if(near)BOT.data=near;
    }
  }
  botMove(dt);
  if(BOT.throwT>0)BOT.throwT-=dt;
}
function stepSim(dt){
  moveInput(dt);
  updateProjectiles(dt);
  updateActivePal(dt);
  updateTime(dt);
  updateWeather(dt);
  updateHunger(dt);
  updateWorkPals(dt);
  updateFarms(dt);
  updateRanches(dt);
  updateDungeon(dt);
  updateTower(dt);
  updateFishing(dt);
  updateBiomeVoice();
  if(G.speedrun&&G.speedrun.on)G.speedrun.elapsed+=dt;
  updateEvent(dt);
  updateTrader(dt);
  updateTrainer(dt);
  updateTrainerDuel(dt);
  updateMira(dt);
  updateBram(dt);
  updateFinalBoss(dt);
  /* wild AI (identico al loop reale) */
  for(let i=0;i<G.wilds.length;i++){
    const w=G.wilds[i];
    if(!w.isDuel&&(i+aiFrame)%2===1)continue;
    const d=dist(w,G.player);
    if(w.isDuel){
      const ap=G.team[G.active];
      if(ap){
        const da=dist(w,ap);
        w.dir=Math.atan2(ap.y-w.y,ap.x-w.x);
        const spd=speciesOf(w.id).spd*60*dt;
        let nx=w.x+Math.cos(w.dir)*spd,ny=w.y+Math.sin(w.dir)*spd;
        if(!solidAt(nx,ny)){w.x=nx;w.y=ny;}
        if(da<1.2*TILE&&!G.flying){ap.hp-=w.atk*0.8*dt*diffMult('dmgIn');if(ap.hp<=0){ap.hp=ap.maxHp*0.5;BOT.goal='wander';G.duel=null;G.wilds.splice(G.wilds.indexOf(w),1);break;}}
      }
      continue;
    }
    if(w.isFinal){w.state='chase';w.dir=Math.atan2(G.player.y-w.y,G.player.x-w.x);const spd=w.spd*55*dt;let nx=w.x+Math.cos(w.dir)*spd,ny=w.y+Math.sin(w.dir)*spd;if(!solidAt(nx,ny)){w.x=nx;w.y=ny;}if(d<2.2*TILE){G.player.hp-=w.atk*0.75*dt*diffMult('dmgIn');if(G.player.hp<=0)faint();}continue;}
    if(w.isBoss&&d<8*TILE)w.state='chase';
    else if(d<3*TILE){w.state='chase';w.dir=Math.atan2(G.player.y-w.y,G.player.x-w.x);}
    else if(w.state==='chase'&&d>6*TILE)w.state='wander';
    if(w.state==='chase'){
      const sp=speciesOf(w.id);const spd=sp.spd*60*dt;
      let nx=w.x+Math.cos(w.dir)*spd,ny=w.y+Math.sin(w.dir)*spd;
      if(!solidAt(nx,ny)){w.x=nx;w.y=ny;}
      if(d<1.3*TILE&&!G.flying){G.player.hp-=w.atk*0.6*dt*diffMult('dmgIn');if(G.player.hp<=0)faint();}
    }else{w.dir+=(Math.random()-0.5)*0.6;const sp=speciesOf(w.id);let nx=w.x+Math.cos(w.dir)*sp.spd*30*dt,ny=w.y+Math.sin(w.dir)*sp.spd*30*dt;if(!solidAt(nx,ny)){w.x=nx;w.y=ny;}}
  }
  aiFrame++;
  if(Math.random()<dt*1.5*SEASONS[curSeason()].spawnMult*(G.event&&G.event.type==='eclipse'?2:1))spawnWild();
  if(G.player.hp<G.player.maxHp&&G.time<0.6)G.player.hp=Math.min(G.player.maxHp,G.player.hp+1*dt);
  if((G.inv.potion||0)>0&&G.player.hp<G.player.maxHp*0.5){G.player.hp=Math.min(G.player.maxHp,G.player.hp+60);G.inv.potion--;}
  for(const b of G.buildings)if(b.id==='campfire'&&dist(b,G.player)<4*TILE)G.player.hp=Math.min(G.player.maxHp,G.player.hp+4*dt);
  if(G.respawn){ /* il bot si rimette in piedi */
    const bed=G.buildings.find(b=>b.id==='bed');
    if(bed){G.player.x=bed.x;G.player.y=bed.y;}
    G.player.hp=G.player.maxHp;G.respawn=false;
    botLog('💀 Fainted — '+(bed?'respawned at the bed':'respawned at spawn point'));
  }
  botTick(dt);
  checkAch();
  BOT.simT+=dt;
}
function simReport(){
  const qDone=G.quests.filter(q=>q.done>=q.t).length;
  return '⏱ sim: '+BOT.simT.toFixed(1)+'s · days: +'+(G.day-BOT.startDay)+' · catches: '+G.stat.catches+
    ' · species: '+Object.keys(G.dex).length+' · ess: '+(G.inv.ess-BOT.startEss)+' · coins: '+(G.inv.coins-BOT.startCoins)+
    ' · quests: '+qDone+'/'+G.quests.length+' · deaths: '+G.stat.deaths+' · goal: '+(BOT.goal||'-');
}
function startSim(){
  if(BOT.intv)return;
  BOT.wasRunning=G.running;
  BOT.snap=snapshotG();
  BOT.log=['🧪 Parallel engine started'];
  BOT.simT=0;BOT.startDay=G.day;BOT.startEss=G.inv.ess;BOT.startCoins=G.inv.coins||0;
  BOT.startDex=Object.keys(G.dex).length;
  G.running=false; /* pausa il gioco live */
  SILENT=true;
  $('testStatus').textContent='▶ simulating…';
  BOT.intv=setInterval(()=>{
    const n=Math.max(1,BOT.speed);
    for(let i=0;i<n;i++)stepSim(0.05);
    $('testStatus').textContent=simReport();
  },50);
  $('simBadge').style.display='block';
}
function stopSim(){
  if(!BOT.intv)return;
  clearInterval(BOT.intv);BOT.intv=null;
  SILENT=false;
  G.stickVec=null;
  $('simBadge').style.display='none';
  const report=simReport()+' · log: '+BOT.log.length+' entries';
  if(!BOT.keep){restoreG(BOT.snap);}
  else{saveGame();}
  G.running=!!BOT.wasRunning;
  $('respawn').classList.remove('on');
  $('complete').classList.remove('on');
  $('testStatus').textContent=report+(BOT.keep?' · ⭐ KEPT results':' · ♻ state restored');
  $('testLog').textContent=BOT.log.slice(-10).join('\n');
  $('testReport').textContent=report;
  BOT.snap=null;
}
/* esperimenti: agiscono sul mondo corrente (sim se attiva, altrimenti live+save) */
function testGive(kind){
  if(kind==='spheres'){G.sph[0]+=5;G.sph[1]+=3;G.sph[2]+=1;botLog('🎁 +5/+3/+1 spheres');}
  else if(kind==='ess'){G.inv.ess+=50;botLog('🎁 +50 essence');}
  else if(kind==='coins'){G.inv.coins=(G.inv.coins||0)+30;botLog('🎁 +30 coins');}
  else if(kind==='heal'){G.player.hp=G.player.maxHp;G.hunger=100;botLog('💖 Healed');}
  else if(kind==='pal'){const sp=speciesOf('groveheart');const p=makeOwned(sp,15);G.team.push(p);if(G.active<0)G.active=0;botLog('🐾 +Lv15 Groveheart');}
  else if(kind==='wild'){spawnWild(true);botLog('🌿 Spawned a wild Pal');}
  else if(kind==='trainer'){G.trainerT=0;G.trainer=null;updateTrainer(0.1);botLog('⚔️ Summoned a trainer');}
  else if(kind==='alpha'){const b=G.bosses[Math.floor(Math.random()*G.bosses.length)];if(b){const nb=makeWild(speciesOf(b.id),{x:G.player.x+3*TILE,y:G.player.y});nb.isBoss=true;nb.lv=12;nb.maxHp=nb.hp*6;nb.hp=nb.maxHp;nb.atk=nb.atk*2;nb.fx=1;G.wilds.push(nb);botLog('🏆 Spawned an Alpha');}}
  else if(kind==='rift'){G.complete=false;G.rift={x:G.player.x+4*TILE,y:G.player.y};botLog('🌑 Opened the Void Rift');}
  else if(kind==='quests'){G.quests.forEach(q=>q.done=q.t);questChapterDone(3)&&maybeSpawnRift();botLog('📋 All quests complete');}
  else if(kind==='teleport'){
    const spots=[G.ruins[0]||{x:WORLD_PX/2,y:WORLD_PX/2},G.bosses[0],G.trader,{x:WORLD_PX/2+800*TILE,y:WORLD_PX/2}];
    const s=spots[Math.floor(Math.random()*spots.length)];
    if(s){G.player.x=s.x;G.player.y=s.y;botLog('📍 Teleported');}
  }
  if(!BOT.intv)saveGame();
  updateTestHud();
}
function seasonForTest(i){G.day=i*7+1;botLog('🌸 Season forced → '+SEASONS[i].n);if(!BOT.intv)saveGame();updateTestHud();}
function updateTestHud(){
  if($('testStatus'))$('testStatus').textContent=BOT.intv?simReport():($('testStatus').textContent||'idle');
}
function renderTest(){
  const box=$('testBody');box.innerHTML='';
  const intro=document.createElement('div');intro.className='row';
  intro.style.cssText='color:var(--dim);font-size:10.5px';
  intro.textContent='Pausa il mondo, lascia che un bot giochi a velocità ×N, poi ripristina (o conserva). Utile per provare feature, bilanciamento e quest senza rischiare il save.';
  box.appendChild(intro);
  const ctrl=document.createElement('div');ctrl.className='row';
  ctrl.style.cssText='justify-content:center;gap:8px';
  const start=document.createElement('button');start.className='minibtn gold';start.textContent='▶ RUN';
  const stop=document.createElement('button');stop.className='minibtn red';stop.textContent='■ STOP';
  const spd=document.createElement('select');spd.style.cssText='background:var(--panel);border:1px solid var(--line);color:var(--text);border-radius:8px;font:inherit;font-size:11px;padding:4px 6px';
  [1,2,5,10,20].forEach(v=>{const o=document.createElement('option');o.value=v;o.textContent='×'+v;if(v===BOT.speed)o.selected=true;spd.appendChild(o);});
  const keep=document.createElement('label');keep.style.cssText='display:flex;align-items:center;gap:5px;color:var(--dim);font-size:11px';
  const kc=document.createElement('input');kc.type='checkbox';kc.checked=BOT.keep;
  keep.appendChild(kc);keep.appendChild(document.createTextNode('keep results'));
  ctrl.appendChild(start);ctrl.appendChild(stop);ctrl.appendChild(spd);ctrl.appendChild(keep);
  box.appendChild(ctrl);
  start.onclick=()=>{BOT.keep=kc.checked;BOT.speed=+spd.value;if(!BOT.intv)startSim();};
  stop.onclick=()=>{BOT.keep=kc.checked;stopSim();};
  spd.onchange=()=>{BOT.speed=+spd.value;};
  kc.onchange=()=>{BOT.keep=kc.checked;};
  const status=document.createElement('div');status.className='row';status.id='testStatus';
  status.style.cssText='color:var(--cyan);font-size:11px;font-weight:700';
  status.textContent=BOT.intv?simReport():'idle — press RUN to start a parallel session';
  box.appendChild(status);
  /* esperimenti */
  const exp=document.createElement('div');exp.className='row';
  exp.style.cssText='justify-content:center;gap:6px;flex-wrap:wrap';
  const mkExp=(label,fn)=>{const b=document.createElement('button');b.className='minibtn';b.textContent=label;b.onclick=fn;exp.appendChild(b);};
  mkExp('🎁 Spheres',()=>testGive('spheres'));
  mkExp('🧪 +50 ess',()=>testGive('ess'));
  mkExp('🪙 +30 coins',()=>testGive('coins'));
  mkExp('💖 Heal',()=>testGive('heal'));
  mkExp('🐾 Lv15 Pal',()=>testGive('pal'));
  mkExp('🌿 Wild',()=>testGive('wild'));
  mkExp('⚔️ Trainer',()=>testGive('trainer'));
  mkExp('🏆 Alpha',()=>testGive('alpha'));
  mkExp('🌑 Rift',()=>testGive('rift'));
  mkExp('📋 Quest done',()=>testGive('quests'));
  mkExp('📍 Teleport',()=>testGive('teleport'));
  box.appendChild(exp);
  const seasons=document.createElement('div');seasons.className='row';
  seasons.style.cssText='justify-content:center;gap:6px';
  seasons.innerHTML='<span class="nm" style="font-size:11px">Season:</span>';
  SEASONS.forEach((s,i)=>{const b=document.createElement('button');b.className='chip';b.textContent=s.icon+s.n;b.onclick=()=>seasonForTest(i);seasons.appendChild(b);});
  box.appendChild(seasons);
  const rep=document.createElement('div');rep.className='row';rep.id='testReport';
  rep.style.cssText='color:var(--dim);font-size:11px;white-space:pre-wrap';
  rep.textContent='';
  box.appendChild(rep);
  const lg=document.createElement('div');lg.className='row';lg.id='testLog';
  lg.style.cssText='color:var(--dim);font-size:10px;white-space:pre-wrap;max-height:120px;overflow-y:auto';
  lg.textContent=BOT.log.join('\n');
  box.appendChild(lg);
}

/* ================= PROJECTILES / CAPTURE ================= */
function throwSphere(tier){
  if((G.sph[tier]||0)<1){toast('No '+SPHERE_TIERS[tier].n+' left — craft more','var(--red)');return;}
  G.sph[tier]--;
  SFX.throw();
  const a=G.player.dir;
  G.projectiles.push({x:G.player.x+Math.cos(a)*10,y:G.player.y+Math.sin(a)*10,vx:Math.cos(a)*300,vy:Math.sin(a)*300,tier,t:0});
}
function updateProjectiles(dt){
  for(let i=G.projectiles.length-1;i>=0;i--){
    const pr=G.projectiles[i];
    pr.x+=pr.vx*dt;pr.y+=pr.vy*dt;pr.t+=dt;
    if(pr.t>1.4){G.projectiles.splice(i,1);continue;}
    let hit=false;
    for(const w of G.wilds){
      if(dist(pr,w)<14){
        hit=true;
        if(pr.kind==='arrow'){
          w.hp-=dmgCalc(12+5*(G.inv.bowLv||0),'void',speciesOf(w.id).type,1,speciesOf(w.id).type2,G.weather);
          w.fx=0.35;
          if(w.hp<=0)defeatPal(w);
        }else{
          if(w.isFinal)continue; /* il boss finale si sconfigge, non si cattura */
          const ch=clamp(catchChance(w,SPHERE_TIERS[pr.tier])*diffMult('catch'),0.01,0.98);
          if(Math.random()<ch){
            const owned=makeOwned(speciesOf(w.id),w.lv);
            G.team.push(owned);
            if(G.active<0)G.active=0;
            G.dex[w.id]=(G.dex[w.id]||0)+1;
            G.seen[w.id]=true;
            G.stat.catches++;
            stylePush('catch');
            if(G.stat.catches===1)playCutscene('first_catch');
            const cbiome=speciesOf(w.id).biome;
            if(cbiome==='volcano')questEvent('catchVolcano');
            else if(cbiome==='crystal')questEvent('catchCrystal');
            G.wilds.splice(G.wilds.indexOf(w),1);
            SFX.catch();
            toast('🎉 Caught '+speciesOf(w.id).n+'! (Lv '+owned.lv+')','var(--green)');
            questEvent('catch');
          }else{SFX.fail();toast('The Pal broke free!','var(--amber)');}
        }
        break;
      }
    }
    if(hit)G.projectiles.splice(i,1);
  }
}

/* ================= COMBAT ================= */
function updateActivePal(dt){
  const ap=G.team[G.active];if(!ap)return;
  if(G.flying)return; /* in volo il Pal non combatte */
  const sp=speciesOf(ap.id);
  /* follow (saltato se stai cavalcando) */
  if(!G.riding){
    const tx=G.player.x-Math.cos(G.player.dir)*16,ty=G.player.y-Math.sin(G.player.dir)*16;
    const dx=tx-ap.x,dy=ty-ap.y,d=Math.hypot(dx,dy)||1;
    ap.x+=dx/d*ap.spd*60*dt*0.5;ap.y+=dy/d*ap.spd*60*dt*0.5;
  }
  /* find target */
  let target=null,bd=5*TILE;
  for(const w of G.wilds){const dd=dist(w,ap);if(dd<bd){bd=dd;target=w;}}
  if(target){
    const dd=dist(target,ap);
    if(dd>0.9*TILE&&!G.riding){ap.x+=((target.x-ap.x)/dd)*ap.spd*60*dt;ap.y+=((target.y-ap.y)/dd)*ap.spd*60*dt;}
    else{
      ap.cd-=dt;
      if(ap.cd<=0){
        /* skill: priorità a quelle insegnate con gli scroll, altrimenti quella di livello */
        let sk=null;
        if((ap.skills||[]).length&&Math.random()<0.5){
          const nm=ap.skills[Math.floor(Math.random()*ap.skills.length)];
          sk=sp.skills.find(s=>s[0]===nm)||sp.skills[Math.min(ap.lv>=8?1:0,sp.skills.length-1)];
        }else sk=sp.skills[Math.min(ap.lv>=8?1:0,sp.skills.length-1)];
        const dmg=Math.round(dmgCalc(sk[1],sp.type,speciesOf(target.id).type,1,speciesOf(target.id).type2,G.weather)*eclipseMult()*diffMult('dmgOut'));
        target.hp-=dmg;target.fx=0.3;ap.cd=sk[2];
        G.stat.style.fight=(G.stat.style.fight||0)+1;
        if(ap.traitVamp)ap.hp=Math.min(ap.maxHp,ap.hp+2);
        if(target.hp<=0)defeatPal(target);
      }
    }
  }
  ap.hp=Math.min(ap.maxHp,ap.hp+2*dt);
}
function defeatPal(w){
  G.wilds.splice(G.wilds.indexOf(w),1);
  if(w.isDuel){
    const tr=G.duel&&G.duel.trainer;
    G.duel=null;
    if(tr){
      tr.idx++;
      if(tr.idx<tr.team.length){
        tr.nextT=1.2;
        toast('🏆 '+tr.name+' calls another Pal!','var(--gold)');
        SFX.catch();
        return;
      }
      tr.defeated=true;tr.rematchT=15;tr.t=25;
      const ess=6+tr.team.length*3,coins=12+tr.team.length*6;
      G.inv.ess+=ess;G.inv.coins=(G.inv.coins||0)+coins;
      const ap=G.team[G.active];
      if(ap)addXp(ap,30);
      toast('🏆 Defeated '+tr.name+'! +'+ess+' essence · +'+coins+' coins','var(--gold)');
      SFX.evolve();
      G.stat.trainers++;
      questEvent('trainer');
      if(tr.name==='Ace Avery')toast('🗡 Ace Avery: '+AVERY_LINES[0],'var(--dim)');
      return;
      return;
    }
    G.inv.ess+=4;G.inv.coins=(G.inv.coins||0)+10;
    toast('🏆 Duel won! +4 essence · +10 coins','var(--gold)');
    SFX.catch();
    return;
  }
  if(w.isFinal){gameComplete();return;}
  G.inv.ess+=w.isBoss?15:(w.echo?7:2);
  if(w.echo)toast('🌒 Echo dissolved: +7 essence','var(--violet)');
  if(w.isBoss){G.stat.alphas++;if(G.stat.alphas===1)playCutscene('alpha_first');toast('🏆 Alpha defeated! +15 essence','var(--gold)');questEvent('boss');}
  else questEvent('defeat');
  const ap=G.team[G.active];
  if(ap)addXp(ap,w.isBoss?60:10+w.lv*3);
}

/* ================= SOUND (WebAudio) ================= */
const SFX={
  ctx:null,enabled:false,ambientTimer:0,
  ensure(){
    if(this.ctx)return true;
    try{this.ctx=new (window.AudioContext||window.webkitAudioContext)();}catch(e){return false;}
    if(this.ctx.state==='suspended')this.ctx.resume();
    return true;
  },
  tone(f,dur,type,vol,delay,slide){
    if(SILENT||!this.ensure()||!this.enabled)return;
    const t=this.ctx.currentTime+(delay||0);
    const o=this.ctx.createOscillator(),g=this.ctx.createGain();
    o.type=type||'sine';o.frequency.value=f;
    if(slide)o.frequency.exponentialRampToValueAtTime(slide,t+dur);
    g.gain.setValueAtTime(0.0001,t);
    g.gain.exponentialRampToValueAtTime(vol||0.07,t+0.02);
    g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
    o.connect(g);g.connect(this.ctx.destination);
    o.start(t);o.stop(t+dur+0.05);
  },
  catch(){[523,659,784].forEach((f,i)=>this.tone(f,.16,'triangle',.09,i*.1));},
  fail(){this.tone(240,.2,'sawtooth',.06);this.tone(180,.3,'sawtooth',.05,.18);},
  level(){this.tone(392,.12,'triangle',.08);this.tone(523,.16,'triangle',.08,.12);},
  evolve(){[523,659,784,1047].forEach((f,i)=>this.tone(f,.22,'triangle',.09,i*.1));},
  quest(){this.tone(880,.18,'sine',.07);this.tone(1108,.3,'sine',.07,.16);},
  throw(){this.tone(500,.1,'sine',.05,0,900);},
  ride(){this.tone(330,.2,'triangle',.07);this.tone(440,.25,'triangle',.07,.15);},
  chirp(seed){
    if(!this.ensure()||!this.enabled)return;
    const f=280+(seed%30)*16;
    this.tone(f,.1,'sine',.028);
  },
  ambientTick(dt){
    if(!this.enabled)return;
    this.ambientTimer-=dt;
    if(this.ambientTimer>0)return;
    this.ambientTimer=1.1;
    if(G.weather==='rain')this.tone(90,0.9,'sine',0.02,0,70);
    else if(G.weather==='sandstorm')this.tone(55,1.1,'sawtooth',0.016,0,45);
    else if(G.weather==='aurora')this.tone(1200,1.2,'sine',0.012,0,1400);
  }
};
function toggleSound(){
  G.muted=!G.muted;
  SFX.enabled=!G.muted;
  if(!G.muted){SFX.ensure();if(SFX.ctx&&SFX.ctx.state==='suspended')SFX.ctx.resume();}
  $('btnSound').textContent=G.muted?'🔇':'🔊';
  $('btnSound').classList.toggle('on',!G.muted);
}

/* ================= RIDING ================= */
function toggleRide(){
  const ap=G.team[G.active];
  if(!ap){toast('No active Pal to ride','var(--red)');return;}
  const sp=speciesOf(ap.id);
  if(G.riding){
    G.riding=false;G.flying=false;
    $('btnRide').classList.remove('on');
    $('btnRide').textContent='🐎 Ride';
    toast('🐎 Dismounted','var(--cyan)');
  }else{
    G.riding=true;
    G.flying=!!sp.fly;
    $('btnRide').classList.add('on');
    $('btnRide').textContent=G.flying?'🐉 Descend':'🐎 Dismount';
    toast(G.flying?'🐉 Riding '+sp.n+' — you take flight!':'🐎 Riding '+sp.n+'!','var(--green)');
    if(G.flying&&!G.memories.flight){G.stat.flights=(G.stat.flights||0)+1;playCutscene('flight');}
    SFX.ride();
  }
}

/* ================= FARMING ================= */
function plantModeToggle(){
  if((G.inv.seeds||0)<1){toast('No seeds — craft Berry Seeds first','var(--red)');return;}
  G.plantMode=true;G.buildMode=null;closePanels();
  toast('🌱 Tap grass to plant a seed','var(--green)');
}
function tryPlant(x,y){
  if(G.inv.seeds<1)return;
  const tx=Math.floor(x/TILE),ty=Math.floor(y/TILE);
  if(biomeAt(tx,ty)!=='grass'||tileObj(tx,ty)){toast('🌱 Seeds need open grass','var(--amber)');return;}
  G.farms.push({x:tx*TILE+8,y:ty*TILE+8,t:0});
  G.inv.seeds--;
  G.plantMode=false;
  toast('🌱 Seed planted','var(--green)');
  saveGame();
}
function updateFarms(dt){
  const mult=SEASONS[curSeason()].gather.berry||1;
  for(let i=G.farms.length-1;i>=0;i--){
    const f=G.farms[i];
    f.t+=dt;
    /* raccolta con E vicino */
    if(f.t>45&&dist(f,G.player)<1.8*TILE){
      G.inv.berry+=2*mult;
      G.farms.splice(i,1);
      toast('🫐 Harvested! +'+(2*mult)+' berries','var(--green)');
      saveGame();
    }
  }
}

/* ================= FISHING ================= */
const SEA_POOL=['finling','jellyvolt','abyssoul'];
function nearWater(){
  const tx=Math.floor(G.player.x/TILE),ty=Math.floor(G.player.y/TILE);
  for(const[ox,oy]of[[0,0],[1,0],[-1,0],[0,1],[0,-1]]){
    if(biomeAt(tx+ox,ty+oy)==='ocean')return true;
  }
  return false;
}
function startFishing(){
  if(!G.inv.rod){toast('Need a 🎣 Fishing Rod — craft one','var(--red)');return;}
  if(G.fishing)return;
  if(!nearWater()){toast('Cast from a shore — stand next to the sea','var(--amber)');return;}
  G.fishing={t:0,biteT:(2.2+Math.random()*2.6)*(G.inv.lure?0.55:1),bitten:false,win:0};
  toast('🎣 Casting…','var(--cyan)');
  SFX.throw();
}
function updateFishing(dt){
  const f=G.fishing;if(!f)return;
  f.t+=dt;
  if(!f.bitten&&f.t>=f.biteT){
    f.bitten=true;f.win=1.4;
    toast('🪝 A bite! Press E to reel in!','var(--gold)');
    SFX.quest();
  }
  if(f.bitten){
    f.win-=dt;
    if(f.win<=0){G.fishing=null;toast('…it got away.','var(--dim)');}
  }
  if(f.t>15){G.fishing=null;toast('🎣 Nothing biting — reel in.','var(--dim)');}
}
function reelIn(){
  const f=G.fishing;if(!f)return;
  if(!f.bitten){G.fishing=null;toast('🎣 Reeled in too soon.','var(--dim)');return;}
  G.fishing=null;
  const sp=speciesOf(SEA_POOL[Math.floor(Math.random()*SEA_POOL.length)]);
  const owned=makeOwned(sp,1+Math.floor(Math.random()*4));
  G.team.push(owned);
  if(G.active<0)G.active=0;
  G.dex[sp.id]=(G.dex[sp.id]||0)+1;G.seen[sp.id]=true;
  G.stat.catches++;
  G.stat.fished=(G.stat.fished||0)+1;
  stylePush('catch');
  questEvent('catchSea');
  if(G.stat.fished===1)playCutscene('fishing');
  SFX.catch();
  toast('🎣 Caught a '+sp.n+'! (Lv '+owned.lv+')','var(--green)');
  saveGame();
}
/* ================= SKILL SCROLLS ================= */
function teachSkill(idx){
  const p=G.team[idx];
  if(!p)return;
  if((G.inv.scroll||0)<1){toast('Need a Skill Scroll','var(--red)');return;}
  const sp=speciesOf(p.id);
  const known=(p.skills||[]);
  const pool=sp.skills.filter(s=>!known.includes(s[0]));
  if(!pool.length){toast('📜 Already knows every skill','var(--amber)');return;}
  const sk=pool[Math.floor(Math.random()*pool.length)];
  known.push(sk[0]);
  p.skills=known;
  G.inv.scroll--;
  toast('📜 '+sp.n+' learned '+sk[0]+'!','var(--violet)');
  saveGame();
  renderPanel('pTeam');
}

/* ================= COINS & TRADER ================= */
const SELL_PRICE={grass:3,wood:2,berry:2,stone:2,ess:2}; /* quantità → 1 coin */
const BUY_ITEMS=[
 {n:'Sphere',icon:'🔮',c:3,give:()=>addSphere(0,1)},
 {n:'Great Sphere',icon:'🔵',c:6,give:()=>addSphere(1,1)},
 {n:'Ultra Sphere',icon:'💗',c:12,give:()=>addSphere(2,1)},
 {n:'Potion',icon:'🧪',c:5,give:()=>G.inv.potion=(G.inv.potion||0)+1},
 {n:'Berry Seeds',icon:'🌱',c:4,give:()=>G.inv.seeds=(G.inv.seeds||0)+1},
 {n:'Skill Scroll',icon:'📜',c:10,give:()=>G.inv.scroll=(G.inv.scroll||0)+1},
 {n:'Sword',icon:'⚔️',c:15,give:()=>{G.inv.sword=1;G.equip='sword';}},
 {n:'Bow',icon:'🏹',c:12,give:()=>{G.inv.bow=1;G.equip='bow';}}
];
function tradeSell(key){
  const need=SELL_PRICE[key];
  if((G.inv[key]||0)<need){toast('Not enough '+key+' to sell','var(--amber)');return;}
  G.inv[key]-=need;G.inv.coins=(G.inv.coins||0)+1;
  renderPanel('pTrade');toast('🪙 +1 coin','var(--gold)');
}
function tradeBuy(idx){
  const it=BUY_ITEMS[idx];
  if((G.inv.coins||0)<it.c){toast('Not enough coins','var(--red)');return;}
  G.inv.coins-=it.c;it.give();
  renderPanel('pTrade');toast('🪙 Bought '+it.n,'var(--green)');
}
function updateTrader(dt){
  G.traderT-=dt;
  if(G.trader){
    if(G.traderT<=-35){G.trader=null;G.traderT=0;}
  }else if(G.traderT<=0){
    G.traderT=60;
    const a=Math.random()*6.28,d=5+Math.random()*4;
    G.trader={x:G.player.x+Math.cos(a)*d*TILE,y:G.player.y+Math.sin(a)*d*TILE,t:35};
  }
}
/* ================= RANCH / BREEDING ================= */
function breedAtRanch(b){
  if(b.b&&b.b.ready){
    const sp=speciesOf(b.b.species);
    const lv=Math.max(1,Math.round((b.b.p1.lv+b.b.p2.lv)/2)-1);
    const child=makeOwned(sp,lv);
    if(b.b.trait&&Math.random()<0.5)child.trait=b.b.trait;
    if(b.b.col&&Math.random()<0.5)child.spliceCol=b.b.col;
    G.team.push(child);
    b.b=null;
    SFX.catch();
    G.stat.eggs++;
    toast('🥚 Hatched a '+sp.n+' (Lv '+lv+')!','var(--gold)');
    saveGame();
    return;
  }
  if(b.b){toast('🥚 The egg is growing…','var(--cyan)');return;}
  for(let i=0;i<G.team.length;i++)for(let j=i+1;j<G.team.length;j++){
    if(G.team[i].id===G.team[j].id){
      b.b={species:G.team[i].id,t:0,ready:false,p1:G.team[i],p2:G.team[j],trait:G.team[i].trait||G.team[j].trait,col:G.team[i].spliceCol||G.team[j].spliceCol};
      toast('🥚 '+speciesOf(G.team[i].id).n+' pair is breeding…','var(--green)');
      saveGame();
      return;
    }
  }
  toast('Need 2 Pals of the same species','var(--amber)');
}
function updateRanches(dt){
  for(const b of G.buildings){
    if(b.id==='ranch'&&b.b&&!b.b.ready){
      b.b.t+=dt;
      if(b.b.t>30){b.b.ready=true;toast('🥚 An egg is ready!','var(--gold)');SFX.quest();}
    }
  }
}
/* ================= RUINS / DUNGEON ================= */
function initRuins(){
  G.ruins=[];
  const rnd=mulberry32(SEED^0x7777);
  const spots=['grass','desert','snow','volcano','crystal'];
  spots.forEach((bm,i)=>{
    for(let t=0;t<300;t++){
      const tx=clamp(Math.floor(160+i*420+rnd()*460),90,WORLD_T-90);
      const ty=clamp(Math.floor(220+rnd()*1100),90,WORLD_T-90);
      if(biomeAt(tx,ty)===bm&&!solidAt(tx*TILE,ty*TILE)){
        G.ruins.push({x:tx*TILE+8,y:ty*TILE+8});
        break;
      }
    }
  });
}
function enterDungeon(r){
  if(G.dungeon)return;
  G.dungeon={x:r.x,y:r.y,R:13*TILE,floor:1,left:5,spawnT:0,traps:[],key:false,vault:null,secret:null,secretFound:false};
  G.wilds=G.wilds.filter(w=>!w.dungeon);
  spawnDungeonWave();
  toast('🏛 Entered a Ruin — Floor 1','var(--gold)');
}
function dungeonPool(){return anytimePool(SPECIES.filter(s=>s.rar>=1&&!s.evTo));}
/* trappole: posizioni deterministiche pseudo-random per floor, lontane dall'ingresso */
function dungeonTraps(d){
  const arr=[];
  const n=2+d.floor; /* floor 2→4, floor 3→5 */
  const rnd=mulberry32(hashSeed('trap'+Math.floor(d.x)+Math.floor(d.y)+d.floor));
  for(let i=0;i<n;i++){
    for(let t=0;t<30;t++){
      const a=rnd()*6.28,rr=(3+rnd()*7)*TILE;
      const x=d.x+Math.cos(a)*rr,y=d.y+Math.sin(a)*rr;
      if(dist({x,y},G.player)>2.4*TILE&&!circleHitsSolid(x,y,5)){
        arr.push({x,y,t:0});break;
      }
    }
  }
  return arr;
}
function spawnDungeonWave(){
  const d=G.dungeon;if(!d)return;
  const pool=dungeonPool();
  for(let i=0;i<d.left;i++){
    const a=Math.random()*6.28,rr=Math.random()*8*TILE;
    const sp=pool[Math.floor(Math.random()*pool.length)];
    G.seen[sp.id]=true;
    const w=makeWild(sp,{x:d.x+Math.cos(a)*rr,y:d.y+Math.sin(a)*rr});
    w.lv=4+d.floor*3+Math.floor(Math.random()*2);scalePal(w,w.lv);
    w.dungeon=true;
    G.wilds.push(w);
  }
}
function dungeonClearReward(key){
  G.inv.ess+=key?12:8;G.inv.coins=(G.inv.coins||0)+(key?35:20);addSphere(1,1);
  if(key){G.inv.scroll=(G.inv.scroll||0)+1;addSphere(2,1);}
  toast(key?'🏆 Ruin cleared! 🔑 Vault opened: +12 essence · +35 coins · scroll + Ultra Sphere':'🏆 Ruin cleared! +8 essence · +20 coins','var(--gold)');
  SFX.evolve();
  questEvent('ruin');
  G.wilds=G.wilds.filter(w=>!w.dungeon);
  G.dungeon=null;saveGame();
}
function updateDungeon(dt){
  const d=G.dungeon;if(!d)return;
  G.player.x=clamp(G.player.x,d.x-d.R,d.x+d.R);
  G.player.y=clamp(G.player.y,d.y-d.R,d.y+d.R);
  d.spawnT-=dt;
  /* trappole: ricarica + danno */
  for(const tr of d.traps){
    if(tr.t>0)tr.t-=dt;
    else if(dist(tr,G.player)<0.85*TILE){
      G.player.hp-=10;tr.t=3;
      G.player.hp=Math.max(0,G.player.hp);
      toast('⚠️ Spike trap! -10 HP','var(--red)');
      SFX.quest();
      if(G.player.hp<=0)faint();
    }
  }
  /* stanza segreta: bagliore nascosto → tesoro */
  if(d.secret&&!d.secretFound&&dist(d.secret,G.player)<1.1*TILE){
    d.secretFound=true;
    G.inv.ess+=6;G.inv.coins=(G.inv.coins||0)+10;G.inv.scroll=(G.inv.scroll||0)+1;
    toast('✨ Secret room! +6 essence · +10 coins · scroll','var(--gold)');
    SFX.catch();
  }
  /* volta finale: entraci per l'estrazione */
  if(d.vault&&dist(d.vault,G.player)<1.1*TILE){
    dungeonClearReward(true);
    return;
  }
  const remaining=G.wilds.filter(w=>w.dungeon).length;
  if(remaining===0&&d.spawnT<=0){
    if(d.floor<2){
      d.floor++;d.left=5+d.floor;d.spawnT=1;
      spawnDungeonWave();
      toast('🏛 Floor '+d.floor,'var(--gold)');
      SFX.level();
    }else if(d.floor===2){
      d.floor=3;d.left=5+d.floor;d.spawnT=1;
      d.traps=dungeonTraps(d);
      /* chiave + stanza segreta sul floor 3 */
      d.key=true;
      d.secret={x:d.x,y:d.y};
      for(let t=0;t<40;t++){
        const a=Math.random()*6.28,rr=(3+Math.random()*7)*TILE;
        d.secret={x:d.x+Math.cos(a)*rr,y:d.y+Math.sin(a)*rr};
        if(!circleHitsSolid(d.secret.x,d.secret.y,5)&&dist(d.secret,G.player)>2*TILE)break;
      }
      spawnDungeonWave();
      toast('🔑 Floor 3 — Ruin Key found! Vault + secret shimmer ahead','var(--gold)');
      SFX.level();
    }else{
      /* floor 3 pulito: con chiave → volta (una sola volta); senza → ricompensa base */
      if(d.key&&!d.vault){
        let vx=d.x,vy=d.y;
        for(let t=0;t<40;t++){
          const a=Math.random()*6.28,rr=(3+Math.random()*7)*TILE;
          vx=d.x+Math.cos(a)*rr;vy=d.y+Math.sin(a)*rr;
          if(!circleHitsSolid(vx,vy,5)&&dist({x:vx,y:vy},G.player)>2.5*TILE)break;
        }
        d.vault={x:vx,y:vy};
        toast('🏛 Floor cleared! The VAULT shimmered open — walk into it','var(--gold)');
      }else if(!d.key)dungeonClearReward(false);
    }
  }
}
/* ================= TOWER OF TRIALS ================= */
function enterTower(){
  if(G.tower||G.dungeon)return;
  G.tower={x:G.player.x,y:G.player.y,R:12*TILE,floor:1,left:4,spawnT:0};
  G.wilds=G.wilds.filter(w=>!w.tower);
  spawnTowerWave();
  toast('🗼 Tower of Trials — Floor 1','var(--gold)');
}
function towerPool(){return anytimePool(SPECIES.filter(s=>!s.evTo&&s.biome!=='ocean'));}
function spawnTowerWave(){
  const d=G.tower;if(!d)return;
  const pool=towerPool();
  const n=d.floor===10?1:3+Math.min(6,d.floor);
  for(let i=0;i<n;i++){
    const a=Math.random()*6.28,rr=Math.random()*7*TILE;
    const sp=pool[Math.floor(Math.random()*pool.length)];
    G.seen[sp.id]=true;
    const w=makeWild(sp,{x:d.x+Math.cos(a)*rr,y:d.y+Math.sin(a)*rr});
    w.lv=5+d.floor*2+Math.floor(Math.random()*2);scalePal(w,w.lv);
    w.tower=true;
    if(d.floor===10){
      w.isChamp=true;w.lv=25;scalePal(w,25);
      w.maxHp=w.hp*5;w.hp=w.maxHp;w.atk=w.atk*2;w.spd=w.spd*0.95;w.fx=1;
    }
    G.wilds.push(w);
  }
}
function updateTower(dt){
  const d=G.tower;if(!d)return;
  G.player.x=clamp(G.player.x,d.x-d.R,d.x+d.R);
  G.player.y=clamp(G.player.y,d.y-d.R,d.y+d.R);
  d.spawnT-=dt;
  const remaining=G.wilds.filter(w=>w.tower).length;
  if(remaining===0&&d.spawnT<=0){
    if(d.floor<10){
      const ess=3+d.floor*2;
      G.inv.ess+=ess;
      const ap=G.team[G.active];
      if(ap)ap.hp=Math.min(ap.maxHp,ap.hp+ap.maxHp*0.35);
      toast('🗼 Floor '+d.floor+' cleared! +'+ess+' essence','var(--gold)');
      d.floor++;d.left=4+d.floor;d.spawnT=1;
      spawnTowerWave();
      SFX.level();
    }else{
      G.inv.ess+=50;G.inv.coins=(G.inv.coins||0)+40;addSphere(2,3);G.inv.scroll=(G.inv.scroll||0)+1;
      toast('🏆 TOWER CONQUERED! +50 essence · +40 coins · 3 Ultra Spheres','var(--gold)');
      SFX.evolve();
      G.stat.towerWins=(G.stat.towerWins||0)+1;
      playCutscene('tower_champion');
      questEvent('tower');
      G.wilds=G.wilds.filter(w=>!w.tower);
      G.tower=null;saveGame();
    }
  }
}
/* ================= ARENA DUEL ================= */
function startDuel(){
  if(G.duel)return;
  const ap=G.team[G.active];
  if(!ap){toast('Need an active Pal to duel','var(--red)');return;}
  const pool=anytimePool(SPECIES.filter(s=>s.rar<=1));
  const sp=pool[Math.floor(Math.random()*pool.length)];
  const e=makeWild(sp,{x:G.player.x+3*TILE,y:G.player.y});
  e.lv=Math.max(3,ap.lv-1+Math.floor(Math.random()*3));scalePal(e,e.lv);
  e.hp=e.maxHp;e.isDuel=true;
  G.seen[sp.id]=true;
  G.duel={e};
  G.wilds.push(e);
  toast('⚔️ Duel! '+sp.n+' Lv'+e.lv+' vs '+speciesOf(ap.id).n,'var(--red)');
  SFX.ride();
}
/* ================= WANDERING TRAINERS ================= */
const TRAINER_NAMES=['Ace Avery','Ranger Rio','Profe. Fern','Hunter Kai','Dr. Nova','Kid Comet','Mage Mira','Guard Otto'];
const TRAINER_COLS=['#ff5f6d','#ff9e3f','#52ff9e','#3ee6ff','#ff5f9e','#ffd166'];
function makeTrainerTeam(lv){
  const pool=anytimePool(SPECIES.filter(s=>!s.evTo));
  const size=G.team.length>=3?2:1;
  const team=[];
  for(let i=0;i<size;i++){
    const sp=pool[Math.floor(Math.random()*pool.length)];
    const e=makeWild(sp,{x:0,y:0});
    e.lv=Math.max(3,lv+i+1);scalePal(e,e.lv);e.hp=e.maxHp;
    team.push(e);
  }
  return team;
}
function updateTrainer(dt){
  G.trainerT-=dt;
  if(G.trainer){
    if(G.trainer.rematchT>0)G.trainer.rematchT-=dt;
    const dueling=G.duel&&G.duel.trainer===G.trainer;
    if(!dueling)G.trainer.t-=dt;
    if(G.trainer.t<=0){G.trainer=null;G.trainerT=0;}
  }else if(G.trainerT<=0){
    G.trainerT=55;
    const a=Math.random()*6.28,d=4+Math.random()*4;
    const lv=G.team.length?Math.max(...G.team.map(p=>p.lv)):2;
    G.trainer={x:G.player.x+Math.cos(a)*d*TILE,y:G.player.y+Math.sin(a)*d*TILE,t:32,rematchT:0,defeated:false,name:TRAINER_NAMES[Math.floor(Math.random()*TRAINER_NAMES.length)],col:TRAINER_COLS[Math.floor(Math.random()*TRAINER_COLS.length)],team:makeTrainerTeam(lv),idx:0};
    toast('⚔️ Trainer '+G.trainer.name+' is nearby — battle for coins!','var(--gold)');
  }
}
function challengeTrainer(){
  const tr=G.trainer;
  if(!tr)return;
  if(tr.defeated&&tr.rematchT>0){toast(tr.name+' needs a breather — rematch in '+Math.ceil(tr.rematchT)+'s','var(--amber)');return;}
  if(G.duel)return;
  const ap=G.team[G.active];
  if(!ap){toast('Send out a Pal first (📦 Team)','var(--red)');return;}
  const e=tr.team[tr.idx];
  e.x=G.player.x+3*TILE;e.y=G.player.y;e.isDuel=true;e.fromTrainer=true;e.hp=e.maxHp;
  G.seen[e.id]=true;
  G.duel={e,trainer:tr};
  G.wilds.push(e);
  toast('⚔️ '+tr.name+' sends '+speciesOf(e.id).n+' Lv'+e.lv+'!','var(--red)');
  SFX.ride();
}
function updateTrainerDuel(dt){
  const tr=G.trainer;
  if(tr&&tr.nextT!==undefined){
    tr.nextT-=dt;
    if(tr.nextT<=0){
      tr.nextT=undefined;
      const e=tr.team[tr.idx];
      if(e){
        e.x=G.player.x+3*TILE;e.y=G.player.y;e.isDuel=true;e.fromTrainer=true;e.hp=e.maxHp;
        G.seen[e.id]=true;
        G.duel={e,trainer:tr};
        G.wilds.push(e);
        toast('⚔️ '+tr.name+' sends '+speciesOf(e.id).n+' Lv'+e.lv+'!','var(--red)');
        SFX.ride();
      }
    }
  }
}
/* ================= ELDER MIRA (narratrice) ================= */
const MIRA_LINES=[
 '"I knew a girl who drew creatures in the margins of her schoolbooks. She would have loved the volcano."',
 '"The rift was never made of hate. It was made of a winter that forgot how to end."',
 '"Every aurora is her sky, still painting itself, night after night."',
 '"The Sovereign is not evil. It is grief with claws, and it only wants what it lost."',
 '"She asked me once: if you catch a dream, does it stay caught? I think it does — that\'s why you\'re here."',
 '"The crystals hum her favourite song when the moon is out. Listen — if you are quiet enough, you can hear it."',
 '"I water her grave every spring. Not for her — for the flowers. That is what love is, dear: watering flowers for people who can no longer see them."',
 '"She asked me once if you can catch a dream. I said yes — if you are patient, and you do not squeeze."',
 '"The winter took her, but it never took her drawings. The dead keep what they loved. That is all we ever really are."'
];
const BRAM_LINES=[
 'I forged my guilt into iron, boy. That is all a smith can do — turn what hurts into something that holds.',
 'Every blade I sharpen is a promise I failed to keep. Keep yours.',
 'She would have liked this one. Small. Sharp. Honest.'
];
const AVERY_LINES=[
 'I knew a girl who drew creatures. I became a trainer to find her. I am still looking.',
 'She beat me at every game. This one, I win.'
];
function updateMira(dt){
  G.miraT-=dt;
  if(G.mira){
    if(G.mira.cd>0)G.mira.cd-=dt;
    G.mira.t-=dt;
    if(G.mira.t<=0){G.mira=null;G.miraT=0;}
  }else if(G.miraT<=0){
    G.miraT=70;
    const a=Math.random()*6.28,d=4+Math.random()*4;
    G.mira={x:G.player.x+Math.cos(a)*d*TILE,y:G.player.y+Math.sin(a)*d*TILE,t:30,cd:0};
  }
}
function talkMira(){
  if(!G.mira)return;
  if(G.mira.cd>0){toast('🌙 Elder Mira is lost in thought…','var(--dim)');return;}
  const line=MIRA_LINES[G.miraLine%MIRA_LINES.length];
  G.miraLine++;
  G.inv.ess+=2;
  G.mira.cd=35;
  toast('🌙 Elder Mira: '+line+'  (+2 essence)','var(--violet)');
  SFX.quest();
  questEvent('talk');
  saveGame();
}
/* ================= BLACKSMITH BRAM (potenziamenti) ================= */
const UPGRADES=[
 {n:'Sharpen Sword',icon:'⚔️',c:15,desc:'+8 sword damage · permanent',apply:()=>{G.inv.swordLv=(G.inv.swordLv||0)+1;}},
 {n:'Bowstring',icon:'🏹',c:10,desc:'+5 arrow damage · permanent',apply:()=>{G.inv.bowLv=(G.inv.bowLv||0)+1;}},
 {n:'Iron Plating',icon:'🛡️',c:20,desc:'+25 max HP · permanent',apply:()=>{G.player.maxHp+=25;G.player.hp=G.player.maxHp;}}
];
function updateBram(dt){
  G.bramT-=dt;
  if(G.bram){
    G.bram.t-=dt;
    if(G.bram.t<=0){G.bram=null;G.bramT=0;}
  }else if(G.bramT<=0){
    G.bramT=95;
    const a=Math.random()*6.28,d=4+Math.random()*4;
    G.bram={x:G.player.x+Math.cos(a)*d*TILE,y:G.player.y+Math.sin(a)*d*TILE,t:32};
  }
}
function buyUpgrade(idx){
  const u=UPGRADES[idx];
  if((G.inv.coins||0)<u.c){toast('Not enough coins — need '+u.c+' 🪙','var(--red)');return false;}
  G.inv.coins-=u.c;
  u.apply();
  if(G.stat.buys===undefined)G.stat.buys=0;
  G.stat.buys++;
  toast('🔨 '+u.icon+' '+u.n+' — '+u.desc+(G.stat.buys===1?('  ('+BRAM_LINES[Math.floor(Math.random()*BRAM_LINES.length)]+')'):''),'var(--green)');
  SFX.level();
  saveGame();
  renderSmith();
  return true;
}
function renderSmith(){
  const box=$('smithList');box.innerHTML='';
  $('smithCoins').textContent=(G.inv.coins||0)+' coins';
  UPGRADES.forEach((u,i)=>{
    const div=document.createElement('div');div.className='row';
    div.innerHTML='<span>'+u.icon+'</span><span class="nm">'+u.n+'</span><span class="st">'+u.desc+' · '+u.c+' 🪙</span>'+
      '<button class="minibtn gold" data-u="'+i+'">Buy</button>';
    box.appendChild(div);
    div.querySelector('[data-u]').onclick=()=>buyUpgrade(i);
  });
}

/* ================= FINAL BOSS — VOID SOVEREIGN ================= */
/* Il capitolo 4 delle quest sblocca una Void Rift: interagisci per evocare
   il boss finale. È un colosso con minion + aura; sconfiggendolo si vince. */
function maybeSpawnRift(){
  if(G.complete||G.rift)return;
  for(let t=0;t<120;t++){
    const a=Math.random()*6.28,d=6+Math.random()*8;
    const x=G.player.x+Math.cos(a)*d*TILE,y=G.player.y+Math.sin(a)*d*TILE;
    const tx=Math.floor(x/TILE),ty=Math.floor(y/TILE);
    if(biomeAt(tx,ty)==='ocean'||solidAt(x,y))continue;
    G.rift={x,y};
    toast('🌑 A VOID RIFT tore open nearby!','var(--violet)');
    SFX.evolve();
    return;
  }
}
function spawnFinalBoss(){
  if(!G.rift)return;
  const lv=G.team.length?Math.max(...G.team.map(p=>p.lv)):8;
  const sp=speciesOf('nightwing'); /* forma base; lo gonfiamo oltre ogni limite */
  const b=makeWild(sp,{x:G.rift.x+2*TILE,y:G.rift.y});
  b.isBoss=true;b.isFinal=true;
  b.lv=Math.max(15,lv+4);
  b.maxHp=Math.round(1600*(1+0.08*Math.max(0,b.lv-15)));
  b.hp=b.maxHp;
  b.atk=Math.round(34*(1+0.08*Math.max(0,b.lv-15)));
  b.spd=1.15;
  b.fx=1;
  b.minionT=0;b.auraT=0;
  b.skill=[['Eclipse Dive',30,2.0],['Void Pulse',22,1.2]];
  G.seen['nightwing']=true;G.seen['duskbat']=true;G.seen['sparklet']=true;
  G.wilds.push(b);
  G.rift=null;
  sovereignSays('So. You came back. I kept the light on for you.');
  toast('🌑 THE VOID SOVEREIGN AWAKENS!','var(--red)');
  SFX.evolve();SFX.evolve();
}
function updateFinalBoss(dt){
  for(const w of G.wilds){
    if(!w.isFinal)continue;
    w.minionT-=dt;w.auraT-=dt;
    /* voce del Sovereign alle soglie di HP */
    if(!w.voice75&&w.hp/w.maxHp<0.75){w.voice75=true;sovereignSays('I remember that kitchen. I remember every word you said that night.');}
    if(!w.voice50&&w.hp/w.maxHp<0.5){w.voice50=true;sovereignSays('You wished the world to stop, so it did — for her. Was it worth it?');}
    if(!w.voice30&&w.hp/w.maxHp<0.3){w.voice30=true;sovereignSays('Look at me. I am the part of you you buried. You cannot bury me — you can only forgive me.');}
    /* aura: danno a distanza ravvicinata */
    if(w.auraT<=0){
      w.auraT=2.5;
      if(dist(w,G.player)<5*TILE){
        G.player.hp-=4;
        if(G.player.hp<=0)faint();
        w.fx=1;
      }
    }
    /* minion sotto il 70% HP, ogni 12s */
    if(w.minionT<=0&&w.hp/w.maxHp<0.7){
      w.minionT=12;
      const pool=['duskbat','sparklet','voltmouse'];
      for(let i=0;i<2;i++){
        const sp=speciesOf(pool[Math.floor(Math.random()*pool.length)]);
        const m=makeWild(sp,{x:w.x+Math.cos(i*3.14)*2.4*TILE,y:w.y+Math.sin(i*3.14)*2.4*TILE});
        m.lv=Math.max(8,Math.round(w.lv*0.7));scalePal(m,m.lv);
        m.isMinion=true;m.fx=0.5;
        G.seen[sp.id]=true;
        G.wilds.push(m);
      }
      toast('👾 The Sovereign summons minions!','var(--amber)');
    }
  }
}
function gameComplete(){
  if(G.speedrun&&G.speedrun.on){
    const sec=Math.floor(G.speedrun.elapsed);
    let best=1e12;try{best=parseInt(localStorage.getItem('pocketwild_speedrun_best'))||1e12;}catch(e){}
    if(sec<best){try{localStorage.setItem('pocketwild_speedrun_best',String(sec));}catch(e){}}
    G.speedrunBest=sec;
  }
  G.complete=true;
  G.inv.ess+=30;G.inv.coins=(G.inv.coins||0)+50;addSphere(2,3);G.inv.scroll=(G.inv.scroll||0)+1;
  G.wilds=G.wilds.filter(w=>!w.isMinion);
  const ap=G.team[G.active];
  if(ap)addXp(ap,80);
  saveGame();
  questEvent('finalboss');
  playCutscene('redemption',showCompleteOverlay);
}
function showCompleteOverlay(){
  const days=G.day,caught=Object.keys(G.dex).length,teamN=G.team.length;
  $('completeStats').innerHTML='<b style="color:var(--gold)">Days survived:</b> '+days+
    ' &nbsp;·&nbsp; <b style="color:var(--gold)">Species caught:</b> '+caught+'/'+SPECIES.length+
    ' &nbsp;·&nbsp; <b style="color:var(--gold)">Team size:</b> '+teamN+
    '<br><span style="color:var(--dim)">+30 essence · +50 coins · 3 Ultra Spheres · Skill Scroll</span>'+
    (G.speedrunBest!==undefined?'<br><b style="color:var(--gold)">⏱️ Speedrun time: '+Math.floor(G.speedrunBest/60)+':'+('0'+(G.speedrunBest%60)).slice(-2)+'</b>':'');
  try{const best=parseInt(localStorage.getItem('pocketwild_speedrun_best'))||0;if(best)$('completeStats').innerHTML+='<br><span style="color:var(--dim)">⏱️ Best record: '+Math.floor(best/60)+':'+('0'+(best%60)).slice(-2)+'</span>';}catch(e){}
  $('complete').classList.add('on');
  SFX.evolve();SFX.evolve();
  toast('🌑 The VOID SOVEREIGN has fallen!','var(--gold)');
}
/* ================= EVENTS (meteore + eclissi) ================= */
function eclipseMult(){return G.event&&G.event.type==='eclipse'?1.5:1;}
function startEclipse(){
  G.stat.eclipse=(G.stat.eclipse||0)+1;
  playCutscene('eclipse');
  toast('🌒 THE ECLIPSE — the Void bleeds into the world!','var(--violet)');
  SFX.evolve();
  for(let i=0;i<3;i++)spawnEcho();
}
function spawnEcho(){
  const pool=SPECIES.filter(s=>s.type==='void'||s.type==='fire');
  if(!pool.length)return;
  const sp=pool[Math.floor(Math.random()*pool.length)];
  for(let t=0;t<40;t++){
    const a=Math.random()*6.28,d=5+Math.random()*7;
    const x=G.player.x+Math.cos(a)*d*TILE,y=G.player.y+Math.sin(a)*d*TILE;
    if(solidAt(x,y)||biomeAt(Math.floor(x/TILE),Math.floor(y/TILE))==='ocean')continue;
    const w=makeWild(sp,{x,y});
    w.lv=8+Math.floor(Math.random()*6);scalePal(w,w.lv);
    w.echo=true;w.fx=1;
    G.seen[sp.id]=true;
    G.wilds.push(w);
    return;
  }
}
function updateEvent(dt){
  if(G.event){
    G.event.t-=dt;
    if(G.event.t<=0)G.event=null;
  }else if(G.day%9===0&&G.time>0.72&&!G.event){
    G.event={type:'eclipse',t:30};
    startEclipse();
  }else if(G.day%3===0&&G.time>0.68&&!G.event){
    G.event={type:'meteor',t:25};
    toast('☄️ Meteor shower! Rare Pals are falling…','var(--gold)');
    SFX.evolve();
  }
}

/* ================= DAY / NIGHT + WEATHER + SEASONS ================= */
function updateTime(dt){
  G.time+=dt/90; /* full cycle ~90s */
  if(G.time>=1){
    G.time=0;G.day++;
    if(G.day===7)playCutscene('day7');
    if(seasonOf(G.day)!==seasonOf(G.day-1)){
      const s=SEASONS[seasonOf(G.day)];
      G.stat.seasonsSeen[seasonOf(G.day)]=1;
      toast(s.icon+' '+s.n+' has arrived! '+s.fx+' — '+s.desc,'var(--violet)');
      SFX.evolve();
    }
    toast('🌅 Day '+G.day,'var(--gold)');
  }
  const s=SEASONS[curSeason()];
  $('daytag').textContent=(G.time>0.68?'🌙 Night':'☀️ Day '+G.day)+' '+s.icon+s.n;
}
function weatherFor(biome,night,rnd){
  const season=curSeason();
  const r=rnd();
  if(night&&biome==='snow'&&r<0.45)return'aurora';
  if(night&&biome==='crystal'&&r<0.5)return'aurora'; /* cristalli: aurore rifratte */
  if(night&&season===3&&r<SEASONS[3].weath.aurora)return'aurora'; /* inverno: aurore ovunque */
  if(season===1){ /* estate: niente pioggia, più tempeste di sabbia */
    if(r<SEASONS[1].weath.sandstorm)return'sandstorm';
    return'clear';
  }
  if(biome==='desert'&&r<0.5)return'sandstorm';
  if(biome==='volcano'&&r<0.55)return'sandstorm'; /* cenere vulcanica */
  if(season===0&&r<0.5)return'rain'; /* primavera: piogge leggere più frequenti */
  if(r<0.38)return'rain';
  return'clear';
}
const WEATHER_ICON={clear:'🌤️',rain:'🌧️',sandstorm:'🌪️',aurora:'🌌'};
function updateWeather(dt){
  G.weatherT-=dt;
  if(G.weatherT<=0){
    G.weatherT=30+Math.random()*25;
    const tx=Math.floor(G.player.x/TILE),ty=Math.floor(G.player.y/TILE);
    G.weather=weatherFor(biomeAt(tx,ty),G.time>0.68,Math.random);
    $('weathtag').textContent=WEATHER_ICON[G.weather];
    if(G.weather==='aurora')questEvent('aurora');
    if(G.weather!=='clear')toast('🌦 '+G.weather.toUpperCase()+' rolling in','var(--dim)');
  }
}
/* ================= HUNGER ================= */
function updateHunger(dt){
  if(G.mode==='zen')return; /* sandbox: niente fame */
  G.hunger=Math.max(0,G.hunger-0.6*dt*diffMult('hunger'));
  if(G.hunger<=0)G.player.hp-=2*dt;
  if(G.hunger<25){
    if((G.inv.stew||0)>0){G.hunger=Math.min(100,G.hunger+60);G.inv.stew--;toast('🍲 Ate stew','var(--gold)');}
    else if((G.inv.cooked||0)>0){G.hunger=Math.min(100,G.hunger+40);G.inv.cooked--;}
    else if((G.inv.berry||0)>=2){G.hunger=Math.min(100,G.hunger+15);G.inv.berry--;}
  }
}
/* ================= PAL WORK (gather) ================= */
function updateWorkPals(dt){
  for(let ti=0;ti<G.team.length;ti++){
    const p=G.team[ti];
    if(p.work!=='gather'||ti===G.active)continue;
    p.cd=(p.cd||0)-dt;
    const tx=Math.floor(p.x/TILE),ty=Math.floor(p.y/TILE);
    let gathered=false;
    if(p.cd<=0){
      for(const[ox,oy]of[[0,0],[1,0],[-1,0],[0,1],[0,-1]]){
        const o=tileObj(tx+ox,ty+oy);
        if(o){
          if(o==='tree')G.inv.wood+=gatherMultOf('wood');
          else if(o==='rock')G.inv.stone++;
          else if(o==='berry')G.inv.berry+=gatherMultOf('berry');
          else if(o==='bush')G.inv.grass+=gatherMultOf('grass');
          p.cd=0.6;gathered=true;questEvent('gather');stylePush('gather');
          break;
        }
      }
    }
    if(!gathered){
      p.wanderT-=dt;
      if(p.wanderT<=0){p.wanderT=1+Math.random()*2;p.wanderD=Math.random()*6.28;}
      const sp=speciesOf(p.id);
      let nx=p.x+Math.cos(p.wanderD)*sp.spd*40*dt,ny=p.y+Math.sin(p.wanderD)*sp.spd*40*dt;
      if(!solidAt(nx,ny)){p.x=nx;p.y=ny;}
    }
  }
}

/* ================= INPUT ================= */
let stickActive=false,stickOx=0,stickOy=0,stickId=null;
const keys=G.keys;
addEventListener('keydown',e=>{
  keys[e.code]=true;
  if(e.code==='Space'){e.preventDefault();throwSphere(0);}
  if(e.code==='KeyE')interact();
  if(e.code==='KeyF')attack();
  if(e.code==='KeyK')shoot();
  if(e.code==='KeyR')toggleRide();
  if(e.code==='KeyI')togglePanel('pCraft');
  if(e.code==='KeyB')togglePanel('pBuild');
  if(e.code==='Escape')closePanels();
});
addEventListener('keyup',e=>keys[e.code]=false);
const stick=$('stick');
stick.addEventListener('pointerdown',e=>{
  stickActive=true;stickId=e.pointerId;
  const r=stick.getBoundingClientRect();
  stickOx=e.clientX-r.left;stickOy=e.clientY-r.top;
  stick.setPointerCapture(e.pointerId);
});
stick.addEventListener('pointermove',e=>{
  if(!stickActive)return;
  const r=stick.getBoundingClientRect();
  const dx=e.clientX-r.left-stickOx,dy=e.clientY-r.top-stickOy;
  const d=Math.hypot(dx,dy)||1,cl=Math.min(1,d/48);
  G.stickVec={x:dx/d*cl,y:dy/d*cl};
  const knob=document.querySelector('#stick .knob');
  knob.style.left=(110+dx*0.8)+'px';knob.style.bottom=(69+dy*0.8)+'px';
});
const endStick=e=>{if(stickActive&&e.pointerId===stickId){stickActive=false;G.stickVec=null;const knob=document.querySelector('#stick .knob');knob.style.left='109px';knob.style.bottom='99px';}};
stick.addEventListener('pointerup',endStick);stick.addEventListener('pointercancel',endStick);

function moveInput(dt){
  let mx=0,my=0;
  if(keys['KeyW']||keys['ArrowUp'])my-=1;
  if(keys['KeyS']||keys['ArrowDown'])my+=1;
  if(keys['KeyA']||keys['ArrowLeft'])mx-=1;
  if(keys['KeyD']||keys['ArrowRight'])mx+=1;
  if(G.stickVec){mx+=G.stickVec.x;my+=G.stickVec.y;}
  const d=Math.hypot(mx,my);
  if(d>0.01){
    mx/=d;my/=d;
    /* cavalca: il Pal attivo si muove più veloce, il giocatore sta sopra */
    if(G.riding&&G.team[G.active]){
      const ap=G.team[G.active];
      const spd=ap.spd*(G.flying?120:95);
      let nx=ap.x+mx*spd*dt,ny=ap.y+my*spd*dt;
      if(G.flying||!circleHitsSolid(nx,ny,10)){ap.x=nx;ap.y=ny;}
      G.player.x=ap.x;G.player.y=ap.y;
      G.player.dir=Math.atan2(my,mx);
      G.stat.travel+=spd*dt;questEvent('travel',Math.round(spd*dt));
      stylePush('travel');
    }else{
      const sp=140;
      let nx=G.player.x+mx*sp*dt,ny=G.player.y+my*sp*dt;
      if(!circleHitsSolid(nx,G.player.y,8))G.player.x=nx;
      if(!circleHitsSolid(G.player.x,ny,8))G.player.y=ny;
      G.player.dir=Math.atan2(my,mx);
      G.stat.travel+=sp*dt;questEvent('travel',Math.round(sp*dt));
      stylePush('travel');
    }
  }
  /* gather nearby (i moltiplicatori stagionali valgono anche qui) */
  const gath=SEASONS[curSeason()].gather;
  const gx=Math.floor(G.player.x/TILE),gy=Math.floor(G.player.y/TILE);
  for(const[ox,oy]of[[0,0],[1,0],[-1,0],[0,1],[0,-1]]){
    const o=tileObj(gx+ox,gy+oy);
    if(o&&G.player.invT<=0){
      if(o==='tree')G.inv.wood+=gatherMultOf('wood');
      else if(o==='rock')G.inv.stone++;
      else if(o==='berry')G.inv.berry+=gatherMultOf('berry');
      else if(o==='bush')G.inv.grass+=gatherMultOf('grass');
      G.player.invT=0.4;
      questEvent('gather');stylePush('gather');
    }
  }
  if(G.player.invT>0)G.player.invT-=dt;
}
function gatherMultOf(res){const base=Math.max(1,Math.round(SEASONS[curSeason()].gather[res]||1));return G.mode==='zen'?base*10:base;}

/* ================= BUILDING ================= */
function placeBuild(id){
  const b=STRUCTURES.find(s=>s.id===id);
  const cost=b.cost;
  for(const k in cost)if((G.inv[k]||0)<cost[k]){toast('Not enough resources','var(--red)');return;}
  for(const k in cost)G.inv[k]-=cost[k];
  G.buildMode=id;
  toast('🏗 Tap the ground to place the '+b.n,'var(--cyan)');
  closePanels();
}
function tryPlace(x,y){
  if(!G.buildMode)return;
  if(solidAt(x,y)){toast('Can\'t place there','var(--red)');return;}
  G.buildings.push({id:G.buildMode,x,y});
  G.buildMode=null;
  toast('🏗 '+STRUCTURES.find(s=>s.id===G.buildings[G.buildings.length-1].id).n+' built!','var(--green)');
  questEvent('build');
  saveGame();
}

/* ================= INTERACT ================= */
function interact(){
  if(G.flying){toggleRide();return;} /* in volo si atterra */
  /* esci dal dungeon / torre */
  if(G.dungeon){G.wilds=G.wilds.filter(w=>!w.dungeon);G.dungeon=null;toast('🚪 Left the ruin','var(--dim)');return;}
  if(G.tower){G.wilds=G.wilds.filter(w=>!w.tower);G.tower=null;toast('🗼 Left the tower','var(--dim)');return;}
  /* pesca: tirare con E quando il mulinello morde */
  if(G.fishing){reelIn();return;}
  const b=G.buildings.find(b=>dist(b,G.player)<2*TILE);
  if(b&&b.id==='chest'){togglePanel('pChest');return;}
  if(b&&b.id==='bed'){G.player.hp=G.player.maxHp;toast('🛏️ Rested — full HP','var(--green)');return;}
  if(b&&b.id==='ranch'){breedAtRanch(b);return;}
  if(b&&b.id==='arena'){startDuel();return;}
  if(b&&b.id==='tower'){enterTower();return;}
  const ru=G.ruins.find(r=>dist(r,G.player)<2*TILE);
  if(ru){enterDungeon(ru);return;}
  /* pesca dalla riva */
  if(G.inv.rod&&nearWater()){startFishing();return;}
  if(G.trader&&dist(G.trader,G.player)<2.2*TILE){togglePanel('pTrade');return;}
  if(G.mira&&dist(G.mira,G.player)<2.2*TILE){talkMira();return;}
  if(G.bram&&dist(G.bram,G.player)<2.2*TILE){togglePanel('pSmith');return;}
  if(G.trainer&&dist(G.trainer,G.player)<2.2*TILE){challengeTrainer();return;}
  if(G.rift&&dist(G.rift,G.player)<2.2*TILE){
    if(!G.memories.confession)playCutscene('confession',spawnFinalBoss);
    else spawnFinalBoss();
    return;
  }
  /* melee kick near wild pal */
  for(const w of G.wilds){if(dist(w,G.player)<1.6*TILE){w.hp-=dmgCalc(6,'void',speciesOf(w.id).type,1,speciesOf(w.id).type2,G.weather);w.fx=0.3;if(w.hp<=0)defeatPal(w);return;}}
}

/* ================= WEAPONS ================= */
function attack(){
  const base=G.equip==='sword'?18+8*(G.inv.swordLv||0):6;
  const hitAny=false;
  for(const w of G.wilds){
    if(dist(w,G.player)<(G.equip==='sword'?1.9:1.6)*TILE){
      /* solo nel semipiano frontale */
      const ang=Math.atan2(w.y-G.player.y,w.x-G.player.x);
      let da=Math.abs(((ang-G.player.dir+Math.PI*3)%(Math.PI*2))-Math.PI);
      if(da<Math.PI/2||G.equip!=='sword'){
        w.hp-=dmgCalc(base,'void',speciesOf(w.id).type,1,speciesOf(w.id).type2,G.weather);
        w.fx=0.35;
        if(w.hp<=0)defeatPal(w);
      }
    }
  }
  if(!hitAny&&G.equip==='sword')G.player.attackFx=0.2;
}
function shoot(){
  if(G.equip!=='bow')return;
  if((G.inv.arrows||0)<1){toast('No arrows — craft some','var(--red)');return;}
  G.inv.arrows--;
  const a=G.player.dir;
  G.projectiles.push({x:G.player.x+Math.cos(a)*12,y:G.player.y+Math.sin(a)*12,vx:Math.cos(a)*420,vy:Math.sin(a)*420,kind:'arrow',t:0});
}

/* ================= PANELS ================= */
function togglePanel(id){const p=$(id);const on=p.classList.toggle('on');if(on)renderPanel(id);else if(id==='pBuild')G.buildMode=null;}
function closePanels(){document.querySelectorAll('.panelbox').forEach(p=>p.classList.remove('on'));}
function renderPanel(id){
  if(id==='pTeam')renderTeam();
  else if(id==='pCraft')renderCraft();
  else if(id==='pLab')renderLab();
  else if(id==='pBuild')renderBuild();
  else if(id==='pQuests')renderQuests();
  else if(id==='pChest')renderChest();
  else if(id==='pTrade')renderTrade();
  else if(id==='pDex')renderDex();
  else if(id==='pEdit')renderEdit();
  else if(id==='pAch')renderAch();
  else if(id==='pTest')renderTest();
  else if(id==='pSmith')renderSmith();
  else if(id==='pDiary')renderDiary();
}
function palRow(p,idx,extra){
  const sp=speciesOf(p.id);
  const col=p.spliceCol||sp.col;
  const div=document.createElement('div');div.className='row';
  div.innerHTML='<span style="width:14px;height:14px;border-radius:50%;background:'+col+';flex:none"></span>'+
    '<span class="nm">'+sp.n+'</span><span class="st">Lv '+p.lv+' · ❤️'+p.maxHp+' · ⚔️'+p.atk+' · 🏃'+p.spd.toFixed(2)+(p.trait?' · 🧬'+p.trait:'')+(p.habit?' · 🤖'+p.habit:'')+(p.xp?' · xp '+(p.xp||0)+'/'+xpNeed(p.lv):'')+'</span>'+(extra||'');
  return div;
}
function renderTeam(){
  const box=$('teamList');box.innerHTML='';
  if(!G.team.length){box.innerHTML='<div class="row" style="color:var(--dim)">No Pals yet — throw a sphere at a wild creature! 🔮</div>';}
  G.team.forEach((p,i)=>{
    const sp2=speciesOf(p.id);
    const div=palRow(p,i,'<button class="minibtn'+(G.active===i?' on':'')+'" data-a="'+i+'">ACTIVE</button><button class="minibtn'+(p.work==='gather'?' on':'')+'" data-w="'+i+'">'+(p.work==='gather'?'⛏ GATHER':'🤝 FOLLOW')+'</button><button class="minibtn gold" data-s="'+i+'">📜 Teach'+(p.skills&&p.skills.length?' ×'+p.skills.length:'')+'</button>');
    box.appendChild(div);
    div.querySelector('[data-a]').onclick=()=>{G.active=i;saveGame();renderPanel('pTeam');toast('📦 '+sp2.n+' is now active','var(--cyan)');};
    div.querySelector('[data-w]').onclick=()=>{
      if(i===G.active&&p.work!=='gather'){toast('The active Pal fights for you — use another for gathering','var(--amber)');return;}
      p.work=p.work==='gather'?'follow':'gather';
      renderPanel('pTeam');
      toast(p.work==='gather'?'⛏ '+sp2.n+' is gathering resources':'🤝 '+sp2.n+' follows you','var(--cyan)');
    };
    div.querySelector('[data-s]').onclick=()=>teachSkill(i);
  });
  $('pTeam').querySelector('.body').appendChild((()=>{const d=document.createElement('div');d.className='row';d.innerHTML='<span style="color:var(--dim)">Dex: '+Object.keys(G.dex).length+' species</span>';return d;})());
}
function renderCraft(){
  const box=$('craftList');box.innerHTML='';
  for(const r of RECIPES){
    const div=document.createElement('div');div.className='row';
    const can=Object.entries(r.cost).every(([k,v])=>(G.inv[k]||0)>=v);
    div.innerHTML='<span>'+r.icon+'</span><span class="nm">'+r.n+'</span><span class="st">'+r.desc+' · '+Object.entries(r.cost).map(([k,v])=>k+':'+v).join(' ')+'</span>'+
      '<button class="minibtn'+(can?' gold':'')+'" data-c="'+RECIPES.indexOf(r)+'"'+(can?'':' disabled')+'>Craft</button>';
    box.appendChild(div);
    div.querySelector('[data-c]').onclick=()=>{r.give();for(const k in r.cost)G.inv[k]-=r.cost[k];questEvent('craftSphere');renderCraft();toast('🛠 Crafted '+r.n,'var(--cyan)');};
  }
}
function renderLab(){
  const box=$('labBody');box.innerHTML='';
  const editBtn=document.createElement('div');editBtn.className='row';
  editBtn.innerHTML='<span>🎨</span><span class="nm">Custom Pal Lab</span><span class="st">synthesize your own Pal, share it via URL</span><button class="minibtn gold" id="openEdit">OPEN</button>';
  box.appendChild(editBtn);
  editBtn.querySelector('#openEdit').onclick=()=>{closePanels();togglePanel('pEdit');};
  if(G.team.length<2){box.innerHTML+='<div class="row" style="color:var(--dim)">Need at least 2 Pals in your team for the Gene Lab.</div>';return;}
  let tg=0,dn=1;
  const mkSel=(label,cb,sel)=>{
    const d=document.createElement('div');d.className='row';
    d.innerHTML='<span class="nm">'+label+'</span><div class="selrow"></div>';
    const row=d.querySelector('.selrow');
    G.team.forEach((p,i)=>{
      const b=document.createElement('button');b.className='chip'+(i===sel?' on':'');b.textContent=speciesOf(p.id).n+' Lv'+p.lv;
      b.onclick=()=>{cb(i);renderLab();};
      row.appendChild(b);
    });
    box.appendChild(d);
  };
  const pick=(label,val,set)=>mkSel(label,v=>set(v),val);
  let selT=0,selD=1;
  pick('Target',selT,v=>selT=v);
  pick('Donor',selD,v=>selD=v);
  const g=document.createElement('div');g.className='row';
  g.innerHTML='<span class="nm">Splice (cost 5 🧪)</span>'+
    '<button class="minibtn gold" data-g="hp">❤️ HP</button><button class="minibtn gold" data-g="atk">⚔️ ATK</button>'+
    '<button class="minibtn gold" data-g="spd">🏃 SPD</button><button class="minibtn gold" data-g="color">🎨 Color</button>'+
    '<button class="minibtn red" data-g="trait">🧬 Trait</button>';
  box.appendChild(g);
  g.querySelectorAll('[data-g]').forEach(b=>b.onclick=()=>{spliceGene(selT,selD,b.dataset.g);renderLab();});
  const f=document.createElement('div');f.className='row';
  f.innerHTML='<span class="nm">🔀 Fusion (same species, cost 8 🧪)</span><button class="minibtn gold" data-f="1">Fuse</button>';
  box.appendChild(f);
  f.querySelector('[data-f]').onclick=()=>{fusePals(selT,selD);renderLab();};
}
function renderBuild(){
  const box=$('buildList');box.innerHTML='';
  for(const b of STRUCTURES){
    const div=document.createElement('div');div.className='row';
    const can=Object.entries(b.cost).every(([k,v])=>(G.inv[k]||0)>=v);
    div.innerHTML='<span>'+b.icon+'</span><span class="nm">'+b.n+'</span><span class="st">'+b.desc+' · '+Object.entries(b.cost).map(([k,v])=>k+':'+v).join(' ')+'</span>'+
      '<button class="minibtn'+(can?' gold':'')+'" data-b="'+b.id+'"'+(can?'':' disabled')+'>Place</button>';
    box.appendChild(div);
    div.querySelector('[data-b]').onclick=()=>placeBuild(b.id);
  }
}
function renderQuests(){
  const box=$('questList');box.innerHTML='';
  const maxCh=Math.max(1,Math.min(5,G.quests.reduce((m,q)=>Math.max(m,q.ch),1)));
  for(let ch=1;ch<=maxCh;ch++){
    const unlocked=ch<=1||questChapterDone(ch-1);
    const doneAll=questChapterDone(ch);
    const head=document.createElement('div');head.className='row';
    head.style.cssText='background:rgba(62,230,255,.06);font-weight:700;letter-spacing:1px';
    head.innerHTML='<span>'+(doneAll?'✅':(unlocked?'⭐':'🔒'))+'</span><span class="nm">Chapter '+ch+' — '+t('ch'+ch)+'</span>'+(unlocked?'<span style="color:var(--dim);font-size:10px">'+(doneAll?'complete':'in progress')+'</span>':'');
    box.appendChild(head);
    for(const q of G.quests.filter(q=>q.ch===ch)){
      if(!unlocked){
        const locked=document.createElement('div');locked.className='row';
        locked.style.cssText='opacity:.4';
        locked.innerHTML='<span>🔒</span><span class="nm">'+t('q'+(G.quests.indexOf(q)+1))+'</span>';
        box.appendChild(locked);
        continue;
      }
      const div=document.createElement('div');div.className='row';
      const done=q.done>=q.t;
      div.innerHTML='<span>'+(done?'✅':'📋')+'</span><span class="nm">'+t('q'+(G.quests.indexOf(q)+1))+'</span><span class="st">'+q.done+'/'+q.t+'</span>'+(done?'<span style="color:var(--gold)">done</span>':'');
      box.appendChild(div);
    }
  }
}
function renderChest(){
  const box=$('chestList');box.innerHTML='';
  const keys=['grass','wood','berry','stone','ess'];
  const names={grass:'🍃 grass',wood:'🪵 wood',berry:'🫐 berry',stone:'🪨 stone',ess:'🧪 essence'};
  for(const k of keys){
    const div=document.createElement('div');div.className='row';
    div.innerHTML='<span class="nm">'+names[k]+'</span><span class="st">bag: '+G.inv[k]+' · chest: '+G.chestInv[k]+'</span>'+
      '<button class="minibtn" data-k="'+k+'" data-d="1">⇢ chest</button><button class="minibtn" data-k="'+k+'" data-d="-1">⇠ bag</button>';
    box.appendChild(div);
    div.querySelectorAll('[data-k]').forEach(b=>b.onclick=()=>{
      const k=b.dataset.k,dir=+b.dataset.d;
      if(dir>0&&G.inv[k]>0){G.inv[k]--;G.chestInv[k]++;}
      if(dir<0&&G.chestInv[k]>0){G.chestInv[k]--;G.inv[k]++;}
      renderChest();
    });
  }
}
function renderTrade(){
  const box=$('tradeList');box.innerHTML='';
  $('coinTxt').textContent=(G.inv.coins||0)+' coins';
  const s=document.createElement('div');s.className='row';
  s.innerHTML='<span class="nm">💰 Sell</span><span class="st">trade resources for coins</span>';
  box.appendChild(s);
  const sellNames={grass:'🍃 grass',wood:'🪵 wood',berry:'🫐 berry',stone:'🪨 stone',ess:'🧪 essence'};
  for(const k in SELL_PRICE){
    const div=document.createElement('div');div.className='row';
    div.innerHTML='<span>'+sellNames[k]+'</span><span class="st">'+SELL_PRICE[k]+'× → 1 🪙</span><button class="minibtn gold" data-s="'+k+'">Sell</button>';
    box.appendChild(div);
    div.querySelector('[data-s]').onclick=()=>tradeSell(k);
  }
  const b=document.createElement('div');b.className='row';
  b.innerHTML='<span class="nm">🛒 Buy</span><span class="st">spend coins</span>';
  box.appendChild(b);
  BUY_ITEMS.forEach((it,i)=>{
    const div=document.createElement('div');div.className='row';
    div.innerHTML='<span>'+it.icon+'</span><span class="nm">'+it.n+'</span><span class="st">'+it.c+' 🪙</span><button class="minibtn gold" data-b="'+i+'">Buy</button>';
    box.appendChild(div);
    div.querySelector('[data-b]').onclick=()=>tradeBuy(i);
  });
}
/* ================= PALDEX (photo gallery) ================= */
const TYPE_ICON={grass:'🌿',fire:'🔥',ice:'❄️',water:'💧',void:'🌑'};
function renderDex(){
  const box=$('dexList');box.innerHTML='';
  const detail=$('dexDetail');detail.classList.remove('on');detail.innerHTML='';
  let seenN=0;
  const grid=document.createElement('div');grid.className='dexgrid';
  SPECIES.forEach((s,i)=>{
    const seen=!!G.seen[s.id];
    if(seen)seenN++;
    const cell=document.createElement('div');cell.className='dexcell'+(seen?'':' unseen');
    const cv=document.createElement('canvas');cv.width=44;cv.height=44;
    const c=cv.getContext('2d');
    if(seen){
      drawPalShape(c,22,24,13,s.col,s.shape,0.5,1);
      c.fillStyle='rgba(0,0,0,.45)';c.fillRect(10,38,24,3);
    }else{
      c.fillStyle='rgba(138,146,200,.28)';c.beginPath();c.arc(22,24,13,0,6.283);c.fill();
      c.fillStyle='rgba(138,146,200,.5)';c.font='10px sans-serif';c.textAlign='center';c.fillText('?',22,27);
    }
    cell.appendChild(cv);
    const nm=document.createElement('div');nm.className='dn';nm.textContent=seen?s.n:'???';
    const ct=document.createElement('div');ct.className='dc';
    ct.textContent=seen?(TYPE_ICON[s.type]+(s.type2?' '+TYPE_ICON[s.type2]:'')+(G.dex[s.id]?' · ×'+G.dex[s.id]:'')):'';
    cell.appendChild(nm);cell.appendChild(ct);
    cell.onclick=()=>{
      detail.classList.add('on');
      if(!seen){detail.innerHTML='<b>???</b> — not seen yet. Explore the wild and it will appear here.';return;}
      detail.innerHTML='<b style="color:'+s.col+'">'+s.n+'</b> '+TYPE_ICON[s.type]+(s.type2?' '+TYPE_ICON[s.type2]:'')+
        ' <span style="color:var(--dim)">· '+s.desc+'</span><br>❤️ '+s.hp+' · ⚔️ '+s.atk+' · 🏃 '+s.spd.toFixed(2)+
        ' · biome: '+s.biome+(s.noct?' · 🌙 night':'')+(s.season!==undefined?' · '+SEASONS[s.season].icon+' '+SEASONS[s.season].n+' only':'')+(s.evTo?' · evolves into '+speciesOf(s.evTo).n+' @Lv'+s.evLv:'')+
        '<br>skills: '+s.skills.map(k=>k[0]+' ('+k[1]+'⚔️)').join(', ')+
        (G.dex[s.id]?'<br><b style="color:var(--gold)">caught ×'+G.dex[s.id]+'</b>':'<br><span style="color:var(--dim)">seen, not caught yet</span>');
    };
    grid.appendChild(cell);
  });
  box.appendChild(grid);
  $('dexCountTxt').textContent=seenN+' / '+SPECIES.length+' seen';
  const hint=document.createElement('div');hint.className='row';
  hint.style.cssText='color:var(--dim);font-size:10.5px';
  hint.textContent='📸 Photo gallery — tap a Pal for its full dossier. Unseen Pals stay silhouettes.';
  box.appendChild(hint);
}
/* ================= CUSTOM PAL EDITOR UI ================= */
function updateEditPreview(){
  const cv=$('editPrev');
  const c=cv.getContext('2d');
  c.clearRect(0,0,cv.width,cv.height);
  drawPalShape(c,32,34,22,E.col,E.shape,0.5,1);
  c.fillStyle='rgba(0,0,0,.45)';c.fillRect(12,54,40,5);
  $('statTxt').textContent='❤️ '+Math.round(E.hp)+' · ⚔️ '+Math.round(E.atk)+' · 🏃 '+E.spd.toFixed(2)+' · '+TYPES[E.type];
  $('hpVal').textContent=Math.round(E.hp);
  $('atkVal').textContent=Math.round(E.atk);
  $('spdVal').textContent=E.spd.toFixed(2);
}
function renderEdit(){
  const box=$('editBody');box.innerHTML='';
  E=Object.assign({shape:0,col:'#3ee6ff',type:'grass',hp:70,atk:16,spd:1.4,trait:null,skills:[],name:''},E);
  /* preview + nome */
  const top=document.createElement('div');top.className='row';
  top.style.cssText='justify-content:center;gap:16px';
  const cv=document.createElement('canvas');cv.id='editPrev';cv.width=64;cv.height=64;
  top.appendChild(cv);
  const nm=document.createElement('input');nm.id='editName';nm.placeholder='Pal name';nm.maxLength=18;nm.value=E.name;
  nm.style.cssText='background:rgba(12,17,34,.9);border:1px solid var(--line);border-radius:9px;color:var(--text);font:inherit;font-size:13px;padding:7px 10px;width:130px';
  top.appendChild(nm);
  box.appendChild(top);
  nm.oninput=()=>{E.name=nm.value;};
  /* shape */
  const sh=document.createElement('div');sh.className='row';sh.innerHTML='<span class="nm">Shape</span><div class="selrow" id="shapeRow"></div>';
  box.appendChild(sh);
  const sr=sh.querySelector('#shapeRow');
  for(let i=0;i<6;i++){
    const b=document.createElement('button');b.className='chip'+(E.shape===i?' on':'');b.textContent=SHAPE_ICON[i];
    b.onclick=()=>{E.shape=i;sr.querySelectorAll('.chip').forEach((c,j)=>c.classList.toggle('on',j===i));updateEditPreview();};
    sr.appendChild(b);
  }
  /* color + type */
  const ct=document.createElement('div');ct.className='row';ct.innerHTML='<span class="nm">Color</span>';
  const col=document.createElement('input');col.type='color';col.value=E.col;
  col.style.cssText='width:34px;height:26px;border:1px solid var(--line);border-radius:7px;background:transparent;cursor:pointer';
  col.oninput=()=>{E.col=col.value;updateEditPreview();};
  ct.appendChild(col);
  const tr2=document.createElement('div');tr2.className='selrow';tr2.style.cssText='margin-left:auto';
  for(const t in TYPES){
    const b=document.createElement('button');b.className='chip'+(E.type===t?' on':'');b.textContent=TYPE_ICON[t]+t;
    b.onclick=()=>{E.type=t;E.skills=[];renderEdit();};
    tr2.appendChild(b);
  }
  ct.appendChild(tr2);
  box.appendChild(ct);
  /* stats */
  const mkSlider=(label,min,max,step,get,set)=>{
    const r=document.createElement('div');r.className='row';
    r.innerHTML='<span class="nm">'+label+'</span><input type="range" min="'+min+'" max="'+max+'" step="'+step+'" style="flex:1;accent-color:var(--cyan)"><b id="'+label+'Val" style="width:38px;text-align:right;color:var(--cyan)"></b>';
    box.appendChild(r);
    const inp=r.querySelector('input');inp.value=get();
    inp.oninput=()=>{set(+inp.value);updateEditPreview();};
  };
  mkSlider('hp',30,130,1,()=>E.hp,v=>E.hp=v);
  mkSlider('atk',6,34,1,()=>E.atk,v=>E.atk=v);
  mkSlider('spd',0.9,2.0,0.05,()=>E.spd,v=>E.spd=v);
  const st=document.createElement('div');st.className='row';st.id='statTxt';st.style.cssText='color:var(--dim);font-size:11px';
  box.appendChild(st);
  /* trait */
  const tr=document.createElement('div');tr.className='row';tr.innerHTML='<span class="nm">Trait</span><div class="selrow" id="traitRow"></div>';
  box.appendChild(tr);
  const traitRow=tr.querySelector('#traitRow');
  const noneB=document.createElement('button');noneB.className='chip'+(E.trait===null?' on':'');noneB.textContent='none';
  noneB.onclick=()=>{E.trait=null;traitRow.querySelectorAll('.chip').forEach((c,i)=>c.classList.toggle('on',i===0));};
  traitRow.appendChild(noneB);
  TRAITS.forEach((t,i)=>{
    const b=document.createElement('button');b.className='chip'+(E.trait===t.n?' on':'');b.textContent=t.n+' ('+t.d+')';
    b.onclick=()=>{E.trait=t.n;traitRow.querySelectorAll('.chip').forEach((c,j)=>c.classList.toggle('on',j===i+1));};
    traitRow.appendChild(b);
  });
  /* skills (max 3) */
  const sk=document.createElement('div');sk.className='row';sk.innerHTML='<span class="nm">Skills</span><div class="selrow" id="skillRow"></div>';
  box.appendChild(sk);
  const skillRow=sk.querySelector('#skillRow');
  SKILL_POOL[E.type].forEach((s,i)=>{
    const b=document.createElement('button');b.className='chip'+(E.skills.includes(s[0])?' on':'');b.textContent=s[0]+' ('+s[1]+'⚔️)';
    b.onclick=()=>{
      const idx=E.skills.indexOf(s[0]);
      if(idx>=0)E.skills.splice(idx,1);
      else{if(E.skills.length>=3){toast('Max 3 skills','var(--amber)');return;}E.skills.push(s[0]);}
      b.classList.toggle('on',idx<0);
    };
    skillRow.appendChild(b);
  });
  /* cost + buttons */
  const act=document.createElement('div');act.className='row';
  act.style.cssText='justify-content:center;gap:8px';
  const mk=document.createElement('button');mk.className='minibtn gold';mk.textContent='🧬 Synthesize ('+CUSTOM_COST+' essence)';
  mk.onclick=createCustomPal;
  const sh2=document.createElement('button');sh2.className='minibtn';sh2.textContent='🔗 Copy share link';
  sh2.onclick=copyShareLink;
  act.appendChild(mk);act.appendChild(sh2);
  box.appendChild(act);
  const note=document.createElement('div');note.className='row';
  note.style.cssText='color:var(--dim);font-size:10.5px';
  note.textContent='Sharing encodes the design in the URL — anyone opening it meets your Pal as a wild visitor.';
  box.appendChild(note);
  updateEditPreview();
}
function refreshHud(){
  $('hpbar').querySelector('i').style.width=(clamp(G.player.hp/G.player.maxHp,0,1)*100)+'%';
  $('hpTxt').textContent=Math.max(0,Math.round(G.player.hp));
  $('hungbar').querySelector('i').style.width=(clamp(G.hunger/100,0,1)*100)+'%';
  $('hungTxt').textContent=Math.max(0,Math.round(G.hunger));
  $('essTxt').textContent=G.inv.ess;
  $('sphTxt').textContent=G.sph[0]+G.sph[1]+G.sph[2];
  $('resTxt').textContent=G.inv.grass+G.inv.wood+G.inv.berry+G.inv.stone;
  $('btnThrow').textContent=t('throw')+' ('+G.sph[0]+')';
  $('btnAttack').style.display=G.equip==='sword'?'inline-block':'none';
  $('btnAttack').textContent=G.equip==='sword'?t('attack')+' '+G.inv.sword:'';
  $('btnShoot').style.display=G.equip==='bow'?'inline-block':'none';
  $('btnShoot').textContent=t('shoot')+' '+(G.inv.arrows||0);
  $('btnRide').style.display=G.team.length?'inline-block':'none';
  $('btnRide').textContent=G.flying?t('descend'):(G.riding?t('dismount'):t('ride'));
  $('btnRide').classList.toggle('on',G.riding);
  if(G.speedrun&&G.speedrun.on){
    $('srBox').style.display='inline-block';
    const s=Math.floor(G.speedrun.elapsed),mm=Math.floor(s/60),ss=s%60;
    $('srTime').textContent=mm+':'+(ss<10?'0':'')+ss;
  }else if($('srBox'))$('srBox').style.display='none';
}

/* ================= RENDER ================= */
const canvas=$('game'),ctx=canvas.getContext('2d');
let lightCv=null; /* canvas per il light-mask notturno */
let CW=0,CH=0;
function resize(){const dpr=Math.min(devicePixelRatio||1,2);CW=innerWidth;CH=innerHeight;canvas.width=CW*dpr;canvas.height=CH*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);}
function drawPalShape(ctx,x,y,r,col,shape,rot,eyeR){
  ctx.save();ctx.translate(x,y);ctx.rotate(rot||0);
  ctx.fillStyle=col;
  if(shape===0)ctx.beginPath(),ctx.arc(0,0,r,0,6.283),ctx.fill();
  else if(shape===1){ctx.beginPath();for(let i=0;i<10;i++){const a=i/10*6.283;const rr=r*(0.7+0.3*Math.sin(a*3));i?ctx.lineTo(Math.cos(a)*rr,Math.sin(a)*rr):ctx.moveTo(Math.cos(a)*rr,Math.sin(a)*rr);}ctx.closePath();ctx.fill();}
  else if(shape===2){ctx.beginPath();ctx.moveTo(0,-r);ctx.lineTo(r*0.9,r*0.7);ctx.lineTo(-r*0.9,r*0.7);ctx.closePath();ctx.fill();}
  else if(shape===3){ctx.fillRect(-r*0.8,-r*0.8,r*1.6,r*1.6);}
  else if(shape===4){ctx.beginPath();ctx.moveTo(0,-r);ctx.lineTo(r*0.8,0);ctx.lineTo(0,r);ctx.lineTo(-r*0.8,0);ctx.closePath();ctx.fill();}
  else{ctx.beginPath();for(let i=0;i<5;i++){const a=-Math.PI/2+i*1.2566;const rr=i%2?r*0.45:r;ctx.lineTo(Math.cos(a)*rr,Math.sin(a)*rr);}ctx.closePath();ctx.fill();}
  ctx.fillStyle='#fff';
  ctx.beginPath();ctx.arc(-r*0.3,-r*0.15,r*0.22*eyeR,0,6.283);ctx.fill();
  ctx.beginPath();ctx.arc(r*0.3,-r*0.15,r*0.22*eyeR,0,6.283);ctx.fill();
  ctx.fillStyle='#111';
  ctx.beginPath();ctx.arc(-r*0.3,-r*0.15,r*0.1*eyeR,0,6.283);ctx.fill();
  ctx.beginPath();ctx.arc(r*0.3,-r*0.15,r*0.1*eyeR,0,6.283);ctx.fill();
  ctx.restore();
}
function render(){
  ctx.fillStyle='#0b1020';ctx.fillRect(0,0,CW,CH);
  const season=curSeason();
  const sCols=SEASONS[season].tint;
  const camX=G.player.x-CW/2,camY=G.player.y-CH/2;
  /* tiles */
  const t0x=Math.floor(camX/TILE),t0y=Math.floor(camY/TILE),t1x=Math.ceil((camX+CW)/TILE),t1y=Math.ceil((camY+CH)/TILE);
  for(let ty=t0y;ty<=t1y;ty++)for(let tx=t0x;tx<=t1x;tx++){
    const bm=biomeAt(tx,ty);
    ctx.fillStyle=sCols[bm];
    ctx.fillRect(tx*TILE-camX,ty*TILE-camY,TILE+0.5,TILE+0.5);
    const o=tileObj(tx,ty);
    const px=tx*TILE+8-camX,py=ty*TILE+8-camY;
    if(o==='tree'){ctx.fillStyle='#1d4a2e';ctx.beginPath();ctx.arc(px,py,7,0,6.283);ctx.fill();ctx.fillStyle='#3f8f52';ctx.beginPath();ctx.arc(px,py-3,5,0,6.283);ctx.fill();}
    else if(o==='rock'){ctx.fillStyle='#5a6478';ctx.fillRect(px-6,py-4,12,8);}
    else if(o==='berry'){ctx.fillStyle='#2e6b3f';ctx.beginPath();ctx.arc(px,py,5,0,6.283);ctx.fill();ctx.fillStyle='#ff5f9e';ctx.beginPath();ctx.arc(px-2,py-1,2.2,0,6.283);ctx.fill();ctx.beginPath();ctx.arc(px+2,py+1,2.2,0,6.283);ctx.fill();}
    else if(o==='bush'){ctx.fillStyle='#2f9e5a';ctx.beginPath();ctx.arc(px,py,5,0,6.283);ctx.fill();ctx.fillStyle='#52c96b';ctx.beginPath();ctx.arc(px-2,py-2,3,0,6.283);ctx.fill();}
    /* decorazioni biomi nuovi: fessure laviche e cristalli */
    const dec2=hash2(tx,ty,SEED^0xabc123);
    if(bm==='volcano'&&dec2<0.07){
      ctx.strokeStyle='#ff7a3f';ctx.lineWidth=1.5;
      ctx.beginPath();ctx.moveTo(px-4,py+4);ctx.lineTo(px,py-2);ctx.lineTo(px+4,py+1);ctx.stroke();
    }else if(bm==='crystal'&&dec2<0.1){
      ctx.fillStyle='#a06bff';
      ctx.beginPath();ctx.moveTo(px,py-6);ctx.lineTo(px+4,py);ctx.lineTo(px,py+4);ctx.lineTo(px-4,py);ctx.closePath();ctx.fill();
      ctx.fillStyle='#c8b0ff';ctx.beginPath();ctx.moveTo(px,py-4);ctx.lineTo(px+2,py);ctx.lineTo(px,py+2);ctx.lineTo(px-2,py);ctx.closePath();ctx.fill();
    }
    /* decorazioni stagionali: fiori in primavera, foglie in autunno */
    const dec=hash2(tx,ty,SEED^0x5eed);
    if(season===0&&dec<0.055&&!o&&bm!=='snow'&&bm!=='ocean'){
      ctx.fillStyle='#ffb8dc';ctx.beginPath();ctx.arc(px,py-2,2.4,0,6.283);ctx.fill();
      ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(px,py-2,1,0,6.283);ctx.fill();
    }else if(season===2&&dec<0.06&&!o&&(bm==='grass'||bm==='forest')){
      ctx.fillStyle='#ff9e3f';ctx.beginPath();ctx.arc(px+1,py-1,1.8,0,6.283);ctx.fill();
      ctx.fillStyle='#e2573f';ctx.beginPath();ctx.arc(px-1,py+1,1.4,0,6.283);ctx.fill();
    }
  }
  /* buildings */
  for(const b of G.buildings){
    const px=b.x-camX,py=b.y-camY;
    if(b.id==='campfire'){ctx.fillStyle='#7a4a22';ctx.fillRect(px-8,py-6,16,12);ctx.fillStyle=G.time>0.68?'#ff9e3f':'#c96a2a';ctx.beginPath();ctx.arc(px,py-4,6,0,6.283);ctx.fill();}
    else if(b.id==='lantern'){ctx.fillStyle='#4a3a5a';ctx.fillRect(px-2,py-2,4,10);ctx.fillStyle=G.time>0.68?'#ffd166':'#b8a0e8';ctx.beginPath();ctx.arc(px,py-5,5+Math.sin(performance.now()/160)*0.8,0,6.283);ctx.fill();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(px-1,py-6,1.2,0,6.283);ctx.fill();}
    else if(b.id==='bed'){ctx.fillStyle='#4a6fb8';ctx.fillRect(px-10,py-5,20,10);ctx.fillStyle='#eef0ff';ctx.fillRect(px-10,py-8,20,4);}
    else if(b.id==='workbench'){ctx.fillStyle='#8a5a2a';ctx.fillRect(px-8,py-6,16,12);ctx.fillStyle='#c9a35f';ctx.fillRect(px-8,py-8,16,3);}
    else if(b.id==='chest'){ctx.fillStyle='#5a3a20';ctx.fillRect(px-8,py-6,16,12);ctx.fillStyle='#ffd166';ctx.fillRect(px-8,py-6,16,3);}
  }
  /* wild pals */
  for(const w of G.wilds){
    const sp=speciesOf(w.id);
    const px=w.x-camX,py=w.y-camY;
    const r=w.isFinal?26:(w.isBoss?14:9);
    if(w.isFinal){
      const p=Math.sin(performance.now()/180);
      ctx.fillStyle='rgba(110,60,255,'+(0.12+0.1*(p+1)/2)+')';
      ctx.beginPath();ctx.arc(px,py,r+14+3*p,0,6.283);ctx.fill();
      ctx.strokeStyle='rgba(194,107,255,'+(0.5+0.4*(p+1)/2)+')';ctx.lineWidth=3;
      ctx.beginPath();ctx.arc(px,py,r+9+2*p,0,6.283);ctx.stroke();
    }
    drawPalShape(ctx,px,py,r,w.isFinal?'#c26bff':(w.isBoss?'#ff3355':sp.col),sp.shape,w.dir,1);
    ctx.fillStyle='rgba(0,0,0,.4)';
    ctx.fillRect(px-r,py+r+3,r*2,3);
    ctx.fillStyle=w.hp/w.maxHp>0.5?'#52ff9e':'#ff5f6d';
    ctx.fillRect(px-r,py+r+7,r*2*(w.hp/w.maxHp),2);
    if(w.isFinal){ctx.fillStyle='#ff5f6d';ctx.font='bold 11px sans-serif';ctx.textAlign='center';ctx.fillText('VOID SOVEREIGN',px,py-r-14);}
    else if(w.isChamp){ctx.fillStyle='#ffd166';ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.fillText('CHAMPION',px,py-r-10);ctx.strokeStyle='rgba(255,209,102,.9)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(px,py,r+4,0,6.283);ctx.stroke();}
    else if(w.isBoss){ctx.fillStyle='#ffd166';ctx.font='10px sans-serif';ctx.textAlign='center';ctx.fillText('ALPHA',px,py-r-8);}
    if(w.echo){ctx.globalAlpha=0.55;ctx.fillStyle='rgba(194,107,255,.35)';ctx.beginPath();ctx.arc(px,py,r+3,0,6.283);ctx.fill();ctx.fillStyle='#c26bff';ctx.font='8px sans-serif';ctx.textAlign='center';ctx.fillText('ECHO',px,py-r-6);ctx.globalAlpha=1;}
    if(w.isCustom){
      ctx.strokeStyle='rgba(255,209,102,.85)';ctx.lineWidth=1.5;
      ctx.beginPath();ctx.arc(px,py,r+4,0,6.283);ctx.stroke();
      ctx.fillStyle='#ffd166';ctx.font='8px sans-serif';ctx.textAlign='center';
      ctx.fillText('CUSTOM',px,py-r-6);
    }
    if(w.fx>0){w.fx-=0.02;ctx.strokeStyle='rgba(255,255,255,'+w.fx+')';ctx.lineWidth=2;ctx.beginPath();ctx.arc(px,py,r+3,0,6.283);ctx.stroke();}
  }
  /* projectiles */
  for(const pr of G.projectiles){
    if(pr.kind==='arrow'){
      ctx.strokeStyle='#ffd166';ctx.lineWidth=2;
      ctx.beginPath();ctx.moveTo(pr.x-camX-pr.vx*0.04,pr.y-camY-pr.vy*0.04);ctx.lineTo(pr.x-camX,pr.y-camY);ctx.stroke();
    }else{
      ctx.fillStyle=SPHERE_TIERS[pr.tier].col;
      ctx.beginPath();ctx.arc(pr.x-camX,pr.y-camY,5+Math.sin(pr.t*20)*1.5,0,6.283);ctx.fill();
    }
  }
  /* bobber pesca */
  if(G.fishing){
    const bx=p.x-camX,by=p.y-camY-10;
    ctx.strokeStyle='rgba(255,255,255,.5)';ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(bx,by);ctx.lineTo(bx,by+14);ctx.stroke();
    const bob=G.fishing.bitten?Math.sin(performance.now()/80)*3:Math.sin(performance.now()/400)*1.5;
    ctx.fillStyle=G.fishing.bitten?'#ff5f6d':'#ffd166';
    ctx.beginPath();ctx.arc(bx,by+16+bob,3.5,0,6.283);ctx.fill();
    if(G.fishing.bitten){
      ctx.strokeStyle='rgba(255,95,109,.8)';ctx.lineWidth=2;
      ctx.beginPath();ctx.arc(bx,by+16+bob,7,0,6.283);ctx.stroke();
    }
  }
  /* player */
  const p=G.player;
  if(G.flying){
    /* ombra proiettata a terra sotto il volo */
    ctx.fillStyle='rgba(0,0,0,.35)';
    ctx.beginPath();ctx.ellipse(p.x-camX,p.y-camY+26,10,4,0,0,6.283);ctx.fill();
  }
  const pBob=G.flying?Math.sin(performance.now()/180)*3:0;
  drawPalShape(ctx,p.x-camX,p.y-camY+pBob,10,'#3ee6ff',0,p.dir,1.2);
  ctx.strokeStyle='#fff';ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(p.x-camX,p.y-camY+pBob);
  ctx.lineTo(p.x+Math.cos(p.dir)*14-camX,p.y+Math.sin(p.dir)*14-camY+pBob);
  ctx.stroke();
  /* active pal */
  const ap=G.team[G.active];
  if(ap){
    const sp=speciesOf(ap.id);
    if(G.flying){
      ctx.fillStyle='rgba(0,0,0,.3)';
      ctx.beginPath();ctx.ellipse(ap.x-camX,ap.y-camY+20,9,3.5,0,0,6.283);ctx.fill();
      const ab=Math.sin(performance.now()/140)*4;
      drawPalShape(ctx,ap.x-camX,ap.y-camY-6+ab,8,ap.spliceCol||sp.col,sp.shape,Math.atan2(ap.y-p.y,ap.x-p.x),1);
      /* ali */
      ctx.strokeStyle='rgba(194,107,255,.9)';ctx.lineWidth=2;
      ctx.beginPath();ctx.moveTo(ap.x-camX-6,ap.y-camY-4+ab);ctx.lineTo(ap.x-camX-16,ap.y-camY-14+ab);ctx.stroke();
      ctx.beginPath();ctx.moveTo(ap.x-camX+6,ap.y-camY-4+ab);ctx.lineTo(ap.x-camX+16,ap.y-camY-14+ab);ctx.stroke();
    }else{
      drawPalShape(ctx,ap.x-camX,ap.y-camY,7,ap.spliceCol||sp.col,sp.shape,Math.atan2(ap.y-p.y,ap.x-p.x),1);
    }
  }
  /* work pals: piccolo sacco dorato sopra */
  for(const wp of G.team){
    if(wp.work==='gather'){
      ctx.fillStyle='#ffd166';
      ctx.beginPath();ctx.arc(wp.x-camX,wp.y-camY-14,3,0,6.283);ctx.fill();
    }
  }
  /* farms: seme → germoglio → pronto */
  for(const f of G.farms){
    const px=f.x-camX,py=f.y-camY;
    if(f.t<20){ctx.fillStyle='#8a5a2a';ctx.fillRect(px-4,py-1,8,3);ctx.fillStyle='#52c96b';ctx.beginPath();ctx.arc(px,py-3,2,0,6.283);ctx.fill();}
    else if(f.t<45){ctx.fillStyle='#5a3a20';ctx.fillRect(px-6,py-2,12,4);ctx.fillStyle='#52ff9e';ctx.beginPath();ctx.arc(px,py-6,3.5,0,6.283);ctx.fill();}
    else{ctx.fillStyle='#5a3a20';ctx.fillRect(px-6,py-2,12,4);ctx.fillStyle='#ff5f9e';ctx.beginPath();ctx.arc(px,py-7,4+Math.sin(performance.now()/200)*1,0,6.283);ctx.fill();ctx.fillStyle='#ffd166';ctx.beginPath();ctx.arc(px-2,py-8,1.5,0,6.283);ctx.fill();}
  }
  /* rovine: cerchio di pietra + ingresso */
  for(const r of G.ruins){
    const px=r.x-camX,py=r.y-camY;
    ctx.fillStyle='rgba(90,100,120,.35)';
    ctx.beginPath();ctx.arc(px,py,12,0,6.283);ctx.fill();
    ctx.strokeStyle='#6a7488';ctx.lineWidth=2;
    ctx.beginPath();ctx.arc(px,py,12,0,6.283);ctx.stroke();
    ctx.fillStyle='#3ee6ff';
    ctx.font='9px sans-serif';ctx.textAlign='center';
    ctx.fillText('🏛',px,py+3);
  }
  /* mercante ambulante */
  if(G.trader){
    const px=G.trader.x-camX,py=G.trader.y-camY;
    ctx.fillStyle='#ffd166';
    ctx.beginPath();ctx.arc(px,py,9,0,6.283);ctx.fill();
    ctx.fillStyle='#8a5a2a';
    ctx.beginPath();ctx.arc(px,py,5,0,6.283);ctx.fill();
    ctx.fillStyle='#111';
    ctx.beginPath();ctx.arc(px-2,py-1,1.2,0,6.283);ctx.fill();
    ctx.beginPath();ctx.arc(px+2,py-1,1.2,0,6.283);ctx.fill();
    ctx.fillStyle='#ff5f9e';ctx.font='bold 11px sans-serif';ctx.textAlign='center';
    ctx.fillText('!',px,py-14);
  }
  /* allenatore errante */
  if(G.trainer){
    const px=G.trainer.x-camX,py=G.trainer.y-camY;
    ctx.fillStyle=G.trainer.col;
    ctx.beginPath();ctx.arc(px,py-5,5,0,6.283);ctx.fill();
    ctx.fillRect(px-6,py+1,12,9);
    ctx.fillStyle='#0b1020';
    ctx.beginPath();ctx.arc(px-2,py-6,1.2,0,6.283);ctx.fill();
    ctx.beginPath();ctx.arc(px+2,py-6,1.2,0,6.283);ctx.fill();
    ctx.fillStyle='#fff';ctx.font='bold 10px sans-serif';ctx.textAlign='center';
    ctx.fillText('⚔️',px,py-12);
    if(G.trainer.defeated)ctx.fillStyle='#ffd166';
    else ctx.fillStyle='#ff5f6d';
    ctx.font='bold 8px sans-serif';
    ctx.fillText(G.trainer.defeated?'REMATCH':'BATTLE',px,py+16);
  }
  /* void rift (final boss gate) */
  if(G.rift){
    const px=G.rift.x-camX,py=G.rift.y-camY;
    const p=Math.sin(performance.now()/140);
    ctx.fillStyle='rgba(110,60,255,'+(0.18+0.14*(p+1)/2)+')';
    ctx.beginPath();ctx.arc(px,py,16+2*p,0,6.283);ctx.fill();
    ctx.strokeStyle='rgba(194,107,255,'+(0.6+0.4*(p+1)/2)+')';ctx.lineWidth=2;
    ctx.beginPath();ctx.arc(px,py,12+2*p,0,6.283);ctx.stroke();
    ctx.fillStyle='#c26bff';ctx.font='bold 9px sans-serif';ctx.textAlign='center';
    ctx.fillText('VOID RIFT — press E',px,py-22);
  }
  /* Elder Mira: figura viola incappucciata */
  if(G.mira){
    const px=G.mira.x-camX,py=G.mira.y-camY;
    ctx.fillStyle='#7a48d8';
    ctx.beginPath();ctx.arc(px,py-5,6,0,6.283);ctx.fill();
    ctx.fillRect(px-7,py,14,10);
    ctx.fillStyle='#b28dff';
    ctx.beginPath();ctx.arc(px,py-5,3,0,6.283);ctx.fill();
    ctx.fillStyle='#ffb8dc';ctx.font='bold 10px sans-serif';ctx.textAlign='center';
    ctx.fillText('🌙',px,py-12);
    if(G.mira.cd<=0){ctx.fillStyle='#ffd166';ctx.font='bold 8px sans-serif';ctx.fillText('TALK',px,py+17);}
  }
  /* Bram: figura di ferro con martello */
  if(G.bram){
    const px=G.bram.x-camX,py=G.bram.y-camY;
    ctx.fillStyle='#5a6478';
    ctx.fillRect(px-6,py-8,12,7);
    ctx.fillRect(px-7,py-1,14,10);
    ctx.fillStyle='#8a92c8';
    ctx.fillRect(px-4,py-6,8,3);
    ctx.fillStyle='#ffd166';ctx.font='bold 10px sans-serif';ctx.textAlign='center';
    ctx.fillText('🔨',px,py-14);
    ctx.fillStyle='#52ff9e';ctx.font='bold 8px sans-serif';
    ctx.fillText('UPGRADE',px,py+16);
  }
  /* dungeon: mura + trappole + segreto + volta */
  const d=G.dungeon;
  if(d){
    ctx.strokeStyle='rgba(110,140,255,.4)';ctx.lineWidth=3;
    ctx.strokeRect(d.x-d.R-camX,d.y-d.R-camY,d.R*2,d.R*2);
    for(const tr of d.traps){
      const px=tr.x-camX,py=tr.y-camY;
      const armed=tr.t<=0;
      ctx.fillStyle=armed?'#ff5f6d':'#5a6478';
      const b=armed?1+Math.sin(performance.now()/120)*0.15:0;
      ctx.beginPath();ctx.moveTo(px,py-7*b);ctx.lineTo(px-6*b,py+6);ctx.lineTo(px+6*b,py+6);ctx.closePath();ctx.fill();
    }
    if(d.secret&&!d.secretFound){
      const px=d.secret.x-camX,py=d.secret.y-camY;
      const p=Math.sin(performance.now()/160);
      ctx.fillStyle='rgba(255,255,255,'+(0.15+0.2*(p+1)/2)+')';
      ctx.beginPath();ctx.arc(px,py,9+2*p,0,6.283);ctx.fill();
      ctx.strokeStyle='#ffd166';ctx.lineWidth=1.5;
      ctx.beginPath();ctx.arc(px,py,9+2*p,0,6.283);ctx.stroke();
      ctx.fillStyle='#ffd166';ctx.font='10px sans-serif';ctx.textAlign='center';
      ctx.fillText('✨',px,py+3);
    }
    if(d.vault){
      const px=d.vault.x-camX,py=d.vault.y-camY;
      const p=Math.sin(performance.now()/140);
      ctx.fillStyle='#8a5a20';
      ctx.fillRect(px-8,py-6,16,12);
      ctx.fillStyle='#ffd166';
      ctx.fillRect(px-8,py-6,16,4);
      ctx.strokeStyle='rgba(255,209,102,'+(0.5+0.4*(p+1)/2)+')';ctx.lineWidth=2;
      ctx.strokeRect(px-11,py-9,22,18);
      ctx.fillStyle='#ffd166';ctx.font='bold 10px sans-serif';ctx.textAlign='center';
      ctx.fillText('VAULT',px,py-13);
    }
  }
  /* ranch (recinto + uovo) e arena */
  for(const b of G.buildings){
    const px=b.x-camX,py=b.y-camY;
    if(b.id==='ranch'){
      ctx.strokeStyle='#8a5a2a';ctx.lineWidth=2;
      ctx.strokeRect(px-11,py-11,22,22);
      ctx.fillStyle='#6a4a2a';
      ctx.fillRect(px-13,py-13,26,3);ctx.fillRect(px-13,py+10,26,3);
      if(b.b){
        const grow=b.b.ready?1:Math.min(1,b.b.t/30);
        ctx.fillStyle='#f0e6d8';
        ctx.beginPath();ctx.ellipse(px,py,4+grow*3,3+grow*2.4,0,0,6.283);ctx.fill();
        ctx.fillStyle='#ffd166';
        ctx.beginPath();ctx.arc(px,py,1.5,0,6.283);ctx.fill();
      }
    }else if(b.id==='arena'){
      ctx.fillStyle='rgba(120,120,140,.25)';
      ctx.beginPath();ctx.arc(px,py,13,0,6.283);ctx.fill();
      ctx.strokeStyle='#ff5f6d';ctx.lineWidth=2;
      ctx.beginPath();ctx.arc(px,py,13,0,6.283);ctx.stroke();
      ctx.fillStyle='#ff5f6d';ctx.font='9px sans-serif';ctx.textAlign='center';
      ctx.fillText('⚔️',px,py+3);
    }else if(b.id==='tower'){
      ctx.fillStyle='#6a4a2a';
      ctx.fillRect(px-9,py-2,18,12);
      ctx.fillStyle='#8a5a2a';
      ctx.fillRect(px-6,py-10,12,9);
      ctx.fillStyle='#ffd166';
      ctx.fillRect(px-6,py-12,12,3);
      ctx.fillStyle='#ffd166';ctx.font='9px sans-serif';ctx.textAlign='center';
      ctx.fillText('🗼',px,py+4);
    }
  }
  /* torre: confine */
  if(G.tower){
    const d=G.tower;
    ctx.strokeStyle='rgba(255,209,102,.5)';ctx.lineWidth=2;ctx.setLineDash([6,5]);
    ctx.beginPath();ctx.arc(d.x-camX,d.y-camY,d.R,0,6.283);ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle='#ffd166';ctx.font='12px sans-serif';ctx.textAlign='center';
    ctx.fillText('🗼 Floor '+d.floor+' · '+G.wilds.filter(w=>w.tower).length+' left',d.x-camX,d.y-camY-d.R-10);
  }
  /* dungeon: confine */
  if(G.dungeon){
    const d=G.dungeon;
    ctx.strokeStyle='rgba(178,141,255,.5)';ctx.lineWidth=2;ctx.setLineDash([8,6]);
    ctx.beginPath();ctx.arc(d.x-camX,d.y-camY,d.R,0,6.283);ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle='#b28dff';ctx.font='12px sans-serif';ctx.textAlign='center';
    ctx.fillText('🏛 Floor '+d.floor+' · '+G.wilds.filter(w=>w.dungeon).length+' left',d.x-camX,d.y-camY-d.R-10);
  }
  /* nemico duello: anello rosso */
  if(G.duel&&G.duel.e){
    const e=G.duel.e;
    ctx.strokeStyle='rgba(255,95,109,.6)';ctx.lineWidth=2;
    ctx.beginPath();ctx.arc(e.x-camX,e.y-camY,15,0,6.283);ctx.stroke();
    ctx.fillStyle='#ff5f6d';ctx.font='10px sans-serif';ctx.textAlign='center';
    ctx.fillText('DUEL',e.x-camX,e.y-camY-20);
  }
  /* player weapon hint */
  if(G.equip==='sword'){
    const px2=p.x+Math.cos(p.dir)*15-camX,py2=p.y+Math.sin(p.dir)*15-camY;
    ctx.strokeStyle='#c8d6ff';ctx.lineWidth=2;
    ctx.beginPath();ctx.moveTo(p.x+Math.cos(p.dir)*11-camX,p.y+Math.sin(p.dir)*11-camY);
    ctx.lineTo(px2,py2);ctx.stroke();
  }else if(G.equip==='bow'){
    const bx=p.x+Math.cos(p.dir)*13-camX,by=p.y+Math.sin(p.dir)*13-camY;
    ctx.strokeStyle='#ffd166';ctx.lineWidth=1.5;
    ctx.beginPath();ctx.arc(bx,by,5,Math.atan2(-Math.sin(p.dir),-Math.cos(p.dir))-1,Math.atan2(-Math.sin(p.dir),-Math.cos(p.dir))+1);ctx.stroke();
  }
  if(G.player.attackFx>0){G.player.attackFx-=0.02;ctx.strokeStyle='rgba(255,255,255,'+G.player.attackFx*4+')';ctx.lineWidth=2;ctx.beginPath();ctx.arc(p.x-camX,p.y-camY,18,0,6.283);ctx.stroke();}
  /* build ghost */
  if(G.buildMode){
    ctx.fillStyle='rgba(62,230,255,.25)';
    const tx=Math.floor(p.x/TILE),ty=Math.floor(p.y/TILE);
    ctx.fillRect(tx*TILE-camX,ty*TILE-camY,TILE,TILE);
  }
  /* night overlay — light mask: le luci (giocatore, pal, falò, lanterne, bed, boss, rift) bucano l'oscurità */
  if(G.time>0.6){
    const a=clamp((G.time-0.6)/0.4,0,1)*0.78;
    if(!lightCv){lightCv=document.createElement('canvas');}
    lightCv.width=CW;lightCv.height=CH;
    const lc=lightCv.getContext('2d');
    lc.clearRect(0,0,CW,CH);
    lc.fillStyle='rgba(6,8,26,'+a.toFixed(2)+')';
    lc.fillRect(0,0,CW,CH);
    lc.globalCompositeOperation='destination-out';
    const light=(x,y,r)=>{
      if(x<-r||y<-r||x>CW+r||y>CH+r)return;
      const g=lc.createRadialGradient(x,y,0,x,y,r);
      g.addColorStop(0,'rgba(0,0,0,1)');
      g.addColorStop(0.55,'rgba(0,0,0,0.9)');
      g.addColorStop(1,'rgba(0,0,0,0)');
      lc.fillStyle=g;lc.beginPath();lc.arc(x,y,r,0,6.283);lc.fill();
    };
    light(p.x-camX,p.y-camY,150);
    const ap2=G.team[G.active];
    if(ap2)light(ap2.x-camX,ap2.y-camY,110);
    for(const b of G.buildings){
      if(b.id==='campfire')light(b.x-camX,b.y-camY,135);
      else if(b.id==='lantern')light(b.x-camX,b.y-camY,120);
      else if(b.id==='bed')light(b.x-camX,b.y-camY,70);
      else if(b.id==='workbench')light(b.x-camX,b.y-camY,55);
      else if(b.id==='chest')light(b.x-camX,b.y-camY,45);
    }
    if(G.rift)light(G.rift.x-camX,G.rift.y-camY,95);
    for(const w of G.wilds)if(w.isBoss)light(w.x-camX,w.y-camY,85);
    lc.globalCompositeOperation='source-over';
    ctx.drawImage(lightCv,0,0);
  }
  /* weather overlays */
  const wt=performance.now()/1000;
  if(G.weather==='rain'){
    ctx.strokeStyle='rgba(120,170,255,.28)';ctx.lineWidth=1;
    for(let i=0;i<60;i++){
      const sx=(i*97+(wt*700)%CW)%CW,sy=(i*53+(wt*900)%CH)%CH;
      ctx.beginPath();ctx.moveTo(sx,sy);ctx.lineTo(sx-8,sy+18);ctx.stroke();
    }
  }else if(G.weather==='sandstorm'){
    ctx.fillStyle='rgba(201,163,95,.16)';ctx.fillRect(0,0,CW,CH);
    ctx.strokeStyle='rgba(240,200,130,.25)';ctx.lineWidth=2;
    for(let i=0;i<30;i++){
      const sx=((i*173+(wt*1000)%CW)%CW),sy=((i*61+(wt*600)%CH)%CH);
      ctx.beginPath();ctx.moveTo(sx,sy);ctx.lineTo(sx+40,sy+4);ctx.stroke();
    }
  }else if(G.weather==='aurora'){
    const g=ctx.createLinearGradient(0,0,0,CH*0.5);
    g.addColorStop(0,'rgba(62,230,255,.20)');g.addColorStop(0.5,'rgba(255,95,158,.10)');g.addColorStop(1,'rgba(82,255,158,0)');
    ctx.fillStyle=g;ctx.fillRect(0,0,CW,CH*0.5);
    ctx.strokeStyle='rgba(160,240,255,.35)';ctx.lineWidth=3;
    for(let i=0;i<5;i++){
      ctx.beginPath();
      for(let x=0;x<=CW;x+=40){
        const y=CH*0.12+i*22+Math.sin(x*0.01+wt*0.5+i)*8;
        x===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
      }
      ctx.stroke();
    }
  }
  /* eclissi: velo viola pulsante + sole morso */
  if(G.event&&G.event.type==='eclipse'){
    const p=Math.sin(performance.now()/250);
    ctx.fillStyle='rgba(40,10,60,'+(0.28+0.12*(p+1)/2)+')';
    ctx.fillRect(0,0,CW,CH);
    const ex=CW*0.82,ey=CH*0.14;
    ctx.fillStyle='#3a1020';
    ctx.beginPath();ctx.arc(ex,ey,34,0,6.283);ctx.fill();
    ctx.fillStyle='#ff7a3f';
    ctx.beginPath();ctx.arc(ex+14,ey,30,0,6.283);ctx.fill();
    ctx.strokeStyle='rgba(255,122,63,.7)';ctx.lineWidth=3;
    ctx.beginPath();ctx.arc(ex+14,ey,34+p*3,0,6.283);ctx.stroke();
  }
  /* meteore (evento) */
  if(G.event&&G.event.type==='meteor'){
    for(let i=0;i<8;i++){
      const mx=((i*211+wt*1400)%CW),my=((i*97+(wt*1800)%CH)%CH);
      ctx.strokeStyle='rgba(255,209,102,.7)';ctx.lineWidth=2;
      ctx.beginPath();ctx.moveTo(mx,my);ctx.lineTo(mx-22,my+34);ctx.stroke();
      ctx.fillStyle='#ffd166';
      ctx.beginPath();ctx.arc(mx,my,2.5,0,6.283);ctx.fill();
    }
  }
}
/* minimap */
const mm=$('minimap'),mmx=mm.getContext('2d');
function renderMinimap(){
  const S=mm.width,scale=G.flying?1.5:3;
  mmx.clearRect(0,0,S,S);
  const cxp=clamp(G.player.x/TILE/WORLD_T,0,1),cyp=clamp(G.player.y/TILE/WORLD_T,0,1);
  const half=S/2/scale;
  for(let y=0;y<S;y++)for(let x=0;x<S;x++){
    const tx=Math.floor(G.player.x/TILE+(x-S/2)/scale);
    const ty=Math.floor(G.player.y/TILE+(y-S/2)/scale);
    if(tx<0||ty<0||tx>=WORLD_T||ty>=WORLD_T){mmx.fillStyle='#0b1020';mmx.fillRect(x,y,1,1);continue;}
    mmx.fillStyle=BIOME_COL[biomeAt(tx,ty)];
    mmx.fillRect(x,y,1,1);
  }
  mmx.fillStyle='#fff';
  mmx.fillRect(S/2-1,S/2-1,2,2);
  const mark=(x,y,col,sz)=>{
    const bx=S/2+(x-G.player.x)/TILE/scale,by=S/2+(y-G.player.y)/TILE/scale;
    if(bx>-sz&&bx<S+sz&&by>-sz&&by<S+sz){mmx.fillStyle=col;mmx.fillRect(bx-sz,by-sz,sz*2+1,sz*2+1);}
  };
  for(const b of G.buildings)mark(b.x,b.y,'#ffd166',1);
  for(const r of G.ruins)mark(r.x,r.y,'#b28dff',1);
  for(const b of G.bosses)mark(b.x,b.y,'#ff3355',2);
  if(G.trader)mark(G.trader.x,G.trader.y,'#ffd166',2);
  if(G.trainer)mark(G.trainer.x,G.trainer.y,'#ff5f6d',2);
  if(G.rift)mark(G.rift.x,G.rift.y,'#c26bff',2);
  if(G.dungeon)mark(G.dungeon.x,G.dungeon.y,'#8a5a20',2);
}

/* ================= MAIN ================= */
let lastT=0,saveTimer=0,chirpT=0,aiFrame=0;
function loop(t){
  requestAnimationFrame(loop);
  const dt=Math.min(0.05,(t-(lastT||t))/1000);lastT=t;
  if(!G.running)return;
  moveInput(dt);
  updateProjectiles(dt);
  updateActivePal(dt);
  updateTime(dt);
  updateWeather(dt);
  updateHunger(dt);
  updateWorkPals(dt);
  updateFarms(dt);
  updateRanches(dt);
  updateDungeon(dt);
  updateTower(dt);
  updateFishing(dt);
  updateBiomeVoice();
  if(G.speedrun&&G.speedrun.on)G.speedrun.elapsed+=dt;
  updateEvent(dt);
  updateTrader(dt);
  updateTrainer(dt);
  updateTrainerDuel(dt);
  updateMira(dt);
  updateBram(dt);
  updateFinalBoss(dt);
  SFX.ambientTick(dt);
  /* chirp dei selvatici vicini (sottile) */
  chirpT-=dt;
  if(chirpT<=0){chirpT=0.9;if(SFX.enabled&&Math.random()<0.5){const near=G.wilds.filter(w=>dist(w,G.player)<10*TILE);if(near.length)SFX.chirp(hashSeed(near[0].id));}}
  /* wild AI — a step alternati per performance (metà dei wild per frame) */
  for(let i=0;i<G.wilds.length;i++){
    const w=G.wilds[i];
    if(!w.isDuel&&(i+aiFrame)%2===1)continue;
    const d=dist(w,G.player);
    if(w.isDuel){ /* nemico del duello: insegue il Pal attivo */
      const ap=G.team[G.active];
      if(ap){
        const da=dist(w,ap);
        w.dir=Math.atan2(ap.y-w.y,ap.x-w.x);
        const spd=speciesOf(w.id).spd*60*dt;
        let nx=w.x+Math.cos(w.dir)*spd,ny=w.y+Math.sin(w.dir)*spd;
        if(!solidAt(nx,ny)){w.x=nx;w.y=ny;}
        if(da<1.2*TILE&&!G.flying){ap.hp-=w.atk*0.8*dt*diffMult('dmgIn');if(ap.hp<=0){ap.hp=ap.maxHp*0.5;toast('😵 Your Pal fainted — Duel lost','var(--red)');G.duel=null;G.wilds.splice(G.wilds.indexOf(w),1);break;}}
      }
      continue;
    }
    if(w.isFinal){ /* Void Sovereign: chase da lontano, attacco pesante */
      w.state='chase';
      w.dir=Math.atan2(G.player.y-w.y,G.player.x-w.x);
      const spd=w.spd*55*dt;
      let nx=w.x+Math.cos(w.dir)*spd,ny=w.y+Math.sin(w.dir)*spd;
      if(!solidAt(nx,ny)){w.x=nx;w.y=ny;}
      if(d<2.2*TILE){G.player.hp-=w.atk*0.75*dt*diffMult('dmgIn');if(G.player.hp<=0)faint();}
      continue;
    }
    if(w.isBoss&&d<8*TILE)w.state='chase';
    else if(d<3*TILE){w.state='chase';w.dir=Math.atan2(G.player.y-w.y,G.player.x-w.x);}
    else if(w.state==='chase'&&d>6*TILE)w.state='wander';
    if(w.state==='chase'){
      const sp=speciesOf(w.id);
      const spd=sp.spd*60*dt;
      let nx=w.x+Math.cos(w.dir)*spd,ny=w.y+Math.sin(w.dir)*spd;
      if(!solidAt(nx,ny)){w.x=nx;w.y=ny;}
      if(d<1.3*TILE&&!G.flying){ /* attack player (mai in volo) */
        G.player.hp-=w.atk*0.6*dt*diffMult('dmgIn');
        if(G.player.hp<=0)faint();
      }
    }else{w.dir+= (Math.random()-0.5)*0.6;const sp=speciesOf(w.id);let nx=w.x+Math.cos(w.dir)*sp.spd*30*dt,ny=w.y+Math.sin(w.dir)*sp.spd*30*dt;if(!solidAt(nx,ny)){w.x=nx;w.y=ny;}}
  }
  aiFrame++;
  /* spawn */
  if(Math.random()<dt*1.5*SEASONS[curSeason()].spawnMult)spawnWild();
  /* heal player slowly */
  if(G.player.hp<G.player.maxHp&&G.time<0.6)G.player.hp=Math.min(G.player.maxHp,G.player.hp+1*dt);
  /* auto-use potion when low */
  if((G.inv.potion||0)>0&&G.player.hp<G.player.maxHp*0.5){
    G.player.hp=Math.min(G.player.maxHp,G.player.hp+60);
    G.inv.potion--;toast('🧪 Potion used','var(--green)');
  }
  /* night: campfire heal */
  for(const b of G.buildings)if(b.id==='campfire'&&dist(b,G.player)<4*TILE)G.player.hp=Math.min(G.player.maxHp,G.player.hp+4*dt);
  /* save */
  saveTimer+=dt;
  if(saveTimer>10){saveTimer=0;try{localStorage.setItem(SAVE_KEY,JSON.stringify({seed:G.seed,player:G.player,sph:G.sph,inv:G.inv,chest:G.chestInv,team:G.team,active:G.active,dex:G.dex,seen:G.seen,time:G.time,day:G.day,buildings:G.buildings,quests:G.quests,bosses:G.bosses,hunger:G.hunger,weather:G.weather,weatherT:G.weatherT,equip:G.equip,farms:G.farms,complete:G.complete,customs:G.customs,stat:G.stat,memories:G.memories,diff:G.diff,mode:G.mode,speedrun:G.speedrun}));}catch(e){}}
  render();
  G.minimapT-=dt;
  if(G.minimapT<=0){G.minimapT=0.25;renderMinimap();}
  refreshHud();
  checkAch();
}
function faint(){
  if(G.respawn)return;
  if(G.mode==='zen'){G.player.hp=Math.max(1,G.player.hp);return;} /* sandbox: non si muore */
  G.respawn=true;$('respawn').classList.add('on');
  G.stat.deaths++;
  stylePush('death');
  if(G.stat.deaths===1)playCutscene('death_first');
  G.player.hp=0;
}
$('btnRespawn').onclick=()=>{
  G.respawn=false;$('respawn').classList.remove('on');
  const bed=G.buildings.find(b=>b.id==='bed');
  if(bed){G.player.x=bed.x;G.player.y=bed.y;}
  G.player.hp=G.player.maxHp;
};

/* ================= STORY INTRO ================= */
const STORY=[
 {bg:'#0b1020',col:'#3ee6ff',shape:0,txt:'Somewhere between the last snowmelt and the first star, there is a world made of light.'},
 {bg:'#0b1020',col:'#52c96b',shape:1,txt:'My sister <span class="lina">Lina</span> drew creatures in her notebook every night — orbs, stars, triangles with round eyes. "They\'re real," she whispered. "They\'re waiting for me."'},
 {bg:'#160f2e',col:'#c26bff',shape:4,txt:'She never got to see them. The winter took her on her 12th birthday — the same night the sky tore open, and the <b>Void Sovereign</b> crawled out of the wound.'},
 {bg:'#0b1020',col:'#ffd166',shape:5,txt:'I found her notebook in the attic. Thirty species, sketched by candlelight. Names in the margins. Little hearts next to her favourites.'},
 {bg:'#0b1020',col:'#3ee6ff',shape:2,txt:'So I came to the wilds. To catch every creature she drew. To see them through her eyes. To close the rift she left behind.'},
 {bg:'#0b1020',col:'#52ff9e',shape:0,txt:'Every Pal you catch is a memory she never got to make. Every quest, a promise kept. Every night survived, a candle kept burning.'},
 {bg:'#0b1020',col:'#c26bff',shape:0,txt:'The world remembers her. Let it remember you too.'},
 {bg:'#0b1020',col:'#ffb8dc',shape:1,txt:'<b style="font-size:clamp(28px,7vw,46px);letter-spacing:4px;background:linear-gradient(90deg,var(--cyan),var(--violet),var(--gold));-webkit-background-clip:text;background-clip:text;color:transparent">POCKET WILD</b><br><span style="color:var(--dim);font-size:13px;letter-spacing:2px">Catch. Build. Mutate. Remember.</span>'}
];
let storyI=0;
function drawStory(){
  const s=STORY[storyI];
  const cv=$('storyCv'),c=cv.getContext('2d');
  c.clearRect(0,0,cv.width,cv.height);
  const g=c.createRadialGradient(110,70,8,110,110,160);
  g.addColorStop(0,s.col);g.addColorStop(0.35,'rgba(62,230,255,.18)');g.addColorStop(1,s.bg);
  c.fillStyle=g;c.fillRect(0,0,cv.width,cv.height);
  /* stelle */
  c.fillStyle='rgba(255,255,255,.5)';
  for(let i=0;i<26;i++){
    const sx=(i*53+17)%cv.width,sy=(i*37+11)%cv.height;
    c.fillRect(sx,sy,1.4,1.4);
  }
  drawPalShape(c,110,112,46,s.col,s.shape,0.5,1);
  c.fillStyle='rgba(0,0,0,.4)';c.fillRect(70,168,80,6);
  const dots=$('storyDots');dots.innerHTML='';
  STORY.forEach((_,i)=>{const d=document.createElement('i');if(i===storyI)d.className='on';dots.appendChild(d);});
  const txt=$('storyTxt');
  txt.innerHTML=s.txt;
  txt.classList.remove('in');
  requestAnimationFrame(()=>requestAnimationFrame(()=>txt.classList.add('in')));
  $('btnStoryNext').textContent=storyI<STORY.length-1?'Continue ▶':'Begin the journey ✦';
}
function storyNext(){
  if(storyI<STORY.length-1){storyI++;drawStory();}
  else skipStory();
}
function skipStory(){$('story').classList.remove('on');$('start').style.display='flex';}
function showStory(){storyI=0;$('story').classList.add('on');drawStory();}
$('btnStoryNext').onclick=storyNext;
$('storySkip').onclick=e=>{e.stopPropagation();skipStory();};
$('story').addEventListener('click',e=>{if(e.target.id!=='storySkip')storyNext();});


/* ================= CUTSCENES — MORTE E REDENZIONE =================
   "La memoria involontaria" (Proust): certi atti risvegliano il passato.
   "La sofferenza è l'origine della coscienza" (Dostoevskij): la colpa si
   redime solo attraversandola. "I morti non se ne vanno; cambiano l'acqua
   ai fiori" (Valerie Perrin): ogni cura è una preghiera laica. */
const CUTSCENES={
 first_catch:[
  ['NARRATOR','The first Pal you catch is a Grassling — the one she drew on the very first page of the notebook.'],
  ['LINA','His name is Pebble. He gets scared of thunder. Be patient with him.'],
  ['NARRATOR','You had forgotten you could still hear her voice this clearly. That is the cruelest thing about the dead — they stay.']
 ],
 first_evolve:[
  ['NARRATOR','Growth, she wrote in the margin of page thirty-one, is just grief that learned how to move.'],
  ['LINA','See? Nothing stays small forever. Not even winter. Not even me.'],
  ['NARRATOR','The old shell falls away. Something underneath has been patient for a very long time.']
 ],
 day7:[
  ['NARRATOR','Day seven. The smell of wet wool and burnt sugar — the kitchen of that house, and you are seven years old again.'],
  ['YOU','I hate you! I wish the world would just STOP!'],
  ['LINA','Don\'t say that. Please. You don\'t mean it. You never mean it.'],
  ['NARRATOR','But the world heard you. That night the sky tore open, and the winter that took her was the winter you had wished for.'],
  ['LINA','It\'s okay. It was never your fault. It was never you.'],
  ['NARRATOR','You have been running from this memory for years. Tonight it found you. This place is a long hallway of things you said — and every door is a word you never took back.'],
  ['NARRATOR','Dostoevsky wrote that suffering is the origin of consciousness. You are beginning to understand what he meant.']
 ],
 alpha_first:[
  ['NARRATOR','The Alpha falls. Its heart is a stone the size of a fist — the size of a grudge.'],
  ['MIRA','Every grudge you bury becomes a creature, dear. Feed them enough pain and they grow crowns. She knew that. She forgave anyway.'],
  ['NARRATOR','You hold the stone. It is warm. It is almost — sorry.']
 ],
 eclipse:[
  ['NARRATOR','The eclipse is not the world going dark. It is the world showing you what you did, one slow breath at a time.'],
  ['LINA','Look at the echoes. They\'re your memories, wearing their best clothes, coming to say hello.'],
  ['NARRATOR','The Void does not hate you. It is only grief with claws, and it has been waiting all these years to be held.']
 ],
 tower_champion:[
  ['NARRATOR','At the top of the tower, the Champion wears a small crown — a paper one, the kind a child folds in class when she is bored.'],
  ['LINA','I bet you could reach the top. I bet you\'d be brave. I bet you\'d come back.'],
  ['NARRATOR','You reach out and take the paper crown. It fits. It always did.']
 ],
 fishing:[
  ['NARRATOR','The water remembers everything. Every tear, every rain, every winter that ever tried to be kind.'],
  ['LINA','She used to say the sea was just the sky that got tired of falling.'],
  ['NARRATOR','You pull the line, and something silver and afraid comes up into the light — and for a second, you are not afraid of it.']
 ],
 flight:[
  ['NARRATOR','From up here the world is small and forgiven — all the sharp edges filed soft by distance.'],
  ['LINA','If you ever learn to fly, don\'t come back for me. Come back for you.'],
  ['NARRATOR','The wind carries the smell of wet wool and burnt sugar. This time, it does not hurt.']
 ],
 death_first:[
  ['NARRATOR','You fall. The dark is not unkind — it is only dark.'],
  ['LINA','Somewhere a girl is drawing you, waking up. She draws everyone she loves waking up.'],
  ['NARRATOR','You wake at the bed, whole. She was right. She was always right.'],
  ['NARRATOR','That is what redemption is, you think — not never falling. Being drawn awake, over and over, by someone who refused to stop believing.']
 ],
 confession:[
  ['NARRATOR','The rift is not a door. It is a question you have been avoiding since you were seven.'],
  ['YOU','I\'m sorry. I\'m sorry. I\'m sorry.'],
  ['LINA','Then put it down. Walk through. There\'s only one thing in there, and it\'s the you that said it.'],
  ['NARRATOR','Proust wrote that the only true paradise is the paradise we have lost. Tonight you walk into yours, weapon in hand, heart in throat.'],
  ['LINA','Come find me on the other side. I\'ll be the one drawing.']
 ],
 redemption:[
  ['NARRATOR','The Sovereign dissolves — not into dust, but into light. It was never a monster. It was a seven-year-old\'s anger, grown lonely in the dark.'],
  ['LINA','You did it. You came back through the whole winter to find me.'],
  ['YOU','I\'d do it a thousand times.'],
  ['LINA','I know. That\'s why I drew you. That\'s why I always will.'],
  ['NARRATOR','Valerie Perrin would say the dead don\'t leave; they just change the water of the flowers. The winter is over. The garden is yours.'],
  ['NARRATOR','Somewhere, in a kitchen that smells of wet wool and burnt sugar, a kettle sings — and nobody wishes the world to stop. Not anymore.']
 ]
};
const CUT={queue:[],i:0,timer:null,typing:false,onDone:null,wasRunning:true};
function playCutscene(id,onDone){
  if(SILENT)return;
  if(G.memories&&G.memories[id])return;
  if(!CUTSCENES[id])return;
  G.memories[id]=1;saveGame();
  CUT.queue=CUTSCENES[id].map(l=>({who:l[0],txt:l[1]}));
  CUT.i=0;CUT.onDone=onDone||null;
  CUT.wasRunning=G.running;
  G.running=false; /* pausa il mondo: il tempo passa solo nei ricordi */
  $('cutscene').classList.add('on');
  showCutLine();
}
function showCutLine(){
  const l=CUT.queue[CUT.i];
  const sp=$('cutSpeaker'),ln=$('cutLine');
  sp.textContent=l.who==='NARRATOR'?'🎙 NARRATOR':('💬 '+l.who);
  sp.className='speaker '+l.who;
  ln.textContent='';
  CUT.typing=true;
  let k=0;
  if(globalThis.__TEST__){ln.textContent=l.txt;CUT.typing=false;return;} /* test: niente timer */
  CUT.timer=setInterval(()=>{
    k++;
    ln.textContent=l.txt.slice(0,k);
    if(k>=l.txt.length){clearInterval(CUT.timer);CUT.typing=false;SFX.quest();}
  },16);
}
function cutNext(){
  if(CUT.typing){ /* completa la riga corrente */
    const l=CUT.queue[CUT.i];
    $('cutLine').textContent=l.txt;
    if(CUT.timer){clearInterval(CUT.timer);CUT.timer=null;}
    CUT.typing=false;
    return;
  }
  CUT.i++;
  if(CUT.i>=CUT.queue.length){
    $('cutscene').classList.remove('on');
    G.running=CUT.wasRunning;
    if(CUT.onDone){const fn=CUT.onDone;CUT.onDone=null;fn();}
    return;
  }
  showCutLine();
}
$('cutscene').addEventListener('click',cutNext);

/* ================= VOCI PER BIOMA (whisper del narratore) ================= */
const BIOME_WHISPERS={
 grass:'Grass, she wrote, is the colour of a promise kept.',
 forest:'The forest keeps her drawings — the ones she never finished.',
 desert:'Desert. She said the dunes were the world holding its breath.',
 snow:'Snow. Be careful here. This is where the winter lives.',
 ocean:'The sea. The sky that got tired of falling.',
 volcano:'Volcano. The earth\'s anger — patient and warm. Not like yours.',
 crystal:'Crystals. She said they hum her song when the moon is out. Listen.'
};
let whisperTimer=null;
function whisper(txt){
  if(SILENT)return;
  const w=$('whisper');
  w.innerHTML='<span class="w">🎙</span> '+txt;
  w.classList.add('in');
  if(whisperTimer)clearTimeout(whisperTimer);
  whisperTimer=setTimeout(()=>w.classList.remove('in'),6000);
}
function updateBiomeVoice(){
  if(!G.running||SILENT)return;
  const bm=biomeAt(Math.floor(G.player.x/TILE),Math.floor(G.player.y/TILE));
  if(bm===G.lastBiome)return;
  G.lastBiome=bm;
  if(!G.stat.biomeVoices)G.stat.biomeVoices={};
  if(!G.stat.biomeVoices[bm]&&BIOME_WHISPERS[bm]){
    G.stat.biomeVoices[bm]=1;
    whisper(BIOME_WHISPERS[bm]);
  }
}

/* ================= LA VOCE DEL SOVEREIGN (in battaglia) ================= */
let bossVoiceTimer=null;
function sovereignSays(txt){
  if(SILENT)return;
  const b=$('bossvoice');
  b.innerHTML='<span class="s">THE SOVEREIGN</span> — '+txt;
  b.classList.add('in');
  if(bossVoiceTimer)clearTimeout(bossVoiceTimer);
  bossVoiceTimer=setTimeout(()=>b.classList.remove('in'),4200);
  try{SFX.tone(70,0.8,'sawtooth',0.02,0,55);}catch(e){}
  G.lastBossVoice=txt; /* per i test */
}

/* ================= DIARIO DI LINA (33 pagine) ================= */
const LINA_NOTES={
 grassling:'Page 1. Pebble. He gets scared of thunder, so I drew him a storm-proof smile. He was the first one I ever saw.',
 bushelder:'Pebble grew thorns. I told him he didn\'t have to be soft to be loved. He believed me, mostly.',
 groveheart:'The heart of the forest. I heard it beat once, from very far away. It was warm, like a kitchen.',
 emberpup:'Emberpup. Warm as toast. I kept him under my bed on cold nights and pretended I wasn\'t lonely.',
 flarefang:'He learned to bite before he learned to forgive. Some of us do. I drew him a gentler jaw.',
 magmalord:'The lord of the dunes. He carries a whole summer inside his chest. I want to be that warm.',
 frostbite:'Frostbite. Cold as a whisper. I drew him a scarf and he let me.',
 glaciowl:'He hunts under auroras. I think he\'s looking for something too. I think we all are.',
 blizzarion:'A walking storm. When I\'m scared I draw him calm. Drawing is the only way I know to calm things.',
 puddlin:'Puddlin! Made of rain. I named her after the sound of shoes in April.',
 torrentail:'He swims through sand. I don\'t know how that works. I drew it anyway — that\'s what sisters do, they draw what they don\'t understand.',
 duskbat:'Only comes out at night. Like my brother\'s moods. I love him anyway. Both of them.',
 nightwing:'Silent over the dark. If I could fly, I\'d be him — and I\'d come back every morning just to say good morning.',
 sparklet:'SPARKLET. ♥♥♥ My absolute favourite. Static on four legs. I once made him spark on purpose to light the hallway.',
 sporeling:'A glowing mushroom. I asked him to glow when I\'m afraid. He glows for everyone, but I pretend it\'s for me.',
 fungalord:'Warden of the fungal wood. He looks scary. So does my brother when he\'s sad. Neither of them means it.',
 cindercrab:'He clacks with embers. I drew him a tiny crown. Every crab deserves a crown.',
 snowhare:'Bounces on powder. I threw a snowball at him once and he forgave me instantly. I want to be that.',
 frosthoof:'His hooves freeze ponds. When the world is too loud I imagine his quiet. It helps.',
 tideling:'Tides follow her. I think she\'s the sea\'s daughter. I think the sea is sad too, sometimes.',
 voltmouse:'He chews through cables. He ate my lamp cord and I laughed for an hour. Grief does that — it laughs when it can.',
 glimmerfly:'A living aurora mote. ♥ I caught him in a jar once and let him go the same night. Some things you only keep by letting go.',
 bloompuff:'Spring. She blooms where the winter cried. I would know. I cried here once.',
 suncub:'Summer. He basks and forgives everyone by noon. I\'m learning from him.',
 maplewisp:'Autumn. He rides the wind that takes the leaves. He says falling isn\'t losing — it\'s painting.',
 snowfawn:'Winter. He only comes in deep winter, like the end of a story. But winter always ends. That\'s the whole point.',
 lavad:'Molten to the core. I told him his anger was allowed to exist. Nobody told me that, so I tell everyone.',
 ashmoth:'Ash is just a thing that was burning and is now remembering. ♥',
 crystalmite:'A living shard. Sharp outside, light inside. I drew him a softer edge and he kept the light.',
 prismoth:'Bends starlight. ♥ My other favourite. If I could give you one creature to find, it would be him.',
 finling:'The first one I ever dreamed about. ♥ The sea remembered me before I remembered it.',
 jellyvolt:'She lights up the deep. I\'m afraid of the deep. She says the dark is only unlit.',
 abyssoul:'He remembers the surface world. I will remember it too. That\'s what I\'m for.'
};
const DIARY_FAVOURITES=['grassling','sparklet','glimmerfly','ashmoth','prismoth','finling'];
function diaryPageState(sp){
  if(G.seen[sp.id])return G.dex[sp.id]?'caught':'seen';
  return 'locked';
}
function renderDiary(){
  const box=$('diaryGrid');box.innerHTML='';
  const detail=$('diaryDetail');detail.classList.remove('on');detail.innerHTML='';
  let seen=0,caught=0;
  const grid=document.createElement('div');grid.className='dexgrid';
  SPECIES.forEach((sp,i)=>{
    const st=diaryPageState(sp);
    if(st!=='locked')seen++;
    if(st==='caught')caught++;
    const cell=document.createElement('div');cell.className='dpage'+(st==='locked'?'':'');
    const cv=document.createElement('canvas');cv.width=44;cv.height=44;
    const c=cv.getContext('2d');
    if(st==='locked'){
      c.fillStyle='rgba(138,146,200,.25)';c.beginPath();c.arc(22,24,12,0,6.283);c.fill();
      c.fillStyle='rgba(138,146,200,.5)';c.font='10px sans-serif';c.textAlign='center';c.fillText('?',22,27);
    }else{
      drawPalShape(c,22,24,12,sp.col,sp.shape,0.5,1);
    }
    cell.appendChild(cv);
    const nm=document.createElement('div');nm.className='dn';nm.textContent=st==='locked'?('Page '+(i+1)):sp.n+(DIARY_FAVOURITES.includes(sp.id)?' ♥':'');
    const ds=document.createElement('div');ds.className='ds';ds.textContent=st==='locked'?'locked':(st==='caught'?'caught':'sketch');
    cell.appendChild(nm);cell.appendChild(ds);
    cell.onclick=()=>{
      detail.classList.add('on');
      if(st==='locked'){detail.innerHTML='<div class="pg">Page '+(i+1)+' of 33</div><div style="color:var(--dim)">Still sealed. Go find this one in the wilds — she drew it for a reason.</div>';return;}
      detail.innerHTML='<div class="pg">Page '+(i+1)+' of 33'+(DIARY_FAVOURITES.includes(sp.id)?' · ♥ favourite':'')+'</div>'+
        '<div style="display:flex;gap:10px;align-items:center;margin:8px 0"><canvas id="diaryCv" width="56" height="56"></canvas><div><b style="color:'+sp.col+'">'+sp.n+'</b> <span class="st">· '+st+' · '+TYPE_ICON[sp.type]+(sp.type2?' '+TYPE_ICON[sp.type2]:'')+'</span></div></div>'+
        '<div class="note">"'+LINA_NOTES[sp.id]+'"</div>'+
        '<div class="st" style="margin-top:8px">— Lina, age 11</div>';
      const dc=detail.querySelector('#diaryCv');if(dc)drawPalShape(dc.getContext('2d'),28,28,16,sp.col,sp.shape,0.5,1);
    };
    grid.appendChild(cell);
  });
  box.appendChild(grid);
  $('diaryCountTxt').textContent=seen+' / '+SPECIES.length+' pages · '+caught+' caught';
}
/* ================= START ================= */
/* spawn sicuro: cerca la prima tile non solida e non oceanica vicino al centro
   (il centro esatto è spesso oceano — bug storico: il player partiva in acqua) */
function findSpawn(){
  const cx=Math.floor(WORLD_T/2),cy=Math.floor(WORLD_T/2);
  for(let r=0;r<240;r++){
    for(let a=0;a<16;a++){
      const tx=cx+Math.round(Math.cos(a/16*6.28)*r),ty=cy+Math.round(Math.sin(a/16*6.28)*r);
      if(tx>1&&ty>1&&tx<WORLD_T-1&&ty<WORLD_T-1&&biomeAt(tx,ty)!=='ocean'&&!solidAt(tx*TILE,ty*TILE)){
        return{x:tx*TILE+8,y:ty*TILE+8};
      }
    }
  }
  return{x:WORLD_PX/2,y:WORLD_PX/2};
}
function newWorld(){
  if(BOT.intv)stopSim();
  const seedStr=$('seedInput').value.trim();
  G.seed=seedStr?hashSeed(seedStr):(Date.now()%100000);
  const sp=findSpawn();
  G.player={x:sp.x,y:sp.y,hp:100,maxHp:100,dir:0,invT:0,attackFx:0};
  G.team=[];G.active=-1;G.dex={};G.wilds=[];G.projectiles=[];
  G.sph=[3,0,0];
  G.inv={grass:0,wood:0,berry:1,stone:0,ess:0,potion:0,arrows:0,sword:0,bow:0,cooked:0,stew:0,seeds:0,scroll:0,coins:0};
  G.chestInv={grass:0,wood:0,berry:0,stone:0,ess:0};
  G.buildings=[];G.farms=[];G.riding=false;G.plantMode=false;
  G.trader=null;G.traderT=0;G.trainer=null;G.trainerT=0;G.mira=null;G.miraT=0;G.bram=null;G.bramT=0;G.miraLine=0;G.dungeon=null;G.duel=null;G.event=null;
  G.seen={};G.minimapT=0;
  G.complete=false;G.rift=null;G.customs=[];G.tower=null;G.fishing=null;G.flying=false;G.memories={};G.lastBiome=null;
  G.speedrun={on:G.mode==='speedrun',elapsed:0};
  if(G.mode==='zen'){ /* sandbox: risorse abbondanti */
    G.inv={grass:999,wood:999,berry:999,stone:999,ess:999,potion:99,arrows:99,sword:1,bow:1,cooked:0,stew:0,seeds:99,scroll:9,coins:999,rod:1,lure:9};
    G.sph=[99,99,99];
    G.equip='sword';
  }
  G.stat={catches:0,evolves:0,eggs:0,trainers:0,alphas:0,splices:0,fusions:0,customs:0,seasonsSeen:{},deaths:0,travel:0,style:{fight:0,gather:0,travel:0,catch:0,death:0},habits:0,eclipse:0,towerWins:0,fished:0,biomeVoices:{}};
  G.time=0.3;G.day=1;
  G.hunger=100;G.weather='clear';G.weatherT=0;G.equip='none';
  $('weathtag').textContent=WEATHER_ICON[G.weather];
  $('complete').classList.remove('on');
  initQuests();
  initBosses();
  initRuins();
  for(const b of G.bosses)G.wilds.push(b); /* Alpha nel mondo */
  if(pendingCustom){spawnCustomWild(pendingCustom);pendingCustom=null;}
  $('start').style.display='none';
  G.running=true;
  saveGame();
  toast('🌍 Welcome to POCKET WILD! Catch your first Pal with 🔮','var(--green)');
}
$('btnNew').onclick=newWorld;
$('btnCont').onclick=()=>{
  if(BOT.intv)stopSim();
  if(loadGame()){
    G.projectiles=[];
    G.dungeon=null;G.duel=null;G.event=null;G.trader=null;G.traderT=0;G.trainer=null;G.trainerT=0;G.mira=null;G.miraT=0;G.bram=null;G.bramT=0;G.riding=false;
    G.minimapT=0;G.rift=null;G.tower=null;G.fishing=null;G.flying=false;
    if(G.speedrun&&G.speedrun.on)$('srBox').style.display='inline-block';
    initRuins();
    for(const b of G.bosses)G.wilds.push(b); /* Alpha nel mondo */
    $('start').style.display='none';
    if(!G.quests||!G.quests.length)initQuests();
    if(!G.complete&&questChapterDone(3)&&!G.rift)maybeSpawnRift();
    if(pendingCustom){spawnCustomWild(pendingCustom);pendingCustom=null;}
    G.running=true;
  }else toast('No save found','var(--red)');
};
/* UI buttons */
$('btnTeam').onclick=()=>togglePanel('pTeam');
$('btnCraft').onclick=()=>togglePanel('pCraft');
$('btnLab').onclick=()=>togglePanel('pLab');
$('btnBuild').onclick=()=>togglePanel('pBuild');
$('btnDex').onclick=()=>togglePanel('pDex');
$('btnDiary').onclick=()=>togglePanel('pDiary');
$('btnAch').onclick=()=>togglePanel('pAch');
$('btnTest').onclick=()=>togglePanel('pTest');
$('btnQuests').onclick=()=>togglePanel('pQuests');
$('btnSave').onclick=saveGame;
$('btnThrow').onclick=()=>throwSphere(0);
$('btnAttack').onclick=attack;
$('btnShoot').onclick=shoot;
$('btnRide').onclick=toggleRide;
$('btnSound').onclick=toggleSound;
$('btnInteract').onclick=interact;
$('btnCompleteCont').onclick=()=>{$('complete').classList.remove('on');};
$('btnCompleteNew').onclick=()=>{$('complete').classList.remove('on');newWorld();};
/* PWA: install prompt + service worker (solo http/https) */
let deferredPrompt=null;
addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;$('btnInstall').style.display='inline-block';});
$('btnInstall').onclick=async()=>{
  if(!deferredPrompt){toast('📲 Install from your browser menu (iOS: Share → Add to Home Screen)','var(--cyan)');return;}
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt=null;$('btnInstall').style.display='none';
};
if('serviceWorker' in navigator&&(location.protocol==='https:'||location.protocol==='http:')){
  navigator.serviceWorker.register('./sw.js').catch(()=>{});
}
/* import Pal condiviso via URL (#pal=…) */
importCustomPal();
/* cinematografica di apertura */
showStory();
document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>b.closest('.panelbox').classList.remove('on'));
/* click world: place build / melee */
canvas.addEventListener('pointerdown',e=>{
  if(G.buildMode){
    tryPlace(G.player.x+(e.clientX-CW/2),G.player.y+(e.clientY-CH/2));
    return;
  }
  if(G.plantMode){
    tryPlant(G.player.x+(e.clientX-CW/2),G.player.y+(e.clientY-CH/2));
    return;
  }
});
/* resume save prompt */
if(localStorage.getItem(SAVE_KEY))$('btnCont').style.display='inline-block';
addEventListener('resize',resize);
resize();
requestAnimationFrame(loop);

/* ================= DIFFICOLTÀ + LINGUA (schermata iniziale) ================= */
function renderOpts(){
  const mr=$('modeRow');mr.innerHTML='';
  for(const k of ['story','zen','speedrun']){
    const b=document.createElement('button');
    b.className='chip'+(G.mode===k?' on':'');
    b.textContent=(k==='story'?'🌍':k==='zen'?'🧘':'⏱️')+' '+t('mode'+k.charAt(0).toUpperCase()+k.slice(1));
    b.onclick=()=>{G.mode=k;renderOpts();};
    mr.appendChild(b);
  }
  $('modeLabel').textContent=t('mode');
  const dr=$('diffRow');dr.innerHTML='';
  for(const k in DIFFS){
    const b=document.createElement('button');
    b.className='chip'+(G.diff===k?' on':'');
    b.textContent=DIFFS[k].icon+' '+t('diff'+k.charAt(0).toUpperCase()+k.slice(1));
    b.onclick=()=>{G.diff=k;renderOpts();};
    dr.appendChild(b);
  }
  const lr=$('langRow');lr.innerHTML='';
  for(const k of ['en','it']){
    const b=document.createElement('button');
    b.className='chip'+(LANG===k?' on':'');
    b.textContent=k==='en'?'🇬🇧 English':'🇮🇹 Italiano';
    b.onclick=()=>{LANG=k;try{localStorage.setItem('pocketwild_lang',k);}catch(e){}applyLang();renderOpts();};
    lr.appendChild(b);
  }
  $('diffLabel').textContent=t('difficulty');
  $('langLabel').textContent=t('language');
  $('diffHelp').textContent=t('diffHelp');
  try{
    const best=parseInt(localStorage.getItem('pocketwild_speedrun_best'))||0;
    const el=$('srBest');
    if(best&&el)el.textContent='⏱️ '+t('modeSpeedrun')+' best: '+Math.floor(best/60)+':'+('0'+(best%60)).slice(-2);
  }catch(e){}
}
function applyLang(){
  const map={btnTeam:'btnTeam',btnCraft:'btnCraft',btnLab:'btnLab',btnBuild:'btnBuild',btnDex:'btnDex',btnQuests:'btnQuests',btnSound:'btnSound',btnTest:'btnTest',btnSave:'btnSave'};
  for(const id in map)$(id).textContent=t(map[id]);
  const panels={pTeam:['📦','team'],pCraft:['🎒','craft'],pLab:['🧬','lab'],pBuild:['🏗','build'],pDex:['📖','dex'],pDiary:['📓','diary'],pAch:['🏆','ach'],pQuests:['📋','quests'],pChest:['📦','chest'],pTrade:['🪙','trade'],pEdit:['🎨','edit'],pTest:['🧪','test'],pSmith:['🔨','smith']};
  for(const pid in panels){
    const el=$(pid);
    if(!el||!el.firstChild||el.firstChild.nodeType!==3)continue;
    el.firstChild.nodeValue=panels[pid][0]+' '+t(panels[pid][1])+' ';
  }
  $('seedInput').placeholder=t('seed');
  const subEl=$('start').querySelector('p');if(subEl)subEl.textContent=t('sub');
  $('btnInteract').textContent=t('interact');
  $('btnNew').textContent=t('newWorld');
  $('btnCont').textContent=t('continue');
  $('storySkip').textContent=t('storySkip');
  $('btnStoryNext').textContent=t('storyNext');
  $('respawn').querySelector('h2').textContent=t('respawnTitle');
  $('respawn').querySelector('p').textContent=t('respawnSub');
  $('btnRespawn').textContent=t('wake');
  $('complete').querySelector('h1').textContent=t('completeTitle');
  $('btnCompleteCont').textContent=t('keepExploring');
  $('btnCompleteNew').textContent=t('newRun');
  refreshHud();
}
/* inizializza lingua dal localStorage e applica */
(function(){
  try{const saved=localStorage.getItem('pocketwild_lang');if(saved&&L[saved])LANG=saved;}catch(e){}
  applyLang();
  renderOpts();
})();

module.exports={enterDungeon,spawnDungeonWave,dungeonTraps,dungeonClearReward,updateDungeon,enterTower,spawnTowerWave,updateTower,makeTrainerTeam,updateTrainer,challengeTrainer,updateTrainerDuel,updateMira,updateBram,talkMira,buyUpgrade,renderSmith,startFishing,updateFishing,reelIn,nearWater,defeatPal,spawnWild,startDuel,renderDex,renderEdit,renderLab,renderAch,renderTest,newWorld,findSpawn,initRuins,initBosses,initQuests,questEvent,questChapterDone,questUnlocked,questReward,maybeSpawnRift,spawnFinalBoss,updateFinalBoss,gameComplete,eclipseMult,startEclipse,spawnEcho,updateEvent,createCustomPal,copyShareLink,spawnCustomWild,importCustomPal,sanitizeCustom,encodePal,decodePal,snapshotG,restoreG,botDecide,botMove,botTick,stepSim,startSim,stopSim,simReport,testGive,seasonForTest,checkAch,saveProfile,gatherMultOf,setSilent,stylePush,maybeImprint,toggleRide,showStory,storyNext,skipStory,drawStory,addSphere,G,SPECIES,CUSTOM_SPECIES,SEASONS,seasonOf,curSeason,anytimePool,weatherFor,updateTime,updateWorkPals,updateFarms,speciesOf,makeWild,makeOwned,scalePal,addXp,TILE,dist,biomeAt,solidAt,circleHitsSolid,hashSeed,mulberry32,clamp,toast,saveGame,xpNeed,TRAITS,TYPES,E,SKILL_POOL,ACH,ACH_DEFS,BOT,RECIPES,STORY,MIRA_LINES,BRAM_LINES,AVERY_LINES,UPGRADES,WORLD_T,BIOMES,HABITS,SEA_POOL,CUTSCENES,playCutscene,cutNext,CUT,renderDiary,whisper,sovereignSays,updateBiomeVoice,BIOME_WHISPERS,LINA_NOTES,DIARY_FAVOURITES,diaryPageState,applyLang,renderOpts,t,setLang,diffMult,DIFFS,L,updateHunger,faint,get pendingCustom(){return pendingCustom;}};