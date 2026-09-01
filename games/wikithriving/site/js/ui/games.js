/* Games UI — Playground mini-games */
(function(){
  var currentGame=null;
  var gameState=null;
  function render(){
    if(currentGame) renderGame();
    else renderPicker();
  }
  function renderPicker(){
    var games=[
      {id:'budget',emoji:'💰',name:'Budget Sandbox',desc:'Allocate your monthly income',stage:'young_adult'},
      {id:'dojo',emoji:'🗣️',name:'Conversation Dojo',desc:'Practice real conversations',stage:'teen'},
      {id:'bias',emoji:'🧩',name:'Bias Buster',desc:'Spot the thinking trap',stage:'explorer'},
      {id:'news',emoji:'🔍',name:'News Detective',desc:'Real or fake?',stage:'teen'},
      {id:'emotion',emoji:'🙂',name:'Emotion Reader',desc:'How are they feeling?',stage:'sprout'}
    ];
    var STAGES=['sprout','explorer','teen','young_adult','adult','sage','elder'];
    var state=window.App.getState();
    var userStageIdx=STAGES.indexOf(state.profile.stageId);
    document.getElementById('games-content').innerHTML=`
      <div style="text-align:center;margin-bottom:20px">
        <div style="font-size:2.5rem;margin-bottom:6px">🎮</div>
        <h3>Playground</h3>
        <p style="font-size:.85rem;color:var(--ink3)">Interactive life-skill games</p>
      </div>
      <div style="display:flex;flex-direction:column;gap:12px">
        ${games.map(function(g){
          var stageIdx=STAGES.indexOf(g.stage);
          var unlocked=stageIdx<=userStageIdx;
          return '<button class="card" style="text-align:left;padding:16px;'+(unlocked?'':'opacity:.4')+'" '+(unlocked?`onclick="GamesUI.start('${g.id}')"`:'')+'>"+
            '<div style="display:flex;align-items:center;gap:12px">'+
              '<span style="font-size:1.8rem">'+g.emoji+'</span>'+
              '<div style="flex:1"><div style="font-weight:600">'+g.name+'</div>'+
              '<div style="font-size:.8rem;color:var(--ink3)">'+g.desc+'</div></div>'+
              (unlocked?'<span style="font-size:.7rem;color:var(--gold)">Play →</span>':'<span style="font-size:.7rem;color:var(--ink3)">🔒 '+g.stage+'</span>')+
            '</div>'+
          '</button>';
        }).join('')}
      </div>
    `;
  }
  function start(gameId){
    currentGame=gameId;
    gameState={score:0,total:0,step:0,answers:[]};
    render();
  }
  function renderGame(){
    if(!window.GAMES_DATA||!window.GAMES_DATA[currentGame]){currentGame=null;renderPicker();return;}
    var data=window.GAMES_DATA[currentGame];
    if(currentGame==='budget') renderBudget(data);
    else if(currentGame==='dojo') renderDojo(data);
    else if(currentGame==='bias') renderBias(data);
    else if(currentGame==='news') renderNews(data);
    else if(currentGame==='emotion') renderEmotion(data);
  }
  function renderBudget(data){
    var scenario=data.salaries[gameState.step%data.salaries.length];
    var allocations=gameState.allocations||{needs:0,wants:0,savings:0,debt:0};
    document.getElementById('games-content').innerHTML=`
      <button onclick="GamesUI.quit()" style="align-self:flex-start;margin-bottom:12px;font-size:.9rem;color:var(--ink2)">← Quit</button>
      <div class="card" style="text-align:center;margin-bottom:16px">
        <div style="font-size:.7rem;color:var(--gold2);text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">Scenario ${gameState.step+1}</div>
        <div style="font-size:1.5rem;font-weight:700;color:var(--gold);margin-bottom:4px">${scenario.currency}${scenario.amount.toLocaleString()}/mo</div>
        <p style="font-size:.85rem;color:var(--ink2)">${scenario.scenario}</p>
      </div>
      <div class="card">
        ${data.categories.map(function(c){
          var pct=allocations[c.id]||0;
          return '<div style="margin-bottom:12px">'+
            '<div style="display:flex;justify-content:space-between;margin-bottom:4px">'+
              '<span style="font-size:.85rem">'+c.emoji+' '+c.name+'</span>'+
              '<span style="font-size:.85rem;font-weight:600">'+pct+'%</span>'+
            '</div>'+
            '<input type="range" min="0" max="80" value="'+pct+'" style="width:100%" '+
              'oninput="GamesUI.allocate(\''+c.id+'\',this.value)">'+
          '</div>';
        }).join('')}
        <div style="text-align:center;margin-top:8px;font-size:.85rem;color:var(--ink3)">Total: ${Object.values(allocations).reduce(function(a,b){return parseInt(a)+parseInt(b);},0)}%</div>
      </div>
      <button class="btn btn-primary" style="width:100%;margin-top:16px" onclick="GamesUI.submitBudget()">Submit Allocation</button>
    `;
  }
  function allocate(cat,val){
    if(!gameState.allocations) gameState.allocations={needs:0,wants:0,savings:0,debt:0};
    gameState.allocations[cat]=parseInt(val);
    renderBudget(window.GAMES_DATA.budget);
  }
  function submitBudget(){
    if(!gameState.allocations) return;
    var alloc=gameState.allocations;
    var total=Object.values(alloc).reduce(function(a,b){return parseInt(a)+parseInt(b);},0);
    if(total!==100){alert('Allocations must total 100%!');return;}
    var data=window.GAMES_DATA.budget;
    var score=0;
    if(alloc.needs>=data.rules.minNeeds) score++;
    if(alloc.savings>=data.rules.minSavings) score++;
    if(alloc.wants<=data.rules.maxWants) score++;
    var feedback=data.feedback(alloc);
    gameState.score+=score;
    gameState.total+=3;
    gameState.step++;
    alert('Score: '+score+'/3\n\n'+feedback);
    if(gameState.step>=5){finishGame();return;}
    gameState.allocations={needs:0,wants:0,savings:0,debt:0};
    render();
  }
  function renderDojo(data){
    var scenario=data.scenarios[gameState.step%data.scenarios.length];
    var nodeIdx=gameState.nodeIdx||0;
    if(nodeIdx>=scenario.nodes.length){gameState.step++;gameState.nodeIdx=0;if(gameState.step>=data.scenarios.length){finishGame();return;}render();return;}
    var node=scenario.nodes[nodeIdx];
    document.getElementById('games-content').innerHTML=`
      <button onclick="GamesUI.quit()" style="align-self:flex-start;margin-bottom:12px;font-size:.9rem;color:var(--ink2)">← Quit</button>
      <div class="card" style="margin-bottom:16px">
        <div style="font-size:.7rem;color:var(--gold2);text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">${scenario.situation}</div>
        <p style="font-size:.85rem;color:var(--ink3);margin-bottom:8px">${scenario.context}</p>
      </div>
      <div class="card" style="margin-bottom:16px;padding:16px;background:var(--cream)">
        <div style="font-size:.7rem;color:var(--ink3);text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">They say:</div>
        <p style="font-style:italic;color:var(--ink2)">${node.text}</p>
      </div>
      <div style="display:flex;flex-direction:column;gap:8px">
        ${node.options.map(function(opt,i){
          return '<button class="card" style="text-align:left;padding:14px" onclick="GamesUI.chooseDojo('+i+')">'+
            '<p style="font-weight:500;font-size:.9rem">'+opt.text+'</p>'+
          '</button>';
        }).join('')}
      </div>
    `;
  }
  function chooseDojo(idx){
    var data=window.GAMES_DATA.dojo;
    var scenario=data.scenarios[gameState.step%data.scenarios.length];
    var node=scenario.nodes[gameState.nodeIdx||0];
    var opt=node.options[idx];
    gameState.score+=opt.empathy+opt.assertiveness;
    gameState.total+=20;
    gameState.answers.push({empathy:opt.empathy,assertiveness:opt.assertiveness});
    alert('Empathy: '+opt.empathy+'/10\nAssertiveness: '+opt.assertiveness+'/10\n\n'+opt.response);
    gameState.nodeIdx=(gameState.nodeIdx||0)+1;
    render();
  }
  function renderBias(data){
    var items=data.fallacies;
    if(gameState.step>=items.length){finishGame();return;}
    var item=items[gameState.step];
    document.getElementById('games-content').innerHTML=`
      <button onclick="GamesUI.quit()" style="align-self:flex-start;margin-bottom:12px;font-size:.9rem;color:var(--ink2)">← Quit</button>
      <div style="font-size:.7rem;color:var(--ink3);text-align:center;margin-bottom:12px">Question ${gameState.step+1} / ${items.length}</div>
      <div class="card" style="margin-bottom:16px;padding:16px;background:var(--cream)">
        <p style="font-style:italic;color:var(--ink2)">"${item.text}"</p>
      </div>
      <div style="display:flex;flex-direction:column;gap:8px">
        ${item.options.map(function(opt,i){
          return '<button class="card" style="text-align:left;padding:14px" onclick="GamesUI.answerBias('+i+','+item.correct+')">'+
            '<p style="font-weight:500;font-size:.9rem">'+opt+'</p>'+
          '</button>';
        }).join('')}
      </div>
    `;
  }
  function answerBias(chosen,correct){
    var items=window.GAMES_DATA.bias.fallacies;
    var item=items[gameState.step];
    var isCorrect=chosen===correct;
    if(isCorrect) gameState.score++;
    gameState.total++;
    gameState.step++;
    alert((isCorrect?'✅ Correct!':'❌ Wrong!')+'\n\n'+item.explanation);
    render();
  }
  function renderNews(data){
    var items=data.headlines;
    if(gameState.step>=items.length){finishGame();return;}
    var item=items[gameState.step];
    document.getElementById('games-content').innerHTML=`
      <button onclick="GamesUI.quit()" style="align-self:flex-start;margin-bottom:12px;font-size:.9rem;color:var(--ink2)">← Quit</button>
      <div style="font-size:.7rem;color:var(--ink3);text-align:center;margin-bottom:12px">Headline ${gameState.step+1} / ${items.length}</div>
      <div class="card" style="margin-bottom:16px;padding:16px;background:var(--cream)">
        <p style="font-weight:600;color:var(--ink)">"${item.text}"</p>
        <p style="font-size:.75rem;color:var(--ink3);margin-top:8px">Source: ${item.source}</p>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <button class="card" style="padding:16px;text-align:center" onclick="GamesUI.answerNews(true,${item.real})">
          <div style="font-size:1.5rem;margin-bottom:4px">📰</div>
          <div style="font-weight:600">Real</div>
        </button>
        <button class="card" style="padding:16px;text-align:center" onclick="GamesUI.answerNews(false,${item.real})">
          <div style="font-size:1.5rem;margin-bottom:4px">🚫</div>
          <div style="font-weight:600">Fake</div>
        </button>
      </div>
    `;
  }
  function answerNews(chosen,correct){
    var items=window.GAMES_DATA.news.headlines;
    var item=items[gameState.step];
    var isCorrect=(chosen===correct);
    if(isCorrect) gameState.score++;
    gameState.total++;
    gameState.step++;
    alert((isCorrect?'✅ Correct!':'❌ Wrong!')+'\n\n'+item.explanation);
    render();
  }
  function renderEmotion(data){
    var emotions=data.emotions;
    if(gameState.step>=emotions.length){finishGame();return;}
    var emo=emotions[gameState.step];
    var scenario=emo.scenarios[Math.floor(Math.random()*emo.scenarios.length)];
    document.getElementById('games-content').innerHTML=`
      <button onclick="GamesUI.quit()" style="align-self:flex-start;margin-bottom:12px;font-size:.9rem;color:var(--ink2)">← Quit</button>
      <div style="font-size:.7rem;color:var(--ink3);text-align:center;margin-bottom:12px">How are they feeling? ${gameState.step+1}/${emotions.length}</div>
      <div class="card" style="text-align:center;margin-bottom:16px;padding:24px">
        <p style="font-size:1rem;color:var(--ink2)">${scenario}</p>
      </div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">
        ${emotions.map(function(e,i){
          return '<button class="card" style="padding:12px;text-align:center" onclick="GamesUI.answerEmotion('+i+','+emotions.indexOf(emo)+')">'+
            '<div style="font-size:1.5rem">'+e.emoji+'</div>'+
            '<div style="font-size:.7rem;font-weight:600;margin-top:2px">'+e.name+'</div>'+
          '</button>';
        }).join('')}
      </div>
    `;
  }
  function answerEmotion(chosen,correct){
    var isCorrect=(chosen===correct);
    if(isCorrect) gameState.score++;
    gameState.total++;
    gameState.step++;
    render();
  }
  function finishGame(){
    var state=window.App.getState();
    var xp=gameState.score*5;
    window.Progress.addXP(state,xp);
    window.Economy.addPearls(state,gameState.score);
    window.App.setState(state);
    var pct=gameState.total?Math.round(100*gameState.score/gameState.total):0;
    document.getElementById('games-content').innerHTML=`
      <div style="text-align:center;padding:40px 20px">
        <div style="font-size:3rem;margin-bottom:12px">${pct>=80?'🏆':pct>=50?'👏':'💪'}</div>
        <h3>Game Complete!</h3>
        <p style="font-size:1.5rem;font-weight:700;color:var(--gold);margin:12px 0">${gameState.score} / ${gameState.total}</p>
        <p style="color:var(--ink3);margin-bottom:20px">+${xp} XP · +${gameState.score} 🦪</p>
        <button class="btn btn-primary" style="width:100%;margin-bottom:8px" onclick="GamesUI.quit()">Back to Playground</button>
      </div>
    `;
  }
  function quit(){
    currentGame=null;
    gameState=null;
    render();
  }
  window.GamesUI={
    render:render,start:start,quit:quit,allocate:allocate,
    submitBudget:submitBudget,chooseDojo:chooseDojo,
    answerBias:answerBias,answerNews:answerNews,answerEmotion:answerEmotion
  };
})();
