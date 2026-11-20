/* Radio — UI, liste, preferite, dock */
(function () {
    'use strict';

    const $ = function (id) { return document.getElementById(id); };
    const esc = function (s) {
        return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    };

    const RadioUI = {
        state: { listMode: 'top', currentList: [], offline: false, loading: false },
        toastTimer: null,
        deferredPrompt: null,

        init: function () {
            this.bind();
            this.renderChips();
            this.renderCountryBar();
            this.syncPlayer();
            return this;
        },

        toast: function (msg) {
            const t = $('toast');
            t.textContent = msg;
            t.classList.add('on');
            clearTimeout(this.toastTimer);
            this.toastTimer = setTimeout(function () { t.classList.remove('on'); }, 3000);
        },

        setOffline: function (offline, mirror) {
            this.state.offline = offline;
            const badge = $('offlineBadge');
            if (badge) badge.classList.toggle('hidden', !offline);
            const src = $('apiSource');
            if (src) src.textContent = offline ? 'stazioni locali' : ('mirror ' + (mirror || 'de1'));
        },

        renderStations: function (list) {
            const grid = $('stations');
            if (list) this.state.currentList = list;
            const items = this.state.currentList || [];
            if (!items.length) {
                grid.innerHTML = '<div class="state"><span class="big">📭</span>Nessuna stazione trovata.<br>Prova una ricerca diversa o usa l\'URL diretto.</div>';
                $('listCount').textContent = '';
                return;
            }
            $('listCount').textContent = items.length + ' stazioni' + (this.state.offline ? ' · offline' : '');
            const self = this;
            grid.innerHTML = '';
            const curUrl = window.RadioPlayer.station && (window.RadioPlayer.station.url_resolved || window.RadioPlayer.station.url);
            items.forEach(function (s, idx) {
                const url = s.url_resolved || s.url;
                const isActive = window.RadioPlayer.station && url === curUrl;
                const playing = isActive && window.RadioPlayer.playing;
                const card = document.createElement('div');
                card.className = 'stat-card' + (isActive ? ' active' : '');
                card.innerHTML =
                    '<div class="sc-ico"><img alt="" loading="lazy"></div>' +
                    '<div class="sc-mid"><div class="sc-name">' + esc(s.name || 'Radio') + '</div>' +
                    '<div class="sc-sub">' + (s.country ? esc(s.country) : '') + (s.bitrate ? ' <b>· ' + s.bitrate + 'k</b>' : '') +
                    (s.tags ? ' <b>· ' + esc(String(s.tags).split(',').slice(0, 2).join(', ')) + '</b>' : '') + '</div></div>' +
                    '<div class="sc-acts">' +
                    '<button class="sbtn2 play" data-i="' + idx + '" aria-label="Play">' + (playing ? '⏸' : '▶') + '</button>' +
                    '<button class="sbtn2 fav ' + (window.RadioStorage.isFav(s) ? 'on' : '') + '" data-i="' + idx + '" aria-label="Preferita">' +
                    (window.RadioStorage.isFav(s) ? '★' : '☆') + '</button></div>';
                const img = card.querySelector('img');
                img.src = window.RadioStations.faviconFor(s);
                img.onerror = function () { img.parentNode.innerHTML = '<span>' + window.RadioStations.emojiFor(s) + '</span>'; };
                card.querySelector('.sc-mid').addEventListener('click', function () {
                    if (isActive) window.RadioPlayer.toggle();
                    else if (url) window.RadioPlayer.play(s);
                });
                card.querySelector('.play').addEventListener('click', function (e) {
                    e.stopPropagation();
                    if (playing) window.RadioPlayer.tryPause(); else window.RadioPlayer.play(s);
                });
                card.querySelector('.fav').addEventListener('click', function (e) {
                    e.stopPropagation();
                    const added = window.RadioStorage.toggleFav(s);
                    self.toast(added ? '❤️ Salvata nelle preferite' : 'Rimossa dalle preferite');
                    self.refreshHeartChip();
                    self.renderStations();
                    self.syncPlayer();
                });
                grid.appendChild(card);
            });
        },

        showSkeleton: function () {
            $('stations').innerHTML = Array.from({ length: 5 }, function () {
                return '<div class="skel"><div class="s s1"></div><div style="flex:1"><div class="s s2"></div><div class="s s3"></div></div></div>';
            }).join('');
            $('listCount').textContent = 'caricamento…';
        },

        async loadList(mode, arg, chipId, showSkeleton) {
            this.state.listMode = mode;
            if (showSkeleton !== false) this.showSkeleton();
            this.chipActive(chipId || null);
            const res = await window.RadioApi.fetchList(mode, arg);
            this.setOffline(res.offline, res.mirror);
            this.renderStations(res.items);
            if (res.offline) this.toast('📡 Modalità offline — stazioni locali');
            try { localStorage.setItem('radio.lastMode', mode); } catch (e) {}
            return res.items;
        },

        renderChips: function () {
            const wrap = $('chips');
            wrap.innerHTML = '';
            const heart = document.createElement('button');
            heart.id = 'favChip';
            heart.className = 'chip';
            heart.type = 'button';
            heart.onclick = function () { RadioUI.showFavs(); };
            wrap.appendChild(heart);
            window.RadioStations.GENRES.forEach(function (g) {
                const b = document.createElement('button');
                b.className = 'chip'; b.type = 'button';
                b.textContent = g[0] + ' ' + g[1];
                b.onclick = function () { RadioUI.loadList('tag', g[1], 'g_' + g[1].replace(/\W/g, '')); };
                wrap.appendChild(b);
            });
            const local = document.createElement('button');
            local.id = 'localChip';
            local.className = 'chip';
            local.type = 'button';
            local.textContent = '📻 Stazioni locali';
            local.onclick = function () { RadioUI.showLocal(); };
            wrap.appendChild(local);
            this.refreshHeartChip();
        },

        renderCountryBar: function () {
            const bar = $('countryBar');
            bar.innerHTML = '';
            window.RadioStations.COUNTRIES.forEach(function (c) {
                const b = document.createElement('button');
                b.className = 'chip cc flag';
                b.type = 'button';
                b.title = c[1];
                b.textContent = c[0];
                b.setAttribute('aria-label', c[1]);
                b.id = 'cc_' + c[2];
                b.onclick = function () {
                    RadioUI.loadList('cc', c[2], 'cc_' + c[2]);
                    RadioUI.toast('🌍 ' + c[1]);
                };
                bar.appendChild(b);
            });
        },

        chipActive: function (id) {
            document.querySelectorAll('#chips .chip, #countryBar .chip').forEach(function (c) {
                c.classList.toggle('on', c.id === id);
            });
        },

        refreshHeartChip: function () {
            const b = $('favChip');
            if (b) b.textContent = '❤️ Preferite (' + window.RadioStorage.favs.length + ')';
        },

        showFavs: function () {
            const favs = window.RadioStorage.favStations();
            this.state.listMode = 'fav';
            this.setOffline(false);
            this.renderStations(favs);
            this.chipActive('favChip');
            if (!favs.length) this.toast('Nessuna preferita: tocca ☆ su una stazione');
        },

        showLocal: function () {
            this.state.listMode = 'local';
            this.setOffline(true);
            this.renderStations(window.RadioStations.STATIONS.slice().sort(function (a, b) { return (b.votes || 0) - (a.votes || 0); }));
            this.chipActive('localChip');
            this.toast('📻 Catalogo locale — disponibile offline');
        },

        syncPlayer: function () {
            const st = window.RadioPlayer.station;
            const playing = window.RadioPlayer.playing;
            $('playPause').textContent = playing ? '⏸' : '▶';
            $('dkPlay').textContent = playing ? '⏸' : '▶';
            $('vizStatus').textContent = playing ? 'segnale live' : (st ? 'in pausa' : 'in attesa di un segnale…');
            const eq = $('pEq');
            eq.classList.toggle('off', !st);
            eq.classList.toggle('paused', !!st && !playing);
            $('dkEq').classList.toggle('on', playing);
            const dock = $('dock');
            if (st) {
                dock.classList.add('on');
                $('dkTitle').textContent = st.name || 'Radio';
                $('dkSub').textContent = [st.country, st.language].filter(Boolean).join(' · ') || 'live';
                $('pTitle').textContent = st.name || 'Radio';
                $('pMeta').textContent = [st.country, st.language, String(st.tags || '').split(',').slice(0, 3).join(' · '), st.bitrate ? st.bitrate + 'kbps' : ''].filter(Boolean).join(' · ') || 'live';
                this.setArt(st);
                this.setDockArt(st);
                $('liveBadge').classList.remove('hidden');
            } else {
                dock.classList.remove('on');
                $('pTitle').textContent = 'Nessuna stazione in riproduzione';
                $('pMeta').textContent = 'Scegli una stazione qui sotto o usa la ricerca';
                $('pArt').querySelectorAll('img').forEach(function (i) { i.remove(); });
                $('pArtPh').style.display = 'grid';
                $('pArtPh').textContent = '📻';
                $('liveBadge').classList.add('hidden');
            }
            const fav = st && window.RadioStorage.isFav(st);
            $('favBtn').textContent = fav ? '★ Preferita' : '☆ Preferita';
            $('dkFav').textContent = fav ? '★' : '☆';
        },

        setArt: function (st) {
            const art = $('pArt');
            art.querySelectorAll('img').forEach(function (i) { i.remove(); });
            const ph = $('pArtPh');
            ph.style.display = 'grid';
            ph.textContent = window.RadioStations.emojiFor(st);
            const img = document.createElement('img');
            img.alt = '';
            img.onload = function () {
                if (window.RadioPlayer.station === st) { ph.style.display = 'none'; if (!art.querySelector('img')) art.appendChild(img); }
            };
            img.onerror = function () {};
            img.src = window.RadioStations.faviconFor(st);
        },

        setDockArt: function (st) {
            const el = $('dkIco');
            el.innerHTML = '';
            const img = document.createElement('img');
            img.alt = '';
            img.onload = function () { el.innerHTML = ''; el.appendChild(img); };
            img.onerror = function () { el.innerHTML = '<span>' + window.RadioStations.emojiFor(st) + '</span>'; };
            img.src = window.RadioStations.faviconFor(st);
            el.appendChild(img);
        },

        bind: function () {
            const self = this;
            $('searchBtn').onclick = function () { const q = $('q').value.trim(); if (q) self.loadList('search', q); };
            $('q').addEventListener('keydown', function (e) {
                if (e.key === 'Enter') { const q = $('q').value.trim(); if (q) self.loadList('search', q); }
            });
            $('topBtn').onclick = function () { self.loadList('top'); };
            $('playUrlBtn').onclick = function () {
                const u = $('urlInput').value.trim();
                if (!u) { self.toast('Incolla prima un URL di stream'); return; }
                window.RadioPlayer.play({ name: 'Stream personalizzato', url: u, url_resolved: u, favicon: '', tags: 'custom' });
            };
            $('playPause').onclick = function () { window.RadioPlayer.toggle(); };
            $('dkPlay').onclick = function () { window.RadioPlayer.toggle(); };
            $('stopBtn').onclick = function () { window.RadioPlayer.stop(); };
            $('dkStop').onclick = function () { window.RadioPlayer.stop(); };
            $('favBtn').onclick = function () { if (window.RadioPlayer.station) self.favCurrent(); };
            $('dkFav').onclick = function () { if (window.RadioPlayer.station) self.favCurrent(); };
            $('copyBtn').onclick = async function () {
                const st = window.RadioPlayer.station;
                const u = st && (st.url_resolved || st.url);
                if (!u) { self.toast('Nessuna stazione attiva'); return; }
                try { await navigator.clipboard.writeText(u); self.toast('📋 Stream copiato'); }
                catch (e) {
                    const ta = document.createElement('textarea');
                    ta.value = u; document.body.appendChild(ta); ta.select();
                    try { document.execCommand('copy'); self.toast('📋 Stream copiato'); } catch (e2) {}
                    ta.remove();
                }
            };
            const vol = $('volume');
            vol.value = window.RadioStorage.settings.volume;
            vol.oninput = function () {
                window.RadioPlayer.setVolume(parseFloat(vol.value || '0'));
                $('muteBtn').textContent = window.RadioStorage.settings.muted ? '🔇' : (parseFloat(vol.value) < .5 ? '🔉' : '🔊');
            };
            $('muteBtn').onclick = function () {
                const muted = window.RadioPlayer.toggleMute();
                $('muteBtn').textContent = muted ? '🔇' : '🔊';
            };
            $('install-btn').onclick = function () {
                if (!self.deferredPrompt) return;
                self.deferredPrompt.prompt();
                self.deferredPrompt.userChoice.then(function () { self.deferredPrompt = null; });
            };
            window.addEventListener('beforeinstallprompt', function (e) {
                e.preventDefault();
                self.deferredPrompt = e;
                $('install-btn').classList.remove('hidden');
            });
        },

        favCurrent: function () {
            const st = window.RadioPlayer.station;
            const added = window.RadioStorage.toggleFav(st);
            this.toast(added ? '❤️ Salvata nelle preferite' : 'Rimossa dalle preferite');
            this.refreshHeartChip();
            this.renderStations();
            this.syncPlayer();
        }
    };

    window.RadioUI = RadioUI;
})();
