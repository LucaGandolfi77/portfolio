/* Economy Engine — hearts, pearls, streak freeze */
(function(){
  var MAX_HEARTS=5;
  var REFILL_INTERVAL=4*60*60*1000;
  var PEARL_QUEST=2,PEARL_QUIZ=3,PEARL_REVIEW=2,PEARL_LEAGUE=10,PEARL_TRIAL=10;
  var SHOP=[
    {id:'freeze',name:'Streak Freeze',desc:'Protects your streak for 1 missed day',cost:20,emoji:'❄️'},
    {id:'refill',name:'Heart Refill',desc:'Refill all hearts to maximum',cost:15,emoji:'❤️'},
    {id:'boost',name:'Garden Boost',desc:'Skip one waiting period in Review Garden',cost:10,emoji:'🌱'}
  ];
  function ensureEconomy(state){
    if(!state.hearts) state.hearts={count:MAX_HEARTS,max:MAX_HEARTS,lastRefill:Date.now()};
    if(state.pearls===undefined) state.pearls=0;
    if(state.freezes===undefined) state.freezes=1;
  }
  function refillHearts(state){
    ensureEconomy(state);
    var now=Date.now();
    var elapsed=now-state.hearts.lastRefill;
    var refillCount=Math.floor(elapsed/REFILL_INTERVAL);
    if(refillCount>0&&state.hearts.count<state.hearts.max){
      state.hearts.count=Math.min(state.hearts.max,state.hearts.count+refillCount);
      state.hearts.lastRefill=now;
    }
    return state;
  }
  function loseHeart(state){
    ensureEconomy(state);
    if(state.hearts.count>0) state.hearts.count--;
    return state;
  }
  function hasHearts(state){
    ensureEconomy(state);
    return state.hearts.count>0;
  }
  function fullRefill(state){
    ensureEconomy(state);
    state.hearts.count=state.hearts.max;
    return state;
  }
  function addPearls(state,amount){
    ensureEconomy(state);
    state.pearls+=amount;
    return state;
  }
  function spendPearls(state,amount){
    ensureEconomy(state);
    if(state.pearls<amount) return false;
    state.pearls-=amount;
    return true;
  }
  function useFreeze(state){
    ensureEconomy(state);
    if(state.freezes<=0) return false;
    state.freezes--;
    return true;
  }
  function addFreeze(state){
    ensureEconomy(state);
    state.freezes++;
    return state;
  }
  function buyItem(state,itemId){
    ensureEconomy(state);
    var item=SHOP.find(function(s){return s.id===itemId;});
    if(!item) return {ok:false,msg:'Unknown item'};
    if(!spendPearls(state,item.cost)) return {ok:false,msg:'Not enough pearls'};
    if(itemId==='freeze') addFreeze(state);
    else if(itemId==='refill') fullRefill(state);
    else if(itemId==='boost'){
      if(window.Review && window.Review.boost) window.Review.boost(state);
    }
    return {ok:true,msg:'Purchased '+item.name+'!',item:item};
  }
  function getHearts(state){ensureEconomy(state);return state.hearts;}
  function getPearls(state){ensureEconomy(state);return state.pearls;}
  function getFreezes(state){ensureEconomy(state);return state.freezes;}
  function getShop(){return SHOP;}
  window.Economy={
    MAX_HEARTS:MAX_HEARTS,PEARL_QUEST:PEARL_QUEST,PEARL_QUIZ:PEARL_QUIZ,
    PEARL_REVIEW:PEARL_REVIEW,PEARL_LEAGUE:PEARL_LEAGUE,PEARL_TRIAL:PEARL_TRIAL,
    ensureEconomy:ensureEconomy,refillHearts:refillHearts,loseHeart:loseHeart,
    hasHearts:hasHearts,fullRefill:fullRefill,addPearls:addPearls,
    spendPearls:spendPearls,useFreeze:useFreeze,addFreeze:addFreeze,
    buyItem:buyItem,getHearts:getHearts,getPearls:getPearls,
    getFreezes:getFreezes,getShop:getShop
  };
})();
