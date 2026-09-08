/**
 * Hourly Wellness Widget — Main App
 * Pattern: SHHH-reader app.js, simplified for breathing widget
 */

var gid = id => document.getElementById(id)
var clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v))
var ls = (k, def) => { try { const v = JSON.parse(localStorage.getItem('hww_' + k)); return v !== null ? v : def } catch { return def } }
var lss = (k, v) => localStorage.setItem('hww_' + k, JSON.stringify(v))

const App = {
  mode: 'threshold',
  tab: 'home',
  breathingActive: false,
  breathingInterval: null,
  breathingPhase: 'inhale',
  remainingSeconds: 60,
  settings: { frequency: '1h', theme: 'dark', sound: true },
  stats: { streak: 0, totalBreaks: 0, lastBreak: null, minutesSaved: 0 },

  async init() {
    this.loadPrefs()
    this.loadStats()
    this.renderUI()
    this.setupEvents()
    this.initCanvas()
    this.setupNotifications()
    this.setupWidget()
    this.setTheme()
  },

  loadPrefs() {
    const s = ls('settings', null)
    if (s) this.settings = { ...this.settings, ...s }
  },

  savePrefs() {
    lss('settings', this.settings)
  },

  loadStats() {
    const st = ls('stats', null)
    if (st) this.stats = { ...this.stats, ...st }
  },

  saveStats() {
    lss('stats', this.stats)
  },

  renderUI() {
    gid('streak-value').textContent = '🔥 ' + (this.stats.streak || 1)
    gid('total-streak').textContent = (this.stats.streak || 1) + '🔥'
    gid('total-breaks').textContent = this.stats.totalBreaks || '0'
    gid('last-break').textContent = this.stats.lastBreak ? new Date(this.stats.lastBreak).toLocaleDateString('it-IT') : '—'
    gid('minutes-saved').textContent = Math.round((this.stats.totalBreaks || 0) * 1) + 'm'
    this.updateCountdown()
  },

  updateCountdown() {
    const el = gid('countdown');
    const now = new Date();
    const minutes = 60 - now.getMinutes();
    const seconds = 60 - now.getSeconds();
    el.textContent = 'Tra prossima pausa: ' + minutes + 'm ' + seconds.toString().padStart(2, '0') + 's';
  },

  initCanvas() {
    const canvas = gid('breath-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const size = Math.min(window.innerWidth * 0.6, 300);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';
    ctx.scale(dpr, dpr);
    this.drawBreathingCircle(ctx, size / 2, size / 2, 80);
  },

  drawBreathingCircle(ctx, cx, cy, r) {
    const pulse = Math.sin(Date.now() / 500) * 5 + r;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    // glow
    ctx.beginPath();
    ctx.arc(cx, cy, pulse * 1.2, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(233, 69, 96, 0.15)';
    ctx.fill();
    // main circle
    ctx.beginPath();
    ctx.arc(cx, cy, pulse, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(233, 69, 96, 0.25)';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#e94560';
    ctx.stroke();
    // text
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Respira', cx, cy - 8);
    ctx.font = '14px -apple-system, sans-serif';
    ctx.fillText('Clicca per iniziare', cx, cy + 12);
  },

  setupEvents() {
    // Tabs
    document.querySelectorAll('.tab').forEach(el => {
      el.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        el.classList.add('active');
        this.tab = el.dataset.tab;
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        gid('tab-' + this.tab).classList.add('active');
      })
    })

    // Start break button
    gid('start-break').addEventListener('click', () => this.startBreak())
    gid('focus-close').addEventListener('click', () => this.stopBreak())

    // Settings
    document.querySelectorAll('#tab-settings input').forEach(i => {
      i.addEventListener('change', () => {
        if (i.name === 'freq') this.settings.frequency = i.value;
        if (i.name === 'theme') this.setTheme(i.value);
        if (i.name === 'sound') this.settings.sound = (i.value === 'on');
        this.savePrefs();
        this.renderUI();
      })
    })

    gid('reset-stats').addEventListener('click', () => {
      if (confirm('Resettare tutte le statistiche?')) {
        this.stats = { streak: 0, totalBreaks: 0, lastBreak: null, minutesSaved: 0 };
        this.saveStats();
        this.renderUI();
      }
    })
  },

  startBreak() {
    if (this.breathingActive) return;
    this.breathingActive = true;
    this.remainingSeconds = 60;
    this.breathingPhase = 'inhale';
    gid('focus-overlay').hidden = false;

    this.breathingInterval = setInterval(() => {
      this.remainingSeconds--;
      gid('focus-count').textContent = this.breathingPhase === 'inhale' ? 'Inspira...' : 'Espira...';
      if (this.remainingSeconds <= 0) {
        this.stopBreak();
        this.stats.streak++;
        this.stats.totalBreaks++;
        this.stats.lastBreak = new Date().toISOString();
        this.stats.minutesSaved = Math.round(this.stats.totalBreaks);
        this.saveStats();
        this.renderUI();
        alert('🎉 Pausa completata! Serie incrementata.');
      } else {
        // Toggle inhale/exhale every 4 seconds
        if (this.remainingSeconds % 10 < 10) this.breathingPhase = 'inhale';
        else this.breathingPhase = 'exhale';
      }
    }, 1000);
  },

  stopBreak() {
    this.breathingActive = false;
    this.remainingSeconds = 60;
    clearInterval(this.breathingInterval);
    gid('focus-overlay').hidden = true;
    gid('focus-count').textContent = 'Sei pronto?';
  },

  setTheme(mode) {
    const theme = mode || this.settings.theme;
    document.documentElement.setAttribute('data-theme', theme);
    this.settings.theme = theme;
  },

  setupNotifications() {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'granted') {
      this.scheduleReminder();
    }
  },

  scheduleReminder() {
    // Simple hourly reminder
    if (Notification.permission === 'granted') {
      setInterval(() => {
        new Notification('Hourly Wellness Widget', {
          body: 'Tempo per una pausa di respirazione di 60 secondi.',
          icon: '/icons/icon-192.png',
          tag: 'hourly-break',
          renotify: false,
        });
      }, 60 * 60 * 1000); // Every hour
    }
  },

  setupWidget() {
    // Minimal widget registration attempt
    try {
      if (window.widget) {
        window.widget.register('hourly-wellness', {
          description: 'Quick 60-second breathing break',
          preview: '/icons/icon-192.png',
        });
      }
    } catch (e) {
      // Widget not supported
    }
  },
};

document.addEventListener('DOMContentLoaded', () => App.init());
