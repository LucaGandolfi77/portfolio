/* CelloOS — Cello browser app (1994 web + live modem) */
(function () {
  'use strict';
  var O = window.CelloOS = window.CelloOS || {};
  var counter = 0;
  var PAGES = O.pages || [];

  function findPage(path) {
    for (var i = 0; i < PAGES.length; i++) if (PAGES[i].url === path) return PAGES[i];
    return null;
  }

  function create(root, win) {
    var s = 'cello-' + (++counter);
    var id = function (n) { return n + '-' + s; };
    var $ = function (n) { return root.querySelector('#' + id(n)); };

    root.innerHTML =
      '<div class="cello-app">' +
        '<div class="cello-menu"><span>File</span><span>Modifica</span><span>Naviga</span><span>Preferiti</span><span>Aiuto</span></div>' +
        '<div class="cello-toolbar">' +
          '<button class="cello-tool" data-act="home" title="Home">🏠</button>' +
          '<button class="cello-tool" data-act="back" title="Indietro">◀</button>' +
          '<button class="cello-tool" data-act="fwd" title="Avanti">▶</button>' +
          '<button class="cello-tool" data-act="reload" title="Ricarica">⟳</button>' +
          '<input class="cello-location" data-el="location" spellcheck="false" autocomplete="off">' +
          '<button class="cello-tool" data-act="go" title="Vai">Go</button>' +
          '<button class="cello-tool" data-el="fav" data-act="fav" title="Preferiti">☆</button>' +
          '<button class="cello-tool" data-act="live" title="Modem Live">📡</button>' +
        '</div>' +
        '<div class="cello-page" data-el="page"></div>' +
        '<div class="cello-status"><span data-el="addr">http://cello.94/</span><span class="grow"></span>' +
          '<span data-el="state">Pronto</span><span class="progress hidden" data-el="pwrap"><i data-el="progress"></i></span>' +
          '<span data-el="count"></span></div>' +
        '<div class="cello-mobile">' +
          '<button data-act="back">◀</button><button data-act="fwd">▶</button>' +
          '<button data-act="home">🏠</button><button data-act="live">📡</button></div>' +
        '<div id="' + id('modal') + '" class="os-modal hidden">' +
          '<div class="os-dialog" style="width:min(560px,94%)">' +
            '<div class="os-dialog-title">📡 Modem Live — connessione 28.8 kbps</div>' +
            '<div class="os-dialog-body">' +
              '<div style="display:flex;gap:6px"><input class="cello-location" data-el="liveurl" placeholder="https://esempio.com">' +
              '<button class="os-btn primary" data-act="livego">Connetti</button></div>' +
              '<label style="display:flex;gap:6px;align-items:center;margin:10px 0;font-size:11px">' +
              '<input type="checkbox" data-el="livesound" checked> Suono modem</label>' +
              '<div class="cello-page" style="height:min(46vh,360px);background:#fff" data-el="liveresult"></div>' +
            '</div>' +
            '<div class="os-dialog-actions"><button class="os-btn" data-act="liveclose">Chiudi</button></div>' +
          '</div></div>' +
      '</div>';

    var elLocation = $('location'), elPage = $('page'), elAddr = $('addr'), elState = $('state');
    var elPwrap = $('pwrap'), elProgress = $('progress'), elCount = $('count');
    var elModal = root.querySelector('#' + id('modal'));
    var elLiveUrl = $('liveurl'), elLiveResult = $('liveresult');

    var history = [], historyIdx = -1, pageCount = 0, audioCtx = null;
    try { pageCount = parseInt(localStorage.getItem('cello.browser.pageCount'), 10) || 0; } catch (e) {}
    try { history = JSON.parse(localStorage.getItem('cello.browser.history') || 'null') || []; } catch (e) {}
    if (!history.length) history = [{ url: '/', title: 'Welcome to the World-Wide Web!' }];
    historyIdx = history.length - 1;

    function bookmarks() {
      try { return new Set(JSON.parse(localStorage.getItem('cello.browser.bookmarks') || '[]')); } catch (e) { return new Set(); }
    }
    function currentUrl() { return history.length ? history[historyIdx].url : '/'; }
    function soundOn() {
      return !!(O.state.get().sound && $('livesound') && $('livesound').checked);
    }
    function notify(text, kind) { O.bus.emit('notify', { text: text, kind: kind }); }

    function modemSound() {
      if (!soundOn()) return;
      try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        var o = audioCtx.createOscillator(), g = audioCtx.createGain();
        o.type = 'square'; o.connect(g); g.connect(audioCtx.destination);
        var t = audioCtx.currentTime;
        o.frequency.setValueAtTime(1200, t);
        o.frequency.setValueAtTime(2200, t + .1);
        o.frequency.setValueAtTime(1200, t + .2);
        g.gain.setValueAtTime(.07, t); g.gain.linearRampToValueAtTime(0, t + .35);
        o.start(t); o.stop(t + .35);
      } catch (e) {}
    }

    function setStatus(state, addr) {
      elState.textContent = state || '';
      if (addr !== undefined) elAddr.textContent = addr;
      elCount.textContent = pageCount + ' pagine';
    }
    function progress(pct) {
      if (pct === null) { elPwrap.classList.add('hidden'); return; }
      elPwrap.classList.remove('hidden'); elProgress.style.width = pct + '%';
    }
    function fakeLoad() {
      progress(0); var i = 0;
      var iv = setInterval(function () { i = Math.min(i + 8 + Math.floor(Math.random() * 12), 90); elProgress.style.width = i + '%'; }, 120);
      setTimeout(function () { clearInterval(iv); elProgress.style.width = '100%'; setTimeout(function () { progress(null); setStatus('Done'); }, 180); }, 300 + Math.random() * 400);
    }
    function render(page) { O.html.renderHTML(elPage, page.html, currentUrl()); }

    function navigate(path, opts) {
      opts = opts || {};
      var page = findPage(path) || findPage('/404');
      if (!page) return;
      if (!opts.replace) {
        if (historyIdx < history.length - 1) history = history.slice(0, historyIdx + 1);
        history.push({ url: path, title: page.title }); historyIdx = history.length - 1;
        try { localStorage.setItem('cello.browser.history', JSON.stringify(history.slice(-50))); } catch (e) {}
        pageCount++;
        try { localStorage.setItem('cello.browser.pageCount', String(pageCount)); } catch (e) {}
      }
      win.titleEl.textContent = page.title;
      render(page); setStatus('Done', page.url);
      var b = bookmarks(); $('fav').textContent = b.has(page.url) ? '★' : '☆';
      elLocation.value = page.url; elPage.scrollTop = 0;
      modemSound();
      if (opts.load) fakeLoad();
    }
    function go(delta) {
      var i = historyIdx + delta;
      if (i < 0 || i >= history.length) return;
      historyIdx = i;
      var page = findPage(history[i].url);
      if (page) { render(page); win.titleEl.textContent = page.title; }
      setStatus('Done', history[i].url);
      elLocation.value = history[i].url;
    }
    function locationGo() {
      var raw = elLocation.value.trim(); if (!raw) return;
      var url = !/^https?:\/\//i.test(raw) && raw.indexOf(':') === -1 ? 'http://' + raw : raw;
      var path = null;
      for (var i = 0; i < PAGES.length; i++) {
        if (PAGES[i].url === raw || url.indexOf(PAGES[i].url) !== -1) { path = PAGES[i].url; break; }
      }
      if (path) navigate(path, { load: true }); else modemLive(url);
    }
    function closeModal() { elModal.classList.add('hidden'); elLiveResult.innerHTML = ''; progress(null); }
    function modemLive(url) {
      elLiveUrl.value = url;
      elLiveResult.innerHTML = '<p>🛰️ Connessione in corso…</p>';
      elModal.classList.remove('hidden');
      setStatus('Connessione…'); progress(0); modemSound();
      setTimeout(function () {
        setStatus('Busy signal…');
        var opts = {};
        if (window.AbortSignal && AbortSignal.timeout) opts.signal = AbortSignal.timeout(8000);
        fetch('https://r.jina.ai/' + encodeURIComponent(url), opts)
          .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.text(); })
          .then(function (md) {
            progress(100); setStatus('Done');
            elLiveResult.innerHTML = '<div class="page">' + O.html.mdToHtml(md) + '</div>';
            if (historyIdx < history.length - 1) history = history.slice(0, historyIdx + 1);
            history.push({ url: url, title: 'Live: ' + url }); historyIdx = history.length - 1;
            win.titleEl.textContent = 'Live: ' + url;
            setStatus('Done', url + ' (Live)');
            notify('Connesso via modem: ' + url, 'ok');
          })
          .catch(function () {
            progress(0); setStatus('No answer');
            elLiveResult.innerHTML = '<div class="page"><h1>No answer.</h1><p><b>Busy signal.</b> Host irraggiungibile o linea occupata.</p><p><a href="/">Home</a></p></div>';
            notify('Connessione fallita', 'error');
          });
      }, 350 + Math.random() * 250);
    }

    root.addEventListener('click', function (e) {
      var a = e.target.closest('a[href]');
      if (a && elPage.contains(a)) {
        e.preventDefault();
        var href = a.getAttribute('href');
        if (/^https?:\/\//i.test(href)) { modemLive(href); return; }
        navigate(href.split('#')[0], { load: true });
        return;
      }
      var btn = e.target.closest('[data-act]');
      if (!btn) return;
      var act = btn.dataset.act;
      if (act === 'home') navigate('/', { load: true });
      else if (act === 'back') go(-1);
      else if (act === 'fwd') go(1);
      else if (act === 'reload') navigate(currentUrl(), { load: true, replace: true });
      else if (act === 'go') locationGo();
      else if (act === 'fav') {
        var set = bookmarks(), u = currentUrl();
        if (set.has(u)) { set.delete(u); notify('Rimosso dai Preferiti'); }
        else { set.add(u); notify('Aggiunto ai Preferiti'); }
        try { localStorage.setItem('cello.browser.bookmarks', JSON.stringify([...set])); } catch (er) {}
        btn.textContent = set.has(u) ? '★' : '☆';
      }
      else if (act === 'live') { elModal.classList.remove('hidden'); elLiveUrl.focus(); }
      else if (act === 'livego') { var u = elLiveUrl.value.trim(); if (u) modemLive(u); }
      else if (act === 'liveclose') closeModal();
    });
    elLocation.addEventListener('keydown', function (e) { if (e.key === 'Enter') locationGo(); });
    elLiveUrl.addEventListener('keydown', function (e) { if (e.key === 'Enter') { var u = elLiveUrl.value.trim(); if (u) modemLive(u); } });
    elModal.addEventListener('click', function (e) { if (e.target === elModal) closeModal(); });

    setStatus('Pronto');
    navigate(history[historyIdx].url, { replace: true });
    var offNav = O.bus.on('browser:nav', function (d) { go(d.delta); });
    return {
      navigate: navigate, currentUrl: currentUrl,
      destroy: function () { offNav(); if (audioCtx) try { audioCtx.close(); } catch (e) {} }
    };
  }

  O.wm.register('browser', { title: 'Cello — World Wide Web', icon: '🌐', create: create });
}());
