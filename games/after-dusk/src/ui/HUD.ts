import type { GameState } from '../game/GameState';
import { t } from '../i18n';

export class HUD {
  private root: HTMLElement;
  private clockEl: HTMLElement;
  private lightEl: HTMLElement;
  private batteryEl: HTMLElement;
  private panicEl: HTMLElement;
  private objEl: HTMLElement;
  private promptEl: HTMLButtonElement;
  private actionsBtn: HTMLButtonElement;
  private toastEl: HTMLElement;
  private breathEl: HTMLElement;
  private breathRing: HTMLElement;
  private vignetteEl: HTMLElement;
  private toastTimer = 0;
  onPromptClick?: () => void;
  onActionsClick?: () => void;

  constructor(container: HTMLElement) {
    this.root = document.createElement('div');
    this.root.className = 'hud hidden';
    this.root.innerHTML = `
      <div class="hud-vignette"></div>
      <div class="hud-top">
        <div class="hud-pill">
          <span class="hud-clock">19:30</span>
          <span class="hud-sep">·</span>
          <span class="hud-light">In Light</span>
          <span class="hud-sep">·</span>
          <span class="hud-bat">100%</span>
        </div>
        <div class="hud-obj"></div>
      </div>
      <div class="hud-left-bar">
        <div class="hud-panic-bar"><div class="hud-panic-fill"></div></div>
        <button class="hud-actions-btn" type="button">⚡ ${t('interactMenuBtn')} [I]</button>
      </div>
      <div class="crosshair">+</div>
      <button class="hud-prompt hidden" type="button"></button>
      <div class="hud-breath hidden"><div class="hud-breath-ring"></div><span>${t('breatheHold')}</span></div>
      <div class="hud-toast hidden"></div>`;
    container.appendChild(this.root);

    this.clockEl = this.root.querySelector('.hud-clock')!;
    this.lightEl = this.root.querySelector('.hud-light')!;
    this.batteryEl = this.root.querySelector('.hud-bat')!;
    this.panicEl = this.root.querySelector('.hud-panic-fill')!;
    this.objEl = this.root.querySelector('.hud-obj')!;
    this.promptEl = this.root.querySelector('.hud-prompt')!;
    this.actionsBtn = this.root.querySelector('.hud-actions-btn')!;
    this.toastEl = this.root.querySelector('.hud-toast')!;
    this.breathEl = this.root.querySelector('.hud-breath')!;
    this.breathRing = this.root.querySelector('.hud-breath-ring')!;
    this.vignetteEl = this.root.querySelector('.hud-vignette')!;

    this.promptEl.addEventListener('click', (e) => { e.stopPropagation(); this.onPromptClick?.(); });
    this.actionsBtn.addEventListener('click', (e) => { e.stopPropagation(); this.onActionsClick?.(); });
  }

  setVisible(v: boolean) {
    this.root.classList.toggle('hidden', !v);
  }

  setPrompt(text: string | null) {
    this.promptEl.textContent = text ?? '';
    this.promptEl.classList.toggle('hidden', !text);
  }

  toast(text: string, sec = 4.2) {
    this.toastEl.textContent = text;
    this.toastEl.classList.remove('hidden');
    this.toastTimer = sec;
  }

  update(dt: number, state: GameState, objective: string) {
    this.clockEl.textContent = state.timeString;
    const inLight = state.lightExposure >= 0.4;
    this.lightEl.textContent = inLight ? t('inLight') : t('inDark');
    this.lightEl.classList.toggle('safe', inLight);
    this.batteryEl.textContent = `${Math.round(state.battery)}%`;
    this.batteryEl.classList.toggle('low', state.battery <= 15);
    this.objEl.textContent = objective;

    this.panicEl.style.width = `${Math.round(state.panic)}%`;
    this.vignetteEl.style.opacity = String(Math.min(0.85, (state.panic / 100) * 0.72));

    if (state.groundingProgress > 0) {
      this.breathEl.classList.remove('hidden');
      const s = 0.7 + Math.sin(state.groundingProgress * Math.PI) * 0.6;
      this.breathRing.style.transform = `scale(${s.toFixed(2)})`;
    } else {
      this.breathEl.classList.add('hidden');
    }

    if (this.toastTimer > 0) {
      this.toastTimer -= dt;
      if (this.toastTimer <= 0) this.toastEl.classList.add('hidden');
    }
  }
}
