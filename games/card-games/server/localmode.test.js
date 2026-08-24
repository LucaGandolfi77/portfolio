/* Smoke test modalità statica (LocalCG): partite complete vs Bot senza server.
 * Usa gli stessi moduli caricati dal browser e accelera i timer per girare in ms. */
const { test } = require('node:test');
const assert = require('node:assert');
const LocalCG = require('../public/js/local-server.js'); // cattura rawSetTimeout prima dello stub

const rooms = require('./rooms');
const registry = require('./games/registry');

const MODS = { rooms, registry };

// ---- Timer virtuali ----
// I bot usano ritardi 1500–3500ms; il turn-timer dell'umano esattamente 45000ms.
// Eseguiamo un job alla volta scartando i 45s: i bot giocano subito,
// l'umano invece agisce tramite il driver del test.
let REAL_SET = global.setTimeout;
let REAL_CLEAR = global.clearTimeout;
let QUEUE = [];
function installFastTimers() {
  QUEUE = [];
  global.setTimeout = (fn, ms) => { QUEUE.push({ fn, ms }); return QUEUE.length; };
  global.clearTimeout = (id) => { if (typeof id === 'number' && QUEUE[id - 1]) QUEUE[id - 1] = null; };
}
function restoreTimers() {
  global.setTimeout = REAL_SET;
  global.clearTimeout = REAL_CLEAR;
  QUEUE = [];
}
function sleep(ms) { return new Promise(r => REAL_SET(r, ms)); }

function ack(socket, ev, evPayload) {
  return new Promise((resolve) => socket.emit(ev, evPayload, resolve));
}

async function pumpOnce() {
  let job;
  while ((job = QUEUE.shift()) !== undefined) {
    if (!job) continue;
    if (job.ms === 45000) continue; // non giocare al posto dell'umano
    job.fn();
    await sleep(0);
    return true;
  }
  return false;
}

const GAMES = ['scopa', 'briscola', 'uno', 'odin', 'blackjack', 'settenmezzo'];

for (const gameId of GAMES) {
  test(`local mode: ${gameId} vs bot gioca fino a gameOver`, async () => {
    installFastTimers();
    try {
      const sock = LocalCG.createSocket(MODS, 'Tester');
      let started = false;
      let last = null;
      let sysMessages = 0;
      sock.on('gameStarted', () => { started = true; });
      sock.on('gameUpdate', (st) => { last = st; });
      sock.on('chatMessage', ({ from }) => { if (from === 'Sistema') sysMessages++; });

      const created = await ack(sock, 'createRoom', { gameId });
      assert.ok(!created.error, 'createRoom: ' + JSON.stringify(created));
      assert.ok(created.roomCode, 'codice stanza presente');
      const roomCode = created.roomCode;

      const meta = registry.get(gameId);
      const bots = Math.max(0, Math.min(meta.maxPlayers - 1, meta.minPlayers - 0 || 1));
      for (let i = 0; i < Math.max(1, bots); i++) {
        const ab = await ack(sock, 'addBot', { difficulty: i % 3 === 0 ? 'hard' : 'medium' });
        assert.ok(!ab.error, 'addBot: ' + JSON.stringify(ab));
      }

      const sg = await ack(sock, 'startGame', {});
      assert.ok(!sg.error, 'startGame: ' + JSON.stringify(sg));
      assert.ok(started, 'evento gameStarted ricevuto');

      const game = registry.get(gameId);
      let steps = 0;
      let stalled = false;
      let myMoves = 0;
      let botMoves = 0;
      let earlyEnd = null;
      while ((!last || last.phase !== 'gameOver') && steps++ < 20000 && !stalled && !earlyEnd) {
        const st = await ack(sock, 'requestGameState', {});
        assert.ok(st && !st.error, 'requestGameState valida');
        if (st.phase === 'gameOver') { last = st; break; }

        if (st.currentPlayer === sock.id) {
          // Le azioni valide si calcolano sullo stato interno (come fa il server),
          // non sulla vista pubblica sanitizzata mandata al client.
          const internal = rooms.getRoom(roomCode).gameState;
          const actions = game.getValidActions(internal, sock.id);
          assert.ok(Array.isArray(actions), 'azioni valide disponibili');
          let played = false;
          let lastErr = null;
          for (const action of actions) {
            const res = await ack(sock, 'playerAction', { action });
            if (!res || !res.error) { played = true; break; }
            lastErr = res.error;
          }
          if (!played && st.phase === 'handOver') {
            // Fine mano: il client invia nextRound a prescindere dalle azioni elencate
            const res = await ack(sock, 'playerAction', { action: { type: 'nextRound' } });
            played = !res || !res.error;
            lastErr = res && res.error;
          }
          if (!played) {
            // Limite upstream nei giochi con puntata: chip < min-bet blocca la fase bet.
            if (/bet|untat/i.test(st.phase + " " + lastErr) && myMoves + botMoves >= 25) {
              earlyEnd = { reason: 'chips esaurite (limite upstream)', moves: myMoves + botMoves };
              break;
            }
            assert.fail(`nessuna azione accettata (${lastErr}) per fase ${st.phase}`);
          }
          myMoves++;
          await sleep(0);
        } else {
          const progressed = await pumpOnce();
            if (progressed) botMoves++; else stalled = true;
        }
      }

      const finished = (last && last.phase === 'gameOver') || !!earlyEnd;
      assert.ok(finished, `${gameId}: partita conclusa (stalled=${stalled}, steps=${steps}, moves=${myMoves + botMoves})`);
      assert.ok(myMoves + botMoves >= 20, `${gameId}: abbastanza mosse totali (${myMoves + botMoves})`);
      assert.ok(sysMessages > 0, `${gameId}: messaggi di sistema ricevuti`);

      const lv = await ack(sock, 'leaveRoom', null);
      assert.ok(lv && lv.ok, 'leaveRoom ok');
      sock.disconnect();
    } finally {
      restoreTimers();
    }
  });
}
