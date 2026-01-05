// Inject top-left Home button and top-right language toggle.
if (!document.getElementById('site-top-buttons')) {
  (function(){
    const wrap = document.createElement('div');
    wrap.id = 'site-top-buttons';

    const style = document.createElement('style');
    style.textContent = `
      .site-top-left, .site-top-right { position: fixed; top: 12px; z-index: 9999; }
      .site-top-left { left: 12px; }
      .site-top-right { right: 12px; }
      .site-top-left .tb, .site-top-right .tb { padding: 8px 12px; border-radius: 8px; font-weight:700; border: none; cursor: pointer; background: rgba(11,107,154,0.95); color: #fff; }
      .site-top-left .tb:hover, .site-top-right .tb:hover { opacity: 0.95; }
    `;

    const left = document.createElement('div'); left.className = 'site-top-left';
    const right = document.createElement('div'); right.className = 'site-top-right';

    const exitBtn = document.createElement('button'); exitBtn.className = 'tb'; exitBtn.id = 'siteExitBtn'; exitBtn.textContent = '← Home';
    exitBtn.addEventListener('click', () => { window.location.href = '../index.html'; });

    const langBtn = document.createElement('button'); langBtn.className = 'tb'; langBtn.id = 'siteLangBtn';
    function getLang() { return localStorage.getItem('site_lang') || 'it'; }
    function setLang(v){ localStorage.setItem('site_lang', v); update(); }
    function update(){ langBtn.textContent = getLang().toUpperCase(); }
    langBtn.addEventListener('click', () => { setLang(getLang() === 'it' ? 'en' : 'it'); });

    left.appendChild(exitBtn);
    right.appendChild(langBtn);
    wrap.appendChild(style);
    wrap.appendChild(left);
    wrap.appendChild(right);

    // Append to body
    document.body.appendChild(wrap);
    update();
  })();
}
