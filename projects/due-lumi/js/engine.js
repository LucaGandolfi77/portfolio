/* I DUE LUMI — Motore render 2D GBA-style */
const CANVAS = document.getElementById('c');
const CTX = CANVAS.getContext('2d');
const W = 240, H = 160;
CANVAS.width = W; CANVAS.height = H;
CTX.imageSmoothingEnabled = false;

function resizeCanvas(){
  const sw = window.innerWidth, sh = window.innerHeight;
  const s = Math.min(Math.floor(sw/W), Math.floor(sh/H), 4);
  CANVAS.style.width = (W*s)+'px';
  CANVAS.style.height = (H*s)+'px';
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

let cam = {x:0, y:0};
function updateCam(px, py){
  cam.x = Math.max(0, Math.min(px - W/2, curRoom.w - W));
  cam.y = Math.max(0, Math.min(py - H/2, curRoom.h - H));
}

let roomTransition = 0;
function drawRoom(){
  const fogAmt = curZone.fog || 0;
  const m = curRoom.map;
  const fogLayer = document.createElement('canvas');
  fogLayer.width = W; fogLayer.height = H;
  const fg = fogLayer.getContext('2d');

  const startX = Math.floor(cam.x/16);
  const startY = Math.floor(cam.y/16);
  const endX = Math.min(startX + Math.ceil(W/16)+2, m[0].length);
  const endY = Math.min(startY + Math.ceil(H/16)+2, m.length);

  for(let r=startY; r<endY; r++){
    for(let c=startX; c<endX; c++){
      const ch = m[r]?.[c];
      if(!ch) continue;
      const t = MAPLEGEND[ch];
      if(!t || !t.name) continue;
      const tile = TILES[t.name];
      if(tile){
        CTX.drawImage(tile, c*16 - cam.x, r*16 - cam.y);
      }
    }
  }

  if(fogAmt > 0){
    for(let i=0; i<10; i++){
      fg.fillStyle = `rgba(237,227,217,${fogAmt * 0.3 * (0.5+Math.sin(Date.now()/2000+i)*0.5)})`;
      fg.fillRect(
        Math.sin(Date.now()/3000+i*7)*W*0.6,
        Math.cos(Date.now()/4000+i*5)*H*0.6,
        80+Math.sin(Date.now()/2000+i)*40,
        30+Math.cos(Date.now()/3000+i)*20
      );
    }
    CTX.drawImage(fogLayer, 0, 0);
  }
}

function drawPlayer(){
  const f = PLAYER.moving ? PLAYER.animFrame : 0;
  const sp = PLAYER.char==='milo' ? S.pre['milo'+f] : S.pre['tito'+f];
  if(sp) CTX.drawImage(sp, PLAYER.x - cam.x - 8, PLAYER.y - cam.y - 16);
}

function drawNPCs(){
  curRoom.npcs?.forEach(n => {
    if(!n.active) return;
    const sp = S.pre[n.id+(n.animFrame||0)];
    if(sp) CTX.drawImage(sp, n.x - cam.x - 12, n.y - cam.y - 20);
  });
}

function drawEnemies(){
  curRoom.enemies?.forEach(e => {
    if(!e.active) return;
    const sp = S.pre[e.id+(e.animFrame||0)];
    if(sp) CTX.drawImage(sp, e.x - cam.x - 8, e.y - cam.y - 8);
  });
}

function drawSwitches(){
  curRoom.switches?.forEach(s => {
    if(STATE.flags[s.flag]) return;
    CTX.fillStyle = hex(PAL.gold);
    CTX.fillRect(s.tx*16 - cam.x + 4, s.ty*16 - cam.y + 4, 8, 8);
    CTX.fillStyle = hex(PAL.amber);
    CTX.fillRect(s.tx*16 - cam.x + 6, s.ty*16 - cam.y + 6, 4, 4);
  });
}

function drawDoorEffects(){
  curRoom.doors?.forEach(d => {
    if(STATE.flags[d.switch]) return;
    CTX.fillStyle = `rgba(242,193,78,${0.2+Math.sin(Date.now()/500)*0.1})`;
    CTX.fillRect(d.tx*16 - cam.x - 2, d.ty*16 - cam.y - 2, 20, 20);
  });
}

function drawMemory(){
  curRoom.mem?.forEach(m => {
    if(STATE.flags['mem'+m.id]) return;
    const a = 0.5 + Math.sin(Date.now()/400)*0.3;
    CTX.fillStyle = `rgba(242,193,78,${a})`;
    CTX.fillRect(m.x - cam.x - 4, m.y - cam.y - 4, 8, 8);
    CTX.fillStyle = `rgba(247,232,201,${a})`;
    CTX.fillRect(m.x - cam.x - 2, m.y - cam.y - 2, 4, 4);
  });
}

function drawTransition(){
  if(roomTransition > 0){
    const a = Math.min(roomTransition / 20, 1);
    CTX.fillStyle = `rgba(13,11,9,${a})`;
    CTX.fillRect(0,0,W,H);
    roomTransition--;
  }
}

let hudTimer = 0;
function drawHUD(){
  hudTimer++;
  if(hudTimer < 10) return;
  const lp = Math.max(0, PLAYER.life / PLAYER.maxLife);
  document.getElementById('lfill').style.width = (lp*100)+'%';
  document.getElementById('ltxt').textContent = PLAYER.life+'/'+PLAYER.maxLife;
  const np = Math.max(0, PLAYER.noxia / PLAYER.maxNoxia);
  document.getElementById('nfill').style.width = (np*100)+'%';
  if(STATE.flags.justPicked){
    CTX.fillStyle = hex(PAL.gold);
    CTX.font = '8px monospace';
    CTX.fillText('Oggetto ottenuto!', W/2-50, 20);
  }
}

function drawRoomBg(){
  const sky = curZone.sky || ['sky','butter'];
  const c1 = hex(sky[0]), c2 = hex(sky[1]);
  const g = CTX.createLinearGradient(0,0,0,H);
  g.addColorStop(0, c1); g.addColorStop(1, c2);
  CTX.fillStyle = g;
  CTX.fillRect(0,0,W,H);
}

let mainCanvas = document.createElement('canvas');
mainCanvas.width = W; mainCanvas.height = H;
let mainCtx = mainCanvas.getContext('2d');
mainCtx.imageSmoothingEnabled = false;
