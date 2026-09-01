/* Journal UI — Big Question + personal journal */
(function(){
  function getTodayQuestion(){
    if(!window.BIG_QUESTIONS||!window.BIG_QUESTIONS.length) return null;
    var state=window.App.getState();
    var p=state.profile;
    var seed=new Date().toISOString().slice(0,10).split('-').reduce(function(a,b){return parseInt(a)+parseInt(b);},0)+p.stageId.length*7;
    var pool=window.BIG_QUESTIONS.filter(function(q){return q.stage===p.stageId;});
    if(!pool.length) pool=window.BIG_QUESTIONS;
    var idx=seed%pool.length;
    return pool[idx];
  }
  function render(){
    var state=window.App.getState();
    var q=getTodayQuestion();
    var todayId=new Date().toISOString().slice(0,10);
    var answered=state.journal&&state.journal[todayId];
    document.getElementById('journal-content').innerHTML=`
      ${q?`
        <div class="card" style="background:linear-gradient(135deg,#fffdf8,#f5e6c8);border-color:var(--gold-light);margin-bottom:20px">
          <div style="font-size:.7rem;color:var(--gold2);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">💭 The Big Question</div>
          <p style="font-family:var(--font-serif);font-size:1.1rem;font-weight:600;margin-bottom:12px">${q.text}</p>
          ${answered?`
            <p style="font-size:.85rem;color:var(--ink2);line-height:1.6;background:var(--cream);padding:12px;border-radius:var(--radius-sm)">${answered.answer}</p>
            <p style="font-size:.75rem;color:var(--gold);margin-top:8px">✓ Answered today</p>
          `:`
            <textarea id="journal-input" rows="4" style="width:100%;padding:12px;border:2px solid var(--border);border-radius:var(--radius-sm);font-family:var(--font-sans);font-size:.9rem;resize:none;margin-bottom:10px" placeholder="Write your thoughts..."></textarea>
            <button class="btn btn-primary" style="width:100%" onclick="JournalUI.save()">Save (+5 XP)</button>
          `}
        </div>
      `:''}
      ${state.gratitude&&Object.keys(state.gratitude).length?`
        <h4 style="margin-bottom:10px">🌅 Gratitude Entries</h4>
        <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:20px">
          ${Object.keys(state.gratitude).sort().reverse().map(function(did){
            var items=state.gratitude[did];
            return '<div class="card" style="padding:14px;border-left:4px solid #e8a735">'+
              '<div style="font-size:.7rem;color:#e8a735;margin-bottom:6px">'+did+'</div>'+
              '<ol style="margin:0;padding-left:18px">'+items.map(function(t){return '<li style="font-size:.85rem;color:var(--ink2);margin-bottom:2px">'+t+'</li>';}).join('')+'</ol>'+
            '</div>';
          }).join('')}
        </div>
      `:''}
      <h4 style="margin-bottom:12px">📔 Past Journal Entries</h4>
      ${state.journal&&Object.keys(state.journal).length?`
        <div style="display:flex;flex-direction:column;gap:10px">
          ${Object.keys(state.journal).sort().reverse().map(function(did){
            var entry=state.journal[did];
            return '<div class="card" style="padding:14px">'+
              '<div style="font-size:.7rem;color:var(--ink3);margin-bottom:6px">'+did+'</div>'+
              '<p style="font-size:.9rem;color:var(--ink2);line-height:1.5">'+entry.answer+'</p>'+
            '</div>';
          }).join('')}
        </div>
      `:'<div class="card" style="text-align:center;padding:24px"><p style="color:var(--ink3)">No entries yet. Answer today\'s Big Question to start your journal!</p></div>'}
    `;
  }
  function save(){
    var input=document.getElementById('journal-input');
    if(!input||!input.value.trim()) return;
    var state=window.App.getState();
    if(!state.journal) state.journal={};
    var todayId=new Date().toISOString().slice(0,10);
    if(state.journal[todayId]) return;
    state.journal[todayId]={answer:input.value.trim(),date:todayId};
    window.Progress.addXP(state,5);
    window.App.setState(state);
    render();
  }
  window.JournalUI={render:render,save:save};
})();
