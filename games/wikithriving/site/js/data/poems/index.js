/* Poem Registry — auto-loaded before poem files */
(function(){
  var collections={};
  function register(collectionId,poems){
    collections[collectionId]=poems;
  }
  function getAllPoems(){
    var all=[];
    for(var k in collections) all=all.concat(collections[k]);
    return all;
  }
  window.PoemRegistry={register:register,getAllPoems:getAllPoems};
  Object.defineProperty(window,'POEMS',{get:function(){return getAllPoems();},configurable:true});
})();
