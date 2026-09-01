/* League UI — weekly standings */
(function(){
  function render(){
    var state=window.App.getState();
    window.League.ensureLeague(state);
    var standings=window.League.getStandings(state);
    var myRank=window.League.getMyRank(state);
    var total=window.League.getLeagueSize();
    var weekKey=window.League.getWeekKey();
    var medals=['🥇','🥈','🥉'];
    document.getElementById('league-content').innerHTML=`
      <div style="text-align:center;margin-bottom:20px">
        <div style="font-size:2.5rem;margin-bottom:6px">🏆</div>
        <h3>Weekly League</h3>
        <p style="font-size:.85rem;color:var(--ink3)">Week ${weekKey} · Rank ${myRank}/${total}</p>
      </div>
      <div class="card" style="margin-bottom:16px;text-align:center;padding:16px;background:linear-gradient(135deg,#fffdf8,#f5e6c8)">
        <div style="font-size:.7rem;color:var(--gold2);text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">Your Standing</div>
        <div style="font-size:1.8rem;font-weight:700;color:var(--gold)">${medals[myRank-1]||''} #${myRank}</div>
        <div style="font-size:.85rem;color:var(--ink2);margin-top:4px">⚡ ${state.league.weeklyXP||0} XP this week</div>
      </div>
      <div style="display:flex;flex-direction:column;gap:6px">
        ${standings.slice(0,15).map(function(e,i){
          var medal=i<3?medals[i]:'';
          var isYou=e.isUser;
          return '<div class="card" style="display:flex;align-items:center;gap:12px;padding:12px 16px;'+(isYou?'border-color:var(--gold);background:var(--gold-light)':'')+'">'+
            '<span style="font-weight:700;color:var(--ink3);min-width:28px">'+(i+1)+'.</span>'+
            '<span style="font-size:1.2rem">'+e.emoji+'</span>'+
            '<span style="flex:1;font-weight:600;font-size:.9rem">'+e.name+(isYou?' (You)':'')+'</span>'+
            '<span style="font-weight:700;color:'+(isYou?'var(--gold)':'var(--ink2)')+'">'+medal+' '+e.xp+' XP</span>'+
          '</div>';
        }).join('')}
      </div>
      ${state.league.prevResult?`
        <hr class="gold-rule">
        <div class="card" style="text-align:center">
          <div style="font-size:.7rem;color:var(--ink3);text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">Last Week</div>
          <div style="font-weight:600">Rank #${state.league.prevResult.rank} · ${state.league.prevResult.myXP} XP</div>
          ${state.league.prevResult.rank<=10?'<div style="font-size:.8rem;color:var(--gold);margin-top:4px">🎉 Top 10 — Pearls earned!</div>':''}
        </div>
      `:''}
    `;
  }
  window.LeagueUI={render:render};
})();
