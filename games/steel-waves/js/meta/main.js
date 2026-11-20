/* Steel Waves — bootstrap del layer meta e della PWA */
(function(){
'use strict';

function setupPwa(){
  var btn = document.createElement('button');
  btn.className = 'sw-install hidden';
  btn.type = 'button';
  btn.textContent = '⬇ Installa';
  document.body.appendChild(btn);
  var offline = document.createElement('div');
  offline.className = 'sw-offline hidden';
  offline.textContent = '⚡ Offline';
  document.body.appendChild(offline);

  var deferred = null;
  window.addEventListener('beforeinstallprompt', function(e){
    e.preventDefault(); deferred = e; btn.classList.remove('hidden');
  });
  btn.addEventListener('click', function(){
    if(!deferred) return;
    deferred.prompt();
    try{ deferred.userChoice.finally(function(){ btn.classList.add('hidden'); deferred = null; }); }
    catch(e){ btn.classList.add('hidden'); deferred = null; }
  });
  window.addEventListener('appinstalled', function(){ btn.classList.add('hidden'); });

  function connection(){ offline.classList.toggle('hidden', navigator.onLine !== false); }
  window.addEventListener('online', connection);
  window.addEventListener('offline', connection);
  connection();

  if('serviceWorker' in navigator){
    navigator.serviceWorker.register('./sw.js').then(function(reg){
      reg.addEventListener('updatefound', function(){
        var worker = reg.installing;
        if(!worker) return;
        worker.addEventListener('statechange', function(){
          if(worker.state === 'installed' && navigator.serviceWorker.controller){
            var bar = document.createElement('div');
            bar.className = 'sw-update';
            bar.innerHTML = '<span>Nuova versione disponibile</span><button type="button">Aggiorna</button>';
            bar.querySelector('button').addEventListener('click', function(){
              worker.postMessage({ type:'SKIP_WAITING' }); bar.remove();
            });
            document.body.appendChild(bar);
          }
        });
      });
    }).catch(function(){});
  }
}

function start(){
  if(!window.SW_META || !window.SW_GACHA || !window.SW_UI || !window.__sw) return;
  window.SW_I18N.setLang(window.SW_META.data.lang || 'it');
  window.SW_GACHA.bind(window.SW_META);
  window.SW_GACHA.registerShips();
  window.SW_META.syncBattle();
  window.SW_UI.init();
  setupPwa();
  try {
    var panel = new URLSearchParams(location.search).get('panel');
    if(panel && ['gacha','collection','missions','pass','stats','rank'].indexOf(panel) !== -1) window.SW_UI.open(panel);
  } catch(e){ /* ignore */ }
}

if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
else start();
})();
