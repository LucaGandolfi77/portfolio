/* ==========================================================================
   Project Kit — Project Shell
   Uso:
     <header data-project-shell
             data-title="QR Studio"
             data-id="qr-studio"
             data-back="../../projects.html"
             data-home="../../index.html"
             data-languages="en,it"></header>
   Espone window.ProjectShell = { toast, confirm, setTitle, getLang, setLang }.
   ========================================================================== */

(function () {
  'use strict';

  var shell = document.querySelector('[data-project-shell]');
  if (!shell || window.ProjectShell) return;

  var ICONS = {
    back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>',
    star: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
    share: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.6" y1="13.5" x2="15.4" y2="17.5"/><line x1="15.4" y1="6.5" x2="8.6" y2="10.5"/></svg>',
    more: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="5" cy="12" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="19" cy="12" r="1.8"/></svg>',
    grid: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>',
    home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m3 10 9-7 9 7v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/></svg>',
    copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>'
  };

  var DICT = {
    en: {
      project: 'Project',
      projects: 'All projects',
      home: 'Portfolio home',
      copy: 'Copy link',
      theme: 'Theme',
      auto: 'Auto',
      dark: 'Dark',
      light: 'Light',
      language: 'Language',
      favorite: 'Favorite',
      share: 'Share',
      menu: 'Project menu',
      back: 'Back to projects',
      favAdd: 'Added to favorites',
      favRemove: 'Removed from favorites',
      copied: 'Link copied',
      copyFail: 'Could not copy',
      shareFail: 'Sharing is not available',
      cancel: 'Cancel',
      confirm: 'Confirm',
      confirmTitle: 'Are you sure?',
      meta: 'Local-first · no tracking'
    },
    it: {
      project: 'Progetto',
      projects: 'Tutti i progetti',
      home: 'Home del portfolio',
      copy: 'Copia link',
      theme: 'Tema',
      auto: 'Auto',
      dark: 'Scuro',
      light: 'Chiaro',
      language: 'Lingua',
      favorite: 'Preferito',
      share: 'Condividi',
      menu: 'Menu progetto',
      back: 'Torna ai progetti',
      favAdd: 'Aggiunto ai preferiti',
      favRemove: 'Rimosso dai preferiti',
      copied: 'Link copiato',
      copyFail: 'Copia non riuscita',
      shareFail: 'Condivisione non disponibile',
      cancel: 'Annulla',
      confirm: 'Conferma',
      confirmTitle: 'Sei sicuro?',
      meta: 'Locale · nessun tracciamento'
    }
  };

  var LANG_LABELS = {
    en: 'English',
    it: 'Italiano',
    fr: 'Français',
    es: 'Español',
    de: 'Deutsch',
    zh: '中文',
    ru: 'Русский',
    ja: '日本語',
    sv: 'Svenska',
    ar: 'العربية',
    he: 'עברית'
  };

  var state = {
    id: shell.dataset.id || location.pathname.replace(/\/index\.html$/, '/'),
    title: shell.dataset.title || document.title.split('—')[0].trim(),
    back: shell.dataset.back || '../projects.html',
    home: shell.dataset.home || '../index.html',
    languages: (shell.dataset.languages || '')
      .split(',')
      .map(function (s) { return s.trim().toLowerCase(); })
      .filter(Boolean),
    lang: 'en',
    theme: 'auto'
  };

  var refs = {};
  var toastEl = null;
  var toastTimer = null;
  var dialogEl = null;

  function readRaw(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }

  function writeRaw(key, value) {
    try { localStorage.setItem(key, value); return true; } catch (e) { return false; }
  }

  function readJSON(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      if (!raw) return fallback;
      var value = JSON.parse(raw);
      return value == null ? fallback : value;
    } catch (e) {
      return fallback;
    }
  }

  function writeJSON(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch (e) { return false; }
  }

  function dict() {
    return DICT[state.lang] || DICT.en;
  }

  function detectLang() {
    var stored = (readRaw('pf.lang') || readRaw('site_lang') || '').toLowerCase();
    var nav = (navigator.language || 'en').slice(0, 2).toLowerCase();
    if (state.languages.length) {
      if (state.languages.indexOf(stored) >= 0) return stored;
      if (state.languages.indexOf(nav) >= 0) return nav;
      return state.languages[0];
    }
    return stored || nav || 'en';
  }

  function systemTheme() {
    try {
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    } catch (e) {
      return 'dark';
    }
  }

  function getTheme() {
    var stored = readRaw('pf.theme');
    return stored === 'dark' || stored === 'light' || stored === 'auto' ? stored : 'auto';
  }

  function applyTheme(pref, persist) {
    var resolved = pref === 'auto' ? systemTheme() : pref;
    var root = document.documentElement;
    root.setAttribute('data-theme', resolved);
    root.style.colorScheme = resolved;
    if (persist) writeRaw('pf.theme', pref);
    if (refs.themeSelect) refs.themeSelect.value = pref;
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', resolved === 'light' ? '#f7f8fc' : '#0a0d16');
    state.theme = pref;
  }

  function setLang(lang) {
    if (!lang) return;
    state.lang = lang;
    writeRaw('pf.lang', lang);
    writeRaw('site_lang', lang);
    document.documentElement.lang = lang;
    window.__PROJECT_LANG__ = lang;
    translateShell();
    window.dispatchEvent(new CustomEvent('project:langchange', { detail: { lang: lang } }));
  }

  function translateShell() {
    var d = dict();
    shell.querySelectorAll('[data-shell-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-shell-i18n');
      if (d[key]) el.textContent = d[key];
    });
    if (refs.back) refs.back.setAttribute('aria-label', d.back);
    if (refs.star) refs.star.setAttribute('aria-label', d.favorite);
    if (refs.share) refs.share.setAttribute('aria-label', d.share);
    if (refs.menuBtn) refs.menuBtn.setAttribute('aria-label', d.menu);
    if (refs.menuMeta) refs.menuMeta.textContent = d.meta;
    if (refs.langSelect) refs.langSelect.value = state.lang;
  }

  function updateStar() {
    if (!refs.star) return;
    var favorites = readJSON('pf.shell.favorites', []);
    var isFav = Array.isArray(favorites) && favorites.indexOf(state.id) >= 0;
    refs.star.setAttribute('aria-pressed', String(isFav));
    refs.star.title = dict().favorite;
  }

  function toggleFavorite() {
    var favorites = readJSON('pf.shell.favorites', []);
    if (!Array.isArray(favorites)) favorites = [];
    var index = favorites.indexOf(state.id);
    var added = index < 0;
    if (added) favorites.unshift(state.id);
    else favorites.splice(index, 1);
    writeJSON('pf.shell.favorites', favorites.slice(0, 200));
    updateStar();
    toast(added ? dict().favAdd : dict().favRemove);
    window.dispatchEvent(new CustomEvent('project:favoritechange', {
      detail: { id: state.id, favorite: added }
    }));
  }

  function toast(message, ms) {
    if (!message) return;
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'pf-toast';
      toastEl.setAttribute('role', 'status');
      toastEl.setAttribute('aria-live', 'polite');
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = message;
    toastEl.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove('is-visible');
    }, ms || 2200);
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).then(function () { return true; }).catch(function () {
        return fallbackCopy(text);
      });
    }
    return Promise.resolve(fallbackCopy(text));
  }

  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.top = '-1000px';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    ta.remove();
    return ok;
  }

  function sharePage() {
    var description = '';
    var meta = document.querySelector('meta[name="description"]');
    if (meta) description = meta.getAttribute('content') || '';
    var data = { title: state.title, text: description, url: location.href };
    if (navigator.share) {
      navigator.share(data).catch(function (err) {
        if (err && err.name === 'AbortError') return;
        copyText(location.href).then(function (ok) {
          toast(ok ? dict().copied : dict().shareFail);
        });
      });
      return;
    }
    copyText(location.href).then(function (ok) {
      toast(ok ? dict().copied : dict().copyFail);
    });
  }

  function ensureDialog() {
    if (dialogEl) return dialogEl;
    dialogEl = document.createElement('dialog');
    dialogEl.className = 'pf-dialog';
    dialogEl.innerHTML =
      '<div class="pf-dialog__body">' +
        '<h2 class="pf-dialog__title"></h2>' +
        '<p class="pf-dialog__text"></p>' +
        '<div class="pf-dialog__actions">' +
          '<button type="button" class="pf-btn pf-btn--ghost" data-dialog-cancel></button>' +
          '<button type="button" class="pf-btn pf-btn--primary" data-dialog-confirm></button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(dialogEl);
    return dialogEl;
  }

  function confirmDialog(opts) {
    opts = opts || {};
    var d = ensureDialog();
    var title = d.querySelector('.pf-dialog__title');
    var text = d.querySelector('.pf-dialog__text');
    var cancel = d.querySelector('[data-dialog-cancel]');
    var ok = d.querySelector('[data-dialog-confirm]');
    title.textContent = opts.title || dict().confirmTitle;
    text.textContent = opts.message || '';
    cancel.textContent = opts.cancelText || dict().cancel;
    ok.textContent = opts.confirmText || dict().confirm;

    return new Promise(function (resolve) {
      var settled = false;
      function finish(value) {
        if (settled) return;
        settled = true;
        if (d.open) d.close();
        resolve(value);
      }
      cancel.onclick = function () { finish(false); };
      ok.onclick = function () { finish(true); };
      d.oncancel = function (event) {
        event.preventDefault();
        finish(false);
      };
      if (d.open) d.close();
      d.showModal();
      ok.focus();
    });
  }

  function openMenu() {
    if (!refs.menu) return;
    refs.menu.hidden = false;
    refs.menuBtn.setAttribute('aria-expanded', 'true');
    var first = refs.menu.querySelector('[role="menuitem"]');
    if (first) first.focus();
  }

  function closeMenu(returnFocus) {
    if (!refs.menu || refs.menu.hidden) return;
    refs.menu.hidden = true;
    refs.menuBtn.setAttribute('aria-expanded', 'false');
    if (returnFocus) refs.menuBtn.focus();
  }

  function toggleMenu() {
    if (refs.menu.hidden) openMenu();
    else closeMenu();
  }

  function syncBarHeight() {
    var h = Math.round(shell.getBoundingClientRect().height);
    document.documentElement.style.setProperty('--pf-shell-h', h + 'px');
  }

  function buildLangOptions() {
    if (!state.languages.length) return '';
    return state.languages.map(function (code) {
      return '<option value="' + code + '">' + (LANG_LABELS[code] || code.toUpperCase()) + '</option>';
    }).join('');
  }

  function render() {
    shell.classList.add('pf-shell');
    shell.setAttribute('role', 'banner');

    var headingTag = shell.dataset.heading === 'div' ? 'div' : 'h1';
    shell.innerHTML =
      '<div class="pf-shell__row">' +
        '<a class="pf-icon-btn pf-shell__back" href="" aria-label="Back to projects">' + ICONS.back + '</a>' +
        '<div class="pf-shell__brand">' +
          '<span class="pf-shell__eyebrow" data-shell-i18n="project">Project</span>' +
          '<' + headingTag + ' class="pf-shell__title"></' + headingTag + '>' +
        '</div>' +
        '<div class="pf-shell__actions">' +
          '<button class="pf-icon-btn pf-shell__star" type="button" aria-pressed="false">' + ICONS.star + '</button>' +
          '<button class="pf-icon-btn pf-shell__share" type="button">' + ICONS.share + '</button>' +
          '<button class="pf-icon-btn pf-shell__menu-btn" type="button" aria-haspopup="menu" aria-expanded="false">' + ICONS.more + '</button>' +
        '</div>' +
      '</div>' +
      '<div class="pf-shell__menu" role="menu" hidden>' +
        '<a class="pf-shell__menu-item" role="menuitem" href="" data-menu-projects>' + ICONS.grid + '<span data-shell-i18n="projects">All projects</span></a>' +
        '<a class="pf-shell__menu-item" role="menuitem" href="" data-menu-home>' + ICONS.home + '<span data-shell-i18n="home">Portfolio home</span></a>' +
        '<button class="pf-shell__menu-item" role="menuitem" type="button" data-menu-copy>' + ICONS.copy + '<span data-shell-i18n="copy">Copy link</span></button>' +
        '<hr class="pf-shell__menu-sep">' +
        '<label class="pf-shell__menu-label"><span data-shell-i18n="theme">Theme</span><select data-theme-select>' +
          '<option value="auto" data-shell-i18n="auto">Auto</option>' +
          '<option value="dark" data-shell-i18n="dark">Dark</option>' +
          '<option value="light" data-shell-i18n="light">Light</option>' +
        '</select></label>' +
        (state.languages.length
          ? '<label class="pf-shell__menu-label"><span data-shell-i18n="language">Language</span><select data-lang-select>' + buildLangOptions() + '</select></label>'
          : '') +
        '<div class="pf-shell__menu-meta" data-menu-meta>Local-first · no tracking</div>' +
      '</div>';

    refs.back = shell.querySelector('.pf-shell__back');
    refs.title = shell.querySelector('.pf-shell__title');
    refs.star = shell.querySelector('.pf-shell__star');
    refs.share = shell.querySelector('.pf-shell__share');
    refs.menuBtn = shell.querySelector('.pf-shell__menu-btn');
    refs.menu = shell.querySelector('.pf-shell__menu');
    refs.menuProjects = shell.querySelector('[data-menu-projects]');
    refs.menuHome = shell.querySelector('[data-menu-home]');
    refs.menuCopy = shell.querySelector('[data-menu-copy]');
    refs.menuMeta = shell.querySelector('[data-menu-meta]');
    refs.themeSelect = shell.querySelector('[data-theme-select]');
    refs.langSelect = shell.querySelector('[data-lang-select]');

    refs.title.textContent = state.title;
    refs.back.setAttribute('href', state.back);
    refs.menuProjects.setAttribute('href', state.back);
    refs.menuHome.setAttribute('href', state.home);

    refs.back.addEventListener('click', function () {
      try {
        sessionStorage.setItem('projects_scroll', String(window.scrollY || 0));
      } catch (e) { /* ignore */ }
    });

    refs.star.addEventListener('click', toggleFavorite);
    refs.share.addEventListener('click', sharePage);
    refs.menuBtn.addEventListener('click', toggleMenu);

    refs.menuCopy.addEventListener('click', function () {
      copyText(location.href).then(function (ok) {
        toast(ok ? dict().copied : dict().copyFail);
        closeMenu(true);
      });
    });

    refs.themeSelect.addEventListener('change', function () {
      applyTheme(refs.themeSelect.value, true);
    });

    if (refs.langSelect) {
      refs.langSelect.addEventListener('change', function () {
        setLang(refs.langSelect.value);
      });
    }

    refs.menu.addEventListener('click', function (event) {
      var item = event.target.closest('a, button');
      if (item && item.getAttribute('role') === 'menuitem') closeMenu();
    });

    document.addEventListener('click', function (event) {
      if (!refs.menu || refs.menu.hidden) return;
      if (refs.menu.contains(event.target) || refs.menuBtn.contains(event.target)) return;
      closeMenu();
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && refs.menu && !refs.menu.hidden) {
        closeMenu(true);
      }
    });

    try {
      var mq = window.matchMedia('(prefers-color-scheme: light)');
      var onChange = function () {
        if (getTheme() === 'auto') applyTheme('auto', false);
      };
      if (mq.addEventListener) mq.addEventListener('change', onChange);
      else if (mq.addListener) mq.addListener(onChange);
    } catch (e) { /* ignore */ }

    document.body.classList.add('pf-has-shell');
    syncBarHeight();
    if (window.ResizeObserver) {
      try { new ResizeObserver(syncBarHeight).observe(shell); } catch (e) { /* ignore */ }
    }
    window.addEventListener('resize', syncBarHeight);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(syncBarHeight).catch(function () {});
    }

    state.lang = detectLang();
    document.documentElement.lang = state.lang;
    window.__PROJECT_LANG__ = state.lang;
    translateShell();
    applyTheme(getTheme(), false);
    updateStar();
  }

  render();

  window.ProjectShell = {
    toast: toast,
    confirm: confirmDialog,
    setTitle: function (title) {
      state.title = String(title || '');
      if (refs.title) refs.title.textContent = state.title;
    },
    getLang: function () { return state.lang; },
    setLang: setLang,
    getId: function () { return state.id; },
    isFavorite: function () {
      var favorites = readJSON('pf.shell.favorites', []);
      return Array.isArray(favorites) && favorites.indexOf(state.id) >= 0;
    },
    toggleFavorite: toggleFavorite
  };
})();
