/* Lightweight procedural 2D bust used in the player grid (no WebGL contexts) */

import { shade } from '../core/theme.js';

const cache = new Map();

const FACE = {
  oval: [0.92, 1.08], round: [1.04, 0.96], square: [1.08, 0.94], long: [0.86, 1.18]
};

export function drawMiniAvatar(canvas, player, team, size = 96) {
  if (!canvas) return null;
  const c = canvas;
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  const color = (team && team.color) || '#00d4ff';
  const skin = player.skin || '#c68642';
  const hair = player.hairColor || '#1c1410';
  const [fw, fh] = FACE[player.faceShape] || FACE.oval;

  const bg = ctx.createLinearGradient(0, 0, size, size);
  bg.addColorStop(0, shade(color, -0.65));
  bg.addColorStop(1, '#070c1c');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, size, size);

  ctx.fillStyle = shade(color, -0.12);
  ctx.beginPath();
  ctx.ellipse(size / 2, size * 1.08, size * 0.42, size * 0.38, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = `900 ${Math.round(size * 0.22)}px Inter, sans-serif`;
  ctx.textAlign = 'center';
  ctx.globalAlpha = 0.16;
  ctx.fillText(String(player.jersey == null ? 1 : player.jersey), size / 2, size * 0.98);
  ctx.globalAlpha = 1;

  ctx.fillStyle = skin;
  ctx.beginPath();
  ctx.ellipse(size / 2, size * 0.52, size * 0.19 * fw, size * 0.24 * fh, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = hair;
  const style = player.hairStyle || 'short';
  ctx.beginPath();
  ctx.ellipse(size / 2, size * (style === 'buzz' ? 0.39 : 0.36), size * 0.2 * fw, size * (style === 'long' ? 0.18 : 0.13), 0, Math.PI, 0);
  ctx.fill();
  if (style === 'braids' || style === 'curly') {
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.arc(size / 2 + i * size * 0.06, size * 0.35, size * 0.035, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.fillStyle = '#101521';
  [-1, 1].forEach(side => {
    ctx.beginPath();
    ctx.arc(size / 2 + side * size * 0.075, size * 0.52, size * 0.017, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(size / 2 + side * size * 0.075 - size * 0.035, size * 0.47, size * 0.07, size * 0.012);
  });
  ctx.strokeStyle = 'rgba(60,30,20,.6)';
  ctx.lineWidth = Math.max(1, size * 0.012);
  ctx.beginPath();
  ctx.moveTo(size / 2, size * 0.54);
  ctx.lineTo(size / 2, size * 0.59);
  ctx.moveTo(size * 0.45, size * 0.64);
  ctx.quadraticCurveTo(size / 2, size * 0.66, size * 0.55, size * 0.64);
  ctx.stroke();
  return c;
}

export function miniAvatarUrl(player, team, size = 96) {
  const key = `${player.id}-${size}-${(team && team.color) || ''}`;
  if (cache.has(key)) return cache.get(key);
  const canvas = document.createElement('canvas');
  drawMiniAvatar(canvas, player, team, size);
  const url = canvas.toDataURL('image/png');
  if (cache.size > 400) cache.clear();
  cache.set(key, url);
  return url;
}
