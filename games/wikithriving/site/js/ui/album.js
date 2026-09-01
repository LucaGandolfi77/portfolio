/* Album UI — Wisdom Cards collection */
(function(){
  var currentView='overview';
  var selectedRealm=null;
  function render(){
    if(currentView==='realm'&&selectedRealm) renderRealm();
    else renderOverview();
  }
  function renderOverview(){
    var state=window.App.getState();
    var stats=window.Cards.getAlbumStats(state);
    var totalCards=window.Cards.getTotalCards();
    document.getElementById('album-content').innerHTML=`
      <div style="text-align:center;margin-bottom:20px">
        <div style="font-size:2.5rem;margin-bottom:6px">🗂️</div>
        <h3>Wisdom Cards</h3>
        <p style="font-size:.85rem;color:var(--ink3)">${stats.totalOwned} / ${totalCards} collected · ${stats.goldCards} gold</p>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:10px">
        ${stats.realms.map(function(r){
          var pct=r.pct;
          return '<button class="card" style="text-align:center;padding:14px;'+(r.total===0?'opacity:.4':'')+'" onclick="AlbumUI.showRealm(\''+r.id+'\')">'+
            '<div style="font-size:1.5rem;margin-bottom:4px">'+r.icon+'</div>'+
            '<div style="font-size:.75rem;font-weight:600;margin-bottom:6px">'+r.name+'</div>'+
            '<div style="height:4px;background:var(--cream3);border-radius:2px;overflow:hidden;margin-bottom:4px">'+
              '<div style="height:100%;width:'+pct+'%;background:'+r.color+';border-radius:2px"></div>'+
            '</div>'+
            '<div style="font-size:.7rem;color:var(--ink3)">'+r.owned+'/'+r.total+'</div>'+
          '</button>';
        }).join('')}
      </div>
    `;
  }
  function renderRealm(){
    var state=window.App.getState();
    var realm=window.REALMS.find(function(r){return r.id===selectedRealm;});
    if(!realm){currentView='overview';render();return;}
    var cards=window.Cards.getRealmCards(selectedRealm,state);
    var realmLessons=window.LESSONS.filter(function(l){return l.realm===selectedRealm&&l.stage===state.profile.stageId;});
    document.getElementById('album-content').innerHTML=`
      <button onclick="AlbumUI.back()" style="align-self:flex-start;margin-bottom:12px;font-size:.9rem;color:var(--ink2)">← Back to Album</button>
      <div style="text-align:center;margin-bottom:16px">
        <div style="font-size:2rem;margin-bottom:4px">${realm.icon}</div>
        <h3>${realm.name}</h3>
        <p style="font-size:.8rem;color:var(--ink3)">${cards.length} cards</p>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:10px">
        ${realmLessons.map(function(l){
          var owned=state.completedLessons&&state.completedLessons.has(l.id);
          return '<div class="card" style="text-align:center;padding:12px;'+(owned?'':'opacity:.35')+'" '+
            'style="background:linear-gradient(135deg,'+realm.color+'15,'+realm.color+'30)">'+
            '<div style="font-size:1.4rem;margin-bottom:4px">'+(owned?realm.icon:'❓')+'</div>'+
            '<div style="font-size:.7rem;font-weight:600">'+(owned?l.title.substring(0,15):'???')+'</div>'+
          '</div>';
        }).join('')}
      </div>
    `;
  }
  function showRealm(realmId){
    currentView='realm';
    selectedRealm=realmId;
    render();
  }
  function back(){
    currentView='overview';
    selectedRealm=null;
    render();
  }
  window.AlbumUI={render:render,showRealm:showRealm,back:back};
})();
