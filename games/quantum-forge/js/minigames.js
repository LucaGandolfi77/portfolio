function setupQuarkForge(c){
  $('forgeArea').style.display='flex';
  // quarks disponibili: u,d,s + anti-u, anti-d, anti-s (per mesoni)
  const list=c===1?['u','d','s']:['u','d','s','ū','d̄','s̄'];
  const tiles=$('quarkTiles');tiles.innerHTML='';
  list.forEach(f=>{
    const t=makeQuarkTile(f);
    tiles.appendChild(t);
  });
  slots=[];renderSlots();
  $('slots').innerHTML='';
  // slot: 3 per barioni (quark), 2 per mesoni
  const n=c===1?3:2;
  for(let i=0;i<n;i++){
    const s=document.createElement('div');
    s.className='slot';
    s.dataset.i=i;
    s.innerHTML='<div class="slot-tag">+</div>';
    setupSlot(s,i,'slots');
    $('slots').appendChild(s);
  }
  $('btnForge').onclick=()=>{
    const hasAnti=slots.some(f=>mapAnti[Object.keys(mapAnti).find(k=>mapAnti[k]===f)]===f||'ū d̄ s̄ c̄ t̄ b̄'.split(' ').indexOf(f)>=0);
    const result=hadronOf(slots);
    if(!result){
      showResult(slots.length===3?'Tre quark non formano un barione conosciuto (ricette: uud, udd, uds, uus, dds, sss).':(slots.length===2?'Quark + antiquark non è una coppia valida. Es: u+anti-d → π⁺.':'Metti i quark nella forgia!'),true);
      return;
    }
    if(result.kind==='barione'){showResult(`⚛️ <b>${result.name}</b> (${result.sym}) — carica ${result.charge>=0?'+':''}${result.charge}`,false,result.em,result.fact);}
    else{showResult(`🔁 <b>${result.name}</b> (${result.sym}) — carica ${result.charge>=0?'+':''}${result.charge}`,false,result.em,result.fact);}
    // scoperte
    addFound(result.sym+':'+result.name);
    // obiettivi
    if(c===1&&result.sym==='p⁺'){toast('🎉 PROTONE creato! Ora il neutrone (udd)','var(--gold)');}
    if(c===1&&result.sym==='n⁰'){complete(1,'🎉 Adroni creati! Protone e neutrone forgiati.');}
    if(c===2&&result.sym==='π⁺'){toast('🎉 PIONE+ creato! Ora il Kaone+ (u+anti-s)','var(--gold)');}
    if(c===2&&result.sym==='K⁺'){complete(2,'🎉 Mesoni creati! Hai i messaggeri della forza forte.');}
  };
  $('btnClear').onclick=()=>{slots=[];renderSlots();};
}
function makeQuarkTile(f){
  const t=document.createElement('div');
  const anti='ū d̄ s̄ c̄ t̄ b̄'.split(' ');
  const isA=anti.indexOf(f)>=0;
  const base=isA?Q[Object.keys(mapAnti).find(k=>mapAnti[k]===f)]:Q[f];
  t.className='tile'+(isA?' anti':'');
  t.style.background=base.color;
  t.innerHTML=`<div class="sym">${f}</div><div class="chg">${chargeOf(f)>=0?'+':''}${frac(chargeOf(f))}</div>`;
  t.dataset.f=f;
  t.addEventListener('pointerdown',e=>startDrag(e,t,f,isA));
  return t;
}
function frac(v){
  const a=Math.abs(v);
  if(Math.abs(a-2/3)<1e-9)return '2/3';
  if(Math.abs(a-1/3)<1e-9)return '1/3';
  return String(Math.round(v));
}
let drag=null;
function startDrag(e,t,f,isA){
  e.preventDefault();
  const r=t.getBoundingClientRect();
  const ghost=t.cloneNode(true);
  ghost.className+=' ghost';
  ghost.style.width=r.width+'px';ghost.style.left=(e.clientX-r.width/2)+'px';ghost.style.top=(e.clientY-r.height/2)+'px';
  document.body.appendChild(ghost);
  drag={f,ghost,ox:e.clientX,oy:e.clientY,moved:false,isA};
  const mv=ev=>{
    if(!drag)return;
    if(Math.abs(ev.clientX-drag.ox)+Math.abs(ev.clientY-drag.oy)>8)drag.moved=true;
    ghost.style.left=(ev.clientX-r.width/2)+'px';ghost.style.top=(ev.clientY-r.height/2)+'px';
    const target=document.elementFromPoint(ev.clientX,ev.clientY);
    document.querySelectorAll('.slot.hover').forEach(s=>s.classList.remove('hover'));
    if(target){const sl=target.closest('.slot');if(sl)sl.classList.add('hover');}
  };
  const up=ev=>{
    if(!drag)return;
    document.removeEventListener('pointermove',mv);
    document.removeEventListener('pointerup',up);
    const target=document.elementFromPoint(ev.clientX,ev.clientY);
    const slot=target&&target.closest('.slot');
    if(slot&&drag.moved){
      const i=parseInt(slot.dataset.i,10);
      if(chapter===1||chapter===2){
        slots[i]=drag.f;renderSlots();
      }else if(chapter===3){
        nuclSlots[i]=drag.f;renderNuclSlots();
      }else if(chapter===4){
        atomSlots[i]=drag.f;renderAtomSlots();
      }
    }
    document.querySelectorAll('.slot.hover').forEach(s=>s.classList.remove('hover'));
    ghost.remove();drag=null;
  };
  document.addEventListener('pointermove',mv);
  document.addEventListener('pointerup',up);
}
function renderSlots(){
  const els=$('slots').querySelectorAll('.slot');
  els.forEach((s,i)=>{
    const f=slots[i];
    if(f){
      const tile=makeQuarkTile(f);
      tile.style.pointerEvents='none';
      s.innerHTML='';s.appendChild(tile);
      s.addEventListener('click',()=>{slots[i]=undefined;renderSlots();});
    }else s.innerHTML='<div class="slot-tag">+</div>';
  });
}
function setupSlot(s,i,which){
  s.dataset.i=i;
  s.addEventListener('dragover',e=>e.preventDefault());
}

/* ═════════════ NUCLEUS (CH3) ═════════════ */
function setupNucleus(){
  $('miniNucleus').classList.add('on');
  const t=$('nuclTiles');t.innerHTML='';
  [['p','Protone','🟥'],['n','Neutrone','🟦']].forEach(([f,nm,em])=>{
    const d=document.createElement('div');
    d.className='qitem';d.style.background=f==='p'?'#ff5f6d':'#3ee6ff';
    d.innerHTML=`<div class="em">${em}</div><div class="lb">${nm} (${f})</div>`;
    d.addEventListener('pointerdown',e=>startDrag(e,{getBoundingClientRect:()=>d.getBoundingClientRect(),cloneNode:()=>{const c=d.cloneNode(true);c.style.width=d.getBoundingClientRect().width+'px';return c;},style:{},dataset:{}},f,false));
    t.appendChild(d);
  });
  $('nuclSlots').innerHTML='';
  const n=4;
  for(let i=0;i<n;i++){
    const s=document.createElement('div');s.className='slot';s.dataset.i=i;
    s.innerHTML='<div class="slot-tag">+</div>';
    $('nuclSlots').appendChild(s);
  }
  nuclSlots=[];
  renderNuclSlots();
  $('btnNucl').onclick=()=>{
    const p=nuclSlots.filter(f=>f==='p').length,nn=nuclSlots.filter(f=>f==='n').length;
    const nu=nucleusOf(p,nn);
    if(!nu){showResult('Nessun nucleo stabile con questa combinazione (prova: 1p+1n, 2p+2n, 6p+6n…).',true);return;}
    showResult(`⚛️ <b>${nu.name}</b> (${nu.sym}) — ${p}p + ${nn}n`,false,nu.em,nu.fact);
    addFound(nu.sym+':'+nu.name);
    if(nu.sym==='⁴He')toast('🎉 ELIO-4! La particella alfa, super stabile','var(--gold)');
    if(nu.sym==='¹²C')complete(3,'🎉 Nuclei forgiati! Elio-4 e Carbonio-12 pronti.');
  };
  $('btnNuclClear').onclick=()=>{nuclSlots=[];renderNuclSlots();};
}
function renderNuclSlots(){
  const els=$('nuclSlots').querySelectorAll('.slot');
  els.forEach((s,i)=>{
    const f=nuclSlots[i];
    if(f){
      s.style.background=f==='p'?'#ff5f6d':'#3ee6ff';
      s.innerHTML=`<div style="font-size:26px">${f==='p'?'🟥':'🟦'}</div><div class="slot-tag">${f}</div>`;
      s.addEventListener('click',()=>{nuclSlots[i]=undefined;renderNuclSlots();});
    }else{s.style.background='';s.innerHTML='<div class="slot-tag">+</div>';}
  });
}

/* ═════════════ ATOM (CH4) ═════════════ */
function setupAtom(){
  $('miniAtom').classList.add('on');
  const t=$('atomTiles');t.innerHTML='';
  [['p','Protone','🟥'],['n','Neutrone','🟦'],['e⁻','Elettrone','🟢']].forEach(([f,nm,em])=>{
    const d=document.createElement('div');
    d.className='qitem';d.style.background=f==='p'?'#ff5f6d':f==='n'?'#3ee6ff':'#52ff9e';
    d.innerHTML=`<div class="em">${em}</div><div class="lb">${nm}</div>`;
    d.addEventListener('pointerdown',e=>startDrag(e,{getBoundingClientRect:()=>d.getBoundingClientRect(),cloneNode:()=>{const c=d.cloneNode(true);c.style.width=d.getBoundingClientRect().width+'px';return c;},style:{},dataset:{}},f,false));
    t.appendChild(d);
  });
  $('atomSlots').innerHTML='';
  for(let i=0;i<6;i++){
    const s=document.createElement('div');s.className='slot';s.dataset.i=i;
    s.innerHTML='<div class="slot-tag">+</div>';
    $('atomSlots').appendChild(s);
  }
  atomSlots=[];
  renderAtomSlots();
  $('btnAtom').onclick=()=>{
    const p=atomSlots.filter(f=>f==='p').length,nn=atomSlots.filter(f=>f==='n').length,e=atomSlots.filter(f=>f==='e⁻').length;
    const a=atomOf(p,nn,e);
    if(!a){showResult('Combinazione non valida: il numero di elettroni deve uguagliare i protoni per l\'atomo neutro.',true);return;}
    const tag=a.neutral?'⚖️ Atomo neutro':(a.charge>0?a.charge+'+ ione':'ione');
    showResult(`🪐 <b>${a.name}</b> (${a.sym}) — ${p}p ${nn}n ${e}e⁻ · ${a.shell}`,false,a.em,a.fact+' Gusci: '+a.shell);
    addFound(a.sym+':'+a.name);
    if(a.sym==='He')toast('🎉 ELIO! Gas nobile, guscio pieno','var(--gold)');
    if(a.sym==='C')complete(4,'🎉 Atomi assemblati! Idrogeno, Elio e Carbonio pronti.');
  };
  $('btnAtomClear').onclick=()=>{atomSlots=[];renderAtomSlots();};
}
function renderAtomSlots(){
  const els=$('atomSlots').querySelectorAll('.slot');
  els.forEach((s,i)=>{
    const f=atomSlots[i];
    if(f){
      s.style.background=f==='p'?'#ff5f6d':f==='n'?'#3ee6ff':'#52ff9e';
      s.innerHTML=`<div style="font-size:24px">${f==='p'?'🟥':f==='n'?'🟦':'🟢'}</div><div class="slot-tag">${f}</div>`;
      s.addEventListener('click',()=>{atomSlots[i]=undefined;renderAtomSlots();});
    }else{s.style.background='';s.innerHTML='<div class="slot-tag">+</div>';}
  });
}

/* ═════════════ FUSION (CH5) ═════════════ */
function setupFusion(){
  $('miniFusion').classList.add('on');
  const t=$('fusionTiles');t.innerHTML='';
  const d=document.createElement('div');
  d.className='qitem';d.style.background='#ff5f6d';
  d.innerHTML='<div class="em">🟥</div><div class="lb">Protone (p)</div>';
  d.addEventListener('pointerdown',e=>startDrag(e,{getBoundingClientRect:()=>d.getBoundingClientRect(),cloneNode:()=>{const c=d.cloneNode(true);c.style.width=d.getBoundingClientRect().width+'px';return c;},style:{},dataset:{}},'p',false));
  t.appendChild(d);
  // fusione: usa un semplice contatore, non slot
  fusionSlots=[];
  const wrap=$('miniFusion');
  const cnt=document.createElement('div');
  cnt.className='goal';cnt.id='fusionCount';
  cnt.innerHTML='Protoni nella fornace: <b>0/4</b>';
  t.appendChild(cnt);
  const add=document.createElement('button');
  add.className='btn small';add.id='fusionAdd';add.textContent='➕ Aggiungi protone';
  t.appendChild(add);
  $('btnFusion').onclick=()=>{
    if(fusionSlots.length<4){showResult(`Servono 4 protoni (ora: ${fusionSlots.length}). Il ciclo protone-protone richiede esattamente 4!`,true);return;}
    showResult('☀️ <b>FUSIONE!</b> 4 protoni → ¹He + 2e⁺ + 2ν + 26.7 MeV',false,'☀️',FUSION_FACT);
    $('fusionEnergy').textContent='⚡ 26.7 MeV · E=mc²';
    $('fusionEnergy').classList.add('show');
    setTimeout(()=>$('fusionEnergy').classList.remove('show'),2000);
    addFound('fusione:4p→He');
    complete(5,'☀️ Fusione completata! Ora sai perché brillano le stelle.');
  };
  $('btnFusionClear').onclick=()=>{fusionSlots=[];updateFusionCount();};
  function updateFusionCount(){
    const c=$('fusionCount');if(c)c.innerHTML=`Protoni nella fornace: <b>${fusionSlots.length}/4</b>`;
  }
  window.__fusionAdd=()=>{
    if(fusionSlots.length<4){fusionSlots.push('p');updateFusionCount();if(fusionSlots.length===4)toast('🔥 Fornace piena! Premi FONDI','var(--gold)');}
  };
  if(add)add.addEventListener('click',window.__fusionAdd);
}

/* ═════════════ MODELLO STANDARD (CH6) ═════════════ */
function smCard(key,big){
  const p=SM[key];
  return `<div class="qitem ${big?'':''}" style="background:linear-gradient(160deg,${p.type==='quark'?'#5c1a2e':p.type==='leptone'?'#1a2e5c':p.type==='neutrino'?'#241a4d':'#3d2b0f'},#0c1226)">
    <div class="em">${p.em}</div><div class="lb">${p.name}</div>
    <div style="font-size:9px;color:var(--dim)">${p.mass} · ${p.charge}</div>
  </div>`;
}
let smSel=null,higgsDrag=null;
function setupSM(){
  $('miniSM').classList.add('on');
  const f=$('smFermions'),b=$('smBosons'),fc=$('smForces');
  f.innerHTML='';b.innerHTML='';fc.innerHTML='';
  // fermioni: 6 quark + 6 leptoni
  ['u','d','s','c','b','t'].forEach(k=>{const d=document.createElement('div');d.innerHTML=smCard(k);d.className='';d.addEventListener('click',()=>showSMParticle(k));f.appendChild(d.firstChild);});
  ['e','mu','tau','ve','vm','vt'].forEach(k=>{const d=document.createElement('div');d.innerHTML=smCard(k);d.addEventListener('click',()=>showSMParticle(k));f.appendChild(d.firstChild);});
  // bosoni + higgs
  ['g','gam','w','z','h'].forEach(k=>{const d=document.createElement('div');d.innerHTML=smCard(k);d.addEventListener('click',()=>showSMParticle(k));b.appendChild(d.firstChild);});
  // forze
  Object.keys(FORCES).forEach(k=>{
    const d=document.createElement('div');
    d.className='qitem';
    d.style.background='linear-gradient(160deg,#16223f,#0c1226)';
    d.innerHTML=`<div class="em">${FORCES[k].em}</div><div class="lb">${k.charAt(0).toUpperCase()+k.slice(1)}</div><div style="font-size:9px;color:var(--dim)">${FORCES[k].bosone}</div>`;
    d.addEventListener('click',()=>{
      showResult(`🪐 <b>Forza ${k}</b> — portata dal <b>${FORCES[k].bosone}</b>`,false,FORCES[k].em,FORCES[k].fact);
    });
    fc.appendChild(d);
  });
  $('btnSMdone').onclick=()=>{
    addFound('sm:modello-standard');
    complete(6,'🧬 Modello Standard studiato! Ora il bosone di Higgs.');
  };
  // mostra automaticamente una scheda introduttiva
  showResult('🧬 <b>Il Modello Standard</b>: 12 fermioni (materia) + bosoni (forze) + Higgs','',false,'Tocca le particelle per le schede, poi le 4 forze.');
}
function showSMParticle(k){
  const p=SM[k];
  smSel=k;
  const cls=p.type==='fermione'?'Fermione (materia)':(p.type==='bosone'?'Bosone (porta la forza)':(p.type==='higgs'?'Bosone di Higgs':'Fermione (leptone)'));
  showResult(`<b>${p.name}</b> — ${cls}`,false,p.em,`Massa ${p.mass} · carica ${p.charge} · interagisce con: ${p.force}. ${p.fact}`);
  addFound('sm:'+k);
}

/* ═════════════ HIGGS (CH7) ═════════════ */
function setupHiggs(){
  $('miniHiggs').classList.add('on');
  const c=$('higgsParticles');c.innerHTML='';
  // particelle da trascinare nel campo
  ['e','gam','g','t','w','z','h'].forEach(k=>{
    const d=document.createElement('div');
    d.innerHTML=smCard(k);
    d.className='';
    const tile=d.firstChild;
    tile.style.cursor='grab';
    tile.addEventListener('pointerdown',e=>startHiggsDrag(e,k));
    c.appendChild(tile);
  });
  $('btnHiggsDone').onclick=()=>{
    addFound('higgs:bosone');
    complete(7,'✨ Bosone di Higgs compreso! La massa è il regalo del campo.');
  };
}
function startHiggsDrag(e,k){
  e.preventDefault();
  const el=e.currentTarget;
  const r=el.getBoundingClientRect();
  const ghost=el.cloneNode(true);
  ghost.style.cssText='position:fixed;z-index:250;pointer-events:none;opacity:.95;left:'+(e.clientX-r.width/2)+'px;top:'+(e.clientY-r.height/2)+'px;width:'+r.width+'px;';
  document.body.appendChild(ghost);
  higgsDrag={k,ghost,ox:e.clientX,oy:e.clientY,moved:false};
  const mv=ev=>{
    if(!higgsDrag)return;
    if(Math.abs(ev.clientX-higgsDrag.ox)+Math.abs(ev.clientY-higgsDrag.oy)>8)higgsDrag.moved=true;
    ghost.style.left=(ev.clientX-r.width/2)+'px';ghost.style.top=(ev.clientY-r.height/2)+'px';
  };
  const up=ev=>{
    if(!higgsDrag)return;
    document.removeEventListener('pointermove',mv);
    document.removeEventListener('pointerup',up);
    const target=document.elementFromPoint(ev.clientX,ev.clientY);
    const inField=target&&(target.closest('#miniHiggs .fusion-anim')||target.closest('#higgsResult'));
    if(inField&&higgsDrag.moved)higgsGiveMass(higgsDrag.k);
    ghost.remove();higgsDrag=null;
  };
  document.addEventListener('pointermove',mv);
  document.addEventListener('pointerup',up);
}
function higgsGiveMass(k){
  const p=SM[k];
  const mass=p.mass==='0'?'0 (nessuna massa!)':p.mass;
  const heavy=p.mass==='173 GeV';
  const $el=$('higgsResult');
  $el.innerHTML=`<b style="color:var(--txt)">${p.em} ${p.name}</b> nel campo di Higgs → <b style="color:var(--gold)">massa ${mass}</b><br>
    <span style="font-size:12px">${p.mass==='0'?'Fotone e gluoni NON interagiscono col campo: restano senza massa, viaggiano alla velocità della luce.':
      (heavy?'Il quark top interagisce tantissimo: è la particella più pesante del Modello Standard.':
      'Interagisce col campo di Higgs e riceve la sua massa. Più forte è l\'interazione, più pesante è la particella.')}</span>`;
  $('higgsMass').textContent=p.mass==='0'?'m = 0 · veloce come la luce ⚡':'m = '+p.mass;
  $('higgsMass').classList.add('show');
  setTimeout(()=>$('higgsMass').classList.remove('show'),2200);
  addFound('higgs:'+k);
  showResult(`🌀 <b>${p.name}</b> attraversa il campo di Higgs`,false,p.em,HIGGS_FACT);
}

/* ═════════════ QUIZ (CH8) ═════════════ */
const QUIZ=[
  {q:'Qual è la composizione del protone?',opts:['uud','udd','uuu','ud'],a:0},
  {q:'Qual è la carica del quark up (u)?',opts:['+2/3','−1/3','+1','0'],a:0},
  {q:'Perché i quark non si osservano mai da soli?',opts:['Confinamento: la forza forte li lega in adroni','Sono troppo piccoli','Si dissolvono','Sono instabili'],a:0},
  {q:'Un mesone è fatto di…',opts:['Quark + antiquark','3 quark','2 quark','Protoni'],a:0},
  {q:'Nell\'atomo neutro, il numero di elettroni…',opts:['Uguaglia i protoni','Uguaglia i neutroni','È doppio','È zero'],a:0},
  {q:'Il decadimento beta trasforma un neutrone in…',opts:['Protone + elettrone + antineutrino','Due protoni','Un mesone','Elio'],a:0},
  {q:'Quale forza tiene insieme i quark nel protone?',opts:['La forza forte (gluoni)','La gravità','L\'elettromagnetismo','Il magnetismo'],a:0},
  {q:'Quale bosone dà la MASSA alle particelle?',opts:['Il bosone di Higgs','Il fotone','Il gluone','Il gravitone'],a:0},
  {q:'Quale particella NON ha massa?',opts:['Il fotone','Il quark top','L\'elettrone','Il bosone W'],a:0},
];
function setupQuiz(){
  $('miniQuiz').classList.add('on');
  quiz=0;quizScore=0;
  renderQuiz();
}
function renderQuiz(){
  if(quiz>=QUIZ.length){
    const pass=quizScore>=6;
    $('quizQ').textContent=pass?`🏆 Quiz superato! ${quizScore}/${QUIZ.length} — Sei un vero Alchimista Quantistico!`:`📚 Hai totalizzato ${quizScore}/${QUIZ.length}. Rileggi le lezioni e riprova.`;
    $('quizOpts').innerHTML='';
    $('quizFoot').style.display='flex';
    if(pass){complete(8,'🏆 Universo ricostruito! Hai imparato la fisica delle particelle.');}
    else{$('quizFoot').style.display='none';$('quizQ').textContent='📚 Serve almeno 6/9. Ricarica i capitoli o premi ⏭️ per passare.';}
    return;
  }
  const q=QUIZ[quiz];
  $('quizQ').textContent=(quiz+1)+'/'+QUIZ.length+' · '+q.q;
  const o=$('quizOpts');o.innerHTML='';
  q.opts.forEach((op,i)=>{
    const b=document.createElement('button');
    b.className='opt';b.textContent=op;
    b.addEventListener('click',()=>{
      document.querySelectorAll('.opt').forEach(x=>x.classList.remove('ok','no'));
      b.classList.add(i===q.a?'ok':'no');
      if(i===q.a)quizScore++;
      quiz++;
      setTimeout(renderQuiz,700);
    });
    o.appendChild(b);
  });
  $('quizFoot').style.display='none';
}
$('btnQuizNext').addEventListener('click',()=>{
  // se non si è superato, riprova; se superato, complete(8) ha già mostrato il finale
  if(S.chapters['c8']){$('quizFoot').style.display='none';}
});