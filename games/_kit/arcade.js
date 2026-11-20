/* Game Kit — arcade shell: menu, HUD, modes, difficulty, records, loop */

import { makeLoop, DIFFICULTY } from './core.js';
import { load, store } from './storage.js';
import { createI18n } from './i18n.js';
import * as AUDIO from './audio.js';
import { FX } from './fx.js';
import { registerSW, setupCanvas } from './pwa.js';

/**
 * createArcade({
 *   root, canvas, str, key, modes:[{id,label}], startLives,
 *   setup(game), update(dt, game), draw(ctx, game, view, t),
 *   onTap(game, x, y), onKey(game, code)
 * })
 */
export function createArcade(opts) {
  const i18n = createI18n(opts.str, opts.defaultLang || 'en');
  const t = i18n.t;
  const view = setupCanvas(opts.canvas);
  const fx = new FX();
  const save = load(opts.key, {
    best: {}, runs: 0, sound: true, difficulty: 'normal', unlocked: []
  });
  save.best = save.best || {};

  const game = {
    status: 'menu', mode: opts.modes[0]?.id || 'classic',
    difficulty: save.difficulty, score: 0, combo: 0, lives: opts.startLives || 3,
    time: 0, data: {}, fx, view, i18n, t, save, opts,
    addScore(n) {
      this.score += Math.round(n * (DIFFICULTY[this.difficulty]?.reward || 1));
      if (this.score > (save.best[this.mode] || 0)) save.best[this.mode] = this.score;
    },
    end(status = 'gameover') {
      this.status = status;
      save.runs++;
      store(opts.key, save);
      AUDIO.sfx[status === 'victory' ? 'win' : 'lose']();
      renderResult(status);
    }
  };

  const root = opts.root;
  root.innerHTML = `
    <canvas id="arcade-canvas"></canvas>
    <div id="arcade-ui">
      <div class="arcade-hud hidden" id="arcade-hud">
        <span><b data-i18n="score">SCORE</b> <em id="arcade-score">0</em></span>
        <span id="arcade-combo"></span>
        <span id="arcade-extra"></span>
      </div>
      <div class="arcade-menu" id="arcade-menu">
        <h1 data-i18n="title">GAME</h1>
        <p class="arcade-sub" data-i18n="subtitle"></p>
        <div class="arcade-modes" id="arcade-modes"></div>
        <div class="arcade-diff" id="arcade-diff"></div>
        <button class="arcade-play" id="arcade-play" data-i18n="play">PLAY</button>
        <div class="arcade-best" id="arcade-best"></div>
        <div class="arcade-foot">
          <button id="arcade-lang">IT / EN</button><button id="arcade-sound">♪</button>
        </div>
      </div>
      <div class="arcade-result hidden" id="arcade-result">
        <h2 id="arcade-result-title"></h2>
        <p id="arcade-result-score"></p>
        <button class="arcade-play" id="arcade-retry" data-i18n="retry">RETRY</button>
        <button id="arcade-menu-btn" data-i18n="menu">MENU</button>
      </div>
    </div>`;
  // Replace the external canvas reference with the one we just created.
  const canvas = root.querySelector('#arcade-canvas');
  const liveView = setupCanvas(canvas);
  game.view = liveView;
  const $ = id => root.querySelector('#' + id);

  function renderModes() {
    $('arcade-modes').innerHTML = opts.modes.map(m =>
      `<button class="${game.mode === m.id ? 'on' : ''}" data-mode="${m.id}">${t(m.label)}</button>`).join('');
    $('arcade-modes').querySelectorAll('button').forEach(b => b.onclick = () => {
      game.mode = b.dataset.mode; renderModes(); renderBest();
    });
  }
  function renderDiff() {
    $('arcade-diff').innerHTML = Object.keys(DIFFICULTY).map(k =>
      `<button class="${game.difficulty === k ? 'on' : ''}" data-diff="${k}">${t(k)}</button>`).join('');
    $('arcade-diff').querySelectorAll('button').forEach(b => b.onclick = () => {
      game.difficulty = b.dataset.diff; save.difficulty = game.difficulty;
      store(opts.key, save); renderDiff();
    });
  }
  function renderBest() {
    $('arcade-best').textContent = `${t('best')}: ${save.best[game.mode] || 0}`;
  }
  function renderResult(status) {
    $('arcade-result-title').textContent = status === 'victory' ? t('win') : t('lose');
    $('arcade-result-score').textContent = `${t('score')}: ${game.score}`;
    $('arcade-result').classList.remove('hidden');
    $('arcade-hud').classList.add('hidden');
  }
  function start() {
    AUDIO.init(save.sound); AUDIO.resume();
    game.status = 'playing';
    game.score = 0; game.combo = 0; game.lives = opts.startLives || 3;
    game.time = 0; game.data = {};
    fx.particles.length = 0; fx.floaters.length = 0;
    opts.setup?.(game);
    $('arcade-menu').classList.add('hidden');
    $('arcade-result').classList.add('hidden');
    $('arcade-hud').classList.remove('hidden');
    $('arcade-extra').textContent = '';
  }
  function toMenu() {
    game.status = 'menu';
    $('arcade-menu').classList.remove('hidden');
    $('arcade-result').classList.add('hidden');
    $('arcade-hud').classList.add('hidden');
    renderBest();
  }

  let time = 0;
  const loop = makeLoop(dt => {
    if (game.status !== 'playing') return;
    game.time += dt; time += dt;
    opts.update?.(dt, game);
  }, () => {
    const ctx = liveView.ctx;
    ctx.clearRect(0, 0, liveView.w, liveView.h);
    if (Object.keys(game.data || {}).length) opts.draw?.(ctx, game, liveView, time);
    fx.update(); fx.draw(ctx);
    $('arcade-score').textContent = game.score;
    $('arcade-combo').textContent = game.combo > 1 ? `${t('combo')} ×${game.combo}` : '';
  });
  loop.start();

  $('arcade-play').onclick = start;
  $('arcade-retry').onclick = start;
  $('arcade-menu-btn').onclick = toMenu;
  $('arcade-lang').onclick = () => i18n.setLang(i18n.getLang() === 'it' ? 'en' : 'it');
  $('arcade-sound').onclick = () => {
    save.sound = !save.sound; store(opts.key, save);
    AUDIO.setSound(save.sound);
    $('arcade-sound').textContent = save.sound ? '♪' : '✕';
  };
  canvas.addEventListener('pointerdown', e => {
    if (game.status !== 'playing') return;
    const r = canvas.getBoundingClientRect();
    opts.onTap?.(game, e.clientX - r.left, e.clientY - r.top);
  });
  document.addEventListener('keydown', e => {
    if (game.status !== 'playing') return;
    if (e.code === 'Space' || e.code === 'ArrowUp') e.preventDefault();
    opts.onKey?.(game, e.code);
  });
  i18n.onChange(() => {
    i18n.apply(root); renderModes(); renderDiff(); renderBest();
    $('arcade-sound').textContent = save.sound ? '♪' : '✕';
    $('arcade-lang').textContent = t('lang');
  });
  i18n.apply(root);
  renderModes(); renderDiff(); renderBest();
  $('arcade-sound').textContent = save.sound ? '♪' : '✕';
  AUDIO.setSound(save.sound);
  registerSW();

  return { game, start, toMenu, i18n, fx, view: liveView };
}
