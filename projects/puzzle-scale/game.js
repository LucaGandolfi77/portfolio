/** Scale Lock — Rompicapo con obiettivo chiaro, feedback, tutorial, scalabile */
const gid = id => document.getElementById(id);

const Game = {
  current: null, moves: 0, timer: 0, interval: null,
  targetSequence: [], playerSequence: [], patternTarget: '',

  init() {
    gid('tutorial-close').addEventListener('click', () => { gid('tutorial-overlay').hidden = true; this.loadLevel(1); });
    document.querySelectorAll('.tab').forEach(t => t.addEventListener('click', () => { document.querySelectorAll('.tab').forEach(x => x.classList.remove('active')); t.classList.add('active'); document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active')); gid('tab-' + t.dataset.tab).classList.add('active'); if (t.dataset.tab === 'levels') this.renderLevels(); if (t.dataset.tab === 'stats') this.renderStats(); }));
    gid('btn-undo').addEventListener('click', () => this.undo());
    gid('btn-hint').addEventListener('click', () => this.showHint());
    gid('btn-next').addEventListener('click', () => { if (this.current) this.loadLevel(Math.min(200, this.current.level + 1)); });
    // Mostra tutorial all'avvio
    gid('tutorial-overlay').hidden = false;
  },

  generateTarget(level) {
    const s = 3 + Math.min(Math.floor(level / 8), 5);
    const total = s * s;
    const length = Math.min(Math.max(3, Math.floor(s * 1.5)), s * s);
    const seed = level * 31 + 7;
    const seq = [];
    for (let i = 0; i < length; i++) seq.push({ r: (seed + i * 13) % s, c: (seed + i * 17) % s });
    // Deduplicazione sequenziale (non ripetere stessa cella consecutiva)
    const deduped = seq.filter((v, i) => i === 0 || v.r !== seq[i - 1].r || v.c !== seq[i - 1].c);
    return { sequence: deduped, level, size: s, length: deduped.length };
  },

  loadLevel(level) {
    const target = this.generateTarget(level);
    this.current = { level, size: target.size, sequence: target.sequence, length: target.length };
    this.targetSequence = target.sequence.map(v => v.r + '-' + v.c);
    this.playerSequence = [];
    this.moves = 0; this.timer = 0; clearInterval(this.interval);
    gid('level-label').textContent = 'Lv ' + level;
    gid('moves-count').textContent = 'Mosse: 0';
    gid('timer').textContent = '00:00';
    gid('sequence-ok').textContent = 'Sequenza: 0 / ' + target.length;
    gid('objective-banner').textContent = 'Obiettivo: ricostruisci il pattern di ' + target.length + ' mosse nel giusto ordine (griglia ' + target.size + '×' + target.size + ')';
    this.interval = setInterval(() => { this.timer++; const m = Math.floor(this.timer / 60).toString().padStart(2, '0'); const s = (this.timer % 60).toString().padStart(2, '0'); gid('timer').textContent = m + ':' + s; }, 1000);
    this.renderBoard();
  },

  renderBoard() {
    const board = gid('board'); board.innerHTML = '';
    const s = this.current.size;
    board.style.gridTemplateColumns = `repeat(${s}, 1fr)`;
    for (let r = 0; r < s; r++) {
      for (let c = 0; c < s; c++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.r = r; cell.dataset.c = c;
        // Mostra se questa cella è nel target in ordine
        const idx = this.targetSequence.indexOf(r + '-' + c);
        if (idx >= 0) cell.textContent = (idx + 1).toString();
        cell.addEventListener('click', () => this.handleClick(r, c));
        board.appendChild(cell);
      }
    }
  },

  handleClick(r, c) {
    if (!this.current) return;
    const key = r + '-' + c;
    const expected = this.targetSequence[this.playerSequence.length];
    if (key === expected) {
      this.playerSequence.push(key);
      this.moves++;
      gid('moves-count').textContent = 'Mosse: ' + this.moves;
      gid('sequence-ok').textContent = 'Sequenza: ' + this.playerSequence.length + ' / ' + this.current.length;
      // Feedback visivo
      const cells = document.querySelectorAll('.cell');
      for (let cell of cells) { if (cell.dataset.r == r && cell.dataset.c == c) { cell.style.background = 'linear-gradient(135deg,#2ecc71,#27ae60)'; cell.style.color = '#fff'; } }
      // Feedback audio sintetico
      try { const ctx = new (window.AudioContext || window.webkitAudioContext)(); const osc = ctx.createOscillator(); const g = ctx.createGain(); osc.connect(g); g.connect(ctx.destination); osc.frequency.value = 880 + (this.moves * 20); osc.type = 'triangle'; g.gain.setValueAtTime(0.05, ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15); osc.start(); osc.stop(ctx.currentTime + 0.15); } catch (e) {}
      if (this.playerSequence.length >= this.current.length) {
        this.winLevel();
      }
    } else {
      // Mossa sbagliata: feedback visivo rosso
      const cells = document.querySelectorAll('.cell');
      for (let cell of cells) { if (cell.dataset.r == r && cell.dataset.c == c) { cell.style.background = '#e94560'; setTimeout(() => { cell.style.background = ''; }, 300); } }
      // Feedback audio basso
      try { const ctx = new (window.AudioContext || window.webkitAudioContext)(); const osc = ctx.createOscillator(); const g = ctx.createGain(); osc.connect(g); g.connect(ctx.destination); osc.frequency.value = 200; osc.type = 'sawtooth'; g.gain.setValueAtTime(0.1, ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3); osc.start(); osc.stop(ctx.currentTime + 0.3); } catch (e) {}
      gid('sequence-ok').textContent = 'Sequenza: ' + this.playerSequence.length + ' / ' + this.current.length + ' (correzione richiesta)';
    }
  },

  winLevel() {
    clearInterval(this.interval); this.interval = null;
    alert('🎉 Livello ' + this.current.level + ' completato in ' + this.moves + ' mosse!');
    this.loadLevel(Math.min(200, this.current.level + 1));
  },

  undo() {
    if (this.playerSequence.length === 0) return;
    this.playerSequence.pop();
    this.moves = Math.max(0, this.moves - 1);
    gid('moves-count').textContent = 'Mosse: ' + this.moves;
    gid('sequence-ok').textContent = 'Sequenza: ' + this.playerSequence.length + ' / ' + this.current.length;
    this.renderBoard();
  },

  showHint() {
    if (!this.current || !this.current.sequence.length) return;
    const next = this.current.sequence[this.playerSequence.length];
    const cell = document.querySelector('.cell[data-r="' + next.r + '"][data-c="' + next.c + '"]');
    if (cell) { cell.style.border = '3px solid #e94560'; cell.style.boxShadow = '0 0 12px #e94560'; setTimeout(() => { cell.style.border = ''; cell.style.boxShadow = ''; }, 1000); }
  },

  renderLevels() {
    const grid = gid('level-grid'); grid.innerHTML = '';
    for (let i = 1; i <= 30; i++) {
      const btn = document.createElement('button');
      btn.className = 'level-btn' + (i === this.current ? this.current.level ? '.current' : '' : '');
      btn.textContent = 'Lv ' + i;
      btn.addEventListener('click', () => { this.loadLevel(i); document.querySelectorAll('.tab').forEach(x => x.classList.remove('active')); document.querySelector('[data-tab="game"]').classList.add('active'); gid('tab-game').classList.add('active'); document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active')); gid('tab-game').classList.add('active'); gid('tutorial-overlay').hidden = true; });
      grid.appendChild(btn);
    }
  },

  renderStats() {
    const stats = gid('stats-grid'); stats.innerHTML = '';
    const cards = [
      { label: 'Livello attuale', value: (this.current ? this.current.level : 0) },
      { label: 'Livelli disponibili', value: '30 (∞ scalabile)' },
      { label: 'Mosse totali', value: this.moves || 0 },
      { label: 'Sequenza completa', value: (this.current ? (this.playerSequence.length + '/' + this.current.length) : '0/0') }
    ];
    cards.forEach(c => { const div = document.createElement('div'); div.className = 'stat-card'; div.innerHTML = '<div class="stat-value">' + c.value + '</div><div>' + c.label + '</div>'; stats.appendChild(div); });
  }
};

document.addEventListener('DOMContentLoaded', () => Game.init());
