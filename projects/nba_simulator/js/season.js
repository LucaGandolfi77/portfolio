/* NBA Sim — stagione e classifiche */
(function () {
    'use strict';

    function buildSchedule(keys) {
        const arr = keys.slice();
        if (arr.length % 2) arr.push(null);
        const n = arr.length;
        const rounds = [];
        for (let r = 0; r < n - 1; r++) {
            const pairs = [];
            for (let i = 0; i < n / 2; i++) {
                const a = arr[i], b = arr[n - 1 - i];
                if (a && b) pairs.push([a, b]);
            }
            arr.splice(1, 0, arr.pop());
            rounds.push(pairs);
        }
        const weeks = [];
        rounds.forEach(function (pairs, i) {
            weeks.push(pairs.map(function (p) { return i % 2 ? [p[1], p[0]] : p.slice(); }));
        });
        rounds.forEach(function (pairs, i) {
            weeks.push(pairs.map(function (p) { return i % 2 ? p.slice() : [p[1], p[0]]; }));
        });
        return weeks;
    }

    function newSeason(keys) {
        const standings = {};
        keys.forEach(function (k) { standings[k] = { team: k, w: 0, l: 0, pf: 0, pa: 0 }; });
        return { keys: keys.slice(), weeks: buildSchedule(keys), week: 0, standings: standings, results: [], champion: null };
    }

    function playWeek(season, simulate, teams) {
        if (season.week >= season.weeks.length) return [];
        const results = [];
        season.weeks[season.week].forEach(function (pair) {
            const sum = simulate(teams[pair[0]], teams[pair[1]]);
            const hs = sum.score.home, as = sum.score.away;
            season.standings[pair[0]].pf += hs; season.standings[pair[0]].pa += as;
            season.standings[pair[1]].pf += as; season.standings[pair[1]].pa += hs;
            if (hs > as) { season.standings[pair[0]].w++; season.standings[pair[1]].l++; }
            else if (as > hs) { season.standings[pair[1]].w++; season.standings[pair[0]].l++; }
            results.push({ home: pair[0], away: pair[1], hs: hs, as: as, date: Date.now() });
        });
        season.results = season.results.concat(results);
        season.week++;
        return results;
    }

    function standingsSorted(season) {
        return Object.keys(season.standings).map(function (k) {
            const s = season.standings[k];
            return Object.assign({}, s, { diff: s.pf - s.pa, pct: s.w + s.l ? s.w / (s.w + s.l) : 0 });
        }).sort(function (a, b) { return b.w - a.w || b.diff - a.diff || b.pf - a.pf; });
    }

    window.NBASeason = { buildSchedule: buildSchedule, newSeason: newSeason, playWeek: playWeek, standingsSorted: standingsSorted };
})();
