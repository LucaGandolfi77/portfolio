/* Notazione kifu e codifica compatta per URL/condivisione */

import { PIECES, SENTE } from './config.js';

const DIGITS = '０１２３４５６７８９';
const PIECE_CODES = 'KRBGSNLP';

function full(n) { return DIGITS[n] || String(n); }

/** Rappresentazione leggibile di una mossa, es. ☗７六歩(７七) */
export function formatMove(move, number) {
  const sente = move.turn === SENTE;
  const fx = sente ? 9 - move.to.x : move.to.x + 1;
  const fy = sente ? 9 - move.to.y : move.to.y + 1;
  const piece = PIECES[move.piece] ? PIECES[move.piece].kanji : move.piece;
  let text = (sente ? '☗' : '☖') + full(fx) + full(fy) + piece;
  if (move.drop) text += '打';
  else text += '(' + full(sente ? 9 - move.from.x : move.from.x + 1) + full(sente ? 9 - move.from.y : move.from.y + 1) + ')';
  if (move.promote) text += '成';
  if (number) text = String(number).padStart(3, ' ') + '. ' + text;
  return text;
}

export function encodeKifu(moves) {
  return moves.map(move => {
    const code = PIECE_CODES.indexOf(move.piece);
    if (move.drop) return 'd' + code + move.to.x + move.to.y;
    return 'm' + move.from.x + move.from.y + move.to.x + move.to.y + (move.promote ? 1 : 0) + code;
  }).join('.');
}

export function decodeKifu(text) {
  if (!text) return [];
  const moves = [];
  for (const chunk of text.split('.')) {
    if (!chunk) continue;
    const turn = moves.length % 2;
    if (chunk[0] === 'd') {
      const piece = PIECE_CODES[Number(chunk[1])];
      moves.push({ turn, drop: true, piece, to: { x: Number(chunk[2]), y: Number(chunk[3]) }, promote: false });
    } else if (chunk[0] === 'm') {
      const from = { x: Number(chunk[1]), y: Number(chunk[2]) };
      const to = { x: Number(chunk[3]), y: Number(chunk[4]) };
      const promote = chunk[5] === '1';
      const piece = PIECE_CODES[Number(chunk[6])] || 'P';
      moves.push({ turn, drop: false, piece, from, to, promote });
    }
  }
  return moves;
}

export function kifuToText(moves) {
  return moves.map((m, i) => formatMove(m, i + 1)).join('\n');
}
