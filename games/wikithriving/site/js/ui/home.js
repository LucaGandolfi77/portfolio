/* Home UI — Life Map (expanded with nav grid + new features) */
(function(){
  function render(state){
    var p=state.profile;
    var stats=window.Progress.getStats(state);
    var dailyQuote=window.Daily.getDailyQuote(p);
    var dailyQuest=window.Daily.getDailyQuest(p);
    var rank=stats.rank;
    var coreRealms=window.REALMS.filter(function(r){return !r.bonus;});
    var bonusRealms=window.REALMS.filter(function(r){return r.bonus;});

    window.Economy.ensureEconomy(state);
    var hearts=state.hearts?state.hearts.count:5;
    var pearls=state.pearls||0;
    var freezes=state.freezes||0;
    var gardenDue=window.Review?window.Review.getDueCount(state):0;

    document.getElementById('home-header').innerHTML=`
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
        <div>
          <span class="flag-badge">${p.flag}</span>
          <span class="stage-badge">${p.stageEmoji} ${p.stageName}</span>
        </div>
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          <span class="xp-badge">⚡ ${stats.xp} XP</span>
          <span class="streak-badge">🔥 ${stats.streak}</span>
        </div>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
        <div style="font-size:.85rem;color:var(--ink2)">${rank.emoji} ${rank.name} · Level ${stats.level}</div>
        <div style="font-size:.8rem;color:var(--ink3)">${stats.totalLessons} lessons · ${stats.badges.length} badges</div>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:6px">
        <span class="chip" style="font-size:.75rem">❤️ ${hearts}/5</span>
        <span class="chip" style="font-size:.75rem">🦪 ${pearls}</span>
        <span class="chip" style="font-size:.75rem">❄️ ${freezes}</span>
        ${gardenDue?'<span class="chip chip-gold" style="font-size:.75rem" onclick="App.showScreen(\'garden\')">🌱 '+gardenDue+' to water</span>':''}
      </div>
    `;

    document.getElementById('home-wisdom').innerHTML=`
      <div class="card" style="background:linear-gradient(135deg,#fffdf8,#f5e6c8);border-color:var(--gold-light)">
        <div style="font-size:.7rem;color:var(--gold2);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">✨ Wisdom of the Day</div>
        <p style="font-family:var(--font-serif);font-size:1rem;font-style:italic;margin-bottom:6px">"${dailyQuote.text}"</p>
        <p style="font-size:.8rem;color:var(--ink3)">— ${dailyQuote.author}</p>
      </div>
    `;

    if(dailyQuest){
      document.getElementById('home-quest').innerHTML=`
        <div class="card" style="border-left:4px solid var(--gold)">
          <div style="font-size:.7rem;color:var(--gold2);text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">📋 Today's Quest</div>
          <p style="font-weight:600">${dailyQuest.text}</p>
          <p style="font-size:.8rem;color:var(--ink3);margin-top:4px">+${dailyQuest.xp} XP</p>
        </div>
      `;
    }

    var todayId=new Date().toISOString().slice(0,10);
    var hasJournal=state.journal&&state.journal[todayId];
    var hasGratitude=state.gratitude&&state.gratitude[todayId];
    var bigQ=window.BIG_QUESTIONS?window.BIG_QUESTIONS.find(function(q){return q.stage===p.stageId;}):null;
    if(bigQ&&!hasJournal){
      document.getElementById('home-quest').innerHTML+=`
        <div class="card" style="border-left:4px solid #7c4ac0;margin-top:8px">
          <div style="font-size:.7rem;color:#7c4ac0;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">💭 The Big Question</div>
          <p style="font-weight:500;font-size:.9rem">${bigQ.text}</p>
          <p style="font-size:.75rem;color:var(--ink3);margin-top:4px">Answer in your journal</p>
        </div>
      `;
    }

    if(!hasGratitude){
      document.getElementById('home-quest').innerHTML+=`
        <div class="card" style="border-left:4px solid #e8a735;margin-top:8px">
          <div style="font-size:.7rem;color:#e8a735;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">🌅 Three Good Things</div>
          <p style="font-weight:500;font-size:.9rem;margin-bottom:8px">Name three good things from today</p>
          <div style="display:flex;flex-direction:column;gap:6px">
            <input id="grat1" type="text" placeholder="1. Something that went well..." style="width:100%;padding:8px 10px;border:2px solid var(--border);border-radius:var(--radius-sm);font-size:.85rem;font-family:var(--font-sans)">
            <input id="grat2" type="text" placeholder="2. Something you're grateful for..." style="width:100%;padding:8px 10px;border:2px solid var(--border);border-radius:var(--radius-sm);font-size:.85rem;font-family:var(--font-sans)">
            <input id="grat3" type="text" placeholder="3. A person or moment..." style="width:100%;padding:8px 10px;border:2px solid var(--border);border-radius:var(--radius-sm);font-size:.85rem;font-family:var(--font-sans)">
          </div>
          <button class="btn btn-primary btn-sm" style="width:100%;margin-top:10px" onclick="HomeUI.saveGratitude()">Save (+5 XP)</button>
        </div>
      `;
    }

    var weekKey=window.League?window.League.getWeekKey():'';
    var kindnessDone=state.kindnessDone||[];
    var kindnessDoneThisWeek=kindnessDone.indexOf(weekKey)>=0;
    if(window.QUESTIONS&&window.QUESTIONS.length){
      var kindnessPool=window.QUESTIONS.filter(function(q){return q.theme==='kindness'&&q.stage===p.stageId;});
      if(!kindnessPool.length) kindnessPool=window.QUESTIONS.filter(function(q){return q.theme==='kindness';});
      if(kindnessPool.length){
        var seed=0;for(var i=0;i<weekKey.length;i++) seed+=weekKey.charCodeAt(i);
        var kq=kindnessPool[seed%kindnessPool.length];
        document.getElementById('home-quest').innerHTML+=`
          <div class="card" style="border-left:4px solid #c04a7c;margin-top:8px;${kindnessDoneThisWeek?'opacity:.6':''}">
            <div style="font-size:.7rem;color:#c04a7c;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">💌 Kindness Quest of the Week</div>
            <p style="font-weight:600">${kq.text}</p>
            <p style="font-size:.8rem;color:var(--ink3);margin-top:4px">+${kq.xp} XP +3 🦪</p>
            ${!kindnessDoneThisWeek?`<button class="btn btn-sm" style="margin-top:8px;border:2px solid #c04a7c;color:#c04a7c" onclick="HomeUI.doneKindness()">✓ Done</button>`:'<p style="font-size:.8rem;color:var(--gold);margin-top:4px">✓ Completed this week</p>'}
          </div>
        `;
      }
    }

    document.getElementById('home-nav').innerHTML=`
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:20px">
        <button class="card" style="text-align:center;padding:12px 8px" onclick="App.showScreen('garden')">
          <div style="font-size:1.4rem">🌱</div>
          <div style="font-size:.7rem;font-weight:600;margin-top:2px">Garden</div>
        </button>
        <button class="card" style="text-align:center;padding:12px 8px" onclick="App.showScreen('league')">
          <div style="font-size:1.4rem">🏆</div>
          <div style="font-size:.7rem;font-weight:600;margin-top:2px">League</div>
        </button>
        <button class="card" style="text-align:center;padding:12px 8px" onclick="App.showScreen('games')">
          <div style="font-size:1.4rem">🎮</div>
          <div style="font-size:.7rem;font-weight:600;margin-top:2px">Play</div>
        </button>
        <button class="card" style="text-align:center;padding:12px 8px" onclick="App.showScreen('album')">
          <div style="font-size:1.4rem">🗂️</div>
          <div style="font-size:.7rem;font-weight:600;margin-top:2px">Cards</div>
        </button>
        <button class="card" style="text-align:center;padding:12px 8px" onclick="App.showScreen('journal')">
          <div style="font-size:1.4rem">💭</div>
          <div style="font-size:.7rem;font-weight:600;margin-top:2px">Journal</div>
        </button>
        <button class="card" style="text-align:center;padding:12px 8px" onclick="App.showScreen('capsule')">
          <div style="font-size:1.4rem">📮</div>
          <div style="font-size:.7rem;font-weight:600;margin-top:2px">Capsule</div>
        </button>
        <button class="card" style="text-align:center;padding:12px 8px" onclick="App.showScreen('shop')">
          <div style="font-size:1.4rem">🦪</div>
          <div style="font-size:.7rem;font-weight:600;margin-top:2px">Shop</div>
        </button>
        <button class="card" style="text-align:center;padding:12px 8px" onclick="App.showScreen('profile')">
          <div style="font-size:1.4rem">⚙️</div>
          <div style="font-size:.7rem;font-weight:600;margin-top:2px">Profile</div>
        </button>
        <button class="card" style="text-align:center;padding:12px 8px" onclick="App.showScreen('habits')">
          <div style="font-size:1.4rem">🔥</div>
          <div style="font-size:.7rem;font-weight:600;margin-top:2px">Habits</div>
        </button>
      </div>
    `;

    function renderRealmGrid(realms){
      return realms.map(function(r){
        var prog=window.Unlock.getRealmProgress(r.id,p,state.completedLessons);
        var hasLessons=prog.total>0;
        var circumference=2*Math.PI*20;
        var offset=circumference-(prog.pct/100)*circumference;
        return '<button class="card" style="text-align:left;padding:14px;'+(hasLessons?'':'opacity:.5')+'" '+(hasLessons?`onclick="App.showRealm('${r.id}')"`:'')+'>'+
          '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">'+
            '<span style="font-size:1.4rem">'+r.icon+'</span>'+
            '<svg class="progress-ring" width="36" height="36">'+
              '<circle class="bg" cx="18" cy="18" r="14" stroke-dasharray="'+circumference+'" stroke-dashoffset="0"/>'+
              '<circle class="fg" cx="18" cy="18" r="14" stroke="'+r.color+'" stroke-dasharray="'+circumference+'" stroke-dashoffset="'+offset+'" transform="rotate(-90 18 18)"/>'+
            '</svg>'+
          '</div>'+
          '<div style="font-weight:600;font-size:.8rem;margin-bottom:2px">'+r.name+'</div>'+
          '<div style="font-size:.7rem;color:var(--ink3)">'+(hasLessons?prog.done+'/'+prog.total+' · '+prog.pct+'%':p.stageRange[1]<p.age?'Locked':'Coming soon')+'</div>'+
        '</button>';
      }).join('');
    }

    document.getElementById('home-realms').innerHTML=`
      <h2 style="font-size:1rem;color:var(--gold2);margin-bottom:10px">🗺️ Your Life Map</h2>
      <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin-bottom:12px">${renderRealmGrid(coreRealms)}</div>
      <hr class="gold-rule" style="margin:20px 0 12px">
      <h2 style="font-size:1rem;color:var(--gold2);margin-bottom:4px">✦ Specializations</h2>
      <p style="font-size:.8rem;color:var(--ink3);margin-bottom:12px">Choose your craft — bonus realms</p>
      <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:12px">${renderRealmGrid(bonusRealms)}</div>
      <hr class="gold-rule" style="margin:20px 0 12px">
      <h2 style="font-size:1rem;color:var(--gold2);margin-bottom:12px">📚 The Reading Room</h2>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px">
        <button class="card" style="text-align:center;padding:16px" onclick="App.showScreen('reading')">
          <div style="font-size:2rem;margin-bottom:4px">📖</div>
          <div style="font-weight:600;font-size:.85rem">Books</div>
          <div style="font-size:.75rem;color:var(--ink3)">${stats.booksRead} read</div>
        </button>
        <button class="card" style="text-align:center;padding:16px" onclick="App.showScreen('reading')">
          <div style="font-size:2rem;margin-bottom:4px">🖋️</div>
          <div style="font-weight:600;font-size:.85rem">Poetry</div>
          <div style="font-size:.75rem;color:var(--ink3)">${stats.poemsRead} read</div>
        </button>
      </div>
    `;
  }
  function saveGratitude(){
    var g1=document.getElementById('grat1');
    var g2=document.getElementById('grat2');
    var g3=document.getElementById('grat3');
    if(!g1||!g1.value.trim()||!g2||!g2.value.trim()||!g3||!g3.value.trim()){
      alert('Please fill in all three good things!');
      return;
    }
    var state=window.App.getState();
    if(!state.gratitude) state.gratitude={};
    var todayId=new Date().toISOString().slice(0,10);
    if(state.gratitude[todayId]) return;
    state.gratitude[todayId]=[g1.value.trim(),g2.value.trim(),g3.value.trim()];
    window.Progress.addXP(state,5);
    window.App.setState(state);
    render(state);
  }
  function doneKindness(){
    var state=window.App.getState();
    var weekKey=window.League?window.League.getWeekKey():'';
    if(!state.kindnessDone) state.kindnessDone=[];
    if(state.kindnessDone.indexOf(weekKey)>=0) return;
    state.kindnessDone.push(weekKey);
    window.Progress.addXP(state,15);
    window.Economy.addPearls(state,3);
    window.App.setState(state);
    render(state);
  }
  window.HomeUI={render:render,saveGratitude:saveGratitude,doneKindness:doneKindness};
})();
