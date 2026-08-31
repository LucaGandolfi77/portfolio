/* Reading Room UI — Books + Poetry tabs */
(function(){
  let tab='books';
  let bookFilter='all';
  let poemFilter='all';
  function render(){
    const state=window.App.getState();
    const p=state.profile;
    const books=window.BOOKS||[];
    const poems=window.POEMS||[];
    const themes=[...new Set(books.map(b=>b.themes).flat())].slice(0,12);
    const poemThemes=[...new Set(poems.map(p=>p.theme))];

    document.getElementById('reading-content').innerHTML=`
      <h2 style="margin-bottom:4px">📚 The Reading Room</h2>
      <p style="color:var(--ink3);font-size:.85rem;margin-bottom:16px">Books chosen with care, poems read with feeling</p>
      <div style="display:flex;gap:8px;margin-bottom:16px">
        <button class="btn btn-sm ${tab==='books'?'btn-primary':'btn-outline'}" onclick="ReadingUI.setTab('books')">📖 Books (${books.length})</button>
        <button class="btn btn-sm ${tab==='poems'?'btn-primary':'btn-outline'}" onclick="ReadingUI.setTab('poems')">🖋️ Poetry (${poems.length})</button>
      </div>
      ${tab==='books'?renderBooks(books,state,p):renderPoems(poems,state,p)}
    `;
  }
  function renderBooks(books,state,p){
    const filtered=bookFilter==='all'?books:books.filter(b=>b.themes.includes(bookFilter));
    return`
      <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px">
        <button class="chip ${bookFilter==='all'?'chip-gold':''}" onclick="ReadingUI.setBookFilter('all')">All</button>
        ${['childhood','love','adventure','courage','wisdom','meaning','nature','humor','identity','society'].map(t=>`<button class="chip ${bookFilter===t?'chip-gold':''}" onclick="ReadingUI.setBookFilter('${t}')">${t}</button>`).join('')}
      </div>
      <div style="display:flex;flex-direction:column;gap:12px">
        ${filtered.map(b=>{
          const read=state.booksRead.has(b.id);
          const stage=window.STAGES.find(s=>s.id===b.stage);
          return`
            <div class="card" style="padding:16px;${read?'border-color:var(--gold);background:#fffdf8':''}">
              <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px">
                <div>
                  <h3 style="font-size:1.05rem;margin-bottom:2px">${b.title}</h3>
                  <p style="font-size:.8rem;color:var(--ink3)">${b.author} · ${b.year>0?b.year:'Ancient'}</p>
                </div>
                <span class="chip" style="font-size:.7rem">${stage?stage.emoji:''} ${b.stage.replace('_',' ')}</span>
              </div>
              <blockquote style="font-family:var(--font-serif);font-style:italic;font-size:.9rem;color:var(--ink2);margin-bottom:10px;border-left:3px solid var(--gold);padding-left:12px">"${b.quote}"</blockquote>
              <p style="font-size:.88rem;line-height:1.65;color:var(--ink2);margin-bottom:12px">${b.why}</p>
              <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:8px">
                ${b.themes.map(t=>`<span class="chip" style="font-size:.65rem">${t}</span>`).join('')}
              </div>
              ${!read?`<button class="btn btn-sm btn-primary" onclick="ReadingUI.markBook('${b.id}')">✓ Mark as Read (+10 XP)</button>`:`<p style="color:var(--gold);font-weight:600;font-size:.85rem">✨ Read</p>`}
            </div>
          `;
        }).join('')}
      </div>
    `;
  }
  function renderPoems(poems,state,p){
    const filtered=poemFilter==='all'?poems:poems.filter(p=>p.theme===poemFilter);
    return`
      <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px">
        <button class="chip ${poemFilter==='all'?'chip-gold':''}" onclick="ReadingUI.setPoemFilter('all')">All</button>
        ${poemThemes.map(t=>`<button class="chip ${poemFilter===t?'chip-gold':''}" onclick="ReadingUI.setPoemFilter('${t}')">${t}</button>`).join('')}
      </div>
      <div style="display:flex;flex-direction:column;gap:10px">
        ${filtered.map(p=>{
          const read=state.poemsRead.has(p.id);
          const stage=window.STAGES.find(s=>s.id===p.stage);
          return`
            <button class="card" style="text-align:left;padding:14px;${read?'border-color:var(--gold);background:#fffdf8':''}" onclick="App.showPoem('${p.id}')">
              <div style="display:flex;justify-content:space-between;align-items:flex-start">
                <div>
                  <div style="font-weight:700;margin-bottom:2px">${p.title}</div>
                  <div style="font-size:.8rem;color:var(--ink3)">${p.author} · ${p.year>0?p.year:'Ancient'}</div>
                </div>
                <div style="display:flex;align-items:center;gap:6px">
                  <span class="chip" style="font-size:.65rem">${p.theme}</span>
                  ${read?'<span style="color:var(--gold)">✓</span>':''}
                </div>
              </div>
            </button>
          `;
        }).join('')}
      </div>
    `;
  }
  function markBook(id){
    const state=window.App.getState();
    if(!state.booksRead.has(id)){
      state.booksRead.add(id);
      window.Progress.addXP(state,10);
      const{state:s2,newBadges}=window.Progress.checkBadges(state);
      window.App.setState(s2);
      if(newBadges.length) alert('🏅 New badge: '+newBadges.map(b=>b.emoji+' '+b.name).join(', '));
    }
    render();
  }
  function setTab(t){tab=t;render();}
  function setBookFilter(f){bookFilter=f;render();}
  function setPoemFilter(f){poemFilter=f;render();}
  window.ReadingUI={render,setTab,setBookFilter,setPoemFilter,markBook};
})();
