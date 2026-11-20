/* Snake Neon — persistenza, progressi e classifica */
(function () {
    'use strict';

    const KEY = 'snake.neon.v1';

    function defaults() {
        return {
            settings: { sound: true, lang: 'it', skin: 'neon', reducedFx: false },
            stats: { games: 0, totalFood: 0, xp: 0, bestByMode: {} },
            achievements: {},
            leaderboard: {},
            unlockedSkins: ['neon']
        };
    }

    const SKINS = {
        neon:     { name: 'Neon', body: '#00ff88', head: '#aaffdd', glow: '#00ff88' },
        ice:      { name: 'Ghiaccio', body: '#38bdf8', head: '#cffafe', glow: '#38bdf8' },
        ember:    { name: 'Braci', body: '#fb7185', head: '#ffe4e6', glow: '#fb7185' },
        gold:     { name: 'Oro', body: '#facc15', head: '#fff7c2', glow: '#facc15' },
        violet:   { name: 'Viola', body: '#c084fc', head: '#f3e8ff', glow: '#c084fc' }
    };

    const ACHIEVEMENTS = {
        first:    { name: 'Primo pasto', desc: 'Mangia il primo cibo', icon: '🍎' },
        fifty:    { name: 'Cinquanta', desc: 'Raggiungi 50 punti in una partita', icon: '🎯' },
        hundred:  { name: 'Cento!', desc: 'Raggiungi 100 punti in una partita', icon: '🏆' },
        combo:    { name: 'Combo x5', desc: 'Mangia 5 cibi di fila', icon: '🔥' },
        power:    { name: 'Collezionista', desc: 'Raccogli 10 power-up', icon: '🎁' },
        battle:   { name: 'Dominatore', desc: 'Vinci una partita Battle', icon: '⚔️' },
        puzzle:   { name: 'Navigator', desc: 'Completa un livello Ostacoli', icon: '🧩' },
        daily:    { name: 'Costanza', desc: 'Gioca 3 sfide giornaliere', icon: '📅' }
    };

    const SnakeStorage = {
        SKINS: SKINS,
        ACHIEVEMENTS: ACHIEVEMENTS,
        data: defaults(),

        load: function () {
            try {
                const raw = JSON.parse(localStorage.getItem(KEY));
                if (raw && typeof raw === 'object') {
                    const d = defaults();
                    this.data = {
                        settings: Object.assign(d.settings, raw.settings || {}),
                        stats: Object.assign(d.stats, raw.stats || {}),
                        achievements: Object.assign(d.achievements, raw.achievements || {}),
                        leaderboard: Object.assign(d.leaderboard, raw.leaderboard || {}),
                        unlockedSkins: Array.isArray(raw.unlockedSkins) ? raw.unlockedSkins : d.unlockedSkins
                    };
                    if (!SKINS[this.data.settings.skin]) this.data.settings.skin = 'neon';
                }
            } catch (e) { this.data = defaults(); }
            return this.data;
        },
        save: function () {
            try { localStorage.setItem(KEY, JSON.stringify(this.data)); } catch (e) {}
        },
        set: function (key, value) { this.data.settings[key] = value; this.save(); },
        best: function (modeId) { return this.data.stats.bestByMode[modeId] || 0; },
        setBest: function (modeId, score) {
            if (score > this.best(modeId)) { this.data.stats.bestByMode[modeId] = score; this.save(); return true; }
            return false;
        },
        addFood: function (n) { this.data.stats.totalFood += n; this.save(); },
        addXp: function (n) {
            this.data.stats.xp += n;
            this.save();
            return Math.floor(this.data.stats.xp / 100) + 1;
        },
        level: function () { return Math.floor(this.data.stats.xp / 100) + 1; },
        unlock: function (id) {
            if (!ACHIEVEMENTS[id] || this.data.achievements[id]) return null;
            this.data.achievements[id] = Date.now();
            this.save();
            return ACHIEVEMENTS[id];
        },
        has: function (id) { return !!this.data.achievements[id]; },
        addLeaderboard: function (key, entry) {
            const list = this.data.leaderboard[key] || [];
            list.push(entry);
            list.sort(function (a, b) { return b.score - a.score; });
            this.data.leaderboard[key] = list.slice(0, 10);
            this.save();
        },
        leaderboard: function (key) { return this.data.leaderboard[key] || []; },
        dailyKey: function (date) {
            const d = date || new Date();
            return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
        }
    };

    window.SnakeStorage = SnakeStorage;
})();
