(function () {
  'use strict';

  var STORAGE_KEY = 'arcade_session';
  var STORAGE_VERSION = 1;
  var currentGame = null;
  var gameStartTime = null;
  var sessionStartTime = null;
  var stats = null;

  function defaultState() {
    return {
      version: STORAGE_VERSION,
      sessionStartTime: new Date().toISOString(),
      games: {}
    };
  }

  function defaultGameStats() {
    return {
      gamesPlayed: 0,
      gamesWon: 0,
      totalScore: 0,
      bestScore: 0,
      lastPlayed: null,
      totalPlayTime: 0,
      winStreak: 0,
      bestWinStreak: 0
    };
  }

  function load() {
    var raw = null;
    try {
      raw = localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      // storage unavailable
    }
    if (!raw) {
      stats = defaultState();
      sessionStartTime = new Date().toISOString();
      stats.sessionStartTime = sessionStartTime;
      return;
    }
    try {
      stats = JSON.parse(raw);
      if (typeof stats.version !== 'number') {
        stats = defaultState();
      } else if (stats.version < STORAGE_VERSION) {
        stats = migrateStats(stats);
      }
    } catch (e) {
      stats = defaultState();
    }
    sessionStartTime = stats.sessionStartTime || new Date().toISOString();
    stats.sessionStartTime = sessionStartTime;
  }

  function migrateStats(old) {
    if (old.version < 1) {
      return defaultState();
    }
    return old;
  }

  function save() {
    if (!stats) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
    } catch (e) {
      // storage unavailable
    }
  }

  function ensureGame(gameId) {
    if (!stats.games[gameId]) {
      stats.games[gameId] = defaultGameStats();
    }
  }

  function computeAvg(gameData) {
    if (!gameData || gameData.gamesPlayed === 0) return 0;
    return Math.round((gameData.totalScore / gameData.gamesPlayed) * 100) / 100;
  }

  function computeTotalPlayTime() {
    var total = 0;
    var keys = Object.keys(stats.games);
    for (var i = 0; i < keys.length; i++) {
      total += stats.games[keys[i]].totalPlayTime || 0;
    }
    return total;
  }

  function trackStart(gameId) {
    if (!stats) load();
    currentGame = gameId;
    gameStartTime = Date.now();
  }

  function trackComplete(gameId, score, won) {
    if (!stats) load();
    ensureGame(gameId);

    var gameData = stats.games[gameId];
    var playTime = 0;

    if (currentGame === gameId && gameStartTime) {
      playTime = Math.round((Date.now() - gameStartTime) / 1000);
      if (playTime < 0) playTime = 0;
      if (playTime > 86400) playTime = 0;
    }

    gameData.gamesPlayed += 1;
    gameData.totalScore += (typeof score === 'number' && score >= 0) ? score : 0;
    gameData.totalPlayTime += playTime;
    gameData.lastPlayed = new Date().toISOString();

    if (typeof score === 'number' && score > gameData.bestScore) {
      gameData.bestScore = score;
    }

    if (won === true) {
      gameData.gamesWon += 1;
      gameData.winStreak += 1;
      if (gameData.winStreak > gameData.bestWinStreak) {
        gameData.bestWinStreak = gameData.winStreak;
      }
    } else if (won === false) {
      gameData.winStreak = 0;
    }

    currentGame = null;
    gameStartTime = null;
    save();
  }

  function getStats(gameId) {
    if (!stats) load();
    if (!stats.games[gameId]) return null;
    var copy = Object.assign({}, stats.games[gameId]);
    copy.avgScore = computeAvg(stats.games[gameId]);
    return copy;
  }

  function getAllStats() {
    if (!stats) load();
    var result = {};
    var keys = Object.keys(stats.games);
    for (var i = 0; i < keys.length; i++) {
      var gd = stats.games[keys[i]];
      result[keys[i]] = Object.assign({}, gd);
      result[keys[i]].avgScore = computeAvg(gd);
    }
    return result;
  }

  function getOverall() {
    if (!stats) load();
    var totalGames = 0;
    var totalPlay = 0;
    var gamesWithScores = [];
    var keys = Object.keys(stats.games);
    var bestGameId = null;
    var bestGamePlays = 0;

    for (var i = 0; i < keys.length; i++) {
      var gd = stats.games[keys[i]];
      totalGames += gd.gamesPlayed;
      totalPlay += gd.totalPlayTime;

      if (gd.bestScore > 0 || gd.gamesPlayed > 0) {
        gamesWithScores.push({
          gameId: keys[i],
          bestScore: gd.bestScore,
          gamesPlayed: gd.gamesPlayed
        });
      }

      if (gd.gamesPlayed > bestGamePlays) {
        bestGamePlays = gd.gamesPlayed;
        bestGameId = keys[i];
      }
    }

    var currentStreak = 0;
    for (var j = 0; j < keys.length; j++) {
      currentStreak += stats.games[keys[j]].winStreak || 0;
    }

    var elapsed = 0;
    if (stats.sessionStartTime) {
      elapsed = Math.round((Date.now() - new Date(stats.sessionStartTime).getTime()) / 1000);
      if (elapsed < 0) elapsed = 0;
    }

    return {
      totalGamesPlayed: totalGames,
      totalPlayTime: totalPlay,
      favoriteGame: bestGameId,
      gamesWithScores: gamesWithScores,
      longestSession: elapsed,
      currentStreak: currentStreak
    };
  }

  function getFavoriteGame() {
    if (!stats) load();
    var keys = Object.keys(stats.games);
    var bestId = null;
    var bestPlays = 0;
    for (var i = 0; i < keys.length; i++) {
      if (stats.games[keys[i]].gamesPlayed > bestPlays) {
        bestPlays = stats.games[keys[i]].gamesPlayed;
        bestId = keys[i];
      }
    }
    return bestId;
  }

  function formatTime(seconds) {
    if (typeof seconds !== 'number' || seconds < 0) return '0s';
    seconds = Math.round(seconds);
    var h = Math.floor(seconds / 3600);
    var m = Math.floor((seconds % 3600) / 60);
    var s = seconds % 60;
    if (h > 0) {
      return h + 'h ' + m + 'm';
    }
    if (m > 0) {
      return m + 'm ' + s + 's';
    }
    return s + 's';
  }

  function formatDate(iso) {
    if (!iso) return '—';
    try {
      var d = new Date(iso);
      return d.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return iso;
    }
  }

  function exportStats() {
    if (!stats) load();
    return JSON.parse(JSON.stringify(stats));
  }

  function importStats(json) {
    if (!json || typeof json !== 'object') return false;
    if (typeof json.version !== 'number') return false;
    stats = json;
    sessionStartTime = stats.sessionStartTime || new Date().toISOString();
    stats.sessionStartTime = sessionStartTime;
    save();
    return true;
  }

  function reset() {
    stats = defaultState();
    sessionStartTime = stats.sessionStartTime;
    currentGame = null;
    gameStartTime = null;
    save();
  }

  load();

  window.Session = {
    trackStart: trackStart,
    trackComplete: trackComplete,
    getStats: getStats,
    getAllStats: getAllStats,
    getOverall: getOverall,
    getFavoriteGame: getFavoriteGame,
    formatTime: formatTime,
    formatDate: formatDate,
    exportStats: exportStats,
    importStats: importStats,
    reset: reset
  };
})();
