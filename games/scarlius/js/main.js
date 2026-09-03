(function () {
  'use strict';

  var SC = window.SCARLIUS = (window.SCARLIUS || {});
  SC.W = 720;
  SC.H = 1280;

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

  function make(scene, key, w, h, draw) {
    var g = scene.add.graphics();
    draw(g, w, h);
    g.generateTexture(key, w, h);
    g.destroy();
  }

  function drawChibi(g, pal) {
    var skin = pal.skin, hair = pal.hair, shirt = pal.shirt, pants = pal.pants;
    var headY = 96, headR = 54, cx = 100;

    g.fillStyle(pal.shoe, 1);
    rr(g, 58, 296, 40, 22, 8); g.fillPath();
    rr(g, 102, 296, 40, 22, 8); g.fillPath();

    g.fillStyle(pants, 1);
    rr(g, 66, 224, 34, 80, 12); g.fillPath();
    rr(g, 100, 224, 34, 80, 12); g.fillPath();

    g.fillStyle(skin, 1);
    rr(g, 52, 214, 16, 60, 8); g.fillPath();
    rr(g, 132, 214, 16, 60, 8); g.fillPath();

    g.fillStyle(shirt, 1);
    rr(g, 48, 150, 104, 90, 22); g.fillPath();
    g.fillStyle(pal.shade, 0.35);
    rr(g, 48, 168, 104, 12, 6); g.fillPath();

    g.fillStyle(skin, 1);
    rr(g, 46, 136, 108, 26, 13); g.fillPath();

    g.fillStyle(skin, 1);
    g.fillCircle(cx, headY - 6, headR);

    g.fillStyle(hair, 1);
    g.fillCircle(cx, headY - 26, headR + 2);
    rr(g, cx - headR - 2, headY - 26, headR * 2 + 4, headR * 0.72, 18); g.fillPath();
    if (pal.beard) {
      g.fillStyle(pal.beard, 1);
      g.fillEllipse(cx, headY + 26, headR * 0.9, headR * 0.62);
    }
    if (pal.horns) {
      g.fillStyle(0xffe9b0, 1);
      g.beginPath();
      g.moveTo(cx - headR + 14, headY - 30);
      g.lineTo(cx - headR - 14, headY - 92);
      g.lineTo(cx - headR - 2, headY - 22);
      g.closePath(); g.fillPath();
      g.beginPath();
      g.moveTo(cx + headR - 14, headY - 30);
      g.lineTo(cx + headR + 14, headY - 92);
      g.lineTo(cx + headR + 2, headY - 22);
      g.closePath(); g.fillPath();
    }

    g.fillStyle(0xffffff, 1);
    g.fillCircle(cx - 18, headY - 12, 11);
    g.fillCircle(cx + 18, headY - 12, 11);
    g.fillStyle(pal.eye || 0x222244, 1);
    g.fillCircle(cx - 15, headY - 12, 5);
    g.fillCircle(cx + 21, headY - 12, 5);
    g.fillStyle(0xffffff, 1);
    g.fillCircle(cx - 13, headY - 14, 2);
    g.fillCircle(cx + 23, headY - 14, 2);

    if (pal.cheeks) {
      g.fillStyle(pal.cheeks, 0.5);
      g.fillCircle(cx - 34, headY + 2, 7);
      g.fillCircle(cx + 34, headY + 2, 7);
    }
    g.fillStyle(0x553322, 1);
    g.fillRoundedRect(cx - 6, headY + 6, 12, 3, 2);
  }

  function chibiTexture(scene, key, pal, horns) {
    var pal2 = Object.assign({}, pal);
    pal2.horns = horns;
    make(scene, key, 200, 340, function (g) { drawChibi(g, pal2); });
  }

  var Boot = function BootScene() {
    Phaser.Scene.call(this, { key: 'Boot' });
  };
  Boot.prototype = Object.create(Phaser.Scene.prototype);
  Boot.prototype.constructor = Boot;
  Boot.prototype.create = function () {
    var s = this;
    SC.sceneOp.registerManager(s.scene.manager);

    chibiTexture(s, 'char_thomas', { skin: 0xffcf9f, hair: 0x2a1b4a, shirt: 0x7b5bff, pants: 0x241b3a, shoe: 0x1a1230, shade: 0x000000, cheeks: 0xffa5a5 });
    chibiTexture(s, 'char_luca', { skin: 0xffcf9f, hair: 0x16e3f0, shirt: 0x0fbf9c, pants: 0x0d2a3a, shoe: 0x06202e, shade: 0x0b6b80, cheeks: 0x9ff5e0 });
    chibiTexture(s, 'char_davide', { skin: 0xffb98c, hair: 0x2b2620, shirt: 0xffd166, pants: 0x1d1a33, shoe: 0x111024, shade: 0xc4901f, cheeks: 0xffa05a, eye: 0x662211 });
    chibiTexture(s, 'char_ercole', { skin: 0xffcf9f, hair: 0xd83b18, shirt: 0xff2e88, pants: 0x3a1024, shoe: 0x250b18, shade: 0xa11a55, beard: 0xd83b18, cheeks: 0xffb1c8 }, true);

    make(s, 'glass', 56, 70, function (g) {
      g.lineStyle(4, 0xaee9ff, 0.9);
      g.beginPath();
      g.moveTo(10, 6); g.lineTo(20, 64); curve(g, 20, 64, 28, 68, 36, 64); g.lineTo(46, 6);
      g.closePath(); g.strokePath();
      g.fillStyle(0xaee9ff, 0.28);
      rr(g, 14, 22, 28, 6, 3); g.fillPath();
      rr(g, 14, 38, 28, 6, 3); g.fillPath();
    });

    make(s, 'key', 120, 96, function (g) {
      g.lineStyle(7, 0xffd166, 1);
      g.beginPath(); g.arc(34, 52, 24, 0, Math.PI * 2); g.strokePath();
      g.lineStyle(9, 0xffd166, 1);
      g.beginPath();
      g.moveTo(56, 52); g.lineTo(104, 52);
      g.moveTo(86, 52); g.lineTo(86, 66);
      g.moveTo(76, 52); g.lineTo(76, 70);
      g.moveTo(96, 52); g.lineTo(96, 62);
      g.strokePath();
    });

    make(s, 'inferno', 74, 150, function (g) {
      g.fillStyle(0x7a0e2b, 1);
      g.beginPath();
      g.moveTo(8, 62); g.lineTo(22, 140); curve(g, 22, 140, 37, 148, 52, 140); g.lineTo(66, 62);
      g.closePath(); g.fillPath();
      g.fillStyle(0xb3123f, 1);
      rr(g, 6, 50, 62, 18, 5); g.fillPath();
      g.fillStyle(0xff5d3a, 0.9);
      g.fillCircle(37, 34, 16);
      g.fillStyle(0xffd166, 1);
      g.fillCircle(33, 26, 9);
      g.fillStyle(0xffffff, 0.9);
      g.fillCircle(30, 22, 4);
      g.fillStyle(0xff2e88, 0.5);
      rr(g, 18, 30, 10, 18, 5); g.fillPath();
      rr(g, 44, 26, 8, 16, 4); g.fillPath();
    });

    make(s, 'keg', 132, 150, function (g) {
      g.fillStyle(0x8f6a2a, 1);
      rr(g, 12, 16, 108, 120, 28); g.fillPath();
      g.fillStyle(0xc9983f, 1);
      rr(g, 44, 4, 44, 22, 8); g.fillPath();
      g.fillStyle(0x6d4e1a, 1);
      g.fillCircle(16, 60, 9); g.fillCircle(116, 60, 9);
      g.fillStyle(0xffd166, 1);
      rr(g, 44, 26, 44, 8, 4); g.fillPath();
      g.fillStyle(0xffe9b0, 1);
      g.fillCircle(66, 66, 18);
      g.fillStyle(0x4a3410, 1);
      g.fillRoundedRect(66, 58, 4, 20, 2);
      g.fillCircle(66, 40, 7);
    });

    make(s, 'ball', 72, 72, function (g) {
      g.fillStyle(0xf4f7fb, 1);
      g.fillCircle(36, 36, 30);
      g.fillStyle(0xc2ccd6, 1);
      g.fillCircle(24, 24, 8); g.fillCircle(46, 50, 10); g.fillCircle(40, 22, 5);
      g.lineStyle(3, 0x9aa7b5, 1);
      g.beginPath(); g.moveTo(10, 20); g.lineTo(30, 52); g.strokePath();
      g.beginPath(); g.moveTo(54, 12); g.lineTo(60, 40); g.strokePath();
    });

    make(s, 'sparkle', 44, 44, function (g) {
      g.fillStyle(0xfff2b0, 1);
      g.beginPath();
      g.moveTo(22, 0); g.lineTo(30, 14); g.lineTo(44, 22); g.lineTo(30, 30); g.lineTo(22, 44);
      g.lineTo(14, 30); g.lineTo(0, 22); g.lineTo(14, 14);
      g.closePath(); g.fillPath();
    });

    make(s, 'chev', 60, 60, function (g) {
      g.fillStyle(0xffffff, 1);
      g.beginPath();
      g.moveTo(22, 4); g.lineTo(4, 30); g.lineTo(22, 56); g.lineTo(36, 56); g.lineTo(16, 30); g.lineTo(36, 4);
      g.closePath(); g.fillPath();
    });

    make(s, 'chevs', 60, 60, function (g) {
      g.fillStyle(0xffffff, 1);
      g.beginPath();
      g.moveTo(4, 4); g.lineTo(20, 30); g.lineTo(4, 56); g.lineTo(18, 56); g.lineTo(38, 30); g.lineTo(18, 4);
      g.closePath(); g.fillPath();
    });

    SC.S.load();
    SC.lang = SC.S.lang || 'it';

    this.cameras.main.fadeIn(400, 12, 7, 22);
    this.time.delayedCall(420, function () {
      s.scene.start('Room', { roomId: SC.S.room || 'sala' });
    });
  };
  SC.Boot = Boot;

  var config = {
    type: Phaser.AUTO,
    parent: 'game',
    backgroundColor: '#0c0716',
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: SC.W,
      height: SC.H
    },
    input: { activePointers: 3 },
    scene: []
  };

  function start() {
    config.scene = [SC.Boot, SC.Room, SC.UI, SC.Dialogue, SC.Flair, SC.Basket, SC.Dj, SC.Finale];
    var game = new Phaser.Game(config);
    SC.game = game;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }

})();
