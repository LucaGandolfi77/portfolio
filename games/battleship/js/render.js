/** render.js — rendering a strati del mondo navale. */

import { WORLD_SIZE } from './config.js';
import { distance } from './sim.js';

const TAU = Math.PI * 2;

function drawOcean(ctx, camera, width, height, night, storm, time) {
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, night ? '#071a2e' : '#0a5d8c');
  gradient.addColorStop(1, night ? '#030b18' : '#023b63');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  ctx.save();
  ctx.globalAlpha = night ? 0.12 : 0.2;
  ctx.strokeStyle = '#bfe9ff';
  ctx.lineWidth = 1;
  const spacing = 64;
  const offsetX = -((camera.x * 0.25) % spacing);
  const offsetY = -((camera.y * 0.25) % spacing);
  for (let x = offsetX; x < width; x += spacing) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + (storm ? 12 : 0), height); ctx.stroke();
  }
  for (let y = offsetY; y < height; y += spacing) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y - (storm ? 8 : 0)); ctx.stroke();
  }
  ctx.restore();

  if (storm) {
    ctx.save();
    ctx.strokeStyle = 'rgba(220,240,255,.35)';
    for (let i = 0; i < 70; i += 1) {
      const x = (i * 197 + time * 0.35) % width;
      const y = (i * 83 + time * 0.8) % height;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 8, y + 18); ctx.stroke();
    }
    ctx.restore();
  }
}

function drawIsland(ctx, island, camera) {
  const x = island.x - camera.x, y = island.y - camera.y;
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,.25)';
  ctx.beginPath(); ctx.ellipse(x + 6, y + 8, island.radius, island.radius * 0.75, 0, 0, TAU); ctx.fill();
  const gradient = ctx.createRadialGradient(x - island.radius * 0.3, y - island.radius * 0.3, 2, x, y, island.radius);
  gradient.addColorStop(0, '#8fbf5a'); gradient.addColorStop(1, '#2e6234');
  ctx.fillStyle = gradient;
  ctx.beginPath(); ctx.ellipse(x, y, island.radius, island.radius * 0.78, 0, 0, TAU); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,.25)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.ellipse(x, y, island.radius, island.radius * 0.78, 0, 0, TAU); ctx.stroke();
  ctx.restore();
}

function drawShip(ctx, ship, color, isPlayer, camera) {
  const x = ship.x - camera.x, y = ship.y - camera.y;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(ship.angle || 0);
  if (ship.speed > 0.5) {
    ctx.strokeStyle = 'rgba(255,255,255,.28)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-20, -5); ctx.lineTo(-42 - Math.random() * 12, -14);
    ctx.moveTo(-20, 5); ctx.lineTo(-42 - Math.random() * 12, 14); ctx.stroke();
  }
  ctx.fillStyle = 'rgba(0,0,0,.3)';
  ctx.beginPath(); ctx.ellipse(3, 5, 26, 11, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#26313f';
  ctx.beginPath(); ctx.ellipse(0, 0, 26, 11, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.ellipse(0, 0, 21, 8, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#596879';
  ctx.beginPath(); ctx.arc(6, 0, 6, 0, TAU); ctx.fill();
  ctx.strokeStyle = '#596879'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(6, 0); ctx.lineTo(22, 0); ctx.stroke();
  if (ship.boss) {
    ctx.strokeStyle = '#ffd166'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.ellipse(0, 0, 30, 14, 0, 0, TAU); ctx.stroke();
  }
  ctx.restore();

  if (!isPlayer) {
    const health = Math.max(0, ship.hp / ship.maxHp);
    ctx.fillStyle = 'rgba(0,0,0,.55)';
    ctx.fillRect(x - 18, y - 26, 36, 5);
    ctx.fillStyle = health > 0.5 ? '#7cf5b4' : '#ff8fb3';
    ctx.fillRect(x - 18, y - 26, 36 * health, 5);
  }
}

export function createRenderer(ctx) {
  return {
    render(world, camera, width, height, fx, options = {}) {
      const night = (world.mission.mods || []).includes('night');
      const storm = (world.mission.mods || []).includes('storm');
      drawOcean(ctx, camera, width, height, night, storm, performance.now());
      for (const island of world.islands) {
        if (distance(island, camera) < Math.max(width, height) * 0.8) drawIsland(ctx, island, camera);
      }
      for (const ship of world.convoy) {
        if (!ship.alive) continue;
        drawShip(ctx, ship, '#ffd166', false, camera);
      }
      for (const enemy of world.enemies) drawShip(ctx, enemy, enemy.boss ? '#ff6b9d' : '#e05a6a', false, camera);
      if (world.player.alive) drawShip(ctx, world.player, '#67e8f9', true, camera);

      for (const shot of world.projectiles) {
        const x = shot.x - camera.x, y = shot.y - camera.y;
        ctx.save();
        ctx.shadowColor = shot.color; ctx.shadowBlur = 12;
        ctx.fillStyle = shot.color;
        ctx.beginPath(); ctx.arc(x, y, shot.radius, 0, TAU); ctx.fill();
        ctx.restore();
      }
      if (fx) fx.draw(ctx);
      if (options.minimap !== false) drawMinimap(ctx, world, width, height);
    }
  };
}

function drawMinimap(ctx, world, width, height) {
  const size = Math.min(150, width * 0.22);
  const x = width - size - 14, y = height - size - 14;
  ctx.save();
  ctx.fillStyle = 'rgba(3,12,26,.72)';
  ctx.fillRect(x, y, size, size);
  ctx.strokeStyle = 'rgba(255,255,255,.35)';
  ctx.strokeRect(x, y, size, size);
  const scale = size / WORLD_SIZE;
  const point = (entity, color, radius = 2) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x + entity.x * scale, y + entity.y * scale, radius, 0, TAU);
    ctx.fill();
  };
  world.islands.forEach((island) => {
    ctx.fillStyle = 'rgba(120,190,100,.4)';
    ctx.beginPath(); ctx.arc(x + island.x * scale, y + island.y * scale, island.radius * scale, 0, TAU); ctx.fill();
  });
  world.enemies.forEach((enemy) => point(enemy, enemy.boss ? '#ff6b9d' : '#ff8fb3', enemy.boss ? 4 : 2));
  world.convoy.filter((ship) => ship.alive).forEach((ship) => point(ship, '#ffd166'));
  point(world.player, '#67e8f9', 3);
  ctx.restore();
}
