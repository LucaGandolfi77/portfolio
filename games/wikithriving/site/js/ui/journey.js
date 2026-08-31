/* Journey UI — timeline from 4 to 100 */
(function(){
  function render(){
    const state=window.App.getState();
    const p=state.profile;
    const currentIdx=window.STAGES.findIndex(s=>s.id===p.stageId);
    document.getElementById('journey-content').innerHTML=`
      <div style="position:relative;padding-left:40px">
        ${window.STAGES.map((s,i)=>{
          const isPast=i<currentIdx;
          const isCurrent=i===currentIdx;
          const isFuture=i>currentIdx;
          const lessonsInStage=window.LESSONS.filter(l=>l.stage===s.id);
          const realmCount=new Set(lessonsInStage.map(l=>l.realm)).size;
          return`
            <div style="position:relative;margin-bottom:24px;${isFuture?'opacity:.5':''}">
              <div style="position:absolute;left:-40px;top:0;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.2rem;background:${isCurrent?s.color:isPast?'var(--gold-light)':'var(--cream3)'};${isCurrent?'box-shadow:0 0 0 4px '+s.color+'40':''}">
                ${s.emoji}
              </div>
              <div class="card" style="padding:14px;${isCurrent?'border:2px solid '+s.color:''}">
                <div style="font-weight:700;font-size:1rem;margin-bottom:2px">${s.name} <span style="color:var(--ink3);font-weight:400;font-size:.85rem">${s.range[0]}–${s.range[1]} years</span></div>
                <div style="font-size:.8rem;color:var(--ink3)">${realmCount} realms · ${lessonsInStage.length} lessons</div>
                ${isCurrent?'<div class="chip chip-gold" style="margin-top:6px">📍 You are here</div>':''}
                ${isFuture?`<div style="margin-top:6px;font-size:.75rem;color:var(--ink3)">🔒 Unlocks at age ${s.range[0]}</div>`:''}
                ${isPast?`<div style="margin-top:6px;font-size:.75rem;color:var(--gold2)">✓ Completed</div>`:''}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }
  window.JourneyUI={render};
})();
