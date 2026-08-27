/* ================= SPAWNING ================= */
function spawnWild(force){
  if(G.wilds.length>=70)return; /* cap rigoroso a 70 */
  if(G.dungeon||G.tower)return; /* niente spawn normali in dungeon/torre */
  const season=curSeason();
  for(let tries=0;tries<4;tries++){
    const a=Math.random()*6.28,d=7+Math.random()*9;
    const x=G.player.x+Math.cos(a)*d*TILE,y=G.player.y+Math.sin(a)*d*TILE;
    if(solidAt(x,y))continue;
    const tx=Math.floor(x/TILE),ty=Math.floor(y/TILE);
    const bm=biomeAt(tx,ty);if(bm==='ocean')continue;
    const night=G.time>0.68;
    const meteor=G.event&&G.event.type==='meteor';
    const pool=SPECIES.filter(s=>{
      if(meteor&&s.rar<1&&s.type!=='void'&&s.type!=='fire')return false;
      return (s.biome==='void'||s.biome===bm)&&(night||!s.noct)&&!s.evTo&&(s.season===undefined||s.season===season);
    });
    if(!pool.length)pool.push(SPECIES[0]);
    /* peso: Pal di stagione molto più comuni; bonus per tipo dominante */
    const wp=[];
    for(const s of pool){
      let w=1;
      if(s.season===season)w+=4;
      if(G.event&&G.event.type==='eclipse'&&(s.type==='void'||s.type==='fire'))w+=6;
      if(season===0&&s.type==='grass')w+=1;
      if(season===1&&s.type==='fire')w+=2;
      if(season===2&&(s.type==='grass'||s.type==='fire'))w+=1;
      if(season===3&&s.type==='ice')w+=2;
      for(let i=0;i<w;i++)wp.push(s);
    }
    const sp=wp[Math.floor(Math.random()*wp.length)];
    G.seen[sp.id]=true;
    G.wilds.push(makeWild(sp,{x,y}));
    break;
  }
}
function initBosses(){
  G.bosses=[];
  const bossMap={grass:'groveheart',desert:'magmalord',snow:'blizzarion',volcano:'ashmoth',crystal:'prismoth'};
  const bmList=['grass','desert','snow','volcano','crystal'];
  bmList.forEach((bm,i)=>{
    for(let tries=0;tries<260;tries++){
      const tx=clamp(Math.floor(180+i*430+Math.random()*400),90,WORLD_T-90);
      const ty=clamp(Math.floor(250+Math.random()*1150),90,WORLD_T-90);
      if(biomeAt(tx,ty)===bm&&!solidAt(tx*TILE,ty*TILE)){
        const sp=SPECIES.find(s=>s.id===bossMap[bm]);
        const b=makeWild(sp,{x:tx*TILE,y:ty*TILE});
        b.isBoss=true;b.lv=12;b.maxHp=b.hp*6;b.hp=b.maxHp;b.atk=b.atk*2;b.spd=b.spd*0.9;b.fx=1;
        G.bosses.push(b);break;
      }
    }
  });
}
function wildsNear(){return G.wilds.filter(w=>dist(w,G.player)<24*TILE);}

