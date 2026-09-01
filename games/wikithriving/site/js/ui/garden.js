/* Garden UI — Review Garden */
(function(){
  function render(){
    var state=window.App.getState();
    window.Economy.ensureEconomy(state);
    window.Review.ensureGarden(state);
    var garden=state.garden;
    var ids=Object.keys(garden);
    var due=window.Review.getDuePlants(state);
    var wilting=window.Review.getWiltingCount(state);
    document.getElementById('garden-content').innerHTML=`
      <div style="text-align:center;margin-bottom:20px">
        <div style="font-size:2.5rem;margin-bottom:6px">🌱</div>
        <h3>Review Garden</h3>
        <p style="font-size:.85rem;color:var(--ink3)">${ids.length} plants · ${due.length} need water${wilting?' · '+wilting+' wilting!':''}</p>
      </div>
      ${ids.length===0?`
        <div class="card" style="text-align:center;padding:40px 20px">
          <div style="font-size:2rem;margin-bottom:8px">🪹</div>
          <p style="color:var(--ink3)">Your garden is empty.<br>Complete lessons to plant seeds!</p>
        </div>
      `:`
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:12px">
          ${ids.map(function(lid){
            var emoji=window.Review.getPlantEmoji(state,lid);
            var isDue=due.indexOf(lid)>=0;
            var lesson=window.LESSONS.find(function(l){return l.id===lid;});
            var title=lesson?lesson.title:lid;
            return '<button class="card" style="text-align:center;padding:14px;'+(isDue?'border-color:var(--gold);box-shadow:0 0 0 2px var(--gold-light)':'')+'" onclick="GardenUI.review(\''+lid+'\')">'+
              '<div style="font-size:2rem;margin-bottom:4px">'+emoji+'</div>'+
              '<div style="font-size:.75rem;font-weight:600;'+(isDue?'color:var(--gold2)':'color:var(--ink2)')+'">'+title.substring(0,20)+(title.length>20?'...':'')+'</div>'+
              (isDue?'<div style="font-size:.65rem;color:var(--gold);margin-top:4px">💧 Ready!</div>':'')+
            '</button>';
          }).join('')}
        </div>
      `}
    `;
  }
  function review(lessonId){
    var state=window.App.getState();
    if(!window.Economy.hasHearts(state)){
      alert('❤️ No hearts left! Wait for refill or visit the shop.');
      return;
    }
    var lesson=window.LESSONS.find(function(l){return l.id===lessonId;});
    if(!lesson) return;
    var questions=window.Quiz.buildSet(lesson,2);
    if(!questions.length){alert('No review questions available.');return;}
    window.App.showLesson(lessonId);
  }
  window.GardenUI={render:render,review:review};
})();
