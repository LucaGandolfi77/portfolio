// monetization.js — Ads, IAP, Subscription management
window.Monetization = (() => {
  let state = {
    adsEnabled: true,
    adsRemoved: false,
    premium: false,
    subscription: null, // null | 'monthly' | 'yearly'
    subscriptionExpiry: null,
    lastAdTime: 0,
    adCooldown: 30000, // 30s between ads
    rewardedAdCooldown: 90000, // 90s between rewarded ads
    lastRewardedAdTime: 0
  };

  const AD_COOLDOWN = 30000;
  const REWARDED_AD_COOLDOWN = 90000;

  // Pricing (EUR)
  const PRICING = {
    removeAds: { price: 2.99, id: 'remove_ads', desc: 'Rimuovi pubblicità' },
    premiumMonthly: { price: 4.99, id: 'premium_monthly', desc: 'Premium Mensile', features: ['No ads', '2x money', 'Exclusive skins'] },
    premiumYearly: { price: 39.99, id: 'premium_yearly', desc: 'Premium Annuale', features: ['No ads', '2x money', 'Exclusive skins', '33% sconto'] },
    coinPack500: { price: 0.99, id: 'coins_500', desc: '500 Monete' },
    coinPack2000: { price: 2.99, id: 'coins_2000', desc: '2000 Monete + 200 bonus' },
    coinPack5000: { price: 4.99, id: 'coins_5000', desc: '5000 Monete + 1000 bonus' },
    starterPack: { price: 1.99, id: 'starter_pack', desc: 'Starter Pack', features: ['1000 Monete', 'No ads (3gg)', '1 manager gratis'] }
  };

  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem('rdm_monetization'));
      if (saved) Object.assign(state, saved);
    } catch(e) {}
  }

  function save() {
    try {
      localStorage.setItem('rdm_monetization', JSON.stringify(state));
    } catch(e) {}
  }

  function isPremium() {
    if (state.premium) return true;
    if (state.subscription && state.subscriptionExpiry) {
      return Date.now() < state.subscriptionExpiry;
    }
    return false;
  }

  function isAdsRemoved() {
    return state.adsRemoved || isPremium();
  }

  function canShowAd() {
    if (isAdsRemoved()) return false;
    return Date.now() - state.lastAdTime > AD_COOLDOWN;
  }

  function canShowRewardedAd() {
    if (isAdsRemoved()) return false;
    return Date.now() - state.lastRewardedAdTime > REWARDED_AD_COOLDOWN;
  }

  function showInterstitial() {
    if (!canShowAd()) return Promise.resolve(false);
    state.lastAdTime = Date.now();
    save();

    // In production with Capacitor: await AdMob.showInterstitial()
    console.log('[Monetization] Interstitial ad would show here');
    return Promise.resolve(true);
  }

  function showRewarded() {
    if (!canShowRewardedAd()) return Promise.resolve({ shown: false });
    state.lastRewardedAdTime = Date.now();
    save();

    // In production: show rewarded ad, return reward on completion
    console.log('[Monetization] Rewarded ad would show here');
    return Promise.resolve({ shown: true, reward: 500 });
  }

  function purchase(packId) {
    const pack = Object.values(PRICING).find(p => p.id === packId);
    if (!pack) return Promise.resolve({ success: false, error: 'Invalid pack' });

    // In production: trigger Capacitor IAP
    console.log(`[Monetization] Purchase: ${pack.desc} (€${pack.price})`);

    switch (packId) {
      case 'remove_ads':
        state.adsRemoved = true;
        break;
      case 'premium_monthly':
        state.premium = true;
        state.subscription = 'monthly';
        state.subscriptionExpiry = Date.now() + 30 * 24 * 60 * 60 * 1000;
        break;
      case 'premium_yearly':
        state.premium = true;
        state.subscription = 'yearly';
        state.subscriptionExpiry = Date.now() + 365 * 24 * 60 * 60 * 1000;
        break;
      case 'coins_500':
        if (window.Save) { Save.addMoney(500); Save.save(); }
        break;
      case 'coins_2000':
        if (window.Save) { Save.addMoney(2200); Save.save(); }
        break;
      case 'coins_5000':
        if (window.Save) { Save.addMoney(6000); Save.save(); }
        break;
      case 'starter_pack':
        state.adsRemoved = true;
        if (window.Save) { Save.addMoney(1000); Save.save(); }
        break;
    }

    save();
    return Promise.resolve({ success: true, pack });
  }

  function restorePurchases() {
    // In production: query store for active purchases
    console.log('[Monetization] Restoring purchases...');
    return Promise.resolve({ success: true, restored: [] });
  }

  function getSubscriptionStatus() {
    if (!state.subscription) return null;
    const expired = state.subscriptionExpiry && Date.now() > state.subscriptionExpiry;
    return {
      type: state.subscription,
      active: !expired,
      expiry: state.subscriptionExpiry ? new Date(state.subscriptionExpiry).toLocaleDateString('it-IT') : null
    };
  }

  function renderStorePanel() {
    const subStatus = getSubscriptionStatus();
    const premium = isPremium();

    let productsHtml = '';

    // Starter Pack (only for non-premium)
    if (!premium) {
      const sp = PRICING.starterPack;
      productsHtml += `
        <div class="store-item" onclick="Monetization.purchase('${sp.id}')">
          <div class="store-emoji">🎁</div>
          <div class="store-info">
            <div class="store-name">${sp.desc}</div>
            <div class="store-desc">${sp.features.join(' · ')}</div>
          </div>
          <div class="store-price">€${sp.price}</div>
        </div>`;
    }

    // Remove Ads
    if (!state.adsRemoved && !premium) {
      const ra = PRICING.removeAds;
      productsHtml += `
        <div class="store-item" onclick="Monetization.purchase('${ra.id}')">
          <div class="store-emoji">🚫</div>
          <div class="store-info">
            <div class="store-name">${ra.desc}</div>
            <div class="store-desc">Gioca senza interruzioni</div>
          </div>
          <div class="store-price">€${ra.price}</div>
        </div>`;
    }

    // Premium subscriptions
    if (!premium) {
      const pm = PRICING.premiumMonthly;
      productsHtml += `
        <div class="store-item premium" onclick="Monetization.purchase('${pm.id}')">
          <div class="store-emoji">👑</div>
          <div class="store-info">
            <div class="store-name">${pm.desc}</div>
            <div class="store-desc">${pm.features.join(' · ')}</div>
          </div>
          <div class="store-price">€${pm.price}/mese</div>
        </div>`;

      const py = PRICING.premiumYearly;
      productsHtml += `
        <div class="store-item premium best-value" onclick="Monetization.purchase('${py.id}')">
          <div class="store-emoji">👑</div>
          <div class="store-info">
            <div class="store-name">${py.desc} ⭐</div>
            <div class="store-desc">${py.features.join(' · ')}</div>
          </div>
          <div class="store-price">€${py.price}/anno</div>
        </div>`;
    }

    // Coin packs (always available)
    ['coinPack500', 'coinPack2000', 'coinPack5000'].forEach(key => {
      const p = PRICING[key];
      productsHtml += `
        <div class="store-item" onclick="Monetization.purchase('${p.id}')">
          <div class="store-emoji">🪙</div>
          <div class="store-info">
            <div class="store-name">${p.desc}</div>
          </div>
          <div class="store-price">€${p.price}</div>
        </div>`;
    });

    const subHtml = subStatus ? `
      <div style="padding:8px 12px;background:var(--card2);border-radius:8px;margin:8px 0">
        <div style="font-size:11px;color:var(--dim)">Abbonamento attivo</div>
        <div style="font-size:13px;font-weight:700;color:var(--green)">${subStatus.type === 'monthly' ? 'Mensile' : 'Annuale'} — scade: ${subStatus.expiry}</div>
      </div>` : '';

    return `
      <div class="store-panel">
        <div style="text-align:center;margin-bottom:8px">
          <div style="font-size:11px;color:var(--dim)">${premium ? '👑 Premium Attivo' : '版本 Gratuito'}</div>
        </div>
        ${subHtml}
        ${productsHtml}
        <div style="text-align:center;margin-top:8px">
          <button class="btn small" onclick="Monetization.restorePurchases()" style="font-size:10px">🔄 Ripristina acquisti</button>
        </div>
      </div>`;
  }

  function getMoneyMultiplier() {
    return isPremium() ? 2 : 1;
  }

  load();

  return {
    load, save,
    isPremium, isAdsRemoved,
    canShowAd, canShowRewardedAd,
    showInterstitial, showRewarded,
    purchase, restorePurchases,
    getSubscriptionStatus,
    renderStorePanel,
    getMoneyMultiplier,
    PRICING
  };
})();
