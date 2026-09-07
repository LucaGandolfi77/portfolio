// prestige.js — Democrazia Totale prestige system
window.Prestige = (() => {
  function getTier(count, levels) {
    if (count >= 10 && levels >= 60) return { tier: 3, multPer10: 1.0, bonus: '+50 maxEnergy, unlock Partito Politico', energyBonus: 50 };
    if (count >= 3 && levels >= 30)  return { tier: 2, multPer10: 0.5, bonus: '+20 maxEnergy', energyBonus: 20 };
    return { tier: 1, multPer10: 0.25, bonus: '', energyBonus: 0 };
  }

  function calcMult(levels, prestigeCount) {
    const pt = getTier(prestigeCount || 0, levels || 0);
    return 1 + Math.floor((levels || 0) / 10) * pt.multPer10;
  }

  function totalLevels(state) {
    return state.totalBusinessLevels || 0;
  }

  function canPrestige(state) {
    return totalLevels(state) >= 10;
  }

  function getNextTierInfo(state) {
    const count = state.prestigeCount || 0;
    const levels = totalLevels(state);
    const current = getTier(count, levels);
    if (current.tier >= 3) return null;
    const next = getTier(count + 1, levels);
    return { current, next };
  }

  function doPrestige(state) {
    if (!canPrestige(state)) return false;
    const levels = totalLevels(state);
    const count = state.prestigeCount || 0;
    const pt = getTier(count, levels);
    const newMult = 1 + Math.floor(levels / 10) * pt.multPer10;

    // Reset gameplay state
    state.money = 100;
    state.businesses = {};
    state.home = 0;
    state.influence = 0;
    state.energy = 50;
    state.maxEnergy = 50;
    state.isMayor = false;
    state.mayorTax = 20;
    state.mayorFavors = [];
    state.totalBusinessLevels = 0;
    state.moveCount = 0;

    // Keep permanent state
    state.prestigeCount = count + 1;
    state.prestigeMultiplier = newMult;

    // Apply tier energy bonus
    const newTier = getTier(state.prestigeCount, 0);
    state.maxEnergy += newTier.energyBonus;
    state.energy = state.maxEnergy;

    return true;
  }

  function render(state) {
    const count = state.prestigeCount || 0;
    const levels = totalLevels(state);
    const mult = state.prestigeMultiplier || 1;
    const pt = getTier(count, levels);
    const next = getNextTierInfo(state);

    let tierBadge = '';
    if (pt.tier === 1) tierBadge = '🥉 Democrazia';
    else if (pt.tier === 2) tierBadge = '🥈 Repubblica';
    else tierBadge = '🥇 Impero';

    let html = `<div style="padding:12px">
      <div style="font-size:18px;font-weight:800;margin-bottom:4px">📜 Democrazia Totale</div>
      <div style="font-size:11px;color:var(--dim);margin-bottom:12px">Resetta il progresso per moltiplicatori permanenti</div>

      <div style="padding:10px;background:var(--card);border:1px solid var(--line);border-radius:10px;margin-bottom:8px">
        <div style="font-size:13px;font-weight:700">${tierBadge}</div>
        <div style="font-size:11px;color:var(--dim)">Prestige: ${count}x · Moltiplicatore: x${mult.toFixed(2)}</div>
        <div style="font-size:11px;color:var(--dim)">Livelli totali: ${levels}</div>
      </div>`;

    if (next) {
      const needed = next.next.tier === 2 ? 30 : 60;
      const neededCount = next.next.tier === 2 ? 3 : 10;
      const progress = Math.min(100, Math.round((levels / needed) * 100));
      const progressCount = Math.min(100, Math.round((count / neededCount) * 100));
      html += `<div style="padding:10px;background:var(--card2);border:1px solid var(--line);border-radius:10px;margin-bottom:8px">
        <div style="font-size:11px;font-weight:700;margin-bottom:4px">Prossimo tier: ${next.next.tier === 2 ? '🥈 Repubblica' : '🥇 Impero'}</div>
        <div style="font-size:10px;color:var(--dim)">Livelli: ${levels}/${needed} (${progress}%)</div>
        <div style="height:4px;background:var(--line);border-radius:2px;margin:3px 0"><div style="height:100%;width:${progress}%;background:var(--gold);border-radius:2px"></div></div>
        <div style="font-size:10px;color:var(--dim)">Prestige: ${count}/${neededCount} (${progressCount}%)</div>
        <div style="height:4px;background:var(--line);border-radius:2px;margin:3px 0"><div style="height:100%;width:${progressCount}%;background:var(--blue);border-radius:2px"></div></div>
        <div style="font-size:10px;color:var(--green);margin-top:4px">Bonus: ${next.next.bonus}</div>
      </div>`;
    } else {
      html += `<div style="padding:10px;background:var(--gold-light);border:1px solid var(--gold);border-radius:10px;margin-bottom:8px;text-align:center">
        <div style="font-size:12px;font-weight:700;color:var(--gold)">🏆 Tier Massimo Raggiunto!</div>
      </div>`;
    }

    if (canPrestige(state)) {
      const newMult = calcMult(levels, count);
      html += `<div style="padding:10px;background:var(--card);border:2px solid var(--gold);border-radius:10px;margin-bottom:8px">
        <div style="font-size:12px;font-weight:700;margin-bottom:4px">🔄 Prestige ora?</div>
        <div style="font-size:10px;color:var(--dim)">Nuovo moltiplicatore: x${newMult.toFixed(2)} (attuale: x${mult.toFixed(2)})</div>
        <div style="font-size:10px;color:var(--red);margin-top:4px">Perderai: soldi, business, casa, influenza</div>
        <div style="font-size:10px;color:var(--green)">Guadagnerai: moltiplicatore x${newMult.toFixed(2)}</div>
        <button class="btn primary" id="btn-prestige" style="margin-top:8px">🔄 Democrazia Totale</button>
      </div>`;
    } else {
      html += `<div style="padding:10px;background:var(--card2);border:1px solid var(--line);border-radius:10px;text-align:center">
        <div style="font-size:11px;color:var(--dim)">Hai bisogno di almeno 10 livelli totali per prestigiare</div>
        <div style="font-size:11px;color:var(--dim)">Attuali: ${levels}/10</div>
      </div>`;
    }

    html += `<button class="btn ghost" id="btn-back" style="margin-top:8px;width:100%">← Indietro</button></div>`;
    return html;
  }

  return { getTier, calcMult, canPrestige, doPrestige, render, totalLevels };
})();
