/* ═══════════════════════════════════════════════════════════════
   SCALPEL-2 — Boss Rush Mode
   ═══════════════════════════════════════════════════════════════ */

var S2 = S2 || {};

S2.BossRush = (function() {
  'use strict';

  var bosses = [
    { id: 3, name: 'The Heart', hp: 100 },
    { id: 4, name: 'The Mind', hp: 120 },
    { id: 5, name: 'The Visitor', hp: 150 },
    { id: 9, name: 'The Birth', hp: 130 },
    { id: 10, name: 'The Master', hp: 200 }
  ];

  var currentBoss = 0;
  var bossHP = 0;
  var totalScore = 0;

  function showSelect() {
    S2.StateMachine.transition(S2.StateMachine.STATES.BOSSRUSH_SELECT);

    var html = '<h1>BOSS RUSH</h1>';
    html += '<h2>Face all bosses in sequence</h2>';
    html += '<div class="results-card">';
    html += '<div class="detail">Defeat 5 bosses back-to-back.<br>No breaks between surgeries.</div>';
    html += '</div>';
    html += S2.Overlay.buildButton({ icon: '▶', label: 'START BOSS RUSH', type: 'primary', action: 'navigate', target: 'S2.BossRush.startRush' });
    html += S2.Overlay.buildButton({ icon: '←', label: 'BACK', action: 'back' });

    S2.Overlay.show(html);
  }

  function startRush() {
    currentBoss = 0;
    bossHP = bosses[0].hp;
    totalScore = 0;

    S2.StateMachine.transition(S2.StateMachine.STATES.BOSSRUSH, {
      bossIndex: 0
    });

    startBoss();
  }

  function startBoss() {
    if (currentBoss >= bosses.length) {
      showVictory();
      return;
    }

    var boss = bosses[currentBoss];
    S2.HUD.show();
    S2.HUD.updateScore(totalScore);

    showBossHP(boss.hp);

    var chapter = S2.Chapters.find(function(c) { return c.id === boss.id; });
    if (chapter) {
      S2.Story.startChapter(chapter.id);
    }
  }

  function showBossHP(maxHP) {
    var bossEl = document.getElementById('boss-hp');
    if (bossEl) {
      bossEl.classList.add('show');
    }
  }

  function damageBoss(damage) {
    bossHP -= damage;
    if (bossHP <= 0) {
      bossHP = 0;
      S2.Toast.success('Boss defeated!');
      S2.Audio.play('fanfare');

      setTimeout(function() {
        currentBoss++;
        startBoss();
      }, 1500);
    }
  }

  function showVictory() {
    S2.HUD.hide();

    var html = '<h1>BOSS RUSH COMPLETE!</h1>';
    html += '<div class="results-card">';
    html += '<div class="grade" style="color:#f1c40f">🏆</div>';
    html += '<div class="score">' + totalScore + ' pts</div>';
    html += '<div class="detail">All bosses defeated!</div>';
    html += '</div>';
    html += S2.Overlay.buildButton({ icon: '→', label: 'CONTINUE', type: 'primary', action: 'navigate', target: 'S2.Menu.showTitle' });

    S2.Overlay.show(html);
  }

  function getBossHP() {
    return bossHP;
  }

  function getCurrentBoss() {
    return bosses[currentBoss] || null;
  }

  return {
    showSelect: showSelect,
    startRush: startRush,
    damageBoss: damageBoss,
    getBossHP: getBossHP,
    getCurrentBoss: getCurrentBoss,
    bosses: bosses
  };

})();

window.S2 = window.S2 || {};
window.S2.BossRush = S2.BossRush;
