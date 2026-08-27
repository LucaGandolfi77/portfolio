/* ================= PANELS ================= */
function togglePanel(id){const p=$(id);const on=p.classList.toggle('on');if(on)renderPanel(id);else if(id==='pBuild')G.buildMode=null;}
function closePanels(){document.querySelectorAll('.panelbox').forEach(p=>p.classList.remove('on'));}
function renderPanel(id){
  if(id==='pTeam')renderTeam();
  else if(id==='pCraft')renderCraft();
  else if(id==='pLab')renderLab();
  else if(id==='pBuild')renderBuild();
  else if(id==='pQuests')renderQuests();
  else if(id==='pChest')renderChest();
  else if(id==='pTrade')renderTrade();
  else if(id==='pDex')renderDex();
  else if(id==='pEdit')renderEdit();
  else if(id==='pAch')renderAch();
  else if(id==='pTest')renderTest();
  else if(id==='pSmith')renderSmith();
  else if(id==='pDiary')renderDiary();
}
function palRow(p,idx,extra){
  const sp=speciesOf(p.id);
  const col=p.spliceCol||sp.col;
  const div=document.createElement('div');div.className='row';
  div.innerHTML='<span style="width:14px;height:14px;border-radius:50%;background:'+col+';flex:none"></span>'+
    '<span class="nm">'+sp.n+'</span><span class="st">Lv '+p.lv+' · ❤️'+p.maxHp+' · ⚔️'+p.atk+' · 🏃'+p.spd.toFixed(2)+(p.trait?' · 🧬'+p.trait:'')+(p.habit?' · 🤖'+p.habit:'')+(p.xp?' · xp '+(p.xp||0)+'/'+xpNeed(p.lv):'')+'</span>'+(extra||'');
  return div;
}
function renderTeam(){
  const box=$('teamList');box.innerHTML='';
  if(!G.team.length){box.innerHTML='<div class="row" style="color:var(--dim)">No Pals yet — throw a sphere at a wild creature! 🔮</div>';}
  G.team.forEach((p,i)=>{
    const sp2=speciesOf(p.id);
    const div=palRow(p,i,'<button class="minibtn'+(G.active===i?' on':'')+'" data-a="'+i+'">ACTIVE</button><button class="minibtn'+(p.work==='gather'?' on':'')+'" data-w="'+i+'">'+(p.work==='gather'?'⛏ GATHER':'🤝 FOLLOW')+'</button><button class="minibtn gold" data-s="'+i+'">📜 Teach'+(p.skills&&p.skills.length?' ×'+p.skills.length:'')+'</button>');
    box.appendChild(div);
    div.querySelector('[data-a]').onclick=()=>{G.active=i;saveGame();renderPanel('pTeam');toast('📦 '+sp2.n+' is now active','var(--cyan)');};
    div.querySelector('[data-w]').onclick=()=>{
      if(i===G.active&&p.work!=='gather'){toast('The active Pal fights for you — use another for gathering','var(--amber)');return;}
      p.work=p.work==='gather'?'follow':'gather';
      renderPanel('pTeam');
      toast(p.work==='gather'?'⛏ '+sp2.n+' is gathering resources':'🤝 '+sp2.n+' follows you','var(--cyan)');
    };
    div.querySelector('[data-s]').onclick=()=>teachSkill(i);
  });
  $('pTeam').querySelector('.body').appendChild((()=>{const d=document.createElement('div');d.className='row';d.innerHTML='<span style="color:var(--dim)">Dex: '+Object.keys(G.dex).length+' species</span>';return d;})());
}
function renderCraft(){
  const box=$('craftList');box.innerHTML='';
  for(const r of RECIPES){
    const div=document.createElement('div');div.className='row';
    const can=Object.entries(r.cost).every(([k,v])=>(G.inv[k]||0)>=v);
    div.innerHTML='<span>'+r.icon+'</span><span class="nm">'+r.n+'</span><span class="st">'+r.desc+' · '+Object.entries(r.cost).map(([k,v])=>k+':'+v).join(' ')+'</span>'+
      '<button class="minibtn'+(can?' gold':'')+'" data-c="'+RECIPES.indexOf(r)+'"'+(can?'':' disabled')+'>Craft</button>';
    box.appendChild(div);
    div.querySelector('[data-c]').onclick=()=>{r.give();for(const k in r.cost)G.inv[k]-=r.cost[k];questEvent('craftSphere');renderCraft();toast('🛠 Crafted '+r.n,'var(--cyan)');};
  }
}
function renderLab(){
  const box=$('labBody');box.innerHTML='';
  const editBtn=document.createElement('div');editBtn.className='row';
  editBtn.innerHTML='<span>🎨</span><span class="nm">Custom Pal Lab</span><span class="st">synthesize your own Pal, share it via URL</span><button class="minibtn gold" id="openEdit">OPEN</button>';
  box.appendChild(editBtn);
  editBtn.querySelector('#openEdit').onclick=()=>{closePanels();togglePanel('pEdit');};
  if(G.team.length<2){box.innerHTML+='<div class="row" style="color:var(--dim)">Need at least 2 Pals in your team for the Gene Lab.</div>';return;}
  let tg=0,dn=1;
  const mkSel=(label,cb,sel)=>{
    const d=document.createElement('div');d.className='row';
    d.innerHTML='<span class="nm">'+label+'</span><div class="selrow"></div>';
    const row=d.querySelector('.selrow');
    G.team.forEach((p,i)=>{
      const b=document.createElement('button');b.className='chip'+(i===sel?' on':'');b.textContent=speciesOf(p.id).n+' Lv'+p.lv;
      b.onclick=()=>{cb(i);renderLab();};
      row.appendChild(b);
    });
    box.appendChild(d);
  };
  const pick=(label,val,set)=>mkSel(label,v=>set(v),val);
  let selT=0,selD=1;
  pick('Target',selT,v=>selT=v);
  pick('Donor',selD,v=>selD=v);
  const g=document.createElement('div');g.className='row';
  g.innerHTML='<span class="nm">Splice (cost 5 🧪)</span>'+
    '<button class="minibtn gold" data-g="hp">❤️ HP</button><button class="minibtn gold" data-g="atk">⚔️ ATK</button>'+
    '<button class="minibtn gold" data-g="spd">🏃 SPD</button><button class="minibtn gold" data-g="color">🎨 Color</button>'+
    '<button class="minibtn red" data-g="trait">🧬 Trait</button>';
  box.appendChild(g);
  g.querySelectorAll('[data-g]').forEach(b=>b.onclick=()=>{spliceGene(selT,selD,b.dataset.g);renderLab();});
  const f=document.createElement('div');f.className='row';
  f.innerHTML='<span class="nm">🔀 Fusion (same species, cost 8 🧪)</span><button class="minibtn gold" data-f="1">Fuse</button>';
  box.appendChild(f);
  f.querySelector('[data-f]').onclick=()=>{fusePals(selT,selD);renderLab();};
}
function renderBuild(){
  const box=$('buildList');box.innerHTML='';
  for(const b of STRUCTURES){
    const div=document.createElement('div');div.className='row';
    const can=Object.entries(b.cost).every(([k,v])=>(G.inv[k]||0)>=v);
    div.innerHTML='<span>'+b.icon+'</span><span class="nm">'+b.n+'</span><span class="st">'+b.desc+' · '+Object.entries(b.cost).map(([k,v])=>k+':'+v).join(' ')+'</span>'+
      '<button class="minibtn'+(can?' gold':'')+'" data-b="'+b.id+'"'+(can?'':' disabled')+'>Place</button>';
    box.appendChild(div);
    div.querySelector('[data-b]').onclick=()=>placeBuild(b.id);
  }
}
function renderQuests(){
  const box=$('questList');box.innerHTML='';
  const maxCh=Math.max(1,Math.min(5,G.quests.reduce((m,q)=>Math.max(m,q.ch),1)));
  for(let ch=1;ch<=maxCh;ch++){
    const unlocked=ch<=1||questChapterDone(ch-1);
    const doneAll=questChapterDone(ch);
    const head=document.createElement('div');head.className='row';
    head.style.cssText='background:rgba(62,230,255,.06);font-weight:700;letter-spacing:1px';
    head.innerHTML='<span>'+(doneAll?'✅':(unlocked?'⭐':'🔒'))+'</span><span class="nm">Chapter '+ch+' — '+t('ch'+ch)+'</span>'+(unlocked?'<span style="color:var(--dim);font-size:10px">'+(doneAll?'complete':'in progress')+'</span>':'');
    box.appendChild(head);
    for(const q of G.quests.filter(q=>q.ch===ch)){
      if(!unlocked){
        const locked=document.createElement('div');locked.className='row';
        locked.style.cssText='opacity:.4';
        locked.innerHTML='<span>🔒</span><span class="nm">'+t('q'+(G.quests.indexOf(q)+1))+'</span>';
        box.appendChild(locked);
        continue;
      }
      const div=document.createElement('div');div.className='row';
      const done=q.done>=q.t;
      div.innerHTML='<span>'+(done?'✅':'📋')+'</span><span class="nm">'+t('q'+(G.quests.indexOf(q)+1))+'</span><span class="st">'+q.done+'/'+q.t+'</span>'+(done?'<span style="color:var(--gold)">done</span>':'');
      box.appendChild(div);
    }
  }
}
function renderChest(){
  const box=$('chestList');box.innerHTML='';
  const keys=['grass','wood','berry','stone','ess'];
  const names={grass:'🍃 grass',wood:'🪵 wood',berry:'🫐 berry',stone:'🪨 stone',ess:'🧪 essence'};
  for(const k of keys){
    const div=document.createElement('div');div.className='row';
    div.innerHTML='<span class="nm">'+names[k]+'</span><span class="st">bag: '+G.inv[k]+' · chest: '+G.chestInv[k]+'</span>'+
      '<button class="minibtn" data-k="'+k+'" data-d="1">⇢ chest</button><button class="minibtn" data-k="'+k+'" data-d="-1">⇠ bag</button>';
    box.appendChild(div);
    div.querySelectorAll('[data-k]').forEach(b=>b.onclick=()=>{
      const k=b.dataset.k,dir=+b.dataset.d;
      if(dir>0&&G.inv[k]>0){G.inv[k]--;G.chestInv[k]++;}
      if(dir<0&&G.chestInv[k]>0){G.chestInv[k]--;G.inv[k]++;}
      renderChest();
    });
  }
}
function renderTrade(){
  const box=$('tradeList');box.innerHTML='';
  $('coinTxt').textContent=(G.inv.coins||0)+' coins';
  const s=document.createElement('div');s.className='row';
  s.innerHTML='<span class="nm">💰 Sell</span><span class="st">trade resources for coins</span>';
  box.appendChild(s);
  const sellNames={grass:'🍃 grass',wood:'🪵 wood',berry:'🫐 berry',stone:'🪨 stone',ess:'🧪 essence'};
  for(const k in SELL_PRICE){
    const div=document.createElement('div');div.className='row';
    div.innerHTML='<span>'+sellNames[k]+'</span><span class="st">'+SELL_PRICE[k]+'× → 1 🪙</span><button class="minibtn gold" data-s="'+k+'">Sell</button>';
    box.appendChild(div);
    div.querySelector('[data-s]').onclick=()=>tradeSell(k);
  }
  const b=document.createElement('div');b.className='row';
  b.innerHTML='<span class="nm">🛒 Buy</span><span class="st">spend coins</span>';
  box.appendChild(b);
  BUY_ITEMS.forEach((it,i)=>{
    const div=document.createElement('div');div.className='row';
    div.innerHTML='<span>'+it.icon+'</span><span class="nm">'+it.n+'</span><span class="st">'+it.c+' 🪙</span><button class="minibtn gold" data-b="'+i+'">Buy</button>';
    box.appendChild(div);
    div.querySelector('[data-b]').onclick=()=>tradeBuy(i);
  });
}
/* ================= PALDEX (photo gallery) ================= */
const TYPE_ICON={grass:'🌿',fire:'🔥',ice:'❄️',water:'💧',void:'🌑'};
function renderDex(){
  const box=$('dexList');box.innerHTML='';
  const detail=$('dexDetail');detail.classList.remove('on');detail.innerHTML='';
  let seenN=0;
  const grid=document.createElement('div');grid.className='dexgrid';
  SPECIES.forEach((s,i)=>{
    const seen=!!G.seen[s.id];
    if(seen)seenN++;
    const cell=document.createElement('div');cell.className='dexcell'+(seen?'':' unseen');
    const cv=document.createElement('canvas');cv.width=44;cv.height=44;
    const c=cv.getContext('2d');
    if(seen){
      drawPalShape(c,22,24,13,s.col,s.shape,0.5,1);
      c.fillStyle='rgba(0,0,0,.45)';c.fillRect(10,38,24,3);
    }else{
      c.fillStyle='rgba(138,146,200,.28)';c.beginPath();c.arc(22,24,13,0,6.283);c.fill();
      c.fillStyle='rgba(138,146,200,.5)';c.font='10px sans-serif';c.textAlign='center';c.fillText('?',22,27);
    }
    cell.appendChild(cv);
    const nm=document.createElement('div');nm.className='dn';nm.textContent=seen?s.n:'???';
    const ct=document.createElement('div');ct.className='dc';
    ct.textContent=seen?(TYPE_ICON[s.type]+(s.type2?' '+TYPE_ICON[s.type2]:'')+(G.dex[s.id]?' · ×'+G.dex[s.id]:'')):'';
    cell.appendChild(nm);cell.appendChild(ct);
    cell.onclick=()=>{
      detail.classList.add('on');
      if(!seen){detail.innerHTML='<b>???</b> — not seen yet. Explore the wild and it will appear here.';return;}
      detail.innerHTML='<b style="color:'+s.col+'">'+s.n+'</b> '+TYPE_ICON[s.type]+(s.type2?' '+TYPE_ICON[s.type2]:'')+
        ' <span style="color:var(--dim)">· '+s.desc+'</span><br>❤️ '+s.hp+' · ⚔️ '+s.atk+' · 🏃 '+s.spd.toFixed(2)+
        ' · biome: '+s.biome+(s.noct?' · 🌙 night':'')+(s.season!==undefined?' · '+SEASONS[s.season].icon+' '+SEASONS[s.season].n+' only':'')+(s.evTo?' · evolves into '+speciesOf(s.evTo).n+' @Lv'+s.evLv:'')+
        '<br>skills: '+s.skills.map(k=>k[0]+' ('+k[1]+'⚔️)').join(', ')+
        (G.dex[s.id]?'<br><b style="color:var(--gold)">caught ×'+G.dex[s.id]+'</b>':'<br><span style="color:var(--dim)">seen, not caught yet</span>');
    };
    grid.appendChild(cell);
  });
  box.appendChild(grid);
  $('dexCountTxt').textContent=seenN+' / '+SPECIES.length+' seen';
  const hint=document.createElement('div');hint.className='row';
  hint.style.cssText='color:var(--dim);font-size:10.5px';
  hint.textContent='📸 Photo gallery — tap a Pal for its full dossier. Unseen Pals stay silhouettes.';
  box.appendChild(hint);
}
