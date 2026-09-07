/* Main App — state management + screen routing (expanded with splash, bottom nav, dark mode, rate prompt) */
(function(){
  var state=null;
  var currentScreen='home';
  var ratePromptDismissed=localStorage.getItem('wt_rate_dismissed')==='1';

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
    if(!d.lastLessonRealm) d.lastLessonRealm=null;
    if(!d.lastLessonId) d.lastLessonId=null;
    d.completedLessons=new Set(d.completedLessons||[]);
    d.earnedBadges=new Set(d.earnedBadges||[]);
    d.dailyQuestsDone=new Set(d.dailyQuestsDone||[]);
    d.booksRead=new Set(d.booksRead||[]);
    d.poemsRead=new Set(d.poemsRead||[]);
    return d;
  }

  function initSplash(){
    var bar=document.getElementById('splash-bar');
    var splash=document.getElementById('splash');
    if(!bar||!splash) return Promise.resolve();
    return new Promise(function(resolve){
      var progress=0;
      var steps=[
        {p:30,d:200},{p:60,d:300},{p:85,d:400},{p:100,d:500}
      ];
      var i=0;
      function next(){
        if(i>=steps.length){
          setTimeout(function(){splash.classList.add('hidden');setTimeout(resolve,500);},200);
          return;
        }
        bar.style.width=steps[i].p+'%';
        i++;
        setTimeout(next,steps[i-1].d);
      }
      next();
    });
  }

  function init(){
    var saved=loadState();
    if(saved){
      state=migrateState(saved);
      state=window.Progress.updateStreak(state);
      if(window.Economy) window.Economy.refillHearts(state);
      saveState(state);
      initSplash().then(function(){render();showBottomNav();applyDarkMode();checkRatePrompt();});
      if(window.Analytics) window.Analytics.track('app_open',{has_state:true});
    } else {
      initSplash().then(function(){window.Onboarding.init();showBottomNav();applyDarkMode();});
      if(window.Analytics) window.Analytics.track('app_open',{has_state:false});
    }
  }

  function getState(){return state;}
  function setState(s){state=s;saveState(s);}

  function render(){
    document.querySelectorAll('.screen').forEach(function(s){s.classList.remove('active');});
    document.getElementById('screen-home').classList.add('active');
    window.HomeUI.render(state);
    updateBottomNav('home');
    showBottomNav();
  }

  function showScreen(id){
    currentScreen=id;
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
    else if(id==='search') window.SearchUI.render();
    else if(id==='streak') window.StreakCalendarUI.render();
    else if(id==='challenge') window.DailyChallengeUI.render();
    updateBottomNav(id);
    showBottomNav();
  }

  function showRealm(realmId){
    currentScreen='realm';
    document.querySelectorAll('.screen').forEach(function(s){s.classList.remove('active');});
    document.getElementById('screen-realm').classList.add('active');
    window.RealmUI.render(realmId,state);
    hideBottomNav();
  }

  function showLesson(lessonId){
    currentScreen='lesson';
    document.querySelectorAll('.screen').forEach(function(s){s.classList.remove('active');});
    document.getElementById('screen-lesson').classList.add('active');
    window.LessonUI.render(lessonId,state);
    hideBottomNav();
    if(window.Analytics) window.Analytics.track('lesson_open',{lesson_id:lessonId});
  }

  function showPoem(poemId){
    currentScreen='poem';
    document.querySelectorAll('.screen').forEach(function(s){s.classList.remove('active');});
    document.getElementById('screen-poem').classList.add('active');
    window.PoemUI.render(poemId);
    hideBottomNav();
  }

  function showBottomNav(){
    var nav=document.getElementById('bottom-nav');
    if(nav) nav.style.display='flex';
  }

  function hideBottomNav(){
    var nav=document.getElementById('bottom-nav');
    if(nav) nav.style.display='none';
  }

  function updateBottomNav(activeId){
    document.querySelectorAll('#bottom-nav button').forEach(function(btn){
      var screen=btn.getAttribute('data-screen');
      btn.classList.toggle('active',screen===activeId);
    });
  }

  function applyDarkMode(){
    var dark=localStorage.getItem('wt_dark_mode')==='1';
    document.documentElement.classList.toggle('dark',dark);
  }

  function toggleDarkMode(){
    var dark=localStorage.getItem('wt_dark_mode')!=='1';
    localStorage.setItem('wt_dark_mode',dark?'1':'0');
    applyDarkMode();
  }

  function checkRatePrompt(){
    if(ratePromptDismissed) return;
    if(!state) return;
    var lessonsCompleted=state.completedLessons?state.completedLessons.size:0;
    if(lessonsCompleted>=5){
      var lastDismiss=localStorage.getItem('wt_rate_last_dismiss');
      var now=Date.now();
      if(lastDismiss&&(now-parseInt(lastDismiss))<7*86400000) return;
      document.getElementById('rate-prompt').style.display='block';
    }
  }

  function dismissRatePrompt(){
    document.getElementById('rate-prompt').style.display='none';
    localStorage.setItem('wt_rate_dismissed','1');
    localStorage.setItem('wt_rate_last_dismiss',Date.now().toString());
  }

  function rateApp(){
    document.getElementById('rate-prompt').style.display='none';
    window.open('https://play.google.com/store/apps/details?id=com.wikithriving.app','_blank');
    if(window.Analytics) window.Analytics.track('rate_app');
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

  window.App={
    init:init,getState:getState,setState:setState,render:render,
    showScreen:showScreen,showRealm:showRealm,showLesson:showLesson,showPoem:showPoem,
    toggleDarkMode:toggleDarkMode,applyDarkMode:applyDarkMode,
    dismissRatePrompt:dismissRatePrompt,rateApp:rateApp,
    hideBottomNav:hideBottomNav,showBottomNav:showBottomNav,
    getCurrentScreen:function(){return currentScreen;}
  };
  document.addEventListener('DOMContentLoaded',init);
})();
