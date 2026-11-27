/* ============================================================
   Seba — the dance floor: dodge the elbows, grab the water
   ============================================================ */
export const DURATION = 30;
export const LIVES = 3;
const BAD = ['🕺', '💃', '🤳', '🥴'];
const GOOD = { water: '💧', stick: '✨' };

export const collides = (ax, ay, bx, by, r) => (ax - bx) ** 2 + (ay - by) ** 2 <= r * r;
export const perfOf = (survived, picked, spawned, lives) =>
  Math.max(0, Math.min(1, (survived / DURATION) * 0.5 + (spawned ? Math.min(1, picked / (spawned * 0.75)) : 0) * 0.35 + (lives / LIVES) * 0.15));

export const danceGame = {
  id: 'dance',
  start(api) {
    const { hud, ctx } = api;
    const view = api.canvas();
    const img = new Image();
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(ctx.seba('hype'));
    let x = view.w / 2, target = x, t = 0, lives = LIVES, picked = 0, spawned = 0, next = 0.6, hurt = 0, keys = 0;
    const things = [];
    const wobble = Math.max(0, ctx.state.drunk - 40) / 60;
    const point = (e) => { const r = view.cv.getBoundingClientRect(); target = e.clientX - r.left; };
    api.on(view.cv, 'pointerdown', (e) => { view.cv.setPointerCapture?.(e.pointerId); point(e); });
    api.on(view.cv, 'pointermove', (e) => { if (e.buttons || e.pointerType === 'mouse') point(e); });
    api.on(window, 'keydown', (e) => { if (e.key === 'ArrowLeft') keys = -1; if (e.key === 'ArrowRight') keys = 1; });
    api.on(window, 'keyup', (e) => { if (e.key.startsWith('Arrow')) keys = 0; });
    ctx.audio.music({ kind: 'rave', bpm: ctx.city.bpm, root: ctx.city.root });

    api.loop((dt) => {
      t += dt; hurt = Math.max(0, hurt - dt);
      const { g, w, h } = view;
      if (keys) target = Math.max(0, Math.min(w, target + keys * 360 * dt));
      const sway = Math.sin(t * 2.3) * 60 * wobble;
      x += (Math.max(30, Math.min(w - 30, target + sway)) - x) * Math.min(1, dt * 12);
      next -= dt;
      if (next <= 0) {
        next = 0.62 - (t / DURATION) * 0.28;
        const roll = Math.random();
        const kind = roll < 0.18 ? 'water' : roll < 0.36 ? 'stick' : 'bad';
        if (kind !== 'bad') spawned++;
        things.push({ kind, x: 28 + Math.random() * (w - 56), y: -30, v: 150 + t * 4 + Math.random() * 60, icon: kind === 'bad' ? BAD[Math.floor(Math.random() * BAD.length)] : GOOD[kind], phase: Math.random() * 6 });
      }
      const py = h - 74;
      const beat = (t * ctx.city.bpm) / 60;
      g.fillStyle = '#0d0820'; g.fillRect(0, 0, w, h);
      const tile = w / 6;
      for (let i = 0; i < 6; i++) for (let j = 0; j < Math.ceil(h / tile); j++) {
        const on = (i * 3 + j * 5 + Math.floor(beat)) % 7 === 0;
        g.fillStyle = on ? ['#ff3f8155', '#2fd1ff55', '#ffe14d44'][(i + j) % 3] : (i + j) % 2 ? '#181032' : '#130c28';
        g.fillRect(i * tile + 1, j * tile + 1, tile - 2, tile - 2);
      }
      g.font = '38px serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
      for (let i = things.length - 1; i >= 0; i--) {
        const o = things[i];
        o.y += o.v * dt;
        const ox = o.x + (o.kind === 'bad' ? Math.sin(t * 3 + o.phase) * 26 : 0);
        g.fillText(o.icon, ox, o.y);
        if (collides(x, py, ox, o.y, 44)) {
          if (o.kind === 'bad') { if (hurt > 0) continue; lives--; hurt = 1; ctx.audio.sfx('hit'); }
          else { picked++; ctx.audio.sfx(o.kind === 'water' ? 'water' : 'coin'); if (o.kind === 'water') ctx.state.drunk = Math.max(0, ctx.state.drunk - 4); }
          things.splice(i, 1);
        } else if (o.y > h + 40) things.splice(i, 1);
      }
      const bob = Math.abs(Math.sin(beat * Math.PI)) * 10;
      g.globalAlpha = hurt > 0 && Math.floor(t * 12) % 2 ? 0.35 : 1;
      if (img.complete) g.drawImage(img, x - 46, py - 58 - bob, 92, 100);
      g.globalAlpha = 1;
      hud.textContent = `${'❤'.repeat(Math.max(0, lives))}  💧✨ ${picked}  ${Math.ceil(DURATION - t)}s`;
      if (lives <= 0 || t >= DURATION) api.end(perfOf(t, picked, spawned, Math.max(0, lives)), lives === LIVES);
    });
    return () => ctx.audio.music(ctx.homeTrack());
  },
};
