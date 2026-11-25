/* Slot Collect — bootstrap: store ↔ UI ↔ renderer ↔ audio */

import { STR, SYMBOLS } from './config.js';
import { createStore } from './state.js';
import { createUI } from './ui.js';
import { Renderer } from './render/renderer.js';
import { makeLoop } from '../../_kit/core.js';
import * as AUDIO from './audio.js';

const root = document.getElementById('app');
const store = createStore();
const ui = createUI(root, { str: STR, dispatch: a => store.dispatch(a) });
const renderer = new Renderer(ui.canvas);
let sound = store.get().save.sound !== false;
let lastPhase = 'menu', autoTimer = 0;

AUDIO.init(sound);
AUDIO.setSound(sound);
AUDIO.startMusic();

root.addEventListener('slot:sound', () => {
  sound = !sound;
  store.get().save.sound = sound;
  AUDIO.setSound(sound);
  ui.render(store.get());
});
root.addEventListener('slot:lang', () => ui.render(store.get()));

store.subscribe((state, action) => {
  ui.render(state, action);
  if (!action) return;
  if (action.type === 'SPIN') { AUDIO.sfx.spin(); renderer.p.hit(2); }
  if (action.type === 'BET' || action.type === 'UPGRADE') AUDIO.sfx.tap();
  if (action.type === 'CASH') AUDIO.sfx.bank();
  if (action.type === 'TICK' && state.phase === 'resolving' && lastPhase === 'spinning') {
    const res = state.result;
    if (res?.lines?.length) {
      renderer.celebrate(state, res);
      AUDIO.sfx[res.total > 120 ? 'jackpot' : 'win']();
      for (let i = 0; i < res.lines.length; i++) setTimeout(() => AUDIO.sfx.line(), i * 90);
    } else AUDIO.sfx.miss();
    if (res?.freeSpins) setTimeout(() => AUDIO.sfx.free(), 250);
  }
  lastPhase = state.phase;
});

const loop = makeLoop(dt => {
  const s = store.get();
  if (s.phase === 'spinning' || s.phase === 'resolving') store.dispatch({ type:'TICK', dt });
  if (s.run?.auto && s.phase === 'idle') {
    autoTimer += dt;
    if (autoTimer >= 0.55) { autoTimer = 0; store.dispatch({ type:'SPIN' }); }
  } else autoTimer = 0;
}, () => {
  const s = store.get();
  renderer.draw(s, performance.now() / 1000, 1 / 60);
});
loop.start();
ui.render(store.get());

// expose a tiny debug surface for smoke tests
window.__slot = { store, renderer, ui };
