/* ================= CUSTOM PAL EDITOR ================= */
const SHAPE_ICON=['⬤','✿','△','□','◇','★'];
const SKILL_POOL={
 grass:[['Leaf Shot',12,2.0],['Thorn Slam',20,3.0],['Grovequake',36,4.5]],
 fire:[['Ember',12,2.0],['Fire Claw',22,3.0],['Magma Burst',40,4.5]],
 ice:[['Frost Shard',12,2.0],['Glacier Wing',20,3.0],['Avalanche',36,4.5]],
 water:[['Water Jet',12,2.0],['Tide Crash',20,3.0],['Tsunami',36,4.5]],
 void:[['Shadow Lick',12,1.8],['Eclipse Dive',24,3.0],['Void Pulse',38,4.0]]
};
const CUSTOM_COST=20; /* essenza per sintetizzare */
let E={shape:0,col:'#3ee6ff',type:'grass',hp:70,atk:16,spd:1.4,trait:null,skills:[],name:''};
function encodePal(sp){
  const j=JSON.stringify(sp);
  return btoa(unescape(encodeURIComponent(j))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}
function decodePal(s){
  try{
    const b=s.replace(/-/g,'+').replace(/_/g,'/');
    return JSON.parse(decodeURIComponent(escape(atob(b))));
  }catch(e){return null;}
}
function sanitizeCustom(sp){
  if(!sp||typeof sp!=='object')return null;
  sp.shape=clamp(sp.shape|0,0,5);sp.col=typeof sp.col==='string'?sp.col:'#3ee6ff';
  sp.type=TYPES[sp.type]?sp.type:'grass';
  sp.hp=clamp(Math.round(sp.hp)||70,30,130);
  sp.atk=clamp(Math.round(sp.atk)||16,6,34);
  sp.spd=clamp(+sp.spd||1.4,0.9,2.0);
  sp.rar=1;
  if(!Array.isArray(sp.skills))sp.skills=[];
  sp.skills=sp.skills.slice(0,3).filter(s=>Array.isArray(s)&&s.length>=3&&!isNaN(s[1]));
  sp.n=typeof sp.n==='string'&&sp.n.trim()?sp.n.slice(0,18):'Custom';
  sp.trait=TRAITS.some(t=>t.n===sp.trait)?sp.trait:null;
  sp.custom=true;sp.desc='A custom-synthesized Pal.';
  return sp;
}
function createCustomPal(){
  if((G.inv.ess||0)<CUSTOM_COST){toast('Need '+CUSTOM_COST+' 🧪 essence to synthesize','var(--red)');return;}
  if(!E.skills.length){toast('Pick at least 1 skill','var(--amber)');return;}
  G.inv.ess-=CUSTOM_COST;
  const sp=sanitizeCustom({n:E.name||'Custom',col:E.col,shape:E.shape,type:E.type,hp:E.hp,atk:E.atk,spd:E.spd,trait:E.trait,skills:E.skills});
  sp.id='custom_'+hashSeed(sp.n+sp.col+sp.hp+sp.atk+sp.spd+Math.random()).toString(36)+Math.random().toString(36).slice(2,6);
  CUSTOM_SPECIES[sp.id]=sp;G.customs.push(sp);
  const p=makeOwned(sp,1);
  if(sp.trait){const tr=TRAITS.find(t=>t.n===sp.trait);if(tr)tr.e(p);p.trait=sp.trait;}
  G.team.push(p);
  if(G.active<0)G.active=0;
  toast('🧬 '+sp.n+' synthesized!','var(--violet)');
  SFX.evolve();
  G.stat.customs++;
  saveGame();
  renderPanel('pTeam');
}
function copyShareLink(){
  const sp=sanitizeCustom({n:E.name||'Custom',col:E.col,shape:E.shape,type:E.type,hp:E.hp,atk:E.atk,spd:E.spd,trait:E.trait,skills:E.skills});
  const link=location.origin+location.pathname+'#pal='+encodePal(sp);
  const done=()=>toast('🔗 Share link copied!','var(--green)');
  if(navigator.clipboard&&navigator.clipboard.writeText){
    navigator.clipboard.writeText(link).then(done,()=>{const i=document.createElement('input');i.value=link;document.body.appendChild(i);i.select();try{document.execCommand('copy');}catch(e){}i.remove();done();});
  }else{const i=document.createElement('input');i.value=link;document.body.appendChild(i);i.select();try{document.execCommand('copy');}catch(e){}i.remove();done();}
}
function spawnCustomWild(sp){
  for(let t=0;t<80;t++){
    const a=Math.random()*6.28,d=6+Math.random()*8;
    const x=G.player.x+Math.cos(a)*d*TILE,y=G.player.y+Math.sin(a)*d*TILE;
    if(solidAt(x,y)||biomeAt(Math.floor(x/TILE),Math.floor(y/TILE))==='ocean')continue;
    const w=makeWild(sp,{x,y});
    w.lv=Math.max(3,Math.round((G.team.length?Math.max(...G.team.map(p=>p.lv)):1)*0.8));
    scalePal(w,w.lv);
    w.isCustom=true;w.fx=1;
    G.seen[sp.id]=true;
    G.wilds.push(w);
    toast('🌠 A wild '+sp.n+' has appeared!','var(--violet)');
    return;
  }
}
let pendingCustom=null;
function importCustomPal(){
  const h=location.hash.match(/#pal=([A-Za-z0-9\-_]+)/);
  if(!h)return;
  const sp=sanitizeCustom(decodePal(h[1]));
  if(!sp)return;
  sp.id=sp.id||('custom_'+hashSeed(sp.n+sp.col+sp.hp).toString(36));
  CUSTOM_SPECIES[sp.id]=sp;G.customs.push(sp);
  pendingCustom=sp;
  try{history.replaceState(null,'',location.pathname+location.search);}catch(e){}
}

