import type { Difficulty, Ending, GameMode, Language, Quality } from '../data/types';
import type { GameState } from '../game/GameState';
import { getLang, setLang, t } from '../i18n';
import { canInstall, onInstallChange, triggerInstall } from '../pwa';
import type { SlotInfo } from '../systems/SaveSystem';

export interface MenuCallbacks {
  onNew: (d: Difficulty, mode: GameMode) => void;
  onContinue: () => void;
  onLoadSlots: () => void;
  onSettings: () => void;
  onCredits: () => void;
  onResume: () => void;
  onSave: () => void;
  onMenu: () => void;
  onRestart: () => void;
  onLoadSlot: (slot: string) => void;
  onDeleteSlot: (slot: string) => void;
  onSetting: (k: string, v: unknown) => void;
  onIntroDone: () => void;
}

export class Menus {
  private root: HTMLElement;
  private state: GameState | null = null;
  private hasSave = false;
  private selectedDiff: Difficulty = 'normal';
  private selectedMode: GameMode = 'story';

  constructor(container: HTMLElement, private cb: MenuCallbacks) {
    this.root = document.createElement('div');
    this.root.className = 'menu-overlay';
    container.appendChild(this.root);
    onInstallChange(() => {
      if (this.root.querySelector('[data-act="install"]')) this.main();
    });
  }

  bind(state: GameState, hasSave: boolean) {
    this.state = state;
    this.hasSave = hasSave;
  }

  hide() { this.root.classList.add('hidden'); }
  show() { this.root.classList.remove('hidden'); }

  main() {
    this.show();
    this.root.innerHTML = `
      <div class="menu-card">
        <p class="eyebrow">19:30 → 06:00 · PSYCHOLOGICAL THRILLER</p>
        <h1>${t('title')}</h1>
        <p class="lede">${t('subtitle')}</p>
        <div class="mode-row">
          <button class="chip ${this.selectedMode === 'story' ? 'on' : ''}" data-mode="story">${t('storyMode')}</button>
          <button class="chip ${this.selectedMode === 'classic' ? 'on' : ''}" data-mode="classic">${t('classicMode')}</button>
        </div>
        <div class="menu-actions">
          ${this.hasSave ? `<button class="btn primary" data-act="continue">${t('continueBtn')}</button>` : ''}
          <button class="btn ${this.hasSave ? '' : 'primary'}" data-act="new">${t('newNightBtn')}</button>
          <button class="btn" data-act="slots">${t('loadBtn')}</button>
          <button class="btn" data-act="settings">${t('settingsBtn')}</button>
          <button class="btn" data-act="credits">${t('creditsBtn')}</button>
          ${canInstall() ? `<button class="btn accent" data-act="install">${t('installBtn')}</button>` : ''}
        </div>
      </div>`;

    this.root.querySelectorAll<HTMLButtonElement>('[data-mode]').forEach((b) => {
      b.addEventListener('click', () => {
        this.selectedMode = b.dataset.mode as GameMode;
        this.main();
      });
    });
    this.root.querySelector('[data-act="continue"]')?.addEventListener('click', () => this.cb.onContinue());
    this.root.querySelector('[data-act="new"]')?.addEventListener('click', () => this.cb.onNew(this.selectedDiff, this.selectedMode));
    this.root.querySelector('[data-act="slots"]')?.addEventListener('click', () => this.cb.onLoadSlots());
    this.root.querySelector('[data-act="settings"]')?.addEventListener('click', () => this.cb.onSettings());
    this.root.querySelector('[data-act="credits"]')?.addEventListener('click', () => this.cb.onCredits());
    this.root.querySelector('[data-act="install"]')?.addEventListener('click', async () => {
      const res = await triggerInstall();
      if (res === 'ios') alert('On iPhone/iPad: tap Share → Add to Home Screen.');
    });
  }

  intro(title: string, text: string) {
    this.show();
    this.root.innerHTML = `
      <div class="menu-card">
        <p class="eyebrow">${title}</p>
        <p class="lede">${text}</p>
        <button class="btn primary" data-act="go">Start</button>
      </div>`;
    this.root.querySelector('[data-act="go"]')?.addEventListener('click', () => this.cb.onIntroDone());
  }

  pause() {
    this.show();
    this.root.innerHTML = `
      <div class="menu-card">
        <h2>Paused</h2>
        <div class="menu-actions">
          <button class="btn primary" data-act="resume">${t('resumeBtn')}</button>
          <button class="btn" data-act="save">${t('saveBtn')}</button>
          <button class="btn" data-act="settings">${t('settingsBtn')}</button>
          <button class="btn" data-act="menu">${t('mainMenuBtn')}</button>
        </div>
      </div>`;
    this.root.querySelector('[data-act="resume"]')?.addEventListener('click', () => this.cb.onResume());
    this.root.querySelector('[data-act="save"]')?.addEventListener('click', () => this.cb.onSave());
    this.root.querySelector('[data-act="settings"]')?.addEventListener('click', () => this.cb.onSettings());
    this.root.querySelector('[data-act="menu"]')?.addEventListener('click', () => this.cb.onMenu());
  }

  settings() {
    this.show();
    const s = this.state;
    const lang = getLang();
    this.root.innerHTML = `
      <div class="menu-card">
        <h2>${t('settingsBtn')}</h2>
        <div class="setting-row"><span>${t('languageLabel')}</span>
          <select id="s-lang">
            <option value="en" ${lang === 'en' ? 'selected' : ''}>English</option>
            <option value="it" ${lang === 'it' ? 'selected' : ''}>Italiano</option>
          </select>
        </div>
        <div class="setting-row"><span>${t('qualityLabel')}</span>
          <select id="s-qual">
            ${(['low', 'medium', 'high', 'ultra'] as Quality[]).map((q) => `<option value="${q}" ${s?.quality === q ? 'selected' : ''}>${q}</option>`).join('')}
          </select>
        </div>
        <div class="setting-row"><span>${t('difficultyLabel')}</span>
          <select id="s-diff">
            ${(['easy', 'normal', 'hard'] as Difficulty[]).map((d) => `<option value="${d}" ${this.selectedDiff === d ? 'selected' : ''}>${d}</option>`).join('')}
          </select>
        </div>
        <div class="setting-row"><span>${t('gyroLabel')}</span>
          <input type="checkbox" id="s-gyro" ${s?.gyroAim ? 'checked' : ''} />
        </div>
        <button class="btn primary" data-act="back">${t('backBtn')}</button>
      </div>`;

    this.root.querySelector('#s-lang')?.addEventListener('change', (e) => {
      const v = (e.target as HTMLSelectElement).value as Language;
      setLang(v);
      this.cb.onSetting('lang', v);
      this.settings();
    });
    this.root.querySelector('#s-qual')?.addEventListener('change', (e) => this.cb.onSetting('quality', (e.target as HTMLSelectElement).value));
    this.root.querySelector('#s-diff')?.addEventListener('change', (e) => { this.selectedDiff = (e.target as HTMLSelectElement).value as Difficulty; });
    this.root.querySelector('#s-gyro')?.addEventListener('change', (e) => this.cb.onSetting('gyroAim', (e.target as HTMLInputElement).checked));
    this.root.querySelector('[data-act="back"]')?.addEventListener('click', () => {
      if (this.state?.phase === 'paused') this.pause();
      else this.main();
    });
  }

  slots(list: SlotInfo[]) {
    this.show();
    this.root.innerHTML = `
      <div class="menu-card">
        <h2>${t('loadBtn')}</h2>
        ${list.map((s) => `
          <div class="slot-row">
            <span>${s.slot}: ${s.data ? `${s.data.label} (${s.data.zone ?? 'home'})` : 'Empty'}</span>
            ${s.data ? `<button class="btn small" data-load="${s.slot}">Load</button><button class="btn small" data-del="${s.slot}">Del</button>` : ''}
          </div>`).join('')}
        <button class="btn primary" data-act="back">${t('backBtn')}</button>
      </div>`;
    this.root.querySelectorAll<HTMLButtonElement>('[data-load]').forEach((b) => b.addEventListener('click', () => this.cb.onLoadSlot(b.dataset.load!)));
    this.root.querySelectorAll<HTMLButtonElement>('[data-del]').forEach((b) => b.addEventListener('click', () => this.cb.onDeleteSlot(b.dataset.del!)));
    this.root.querySelector('[data-act="back"]')?.addEventListener('click', () => this.main());
  }

  credits() {
    this.show();
    this.root.innerHTML = `
      <div class="menu-card">
        <h2>After Dusk</h2>
        <p class="lede">First-person 3D psychological thriller PWA built with Three.js, TypeScript, Web Audio, and Blender-ready kits.</p>
        <button class="btn primary" data-act="back">${t('backBtn')}</button>
      </div>`;
    this.root.querySelector('[data-act="back"]')?.addEventListener('click', () => this.main());
  }

  ending(e: Ending, isIt: boolean) {
    this.show();
    this.root.innerHTML = `
      <div class="menu-card">
        <p class="eyebrow">06:00 AM · ENDING</p>
        <h2>${isIt ? e.titleIt : e.title}</h2>
        <p class="lede">${isIt ? e.textIt : e.text}</p>
        <div class="menu-actions">
          <button class="btn primary" data-act="restart">${t('restartBtn')}</button>
          <button class="btn" data-act="menu">${t('mainMenuBtn')}</button>
        </div>
      </div>`;
    this.root.querySelector('[data-act="restart"]')?.addEventListener('click', () => this.cb.onRestart());
    this.root.querySelector('[data-act="menu"]')?.addEventListener('click', () => this.cb.onMenu());
  }
}
