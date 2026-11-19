/* Arrowmatic — screens, HUD, draft, onboarding and mobile app panels */

import { G, SV, save, resetSave, exportSave, importSave } from './state.js';
import { WEAPONS, HEROES, ACCS, META_UPG, MAXLVL, DRAFT, AUTO_PRICE, DAILY_REWARDS } from './data.js';
import { AU } from './audio.js';
import { t, getLang, setLang, applyI18n } from './i18n.js';
import { dailyState, claimDaily, missionList, claimMission, achievementList, checkAchievements, refreshDaily } from './progression.js';

const $ = id => document.getElementById(id);
let draftDone = () => {};
let bannerTimer = 0;

export function setDraftDone(fn) { draftDone = fn; }

export function fmt(n) { return Math.floor(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }

export function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.toggle('on', s.id === id));
  document.body.dataset.screen = id || 'none';
}

export function toast(message, color = '#fff', ms = 1800) {
  const el = $('banner');
  if (!el) return;
  el.textContent = message;
  el.style.color = color;
  el.classList.remove('on');
  void el.offsetWidth;
  el.classList.add('on');
  clearTimeout(bannerTimer);
  bannerTimer = setTimeout(() => el.classList.remove('on'), ms);
}

export function banner(message, color) { toast(message, color, 1400); }

export function setBossUI(boss) {
  const wrap = $('bosswrap');
  if (!wrap) return;
  wrap.classList.toggle('on', !!boss);
  if (boss) {
    $('bossname').textContent = boss.name;
    $('bossfill').style.width = '100%';
  }
}

export function updHud() {
  const P = G.P;
  if (!P) return;
  $('hpv').textContent = Math.max(0, Math.ceil(P.hp)) + '/' + P.maxHp;
  $('hLv').textContent = G.run.level + '-' + G.run.wave;
  $('coinv').textContent = G.run.coins;
  $('hWave').textContent = t('wave') + ' ' + Math.min(G.run.wave, G.run.waves) + '/' + G.run.waves;
  const pct = Math.min(100, P.xp / P.xpNeed * 100) + '%';
  if ($('xpfill').style.width !== pct) $('xpfill').style.width = pct;
  if (G.bossRef) {
    const bp = Math.max(0, G.bossRef.hp / G.bossRef.maxHp * 100) + '%';
    if ($('bossfill').style.width !== bp) $('bossfill').style.width = bp;
  }
  $('autotag').style.display = SV.auto.on ? 'block' : 'none';
}

export function openDraft() {
  G.paused = true;
  releaseJoy();
  const pool = DRAFT.filter(d => !(d.id === 'movefire' && G.P.moveFire));
  const weighted = [];
  pool.forEach(d => {
    const weight = d.w * (G.P.luck > 1 && (d.r === 'epico' || d.r === 'leggendaria') ? 1.8 : 1);
    for (let i = 0; i < Math.ceil(weight * 10); i++) weighted.push(d);
  });
  const picks = [];
  while (picks.length < 3 && weighted.length) {
    const d = weighted[Math.floor(Math.random() * weighted.length)];
    if (!picks.includes(d)) picks.push(d);
    if (pool.every(x => picks.includes(x))) break;
  }
  const box = $('draftCards');
  box.innerHTML = '';
  picks.forEach(d => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'dcard' + (d.lego ? ' lego' : '');
    button.style.setProperty('--cc', d.cc);
    button.innerHTML = `<span class="ic">${d.ic}</span><span class="nm">${d.nm}</span><span class="ds">${d.ds}</span><span class="rar">${d.r}</span>`;
    button.onclick = () => {
      d.f(G.P);
      AU.draft();
      if (d.lego) AU.lego();
      $('draft').classList.remove('on');
      G.paused = false;
      G.floats.push({ x: G.P.x, y: G.P.y - 30, txt: d.ic + ' ' + d.nm, life: 1.2, col: '#fff' });
      draftDone();
    };
    box.appendChild(button);
  });
  const reroll = $('draftReroll');
  const n = G.P.rerolls || 0;
  reroll.hidden = n <= 0;
  $('rerollN').textContent = n;
  reroll.onclick = () => { if (G.P.rerolls > 0) { G.P.rerolls--; openDraft(); } };
  $('draft').classList.add('on');
  AU.lvl();
}

export function releaseJoy() {
  G.joy.on = false;
  G.joy.dx = 0;
  G.joy.dy = 0;
}

export function refreshHub() {
  $('tCoins').textContent = fmt(SV.coins);
  $('tBest').textContent = SV.bestLv;
  $('sRuns').textContent = SV.runs;
  $('sKills').textContent = SV.kills;
  $('autoLock').textContent = SV.auto.unlocked
    ? (SV.auto.on ? t('autoOn') : t('autoOff'))
    : '🪙' + AUTO_PRICE;
  $('mAuto').classList.toggle('onx', SV.auto.on && SV.auto.unlocked);
  $('autoSub').textContent = SV.auto.unlocked ? t('autoSub') : t('autoLocked');

  const mon = window.Monetization;
  if (mon && mon.isFull()) {
    const btn = $('mFull');
    btn.classList.add('owned');
    btn.querySelector('small').textContent = t('fullOwned');
    btn.querySelector('.lock').textContent = '✅ ' + t('unlocked');
  }

  const daily = dailyState();
  $('dailySub').textContent = daily.canClaim ? `🎁 +${daily.reward} · ${daily.streak} ${t('streak')}` : `✅ ${t('claimed')} · ${daily.streak} ${t('streak')}`;
  const missions = missionList();
  const ready = missions.filter(m => m.done && !m.claimed).length;
  $('missionSub').textContent = ready > 0 ? `✅ ${ready} ${t('claim')}` : `${missions.filter(m => !m.claimed).length} attive`;
  const achievements = achievementList();
  $('achSub').textContent = `${achievements.filter(a => a.unlocked).length}/${achievements.length}`;
}

function buildContracts(list, boxId, renderer, handler) {
  const box = $(boxId);
  if (!box) return;
  box.innerHTML = '';
  list.forEach(entry => box.appendChild(renderer(entry, handler)));
}

function itemRow({ icon, title, desc, price, selected, maxed, locked, dots }) {
  const row = document.createElement('button');
  row.type = 'button';
  row.className = 'item' + (selected ? ' sel' : '') + (locked ? ' mono-locked' : '');
  const dotsHtml = dots ? `<div class="lvlDots">${Array.from({ length: MAXLVL }, (_, i) => `<i class="${i < dots ? 'f' : ''}"></i>`).join('')}</div>` : '';
  row.innerHTML = `<span class="ic">${icon}</span><span class="tx"><span class="nm">${title}</span><span class="ds">${desc}</span>${dotsHtml}</span><span class="pr ${maxed ? '' : ''}">${price}</span>`;
  return row;
}

export function buildUpgrades() {
  const box = $('upgList');
  box.innerHTML = '';
  META_UPG.forEach(up => {
    const level = SV.upg[up.id] || 0;
    const maxed = level >= MAXLVL;
    const cost = Math.round(up.base * Math.pow(up.mult, level));
    const row = itemRow({
      icon: up.ic, title: `${up.name} <small style="color:#9ca3af">LV ${level}/${MAXLVL}</small>`,
      desc: up.ds(level + 1), price: maxed ? 'MAX' : fmt(cost) + ' 🪙', dots: level, maxed
    });
    if (!maxed) row.onclick = () => {
      if (SV.coins < cost) { AU.hit(); toast(t('needCoins') + ' ' + fmt(cost), '#fca5a5', 900); return; }
      SV.coins -= cost;
      SV.upg[up.id] = level + 1;
      save();
      AU.coin();
      buildUpgrades();
      refreshHub();
    };
    box.appendChild(row);
  });
}

const mon = () => window.Monetization;
const isFull = () => !!(mon() && mon().isFull());

function paywall(title, subtitle) {
  if (!mon()) return;
  mon().showPaywall({
    title, subtitle,
    features: [
      { ic: '🏹', text: '5 armi uniche' },
      { ic: '🧙', text: '4 eroi con perk' },
      { ic: '💍', text: '4 accessori' }
    ]
  });
}

export function buildWeapons() {
  const box = $('weapList');
  box.innerHTML = '';
  Object.entries(WEAPONS).forEach(([key, weapon], index) => {
    const owned = SV.weapons.owned.includes(key);
    const selected = SV.weapons.sel === key;
    const affordable = SV.coins >= weapon.cost;
    const locked = !isFull() && index > 0;
    const row = itemRow({
      icon: weapon.ic, title: weapon.name + (selected ? ' ✅' : ''),
      desc: `${weapon.desc}<br>dmg ${weapon.dmg} · ${weapon.rate}/s${weapon.pierce ? ' · trafora ' + weapon.pierce : ''}${weapon.aoe ? ' · esplosione' : ''}${weapon.return ? ' · ritorna' : ''}`,
      price: selected ? t('equipped') : owned ? t('unlocked') : locked ? '🔒 FULL' : fmt(weapon.cost) + ' 🪙',
      selected, locked
    });
    row.onclick = () => {
      if (selected) return;
      if (locked) { paywall('Arma Bloccata', 'Sblocca ' + weapon.name + ' con il Full Game'); return; }
      if (owned) { SV.weapons.sel = key; save(); AU.select2(); buildWeapons(); return; }
      if (!affordable) { AU.hit(); return; }
      SV.coins -= weapon.cost;
      SV.weapons.owned.push(key);
      SV.weapons.sel = key;
      save();
      AU.coin();
      buildWeapons();
      refreshHub();
    };
    box.appendChild(row);
  });
}

export function buildHeroes() {
  const box = $('heroList');
  box.innerHTML = '';
  Object.entries(HEROES).forEach(([key, hero], index) => {
    const owned = SV.heroes.owned.includes(key);
    const selected = SV.heroes.sel === key;
    const affordable = SV.coins >= hero.cost;
    const locked = !isFull() && index > 0;
    const row = itemRow({
      icon: hero.ic, title: hero.name + (selected ? ' ✅' : ''), desc: hero.desc,
      price: selected ? t('equipped') : owned ? t('unlocked') : locked ? '🔒 FULL' : fmt(hero.cost) + ' 🪙',
      selected, locked
    });
    row.onclick = () => {
      if (selected) return;
      if (locked) { paywall('Eroe Bloccato', 'Sblocca ' + hero.name + ' con il Full Game'); return; }
      if (owned) { SV.heroes.sel = key; save(); AU.select2(); buildHeroes(); return; }
      if (!affordable) { AU.hit(); return; }
      SV.coins -= hero.cost;
      SV.heroes.owned.push(key);
      SV.heroes.sel = key;
      save();
      AU.coin();
      buildHeroes();
      refreshHub();
    };
    box.appendChild(row);
  });
}

export function buildAccs() {
  const box = $('accList');
  box.innerHTML = '';
  Object.entries(ACCS).forEach(([key, acc]) => {
    const owned = SV.accs.owned.includes(key);
    const equipped = SV.accs.eq.includes(key);
    const affordable = SV.coins >= acc.cost;
    const eqFull = SV.accs.eq.length >= 2;
    const locked = !isFull();
    const row = itemRow({
      icon: acc.ic, title: acc.name + (equipped ? ' ✅ EQUIP' : ''), desc: acc.desc,
      price: equipped ? 'TOGLI' : owned ? 'EQUIPPAGIA' : locked ? '🔒 FULL' : fmt(acc.cost) + ' 🪙',
      selected: equipped, locked, maxed: eqFull && !equipped && owned
    });
    row.onclick = () => {
      if (equipped) {
        SV.accs.eq = SV.accs.eq.filter(x => x !== key);
        save(); AU.select2(); buildAccs(); return;
      }
      if (locked) { paywall('Accessorio Bloccato', 'Sblocca ' + acc.name + ' con il Full Game'); return; }
      if (!owned) {
        if (!affordable) { AU.hit(); return; }
        SV.coins -= acc.cost;
        SV.accs.owned.push(key);
        save(); AU.coin(); refreshHub();
      }
      if (SV.accs.eq.length >= 2) { toast(t('maxAccessories'), '#fca5a5', 1200); return; }
      SV.accs.eq.push(key);
      save(); AU.select2(); buildAccs();
    };
    box.appendChild(row);
  });
}

export function buildDaily() {
  refreshDaily();
  const state = dailyState();
  $('streakText').textContent = `🔥 ${state.streak} ${t('streak')}`;
  const grid = $('dailyGrid');
  grid.innerHTML = state.rewards.map((reward, i) => {
    const className = i === state.index && state.canClaim ? 'reward today' : i < state.streak ? 'reward claimed' : 'reward';
    return `<div class="${className}">🎁<small>+${reward}</small></div>`;
  }).join('');
  const btn = $('claimDaily');
  btn.disabled = !state.canClaim;
  btn.textContent = state.canClaim ? `${t('claim')} +${state.reward}` : t('claimed');
}

export function buildMissions() {
  const box = $('missionList');
  box.innerHTML = '';
  missionList().forEach(m => {
    const row = itemRow({
      icon: m.claimed ? '✅' : '📋',
      title: t(m.key),
      desc: `${Math.min(m.progress, m.target)}/${m.target}`,
      price: m.claimed ? t('claimed') : m.done ? t('claim') : `${m.reward} 🪙`,
      maxed: m.done && !m.claimed
    });
    if (m.done && !m.claimed) row.onclick = () => {
      const reward = claimMission(m.id);
      if (reward) { AU.coin(); toast(t('rewardGot') + ' +' + reward, '#ffd166'); buildMissions(); refreshHub(); }
    };
    box.appendChild(row);
  });
}

export function buildAchievements() {
  const box = $('achList');
  box.innerHTML = '';
  achievementList().forEach(a => {
    box.appendChild(itemRow({
      icon: a.unlocked ? '🏆' : '🔒',
      title: t(a.key),
      desc: a.unlocked ? t('unlocked') : '—',
      price: a.reward + ' 🪙',
      maxed: a.unlocked
    }));
  });
}

export function applySettingsUI() {
  $('setSound').checked = !AU.muted;
  $('setHaptics').checked = !!SV.settings.haptics;
  $('setMotion').checked = !!SV.settings.reduceMotion;
  $('setLang').value = getLang();
  document.body.classList.toggle('reduced', !!SV.settings.reduceMotion);
}

export function endRunUI(won, run) {
  $('sumTitle').textContent = won ? t('legendary') : t('death');
  $('sumFun').textContent = t('summaryFun');
  $('sumLv').textContent = run.level;
  $('sumKills').textContent = run.kills;
  $('sumCoins').textContent = '🪙' + run.coins;
  checkAchievements();
  showScreen('summary');
  document.getElementById('hud').classList.remove('on');
  G.SCR = 'summary';
  refreshHub();
}

/* ---------- onboarding ---------- */
let onbStep = 0;
function renderOnboarding() {
  const items = [
    { icon: '🦥', title: t('onboard1Title'), text: t('onboard1Text'), button: t('start') },
    { icon: '🎯', title: t('onboard2Title'), text: t('onboard2Text'), button: t('start') },
    { icon: '🤖', title: t('onboard3Title'), text: t('onboard3Text'), button: t('start') }
  ];
  const item = items[onbStep];
  $('onbIco').textContent = item.icon;
  $('onbTitle').textContent = item.title;
  $('onbText').textContent = item.text;
  $('onbNext').textContent = onbStep === items.length - 1 ? t('start') : '→';
  document.querySelectorAll('.onb-dots i').forEach((dot, i) => dot.classList.toggle('f', i === onbStep));
}
export function maybeOnboarding(onComplete) {
  if (SV.onboarded) { onComplete(); return; }
  onbStep = 0;
  renderOnboarding();
  $('onboarding').hidden = false;
  $('onbNext').onclick = () => {
    onbStep++;
    if (onbStep >= 3) {
      SV.onboarded = true;
      save();
      $('onboarding').hidden = true;
      onComplete();
    } else renderOnboarding();
  };
  $('onbSkip').onclick = () => {
    SV.onboarded = true;
    save();
    $('onboarding').hidden = true;
    onComplete();
  };
}

/* ---------- wiring ---------- */
export function initUI(callbacks) {
  applyI18n(document);
  applySettingsUI();
  refreshHub();
  showScreen('scrTitle');

  const on = (id, fn) => { const el = $(id); if (el) el.onclick = fn; };
  on('mPlay', () => callbacks.onPlay());
  on('mDaily', () => { buildDaily(); showScreen('scrDaily'); });
  on('mMissions', () => { buildMissions(); showScreen('scrMissions'); });
  on('mAch', () => { buildAchievements(); showScreen('scrAch'); });
  on('mUpg', () => { $('uCoins').textContent = fmt(SV.coins); buildUpgrades(); showScreen('scrUpg'); });
  on('mWeap', () => { $('wCoins').textContent = fmt(SV.coins); buildWeapons(); showScreen('scrWeap'); });
  on('mHeroes', () => { $('hCoins').textContent = fmt(SV.coins); buildHeroes(); showScreen('scrHeroes'); });
  on('mAccs', () => { $('aCoins').textContent = fmt(SV.coins); buildAccs(); showScreen('scrAccs'); });
  on('mSettings', () => { applySettingsUI(); showScreen('scrSettings'); });

  on('mAuto', () => {
    if (!SV.auto.unlocked) {
      if (!isFull() && SV.coins < AUTO_PRICE) {
        toast(t('needCoins') + ' ' + AUTO_PRICE, '#fca5a5', 1200);
        AU.hit();
        return;
      }
      if (!isFull()) SV.coins -= AUTO_PRICE;
      SV.auto.unlocked = true;
      SV.auto.on = true;
      save();
      AU.lego();
      toast(t('autoUnlocked'), '#a7f3d0', 1800);
      refreshHub();
      return;
    }
    SV.auto.on = !SV.auto.on;
    save();
    AU.select2();
    refreshHub();
  });

  on('mFull', () => {
    if (isFull()) { toast(t('fullOwned'), '#a7f3d0'); return; }
    if (!mon()) return;
    mon().showUpgrade({
      title: 'ARROWMATIC FULL',
      subtitle: 'Sblocca tutto il potenziale dell’eroe pigro',
      features: [
        { ic: '🏹', text: '5 armi (Bastone, Boomerang, Cannone...)' },
        { ic: '🧙', text: '4 eroi con perk uniche' },
        { ic: '💍', text: '4 accessori da battaglia' },
        { ic: '🤖', text: 'Modalità Auto (gioca da solo)' },
        { ic: '🗺️', text: 'Tutti i 6 capitoli' }
      ],
      onPurchase: () => {
        toast(t('fullUnlocked'), '#a7f3d0', 2000);
        refreshHub();
        buildWeapons(); buildHeroes(); buildAccs();
      }
    });
  });

  document.querySelectorAll('[data-back]').forEach(button => {
    button.onclick = () => { showScreen('scrTitle'); refreshHub(); };
  });

  on('btnPause', () => callbacks.onPause());
  on('btnMute', () => {
    AU.setMuted(!AU.muted);
    $('btnMute').textContent = AU.muted ? '🔇' : '🔊';
  });
  $('btnMute').textContent = AU.muted ? '🔇' : '🔊';

  on('pResume', () => callbacks.onResume());
  on('pQuit', () => callbacks.onQuit());
  on('sumHome', () => callbacks.onHome());

  on('claimDaily', () => {
    const reward = claimDaily();
    if (reward) { AU.coin(); toast(t('rewardGot') + ' +' + reward, '#ffd166'); buildDaily(); refreshHub(); }
  });

  on('setSound', () => {
    AU.setMuted(!$('setSound').checked);
    $('btnMute').textContent = AU.muted ? '🔇' : '🔊';
  });
  on('setHaptics', () => { SV.settings.haptics = $('setHaptics').checked; save(); });
  on('setMotion', () => {
    SV.settings.reduceMotion = $('setMotion').checked;
    save();
    document.body.classList.toggle('reduced', SV.settings.reduceMotion);
  });
  on('setLang', () => {
    setLang($('setLang').value);
    applyI18n(document);
    refreshHub();
    callbacks.onLang?.();
  });

  on('btnExport', () => {
    const blob = new Blob([exportSave()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'arrowmatic-save.json';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  on('btnImport', () => $('importFile').click());
  $('importFile').onchange = async e => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      importSave(await file.text());
      toast(t('saveImported'), '#a7f3d0');
      applySettingsUI();
      refreshHub();
    } catch (err) { toast(t('saveInvalid'), '#fca5a5'); }
    e.target.value = '';
  };
  let resetArmed = false;
  on('btnReset', () => {
    if (!resetArmed) {
      resetArmed = true;
      $('btnReset').textContent = t('resetConfirm') + ' · ' + t('confirm');
      setTimeout(() => { resetArmed = false; $('btnReset').innerHTML = '🗑 <span data-i18n="reset">' + t('reset') + '</span>'; }, 2600);
      return;
    }
    resetSave();
    resetArmed = false;
    AU.setMuted(!!SV.mute);
    applySettingsUI();
    refreshHub();
    toast(t('saveImported'), '#a7f3d0');
  });

  if (mon && typeof window !== 'undefined') {
    window._onPurchaseComplete = () => { refreshHub(); buildWeapons(); buildHeroes(); buildAccs(); };
  }
}
