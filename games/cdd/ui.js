/* CDD RUN — HUD, overlays, tutorial and bilingual strings */

import { meta } from './state.js';

const DICT = {
  en: {
    back: 'Portfolio', tagline: 'Endless runner · zero dependencies',
    score: 'SCORE', coins: 'COINS', combo: 'COMBO', level: 'LV', speed: 'SPEED', best: 'BEST',
    pause: 'Pause', start: 'PLAY', tutorial: 'TUTORIAL', resume: 'RESUME', restart: 'RESTART', quit: 'QUIT',
    gameOver: 'GAME OVER', finalScore: 'Score', finalCoins: 'Coins', finalDistance: 'Distance',
    finalCombo: 'Best combo', newRecord: '🎉 NEW RECORD!', meters: 'm',
    tutorialTitle: 'How to play', gotIt: 'GOT IT',
    tutorial1: '◀ ▶ or A / D — switch lane',
    tutorial2: '↑ or SPACE — jump over low obstacles',
    tutorial3: '✕ tall obstacles cannot be jumped — dodge them',
    tutorial4: 'Collect 🪙 coins and powerups: 🛡️ shield, 🧲 magnet, ⚡ turbo',
    tutorial5: 'Chain coins to build a combo multiplier. Press P to pause.',
    powerShield: 'SHIELD', powerMagnet: 'MAGNET', powerTurbo: 'TURBO',
    tapHint: 'Tap or press SPACE to start', pausedTitle: 'PAUSED', pausedHint: 'Take a breath, then jump back in.',
    controlLeft: 'Move left', controlRight: 'Move right', controlJump: 'Jump'
  },
  it: {
    back: 'Portfolio', tagline: 'Endless runner · zero dipendenze',
    score: 'PUNTI', coins: 'MONETE', combo: 'COMBO', level: 'LIV', speed: 'VEL', best: 'RECORD',
    pause: 'Pausa', start: 'GIOCA', tutorial: 'TUTORIAL', resume: 'RIPRENDI', restart: 'RIAVVIA', quit: 'ESCI',
    gameOver: 'FINE PARTITA', finalScore: 'Punteggio', finalCoins: 'Monete', finalDistance: 'Distanza',
    finalCombo: 'Combo migliore', newRecord: '🎉 NUOVO RECORD!', meters: 'm',
    tutorialTitle: 'Come si gioca', gotIt: 'HO CAPITO',
    tutorial1: '◀ ▶ o A / D — cambia corsia',
    tutorial2: '↑ o SPAZIO — salta gli ostacoli bassi',
    tutorial3: '✕ gli ostacoli alti non si saltano — schivali',
    tutorial4: 'Raccogli 🪙 monete e potenziamenti: 🛡️ scudo, 🧲 magnete, ⚡ turbo',
    tutorial5: 'Collega le monete per il moltiplicatore combo. P per la pausa.',
    powerShield: 'SCUDO', powerMagnet: 'MAGNETE', powerTurbo: 'TURBO',
    tapHint: 'Tocca o premi SPAZIO per iniziare', pausedTitle: 'IN PAUSA', pausedHint: 'Prendi fiato, poi torna in corsa.',
    controlLeft: 'Vai a sinistra', controlRight: 'Vai a destra', controlJump: 'Salta'
  }
};

export class UI {
  constructor(handlers = {}) {
    this.handlers = handlers;
    this.lang = meta.lang;
    this.el = {};
    [
      'score', 'coins', 'combo', 'level', 'speed', 'best', 'powerup',
      'pauseBtn', 'muteBtn', 'langBtn', 'startScreen', 'pauseScreen', 'overScreen', 'tutorialScreen',
      'finalScore', 'finalCoins', 'finalDistance', 'finalCombo', 'newRecord', 'startBest'
    ].forEach(id => { this.el[id] = document.getElementById(id); });
  }

  t(key) { return (DICT[this.lang] && DICT[this.lang][key]) || DICT.en[key] || key; }

  init() {
    this.applyLang(this.lang, true);
    const h = this.handlers;
    const bind = (id, fn) => {
      const el = document.getElementById(id);
      if (el && fn) el.addEventListener('click', fn);
    };
    bind('btnStart', h.onStart);
    bind('btnTutorial', h.onTutorial);
    bind('btnResume', h.onResume);
    bind('btnRestartPause', h.onRestart);
    bind('btnQuitPause', h.onQuit);
    bind('btnAgain', h.onRestart);
    bind('btnQuitOver', h.onQuit);
    bind('btnTutorialClose', h.onTutorialClose);
    bind('pauseBtn', h.onPause);
    bind('muteBtn', h.onMute);
    bind('langBtn', () => h.onLang(this.lang === 'en' ? 'it' : 'en'));
    this.setMuted(meta.muted);
    this.setBest(meta.highScore);

    const left = document.getElementById('ctrlLeft');
    const right = document.getElementById('ctrlRight');
    const jump = document.getElementById('ctrlJump');
    if (left) left.setAttribute('aria-label', this.t('controlLeft'));
    if (right) right.setAttribute('aria-label', this.t('controlRight'));
    if (jump) jump.setAttribute('aria-label', this.t('controlJump'));
  }

  applyLang(lang, silent = false) {
    this.lang = lang === 'en' ? 'en' : 'it';
    document.documentElement.lang = this.lang;
    document.querySelectorAll('[data-i18n]').forEach(node => {
      const key = node.getAttribute('data-i18n');
      if (node.tagName === 'SPAN' && /^(score|coins|combo|level|speed|best)$/.test(key)) {
        node.textContent = this.t(key);
      } else {
        node.textContent = this.t(key);
      }
    });
    this.el.langBtn.textContent = this.lang === 'it' ? '🇮🇹 IT' : '🇬🇧 EN';
    const left = document.getElementById('ctrlLeft');
    const right = document.getElementById('ctrlRight');
    const jump = document.getElementById('ctrlJump');
    if (left) left.setAttribute('aria-label', this.t('controlLeft'));
    if (right) right.setAttribute('aria-label', this.t('controlRight'));
    if (jump) jump.setAttribute('aria-label', this.t('controlJump'));
    if (!silent) this.handlers.onLangSaved?.(this.lang);
  }

  setMuted(muted) {
    this.el.muteBtn.textContent = muted ? '🔇' : '🔊';
    this.el.muteBtn.setAttribute('aria-label', muted ? 'Unmute' : 'Mute');
  }

  setBest(value) {
    this.el.best.textContent = Math.floor(value);
    this.el.startBest.textContent = value > 0 ? `🏆 ${this.t('best')}: ${Math.floor(value)}` : '';
  }

  showScreen(name) {
    ['start', 'pause', 'over', 'tutorial'].forEach(key => {
      this.el[key + 'Screen'].classList.toggle('hidden', key !== name);
    });
    document.body.dataset.screen = name || 'none';
  }

  updateHUD(world) {
    this.el.score.textContent = Math.floor(world.score);
    this.el.coins.textContent = world.coins;
    this.el.combo.textContent = '×' + world.multiplier;
    this.el.combo.classList.toggle('hot', world.combo >= 5);
    this.el.level.textContent = world.level;
    this.el.speed.textContent = (world.speed / 340).toFixed(1) + '×';
    if (world.powerup) {
      const labels = { shield: 'powerShield', magnet: 'powerMagnet', turbo: 'powerTurbo' };
      const icons = { shield: '🛡️', magnet: '🧲', turbo: '⚡' };
      this.el.powerup.textContent = `${icons[world.powerup]} ${this.t(labels[world.powerup])} · ${Math.max(0, world.powerupTimer).toFixed(1)}s`;
      this.el.powerup.classList.add('visible');
      this.el.powerup.dataset.type = world.powerup;
    } else {
      this.el.powerup.classList.remove('visible');
    }
  }

  setPaused(paused) {
    this.el.pauseBtn.textContent = paused ? '▶' : '⏸';
    this.el.pauseBtn.setAttribute('aria-label', paused ? this.t('resume') : this.t('pause'));
  }

  showOver(session, isRecord) {
    this.el.finalScore.textContent = session.score;
    this.el.finalCoins.textContent = session.coins;
    this.el.finalDistance.textContent = session.distance + ' ' + this.t('meters');
    this.el.finalCombo.textContent = '×' + session.maxCombo;
    this.el.newRecord.classList.toggle('hidden', !isRecord);
    this.showScreen('over');
  }
}
