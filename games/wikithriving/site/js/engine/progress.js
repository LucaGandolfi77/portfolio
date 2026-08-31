/* Progress Engine — XP, streak, levels, badges */
(function(){
  const XP_PER_LESSON=10,XP_PER_QUIZ=15;
  const RANKS=[
    {id:'newcomer',name:'Newcomer',min:0,emoji:'📖'},
    {id:'seeker',name:'Seeker',min:100,emoji:'🔍'},
    {id:'scholar',name:'Scholar',min:300,emoji:'🎓'},
    {id:'sage',name:'Sage',min:600,emoji:'🦉'},
    {id:'master',name:'Life Master',min:1000,emoji:'🌟'},
    {id:'luminary',name:'Luminary',min:2000,emoji:'✨'}
  ];
  const BADGES=[
    {id:'first_lesson',name:'First Steps',desc:'Complete your first lesson',emoji:'👣',check:s=>s.lessonsDone>=1},
    {id:'five_lessons',name:'Curious Mind',desc:'Complete 5 lessons',emoji:'🧠',check:s=>s.lessonsDone>=5},
    {id:'ten_lessons',name:'Dedicated Learner',desc:'Complete 10 lessons',emoji:'📚',check:s=>s.lessonsDone>=10},
    {id:'twenty_lessons',name:'Knowledge Seeker',desc:'Complete 20 lessons',emoji:'🎯',check:s=>s.lessonsDone>=20},
    {id:'fifty_lessons',name:'Wisdom Collector',desc:'Complete 50 lessons',emoji:'🏆',check:s=>s.lessonsDone>=50},
    {id:'hundred_lessons',name:'Scholar of Life',desc:'Complete 100 lessons',emoji:'🌟',check:s=>s.lessonsDone>=100},
    {id:'streak_3',name:'Consistent',desc:'3-day streak',emoji:'🔥',check:s=>s.streak>=3},
    {id:'streak_7',name:'On Fire',desc:'7-day streak',emoji:'🔥',check:s=>s.streak>=7},
    {id:'streak_14',name:'Unstoppable',desc:'14-day streak',emoji:'💪',check:s=>s.streak>=14},
    {id:'streak_30',name:'Dedication',desc:'30-day streak',emoji:'🏅',check:s=>s.streak>=30},
    {id:'all_realms',name:'Life Explorer',desc:'Complete at least 1 lesson in every realm',emoji:'🗺️',check:s=>s.realmsVisited>=10},
    {id:'all_realms_bonus',name:'Polymath',desc:'Complete at least 1 lesson in all 17 realms',emoji:'🌌',check:s=>s.realmsVisited>=17},
    {id:'math_master',name:'Math Wizard',desc:'Complete 10 math lessons',emoji:'🔢',check:s=>s.mathDone>=10},
    {id:'character_first',name:'Character Building',desc:'Complete 5 character lessons',emoji:'🤝',check:s=>s.characterDone>=5},
    {id:'money_smart',name:'Money Smart',desc:'Complete 5 money lessons',emoji:'💰',check:s=>s.moneyDone>=5},
    {id:'health_first',name:'Health Champion',desc:'Complete 5 health lessons',emoji:'❤️',check:s=>s.healthDone>=5},
    {id:'art_lover',name:'Art Lover',desc:'Complete 5 art lessons',emoji:'🎨',check:s=>s.artDone>=5},
    {id:'science_mind',name:'Science Mind',desc:'Complete 5 science lessons',emoji:'🔬',check:s=>s.scienceDone>=5},
    {id:'psych_self',name:'Self-Knower',desc:'Complete 5 psychology lessons',emoji:'🧩',check:s=>s.psychologyDone>=5},
    {id:'music_lover',name:'Melomane',desc:'Complete 5 music lessons',emoji:'🎵',check:s=>s.musicDone>=5},
    {id:'cinephile',name:'Cinephile',desc:'Complete 5 film lessons',emoji:'🎬',check:s=>s.filmDone>=5},
    {id:'designer_eye',name:'Designer Eye',desc:'Complete 5 design lessons',emoji:'🖌️',check:s=>s.designDone>=5},
    {id:'bookworm',name:'Bookworm',desc:'Read 5 book entries',emoji:'📚',check:s=>s.booksRead>=5},
    {id:'poet_heart',name:'Poet\'s Heart',desc:'Read 5 poems',emoji:'🖋️',check:s=>s.poemsRead>=5}
  ];
  function getRank(xp){
    for(let i=RANKS.length-1;i>=0;i--) if(xp>=RANKS[i].min) return RANKS[i];
    return RANKS[0];
  }
  function initProgress(profile){
    return{
      profile,xp:0,level:1,streak:0,lastVisit:null,
      completedLessons:new Set(),
      dailyQuestsDone:new Set(),
      earnedBadges:new Set(),
      booksRead:new Set(),
      poemsRead:new Set(),
      lessonsByRealm:{},totalLessonsDone:0
    };
  }
  function addXP(state,amount){
    state.xp+=amount;
    state.level=Math.floor(state.xp/100)+1;
    return state;
  }
  function markLessonDone(state,lessonId,realm){
    if(state.completedLessons.has(lessonId)) return false;
    state.completedLessons.add(lessonId);
    state.totalLessonsDone++;
    state.lessonsByRealm[realm]=(state.lessonsByRealm[realm]||0)+1;
    addXP(state,XP_PER_LESSON);
    return true;
  }
  function updateStreak(state){
    const today=new Date().toISOString().slice(0,10);
    if(state.lastVisit===today) return state;
    const yesterday=new Date(Date.now()-86400000).toISOString().slice(0,10);
    if(state.lastVisit===yesterday){
      state.streak++;
    } else if(state.lastVisit!==today){
      state.streak=1;
    }
    state.lastVisit=today;
    return state;
  }
  function checkBadges(state){
    const stats={
      lessonsDone:state.totalLessonsDone,
      streak:state.streak,
      realmsVisited:Object.keys(state.lessonsByRealm).length,
      mathDone:state.lessonsByRealm.math||0,
      characterDone:state.lessonsByRealm.character||0,
      moneyDone:state.lessonsByRealm.money||0,
      healthDone:state.lessonsByRealm.health||0,
      artDone:state.lessonsByRealm.art||0,
      scienceDone:state.lessonsByRealm.science||0,
      psychologyDone:state.lessonsByRealm.psychology||0,
      musicDone:state.lessonsByRealm.music||0,
      filmDone:state.lessonsByRealm.film||0,
      designDone:state.lessonsByRealm.design||0,
      booksRead:state.booksRead.size,
      poemsRead:state.poemsRead.size
    };
    const newBadges=[];
    BADGES.forEach(b=>{
      if(!state.earnedBadges.has(b.id)&&b.check(stats)){
        state.earnedBadges.add(b.id);
        newBadges.push(b);
      }
    });
    return{state,newBadges};
  }
  function getStats(state){
    return{
      xp:state.xp,level:state.level,streak:state.streak,
      rank:getRank(state.xp),
      totalLessons:state.totalLessonsDone,
      realms:Object.keys(state.lessonsByRealm).length,
      badges:[...state.earnedBadges].map(id=>BADGES.find(b=>b.id===id)).filter(Boolean),
      booksRead:state.booksRead.size,
      poemsRead:state.poemsRead.size
    };
  }
  window.Progress={XP_PER_LESSON,XP_PER_QUIZ,RANKS,BADGES,getRank,initProgress,addXP,markLessonDone,updateStreak,checkBadges,getStats};
})();
