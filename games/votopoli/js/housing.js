// housing.js — Sistema abitazioni
window.Housing = (() => {
  function getHomeUpgradeCost(currentTier, cityId) {
    const home = World.getHome(currentTier + 1);
    const city = World.getCity(cityId);
    if (!home || !city) return Infinity;
    const country = World.getCountry(city.country);
    const housingMult = country ? country.housingMult : 1.0;
    return Math.round(home.upgradeCost * city.costMult * housingMult);
  }

  function getHomeInfo(tier) {
    return World.getHome(tier) || World.getHome(0);
  }

  function canUpgrade(currentTier, cityId, money) {
    const cost = getHomeUpgradeCost(currentTier, cityId);
    return money >= cost && currentTier < 7;
  }

  function upgrade(state) {
    if (!canUpgrade(state.home, state.city, state.money)) return false;
    const cost = getHomeUpgradeCost(state.home, state.city);
    state.money -= cost;
    state.home++;
    const home = getHomeInfo(state.home);
    state.maxEnergy = 50 + home.energyBonus;
    return true;
  }

  function applyHomeBonus(state) {
    const home = getHomeInfo(state.home);
    state.maxEnergy = 50 + home.energyBonus;
    state.homeOfflineHours = home.offlineHours;
    return state;
  }

  return { getHomeUpgradeCost, getHomeInfo, canUpgrade, upgrade, applyHomeBonus };
})();
