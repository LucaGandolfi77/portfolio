/* Slot Neon — WebAudio */
(function () {
    'use strict';

    const SlotAudio = {
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
        spin: function () { this.tone(220, 0.08, 'square', 0.03); this.tone(330, 0.08, 'square', 0.025, 0.06); },
        stop: function (i) { this.tone(380 + i * 60, 0.06, 'triangle', 0.04); },
        win: function () { [523, 659, 784].forEach(function (f, i) { SlotAudio.tone(f, 0.12, 'sine', 0.05, i * 0.06); }); },
        bigWin: function () { [523, 659, 784, 1046, 1318].forEach(function (f, i) { SlotAudio.tone(f, 0.2, 'triangle', 0.055, i * 0.09); }); },
        pull: function () { this.tone(700, 0.07, 'sine', 0.04); this.tone(1050, 0.1, 'sine', 0.03, 0.05); },
        rare: function () { [659, 880, 1174, 1568].forEach(function (f, i) { SlotAudio.tone(f, 0.24, 'triangle', 0.055, i * 0.1); }); },
        click: function () { this.tone(600, 0.05, 'square', 0.03); },
        hit: function () { this.tone(180, 0.14, 'sawtooth', 0.05); }
    };

    window.SlotAudio = SlotAudio;
})();
