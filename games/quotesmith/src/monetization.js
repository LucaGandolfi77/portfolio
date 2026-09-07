/* ═══════════════ MONETIZATION ═══════════════ */
/* Freemium: 3 free categories + Full Game $2.99 */

(function (root) {
  'use strict';

  var STORAGE_KEY = 'quotesmith_purchases';
  var FREE_CATEGORIES = ['film', 'books', 'science'];

  var PRODUCTS = {
    fullGame: {
      id: 'com.lucagandolfi.quotesmith.fullgame',
      price: '$2.99',
      label: { en: 'Full Game', it: 'Gioco Completo' }
    },
    noAds: {
      id: 'com.lucagandolfi.quotesmith.noads',
      price: '$1.99',
      label: { en: 'Remove Ads', it: 'Nessuna Pubblicità' }
    }
  };

  var T = {
    en: {
      title: 'Unlock All Categories',
      desc: 'QuoteSmith has 32 categories of quotes. The free version includes Movies, Books, and Science. Unlock everything!',
      buyLabel: 'Full Game — $2.99',
      noAdsLabel: 'Remove Ads — $1.99',
      restoreLabel: 'Restore Purchases',
      laterLabel: 'Not now',
      upgradeTitle: 'Enjoying QuoteSmith?',
      upgradeDesc: 'Unlock all 32 categories of quotes to play with every world you know.',
      buyUpgrade: 'Unlock Full Game — $2.99'
    },
    it: {
      title: 'Sblocca Tutte le Categorie',
      desc: 'QuoteSmith ha 32 categorie di citazioni. La versione gratuita include Film, Libri e Scienza. Sblocca tutto!',
      buyLabel: 'Gioco Completo — $2.99',
      noAdsLabel: 'Nessuna Pubblicità — $1.99',
      restoreLabel: 'Ripristina Acquisti',
      laterLabel: 'Più tardi',
      upgradeTitle: 'Ti piace QuoteSmith?',
      upgradeDesc: 'Sblocca tutte le 32 categorie di citazioni per giocare con tutti i mondi che conosci.',
      buyUpgrade: 'Sblocca Gioco Completo — $2.99'
    }
  };

  function loadPurchases() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
    catch (e) { return {}; }
  }

  function savePurchases(p) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); } catch (e) { /* private mode */ }
  }

  function isFullGame() {
    return !!loadPurchases().fullGame;
  }

  function isNoAds() {
    return !!loadPurchases().noAds;
  }

  function isCategoryUnlocked(categoryKey) {
    if (FREE_CATEGORIES.indexOf(categoryKey) !== -1) return true;
    return isFullGame();
  }

  function unlockFullGame() {
    var p = loadPurchases();
    p.fullGame = true;
    savePurchases(p);
  }

  function unlockNoAds() {
    var p = loadPurchases();
    p.noAds = true;
    savePurchases(p);
  }

  function restorePurchases() {
    // In Capacitor, this would call Store.restorePurchases()
    // For web, just return current state
    return loadPurchases();
  }

  function getFreeCategories() {
    return FREE_CATEGORIES.slice();
  }

  function showPurchaseOverlay(lang) {
    lang = lang || 'en';
    return new Promise(function (resolve) {
      var existing = document.getElementById('quotesmith-purchase-overlay');
      if (existing) existing.remove();

      var t = T[lang] || T.en;

      var overlay = document.createElement('div');
      overlay.id = 'quotesmith-purchase-overlay';
      overlay.className = 'purchase-overlay';

      overlay.innerHTML =
        '<div class="purchase-card">' +
          '<h2>' + t.title + '</h2>' +
          '<p>' + t.desc + '</p>' +
          '<button class="primary-button purchase-buy-full" type="button">' + t.buyLabel + '</button>' +
          '<button class="purchase-buy-noads" type="button">' + t.noAdsLabel + '</button>' +
          '<button class="purchase-restore" type="button">' + t.restoreLabel + '</button>' +
          '<button class="purchase-later" type="button">' + t.laterLabel + '</button>' +
        '</div>';

      document.body.appendChild(overlay);

      overlay.querySelector('.purchase-buy-full').addEventListener('click', function () {
        unlockFullGame();
        overlay.remove();
        resolve(true);
      });

      overlay.querySelector('.purchase-buy-noads').addEventListener('click', function () {
        unlockNoAds();
        overlay.remove();
        resolve(false);
      });

      overlay.querySelector('.purchase-restore').addEventListener('click', function () {
        restorePurchases();
        if (isFullGame()) {
          overlay.remove();
          resolve(true);
        }
      });

      overlay.querySelector('.purchase-later').addEventListener('click', function () {
        overlay.remove();
        resolve(false);
      });
    });
  }

  function showUpgradePrompt(lang) {
    lang = lang || 'en';
    if (isFullGame()) return Promise.resolve(false);

    var t = T[lang] || T.en;

    return new Promise(function (resolve) {
      var existing = document.getElementById('quotesmith-upgrade-overlay');
      if (existing) existing.remove();

      var overlay = document.createElement('div');
      overlay.id = 'quotesmith-upgrade-overlay';
      overlay.className = 'purchase-overlay';

      overlay.innerHTML =
        '<div class="purchase-card">' +
          '<h2>' + t.upgradeTitle + '</h2>' +
          '<p>' + t.upgradeDesc + '</p>' +
          '<button class="primary-button purchase-buy-full" type="button">' + t.buyUpgrade + '</button>' +
          '<button class="purchase-later" type="button">' + t.laterLabel + '</button>' +
        '</div>';

      document.body.appendChild(overlay);

      overlay.querySelector('.purchase-buy-full').addEventListener('click', function () {
        unlockFullGame();
        overlay.remove();
        resolve(true);
      });

      overlay.querySelector('.purchase-later').addEventListener('click', function () {
        overlay.remove();
        resolve(false);
      });
    });
  }

  root.QuoteSmithMonetization = {
    isFullGame: isFullGame,
    isNoAds: isNoAds,
    isCategoryUnlocked: isCategoryUnlocked,
    getFreeCategories: getFreeCategories,
    unlockFullGame: unlockFullGame,
    unlockNoAds: unlockNoAds,
    restorePurchases: restorePurchases,
    showPurchaseOverlay: showPurchaseOverlay,
    showUpgradePrompt: showUpgradePrompt,
    PRODUCTS: PRODUCTS
  };
}(typeof self !== 'undefined' ? self : this));
