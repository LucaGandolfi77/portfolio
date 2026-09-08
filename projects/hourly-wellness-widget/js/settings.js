// settings.js — Settings panel integration for Hourly Wellness Widget
// Uses the existing tab system; no duplicate toggle logic

function gid(id) { return document.getElementById(id); }

const Settings = {
  init() {
    this.loadPrefs();
    this.updateStatsDisplay();
    this.bindLanguageToggle();
    this.bindResetButton();
  },

  loadPrefs() {
    const saved = localStorage.getItem('hww_settings');
    if (saved) {
      const prefs = JSON.parse(saved);
      if (prefs.theme) this.setTheme(prefs.theme);
      if (prefs.sound !== undefined) {
        const soundInput = gid('sound-on');
        if (soundInput) soundInput.checked = prefs.sound;
      }
    }
  },

  setTheme(theme) {
    const html = document.documentElement;
    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      html.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    } else {
      html.setAttribute('data-theme', theme);
    }
    // Persist
    const prefs = JSON.parse(localStorage.getItem('hww_settings')) || {};
    prefs.theme = theme;
    localStorage.setItem('hww_settings', JSON.stringify(prefs));
  },

  bindLanguageToggle() {
    // Language is handled by i18n.js applyLang(), but we can add a toggle here if needed
    // For now, just ensure the current language is applied
    if (typeof window.applyLang === 'function') {
      window.applyLang();
    }
  },

  bindResetButton() {
    const btn = gid('reset-stats');
    if (!btn) return;
    btn.addEventListener('click', () => this.confirmReset());
  },

  confirmReset() {
    if (!window.confirm) return;
    if (window.confirm('Resettare tutte le statistiche?')) {
      localStorage.removeItem('hww_stats');
      localStorage.removeItem('hww_settings');
      this.updateStatsDisplay();
      if (typeof window.alert === 'function') window.alert('Statistiche resettate.');
    }
  },

  updateStatsDisplay() {
    const stats = JSON.parse(localStorage.getItem('hww_stats'));
    if (!stats) return;
    gid('total-streak').textContent = (stats.streak || 0) + '🔥';
    gid('total-breaks').textContent = stats.totalBreaks || '0';
    gid('last-break').textContent = stats.lastBreak ? new Date(stats.lastBreak).toLocaleDateString('it-IT') : '—';
    gid('minutes-saved').textContent = (stats.totalBreaks || 0) + 'm';
  }
};

// Initialize settings module when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  Settings.init();
});