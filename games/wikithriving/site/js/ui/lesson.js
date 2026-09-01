/* Lesson UI — reader + quiz + garden plant */
(function(){
  var currentLesson=null;
  var quizState=null;
  function render(lessonId,state){
    currentLesson=window.LESSONS.find(function(l){return l.id===lessonId;});
    if(!currentLesson) return;
    quizState=null;
    var done=state.completedLessons.has(lessonId);
    var realm=window.REALMS.find(function(r){return r.id===currentLesson.realm});
    var gardenEmoji=window.Review&&state.garden&&state.garden[lessonId]?window.Review.getPlantEmoji(state,lessonId):'';
    document.getElementById('lesson-content').innerHTML=`
      <div class="card card-lg">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
          <span style="font-size:1.4rem">${realm.icon}</span>
          <span class="chip" style="background:${realm.color}20;color:${realm.color}">${realm.name}</span>
          ${done?'<span class="chip chip-gold">✓ Done</span>':''}
          ${gardenEmoji?'<span class="chip">'+gardenEmoji+'</span>':''}
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
          ${!done?`<button class="btn btn-primary" style="width:100%;margin-top:8px" onclick="LessonUI.startQuiz('${lessonId}','${currentLesson.realm}')">✓ Complete (+${window.Progress.XP_PER_LESSON} XP)</button>`:
          `<p style="text-align:center;color:var(--gold);font-weight:600;margin-top:12px">✨ Already completed!</p>`}
        </div>
      </div>
    `;
  }
  function startQuiz(lessonId,realm){
    var state=window.App.getState();
    if(!window.Economy.hasHearts(state)){
      alert('❤️ No hearts left! Wait for refill or visit the shop.');
      return;
    }
    var questions=window.Quiz.buildSet(currentLesson,1);
    if(!questions.length){markDone(lessonId,realm);return;}
    quizState={questions:questions,current:0,score:0,done:false};
    renderQuizQuestion();
  }
  function renderQuizQuestion(){
    if(!quizState||!quizState.questions.length){finishQuiz();return;}
    var q=quizState.questions[quizState.current];
    if(!q){finishQuiz();return;}
    var area=document.getElementById('lesson-quiz-area');
    if(!area) return;
    var doneArea=document.getElementById('lesson-done-area');
    if(doneArea) doneArea.style.display='none';
    area.innerHTML=`
      <hr class="gold-rule">
      <div style="margin-bottom:8px">
        <span class="chip chip-gold">📝 Quiz</span>
        <span style="font-size:.75rem;color:var(--ink3);margin-left:8px">${quizState.current+1}/${quizState.questions.length}</span>
      </div>
      <p style="font-weight:600;margin-bottom:14px;color:var(--ink)">${q.q}</p>
      <div style="display:flex;flex-direction:column;gap:8px" id="quiz-options">
        ${q.options.map(function(opt,i){
          return '<button class="card" style="text-align:left;padding:12px 16px;border:2px solid var(--border);transition:all .2s" onclick="LessonUI.answerQuiz('+i+','+q.correct+')">'+opt+'</button>';
        }).join('')}
      </div>
      <div id="quiz-feedback" style="margin-top:12px;display:none"></div>
    `;
  }
  function answerQuiz(chosen,correct){
    var options=document.querySelectorAll('#quiz-options button');
    options.forEach(function(btn){btn.onclick=null;btn.style.cursor='default';});
    var isCorrect=chosen===correct;
    if(isCorrect){
      quizState.score++;
      options[chosen].style.background='#e8f5e9';
      options[chosen].style.borderColor='#4caf50';
    } else {
      var state=window.App.getState();
      window.Economy.loseHeart(state);
      window.App.setState(state);
      options[chosen].style.background='#ffebee';
      options[chosen].style.borderColor='#ef5350';
      options[correct].style.background='#e8f5e9';
      options[correct].style.borderColor='#4caf50';
    }
    var feedback=document.getElementById('quiz-feedback');
    if(feedback){
      feedback.style.display='block';
      feedback.innerHTML=`
        <div style="padding:12px;border-radius:var(--radius-sm);background:${isCorrect?'#e8f5e9':'#ffebee'};margin-bottom:8px">
          <p style="font-weight:600;color:${isCorrect?'#2e7d32':'#c62828'}">${isCorrect?'✅ Correct!':'❌ Wrong answer'}</p>
          ${quizState.questions[quizState.current].explanation?'<p style="font-size:.85rem;color:var(--ink2);margin-top:4px">'+quizState.questions[quizState.current].explanation+'</p>':''}
        </div>
        <button class="btn btn-primary btn-sm" style="width:100%" onclick="LessonUI.nextQuizQuestion()">Next →</button>
      `;
    }
  }
  function nextQuizQuestion(){
    quizState.current++;
    if(quizState.current>=quizState.questions.length){finishQuiz();return;}
    renderQuizQuestion();
  }
  function finishQuiz(){
    var lessonId=currentLesson.id;
    var realm=currentLesson.realm;
    var passed=window.Quiz.isPassing(quizState.score,quizState.questions.length);
    var state=window.App.getState();
    if(state.quizStats){
      state.quizStats.answered+=quizState.questions.length;
      state.quizStats.correct+=quizState.score;
      if(quizState.score===quizState.questions.length) state.quizStats.perfect++;
    }
    window.App.setState(state);
    if(passed){
      markDone(lessonId,realm);
    } else {
      var area=document.getElementById('lesson-quiz-area');
      var doneArea=document.getElementById('lesson-done-area');
      if(doneArea) doneArea.style.display='none';
      if(area) area.innerHTML=`
        <hr class="gold-rule">
        <div style="text-align:center;padding:20px">
          <div style="font-size:2rem;margin-bottom:8px">💪</div>
          <p style="font-weight:600;margin-bottom:4px">Score: ${quizState.score}/${quizState.questions.length}</p>
          <p style="font-size:.85rem;color:var(--ink3);margin-bottom:12px">Need 50% to pass. Try again?</p>
          <button class="btn btn-primary" style="width:100%" onclick="LessonUI.startQuiz('${lessonId}','${realm}')">Try Again</button>
        </div>
      `;
    }
    quizState=null;
  }
  function markDone(lessonId,realm){
    var state=window.App.getState();
    var changed=window.Progress.markLessonDone(state,lessonId,realm);
    if(changed){
      window.Economy.addPearls(state,window.Economy.PEARL_QUIZ);
      if(window.Review) window.Review.plantSeed(state,lessonId);
      if(window.League) window.League.addWeeklyXP(state,window.Progress.XP_PER_LESSON);
      var s2=window.Progress.checkBadges(state);
      window.App.setState(s2.state);
      if(s2.newBadges.length){
        alert('🏅 New badge: '+s2.newBadges.map(function(b){return b.emoji+' '+b.name;}).join(', '));
      }
    }
    render(lessonId,window.App.getState());
  }
  window.LessonUI={render:render,startQuiz:startQuiz,answerQuiz:answerQuiz,nextQuizQuestion:nextQuizQuestion};
})();
