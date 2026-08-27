/* ================= CUSTOM PAL EDITOR UI ================= */
function updateEditPreview(){
  const cv=$('editPrev');
  const c=cv.getContext('2d');
  c.clearRect(0,0,cv.width,cv.height);
  drawPalShape(c,32,34,22,E.col,E.shape,0.5,1);
  c.fillStyle='rgba(0,0,0,.45)';c.fillRect(12,54,40,5);
  $('statTxt').textContent='❤️ '+Math.round(E.hp)+' · ⚔️ '+Math.round(E.atk)+' · 🏃 '+E.spd.toFixed(2)+' · '+TYPES[E.type];
  $('hpVal').textContent=Math.round(E.hp);
  $('atkVal').textContent=Math.round(E.atk);
  $('spdVal').textContent=E.spd.toFixed(2);
}
function renderEdit(){
  const box=$('editBody');box.innerHTML='';
  E=Object.assign({shape:0,col:'#3ee6ff',type:'grass',hp:70,atk:16,spd:1.4,trait:null,skills:[],name:''},E);
  /* preview + nome */
  const top=document.createElement('div');top.className='row';
  top.style.cssText='justify-content:center;gap:16px';
  const cv=document.createElement('canvas');cv.id='editPrev';cv.width=64;cv.height=64;
  top.appendChild(cv);
  const nm=document.createElement('input');nm.id='editName';nm.placeholder='Pal name';nm.maxLength=18;nm.value=E.name;
  nm.style.cssText='background:rgba(12,17,34,.9);border:1px solid var(--line);border-radius:9px;color:var(--text);font:inherit;font-size:13px;padding:7px 10px;width:130px';
  top.appendChild(nm);
  box.appendChild(top);
  nm.oninput=()=>{E.name=nm.value;};
  /* shape */
  const sh=document.createElement('div');sh.className='row';sh.innerHTML='<span class="nm">Shape</span><div class="selrow" id="shapeRow"></div>';
  box.appendChild(sh);
  const sr=sh.querySelector('#shapeRow');
  for(let i=0;i<6;i++){
    const b=document.createElement('button');b.className='chip'+(E.shape===i?' on':'');b.textContent=SHAPE_ICON[i];
    b.onclick=()=>{E.shape=i;sr.querySelectorAll('.chip').forEach((c,j)=>c.classList.toggle('on',j===i));updateEditPreview();};
    sr.appendChild(b);
  }
  /* color + type */
  const ct=document.createElement('div');ct.className='row';ct.innerHTML='<span class="nm">Color</span>';
  const col=document.createElement('input');col.type='color';col.value=E.col;
  col.style.cssText='width:34px;height:26px;border:1px solid var(--line);border-radius:7px;background:transparent;cursor:pointer';
  col.oninput=()=>{E.col=col.value;updateEditPreview();};
  ct.appendChild(col);
  const tr2=document.createElement('div');tr2.className='selrow';tr2.style.cssText='margin-left:auto';
  for(const t in TYPES){
    const b=document.createElement('button');b.className='chip'+(E.type===t?' on':'');b.textContent=TYPE_ICON[t]+t;
    b.onclick=()=>{E.type=t;E.skills=[];renderEdit();};
    tr2.appendChild(b);
  }
  ct.appendChild(tr2);
  box.appendChild(ct);
  /* stats */
  const mkSlider=(label,min,max,step,get,set)=>{
    const r=document.createElement('div');r.className='row';
    r.innerHTML='<span class="nm">'+label+'</span><input type="range" min="'+min+'" max="'+max+'" step="'+step+'" style="flex:1;accent-color:var(--cyan)"><b id="'+label+'Val" style="width:38px;text-align:right;color:var(--cyan)"></b>';
    box.appendChild(r);
    const inp=r.querySelector('input');inp.value=get();
    inp.oninput=()=>{set(+inp.value);updateEditPreview();};
  };
  mkSlider('hp',30,130,1,()=>E.hp,v=>E.hp=v);
  mkSlider('atk',6,34,1,()=>E.atk,v=>E.atk=v);
  mkSlider('spd',0.9,2.0,0.05,()=>E.spd,v=>E.spd=v);
  const st=document.createElement('div');st.className='row';st.id='statTxt';st.style.cssText='color:var(--dim);font-size:11px';
  box.appendChild(st);
  /* trait */
  const tr=document.createElement('div');tr.className='row';tr.innerHTML='<span class="nm">Trait</span><div class="selrow" id="traitRow"></div>';
  box.appendChild(tr);
  const traitRow=tr.querySelector('#traitRow');
  const noneB=document.createElement('button');noneB.className='chip'+(E.trait===null?' on':'');noneB.textContent='none';
  noneB.onclick=()=>{E.trait=null;traitRow.querySelectorAll('.chip').forEach((c,i)=>c.classList.toggle('on',i===0));};
  traitRow.appendChild(noneB);
  TRAITS.forEach((t,i)=>{
    const b=document.createElement('button');b.className='chip'+(E.trait===t.n?' on':'');b.textContent=t.n+' ('+t.d+')';
    b.onclick=()=>{E.trait=t.n;traitRow.querySelectorAll('.chip').forEach((c,j)=>c.classList.toggle('on',j===i+1));};
    traitRow.appendChild(b);
  });
  /* skills (max 3) */
  const sk=document.createElement('div');sk.className='row';sk.innerHTML='<span class="nm">Skills</span><div class="selrow" id="skillRow"></div>';
  box.appendChild(sk);
  const skillRow=sk.querySelector('#skillRow');
  SKILL_POOL[E.type].forEach((s,i)=>{
    const b=document.createElement('button');b.className='chip'+(E.skills.includes(s[0])?' on':'');b.textContent=s[0]+' ('+s[1]+'⚔️)';
    b.onclick=()=>{
      const idx=E.skills.indexOf(s[0]);
      if(idx>=0)E.skills.splice(idx,1);
      else{if(E.skills.length>=3){toast('Max 3 skills','var(--amber)');return;}E.skills.push(s[0]);}
      b.classList.toggle('on',idx<0);
    };
    skillRow.appendChild(b);
  });
  /* cost + buttons */
  const act=document.createElement('div');act.className='row';
  act.style.cssText='justify-content:center;gap:8px';
  const mk=document.createElement('button');mk.className='minibtn gold';mk.textContent='🧬 Synthesize ('+CUSTOM_COST+' essence)';
  mk.onclick=createCustomPal;
  const sh2=document.createElement('button');sh2.className='minibtn';sh2.textContent='🔗 Copy share link';
  sh2.onclick=copyShareLink;
  act.appendChild(mk);act.appendChild(sh2);
  box.appendChild(act);
  const note=document.createElement('div');note.className='row';
  note.style.cssText='color:var(--dim);font-size:10.5px';
  note.textContent='Sharing encodes the design in the URL — anyone opening it meets your Pal as a wild visitor.';
  box.appendChild(note);
  updateEditPreview();
}
function refreshHud(){
  $('hpbar').querySelector('i').style.width=(clamp(G.player.hp/G.player.maxHp,0,1)*100)+'%';
  $('hpTxt').textContent=Math.max(0,Math.round(G.player.hp));
  $('hungbar').querySelector('i').style.width=(clamp(G.hunger/100,0,1)*100)+'%';
  $('hungTxt').textContent=Math.max(0,Math.round(G.hunger));
  $('essTxt').textContent=G.inv.ess;
  $('sphTxt').textContent=G.sph[0]+G.sph[1]+G.sph[2];
  $('resTxt').textContent=G.inv.grass+G.inv.wood+G.inv.berry+G.inv.stone;
  $('btnThrow').textContent=t('throw')+' ('+G.sph[0]+')';
  $('btnAttack').style.display=G.equip==='sword'?'inline-block':'none';
  $('btnAttack').textContent=G.equip==='sword'?t('attack')+' '+G.inv.sword:'';
  $('btnShoot').style.display=G.equip==='bow'?'inline-block':'none';
  $('btnShoot').textContent=t('shoot')+' '+(G.inv.arrows||0);
  $('btnRide').style.display=G.team.length?'inline-block':'none';
  $('btnRide').textContent=G.flying?t('descend'):(G.riding?t('dismount'):t('ride'));
  $('btnRide').classList.toggle('on',G.riding);
  if(G.speedrun&&G.speedrun.on){
    $('srBox').style.display='inline-block';
    const s=Math.floor(G.speedrun.elapsed),mm=Math.floor(s/60),ss=s%60;
    $('srTime').textContent=mm+':'+(ss<10?'0':'')+ss;
  }else if($('srBox'))$('srBox').style.display='none';
}

