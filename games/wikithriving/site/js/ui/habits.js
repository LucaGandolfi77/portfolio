/* Habits UI — personal habit tracker */
(function(){
  var PRESETS={
    sprout:[
      {name:'Read for 15 min',emoji:'📖'},
      {name:'Help at home',emoji:'🏠'},
      {name:'Say thank you',emoji:'🙏'}
    ],
    explorer:[
      {name:'Read for 20 min',emoji:'📖'},
      {name:'Move your body',emoji:'🏃'},
      {name:'No screens before bed',emoji:'📵'}
    ],
    teen:[
      {name:'Read or study 30 min',emoji:'📚'},
      {name:'Exercise',emoji:'💪'},
      {name:'No phone an hour before bed',emoji:'📵'},
      {name:'Write one thing you learned',emoji:'✍️'}
    ],
    young_adult:[
      {name:'Exercise',emoji:'💪'},
      {name:'Read 20 min',emoji:'📖'},
      {name:'No phone before bed',emoji:'📵'},
      {name:'Write one thing you learned',emoji:'✍️'}
    ],
    adult:[
      {name:'Exercise',emoji:'💪'},
      {name:'Read 20 min',emoji:'📖'},
      {name:'No phone 1hr before bed',emoji:'📵'},
      {name:'Quality time with family',emoji:'👨‍👩‍👧'},
      {name:'Review finances',emoji:'💰'}
    ],
    sage:[
      {name:'Walk 30 min',emoji:'🚶'},
      {name:'Read or learn',emoji:'📖'},
      {name:'Connect with someone',emoji:'💬'},
      {name:'Stretch or move',emoji:'🧘'}
    ],
    elder:[
      {name:'Walk 20 min',emoji:'🚶'},
      {name:'Read or listen',emoji:'📖'},
      {name:'Call a friend',emoji:'📞'},
      {name:'Stretch gently',emoji:'🧘'}
    ]
  };
  function getToday(){return new Date().toISOString().slice(0,10);}
  function getWeekDates(){
    var d=[];
    var now=new Date();
    for(var i=6;i>=0;i--){
      var dt=new Date(now-i*86400000);
      d.push(dt.toISOString().slice(0,10));
    }
    return d;
  }
  function ensureHabits(state){
    if(!state.habits) state.habits=[];
  }
  function getStreak(habit){
    var days=habit.days||{};
    var streak=0;
    var now=new Date();
    for(var i=0;i<365;i++){
      var dt=new Date(now-i*86400000);
      var key=dt.toISOString().slice(0,10);
      if(days[key]) streak++;
      else if(i>0) break;
    }
    return streak;
  }
  function render(){
    var state=window.App.getState();
    ensureHabits(state);
    var habits=state.habits;
    var presets=PRESETS[state.profile.stageId]||PRESETS.adult;
    var weekDates=getWeekDates();
    var today=getToday();
    document.getElementById('habits-content').innerHTML=`
      <div style="text-align:center;margin-bottom:20px">
        <div style="font-size:2.5rem;margin-bottom:6px">🔥</div>
        <h3>Habit Tracker</h3>
        <p style="font-size:.85rem;color:var(--ink3)">${habits.length}/5 habits · ${habits.length?habits.reduce(function(a,h){return a+(daysBetween(h,today)?1:0);},0):0} done today</p>
      </div>
      ${habits.length?`
        <div style="margin-bottom:20px">
          <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px;margin-bottom:8px">
            ${weekDates.map(function(d){
              var isToday=d===today;
              var dayName=new Date(d+'T12:00:00').toLocaleDateString('en',{weekday:'short'});
              return '<div style="text-align:center;font-size:.6rem;color:'+(isToday?'var(--gold)':'var(--ink3)')+'">'+dayName+'</div>';
            }).join('')}
          </div>
          ${habits.map(function(h){
            var streak=getStreak(h);
            return '<div style="margin-bottom:12px">'+
              '<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">'+
                '<span style="font-size:1.2rem">'+h.emoji+'</span>'+
                '<span style="flex:1;font-weight:600;font-size:.85rem">'+h.name+'</span>'+
                (streak>0?'<span class="chip chip-gold" style="font-size:.7rem">🔥 '+streak+'</span>':'')+
                '<button onclick="HabitsUI.remove(\''+h.id+'\')" style="font-size:.7rem;color:var(--ink3)">✕</button>'+
              '</div>'+
              '<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px">'+
                weekDates.map(function(d){
                  var done=h.days&&h.days[d];
                  var isToday=d===today;
                  return '<button style="height:32px;border-radius:4px;font-size:.8rem;border:1px solid '+(done?'var(--gold)':'var(--border)')+';background:'+(done?'var(--gold-light)':'var(--paper)')+';color:'+(done?'var(--gold2)':'var(--ink3)')+';'+(isToday?'border-width:2px':'')+'" '+(isToday?'onclick="HabitsUI.toggle(\''+h.id+'\')"':'disabled')+'>'+
                    (done?'✓':(isToday?'+':'·'))+
                  '</button>';
                }).join('')+
              '</div>'+
            '</div>';
          }).join('')}
        </div>
      `:`
        <div class="card" style="text-align:center;padding:30px;margin-bottom:16px">
          <div style="font-size:2rem;margin-bottom:8px">🌟</div>
          <p style="color:var(--ink3)">No habits yet. Pick one below to start!</p>
        </div>
      `}
      ${habits.length<5?`
        <h4 style="margin-bottom:10px;font-size:.9rem;color:var(--gold2)">Add a Habit</h4>
        <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:16px">
          ${presets.filter(function(p){return !habits.some(function(h){return h.name===p.name});}).map(function(p){
            return '<button class="card" style="display:flex;align-items:center;gap:10px;padding:12px" onclick="HabitsUI.add(\''+p.name.replace(/'/g,'\\'')+'\',\''+p.emoji+'\')">'+
              '<span style="font-size:1.2rem">'+p.emoji+'</span>'+
              '<span style="font-weight:500;font-size:.85rem">'+p.name+'</span>'+
              '<span style="margin-left:auto;font-size:.8rem;color:var(--gold)">+ Add</span>'+
            '</button>';
          }).join('')}
          <div style="display:flex;gap:8px;margin-top:4px">
            <input id="habit-custom-name" type="text" placeholder="Custom habit..." style="flex:1;padding:10px;border:2px solid var(--border);border-radius:var(--radius-sm);font-family:var(--font-sans);font-size:.85rem">
            <button class="btn btn-primary btn-sm" onclick="HabitsUI.addCustom()">Add</button>
          </div>
        </div>
      `:''}
    `;
  }
  function daysBetween(habit,date){
    return habit.days&&habit.days[date];
  }
  function toggle(habitId){
    var state=window.App.getState();
    ensureHabits(state);
    var h=state.habits.find(function(x){return x.id===habitId;});
    if(!h) return;
    var today=getToday();
    if(!h.days) h.days={};
    if(h.days[today]){
      delete h.days[today];
    } else {
      h.days[today]=true;
      window.Progress.addXP(state,2);
    }
    window.App.setState(state);
    render();
  }
  function add(name,emoji){
    var state=window.App.getState();
    ensureHabits(state);
    if(state.habits.length>=5){alert('Max 5 habits!');return;}
    if(state.habits.some(function(h){return h.name===name;})){alert('Already tracking this!');return;}
    state.habits.push({id:'h'+Date.now(),name:name,emoji:emoji,created:getToday(),days:{}});
    window.App.setState(state);
    render();
  }
  function addCustom(){
    var input=document.getElementById('habit-custom-name');
    if(!input||!input.value.trim()) return;
    add(input.value.trim(),'⭐');
    input.value='';
  }
  function remove(habitId){
    var state=window.App.getState();
    ensureHabits(state);
    state.habits=state.habits.filter(function(h){return h.id!==habitId;});
    window.App.setState(state);
    render();
  }
  window.HabitsUI={render:render,toggle:toggle,add:add,addCustom:addCustom,remove:remove};
})();
