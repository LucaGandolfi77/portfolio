/* NBA Sim — statistiche avanzate */
(function () {
    'use strict';

    function efficiency(p) {
        return p.pts + p.orb + p.drb + p.ast + p.stl + p.blk - p.to - (p.fga - p.fgm) - (p.fta - p.ftm);
    }

    function teamTotals(summary, side) {
        const t = { pts: 0, fgm: 0, fga: 0, tpm: 0, tpa: 0, ftm: 0, fta: 0, reb: 0, ast: 0, stl: 0, blk: 0, to: 0, pf: 0, eff: 0 };
        Object.keys(summary.players).forEach(function (n) {
            const p = summary.players[n];
            if (p.side !== side) return;
            t.fgm += p.fgm; t.fga += p.fga; t.tpm += p.tpm; t.tpa += p.tpa;
            t.ftm += p.ftm; t.fta += p.fta; t.reb += p.orb + p.drb;
            t.ast += p.ast; t.stl += p.stl; t.blk += p.blk; t.to += p.to; t.pf += p.pf;
            t.eff += efficiency(p);
        });
        t.pts = summary.score[side];
        return t;
    }

    function pct(m, a) { return a ? Math.round(m / a * 100) : 0; }

    function comparison(summary) {
        const h = teamTotals(summary, 'home'), a = teamTotals(summary, 'away');
        return [
            { label: 'PTS', h: h.pts, a: a.pts },
            { label: 'FG%', h: pct(h.fgm, h.fga), a: pct(a.fgm, a.fga) },
            { label: '3P%', h: pct(h.tpm, h.tpa), a: pct(a.tpm, a.tpa) },
            { label: 'REB', h: h.reb, a: a.reb },
            { label: 'AST', h: h.ast, a: a.ast },
            { label: 'STL', h: h.stl, a: a.stl },
            { label: 'BLK', h: h.blk, a: a.blk },
            { label: 'EFF', h: h.eff, a: a.eff }
        ];
    }

    function shotZones(shots) {
        const zones = { restricted: { m: 0, a: 0 }, paint: { m: 0, a: 0 }, mid: { m: 0, a: 0 }, three: { m: 0, a: 0 } };
        shots.forEach(function (s) {
            const y = s.y;
            const z = y > 62 ? 'restricted' : y > 44 ? 'paint' : y > 30 ? 'mid' : 'three';
            zones[z].a++;
            if (s.made) zones[z].m++;
        });
        return zones;
    }

    function leaders(summary, n) {
        return Object.keys(summary.players).map(function (name) {
            const p = summary.players[name];
            return { name: name, side: p.side, pts: p.pts, reb: p.orb + p.drb, ast: p.ast, eff: efficiency(p) };
        }).sort(function (a, b) { return b.pts - a.pts; }).slice(0, n || 5);
    }

    window.NBAStats = { efficiency: efficiency, teamTotals: teamTotals, comparison: comparison, shotZones: shotZones, leaders: leaders, pct: pct };
})();
