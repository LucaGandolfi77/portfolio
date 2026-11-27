import * as THREE from 'three';
import type { ErrandDef } from '../data/types';
import type { GameState } from '../game/GameState';
import { t } from '../i18n';
import type { Interactable } from '../world/Interactable';

export interface InteractionMenuCallbacks {
  onInteractItem: (item: Interactable) => void;
  onToggleFlashlight: () => void;
  onTogglePhone: () => void;
  onToggleMap: () => void;
  onTriggerBreathe: () => void;
  onClose: () => void;
}

const ICONS: Record<string, string> = {
  door: '🚪',
  window: '🪟',
  switch: '💡',
  charger: '🔌',
  powerbank: '🔋',
  flashlight: '🔦',
  key: '🔑',
  photo: '🖼️',
  tv: '📺',
  medicine: '💊',
  security: '🛡️',
  zone: '🧭',
  clue: '🔍',
  note: '📝',
  errand: '⭐',
};

/**
 * Radial/drawer Interactions Menu ([I] / [Q] or HUD button):
 * Lists every nearby interactable sorted by distance with one-tap trigger,
 * plus quick-actions (Flashlight, Phone, Breathe, Map) and active errand status.
 */
export class InteractionMenu {
  private root: HTMLElement;
  private listEl: HTMLElement;
  private quickEl: HTMLElement;
  private errandEl: HTMLElement;
  open = false;

  constructor(container: HTMLElement, private cb: InteractionMenuCallbacks) {
    this.root = document.createElement('div');
    this.root.className = 'interact-overlay hidden';
    this.root.innerHTML = `
      <div class="interact-card">
        <div class="interact-head">
          <h3>${t('interactMenuTitle')}</h3>
          <button class="p-close" aria-label="Close">✕</button>
        </div>
        <div class="interact-errand"></div>
        <div class="interact-quick"></div>
        <p class="interact-sub">${t('nearbyObjects')}</p>
        <div class="interact-list"></div>
      </div>`;
    container.appendChild(this.root);

    this.listEl = this.root.querySelector('.interact-list')!;
    this.quickEl = this.root.querySelector('.interact-quick')!;
    this.errandEl = this.root.querySelector('.interact-errand')!;
    this.root.querySelector('.p-close')!.addEventListener('click', () => this.cb.onClose());
    this.root.addEventListener('click', (e) => { if (e.target === this.root) this.cb.onClose(); });
  }

  setOpen(v: boolean) {
    this.open = v;
    this.root.classList.toggle('hidden', !v);
  }

  render(state: GameState, playerPos: THREE.Vector3, interactables: Interactable[], activeErrand: ErrandDef | null) {
    if (!this.open) return;
    const isIt = state.lang === 'it';

    this.errandEl.innerHTML = activeErrand
      ? `<strong>⭐ ${isIt ? activeErrand.titleIt : activeErrand.title}</strong><small>${isIt ? activeErrand.hintIt : activeErrand.hint}</small>`
      : `<strong>✓ ${isIt ? 'Nessuna commissione attiva' : 'No active errand'}</strong>`;

    this.quickEl.innerHTML = `
      <button class="q-btn" data-q="phone">📱 ${t('phoneTabContacts')} [Tab]</button>
      <button class="q-btn" data-q="light">🔦 ${state.flashlightOn ? 'Off' : 'On'} [F]</button>
      <button class="q-btn" data-q="breathe">🌬️ ${t('breatheShort')} [B]</button>
      <button class="q-btn" data-q="map">🗺️ ${t('phoneTabMap')} [M]</button>`;

    this.quickEl.querySelector('[data-q="phone"]')?.addEventListener('click', () => { this.cb.onClose(); this.cb.onTogglePhone(); });
    this.quickEl.querySelector('[data-q="light"]')?.addEventListener('click', () => { this.cb.onToggleFlashlight(); });
    this.quickEl.querySelector('[data-q="breathe"]')?.addEventListener('click', () => { this.cb.onClose(); this.cb.onTriggerBreathe(); });
    this.quickEl.querySelector('[data-q="map"]')?.addEventListener('click', () => { this.cb.onClose(); this.cb.onToggleMap(); });

    const nearby = interactables
      .filter((it) => it.object.visible)
      .map((it) => ({ it, dist: (it.pos ?? it.object.position).distanceTo(playerPos) }))
      .filter((x) => x.dist <= 5.2)
      .sort((a, b) => a.dist - b.dist)
      .slice(0, 8);

    if (!nearby.length) {
      this.listEl.innerHTML = `<p class="p-empty">${t('noNearbyObjects')}</p>`;
      return;
    }

    this.listEl.innerHTML = nearby.map(({ it, dist }, idx) => `
      <button class="i-row" data-idx="${idx}">
        <span class="i-icon">${ICONS[it.kind] ?? '•'}</span>
        <span class="i-label">${it.label}</span>
        <span class="i-dist">${dist.toFixed(1)}m</span>
      </button>`).join('');

    this.listEl.querySelectorAll<HTMLButtonElement>('.i-row').forEach((btn) => {
      btn.addEventListener('click', () => {
        const picked = nearby[Number(btn.dataset.idx)]?.it;
        if (picked) {
          this.cb.onInteractItem(picked);
          this.cb.onClose();
        }
      });
    });
  }
}
