"use strict";

var Minigames = (function () {

  function createPuzzle(el, config, onDone) {
    var N = config.rows * config.cols;
    var tiles = [];
    for (var i = 0; i < N - 1; i++) tiles.push(i);
    tiles.push(N - 1);
    for (var s = 0; s < 200; s++) {
      var idx = tiles.indexOf(N - 1);
      var neighbors = [];
      var row = Math.floor(idx / config.cols);
      var col = idx % config.cols;
      if (row > 0) neighbors.push(idx - config.cols);
      if (row < config.rows - 1) neighbors.push(idx + config.cols);
      if (col > 0) neighbors.push(idx - 1);
      if (col < config.cols - 1) neighbors.push(idx + 1);
      var swap = neighbors[Math.floor(Math.random() * neighbors.length)];
      var tmp = tiles[idx]; tiles[idx] = tiles[swap]; tiles[swap] = tmp;
    }
    var selected = -1;
    var moves = 0;
    var html = '<div class="puzzle-grid" style="display:grid;grid-template-columns:repeat(' + config.cols + ',1fr);gap:4px;max-width:300px;margin:0 auto">';
    tiles.forEach(function (t, i) {
      var vis = t === N - 1 ? '' : (t + 1);
      var empty = t === N - 1;
      html += '<button class="puzzle-tile' + (empty ? ' empty' : '') + '" data-idx="' + i + '">' + vis + '</button>';
    });
    html += '</div>';
    html += '<div class="puzzle-moves" style="text-align:center;margin-top:8px;font-size:13px;color:var(--dim)">Mosse: <span id="puzzle-moves">0</span></div>';
    el.innerHTML = html;
    el.querySelectorAll('.puzzle-tile:not(.empty)').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var i = parseInt(this.dataset.idx);
        var idx = tiles.indexOf(N - 1);
        var r1 = Math.floor(i / config.cols), c1 = i % config.cols;
        var r2 = Math.floor(idx / config.cols), c2 = idx % config.cols;
        var adj = (Math.abs(r1 - r2) + Math.abs(c1 - c2)) === 1;
        if (!adj) return;
        var tmp = tiles[i]; tiles[i] = tiles[idx]; tiles[idx] = tmp;
        moves++;
        var mvEl = el.querySelector('#puzzle-moves');
        if (mvEl) mvEl.textContent = moves;
        renderTiles();
        if (isSolved()) {
          setTimeout(function () { onDone({ moves: moves }); }, 400);
        }
      });
    });
    function renderTiles() {
      el.querySelectorAll('.puzzle-tile').forEach(function (btn, i) {
        var t = tiles[i];
        var empty = t === N - 1;
        btn.textContent = empty ? '' : (t + 1);
        btn.classList.toggle('empty', empty);
      });
    }
    function isSolved() {
      for (var i = 0; i < N - 1; i++) { if (tiles[i] !== i) return false; }
      return tiles[N - 1] === N - 1;
    }
  }

  function createSpotDiff(el, config, onDone) {
    var items = DATA.DIFF_ITEMS.slice(0, config.rounds);
    var current = 0;
    var found = 0;
    var html = '<div class="diff-header"><span id="diff-progress">1/' + config.rounds + '</span></div>';
    html += '<div class="diff-scene" id="diff-scene"></div>';
    html += '<div class="diff-found" id="diff-found">Trovati: 0/' + config.rounds + '</div>';
    el.innerHTML = html;
    renderRound();
    function renderRound() {
      if (current >= items.length) {
        setTimeout(function () { onDone({ found: found }); }, 500);
        return;
      }
      var scene = el.querySelector('#diff-scene');
      var item = items[current];
      var objects = ['Barca', 'Albero', 'Sedia', 'Gatto', 'Lampada', 'Casa', 'Nuvola', 'Stella', 'Cuore', 'Casa'];
      var changedObj = objects[current % objects.length];
      var html = '<div class="diff-room">';
      html += '<div class="diff-room-title">Ronda ' + (current + 1) + '</div>';
      html += '<div class="diff-objects">';
      var shuffled = objects.slice().sort(function () { return Math.random() - 0.5; });
      shuffled.forEach(function (obj) {
        var isTarget = obj === changedObj && Math.random() < 0.5;
        var hasItem = obj === item.name || isTarget;
        html += '<button class="diff-obj' + (hasItem ? ' has-item' : '') + '" data-name="' + obj + '">';
        html += getEmoji(obj) + '</button>';
      });
      html += '</div>';
      html += '<div class="diff-hint">' + item.desc + '</div>';
      html += '</div>';
      scene.innerHTML = html;
      el.querySelector('#diff-progress').textContent = (current + 1) + '/' + config.rounds;
      el.querySelectorAll('.diff-obj').forEach(function (btn) {
        btn.addEventListener('click', function () {
          if (this.dataset.name === item.name || this.classList.contains('has-item')) {
            found++;
            el.querySelector('#diff-found').textContent = 'Trovati: ' + found + '/' + config.rounds;
          }
          current++;
          renderRound();
        });
      });
    }
    function getEmoji(name) {
      var map = { Barca: '⛵', Albero: '🌳', Sedia: '🪑', Gatto: '🐱', Lampada: '💡', Casa: '🏠', Nuvola: '☁️', Stella: '⭐', Cuore: '❤️' };
      return map[name] || '❓';
    }
  }

  function createSwipe(el, config, onDone) {
    var cards = config.cards.slice().sort(function () { return Math.random() - 0.5; });
    var idx = 0;
    var correct = 0;
    var total = cards.length;
    var html = '<div class="swipe-container" id="swipe-container">';
    html += '<div class="swipe-progress" id="swipe-progress">1/' + total + '</div>';
    html += '<div class="swipe-card" id="swipe-card"><div class="swipe-text"></div></div>';
    html += '<div class="swipe-actions">';
    html += '<button class="swipe-btn left" id="swipe-left">← Finzione</button>';
    html += '<button class="swipe-btn right" id="swipe-right">Realtà →</button>';
    html += '</div></div>';
    el.innerHTML = html;
    renderCard();
    function renderCard() {
      if (idx >= cards.length) {
        setTimeout(function () { onDone({ correct: correct, total: total }); }, 400);
        return;
      }
      var card = cards[idx];
      el.querySelector('#swipe-text', el.querySelector('.swipe-text')).textContent = card.text;
      el.querySelector('.swipe-text').textContent = card.text;
      el.querySelector('#swipe-progress').textContent = (idx + 1) + '/' + total;
    }
    el.querySelector('#swipe-left').addEventListener('click', function () { swipe(false); });
    el.querySelector('#swipe-right').addEventListener('click', function () { swipe(true); });
    function swipe(answer) {
      var card = cards[idx];
      if (answer === card.real) correct++;
      idx++;
      var cardEl = el.querySelector('#swipe-card');
      cardEl.classList.add('swiping');
      setTimeout(function () {
        cardEl.classList.remove('swiping');
        renderCard();
      }, 250);
    }
  }

  function createTower(el, config, onDone) {
    var lies = config.lies.slice();
    var removed = 0;
    var html = '<div class="tower-title">La verità sotto le bugie</div>';
    html += '<div class="tower-stack" id="tower-stack">';
    lies.forEach(function (lie, i) {
      html += '<button class="tower-block" data-idx="' + i + '" style="--i:' + i + '">';
      html += '<span class="tower-lie">' + lie + '</span></button>';
    });
    html += '</div>';
    html += '<div class="tower-hint">Rimuovi le bugie dall\'alto in basso, nell\'ordine in cui sono state costruite.</div>';
    html += '<div class="tower-revealed" id="tower-revealed"></div>';
    el.innerHTML = html;
    var expected = 0;
    el.querySelectorAll('.tower-block').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var i = parseInt(this.dataset.idx);
        if (i === expected) {
          this.classList.add('removed');
          expected++;
          removed++;
          var rev = el.querySelector('#tower-revealed');
          if (expected === lies.length) {
            rev.innerHTML = '<div class="tower-truth">Non era nient\'altro.</div>';
            setTimeout(function () { onDone({ removed: removed }); }, 1200);
          } else {
            rev.innerHTML += '<div class="tower-truth">"' + lies[i] + '" — rimosso</div>';
          }
        } else {
          this.classList.add('shake');
          var self = this;
          setTimeout(function () { self.classList.remove('shake'); }, 400);
        }
      });
    });
  }

  function createFragments(el, config, onDone) {
    var frags = config.fragments.slice();
    var indices = frags.map(function (_, i) { return i; });
    for (var s = indices.length - 1; s > 0; s--) {
      var r = Math.floor(Math.random() * (s + 1));
      var tmp = indices[s]; indices[s] = indices[r]; indices[r] = tmp;
    }
    var placed = [];
    var html = '<div class="frag-title">Ricostruisci il testo</div>';
    html += '<div class="frag-source" id="frag-source">';
    indices.forEach(function (origIdx) {
      html += '<button class="frag-piece" data-orig="' + origIdx + '">' + frags[origIdx] + '</button>';
    });
    html += '</div>';
    html += '<div class="frag-target" id="frag-target"></div>';
    html += '<div class="frag-hint">Tocca i frammenti nell\'ordine giusto.</div>';
    el.innerHTML = html;
    var expectedIdx = 0;
    el.querySelectorAll('.frag-piece').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var orig = parseInt(this.dataset.orig);
        if (orig === expectedIdx) {
          this.classList.add('placed');
          placed.push(orig);
          expectedIdx++;
          var target = el.querySelector('#frag-target');
          target.innerHTML += '<div class="frag-placed">' + frags[orig] + '</div>';
          if (expectedIdx === frags.length) {
            setTimeout(function () { onDone({ correct: true }); }, 600);
          }
        } else {
          this.classList.add('shake');
          var self = this;
          setTimeout(function () { self.classList.remove('shake'); }, 400);
        }
      });
    });
  }

  function createGentle(el, config, onDone) {
    var collected = 0;
    var duration = config.roundDuration * 1000;
    var words = DATA.GENTLE_WORDS.slice();
    var html = '<div class="gentle-title">' + config.title + '</div>';
    html += '<div class="gentle-desc">' + config.description + '</div>';
    html += '<div class="gentle-scene" id="gentle-scene"></div>';
    html += '<div class="gentle-collected" id="gentle-collected"></div>';
    el.innerHTML = html;
    var scene = el.querySelector('#gentle-scene');
    var timer = setTimeout(finish, duration);
    var spawnInterval = setInterval(spawnWord, 900);
    function spawnWord() {
      if (collected > 100) return;
      var w = words[Math.floor(Math.random() * words.length)];
      var el2 = document.createElement('div');
      el2.className = 'gentle-word';
      el2.textContent = w;
      el2.style.left = (10 + Math.random() * 80) + '%';
      el2.style.animationDuration = (4 + Math.random() * 3) + 's';
      el2.addEventListener('click', function () {
        collected++;
        el.querySelector('#gentle-collected').textContent = collected;
        this.classList.add('caught');
        setTimeout(function () { el2.remove(); }, 300);
      });
      scene.appendChild(el2);
      setTimeout(function () {
        if (el2.parentNode) el2.remove();
      }, 7000);
    }
    function finish() {
      clearInterval(spawnInterval);
      clearTimeout(timer);
      onDone({ collected: collected });
    }
  }

  function createBreathing(el, config, onDone) {
    var cycle = 0;
    var total = config.cycles;
    var html = '<div class="breath-container">';
    html += '<div class="breath-circle" id="breath-circle"></div>';
    html += '<div class="breath-label" id="breath-label">Preparati...</div>';
    html += '<div class="breath-count" id="breath-count">Ciclo 0/' + total + '</div>';
    html += '</div>';
    el.innerHTML = html;
    var circle = el.querySelector('#breath-circle');
    var label = el.querySelector('#breath-label');
    var count = el.querySelector('#breath-count');
    setTimeout(runCycle, 1500);
    function runCycle() {
      if (cycle >= total) {
        label.textContent = 'Hai completato tutti i cicli.';
        circle.className = 'breath-circle done';
        setTimeout(function () { onDone({ cycles: total }); }, 1000);
        return;
      }
      circle.className = 'breath-circle inhale';
      label.textContent = 'Inspira...';
      setTimeout(function () {
        circle.className = 'breath-circle hold';
        label.textContent = 'Trattieni...';
        setTimeout(function () {
          circle.className = 'breath-circle exhale';
          label.textContent = 'Espira...';
          setTimeout(function () {
            cycle++;
            count.textContent = 'Ciclo ' + cycle + '/' + total;
            runCycle();
          }, config.exhale);
        }, config.hold);
      }, config.inhale);
    }
  }

  function createListening(el, config, onDone) {
    var idx = 0;
    var words = config.testimonies;
    var html = '<div class="listen-title">' + config.title + '</div>';
    html += '<div class="listen-desc">' + config.description + '</div>';
    html += '<div class="listen-word" id="listen-word"></div>';
    html += '<div class="listen-progress" id="listen-progress"></div>';
    el.innerHTML = html;
    showWord();
    function showWord() {
      if (idx >= words.length) {
        showQuestion();
        return;
      }
      var w = words[idx];
      var wordEl = el.querySelector('#listen-word');
      wordEl.textContent = w.word;
      wordEl.className = 'listen-word appear';
      el.querySelector('#listen-progress').textContent = (idx + 1) + '/' + words.length;
      setTimeout(function () {
        wordEl.className = 'listen-word fade';
        setTimeout(function () {
          idx++;
          showWord();
        }, 500);
      }, w.duration);
    }
    function showQuestion() {
      el.querySelector('#listen-word').textContent = '';
      var html2 = '<div class="listen-question">' + config.question + '</div>';
      html2 += '<div class="listen-options">';
      config.options.forEach(function (opt) {
        html2 += '<button class="listen-opt" data-opt="' + opt + '">' + opt + '</button>';
      });
      html2 += '</div>';
      el.innerHTML = html2;
      el.querySelectorAll('.listen-opt').forEach(function (btn) {
        btn.addEventListener('click', function () {
          onDone({ answer: this.dataset.opt });
        });
      });
    }
  }

  function launch(containerId, minigameConfig, onDone) {
    var el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = '';
    var config = minigameConfig;
    switch (config.type) {
      case 'puzzle': createPuzzle(el, config, onDone); break;
      case 'spotDiff': createSpotDiff(el, config, onDone); break;
      case 'swipe': createSwipe(el, config, onDone); break;
      case 'tower': createTower(el, config, onDone); break;
      case 'fragments': createFragments(el, config, onDone); break;
      case 'gentle': createGentle(el, config, onDone); break;
      case 'breathing': createBreathing(el, config, onDone); break;
      case 'listening': createListening(el, config, onDone); break;
    }
  }

  return { launch: launch };

})();
