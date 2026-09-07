// party.js — Political party system
window.Party = (() => {
  const PARTIES = [
    { id: 'pane',    name: 'Partito del Pane',      emoji: '🍞', desc: '+15% business alimentari',    bonus: 'business', bonusType: 'alimentary', bonusPct: 15,  dailyBonus: 100,  dailyDesc: '€100/giorno dal Pane' },
    { id: 'nanna',   name: 'Partito della Nanna',    emoji: '😴', desc: '+20% guadagni offline',       bonus: 'offline', bonusPct: 20,                       dailyBonus: 0,    dailyDesc: '+2h offline cap', extraOffline: 2 },
    { id: 'automi',  name: 'Partito degli Automi',   emoji: '🤖', desc: '+25% business tech',          bonus: 'business', bonusType: 'tech', bonusPct: 25,  dailyBonus: 0,    dailyDesc: '1 voto gratis/week', autoVote: true },
    { id: 'caos',    name: 'Partito del Caos',       emoji: '🎪', desc: '+10% ricompense minigiochi',  bonus: 'minigame', bonusPct: 10,                       dailyBonus: 0,    dailyDesc: 'Eventi casuali bonus', randomEvents: true },
    { id: 'romanzi', name: 'Partito della Romania',  emoji: '🏛️', desc: '-10% tasse',                  bonus: 'tax',      bonusPct: 10,                       dailyBonus: 0,    dailyDesc: '1 favore gratis/elezione', freeFavor: true }
  ];

  function getAll() { return PARTIES; }

  function get(partyId) { return PARTIES.find(p => p.id === partyId); }

  function getCurrent(state) { return state.party ? get(state.party) : null; }

  function join(state, partyId) {
    state.party = partyId;
    return true;
  }

  function leave(state) {
    state.party = null;
    return true;
  }

  function getBusinessBonus(state) {
    const party = getCurrent(state);
    if (!party || party.bonus !== 'business') return 0;
    return party.bonusPct;
  }

  function getOfflineBonus(state) {
    const party = getCurrent(state);
    if (!party || party.bonus !== 'offline') return 0;
    return party.bonusPct;
  }

  function getMinigameBonus(state) {
    const party = getCurrent(state);
    if (!party || party.bonus !== 'minigame') return 0;
    return party.bonusPct;
  }

  function getTaxRelief(state) {
    const party = getCurrent(state);
    if (!party || party.bonus !== 'tax') return 0;
    return party.bonusPct;
  }

  function getExtraOfflineHours(state) {
    const party = getCurrent(state);
    if (!party || !party.extraOffline) return 0;
    return party.extraOffline;
  }

  function hasFreeFavor(state) {
    const party = getCurrent(state);
    return party && party.freeFavor;
  }

  function hasAutoVote(state) {
    const party = getCurrent(state);
    return party && party.autoVote;
  }

  function hasRandomEvents(state) {
    const party = getCurrent(state);
    return party && party.randomEvents;
  }

  function render(state) {
    const current = getCurrent(state);
    const html = PARTIES.map(p => {
      const isCurrent = current && current.id === p.id;
      return `<div class="city-card ${isCurrent ? 'selected' : ''}" data-party="${p.id}" style="${isCurrent ? 'border-color:var(--gold)' : ''}">
        <div style="font-size:24px">${p.emoji}</div>
        <div style="flex:1">
          <div style="font-size:12px;font-weight:700">${p.name}</div>
          <div style="font-size:10px;color:var(--dim)">${p.desc}</div>
          <div style="font-size:9px;color:var(--gold)">Perk: ${p.dailyDesc}</div>
        </div>
        ${isCurrent ? '<div style="font-size:10px;color:var(--green);font-weight:700">📍 Membro</div>' : ''}
      </div>`;
    }).join('');

    return `<div style="padding:12px">
      <div style="font-size:18px;font-weight:800;margin-bottom:8px">🏛️ Partiti Politici</div>
      <div style="font-size:11px;color:var(--dim);margin-bottom:12px">${current ? `Membro di: ${current.emoji} ${current.name}` : 'Scegli un partito per i bonus passivi'}</div>
      ${current ? '<button class="btn small ghost" id="btn-leave-party" style="margin-bottom:8px;width:100%">🚪 Lascia il partito</button>' : ''}
      <div style="max-height:55vh;overflow-y:auto">${html}</div>
      <button class="btn ghost" id="btn-back" style="margin-top:8px;width:100%">← Indietro</button>
    </div>`;
  }

  return { getAll, get, getCurrent, join, leave, getBusinessBonus, getOfflineBonus, getMinigameBonus, getTaxRelief, getExtraOfflineHours, hasFreeFavor, hasAutoVote, hasRandomEvents, render };
})();
