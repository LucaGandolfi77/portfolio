/* Slot Neon — salvataggio versionato */
(function () {
    'use strict';

    const KEY = 'slot.neon.v1';

    function defaults() {
        return {
            version: 1,
            settings: { sound: true, lang: 'it', reducedFx: false },
            player: {
                credits: 1000, gems: 120, energy: 5, level: 1, xp: 0,
                affinity: { ordine: 0, caos: 0, equilibrio: 0 }
            },
            collection: {},
            gacha: { pitySSR: 0, pityUR: 0, pulls: 0, shards: 0, rateUp: 'fruit' },
            progress: { chapter: 0, completed: [], machines: ['fruit'] },
            quests: { lastLogin: '', dailySpins: 0, dailyPulls: 0, claimed: [] },
            records: {},
            stats: { spins: 0, wins: 0, totalWin: 0, biggestWin: 0, jackpots: 0 }
        };
    }

    const SlotStorage = {
        data: defaults(),
        load: function () {
            try {
                const raw = JSON.parse(localStorage.getItem(KEY));
                if (raw && raw.version === 1) {
                    const d = defaults();
                    this.data = {
                        version: 1,
                        settings: Object.assign(d.settings, raw.settings || {}),
                        player: Object.assign(d.player, raw.player || {}, { affinity: Object.assign(d.player.affinity, (raw.player || {}).affinity || {}) }),
                        collection: raw.collection || {},
                        gacha: Object.assign(d.gacha, raw.gacha || {}),
                        progress: Object.assign(d.progress, raw.progress || {}),
                        quests: Object.assign(d.quests, raw.quests || {}),
                        records: raw.records || {},
                        stats: Object.assign(d.stats, raw.stats || {})
                    };
                }
            } catch (e) { this.data = defaults(); }
            return this.data;
        },
        save: function () {
            try { localStorage.setItem(KEY, JSON.stringify(this.data)); } catch (e) {}
        },
        reset: function () { this.data = defaults(); this.save(); },
        addCredits: function (n) { this.data.player.credits += n; this.save(); },
        addGems: function (n) { this.data.player.gems += n; this.save(); },
        addEnergy: function (n) { this.data.player.energy += n; this.save(); },
        addXp: function (n) {
            this.data.player.xp += n;
            const before = this.data.player.level;
            this.data.player.level = Math.floor(this.data.player.xp / 200) + 1;
            this.save();
            return this.data.player.level > before;
        },
        level: function () { return this.data.player.level; },
        unlockMachine: function (id) {
            if (this.data.progress.machines.indexOf(id) < 0) { this.data.progress.machines.push(id); this.save(); return true; }
            return false;
        },
        pushRecord: function (key, entry) {
            const list = this.data.records[key] || [];
            list.push(entry);
            list.sort(function (a, b) { return (b.score || 0) - (a.score || 0); });
            this.data.records[key] = list.slice(0, 10);
            this.save();
        },
        records: function (key) { return this.data.records[key] || []; },
        dailyLogin: function () {
            const key = window.SlotRng.dailyKey();
            if (this.data.quests.lastLogin === key) return null;
            this.data.quests.lastLogin = key;
            this.data.quests.dailySpins = 0;
            this.data.quests.dailyPulls = 0;
            this.data.player.gems += 20;
            this.data.player.credits += 100;
            this.save();
            return { gems: 20, credits: 100 };
        },
        set: function (key, value) { this.data.settings[key] = value; this.save(); }
    };

    window.SlotStorage = SlotStorage;
})();
