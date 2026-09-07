/* Lesson Registry — auto-loaded before realm files */
(function(){
  var registry={};
  var order=['character','learning','math','money','health','comm','work','world','practical','purpose','art','science','psychology','music','film','design','literature','travel'];
  function register(realmId,lessons){
    registry[realmId]=lessons;
  }
  function getLessons(realmId){
    return registry[realmId]||[];
  }
  function getAllLessons(){
    var all=[];
    order.forEach(function(r){
      if(registry[r]) all=all.concat(registry[r]);
    });
    return all;
  }
  function getRealmIds(){return order;}
  window.LessonRegistry={register:register,getLessons:getLessons,getAllLessons:getAllLessons,getRealmIds:getRealmIds};
  // Legacy compatibility
  Object.defineProperty(window,'LESSONS',{get:function(){return getAllLessons();},configurable:true});
})();
