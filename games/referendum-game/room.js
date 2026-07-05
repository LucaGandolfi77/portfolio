// room.js — Referendum Rumble
// PeerJS integration: host/guest roles, state sync, message protocol, lobby broadcasting

'use strict';

/**
 * Message types for the P2P protocol.
 * All messages are JSON objects with a `type` field.
 */
const MSG = Object.freeze({
  // Host → Guest
  STATE_UPDATE: 'state-update',      // Full room state snapshot
  CHALLENGE_REQUEST: 'challenge-req', // Challenge proposal from another player
  CHALLENGE_ACCEPTED: 'challenge-acc',
  CHALLENGE_DECLINED: 'challenge-dec',
  MINIGAME_SYNC: 'minigame-sync',    // Mini-game state sync
  MINIGAME_RESULT: 'minigame-result',
  KICK: 'kick',

  // Guest → Host
  JOIN: 'join',
  VOTE: 'vote',
  CHAT: 'chat',
  CHALLENGE_ISSUE: 'challenge-issue',
  CHALLENGE_RESPONSE: 'challenge-resp',
  MINIGAME_ACTION: 'minigame-action',
  MINIGAME_REPORT: 'minigame-report',

  // Lobby
  LOBBY_ANNOUNCE: 'lobby-announce',
  LOBBY_QUERY: 'lobby-query'
});

/**
 * Validate incoming peer message against expected schema.
 * Returns true if message structure is valid up to basic type checks.
 * @param {Object} msg - Parsed JSON message
 * @returns {boolean}
 */
function validateMessage(msg) {
  if (!msg || typeof msg !== 'object') return false;
  if (typeof msg.type !== 'string') return false;
  if (!Object.values(MSG).includes(msg.type)) return false;

  switch (msg.type) {
    case MSG.JOIN:
      return typeof msg.nickname === 'string' && msg.nickname.length > 0 && msg.nickname.length <= 24;
    case MSG.VOTE:
      return msg.faction === 'cyan' || msg.faction === 'crimson';
    case MSG.CHAT:
      return typeof msg.text === 'string' && msg.text.length > 0 && msg.text.length <= 500
        && ['normal', 'taunt'].includes(msg.msgType);
    case MSG.CHALLENGE_ISSUE:
      return typeof msg.targetId === 'string';
    case MSG.CHALLENGE_RESPONSE:
      return typeof msg.challengeId === 'string'
        && (msg.accepted === true || msg.accepted === false);
    case MSG.MINIGAME_ACTION:
    case MSG.MINIGAME_REPORT:
    case MSG.MINIGAME_SYNC:
    case MSG.MINIGAME_RESULT:
      return typeof msg.data === 'object';
    case MSG.STATE_UPDATE:
      return typeof msg.state === 'object';
    case MSG.CHALLENGE_REQUEST:
    case MSG.CHALLENGE_ACCEPTED:
    case MSG.CHALLENGE_DECLINED:
      return typeof msg.challengeId === 'string';
    case MSG.KICK:
      return typeof msg.reason === 'string';
    case MSG.LOBBY_ANNOUNCE:
      return typeof msg.roomInfo === 'object';
    case MSG.LOBBY_QUERY:
      return true;
    default:
      return true;
  }
}

/**
 * Generate a random 6-character alphanumeric room code.
 * @returns {string}
 */
function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no I/O/0/1 to avoid confusion
  let code = '';
  const arr = new Uint8Array(6);
  crypto.getRandomValues(arr);
  for (let i = 0; i < 6; i++) {
    code += chars[arr[i] % chars.length];
  }
  return code;
}

/**
 * Create an initial room state object.
 * @param {Object} config - Room configuration from host
 * @returns {Object} Room state
 */
function createRoomState(config) {
  return {
    roomId: config.roomId || generateRoomCode(),
    topic: config.topic || 'Should we change the world?',
    optionA: config.optionA || 'YES',
    optionB: config.optionB || 'NO',
    votes: { cyan: 0, crimson: 0 },
    players: [],
    messages: [],
    activeChallenges: [],
    phase: 'lobby',
    startTime: null,
    duration: config.duration || 300,
    underdogFaction: null,
    underdogMultiplier: 1.0
  };
}

/**
 * Compute the underdog faction and multiplier from vote counts.
 * @param {{ cyan: number, crimson: number }} votes
 * @returns {{ faction: string|null, multiplier: number }}
 */
function computeUnderdogMultiplier(votes) {
  const total = votes.cyan + votes.crimson;
  if (total === 0) return { faction: null, multiplier: 1.0 };
  const losingFaction = votes.cyan <= votes.crimson ? 'cyan' : 'crimson';
  const ratio = Math.min(votes.cyan, votes.crimson) / Math.max(votes.cyan, votes.crimson);
  // ratio=1 (tied) → multiplier=1.0; ratio=0 (wipeout) → multiplier=2.5
  const multiplier = 1.0 + (1 - ratio) * 1.5;
  return { faction: losingFaction, multiplier: parseFloat(multiplier.toFixed(2)) };
}


/**
 * RoomManager — handles all PeerJS connectivity for both host and guest roles.
 */
class RoomManager {
  /**
   * @param {Object} callbacks - Event callbacks:
   *   onStateUpdate(state), onMessage(msg), onConnected(), onDisconnected(reason),
   *   onError(err), onChallengeRequest(challenge), onChallengeResult(result),
   *   onMinigameSync(data), onMinigameStart(data), onMinigameResult(data)
   */
  constructor(callbacks = {}) {
    this.callbacks = callbacks;
    /** @type {Peer|null} */
    this.peer = null;
    /** @type {string} */
    this.peerId = '';
    /** @type {boolean} */
    this.isHost = false;
    /** @type {Object|null} */
    this.roomState = null;
    /** @type {Map<string, DataConnection>} peer connections by peer ID */
    this.connections = new Map();
    /** @type {DataConnection|null} connection to host (guest only) */
    this.hostConnection = null;
    /** @type {number|null} state broadcast interval (host only) */
    this._broadcastInterval = null;
    /** @type {number|null} underdog recompute interval (host only) */
    this._underdogInterval = null;
    /** @type {number|null} lobby announce interval */
    this._lobbyInterval = null;
    /** @type {DataConnection|null} lobby index connection */
    this._lobbyConn = null;
    /** @type {string} my nickname */
    this.nickname = '';
    /** @type {string|null} my faction */
    this.faction = null;
    /** @type {number} reconnection attempts */
    this._reconnectAttempts = 0;
    this._maxReconnectAttempts = 5;
    /** @type {boolean} whether the room is published to lobby */
    this.isPublic = false;
  }

  /**
   * Initialize PeerJS peer with optional custom ID.
   * @param {string} [customId] - If provided, use as peer ID (for host with room code)
   * @returns {Promise<string>} Resolved peer ID
   */
  initPeer(customId) {
    return new Promise((resolve, reject) => {
      if (this.peer) {
        this.peer.destroy();
      }

      const peerConfig = customId ? { id: `rr-${customId}` } : {};

      this.peer = new Peer(peerConfig.id || undefined, {
        debug: 0,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' }
          ]
        }
      });

      this.peer.on('open', (id) => {
        this.peerId = id;
        this._reconnectAttempts = 0;
        resolve(id);
      });

      this.peer.on('error', (err) => {
        console.error('[Room] Peer error:', err);
        if (err.type === 'unavailable-id') {
          reject(new Error('Room code already in use. Try a different one.'));
        } else if (err.type === 'peer-unavailable') {
          this.callbacks.onError?.('Room not found. Check the code and try again.');
        } else {
          this.callbacks.onError?.(err.message || 'Connection error');
          this._attemptReconnect();
        }
      });

      this.peer.on('disconnected', () => {
        this._attemptReconnect();
      });

      this.peer.on('close', () => {
        this.callbacks.onDisconnected?.('Peer connection closed');
      });
    });
  }

  /**
   * Attempt reconnection with exponential backoff.
   * @private
   */
  _attemptReconnect() {
    if (this._reconnectAttempts >= this._maxReconnectAttempts) {
      this.callbacks.onDisconnected?.('Failed to reconnect after multiple attempts');
      return;
    }

    this._reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this._reconnectAttempts), 16000);

    setTimeout(() => {
      if (this.peer && this.peer.disconnected && !this.peer.destroyed) {
        this.peer.reconnect();
      }
    }, delay);
  }

  // ============== HOST ==============

  /**
   * Create and host a new room.
   * @param {Object} config - { topic, optionA, optionB, duration, isPublic }
   * @param {string} nickname
   * @returns {Promise<Object>} The room state
   */
  async hostRoom(config, nickname) {
    this.isHost = true;
    this.nickname = nickname;

    const roomCode = generateRoomCode();
    config.roomId = roomCode;

    await this.initPeer(roomCode);

    this.roomState = createRoomState(config);
    this.isPublic = config.isPublic || false;

    // Add host as first player
    this.roomState.players.push({
      id: this.peerId,
      nickname: nickname,
      faction: null,
      score: 0,
      isHost: true,
      wins: 0,
      streak: 0
    });

    // Listen for incoming connections
    this.peer.on('connection', (conn) => this._handleIncomingConnection(conn));

    // Start state broadcast
    this._broadcastInterval = setInterval(() => this._broadcastState(), 500);

    // Start underdog recompute
    this._underdogInterval = setInterval(() => this._recomputeUnderdog(), 5000);

    // Announce to lobby if public
    if (this.isPublic) {
      this._startLobbyAnnounce();
    }

    this.callbacks.onStateUpdate?.(this.roomState);
    this.callbacks.onConnected?.();

    return this.roomState;
  }

  /**
   * Handle an incoming peer connection (host side).
   * @param {DataConnection} conn
   * @private
   */
  _handleIncomingConnection(conn) {
    if (this.connections.size >= 49) { // max 50 including host
      conn.on('open', () => {
        conn.send(JSON.stringify({
          type: MSG.KICK,
          reason: 'Room is full (max 50 players)'
        }));
        setTimeout(() => conn.close(), 500);
      });
      return;
    }

    conn.on('open', () => {
      this.connections.set(conn.peer, conn);
    });

    conn.on('data', (raw) => {
      try {
        const msg = typeof raw === 'string' ? JSON.parse(raw) : raw;
        if (!validateMessage(msg)) {
          console.warn('[Room] Invalid message from', conn.peer, msg);
          return;
        }
        this._handleGuestMessage(conn, msg);
      } catch (e) {
        console.warn('[Room] Bad data from peer:', e);
      }
    });

    conn.on('close', () => {
      this._removePlayer(conn.peer);
      this.connections.delete(conn.peer);
    });

    conn.on('error', (err) => {
      console.error('[Room] Connection error with', conn.peer, err);
      this._removePlayer(conn.peer);
      this.connections.delete(conn.peer);
    });
  }

  /**
   * Handle messages from a guest (host side).
   * @param {DataConnection} conn
   * @param {Object} msg
   * @private
   */
  _handleGuestMessage(conn, msg) {
    switch (msg.type) {
      case MSG.JOIN: {
        // Add player
        const existing = this.roomState.players.find(p => p.id === conn.peer);
        if (!existing) {
          if (this.roomState.players.length >= 50) {
            conn.send(JSON.stringify({ type: MSG.KICK, reason: 'Room is full' }));
            return;
          }
          this.roomState.players.push({
            id: conn.peer,
            nickname: msg.nickname.slice(0, 24),
            faction: null,
            score: 0,
            isHost: false,
            wins: 0,
            streak: 0
          });
          this._addSystemMessage(`${msg.nickname.slice(0, 24)} joined the room`);
        }
        break;
      }

      case MSG.VOTE: {
        if (this.roomState.phase !== 'voting' && this.roomState.phase !== 'battle') return;
        const player = this.roomState.players.find(p => p.id === conn.peer);
        if (!player) return;

        // Set faction on first vote if not set
        if (!player.faction) {
          player.faction = msg.faction;
        }

        // Count vote
        if (msg.faction === 'cyan' || msg.faction === 'crimson') {
          this.roomState.votes[msg.faction]++;
          player.score += 1;
        }
        break;
      }

      case MSG.CHAT: {
        const sender = this.roomState.players.find(p => p.id === conn.peer);
        if (!sender) return;

        // Taunt costs 5 votes from the faction pool
        if (msg.msgType === 'taunt') {
          const faction = sender.faction;
          if (!faction || this.roomState.votes[faction] < 5) return;
          this.roomState.votes[faction] -= 5;
        }

        this.roomState.messages.push({
          id: crypto.randomUUID(),
          sender: sender.nickname,
          faction: sender.faction || 'neutral',
          text: msg.text.slice(0, 500),
          timestamp: Date.now(),
          type: msg.msgType
        });

        // Keep last 100 messages
        if (this.roomState.messages.length > 100) {
          this.roomState.messages = this.roomState.messages.slice(-100);
        }
        break;
      }

      case MSG.CHALLENGE_ISSUE: {
        const challenger = this.roomState.players.find(p => p.id === conn.peer);
        const target = this.roomState.players.find(p => p.id === msg.targetId);
        if (!challenger || !target) return;
        if (challenger.faction === target.faction) return; // must be opposing
        if (!challenger.faction || !target.faction) return;

        const challengeId = crypto.randomUUID();
        const challenge = {
          id: challengeId,
          challengerId: conn.peer,
          challengerName: challenger.nickname,
          targetId: msg.targetId,
          targetName: target.nickname,
          timestamp: Date.now(),
          status: 'pending'
        };

        this.roomState.activeChallenges.push(challenge);
        this._addSystemMessage(`⚔ ${challenger.nickname} challenges ${target.nickname} to Signal Storm!`);

        // Forward to target
        const targetConn = this.connections.get(msg.targetId);
        if (targetConn) {
          targetConn.send(JSON.stringify({
            type: MSG.CHALLENGE_REQUEST,
            challengeId,
            challengerName: challenger.nickname,
            challengerId: conn.peer
          }));
        }

        // If target is host
        if (msg.targetId === this.peerId) {
          this.callbacks.onChallengeRequest?.({
            challengeId,
            challengerName: challenger.nickname,
            challengerId: conn.peer
          });
        }

        // Auto-decline after 30s
        setTimeout(() => {
          const ch = this.roomState.activeChallenges.find(c => c.id === challengeId);
          if (ch && ch.status === 'pending') {
            ch.status = 'declined';
            this._addSystemMessage(`${target.nickname} did not respond to the challenge`);
            this.roomState.activeChallenges = this.roomState.activeChallenges.filter(c => c.id !== challengeId);
          }
        }, 30000);
        break;
      }

      case MSG.CHALLENGE_RESPONSE: {
        const challenge = this.roomState.activeChallenges.find(c => c.id === msg.challengeId);
        if (!challenge) return;
        if (challenge.targetId !== conn.peer) return;

        if (msg.accepted) {
          challenge.status = 'active';
          this._addSystemMessage(`⚔ Challenge accepted! ${challenge.challengerName} vs ${challenge.targetName} — FIGHT!`);

          // Notify both players
          const challengerConn = this.connections.get(challenge.challengerId);
          const data = {
            type: MSG.CHALLENGE_ACCEPTED,
            challengeId: challenge.id,
            opponent: { id: challenge.targetId, name: challenge.targetName, faction: this.roomState.players.find(p => p.id === challenge.targetId)?.faction }
          };

          if (challengerConn) {
            challengerConn.send(JSON.stringify(data));
          }
          if (challenge.challengerId === this.peerId) {
            this.callbacks.onMinigameStart?.(data);
          }

          const targetData = {
            type: MSG.CHALLENGE_ACCEPTED,
            challengeId: challenge.id,
            opponent: { id: challenge.challengerId, name: challenge.challengerName, faction: this.roomState.players.find(p => p.id === challenge.challengerId)?.faction }
          };
          conn.send(JSON.stringify(targetData));
        } else {
          challenge.status = 'declined';
          this._addSystemMessage(`${challenge.targetName} declined the challenge`);
          this.roomState.activeChallenges = this.roomState.activeChallenges.filter(c => c.id !== challenge.id);

          const challengerConn = this.connections.get(challenge.challengerId);
          if (challengerConn) {
            challengerConn.send(JSON.stringify({
              type: MSG.CHALLENGE_DECLINED,
              challengeId: challenge.id
            }));
          }
          if (challenge.challengerId === this.peerId) {
            this.callbacks.onChallengeResult?.({ declined: true });
          }
        }
        break;
      }

      case MSG.MINIGAME_ACTION: {
        // Forward mini-game action to the opponent
        const challenge = this.roomState.activeChallenges.find(
          c => c.status === 'active' && (c.challengerId === conn.peer || c.targetId === conn.peer)
        );
        if (!challenge) return;

        const opponentId = challenge.challengerId === conn.peer ? challenge.targetId : challenge.challengerId;
        const opponentConn = this.connections.get(opponentId);
        if (opponentConn) {
          opponentConn.send(JSON.stringify({
            type: MSG.MINIGAME_SYNC,
            data: msg.data,
            challengeId: challenge.id
          }));
        }
        if (opponentId === this.peerId) {
          this.callbacks.onMinigameSync?.(msg.data);
        }
        break;
      }

      case MSG.MINIGAME_REPORT: {
        // Game ended: process results
        const challenge = this.roomState.activeChallenges.find(c => c.id === msg.data.challengeId);
        if (!challenge) return;

        const underdogInfo = computeUnderdogMultiplier(this.roomState.votes);
        const result = msg.data;

        // Apply underdog multiplier
        let scoreA = result.scoreA || 0;
        let scoreB = result.scoreB || 0;
        const playerA = this.roomState.players.find(p => p.id === challenge.challengerId);
        const playerB = this.roomState.players.find(p => p.id === challenge.targetId);

        if (playerA?.faction === underdogInfo.faction) {
          scoreA = Math.round(scoreA * underdogInfo.multiplier);
        }
        if (playerB?.faction === underdogInfo.faction) {
          scoreB = Math.round(scoreB * underdogInfo.multiplier);
        }

        const winnerId = scoreA >= scoreB ? challenge.challengerId : challenge.targetId;
        const loserId = winnerId === challenge.challengerId ? challenge.targetId : challenge.challengerId;
        const winner = this.roomState.players.find(p => p.id === winnerId);
        const loser = this.roomState.players.find(p => p.id === loserId);

        if (winner) {
          winner.score += 50;
          winner.wins = (winner.wins || 0) + 1;
          winner.streak = (winner.streak || 0) + 1;
        }
        if (loser) {
          loser.score += 10;
          loser.streak = 0;
        }

        const winScore = winnerId === challenge.challengerId ? scoreA : scoreB;
        const loseScore = winnerId === challenge.challengerId ? scoreB : scoreA;

        this._addResultMessage(
          `🏆 ${winner?.nickname} defeated ${loser?.nickname}! Score: ${winScore} vs ${loseScore}`
        );

        // Broadcast result to both
        const resultMsg = {
          type: MSG.MINIGAME_RESULT,
          data: { winnerId, winScore, loseScore, challengeId: challenge.id }
        };

        for (const [pid, c] of this.connections) {
          c.send(JSON.stringify(resultMsg));
        }
        this.callbacks.onMinigameResult?.(resultMsg.data);

        // Clean up challenge
        this.roomState.activeChallenges = this.roomState.activeChallenges.filter(c => c.id !== challenge.id);
        break;
      }
    }
  }

  /**
   * Broadcast current state to all connected peers.
   * @private
   */
  _broadcastState() {
    if (!this.roomState) return;

    // Check game timer
    if (this.roomState.phase === 'voting' || this.roomState.phase === 'battle') {
      if (this.roomState.startTime) {
        const elapsed = (Date.now() - this.roomState.startTime) / 1000;
        if (elapsed >= this.roomState.duration) {
          this.roomState.phase = 'results';
          this._addSystemMessage('⏰ Time is up! The referendum has ended.');
        }
        // Switch to battle phase at 50% time
        if (this.roomState.phase === 'voting' && elapsed >= this.roomState.duration * 0.5) {
          this.roomState.phase = 'battle';
          this._addSystemMessage('⚔ Battle phase! Challenge your opponents to Signal Storm!');
        }
      }
    }

    const payload = JSON.stringify({
      type: MSG.STATE_UPDATE,
      state: this.roomState
    });

    for (const [, conn] of this.connections) {
      try {
        conn.send(payload);
      } catch (e) {
        // Connection might be closed
      }
    }

    // Also update local UI
    this.callbacks.onStateUpdate?.(this.roomState);
  }

  /**
   * Recompute underdog multiplier (host side).
   * @private
   */
  _recomputeUnderdog() {
    if (!this.roomState) return;
    const ud = computeUnderdogMultiplier(this.roomState.votes);
    this.roomState.underdogFaction = ud.faction;
    this.roomState.underdogMultiplier = ud.multiplier;

    // Underdog Surge: if gap > 60%, announce
    const total = this.roomState.votes.cyan + this.roomState.votes.crimson;
    if (total > 0) {
      const maxV = Math.max(this.roomState.votes.cyan, this.roomState.votes.crimson);
      if (maxV / total > 0.8 && !this.roomState._surgeSent) {
        this.roomState._surgeSent = true;
        this._addSystemMessage(`⚡ UNDERDOG SURGE! ${ud.faction?.toUpperCase()} gets halved vote cooldown for 30s!`);
        // Surge expires after 30s
        setTimeout(() => {
          if (this.roomState) this.roomState._surgeSent = false;
        }, 30000);
      }
    }
  }

  /**
   * Add a system message to the room chat.
   * @param {string} text
   * @private
   */
  _addSystemMessage(text) {
    if (!this.roomState) return;
    this.roomState.messages.push({
      id: crypto.randomUUID(),
      sender: 'System',
      faction: 'system',
      text,
      timestamp: Date.now(),
      type: 'system'
    });
    if (this.roomState.messages.length > 100) {
      this.roomState.messages = this.roomState.messages.slice(-100);
    }
  }

  /**
   * Add a result message to chat.
   * @param {string} text
   * @private
   */
  _addResultMessage(text) {
    if (!this.roomState) return;
    this.roomState.messages.push({
      id: crypto.randomUUID(),
      sender: 'System',
      faction: 'system',
      text,
      timestamp: Date.now(),
      type: 'result'
    });
  }

  /**
   * Remove a player from the room (on disconnect).
   * @param {string} peerId
   * @private
   */
  _removePlayer(peerId) {
    if (!this.roomState) return;
    const player = this.roomState.players.find(p => p.id === peerId);
    if (player) {
      this._addSystemMessage(`${player.nickname} left the room`);
      this.roomState.players = this.roomState.players.filter(p => p.id !== peerId);
    }
    // Clean up active challenges involving this player
    this.roomState.activeChallenges = this.roomState.activeChallenges.filter(
      c => c.challengerId !== peerId && c.targetId !== peerId
    );
  }

  /**
   * Host: start the voting phase.
   */
  startGame() {
    if (!this.isHost || !this.roomState) return;
    this.roomState.phase = 'voting';
    this.roomState.startTime = Date.now();
    this._addSystemMessage('🗳 Voting has begun! Cast your votes!');
    this._broadcastState();
  }

  /**
   * Host: add a vote (for self).
   * @param {string} faction
   */
  hostVote(faction) {
    if (!this.roomState) return;
    if (faction !== 'cyan' && faction !== 'crimson') return;
    if (this.roomState.phase !== 'voting' && this.roomState.phase !== 'battle') return;

    const me = this.roomState.players.find(p => p.id === this.peerId);
    if (me && !me.faction) me.faction = faction;
    if (me) me.score += 1;

    this.roomState.votes[faction]++;
  }

  /**
   * Host: post a chat message (for self).
   * @param {string} text
   * @param {string} msgType - 'normal' or 'taunt'
   */
  hostChat(text, msgType = 'normal') {
    if (!this.roomState) return;
    const me = this.roomState.players.find(p => p.id === this.peerId);
    if (!me) return;

    if (msgType === 'taunt') {
      if (!me.faction || this.roomState.votes[me.faction] < 5) return;
      this.roomState.votes[me.faction] -= 5;
    }

    this.roomState.messages.push({
      id: crypto.randomUUID(),
      sender: me.nickname,
      faction: me.faction || 'neutral',
      text: text.slice(0, 500),
      timestamp: Date.now(),
      type: msgType
    });

    if (this.roomState.messages.length > 100) {
      this.roomState.messages = this.roomState.messages.slice(-100);
    }
  }

  /**
   * Host: issue a challenge to a target player.
   * @param {string} targetId
   */
  hostChallenge(targetId) {
    if (!this.roomState) return;
    const me = this.roomState.players.find(p => p.id === this.peerId);
    const target = this.roomState.players.find(p => p.id === targetId);
    if (!me || !target) return;
    if (me.faction === target.faction) return;

    const challengeId = crypto.randomUUID();
    const challenge = {
      id: challengeId,
      challengerId: this.peerId,
      challengerName: me.nickname,
      targetId,
      targetName: target.nickname,
      timestamp: Date.now(),
      status: 'pending'
    };

    this.roomState.activeChallenges.push(challenge);
    this._addSystemMessage(`⚔ ${me.nickname} challenges ${target.nickname} to Signal Storm!`);

    // Send to target
    const targetConn = this.connections.get(targetId);
    if (targetConn) {
      targetConn.send(JSON.stringify({
        type: MSG.CHALLENGE_REQUEST,
        challengeId,
        challengerName: me.nickname,
        challengerId: this.peerId
      }));
    }

    setTimeout(() => {
      const ch = this.roomState?.activeChallenges.find(c => c.id === challengeId);
      if (ch && ch.status === 'pending') {
        ch.status = 'declined';
        this._addSystemMessage(`${target.nickname} did not respond to the challenge`);
        if (this.roomState) {
          this.roomState.activeChallenges = this.roomState.activeChallenges.filter(c => c.id !== challengeId);
        }
      }
    }, 30000);
  }

  /**
   * Host: respond to a challenge targeting the host.
   * @param {string} challengeId
   * @param {boolean} accepted
   */
  hostRespondToChallenge(challengeId, accepted) {
    if (!this.roomState) return;
    const challenge = this.roomState.activeChallenges.find(c => c.id === challengeId);
    if (!challenge || challenge.targetId !== this.peerId) return;

    if (accepted) {
      challenge.status = 'active';
      this._addSystemMessage(`⚔ Challenge accepted! ${challenge.challengerName} vs ${challenge.targetName} — FIGHT!`);

      const challengerConn = this.connections.get(challenge.challengerId);
      const challengerPlayer = this.roomState.players.find(p => p.id === challenge.challengerId);
      if (challengerConn) {
        challengerConn.send(JSON.stringify({
          type: MSG.CHALLENGE_ACCEPTED,
          challengeId: challenge.id,
          opponent: { id: this.peerId, name: this.nickname, faction: this.roomState.players.find(p => p.id === this.peerId)?.faction }
        }));
      }

      // Start minigame locally
      this.callbacks.onMinigameStart?.({
        challengeId: challenge.id,
        opponent: { id: challenge.challengerId, name: challenge.challengerName, faction: challengerPlayer?.faction }
      });
    } else {
      challenge.status = 'declined';
      this._addSystemMessage(`${challenge.targetName} declined the challenge`);
      this.roomState.activeChallenges = this.roomState.activeChallenges.filter(c => c.id !== challengeId);

      const challengerConn = this.connections.get(challenge.challengerId);
      if (challengerConn) {
        challengerConn.send(JSON.stringify({
          type: MSG.CHALLENGE_DECLINED,
          challengeId: challenge.id
        }));
      }
    }
  }

  // ============== GUEST ==============

  /**
   * Join an existing room as a guest.
   * @param {string} roomCode - 6-character room code
   * @param {string} nickname
   * @returns {Promise<void>}
   */
  async joinRoom(roomCode, nickname) {
    this.isHost = false;
    this.nickname = nickname;

    await this.initPeer();

    return new Promise((resolve, reject) => {
      const targetPeerId = `rr-${roomCode.toUpperCase()}`;

      const conn = this.peer.connect(targetPeerId, {
        reliable: true,
        serialization: 'json'
      });

      const timeout = setTimeout(() => {
        conn.close();
        reject(new Error('Connection timed out. Room may not exist.'));
      }, 10000);

      conn.on('open', () => {
        clearTimeout(timeout);
        this.hostConnection = conn;

        // Send join message
        conn.send(JSON.stringify({
          type: MSG.JOIN,
          nickname: nickname.slice(0, 24)
        }));

        this.callbacks.onConnected?.();
        resolve();
      });

      conn.on('data', (raw) => {
        try {
          const msg = typeof raw === 'string' ? JSON.parse(raw) : raw;
          if (!validateMessage(msg)) {
            console.warn('[Room] Invalid message from host:', msg);
            return;
          }
          this._handleHostMessage(msg);
        } catch (e) {
          console.warn('[Room] Bad data from host:', e);
        }
      });

      conn.on('close', () => {
        this.callbacks.onDisconnected?.('Disconnected from host');
      });

      conn.on('error', (err) => {
        clearTimeout(timeout);
        reject(new Error('Failed to connect: ' + (err.message || 'Unknown error')));
      });
    });
  }

  /**
   * Handle messages from the host (guest side).
   * @param {Object} msg
   * @private
   */
  _handleHostMessage(msg) {
    switch (msg.type) {
      case MSG.STATE_UPDATE:
        this.roomState = msg.state;
        this.callbacks.onStateUpdate?.(msg.state);
        break;

      case MSG.CHALLENGE_REQUEST:
        this.callbacks.onChallengeRequest?.(msg);
        break;

      case MSG.CHALLENGE_ACCEPTED:
        this.callbacks.onMinigameStart?.(msg);
        break;

      case MSG.CHALLENGE_DECLINED:
        this.callbacks.onChallengeResult?.({ declined: true });
        break;

      case MSG.MINIGAME_SYNC:
        this.callbacks.onMinigameSync?.(msg.data);
        break;

      case MSG.MINIGAME_RESULT:
        this.callbacks.onMinigameResult?.(msg.data);
        break;

      case MSG.KICK:
        this.callbacks.onDisconnected?.(msg.reason || 'Kicked from room');
        this.disconnect();
        break;
    }
  }

  /**
   * Guest: send a vote.
   * @param {string} faction
   */
  guestVote(faction) {
    if (!this.hostConnection) return;
    this.hostConnection.send(JSON.stringify({
      type: MSG.VOTE,
      faction
    }));
  }

  /**
   * Guest: send a chat message.
   * @param {string} text
   * @param {string} msgType
   */
  guestChat(text, msgType = 'normal') {
    if (!this.hostConnection) return;
    this.hostConnection.send(JSON.stringify({
      type: MSG.CHAT,
      text: text.slice(0, 500),
      msgType
    }));
  }

  /**
   * Guest: issue a challenge.
   * @param {string} targetId
   */
  guestChallenge(targetId) {
    if (!this.hostConnection) return;
    this.hostConnection.send(JSON.stringify({
      type: MSG.CHALLENGE_ISSUE,
      targetId
    }));
  }

  /**
   * Guest: respond to a challenge.
   * @param {string} challengeId
   * @param {boolean} accepted
   */
  guestRespondToChallenge(challengeId, accepted) {
    if (!this.hostConnection) return;
    this.hostConnection.send(JSON.stringify({
      type: MSG.CHALLENGE_RESPONSE,
      challengeId,
      accepted
    }));
  }

  /**
   * Send a mini-game action to the opponent via host relay.
   * @param {Object} data
   */
  sendMinigameAction(data) {
    if (this.isHost) {
      // Host: send directly to opponent connection
      const challenge = this.roomState?.activeChallenges.find(
        c => c.status === 'active' && (c.challengerId === this.peerId || c.targetId === this.peerId)
      );
      if (!challenge) return;
      const opponentId = challenge.challengerId === this.peerId ? challenge.targetId : challenge.challengerId;
      const opponentConn = this.connections.get(opponentId);
      if (opponentConn) {
        opponentConn.send(JSON.stringify({
          type: MSG.MINIGAME_SYNC,
          data
        }));
      }
    } else if (this.hostConnection) {
      this.hostConnection.send(JSON.stringify({
        type: MSG.MINIGAME_ACTION,
        data
      }));
    }
  }

  /**
   * Report mini-game result (called by the challenger).
   * @param {Object} data - { challengeId, scoreA, scoreB }
   */
  reportMinigameResult(data) {
    if (this.isHost) {
      // Process locally
      this._handleGuestMessage(
        { peer: this.peerId },
        { type: MSG.MINIGAME_REPORT, data }
      );
    } else if (this.hostConnection) {
      this.hostConnection.send(JSON.stringify({
        type: MSG.MINIGAME_REPORT,
        data
      }));
    }
  }

  // ============== LOBBY ==============

  /**
   * Start announcing this room to the lobby index channel.
   * @private
   */
  _startLobbyAnnounce() {
    this._lobbyInterval = setInterval(() => {
      if (!this.roomState || this.roomState.phase === 'results') {
        this._stopLobbyAnnounce();
        return;
      }

      const info = {
        roomId: this.roomState.roomId,
        topic: this.roomState.topic,
        playerCount: this.roomState.players.length,
        votes: { ...this.roomState.votes },
        phase: this.roomState.phase,
        timeRemaining: this.roomState.startTime
          ? Math.max(0, this.roomState.duration - (Date.now() - this.roomState.startTime) / 1000)
          : this.roomState.duration,
        timestamp: Date.now()
      };

      // Try to connect to lobby-index peer to announce
      try {
        if (!this._lobbyConn || !this._lobbyConn.open) {
          this._lobbyConn = this.peer.connect('rr-lobby-index', { reliable: false });
          this._lobbyConn.on('open', () => {
            this._lobbyConn.send(JSON.stringify({
              type: MSG.LOBBY_ANNOUNCE,
              roomInfo: info
            }));
          });
          this._lobbyConn.on('error', () => {});
        } else {
          this._lobbyConn.send(JSON.stringify({
            type: MSG.LOBBY_ANNOUNCE,
            roomInfo: info
          }));
        }
      } catch {
        // Lobby index may not exist — that's OK
      }
    }, 3000);
  }

  /**
   * Stop lobby announcements.
   * @private
   */
  _stopLobbyAnnounce() {
    if (this._lobbyInterval) {
      clearInterval(this._lobbyInterval);
      this._lobbyInterval = null;
    }
    if (this._lobbyConn) {
      try { this._lobbyConn.close(); } catch {}
      this._lobbyConn = null;
    }
  }

  /**
   * Query the lobby for public rooms.
   * Uses a local cache of known rooms + attempts to query lobby-index peer.
   * @returns {Promise<Array>} List of room info objects
   */
  async queryLobby() {
    // Since there's no central server, we maintain a local list
    // that gets populated via lobby-index announcements
    return Array.from(RoomManager._lobbyCache.values())
      .filter(r => Date.now() - r.timestamp < 30 * 60 * 1000) // 30 min expiry
      .sort((a, b) => b.playerCount - a.playerCount);
  }

  /**
   * Start listening for lobby announcements (for the lobby list screen).
   * @param {Function} onUpdate - Called with updated room list
   */
  startLobbyListener(onUpdate) {
    if (!this.peer) {
      this.initPeer('lobby-listener-' + Date.now()).then(() => {
        this._setupLobbyListener(onUpdate);
      }).catch(() => {});
    } else {
      this._setupLobbyListener(onUpdate);
    }
  }

  /**
   * @private
   */
  _setupLobbyListener(onUpdate) {
    // Listen for incoming connections from room hosts announcing
    this.peer.on('connection', (conn) => {
      conn.on('data', (raw) => {
        try {
          const msg = typeof raw === 'string' ? JSON.parse(raw) : raw;
          if (msg.type === MSG.LOBBY_ANNOUNCE && msg.roomInfo) {
            RoomManager._lobbyCache.set(msg.roomInfo.roomId, msg.roomInfo);
            onUpdate?.(Array.from(RoomManager._lobbyCache.values())
              .filter(r => Date.now() - r.timestamp < 30 * 60 * 1000));
          }
        } catch {}
      });
    });

    // Poll periodically
    this._lobbyPollInterval = setInterval(() => {
      onUpdate?.(Array.from(RoomManager._lobbyCache.values())
        .filter(r => Date.now() - r.timestamp < 30 * 60 * 1000));
    }, 3000);
  }

  /**
   * Stop lobby listener.
   */
  stopLobbyListener() {
    if (this._lobbyPollInterval) {
      clearInterval(this._lobbyPollInterval);
      this._lobbyPollInterval = null;
    }
  }

  // ============== COMMON ==============

  /**
   * Disconnect and clean up all connections.
   */
  disconnect() {
    if (this._broadcastInterval) clearInterval(this._broadcastInterval);
    if (this._underdogInterval) clearInterval(this._underdogInterval);
    this._stopLobbyAnnounce();
    this.stopLobbyListener();

    for (const [, conn] of this.connections) {
      try { conn.close(); } catch {}
    }
    this.connections.clear();

    if (this.hostConnection) {
      try { this.hostConnection.close(); } catch {}
      this.hostConnection = null;
    }

    if (this.peer) {
      try { this.peer.destroy(); } catch {}
      this.peer = null;
    }

    this.roomState = null;
    this.isHost = false;
  }

  /**
   * Get the current room code.
   * @returns {string|null}
   */
  getRoomCode() {
    return this.roomState?.roomId || null;
  }

  /**
   * Get the local player's ID.
   * @returns {string}
   */
  getMyId() {
    return this.peerId;
  }

  /**
   * Get the local player's faction.
   * @returns {string|null}
   */
  getMyFaction() {
    if (!this.roomState) return this.faction;
    const me = this.roomState.players.find(p => p.id === this.peerId);
    return me?.faction || this.faction;
  }

  /**
   * Set the local player's faction.
   * @param {string} faction
   */
  setMyFaction(faction) {
    this.faction = faction;
    if (this.isHost && this.roomState) {
      const me = this.roomState.players.find(p => p.id === this.peerId);
      if (me) me.faction = faction;
    }
  }
}

/** @type {Map<string, Object>} Shared lobby cache */
RoomManager._lobbyCache = new Map();

// Export for use in app.js
window.RoomManager = RoomManager;
window.MSG = MSG;
window.computeUnderdogMultiplier = computeUnderdogMultiplier;
