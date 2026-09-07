/* Game Registry — auto-loaded before game files */
(function(){
  var games={};
  function register(gameId,data){
    games[gameId]=data;
  }
  function getGame(gameId){
    return games[gameId]||null;
  }
  function getAllGames(){
    return games;
  }
  window.GameRegistry={register:register,getGame:getGame,getAllGames:getAllGames};
  Object.defineProperty(window,'GAMES_DATA',{get:function(){return getAllGames();},configurable:true});
})();
