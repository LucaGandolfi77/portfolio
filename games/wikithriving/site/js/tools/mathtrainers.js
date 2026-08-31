/* Math Trainers — times tables, fractions, percentages */
(function(){
  function generateTimesTable(max){
    const q=[];
    for(let i=1;i<=max;i++) for(let j=1;j<=max;j++)
      q.push({a:i,b:j,answer:i*j});
    return q;
  }
  function shuffle(arr){
    const a=[...arr];
    for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}
    return a;
  }
  function timesTableQuiz(max,limit){
    const all=generateTimesTable(max);
    return shuffle(all).slice(0,limit||10);
  }
  function fractionQuiz(count){
    const qs=[];
    for(let i=0;i<(count||10);i++){
      const d1=[2,3,4,5,8][Math.floor(Math.random()*5)];
      const n1=Math.floor(Math.random()*d1)+1;
      const d2=d1;
      const n2=Math.floor(Math.random()*d2)+1;
      const sum=n1+n2;
      const gcd=(a,b)=>b?gcd(b,a%b):a;
      const g=gcd(sum,d1);
      qs.push({n1,d1,n2,d2,answer_n:sum/g,answer_d:d1/g,display:`${n1}/${d1} + ${n2}/${d2} = ?`});
    }
    return qs;
  }
  function percentQuiz(count){
    const qs=[];
    for(let i=0;i<(count||10);i++){
      const base=[50,100,200,250,400,500][Math.floor(Math.random()*6)];
      const pct=[10,15,20,25,30,50][Math.floor(Math.random()*6)];
      const answer=base*pct/100;
      qs.push({base,pct,answer,display:`${pct}% of ${base} = ?`});
    }
    return qs;
  }
  window.MathTrainers={timesTableQuiz,fractionQuiz,percentQuiz,shuffle};
})();
