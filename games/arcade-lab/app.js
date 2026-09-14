(function () {
  'use strict';

  var games = [
    ['01', 'Tap Rush', 'Speed and reaction', 'tap', 'reactions'],
    ['02', 'Memory Grid', 'A short memory run', 'memory', 'memory'],
    ['03', 'Sound Sequence', 'Repeat the pattern', 'sequence', 'memory'],
    ['04', 'Star Route', 'Choose your way home', 'route', 'strategy'],
    ['05', 'Fake Answer', 'Trivia with a twist', 'trivia', 'strategy'],
    ['06', 'Pocket Roguelike', 'One run, three choices', 'rogue', 'strategy'],
    ['07', 'Physics Toybox', 'Launch the ball', 'physics', 'physics'],
    ['08', 'Music Memory', 'Repeat the rhythm', 'rhythm', 'audio'],
    ['09', 'Local Escape Room', 'Pass clues, solve together', 'escape', 'puzzles'],
    ['10', 'Mini Football', 'Manage one match', 'football', 'sports'],
    ['11', 'Typing Race', 'Type as fast as you can', 'typing', 'reactions'],
    ['12', 'Pattern Draw', 'Recreate the pattern', 'pattern', 'memory'],
    ['13', 'Word Lock', 'Unscramble the word', 'wordlock', 'puzzles'],
    ['14', 'Simon Says', 'Repeat the sequence', 'simon', 'memory'],
    ['15', 'Color Mix', 'Match the target color', 'colormix', 'puzzles']
  ];

  var categories = [
    { id: 'all', label: 'All' },
    { id: 'reactions', label: 'Reactions' },
    { id: 'memory', label: 'Memory' },
    { id: 'strategy', label: 'Strategy' },
    { id: 'physics', label: 'Physics' },
    { id: 'audio', label: 'Audio' },
    { id: 'puzzles', label: 'Puzzles' },
    { id: 'sports', label: 'Sports' }
  ];

  var howToPlay = {
    tap: {
      title: 'How to play: Tap Rush',
      body: 'A target appears on screen. Tap it as many times as possible before the 20-second timer runs out. The target moves after every hit.'
    },
    memory: {
      title: 'How to play: Memory Grid',
      body: 'A 4x4 grid of face-down cards. Flip two at a time to find matching pairs. Match all 8 pairs with the fewest moves possible.'
    },
    sequence: {
      title: 'How to play: Sound Sequence',
      body: 'Watch the pads light up and listen to the tones. Then repeat the same sequence. Each round adds one more step to remember.'
    },
    route: {
      title: 'How to play: Star Route',
      body: 'Pick nodes along a route to reach the beacon. Supplies fall as you travel. Collect fuel cells to extend your range. Reach the beacon before fuel runs out.'
    },
    trivia: {
      title: 'How to play: Fake Answer',
      body: 'Answer 5 trivia questions. Each question has one correct answer and three plausible fakes. Choose the real answer to score.'
    },
    rogue: {
      title: 'How to play: Pocket Roguelike',
      body: 'Navigate 7 floors by choosing one of three actions per floor. Balance health and supplies. Reach the exit to escape.'
    },
    physics: {
      title: 'How to play: Physics Toybox',
      body: 'Aim and launch a ball. Gravity and bounce are simulated on a canvas. Try to get as many bounces as possible.'
    },
    rhythm: {
      title: 'How to play: Music Memory',
      body: 'Listen to a sequence of four beats, then tap them back in the same order. Each round adds one more beat to the pattern.'
    },
    escape: {
      title: 'How to play: Local Escape Room',
      body: 'One player reads the clue aloud, another solves it. Work through 3 riddles before the 60-second timer runs out.'
    },
    football: {
      title: 'How to play: Mini Football',
      body: 'Choose a formation and tactical approach, then simulate one match. The result depends on your choices and a local model.'
    },
    typing: {
      title: 'How to play: Typing Race',
      body: 'Type the displayed words as fast as you can before time runs out. Speed and accuracy determine your score.'
    },
    pattern: {
      title: 'How to play: Pattern Draw',
      body: 'Watch the pattern appear on the grid, then recreate it by tapping the same cells in the correct order.'
    },
    wordlock: {
      title: 'How to play: Word Lock',
      body: 'Unscramble the letters to form a valid word. You have a limited number of attempts to unlock the word.'
    },
    simon: {
      title: 'How to play: Simon Says',
      body: 'Watch the sequence of colors and sounds, then repeat them in the same order. Each round adds one more step.'
    },
    colormix: {
      title: 'How to play: Color Mix',
      body: 'Mix primary colors to match a target color. Adjust the RGB sliders to get as close as possible.'
    }
  };

  var list = document.getElementById('game-list');
  var stage = document.getElementById('game-stage');
  var overlay = document.getElementById('game-info-overlay');
  var langToggle = document.getElementById('langToggle');

  var active = localStorage.getItem('arcade_active_game') || 'tap';
  var activeFilter = 'all';
  var switchCount = 0;

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function getDifficulty() {
    return localStorage.getItem('arcade_difficulty') || 'medium';
  }

  function setDifficulty(d) {
    localStorage.setItem('arcade_difficulty', d);
  }

  function getGlobalBest() {
    var all = window.Save ? window.Save.getAll() : {};
    var best = 0;
    var keys = Object.keys(all);
    for (var i = 0; i < keys.length; i++) {
      var entry = all[keys[i]];
      if (entry && entry.data) {
        var scores = entry.data.scores || entry.data.highScores || [];
        if (scores.length > 0 && scores[0].score > best) {
          best = scores[0].score;
        }
      }
    }
    return best;
  }

  function updateGlobalBest() {
    document.getElementById('global-best').textContent = getGlobalBest();
  }

  function getGameName(gameId) {
    for (var i = 0; i < games.length; i++) {
      if (games[i][3] === gameId) return games[i][1];
    }
    return gameId;
  }

  function getFilteredGames() {
    if (activeFilter === 'all') return games;
    return games.filter(function (g) { return g[4] === activeFilter; });
  }

  function updateUIText() {
    if (window.I18n) {
      var eyebrow = document.querySelector('.eyebrow');
      var tagline = document.querySelector('h1');
      var lede = document.querySelector('.lede');
      var scoreSpan = document.querySelector('.score-note span');
      var footer = document.querySelector('.footer');
      if (eyebrow) eyebrow.textContent = window.I18n.t('hero_count');
      if (tagline) tagline.textContent = window.I18n.t('hero_tagline');
      if (lede) lede.textContent = window.I18n.t('hero_description');
      if (scoreSpan) scoreSpan.textContent = window.I18n.t('score_best');
      if (footer) footer.textContent = window.I18n.t('footer_tagline');
      if (langToggle) langToggle.textContent = window.I18n.t('lang_toggle');
    }
    updateGlobalBest();
    renderSessionStats();
  }

  function renderFilters() {
    var existing = list.querySelector('.category-filters');
    if (existing) existing.remove();

    var container = document.createElement('div');
    container.className = 'category-filters';
    container.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px;';

    for (var i = 0; i < categories.length; i++) {
      var cat = categories[i];
      var btn = document.createElement('button');
      btn.className = 'button small' + (activeFilter === cat.id ? ' primary' : '');
      btn.textContent = cat.label;
      btn.style.cssText = 'font-size:10px;padding:4px 10px;';
      btn.setAttribute('data-filter', cat.id);
      btn.onclick = (function (id) {
        return function () {
          activeFilter = id;
          renderFilters();
          renderList();
        };
      })(cat.id);
      container.appendChild(btn);
    }

    list.insertBefore(container, list.firstChild);
  }

  function renderList() {
    var filtered = getFilteredGames();
    var buttonsHtml = '';
    for (var i = 0; i < filtered.length; i++) {
      var g = filtered[i];
      var isActive = g[3] === active;
      var gameStats = window.Session ? window.Session.getStats(g[3]) : null;
      var plays = gameStats ? gameStats.gamesPlayed : 0;
      buttonsHtml += '<button class="game-button' + (isActive ? ' active' : '') + '" data-game="' + g[3] + '">' +
        '<span class="number">' + g[0] + '</span>' +
        '<span class="info"><span class="name">' + esc(g[1]) + '</span><span class="desc">' + esc(g[2]) + '</span>' +
        '<span class="category-tag">' + esc(g[4]) + '</span></span>' +
        (plays > 0 ? '<span class="play-count">' + plays + '</span>' : '') +
        '<span class="play-indicator">play</span></button>';
    }
    var existingButtons = list.querySelectorAll('.game-button');
    for (var j = 0; j < existingButtons.length; j++) existingButtons[j].remove();
    list.insertAdjacentHTML('beforeend', buttonsHtml);

    list.querySelectorAll('.game-button').forEach(function (b) {
      b.onclick = function () {
        switchGame(b.dataset.game);
      };
    });
  }

  function renderDifficulty() {
    var existing = stage.querySelector('.difficulty-selector');
    if (existing) existing.remove();
    var diff = getDifficulty();
    var html = '<div class="difficulty-selector">' +
      '<input type="radio" name="difficulty" id="diff-easy" value="easy"' + (diff === 'easy' ? ' checked' : '') + '><label for="diff-easy">Easy</label>' +
      '<input type="radio" name="difficulty" id="diff-medium" value="medium"' + (diff === 'medium' ? ' checked' : '') + '><label for="diff-medium">Medium</label>' +
      '<input type="radio" name="difficulty" id="diff-hard" value="hard"' + (diff === 'hard' ? ' checked' : '') + '><label for="diff-hard">Hard</label>' +
      '</div>';
    stage.insertAdjacentHTML('afterbegin', html);
    stage.querySelectorAll('.difficulty-selector input[type="radio"]').forEach(function (r) {
      r.onchange = function () {
        setDifficulty(r.value);
        if (window.Analytics) window.Analytics.trackEvent('difficulty_changed', { difficulty: r.value });
      };
    });
  }

  function renderHowToButton(gameId) {
    var info = howToPlay[gameId];
    if (!info) return '';
    var label = window.I18n ? window.I18n.t('howto_' + gameId) : 'How to play';
    return '<button class="button small" id="howto-btn">' + label + '</button>';
  }

  function renderShareButton() {
    if (!navigator.share && !navigator.clipboard) return '';
    return '<button class="share-button" id="share-btn"><span class="icon">&#x1f4e4;</span> Share</button>';
  }

  function showHowToOverlay(gameId) {
    var info = howToPlay[gameId];
    if (!info) return;
    overlay.innerHTML = '<div class="overlay-card">' +
      '<button class="overlay-close" id="overlay-close">&times;</button>' +
      '<h3>' + esc(info.title) + '</h3>' +
      '<p>' + esc(info.body) + '</p>' +
      '</div>';
    overlay.classList.add('open');
    document.getElementById('overlay-close').onclick = function () {
      overlay.classList.remove('open');
    };
    overlay.onclick = function (e) {
      if (e.target === overlay) overlay.classList.remove('open');
    };
  }

  function shareResult(gameId, score) {
    var name = getGameName(gameId);
    var text = 'I scored ' + score + ' in ' + name + ' on Arcade Lab!';
    if (navigator.share) {
      navigator.share({ title: 'Arcade Lab', text: text }).catch(function () {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(function () {
        var btn = document.getElementById('share-btn');
        if (btn) {
          var orig = btn.innerHTML;
          btn.innerHTML = '<span class="icon">&#x2714;</span> Copied!';
          setTimeout(function () { btn.innerHTML = orig; }, 1500);
        }
      }).catch(function () {});
    }
  }

  function setupShareListeners(gameId) {
    var btn = document.getElementById('share-btn');
    if (btn) {
      btn.onclick = function () {
        var stats = window.Session ? window.Session.getStats(gameId) : null;
        var score = stats ? stats.bestScore : 0;
        if (window.Analytics) window.Analytics.trackEvent('share_clicked', { game: gameId, score: score });
        shareResult(gameId, score);
      };
    }
  }

  function renderSessionStats() {
    var statsDiv = document.getElementById('session-stats');
    if (!statsDiv) {
      statsDiv = document.createElement('div');
      statsDiv.id = 'session-stats';
      statsDiv.style.cssText = 'margin-top:14px;padding:14px;border:1px solid var(--line);border-radius:10px;background:var(--panel2);';
      list.appendChild(statsDiv);
    }
    if (!window.Session) {
      statsDiv.innerHTML = '';
      return;
    }
    var overall = window.Session.getOverall();
    var favGame = overall.favoriteGame ? getGameName(overall.favoriteGame) : '---';
    var totalPlay = window.Session.formatTime(overall.totalPlayTime);
    statsDiv.innerHTML =
      '<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:var(--muted);margin-bottom:10px;">Session Stats</div>' +
      '<div style="display:flex;flex-direction:column;gap:6px;font-size:12px;">' +
      '<span>Games played: <strong style="color:var(--accent);">' + overall.totalGamesPlayed + '</strong></span>' +
      '<span>Favorite: <strong style="color:var(--teal);">' + esc(favGame) + '</strong></span>' +
      '<span>Play time: <strong style="color:var(--blue);">' + totalPlay + '</strong></span>' +
      '</div>';
  }

  function buildGameHead(num, title, tag, copy, body) {
    return '<div class="stage-head"><div><span class="tag">' + num + ' / ' + esc(tag) + '</span><h2>' + esc(title) + '</h2><p>' + esc(copy) + '</p></div>' +
      '<div class="stage-actions">' + renderHowToButton(active) + renderShareButton() + '</div></div>' + body;
  }

  function renderStage() {
    stage.className = 'game-stage game-accent-' + active;

    var gameDef = null;
    for (var i = 0; i < games.length; i++) {
      if (games[i][3] === active) { gameDef = games[i]; break; }
    }
    if (!gameDef) { stage.innerHTML = '<p>Game not found.</p>'; return; }

    var gameFn = window.Games && window.Games[active];
    if (typeof gameFn === 'function') {
      var ctx = {
        stage: stage,
        head: buildGameHead,
        Audio: window.Audio || null,
        Save: window.Save || null,
        I18n: window.I18n || null,
        Session: window.Session || null,
        Ads: window.Ads || null,
        Analytics: window.Analytics || null,
        difficulty: getDifficulty(),
        gameEntry: gameDef,
        esc: esc,
        updateGlobalBest: updateGlobalBest
      };
      gameFn(ctx);
    } else {
      stage.innerHTML = buildGameHead(gameDef[0], gameDef[1], gameDef[4], gameDef[2],
        '<div class="notice" style="margin-top:24px;color:var(--muted);">This game is loading...</div>');
    }

    renderDifficulty();
    setupShareListeners(active);

    var howtoBtn = document.getElementById('howto-btn');
    if (howtoBtn) {
      howtoBtn.onclick = function () {
        showHowToOverlay(active);
      };
    }
  }

  function switchGame(gameId) {
    if (gameId === active) return;
    active = gameId;
    localStorage.setItem('arcade_active_game', active);

    switchCount++;
    if (switchCount % 3 === 0 && window.Ads) {
      window.Ads.showInterstitial();
    }

    if (window.Session) window.Session.trackStart(gameId);
    if (window.Analytics) window.Analytics.trackEvent('game_switch', { game: gameId });
    if (window.Audio) window.Audio.click();
    renderList();
    renderStage();
  }

  function initLangToggle() {
    if (!langToggle || !window.I18n) return;
    langToggle.textContent = window.I18n.t('lang_toggle');
    langToggle.onclick = function () {
      var current = window.I18n.getLang();
      var next = current === 'en' ? 'it' : 'en';
      window.I18n.setLang(next);
      if (window.Analytics) window.Analytics.trackEvent('language_changed', { language: next });
      updateUIText();
    };
  }

  function init() {
    if (window.Session) window.Session.trackStart(active);
    updateGlobalBest();
    renderFilters();
    renderList();
    renderStage();
    initLangToggle();
    updateUIText();
    renderSessionStats();
    if (window.Ads) window.Ads.showBanner();
    if (window.Analytics) window.Analytics.trackEvent('app_open', { game: active });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.ArcadeApp = {
    switchGame: switchGame,
    shareResult: shareResult,
    showHowToOverlay: showHowToOverlay
  };
}());
