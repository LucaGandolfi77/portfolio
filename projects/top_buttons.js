// Create a fixed top bar with Home and Language buttons, and push page content down
if (!document.getElementById('site-top-bar')) {
  (function(){
    const BAR_HEIGHT = 56; // px

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

    // Create or reuse the exit button
    let exitBtn = document.getElementById('siteExitBtn') || document.getElementById('exitTop');
    if (exitBtn) {
      // detach from previous parent
      if (exitBtn.parentNode) exitBtn.parentNode.removeChild(exitBtn);
      exitBtn.id = 'siteExitBtn';
    } else {
      exitBtn = document.createElement('button');
      exitBtn.id = 'siteExitBtn';
      exitBtn.className = 'tb';
      exitBtn.textContent = '← Home';
    }
    exitBtn.addEventListener('click', () => {
      try { sessionStorage.setItem('index_scroll', String(window.scrollY || window.pageYOffset || 0)); } catch(e){}
      window.location.href = '../index.html';
    });

    // Create or reuse language button
    let langBtn = document.getElementById('siteLangBtn') || document.getElementById('langBtn');
    if (langBtn) {
      if (langBtn.parentNode) langBtn.parentNode.removeChild(langBtn);
      langBtn.id = 'siteLangBtn';
    } else {
      langBtn = document.createElement('button');
      langBtn.id = 'siteLangBtn';
      langBtn.className = 'tb';
    }
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
