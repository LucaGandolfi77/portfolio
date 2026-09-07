/* Search UI — find lessons across all realms */
(function(){
  var currentQuery='';
  var currentRealm='all';
  function render(){
    var state=window.App.getState();
    var allLessons=window.LESSONS;
    var realms=window.REALMS;
    var results=allLessons;
    if(currentQuery){
      var q=currentQuery.toLowerCase();
      results=results.filter(function(l){
        return l.title.toLowerCase().indexOf(q)>=0||l.body.toLowerCase().indexOf(q)>=0||(l.quote&&l.quote.toLowerCase().indexOf(q)>=0)||(l.author&&l.author.toLowerCase().indexOf(q)>=0);
      });
    }
    if(currentRealm!=='all'){
      results=results.filter(function(l){return l.realm===currentRealm;});
    }
    var done=state.completedLessons;
    document.getElementById('search-content').innerHTML=`
      <div style="text-align:center;margin-bottom:20px">
        <div style="font-size:2.5rem;margin-bottom:6px">🔍</div>
        <h3>Search Lessons</h3>
        <p style="font-size:.85rem;color:var(--ink3)">${allLessons.length} lessons across ${realms.length} realms</p>
      </div>
      <div style="margin-bottom:16px">
        <input type="text" id="search-input" placeholder="Search by title, content, author..." value="${currentQuery}" style="width:100%;padding:12px 16px;border:2px solid var(--border);border-radius:var(--radius-sm);font-size:1rem;background:var(--paper);font-family:var(--font-sans)" oninput="SearchUI.onInput(this.value)">
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:16px">
        <button class="chip ${currentRealm==='all'?'chip-gold':''}" onclick="SearchUI.setRealm('all')">All</button>
        ${realms.map(function(r){return '<button class="chip '+(currentRealm===r.id?'chip-gold':'')+'" onclick="SearchUI.setRealm(\''+r.id+'\')">'+r.icon+' '+r.name.split(' ')[0]+'</button>';}).join('')}
      </div>
      <div style="font-size:.8rem;color:var(--ink3);margin-bottom:12px">${results.length} results</div>
      <div style="display:flex;flex-direction:column;gap:8px">
        ${results.slice(0,50).map(function(l){
          var realm=realms.find(function(r){return r.id===l.realm;});
          var isDone=done.has(l.id);
          return '<button class="card" style="text-align:left;padding:12px;'+(isDone?'border-color:var(--gold);background:#fffdf8':'')+'" onclick="App.showLesson(\''+l.id+'\')">'+
            '<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">'+
              '<span style="font-size:1rem">'+(realm?realm.icon:'📖')+'</span>'+
              '<span style="font-weight:600;font-size:.9rem">'+l.title+'</span>'+
              (isDone?'<span style="color:var(--gold);font-size:.8rem">✓</span>':'')+
            '</div>'+
            '<div style="font-size:.75rem;color:var(--ink3);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+l.body.slice(0,80)+'...</div>'+
          '</button>';
        }).join('')}
        ${results.length>50?'<div style="text-align:center;padding:12px;color:var(--ink3);font-size:.85rem">Showing 50 of '+results.length+' results. Narrow your search.</div>':''}
        ${results.length===0?'<div style="text-align:center;padding:30px;color:var(--ink3)"><div style="font-size:2rem;margin-bottom:8px">🔍</div><p>No lessons found. Try different keywords.</p></div>':''}
      </div>
    `;
  }
  function onInput(val){currentQuery=val;render();}
  function setRealm(realm){currentRealm=realm;render();}
  window.SearchUI={render:render,onInput:onInput,setRealm:setRealm};
})();
