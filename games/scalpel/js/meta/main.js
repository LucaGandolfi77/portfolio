/* Scalpel Meta — bootstrap del layer */
(function(){
'use strict';

function setupPwa(){
  var installBtn = document.createElement('button');
  installBtn.className = 'meta-install-btn hidden';
  installBtn.type = 'button';
  installBtn.textContent = '⬇ Install';
  document.body.appendChild(installBtn);

  var offlineChip = document.createElement('div');
  offlineChip.className = 'meta-offline-chip hidden';
  offlineChip.textContent = '⚡ Offline';
  document.body.appendChild(offlineChip);

  var deferred = null;
  window.addEventListener('beforeinstallprompt', function(event){
    event.preventDefault();
    deferred = event;
    installBtn.classList.remove('hidden');
  });
  installBtn.addEventListener('click', function(){
    if(!deferred) return;
    deferred.prompt();
    try { deferred.userChoice.finally(function(){ installBtn.classList.add('hidden'); deferred = null; }); }
    catch(e){ installBtn.classList.add('hidden'); deferred = null; }
  });
  window.addEventListener('appinstalled', function(){ installBtn.classList.add('hidden'); });

  function connection(){ offlineChip.classList.toggle('hidden', navigator.onLine !== false); }
  window.addEventListener('online', connection);
  window.addEventListener('offline', connection);
  connection();

  if('serviceWorker' in navigator){
    navigator.serviceWorker.register('./sw.js').then(function(registration){
      registration.addEventListener('updatefound', function(){
        var worker = registration.installing;
        if(!worker) return;
        worker.addEventListener('statechange', function(){
          if(worker.state === 'installed' && navigator.serviceWorker.controller){
            var bar = document.createElement('div');
            bar.className = 'meta-update-bar';
            bar.innerHTML = '<span>Nuova versione disponibile</span><button type="button">Aggiorna</button>';
            bar.querySelector('button').addEventListener('click', function(){
              worker.postMessage({ type: 'SKIP_WAITING' });
              bar.remove();
            });
            document.body.appendChild(bar);
          }
        });
      });
    }).catch(function(){ /* PWA opzionale */ });
  }
}

function start(){
  var I = window.SCALPEL_META_I18N;
  var M = window.SCALPEL_META_MISSIONS;
  var UI = window.SCALPEL_META_UI;

  if(!I || !M || !UI) return;
  M.ensurePeriods();
  UI.init();
  UI.applySettings();
  try {
    var panel = new URLSearchParams(location.search).get('panel');
    if (panel && ['missions','contracts','stats','profile','settings'].indexOf(panel) !== -1) UI.open(panel);
  } catch (e) { /* ignore */ }

  setupPwa();
}

if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', start);
} else {
  start();
}
})();
