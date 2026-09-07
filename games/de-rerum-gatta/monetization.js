/**
 * Monetization Module — Cross-game purchase system
 * Works with Arrowmatic, Orto Magico, and De Rerum Gatta.
 *
 * Tiers:
 *   free       — limited content (per game)
 *   full       — all content unlocked ($4.99)
 *   noads      — ads removed ($2.99, optional add-on)
 *
 * Usage:
 *   const m = Monetization.init('arrowmatic');
 *   if (m.isFull()) { ... } else { m.showUpgrade(); }
 */
'use strict';

const Monetization = (() => {
  const STORAGE_KEY = 'game_purchases';
  const PRICES = { full: '$4.99', noads: '$2.99' };

  let _gameId = null;
  let _purchases = {};

  function _load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) _purchases = JSON.parse(raw);
    } catch (e) { _purchases = {}; }
  }

  function _save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(_purchases)); } catch (e) {}
  }

  function _key(feature) { return `${_gameId}_${feature}`; }

  // ── Public API ──

  function init(gameId) {
    _gameId = gameId;
    _load();
    return API;
  }

  function isFull() { return !!_purchases[_key('full')]; }
  function isNoAds() { return !!_purchases[_key('noads')]; }
  function hasFeature(feature) { return isFull() || !!_purchases[_key(feature)]; }

  function purchaseFull() {
    _purchases[_key('full')] = Date.now();
    _save();
    _dismissOverlay();
    return true;
  }

  function purchaseNoAds() {
    _purchases[_key('noads')] = Date.now();
    _save();
    _dismissOverlay();
    return true;
  }

  function purchaseFeature(feature) {
    _purchases[_key(feature)] = Date.now();
    _save();
    _dismissOverlay();
    return true;
  }

  function restorePurchases() {
    _load();
    return { full: isFull(), noads: isNoAds() };
  }

  function getPrice(feature) {
    return PRICES[feature] || PRICES.full;
  }

  // ── UI Overlay ──

  let _overlayEl = null;

  function _dismissOverlay() {
    if (_overlayEl && _overlayEl.parentNode) {
      _overlayEl.remove();
      _overlayEl = null;
    }
    // Notify game to refresh UI
    if (typeof window._onPurchaseComplete === 'function') {
      window._onPurchaseComplete();
    }
  }

  function showUpgrade(options = {}) {
    if (_overlayEl) return;

    const {
      title = 'Sblocca il Gioco Completo',
      subtitle = 'Accedi a tutto il contenuto',
      features = [],
      onPurchase = purchaseFull,
      showNoads = true,
    } = options;

    _overlayEl = document.createElement('div');
    _overlayEl.id = 'mono-overlay';
    _overlayEl.innerHTML = `
      <style>
        #mono-overlay {
          position: fixed; inset: 0; z-index: 9999;
          display: flex; align-items: center; justify-content: center;
          background: rgba(0,0,0,.72); backdrop-filter: blur(6px);
          font-family: -apple-system, BlinkMacSystemFont, "SF Pro Rounded", system-ui, sans-serif;
          animation: monoFadeIn .25s ease;
        }
        @keyframes monoFadeIn { from { opacity: 0 } to { opacity: 1 } }
        .mono-card {
          background: #fff; border-radius: 24px; padding: 28px 24px 22px;
          max-width: 380px; width: 92vw; box-shadow: 0 20px 60px rgba(0,0,0,.4);
          text-align: center; position: relative;
        }
        .mono-close {
          position: absolute; top: 12px; right: 14px; background: none; border: none;
          font-size: 22px; cursor: pointer; color: #9ca3af; padding: 4px 8px;
        }
        .mono-close:hover { color: #374151; }
        .mono-title { font-size: 22px; font-weight: 900; color: #111827; margin: 0 0 4px; }
        .mono-sub { font-size: 13px; color: #6b7280; font-weight: 600; margin: 0 0 16px; }
        .mono-features { text-align: left; margin: 0 0 18px; }
        .mono-feat {
          display: flex; align-items: flex-start; gap: 10px;
          padding: 7px 0; font-size: 13.5px; color: #374151; font-weight: 600;
        }
        .mono-feat .ic { font-size: 18px; flex: none; }
        .mono-btn {
          display: block; width: 100%; padding: 15px; border: none; border-radius: 14px;
          font-size: 17px; font-weight: 900; color: #fff; cursor: pointer;
          margin-bottom: 10px; font-family: inherit;
          box-shadow: 0 6px 0 rgba(0,0,0,.15);
          transition: transform .08s, filter .15s;
        }
        .mono-btn:active { transform: translateY(3px); box-shadow: 0 3px 0 rgba(0,0,0,.15); }
        .mono-btn.primary { background: linear-gradient(135deg, #8b5cf6, #ec4899); }
        .mono-btn.secondary { background: rgba(0,0,0,.08); color: #374151; box-shadow: none; }
        .mono-price { font-size: 14px; font-weight: 800; color: #8b5cf6; margin-bottom: 14px; }
        .mono-restore { font-size: 11.5px; color: #9ca3af; font-weight: 600; margin-top: 4px; cursor: pointer; }
        .mono-restore:hover { color: #6b7280; }
      </style>
      <div class="mono-card">
        <button class="mono-close" id="mono-close">✕</button>
        <div style="font-size:36px;margin-bottom:6px">🔓</div>
        <div class="mono-title">${title}</div>
        <div class="mono-sub">${subtitle}</div>
        <div class="mono-features">
          ${features.map(f => `<div class="mono-feat"><span class="ic">${f.ic}</span><span>${f.text}</span></div>`).join('')}
        </div>
        <div class="mono-price">Full Game — ${PRICES.full}</div>
        <button class="mono-btn primary" id="mono-buy-full">🔓 Acquista Ora</button>
        ${showNoads ? `<button class="mono-btn secondary" id="mono-buy-noads">Senza Pubblicità — ${PRICES.noads}</button>` : ''}
        <div class="mono-restore" id="mono-restore">Already purchased? Restore</div>
      </div>
    `;

    document.body.appendChild(_overlayEl);

    _overlayEl.querySelector('#mono-close').addEventListener('click', _dismissOverlay);
    _overlayEl.addEventListener('click', e => { if (e.target === _overlayEl) _dismissOverlay(); });

    _overlayEl.querySelector('#mono-buy-full').addEventListener('click', () => {
      purchaseFull();
      if (onPurchase) onPurchase('full');
    });

    if (showNoads) {
      _overlayEl.querySelector('#mono-buy-noads').addEventListener('click', () => {
        purchaseNoAds();
        if (onPurchase) onPurchase('noads');
      });
    }

    _overlayEl.querySelector('#mono-restore').addEventListener('click', () => {
      restorePurchases();
      _dismissOverlay();
    });
  }

  function showPaywall(options = {}) {
    if (isFull()) return false;
    showUpgrade(options);
    return true;
  }

  // ── Lock UI Helper ──
  function lockElement(el, feature, onClick) {
    if (hasFeature(feature)) {
      el.classList.remove('mono-locked');
      el.style.opacity = '1';
      el.style.pointerEvents = 'auto';
      if (onClick) el.addEventListener('click', onClick);
    } else {
      el.classList.add('mono-locked');
      el.style.opacity = '0.55';
      el.style.pointerEvents = 'auto';
      el.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        showPaywall({
          title: 'Contenuto Bloccato',
          subtitle: `Sblocca "${feature}" con il Full Game`,
          features: options.features || [],
        });
      });
    }
  }

  const API = {
    init,
    isFull,
    isNoAds,
    hasFeature,
    purchaseFull,
    purchaseNoAds,
    purchaseFeature,
    restorePurchases,
    getPrice,
    showUpgrade,
    showPaywall,
    lockElement,
  };

  return API;
})();
