/* ===== MORFALIA · Painterly 2.5D Canvas Renderer ===== */
import { MAP_W, MAP_H, TILE_SIZE, TILES, POWERS, getTimePeriod } from '../data/config.js';
import { ITEMS, CROPS } from '../data/items.js';
import { BIOMINI_BY_ID } from '../data/biomini.js';

export class WorldRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = 0;
    this.height = 0;
    this.dpr = 1;
    this.camX = 0;
    this.camY = 0;
    this.time = 0;
    this.weatherDrops = Array.from({ length: 42 }, () => ({
      x: Math.random(),
      y: Math.random(),
      spd: 0.4 + Math.random() * 0.6,
      size: 2 + Math.random() * 3
    }));
    this.resize();
  }

  resize() {
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = Math.floor(this.width * this.dpr);
    this.canvas.height = Math.floor(this.height * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }

  screenToWorld(sx, sy) {
    return {
      x: (sx + this.camX) / TILE_SIZE,
      y: (sy + this.camY) / TILE_SIZE
    };
  }

  render(sim, dt, joystick = null) {
    this.time += dt;
    const ctx = this.ctx;
    const state = sim.state;
    const region = sim.region;
    const player = state.player;

    // Smooth camera follow
    const targetCamX = player.x * TILE_SIZE - this.width / 2;
    const targetCamY = player.y * TILE_SIZE - this.height / 2 + 18;
    const maxCamX = Math.max(0, MAP_W * TILE_SIZE - this.width);
    const maxCamY = Math.max(0, MAP_H * TILE_SIZE - this.height);
    const clampedX = Math.max(0, Math.min(maxCamX, targetCamX));
    const clampedY = Math.max(0, Math.min(maxCamY, targetCamY));

    if (this.camX === 0 && this.camY === 0) {
      this.camX = clampedX;
      this.camY = clampedY;
    } else {
      const k = Math.min(1, dt * 8);
      this.camX += (clampedX - this.camX) * k;
      this.camY += (clampedY - this.camY) * k;
    }

    // Background fill
    ctx.fillStyle = state.currentRegion === 'isole' ? '#3a5578' : '#182620';
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.save();
    ctx.translate(-Math.round(this.camX), -Math.round(this.camY));

    // Visible tile bounds
    const startX = Math.max(0, Math.floor(this.camX / TILE_SIZE) - 1);
    const endX = Math.min(MAP_W - 1, Math.ceil((this.camX + this.width) / TILE_SIZE) + 1);
    const startY = Math.max(0, Math.floor(this.camY / TILE_SIZE) - 1);
    const endY = Math.min(MAP_H - 1, Math.ceil((this.camY + this.height) / TILE_SIZE) + 1);

    // 1. Render terrain tiles
    for (let y = startY; y <= endY; y++) {
      for (let x = startX; x <= endX; x++) {
        this.drawTile(ctx, x, y, region.tiles[y][x], state.currentRegion);
      }
    }

    // 2. Target tile indicator (in front of Mimo or walkTarget)
    const len = Math.hypot(player.facingX, player.facingY) || 1;
    const fx = Math.floor(player.x + (player.facingX / len) * 0.95);
    const fy = Math.floor(player.y + (player.facingY / len) * 0.95);
    if (fx >= 0 && fy >= 0 && fx < MAP_W && fy < MAP_H) {
      ctx.strokeStyle = state.buildItemId ? 'rgba(130, 245, 160, 0.85)' : 'rgba(255, 255, 255, 0.28)';
      ctx.lineWidth = state.buildItemId ? 2.5 : 1.5;
      ctx.strokeRect(fx * TILE_SIZE + 3, fy * TILE_SIZE + 3, TILE_SIZE - 6, TILE_SIZE - 6);
    }
    if (sim.walkTarget) {
      ctx.beginPath();
      ctx.arc(sim.walkTarget.x * TILE_SIZE, sim.walkTarget.y * TILE_SIZE, 8 + Math.sin(this.time * 6) * 2, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 232, 130, 0.75)';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // 3. Collect all Y-sorted renderables (objects, Prof, Biomini, Mimo)
    const drawables = [];
    for (const obj of Object.values(region.objects)) {
      if (obj.x < startX - 1 || obj.x > endX + 1 || obj.y < startY - 1 || obj.y > endY + 1) continue;
      drawables.push({ sortY: obj.y + 0.5, kind: 'obj', data: obj });
    }
    drawables.push({ sortY: sim.profPos.y, kind: 'prof', data: sim.profPos });
    for (const res of region.residents) {
      drawables.push({ sortY: res.y, kind: 'resident', data: res });
    }
    drawables.push({ sortY: player.y, kind: 'player', data: player });

    drawables.sort((a, b) => a.sortY - b.sortY);

    for (const d of drawables) {
      if (d.kind === 'obj') this.drawObject(ctx, d.data, state.currentRegion);
      else if (d.kind === 'prof') this.drawProfessor(ctx, d.data, !!sim.getCurrentQuest());
      else if (d.kind === 'resident') this.drawBiomino(ctx, d.data);
      else if (d.kind === 'player') this.drawMimo(ctx, d.data);
    }

    // 4. Habitat Discovery Rings
    for (const hr of sim.habitatRings) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, hr.life));
      ctx.beginPath();
      ctx.arc(hr.x * TILE_SIZE, hr.y * TILE_SIZE, hr.r * TILE_SIZE, 0, Math.PI * 2);
      ctx.strokeStyle = hr.color;
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.restore();
    }

    // 5. Particles & Floating Texts
    for (const pt of sim.particles) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, pt.life / pt.maxLife);
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(pt.x * TILE_SIZE, pt.y * TILE_SIZE, pt.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.font = 'bold 13px -apple-system, sans-serif';
    ctx.textAlign = 'center';
    for (const ft of sim.floatingTexts) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, ft.life / ft.maxLife);
      ctx.fillStyle = 'rgba(12, 20, 16, 0.72)';
      ctx.fillText(ft.text, ft.x * TILE_SIZE + 1, ft.y * TILE_SIZE + 1);
      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, ft.x * TILE_SIZE, ft.y * TILE_SIZE);
      ctx.restore();
    }

    // 6. Night / Evening warm glow pools around light sources
    const period = getTimePeriod(state.timeOfDay);
    if (period.id === 'notte' || period.id === 'sera') {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (const obj of Object.values(region.objects)) {
        const emits =
          obj.lit ||
          obj.powered ||
          obj.type === 'mushroom_lamp' ||
          obj.type === 'crystal_pillar' ||
          obj.type === 'lore_capsule' ||
          obj.type === 'prof_greenhouse' ||
          (obj.type === 'sanctuary' && obj.repaired);
        if (!emits) continue;
        const gx = (obj.x + 0.5) * TILE_SIZE;
        const gy = (obj.y + 0.5) * TILE_SIZE;
        const rad = obj.type === 'sanctuary' || obj.type === 'prof_greenhouse' ? 140 : 88;
        const grad = ctx.createRadialGradient(gx, gy, 6, gx, gy, rad);
        const col = obj.type === 'mushroom_lamp' ? '120, 245, 190' : obj.type === 'crystal_pillar' ? '190, 170, 255' : '255, 205, 115';
        grad.addColorStop(0, `rgba(${col}, 0.34)`);
        grad.addColorStop(1, `rgba(${col}, 0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(gx, gy, rad, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    ctx.restore();

    // 7. Screen-space Day/Night ambient tint
    if (period.tint !== 'rgba(0, 0, 0, 0)') {
      ctx.fillStyle = period.tint;
      ctx.fillRect(0, 0, this.width, this.height);
    }

    // 8. Weather overlay
    this.drawWeather(ctx, state.weather, period.id, dt);

    // 9. Virtual Joystick visual feedback when dragging
    if (joystick && joystick.active) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(joystick.originX, joystick.originY, 44, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(20, 34, 27, 0.35)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(186, 232, 198, 0.45)';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(joystick.curX, joystick.curY, 19, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(126, 227, 155, 0.72)';
      ctx.fill();
      ctx.restore();
    }
  }

  drawTile(ctx, x, y, tileId, regionId) {
    const t = TILES[tileId] || TILES.withered;
    const px = x * TILE_SIZE;
    const py = y * TILE_SIZE;
    const alt = (x + y) % 2;

    if (tileId === 'water' && regionId === 'isole') {
      // Sky clouds beneath floating islands!
      ctx.fillStyle = alt ? '#6284b0' : '#5878a3';
      ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
      const wave = Math.sin(this.time * 0.9 + x * 0.7 + y * 0.5) * 3;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.24)';
      ctx.beginPath();
      ctx.arc(px + 24 + wave, py + 24, 15, 0, Math.PI * 2);
      ctx.fill();
      return;
    }

    ctx.fillStyle = t.colors[alt];
    ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);

    if (tileId === 'water') {
      const shimmer = Math.sin(this.time * 2.4 + x * 1.1 + y * 0.8) * 3;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
      ctx.fillRect(px + 8 + shimmer, py + 14, 14, 3);
      ctx.fillRect(px + 22 - shimmer, py + 32, 12, 2.5);
    } else if (tileId === 'tall_grass') {
      const sway = Math.sin(this.time * 2.5 + x * 0.9 + y * 0.6) * 2.5;
      ctx.strokeStyle = '#2d6b38';
      ctx.lineWidth = 2.2;
      for (let i = 0; i < 4; i++) {
        const gx = px + 9 + i * 10;
        const gy = py + 34 + (i % 2) * 5;
        ctx.beginPath();
        ctx.moveTo(gx, gy);
        ctx.quadraticCurveTo(gx + sway, gy - 10, gx + sway * 1.4, gy - 16);
        ctx.stroke();
      }
    } else if (tileId === 'flowers') {
      const cols = ['#ffe46b', '#ff9ec4', '#8ce8ff', '#fff6e0'];
      for (let i = 0; i < 4; i++) {
        const fx = px + 10 + (i % 2) * 24 + ((x * 7 + i * 5) % 6);
        const fy = py + 12 + Math.floor(i / 2) * 20;
        ctx.fillStyle = cols[(x + y + i) % cols.length];
        ctx.beginPath();
        ctx.arc(fx, fy, 4.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff9d6';
        ctx.beginPath();
        ctx.arc(fx, fy, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (tileId === 'path') {
      ctx.fillStyle = 'rgba(255, 250, 235, 0.18)';
      ctx.fillRect(px + 6, py + 8, 14, 10);
      ctx.fillRect(px + 24, py + 24, 16, 12);
    } else if (tileId === 'bridge') {
      ctx.strokeStyle = '#634122';
      ctx.lineWidth = 2;
      for (let i = 8; i < TILE_SIZE; i += 12) {
        ctx.beginPath();
        ctx.moveTo(px + 2, py + i);
        ctx.lineTo(px + TILE_SIZE - 2, py + i);
        ctx.stroke();
      }
    } else if (tileId === 'soil') {
      ctx.fillStyle = 'rgba(42, 24, 14, 0.35)';
      ctx.fillRect(px + 5, py + 10, TILE_SIZE - 10, 4);
      ctx.fillRect(px + 5, py + 22, TILE_SIZE - 10, 4);
      ctx.fillRect(px + 5, py + 34, TILE_SIZE - 10, 4);
    } else if (tileId === 'mist') {
      const puff = Math.sin(this.time * 1.8 + x + y) * 3;
      ctx.fillStyle = 'rgba(176, 128, 224, 0.35)';
      ctx.beginPath();
      ctx.arc(px + 18 + puff, py + 22, 14, 0, Math.PI * 2);
      ctx.arc(px + 32 - puff, py + 28, 12, 0, Math.PI * 2);
      ctx.fill();
    } else if (tileId === 'crystal_floor') {
      ctx.strokeStyle = 'rgba(220, 240, 255, 0.25)';
      ctx.lineWidth = 1;
      ctx.strokeRect(px + 4, py + 4, TILE_SIZE - 8, TILE_SIZE - 8);
    }
  }

  drawObject(ctx, obj, regionId) {
    const cx = (obj.x + 0.5) * TILE_SIZE;
    const cy = (obj.y + 0.5) * TILE_SIZE;

    // Ground shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 16, 16, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // Sanctuary (large iconic landmark)
    if (obj.type === 'sanctuary') {
      const rep = !!obj.repaired;
      ctx.fillStyle = rep ? '#f4ead2' : '#7c7870';
      ctx.beginPath();
      ctx.roundRect(cx - 26, cy - 26, 52, 42, 10);
      ctx.fill();
      ctx.strokeStyle = rep ? '#5fa876' : '#4a4742';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Roof dome
      ctx.fillStyle = rep ? '#59c47f' : '#5e5b55';
      ctx.beginPath();
      ctx.arc(cx, cy - 24, 24, Math.PI, 0);
      ctx.fill();

      // Emblem crystal
      ctx.fillStyle = rep ? '#ffe470' : '#9c968c';
      ctx.beginPath();
      ctx.arc(cx, cy - 12, rep ? 8 + Math.sin(this.time * 4) * 1.2 : 6, 0, Math.PI * 2);
      ctx.fill();

      // Floating status badge
      ctx.font = 'bold 11px -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = rep ? '#b8ffc4' : '#ffe18c';
      ctx.fillText(rep ? '✨ Santuario' : '🔨 Ripara!', cx, cy - 52);
      return;
    }

    // Lore Capsule (Glowing Custodian Diary)
    if (obj.type === 'lore_capsule') {
      const bob = Math.sin(this.time * 3 + obj.x) * 3;
      ctx.fillStyle = obj.read ? '#849eb0' : '#ffd866';
      ctx.beginPath();
      ctx.roundRect(cx - 10, cy - 14 + bob, 20, 24, 7);
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('📜', cx, cy + 3 + bob);
      return;
    }

    // Terrarium where Mimo woke up
    if (obj.type === 'terrarium') {
      ctx.fillStyle = 'rgba(180, 240, 255, 0.32)';
      ctx.strokeStyle = '#c8f0ff';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(cx, cy - 6, 18, Math.PI, 0);
      ctx.lineTo(cx + 18, cy + 12);
      ctx.lineTo(cx - 18, cy + 12);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      return;
    }

    // Crop (3 growth stages)
    if (obj.type === 'crop') {
      const crop = CROPS[obj.cropId] || CROPS.turnip;
      if (obj.watered) {
        ctx.fillStyle = 'rgba(40, 25, 16, 0.45)';
        ctx.fillRect(obj.x * TILE_SIZE + 4, obj.y * TILE_SIZE + 4, TILE_SIZE - 8, TILE_SIZE - 8);
      }
      if (obj.stage === 0) {
        ctx.fillStyle = '#82de78';
        ctx.beginPath();
        ctx.arc(cx - 4, cy + 4, 4, 0, Math.PI * 2);
        ctx.arc(cx + 4, cy + 2, 4, 0, Math.PI * 2);
        ctx.fill();
      } else if (obj.stage === 1) {
        ctx.fillStyle = '#5ac460';
        ctx.beginPath();
        ctx.ellipse(cx, cy, 11, 8, 0, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Ready to harvest!
        ctx.fillStyle = '#43a84f';
        ctx.beginPath();
        ctx.ellipse(cx, cy + 2, 14, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = crop.color;
        ctx.beginPath();
        ctx.arc(cx - 5, cy - 2, 6, 0, Math.PI * 2);
        ctx.arc(cx + 6, cy + 1, 5.5, 0, Math.PI * 2);
        ctx.fill();
        // Ready sparkle
        ctx.fillStyle = '#fff59d';
        ctx.beginPath();
        ctx.arc(cx, cy - 14 + Math.sin(this.time * 5) * 2, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
      return;
    }

    // Natural obstacles
    if (obj.type === 'dead_tree') {
      ctx.fillStyle = '#6b533e';
      ctx.fillRect(cx - 6, cy - 18, 12, 32);
      ctx.strokeStyle = '#594230';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(cx, cy - 10);
      ctx.lineTo(cx - 14, cy - 22);
      ctx.moveTo(cx, cy - 14);
      ctx.lineTo(cx + 13, cy - 25);
      ctx.stroke();
      return;
    }
    if (obj.type === 'boulder') {
      ctx.fillStyle = '#7e7b82';
      ctx.beginPath();
      ctx.moveTo(cx - 17, cy + 10);
      ctx.lineTo(cx - 13, cy - 10);
      ctx.lineTo(cx + 2, cy - 16);
      ctx.lineTo(cx + 17, cy - 4);
      ctx.lineTo(cx + 15, cy + 12);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#9b97a0';
      ctx.beginPath();
      ctx.moveTo(cx - 10, cy - 7);
      ctx.lineTo(cx + 2, cy - 13);
      ctx.lineTo(cx + 8, cy - 2);
      ctx.closePath();
      ctx.fill();
      return;
    }
    if (obj.type === 'bramble') {
      ctx.fillStyle = '#4e3f47';
      ctx.beginPath();
      ctx.arc(cx - 7, cy + 2, 11, 0, Math.PI * 2);
      ctx.arc(cx + 7, cy + 2, 11, 0, Math.PI * 2);
      ctx.arc(cx, cy - 6, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#8c5d6f';
      ctx.beginPath();
      ctx.arc(cx - 4, cy - 4, 3, 0, Math.PI * 2);
      ctx.arc(cx + 6, cy + 1, 3, 0, Math.PI * 2);
      ctx.fill();
      return;
    }

    // Special detailed structures
    if (obj.type === 'prof_greenhouse') {
      ctx.fillStyle = 'rgba(182, 245, 224, 0.55)';
      ctx.strokeStyle = '#ffe58f';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(cx - 24, cy - 28, 48, 42, 12);
      ctx.fill();
      ctx.stroke();
      ctx.font = '24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🌿🏛️', cx, cy + 2);
      return;
    }
    if (obj.type === 'wood_house') {
      ctx.fillStyle = '#c9935d';
      ctx.fillRect(cx - 18, cy - 10, 36, 24);
      ctx.fillStyle = '#b85349';
      ctx.beginPath();
      ctx.moveTo(cx - 22, cy - 10);
      ctx.lineTo(cx, cy - 28);
      ctx.lineTo(cx + 22, cy - 10);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#ffe694';
      ctx.fillRect(cx - 5, cy - 2, 10, 10);
      return;
    }
    if (obj.type === 'campfire') {
      ctx.fillStyle = '#6e472b';
      ctx.fillRect(cx - 12, cy + 4, 24, 7);
      if (obj.lit !== false) {
        const flick = Math.sin(this.time * 12 + obj.x) * 2.5;
        ctx.fillStyle = '#ff7b3b';
        ctx.beginPath();
        ctx.moveTo(cx - 10, cy + 6);
        ctx.quadraticCurveTo(cx, cy - 18 + flick, cx + 10, cy + 6);
        ctx.fill();
        ctx.fillStyle = '#ffe26a';
        ctx.beginPath();
        ctx.moveTo(cx - 5, cy + 5);
        ctx.quadraticCurveTo(cx, cy - 9 - flick, cx + 5, cy + 5);
        ctx.fill();
      }
      return;
    }
    if (obj.type === 'windmill') {
      ctx.fillStyle = '#d9cbb4';
      ctx.fillRect(cx - 5, cy - 14, 10, 28);
      ctx.save();
      ctx.translate(cx, cy - 14);
      ctx.rotate(this.time * 1.6);
      ctx.fillStyle = '#fff5e0';
      for (let i = 0; i < 4; i++) {
        ctx.rotate(Math.PI / 2);
        ctx.fillRect(-2.5, 0, 5, 16);
      }
      ctx.restore();
      return;
    }

    // Crisp icon-badge representation for all other furniture & pickups
    const nodeEmojiMap = {
      node_wood: '🪵', node_stone: '🪨', node_clay: '🧱', node_berry: '🫐', node_herb: '🌿',
      node_sand: '⏳', node_shell: '🐚', node_iron: '⛏️', node_spark: '🔋',
      node_mushroom: '🍄', node_pollen: '🌼', node_crystal: '💎'
    };
    const item = ITEMS[obj.type];
    const icon = item ? item.icon : (nodeEmojiMap[obj.type] || '✨');
    const isPickup = !!nodeEmojiMap[obj.type];
    const bob = isPickup ? Math.sin(this.time * 2.8 + obj.x + obj.y) * 2 : 0;

    if (!isPickup) {
      ctx.fillStyle = obj.powered ? 'rgba(255, 232, 110, 0.28)' : 'rgba(255, 255, 255, 0.14)';
      ctx.beginPath();
      ctx.roundRect(cx - 17, cy - 17, 34, 32, 10);
      ctx.fill();
    }
    ctx.font = isPickup ? '22px sans-serif' : '26px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(icon, cx, cy - 2 + bob);
    ctx.textBaseline = 'alphabetic';
  }

  drawMimo(ctx, player) {
    const cx = player.x * TILE_SIZE;
    const cy = player.y * TILE_SIZE;
    const moving = Math.hypot(player.facingX, player.facingY) > 0.01;
    const bounce = Math.abs(Math.sin(this.time * 8)) * (moving ? 2.5 : 1);

    // Ground shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 12, 14, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Morph aura color if casting a Mimic Power!
    const powerMeta = player.morphPower ? POWERS.find((p) => p.id === player.morphPower) : null;
    if (powerMeta) {
      ctx.save();
      ctx.globalAlpha = 0.45;
      ctx.fillStyle = powerMeta.color;
      ctx.beginPath();
      ctx.arc(cx, cy - 6, 22 + Math.sin(this.time * 16) * 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Mimo soft lavender body (original charming shapeshifter)
    ctx.fillStyle = powerMeta ? powerMeta.color : '#cea8f7';
    ctx.strokeStyle = '#573882';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(cx - 13, cy + 8 - bounce);
    ctx.bezierCurveTo(cx - 16, cy - 12 - bounce, cx - 10, cy - 22 - bounce, cx, cy - 22 - bounce);
    ctx.bezierCurveTo(cx + 10, cy - 22 - bounce, cx + 16, cy - 12 - bounce, cx + 13, cy + 8 - bounce);
    ctx.quadraticCurveTo(cx, cy + 14 - bounce, cx - 13, cy + 8 - bounce);
    ctx.fill();
    ctx.stroke();

    // Little leaf sprout on head
    ctx.fillStyle = '#7be380';
    ctx.beginPath();
    ctx.ellipse(cx - 4, cy - 26 - bounce, 5, 3, -0.5, 0, Math.PI * 2);
    ctx.ellipse(cx + 4, cy - 26 - bounce, 5, 3, 0.5, 0, Math.PI * 2);
    ctx.fill();

    // Iconic simple dot eyes & gentle smile
    const eyeOffX = Math.max(-2.5, Math.min(2.5, player.facingX * 2.5));
    ctx.fillStyle = '#231636';
    ctx.beginPath();
    ctx.arc(cx - 5 + eyeOffX, cy - 8 - bounce, 2.3, 0, Math.PI * 2);
    ctx.arc(cx + 5 + eyeOffX, cy - 8 - bounce, 2.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#231636';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(cx + eyeOffX, cy - 5 - bounce, 3.6, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();

    // Rosy cheeks
    ctx.fillStyle = 'rgba(255, 145, 190, 0.65)';
    ctx.beginPath();
    ctx.ellipse(cx - 9 + eyeOffX, cy - 5 - bounce, 3, 1.8, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + 9 + eyeOffX, cy - 5 - bounce, 3, 1.8, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  drawProfessor(ctx, pos, hasQuest) {
    const cx = pos.x * TILE_SIZE;
    const cy = pos.y * TILE_SIZE;
    const bob = Math.sin(this.time * 2.4) * 2;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 14, 17, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // Prof. Intreccio — ancient vine-spirit mentor in botanist coat
    ctx.fillStyle = '#3b754f';
    ctx.strokeStyle = '#1f422b';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.arc(cx, cy - 8 + bob, 17, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Tangled vine curls
    ctx.fillStyle = '#5da872';
    ctx.beginPath();
    ctx.arc(cx - 12, cy - 14 + bob, 7, 0, Math.PI * 2);
    ctx.arc(cx + 12, cy - 14 + bob, 7, 0, Math.PI * 2);
    ctx.arc(cx, cy - 22 + bob, 8, 0, Math.PI * 2);
    ctx.fill();

    // Warm botanist scarf
    ctx.fillStyle = '#d9a452';
    ctx.fillRect(cx - 12, cy + 2 + bob, 24, 6);

    // Spectacles
    ctx.strokeStyle = '#fff3c4';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx - 5, cy - 8 + bob, 4.5, 0, Math.PI * 2);
    ctx.arc(cx + 5, cy - 8 + bob, 4.5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#1d241f';
    ctx.beginPath();
    ctx.arc(cx - 5, cy - 8 + bob, 1.8, 0, Math.PI * 2);
    ctx.arc(cx + 5, cy - 8 + bob, 1.8, 0, Math.PI * 2);
    ctx.fill();

    // Quest indicator & label
    if (hasQuest) {
      ctx.fillStyle = '#ffe066';
      ctx.beginPath();
      ctx.arc(cx, cy - 38 + bob, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#241a04';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('!', cx, cy - 34 + bob);
    }
    ctx.font = 'bold 10.5px -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fff5d1';
    ctx.fillText('Prof. Intreccio', cx, cy + 25);
  }

  drawBiomino(ctx, res) {
    const bio = BIOMINI_BY_ID[res.id];
    if (!bio) return;
    const cx = res.x * TILE_SIZE;
    const cy = res.y * TILE_SIZE;
    const bob = Math.abs(Math.sin(this.time * 4 + res.x)) * 3;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.24)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 11, 13, 5.5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = bio.bodyColor;
    ctx.strokeStyle = 'rgba(20, 26, 22, 0.65)';
    ctx.lineWidth = 2;

    if (bio.shape === 'drop') {
      ctx.beginPath();
      ctx.moveTo(cx, cy - 22 - bob);
      ctx.quadraticCurveTo(cx + 16, cy - 2 - bob, cx, cy + 8 - bob);
      ctx.quadraticCurveTo(cx - 16, cy - 2 - bob, cx, cy - 22 - bob);
      ctx.fill();
      ctx.stroke();
    } else if (bio.shape === 'golem') {
      ctx.beginPath();
      ctx.roundRect(cx - 14, cy - 18 - bob, 28, 25, 7);
      ctx.fill();
      ctx.stroke();
    } else if (bio.shape === 'mushroom') {
      ctx.fillStyle = '#f2e8d5';
      ctx.fillRect(cx - 7, cy - 4 - bob, 14, 13);
      ctx.fillStyle = bio.bodyColor;
      ctx.beginPath();
      ctx.arc(cx, cy - 5 - bob, 15, Math.PI, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(cx, cy - 5 - bob, 13.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    // Accent detail by shape
    ctx.fillStyle = bio.accentColor;
    if (bio.shape === 'round_leaf' || bio.shape === 'horned') {
      ctx.beginPath();
      ctx.ellipse(cx - 5, cy - 19 - bob, 5, 3, -0.5, 0, Math.PI * 2);
      ctx.ellipse(cx + 5, cy - 19 - bob, 5, 3, 0.5, 0, Math.PI * 2);
      ctx.fill();
    } else if (bio.shape === 'winged') {
      const flap = Math.sin(this.time * 12) * 4;
      ctx.beginPath();
      ctx.ellipse(cx - 15, cy - 8 - bob + flap, 6, 3.5, -0.4, 0, Math.PI * 2);
      ctx.ellipse(cx + 15, cy - 8 - bob + flap, 6, 3.5, 0.4, 0, Math.PI * 2);
      ctx.fill();
    } else if (bio.shape === 'flame') {
      ctx.beginPath();
      ctx.moveTo(cx - 6, cy - 15 - bob);
      ctx.lineTo(cx, cy - 26 - bob);
      ctx.lineTo(cx + 6, cy - 15 - bob);
      ctx.fill();
    } else if (bio.shape === 'round_ear') {
      ctx.beginPath();
      ctx.arc(cx - 9, cy - 16 - bob, 4.5, 0, Math.PI * 2);
      ctx.arc(cx + 9, cy - 16 - bob, 4.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Cute eyes
    ctx.fillStyle = '#1b1d24';
    ctx.beginPath();
    ctx.arc(cx - 4.5, cy - 6 - bob, 2, 0, Math.PI * 2);
    ctx.arc(cx + 4.5, cy - 6 - bob, 2, 0, Math.PI * 2);
    ctx.fill();

    // Gift ready bubble or Name
    if (res.hasGift) {
      ctx.fillStyle = '#ffe57f';
      ctx.beginPath();
      ctx.arc(cx + 12, cy - 22 - bob, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🎁', cx + 12, cy - 18 - bob);
    }

    ctx.font = 'bold 10px -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#f2f7ec';
    ctx.fillText(bio.name, cx, cy + 22);
  }

  drawWeather(ctx, weather, periodId, dt) {
    if (weather === 'rain') {
      ctx.strokeStyle = 'rgba(170, 220, 255, 0.42)';
      ctx.lineWidth = 1.5;
      for (const d of this.weatherDrops) {
        d.y += d.spd * dt * 1.4;
        d.x -= dt * 0.12;
        if (d.y > 1) { d.y = 0; d.x = Math.random(); }
        if (d.x < 0) d.x = 1;
        const sx = d.x * this.width;
        const sy = d.y * this.height;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx - 4, sy + 14);
        ctx.stroke();
      }
    } else if (weather === 'breeze') {
      ctx.fillStyle = 'rgba(255, 240, 200, 0.55)';
      for (const d of this.weatherDrops) {
        d.x += d.spd * dt * 0.22;
        d.y += Math.sin(this.time * 2 + d.size) * dt * 0.04;
        if (d.x > 1) { d.x = 0; d.y = Math.random(); }
        ctx.beginPath();
        ctx.ellipse(d.x * this.width, d.y * this.height, d.size + 1, d.size * 0.6, this.time + d.size, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (weather === 'aurora' || periodId === 'notte') {
      for (const d of this.weatherDrops) {
        d.y -= d.spd * dt * 0.04;
        if (d.y < 0) { d.y = 1; d.x = Math.random(); }
        const alpha = 0.25 + 0.45 * Math.abs(Math.sin(this.time * 2.2 + d.x * 10));
        ctx.fillStyle = `rgba(175, 255, 205, ${alpha})`;
        ctx.beginPath();
        ctx.arc(d.x * this.width, d.y * this.height, d.size * 0.75, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}
