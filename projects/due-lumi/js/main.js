/* I DUE LUMI — Main loop */
const GAME = { phase:'title', time:0 };

function title(){
  const a = 0.5 + Math.sin(Date.now()/800)*0.3;
  CTX.fillStyle = hex(PAL.night);
  CTX.fillRect(0,0,W,H);
  CTX.fillStyle = `rgba(242,193,78,${a})`;
  CTX.font = '14px monospace';
  CTX.fillText('I DUE LUMI', W/2-40, H/2-20);
  CTX.fillStyle = hex(PAL.fog);
  CTX.font = '9px monospace';
  CTX.fillText('Un\'avventura pixel art', W/2-60, H/2+10);
  CTX.fillStyle = `rgba(247,232,201,${a})`;
  CTX.fillText('Premi Z o tocca per iniziare', W/2-80, H/2+40);

  if(justPressedA() || INPUT.ax !== 0 || INPUT.ay !== 0){
    ensureAudio();
    startStory('intro');
    GAME.phase = 'story';
  }
}

function gameLoop(){
  requestAnimationFrame(gameLoop);
  updateInput();
  CTX.clearRect(0,0,W,H);

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
