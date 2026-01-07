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
      #site-top-bar { position: fixed; top: 0; left: 0; right: 0; height: ${BAR_HEIGHT}px; display: flex; align-items: center; justify-content: space-between; padding: 6px 12px; background: rgba(11,107,154,0.95); color: #fff; z-index: 9999; box-shadow: 0 2px 8px rgba(0,0,0,0.25); backdrop-filter: blur(6px); }
      #site-top-bar .site-top-left, #site-top-bar .site-top-right { display:flex; align-items:center; gap:8px; }
      #site-top-bar .tb { padding: 8px 12px; border-radius: 8px; font-weight:700; border: none; cursor: pointer; background: rgba(255,255,255,0.08); color: #fff; }
      #site-top-bar .tb:hover { background: rgba(255,255,255,0.12); }
      body { --site-top-bar-height: ${BAR_HEIGHT}px; }
    `;

    // Create a fresh exit button (don't reuse existing DOM nodes to avoid leftover event listeners)
    if (document.getElementById('siteExitBtn')) {
      const old = document.getElementById('siteExitBtn'); if (old.parentNode) old.parentNode.removeChild(old);
    }
    if (document.getElementById('exitTop')) {
      const old2 = document.getElementById('exitTop'); if (old2.parentNode) old2.parentNode.removeChild(old2);
    }
    const exitBtn = document.createElement('button');
    exitBtn.id = 'siteExitBtn';
    exitBtn.className = 'tb';
    exitBtn.textContent = '← Home';
    exitBtn.addEventListener('click', () => {
      try { sessionStorage.setItem('index_scroll', String(window.scrollY || window.pageYOffset || 0)); } catch(e){}
      try { window.location.href = 'index.html'; } catch(e) { window.location.href = '../index.html'; }
    });

    // Create or reuse language button
    // Create a fresh language button as well to avoid duplicated listeners
    if (document.getElementById('siteLangBtn')) {
      const oldL = document.getElementById('siteLangBtn'); if (oldL.parentNode) oldL.parentNode.removeChild(oldL);
    }
    if (document.getElementById('langBtn')) {
      const oldL2 = document.getElementById('langBtn'); if (oldL2.parentNode) oldL2.parentNode.removeChild(oldL2);
    }
    const langBtn = document.createElement('button');
    langBtn.id = 'siteLangBtn';
    langBtn.className = 'tb';
    function getLang() { return localStorage.getItem('site_lang') || (localStorage.getItem('lang') || 'it'); }
    function setLang(v){ localStorage.setItem('site_lang', v); localStorage.setItem('lang', v); updateLangUI(); }
    function updateLangUI(){ langBtn.textContent = (getLang() || 'it').toUpperCase(); }
    langBtn.addEventListener('click', () => { setLang(getLang() === 'it' ? 'en' : 'it'); });

    left.appendChild(exitBtn);
    right.appendChild(langBtn);
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
    langBtn.setAttribute('aria-label', 'Toggle language');

    updateLangUI();
  })();
}
