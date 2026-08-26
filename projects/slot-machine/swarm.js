'use strict';
(function (global) {
  const DEFAULTS = {
    initialCount: 12,
    maxBikes: 20,
    spawnMin: 400, // ms
    spawnMax: 1600, // ms
    baseSpeed: 8,
    emojiList: ['🚴\u200d♂️', '🚴\u200d♀️', '🚴'],
    size: 32, // px, usato solo come margine di rimbalzo
    jitterChance: 0.02, // probabilità per frame di micro-variazione direzione
    jitterMaxAngle: 0.25, // radianti
    // extra dinamica
    targetFPS: 60,
    speedJitterChance: 0.015,
    speedJitterRange: 0.08, // +/-8%
  speedMinMul: 0.85,
    speedMaxMul: 1.6,
    tiltFactor: 0.2, // fattore di inclinazione (0-0.4 consigliato)
    // scie
    trailEnabled: true,
    trailInterval: 120, // ms
    trailLinger: 600, // ms
    trailOpacity: 0.35,
    trailSizeScale: 0.9,
    // velocità: interpretiamo baseSpeed come px/frame a 60 FPS (compat legacy)
    referenceFPS: 60,
    // modalità mobile: caduta dall'alto
    mobileFall: false,
    gravity: 900, // px/s^2
    driftXMax: 120, // px/s drift orizzontale massimo
    removeOffscreen: true
  };

  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  // Ruota un vettore (dx,dy) di un angolo theta
  function rotate(dx, dy, theta) {
    const cos = Math.cos(theta);
    const sin = Math.sin(theta);
    return { dx: dx * cos - dy * sin, dy: dx * sin + dy * cos };
  }

  class Bike {
    constructor(container, opts) {
      this.container = container;
      this.opts = opts;
      this.el = null;
      this.x = 0;
      this.y = 0;
      this.dx = 0;
      this.dy = 0;
      this.scaleX = 1;
  this.speedMul = Math.max(this.opts.speedMinMul, Math.min(this.opts.speedMaxMul, rand(0.85, 1.3)));
      this.lastTrail = 0;
    }

    create(bounds) {
      const el = document.createElement('div');
      el.className = 'bike';
      el.textContent = pick(this.opts.emojiList);
      const v = this.opts.baseSpeed * this.opts.referenceFPS * this.speedMul; // px/s
      if (this.opts.mobileFall) {
        // spawn in alto con x casuale
        this.x = rand(0, Math.max(0, bounds.width - this.opts.size));
        this.y = -this.opts.size;
        this.dx = rand(-this.opts.driftXMax, this.opts.driftXMax);
        this.dy = v; // velocità iniziale verso il basso
      } else {
        // posizione iniziale casuale ovunque
        this.x = rand(0, Math.max(0, bounds.width - this.opts.size));
        this.y = rand(0, Math.max(0, bounds.height - this.opts.size));
        // direzione casuale
        const angle = rand(0, Math.PI * 2);
        this.dx = Math.cos(angle) * v;
        this.dy = Math.sin(angle) * v;
      }
      this.scaleX = this.dx < 0 ? -1 : 1;
      el.style.transform = `translate(${this.x}px, ${this.y}px) scaleX(${this.scaleX})`;
      this.container.appendChild(el);
      this.el = el;
      return this;
    }

    update(bounds, ts, dtSec) {
      if (!this.el || !this.el.parentNode) return false;

      // jitter direzionale casuale per effetto "sciame"
      if (!this.opts.mobileFall && Math.random() < this.opts.jitterChance) {
        const theta = rand(-this.opts.jitterMaxAngle, this.opts.jitterMaxAngle);
        const rotated = rotate(this.dx, this.dy, theta);
        // normalizza alla velocità corrente
        const speed = Math.hypot(rotated.dx, rotated.dy) || 1;
        const target = this.opts.baseSpeed * this.opts.referenceFPS * this.speedMul; // px/s
        this.dx = (rotated.dx / speed) * target;
        this.dy = (rotated.dy / speed) * target;
      }

      // micro-variazione della velocità
      if (!this.opts.mobileFall && Math.random() < this.opts.speedJitterChance) {
        const factor = 1 + rand(-this.opts.speedJitterRange, this.opts.speedJitterRange);
        this.speedMul = Math.max(this.opts.speedMinMul, Math.min(this.opts.speedMaxMul, this.speedMul * factor));
        const v = this.opts.baseSpeed * this.opts.referenceFPS * this.speedMul; // px/s
        const mag = Math.hypot(this.dx, this.dy) || 1;
        // mantieni direzione, scala a nuova velocità
        this.dx = (this.dx / mag) * v;
        this.dy = (this.dy / mag) * v;
      }

      // integrazione temporale
      const dt = Math.max(0.001, dtSec || 0); // evita 0
      if (this.opts.mobileFall) {
        // applica gravità e caduta
        this.dy += this.opts.gravity * dt;
        this.x += this.dx * dt;
        this.y += this.dy * dt;
      } else {
        this.x += this.dx * dt;
        this.y += this.dy * dt;
      }

      const pad = this.opts.size; // margine per non uscire

      if (this.opts.mobileFall) {
        // rimuovi quando esce dal fondo
        if (this.opts.removeOffscreen && this.y >= bounds.height + pad) {
          this.remove();
          return false;
        }
        // rimbalzi orizzontali opzionali se esce lateralmente
        if (this.x <= 0) {
          this.x = 0; this.dx = Math.abs(this.dx);
        } else if (this.x >= bounds.width - pad) {
          this.x = bounds.width - pad; this.dx = -Math.abs(this.dx);
        }
      } else {
        if (this.x <= 0) {
          this.x = 0;
          this.dx = -this.dx;
        } else if (this.x >= bounds.width - pad) {
          this.x = bounds.width - pad;
          this.dx = -this.dx;
        }
        if (this.y <= 0) {
          this.y = 0;
          this.dy = -this.dy;
        } else if (this.y >= bounds.height - pad) {
          this.y = bounds.height - pad;
          this.dy = -this.dy;
        }
      }

      this.scaleX = this.dx < 0 ? -1 : 1;
      const angleRad = Math.atan2(this.dy, this.dx);
      const tiltDeg = (angleRad * 180 / Math.PI) * this.opts.tiltFactor; // piccola inclinazione
      this.el.style.transform = `translate(${this.x}px, ${this.y}px) scaleX(${this.scaleX}) rotate(${tiltDeg}deg)`;

      // Scia (trail) leggera
      if (this.opts.trailEnabled && ts) {
        if (!this.lastTrail || (ts - this.lastTrail) >= this.opts.trailInterval) {
          this.lastTrail = ts;
          const trail = document.createElement('div');
          trail.className = 'bike-trail';
          trail.textContent = this.el.textContent;
          trail.style.position = 'absolute';
          trail.style.left = '0px';
          trail.style.top = '0px';
          trail.style.pointerEvents = 'none';
          trail.style.zIndex = '99';
          trail.style.opacity = String(this.opts.trailOpacity);
          trail.style.transform = `translate(${this.x}px, ${this.y}px) scaleX(${this.scaleX}) scale(${this.opts.trailSizeScale})`;
          trail.style.transition = `opacity ${this.opts.trailLinger}ms linear`;
          this.container.appendChild(trail);
          // fade-out e rimozione
          requestAnimationFrame(() => {
            trail.style.opacity = '0';
          });
          setTimeout(() => {
            if (trail && trail.parentNode) trail.remove();
          }, this.opts.trailLinger + 50);
        }
      }
      return true;
    }

    remove() {
      if (this.el && this.el.parentNode) {
        this.el.remove();
      }
      this.el = null;
    }
  }

  class BikeSwarm {
    constructor(container, options = {}) {
      this.container = container;
      this.opts = Object.assign({}, DEFAULTS, options);
      this.bikes = [];
      this.active = false;
      this.spawnTimerId = null;
      this.rafId = null;
      this._loop = this._loop.bind(this);
      this._base = null; // per ripristino post-boost
      this._boostTimeout = null;
      this._frameInterval = 1000 / this.opts.targetFPS;
      this._lastTs = 0;
    }

    start() {
      if (this.active) return;
      this.active = true;
      const bounds = this.container.getBoundingClientRect();
      for (let i = 0; i < this.opts.initialCount; i++) {
        this._spawnOne(bounds);
      }
      this._scheduleSpawn();
      this.rafId = requestAnimationFrame(this._loop);
    }

    stop() {
      this.active = false;
      if (this.spawnTimerId) {
        clearTimeout(this.spawnTimerId);
        this.spawnTimerId = null;
      }
      if (this.rafId) {
        cancelAnimationFrame(this.rafId);
        this.rafId = null;
      }
      this.bikes.forEach(b => b.remove());
      this.bikes = [];
    }

    _spawnOne(bounds) {
      if (!this.active) return;
      if (this.bikes.length >= this.opts.maxBikes) return;
      const bike = new Bike(this.container, this.opts).create(bounds);
      this.bikes.push(bike);
    }

    _scheduleSpawn() {
      if (!this.active) return;
      const delay = rand(this.opts.spawnMin, this.opts.spawnMax);
      this.spawnTimerId = setTimeout(() => {
        if (!this.active) return;
        const bounds = this.container.getBoundingClientRect();
        this._spawnOne(bounds);
        this._scheduleSpawn();
      }, delay);
    }

    _loop(ts) {
      if (!this.active) return;
      if (!this._lastTs) this._lastTs = ts;
      const delta = ts - this._lastTs;
      if (delta < this._frameInterval) {
        this.rafId = requestAnimationFrame(this._loop);
        return;
      }
      this._lastTs = ts;
      const bounds = this.container.getBoundingClientRect();
      const dtSec = delta / 1000;
      this.bikes = this.bikes.filter(b => {
        const alive = b.update(bounds, ts, dtSec);
        return alive;
      });
      this.rafId = requestAnimationFrame(this._loop);
    }

    // Boost temporaneo: aumenta maxBikes e accelera spawn, opzionali extra spawn immediati
    boost({ extraBikes = 8, duration = 3000, spawnMin = 100, spawnMax = 300, maxBikesInc = 10 } = {}) {
      if (!this.active) return;
      // salva base solo la prima volta o se non presente
      if (!this._base) {
        this._base = {
          spawnMin: this.opts.spawnMin,
          spawnMax: this.opts.spawnMax,
          maxBikes: this.opts.maxBikes
        };
      }
      // applica boost
      this.opts.spawnMin = spawnMin;
      this.opts.spawnMax = spawnMax;
      this.opts.maxBikes = this._base.maxBikes + maxBikesInc;

      // spawn immediato di qualche bici
      const bounds = this.container.getBoundingClientRect();
      for (let i = 0; i < extraBikes; i++) this._spawnOne(bounds);

      // rischedula rapido
      if (this.spawnTimerId) {
        clearTimeout(this.spawnTimerId);
        this.spawnTimerId = null;
      }
      this._scheduleSpawn();

      // reset programmato (se arriva un nuovo boost, resetta timer e prolunga)
      if (this._boostTimeout) clearTimeout(this._boostTimeout);
      this._boostTimeout = setTimeout(() => {
        if (!this._base) return;
        this.opts.spawnMin = this._base.spawnMin;
        this.opts.spawnMax = this._base.spawnMax;
        this.opts.maxBikes = this._base.maxBikes;
        this._boostTimeout = null;
      }, duration);
    }

    // Aggiorna alcune opzioni live; se cambia la velocità base, scala le velocità correnti
    applyOptions(partial = {}) {
      const prevBase = this.opts.baseSpeed;
      Object.assign(this.opts, partial);
      if (partial.baseSpeed && partial.baseSpeed > 0 && prevBase > 0 && partial.baseSpeed !== prevBase) {
        const factor = partial.baseSpeed / prevBase;
        this.bikes.forEach(b => {
          b.dx *= factor;
          b.dy *= factor;
        });
      }
      // Se cambiano i limiti di spawn, reschedule
      if (typeof partial.spawnMin !== 'undefined' || typeof partial.spawnMax !== 'undefined') {
        if (this.spawnTimerId) {
          clearTimeout(this.spawnTimerId);
          this.spawnTimerId = null;
        }
        this._scheduleSpawn();
      }
    }
  }

  global.BikeSwarm = BikeSwarm;
})(window);
