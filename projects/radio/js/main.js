/* Radio — bootstrap */
(function () {
    'use strict';

    function boot() {
        window.RadioStorage.load();
        const ui = window.RadioUI.init();
        window.RadioPlayer.init();

        // Primo paint immediato dal catalogo locale (anche offline)
        ui.setOffline(true);
        ui.renderStations(window.RadioStations.STATIONS.slice().sort(function (a, b) { return (b.votes || 0) - (a.votes || 0); }));

        // Poi aggiorna con l'API (con failover e fallback locale), salvo shortcut locali
        const params = new URLSearchParams(location.search);
        const shortcut = params.get('view');
        if (shortcut === 'fav') ui.showFavs();
        else if (shortcut === 'local') ui.showLocal();
        else ui.loadList('top', null, null, false).then(function () {
            const last = window.RadioStorage.settings.lastStation;
            if (last && last.url) {
                document.getElementById('pMeta').textContent = 'Ultima stazione: ' + last.name;
            }
        });

        if ('serviceWorker' in navigator && location.protocol !== 'file:') {
            window.addEventListener('load', function () {
                navigator.serviceWorker.register('./sw.js', { scope: './' }).catch(function () {});
            });
        }
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
    else boot();
})();
