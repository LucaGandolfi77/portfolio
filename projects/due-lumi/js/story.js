/* I DUE LUMI — Story / cutscene engine */
let STORY = null;

const BEATS = {
  intro: [
    { lines:['Una volta, due luci...'], dur:110 },
    { lines:['Milo si risveglia nel buio...','Dove sei, fratello?'], dur:140 }
  ],
  finale: [
    { lines:['Le due luci si ritrovarono.','E il bosco tornò a respirare.'], dur:170 }
  ],
};

function startStory(id){
  STORY = { id:id, step:0, timer:0 };
}

function storyEnd(){
  const id = STORY.id;
  STORY = null;
  if(id === 'intro'){
    enterRoom('hubA', 48, 96);
    GAME.phase = 'overworld';
  } else {
    GAME.phase = 'overworld';
    showText('', [
      'Milo strinse la mano di Tito.',
      'La luce non si era mai spenta: era solo in attesa di essere ritrovata.',
      'Fine — grazie per aver viaggiato con loro.'
    ], null);
  }
}

function updateStory(){
  if(!STORY) return;
  const beats = BEATS[STORY.id];
  if(!beats || !beats[STORY.step]){ storyEnd(); return; }
  STORY.timer++;
  if(justPressedA() || INPUT.start || INPUT.ax !== 0 || INPUT.ay !== 0){
    STORY.timer = beats[STORY.step].dur;
  }
  if(STORY.timer >= beats[STORY.step].dur){
    STORY.step++;
    STORY.timer = 0;
    if(STORY.step >= beats.length) storyEnd();
  }
}

function drawStory(){
  if(!STORY) return;
  const beat = BEATS[STORY.id] && BEATS[STORY.id][STORY.step];
  if(!beat) return;
  CTX.fillStyle = hex(PAL.night);
  CTX.fillRect(0,0,W,H);
  const a = Math.min(1, 0.45 + STORY.timer/50);
  const col = `rgba(242,193,78,${a})`;
  const y0 = beat.lines.length > 1 ? H/2-12 : H/2;
  beat.lines.forEach((line, i) => {
    if(STORY.timer < 8 + i*26) return;
    text(line, W/2, y0 + i*24, beat.lines.length > 1 ? 11 : 13, col, 'center');
  });
  text('[Z] salta', W-6, H-8, 8, hex(PAL.slate), 'right');
}
