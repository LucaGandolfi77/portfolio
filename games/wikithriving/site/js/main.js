/* Main App — state management + screen routing (expanded) */
(function(){
  let state=null;
  function init(){
    const saved=loadState();
    if(saved){
      state=saved;
      state.completedLessons=new Set(state.completedLessons||[]);
      state.earnedBadges=new Set(state.earnedBadges||[]);
      state.dailyQuestsDone=new Set(state.dailyQuestsDone||[]);
      state.booksRead=new Set(state.booksRead||[]);
      state.poemsRead=new Set(state.poemsRead||[]);
      state=window.Progress.updateStreak(state);
      saveState(state);
      render();
    } else {
      window.Onboarding.init();
    }
  }
  function getState(){return state;}
  function setState(s){state=s;saveState(s);}
  function render(){
    document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
    document.getElementById('screen-home').classList.add('active');
    window.HomeUI.render(state);
  }
  function showScreen(id){
    document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
    const el=document.getElementById('screen-'+id);
    if(el) el.classList.add('active');
    if(id==='home') window.HomeUI.render(state);
    else if(id==='wisdom') window.WisdomUI.render();
    else if(id==='math') window.MathUI.render();
    else if(id==='journey') window.JourneyUI.render();
    else if(id==='profile') window.ProfileUI.render();
    else if(id==='reading') window.ReadingUI.render();
  }
  function showRealm(realmId){
    document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
    document.getElementById('screen-realm').classList.add('active');
    window.RealmUI.render(realmId,state);
  }
  function showLesson(lessonId){
    document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
    document.getElementById('screen-lesson').classList.add('active');
    window.LessonUI.render(lessonId,state);
  }
  function showPoem(poemId){
    document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
    document.getElementById('screen-poem').classList.add('active');
    window.PoemUI.render(poemId);
  }
  function saveState(s){
    const data={...s,
      completedLessons:[...s.completedLessons],
      earnedBadges:[...s.earnedBadges],
      dailyQuestsDone:[...s.dailyQuestsDone],
      booksRead:[...s.booksRead],
      poemsRead:[...s.poemsRead]
    };
    localStorage.setItem('wikithriving_state',JSON.stringify(data));
  }
  function loadState(){
    try{const d=JSON.parse(localStorage.getItem('wikithriving_state'));return d||null;}catch(e){return null;}
  }
  window.App={init,getState,setState,render,showScreen,showRealm,showLesson,showPoem};
  document.addEventListener('DOMContentLoaded',init);
})();
