const gid = id => document.getElementById(id);

const App = {
  timerInterval: null,
  timerRemaining: 1500,
  init() {
    // I listener prima di tutto il resto: una eccezione in init non deve
    // lasciare i pulsanti senza gestore (era il caso di setupTimer, mai definito).
    this.setupTabs();
    gid('btn-play').addEventListener('click', () => this.play('rain'));
    gid('btn-stop').addEventListener('click', () => this.stop());
    gid('btn-timer').addEventListener('click', () => this.toggleTimer());
    this.loadPresets();
    Mixer.init();
  },
  play(type, label) {
    Mixer.startAmbient(type);
    const names = { rain: 'Pioggia', forest: 'Foresta', ocean: 'Mare', fire: 'Fuoco' };
    gid('status').textContent = 'In riproduzione: ' + (label || names[type] || type);
  },
  stop() {
    Mixer.stop();
    gid('status').textContent = 'Fermo.';
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
      card.addEventListener('click', () => this.play(p.type, p.name));
      grid.appendChild(card);
    });
  },
  toggleTimer() {
    if (this.timerInterval) { clearInterval(this.timerInterval); this.timerInterval = null; gid('btn-timer').textContent = 'Avvia Pomodoro'; gid('timer-display').textContent = '25:00'; this.timerRemaining = 1500; }
    else { this.timerInterval = setInterval(() => { this.timerRemaining--; const m = Math.floor(this.timerRemaining / 60); const s = this.timerRemaining % 60; gid('timer-display').textContent = m.toString().padStart(2, '0') + ':' + s.toString().padStart(2, '0'); if (this.timerRemaining <= 0) { clearInterval(this.timerInterval); this.timerInterval = null; gid('timer-display').textContent = 'Fatto!'; } }, 1000); gid('btn-timer').textContent = 'Pausa'; }
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());
