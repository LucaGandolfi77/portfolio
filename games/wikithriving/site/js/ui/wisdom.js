/* Wisdom Library UI */
(function(){
  let filter='all';
  function render(){
    const themes=[...new Set(window.QUOTES.map(q=>q.theme))];
    const filtered=filter==='all'?window.QUOTES:window.QUOTES.filter(q=>q.theme===filter);
    document.getElementById('wisdom-content').innerHTML=`
      <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:16px">
        <button class="chip ${filter==='all'?'chip-gold':''}" onclick="WisdomUI.setFilter('all')">All</button>
        ${themes.map(t=>`<button class="chip ${filter===t?'chip-gold':''}" onclick="WisdomUI.setFilter('${t}')">${t}</button>`).join('')}
      </div>
      <div style="display:flex;flex-direction:column;gap:10px">
        ${filtered.map(q=>`
          <div class="card" style="padding:14px;border-left:3px solid var(--gold)">
            <p style="font-family:var(--font-serif);font-style:italic;margin-bottom:4px">"${q.text}"</p>
            <p style="font-size:.8rem;color:var(--ink3)">— ${q.author}</p>
          </div>
        `).join('')}
      </div>
    `;
  }
  function setFilter(f){filter=f;render();}
  window.WisdomUI={render,setFilter};
})();
