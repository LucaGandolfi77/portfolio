/* Scalpel Meta — collegamento eventi motore ↔ profilo/missioni */
(function(){
'use strict';

var P = window.SCALPEL_META_PROFILE;
var M = window.SCALPEL_META_MISSIONS;
var modifiers = null;

function clearModifiers(){
  modifiers = null;
  try {
    var app = document.getElementById('app');
    if(app){
      app.classList.remove('contract-tremor');
      app.classList.remove('contract-lowvision');
    }
  } catch(e){ /* ignore */ }
}

window.addEventListener('scalpel:event', function(event){
  var detail = event.detail || {};
  P.recordEvent(detail);
  M.update(detail);

  if(detail.type === 'runComplete'){
    var multiplier = (modifiers && modifiers.double) ? 2 : 1;
    var bonus = modifiers ? 2 : 1;
    var xp = Math.max(20, Math.round(((detail.score || 0) / 10 + (detail.accuracy || 0) / 2) * multiplier * bonus));
    var credits = Math.max(5, Math.round((detail.score || 0) / 20 * multiplier * bonus));
    P.addXp(xp);
    P.addCredits(credits);
    clearModifiers();
  }

  try {
    window.dispatchEvent(new CustomEvent('scalpel:meta:update', { detail: { event: detail.type } }));
  } catch(e){ /* ignore */ }
});

window.SCALPEL_META = window.SCALPEL_META || {};
window.SCALPEL_META.getModifiers = function(){ return modifiers; };
window.SCALPEL_META.setModifiers = function(next){ modifiers = next || null; };
window.SCALPEL_META.clearModifiers = clearModifiers;
})();
