/* ================= GENE LAB ================= */
const TRAITS=[{n:'Swift',d:'+20% speed',e:p=>p.spd*=1.2},{n:'Vampiric',d:'heal on hit',e:p=>p.traitVamp=1},{n:'Berserk',d:'+25% ATK',e:p=>p.atk*=1.25},{n:'Tough',d:'+25% HP',e:p=>{p.maxHp=Math.round(p.maxHp*1.25);p.hp=p.maxHp;}}];
function spliceGene(targetIdx,donorIdx,gene){
  if(G.inv.ess<5){toast('Need 5 🧪 essence','var(--red)');return;}
  const t=G.team[targetIdx],d=G.team[donorIdx];
  if(!t||!d)return;
  G.inv.ess-=5;
  const ts=speciesOf(t.id),ds=speciesOf(d.id);
  if(gene==='hp'){t.maxHp=Math.round(lerp(t.maxHp,ds.hp*(1+0.35*(d.lv-1)),0.3)+Math.random()*6);t.hp=t.maxHp;}
  else if(gene==='atk'){t.atk=Math.round(lerp(t.atk,ds.atk*(1+0.3*(d.lv-1)),0.3)+Math.random()*3);}
  else if(gene==='spd'){t.spd=lerp(t.spd,ds.spd,0.3);}
  else if(gene==='color'){t.spliceCol=ds.col;}
  else if(gene==='trait'){if(!t.trait){const tr=TRAITS[Math.floor(Math.random()*TRAITS.length)];t.trait=tr.n;tr.e(t);toast('🧬 Trait: '+tr.n+' — '+tr.d,'var(--violet)');}else toast('Already has a trait','var(--amber)');}
  toast('🧬 Gene spliced!','var(--violet)');
  G.stat.splices++;
  questEvent('lab');
  saveGame();
}
function fusePals(aIdx,bIdx){
  const a=G.team[aIdx],b=G.team[bIdx];
  if(!a||!b||a.id!==b.id){toast('Fusion needs two Pals of the SAME species','var(--amber)');return;}
  if(G.inv.ess<8){toast('Need 8 🧪 essence','var(--red)');return;}
  G.inv.ess-=8;
  const nl=Math.round((a.lv+b.lv)/2)+1;
  a.lv=clamp(nl,1,50);a.maxHp=Math.round((a.maxHp+b.maxHp)*0.7);a.hp=a.maxHp;a.atk=Math.round((a.atk+b.atk)*0.75);
  G.team.splice(bIdx,1);
  if(G.active>=G.team.length)G.active=G.team.length-1;
  toast('🔀 Fusion complete: stronger '+speciesOf(a.id).n+'!','var(--magenta)');
  G.stat.fusions++;
  questEvent('fusion');
  saveGame();
}

