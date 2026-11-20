/* Radio — preferite e impostazioni */
(function () {
    'use strict';

    const FAV_KEY = 'radio.favs';
    const SET_KEY = 'radio.settings.v1';

    function defaults() {
        return { volume: 1, muted: false, mirror: 'de1', lastStation: null, lastMode: 'top' };
    }

    const RadioStorage = {
        favs: [],
        settings: defaults(),

        load: function () {
            try { this.favs = JSON.parse(localStorage.getItem(FAV_KEY) || '[]') || []; }
            catch (e) { this.favs = []; }
            try { this.settings = Object.assign(defaults(), JSON.parse(localStorage.getItem(SET_KEY) || '{}')); }
            catch (e) { this.settings = defaults(); }
            return this;
        },
        saveFavs: function () { try { localStorage.setItem(FAV_KEY, JSON.stringify(this.favs)); } catch (e) {} },
        saveSettings: function () { try { localStorage.setItem(SET_KEY, JSON.stringify(this.settings)); } catch (e) {} },
        set: function (k, v) { this.settings[k] = v; this.saveSettings(); },
        favKey: function (st) { return (st && (st.url_resolved || st.url)) || ''; },
        isFav: function (st) {
            const k = this.favKey(st);
            return this.favs.some(function (f) { return f.url === k; });
        },
        toggleFav: function (st) {
            const k = this.favKey(st);
            const i = this.favs.findIndex(function (f) { return f.url === k; });
            if (i >= 0) { this.favs.splice(i, 1); this.saveFavs(); return false; }
            this.favs.push({
                name: st.name || 'Radio', url: k, favicon: st.favicon || '',
                homepage: st.homepage || '', tags: st.tags || '', country: st.country || '',
                countrycode: st.countrycode || '', language: st.language || ''
            });
            if (this.favs.length > 80) this.favs.shift();
            this.saveFavs();
            return true;
        },
        favStations: function () {
            return this.favs.map(function (f) {
                return { name: f.name, url: f.url, url_resolved: f.url, favicon: f.favicon, tags: f.tags, country: f.country, countrycode: f.countrycode };
            });
        }
    };

    window.RadioStorage = RadioStorage;
})();
