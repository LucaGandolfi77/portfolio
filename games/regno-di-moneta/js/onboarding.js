// onboarding.js — Tutorial interattivo per nuovi giocatori
window.Onboarding = (() => {
  const STEPS = [
    {
      icon: '🐉',
      title: 'Benvenuto nel Regno di Moneta!',
      text: 'Il drago Inflazion sta devastando il Regno di Soldania. Solo tu puoi salvare il regno imparando a gestire i soldi!',
      highlight: null,
      position: 'center'
    },
    {
      icon: '📖',
      title: '18 Capitoli di Storia',
      text: 'Ogni capitolo ti insegna un concetto finanziario diverso attraverso una storia interattiva con personaggi memorabili.',
      highlight: '.chbar',
      position: 'bottom'
    },
    {
      icon: '🎮',
      title: 'Minigiochi Educativi',
      text: 'Dopo ogni storia, un minigioco ti mette alla prova! Rispondi bene per guadagnare monete e avanzare.',
      highlight: '#game-area',
      position: 'top'
    },
    {
      icon: '💰',
      title: 'Le Tue Monete',
      text: 'Le monete che guadagni ti servono per sbloccare contenuti e costruire il tuo Impero!',
      highlight: '.money',
      position: 'bottom'
    },
    {
      icon: '🏰',
      title: 'Impero di Soldania',
      text: 'Dopo il Capitolo 7 sblocchi l\'Impero: un idle game infinito dove costruisci la tua economia!',
      highlight: null,
      position: 'center'
    }
  ];

  let stepIdx = 0;
  let overlay = null;
  let onComplete = null;

  function shouldShow() {
    try {
      return !localStorage.getItem('rdm_onboarding_done');
    } catch(e) { return true; }
  }

  function markDone() {
    try { localStorage.setItem('rdm_onboarding_done', '1'); } catch(e) {}
  }

  function createOverlay() {
    overlay = document.createElement('div');
    overlay.id = 'onboarding-overlay';
    overlay.innerHTML = `
      <div class="ob-card">
        <div class="ob-icon" id="ob-icon"></div>
        <div class="ob-title" id="ob-title"></div>
        <div class="ob-text" id="ob-text"></div>
        <div class="ob-dots" id="ob-dots"></div>
        <div class="ob-actions">
          <button class="btn ghost small" id="ob-skip">Salta</button>
          <button class="btn primary" id="ob-next">Avanti →</button>
        </div>
      </div>
      <div class="ob-spotlight" id="ob-spotlight"></div>
    `;
    document.body.appendChild(overlay);

    document.getElementById('ob-skip').onclick = close;
    document.getElementById('ob-next').onclick = nextStep;
  }

  function renderStep() {
    const step = STEPS[stepIdx];
    document.getElementById('ob-icon').textContent = step.icon;
    document.getElementById('ob-title').textContent = step.title;
    document.getElementById('ob-text').textContent = step.text;

    const isLast = stepIdx >= STEPS.length - 1;
    document.getElementById('ob-next').textContent = isLast ? '🎮 Inizia!' : 'Avanti →';

    // Dots
    const dots = document.getElementById('ob-dots');
    dots.innerHTML = STEPS.map((_, i) =>
      `<span class="ob-dot ${i === stepIdx ? 'active' : ''}"></span>`
    ).join('');

    // Spotlight
    const spotlight = document.getElementById('ob-spotlight');
    const hl = step.highlight;
    if (hl) {
      const el = document.querySelector(hl);
      if (el) {
        const rect = el.getBoundingClientRect();
        spotlight.style.display = 'block';
        spotlight.style.top = (rect.top - 4) + 'px';
        spotlight.style.left = (rect.left - 4) + 'px';
        spotlight.style.width = (rect.width + 8) + 'px';
        spotlight.style.height = (rect.height + 8) + 'px';
        return;
      }
    }
    spotlight.style.display = 'none';
  }

  function nextStep() {
    stepIdx++;
    if (stepIdx >= STEPS.length) {
      close();
      return;
    }
    renderStep();
    if (window.Sounds) window.Sounds.play('click');
  }

  function close() {
    if (overlay) {
      overlay.classList.add('closing');
      setTimeout(() => overlay.remove(), 300);
    }
    markDone();
    if (onComplete) onComplete();
  }

  function start(callback) {
    if (!shouldShow()) {
      if (callback) callback();
      return;
    }
    onComplete = callback;
    stepIdx = 0;
    createOverlay();
    renderStep();
    requestAnimationFrame(() => overlay.classList.add('show'));
  }

  function reset() {
    try { localStorage.removeItem('rdm_onboarding_done'); } catch(e) {}
  }

  return { start, reset, shouldShow };
})();
