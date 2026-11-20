/* NBA Sim — playoff a eliminazione diretta (best of 3) */
(function () {
    'use strict';

    const ROUND_NAMES = ['Quarti', 'Semifinali', 'Finale'];

    function createBracket(seeds, n) {
        n = n || 8;
        const teams = seeds.slice(0, n);
        const pairs = [];
        for (let i = 0; i < teams.length / 2; i++) pairs.push({ a: teams[i], b: teams[teams.length - 1 - i], wins: [0, 0], games: [], winner: null });
        return { rounds: [{ name: ROUND_NAMES[0], matchups: pairs }], round: 0, champion: null, complete: false };
    }

    function playRound(bracket, simulate, teams) {
        if (bracket.complete || bracket.round >= 3) return bracket;
        const current = bracket.rounds[bracket.round];
        current.matchups.forEach(function (m) {
            if (m.winner) return;
            let wa = 0, wb = 0;
            for (let g = 0; g < 3 && wa < 2 && wb < 2; g++) {
                const sum = simulate(teams[m.a], teams[m.b]);
                const aWon = sum.score.home > sum.score.away;
                if (aWon) wa++; else wb++;
                m.games.push({ hs: sum.score.home, as: sum.score.away, winner: aWon ? m.a : m.b });
            }
            m.wins = [wa, wb];
            m.winner = wa > wb ? m.a : m.b;
        });
        const winners = current.matchups.map(function (m) { return m.winner; });
        bracket.round++;
        if (bracket.round >= 3 || winners.length === 1) {
            bracket.champion = winners[0] || null;
            bracket.complete = true;
        } else {
            const pairs = [];
            for (let i = 0; i < winners.length / 2; i++) pairs.push({ a: winners[i], b: winners[winners.length - 1 - i], wins: [0, 0], games: [], winner: null });
            bracket.rounds.push({ name: ROUND_NAMES[Math.min(bracket.round, 2)], matchups: pairs });
        }
        return bracket;
    }

    window.NBAPlayoffs = { createBracket: createBracket, playRound: playRound };
})();
