// monetization.js — Ads, IAP, Premium
window.Monetization = (() => {
  let state = { adsRemoved: false, premium: false, lastAdTime: 0, lastRewardedTime: 0 };
  const AD_COOLDOWN = 30000;
  const REWARDED_COOLDOWN = 90000;
  const PRICING = {
    removeAds: { price: 2.99, id: 'remove_ads', desc: 'Rimuovi pubblicità' },
    premium:   { price: 4.99, id: 'premium',     desc: 'Premium (no ads + 2x influenza)' },
    coins1000: { price: 0.99, id: 'coins_1000',  desc: '1000 Monete' },
    coins5000: { price: 2.99, id: 'coins_5000',  desc: '5000 Monete + 500 bonus' },
    starter:   { price: 1.99, id: 'starter',      desc: 'Starter Pack (1000€ + 3gg no ads)' }
  };

  function load() {
    try {
      const s = JSON.parse(localStorage.getItem('votopoli_monetization'));
      if (s) Object.assign(state, s);
    } catch(e) {}
  }

  function save() {
    try { localStorage.setItem('votopoli_monetization', JSON.stringify(state)); } catch(e) {}
  }

  function isPremium() { return state.premium; }
  function isAdsRemoved() { return state.adsRemoved || state.premium; }
  function canShowAd() { return !isAdsRemoved() && Date.now() - state.lastAdTime > AD_COOLDOWN; }
  function canShowRewarded() { return !isAdsRemoved() && Date.now() - state.lastRewardedTime > REWARDED_COOLDOWN; }

  function showInterstitial() {
    if (!canShowAd()) return Promise.resolve(false);
    state.lastAdTime = Date.now(); save();
    return Promise.resolve(true);
  }

  function showRewarded() {
    if (!canShowRewarded()) return Promise.resolve({ shown: false });
    state.lastRewardedTime = Date.now(); save();
    return Promise.resolve({ shown: true, reward: 500 });
  }

  function purchase(id) {
    const p = PRICING[id]; if (!p) return;
    switch (id) {
      case 'remove_ads': state.adsRemoved = true; break;
      case 'premium': state.premium = true; state.adsRemoved = true; break;
      case 'coins_1000': Save.addMoney(1000); break;
      case 'coins_5000': Save.addMoney(5500); break;
      case 'starter':
        state.adsRemoved = true;
        Save.addMoney(1000);
        break;
    }
    save();
  }

  function getMultiplier() { return state.premium ? 2 : 1; }

  function renderStore() {
    let html = '';
    if (!state.premium) {
      html += renderStoreItem('starter', '🎁', PRICING.starter.desc, '1000€ + 3gg no ads', PRICING.starter.price);
      html += renderStoreItem('remove_ads', '🚫', PRICING.removeAds.desc, 'Gioca senza interruzioni', PRICING.removeAds.price);
      html += renderStoreItem('premium', '👑', PRICING.premium.desc, 'No ads + 2x influenza', PRICING.premium.price);
    }
    html += renderStoreItem('coins_1000', '🪙', PRICING.coins1000.desc, '', PRICING.coins1000.price);
    html += renderStoreItem('coins_5000', '🪙', PRICING.coins5000.desc, '', PRICING.coins5000.price);
    return html;
  }

  function renderStoreItem(id, emoji, name, desc, price) {
    return `<div class="store-item" onclick="Monetization.purchase('${id}')">
      <div style="font-size:32px">${emoji}</div>
      <div style="flex:1"><div style="font-size:13px;font-weight:700">${name}</div>
      <div style="font-size:10px;color:var(--dim)">${desc}</div></div>
      <div style="font-size:14px;font-weight:800;color:var(--green)">€${price}</div>
    </div>`;
  }

  load();
  return { isPremium, isAdsRemoved, canShowAd, canShowRewarded, showInterstitial, showRewarded,
           purchase, getMultiplier, renderStore, PRICING };
})();
