/* Main App — state management + screen routing (expanded) */
(function(){
  var state=null;
  function migrateState(d){
    if(!d.hearts) d.hearts={count:5,max:5,lastRefill:Date.now()};
    if(d.pearls===undefined) d.pearls=0;
    if(d.freezes===undefined) d.freezes=1;
    if(!d.garden) d.garden={};
    if(!d.league) d.league={weekKey:'',weeklyXP:0,prevResult:null};
    if(!d.journal) d.journal={};
    if(!d.capsule) d.capsule=[];
    if(!d.quizStats) d.quizStats={answered:0,correct:0,perfect:0};
    if(d.gamesPlayed===undefined) d.gamesPlayed=0;
    if(!d.gratitude) d.gratitude={};
    if(!d.habits) d.habits=[];
    if(!d.kindnessDone) d.kindnessDone=[];
    d.completedLessons=new Set(d.completedLessons||[]);
    d.earnedBadges=new Set(d.earnedBadges||[]);
    d.dailyQuestsDone=new Set(d.dailyQuestsDone||[]);
    d.booksRead=new Set(d.booksRead||[]);
    d.poemsRead=new Set(d.poemsRead||[]);
    return d;
  }
  function init(){
    var saved=loadState();
    if(saved){
      state=migrateState(saved);
      state=window.Progress.updateStreak(state);
      if(window.Economy) window.Economy.refillHearts(state);
      saveState(state);
      render();
    } else {
      window.Onboarding.init();
    }
  }
  function getState(){return state;}
  function setState(s){state=s;saveState(s);}
  function render(){
    document.querySelectorAll('.screen').forEach(function(s){s.classList.remove('active');});
    document.getElementById('screen-home').classList.add('active');
    window.HomeUI.render(state);
  }
  function showScreen(id){
    document.querySelectorAll('.screen').forEach(function(s){s.classList.remove('active');});
    var el=document.getElementById('screen-'+id);
    if(el) el.classList.add('active');
    if(id==='home') window.HomeUI.render(state);
    else if(id==='wisdom') window.WisdomUI.render();
    else if(id==='math') window.MathUI.render();
    else if(id==='journey') window.JourneyUI.render();
    else if(id==='profile') window.ProfileUI.render();
    else if(id==='reading') window.ReadingUI.render();
    else if(id==='shop') window.ShopUI.render();
    else if(id==='garden') window.GardenUI.render();
    else if(id==='league') window.LeagueUI.render();
    else if(id==='journal') window.JournalUI.render();
    else if(id==='capsule') window.CapsuleUI.render();
    else if(id==='album') window.AlbumUI.render();
    else if(id==='games') window.GamesUI.render();
    else if(id==='habits') window.HabitsUI.render();
  }
  function showRealm(realmId){
    document.querySelectorAll('.screen').forEach(function(s){s.classList.remove('active');});
    document.getElementById('screen-realm').classList.add('active');
    window.RealmUI.render(realmId,state);
  }
  function showLesson(lessonId){
    document.querySelectorAll('.screen').forEach(function(s){s.classList.remove('active');});
    document.getElementById('screen-lesson').classList.add('active');
    window.LessonUI.render(lessonId,state);
  }
  function showPoem(poemId){
    document.querySelectorAll('.screen').forEach(function(s){s.classList.remove('active');});
    document.getElementById('screen-poem').classList.add('active');
    window.PoemUI.render(poemId);
  }
  function saveState(s){
    var data={};
    for(var k in s){
      if(s[k] instanceof Set){
        data[k]=[...s[k]];
      } else if(typeof s[k]==='object'&&s[k]!==null&&!(s[k] instanceof Array)){
        data[k]=Object.assign({},s[k]);
      } else {
        data[k]=s[k];
      }
    }
    localStorage.setItem('wikithriving_state',JSON.stringify(data));
  }
  function loadState(){
    try{var d=JSON.parse(localStorage.getItem('wikithriving_state'));return d||null;}catch(e){return null;}
  }
  window.App={init:init,getState:getState,setState:setState,render:render,showScreen:showScreen,showRealm:showRealm,showLesson:showLesson,showPoem:showPoem};
  document.addEventListener('DOMContentLoaded',init);
})();
