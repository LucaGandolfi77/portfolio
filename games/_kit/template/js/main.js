import { STR } from './config.js';
import { state, save, record } from './state.js';
import { Engine } from './engine.js';
import { makeLoop } from '../../core.js';
import { createI18n } from '../../i18n.js';
import * as AUDIO from '../../audio.js';
import { FX } from '../../fx.js';
import { registerSW, setupCanvas } from '../../pwa.js';

const i18n = createI18n(STR, 'en');
const view = setupCanvas(document.getElementById('game'));
const fx = new FX();
const engine = new Engine({
  onEvent(type) {
    if (type === 'hit') { AUDIO.sfx.good(); fx.burst(200, 300, '#4de8ff', 12); }
  },
  onStatus(status) {
    if (status === 'gameover') { AUDIO.sfx.lose(); record(engine.score); }
  }
});

function draw() {
  const { ctx, w, h } = view;
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#121838';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#4de8ff';
  ctx.beginPath(); ctx.arc(engine.player.x, engine.player.y, 14, 0, Math.PI * 2); ctx.fill();
  fx.update(); fx.draw(ctx);
  document.getElementById('score').textContent = engine.score;
}

const loop = makeLoop(dt => { engine.update(dt); }, draw);
document.getElementById('play').onclick = () => {
  AUDIO.init(state.sound); AUDIO.resume();
  document.getElementById('menu').classList.add('hidden');
  engine.start(); loop.start();
};
document.getElementById('game').onclick = () => engine.hit();
i18n.apply();
i18n.onChange(() => i18n.apply());
registerSW();
