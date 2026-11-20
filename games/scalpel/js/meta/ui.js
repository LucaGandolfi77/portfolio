/* Scalpel Meta — pannelli UI moderni */
(function(){
'use strict';

var I = window.SCALPEL_META_I18N;
var P = window.SCALPEL_META_PROFILE;
var M = window.SCALPEL_META_MISSIONS;
var t = I.t;

var root = null;
var activePanel = null;
var activeTab = 'daily';
var lastResult = null;
var contractChoices = { time:true, tremor:false, vision:false, double:false };

function esc(text){
  return String(text == null ? '' : text)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function ensureRoot(){
  if(root) return root;
  root = document.createElement('div');
  root.id = 'meta-ui';
  root.className = 'meta-ui hidden';
  root.innerHTML = '<div class="meta-backdrop" data-action="close"></div><div class="meta-sheet" id="meta-sheet"></div>';
  (document.body || document.documentElement).appendChild(root);
  root.addEventListener('click', onClick);
  root.addEventListener('change', onChange);
  return root;
}

function open(panel){
  ensureRoot();
  activePanel = panel;
  root.classList.remove('hidden');
  render();
}

function close(){
  if(!root) return;
  root.classList.add('hidden');
  activePanel = null;
}

function render(){
  if(!root || !activePanel) return;
  var sheet = document.getElementById('meta-sheet');
  if(!sheet) return;
  var methods = {
    missions: renderMissions, profile: renderProfile,
    stats: renderStats, settings: renderSettings, contracts: renderContracts
  };
  sheet.innerHTML = (methods[activePanel] || renderProfile)();
}

function header(title){
  return '<div class="meta-head"><h2>' + esc(title) + '</h2>' +
    '<button class="meta-close" data-action="close" aria-label="' + esc(t('action.close')) + '">✕</button></div>';
}

function missionCard(m){
  var pct = m.target ? Math.round(m.progress / m.target * 100) : 0;
  var label = t(m.nameKey || m.key, m.descVars || {});
  var desc = t(m.descKey || m.key, m.descVars || {});
  if(desc === (m.descKey || m.key)) desc = label;
  var claimable = m.progress >= m.target && !m.claimed;
  return '<div class="meta-mission' + (m.claimed ? ' done' : '') + '">' +
    '<div class="meta-mission-top"><b>' + esc(label) + '</b><span>' +
      esc(t('common.progress', { a: m.progress, b: m.target })) + '</span></div>' +
    '<div class="meta-desc">' + esc(desc) + '</div>' +
    '<div class="meta-progress"><i style="width:' + pct + '%"></i></div>' +
    '<div class="meta-mission-foot"><span>🎁 ' + esc(t('reward.xp', { n: m.reward.xp })) + ' · ' +
      esc(t('reward.credits', { n: m.reward.credits })) + '</span>' +
      (m.claimed ? '<span class="meta-claimed">' + esc(t('action.claimed')) + '</span>'
        : '<button class="meta-btn small" data-action="claim" data-id="' + esc(m.id) + '"' +
          (claimable ? '' : ' disabled') + '>' + esc(t('action.claim')) + '</button>') +
    '</div></div>';
}

function renderMissions(){
  var season = M.seasonInfo();
  var tabs = [
    ['daily', 'panel.daily'], ['weekly', 'panel.weekly'], ['permanent', 'panel.permanent'],
    ['chapter', 'panel.chapters'], ['season', 'panel.season']
  ].map(function(pair){
    return '<button class="meta-tab' + (activeTab === pair[0] ? ' active' : '') +
      '" data-action="tab" data-tab="' + pair[0] + '">' + esc(t(pair[1])) + '</button>';
  }).join('');

  var list = M.all().filter(function(m){ return m.category === activeTab; });
  if(activeTab === 'season'){
    list = list.slice(0, 8);
  }
  return header(t('panel.missions')) +
    '<div class="meta-season-line">⭐ ' + esc(t('profile.season')) + ': ' + season.xp +
      ' · ' + esc(t('common.level', { n: season.tier })) + '</div>' +
    '<div class="meta-tabs">' + tabs + '</div>' +
    '<div class="meta-list">' + (list.length ? list.map(missionCard).join('')
      : '<p class="meta-empty">' + esc(t('common.done')) + '</p>') + '</div>';
}

function renderProfile(){
  var d = P.data;
  var need = P.xpNeeded();
  var pct = Math.round(d.xp / need * 100);
  return header(t('panel.profile')) +
    '<div class="meta-profile-card">' +
      '<div class="meta-avatar">🩺</div>' +
      '<div><div class="meta-level">' + esc(t('common.level', { n: d.level })) + '</div>' +
      '<div class="meta-title">' + esc(d.title) + '</div></div>' +
    '</div>' +
    '<div class="meta-stat-row"><span>' + esc(t('profile.xp')) + '</span><b>' + d.xp + ' / ' + need + '</b></div>' +
    '<div class="meta-progress big"><i style="width:' + pct + '%"></i></div>' +
    '<div class="meta-stat-row"><span>' + esc(t('profile.credits')) + '</span><b>💰 ' + d.credits + '</b></div>' +
    '<div class="meta-stat-row"><span>' + esc(t('profile.season')) + '</span><b>⭐ ' + (d.seasonXp || 0) + '</b></div>' +
    '<div class="meta-title-list"><h3>' + esc(t('profile.unlocks')) + '</h3>' +
      d.titles.map(function(x){ return '<span class="meta-chip">' + esc(x) + '</span>'; }).join('') + '</div>';
}

function renderStats(){
  var s = P.data.stats;
  var modes = Object.keys(s.modePlays || {}).map(function(k){
    return '<div class="meta-stat-box"><b>' + s.modePlays[k] + '</b><span>' + esc(k) + '</span></div>';
  }).join('');
  var items = [
    ['stats.surgeries', s.surgeries], ['stats.steps', s.steps],
    ['stats.perfect', s.perfect], ['stats.boss', s.boss],
    ['stats.contracts', s.contracts], ['stats.best', s.bestScore || 0],
    ['stats.accuracy', P.averageAccuracy() + '%']
  ];
  return header(t('panel.stats')) +
    '<div class="meta-stat-grid">' + items.map(function(item){
      return '<div class="meta-stat-box"><b>' + esc(item[1]) + '</b><span>' + esc(t(item[0])) + '</span></div>';
    }).join('') + '</div>' +
    '<h3 class="meta-subhead">' + esc(t('stats.modes')) + '</h3>' +
    '<div class="meta-stat-grid">' + (modes || '<p class="meta-empty">—</p>') + '</div>';
}

function renderSettings(){
  var s = P.data.settings;
  var select = function(id, key, options){
    return '<select id="' + id + '" data-setting="' + key + '">' + options.map(function(o){
      return '<option value="' + esc(o[0]) + '"' + (s[key] === o[0] ? ' selected' : '') + '>' + esc(o[1]) + '</option>';
    }).join('') + '</select>';
  };
  var toggle = function(key, label){
    return '<label class="meta-toggle"><span>' + esc(t(label)) + '</span>' +
      '<input type="checkbox" data-setting="' + key + '"' + (s[key] ? ' checked' : '') + '></label>';
  };
  return header(t('panel.settings')) +
    '<div class="meta-settings">' +
      '<label class="meta-field"><span>' + esc(t('setting.language')) + '</span>' +
        select('meta-lang', 'language', [['en','English'],['it','Italiano']]) + '</label>' +
      '<label class="meta-field"><span>' + esc(t('setting.textSize')) + '</span>' +
        select('meta-text', 'textSize', [['normal',t('text.normal')],['large',t('text.large')]]) + '</label>' +
      toggle('sound', 'setting.sound') +
      toggle('haptics', 'setting.haptics') +
      toggle('reducedMotion', 'setting.reducedMotion') +
      toggle('contrast', 'setting.contrast') +
      '<button class="meta-btn ghost" data-action="reset">' + esc(t('action.reset')) + '</button>' +
    '</div>';
}

function renderContracts(){
  var box = function(key, label){
    return '<label class="meta-toggle"><span>' + esc(t(label)) + '</span>' +
      '<input type="checkbox" data-modifier="' + key + '"' + (contractChoices[key] ? ' checked' : '') + '></label>';
  };
  return header(t('panel.contracts')) +
    '<p class="meta-desc big">' + esc(t('contract.desc')) + '</p>' +
    '<div class="meta-settings">' +
      box('time', 'contract.time') + box('tremor', 'contract.tremor') +
      box('vision', 'contract.vision') + box('double', 'contract.double') +
    '</div>' +
    '<button class="meta-btn primary wide" data-action="start-contract">' + esc(t('action.start')) + '</button>';
}

function onClick(event){
  var target = event.target.closest('[data-action]');
  if(!target) return;
  var action = target.getAttribute('data-action');
  if(action === 'close'){ close(); return; }
  if(action === 'tab'){ activeTab = target.getAttribute('data-tab'); render(); return; }
  if(action === 'claim'){
    if(M.claim(target.getAttribute('data-id'))){ render(); showToast('✓'); }
    return;
  }
  if(action === 'reset'){ P.reset(); render(); return; }
  if(action === 'start-contract'){
    var mods = Object.assign({}, contractChoices);
    if(!mods.time && !mods.tremor && !mods.vision && !mods.double) mods = null;
    window.SCALPEL_META.setModifiers(mods);
    close();
    window.dispatchEvent(new CustomEvent('scalpel:meta:command', { detail: { command: 'showChapters' } }));
    showToast(t('contract.active') + ': ' + (mods ? Object.keys(mods).filter(function(k){ return mods[k]; }).join(', ') : t('contract.none')));
  }
}

function onChange(event){
  var el = event.target;
  var setting = el.getAttribute('data-setting');
  if(setting){
    var value = el.type === 'checkbox' ? el.checked : el.value;
    P.setSetting(setting, value);
    applySettings();
    return;
  }
  var modifier = el.getAttribute('data-modifier');
  if(modifier) contractChoices[modifier] = el.checked;
}

function applySettings(){
  var s = P.data.settings;
  var html = document.documentElement;
  html.classList.toggle('meta-reduced', !!s.reducedMotion);
  html.classList.toggle('meta-contrast', !!s.contrast);
  html.classList.toggle('meta-large', s.textSize === 'large');
  if(window.SCALPEL_META_I18N && window.SCALPEL_META_I18N.getLang() !== s.language){
    window.SCALPEL_META_I18N.setLang(s.language);
  }
}

function showToast(text){
  var el = document.createElement('div');
  el.className = 'meta-toast';
  el.textContent = text;
  document.body.appendChild(el);
  setTimeout(function(){ el.classList.add('show'); }, 10);
  setTimeout(function(){ el.remove(); }, 2600);
}

function setupMenuHooks(){
  document.addEventListener('click', function(event){
    var id = event.target && event.target.id;
    var map = {
      'btn-missions': 'missions', 'btn-profile': 'profile', 'btn-contracts': 'contracts',
      'btn-stats': 'stats', 'btn-settings': 'settings'
    };
    if(map[id]){ event.preventDefault(); open(map[id]); }
  });
}

function setupResultsShare(){
  var overlay = document.getElementById('overlay');
  if(!overlay || !window.MutationObserver) return;
  var observer = new MutationObserver(function(){
    var card = document.getElementById('results-card');
    if(card && !card.querySelector('.meta-share-btn')){
      var btn = document.createElement('button');
      btn.className = 'meta-share-btn';
      btn.type = 'button';
      btn.textContent = '📤 ' + t('action.share');
      btn.addEventListener('click', shareResult);
      card.appendChild(btn);
    }
  });
  observer.observe(overlay, { childList: true, subtree: true });
}

function shareResult(){
  var card = document.getElementById('results-card');
  if(!card) return;
  var text = card.textContent.replace(/\s+/g, ' ').trim().slice(0, 180);
  var payload = {
    title: t('share.title'),
    text: t('share.text', { score: (lastResult && lastResult.score) || '—', acc: (lastResult && lastResult.accuracy) || '—' }) + '\n' + text
  };
  if(navigator.share){
    navigator.share(payload).then(function(){ showToast(t('share.success')); })
      .catch(function(){ showToast(t('share.fail')); });
  } else if(navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(payload.title + '\n' + payload.text)
      .then(function(){ showToast(t('share.success')); })
      .catch(function(){ showToast(t('share.fail')); });
  } else {
    showToast(t('share.fail'));
  }
}

window.SCALPEL_META_UI = {
  init: function(){
    applySettings();
    setupMenuHooks();
    setupResultsShare();
    window.addEventListener('scalpel:meta:update', function(){ if(activePanel) render(); });
    window.addEventListener('scalpel:event', function(event){
      if(event.detail && event.detail.type === 'runComplete') lastResult = event.detail;
    });
    window.SCALPEL_META_I18N.onLangChange(function(){ applySettings(); if(activePanel) render(); });
  },
  open: open,
  close: close,
  toast: showToast,
  applySettings: applySettings
};
})();
