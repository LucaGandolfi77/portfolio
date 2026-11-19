/* Sky Ace — deterministic, fixed-step game engine */

import { LEVELS, DIFFICULTY, PLAYER, PICKUPS } from './config.js';
import { makePlayer, makeEnemy, makeBoss, makeProjectile, makeBomb, makePickup } from './entities.js';

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export class Engine {
  constructor(hooks = {}) {
    this.hooks = hooks;
    this.input = null;
    this.W = window.innerWidth;
    this.H = window.innerHeight;
    this.status = 'menu';
    this.player = null;
    this.enemies = [];
    this.projectiles = [];
    this.bombs = [];
    this.particles = [];
    this.pickups = [];
    this.boss = null;
    this.cameraX = 0;
    this.worldWidth = 5000;
    this.levelIndex = 0;
    this.difficulty = 'medium';
    this.time = 0;
    this.score = 0;
    this.combo = 0;
    this.comboTimer = 0;
    this.kills = 0;
    this.shots = 0;
    this.hits = 0;
    this.clearBonus = 0;
  }

  setInput(input) { this.input = input; }
  setViewport(w, h) { this.W = w; this.H = h; }
  emit(type, data) { this.hooks.onEvent?.(type, data || {}); }
  emitStatus(status, data) { this.status = status; this.hooks.onStatus?.(status, data || {}); }

  get level() { return LEVELS[this.levelIndex]; }
  get diff() { return DIFFICULTY[this.difficulty] || DIFFICULTY.medium; }
  get multiplier() { return Math.min(4, 1 + Math.floor(this.combo / 5) * 0.25); }

  resize(w, h) {
    this.W = w; this.H = h;
    if (this.player) {
      this.player.y = clamp(this.player.y, 24, h - 64);
    }
  }

  start(levelIndex, difficulty, carryScore = 0) {
    this.difficulty = difficulty in DIFFICULTY ? difficulty : 'medium';
    this.levelIndex = clamp(levelIndex, 0, LEVELS.length - 1);
    this.score = carryScore;
    this.combo = 0;
    this.comboTimer = 0;
    this.kills = 0;
    this.shots = 0;
    this.hits = 0;
    this.clearBonus = 0;
    this.player = null;
    this.initLevel();
  }

  nextLevel() {
    if (this.levelIndex >= LEVELS.length - 1) return false;
    this.levelIndex += 1;
    this.initLevel();
    return true;
  }

  initLevel() {
    const cfg = this.level;
    const diff = this.diff;
    const old = this.player;
    this.worldWidth = 3000 + (this.levelIndex + 1) * cfg.worldExtra;
    this.player = makePlayer(this.H);
    if (old) {
      this.player.health = clamp(old.health + 35, 35, PLAYER.maxHealth);
      this.player.bombs = Math.max(2, old.bombs);
    }
    this.enemies = [];
    this.projectiles = [];
    this.bombs = [];
    this.particles = [];
    this.pickups = [];
    this.cameraX = 0;
    this.time = 0;
    this.combo = 0;
    this.comboTimer = 0;
    this.boss = cfg.boss ? makeBoss({
      ...cfg.boss,
      hp: Math.round(cfg.boss.hp * diff.hp),
      fireRate: Math.max(28, Math.round(cfg.boss.fireRate * diff.fire))
    }, this.worldWidth, this.H) : null;

    const count = cfg.enemyCount;
    for (let i = 0; i < count; i++) {
      const type = Math.random() > 0.62 ? 'air' : 'ground';
      const x = 800 + Math.random() * (this.worldWidth - 1000);
      const isLauncher = type === 'ground' && Math.random() < cfg.missileChance;
      const hp = Math.max(1, Math.round(cfg.enemyHp * diff.hp * (isLauncher ? 1.3 : 1)));
      const enemy = makeEnemy({
        x,
        y: type === 'ground' ? this.H - 66 : 60 + Math.random() * Math.max(80, this.H - 240),
        w: type === 'ground' ? 52 : 42,
        h: type === 'ground' ? 32 : 22,
        type, hp,
        color: isLauncher ? '#ff9f68' : (type === 'ground' ? '#7a8b3f' : cfg.enemyAccent),
        reload: Math.random() * cfg.enemyFire,
        fireRate: Math.max(45, Math.round(cfg.enemyFire * diff.fire)),
        speed: cfg.enemySpeed * diff.enemySpeed,
        launcher: isLauncher,
        launchCooldown: 80 + Math.random() * 180,
        launchRate: Math.max(60, Math.round((120 + Math.random() * 140) * diff.fire)),
        missileSpeed: 7 + Math.random() * 2,
        phase: Math.random() * Math.PI * 2
      });
      this.enemies.push(enemy);
    }
    this.emitStatus('playing', { level: this.levelIndex + 1 });
    this.emit('levelstart', { level: this.levelIndex + 1 });
  }

  // ---- main fixed-step tick -------------------------------------------------
  update() {
    if (this.status !== 'playing') return;
    this.time++;
    this.handleInput();
    this.updatePlayer();
    this.updateCamera();
    this.updateEnemies();
    this.updateBoss();
    this.updateProjectiles();
    this.updateBombs();
    this.updatePickups();
    this.updateParticles();
    if (this.comboTimer > 0 && --this.comboTimer === 0) this.combo = 0;
    this.checkWin();
  }

  handleInput() {
    const p = this.player;
    const input = this.input;
    if (!input) return;
    if (input.isDown('up')) p.targetPitch -= PLAYER.pitchSpeed;
    if (input.isDown('down')) p.targetPitch += PLAYER.pitchSpeed;
    if (input.pointerPitch !== null) p.targetPitch = -input.pointerPitch * PLAYER.maxPitch;
    p.targetPitch = clamp(p.targetPitch, -PLAYER.maxPitch, PLAYER.maxPitch);
    if (input.consume('flip')) this.flip();
    if (input.consume('bomb')) this.dropBomb();
  }

  flip() {
    const p = this.player;
    p.flipped = !p.flipped;
    p.targetPitch = -p.targetPitch;
    p.pitch = -p.pitch;
    this.emit('flip', { x: p.x, y: p.y });
  }

  updatePlayer() {
    const p = this.player;
    p.pitch += (p.targetPitch - p.pitch) * PLAYER.turnSmooth;
    p.angle = p.flipped ? Math.PI - p.pitch : p.pitch;
    p.vx = Math.cos(p.angle) * p.speed;
    p.vy = Math.sin(p.angle) * p.speed;
    p.x += p.vx;
    p.y += p.vy + p.verticalImpulse;
    p.verticalImpulse *= 0.92;
    if (Math.abs(p.verticalImpulse) < 0.01) p.verticalImpulse = 0;

    if (p.y < 22) { p.y = 22; p.verticalImpulse = Math.abs(p.verticalImpulse) * 0.3; }
    const ground = this.H - 62;
    if (p.y > ground) {
      const impact = p.vy + p.verticalImpulse;
      p.y = ground;
      if (impact > 4) {
        p.verticalImpulse = -Math.abs(impact) * 0.6;
        this.damagePlayer(Math.min(20, Math.round(impact * 2 * this.diff.damage)));
      } else if (impact > 0.5) p.verticalImpulse = -Math.abs(impact) * 0.4;
      else p.verticalImpulse = 0;
    }
    p.x = clamp(p.x, 50, this.worldWidth - 50);

    if (p.invuln > 0) p.invuln--;
    if (p.shield > 0) p.shield--;
    if (p.rapid > 0) p.rapid--;
    if (p.bombCooldown > 0) p.bombCooldown--;
    if (p.reload > 0) p.reload--;

    if (this.input?.isDown('fire') && p.reload <= 0) this.fire();
  }

  updateCamera() {
    const anchor = this.player.flipped ? 0.66 : 0.34;
    let target = this.player.x - this.W * anchor;
    target = clamp(target, 0, Math.max(0, this.worldWidth - this.W));
    this.cameraX += (target - this.cameraX) * 0.1;
  }

  fire() {
    const p = this.player;
    const noseX = p.x + Math.cos(p.angle) * 30;
    const noseY = p.y + Math.sin(p.angle) * 30;
    this.projectiles.push(makeProjectile({
      x: noseX, y: noseY,
      vx: Math.cos(p.angle) * PLAYER.muzzleSpeed + p.vx * 0.4,
      vy: Math.sin(p.angle) * PLAYER.muzzleSpeed + p.vy * 0.4,
      owner: 'player', life: 110, color: '#8ff6ff', size: 3.5,
      damage: p.rapid > 0 ? 8 : 12
    }));
    this.shots++;
    p.reload = p.rapid > 0 ? PLAYER.rapidReload : PLAYER.reload;
    this.emit('shot', { x: noseX, y: noseY });
  }

  dropBomb() {
    const p = this.player;
    if (p.bombs <= 0) { this.emit('nobombs', {}); return; }
    if (p.bombCooldown > 0) return;
    p.bombs -= 1;
    p.bombCooldown = PLAYER.bombCooldown;
    const noseX = p.x + Math.cos(p.angle) * 28;
    const noseY = p.y + Math.sin(p.angle) * 28;
    this.bombs.push(makeBomb({
      x: noseX, y: noseY + 8,
      vx: p.vx * 0.9 + Math.cos(p.angle) * 1.5,
      vy: p.vy + 2, g: 0.35
    }));
    this.emit('bomb', { x: noseX, y: noseY });
  }

  updateEnemies() {
    const p = this.player;
    const cfg = this.level;
    for (const e of this.enemies) {
      if (e.type === 'air') {
        e.y += Math.sin(this.time * 0.002 + e.phase) * 0.32 * e.speed;
        const dist = Math.abs(p.x - e.x);
        if (dist < 620) {
          if (e.x > p.x + 200) e.x -= 0.55 * e.speed;
          if (e.x < p.x - 200) e.x += 0.55 * e.speed;
        }
      }
      const dx = p.x - e.x, dy = p.y - e.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 820 && e.reload-- <= 0) {
        const a = Math.atan2(dy, dx);
        this.projectiles.push(makeProjectile({
          x: e.x, y: e.y,
          vx: Math.cos(a) * 6.2 * (cfg.enemySpeed || 1),
          vy: Math.sin(a) * 6.2 * (cfg.enemySpeed || 1),
          owner: 'enemy', life: 200, color: '#ffd166', size: 3,
          damage: Math.round(10 * this.diff.damage)
        }));
        e.reload = e.fireRate;
      }
      if (e.launcher && e.launchCooldown-- <= 0) {
        const a = Math.atan2(p.y - (e.y - 10), p.x - (e.x + e.w / 2));
        this.projectiles.push(makeProjectile({
          x: e.x + e.w / 2, y: e.y - 10,
          vx: Math.cos(a) * e.missileSpeed,
          vy: Math.sin(a) * e.missileSpeed - 0.5,
          owner: 'enemy', life: 420, color: '#ff6b9d', size: 5,
          damage: Math.round(25 * this.diff.damage)
        }));
        for (let s = 0; s < 6; s++) this.addParticle(e.x + e.w / 2, e.y - 8, {
          vx: (Math.random() - 0.5) * 1.5, vy: -Math.random() * 1.5,
          life: 20 + Math.random() * 20, color: 'rgba(255,120,90,.6)', size: 3
        });
        e.launchCooldown = e.launchRate + Math.random() * 80;
      }
    }
  }

  updateBoss() {
    const b = this.boss;
    if (!b) return;
    b.movePhase += 0.011;
    b.x = b.baseX + Math.sin(b.movePhase) * 130;
    b.y = this.H * 0.17 + Math.cos(b.movePhase * 0.7) * 26;
    if (b.flash > 0) b.flash--;
    if (b.reload-- > 0) return;
    const p = this.player;
    const shots = [];
    const aim = a => ({
      vx: Math.cos(a) * 9.2, vy: Math.sin(a) * 9.2,
      color: b.color, size: 6, damage: Math.round(30 * this.diff.damage), life: 420
    });
    switch (b.pattern) {
      case 'volley':
      case 'burst':
        for (let m = 0; m < 3; m++) {
          const sx = b.x - b.w / 4 + m * 20;
          const a = Math.atan2(p.y - b.y, p.x - sx);
          shots.push({ x: sx, y: b.y, ...aim(a) });
        }
        if (b.pattern === 'burst') {
          for (let m = 0; m < 8; m++) {
            const a = (m / 8) * Math.PI * 2 + b.movePhase;
            shots.push({ x: b.x, y: b.y, vx: Math.cos(a) * 7, vy: Math.sin(a) * 7,
              color: b.color, size: 5, damage: Math.round(20 * this.diff.damage), life: 360 });
          }
        }
        break;
      case 'spread':
        for (let m = -2; m <= 2; m++) {
          const a = Math.atan2(p.y - b.y, p.x - b.x) + m * 0.13;
          shots.push({ x: b.x - 20, y: b.y, ...aim(a) });
        }
        break;
      default: // omega
        b.volley = (b.volley + 1) % 2;
        if (b.volley === 0) {
          for (let m = -3; m <= 3; m++) {
            const a = Math.atan2(p.y - b.y, p.x - b.x) + m * 0.11;
            shots.push({ x: b.x - 30, y: b.y, ...aim(a) });
          }
        } else {
          for (let m = 0; m < 14; m++) {
            const a = (m / 14) * Math.PI * 2 + b.movePhase * 2;
            shots.push({ x: b.x, y: b.y, vx: Math.cos(a) * 6.6, vy: Math.sin(a) * 6.6,
              color: b.color, size: 4.5, damage: Math.round(18 * this.diff.damage), life: 380 });
          }
        }
    }
    for (const s of shots) this.projectiles.push(makeProjectile(s));
    for (let i = 0; i < 8; i++) this.addParticle(b.x, b.y, {
      vx: (Math.random() - 0.5) * 2, vy: (Math.random() - 0.5) * 2,
      life: 20 + Math.random() * 20, color: b.color, size: 3
    });
    b.reload = b.fireRate + Math.random() * 45;
    this.emit('bossshot', { x: b.x, y: b.y });
  }

  updateProjectiles() {
    const p = this.player;
    const groundY = this.H - 44;
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const pr = this.projectiles[i];
      pr.prevX = pr.x; pr.prevY = pr.y;
      pr.x += pr.vx; pr.y += pr.vy; pr.life--;
      let hit = false;

      if (pr.y > groundY) {
        this.explode(pr.x, pr.y, '#ff9f68', 6);
        hit = true;
      }
      if (!hit && pr.owner === 'player') {
        for (let j = this.enemies.length - 1; j >= 0; j--) {
          const e = this.enemies[j];
          if (this.hitRect(pr, e.x, e.y, e.w, e.h)) {
            hit = true; this.hits++;
            e.hp -= pr.damage;
            this.explode(pr.x, pr.y, '#ffd166', 5);
            if (e.hp <= 0) this.killEnemy(j);
            break;
          }
        }
        if (!hit && this.boss) {
          const b = this.boss;
          if (this.hitRect(pr, b.x - b.w / 2, b.y - b.h / 2, b.w, b.h)) {
            hit = true; this.hits++;
            b.hp -= pr.damage;
            b.flash = 5;
            this.explode(pr.x, pr.y, '#ff6b9d', 6);
            this.emit('bossHit', { x: pr.x, y: pr.y });
            if (b.hp <= 0) {
              this.explode(b.x, b.y, b.color, 46, { colorful: true, radius: 160, damage: 500 });
              this.addScore(2500, b.x, b.y);
              this.boss = null;
              this.emit('bossdown', { x: b.x, y: b.y });
            }
          }
        }
      } else if (!hit && this.hitRect(pr, p.x - 18, p.y - 11, 36, 22)) {
        hit = true;
        this.damagePlayer(pr.damage || 10);
        this.explode(pr.x, pr.y, '#ff4d6d', 5);
      }
      if (hit || pr.life <= 0 || pr.x < this.cameraX - 200 || pr.x > this.cameraX + this.W + 300) {
        this.projectiles.splice(i, 1);
      }
    }
  }

  hitRect(pr, x, y, w, h) {
    return pr.x > x && pr.x < x + w && pr.y > y && pr.y < y + h;
  }

  killEnemy(index) {
    const e = this.enemies[index];
    const cx = e.x + e.w / 2, cy = e.y + e.h / 2;
    this.explode(cx, cy, e.color, 18, { colorful: true });
    this.enemies.splice(index, 1);
    this.kills++;
    this.combo++;
    this.comboTimer = 190;
    const base = e.launcher ? 200 : (e.type === 'ground' ? 150 : 100);
    this.addScore(base, cx, cy);
    this.emit('kill', { x: cx, y: cy, combo: this.combo });
    if (this.combo > 1 && this.combo % 5 === 0) this.emit('combo', { value: this.combo });
    if (Math.random() < 0.17) {
      const roll = Math.random();
      const type = roll < 0.42 ? 'repair' : roll < 0.68 ? 'shield' : roll < 0.86 ? 'bomb' : 'rapid';
      this.pickups.push(makePickup(cx, cy, type));
    }
  }

  addScore(points, x, y) {
    const gained = Math.round(points * this.multiplier * this.diff.score);
    this.score += gained;
    if (x !== undefined) this.emit('float', { x, y, text: `+${gained}`, color: '#ffd166' });
  }

  damagePlayer(amount) {
    const p = this.player;
    if (p.invuln > 0 || this.status !== 'playing') return;
    if (p.shield > 0) {
      p.shield = Math.max(0, p.shield - amount * 3);
      p.invuln = 12;
      this.emit('shieldblock', { x: p.x, y: p.y });
      return;
    }
    p.health -= amount;
    p.invuln = 28;
    this.combo = 0;
    this.emit('damage', { x: p.x, y: p.y, amount });
    if (p.health <= 0) {
      p.health = 0;
      this.emit('gameover', { score: this.score });
      this.emitStatus('gameover', { score: this.score, level: this.levelIndex + 1 });
    }
  }

  updateBombs() {
    for (let i = this.bombs.length - 1; i >= 0; i--) {
      const b = this.bombs[i];
      b.vy += b.g;
      b.x += b.vx; b.y += b.vy;
      this.addParticle(b.x, b.y, {
        vx: -b.vx * 0.15 + (Math.random() - 0.5), vy: -0.5 + (Math.random() - 0.5) * 0.5,
        life: 18 + Math.random() * 12, color: 'rgba(150,160,190,.45)', size: 3 + Math.random() * 3
      });
      if (Math.random() < 0.3) this.addParticle(b.x, b.y, {
        vx: -b.vx * 0.2 + (Math.random() - 0.5) * 2, vy: (Math.random() - 0.5) * 2,
        life: 8 + Math.random() * 8, color: 'rgba(255,180,80,.9)', size: 2
      });
      if (b.y > this.H - 48) {
        this.explode(b.x, this.H - 62, '#ff9f68', 64, { colorful: true, radius: 150, damage: 120 });
        this.emit('bombexplode', { x: b.x, y: this.H - 62 });
        this.bombs.splice(i, 1);
      }
    }
  }

  updatePickups() {
    const p = this.player;
    for (let i = this.pickups.length - 1; i >= 0; i--) {
      const k = this.pickups[i];
      k.life--;
      k.phase += 0.08;
      if (Math.hypot(k.x - p.x, k.y - p.y) < 34) {
        this.applyPickup(k.type, k.x, k.y);
        this.pickups.splice(i, 1);
      } else if (k.life <= 0) this.pickups.splice(i, 1);
    }
  }

  applyPickup(type, x, y) {
    const p = this.player;
    const info = PICKUPS[type];
    if (type === 'repair') p.health = Math.min(PLAYER.maxHealth, p.health + 30);
    else if (type === 'shield') p.shield = 420;
    else if (type === 'bomb') p.bombs += 1;
    else if (type === 'rapid') p.rapid = 480;
    this.addScore(50, x, y);
    this.emit('pickup', { type, x, y, color: info.color });
  }

  explode(x, y, color, count = 10, options = {}) {
    const colorful = options.colorful;
    for (let i = 0; i < count; i++) {
      if (colorful) {
        const r = 200 + Math.floor(Math.random() * 55);
        const g = 80 + Math.floor(Math.random() * 120);
        const bl = Math.floor(Math.random() * 60);
        this.addParticle(x, y, {
          vx: (Math.random() - 0.5) * 9, vy: (Math.random() - 0.5) * 9,
          life: 20 + Math.random() * 30,
          color: `rgba(${r},${g},${bl},${0.9 - Math.random() * 0.5})`,
          size: 3 + Math.random() * 6
        });
      } else {
        this.addParticle(x, y, {
          vx: (Math.random() - 0.5) * 5, vy: (Math.random() - 0.5) * 5,
          life: 20 + Math.random() * 10, color, size: 2 + Math.random() * 3
        });
      }
    }
    this.addParticle(x, y, { vx: 0, vy: 0, life: 8, color: 'rgba(255,245,220,.95)', size: 18 });
    this.emit('explosion', { x, y, color, count });

    const radius = options.radius || 0;
    const damage = options.damage || 0;
    if (radius > 0 && damage > 0) {
      for (let i = this.enemies.length - 1; i >= 0; i--) {
        const e = this.enemies[i];
        const d = Math.hypot(e.x + e.w / 2 - x, e.y + e.h / 2 - y);
        if (d <= radius) {
          e.hp -= Math.max(1, Math.round(damage * (1 - d / radius)));
          if (e.hp <= 0) this.killEnemy(i);
        }
      }
      if (this.boss) {
        const b = this.boss;
        const d = Math.hypot(b.x - x, b.y - y);
        if (d <= radius) {
          b.hp -= Math.max(1, Math.round(damage * (1 - d / radius)));
          if (b.hp <= 0) {
            this.explode(b.x, b.y, b.color, 40, { colorful: true });
            this.addScore(2500, b.x, b.y);
            this.boss = null;
            this.emit('bossdown', { x: b.x, y: b.y });
          }
        }
      }
    }
  }

  addParticle(x, y, o) {
    this.particles.push({ x, y, vx: o.vx, vy: o.vy, life: o.life, color: o.color, size: o.size });
    if (this.particles.length > 600) this.particles.splice(0, this.particles.length - 600);
  }

  updateParticles() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx; p.y += p.vy; p.life--;
      if (p.life <= 0) this.particles.splice(i, 1);
    }
  }

  checkWin() {
    if (this.enemies.length > 0 || this.boss || this.status !== 'playing') return;
    const bonus = 1000 * (this.levelIndex + 1);
    this.clearBonus = bonus;
    this.score += Math.round(bonus * this.diff.score);
    if (this.levelIndex >= LEVELS.length - 1) {
      this.emit('victory', { score: this.score });
      this.emitStatus('victory', { score: this.score, level: this.levelIndex + 1 });
    } else {
      this.emit('levelclear', { score: this.score });
      this.emitStatus('levelcomplete', { score: this.score, level: this.levelIndex + 1 });
    }
  }
}
