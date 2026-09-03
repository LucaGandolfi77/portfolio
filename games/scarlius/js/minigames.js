(function () {
  'use strict';
  var SC = window.SCARLIUS = (window.SCARLIUS || {});
  var W = SC.W, H = SC.H;

  function rr(g, x, y, w, h, r) {
    g.beginPath();
    g.moveTo(x + r, y);
    g.lineTo(x + w - r, y);
    g.arc(x + w - r, y + r, r, -Math.PI / 2, 0);
    g.lineTo(x + w, y + h - r);
    g.arc(x + w - r, y + h - r, r, 0, Math.PI / 2);
    g.lineTo(x + r, y + h);
    g.arc(x + r, y + h - r, r, Math.PI / 2, Math.PI);
    g.lineTo(x, y + r);
    g.arc(x + r, y + r, r, Math.PI, Math.PI * 1.5);
    g.closePath();
  }

  function banner(scene, color, txt, y) {
    var b = scene.add.rectangle(W / 2, y, W - 40, 74, 0x0c0716, 0.92).setStrokeStyle(3, color, 1);
    b.setOrigin(0.5);
    var t = scene.add.text(W / 2, y, txt, { fontFamily: 'Georgia, serif', fontSize: '30px', fontStyle: 'bold', color: '#ffffff' }).setOrigin(0.5);
    return { b: b, t: t };
  }

  function addQuit(scene) {
    var zone = scene.add.zone(48, 60, 70, 70).setInteractive();
    scene.add.circle(48, 60, 30, 0xff2e88, 0.9).setStrokeStyle(2, 0xffffff, 0.6);
    scene.add.text(48, 60, '✕', { fontFamily: 'system-ui', fontSize: '34px', fontWeight: 'bold', color: '#fff' }).setOrigin(0.5);
    zone.on('pointerdown', function () { SC.sfx.tap(); scene.quit(); });
    return zone;
  }

  /* ---------------- FLAIR MASTER TOUCH ---------------- */
  var Flair = function FlairScene() {
    Phaser.Scene.call(this, { key: 'Flair' });
    this.nTotal = 12;
  };
  Flair.prototype = Object.create(Phaser.Scene.prototype);
  Flair.prototype.constructor = Flair;

  Flair.prototype.create = function () {
    var s = this;
    s.ended = false;
    s.perfects = 0;
    s.best = 0;
    s.idx = 0;
    s.phase = 'wait';
    s.phaseT = 0;
    s.r = 0;
    s.used = false;

    this.cameras.main.setBackgroundColor('#140a26');
    var bg = this.add.graphics();
    bg.fillGradientStyle(0x2a0f4a, 0x2a0f4a, 0x0c0514, 0x0c0514, 1);
    bg.fillRect(0, 0, W, H);

    banner(this, 0x3dfcff, SC.txt({ it: 'FLAIR MASTER TOUCH', en: 'FLAIR MASTER TOUCH' }), 120);
    this.add.text(W / 2, 168, SC.txt({ it: 'Tocca quando l\'anello coincide con il bersaglio dorato', en: 'Tap when the ring hits the golden target' }), { fontFamily: 'system-ui', fontSize: '22px', color: '#cfe9ff', align: 'center', wordWrap: { width: W - 160 } }).setOrigin(0.5, 0);
    addQuit(this);

    this.add.text(W / 2, 250, '🍾', { fontFamily: 'system-ui', fontSize: '40px' }).setOrigin(0.5);
    this.add.text(W / 2 + 160, 320, '🍸', { fontFamily: 'system-ui', fontSize: '46px' }).setOrigin(0.5);
    this.add.text(W / 2 - 170, 300, '🥃', { fontFamily: 'system-ui', fontSize: '38px' }).setOrigin(0.5);

    s.reticleX = W / 2;
    s.reticleY = 900;
    s.rTarget = 105;
    s.tR = s.rTarget;
    s.fx = this.add.graphics();
    s.counterTxt = this.add.text(W - 60, 60, '0/12', { fontFamily: 'Georgia', fontSize: '30px', color: '#ffd166' }).setOrigin(1, 0);
    s.comboTxt = this.add.text(W / 2, 620, '', { fontFamily: 'Georgia', fontSize: '44px', color: '#ffd166' }).setOrigin(0.5, 0.5);
    s.resultTxt = this.add.text(W / 2, 300, '', { fontFamily: 'Georgia', fontSize: '70px', color: '#ffffff', stroke: '#000', strokeThickness: 8 }).setOrigin(0.5);

    this.time.delayedCall(800, function () { s.phase = 'ring'; s.phaseT = 0; s.used = false; s.dur = 1.45; });
    s.stepTxt = this.add.text(W / 2, 220, '', { fontFamily: 'system-ui', fontSize: '26px', color: '#ff2e88' }).setOrigin(0.5);
    this.input.on('pointerdown', function () { s.inputTap(); });
  };

  Flair.prototype.update = function (time, delta) {
    var s = this;
    var dt = delta / 1000;
    s.phaseT += dt;

    s.fx.clear();
    if (s.phase === 'ring') {
      var t = Math.min(1, s.phaseT / s.dur);
      s.r = 320 + (62 - 320) * (t * t);
      var alpha = s.r < s.tR + 45 ? 0.6 : 0.95;
      s.fx.lineStyle(5, 0xff2e88, alpha);
      s.fx.strokeCircle(s.reticleX, s.reticleY, s.r);
      s.fx.lineStyle(7, 0xffd166, 1);
      s.fx.strokeCircle(s.reticleX, s.reticleY, s.tR);
      s.fx.lineStyle(3, 0xffd166, 0.3);
      s.fx.strokeCircle(s.reticleX, s.reticleY, s.tR + 42);
      s.fx.strokeCircle(s.reticleX, s.reticleY, Math.max(62, s.tR - 42));
      if (t >= 1 && !s.used) {
        s.used = true;
        s.judge(false);
      }
    }
  };

  Flair.prototype.judge = function (isTap) {
    var s = this;
    if (s.used || s.ended) return;
    s.used = true;
    var diff = Math.abs(s.r - s.tR);
    var ok = diff <= 34;
    if (isTap) {
      if (ok) {
        s.perfects++;
        s.best = Math.max(s.best, s.perfects);
        s.counterTxt.setText(s.idx + 1 + '/' + s.nTotal);
        SC.sfx.perfect();
        s.resultTxt.setText('PERFETTO!').setColor('#3ddc97');
        s.comboTxt.setText(SC.txt({ it: 'PERFETTI: ' + s.perfects, en: 'PERFECTS: ' + s.perfects }));
        s.fx.lineStyle(10, 0x3ddc97, 1);
        s.fx.strokeCircle(s.reticleX, s.reticleY, s.tR + 6);
      } else {
        SC.sfx.good();
        s.resultTxt.setText(SC.txt({ it: 'QUASI…', en: 'SO CLOSE…' })).setColor('#ffd166');
      }
    } else {
      SC.sfx.miss();
      s.resultTxt.setText(SC.txt({ it: 'MISS', en: 'MISS' })).setColor('#ff2e88');
    }
    s.phase = 'result';
    s.phaseT = 0;
    var next = ok ? 420 : 620;
    this.time.delayedCall(next, function () {
      if (s.ended) return;
      s.resultTxt.setText('');
      s.idx++;
      if (s.idx >= s.nTotal) { s.endGame(); return; }
      s.counterTxt.setText(s.idx + '/' + s.nTotal);
      s.phase = 'ring';
      s.phaseT = 0;
      s.used = false;
      s.dur = Math.max(1.0, 1.45 - s.idx * 0.03);
    });
  };

  Flair.prototype.inputTap = function () {
    var s = this;
    if (s.phase === 'ring' && !s.used) s.judge(true);
  };

  Flair.prototype.endGame = function () {
    var s = this;
    if (s.ended) return;
    s.ended = true;
    var win = s.perfects >= 8;
    s.phase = 'done';
    s.fx.clear();
    var title = win ? (SC.txt({ it: 'BOTTIGLIA A TERRA!', en: 'BOTTLE DOWN!' })) : (SC.txt({ it: 'QUASI LEGGENDARIO…', en: 'ALMOST LEGENDARY…' }));
    s.resultTxt.setText(title).setColor(win ? '#3ddc97' : '#ffd166');
    s.comboTxt.setText(SC.txt({ it: (s.perfects + ' su ' + s.nTotal) + ' perfetti', en: s.perfects + ' of ' + s.nTotal + ' perfects' }));
    if (win) { SC.S.inferno = true; SC.S.save(); SC.emit('inv'); SC.sfx.win(); SC.toast(SC.DATA.toast.gotInferno); }
    else SC.sfx.lose();
    var btn = this.add.container(W / 2, 1120, []);
    var rect = this.add.rectangle(0, 0, 300, 70, win ? 0x3ddc97 : 0xffd166, 1).setOrigin(0.5);
    var lab = this.add.text(0, 0, SC.txt({ it: 'Continua', en: 'Continue' }), { fontFamily: 'system-ui', fontSize: '28px', fontWeight: 'bold', color: '#0c0716' }).setOrigin(0.5);
    btn.add([rect, lab]);
    btn.setPosition(W / 2, 1120);
    btn.setSize(300, 70);
    btn.setInteractive(new Phaser.Geom.Rectangle(-150, -35, 300, 70), Phaser.Geom.Rectangle.Contains);
    btn.on('pointerdown', function () { SC.sfx.tap(); SC.sceneOp.stop('Flair'); SC.miniEnd(win ? 'luca_win' : 'luca_lose'); });
  };

  Flair.prototype.quit = function () {
    var s = this;
    if (s.ended) return;
    s.ended = true;
    SC.sfx.tap();
    SC.sceneOp.stop('Flair');
    SC.miniEnd(null);
  };

  /* ---------------- TRASH CAN BASKETBALL ---------------- */
  var Basket = function BasketScene() {
    Phaser.Scene.call(this, { key: 'Basket' });
  };
  Basket.prototype = Object.create(Phaser.Scene.prototype);
  Basket.prototype.constructor = Basket;

  Basket.prototype.create = function () {
    var s = this;
    s.ended = false;
    s.streak = 0;
    s.phase = 'idle';
    s.scored = false;
    s.hintShown = false;

    this.cameras.main.setBackgroundColor('#0e1524');
    var bg = this.add.graphics();
    bg.fillGradientStyle(0x241a3a, 0x241a3a, 0x0c0716, 0x0c0716, 1);
    bg.fillRect(0, 0, W, H);

    banner(this, 0xffd166, SC.txt({ it: 'TRASH CAN BASKETBALL', en: 'TRASH CAN BASKETBALL' }), 110);
    this.add.text(W / 2, 156, SC.txt({ it: 'Trascina la pallina indietro e rilascia per tirare', en: 'Drag the ball back, then release to shoot' }), { fontFamily: 'system-ui', fontSize: '21px', color: '#e9f3ff', align: 'center', wordWrap: { width: W - 170 } }).setOrigin(0.5, 0);
    addQuit(this);

    this.add.text(W / 2, 205, SC.txt({ it: '3 CANESTRI DI FILA', en: '3 BASKETS IN A ROW' }), { fontFamily: 'Georgia', fontSize: '26px', color: '#ff2e88' }).setOrigin(0.5);

    s.anchor = { x: 130, y: 950 };
    s.g = 1300;
    s.k = 4.2;
    s.ballPos = { x: s.anchor.x, y: s.anchor.y };
    s.ballVel = { x: 0, y: 0 };

    s.rimX = 520;
    s.rimY = 230;
    s.rimR = 52;

    s.backdrop = this.add.graphics();
    s.aim = this.add.graphics();
    s.drawScene();
    s.ball = this.add.image(s.anchor.x, s.anchor.y, 'ball').setScale(0.8);
    s.ball.setDepth(5);

    s.streakPips = [];
    for (var i = 0; i < 3; i++) {
      var c = this.add.circle(W - 60 - i * 60, 120, 20, 0x241743, 1).setStrokeStyle(3, 0xffffff, 0.5);
      s.streakPips.push(c);
    }

    this.input.on('pointermove', function (p) {
      if (s.phase !== 'aim') return;
      var dx = p.x - s.anchor.x, dy = p.y - s.anchor.y;
      var d = Math.hypot(dx, dy);
      var maxd = 250;
      if (d > maxd) { dx = dx / d * maxd; dy = dy / d * maxd; }
      s.ballPos.x = s.anchor.x + dx;
      s.ballPos.y = s.anchor.y + dy;
      s.ball.setPosition(s.ballPos.x, s.ballPos.y);
      s.drawAim();
    });

    this.input.on('pointerup', function (p) {
      if (s.phase !== 'aim') return;
      var dx = s.ballPos.x - s.anchor.x, dy = s.ballPos.y - s.anchor.y;
      var d = Math.hypot(dx, dy);
      if (d < 24) { s.resetBall(); return; }
      s.ballVel.x = -dx * s.k * 0.55;
      s.ballVel.y = -dy * s.k * 0.62;
      s.ballVel.y = Math.min(s.ballVel.y, -520);
      s.phase = 'fly';
      s.scored = false;
      s.aim.clear();
      SC.sfx.tap();
    });

    this.input.on('pointerdown', function (p) {
      if (s.phase !== 'idle') return;
      var d = Math.hypot(p.x - s.ball.x, p.y - s.ball.y);
      if (d < 190) { s.phase = 'aim'; }
    });
  };

  Basket.prototype.drawScene = function () {
    var s = this;
    var g = s.backdrop;
    g.clear();
    g.fillStyle(0x1a1528, 1);
    g.fillRect(0, 1010, W, 270);
    g.lineStyle(4, 0x3a2c55, 1);
    g.strokeRect(0, 1010, W, 270);

    var bx = s.rimX + 70;
    g.fillStyle(0x6b4a1c, 1);
    g.fillRect(bx - 12, 230, 24, 780);
    g.fillStyle(0x8a5f26, 1);
    g.fillRect(bx - 60, 160, 120, 90);
    g.fillStyle(0xffffff, 0.12);
    g.fillRect(bx - 52, 168, 104, 74);
    g.lineStyle(4, 0xff2e88, 1);
    g.fillStyle(0xff2e88, 0.9);
    g.fillCircle(bx - 46, 205, 7);
    g.fillCircle(bx + 46, 205, 7);

    g.lineStyle(10, 0xff8c42, 1);
    g.beginPath();
    g.moveTo(s.rimX - s.rimR, s.rimY);
    g.lineTo(s.rimX + s.rimR, s.rimY);
    g.strokePath();
    g.lineStyle(4, 0xffffff, 0.35);
    g.beginPath();
    for (var i = 0; i <= 6; i++) {
      var yy = s.rimY + 14 + i * 22;
      var ww = s.rimR * (1 - i / 7) * 0.9;
      if (i % 2 === 0) { g.moveTo(s.rimX - ww, yy); g.lineTo(s.rimX + ww, yy); }
      else { g.moveTo(s.rimX - ww * 0.5, yy); g.lineTo(s.rimX + ww * 0.5, yy); }
    }
    g.strokePath();
  };

  Basket.prototype.drawAim = function () {
    var s = this;
    var g = s.aim;
    g.clear();
    var px = s.anchor.x, py = s.anchor.y;
    var vx = (s.anchor.x - s.ballPos.x) * s.k * 0.55;
    var vy = (s.anchor.y - s.ballPos.y) * s.k * 0.62;
    vy = Math.min(vy, -520);
    if (vy > -60) return;
    var dt = 0.02;
    g.fillStyle(0xffd166, 0.9);
    for (var i = 0; i < 48; i++) {
      px += vx * dt; py += vy * dt; vy += s.g * dt;
      if (py > 980) break;
      if (i % 2 === 0) g.fillCircle(px, py, 5);
    }
  };

  Basket.prototype.update = function (time, delta) {
    var s = this;
    if (s.phase !== 'fly') return;
    var dt = Math.min(0.05, delta / 1000);
    var prevY = s.ball.y;
    s.ballPos.x += s.ballVel.x * dt;
    s.ballPos.y += s.ballVel.y * dt;
    s.ballVel.y += s.g * dt;
    s.ball.setPosition(s.ballPos.x, s.ballPos.y);

    if (!s.scored && prevY < s.rimY && s.ballPos.y >= s.rimY && Math.abs(s.ballPos.x - s.rimX) <= s.rimR + 8 && s.ballVel.y > 0) {
      s.scored = true;
      s.streak++;
      SC.sfx.perfect();
      var pips = s.streakPips;
      for (var i = 0; i < 3; i++) pips[i].setFillStyle(i < s.streak ? 0x3ddc97 : 0x241743, i < s.streak ? 1 : 1);
      this.add.text(s.rimX, s.rimY - 60, SC.txt({ it: 'CANESTRO!', en: 'BASKET!' }), { fontFamily: 'Georgia', fontSize: '40px', color: '#3ddc97', stroke: '#000', strokeThickness: 6 }).setOrigin(0.5);
      if (s.streak >= 3) { s.win(); return; }
      return;
    }
    if (s.ballPos.y > 990 || s.ballPos.x < -20 || s.ballPos.x > W + 20) {
      if (!s.scored) {
        s.streak = 0;
        for (var j = 0; j < 3; j++) s.streakPips[j].setFillStyle(0x241743, 1);
        if (!s.hintShown) {
          s.hintShown = true;
          this.add.text(W / 2, 700, SC.txt({ it: 'Tira con più forza verso l\'alto!', en: 'Throw harder and higher!' }), { fontFamily: 'system-ui', fontSize: '26px', color: '#ffd166' }).setOrigin(0.5);
          this.time.delayedCall(1400, function () { });
        }
        SC.sfx.miss();
      }
      this.time.delayedCall(250, function () { if (!s.ended) s.resetBall(); });
      s.phase = 'busy';
    }
  };

  Basket.prototype.resetBall = function () {
    var s = this;
    s.ballPos = { x: s.anchor.x, y: s.anchor.y };
    s.ballVel = { x: 0, y: 0 };
    s.ball.setPosition(s.anchor.x, s.anchor.y);
    s.phase = 'idle';
  };

  Basket.prototype.win = function () {
    var s = this;
    if (s.ended) return;
    s.ended = true;
    s.phase = 'done';
    SC.S.kegs = true;
    SC.S.save();
    SC.emit('inv');
    SC.sfx.win();
    SC.toast(SC.DATA.toast.gotKegs);
    s.ball.destroy();
    var b = banner(this, 0x3ddc97, SC.txt({ it: 'TRE DI FILA! FUSTI APPROVATI!', en: 'THREE IN A ROW! KEGS APPROVED!' }), 620);
    var btn = this.add.container(0, 0, []);
    var rect = this.add.rectangle(0, 0, 300, 70, 0x3ddc97, 1).setOrigin(0.5);
    var lab = this.add.text(0, 0, SC.txt({ it: 'Continua', en: 'Continue' }), { fontFamily: 'system-ui', fontSize: '28px', fontWeight: 'bold', color: '#0c0716' }).setOrigin(0.5);
    btn.add([rect, lab]);
    btn.setPosition(W / 2, 1080);
    btn.setSize(300, 70);
    btn.setInteractive(new Phaser.Geom.Rectangle(-150, -35, 300, 70), Phaser.Geom.Rectangle.Contains);
    btn.on('pointerdown', function () {
      SC.sfx.tap();
      SC.sceneOp.stop('Basket');
      SC.miniEnd('davide_win');
    });
  };

  Basket.prototype.quit = function () {
    var s = this;
    if (s.ended) return;
    s.ended = true;
    SC.sceneOp.stop('Basket');
    SC.miniEnd(null);
  };

  /* ---------------- DJ DECK SYNC ---------------- */
  var Dj = function DjScene() {
    Phaser.Scene.call(this, { key: 'Dj' });
  };
  Dj.prototype = Object.create(Phaser.Scene.prototype);
  Dj.prototype.constructor = Dj;

  Dj.prototype.create = function () {
    var s = this;
    s.ended = false;
    s.won = false;
    s.target = 0.2 + Math.random() * 0.6;
    s.param = 0;
    s.holdT = 0;
    s.holdNeed = 1.1;

    this.cameras.main.setBackgroundColor('#07141a');
    var bg = this.add.graphics();
    bg.fillGradientStyle(0x0a2230, 0x0a2230, 0x0c0716, 0x0c0716, 1);
    bg.fillRect(0, 0, W, H);

    banner(this, 0x3ddc97, SC.txt({ it: 'DJ DECK SYNC', en: 'DJ DECK SYNC' }), 110);
    this.add.text(W / 2, 158, SC.txt({ it: 'Muovi lo slider finché le onde non diventano verdi', en: 'Move the slider until the waves turn green' }), { fontFamily: 'system-ui', fontSize: '22px', color: '#d5f7ea', align: 'center', wordWrap: { width: W - 180 } }).setOrigin(0.5, 0);
    addQuit(this);

    s.waveG = this.add.graphics();
    s.yTop = 300;
    s.yMid = 470;
    s.amp = 64;

    s.lockRing = this.add.graphics();
    s.statusTxt = this.add.text(W / 2, 210, '', { fontFamily: 'Georgia', fontSize: '30px', color: '#3ddc97', stroke: '#000', strokeThickness: 5 }).setOrigin(0.5);

    var sliderY = 880;
    s.sliderX0 = 100;
    s.sliderX1 = W - 100;
    s.sliderY = sliderY;
    s.thumbX = s.sliderX0 + s.param * (s.sliderX1 - s.sliderX0);

    var track = this.add.graphics();
    track.lineStyle(10, 0x2a4a5a, 1);
    track.beginPath();
    track.moveTo(s.sliderX0, sliderY); track.lineTo(s.sliderX1, sliderY);
    track.strokePath();
    s.trackG = track;
    s.fillG = this.add.graphics();
    s.thumb = this.add.circle(s.thumbX, sliderY, 34, 0xffd166, 1).setStrokeStyle(4, 0xffffff, 0.9);
    s.thumb.setDepth(6);

    var zone = this.add.rectangle(W / 2, sliderY, W, 220).setOrigin(0.5);
    zone.setInteractive({ useHandCursor: true });
    zone.on('pointermove', function (p) { if (p.isDown) s.dragTo(p.x); });
    zone.on('pointerdown', function (p) { s.dragTo(p.x); });

    this.add.text(s.sliderX0, sliderY + 80, '0', { fontFamily: 'system-ui', fontSize: '22px', color: '#7fb6c9' });
    this.add.text(s.sliderX1, sliderY + 80, '∞', { fontFamily: 'system-ui', fontSize: '22px', color: '#7fb6c9' });
    this.add.text(W / 2, sliderY + 90, SC.txt({ it: 'FREQUENZA', en: 'FREQUENCY' }), { fontFamily: 'system-ui', fontSize: '20px', color: '#9fd0e0' }).setOrigin(0.5);
    s.dragTo(s.param, true);
  };

  Dj.prototype.fOf = function (p) { return 5 + p * 16; };
  Dj.prototype.phOf = function (p) { return p * 22; };

  Dj.prototype.wavePoints = function (p, yC) {
    var pts = [];
    var f = this.fOf(p);
    var ph = this.phOf(p);
    var steps = 90;
    for (var i = 0; i <= steps; i++) {
      var x = 40 + i * (W - 80) / steps;
      var y = yC + Math.sin(i * 0.4 + ph) * this.amp * (0.5 + f / 21);
      pts.push(x); pts.push(y);
    }
    return pts;
  };

  Dj.prototype.dragTo = function (x, silent) {
    var s = this;
    var nx = Phaser.Math.Clamp(x, s.sliderX0, s.sliderX1);
    s.param = (nx - s.sliderX0) / (s.sliderX1 - s.sliderX0);
    s.thumbX = nx;
    s.thumb.x = nx;
    if (!silent) SC.sfx.slide();
  };

  Dj.prototype.update = function (time, delta) {
    var s = this;
    var g = s.waveG;
    g.clear();
    var diff = Math.abs(s.param - s.target);
    var aligned = diff < 0.03;

    g.lineStyle(5, 0x2aa8c9, 0.55);
    var tpts = s.wavePoints(s.target, s.yTop);
    g.strokePoints(tpts);

    var col = aligned ? 0x3ddc97 : 0xf4f7fb;
    g.lineStyle(6, col, aligned ? 1 : 0.85);
    var ppts = s.wavePoints(s.param, s.yMid);
    g.strokePoints(ppts);
    if (aligned) {
      g.lineStyle(2, 0x3ddc97, 0.25);
      g.strokePoints(s.wavePoints(s.param, s.yTop));
    }

    s.trackG.clear();
    s.trackG.lineStyle(10, 0x22424f, 1);
    s.trackG.beginPath();
    s.trackG.moveTo(s.sliderX0, s.sliderY); s.trackG.lineTo(s.sliderX1, s.sliderY);
    s.trackG.strokePath();
    var greenW = Math.max(0, (s.sliderX1 - s.sliderX0) * 0.03 * 2);
    var cx = s.sliderX0 + s.target * (s.sliderX1 - s.sliderX0);
    s.fillG.clear();
    s.fillG.fillStyle(0x3ddc97, 0.5);
    s.fillG.fillRect(cx - greenW / 2, s.sliderY - 7, greenW, 14);

    s.lockRing.clear();
    if (aligned && !s.won) {
      s.holdT += delta / 1000;
      var prog = Math.min(1, s.holdT / s.holdNeed);
      s.lockRing.lineStyle(6, 0x3ddc97, 0.9);
      s.lockRing.beginPath();
      s.lockRing.arc(cx, s.sliderY, 52, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * prog);
      s.lockRing.strokePath();
      s.statusTxt.setText(SC.txt({ it: 'SINCRONIZZAZIONE…', en: 'SYNCING…' }));
      if (s.holdT >= s.holdNeed) {
        s.won = true;
        s.onWin();
      }
    } else if (!aligned) {
      s.holdT = 0;
      s.statusTxt.setText(SC.txt({ it: 'Allinea le onde', en: 'Align the waves' }));
    }
  };

  Dj.prototype.onWin = function () {
    var s = this;
    if (s.ended) return;
    s.ended = true;
    SC.S.djSync = true;
    SC.S.save();
    SC.emit('inv');
    SC.sfx.locked();
    s.statusTxt.setText(SC.txt({ it: 'ONDE VERDI! 🎧', en: 'GREEN WAVES! 🎧' }));
    SC.toast(SC.txt({ it: 'Onde sincronizzate!', en: 'Waves synced!' }));

    if (SC.S.kegs) {
      SC.sfx.win();
      this.time.delayedCall(900, function () {
        SC.sceneOp.stop('Dj');
        SC.playFinale();
      });
    } else {
      SC.sfx.win();
      var btn = this.add.container(0, 0, []);
      var rect = this.add.rectangle(0, 0, 300, 70, 0x3ddc97, 1).setOrigin(0.5);
      var lab = this.add.text(0, 0, SC.txt({ it: 'Continua', en: 'Continue' }), { fontFamily: 'system-ui', fontSize: '28px', fontWeight: 'bold', color: '#0c0716' }).setOrigin(0.5);
      btn.add([rect, lab]);
      btn.setPosition(W / 2, 1080);
      btn.setSize(300, 70);
      btn.setInteractive(new Phaser.Geom.Rectangle(-150, -35, 300, 70), Phaser.Geom.Rectangle.Contains);
      btn.on('pointerdown', function () {
        SC.sfx.tap();
        SC.sceneOp.stop('Dj');
        SC.miniEnd('erco_sync_win');
      });
    }
  };

  Dj.prototype.quit = function () {
    var s = this;
    if (s.ended) return;
    s.ended = true;
    SC.sceneOp.stop('Dj');
    SC.miniEnd(null);
  };

  SC.Flair = Flair;
  SC.Basket = Basket;
  SC.Dj = Dj;

})();
