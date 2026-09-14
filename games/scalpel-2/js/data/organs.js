/* ═══════════════════════════════════════════════════════════════
   SCALPEL-2 — Organs Rendering Data
   ═══════════════════════════════════════════════════════════════ */

var S2 = S2 || {};

S2.Organs = {
  appendix: {
    id: 'appendix',
    name: 'Appendix',
    emoji: '🔴',
    color: '#e74c3c',
    colorLight: '#ec7063',
    colorDark: '#c0392b',
    render: function(ctx, cx, cy, size, frame) {
      var pulse = Math.sin(frame * 0.05) * 0.1 + 1;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(pulse, pulse);

      /* Main body */
      ctx.beginPath();
      ctx.moveTo(-size * 0.3, -size * 0.5);
      ctx.bezierCurveTo(-size * 0.1, -size * 0.6, size * 0.1, -size * 0.6, size * 0.3, -size * 0.5);
      ctx.bezierCurveTo(size * 0.4, -size * 0.3, size * 0.3, size * 0.2, 0, size * 0.5);
      ctx.bezierCurveTo(-size * 0.3, size * 0.2, -size * 0.4, -size * 0.3, -size * 0.3, -size * 0.5);
      ctx.fillStyle = '#e74c3c';
      ctx.fill();

      /* Inflammation */
      ctx.beginPath();
      ctx.arc(0, size * 0.2, size * 0.2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(231, 76, 60, 0.5)';
      ctx.fill();

      ctx.restore();
    }
  },

  esophagus: {
    id: 'esophagus',
    name: 'Esophagus',
    emoji: '🟤',
    color: '#d35400',
    colorLight: '#e67e22',
    colorDark: '#a04000',
    render: function(ctx, cx, cy, size, frame) {
      var pulse = Math.sin(frame * 0.04) * 0.05 + 1;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(pulse, pulse);

      /* Tube */
      ctx.beginPath();
      ctx.moveTo(-size * 0.2, -size * 0.6);
      ctx.bezierCurveTo(-size * 0.25, -size * 0.3, -size * 0.2, size * 0.1, -size * 0.15, size * 0.5);
      ctx.lineTo(size * 0.15, size * 0.5);
      ctx.bezierCurveTo(size * 0.2, size * 0.1, size * 0.25, -size * 0.3, size * 0.2, -size * 0.6);
      ctx.fillStyle = '#d35400';
      ctx.fill();

      /* Inner tube */
      ctx.beginPath();
      ctx.moveTo(-size * 0.1, -size * 0.5);
      ctx.bezierCurveTo(-size * 0.12, -size * 0.2, -size * 0.1, size * 0.1, -size * 0.08, size * 0.4);
      ctx.lineTo(size * 0.08, size * 0.4);
      ctx.bezierCurveTo(size * 0.1, size * 0.1, size * 0.12, -size * 0.2, size * 0.1, -size * 0.5);
      ctx.fillStyle = '#a04000';
      ctx.fill();

      ctx.restore();
    }
  },

  heart: {
    id: 'heart',
    name: 'Heart',
    emoji: '❤️',
    color: '#c0392b',
    colorLight: '#e74c3c',
    colorDark: '#96281b',
    render: function(ctx, cx, cy, size, frame) {
      var beat = Math.sin(frame * 0.15);
      var pulse = beat > 0.8 ? 1.1 : 1;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(pulse, pulse);

      /* Main heart shape */
      ctx.beginPath();
      ctx.moveTo(0, size * 0.3);
      ctx.bezierCurveTo(-size * 0.5, size * 0.1, -size * 0.6, -size * 0.4, 0, -size * 0.5);
      ctx.bezierCurveTo(size * 0.6, -size * 0.4, size * 0.5, size * 0.1, 0, size * 0.3);
      ctx.fillStyle = '#c0392b';
      ctx.fill();

      /* Vessels */
      ctx.beginPath();
      ctx.moveTo(-size * 0.1, -size * 0.3);
      ctx.lineTo(-size * 0.15, -size * 0.6);
      ctx.strokeStyle = '#96281b';
      ctx.lineWidth = size * 0.08;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(size * 0.1, -size * 0.3);
      ctx.lineTo(size * 0.15, -size * 0.6);
      ctx.strokeStyle = '#96281b';
      ctx.lineWidth = size * 0.08;
      ctx.stroke();

      /* Highlight */
      ctx.beginPath();
      ctx.arc(-size * 0.2, -size * 0.15, size * 0.1, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(231, 76, 60, 0.6)';
      ctx.fill();

      ctx.restore();
    }
  },

  brain: {
    id: 'brain',
    name: 'Brain',
    emoji: '🧠',
    color: '#8e44ad',
    colorLight: '#9b59b6',
    colorDark: '#6c3483',
    render: function(ctx, cx, cy, size, frame) {
      var pulse = Math.sin(frame * 0.03) * 0.03 + 1;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(pulse, pulse);

      /* Left hemisphere */
      ctx.beginPath();
      ctx.arc(-size * 0.15, 0, size * 0.35, 0, Math.PI * 2);
      ctx.fillStyle = '#8e44ad';
      ctx.fill();

      /* Right hemisphere */
      ctx.beginPath();
      ctx.arc(size * 0.15, 0, size * 0.35, 0, Math.PI * 2);
      ctx.fillStyle = '#9b59b6';
      ctx.fill();

      /* Sulci (grooves) */
      ctx.strokeStyle = '#6c3483';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-size * 0.15, -size * 0.2);
      ctx.bezierCurveTo(-size * 0.3, 0, -size * 0.1, size * 0.1, -size * 0.15, size * 0.25);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(size * 0.15, -size * 0.2);
      ctx.bezierCurveTo(size * 0.3, 0, size * 0.1, size * 0.1, size * 0.15, size * 0.25);
      ctx.stroke();

      ctx.restore();
    }
  },

  alien_lungs: {
    id: 'alien_lungs',
    name: 'Alien Lungs',
    emoji: '👽',
    color: '#27ae60',
    colorLight: '#2ecc71',
    colorDark: '#1e8449',
    render: function(ctx, cx, cy, size, frame) {
      var pulse = Math.sin(frame * 0.06) * 0.1 + 1;
      var glow = Math.sin(frame * 0.08) * 0.3 + 0.7;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(pulse, pulse);

      /* Main lung shape */
      ctx.beginPath();
      ctx.ellipse(-size * 0.25, 0, size * 0.25, size * 0.4, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#27ae60';
      ctx.fill();

      ctx.beginPath();
      ctx.ellipse(size * 0.25, 0, size * 0.25, size * 0.4, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#2ecc71';
      ctx.fill();

      /* Crystals */
      for (var i = 0; i < 5; i++) {
        var angle = (i / 5) * Math.PI * 2 + frame * 0.02;
        var r = size * 0.15;
        var x = Math.cos(angle) * r;
        var y = Math.sin(angle) * r;
        ctx.beginPath();
        ctx.moveTo(x, y - size * 0.08);
        ctx.lineTo(x - size * 0.04, y + size * 0.04);
        ctx.lineTo(x + size * 0.04, y + size * 0.04);
        ctx.closePath();
        ctx.fillStyle = 'rgba(46, 204, 113, ' + glow + ')';
        ctx.fill();
      }

      ctx.restore();
    }
  },

  bones: {
    id: 'bones',
    name: 'Bones',
    emoji: '🦴',
    color: '#bdc3c7',
    colorLight: '#ecf0f1',
    colorDark: '#95a5a6',
    render: function(ctx, cx, cy, size, frame) {
      var pulse = Math.sin(frame * 0.04) * 0.05 + 1;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(pulse, pulse);

      /* Femur shaft */
      ctx.beginPath();
      ctx.roundRect(-size * 0.08, -size * 0.5, size * 0.16, size * 0.7, size * 0.04);
      ctx.fillStyle = '#bdc3c7';
      ctx.fill();

      /* Top head */
      ctx.beginPath();
      ctx.arc(0, -size * 0.5, size * 0.12, 0, Math.PI * 2);
      ctx.fillStyle = '#ecf0f1';
      ctx.fill();

      /* Bottom condyles */
      ctx.beginPath();
      ctx.ellipse(-size * 0.08, size * 0.25, size * 0.08, size * 0.1, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#ecf0f1';
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(size * 0.08, size * 0.25, size * 0.08, size * 0.1, 0, 0, Math.PI * 2);
      ctx.fill();

      /* Fracture line */
      ctx.strokeStyle = '#e74c3c';
      ctx.lineWidth = 2;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(-size * 0.15, -size * 0.1);
      ctx.lineTo(size * 0.15, size * 0.05);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.restore();
    }
  },

  airway: {
    id: 'airway',
    name: 'Airway',
    emoji: '🫁',
    color: '#3498db',
    colorLight: '#5dade2',
    colorDark: '#2980b9',
    render: function(ctx, cx, cy, size, frame) {
      var pulse = Math.sin(frame * 0.05) * 0.05 + 1;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(pulse, pulse);

      /* Trachea */
      ctx.beginPath();
      ctx.roundRect(-size * 0.06, -size * 0.6, size * 0.12, size * 0.4, size * 0.03);
      ctx.fillStyle = '#3498db';
      ctx.fill();

      /* Bronchi */
      ctx.beginPath();
      ctx.moveTo(-size * 0.06, -size * 0.2);
      ctx.lineTo(-size * 0.25, size * 0.1);
      ctx.strokeStyle = '#3498db';
      ctx.lineWidth = size * 0.06;
      ctx.lineCap = 'round';
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(size * 0.06, -size * 0.2);
      ctx.lineTo(size * 0.25, size * 0.1);
      ctx.stroke();

      /* Swelling indicator */
      ctx.beginPath();
      ctx.ellipse(0, -size * 0.3, size * 0.1, size * 0.15, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(231, 76, 60, 0.4)';
      ctx.fill();

      ctx.restore();
    }
  },

  bloodstream: {
    id: 'bloodstream',
    name: 'Bloodstream',
    emoji: '🩸',
    color: '#e74c3c',
    colorLight: '#ec7063',
    colorDark: '#c0392b',
    render: function(ctx, cx, cy, size, frame) {
      var pulse = Math.sin(frame * 0.08) * 0.1 + 1;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(pulse, pulse);

      /* Main vessel */
      ctx.beginPath();
      ctx.moveTo(-size * 0.3, -size * 0.5);
      ctx.bezierCurveTo(-size * 0.35, 0, size * 0.35, 0, size * 0.3, size * 0.5);
      ctx.lineTo(-size * 0.3, -size * 0.5);
      ctx.fillStyle = '#e74c3c';
      ctx.fill();

      /* Blood cells */
      for (var i = 0; i < 6; i++) {
        var t = (i / 6 + frame * 0.01) % 1;
        var x = Math.sin(t * Math.PI * 2) * size * 0.15;
        var y = -size * 0.4 + t * size * 0.8;
        ctx.beginPath();
        ctx.ellipse(x, y, size * 0.06, size * 0.04, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#c0392b';
        ctx.fill();
      }

      /* Bubble indicators */
      for (var j = 0; j < 3; j++) {
        var bx = Math.sin(frame * 0.03 + j) * size * 0.1;
        var by = Math.cos(frame * 0.02 + j * 2) * size * 0.2;
        ctx.beginPath();
        ctx.arc(bx, by, size * 0.03, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(52, 152, 219, 0.6)';
        ctx.fill();
      }

      ctx.restore();
    }
  },

  uterus: {
    id: 'uterus',
    name: 'Uterus',
    emoji: '🤰',
    color: '#e91e63',
    colorLight: '#f06292',
    colorDark: '#c2185b',
    render: function(ctx, cx, cy, size, frame) {
      var pulse = Math.sin(frame * 0.04) * 0.05 + 1;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(pulse, pulse);

      /* Main body */
      ctx.beginPath();
      ctx.moveTo(0, -size * 0.4);
      ctx.bezierCurveTo(-size * 0.4, -size * 0.3, -size * 0.5, size * 0.2, 0, size * 0.4);
      ctx.bezierCurveTo(size * 0.5, size * 0.2, size * 0.4, -size * 0.3, 0, -size * 0.4);
      ctx.fillStyle = '#e91e63';
      ctx.fill();

      /* Baby outline */
      ctx.beginPath();
      ctx.arc(0, size * 0.1, size * 0.15, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(243, 156, 18, 0.4)';
      ctx.fill();

      ctx.restore();
    }
  },

  hip: {
    id: 'hip',
    name: 'Hip',
    emoji: '🦴',
    color: '#bdc3c7',
    colorLight: '#ecf0f1',
    colorDark: '#95a5a6',
    render: function(ctx, cx, cy, size, frame) {
      var pulse = Math.sin(frame * 0.04) * 0.05 + 1;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(pulse, pulse);

      /* Pelvis */
      ctx.beginPath();
      ctx.ellipse(-size * 0.25, 0, size * 0.2, size * 0.3, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#bdc3c7';
      ctx.fill();

      ctx.beginPath();
      ctx.ellipse(size * 0.25, 0, size * 0.2, size * 0.3, 0, 0, Math.PI * 2);
      ctx.fill();

      /* Femoral head */
      ctx.beginPath();
      ctx.arc(0, size * 0.1, size * 0.12, 0, Math.PI * 2);
      ctx.fillStyle = '#ecf0f1';
      ctx.fill();

      /* Fracture */
      ctx.strokeStyle = '#e74c3c';
      ctx.lineWidth = 2;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(-size * 0.1, size * 0.15);
      ctx.lineTo(size * 0.1, size * 0.25);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.restore();
    }
  },

  chest: {
    id: 'chest',
    name: 'Chest',
    emoji: '🫁',
    color: '#3498db',
    colorLight: '#5dade2',
    colorDark: '#2980b9',
    render: function(ctx, cx, cy, size, frame) {
      var pulse = Math.sin(frame * 0.05) * 0.05 + 1;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(pulse, pulse);

      /* Ribcage */
      for (var i = 0; i < 5; i++) {
        var y = -size * 0.3 + i * size * 0.15;
        ctx.beginPath();
        ctx.ellipse(0, y, size * 0.35 - i * size * 0.02, size * 0.04, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(189, 195, 199, 0.5)';
        ctx.fill();
      }

      /* Impaled object */
      ctx.strokeStyle = '#95a5a6';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(-size * 0.4, -size * 0.1);
      ctx.lineTo(size * 0.4, size * 0.1);
      ctx.stroke();

      ctx.restore();
    }
  },

  knee: {
    id: 'knee',
    name: 'Knee',
    emoji: '🦵',
    color: '#bdc3c7',
    colorLight: '#ecf0f1',
    colorDark: '#95a5a6',
    render: function(ctx, cx, cy, size, frame) {
      var pulse = Math.sin(frame * 0.04) * 0.05 + 1;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(pulse, pulse);

      /* Femur */
      ctx.beginPath();
      ctx.roundRect(-size * 0.08, -size * 0.6, size * 0.16, size * 0.35, size * 0.04);
      ctx.fillStyle = '#bdc3c7';
      ctx.fill();

      /* Tibia */
      ctx.beginPath();
      ctx.roundRect(-size * 0.07, size * 0.05, size * 0.14, size * 0.45, size * 0.04);
      ctx.fillStyle = '#bdc3c7';
      ctx.fill();

      /* Joint space */
      ctx.beginPath();
      ctx.ellipse(0, 0, size * 0.15, size * 0.06, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#ecf0f1';
      ctx.fill();

      /* ACL tear indicator */
      ctx.strokeStyle = '#e74c3c';
      ctx.lineWidth = 3;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(-size * 0.05, -size * 0.05);
      ctx.lineTo(size * 0.05, size * 0.05);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.restore();
    }
  },

  kidney: {
    id: 'kidney',
    name: 'Kidney',
    emoji: '🫘',
    color: '#8b4513',
    colorLight: '#a0522d',
    colorDark: '#654321',
    render: function(ctx, cx, cy, size, frame) {
      var pulse = Math.sin(frame * 0.04) * 0.05 + 1;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(pulse, pulse);

      /* Kidney shape */
      ctx.beginPath();
      ctx.moveTo(0, -size * 0.4);
      ctx.bezierCurveTo(-size * 0.4, -size * 0.3, -size * 0.45, size * 0.3, 0, size * 0.4);
      ctx.bezierCurveTo(size * 0.35, size * 0.2, size * 0.3, -size * 0.2, 0, -size * 0.4);
      ctx.fillStyle = '#8b4513';
      ctx.fill();

      /* Hilum */
      ctx.beginPath();
      ctx.ellipse(size * 0.05, 0, size * 0.08, size * 0.15, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#654321';
      ctx.fill();

      /* Stones */
      for (var i = 0; i < 3; i++) {
        var sx = Math.sin(i * 2) * size * 0.1;
        var sy = Math.cos(i * 1.5) * size * 0.15;
        ctx.beginPath();
        ctx.arc(sx, sy, size * 0.04, 0, Math.PI * 2);
        ctx.fillStyle = '#f39c12';
        ctx.fill();
      }

      ctx.restore();
    }
  },

  gallbladder: {
    id: 'gallbladder',
    name: 'Gallbladder',
    emoji: '🟤',
    color: '#27ae60',
    colorLight: '#2ecc71',
    colorDark: '#1e8449',
    render: function(ctx, cx, cy, size, frame) {
      var pulse = Math.sin(frame * 0.04) * 0.05 + 1;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(pulse, pulse);

      /* Gallbladder shape */
      ctx.beginPath();
      ctx.moveTo(0, -size * 0.3);
      ctx.bezierCurveTo(-size * 0.25, -size * 0.2, -size * 0.3, size * 0.3, 0, size * 0.4);
      ctx.bezierCurveTo(size * 0.3, size * 0.3, size * 0.25, -size * 0.2, 0, -size * 0.3);
      ctx.fillStyle = '#27ae60';
      ctx.fill();

      /* Duct */
      ctx.beginPath();
      ctx.moveTo(0, -size * 0.3);
      ctx.lineTo(0, -size * 0.5);
      ctx.strokeStyle = '#1e8449';
      ctx.lineWidth = size * 0.04;
      ctx.lineCap = 'round';
      ctx.stroke();

      /* Gallstones */
      for (var i = 0; i < 4; i++) {
        var gx = Math.sin(i * 1.8) * size * 0.1;
        var gy = Math.cos(i * 1.2) * size * 0.15;
        ctx.beginPath();
        ctx.arc(gx, gy, size * 0.035, 0, Math.PI * 2);
        ctx.fillStyle = '#f39c12';
        ctx.fill();
      }

      ctx.restore();
    }
  }
};

window.S2 = window.S2 || {};
window.S2.Organs = S2.Organs;
