/* Daily Engine — deterministic quote + quest by date seed */
(function(){
  function dayOfYear(){
    const now=new Date();
    const start=new Date(now.getFullYear(),0,0);
    return Math.floor((now-start)/86400000);
  }
  function seededRandom(seed){
    let s=seed;
    return function(){
      s=(s*16807+0)%2147483647;
      return(s-1)/2147483646;
    };
  }
  function getDailyQuote(profile){
    const seed=dayOfYear()+profile.country.length*7;
    const rng=seededRandom(seed);
    const idx=Math.floor(rng()*window.QUOTES.length);
    return window.QUOTES[idx];
  }
  function getDailyQuest(profile){
    const seed=dayOfYear()+profile.age*13+profile.gender.length*5;
    const rng=seededRandom(seed);
    const pool=window.QUESTIONS.filter(q=>q.stage===profile.stageId);
    if(!pool.length) return null;
    const idx=Math.floor(rng()*pool.length);
    return pool[idx];
  }
  function getTodayId(){
    return new Date().toISOString().slice(0,10);
  }
  window.Daily={getDailyQuote,getDailyQuest,getTodayId};
})();
