/* Realm UI — lesson list + path */
(function(){
  let currentRealm=null;
  function render(realmId,state){
    currentRealm=realmId;
    const realm=window.REALMS.find(r=>r.id===realmId);
    const p=state.profile;
    const lessons=window.LESSONS.filter(l=>l.realm===realmId&&l.stage===p.stageId);
    const prog=window.Unlock.getRealmProgress(realmId,p,state.completedLessons);

    document.getElementById('realm-content').innerHTML=`
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px">
        <span style="font-size:2.5rem">${realm.icon}</span>
        <div>
          <h2 style="font-size:1.4rem">${realm.name}</h2>
          <p style="color:var(--ink3);font-size:.85rem">${realm.desc}</p>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px">
        <div style="flex:1;height:8px;background:var(--cream3);border-radius:4px;overflow:hidden">
          <div style="height:100%;width:${prog.pct}%;background:${realm.color};border-radius:4px;transition:width .5s"></div>
        </div>
        <span style="font-weight:700;color:${realm.color};font-size:.9rem">${prog.pct}%</span>
      </div>
      ${lessons.length?`
        <div style="display:flex;flex-direction:column;gap:10px">
          ${lessons.map((l,i)=>{
            const done=state.completedLessons.has(l.id);
            return`
              <button class="card" style="text-align:left;display:flex;align-items:center;gap:12px;${done?'border-color:var(--gold);background:#fffdf8':''}" onclick="App.showLesson('${l.id}')">
                <div class="lesson-node ${done?'done':''}">${done?'✓':i+1}</div>
                <div style="flex:1;min-width:0">
                  <div style="font-weight:600;font-size:.9rem;margin-bottom:2px">${l.title}</div>
                  <div style="font-size:.75rem;color:var(--ink3);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${l.body.slice(0,80)}...</div>
                </div>
                ${done?'<span style="color:var(--gold)">✓</span>':''}
              </button>
            `;
          }).join('')}
        </div>
      `:`<div class="card" style="text-align:center;color:var(--ink3)"><p>No lessons available for your stage yet.</p><p style="font-size:.85rem;margin-top:8px">Check back when you level up! 🔒</p></div>`}
    `;
  }
  window.RealmUI={render};
})();
