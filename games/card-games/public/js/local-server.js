/* LocalCG — esegue la logica di gioco del server direttamente nel browser.
 * Modalità statica (GitHub Pages): partita vs Bot senza backend.
 * Il multiplayer LAN resta disponibile avviando `npm start`.
 * Funziona anche in Node (module.exports) per i test end-to-end. */
(function (root) {
  "use strict";

  var BASE = "../server/";
  var FILES = [
    "cards.js",
    "games/melds.js",
    "games/poker-hands.js",
    "games/blackjack.js",
    "games/briscola.js",
    "games/explodingkittens.js",
    "games/memory.js",
    "games/monopolydeal.js",
    "games/odin.js",
    "games/poker.js",
    "games/ramino.js",
    "games/scala40.js",
    "games/scopa.js",
    "games/settemezzo.js",
    "games/skullking.js",
    "games/themind.js",
    "games/thiryone.js",
    "games/tressette.js",
    "games/uno.js",
    "games/registry.js",
    "rooms.js"
  ];

  var rawSetTimeout = typeof setTimeout === "function" ? setTimeout : null;
  var rawClearTimeout = typeof clearTimeout === "function" ? clearTimeout : null;

  /* ---------- Mini runtime CommonJS ---------- */
  function makeRuntime() {
    var defs = {};
    var cache = {};
    function define(file, code) { defs[file] = code; }
    function load(id) {
      if (cache[id]) return cache[id].exports;
      var code = defs[id + ".js"];
      if (code == null) throw new Error("LocalCG: modulo non trovato: " + id);
      var module = { exports: {} };
      cache[id] = module;
      var dir = id.indexOf("/") >= 0 ? id.slice(0, id.lastIndexOf("/")) : "";
      function requireIt(spec) {
        var target = spec;
        if (spec.indexOf("./") === 0) target = (dir ? dir + "/" : "") + spec.slice(2);
        else if (spec.indexOf("../") === 0) target = spec.slice(3);
        return load(target.replace(/\.js$/, ""));
      }
      var fn = new Function("require", "module", "exports", code);
      fn(requireIt, module, module.exports);
      return module.exports;
    }
    return { define: define, load: load };
  }

  function bootBrowser(cb) {
    var rt = makeRuntime();
    var bundled = root.__LOCALCG_BUNDLE__;
    if (bundled) {
      var missing = [];
      FILES.forEach(function (f) {
        if (typeof bundled[f] === "string") rt.define(f, bundled[f]);
        else missing.push(f);
      });
      if (missing.length) {
        cb(new Error("file mancanti nel bundle (rilancia npm run build:local): " + missing.join(", ")));
        return;
      }
      if (rawSetTimeout) rawSetTimeout(function () { cb(null, rt); }, 0);
      else cb(null, rt);
      return;
    }
    var pending = FILES.length;
    var failed = false;
    FILES.forEach(function (f) {
      var xhr = new XMLHttpRequest();
      xhr.open("GET", BASE + f + "?v=local");
      xhr.onload = function () {
        if (failed) return;
        if (xhr.status !== 200) { fail("HTTP " + xhr.status + " su " + f); return; }
        rt.define(f, xhr.responseText);
        if (--pending === 0) cb(null, rt);
      };
      xhr.onerror = function () { fail("Rete non disponibile per " + f); };
      xhr.send();
    });
    function fail(msg) { if (!failed) { failed = true; cb(new Error("LocalCG: " + msg)); } }
  }

  /* ---------- Socket locale ---------- */
  var SOCKETS = new Set();

  function findSocket(id) {
    var out = null;
    SOCKETS.forEach(function (s) { if (!out && s.id === id) out = s; });
    return out;
  }

  function LocalSocket(nickname) {
    this.id = "local_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
    this.nickname = nickname || "Giocatore";
    this.connected = true;
    this._subs = {};
    SOCKETS.add(this);
  }
  LocalSocket.prototype.on = function (ev, fn) {
    (this._subs[ev] = this._subs[ev] || []).push(fn);
  };
  LocalSocket.prototype._receive = function (ev, payload) {
    (this._subs[ev] || []).slice().forEach(function (fn) {
      try { fn(payload); } catch (e) { if (root.console) console.error(e); }
    });
  };
  LocalSocket.prototype.disconnect = function () {
    if (!this.connected) return;
    this.connected = false;
    SOCKETS.delete(this);
    this._server.onDisconnect(this);
  };

  function serializeRoom(room) {
    if (!room) return null;
    return {
      code: room.code, gameId: room.gameId, gameName: room.game.name,
      state: room.state, chatHistory: room.chatHistory || [],
      players: room.players.map(function (p) { return { id: p.id, nickname: p.nickname, isBot: p.isBot, difficulty: p.isBot ? p.difficulty : undefined }; }),
      hostId: room.hostId, minPlayers: room.game.minPlayers, maxPlayers: room.game.maxPlayers,
      gameDescription: room.game.description
    };
  }

  function attachServer(socket, mods) {
    var rooms = mods.rooms;
    var registry = mods.registry;
    var roomOf = null;

    var io = {
      to: function (pid) {
        return { emit: function (ev, payload) {
          var t = findSocket(pid);
          if (t) t._receive(ev, payload);
        } };
      },
      emit: function (ev, payload) {
        SOCKETS.forEach(function (s) { s._receive(ev, payload); });
      }
    };

    var gameIdOf = function (room) {
      return room.game.meta ? room.game.meta.id : room.game.id;
    };

    // io.to() di socket.io: accetta sia un socket-id sia un codice stanza
    function deliver(target, ev, payload) {
      SOCKETS.forEach(function (s) {
        if (s.id === target || s._room === target) s._receive(ev, payload);
      });
    }
    var io = {
      to: function (target) {
        return { emit: function (ev, payload) { deliver(target, ev, payload); } };
      },
      emit: function (ev, payload) {
        SOCKETS.forEach(function (s) { s._receive(ev, payload); });
      }
    };
    var joinRoomOf = function (s, code) { s._room = code; };

    function pushStates(room) {
      if (!room.gameState) return;
      var gid = gameIdOf(room);
      room.gameState.playerOrder.forEach(function (pid) {
        var st = room.game.getPublicState(room.gameState, pid);
        st.gameType = gid;
        io.to(pid).emit("gameUpdate", st);
      });
    }
    function advance(room) {
      if (room.gameState.phase === "roundEnd" && room.game.nextRound) {
        room.game.nextRound(room.gameState);
      }
      pushStates(room);

      // Fasi "fine mano" senza azioni valide (es. Odin): se il turno è di un bot,
      // questi porta avanti lui stesso il prossimo giro; se è dell'umano, lasciamo
      // che sia il suo client a mandare nextRound.
      var gs = room.gameState;
      if (gs.phase === "handOver" && gs.currentPlayer) {
        var actor = room.players.find(function (p) { return p.id === gs.currentPlayer && p.isBot; });
        if (!actor) actor = room.players.find(function (p) { return p.isBot; });
        if (actor) {
          // NB: setTimeout globale (non raw): in test viene accodato e pompato subito
          setTimeout(function () {
            var rr = rooms.getRoom(room.code);
            if (!rr || !rr.gameState || rr.gameState.phase !== "handOver") return;
            var res = rooms.handleAction(room.code, actor.id, { type: "nextRound" });
            if (res && res.error) return;
            advance(rr);
          }, 500);
          return;
        }
      }

      rooms.scheduleBotAction(room, io);
      rooms.startTurnTimer(room, io);
    }
    function sysMsg(room, text) {
      io.to(room.code).emit("chatMessage", { from: "Sistema", text: text });
    }
    function broadcastRoom(room) {
      io.to(room.code).emit("roomUpdate", serializeRoom(room));
    }

    function handle(ev, payload, cb, respond) {
      switch (ev) {
        case "createRoom": {
          var res = rooms.createRoom(payload.gameId, socket.id, socket.nickname);
          if (res.error) return respond({ error: res.error });
          roomOf = res.roomCode;
          joinRoomOf(socket, res.roomCode);
          respond({ ok: true, roomCode: res.roomCode, room: serializeRoom(res.room) });
          break;
        }
        case "joinRoom":
          var jr = rooms.joinRoom(payload.roomCode, socket.id, socket.nickname);
          if (jr.error) return respond({ error: jr.error });
          roomOf = payload.roomCode;
          joinRoomOf(socket, payload.roomCode);
          respond({ ok: true, room: serializeRoom(jr.room) });
          broadcastRoom(jr.room);
          sysMsg(jr.room, socket.nickname + " è entrato nella stanza");
          break;
        case "leaveRoom": {
          if (!roomOf) return respond({ ok: true });
          var lr = rooms.getRoom(roomOf);
          var lres = rooms.leaveRoom(socket.id);
          socket._room = null;
          roomOf = null;
          respond({ ok: true });
          if (lres && lres.room) {
            broadcastRoom(lres.room);
            sysMsg(lres.room, socket.nickname + " ha lasciato la stanza");
            if (lres.room.gameState) {
              pushStates(lres.room);
              rooms.scheduleBotAction(lres.room, io);
              rooms.startTurnTimer(lres.room, io);
            }
          }
          void lr;
          break;
        }
        case "addBot": {
          if (!roomOf) return respond({ error: "Not in a room" });
          var r = rooms.getRoom(roomOf);
          if (!r || r.hostId !== socket.id) return respond({ error: "Only host can add bots" });
          var ab = rooms.addBot(roomOf, (payload && payload.difficulty) || "medium");
          if (ab.error) return respond(ab);
          broadcastRoom(r);
          respond({ ok: true, bot: ab.bot });
          break;
        }
        case "updateBot": {
          if (!roomOf) return respond({ error: "Not in a room" });
          var r2 = rooms.getRoom(roomOf);
          if (!r2 || r2.hostId !== socket.id) return respond({ error: "Only host can modify bots" });
          var ub = rooms.updateBotDifficulty(roomOf, payload.botId, payload.difficulty);
          if (ub.error) return respond(ub);
          broadcastRoom(r2);
          respond({ ok: true });
          break;
        }
        case "removeBot": {
          if (!roomOf) return respond({ error: "Not in a room" });
          var r3 = rooms.getRoom(roomOf);
          if (!r3 || r3.hostId !== socket.id) return respond({ error: "Only host can remove bots" });
          var rb = rooms.removeBot(roomOf, payload.botId);
          if (rb.error) return respond(rb);
          broadcastRoom(r3);
          sysMsg(r3, rb.nickname + " è stato rimosso");
          respond({ ok: true });
          break;
        }
        case "startGame": {
          if (!roomOf) return respond({ error: "Not in a room" });
          var r4 = rooms.getRoom(roomOf);
          if (!r4 || r4.hostId !== socket.id) return respond({ error: "Only host can start" });
          var sg = rooms.startGame(roomOf, (payload && payload.options) || {});
          if (sg.error) return respond(sg);
          io.to(roomOf).emit("gameStarted");
          sysMsg(r4, "🎲 Partita iniziata!");
          pushStates(r4);
          rooms.scheduleBotAction(r4, io);
          rooms.startTurnTimer(r4, io);
          respond({ ok: true });
          break;
        }
        case "playerAction": {
          if (!roomOf) return respond({ error: "Not in a room" });
          var r5 = rooms.getRoom(roomOf);
          if (!r5 || !r5.gameState) return respond({ error: "No active game" });
          var ha = rooms.handleAction(roomOf, socket.id, payload.action);
          if (ha && ha.error) return respond(ha);
          advance(r5);
          respond({ ok: true });
          break;
        }
        case "requestGameState": {
          if (!roomOf) return respond({ error: "No game state" });
          var r6 = rooms.getRoom(roomOf);
          if (!r6 || !r6.gameState) return respond({ error: "No game state" });
          var st = r6.game.getPublicState(r6.gameState, socket.id);
          st.gameType = gameIdOf(r6);
          respond(st);
          break;
        }
        case "sendChat": {
          if (!roomOf || !payload || !payload.text || !payload.text.trim()) return respond(null);
          var r7 = rooms.getRoom(roomOf);
          if (r7) io.to(roomOf).emit("chatMessage", { from: socket.nickname, text: payload.text.trim() });
          respond(null);
          break;
        }
        default:
          respond({ error: "Unknown event: " + ev });
      }
    }

    socket._server = {
      onDisconnect: function (s) {
        if (!roomOf) return;
        var res = rooms.leaveRoom(s.id);
        s._room = null;
        roomOf = null;
        if (res && res.room) {
          broadcastRoom(res.room);
          sysMsg(res.room, s.nickname + " si è disconnesso");
          if (res.room.gameState) {
            pushStates(res.room);
            rooms.scheduleBotAction(res.room, io);
            rooms.startTurnTimer(res.room, io);
          }
        }
      },
      dispatch: function (ev, payload, cb) {
        var settled = false;
        function respond(result) {
          if (settled) return;
          settled = true;
          rawSetTimeout ? rawSetTimeout(function () { cb && cb(result); }, 0)
                        : (cb && cb(result));
        }
        try {
          handle(ev, payload || {}, cb, respond);
        } catch (e) {
          if (root.console) console.error("LocalCG:", e);
          respond({ error: "Errore interno" });
        }
      }
    };

    socket.emit = function (ev, payload, cb) {
      if (typeof payload === "function") { cb = payload; payload = {}; }
      socket._server.dispatch(ev, payload, cb);
    };
  }

  function createSocket(mods, nickname) {
    var s = new LocalSocket(nickname);
    attachServer(s, mods);
    return s;
  }

  function makeApi(mods) {
    return {
      listGames: function () { return mods.registry.list(); },
      listRooms: function () { return mods.rooms.getRoomList(); }
    };
  }

  function boot(cb) {
    bootBrowser(function (err, rt) {
      if (err) { cb(err); return; }
      var mods;
      try {
        mods = { rooms: rt.load("rooms"), registry: rt.load("games/registry") };
      } catch (e) { cb(e); return; }
      cb(null, {
        connect: function (nickname) { return createSocket(mods, nickname); },
        api: makeApi(mods)
      });
    });
  }

  var LocalCG = { boot: boot, createSocket: createSocket, serializeRoom: serializeRoom };

  if (typeof module !== "undefined" && module.exports) module.exports = LocalCG;
  else root.LocalCG = LocalCG;
})(typeof self !== "undefined" ? self : typeof globalThis !== "undefined" ? globalThis : this);
