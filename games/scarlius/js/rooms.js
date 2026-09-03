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

  function curve(g, x0, y0, cx, cy, x1, y1) {
    var i, t, px, py;
    for (i = 1; i <= 5; i++) {
      t = i / 5;
      px = (1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * cx + t * t * x1;
      py = (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * cy + t * t * y1;
      g.lineTo(px, py);
    }
  }

  var PAL = {
    wall: 0x1c1238, wall2: 0x271a4a, floor: 0x150e2a, floor2: 0x1d1436,
    gold: 0xffd166, pink: 0xff2e88, cyan: 0x3dfcff, violet: 0x7b5bff, green: 0x3ddc97
  };

  /* ---------- passive UI (toasts + title) ---------- */
  var UI = function UIScene() { Phaser.Scene.call(this, { key: 'UI' }); };
  UI.prototype = Object.create(Phaser.Scene.prototype);
  UI.prototype.constructor = UI;
  UI.prototype.create = function () {
    var s = this;
    s.title = null;
    s.obj = null;
    var self = this;
    SC.on('ui', function () { self.refresh(); });
    SC.on('lang', function () { self.refresh(); });
    this.refresh();
  };
  UI.prototype.refresh = function () {
    var s = this;
    if (!s.scene || !s.scene.isActive()) return;
    var meta = SC.DATA.roomMeta[SC.S.room];
    var label = SC.txt({ it: meta.it, en: meta.en });

    if (s.title) s.title.destroy();
    s.title = s.add.container(0, 0);
    var chip = s.add.graphics();
    var w = Math.max(200, label.length * 17 + 70);
    rr(chip, 0, 0, w, 56, 28); chip.fillStyle(0x0a0514, 0.8); chip.fillPath();
    chip.lineStyle(2, 0xffffff, 0.18); rr(chip, 0, 0, w, 56, 28); chip.strokePath();
    var ic = s.add.text(30, 28, meta.icon, { fontFamily: 'system-ui', fontSize: '26px' }).setOrigin(0.5);
    var tx = s.add.text(60, 28, label, { fontFamily: 'system-ui', fontSize: '21px', fontWeight: 'bold', color: '#ffffff' }).setOrigin(0, 0.5);
    s.title.add([chip, ic, tx]);
    s.title.setPosition(18, 30);

    var objTxt = SC.objText();
    if (s.obj) s.obj.destroy();
    s.obj = s.add.container(0, 0);
    var g = s.add.graphics();
    var ow = Math.min(W - 40, Math.max(230, objTxt.length * 10.5 + 40));
    rr(g, 0, 0, ow, 44, 22); g.fillStyle(0x241743, 0.92); g.fillPath();
    g.lineStyle(2, PAL.gold, 0.55); rr(g, 0, 0, ow, 44, 22); g.strokePath();
    var t2 = s.add.text(ow / 2, 22, objTxt, { fontFamily: 'system-ui', fontSize: '16px', color: '#ffe9b0', align: 'center', wordWrap: { width: ow - 22 } }).setOrigin(0.5);
    s.obj.add([g, t2]);
    s.obj.setPosition(W / 2 - ow / 2, 206);
  };
  UI.prototype.show = function (msg, opts) {
    var s = this;
    if (!s.scene || !s.scene.isActive()) return;
    var text = typeof msg === 'string' ? msg : SC.txt(msg);
    var c = s.add.container(0, 0);
    var g = s.add.graphics();
    var tw = Math.max(200, text.length * 12 + 60);
    rr(g, 0, 0, tw, 56, 28); g.fillStyle(0x0a0514, 0.92); g.fillPath();
    g.lineStyle(2, opts && opts.color || PAL.pink, 1); rr(g, 0, 0, tw, 56, 28); g.strokePath();
    var t = s.add.text(tw / 2, 28, text, { fontFamily: 'system-ui', fontSize: '20px', color: '#ffffff', align: 'center', wordWrap: { width: tw - 30 } }).setOrigin(0.5);
    c.add([g, t]);
    c.setPosition(W / 2 - tw / 2, 1060);
    c.setDepth(50);
    c.setAlpha(0);
    s.tweens.add({ targets: c, alpha: 1, duration: 140 });
    s.tweens.add({ targets: c, alpha: 0, delay: 1700, duration: 350, onComplete: function () { c.destroy(); } });
  };
  SC.UI = UI;
  SC.toast = function (msg, color) {
    var ui = SC.sceneOp.isActive('UI') ? SC.sceneOp.getScene('UI') : null;
    if (ui) ui.show(msg, color ? { color: color } : null);
  };

  /* ---------- Room scene ---------- */
  var Room = function RoomScene() { Phaser.Scene.call(this, { key: 'Room' }); };
  Room.prototype = Object.create(Phaser.Scene.prototype);
  Room.prototype.constructor = Room;

  Room.prototype.create = function (data) {
    var s = this;
    SC.sceneOp.registerManager(s.scene.manager);
    SC.sceneOp.registerPlugin(s.scene);
    if (!SC.sceneOp.isActive('UI')) SC.sceneOp.launch('UI');
    s.roomId = (data && data.roomId) || SC.S.room || 'sala';
    s.armed = null;
    s.deco = [];
    s.zones = [];
    s.startX = 0;
    s.startY = 0;
    s.invOpen = false;
    s.index = SC.DATA.rooms.indexOf(s.roomId);

    s.cameras.main.setBackgroundColor('#0c0716');
    s.cameras.main.fadeIn(300, 12, 7, 22);

    s.input.on('pointerdown', function (p) {
      s.startX = p.x; s.startY = p.y; s.startT = s.time.now;
    }, s);
    s.input.on('pointerup', function (p) {
      var dx = p.x - s.startX;
      var dy = p.y - s.startY;
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.4) {
        s.goRoom(s.index + (dx < 0 ? 1 : -1));
      }
    }, s);

    s.events.on('resume', function () { s.refreshHUD(); SC.emit('ui'); });
    s._onInv = function () { if (s.scene && s.scene.isActive()) s.refreshHUD(); };
    SC.on('inv', s._onInv);
    s.events.once('shutdown', function () { SC.off('inv', s._onInv); });

    s.buildHUD();
    s.rebuild(s.roomId);

    if (SC.S.first) {
      SC.S.first = false;
      SC.S.save();
      s.time.delayedCall(600, function () {
        if (s.scene.isActive('Room')) SC.openDialog('intro');
      });
    }
  };

  Room.prototype.rebuild = function (roomId) {
    var s = this;
    s.roomId = roomId;
    s.index = SC.DATA.rooms.indexOf(roomId);
    SC.S.room = roomId;
    SC.S.save();
    if (roomId !== 'playa') SC.sfx.stopBgm();

    for (var i = 0; i < s.deco.length; i++) { var d = s.deco[i]; if (d && d.destroy) d.destroy(); }
    s.deco = [];
    for (var j = 0; j < s.zones.length; j++) { var z = s.zones[j]; if (z && z.destroy) z.destroy(); }
    s.zones = [];
    s.armed = null;
    s.closeInv();

    if (roomId === 'sala') s.buildSala();
    else if (roomId === 'bancone') s.buildBancone();
    else if (roomId === 'bagno') s.buildBagno();
    else if (roomId === 'playa') s.buildPlaya();

    var bg = s.add.zone(W / 2, H / 2, W, H).setInteractive();
    bg.setDepth(-10);
    bg.on('pointerdown', function () {
      if (s.armed) { s.armed = null; SC.toast(SC.DATA.toast.noUse); return; }
    });
    s.zones.push(bg);

    s.refreshHUD();
    SC.emit('ui');
  };

  Room.prototype.addZone = function (x, y, w, h, cb, depth) {
    var s = this;
    var z = s.add.zone(x, y, w, h).setInteractive();
    z.setDepth(depth || 100);
    z.on('pointerdown', cb);
    s.zones.push(z);
    return z;
  };

  Room.prototype.charHit = function (key) {
    var s = this;
    if (s.armed) {
      var armed = s.armed;
      if (key === 'davide' && armed === 'inferno' && !SC.S.davideWake) {
        SC.S.davideWake = true;
        SC.S.inferno = false;
        SC.S.save();
        SC.emit('inv');
        SC.sfx.perfect();
        SC.toast(SC.DATA.toast.davideUp, PAL.green);
        s.armed = null;
        SC.openDialog('davide_wake');
        return;
      }
      if (armed === 'inferno') {
        SC.sfx.miss();
        SC.toast(SC.DATA.toast.wrongInferno, PAL.pink);
      } else {
        SC.sfx.miss();
        SC.toast(SC.DATA.toast.noUse, PAL.gold);
      }
      s.armed = null;
      s.closeInv();
      return;
    }
    if (key === 'deck') { SC.openDialog(SC.pickTalk('deck')); return; }
    SC.openDialog(SC.pickTalk(key));
  };

  Room.prototype.addSprite = function (key, x, y, scale) {
    var im = this.add.image(x, y, key);
    if (scale) im.setScale(scale);
    this.deco.push(im);
    return im;
  };
  Room.prototype.addText = function (x, y, str, style, origin) {
    var t = this.add.text(x, y, str, style);
    if (origin) t.setOrigin(origin[0], origin[1]);
    this.deco.push(t);
    return t;
  };
  Room.prototype.addShadow = function (x, y, w) {
    var g = this.add.graphics();
    g.fillStyle(0x000000, 0.35);
    g.fillEllipse(x, y, w, w * 0.24);
    this.deco.push(g);
    return g;
  };

  Room.prototype.buildSala = function () {
    var s = this;
    var g = s.add.graphics();
    g.fillGradientStyle(0x241642, 0x241642, 0x160e2e, 0x160e2e, 1);
    g.fillRect(0, 0, W, H);
    g.fillStyle(PAL.wall, 1); g.fillRect(0, 0, W, 720);
    g.fillStyle(PAL.wall2, 1); g.fillRect(0, 640, W, 110);
    g.fillStyle(PAL.floor, 1); g.fillRect(0, 750, W, H - 750);
    g.lineStyle(2, PAL.floor2, 1);
    for (var fy = 750; fy < H; fy += 52) { g.lineBetween(0, fy, W, fy); }
    g.lineStyle(3, PAL.floor2, 1);
    for (var fx = 0; fx < W; fx += 144) { g.lineBetween(fx, 750, fx, H); }
    s.deco.push(g);

    g.fillStyle(PAL.pink, 0.12); g.fillRect(0, 0, W, 40);
    var sign = s.add.graphics();
    sign.lineStyle(5, PAL.pink, 0.95);
    rr(sign, W / 2 - 210, 66, 420, 84, 18); sign.fillStyle(0x0c0716, 0.9); sign.fillPath(); sign.strokePath();
    sign.lineStyle(2, 0xffa5c8, 0.9); rr(sign, W / 2 - 210, 66, 420, 84, 18); sign.strokePath();
    s.deco.push(sign);
    s.addText(W / 2, 108, 'SCARLIUS', { fontFamily: 'Georgia, serif', fontSize: '44px', fontStyle: 'bold', color: '#ff2e88' }, [0.5, 0.5]);

    var shelf = s.add.graphics();
    shelf.lineStyle(6, 0x3a2a55, 1); shelf.lineBetween(30, 520, W - 30, 520);
    var bcols = [0x3dfcff, 0xffd166, 0x3ddc97, 0xff2e88, 0x7b5bff];
    for (var b = 0; b < 7; b++) {
      shelf.fillStyle(bcols[b % 5], 0.9);
      var bx = 90 + b * 86;
      rr(shelf, bx, 430, 44, 90, 10); shelf.fillPath();
      shelf.fillStyle(0xffffff, 0.2);
      rr(shelf, bx + 8, 440, 10, 40, 5); shelf.fillPath();
    }
    s.deco.push(shelf);

    var neon = s.add.graphics();
    neon.lineStyle(3, PAL.cyan, 0.6);
    neon.strokeCircle(90, 250, 44);
    neon.lineStyle(3, PAL.green, 0.5);
    neon.strokeCircle(W - 90, 300, 34);
    neon.lineStyle(3, PAL.violet, 0.5);
    neon.beginPath();
    neon.moveTo(120, 360); neon.lineTo(180, 300); neon.lineTo(260, 380);
    neon.strokePath();
    s.deco.push(neon);

    s.buildTable(180, 760);
    s.buildTable(560, 720, true);
    s.buildTable(300, 1180, true, true);

    s.addShadow(150, 1080, 160);
    var dav = s.addSprite('char_davide', 150, 880, 0.95);
    dav.setDepth(5);
    var phoneG = s.add.graphics();
    phoneG.fillStyle(0xffffff, 0.95); phoneG.fillRoundedRect(196, 1000, 26, 46, 4);
    phoneG.fillStyle(PAL.cyan, 1); phoneG.fillRoundedRect(198, 1004, 22, 26, 3);
    phoneG.setDepth(7);
    s.deco.push(phoneG);
    s.addZone(150, 940, 220, 260, function () { s.charHit('davide'); }, 150);

    s.addShadow(540, 1000, 130);
    var th = s.addSprite('char_thomas', 540, 830, 1);
    th.setDepth(5);
    th.setFlipX(true);
    s.addZone(540, 880, 200, 280, function () { s.charHit('thomas'); }, 150);

    var gpos = [[180, 575], [560, 545], [300, 1160], [430, 980], [150, 770]];
    for (var gi = 0; gi < gpos.length; gi++) {
      (function (i, pos) {
        if (SC.S.glassesGiven || SC.S.collected[i]) return;
        var gl = s.addSprite('glass', pos[0], pos[1], 1);
        gl.setDepth(6);
        var sp = s.addSprite('sparkle', pos[0], pos[1] - 52, 0.8);
        sp.setDepth(6);
        s.tweens.add({ targets: sp, alpha: 0.25, yoyo: true, repeat: -1, duration: 550 });
        s.tweens.add({ targets: gl, angle: { from: -8, to: 8 }, yoyo: true, repeat: -1, duration: 900 });
        s.addZone(pos[0], pos[1], 120, 120, function () {
          if (SC.S.glassesGiven) return;
          SC.S.collected[i] = true;
          SC.S.glasses = SC.S.collected.filter(Boolean).length;
          SC.S.save();
          SC.emit('inv');
          SC.emit('ui');
          SC.sfx.pop();
          gl.destroy(); sp.destroy();
          if (SC.S.glasses >= 5) SC.toast(SC.DATA.toast.glassDone, PAL.gold);
          else SC.toast(SC.txt(SC.DATA.toast.glass) + ' (' + SC.S.glasses + '/5)', PAL.cyan);
        }, 160);
      })(gi, gpos[gi]);
    }
  };

  Room.prototype.buildTable = function (x, y, wides, low) {
    var g = this.add.graphics();
    var w = wides ? 220 : 170;
    var topY = low ? y : y - 150;
    g.fillStyle(0x4a2a14, 1);
    rr(g, x - w / 2, topY - 10, w, 18, 6); g.fillPath();
    g.lineStyle(3, 0x6d3f1f, 1);
    g.lineBetween(x - w / 2 + 6, topY + 8, x - w / 2 + 12, y);
    g.lineBetween(x + w / 2 - 6, topY + 8, x + w / 2 - 12, y);
    g.fillStyle(0x6d3f1f, 1);
    g.fillRect(x - w / 2 + 8, y - 6, 12, 18);
    g.fillRect(x + w / 2 - 20, y - 6, 12, 18);
    g.lineStyle(4, 0x8a5a2a, 0.8);
    rr(g, x - w / 2, topY - 10, w, 18, 6); g.strokePath();
    this.deco.push(g);
  };

  Room.prototype.buildBancone = function () {
    var s = this;
    var g = s.add.graphics();
    g.fillGradientStyle(0x2a0f3a, 0x2a0f3a, 0x140a20, 0x140a20, 1);
    g.fillRect(0, 0, W, H);

    g.fillStyle(0x180e2c, 1); g.fillRect(0, 120, W, 720);
    var neon = s.add.graphics();
    neon.lineStyle(3, PAL.pink, 0.7);
    neon.strokeRoundedRect(W / 2 - 190, 60, 380, 120, 22);
    neon.fillStyle(PAL.pink, 0.15);
    neon.fillRoundedRect(W / 2 - 190, 60, 380, 120, 22);
    s.deco.push(neon);
    s.addText(W / 2, 120, 'FLAIR ZONE', { fontFamily: 'Georgia, serif', fontSize: '34px', fontStyle: 'bold', color: '#ff2e88' }, [0.5, 0.5]);

    var backBar = s.add.graphics();
    backBar.lineStyle(5, 0x3a2a55, 1); backBar.lineBetween(20, 520, W - 20, 520);
    var cols = [0x3dfcff, 0xffd166, 0x3ddc97, 0xff2e88, 0x7b5bff, 0x3dfcff];
    for (var b = 0; b < 8; b++) {
      backBar.fillStyle(cols[b % 6], 0.95);
      var bx = 60 + b * 80;
      rr(backBar, bx, 400, 42, 118, 10); backBar.fillPath();
      backBar.fillStyle(0xffffff, 0.25);
      rr(backBar, bx + 8, 414, 10, 44, 5); backBar.fillPath();
    }
    s.deco.push(backBar);

    var halo = s.add.graphics();
    halo.fillStyle(PAL.cyan, 0.08); halo.fillCircle(W / 2, 690, 300);
    halo.fillStyle(PAL.cyan, 0.05); halo.fillCircle(W / 2, 690, 380);
    s.deco.push(halo);

    s.addShadow(360, 880, 150);
    var lu = s.addSprite('char_luca', 360, 720, 1.05);
    lu.setDepth(5);
    s.tweens.add({ targets: lu, y: 712, yoyo: true, repeat: -1, duration: 900, ease: 'Sine.inOut' });
    var bot = s.addText(lu.x + 70, lu.y - 120, '🍾', { fontFamily: 'system-ui', fontSize: '44px' }, [0.5, 0.5]);
    bot.setDepth(6);
    s.tweens.add({ targets: bot, angle: { from: -30, to: 30 }, yoyo: true, repeat: -1, duration: 700 });
    s.addZone(360, 700, 260, 300, function () { s.charHit('luca'); }, 150);

    var counter = s.add.graphics();
    counter.fillStyle(0x553014, 1); counter.fillRect(0, 880, W, 400);
    counter.fillStyle(0x7a4520, 1); counter.fillRect(0, 880, W, 60);
    counter.lineStyle(4, 0x9a5c2c, 1); counter.lineBetween(0, 940, W, 940);
    for (var i = 0; i < 9; i++) {
      counter.lineStyle(3, 0x3d240f, 1);
      counter.lineBetween(20 + i * 80, 1000, 20 + i * 80, 1260);
    }
    s.deco.push(counter);

    s.addText(150, 1010, '🍺', { fontFamily: 'system-ui', fontSize: '40px' }, [0.5, 0.5]);
    s.addText(360, 1010, '🍻', { fontFamily: 'system-ui', fontSize: '46px' }, [0.5, 0.5]);
    s.addText(580, 1010, '🍸', { fontFamily: 'system-ui', fontSize: '40px' }, [0.5, 0.5]);
  };

  Room.prototype.buildBagno = function () {
    var s = this;
    var g = s.add.graphics();
    g.fillStyle(0x102a34, 1); g.fillRect(0, 0, W, H);
    g.lineStyle(2, 0x0c2028, 1);
    for (var tx = 0; tx < W; tx += 72) g.lineBetween(tx, 0, tx, H);
    for (var ty = 0; ty < H; ty += 72) g.lineBetween(0, ty, W, ty);
    s.deco.push(g);

    g.fillStyle(0x0a1620, 0.6); g.fillRect(0, 0, W, 150);
    s.addText(W / 2, 92, '🚿 OCCUPATO · MOTIVO: MITOLOGICO', { fontFamily: 'system-ui', fontSize: '22px', fontWeight: 'bold', color: '#7fb6c9' }, [0.5, 0.5]);

    var shower = s.add.graphics();
    shower.lineStyle(8, 0x8fb8c9, 0.9);
    shower.beginPath(); shower.moveTo(60, 180); curve(shower, 60, 180, 300, 150, 330, 180); shower.strokePath();
    shower.lineStyle(4, 0x6f97a8, 1); shower.lineBetween(70, 180, 70, 1180);
    shower.lineStyle(4, 0x6f97a8, 1); shower.lineBetween(320, 180, 320, 1180);
    for (var f = 0; f < 6; f++) {
      shower.lineStyle(3, 0x6f97a8, 0.9);
      shower.beginPath();
      var fx0 = 70 + f * 42;
      shower.moveTo(fx0, 182); curve(shower, fx0, 182, fx0 + 42, 250, fx0, 320);
      shower.strokePath();
    }
    s.deco.push(shower);

    var ste = s.add.graphics();
    ste.fillStyle(0xffffff, 0.08);
    ste.fillCircle(190, 620, 120);
    ste.fillStyle(0xffffff, 0.05);
    ste.fillCircle(250, 500, 90);
    ste.fillStyle(0xffffff, 0.06);
    ste.fillCircle(150, 420, 70);
    s.deco.push(ste);

    s.addShadow(210, 850, 130);
    var er = s.addSprite('char_ercole', 210, 700, 0.95);
    er.setDepth(3);
    er.setTint(0xbbd6e0);
    er.setAlpha(0.5);
    s.tweens.add({ targets: er, angle: { from: -2, to: 2 }, yoyo: true, repeat: -1, duration: 700 });
    s.addZone(210, 640, 300, 380, function () { s.charHit('ercole'); }, 100);

    s.addText(120, 1160, '🚽', { fontFamily: 'system-ui', fontSize: '52px' }, [0.5, 0.5]);
    s.addText(95, 1220, '✍️ "8 BIRRE O NIENTE"', { fontFamily: 'system-ui', fontSize: '20px', color: '#9fd0c4' }, [0.5, 0.5]);

    var sink = s.add.graphics();
    sink.fillStyle(0x6f97a8, 1);
    rr(sink, 500, 500, 190, 40, 14); sink.fillPath();
    rr(sink, 470, 540, 250, 150, 30); sink.fillPath();
    sink.fillStyle(0x8fb8c9, 1);
    rr(sink, 486, 556, 218, 118, 24); sink.fillPath();
    sink.fillStyle(0x3a6b7a, 1);
    rr(sink, 540, 690, 110, 140, 20); sink.fillPath();
    rr(sink, 500, 830, 190, 40, 16); sink.fillPath();
    s.deco.push(sink);

    var deckGlow = s.add.graphics();
    deckGlow.fillStyle(PAL.green, 0.12); deckGlow.fillCircle(620, 500, 120);
    s.deco.push(deckGlow);
    s.addText(620, 462, '🎛️', { fontFamily: 'system-ui', fontSize: '52px' }, [0.5, 0.5]);
    s.addText(622, 505, 'DECK', { fontFamily: 'system-ui', fontSize: '18px', fontWeight: 'bold', color: '#3ddc97' }, [0.5, 0.5]);
    s.addZone(620, 500, 200, 200, function () { s.charHit('deck'); }, 120);
  };

  Room.prototype.buildPlaya = function () {
    var s = this;
    var g = s.add.graphics();
    g.fillGradientStyle(0x0b1e3f, 0x0b1e3f, 0x2a1140, 0x2a1140, 1);
    g.fillRect(0, 0, W, H);
    s.deco.push(g);

    g.fillStyle(0xffffff, 0.9);
    for (var st = 0; st < 26; st++) {
      var sx = (st * 137) % W, sy = 60 + (st * 89) % 560;
      var rad = 1 + (st % 3);
      g.fillCircle(sx, sy, rad);
    }

    var moon = s.add.graphics();
    moon.fillStyle(0xffe9b0, 0.9);
    moon.fillCircle(560, 240, 46);
    moon.fillStyle(0x2a1140, 1);
    moon.fillCircle(545, 226, 38);
    s.deco.push(moon);

    var sea = s.add.graphics();
    sea.fillStyle(0x123a6b, 1); sea.fillRect(0, 640, W, 90);
    sea.fillStyle(0x1b4f8f, 1); sea.fillRect(0, 600, W, 130);
    for (var w = 0; w < 8; w++) {
      sea.lineStyle(3, 0x3dfcff, 0.5);
      sea.beginPath();
      sea.moveTo(30 + w * 92, 640); curve(sea, 30 + w * 92, 640, 60 + w * 92, 625, 92 + w * 92, 640);
      sea.strokePath();
    }
    s.deco.push(sea);

    g.fillStyle(0xd8b06a, 1); g.fillRect(0, 690, W, H - 690);
    g.fillStyle(0xe7c27f, 1); g.fillRect(0, 690, W, 26);
    for (var dot = 0; dot < 60; dot++) {
      var ddx = (dot * 97) % W, ddy = 760 + (dot * 61) % 400;
      g.fillStyle(0xb8904f, 0.7);
      g.fillCircle(ddx, ddy, 2.5);
    }
    s.deco.push(g);

    var ban = s.add.graphics();
    ban.lineStyle(5, PAL.gold, 1);
    rr(ban, 60, 120, W - 120, 130, 22); ban.fillStyle(0x0c0716, 0.8); ban.fillPath(); ban.strokePath();
    ban.lineStyle(2, 0xffe9b0, 0.7);
    rr(ban, 60, 120, W - 120, 130, 22); ban.strokePath();
    s.deco.push(ban);
    s.addText(W / 2, 165, 'FREE BEER PARTY', { fontFamily: 'Georgia, serif', fontSize: '46px', fontStyle: 'bold', color: '#ffd166' }, [0.5, 0.5]);
    s.addText(W / 2, 214, '🍻 🏖️ ✨', { fontFamily: 'system-ui', fontSize: '30px' }, [0.5, 0.5]);

    s.addShadow(190, 1240, 120);
    var erc = s.addSprite('char_ercole', 190, 1080, 0.8);
    erc.setDepth(5);
    s.tweens.add({ targets: erc, y: 1072, yoyo: true, repeat: -1, duration: 700 });
    var box = s.add.graphics();
    box.fillStyle(0x2a1635, 1); box.fillRoundedRect(120, 1160, 130, 80, 12);
    box.fillStyle(0x3ddc97, 1); box.fillRoundedRect(140, 1180, 90, 14, 6);
    s.deco.push(box);
    s.addText(185, 1200, 'DECK', { fontFamily: 'system-ui', fontSize: '16px', color: '#0c0716' }, [0.5, 0.5]);
    s.addZone(190, 1060, 180, 240, function () { SC.openDialog('ercole_generic'); }, 150);

    s.addShadow(430, 1280, 110);
    var lu2 = s.addSprite('char_luca', 430, 1130, 0.85);
    lu2.setDepth(5);
    lu2.setFlipX(true);
    s.tweens.add({ targets: lu2, y: 1122, yoyo: true, repeat: -1, duration: 800 });
    var lit = s.addText(lu2.x + 74, lu2.y - 130, '🍾', { fontFamily: 'system-ui', fontSize: '40px' }, [0.5, 0.5]);
    lit.setDepth(6);
    s.tweens.add({ targets: lit, alpha: 0.4, yoyo: true, repeat: -1, duration: 500 });

    s.addShadow(590, 1280, 100);
    var dav2 = s.addSprite('char_davide', 590, 1130, 0.85);
    dav2.setDepth(5);
    s.tweens.add({ targets: dav2, y: 1122, yoyo: true, repeat: -1, duration: 750 });
    var kegIm = s.addSprite('keg', 660, 1160, 0.55);
    kegIm.setDepth(6);
    s.tweens.add({ targets: kegIm, angle: { from: -4, to: 4 }, yoyo: true, repeat: -1, duration: 500 });

    s.addShadow(320, 1300, 110);
    var th2 = s.addSprite('char_thomas', 320, 1180, 0.8);
    th2.setDepth(5);
    th2.setFlipX(true);
    var pint = s.addText(th2.x - 60, th2.y - 110, '🍺', { fontFamily: 'system-ui', fontSize: '40px' }, [0.5, 0.5]);
    pint.setDepth(6);
    s.tweens.add({ targets: pint, y: pint.y - 8, yoyo: true, repeat: -1, duration: 900 });

    s.addText(W / 2, 360, SC.txt({ it: 'Una notte perfetta. Un bar. Troppi miti. Zero bicchieri da raccogliere.', en: 'A perfect night. One bar. Too many myths. Zero glasses to collect.' }), { fontFamily: 'Georgia, serif', fontSize: '24px', color: '#ffe9b0', align: 'center', wordWrap: { width: W - 140 } }, [0.5, 0.5]);
    s.addText(W / 2, 470, SC.txt({ it: 'Thomas finalmente si rilassa. Davide passa i fusti. Luca lancia bottiglie illuminate sotto le stelle. Ercole tiene il ritmo. E tu? Tu sei la leggenda che ha reso tutto possibile.', en: 'Thomas finally relaxes. Davide rolls the kegs. Luca tosses glowing bottles under the stars. Ercole holds the beat. And you? You\'re the legend who made it all happen.' }), { fontFamily: 'Georgia, serif', fontSize: '22px', color: '#cfe9ff', align: 'center', wordWrap: { width: W - 160 } }, [0.5, 0.5]);

    SC.sfx.stopBgm();
    SC.sfx.bgmBeats();
    s.addRestart();
  };

  Room.prototype.addRestart = function () {
    var s = this;
    var x = W / 2, y = 620;
    var cont = s.add.container(0, 0, []);
    var bg = s.add.rectangle(0, 0, 300, 70, 0x3ddc97, 1).setOrigin(0.5);
    var lab = s.add.text(0, 0, SC.txt({ it: '↻ Ricomincia la notte', en: '↻ Restart the night' }), { fontFamily: 'system-ui', fontSize: '24px', fontWeight: 'bold', color: '#0c0716' }).setOrigin(0.5);
    cont.add([bg, lab]);
    cont.setPosition(x, y);
    cont.setSize(300, 70);
    cont.setInteractive(new Phaser.Geom.Rectangle(-150, -35, 300, 70), Phaser.Geom.Rectangle.Contains);
    cont.on('pointerdown', function () {
      SC.sfx.stopBgm();
      SC.sfx.tap();
      SC.S.reset();
      s.time.delayedCall(120, function () { s.rebuild('sala'); });
    });
    s.deco.push(cont);
  };

  /* ---------- HUD ---------- */
  Room.prototype.buildHUD = function () {
    var s = this;
    s.hud = s.add.container(0, 0);
    s.hud.setDepth(500);
    var baseY = H - 60;

    s.addShadow(360, H - 30, 260);
    s.invBtn = s.add.container(0, 0, []);
    var circ = s.add.circle(0, 0, 52, 0x241743, 1).setStrokeStyle(4, PAL.gold, 1);
    var pack = s.add.text(0, -4, '🎒', { fontFamily: 'system-ui', fontSize: '44px' }).setOrigin(0.5);
    s.invBadge = s.add.text(0, 0, '', { fontFamily: 'system-ui', fontSize: '18px', fontWeight: 'bold', color: '#0c0716', backgroundColor: '#ffd166' });
    s.invBtn.add([circ, pack, s.invBadge]);
    s.invBtn.setPosition(360, baseY);
    s.invBtn.setDepth(950);
    s.invBtn.setSize(104, 104);
    s.invBtn.setInteractive(new Phaser.Geom.Rectangle(-52, -52, 104, 104), Phaser.Geom.Rectangle.Contains);
    s.invBtn.on('pointerdown', function () {
      SC.sfx.tap();
      s.toggleInv();
    });

    s.sheet = s.add.container(0, 0);
    s.sheet.setDepth(951);
    s.sheet.setVisible(false);

    s.arrowL = s.makeArrow(52, H / 2, -1);
    s.arrowR = s.makeArrow(W - 52, H / 2, 1);

    s.langBtn = s.add.container(0, 0, []);
    var lc = s.add.rectangle(0, 0, 74, 46, 0x241743, 1).setStrokeStyle(2, 0xffffff, 0.4).setOrigin(0.5);
    s.langTxt = s.add.text(0, 0, (SC.lang === 'it' ? 'EN' : 'IT'), { fontFamily: 'system-ui', fontSize: '20px', fontWeight: 'bold', color: '#fff' }).setOrigin(0.5);
    s.langBtn.add([lc, s.langTxt]);
    s.langBtn.setPosition(W - 52, 100);
    s.langBtn.setDepth(930);
    s.langBtn.setSize(74, 46);
    s.langBtn.setInteractive(new Phaser.Geom.Rectangle(-37, -23, 74, 46), Phaser.Geom.Rectangle.Contains);
    s.langBtn.on('pointerdown', function () {
      SC.sfx.tap();
      SC.lang = (SC.lang === 'it') ? 'en' : 'it';
      SC.S.lang = SC.lang;
      SC.S.save();
      SC.emit('lang');
      SC.emit('ui');
      s.refreshHUD();
    });

    s.muteBtn = s.add.container(0, 0, []);
    var mc = s.add.circle(0, 0, 24, 0x241743, 1).setStrokeStyle(2, 0xffffff, 0.4);
    s.muteTxt = s.add.text(0, 0, '🔊', { fontFamily: 'system-ui', fontSize: '22px' }).setOrigin(0.5);
    s.muteBtn.add([mc, s.muteTxt]);
    s.muteBtn.setPosition(W - 52, 160);
    s.muteBtn.setDepth(930);
    s.muteBtn.setSize(48, 48);
    s.muteBtn.setInteractive(new Phaser.Geom.Rectangle(-24, -24, 48, 48), Phaser.Geom.Rectangle.Contains);
    s.muteBtn.on('pointerdown', function () {
      var m = !SC.sfx.isMuted();
      SC.sfx.setMuted(m);
      s.muteTxt.setText(m ? '🔇' : '🔊');
      SC.sfx.tap();
    });

    s.refreshHUD();
  };

  Room.prototype.makeArrow = function (x, y, dir) {
    var c = this.add.container(0, 0, []);
    c.setPosition(x, y);
    c.setSize(88, 110);
    c.dir = dir;
    c.setDepth(900);
    return c;
  };

  Room.prototype.paintArrow = function (cont, locked, glyph, visible) {
    cont.setVisible(visible);
    if (!visible) return;
    cont.removeAll(true);
    var bg = this.add.circle(0, 0, 44, 0x241743, 0.9).setStrokeStyle(3, locked ? PAL.pink : PAL.cyan, 0.9);
    var lbl = this.add.text(0, 2, glyph, { fontFamily: 'system-ui', fontSize: locked ? '32px' : '40px', color: '#ffffff' }).setOrigin(0.5);
    cont.add([bg, lbl]);
  };

  Room.prototype.refreshArrows = function () {
    var s = this;
    var idx = s.index;
    var rooms = SC.DATA.rooms;
    var prevOk = idx > 0;
    var nextIdx = idx + 1;
    var nextOk = nextIdx < rooms.length;
    var nextLocked = nextOk && ((rooms[nextIdx] === 'bagno' && !SC.S.hasKey) || (rooms[nextIdx] === 'playa' && !SC.S.playaUnlocked));
    var prevLocked = prevOk && (rooms[idx - 1] === 'playa' && !SC.S.playaUnlocked);

    s.paintArrow(s.arrowL, false, '◂', prevOk && !prevLocked);
    s.paintArrow(s.arrowR, nextLocked, nextLocked ? '🔒' : '▸', nextOk);

    s.arrowL.off('pointerdown');
    s.arrowR.off('pointerdown');
    if (prevOk && !prevLocked) {
      s.arrowL.setInteractive(new Phaser.Geom.Rectangle(-44, -55, 88, 110), Phaser.Geom.Rectangle.Contains);
      s.arrowL.off('pointerdown');
      s.arrowL.on('pointerdown', function () {
        SC.sfx.tap();
        s.goRoom(idx - 1);
      });
    }
    if (nextOk) {
      s.arrowR.setInteractive(new Phaser.Geom.Rectangle(-44, -55, 88, 110), Phaser.Geom.Rectangle.Contains);
      s.arrowR.off('pointerdown');
      s.arrowR.on('pointerdown', function () {
        SC.sfx.tap();
        s.goRoom(nextIdx);
      });
    }
  };

  Room.prototype.refreshHUD = function () {
    var s = this;
    if (!s.invBtn) return;
    var count = 0;
    if (!SC.S.glassesGiven) count++;
    if (SC.S.hasKey) count++;
    if (SC.S.inferno) count++;
    if (SC.S.kegs) count++;
    s.invBadge.setText(count > 0 ? '' + count : '');
    s.invBadge.setPosition(30, 30);
    s.langTxt.setText(SC.lang === 'it' ? 'EN' : 'IT');
    s.refreshArrows();
    s.renderInvList();
  };

  Room.prototype.invItems = function () {
    var list = [];
    if (!SC.S.glassesGiven) list.push({ key: 'glasses', n: SC.S.glasses });
    if (SC.S.hasKey) list.push({ key: 'key' });
    if (SC.S.inferno) list.push({ key: 'inferno' });
    if (SC.S.kegs) list.push({ key: 'kegs' });
    return list;
  };

  Room.prototype.toggleInv = function () {
    var s = this;
    if (s.invOpen) s.closeInv();
    else {
      s.invOpen = true;
      s.renderInvList();
      s.sheet.setVisible(true);
      var panelH = 150;
      var panel = s.add.graphics();
      var px = 16, py = H - 210, pw = W - 32;
      rr(panel, px, py, pw, panelH, 20);
      panel.fillStyle(0x150c2b, 0.95); panel.fillPath();
      panel.lineStyle(2, PAL.gold, 0.7); rr(panel, px, py, pw, panelH, 20); panel.strokePath();
      s.sheet.add(panel);
      var lbl = s.add.text(36, py + 14, SC.txt({ it: '🎒 ZAINO — tocca per usare su un personaggio', en: '🎒 INVENTORY — tap to use on a character' }), { fontFamily: 'system-ui', fontSize: '17px', color: '#ffe9b0' });
      s.sheet.add(lbl);
      var items = s.invItems();
      var slotY = py + 40;
      if (items.length === 0) {
        var e = s.add.text(W / 2, slotY + 45, SC.txt({ it: 'Vuoto. Come i sogni di un lunedì mattina.', en: 'Empty. Like Monday-morning dreams.' }), { fontFamily: 'system-ui', fontSize: '20px', color: '#9fb3c7' }).setOrigin(0.5);
        s.sheet.add(e);
      } else {
        var per = Math.floor((pw - 40) / items.length);
        for (var i = 0; i < items.length; i++) {
          (function (item, i2) {
            var cxx = 36 + per * i2 + per / 2;
            var cont = s.add.container(0, 0, []);
            var meta = SC.DATA.items[item.key];
            var cx = s.add.circle(0, 0, 34, 0x241743, 1).setStrokeStyle(3, PAL.gold, 0.9);
            var icon = s.add.text(0, -2, meta.icon, { fontFamily: 'system-ui', fontSize: '34px' }).setOrigin(0.5);
            var nm = s.add.text(0, 46, meta.name[SC.lang], { fontFamily: 'system-ui', fontSize: '13px', color: '#fff', align: 'center', wordWrap: { width: per } }).setOrigin(0.5);
            cont.add([cx, icon, nm]);
            cont.setPosition(cxx, slotY + 30);
            cont.setSize(per - 8, 100);
            cont.setInteractive(new Phaser.Geom.Rectangle(-(per - 8) / 2, -50, per - 8, 100), Phaser.Geom.Rectangle.Contains);
            cont.on('pointerdown', function () {
              SC.sfx.tap();
              s.armed = item.key;
              s.closeInv();
              SC.toast(meta.name[SC.lang] + ' → ' + SC.txt(SC.DATA.toast.armed), PAL.cyan);
            });
            s.sheet.add(cont);
          })(items[i], i);
        }
      }
    }
  };

  Room.prototype.closeInv = function () {
    var s = this;
    s.invOpen = false;
    s.sheet.setVisible(false);
    s.sheet.removeAll(true);
  };

  Room.prototype.renderInvList = function () {
    var s = this;
    if (!s.sheet.visible) return;
    s.sheet.removeAll(true);
    s.sheet.setVisible(false);
    s.invOpen = false;
    s.toggleInv();
  };

  /* ---------- navigation ---------- */
  Room.prototype.goRoom = function (idx) {
    var s = this;
    var rooms = SC.DATA.rooms;
    if (idx < 0 || idx >= rooms.length) return;
    var target = rooms[idx];
    if (target === 'bagno' && !SC.S.hasKey) {
      SC.toast(SC.DATA.lockHints.bagno, PAL.pink);
      return;
    }
    if (target === 'playa' && !SC.S.playaUnlocked) {
      SC.toast(SC.DATA.lockHints.playa, PAL.pink);
      return;
    }
    if (target === s.roomId) return;
    SC.sfx.door();
    s.cameras.main.fadeOut(220, 12, 7, 22);
    s.time.delayedCall(240, function () {
      s.rebuild(target);
      s.cameras.main.fadeIn(220, 12, 7, 22);
    });
  };

  Room.prototype.finalizeToPlaya = function () {
    var s = this;
    SC.S.playaUnlocked = true;
    SC.S.room = 'playa';
    SC.S.save();
    s.cameras.main.fadeOut(260, 12, 7, 22);
    s.time.delayedCall(300, function () {
      s.rebuild('playa');
      s.cameras.main.fadeIn(300, 12, 7, 22);
    });
  };

  /* ---------- Finale scene ---------- */
  var Finale = function FinaleScene() { Phaser.Scene.call(this, { key: 'Finale' }); };
  Finale.prototype = Object.create(Phaser.Scene.prototype);
  Finale.prototype.constructor = Finale;

  Finale.prototype.create = function () {
    var s = this;
    SC.sfx.stopBgm();
    s.cameras.main.setBackgroundColor('#06030d');
    s.cards = [];
    var lines = [
      { c: PAL.pink, t: SC.txt({ it: 'ERCOLE ESCE DALLA DOCCIA.', en: 'ERCOLE STEPS OUT OF THE SHOWER.' }) },
      { c: PAL.gold, t: SC.txt({ it: '"FREE BEER FOR EVERYONE!"', en: '"FREE BEER FOR EVERYONE!"' }) },
      { c: PAL.cyan, t: SC.txt({ it: 'Le bottiglie di Luca si accendono. Davide fa rotolare i fusti. Thomas posa il mocio e sorride.', en: 'Luca\'s bottles light up. Davide rolls the kegs. Thomas puts down the mop and smiles.' }) },
      { c: PAL.green, t: SC.txt({ it: 'LA PLAYA…', en: 'THE PLAYA…' }) }
    ];
    var card = s.add.container(0, 0, []);
    var panel = s.add.graphics();
    rr(panel, 40, 480, W - 80, 320, 24);
    panel.fillStyle(0x150c2b, 0.95); panel.fillPath();
    panel.lineStyle(3, PAL.gold, 0.8); rr(panel, 40, 480, W - 80, 320, 24); panel.strokePath();
    var big = s.add.text(W / 2, 640, '', { fontFamily: 'Georgia, serif', fontSize: '42px', color: '#ffffff', align: 'center', wordWrap: { width: W - 140 } }).setOrigin(0.5);
    card.add([panel, big]);
    s.big = big;

    s.skip = s.add.text(W - 40, 60, SC.txt({ it: 'Salta ›', en: 'Skip ›' }), { fontFamily: 'system-ui', fontSize: '26px', color: '#9fb3c7' }).setOrigin(1, 0);
    s.skip.setInteractive({ useHandCursor: true });
    s.skip.on('pointerdown', function () { s.done(); });

    var idx = 0;
    s.playCard = function () {
      if (idx >= lines.length) { s.done(); return; }
      var l = lines[idx];
      idx++;
      s.big.setText(l.t);
      s.tweens.add({ targets: s.big, alpha: 0, duration: 0 });
      s.tweens.add({ targets: s.big, alpha: 1, duration: 300 });
      if (idx === 2) SC.sfx.cheer();
      s.time.delayedCall(2400, function () { s.playCard(); });
    };
    s.playCard();
  };

  Finale.prototype.done = function () {
    var s = this;
    var room = SC.sceneOp.getScene('Room');
    SC.sfx.stopBgm();
    SC.sceneOp.stop('Finale');
    if (room) {
      if (room.scene.isPaused()) room.scene.resume();
      room.finalizeToPlaya();
    } else {
      SC.sceneOp.start('Room', { roomId: 'playa' });
    }
  };

  SC.Room = Room;
  SC.Finale = Finale;

  SC.objText = function () {
    var s = SC.S;
    if (!s.hasKey && s.glasses < 5 && !s.glassesGiven) return SC.txt({ it: '✨ Raccogli 5 bicchieri per Thomas (Sala)', en: '✨ Collect 5 glasses for Thomas (Main Room)' });
    if (!s.hasKey && s.glasses >= 5) return SC.txt({ it: 'Parla con Thomas: porta i 5 bicchieri', en: 'Talk to Thomas: deliver the 5 glasses' });
    if (s.hasKey && !s.inferno && !s.davideWake) return SC.txt({ it: '🍸 Vinci il Flair Master con Luca (Bancone)', en: '🍸 Beat Flair Master with Luca (Counter)' });
    if (s.inferno && !s.davideWake) return SC.txt({ it: '🍹 Usa lo Scarlius Inferno su Davide (dallo zaino)', en: '🍹 Use the Scarlius Inferno on Davide (from backpack)' });
    if (s.davideWake && !s.kegs) return SC.txt({ it: '🏀 Fai 3 canestri di fila per Davide', en: '🏀 Make 3 baskets in a row for Davide' });
    if (s.kegs && !s.djSync) return SC.txt({ it: '🎛️ Vai in Bagno e sincronizza il deck di Ercole', en: '🎛️ Go to the Bathroom and sync Ercole\'s deck' });
    if (s.kegs && s.djSync && !s.playaUnlocked) return SC.txt({ it: '🗣️ Parla con Ercole: è ora della Playa!', en: '🗣️ Talk to Ercole: time for the Playa!' });
    if (s.playaUnlocked) return SC.txt({ it: '🏖️ FREE BEER PARTY: festa infinita alla Playa!', en: '🏖️ FREE BEER PARTY: endless party at the Playa!' });
    return SC.txt({ it: 'Esplora lo Scarlius…', en: 'Explore the Scarlius…' });
  };

})();
