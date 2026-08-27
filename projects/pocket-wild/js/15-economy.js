/* ================= COINS & TRADER ================= */
const SELL_PRICE={grass:3,wood:2,berry:2,stone:2,ess:2}; /* quantità → 1 coin */
const BUY_ITEMS=[
 {n:'Sphere',icon:'🔮',c:3,give:()=>addSphere(0,1)},
 {n:'Great Sphere',icon:'🔵',c:6,give:()=>addSphere(1,1)},
 {n:'Ultra Sphere',icon:'💗',c:12,give:()=>addSphere(2,1)},
 {n:'Potion',icon:'🧪',c:5,give:()=>G.inv.potion=(G.inv.potion||0)+1},
 {n:'Berry Seeds',icon:'🌱',c:4,give:()=>G.inv.seeds=(G.inv.seeds||0)+1},
 {n:'Skill Scroll',icon:'📜',c:10,give:()=>G.inv.scroll=(G.inv.scroll||0)+1},
 {n:'Sword',icon:'⚔️',c:15,give:()=>{G.inv.sword=1;G.equip='sword';}},
 {n:'Bow',icon:'🏹',c:12,give:()=>{G.inv.bow=1;G.equip='bow';}}
];
function tradeSell(key){
  const need=SELL_PRICE[key];
  if((G.inv[key]||0)<need){toast('Not enough '+key+' to sell','var(--amber)');return;}
  G.inv[key]-=need;G.inv.coins=(G.inv.coins||0)+1;
  renderPanel('pTrade');toast('🪙 +1 coin','var(--gold)');
}
function tradeBuy(idx){
  const it=BUY_ITEMS[idx];
  if((G.inv.coins||0)<it.c){toast('Not enough coins','var(--red)');return;}
  G.inv.coins-=it.c;it.give();
  renderPanel('pTrade');toast('🪙 Bought '+it.n,'var(--green)');
}
function updateTrader(dt){
  G.traderT-=dt;
  if(G.trader){
    if(G.traderT<=-35){G.trader=null;G.traderT=0;}
  }else if(G.traderT<=0){
    G.traderT=60;
    const a=Math.random()*6.28,d=5+Math.random()*4;
    G.trader={x:G.player.x+Math.cos(a)*d*TILE,y:G.player.y+Math.sin(a)*d*TILE,t:35};
  }
}
