/* ================= QUESTS (chain) ================= */
/*
 * Le quest sono organizzate in CAPITOLI: una quest del capitolo N+1 si
 * sblocca solo quando TUTTE le quest dei capitoli precedenti sono complete.
 * Capitolo 4 sblocca la VOID RIFT (boss finale).
 */
const QUEST_DEFS=[
 /* — Chapter 1: First Steps — */
 {id:'c1',ch:1,desc:'Catch 3 wild Pals',type:'catch',t:3,r:{ess:3,sphere0:1},done:0},
 {id:'g1',ch:1,desc:'Gather 15 resources',type:'gather',t:15,r:{ess:2},done:0},
 {id:'b1',ch:1,desc:'Build a campfire',type:'build',t:1,r:{ess:4},done:0},
 {id:'cr1',ch:1,desc:'Craft 2 spheres',type:'craftSphere',t:2,r:{ess:2},done:0},
 /* — Chapter 2: Rise — */
 {id:'c2',ch:2,desc:'Catch 8 wild Pals',type:'catch',t:8,r:{ess:6,sphere1:1},done:0},
 {id:'k1',ch:2,desc:'Defeat 6 wild Pals',type:'defeat',t:6,r:{ess:8},done:0},
 {id:'b2',ch:2,desc:'Build any 3 structures',type:'build',t:3,r:{sphere1:1,ess:5},done:0},
 {id:'ev1',ch:2,desc:'Evolve a Pal',type:'evolve',t:1,r:{ess:6},done:0},
 /* — Chapter 3: Frontiers — */
 {id:'k2',ch:3,desc:'Defeat 12 wild Pals',type:'defeat',t:12,r:{ess:12,sphere2:1},done:0},
 {id:'bo1',ch:3,desc:'Defeat an Alpha boss',type:'boss',t:1,r:{sphere2:1,ess:10},done:0},
 {id:'ruin1',ch:3,desc:'Clear a Ruin dungeon',type:'ruin',t:1,r:{ess:8,sphere1:1},done:0},
 {id:'tr1',ch:3,desc:'Beat a wandering trainer',type:'trainer',t:1,r:{ess:8,coins:15},done:0},
 /* — Chapter 4: The Reckoning — */
 {id:'fb1',ch:4,desc:'Defeat the VOID SOVEREIGN',type:'finalboss',t:1,r:{},done:0},
 /* — Chapter 5: The Wilds Beyond (dopo il boss finale) — */
 {id:'v1',ch:5,desc:'Catch a Pal from the Volcano',type:'catchVolcano',t:1,r:{ess:10,sphere2:1},done:0},
 {id:'c1',ch:5,desc:'Catch a Pal from the Crystal Plains',type:'catchCrystal',t:1,r:{ess:10,sphere2:1},done:0},
 {id:'far1',ch:5,desc:'Travel 3,000 tiles across the wilds',type:'travel',t:3000,r:{ess:15},done:0},
 {id:'wea1',ch:5,desc:'Witness an aurora over the crystals',type:'aurora',t:1,r:{ess:8},done:0},
 {id:'mira1',ch:5,desc:'Listen to Elder Mira 3 times',type:'talk',t:3,r:{ess:6},done:0},
 {id:'sea1',ch:5,desc:'Fish up a Pal from the deep',type:'catchSea',t:1,r:{ess:8,sphere1:1},done:0},
 {id:'tw1',ch:5,desc:'Conquer the Tower of Trials',type:'tower',t:1,r:{ess:20,sphere2:2},done:0},
 {id:'dia1',ch:5,desc:'Complete Lina\'s diary (see all 33 species)',type:'diary',t:33,r:{ess:30,sphere2:2},done:0}
];
const QUEST_CHAPTERS={1:'🌱 First Steps',2:'⬆ Rise',3:'🗺 Frontiers',4:'🌑 The Reckoning',5:'🗻 The Wilds Beyond'};
function initQuests(){G.quests=QUEST_DEFS.map(q=>Object.assign({done:0},q));}
function questChapterDone(ch){
  return G.quests.filter(q=>q.ch<=ch).every(q=>q.done>=q.t);
}
function questUnlocked(q){
  return q.ch<=1||questChapterDone(q.ch-1);
}
function questEvent(type,amt=1){
  for(const q of G.quests){
    if(q.done>=q.t)continue;
    if(!questUnlocked(q))continue; /* capitolo bloccato */
    if(q.type===type){
      q.done=Math.min(q.t,q.done+amt);
      if(q.done>=q.t){
        SFX.quest();
        toast('📋 Quest complete: '+q.desc,'var(--gold)');
        questReward(q);
        /* nuova quest sbloccata? */
        if(questChapterDone(q.ch)&&!questChapterDone(q.ch+1)){
          toast('🔓 Chapter '+Math.min(q.ch+1,4)+' unlocked!','var(--cyan)');
          if(q.ch+1===4)maybeSpawnRift();
        }
      }
    }
  }
}
function questReward(q){
  if(q.r.ess)G.inv.ess+=q.r.ess;
  if(q.r.coins)G.inv.coins=(G.inv.coins||0)+q.r.coins;
  if(q.r.sphere!==undefined)addSphere(q.r.sphere,1);
  if(q.r.sphere0!==undefined)addSphere(0,1);
  if(q.r.sphere1!==undefined)addSphere(1,1);
  if(q.r.sphere2!==undefined)addSphere(2,1);
}
function addSphere(tier,n){G.sph[tier]=(G.sph[tier]||0)+n;}

