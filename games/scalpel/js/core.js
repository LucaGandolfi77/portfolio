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

  canvas.addEventListener('touchstart', onTouchStart, { passive:true });
  canvas.addEventListener('touchmove', onTouchMove, { passive:true });
  canvas.addEventListener('touchend', onTouchEnd, { passive:true });
  canvas.addEventListener('mousedown', onMouseDown);
  canvas.addEventListener('mousemove', onMouseMove);
  canvas.addEventListener('mouseup', onMouseUp);

  $dialogue.addEventListener('touchstart', onDialogueTap);
  $dialogue.addEventListener('click', onDialogueTap);

  /* init audio on first user interaction */
  document.addEventListener('touchstart', function initAudioOnce(){
    initAudio();
    document.removeEventListener('touchstart', initAudioOnce);
  }, { once: true });
  document.addEventListener('click', function initAudioOnce(){
    initAudio();
    document.removeEventListener('click', initAudioOnce);
  }, { once: true });

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

  /* speed run timer */
  updateSpeedTimer();

  /* boss rush timer */
  if(bossRushActive){
    bossRushTimer = Date.now() - bossRushStartTime;
    var $brTimer = document.getElementById('speed-timer');
    if($brTimer) $brTimer.textContent = formatSpeedTime(bossRushTimer);
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
  if(pathPoints.length > 0 && (currentTool === 'scalpel' || currentTool === 'forceps' || currentTool === 'laser')) renderSwipePath();

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

function onTouchStart(e){ handleStart(e.touches[0]); }
function onTouchMove(e){ handleMove(e.touches[0]); }
function onTouchEnd(e){ handleEnd(); }
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
      playSound(currentTool || 'click');
      hapticTap();

      var acc = Math.max(50, 100 - Math.sqrt(dx*dx+dy*dy)*2);
      addAccuracy(acc);

      if(touchData.type === 'stitch'){
        stitchSide = 1 - stitchSide;
        showAccuracy(stitchSide === 0 ? '← Left' : 'Right →', true);
      } else {
        showAccuracy('+' + Math.round(acc), true);
      }

      if(completedTaps >= tapTargets.length){
        if(complicationActive){
          setTimeout(function(){ onComplicationComplete(true); }, 500);
        } else {
          setTimeout(onStepComplete, 500);
        }
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
  playSound(currentTool || 'scalpel');
  if(prog >= 0.6){
    hapticSuccess();
    if(complicationActive){
      setTimeout(function(){ onComplicationComplete(true); }, 400);
    } else {
      setTimeout(onStepComplete, 400);
    }
  } else {
    hapticFail();
    playFail();
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
  playSound(currentTool || 'endoscope');
  hapticSuccess();
  if(complicationActive){
    setTimeout(function(){ onComplicationComplete(true); }, 400);
  } else {
    setTimeout(onStepComplete, 400);
  }
}

function completeDraw(){
  if(!touchData || drawPoints.length < 10) return;
  var acc = Math.min(100, Math.round(Math.random()*30 + 70));
  addAccuracy(acc);
  showAccuracy('Precision: ' + acc + '%', acc >= 70);
  spawnParticles(touchData.x, touchData.y, C.bloodLight, 15);
  playSound(currentTool || 'laser');
  hapticSuccess();
  if(complicationActive){
    setTimeout(function(){ onComplicationComplete(true); }, 500);
  } else {
    setTimeout(onStepComplete, 500);
  }
}

function updateSpray(x, y){
  sprayCoverage = Math.min(100, sprayCoverage + 2);
}

function completeSpray(){
  var acc = Math.min(100, Math.round(sprayCoverage));
  addAccuracy(acc);
  showAccuracy('Coverage: ' + acc + '%', acc >= 60);
  spawnParticles(touchData ? touchData.x : W/2, touchData ? touchData.y : H/2, C.healLight, 12);
  playSound(currentTool || 'antihist');
  hapticSuccess();
  sprayCoverage = 0;
  sprayActive = false;
  if(acc >= 50){
    if(complicationActive){
      setTimeout(function(){ onComplicationComplete(true); }, 400);
    } else {
      setTimeout(onStepComplete, 400);
    }
  }
}

function checkTimingHit(){
  var progress = (frame % 60) / 60;
  var inZone = progress >= 0.4 && progress <= 0.6;
  var acc = inZone ? 95 + Math.round(Math.random()*5) : 30 + Math.round(Math.random()*20);
  addAccuracy(acc);
  showAccuracy(inZone ? 'PERFECT!' : 'Miss...', inZone);
  spawnParticles(W/2, H/2, inZone ? C.heal : C.bloodLight, inZone ? 20 : 5);
  if(inZone){
    playSound(currentTool || 'defib');
    hapticSuccess();
    if(complicationActive){
      setTimeout(function(){ onComplicationComplete(true); }, 500);
    } else {
      setTimeout(onStepComplete, 500);
    }
  }
}

function addAccuracy(val){
  var finalVal = val;
  if(hasPowerup('precision')) finalVal = Math.min(100, val * 1.2);
  totalAccuracy += finalVal;
  accuracyCount++;
}

function onStepComplete(){
  /* speed run mode uses its own step completion */
  if(speedRunActive){
    onStepCompleteSpeedRun();
    return;
  }

  /* boss rush mode uses its own step completion */
  if(bossRushActive){
    onStepCompleteBossRush();
    return;
  }

  /* alien surgery mode uses its own step completion */
  if(alienActive){
    onAlienStepComplete();
    return;
  }

  /* endless mode uses its own step completion */
  if(endlessActive){
    onEndlessStepComplete();
    return;
  }

  /* zombie outbreak mode uses its own step completion */
  if(zombieActive){
    onZombieStepComplete();
    return;
  }

  /* veterinary mode uses its own step completion */
  if(vetActive){
    onVeterinaryStepComplete(true);
    return;
  }

  currentStepIdx++;
  if(currentStepIdx >= D.PROCEDURES['chapter'+currentChapter.id].length){
    onSurgeryComplete();
  } else {
    /* try to spawn complication before next step */
    if(!complicationActive && maybeSpawnComplication()){
      /* complication spawned — don't advance step yet */
      return;
    }
    /* try random powerup on step completion */
    tryRandomPowerup();
    setupStep(currentStepIdx);
  }
}

function onTimeUp(){
  showAccuracy('TIME\'S UP!', false);
  combo = 1;
  updateHUD();
  if(complicationActive){
    setTimeout(function(){ onComplicationComplete(false); }, 1000);
  } else {
    setTimeout(function(){
      onSurgeryComplete();
    }, 1000);
  }
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
  /* apply difficulty scaling */
  var diff = D.DIFFICULTY[currentChapter.id];
  if(diff && diff.timeMod < 1){
    timerMax = Math.round(step.time * diff.timeMod);
    timerLeft = timerMax;
  }
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
  } else if(type === 'arm_cast'){
    for(var i=0;i<steps;i++){
      var t = i/(steps-1);
      pts.push({ x: cx-60+t*120, y: cy+10+Math.sin(t*Math.PI*3)*8 });
    }
  } else if(type === 'arm_wrap'){
    for(var i=0;i<steps;i++){
      var t = i/(steps-1);
      var angle = t * Math.PI * 4;
      pts.push({ x: cx+Math.cos(angle)*(30+t*20), y: cy-40+t*80+Math.sin(angle)*10 });
    }
  } else if(type === 'abdomen_c'){
    for(var i=0;i<steps;i++){
      var t = i/(steps-1);
      pts.push({ x: cx-40+t*80, y: cy+10+Math.sin(t*Math.PI)*15 });
    }
  } else if(type === 'vessels'){
    for(var i=0;i<steps;i++){
      var t = i/(steps-1);
      pts.push({ x: cx+Math.sin(t*8)*25, y: cy-80+t*160 });
    }
  } else if(type === 'womb'){
    for(var i=0;i<steps;i++){
      var t = i/(steps-1);
      pts.push({ x: cx+Math.sin(t*4)*20, y: cy-60+t*120 });
    }
  } else if(type === 'heart_vessel'){
    for(var i=0;i<steps;i++){
      var t = i/(steps-1);
      var angle = -Math.PI/3 + t*Math.PI*0.8;
      pts.push({ x: cx+Math.cos(angle)*40, y: cy-10+Math.sin(angle)*35 });
    }
  } else if(type === 'recalibrate'){
    for(var i=0;i<steps;i++){
      var t = i/(steps-1);
      pts.push({ x: cx+Math.cos(t*Math.PI*2)*50, y: cy+Math.sin(t*Math.PI*2)*50 });
    }
  } else if(type === 'burn_chest'){
    for(var i=0;i<steps;i++){
      var t = i/(steps-1);
      pts.push({ x: cx-60+t*120, y: cy-20+Math.sin(t*Math.PI*4)*10 });
    }
  } else if(type === 'graft_edge'){
    for(var i=0;i<steps;i++){
      var t = i/(steps-1);
      pts.push({ x: cx-40+Math.cos(t*Math.PI*2)*40, y: cy+Math.sin(t*Math.PI*2)*30 });
    }
  } else if(type === 'hip_joint'){
    for(var i=0;i<steps;i++){
      var t = i/(steps-1);
      var angle = -Math.PI/2 + t*Math.PI;
      pts.push({ x: cx+Math.cos(angle)*35, y: cy+Math.sin(angle)*35 });
    }
  } else if(type === 'abdomen'){
    for(var i=0;i<steps;i++){
      var t = i/(steps-1);
      pts.push({ x: cx-50+t*100, y: cy+10+Math.sin(t*Math.PI)*15 });
    }
  } else if(type === 'uterus'){
    for(var i=0;i<steps;i++){
      var t = i/(steps-1);
      pts.push({ x: cx-30+t*60, y: cy-40+Math.sin(t*Math.PI*2)*20 });
    }
  } else if(type === 'dura'){
    for(var i=0;i<steps;i++){
      var t = i/(steps-1);
      pts.push({ x: cx-40+t*80, y: cy+Math.sin(t*Math.PI*3)*10 });
    }
  } else if(type === 'chest'){
    for(var i=0;i<steps;i++){
      var t = i/(steps-1);
      pts.push({ x: cx-50+t*100, y: cy-10+Math.sin(t*Math.PI)*20 });
    }
  } else if(type === 'alien_chest'){
    for(var i=0;i<steps;i++){
      var t = i/(steps-1);
      pts.push({ x: cx-60+t*120, y: cy+Math.sin(t*Math.PI*4)*15 });
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

/* ═══════════════ COMPLICATIONS ═══════════════ */
var complicationActive = false;
var complicationData = null;
var complicationStepsDone = 0;

function maybeSpawnComplication(){
  if(!currentChapter) return false;
  var diff = D.DIFFICULTY[currentChapter.id];
  if(!diff || Math.random() > diff.compChance) return false;
  if(complicationStepsDone >= diff.compMax) return false;

  var comp = D.COMPLICATIONS[Math.floor(Math.random()*D.COMPLICATIONS.length)];
  complicationActive = true;
  complicationData = comp;
  complicationStepsDone++;

  showComplicationOverlay(comp);
  return true;
}

function showComplicationOverlay(comp){
  playComplication();
  hapticComplication();
  var html = '<div id="results-card" style="border-color:#e74c3c">' +
    '<div style="font-size:3rem;margin-bottom:8px">' + comp.icon + '</div>' +
    '<div style="font-size:1.1rem;color:#e74c3c;font-weight:700;margin-bottom:8px">' + comp.name + '</div>' +
    '<div style="font-size:.8rem;color:#bdc3c7;margin-bottom:16px">' + comp.desc + '</div>' +
    '<div style="font-size:.65rem;color:#f39c12">Penalty: -' + comp.penalty + ' pts if failed</div>' +
    '</div>';
  showOverlay(html);
  setTimeout(function(){ hideOverlay(); startComplication(comp); }, 1500);
}

function startComplication(comp){
  var cx = W/2, cy = H/2 - 30;
  surgeryActive = false;
  touchData = { type:comp.type, x:0, y:0, active:false, pathProgress:0 };
  tapTargets = [];
  completedTaps = 0;
  pathPoints = [];

  if(comp.type === 'tap'){
    for(var i=0;i<comp.points;i++){
      var angle = (i/comp.points)*Math.PI*2 - Math.PI/2;
      var r = 50 + Math.random()*30;
      tapTargets.push({ x:cx+Math.cos(angle)*r, y:cy+Math.sin(angle)*r, done:false });
    }
  } else if(comp.type === 'swipe'){
    pathPoints = generatePath(comp.path, cx, cy);
  } else if(comp.type === 'timing'){
    timingActive = true;
    targetBpm = comp.target_bpm;
  }

  timerMax = comp.time;
  timerLeft = comp.time;
  timerRunning = true;
  $levelLabel.textContent = '⚠️ COMPLICATION — ' + comp.name;
  $levelLabel.style.color = '#e74c3c';

  setTimeout(function(){ surgeryActive = true; }, 300);
}

function onComplicationComplete(success){
  var pen = complicationData ? complicationData.penalty : 15;
  complicationActive = false;
  complicationData = null;
  $levelLabel.style.color = '';
  if(!success){
    score = Math.max(0, score - pen);
    showAccuracy('-Penalty', false);
  } else {
    showAccuracy('Resolved!', true);
    spawnParticles(W/2, H/2, C.heal, 15);
  }
  updateHUD();
  /* after complication, continue to next step */
  setupStep(currentStepIdx);
}

/* ═══════════════ POWERUPS ═══════════════ */
var activePowerups = {};
var powerupTimers = {};

function activatePowerup(id){
  if(!D.POWERUPS[id]) return;
  activePowerups[id] = true;
  showPowerupToast(D.POWERUPS[id]);
  updatePowerupBar();
  if(id === 'precision'){
    powerupTimers[id] = setTimeout(function(){ deactivatePowerup(id); }, 10000);
  }
}

function deactivatePowerup(id){
  activePowerups[id] = false;
  clearTimeout(powerupTimers[id]);
  delete powerupTimers[id];
  updatePowerupBar();
}

function hasPowerup(id){ return !!activePowerups[id]; }

function updatePowerupBar(){
  var bar = document.getElementById('powerup-bar');
  if(!bar) return;
  var html = '';
  var keys = Object.keys(activePowerups);
  for(var i=0;i<keys.length;i++){
    if(!activePowerups[keys[i]]) continue;
    var pu = D.POWERUPS[keys[i]];
    html += '<div class="pu-chip" style="border-color:'+pu.color+'">'+pu.icon+' '+pu.name+'</div>';
  }
  bar.innerHTML = html;
}

function showPowerupToast(pu){
  var toast = document.createElement('div');
  toast.style.cssText = 'position:fixed;top:80px;left:50%;transform:translateX(-50%);background:rgba(10,22,40,.95);border:2px solid '+pu.color+';border-radius:12px;padding:8px 16px;z-index:100;font-size:.75rem;color:'+pu.color+';font-weight:700;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);animation:slideUp .3s ease';
  toast.textContent = pu.icon + ' ' + pu.name + ' — ' + pu.desc;
  document.body.appendChild(toast);
  setTimeout(function(){ toast.remove(); }, 2500);
}

function tryRandomPowerup(){
  if(Math.random() < 0.12){
    var keys = Object.keys(D.POWERUPS);
    var id = keys[Math.floor(Math.random()*keys.length)];
    activatePowerup(id);
  }
}

/* ═══════════════ ACHIEVEMENTS ═══════════════ */
function checkAchievements(){
  if(!save) return;
  var newAchievements = [];
  for(var i=0;i<D.ACHIEVEMENTS.length;i++){
    var ach = D.ACHIEVEMENTS[i];
    if(save.achievements && save.achievements.indexOf(ach.id) !== -1) continue;
    if(ach.condition(save)){
      if(!save.achievements) save.achievements = [];
      save.achievements.push(ach.id);
      newAchievements.push(ach);
    }
  }
  for(var i=0;i<newAchievements.length;i++){
    showAchievementToast(newAchievements[i]);
  }
  saveGame();
}

function showAchievementToast(ach){
  playFanfare();
  hapticAchievement();
  var toast = document.createElement('div');
  toast.style.cssText = 'position:fixed;top:12px;left:50%;transform:translateX(-50%);background:rgba(10,22,40,.95);border:2px solid #f39c12;border-radius:14px;padding:10px 18px;z-index:100;font-size:.75rem;color:#f39c12;font-weight:700;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);animation:slideUp .3s ease;text-align:center;max-width:300px';
  toast.innerHTML = '<div style="font-size:1.2rem;margin-bottom:4px">' + ach.icon + '</div>' +
    '<div style="color:#ecf0f1;margin-bottom:2px">Achievement Unlocked!</div>' +
    '<div>' + ach.name + '</div>';
  document.body.appendChild(toast);
  setTimeout(function(){ toast.remove(); }, 3500);
}

/* ═══════════════ SAVE STATS ═══════════════ */
function updateSaveStats(){
  if(!save) return;
  if(!save.perfectSteps) save.perfectSteps = 0;
  if(!save.maxCombo) save.maxCombo = 0;
  if(!save.speedClears) save.speedClears = 0;
  if(!save.noCompChapters) save.noCompChapters = 0;
  if(combo > save.maxCombo) save.maxCombo = combo;
  var acc = accuracyCount > 0 ? Math.round(totalAccuracy/accuracyCount) : 0;
  if(acc === 100) save.perfectSteps++;
  var grade = D.getGrade(acc);
  if(!save.scores) save.scores = {};
  save.scores[currentChapter.id] = { score:Math.round(acc*10+combo*50), grade:grade.grade };

  /* check all S rank */
  var allS = true;
  for(var i=1;i<=19;i++){
    if(!save.scores[i] || save.scores[i].grade !== 'S') allS = false;
  }
  save.allSRank = allS;
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
    '<div class="menu-section">' +
      '<div class="menu-section-title">📖 STORY MODE</div>' +
      '<button class="menu-btn primary" id="btn-play">▶ NEW SURGEON</button>' +
      '<button class="menu-btn" id="btn-continue"' + (save ? '' : ' disabled') + '>↻ CONTINUE</button>' +
      '<button class="menu-btn" id="btn-daily">📅 DAILY SURGERY</button>' +
      '<button class="menu-btn" id="btn-journal">📖 MEDICAL JOURNAL</button>' +
    '</div>' +
    '<div class="menu-section">' +
      '<div class="menu-section-title">⚡ CHALLENGE MODE</div>' +
      '<button class="menu-btn" id="btn-speed">⚡ SPEED RUN</button>' +
      '<button class="menu-btn" id="btn-bossrush">💀 BOSS RUSH</button>' +
      '<button class="menu-btn" id="btn-endless"' + (isEndlessUnlocked() ? '' : ' disabled') + '>♾️ ENDLESS MODE</button>' +
      '<button class="menu-btn" id="btn-zombie"' + (isZombieUnlocked() ? '' : ' disabled') + ' style="border-color:#e74c3c;color:#e74c3c">🧟 ZOMBIE OUTBREAK</button>' +
      '<button class="menu-btn" id="btn-alien"' + (isAlienUnlocked() ? '' : ' disabled') + ' style="border-color:#2ecc71;color:#2ecc71">👽 ALIEN SURGERY</button>' +
      '<button class="menu-btn" id="btn-pandemic" style="border-color:#e74c3c;color:#e74c3c">🌍 PANDEMIC</button>' +
    '</div>' +
    '<div class="menu-section">' +
      '<div class="menu-section-title">🧪 PRACTICE & LEARN</div>' +
      '<button class="menu-btn" id="btn-sandbox">🧪 SANDBOX</button>' +
      '<button class="menu-btn" id="btn-veterinary" style="border-color:#27ae60;color:#27ae60">🐕 VETERINARY</button>' +
      '<button class="menu-btn" id="btn-anatomy" style="border-color:#3498db40">🫀 ANATOMY VIEWER</button>' +
      '<button class="menu-btn" id="btn-tutorial" style="border-color:#f39c12;color:#f39c12">🎓 TUTORIAL</button>' +
    '</div>' +
    '<button class="menu-btn" id="btn-sound-toggle" style="font-size:1.2rem;width:auto;padding:8px 16px">' + (soundEnabled ? '🔊' : '🔇') + '</button>'
  );
  setupAlienEasterEgg();
  bindBtn('btn-play', function(){
    playClick();
    save = { chapter:1, scores:{}, journal:{}, instruments:[] };
    saveGame();
    showChapterSelect();
  });
  bindBtn('btn-continue', function(){
    playClick();
    if(save) showChapterSelect();
  });
  bindBtn('btn-speed', function(){ playClick(); showSpeedRun(); });
  bindBtn('btn-bossrush', function(){ playClick(); showBossRush(); });
  bindBtn('btn-endless', function(){ playClick(); showEndlessMode(); });
  bindBtn('btn-zombie', function(){ playClick(); showZombieMode(); });
  bindBtn('btn-alien', function(){ playClick(); showAlienChapter(); });
  bindBtn('btn-daily', function(){ playClick(); showDaily(); });
  bindBtn('btn-sandbox', function(){ playClick(); showSandbox(); });
  bindBtn('btn-journal', function(){ playClick(); showJournal(); });
  bindBtn('btn-anatomy', function(){ playClick(); showAnatomyViewer(); });
  bindBtn('btn-pandemic', function(){ playClick(); showPandemicMode(); });
  bindBtn('btn-veterinary', function(){ playClick(); showVeterinaryMode(); });
  bindBtn('btn-tutorial', function(){ playClick(); showTutorial(); });
  bindBtn('btn-sound-toggle', function(){ toggleSound(); });
}

function showChapterSelect(){
  STATE = 'chapter_select';
  var html = '<h2 style="margin-bottom:16px;letter-spacing:2px">SELECT CHAPTER</h2><div id="chapter-select">';
  for(var i=0;i<D.CHAPTERS.length;i++){
    var ch = D.CHAPTERS[i];
    /* skip alien chapter in normal loop */
    if(ch.isAlien) continue;
    var unlocked = save && (i === 0 || save.chapter > i);
    var scoreVal = save && save.scores && save.scores[ch.id] ? save.scores[ch.id] : null;
    var scoreDisplay = '';
    if(scoreVal !== null){
      if(typeof scoreVal === 'object'){
        scoreDisplay = scoreVal.grade + ' ' + (scoreVal.score || 0) + 'pts';
      } else {
        scoreDisplay = '⭐ ' + scoreVal;
      }
    }
    html += '<div class="ch' + (unlocked ? '' : ' locked') + '" data-ch="' + ch.id + '">' +
      '<div class="ch-icon">' + (unlocked ? ch.icon : '🔒') + '</div>' +
      '<div class="ch-info">' +
        '<div class="ch-title">Chapter ' + ch.id + ': ' + ch.title + '</div>' +
        '<div class="ch-sub">' + (unlocked ? D.PATIENTS[ch.patient].condition : 'Complete previous chapter to unlock') + '</div>' +
      '</div>' +
      '<div class="ch-status">' + (scoreDisplay || (unlocked ? '→' : '')) + '</div>' +
    '</div>';
  }
  /* alien chapter */
  if(isAlienUnlocked()){
    var alienCh = D.CHAPTERS[10];
    var alienScore = save && save.scores && save.scores['ch11'] ? save.scores['ch11'] : null;
    var alienScoreDisplay = '';
    if(alienScore !== null){
      if(typeof alienScore === 'object'){
        alienScoreDisplay = alienScore.grade + ' ' + (alienScore.score || 0) + 'pts';
      }
    }
    html += '<div class="ch" data-ch="11" style="border-color:#2ecc7140">' +
      '<div class="ch-icon" style="color:#2ecc71">👽</div>' +
      '<div class="ch-info">' +
        '<div class="ch-title" style="color:#2ecc71">Chapter 11: ' + alienCh.title + '</div>' +
        '<div class="ch-sub" style="color:#2ecc71">ALIEN SURGERY — SECRET CHAPTER</div>' +
      '</div>' +
      '<div class="ch-status">' + (alienScoreDisplay || '→') + '</div>' +
    '</div>';
  }
  html += '</div>';
  html += '<button class="menu-btn" id="btn-back-title" style="margin-top:16px">← Back</button>';
  showOverlay(html);

  var chs = document.querySelectorAll('.ch:not(.locked)');
  for(var i=0;i<chs.length;i++){
    chs[i].addEventListener('click', (function(id){
      return function(){
        if(id === 11){
          showAlienChapter();
        } else {
          startChapter(id);
        }
      };
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
  complicationStepsDone = 0;
  complicationActive = false;
  complicationData = null;
  activePowerups = {};
  hideOverlay();
  $instrBar.style.display = 'flex';
  $levelLabel.style.color = '';
  updatePowerupBar();
  updateHUD();
  setupStep(0);
}

function onSurgeryComplete(){
  surgeryActive = false;
  timerRunning = false;
  timingActive = false;
  complicationActive = false;
  $instrBar.style.display = 'none';
  $levelLabel.textContent = '';
  $levelLabel.style.color = '';

  var acc = accuracyCount > 0 ? Math.round(totalAccuracy / accuracyCount) : 0;
  var grade = D.getGrade(acc);
  var chScore = Math.round(acc * 10 + combo * 50);

  if(!save.scores) save.scores = {};
  var prev = save.scores[currentChapter.id];
  var prevScore = (typeof prev === 'object' && prev !== null) ? (prev.score || 0) : (prev || 0);
  if(chScore > prevScore) save.scores[currentChapter.id] = chScore;

  if(currentChapter.id >= save.chapter) save.chapter = currentChapter.id + 1;

  /* check for speed clear */
  if(timerLeft > timerMax * 0.5){
    if(!save.speedClears) save.speedClears = 0;
    save.speedClears++;
  }

  /* unlock journal */
  if(!save.journal) save.journal = {};
  save.journal['chapter'+currentChapter.id] = true;

  /* count journal entries */
  var jCount = 0;
  var jKeys = Object.keys(save.journal);
  for(var i=0;i<jKeys.length;i++) if(save.journal[jKeys[i]]) jCount++;
  save.journalUnlocked = jCount;

  /* update stats */
  updateSaveStats();

  /* check achievements */
  checkAchievements();

  /* save daily score if daily mode */
  if(currentChapter.id === 99){
    saveDailyScore(chScore, acc, combo);
  }

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
    hideOverlay();
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

/* ═══════════════ AUDIO SYSTEM ═══════════════ */
var audioCtx = null;
var soundEnabled = true;
var hapticEnabled = true;

function initAudio(){
  try {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  } catch(e){ audioCtx = null; }
}

function playSound(name){
  if(!soundEnabled || !audioCtx) return;
  var snd = D.SOUNDS[name];
  if(!snd) return;

  /* resume context if suspended (autoplay policy) */
  if(audioCtx.state === 'suspended') audioCtx.resume();

  var osc = audioCtx.createOscillator();
  var gain = audioCtx.createGain();

  osc.type = snd.type || 'sine';
  osc.frequency.setValueAtTime(snd.freq, audioCtx.currentTime);
  /* slight frequency sweep for more organic sound */
  osc.frequency.exponentialRampToValueAtTime(snd.freq * 0.8, audioCtx.currentTime + snd.dur);

  gain.gain.setValueAtTime(snd.vol || 0.1, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + snd.dur);

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start(audioCtx.currentTime);
  osc.stop(audioCtx.currentTime + snd.dur + 0.05);
}

function playSuccess(){ playSound('hit'); }
function playFail(){ playSound('miss'); }
function playAlert(){ playSound('alert'); }
function playComplication(){ playSound('complication'); }
function playFanfare(){ playSound('fanfare'); }
function playHeartbeat(){ playSound('heartbeat'); }
function playClick(){ playSound('click'); }

function haptic(pattern){
  if(!hapticEnabled || !navigator.vibrate) return;
  navigator.vibrate(pattern);
}

function hapticTap(){ haptic(10); }
function hapticSuccess(){ haptic([20, 30, 20]); }
function hapticFail(){ haptic([50, 50, 50]); }
function hapticComplication(){ haptic([100, 50, 100]); }
function hapticAchievement(){ haptic([30, 50, 30, 50, 30]); }

function toggleSound(){
  soundEnabled = !soundEnabled;
  var btn = document.getElementById('sound-toggle');
  if(btn) btn.textContent = soundEnabled ? '🔊' : '🔇';
  if(soundEnabled) playClick();
}

function toggleHaptic(){
  hapticEnabled = !hapticEnabled;
}

/* ═══════════════ DAILY SURGERY ═══════════════ */
var dailySeed = 0;
var dailyScore = 0;
var dailyBest = null;
var dailyTimer = 0;
var dailyTimerRunning = false;

function getDailySeed(){
  var d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth()+1) * 100 + d.getDate();
}

function seededRandom(seed){
  var x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function generateDailyProcedure(){
  var seed = getDailySeed();
  var pool = D.DAILY_STEP_POOL.slice();
  var steps = [];
  var count = 5 + Math.floor(seededRandom(seed) * 3); /* 5-7 steps */

  for(var i=0;i<count;i++){
    var idx = Math.floor(seededRandom(seed + i * 137) * pool.length);
    var step = JSON.parse(JSON.stringify(pool[idx]));
    step.id = 'daily_' + i;
    /* pick a random tool from available tools for this type */
    var tools = D.DAILY_TOOLS.filter(function(t){
      return D.INSTRUMENTS[t] && D.INSTRUMENTS[t].chapter <= 10;
    });
    step.tool = tools[Math.floor(seededRandom(seed + i * 251) * tools.length)];
    steps.push(step);
  }
  return steps;
}

function showDaily(){
  STATE = 'daily';
  var seed = getDailySeed();
  var todayKey = 'scalpel_daily_' + seed;
  var bestToday = null;
  try { bestToday = JSON.parse(localStorage.getItem(todayKey)); } catch(e){}

  /* time until midnight */
  var now = new Date();
  var midnight = new Date(now);
  midnight.setHours(24,0,0,0);
  var hoursLeft = Math.floor((midnight - now) / 3600000);
  var minsLeft = Math.floor(((midnight - now) % 3600000) / 60000);

  var html = '<h2 style="margin-bottom:8px;letter-spacing:2px">📅 DAILY SURGERY</h2>' +
    '<div class="subtitle" style="font-size:.7rem;color:#8a9bb5;margin-bottom:16px">Same surgery for everyone. New challenge every day.</div>' +
    '<div id="results-card" style="text-align:center">' +
      '<div style="font-size:2rem;margin-bottom:8px">🏥</div>' +
      '<div style="font-size:.85rem;color:#3498db;font-weight:700;margin-bottom:12px">Daily Procedure #' + seed + '</div>' +
      (bestToday ?
        '<div style="font-size:.75rem;color:#27ae60;margin-bottom:8px">🏆 Best Today: ' + bestToday.score + ' pts (' + bestToday.grade + ')</div>' :
        '<div style="font-size:.75rem;color:#5a6a80;margin-bottom:8px">No record yet today</div>') +
      '<div style="font-size:.65rem;color:#f39c12">Resets in ' + hoursLeft + 'h ' + minsLeft + 'm</div>' +
    '</div>' +
    '<button class="menu-btn primary" id="btn-play-daily">⚡ PLAY DAILY</button>' +
    '<button class="menu-btn" id="btn-daily-leaderboard">🏆 Leaderboard</button>' +
    '<button class="menu-btn" id="btn-back-daily">← Back</button>';
  showOverlay(html);
  bindBtn('btn-play-daily', startDaily);
  bindBtn('btn-daily-leaderboard', showLeaderboard);
  bindBtn('btn-back-daily', showTitle);
}

function startDaily(){
  STATE = 'surgery';
  currentChapter = { id:99, title:'Daily Surgery', patient:'marco', briefing:[], debriefing:[] };
  score = 0;
  combo = 1;
  comboTimer = 0;
  totalAccuracy = 0;
  accuracyCount = 0;
  currentStepIdx = 0;
  complicationStepsDone = 0;
  complicationActive = false;
  complicationData = null;
  activePowerups = {};

  /* generate daily procedure */
  if(!D.PROCEDURES.daily) D.PROCEDURES.daily = generateDailyProcedure();
  $instrBar.style.display = 'flex';
  $levelLabel.style.color = '';
  updatePowerupBar();
  updateHUD();
  hideOverlay();
  buildInstrumentBar(10);
  setupStep(0);
}

function showLeaderboard(){
  var seed = getDailySeed();
  var key = 'scalpel_daily_' + seed;
  var scores = [];
  try { scores = JSON.parse(localStorage.getItem('scalpel_leaderboard_' + seed)) || []; } catch(e){}

  var html = '<h2 style="margin-bottom:16px;letter-spacing:2px">🏆 LEADERBOARD</h2>' +
    '<div id="chapter-select" style="max-height:50vh;overflow-y:auto">';

  if(scores.length === 0){
    html += '<div class="ch"><div class="ch-info"><div class="ch-title" style="color:#5a6a80">No scores yet today</div></div></div>';
  } else {
    scores.sort(function(a,b){ return b.score - a.score; });
    var show = scores.slice(0, 10);
    for(var i=0;i<show.length;i++){
      var s = show[i];
      var medal = i===0?'🥇':i===1?'🥈':i===2?'🥉':'#' + (i+1);
      html += '<div class="ch">' +
        '<div class="ch-icon">' + medal + '</div>' +
        '<div class="ch-info">' +
          '<div class="ch-title">' + s.score + ' pts — ' + s.grade + '</div>' +
          '<div class="ch-sub">Accuracy: ' + s.acc + '% · Combo: x' + s.combo + '</div>' +
        '</div></div>';
    }
  }
  html += '</div>';
  html += '<button class="menu-btn" id="btn-back-lb" style="margin-top:16px">← Back</button>';
  showOverlay(html);
  bindBtn('btn-back-lb', showDaily);
}

function saveDailyScore(dailyScore, dailyAcc, dailyCombo){
  var seed = getDailySeed();
  var grade = D.getGrade(dailyAcc);
  var key = 'scalpel_daily_' + seed;
  var lbKey = 'scalpel_leaderboard_' + seed;

  /* save personal best */
  var best = null;
  try { best = JSON.parse(localStorage.getItem(key)); } catch(e){}
  if(!best || dailyScore > best.score){
    best = { score:dailyScore, grade:grade.grade, acc:dailyAcc, combo:dailyCombo };
    try { localStorage.setItem(key, JSON.stringify(best)); } catch(e){}
  }

  /* save to leaderboard */
  var lb = [];
  try { lb = JSON.parse(localStorage.getItem(lbKey)) || []; } catch(e){}
  lb.push({ score:dailyScore, grade:grade.grade, acc:dailyAcc, combo:dailyCombo, ts:Date.now() });
  try { localStorage.setItem(lbKey, JSON.stringify(lb)); } catch(e){}
}

/* ═══════════════ SANDBOX MODE ═══════════════ */
var sandboxOrgan = null;
var sandboxTool = null;

function showSandbox(){
  STATE = 'sandbox_select';
  var html = '<h2 style="margin-bottom:8px;letter-spacing:2px">🧪 SANDBOX</h2>' +
    '<div class="subtitle" style="font-size:.7rem;color:#8a9bb5;margin-bottom:16px">Free play — all instruments unlocked, no timer, no pressure. Practice freely.</div>' +
    '<div id="chapter-select" style="max-height:55vh;overflow-y:auto">';

  for(var i=0;i<D.SANDBOX_ORGANS.length;i++){
    var organ = D.SANDBOX_ORGANS[i];
    html += '<div class="ch" data-organ="' + organ.id + '">' +
      '<div class="ch-icon">' + organ.emoji + '</div>' +
      '<div class="ch-info">' +
        '<div class="ch-title">' + organ.name + '</div>' +
        '<div class="ch-sub">' + organ.tools.length + ' instruments available</div>' +
      '</div>' +
      '<div class="ch-status">→</div>' +
    '</div>';
  }
  html += '</div>';
  html += '<button class="menu-btn" id="btn-back-sb" style="margin-top:16px">← Back</button>';
  showOverlay(html);

  var chs = document.querySelectorAll('.ch[data-organ]');
  for(var i=0;i<chs.length;i++){
    chs[i].addEventListener('click', (function(id){
      return function(){ startSandbox(id); };
    })(chs[i].dataset.organ));
  }
  bindBtn('btn-back-sb', showTitle);
}

function startSandbox(organId){
  var organ = null;
  for(var i=0;i<D.SANDBOX_ORGANS.length;i++){
    if(D.SANDBOX_ORGANS[i].id === organId){ organ = D.SANDBOX_ORGANS[i]; break; }
  }
  if(!organ) return;

  STATE = 'sandbox';
  sandboxOrgan = organ;
  sandboxTool = organ.tools[0];

  /* create sandbox procedure from organ's tools */
  var steps = [];
  var toolList = organ.tools;
  for(var i=0;i<6;i++){
    var tool = toolList[i % toolList.length];
    var inst = D.INSTRUMENTS[tool];
    var stepType = 'tap';
    if(tool === 'scalpel' || tool === 'bonesaw') stepType = 'swipe';
    else if(tool === 'sutures') stepType = 'stitch';
    else if(tool === 'defib' || tool === 'hyperbaric' || tool === 'fetalmon') stepType = 'timing';
    else if(tool === 'laser') stepType = 'draw';
    else if(tool === 'endoscope' || tool === 'ultrasound') stepType = 'navigate';
    else if(tool === 'antihist' || tool === 'hyperbaric') stepType = 'spray';

    steps.push({
      id:'sb_' + i,
      type:stepType,
      tool:tool,
      name:inst.name + ' Practice',
      points: stepType === 'tap' ? 3 : (stepType === 'stitch' ? 6 : undefined),
      path: stepType === 'swipe' ? 'right_lower' : (stepType === 'draw' ? 'tumor' : undefined),
      target_bpm: stepType === 'timing' ? 100 : undefined,
      time: 999,
      accuracy: 50,
      desc: inst.desc
    });
  }
  D.PROCEDURES.sandbox = steps;

  score = 0;
  combo = 1;
  comboTimer = 0;
  totalAccuracy = 0;
  accuracyCount = 0;
  currentStepIdx = 0;
  complicationStepsDone = 0;
  complicationActive = false;
  complicationData = null;
  activePowerups = {};
  timerRunning = false;
  timerLeft = 999;
  timerMax = 999;

  $instrBar.style.display = 'flex';
  $levelLabel.style.color = '';
  $levelLabel.textContent = '🧪 SANDBOX — ' + organ.name;
  updatePowerupBar();
  updateHUD();
  hideOverlay();
  buildInstrumentBar(10);
  setupStep(0);
}

/* ═══════════════ SPEED RUN MODE ═══════════════ */
var speedRunActive = false;
var speedTimer = 0;
var speedStartTime = 0;
var speedSplits = [];
var speedBest = null;
var speedChapterId = 0;

function showSpeedRun(){
  STATE = 'speed_select';
  var html = '<h2 style="margin-bottom:8px;letter-spacing:2px">⚡ SPEED RUN</h2>' +
    '<div class="subtitle" style="font-size:.7rem;color:#8a9bb5;margin-bottom:16px">Race against the clock. Complete operations as fast as possible. No complications. Pure speed.</div>' +
    '<div id="chapter-select" style="max-height:55vh;overflow-y:auto">';

  for(var i=0;i<D.CHAPTERS.length;i++){
    var ch = D.CHAPTERS[i];
    var unlocked = save && (i === 0 || save.chapter > i);
    var bestKey = 'scalpel_speed_ch' + ch.id;
    var best = null;
    try { best = JSON.parse(localStorage.getItem(bestKey)); } catch(e){}
    var bestDisplay = best ? formatSpeedTime(best.best) : '—';

    html += '<div class="ch' + (unlocked ? '' : ' locked') + '" data-ch="' + ch.id + '">' +
      '<div class="ch-icon">⚡</div>' +
      '<div class="ch-info">' +
        '<div class="ch-title">Chapter ' + ch.id + ': ' + ch.title + '</div>' +
        '<div class="ch-sub">' + (unlocked ? D.PATIENTS[ch.patient].condition : 'Unlock in story mode first') + '</div>' +
      '</div>' +
      '<div class="ch-status" style="font-size:.65rem;color:#f39c12">' + bestDisplay + '</div>' +
    '</div>';
  }
  html += '</div>';
  html += '<button class="menu-btn" id="btn-back-sr" style="margin-top:16px">← Back</button>';
  showOverlay(html);

  var chs = document.querySelectorAll('.ch:not(.locked)');
  for(var i=0;i<chs.length;i++){
    chs[i].addEventListener('click', (function(id){
      return function(){ startSpeedRun(id); };
    })(parseInt(chs[i].dataset.ch)));
  }
  bindBtn('btn-back-sr', showTitle);
}

function startSpeedRun(chId){
  STATE = 'surgery';
  speedRunActive = true;
  speedChapterId = chId;
  speedTimer = 0;
  speedSplits = [];
  speedStartTime = Date.now();

  currentChapter = D.CHAPTERS[chId - 1];
  score = 0;
  combo = 1;
  comboTimer = 0;
  totalAccuracy = 0;
  accuracyCount = 0;
  currentStepIdx = 0;
  complicationStepsDone = 0;
  complicationActive = false;
  complicationData = null;
  activePowerups = {};
  timerRunning = false;

  /* load best time */
  speedBest = null;
  try { speedBest = JSON.parse(localStorage.getItem('scalpel_speed_ch' + chId)); } catch(e){}

  /* show speed timer */
  var $speedTimer = document.getElementById('speed-timer');
  var $speedSplit = document.getElementById('speed-split');
  var $speedBest = document.getElementById('speed-best');
  if($speedTimer) $speedTimer.classList.add('show');
  if($speedSplit) $speedSplit.classList.add('show');
  if($speedBest){
    $speedBest.classList.add('show');
    $speedBest.textContent = 'Best: ' + (speedBest ? formatSpeedTime(speedBest.best) : '—');
  }

  $instrBar.style.display = 'flex';
  $levelLabel.style.color = '#f39c12';
  $levelLabel.textContent = '⚡ SPEED RUN';
  updatePowerupBar();
  updateHUD();
  hideOverlay();
  buildInstrumentBar(chId);
  setupStep(0);
}

function updateSpeedTimer(){
  if(!speedRunActive) return;
  speedTimer = Date.now() - speedStartTime;

  /* update HUD timer */
  var $timerLabel = document.getElementById('speed-timer');
  if($timerLabel) $timerLabel.textContent = formatSpeedTime(speedTimer);

  /* update current split */
  var $splitLabel = document.getElementById('speed-split');
  if($splitLabel){
    var splitTime = speedTimer - speedSplits.reduce(function(a,b){return a+b;},0);
    $splitLabel.textContent = formatSpeedTime(splitTime);
  }
}

function formatSpeedTime(ms){
  var totalSec = ms / 1000;
  var min = Math.floor(totalSec / 60);
  var sec = totalSec % 60;
  return (min < 10 ? '0' : '') + min + ':' + (sec < 10 ? '0' : '') + sec.toFixed(2);
}

function getSpeedBonus(timeMs){
  var secs = timeMs / 1000;
  for(var i=0;i<D.SPEED_BONUS.length;i++){
    if(secs < D.SPEED_BONUS[i].maxSec) return D.SPEED_BONUS[i];
  }
  return D.SPEED_BONUS[D.SPEED_BONUS.length-1];
}

/* ═══════════════ SPEED RUN: STEP COMPLETION ═══════════════ */
var onStepCompleteOrig = null;

function onStepCompleteSpeedRun(){
  /* record split */
  var splitTime = speedTimer - speedSplits.reduce(function(a,b){return a+b;},0);
  speedSplits.push(splitTime);

  currentStepIdx++;
  if(currentStepIdx >= D.PROCEDURES['chapter'+currentChapter.id].length){
    onSpeedRunComplete();
  } else {
    setupStep(currentStepIdx);
  }
}

function onSpeedRunComplete(){
  speedRunActive = false;
  surgeryActive = false;
  timerRunning = false;
  timingActive = false;
  complicationActive = false;
  $instrBar.style.display = 'none';
  $levelLabel.textContent = '';
  $levelLabel.style.color = '';

  /* hide speed timer */
  var $speedTimer = document.getElementById('speed-timer');
  var $speedSplit = document.getElementById('speed-split');
  var $speedBest = document.getElementById('speed-best');
  if($speedTimer) $speedTimer.classList.remove('show');
  if($speedSplit) $speedSplit.classList.remove('show');
  if($speedBest) $speedBest.classList.remove('show');

  var totalTime = speedTimer;
  var acc = accuracyCount > 0 ? Math.round(totalAccuracy / accuracyCount) : 0;
  var grade = D.getGrade(acc);
  var speedInfo = getSpeedBonus(totalTime);
  var baseScore = Math.round(acc * 10 + combo * 50);
  var chScore = Math.round(baseScore * speedInfo.bonus);

  saveSpeedRun(speedChapterId, totalTime, speedSplits);
  showSpeedResults(totalTime, acc, grade, speedInfo, chScore, speedSplits);
}

function saveSpeedRun(chId, time, splits){
  var key = 'scalpel_speed_ch' + chId;
  var best = null;
  try { best = JSON.parse(localStorage.getItem(key)); } catch(e){}
  if(!best || time < best.best){
    best = { best:time, splits:splits };
    try { localStorage.setItem(key, JSON.stringify(best)); } catch(e){}
  }
}

function showSpeedResults(totalTime, acc, grade, speedInfo, chScore, splits){
  STATE = 'results';
  var splitHtml = '';
  for(var i=0;i<splits.length;i++){
    var isPB = speedBest && speedBest.splits && splits[i] < speedBest.splits[i];
    splitHtml += '<div style="display:flex;justify-content:space-between;font-size:.7rem;color:' + (isPB ? '#27ae60' : '#bdc3c7') + '">' +
      '<span>Step ' + (i+1) + '</span>' +
      '<span>' + formatSpeedTime(splits[i]) + (isPB ? ' ← PB!' : '') + '</span>' +
    '</div>';
  }

  var bestDisplay = speedBest ? formatSpeedTime(speedBest.best) : '—';
  var newRecord = !speedBest || totalTime < speedBest.best;

  showOverlay(
    '<div id="results-card">' +
      '<div style="font-size:2rem;margin-bottom:4px">⚡</div>' +
      '<div class="grade">' + grade.emoji + ' ' + grade.grade + '</div>' +
      '<div class="score">' + formatSpeedTime(totalTime) + '</div>' +
      '<div class="detail">' + speedInfo.label + ' — Speed Bonus: x' + speedInfo.bonus + '<br>Best: ' + bestDisplay + (newRecord ? ' 🏆 NEW RECORD!' : '') + '<br>Accuracy: ' + acc + '% · Score: ' + chScore + ' pts</div>' +
      '<div style="margin-top:12px;text-align:left">' + splitHtml + '</div>' +
    '</div>' +
    '<button class="menu-btn primary" id="btn-speed-retry">🔄 Retry</button>' +
    '<button class="menu-btn" id="btn-speed-lb">🏆 Leaderboard</button>' +
    '<button class="menu-btn" id="btn-speed-back">📋 Speed Run Select</button>'
  );
  bindBtn('btn-speed-retry', function(){ startSpeedRun(speedChapterId); });
  bindBtn('btn-speed-lb', function(){ showSpeedLeaderboard(speedChapterId); });
  bindBtn('btn-speed-back', showSpeedRun);
}

function showSpeedLeaderboard(chId){
  var key = 'scalpel_speed_ch' + chId;
  var best = null;
  try { best = JSON.parse(localStorage.getItem(key)); } catch(e){}

  var ch = D.CHAPTERS[chId - 1];
  var html = '<h2 style="margin-bottom:16px;letter-spacing:2px">⚡ SPEED RUN — ' + ch.title + '</h2>' +
    '<div id="results-card" style="text-align:center">';

  if(best){
    html += '<div style="font-size:2rem;margin-bottom:8px">🏆</div>' +
      '<div style="font-size:1.2rem;color:#f39c12;font-weight:700;margin-bottom:8px">' + formatSpeedTime(best.best) + '</div>' +
      '<div style="font-size:.75rem;color:#8a9bb5;margin-bottom:16px">Personal Best</div>' +
      '<div style="text-align:left">';
    for(var i=0;i<best.splits.length;i++){
      html += '<div style="display:flex;justify-content:space-between;font-size:.7rem;color:#bdc3c7;padding:4px 0;border-bottom:1px solid rgba(255,255,255,.05)">' +
        '<span>Step ' + (i+1) + '</span><span>' + formatSpeedTime(best.splits[i]) + '</span></div>';
    }
    html += '</div>';
  } else {
    html += '<div style="font-size:2rem;margin-bottom:8px">⏱️</div>' +
      '<div style="font-size:.85rem;color:#5a6a80">No record yet. Be the first!</div>';
  }
  html += '</div>';
  html += '<button class="menu-btn primary" id="btn-lb-play">⚡ Race Now</button>';
  html += '<button class="menu-btn" id="btn-lb-back">← Back</button>';
  showOverlay(html);
  bindBtn('btn-lb-play', function(){ startSpeedRun(chId); });
  bindBtn('btn-lb-back', showSpeedRun);
}

/* ═══════════════ BOSS RUSH ═══════════════ */
var bossRushActive = false;
var bossRushIdx = 0;
var bossRushTimer = 0;
var bossRushSplits = [];
var bossRushStartTime = 0;
var bossRushBest = null;
var bossHp = 100;

function showBossRush(){
  STATE = 'bossrush_select';
  var best = null;
  try { best = JSON.parse(localStorage.getItem('scalpel_bossrush')); } catch(e){}
  bossRushBest = best;

  var html = '<h2 style="margin-bottom:8px;letter-spacing:2px">💀 BOSS RUSH</h2>' +
    '<div class="subtitle" style="font-size:.7rem;color:#8a9bb5;margin-bottom:16px">Face all 3 bosses back-to-back. No breaks. Hard mode. How fast can you save them all?</div>' +
    '<div id="results-card" style="text-align:center">' +
      '<div style="font-size:2rem;margin-bottom:8px">💀</div>' +
      '<div style="font-size:.85rem;color:#e74c3c;font-weight:700;margin-bottom:12px">3 Bosses · Hard Mode</div>' +
      '<div style="font-size:.75rem;color:#8a9bb5;margin-bottom:8px">Boss 1: Chapter 5 — Mass Casualty</div>' +
      '<div style="font-size:.75rem;color:#8a9bb5;margin-bottom:8px">Boss 2: Chapter 9 — C-Section Emergency</div>' +
      '<div style="font-size:.75rem;color:#8a9bb5;margin-bottom:12px">Boss 3: Chapter 10 — Save Dr. Reynolds</div>' +
      (best ? '<div style="font-size:.7rem;color:#f39c12">🏆 Best: ' + formatSpeedTime(best.best) + '</div>' : '<div style="font-size:.7rem;color:#5a6a80">No record yet</div>') +
    '</div>' +
    '<button class="menu-btn primary" id="btn-start-br">💀 START RUSH</button>' +
    '<button class="menu-btn" id="btn-br-lb">🏆 Leaderboard</button>' +
    '<button class="menu-btn" id="btn-br-back">← Back</button>';
  showOverlay(html);
  bindBtn('btn-start-br', function(){ playClick(); startBossRush(); });
  bindBtn('btn-br-lb', function(){ playClick(); showBossRushLeaderboard(); });
  bindBtn('btn-br-back', function(){ playClick(); showTitle(); });
}

function startBossRush(){
  STATE = 'bossrush';
  bossRushActive = true;
  bossRushIdx = 0;
  bossRushTimer = 0;
  bossRushSplits = [];
  bossRushStartTime = Date.now();
  bossHp = 100;

  /* show boss HP bar */
  var $bossHp = document.getElementById('boss-hp');
  if($bossHp) $bossHp.classList.add('show');

  hideOverlay();
  startBoss(D.CHAPTERS[G.BOSS_RUSH.bosses[0] - 1]);
}

function startBoss(chapter){
  currentChapter = chapter;
  score = 0;
  combo = 1;
  comboTimer = 0;
  totalAccuracy = 0;
  accuracyCount = 0;
  currentStepIdx = 0;
  complicationStepsDone = 0;
  complicationActive = false;
  complicationData = null;
  activePowerups = {};
  timerRunning = false;

  /* apply hard difficulty */
  var diff = G.BOSS_RUSH.difficulty;

  $instrBar.style.display = 'flex';
  $levelLabel.style.color = '#e74c3c';
  $levelLabel.textContent = '💀 BOSS ' + (bossRushIdx + 1) + '/3';
  updatePowerupBar();
  updateBossHP();
  updateHUD();
  buildInstrumentBar(chapter.id);
  setupStep(0);
}

function updateBossHP(){
  var acc = accuracyCount > 0 ? Math.round(totalAccuracy / accuracyCount) : 0;
  bossHp = Math.max(0, 100 - acc);
  var $hpFill = document.getElementById('boss-hp-fill');
  var $hpText = document.getElementById('boss-hp-text');
  if($hpFill) $hpFill.style.width = bossHp + '%';
  if($hpText) $hpText.textContent = 'Boss HP: ' + (100 - bossHp) + '% damaged';
}

/* ═══════════════ BOSS RUSH: STEP COMPLETION ═══════════════ */
function onStepCompleteBossRush(){
  /* update boss HP */
  updateBossHP();

  currentStepIdx++;
  if(currentStepIdx >= D.PROCEDURES['chapter'+currentChapter.id].length){
    onBossComplete();
  } else {
    /* complications more likely in boss rush */
    if(!complicationActive && Math.random() < G.BOSS_RUSH.difficulty.compChance){
      maybeSpawnComplication();
      return;
    }
    setupStep(currentStepIdx);
  }
}

function onBossComplete(){
  surgeryActive = false;
  timerRunning = false;
  timingActive = false;
  complicationActive = false;
  $instrBar.style.display = 'none';

  /* record split */
  var splitTime = bossRushTimer - bossRushSplits.reduce(function(a,b){return a+b;},0);
  bossRushSplits.push(splitTime);

  bossRushIdx++;
  if(bossRushIdx >= G.BOSS_RUSH.bosses.length){
    onBossRushComplete();
  } else {
    showBossTransition(bossRushIdx);
  }
}

function showBossTransition(idx){
  var boss = D.CHAPTERS[G.BOSS_RUSH.bosses[idx] - 1];
  var patient = D.PATIENTS[boss.patient];

  showOverlay(
    '<div id="results-card" style="border-color:#27ae60">' +
      '<div style="font-size:2rem;margin-bottom:8px">✅</div>' +
      '<div style="font-size:1rem;color:#27ae60;font-weight:700;margin-bottom:12px">Boss ' + idx + ' Defeated!</div>' +
      '<div style="font-size:.85rem;color:#ecf0f1;margin-bottom:4px">NEXT: Boss ' + (idx+1) + '</div>' +
      '<div style="font-size:.75rem;color:#8a9bb5;margin-bottom:8px">' + boss.title + ' — ' + patient.condition + '</div>' +
      '<div style="font-size:.65rem;color:#f39c12;margin-top:12px">Hard Mode: -20% time, +30% complications</div>' +
    '</div>' +
    '<div id="boss-countdown" style="font-size:2.5rem;color:#f39c12;text-align:center;margin-top:16px;font-weight:700">3</div>'
  );

  playAlert();
  haptic([100, 50, 100]);

  /* countdown */
  var count = 3;
  var countInterval = setInterval(function(){
    count--;
    var $cd = document.getElementById('boss-countdown');
    if($cd) $cd.textContent = count > 0 ? count : 'GO!';
    if(count <= 0){
      clearInterval(countInterval);
      startBoss(boss);
    }
  }, 1000);
}

function onBossRushComplete(){
  bossRushActive = false;
  surgeryActive = false;
  timerRunning = false;
  timingActive = false;
  complicationActive = false;
  $instrBar.style.display = 'none';
  $levelLabel.textContent = '';
  $levelLabel.style.color = '';

  /* hide boss HP */
  var $bossHp = document.getElementById('boss-hp');
  if($bossHp) $bossHp.classList.remove('show');

  var totalTime = bossRushTimer;

  /* calculate rating */
  var rating = G.BOSS_RUSH.ratings[G.BOSS_RUSH.ratings.length - 1];
  var totalSec = totalTime / 1000;
  for(var i=0;i<G.BOSS_RUSH.ratings.length;i++){
    if(totalSec < G.BOSS_RUSH.ratings[i].minSec){
      rating = G.BOSS_RUSH.ratings[i];
      break;
    }
  }

  /* calculate score */
  var baseScore = 0;
  for(var i=0;i<bossRushSplits.length;i++){
    baseScore += Math.round(1000 - bossRushSplits[i] / 100);
  }
  var timeBonus = Math.max(0, 3000 - Math.round(totalTime / 100));
  var chScore = Math.max(0, baseScore + timeBonus);

  saveBossRush(totalTime, bossRushSplits);
  showBossRushResults(totalTime, rating, chScore, bossRushSplits);
}

function saveBossRush(time, splits){
  var key = 'scalpel_bossrush';
  var best = null;
  try { best = JSON.parse(localStorage.getItem(key)); } catch(e){}
  if(!best || time < best.best){
    best = { best:time, splits:splits };
    try { localStorage.setItem(key, JSON.stringify(best)); } catch(e){}
  }
}

function showBossRushResults(totalTime, rating, chScore, splits){
  STATE = 'results';
  var splitHtml = '';
  for(var i=0;i<splits.length;i++){
    var boss = D.CHAPTERS[G.BOSS_RUSH.bosses[i] - 1];
    var isPB = bossRushBest && bossRushBest.splits && splits[i] < bossRushBest.splits[i];
    splitHtml += '<div style="display:flex;justify-content:space-between;font-size:.7rem;color:' + (isPB ? '#27ae60' : '#bdc3c7') + ';padding:4px 0;border-bottom:1px solid rgba(255,255,255,.05)">' +
      '<span>Boss ' + (i+1) + ': ' + boss.title + '</span>' +
      '<span>' + formatSpeedTime(splits[i]) + (isPB ? ' ← PB!' : '') + '</span>' +
    '</div>';
  }

  var bestDisplay = bossRushBest ? formatSpeedTime(bossRushBest.best) : '—';
  var newRecord = !bossRushBest || totalTime < bossRushBest.best;

  showOverlay(
    '<div id="results-card">' +
      '<div style="font-size:2rem;margin-bottom:4px">💀</div>' +
      '<div class="grade">' + rating.emoji + ' ' + rating.grade + '</div>' +
      '<div class="score">' + formatSpeedTime(totalTime) + '</div>' +
      '<div class="detail">' + rating.label + '<br>Best: ' + bestDisplay + (newRecord ? ' 🏆 NEW RECORD!' : '') + '<br>Score: ' + chScore + ' pts</div>' +
      '<div style="margin-top:12px;text-align:left">' + splitHtml + '</div>' +
    '</div>' +
    '<button class="menu-btn primary" id="btn-br-retry">💀 Retry Rush</button>' +
    '<button class="menu-btn" id="btn-br-lb2">🏆 Leaderboard</button>' +
    '<button class="menu-btn" id="btn-br-back2">📋 Boss Rush Select</button>'
  );
  bindBtn('btn-br-retry', function(){ playClick(); startBossRush(); });
  bindBtn('btn-br-lb2', function(){ playClick(); showBossRushLeaderboard(); });
  bindBtn('btn-br-back2', function(){ playClick(); showBossRush(); });
}

function showBossRushLeaderboard(){
  var best = null;
  try { best = JSON.parse(localStorage.getItem('scalpel_bossrush')); } catch(e){}

  var html = '<h2 style="margin-bottom:16px;letter-spacing:2px">💀 BOSS RUSH — Leaderboard</h2>' +
    '<div id="results-card" style="text-align:center">';

  if(best){
    html += '<div style="font-size:2rem;margin-bottom:8px">🏆</div>' +
      '<div style="font-size:1.2rem;color:#e74c3c;font-weight:700;margin-bottom:8px">' + formatSpeedTime(best.best) + '</div>' +
      '<div style="font-size:.75rem;color:#8a9bb5;margin-bottom:16px">Personal Best</div>' +
      '<div style="text-align:left">';
    for(var i=0;i<best.splits.length;i++){
      var boss = D.CHAPTERS[G.BOSS_RUSH.bosses[i] - 1];
      html += '<div style="display:flex;justify-content:space-between;font-size:.7rem;color:#bdc3c7;padding:4px 0;border-bottom:1px solid rgba(255,255,255,.05)">' +
        '<span>Boss ' + (i+1) + ': ' + boss.title + '</span><span>' + formatSpeedTime(best.splits[i]) + '</span></div>';
    }
    html += '</div>';
  } else {
    html += '<div style="font-size:2rem;margin-bottom:8px">💀</div>' +
      '<div style="font-size:.85rem;color:#5a6a80">No record yet. Face the bosses!</div>';
  }
  html += '</div>';
  html += '<button class="menu-btn primary" id="btn-br-play">💀 Start Rush</button>';
  html += '<button class="menu-btn" id="btn-br-back3">← Back</button>';
  showOverlay(html);
  bindBtn('btn-br-play', function(){ playClick(); startBossRush(); });
  bindBtn('btn-br-back3', function(){ playClick(); showBossRush(); });
}

/* ═══════════════ ALIEN SURGERY ═══════════════ */
var alienActive = false;
var alienPhase = 0;
var alienToolsUsed = {};
var alienOrgansSeen = {};
var alienStartTime = 0;
var alienUnlocked = false;

function isAlienUnlocked(){
  if(alienUnlocked) return true;
  /* check conditions: 8+ chapters, 3+ A ranks */
  try {
    var s = JSON.parse(localStorage.getItem('scalpel_save'));
    if(!s || !s.chapter) return false;
    var completed = s.chapter - 1;
    var aRanks = 0;
    if(s.scores){
      for(var k in s.scores){
        if(s.scores[k] && s.scores[k].grade && (s.scores[k].grade === 'S' || s.scores[k].grade === 'A')) aRanks++;
      }
    }
    if(completed >= 8 && aRanks >= 3){
      alienUnlocked = true;
      return true;
    }
  } catch(e){}
  return false;
}

function unlockAlienEasterEgg(){
  alienUnlocked = true;
  haptic([200, 100, 200, 100, 200]);
  playPowerup();
  showOverlay(
    '<div id="results-card" style="border-color:#2ecc71">' +
      '<div style="font-size:3rem;margin-bottom:8px">👽</div>' +
      '<div style="font-size:1rem;color:#2ecc71;font-weight:700;margin-bottom:8px">SIGNAL DETECTED</div>' +
      '<div style="font-size:.75rem;color:#8a9bb5;margin-bottom:16px">An extraterrestrial frequency has been intercepted. The Roswell File is now accessible.</div>' +
    '</div>' +
    '<button class="menu-btn primary" id="btn-alien-ok">👽 ACCESS FILE</button>'
  );
  bindBtn('btn-alien-ok', function(){ playClick(); showAlienChapter(); });
}

/* tap counter for easter egg */
var alienTapCount = 0;
var alienTapTimer = null;
function setupAlienEasterEgg(){
  var $h1 = document.querySelector('#overlay h1');
  if(!$h1) return;
  $h1.style.cursor = 'pointer';
  $h1.addEventListener('click', function(){
    alienTapCount++;
    if(alienTapTimer) clearTimeout(alienTapTimer);
    alienTapTimer = setTimeout(function(){ alienTapCount = 0; }, 2000);
    if(alienTapCount >= 5){
      alienTapCount = 0;
      if(!alienUnlocked && isAlienUnlocked()){
        unlockAlienEasterEgg();
      } else if(alienUnlocked){
        showAlienChapter();
      }
    }
  });
}

function showAlienChapter(){
  STATE = 'alien_select';
  var patient = D.PATIENTS.xylar;

  var html = '<h2 style="margin-bottom:8px;letter-spacing:2px">👽 THE ROSWELL FILE</h2>' +
    '<div class="subtitle" style="font-size:.7rem;color:#8a9bb5;margin-bottom:16px">' + G.ALIEN_SECRET.subtitle + '</div>' +
    '<div id="patient-info">' +
      '<div class="pi-header">' +
        '<div class="pi-avatar" style="border-color:#2ecc71">👽</div>' +
        '<div><div class="pi-name">' + patient.name + '</div>' +
        '<div class="pi-meta">Age: ' + patient.age + ' years (Zeta Reticulan)</div></div>' +
      '</div>' +
      '<div class="pi-desc">' + patient.desc + '</div>' +
      '<div class="pi-procedure">CONDITION: ' + patient.condition.toUpperCase() + '</div>' +
      '<div class="pi-instruments">';
  var tools = G.ALIEN_TOOLS;
  for(var k in tools){
    html += '<span class="pi-inst" style="border-color:' + tools[k].color + '40;color:' + tools[k].color + '">' + tools[k].icon + ' ' + tools[k].name + '</span>';
  }
  html += '</div></div>' +
    '<div style="font-size:.65rem;color:#5a6a80;margin-bottom:12px;text-align:center">Organs: ';
  var organs = G.ALIEN_ORGANS;
  for(var k in organs){
    html += organs[k].icon + ' ';
  }
  html += '</div>' +
    '<button class="menu-btn primary" id="btn-alien-start">👽 BEGIN SURGERY</button>' +
    '<button class="menu-btn" id="btn-alien-back">← Back</button>';
  showOverlay(html);
  bindBtn('btn-alien-start', function(){ playClick(); startAlienChapter(); });
  bindBtn('btn-alien-back', function(){ playClick(); showTitle(); });
}

function startAlienChapter(){
  STATE = 'surgery';
  alienActive = true;
  alienPhase = 0;
  alienToolsUsed = {};
  alienOrgansSeen = {};
  alienStartTime = Date.now();

  currentChapter = D.CHAPTERS[10]; /* chapter 11 */
  score = 0;
  combo = 1;
  comboTimer = 0;
  totalAccuracy = 0;
  accuracyCount = 0;
  currentStepIdx = 0;
  complicationStepsDone = 0;
  complicationActive = false;
  complicationData = null;
  activePowerups = {};
  timerRunning = false;

  $instrBar.style.display = 'flex';
  $levelLabel.style.color = '#2ecc71';
  $levelLabel.textContent = '👽 ALIEN SURGERY';
  updatePowerupBar();
  updateHUD();

  /* build alien instrument bar */
  buildAlienInstrumentBar();
  alienSetupStep(0);

  playSound('powerup');
  haptic([150, 50, 150]);
  showDialogue([
    { speaker:'Dr. Reynolds', text:'Scanning the patient... My God. The anatomy is completely different. But the principle is the same: identify, stabilize, repair.' },
    { speaker:'You', text:'Laser ready. X-ray online. Let\'s save an alien.' }
  ], function(){ timingActive = true; });
}

function buildAlienInstrumentBar(){
  var html = '';
  var tools = G.ALIEN_TOOLS;
  var step = D.PROCEDURES.chapter11[currentStepIdx];
  for(var k in tools){
    var isActive = step && step.tool === k;
    var isLocked = !step || step.tool !== k;
    html += '<button class="inst-btn' + (isActive ? ' active' : '') + (isLocked ? ' locked' : '') + '" data-tool="' + k + '" title="' + tools[k].name + '">' +
      '<span class="inst-emoji">' + tools[k].icon + '</span>' +
      '<span class="inst-label" style="color:' + tools[k].color + '">' + tools[k].name.split(' ')[0] + '</span>' +
    '</button>';
  }
  $instrBar.innerHTML = html;
  /* attach listeners */
  var btns = $instrBar.querySelectorAll('.inst-btn');
  for(var i=0;i<btns.length;i++){
    btns[i].addEventListener('click', onAlienInstrumentClick);
  }
}

function onAlienInstrumentClick(e){
  var btn = e.currentTarget;
  var tool = btn.dataset.tool;
  if(btn.classList.contains('locked')) return;
  playClick();
  haptic(15);
  var step = D.PROCEDURES.chapter11[currentStepIdx];
  if(step && step.tool === tool){
    alienToolsUsed[tool] = (alienToolsUsed[tool] || 0) + 1;
    currentTool = tool;
    updateAlienInstrumentBar();
    setupStep(currentStepIdx); /* reuse existing step setup */
  } else {
    showAccuracy('Wrong tool!', false);
    addScore(-50);
  }
}

function updateAlienInstrumentBar(){
  var btns = $instrBar.querySelectorAll('.inst-btn');
  var step = D.PROCEDURES.chapter11[currentStepIdx];
  for(var i=0;i<btns.length;i++){
    var tool = btns[i].dataset.tool;
    if(step && step.tool === tool){
      btns[i].classList.remove('locked');
      btns[i].classList.add('active');
    } else {
      btns[i].classList.add('locked');
      btns[i].classList.remove('active');
    }
  }
}

function alienSetupStep(idx){
  currentStepIdx = idx;
  var step = D.PROCEDURES.chapter11[idx];
  if(!step) return;

  /* track organs seen */
  if(step.id.indexOf('heart') >= 0) alienOrgansSeen.heart = true;
  if(step.id.indexOf('lung') >= 0) alienOrgansSeen.lungs = true;
  if(step.id.indexOf('brain') >= 0) alienOrgansSeen.brain = true;
  if(step.id.indexOf('liver') >= 0) alienOrgansSeen.liver = true;
  if(step.id.indexOf('kidney') >= 0) alienOrgansSeen.kidneys = true;
  if(step.id.indexOf('nerve') >= 0) alienOrgansSeen.nerves = true;

  /* phase tracking */
  if(idx < 2) alienPhase = 0;       /* scan */
  else if(idx < 5) alienPhase = 1;  /* heart */
  else if(idx < 8) alienPhase = 2;  /* lungs */
  else if(idx < 11) alienPhase = 3; /* brain */
  else if(idx < 14) alienPhase = 4; /* liver */
  else if(idx < 16) alienPhase = 5; /* kidneys */
  else if(idx < 19) alienPhase = 6; /* nerves */
  else alienPhase = 7;              /* close */

  /* set timer based on difficulty */
  var timeMod = 1.0;
  timerMax = step.time * timeMod;
  timerLeft = timerMax;
  timerRunning = true;
  timingActive = true;

  updateAlienInstrumentBar();
  updateAlienStepLabel();
}

function updateAlienStepLabel(){
  var step = D.PROCEDURES.chapter11[currentStepIdx];
  if(!step) return;
  var organNames = ['Scan','Heart','Lungs','Brain','Liver','Kidneys','Nerves','Close'];
  $levelLabel.textContent = '👽 ' + organNames[alienPhase] + ' — Step ' + (currentStepIdx+1) + '/' + D.PROCEDURES.chapter11.length;
  $levelLabel.style.color = '#2ecc71';
  updateHUD();
}

function onAlienStepComplete(){
  currentStepIdx++;
  if(currentStepIdx >= D.PROCEDURES.chapter11.length){
    onAlienSurgeryComplete();
  } else {
    /* alien complications more likely */
    if(!complicationActive && Math.random() < 0.25){
      spawnAlienComplication();
      return;
    }
    /* alien powerup chance */
    if(Math.random() < 0.3){
      tryAlienPowerup();
    }
    alienSetupStep(currentStepIdx);
  }
}

function spawnAlienComplication(){
  var comps = G.ALIEN_COMPILATIONS;
  var comp = comps[Math.floor(Math.random() * comps.length)];
  complicationActive = true;
  complicationData = comp;
  complicationStepsDone = 0;

  playAlert();
  haptic([100, 50, 100, 50, 100]);

  showDialogue([
    { speaker:'⚠️ ALERT', text:'COMPLICATION: ' + comp.name.toUpperCase() },
    { speaker:'System', text:comp.desc },
    { speaker:'Dr. Reynolds', text:'Use the ' + G.ALIEN_TOOLS[comp.tool].name + ' (' + G.ALIEN_TOOLS[comp.tool].icon + ') to resolve this! Quick!' }
  ], function(){
    /* after dialogue, show resolve button */
    showOverlay('<div id="results-card" style="border-color:#e74c3c">' +
      '<div style="font-size:3rem;margin-bottom:8px">' + comp.icon + '</div>' +
      '<div style="font-size:1.1rem;color:#e74c3c;font-weight:700;margin-bottom:8px">' + comp.name + '</div>' +
      '<div style="font-size:.8rem;color:#bdc3c7;margin-bottom:16px">' + comp.desc + '</div>' +
      '<button class="menu-btn primary" id="btn-alien-resolve">⚡ RESOLVE (' + G.ALIEN_TOOLS[comp.tool].icon + ')</button>' +
      '</div>');
    bindBtn('btn-alien-resolve', function(){ playClick(); hideOverlay(); resolveAlienComplication(); });
  });
}

function resolveAlienComplication(){
  complicationActive = false;
  complicationData = null;
  playPowerup();
  haptic([50, 30, 50]);
  showAccuracy('Complication resolved!', true);
  addScore(200);
  alienSetupStep(currentStepIdx);
}

function tryAlienPowerup(){
  var pups = G.ALIEN_POWERUPS;
  var pu = pups[Math.floor(Math.random() * pups.length)];
  activePowerups[pu.id] = { timer: pu.dur, max: pu.dur };
  playPowerup();
  showAccuracy('Power-up: ' + pu.icon + ' ' + pu.name, true);
  updatePowerupBar();
}

function onAlienSurgeryComplete(){
  surgeryActive = false;
  timerRunning = false;
  timingActive = false;
  complicationActive = false;
  alienActive = false;
  $instrBar.style.display = 'none';

  var totalTime = Date.now() - alienStartTime;
  var acc = accuracyCount > 0 ? Math.round(totalAccuracy / accuracyCount) : 0;
  var grade = D.getGrade(acc);
  var baseScore = Math.round(acc * 10 + combo * 50);

  /* bonus for alien */
  var alienBonus = 1.5;
  var chScore = Math.round(baseScore * alienBonus);

  /* save */
  if(!save) save = { chapter:1, scores:{}, journal:{}, instruments:[] };
  save.scores['ch11'] = { score:chScore, grade:grade.grade, time:totalTime, accuracy:acc };
  save.journal['chapter11'] = true;
  saveGame();

  showAlienResults(totalTime, acc, grade, chScore);
}

function showAlienResults(totalTime, acc, grade, chScore){
  STATE = 'results';
  var toolsHtml = '';
  for(var k in alienToolsUsed){
    if(G.ALIEN_TOOLS[k]){
      toolsHtml += '<div style="display:flex;justify-content:space-between;font-size:.7rem;color:#bdc3c7;padding:4px 0;border-bottom:1px solid rgba(255,255,255,.05)">' +
        '<span>' + G.ALIEN_TOOLS[k].icon + ' ' + G.ALIEN_TOOLS[k].name + '</span><span>' + alienToolsUsed[k] + 'x</span></div>';
    }
  }

  showOverlay(
    '<div id="results-card">' +
      '<div style="font-size:2rem;margin-bottom:4px">👽</div>' +
      '<div class="grade">' + grade.emoji + ' ' + grade.grade + '</div>' +
      '<div class="score">' + chScore + ' pts</div>' +
      '<div class="detail">' + grade.label + '<br>Accuracy: ' + acc + '%<br>Time: ' + formatSpeedTime(totalTime) + '<br>Alien Bonus: x' + 1.5 + '</div>' +
      '<div style="margin-top:12px;text-align:left">' + toolsHtml + '</div>' +
      '<div class="journal" style="margin-top:12px">' +
        '<h3>👽 XENOBIOLOGY LOG</h3>' +
        '<p>You successfully performed surgery on a Zeta Reticulan being. Your instruments adapted to alien biochemistry. The Galactic Council has recorded this event in the Universal Medical Database.</p>' +
      '</div>' +
    '</div>' +
    '<button class="menu-btn primary" id="btn-alien-again">👽 OPERATE AGAIN</button>' +
    '<button class="menu-btn" id="btn-alien-journal">📖 VIEW JOURNAL</button>' +
    '<button class="menu-btn" id="btn-alien-back2">📋 CHAPTER SELECT</button>'
  );
  bindBtn('btn-alien-again', function(){ playClick(); startAlienChapter(); });
  bindBtn('btn-alien-journal', function(){ playClick(); showJournal(); });
  bindBtn('btn-alien-back2', function(){ playClick(); showChapterSelect(); });
}

/* ═══════════════ ENDLESS MODE ═══════════════ */
var endlessActive = false;
var endlessScore = 0;
var endlessPatients = 0;
var endlessCombo = 1;
var endlessStreak = 0;
var endlessLevel = 0;
var endlessStartTime = 0;
var endlessCurrentPatient = null;
var endlessBest = null;

function isEndlessUnlocked(){
  try {
    var s = JSON.parse(localStorage.getItem('scalpel_save'));
    if(!s || !s.chapter) return false;
    return s.chapter >= 6;
  } catch(e){ return false; }
}

function showEndlessMode(){
  STATE = 'endless_select';
  endlessBest = null;
  try { endlessBest = JSON.parse(localStorage.getItem('scalpel_endless')); } catch(e){}

  var html = '<h2 style="margin-bottom:8px;letter-spacing:2px">♾️ ENDLESS MODE</h2>' +
    '<div class="subtitle" style="font-size:.7rem;color:#8a9bb5;margin-bottom:16px">Patients come forever. How long can you survive? Difficulty increases every 5 patients.</div>' +
    '<div id="results-card" style="text-align:center">' +
      '<div style="font-size:2rem;margin-bottom:8px">♾️</div>' +
      '<div style="font-size:.85rem;color:#e74c3c;font-weight:700;margin-bottom:12px">Infinite Patients · Rising Difficulty</div>' +
      (endlessBest ?
        '<div style="font-size:.7rem;color:#f39c12;margin-bottom:4px">🏆 Best: ' + endlessBest.patients + ' patients</div>' +
        '<div style="font-size:.7rem;color:#8a9bb5">Score: ' + (endlessBest.score || 0) + ' pts</div>' :
        '<div style="font-size:.7rem;color:#5a6a80">No record yet</div>'
      ) +
    '</div>' +
    '<button class="menu-btn primary" id="btn-endless-start">♾️ START ENDLESS</button>' +
    '<button class="menu-btn" id="btn-endless-lb">🏆 Leaderboard</button>' +
    '<button class="menu-btn" id="btn-endless-stats">📊 Stats</button>' +
    '<button class="menu-btn" id="btn-endless-back">← Back</button>';
  showOverlay(html);
  bindBtn('btn-endless-start', function(){ playClick(); startEndlessMode(); });
  bindBtn('btn-endless-lb', function(){ playClick(); showEndlessLeaderboard(); });
  bindBtn('btn-endless-stats', function(){ playClick(); showEndlessStats(); });
  bindBtn('btn-endless-back', function(){ playClick(); showTitle(); });
}

function startEndlessMode(){
  STATE = 'surgery';
  endlessActive = true;
  endlessScore = 0;
  endlessPatients = 0;
  endlessCombo = 1;
  endlessStreak = 0;
  endlessLevel = 0;
  endlessStartTime = Date.now();

  hideOverlay();
  generateEndlessPatient();
}

function generateEndlessPatient(){
  /* select random patient from pool */
  var pool = G.ENDLESS.pool;
  var patientId = pool[Math.floor(Math.random() * pool.length)];
  var patient = D.PATIENTS[patientId];

  /* determine difficulty level */
  var lvlIdx = Math.min(Math.floor(endlessPatients / 5), G.ENDLESS.levels.length - 1);
  endlessLevel = lvlIdx;
  var lvl = G.ENDLESS.levels[lvlIdx];

  /* select procedure difficulty */
  var procDiff = lvlIdx < 3 ? 'easy' : lvlIdx < 6 ? 'medium' : 'hard';
  var availableSteps = G.ENDLESS.stepPool[procDiff];

  /* generate procedure (3-6 steps) */
  var numSteps = 3 + Math.floor(Math.random() * 4);
  numSteps = Math.min(numSteps, availableSteps.length);
  var shuffled = availableSteps.slice().sort(function(){ return Math.random() - 0.5; });
  var selectedSteps = shuffled.slice(0, numSteps);

  /* build procedure array */
  var procedure = [];
  for(var i=0;i<selectedSteps.length;i++){
    var stepDef = G.ENDLESS.stepConfig[selectedSteps[i]];
    if(stepDef){
      procedure.push({
        id: selectedSteps[i] + '_' + i,
        type: stepDef.type,
        tool: stepDef.tool,
        name: stepDef.name,
        path: stepDef.path || undefined,
        points: stepDef.points || undefined,
        target_bpm: stepDef.target_bpm || undefined,
        accuracy: Math.min(stepDef.accuracy + lvlIdx * 2, 99),
        time: Math.max(Math.round(stepDef.time * lvl.timeMod), 4),
        desc: stepDef.name
      });
    }
  }

  /* store current patient data */
  endlessCurrentPatient = {
    id: patientId,
    patient: patient,
    procedure: procedure,
    level: lvlIdx,
    timeMod: lvl.timeMod,
    compChance: lvl.compChance
  };

  /* setup surgery */
  currentChapter = { id:99, title:'Endless Patient', patient:patientId };
  currentStepIdx = 0;
  totalAccuracy = 0;
  accuracyCount = 0;
  comboTimer = 0;
  complicationActive = false;
  complicationData = null;
  activePowerups = {};
  timerRunning = false;

  /* inject procedure into D.PROCEDURES temporarily */
  D.PROCEDURES['chapter99'] = procedure;

  $instrBar.style.display = 'flex';
  $levelLabel.style.color = '#e74c3c';
  $levelLabel.textContent = '♾️ PATIENT ' + (endlessPatients + 1) + ' — Level ' + (endlessLevel + 1);
  updatePowerupBar();
  updateHUD();
  buildInstrumentBar(99);
  setupStep(0);

  playSound('powerup');
  haptic([100, 50, 100]);
}

function onEndlessStepComplete(){
  currentStepIdx++;
  if(currentStepIdx >= endlessCurrentPatient.procedure.length){
    onEndlessPatientComplete();
  } else {
    /* complications more likely at higher levels */
    if(!complicationActive && Math.random() < endlessCurrentPatient.compChance){
      spawnEndlessComplication();
      return;
    }
    /* random powerup */
    if(Math.random() < 0.25){
      tryRandomPowerup();
    }
    setupStep(currentStepIdx);
  }
}

function spawnEndlessComplication(){
  /* reuse existing complication system */
  maybeSpawnComplication();
}

function onEndlessPatientComplete(){
  surgeryActive = false;
  timerRunning = false;
  timingActive = false;
  complicationActive = false;
  $instrBar.style.display = 'none';

  /* calculate score */
  var acc = accuracyCount > 0 ? Math.round(totalAccuracy / accuracyCount) : 0;
  var timeBonus = Math.round((timerLeft || 0) * 50);
  var comboBonus = endlessCombo * 100;
  var streakBonus = endlessStreak * 50;
  var baseScore = 1000 * (endlessLevel + 1);
  var patientScore = baseScore + acc * 10 + timeBonus + comboBonus + streakBonus;

  endlessScore += patientScore;
  endlessPatients++;
  endlessStreak++;
  endlessCombo = Math.min(endlessCombo + 1, 20);

  /* check game over conditions */
  if(acc < G.ENDLESS.levels[endlessLevel].minAcc){
    onEndlessGameOver('accuracy');
    return;
  }

  /* show patient complete + transition */
  showEndlessTransition(patientScore, acc);
}

function showEndlessTransition(patientScore, acc){
  var nextLvlIdx = Math.min(Math.floor(endlessPatients / 5), G.ENDLESS.levels.length - 1);
  var levelUp = nextLvlIdx > endlessLevel;

  var html = '<div id="results-card" style="border-color:#27ae60">' +
    '<div style="font-size:2rem;margin-bottom:8px">✅</div>' +
    '<div style="font-size:1rem;color:#27ae60;font-weight:700;margin-bottom:8px">Patient Saved!</div>' +
    '<div style="font-size:.85rem;color:#f39c12;margin-bottom:4px">+' + patientScore + ' pts</div>' +
    '<div style="font-size:.7rem;color:#8a9bb5;margin-bottom:8px">Accuracy: ' + acc + '% · Combo: x' + endlessCombo + ' · Streak: ' + endlessStreak + '</div>' +
    (levelUp ? '<div style="font-size:.75rem;color:#e74c3c;font-weight:700;margin-bottom:8px">⬆️ LEVEL UP! Now Level ' + (nextLvlIdx + 1) + '</div>' : '') +
    '<div style="font-size:.65rem;color:#5a6a80;margin-top:8px">NEXT PATIENT INCOMING...</div>' +
  '</div>';

  showOverlay(html);
  playPowerup();
  haptic([50, 30, 50]);

  /* auto-advance after 2 seconds */
  setTimeout(function(){
    generateEndlessPatient();
  }, 2000);
}

function onEndlessGameOver(reason){
  endlessActive = false;
  surgeryActive = false;
  timerRunning = false;
  timingActive = false;
  complicationActive = false;
  $instrBar.style.display = 'none';
  $levelLabel.textContent = '';

  var totalTime = Date.now() - endlessStartTime;

  /* save score */
  saveEndlessScore(endlessPatients, endlessScore, totalTime);

  /* show game over */
  showEndlessResults(reason, totalTime);
}

function showEndlessResults(reason, totalTime){
  STATE = 'results';
  var reasonText = reason === 'accuracy' ? 'Accuracy too low!' : 'Time\'s up!';

  showOverlay(
    '<div id="results-card">' +
      '<div style="font-size:2rem;margin-bottom:4px">💀</div>' +
      '<div class="grade" style="font-size:2rem;color:#e74c3c">GAME OVER</div>' +
      '<div class="score">' + endlessPatients + ' patients saved</div>' +
      '<div class="detail">' + reasonText + '<br>Total Score: ' + endlessScore + ' pts<br>Best Combo: x' + endlessCombo + '<br>Best Streak: ' + endlessStreak + '<br>Accuracy: ' + (accuracyCount > 0 ? Math.round(totalAccuracy / accuracyCount) : 0) + '%<br>Time: ' + formatSpeedTime(totalTime) + '<br>Level Reached: ' + (endlessLevel + 1) + '</div>' +
      (endlessBest && endlessScore >= (endlessBest.score || 0) ?
        '<div style="font-size:.75rem;color:#f39c12;font-weight:700;margin-top:8px">🏆 NEW RECORD!</div>' : '') +
    '</div>' +
    '<button class="menu-btn primary" id="btn-endless-retry">♾️ TRY AGAIN</button>' +
    '<button class="menu-btn" id="btn-endless-lb2">🏆 Leaderboard</button>' +
    '<button class="menu-btn" id="btn-endless-back2">📋 Back</button>'
  );
  bindBtn('btn-endless-retry', function(){ playClick(); startEndlessMode(); });
  bindBtn('btn-endless-lb2', function(){ playClick(); showEndlessLeaderboard(); });
  bindBtn('btn-endless-back2', function(){ playClick(); showTitle(); });
}

function saveEndlessScore(patients, score, time){
  var key = 'scalpel_endless';
  var best = null;
  try { best = JSON.parse(localStorage.getItem(key)); } catch(e){}
  if(!best || score > (best.score || 0)){
    best = { patients:patients, score:score, time:time };
    try { localStorage.setItem(key, JSON.stringify(best)); } catch(e){}
  }
  /* also save stats */
  var statsKey = 'scalpel_endless_stats';
  var stats = null;
  try { stats = JSON.parse(localStorage.getItem(statsKey)); } catch(e){}
  if(!stats) stats = { games:0, totalPatients:0, totalTime:0, bestCombo:0, bestStreak:0 };
  stats.games++;
  stats.totalPatients += patients;
  stats.totalTime += time;
  if(endlessCombo > stats.bestCombo) stats.bestCombo = endlessCombo;
  if(endlessStreak > stats.bestStreak) stats.bestStreak = endlessStreak;
  try { localStorage.setItem(statsKey, JSON.stringify(stats)); } catch(e){}

  endlessBest = best;
}

function showEndlessLeaderboard(){
  var best = null;
  try { best = JSON.parse(localStorage.getItem('scalpel_endless')); } catch(e){}

  var html = '<h2 style="margin-bottom:16px;letter-spacing:2px">♾️ ENDLESS — Leaderboard</h2>' +
    '<div id="results-card" style="text-align:center">';

  if(best){
    html += '<div style="font-size:2rem;margin-bottom:8px">🏆</div>' +
      '<div style="font-size:1.2rem;color:#e74c3c;font-weight:700;margin-bottom:8px">' + best.patients + ' patients</div>' +
      '<div style="font-size:.85rem;color:#f39c12;margin-bottom:8px">' + (best.score || 0) + ' pts</div>' +
      '<div style="font-size:.75rem;color:#8a9bb5;margin-bottom:16px">Time: ' + formatSpeedTime(best.time) + '</div>';
  } else {
    html += '<div style="font-size:2rem;margin-bottom:8px">♾️</div>' +
      '<div style="font-size:.85rem;color:#5a6a80">No record yet. Be the first!</div>';
  }
  html += '</div>';
  html += '<button class="menu-btn primary" id="btn-el-play">♾️ Start Endless</button>';
  html += '<button class="menu-btn" id="btn-el-back">← Back</button>';
  showOverlay(html);
  bindBtn('btn-el-play', function(){ playClick(); startEndlessMode(); });
  bindBtn('btn-el-back', function(){ playClick(); showEndlessMode(); });
}

function showEndlessStats(){
  var stats = null;
  try { stats = JSON.parse(localStorage.getItem('scalpel_endless_stats')); } catch(e){}

  var html = '<h2 style="margin-bottom:16px;letter-spacing:2px">♾️ ENDLESS — Stats</h2>' +
    '<div id="results-card" style="text-align:center">';

  if(stats){
    html += '<div style="text-align:left;font-size:.75rem;color:#bdc3c7">' +
      '<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.05)"><span>Games Played</span><span>' + stats.games + '</span></div>' +
      '<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.05)"><span>Total Patients</span><span>' + stats.totalPatients + '</span></div>' +
      '<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.05)"><span>Total Time</span><span>' + formatSpeedTime(stats.totalTime) + '</span></div>' +
      '<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.05)"><span>Best Combo</span><span>x' + stats.bestCombo + '</span></div>' +
      '<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.05)"><span>Best Streak</span><span>' + stats.bestStreak + '</span></div>' +
      '<div style="display:flex;justify-content:space-between;padding:6px 0"><span>Avg Patients/Game</span><span>' + (stats.games > 0 ? Math.round(stats.totalPatients / stats.games) : 0) + '</span></div>' +
    '</div>';
  } else {
    html += '<div style="font-size:.85rem;color:#5a6a80">No stats yet. Start playing!</div>';
  }
  html += '</div>';
  html += '<button class="menu-btn primary" id="btn-es-play">♾️ Start Endless</button>';
  html += '<button class="menu-btn" id="btn-es-back">← Back</button>';
  showOverlay(html);
  bindBtn('btn-es-play', function(){ playClick(); startEndlessMode(); });
  bindBtn('btn-es-back', function(){ playClick(); showEndlessMode(); });
}

/* ═══════════════ ZOMBIE OUTBREAK ═══════════════ */
var zombieActive = false;
var zombieScore = 0;
var zombiePatients = 0;
var zombieCombo = 1;
var zombieStreak = 0;
var zombieInfection = 30;
var zombieOverheat = 0;
var zombieTransform = 20;
var zombieStartTime = 0;
var zombieCurrentPatient = null;
var zombieBest = null;
var zombiePizzaActive = false;

function isZombieUnlocked(){
  try {
    var s = JSON.parse(localStorage.getItem('scalpel_save'));
    if(!s || !s.chapter) return false;
    var completed = s.chapter - 1;
    var aRanks = 0;
    if(s.scores){
      for(var k in s.scores){
        if(s.scores[k] && s.scores[k].grade && (s.scores[k].grade === 'S' || s.scores[k].grade === 'A')) aRanks++;
      }
    }
    /* check boss rush */
    var bossRushDone = false;
    try { bossRushDone = !!JSON.parse(localStorage.getItem('scalpel_bossrush')); } catch(e){}
    return completed >= 6 && aRanks >= 2 && bossRushDone;
  } catch(e){ return false; }
}

function showZombieMode(){
  STATE = 'zombie_select';
  zombieBest = null;
  try { zombieBest = JSON.parse(localStorage.getItem('scalpel_zombie')); } catch(e){}

  var html = '<h2 style="margin-bottom:8px;letter-spacing:2px">🧟 ZOMBIE OUTBREAK</h2>' +
    '<div class="subtitle" style="font-size:.7rem;color:#8a9bb5;margin-bottom:16px">The virus Z has hit Ospedale Miraggio! Patients are turning into zombies. Can you save them before they eat your brains?</div>' +
    '<div id="results-card" style="text-align:center;border-color:#e74c3c">' +
      '<div style="font-size:2rem;margin-bottom:8px">🧟</div>' +
      '<div style="font-size:.85rem;color:#e74c3c;font-weight:700;margin-bottom:12px">Infection · Overheat · Transformation</div>' +
      (zombieBest ?
        '<div style="font-size:.7rem;color:#f39c12;margin-bottom:4px">🏆 Best: ' + zombieBest.patients + ' zombies saved</div>' +
        '<div style="font-size:.7rem;color:#8a9bb5">Score: ' + (zombieBest.score || 0) + ' pts</div>' :
        '<div style="font-size:.7rem;color:#5a6a80">No record yet</div>'
      ) +
    '</div>' +
    '<button class="menu-btn primary" id="btn-zombie-start" style="border-color:#e74c3c">🧟 FIGHT THE INFECTION</button>' +
    '<button class="menu-btn" id="btn-zombie-lb">🏆 Leaderboard</button>' +
    '<button class="menu-btn" id="btn-zombie-stats">📊 Stats</button>' +
    '<button class="menu-btn" id="btn-zombie-back">← Back</button>';
  showOverlay(html);
  bindBtn('btn-zombie-start', function(){ playClick(); startZombieMode(); });
  bindBtn('btn-zombie-lb', function(){ playClick(); showZombieLeaderboard(); });
  bindBtn('btn-zombie-stats', function(){ playClick(); showZombieStats(); });
  bindBtn('btn-zombie-back', function(){ playClick(); showTitle(); });
}

function startZombieMode(){
  STATE = 'surgery';
  zombieActive = true;
  zombieScore = 0;
  zombiePatients = 0;
  zombieCombo = 1;
  zombieStreak = 0;
  zombieInfection = 30;
  zombieOverheat = 0;
  zombieTransform = 20;
  zombieStartTime = Date.now();
  zombiePizzaActive = false;

  hideOverlay();
  generateZombiePatient();
}

function generateZombiePatient(){
  /* select random patient from pool */
  var pool = G.ZOMBIE.pool;
  var patientId = pool[Math.floor(Math.random() * pool.length)];
  var patient = D.PATIENTS[patientId];

  /* select procedure difficulty based on patients completed */
  var procDiff = zombiePatients < 5 ? 'easy' : zombiePatients < 10 ? 'medium' : 'hard';
  var availableSteps = G.ZOMBIE.stepPool[procDiff];

  /* generate procedure (3-6 steps) */
  var numSteps = 3 + Math.floor(Math.random() * 4);
  numSteps = Math.min(numSteps, availableSteps.length);
  var shuffled = availableSteps.slice().sort(function(){ return Math.random() - 0.5; });
  var selectedSteps = shuffled.slice(0, numSteps);

  /* build procedure array */
  var procedure = [];
  for(var i=0;i<selectedSteps.length;i++){
    var stepDef = G.ZOMBIE.stepConfig[selectedSteps[i]];
    if(stepDef){
      procedure.push({
        id: selectedSteps[i] + '_' + i,
        type: stepDef.type,
        tool: stepDef.tool,
        name: stepDef.name,
        path: stepDef.path || undefined,
        points: stepDef.points || undefined,
        target_bpm: stepDef.target_bpm || undefined,
        accuracy: Math.min(stepDef.accuracy + zombiePatients * 2, 99),
        time: Math.max(Math.round(stepDef.time * (1 - zombiePatients * 0.02)), 4),
        desc: stepDef.name
      });
    }
  }

  /* store current patient data */
  zombieCurrentPatient = {
    id: patientId,
    patient: patient,
    procedure: procedure,
    infectionChance: 0.15 + zombiePatients * 0.03,
    overheatChance: 0.20 + zombiePatients * 0.02,
    transformChance: 0.10 + zombiePatients * 0.04
  };

  /* setup surgery */
  currentChapter = { id:98, title:'Zombie Patient', patient:patientId };
  currentStepIdx = 0;
  totalAccuracy = 0;
  accuracyCount = 0;
  comboTimer = 0;
  complicationActive = false;
  complicationData = null;
  activePowerups = {};
  timerRunning = false;

  /* inject procedure into D.PROCEDURES temporarily */
  D.PROCEDURES['chapter98'] = procedure;

  $instrBar.style.display = 'flex';
  $levelLabel.style.color = '#e74c3c';
  $levelLabel.textContent = '🧟 ZOMBIE ' + (zombiePatients + 1) + ' — Infection: ' + Math.round(zombieInfection) + '%';
  updatePowerupBar();
  updateZombieHUD();
  buildZombieInstrumentBar();
  setupStep(0);

  playSound('powerup');
  haptic([100, 50, 100]);
}

function buildZombieInstrumentBar(){
  var html = '';
  var tools = G.ZOMBIE.tools;
  var step = D.PROCEDURES.chapter98[currentStepIdx];
  for(var k in tools){
    var isActive = step && step.tool === k;
    var isLocked = !step || step.tool !== k;
    html += '<button class="inst-btn' + (isActive ? ' active' : '') + (isLocked ? ' locked' : '') + '" data-tool="' + k + '" title="' + tools[k].name + '">' +
      '<span class="inst-emoji">' + tools[k].icon + '</span>' +
      '<span class="inst-label" style="color:' + tools[k].color + '">' + tools[k].name.split(' ')[0] + '</span>' +
    '</button>';
  }
  $instrBar.innerHTML = html;
  /* attach listeners */
  var btns = $instrBar.querySelectorAll('.inst-btn');
  for(var i=0;i<btns.length;i++){
    btns[i].addEventListener('click', onZombieInstrumentClick);
  }
}

function onZombieInstrumentClick(e){
  var btn = e.currentTarget;
  var tool = btn.dataset.tool;
  if(btn.classList.contains('locked')) return;
  playClick();
  haptic(15);
  var step = D.PROCEDURES.chapter98[currentStepIdx];
  if(step && step.tool === tool){
    currentTool = tool;
    updateZombieInstrumentBar();
    setupStep(currentStepIdx);
  } else {
    showAccuracy('Wrong tool!', false);
    addScore(-50);
    zombieOverheat = Math.min(100, zombieOverheat + 15);
    updateZombieHUD();
  }
}

function updateZombieInstrumentBar(){
  var btns = $instrBar.querySelectorAll('.inst-btn');
  var step = D.PROCEDURES.chapter98[currentStepIdx];
  for(var i=0;i<btns.length;i++){
    var tool = btns[i].dataset.tool;
    if(step && step.tool === tool){
      btns[i].classList.remove('locked');
      btns[i].classList.add('active');
    } else {
      btns[i].classList.add('locked');
      btns[i].classList.remove('active');
    }
  }
}

function updateZombieHUD(){
  /* update level label */
  if($levelLabel){
    $levelLabel.textContent = '🧟 ZOMBIE ' + (zombiePatients + 1) + ' — Infection: ' + Math.round(zombieInfection) + '%';
  }

  /* check game over conditions */
  if(zombieInfection >= 100){
    onZombieGameOver('infection');
    return;
  }
  if(zombieOverheat >= 100){
    /* overheat: can't use current tool for 5 seconds */
    showAccuracy('OVERHEAT! Tool disabled!', false);
    zombieOverheat = 70;
    /* disable current tool temporarily */
    var btns = $instrBar.querySelectorAll('.inst-btn.active');
    for(var i=0;i<btns.length;i++){
      btns[i].classList.add('locked');
      btns[i].classList.remove('active');
    }
    setTimeout(function(){
      updateZombieInstrumentBar();
    }, 5000);
  }
  if(zombieTransform >= 100){
    onZombieGameOver('transform');
    return;
  }
}

function onZombieStepComplete(){
  currentStepIdx++;
  if(currentStepIdx >= zombieCurrentPatient.procedure.length){
    onZombiePatientComplete();
  } else {
    /* increase infection/overheat/transform based on chances */
    var p = zombieCurrentPatient;
    if(Math.random() < p.infectionChance){
      zombieInfection = Math.min(100, zombieInfection + 5 + Math.random() * 10);
    }
    if(Math.random() < p.overheatChance){
      zombieOverheat = Math.min(100, zombieOverheat + 8 + Math.random() * 12);
    }
    if(Math.random() < p.transformChance){
      zombieTransform = Math.min(100, zombieTransform + 3 + Math.random() * 7);
    }

    /* zombie complications more likely */
    if(!complicationActive && Math.random() < (0.2 + zombiePatients * 0.02)){
      spawnZombieComplication();
      return;
    }

    /* random powerup */
    if(Math.random() < 0.3){
      tryZombiePowerup();
    }

    /* pizza easter egg! */
    if(!zombiePizzaActive && Math.random() < 0.05){
      pizzaEasterEgg();
      return;
    }

    updateZombieHUD();
    updateZombieInstrumentBar();
    setupStep(currentStepIdx);
  }
}

function spawnZombieComplication(){
  var comps = G.ZOMBIE.complications;
  var comp = comps[Math.floor(Math.random() * comps.length)];
  complicationActive = true;
  complicationData = comp;
  complicationStepsDone = 0;

  /* apply complication effects */
  if(comp.id === 'fast_transform') zombieTransform = Math.min(100, zombieTransform + 30);
  if(comp.id === 'infection_spread') zombieInfection = Math.min(100, zombieInfection + 40);
  if(comp.id === 'overheat_crit') zombieOverheat = Math.min(100, zombieOverheat + 50);
  if(comp.id === 'zombie_bleed') zombieInfection = Math.min(100, zombieInfection + 20);
  if(comp.id === 'brain_hunger') zombieTransform = Math.min(100, zombieTransform + 25);
  if(comp.id === 'clinical_death') { zombieTransform = Math.min(100, zombieTransform + 35); }
  if(comp.id === 'zombie_mosquito') zombieInfection = Math.min(100, zombieInfection + 15);
  if(comp.id === 'pizza_delivery') { /* special! */ }

  playAlert();
  haptic([100, 50, 100, 50, 100]);
  updateZombieHUD();

  showDialogue([
    { speaker:'⚠️ ZOMBIE ALERT', text:'COMPLICATION: ' + comp.name.toUpperCase() },
    { speaker:'System', text:comp.desc },
    { speaker:'Dr. Reynolds', text:'Use the ' + G.ZOMBIE.tools[comp.tool].name + ' (' + G.ZOMBIE.tools[comp.tool].icon + ') to resolve this! Quick!' }
  ], function(){
    /* after dialogue, show resolve button */
    showOverlay('<div id="results-card" style="border-color:#e74c3c">' +
      '<div style="font-size:3rem;margin-bottom:8px">' + comp.icon + '</div>' +
      '<div style="font-size:1.1rem;color:#e74c3c;font-weight:700;margin-bottom:8px">' + comp.name + '</div>' +
      '<div style="font-size:.8rem;color:#bdc3c7;margin-bottom:16px">' + comp.desc + '</div>' +
      '<button class="menu-btn primary" id="btn-zombie-resolve">⚡ RESOLVE (' + G.ZOMBIE.tools[comp.tool].icon + ')</button>' +
      '</div>');
    bindBtn('btn-zombie-resolve', function(){ playClick(); hideOverlay(); resolveZombieComplication(); });
  });
}

function resolveZombieComplication(){
  complicationActive = false;
  complicationData = null;
  playPowerup();
  haptic([50, 30, 50]);
  showAccuracy('Complication resolved!', true);
  addScore(200);
  updateZombieHUD();
  updateZombieInstrumentBar();
  setupStep(currentStepIdx);
}

function tryZombiePowerup(){
  var pups = G.ZOMBIE.powerups;
  var pu = pups[Math.floor(Math.random() * pups.length)];
  activePowerups[pu.id] = { timer: pu.dur, max: pu.dur };
  playPowerup();
  showAccuracy('Power-up: ' + pu.icon + ' ' + pu.name, true);

  /* apply special effects */
  if(pu.id === 'zshield') zombieInfection = Math.max(0, zombieInfection - 20);
  if(pu.id === 'zslowmo') { timerLeft += 5; }
  if(pu.id === 'zrecharge') { zombieOverheat = 0; }
  if(pu.id === 'zvision') { zombieTransform = Math.max(0, zombieTransform - 15); }
  if(pu.id === 'zforce') { zombieInfection = Math.max(0, zombieInfection - 10); zombieTransform = Math.max(0, zombieTransform - 10); }
  if(pu.id === 'zpizzapower') { zombieCombo = Math.min(20, zombieCombo + 3); }

  updatePowerupBar();
  updateZombieHUD();
}

function pizzaEasterEgg(){
  zombiePizzaActive = true;
  playAlert();
  haptic([200, 100, 200]);

  showDialogue([
    { speaker:'🍕 PIZZA DELIVERY', text:'*SUONA IL CITOFONO*' },
    { speaker:'Consegna Pizza', text:'Ciao! Avete ordinato una Margherita per la sala operatoria?' },
    { speaker:'Zombie Patient', text:'BRAAAINS... E PIZZA!' },
    { speaker:'Dr. Reynolds', text:'Doctor! Use the Scudo Proteico to block the delivery guy, then give the pizza to the patient!' }
  ]);

  /* pizza complication */
  complicationActive = true;
  complicationData = { id:'pizza_delivery', name:'Pizza Delivery', icon:'🍕', tool:'shield', desc:'Il paziente zombie vuole la pizza!' };
  complicationStepsDone = 0;
}

function resolvePizzaEasterEgg(){
  zombiePizzaActive = false;
  complicationActive = false;
  complicationData = null;
  zombieInfection = Math.max(0, zombieInfection - 30);
  zombieTransform = Math.max(0, zombieTransform - 25);
  zombieCombo = Math.min(20, zombieCombo + 5);
  addScore(5000);
  playPowerup();
  haptic([100, 50, 100, 50, 100]);
  showAccuracy('🍕 PIZZA TIME! +5000 pts!', true);
  updateZombieHUD();
  updateZombieInstrumentBar();
  setupStep(currentStepIdx);
}

function onZombiePatientComplete(){
  surgeryActive = false;
  timerRunning = false;
  timingActive = false;
  complicationActive = false;
  $instrBar.style.display = 'none';

  /* calculate score */
  var acc = accuracyCount > 0 ? Math.round(totalAccuracy / accuracyCount) : 0;
  var timeBonus = Math.round((timerLeft || 0) * 50);
  var comboBonus = zombieCombo * 100;
  var streakBonus = zombieStreak * 50;
  var baseScore = 1000 * (1 + zombiePatients * 0.2);
  var patientScore = Math.round(baseScore + acc * 10 + timeBonus + comboBonus + streakBonus);

  zombieScore += patientScore;
  zombiePatients++;
  zombieStreak++;
  zombieCombo = Math.min(zombieCombo + 1, 20);

  /* reduce infection/transform on success */
  zombieInfection = Math.max(0, zombieInfection - 10);
  zombieTransform = Math.max(0, zombieTransform - 8);
  zombieOverheat = Math.max(0, zombieOverheat - 15);

  /* check game over */
  if(acc < 50){
    onZombieGameOver('accuracy');
    return;
  }

  showZombieTransition(patientScore, acc);
}

function showZombieTransition(patientScore, acc){
  var html = '<div id="results-card" style="border-color:#27ae60">' +
    '<div style="font-size:2rem;margin-bottom:8px">✅</div>' +
    '<div style="font-size:1rem;color:#27ae60;font-weight:700;margin-bottom:8px">Zombie Saved!</div>' +
    '<div style="font-size:.85rem;color:#f39c12;margin-bottom:4px">+' + patientScore + ' pts</div>' +
    '<div style="font-size:.7rem;color:#8a9bb5;margin-bottom:8px">Accuracy: ' + acc + '% · Combo: x' + zombieCombo + ' · Streak: ' + zombieStreak + '</div>' +
    '<div style="font-size:.65rem;color:#e74c3c;margin-top:8px">Infection: ' + Math.round(zombieInfection) + '% · Transform: ' + Math.round(zombieTransform) + '%</div>' +
    '<div style="font-size:.65rem;color:#5a6a80;margin-top:4px">NEXT ZOMBIE INCOMING...</div>' +
  '</div>';

  showOverlay(html);
  playPowerup();
  haptic([50, 30, 50]);

  /* auto-advance after 2 seconds */
  setTimeout(function(){
    generateZombiePatient();
  }, 2000);
}

function onZombieGameOver(reason){
  zombieActive = false;
  surgeryActive = false;
  timerRunning = false;
  timingActive = false;
  complicationActive = false;
  $instrBar.style.display = 'none';
  $levelLabel.textContent = '';

  var totalTime = Date.now() - zombieStartTime;
  var reasonText = reason === 'infection' ? 'INFECTION COMPLETE! You have been infected!' :
                   reason === 'transform' ? 'TRANSFORMATION COMPLETE! The patient is a full zombie!' :
                   'Accuracy too low! The patient died!';

  /* save score */
  saveZombieScore(zombiePatients, zombieScore, totalTime);

  /* show game over */
  showZombieResults(reason, reasonText, totalTime);
}

function showZombieResults(reason, reasonText, totalTime){
  STATE = 'results';

  showOverlay(
    '<div id="results-card" style="border-color:#e74c3c">' +
      '<div style="font-size:2rem;margin-bottom:4px">🧟</div>' +
      '<div class="grade" style="font-size:2rem;color:#e74c3c">GAME OVER</div>' +
      '<div class="score">' + zombiePatients + ' zombies saved</div>' +
      '<div class="detail">' + reasonText + '<br>Total Score: ' + zombieScore + ' pts<br>Best Combo: x' + zombieCombo + '<br>Best Streak: ' + zombieStreak + '<br>Infection: ' + Math.round(zombieInfection) + '%<br>Transform: ' + Math.round(zombieTransform) + '%<br>Time: ' + formatSpeedTime(totalTime) + '</div>' +
      (zombieBest && zombieScore >= (zombieBest.score || 0) ?
        '<div style="font-size:.75rem;color:#f39c12;font-weight:700;margin-top:8px">🏆 NEW RECORD!</div>' : '') +
    '</div>' +
    '<button class="menu-btn primary" id="btn-zombie-retry" style="border-color:#e74c3c">🧟 TRY AGAIN</button>' +
    '<button class="menu-btn" id="btn-zombie-lb2">🏆 Leaderboard</button>' +
    '<button class="menu-btn" id="btn-zombie-back2">📋 Back</button>'
  );
  bindBtn('btn-zombie-retry', function(){ playClick(); startZombieMode(); });
  bindBtn('btn-zombie-lb2', function(){ playClick(); showZombieLeaderboard(); });
  bindBtn('btn-zombie-back2', function(){ playClick(); showTitle(); });
}

function saveZombieScore(patients, score, time){
  var key = 'scalpel_zombie';
  var best = null;
  try { best = JSON.parse(localStorage.getItem(key)); } catch(e){}
  if(!best || score > (best.score || 0)){
    best = { patients:patients, score:score, time:time };
    try { localStorage.setItem(key, JSON.stringify(best)); } catch(e){}
  }
  /* also save stats */
  var statsKey = 'scalpel_zombie_stats';
  var stats = null;
  try { stats = JSON.parse(localStorage.getItem(statsKey)); } catch(e){}
  if(!stats) stats = { games:0, totalPatients:0, totalTime:0, bestCombo:0, bestStreak:0, totalInfections:0, totalTransforms:0 };
  stats.games++;
  stats.totalPatients += patients;
  stats.totalTime += time;
  if(zombieCombo > stats.bestCombo) stats.bestCombo = zombieCombo;
  if(zombieStreak > stats.bestStreak) stats.bestStreak = zombieStreak;
  try { localStorage.setItem(statsKey, JSON.stringify(stats)); } catch(e){}

  zombieBest = best;
}

function showZombieLeaderboard(){
  var best = null;
  try { best = JSON.parse(localStorage.getItem('scalpel_zombie')); } catch(e){}

  var html = '<h2 style="margin-bottom:16px;letter-spacing:2px">🧟 ZOMBIE — Leaderboard</h2>' +
    '<div id="results-card" style="text-align:center;border-color:#e74c3c">';

  if(best){
    html += '<div style="font-size:2rem;margin-bottom:8px">🏆</div>' +
      '<div style="font-size:1.2rem;color:#e74c3c;font-weight:700;margin-bottom:8px">' + best.patients + ' zombies saved</div>' +
      '<div style="font-size:.85rem;color:#f39c12;margin-bottom:8px">' + (best.score || 0) + ' pts</div>' +
      '<div style="font-size:.75rem;color:#8a9bb5;margin-bottom:16px">Time: ' + formatSpeedTime(best.time) + '</div>';
  } else {
    html += '<div style="font-size:2rem;margin-bottom:8px">🧟</div>' +
      '<div style="font-size:.85rem;color:#5a6a80">No record yet. Fight the infection!</div>';
  }
  html += '</div>';
  html += '<button class="menu-btn primary" id="btn-zl-play" style="border-color:#e74c3c">🧟 Fight Zombies</button>';
  html += '<button class="menu-btn" id="btn-zl-back">← Back</button>';
  showOverlay(html);
  bindBtn('btn-zl-play', function(){ playClick(); startZombieMode(); });
  bindBtn('btn-zl-back', function(){ playClick(); showZombieMode(); });
}

function showZombieStats(){
  var stats = null;
  try { stats = JSON.parse(localStorage.getItem('scalpel_zombie_stats')); } catch(e){}

  var html = '<h2 style="margin-bottom:16px;letter-spacing:2px">🧟 ZOMBIE — Stats</h2>' +
    '<div id="results-card" style="text-align:center;border-color:#e74c3c">';

  if(stats){
    html += '<div style="text-align:left;font-size:.75rem;color:#bdc3c7">' +
      '<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.05)"><span>Games Played</span><span>' + stats.games + '</span></div>' +
      '<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.05)"><span>Total Zombies Saved</span><span>' + stats.totalPatients + '</span></div>' +
      '<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.05)"><span>Total Time</span><span>' + formatSpeedTime(stats.totalTime) + '</span></div>' +
      '<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.05)"><span>Best Combo</span><span>x' + stats.bestCombo + '</span></div>' +
      '<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.05)"><span>Best Streak</span><span>' + stats.bestStreak + '</span></div>' +
      '<div style="display:flex;justify-content:space-between;padding:6px 0"><span>Avg Zombies/Game</span><span>' + (stats.games > 0 ? Math.round(stats.totalPatients / stats.games) : 0) + '</span></div>' +
    '</div>';
  } else {
    html += '<div style="font-size:.85rem;color:#5a6a80">No stats yet. Fight the infection!</div>';
  }
  html += '</div>';
  html += '<button class="menu-btn primary" id="btn-zs-play" style="border-color:#e74c3c">🧟 Fight Zombies</button>';
  html += '<button class="menu-btn" id="btn-zs-back">← Back</button>';
  showOverlay(html);
  bindBtn('btn-zs-play', function(){ playClick(); startZombieMode(); });
  bindBtn('btn-zs-back', function(){ playClick(); showZombieMode(); });
}

/* ═══════════════ ANATOMY VIEWER ═══════════════ */
var anatomyActive = false;
var selectedOrgan = null;
var xrayMode = false;
var quizMode = false;
var quizScore = 0;
var quizCurrent = 0;
var quizAnswered = false;

function showAnatomyViewer(){
  STATE = 'anatomy';
  anatomyActive = true;
  selectedOrgan = null;
  xrayMode = false;
  quizMode = false;

  var organIcons = '';
  var organs = G.ANATOMY.organs;
  for(var k in organs){
    organIcons += '<button class="anatomy-organ-btn" data-organ="' + k + '" style="border-color:' + organs[k].color + '40;color:' + organs[k].color + '">' + organs[k].icon + '</button>';
  }

  var html = '<h2 style="margin-bottom:8px;letter-spacing:2px">🫀 ANATOMY VIEWER</h2>' +
    '<div class="subtitle" style="font-size:.7rem;color:#8a9bb5;margin-bottom:12px">Explore the human body. Tap an organ to learn about it.</div>' +
    '<div id="results-card" style="text-align:center;border-color:#3498db30">' +
      '<div id="anatomy-display" style="min-height:200px;display:flex;align-items:center;justify-content:center;position:relative">' +
        '<div id="anatomy-body" style="font-size:4rem;opacity:.3">🧍</div>' +
        '<div id="anatomy-organ-highlight" style="position:absolute;font-size:3rem;display:none"></div>' +
      '</div>' +
      '<div id="anatomy-info" style="text-align:left;padding:8px">' +
        '<div id="anatomy-organ-name" style="font-size:1rem;color:#ecf0f1;font-weight:700;margin-bottom:4px">Select an organ</div>' +
        '<div id="anatomy-organ-func" style="font-size:.7rem;color:#8a9bb5;line-height:1.5">Tap an organ button below to learn about its function, structure, and fun facts.</div>' +
      '</div>' +
    '</div>' +
    '<div style="display:flex;gap:4px;justify-content:center;margin-bottom:8px;flex-wrap:wrap">' + organIcons + '</div>' +
    '<div style="display:flex;gap:8px;justify-content:center">' +
      '<button class="menu-btn" id="btn-xray" style="width:auto;padding:8px 16px;font-size:.75rem;border-color:#3498db40">🔬 X-RAY</button>' +
      '<button class="menu-btn" id="btn-quiz" style="width:auto;padding:8px 16px;font-size:.75rem;border-color:#f39c1240">🧠 QUIZ</button>' +
      '<button class="menu-btn" id="btn-anatomy-back" style="width:auto;padding:8px 16px;font-size:.75rem">← Back</button>' +
    '</div>';
  showOverlay(html);

  /* organ button listeners */
  var organBtns = document.querySelectorAll('.anatomy-organ-btn');
  for(var i=0;i<organBtns.length;i++){
    organBtns[i].addEventListener('click', (function(orgId){
      return function(){ playClick(); selectOrgan(orgId); };
    })(organBtns[i].dataset.organ));
  }

  bindBtn('btn-xray', function(){ playClick(); toggleXRay(); });
  bindBtn('btn-quiz', function(){ playClick(); startAnatomyQuiz(); });
  bindBtn('btn-anatomy-back', function(){ playClick(); anatomyActive = false; showTitle(); });
}

function selectOrgan(organId){
  var organ = G.ANATOMY.organs[organId];
  if(!organ) return;
  selectedOrgan = organId;

  /* highlight organ */
  var $highlight = document.getElementById('anatomy-organ-highlight');
  var $body = document.getElementById('anatomy-body');
  if($highlight){
    $highlight.textContent = organ.icon;
    $highlight.style.display = 'block';
    $highlight.style.color = organ.color;
    $highlight.style.textShadow = '0 0 20px ' + organ.color;
  }
  if($body){
    $body.style.opacity = '0.15';
  }

  /* show info */
  var $name = document.getElementById('anatomy-organ-name');
  var $func = document.getElementById('anatomy-organ-func');
  if($name) $name.textContent = organ.icon + ' ' + organ.name;
  if($func){
    $func.innerHTML =
      '<div style="margin-bottom:6px"><strong style="color:' + organ.color + '">Position:</strong> <span style="color:#bdc3c7">' + organ.pos + '</span></div>' +
      '<div style="margin-bottom:6px"><strong style="color:' + organ.color + '">Size:</strong> <span style="color:#bdc3c7">' + organ.size + '</span></div>' +
      '<div style="margin-bottom:6px"><strong style="color:' + organ.color + '">Weight:</strong> <span style="color:#bdc3c7">' + organ.weight + '</span></div>' +
      '<div style="margin-bottom:6px"><strong style="color:' + organ.color + '">Function:</strong> <span style="color:#bdc3c7">' + organ.func + '</span></div>' +
      '<div style="margin-bottom:6px"><strong style="color:' + organ.color + '">Structure:</strong> <span style="color:#bdc3c7">' + organ.structure + '</span></div>' +
      '<div style="margin-bottom:6px"><strong style="color:' + organ.color + '">Fun Facts:</strong></div>' +
      '<ul style="margin:0;padding-left:16px;color:#bdc3c7;font-size:.65rem">' +
      organ.facts.map(function(f){ return '<li style="margin-bottom:3px">' + f + '</li>'; }).join('') +
      '</ul>' +
      '<div style="margin-top:6px"><strong style="color:' + organ.color + '">Diseases:</strong> <span style="color:#e74c3c">' + organ.diseases.join(', ') + '</span></div>' +
      '<div style="margin-top:6px"><strong style="color:' + organ.color + '">Connections:</strong> <span style="color:#f39c12">' + organ.connections.join(', ') + '</span></div>';
  }

  /* animate */
  haptic(10);
  playSound('click');
}

function toggleXRay(){
  xrayMode = !xrayMode;
  var $display = document.getElementById('anatomy-display');
  var $btn = document.getElementById('btn-xray');
  if(xrayMode){
    if($display) $display.style.background = 'rgba(52,152,219,.1)';
    if($btn) $btn.style.borderColor = '#3498db';
    showXRayMode();
  } else {
    if($display) $display.style.background = '';
    if($btn) $btn.style.borderColor = '#3498db40';
    hideXRayMode();
  }
}

function showXRayMode(){
  /* show all organs as translucent */
  var $highlight = document.getElementById('anatomy-organ-highlight');
  if($highlight){
    $highlight.style.opacity = '0.6';
    $highlight.style.filter = 'brightness(1.5)';
  }
  /* show connection lines */
  if(selectedOrgan){
    var organ = G.ANATOMY.organs[selectedOrgan];
    if(organ){
      var connHtml = '<div style="position:absolute;bottom:0;left:0;right:0;font-size:.6rem;color:#3498db;text-align:center;padding:4px">Connected to: ' +
        organ.connections.map(function(c){ return G.ANATOMY.organs[c] ? G.ANATOMY.organs[c].icon : c; }).join(' ') + '</div>';
      var $display = document.getElementById('anatomy-display');
      if($display) $display.insertAdjacentHTML('beforeend', connHtml);
    }
  }
}

function hideXRayMode(){
  var $highlight = document.getElementById('anatomy-organ-highlight');
  if($highlight){
    $highlight.style.opacity = '1';
    $highlight.style.filter = '';
  }
}

function startAnatomyQuiz(){
  quizMode = true;
  quizScore = 0;
  quizCurrent = 0;
  quizAnswered = false;
  showQuizQuestion();
}

function showQuizQuestion(){
  if(quizCurrent >= G.ANATOMY.quiz.length){
    showQuizResults();
    return;
  }

  var q = G.ANATOMY.quiz[quizCurrent];
  var html = '<h2 style="margin-bottom:8px;letter-spacing:2px">🧠 ANATOMY QUIZ</h2>' +
    '<div style="font-size:.7rem;color:#8a9bb5;margin-bottom:12px">Question ' + (quizCurrent + 1) + '/' + G.ANATOMY.quiz.length + ' · Score: ' + quizScore + '</div>' +
    '<div id="results-card" style="text-align:center;border-color:#f39c1230">' +
      '<div style="font-size:1rem;color:#ecf0f1;font-weight:700;margin-bottom:16px;line-height:1.5">' + q.q + '</div>';

  for(var i=0;i<q.a.length;i++){
    html += '<button class="menu-btn quiz-answer" data-idx="' + i + '" style="width:100%;margin-bottom:8px;border-color:#f39c1230">' + q.a[i] + '</button>';
  }

  html += '</div>';
  showOverlay(html);

  /* answer listeners */
  var btns = document.querySelectorAll('.quiz-answer');
  for(var i=0;i<btns.length;i++){
    btns[i].addEventListener('click', (function(idx){
      return function(){ playClick(); checkQuizAnswer(idx); };
    })(parseInt(btns[i].dataset.idx)));
  }
}

function checkQuizAnswer(idx){
  if(quizAnswered) return;
  quizAnswered = true;

  var q = G.ANATOMY.quiz[quizCurrent];
  var btns = document.querySelectorAll('.quiz-answer');

  if(idx === q.correct){
    /* correct! */
    quizScore += 100;
    btns[idx].style.borderColor = '#27ae60';
    btns[idx].style.color = '#27ae60';
    playSound('fanfare');
    haptic([50, 30, 50]);
  } else {
    /* wrong */
    btns[idx].style.borderColor = '#e74c3c';
    btns[idx].style.color = '#e74c3c';
    btns[q.correct].style.borderColor = '#27ae60';
    btns[q.correct].style.color = '#27ae60';
    playSound('miss');
    haptic([100, 50, 100]);
  }

  /* next question after delay */
  setTimeout(function(){
    quizCurrent++;
    quizAnswered = false;
    showQuizQuestion();
  }, 1500);
}

function showQuizResults(){
  quizMode = false;
  var total = G.ANATOMY.quiz.length * 100;
  var pct = Math.round((quizScore / total) * 100);
  var grade = pct >= 90 ? '🏆 S' : pct >= 70 ? '⭐ A' : pct >= 50 ? '👍 B' : '📋 C';

  showOverlay(
    '<h2 style="margin-bottom:8px;letter-spacing:2px">🧠 QUIZ COMPLETE</h2>' +
    '<div id="results-card" style="text-align:center;border-color:#f39c1230">' +
      '<div style="font-size:3rem;margin-bottom:8px">' + grade.split(' ')[0] + '</div>' +
      '<div class="grade">' + grade + '</div>' +
      '<div class="score">' + quizScore + ' / ' + total + ' pts</div>' +
      '<div class="detail">Accuracy: ' + pct + '%<br>Questions: ' + G.ANATOMY.quiz.length + '</div>' +
    '</div>' +
    '<button class="menu-btn primary" id="btn-quiz-retry">🧠 RETRY QUIZ</button>' +
    '<button class="menu-btn" id="btn-quiz-back">🫀 BACK TO ANATOMY</button>'
  );
  bindBtn('btn-quiz-retry', function(){ playClick(); startAnatomyQuiz(); });
  bindBtn('btn-quiz-back', function(){ playClick(); showAnatomyViewer(); });
}

/* ═══════════════ PANDEMIC MODE ═══════════════ */
var pandemicActive = false;
var pandemicDay = 0;
var pandemicDNA = 0;
var pandemicInfected = 0;
var pandemicDead = 0;
var pandemicTotalPop = 0;
var pandemicCureProgress = 0;
var pandemicVaccineProgress = 0;
var pandemicCountries = {};
var pandemicMutations = [];
var pandemicDifficulty = null;
var pandemicStartTime = 0;
var pandemicTimer = null;
var pandemicBest = null;

function showPandemicMode(){
  STATE = 'pandemic_select';
  pandemicBest = null;
  try { pandemicBest = JSON.parse(localStorage.getItem('scalpel_pandemic')); } catch(e){}

  var html = '<h2 style="margin-bottom:8px;letter-spacing:2px">🌍 PANDEMIC MODE</h2>' +
    '<div class="subtitle" style="font-size:.7rem;color:#8a9bb5;margin-bottom:12px">You are the virus. Infect the world. Don\'t get cured.</div>' +
    '<div id="results-card" style="text-align:center;border-color:#e74c3c30">' +
      '<div style="font-size:2rem;margin-bottom:8px">🦠</div>' +
      '<div style="font-size:.85rem;color:#e74c3c;font-weight:700;margin-bottom:12px">Choose Your Difficulty</div>' +
      (pandemicBest ?
        '<div style="font-size:.7rem;color:#f39c12;margin-bottom:4px">🏆 Best: ' + pandemicBest.infected + ' infected</div>' :
        '<div style="font-size:.7rem;color:#5a6a80">No record yet</div>'
      ) +
    '</div>';

  var diffs = G.PANDEMIC.difficulties;
  for(var k in diffs){
    html += '<button class="menu-btn" id="btn-pan-' + k + '" style="border-color:' + (k==='easy'?'#27ae60':k==='normal'?'#f39c12':k==='hard'?'#e74c3c':'#8e44ad') + '40">' + diffs[k].emoji + ' ' + diffs[k].label + '</button>';
  }
  html += '<button class="menu-btn" id="btn-pan-lb">🏆 Leaderboard</button>';
  html += '<button class="menu-btn" id="btn-pan-back">← Back</button>';
  showOverlay(html);

  bindBtn('btn-pan-easy', function(){ playClick(); showCountrySelect('easy'); });
  bindBtn('btn-pan-normal', function(){ playClick(); showCountrySelect('normal'); });
  bindBtn('btn-pan-hard', function(){ playClick(); showCountrySelect('hard'); });
  bindBtn('btn-pan-extreme', function(){ playClick(); showCountrySelect('extreme'); });
  bindBtn('btn-pan-lb', function(){ playClick(); showPandemicLeaderboard(); });
  bindBtn('btn-pan-back', function(){ playClick(); showTitle(); });
}

function showCountrySelect(difficulty){
  STATE = 'pandemic_country';
  pandemicDifficulty = G.PANDEMIC.difficulties[difficulty];

  var html = '<h2 style="margin-bottom:8px;letter-spacing:2px">🗺️ SELECT COUNTRY</h2>' +
    '<div class="subtitle" style="font-size:.7rem;color:#8a9bb5;margin-bottom:12px">Where will your virus originate?</div>' +
    '<div id="results-card" style="text-align:center;border-color:#e74c3c30">' +
      '<div style="font-size:.85rem;color:#e74c3c;font-weight:700;margin-bottom:8px">' + pandemicDifficulty.emoji + ' ' + pandemicDifficulty.label + '</div>' +
      '<div style="font-size:.65rem;color:#8a9bb5">DNA Start: ' + pandemicDifficulty.dnaStart + ' · Cure Speed: x' + pandemicDifficulty.cureSpeed + '</div>' +
    '</div>';

  var countries = G.PANDEMIC.countries;
  for(var k in countries){
    var c = countries[k];
    var difficulty_label = c.healthcare >= 90 ? '🔴 Hard' : c.healthcare >= 75 ? '🟡 Medium' : '🟢 Easy';
    html += '<button class="menu-btn" id="btn-country-' + k + '" style="text-align:left;padding:10px 16px">' +
      '<span style="font-size:1.2rem">' + c.emoji + '</span> ' + c.name +
      '<span style="float:right;font-size:.65rem;color:#8a9bb5">' + difficulty_label + '</span>' +
    '</button>';
  }
  html += '<button class="menu-btn" id="btn-cs-back">← Back</button>';
  showOverlay(html);

  for(var k in countries){
    (function(countryId){
      bindBtn('btn-country-' + countryId, function(){ playClick(); startPandemic(countryId); });
    })(k);
  }
  bindBtn('btn-cs-back', function(){ playClick(); showPandemicMode(); });
}

function startPandemic(countryId){
  STATE = 'pandemic';
  pandemicActive = true;
  pandemicDay = 1;
  pandemicDNA = pandemicDifficulty.dnaStart;
  pandemicInfected = 0;
  pandemicDead = 0;
  pandemicCureProgress = 0;
  pandemicVaccineProgress = 0;
  pandemicMutations = [];
  pandemicStartTime = Date.now();

  /* init countries */
  pandemicCountries = {};
  var countries = G.PANDEMIC.countries;
  for(var k in countries){
    pandemicCountries[k] = {
      infected: 0,
      dead: 0,
      cured: 0,
      awareness: 0,
      locked: false
    };
  }

  /* infect starting country */
  pandemicCountries[countryId].infected = 100;
  pandemicInfected = 100;

  /* calculate total pop */
  pandemicTotalPop = 0;
  for(var k in countries){ pandemicTotalPop += countries[k].pop; }

  hideOverlay();

  /* show pandemic UI */
  var $pDisplay = document.getElementById('pandemic-display');
  var $pActions = document.getElementById('pandemic-actions');
  if($pDisplay) $pDisplay.classList.add('show');
  if($pActions) $pActions.style.display = 'flex';

  updatePandemicDisplay();

  /* start tick every 2 seconds */
  pandemicTimer = setInterval(function(){
    pandemicTick();
  }, 2000);

  playSound('complication');
  haptic([100, 50, 100]);
}

function pandemicTick(){
  if(!pandemicActive) return;

  pandemicDay++;

  /* virus spreads */
  var countries = G.PANDEMIC.countries;
  for(var k in countries){
    if(pandemicCountries[k].locked) continue;
    var c = countries[k];
    var pc = pandemicCountries[k];
    if(pc.infected > 0){
      /* spread rate based on density and healthcare */
      var spreadRate = (c.density / 100) * (1 + pandemicMutations.length * 0.1);
      var healthcareReduce = c.healthcare / 200;
      var newInfected = Math.round(pc.infected * spreadRate * (1 - healthcareReduce) * 0.1);
      newInfected = Math.max(0, Math.min(newInfected, c.pop - pc.infected));
      pc.infected += newInfected;
      pandemicInfected += newInfected;

      /* deaths based on lethality */
      var lethality = 0.02 + pandemicMutations.length * 0.005;
      var newDead = Math.round(pc.infected * lethality * 0.01);
      pc.dead += newDead;
      pandemicDead += newDead;
    }
  }

  /* doctors work on cure */
  var doctorSpeed = pandemicDifficulty.doctorSpeed;
  pandemicCureProgress = Math.min(100, pandemicCureProgress + doctorSpeed * 0.5);
  pandemicVaccineProgress = Math.min(100, pandemicVaccineProgress + doctorSpeed * 0.3);

  /* random events */
  if(Math.random() < 0.05){
    triggerPandemicEvent();
  }

  /* check win/lose */
  if(checkPandemicWin()) return;

  updatePandemicDisplay();
}

function infectAdjacentCountry(fromCountry){
  var countries = G.PANDEMIC.countries;
  var countryKeys = Object.keys(countries);
  var fromIdx = countryKeys.indexOf(fromCountry);
  if(fromIdx < 0) return;

  /* infect neighbors */
  var neighbors = [countryKeys[(fromIdx+1)%countryKeys.length], countryKeys[(fromIdx-1+countryKeys.length)%countryKeys.length]];
  for(var i=0;i<neighbors.length;i++){
    var n = neighbors[i];
    if(pandemicCountries[n].infected === 0 && Math.random() < 0.3){
      pandemicCountries[n].infected = 10;
      pandemicInfected += 10;
      showAccuracy(countries[n].emoji + ' ' + countries[n].name + ' INFECTED!', false);
    }
  }
}

function triggerPandemicEvent(){
  var events = G.PANDEMIC.events;
  var evt = events[Math.floor(Math.random() * events.length)];

  switch(evt.id){
    case 'mutation':
      if(pandemicDNA >= 10){
        pandemicDNA -= 10;
        pandemicMutations.push({id:'random_' + pandemicDay, name:'Random Mutation', icon:'🧬'});
        showAccuracy('🧟 RANDOM MUTATION!', false);
      }
      break;
    case 'cure_boost':
      pandemicCureProgress = Math.min(100, pandemicCureProgress + 5);
      showAccuracy('🔬 Doctors found a breakthrough!', false);
      break;
    case 'travel_ban':
      /* lock a random country */
      var keys = Object.keys(pandemicCountries);
      var randKey = keys[Math.floor(Math.random() * keys.length)];
      pandemicCountries[randKey].locked = true;
      showAccuracy('✈️ ' + G.PANDEMIC.countries[randKey].name + ' closed borders!', false);
      break;
    case 'super_spreader':
      pandemicInfected += 500;
      pandemicDNA += 20;
      showAccuracy('🦠 SUPER SPREADER! +500 infected!', false);
      break;
    case 'drug_resist':
      if(pandemicMutations.length < 5){
        pandemicMutations.push({id:'resist_' + pandemicDay, name:'Drug Resistance', icon:'💊'});
        showAccuracy('💊 Virus resists treatment!', false);
      }
      break;
  }
}

function updatePandemicDisplay(){
  var infectedPct = Math.round((pandemicInfected / pandemicTotalPop) * 100);
  var deadPct = Math.round((pandemicDead / pandemicTotalPop) * 100);

  /* build country list */
  var countryHtml = '';
  var countries = G.PANDEMIC.countries;
  for(var k in countries){
    var c = countries[k];
    var pc = pandemicCountries[k];
    var pct = c.pop > 0 ? Math.round((pc.infected / c.pop) * 100) : 0;
    var color = pct === 0 ? '#27ae60' : pct < 10 ? '#f39c12' : pct < 50 ? '#e67e22' : '#e74c3c';
    countryHtml += '<div style="display:flex;justify-content:space-between;align-items:center;padding:4px 0;border-bottom:1px solid rgba(255,255,255,.05);font-size:.65rem">' +
      '<span>' + c.emoji + ' ' + c.name + '</span>' +
      '<span style="color:' + color + '">' + (pc.locked ? '🔒' : pct + '%') + '</span>' +
    '</div>';
  }

  /* build mutation list */
  var mutHtml = '';
  for(var i=0;i<pandemicMutations.length;i++){
    mutHtml += '<span style="display:inline-block;padding:2px 6px;margin:2px;border-radius:6px;background:rgba(231,76,60,.2);border:1px solid rgba(231,76,60,.3);font-size:.6rem;color:#e74c3c">' + pandemicMutations[i].icon + '</span>';
  }

  var html = '<div style="display:flex;justify-content:space-between;align-items:center;padding:4px 0;border-bottom:1px solid rgba(255,255,255,.1)">' +
    '<span style="font-size:.85rem;color:#e74c3c;font-weight:700">🦠 PANDEMIC</span>' +
    '<span style="font-size:.75rem;color:#f39c12">Day ' + pandemicDay + '</span>' +
  '</div>' +
  '<div style="display:flex;justify-content:space-between;padding:4px 0;font-size:.7rem">' +
    '<span>🧬 DNA: ' + pandemicDNA + '</span>' +
    '<span>💀 Dead: ' + formatNumber(pandemicDead) + '</span>' +
  '</div>' +
  '<div style="margin:6px 0">' +
    '<div style="font-size:.6rem;color:#8a9bb5;margin-bottom:2px">Infected: ' + formatNumber(pandemicInfected) + ' / ' + formatNumber(pandemicTotalPop) + ' (' + infectedPct + '%)</div>' +
    '<div style="width:100%;height:6px;background:rgba(255,255,255,.1);border-radius:3px;overflow:hidden">' +
      '<div style="width:' + Math.min(infectedPct, 100) + '%;height:100%;background:linear-gradient(90deg,#27ae60,#f39c12,#e74c3c);border-radius:3px;transition:width .3s"></div>' +
    '</div>' +
  '</div>' +
  '<div style="margin:6px 0">' +
    '<div style="font-size:.6rem;color:#8a9bb5;margin-bottom:2px">Cure: ' + Math.round(pandemicCureProgress) + '% · Vaccine: ' + Math.round(pandemicVaccineProgress) + '%</div>' +
    '<div style="width:100%;height:6px;background:rgba(255,255,255,.1);border-radius:3px;overflow:hidden">' +
      '<div style="width:' + Math.round(pandemicCureProgress) + '%;height:100%;background:#3498db;border-radius:3px;transition:width .3s"></div>' +
    '</div>' +
  '</div>' +
  '<div style="margin:6px 0;font-size:.6rem;color:#8a9bb5">Mutations: ' + (mutHtml || 'None') + '</div>' +
  '<div style="max-height:120px;overflow-y:auto;margin:6px 0">' + countryHtml + '</div>';

  var $pandemicDisplay = document.getElementById('pandemic-display');
  if($pandemicDisplay) $pandemicDisplay.innerHTML = html;
}

function formatNumber(num){
  if(num >= 1000000000) return (num/1000000000).toFixed(1) + 'B';
  if(num >= 1000000) return (num/1000000).toFixed(1) + 'M';
  if(num >= 1000) return (num/1000).toFixed(1) + 'K';
  return num.toString();
}

function pandemicAction(action){
  if(!pandemicActive) return;

  switch(action){
    case 'spread':
      if(pandemicDNA >= 10){
        pandemicDNA -= 10;
        /* spread to random uninfected country */
        var keys = Object.keys(G.PANDEMIC.countries);
        var uninfected = keys.filter(function(k){ return pandemicCountries[k].infected === 0 && !pandemicCountries[k].locked; });
        if(uninfected.length > 0){
          var target = uninfected[Math.floor(Math.random() * uninfected.length)];
          pandemicCountries[target].infected = 50;
          pandemicInfected += 50;
          showAccuracy('🦠 Spread to ' + G.PANDEMIC.countries[target].name + '!', true);
        } else {
          /* spread to adjacent */
          var infected = keys.filter(function(k){ return pandemicCountries[k].infected > 0; });
          if(infected.length > 0){
            infectAdjacentCountry(infected[Math.floor(Math.random() * infected.length)]);
          }
        }
        playSound('hit');
        haptic(15);
      } else {
        showAccuracy('Not enough DNA!', false);
      }
      break;

    case 'lethal':
      if(pandemicDNA >= 20){
        pandemicDNA -= 20;
        pandemicMutations.push({id:'lethal_' + pandemicDay, name:'Lethality+', icon:'💀'});
        showAccuracy('💀 Lethality increased!', true);
        playSound('hit');
        haptic(15);
      } else {
        showAccuracy('Not enough DNA!', false);
      }
      break;

    case 'resist':
      if(pandemicDNA >= 15){
        pandemicDNA -= 15;
        pandemicMutations.push({id:'resist_' + pandemicDay, name:'Resistance+', icon:'🛡️'});
        pandemicCureProgress = Math.max(0, pandemicCureProgress - 10);
        showAccuracy('🛡️ Resistance increased!', true);
        playSound('hit');
        haptic(15);
      } else {
        showAccuracy('Not enough DNA!', false);
      }
      break;

    case 'mutate':
      if(pandemicDNA >= 25){
        pandemicDNA -= 25;
        var effects = ['trans','let','res','inc'];
        var effect = effects[Math.floor(Math.random() * effects.length)];
        pandemicMutations.push({id:'mut_' + pandemicDay, name:'Mutation', icon:'🧬'});
        showAccuracy('🧟 MUTATION! +' + effect.toUpperCase() + '!', true);
        playSound('complication');
        haptic([50, 30, 50]);
      } else {
        showAccuracy('Not enough DNA!', false);
      }
      break;

    case 'travel':
      if(pandemicDNA >= 40){
        pandemicDNA -= 40;
        /* infect 2 random countries */
        var keys = Object.keys(G.PANDEMIC.countries);
        var targets = keys.filter(function(k){ return pandemicCountries[k].infected === 0 && !pandemicCountries[k].locked; });
        for(var i=0;i<Math.min(2, targets.length);i++){
          var t = targets[Math.floor(Math.random() * targets.length)];
          pandemicCountries[t].infected = 30;
          pandemicInfected += 30;
          targets.splice(targets.indexOf(t), 1);
        }
        showAccuracy('✈️ Global travel! New countries infected!', true);
        playSound('fanfare');
        haptic([100, 50, 100]);
      } else {
        showAccuracy('Not enough DNA!', false);
      }
      break;
  }

  updatePandemicDisplay();
}

/* make pandemicAction globally accessible for HTML onclick */
window.pandemicAction = pandemicAction;

function checkPandemicWin(){
  var infectedPct = (pandemicInfected / pandemicTotalPop) * 100;

  /* check cure */
  if(pandemicCureProgress >= 100 || pandemicVaccineProgress >= 100){
    pandemicActive = false;
    clearInterval(pandemicTimer);
    hidePandemicUI();
    showPandemicResults('cured');
    return true;
  }

  /* check too many dead */
  if(pandemicDead > pandemicTotalPop * 0.5){
    pandemicActive = false;
    clearInterval(pandemicTimer);
    hidePandemicUI();
    showPandemicResults('extinct');
    return true;
  }

  /* check victory */
  if(infectedPct >= 80){
    pandemicActive = false;
    clearInterval(pandemicTimer);
    hidePandemicUI();
    showPandemicResults('victory');
    return true;
  }

  return false;
}

function hidePandemicUI(){
  var $pDisplay = document.getElementById('pandemic-display');
  var $pActions = document.getElementById('pandemic-actions');
  if($pDisplay) $pDisplay.classList.remove('show');
  if($pActions) $pActions.style.display = 'none';
}

function showPandemicResults(reason){
  STATE = 'results';
  var totalTime = Date.now() - pandemicStartTime;
  var infectedPct = Math.round((pandemicInfected / pandemicTotalPop) * 100);

  var title, emoji, desc;
  if(reason === 'victory'){
    title = '🏆 PANDEMIC SUCCESS!';
    emoji = '🏆';
    desc = 'Your virus infected ' + infectedPct + '% of the world!';
  } else if(reason === 'cured'){
    title = '💀 CURED!';
    emoji = '🔬';
    desc = 'Doctors found a cure! Your virus was stopped.';
  } else {
    title = '☠️ EXTINCT!';
    emoji = '☠️';
    desc = 'Too many hosts died. The virus could not survive.';
  }

  savePandemicScore(pandemicInfected, pandemicDead, pandemicDay);

  showOverlay(
    '<div id="results-card" style="border-color:#e74c3c30">' +
      '<div style="font-size:3rem;margin-bottom:8px">' + emoji + '</div>' +
      '<div class="grade" style="color:' + (reason==='victory'?'#27ae60':'#e74c3c') + '">' + title + '</div>' +
      '<div class="score">' + formatNumber(pandemicInfected) + ' infected</div>' +
      '<div class="detail">' + desc + '<br>Days: ' + pandemicDay + '<br>Dead: ' + formatNumber(pandemicDead) + '<br>Mutations: ' + pandemicMutations.length + '<br>Time: ' + formatSpeedTime(totalTime) + '</div>' +
      (pandemicBest && pandemicInfected >= (pandemicBest.infected || 0) ?
        '<div style="font-size:.75rem;color:#f39c12;font-weight:700;margin-top:8px">🏆 NEW RECORD!</div>' : '') +
    '</div>' +
    '<button class="menu-btn primary" id="btn-pan-retry">🦠 PLAY AGAIN</button>' +
    '<button class="menu-btn" id="btn-pan-lb2">🏆 Leaderboard</button>' +
    '<button class="menu-btn" id="btn-pan-back2">📋 Back</button>'
  );
  bindBtn('btn-pan-retry', function(){ playClick(); showPandemicMode(); });
  bindBtn('btn-pan-lb2', function(){ playClick(); showPandemicLeaderboard(); });
  bindBtn('btn-pan-back2', function(){ playClick(); showTitle(); });
}

function savePandemicScore(infected, dead, days){
  var key = 'scalpel_pandemic';
  var best = null;
  try { best = JSON.parse(localStorage.getItem(key)); } catch(e){}
  if(!best || infected > (best.infected || 0)){
    best = { infected:infected, dead:dead, days:days };
    try { localStorage.setItem(key, JSON.stringify(best)); } catch(e){}
  }
  pandemicBest = best;
}

function showPandemicLeaderboard(){
  var best = null;
  try { best = JSON.parse(localStorage.getItem('scalpel_pandemic')); } catch(e){}

  var html = '<h2 style="margin-bottom:16px;letter-spacing:2px">🌍 PANDEMIC — Leaderboard</h2>' +
    '<div id="results-card" style="text-align:center;border-color:#e74c3c30">';

  if(best){
    html += '<div style="font-size:2rem;margin-bottom:8px">🏆</div>' +
      '<div style="font-size:1.2rem;color:#e74c3c;font-weight:700;margin-bottom:8px">' + formatNumber(best.infected) + ' infected</div>' +
      '<div style="font-size:.85rem;color:#8a9bb5;margin-bottom:4px">Dead: ' + formatNumber(best.dead) + '</div>' +
      '<div style="font-size:.75rem;color:#8a9bb5">Days: ' + best.days + '</div>';
  } else {
    html += '<div style="font-size:2rem;margin-bottom:8px">🦠</div>' +
      '<div style="font-size:.85rem;color:#5a6a80">No record yet. Start the pandemic!</div>';
  }
  html += '</div>';
  html += '<button class="menu-btn primary" id="btn-pl-play">🦠 Start Pandemic</button>';
  html += '<button class="menu-btn" id="btn-pl-back">← Back</button>';
  showOverlay(html);
  bindBtn('btn-pl-play', function(){ playClick(); showPandemicMode(); });
  bindBtn('btn-pl-back', function(){ playClick(); showTitle(); });
}

/* ═══════════════ VETERINARY MODE ═══════════════ */
var vetActive = false;
var vetAnimal = null;
var vetStep = 0;
var vetScore = 0;
var vetAccuracy = 100;
var vetTotalSteps = 0;
var vetComplications = 0;
var vetStartTime = 0;
var vetBest = null;
var vetTimer = null;

function showVeterinaryMode(){
  STATE = 'vet_select';
  vetBest = null;
  try { vetBest = JSON.parse(localStorage.getItem('scalpel_veterinary')); } catch(e){}

  var html = '<h2 style="margin-bottom:8px;letter-spacing:2px">🐕 VETERINARY MODE</h2>' +
    '<div class="subtitle" style="font-size:.7rem;color:#8a9bb5;margin-bottom:12px">Operate on animals — each species is unique!</div>' +
    '<div id="results-card" style="text-align:center;border-color:#27ae6030">' +
      '<div style="font-size:2rem;margin-bottom:8px">🐾</div>' +
      '<div style="font-size:.85rem;color:#27ae60;font-weight:700;margin-bottom:8px">Choose Your Patient</div>' +
      (vetBest ?
        '<div style="font-size:.7rem;color:#f39c12;margin-bottom:4px">🏆 Best: ' + vetBest.score + ' pts (' + vetBest.animal + ')</div>' :
        '<div style="font-size:.7rem;color:#5a6a80">No record yet</div>'
      ) +
    '</div>';

  var animals = G.VETERINARY.animals;
  for(var k in animals){
    var a = animals[k];
    var stars = '⭐'.repeat(a.difficulty);
    html += '<button class="menu-btn" id="btn-vet-' + k + '" style="text-align:left;padding:10px 16px">' +
      '<span style="font-size:1.2rem">' + a.emoji + '</span> ' + a.name +
      '<span style="float:right;font-size:.65rem;color:#8a9bb5">' + stars + '</span>' +
    '</button>';
  }
  html += '<button class="menu-btn" id="btn-vet-lb">🏆 Leaderboard</button>';
  html += '<button class="menu-btn" id="btn-vet-back">← Back</button>';
  showOverlay(html);

  for(var k in animals){
    (function(animalId){
      bindBtn('btn-vet-' + animalId, function(){ playClick(); startVeterinary(animalId); });
    })(k);
  }
  bindBtn('btn-vet-lb', function(){ playClick(); showVeterinaryLeaderboard(); });
  bindBtn('btn-vet-back', function(){ playClick(); showTitle(); });
}

function startVeterinary(animalId){
  STATE = 'vet';
  vetActive = true;
  vetAnimal = animalId;
  vetStep = 0;
  vetScore = 0;
  vetAccuracy = 100;
  vetComplications = 0;
  vetStartTime = Date.now();

  var animal = G.VETERINARY.animals[animalId];
  vetTotalSteps = G.VETERINARY.procedures[animalId].length;

  hideOverlay();

  /* show vet display */
  var $vetDisplay = document.getElementById('vet-display');
  if($vetDisplay) $vetDisplay.classList.add('show');

  updateVeterinaryDisplay();
  showVeterinaryStep();

  playSound('complication');
  haptic([100, 50, 100]);
}

function showVeterinaryStep(){
  if(!vetActive) return;

  var procedure = G.VETERINARY.procedures[vetAnimal];
  if(vetStep >= procedure.length){
    checkVeterinaryWin();
    return;
  }

  var step = procedure[vetStep];
  var animal = G.VETERINARY.animals[vetAnimal];

  var $levelLabel = document.getElementById('level-label');
  if($levelLabel){
    $levelLabel.innerHTML = '<div style="font-size:.6rem;color:#27ae60">🐾 VETERINARY</div>' +
      '<div style="font-size:.75rem;font-weight:700">' + animal.emoji + ' ' + animal.name + ' — Step ' + (vetStep+1) + '/' + vetTotalSteps + '</div>';
    $levelLabel.style.display = 'block';
  }

  var timerDuration = step.time;
  var $timerFill = document.getElementById('timer-fill');
  if($timerFill){
    $timerFill.style.transition = 'none';
    $timerFill.style.width = '100%';
    setTimeout(function(){
      $timerFill.style.transition = 'width ' + timerDuration + 'ms linear';
      $timerFill.style.width = '0%';
    }, 50);
    /* enforce timer - auto-fail step when time runs out */
    if(vetTimer) clearTimeout(vetTimer);
    vetTimer = setTimeout(function(){
      if(vetActive && !complicationActive){
        onVeterinaryStepComplete(false);
      }
    }, timerDuration);
  }

  showDialogue([{ speaker:'Veterinary', text:step.text }]);
}

function onVeterinaryStepComplete(success){
  if(!vetActive) return;

  var procedure = G.VETERINARY.procedures[vetAnimal];
  var step = procedure[vetStep];

  if(success){
    vetScore += step.points;
    showAccuracy('+' + step.points + ' pts', true);
    playSound('hit');
    haptic(15);
  } else {
    vetAccuracy = Math.max(0, vetAccuracy - 10);
    vetComplications++;
    showAccuracy('Missed!', false);
    playSound('miss');
    haptic([30, 20, 30]);

    /* spawn complication */
    if(Math.random() < 0.4){
      spawnVeterinaryComplication();
    }
  }

  vetStep++;
  updateVeterinaryDisplay();

  setTimeout(function(){
    if(vetActive) showVeterinaryStep();
  }, 800);
}

function spawnVeterinaryComplication(){
  var animal = G.VETERINARY.animals[vetAnimal];
  var possibleComps = G.VETERINARY.complications.filter(function(c){
    return c.animal === vetAnimal || c.animal === 'all';
  });
  if(possibleComps.length === 0) return;

  var comp = possibleComps[Math.floor(Math.random() * possibleComps.length)];
  showAccuracy(comp.emoji + ' ' + comp.name + '!', false);
  playSound('complication');
  haptic([50, 30, 50]);
  vetScore = Math.max(0, vetScore - 50);
}

function updateVeterinaryDisplay(){
  var animal = G.VETERINARY.animals[vetAnimal];
  var progress = Math.round((vetStep / vetTotalSteps) * 100);

  var html = '<div style="display:flex;justify-content:space-between;align-items:center;padding:4px 0;border-bottom:1px solid rgba(255,255,255,.1)">' +
    '<span style="font-size:.85rem;color:#27ae60;font-weight:700">' + animal.emoji + ' ' + animal.name + '</span>' +
    '<span style="font-size:.75rem;color:#f39c12">Step ' + (vetStep+1) + '/' + vetTotalSteps + '</span>' +
  '</div>' +
  '<div style="display:flex;justify-content:space-between;padding:4px 0;font-size:.7rem">' +
    '<span>❤️ Hearts: ' + '❤️'.repeat(animal.hearts) + '</span>' +
    '<span>📊 ' + vetScore + ' pts</span>' +
  '</div>' +
  '<div style="margin:6px 0">' +
    '<div style="font-size:.6rem;color:#8a9bb5;margin-bottom:2px">Progress: ' + progress + '%</div>' +
    '<div style="width:100%;height:6px;background:rgba(255,255,255,.1);border-radius:3px;overflow:hidden">' +
      '<div style="width:' + progress + '%;height:100%;background:linear-gradient(90deg,#27ae60,#2ecc71);border-radius:3px;transition:width .3s"></div>' +
    '</div>' +
  '</div>' +
  '<div style="font-size:.6rem;color:#8a9bb5">Accuracy: ' + vetAccuracy + '% · Complications: ' + vetComplications + '</div>';

  var $vetDisplay = document.getElementById('vet-display');
  if($vetDisplay) $vetDisplay.innerHTML = html;
}

function checkVeterinaryWin(){
  vetActive = false;
  var totalTime = Date.now() - vetStartTime;
  var animal = G.VETERINARY.animals[vetAnimal];

  /* hide vet display */
  var $vetDisplay = document.getElementById('vet-display');
  if($vetDisplay) $vetDisplay.classList.remove('show');

  var grade, gradeColor;
  if(vetAccuracy >= 90 && vetComplications === 0){
    grade = '🏆 S'; gradeColor = '#f1c40f';
  } else if(vetAccuracy >= 75){
    grade = '⭐ A'; gradeColor = '#27ae60';
  } else if(vetAccuracy >= 50){
    grade = '👍 B'; gradeColor = '#f39c12';
  } else {
    grade = '📋 C'; gradeColor = '#e74c3c';
  }

  saveVeterinaryScore(vetAnimal, vetScore, vetAccuracy);

  showOverlay(
    '<div id="results-card" style="border-color:#27ae6030">' +
      '<div style="font-size:3rem;margin-bottom:8px">' + animal.emoji + '</div>' +
      '<div class="grade" style="color:' + gradeColor + '">' + grade + '</div>' +
      '<div class="score">' + vetScore + ' pts</div>' +
      '<div class="detail">' + animal.name + ' saved!<br>Accuracy: ' + vetAccuracy + '%<br>Complications: ' + vetComplications + '<br>Time: ' + formatSpeedTime(totalTime) + '</div>' +
      (vetBest && vetScore >= (vetBest.score || 0) ?
        '<div style="font-size:.75rem;color:#f39c12;font-weight:700;margin-top:8px">🏆 NEW RECORD!</div>' : '') +
    '</div>' +
    '<button class="menu-btn primary" id="btn-vet-retry">🐾 OPERATE AGAIN</button>' +
    '<button class="menu-btn" id="btn-vet-next" style="border-color:#27ae60">🐾 NEXT ANIMAL</button>' +
    '<button class="menu-btn" id="btn-vet-lb2">🏆 Leaderboard</button>' +
    '<button class="menu-btn" id="btn-vet-back2">📋 Back</button>'
  );
  bindBtn('btn-vet-retry', function(){ playClick(); startVeterinary(vetAnimal); });
  bindBtn('btn-vet-next', function(){ playClick(); showVeterinaryMode(); });
  bindBtn('btn-vet-lb2', function(){ playClick(); showVeterinaryLeaderboard(); });
  bindBtn('btn-vet-back2', function(){ playClick(); showTitle(); });
}

function saveVeterinaryScore(animal, score, accuracy){
  var key = 'scalpel_veterinary';
  var best = null;
  try { best = JSON.parse(localStorage.getItem(key)); } catch(e){}
  if(!best || score > (best.score || 0)){
    best = { animal:animal, score:score, accuracy:accuracy };
    try { localStorage.setItem(key, JSON.stringify(best)); } catch(e){}
  }
  vetBest = best;
}

function showVeterinaryLeaderboard(){
  var best = null;
  try { best = JSON.parse(localStorage.getItem('scalpel_veterinary')); } catch(e){}

  var html = '<h2 style="margin-bottom:16px;letter-spacing:2px">🐕 VETERINARY — Leaderboard</h2>' +
    '<div id="results-card" style="text-align:center;border-color:#27ae6030">';

  if(best){
    var animal = G.VETERINARY.animals[best.animal];
    html += '<div style="font-size:2rem;margin-bottom:8px">' + (animal ? animal.emoji : '🐾') + '</div>' +
      '<div style="font-size:1.2rem;color:#27ae60;font-weight:700;margin-bottom:8px">' + best.score + ' pts</div>' +
      '<div style="font-size:.85rem;color:#8a9bb5;margin-bottom:4px">Animal: ' + (animal ? animal.name : best.animal) + '</div>' +
      '<div style="font-size:.75rem;color:#8a9bb5">Accuracy: ' + best.accuracy + '%</div>';
  } else {
    html += '<div style="font-size:2rem;margin-bottom:8px">🐾</div>' +
      '<div style="font-size:.85rem;color:#5a6a80">No record yet. Start operating!</div>';
  }
  html += '</div>';
  html += '<button class="menu-btn primary" id="btn-vlb-play">🐕 Start Operating</button>';
  html += '<button class="menu-btn" id="btn-vlb-back">← Back</button>';
  showOverlay(html);
  bindBtn('btn-vlb-play', function(){ playClick(); showVeterinaryMode(); });
  bindBtn('btn-vlb-back', function(){ playClick(); showTitle(); });
}

/* ═══════════════ TUTORIAL ═══════════════ */
var tutorialQuizScore = 0;
var tutorialQuizIndex = 0;

function showTutorial(){
  STATE = 'tutorial';
  var html = '<h2 style="margin-bottom:8px;letter-spacing:2px">🎓 SURGICAL GUIDE</h2>' +
    '<div class="subtitle" style="font-size:.7rem;color:#8a9bb5;margin-bottom:12px">Learn every instrument and when to use it</div>' +
    '<div id="results-card" style="text-align:center;border-color:#f39c1230">' +
      '<div style="font-size:2rem;margin-bottom:8px">🎓</div>' +
      '<div style="font-size:.85rem;color:#f39c12;font-weight:700;margin-bottom:8px">What would you like to learn?</div>' +
    '</div>' +
    '<button class="menu-btn" id="btn-tut-instruments" style="border-color:#f39c12">🩺 INSTRUMENT GUIDE</button>' +
    '<button class="menu-btn" id="btn-tut-steptypes" style="border-color:#3498db">📖 STEP TYPES</button>' +
    '<button class="menu-btn" id="btn-tut-quiz" style="border-color:#e74c3c">🧪 PRACTICE QUIZ</button>' +
    '<button class="menu-btn" id="btn-tut-back">← Back</button>';
  showOverlay(html);
  bindBtn('btn-tut-instruments', function(){ playClick(); showInstrumentGuide(); });
  bindBtn('btn-tut-steptypes', function(){ playClick(); showStepTypesGuide(); });
  bindBtn('btn-tut-quiz', function(){ playClick(); showQuiz(); });
  bindBtn('btn-tut-back', function(){ playClick(); showTitle(); });
}

function showInstrumentGuide(){
  STATE = 'tutorial_instruments';
  var html = '<h2 style="margin-bottom:8px;letter-spacing:2px">🩺 INSTRUMENT GUIDE</h2>' +
    '<div class="subtitle" style="font-size:.7rem;color:#8a9bb5;margin-bottom:12px">Select an instrument to learn about it</div>' +
    '<div id="chapter-select" style="max-height:60vh;overflow-y:auto">';
  
  var instruments = G.TUTORIAL.instruments;
  var keys = Object.keys(instruments);
  for(var i=0;i<keys.length;i++){
    var inst = D.INSTRUMENTS[keys[i]];
    var tut = instruments[keys[i]];
    if(!inst) continue;
    html += '<div class="ch" id="btn-inst-' + keys[i] + '" style="cursor:pointer">' +
      '<div class="ch-icon">' + inst.icon + '</div>' +
      '<div class="ch-info">' +
        '<div class="ch-title">' + inst.name + '</div>' +
        '<div class="ch-sub">' + inst.desc + '</div>' +
      '</div>' +
    '</div>';
  }
  html += '</div>';
  html += '<button class="menu-btn" id="btn-ig-back" style="margin-top:16px">← Back</button>';
  showOverlay(html);
  
  for(var i=0;i<keys.length;i++){
    (function(instId){
      bindBtn('btn-inst-' + instId, function(){ playClick(); showInstrumentDetail(instId); });
    })(keys[i]);
  }
  bindBtn('btn-ig-back', function(){ playClick(); showTutorial(); });
}

function showInstrumentDetail(instrumentId){
  STATE = 'tutorial_detail';
  var inst = D.INSTRUMENTS[instrumentId];
  var tut = G.TUTORIAL.instruments[instrumentId];
  if(!inst || !tut){ showInstrumentGuide(); return; }
  
  var instKeys = Object.keys(G.TUTORIAL.instruments);
  var currentIdx = instKeys.indexOf(instrumentId);
  var prevInst = currentIdx > 0 ? instKeys[currentIdx-1] : null;
  var nextInst = currentIdx < instKeys.length-1 ? instKeys[currentIdx+1] : null;
  var prevName = prevInst ? D.INSTRUMENTS[prevInst].name : null;
  var nextName = nextInst ? D.INSTRUMENTS[nextInst].name : null;
  
  var chapterList = '';
  for(var i=0;i<tut.chapters.length;i++){
    var ch = D.CHAPTERS[tut.chapters[i]-1];
    if(ch) chapterList += '<span style="display:inline-block;padding:2px 8px;margin:2px;border-radius:6px;background:rgba(243,156,18,.15);border:1px solid rgba(243,156,18,.3);font-size:.6rem;color:#f39c12">Ch' + ch.id + ': ' + ch.title + '</span>';
  }
  
  var stepTypeList = '';
  for(var i=0;i<tut.stepTypes.length;i++){
    var st = G.TUTORIAL.stepTypes[tut.stepTypes[i]];
    if(st) stepTypeList += '<span style="display:inline-block;padding:2px 8px;margin:2px;border-radius:6px;background:rgba(52,152,219,.15);border:1px solid rgba(52,152,219,.3);font-size:.6rem;color:#3498db">' + st.icon + ' ' + st.name + '</span>';
  }
  
  var html = '<h2 style="margin-bottom:8px;letter-spacing:2px">' + inst.icon + ' ' + inst.name.toUpperCase() + '</h2>' +
    '<div id="results-card" style="text-align:center;border-color:' + inst.color + '30">' +
      '<div style="font-size:3rem;margin-bottom:8px">' + inst.icon + '</div>' +
      '<div style="font-size:.85rem;color:' + inst.color + ';font-weight:700;margin-bottom:8px">"' + inst.desc + '"</div>' +
    '</div>' +
    '<div style="margin:8px 0">' +
      '<div style="font-size:.65rem;color:#f39c12;font-weight:700;margin-bottom:4px">USED WHEN:</div>' +
      '<ul style="margin:0;padding-left:20px;font-size:.7rem;color:#bdc3c7">';
  for(var i=0;i<tut.uses.length;i++){
    html += '<li>' + tut.uses[i] + '</li>';
  }
  html += '</ul></div>' +
    '<div style="margin:8px 0">' +
      '<div style="font-size:.65rem;color:#3498db;font-weight:700;margin-bottom:4px">STEP TYPES:</div>' +
      '<div>' + stepTypeList + '</div>' +
    '</div>' +
    '<div style="margin:8px 0">' +
      '<div style="font-size:.65rem;color:#9b59b6;font-weight:700;margin-bottom:4px">FOUND IN:</div>' +
      '<div>' + chapterList + '</div>' +
    '</div>' +
    '<div style="margin:8px 0;padding:8px;border-radius:8px;background:rgba(46,204,113,.1);border:1px solid rgba(46,204,113,.3)">' +
      '<div style="font-size:.65rem;color:#2ecc71;font-weight:700">💡 TIP:</div>' +
      '<div style="font-size:.7rem;color:#bdc3c7">' + tut.tip + '</div>' +
    '</div>';
  
  html += '<div style="display:flex;gap:8px;margin-top:12px">';
  if(prevInst) html += '<button class="menu-btn" id="btn-inst-prev" style="flex:1">← ' + prevName + '</button>';
  if(nextInst) html += '<button class="menu-btn" id="btn-inst-next" style="flex:1">' + nextName + ' →</button>';
  html += '</div>';
  html += '<button class="menu-btn" id="btn-id-back" style="margin-top:8px">← Back to Guide</button>';
  showOverlay(html);
  
  if(prevInst) bindBtn('btn-inst-prev', function(){ playClick(); showInstrumentDetail(prevInst); });
  if(nextInst) bindBtn('btn-inst-next', function(){ playClick(); showInstrumentDetail(nextInst); });
  bindBtn('btn-id-back', function(){ playClick(); showInstrumentGuide(); });
}

function showStepTypesGuide(){
  STATE = 'tutorial_steptypes';
  var html = '<h2 style="margin-bottom:8px;letter-spacing:2px">📖 STEP TYPES</h2>' +
    '<div class="subtitle" style="font-size:.7rem;color:#8a9bb5;margin-bottom:12px">Learn the different actions you\'ll perform</div>' +
    '<div id="chapter-select" style="max-height:60vh;overflow-y:auto">';
  
  var stepTypes = G.TUTORIAL.stepTypes;
  var keys = Object.keys(stepTypes);
  for(var i=0;i<keys.length;i++){
    var st = stepTypes[keys[i]];
    html += '<div class="ch">' +
      '<div class="ch-icon">' + st.icon + '</div>' +
      '<div class="ch-info">' +
        '<div class="ch-title">' + st.name + '</div>' +
        '<div class="ch-sub">' + st.desc + '</div>' +
      '</div>' +
    '</div>';
    html += '<div style="padding:4px 16px 8px;font-size:.65rem;color:#8a9bb5;border-bottom:1px solid rgba(255,255,255,.05)">' +
      '<div><strong style="color:#f39c12">Uses:</strong> ' + st.uses + '</div>' +
      '<div><strong style="color:#3498db">Example:</strong> ' + st.example + '</div>' +
    '</div>';
  }
  html += '</div>';
  html += '<button class="menu-btn" id="btn-st-back" style="margin-top:16px">← Back</button>';
  showOverlay(html);
  bindBtn('btn-st-back', function(){ playClick(); showTutorial(); });
}

function showQuiz(){
  STATE = 'tutorial_quiz';
  tutorialQuizScore = 0;
  tutorialQuizIndex = 0;
  showQuizQuestion();
}

function showQuizQuestion(){
  if(tutorialQuizIndex >= G.TUTORIAL.quiz.length){
    showQuizResults();
    return;
  }
  
  var quiz = G.TUTORIAL.quiz[tutorialQuizIndex];
  var html = '<h2 style="margin-bottom:8px;letter-spacing:2px">🧪 SURGICAL QUIZ</h2>' +
    '<div style="font-size:.75rem;color:#f39c12;text-align:center;margin-bottom:8px">Question ' + (tutorialQuizIndex+1) + '/' + G.TUTORIAL.quiz.length + '</div>' +
    '<div style="width:100%;height:4px;background:rgba(255,255,255,.1);border-radius:2px;overflow:hidden;margin-bottom:12px">' +
      '<div style="width:' + ((tutorialQuizIndex/G.TUTORIAL.quiz.length)*100) + '%;height:100%;background:#f39c12;border-radius:2px;transition:width .3s"></div>' +
    '</div>' +
    '<div id="results-card" style="text-align:center;border-color:#f39c1230">' +
      '<div style="font-size:.85rem;color:#ecf0f1;font-weight:700;margin-bottom:16px">' + quiz.q + '</div>';
  
  for(var i=0;i<quiz.a.length;i++){
    html += '<button class="menu-btn quiz-answer" id="btn-quiz-' + i + '" style="margin:4px 0;width:100%;text-align:left;padding:10px 16px">' + quiz.a[i] + '</button>';
  }
  
  html += '</div>' +
    '<div style="font-size:.7rem;color:#8a9bb5;text-align:center;margin-top:8px">Score: ' + tutorialQuizScore + '/' + G.TUTORIAL.quiz.length + '</div>';
  showOverlay(html);
  
  for(var i=0;i<quiz.a.length;i++){
    (function(answerIdx){
      bindBtn('btn-quiz-' + answerIdx, function(){
        playClick();
        checkQuizAnswer(answerIdx);
      });
    })(i);
  }
}

function checkQuizAnswer(answerIdx){
  var quiz = G.TUTORIAL.quiz[tutorialQuizIndex];
  var correct = answerIdx === quiz.correct;
  
  if(correct){
    tutorialQuizScore++;
    showAccuracy('✓ Correct! ' + quiz.explain, true);
  } else {
    showAccuracy('✗ Wrong! ' + quiz.explain, false);
  }
  
  tutorialQuizIndex++;
  setTimeout(function(){
    showQuizQuestion();
  }, 1500);
}

function showQuizResults(){
  STATE = 'tutorial_results';
  var total = G.TUTORIAL.quiz.length;
  var pct = Math.round((tutorialQuizScore / total) * 100);
  
  var grade, gradeColor;
  if(pct === 100){
    grade = '🏆 SURGICAL MASTER';
    gradeColor = '#f1c40f';
  } else if(pct >= 80){
    grade = '⭐ WELL TRAINED';
    gradeColor = '#27ae60';
  } else if(pct >= 50){
    grade = '👍 KEEP LEARNING';
    gradeColor = '#f39c12';
  } else {
    grade = '📚 STUDY MORE';
    gradeColor = '#e74c3c';
  }
  
  /* save quiz result */
  var best = null;
  try { best = JSON.parse(localStorage.getItem('scalpel_tutorial_quiz')); } catch(e){}
  if(!best || tutorialQuizScore > (best.score || 0)){
    best = { score:tutorialQuizScore, total:total, grade:grade };
    try { localStorage.setItem('scalpel_tutorial_quiz', JSON.stringify(best)); } catch(e){}
  }
  
  showOverlay(
    '<div id="results-card" style="text-align:center;border-color:#f39c1230">' +
      '<div style="font-size:3rem;margin-bottom:8px">🎓</div>' +
      '<div class="grade" style="color:' + gradeColor + '">' + grade + '</div>' +
      '<div class="score">' + tutorialQuizScore + '/' + total + ' correct</div>' +
      '<div class="detail">' + pct + '% accuracy · ' + (tutorialQuizScore * 100) + ' pts</div>' +
      (pct === 100 ? '<div style="font-size:.75rem;color:#f1c40f;font-weight:700;margin-top:8px">🏆 PERFECT SCORE!</div>' : '') +
    '</div>' +
    '<button class="menu-btn primary" id="btn-qr-retry">🔄 RETRY QUIZ</button>' +
    '<button class="menu-btn" id="btn-qr-back">← Back</button>'
  );
  bindBtn('btn-qr-retry', function(){ playClick(); showQuiz(); });
  bindBtn('btn-qr-back', function(){ playClick(); showTutorial(); });
}

/* ═══════════════ UTILS ═══════════════ */
function bindBtn(id, fn){
  var el = document.getElementById(id);
  if(el) el.addEventListener('click', fn);
}

function addScore(pts){
  score = Math.max(0, score + pts);
  updateHUD();
}

function playPowerup(){
  playSound('hit');
  haptic(15);
}

/* ═══════════════ BOOT ═══════════════ */
if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

})();
