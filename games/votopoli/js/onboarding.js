// onboarding.js — 4-step tutorial (pattern from regno-di-moneta)
window.Onboarding = (() => {
  const STORAGE_KEY = 'votopoli_onboarding_done';

  const STEPS = [
    { icon: '🗳️', title: 'Benvenuto a Votopoli!', text: 'Inizi con una tenda a Bastardo e €100. Scala a un castello gestendo business e navigando la politica!', highlight: null },
    { icon: '💼', title: 'Compra Business', text: 'Compra business per guadagnare soldi. Ogni business genera income, ma le tasse del sindaco mangiano una parte!', highlight: 'nav-biz' },
    { icon: '🗳️', title: 'Vota ogni giorno', text: 'Ogni giorno ci sono elezioni locali! Vota per il sindaco — se vince il tuo candidato, ricevi favori!', highlight: 'nav-election' },
    { icon: '🎮', title: 'Gioca e guadagna', text: 'I minigiochi ti danno soldi bonus. Schiva la burocrazia, fai campagna elettorale e memORIZZA le promesse!', highlight: 'nav-minigames' }
  ];

  let stepIdx = 0, overlay = null, onComplete = null;

  function shouldShow() {
    return !localStorage.getItem(STORAGE_KEY);
  }

  function markDone() {
    localStorage.setItem(STORAGE_KEY, '1');
  }

  function createOverlay() {
    overlay = document.createElement('div');
    overlay.id = 'onboarding-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;z-index:200;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity 0.3s;pointer-events:none';
    overlay.innerHTML = `
      <div style="position:absolute;inset:0;background:rgba(0,0,0,0.5)"></div>
      <div style="position:relative;background:var(--card);border-radius:16px;padding:24px;max-width:300px;width:90%;text-align:center;z-index:1;transform:translateY(20px);transition:transform 0.3s">
        <div id="ob-icon" style="font-size:48px;margin-bottom:12px"></div>
        <div id="ob-title" style="font-size:18px;font-weight:800;margin-bottom:8px"></div>
        <div id="ob-text" style="font-size:12px;color:var(--dim);margin-bottom:16px;line-height:1.4"></div>
        <div id="ob-dots" style="display:flex;justify-content:center;gap:6px;margin-bottom:16px"></div>
        <div style="display:flex;gap:8px">
          <button class="btn ghost" id="ob-skip" style="flex:1;font-size:12px">Salta</button>
          <button class="btn primary" id="ob-next" style="flex:1;font-size:12px">Avanti →</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);

    document.getElementById('ob-skip').onclick = close;
    document.getElementById('ob-next').onclick = nextStep;
  }

  function renderStep() {
    const s = STEPS[stepIdx];
    document.getElementById('ob-icon').textContent = s.icon;
    document.getElementById('ob-title').textContent = s.title;
    document.getElementById('ob-text').textContent = s.text;

    const dots = STEPS.map((_, i) =>
      `<div style="width:8px;height:8px;border-radius:50%;background:${i === stepIdx ? 'var(--gold)' : 'var(--line)'}"></div>`
    ).join('');
    document.getElementById('ob-dots').innerHTML = dots;

    document.getElementById('ob-next').textContent = stepIdx === STEPS.length - 1 ? 'Inizia! 🎮' : 'Avanti →';

    // Highlight target element
    if (s.highlight) {
      const target = document.querySelector(`[id="${s.highlight}"]`);
      if (target) {
        target.style.outline = '3px solid var(--gold)';
        target.style.outlineOffset = '4px';
        target.style.borderRadius = '12px';
        setTimeout(() => {
          target.style.outline = '';
          target.style.outlineOffset = '';
        }, 2000);
      }
    }
  }

  function nextStep() {
    stepIdx++;
    if (stepIdx >= STEPS.length) { close(); return; }
    renderStep();
    if (window.Sounds) window.Sounds.play('click');
  }

  function close() {
    overlay.style.opacity = '0';
    overlay.querySelector('div:last-child').style.transform = 'translateY(20px)';
    setTimeout(() => { overlay.remove(); overlay = null; }, 300);
    markDone();
    if (onComplete) onComplete();
  }

  function start(callback) {
    if (!shouldShow()) { if (callback) callback(); return; }
    onComplete = callback;
    stepIdx = 0;
    createOverlay();
    renderStep();
    requestAnimationFrame(() => {
      overlay.style.opacity = '1';
      overlay.querySelector('div:last-child').style.transform = 'translateY(0)';
    });
  }

  function reset() { localStorage.removeItem(STORAGE_KEY); }

  return { start, reset, shouldShow };
})();
