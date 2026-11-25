/* ============================================================
   Style engine — cambia l'intero stile della home.

   Uno stile = token CSS + regole firma (assets/css/styles/<nome>.css)
   + un modulo di animazioni opzionale (qui sotto, MODULES).
   Il bootstrap in <head> (index.html) applica lo stile salvato prima
   del primo paint; questo file aggiunge il selettore nella barra in
   alto, il caricamento su richiesta di CSS e font, la transizione tra
   stili (View Transitions API) e le animazioni di ingresso.

   Accessibilità: con prefers-reduced-motion niente transizioni,
   niente macchina da scrivere, niente animazioni di ingresso: ogni
   stile mostra direttamente il proprio stato finale.
   ============================================================ */
(function () {
  'use strict';

  var root = document.documentElement;
  var BASE = window.PORTFOLIO_STYLES || { classic: { theme: null } };
  var KEY = 'portfolio-style';

  var META = {
    classic:   { label: 'Classic',     desc: 'Clean and readable, light or dark',          swatch: 'linear-gradient(135deg,#0a0d0b 50%,#b3e836 50%)' },
    business:  { label: 'Business',    desc: 'Professional profile for recruiters',        swatch: 'linear-gradient(135deg,#f8fafc 50%,#1e3a5f 50%)' },
    glass:     { label: 'Liquid Glass', desc: 'Frosted glass, aurora and a bento grid',     swatch: 'linear-gradient(135deg,#22d3ee,#c6f25a 55%,#0a0d18 56%)' },
    terminal:  { label: 'Terminal',    desc: 'The home page as a shell session',           swatch: 'linear-gradient(135deg,#050805 55%,#b3e836 56%)' },
    arcade:    { label: 'Arcade',      desc: 'Pixel type, scores and stages',              swatch: 'linear-gradient(135deg,#1b1036 55%,#ffd23f 56%)' },
    newspaper: { label: 'Newspaper',   desc: 'A front page with columns and rules',        swatch: 'linear-gradient(135deg,#f3efe6 55%,#8a1c1c 56%)' },
    fashion:   { label: 'Fashion',     desc: 'A magazine cover with a numbered contents',  swatch: 'linear-gradient(135deg,#fbf8f6 55%,#be185d 56%)' }
  };
  var ORDER = ['classic', 'business', 'glass', 'terminal', 'arcade', 'newspaper', 'fashion'];

  var reduce = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
  function motionOK() { return !reduce.matches; }
  function store(key, value) {
    try { if (value === undefined) return localStorage.getItem(key); localStorage.setItem(key, value); }
    catch (e) { return null; }
  }

  var current = root.getAttribute('data-style') || 'classic';

  /* ---------------- loading CSS + fonts on demand ---------------- */
  function loadLink(id, href) {
    var el = document.getElementById(id);
    if (el) return Promise.resolve();
    el = document.createElement('link');
    el.rel = 'stylesheet'; el.id = id; el.href = href;
    var p = new Promise(function (res) { el.onload = res; el.onerror = res; });
    document.head.appendChild(el);
    return p;
  }
  function ensureStyle(name) {
    if (name === 'classic') return Promise.resolve();
    var cfg = BASE[name] || {};
    var css = loadLink('style-sheet-' + name, './assets/css/styles/' + name + '.css');
    var fonts = cfg.fonts
      ? loadLink('style-fonts-' + name, 'https://fonts.googleapis.com/css2?' + cfg.fonts + '&display=swap')
          .then(function () { return document.fonts && document.fonts.ready; })
      : Promise.resolve();
    // Il CSS dello stile è indispensabile; i font possono arrivare dopo.
    return Promise.all([css, Promise.race([fonts, wait(900)])]);
  }
  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  /* ---------------- per-style motion modules ---------------- */
  /* Terminal: il titolo vero (h1) resta intatto e leggibile dagli screen
     reader; la macchina da scrivere scrive in una copia aria-hidden. Le
     traduzioni (data-i18n) riscrivono l'h1 dopo il caricamento: un
     MutationObserver riallinea la copia e ricomincia a scrivere. */
  var typingTimer = null, typingObserver = null;
  function typeInto(target, text) {
    clearTimeout(typingTimer);
    var out = target.querySelector('.style-typed__text');
    if (!motionOK()) { out.textContent = text; return; }
    var i = 0;
    out.textContent = '';
    (function step() {
      out.textContent = text.slice(0, ++i);
      if (i < text.length) typingTimer = setTimeout(step, i < 8 ? 70 : 32);
    })();
  }
  /* Business: pulsante "Print / PDF" accanto al CV e i link al catalogo
     (nascosto in questo stile) portati alla pagina dei progetti. */
  var MODULES = {
    business: {
      start: function () {
        var group = document.querySelector('.header .cta-group');
        if (group && !document.getElementById('printProfile')) {
          var b = document.createElement('button');
          b.type = 'button';
          b.id = 'printProfile';
          b.className = 'btn btn-ghost';
          b.textContent = 'Print / PDF';
          b.addEventListener('click', function () { window.print(); });
          group.appendChild(b);
        }
        Array.prototype.forEach.call(document.querySelectorAll('a[href="#projects"]'), function (a) {
          a.setAttribute('data-style-href', '#projects');
          a.setAttribute('href', 'projects.html');
        });
        // Foto professionale solo in questo stile (anche in stampa/PDF).
        var img = document.getElementById('profileImg');
        if (img && !img.hasAttribute('data-style-src')) {
          img.setAttribute('data-style-src', img.getAttribute('src') || '');
          img.setAttribute('data-style-srcset', img.getAttribute('srcset') || '');
          img.setAttribute('srcset', './assets/profile/business-200.webp 200w, ./assets/profile/business-400.webp 400w, ./assets/profile/business-800.webp 800w');
          img.setAttribute('src', './assets/profile/business-400.webp');
        }
      },
      stop: function () {
        var b = document.getElementById('printProfile');
        if (b) b.remove();
        Array.prototype.forEach.call(document.querySelectorAll('a[data-style-href]'), function (a) {
          a.setAttribute('href', a.getAttribute('data-style-href'));
          a.removeAttribute('data-style-href');
        });
        var img = document.getElementById('profileImg');
        if (img && img.hasAttribute('data-style-src')) {
          img.setAttribute('srcset', img.getAttribute('data-style-srcset'));
          img.setAttribute('src', img.getAttribute('data-style-src'));
          img.removeAttribute('data-style-src');
          img.removeAttribute('data-style-srcset');
        }
      }
    },
    terminal: {
      start: function () {
        var h = document.querySelector('.header .title');
        if (!h || document.querySelector('.style-typed')) return;
        var copy = document.createElement('p');
        copy.className = 'style-typed';
        copy.setAttribute('aria-hidden', 'true');
        copy.innerHTML = '<span class="style-typed__text"></span><span class="style-caret"></span>';
        h.insertAdjacentElement('afterend', copy);
        typeInto(copy, h.textContent.trim());
        if (window.MutationObserver) {
          typingObserver = new MutationObserver(function () { typeInto(copy, h.textContent.trim()); });
          typingObserver.observe(h, { childList: true, characterData: true, subtree: true });
        }
      },
      stop: function () {
        clearTimeout(typingTimer);
        if (typingObserver) { typingObserver.disconnect(); typingObserver = null; }
        var copy = document.querySelector('.style-typed');
        if (copy) copy.remove();
      }
    },
    arcade: {
      start: function () {
        var img = document.getElementById('profileImg');
        var box = img && img.parentNode;
        if (!box || box.querySelector('.style-pixel-avatar')) return;
        var cv = document.createElement('canvas');
        cv.width = 36; cv.height = 36;
        cv.className = 'style-pixel-avatar'; cv.setAttribute('aria-hidden', 'true');
        box.appendChild(cv);
        var draw = function () {
          try { cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height); } catch (e) { /* immagine non pronta */ }
        };
        if (img.complete && img.naturalWidth) draw(); else img.addEventListener('load', draw, { once: true });
      },
      stop: function () {
        var cv = document.querySelector('.style-pixel-avatar');
        if (cv) cv.remove();
      }
    }
  };

  /* ---------------- entrance choreography ---------------- */
  var ENTER = {
    classic:   { frames: [{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'none' }], duration: 420, stagger: 70, easing: 'cubic-bezier(.2,.8,.2,1)' },
    business:  { frames: [{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], duration: 320, stagger: 50, easing: 'ease-out' },
    glass:     { frames: [{ opacity: 0, transform: 'scale(.97)', filter: 'blur(6px)' }, { opacity: 1, transform: 'none', filter: 'none' }], duration: 620, stagger: 90, easing: 'cubic-bezier(.34,1.56,.64,1)' },
    terminal:  { frames: [{ opacity: 0, clipPath: 'inset(0 0 100% 0)' }, { opacity: 1, clipPath: 'inset(0 0 0 0)' }], duration: 260, stagger: 60, easing: 'steps(6, end)' },
    arcade:    { frames: [{ opacity: 0, transform: 'translateY(24px)' }, { opacity: 1, transform: 'none' }], duration: 360, stagger: 110, easing: 'steps(4, end)' },
    newspaper: { frames: [{ opacity: 0 }, { opacity: 1 }], duration: 700, stagger: 140, easing: 'ease-out' },
    fashion:   { frames: [{ opacity: 0, transform: 'translateY(30px)' }, { opacity: 1, transform: 'none' }], duration: 1100, stagger: 160, easing: 'cubic-bezier(.22,1,.36,1)' }
  };
  function enter(name) {
    if (!motionOK() || !Element.prototype.animate) return;
    var cfg = ENTER[name] || ENTER.classic;
    var items = Array.prototype.slice.call(document.querySelectorAll(
      '.style-masthead, .style-cover, .style-termbar, .header, .container > .section, .container > section, .proof-strip'));
    var vh = window.innerHeight, n = 0;
    items.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (!r.height || r.bottom < 0 || r.top > vh) return;
      el.animate(cfg.frames, { duration: cfg.duration, delay: n++ * cfg.stagger, easing: cfg.easing, fill: 'backwards' });
    });
  }

  /* ---------------- applying a style ---------------- */
  function userTheme() { return store('theme') === 'light' ? 'light' : 'dark'; }
  function setTheme(theme) {
    if (theme === 'light') root.setAttribute('data-theme', 'light');
    else root.removeAttribute('data-theme');
  }
  function apply(name) {
    if (MODULES[current] && current !== name) MODULES[current].stop();
    current = name;
    if (name === 'classic') root.removeAttribute('data-style');
    else root.setAttribute('data-style', name);
    var fixed = (BASE[name] || {}).theme;
    setTheme(fixed || userTheme());
    var themeBtn = document.getElementById('themeToggle');
    if (themeBtn) {
      themeBtn.hidden = !!fixed;
      themeBtn.innerHTML = root.getAttribute('data-theme') === 'light' ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
    }
    if (MODULES[name]) MODULES[name].start();
    syncPicker();
  }
  function remember(name) {
    store(KEY, name);
    try {
      var url = new URL(location.href);
      url.searchParams.delete('mode');
      if (name === 'classic') url.searchParams.delete('style'); else url.searchParams.set('style', name);
      history.replaceState(history.state, '', url);
    } catch (e) { /* URL non modificabile: la scelta resta comunque salvata */ }
  }
  function choose(name, x, y) {
    if (!BASE.hasOwnProperty(name) || !META[name]) return;
    remember(name);
    if (name === current) return;
    ensureStyle(name).then(function () {
      root.style.setProperty('--vt-x', (x == null ? innerWidth / 2 : x) + 'px');
      root.style.setProperty('--vt-y', (y == null ? 0 : y) + 'px');
      root.setAttribute('data-vt', name);
      var swap = function () { apply(name); };
      if (document.startViewTransition && motionOK()) {
        var t = document.startViewTransition(swap);
        t.finished.then(function () { enter(name); }, function () { enter(name); });
      } else {
        swap();
        enter(name);
      }
    });
  }

  /* ---------------- picker UI ---------------- */
  var trigger = null, panel = null;
  function buildPicker() {
    var bar = document.querySelector('.top-bar-right');
    if (!bar || document.getElementById('styleToggle')) return;

    trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.id = 'styleToggle';
    trigger.className = 'top-bar-btn';
    trigger.setAttribute('aria-haspopup', 'dialog');
    trigger.setAttribute('aria-expanded', 'false');
    trigger.setAttribute('aria-controls', 'stylePicker');
    trigger.innerHTML = '<i class="fas fa-palette" aria-hidden="true"></i> <span class="btn-text">Style</span>';
    trigger.title = 'Change the style of the page';
    var themeBtn = document.getElementById('themeToggle');
    bar.insertBefore(trigger, themeBtn || bar.firstChild);

    panel = document.createElement('div');
    panel.id = 'stylePicker';
    panel.className = 'style-picker';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Page style');
    panel.hidden = true;
    var html = '<p class="style-picker__title">Page style</p><div class="style-picker__list" role="radiogroup" aria-label="Page style">';
    ORDER.forEach(function (name) {
      var m = META[name];
      html += '<button type="button" role="radio" class="style-picker__opt" data-style-opt="' + name + '">' +
        '<span class="style-picker__swatch" style="background:' + m.swatch + '" aria-hidden="true"></span>' +
        '<span class="style-picker__text"><strong>' + m.label + '</strong><small>' + m.desc + '</small></span></button>';
    });
    html += '</div>';
    panel.innerHTML = html;
    document.body.appendChild(panel);

    trigger.addEventListener('click', function () { panel.hidden ? open() : close(); });
    panel.addEventListener('click', function (e) {
      var opt = e.target.closest('[data-style-opt]');
      if (!opt) return;
      var r = opt.getBoundingClientRect();
      choose(opt.getAttribute('data-style-opt'), r.left + r.width / 2, r.top + r.height / 2);
    });
    panel.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { close(); trigger.focus(); return; }
      var opts = Array.prototype.slice.call(panel.querySelectorAll('[data-style-opt]'));
      var i = opts.indexOf(document.activeElement);
      if (i < 0) return;
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') i = (i + 1) % opts.length;
      else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') i = (i - 1 + opts.length) % opts.length;
      else return;
      e.preventDefault();
      opts[i].focus();
      opts[i].click();
    });
    document.addEventListener('click', function (e) {
      if (!panel.hidden && !panel.contains(e.target) && !trigger.contains(e.target)) close();
    });
    syncPicker();
  }
  function open() {
    var r = trigger.getBoundingClientRect();
    panel.hidden = false;
    // Allineato al bordo destro del pulsante, ma sempre dentro lo schermo.
    var w = panel.offsetWidth;
    var left = Math.min(Math.max(12, r.right - w), innerWidth - w - 12);
    panel.style.top = Math.round(r.bottom + 8) + 'px';
    panel.style.left = Math.round(Math.max(12, left)) + 'px';
    trigger.setAttribute('aria-expanded', 'true');
    var sel = panel.querySelector('[aria-checked="true"]');
    if (sel) sel.focus();
  }
  function close() {
    if (!panel) return;
    panel.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
  }
  function syncPicker() {
    if (!panel) return;
    Array.prototype.forEach.call(panel.querySelectorAll('[data-style-opt]'), function (b) {
      var on = b.getAttribute('data-style-opt') === current;
      b.setAttribute('aria-checked', on ? 'true' : 'false');
      b.tabIndex = on ? 0 : -1;
    });
    if (trigger) trigger.querySelector('.btn-text').textContent = current === 'classic' ? 'Style' : META[current].label;
  }

  /* ---------------- command palette + datelines ---------------- */
  function addCommands() {
    if (typeof commands === 'undefined' || !Array.isArray(commands)) return; // eslint-disable-line no-undef
    ORDER.forEach(function (name) {
      commands.push({ // eslint-disable-line no-undef
        id: 'style-' + name, title: 'Style: ' + META[name].label, desc: META[name].desc, icon: '🎨',
        action: function () { choose(name); }
      });
    });
  }
  function fillDates() {
    var now = new Date();
    var lang = root.getAttribute('lang') || 'en';
    try {
      Array.prototype.forEach.call(document.querySelectorAll('.js-style-date'), function (el) {
        el.textContent = now.toLocaleDateString(lang, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
      });
      Array.prototype.forEach.call(document.querySelectorAll('.js-style-month'), function (el) {
        el.textContent = now.toLocaleDateString(lang, { month: 'long', year: 'numeric' });
      });
    } catch (e) { /* Intl non disponibile: resta il testo statico */ }
  }

  function init() {
    fillDates();
    buildPicker();
    addCommands();
    apply(current);
    window.PortfolioStyle = { choose: choose, current: function () { return current; }, styles: ORDER.slice() };
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
