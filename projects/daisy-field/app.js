/* ============================================================
   Daisy Field — app.js
   Core timer logic, screen transitions, spawn scheduling.

   ┌─────────────────────────────────────────────────────────┐
   │ CUSTOMISATION GUIDE                                     │
   │                                                         │
   │  • Timer range:  change MIN_MINUTES / MAX_MINUTES below │
   │  • Daisy count:  adjust PX_PER_DAISY (lower = more)     │
   │  • Colours:      edit the palette in style.css (:root)  │
   │                  and PETAL_COLORS in daisy.js            │
   └─────────────────────────────────────────────────────────┘
   ============================================================ */

/* ---- Tunables ---- */
const MIN_MINUTES   = 1;
const MAX_MINUTES   = 60;
const PX_PER_DAISY  = 3500;   // ~1 daisy per this many px² of screen area

/* ---- DOM refs ---- */
const $setup   = document.getElementById('setup-screen');
const $meadow  = document.getElementById('meadow-screen');
const $reward  = document.getElementById('reward-screen');
const $slider  = document.getElementById('time-slider');
const $display = document.getElementById('time-display');
const $btnStart   = document.getElementById('btn-start');
const $btnCollect = document.getElementById('btn-collect');
const $timerPill  = document.getElementById('timer-pill');
const $timerText  = document.getElementById('timer-text');
const $btnEnd     = document.getElementById('btn-end');
const $meadowArea = document.getElementById('meadow');
const $confetti   = document.getElementById('confetti-canvas');
const $bouquet    = document.getElementById('bouquet-container');
const $rewardMsg  = document.getElementById('reward-message');

const FLOWER_EMOJI = { daisy: '🌼', rose: '🌹', sunflower: '🌻', tulip: '🌷', cherry: '🌸', rosette: '🏵️', hyacinth: '🪻', hibiscus: '🌺', mushroom: '🍄', custom: '✏️' };

/* ---- Custom text modal refs ---- */
const $customModal   = document.getElementById('custom-modal');
const $customInput   = document.getElementById('custom-text-input');
const $btnCustomOk   = document.getElementById('btn-custom-ok');
const $btnCustomCancel = document.getElementById('btn-custom-cancel');
const $pickedPill  = document.getElementById('picked-pill');

/* ---- State ---- */
let timer = null;
let pickedCount = 0;

/* ============================================================
   DaisyTimer — the main timer engine
   ============================================================ */
class DaisyTimer {
  /**
   * @param {number} minutes — duration in minutes (1-60)
   */
  constructor(minutes) {
    this.totalSeconds  = minutes * 60;
    this.remaining     = this.totalSeconds;
    this.minutes       = minutes;
    this.intervalId    = null;
    this.spawnTimeouts = [];
    this.daisyCount    = 0;
    this.paused        = false;
    this._pauseStart   = 0;
  }

  /* ---- Public API ---- */

  start() {
    DaisyFactory.clearMeadow();
    this._scheduleSpawns();
    this._tick();                               // immediate first render
    this.intervalId = setInterval(() => this._tick(), 1000);
  }

  pause() {
    if (this.paused) return;
    this.paused = true;
    this._pauseStart = Date.now();
    clearInterval(this.intervalId);
    for (const t of this.spawnTimeouts) clearTimeout(t.id);
  }

  resume() {
    if (!this.paused) return;
    const elapsed = Date.now() - this._pauseStart;
    this.paused = false;
    /* Reschedule remaining spawns shifted by pause duration */
    for (const t of this.spawnTimeouts) {
      if (t.fired) continue;
      t.ms += elapsed;
      t.id = setTimeout(() => { t.fired = true; this._spawn(); }, Math.max(0, t.ms - (Date.now() - t.epoch)));
    }
    this.intervalId = setInterval(() => this._tick(), 1000);
  }

  stop() {
    clearInterval(this.intervalId);
    for (const t of this.spawnTimeouts) clearTimeout(t.id);
    this.spawnTimeouts = [];
  }

  complete() {
    this.stop();
    this._showReward();
  }

  /* ---- Spawn scheduling (Poisson-like) ---- */

  /**
   * Pre-calculate spawn times using exponential inter-arrival times
   * (Poisson process approximation) so daisies appear in organic
   * bursts and lulls, while guaranteeing the screen fills at t=total.
   */
  _scheduleSpawns() {
    const area  = window.innerWidth * window.innerHeight;
    const total = Math.max(8, Math.round(area / PX_PER_DAISY));
    const dur   = this.totalSeconds * 1000;            // ms

    /* Generate raw exponential inter-arrival times */
    const raw = [];
    for (let i = 0; i < total; i++) {
      raw.push(-Math.log(1 - Math.random()));          // Exp(1)
    }
    /* Normalise so cumulative sum = dur */
    const sum = raw.reduce((a, b) => a + b, 0);
    let cumulative = 0;
    const epoch = Date.now();

    for (let i = 0; i < total; i++) {
      cumulative += (raw[i] / sum) * dur;
      const ms = cumulative;
      const entry = { ms, epoch, fired: false, id: null };
      entry.id = setTimeout(() => { entry.fired = true; this._spawn(); }, ms);
      this.spawnTimeouts.push(entry);
    }

    this.daisyCount = total;
  }

  _spawn() {
    DaisyFactory.spawnDaisy($meadowArea);
  }

  /* ---- Countdown tick ---- */

  _tick() {
    this.remaining = Math.max(0, this.remaining - 1);
    const m = String(Math.floor(this.remaining / 60)).padStart(2, '0');
    const s = String(this.remaining % 60).padStart(2, '0');
    $timerText.textContent = `${m}:${s}`;

    /* Pulse effect in last 30 s */
    if (this.remaining <= 30) {
      $timerPill.classList.add('pulse');
    }

    if (this.remaining <= 0) {
      this.complete();
    }
  }

  /* ---- Reward sequence ---- */

  _showReward() {
    /* 1. Bounce all existing daisies */
    const daisies = $meadowArea.querySelectorAll('.daisy');
    if (typeof gsap !== 'undefined') {
      gsap.to(daisies, {
        y: -12,
        duration: 0.25,
        ease: 'power2.out',
        stagger: { each: 0.01, from: 'random' },
        yoyo: true,
        repeat: 1
      });
    }

    /* 2. Transition to reward screen after bounce */
    setTimeout(() => {
      _switchScreen($reward);

      /* 3. Build & animate bouquet */
      $bouquet.innerHTML = '';
      const bouquetSvg = DaisyFactory.createBouquet();
      $bouquet.appendChild(bouquetSvg);

      if (typeof gsap !== 'undefined') {
        gsap.from($bouquet, {
          y: 300,
          scale: 0.3,
          opacity: 0,
          duration: 1,
          ease: 'back.out(1.4)'
        });
      }

      /* 4. Confetti */
      Confetti.start($confetti);

      /* 5. Message */
      const emoji = FLOWER_EMOJI[DaisyFactory.getFlowerType()] || '🌼';
      const pickedText = pickedCount > 0 ? ` You picked ${pickedCount} flower${pickedCount > 1 ? 's' : ''}!` : '';
      $rewardMsg.textContent = `${emoji} Well done! You stayed away for ${this.minutes} minute${this.minutes > 1 ? 's' : ''}!${pickedText}`;
      $pickedPill.classList.remove('visible');

    }, 700);
  }
}

/* ============================================================
   Screen management
   ============================================================ */
function _switchScreen(target) {
  for (const s of document.querySelectorAll('.screen')) {
    s.classList.remove('active');
  }
  target.classList.add('active');
}

/* ============================================================
   Event wiring
   ============================================================ */

/* Slider → display */
$slider.min   = MIN_MINUTES;
$slider.max   = MAX_MINUTES;
$slider.value = 5;
_updateDisplay();

$slider.addEventListener('input', _updateDisplay);

function _updateDisplay() {
  const v = Number($slider.value);
  $display.innerHTML = `${v}<span>minute${v > 1 ? 's' : ''}</span>`;
}

/* Flower type selection */
document.querySelectorAll('.flower-option').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.flower-option').forEach(b => {
      b.classList.remove('selected');
      b.setAttribute('aria-pressed', 'false');
    });
    btn.classList.add('selected');
    btn.setAttribute('aria-pressed', 'true');
    DaisyFactory.setFlowerType(btn.dataset.flower);

    /* Open modal when Custom is selected */
    if (btn.dataset.flower === 'custom') {
      $customModal.classList.add('open');
      $customModal.setAttribute('aria-hidden', 'false');
      $customInput.value = DaisyFactory.getCustomText();
      $customInput.focus();
    }
  });
});

/* Custom modal — OK */
$btnCustomOk.addEventListener('click', () => {
  const text = $customInput.value.trim();
  DaisyFactory.setCustomText(text || '✨');
  $customModal.classList.remove('open');
  $customModal.setAttribute('aria-hidden', 'true');
});

/* Custom modal — Cancel */
$btnCustomCancel.addEventListener('click', () => {
  $customModal.classList.remove('open');
  $customModal.setAttribute('aria-hidden', 'true');
  /* Revert to previous flower if no custom text set */
  if (!DaisyFactory.getCustomText()) {
    const prev = document.querySelector('.flower-option[data-flower="daisy"]');
    prev.click();
  }
});

/* Custom modal — Enter key submits */
$customInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') $btnCustomOk.click();
});

/* Start button */
$btnStart.addEventListener('click', () => {
  const minutes = Number($slider.value);
  _switchScreen($meadow);
  $meadow.classList.add('filling');
  $timerPill.classList.remove('pulse');
  $timerPill.classList.remove('expanded');
  $timerText.textContent = `${String(minutes).padStart(2, '0')}:00`;

  /* Clear old daisies & picked counter */
  $meadowArea.innerHTML = '';
  pickedCount = 0;
  $pickedPill.textContent = '💐 0';
  $pickedPill.classList.remove('visible');

  timer = new DaisyTimer(minutes);

  /* Small delay so the screen transition finishes first */
  setTimeout(() => timer.start(), 400);
});

/* Timer pill tap-to-expand */
$timerPill.addEventListener('click', (e) => {
  if (e.target === $btnEnd) return;
  $timerPill.classList.toggle('expanded');
});

/* End timer early */
$btnEnd.addEventListener('click', () => {
  if (!timer) return;
  timer.stop();
  $timerPill.classList.remove('expanded');
  $timerPill.classList.remove('pulse');
  $meadow.classList.remove('filling');
  $meadowArea.innerHTML = '';
  pickedCount = 0;
  $pickedPill.classList.remove('visible');
  DaisyFactory.clearMeadow();
  _switchScreen($setup);
});

/* Pick up a flower by tapping it */
$meadowArea.addEventListener('click', (e) => {
  const flower = e.target.closest('.daisy');
  if (!flower || flower.classList.contains('picked')) return;

  flower.classList.add('picked');
  pickedCount++;
  $pickedPill.textContent = `💐 ${pickedCount}`;
  $pickedPill.classList.add('visible');

  /* Pluck animation: scale up, float upward, fade out */
  if (typeof gsap !== 'undefined') {
    gsap.to(flower, {
      y: -80,
      scale: 1.3,
      opacity: 0,
      rotation: (Math.random() - 0.5) * 30,
      duration: 0.55,
      ease: 'power2.out',
      onComplete() { flower.remove(); }
    });
  } else {
    flower.style.transition = 'transform .5s ease, opacity .5s ease';
    flower.style.transform = 'translateY(-80px) scale(1.3)';
    flower.style.opacity = '0';
    setTimeout(() => flower.remove(), 500);
  }
});

/* Collect bouquet → reset */
$btnCollect.addEventListener('click', () => {
  Confetti.stop();
  $meadow.classList.remove('filling');
  $meadowArea.innerHTML = '';
  pickedCount = 0;
  DaisyFactory.clearMeadow();
  _switchScreen($setup);
});

/* ============================================================
   Service Worker registration
   ============================================================ */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js');
  });
}
