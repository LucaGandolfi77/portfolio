/* I DUE LUMI — Story / cutscene engine */
let STORY = null;

function startStory(id){
  STORY = { id, step:0, timer:0 };
}

function updateStory(){
  if(!STORY) return;
  STORY.timer++;

  if(STORY.id === 'intro' && STORY.step === 0){
    if(STORY.timer < 120){
      const a = Math.min(STORY.timer/60, 1);
      CTX.fillStyle = `rgba(13,11,9,${1-a})`;
      CTX.fillRect(0,0,W,H);
      CTX.fillStyle = `rgba(242,193,78,${a})`;
      CTX.font = '12px monospace';
      CTX.fillText('Una volta, due luci...', W/2-60, H/2);
    } else {
      STORY.step = 1;
      STORY.timer = 0;
    }
  } else if(STORY.id === 'intro' && STORY.step === 1){
    if(STORY.timer < 120){
      CTX.fillStyle = hex(PAL.night);
      CTX.fillRect(0,0,W,H);
      const a = Math.min(STORY.timer/60, 1);
      CTX.fillStyle = `rgba(242,193,78,${a})`;
      CTX.font = '10px monospace';
      CTX.fillText('Milo si risveglia nel buio...', 40, H/2-10);
      CTX.fillText('Dove sei, fratello?', 40, H/2+10);
    } else {
      STORY = null;
      enterRoom('hubA', 36, 320);
      GAME.phase = 'overworld';
    }
  }
}

function drawStory(){
  if(!STORY) return;
  if(STORY.id === 'intro'){
    if(STORY.step === 0){
      const a = Math.min(STORY.timer/60, 1);
      CTX.fillStyle = `rgba(13,11,9,${1-a})`;
      CTX.fillRect(0,0,W,H);
      CTX.fillStyle = `rgba(242,193,78,${a})`;
      CTX.font = '12px monospace';
      CTX.fillText('Una volta, due luci...', W/2-60, H/2);
    } else if(STORY.step === 1){
      CTX.fillStyle = hex(PAL.night);
      CTX.fillRect(0,0,W,H);
      const a = Math.min(STORY.timer/60, 1);
      CTX.fillStyle = `rgba(242,193,78,${a})`;
      CTX.font = '10px monospace';
      CTX.fillText('Milo si risveglia nel buio...', 40, H/2-10);
      if(STORY.timer > 60){
        CTX.fillText('Dove sei, fratello?', 40, H/2+10);
      }
    }
  }
}
