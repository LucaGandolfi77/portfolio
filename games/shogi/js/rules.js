/* Motore regole dello shogi: mosse legali, scacco, promozioni, drop. */

import { BOARD, SENTE, GOTE, HAND_ORDER } from './config.js';

export function cloneBoard(board) {
  return board.map(row => row.map(p => p ? { ...p } : null));
}

function forwardFor(owner) { return owner === SENTE ? -1 : 1; }
function inBounds(x, y) { return x >= 0 && x < BOARD && y >= 0 && y < BOARD; }
function inPromotionZone(y, owner) { return owner === SENTE ? y <= 2 : y >= 6; }

const GOLD = f => [
  { dx: 0, dy: f }, { dx: 1, dy: f }, { dx: -1, dy: f },
  { dx: 1, dy: 0 }, { dx: -1, dy: 0 }, { dx: 0, dy: -f }
];

/** Mosse pseudo-legali di un pezzo, in coordinate non ruotate. */
export function getPieceMoves(piece) {
  const f = forwardFor(piece.owner);
  if (piece.promoted) {
    if (['S', 'N', 'L', 'P'].includes(piece.type)) return GOLD(f).map(m => ({ ...m, slide: false }));
    if (piece.type === 'R') {
      return [
        { dx: 0, dy: 1, slide: true }, { dx: 0, dy: -1, slide: true },
        { dx: 1, dy: 0, slide: true }, { dx: -1, dy: 0, slide: true },
        { dx: 1, dy: 1 }, { dx: 1, dy: -1 }, { dx: -1, dy: 1 }, { dx: -1, dy: -1 }
      ].map(m => ({ ...m, slide: !!m.slide }));
    }
    if (piece.type === 'B') {
      return [
        { dx: 1, dy: 1, slide: true }, { dx: 1, dy: -1, slide: true },
        { dx: -1, dy: 1, slide: true }, { dx: -1, dy: -1, slide: true },
        { dx: 0, dy: 1 }, { dx: 0, dy: -1 }, { dx: 1, dy: 0 }, { dx: -1, dy: 0 }
      ].map(m => ({ ...m, slide: !!m.slide }));
    }
  }
  switch (piece.type) {
    case 'K': return [
      [0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]
    ].map(([dx, dy]) => ({ dx, dy, slide: false }));
    case 'R': return [
      { dx: 0, dy: 1, slide: true }, { dx: 0, dy: -1, slide: true },
      { dx: 1, dy: 0, slide: true }, { dx: -1, dy: 0, slide: true }
    ];
    case 'B': return [
      { dx: 1, dy: 1, slide: true }, { dx: 1, dy: -1, slide: true },
      { dx: -1, dy: 1, slide: true }, { dx: -1, dy: -1, slide: true }
    ];
    case 'G': return GOLD(f).map(m => ({ ...m, slide: false }));
    case 'S': return [
      { dx: 0, dy: f }, { dx: 1, dy: f }, { dx: -1, dy: f },
      { dx: 1, dy: -f }, { dx: -1, dy: -f }
    ].map(m => ({ ...m, slide: false }));
    case 'N': return [{ dx: 1, dy: 2 * f }, { dx: -1, dy: 2 * f }].map(m => ({ ...m, slide: false }));
    case 'L': return [{ dx: 0, dy: f, slide: true }];
    case 'P': return [{ dx: 0, dy: f, slide: false }];
    default: return [];
  }
}

function canPromote(piece, toY) {
  if (piece.promoted) return false;
  if (piece.type === 'K' || piece.type === 'G') return false;
  return inPromotionZone(toY, piece.owner);
}

function mustPromote(piece, toY) {
  if (piece.promoted || !canPromote(piece, toY)) return false;
  const last = piece.owner === SENTE ? 0 : BOARD - 1;
  if (piece.type === 'P' || piece.type === 'L') return toY === last;
  if (piece.type === 'N') return piece.owner === SENTE ? toY <= 1 : toY >= 7;
  return false;
}

export function hasPawnOnFile(board, x, owner) {
  for (let y = 0; y < BOARD; y++) {
    const p = board[y][x];
    if (p && p.owner === owner && p.type === 'P' && !p.promoted) return true;
  }
  return false;
}

/** Applica una mossa mutando board/hands. Restituisce un record per annullarla. */
export function applyMove(board, hands, move) {
  const undo = {};
  if (move.drop) {
    const idx = hands[move.turn].indexOf(move.piece);
    undo.handIndex = idx;
    if (idx >= 0) hands[move.turn].splice(idx, 1);
    undo.captured = board[move.to.y][move.to.x] || null;
    board[move.to.y][move.to.x] = { type: move.piece, owner: move.turn, promoted: false };
  } else {
    const piece = board[move.from.y][move.from.x];
    undo.piece = piece;
    undo.promotedBefore = piece.promoted;
    undo.captured = board[move.to.y][move.to.x] || null;
    if (undo.captured) hands[move.turn].push(undo.captured.type);
    board[move.to.y][move.to.x] = piece;
    board[move.from.y][move.from.x] = null;
    if (move.promote) piece.promoted = true;
  }
  return undo;
}

export function undoMove(board, hands, move, undo) {
  if (!undo) return;
  if (move.drop) {
    board[move.to.y][move.to.x] = undo.captured || null;
    if (undo.handIndex >= 0) hands[move.turn].splice(undo.handIndex, 0, move.piece);
  } else {
    board[move.from.y][move.from.x] = undo.piece;
    undo.piece.promoted = undo.promotedBefore;
    if (undo.captured) {
      const idx = hands[move.turn].lastIndexOf(undo.captured.type);
      if (idx >= 0) hands[move.turn].splice(idx, 1);
      board[move.to.y][move.to.x] = undo.captured;
    } else {
      board[move.to.y][move.to.x] = null;
    }
  }
}

/** Vero se il re del giocatore è attaccato. */
export function isInCheck(board, owner) {
  let king = null;
  for (let y = 0; y < BOARD && !king; y++) {
    for (let x = 0; x < BOARD; x++) {
      const p = board[y][x];
      if (p && p.type === 'K' && p.owner === owner) { king = { x, y }; break; }
    }
  }
  if (!king) return false;

  for (let y = 0; y < BOARD; y++) {
    for (let x = 0; x < BOARD; x++) {
      const p = board[y][x];
      if (!p || p.owner === owner) continue;
      for (const m of getPieceMoves(p)) {
        let tx = x + m.dx;
        let ty = y + m.dy;
        if (m.slide) {
          while (inBounds(tx, ty)) {
            if (tx === king.x && ty === king.y) return true;
            if (board[ty][tx]) break;
            tx += m.dx; ty += m.dy;
          }
        } else if (inBounds(tx, ty) && tx === king.x && ty === king.y) {
          return true;
        }
      }
    }
  }
  return false;
}

/** Tutte le mosse pseudo-legali, comprese le varianti di promozione. */
export function pseudoMoves(board, hands, owner) {
  const moves = [];
  for (let y = 0; y < BOARD; y++) {
    for (let x = 0; x < BOARD; x++) {
      const piece = board[y][x];
      if (!piece || piece.owner !== owner) continue;
      for (const m of getPieceMoves(piece)) {
        let tx = x + m.dx;
        let ty = y + m.dy;
        if (m.slide) {
          while (inBounds(tx, ty)) {
            const target = board[ty][tx];
            if (!target) {
              addMove(moves, x, y, tx, ty, piece, false);
            } else {
              if (target.owner !== owner) addMove(moves, x, y, tx, ty, piece, true);
              break;
            }
            tx += m.dx; ty += m.dy;
          }
        } else if (inBounds(tx, ty)) {
          const target = board[ty][tx];
          if (!target || target.owner !== owner) addMove(moves, x, y, tx, ty, piece, !!target);
        }
      }
    }
  }

  const hand = hands[owner] || [];
  HAND_ORDER.forEach(type => {
    if (!hand.includes(type)) return;
    for (let y = 0; y < BOARD; y++) {
      for (let x = 0; x < BOARD; x++) {
        if (board[y][x]) continue;
        if (type === 'P') {
          if (hasPawnOnFile(board, x, owner)) continue;
          if (y === (owner === SENTE ? 0 : BOARD - 1)) continue;
        }
        if (type === 'L' && y === (owner === SENTE ? 0 : BOARD - 1)) continue;
        if (type === 'N') {
          if (owner === SENTE ? y <= 1 : y >= 7) continue;
        }
        moves.push({ turn: owner, drop: true, piece: type, to: { x, y }, promote: false, captured: null });
      }
    }
  });
  return moves;
}

function addMove(list, fromX, fromY, toX, toY, piece, captured) {
  const promote = canPromote(piece, toY);
  const forced = mustPromote(piece, toY);
  const base = {
    turn: piece.owner, drop: false, piece: piece.type,
    from: { x: fromX, y: fromY }, to: { x: toX, y: toY }, captured
  };
  if (forced) {
    list.push({ ...base, promote: true });
  } else if (promote) {
    list.push({ ...base, promote: true });
    list.push({ ...base, promote: false });
  } else {
    list.push({ ...base, promote: false });
  }
}

/** Filtra le mosse illegali (auto-scacco e uchifuzume). */
export function legalMoves(board, hands, owner, options) {
  const opts = options || {};
  const result = [];
  for (const move of pseudoMoves(board, hands, owner)) {
    const undo = applyMove(board, hands, move);
    let legal = !isInCheck(board, owner);
    if (legal && move.drop && move.piece === 'P' && opts.checkDropMate !== false) {
      const opponent = owner === SENTE ? GOTE : SENTE;
      if (isInCheck(board, opponent) && legalMoves(board, hands, opponent, { checkDropMate: false }).length === 0) {
        legal = false;
      }
    }
    undoMove(board, hands, move, undo);
    if (legal) result.push(move);
  }
  return result;
}

export function hasAnyLegalMove(board, hands, owner) {
  return legalMoves(board, hands, owner, { checkDropMate: false }).length > 0;
}

export function isCheckmate(board, hands, owner) {
  return isInCheck(board, owner) && !hasAnyLegalMove(board, hands, owner);
}

export function isStalemate(board, hands, owner) {
  return !isInCheck(board, owner) && !hasAnyLegalMove(board, hands, owner);
}

export function positionHash(board, hands, turn) {
  let s = String(turn);
  for (let y = 0; y < BOARD; y++) {
    for (let x = 0; x < BOARD; x++) {
      const p = board[y][x];
      s += p ? p.type + (p.promoted ? '+' : '') + p.owner : '.';
    }
  }
  s += '|' + hands.map(h => h.slice().sort().join('')).join('|');
  return s;
}

export function pieceLabel(piece) {
  if (!piece) return '';
  return piece.promoted ? '成' + piece.type : piece.type;
}
