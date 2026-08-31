/* Lesson UI — reader + quiz */
(function(){
  let currentLesson=null;
  let quizState=null;
  function render(lessonId,state){
    currentLesson=window.LESSONS.find(l=>l.id===lessonId);
    if(!currentLesson) return;
    quizState=null;
    const done=state.completedLessons.has(lessonId);
    const realm=window.REALMS.find(r=>r.id===currentLesson.realm);
    document.getElementById('lesson-content').innerHTML=`
      <div class="card card-lg">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
          <span style="font-size:1.4rem">${realm.icon}</span>
          <span class="chip" style="background:${realm.color}20;color:${realm.color}">${realm.name}</span>
          ${done?'<span class="chip chip-gold">✓ Done</span>':''}
        </div>
        <h2 style="margin-bottom:16px">${currentLesson.title}</h2>
        <p style="line-height:1.7;color:var(--ink2);margin-bottom:20px">${currentLesson.body}</p>
        ${currentLesson.quote?`
          <hr class="gold-rule">
          <blockquote style="font-family:var(--font-serif);font-style:italic;color:var(--ink2);margin-bottom:4px">"${currentLesson.quote}"</blockquote>
          <p style="font-size:.8rem;color:var(--ink3);margin-bottom:20px">— ${currentLesson.author}</p>
        `:''}
        ${currentLesson.action?`
          <div style="background:var(--cream);padding:14px;border-radius:var(--radius-sm);margin-bottom:16px;border-left:4px solid var(--gold)">
            <div style="font-size:.7rem;color:var(--gold2);text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">🎯 Try This</div>
            <p style="font-weight:500">${currentLesson.action}</p>
          </div>
        `:''}
        <div id="lesson-quiz-area"></div>
        <div id="lesson-done-area">
          ${!done?`<button class="btn btn-primary" style="width:100%;margin-top:8px" onclick="LessonUI.markDone('${lessonId}','${currentLesson.realm}')">✓ Mark as Complete (+${window.Progress.XP_PER_LESSON} XP)</button>`:
          `<p style="text-align:center;color:var(--gold);font-weight:600;margin-top:12px">✨ Already completed!</p>`}
        </div>
      </div>
    `;
  }
  function markDone(lessonId,realm){
    const state=window.App.getState();
    const changed=window.Progress.markLessonDone(state,lessonId,realm);
    if(changed){
      const{state:s2,newBadges}=window.Progress.checkBadges(state);
      window.App.setState(s2);
      if(newBadges.length){
        alert('🏅 New badge: '+newBadges.map(b=>b.emoji+' '+b.name).join(', '));
      }
    }
    render(lessonId,window.App.getState());
  }
  window.LessonUI={render,markDone};
})();
