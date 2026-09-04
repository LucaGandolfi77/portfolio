/* =============================================
   Cabriolo, 5:00 — minigames.js
   5 minigiochi canvas · touch-first · cozy
   ============================================= */
"use strict";

const CabrioloMinigames = (() => {
  let canvas, ctx, W, H;
  let running = false;
  let score = 0;
  let onEnd = null;
  let raf = null;
  let currentGame = null;

  function init(canvasEl) {
    canvas = canvasEl;
    ctx = canvas.getContext("2d");
    resize();
    window.addEventListener("resize", resize);
  }

  function resize() {
    W = canvas.width = canvas.parentElement.clientWidth;
    H = canvas.height = canvas.parentElement.clientHeight;
  }

  function start(gameId, endCb) {
    score = 0;
    onEnd = endCb;
    running = true;
    resize();
    canvas.style.display = "block";
    currentGame = games[gameId];
    if (currentGame) currentGame.start();
  }

  function stop() {
    running = false;
    if (raf) cancelAnimationFrame(raf);
    canvas.style.display = "none";
  }

  function skip() {
    if (onEnd) onEnd(score);
    stop();
  }

  function addScore(n) {
    score += n;
    const el = document.getElementById("minigame-score");
    if (el) el.textContent = score;
    CabrioloAudio.ding();
  }

  function endGame() {
    running = false;
    setTimeout(() => {
      if (onEnd) onEnd(score);
      stop();
    }, 800);
  }

  // ===================== GAME 1: LA SALITA =====================
  const salita = {
    player: { x: 0, y: 0, w: 24, h: 36, stepping: false, stepY: 0 },
    obstacles: [],
    step: 0,
    speed: 1.2,
    spawnTimer: 0,
    grasses: [],
    start() {
      this.player.x = W / 2 - 12;
      this.player.y = H * 0.7;
      this.obstacles = [];
      this.grasses = [];
      this.step = 0;
      this.spawnTimer = 0;
      this.speed = 1.2;
      // pre-generate grass
      for (let i = 0; i < 30; i++) {
        this.grasses.push({ x: Math.random() * W, y: Math.random() * H, h: 10 + Math.random() * 18, sway: Math.random() * Math.PI * 2 });
      }
      this.bindTap();
      this.loop();
    },
    bindTap() {
      const handler = (e) => {
        if (!running) return;
        e.preventDefault();
        this.player.stepping = true;
        this.player.stepY = -18;
        this.step++;
        if (this.step % 5 === 0) addScore(1);
      };
      canvas.addEventListener("touchstart", handler, { passive: false });
      canvas.addEventListener("mousedown", handler);
    },
    loop() {
      if (!running) return;
      ctx.clearRect(0, 0, W, H);
      // sky
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, "#1a0e2e");
      grad.addColorStop(0.5, "#e8963c");
      grad.addColorStop(1, "#3a7a3a");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // grass
      const t = Date.now() / 1000;
      this.grasses.forEach(g => {
        const sway = Math.sin(t * 1.5 + g.sway) * 3;
        ctx.strokeStyle = "rgba(80,140,60,0.5)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(g.x, g.y);
        ctx.lineTo(g.x + sway, g.y - g.h);
        ctx.stroke();
      });

      // path
      ctx.fillStyle = "rgba(180,150,100,0.3)";
      ctx.fillRect(W / 2 - 30, 0, 60, H);

      // obstacles
      this.spawnTimer++;
      if (this.spawnTimer > 40) {
        this.spawnTimer = 0;
        this.obstacles.push({
          x: W / 2 - 20 + Math.random() * 40,
          y: -20,
          r: 6 + Math.random() * 8
        });
      }
      this.obstacles.forEach(o => {
        o.y += this.speed;
        ctx.fillStyle = "rgba(120,90,60,0.7)";
        ctx.beginPath();
        ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // player
      this.player.stepY *= 0.85;
      const py = this.player.y + this.player.stepY;
      ctx.fillStyle = "#f5d49c";
      ctx.fillRect(this.player.x, py, this.player.w, this.player.h);
      // head
      ctx.beginPath();
      ctx.arc(this.player.x + 12, py - 6, 10, 0, Math.PI * 2);
      ctx.fill();

      // score text
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.font = "14px Nunito, sans-serif";
      ctx.fillText("Passi: " + this.step, W / 2 - 30, H - 40);

      // end after enough steps
      if (this.step >= 40) {
        addScore(3);
        endGame();
        return;
      }

      raf = requestAnimationFrame(() => this.loop());
    }
  };

  // ===================== GAME 2: PLAYLIST DELL'ALBA =====================
  const playlist = {
    notes: [],
    laneW: 60,
    spawnTimer: 0,
    hitLine: 0,
    misses: 0,
    start() {
      this.notes = [];
      this.spawnTimer = 0;
      this.hitLine = H * 0.78;
      this.misses = 0;
      this.bindTap();
      this.loop();
    },
    bindTap() {
      const handler = (e) => {
        if (!running) return;
        e.preventDefault();
        const tx = e.touches ? e.touches[0].clientX - canvas.getBoundingClientRect().left : e.offsetX;
        // check hit
        let hit = false;
        for (let i = this.notes.length - 1; i >= 0; i--) {
          const n = this.notes[i];
          if (!n.hit && Math.abs(tx - n.x) < this.laneW && Math.abs(n.y - this.hitLine) < 40) {
            n.hit = true;
            n.color = "#f5d49c";
            addScore(1);
            hit = true;
            break;
          }
        }
        if (!hit) {
          this.misses++;
        }
      };
      canvas.addEventListener("touchstart", handler, { passive: false });
      canvas.addEventListener("mousedown", handler);
    },
    loop() {
      if (!running) return;
      ctx.clearRect(0, 0, W, H);

      // sunrise gradient
      const progress = Math.min(score / 20, 1);
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, lerpColor("#1a0e2e", "#4a8ab5", progress));
      grad.addColorStop(0.5, lerpColor("#1a0e2e", "#e8963c", progress));
      grad.addColorStop(1, lerpColor("#3a7a3a", "#f5d49c", progress));
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // sun
      const sunY = H * (0.8 - progress * 0.4);
      ctx.fillStyle = "#f5d49c";
      ctx.globalAlpha = 0.6 + progress * 0.4;
      ctx.beginPath();
      ctx.arc(W / 2, sunY, 20 + progress * 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;

      // hit line
      ctx.strokeStyle = "rgba(245,212,156,0.4)";
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      ctx.moveTo(0, this.hitLine);
      ctx.lineTo(W, this.hitLine);
      ctx.stroke();
      ctx.setLineDash([]);

      // spawn notes
      this.spawnTimer++;
      if (this.spawnTimer > 25) {
        this.spawnTimer = 0;
        const lanes = 4;
        const lane = Math.floor(Math.random() * lanes);
        this.notes.push({
          x: W / 2 - (lanes / 2) * this.laneW + lane * this.laneW + this.laneW / 2,
          y: -10,
          hit: false,
          color: "#fff"
        });
      }

      // draw notes
      this.notes.forEach(n => {
        n.y += 2.5;
        ctx.fillStyle = n.hit ? "rgba(245,212,156,0.5)" : n.color;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.hit ? 12 : 10, 0, Math.PI * 2);
        ctx.fill();
        if (!n.hit) {
          ctx.strokeStyle = "rgba(245,212,156,0.4)";
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      });

      // remove off-screen
      this.notes = this.notes.filter(n => n.y < H + 20);

      if (score >= 20) {
        endGame();
        return;
      }
      raf = requestAnimationFrame(() => this.loop());
    }
  };

  // ===================== GAME 3: SASSOLINI SULLO STIRONE =====================
  const sassolini = {
    stones: [],
    water: [],
    throws: 0,
    maxThrows: 8,
    bouncing: false,
    bounceX: 0,
    bounceY: 0,
    bounceVx: 0,
    bounceCount: 0,
    lastTap: 0,
    start() {
      this.stones = [];
      this.throws = 0;
      this.bouncing = false;
      this.bindTap();
      this.initWater();
      this.loop();
    },
    initWater() {
      this.water = [];
      for (let i = 0; i < 15; i++) {
        this.water.push({ x: Math.random() * W, y: H * 0.6 + Math.random() * H * 0.4, r: 20 + Math.random() * 40, phase: Math.random() * Math.PI * 2 });
      }
    },
    bindTap() {
      const handler = (e) => {
        if (!running) return;
        e.preventDefault();
        const now = Date.now();
        if (this.bouncing) {
          // tap to keep bounce
          if (now - this.lastTap > 200) {
            this.bounceVx += 0.5;
            this.bounceCount++;
            addScore(1);
            this.lastTap = now;
          }
        } else if (this.throws < this.maxThrows) {
          // throw
          this.bouncing = true;
          this.bounceX = W / 2;
          this.bounceY = H * 0.55;
          this.bounceVx = 3 + Math.random() * 2;
          this.bounceCount = 0;
          this.throws++;
          this.lastTap = now;
        }
      };
      canvas.addEventListener("touchstart", handler, { passive: false });
      canvas.addEventListener("mousedown", handler);
    },
    loop() {
      if (!running) return;
      ctx.clearRect(0, 0, W, H);

      // water
      const t = Date.now() / 1000;
      const waterGrad = ctx.createLinearGradient(0, H * 0.55, 0, H);
      waterGrad.addColorStop(0, "#2a5a7a");
      waterGrad.addColorStop(1, "#1a3a5a");
      ctx.fillStyle = waterGrad;
      ctx.fillRect(0, H * 0.55, W, H * 0.45);

      // water ripples
      this.water.forEach(w => {
        const ry = w.y + Math.sin(t + w.phase) * 3;
        ctx.strokeStyle = "rgba(100,160,200,0.2)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(w.x, ry, w.r, w.r * 0.3, 0, 0, Math.PI * 2);
        ctx.stroke();
      });

      // bank
      ctx.fillStyle = "#5a4a3a";
      ctx.fillRect(0, H * 0.52, W, H * 0.06);

      // bouncing stone
      if (this.bouncing) {
        this.bounceX += this.bounceVx;
        this.bounceVx *= 0.97;
        this.bounceY += Math.sin(t * 8) * 2;
        ctx.fillStyle = "#8a7a6a";
        ctx.beginPath();
        ctx.arc(this.bounceX, this.bounceY, 6, 0, Math.PI * 2);
        ctx.fill();
        // ripples where it hits
        ctx.strokeStyle = "rgba(200,200,255,0.3)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(this.bounceX, this.bounceY + 10, 15 + this.bounceCount * 5, 4, 0, 0, Math.PI * 2);
        ctx.stroke();

        if (this.bounceX > W + 30 || this.bounceVx < 0.3) {
          this.bouncing = false;
        }
      }

      // throws left
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.font = "13px Nunito, sans-serif";
      ctx.fillText("Lanci: " + this.throws + "/" + this.maxThrows, 20, H - 30);
      ctx.fillText("Rimbalzi: " + score, W - 100, H - 30);

      if (this.throws >= this.maxThrows && !this.bouncing) {
        endGame();
        return;
      }
      raf = requestAnimationFrame(() => this.loop());
    }
  };

  // ===================== GAME 4: LUCCIOLE E FOGLIE =====================
  const lucciole = {
    items: [],
    bucket: { x: 0, w: 70 },
    spawnTimer: 0,
    collected: 0,
    maxCollect: 15,
    dragging: false,
    dragX: 0,
    start() {
      this.items = [];
      this.bucket.x = W / 2 - 35;
      this.spawnTimer = 0;
      this.collected = 0;
      this.bindDrag();
      this.loop();
    },
    bindDrag() {
      const getX = (e) => e.touches ? e.touches[0].clientX - canvas.getBoundingClientRect().left : e.offsetX;
      const onStart = (e) => {
        if (!running) return;
        e.preventDefault();
        this.dragging = true;
        this.dragX = getX(e);
      };
      const onMove = (e) => {
        if (!running || !this.dragging) return;
        e.preventDefault();
        this.bucket.x = getX(e) - this.bucket.w / 2;
      };
      const onEnd = () => { this.dragging = false; };
      canvas.addEventListener("touchstart", onStart, { passive: false });
      canvas.addEventListener("touchmove", onMove, { passive: false });
      canvas.addEventListener("touchend", onEnd);
      canvas.addEventListener("mousedown", onStart);
      canvas.addEventListener("mousemove", onMove);
      canvas.addEventListener("mouseup", onEnd);
    },
    loop() {
      if (!running) return;
      ctx.clearRect(0, 0, W, H);

      // sky (autumn dusk)
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, "#1a1018");
      grad.addColorStop(0.5, "#c07845");
      grad.addColorStop(1, "#3a2a1a");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // spawn items
      this.spawnTimer++;
      if (this.spawnTimer > 18) {
        this.spawnTimer = 0;
        const isFirefly = Math.random() > 0.4;
        this.items.push({
          x: 20 + Math.random() * (W - 40),
          y: -10,
          speed: 1 + Math.random() * 1.5,
          type: isFirefly ? "firefly" : "leaf",
          phase: Math.random() * Math.PI * 2,
          glow: isFirefly
        });
      }

      // draw items
      const t = Date.now() / 1000;
      this.items.forEach(item => {
        item.y += item.speed;
        item.x += Math.sin(t + item.phase) * 0.8;

        if (item.type === "firefly") {
          const glow = 0.4 + Math.sin(Date.now() / 200 + item.phase) * 0.3;
          ctx.fillStyle = `rgba(255,220,100,${glow})`;
          ctx.beginPath();
          ctx.arc(item.x, item.y, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = `rgba(255,255,200,${glow * 0.5})`;
          ctx.beginPath();
          ctx.arc(item.x, item.y, 8, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = "#c07845";
          ctx.save();
          ctx.translate(item.x, item.y);
          ctx.rotate(Date.now() / 1000 + item.phase);
          ctx.fillRect(-5, -3, 10, 6);
          ctx.restore();
        }
      });

      // check collection
      this.items = this.items.filter(item => {
        if (item.y > H + 20) return false;
        if (item.y > this.bucket.y - 10 && item.x > this.bucket.x && item.x < this.bucket.x + this.bucket.w && item.y < H * 0.85) {
          this.collected++;
          addScore(1);
          return false;
        }
        return true;
      });

      // bucket
      ctx.fillStyle = "rgba(100,80,60,0.8)";
      ctx.beginPath();
      ctx.moveTo(this.bucket.x, H * 0.82);
      ctx.lineTo(this.bucket.x + this.bucket.w, H * 0.82);
      ctx.lineTo(this.bucket.x + this.bucket.w - 8, H * 0.88);
      ctx.lineTo(this.bucket.x + 8, H * 0.88);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.font = "13px Nunito, sans-serif";
      ctx.fillText("Raccolte: " + this.collected + "/" + this.maxCollect, 20, 30);

      if (this.collected >= this.maxCollect) {
        endGame();
        return;
      }
      raf = requestAnimationFrame(() => this.loop());
    }
  };

  // ===================== GAME 5: LE PAROLE SOSPENSE =====================
  const parole = {
    phrases: [
      "siamo vivi",
      "ogni alba è una scelta",
      "la collina ci aspetta",
      "non ci perdiamo",
      "le cinque zero sette",
      "il sole è lo stesso"
    ],
    currentPhrase: 0,
    words: [],
    target: [],
    placed: [],
    zones: [],
    draggingIdx: -1,
    start() {
      this.currentPhrase = 0;
      this.loadPhrase();
      this.bindDrag();
      this.loop();
    },
    loadPhrase() {
      const phrase = this.phrases[this.currentPhrase];
      this.target = phrase.split(" ");
      // shuffle words
      this.words = [...this.target].sort(() => Math.random() - 0.5);
      this.placed = [];
      // create drop zones
      this.zones = this.target.map((_, i) => ({
        x: 20,
        y: 40 + i * 48,
        w: W - 40,
        h: 40,
        filled: false
      }));
    },
    bindDrag() {
      const getX = (e) => e.touches ? e.touches[0].clientX - canvas.getBoundingClientRect().left : e.offsetX;
      const getY = (e) => e.touches ? e.touches[0].clientY - canvas.getBoundingClientRect().top : e.offsetY;

      const onStart = (e) => {
        if (!running) return;
        e.preventDefault();
        const y = getY(e);
        const x = getX(e);
        // find word under tap
        for (let i = 0; i < this.words.length; i++) {
          if (this.placed.includes(i)) continue;
          const wy = H - 120 + Math.floor(i / 3) * 45;
          const wx = 20 + (i % 3) * ((W - 40) / 3);
          if (x > wx && x < wx + (W - 40) / 3 - 10 && y > wy && y < wy + 38) {
            this.draggingIdx = i;
            break;
          }
        }
      };
      const onEnd = (e) => {
        if (!running || this.draggingIdx < 0) return;
        e.preventDefault();
        const y = getY(e.changedTouches ? e.changedTouches[0] : e);
        // find zone
        for (let z = 0; z < this.zones.length; z++) {
          const zone = this.zones[z];
          if (!zone.filled && y > zone.y && y < zone.y + zone.h) {
            // place word
            this.placed.push(this.draggingIdx);
            zone.filled = true;
            zone.word = this.words[this.draggingIdx];
            zone.wordIdx = this.draggingIdx;
            addScore(1);
            break;
          }
        }
        this.draggingIdx = -1;
      };
      canvas.addEventListener("touchstart", onStart, { passive: false });
      canvas.addEventListener("touchend", onEnd, { passive: false });
      canvas.addEventListener("mousedown", onStart);
      canvas.addEventListener("mouseup", onEnd);
    },
    loop() {
      if (!running) return;
      ctx.clearRect(0, 0, W, H);

      // bg
      ctx.fillStyle = "#1a0e2e";
      ctx.fillRect(0, 0, W, H);

      // title
      ctx.fillStyle = "rgba(245,212,156,0.6)";
      ctx.font = "13px Nunito, sans-serif";
      ctx.fillText("Ricostruisci: " + (this.currentPhrase + 1) + "/" + this.phrases.length, 20, 28);

      // drop zones
      this.zones.forEach((zone, i) => {
        ctx.strokeStyle = zone.filled ? "rgba(232,150,60,0.5)" : "rgba(245,212,156,0.15)";
        ctx.lineWidth = 1;
        ctx.strokeRect(zone.x, zone.y, zone.w, zone.h);
        if (zone.filled) {
          ctx.fillStyle = "#f5d49c";
          ctx.font = "18px Lora, serif";
          ctx.fillText(zone.word, zone.x + 12, zone.y + 28);
        }
      });

      // available words
      ctx.fillStyle = "rgba(245,212,156,0.4)";
      ctx.font = "12px Nunito, sans-serif";
      ctx.fillText("Parole:", 20, H - 150);

      this.words.forEach((word, i) => {
        if (this.placed.includes(i)) return;
        const wy = H - 120 + Math.floor(i / 3) * 45;
        const wx = 20 + (i % 3) * ((W - 40) / 3);
        ctx.fillStyle = this.draggingIdx === i ? "rgba(232,150,60,0.4)" : "rgba(255,255,255,0.08)";
        ctx.fillRect(wx, wy, (W - 40) / 3 - 10, 38);
        ctx.fillStyle = "#fdf6e3";
        ctx.font = "16px Lora, serif";
        ctx.fillText(word, wx + 8, wy + 26);
      });

      // check completion
      if (this.zones.every(z => z.filled)) {
        const correct = this.zones.every((z, i) => z.word === this.target[i]);
        if (correct) {
          this.currentPhrase++;
          if (this.currentPhrase >= this.phrases.length) {
            addScore(5);
            endGame();
            return;
          }
          setTimeout(() => this.loadPhrase(), 600);
        } else {
          // wrong — reset
          this.zones.forEach(z => { z.filled = false; z.word = null; });
          this.placed = [];
        }
      }

      raf = requestAnimationFrame(() => this.loop());
    }
  };

  // ===================== HELPERS =====================
  function lerpColor(a, b, t) {
    const ah = parseInt(a.slice(1), 16);
    const bh = parseInt(b.slice(1), 16);
    const ar = (ah >> 16) & 0xff, ag = (ah >> 8) & 0xff, ab = ah & 0xff;
    const br = (bh >> 16) & 0xff, bg = (bh >> 8) & 0xff, bb = bh & 0xff;
    const rr = Math.round(ar + (br - ar) * t);
    const rg = Math.round(ag + (bg - ag) * t);
    const rb = Math.round(ab + (bb - ab) * t);
    return `rgb(${rr},${rg},${rb})`;
  }

  const games = {
    salita,
    playlist,
    sassolini,
    lucciole,
    parole
  };

  return { init, start, stop, skip };
})();
