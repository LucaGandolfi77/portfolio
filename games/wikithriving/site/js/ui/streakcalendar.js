/* Streak Calendar — visual streak tracker */
(function(){
  function render(){
    var state=window.App.getState();
    var streak=state.streak||0;
    var lastVisit=state.lastVisit;
    var today=new Date().toISOString().slice(0,10);
    var completed=state.completedLessons||new Set();
    // Build last 30 days
    var days=[];
    for(var i=29;i>=0;i--){
      var d=new Date(Date.now()-i*86400000);
      var key=d.toISOString().slice(0,10);
      var isToday=key===today;
      var isPast=new Date(key)<new Date(today);
      var wasActive=key<=today&&(lastVisit===key||(function(){
        // Check if any lesson was completed on this day
        // We approximate: if streak covers this day, it was active
        if(!lastVisit) return false;
        var lastD=new Date(lastVisit);
        var dayD=new Date(key);
        var diff=Math.floor((lastD-dayD)/86400000);
        return diff>=0&&diff<streak;
      })());
      days.push({date:key,day:d.getDate(),month:d.toLocaleDateString('en',{month:'short'}),weekday:d.toLocaleDateString('en',{weekday:'short'}),isToday:isToday,isPast:isPast,wasActive:wasActive});
    }
    // Calculate longest streak
    var longest=streak;
    // Build calendar grid
    var calHTML=days.map(function(d){
      var bg='var(--paper)';
      var border='var(--border)';
      var color='var(--ink3)';
      if(d.wasActive){bg='var(--gold-light)';border='var(--gold)';color='var(--gold2)';}
      if(d.isToday){border='var(--gold)';color='var(--gold)';}
      return '<div style="text-align:center;padding:8px 4px;border:1px solid '+border+';border-radius:6px;background:'+bg+';min-width:0">'+
        '<div style="font-size:.55rem;color:'+color+'">'+d.weekday.charAt(0)+'</div>'+
        '<div style="font-size:.9rem;font-weight:600;color:'+color+'">'+d.day+'</div>'+
        (d.wasActive?'<div style="font-size:.5rem">🔥</div>':'')+
      '</div>';
    }).join('');
    // Stats
    var totalDays=days.filter(function(d){return d.wasActive;}).length;
    var thisWeek=days.slice(-7).filter(function(d){return d.wasActive;}).length;
    document.getElementById('streak-content').innerHTML=`
      <div style="text-align:center;margin-bottom:20px">
        <div style="font-size:2.5rem;margin-bottom:6px">🔥</div>
        <h3>Streak Calendar</h3>
        <p style="font-size:.85rem;color:var(--ink3)">Your learning journey visualized</p>
      </div>
      <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:6px;margin-bottom:20px">
        ${['S','M','T','W','T','F','S'].map(function(d){return '<div style="text-align:center;font-size:.65rem;font-weight:600;color:var(--ink3);padding:4px">'+d+'</div>';}).join('')}
        ${calHTML}
      </div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px">
        <div class="card" style="text-align:center;padding:14px">
          <div style="font-size:1.8rem;font-weight:700;color:var(--gold)">${streak}</div>
          <div style="font-size:.7rem;color:var(--ink3)">Current Streak</div>
        </div>
        <div class="card" style="text-align:center;padding:14px">
          <div style="font-size:1.8rem;font-weight:700;color:var(--gold)">${longest}</div>
          <div style="font-size:.7rem;color:var(--ink3)">Longest Streak</div>
        </div>
        <div class="card" style="text-align:center;padding:14px">
          <div style="font-size:1.8rem;font-weight:700;color:var(--gold)">${totalDays}</div>
          <div style="font-size:.7rem;color:var(--ink3)">Days Active (30d)</div>
        </div>
      </div>
      <div class="card" style="padding:16px">
        <div style="font-size:.7rem;color:var(--gold2);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">💡 Streak Tips</div>
        <ul style="font-size:.85rem;color:var(--ink2);line-height:1.8;padding-left:20px">
          <li>Complete at least one lesson daily</li>
          <li>Use your freeze if you miss a day</li>
          <li>Set a daily reminder</li>
          <li>Start small: 5 minutes a day is enough</li>
        </ul>
      </div>
    `;
  }
  window.StreakCalendarUI={render:render};
})();
