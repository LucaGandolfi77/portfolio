/* Quiz Engine — auto-cloze + hand-authored MCQs */
(function(){
  var STOPWORDS=new Set('the a an is are was were be been being have has had do does did will would shall should may might can could of in to for on with at by from as into through during before after above below between out off over under again further then once here there when where why how all both each few more most other some such no nor not only own same so than too very s that this these those i me my we our you your he him his she her it its they them their what which who whom if about because until while although yet and but or so'.split(' '));
  function getHandAuthored(realm,stage){
    if(!window.QUIZ_BANK) return null;
    var pool=window.QUIZ_BANK.filter(function(q){return q.realm===realm&&(q.stage===stage||q.stage===null);});
    if(!pool.length) return null;
    return pool[Math.floor(Math.random()*pool.length)];
  }
  function generateCloze(lesson){
    var body=lesson.body||'';
    var sentences=body.split(/[.!?]+/).map(function(s){return s.trim();}).filter(function(s){return s.split(' ').length>=6;});
    if(!sentences.length) sentences=[body];
    var sent=sentences[Math.floor(Math.random()*sentences.length)];
    var words=sent.split(/\s+/).filter(function(w){return w.length>=5&&!STOPWORDS.has(w.toLowerCase().replace(/[^a-z]/g,''));});
    if(!words.length) words=sent.split(/\s+/).filter(function(w){return w.length>=4;});
    if(!words.length) return null;
    var target=words[Math.floor(Math.random()*words.length)];
    var clean=target.replace(/[^a-zA-Z]/g,'');
    if(clean.length<3) return null;
    var distractors=getStageDistractors(lesson.stage||'teen',clean);
    var options=[clean].concat(distractors);
    for(var i=options.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=options[i];options[i]=options[j];options[j]=t;}
    var correctIdx=options.indexOf(clean);
    var blanked=sent.replace(target,'______');
    return {q:'Fill in the blank: "'+blanked+'"',options:options,correct:correctIdx,explanation:'The correct word is "'+clean+'"'};
  }
  function getStageDistractors(stage,exclude){
    var allWords=['curiosity','discipline','gratitude','empathy','patience','resilience','integrity','compassion','diligence','imagination','courage','wisdom','justice','temperance','fortitude','honesty','kindness','humility','generosity','prudence'];
    var pool=allWords.filter(function(w){return w.toLowerCase()!==exclude.toLowerCase();});
    var result=[];
    while(result.length<3&&pool.length){
      var idx=Math.floor(Math.random()*pool.length);
      result.push(pool.splice(idx,1)[0]);
    }
    return result;
  }
  function build(lesson){
    var hand=getHandAuthored(lesson.realm,lesson.stage);
    if(hand) return {type:'authored',q:hand.q,options:hand.options,correct:hand.correct,explanation:hand.explanation,lessonId:hand.lessonId};
    var cloze=generateCloze(lesson);
    if(cloze) return {type:'cloze',q:cloze.q,options:cloze.options,correct:cloze.correct,explanation:cloze.explanation,lessonId:lesson.id};
    return null;
  }
  function buildSet(lesson,count){
    count=count||2;
    var qs=[];
    var hand=getHandAuthored(lesson.realm,lesson.stage);
    if(hand) qs.push({type:'authored',q:hand.q,options:hand.options,correct:hand.correct,explanation:hand.explanation});
    while(qs.length<count){
      var cloze=generateCloze(lesson);
      if(cloze&&qs.every(function(x){return x.q!==cloze.q;})){
        qs.push({type:'cloze',q:cloze.q,options:cloze.options,correct:cloze.correct,explanation:cloze.explanation});
      } else {
        break;
      }
    }
    return qs;
  }
  function isPassing(score,total){return score>=Math.ceil(total*0.5);}
  window.Quiz={build:build,buildSet:buildSet,isPassing:isPassing};
})();
