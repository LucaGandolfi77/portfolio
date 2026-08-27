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
