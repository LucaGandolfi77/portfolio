/* Steel Waves Meta — interfaccia gacha, collezione, missioni, pass, statistiche */
(function(){
'use strict';

var I = window.SW_I18N, G = window.SW_GACHA, P = window.SW_META;
var t = I.t;
var root = null, sheet = null, active = 'gacha', lastResults = null;

function esc(s){
  return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function ensureRoot(){
  if(root) return;
  root = document.createElement('div');
  root.className = 'sw-overlay hidden';
  root.innerHTML = '<div class="sw-backdrop" data-act="close"></div>' +
    '<div class="sw-sheet" id="sw-sheet"></div>';
  document.body.appendChild(root);
  root.addEventListener('click', onClick);
  sheet = document.getElementById('sw-sheet');
  setupMenu();
}

function setupMenu(){
  var head = document.querySelector('.head-row');
  if(!head || document.getElementById('sw-meta-row')) return;

  var chip = document.createElement('div');
  chip.className = 'sc sw-anchor-chip';
  chip.innerHTML = '<span>⚓</span><b id="sw-anchors">0</b>';
  var chips = document.querySelector('.stat-chips');
  if(chips) chips.appendChild(chip);

  var row = document.createElement('div');
  row.id = 'sw-meta-row';
  row.className = 'sw-meta-row';
  [['gacha','menu.gacha'],['collection','menu.collection'],['missions','menu.missions'],
   ['pass','menu.pass'],['stats','menu.stats'],['rank','menu.rank']].forEach(function(pair){
    var b = document.createElement('button');
    b.className = 'sw-meta-btn';
    b.setAttribute('data-open', pair[0]);
    b.textContent = t(pair[1]);
    row.appendChild(b);
  });
  head.parentNode.insertBefore(row, head.nextSibling);

  var challenge = document.createElement('button');
  challenge.className = 'btn gold sw-challenge-btn';
  challenge.setAttribute('data-open','challenge');
  challenge.textContent = '⚔️ ' + t('challenge.title');
  var cta = document.querySelector('.row-cta');
  if(cta) cta.appendChild(challenge);

  document.addEventListener('click', function(e){
    var target = e.target.closest('[data-open]');
    if(target){ e.preventDefault(); open(target.getAttribute('data-open')); }
  });
}

function refreshAnchors(){
  var el = document.getElementById('sw-anchors');
  if(el) el.textContent = (P.data.anchors || 0).toLocaleString('it-IT');
}

function open(panel){
  ensureRoot();
  active = panel;
  root.classList.remove('hidden');
  render();
}
function close(){ if(root) root.classList.add('hidden'); }

function head(title){
  return '<div class="sw-head"><h2>' + esc(title) + '</h2>' +
    '<button class="sw-close" data-act="close">✕</button></div>';
}

function shipCard(id, result){
  var ship = (window.__sw.SHIPS || []).filter(function(s){ return s.id === id; })[0] || {name:id,emoji:'🚢',cls:''};
  var rarity = G.rarityOf(id);
  var owned = !!P.data.owned[id];
  var res = P.data.resonance[id] || 0;
  var shards = P.data.shards[id] || 0;
  if(result){
    return '<div class="sw-result-card r-' + rarity + '" style="--delay:' + (result.index * 90) + 'ms">' +
      '<div class="sw-result-rarity">' + esc(t('rarity.' + rarity)) + '</div>' +
      '<div class="sw-result-ico">' + esc(ship.emoji) + '</div>' +
      '<div class="sw-result-name">' + esc(ship.name) + '</div>' +
      '<div class="sw-result-tag">' + esc(result.isNew ? t('gacha.new') : t('gacha.shards',{n:result.shards})) + '</div>' +
      '</div>';
  }
  return '<div class="sw-ship r-' + rarity + '">' +
    '<div class="sw-ship-ico">' + esc(ship.emoji) + '</div>' +
    '<div class="sw-ship-info"><b>' + esc(ship.name) + '</b>' +
    '<span>' + esc(ship.cls) + ' · ' + esc(t('rarity.' + rarity)) + '</span>' +
    '<span>' + esc(t('collection.resonance')) + ' ' + res + '/5 · ' + esc(t('collection.shards')) + ' ' + shards + '</span></div>' +
    (owned
      ? '<button class="sw-mini" data-act="enhance" data-id="' + esc(id) + '"' + (res>=5?' disabled':'') + '>' + esc(t('collection.enhance')) + '</button>'
      : '<span class="sw-locked">' + esc(t('collection.locked')) + '</span>') +
    '</div>';
}

function renderGacha(){
  var featured = G.bannerFeatured();
  var pityLeft = Math.max(0, 80 - P.data.pity);
  var free = P.data.dailyFree === '';
  return head(t('gacha.title')) +
    '<p class="sw-sub">' + esc(t('gacha.subtitle')) + '</p>' +
    '<div class="sw-banner"><div class="sw-banner-tag">' + esc(t('gacha.banner')) + '</div>' +
      '<div class="sw-banner-ship">' + esc(featured.emoji) + ' ' + esc(featured.name) + '</div>' +
      '<div class="sw-banner-desc">' + esc(t('gacha.rateup', { name: featured.name })) + ' · ' +
        esc(t('rarity.' + featured.rarity)) + '</div></div>' +
    '<div class="sw-pity">' + esc(t('gacha.pity', { n: pityLeft })) +
      (pityLeft <= 5 ? ' · <b>' + esc(t('gacha.guaranteed')) + '</b>' : '') + '</div>' +
    '<div class="sw-pull-row">' +
      '<button class="btn ghost" data-act="pull" data-count="1">' + esc(t('gacha.pull1')) + '<small>' + esc(t('gacha.cost1')) + '</small></button>' +
      '<button class="btn gold" data-act="pull" data-count="10">' + esc(t('gacha.pull10')) + '<small>' + esc(t('gacha.cost10')) + '</small></button>' +
    '</div>' +
    '<button class="sw-free" data-act="free"' + (free?'':' disabled') + '>' +
      (free ? esc(t('gacha.free')) : esc(t('gacha.freeUsed'))) + '</button>' +
    '<div class="sw-anchors-line">⚓ ' + (P.data.anchors||0).toLocaleString('it-IT') + '</div>';
}

function renderCollection(){
  var ids = Object.keys(G.RARITY);
  var owned = ids.filter(function(id){ return P.data.owned[id]; }).length;
  return head(t('collection.title')) +
    '<div class="sw-counts"><span>' + esc(t('collection.owned')) + ': <b>' + owned + '</b>/' + ids.length + '</span>' +
    '<span>⚓ ' + (P.data.anchors||0) + '</span></div>' +
    ((P.data.camos && P.data.camos.length) ? '<h3>' + esc(t('collection.skins')) + '</h3>' +
      '<div class="sw-camo-row">' + P.data.camos.map(function(idx){
        var camo = (window.__sw.CAMOS || [])[idx];
        if(!camo) return '';
        return '<button class="sw-camo" data-act="camo" data-idx="' + idx + '" title="' + esc(camo.name) + '">' +
          '<span style="background:' + camo.h + '"></span><b>' + esc(camo.name) + '</b></button>';
      }).join('') + '</div>' : '') +
    '<div class="sw-ships">' + ids.map(function(id){ return shipCard(id); }).join('') + '</div>';
}

function missionRows(list){
  return list.map(function(m){
    var key = m.id.indexOf('d_') === 0 ? 'mission.daily' : 'mission.weekly';
    var pct = m.target ? Math.round(m.progress / m.target * 100) : 0;
    return '<div class="sw-mission"><div class="sw-mission-top"><b>' + esc(t(key)) + '</b>' +
      '<span>' + esc(t('mission.progress',{a:m.progress,b:m.target})) + '</span></div>' +
      '<div class="sw-progress"><i style="width:' + pct + '%"></i></div>' +
      '<div class="sw-mission-foot"><span>⚓ ' + m.reward.anchors + '</span>' +
      (m.claimed ? '<span>' + esc(t('mission.claimed')) + '</span>'
        : '<button class="sw-mini" data-act="claim" data-id="' + m.id + '"' +
          (m.progress >= m.target ? '' : ' disabled') + '>' + esc(t('mission.claim')) + '</button>') +
      '</div></div>';
  }).join('');
}

function renderMissions(){
  P.checkPeriods();
  return head(t('mission.title')) +
    '<div class="sw-login">🎁 ' + esc(t('mission.login')) + ' — ' +
      esc(t('mission.loginStreak',{n:P.data.streak})) + '</div>' +
    '<h3>' + esc(t('mission.daily')) + '</h3>' + missionRows(P.missionList('daily')) +
    '<h3>' + esc(t('mission.weekly')) + '</h3>' + missionRows(P.missionList('weekly'));
}

function renderPass(){
  return head(t('pass.title')) +
    '<div class="sw-login">' + esc(t('pass.season')) + ': <b>' + (P.data.seasonXp||0) + '</b></div>' +
    '<div class="sw-ships">' + P.seasonList().map(function(m){
      var pct = Math.round(m.progress / m.target * 100);
      return '<div class="sw-mission"><div class="sw-mission-top"><b>' + esc(t('pass.tier',{n:m.tier})) + '</b>' +
        '<span>' + esc(t('mission.progress',{a:m.progress,b:m.target})) + '</span></div>' +
        '<div class="sw-progress"><i style="width:' + pct + '%"></i></div>' +
        '<div class="sw-mission-foot"><span>⚓ ' + m.reward.anchors + '</span>' +
        (m.claimed ? '<span>' + esc(t('mission.claimed')) + '</span>'
          : '<button class="sw-mini" data-act="claim-season" data-id="' + m.id + '"' +
            (m.progress >= m.target ? '' : ' disabled') + '>' + esc(t('pass.claim')) + '</button>') +
        '</div></div>';
    }).join('') + '</div>';
}

function renderStats(){
  var s = P.data.stats;
  var rows = [
    ['stats.battles', s.battles], ['stats.waves', s.waves], ['stats.kills', s.kills],
    ['stats.gold', s.gold], ['stats.pulls', P.data.pulls], ['stats.ssr', P.data.legendaries],
    ['stats.best', Math.max(1, P.data.stats.best || 0)]
  ];
  return head(t('stats.title')) +
    '<div class="sw-stat-grid">' + rows.map(function(r){
      return '<div class="sw-stat"><b>' + esc(r[1]) + '</b><span>' + esc(t(r[0])) + '</span></div>';
    }).join('') + '</div>';
}

function renderRank(){
  var list = P.data.leaderboard || [];
  return head(t('rank.title')) +
    (list.length ? '<div class="sw-ships">' + list.map(function(e,i){
      return '<div class="sw-rank"><b>#' + (i+1) + '</b><span>' + esc(t('rank.wave',{n:e.wave})) +
        '</span><span>' + esc(e.mode) + '</span><b>' + e.score + '</b></div>';
    }).join('') + '</div>' : '<p class="sw-sub">' + esc(t('rank.empty')) + '</p>');
}

function renderChallenge(){
  var rarities = ['R','SR','SSR','UR'];
  return head(t('challenge.title')) +
    '<p class="sw-sub">' + esc(t('challenge.desc')) + '</p>' +
    '<div class="sw-pull-row">' + rarities.map(function(r){
      return '<button class="btn ghost" data-act="challenge" data-rarity="' + r + '">' +
        esc(t('rarity.' + r)) + '<small>' + esc(t('challenge.reward',{n: 60 * (rarities.indexOf(r)+1)})) + '</small></button>';
    }).join('') + '</div>';
}

function render(){
  if(!sheet) return;
  var map = { gacha:renderGacha, collection:renderCollection, missions:renderMissions,
    pass:renderPass, stats:renderStats, rank:renderRank, challenge:renderChallenge };
  sheet.innerHTML = (map[active] || renderGacha)();
  refreshAnchors();
}

function reveal(results){
  ensureRoot();
  active = 'gacha';
  root.classList.remove('hidden');
  sheet.innerHTML = '<div class="sw-reveal">' +
    '<h2>' + esc(t('gacha.result')) + '</h2><div class="sw-reveal-cards">' +
    results.map(function(r,i){ r.index = i; return shipCard(r.id, r); }).join('') +
    '</div><button class="btn primary" data-act="close-reveal">' + esc(t('gacha.continue')) + '</button></div>';
  refreshAnchors();
}

function doPull(count, free){
  P.checkPeriods();
  if(!free && P.data.anchors < (count === 1 ? 160 : 1600)){
    window.__sw.toast(t('gacha.needAnchors')); return;
  }
  if(!P.payPull(count)) return;
  var result = G.pull(count);
  P.syncBattle();
  reveal(result.results);
}

function onClick(e){
  var act = e.target.closest('[data-act]');
  if(!act) return;
  var action = act.getAttribute('data-act');
  if(action === 'close' || action === 'close-reveal'){ close(); render(); return; }
  if(action === 'pull'){ doPull(Number(act.getAttribute('data-count')), false); return; }
  if(action === 'free'){ doPull(1, true); return; }
  if(action === 'enhance'){
    if(P.enhance(act.getAttribute('data-id'))) render();
    else window.__sw.toast(t('collection.needShards'));
    return;
  }
  if(action === 'camo'){
    var idx = Number(act.getAttribute('data-idx'));
    if(window.__sw.profile){ window.__sw.profile.camo = idx; window.__sw.saveProfile(); window.__sw.buildCamos(); }
    window.__sw.toast(t('collection.skins') + ' ✓');
    return;
  }
  if(action === 'claim'){ if(P.claimMission(act.getAttribute('data-id'))) render(); return; }
  if(action === 'claim-season'){ if(P.claimSeason(act.getAttribute('data-id'))) render(); return; }
  if(action === 'challenge'){
    var rarity = act.getAttribute('data-rarity');
    var owned = Object.keys(P.data.owned).filter(function(id){ return G.rarityOf(id) === rarity; });
    if(!owned.length){ window.__sw.toast(t('collection.locked')); return; }
    P.data.owned[owned[0]] = 1;
    if(window.__sw.profile){ window.__sw.profile.sel = owned[0]; window.__sw.saveProfile(); }
    close();
    window.__sw.startBattle();
    window.__sw.toast(t('challenge.reward',{n:60*(['R','SR','SSR','UR'].indexOf(rarity)+1)}));
    return;
  }
}

window.SW_UI = {
  init: function(){
    I.onLangChange(function(){ setupMenu(); render(); });
    window.addEventListener('steelwaves:event', function(e){
      if(e.detail && e.detail.type === 'battleEnd'){
        var reward = P.recordBattle(e.detail);
        window.__sw.toast('⚓ +' + reward.anchors);
      }
      refreshAnchors();
    });
    P.checkPeriods();
    setupMenu();
    refreshAnchors();
  },
  open: open, close: close, render: render
};
})();
