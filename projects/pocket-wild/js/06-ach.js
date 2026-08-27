/* ================= ACHIEVEMENTS (profilo persistente) ================= */
const ACH_DEFS=[
 {id:'first_catch',n:'First Catch',d:'Catch your first Pal',icon:'🔮'},
 {id:'catcher',n:'Collector',d:'Catch 10 different species',icon:'📖'},
 {id:'paldexer',n:'Paldexer',d:'See 20 different species',icon:'🌍'},
 {id:'evolver',n:'Evolutionist',d:'Evolve a Pal',icon:'✨'},
 {id:'builder',n:'Architect',d:'Build 5 structures',icon:'🏗️'},
 {id:'trader',n:'Trader',d:'Hold 30 coins',icon:'🪙'},
 {id:'rich',n:'Rich',d:'Hold 100 coins',icon:'💰'},
 {id:'breeder',n:'Breeder',d:'Hatch an egg at the Ranch',icon:'🥚'},
 {id:'trainer_slayer',n:'Trainer Slayer',d:'Beat 3 wandering trainers',icon:'⚔️'},
 {id:'alpha',n:'Alpha Hunter',d:'Defeat an Alpha boss',icon:'🏆'},
 {id:'hero',n:'Hero of the Wilds',d:'Defeat the Void Sovereign',icon:'🌑'},
 {id:'survivor',n:'Survivor',d:'Reach day 7',icon:'⛺'},
 {id:'seasoned',n:'Seasoned',d:'See all 4 seasons',icon:'🌸'},
 {id:'splicer',n:'Splicer',d:'Splice a gene',icon:'🧬'},
 {id:'fuseman',n:'Fusionist',d:'Fuse two Pals',icon:'🔀'},
 {id:'creator',n:'Creator',d:'Synthesize a custom Pal',icon:'🎨'},
 {id:'eclipse',n:'Eclipse Watcher',d:'Witness the Eclipse Night',icon:'🌒'},
 {id:'tower',n:'Tower Legend',d:'Conquer the Tower of Trials',icon:'🗼'},
 {id:'angler',n:'Angler',d:'Catch a Pal while fishing',icon:'🎣'},
 {id:'diarist',n:'Keeper of Dreams',d:'Complete Lina\'s diary (see all 33 species)',icon:'📓'}
];
const PROFILE_KEY='pocketwild_profile';
let ACH={a:{}};
try{const d=JSON.parse(localStorage.getItem(PROFILE_KEY));if(d&&d.a)ACH={a:d.a};}catch(e){}
function saveProfile(){try{localStorage.setItem(PROFILE_KEY,JSON.stringify(ACH));}catch(e){}}
function checkAch(){
  if(!G.running)return;
  const st=G.stat;
  const tryAch=(id,cond)=>{
    if(cond&&!ACH.a[id]){
      ACH.a[id]=1;saveProfile();
      if(!SILENT){
        const def=ACH_DEFS.find(a=>a.id===id);
        toast('🏆 Achievement: '+def.icon+' '+def.n+' — '+def.d,'var(--gold)');
        SFX.quest();
      }
    }
  };
  tryAch('first_catch',st.catches>=1);
  tryAch('catcher',Object.keys(G.dex).length>=10);
  tryAch('paldexer',Object.keys(G.seen).length>=20);
  tryAch('evolver',st.evolves>=1);
  tryAch('builder',G.buildings.length>=5);
  tryAch('trader',(G.inv.coins||0)>=30);
  tryAch('rich',(G.inv.coins||0)>=100);
  tryAch('breeder',st.eggs>=1);
  tryAch('trainer_slayer',st.trainers>=3);
  tryAch('alpha',st.alphas>=1);
  tryAch('hero',G.complete===true);
  tryAch('survivor',G.day>=7);
  tryAch('seasoned',Object.keys(st.seasonsSeen||{}).length>=4);
  tryAch('splicer',st.splices>=1);
  tryAch('fuseman',st.fusions>=1);
  tryAch('creator',st.customs>=1);
  tryAch('eclipse',(st.eclipse||0)>=1);
  tryAch('tower',(st.towerWins||0)>=1);
  tryAch('angler',(st.fished||0)>=1);
  tryAch('diarist',Object.keys(G.seen).length>=SPECIES.length);
  /* quest diario: avanza col numero di specie viste */
  const dq=G.quests.find(q=>q.type==='diary');
  if(dq&&dq.done<dq.t&&questUnlocked(dq)){
    const seenN=Object.keys(G.seen).length;
    if(seenN>dq.done){
      dq.done=Math.min(dq.t,seenN);
      if(dq.done>=dq.t){
        questReward(dq);
        if(!SILENT){toast('📓 Diary complete: '+dq.desc,'var(--gold)');SFX.quest();}
      }
    }
  }
}

