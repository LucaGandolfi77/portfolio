// app.js — Referendum Rumble
// SPA router, game state manager, screen rendering, vote/chat/challenge logic

'use strict';

/**
 * App — main application controller.
 */
const App = (() => {
  // ==================== STATE ====================

  let roomManager = null;
  let signalStorm = null;
  let currentScreen = '';
  let nickname = localStorage.getItem('rr-nickname') || '';
  let myFaction = null;
  let voteCooldownUntil = 0;
  let lobbyPoller = null;
  let pendingChallenge = null;
  let hudUpdateInterval = null;

  // ==================== SCREENS ====================

  const SCREENS = ['home', 'host', 'join', 'lobby-list', 'room', 'minigame', 'results'];

  /**
   * Show a screen by id, hide others.
   * @param {string} id
   */
  function showScreen(id) {
    if (!SCREENS.includes(id)) return;
    for (const s of SCREENS) {
      const el = document.getElementById(s);
      if (el) el.hidden = (s !== id);
    }
    currentScreen = id;
    window.location.hash = id;
  }

  // ==================== ROUTER ====================

  function handleRoute() {
    const hash = window.location.hash.replace('#', '') || 'home';
    if (SCREENS.includes(hash)) {
      showScreen(hash);
    } else {
      showScreen('home');
    }
  }

  // ==================== INITIALIZATION ====================

  function init() {
    window.addEventListener('hashchange', handleRoute);

    // Restore nickname
    const nicknameInputs = document.querySelectorAll('.nickname-input');
    nicknameInputs.forEach(inp => {
      inp.value = nickname;
      inp.addEventListener('input', () => {
        nickname = inp.value.trim().slice(0, 24);
        localStorage.setItem('rr-nickname', nickname);
        nicknameInputs.forEach(other => { if (other !== inp) other.value = nickname; });
      });
    });

    // Home screen buttons
    _on('btn-host', 'click', goHost);
    _on('btn-join', 'click', goJoin);
    _on('btn-lobby', 'click', goLobbyList);

    // Host screen
    _on('btn-create-room', 'click', createRoom);

    // Join screen
    _on('btn-join-room', 'click', joinRoom);

    // Lobby
    _on('btn-lobby-refresh', 'click', refreshLobby);
    _on('btn-lobby-back', 'click', () => showScreen('home'));

    // Room: vote buttons
    _on('btn-vote-cyan', 'click', () => castVote('cyan'));
    _on('btn-vote-crimson', 'click', () => castVote('crimson'));

    // Room: chat
    _on('chat-form', 'submit', sendChat);
    _on('btn-taunt', 'click', sendTaunt);

    // Results: play again / home
    _on('btn-play-again', 'click', () => {
      disconnect();
      showScreen('host');
    });
    _on('btn-results-home', 'click', () => {
      disconnect();
      showScreen('home');
    });

    // Challenge modal
    _on('btn-challenge-accept', 'click', respondChallenge.bind(null, true));
    _on('btn-challenge-decline', 'click', respondChallenge.bind(null, false));

    // PWA registration
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    }

    // Lucide icons
    if (window.lucide) {
      window.lucide.createIcons();
    }

    handleRoute();
  }

  // ==================== NAVIGATION ====================

  function goHost() {
    if (!_validateNickname()) return;
    showScreen('host');
  }

  function goJoin() {
    if (!_validateNickname()) return;
    showScreen('join');
  }

  function goLobbyList() {
    showScreen('lobby-list');
    refreshLobby();
  }

  // ==================== HOST FLOW ====================

  async function createRoom() {
    if (!_validateNickname()) return;

    const topic = _val('input-topic') || 'Should we change the world?';
    const optA = _val('input-option-a') || 'YES';
    const optB = _val('input-option-b') || 'NO';
    const duration = parseInt(_val('input-duration'), 10) || 300;
    const isPublic = _checked('input-public');

    _disable('btn-create-room', true);
    _text('btn-create-room', 'Creating…');

    roomManager = new window.RoomManager({
      onStateUpdate: onStateUpdate,
      onMessage: onMessage,
      onConnected: () => {},
      onDisconnected: onDisconnected,
      onError: onError,
      onChallengeRequest: onChallengeRequest,
      onMinigameStart: onMinigameStart,
      onMinigameResult: onMinigameResult
    });

    try {
      const config = {
        topic,
        optionA: optA,
        optionB: optB,
        duration,
        isPublic
      };
      await roomManager.hostRoom(config, nickname);
      showScreen('room');
      _initRoomUI();
    } catch (err) {
      onError(err);
    } finally {
      _disable('btn-create-room', false);
      _text('btn-create-room', 'Create Room');
    }
  }

  // ==================== JOIN FLOW ====================

  async function joinRoom() {
    if (!_validateNickname()) return;

    const code = (_val('input-room-code') || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (code.length !== 6) {
      _showError('join-error', 'Enter a 6-character room code');
      _shakeElement('input-room-code');
      return;
    }

    _disable('btn-join-room', true);
    _text('btn-join-room', 'Joining…');

    roomManager = new window.RoomManager({
      onStateUpdate: onStateUpdate,
      onMessage: onMessage,
      onConnected: () => {},
      onDisconnected: onDisconnected,
      onError: onError,
      onChallengeRequest: onChallengeRequest,
      onMinigameStart: onMinigameStart,
      onMinigameResult: onMinigameResult
    });

    try {
      await roomManager.joinRoom(code, nickname);
      showScreen('room');
      _initRoomUI();
    } catch (err) {
      _showError('join-error', err.message || 'Could not join room');
      _shakeElement('input-room-code');
    } finally {
      _disable('btn-join-room', false);
      _text('btn-join-room', 'Join Room');
    }
  }

  /**
   * Join a lobby room directly.
   * @param {string} code
   */
  async function joinLobbyRoom(code) {
    if (!_validateNickname()) {
      showScreen('home');
      return;
    }

    roomManager = new window.RoomManager({
      onStateUpdate: onStateUpdate,
      onMessage: onMessage,
      onConnected: () => {},
      onDisconnected: onDisconnected,
      onError: onError,
      onChallengeRequest: onChallengeRequest,
      onMinigameStart: onMinigameStart,
      onMinigameResult: onMinigameResult
    });

    try {
      await roomManager.joinRoom(code, nickname);
      showScreen('room');
      _initRoomUI();
    } catch (err) {
      alert('Could not join room: ' + (err.message || 'unknown error'));
    }
  }

  // ==================== LOBBY ====================

  function refreshLobby() {
    const listEl = document.getElementById('lobby-rooms');
    if (!listEl) return;

    listEl.innerHTML = '<p class="lobby-loading">Scanning for rooms…</p>';

    if (lobbyPoller) clearInterval(lobbyPoller);

    const tempManager = new window.RoomManager({});
    tempManager.queryLobby().then(rooms => {
      renderLobbyRooms(rooms);
    }).catch(() => {
      listEl.innerHTML = '<p class="lobby-loading">No rooms found. Try hosting one!</p>';
    });
  }

  function renderLobbyRooms(rooms) {
    const listEl = document.getElementById('lobby-rooms');
    if (!listEl) return;

    if (!rooms || rooms.length === 0) {
      listEl.innerHTML = '<p class="lobby-loading">No public rooms found. Try hosting one!</p>';
      return;
    }

    listEl.innerHTML = '';
    for (const room of rooms) {
      const card = document.createElement('div');
      card.className = 'lobby-card';
      card.innerHTML = `
        <div class="lobby-card-topic">${_esc(room.topic || 'Referendum')}</div>
        <div class="lobby-card-info">${room.playerCount || '?'} players · ${_esc(room.roomId || '')}</div>
        <button class="btn btn-small btn-cyan" data-code="${_esc(room.roomId || '')}">Join</button>
      `;
      card.querySelector('button').addEventListener('click', () => {
        joinLobbyRoom(room.roomId);
      });
      listEl.appendChild(card);
    }
  }

  // ==================== ROOM UI ====================

  function _initRoomUI() {
    if (!roomManager || !roomManager.roomState) return;

    const state = roomManager.roomState;

    // Display room code
    _text('room-code', state.roomId || '');
    _text('room-topic', state.topic || '');
    _text('option-a-label', state.optionA || 'YES');
    _text('option-b-label', state.optionB || 'NO');

    // QR code
    const qrEl = document.getElementById('qr-code');
    if (qrEl && window.QRCode) {
      qrEl.innerHTML = '';
      new window.QRCode(qrEl, {
        text: window.location.origin + window.location.pathname + '#join:' + state.roomId,
        width: 128,
        height: 128,
        colorDark: '#00C2D4',
        colorLight: '#0A0E1A'
      });
    }

    // Player list setup
    onStateUpdate(state);

    // Start HUD timer
    if (hudUpdateInterval) clearInterval(hudUpdateInterval);
    hudUpdateInterval = setInterval(updateHUD, 1000);
  }

  // ==================== STATE UPDATE (from room.js) ====================

  function onStateUpdate(state) {
    if (!state) return;

    // Update vote bars
    const total = state.votes.cyan + state.votes.crimson;
    const cyanPct = total > 0 ? (state.votes.cyan / total) * 100 : 50;
    const crimsonPct = total > 0 ? (state.votes.crimson / total) * 100 : 50;

    _setStyle('bar-cyan', 'width', cyanPct + '%');
    _setStyle('bar-crimson', 'width', crimsonPct + '%');
    _text('vote-count-cyan', state.votes.cyan.toString());
    _text('vote-count-crimson', state.votes.crimson.toString());

    // Underdog indicator
    const underdogEl = document.getElementById('underdog-indicator');
    if (underdogEl) {
      if (state.underdogFaction) {
        underdogEl.hidden = false;
        underdogEl.className = 'underdog-indicator faction-' + state.underdogFaction;
        underdogEl.textContent = `⚡ Underdog Surge: ${state.underdogFaction.toUpperCase()} ×${state.underdogMultiplier.toFixed(1)}`;
      } else {
        underdogEl.hidden = true;
      }
    }

    // Players / leaderboard
    renderLeaderboard(state.players || []);

    // Phase transitions
    if (state.phase === 'battle') {
      _addClass('room-container', 'battle-mode');
    } else {
      _removeClass('room-container', 'battle-mode');
    }

    if (state.phase === 'results' && currentScreen !== 'results') {
      showResults(state);
    }
  }

  function updateHUD() {
    if (!roomManager || !roomManager.roomState) return;
    const state = roomManager.roomState;

    if (state.startTime) {
      const elapsed = (Date.now() - state.startTime) / 1000;
      const remaining = Math.max(0, state.duration - elapsed);
      const mins = Math.floor(remaining / 60);
      const secs = Math.floor(remaining % 60);
      _text('room-timer', `${mins}:${secs.toString().padStart(2, '0')}`);

      // Percentage bar
      const pct = Math.min(100, (elapsed / state.duration) * 100);
      _setStyle('timer-progress', 'width', pct + '%');
    }

    // Vote cooldown
    const now = Date.now();
    const cdRemaining = Math.max(0, voteCooldownUntil - now);
    const cdEl = document.getElementById('vote-cooldown');
    if (cdEl) {
      if (cdRemaining > 0) {
        cdEl.textContent = `Cooldown: ${Math.ceil(cdRemaining / 1000)}s`;
        cdEl.hidden = false;
      } else {
        cdEl.hidden = true;
      }
    }
  }

  // ==================== VOTING ====================

  function castVote(faction) {
    const now = Date.now();
    if (now < voteCooldownUntil) return;

    if (!roomManager) return;

    myFaction = faction;

    if (roomManager.isHost) {
      roomManager.hostVote(faction);
    } else {
      roomManager.guestVote(faction);
    }

    // Cooldown: 10s normally, 5s during underdog surge if we're the underdog
    let cd = 10000;
    if (roomManager.roomState?.underdogFaction === faction) {
      cd = 5000;
    }
    voteCooldownUntil = now + cd;

    // Float animation
    _voteFloat(faction);
  }

  function _voteFloat(faction) {
    const btn = document.getElementById(faction === 'cyan' ? 'btn-vote-cyan' : 'btn-vote-crimson');
    if (!btn) return;
    const float = document.createElement('span');
    float.className = 'vote-float faction-' + faction;
    float.textContent = '+1';
    btn.parentElement.appendChild(float);
    float.addEventListener('animationend', () => float.remove());
  }

  // ==================== CHAT ====================

  function sendChat(e) {
    e.preventDefault();
    const input = document.getElementById('chat-input');
    if (!input) return;
    const text = input.value.trim();
    if (!text || text.length > 500 || !roomManager) return;

    if (roomManager.isHost) {
      roomManager.hostChat(text, 'normal');
    } else {
      roomManager.guestChat(text, 'normal');
    }

    input.value = '';
  }

  function sendTaunt() {
    const taunts = [
      '😤 Is that all you got?',
      '🔥 Feel the heat!',
      '💪 Unstoppable!',
      '🎯 Bullseye!',
      '⚡ Too fast for you!'
    ];
    const taunt = taunts[Math.floor(Math.random() * taunts.length)];
    if (!roomManager) return;

    if (roomManager.isHost) {
      roomManager.hostChat(taunt, 'taunt');
    } else {
      roomManager.guestChat(taunt, 'taunt');
    }
  }

  function onMessage(msg) {
    if (!msg) return;

    // Chat messages arrive via state updates — render them
    if (msg.type === window.MSG.STATE_UPDATE && msg.state) {
      renderChat(msg.state.messages || []);
    }
  }

  function renderChat(messages) {
    const chatEl = document.getElementById('chat-messages');
    if (!chatEl) return;

    const wasAtBottom = chatEl.scrollHeight - chatEl.scrollTop - chatEl.clientHeight < 40;

    chatEl.innerHTML = '';
    const fragment = document.createDocumentFragment();

    for (const msg of messages.slice(-100)) {
      const div = document.createElement('div');
      div.className = 'chat-msg' + (msg.msgType === 'taunt' ? ' taunt' : '');
      if (msg.faction) div.classList.add('faction-' + msg.faction);

      const nameSpan = document.createElement('span');
      nameSpan.className = 'chat-name';
      nameSpan.textContent = msg.nickname || 'Anon';
      div.appendChild(nameSpan);

      const textSpan = document.createElement('span');
      textSpan.className = 'chat-text';
      textSpan.textContent = msg.text;
      div.appendChild(textSpan);

      fragment.appendChild(div);
    }

    chatEl.appendChild(fragment);

    if (wasAtBottom) {
      chatEl.scrollTop = chatEl.scrollHeight;
    }
  }

  // ==================== LEADERBOARD ====================

  function renderLeaderboard(players) {
    const listEl = document.getElementById('leaderboard-list');
    if (!listEl) return;

    // Sort by score desc
    const sorted = [...players].sort((a, b) => (b.score || 0) - (a.score || 0));

    listEl.innerHTML = '';
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < sorted.length; i++) {
      const p = sorted[i];
      const row = document.createElement('div');
      row.className = 'leaderboard-row';
      if (p.faction) row.classList.add('faction-' + p.faction);

      const rank = document.createElement('span');
      rank.className = 'lb-rank';
      rank.textContent = `#${i + 1}`;
      row.appendChild(rank);

      const name = document.createElement('span');
      name.className = 'lb-name';
      name.textContent = p.nickname || 'Anon';
      row.appendChild(name);

      const score = document.createElement('span');
      score.className = 'lb-score';
      score.textContent = p.score || 0;
      row.appendChild(score);

      // Challenge button (if not self)
      if (p.peerId !== roomManager?.peerId) {
        const challengeBtn = document.createElement('button');
        challengeBtn.className = 'btn btn-tiny btn-challenge';
        challengeBtn.textContent = '⚔️';
        challengeBtn.title = 'Challenge';
        challengeBtn.addEventListener('click', () => issueChallenge(p.peerId));
        row.appendChild(challengeBtn);
      }

      fragment.appendChild(row);
    }

    listEl.appendChild(fragment);

    _text('player-count', `${players.length} player${players.length !== 1 ? 's' : ''}`);
  }

  // ==================== CHALLENGES ====================

  function issueChallenge(targetId) {
    if (!roomManager) return;

    if (roomManager.isHost) {
      roomManager.hostChallenge(targetId);
    } else {
      roomManager.guestChallenge(targetId);
    }
  }

  function onChallengeRequest(challenge) {
    pendingChallenge = challenge;

    _text('challenge-from', challenge.challengerName || 'Someone');
    const modal = document.getElementById('challenge-modal');
    if (modal) modal.hidden = false;
  }

  function respondChallenge(accepted) {
    const modal = document.getElementById('challenge-modal');
    if (modal) modal.hidden = true;

    if (!pendingChallenge || !roomManager) return;

    if (roomManager.isHost) {
      roomManager.hostRespondToChallenge(pendingChallenge.challengeId, accepted);
    } else {
      roomManager.guestRespondToChallenge(pendingChallenge.challengeId, accepted);
    }

    if (accepted) {
      startMinigame(pendingChallenge);
    }

    pendingChallenge = null;
  }

  // ==================== MINIGAME ====================

  function onMinigameStart(data) {
    startMinigame(data);
  }

  function startMinigame(challengeData) {
    showScreen('minigame');

    const canvas = document.getElementById('minigame-canvas');
    if (!canvas) return;

    // Determine factions
    const challengerFaction = challengeData.challengerFaction || 'cyan';
    const responderFaction = challengerFaction === 'cyan' ? 'crimson' : 'cyan';
    const amChallenger = challengeData.challengerId === roomManager?.peerId;
    const myMGFaction = amChallenger ? challengerFaction : responderFaction;
    const oppMGFaction = amChallenger ? responderFaction : challengerFaction;

    // Underdog info
    const underdogData = roomManager?.roomState
      ? window.computeUnderdogMultiplier(roomManager.roomState.votes)
      : { faction: null, multiplier: 1.0 };

    if (signalStorm) {
      signalStorm.stop();
    }

    signalStorm = new window.SignalStorm(canvas, {
      myFaction: myMGFaction,
      opponentFaction: oppMGFaction,
      myName: nickname,
      opponentName: challengeData.opponentName || 'Opponent',
      challengeId: challengeData.challengeId,
      underdogMultiplier: underdogData.multiplier,
      underdogFaction: underdogData.faction
    }, {
      onGameEnd: (result) => {
        if (roomManager) {
          roomManager.reportMinigameResult(result);
        }
        setTimeout(() => {
          if (signalStorm) { signalStorm.stop(); signalStorm = null; }
          showScreen('room');
        }, 3000);
      },
      onSyncSend: (data) => {
        if (roomManager) {
          roomManager.sendMinigameAction(data);
        }
      }
    });

    signalStorm.start();

    // HUD for minigame
    _startMinigameHUD();
  }

  function _startMinigameHUD() {
    const updateMGHUD = () => {
      if (!signalStorm || signalStorm.gameOver) return;
      _text('mg-timer', signalStorm.getRemainingTime() + 's');
      const counts = signalStorm.getNodeCounts();
      _text('mg-cyan-nodes', counts.cyan.toString());
      _text('mg-crimson-nodes', counts.crimson.toString());
      requestAnimationFrame(updateMGHUD);
    };
    requestAnimationFrame(updateMGHUD);
  }

  function onMinigameResult(data) {
    // Host-processed results propagated via state update
    // No special handling needed; room state update triggers UI
  }

  // ==================== RESULTS ====================

  function showResults(state) {
    showScreen('results');

    _text('results-topic', state.topic || '');
    _text('results-cyan-votes', state.votes.cyan.toString());
    _text('results-crimson-votes', state.votes.crimson.toString());

    const total = state.votes.cyan + state.votes.crimson;
    const cyanPct = total > 0 ? (state.votes.cyan / total) * 100 : 50;
    _setStyle('results-bar-cyan', 'width', cyanPct + '%');
    _setStyle('results-bar-crimson', 'width', (100 - cyanPct) + '%');

    const winner = state.votes.cyan > state.votes.crimson ? 'cyan'
      : state.votes.crimson > state.votes.cyan ? 'crimson'
      : 'tie';

    _text('results-winner',
      winner === 'tie' ? "It's a tie!"
      : `${state[winner === 'cyan' ? 'optionA' : 'optionB']} wins!`
    );

    const winnerEl = document.getElementById('results-winner');
    if (winnerEl) {
      winnerEl.className = 'results-winner' + (winner !== 'tie' ? ' faction-' + winner : '');
    }

    // Confetti
    if (window.confetti && winner !== 'tie') {
      const color = winner === 'cyan' ? '#00C2D4' : '#E63946';
      window.confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: [color, '#ffffff', color]
      });
    }

    // Leaderboard in results
    renderLeaderboard(state.players || []);
  }

  // ==================== SYNC INCOMING ====================

  // The roomManager will call onStateUpdate and render chat from state
  // For incoming minigame sync, relay to SignalStorm
  function _setupMinigameRelay() {
    // This is called by room.js callbacks
  }

  // ==================== DISCONNECT ====================

  function onDisconnected(reason) {
    if (currentScreen === 'room' || currentScreen === 'minigame') {
      _showToast('Disconnected: ' + (reason || 'connection lost'));
    }
    if (signalStorm) {
      signalStorm.stop();
      signalStorm = null;
    }
    if (hudUpdateInterval) {
      clearInterval(hudUpdateInterval);
      hudUpdateInterval = null;
    }
  }

  function onError(err) {
    console.error('[App] Error:', err);
    _showToast(typeof err === 'string' ? err : err?.message || 'An error occurred');
  }

  function disconnect() {
    if (roomManager) {
      roomManager.disconnect();
      roomManager = null;
    }
    if (signalStorm) {
      signalStorm.stop();
      signalStorm = null;
    }
    if (hudUpdateInterval) {
      clearInterval(hudUpdateInterval);
      hudUpdateInterval = null;
    }
    if (lobbyPoller) {
      clearInterval(lobbyPoller);
      lobbyPoller = null;
    }
  }

  // ==================== DOM HELPERS ====================

  function _on(id, event, fn) {
    const el = document.getElementById(id);
    if (el) el.addEventListener(event, fn);
  }

  function _val(id) {
    const el = document.getElementById(id);
    return el ? el.value.trim() : '';
  }

  function _checked(id) {
    const el = document.getElementById(id);
    return el ? el.checked : false;
  }

  function _text(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  function _disable(id, disabled) {
    const el = document.getElementById(id);
    if (el) el.disabled = disabled;
  }

  function _setStyle(id, prop, val) {
    const el = document.getElementById(id);
    if (el) el.style[prop] = val;
  }

  function _addClass(id, cls) {
    const el = document.getElementById(id);
    if (el) el.classList.add(cls);
  }

  function _removeClass(id, cls) {
    const el = document.getElementById(id);
    if (el) el.classList.remove(cls);
  }

  function _esc(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function _validateNickname() {
    if (!nickname || nickname.length < 1) {
      _showToast('Please enter a nickname first');
      return false;
    }
    return true;
  }

  function _showError(id, message) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = message;
    el.hidden = false;
    setTimeout(() => { el.hidden = true; }, 4000);
  }

  function _shakeElement(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.add('shake');
    el.addEventListener('animationend', () => el.classList.remove('shake'), { once: true });
  }

  function _showToast(message) {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('fade-out');
      toast.addEventListener('animationend', () => toast.remove());
    }, 3000);
  }

  // ==================== PUBLIC API ====================

  return { init, disconnect, joinLobbyRoom };
})();

// Boot on DOM ready
document.addEventListener('DOMContentLoaded', App.init);
