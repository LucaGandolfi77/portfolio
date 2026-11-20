/* Radio — client Radio Browser con failover multi-mirror e fallback locale */
(function () {
    'use strict';

    const MIRRORS = ['de1', 'de2', 'at1', 'fi1', 'nl1', 'de3'];
    const TIMEOUT = 6000;

    function endpoint(mode, arg) {
        const q = encodeURIComponent(arg || '');
        if (mode === 'search') return '/stations/search?name=' + q + '&hidebroken=true&order=votes&reverse=true&limit=40';
        if (mode === 'tag') return '/stations/bytag/' + q + '?hidebroken=true&order=votes&reverse=true&limit=40';
        if (mode === 'cc') return '/stations/bycountrycodeexact/' + q + '?hidebroken=true&order=votes&reverse=true&limit=40';
        return '/stations/topvote/50';
    }

    function dedupe(data) {
        const seen = {};
        const out = [];
        (Array.isArray(data) ? data : []).forEach(function (s) {
            const u = (s.url_resolved || s.url || '').trim();
            if (!u || seen[u]) return;
            seen[u] = 1;
            out.push(s);
        });
        return out;
    }

    function fetchMirror(mirror, path) {
        return new Promise(function (resolve, reject) {
            const ctrl = new AbortController();
            const timer = setTimeout(function () { ctrl.abort(); }, TIMEOUT);
            fetch('https://' + mirror + '.api.radio-browser.info/json' + path, { signal: ctrl.signal })
                .then(function (r) {
                    clearTimeout(timer);
                    if (!r.ok) throw new Error('HTTP ' + r.status);
                    return r.json();
                })
                .then(resolve)
                .catch(function (e) { clearTimeout(timer); reject(e); });
        });
    }

    async function fetchList(mode, arg) {
        const path = endpoint(mode, arg);
        for (let i = 0; i < MIRRORS.length; i++) {
            try {
                const data = await fetchMirror(MIRRORS[i], path);
                const items = dedupe(data);
                if (items.length) return { items: items, offline: false, mirror: MIRRORS[i] };
            } catch (e) { /* prova il mirror successivo */ }
        }
        return { items: window.RadioStations.localFilter(mode, arg), offline: true, mirror: null };
    }

    window.RadioApi = {
        MIRRORS: MIRRORS,
        endpoint: endpoint,
        dedupe: dedupe,
        fetchList: fetchList,
        searchName: function (q) { return fetchList('search', q); },
        byTag: function (t) { return fetchList('tag', t); },
        byCountry: function (cc) { return fetchList('cc', cc); },
        topStations: function () { return fetchList('top'); }
    };
})();
