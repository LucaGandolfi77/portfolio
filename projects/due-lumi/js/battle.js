/* I DUE LUMI — Sistema di battaglia */
let BATTLE = null;

function startBattle(enemyId, winCb){
  BATTLE = {
    enemy: enemyId,
    eLife: 30 + STATE.memories.length * 5,
    eMaxLife: 30 + STATE.memories.length * 5,
    eAtk: 5 + STATE.memories.length,
    pAtk: 4 + Math.floor(PLAYER.noxia / 5),
    turn: 'player',
    timer: 0,
    msg: '',
    msgTimer: 0,
    winCb: winCb,
    phase: 'intro',
  };
  sfx('boss');
  hideText();
}

function updateBattle(){
  if(!BATTLE) return;
  BATTLE.timer++;

  if(BATTLE.phase === 'intro'){
    if(BATTLE.timer > 60){
      BATTLE.phase = 'player';
      BATTLE.msg = 'Azione?';
    }
    return;
  }

  if(BATTLE.msgTimer > 0){
    BATTLE.msgTimer--;
    if(BATTLE.msgTimer <= 0) BATTLE.msg = '';
  }

  if(BATTLE.phase === 'player'){
    if(justPressedA()){
      /* attack */
      const dmg = BATTLE.pAtk + Math.floor(Math.random() * 3);
      BATTLE.eLife = Math.max(0, BATTLE.eLife - dmg);
      sfx('hit');
      BATTLE.msg = 'Colpisci! -'+dmg;
      BATTLE.msgTimer = 30;
      BATTLE.phase = 'enemy_wait';
      BATTLE.timer = 0;
      if(BATTLE.eLife <= 0){
        BATTLE.phase = 'win';
        BATTLE.msg = 'Vittoria!';
        BATTLE.msgTimer = 60;
      }
    }
  } else if(BATTLE.phase === 'enemy_wait'){
    if(BATTLE.timer > 40){
      BATTLE.phase = 'enemy';
    }
  } else if(BATTLE.phase === 'enemy'){
    const dmg = BATTLE.eAtk + Math.floor(Math.random() * 2);
    PLAYER.life = Math.max(0, PLAYER.life - dmg);
    sfx('hit');
    BATTLE.msg = BATTLE.enemy+' colpisce! -'+dmg;
    BATTLE.msgTimer = 30;
    BATTLE.phase = 'player';
    BATTLE.timer = 0;
    if(PLAYER.life <= 0){
      BATTLE.phase = 'lose';
      BATTLE.msg = 'Sei caduto...';
      BATTLE.msgTimer = 90;
    }
  } else if(BATTLE.phase === 'win'){
    if(BATTLE.timer > 60){
      STATE.flags['boss_'+BATTLE.enemy] = true;
      const cb = BATTLE.winCb;
      BATTLE = null;
      if(cb) cb();
    }
  } else if(BATTLE.phase === 'lose'){
    if(BATTLE.timer > 90){
      PLAYER.life = PLAYER.maxLife;
      enterRoom(curRoom.id, curRoom.spawn.x, curRoom.spawn.y);
      BATTLE = null;
    }
  }
}

function drawBattle(){
  if(!BATTLE) return;
  drawRoomBg();
  drawRoom();
  drawPlayer();

  /* enemy */
  const sp = S.pre[BATTLE.enemy + (Math.floor(Date.now()/200)%4)];
  if(sp) CTX.drawImage(sp, W/2-8, 30);

  /* bars */
  const ep = Math.max(0, BATTLE.eLife / BATTLE.eMaxLife);
  CTX.fillStyle = hex(PAL.ink);
  CTX.fillRect(W/2-30, 50, 60, 6);
  CTX.fillStyle = hex(PAL.berry);
  CTX.fillRect(W/2-30, 50, 60*ep, 6);

  const pp = Math.max(0, PLAYER.life / PLAYER.maxLife);
  CTX.fillStyle = hex(PAL.ink);
  CTX.fillRect(20, H-20, 60, 6);
  CTX.fillStyle = hex(PAL.sage);
  CTX.fillRect(20, H-20, 60*pp, 6);

  /* UI */
  CTX.fillStyle = hex(PAL.fog);
  CTX.fillRect(0, H-40, W, 40);
  CTX.fillStyle = hex(PAL.ink);
  CTX.fillRect(0, H-40, W, 1);

  CTX.fillStyle = hex(PAL.cream);
  CTX.font = '10px monospace';

  if(BATTLE.phase === 'player'){
    CTX.fillText('[Z] Attacca', 30, H-16);
  } else if(BATTLE.msg){
    CTX.fillText(BATTLE.msg, 30, H-16);
  }

  CTX.fillStyle = hex(PAL.gold);
  CTX.fillText(PLAYER.life+'/'+PLAYER.maxLife, 20, H-28);
}
