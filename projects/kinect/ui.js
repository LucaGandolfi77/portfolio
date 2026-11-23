/* Kinetic — DOM controller */

const $ = id => document.getElementById(id);

export class UI {
  constructor(handlers, i18n) {
    this.h = handlers;
    this.i18n = i18n;
    this.lang = i18n.lang;
    this.mode = 'classic';
    this.difficulty = 'normal';
    this.input = 'camera';
    this.el = {
      overlay: $('overlay'), cards: {
        start: $('card-start'), loading: $('card-loading'), error: $('card-error'),
        pause: $('card-pause'), over: $('card-over')
      },
      score: $('score'), time: $('time'), combo: $('combo'), accuracy: $('accuracy'),
      best: $('bestScore'), handHint: $('handHint'), popups: $('popups'),
      errorText: $('errorText'), pauseScore: $('pauseScore'), pauseTime: $('pauseTime'),
      finalScore: $('finalScore'), finalAccuracy: $('finalAccuracy'),
      finalCombo: $('finalCombo'), finalBest: $('finalBest'),
      soundBtn: $('soundBtn'), orientation: $('orientationHint'),
      settings: $('settings'), toast: $('toast')
    };
  }

  init() {
    this.applyLang();
    const bind = (id, fn) => { const el = $(id); if (el) el.addEventListener('click', fn); };
    bind('startBtn', () => this.h.onStart && this.h.onStart());
    bind('retryBtn', () => this.h.onRetry && this.h.onRetry());
    bind('resumeBtn', () => this.h.onResume && this.h.onResume());
    bind('restartBtn', () => this.h.onRestart && this.h.onRestart());
    bind('againBtn', () => this.h.onRestart && this.h.onRestart());
    bind('soundBtn', () => this.h.onSound && this.h.onSound());
    bind('pauseBtn', () => this.h.onPause && this.h.onPause());
    bind('settingsBtn', () => this.toggleSettings(true));
    bind('settingsClose', () => this.toggleSettings(false));

    document.querySelectorAll('[data-mode]').forEach(btn => btn.addEventListener('click', () => {
      this.mode = btn.dataset.mode;
      this.select('data-mode', btn);
      this.h.onOptions && this.h.onOptions(this.options());
    }));
    document.querySelectorAll('[data-difficulty]').forEach(btn => btn.addEventListener('click', () => {
      this.difficulty = btn.dataset.difficulty;
      this.select('data-difficulty', btn);
      this.h.onOptions && this.h.onOptions(this.options());
    }));
    document.querySelectorAll('[data-input]').forEach(btn => btn.addEventListener('click', () => {
      this.input = btn.dataset.input;
      this.select('data-input', btn);
      this.h.onOptions && this.h.onOptions(this.options());
    }));

    const mirror = $('mirrorChk');
    if (mirror) mirror.addEventListener('change', () => this.h.onMirror && this.h.onMirror(mirror.checked));
    const sens = $('sensitivityRng');
    if (sens) sens.addEventListener('input', () => this.h.onSensitivity && this.h.onSensitivity(Number(sens.value) / 100));
    const quality = $('qualitySel');
    if (quality) quality.addEventListener('change', () => this.h.onQuality && this.h.onQuality(quality.value));
  }

  select(attr, active) {
    document.querySelectorAll('[' + attr + ']').forEach(b => {
      b.classList.toggle('active', b === active);
      b.setAttribute('aria-pressed', String(b === active));
    });
  }

  options() { return { mode: this.mode, difficulty: this.difficulty, input: this.input }; }

  applyLang() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n.replace(/^kinect\./, '');
      const value = this.i18n.t(key);
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') el.value = value;
      else el.textContent = value;
    });
  }

  showScreen(name) {
    const cards = this.el.cards;
    Object.entries(cards).forEach(([key, el]) => { if (el) el.hidden = key !== name; });
    if (this.el.overlay) this.el.overlay.hidden = name === 'none';
    document.body.dataset.state = name === 'none' ? 'playing' : name;
  }

  resetSteps() {
    document.querySelectorAll('[data-step]').forEach(el => {
      el.classList.remove('active', 'done');
      el.querySelector('.step-dot').textContent = '○';
    });
  }

  setStep(step, status) {
    const el = document.querySelector(`[data-step="${step}"]`);
    if (!el) return;
    el.classList.toggle('active', status === 'active');
    el.classList.toggle('done', status === 'done');
    const dot = el.querySelector('.step-dot');
    if (dot) dot.textContent = status === 'done' ? '✓' : status === 'active' ? '◐' : '○';
  }

  setError(code) {
    const key = ({
      permission: 'permission', notfound: 'notfound', busy: 'busy', insecure: 'insecure',
      unsupported: 'unsupported', model: 'modelError'
    })[code] || 'generic';
    if (this.el.errorText) this.el.errorText.textContent = this.i18n.t(key);
  }

  updateHUD(game) {
    if (!game) return;
    if (this.el.score) this.el.score.textContent = String(game.score);
    if (this.el.time) this.el.time.textContent = String(Math.ceil(game.timeLeft));
    if (this.el.combo) this.el.combo.textContent = '×' + game.multiplier;
    if (this.el.accuracy) this.el.accuracy.textContent = game.hits + game.misses ? game.accuracy + '%' : '—';
  }

  setHandHint(visible) {
    if (this.el.handHint) this.el.handHint.classList.toggle('visible', !!visible);
  }

  setOrientation(visible) {
    if (this.el.orientation) this.el.orientation.classList.toggle('visible', !!visible);
  }

  setBest(value) {
    if (this.el.best) this.el.best.textContent = String(value || 0);
  }

  setSound(muted) {
    if (this.el.soundBtn) this.el.soundBtn.textContent = muted ? '🔇' : '🔊';
  }

  showSummary(game, best) {
    const s = game.summary();
    if (this.el.finalScore) this.el.finalScore.textContent = String(s.score);
    if (this.el.finalAccuracy) this.el.finalAccuracy.textContent = s.accuracy + '%';
    if (this.el.finalCombo) this.el.finalCombo.textContent = String(s.maxCombo);
    if (this.el.finalBest) this.el.finalBest.textContent = String(best);
    if (this.el.pauseScore) this.el.pauseScore.textContent = String(game.score);
    if (this.el.pauseTime) this.el.pauseTime.textContent = String(Math.ceil(game.timeLeft));
  }

  popup(text, x, y, hue) {
    if (!this.el.popups) return;
    const el = document.createElement('span');
    el.className = 'popup';
    el.textContent = text;
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    el.style.color = `hsl(${hue},100%,72%)`;
    this.el.popups.appendChild(el);
    setTimeout(() => el.remove(), 900);
  }

  toast(text) {
    if (!this.el.toast) return;
    this.el.toast.textContent = text;
    this.el.toast.classList.add('visible');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => this.el.toast.classList.remove('visible'), 2000);
  }

  toggleSettings(open) {
    if (!this.el.settings) return;
    this.el.settings.hidden = !open;
  }
}
