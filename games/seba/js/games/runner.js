/* ============================================================
   Seba — the walk home at dawn: three lanes, pigeons and trams
   ------------------------------------------------------------
   Pure step function plus a canvas view. Drunk Seba sometimes
   sees the world upside down: left becomes right.
   ============================================================ */
export const GOAL = 30;   // seconds to reach the front door
export const LIVES = 3;

export const newRun = () => ({ t: 0, lane: 1, lives: LIVES, kebabs: 0, offered: 0, hurt: 0, next: 0.9, things: [], flip: false });

export function move(s, dir) { s.lane = Math.max(0, Math.min(2, s.lane + (s.flip ? -dir : dir))); }

export function stepRun(s, dt, drunk = 0, rnd = Math.random) {
  s.t += dt;
  s.hurt = Math.max(0, s.hurt - dt);
  s.flip = drunk > 40 && Math.floor(s.t / 5) % 2 === 1;
  s.next -= dt;
  const events = [];
  if (s.next <= 0 && s.t < GOAL - 1.5) {
    s.next = 0.95 - (s.t / GOAL) * 0.35;
    const lane = Math.floor(rnd() * 3);
    const roll = rnd();
    const kind = roll < 0.28 ? 'kebab' : roll < 0.62 ? 'pigeon' : roll < 0.85 ? 'puddle' : 'tram';
    if (kind === 'kebab') s.offered++;
    s.things.push({ lane, kind, y: -0.12, v: 0.42 + (s.t / GOAL) * 0.2 + (kind === 'tram' ? 0.12 : 0) });
  }
  for (let i = s.things.length - 1; i >= 0; i--) {
    const o = s.things[i];
    const before = o.y;
    o.y += o.v * dt;
    if (o.lane === s.lane && before < 0.86 && o.y >= 0.78) {
      if (o.kind === 'kebab') { s.kebabs++; events.push('kebab'); s.things.splice(i, 1); continue; }
      if (s.hurt <= 0) { s.lives--; s.hurt = 1.1; events.push('hit'); s.things.splice(i, 1); continue; }
    }
    if (o.y > 1.15) s.things.splice(i, 1);
  }
  return events;
}

export const runDone = (s) => s.lives <= 0 || s.t >= GOAL;
export const perfOf = (s) => Math.max(0, Math.min(1, (Math.min(s.t, GOAL) / GOAL) * 0.55 + (s.offered ? s.kebabs / s.offered : 1) * 0.25 + (Math.max(0, s.lives) / LIVES) * 0.2));

const ICON = { kebab: '🥙', pigeon: '🐦', puddle: '💦', tram: '🚋' };

export const runnerGame = {
  id: 'runner',
  start(api) {
    const { hud, ctx } = api;
    const view = api.canvas();
    const img = new Image();
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(ctx.seba('after'));
    const s = newRun();
    let x = null, swipe = null;
    api.on(view.cv, 'pointerdown', (e) => { swipe = e.clientX; });
    api.on(view.cv, 'pointerup', (e) => {
      if (swipe === null) return;
      const r = view.cv.getBoundingClientRect(), d = e.clientX - swipe;
      move(s, Math.abs(d) > 30 ? Math.sign(d) : e.clientX - r.left < r.width / 2 ? -1 : 1);
      swipe = null; ctx.audio.sfx('jump');
    });
    api.on(window, 'keydown', (e) => { if (e.key === 'ArrowLeft') move(s, -1); if (e.key === 'ArrowRight') move(s, 1); });
    ctx.audio.music({ kind: 'home', bpm: 96, root: ctx.city.root });

    api.loop((dt) => {
      for (const ev of stepRun(s, dt, ctx.state.drunk)) ctx.audio.sfx(ev === 'kebab' ? 'munch' : 'hit');
      const { g, w, h } = view;
      const dawn = Math.min(1, s.t / GOAL);
      const sky = g.createLinearGradient(0, 0, 0, h);
      sky.addColorStop(0, `rgb(${20 + dawn * 100},${20 + dawn * 110},${60 + dawn * 150})`);
      sky.addColorStop(1, `rgb(${60 + dawn * 190},${40 + dawn * 130},${80 + dawn * 70})`);
      g.fillStyle = sky; g.fillRect(0, 0, w, h);
      const road = w * 0.84, left = (w - road) / 2, lw = road / 3;
      g.fillStyle = '#2e2a3a'; g.fillRect(left, 0, road, h);
      g.fillStyle = '#e8d8a0';
      for (let l = 1; l < 3; l++) for (let y = -60 + ((s.t * h * 0.45) % 60); y < h; y += 60) g.fillRect(left + l * lw - 2, y, 4, 30);
      g.textAlign = 'center'; g.textBaseline = 'middle';
      g.font = `${Math.min(52, lw * 0.55)}px serif`;
      for (const o of s.things) g.fillText(ICON[o.kind], left + lw * (o.lane + 0.5), o.y * h);
      const tx = left + lw * (s.lane + 0.5);
      x = x === null ? tx : x + (tx - x) * Math.min(1, dt * 14);
      g.globalAlpha = s.hurt > 0 && Math.floor(s.t * 12) % 2 ? 0.35 : 1;
      if (img.complete) g.drawImage(img, x - 42, h * 0.82 - 52 + Math.sin(s.t * 12) * 3, 84, 91);
      g.globalAlpha = 1;
      if (s.flip) { g.fillStyle = '#ffe14d'; g.font = '900 20px Arial'; g.fillText(`⇄ ${ctx.t('game.runner.upside')} ⇄`, w / 2, 56); }
      g.fillStyle = '#ffffff33'; g.fillRect(24, 14, w - 48, 8);
      g.fillStyle = '#ffe14d'; g.fillRect(24, 14, (w - 48) * dawn, 8);
      g.font = '18px serif'; g.fillText('🏠', w - 14, 18);
      hud.textContent = `${'❤'.repeat(Math.max(0, s.lives))}  🥙 ${s.kebabs}`;
      if (runDone(s)) api.end(perfOf(s), s.lives === LIVES);
    });
    return () => ctx.audio.music(ctx.homeTrack());
  },
};
