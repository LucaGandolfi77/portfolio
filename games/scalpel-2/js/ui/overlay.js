/* ═══════════════════════════════════════════════════════════════
   SCALPEL-2 — Overlay UI System
   ═══════════════════════════════════════════════════════════════ */

var S2 = S2 || {};

S2.Overlay = (function() {
  'use strict';

  var overlay = null;
  var content = null;
  var stack = [];
  var onCloseCallback = null;

  function init() {
    overlay = document.getElementById('overlay');
    content = document.getElementById('overlay-content');
  }

  function show(html, options) {
    options = options || {};
    if (!overlay || !content) return;

    if (stack.length > 0 || !overlay.classList.contains('hidden')) {
      stack.push(content.innerHTML);
    }

    content.innerHTML = html;
    overlay.classList.remove('hidden');

    if (options.onClose) {
      onCloseCallback = options.onClose;
    }

    bindButtons();
  }

  function hide() {
    if (!overlay) return;
    overlay.classList.add('hidden');
    content.innerHTML = '';
    onCloseCallback = null;
  }

  function back() {
    if (stack.length > 0) {
      content.innerHTML = stack.pop();
      bindButtons();
    } else {
      hide();
    }
  }

  function bindButtons() {
    var buttons = content.querySelectorAll('[data-action]');
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener('click', handleButtonAction);
    }
  }

  function handleButtonAction(e) {
    var action = e.currentTarget.getAttribute('data-action');
    var target = e.currentTarget.getAttribute('data-target');

    S2.Audio.play('click');
    S2.Audio.hapticTap();

    if (action === 'back') {
      back();
    } else if (action === 'close') {
      hide();
      if (onCloseCallback) onCloseCallback();
    } else if (action === 'navigate' && target) {
      if (typeof window[target] === 'function') {
        window[target]();
      }
    }
  }

  function isVisible() {
    return overlay && !overlay.classList.contains('hidden');
  }

  /* ─── Builder Helpers ─── */
  function buildMenu(title, subtitle, sections) {
    var html = '<h1>' + title + '</h1>';
    if (subtitle) html += '<h2>' + subtitle + '</h2>';

    for (var i = 0; i < sections.length; i++) {
      var section = sections[i];
      html += '<div class="menu-section">';
      if (section.title) {
        html += '<div class="menu-section-title">' + section.title + '</div>';
      }
      for (var j = 0; j < section.buttons.length; j++) {
        var btn = section.buttons[j];
        html += buildButton(btn);
      }
      html += '</div>';
    }

    return html;
  }

  function buildButton(config) {
    var classes = ['menu-btn'];
    if (config.type) classes.push(config.type);
    if (config.disabled) classes.push('disabled');

    var attrs = [];
    attrs.push('class="' + classes.join(' ') + '"');
    if (config.id) attrs.push('id="' + config.id + '"');
    if (config.action) attrs.push('data-action="' + config.action + '"');
    if (config.target) attrs.push('data-target="' + config.target + '"');
    if (config.disabled) attrs.push('disabled');
    if (config.style) attrs.push('style="' + config.style + '"');

    var html = '<button ' + attrs.join(' ') + '>';
    if (config.icon) html += '<span class="menu-btn-icon">' + config.icon + '</span>';
    html += '<span class="menu-btn-label">' + config.label + '</span>';
    if (config.badge) html += '<span class="menu-btn-badge">' + config.badge + '</span>';
    html += '</button>';

    return html;
  }

  function buildResultsCard(data) {
    var html = '<div class="results-card">';
    html += '<div class="grade" style="color:' + (data.gradeColor || '#3498db') + '">' + (data.grade || 'B') + '</div>';
    html += '<div class="score">' + (data.score || 0) + ' pts</div>';
    html += '<div class="detail">' + (data.detail || '') + '</div>';
    html += '<div class="stats">';
    html += '<div class="stat"><div class="stat-value">' + (data.accuracy || 0) + '%</div><div class="stat-label">Accuracy</div></div>';
    html += '<div class="stat"><div class="stat-value">' + (data.combo || 0) + 'x</div><div class="stat-label">Max Combo</div></div>';
    html += '<div class="stat"><div class="stat-value">' + (data.time || '0:00') + '</div><div class="stat-label">Time</div></div>';
    html += '</div></div>';
    return html;
  }

  function buildPatientCard(patient, instruments) {
    var html = '<div class="patient-card">';
    html += '<div class="pi-header">';
    html += '<div class="pi-avatar">' + patient.emoji + '</div>';
    html += '<div><div class="pi-name">' + patient.name + ', ' + patient.age + '</div>';
    html += '<div class="pi-meta">' + patient.condition + '</div></div>';
    html += '</div>';
    html += '<div class="pi-desc">' + patient.desc + '</div>';

    html += '<div class="pi-vitals">';
    html += '<div class="pi-vital"><div class="pi-vital-value">' + patient.vitals.hr + '</div><div class="pi-vital-label">HR</div></div>';
    html += '<div class="pi-vital"><div class="pi-vital-value">' + patient.vitals.bp + '</div><div class="pi-vital-label">BP</div></div>';
    html += '<div class="pi-vital"><div class="pi-vital-value">' + patient.vitals.temp + '</div><div class="pi-vital-label">Temp</div></div>';
    html += '<div class="pi-vital"><div class="pi-vital-value">' + patient.vitals.o2 + '%</div><div class="pi-vital-label">O2</div></div>';
    html += '</div>';

    if (instruments && instruments.length > 0) {
      html += '<div class="pi-instruments">';
      for (var i = 0; i < instruments.length; i++) {
        var inst = S2.Instruments[instruments[i]];
        if (inst) {
          html += '<span class="pi-inst">' + inst.icon + ' ' + inst.name + '</span>';
        }
      }
      html += '</div>';
    }

    html += '</div>';
    return html;
  }

  return {
    init: init,
    show: show,
    hide: hide,
    back: back,
    isVisible: isVisible,
    buildMenu: buildMenu,
    buildButton: buildButton,
    buildResultsCard: buildResultsCard,
    buildPatientCard: buildPatientCard
  };

})();

window.S2 = window.S2 || {};
window.S2.Overlay = S2.Overlay;
