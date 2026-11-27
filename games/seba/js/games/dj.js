/* ============================================================
   Seba — the decks: four lanes of falling records
   ============================================================ */
import { el } from './shell.js';

export const LANES = 4;
export const WINDOW = { perfect: 0.08, good: 0.17 };
export const COLORS = ['#ff3f81', '#ffe14d', '#2fd1ff', '#2fd18a'];
const FALL = 1.7;   // seconds from the top to the line

/** A deterministic chart: mostly on the beat, with off-beats as it heats up. */
export function makeChart(bpm, seed = 1, bars = 12) {
  let s = (seed % 2147483646) + 1;
  const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const beat = 60 / bpm, notes = [];
  let lane = 0;
  for (let b = 0; b < bars * 4; b++) {
    const heat = b / (bars * 4);
    if (b % 8 === 7 && heat < 0.5) continue;
    lane = (lane + 1 + Math.floor(rnd() * (LANES - 1))) % LANES;
    notes.push({ t: 2 + b * beat, lane });
    if (heat > 0.35 && rnd() < heat * 0.45) notes.push({ t: 2 + (b + 0.5) * beat, lane: (lane + 2) % LANES });
  }
  return notes;
}

export const judge = (delta) => { const d = Math.abs(delta); return d <= WINDOW.perfect ? 'perfect' : d <= WINDOW.good ? 'good' : null; };
export const perfOf = (perfect, good, total, strays = 0) => (total ? Math.max(0, (perfect + good * 0.65 - strays * 0.25) / total) : 0);

export const djGame = {
  id: 'dj',
  start(api) {
    const { stage, hud, ctx } = api;
    const view = api.canvas();
    const pads = el('div', 'dj-pads');
    const notes = makeChart(ctx.city.bpm, Math.floor(Math.random() * 1e6) + 1).map((n) => ({ ...n, state: null }));
    const end = notes[notes.length - 1].t + 1.2;
    let t = 0, perfect = 0, good = 0, miss = 0, strays = 0, combo = 0, flash = '', flashT = 0;
    const lit = [0, 0, 0, 0];

    const hit = (lane) => {
      lit[lane] = 0.15;
      const n = notes.find((x) => !x.state && x.lane === lane && Math.abs(x.t - t) <= WINDOW.good);
      if (!n) { strays++; combo = 0; ctx.audio.sfx('tap'); return; }
      n.state = judge(n.t - t);
      if (n.state === 'perfect') perfect++; else good++;
      combo++;
      flash = n.state === 'perfect' ? '★ PERFECT' : 'GOOD'; flashT = 0.5;
      ctx.audio.sfx('note', [0, 3, 7, 10][lane]);
    };
    COLORS.forEach((c, i) => {
      const b = el('button', 'pad', 'DFJK'[i]); b.type = 'button'; b.dataset.lane = i; b.style.setProperty('--c', c);
      api.on(b, 'pointerdown', (e) => { e.preventDefault(); hit(i); });
      pads.appendChild(b);
    });
    stage.appendChild(pads);
    api.on(window, 'keydown', (e) => { const i = ['d', 'f', 'j', 'k'].indexOf(e.key.toLowerCase()); if (i >= 0 && !e.repeat) hit(i); });
    ctx.audio.music({ kind: 'rave', bpm: ctx.city.bpm, root: ctx.city.root });

    api.loop((dt) => {
      t += dt; flashT -= dt;
      const { g, w, h } = view;
      const lineY = h - 112, lw = w / LANES;
      g.fillStyle = '#0b0718'; g.fillRect(0, 0, w, h);
      const pulse = Math.max(0, 1 - ((t * ctx.city.bpm) / 60 % 1) * 2);
      for (let i = 0; i < LANES; i++) {
        lit[i] = Math.max(0, lit[i] - dt);
        g.fillStyle = COLORS[i] + (lit[i] > 0 ? '44' : i % 2 ? '10' : '18'); g.fillRect(i * lw, 0, lw, h);
      }
      g.fillStyle = `rgba(255,255,255,${0.35 + pulse * 0.5})`; g.fillRect(0, lineY - 2, w, 4);
      for (const n of notes) {
        if (!n.state && t - n.t > WINDOW.good) { n.state = 'miss'; miss++; combo = 0; flash = '✕'; flashT = 0.3; }
        if (n.state) continue;
        const y = lineY - ((n.t - t) / FALL) * lineY;
        if (y < -30) continue;
        const x = n.lane * lw + lw / 2, r = Math.min(26, lw * 0.34);
        g.fillStyle = COLORS[n.lane]; g.beginPath(); g.arc(x, y, r, 0, 6.283); g.fill();
        g.fillStyle = '#0b0718'; g.beginPath(); g.arc(x, y, r * 0.62, 0, 6.283); g.fill();
        g.fillStyle = '#fff'; g.beginPath(); g.arc(x, y, r * 0.18, 0, 6.283); g.fill();
      }
      if (flashT > 0) { g.fillStyle = '#fff'; g.font = '900 26px Arial'; g.textAlign = 'center'; g.fillText(flash, w / 2, lineY - 60); }
      hud.textContent = `×${combo}  ${perfect + good}/${notes.length}`;
      if (t >= end) api.end(perfOf(perfect, good, notes.length, strays), miss === 0 && strays === 0);
    });
    return () => ctx.audio.music(ctx.homeTrack());
  },
};
