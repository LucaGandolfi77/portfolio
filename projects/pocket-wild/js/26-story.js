/* ================= STORY INTRO ================= */
const STORY=[
 {bg:'#0b1020',col:'#3ee6ff',shape:0,txt:'Somewhere between the last snowmelt and the first star, there is a world made of light.'},
 {bg:'#0b1020',col:'#52c96b',shape:1,txt:'My sister <span class="lina">Lina</span> drew creatures in her notebook every night — orbs, stars, triangles with round eyes. "They\'re real," she whispered. "They\'re waiting for me."'},
 {bg:'#160f2e',col:'#c26bff',shape:4,txt:'She never got to see them. The winter took her on her 12th birthday — the same night the sky tore open, and the <b>Void Sovereign</b> crawled out of the wound.'},
 {bg:'#0b1020',col:'#ffd166',shape:5,txt:'I found her notebook in the attic. Thirty species, sketched by candlelight. Names in the margins. Little hearts next to her favourites.'},
 {bg:'#0b1020',col:'#3ee6ff',shape:2,txt:'So I came to the wilds. To catch every creature she drew. To see them through her eyes. To close the rift she left behind.'},
 {bg:'#0b1020',col:'#52ff9e',shape:0,txt:'Every Pal you catch is a memory she never got to make. Every quest, a promise kept. Every night survived, a candle kept burning.'},
 {bg:'#0b1020',col:'#c26bff',shape:0,txt:'The world remembers her. Let it remember you too.'},
 {bg:'#0b1020',col:'#ffb8dc',shape:1,txt:'<b style="font-size:clamp(28px,7vw,46px);letter-spacing:4px;background:linear-gradient(90deg,var(--cyan),var(--violet),var(--gold));-webkit-background-clip:text;background-clip:text;color:transparent">POCKET WILD</b><br><span style="color:var(--dim);font-size:13px;letter-spacing:2px">Catch. Build. Mutate. Remember.</span>'}
];
let storyI=0;
function drawStory(){
  const s=STORY[storyI];
  const cv=$('storyCv'),c=cv.getContext('2d');
  c.clearRect(0,0,cv.width,cv.height);
  const g=c.createRadialGradient(110,70,8,110,110,160);
  g.addColorStop(0,s.col);g.addColorStop(0.35,'rgba(62,230,255,.18)');g.addColorStop(1,s.bg);
  c.fillStyle=g;c.fillRect(0,0,cv.width,cv.height);
  /* stelle */
  c.fillStyle='rgba(255,255,255,.5)';
  for(let i=0;i<26;i++){
    const sx=(i*53+17)%cv.width,sy=(i*37+11)%cv.height;
    c.fillRect(sx,sy,1.4,1.4);
  }
  drawPalShape(c,110,112,46,s.col,s.shape,0.5,1);
  c.fillStyle='rgba(0,0,0,.4)';c.fillRect(70,168,80,6);
  const dots=$('storyDots');dots.innerHTML='';
  STORY.forEach((_,i)=>{const d=document.createElement('i');if(i===storyI)d.className='on';dots.appendChild(d);});
  const txt=$('storyTxt');
  txt.innerHTML=s.txt;
  txt.classList.remove('in');
  requestAnimationFrame(()=>requestAnimationFrame(()=>txt.classList.add('in')));
  $('btnStoryNext').textContent=storyI<STORY.length-1?'Continue ▶':'Begin the journey ✦';
}
function storyNext(){
  if(storyI<STORY.length-1){storyI++;drawStory();}
  else skipStory();
}
function skipStory(){$('story').classList.remove('on');$('start').style.display='flex';}
function showStory(){storyI=0;$('story').classList.add('on');drawStory();}
$('btnStoryNext').onclick=storyNext;
$('storySkip').onclick=e=>{e.stopPropagation();skipStory();};
$('story').addEventListener('click',e=>{if(e.target.id!=='storySkip')storyNext();});


/* ================= CUTSCENES — MORTE E REDENZIONE =================
   "La memoria involontaria" (Proust): certi atti risvegliano il passato.
   "La sofferenza è l'origine della coscienza" (Dostoevskij): la colpa si
   redime solo attraversandola. "I morti non se ne vanno; cambiano l'acqua
   ai fiori" (Valerie Perrin): ogni cura è una preghiera laica. */
const CUTSCENES={
 first_catch:[
  ['NARRATOR','The first Pal you catch is a Grassling — the one she drew on the very first page of the notebook.'],
  ['LINA','His name is Pebble. He gets scared of thunder. Be patient with him.'],
  ['NARRATOR','You had forgotten you could still hear her voice this clearly. That is the cruelest thing about the dead — they stay.']
 ],
 first_evolve:[
  ['NARRATOR','Growth, she wrote in the margin of page thirty-one, is just grief that learned how to move.'],
  ['LINA','See? Nothing stays small forever. Not even winter. Not even me.'],
  ['NARRATOR','The old shell falls away. Something underneath has been patient for a very long time.']
 ],
 day7:[
  ['NARRATOR','Day seven. The smell of wet wool and burnt sugar — the kitchen of that house, and you are seven years old again.'],
  ['YOU','I hate you! I wish the world would just STOP!'],
  ['LINA','Don\'t say that. Please. You don\'t mean it. You never mean it.'],
  ['NARRATOR','But the world heard you. That night the sky tore open, and the winter that took her was the winter you had wished for.'],
  ['LINA','It\'s okay. It was never your fault. It was never you.'],
  ['NARRATOR','You have been running from this memory for years. Tonight it found you. This place is a long hallway of things you said — and every door is a word you never took back.'],
  ['NARRATOR','Dostoevsky wrote that suffering is the origin of consciousness. You are beginning to understand what he meant.']
 ],
 alpha_first:[
  ['NARRATOR','The Alpha falls. Its heart is a stone the size of a fist — the size of a grudge.'],
  ['MIRA','Every grudge you bury becomes a creature, dear. Feed them enough pain and they grow crowns. She knew that. She forgave anyway.'],
  ['NARRATOR','You hold the stone. It is warm. It is almost — sorry.']
 ],
 eclipse:[
  ['NARRATOR','The eclipse is not the world going dark. It is the world showing you what you did, one slow breath at a time.'],
  ['LINA','Look at the echoes. They\'re your memories, wearing their best clothes, coming to say hello.'],
  ['NARRATOR','The Void does not hate you. It is only grief with claws, and it has been waiting all these years to be held.']
 ],
 tower_champion:[
  ['NARRATOR','At the top of the tower, the Champion wears a small crown — a paper one, the kind a child folds in class when she is bored.'],
  ['LINA','I bet you could reach the top. I bet you\'d be brave. I bet you\'d come back.'],
  ['NARRATOR','You reach out and take the paper crown. It fits. It always did.']
 ],
 fishing:[
  ['NARRATOR','The water remembers everything. Every tear, every rain, every winter that ever tried to be kind.'],
  ['LINA','She used to say the sea was just the sky that got tired of falling.'],
  ['NARRATOR','You pull the line, and something silver and afraid comes up into the light — and for a second, you are not afraid of it.']
 ],
 flight:[
  ['NARRATOR','From up here the world is small and forgiven — all the sharp edges filed soft by distance.'],
  ['LINA','If you ever learn to fly, don\'t come back for me. Come back for you.'],
  ['NARRATOR','The wind carries the smell of wet wool and burnt sugar. This time, it does not hurt.']
 ],
 death_first:[
  ['NARRATOR','You fall. The dark is not unkind — it is only dark.'],
  ['LINA','Somewhere a girl is drawing you, waking up. She draws everyone she loves waking up.'],
  ['NARRATOR','You wake at the bed, whole. She was right. She was always right.'],
  ['NARRATOR','That is what redemption is, you think — not never falling. Being drawn awake, over and over, by someone who refused to stop believing.']
 ],
 confession:[
  ['NARRATOR','The rift is not a door. It is a question you have been avoiding since you were seven.'],
  ['YOU','I\'m sorry. I\'m sorry. I\'m sorry.'],
  ['LINA','Then put it down. Walk through. There\'s only one thing in there, and it\'s the you that said it.'],
  ['NARRATOR','Proust wrote that the only true paradise is the paradise we have lost. Tonight you walk into yours, weapon in hand, heart in throat.'],
  ['LINA','Come find me on the other side. I\'ll be the one drawing.']
 ],
 redemption:[
  ['NARRATOR','The Sovereign dissolves — not into dust, but into light. It was never a monster. It was a seven-year-old\'s anger, grown lonely in the dark.'],
  ['LINA','You did it. You came back through the whole winter to find me.'],
  ['YOU','I\'d do it a thousand times.'],
  ['LINA','I know. That\'s why I drew you. That\'s why I always will.'],
  ['NARRATOR','Valerie Perrin would say the dead don\'t leave; they just change the water of the flowers. The winter is over. The garden is yours.'],
  ['NARRATOR','Somewhere, in a kitchen that smells of wet wool and burnt sugar, a kettle sings — and nobody wishes the world to stop. Not anymore.']
 ]
};
const CUT={queue:[],i:0,timer:null,typing:false,onDone:null,wasRunning:true};
function playCutscene(id,onDone){
  if(SILENT)return;
  if(G.memories&&G.memories[id])return;
  if(!CUTSCENES[id])return;
  G.memories[id]=1;saveGame();
  CUT.queue=CUTSCENES[id].map(l=>({who:l[0],txt:l[1]}));
  CUT.i=0;CUT.onDone=onDone||null;
  CUT.wasRunning=G.running;
  G.running=false; /* pausa il mondo: il tempo passa solo nei ricordi */
  $('cutscene').classList.add('on');
  showCutLine();
}
function showCutLine(){
  const l=CUT.queue[CUT.i];
  const sp=$('cutSpeaker'),ln=$('cutLine');
  sp.textContent=l.who==='NARRATOR'?'🎙 NARRATOR':('💬 '+l.who);
  sp.className='speaker '+l.who;
  ln.textContent='';
  CUT.typing=true;
  let k=0;
  if(globalThis.__TEST__){ln.textContent=l.txt;CUT.typing=false;return;} /* test: niente timer */
  CUT.timer=setInterval(()=>{
    k++;
    ln.textContent=l.txt.slice(0,k);
    if(k>=l.txt.length){clearInterval(CUT.timer);CUT.typing=false;SFX.quest();}
  },16);
}
function cutNext(){
  if(CUT.typing){ /* completa la riga corrente */
    const l=CUT.queue[CUT.i];
    $('cutLine').textContent=l.txt;
    if(CUT.timer){clearInterval(CUT.timer);CUT.timer=null;}
    CUT.typing=false;
    return;
  }
  CUT.i++;
  if(CUT.i>=CUT.queue.length){
    $('cutscene').classList.remove('on');
    G.running=CUT.wasRunning;
    if(CUT.onDone){const fn=CUT.onDone;CUT.onDone=null;fn();}
    return;
  }
  showCutLine();
}
$('cutscene').addEventListener('click',cutNext);

/* ================= VOCI PER BIOMA (whisper del narratore) ================= */
const BIOME_WHISPERS={
 grass:'Grass, she wrote, is the colour of a promise kept.',
 forest:'The forest keeps her drawings — the ones she never finished.',
 desert:'Desert. She said the dunes were the world holding its breath.',
 snow:'Snow. Be careful here. This is where the winter lives.',
 ocean:'The sea. The sky that got tired of falling.',
 volcano:'Volcano. The earth\'s anger — patient and warm. Not like yours.',
 crystal:'Crystals. She said they hum her song when the moon is out. Listen.'
};
let whisperTimer=null;
function whisper(txt){
  if(SILENT)return;
  const w=$('whisper');
  w.innerHTML='<span class="w">🎙</span> '+txt;
  w.classList.add('in');
  if(globalThis.__TEST__)return;
  if(whisperTimer)clearTimeout(whisperTimer);
  whisperTimer=setTimeout(()=>w.classList.remove('in'),6000);
}
function updateBiomeVoice(){
  if(!G.running||SILENT)return;
  const bm=biomeAt(Math.floor(G.player.x/TILE),Math.floor(G.player.y/TILE));
  if(bm===G.lastBiome)return;
  G.lastBiome=bm;
  if(!G.stat.biomeVoices)G.stat.biomeVoices={};
  if(!G.stat.biomeVoices[bm]&&BIOME_WHISPERS[bm]){
    G.stat.biomeVoices[bm]=1;
    whisper(BIOME_WHISPERS[bm]);
  }
}

/* ================= LA VOCE DEL SOVEREIGN (in battaglia) ================= */
let bossVoiceTimer=null;
function sovereignSays(txt){
  if(SILENT)return;
  const b=$('bossvoice');
  b.innerHTML='<span class="s">THE SOVEREIGN</span> — '+txt;
  b.classList.add('in');
  G.lastBossVoice=txt; /* per i test */
  if(globalThis.__TEST__)return;
  if(bossVoiceTimer)clearTimeout(bossVoiceTimer);
  bossVoiceTimer=setTimeout(()=>b.classList.remove('in'),4200);
  try{SFX.tone(70,0.8,'sawtooth',0.02,0,55);}catch(e){}
}

/* ================= DIARIO DI LINA (33 pagine) ================= */
const LINA_NOTES={
 grassling:'Page 1. Pebble. He gets scared of thunder, so I drew him a storm-proof smile. He was the first one I ever saw.',
 bushelder:'Pebble grew thorns. I told him he didn\'t have to be soft to be loved. He believed me, mostly.',
 groveheart:'The heart of the forest. I heard it beat once, from very far away. It was warm, like a kitchen.',
 emberpup:'Emberpup. Warm as toast. I kept him under my bed on cold nights and pretended I wasn\'t lonely.',
 flarefang:'He learned to bite before he learned to forgive. Some of us do. I drew him a gentler jaw.',
 magmalord:'The lord of the dunes. He carries a whole summer inside his chest. I want to be that warm.',
 frostbite:'Frostbite. Cold as a whisper. I drew him a scarf and he let me.',
 glaciowl:'He hunts under auroras. I think he\'s looking for something too. I think we all are.',
 blizzarion:'A walking storm. When I\'m scared I draw him calm. Drawing is the only way I know to calm things.',
 puddlin:'Puddlin! Made of rain. I named her after the sound of shoes in April.',
 torrentail:'He swims through sand. I don\'t know how that works. I drew it anyway — that\'s what sisters do, they draw what they don\'t understand.',
 duskbat:'Only comes out at night. Like my brother\'s moods. I love him anyway. Both of them.',
 nightwing:'Silent over the dark. If I could fly, I\'d be him — and I\'d come back every morning just to say good morning.',
 sparklet:'SPARKLET. ♥♥♥ My absolute favourite. Static on four legs. I once made him spark on purpose to light the hallway.',
 sporeling:'A glowing mushroom. I asked him to glow when I\'m afraid. He glows for everyone, but I pretend it\'s for me.',
 fungalord:'Warden of the fungal wood. He looks scary. So does my brother when he\'s sad. Neither of them means it.',
 cindercrab:'He clacks with embers. I drew him a tiny crown. Every crab deserves a crown.',
 snowhare:'Bounces on powder. I threw a snowball at him once and he forgave me instantly. I want to be that.',
 frosthoof:'His hooves freeze ponds. When the world is too loud I imagine his quiet. It helps.',
 tideling:'Tides follow her. I think she\'s the sea\'s daughter. I think the sea is sad too, sometimes.',
 voltmouse:'He chews through cables. He ate my lamp cord and I laughed for an hour. Grief does that — it laughs when it can.',
 glimmerfly:'A living aurora mote. ♥ I caught him in a jar once and let him go the same night. Some things you only keep by letting go.',
 bloompuff:'Spring. She blooms where the winter cried. I would know. I cried here once.',
 suncub:'Summer. He basks and forgives everyone by noon. I\'m learning from him.',
 maplewisp:'Autumn. He rides the wind that takes the leaves. He says falling isn\'t losing — it\'s painting.',
 snowfawn:'Winter. He only comes in deep winter, like the end of a story. But winter always ends. That\'s the whole point.',
 lavad:'Molten to the core. I told him his anger was allowed to exist. Nobody told me that, so I tell everyone.',
 ashmoth:'Ash is just a thing that was burning and is now remembering. ♥',
 crystalmite:'A living shard. Sharp outside, light inside. I drew him a softer edge and he kept the light.',
 prismoth:'Bends starlight. ♥ My other favourite. If I could give you one creature to find, it would be him.',
 finling:'The first one I ever dreamed about. ♥ The sea remembered me before I remembered it.',
 jellyvolt:'She lights up the deep. I\'m afraid of the deep. She says the dark is only unlit.',
 abyssoul:'He remembers the surface world. I will remember it too. That\'s what I\'m for.'
};
const DIARY_FAVOURITES=['grassling','sparklet','glimmerfly','ashmoth','prismoth','finling'];
function diaryPageState(sp){
  if(G.seen[sp.id])return G.dex[sp.id]?'caught':'seen';
  return 'locked';
}
function renderDiary(){
  const box=$('diaryGrid');box.innerHTML='';
  const detail=$('diaryDetail');detail.classList.remove('on');detail.innerHTML='';
  let seen=0,caught=0;
  const grid=document.createElement('div');grid.className='dexgrid';
  SPECIES.forEach((sp,i)=>{
    const st=diaryPageState(sp);
    if(st!=='locked')seen++;
    if(st==='caught')caught++;
    const cell=document.createElement('div');cell.className='dpage'+(st==='locked'?'':'');
    const cv=document.createElement('canvas');cv.width=44;cv.height=44;
    const c=cv.getContext('2d');
    if(st==='locked'){
      c.fillStyle='rgba(138,146,200,.25)';c.beginPath();c.arc(22,24,12,0,6.283);c.fill();
      c.fillStyle='rgba(138,146,200,.5)';c.font='10px sans-serif';c.textAlign='center';c.fillText('?',22,27);
    }else{
      drawPalShape(c,22,24,12,sp.col,sp.shape,0.5,1);
    }
    cell.appendChild(cv);
    const nm=document.createElement('div');nm.className='dn';nm.textContent=st==='locked'?('Page '+(i+1)):sp.n+(DIARY_FAVOURITES.includes(sp.id)?' ♥':'');
    const ds=document.createElement('div');ds.className='ds';ds.textContent=st==='locked'?'locked':(st==='caught'?'caught':'sketch');
    cell.appendChild(nm);cell.appendChild(ds);
    cell.onclick=()=>{
      detail.classList.add('on');
      if(st==='locked'){detail.innerHTML='<div class="pg">Page '+(i+1)+' of 33</div><div style="color:var(--dim)">Still sealed. Go find this one in the wilds — she drew it for a reason.</div>';return;}
      detail.innerHTML='<div class="pg">Page '+(i+1)+' of 33'+(DIARY_FAVOURITES.includes(sp.id)?' · ♥ favourite':'')+'</div>'+
        '<div style="display:flex;gap:10px;align-items:center;margin:8px 0"><canvas id="diaryCv" width="56" height="56"></canvas><div><b style="color:'+sp.col+'">'+sp.n+'</b> <span class="st">· '+st+' · '+TYPE_ICON[sp.type]+(sp.type2?' '+TYPE_ICON[sp.type2]:'')+'</span></div></div>'+
        '<div class="note">"'+LINA_NOTES[sp.id]+'"</div>'+
        '<div class="st" style="margin-top:8px">— Lina, age 11</div>';
      const dc=detail.querySelector('#diaryCv');if(dc)drawPalShape(dc.getContext('2d'),28,28,16,sp.col,sp.shape,0.5,1);
    };
    grid.appendChild(cell);
  });
  box.appendChild(grid);
  $('diaryCountTxt').textContent=seen+' / '+SPECIES.length+' pages · '+caught+' caught';
}
