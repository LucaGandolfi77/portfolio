/* Slot Neon — modalità di gioco */
(function () {
    'use strict';

    const MODES = [
        {
            id: 'classic', name: 'Classica', icon: '🎰',
            desc: 'Gira liberamente su qualsiasi macchina sbloccata. Puntata e vincita sono quelle che conosci.',
            cost: 1, energy: 0, timer: 0, seed: false, record: 'win'
        },
        {
            id: 'daily', name: 'Sfida Giornaliera', icon: '📅',
            desc: 'Seed uguale per tutti oggi: stessi rulli, stessa fortuna. Classifica locale dedicata.',
            cost: 1, energy: 0, timer: 0, seed: true, record: 'win'
        },
        {
            id: 'story', name: 'Storia / Tour', icon: '📖',
            desc: 'Segui le Cronache della Sorte: ogni scelta sblocca una macchina e un eco.',
            cost: 0, energy: 1, timer: 0, seed: false, record: 'chapter'
        },
        {
            id: 'marathon', name: 'Free Spins Marathon', icon: '🌀',
            desc: 'Venti giri gratuiti con moltiplicatore crescente a ogni vincita.',
            cost: 0, energy: 0, timer: 0, spins: 20, multiplierStep: 0.25, record: 'win'
        },
        {
            id: 'jackpot', name: 'Jackpot Hunt', icon: '🏆',
            desc: 'Puntata doppia: chi raggiunge il jackpot in meno giri vince.',
            cost: 2, energy: 0, timer: 0, target: 'jackpot', record: 'spins'
        },
        {
            id: 'boss', name: 'Boss Battle', icon: '👾',
            desc: 'Ogni vincita infligge danno al Custode. Lui contrattacca a ogni giro perdente.',
            cost: 1, energy: 1, timer: 0, hp: 120, bossDamage: 6, record: 'damage'
        },
        {
            id: 'rush', name: 'Gacha Rush', icon: '⚡',
            desc: 'Due minuti per raccogliere più gemme ed echi possibili.',
            cost: 0, energy: 0, timer: 120, record: 'echoes'
        }
    ];

    const byId = {};
    MODES.forEach(function (m) { byId[m.id] = m; });

    window.SlotModes = {
        list: MODES,
        get: function (id) { return byId[id] || MODES[0]; },
        has: function (id) { return !!byId[id]; }
    };
})();
