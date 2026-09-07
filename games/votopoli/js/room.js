// room.js — PeerJS multiplayer rooms (adapted from referendum-game)
window.Room = (() => {
  const MSG = Object.freeze({
    STATE_UPDATE: 'state-update',
    JOIN: 'join',
    CHAT: 'chat',
    VOTE: 'vote',
    DONATE: 'donate',
    LOBBY_ANNOUNCE: 'lobby-announce',
    LOBBY_QUERY: 'lobby-query',
    ELECTION_START: 'election-start',
    ELECTION_RESULT: 'election-result',
    KICK: 'kick',
    PLAYER_LIST: 'player-list'
  });

  let peer = null, conn = null, isHost = false;
  let roomState = null, guests = [], hostId = null;
  let onStateUpdate = null, onChat = null, onElection = null;
  let cityName = 'Bastardo';
  let roomId = '';
  let playerName = 'Cittadino';

  function generateRoomId(cityId) {
    return 'votopoli-' + cityId;
  }

  function validateMessage(msg) {
    if (!msg || typeof msg !== 'object') return false;
    if (typeof msg.type !== 'string') return false;
    return Object.values(MSG).includes(msg.type);
  }

  function createRoom(city, name, callbacks) {
    cityName = city;
    playerName = name;
    onStateUpdate = callbacks.onStateUpdate || (() => {});
    onChat = callbacks.onChat || (() => {});
    onElection = callbacks.onElection || (() => {});

    try {
      roomId = generateRoomId(city);
      peer = new Peer(roomId);
      isHost = true;
      hostId = roomId;

      peer.on('open', () => {
        console.log('[Room] Hosted:', roomId);
        roomState = { city, players: [{ id: hostId, name, isHost: true }], chat: [] };
        onStateUpdate(roomState);
      });

      peer.on('connection', (c) => {
        c.on('open', () => {
          guests.push(c);
          roomState.players.push({ id: c.peer, name: c.metadata?.name || 'Ospite', isHost: false });
          broadcastState();
          onStateUpdate(roomState);
        });
        c.on('data', (data) => handleGuestData(c, data));
        c.on('close', () => {
          guests = guests.filter(g => g.peer !== c.peer);
          roomState.players = roomState.players.filter(p => p.id !== c.peer);
          broadcastState();
          onStateUpdate(roomState);
        });
      });

      peer.on('error', (err) => {
        console.warn('[Room] PeerJS error (host):', err.type);
        if (err.type === 'unavailable-id') {
          isHost = false;
          joinRoom(city, name, callbacks);
        }
      });
    } catch(e) {
      console.warn('[Room] PeerJS not available, solo mode');
      roomState = { city, players: [{ id: 'solo', name, isHost: true }], chat: [], solo: true };
      onStateUpdate(roomState);
    }
  }

  function joinRoom(city, name, callbacks) {
    cityName = city;
    playerName = name;
    onStateUpdate = callbacks.onStateUpdate || (() => {});
    onChat = callbacks.onChat || (() => {});
    onElection = callbacks.onElection || (() => {});

    try {
      roomId = generateRoomId(city);
      peer = new Peer();
      isHost = false;

      peer.on('open', () => {
        console.log('[Room] Joining:', roomId);
        conn = peer.connect(roomId, { metadata: { name } });
        hostId = roomId;

        conn.on('open', () => {
          conn.send({ type: MSG.JOIN, nickname: name });
          roomState = { city, players: [{ id: peer.peer, name, isHost: false }], chat: [] };
          onStateUpdate(roomState);
        });
        conn.on('data', (data) => handleHostData(data));
        conn.on('close', () => {
          console.log('[Room] Disconnected from host');
          roomState = null;
        });
      });

      peer.on('error', (err) => {
        console.warn('[Room] PeerJS error (join):', err.type);
        roomState = { city, players: [{ id: 'solo', name, isHost: true }], chat: [], solo: true };
        onStateUpdate(roomState);
      });
    } catch(e) {
      console.warn('[Room] PeerJS not available, solo mode');
      roomState = { city, players: [{ id: 'solo', name, isHost: true }], chat: [], solo: true };
      onStateUpdate(roomState);
    }
  }

  function handleGuestData(c, data) {
    if (!validateMessage(data)) return;
    switch (data.type) {
      case MSG.CHAT:
        if (data.text) {
          roomState.chat.push({ from: data.from || 'Ospite', text: data.text, ts: Date.now() });
          onChat(roomState.chat);
        }
        break;
      case MSG.VOTE:
        if (onElection) onElection({ type: 'playerVote', candidateId: data.candidateId });
        break;
      case MSG.DONATE:
        if (onElection) onElection({ type: 'playerDonate', amount: data.amount });
        break;
    }
  }

  function handleHostData(data) {
    if (!validateMessage(data)) return;
    switch (data.type) {
      case MSG.STATE_UPDATE:
        if (data.state) {
          roomState = data.state;
          onStateUpdate(roomState);
        }
        break;
      case MSG.CHAT:
        if (data.text) {
          roomState.chat.push({ from: data.from || 'Host', text: data.text, ts: Date.now() });
          onChat(roomState.chat);
        }
        break;
      case MSG.ELECTION_START:
        if (onElection) onElection({ type: 'start', candidates: data.candidates });
        break;
      case MSG.ELECTION_RESULT:
        if (onElection) onElection({ type: 'result', winner: data.winner, results: data.results });
        break;
    }
  }

  function broadcastState() {
    if (!isHost) return;
    guests.forEach(c => {
      try { c.send({ type: MSG.STATE_UPDATE, state: roomState }); } catch(e) {}
    });
  }

  function sendChat(text) {
    const msg = { type: MSG.CHAT, from: playerName, text, ts: Date.now() };
    if (roomState) roomState.chat.push(msg);
    if (isHost) {
      guests.forEach(c => { try { c.send(msg); } catch(e) {} });
    } else if (conn) {
      try { conn.send(msg); } catch(e) {}
    }
    onChat(roomState?.chat || []);
  }

  function sendVote(candidateId) {
    const msg = { type: MSG.VOTE, candidateId };
    if (isHost) {
      guests.forEach(c => { try { c.send(msg); } catch(e) {} });
      if (onElection) onElection({ type: 'playerVote', candidateId });
    } else if (conn) {
      try { conn.send(msg); } catch(e) {}
    }
  }

  function sendDonate(amount) {
    const msg = { type: MSG.DONATE, amount };
    if (isHost) {
      guests.forEach(c => { try { c.send(msg); } catch(e) {} });
    } else if (conn) {
      try { conn.send(msg); } catch(e) {}
    }
  }

  function broadcastElection(candidates) {
    if (!isHost) return;
    const msg = { type: MSG.ELECTION_START, candidates };
    guests.forEach(c => { try { c.send(msg); } catch(e) {} });
  }

  function broadcastResult(winner, results) {
    if (!isHost) return;
    const msg = { type: MSG.ELECTION_RESULT, winner, results };
    guests.forEach(c => { try { c.send(msg); } catch(e) {} });
  }

  function destroy() {
    if (conn) { try { conn.close(); } catch(e) {} }
    if (peer) { try { peer.destroy(); } catch(e) {} }
    peer = null; conn = null; isHost = false; guests = [];
  }

  function getState() { return roomState; }
  function isHostPlayer() { return isHost; }
  function getPlayerCount() { return roomState ? roomState.players.length : 1; }

  return {
    MSG, createRoom, joinRoom, destroy,
    sendChat, sendVote, sendDonate,
    broadcastElection, broadcastResult, broadcastState,
    getState, isHostPlayer, getPlayerCount
  };
})();
