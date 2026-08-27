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
