(function(){
'use strict';

var D = window.SCALPEL;
var C = D.COLORS;

/* ═══════════════ STATE ═══════════════ */
var STATE = 'title';
var save = load();
var canvas, ctx, W, H, dpr;
var ecgCanvas, ecgCtx;
var frame = 0;
var score = 0;
var combo = 1;
var comboTimer = 0;
var totalAccuracy = 0;
var accuracyCount = 0;
var timerMax = 0;
var timerLeft = 0;
var timerRunning = false;

/* surgery state */
var currentChapter = null;
var currentStepIdx = 0;
var currentTool = null;
var surgeryActive = false;
var touchData = null;
var pathPoints = [];
var tapTargets = [];
var completedTaps = 0;
var stitchSide = 0;
var drawPoints = [];
var navPos = { x:0, y:0 };
var sprayActive = false;
var sprayCoverage = 0;
var timingWindow = 0;
var timingActive = false;
var ecgPhase = 0;
var targetBpm = 80;

/* dialogue */
var dialogueQueue = [];
var dialogueActive = false;

/* particles */
var particles = [];

/* ECG */
var ecgData = [];
var ecgScroll = 0;

/* ui refs */
var $overlay, $hudScore, $hudCombo, $hudAccuracy;
var $timerFill, $dialogue, $instrBar, $accInd, $levelLabel;

/* ═══════════════ INIT ═══════════════ */
function init(){
  canvas = document.getElementById('gameCanvas');
  ctx = canvas.getContext('2d');
  ecgCanvas = document.getElementById('ecg-mini');
  ecgCtx = ecgCanvas.getContext('2d');

  $overlay = document.getElementById('overlay');
  $hudScore = document.getElementById('hud-score');
  $hudCombo = document.getElementById('hud-combo');
  $hudAccuracy = document.getElementById('hud-accuracy');
  $timerFill = document.getElementById('timer-fill');
  $dialogue = document.getElementById('dialogue');
  $instrBar = document.getElementById('instrument-bar');
  $accInd = document.getElementById('accuracy-indicator');
  $levelLabel = document.getElementById('level-label');

  resize();
  window.addEventListener('resize', resize);

  canvas.addEventListener('touchstart', onTouchStart, { passive:false });
  canvas.addEventListener('touchmove', onTouchMove, { passive:false });
  canvas.addEventListener('touchend', onTouchEnd, { passive:false });
  canvas.addEventListener('mousedown', onMouseDown);
  canvas.addEventListener('mousemove', onMouseMove);
  canvas.addEventListener('mouseup', onMouseUp);

  $dialogue.addEventListener('touchstart', onDialogueTap);
  $dialogue.addEventListener('click', onDialogueTap);

  for(var i=0;i<120;i++) ecgData.push(0);

  showTitle();
  requestAnimationFrame(loop);
}

function resize(){
  dpr = Math.min(window.devicePixelRatio||1, 3);
  W = window.innerWidth;
  H = window.innerHeight;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  canvas.style.width = W + 'px';
  canvas.style.height = H + 'px';
  ctx.setTransform(dpr,0,0,dpr,0,0);

  ecgCanvas.width = 100 * dpr;
  ecgCanvas.height = 40 * dpr;
  ecgCanvas.style.width = '100px';
  ecgCanvas.style.height = '40px';
  ecgCtx.setTransform(dpr,0,0,dpr,0,0);
}

/* ═══════════════ GAME LOOP ═══════════════ */
function loop(){
  frame++;
  update();
  render();
  requestAnimationFrame(loop);
}

function update(){
  /* timer */
  if(timerRunning && timerLeft > 0){
    timerLeft -= 1/60;
    if(timerLeft <= 0){ timerLeft = 0; timerRunning = false; onTimeUp(); }
    var pct = timerMax > 0 ? (timerLeft/timerMax)*100 : 0;
    $timerFill.style.width = pct+'%';
  }

  /* combo decay */
  if(comboTimer > 0){
    comboTimer -= 1/60;
    if(comboTimer <= 0){ combo = 1; updateHUD(); }
  }

  /* ECG animation */
  ecgScroll += 1.5;
  ecgPhase += 0.08;
  updateECG();

  /* particles */
  for(var i=particles.length-1;i>=0;i--){
    var p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += p.grav || 0;
    p.life -= p.decay || 0.02;
    if(p.life <= 0) particles.splice(i,1);
  }
}

/* ═══════════════ RENDER ═══════════════ */
function render(){
  ctx.clearRect(0,0,W,H);

  if(STATE === 'surgery') renderSurgery();
  renderParticles();
}

function renderSurgery(){
  if(!currentChapter) return;
  var cx = W/2, cy = H/2 - 30;

  /* surgical field background */
  var grad = ctx.createRadialGradient(cx,cy,0,cx,cy,Math.min(W,H)*0.4);
  grad.addColorStop(0, C.tissueLight);
  grad.addColorStop(0.6, C.tissue);
  grad.addColorStop(1, C.bg);
  ctx.fillStyle = grad;
  ctx.fillRect(0,0,W,H);

  /* organ rendering based on chapter */
  renderOrgan(cx, cy);

  /* active tool overlay */
  if(currentTool) renderToolOverlay(cx, cy);

  /* tap targets */
  if(tapTargets.length > 0) renderTapTargets();

  /* path for swipe tools */
  if(pathPoints.length > 0 && (currentTool === 'scalpel' || currentTool === 'forceps')) renderSwipePath();

  /* draw points for laser */
  if(drawPoints.length > 0 && currentTool === 'laser') renderDrawPath();

  /* spray area */
  if(sprayActive) renderSprayArea();

  /* timing indicator */
  if(timingActive) renderTimingIndicator(cx, cy);
}

function renderOrgan(cx, cy){
  var ch = currentChapter.id;
  ctx.save();
  ctx.globalAlpha = 0.6;

  if(ch === 1){
    /* appendix area */
    ctx.fillStyle = '#2a5a8c';
    ctx.beginPath();
    ctx.ellipse(cx, cy+20, 90, 50, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = '#c0392b';
    ctx.beginPath();
    ctx.ellipse(cx+30, cy+40, 25, 40, 0.3, 0, Math.PI*2);
    ctx.fill();
    /* inflammation glow */
    ctx.globalAlpha = 0.15 + Math.sin(frame*0.05)*0.1;
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.ellipse(cx+30, cy+40, 35, 50, 0.3, 0, Math.PI*2);
    ctx.fill();
  } else if(ch === 2){
    /* esophagus */
    ctx.fillStyle = '#2a5a8c';
    ctx.beginPath();
    ctx.moveTo(cx-30, cy-80);
    ctx.bezierCurveTo(cx-40, cy-20, cx-20, cy+40, cx-30, cy+100);
    ctx.lineTo(cx+30, cy+100);
    ctx.bezierCurveTo(cx+20, cy+40, cx+40, cy-20, cx+30, cy-80);
    ctx.closePath();
    ctx.fill();
    /* foreign body */
    ctx.globalAlpha = 0.8 + Math.sin(frame*0.1)*0.2;
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.arc(cx, cy-10, 10, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = '#f39c12';
    ctx.beginPath();
    ctx.arc(cx, cy-10, 6, 0, Math.PI*2);
    ctx.fill();
  } else if(ch === 3){
    /* heart */
    ctx.fillStyle = '#8b1a1a';
    ctx.beginPath();
    ctx.moveTo(cx, cy+40);
    ctx.bezierCurveTo(cx-80, cy-20, cx-60, cy-80, cx, cy-50);
    ctx.bezierCurveTo(cx+60, cy-80, cx+80, cy-20, cx, cy+40);
    ctx.fill();
    ctx.globalAlpha = 0.3 + Math.sin(frame*0.15)*0.2;
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.moveTo(cx, cy+40);
    ctx.bezierCurveTo(cx-80, cy-20, cx-60, cy-80, cx, cy-50);
    ctx.bezierCurveTo(cx+60, cy-80, cx+80, cy-20, cx, cy+40);
    ctx.fill();
  } else if(ch === 4){
    /* brain */
    ctx.fillStyle = '#6a4c93';
    ctx.beginPath();
    ctx.ellipse(cx, cy-10, 80, 70, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.globalAlpha = 0.4;
    ctx.strokeStyle = '#8b6fb0';
    ctx.lineWidth = 2;
    for(var i=0;i<5;i++){
      ctx.beginPath();
      ctx.arc(cx-40+i*20, cy-10+Math.sin(i)*10, 25, 0, Math.PI*2);
      ctx.stroke();
    }
    /* tumor */
    ctx.globalAlpha = 0.7 + Math.sin(frame*0.08)*0.3;
    ctx.fillStyle = '#2c3e50';
    ctx.beginPath();
    ctx.ellipse(cx+15, cy-5, 18, 15, 0.2, 0, Math.PI*2);
    ctx.fill();
  } else if(ch === 5){
    /* multiple organs */
    ctx.fillStyle = '#8b1a1a';
    ctx.beginPath();
    ctx.ellipse(cx-50, cy-20, 40, 35, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = '#2a5a8c';
    ctx.beginPath();
    ctx.ellipse(cx+50, cy+10, 35, 25, 0.3, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = '#6a4c93';
    ctx.beginPath();
    ctx.ellipse(cx, cy-50, 30, 25, 0, 0, Math.PI*2);
    ctx.fill();
    /* trauma markers */
    ctx.globalAlpha = 0.5 + Math.sin(frame*0.1)*0.3;
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath(); ctx.arc(cx-30, cy-15, 8, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx+60, cy+20, 6, 0, Math.PI*2); ctx.fill();
  }
  ctx.restore();
}

function renderToolOverlay(cx, cy){
  var inst = D.INSTRUMENTS[currentTool];
  if(!inst) return;
  ctx.save();
  ctx.globalAlpha = 0.15;
  ctx.fillStyle = inst.color;
  ctx.beginPath();
  ctx.arc(cx, cy, 120, 0, Math.PI*2);
  ctx.fill();
  ctx.restore();
}

function renderTapTargets(){
  for(var i=0;i<tapTargets.length;i++){
    var t = tapTargets[i];
    ctx.save();
    if(t.done){
      ctx.globalAlpha = 0.3;
      ctx.fillStyle = C.heal;
    } else {
      ctx.globalAlpha = 0.6 + Math.sin(frame*0.1+i)*0.2;
      ctx.fillStyle = C.warning;
    }
    ctx.beginPath();
    ctx.arc(t.x, t.y, 18, 0, Math.PI*2);
    ctx.fill();

    ctx.globalAlpha = t.done ? 0.2 : 0.8;
    ctx.strokeStyle = t.done ? C.heal : C.white;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(t.x, t.y, 22, 0, Math.PI*2);
    ctx.stroke();

    if(!t.done){
      ctx.globalAlpha = 0.5;
      ctx.strokeStyle = C.warning;
      ctx.lineWidth = 1;
      var pulse = 22 + Math.sin(frame*0.1+i)*6;
      ctx.beginPath();
      ctx.arc(t.x, t.y, pulse, 0, Math.PI*2);
      ctx.stroke();
    }
    ctx.restore();
  }
}

function renderSwipePath(){
  if(pathPoints.length < 2) return;
  ctx.save();
  ctx.strokeStyle = 'rgba(236,240,241,0.3)';
  ctx.lineWidth = 20;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.setLineDash([8, 8]);
  ctx.beginPath();
  ctx.moveTo(pathPoints[0].x, pathPoints[0].y);
  for(var i=1;i<pathPoints.length;i++) ctx.lineTo(pathPoints[i].x, pathPoints[i].y);
  ctx.stroke();
  ctx.setLineDash([]);

  /* progress along path */
  if(touchData && touchData.pathProgress > 0){
    var prog = Math.min(touchData.pathProgress, 1);
    var idx = Math.floor(prog * (pathPoints.length-1));
    ctx.strokeStyle = C.heal;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(pathPoints[0].x, pathPoints[0].y);
    for(var i=1;i<=idx;i++) ctx.lineTo(pathPoints[i].x, pathPoints[i].y);
    ctx.stroke();
  }
  ctx.restore();
}

function renderDrawPath(){
  if(drawPoints.length < 2) return;
  ctx.save();
  ctx.strokeStyle = 'rgba(231,76,60,0.6)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(drawPoints[0].x, drawPoints[0].y);
  for(var i=1;i<drawPoints.length;i++) ctx.lineTo(drawPoints[i].x, drawPoints[i].y);
  ctx.stroke();
  ctx.restore();
}

function renderSprayArea(){
  ctx.save();
  ctx.globalAlpha = 0.2;
  ctx.fillStyle = C.healLight;
  ctx.beginPath();
  ctx.arc(touchData ? touchData.x : W/2, touchData ? touchData.y : H/2, 40, 0, Math.PI*2);
  ctx.fill();
  ctx.restore();
}

function renderTimingIndicator(cx, cy){
  ctx.save();
  var barW = 200, barH = 20;
  var bx = cx - barW/2, by = cy + 100;

  ctx.fillStyle = 'rgba(10,22,40,0.8)';
  ctx.fillRect(bx-2, by-2, barW+4, barH+4);

  var progress = (frame % 60) / 60;
  var markerX = bx + progress * barW;

  ctx.fillStyle = C.blood;
  var zoneStart = bx + 0.4 * barW;
  var zoneEnd = bx + 0.6 * barW;
  ctx.fillRect(zoneStart, by, zoneEnd-zoneStart, barH);

  ctx.fillStyle = C.blue;
  ctx.fillRect(markerX-2, by-4, 4, barH+8);

  ctx.fillStyle = C.dimLight;
  ctx.font = '10px Courier New';
  ctx.textAlign = 'center';
  ctx.fillText('TAP IN THE RED ZONE', cx, by - 10);

  ctx.restore();
}

function renderParticles(){
  for(var i=0;i<particles.length;i++){
    var p = particles[i];
    ctx.save();
    ctx.globalAlpha = p.life;
    ctx.fillStyle = p.color || C.heal;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size || 3, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();
  }
}

/* ═══════════════ ECG ═══════════════ */
function updateECG(){
  ecgCtx.clearRect(0,0,100,40);
  ecgCtx.strokeStyle = C.heal;
  ecgCtx.lineWidth = 1.5;
  ecgCtx.beginPath();

  var heartRate = currentChapter ? (D.PATIENTS[currentChapter.patient]||{}).vitals.hr || 80 : 72;
  var freq = heartRate / 60;

  for(var x=0;x<100;x++){
    var idx = (x + Math.floor(ecgScroll)) % ecgData.length;
    var phase = (x/100 * Math.PI * 2 * freq) + ecgScroll * 0.05;
    var val = ecgWave(phase);
    ecgData[idx] = val;
    var y = 20 - val * 15;
    if(x === 0) ecgCtx.moveTo(x, y);
    else ecgCtx.lineTo(x, y);
  }
  ecgCtx.stroke();
}

function ecgWave(phase){
  var p = phase % (Math.PI*2);
  if(p < 0.3) return Math.sin(p/0.3 * Math.PI) * 0.3;
  if(p < 0.5) return -0.2;
  if(p < 0.7) return Math.sin((p-0.5)/0.2 * Math.PI) * 1.0;
  if(p < 0.9) return -0.3;
  return Math.sin((p-0.9)/1.3 * Math.PI) * 0.15;
}

/* ═══════════════ HUD ═══════════════ */
function updateHUD(){
  $hudScore.textContent = score + ' pts';
  $hudCombo.textContent = 'x' + combo;
  $hudCombo.className = 'hud-item' + (combo > 1 ? ' ok' : '');
  var acc = accuracyCount > 0 ? Math.round(totalAccuracy/accuracyCount) : 100;
  $hudAccuracy.textContent = acc + '%';
  $hudAccuracy.className = 'hud-item' + (acc >= 80 ? ' ok' : acc >= 50 ? '' : ' warn');
}

function showAccuracy(msg, good){
  $accInd.textContent = msg;
  $accInd.className = 'show' + (good ? '' : ' miss');
  setTimeout(function(){ $accInd.className = ''; }, 1200);
}

function spawnParticles(x, y, color, count){
  for(var i=0;i<count;i++){
    particles.push({
      x: x, y: y,
      vx: (Math.random()-0.5)*6,
      vy: (Math.random()-0.5)*6 - 2,
      grav: 0.15,
      life: 0.7 + Math.random()*0.3,
      decay: 0.015 + Math.random()*0.01,
      size: 2 + Math.random()*3,
      color: color || C.heal
    });
  }
}

/* ═══════════════ TOUCH / MOUSE ═══════════════ */
var mouseDown = false;

function onTouchStart(e){ if(e.cancelable) e.preventDefault(); handleStart(e.touches[0]); }
function onTouchMove(e){ if(e.cancelable) e.preventDefault(); handleMove(e.touches[0]); }
function onTouchEnd(e){ if(e.cancelable) e.preventDefault(); handleEnd(); }
function onMouseDown(e){ mouseDown=true; handleStart(e); }
function onMouseMove(e){ if(mouseDown) handleMove(e); }
function onMouseUp(e){ mouseDown=false; handleEnd(); }

function handleStart(e){
  if(!surgeryActive || !touchData) return;
  var rect = canvas.getBoundingClientRect();
  var x = (e.clientX || e.pageX) - rect.left;
  var y = (e.clientY || e.pageY) - rect.top;

  touchData.x = x;
  touchData.y = y;
  touchData.startX = x;
  touchData.startY = y;
  touchData.active = true;
  touchData.startTime = Date.now();

  if(touchData.type === 'tap' || touchData.type === 'stitch'){
    checkTapHit(x, y);
  } else if(touchData.type === 'timing'){
    checkTimingHit();
  } else if(touchData.type === 'spray'){
    sprayActive = true;
  } else if(touchData.type === 'draw'){
    drawPoints = [{ x:x, y:y }];
  }
}

function handleMove(e){
  if(!surgeryActive || !touchData || !touchData.active) return;
  var rect = canvas.getBoundingClientRect();
  var x = (e.clientX || e.pageX) - rect.left;
  var y = (e.clientY || e.pageY) - rect.top;

  touchData.x = x;
  touchData.y = y;

  if(touchData.type === 'swipe' || touchData.type === 'navigate'){
    updateSwipeProgress(x, y);
  } else if(touchData.type === 'draw'){
    drawPoints.push({ x:x, y:y });
  } else if(touchData.type === 'spray'){
    updateSpray(x, y);
  }
}

function handleEnd(){
  if(!surgeryActive || !touchData || !touchData.active) return;
  touchData.active = false;

  if(touchData.type === 'swipe'){
    completeSwipe();
  } else if(touchData.type === 'navigate'){
    completeNavigate();
  } else if(touchData.type === 'draw'){
    completeDraw();
  } else if(touchData.type === 'spray'){
    completeSpray();
  }
}

/* ═══════════════ SURGERY MECHANICS ═══════════════ */
function checkTapHit(x, y){
  for(var i=0;i<tapTargets.length;i++){
    var t = tapTargets[i];
    if(t.done) continue;
    var dx = x - t.x, dy = y - t.y;
    if(Math.sqrt(dx*dx+dy*dy) < 30){
      t.done = true;
      completedTaps++;
      spawnParticles(t.x, t.y, C.heal, 8);

      var acc = Math.max(50, 100 - Math.sqrt(dx*dx+dy*dy)*2);
      addAccuracy(acc);

      if(touchData.type === 'stitch'){
        stitchSide = 1 - stitchSide;
        showAccuracy(stitchSide === 0 ? '← Left' : 'Right →', true);
      } else {
        showAccuracy('+' + Math.round(acc), true);
      }

      if(completedTaps >= tapTargets.length){
        setTimeout(onStepComplete, 500);
      }
      updateHUD();
      break;
    }
  }
}

function updateSwipeProgress(x, y){
  if(!touchData || pathPoints.length < 2) return;
  var bestDist = Infinity, bestIdx = 0;
  for(var i=0;i<pathPoints.length;i++){
    var dx = x - pathPoints[i].x, dy = y - pathPoints[i].y;
    var d = dx*dx + dy*dy;
    if(d < bestDist){ bestDist = d; bestIdx = i; }
  }
  touchData.pathProgress = bestIdx / (pathPoints.length - 1);
}

function completeSwipe(){
  if(!touchData) return;
  var prog = touchData.pathProgress || 0;
  var acc = Math.min(100, Math.round(prog * 100));
  addAccuracy(acc);
  showAccuracy(acc + '%', acc >= 60);
  spawnParticles(touchData.x, touchData.y, acc >= 70 ? C.heal : C.bloodLight, 10);
  if(prog >= 0.6){
    setTimeout(onStepComplete, 400);
  } else {
    showAccuracy('Too short!', false);
    combo = 1;
    updateHUD();
  }
}

function completeNavigate(){
  if(!touchData) return;
  var acc = Math.min(100, Math.round((touchData.pathProgress || 0) * 100));
  addAccuracy(acc);
  showAccuracy('Located: ' + acc + '%', acc >= 50);
  setTimeout(onStepComplete, 400);
}

function completeDraw(){
  if(!touchData || drawPoints.length < 10) return;
  var acc = Math.min(100, Math.round(Math.random()*30 + 70));
  addAccuracy(acc);
  showAccuracy('Precision: ' + acc + '%', acc >= 70);
  spawnParticles(touchData.x, touchData.y, C.bloodLight, 15);
  setTimeout(onStepComplete, 500);
}

function updateSpray(x, y){
  sprayCoverage = Math.min(100, sprayCoverage + 2);
}

function completeSpray(){
  var acc = Math.min(100, Math.round(sprayCoverage));
  addAccuracy(acc);
  showAccuracy('Coverage: ' + acc + '%', acc >= 60);
  spawnParticles(touchData ? touchData.x : W/2, touchData ? touchData.y : H/2, C.healLight, 12);
  sprayCoverage = 0;
  sprayActive = false;
  if(acc >= 50) setTimeout(onStepComplete, 400);
}

function checkTimingHit(){
  var progress = (frame % 60) / 60;
  var inZone = progress >= 0.4 && progress <= 0.6;
  var acc = inZone ? 95 + Math.round(Math.random()*5) : 30 + Math.round(Math.random()*20);
  addAccuracy(acc);
  showAccuracy(inZone ? 'PERFECT!' : 'Miss...', inZone);
  spawnParticles(W/2, H/2, inZone ? C.heal : C.bloodLight, inZone ? 20 : 5);
  if(inZone) setTimeout(onStepComplete, 500);
}

function addAccuracy(val){
  totalAccuracy += val;
  accuracyCount++;
}

function onStepComplete(){
  currentStepIdx++;
  if(currentStepIdx >= D.PROCEDURES['chapter'+currentChapter.id].length){
    onSurgeryComplete();
  } else {
    setupStep(currentStepIdx);
  }
}

function onTimeUp(){
  showAccuracy('TIME\'S UP!', false);
  combo = 1;
  updateHUD();
  setTimeout(function(){
    onSurgeryComplete();
  }, 1000);
}

/* ═══════════════ STEP SETUP ═══════════════ */
function setupStep(idx){
  var steps = D.PROCEDURES['chapter'+currentChapter.id];
  if(idx >= steps.length) return;
  var step = steps[idx];

  currentTool = step.tool;
  surgeryActive = false;
  touchData = { type:step.type, x:0, y:0, active:false, pathProgress:0 };
  pathPoints = [];
  tapTargets = [];
  completedTaps = 0;
  stitchSide = 0;
  drawPoints = [];
  sprayCoverage = 0;
  sprayActive = false;

  $levelLabel.textContent = 'Step ' + (idx+1) + '/' + steps.length + ' — ' + step.name;
  highlightInstrument(step.tool);

  /* generate targets based on type */
  var cx = W/2, cy = H/2 - 30;
  var i, px, py, angle, r;

  if(step.type === 'tap' || step.type === 'stitch'){
    for(i=0;i<step.points;i++){
      angle = (i / step.points) * Math.PI * 2 - Math.PI/2;
      r = 60 + Math.random()*40;
      px = cx + Math.cos(angle) * r;
      py = cy + Math.sin(angle) * r;
      tapTargets.push({ x:px, y:py, done:false });
    }
  } else if(step.type === 'swipe'){
    pathPoints = generatePath(step.path, cx, cy);
  } else if(step.type === 'navigate'){
    navPos = { x:cx, y:cy-80 };
    pathPoints = generateNavPath(step.path, cx, cy);
  } else if(step.type === 'timing'){
    timingActive = true;
    targetBpm = step.target_bpm || 80;
  }

  timerMax = step.time;
  timerLeft = step.time;
  timerRunning = true;

  setTimeout(function(){ surgeryActive = true; }, 300);
  updateHUD();
}

function generatePath(type, cx, cy){
  var pts = [];
  var steps = 30;
  if(type === 'right_lower'){
    for(var i=0;i<steps;i++){
      var t = i/(steps-1);
      pts.push({ x: cx-40+t*80, y: cy+20+t*30+Math.sin(t*Math.PI)*10 });
    }
  } else if(type === 'appendix'){
    for(var i=0;i<steps;i++){
      var t = i/(steps-1);
      var angle = -Math.PI/4 + t * Math.PI/2;
      pts.push({ x: cx+30+Math.cos(angle)*25, y: cy+40+Math.sin(angle)*35 });
    }
  } else if(type === 'skull'){
    for(var i=0;i<steps;i++){
      var t = i/(steps-1);
      pts.push({ x: cx-50+t*100, y: cy-30+Math.sin(t*Math.PI)*20 });
    }
  } else if(type === 'throat'){
    for(var i=0;i<steps;i++){
      var t = i/(steps-1);
      pts.push({ x: cx, y: cy-60+t*120 });
    }
  } else if(type === 'extract'){
    for(var i=0;i<steps;i++){
      var t = i/(steps-1);
      pts.push({ x: cx+Math.sin(t*Math.PI*2)*10, y: cy-10-t*60 });
    }
  }
  return pts;
}

function generateNavPath(type, cx, cy){
  var pts = [];
  var steps = 40;
  for(var i=0;i<steps;i++){
    var t = i/(steps-1);
    pts.push({
      x: cx + Math.sin(t*6)*30,
      y: cy - 80 + t*160
    });
  }
  return pts;
}

/* ═══════════════ INSTRUMENT BAR ═══════════════ */
function buildInstrumentBar(chapterId){
  $instrBar.innerHTML = '';
  var unlocked = getUnlockedInstruments(chapterId);
  var keys = Object.keys(D.INSTRUMENTS);
  for(var i=0;i<keys.length;i++){
    var inst = D.INSTRUMENTS[keys[i]];
    var btn = document.createElement('div');
    btn.className = 'inst-btn' + (unlocked.indexOf(inst.id)===-1 ? ' locked' : '');
    btn.dataset.inst = inst.id;
    btn.innerHTML = '<span>' + inst.icon + '</span><span class="inst-label">' + inst.name + '</span>';
    btn.addEventListener('click', (function(id){ return function(){ selectInstrument(id); }; })(inst.id));
    $instrBar.appendChild(btn);
  }
}

function getUnlockedInstruments(chapterId){
  var result = [];
  var keys = Object.keys(D.INSTRUMENTS);
  for(var i=0;i<keys.length;i++){
    var inst = D.INSTRUMENTS[keys[i]];
    if(inst.chapter <= chapterId) result.push(inst.id);
  }
  return result;
}

function highlightInstrument(id){
  var btns = $instrBar.querySelectorAll('.inst-btn');
  for(var i=0;i<btns.length;i++){
    btns[i].classList.toggle('active', btns[i].dataset.inst === id);
  }
}

function selectInstrument(id){
  if(currentTool === id) return;
  currentTool = id;
  highlightInstrument(id);
}

/* ═══════════════ DIALOGUE ═══════════════ */
function showDialogue(queue, callback){
  dialogueQueue = queue.slice();
  dialogueActive = true;
  $dialogue.classList.add('show');
  nextDialogue(callback);
}

function nextDialogue(callback){
  if(dialogueQueue.length === 0){
    hideDialogue();
    if(callback) callback();
    return;
  }
  var line = dialogueQueue.shift();
  $dialogue.querySelector('.speaker').textContent = line.speaker;
  $dialogue.querySelector('.text').textContent = line.text;
  $dialogue._callback = callback;
}

function hideDialogue(){
  dialogueActive = false;
  $dialogue.classList.remove('show');
}

function onDialogueTap(e){
  e.stopPropagation();
  if(!dialogueActive) return;
  nextDialogue($dialogue._callback);
}

/* ═══════════════ OVERLAY SCREENS ═══════════════ */
function showOverlay(html){
  $overlay.innerHTML = html;
  $overlay.classList.remove('hidden');
}

function hideOverlay(){
  $overlay.classList.add('hidden');
}

function showTitle(){
  STATE = 'title';
  showOverlay(
    '<h1>SCALPEL</h1>' +
    '<h2>Surgical Stories</h2>' +
    '<div class="subtitle">Perform life-saving operations at Ospedale Miraggio. ' +
    'Master surgical instruments, save patients, and unlock the science behind medicine.</div>' +
    '<button class="menu-btn primary" id="btn-play">▶ NEW SURGEON</button>' +
    '<button class="menu-btn" id="btn-continue"' + (save ? '' : ' disabled') + '>↻ CONTINUE</button>' +
    '<button class="menu-btn" id="btn-journal">📖 MEDICAL JOURNAL</button>'
  );
  bindBtn('btn-play', function(){
    save = { chapter:1, scores:{}, journal:{}, instruments:[] };
    saveGame();
    showChapterSelect();
  });
  bindBtn('btn-continue', function(){
    if(save) showChapterSelect();
  });
  bindBtn('btn-journal', showJournal);
}

function showChapterSelect(){
  STATE = 'chapter_select';
  var html = '<h2 style="margin-bottom:16px;letter-spacing:2px">SELECT CHAPTER</h2><div id="chapter-select">';
  for(var i=0;i<D.CHAPTERS.length;i++){
    var ch = D.CHAPTERS[i];
    var unlocked = save && (i === 0 || save.chapter > i);
    var scoreVal = save && save.scores && save.scores[ch.id] ? save.scores[ch.id] : null;
    html += '<div class="ch' + (unlocked ? '' : ' locked') + '" data-ch="' + ch.id + '">' +
      '<div class="ch-icon">' + (unlocked ? ch.icon : '🔒') + '</div>' +
      '<div class="ch-info">' +
        '<div class="ch-title">Chapter ' + ch.id + ': ' + ch.title + '</div>' +
        '<div class="ch-sub">' + (unlocked ? D.PATIENTS[ch.patient].condition : 'Complete previous chapter to unlock') + '</div>' +
      '</div>' +
      '<div class="ch-status">' + (scoreVal !== null ? '⭐ ' + scoreVal : (unlocked ? '→' : '')) + '</div>' +
    '</div>';
  }
  html += '</div>';
  html += '<button class="menu-btn" id="btn-back-title" style="margin-top:16px">← Back</button>';
  showOverlay(html);

  var chs = document.querySelectorAll('.ch:not(.locked)');
  for(var i=0;i<chs.length;i++){
    chs[i].addEventListener('click', (function(id){
      return function(){ startChapter(id); };
    })(parseInt(chs[i].dataset.ch)));
  }
  bindBtn('btn-back-title', showTitle);
}

function startChapter(chId){
  var idx = chId - 1;
  if(idx < 0 || idx >= D.CHAPTERS.length) return;
  currentChapter = D.CHAPTERS[idx];
  STATE = 'briefing';
  hideOverlay();
  buildInstrumentBar(chId);
  showDialogue(currentChapter.briefing, function(){
    showPatientInfo();
  });
}

function showPatientInfo(){
  var patient = D.PATIENTS[currentChapter.patient];
  var steps = D.PROCEDURES['chapter'+currentChapter.id];
  var unlockedTools = getUnlockedInstruments(currentChapter.id);
  var toolIcons = '';
  for(var i=0;i<unlockedTools.length;i++){
    var inst = D.INSTRUMENTS[unlockedTools[i]];
    toolIcons += '<span class="pi-inst">' + inst.icon + ' ' + inst.name + '</span>';
  }

  showOverlay(
    '<div id="patient-info">' +
      '<div class="pi-header">' +
        '<div class="pi-avatar">' + patient.emoji + '</div>' +
        '<div><div class="pi-name">' + patient.name + (patient.age ? ', ' + patient.age : '') + '</div>' +
        '<div class="pi-meta">' + patient.condition + '</div></div>' +
      '</div>' +
      '<div class="pi-desc">' + patient.desc + '</div>' +
      '<div class="pi-procedure">Procedure: ' + steps.length + ' steps</div>' +
      '<div class="pi-instruments">' + toolIcons + '</div>' +
    '</div>' +
    '<button class="menu-btn primary" id="btn-start-op">🔪 BEGIN SURGERY</button>' +
    '<button class="menu-btn" id="btn-back-ch">← Back to Chapters</button>'
  );
  bindBtn('btn-start-op', beginSurgery);
  bindBtn('btn-back-ch', showChapterSelect);
}

function beginSurgery(){
  STATE = 'surgery';
  score = 0;
  combo = 1;
  comboTimer = 0;
  totalAccuracy = 0;
  accuracyCount = 0;
  currentStepIdx = 0;
  hideOverlay();
  $instrBar.style.display = 'flex';
  updateHUD();
  setupStep(0);
}

function onSurgeryComplete(){
  surgeryActive = false;
  timerRunning = false;
  timingActive = false;
  $instrBar.style.display = 'none';
  $levelLabel.textContent = '';

  var acc = accuracyCount > 0 ? Math.round(totalAccuracy / accuracyCount) : 0;
  var grade = D.getGrade(acc);
  var chScore = Math.round(acc * 10 + combo * 50);

  if(!save.scores) save.scores = {};
  var prev = save.scores[currentChapter.id] || 0;
  if(chScore > prev) save.scores[currentChapter.id] = chScore;

  if(currentChapter.id >= save.chapter) save.chapter = currentChapter.id + 1;
  saveGame();

  showResults(chScore, acc, grade);
}

function showResults(chScore, acc, grade){
  STATE = 'results';
  var journal = D.JOURNAL['chapter'+currentChapter.id];
  var journalHtml = '';
  if(journal){
    journalHtml = '<div class="journal"><h3>📖 ' + journal.title + '</h3>';
    var fact = journal.facts[Math.floor(Math.random()*journal.facts.length)];
    journalHtml += '<p>' + fact + '</p></div>';
  }

  showOverlay(
    '<div id="results-card">' +
      '<div class="grade">' + grade.emoji + ' ' + grade.grade + '</div>' +
      '<div class="score">' + chScore + ' points</div>' +
      '<div class="detail">' + grade.label + '<br>Accuracy: ' + acc + '% · Max Combo: x' + combo + '</div>' +
      journalHtml +
    '</div>' +
    '<button class="menu-btn green" id="btn-debrief">Continue Story →</button>' +
    '<button class="menu-btn" id="btn-retry">🔄 Retry Chapter</button>' +
    '<button class="menu-btn" id="btn-menu">📋 Chapter Select</button>'
  );
  bindBtn('btn-debrief', function(){
    showDialogue(currentChapter.debriefing, function(){
      showChapterSelect();
    });
  });
  bindBtn('btn-retry', function(){ startChapter(currentChapter.id); });
  bindBtn('btn-menu', showChapterSelect);
}

function showJournal(){
  STATE = 'journal';
  var html = '<h2 style="margin-bottom:16px;letter-spacing:2px">📖 MEDICAL JOURNAL</h2>';
  html += '<div id="chapter-select" style="max-height:60vh;overflow-y:auto">';
  var keys = Object.keys(D.JOURNAL);
  for(var i=0;i<keys.length;i++){
    var j = D.JOURNAL[keys[i]];
    var unlocked = save && save.journal && save.journal[keys[i]];
    html += '<div class="ch' + (unlocked ? '' : ' locked') + '">' +
      '<div class="ch-icon">📖</div>' +
      '<div class="ch-info">' +
        '<div class="ch-title">' + j.title + '</div>' +
        '<div class="ch-sub">' + (unlocked ? j.facts[0].substring(0,80)+'...' : 'Complete the chapter to unlock') + '</div>' +
      '</div></div>';
  }
  html += '</div>';
  html += '<button class="menu-btn" id="btn-back-j" style="margin-top:16px">← Back</button>';
  showOverlay(html);
  bindBtn('btn-back-j', showTitle);
}

/* ═══════════════ SAVE/LOAD ═══════════════ */
function saveGame(){
  try { localStorage.setItem('scalpel_save', JSON.stringify(save)); } catch(e){}
}
function load(){
  try {
    var s = localStorage.getItem('scalpel_save');
    return s ? JSON.parse(s) : { chapter:1, scores:{}, journal:{}, instruments:[] };
  } catch(e){ return { chapter:1, scores:{}, journal:{}, instruments:[] }; }
}

/* ═══════════════ UTILS ═══════════════ */
function bindBtn(id, fn){
  var el = document.getElementById(id);
  if(el) el.addEventListener('click', fn);
}

/* ═══════════════ BOOT ═══════════════ */
if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

})();
