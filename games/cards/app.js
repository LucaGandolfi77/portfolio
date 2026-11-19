/* Card Collector — bootstrap and wiring */

import { load, subscribe, state } from './state.js';
import { initEffects, toast } from './effects.js';
import { refreshDaily } from './economy.js';
import { openBox } from './shop.js';
import { addToDeck, removeFromDeck, upgradeCard } from './collection.js';
import { initUI, renderAll, showBoxReveal, showSection } from './ui.js';
import { drawWheel, spin as spinWheel } from './fortune.js';
import { initSlot, adjustBet, spin as spinSlots } from './slot.js';
import { initMegaBattle, closeMegaBattle } from './mega_battle.js';
import { initScopaBattle } from './scopa_battle.js';

load();
initEffects();

initUI({
  onBuyBox(box, currency) {
    const cards = openBox(box, currency);
    if (cards) showBoxReveal(cards);
  },
  onAddToDeck(id, mode) { addToDeck(id, mode); },
  onRemoveFromDeck(id, mode) { removeFromDeck(id, mode); },
  onUpgrade(id) { upgradeCard(id); }
});

subscribe(renderAll);

const wheelCanvas = document.getElementById('wheelCanvas');
drawWheel(wheelCanvas);
document.getElementById('spinWheel1').onclick = () => spinWheel(1, wheelCanvas, showWheelResult);
document.getElementById('spinWheel10').onclick = () => spinWheel(10, wheelCanvas, showWheelResult);

initSlot(document.getElementById('slotGrid'));
updateBet();
document.getElementById('betDown').onclick = () => { adjustBet(-100); updateBet(); };
document.getElementById('betUp').onclick = () => { adjustBet(100); updateBet(); };
document.getElementById('spinSlotBtn').onclick = async () => {
  const btn = document.getElementById('spinSlotBtn');
  btn.disabled = true;
  document.getElementById('slotInfo').textContent = '…';
  spinSlots(result => {
    btn.disabled = false;
    if (result.error) { toast(result.error, 'error'); return; }
    const parts = [result.totalWin > 0 ? `+${result.totalWin}` : '0'];
    if (result.lines) parts.push(result.lines + 'x');
    if (result.card) parts.push(result.card.emoji + ' ' + result.card.name);
    document.getElementById('slotInfo').textContent = parts.join(' · ');
  });
};

document.getElementById('btnStartScopa').onclick = () => initScopaBattle();
document.getElementById('btnStartMega').onclick = () => initMegaBattle();
document.getElementById('btnCloseMega').onclick = () => closeMegaBattle();
document.getElementById('btnMegaRematch').onclick = () => initMegaBattle();

function updateBet() {
  document.getElementById('currentBet').textContent = state.data.slotBet.toLocaleString();
}

function showWheelResult(results) {
  const lines = results.map(r => {
    if (r.card) return `${r.card.emoji} ${r.card.name}`;
    if (r.type === 'gold' || r.type === 'gems') return `${r.label} → +${r.amount}`;
    return r.label;
  });
  document.getElementById('spinResult').textContent = lines.join('\n');
  renderAll();
}

window.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  document.getElementById('cardModal')?.classList.remove('active');
  document.getElementById('boxOverlay')?.classList.remove('active');
});

refreshDaily();
renderAll();
