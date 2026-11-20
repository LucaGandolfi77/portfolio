/* NBA Sim — audio WebAudio */
(function () {
    'use strict';

    const NBAAudio = {
        ctx: null,
        enabled: true,
        init: function () {
            if (!this.enabled) return;
            try {
                if (!this.ctx) {
                    const AC = window.AudioContext || window.webkitAudioContext;
                    if (AC) this.ctx = new AC();
                }
                if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
            } catch (e) {}
        },
        beep: function (freq, dur, delay, type, vol) {
            if (!this.enabled) return;
            this.init();
            if (!this.ctx) return;
            try {
                const t = this.ctx.currentTime + (delay || 0);
                const o = this.ctx.createOscillator(), g = this.ctx.createGain();
                o.type = type || 'sine'; o.frequency.value = freq;
                g.gain.setValueAtTime(0.0001, t);
                g.gain.exponentialRampToValueAtTime(vol || 0.08, t + 0.01);
                g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
                o.connect(g); g.connect(this.ctx.destination);
                o.start(t); o.stop(t + dur + 0.05);
            } catch (e) {}
        },
        three: function () { this.beep(880, .09); this.beep(1175, .12, .08); },
        dunk: function () { this.beep(180, .12, 0, 'square', .12); this.beep(320, .16, .06, 'square', .1); },
        buzzer: function () { this.beep(160, .5, 0, 'square', .14); },
        win: function () { [523, 659, 784, 1047].forEach(function (f, i) { NBAAudio.beep(f, .22, i * .14); }); },
        click: function () { this.beep(560, .05, 0, 'square', .04); }
    };

    window.NBAAudio = NBAAudio;
})();
