const gid = id => document.getElementById(id);

const App = {
  timerInterval: null,
  timerRemaining: 1500,
  init() {
    Mixer.init();
    this.setupTabs();
    this.setupTimer();
    this.loadPresets();
    gid('btn-play').addEventListener('click', () => {
      Mixer.startAmbient('rain'); // default ambient
      gid('status').textContent = 'Ambient attivo — zero server';
    });
    document.getElementById('btn-timer').addEventListener('click', () => this.toggleTimer());
  },
  setupTabs() {
    document.querySelectorAll('.tab').forEach(t => t.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(x => x.classList.remove('active'));
      t.classList.add('active');
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      gid('tab-' + t.dataset.tab).classList.add('active');
    }));
  },
  loadPresets() {
    const grid = gid('preset-grid');
    const presets = [window.presetRain, window.presetForest, window.presetOcean, window.presetFire];
    presets.forEach(p => {
      const card = document.createElement('div');
      card.className = 'preset-card';
      card.innerHTML = `<h3>${p.name}</h3><p>${p.desc}</p>`;
      card.addEventListener('click', () => Mixer.startAmbient(p.type));
      grid.appendChild(card);
    });
  },
  toggleTimer() {
    if (this.timerInterval) { clearInterval(this.timerInterval); this.timerInterval = null; gid('btn-timer').textContent = 'Avvia Pomodoro'; gid('timer-display').textContent = '25:00'; this.timerRemaining = 1500; }
    else { this.timerInterval = setInterval(() => { this.timerRemaining--; const m = Math.floor(this.timerRemaining / 60); const s = this.timerRemaining % 60; gid('timer-display').textContent = m.toString().padStart(2, '0') + ':' + s.toString().padStart(2, '0'); if (this.timerRemaining <= 0) { clearInterval(this.timerInterval); this.timerInterval = null; gid('timer-display').textContent = 'Fatto!'; } }, 1000); gid('btn-timer').textContent = 'Pausa'; }
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());
