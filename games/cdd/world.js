/* CDD RUN — gameplay world: spawning, physics, collisions, powerups, combo */

export const LANES = 3;
const BASE_SPEED = 340;
const JUMP_GRAVITY = 1080;
const JUMP_V = 470;

export class World {
  constructor(onEvent = () => {}) {
    this.onEvent = onEvent;
    this.dims = { w: 800, h: 600, horizon: 240, ground: 350, laneW: 140 };
    this.reset();
  }

  resize(w, h) {
    this.dims.w = w;
    this.dims.h = h;
    this.dims.horizon = h * 0.4;
    this.dims.ground = h * 0.6;
    this.dims.laneW = Math.min(150, Math.max(92, w * 0.36));
  }

  reset() {
    this.running = false;
    this.time = 0;
    this.score = 0;
    this.coins = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.comboTimer = 0;
    this.multiplier = 1;
    this.distance = 0;
    this.nearMisses = 0;
    this.level = 1;
    this.levelMultiplier = 1;
    this.speed = BASE_SPEED;
    this.spawnTimer = 0.5;
    this.powerup = null;
    this.powerupTimer = 0;
    this.shield = false;
    this.magnet = false;
    this.turbo = false;
    this.obstacles = [];
    this.coinsArr = [];
    this.powerups = [];
    this.clouds = [];
    this.hills = Array.from({ length: 7 }, () => ({
      x: Math.random(), w: 0.12 + Math.random() * 0.16,
      h: 0.05 + Math.random() * 0.09, layer: Math.random() < 0.5 ? 0 : 1
    }));
    this.stars = Array.from({ length: 70 }, () => ({
      x: Math.random(), y: Math.random() * 0.9,
      r: 0.5 + Math.random() * 1.3, tw: Math.random() * 6.28
    }));
    this.player = { lane: 1, target: 1, jumpH: 0, jumpV: 0, jumping: false, runPhase: 0 };
  }

  start() {
    this.reset();
    this.running = true;
    this.onEvent({ type: 'start' });
  }

  project(lane, depth = 0) {
    const { w, horizon, ground, laneW } = this.dims;
    const persp = 1 / (1 + Math.max(0, depth) * 0.004);
    const spread = 0.32 + 0.68 * persp;
    return {
      x: w / 2 + (lane - 1) * laneW * spread,
      y: horizon + (ground - horizon) * persp,
      scale: 0.35 + persp * 0.85,
      persp
    };
  }

  lane(dir) {
    if (!this.running) return;
    this.player.target = Math.max(0, Math.min(LANES - 1, this.player.target + dir));
    this.onEvent({ type: 'lane' });
  }

  jump() {
    if (!this.running || this.player.jumping) return;
    this.player.jumping = true;
    this.player.jumpV = JUMP_V;
    this.player.jumpH = 0.5;
    this.onEvent({ type: 'jump' });
  }

  spawn() {
    const z = this.time + 520 + Math.random() * 380;
    const lane = Math.floor(Math.random() * LANES);
    const type = Math.random() < 0.6 ? 'box' : 'tall';
    this.obstacles.push({ lane, z, type, crossed: false });

    if (this.level >= 4 && Math.random() < 0.35) {
      const other = (lane + 1 + Math.floor(Math.random() * 2)) % LANES;
      this.obstacles.push({ lane: other, z: z + 90, type: 'box', crossed: false });
    }
    for (let i = 0; i < LANES; i++) {
      if (i !== lane && Math.random() < 0.5) {
        this.coinsArr.push({ lane: i, z: z - 80 + Math.random() * 180, phase: Math.random() * 6.28 });
      }
    }
    if (Math.random() < 0.13) {
      const types = ['shield', 'magnet', 'turbo'];
      this.powerups.push({
        lane: Math.floor(Math.random() * LANES),
        z: z + 140,
        type: types[Math.floor(Math.random() * types.length)]
      });
    }
  }

  update(dt) {
    if (!this.running) return;
    this.time += dt;

    this.levelMultiplier = Math.min(4, 1 + Math.log(this.time / 30 + 1) * 0.35);
    const previousLevel = this.level;
    this.level = Math.floor(1 + this.time / 15);
    this.speed = BASE_SPEED * this.levelMultiplier * (this.turbo ? 1.45 : 1);
    if (this.level !== previousLevel) this.onEvent({ type: 'level', level: this.level });

    if (this.combo > 0) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) { this.combo = 0; this.multiplier = 1; }
    }

    const diff = this.player.target - this.player.lane;
    this.player.lane += diff * Math.min(1, 9 * dt);
    this.player.runPhase += dt * (9 + this.speed / 140);

    if (this.player.jumping) {
      this.player.jumpH += this.player.jumpV * dt;
      this.player.jumpV -= JUMP_GRAVITY * dt;
      if (this.player.jumpH <= 0) {
        this.player.jumping = false;
        this.player.jumpH = 0;
        this.player.jumpV = 0;
      }
    }

    this.score += dt * (18 + this.level * 4);
    this.distance = (this.time * this.speed) / 1000;

    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      this.spawn();
      this.spawnTimer = Math.max(0.3, 0.62 - this.level * 0.025) * (this.turbo ? 0.85 : 1);
    }

    for (const list of [this.obstacles, this.coinsArr, this.powerups]) {
      for (let i = list.length - 1; i >= 0; i--) list[i].z -= this.speed * dt;
    }

    for (let i = this.clouds.length - 1; i >= 0; i--) {
      this.clouds[i].x -= this.clouds[i].v * dt;
      if (this.clouds[i].x < -110) this.clouds.splice(i, 1);
    }
    if (Math.random() < 0.03 && this.clouds.length < 9) {
      this.clouds.push({
        x: this.dims.w + 80,
        y: 50 + Math.random() * (this.dims.horizon - 100),
        s: 30 + Math.random() * 48,
        v: 14 + Math.random() * 24
      });
    }

    const playerLane = Math.round(this.player.lane);
    const jumpH = this.player.jumpH;

    // obstacles: evaluate exactly once when they cross the player plane
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const ob = this.obstacles[i];
      if (!ob.crossed && ob.z <= this.time) {
        ob.crossed = true;
        const delta = Math.abs(ob.lane - playerLane);
        if (delta > 0.55 && delta < 1.2) {
          this.nearMisses++;
          this.addScore(30);
          this.onEvent({ type: 'near' });
        }
        if (delta < 0.55) {
          const required = ob.type === 'tall' ? 1e6 : 38;
          if (jumpH < required) {
            if (this.shield) {
              this.shield = false;
              this.clearPowerup();
              this.obstacles.splice(i, 1);
              this.combo = 0;
              this.multiplier = 1;
              this.onEvent({ type: 'shieldBreak' });
              continue;
            }
            this.running = false;
            this.onEvent({ type: 'gameover' });
            return;
          }
        }
      }
      if (ob.z < this.time - 270) this.obstacles.splice(i, 1);
    }

    // coins
    for (let i = this.coinsArr.length - 1; i >= 0; i--) {
      const coin = this.coinsArr[i];
      if (this.magnet && Math.abs(coin.z - this.time) < 320) {
        coin.lane += (playerLane - coin.lane) * Math.min(1, 4 * dt);
        coin.z += (this.time - coin.z) * Math.min(1, 3 * dt);
      }
      if (Math.abs(coin.z - this.time) < (this.magnet ? 200 : 115) && Math.abs(coin.lane - playerLane) < 0.55) {
        this.coins++;
        this.combo++;
        this.maxCombo = Math.max(this.maxCombo, this.combo);
        this.multiplier = Math.min(5, 1 + Math.floor(this.combo / 5));
        this.comboTimer = 3;
        this.addScore(100);
        this.coinsArr.splice(i, 1);
        this.onEvent({ type: 'coin', combo: this.combo, multiplier: this.multiplier });
      } else if (coin.z < this.time - 270) this.coinsArr.splice(i, 1);
    }

    // powerups
    for (let i = this.powerups.length - 1; i >= 0; i--) {
      const p = this.powerups[i];
      if (Math.abs(p.z - this.time) < 120 && Math.abs(p.lane - playerLane) < 0.55) {
        this.activatePowerup(p.type);
        this.powerups.splice(i, 1);
      } else if (p.z < this.time - 270) this.powerups.splice(i, 1);
    }

    if (this.powerup) {
      this.powerupTimer -= dt;
      if (this.powerupTimer <= 0) this.clearPowerup();
    }
  }

  addScore(value) { this.score += value * this.multiplier; }

  activatePowerup(type) {
    this.powerup = type;
    this.powerupTimer = 6;
    this.shield = type === 'shield';
    this.magnet = type === 'magnet';
    this.turbo = type === 'turbo';
    this.onEvent({ type: 'powerup', powerup: type });
  }

  clearPowerup() {
    this.powerup = null;
    this.powerupTimer = 0;
    this.shield = false;
    this.magnet = false;
    this.turbo = false;
  }

  session() {
    return {
      score: Math.floor(this.score),
      coins: this.coins,
      distance: Math.floor(this.distance),
      nearMisses: this.nearMisses,
      maxCombo: this.maxCombo
    };
  }
}
