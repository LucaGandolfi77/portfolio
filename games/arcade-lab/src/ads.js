(function () {
  'use strict';

  var interstitialCount = 0;
  var MAX_INTERSTITIALS = 3;
  var GRACE_PERIOD = 120000;
  var lastInterstitialTime = 0;
  var bannerVisible = false;

  function createBannerDiv() {
    var existing = document.getElementById('ad-banner');
    if (existing) return existing;
    var div = document.createElement('div');
    div.id = 'ad-banner';
    div.style.cssText =
      'position:fixed;bottom:0;left:0;width:100%;height:60px;' +
      'background:rgba(0,0,0,0.85);color:#aaa;display:flex;' +
      'align-items:center;justify-content:center;font-size:12px;' +
      'z-index:9999;display:none;letter-spacing:1px;';
    div.textContent = 'AD BANNER';
    document.body.appendChild(div);
    return div;
  }

  function showInterstitial() {
    if (interstitialCount >= MAX_INTERSTITIALS) return false;
    var now = Date.now();
    if (now - lastInterstitialTime < GRACE_PERIOD) return false;

    interstitialCount++;
    lastInterstitialTime = now;

    var overlay = document.createElement('div');
    overlay.id = 'ad-interstitial';
    overlay.style.cssText =
      'position:fixed;top:0;left:0;width:100%;height:100%;' +
      'background:rgba(0,0,0,0.92);z-index:10000;display:flex;' +
      'flex-direction:column;align-items:center;justify-content:center;' +
      'color:#fff;font-size:14px;cursor:pointer;';

    var label = document.createElement('div');
    label.textContent = 'INTERSTITIAL AD';
    label.style.cssText = 'font-size:18px;letter-spacing:2px;margin-bottom:20px;color:#888;';

    var hint = document.createElement('div');
    hint.textContent = 'Tap anywhere to close';
    hint.style.cssText = 'font-size:12px;color:#555;';

    var counter = document.createElement('div');
    counter.style.cssText = 'position:absolute;top:10px;right:15px;font-size:11px;color:#444;';
    counter.textContent = interstitialCount + '/' + MAX_INTERSTITIALS + ' this session';

    overlay.appendChild(label);
    overlay.appendChild(hint);
    overlay.appendChild(counter);

    overlay.addEventListener('click', function () {
      overlay.remove();
    });

    document.body.appendChild(overlay);

    return true;
  }

  function showBanner() {
    var div = createBannerDiv();
    div.style.display = 'flex';
    bannerVisible = true;
  }

  function hideBanner() {
    var div = document.getElementById('ad-banner');
    if (div) div.style.display = 'none';
    bannerVisible = false;
  }

  window.Ads = {
    showInterstitial: showInterstitial,
    showBanner: showBanner,
    hideBanner: hideBanner,
    isBannerVisible: function () { return bannerVisible; },
    getInterstitialCount: function () { return interstitialCount; }
  };
})();
