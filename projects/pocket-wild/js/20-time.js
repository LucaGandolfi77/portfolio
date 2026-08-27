/* ================= EVENTS (meteore + eclissi) ================= */
function eclipseMult(){return G.event&&G.event.type==='eclipse'?1.5:1;}
function startEclipse(){
  G.stat.eclipse=(G.stat.eclipse||0)+1;
  playCutscene('eclipse');
  toast('🌒 THE ECLIPSE — the Void bleeds into the world!','var(--violet)');
  SFX.evolve();
  for(let i=0;i<3;i++)spawnEcho();
}
function spawnEcho(){
  const pool=SPECIES.filter(s=>s.type==='void'||s.type==='fire');
  if(!pool.length)return;
  const sp=pool[Math.floor(Math.random()*pool.length)];
  for(let t=0;t<40;t++){
    const a=Math.random()*6.28,d=5+Math.random()*7;
    const x=G.player.x+Math.cos(a)*d*TILE,y=G.player.y+Math.sin(a)*d*TILE;
    if(solidAt(x,y)||biomeAt(Math.floor(x/TILE),Math.floor(y/TILE))==='ocean')continue;
    const w=makeWild(sp,{x,y});
    w.lv=8+Math.floor(Math.random()*6);scalePal(w,w.lv);
    w.echo=true;w.fx=1;
    G.seen[sp.id]=true;
    G.wilds.push(w);
    return;
  }
}
function updateEvent(dt){
  if(G.event){
    G.event.t-=dt;
    if(G.event.t<=0)G.event=null;
  }else if(G.day%9===0&&G.time>0.72&&!G.event){
    G.event={type:'eclipse',t:30};
    startEclipse();
  }else if(G.day%3===0&&G.time>0.68&&!G.event){
    G.event={type:'meteor',t:25};
    toast('☄️ Meteor shower! Rare Pals are falling…','var(--gold)');
    SFX.evolve();
  }
}

/* ================= DAY / NIGHT + WEATHER + SEASONS ================= */
function updateTime(dt){
  G.time+=dt/90; /* full cycle ~90s */
  if(G.time>=1){
    G.time=0;G.day++;
    if(G.day===7)playCutscene('day7');
    if(seasonOf(G.day)!==seasonOf(G.day-1)){
      const s=SEASONS[seasonOf(G.day)];
      G.stat.seasonsSeen[seasonOf(G.day)]=1;
      toast(s.icon+' '+s.n+' has arrived! '+s.fx+' — '+s.desc,'var(--violet)');
      SFX.evolve();
    }
    toast('🌅 Day '+G.day,'var(--gold)');
  }
  const s=SEASONS[curSeason()];
  $('daytag').textContent=(G.time>0.68?'🌙 Night':'☀️ Day '+G.day)+' '+s.icon+s.n;
}
function weatherFor(biome,night,rnd){
  const season=curSeason();
  const r=rnd();
  if(night&&biome==='snow'&&r<0.45)return'aurora';
  if(night&&biome==='crystal'&&r<0.5)return'aurora'; /* cristalli: aurore rifratte */
  if(night&&season===3&&r<SEASONS[3].weath.aurora)return'aurora'; /* inverno: aurore ovunque */
  if(season===1){ /* estate: niente pioggia, più tempeste di sabbia */
    if(r<SEASONS[1].weath.sandstorm)return'sandstorm';
    return'clear';
  }
  if(biome==='desert'&&r<0.5)return'sandstorm';
  if(biome==='volcano'&&r<0.55)return'sandstorm'; /* cenere vulcanica */
  if(season===0&&r<0.5)return'rain'; /* primavera: piogge leggere più frequenti */
  if(r<0.38)return'rain';
  return'clear';
}
const WEATHER_ICON={clear:'🌤️',rain:'🌧️',sandstorm:'🌪️',aurora:'🌌'};
function updateWeather(dt){
  G.weatherT-=dt;
  if(G.weatherT<=0){
    G.weatherT=30+Math.random()*25;
    const tx=Math.floor(G.player.x/TILE),ty=Math.floor(G.player.y/TILE);
    G.weather=weatherFor(biomeAt(tx,ty),G.time>0.68,Math.random);
    $('weathtag').textContent=WEATHER_ICON[G.weather];
    if(G.weather==='aurora')questEvent('aurora');
    if(G.weather!=='clear')toast('🌦 '+G.weather.toUpperCase()+' rolling in','var(--dim)');
  }
}
/* ================= HUNGER ================= */
function updateHunger(dt){
  if(G.mode==='zen')return; /* sandbox: niente fame */
  G.hunger=Math.max(0,G.hunger-0.6*dt*diffMult('hunger'));
  if(G.hunger<=0)G.player.hp-=2*dt;
  if(G.hunger<25){
    if((G.inv.stew||0)>0){G.hunger=Math.min(100,G.hunger+60);G.inv.stew--;toast('🍲 Ate stew','var(--gold)');}
    else if((G.inv.cooked||0)>0){G.hunger=Math.min(100,G.hunger+40);G.inv.cooked--;}
    else if((G.inv.berry||0)>=2){G.hunger=Math.min(100,G.hunger+15);G.inv.berry--;}
  }
}
/* ================= PAL WORK (gather) ================= */
function updateWorkPals(dt){
  for(let ti=0;ti<G.team.length;ti++){
    const p=G.team[ti];
    if(p.work!=='gather'||ti===G.active)continue;
    p.cd=(p.cd||0)-dt;
    const tx=Math.floor(p.x/TILE),ty=Math.floor(p.y/TILE);
    let gathered=false;
    if(p.cd<=0){
      for(const[ox,oy]of[[0,0],[1,0],[-1,0],[0,1],[0,-1]]){
        const o=tileObj(tx+ox,ty+oy);
        if(o){
          if(o==='tree')G.inv.wood+=gatherMultOf('wood');
          else if(o==='rock')G.inv.stone++;
          else if(o==='berry')G.inv.berry+=gatherMultOf('berry');
          else if(o==='bush')G.inv.grass+=gatherMultOf('grass');
          p.cd=0.6;gathered=true;questEvent('gather');stylePush('gather');
          break;
        }
      }
    }
    if(!gathered){
      p.wanderT-=dt;
      if(p.wanderT<=0){p.wanderT=1+Math.random()*2;p.wanderD=Math.random()*6.28;}
      const sp=speciesOf(p.id);
      let nx=p.x+Math.cos(p.wanderD)*sp.spd*40*dt,ny=p.y+Math.sin(p.wanderD)*sp.spd*40*dt;
      if(!solidAt(nx,ny)){p.x=nx;p.y=ny;}
    }
  }
}

