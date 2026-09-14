/* ═══════════════════════════════════════════════════════════════
   SCALPEL-2 — Application Entry Point
   ═══════════════════════════════════════════════════════════════ */

var S2 = S2 || {};

S2.App = (function() {
  'use strict';

  var loaded = false;

  function boot() {
    console.log('[Scalpel-2] Booting...');

    /* Initialize all systems */
    S2.Renderer.init();
    S2.Input.init(S2.Renderer.getCanvas());
    S2.Audio.init();
    S2.Overlay.init();
    S2.HUD.init();
    S2.Dialogue.init();
    S2.Toast.init();

    /* Load save data */
    S2.Progression.load();

    /* Load sound settings */
    var save = S2.Save.load();
    if (save.settings && save.settings.sound === false) {
      S2.Audio.setEnabled(false);
    }

    /* Start render loop */
    S2.Renderer.start();

    /* Setup dialogue click handler */
    var dialogueEl = document.getElementById('dialogue');
    if (dialogueEl) {
      dialogueEl.addEventListener('click', function() {
        S2.Audio.play('click');
        S2.Audio.hapticTap();
        S2.Dialogue.skipOrNext();
      });
    }

    /* Setup overlay click outside to close */
    var overlayEl = document.getElementById('overlay');
    if (overlayEl) {
      overlayEl.addEventListener('click', function(e) {
        if (e.target === overlayEl) {
          S2.Audio.play('click');
          S2.Overlay.back();
        }
      });
    }

    /* Setup pause on escape key */
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        var state = S2.StateMachine.getState();
        if (state === S2.StateMachine.STATES.SURGERY) {
          S2.Story.pauseSurgery();
        } else if (state === S2.StateMachine.STATES.PAUSED) {
          S2.Story.resumeSurgery();
        } else if (S2.Overlay.isVisible()) {
          S2.Overlay.back();
        }
      }
    });

    /* Hide loading screen and show title */
    setTimeout(function() {
      hideLoading();
      S2.Menu.showTitle();
      loaded = true;
      console.log('[Scalpel-2] Ready!');
    }, 500);
  }

  function hideLoading() {
    var loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      loadingScreen.classList.add('fade-out');
      setTimeout(function() {
        loadingScreen.style.display = 'none';
      }, 500);
    }
  }

  function isLoaded() {
    return loaded;
  }

  /* ─── Auto-boot on DOM ready ─── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  return {
    boot: boot,
    isLoaded: isLoaded
  };

})();

window.S2 = window.S2 || {};
window.S2.App = S2.App;
