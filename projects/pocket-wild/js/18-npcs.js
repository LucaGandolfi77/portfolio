/* ================= ARENA DUEL ================= */
function startDuel(){
  if(G.duel)return;
  const ap=G.team[G.active];
  if(!ap){toast('Need an active Pal to duel','var(--red)');return;}
  const pool=anytimePool(SPECIES.filter(s=>s.rar<=1));
  const sp=pool[Math.floor(Math.random()*pool.length)];
  const e=makeWild(sp,{x:G.player.x+3*TILE,y:G.player.y});
  e.lv=Math.max(3,ap.lv-1+Math.floor(Math.random()*3));scalePal(e,e.lv);
  e.hp=e.maxHp;e.isDuel=true;
  G.seen[sp.id]=true;
  G.duel={e};
  G.wilds.push(e);
  toast('⚔️ Duel! '+sp.n+' Lv'+e.lv+' vs '+speciesOf(ap.id).n,'var(--red)');
  SFX.ride();
}
/* ================= WANDERING TRAINERS ================= */
const TRAINER_NAMES=['Ace Avery','Ranger Rio','Profe. Fern','Hunter Kai','Dr. Nova','Kid Comet','Mage Mira','Guard Otto'];
const TRAINER_COLS=['#ff5f6d','#ff9e3f','#52ff9e','#3ee6ff','#ff5f9e','#ffd166'];
function makeTrainerTeam(lv){
  const pool=anytimePool(SPECIES.filter(s=>!s.evTo));
  const size=G.team.length>=3?2:1;
  const team=[];
  for(let i=0;i<size;i++){
    const sp=pool[Math.floor(Math.random()*pool.length)];
    const e=makeWild(sp,{x:0,y:0});
    e.lv=Math.max(3,lv+i+1);scalePal(e,e.lv);e.hp=e.maxHp;
    team.push(e);
  }
  return team;
}
function updateTrainer(dt){
  G.trainerT-=dt;
  if(G.trainer){
    if(G.trainer.rematchT>0)G.trainer.rematchT-=dt;
    const dueling=G.duel&&G.duel.trainer===G.trainer;
    if(!dueling)G.trainer.t-=dt;
    if(G.trainer.t<=0){G.trainer=null;G.trainerT=0;}
  }else if(G.trainerT<=0){
    G.trainerT=55;
    const a=Math.random()*6.28,d=4+Math.random()*4;
    const lv=G.team.length?Math.max(...G.team.map(p=>p.lv)):2;
    G.trainer={x:G.player.x+Math.cos(a)*d*TILE,y:G.player.y+Math.sin(a)*d*TILE,t:32,rematchT:0,defeated:false,name:TRAINER_NAMES[Math.floor(Math.random()*TRAINER_NAMES.length)],col:TRAINER_COLS[Math.floor(Math.random()*TRAINER_COLS.length)],team:makeTrainerTeam(lv),idx:0};
    toast('⚔️ Trainer '+G.trainer.name+' is nearby — battle for coins!','var(--gold)');
  }
}
function challengeTrainer(){
  const tr=G.trainer;
  if(!tr)return;
  if(tr.defeated&&tr.rematchT>0){toast(tr.name+' needs a breather — rematch in '+Math.ceil(tr.rematchT)+'s','var(--amber)');return;}
  if(G.duel)return;
  const ap=G.team[G.active];
  if(!ap){toast('Send out a Pal first (📦 Team)','var(--red)');return;}
  const e=tr.team[tr.idx];
  e.x=G.player.x+3*TILE;e.y=G.player.y;e.isDuel=true;e.fromTrainer=true;e.hp=e.maxHp;
  G.seen[e.id]=true;
  G.duel={e,trainer:tr};
  G.wilds.push(e);
  toast('⚔️ '+tr.name+' sends '+speciesOf(e.id).n+' Lv'+e.lv+'!','var(--red)');
  SFX.ride();
}
function updateTrainerDuel(dt){
  const tr=G.trainer;
  if(tr&&tr.nextT!==undefined){
    tr.nextT-=dt;
    if(tr.nextT<=0){
      tr.nextT=undefined;
      const e=tr.team[tr.idx];
      if(e){
        e.x=G.player.x+3*TILE;e.y=G.player.y;e.isDuel=true;e.fromTrainer=true;e.hp=e.maxHp;
        G.seen[e.id]=true;
        G.duel={e,trainer:tr};
        G.wilds.push(e);
        toast('⚔️ '+tr.name+' sends '+speciesOf(e.id).n+' Lv'+e.lv+'!','var(--red)');
        SFX.ride();
      }
    }
  }
}
/* ================= ELDER MIRA (narratrice) ================= */
const MIRA_LINES=[
 '"I knew a girl who drew creatures in the margins of her schoolbooks. She would have loved the volcano."',
 '"The rift was never made of hate. It was made of a winter that forgot how to end."',
 '"Every aurora is her sky, still painting itself, night after night."',
 '"The Sovereign is not evil. It is grief with claws, and it only wants what it lost."',
 '"She asked me once: if you catch a dream, does it stay caught? I think it does — that\'s why you\'re here."',
 '"The crystals hum her favourite song when the moon is out. Listen — if you are quiet enough, you can hear it."',
 '"I water her grave every spring. Not for her — for the flowers. That is what love is, dear: watering flowers for people who can no longer see them."',
 '"She asked me once if you can catch a dream. I said yes — if you are patient, and you do not squeeze."',
 '"The winter took her, but it never took her drawings. The dead keep what they loved. That is all we ever really are."'
];
const BRAM_LINES=[
 'I forged my guilt into iron, boy. That is all a smith can do — turn what hurts into something that holds.',
 'Every blade I sharpen is a promise I failed to keep. Keep yours.',
 'She would have liked this one. Small. Sharp. Honest.'
];
const AVERY_LINES=[
 'I knew a girl who drew creatures. I became a trainer to find her. I am still looking.',
 'She beat me at every game. This one, I win.'
];
function updateMira(dt){
  G.miraT-=dt;
  if(G.mira){
    if(G.mira.cd>0)G.mira.cd-=dt;
    G.mira.t-=dt;
    if(G.mira.t<=0){G.mira=null;G.miraT=0;}
  }else if(G.miraT<=0){
    G.miraT=70;
    const a=Math.random()*6.28,d=4+Math.random()*4;
    G.mira={x:G.player.x+Math.cos(a)*d*TILE,y:G.player.y+Math.sin(a)*d*TILE,t:30,cd:0};
  }
}
function talkMira(){
  if(!G.mira)return;
  if(G.mira.cd>0){toast('🌙 Elder Mira is lost in thought…','var(--dim)');return;}
  const line=MIRA_LINES[G.miraLine%MIRA_LINES.length];
  G.miraLine++;
  G.inv.ess+=2;
  G.mira.cd=35;
  toast('🌙 Elder Mira: '+line+'  (+2 essence)','var(--violet)');
  SFX.quest();
  questEvent('talk');
  saveGame();
}
/* ================= BLACKSMITH BRAM (potenziamenti) ================= */
const UPGRADES=[
 {n:'Sharpen Sword',icon:'⚔️',c:15,desc:'+8 sword damage · permanent',apply:()=>{G.inv.swordLv=(G.inv.swordLv||0)+1;}},
 {n:'Bowstring',icon:'🏹',c:10,desc:'+5 arrow damage · permanent',apply:()=>{G.inv.bowLv=(G.inv.bowLv||0)+1;}},
 {n:'Iron Plating',icon:'🛡️',c:20,desc:'+25 max HP · permanent',apply:()=>{G.player.maxHp+=25;G.player.hp=G.player.maxHp;}}
];
function updateBram(dt){
  G.bramT-=dt;
  if(G.bram){
    G.bram.t-=dt;
    if(G.bram.t<=0){G.bram=null;G.bramT=0;}
  }else if(G.bramT<=0){
    G.bramT=95;
    const a=Math.random()*6.28,d=4+Math.random()*4;
    G.bram={x:G.player.x+Math.cos(a)*d*TILE,y:G.player.y+Math.sin(a)*d*TILE,t:32};
  }
}
function buyUpgrade(idx){
  const u=UPGRADES[idx];
  if((G.inv.coins||0)<u.c){toast('Not enough coins — need '+u.c+' 🪙','var(--red)');return false;}
  G.inv.coins-=u.c;
  u.apply();
  if(G.stat.buys===undefined)G.stat.buys=0;
  G.stat.buys++;
  toast('🔨 '+u.icon+' '+u.n+' — '+u.desc+(G.stat.buys===1?('  ('+BRAM_LINES[Math.floor(Math.random()*BRAM_LINES.length)]+')'):''),'var(--green)');
  SFX.level();
  saveGame();
  renderSmith();
  return true;
}
function renderSmith(){
  const box=$('smithList');box.innerHTML='';
  $('smithCoins').textContent=(G.inv.coins||0)+' coins';
  UPGRADES.forEach((u,i)=>{
    const div=document.createElement('div');div.className='row';
    div.innerHTML='<span>'+u.icon+'</span><span class="nm">'+u.n+'</span><span class="st">'+u.desc+' · '+u.c+' 🪙</span>'+
      '<button class="minibtn gold" data-u="'+i+'">Buy</button>';
    box.appendChild(div);
    div.querySelector('[data-u]').onclick=()=>buyUpgrade(i);
  });
}

