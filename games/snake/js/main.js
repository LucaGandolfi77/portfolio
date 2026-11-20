/* Snake Neon — bootstrap */
(function () {
    'use strict';

    function boot() {
        const S = window.SnakeStorage;
        S.load();

        const game = new window.SnakeEngine.SnakeGame({});
        const events = window.SnakeEvents;
        game.events = events;

        const ui = window.SnakeUI.init(game, events);
        game.hooks = ui.hooks();

        // Traduzioni condivise del portfolio (se presenti): sovrascrivono il dizionario interno.
        const lang = S.data.settings.lang || 'it';
        fetch('../../i18n/' + lang + '.json').then(function (r) {
            if (r.ok) return r.json();
            return null;
        }).then(function (data) {
            if (data) { window.translations = data; ui.applyLang(); }
        }).catch(function () { /* dizionario interno già sufficiente */ });

        // Service worker della PWA
        if ('serviceWorker' in navigator && location.protocol !== 'file:') {
            window.addEventListener('load', function () {
                navigator.serviceWorker.register('./sw.js', { scope: './' }).catch(function () {});
            });
        }

        // Avvio rapido via URL: ?mode=classic | ?daily=1
        const params = new URLSearchParams(location.search);
        const mode = params.get('mode');
        const daily = params.get('daily') === '1';
        if (daily) {
            const key = S.dailyKey();
            ui.start('classic', { daily: true, seed: window.SnakeEngine.hashSeed('snake-' + key) });
        } else if (mode && window.SnakeModes.has(mode)) {
            ui.start(mode);
        } else {
            ui.openModal('menu-modal');
        }
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
    else boot();
})();
