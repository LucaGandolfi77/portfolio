/* Slot Neon — RNG seedato e utilità casuali */
(function () {
    'use strict';

    function makeRng(seed) {
        let s = (seed >>> 0) || 1;
        return function () {
            s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
            return s / 4294967296;
        };
    }

    function hashSeed(str) {
        let h = 2166136261 >>> 0;
        const v = String(str);
        for (let i = 0; i < v.length; i++) {
            h ^= v.charCodeAt(i);
            h = Math.imul(h, 16777619);
        }
        return h >>> 0;
    }

    function dailyKey(date) {
        const d = date || new Date();
        return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    }

    function dailySeed(date) { return hashSeed('slot-neon-' + dailyKey(date)); }

    function weightedPick(rng, entries) {
        let total = 0;
        for (let i = 0; i < entries.length; i++) total += (entries[i].weight || 0);
        let roll = rng() * total;
        for (let i = 0; i < entries.length; i++) {
            roll -= (entries[i].weight || 0);
            if (roll <= 0) return entries[i];
        }
        return entries[entries.length - 1];
    }

    function pick(rng, arr) { return arr[Math.floor(rng() * arr.length)]; }

    function range(rng, min, max) { return min + Math.floor(rng() * (max - min + 1)); }

    window.SlotRng = { makeRng: makeRng, hashSeed: hashSeed, dailyKey: dailyKey, dailySeed: dailySeed, weightedPick: weightedPick, pick: pick, range: range };
})();
