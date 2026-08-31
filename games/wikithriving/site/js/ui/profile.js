/* Profile UI — settings + stats */
(function(){
  function render(){
    const state=window.App.getState();
    const p=state.profile;
    const stats=window.Progress.getStats(state);
    document.getElementById('profile-content').innerHTML=`
      <div class="card card-lg" style="text-align:center;margin-bottom:16px">
        <div style="font-size:3rem;margin-bottom:8px">${p.flag}</div>
        <h3>${p.stageEmoji} ${p.stageName}</h3>
        <p style="color:var(--ink3);font-size:.85rem">Age ${p.age} · ${p.gender}</p>
        <p style="color:var(--ink3);font-size:.85rem">${p.flag} ${p.country} · ${p.currency}</p>
      </div>
      <div class="card" style="margin-bottom:16px">
        <div style="display:flex;justify-content:space-between;margin-bottom:12px">
          <span>${stats.rank.emoji} ${stats.rank.name}</span>
          <span>Level ${stats.level}</span>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;text-align:center">
          <div><div style="font-size:1.5rem;font-weight:700;color:var(--gold)">${stats.xp}</div><div style="font-size:.7rem;color:var(--ink3)">XP</div></div>
          <div><div style="font-size:1.5rem;font-weight:700;color:var(--gold)">${stats.totalLessons}</div><div style="font-size:.7rem;color:var(--ink3)">Lessons</div></div>
          <div><div style="font-size:1.5rem;font-weight:700;color:var(--gold)">${stats.streak}</div><div style="font-size:.7rem;color:var(--ink3)">Streak</div></div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;text-align:center;margin-top:12px">
          <div><div style="font-size:1.3rem;font-weight:700;color:var(--gold)">${stats.booksRead}</div><div style="font-size:.7rem;color:var(--ink3)">Books Read</div></div>
          <div><div style="font-size:1.3rem;font-weight:700;color:var(--gold)">${stats.poemsRead}</div><div style="font-size:.7rem;color:var(--ink3)">Poems Read</div></div>
        </div>
      </div>
      ${stats.badges.length?`
        <div class="card" style="margin-bottom:16px">
          <h4 style="margin-bottom:8px">🏅 Badges (${stats.badges.length})</h4>
          <div style="display:flex;flex-wrap:wrap;gap:8px">
            ${stats.badges.map(b=>`<span class="chip chip-gold" title="${b.desc}">${b.emoji} ${b.name}</span>`).join('')}
          </div>
        </div>
      `:''}
      <div class="card" style="margin-bottom:16px">
        <h4 style="margin-bottom:8px">📊 All Badges</h4>
        <div style="display:flex;flex-direction:column;gap:6px">
          ${window.Progress.BADGES.map(b=>{
            const earned=state.earnedBadges.has(b.id);
            return`<div style="display:flex;align-items:center;gap:8px;${earned?'':'opacity:.4'}">
              <span style="font-size:1.2rem">${b.emoji}</span>
              <div><div style="font-weight:600;font-size:.85rem">${b.name}</div><div style="font-size:.75rem;color:var(--ink3)">${b.desc}</div></div>
            </div>`;
          }).join('')}
        </div>
      </div>
      <button class="btn btn-outline" style="width:100%;margin-bottom:8px" onclick="ProfileUI.exportData()">📤 Export Progress</button>
      <button class="btn btn-outline" style="width:100%;margin-bottom:8px;color:#c04a5a;border-color:#c04a5a" onclick="ProfileUI.reset()">🗑️ Reset All Data</button>
    `;
  }
  function exportData(){
    const state=window.App.getState();
    const data={...state,completedLessons:[...state.completedLessons],earnedBadges:[...state.earnedBadges],dailyQuestsDone:[...state.dailyQuestsDone]};
    const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
    const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='wikithriving-progress.json';a.click();
  }
  function reset(){
    if(!confirm('Are you sure? This will delete all your progress.')) return;
    localStorage.removeItem('wikithriving_state');
    location.reload();
  }
  window.ProfileUI={render,exportData,reset};
})();
