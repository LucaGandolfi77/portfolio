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

