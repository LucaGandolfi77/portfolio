/* Snake Neon — effetti sonori WebAudio sintetizzati */
(function () {
    'use strict';

    const SnakeAudio = {
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
            } catch (e) { /* audio non disponibile */ }
        },
        tone: function (freq, dur, type, gain, delay) {
            if (!this.enabled) return;
            this.init();
            if (!this.ctx) return;
            delay = delay || 0;
            const t = this.ctx.currentTime + delay;
            const o = this.ctx.createOscillator();
            const g = this.ctx.createGain();
            o.type = type || 'sine';
            o.frequency.setValueAtTime(freq, t);
            g.gain.setValueAtTime(0.0001, t);
            g.gain.exponentialRampToValueAtTime(gain || 0.05, t + 0.012);
            g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
            o.connect(g); g.connect(this.ctx.destination);
            o.start(t); o.stop(t + dur + 0.03);
        },
        sweep: function (from, to, dur, gain) {
            if (!this.enabled) return;
            this.init();
            if (!this.ctx) return;
            const t = this.ctx.currentTime;
            const o = this.ctx.createOscillator();
            const g = this.ctx.createGain();
            o.type = 'sawtooth';
            o.frequency.setValueAtTime(from, t);
            o.frequency.exponentialRampToValueAtTime(to, t + dur);
            g.gain.setValueAtTime(gain || 0.04, t);
            g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
            o.connect(g); g.connect(this.ctx.destination);
            o.start(t); o.stop(t + dur + 0.03);
        },
        eat: function (combo) {
            const base = 520 + Math.min(8, combo || 0) * 35;
            this.tone(base, 0.08, 'sine', 0.05);
            this.tone(base * 1.5, 0.1, 'sine', 0.035, 0.05);
        },
        golden: function () { [784, 988, 1318].forEach(function (f, i) { SnakeAudio.tone(f, 0.14, 'triangle', 0.05, i * 0.07); }); },
        power: function () { this.sweep(300, 900, 0.25, 0.05); },
        hit: function () { this.sweep(320, 70, 0.45, 0.07); },
        win: function () { [523, 659, 784, 1046].forEach(function (f, i) { SnakeAudio.tone(f, 0.22, 'triangle', 0.055, i * 0.11); }); },
        click: function () { this.tone(620, 0.05, 'square', 0.035); },
        pause: function () { this.tone(380, 0.09, 'sine', 0.04); }
    };

    window.SnakeAudio = SnakeAudio;
})();
