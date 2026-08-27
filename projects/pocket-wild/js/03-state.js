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
    SEED=G.seed; /* la mappa del seed salvato */
    /* migrazione: save vecchi che spawnavano nell'oceano → riporta su terra */
    if(solidAt(G.player.x,G.player.y)||biomeAt(Math.floor(G.player.x/TILE),Math.floor(G.player.y/TILE))==='ocean'){
      const sp=findSpawn();G.player.x=sp.x;G.player.y=sp.y;
    }
    $('weathtag').textContent=WEATHER_ICON[G.weather];
    return true;}catch(e){return false;}
}

