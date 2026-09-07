// economy.js — Business, tasse, idle loop, guadagni offline
window.Economy = (() => {
  const BUSINESSES = [
    { id: 'limonata',   name: 'Bancarella di Limonate',  emoji: '🍋', baseCost: 50,      baseRate: 2,     type: 'food',     tier: 1, costMult: 1.15 },
    { id: 'pizza',      name: 'Pizza al Taglio',          emoji: '🍕', baseCost: 200,     baseRate: 8,     type: 'food',     tier: 1, costMult: 1.15 },
    { id: 'bar',        name: 'Bar Sport',                emoji: '☕', baseCost: 800,     baseRate: 25,    type: 'food',     tier: 2, costMult: 1.14 },
    { id: 'lavanderia', name: 'Lavanderia',               emoji: '🧺', baseCost: 3000,    baseRate: 80,    type: 'service',  tier: 2, costMult: 1.14 },
    { id: 'giornalaio', name: 'Giornalaio',               emoji: '📰', baseCost: 10000,   baseRate: 250,   type: 'media',    tier: 3, costMult: 1.13 },
    { id: 'palestra',   name: 'Palestra',                 emoji: '💪', baseCost: 35000,   baseRate: 800,   type: 'service',  tier: 3, costMult: 1.13 },
    { id: 'pizzeria',   name: 'Pizzeria Forno a Legna',   emoji: '🔥', baseCost: 100000,  baseRate: 2500,  type: 'food',     tier: 3, costMult: 1.12 },
    { id: 'startup',    name: 'Startup Tech',             emoji: '💻', baseCost: 350000,  baseRate: 8000,  type: 'tech',     tier: 4, costMult: 1.12 },
    { id: 'agenzia',    name: 'Agenzia Immobiliare',      emoji: '🏠', baseCost: 1200000, baseRate: 25000, type: 'service',  tier: 4, costMult: 1.11 },
    { id: 'fabbrica',   name: 'Fabbrica di Scuse',        emoji: '🏭', baseCost: 4000000, baseRate: 80000, type: 'industry', tier: 5, costMult: 1.10 },
    { id: 'banca',      name: 'Banca (quella vera)',      emoji: '🏦', baseCost: 15000000,baseRate: 250000,type: 'bank',     tier: 5, costMult: 1.09 },
    { id: 'media',      name: 'Media Company',            emoji: '📺', baseCost: 50000000,baseRate: 800000,type: 'media',    tier: 5, costMult: 1.08 },
    { id: 'partito',    name: 'Partito Politico',         emoji: '🏛️', baseCost: 200000000,baseRate: 0,    type: 'political',tier: 5, costMult: 1.07, generatesInfluence: 50 }
  ];

  function calcBuildingCost(b, level) {
    return Math.round(b.baseCost * Math.pow(b.costMult, level));
  }

  function calcBuildingRate(b, level, country) {
    let rate = b.baseRate * level;
    if (b.type === 'political') return 0;
    const c = World.getCountry(country);
    if (c) {
      if (c.bonus === b.type || c.bonus === 'all') {
        rate *= c.mult || 1.1;
      }
    }
    return rate;
  }

  function calcInfluenceRate(businesses) {
    let total = 0;
    BUSINESSES.forEach(b => {
      if (b.type === 'political' && b.generatesInfluence) {
        total += b.generatesInfluence * (businesses[b.id] || 0);
      }
    });
    return total;
  }

  function totalRate(state) {
    let total = 0;
    BUSINESSES.forEach(b => {
      const level = state.businesses[b.id] || 0;
      if (level > 0) total += calcBuildingRate(b, level, state.country);
    });
    return total;
  }

  function calcTaxRate(state) {
    const city = World.getCity(state.city);
    if (!city) return 0;
    const country = World.getCountry(city.country);
    const baseTax = country ? country.taxBase : 20;
    const mayorTax = state.mayorTax || 0;
    return Math.min(80, baseTax + mayorTax);
  }

  function netIncome(state) {
    const gross = totalRate(state);
    const taxRate = calcTaxRate(state);
    return gross * (1 - taxRate / 100);
  }

  function applyIdleEarnings(state) {
    const now = Date.now();
    const elapsed = Math.min(now - state.lastTick, (state.homeOfflineHours || 2) * 3600 * 1000);
    const sec = elapsed / 1000;
    if (sec < 1) return state;

    const gross = totalRate(state);
    const taxRate = calcTaxRate(state);
    const earned = Math.round(gross * sec * (1 - taxRate / 100));
    const tax = Math.round(gross * sec * (taxRate / 100));
    const infRate = calcInfluenceRate(state.businesses);
    const influence = Math.round(infRate * sec);

    state.money += earned;
    state.totalEarned += earned;
    state.taxPaid += tax;
    state.influence += influence;
    state.lastTick = now;

    return { state, earned, tax, influence, offline: sec > 60 };
  }

  function getUpgradeHint(businessId, level, money) {
    const b = BUSINESSES.find(x => x.id === businessId);
    if (!b) return null;
    const cost = calcBuildingCost(b, level);
    if (money < cost) return null;
    return { cost, rate: calcBuildingRate(b, level + 1, 'italia') };
  }

  return { BUSINESSES, calcBuildingCost, calcBuildingRate, calcInfluenceRate, totalRate,
           calcTaxRate, netIncome, applyIdleEarnings, getUpgradeHint };
})();
