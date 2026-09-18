/*  precision-skating-game/js/game.js  */
'use strict';

/* ═══════════════════════════════════════════
   PRECISION SKATING — CORE ENGINE
   ═══════════════════════════════════════════ */

(function () {
  /* ── helpers ── */
  var $ = function (id) { return document.getElementById(id); };

  /* ── state ── */
  var lang = (localStorage.getItem('ps-lang') || 'en');
  var W = 0, H = 0, DPR = 1;
  var canvas, ctx;
  var running = false, paused = false, gameOver = false;
  var startTime = 0, elapsed = 0;
  var programIdx = 0;
  var audioCtx = null;
  var soundOn = true;

  /* ── scores ── */
  var score = { technical: 0, execution: 0, artistic: 0, penalties: 0, combo: 0, maxCombo: 0 };
  var comboCount = 0;

  /* ── beat system ── */
  var beats = [];        /* { timeMs, hit:false, x:0 } */
  var beatIdx = 0;       /* next beat to hit */
  var bpm = 120;
  var beatIntervalMs = 60000 / bpm;
  var BEAT_WINDOW_PERFECT = 80;   /* ms */
  var BEAT_WINDOW_GOOD = 160;

  /* ── skaters on canvas ── */
  var skaterState = [];  /* { x, y, tx, ty, drifting, driftTimer, corrected } */

  /* ── rink geometry (set on resize) ── */
  var rinkX = 0, rinkY = 0, rinkW = 0, rinkH = 0;

  /* ── toast ── */
  var toastTimer = 0;
  var toastText = '';

  /* ── rink offset for travel ── */
  var travelOffsetX = 0;

  /* ═══════════════════════════════════════════
     CANVAS SETUP & RESIZE
     ═══════════════════════════════════════════ */

  function resize() {
    W = window.innerWidth;
    H = window.innerHeight;
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

    /* rink: 85% width, 60% height, centered */
    rinkW = W * 0.85;
    rinkH = H * 0.55;
    rinkX = (W - rinkW) / 2;
    rinkY = H * 0.18;
  }

  /* ═══════════════════════════════════════════
     AUDIO (Web Audio API — procedural)
     ═══════════════════════════════════════════ */

  function initAudio() {
    if (audioCtx) return;
    try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
    catch (e) { audioCtx = null; }
  }

  function resumeAudio() {
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
  }

  function playTone(freq, dur, vol, type) {
    if (!audioCtx || !soundOn) return;
    var osc = audioCtx.createOscillator();
    var gain = audioCtx.createGain();
    osc.type = type || 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol || 0.15, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + dur);
  }

  function sfxBeat()     { playTone(880, 0.06, 0.10, 'sine'); }
  function sfxPerfect()  { playTone(1200, 0.10, 0.18, 'sine'); playTone(1500, 0.10, 0.12, 'sine'); }
  function sfxGood()     { playTone(900, 0.08, 0.12, 'sine'); }
  function sfxMiss()     { playTone(220, 0.15, 0.15, 'sawtooth'); }
  function sfxDrift()    { playTone(440, 0.12, 0.08, 'triangle'); }
  function sfxCorrect()  { playTone(1000, 0.08, 0.14, 'sine'); playTone(1300, 0.08, 0.10, 'sine'); }
  function sfxElement()  { playTone(660, 0.12, 0.15, 'sine'); playTone(880, 0.12, 0.12, 'sine'); playTone(1100, 0.15, 0.10, 'sine'); }

  /* ── haptics ── */
  function vibrate(pattern) {
    if (navigator.vibrate) navigator.vibrate(pattern);
  }

  /* ═══════════════════════════════════════════
     FORMATION ENGINE
     ═══════════════════════════════════════════ */

  function computeTargets(variant) {
    var fn = FORMATIONS[variant];
    if (!fn) fn = FORMATIONS.LINE;
    return fn(); /* returns [{x,y}, ...] normalized 0-1 */
  }

  function normalizedToCanvas(npts) {
    return npts.map(function (p) {
      return { x: rinkX + p.x * rinkW + travelOffsetX, y: rinkY + p.y * rinkH };
    });
  }

  function initSkaters() {
    skaterState = [];
    var targets = normalizedToCanvas(computeTargets(PROGRAM[0].variant));
    for (var i = 0; i < 16; i++) {
      var t = targets[i] || { x: rinkX + rinkW / 2, y: rinkY + rinkH / 2 };
      skaterState.push({
        x: t.x, y: t.y,
        tx: t.x, ty: t.y,
        drifting: false,
        driftTimer: 0,
        corrected: false,
        driftTargetX: 0,
        driftTargetY: 0
      });
    }
  }

  function updateSkaters(dt) {
    var speed = 2.5; /* lerp factor per second */
    for (var i = 0; i < 16; i++) {
      var s = skaterState[i];
      if (s.drifting) {
        /* drift toward random offset */
        var dx = s.driftTargetX - s.x;
        var dy = s.driftTargetY - s.y;
        s.x += dx * Math.min(1, dt * 1.5);
        s.y += dy * Math.min(1, dt * 1.5);
      } else {
        /* move toward formation target */
        s.x += (s.tx - s.x) * Math.min(1, dt * speed);
        s.y += (s.ty - s.y) * Math.min(1, dt * speed);
      }
    }
  }

  /* ═══════════════════════════════════════════
     DRIFT SYSTEM
     ═══════════════════════════════════════════ */

  function checkDrifts(elapsedMs) {
    var el = PROGRAM[programIdx];
    if (!el) return;
    var diffMult = DIFF_MULT[el.diff] || 1;
    for (var i = 0; i < 16; i++) {
      var s = skaterState[i];
      var skater = SKATERS[i];
      if (s.drifting) continue;
      /* base drift probability per second */
      var driftProb = 0.12 * diffMult * (1 - skater.precision / 200);
      if (Math.random() < driftProb * (1 / 60)) {
        triggerDrift(i);
      }
    }
  }

  function triggerDrift(idx) {
    var s = skaterState[idx];
    s.drifting = true;
    s.driftTimer = 0;
    var offset = 15 + Math.random() * 25;
    var angle = Math.random() * Math.PI * 2;
    s.driftTargetX = s.tx + Math.cos(angle) * offset;
    s.driftTargetY = s.ty + Math.sin(angle) * offset;
    sdriftAlert = idx; /* for visual warning */
  }

  var sdriftAlert = -1; /* last skater that started drifting */

  function correctDrift(idx) {
    var s = skaterState[idx];
    if (!s.drifting) return false;
    s.drifting = false;
    s.driftTimer = 0;
    s.corrected = true;
    comboCount++;
    if (comboCount > score.maxCombo) score.maxCombo = comboCount;
    score.execution += 1;
    sfxCorrect();
    vibrate([15, 15, 15]);
    showToast(STR[lang].corrected, '#a7f3d0');
    setTimeout(function () { s.corrected = false; }, 500);
    return true;
  }

  /* ═══════════════════════════════════════════
     BEAT / TIMING SYSTEM
     ═══════════════════════════════════════════ */

  function generateBeats() {
    beats = [];
    var el = PROGRAM[programIdx];
    if (!el) return;
    var count = beatsForElement(el);
    var gap = el.durMs / count;
    for (var i = 0; i < count; i++) {
      beats.push({ timeMs: el.startMs + i * gap, hit: false, x: 0 });
    }
  }

  function handleTap() {
    if (!running || paused || gameOver) return;
    var now = elapsed;

    /* check if any unhit beat is within tap window */
    for (var i = 0; i < beats.length; i++) {
      var b = beats[i];
      if (b.hit) continue;
      var diff = Math.abs(now - b.timeMs);
      if (diff <= BEAT_WINDOW_PERFECT) {
        b.hit = true;
        score.execution += 2;
        comboCount++;
        if (comboCount > score.maxCombo) score.maxCombo = comboCount;
        sfxPerfect();
        vibrate([10]);
        showToast(STR[lang].perfect, '#ffd700');
        return;
      } else if (diff <= BEAT_WINDOW_GOOD) {
        b.hit = true;
        score.execution += 1;
        comboCount++;
        if (comboCount > score.maxCombo) score.maxCombo = comboCount;
        sfxGood();
        vibrate([8]);
        showToast(STR[lang].good, '#a7f3d0');
        return;
      }
    }
    /* no beat in window = miss */
    comboCount = 0;
    score.penalties -= 0.5;
    sfxMiss();
    vibrate([30, 20, 30]);
    showToast(STR[lang].miss, '#fca5a5');
  }

  function checkMissedBeats() {
    for (var i = 0; i < beats.length; i++) {
      var b = beats[i];
      if (!b.hit && elapsed > b.timeMs + BEAT_WINDOW_GOOD + 50) {
        b.hit = true; /* mark as missed */
        comboCount = 0;
        score.penalties -= 0.5;
      }
    }
  }

  /* ═══════════════════════════════════════════
     ELEMENT TRANSITIONS
     ═══════════════════════════════════════════ */

  function checkElementTransition() {
    var el = PROGRAM[programIdx];
    if (!el) return;
    if (elapsed >= el.startMs + el.durMs) {
      /* element done */
      score.technical += 5 + el.level * 2;
      sfxElement();
      showToast(STR[lang].elementDone + ': ' + (lang === 'it' ? el.name_it : el.name_en), '#c084fc');

      /* uncorrected drifts penalty */
      for (var i = 0; i < 16; i++) {
        if (skaterState[i].drifting) {
          score.penalties -= 1;
        }
      }

      programIdx++;
      if (programIdx >= PROGRAM.length) {
        endRoutine();
        return;
      }
      /* set new targets */
      travelOffsetX = 0;
      var newTargets = normalizedToCanvas(computeTargets(PROGRAM[programIdx].variant));
      for (var j = 0; j < 16; j++) {
        skaterState[j].tx = newTargets[j].x;
        skaterState[j].ty = newTargets[j].y;
        skaterState[j].drifting = false;
      }
      generateBeats();
    }
  }

  /* ═══════════════════════════════════════════
     SCORING
     ═══════════════════════════════════════════ */

  function calcComboBonus() {
    return Math.min(5, Math.floor(score.maxCombo / 5));
  }

  function calcTotal() {
    return Math.max(0,
      score.technical +
      score.execution +
      Math.max(0, score.artistic) +
      score.penalties +
      calcComboBonus()
    );
  }

  /* ═══════════════════════════════════════════
     RENDERING
     ═══════════════════════════════════════════ */

  function drawRink() {
    /* rink surface */
    ctx.fillStyle = '#f0d4e8';
    ctx.beginPath();
    roundedRect(rinkX, rinkY, rinkW, rinkH, 18);
    ctx.fill();

    /* rink border */
    ctx.strokeStyle = '#d4a0c0';
    ctx.lineWidth = 3;
    ctx.beginPath();
    roundedRect(rinkX, rinkY, rinkW, rinkH, 18);
    ctx.stroke();

    /* center line */
    ctx.strokeStyle = 'rgba(180,130,170,0.3)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(rinkX + rinkW / 2, rinkY + 10);
    ctx.lineTo(rinkX + rinkW / 2, rinkY + rinkH - 10);
    ctx.stroke();
    ctx.setLineDash([]);

    /* center circle */
    ctx.beginPath();
    ctx.arc(rinkX + rinkW / 2, rinkY + rinkH / 2, 30, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(180,130,170,0.25)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  function drawSkaters() {
    for (var i = 0; i < 16; i++) {
      var s = skaterState[i];
      var color = SKATER_COLORS[i];
      var r = 8;

      /* target ring (ghost position) */
      ctx.beginPath();
      ctx.arc(s.tx, s.ty, r + 3, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(180,130,170,0.3)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      /* drift warning halo */
      if (s.drifting) {
        ctx.beginPath();
        ctx.arc(s.x, s.y, r + 8 + Math.sin(elapsed / 100) * 3, 0, Math.PI * 2);
        ctx.strokeStyle = '#ff6b9d';
        ctx.lineWidth = 2.5;
        ctx.globalAlpha = 0.6 + Math.sin(elapsed / 80) * 0.3;
        ctx.stroke();
        ctx.globalAlpha = 1;
      }

      /* correction flash */
      if (s.corrected) {
        ctx.beginPath();
        ctx.arc(s.x, s.y, r + 12, 0, Math.PI * 2);
        ctx.strokeStyle = '#a7f3d0';
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.7;
        ctx.stroke();
        ctx.globalAlpha = 1;
      }

      /* skater dot */
      ctx.beginPath();
      ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.5)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      /* name initial */
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 8px -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(SKATERS[i].name[0], s.x, s.y + 0.5);
    }
  }

  function drawBeatBar() {
    var barY = H - 80;
    var barH = 40;
    var barLeft = 20;
    var barW = W - 40;
    var currentEl = PROGRAM[programIdx];
    if (!currentEl) return;

    /* bar background */
    ctx.fillStyle = 'rgba(30,15,30,0.75)';
    ctx.beginPath();
    roundedRect(barLeft, barY, barW, barH, 20);
    ctx.fill();

    /* perfect zone (center) */
    var zoneW = barW * 0.12;
    var zoneX = barLeft + barW / 2 - zoneW / 2;
    ctx.fillStyle = 'rgba(255,107,157,0.35)';
    ctx.beginPath();
    roundedRect(zoneX, barY + 4, zoneW, barH - 8, 16);
    ctx.fill();

    /* good zones (wider) */
    var goodW = barW * 0.25;
    var goodXL = barLeft + barW / 2 - goodW / 2;
    ctx.fillStyle = 'rgba(255,107,157,0.12)';
    ctx.beginPath();
    roundedRect(goodXL, barY + 6, goodW, barH - 12, 14);
    ctx.fill();

    /* center beat line */
    ctx.strokeStyle = '#ff6b9d';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(barLeft + barW / 2, barY + 2);
    ctx.lineTo(barLeft + barW / 2, barY + barH - 2);
    ctx.stroke();

    /* beat markers */
    var elStart = currentEl.startMs;
    var elDur = currentEl.durMs;
    for (var i = 0; i < beats.length; i++) {
      var b = beats[i];
      var progress = (b.timeMs - elStart) / elDur;
      var relProgress = progress - (elapsed - elStart) / elDur;
      var mx = barLeft + barW / 2 + relProgress * barW * 0.45;

      if (mx < barLeft - 10 || mx > barLeft + barW + 10) continue;

      if (b.hit) {
        ctx.fillStyle = 'rgba(167,243,208,0.4)';
      } else {
        ctx.fillStyle = '#ff6b9d';
      }
      ctx.beginPath();
      ctx.arc(mx, barY + barH / 2, b.hit ? 4 : 6, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawHUD() {
    var top = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--safe-top')) || 12;
    var left = 16;
    var chipH = 28;
    var gap = 8;

    /* score */
    drawChip(left, top + 8, STR[lang].score + ': ' + Math.round(calcTotal()), '#ff6b9d');

    /* timer */
    var remaining = Math.max(0, Math.ceil((PROGRAM[PROGRAM.length - 1].startMs + PROGRAM[PROGRAM.length - 1].durMs - elapsed) / 1000));
    var min = Math.floor(remaining / 60);
    var sec = remaining % 60;
    drawChip(left + 120, top + 8, STR[lang].time + ': ' + min + ':' + (sec < 10 ? '0' : '') + sec, '#c084fc');

    /* combo */
    if (comboCount > 2) {
      drawChip(left + 270, top + 8, STR[lang].combo + ': ' + comboCount + 'x', '#ffd700');
    }

    /* current element */
    var el = PROGRAM[programIdx];
    if (el) {
      var elName = lang === 'it' ? el.name_it : el.name_en;
      drawChip(left, top + 44, STR[lang].element + ': ' + elName, '#60a5fa');
    }
  }

  function drawChip(x, y, text, color) {
    ctx.font = 'bold 12px -apple-system, sans-serif';
    var tw = ctx.measureText(text).width;
    var pw = 12, ph = 6;
    var cw = tw + pw * 2;
    var ch = 24;

    ctx.fillStyle = 'rgba(30,15,30,0.85)';
    ctx.beginPath();
    roundedRect(x, y, cw, ch, 10);
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    roundedRect(x, y, cw, ch, 10);
    ctx.stroke();

    ctx.fillStyle = color;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x + pw, y + ch / 2);
  }

  function drawToast() {
    if (toastTimer <= 0) return;
    var alpha = Math.min(1, toastTimer / 200);
    var tw = ctx.measureText(toastText).width;
    var pw = 18, ph = 8;
    var x = W / 2 - (tw + pw * 2) / 2;
    var y = rinkY - 40;

    ctx.globalAlpha = alpha;
    ctx.fillStyle = 'rgba(30,15,30,0.9)';
    ctx.beginPath();
    roundedRect(x, y, tw + pw * 2, 30, 15);
    ctx.fill();
    ctx.fillStyle = '#fce4f0';
    ctx.font = 'bold 13px -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(toastText, W / 2, y + 15);
    ctx.globalAlpha = 1;
  }

  function roundedRect(x, y, w, h, r) {
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  /* ═══════════════════════════════════════════
     OVERLAYS
     ═══════════════════════════════════════════ */

  function showOverlay(id) { $(id).classList.remove('hidden'); }
  function hideOverlay(id) { $(id).classList.add('hidden'); }

  function updateOverlayTexts() {
    var s = STR[lang];
    $('titleText').textContent = s.title;
    $('subtitleText').textContent = s.subtitle;
    $('btnPlayText').textContent = s.play;
    $('btnLangText').textContent = s.lang;
    $('btnResumeText').textContent = s.resume;
    $('btnRestartText').textContent = s.restart;
    $('btnQuitText').textContent = s.quit;
    $('pauseTitle').textContent = s.pause;
  }

  function showResults() {
    var s = STR[lang];
    $('resTechnical').textContent = s.technical + ': ' + Math.round(score.technical);
    $('resExecution').textContent = s.execution + ': ' + Math.round(score.execution);
    $('resPenalties').textContent = s.penalties + ': ' + Math.round(score.penalties);
    $('resCombo').textContent = s.comboBonus + ': ' + calcComboBonus();
    $('resTotal').textContent = s.total + ': ' + Math.round(calcTotal());
    $('routineDoneText').textContent = s.routineDone;
    showOverlay('resultsOverlay');
  }

  /* ═══════════════════════════════════════════
     TOAST
     ═══════════════════════════════════════════ */

  function showToast(text, color) {
    toastText = text;
    toastTimer = 800;
  }

  /* ═══════════════════════════════════════════
     GAME LOOP
     ═══════════════════════════════════════════ */

  var lastFrame = 0;

  function loop(ts) {
    requestAnimationFrame(loop);
    if (!lastFrame) lastFrame = ts;
    var dt = Math.min((ts - lastFrame) / 1000, 0.05);
    lastFrame = ts;

    if (!running || paused || gameOver) {
      drawFrame();
      return;
    }

    elapsed = performance.now() - startTime;

    /* update */
    checkDrifts(elapsed);
    updateSkaters(dt);
    checkMissedBeats();
    checkElementTransition();

    /* travel offset for traveling elements */
    var el = PROGRAM[programIdx];
    if (el && el.variant === 'TRAVELING') {
      travelOffsetX = ((elapsed - el.startMs) / el.durMs) * rinkW * 0.15;
    }

    /* toast timer */
    if (toastTimer > 0) toastTimer -= dt * 1000;

    drawFrame();
  }

  function drawFrame() {
    ctx.clearRect(0, 0, W, H);

    /* background */
    ctx.fillStyle = '#1a0f1e';
    ctx.fillRect(0, 0, W, H);

    /* rink */
    drawRink();

    /* skaters */
    drawSkaters();

    /* beat bar */
    if (running && !paused && !gameOver) {
      drawBeatBar();
    }

    /* HUD */
    drawHUD();

    /* toast */
    drawToast();

    /* hints */
    if (running && !paused && !gameOver && elapsed < 3000) {
      var hintAlpha = Math.max(0, 1 - elapsed / 3000);
      ctx.globalAlpha = hintAlpha;
      ctx.fillStyle = '#fce4f0';
      ctx.font = 'bold 14px -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(STR[lang].tapHint, W / 2, rinkY + rinkH + 30);
      ctx.font = '11px -apple-system, sans-serif';
      ctx.fillStyle = 'rgba(252,228,240,0.6)';
      var hint = ('ontouchstart' in window) ? '' : (window._isDesktopHint || STR[lang].spaceHint);
      if (hint) ctx.fillText(hint, W / 2, rinkY + rinkH + 48);
      ctx.globalAlpha = 1;
    }
  }

  /* ═══════════════════════════════════════════
     GAME CONTROL
     ═══════════════════════════════════════════ */

  function startGame() {
    initAudio();
    resumeAudio();
    score = { technical: 0, execution: 0, artistic: 0, penalties: 0, combo: 0, maxCombo: 0 };
    comboCount = 0;
    programIdx = 0;
    travelOffsetX = 0;
    elapsed = 0;
    gameOver = false;
    paused = false;
    running = true;
    lastFrame = 0;
    startTime = performance.now();
    resize();
    initSkaters();
    generateBeats();
    hideOverlay('startOverlay');
    hideOverlay('resultsOverlay');
    hideOverlay('pauseOverlay');
  }

  function pauseGame() {
    if (!running || gameOver) return;
    paused = true;
    showOverlay('pauseOverlay');
  }

  function resumeGame() {
    paused = false;
    startTime = performance.now() - elapsed;
    lastFrame = 0;
    hideOverlay('pauseOverlay');
  }

  function endRoutine() {
    running = false;
    gameOver = true;
    score.artistic = Math.round(Math.max(0, 20 - score.penalties * -0.5));
    showResults();
    sfxElement();
  }

  function quitGame() {
    running = false;
    paused = false;
    gameOver = false;
    hideOverlay('pauseOverlay');
    hideOverlay('resultsOverlay');
    showOverlay('startOverlay');
  }

  /* ═══════════════════════════════════════════
     INPUT
     ═══════════════════════════════════════════ */

  /* canvas tap (beat timing) */
  function onCanvasTap(e) {
    if (!running || paused || gameOver) return;
    initAudio();
    resumeAudio();
    handleTap();
    e.preventDefault();
  }

  /* skater tap (correction) */
  function onCanvasTapSkater(e) {
    if (!running || paused || gameOver) return;
    var rect = canvas.getBoundingClientRect();
    var cx, cy;
    if (e.touches) {
      cx = e.touches[0].clientX - rect.left;
      cy = e.touches[0].clientY - rect.top;
    } else {
      cx = e.clientX - rect.left;
      cy = e.clientY - rect.top;
    }
    var hitRadius = 20;
    for (var i = 0; i < 16; i++) {
      var s = skaterState[i];
      var dx = cx - s.x;
      var dy = cy - s.y;
      if (dx * dx + dy * dy < hitRadius * hitRadius) {
        if (correctDrift(i)) {
          e.preventDefault();
          return;
        }
      }
    }
    /* no skater hit — treat as beat tap */
    onCanvasTap(e);
  }

  /* keyboard */
  function onKeyDown(e) {
    if (e.code === 'Space' || e.key === ' ') {
      e.preventDefault();
      initAudio();
      resumeAudio();
      if (!running) { startGame(); return; }
      if (paused) { resumeGame(); return; }
      handleTap();
    }
    if (e.code === 'Escape' || e.key === 'Escape') {
      if (running && !gameOver) {
        if (paused) resumeGame(); else pauseGame();
      }
    }
  }

  /* ═══════════════════════════════════════════
     INIT
     ═══════════════════════════════════════════ */

  function init() {
    canvas = $('c');
    ctx = canvas.getContext('2d');
    resize();
    window.addEventListener('resize', resize);

    /* touch/click on canvas */
    canvas.addEventListener('touchstart', function (e) {
      e.preventDefault();
      initAudio();
      resumeAudio();
      if (!running) { startGame(); return; }
      if (paused) { resumeGame(); return; }
      onCanvasTapSkater(e);
    }, { passive: false });
    canvas.addEventListener('mousedown', function (e) {
      if (!running) { startGame(); return; }
      if (paused) { resumeGame(); return; }
      onCanvasTapSkater(e);
    });

    /* keyboard */
    document.addEventListener('keydown', onKeyDown);

    /* buttons */
    $('btnPlay').addEventListener('click', function () { startGame(); });
    $('btnLang').addEventListener('click', function () {
      lang = lang === 'en' ? 'it' : 'en';
      localStorage.setItem('ps-lang', lang);
      updateOverlayTexts();
    });
    $('btnResume').addEventListener('click', resumeGame);
    $('btnRestart').addEventListener('click', startGame);
    $('btnRestartResults').addEventListener('click', startGame);
    $('btnQuit').addEventListener('click', quitGame);

    /* sound toggle */
    $('soundBtn').addEventListener('click', function () {
      soundOn = !soundOn;
      $('soundBtn').textContent = soundOn ? '♪' : '♪̸';
      $('soundBtn').style.opacity = soundOn ? '1' : '0.5';
    });

    /* safe area CSS var */
    var st = getComputedStyle(document.documentElement);
    var safeTop = parseInt(st.getPropertyValue('--safe-top')) || 12;
    document.documentElement.style.setProperty('--safe-top', safeTop + 'px');

    updateOverlayTexts();
    requestAnimationFrame(loop);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* desktop hint for spacebar */
  if (!('ontouchstart' in window)) {
    window._isDesktopHint = STR.en.spaceHint;
  }

})();
