/* Home UI — Life Map (expanded with bonus realms + reading room) */
(function(){
  function render(state){
    const p=state.profile;
    const stats=window.Progress.getStats(state);
    const dailyQuote=window.Daily.getDailyQuote(p);
    const dailyQuest=window.Daily.getDailyQuest(p);
    const rank=stats.rank;
    const coreRealms=window.REALMS.filter(r=>!r.bonus);
    const bonusRealms=window.REALMS.filter(r=>r.bonus);

    document.getElementById('home-header').innerHTML=`
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
        <div>
          <span class="flag-badge">${p.flag}</span>
          <span class="stage-badge">${p.stageEmoji} ${p.stageName}</span>
        </div>
        <div style="display:flex;gap:8px">
          <span class="xp-badge">⚡ ${stats.xp} XP</span>
          <span class="streak-badge">🔥 ${stats.streak}</span>
        </div>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div style="font-size:.85rem;color:var(--ink2)">${rank.emoji} ${rank.name} · Level ${stats.level}</div>
        <div style="font-size:.8rem;color:var(--ink3)">${stats.totalLessons} lessons · ${stats.badges.length} badges</div>
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

    function renderRealmGrid(realms){
      return realms.map(r=>{
        const prog=window.Unlock.getRealmProgress(r.id,p,state.completedLessons);
        const hasLessons=prog.total>0;
        const circumference=2*Math.PI*20;
        const offset=circumference-(prog.pct/100)*circumference;
        return`
          <button class="card" style="text-align:left;padding:14px;${hasLessons?'':'opacity:.5'}" ${hasLessons?`onclick="App.showRealm('${r.id}')"`:''}>
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
              <span style="font-size:1.4rem">${r.icon}</span>
              <svg class="progress-ring" width="36" height="36">
                <circle class="bg" cx="18" cy="18" r="14" stroke-dasharray="${circumference}" stroke-dashoffset="0"/>
                <circle class="fg" cx="18" cy="18" r="14" stroke="${r.color}" stroke-dasharray="${circumference}" stroke-dashoffset="${offset}" transform="rotate(-90 18 18)"/>
              </svg>
            </div>
            <div style="font-weight:600;font-size:.8rem;margin-bottom:2px">${r.name}</div>
            <div style="font-size:.7rem;color:var(--ink3)">${hasLessons?`${prog.done}/${prog.total} · ${prog.pct}%`:p.stageRange[1]<p.age?'Locked':'Coming soon'}</div>
          </button>
        `;
      }).join('');
    }

    document.getElementById('home-realms').innerHTML=`
      <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:12px">${renderRealmGrid(coreRealms)}</div>
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
  window.HomeUI={render};
})();
