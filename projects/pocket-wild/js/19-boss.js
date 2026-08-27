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
