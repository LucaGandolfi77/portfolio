(function () {
  'use strict';
  var SC = window.SCARLIUS = (window.SCARLIUS || {});
  var W = SC.W, H = SC.H;

  function fmt(o) { return SC.txt(o); }

  function pauseRoom() {
    try { if (SC.sceneOp.isActive('Room')) SC.sceneOp.pause('Room'); } catch (e) { /* noop */ }
  }
  function resumeRoom() {
    try { SC.sceneOp.resume('Room'); } catch (e) { /* noop */ }
  }

  SC.act = function (name) {
    var s = SC.S;
    if (name === 'takeGlasses') {
      s.hasKey = true;
      s.glassesGiven = true;
      s.glasses = 5;
      SC.emit('inv');
      SC.sfx.door();
      SC.toast(SC.DATA.toast.gotKey);
    }
  };

  SC.openDialog = function (nodeId, extra) {
    pauseRoom();
    SC.sceneOp.launch('Dialogue', { node: nodeId, extra: extra || null });
  };

  SC.playFinale = function () {
    SC.S.playaUnlocked = true;
    SC.S.finaleShown = true;
    SC.S.save();
    SC.sfx.cheer();
    SC.sceneOp.stop('Dialogue');
    SC.sceneOp.stop('Dj');
    SC.sceneOp.launch('Finale', {});
  };

  SC.miniEnd = function (resultNode) {
    if (SC.sceneOp.isPaused('Room')) {
      if (resultNode) {
        SC.sceneOp.launch('Dialogue', { node: resultNode });
      } else {
        resumeRoom();
      }
    }
  };

  var Dialogue = function DialogueScene() {
    Phaser.Scene.call(this, { key: 'Dialogue' });
  };
  Dialogue.prototype = Object.create(Phaser.Scene.prototype);
  Dialogue.prototype.constructor = Dialogue;

  Dialogue.prototype.create = function (data) {
    var s = this;
    s.nodeId = data.node || 'intro';
    s.root = s.add.container(0, 0);
    s.optList = [];

    var dim = s.add.rectangle(W / 2, H / 2, W, H, 0x0a0514, 0.72).setInteractive();
    s.dim = dim;
    s.dim.on('pointerdown', function () { /* swallow */ });

    s.panel = s.add.container(0, 0);
    s.root.add(s.panel);
    s.root.setDepth(10);

    s.renderNode(s.nodeId);
  };

  Dialogue.prototype.renderNode = function (nodeId) {
    var s = this;
    var node = SC.DATA.nodes[nodeId];
    if (!node) { s.finish(); return; }
    s.nodeId = nodeId;

    s.panel.removeAll(true);

    var bg = s.add.rectangle(W / 2, H * 0.58, W - 40, H * 0.62, 0x150c2b, 1).setStrokeStyle(3, 0xffffff, 0.14);
    bg.setOrigin(0.5);
    s.panel.add(bg);

    var top = H * 0.58 - (H * 0.62) / 2;

    var meta = SC.DATA.chars[node.who] || SC.DATA.chars.narrator;
    var accent = meta.color;

    if (node.who !== 'narrator') {
      var chip = s.add.circle(70, top + 64, 40, accent, 0.95);
      s.panel.add(chip);
      var chTxt = s.add.text(70, top + 64, meta.icon, { fontFamily: 'system-ui, sans-serif', fontSize: '44px' }).setOrigin(0.5);
      s.panel.add(chTxt);
      var name = s.add.text(126, top + 46, fmt(meta.name), { fontFamily: 'Georgia, serif', fontSize: '34px', fontStyle: 'bold', color: '#ffffff' });
      s.panel.add(name);
      if (meta.role && fmt(meta.role)) {
        var role = s.add.text(126, top + 84, fmt(meta.role), { fontFamily: 'system-ui', fontSize: '21px', color: '#' + accent.toString(16).padStart(6, '0') });
        s.panel.add(role);
      }
    } else {
      var nb = s.add.text(W / 2, top + 60, '🍺 SCARLIUS', { fontFamily: 'Georgia, serif', fontSize: '32px', fontStyle: 'bold', color: '#ffd166' }).setOrigin(0.5);
      s.panel.add(nb);
    }

    var bodyTop = top + (node.who === 'narrator' ? 96 : 128);
    var body = s.add.text(64, bodyTop, fmt(node.t), {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '27px',
      color: '#f4f7fb',
      lineSpacing: 6,
      wordWrap: { width: W - 128 }
    });
    s.panel.add(body);

    var opts = node.opts || [];
    var btnW = W - 100;
    var startX = W / 2;
    var slots = [];
    var btnH = 62;
    var gap = 14;
    var totalH = opts.length * btnH + (opts.length - 1) * gap;
    var y0 = Math.min(H - 90 - totalH, Math.max(bodyTop + 60, body.y + body.height + 20));
    if (y0 + totalH > H - 60) y0 = H - 60 - totalH;

    for (var i = 0; i < opts.length; i++) {
      (function (opt, idx) {
        var y = y0 + idx * (btnH + gap);
        var cont = s.add.container(startX - btnW / 2, y, []);
        var row = s.add.rectangle(btnW / 2, btnH / 2, btnW, btnH, 0x241743, 1).setStrokeStyle(2, accent, 0.9);
        row.setOrigin(0.5);
        var label = s.add.text(22, btnH / 2, fmt(opt.l), {
          fontFamily: 'system-ui, sans-serif',
          fontSize: '24px',
          color: '#ffffff',
          wordWrap: { width: btnW - 44 }
        }).setOrigin(0, 0.5);
        cont.add([row, label]);
        cont.setSize(btnW, btnH);
        cont.setInteractive(new Phaser.Geom.Rectangle(0, 0, btnW, btnH), Phaser.Geom.Rectangle.Contains);
        s.panel.add(cont);
        var r = row;
        cont.on('pointerover', function () { r.setFillStyle(0x37235e, 1); });
        cont.on('pointerout', function () { r.setFillStyle(0x241743, 1); });
        cont.on('pointerdown', function () {
          SC.sfx.tap();
          s.choose(opt);
        });
      })(opts[i], i);
    }
  };

  Dialogue.prototype.choose = function (opt) {
    var s = this;
    if (opt.act) SC.act(opt.act);
    var go = opt.go || '@end';
    if (go === '@end') { s.finish(); return; }
    if (go === '@flair' || go === '@basket' || go === '@dj') {
      var key = go.slice(1);
      SC.sceneOp.stop('Dialogue');
      pauseRoom();
      SC.sceneOp.launch(key, {});
      return;
    }
    if (go === '@finale') {
      SC.playFinale();
      return;
    }
    s.renderNode(go);
  };

  Dialogue.prototype.finish = function () {
    var s = this;
    s.cameras.main.fadeOut(180, 12, 7, 22);
    this.time.delayedCall(200, function () {
      SC.sceneOp.stop('Dialogue');
      resumeRoom();
    });
  };

  SC.Dialogue = Dialogue;

})();
