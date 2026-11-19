/* HUD: aggiornamenti mirati, nessun innerHTML a ogni tick. */
import { formatNum } from '../config.js';

export function html() {
  return `
  <header class="topbar">
    <button class="icon-btn" data-action="menu" aria-label="Menu">☰</button>
    <div class="brand">
      <span class="brand-mark">🛋️⚽</span>
      <div><div class="brand-name">FANTAPANCHINA</div><div class="brand-sub">il fantacalcio che gioca da solo</div></div>
    </div>
    <div class="wallet">
      <div class="wallet-item fc"><span class="w-ico">💸</span><span class="w-val" id="hud-fc">0</span><span class="w-lab">FC</span></div>
      <div class="wallet-item fp"><span class="w-ico">⭐</span><span class="w-val" id="hud-fp">0</span><span class="w-lab">FP</span></div>
      <div class="wallet-item ips"><span class="w-ico">⚡</span><span class="w-val" id="hud-ips">0</span><span class="w-lab">/s</span></div>
    </div>
    <button class="icon-btn" data-action="sound" id="hud-sound" aria-label="Audio">🔊</button>
  </header>
  <div class="timer-strip">
    <div class="timer-fill" id="hud-timer-fill"></div>
    <div class="timer-label"><span id="hud-timer-text">Giornata tra 3:00</span><span class="timer-g" id="hud-giornata">Giornata 0</span></div>
  </div>`;
}

export function update(state, ips, timeToNext) {
  const set = (id, v) => { const el = document.getElementById(id); if (el && el.textContent !== v) el.textContent = v; };
  set('hud-fc', formatNum(state.fc));
  set('hud-fp', formatNum(state.fp));
  set('hud-ips', formatNum(ips));
  set('hud-giornata', 'Giornata ' + state.giornata);
  const secs = Math.max(0, Math.ceil(timeToNext / 1000));
  const mm = String(Math.floor(secs / 60)).padStart(2, '0');
  const ss = String(secs % 60).padStart(2, '0');
  set('hud-timer-text', 'Giornata tra ' + mm + ':' + ss);
  const fill = document.getElementById('hud-timer-fill');
  if (fill) fill.style.width = ((1 - timeToNext / 180000) * 100).toFixed(2) + '%';
  const sound = document.getElementById('hud-sound');
  if (sound) sound.textContent = state.settings.sound ? '🔊' : '🔇';
}
