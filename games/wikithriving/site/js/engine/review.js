/* Review Engine — spaced repetition garden */
(function(){
  var INTERVALS=[1,3,7,16,35];
  function ensureGarden(state){
    if(!state.garden) state.garden={};
  }
  function plantSeed(state,lessonId){
    ensureGarden(state);
    if(state.garden[lessonId]) return;
    var due=Date.now()+INTERVALS[0]*86400000;
    state.garden[lessonId]={due:due,intervalIdx:0,planted:Date.now()};
  }
  function getDuePlants(state){
    ensureGarden(state);
    var now=Date.now();
    var due=[];
    for(var id in state.garden){
      if(state.garden[id].due<=now) due.push(id);
    }
    return due;
  }
  function getDueCount(state){
    return getDuePlants(state).length;
  }
  function reviewPlant(state,lessonId){
    ensureGarden(state);
    var plant=state.garden[lessonId];
    if(!plant) return;
    var nextIdx=Math.min(plant.intervalIdx+1,INTERVALS.length-1);
    plant.intervalIdx=nextIdx;
    plant.due=Date.now()+INTERVALS[nextIdx]*86400000;
  }
  function isWilting(state,lessonId){
    ensureGarden(state);
    var plant=state.garden[lessonId];
    if(!plant) return false;
    var now=Date.now();
    var interval=INTERVALS[plant.intervalIdx]*86400000;
    return now>plant.due+interval;
  }
  function boostPlant(state,lessonId){
    ensureGarden(state);
    var plant=state.garden[lessonId];
    if(!plant) return;
    plant.due=Date.now();
  }
  function boost(state){
    ensureGarden(state);
    var due=getDuePlants(state);
    if(due.length) boostPlant(state,due[0]);
  }
  function getPlantEmoji(state,lessonId){
    ensureGarden(state);
    var plant=state.garden[lessonId];
    if(!plant) return '🪹';
    if(isWilting(state,lessonId)) return '🥀';
    if(plant.intervalIdx>=3) return '🌳';
    if(plant.intervalIdx>=1) return '🌿';
    return '🌱';
  }
  function getGardenCount(state){
    ensureGarden(state);
    return Object.keys(state.garden).length;
  }
  function getWiltingCount(state){
    ensureGarden(state);
    var count=0;
    for(var id in state.garden){
      if(isWilting(state,id)) count++;
    }
    return count;
  }
  window.Review={
    INTERVALS:INTERVALS,ensureGarden:ensureGarden,plantSeed:plantSeed,
    getDuePlants:getDuePlants,getDueCount:getDueCount,reviewPlant:reviewPlant,
    isWilting:isWilting,boostPlant:boostPlant,boost:boost,
    getPlantEmoji:getPlantEmoji,getGardenCount:getGardenCount,
    getWiltingCount:getWiltingCount
  };
})();
