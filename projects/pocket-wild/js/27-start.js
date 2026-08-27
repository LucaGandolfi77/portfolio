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
