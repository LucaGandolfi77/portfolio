/* I DUE LUMI — Main loop */
const GAME = { phase:'title', time:0 };

function title(){
  const a = 0.65 + Math.sin(Date.now()/800)*0.25;
  CTX.fillStyle = hex(PAL.night);
  CTX.fillRect(0,0,W,H);
  CTX.fillStyle = `rgba(242,193,78,${a})`;
  CTX.fillRect(W/2-52, H/2-31, 104, 18);
  text('I DUE LUMI', W/2, H/2-18, 15, `rgba(242,193,78,${Math.min(1,a+0.2)})`, 'center');
  text('Un\'avventura pixel art', W/2, H/2+12, 11, hex(PAL.fog), 'center');
  text('Premi Z o tocca per iniziare', W/2, H/2+42, 11,
    `rgba(247,232,201,${Math.min(1,a+0.15)})`, 'center');

  if(justPressedA() || INPUT.ax !== 0 || INPUT.ay !== 0 || INPUT.start){
    ensureAudio();
    startStory('intro');
    GAME.phase = 'story';
  }
}

function gameLoop(){
  requestAnimationFrame(gameLoop);
  updateInput();
  CTX.clearRect(0,0,W,H);
  clearText();

  if(GAME.phase === 'title'){
    title();
  } else if(GAME.phase === 'story'){
    updateStory();
    drawStory();
  } else if(GAME.phase === 'overworld'){
    if(BATTLE){
      updateBattle();
      drawBattle();
    } else {
      updateOverworld();
      drawOverworld();
    }
  }

  GAME.time++;
}

/* init */
window.addEventListener('load', ()=>{
  preRender();
  initUI();
  initTouch();
  GAME.phase = 'title';
  gameLoop();
});
