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

