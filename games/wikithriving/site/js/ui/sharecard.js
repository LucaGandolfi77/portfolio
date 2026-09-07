/* Share Card — generates shareable progress cards */
(function(){
  var canvas=null;
  var ctx2d=null;
  function ensureCanvas(){
    if(canvas) return;
    canvas=document.createElement('canvas');
    canvas.width=1080;
    canvas.height=1080;
    ctx2d=canvas.getContext('2d');
  }
  function generateCard(state){
    ensureCanvas();
    var p=state.profile;
    var stats=window.Progress.getStats(state);
    var w=1080,h=1080;
    // Background
    ctx2d.fillStyle='#faf6ee';
    ctx2d.fillRect(0,0,w,h);
    // Gold border
    ctx2d.strokeStyle='#d4a54a';
    ctx2d.lineWidth=8;
    ctx2d.strokeRect(20,20,w-40,h-40);
    // Inner border
    ctx2d.strokeStyle='#f5e6c8';
    ctx2d.lineWidth=3;
    ctx2d.strokeRect(35,35,w-70,h-70);
    // Header emoji
    ctx2d.font='80px serif';
    ctx2d.textAlign='center';
    ctx2d.fillText('📖',w/2,120);
    // Title
    ctx2d.fillStyle='#d4a54a';
    ctx2d.font='bold 48px "Playfair Display",Georgia,serif';
    ctx2d.fillText('WikiThriving',w/2,180);
    // Subtitle
    ctx2d.fillStyle='#5a6275';
    ctx2d.font='24px "Source Sans 3",system-ui,sans-serif';
    ctx2d.fillText(p.flag+' '+p.stageEmoji+' '+p.stageName,w/2,220);
    // Stats section
    ctx2d.fillStyle='#1f2430';
    ctx2d.font='bold 36px "Source Sans 3",system-ui,sans-serif';
    ctx2d.fillText(stats.level+' · '+stats.rank.emoji+' '+stats.rank.name,w/2,290);
    // Divider
    ctx2d.strokeStyle='#d4a54a';
    ctx2d.lineWidth=2;
    ctx2d.beginPath();ctx2d.moveTo(100,320);ctx2d.lineTo(w-100,320);ctx2d.stroke();
    // Stats grid
    var statsData=[
      {icon:'⚡',label:'XP',value:stats.xp},
      {icon:'🔥',label:'Streak',value:stats.streak+' days'},
      {icon:'📖',label:'Lessons',value:stats.totalLessons},
      {icon:'🏆',label:'Badges',value:stats.badges.length},
      {icon:'🦪',label:'Pearls',value:state.pearls||0},
      {icon:'🎮',label:'Games',value:state.gamesPlayed||0}
    ];
    var cols=3,rowH=120;
    statsData.forEach(function(s,i){
      var col=i%cols;
      var row=Math.floor(i/cols);
      var x=180+col*260;
      var y=380+row*rowH;
      ctx2d.font='40px serif';
      ctx2d.textAlign='center';
      ctx2d.fillText(s.icon,x,y);
      ctx2d.fillStyle='#d4a54a';
      ctx2d.font='bold 32px "Source Sans 3",system-ui,sans-serif';
      ctx2d.fillText(s.value,x,y+40);
      ctx2d.fillStyle='#5a6275';
      ctx2d.font='18px "Source Sans 3",system-ui,sans-serif';
      ctx2d.fillText(s.label,x,y+65);
      ctx2d.fillStyle='#1f2430';
    });
    // Progress bar
    var barY=680;
    var barW=w-200;
    var barH=20;
    var pct=Math.min(100,stats.totalLessons/506*100);
    ctx2d.fillStyle='#e6dfd0';
    ctx2d.beginPath();ctx2d.roundRect(100,barY,barW,barH,10);ctx2d.fill();
    ctx2d.fillStyle='#d4a54a';
    ctx2d.beginPath();ctx2d.roundRect(100,barY,barW*(pct/100),barH,10);ctx2d.fill();
    ctx2d.fillStyle='#3a4255';
    ctx2d.font='20px "Source Sans 3",system-ui,sans-serif';
    ctx2d.textAlign='center';
    ctx2d.fillText(Math.round(pct)+'% of 506 lessons completed',w/2,barY+50);
    // Top realm
    if(stats.topRealm){
      ctx2d.font='16px "Source Sans 3",system-ui,sans-serif';
      ctx2d.fillStyle='#5a6275';
      ctx2d.fillText('Top Realm: '+stats.topRealm.name+' '+stats.topRealm.icon,w/2,barY+80);
    }
    // Bottom
    ctx2d.fillStyle='#d4a54a';
    ctx2d.font='bold 22px "Source Sans 3",system-ui,sans-serif';
    ctx2d.fillText('wikithriving.com',w/2,h-80);
    ctx2d.fillStyle='#5a6275';
    ctx2d.font='16px "Source Sans 3",system-ui,sans-serif';
    ctx2d.fillText('The Field Guide to Your Life',w/2,h-50);
    return canvas.toDataURL('image/png');
  }
  function share(){
    var state=window.App.getState();
    var dataUrl=generateCard(state);
    if(navigator.share&&navigator.canShare){
      fetch(dataUrl).then(function(r){return r.blob();}).then(function(blob){
        var file=new File([blob],'wikithriving-progress.png',{type:'image/png'});
        if(navigator.canShare({files:[file]})){
          navigator.share({files:[file],title:'My WikiThriving Progress',text:'Look at my progress on WikiThriving! 📖'});
          return;
        }
        download(dataUrl);
      }).catch(function(){download(dataUrl);});
    } else {
      download(dataUrl);
    }
  }
  function download(dataUrl){
    var a=document.createElement('a');
    a.href=dataUrl;a.download='wikithriving-progress.png';
    document.body.appendChild(a);a.click();document.body.removeChild(a);
    window.Toast.success('Progress card saved!');
  }
  window.ShareCard={share:share,generate:generateCard};
})();
