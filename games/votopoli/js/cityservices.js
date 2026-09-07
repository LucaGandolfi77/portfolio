// cityservices.js — Mayor's city services
window.CityServices = (() => {
  const SERVICES = [
    { id: 'park',      name: 'Parco Comunale',    emoji: '🌳', desc: 'Riduce le tasse del 2%',            cost: 5000,   taxRelief: 2,  incomeBoost: 0,  energyBonus: 0,  unlockTier: 1 },
    { id: 'school',    name: 'Scuola Pubblica',    emoji: '🏫', desc: 'Aumenta il reddito dei business +10%', cost: 15000,  taxRelief: 0,  incomeBoost: 10, energyBonus: 0,  unlockTier: 2 },
    { id: 'hospital',  name: 'Ospedale',           emoji: '🏥', desc: 'Aumenta la max energy +20',          cost: 30000,  taxRelief: 0,  incomeBoost: 0,  energyBonus: 20, unlockTier: 3 },
    { id: 'court',     name: 'Tribunale',          emoji: '🏛️', desc: 'Riduce tasse -5%, scandali -20%',     cost: 50000,  taxRelief: 5,  incomeBoost: 0,  energyBonus: 0,  unlockTier: 4 },
    { id: 'airport',   name: 'Aeroporto',          emoji: '🚀', desc: '+20% tutti i redditi, costi trasferimento -30%', cost: 100000, taxRelief: 0, incomeBoost: 20, energyBonus: 0, unlockTier: 5 }
  ];

  function getAvailable(cityTier) {
    return SERVICES.filter(s => cityTier >= s.unlockTier);
  }

  function isOwned(state, serviceId) {
    return state.cityServices && state.cityServices[serviceId];
  }

  function canBuy(state, serviceId, cityTier) {
    const svc = SERVICES.find(s => s.id === serviceId);
    if (!svc) return false;
    if (cityTier < svc.unlockTier) return false;
    if (isOwned(state, serviceId)) return false;
    return state.money >= svc.cost;
  }

  function buy(state, serviceId) {
    const svc = SERVICES.find(s => s.id === serviceId);
    if (!svc) return false;
    if (!canBuy(state, serviceId, 5)) return false;
    state.money -= svc.cost;
    if (!state.cityServices) state.cityServices = {};
    state.cityServices[serviceId] = true;
    return true;
  }

  function getTaxRelief(state) {
    if (!state.cityServices) return 0;
    return SERVICES.filter(s => state.cityServices[s.id]).reduce((sum, s) => sum + s.taxRelief, 0);
  }

  function getIncomeBoost(state) {
    if (!state.cityServices) return 0;
    return SERVICES.filter(s => state.cityServices[s.id]).reduce((sum, s) => sum + s.incomeBoost, 0);
  }

  function getEnergyBonus(state) {
    if (!state.cityServices) return 0;
    return SERVICES.filter(s => state.cityServices[s.id]).reduce((sum, s) => sum + s.energyBonus, 0);
  }

  function getMoveCostReduction(state) {
    if (!state.cityServices || !state.cityServices.airport) return 0;
    return 30;
  }

  function render(state, cityTier) {
    const available = getAvailable(cityTier);
    if (!available.length) return '';

    const html = available.map(s => {
      const owned = isOwned(state, s.id);
      const canAfford = canBuy(state, s.id, cityTier);
      return `<div class="bld-row">
        <div style="font-size:24px">${s.emoji}</div>
        <div style="flex:1">
          <div style="font-size:12px;font-weight:700">${s.name}</div>
          <div style="font-size:10px;color:var(--dim)">${s.desc}</div>
        </div>
        ${owned
          ? '<div style="font-size:10px;color:var(--green);font-weight:700">✅ Posseduto</div>'
          : `<button class="btn small ${canAfford ? 'primary' : ''}" id="svc-${s.id}" ${canAfford ? '' : 'disabled'}>${Save.formatMoney(s.cost)}</button>`
        }
      </div>`;
    }).join('');

    return `<div style="margin:8px 0;padding:8px 10px;background:var(--card);border:1px solid var(--line);border-radius:10px">
      <div style="font-size:12px;font-weight:700;margin-bottom:4px">🏛️ Servizi Civici</div>
      ${html}
    </div>`;
  }

  return { SERVICES, getAvailable, isOwned, canBuy, buy, getTaxRelief, getIncomeBoost, getEnergyBonus, getMoveCostReduction, render };
})();
