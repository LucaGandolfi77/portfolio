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

