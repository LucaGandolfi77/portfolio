/* ═══════════════════════════════════════════════════════════════
   SCALPEL-2 — Dialogue System
   ═══════════════════════════════════════════════════════════════ */

var S2 = S2 || {};

S2.Dialogue = (function() {
  'use strict';

  var dialogueEl, speakerEl, textEl, continueEl;
  var queue = [];
  var active = false;
  var onCompleteCallback = null;
  var typeTimer = null;
  var fullText = '';
  var charIndex = 0;

  function init() {
    dialogueEl = document.getElementById('dialogue');
    speakerEl = document.getElementById('dialogue-speaker');
    textEl = document.getElementById('dialogue-text');
    continueEl = document.getElementById('dialogue-continue');
  }

  function show(dialogues, onComplete) {
    if (!dialogues || dialogues.length === 0) {
      if (onComplete) onComplete();
      return;
    }

    queue = dialogues.slice();
    onCompleteCallback = onComplete;
    active = true;

    if (dialogueEl) dialogueEl.classList.remove('hidden');

    showNext();
  }

  function showNext() {
    if (queue.length === 0) {
      hide();
      if (onCompleteCallback) onCompleteCallback();
      return;
    }

    var dialog = queue.shift();
    if (speakerEl) speakerEl.textContent = dialog.speaker || '';
    if (textEl) textEl.textContent = '';

    fullText = dialog.text || '';
    charIndex = 0;

    typeText();
  }

  function typeText() {
    if (charIndex < fullText.length) {
      if (textEl) textEl.textContent += fullText[charIndex];
      charIndex++;
      typeTimer = setTimeout(typeText, 20);
    } else {
      if (continueEl) continueEl.style.display = 'block';
    }
  }

  function skipOrNext() {
    if (!active) return;

    if (charIndex < fullText.length) {
      clearTimeout(typeTimer);
      charIndex = fullText.length;
      if (textEl) textEl.textContent = fullText;
      if (continueEl) continueEl.style.display = 'block';
    } else {
      showNext();
    }
  }

  function hide() {
    if (dialogueEl) dialogueEl.classList.add('hidden');
    active = false;
    clearTimeout(typeTimer);
  }

  function isActive() {
    return active;
  }

  return {
    init: init,
    show: show,
    skipOrNext: skipOrNext,
    hide: hide,
    isActive: isActive
  };

})();

window.S2 = window.S2 || {};
window.S2.Dialogue = S2.Dialogue;
