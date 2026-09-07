// sounds.js — Web Audio API effetti sonori
window.Sounds = (() => {
  let enabled = true;
  let ctx;

  function getCtx() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    return ctx;
  }

  function play(type) {
    if (!enabled) return;
    try {
      const c = getCtx();
      if (c.state === 'suspended') c.resume();
      const now = c.currentTime;
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.connect(gain);
      gain.connect(c.destination);
      gain.gain.setValueAtTime(0.15, now);

      switch (type) {
        case 'click':
          osc.frequency.setValueAtTime(800, now);
          osc.frequency.exponentialRampToValueAtTime(400, now + 0.08);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
          osc.start(now); osc.stop(now + 0.08); break;
        case 'coin':
          osc.frequency.setValueAtTime(1200, now);
          osc.frequency.setValueAtTime(1600, now + 0.05);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
          osc.start(now); osc.stop(now + 0.12); break;
        case 'correct':
          osc.frequency.setValueAtTime(523, now);
          osc.frequency.setValueAtTime(659, now + 0.1);
          osc.frequency.setValueAtTime(784, now + 0.2);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
          osc.start(now); osc.stop(now + 0.3); break;
        case 'wrong':
          osc.frequency.setValueAtTime(200, now);
          osc.frequency.setValueAtTime(150, now + 0.15);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
          osc.start(now); osc.stop(now + 0.25); break;
        case 'vote':
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(440, now);
          osc.frequency.setValueAtTime(880, now + 0.1);
          osc.frequency.setValueAtTime(1320, now + 0.2);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
          osc.start(now); osc.stop(now + 0.35); break;
        case 'election':
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(440, now);
          osc.frequency.setValueAtTime(554, now + 0.15);
          osc.frequency.setValueAtTime(659, now + 0.3);
          osc.frequency.setValueAtTime(880, now + 0.45);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
          osc.start(now); osc.stop(now + 0.6); break;
        case 'levelup':
          osc.type = 'triangle';
          [523, 659, 784, 1047].forEach((f, i) => {
            osc.frequency.setValueAtTime(f, now + i * 0.12);
          });
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
          osc.start(now); osc.stop(now + 0.5); break;
        case 'buy':
          osc.frequency.setValueAtTime(600, now);
          osc.frequency.setValueAtTime(900, now + 0.06);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
          osc.start(now); osc.stop(now + 0.1); break;
        case 'move':
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(300, now);
          osc.frequency.setValueAtTime(600, now + 0.1);
          osc.frequency.setValueAtTime(300, now + 0.2);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
          osc.start(now); osc.stop(now + 0.25); break;
        case 'event':
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(200, now);
          osc.frequency.setValueAtTime(800, now + 0.15);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
          osc.start(now); osc.stop(now + 0.2); break;
        case 'scandal':
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(400, now);
          osc.frequency.setValueAtTime(100, now + 0.3);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
          osc.start(now); osc.stop(now + 0.4); break;
      }
    } catch(e) {}
  }

  function toggle() { enabled = !enabled; return enabled; }
  function isEnabled() { return enabled; }
  function setEnabled(v) { enabled = v; }

  return { play, toggle, isEnabled, setEnabled };
})();
