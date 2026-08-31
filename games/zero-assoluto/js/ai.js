/* ZERO ASSOLUTO — AI del duello: Facile, Medio, Difficile.
   L'AI gioca carte-funzione sulla vita del giocatore. Rispetta il blocco del negativo:
   non gioca mai carte che porterebbero la vita sotto 0 (a meno che non azzerino esattamente). */
'use strict';

const AI = (() => {
  /* Ritorna un array di carte valide: quelle che non portano la vita sotto 0 */
  function validMoves(hand, life, maxLife) {
    return hand.filter(c => {
      if (c.type !== 'fn') return false;
      const v = c.fn(life);
      if (v === null || !Number.isFinite(v)) return false;
      return v >= 0;
    });
  }

  /* Pianifica la mossa dell'AI. Ritorna { card } da giocare (o null se nessuna valida). */
  function chooseMove(hand, life, maxLife, difficulty) {
    const moves = validMoves(hand, life, maxLife);
    if (moves.length === 0) return null;

    if (difficulty === 'facile') {
      // mossa casuale tra le valide
      return { card: moves[Math.floor(Math.random() * moves.length)] };
    }

    // medio: massimizza la riduzione (ma non azzera mai l'opportunità di finire: semplice greedy)
    if (difficulty === 'medio') {
      let best = null, bestDrop = -1;
      moves.forEach(c => {
        const v = Math.max(0, c.fn(life));
        const drop = life - v;
        if (drop > bestDrop) { bestDrop = drop; best = c; }
      });
      return { card: best };
    }

    // difficile: cerca la mossa che azzera esattamente; altrimenti la riduzione massima con preferenza
    // per le mosse che avvicinano a un valore "buono" (basso, o zero).
    if (difficulty === 'difficile') {
      // 1) azzera esattamente?
      for (const c of moves) {
        const v = c.fn(life);
        if (v === 0) return { card: c, zero: true };
      }
      // 2) altrimenti riduzione massima
      let best = null, bestScore = -1;
      moves.forEach(c => {
        const v = Math.max(0, c.fn(life));
        // premia la riduzione grande e i valori piccoli (più vicini a zero)
        const score = (life - v) + (life - v) * 0.5 + (100 - v) * 0.01;
        if (score > bestScore) { bestScore = score; best = c; }
      });
      return { card: best };
    }
    return { card: moves[0] };
  }

  return { chooseMove, validMoves };
})();
