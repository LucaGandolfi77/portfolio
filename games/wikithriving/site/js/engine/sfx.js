/* Sound effects — Web Audio API + haptic feedback */
(function(){
  var ctx=null;
  function getCtx(){
    if(!ctx) ctx=new(window.AudioContext||window.webkitAudioContext)();
    return ctx;
  }
  function beep(freq,dur,type,vol){
    try{
      var c=getCtx();
      var o=c.createOscillator();
      var g=c.createGain();
      o.type=type||'sine';
      o.frequency.value=freq;
      g.gain.value=vol||0.15;
      g.gain.exponentialRampToValueAtTime(0.001,c.currentTime+dur);
      o.connect(g);g.connect(c.destination);
      o.start(c.currentTime);o.stop(c.currentTime+dur);
    }catch(e){}
  }
  function vibrate(ms){
    try{if(navigator.vibrate)navigator.vibrate(ms);}catch(e){}
  }
  function success(){
    beep(523,0.1,'sine',0.12);
    setTimeout(function(){beep(659,0.1,'sine',0.12);},100);
    setTimeout(function(){beep(784,0.15,'sine',0.12);},200);
    vibrate(50);
  }
  function error(){
    beep(330,0.15,'sawtooth',0.08);
    setTimeout(function(){beep(220,0.2,'sawtooth',0.08);},150);
    vibrate([50,30,50]);
  }
  function levelUp(){
    beep(523,0.08,'sine',0.1);
    setTimeout(function(){beep(659,0.08,'sine',0.1);},80);
    setTimeout(function(){beep(784,0.08,'sine',0.1);},160);
    setTimeout(function(){beep(1047,0.2,'sine',0.12);},240);
    vibrate(80);
  }
  function streak(){
    beep(880,0.08,'triangle',0.1);
    setTimeout(function(){beep(1175,0.08,'triangle',0.1);},80);
    setTimeout(function(){beep(1318,0.12,'triangle',0.1);},160);
    vibrate(60);
  }
  function click(){
    beep(800,0.03,'sine',0.06);
    vibrate(10);
  }
  function achievement(){
    beep(523,0.06,'sine',0.1);
    setTimeout(function(){beep(659,0.06,'sine',0.1);},70);
    setTimeout(function(){beep(784,0.06,'sine',0.1);},140);
    setTimeout(function(){beep(1047,0.06,'sine',0.1);},210);
    setTimeout(function(){beep(1318,0.15,'sine',0.12);},280);
    vibrate([30,20,30,20,80]);
  }
  window.SFX={success:success,error:error,levelUp:levelUp,streak:streak,click:click,achievement:achievement};
})();
