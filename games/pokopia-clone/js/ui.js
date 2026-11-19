/* DITTOPIA — HUD, dialogs, menus, journal and panels */

import { ITEMS, MOVES, MOVE_ORDER, SPECIES, ACHIEVEMENTS, ZONES } from './config.js';
import { state, hasSave, exportB64, importB64, reset as resetSave } from './state.js';
import { t, applyI18n } from './i18n.js';
import * as AUDIO from './audio.js';
import { pokemon } from './pokemon.js';
import { world } from './world.js';
import { allQuests, objectiveFor } from './quests.js';

const $ = id => document.getElementById(id);

class UI {
  constructor() {
    this.mode = 'title';
    this.queue = [];
    this.cb = null;
    this.chars = 0;
    this.timer = 0;
    this.full = '';
    this.craftSel = 0;
    this.craftList = [];
    this.dexSel = 0;
    this.menuSel = 0;
    this.fluteSeq = [];
    this.fluteInput = [];
    this.flutePlaying = false;
    this.fluteCb = null;
    this.fluteTimer = null;
    this.custom = { skin: 0, hair: 0, shirt: 0 };
    this.customCb = null;
    this.toastTimer = null;
    this.callbacks = {};
  }

  init(callbacks) {
    this.callbacks = callbacks;
    applyI18n(document);
    this.showTitle();
  }

  modeOf() { return this.mode; }
  isModal() { return this.mode !== 'play'; }
  isTouch() { return 'ontouchstart' in window || navigator.maxTouchPoints > 0; }

  notify(message) {
    const el = $('toast');
    if (!el) return;
    el.textContent = message;
    el.classList.add('on');
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => el.classList.remove('on'), 2600);
  }

  refreshHUD(state, info = {}) {
    const hour = Math.floor(state.time / 60) % 24;
    const mins = Math.floor(state.time % 60);
    const night = hour < 6 || hour >= 20;
    $('clock').textContent = `${String(hour).padStart(2,'0')}:${String(mins).padStart(2,'0')} ${night ? '☾' : '☀'}`;
    $('objective').textContent = objectiveFor(state);
    const weather = $('weatherTag');
    if (weather) weather.textContent = `${t(info.season || 'spring')} · ${t(info.weather || 'clear')} · ${world.zoneAt(state.player.x, state.player.y).name}`;

    const p = state.player;
    $('inv').innerHTML = Object.entries(p.inv)
      .filter(([key, amount]) => amount > 0 && ITEMS[key] && ITEMS[key].kind === 'res')
      .map(([key, amount]) => `<span class="ic">${ITEMS[key].name} ×${amount}</span>`).join('');

    $('hotbar').innerHTML = MOVE_ORDER
      .map((mv, i) => ({ mv, i: i + 1 }))
      .filter(({ mv }) => p.moves[mv])
      .map(({ mv, i }) => `<button type="button" class="hb${p.curMove === mv ? ' sel' : ''}" data-mv="${mv}">${i}·${MOVES[mv].name}</button>`)
      .join('');
  }

  dialogue(name, text, cb) { this.dialogueMulti([{ n: name, t: text }], cb); }
  dialogueMulti(lines, cb) {
    this.queue = lines.map(line => typeof line === 'string' ? { t: line } : line);
    this.cb = cb || null;
    this.nextDialog();
  }
  nextDialog() {
    if (!this.queue.length) {
      this.mode = 'play';
      $('dialogue').classList.remove('on');
      const cb = this.cb; this.cb = null;
      if (cb) cb();
      return;
    }
    const line = this.queue[0];
    this.mode = 'dialogue';
    $('dialogue').classList.add('on');
    $('dName').textContent = line.n || '';
    this.full = line.t;
    this.chars = 0;
    this.timer = 0;
    $('dText').textContent = '';
    $('dPrompt').style.opacity = '0';
  }
  advanceDialogue() {
    if (this.mode !== 'dialogue') return;
    if (this.chars < this.full.length) {
      this.chars = this.full.length;
      $('dText').textContent = this.full;
      $('dPrompt').style.opacity = '1';
    } else {
      this.queue.shift();
      this.nextDialog();
    }
  }
  update(dt) {
    if (this.mode !== 'dialogue') return;
    if (this.chars < this.full.length) {
      this.timer += dt;
      const count = Math.floor(this.timer / 0.018);
      if (count > this.chars) {
        if (Math.floor(count / 4) !== Math.floor(this.chars / 4)) AUDIO.sfxText();
        this.chars = Math.min(count, this.full.length);
        $('dText').textContent = this.full.slice(0, this.chars);
      }
    } else $('dPrompt').style.opacity = '1';
  }

  showTitle() {
    this.mode = 'title';
    const el = $('title');
    el.classList.add('on');
    el.innerHTML = `<div class="tlogo">DITTOPIA</div><div class="tsub">un omaggio a Pokémon Pokopia</div>
      <button class="tbtn" type="button" data-act="new">▣ ${t('newGame')}</button>
      <button class="tbtn" type="button" data-act="continue"${hasSave() ? '' : ' disabled'}>▣ ${t('continue')}</button>
      <p class="tdisc">${t('disclaimer')}</p>`;
  }
  hideTitle() { $('title').classList.remove('on'); this.mode = 'play'; }

  showCustomize(cb) {
    this.mode = 'customize';
    this.customCb = cb;
    this.custom = { skin: 0, hair: 0, shirt: 0 };
    $('customize').classList.add('on');
    this.renderCustomize();
  }
  renderCustomize() {
    const rows = [['skin', t('skin'), 4], ['hair', t('hair'), 5], ['shirt', t('shirt'), 5]];
    $('customize').innerHTML = `<div class="panel"><div class="mt">${t('create')}</div>
      <div class="cust-preview" id="custPreview"></div>
      ${rows.map(([key, label, max]) => `<div class="custRow"><span>${label}</span>
        <button type="button" data-c="${key}" data-d="-1">‹</button>
        <span>${this.custom[key] + 1}/${max}</span>
        <button type="button" data-c="${key}" data-d="1">›</button></div>`).join('')}
      <button class="tbtn" type="button" data-act="go">✔ ${t('startAdventure')}</button></div>`;
    this.callbacks.onPreview?.(this.custom, $('custPreview'));
  }
  customChoose(key, delta) {
    const max = { skin: 4, hair: 5, shirt: 5 }[key];
    this.custom[key] = (this.custom[key] + delta + max) % max;
    AUDIO.sfxSelect();
    this.renderCustomize();
  }
  confirmCustom() {
    const values = this.callbacks.onPalette?.(this.custom) || this.custom;
    $('customize').classList.remove('on');
    this.mode = 'play';
    const cb = this.customCb; this.customCb = null;
    this.callbacks.onStartAdventure?.(values);
    if (cb) cb(values);
  }

  openMenu() {
    this.mode = 'menu';
    this.menuSel = 0;
    $('menu').classList.add('on');
    this.renderMenu();
  }
  closeMenu() { $('menu').classList.remove('on'); this.mode = 'play'; }
  renderMenu() {
    const options = [
      t('pokedex'), t('journal'), t('map'), t('photo'), t('saveNow'),
      t('exportSave'), t('importSave'), `${t('gbMode')}: ${state.settings.gb ? 'ON' : 'OFF'}`,
      `${t('audio')}: ${AUDIO.isMuted() ? 'OFF' : 'ON'}`,
      `${t('quality')}: ${state.settings.quality}`, `🌐 ${state.settings.lang === 'it' ? 'Italiano' : 'English'}`,
      t('deleteSave'), t('close')
    ];
    $('menu').innerHTML = `<div class="panel"><div class="mt">${t('menu')}</div>
      ${options.map((o, i) => `<button type="button" class="mo${i === this.menuSel ? ' sel' : ''}" data-i="${i}">${o}</button>`).join('')}
      <p class="hint">${t('controls')}</p></div>`;
  }
  menuMove(dir) {
    const count = 13;
    this.menuSel = (this.menuSel + dir + count) % count;
    AUDIO.sfxSelect();
    this.renderMenu();
  }
  menuAction(index) {
    switch (index) {
      case 0: this.closeMenu(); this.openDex(); break;
      case 1: this.closeMenu(); this.openJournal(); break;
      case 2: this.closeMenu(); this.openMap(); break;
      case 3: this.closeMenu(); this.openPhoto(); break;
      case 4: this.callbacks.onSave?.(); this.notify(t('saved')); break;
      case 5: { const code = exportB64(); window.prompt('Codice salvataggio:', code); break; }
      case 6: {
        const value = window.prompt('Codice salvataggio:');
        if (value && importB64(value)) { this.notify(t('imported')); setTimeout(() => location.reload(), 900); }
        else this.notify(t('invalid'));
        break;
      }
      case 7: state.settings.gb = !state.settings.gb; this.callbacks.onSave?.(); this.renderMenu(); break;
      case 8: AUDIO.setMute(!AUDIO.isMuted()); this.callbacks.onSave?.(); this.renderMenu(); break;
      case 9: state.settings.quality = state.settings.quality === 'high' ? 'low' : 'high'; this.callbacks.onSave?.(); this.renderMenu(); break;
      case 10:
        state.settings.lang = state.settings.lang === 'it' ? 'en' : 'it';
        this.callbacks.onSave?.();
        applyI18n(document);
        this.renderMenu();
        break;
      case 11:
        if (window.confirm(t('resetConfirm'))) { resetSave(); this.notify('OK'); }
        break;
      case 12: this.closeMenu(); break;
    }
  }

  openCraft(state) {
    this.mode = 'craft';
    this.craftSel = 0;
    this.craftList = Object.keys(ITEMS).filter(key => {
      const item = ITEMS[key];
      if (item.kind !== 'place') return false;
      return !item.move || item.move === 'base' || state.player.moves[item.move];
    });
    this.renderCraft(state);
  }
  closeCraft() { $('craft').classList.remove('on'); this.mode = 'play'; }
  canAfford(cost) { return !cost || Object.entries(cost).every(([key, amount]) => (state.player.inv[key] || 0) >= amount); }
  costText(cost) { return cost ? Object.entries(cost).map(([key, amount]) => `${ITEMS[key].name}×${amount}`).join(', ') : ''; }
  renderCraft(state) {
    $('craft').innerHTML = `<div class="panel"><div class="mt">${t('craft')}</div>
      ${this.craftList.length ? this.craftList.map((key, i) => {
        const item = ITEMS[key];
        const afford = this.canAfford(item.cost);
        return `<button type="button" class="mo${i === this.craftSel ? ' sel' : ''}" data-i="${i}">
          <b>${item.name}</b> — ${this.costText(item.cost)} ${afford ? '' : '✗'}</button>`;
      }).join('') : `<p>Raccogli risorse per craftare.</p>`}</div>`;
    $('craft').classList.add('on');
  }
  craftMove(dir) {
    if (!this.craftList.length) return;
    this.craftSel = (this.craftSel + dir + this.craftList.length) % this.craftList.length;
    AUDIO.sfxSelect();
    this.renderCraft(state);
  }
  craftConfirm() {
    const key = this.craftList[this.craftSel];
    if (!key) return;
    const item = ITEMS[key];
    if (!this.canAfford(item.cost)) { AUDIO.sfxError(); this.notify('Risorse insufficienti.'); return; }
    for (const [res, amount] of Object.entries(item.cost || {})) state.player.inv[res] = Math.max(0, (state.player.inv[res] || 0) - amount);
    state.player.inv[key] = (state.player.inv[key] || 0) + 1;
    state.stats.crafted++;
    AUDIO.sfxCraft();
    this.notify(`Craftato: ${item.name}`);
    this.callbacks.onCraft?.(key);
    this.renderCraft(state);
  }

  openDex() {
    this.mode = 'dex';
    this.dexSel = 0;
    $('dex').classList.add('on');
    this.renderDex();
  }
  closeDex() { $('dex').classList.remove('on'); this.mode = 'play'; }
  renderDex() {
    const keys = Object.keys(SPECIES);
    const seen = pokemon.dexCount(), friends = pokemon.friendsCount();
    $('dex').innerHTML = `<div class="panel"><div class="mt">${t('dex')} — ${t('seen')} ${seen} · ${t('friends')} ${friends}</div>
      <div class="dex-list">${keys.map((key, i) => {
        const sp = SPECIES[key], entry = pokemon.pokedex()[key] || {};
        return `<button type="button" class="mo${i === this.dexSel ? ' sel' : ''}" data-i="${i}">
          <b>#${String(sp.n).padStart(3,'0')}</b> ${entry.seen ? sp.name : '???'} ${entry.friends ? '❤' : entry.seen ? '○' : ''}</button>`;
      }).join('')}</div>
      ${this.dexPanel(keys[this.dexSel])}</div>`;
  }
  dexPanel(key) {
    if (!key) return '';
    const sp = SPECIES[key], entry = pokemon.pokedex()[key] || {};
    return `<div class="dexEntry"><div><b>${entry.seen ? sp.name : '???'}</b><br>
      ${entry.seen ? sp.flavor : 'Pokémon non ancora scoperto.'}<br><small>${sp.type} · #${sp.n}</small></div></div>`;
  }
  dexMove(dir) {
    const count = Object.keys(SPECIES).length;
    this.dexSel = (this.dexSel + dir + count) % count;
    AUDIO.sfxSelect();
    this.renderDex();
  }

  openJournal() {
    this.mode = 'journal';
    const quests = allQuests();
    $('journal').innerHTML = `<div class="panel"><div class="mt">${t('journal')}</div>
      ${quests.map(q => {
        const current = state.quest.current === q.id;
        const done = current ? false : !!(state.quest.flags[q.id + '_done']);
        return `<div class="quest${current ? ' current' : ''}"><b>${current ? '★ ' : '✓ '}${q.title}</b>
          <p>${q.goal}</p></div>`;
      }).join('')}
      <div class="stats-grid">
        <div><b>${state.stats.crafted}</b><span>craft</span></div>
        <div><b>${pokemon.friendsCount()}</b><span>amici</span></div>
        <div><b>${pokemon.dexCount()}</b><span>Pokédex</span></div>
        <div><b>${state.stats.photos}</b><span>foto</span></div>
      </div>
      <div class="achievement-list">${ACHIEVEMENTS.map(a => `<span class="ach${state.achievements[a.id] ? ' done' : ''}">${a.icon} ${a.label}</span>`).join('')}</div>
    </div>`;
    $('journal').classList.add('on');
  }
  closeJournal() { $('journal').classList.remove('on'); this.mode = 'play'; }

  openMap() {
    this.mode = 'map';
    $('map').classList.add('on');
    this.callbacks.onMap?.($('mapCanvas'));
  }
  closeMap() { $('map').classList.remove('on'); this.mode = 'play'; }

  openPhoto() {
    this.mode = 'photo';
    $('photo').classList.add('on');
    const data = this.callbacks.onPhoto?.();
    $('photoImg').src = data || '';
  }
  closePhoto() { $('photo').classList.remove('on'); this.mode = 'play'; }

  startFlute(seq, cb) {
    this.fluteSeq = seq.slice();
    this.fluteInput = [];
    this.flutePlaying = false;
    this.fluteCb = cb;
    this.mode = 'flute';
    $('flute').classList.add('on');
    this.playFluteSequence();
  }
  playFluteSequence() {
    $('fluteMsg').textContent = 'Ascolta la melodia…';
    this.fluteStep(0);
  }
  fluteStep(index) {
    if (index >= this.fluteSeq.length) {
      $('fluteMsg').textContent = 'Tocca a te! Ripeti con 1-6.';
      this.fluteInput = [];
      this.flutePlaying = true;
      $('fluteIn').textContent = '';
      return;
    }
    const note = this.fluteSeq[index];
    AUDIO.fluteNote(note);
    $('fluteSeq').textContent = this.fluteSeq.slice(0, index + 1).map(n => ['Do','Re','Mi','Fa','Sol','La'][n]).join(' ');
    this.fluteTimer = setTimeout(() => this.fluteStep(index + 1), 540);
  }
  fluteInputNote(note) {
    if (this.mode !== 'flute' || !this.flutePlaying) return;
    AUDIO.fluteNote(note);
    this.fluteInput.push(note);
    $('fluteIn').textContent = this.fluteInput.map(n => ['Do','Re','Mi','Fa','Sol','La'][n]).join(' ');
    const index = this.fluteInput.length - 1;
    if (this.fluteInput[index] !== this.fluteSeq[index]) {
      AUDIO.fluteFail();
      $('fluteMsg').textContent = 'Nota sbagliata! Riprova.';
      this.flutePlaying = false;
      clearTimeout(this.fluteTimer);
      setTimeout(() => this.playFluteSequence(), 1300);
      return;
    }
    if (this.fluteInput.length >= this.fluteSeq.length) {
      this.flutePlaying = false;
      AUDIO.fluteSuccess();
      $('fluteMsg').textContent = 'Perfetto!';
      setTimeout(() => {
        $('flute').classList.remove('on');
        this.mode = 'play';
        const cb = this.fluteCb; this.fluteCb = null;
        if (cb) cb(true);
      }, 800);
    }
  }
  closeFlute() {
    clearTimeout(this.fluteTimer);
    $('flute').classList.remove('on');
    this.mode = 'play';
    const cb = this.fluteCb; this.fluteCb = null;
    if (cb) cb(false);
  }

  handleKey(e, state) {
    const key = e.key;
    if (this.mode === 'title') {
      if (key === 'Enter' || key === ' ') this.callbacks.onContinue?.();
      return true;
    }
    if (this.mode === 'customize') {
      if (key === 'Enter') this.confirmCustom();
      return true;
    }
    if (this.mode === 'dialogue') {
      if (['Enter',' ','e','E'].includes(key)) this.advanceDialogue();
      return true;
    }
    if (this.mode === 'menu') {
      if (['Escape','q','Q'].includes(key)) this.closeMenu();
      else if (['ArrowUp','w','W'].includes(key)) this.menuMove(-1);
      else if (['ArrowDown','s','S'].includes(key)) this.menuMove(1);
      else if (['Enter',' ','e','E'].includes(key)) this.menuAction(this.menuSel);
      return true;
    }
    if (this.mode === 'craft') {
      if (['Escape','q','Q','c','C'].includes(key)) this.closeCraft();
      else if (['ArrowUp','w','W'].includes(key)) this.craftMove(-1);
      else if (['ArrowDown','s','S'].includes(key)) this.craftMove(1);
      else if (['Enter',' ','e','E'].includes(key)) this.craftConfirm();
      return true;
    }
    if (this.mode === 'dex') {
      if (['Escape','q','Q','t','T'].includes(key)) this.closeDex();
      else if (['ArrowUp','w','W'].includes(key)) this.dexMove(-1);
      else if (['ArrowDown','s','S'].includes(key)) this.dexMove(1);
      return true;
    }
    if (this.mode === 'journal') { if (['Escape','j','J'].includes(key)) this.closeJournal(); return true; }
    if (this.mode === 'map') { if (['Escape','m','M'].includes(key)) this.closeMap(); return true; }
    if (this.mode === 'photo') { if (['Escape'].includes(key)) this.closePhoto(); return true; }
    if (this.mode === 'flute') {
      const map = { '1':0,'2':1,'3':2,'4':3,'5':4,'6':5 };
      if (map[key] !== undefined) this.fluteInputNote(map[key]);
      else if (key === 'Escape') this.closeFlute();
      return true;
    }
    return false;
  }

  onClick(e) {
    const target = e.target;
    const act = target.dataset && target.dataset.act;
    const index = target.dataset && target.dataset.i;
    const dir = target.dataset && target.dataset.d;
    const customKey = target.dataset && target.dataset.c;
    const note = target.dataset && target.dataset.n;
    const move = target.dataset && target.dataset.mv;

    if (this.mode === 'title') {
      if (act === 'new') this.callbacks.onNewGame?.();
      else if (act === 'continue') this.callbacks.onContinue?.();
      return;
    }
    if (this.mode === 'customize') {
      if (customKey) this.customChoose(customKey, Number(dir));
      else if (act === 'go') this.confirmCustom();
      return;
    }
    if (this.mode === 'menu') { if (index !== undefined) { this.menuSel = Number(index); this.menuAction(this.menuSel); } return; }
    if (this.mode === 'craft') { if (index !== undefined) { this.craftSel = Number(index); this.renderCraft(state); } return; }
    if (this.mode === 'dex') { if (index !== undefined) { this.dexSel = Number(index); this.renderDex(); } return; }
    if (this.mode === 'flute') { if (note !== undefined) this.fluteInputNote(Number(note)); return; }
    if (move && state.player.moves[move]) {
      state.player.curMove = move;
      AUDIO.sfxSelect();
      this.refreshHUD(state);
    }
  }
}

export const ui = new UI();
