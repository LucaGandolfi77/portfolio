/* RPG Adventure — glass HUD, inventory, quests, shop and dialogs */
import { ITEMS, SKILLS, QUESTS, ZONES } from './config.js';
import { t, getLang, applyStatic } from './i18n.js';
import { getItem, stats } from './core/progression.js';

const $ = id => document.getElementById(id);
let H = {};

export function toast(msg, warn = false) {
  const el = document.createElement('div');
  el.className = 'toast' + (warn ? ' warn' : '');
  el.textContent = msg;
  $('toasts').appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; setTimeout(() => el.remove(), 320); }, 2200);
}
export function esc(s) { return String(s ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[c]); }
export function showModal(id) { $(id).classList.add('on'); }
export function closeModal(id) { $(id).classList.remove('on'); }
export function anyModalOpen() { return !!document.querySelector('.modal.on'); }

export function renderHUD(state, zone) {
  $('hpFill').style.width = Math.max(0, state.hp / state.maxHp * 100) + '%';
  $('manaFill').style.width = Math.max(0, state.mana / state.maxMana * 100) + '%';
  const need = 60 + (state.level - 1) * 45;
  $('xpFill').style.width = Math.min(100, state.xp / need * 100) + '%';
  $('hpText').textContent = Math.ceil(state.hp) + '/' + state.maxHp;
  $('manaText').textContent = Math.ceil(state.mana) + '/' + state.maxMana;
  $('levelText').textContent = String(state.level);
  $('goldText').textContent = String(state.gold);
  $('zoneName').textContent = zone[getLang()];
}
export function setCombo(combo) {
  const el = $('comboTag');
  el.classList.toggle('hidden', combo < 2);
  el.textContent = '×' + combo;
}
export function setFps(v) { $('fpsText').textContent = v ? v + ' ' + t('fps') : ''; }
export function setEnemies(n) { $('enemyCount').textContent = n ? `${t('enemyRemaining')}: ${n}` : ''; }

export function buildSkillBar() {
  const lang = getLang();
  $('skillBar').innerHTML = SKILLS.map((s, i) =>
    `<button class="skill" data-act="skill${i}" title="${esc(s[lang])}">
       <span class="num">${i + 1}</span><span>${s.icon}</span><span class="cd hidden"></span>
     </button>`).join('');
  $('skillBar').querySelectorAll('[data-act]').forEach(b => {
    b.addEventListener('pointerdown', e => {
      e.preventDefault();
      H[b.dataset.act]?.();
      b.classList.add('pressed');
    });
    const clear = () => b.classList.remove('pressed');
    b.addEventListener('pointerup', clear);
    b.addEventListener('pointercancel', clear);
    b.addEventListener('pointerleave', clear);
  });
}
export function updateSkills(state) {
  SKILLS.forEach((s, i) => {
    const el = document.querySelector(`[data-act="skill${i}"] .cd`);
    if (!el) return;
    const cd = state.cooldowns[s.id] || 0;
    el.classList.toggle('hidden', cd <= 0);
    el.textContent = cd > 0 ? String(Math.ceil(cd)) : '';
  });
}

export function renderInventory(state) {
  const lang = getLang(), st = stats(state);
  $('invEquip').innerHTML = ['weapon','armor','shield','accessory'].map(slot => {
    const id = state.equipment[slot];
    const item = getItem(id);
    return `<div class="equip-slot"><b>${item?.icon || '·'}</b>${slot}<br><span>${item ? esc(item[lang]) : '—'}</span></div>`;
  }).join('') + `<div class="equip-slot"><b>⚔️</b>${t('attack')}<br><span>${st.attack}</span></div>
    <div class="equip-slot"><b>🛡️</b>${t('defense')}<br><span>${st.defense}</span></div>`;
  if (!state.inventory.length) { $('invList').innerHTML = `<p>${t('emptyInv')}</p>`; return; }
  $('invList').innerHTML = state.inventory.map((slot, i) => {
    const item = getItem(slot.itemId);
    return `<div class="inv-item"><span class="ico">${item.icon}</span>
      <span class="nm">${esc(item[lang])}</span><span class="qty">×${slot.quantity}</span>
      <span class="row">
        ${item.type === 'consumable' ? `<button data-use="${i}">${t('use')}</button>` : ''}
        ${item.slot ? `<button data-equip="${i}">${t('equip')}</button>` : ''}
        <button data-drop="${i}">${t('drop')}</button>
      </span></div>`;
  }).join('');
  $('invList').querySelectorAll('[data-use]').forEach(b => b.onclick = () => H.use(+b.dataset.use));
  $('invList').querySelectorAll('[data-equip]').forEach(b => b.onclick = () => H.equip(+b.dataset.equip));
  $('invList').querySelectorAll('[data-drop]').forEach(b => b.onclick = () => H.drop(+b.dataset.drop));
}

export function renderQuests(state) {
  const lang = getLang();
  const rows = QUESTS.map(q => {
    const cur = state.quests[q.id] || 0;
    const done = state.claimed.includes(q.id);
    return `<div class="quest-row ${done ? 'done' : ''}">
      <b>${esc(q[lang])}</b> — ${done ? '✅' : esc(q[lang + 'Desc'])}
      <div class="qbar"><i style="width:${Math.min(100, cur / q.goal * 100)}%"></i></div>
      <small>${cur} / ${q.goal} · 🪙 ${q.reward}</small>
      ${cur >= q.goal && !done ? `<button class="tbtn big wide" data-claim="${q.id}">${t('ok')}</button>` : ''}
    </div>`;
  });
  $('questList').innerHTML = rows.join('') || `<p>${t('emptyQuest')}</p>`;
  $('questList').querySelectorAll('[data-claim]').forEach(b => b.onclick = () => H.claim(b.dataset.claim));
}

export function renderShop(zone, state) {
  const lang = getLang();
  const shop = ITEMS.filter(i => i.price && i.price < 90);
  $('shopList').innerHTML = `<p>${t('shopText')}</p>` + shop.map(item =>
    `<div class="shop-item"><span>${item.icon} ${esc(item[lang])}</span>
      <span>🪙 ${item.price}</span>
      <button class="tbtn" data-buy="${item.id}" ${state.gold < item.price ? 'disabled' : ''}>${t('buy')}</button></div>`).join('');
  $('shopList').querySelectorAll('[data-buy]').forEach(b => b.onclick = () => H.buy(b.dataset.buy));
}

export function showDialog(name, text) {
  $('dialogName').textContent = name;
  $('dialogText').textContent = text;
  $('shopList').innerHTML = '';
  showModal('dialogModal');
}

export function initUI(handlers) {
  H = handlers;
  applyStatic(document);
  $('helpText').textContent = t('helpText');
  buildSkillBar();
  $('btnQuests').onclick = () => { renderQuests(H.state()); showModal('questsModal'); };
  $('btnInventory').onclick = () => { renderInventory(H.state()); showModal('inventoryModal'); };
  $('btnPause').onclick = () => H.pause(true);
  $('btnResume').onclick = () => H.pause(false);
  $('btnResetSave').onclick = H.reset;
  $('btnSettings').onclick = () => showModal('settingsModal');
  $('btnHelp').onclick = () => showModal('helpModal');
  $('btnLang').onclick = H.lang;
  $('btnTheme').onclick = H.theme;
  $('btnRetry').onclick = H.retry;
  $('soundCheck').onchange = e => H.prefs({ sound: e.target.checked });
  $('vibrateCheck').onchange = e => H.prefs({ vibration: e.target.checked });
  $('motionCheck').onchange = e => H.prefs({ reducedMotion: e.target.checked });
  $('fpsCheck').onchange = e => H.prefs({ showFps: e.target.checked });
  document.querySelectorAll('[data-close]').forEach(b => b.onclick = () => {
    closeModal(b.dataset.close);
    if (b.dataset.close === 'pauseModal') H.pause(false);
  });
  document.querySelectorAll('.modal').forEach(m => m.addEventListener('click', e => {
    if (e.target === m) { closeModal(m.id); if (m.id === 'pauseModal') H.pause(false); }
  }));
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    const open = document.querySelector('.modal.on');
    if (open) { closeModal(open.id); if (open.id === 'pauseModal') H.pause(false); }
  });
  window.addEventListener('rpg:langchange', () => {
    applyStatic(document);
    $('helpText').textContent = t('helpText');
    buildSkillBar();
    H.renderAll();
  });
}

export const ui = { initUI, toast, esc, showModal, closeModal, anyModalOpen, renderHUD, setCombo,
  setFps, setEnemies, buildSkillBar, updateSkills, renderInventory, renderQuests, renderShop,
  showDialog };
