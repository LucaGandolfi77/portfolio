/* AI: minimax con alpha-beta, iterative deepening e valutazione posizionale. */

import { BOARD, SENTE, GOTE, PIECE_VALUES, LEVELS } from './config.js';
import { legalMoves, applyMove, undoMove, isInCheck } from './rules.js';

const MATE = 1000000;

function other(side) { return side === SENTE ? GOTE : SENTE; }

function materialValue(piece) {
  const key = piece.promoted ? piece.type + 'p' : piece.type;
  return PIECE_VALUES[key] || PIECE_VALUES[piece.type] || 0;
}

function evaluate(board, hands, side) {
  let score = 0;
  let kingPos = [null, null];

  for (let y = 0; y < BOARD; y++) {
    for (let x = 0; x < BOARD; x++) {
      const p = board[y][x];
      if (!p) continue;
      const sign = p.owner === SENTE ? 1 : -1;
      if (p.type === 'K') kingPos[p.owner] = { x, y };
      let value = materialValue(p);
      const central = 3 - Math.abs(4 - x);
      value += central * 4;
      const advance = p.owner === SENTE ? (8 - y) : y;
      if (p.type === 'P' || p.type === 'L' || p.type === 'N') value += advance * 3;
      if (p.promoted) value += 25;
      score += sign * value;
    }
  }

  for (let player = 0; player < 2; player++) {
    const sign = player === SENTE ? 1 : -1;
    (hands[player] || []).forEach(type => {
      score += sign * (PIECE_VALUES[type] || 0) * 1.08;
    });
  }

  for (let player = 0; player < 2; player++) {
    const king = kingPos[player];
    if (!king) continue;
    let defenders = 0;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (!dx && !dy) continue;
        const x = king.x + dx;
        const y = king.y + dy;
        if (x < 0 || x >= BOARD || y < 0 || y >= BOARD) continue;
        const p = board[y][x];
        if (p && p.owner === player) defenders++;
      }
    }
    score += (player === SENTE ? 1 : -1) * defenders * 9;
  }

  if (isInCheck(board, side)) score -= 40;
  if (isInCheck(board, other(side))) score += 40;
  return side === SENTE ? score : -score;
}

function orderMoves(moves, board) {
  return moves.map(move => {
    let score = 0;
    if (move.captured) score += 1000 + (PIECE_VALUES[move.captured] || 0);
    if (move.promote) score += 380;
    if (move.drop) score -= 90;
    return { move, score };
  }).sort((a, b) => b.score - a.score).map(x => x.move);
}

function negamax(board, hands, side, depth, alpha, beta, ply, ctx) {
  ctx.nodes++;
  if ((ctx.nodes & 511) === 0 && now() > ctx.deadline) ctx.aborted = true;
  if (ctx.aborted) return evaluate(board, hands, side);

  const moves = legalMoves(board, hands, side, { checkDropMate: false });
  if (!moves.length) return -MATE + ply;
  if (depth <= 0) return evaluate(board, hands, side);

  let best = -Infinity;
  for (const move of orderMoves(moves, board)) {
    const undo = applyMove(board, hands, move);
    const score = -negamax(board, hands, other(side), depth - 1, -beta, -alpha, ply + 1, ctx);
    undoMove(board, hands, move, undo);
    if (score > best) best = score;
    if (best > alpha) alpha = best;
    if (alpha >= beta) break;
    if (ctx.aborted) break;
  }
  return best;
}

function now() {
  return (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
}

/** Sceglie la mossa migliore. Restituisce {move, score, nodes, depth}. */
export function chooseMove(board, hands, side, levelId, options) {
  const opts = options || {};
  const level = LEVELS.find(l => l.id === levelId) || LEVELS[1];
  const maxDepth = Math.max(1, opts.depth || level.depth);
  const budget = opts.budget || (maxDepth >= 4 ? 1600 : 900);
  const ctx = { nodes: 0, deadline: now() + budget, aborted: false };

  const rootMoves = orderMoves(legalMoves(board, hands, side, { checkDropMate: false }), board);
  if (!rootMoves.length) return { move: null, score: -MATE, nodes: 0, depth: 0 };

  let bestMove = rootMoves[0];
  let bestScore = -Infinity;
  let reachedDepth = 0;

  for (let depth = 1; depth <= maxDepth; depth++) {
    let localBest = null;
    let localScore = -Infinity;
    for (const move of rootMoves) {
      const undo = applyMove(board, hands, move);
      const score = -negamax(board, hands, other(side), depth - 1, -Infinity, Infinity, 1, ctx);
      undoMove(board, hands, move, undo);
      if (score > localScore) { localScore = score; localBest = move; }
      if (ctx.aborted) break;
    }
    if (ctx.aborted && !localBest) break;
    if (localBest) { bestMove = localBest; bestScore = localScore; reachedDepth = depth; }
    if (ctx.aborted) break;
  }

  let chosen = bestMove;
  if (level.id === 'beginner') {
    const pool = rootMoves.slice(0, Math.min(3, rootMoves.length));
    if (Math.random() < 0.45 && pool.length) chosen = pool[Math.floor(Math.random() * pool.length)];
  }
  return { move: chosen, score: bestScore, nodes: ctx.nodes, depth: reachedDepth };
}
