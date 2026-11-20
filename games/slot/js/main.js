/* Slot Neon — bootstrap */
(function () {
    'use strict';

    function boot() {
        const ui = window.SlotUI.init();
        const lang = window.SlotStorage.data.settings.lang || 'it';
        fetch('../../i18n/' + lang + '.json').then(function (r) {
            return r.ok ? r.json() : null;
        }).then(function (data) {
            if (data) { window.translations = data; ui.applyLang(); }
        }).catch(function () {});

        if ('serviceWorker' in navigator && location.protocol !== 'file:') {
            window.addEventListener('load', function () {
                navigator.serviceWorker.register('./sw.js', { scope: './' }).catch(function () {});
            });
        }

        const params = new URLSearchParams(location.search);
        const mode = params.get('mode');
        if (params.get('daily') === '1') ui.startMode('daily');
        else if (params.get('gacha') === '1') ui.switchView('gacha');
        else if (params.get('story') === '1') ui.switchView('story');
        else if (mode && window.SlotModes.has(mode)) ui.startMode(mode);
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
    else boot();
})();
