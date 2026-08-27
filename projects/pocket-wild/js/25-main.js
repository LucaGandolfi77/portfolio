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

