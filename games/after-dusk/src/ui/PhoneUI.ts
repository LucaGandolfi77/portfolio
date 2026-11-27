import { CONTACTS } from '../data/contacts';
import { ERRANDS } from '../data/errands';
import { ZONES, taxiCost } from '../data/zones';
import type { ContactId } from '../data/types';
import { contactAvailability, type GameState } from '../game/GameState';
import { t } from '../i18n';
import type { CallSystem } from '../systems/CallSystem';
import type { PhoneSystem, PhoneTab } from '../systems/PhoneSystem';

export interface PhoneCallbacks {
  onCall: (id: ContactId) => void;
  onHangup: () => void;
  onChoice: (idx: number) => void;
  onClose: () => void;
  onTravel: (zoneId: string) => void;
  onSound: (name: string) => void;
}

export class PhoneUI {
  private root: HTMLElement;
  private body: HTMLElement;
  private headerTime: HTMLElement;
  private headerBat: HTMLElement;
  onTab?: (tab: PhoneTab) => void;

  constructor(container: HTMLElement, private cb: PhoneCallbacks) {
    this.root = document.createElement('div');
    this.root.className = 'phone-overlay hidden';
    this.root.innerHTML = `
      <div class="phone-shell">
        <div class="phone-status">
          <span class="p-time">19:30</span>
          <span class="p-bat">100%</span>
          <button class="p-close" aria-label="Close">✕</button>
        </div>
        <div class="phone-tabs">
          <button data-tab="contacts" class="on">${t('phoneTabContacts')}</button>
          <button data-tab="tasks">${t('phoneTabTasks')}</button>
          <button data-tab="map">${t('phoneTabMap')}</button>
          <button data-tab="clues">${t('phoneTabClues')}</button>
          <button data-tab="messages">${t('phoneTabMessages')}</button>
        </div>
        <div class="phone-body"></div>
      </div>`;
    container.appendChild(this.root);

    this.body = this.root.querySelector('.phone-body')!;
    this.headerTime = this.root.querySelector('.p-time')!;
    this.headerBat = this.root.querySelector('.p-bat')!;

    this.root.querySelector('.p-close')!.addEventListener('click', () => this.cb.onClose());
    this.root.querySelectorAll<HTMLButtonElement>('.phone-tabs button').forEach((btn) => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab as PhoneTab;
        this.onTab?.(tab);
        this.root.querySelectorAll('.phone-tabs button').forEach((b) => b.classList.toggle('on', b === btn));
      });
    });
  }

  render(state: GameState, phone: PhoneSystem, calls: CallSystem) {
    this.root.classList.toggle('hidden', !state.phoneOpen);
    if (!state.phoneOpen) return;

    this.headerTime.textContent = state.timeString;
    this.headerBat.textContent = `${Math.round(state.battery)}%`;

    if (calls.call) {
      this.renderCall(state, calls);
      return;
    }

    const tab = phone.tab;
    if (tab === 'contacts') {
      this.body.innerHTML = CONTACTS.map((c) => {
        const avail = contactAvailability(state, c.id);
        return `
          <div class="p-card">
            <div class="p-avatar" style="background:${c.tint}">${c.initials}</div>
            <div class="p-info">
              <strong>${c.name}</strong> <small>${c.role}</small>
              <p>${c.benefit}</p>
            </div>
            <button class="p-call" data-id="${c.id}" ${avail === 'off' ? 'disabled' : ''}>${avail === 'off' ? 'Off' : 'Call'}</button>
          </div>`;
      }).join('');
      this.body.querySelectorAll<HTMLButtonElement>('.p-call').forEach((b) => {
        b.addEventListener('click', () => this.cb.onCall(b.dataset.id as ContactId));
      });
    } else if (tab === 'tasks') {
      const isIt = state.lang === 'it';
      this.body.innerHTML = `
        <div class="p-stat">${t('composureLabel')}: <strong>${Math.round(state.composure)}%</strong> · ${t('panicLabel')}: <strong>${Math.round(state.panic)}%</strong></div>
        ${ERRANDS.map((e) => {
          const done = state.errandsDone.has(e.id);
          return `<div class="p-task ${done ? 'done' : ''}">
            <span>${done ? '✓' : '○'} ${isIt ? e.titleIt : e.title}</span>
            <small>${isIt ? e.hintIt : e.hint}</small>
          </div>`;
        }).join('')}`;
    } else if (tab === 'map') {
      this.body.innerHTML = ZONES.map((z) => {
        const here = state.zone === z.id;
        const cost = taxiCost(state.zone, z.id);
        return `<div class="p-card">
          <div class="p-info"><strong>${z.name}</strong><small>${z.safe ? ' · Safe Light' : ''}</small><p>${z.subtitle}</p></div>
          <button class="p-taxi" data-z="${z.id}" ${here ? 'disabled' : ''}>${here ? 'Here' : `Taxi (-${cost}%)`}</button>
        </div>`;
      }).join('');
      this.body.querySelectorAll<HTMLButtonElement>('.p-taxi').forEach((b) => {
        b.addEventListener('click', () => this.cb.onTravel(b.dataset.z!));
      });
    } else if (tab === 'clues') {
      const list = [...state.reveals];
      this.body.innerHTML = list.length
        ? list.map((r) => `<div class="p-task"><strong>${r.replaceAll('_', ' ')}</strong></div>`).join('')
        : '<p class="p-empty">No clues recorded yet.</p>';
    } else {
      this.body.innerHTML = phone.messages
        .map((m) => `<div class="p-task"><strong>${m.from}</strong><p>${m.text}</p></div>`)
        .join('');
    }
  }

  private renderCall(state: GameState, calls: CallSystem) {
    const c = calls.call!;
    const isIt = state.lang === 'it';
    if (c.phase === 'ringing') {
      this.body.innerHTML = `
        <div class="p-call-screen">
          <h3>${c.id.toUpperCase()}</h3>
          <p>${c.incoming ? 'Incoming call...' : 'Dialing...'}</p>
          <button class="p-hangup">Hang Up</button>
        </div>`;
    } else {
      const node = calls.node;
      this.body.innerHTML = `
        <div class="p-call-screen">
          <h3>${node?.speaker ?? c.id}</h3>
          <p class="p-line">${(isIt && node?.lineIt) ? node.lineIt : (node?.line ?? '...')}</p>
          <div class="p-choices">
            ${(node?.choices ?? []).map((ch, i) => `<button class="p-choice" data-i="${i}">${i + 1}. ${(isIt && ch.textIt) ? ch.textIt : ch.text}</button>`).join('')}
          </div>
          <button class="p-hangup">End Call</button>
        </div>`;
      this.body.querySelectorAll<HTMLButtonElement>('.p-choice').forEach((b) => {
        b.addEventListener('click', () => this.cb.onChoice(Number(b.dataset.i)));
      });
    }
    this.body.querySelector('.p-hangup')?.addEventListener('click', () => this.cb.onHangup());
  }
}
