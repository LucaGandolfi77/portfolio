/* I DUE LUMI — Input manette + touch + tastiera */
const INPUT = {
  up:false, down:false, left:false, right:false,
  a:false, b:false, start:false,
  ax:0, ay:0,
};

/* keyboard */
document.addEventListener('keydown', e => {
  if(e.code==='ArrowUp'||e.code==='KeyW') INPUT.up=true;
  if(e.code==='ArrowDown'||e.code==='KeyS') INPUT.down=true;
  if(e.code==='ArrowLeft'||e.code==='KeyA') INPUT.left=true;
  if(e.code==='ArrowRight'||e.code==='KeyD') INPUT.right=true;
  if(e.code==='KeyZ'||e.code==='Space') INPUT.a=true;
  if(e.code==='KeyX'||e.code==='ShiftLeft') INPUT.b=true;
  if(e.code==='Enter') INPUT.start=true;
});
document.addEventListener('keyup', e => {
  if(e.code==='ArrowUp'||e.code==='KeyW') INPUT.up=false;
  if(e.code==='ArrowDown'||e.code==='KeyS') INPUT.down=false;
  if(e.code==='ArrowLeft'||e.code==='KeyA') INPUT.left=false;
  if(e.code==='ArrowRight'||e.code==='KeyD') INPUT.right=false;
  if(e.code==='KeyZ'||e.code==='Space') INPUT.a=false;
  if(e.code==='KeyX'||e.code==='ShiftLeft') INPUT.b=false;
  if(e.code==='Enter') INPUT.start=false;
});

/* gamepad */
let gpIndex = null;
window.addEventListener('gamepadconnected', e => { gpIndex = e.gamepad.index; });
window.addEventListener('gamepaddisconnected', () => { gpIndex = null; });
function pollGamepad(){
  if(gpIndex===null) return;
  const gp = navigator.getGamepads()[gpIndex];
  if(!gp) return;
  const dead = 0.3;
  INPUT.left  = INPUT.left  || gp.axes[0] < -dead || gp.buttons[14]?.pressed;
  INPUT.right = INPUT.right || gp.axes[0] >  dead || gp.buttons[15]?.pressed;
  INPUT.up    = INPUT.up    || gp.axes[1] < -dead || gp.buttons[12]?.pressed;
  INPUT.down  = INPUT.down  || gp.axes[1] >  dead || gp.buttons[13]?.pressed;
  INPUT.a     = INPUT.a     || gp.buttons[0]?.pressed;
  INPUT.b     = INPUT.b     || gp.buttons[1]?.pressed;
  INPUT.start = INPUT.start || gp.buttons[9]?.pressed;
}

/* touch zones */
let touchA = false, touchB = false, touchStart = false;
function initTouch(){
  const cv = document.getElementById('c');
  cv.addEventListener('touchstart', onTouchStart, {passive:false});
  cv.addEventListener('touchmove', onTouchMove, {passive:false});
  cv.addEventListener('touchend', onTouchEnd, {passive:false});
  /* d-pad buttons */
  document.querySelectorAll('.dbtn').forEach(el => {
    const d = el.dataset.dir;
    el.addEventListener('touchstart', e => { e.preventDefault(); INPUT[d]=true; });
    el.addEventListener('touchend', e => { e.preventDefault(); INPUT[d]=false; });
  });
  document.querySelectorAll('.abtn').forEach(el => {
    const k = el.dataset.key;
    el.addEventListener('touchstart', e => { e.preventDefault(); INPUT[k]=true; });
    el.addEventListener('touchend', e => { e.preventDefault(); INPUT[k]=false; });
  });
}
let touchId = null;
function onTouchStart(e){
  e.preventDefault();
  const t = e.changedTouches[0];
  touchId = t.identifier;
  updateTouchDir(t);
}
function onTouchMove(e){
  e.preventDefault();
  for(const t of e.changedTouches){
    if(t.identifier===touchId) updateTouchDir(t);
  }
}
function onTouchEnd(e){
  e.preventDefault();
  for(const t of e.changedTouches){
    if(t.identifier===touchId){ touchId=null; INPUT.ax=0; INPUT.ay=0; }
  }
}
function updateTouchDir(t){
  const cv = document.getElementById('c');
  const r = cv.getBoundingClientRect();
  const cx = r.left + r.width/2, cy = r.top + r.height/2;
  const dx = t.clientX - cx, dy = t.clientY - cy;
  const dist = Math.sqrt(dx*dx+dy*dy);
  const dead = 12;
  if(dist > dead){
    INPUT.ax = dx / Math.max(dist, 40);
    INPUT.ay = dy / Math.max(dist, 40);
  } else {
    INPUT.ax = 0; INPUT.ay = 0;
  }
}

/* merge touch into INPUT */
function updateInput(){
  pollGamepad();
  INPUT.ax = 0; INPUT.ay = 0;
  if(INPUT.left) INPUT.ax = -1;
  if(INPUT.right) INPUT.ax = 1;
  if(INPUT.up) INPUT.ay = -1;
  if(INPUT.down) INPUT.ay = 1;
}

let prevA = false;
function justPressedA(){ const v = INPUT.a && !prevA; prevA = INPUT.a; return v; }
