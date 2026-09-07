/* Games UI — Playground mini-games */
(function(){
  var _alert=function(msg){window.Toast.show(msg.toString().replace(/\\n/g,' ').substring(0,120));};
  var currentGame=null;
  var gameState=null;
  function render(){
    if(currentGame) renderGame();
    else renderPicker();
  }
  function renderPicker(){
    var games=[
      {id:'budget',emoji:'\uD83D\uDCB0',name:'Budget Sandbox',desc:'Allocate your monthly income',stage:'young_adult'},
      {id:'dojo',emoji:'\uD83D\uDDE3\uFE0F',name:'Conversation Dojo',desc:'Practice real conversations',stage:'teen'},
      {id:'bias',emoji:'\uD83E\uDDE9',name:'Bias Buster',desc:'Spot the thinking trap',stage:'explorer'},
      {id:'news',emoji:'\uD83D\uDD0D',name:'News Detective',desc:'Real or fake?',stage:'teen'},
      {id:'emotion',emoji:'\uD83D\uDE0A',name:'Emotion Reader',desc:'How are they feeling?',stage:'sprout'},
      {id:'integrity',emoji:'\uD83C\uDFAF',name:'Integrity Challenge',desc:'What would you do?',stage:'teen'},
      {id:'memory',emoji:'\uD83E\uDDE0',name:'Memory Match',desc:'Match study concepts',stage:'explorer'},
      {id:'speedmath',emoji:'\u26A1',name:'Speed Math',desc:'How fast can you calculate?',stage:'teen'},
      {id:'workplace',emoji:'\uD83D\uDCBC',name:'Workplace Scenarios',desc:'Navigate office situations',stage:'young_adult'},
      {id:'kitchen',emoji:'\uD83C\uDF73',name:'Kitchen Sequencing',desc:'Put cooking steps in order',stage:'explorer'},
      {id:'valuesort',emoji:'\uD83C\uDFAF',name:'Values Sort',desc:'Sort what matters',stage:'teen'},
      {id:'artmatch',emoji:'\uD83C\uDFA8',name:'Art Match',desc:'Match artworks to movements',stage:'explorer'},
      {id:'experiment',emoji:'\uD83D\uDD2C',name:'Experiment Lab',desc:'Think like a scientist',stage:'teen'},
      {id:'genre',emoji:'\uD83C\uDFB5',name:'Genre Mix',desc:'Match sounds to genres',stage:'explorer'},
      {id:'scenedecoder',emoji:'\uD83C\uDFAC',name:'Scene Decoder',desc:'Read the hidden language of film',stage:'teen'},
      {id:'colorlab',emoji:'\uD83C\uDFA8',name:'Color Lab',desc:'Master the color wheel',stage:'explorer'},
      {id:'poetrymatch',emoji:'\uD83D\uDCDD',name:'Poetry Match',desc:'Match lines to meaning',stage:'teen'},
      {id:'culturequest',emoji:'\uD83C\uDF0D',name:'Culture Quest',desc:'Match customs to countries',stage:'young_adult'}
    ];
    var STAGES=['sprout','explorer','teen','young_adult','adult','sage','elder'];
    var state=window.App.getState();
    var userStageIdx=STAGES.indexOf(state.profile.stageId);
    var html='<div style="text-align:center;margin-bottom:20px">';
    html+='<div style="font-size:2.5rem;margin-bottom:6px">\uD83C\uDFAE</div>';
    html+='<h3>Playground</h3>';
    html+='<p style="font-size:.85rem;color:var(--ink3)">Interactive life-skill games</p></div>';
    html+='<div style="display:flex;flex-direction:column;gap:12px">';
    for(var i=0;i<games.length;i++){
      var g=games[i];
      var stageIdx=STAGES.indexOf(g.stage);
      var unlocked=stageIdx<=userStageIdx;
      var onclick=unlocked?" onclick=\"GamesUI.start('"+g.id+"')\"":"";
      var opacity=unlocked?'':'opacity:.4';
      var badge=unlocked?'<span style="font-size:.7rem;color:var(--gold)">Play \u2192</span>':'<span style="font-size:.7rem;color:var(--ink3)">\uD83D\uDD12 '+g.stage+'</span>';
      html+='<button class="card" style="text-align:left;padding:16px;'+opacity+'"'+onclick+'>';
      html+='<div style="display:flex;align-items:center;gap:12px">';
      html+='<span style="font-size:1.8rem">'+g.emoji+'</span>';
      html+='<div style="flex:1"><div style="font-weight:600">'+g.name+'</div>';
      html+='<div style="font-size:.8rem;color:var(--ink3)">'+g.desc+'</div></div>';
      html+=badge+'</div></button>';
    }
    html+='</div>';
    document.getElementById('games-content').innerHTML=html;
  }
  function start(gameId){
    currentGame=gameId;
    gameState={score:0,total:0,step:0,answers:[],matched:[],selected:[],timer:null,timeLeft:0};
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
    else if(currentGame==='integrity') renderIntegrity(data);
    else if(currentGame==='memory') renderMemory(data);
    else if(currentGame==='speedmath') renderSpeedMath(data);
    else if(currentGame==='workplace') renderWorkplace(data);
    else if(currentGame==='kitchen') renderKitchen(data);
    else if(currentGame==='valuesort') renderValueSort(data);
    else if(currentGame==='artmatch') renderArtMatch(data);
    else if(currentGame==='experiment') renderExperiment(data);
    else if(currentGame==='genre') renderGenre(data);
    else if(currentGame==='scenedecoder') renderSceneDecoder(data);
    else if(currentGame==='colorlab') renderColorLab(data);
    else if(currentGame==='poetrymatch') renderPoetryMatch(data);
    else if(currentGame==='culturequest') renderCultureQuest(data);
  }

  // ═══════════════════════════════════════
  //  1. Budget Sandbox
  // ═══════════════════════════════════════
  function renderBudget(data){
    var scenario=data.salaries[gameState.step%data.salaries.length];
    var allocations=gameState.allocations||{needs:0,wants:0,savings:0,debt:0};
    document.getElementById('games-content').innerHTML='\
      <button onclick="GamesUI.quit()" style="align-self:flex-start;margin-bottom:12px;font-size:.9rem;color:var(--ink2)">\u2190 Quit</button>\
      <div class="card" style="text-align:center;margin-bottom:16px">\
        <div style="font-size:.7rem;color:var(--gold2);text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">Scenario '+(gameState.step+1)+'</div>\
        <div style="font-size:1.5rem;font-weight:700;color:var(--gold);margin-bottom:4px">'+scenario.currency+scenario.amount.toLocaleString()+'/mo</div>\
        <p style="font-size:.85rem;color:var(--ink2)">'+scenario.scenario+'</p>\
      </div>\
      <div class="card">\
        '+data.categories.map(function(c){
          var pct=allocations[c.id]||0;
          return '<div style="margin-bottom:12px">'+
            '<div style="display:flex;justify-content:space-between;margin-bottom:4px">'+
              '<span style="font-size:.85rem">'+c.emoji+' '+c.name+'</span>'+
              '<span style="font-size:.85rem;font-weight:600">'+pct+'%</span>'+
            '</div>'+
            '<input type="range" min="0" max="80" value="'+pct+'" style="width:100%" '+
              'oninput="GamesUI.allocate(\''+c.id+'\',this.value)">'+
          '</div>';
        }).join('')+
        '<div style="text-align:center;margin-top:8px;font-size:.85rem;color:var(--ink3)">Total: '+Object.values(allocations).reduce(function(a,b){return parseInt(a)+parseInt(b);},0)+'%</div>'+
      '</div>\
      <button class="btn btn-primary" style="width:100%;margin-top:16px" onclick="GamesUI.submitBudget()">Submit Allocation</button>';
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
    if(total!==100){_alert('Allocations must total 100%!');return;}
    var data=window.GAMES_DATA.budget;
    var score=0;
    if(alloc.needs>=data.rules.minNeeds) score++;
    if(alloc.savings>=data.rules.minSavings) score++;
    if(alloc.wants<=data.rules.maxWants) score++;
    var feedback=data.feedback(alloc);
    gameState.score+=score;
    gameState.total+=3;
    gameState.step++;
    _alert('Score: '+score+'/3 — '+feedback.substring(0,60));
    if(gameState.step>=5){finishGame();return;}
    gameState.allocations={needs:0,wants:0,savings:0,debt:0};
    render();
  }

  // ═══════════════════════════════════════
  //  2. Conversation Dojo
  // ═══════════════════════════════════════
  function renderDojo(data){
    var scenario=data.scenarios[gameState.step%data.scenarios.length];
    var nodeIdx=gameState.nodeIdx||0;
    if(nodeIdx>=scenario.nodes.length){gameState.step++;gameState.nodeIdx=0;if(gameState.step>=data.scenarios.length){finishGame();return;}render();return;}
    var node=scenario.nodes[nodeIdx];
    document.getElementById('games-content').innerHTML='\
      <button onclick="GamesUI.quit()" style="align-self:flex-start;margin-bottom:12px;font-size:.9rem;color:var(--ink2)">\u2190 Quit</button>\
      <div class="card" style="margin-bottom:16px">\
        <div style="font-size:.7rem;color:var(--gold2);text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">'+scenario.situation+'</div>\
        <p style="font-size:.85rem;color:var(--ink3);margin-bottom:8px">'+scenario.context+'</p>\
      </div>\
      <div class="card" style="margin-bottom:16px;padding:16px;background:var(--cream)">\
        <div style="font-size:.7rem;color:var(--ink3);text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">They say:</div>\
        <p style="font-style:italic;color:var(--ink2)">'+node.text+'</p>\
      </div>\
      <div style="display:flex;flex-direction:column;gap:8px">\
        '+node.options.map(function(opt,i){
          return '<button class="card" style="text-align:left;padding:14px" onclick="GamesUI.chooseDojo('+i+')">'+
            '<p style="font-weight:500;font-size:.9rem">'+opt.text+'</p>'+
          '</button>';
        }).join('')+
      '</div>';
  }
  function chooseDojo(idx){
    var data=window.GAMES_DATA.dojo;
    var scenario=data.scenarios[gameState.step%data.scenarios.length];
    var node=scenario.nodes[gameState.nodeIdx||0];
    var opt=node.options[idx];
    gameState.score+=opt.empathy+opt.assertiveness;
    gameState.total+=20;
    gameState.answers.push({empathy:opt.empathy,assertiveness:opt.assertiveness});
    _alert('Empathy: '+opt.empathy+'/10 · Assertiveness: '+opt.assertiveness+'/10 — '+opt.response.substring(0,60));
    gameState.nodeIdx=(gameState.nodeIdx||0)+1;
    render();
  }

  // ═══════════════════════════════════════
  //  3. Bias Buster
  // ═══════════════════════════════════════
  function renderBias(data){
    var items=data.fallacies;
    if(gameState.step>=items.length){finishGame();return;}
    var item=items[gameState.step];
    document.getElementById('games-content').innerHTML='\
      <button onclick="GamesUI.quit()" style="align-self:flex-start;margin-bottom:12px;font-size:.9rem;color:var(--ink2)">\u2190 Quit</button>\
      <div style="font-size:.7rem;color:var(--ink3);text-align:center;margin-bottom:12px">Question '+(gameState.step+1)+' / '+items.length+'</div>\
      <div class="card" style="margin-bottom:16px;padding:16px;background:var(--cream)">\
        <p style="font-style:italic;color:var(--ink2)">"'+item.text+'"</p>\
      </div>\
      <div style="display:flex;flex-direction:column;gap:8px">\
        '+item.options.map(function(opt,i){
          return '<button class="card" style="text-align:left;padding:14px" onclick="GamesUI.answerBias('+i+','+item.correct+')">'+
            '<p style="font-weight:500;font-size:.9rem">'+opt+'</p>'+
          '</button>';
        }).join('')+
      '</div>';
  }
  function answerBias(chosen,correct){
    var items=window.GAMES_DATA.bias.fallacies;
    var item=items[gameState.step];
    var isCorrect=chosen===correct;
    if(isCorrect) gameState.score++;
    gameState.total++;
    gameState.step++;
    _alert((isCorrect?'\u2705 Correct!':'\u274C Wrong!')+'\n\n'+item.explanation);
    render();
  }

  // ═══════════════════════════════════════
  //  4. News Detective
  // ═══════════════════════════════════════
  function renderNews(data){
    var items=data.headlines;
    if(gameState.step>=items.length){finishGame();return;}
    var item=items[gameState.step];
    document.getElementById('games-content').innerHTML='\
      <button onclick="GamesUI.quit()" style="align-self:flex-start;margin-bottom:12px;font-size:.9rem;color:var(--ink2)">\u2190 Quit</button>\
      <div style="font-size:.7rem;color:var(--ink3);text-align:center;margin-bottom:12px">Headline '+(gameState.step+1)+' / '+items.length+'</div>\
      <div class="card" style="margin-bottom:16px;padding:16px;background:var(--cream)">\
        <p style="font-weight:600;color:var(--ink)">"'+item.text+'"</p>\
        <p style="font-size:.75rem;color:var(--ink3);margin-top:8px">Source: '+item.source+'</p>\
      </div>\
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">\
        <button class="card" style="padding:16px;text-align:center" onclick="GamesUI.answerNews(true,'+item.real+')">\
          <div style="font-size:1.5rem;margin-bottom:4px">\uD83D\uDCF0</div>\
          <div style="font-weight:600">Real</div>\
        </button>\
        <button class="card" style="padding:16px;text-align:center" onclick="GamesUI.answerNews(false,'+item.real+')">\
          <div style="font-size:1.5rem;margin-bottom:4px">\uD83D\uDEAB</div>\
          <div style="font-weight:600">Fake</div>\
        </button>\
      </div>';
  }
  function answerNews(chosen,correct){
    var items=window.GAMES_DATA.news.headlines;
    var item=items[gameState.step];
    var isCorrect=(chosen===correct);
    if(isCorrect) gameState.score++;
    gameState.total++;
    gameState.step++;
    _alert((isCorrect?'\u2705 Correct!':'\u274C Wrong!')+'\n\n'+item.explanation);
    render();
  }

  // ═══════════════════════════════════════
  //  5. Emotion Reader
  // ═══════════════════════════════════════
  function renderEmotion(data){
    var emotions=data.emotions;
    if(gameState.step>=emotions.length){finishGame();return;}
    var emo=emotions[gameState.step];
    var scenario=emo.scenarios[Math.floor(Math.random()*emo.scenarios.length)];
    document.getElementById('games-content').innerHTML='\
      <button onclick="GamesUI.quit()" style="align-self:flex-start;margin-bottom:12px;font-size:.9rem;color:var(--ink2)">\u2190 Quit</button>\
      <div style="font-size:.7rem;color:var(--ink3);text-align:center;margin-bottom:12px">How are they feeling? '+(gameState.step+1)+'/'+emotions.length+'</div>\
      <div class="card" style="text-align:center;margin-bottom:16px;padding:24px">\
        <p style="font-size:1rem;color:var(--ink2)">'+scenario+'</p>\
      </div>\
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">\
        '+emotions.map(function(e,i){
          return '<button class="card" style="padding:12px;text-align:center" onclick="GamesUI.answerEmotion('+i+','+emotions.indexOf(emo)+')">'+
            '<div style="font-size:1.5rem">'+e.emoji+'</div>'+
            '<div style="font-size:.7rem;font-weight:600;margin-top:2px">'+e.name+'</div>'+
          '</button>';
        }).join('')+
      '</div>';
  }
  function answerEmotion(chosen,correct){
    var isCorrect=(chosen===correct);
    if(isCorrect) gameState.score++;
    gameState.total++;
    gameState.step++;
    render();
  }

  // ═══════════════════════════════════════
  //  6. Integrity Challenge
  // ═══════════════════════════════════════
  function renderIntegrity(data){
    var scenarios=data.scenarios;
    if(gameState.step>=scenarios.length){finishGame();return;}
    var sc=scenarios[gameState.step];
    document.getElementById('games-content').innerHTML='\
      <button onclick="GamesUI.quit()" style="align-self:flex-start;margin-bottom:12px;font-size:.9rem;color:var(--ink2)">\u2190 Quit</button>\
      <div style="font-size:.7rem;color:var(--ink3);text-align:center;margin-bottom:12px">Scenario '+(gameState.step+1)+' / '+scenarios.length+'</div>\
      <div class="card" style="margin-bottom:16px">\
        <div style="font-size:.7rem;color:var(--gold2);text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">'+sc.situation+'</div>\
        <p style="font-size:.85rem;color:var(--ink3)">'+sc.context+'</p>\
      </div>\
      <div style="display:flex;flex-direction:column;gap:8px">\
        '+sc.options.map(function(opt,i){
          return '<button class="card" style="text-align:left;padding:14px" onclick="GamesUI.answerIntegrity('+i+')">'+
            '<p style="font-weight:500;font-size:.9rem">'+opt.text+'</p>'+
          '</button>';
        }).join('')+
      '</div>';
  }
  function answerIntegrity(idx){
    var sc=window.GAMES_DATA.integrity.scenarios[gameState.step];
    var opt=sc.options[idx];
    var score=opt.wisdom+opt.empathy;
    gameState.score+=score;
    gameState.total+=20;
    gameState.step++;
    _alert('Wisdom: '+opt.wisdom+'/10\nEmpathy: '+opt.empathy+'/10\n\n'+opt.response);
    render();
  }

  // ═══════════════════════════════════════
  //  7. Memory Match
  // ═══════════════════════════════════════
  function renderMemory(data){
    var pairs=data.pairs;
    if(!gameState.cards){
      var cards=[];
      pairs.forEach(function(p,i){
        cards.push({id:'t'+i,text:p.term,pairId:i,type:'term'});
        cards.push({id:'m'+i,text:p.match,pairId:i,type:'match'});
      });
      for(var i=cards.length-1;i>0;i--){
        var j=Math.floor(Math.random()*(i+1));
        var temp=cards[i];cards[i]=cards[j];cards[j]=temp;
      }
      gameState.cards=cards;
      gameState.flipped=[];
      gameState.matched=[];
      gameState.firstPick=null;
    }
    var cards=gameState.cards;
    var matched=gameState.matched;
    var flipped=gameState.flipped;
    document.getElementById('games-content').innerHTML='\
      <button onclick="GamesUI.quit()" style="align-self:flex-start;margin-bottom:12px;font-size:.9rem;color:var(--ink2)">\u2190 Quit</button>\
      <div style="text-align:center;margin-bottom:16px">\
        <div style="font-size:.7rem;color:var(--ink3)">Matched: '+matched.length+'/'+pairs.length+'</div>\
      </div>\
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px">\
        '+cards.map(function(c,i){
          var isFlipped=flipped.indexOf(i)!==-1||matched.indexOf(c.pairId)!==-1;
          var isMatched=matched.indexOf(c.pairId)!==-1;
          return '<button class="card" style="padding:10px;text-align:center;min-height:70px;display:flex;align-items:center;justify-content:center;'+(isMatched?'background:var(--gold);color:#fff;':'')+'" '+(isFlipped||isMatched?'disabled':'onclick="GamesUI.flipCard('+i+')"')+'>\
            <span style="font-size:.7rem;font-weight:500">'+(isFlipped?c.text:'?')+'</span>\
          </button>';
        }).join('')+
      '</div>';
  }
  function flipCard(idx){
    var flipped=gameState.flipped;
    var cards=gameState.cards;
    if(flipped.length>=2) return;
    flipped.push(idx);
    if(flipped.length===2){
      var c1=cards[flipped[0]], c2=cards[flipped[1]];
      if(c1.pairId===c2.pairId&&c1.type!==c2.type){
        gameState.matched.push(c1.pairId);
        gameState.score++;
        gameState.total++;
        flipped=[];
        if(gameState.matched.length===window.GAMES_DATA.memory.pairs.length){finishGame();return;}
      } else {
        setTimeout(function(){gameState.flipped=[];render();},800);
      }
    }
    render();
  }

  // ═══════════════════════════════════════
  //  8. Speed Math
  // ═══════════════════════════════════════
  function renderSpeedMath(data){
    var questions=data.questions;
    if(gameState.step>=questions.length){finishGame();return;}
    var q=questions[gameState.step];
    document.getElementById('games-content').innerHTML='\
      <button onclick="GamesUI.quit()" style="align-self:flex-start;margin-bottom:12px;font-size:.9rem;color:var(--ink2)">\u2190 Quit</button>\
      <div style="text-align:center;margin-bottom:16px">\
        <div style="font-size:.7rem;color:var(--ink3)">Question '+(gameState.step+1)+' / '+questions.length+'</div>\
        <div id="speedmath-timer" style="font-size:2rem;font-weight:700;color:var(--gold);margin:8px 0">'+gameState.timeLeft+'s</div>\
      </div>\
      <div class="card" style="text-align:center;margin-bottom:16px;padding:20px">\
        <div style="font-size:1.8rem;font-weight:700;color:var(--ink)">'+q.q+'</div>\
      </div>\
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">\
        '+q.options.map(function(opt,i){
          return '<button class="card" style="padding:16px;text-align:center" onclick="GamesUI.answerSpeedMath('+i+','+q.correct+')">'+
            '<div style="font-size:1.2rem;font-weight:600">'+opt+'</div>'+
          '</button>';
        }).join('')+
      '</div>';
    if(!gameState.timerRunning){
      gameState.timeLeft=data.timePerQuestion||10;
      gameState.timerRunning=true;
      gameState.timerInterval=setInterval(function(){
        gameState.timeLeft--;
        var el=document.getElementById('speedmath-timer');
        if(el) el.textContent=gameState.timeLeft+'s';
        if(gameState.timeLeft<=0){
          clearInterval(gameState.timerInterval);
          gameState.timerRunning=false;
          gameState.total++;
          gameState.step++;
          _alert('Time\'s up! The answer was: '+q.options[q.correct]);
          render();
        }
      },1000);
    }
  }
  function answerSpeedMath(chosen,correct){
    if(gameState.timerInterval) clearInterval(gameState.timerInterval);
    gameState.timerRunning=false;
    var isCorrect=chosen===correct;
    if(isCorrect) gameState.score++;
    gameState.total++;
    gameState.step++;
    var q=window.GAMES_DATA.speedmath.questions[gameState.step-1];
    _alert((isCorrect?'\u2705 Correct!':'\u274C Wrong!')+' Answer: '+q.options[correct]);
    render();
  }

  // ═══════════════════════════════════════
  //  9. Workplace Scenarios
  // ═══════════════════════════════════════
  function renderWorkplace(data){
    var scenarios=data.scenarios;
    if(gameState.step>=scenarios.length){finishGame();return;}
    var sc=scenarios[gameState.step];
    document.getElementById('games-content').innerHTML='\
      <button onclick="GamesUI.quit()" style="align-self:flex-start;margin-bottom:12px;font-size:.9rem;color:var(--ink2)">\u2190 Quit</button>\
      <div style="font-size:.7rem;color:var(--ink3);text-align:center;margin-bottom:12px">Scenario '+(gameState.step+1)+' / '+scenarios.length+'</div>\
      <div class="card" style="margin-bottom:16px">\
        <div style="font-size:.7rem;color:var(--gold2);text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">'+sc.situation+'</div>\
        <p style="font-size:.85rem;color:var(--ink3)">'+sc.context+'</p>\
      </div>\
      <div style="display:flex;flex-direction:column;gap:8px">\
        '+sc.options.map(function(opt,i){
          return '<button class="card" style="text-align:left;padding:14px" onclick="GamesUI.answerWorkplace('+i+')">'+
            '<p style="font-weight:500;font-size:.9rem">'+opt.text+'</p>'+
          '</button>';
        }).join('')+
      '</div>';
  }
  function answerWorkplace(idx){
    var sc=window.GAMES_DATA.workplace.scenarios[gameState.step];
    var opt=sc.options[idx];
    var score=opt.wisdom+opt.empathy;
    gameState.score+=score;
    gameState.total+=20;
    gameState.step++;
    _alert('Wisdom: '+opt.wisdom+'/10\nEmpathy: '+opt.empathy+'/10\n\n'+opt.response);
    render();
  }

  // ═══════════════════════════════════════
  //  10. Kitchen Sequencing
  // ═══════════════════════════════════════
  function renderKitchen(data){
    var recipes=data.recipes;
    if(gameState.step>=recipes.length){finishGame();return;}
    var recipe=recipes[gameState.step];
    if(!gameState.shuffledSteps){
      var indices=recipe.steps.map(function(_,i){return i;});
      for(var i=indices.length-1;i>0;i--){
        var j=Math.floor(Math.random()*(i+1));
        var temp=indices[i];indices[i]=indices[j];indices[j]=temp;
      }
      gameState.shuffledSteps=indices;
      gameState.placedSteps=[];
      gameState.currentDrag=null;
    }
    var shuffled=gameState.shuffledSteps;
    var placed=gameState.placedSteps;
    var html='<button onclick="GamesUI.quit()" style="align-self:flex-start;margin-bottom:12px;font-size:.9rem;color:var(--ink2)">\u2190 Quit</button>';
    html+='<div class="card" style="margin-bottom:16px;text-align:center">';
    html+='<div style="font-size:.7rem;color:var(--gold2);text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">'+recipe.name+'</div>';
    html+='<div style="font-size:.85rem;color:var(--ink3)">Drag steps into the correct order ('+placed.length+'/'+recipe.steps.length+')</div></div>';
    html+='<div style="display:flex;gap:12px">';
    html+='<div style="flex:1"><div style="font-size:.7rem;color:var(--ink3);margin-bottom:6px;text-transform:uppercase">Available Steps</div>';
    var remaining=shuffled.filter(function(idx){return placed.indexOf(idx)===-1;});
    for(var r=0;r<remaining.length;r++){
      var idx=remaining[r];
      html+='<button class="card" style="text-align:left;padding:10px;margin-bottom:6px;font-size:.8rem" onclick="GamesUI.placeStep('+idx+')">'+recipe.steps[idx]+'</button>';
    }
    html+='</div><div style="flex:1"><div style="font-size:.7rem;color:var(--ink3);margin-bottom:6px;text-transform:uppercase">Your Order</div>';
    for(var p=0;p<placed.length;p++){
      html+='<div class="card" style="padding:10px;margin-bottom:6px;font-size:.8rem;background:var(--gold);color:#fff">'+(p+1)+'. '+recipe.steps[placed[p]]+'</div>';
    }
    html+='</div></div>';
    if(placed.length===recipe.steps.length){
      html+='<button class="btn btn-primary" style="width:100%;margin-top:16px" onclick="GamesUI.checkKitchen()">Check Order</button>';
    }
    document.getElementById('games-content').innerHTML=html;
  }
  function placeStep(idx){
    gameState.placedSteps.push(idx);
    render();
  }
  function checkKitchen(){
    var recipe=window.GAMES_DATA.kitchen.recipes[gameState.step];
    var placed=gameState.placedSteps;
    var correct=0;
    for(var i=0;i<placed.length;i++){
      if(placed[i]===i) correct++;
    }
    var score=Math.round(correct/recipe.steps.length*3);
    gameState.score+=score;
    gameState.total+=3;
    gameState.step++;
    gameState.shuffledSteps=null;
    gameState.placedSteps=[];
    _alert('Correct order: '+correct+'/'+recipe.steps.length+'\nScore: '+score+'/3');
    render();
  }

  // ═══════════════════════════════════════
  //  11. Values Sort
  // ═══════════════════════════════════════
  function renderValueSort(data){
    var statements=data.statements;
    if(gameState.step>=statements.length){finishGame();return;}
    var st=statements[gameState.step];
    document.getElementById('games-content').innerHTML='\
      <button onclick="GamesUI.quit()" style="align-self:flex-start;margin-bottom:12px;font-size:.9rem;color:var(--ink2)">\u2190 Quit</button>\
      <div style="font-size:.7rem;color:var(--ink3);text-align:center;margin-bottom:12px">Statement '+(gameState.step+1)+' / '+statements.length+'</div>\
      <div class="card" style="text-align:center;margin-bottom:16px;padding:20px">\
        <p style="font-size:1rem;font-weight:500;color:var(--ink)">"'+st.text+'"</p>\
      </div>\
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">\
        '+data.categories.map(function(cat){
          return '<button class="card" style="padding:16px;text-align:center" onclick="GamesUI.answerValueSort(\''+cat.id+'\')">'+
            '<div style="font-size:1.5rem;margin-bottom:4px">'+cat.emoji+'</div>'+
            '<div style="font-weight:600;font-size:.85rem">'+cat.name+'</div>'+
          '</button>';
        }).join('')+
      '</div>';
  }
  function answerValueSort(chosen){
    var st=window.GAMES_DATA.valuesort.statements[gameState.step];
    var isCorrect=(chosen===st.correct);
    if(isCorrect) gameState.score++;
    gameState.total++;
    gameState.step++;
    _alert((isCorrect?'\u2705 Correct!':'\u274C Wrong!')+' The value is: '+st.correct);
    render();
  }

  // ═══════════════════════════════════════
  //  12. Art Match
  // ═══════════════════════════════════════
  function renderArtMatch(data){
    var questions=data.questions;
    if(gameState.step>=questions.length){finishGame();return;}
    var q=questions[gameState.step];
    document.getElementById('games-content').innerHTML='\
      <button onclick="GamesUI.quit()" style="align-self:flex-start;margin-bottom:12px;font-size:.9rem;color:var(--ink2)">\u2190 Quit</button>\
      <div style="font-size:.7rem;color:var(--ink3);text-align:center;margin-bottom:12px">Question '+(gameState.step+1)+' / '+questions.length+'</div>\
      <div class="card" style="margin-bottom:16px;padding:16px;background:var(--cream)">\
        <p style="font-style:italic;color:var(--ink2)">"'+q.description+'"</p>\
      </div>\
      <div style="display:flex;flex-direction:column;gap:8px">\
        '+q.options.map(function(opt,i){
          return '<button class="card" style="text-align:left;padding:14px" onclick="GamesUI.answerArtMatch('+i+','+q.correct+')">'+
            '<p style="font-weight:500;font-size:.9rem">'+opt+'</p>'+
          '</button>';
        }).join('')+
      '</div>';
  }
  function answerArtMatch(chosen,correct){
    var q=window.GAMES_DATA.artmatch.questions[gameState.step];
    var isCorrect=chosen===correct;
    if(isCorrect) gameState.score++;
    gameState.total++;
    gameState.step++;
    _alert((isCorrect?'\u2705 Correct!':'\u274C Wrong!')+'\n\n'+q.explanation);
    render();
  }

  // ═══════════════════════════════════════
  //  13. Experiment Lab
  // ═══════════════════════════════════════
  function renderExperiment(data){
    var questions=data.questions;
    if(gameState.step>=questions.length){finishGame();return;}
    var q=questions[gameState.step];
    document.getElementById('games-content').innerHTML='\
      <button onclick="GamesUI.quit()" style="align-self:flex-start;margin-bottom:12px;font-size:.9rem;color:var(--ink2)">\u2190 Quit</button>\
      <div style="font-size:.7rem;color:var(--ink3);text-align:center;margin-bottom:12px">Question '+(gameState.step+1)+' / '+questions.length+'</div>\
      <div class="card" style="margin-bottom:16px;padding:16px;background:var(--cream)">\
        <p style="font-size:.85rem;color:var(--ink2)">'+q.scenario+'</p>\
        <p style="font-weight:600;margin-top:8px;color:var(--ink)">'+q.question+'</p>\
      </div>\
      <div style="display:flex;flex-direction:column;gap:8px">\
        '+q.options.map(function(opt,i){
          return '<button class="card" style="text-align:left;padding:14px" onclick="GamesUI.answerExperiment('+i+','+q.correct+')">'+
            '<p style="font-weight:500;font-size:.9rem">'+opt+'</p>'+
          '</button>';
        }).join('')+
      '</div>';
  }
  function answerExperiment(chosen,correct){
    var q=window.GAMES_DATA.experiment.questions[gameState.step];
    var isCorrect=chosen===correct;
    if(isCorrect) gameState.score++;
    gameState.total++;
    gameState.step++;
    _alert((isCorrect?'\u2705 Correct!':'\u274C Wrong!')+'\n\n'+q.explanation);
    render();
  }

  // ═══════════════════════════════════════
  //  14. Genre Mix
  // ═══════════════════════════════════════
  function renderGenre(data){
    var questions=data.questions;
    if(gameState.step>=questions.length){finishGame();return;}
    var q=questions[gameState.step];
    document.getElementById('games-content').innerHTML='\
      <button onclick="GamesUI.quit()" style="align-self:flex-start;margin-bottom:12px;font-size:.9rem;color:var(--ink2)">\u2190 Quit</button>\
      <div style="font-size:.7rem;color:var(--ink3);text-align:center;margin-bottom:12px">Question '+(gameState.step+1)+' / '+questions.length+'</div>\
      <div class="card" style="margin-bottom:16px;padding:16px;background:var(--cream)">\
        <p style="font-style:italic;color:var(--ink2)">\uD83C\uDFB5 "'+q.description+'"</p>\
      </div>\
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">\
        '+q.options.map(function(opt,i){
          return '<button class="card" style="padding:16px;text-align:center" onclick="GamesUI.answerGenre('+i+','+q.correct+')">'+
            '<div style="font-weight:600">'+opt+'</div>'+
          '</button>';
        }).join('')+
      '</div>';
  }
  function answerGenre(chosen,correct){
    var q=window.GAMES_DATA.genre.questions[gameState.step];
    var isCorrect=chosen===correct;
    if(isCorrect) gameState.score++;
    gameState.total++;
    gameState.step++;
    _alert((isCorrect?'\u2705 Correct!':'\u274C Wrong!')+'\n\n'+q.explanation);
    render();
  }

  // ═══════════════════════════════════════
  //  15. Scene Decoder
  // ═══════════════════════════════════════
  function renderSceneDecoder(data){
    var questions=data.questions;
    if(gameState.step>=questions.length){finishGame();return;}
    var q=questions[gameState.step];
    document.getElementById('games-content').innerHTML='\
      <button onclick="GamesUI.quit()" style="align-self:flex-start;margin-bottom:12px;font-size:.9rem;color:var(--ink2)">\u2190 Quit</button>\
      <div style="font-size:.7rem;color:var(--ink3);text-align:center;margin-bottom:12px">Question '+(gameState.step+1)+' / '+questions.length+'</div>\
      <div class="card" style="margin-bottom:16px;padding:16px;background:var(--cream)">\
        <p style="font-style:italic;color:var(--ink2)">\uD83C\uDFAC "'+q.description+'"</p>\
      </div>\
      <div style="display:flex;flex-direction:column;gap:8px">\
        '+q.options.map(function(opt,i){
          return '<button class="card" style="text-align:left;padding:14px" onclick="GamesUI.answerSceneDecoder('+i+','+q.correct+')">'+
            '<p style="font-weight:500;font-size:.9rem">'+opt+'</p>'+
          '</button>';
        }).join('')+
      '</div>';
  }
  function answerSceneDecoder(chosen,correct){
    var q=window.GAMES_DATA.scenedecoder.questions[gameState.step];
    var isCorrect=chosen===correct;
    if(isCorrect) gameState.score++;
    gameState.total++;
    gameState.step++;
    _alert((isCorrect?'\u2705 Correct!':'\u274C Wrong!')+'\n\n'+q.explanation);
    render();
  }

  // ═══════════════════════════════════════
  //  16. Color Lab
  // ═══════════════════════════════════════
  function renderColorLab(data){
    var questions=data.questions;
    if(gameState.step>=questions.length){finishGame();return;}
    var q=questions[gameState.step];
    document.getElementById('games-content').innerHTML='\
      <button onclick="GamesUI.quit()" style="align-self:flex-start;margin-bottom:12px;font-size:.9rem;color:var(--ink2)">\u2190 Quit</button>\
      <div style="font-size:.7rem;color:var(--ink3);text-align:center;margin-bottom:12px">Question '+(gameState.step+1)+' / '+questions.length+'</div>\
      <div class="card" style="margin-bottom:16px;padding:16px;background:var(--cream)">\
        <p style="font-weight:500;color:var(--ink2)">\uD83C\uDFA8 '+q.description+'</p>\
      </div>\
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">\
        '+q.options.map(function(opt,i){
          return '<button class="card" style="padding:16px;text-align:center" onclick="GamesUI.answerColorLab('+i+','+q.correct+')">'+
            '<div style="font-weight:600">'+opt+'</div>'+
          '</button>';
        }).join('')+
      '</div>';
  }
  function answerColorLab(chosen,correct){
    var q=window.GAMES_DATA.colorlab.questions[gameState.step];
    var isCorrect=chosen===correct;
    if(isCorrect) gameState.score++;
    gameState.total++;
    gameState.step++;
    _alert((isCorrect?'\u2705 Correct!':'\u274C Wrong!')+'\n\n'+q.explanation);
    render();
  }

  // ═══════════════════════════════════════
  //  17. Poetry Match
  // ═══════════════════════════════════════
  function renderPoetryMatch(data){
    var questions=data.questions;
    if(gameState.step>=questions.length){finishGame();return;}
    var q=questions[gameState.step];
    document.getElementById('games-content').innerHTML='\
      <button onclick="GamesUI.quit()" style="align-self:flex-start;margin-bottom:12px;font-size:.9rem;color:var(--ink2)">\u2190 Quit</button>\
      <div style="font-size:.7rem;color:var(--ink3);text-align:center;margin-bottom:12px">Question '+(gameState.step+1)+' / '+questions.length+'</div>\
      <div class="card" style="margin-bottom:16px;padding:20px;background:var(--cream)">\
        <p style="font-style:italic;color:var(--ink);line-height:1.6;white-space:pre-line">"'+q.line+'"</p>\
      </div>\
      <div style="display:flex;flex-direction:column;gap:8px">\
        '+q.options.map(function(opt,i){
          return '<button class="card" style="text-align:left;padding:14px" onclick="GamesUI.answerPoetryMatch('+i+','+q.correct+')">'+
            '<p style="font-weight:500;font-size:.9rem">'+opt+'</p>'+
          '</button>';
        }).join('')+
      '</div>';
  }
  function answerPoetryMatch(chosen,correct){
    var q=window.GAMES_DATA.poetrymatch.questions[gameState.step];
    var isCorrect=chosen===correct;
    if(isCorrect) gameState.score++;
    gameState.total++;
    gameState.step++;
    _alert((isCorrect?'\u2705 Correct!':'\u274C Wrong!')+'\n\n'+q.explanation);
    render();
  }

  // ═══════════════════════════════════════
  //  18. Culture Quest
  // ═══════════════════════════════════════
  function renderCultureQuest(data){
    var questions=data.questions;
    if(gameState.step>=questions.length){finishGame();return;}
    var q=questions[gameState.step];
    document.getElementById('games-content').innerHTML='\
      <button onclick="GamesUI.quit()" style="align-self:flex-start;margin-bottom:12px;font-size:.9rem;color:var(--ink2)">\u2190 Quit</button>\
      <div style="font-size:.7rem;color:var(--ink3);text-align:center;margin-bottom:12px">Question '+(gameState.step+1)+' / '+questions.length+'</div>\
      <div class="card" style="margin-bottom:16px;padding:16px;background:var(--cream)">\
        <p style="font-weight:500;color:var(--ink)">\uD83C\uDF0D '+q.custom+'</p>\
      </div>\
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">\
        '+q.options.map(function(opt,i){
          return '<button class="card" style="padding:16px;text-align:center" onclick="GamesUI.answerCultureQuest('+i+','+q.correct+')">'+
            '<div style="font-weight:600">'+opt+'</div>'+
          '</button>';
        }).join('')+
      '</div>';
  }
  function answerCultureQuest(chosen,correct){
    var q=window.GAMES_DATA.culturequest.questions[gameState.step];
    var isCorrect=chosen===correct;
    if(isCorrect) gameState.score++;
    gameState.total++;
    gameState.step++;
    _alert((isCorrect?'\u2705 Correct!':'\u274C Wrong!')+'\n\n'+q.explanation);
    render();
  }

  // ═══════════════════════════════════════
  //  Shared: Finish & Quit
  // ═══════════════════════════════════════
  function finishGame(){
    if(gameState.timerInterval) clearInterval(gameState.timerInterval);
    var state=window.App.getState();
    var xp=gameState.score*5;
    window.Progress.addXP(state,xp);
    window.Economy.addPearls(state,gameState.score);
    window.App.setState(state);
    var pct=gameState.total?Math.round(100*gameState.score/gameState.total):0;
    document.getElementById('games-content').innerHTML='\
      <div style="text-align:center;padding:40px 20px">\
        <div style="font-size:3rem;margin-bottom:12px">'+(pct>=80?'\uD83C\uDFC6':pct>=50?'\uD83D\uDC4F':'\uD83D\uDCAA')+'</div>\
        <h3>Game Complete!</h3>\
        <p style="font-size:1.5rem;font-weight:700;color:var(--gold);margin:12px 0">'+gameState.score+' / '+gameState.total+'</p>\
        <p style="color:var(--ink3);margin-bottom:20px">+'+xp+' XP \u00B7 +'+gameState.score+' \uD83E\uDDAA</p>\
        <button class="btn btn-primary" style="width:100%;margin-bottom:8px" onclick="GamesUI.quit()">Back to Playground</button>\
      </div>';
  }
  function quit(){
    if(gameState&&gameState.timerInterval) clearInterval(gameState.timerInterval);
    currentGame=null;
    gameState=null;
    render();
  }
  window.GamesUI={
    render:render,start:start,quit:quit,allocate:allocate,
    submitBudget:submitBudget,chooseDojo:chooseDojo,
    answerBias:answerBias,answerNews:answerNews,answerEmotion:answerEmotion,
    answerIntegrity:answerIntegrity,flipCard:flipCard,
    answerSpeedMath:answerSpeedMath,answerWorkplace:answerWorkplace,
    placeStep:placeStep,checkKitchen:checkKitchen,
    answerValueSort:answerValueSort,answerArtMatch:answerArtMatch,
    answerExperiment:answerExperiment,answerGenre:answerGenre,
    answerSceneDecoder:answerSceneDecoder,answerColorLab:answerColorLab,
    answerPoetryMatch:answerPoetryMatch,answerCultureQuest:answerCultureQuest
  };
})();
