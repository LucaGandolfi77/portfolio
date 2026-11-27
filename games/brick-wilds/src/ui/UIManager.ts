import {
  QUICK_BUILD_LIST,
  type QuickBuildId,
  type RoguelitePerkDef,
  type SculptureVoxel,
} from '../data/advanced';
import { BEAST_LIST } from '../data/beasts';
import { BRICK_PALETTE } from '../data/brickPalette';
import { BIOME_LIST, STORY_CHAPTERS } from '../data/expeditions';
import { MOD_BLOCKS } from '../data/gadgets';
import { HEROES, HERO_LIST, OUTFITS, WEAPON_MODES, WEAPON_MODE_LIST } from '../data/heroes';
import { COMMUNITY_QUESTS, HOUSE_ADDONS, HUB_PLOTS, PLOT_THEMES, THEME_LIST } from '../data/hubPlots';
import { ACHIEVEMENTS, FINALE_CLUES, FORGE_WEAPONS, MATERIAL_ITEMS } from '../data/multiverseAndLibrary';
import { OPEN_WORLD_NPCS } from '../data/openWorldContent';
import type { ElementType, HouseAddonId, SaveDataV1, WeaponModeId } from '../data/types';
import type { DamageNumberEvent, Game, HudSnapshot } from '../game/Game';
import { getLang, setLang, t } from '../i18n';

type PanelKind =
  | 'story'
  | 'expeditions'
  | 'village'
  | 'wardrobe'
  | 'codex'
  | 'library'
  | 'building'
  | 'npc'
  | 'quests'
  | 'mods'
  | 'brick-lab'
  | 'pause'
  | null;
type CodexTab = 'beasts' | 'weapons' | 'skills';
type LibraryTab = 'defeated' | 'clues' | 'achievements';

const LAB_COLORS = [
  BRICK_PALETTE.sunsetOrange,
  BRICK_PALETTE.brightYellow,
  BRICK_PALETTE.visorCyan,
  BRICK_PALETTE.brightRed,
  BRICK_PALETTE.limeGreen,
  BRICK_PALETTE.royalPurple,
  BRICK_PALETTE.pureWhite,
  BRICK_PALETTE.charcoal,
];

function elementBadge(el: ElementType): string {
  if (el === 'fire') return '🔥 Fire';
  if (el === 'frost') return '❄️ Frost';
  if (el === 'shock') return '⚡ Volt';
  return '⚪ Kinetic';
}

export class UIManager {
  private readonly root: HTMLElement;
  private readonly game: Game;
  private activePanel: PanelKind = null;
  private activePlotId: string | undefined;
  private codexTab: CodexTab = 'beasts';
  private libraryTab: LibraryTab = 'defeated';
  private bannerTimeout = 0;
  private tiltShiftOn = false;

  // Brick-Lab Editor draft state
  private labVoxels: SculptureVoxel[] = [];
  private labLayer = 0;
  private labColor: number = LAB_COLORS[0];

  private readonly titleEl: HTMLElement;
  private readonly hudEl: HTMLElement;
  private readonly dmgLayerEl: HTMLElement;
  private readonly photoEl: HTMLElement;
  private readonly cutsceneEl: HTMLElement;
  private readonly modalEl: HTMLElement;
  private readonly bannerEl: HTMLElement;
  private readonly touchEl: HTMLElement;

  onInstallClick: (() => void) | null = null;
  canInstall = false;

  constructor(root: HTMLElement, game: Game) {
    this.root = root;
    this.game = game;

    this.titleEl = document.createElement('div');
    this.titleEl.className = 'bw-title-overlay';

    this.hudEl = document.createElement('div');
    this.hudEl.className = 'bw-hud';

    this.dmgLayerEl = document.createElement('div');
    this.dmgLayerEl.className = 'bw-dmg-layer';

    this.photoEl = document.createElement('div');
    this.photoEl.className = 'bw-photo-bar hidden';

    this.cutsceneEl = document.createElement('div');
    this.cutsceneEl.className = 'bw-cutscene hidden';

    this.bannerEl = document.createElement('div');
    this.bannerEl.className = 'bw-banner';

    this.modalEl = document.createElement('div');
    this.modalEl.className = 'bw-modal-backdrop hidden';

    this.touchEl = document.createElement('div');
    this.touchEl.className = 'bw-touch-layer';

    this.root.append(
      this.dmgLayerEl,
      this.hudEl,
      this.touchEl,
      this.photoEl,
      this.cutsceneEl,
      this.bannerEl,
      this.modalEl,
      this.titleEl,
    );

    this.renderTitle();
    this.setupTouchControls();

    this.game.onHudUpdate = (snap) => this.renderHud(snap);
    this.game.onBanner = (text, tone) => this.showBanner(text, tone);
    this.game.onDamageNumber = (ev) => this.spawnDamageNumber(ev);
    this.game.onRogueliteOffer = (perks) => this.showRoguelitePicker(perks);
    this.game.onOpenPanel = (panel, plotId) => this.openPanel(panel, plotId);
    this.game.onPauseToggle = () => {
      if (this.activePanel) this.openPanel(null);
      else this.openPanel('pause');
    };

    window.addEventListener('keydown', (e) => {
      if (e.code === 'Escape' && this.activePanel) {
        e.preventDefault();
        this.openPanel(null);
      } else if ((e.code === 'Space' || e.code === 'Enter') && this.game.mode === 'cutscene') {
        e.preventDefault();
        this.game.advanceCutscene();
      }
    });
  }

  setInstallAvailable(available: boolean): void {
    this.canInstall = available;
    this.renderTitle();
  }

  private spawnDamageNumber(ev: DamageNumberEvent): void {
    const el = document.createElement('div');
    el.className = `bw-dmg-num ${ev.large ? 'large' : ''}`;
    el.textContent = ev.text;
    el.style.left = `${ev.screenX}px`;
    el.style.top = `${ev.screenY}px`;
    el.style.color = ev.color;
    this.dmgLayerEl.appendChild(el);
    window.setTimeout(() => el.remove(), 760);
  }

  private showRoguelitePicker(perks: RoguelitePerkDef[]): void {
    const isIt = getLang() === 'it';
    this.modalEl.classList.remove('hidden');
    this.modalEl.innerHTML = `
      <div class="bw-modal">
        <div class="bw-modal-head">
          <h2>♾️ ${t('roguelite.pick')}</h2>
        </div>
        <div class="bw-grid">
          ${perks
            .map(
              (p) => `
            <div class="bw-card highlight">
              <h3>${p.icon} ${isIt ? p.nameIt : p.nameEn}</h3>
              <p>${isIt ? p.descIt : p.descEn}</p>
              <button class="bw-btn primary" data-perk="${p.id}">${t('modal.equip')}</button>
            </div>
          `,
            )
            .join('')}
        </div>
      </div>
    `;
    this.modalEl.querySelectorAll('[data-perk]').forEach((el) => {
      el.addEventListener('click', () => {
        const id = (el as HTMLElement).dataset.perk as RoguelitePerkDef['id'];
        this.modalEl.classList.add('hidden');
        this.game.pickRoguelitePerk(id);
      });
    });
  }

  renderTitle(): void {
    const isIosSafari =
      typeof navigator !== 'undefined' &&
      /iPad|iPhone|iPod/.test(navigator.userAgent) &&
      !(window.navigator as unknown as { standalone?: boolean }).standalone;
    const isIt = getLang() === 'it';

    this.titleEl.innerHTML = `
      <div class="bw-title-card">
        <div class="bw-badge">100% PROCEDURAL BRICK DIORAMA PWA</div>
        <h1>${t('title.name')}</h1>
        <p class="bw-subtitle">${t('title.sub')}</p>
        <p class="bw-tagline">${t('title.tagline')}</p>
        <div class="bw-title-actions">
          <button class="bw-btn primary" data-action="story">🎬 ${t('title.story')}</button>
          <button class="bw-btn accent" data-action="openworld">🌍 ${t('title.openWorld')}</button>
          <button class="bw-btn" data-action="enter-hub">🏘️ ${t('title.play')}</button>
          <button class="bw-btn" data-action="roguelite">♾️ ${t('mode.roguelite')}</button>
          <button class="bw-btn" data-action="titan">🦒 ${t('mode.titanHunt')}</button>
          <button class="bw-btn" data-action="intro-movie">🎥 ${t('title.introMovie')}</button>
          ${this.canInstall ? `<button class="bw-btn" data-action="install">📲 ${t('title.install')}</button>` : ''}
        </div>
        ${
          isIosSafari
            ? `<div class="bw-ios-hint">📲 ${
                isIt
                  ? 'Su iPhone: tocca Condividi (⬆️) in Safari → “Aggiungi alla schermata Home” per giocare a schermo intero offline!'
                  : 'On iPhone: tap Share (⬆️) in Safari → “Add to Home Screen” for full-screen offline play!'
              }</div>`
            : ''
        }
        <div class="bw-controls-hint">
          <span><strong>P1:</strong> WASD + Mouse · <strong>Shift/RClick Dash</strong> · <strong>E Special</strong> · <strong>1-4</strong> Element · <strong>Z/X/C</strong> Quick-Build · <strong>ESC</strong> Pause</span>
          <span><strong>P2 Co-op:</strong> Arrows + Enter · RCtrl Dash · / Special · \ Element · or 2nd Gamepad</span>
        </div>
        <div class="bw-lang-row">
          <button class="bw-chip ${getLang() === 'en' ? 'active' : ''}" data-lang="en">EN</button>
          <button class="bw-chip ${getLang() === 'it' ? 'active' : ''}" data-lang="it">IT</button>
        </div>
      </div>
    `;

    this.titleEl.querySelector('[data-action="story"]')?.addEventListener('click', () => {
      this.titleEl.classList.add('hidden');
      this.game.startStoryChapter('ch-1');
    });
    this.titleEl.querySelector('[data-action="openworld"]')?.addEventListener('click', () => {
      this.titleEl.classList.add('hidden');
      this.game.startOpenWorld();
    });
    this.titleEl.querySelector('[data-action="intro-movie"]')?.addEventListener('click', () => {
      this.titleEl.classList.add('hidden');
      this.game.playGrandIntroMovie(() => this.game.enterHub());
    });
    this.titleEl.querySelector('[data-action="enter-hub"]')?.addEventListener('click', () => {
      this.titleEl.classList.add('hidden');
      this.game.enterHub();
    });
    this.titleEl.querySelector('[data-action="roguelite"]')?.addEventListener('click', () => {
      this.titleEl.classList.add('hidden');
      this.game.startRoguelite();
    });
    this.titleEl.querySelector('[data-action="titan"]')?.addEventListener('click', () => {
      this.titleEl.classList.add('hidden');
      this.game.startTitanHunt();
    });
    this.titleEl.querySelector('[data-action="install"]')?.addEventListener('click', () => {
      this.onInstallClick?.();
    });
    this.titleEl.querySelectorAll('[data-lang]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const lang = (btn as HTMLElement).dataset.lang as 'en' | 'it';
        setLang(lang);
        this.renderTitle();
      });
    });
  }

  hideTitle(): void {
    this.titleEl.classList.add('hidden');
  }

  showBanner(text: string, tone: 'info' | 'warn' | 'victory' = 'info'): void {
    this.bannerEl.textContent = text;
    this.bannerEl.className = `bw-banner visible ${tone}`;
    window.clearTimeout(this.bannerTimeout);
    this.bannerTimeout = window.setTimeout(() => {
      this.bannerEl.classList.remove('visible');
    }, 2600);
  }

  private renderPhotoBar(active: boolean): void {
    const sceneEl = document.getElementById('scene');
    if (!active) {
      this.photoEl.classList.add('hidden');
      sceneEl?.classList.remove('tilt-shift');
      return;
    }
    this.photoEl.classList.remove('hidden');
    if (this.tiltShiftOn) sceneEl?.classList.add('tilt-shift');
    else sceneEl?.classList.remove('tilt-shift');

    this.photoEl.innerHTML = `
      <div class="bw-photo-controls">
        <button class="bw-btn" data-ph="rot-l">⟲</button>
        <button class="bw-btn" data-ph="rot-r">⟳</button>
        <button class="bw-btn" data-ph="zoom-in">➕</button>
        <button class="bw-btn" data-ph="zoom-out">➖</button>
        <button class="bw-btn ${this.tiltShiftOn ? 'accent' : ''}" data-ph="tilt">🎞️ ${t('photo.tilt')}</button>
        <button class="bw-btn primary" data-ph="snap">📸 ${t('photo.download')}</button>
        <button class="bw-btn" data-ph="exit">${t('photo.exit')}</button>
      </div>
    `;
    this.photoEl.querySelector('[data-ph="rot-l"]')?.addEventListener('click', () => {
      this.game.photoAngle -= 0.35;
    });
    this.photoEl.querySelector('[data-ph="rot-r"]')?.addEventListener('click', () => {
      this.game.photoAngle += 0.35;
    });
    this.photoEl.querySelector('[data-ph="zoom-in"]')?.addEventListener('click', () => {
      this.game.photoZoom = Math.max(0.55, this.game.photoZoom - 0.15);
    });
    this.photoEl.querySelector('[data-ph="zoom-out"]')?.addEventListener('click', () => {
      this.game.photoZoom = Math.min(1.6, this.game.photoZoom + 0.15);
    });
    this.photoEl.querySelector('[data-ph="tilt"]')?.addEventListener('click', () => {
      this.tiltShiftOn = !this.tiltShiftOn;
      this.renderPhotoBar(true);
    });
    this.photoEl.querySelector('[data-ph="snap"]')?.addEventListener('click', () => {
      const url = this.game.capturePhotoPng();
      const a = document.createElement('a');
      a.href = url;
      a.download = `brick-wilds-diorama-${Date.now()}.png`;
      a.click();
    });
    this.photoEl.querySelector('[data-ph="exit"]')?.addEventListener('click', () => this.game.togglePhotoMode());
  }

  private renderCutscene(snap: HudSnapshot): void {
    const slide = snap.cutsceneSlide;
    if (!slide) {
      this.cutsceneEl.classList.add('hidden');
      return;
    }
    this.cutsceneEl.classList.remove('hidden');
    const isIt = getLang() === 'it';
    const isLast = snap.cutsceneIndex >= snap.cutsceneTotal;
    const pct = Math.round((snap.cutsceneIndex / Math.max(1, snap.cutsceneTotal)) * 100);
    this.cutsceneEl.innerHTML = `
      <div class="bw-letterbox top">
        <span>🎬 ${isIt ? slide.titleIt : slide.titleEn}</span>
        <span>${snap.cutsceneIndex} / ${snap.cutsceneTotal}</span>
      </div>
      <div class="bw-cutscene-progress"><div style="width:${pct}%"></div></div>
      <div class="bw-letterbox bottom">
        <div class="bw-dialogue-box">
          <div class="bw-speaker-avatar">${slide.avatarIcon}</div>
          <div class="bw-dialogue-copy">
            <div class="bw-speaker-name">${slide.speaker}</div>
            <p>${isIt ? slide.textIt : slide.textEn}</p>
          </div>
          <div class="bw-dialogue-actions">
            <button class="bw-btn primary" data-cut="next">${isLast ? t('cutscene.start') : t('cutscene.next')}</button>
            <button class="bw-btn" data-cut="skip">${t('cutscene.skip')}</button>
          </div>
        </div>
      </div>
    `;

    this.cutsceneEl.querySelector('[data-cut="next"]')?.addEventListener('click', () => this.game.advanceCutscene());
    this.cutsceneEl.querySelector('[data-cut="skip"]')?.addEventListener('click', () => this.game.skipCutscene());
  }

  private renderHud(snap: HudSnapshot): void {
    if (snap.photoMode) {
      this.hudEl.innerHTML = '';
      this.touchEl.classList.add('hidden');
      this.renderPhotoBar(true);
      return;
    }
    this.renderPhotoBar(false);

    if (snap.mode === 'cutscene') {
      this.hudEl.innerHTML = '';
      this.touchEl.classList.add('hidden');
      this.renderCutscene(snap);
      return;
    }
    this.cutsceneEl.classList.add('hidden');

    if (snap.mode === 'title') {
      this.hudEl.innerHTML = '';
      this.touchEl.classList.add('hidden');
      return;
    }
    this.touchEl.classList.remove('hidden');

    const isIt = getLang() === 'it';
    const playersHtml = snap.players
      .map((p, idx) => {
        const hero = HEROES[p.heroId];
        const hearts = '❤️'.repeat(p.hearts) + '🖤'.repeat(Math.max(0, p.maxHearts - p.hearts));
        const dashReady = p.dashCooldown <= 0.05;
        const specReady = p.specialCooldown <= 0.05;
        const wMode = WEAPON_MODES[p.weaponMode];
        return `
          <div class="bw-player-card p${idx + 1} ${p.downed ? 'downed' : ''}">
            <div class="bw-player-top">
              <strong>P${idx + 1} · ${hero.name}</strong>
              <span class="bw-hearts">${hearts}</span>
            </div>
            <div class="bw-player-sub">
              <span>${wMode.icon} ${isIt ? wMode.nameIt : wMode.nameEn} ${p.perfectDodgeBuff ? '⚡2×' : ''}</span>
              <div class="bw-cd-row">
                <span class="bw-cd-pill ${dashReady ? 'ready' : ''}">💨 ${dashReady ? t('hud.ready') : `${p.dashCooldown.toFixed(1)}s`}</span>
                <span class="bw-cd-pill ${specReady ? 'ready' : ''}">${hero.special.icon} [E] ${specReady ? t('hud.ready') : `${p.specialCooldown.toFixed(1)}s`}</span>
              </div>
              ${p.mountName ? `<span class="bw-heavy">🦖 ${p.mountName} (${p.mountTimer.toFixed(0)}s)</span>` : ''}
              ${p.heavyAmmo > 0 ? `<span class="bw-heavy">🔥 ${t('hud.heavy')} (${p.heavyAmmo})</span>` : ''}
            </div>
          </div>
        `;
      })
      .join('');

    const bossHtml = snap.bossName
      ? `
        <div class="bw-boss-bar">
          <div class="bw-boss-label">🦖 ${snap.bossName} (${snap.bossHp}/${snap.bossMaxHp})</div>
          <div class="bw-boss-track"><div class="bw-boss-fill" style="width:${Math.max(0, (snap.bossHp / Math.max(1, snap.bossMaxHp)) * 100)}%"></div></div>
        </div>
      `
      : '';

    const p1Mode = snap.players[0]?.weaponMode ?? 'standard';
    const weaponAndBuildBar = `
      <div class="bw-weapon-bar">
        ${WEAPON_MODE_LIST.map(
          (w, idx) => `
            <button class="bw-weapon-btn ${p1Mode === w.id ? 'active' : ''} ${w.id}" data-wmode="${w.id}">
              <span>${idx + 1}</span> ${w.icon} ${isIt ? w.nameIt : w.nameEn}
            </button>
          `,
        ).join('')}
        ${QUICK_BUILD_LIST.map(
          (qb) => `
            <button class="bw-weapon-btn qb" data-qbuild="${qb.id}">
              [${qb.key}] ${qb.icon} ${isIt ? qb.nameIt : qb.nameEn} (${qb.costPips})
            </button>
          `,
        ).join('')}
      </div>
    `;

    const hubActions =
      snap.mode === 'hub'
        ? `
          <div class="bw-hub-bar">
            <button class="bw-btn primary" data-panel="story">🎬 ${t('hud.story')}</button>
            <button class="bw-btn accent" data-action="go-openworld">🌍 ${t('hud.openWorld')}</button>
            <button class="bw-btn" data-panel="expeditions">🗺️ ${t('hud.expeditions')}</button>
            <button class="bw-btn" data-panel="village">🏘️ ${t('hud.village')}</button>
            <button class="bw-btn" data-panel="wardrobe">🎭 ${t('hud.wardrobe')}</button>
            <button class="bw-btn" data-panel="library">📚 ${t('hud.library')}</button>
            <button class="bw-btn" data-panel="codex">📖 ${t('hud.codex')}</button>
            <button class="bw-btn" data-panel="brick-lab">🧱 ${t('hud.brickLab')}</button>
            <button class="bw-btn" data-panel="quests">📋 ${t('hud.quests')}</button>
            <button class="bw-btn" data-panel="mods">🟥 ${t('hud.mods')}</button>
          </div>
        `
        : `
          <div class="bw-bottom-stack">
            ${snap.mode !== 'titan-hunt' ? weaponAndBuildBar : ''}
            <div class="bw-hub-bar">
              <button class="bw-btn" data-action="return-hub">🏘️ ${t('hud.returnHub')}</button>
              <button class="bw-btn accent" data-action="visor">👁️ ${t('hud.visor')}</button>
              <button class="bw-btn" data-panel="quests">📋 ${t('hud.quests')}</button>
              <button class="bw-btn" data-panel="codex">📖 ${t('hud.codex')}</button>
            </div>
          </div>
        `;

    const questTrackerHtml = snap.trackedQuest
      ? `<div class="bw-quest-tracker ${snap.trackedQuest.completed ? 'done' : ''}">📋 ${t(snap.trackedQuest.titleKey)}: <strong>${snap.trackedQuest.current}/${snap.trackedQuest.target}</strong></div>`
      : '';

    let minimapHtml = '';
    if (snap.openWorldMap) {
      const m = snap.openWorldMap;
      const toPct = (v: number) => Math.max(4, Math.min(96, ((v / m.worldRadius) * 0.5 + 0.5) * 100));
      const towerDots = m.towers
        .map(
          (tw) =>
            `<span class="bw-map-dot ${tw.activated ? 'tower-on' : 'tower-off'}" style="left:${toPct(tw.x)}%;top:${toPct(tw.z)}%"></span>`,
        )
        .join('');
      const chestDots = m.chests
        .filter((c) => !c.opened)
        .map((c) => `<span class="bw-map-dot chest" style="left:${toPct(c.x)}%;top:${toPct(c.z)}%"></span>`)
        .join('');
      const beastDots = m.beasts
        .map(
          (b) =>
            `<span class="bw-map-dot ${b.isBoss ? 'boss' : 'enemy'}" style="left:${toPct(b.x)}%;top:${toPct(b.z)}%"></span>`,
        )
        .join('');
      const caveDots = m.caves
        .map((c) => `<span class="bw-map-dot cave" style="left:${toPct(c.x)}%;top:${toPct(c.z)}%"></span>`)
        .join('');
      const npcDots = m.npcs
        .map((n) => `<span class="bw-map-dot npc" style="left:${toPct(n.x)}%;top:${toPct(n.z)}%"></span>`)
        .join('');
      const colDots = m.collectibles
        .map((c) => `<span class="bw-map-dot relic" style="left:${toPct(c.x)}%;top:${toPct(c.z)}%"></span>`)
        .join('');
      minimapHtml = `
        <div class="bw-minimap">
          <div class="bw-minimap-title">🧭 ${m.regionName}</div>
          <div class="bw-minimap-sub">💎 ${m.collectedCount}/${m.collectiblesTotal} · [Q] Radar</div>
          <div class="bw-minimap-radar">
            ${towerDots}${chestDots}${caveDots}${npcDots}${colDots}${beastDots}
            <span class="bw-map-dot player" style="left:${toPct(m.playerX)}%;top:${toPct(m.playerZ)}%"></span>
          </div>
        </div>
      `;
    }

    const stageSub = snap.titanProgress
      ? `<div class="bw-wave">🟨 ${snap.titanProgress.collected}/${snap.titanProgress.total} · ⏱️ ${snap.titanProgress.elapsed.toFixed(1)}s</div>`
      : snap.mode === 'expedition'
        ? `<div class="bw-wave">${t('hud.wave')} ${snap.waveIndex}/${snap.waveTotal}</div>`
        : snap.mode === 'roguelite'
          ? `<div class="bw-wave">♾️ ${t('hud.wave')} ${snap.waveIndex} · Perks: ${snap.activePerks.length}</div>`
          : '';

    this.hudEl.innerHTML = `
      <div class="bw-top-row">
        <div class="bw-players">${playersHtml}</div>
        <div class="bw-stage-pill">
          <div class="bw-stage-title">${snap.biomeName}</div>
          ${stageSub}
          ${questTrackerHtml}
          ${snap.comboCount >= 3 ? `<div class="bw-combo">🔥 COMBO x${snap.comboCount}</div>` : ''}
          ${snap.swimmingActive ? `<div class="bw-swim">🏊 ${t('hud.swimming')}</div>` : ''}
          ${snap.stealthActive ? `<div class="bw-stealth">🌿 ${t('hud.stealth')}</div>` : ''}
        </div>
        <div class="bw-economy">
          <div class="bw-stat">🪙 <strong>${snap.pips.toLocaleString()}</strong> ${t('hud.pips')}</div>
          <div class="bw-stat">🟨 <strong>${snap.coreCubes}</strong> ${t('hud.cubes')}</div>
          <div class="bw-mini-btns">
            <button class="bw-chip" data-panel="pause" title="${t('hud.pause')}">⚙️ ESC</button>
            <button class="bw-chip" data-action="photo" title="${t('hud.photoMode')}">📸</button>
            <button class="bw-chip" data-action="day">${snap.dayPhase}</button>
            <button class="bw-chip ${snap.musicEnabled ? 'active' : ''}" data-action="music">🎵</button>
            <button class="bw-chip ${snap.coopActive ? 'active' : ''}" data-action="coop">${snap.coopActive ? '👥2P' : '+2P'}</button>
          </div>
          ${minimapHtml}
        </div>
      </div>
      ${bossHtml}
      ${snap.promptText ? `<div class="bw-prompt">${snap.promptText}</div>` : ''}
      ${hubActions}
    `;

    this.hudEl.querySelectorAll('[data-panel]').forEach((el) => {
      el.addEventListener('click', () => {
        this.openPanel((el as HTMLElement).dataset.panel as PanelKind);
      });
    });
    this.hudEl.querySelectorAll('[data-wmode]').forEach((el) => {
      el.addEventListener('click', () => {
        this.game.selectP1WeaponMode((el as HTMLElement).dataset.wmode as WeaponModeId);
      });
    });
    this.hudEl.querySelectorAll('[data-qbuild]').forEach((el) => {
      el.addEventListener('click', () => {
        this.game.triggerP1QuickBuild((el as HTMLElement).dataset.qbuild as QuickBuildId);
      });
    });
    this.hudEl.querySelector('[data-action="return-hub"]')?.addEventListener('click', () => this.game.enterHub());
    this.hudEl.querySelector('[data-action="go-openworld"]')?.addEventListener('click', () => this.game.startOpenWorld());
    this.hudEl.querySelector('[data-action="visor"]')?.addEventListener('click', () => {
      this.game.input.touchState.visorPulse = true;
    });
    this.hudEl.querySelector('[data-action="photo"]')?.addEventListener('click', () => this.game.togglePhotoMode());
    this.hudEl.querySelector('[data-action="day"]')?.addEventListener('click', () => this.game.cycleDayNight());
    this.hudEl.querySelector('[data-action="music"]')?.addEventListener('click', () => this.game.toggleMusic());
    this.hudEl.querySelector('[data-action="coop"]')?.addEventListener('click', () => this.game.toggleCoop());
    this.hudEl.querySelector('[data-action="mute"]')?.addEventListener('click', () => {
      this.game.sound.muted = !this.game.sound.muted;
      this.renderHud(snap);
    });
    this.hudEl.querySelector('[data-action="lang"]')?.addEventListener('click', () => {
      setLang(getLang() === 'en' ? 'it' : 'en');
      this.renderTitle();
      this.renderHud(snap);
    });
  }

  openPanel(panel: PanelKind, plotId?: string): void {
    this.activePanel = panel;
    this.activePlotId = plotId;
    if (panel === 'brick-lab') {
      this.labVoxels = this.game.state.data.sculpture.map((v) => ({ ...v }));
    }
    if (!panel) {
      this.modalEl.classList.add('hidden');
      this.game.paused = false;
      return;
    }
    this.game.paused = true;
    this.modalEl.classList.remove('hidden');
    this.renderPanel();
  }

  private renderPanel(): void {
    if (!this.activePanel) return;
    const data = this.game.state.data;
    const isIt = getLang() === 'it';
    let body = '';
    let title = '';

    if (this.activePanel === 'story') {
      title = `🎬 ${t('hud.story')}`;
      body = `<div class="bw-grid">${STORY_CHAPTERS.map((ch) => {
        const done = data.completedChapters.includes(ch.id);
        return `
          <div class="bw-card ${done ? 'highlight' : ''}">
            <h3>${isIt ? ch.titleIt : ch.titleEn} ${done ? '✅' : ''}</h3>
            <p>${isIt ? ch.subtitleIt : ch.subtitleEn}</p>
            <button class="bw-btn primary" data-story="${ch.id}">${t('modal.playChapter')}</button>
          </div>
        `;
      }).join('')}</div>`;
    } else if (this.activePanel === 'expeditions') {
      title = `🗺️ ${t('hud.expeditions')}`;
      const mainBiomes = BIOME_LIST.filter((b) => !b.isAlternateWorld);
      const altBiomes = BIOME_LIST.filter((b) => b.isAlternateWorld);
      const renderBiomeCard = (b: (typeof BIOME_LIST)[number]) => {
        const unlocked = data.unlockedBiomes.includes(b.id);
        const cleared = data.completedBiomes.includes(b.id);
        return `
          <div class="bw-card ${b.isAlternateWorld ? 'highlight' : ''} ${unlocked ? '' : 'locked'}">
            <h3>${b.name} ${cleared ? '✅' : ''}</h3>
            ${b.eraTag ? `<p style="color:#22d3ee;font-weight:700;">🌀 ${b.eraTag}</p>` : ''}
            <p>${b.waves.length} Waves · Reward: +${b.rewardCubes} 🟨, +${b.rewardPips} 🪙</p>
            <button class="bw-btn ${unlocked ? 'primary' : ''}" ${unlocked ? '' : 'disabled'} data-launch="${b.id}">
              ${unlocked ? t('modal.launch') : `${t('modal.locked')} (${b.unlockCubes} 🟨)`}
            </button>
          </div>
        `;
      };
      body = `
        <div class="bw-grid" style="margin-bottom:14px;">
          <div class="bw-card highlight">
            <h3>♾️ ${t('mode.roguelite')}</h3>
            <p>Best Wave: ${data.rogueliteBestWave} · Roguelite Upgrade Bricks every wave!</p>
            <button class="bw-btn primary" data-special-mode="roguelite">${t('modal.launch')}</button>
          </div>
          <div class="bw-card highlight">
            <h3>🦒 ${t('mode.titanHunt')}</h3>
            <p>Best Time: ${data.titanBestTimeSec !== null ? `${data.titanBestTimeSec}s` : '—'} · 6 Golden Bricks + Titan Hack</p>
            <button class="bw-btn accent" data-special-mode="titan">${t('modal.launch')}</button>
          </div>
        </div>
        <div class="bw-section-label">🌀 ${t('expeditions.altWorlds')}</div>
        <div class="bw-grid" style="margin-bottom:14px;">${altBiomes.map(renderBiomeCard).join('')}</div>
        <div class="bw-section-label">🗺️ ${t('expeditions.mainWorlds')}</div>
        <div class="bw-grid">${mainBiomes.map(renderBiomeCard).join('')}</div>`;
    } else if (this.activePanel === 'library') {
      title = `📚 ${t('library.title')}`;
      const tabs = `
        <div class="bw-row" style="margin-bottom:14px;">
          <button class="bw-chip ${this.libraryTab === 'defeated' ? 'active' : ''}" data-lib="defeated">🦖 ${t('library.tabDefeated')}</button>
          <button class="bw-chip ${this.libraryTab === 'clues' ? 'active' : ''}" data-lib="clues">🔮 ${t('library.tabClues')}</button>
          <button class="bw-chip ${this.libraryTab === 'achievements' ? 'active' : ''}" data-lib="achievements">🏆 ${t('library.tabAchievements')} (${data.unlockedAchievements.length}/${ACHIEVEMENTS.length})</button>
        </div>
      `;
      if (this.libraryTab === 'defeated') {
        const totalKindsDefeated = BEAST_LIST.filter((b) => (data.defeatedCounts[b.id] ?? 0) > 0).length;
        body =
          tabs +
          `<div class="bw-section-label">${t('library.defeated')}: ${totalKindsDefeated} / ${BEAST_LIST.length} Species</div>
          <div class="bw-grid">${BEAST_LIST.map((b) => {
            const count = data.defeatedCounts[b.id] ?? 0;
            return `
              <div class="bw-card ${count > 0 ? 'highlight' : 'locked'}">
                <h3>${b.name} ${b.isBoss ? '👑 BOSS' : ''}</h3>
                <p><strong>${t('library.defeated')}:</strong> ${count}x · ${elementBadge(b.weakElement)}</p>
                <p>${isIt ? b.loreIt : b.loreEn}</p>
              </div>
            `;
          }).join('')}</div>`;
      } else if (this.libraryTab === 'clues') {
        body =
          tabs +
          `<div class="bw-grid">${FINALE_CLUES.map((c) => {
            const open = c.isUnlocked(data);
            return `
              <div class="bw-card ${open ? 'highlight' : 'locked'}">
                <h3>${open ? '🔮' : '🔒'} ${isIt ? c.titleIt : c.titleEn}</h3>
                <p>${open ? (isIt ? c.clueIt : c.clueEn) : t('library.clueLocked')}</p>
              </div>
            `;
          }).join('')}</div>`;
      } else {
        body =
          tabs +
          `<div class="bw-grid">${ACHIEVEMENTS.map((a) => {
            const done = data.unlockedAchievements.includes(a.id);
            return `
              <div class="bw-card ${done ? 'highlight' : 'locked'}">
                <h3>${a.icon} ${isIt ? a.titleIt : a.titleEn} ${done ? '✅' : ''}</h3>
                <p>${isIt ? a.descIt : a.descEn}</p>
                <p><strong>Reward:</strong> +${a.rewardPips} 🪙${a.rewardCubes > 0 ? `, +${a.rewardCubes} 🟨` : ''}</p>
              </div>
            `;
          }).join('')}</div>`;
      }
    } else if (this.activePanel === 'building') {
      const plotId = this.activePlotId ?? 'gadget-forge';
      const mats = data.materials;
      const matBar = `<div class="bw-row" style="margin-bottom:12px;">
        <span class="bw-chip active">🪙 ${data.pips}</span>
        <span class="bw-chip">🔥 ${mats.fireShards}</span>
        <span class="bw-chip">❄️ ${mats.frostShards}</span>
        <span class="bw-chip">⚡ ${mats.voltShards}</span>
        <span class="bw-chip">⏳ ${mats.chronoDust}</span>
      </div>`;
      const customizeBtn = `<div class="bw-row" style="margin-top:14px;"><button class="bw-btn" data-open-village="${plotId}">🎨 ${t('building.customize')}</button></div>`;

      if (plotId === 'gadget-forge') {
        title = `🔨 ${t('building.forgeTitle')}`;
        body =
          matBar +
          `<div class="bw-grid">${FORGE_WEAPONS.map((w) => {
            const owned = data.ownedWeapons.includes(w.id);
            return `
              <div class="bw-card ${owned ? 'highlight' : ''}">
                <h3>${w.icon} ${isIt ? w.nameIt : w.nameEn} ${owned ? '✅' : ''}</h3>
                <p>${isIt ? w.descIt : w.descEn}</p>
                <p>Cost: ${w.costPips} 🪙 + ${w.materialCost} ${w.materialKey}</p>
                <button class="bw-btn primary" ${owned ? 'disabled' : ''} data-craft-weapon="${w.id}">${owned ? t('modal.equipped') : t('modal.buy')}</button>
              </div>
            `;
          }).join('')}</div>` +
          customizeBtn;
      } else if (plotId === 'snack-plaza') {
        title = `🛍️ ${t('building.shopTitle')}`;
        body =
          matBar +
          `<div class="bw-grid">${MATERIAL_ITEMS.map((m) => `
            <div class="bw-card">
              <h3>${m.icon} ${isIt ? m.nameIt : m.nameEn} (Owned: ${mats[m.key]})</h3>
              <button class="bw-btn primary" data-buy-mat="${m.key}">${t('modal.buy')} (${m.costPips} 🪙)</button>
            </div>
          `).join('')}</div>` +
          customizeBtn;
      } else if (plotId === 'block-windmill') {
        title = `🌾 ${t('building.marketTitle')}`;
        body =
          matBar +
          `<div class="bw-grid">
            <div class="bw-card highlight">
              <h3>🟨 Core Cube Synthesis</h3>
              <p>Trade any 6 Elemental Shards (🔥/❄️/⚡) for +1 Core Cube!</p>
              <button class="bw-btn primary" data-trade-cube="1">Trade 6 Shards → +1 🟨</button>
            </div>
            ${MATERIAL_ITEMS.map((m) => `
              <div class="bw-card">
                <h3>${m.icon} ${isIt ? m.nameIt : m.nameEn} (${mats[m.key]})</h3>
                <button class="bw-btn" data-sell-mat="${m.key}">Sell (+${m.sellPips} 🪙)</button>
              </div>
            `).join('')}
          </div>` +
          customizeBtn;
      } else if (plotId === 'botanic-dome') {
        title = `🌿 ${t('building.herbTitle')} (Active: ${data.activeBuff.toUpperCase()})`;
        body =
          matBar +
          `<div class="bw-grid">
            <div class="bw-card ${data.activeBuff === 'vitality' ? 'highlight' : ''}">
              <h3>❤️ Vitality Brew (+2 Max Hearts)</h3>
              <button class="bw-btn primary" data-buff="vitality">Drink (220 🪙)</button>
            </div>
            <div class="bw-card ${data.activeBuff === 'overcharge' ? 'highlight' : ''}">
              <h3>⚡ Overcharge Elixir (+25% Squad DMG)</h3>
              <button class="bw-btn primary" data-buff="overcharge">Drink (300 🪙)</button>
            </div>
          </div>` +
          customizeBtn;
      } else if (plotId === 'beacon-lighthouse') {
        title = `🌀 ${t('building.multiverseTitle')}`;
        const altBiomes = BIOME_LIST.filter((b) => b.isAlternateWorld);
        body =
          `<div class="bw-grid">${altBiomes
            .map((b) => {
              const unlocked = data.unlockedBiomes.includes(b.id);
              return `
                <div class="bw-card highlight ${unlocked ? '' : 'locked'}">
                  <h3>${b.name}</h3>
                  <p>${b.eraTag ?? ''}</p>
                  <button class="bw-btn primary" ${unlocked ? '' : 'disabled'} data-launch="${b.id}">
                    ${unlocked ? t('modal.launch') : `${t('modal.locked')} (${b.unlockCubes} 🟨)`}
                  </button>
                </div>
              `;
            })
            .join('')}</div>` + customizeBtn;
      } else if (plotId === 'star-observatory') {
        title = `🔭 ${t('building.obsTitle')}`;
        body =
          `<div class="bw-card highlight">
            <h3>🌍 Open-World Progress</h3>
            <p>Regions Discovered: ${data.discoveredRegions.length}/6 · Signal Towers: ${data.activatedTowers.length}/6</p>
            <button class="bw-btn primary" data-go-ow="1">🌍 ${t('title.openWorld')}</button>
          </div>` + customizeBtn;
      } else if (plotId === 'dino-coaster') {
        title = `🎢 ${t('building.arcadeTitle')}`;
        body =
          `<div class="bw-grid">
            <div class="bw-card highlight"><h3>♾️ ${t('mode.roguelite')}</h3><button class="bw-btn primary" data-special-mode="roguelite">${t('modal.launch')}</button></div>
            <div class="bw-card highlight"><h3>🦒 ${t('mode.titanHunt')}</h3><button class="bw-btn accent" data-special-mode="titan">${t('modal.launch')}</button></div>
          </div>` + customizeBtn;
      } else if (plotId === 'sky-monument') {
        this.activePanel = 'library';
        this.renderPanel();
        return;
      } else {
        this.activePanel = 'wardrobe';
        this.renderPanel();
        return;
      }
    } else if (this.activePanel === 'brick-lab') {
      title = `🧱 ${t('bricklab.title')}`;
      const cells: string[] = [];
      for (let z = -2; z <= 2; z++) {
        for (let x = -2; x <= 2; x++) {
          const found = this.labVoxels.find((v) => v.x === x && v.y === this.labLayer && v.z === z);
          const bg = found ? `#${found.color.toString(16).padStart(6, '0')}` : 'rgba(255,255,255,0.06)';
          cells.push(`<button class="bw-lab-cell" data-lx="${x}" data-lz="${z}" style="background:${bg}"></button>`);
        }
      }
      body = `
        <p style="margin-top:0;color:#cbd5e1;font-size:13px;">${t('bricklab.desc')}</p>
        <div class="bw-row" style="margin-bottom:10px;align-items:center;">
          <span>Layer Y:</span>
          ${[0, 1, 2, 3].map((ly) => `<button class="bw-chip ${this.labLayer === ly ? 'active' : ''}" data-layer="${ly}">Y=${ly}</button>`).join('')}
        </div>
        <div class="bw-row" style="margin-bottom:12px;">
          ${LAB_COLORS.map((c) => {
            const hex = `#${c.toString(16).padStart(6, '0')}`;
            return `<button class="bw-color-dot ${this.labColor === c ? 'active' : ''}" data-lcol="${c}" style="background:${hex}"></button>`;
          }).join('')}
        </div>
        <div class="bw-lab-grid">${cells.join('')}</div>
        <div class="bw-row" style="margin-top:14px;">
          <button class="bw-btn primary" data-lab-save="1">💾 ${t('bricklab.save')} (${this.labVoxels.length} bricks)</button>
          <button class="bw-btn" data-lab-clear="1">🗑️ ${t('bricklab.clear')}</button>
        </div>
      `;
    } else if (this.activePanel === 'village') {
      title = `🏘️ ${t('hud.village')} (${data.pips} 🪙 · ${data.coreCubes} 🟨)`;
      body = `<div class="bw-grid">${HUB_PLOTS.map((p) => {
        const st = data.plots[p.id] ?? { built: false, theme: p.defaultTheme, addon: 'none' };
        const unlocked = data.coreCubes >= p.unlockCubes;
        const cost = st.built ? 100 : p.buildCostPips;
        const highlight = this.activePlotId === p.id ? 'highlight' : '';
        return `
          <div class="bw-card ${highlight} ${unlocked ? '' : 'locked'}">
            <h3>${p.name}</h3>
            <p>${st.built ? `Theme: ${PLOT_THEMES[st.theme].name} (100 🪙)` : `Build: ${cost} 🪙 · Need ${p.unlockCubes} 🟨`}</p>
            <div class="bw-theme-row">
              ${THEME_LIST.map(
                (th) =>
                  `<button class="bw-chip ${st.built && st.theme === th ? 'active' : ''}" ${unlocked ? '' : 'disabled'} data-plot="${p.id}" data-theme="${th}">${PLOT_THEMES[th].name}</button>`,
              ).join('')}
            </div>
            ${
              st.built
                ? `
                  <div class="bw-addon-label">${t('modal.addons')}:</div>
                  <div class="bw-theme-row">
                    ${HOUSE_ADDONS.map(
                      (a) =>
                        `<button class="bw-chip ${st.addon === a.id ? 'active' : ''}" data-addon-plot="${p.id}" data-addon="${a.id}">${a.icon} ${isIt ? a.nameIt : a.nameEn} ${a.costPips > 0 && st.addon !== a.id ? `(${a.costPips})` : ''}</button>`,
                    ).join('')}
                  </div>
                `
                : ''
            }
          </div>
        `;
      }).join('')}</div>`;
    } else if (this.activePanel === 'codex') {
      title = `📖 ${t('hud.codex')}`;
      const tabs = `
        <div class="bw-row" style="margin-bottom:14px;">
          <button class="bw-chip ${this.codexTab === 'beasts' ? 'active' : ''}" data-codex="beasts">🦖 ${t('codex.tabBeasts')}</button>
          <button class="bw-chip ${this.codexTab === 'weapons' ? 'active' : ''}" data-codex="weapons">🔥 ${t('codex.tabWeapons')}</button>
          <button class="bw-chip ${this.codexTab === 'skills' ? 'active' : ''}" data-codex="skills">⚡ ${t('codex.tabSkills')}</button>
        </div>
      `;
      if (this.codexTab === 'beasts') {
        body =
          tabs +
          `<div class="bw-grid">${BEAST_LIST.map((b) => {
            const seen = data.discoveredBeasts.includes(b.id);
            const wps = b.weakPoints.map((w) => `${w.label} (${elementBadge(w.weakTo)})`).join(', ');
            return `
              <div class="bw-card ${seen ? 'highlight' : ''}">
                <h3>${b.name} ${b.isBoss ? '👑' : ''}</h3>
                <p>${isIt ? b.loreIt : b.loreEn}</p>
                <p><strong>HP:</strong> ${b.maxHp} · <strong>${t('codex.weakTo')}:</strong> ${elementBadge(b.weakElement)}</p>
                <p><strong>${t('codex.weakPoints')}:</strong> ${wps}</p>
                <span class="bw-chip ${seen ? 'active' : ''}">${seen ? t('codex.discovered') : t('codex.undiscovered')}</span>
              </div>
            `;
          }).join('')}</div>`;
      } else if (this.codexTab === 'weapons') {
        body =
          tabs +
          `<div class="bw-section-label">${isIt ? 'Munizioni Elementali & Combo (Fuoco+Ghiaccio, Ghiaccio+Fulmine, Fuoco+Fulmine)' : 'Elemental Ammo & Combos (Fire+Frost, Frost+Volt, Fire+Volt)'}</div>
          <div class="bw-grid">${WEAPON_MODE_LIST.map((w) => `
            <div class="bw-card highlight">
              <h3>${w.icon} ${isIt ? w.nameIt : w.nameEn}</h3>
              <p>${isIt ? w.descIt : w.descEn}</p>
            </div>
          `).join('')}</div>
          <div class="bw-section-label">${isIt ? 'Quick-Build in Battaglia (Z / X / C)' : 'Combat Quick-Build (Z / X / C)'}</div>
          <div class="bw-grid">${QUICK_BUILD_LIST.map((q) => `
            <div class="bw-card">
              <h3>[${q.key}] ${q.icon} ${isIt ? q.nameIt : q.nameEn} (${q.costPips} 🪙)</h3>
            </div>
          `).join('')}</div>`;
      } else {
        body =
          tabs +
          `<div class="bw-grid">
            <div class="bw-card highlight">
              <h3>💨 ${t('hud.dash')} + Perfect Dodge</h3>
              <p>${isIt ? 'Schiva con i-frames! Se schivi un colpo all’ultimo istante attivi Bullet-Time + 2× danno sul colpo successivo!' : 'Dodge with i-frames! Dodging right before impact triggers Bullet-Time + 2× next shot damage!'}</p>
            </div>
            <div class="bw-card highlight">
              <h3>🦖 ${isIt ? 'Cavalca la Synth-Bestia [F]' : 'Ride Stunned Synth-Beasts [F]'}</h3>
              <p>${isIt ? 'Stordisci una Synth-Bestia (col Fulmine) e premi [F] vicino a lei per cavalcarla per 12s e travolgere i nemici!' : 'Stun any non-boss Synth-Beast and press [F] nearby to ride it for 12s and ram through enemies!'}</p>
            </div>
            ${HERO_LIST.map((h) => `
              <div class="bw-card">
                <h3>${h.special.icon} ${h.name}: ${isIt ? h.special.nameIt : h.special.nameEn} [E]</h3>
                <p>${isIt ? h.special.descIt : h.special.descEn}</p>
                <p><strong>Cooldown:</strong> ${h.special.cooldown}s</p>
              </div>
            `).join('')}
          </div>`;
      }
    } else if (this.activePanel === 'wardrobe') {
      title = `🎭 ${t('hud.wardrobe')}`;
      const p1Id = data.selectedHeroP1;
      const p1Prog = data.heroProgress[p1Id];
      body = `
        <div class="bw-section-label">Heroes (P1 Active: ${HEROES[p1Id].name} · Lv.${p1Prog.level})</div>
        <div class="bw-grid">${HERO_LIST.map((h) => {
          const unlocked = data.unlockedHeroes.includes(h.id);
          const active = data.selectedHeroP1 === h.id;
          return `
            <div class="bw-card ${active ? 'highlight' : ''}">
              <h3>${h.name}</h3>
              <p>${h.role} · ${h.weapon}</p>
              <p>${h.special.icon} [E] ${isIt ? h.special.nameIt : h.special.nameEn}</p>
              <div class="bw-row">
                ${
                  unlocked
                    ? `<button class="bw-btn ${active ? 'accent' : 'primary'}" data-select-hero="${h.id}">${active ? t('modal.equipped') : t('modal.equip')}</button>`
                    : `<button class="bw-btn" data-unlock-hero="${h.id}">${t('modal.buy')} (${h.unlockCostCubes} 🟨)</button>`
                }
              </div>
            </div>
          `;
        }).join('')}</div>
        <div class="bw-section-label">Upgrades for ${HEROES[p1Id].name}</div>
        <div class="bw-row" style="margin-bottom:12px;">
          <button class="bw-btn primary" data-upgrade="damage">${t('modal.upgradeDmg')} (Lv.${p1Prog.damageTier}/4 · ${250 + p1Prog.damageTier * 250} 🪙)</button>
          <button class="bw-btn accent" data-upgrade="heart">${t('modal.upgradeHeart')} (Lv.${p1Prog.heartTier}/4 · ${250 + p1Prog.heartTier * 250} 🪙)</button>
        </div>
        <div class="bw-section-label">Outfits (${data.pips} 🪙)</div>
        <div class="bw-theme-row">${OUTFITS.map((o) => {
          const owned = data.unlockedOutfits.includes(o.id);
          const equipped = p1Prog.outfit === o.id;
          return `<button class="bw-chip ${equipped ? 'active' : ''}" data-outfit="${o.id}">${o.name} ${owned ? '' : `(${o.costPips} 🪙)`}</button>`;
        }).join('')}</div>
      `;
    } else if (this.activePanel === 'npc') {
      const npc = OPEN_WORLD_NPCS.find((n) => n.id === this.activePlotId) ?? OPEN_WORLD_NPCS[0];
      const claimed = data.completedNpcQuests.includes(npc.id);
      const ready = npc.checkComplete(data);
      title = `${npc.icon} ${npc.name}`;
      body = `
        <div class="bw-card highlight" style="margin-bottom:14px;">
          <p style="font-size:15px;color:#f8fafc;line-height:1.5;">“${claimed ? (isIt ? npc.doneTextIt : npc.doneTextEn) : isIt ? npc.greetingIt : npc.greetingEn}”</p>
        </div>
        <div class="bw-card">
          <h3>📋 ${t('npc.mission')}: ${isIt ? npc.questTitleIt : npc.questTitleEn}</h3>
          <p>${isIt ? npc.questDescIt : npc.questDescEn}</p>
          <p><strong>Reward:</strong> +${npc.rewardPips} 🪙, +${npc.rewardCubes} 🟨</p>
          ${
            claimed
              ? `<span class="bw-chip active">✅ ${t('npc.completed')}</span>`
              : ready
                ? `<button class="bw-btn primary" data-claim-npc="${npc.id}">🎁 ${t('modal.claim')}</button>`
                : `<span class="bw-chip">🧭 ${t('npc.inProgress')}</span>`
          }
        </div>
      `;
    } else if (this.activePanel === 'pause') {
      const s = data.settings;
      title = `⏸️ ${t('pause.title')}`;
      body = `
        <div class="bw-grid">
          <div class="bw-card highlight">
            <h3>${t('pause.quality')}</h3>
            <div class="bw-row">
              ${(['low', 'medium', 'high'] as const)
                .map(
                  (q) =>
                    `<button class="bw-chip ${s.quality === q ? 'active' : ''}" data-set-quality="${q}">${q.toUpperCase()}</button>`,
                )
                .join('')}
            </div>
          </div>
          <div class="bw-card">
            <h3>Audio & Visual</h3>
            <div class="bw-row">
              <button class="bw-chip ${s.sfxEnabled ? 'active' : ''}" data-set-toggle="sfxEnabled">${t('pause.sfx')}: ${s.sfxEnabled ? 'ON' : 'OFF'}</button>
              <button class="bw-chip ${s.musicEnabled ? 'active' : ''}" data-set-toggle="musicEnabled">${t('pause.music')}: ${s.musicEnabled ? 'ON' : 'OFF'}</button>
              <button class="bw-chip ${s.screenShake ? 'active' : ''}" data-set-toggle="screenShake">${t('pause.shake')}: ${s.screenShake ? 'ON' : 'OFF'}</button>
              <button class="bw-chip ${s.damageNumbers ? 'active' : ''}" data-set-toggle="damageNumbers">${t('pause.dmgNums')}: ${s.damageNumbers ? 'ON' : 'OFF'}</button>
            </div>
          </div>
          <div class="bw-card">
            <h3>Language / Lingua</h3>
            <div class="bw-row">
              <button class="bw-chip ${getLang() === 'en' ? 'active' : ''}" data-set-lang="en">English (EN)</button>
              <button class="bw-chip ${getLang() === 'it' ? 'active' : ''}" data-set-lang="it">Italiano (IT)</button>
            </div>
          </div>
        </div>
        <div class="bw-row" style="margin-top:16px;justify-content:center;">
          <button class="bw-btn primary" data-close="1">▶ ${t('pause.resume')}</button>
          <button class="bw-btn accent" data-pause-hub="1">🏘️ ${t('pause.toHub')}</button>
          <button class="bw-btn" data-pause-title="1">🏠 ${t('pause.toTitle')}</button>
          <button class="bw-btn" data-pause-reset="1">🗑️ ${t('pause.reset')}</button>
        </div>
      `;
    } else if (this.activePanel === 'quests') {
      title = `📋 ${t('hud.quests')}`;
      body = `<div class="bw-grid">${COMMUNITY_QUESTS.map((q) => {
        const cur = data.stats[q.metric] ?? 0;
        const done = cur >= q.target;
        const claimed = data.claimedQuests.includes(q.id);
        const tracked = data.trackedQuestId === q.id;
        return `
          <div class="bw-card ${tracked ? 'highlight' : ''} ${claimed ? 'claimed' : ''}">
            <h3>${t(q.titleKey)}</h3>
            <p>${t(q.descKey)}</p>
            <p><strong>${Math.min(cur, q.target)} / ${q.target}</strong> · +${q.rewardCubes} 🟨, +${q.rewardPips} 🪙</p>
            <div class="bw-row">
              <button class="bw-btn ${done && !claimed ? 'primary' : ''}" ${done && !claimed ? '' : 'disabled'} data-claim="${q.id}">
                ${claimed ? t('modal.claimed') : t('modal.claim')}
              </button>
              ${!claimed ? `<button class="bw-chip ${tracked ? 'active' : ''}" data-track="${q.id}">${tracked ? t('quest.tracked') : t('quest.track')}</button>` : ''}
            </div>
          </div>
        `;
      }).join('')}</div>`;
    } else if (this.activePanel === 'mods') {
      title = `🟥 ${t('hud.mods')}`;
      body = `<div class="bw-grid">${MOD_BLOCKS.map((m) => {
        const unlocked = data.unlockedMods.includes(m.id);
        const enabled = data.enabledMods.includes(m.id);
        return `
          <div class="bw-card ${enabled ? 'highlight' : ''}">
            <h3>${m.name}</h3>
            <p>${m.desc}</p>
            <button class="bw-btn ${enabled ? 'accent' : 'primary'}" data-mod="${m.id}">
              ${enabled ? 'ON' : unlocked ? 'OFF' : `${t('modal.buy')} (${m.costCubes} 🟨)`}
            </button>
          </div>
        `;
      }).join('')}</div>`;
    }

    this.modalEl.innerHTML = `
      <div class="bw-modal">
        <div class="bw-modal-head">
          <h2>${title}</h2>
          <button class="bw-btn" data-close="1">${t('modal.close')}</button>
        </div>
        <div class="bw-modal-body">${body}</div>
      </div>
    `;

    this.modalEl.querySelector('[data-close]')?.addEventListener('click', () => this.openPanel(null));
    this.modalEl.querySelectorAll('[data-story]').forEach((el) => {
      el.addEventListener('click', () => {
        const chId = (el as HTMLElement).dataset.story!;
        this.openPanel(null);
        this.game.startStoryChapter(chId);
      });
    });
    this.modalEl.querySelectorAll('[data-special-mode]').forEach((el) => {
      el.addEventListener('click', () => {
        const m = (el as HTMLElement).dataset.specialMode;
        this.openPanel(null);
        if (m === 'roguelite') this.game.startRoguelite();
        else this.game.startTitanHunt();
      });
    });
    this.modalEl.querySelectorAll('[data-layer]').forEach((el) => {
      el.addEventListener('click', () => {
        this.labLayer = Number((el as HTMLElement).dataset.layer);
        this.renderPanel();
      });
    });
    this.modalEl.querySelectorAll('[data-lcol]').forEach((el) => {
      el.addEventListener('click', () => {
        this.labColor = Number((el as HTMLElement).dataset.lcol);
        this.renderPanel();
      });
    });
    this.modalEl.querySelectorAll('[data-lx]').forEach((el) => {
      el.addEventListener('click', () => {
        const x = Number((el as HTMLElement).dataset.lx);
        const z = Number((el as HTMLElement).dataset.lz);
        const idx = this.labVoxels.findIndex((v) => v.x === x && v.y === this.labLayer && v.z === z);
        if (idx >= 0) this.labVoxels.splice(idx, 1);
        else this.labVoxels.push({ x, y: this.labLayer, z, color: this.labColor });
        this.renderPanel();
      });
    });
    this.modalEl.querySelector('[data-lab-save]')?.addEventListener('click', () => {
      this.game.saveBrickLabSculpture(this.labVoxels);
      this.openPanel(null);
    });
    this.modalEl.querySelector('[data-lab-clear]')?.addEventListener('click', () => {
      this.labVoxels = [];
      this.renderPanel();
    });
    this.modalEl.querySelectorAll('[data-codex]').forEach((el) => {
      el.addEventListener('click', () => {
        this.codexTab = (el as HTMLElement).dataset.codex as CodexTab;
        this.renderPanel();
      });
    });
    this.modalEl.querySelectorAll('[data-launch]').forEach((el) => {
      el.addEventListener('click', () => {
        const biomeId = (el as HTMLElement).dataset.launch as Parameters<Game['startExpedition']>[0];
        this.openPanel(null);
        this.game.startExpedition(biomeId);
      });
    });
    this.modalEl.querySelectorAll('[data-plot]').forEach((el) => {
      el.addEventListener('click', () => {
        const plotId = (el as HTMLElement).dataset.plot!;
        const theme = (el as HTMLElement).dataset.theme as Parameters<Game['customizeHubPlot']>[1];
        if (this.game.customizeHubPlot(plotId, theme)) {
          this.game.checkAchievements();
          this.renderPanel();
        }
      });
    });
    this.modalEl.querySelectorAll('[data-lib]').forEach((el) => {
      el.addEventListener('click', () => {
        this.libraryTab = (el as HTMLElement).dataset.lib as LibraryTab;
        this.renderPanel();
      });
    });
    this.modalEl.querySelectorAll('[data-open-village]').forEach((el) => {
      el.addEventListener('click', () => {
        const plotId = (el as HTMLElement).dataset.openVillage!;
        this.openPanel('village', plotId);
      });
    });
    this.modalEl.querySelectorAll('[data-craft-weapon]').forEach((el) => {
      el.addEventListener('click', () => {
        const wId = (el as HTMLElement).dataset.craftWeapon!;
        if (this.game.state.craftForgeWeapon(wId)) {
          this.game.sound.playVictory();
          this.game.checkAchievements();
          this.renderPanel();
        }
      });
    });
    this.modalEl.querySelectorAll('[data-buy-mat]').forEach((el) => {
      el.addEventListener('click', () => {
        const k = (el as HTMLElement).dataset.buyMat as keyof SaveDataV1['materials'];
        if (this.game.state.buyMaterial(k)) {
          this.game.sound.playPip(100);
          this.renderPanel();
        }
      });
    });
    this.modalEl.querySelectorAll('[data-sell-mat]').forEach((el) => {
      el.addEventListener('click', () => {
        const k = (el as HTMLElement).dataset.sellMat as keyof SaveDataV1['materials'];
        if (this.game.state.sellMaterial(k)) {
          this.game.sound.playPip(100);
          this.renderPanel();
        }
      });
    });
    this.modalEl.querySelector('[data-trade-cube]')?.addEventListener('click', () => {
      if (this.game.state.exchangeMaterialsForCube()) {
        this.game.sound.playVictory();
        this.renderPanel();
      }
    });
    this.modalEl.querySelectorAll('[data-buff]').forEach((el) => {
      el.addEventListener('click', () => {
        const buff = (el as HTMLElement).dataset.buff as SaveDataV1['activeBuff'];
        const cost = buff === 'overcharge' ? 300 : 220;
        if (this.game.state.activateHerbBuff(buff, cost)) {
          this.game.refreshHeroVisuals();
          this.game.sound.playVictory();
          this.renderPanel();
        }
      });
    });
    this.modalEl.querySelector('[data-go-ow]')?.addEventListener('click', () => {
      this.openPanel(null);
      this.game.startOpenWorld();
    });
    this.modalEl.querySelectorAll('[data-addon-plot]').forEach((el) => {
      el.addEventListener('click', () => {
        const plotId = (el as HTMLElement).dataset.addonPlot!;
        const addon = (el as HTMLElement).dataset.addon as HouseAddonId;
        if (this.game.installHubAddon(plotId, addon)) this.renderPanel();
      });
    });
    this.modalEl.querySelectorAll('[data-select-hero]').forEach((el) => {
      el.addEventListener('click', () => {
        const id = (el as HTMLElement).dataset.selectHero as Parameters<Game['state']['selectHero']>[1];
        this.game.state.selectHero(0, id);
        this.game.refreshHeroVisuals();
        this.renderPanel();
      });
    });
    this.modalEl.querySelectorAll('[data-unlock-hero]').forEach((el) => {
      el.addEventListener('click', () => {
        const id = (el as HTMLElement).dataset.unlockHero as Parameters<Game['state']['unlockHero']>[0];
        if (this.game.state.unlockHero(id)) {
          this.game.state.selectHero(0, id);
          this.game.refreshHeroVisuals();
          this.renderPanel();
        }
      });
    });
    this.modalEl.querySelectorAll('[data-upgrade]').forEach((el) => {
      el.addEventListener('click', () => {
        const kind = (el as HTMLElement).dataset.upgrade as 'damage' | 'heart';
        if (this.game.state.upgradeHero(this.game.state.data.selectedHeroP1, kind)) {
          this.game.refreshHeroVisuals();
          this.game.sound.playBrickSnap();
          this.renderPanel();
        }
      });
    });
    this.modalEl.querySelectorAll('[data-outfit]').forEach((el) => {
      el.addEventListener('click', () => {
        const outfitId = (el as HTMLElement).dataset.outfit as Parameters<Game['buyOrEquipOutfit']>[1];
        if (this.game.buyOrEquipOutfit(this.game.state.data.selectedHeroP1, outfitId)) this.renderPanel();
      });
    });
    this.modalEl.querySelectorAll('[data-claim-npc]').forEach((el) => {
      el.addEventListener('click', () => {
        const npcId = (el as HTMLElement).dataset.claimNpc!;
        const npc = OPEN_WORLD_NPCS.find((n) => n.id === npcId);
        if (npc && this.game.state.claimNpcQuest(npc.id, npc.rewardPips, npc.rewardCubes)) {
          this.game.sound.playVictory();
          this.game.checkAchievements();
          this.renderPanel();
        }
      });
    });
    this.modalEl.querySelectorAll('[data-claim]').forEach((el) => {
      el.addEventListener('click', () => {
        const qId = (el as HTMLElement).dataset.claim!;
        if (this.game.state.claimQuest(qId)) {
          this.game.sound.playVictory();
          this.renderPanel();
        }
      });
    });
    this.modalEl.querySelectorAll('[data-track]').forEach((el) => {
      el.addEventListener('click', () => {
        const qId = (el as HTMLElement).dataset.track!;
        this.game.state.setTrackedQuest(qId);
        this.renderPanel();
      });
    });
    this.modalEl.querySelectorAll('[data-set-quality]').forEach((el) => {
      el.addEventListener('click', () => {
        const q = (el as HTMLElement).dataset.setQuality as 'low' | 'medium' | 'high';
        this.game.applySettings({ quality: q });
        this.renderPanel();
      });
    });
    this.modalEl.querySelectorAll('[data-set-toggle]').forEach((el) => {
      el.addEventListener('click', () => {
        const key = (el as HTMLElement).dataset.setToggle as 'sfxEnabled' | 'musicEnabled' | 'screenShake' | 'damageNumbers';
        this.game.applySettings({ [key]: !this.game.state.data.settings[key] });
        this.renderPanel();
      });
    });
    this.modalEl.querySelectorAll('[data-set-lang]').forEach((el) => {
      el.addEventListener('click', () => {
        setLang((el as HTMLElement).dataset.setLang as 'en' | 'it');
        this.renderTitle();
        this.renderPanel();
      });
    });
    this.modalEl.querySelector('[data-pause-hub]')?.addEventListener('click', () => {
      this.openPanel(null);
      this.game.enterHub();
    });
    this.modalEl.querySelector('[data-pause-title]')?.addEventListener('click', () => {
      this.openPanel(null);
      this.game.mode = 'title';
      this.game.sound.setMusicMood('off');
      this.titleEl.classList.remove('hidden');
      this.renderTitle();
    });
    this.modalEl.querySelector('[data-pause-reset]')?.addEventListener('click', () => {
      if (window.confirm('Reset all Brick-Wilds progress?')) {
        this.game.state.reset();
        this.openPanel(null);
        this.game.enterHub();
      }
    });
    this.modalEl.querySelectorAll('[data-mod]').forEach((el) => {
      el.addEventListener('click', () => {
        const modId = (el as HTMLElement).dataset.mod as Parameters<Game['toggleModBlock']>[0];
        if (this.game.toggleModBlock(modId)) this.renderPanel();
      });
    });
  }

  private setupTouchControls(): void {
    this.touchEl.innerHTML = `
      <div class="bw-stick" id="bw-move-stick"><div class="bw-stick-knob"></div></div>
      <div class="bw-touch-btns">
        <button class="bw-touch-btn fire" data-t="attack">🎯</button>
        <button class="bw-touch-btn dash" data-t="dash">💨</button>
        <button class="bw-touch-btn" data-t="special">⚡</button>
        <button class="bw-touch-btn" data-t="weapon">🔄</button>
        <button class="bw-touch-btn" data-t="jump">⬆️</button>
        <button class="bw-touch-btn" data-t="interact">✋</button>
      </div>
    `;

    const stick = this.touchEl.querySelector('#bw-move-stick') as HTMLElement;
    const knob = stick.querySelector('.bw-stick-knob') as HTMLElement;
    let activeTouchId: number | null = null;

    stick.addEventListener('pointerdown', (e) => {
      activeTouchId = e.pointerId;
      stick.setPointerCapture(e.pointerId);
      updateStick(e);
    });
    stick.addEventListener('pointermove', (e) => {
      if (e.pointerId === activeTouchId) updateStick(e);
    });
    const resetStick = () => {
      activeTouchId = null;
      this.game.input.touchState.moveX = 0;
      this.game.input.touchState.moveZ = 0;
      knob.style.transform = 'translate(0px, 0px)';
    };
    stick.addEventListener('pointerup', resetStick);
    stick.addEventListener('pointercancel', resetStick);

    const updateStick = (e: PointerEvent) => {
      const rect = stick.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const maxR = rect.width * 0.38;
      let dx = e.clientX - cx;
      let dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy);
      if (dist > maxR) {
        dx = (dx / dist) * maxR;
        dy = (dy / dist) * maxR;
      }
      knob.style.transform = `translate(${dx}px, ${dy}px)`;
      this.game.input.touchState.moveX = dx / maxR;
      this.game.input.touchState.moveZ = dy / maxR;
    };

    const bindBtn = (name: string, onDown: () => void, onUp?: () => void) => {
      const btn = this.touchEl.querySelector(`[data-t="${name}"]`);
      btn?.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        onDown();
      });
      if (onUp) {
        btn?.addEventListener('pointerup', onUp);
        btn?.addEventListener('pointercancel', onUp);
      }
    };

    bindBtn(
      'attack',
      () => {
        this.game.input.touchState.attackHeld = true;
        this.game.input.touchState.attackPulse = true;
      },
      () => {
        this.game.input.touchState.attackHeld = false;
      },
    );
    bindBtn('dash', () => {
      this.game.input.touchState.dashPulse = true;
    });
    bindBtn('special', () => {
      this.game.input.touchState.specialPulse = true;
    });
    bindBtn('weapon', () => {
      this.game.input.touchState.cycleWeaponPulse = true;
    });
    bindBtn('jump', () => {
      this.game.input.touchState.jumpPulse = true;
    });
    bindBtn('interact', () => {
      this.game.input.touchState.interactPulse = true;
    });
  }
}
