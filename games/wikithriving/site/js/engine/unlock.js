/* Unlock Engine — age-gating and "unlocks at" logic */
(function(){
  function getAvailableLessons(profile){
    return window.LESSONS.filter(l=>l.stage===profile.stageId);
  }
  function getUpcomingLessons(profile){
    const stages=window.STAGES.map(s=>s.id);
    const idx=stages.indexOf(profile.stageId);
    if(idx<0) return [];
    return window.LESSONS.filter(l=>{
      const li=stages.indexOf(l.stage);
      return li>idx;
    });
  }
  function getRealmProgress(realmId,profile,completedIds){
    const all=window.LESSONS.filter(l=>l.realm===realmId&&l.stage===profile.stageId);
    if(!all.length) return {total:0,done:0,pct:0};
    const done=all.filter(l=>completedIds.has(l.id)).length;
    return {total:all.length,done,pct:Math.round(100*done/all.length)};
  }
  function isLessonUnlocked(lesson,profile){
    return lesson.stage===profile.stageId;
  }
  function getNextUnlock(profile){
    const stages=window.STAGES.map(s=>s.id);
    const idx=stages.indexOf(profile.stageId);
    if(idx<0||idx>=stages.length-1) return null;
    const next=window.STAGES[idx+1];
    const nextLessons=window.LESSONS.filter(l=>l.stage===next.id);
    return {stage:next,lessons:nextLessons.slice(0,3)};
  }
  window.Unlock={getAvailableLessons,getUpcomingLessons,getRealmProgress,isLessonUnlocked,getNextUnlock};
})();
