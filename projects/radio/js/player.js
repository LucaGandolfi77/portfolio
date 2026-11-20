/* Radio — player audio, visualizer, Media Session */
(function () {
    'use strict';

    const $ = function (id) { return document.getElementById(id); };

    const RadioPlayer = {
        station: null,
        playing: false,
        cors: true,
        corsRetried: false,
        audioCtx: null,
        sourceNode: null,
        analyser: null,
        dataArr: null,
        vizActive: false,
        player: null,

        init: function () {
            this.player = $('player');
            const self = this;
            this.player.addEventListener('error', function () { self.onError(); });
            this.player.addEventListener('pause', function () { if (self.station) { self.playing = false; self.syncUI(); } });
            this.player.addEventListener('playing', function () { if (self.station) { self.playing = true; self.syncUI(); } });
            this.player.volume = window.RadioStorage.settings.volume;
            this.loop = this.loop.bind(this);
            requestAnimationFrame(this.loop);
            return this;
        },

        ensureCtx: function () {
            if (!this.audioCtx) {
                const AC = window.AudioContext || window.webkitAudioContext;
                if (!AC) return;
                this.audioCtx = new AC();
            }
            if (this.audioCtx.state === 'suspended') this.audioCtx.resume().catch(function () {});
        },

        attachGraph: function () {
            try {
                if (this.sourceNode) { try { this.sourceNode.disconnect(); } catch (e) {} this.sourceNode = null; }
                this.sourceNode = this.audioCtx.createMediaElementSource(this.player);
                this.analyser = this.audioCtx.createAnalyser();
                this.analyser.fftSize = 256;
                this.analyser.smoothingTimeConstant = .8;
                this.dataArr = new Uint8Array(this.analyser.frequencyBinCount);
                this.sourceNode.connect(this.analyser);
                this.analyser.connect(this.audioCtx.destination);
                this.vizActive = true;
            } catch (e) { this.vizActive = false; }
        },

        tryPlay: function () {
            const self = this;
            try {
                const p = this.player.play();
                if (p && p.then) p.then(function () { if (self.station) { self.playing = true; self.syncUI(); } }, function () {});
            } catch (e) {}
        },
        tryPause: function () { try { this.player.pause(); } catch (e) {} },

        play: function (st, opts) {
            opts = opts || {};
            this.ensureCtx();
            const url = (st && (st.url_resolved || st.url) || '').trim();
            if (!url) { window.RadioUI.toast('URL non valido'); return; }
            this.station = st;
            this.playing = false;
            this.cors = opts.cors !== false;
            this.corsRetried = false;
            if (this.cors && !this.analyser && this.audioCtx) this.attachGraph();
            this.player.crossOrigin = this.cors ? 'anonymous' : null;
            this.player.src = url;
            this.player.volume = window.RadioStorage.settings.muted ? 0 : window.RadioStorage.settings.volume;
            window.RadioStorage.set('lastStation', { name: st.name, url: url, favicon: st.favicon || '', tags: st.tags || '' });
            this.syncUI();
            this.tryPlay();
            this.updateMediaSession();
            window.RadioUI.renderStations();
        },

        onError: function () {
            if (!this.station) return;
            const url = (this.station.url_resolved || this.station.url || '').trim();
            if (!this.corsRetried && url) {
                this.corsRetried = true;
                this.cors = false;
                window.RadioUI.toast('Stream senza CORS: audio avviato, equalizer disattivato');
                this.player.crossOrigin = null;
                this.player.src = url;
                this.tryPlay();
            } else {
                window.RadioUI.toast('Impossibile riprodurre lo stream (offline o URL non valido)');
                this.playing = false;
                this.syncUI();
            }
        },

        toggle: function () {
            if (!this.station) { window.RadioUI.toast('Scegli prima una stazione'); return; }
            this.ensureCtx();
            if (this.player.paused) this.tryPlay(); else this.tryPause();
        },

        stop: function () {
            this.tryPause();
            this.player.removeAttribute('src');
            try { this.player.load(); } catch (e) {}
            this.playing = false;
            this.station = null;
            this.syncUI();
        },

        setVolume: function (v) {
            window.RadioStorage.set('volume', v);
            if (v > 0) window.RadioStorage.set('muted', false);
            this.player.volume = window.RadioStorage.settings.muted ? 0 : v;
        },

        toggleMute: function () {
            const s = window.RadioStorage.settings;
            s.muted = !s.muted;
            window.RadioStorage.saveSettings();
            this.player.volume = s.muted ? 0 : s.volume;
            return s.muted;
        },

        syncUI: function () { if (window.RadioUI) window.RadioUI.syncPlayer(); },

        updateMediaSession: function () {
            const st = this.station;
            if (!('mediaSession' in navigator) || !st) return;
            try {
                navigator.mediaSession.metadata = new MediaMetadata({ title: st.name || 'Radio', artist: 'Internet Radio', album: st.country || 'live' });
            } catch (e) {}
            try {
                navigator.mediaSession.setActionHandler('play', function () { RadioPlayer.tryPlay(); });
                navigator.mediaSession.setActionHandler('pause', function () { RadioPlayer.tryPause(); });
                navigator.mediaSession.setActionHandler('stop', function () { RadioPlayer.stop(); });
            } catch (e) {}
        },

        loop: function (now) {
            requestAnimationFrame(this.loop);
            this.drawViz(now);
        },

        drawViz: function (t) {
            const canvas = $('vis');
            if (!canvas) return;
            const vctx = canvas.getContext('2d');
            const w = canvas.clientWidth || 600;
            const dpr = Math.min(2, window.devicePixelRatio || 1);
            if (canvas.width !== Math.round(w * dpr)) { canvas.width = Math.round(w * dpr); canvas.height = Math.round(74 * dpr); }
            vctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            const W = w, H = 74;
            vctx.clearRect(0, 0, W, H);
            const bars = Math.floor(W / 5);
            let real = false;
            if (this.analyser && this.playing && this.cors) {
                this.analyser.getByteFrequencyData(this.dataArr);
                let sum = 0;
                for (let i = 0; i < this.dataArr.length; i++) sum += this.dataArr[i];
                real = sum > this.dataArr.length * 2;
            }
            const grad = vctx.createLinearGradient(0, 0, W, 0);
            grad.addColorStop(0, '#00e0ff'); grad.addColorStop(.55, '#8b6cff'); grad.addColorStop(1, '#ff5d9e');
            for (let i = 0; i < bars; i++) {
                let v;
                if (real) {
                    const idx = Math.floor(i / bars * this.dataArr.length * .9);
                    v = Math.pow(Math.max(0, this.dataArr[idx] / 255 - .06), .9);
                } else {
                    const phase = t / 520 + i * .18;
                    const env = this.playing ? .55 : .16;
                    v = Math.min(1, Math.abs(Math.sin(phase)) * env + (this.playing ? Math.abs(Math.sin(t / 330 + i * .4)) * .25 : 0));
                }
                const h = 4 + v * (H - 8);
                vctx.fillStyle = grad;
                vctx.globalAlpha = .35 + v * .65;
                vctx.beginPath();
                if (vctx.roundRect) vctx.roundRect(i * (W / bars) + 1, H - h, Math.max(1.5, W / bars - 2.4), h, 3);
                else vctx.rect(i * (W / bars) + 1, H - h, Math.max(1.5, W / bars - 2.4), h);
                vctx.fill();
            }
            vctx.globalAlpha = 1;
            const status = $('vizStatus');
            if (status) status.textContent = real ? 'segnale live' : (this.playing ? 'equalizer demo · segnale CORS non disponibile' : (this.station ? 'in pausa' : 'in attesa di un segnale…'));
        }
    };

    window.RadioPlayer = RadioPlayer;
})();
