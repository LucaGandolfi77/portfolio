/* ═══════════════════════════════════════════════════════════════
   SCALPEL-2 — Daily Surgery Mode
   ═══════════════════════════════════════════════════════════════ */

var S2 = S2 || {};

S2.Daily = (function() {
  'use strict';

  function getDailySeed() {
    var now = new Date();
    return now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
  }

  function getDailyChapter() {
    var seed = getDailySeed();
    var idx = seed % S2.Chapters.length;
    return S2.Chapters[idx];
  }

  function showDaily() {
    S2.StateMachine.transition(S2.StateMachine.STATES.DAILY_SELECT);

    var chapter = getDailyChapter();
    var patient = S2.Patients[chapter.patient];

    var html = '<h1>DAILY SURGERY</h1>';
    html += '<h2>Today\'s Challenge</h2>';

    if (patient) {
      html += S2.Overlay.buildPatientCard(patient, chapter.instruments);
    }

    html += S2.Overlay.buildButton({ icon: '▶', label: 'START DAILY', type: 'primary', action: 'navigate', target: 'S2.Daily.startDaily' });
    html += S2.Overlay.buildButton({ icon: '←', label: 'BACK', action: 'back' });

    S2.Overlay.show(html);
  }

  function startDaily() {
    var chapter = getDailyChapter();
    S2.Story.startChapter(chapter.id);
  }

  function getDailyResults() {
    var seed = getDailySeed();
    var save = S2.Save.load();
    return save.daily ? save.daily[seed] : null;
  }

  function saveDailyResults(results) {
    var seed = getDailySeed();
    var save = S2.Save.load();
    if (!save.daily) save.daily = {};
    save.daily[seed] = results;
    S2.Save.save(save);
  }

  return {
    showDaily: showDaily,
    startDaily: startDaily,
    getDailyResults: getDailyResults,
    saveDailyResults: saveDailyResults
  };

})();

window.S2 = window.S2 || {};
window.S2.Daily = S2.Daily;
