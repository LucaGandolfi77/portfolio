(function(){
  'use strict';

  const CONFIG = {
    // AdMob App ID (replace with your production ID)
    appId: 'ca-app-pub-3940256099942544~3347511713', // Google test app ID

    // Ad unit IDs
    interstitial: {
      test: 'ca-app-pub-3940256099942544/1033173712',   // Google test interstitial
      prod: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX'   // Replace with production
    },
    banner: {
      test: 'ca-app-pub-3940256099942544/6300978111',    // Google test banner
      prod: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX'   // Replace with production
    },

    // Frequency capping
    maxInterstitialsPerSession: 3,
    gracePeriodMs: 120000,       // 2 minutes
    interstitialIntervalMs: 60000 // minimum 60s between interstitials
  };

  const isDev = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
  const adUnitId = (type) => isDev ? CONFIG[type].test : CONFIG[type].prod;

  let interstitialCount = 0;
  let lastInterstitialTime = 0;
  let sessionStart = Date.now();
  let bannerVisible = false;
  let sdkReady = false;

  // --- SDK Detection ---
  function checkSdk() {
    sdkReady = typeof window.admob !== 'undefined' && typeof window.admob.AdMob !== 'undefined';
    return sdkReady;
  }

  // --- Banner Ad ---
  function showBanner() {
    if (!sdkReady && !checkSdk()) return;
    if (bannerVisible) return;
    bannerVisible = true;

    const bannerEl = document.getElementById('ad-banner');
    if (bannerEl) bannerEl.style.display = 'block';

    window.Analytics && window.Analytics.trackEvent('ad_shown', { type: 'banner' });

    try {
      window.admob.AdMob.createBanner({
        adId: adUnitId('banner'),
        position: window.admob.AdMob.AD_POSITION.BOTTOM_CENTER,
        autoShow: true,
        isTesting: isDev
      });
    } catch(e) {
      showBannerPlaceholder();
    }
  }

  function showBannerPlaceholder() {
    let el = document.getElementById('ad-banner');
    if (!el) {
      el = document.createElement('div');
      el.id = 'ad-banner';
      document.body.appendChild(el);
    }
    el.className = 'ad-banner-placeholder';
    el.innerHTML = '<span>📢 Advertising</span>';
    el.style.display = 'block';
    el.onclick = () => { window.Analytics && window.Analytics.trackEvent('ad_clicked', { type: 'banner' }); };
  }

  function hideBanner() {
    bannerVisible = false;
    const bannerEl = document.getElementById('ad-banner');
    if (bannerEl) bannerEl.style.display = 'none';

    if (sdkReady || checkSdk()) {
      try { window.admob.AdMob.removeBanner(); } catch(e) {}
    }
  }

  // --- Interstitial Ad ---
  function showInterstitial() {
    // Frequency capping
    if (interstitialCount >= CONFIG.maxInterstitialsPerSession) return false;

    // Grace period
    if (Date.now() - sessionStart < CONFIG.gracePeriodMs) return false;

    // Minimum interval between interstitials
    if (Date.now() - lastInterstitialTime < CONFIG.interstitialIntervalMs) return false;

    interstitialCount++;
    lastInterstitialTime = Date.now();
    window.Analytics && window.Analytics.trackEvent('ad_shown', { type: 'interstitial' });

    if (sdkReady || checkSdk()) {
      try {
        window.admob.AdMob.prepareInterstitial({
          adId: adUnitId('interstitial'),
          autoShow: true,
          isTesting: isDev,
          adClicked: function() { window.Analytics && window.Analytics.trackEvent('ad_clicked', { type: 'interstitial' }); }
        });
      } catch(e) {
        // Fallback — no-op on web
      }
      return true;
    }

    // Web fallback: no real ad, just count it
    return true;
  }

  // --- Module Export ---
  window.Ads = {
    showBanner,
    hideBanner,
    showInterstitial,
    checkSdk,
    config: CONFIG,
    get interstitialCount() { return interstitialCount; },
    get bannerVisible() { return bannerVisible; }
  };

  // Auto-init SDK check after DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkSdk);
  } else {
    checkSdk();
  }
})();
