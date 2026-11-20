/* Slot Neon — gacha: 48 Echi, rarità, pity, shards, upgrade */
(function () {
    'use strict';

    const RARITIES = ['N', 'R', 'SR', 'SSR', 'UR'];
    const WEIGHTS = { N: 50, R: 30, SR: 15, SSR: 4, UR: 1 };
    const SHARDS = { N: 2, R: 5, SR: 12, SSR: 40, UR: 120 };
    const POWER = { N: 1, R: 3, SR: 7, SSR: 16, UR: 35 };
    const COLOR = { N: '#94a3b8', R: '#38bdf8', SR: '#c084fc', SSR: '#fbbf24', UR: '#fb7185' };

    const NAMES = {
        fruit:   ['Ciliegina', 'Limone Solare', 'Arancia Viva', 'Fragola Dolce', 'Uva Notturna', 'Diamante Rosso', 'Sole di Frutta', 'Anima del Bosco'],
        gems:    ['Topazio Chiaro', 'Smeraldo Verde', 'Zaffiro Profondo', 'Ametista Sognante', 'Rubino Ardente', 'Prisma Stellare', 'Eco di Cristallo', 'Cuore di Gemma'],
        tarot:   ['Il Matto', 'La Luna', 'Il Sole', 'La Stella', 'La Torre', 'Il Mondo', 'Il Cartomante', 'L\'Arcano Finale'],
        casino:  ['Campanella', 'Moneta d\'Oro', 'Picca Nera', 'Fiche Rosse', 'Banconota', 'Sette Fortunato', 'Il Croupier', 'Il Re del Casinò'],
        garden:  ['Foglia Nuova', 'Fiore d\'Alba', 'Farfalla Lieve', 'Fiore di Luna', 'Fata dei Boschi', 'Unicorno Bianco', 'Il Giardiniere', 'Fior di Destino'],
        heart:   ['Scintilla', 'Cuore Puro', 'Corona d\'Oro', 'Fenice Rossa', 'Oracolo Cieco', 'Infinito', 'L\'Archivista', 'Il Cuore della Sorte']
    };
    const GLYPHS = {
        fruit: ['🍒', '🍋', '🍊', '🍓', '🍇', '💎', '🌟', '🎁'],
        gems: ['🔶', '🟩', '🔷', '🟣', '🔴', '💠', '✨', '🌌'],
        tarot: ['🃏', '🌙', '☀️', '⭐', '🗼', '🌍', '🔮', '🍀'],
        casino: ['🔔', '🪙', '♠️', '🎰', '💵', '7️⃣', '💰', '🍀'],
        garden: ['🍃', '🌸', '🦋', '🌼', '🧚', '🦄', '✨', '🌙'],
        heart: ['💫', '💖', '👑', '🔥', '🔮', '♾️', '🌟', '🎁']
    };
    const RARITY_BY_INDEX = ['N', 'N', 'R', 'R', 'SR', 'SR', 'SSR', 'UR'];

    const ECHOES = [];
    Object.keys(NAMES).forEach(function (family) {
        NAMES[family].forEach(function (name, i) {
            const rarity = RARITY_BY_INDEX[i];
            ECHOES.push({
                id: family + '-' + i,
                name: name,
                family: family,
                rarity: rarity,
                glyph: GLYPHS[family][i],
                power: POWER[rarity],
                color: COLOR[rarity],
                lore: 'Un eco del regno ' + family + ', custode di una parte della Sorte.'
            });
        });
    });

    const byId = {};
    ECHOES.forEach(function (e) { byId[e.id] = e; });

    function pool(rarity, family) {
        const all = ECHOES.filter(function (e) { return e.rarity === rarity; });
        if (!family) return all;
        const inFamily = all.filter(function (e) { return e.family === family; });
        return inFamily.length ? inFamily : all;
    }

    function rollRarity(rng, pity) {
        if (pity.pityUR >= 119) return 'UR';
        if (pity.pitySSR >= 39) return rng() < 0.18 ? 'UR' : 'SSR';
        const entries = RARITIES.map(function (r) { return { id: r, weight: WEIGHTS[r] }; });
        return window.SlotRng.weightedPick(rng, entries).id;
    }

    function pull(state, rng, count, opts) {
        opts = opts || {};
        const results = [];
        for (let i = 0; i < count; i++) {
            const rarity = rollRarity(rng, state.gacha);
            if (rarity === 'UR') { state.gacha.pityUR = 0; state.gacha.pitySSR = 0; }
            else if (rarity === 'SSR') { state.gacha.pitySSR = 0; state.gacha.pityUR++; }
            else { state.gacha.pitySSR++; state.gacha.pityUR++; }

            let chosen;
            if (opts.rateUp && rng() < 0.5) {
                const fam = pool(rarity, opts.rateUp);
                chosen = window.SlotRng.pick(rng, fam);
            } else {
                chosen = window.SlotRng.pick(rng, pool(rarity));
            }

            const owned = state.collection[chosen.id];
            let shards = 0;
            if (owned) {
                shards = SHARDS[rarity];
                state.gacha.shards += shards;
            } else {
                state.collection[chosen.id] = { count: 1, star: 1 };
            }
            state.gacha.pulls++;
            results.push({ echo: chosen, isNew: !owned, shards: shards, rarity: rarity });
        }
        return results;
    }

    function upgrade(state, echoId) {
        const entry = state.collection[echoId];
        if (!entry || entry.star >= 5) return false;
        const cost = entry.star * 25;
        if (state.gacha.shards < cost) return false;
        state.gacha.shards -= cost;
        entry.star++;
        return true;
    }

    function luckBonus(state) {
        let points = 0;
        Object.keys(state.collection).forEach(function (id) {
            const e = byId[id];
            const c = state.collection[id];
            if (e) points += POWER[e.rarity] * c.star;
        });
        return 1 + Math.min(50, points / 40) / 100;
    }

    function collectionCount(state) { return Object.keys(state.collection).length; }

    window.SlotGacha = {
        ECHOES: ECHOES, RARITIES: RARITIES, WEIGHTS: WEIGHTS, SHARDS: SHARDS, COLOR: COLOR,
        get: function (id) { return byId[id]; },
        byFamily: function (f) { return ECHOES.filter(function (e) { return e.family === f; }); },
        pull: pull, upgrade: upgrade, luckBonus: luckBonus, collectionCount: collectionCount
    };
})();
