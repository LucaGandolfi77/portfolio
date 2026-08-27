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
