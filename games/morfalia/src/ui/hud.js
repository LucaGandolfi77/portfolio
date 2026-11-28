/* ===== MORFALIA · Cozy Mobile HUD, Dialogs & Modal Sheets ===== */
import { POWERS, REGIONS, getHarmonyLevel } from '../data/config.js';
import { ITEMS, RECIPES } from '../data/items.js';
import { BIOMINI } from '../data/biomini.js';
import { HABITATS } from '../data/habitats.js';
import { CHAPTERS, QUESTS, LORE_LOGS } from '../data/story.js';
import { sound } from '../engine/audio.js';
import { saveGame, clearSave, exportSaveString, importSaveString } from '../engine/storage.js';

export class HudController {
  constructor(sim, onResetGame) {
    this.sim = sim;
    this.onResetGame = onResetGame;
    this.dialogQueue = [];
    this.dialogOnDone = null;
    this.activePanel = null;
    this.activeTab = null;
    this._lastPowerSig = '';

    this.els = {
      hudTop: document.getElementById('hud-top'),
      hudBottom: document.getElementById('hud-bottom'),
      regionIcon: document.getElementById('hud-region-icon'),
      regionName: document.getElementById('hud-region-name'),
      harmonyLabel: document.getElementById('hud-harmony-label'),
      harmonyFill: document.getElementById('hud-harmony-fill'),
      weatherIcon: document.getElementById('hud-weather-icon'),
      clock: document.getElementById('hud-clock'),
      energyFill: document.getElementById('hud-energy-fill'),
      energyText: document.getElementById('hud-energy-text'),
      questBanner: document.getElementById('quest-banner'),
      questBadge: document.getElementById('quest-chapter-badge'),
      questText: document.getElementById('quest-objective-text'),
      buildBanner: document.getElementById('build-banner'),
      buildBannerText: document.getElementById('build-banner-text'),
      powerBar: document.getElementById('power-bar'),
      fabBtn: document.getElementById('btn-act-primary'),
      fabIcon: document.getElementById('fab-icon'),
      fabLabel: document.getElementById('fab-label'),
      toastStack: document.getElementById('toast-stack'),
      dialogBox: document.getElementById('dialog-box'),
      dialogPortrait: document.getElementById('dialog-portrait'),
      dialogSpeaker: document.getElementById('dialog-speaker'),
      dialogRole: document.getElementById('dialog-role'),
      dialogText: document.getElementById('dialog-text'),
      dialogChoices: document.getElementById('dialog-choices'),
      dialogHint: document.getElementById('dialog-hint'),
      sheetBackdrop: document.getElementById('sheet-backdrop'),
      sheetIcon: document.getElementById('sheet-icon'),
      sheetTitle: document.getElementById('sheet-title'),
      sheetSubtitle: document.getElementById('sheet-subtitle'),
      sheetTabs: document.getElementById('sheet-tabs'),
      sheetContent: document.getElementById('sheet-content'),
      audioBtn: document.getElementById('btn-audio')
    };

    this.bindUi();
  }

  setSim(sim, onResetGame) {
    this.sim = sim;
    this.onResetGame = onResetGame;
    this._lastPowerSig = '';
  }

  isModalOpen() {
    return !this.els.sheetBackdrop.classList.contains('hidden') || !this.els.dialogBox.classList.contains('hidden');
  }

  showHud() {
    this.els.hudTop.classList.remove('hidden');
    this.els.hudBottom.classList.remove('hidden');
    this.els.questBanner.classList.remove('hidden');
    this.refreshHud();
  }

  bindUi() {
    document.getElementById('btn-region-pill').addEventListener('click', () => this.openPanel('map'));
    document.getElementById('hud-time-pill').addEventListener('click', () => {
      this.openDialog([
        {
          speaker: 'Orologio della Valle', role: 'Riposo Rapido', portrait: '🕰️',
          text: 'Vuoi riposare un momento per ricaricare l\'energia di Mimo e far avanzare il tempo (+6 ore)?',
          choices: [
            { label: '😴 Riposa (+100⚡, +6 ore)', action: () => this.sim.restAtCamp(false) },
            { label: '🌅 Dormi fino all\'alba', action: () => this.sim.restAtCamp(true) },
            { label: 'Resta sveglio', action: () => {} }
          ]
        }
      ]);
    });
    document.getElementById('btn-audio').addEventListener('click', () => {
      const muted = sound.toggleMute();
      this.els.audioBtn.textContent = muted ? '🔇' : '🔊';
    });
    document.getElementById('btn-menu').addEventListener('click', () => this.openPanel('settings'));
    this.els.questBanner.addEventListener('click', () => this.openPanel('story'));
    document.getElementById('btn-cancel-build').addEventListener('click', () => this.sim.setBuildItem(null));
    this.els.fabBtn.addEventListener('click', () => {
      sound.unlock();
      this.sim.triggerPrimaryAction();
    });

    document.querySelectorAll('.dock-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        sound.unlock();
        this.openPanel(btn.dataset.panel);
      });
    });

    document.getElementById('btn-close-sheet').addEventListener('click', () => this.closePanel());
    this.els.sheetBackdrop.addEventListener('click', (e) => {
      if (e.target === this.els.sheetBackdrop) this.closePanel();
    });

    this.els.dialogBox.addEventListener('click', (e) => {
      if (e.target.closest('.dialog-choice-btn')) return;
      if (this.dialogQueue.length > 0 && this.dialogQueue[0].choices && this.dialogQueue[0].choices.length > 0) return;
      this.advanceDialog();
    });
  }

  toast(msg, gold = false) {
    const el = document.createElement('div');
    el.className = `toast${gold ? ' gold' : ''}`;
    el.textContent = msg;
    this.els.toastStack.appendChild(el);
    setTimeout(() => el.remove(), 3200);
  }

  openDialog(entries, onDone = null) {
    if (!entries || entries.length === 0) return;
    this.dialogQueue = [...entries];
    this.dialogOnDone = onDone;
    this.renderCurrentDialog();
    this.els.dialogBox.classList.remove('hidden');
  }

  renderCurrentDialog() {
    const cur = this.dialogQueue[0];
    if (!cur) {
      this.els.dialogBox.classList.add('hidden');
      const done = this.dialogOnDone;
      this.dialogOnDone = null;
      if (done) done();
      return;
    }
    sound.playDialog();
    this.els.dialogPortrait.textContent = cur.portrait || '🌿';
    this.els.dialogSpeaker.textContent = cur.speaker || 'Morfalia';
    this.els.dialogRole.textContent = cur.role || '';
    this.els.dialogText.textContent = cur.text || '';
    this.els.dialogChoices.innerHTML = '';

    if (cur.choices && cur.choices.length > 0) {
      this.els.dialogHint.textContent = 'Scegli un\'opzione';
      for (const ch of cur.choices) {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'dialog-choice-btn';
        b.textContent = ch.label;
        b.addEventListener('click', () => {
          this.advanceDialog();
          ch.action && ch.action();
        });
        this.els.dialogChoices.appendChild(b);
      }
    } else {
      this.els.dialogHint.textContent = this.dialogQueue.length > 1 ? 'Tocca per continuare ▸' : 'Tocca per chiudere ✓';
    }
  }

  advanceDialog() {
    this.dialogQueue.shift();
    this.renderCurrentDialog();
  }

  refreshHud() {
    const s = this.sim.state;
    const reg = this.sim.region;
    const meta = this.sim.regionMeta;
    const harm = getHarmonyLevel(reg.harmony);
    const tInfo = this.sim.getTimeInfo();

    this.els.regionIcon.textContent = meta.icon;
    this.els.regionName.textContent = harm.level >= 4 ? meta.restoredName : meta.name;
    this.els.harmonyLabel.textContent = `Armonia Lv.${harm.level} · ${harm.pct}%`;
    this.els.harmonyFill.style.width = `${harm.pct}%`;

    this.els.weatherIcon.textContent = tInfo.weather.icon;
    this.els.clock.textContent = tInfo.clock;

    const energyPct = Math.round((s.player.energy / s.player.maxEnergy) * 100);
    this.els.energyFill.style.width = `${energyPct}%`;
    this.els.energyText.textContent = Math.floor(s.player.energy);

    // Quest banner
    const q = this.sim.getCurrentQuest();
    if (q) {
      this.els.questBadge.textContent = `Cap. ${q.chapter}`;
      this.els.questText.textContent = `${q.title} · ${q.progress(s)}`;
    } else {
      this.els.questBadge.textContent = 'Epilogo';
      this.els.questText.textContent = `Habitat ${s.discoveredHabitats.length}/${HABITATS.length} · Biomini ${s.befriended.length}/${BIOMINI.length}`;
    }

    // Build banner
    if (s.buildItemId && ITEMS[s.buildItemId]) {
      const it = ITEMS[s.buildItemId];
      this.els.buildBanner.classList.remove('hidden');
      this.els.buildBannerText.textContent = `Posiziona: ${it.icon} ${it.name} (×${s.inventory[s.buildItemId] || 0}) — tocca la mappa`;
      this.els.fabIcon.textContent = it.icon;
      this.els.fabLabel.textContent = 'Posa';
    } else {
      this.els.buildBanner.classList.add('hidden');
      const activeP = POWERS.find((p) => p.id === s.activePower) || POWERS[0];
      this.els.fabIcon.textContent = activeP.icon;
      this.els.fabLabel.textContent = activeP.name;
    }

    // Rebuild power bar only when unlocked/active/build state changes
    const powerSig = `${s.unlockedPowers.join(',')}|${s.activePower}|${s.buildItemId || ''}`;
    if (powerSig !== this._lastPowerSig) {
      this._lastPowerSig = powerSig;
      this.els.powerBar.innerHTML = '';
      for (const p of POWERS) {
        const unlocked = s.unlockedPowers.includes(p.id);
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `power-btn${s.activePower === p.id && !s.buildItemId ? ' active' : ''}${unlocked ? '' : ' locked'}`;
        btn.innerHTML = `<span class="p-icon">${unlocked ? p.icon : '🔒'}</span><span class="p-name">${p.name}</span>`;
        btn.addEventListener('click', () => {
          sound.unlock();
          this.sim.setActivePower(p.id);
        });
        this.els.powerBar.appendChild(btn);
      }
    }
  }

  openPanel(panel, defaultTab = null) {
    this.activePanel = panel;
    this.activeTab = defaultTab;
    this.els.sheetBackdrop.classList.remove('hidden');
    this.renderSheetBody();
  }

  closePanel() {
    this.activePanel = null;
    this.els.sheetBackdrop.classList.add('hidden');
  }

  renderTabs(tabs) {
    if (!tabs || tabs.length === 0) {
      this.els.sheetTabs.classList.add('hidden');
      return;
    }
    this.els.sheetTabs.classList.remove('hidden');
    this.els.sheetTabs.innerHTML = '';
    if (!this.activeTab || !tabs.some((t) => t.id === this.activeTab)) {
      this.activeTab = tabs[0].id;
    }
    for (const t of tabs) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = `tab-btn${this.activeTab === t.id ? ' active' : ''}`;
      b.textContent = t.label;
      b.addEventListener('click', () => {
        this.activeTab = t.id;
        this.renderSheetBody();
      });
      this.els.sheetTabs.appendChild(b);
    }
  }

  renderSheetBody() {
    const p = this.activePanel;
    const c = this.els.sheetContent;
    c.innerHTML = '';

    if (p === 'story') this.renderStorySheet(c);
    else if (p === 'craft') this.renderCraftSheet(c);
    else if (p === 'bag') this.renderBagSheet(c);
    else if (p === 'dex') this.renderDexSheet(c);
    else if (p === 'habitats') this.renderHabitatsSheet(c);
    else if (p === 'map') this.renderMapSheet(c);
    else if (p === 'settings') this.renderSettingsSheet(c);
    else if (p === 'help') this.renderHelpSheet(c);
  }

  renderStorySheet(c) {
    const s = this.sim.state;
    this.els.sheetIcon.textContent = '📜';
    this.els.sheetTitle.textContent = 'Diario della Storia';
    this.els.sheetSubtitle.textContent = `Capitolo ${s.chapter}/6 · Diari Custodi ${s.readLogs.length}/${LORE_LOGS.length}`;
    this.renderTabs([
      { id: 'quests', label: '⭐ Richieste Importanti' },
      { id: 'logs', label: `📜 Diari (${s.readLogs.length}/${LORE_LOGS.length})` }
    ]);

    if (this.activeTab === 'quests') {
      const cur = this.sim.getCurrentQuest();
      if (cur) {
        c.insertAdjacentHTML('beforeend', `
          <div class="card highlight">
            <div class="card-row">
              <strong>⭐ Richiesta Attuale (Capitolo ${cur.chapter})</strong>
              <span class="mini-pill gold">${cur.progress(s)}</span>
            </div>
            <p class="card-title">${cur.title}</p>
            <p class="card-desc">${cur.desc}</p>
          </div>
        `);
      } else {
        c.insertAdjacentHTML('beforeend', `
          <div class="card completed">
            <p class="card-title">✨ Storia Principale Completata!</p>
            <p class="card-desc">Sei nell'Epilogo libero: scopri tutti i 30 Habitat, fai amicizia con i 24 Biomini e porta le 5 Regioni al Livello Armonia 5.</p>
          </div>
        `);
      }

      for (const ch of CHAPTERS) {
        const chQuests = QUESTS.filter((q) => q.chapter === ch.id);
        const doneCount = chQuests.filter((q) => s.completedQuests.includes(q.id)).length;
        const locked = ch.id > s.chapter;
        c.insertAdjacentHTML('beforeend', `
          <div class="card${doneCount === chQuests.length ? ' completed' : ''}">
            <div class="card-row">
              <p class="card-title">${locked ? '🔒 ' : ''}Capitolo ${ch.id}: ${ch.title}</p>
              <span class="mini-pill">${doneCount}/${chQuests.length}</span>
            </div>
            ${chQuests.map((q) => {
              const ok = s.completedQuests.includes(q.id);
              return `<p class="card-desc">${ok ? '✅' : '○'} <strong>${q.title}</strong> — ${q.desc}</p>`;
            }).join('')}
          </div>
        `);
      }
    } else {
      for (const log of LORE_LOGS) {
        const found = s.readLogs.includes(log.id);
        const reg = REGIONS.find((r) => r.id === log.region);
        c.insertAdjacentHTML('beforeend', `
          <div class="card${found ? ' completed' : ''}">
            <div class="card-row">
              <p class="card-title">${found ? '📜 ' + log.title : '🔒 Capsula di Memoria non trovata'}</p>
              <span class="mini-pill">${reg ? reg.icon + ' ' + reg.name : ''}</span>
            </div>
            ${found
              ? `<p class="card-desc">${log.author}</p><p class="lore-quote">${log.text}</p>`
              : `<p class="card-desc">Esplora ${reg ? reg.name : 'la regione'} e tocca le capsule dorate scintillanti sul terreno.</p>`}
          </div>
        `);
      }
    }
  }

  renderCraftSheet(c) {
    const s = this.sim.state;
    this.els.sheetIcon.textContent = '🔨';
    this.els.sheetTitle.textContent = 'Laboratorio di Mimo';
    this.els.sheetSubtitle.textContent = 'Crea arredi per Habitat, materiali, semi e cucina piatti';
    this.renderTabs([
      { id: 'build', label: '🏡 Arredi & Strutture' },
      { id: 'material', label: '🧱 Materiali' },
      { id: 'seed', label: '🌱 Semi' },
      { id: 'cook', label: '🍲 Cucina' }
    ]);

    const list = RECIPES.filter((r) => r.tab === this.activeTab);
    for (const rec of list) {
      const out = ITEMS[rec.out];
      const can = this.sim.hasItems(rec.cost);
      const owned = s.inventory[rec.out] || 0;
      const card = document.createElement('div');
      card.className = 'card';
      const costPills = Object.entries(rec.cost).map(([id, need]) => {
        const have = s.inventory[id] || 0;
        const it = ITEMS[id];
        return `<span class="mini-pill ${have >= need ? 'ok' : 'missing'}">${it.icon} ${it.name} ${have}/${need}</span>`;
      }).join('');

      card.innerHTML = `
        <div class="card-row">
          <div class="card-main">
            <div class="card-emoji">${out.icon}</div>
            <div>
              <p class="card-title">${out.name} ${rec.qty > 1 ? `×${rec.qty}` : ''} <small style="opacity:.65">(hai ${owned})</small></p>
              <p class="card-desc">${out.desc}</p>
            </div>
          </div>
          <button class="btn-small" ${can ? '' : 'disabled'}>Crea</button>
        </div>
        <div class="pill-list">${costPills}</div>
      `;
      card.querySelector('button').addEventListener('click', () => {
        if (this.sim.craftRecipe(rec.id)) {
          // If it's a placeable and user crafted it, offer quick placement via bag or stay here
          this.renderSheetBody();
        }
      });
      c.appendChild(card);
    }
  }

  renderBagSheet(c) {
    const s = this.sim.state;
    this.els.sheetIcon.textContent = '🎒';
    this.els.sheetTitle.textContent = 'Zaino di Mimo';
    this.els.sheetSubtitle.textContent = 'Tocca "Posiziona" per arredare o piantare, oppure "Mangia" per ricaricare Energia';
    this.renderTabs([
      { id: 'placeable', label: '🏡 Costruzioni & Semi' },
      { id: 'food', label: '🍓 Cibo' },
      { id: 'resource', label: '🪵 Risorse' }
    ]);

    const entries = Object.entries(s.inventory).filter(([id, qty]) => {
      if (qty <= 0 || !ITEMS[id]) return false;
      const cat = ITEMS[id].cat;
      if (this.activeTab === 'placeable') return cat === 'placeable' || cat === 'seed';
      if (this.activeTab === 'food') return cat === 'food';
      return cat === 'resource' || cat === 'material';
    });

    if (entries.length === 0) {
      c.innerHTML = `<div class="card"><p class="card-desc">Nessun oggetto in questa sezione. Raccogli risorse nella mappa o usa il menu 🔨 Crea!</p></div>`;
      return;
    }

    for (const [id, qty] of entries) {
      const it = ITEMS[id];
      const card = document.createElement('div');
      card.className = 'card';
      let actionHtml = '';
      if (it.cat === 'placeable' || it.cat === 'seed') {
        actionHtml = `<button class="btn-small">Posiziona</button>`;
      } else if (it.cat === 'food') {
        actionHtml = `<button class="btn-small">Mangia (+${it.energy}⚡)</button>`;
      }
      card.innerHTML = `
        <div class="card-row">
          <div class="card-main">
            <div class="card-emoji">${it.icon}</div>
            <div>
              <p class="card-title">${it.name} <span class="mini-pill">×${qty}</span></p>
              <p class="card-desc">${it.desc}</p>
            </div>
          </div>
          ${actionHtml}
        </div>
      `;
      const btn = card.querySelector('button');
      if (btn) {
        btn.addEventListener('click', () => {
          if (it.cat === 'placeable' || it.cat === 'seed') {
            this.sim.setBuildItem(id);
            this.closePanel();
            this.toast(`📍 Tocca una casella libera sulla mappa per posizionare ${it.name}!`);
          } else if (it.cat === 'food') {
            this.sim.eatItem(id);
            this.renderSheetBody();
          }
        });
      }
      c.appendChild(card);
    }
  }

  renderDexSheet(c) {
    const s = this.sim.state;
    this.els.sheetIcon.textContent = '🐾';
    this.els.sheetTitle.textContent = 'Enciclopedia dei Biomini';
    this.els.sheetSubtitle.textContent = `Amici scoperti: ${s.befriended.length} / ${BIOMINI.length}`;
    this.renderTabs([]);

    for (const bio of BIOMINI) {
      const met = s.befriended.includes(bio.id);
      const reg = REGIONS.find((r) => r.id === bio.region);
      const power = bio.teaches ? POWERS.find((p) => p.id === bio.teaches) : null;
      const fav = ITEMS[bio.favFood];
      const gift = ITEMS[bio.gift];

      c.insertAdjacentHTML('beforeend', `
        <div class="card${met ? ' completed' : ''}">
          <div class="card-row">
            <div class="card-main">
              <div class="card-emoji">${met ? bio.icon : '❓'}</div>
              <div>
                <p class="card-title">${met ? bio.name : 'Biomino Sconosciuto'} <span class="mini-pill">${bio.element}</span></p>
                <p class="card-desc">${met ? bio.bio : `Costruisci Habitat in ${reg ? reg.name : 'Morfalia'} per attirare questa creatura.`}</p>
              </div>
            </div>
          </div>
          <div class="pill-list">
            <span class="mini-pill">${reg ? reg.icon + ' ' + reg.name : ''}</span>
            ${power ? `<span class="mini-pill gold">Insegna: ${power.icon} ${power.name}</span>` : ''}
            ${met && fav ? `<span class="mini-pill">Ama: ${fav.icon} ${fav.name}</span>` : ''}
            ${met && gift ? `<span class="mini-pill ok">Dono: ${gift.icon} ${gift.name}</span>` : ''}
          </div>
        </div>
      `);
    }
  }

  renderHabitatsSheet(c) {
    const s = this.sim.state;
    this.els.sheetIcon.textContent = '🏡';
    this.els.sheetTitle.textContent = 'Diario degli Habitat';
    this.els.sheetSubtitle.textContent = `Scoperti: ${s.discoveredHabitats.length} / ${HABITATS.length} · Avvicina gli elementi in un'area 7×7!`;
    this.renderTabs([
      { id: 'all', label: `Tutti (${HABITATS.length})` },
      { id: 'todo', label: 'Da Scoprire' },
      { id: 'done', label: 'Scoperti' }
    ]);

    const filtered = HABITATS.filter((h) => {
      const ok = s.discoveredHabitats.includes(h.id);
      if (this.activeTab === 'todo') return !ok;
      if (this.activeTab === 'done') return ok;
      return true;
    });

    for (const h of filtered) {
      const done = s.discoveredHabitats.includes(h.id);
      const bio = BIOMINI.find((b) => b.id === h.attracts);
      const reg = h.region ? REGIONS.find((r) => r.id === h.region) : null;
      c.insertAdjacentHTML('beforeend', `
        <div class="card${done ? ' completed' : ''}">
          <div class="card-row">
            <div class="card-main">
              <div class="card-emoji">${h.icon}</div>
              <div>
                <p class="card-title">${done ? '✅ ' : ''}${h.name}</p>
                <p class="card-desc">${h.hint}</p>
              </div>
            </div>
            <span class="mini-pill gold">+${h.harmony}✨</span>
          </div>
          <div class="pill-list">
            <span class="mini-pill">${reg ? reg.icon + ' ' + reg.name : '🌍 Ovunque'}</span>
            ${bio ? `<span class="mini-pill ok">Attira: ${bio.icon} ${bio.name}</span>` : ''}
          </div>
        </div>
      `);
    }
  }

  renderMapSheet(c) {
    const s = this.sim.state;
    this.els.sheetIcon.textContent = '🗺️';
    this.els.sheetTitle.textContent = 'Mappa di Morfalia';
    this.els.sheetSubtitle.textContent = 'Viaggia istantaneamente tra le 5 Regioni sbloccate';
    this.renderTabs([]);

    for (const r of REGIONS) {
      const unlocked = s.unlockedRegions.includes(r.id);
      const current = s.currentRegion === r.id;
      const regState = s.regions[r.id];
      const harm = getHarmonyLevel(regState.harmony);
      const card = document.createElement('div');
      card.className = `card${current ? ' highlight' : regState.sanctuaryRepaired ? ' completed' : ''}`;
      card.innerHTML = `
        <div class="card-row">
          <div class="card-main">
            <div class="card-emoji">${unlocked ? r.icon : '🔒'}</div>
            <div>
              <p class="card-title">${harm.level >= 4 ? r.restoredName : r.name} ${current ? '<span class="mini-pill gold">Qui</span>' : ''}</p>
              <p class="card-desc">${unlocked ? r.desc : r.unlockHint}</p>
            </div>
          </div>
          ${unlocked && !current ? '<button class="btn-small">Viaggia</button>' : ''}
        </div>
        ${unlocked ? `
          <div class="pill-list">
            <span class="mini-pill ok">Armonia Lv.${harm.level} (${Math.floor(regState.harmony)})</span>
            <span class="mini-pill">${regState.sanctuaryRepaired ? '🏛️ Santuario OK' : '🏚️ Santuario in rovina'}</span>
            <span class="mini-pill">🏡 Habitat ${regState.habitatsFound.length}</span>
            <span class="mini-pill">🐾 Vicini ${regState.residents.length}</span>
          </div>
        ` : ''}
      `;
      const btn = card.querySelector('button');
      if (btn) {
        btn.addEventListener('click', () => {
          this.sim.travelToRegion(r.id);
          this.closePanel();
        });
      }
      c.appendChild(card);
    }
  }

  renderSettingsSheet(c) {
    const s = this.sim.state;
    this.els.sheetIcon.textContent = '⚙️';
    this.els.sheetTitle.textContent = 'Menu & Salvataggio';
    this.els.sheetSubtitle.textContent = `Giorno ${s.day} · Capitolo ${s.chapter} · Salvataggio automatico attivo`;
    this.renderTabs([]);

    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div class="grid-2">
        <button class="btn-small" id="set-save">💾 Salva Ora</button>
        <button class="btn-small secondary" id="set-help">📖 Guida Rapida</button>
        <button class="btn-small secondary" id="set-export">📤 Copia Backup</button>
        <button class="btn-small secondary" id="set-import">📥 Ripristina Backup</button>
      </div>
      <hr style="border:0;border-top:1px solid rgba(255,255,255,.1);width:100%">
      <button class="btn-small danger" id="set-reset">🗑️ Ricomincia da Capo</button>
    `;
    card.querySelector('#set-save').addEventListener('click', () => {
      saveGame(this.sim.state);
      this.toast('💾 Partita salvata sul dispositivo!');
    });
    card.querySelector('#set-help').addEventListener('click', () => this.openPanel('help'));
    card.querySelector('#set-export').addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(exportSaveString(this.sim.state));
        this.toast('📋 Codice backup copiato negli appunti!');
      } catch {
        prompt('Copia questo codice di salvataggio:', exportSaveString(this.sim.state));
      }
    });
    card.querySelector('#set-import').addEventListener('click', () => {
      const txt = prompt('Incolla il codice di backup JSON:');
      if (!txt) return;
      try {
        importSaveString(txt);
        location.reload();
      } catch {
        this.toast('⚠️ Codice salvataggio non valido.');
      }
    });
    card.querySelector('#set-reset').addEventListener('click', () => {
      if (confirm('Vuoi davvero cancellare i progressi e iniziare una nuova avventura?')) {
        clearSave();
        this.closePanel();
        this.onResetGame && this.onResetGame();
      }
    });
    c.appendChild(card);
  }

  renderHelpSheet(c) {
    this.els.sheetIcon.textContent = '📖';
    this.els.sheetTitle.textContent = 'Guida di Morfalia';
    this.els.sheetSubtitle.textContent = 'Come giocare su mobile e desktop';
    this.renderTabs([]);

    c.innerHTML = `
      <div class="card">
        <p class="card-title">👆 Controlli Mobile & Desktop</p>
        <p class="card-desc">
          • <strong>Tocca un punto o un oggetto</strong> per far camminare Mimo e interagire automaticamente.<br>
          • <strong>Trascina col dito</strong> ovunque sullo schermo per usare lo stick virtuale.<br>
          • Su computer: <strong>WASD / Frecce</strong> per muoverti, <strong>Spazio/E</strong> per agire, <strong>1–9</strong> per i poteri.
        </p>
      </div>
      <div class="card">
        <p class="card-title">🏡 Come Attirare i Biomini (Habitat)</p>
        <p class="card-desc">
          In Morfalia non si catturano creature: <strong>costruisci il loro Habitat</strong>! Combina terreni (Erba Alta, Fiori, Acqua, Sabbia) e oggetti costruiti dal menu <strong>🔨 Crea</strong> entro un'area 7×7. Quando l'Habitat è completo appare un anello dorato e un Biomino viene a vivere con te!
        </p>
      </div>
      <div class="card">
        <p class="card-title">✨ Morfomimosi (Poteri di Mimo)</p>
        <p class="card-desc">
          Parla con i Biomini amici (come <strong>Fogliolo</strong> vicino al Terrario all'inizio!) per imparare i loro poteri: <strong>Germoglio, Zampillo, Fiammata, Taglio, Spacca, Scintilla, Brezza ed Eco</strong>. Selezionali dalla barra sopra il dock in basso!
        </p>
      </div>
      <div class="card">
        <p class="card-title">🏛️ Storia, Santuari e Diari</p>
        <p class="card-desc">
          Segui il banner <strong>Cap. 1–6</strong> in alto, ripara il <strong>Santuario</strong> di ogni regione e aumenta l'Armonia per sbloccare tutte e 5 le regioni, scoprire i 10 Diari dei Custodi e costruire la <strong>Serra del Prof. Intreccio</strong>!
        </p>
      </div>
    `;
  }
}
