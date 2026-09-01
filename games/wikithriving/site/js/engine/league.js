/* League Engine — offline weekly ghost league */
(function(){
  var GHOSTS=[
    {name:'Ari',emoji:'🦊'},{name:'Nova',emoji:'🌟'},{name:'Kai',emoji:'🌊'},{name:'Luna',emoji:'🌙'},
    {name:'Sage',emoji:'🦉'},{name:'Zara',emoji:'⚡'},{name:'Leo',emoji:'🦁'},{name:'Iris',emoji:'🌈'},
    {name:'Orion',emoji:'⭐'},{name:'Cleo',emoji:'👑'},{name:'Atlas',emoji:'🌍'},{name:'Nyx',emoji:'🌑'},
    {name:'Ember',emoji:'🔥'},{name:'Pearl',emoji:'🦪'},{name:'Rex',emoji:'🐾'},{name:'Echo',emoji:'🎵'},
    {name:'Sage',emoji:'🌿'},{name:'Vega',emoji:'💫'},{name:'Storm',emoji:'⛈️'},{name:'Sage',emoji:'🍃'},
    {name:'Rune',emoji:'🔮'},{name:'Flux',emoji:'🌀'},{name:'Zen',emoji:'☯️'},{name:'Rogue',emoji:'🎭'},
    {name:'Bolt',emoji:'⚡'},{name:'Fern',emoji:'🌱'},{name:'Drift',emoji:'☁️'},{name:'Spark',emoji:'✨'},
    {name:'Haze',emoji:'🌫️'},{name:'Tide',emoji:'🌊'}
  ];
  function seededRng(seed){
    var s=seed;
    return function(){s=(s*16807)%2147483647;return(s-1)/2147483646;};
  }
  function getWeekKey(){
    var now=new Date();
    var start=new Date(now.getFullYear(),0,1);
    var week=Math.floor(((now-start)/86400000+start.getDay()+1)/7);
    return now.getFullYear()+'-W'+String(week).padStart(2,'0');
  }
  function ensureLeague(state){
    if(!state.league) state.league={weekKey:'',weeklyXP:0,prevResult:null};
    var wk=getWeekKey();
    if(state.league.weekKey!==wk){
      state.league.prevResult={weekKey:state.league.weekKey,myXP:state.league.weeklyXP||0,rank:calcRank(state.league.weeklyXP||0)};
      state.league.weekKey=wk;
      state.league.weeklyXP=0;
    }
  }
  function addWeeklyXP(state,amount){
    ensureLeague(state);
    state.league.weeklyXP=(state.league.weeklyXP||0)+amount;
  }
  function calcRank(myXP){
    var seed=0;
    for(var i=0;i<getWeekKey().length;i++) seed+=getWeekKey().charCodeAt(i);
    var rng=seededRng(seed);
    var entries=GHOSTS.map(function(g,i){
      var baseXP=Math.floor(rng()*200)+50;
      var daily=Math.floor(rng()*30)+5;
      var days=Math.floor((Date.now()-new Date(new Date().getFullYear(),0,1).getTime())/86400000)%7;
      return {name:g.name,emoji:g.emoji,xp:baseXP+daily*days,isUser:false};
    });
    entries.push({name:'You',emoji:'📖',xp:myXP,isUser:true});
    entries.sort(function(a,b){return b.xp-a.xp;});
    var rank=entries.findIndex(function(e){return e.isUser;})+1;
    return rank;
  }
  function getStandings(state){
    ensureLeague(state);
    var seed=0;
    var wk=getWeekKey();
    for(var i=0;i<wk.length;i++) seed+=wk.charCodeAt(i);
    var rng=seededRng(seed);
    var dayOfWeek=(Math.floor((Date.now()-new Date(new Date().getFullYear(),0,1).getTime())/86400000))%7;
    var entries=GHOSTS.map(function(g){
      var baseXP=Math.floor(rng()*180)+30;
      var daily=Math.floor(rng()*25)+5;
      return {name:g.name,emoji:g.emoji,xp:baseXP+daily*dayOfWeek,isUser:false};
    });
    entries.push({name:'You',emoji:'📖',xp:state.league.weeklyXP||0,isUser:true});
    entries.sort(function(a,b){return b.xp-a.xp;});
    return entries;
  }
  function getMyRank(state){
    var standings=getStandings(state);
    var idx=standings.findIndex(function(e){return e.isUser;});
    return idx>=0?idx+1:standings.length;
  }
  function getLeagueSize(){return GHOSTS.length+1;}
  function isLeagueTop(state){
    return getMyRank(state)<=10;
  }
  window.League={
    ensureLeague:ensureLeague,addWeeklyXP:addWeeklyXP,
    getStandings:getStandings,getMyRank:getMyRank,
    getLeagueSize:getLeagueSize,isLeagueTop:isLeagueTop,
    getWeekKey:getWeekKey
  };
})();
