/* =====================================================================
   Quiz Lab Enhancer — piccoli incantesimi condivisi da tutti i quiz
   · confetti quando appare il risultato
   · animazione di ingresso del risultato
   Uso: includere <script src=".../quiz-enhance.js"></script>
   ===================================================================== */
(function () {
  'use strict';

  var COLORS = ['#00d4ff', '#ffd54a', '#ff6b9d', '#7c5cff', '#4ade80', '#ff9f43'];

  function confetti(n) {
    n = n || 60;
    var frag = document.createDocumentFragment();
    for (var i = 0; i < n; i++) {
      var c = document.createElement('div');
      c.className = 'qconfetti';
      c.style.left = (Math.random() * 100) + 'vw';
      c.style.background = COLORS[i % COLORS.length];
      c.style.width = (8 + Math.random() * 8) + 'px';
      c.style.height = (10 + Math.random() * 8) + 'px';
      c.style.animationDuration = (1.6 + Math.random() * 1.6) + 's';
      c.style.animationDelay = (Math.random() * 0.4) + 's';
      c.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
      frag.appendChild(c);
    }
    document.body.appendChild(frag);
    setTimeout(function () {
      for (var j = 0; j < frag.children.length; j++) frag.children[j].remove();
    }, 3800);
  }

  function isResultElement(el) {
    var cls = '';
    try { cls = String(el.className || ''); } catch (e) { return false; }
    return /(^|[\s_])(result|final)/i.test(cls) || el.id === 'resultArea' || el.id === 'result';
  }

  function watchResults() {
    if (typeof MutationObserver === 'undefined') return;
    try {
      var obs = new MutationObserver(function (muts) {
        for (var i = 0; i < muts.length; i++) {
          var t = muts[i].target;
          if (!t || !t.classList || typeof t.classList.contains !== 'function') continue;
          if (!t.classList.contains('hidden') && isResultElement(t)) {
            document.body.classList.add('qz-reveal');
            confetti();
            break;
          }
        }
      });
      obs.observe(document.body, { subtree: true, attributes: true, attributeFilter: ['class'] });
    } catch (e) { /* se il DOM non è pronto, niente di grave */ }
  }

  function init() {
    // l'animazione di ingresso parte quando .qz-reveal è sul body
    watchResults();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.QuizConfetti = confetti;
  window.QuizEnhancer = { confetti: confetti };
})();
