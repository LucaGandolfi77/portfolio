/* I DUE LUMI — Overworld / esplorazione */
let curRoom = null, curZone = {};
let PLAYER = { x:0, y:0, vx:0, vy:0, life:20, maxLife:20, noxia:0, maxNoxia:20, char:'milo', moving:false, animFrame:0, animTimer:0, interactT:0 };
let STATE = { flags:{}, inventory:['miele'], memories:[], music:'hub' };

const MOVE_SPD = 1.8;
let stepTimer = 0;

function enterRoom(id, spawnX, spawnY){
  const prev = curRoom;
  curRoom = ROOMS[id];
  if(!curRoom) return;
  curZone = ZONES[curRoom.zone] || ZONES.hub;
  PLAYER.x = spawnX ?? curRoom.spawn.x;
  PLAYER.y = spawnY ?? curRoom.spawn.y;
  PLAYER.vx = 0; PLAYER.vy = 0;
  updateCam(PLAYER.x, PLAYER.y);
  if(prev?.zone !== curRoom.zone){
    startAmb(curZone.song || 'hub');
  }
}

function isSolid(wx, wy){
  const tx = Math.floor(wx/16), ty = Math.floor(wy/16);
  const ch = curRoom.map[ty]?.[tx];
  if(!ch) return true;
  return tileSolid(ch) === 1;
}

function checkExit(){
  const exits = curRoom.exits || {};
  if(PLAYER.x < 8 && exits.left){
    roomTransition = 40;
    enterRoom(exits.left.to, exits.left.x, exits.left.y);
    return true;
  }
  if(PLAYER.x > curRoom.w - 8 && exits.right){
    roomTransition = 40;
    enterRoom(exits.right.to, exits.right.x, exits.right.y);
    return true;
  }
  if(PLAYER.y < 8 && exits.up){
    roomTransition = 40;
    enterRoom(exits.up.to, exits.up.x, exits.up.y);
    return true;
  }
  if(PLAYER.y > curRoom.h - 8 && exits.down){
    roomTransition = 40;
    enterRoom(exits.down.to, exits.down.x, exits.down.y);
    return true;
  }
  return false;
}

function checkDoors(){
  curRoom.doors?.forEach(d => {
    if(STATE.flags[d.switch]) return;
    const dx = PLAYER.x - d.tx*16 - 8, dy = PLAYER.y - d.ty*16 - 8;
    if(Math.abs(dx) < 12 && Math.abs(dy) < 12){
      if(STATE.flags[d.switch]){
        roomTransition = 40;
        enterRoom(d.to, d.spawn.x, d.spawn.y);
      }
    }
  });
}

function checkSwitches(){
  curRoom.switches?.forEach(s => {
    if(STATE.flags[s.flag]) return;
    const dx = PLAYER.x - s.tx*16 - 8, dy = PLAYER.y - s.ty*16 - 8;
    if(Math.abs(dx) < 12 && Math.abs(dy) < 12){
      STATE.flags[s.flag] = true;
      sfx('switch');
      /* open associated doors */
      curRoom.doors?.forEach(d => {
        if(d.switch === s.flag){
          STATE.flags[d.switch] = true;
        }
      });
    }
  });
}

function checkMemories(){
  curRoom.mem?.forEach(m => {
    if(STATE.flags['mem'+m.id]) return;
    const dx = PLAYER.x - m.x, dy = PLAYER.y - m.y;
    if(Math.abs(dx) < 10 && Math.abs(dy) < 10){
      STATE.flags['mem'+m.id] = true;
      STATE.memories.push(m.id);
      sfx('win');
      showText('', ['Hai trovato una memoria del vento...','Il passato ti sussurra: "Ricorda..."'], null);
    }
  });
}

function checkNPCProximity(){
  curRoom.npcs?.forEach(n => {
    if(!n.active) n.active = true;
    if(PLAYER.interactT > 0) return;
    const dx = PLAYER.x - n.x, dy = PLAYER.y - n.y;
    if(Math.abs(dx) < 14 && Math.abs(dy) < 14 && INPUT.a){
      PLAYER.interactT = 30;
      interactNPC(n);
    }
  });
}

function checkEnemyProximity(){
  curRoom.enemies?.forEach(e => {
    if(!e.active) return;
    const dx = PLAYER.x - e.x, dy = PLAYER.y - e.y;
    if(Math.abs(dx) < 12 && Math.abs(dy) < 12){
      if(STATE.flags['boss_'+e.id]) return;
      if(e.id === 'lucciola'){
        PLAYER.noxia = Math.min(PLAYER.maxNoxia, PLAYER.noxia + 5);
        e.active = false;
        sfx('pick');
        return;
      }
      startBattle(e.id, null);
    }
  });
}

function updateOverworld(){
  if(TEXTUI.visible){ updateText(); return; }
  if(menuOpen){
    if(INPUT.b){ toggleMenu(); INPUT.b = false; }
    return;
  }

  if(INPUT.start){ toggleMenu(); INPUT.start = false; return; }

  const ax = INPUT.ax, ay = INPUT.ay;
  PLAYER.moving = Math.abs(ax) > 0.1 || Math.abs(ay) > 0.1;

  if(PLAYER.moving){
    let nx = PLAYER.x + ax * MOVE_SPD;
    let ny = PLAYER.y + ay * MOVE_SPD;

    /* wall slide */
    if(!isSolid(nx, PLAYER.y)) PLAYER.x = nx;
    else { nx = PLAYER.x; }

    if(!isSolid(PLAYER.x, ny)) PLAYER.y = ny;
    else { ny = PLAYER.y; }

    if(Math.abs(PLAYER.x - nx) > 0.01 || Math.abs(PLAYER.y - ny) > 0.01){
      PLAYER.x = nx; PLAYER.y = ny;
    }

    /* animation */
    PLAYER.animTimer++;
    if(PLAYER.animTimer >= 6){
      PLAYER.animTimer = 0;
      PLAYER.animFrame = (PLAYER.animFrame + 1) % 4;
    }

    /* step sound */
    stepTimer++;
    if(stepTimer >= 12){ sfx('step'); stepTimer = 0; }
  }

  updateCam(PLAYER.x, PLAYER.y);

  if(PLAYER.interactT > 0) PLAYER.interactT--;

  checkExit();
  checkDoors();
  checkSwitches();
  checkMemories();
  checkNPCProximity();
  checkEnemyProximity();
}

function drawOverworld(){
  drawRoomBg();
  drawRoom();
  drawSwitches();
  drawDoorEffects();
  drawMemory();
  drawNPCs();
  drawEnemies();
  drawPlayer();
  drawHUD();
  drawTransition();
  if(TEXTUI.visible) updateText();
}
