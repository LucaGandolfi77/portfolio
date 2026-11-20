/* NBA Sim — bootstrap */
(function () {
    'use strict';

    function boot() {
        const ui = window.NBAUI.init();
        if ('serviceWorker' in navigator && location.protocol !== 'file:') {
            window.addEventListener('load', function () {
                navigator.serviceWorker.register('./sw.js', { scope: './' }).catch(function () {});
            });
        }
        const params = new URLSearchParams(location.search);
        const view = params.get('view');
        if (view && ['match', 'season', 'playoffs', 'teams', 'stats', 'history'].indexOf(view) >= 0) ui.switchView(view);
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
    else boot();
})();
