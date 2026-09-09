// Create a fixed top bar with Home and Language buttons, and push page content down
if (!document.getElementById('site-top-bar')) {
  (function(){
    const BAR_HEIGHT = 36; // px

    // no inline CSS fallback here; pages may choose to declare `--site-top-bar-height` if needed

    // Remove any legacy top-left/top-right overlays if present
    ['top-left','top-right'].forEach(c => {
      document.querySelectorAll('.' + c).forEach(el => el.remove());
    });

    const bar = document.createElement('div');
    bar.id = 'site-top-bar';
    const left = document.createElement('div');
    const right = document.createElement('div');
    left.className = 'site-top-left';
    right.className = 'site-top-right';

    const style = document.createElement('style');
    style.textContent = `
      #site-top-bar { position: fixed; top: 0; left: 0; right: 0; height: ${BAR_HEIGHT}px; display: flex; align-items: center; justify-content: space-between; padding: 6px 12px; background: linear-gradient(135deg, rgba(179,232,54,0.12), rgba(124,191,31,0.06)); color: #b3e836; z-index: 9999; box-shadow: 0 1px 12px rgba(179,232,54,0.1), 0 0 0 1px rgba(179,232,54,0.05) inset; backdrop-filter: blur(12px); border-bottom: 1px solid rgba(179,232,54,0.15); }
      #site-top-bar .site-top-left, #site-top-bar .site-top-right { display:flex; align-items:center; gap:8px; }
      #site-top-bar .tb { padding: 8px 14px; border-radius: 10px; font-weight:700; border: 1px solid rgba(179,232,54,0.15); cursor: pointer; background: rgba(179,232,54,0.06); color: #b3e836; transition: all 0.3s ease; backdrop-filter: blur(4px); }
      #site-top-bar .tb:hover { background: rgba(179,232,54,0.15); border-color: rgba(179,232,54,0.3); box-shadow: 0 0 10px rgba(179,232,54,0.2); }
      body { --site-top-bar-height: ${BAR_HEIGHT}px; }
      #site-top-bar::after { content:''; position:absolute; top:0; left:0; right:0; height:2px; background:linear-gradient(90deg,transparent,#b3e836,#7cbf1f,#b3e836,transparent); background-size:200% 100%; animation:topbar-shimmer 3s linear infinite; opacity:0.7; }
      @keyframes topbar-shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
      [data-theme="light"] #site-top-bar { background: linear-gradient(135deg, rgba(75,125,28,0.1), rgba(124,191,31,0.05)); color: #4b7d1c; border-bottom-color: rgba(75,125,28,0.15); box-shadow: 0 1px 12px rgba(75,125,28,0.08), 0 0 0 1px rgba(75,125,28,0.04) inset; }
      [data-theme="light"] #site-top-bar .tb { background: rgba(75,125,28,0.06); color: #4b7d1c; border-color: rgba(75,125,28,0.12); }
      [data-theme="light"] #site-top-bar .tb:hover { background: rgba(75,125,28,0.15); border-color: rgba(75,125,28,0.3); color: #38601a; box-shadow: 0 0 10px rgba(75,125,28,0.15); }
      [data-theme="light"] #site-top-bar::after { background: linear-gradient(90deg, transparent, #4b7d1c, #38601a, #4b7d1c, transparent); }
      [data-theme="light"] #site-top-bar select { background: rgba(75,125,28,0.06); border-color: rgba(75,125,28,0.12); color: #4b7d1c; }
    `;

    // Create a fresh exit button (don't reuse existing DOM nodes to avoid leftover event listeners)
    if (document.getElementById('siteExitBtn')) {
      const old = document.getElementById('siteExitBtn'); if (old.parentNode) old.parentNode.removeChild(old);
    }
    if (document.getElementById('exitTop')) {
      const old2 = document.getElementById('exitTop'); if (old2.parentNode) old2.parentNode.removeChild(old2);
    }
    // Compute the path back to site index.html based on current page depth.
    // Resolves to './index.html', '../index.html', '../../index.html' ... so it works on any host
    // (including GitHub Pages project sites served under a subpath) without relying on '/index.html'.
    function homeHref() {
      const p = location.pathname;
      const depth = p.split('/').filter(Boolean).length;
      // If the last segment is a file (has a dot) subtract 1
      const last = p.split('/').filter(Boolean).pop() || '';
      const dirs = (last.indexOf('.') >= 0) ? depth - 1 : depth;
      if (dirs <= 0) return './index.html';
      return '../'.repeat(dirs) + 'index.html';
    }

    const exitBtn = document.createElement('button');
    exitBtn.id = 'siteExitBtn';
    exitBtn.className = 'tb';
    exitBtn.textContent = '← Home';
    exitBtn.addEventListener('click', () => {
      try { sessionStorage.setItem('index_scroll', String(window.scrollY || window.pageYOffset || 0)); } catch(e){}
      const home = homeHref();
      try {
        if (window.history && window.history.length > 1) {
          window.history.back();
        } else if (document.referrer && document.referrer !== '') {
          try {
            const ref = new URL(document.referrer, location.href);
            if (ref.origin === location.origin) {
              window.location.href = document.referrer;
            } else {
              window.location.href = home;
            }
          } catch (e) {
            window.location.href = home;
          }
        } else {
          window.location.href = home;
        }
      } catch(e) {
        try { window.location.href = home; } catch(e) { window.location.href = 'index.html'; }
      }
    });

    // Create or reuse language selector (select with options like index.html)
    // Remove older language controls if present
    ['siteLangBtn','langBtn','siteLangSelect'].forEach(id => { const el = document.getElementById(id); if (el && el.parentNode) el.parentNode.removeChild(el); });

    function getLang() { return localStorage.getItem('site_lang') || (localStorage.getItem('lang') || 'en'); }
    function setLang(v){ try { localStorage.setItem('site_lang', v); localStorage.setItem('lang', v); } catch(e){} updateLangUI(); }

    // Build select element with language list (same options as index.html)
    const langSelect = document.createElement('select');
    langSelect.id = 'siteLangSelect';
    langSelect.className = 'tb';
    langSelect.setAttribute('aria-label', 'Select language');
    langSelect.title = 'Change language';
    const languages = [
      ['en','🇬🇧 EN'],['it','🇮🇹 IT'],['fr','🇫🇷 FR'],['es','🇪🇸 ES'],['zh','🇨🇳 中'],['ru','🇷🇺 RU'],['de','🇩🇪 DE'],['ja','🇯🇵 日本'],['sv','🇸🇪 SV'],['ar','🇸🇦 AR'],['he','🇮🇱 HE']
    ];
    languages.forEach(([code,label]) => {
      const o = document.createElement('option'); o.value = code; o.textContent = label; langSelect.appendChild(o);
    });
    langSelect.addEventListener('change', () => setLang(langSelect.value));
    async function loadTranslations(lang) {
      // Resolve i18n/ relative to the current page depth so the FIRST
      // candidate is already correct — no 404 noise on Live Server,
      // GitHub Pages subpaths, or file:// previews. Extra candidates are
      // fallbacks for unusual hosting layouts.
      let up;
      const p = location.pathname || '/';
      if (p.endsWith('/')) {
        up = './';
      } else {
        const segs = p.split('/').filter(Boolean);
        const dirs = Math.max(0, segs.length - 1);
        up = dirs === 0 ? './' : '../'.repeat(dirs);
      }
      const candidates = [
        `${up}i18n/${lang}.json`,
        `./i18n/${lang}.json`,
        `../i18n/${lang}.json`,
        `/i18n/${lang}.json`,
        `/portfolio/i18n/${lang}.json`
      ];

      for (const path of candidates) {
        try {
          const res = await fetch(path);
          if (!res.ok) throw new Error('no translations at ' + path);
          const translations = await res.json();
          window.translations = translations;
          applyTranslations();
          if (langSelect) langSelect.disabled = false;
          return true;
        } catch (e) {
          // try next candidate
        }
      }

      console.warn('Translations not found for', lang);
      // Fallback to English and disable selector so user cannot pick unavailable languages
      if (lang !== 'en') {
        try { if (langSelect) langSelect.value = 'en'; } catch(e){}
        try { await loadTranslations('en'); } catch(e){}
      }
      if (langSelect) langSelect.disabled = true;
      return false;
    }

    function applyTranslations() {
      if (!window.translations) return;
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const parts = key.split('.');
        let value = window.translations;
        for (const p of parts) { if (value && typeof value === 'object') value = value[p]; else { value = null; break; } }
        if (value === null || value === undefined) return;

        // Special handling for common attributes
        const lower = key.toLowerCase();
        if (el.tagName === 'TITLE' || lower.endsWith('page.title')) {
          try { document.title = value; } catch (e) {}
          return;
        }

        if ((el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') && lower.endsWith('.placeholder')) {
          try { el.placeholder = value; } catch (e) { el.setAttribute('placeholder', value); }
          return;
        }

        if (el.tagName === 'OPTION') {
          el.textContent = value;
          return;
        }

        // fallback: set textContent
        el.textContent = value;
      });
    }

    function updateLangUI(){ const v = getLang() || 'it'; try { langSelect.value = v; } catch(e){} loadTranslations(v); }

    left.appendChild(exitBtn);
    right.appendChild(langSelect);
    bar.appendChild(style);
    bar.appendChild(left);
    bar.appendChild(right);

    // Insert bar before other content and push body content down
    document.body.insertBefore(bar, document.body.firstChild);
    // Ensure we don't overwrite existing inline padding; add to current paddingTop
    const currentPadding = parseInt(window.getComputedStyle(document.body).paddingTop || '0', 10) || 0;
    document.body.style.paddingTop = (currentPadding + BAR_HEIGHT) + 'px';

    // Accessibility: allow focus to first element
    exitBtn.setAttribute('aria-label', 'Return to home');
    if (langSelect) langSelect.setAttribute('aria-label', 'Toggle language');

    updateLangUI();
  })();
}
