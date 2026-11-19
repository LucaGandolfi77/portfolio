/* =============================================================================
   QuizLab — motore condiviso per i quiz approfonditi del portfolio.
   Carica un file JSON, gestisce lingua/tema, domande con spiegazione,
   punteggio, rank e card condivisibile.
   Uso: QuizLab.run({ data:'../../assets/quizzes/stem-physics.json', slug:'stem-physics' })
   ============================================================================= */
(function () {
'use strict';

const $ = id => document.getElementById(id);
const LANGS = ['it','en'];
function txt(v, lang) {
  if (v == null) return '';
  if (typeof v === 'string') return v;
  return v[lang] || v.en || v.it || '';
}
function esc(s) { return String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

class QuizLab {
  constructor(cfg) {
    this.cfg = cfg;
    this.lang = localStorage.getItem('lang') || 'en';
    if (LANGS.indexOf(this.lang) < 0) this.lang = 'en';
    this.data = null;
    this.idx = 0;
    this.score = 0;
    this.picked = -1;
    this.answers = [];
    this.initUI();
    this.load();
  }

  initUI() {
    const theme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    const tt = $('themeToggle');
    if (tt) {
      const sync = () => { tt.textContent = document.documentElement.getAttribute('data-theme') === 'light' ? '☀️' : '🌙'; };
      sync();
      tt.onclick = () => {
        const next = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('theme', next); sync();
      };
    }
    const ls = $('langSelect');
    if (ls) {
      ls.value = this.lang;
      ls.onchange = () => {
        this.lang = ls.value || 'en';
        localStorage.setItem('lang', this.lang);
        this.idx = 0; this.score = 0; this.picked = -1; this.answers = [];
        this.showQuestion();
        this.showResult(false);
      };
    }
    const rb = $('restartBtn');
    if (rb) rb.onclick = () => this.restart();
  }

  async load() {
    try {
      const res = await fetch(this.cfg.data);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      this.data = await res.json();
      this.applyMeta();
      this.showQuestion();
    } catch (e) {
      const q = $('qText');
      if (q) q.textContent = 'Quiz non disponibile: ' + e.message;
    }
  }

  applyMeta() {
    const d = this.data;
    document.title = txt(d.title, this.lang) + ' — Quiz Lab';
    if ($('quizTitle')) $('quizTitle').textContent = (d.emoji || '🧪') + ' ' + txt(d.title, this.lang);
    if ($('quizDesc')) $('quizDesc').textContent = txt(d.description, this.lang);
    if (d.accent) document.documentElement.style.setProperty('--accent', d.accent);
  }

  restart() {
    this.idx = 0; this.score = 0; this.picked = -1; this.answers = [];
    this.showResult(false);
    this.showQuestion();
  }

  showQuestion() {
    if (!this.data) return;
    const d = this.data, q = d.questions[this.idx];
    if (!q) { this.showResult(true); return; }
    this.picked = -1;
    $('quizArea').classList.remove('hidden');
    this.showResult(false);
    const total = d.questions.length;
    $('qNum').textContent = txt({it:'Domanda',en:'Question'}, this.lang) + ' ' + (this.idx+1) + ' / ' + total;
    $('progress').style.width = (this.idx/total*100) + '%';
    $('qText').textContent = txt(q.text, this.lang);

    const box = $('answers');
    box.innerHTML = '';
    q.choices.forEach((c, i) => {
      const b = document.createElement('button');
      b.className = 'answer-btn';
      b.textContent = String.fromCharCode(65+i) + ') ' + txt(c, this.lang);
      b.onclick = () => this.pick(i, b);
      box.appendChild(b);
    });

    const hint = $('levelBadge');
    if (hint) hint.textContent = q.level ? txt(q.level, this.lang) : '';
    const nav = $('qNav');
    if (nav) nav.classList.add('hidden');
  }

  pick(i, btn) {
    if (this.picked >= 0) return;
    this.picked = i;
    const q = this.data.questions[this.idx];
    const correct = i === q.answer;
    if (correct) this.score++;
    this.answers.push({ q:q.id, picked:i, correct });

    const btns = $('answers').querySelectorAll('.answer-btn');
    btns.forEach((b, j) => {
      b.disabled = true;
      if (j === q.answer) b.classList.add('correct');
      else if (j === i) b.classList.add('wrong');
    });

    const ex = $('explain');
    if (ex) {
      ex.innerHTML = '<b>' + (correct
        ? txt({it:'✅ Esatto!',en:'✅ Correct!'}, this.lang)
        : txt({it:'❌ Sbagliato',en:'❌ Not quite'}, this.lang)) + '</b> ' + txt(q.explain, this.lang);
      ex.classList.remove('hidden');
    }
    const nav = $('qNav');
    if (nav) {
      nav.classList.remove('hidden');
      const next = $('nextBtn');
      if (next) {
        next.textContent = this.idx === this.data.questions.length-1
          ? txt({it:'Vedi il risultato',en:'See result'}, this.lang)
          : txt({it:'Prossima →',en:'Next →'}, this.lang);
        next.onclick = () => {
          if (this.idx < this.data.questions.length-1) { this.idx++; this.showQuestion(); }
          else this.showResult(true);
        };
      }
    }
  }

  showResult(show) {
    const area = $('resultArea');
    if (!area) return;
    area.classList.toggle('hidden', !show);
    if (!show) return;
    $('quizArea').classList.add('hidden');
    const total = this.data.questions.length;
    const pct = Math.round(this.score/total*100);
    let rank = this.data.ranks[0];
    for (const r of this.data.ranks) if (pct >= (r.min||0)) rank = r;

    $('resultEmoji').textContent = rank.emoji || '🏆';
    $('resultTitle').textContent = txt(rank.title, this.lang);
    $('resultDesc').innerHTML = '<b>' + pct + '%</b> — ' + txt(rank.desc, this.lang) +
      '<br><small>' + this.score + '/' + total + ' ' + txt({it:'risposte corrette',en:'correct answers'}, this.lang) + '</small>';

    // revisione errori
    const rev = $('review');
    if (rev) {
      const wrong = this.answers.filter(a => !a.correct);
      rev.innerHTML = wrong.length
        ? '<h3>' + txt({it:'Da rivedere',en:'Review these'}, this.lang) + '</h3>' +
          wrong.map(a => {
            const q = this.data.questions.find(x => x.id === a.q);
            return '<div class="rev-item"><b>' + txt(q.text,this.lang) + '</b><br>' + txt(q.explain,this.lang) + '</div>';
          }).join('')
        : '';
    }

    if (window.QuizShare && $('quizShare')) {
      window.QuizShare.attach('quizShare', {
        emoji: rank.emoji || '🏆',
        title: txt(rank.title, this.lang),
        sub: pct + '% · ' + txt(this.data.title, this.lang),
        page: txt(this.data.title, this.lang)
      });
    }
  }
}

const api = { run: cfg => new QuizLab(cfg), QuizLab };
window.QuizLab = api;
})();
