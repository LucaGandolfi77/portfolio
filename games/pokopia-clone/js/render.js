/* DITTOPIA — pixel-art renderer with DPR handling and culling */

import { TILE, ITEMS, SPECIES } from './config.js';
import { drawSprite, drawPlayer, drawTile } from './sprites.js';
import { world } from './world.js';
import { drawEffects } from './effects.js';

const TILE_PX = 24;

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false });
    this.dpr = 1;
    this.viewW = 0;
    this.viewH = 0;
    this.cam = { x: 0, y: 0 };
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.round(window.innerWidth * this.dpr);
    this.canvas.height = Math.round(window.innerHeight * this.dpr);
    this.canvas.style.width = window.innerWidth + 'px';
    this.canvas.style.height = window.innerHeight + 'px';
    this.viewW = Math.ceil(window.innerWidth / TILE_PX) + 2;
    this.viewH = Math.ceil(window.innerHeight / TILE_PX) + 2;
  }

  follow(player) {
    this.cam.x = player.x - this.viewW / 2 + 0.5;
    this.cam.y = player.y - this.viewH / 2 + 0.5;
    const size = world.size();
    this.cam.x = Math.max(0, Math.min(size.w - this.viewW, this.cam.x));
    this.cam.y = Math.max(0, Math.min(size.h - this.viewH, this.cam.y));
  }

  screenPos(x, y) {
    return {
      x: Math.round((x - this.cam.x) * TILE_PX),
      y: Math.round((y - this.cam.y) * TILE_PX)
    };
  }

  lightAt(x, y, hour, gb) {
    let light = 1;
    if (hour < 6) light = 0.45 + 0.1 * Math.max(0, 1 - Math.abs(hour - 3) / 3);
    else if (hour >= 20) light = 0.45;
    else if (hour < 8 || hour >= 18) light = 0.75;
    const obj = world.objAt(x, y);
    if (obj) {
      const def = ITEMS[obj.type];
      if (def && def.light) light = Math.max(light, def.light === 'dim' ? 0.7 : 0.95);
      if (obj.type === 'falò' && hour >= 20) light = Math.max(light, 0.95);
    }
    return gb ? Math.round(light * 3) / 3 : light;
  }

  draw(scene) {
    const { state, pokemon, effects, isNight } = scene;
    const ctx = this.ctx;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

    const hour = Math.floor(state.time / 60) % 24;
    const x0 = Math.floor(this.cam.x), y0 = Math.floor(this.cam.y);
    for (let dy = 0; dy <= this.viewH; dy++) {
      for (let dx = 0; dx <= this.viewW; dx++) {
        const tx = x0 + dx, ty = y0 + dy;
        const pos = this.screenPos(tx, ty);
        drawTile(ctx, world.getTile(tx, ty), tx, ty, pos.x, pos.y, TILE_PX, state.frame, this.lightAt(tx, ty, hour, state.settings.gb));
      }
    }

    const objects = world.allObjects();
    for (const key in objects) {
      const obj = objects[key];
      if (obj.x < x0 - 1 || obj.x > x0 + this.viewW + 1 || obj.y < y0 - 1 || obj.y > y0 + this.viewH + 1) continue;
      const pos = this.screenPos(obj.x, obj.y);
      this.drawObject(obj, pos.x, pos.y, state.settings.gb, isNight);
    }

    for (const sprout of world.getSpecials().sprouts || []) {
      const pos = this.screenPos(sprout.x, sprout.y);
      if (pos.x < -16 || pos.x > window.innerWidth || pos.y < -16 || pos.y > window.innerHeight) continue;
      ctx.fillStyle = sprout.watered ? '#60c850' : '#b4a05a';
      ctx.fillRect(pos.x + 10, pos.y + 14, 5, 6);
    }

    for (const mon of pokemon.all()) {
      const pos = this.screenPos(mon.x, mon.y);
      if (pos.x < -16 || pos.x > window.innerWidth || pos.y < -16 || pos.y > window.innerHeight) continue;
      const key = SPECIES[mon.species] ? mon.species : 'pidgey';
      drawSprite(ctx, key, pos.x, pos.y, TILE_PX / 16, { shiny: mon.shiny, gb: state.settings.gb });
      if (mon.bubble) this.drawBubble(ctx, pos.x, pos.y, mon.bubble);
    }

    const hero = this.screenPos(state.player.x, state.player.y);
    drawPlayer(ctx, hero.x, hero.y, TILE_PX / 16, {
      skin: state.player.skin, hair: state.player.hair, shirt: state.player.shirt,
      moving: !!state.player.moving, gb: state.settings.gb
    });

    if (state.player.placeSel && scene.modal !== true) this.drawPlacement(ctx, state.player, state.settings.gb);

    if (isNight) {
      ctx.fillStyle = 'rgba(20,20,70,.34)';
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
      ctx.fillStyle = 'rgba(255,255,255,.5)';
      for (let i = 0; i < 40; i++) {
        const sx = (i * 97 + state.frame * 0.05) % window.innerWidth;
        const sy = (i * 53) % Math.min(window.innerHeight, window.innerWidth * 0.5);
        ctx.fillRect(sx, sy, 1, 1);
      }
    }

    drawEffects(ctx, effects);
  }

  drawObject(obj, sx, sy, gb, isNight) {
    const ctx = this.ctx;
    const opts = { gb };
    if (obj.type === 'albero') { drawSprite(ctx, 'tree', sx, sy - 8, TILE_PX / 16, opts); return; }
    if (obj.type === 'roccia') { drawSprite(ctx, 'rock', sx, sy, TILE_PX / 16, opts); return; }
    if (obj.type === 'falò') { drawSprite(ctx, isNight ? 'falò_on' : 'falò_off', sx, sy, TILE_PX / 16, opts); return; }
    if (obj.type === 'cespuglio' || obj.type === 'spruzzabacche') {
      drawSprite(ctx, 'cespuglio', sx, sy, TILE_PX / 16, opts);
      if (obj.type === 'spruzzabacche') drawSprite(ctx, 'bacche', sx, sy, TILE_PX / 16, opts);
      return;
    }
    if (obj.type === 'cristallo_nat') {
      ctx.fillStyle = '#b9f3ff';
      ctx.fillRect(sx + 8, sy + 4, 8, 14);
      ctx.fillStyle = 'rgba(255,255,255,.75)';
      ctx.fillRect(sx + 9, sy + 5, 3, 8);
      return;
    }
    if (obj.type === 'sign') {
      ctx.fillStyle = '#9a6a3a'; ctx.fillRect(sx + 6, sy + 4, 12, 12);
      ctx.fillStyle = '#6b4a2a'; ctx.fillRect(sx + 8, sy + 14, 2, 10);
      return;
    }
    if (obj.type === 'generatore') {
      drawSprite(ctx, 'generatore', sx, sy, TILE_PX / 16, opts);
      if (obj.state && obj.state.broken) { ctx.fillStyle = '#f44'; ctx.fillRect(sx + 10, sy + 2, 4, 4); }
      return;
    }
    if (ITEMS[obj.type] && ITEMS[obj.type].kind === 'place') {
      drawSprite(ctx, obj.type, sx, sy, TILE_PX / 16, opts);
    }
  }

  drawBubble(ctx, x, y, text) {
    ctx.font = '10px system-ui, sans-serif';
    const width = Math.min(140, ctx.measureText(text).width + 12);
    ctx.fillStyle = 'rgba(255,255,255,.94)';
    ctx.fillRect(x - width / 2 + 12, y - 34, width, 18);
    ctx.fillStyle = '#1b1440';
    ctx.textAlign = 'center';
    ctx.fillText(text.slice(0, 26), x + 12, y - 21);
    ctx.textAlign = 'start';
  }

  drawPlacement(ctx, player, gb) {
    let tx = Math.round(player.x), ty = Math.round(player.y);
    if (player.dir === 'U') ty--; else if (player.dir === 'D') ty++; else if (player.dir === 'L') tx--; else tx++;
    const pos = this.screenPos(tx, ty);
    ctx.globalAlpha = 0.55;
    drawSprite(ctx, player.placeSel, pos.x, pos.y, TILE_PX / 16, { gb });
    ctx.globalAlpha = 1;
    ctx.strokeStyle = world.walkable(tx, ty) && !world.objAt(tx, ty) ? 'rgba(120,255,120,.85)' : 'rgba(255,90,90,.85)';
    ctx.lineWidth = 2;
    ctx.strokeRect(pos.x, pos.y, TILE_PX, TILE_PX);
  }

  drawMinimap(canvas, player) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const size = canvas.width;
    const scale = size / world.W;
    ctx.fillStyle = 'rgba(12,10,32,.86)';
    ctx.fillRect(0, 0, size, size);
    for (let y = 0; y < world.H; y += 2) {
      for (let x = 0; x < world.W; x += 2) {
        const tile = world.getTile(x, y);
        if (tile === 4) ctx.fillStyle = '#4f8fe0';
        else if (tile === 8 || tile === 10) ctx.fillStyle = '#6d6f80';
        else if (tile === 9) ctx.fillStyle = '#4b3f6d';
        else if (tile === 12) ctx.fillStyle = '#b8e4ff';
        else ctx.fillStyle = '#5d9a5a';
        ctx.fillRect(x * scale, y * scale, 2.2, 2.2);
      }
    }
    ctx.fillStyle = '#ffd166';
    ctx.fillRect(player.x * scale - 2, player.y * scale - 2, 4, 4);
    ctx.strokeStyle = 'rgba(255,255,255,.4)';
    ctx.strokeRect(0.5, 0.5, size - 1, size - 1);
  }
}
