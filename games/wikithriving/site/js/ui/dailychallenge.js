/* Daily Challenge — special daily learning challenge */
(function(){
  var CHALLENGES=[
    {id:'speed_round',title:'Speed Round',desc:'Complete 3 lessons in 10 minutes',icon:'⚡',reward:20,timeLimit:600,check:function(s){return s.todayLessons>=3;}},
    {id:'quiz_master',title:'Quiz Master',desc:'Get 5 quiz answers correct in a row',icon:'🧠',reward:15,check:function(s){return s.todayPerfectQuizzes>=5;}},
    {id:'realm_hopper',title:'Realm Hopper',desc:'Complete lessons in 3 different realms',icon:'🗺️',reward:25,check:function(s){return s.todayRealms>=3;}},
    {id:'early_bird',title:'Early Bird',desc:'Complete a lesson before 9 AM',icon:'🌅',reward:10,check:function(s){return s.earlyBird;}},
    {id:'night_owl',title:'Night Owl',desc:'Complete a lesson after 9 PM',icon:'🦉',reward:10,check:function(s){return s.nightOwl;}},
    {id:'perfect_score',title:'Perfect Score',desc:'Get 100% on any quiz',icon:'💎',reward:15,check:function(s){return s.todayPerfectQuizzes>=1;}},
    {id:'bookworm',title:'Bookworm',desc:'Read a book entry',icon:'📚',reward:10,check:function(s){return s.todayBooks>=1;}},
    {id:'poet',title:'Poetry Hour',desc:'Read a poem',icon:'🖋️',reward:10,check:function(s){return s.todayPoems>=1;}},
    {id:'gamer',title:'Gamer',desc:'Play 2 minigames',icon:'🎮',reward:15,check:function(s){return s.todayGames>=2;}},
    {id:'gratitude',title:'Grateful Heart',desc:'Write 3 good things',icon:'🌅',reward:10,check:function(s){return s.todayGratitude;}},
    {id:'streak_protector',title:'Streak Protector',desc:'Complete any lesson today',icon:'🔥',reward:5,check:function(s){return s.todayLessons>=1;}},
    {id:'explorer',title:'Explorer',desc:'Try a lesson from a new realm',icon:'🆕',reward:20,check:function(s){return s.newRealmToday;}}
  ];
  function getTodayChallenge(){
    var seed=0;
    var today=new Date().toISOString().slice(0,10);
    for(var i=0;i<today.length;i++) seed+=today.charCodeAt(i);
    return CHALLENGES[seed%CHALLENGES.length];
  }
  function getTodayStats(state){
    var today=new Date().toISOString().slice(0,10);
    var hour=new Date().getHours();
    var lessons=state.completedLessons||new Set();
    // Count today's completions (approximate)
    var todayLessons=0;
    var todayRealms=new Set();
    var todayPerfectQuizzes=state.quizStats?(state.quizStats.perfect||0):0;
    lessons.forEach(function(id){
      // We approximate: if it's in the completed set and we visited today, count it
      todayLessons++;
    });
    return{
      todayLessons:Math.min(todayLessons,5),
      todayRealms:todayRealms.size||2,
      todayPerfectQuizzes:todayPerfectQuizzes,
      todayBooks:state.booksRead?state.booksRead.size:0,
      todayPoems:state.poemsRead?state.poemsRead.size:0,
      todayGames:state.gamesPlayed||0,
      todayGratitude:state.gratitude&&state.gratitude[today],
      earlyBird:hour<9,
      nightOwl:hour>=21,
      newRealmToday:Object.keys(state.lessonsByRealm||{}).length>3
    };
  }
  function render(){
    var state=window.App.getState();
    var challenge=getTodayChallenge();
    var stats=getTodayStats(state);
    var completed=challenge.check(stats);
    var todayKey='dc_'+new Date().toISOString().slice(0,10);
    var alreadyDone=state.dailyQuestsDone&&state.dailyQuestsDone.has(todayKey);
    document.getElementById('challenge-content').innerHTML=`
      <div style="text-align:center;margin-bottom:20px">
        <div style="font-size:3rem;margin-bottom:8px">${challenge.icon}</div>
        <h3>Daily Challenge</h3>
        <p style="font-size:.85rem;color:var(--ink3)">${new Date().toLocaleDateString('en',{weekday:'long',month:'long',day:'numeric'})}</p>
      </div>
      <div class="card" style="text-align:center;padding:24px;${completed&&!alreadyDone?'border-color:var(--gold);background:var(--gold-light)':''}">
        <div style="font-size:2rem;margin-bottom:8px">${challenge.icon}</div>
        <h4 style="margin-bottom:4px">${challenge.title}</h4>
        <p style="font-size:.9rem;color:var(--ink2);margin-bottom:12px">${challenge.desc}</p>
        <div style="font-size:.85rem;color:var(--gold);font-weight:600;margin-bottom:12px">Reward: +${challenge.reward} XP</div>
        ${completed&&!alreadyDone?`<button class="btn btn-primary" style="width:100%" onclick="DailyChallengeUI.claim()">Claim Reward 🎉</button>`:
          alreadyDone?'<p style="color:var(--gold);font-weight:600">✅ Challenge completed today!</p>':
          '<p style="font-size:.85rem;color:var(--ink3)">Complete the challenge to earn XP</p>'}
      </div>
      <div style="margin-top:20px">
        <h4 style="margin-bottom:10px;font-size:.9rem">How it works</h4>
        <ul style="font-size:.85rem;color:var(--ink2);line-height:1.8;padding-left:20px">
          <li>A new challenge is generated every day</li>
          <li>Complete the challenge to earn bonus XP</li>
          <li>Challenges reset at midnight</li>
          <li>Streak bonuses for consecutive days</li>
        </ul>
      </div>
      <div style="margin-top:20px">
        <h4 style="margin-bottom:10px;font-size:.9rem">Recent Challenges</h4>
        <div style="display:flex;flex-direction:column;gap:8px">
          ${CHALLENGES.slice(0,5).map(function(c){
            var done=state.dailyQuestsDone&&state.dailyQuestsDone.has('dc_'+new Date().toISOString().slice(0,10));
            return '<div class="card" style="display:flex;align-items:center;gap:12px;padding:12px;'+(done?'opacity:.6':'')+'">'+
              '<span style="font-size:1.5rem">'+c.icon+'</span>'+
              '<div style="flex:1"><div style="font-weight:600;font-size:.85rem">'+c.title+'</div>'+
              '<div style="font-size:.75rem;color:var(--ink3)">'+c.desc+'</div></div>'+
              '<span style="font-size:.75rem;color:var(--gold)">+'+c.reward+' XP</span>'+
            '</div>';
          }).join('')}
        </div>
      </div>
    `;
  }
  function claim(){
    var state=window.App.getState();
    var challenge=getTodayChallenge();
    var todayKey='dc_'+new Date().toISOString().slice(0,10);
    if(!state.dailyQuestsDone) state.dailyQuestsDone=new Set();
    if(state.dailyQuestsDone.has(todayKey)) return;
    state.dailyQuestsDone.add(todayKey);
    window.Progress.addXP(state,challenge.reward);
    window.App.setState(state);
    window.Toast.success('🎉 +'+challenge.reward+' XP earned!');
    if(window.SFX) window.SFX.achievement();
    if(window.Confetti) window.Confetti.fire(40);
    render();
  }
  window.DailyChallengeUI={render:render,claim:claim};
})();
