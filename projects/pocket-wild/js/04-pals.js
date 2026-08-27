/* ================= PALS ================= */
function makeWild(species,spawn){
  const lv=1+Math.floor(Math.random()*4);
  const p={id:species.id,x:spawn.x,y:spawn.y,hp:species.hp,lv,atk:species.atk,spd:species.spd,dir:Math.random()*6.28,t:0,state:'wander',cd:0,fx:0,isBoss:false};
  scalePal(p,lv);
  p.maxHp=Math.round(p.maxHp*diffMult('hp'));p.hp=p.maxHp;
  return p;
}
function scalePal(p,lv){p.maxHp=Math.round(p.hp*(1+0.35*(lv-1)));p.hp=p.maxHp;p.atk=Math.round(p.atk*(1+0.3*(lv-1)));}
function makeOwned(species,lv){
  const p={id:species.id,x:G.player.x,y:G.player.y,hp:species.hp,lv,atk:species.atk,spd:species.spd,xp:0,cd:0,genes:{},trait:null,dir:0,work:'follow',wanderD:0,wanderT:0};
  scalePal(p,lv);
  return p;
}
/* Pal custom (sintetizzati dal giocatore o importati da link): speciesOf li risolve per primi */
const CUSTOM_SPECIES={};
function speciesOf(id){return CUSTOM_SPECIES[id]||SPECIES.find(s=>s.id===id);}
function xpNeed(lv){return Math.round(20*Math.pow(lv,1.35));}
function addXp(p,amount){
  p.xp+=Math.round(amount*(p.habitXp||1)); /* abitudine Wanderer: +XP */
  while(p.xp>=xpNeed(p.lv)){
    p.xp-=xpNeed(p.lv);p.lv++;
    const sp=speciesOf(p.id);
    p.maxHp+=6;p.hp=p.maxHp;p.atk+=2;p.spd+=0.06;
    /* evolution */
    if(sp.evTo&&p.lv>=sp.evLv){
      p.id=sp.evTo;
      const nsp=speciesOf(p.id);
      p.maxHp=Math.round(nsp.hp*(1+0.35*(p.lv-1)));
      p.hp=p.maxHp;
      p.atk=Math.round(nsp.atk*(1+0.3*(p.lv-1)));
      SFX.evolve();
      toast('✨ '+nsp.n+' evolved!','var(--gold)');
      G.stat.evolves++;
      questEvent('evolve');
      if(G.stat.evolves===1)playCutscene('first_evolve');
    }
    SFX.level();
    toast('⬆ '+speciesOf(p.id).n+' reached Lv '+p.lv,'var(--green)');
  }
}
/* ================= PLAYSTYLE IMPRINTING =================
   Il motore (o il giocatore vero) lascia "abitudini": le statistiche di stile
   crescono con le tue azioni e ogni ~40 azioni il Pal attivo imprime
   permanentemente l'abitudine dominante. Il gioco impara da te. */
const HABITS=[
 {n:'Brawler',icon:'👊',d:'+15% ATK',e:p=>p.atk=Math.round(p.atk*1.15),k:'fight'},
 {n:'Forager',icon:'🌿',d:'+12% SPD',e:p=>p.spd=Math.round(p.spd*1.12*100)/100,k:'gather'},
 {n:'Wanderer',icon:'🥾',d:'+15% XP gain',e:p=>p.habitXp=1.15,k:'travel'},
 {n:'Collector',icon:'📖',d:'+15% max HP',e:p=>{p.maxHp=Math.round(p.maxHp*1.15);p.hp=p.maxHp;},k:'catch'},
 {n:'Undying',icon:'💀',d:'+20% max HP',e:p=>{p.maxHp=Math.round(p.maxHp*1.2);p.hp=p.maxHp;},k:'death'}
];
function stylePush(k,amt=1){
  if(!G.stat.style)G.stat.style={fight:0,gather:0,travel:0,catch:0,death:0};
  G.stat.style[k]=(G.stat.style[k]||0)+amt;
  maybeImprint();
}
function maybeImprint(){
  const st=G.stat.style;
  const total=(st.fight||0)+(st.gather||0)+(st.travel||0)+(st.catch||0)+(st.death||0);
  const next=(G.stat.habits+1)*40;
  if(total>=next&&G.team.length){
    G.stat.habits++;
    let best=null,bv=-1;
    for(const h of HABITS){if((st[h.k]||0)>bv){bv=st[h.k];best=h;}}
    const cands=G.team.filter(p=>!p.habit);
    if(cands.length){
      const ap=cands[Math.floor(Math.random()*cands.length)];
      ap.habit=best.n;
      best.e(ap);
      toast('🤖 Your '+speciesOf(ap.id).n+' imprinted your style: '+best.icon+' '+best.n+' ('+best.d+')','var(--violet)');
      SFX.evolve();
      saveGame();
    }
  }
}
function dmgCalc(base,type,defType,mult,defType2,weather){
  let m=TYPE_MULT[type][defType]||1;
  if(defType2)m=Math.max(m,TYPE_MULT[type][defType2]||1);
  if(weather==='rain'){if(type==='water')m*=1.25;if(type==='fire')m*=0.8;}
  if(weather==='sandstorm'){if(type==='fire')m*=1.2;if(type==='water')m*=0.85;}
  if(weather==='aurora'){if(type==='ice')m*=1.2;}
  return Math.max(1,Math.round(base*m*(0.85+Math.random()*0.3)));
}
function catchChance(pal,sphereTier){
  const sp=speciesOf(pal.id);
  const base=RARITY_BASE[sp.rar];
  const hpFrac=clamp(pal.hp/pal.maxHp,0,1);
  const rate=base*(1-hpFrac*0.72)*sphereTier.mult;
  return clamp(rate,0.05,0.95);
}

