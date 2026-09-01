/* Cards Engine — Wisdom Card collection */
(function(){
  function getCardForLesson(lessonId){
    var lesson=window.LESSONS.find(function(l){return l.id===lessonId;});
    if(!lesson) return null;
    var realm=window.REALMS.find(function(r){return r.id===lesson.realm;});
    return {
      id:lessonId,
      title:lesson.title,
      realm:lesson.realm,
      realmName:realm?realm.name:'Unknown',
      realmEmoji:realm?realm.icon:'📖',
      realmColor:realm?realm.color:'#d4a54a',
      stage:lesson.stage,
      isGold:false
    };
  }
  function getGoldCard(badgeId){
    var badge=window.Progress?window.Progress.BADGES.find(function(b){return b.id===badgeId;}):null;
    if(!badge) return null;
    return {
      id:'badge-'+badgeId,
      title:badge.name,
      realm:'special',
      realmName:'Achievement',
      realmEmoji:'🏆',
      realmColor:'#d4a54a',
      stage:'all',
      isGold:true
    };
  }
  function getCollection(state){
    var cards=[];
    if(state.completedLessons){
      state.completedLessons.forEach(function(lid){
        var card=getCardForLesson(lid);
        if(card) cards.push(card);
      });
    }
    if(state.earnedBadges){
      state.earnedBadges.forEach(function(bid){
        var card=getGoldCard(bid);
        if(card) cards.push(card);
      });
    }
    return cards;
  }
  function getRealmCards(realmId,state){
    return getCollection(state).filter(function(c){return c.realm===realmId;});
  }
  function getRealmProgress(realmId,state){
    var realmLessons=window.LESSONS.filter(function(l){return l.realm===realmId;});
    var total=realmLessons.length;
    var owned=getRealmCards(realmId,state).filter(function(c){return !c.isGold;}).length;
    return {owned:owned,total:total,pct:total?Math.round(100*owned/total):0};
  }
  function getAlbumStats(state){
    var realms=window.REALMS.map(function(r){
      var prog=getRealmProgress(r.id,state);
      return {id:r.id,name:r.name,icon:r.icon,color:r.color,owned:prog.owned,total:prog.total,pct:prog.pct};
    });
    var goldCards=state.earnedBadges?state.earnedBadges.size:0;
    var totalOwned=getCollection(state).length;
    return {realms:realms,goldCards:goldCards,totalOwned:totalOwned};
  }
  function getTotalCards(){
    return (window.LESSONS?window.LESSONS.length:0)+(window.Progress?window.Progress.BADGES.length:0);
  }
  window.Cards={
    getCardForLesson:getCardForLesson,getGoldCard:getGoldCard,
    getCollection:getCollection,getRealmCards:getRealmCards,
    getRealmProgress:getRealmProgress,getAlbumStats:getAlbumStats,
    getTotalCards:getTotalCards
  };
})();
