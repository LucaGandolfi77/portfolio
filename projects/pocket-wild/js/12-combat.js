/* ================= PROJECTILES / CAPTURE ================= */
function throwSphere(tier){
  if((G.sph[tier]||0)<1){toast('No '+SPHERE_TIERS[tier].n+' left — craft more','var(--red)');return;}
  G.sph[tier]--;
  SFX.throw();
  const a=G.player.dir;
  G.projectiles.push({x:G.player.x+Math.cos(a)*10,y:G.player.y+Math.sin(a)*10,vx:Math.cos(a)*300,vy:Math.sin(a)*300,tier,t:0});
}
function updateProjectiles(dt){
  for(let i=G.projectiles.length-1;i>=0;i--){
    const pr=G.projectiles[i];
    pr.x+=pr.vx*dt;pr.y+=pr.vy*dt;pr.t+=dt;
    if(pr.t>1.4){G.projectiles.splice(i,1);continue;}
    let hit=false;
    for(const w of G.wilds){
      if(dist(pr,w)<14){
        hit=true;
        if(pr.kind==='arrow'){
          w.hp-=dmgCalc(12+5*(G.inv.bowLv||0),'void',speciesOf(w.id).type,1,speciesOf(w.id).type2,G.weather);
          w.fx=0.35;
          if(w.hp<=0)defeatPal(w);
        }else{
          if(w.isFinal)continue; /* il boss finale si sconfigge, non si cattura */
          const ch=clamp(catchChance(w,SPHERE_TIERS[pr.tier])*diffMult('catch'),0.01,0.98);
          if(Math.random()<ch){
            const owned=makeOwned(speciesOf(w.id),w.lv);
            G.team.push(owned);
            if(G.active<0)G.active=0;
            G.dex[w.id]=(G.dex[w.id]||0)+1;
            G.seen[w.id]=true;
            G.stat.catches++;
            stylePush('catch');
            if(G.stat.catches===1)playCutscene('first_catch');
            const cbiome=speciesOf(w.id).biome;
            if(cbiome==='volcano')questEvent('catchVolcano');
            else if(cbiome==='crystal')questEvent('catchCrystal');
            G.wilds.splice(G.wilds.indexOf(w),1);
            SFX.catch();
            toast('🎉 Caught '+speciesOf(w.id).n+'! (Lv '+owned.lv+')','var(--green)');
            questEvent('catch');
          }else{SFX.fail();toast('The Pal broke free!','var(--amber)');}
        }
        break;
      }
    }
    if(hit)G.projectiles.splice(i,1);
  }
}

/* ================= COMBAT ================= */
function updateActivePal(dt){
  const ap=G.team[G.active];if(!ap)return;
  if(G.flying)return; /* in volo il Pal non combatte */
  const sp=speciesOf(ap.id);
  /* follow (saltato se stai cavalcando) */
  if(!G.riding){
    const tx=G.player.x-Math.cos(G.player.dir)*16,ty=G.player.y-Math.sin(G.player.dir)*16;
    const dx=tx-ap.x,dy=ty-ap.y,d=Math.hypot(dx,dy)||1;
    ap.x+=dx/d*ap.spd*60*dt*0.5;ap.y+=dy/d*ap.spd*60*dt*0.5;
  }
  /* find target */
  let target=null,bd=5*TILE;
  for(const w of G.wilds){const dd=dist(w,ap);if(dd<bd){bd=dd;target=w;}}
  if(target){
    const dd=dist(target,ap);
    if(dd>0.9*TILE&&!G.riding){ap.x+=((target.x-ap.x)/dd)*ap.spd*60*dt;ap.y+=((target.y-ap.y)/dd)*ap.spd*60*dt;}
    else{
      ap.cd-=dt;
      if(ap.cd<=0){
        /* skill: priorità a quelle insegnate con gli scroll, altrimenti quella di livello */
        let sk=null;
        if((ap.skills||[]).length&&Math.random()<0.5){
          const nm=ap.skills[Math.floor(Math.random()*ap.skills.length)];
          sk=sp.skills.find(s=>s[0]===nm)||sp.skills[Math.min(ap.lv>=8?1:0,sp.skills.length-1)];
        }else sk=sp.skills[Math.min(ap.lv>=8?1:0,sp.skills.length-1)];
        const dmg=Math.round(dmgCalc(sk[1],sp.type,speciesOf(target.id).type,1,speciesOf(target.id).type2,G.weather)*eclipseMult()*diffMult('dmgOut'));
        target.hp-=dmg;target.fx=0.3;ap.cd=sk[2];
        G.stat.style.fight=(G.stat.style.fight||0)+1;
        if(ap.traitVamp)ap.hp=Math.min(ap.maxHp,ap.hp+2);
        if(target.hp<=0)defeatPal(target);
      }
    }
  }
  ap.hp=Math.min(ap.maxHp,ap.hp+2*dt);
}
function defeatPal(w){
  G.wilds.splice(G.wilds.indexOf(w),1);
  if(w.isDuel){
    const tr=G.duel&&G.duel.trainer;
    G.duel=null;
    if(tr){
      tr.idx++;
      if(tr.idx<tr.team.length){
        tr.nextT=1.2;
        toast('🏆 '+tr.name+' calls another Pal!','var(--gold)');
        SFX.catch();
        return;
      }
      tr.defeated=true;tr.rematchT=15;tr.t=25;
      const ess=6+tr.team.length*3,coins=12+tr.team.length*6;
      G.inv.ess+=ess;G.inv.coins=(G.inv.coins||0)+coins;
      const ap=G.team[G.active];
      if(ap)addXp(ap,30);
      toast('🏆 Defeated '+tr.name+'! +'+ess+' essence · +'+coins+' coins','var(--gold)');
      SFX.evolve();
      G.stat.trainers++;
      questEvent('trainer');
      if(tr.name==='Ace Avery')toast('🗡 Ace Avery: '+AVERY_LINES[0],'var(--dim)');
      return;
      return;
    }
    G.inv.ess+=4;G.inv.coins=(G.inv.coins||0)+10;
    toast('🏆 Duel won! +4 essence · +10 coins','var(--gold)');
    SFX.catch();
    return;
  }
  if(w.isFinal){gameComplete();return;}
  G.inv.ess+=w.isBoss?15:(w.echo?7:2);
  if(w.echo)toast('🌒 Echo dissolved: +7 essence','var(--violet)');
  if(w.isBoss){G.stat.alphas++;if(G.stat.alphas===1)playCutscene('alpha_first');toast('🏆 Alpha defeated! +15 essence','var(--gold)');questEvent('boss');}
  else questEvent('defeat');
  const ap=G.team[G.active];
  if(ap)addXp(ap,w.isBoss?60:10+w.lv*3);
}

