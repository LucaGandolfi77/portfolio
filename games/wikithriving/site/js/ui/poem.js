/* Poem Reader UI — meditative typography */
(function(){
  function render(poemId){
    const poem=window.POEMS.find(p=>p.id===poemId);
    if(!poem) return;
    const state=window.App.getState();
    const read=state.poemsRead.has(poemId);
    const stage=window.STAGES.find(s=>s.id===poem.stage);

    const textLines=poem.text.split('\n').map(l=>{
      if(l.trim()==='') return '<br>';
      if(l.startsWith('  ')) return `<span style="display:block;padding-left:2em">${l.trim()}</span>`;
      return `<span style="display:block">${l}</span>`;
    }).join('');

    document.getElementById('poem-content').innerHTML=`
      <div style="text-align:center;margin-bottom:24px">
        <span class="chip" style="font-size:.7rem;margin-bottom:8px">${poem.theme}</span>
        <h1 style="font-size:1.6rem;margin-bottom:4px">${poem.title}</h1>
        <p style="font-size:.9rem;color:var(--ink2)">${poem.author}</p>
        <p style="font-size:.75rem;color:var(--ink3)">${poem.year>0?poem.year:'Ancient'} · ${stage?stage.emoji:''} ${poem.stage.replace('_',' ')}</p>
      </div>
      <div class="card card-lg" style="padding:28px 24px;margin-bottom:20px;background:linear-gradient(180deg,#fffdf8,#faf6ee);border:none;box-shadow:var(--shadow-lg)">
        <div style="font-family:var(--font-serif);font-size:1.05rem;line-height:1.9;color:var(--ink);text-align:center;white-space:pre-line">
          ${textLines}
        </div>
      </div>
      ${poem.lineToCarry?`
        <div style="text-align:center;margin-bottom:24px">
          <div style="font-size:.7rem;color:var(--gold2);text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">✦ A line to carry with you</div>
          <p style="font-family:var(--font-serif);font-style:italic;font-size:1.15rem;color:var(--gold);line-height:1.5">"${poem.lineToCarry}"</p>
        </div>
      `:''}
      <hr class="gold-rule">
      <div style="margin-bottom:24px">
        <div style="font-size:.7rem;color:var(--gold2);text-transform:uppercase;letter-spacing:1px;margin-bottom:10px">💫 Why this poem matters</div>
        <p style="font-size:.92rem;line-height:1.7;color:var(--ink2)">${poem.interpretation}</p>
      </div>
      ${poem.translation?`
        <hr class="gold-rule">
        <div style="margin-bottom:24px">
          <div style="font-size:.7rem;color:var(--gold2);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">📖 Translation</div>
          <p style="font-size:.88rem;line-height:1.6;color:var(--ink3);font-style:italic">${poem.translation}</p>
        </div>
      `:''}
      <div class="card" style="text-align:center;margin-bottom:16px;background:var(--cream)">
        <p style="font-size:.85rem;color:var(--ink2);margin-bottom:8px">🎤 Read this poem aloud. Poetry is meant to be heard.</p>
        <p style="font-size:.75rem;color:var(--ink3)">Let the words vibrate in the air. Feel how they change when spoken.</p>
      </div>
      ${!read?`<button class="btn btn-primary" style="width:100%;margin-bottom:16px" onclick="PoemUI.markRead('${poemId}')">✓ Mark as Read (+10 XP)</button>`:`<p style="text-align:center;color:var(--gold);font-weight:600;margin-bottom:16px">✨ Already read</p>`}
    `;
  }
  function markRead(poemId){
    const state=window.App.getState();
    if(!state.poemsRead.has(poemId)){
      state.poemsRead.add(poemId);
      window.Progress.addXP(state,10);
      const{state:s2,newBadges}=window.Progress.checkBadges(state);
      window.App.setState(s2);
      if(newBadges.length) alert('🏅 New badge: '+newBadges.map(b=>b.emoji+' '+b.name).join(', '));
    }
    render(poemId);
  }
  window.PoemUI={render,markRead};
})();
