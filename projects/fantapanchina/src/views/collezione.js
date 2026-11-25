/* ============================================================================
   COLLEZIONE — bauli, carte e mercante online simulato.
   Solo markup: nessun timer e nessuna mutazione dello stato.
   ============================================================================ */
import { esc } from './util.js';
import {
  RARITIES, RARITY_ORDER, ROLE_NAMES, ROLE_EMOJI, CHEST_TIERS, CHEST_TIER_ORDER,
  CHEST_SLOTS, CHEST_FREE_MS, PITY, MERCHANT, formatNum
} from '../config.js';
import { CATALOG, getCard, levelInfo, cardPower, rarityRank } from '../catalog.js';
import { chestStatus, duplicatesOf, rosterPlayerFor } from '../sim.js';

export function timeText(ms) {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
}

function levelPips(level) {
  return `<span class="fc-pips">${[1, 2, 3, 4, 5].map(i =>
    `<i class="${i <= level ? 'on' : ''}"></i>`).join('')}</span>`;
}

function copyWord(n) { return n === 1 ? 'copia' : 'copie'; }
function dupWord(n) { return n === 1 ? 'doppione' : 'doppioni'; }

function filterChip(action, value, label, active) {
  return `<button class="fchip ${active ? 'on' : ''}" data-action="${action}" data-value="${value}">${label}</button>`;
}

function segButton(value, label, active, badge) {
  return `<button class="seg-btn ${active ? 'on' : ''}" data-action="col-tab" data-sub="${value}">
    ${label}${badge ? `<b>${badge}</b>` : ''}</button>`;
}

export function html(state, ui) {
  ui = Object.assign({ sub: 'bauli', scope: 'tutte', role: 'all', rarity: 'all' }, ui || {});
  const cards = state.cards || {};
  const ownedIds = Object.keys(cards).filter(id => getCard(id));
  const duplicates = ownedIds.reduce((n, id) => n + duplicatesOf(state, id), 0);
  const copies = ownedIds.reduce((n, id) => n + (cards[id].copies || 0), 0);
  const ready = (state.chests || []).length;
  const queued = (state.chestQueue || []).length;
  const readyLabel = ready ? String(ready) + (queued ? '+' + queued : '') : '';
  const trades = (state.stats && state.stats.trades) || 0;
  const level5 = (state.stats && state.stats.level5) || 0;

  return `
  <div class="section-head">
    <div><h2>🃏 Collezione</h2>
      <p>${ownedIds.length}/${CATALOG.length} carte · ${copies} copie · ${duplicates} doppioni · ${level5} a Lv.5</p></div>
    <div class="col-badges">
      <span class="mini-badge">🧰 ${ready} pronti${queued ? ' · ' + queued + ' in coda' : ''}</span>
      <span class="mini-badge">🤝 ${trades} scambi</span>
    </div>
  </div>
  <div class="seg">
    ${segButton('bauli', '🧰 Bauli', ui.sub === 'bauli', readyLabel)}
    ${segButton('carte', '🃏 Carte', ui.sub === 'carte', '')}
    ${segButton('mercante', '🤝 Mercante', ui.sub === 'mercante', '')}
  </div>
  ${ui.sub === 'bauli' ? chestsHtml(state) : ui.sub === 'carte' ? cardsHtml(state, ui) : merchantHtml(state)}`;
}

/* ------------------------------------------------------------------ bauli */
function chestCard(chest) {
  const tier = CHEST_TIERS[chest.tier] || CHEST_TIERS.legno;
  return `<div class="chest-slot tier-${chest.tier}">
    <div class="chest-visual"><span>${tier.emoji}</span><i class="chest-shine"></i></div>
    <div class="cs-name">${tier.name}</div>
    <button class="chest-open" data-action="open-chest" data-id="${chest.id}">APRI</button>
  </div>`;
}

function queueHtml(state) {
  const queue = state.chestQueue || [];
  if (!queue.length) return '';
  return `<div class="chest-queue"><span>🎁 In coda</span>${queue.map(c => {
    const tier = CHEST_TIERS[c.tier] || CHEST_TIERS.legno;
    return `<i title="${esc(tier.name)}">${tier.emoji}</i>`;
  }).join('')}<small>si spostano appena si libera uno slot</small></div>`;
}

function shopCard(state, tierKey) {
  const tier = CHEST_TIERS[tierKey];
  const can = state.fc >= tier.price;
  const drops = RARITY_ORDER.map(r => {
    const w = tier.drops[r] || 0;
    return w > 0 ? `<span style="--rc:${RARITIES[r].color}">${w}% ${RARITIES[r].short}</span>` : '';
  }).join('');
  return `<article class="shop-card tier-${tierKey}">
    <div class="sc-top"><span class="sc-emoji">${tier.emoji}</span>
      <div><b>${tier.name}</b><small>${esc(tier.blurb)}</small></div></div>
    <div class="sc-min">${tier.minRarity && tier.minRarity !== 'comune'
      ? 'Garanzia: almeno ' + RARITIES[tier.minRarity].name
      : 'Nessuna garanzia minima'}</div>
    <div class="drop-odds">${drops}</div>
    <button class="sc-buy" data-action="chest-buy" data-tier="${tierKey}" ${can ? '' : 'disabled'}>
      💸 ${formatNum(tier.price)} FC</button>
  </article>`;
}

function chestsHtml(state) {
  const status = chestStatus(state);
  const pity = state.pity || {};
  const timer = status.full ? 'In pausa' : timeText(status.remaining);
  const progress = status.full ? 100 : Math.max(0, Math.min(100, (1 - status.remaining / CHEST_FREE_MS) * 100));
  const chests = state.chests || [];
  return `
  <div class="chest-board">
    <div class="chest-grid">
      ${Array.from({ length: CHEST_SLOTS }).map((_, i) => chests[i]
        ? chestCard(chests[i])
        : '<div class="chest-slot empty"><span class="cs-ico">✦</span><span class="cs-name">Slot libero</span></div>').join('')}
    </div>
    <div class="chest-timer-box">
      <div class="ct-head"><span>🪵 Baule gratuito</span><b data-chest-timer>${timer}</b></div>
      <div class="ct-bar"><i data-chest-bar style="width:${progress.toFixed(1)}%"></i></div>
      <p>${status.full ? 'Slot pieni: il timer riparte quando apri un baule.' : 'Un baule di legno ogni 6 minuti, anche offline.'}</p>
    </div>
    ${queueHtml(state)}
    <div class="pity-row">
      <span>🟣 Epico garantito tra <b>${Math.max(0, PITY.epico - (pity.epico || 0))}</b></span>
      <span>🟡 Leggendario tra <b>${Math.max(0, PITY.leggendario - (pity.leggendario || 0))}</b></span>
    </div>
  </div>
  <div class="section-head sub"><div><h2>Bottega dei bauli</h2><p>Compra con FC o conquistali giocando</p></div></div>
  <div class="chest-shop">${CHEST_TIER_ORDER.map(t => shopCard(state, t)).join('')}</div>
  <div class="hint-box">🥈 Ogni vittoria regala un baule argento · 🥇 ogni 5 vittorie un oro · 💎 ogni prestigio un diamante.</div>`;
}

/* ------------------------------------------------------------------ carte */
function cardTile(state, card) {
  const owned = (state.cards || {})[card.id];
  if (!owned) {
    return `<article class="fcard rarity-${card.rarity} locked">
      <div class="fc-top"><span class="fc-role r-${card.role}">${ROLE_EMOJI[card.role]} ${ROLE_NAMES[card.role].slice(0, 3)}</span>
        <span class="fc-rar">${RARITIES[card.rarity].name}</span></div>
      <div class="fc-art"><span>🔒</span></div>
      <div class="fc-name">???</div>
      <div class="fc-locked">Non posseduta</div>
    </article>`;
  }
  const lvl = levelInfo(owned.found);
  const power = cardPower(card, owned.found);
  const inRoster = rosterPlayerFor(state, card.id);
  return `<article class="fcard rarity-${card.rarity} owned ${inRoster ? 'in-roster' : ''}"
      data-action="card-detail" data-id="${card.id}" role="button" tabindex="0" aria-label="${esc(card.name)}">
    <div class="fc-top"><span class="fc-role r-${card.role}">${ROLE_EMOJI[card.role]} ${ROLE_NAMES[card.role].slice(0, 3)}</span>
      <span class="fc-rar">${RARITIES[card.rarity].name}</span></div>
    <div class="fc-art"><span>${ROLE_EMOJI[card.role]}</span></div>
    <div class="fc-name">${esc(card.name)}${inRoster ? ' <span class="fc-roster" title="In rosa">●</span>' : ''}</div>
    <div class="fc-rating">★ ${power.skill.toFixed(1)} <span>Q${power.quotazione}</span></div>
    <div class="fc-level">${levelPips(lvl.level)}<b>Lv.${lvl.level}</b>${owned.copies > 1 ? `<em>×${owned.copies}</em>` : ''}</div>
  </article>`;
}

function cardsHtml(state, ui) {
  const cards = state.cards || {};
  let list = CATALOG.slice();
  if (ui.scope === 'owned') list = list.filter(c => cards[c.id]);
  else if (ui.scope === 'dupes') list = list.filter(c => duplicatesOf(state, c.id) > 0);
  if (ui.role !== 'all') list = list.filter(c => c.role === ui.role);
  if (ui.rarity !== 'all') list = list.filter(c => c.rarity === ui.rarity);
  list.sort((a, b) => {
    const oa = cards[a.id] ? 1 : 0, ob = cards[b.id] ? 1 : 0;
    return ob - oa || rarityRank(b.rarity) - rarityRank(a.rarity) || b.skill - a.skill;
  });

  const scopes = [['tutte', 'Tutte'], ['owned', 'Possedute'], ['dupes', 'Doppioni']];
  const roles = [['all', 'Tutti'], ['P', '🧤 P'], ['D', '🛡️ D'], ['C', '⚙️ C'], ['A', '⚔️ A']];
  const rarities = [['all', 'Tutte le rarità']].concat(RARITY_ORDER.map(r => [r, RARITIES[r].name]));

  return `
  <div class="filter-stack">
    <div class="filter-row">${scopes.map(([v, l]) => filterChip('col-scope', v, l, ui.scope === v)).join('')}
      <span class="filter-sep"></span>
      ${roles.map(([v, l]) => filterChip('col-role', v, l, ui.role === v)).join('')}</div>
    <div class="filter-row small">${rarities.map(([v, l]) => filterChip('col-rarity', v, l, ui.rarity === v)).join('')}</div>
  </div>
  ${list.length ? `<div class="fcard-grid">${list.map(c => cardTile(state, c)).join('')}</div>`
    : '<div class="empty">Nessuna carta con questi filtri.</div>'}
  <div class="hint-box">🔁 I doppioni sono le copie oltre la prima: fanno salire di livello e si scambiano col mercante. La prima copia non si perde mai. Tocca una carta per la scheda completa.</div>`;
}

/* --------------------------------------------------------------- mercante */
function miniCard(card, qty, color) {
  return `<div class="mini-card rarity-${card.rarity}" style="--rc:${color || RARITIES[card.rarity].color}">
    <span class="mci">${ROLE_EMOJI[card.role]}</span>
    <div><b>${esc(card.name)}</b><small>${RARITIES[card.rarity].name} · ${ROLE_NAMES[card.role]}</small></div>
    ${qty ? `<em>×${qty}</em>` : ''}
  </div>`;
}

function offerCard(state, offer) {
  const give = getCard(offer.giveId);
  const want = offer.wantId ? getCard(offer.wantId) : null;
  if (!give) return '';
  const dup = want ? duplicatesOf(state, want.id) : 0;
  const can = offer.recovery ? state.fc >= offer.cost : dup >= offer.wantQty;
  return `<article class="merchant-offer">
    <header class="mo-head">
      <span class="mo-avatar" style="--tc:${offer.teamColor}">${offer.teamEmoji}</span>
      <div class="mo-team"><b>${esc(offer.teamName)}</b>
        <small><i class="online-dot"></i>${esc(offer.status)}${offer.nick ? ' · ' + esc(offer.nick) : ''}</small></div>
      <span class="mo-tag">${offer.recovery ? 'RECUPERO' : 'SCAMBIO'}</span>
    </header>
    <div class="mo-trade">
      <div class="mo-side"><span>CEDE</span>${miniCard(give, 0, offer.teamColor)}</div>
      <div class="mo-arrow">→</div>
      <div class="mo-side"><span>VUOLE</span>${want ? miniCard(want, offer.wantQty, offer.teamColor)
        : `<div class="mini-card fc-empty" style="--rc:${offer.teamColor}"><span class="mci">💸</span>
          <div><b>${offer.cost} FC</b><small>contributo trasferta</small></div></div>`}</div>
    </div>
    <div class="mo-foot">
      <span class="mo-note">${offer.recovery
        ? 'Nessun doppione? Prima carta in arrivo.'
        : `Hai ${dup} ${dupWord(dup)} · ${offer.wantQty === 1 ? 'ne serve 1' : 'ne servono ' + offer.wantQty}`}</span>
      <button class="trade-btn" data-action="merchant-trade" data-id="${offer.id}" ${can ? '' : 'disabled'}>
        ${offer.recovery ? 'Riscatta · ' + offer.cost + ' FC' : 'Scambia'}</button>
    </div>
  </article>`;
}

function tradeHistoryHtml(state) {
  const history = state.tradeHistory || [];
  if (!history.length) return '';
  return `<div class="trade-history"><h4>Ultimi scambi</h4>
    ${history.slice(0, 4).map(t => `<div class="th-row">
      <span>${t.teamEmoji || '🤝'}</span>
      <span>${t.gaveQty ? `${t.gaveQty}× ${esc(t.gaveName)} → ` : ''}${esc(t.gotName)}</span>
      <b>${t.cost ? t.cost + ' FC' : ''}</b>
    </div>`).join('')}</div>`;
}

function merchantHtml(state) {
  const m = state.merchant;
  const remaining = m && m.nextAt ? Math.max(0, m.nextAt - Date.now()) : MERCHANT.rotateMs;
  return `
  <div class="merchant-head">
    <div><h3>Mercante online</h3><p>Altri fantallenatori simulati, sempre pronti a trattare.</p></div>
    <div class="merchant-actions">
      <span class="mini-badge" data-merchant-timer>${timeText(remaining)}</span>
      <button class="chip-btn" data-action="merchant-reroll" ${state.fc < MERCHANT.rerollCost ? 'disabled' : ''}>
        🔄 Reroll ${MERCHANT.rerollCost} FC</button>
    </div>
  </div>
  ${!m || !m.offers.length ? '<div class="empty">Il mercante sta contando i doppioni...</div>'
    : `<div class="merchant-grid">${m.offers.map(o => offerCard(state, o)).join('')}</div>`}
  ${tradeHistoryHtml(state)}
  <div class="hint-box">🤝 Il mercante chiede solo doppioni. La prima copia di ogni carta resta tua: il livello non scende mai.</div>`;
}

/* --------------------------------------------------------------- modali */
export function cardDetailHtml(state, cardId) {
  const card = getCard(cardId);
  if (!card) return '';
  const owned = (state.cards || {})[cardId];
  if (!owned) {
    return `<div class="modal-icon">🔒</div><h2>${esc(card.name)}</h2>
      <p>Carta ${RARITIES[card.rarity].name} non ancora posseduta. Aprila in un baule o scambiala col mercante.</p>
      <button class="btn-primary" data-action="close-modal">CHIUDI</button>`;
  }
  const lvl = levelInfo(owned.found);
  const power = cardPower(card, owned.found);
  const dup = duplicatesOf(state, card.id);
  const inRoster = rosterPlayerFor(state, card.id);
  return `<div class="card-detail rarity-${card.rarity}">
    <div class="cd-hero">
      <div class="cd-art" style="--rc:${RARITIES[card.rarity].color}">${ROLE_EMOJI[card.role]}</div>
      <div><h2>${esc(card.name)}</h2>
        <div class="cm-tags"><span>${RARITIES[card.rarity].name}</span>
          <span>${ROLE_NAMES[card.role]}</span><span>Lv.${lvl.level}</span></div></div>
    </div>
    <div class="cd-stats">
      <div><b>★ ${power.skill.toFixed(1)}</b><small>Skill</small></div>
      <div><b>Q${power.quotazione}</b><small>Quotazione</small></div>
      <div><b>${Math.round(power.costanza * 100)}%</b><small>Costanza</small></div>
    </div>
    <div class="cd-level">${levelPips(lvl.level)}
      <span>${lvl.max ? 'Livello massimo' : `${owned.found}/${lvl.nextAt} copie · mancano ${lvl.toNext} ${copyWord(lvl.toNext)}`}</span></div>
    <div class="cd-progress"><i style="width:${(lvl.progress * 100).toFixed(1)}%"></i></div>
    <p class="cd-copies">Copie <b>${owned.copies}</b> · doppioni <b>${dup}</b> · trovate <b>${owned.found}</b></p>
    <p class="cd-desc">Bonus livello: +${((lvl.level - 1) * 0.4).toFixed(1)} skill,
      +${lvl.level - 1} quotazione, +${((lvl.level - 1) * 0.02).toFixed(2)} costanza.</p>
    ${inRoster
      ? `<div class="cd-roster">✅ In rosa come <b>${inRoster.titolare ? 'titolare' : 'panchina'}</b></div>
         <button class="btn-ghost" data-action="remove-card" data-id="${card.id}">Togli dalla rosa</button>`
      : `<button class="btn-primary" data-action="deploy-card" data-id="${card.id}">SCHIERA IN ROSA</button>`}
    <button class="btn-ghost" data-action="close-modal">CHIUDI</button>
  </div>`;
}

export function revealHtml(res) {
  if (!res || !res.card) return '';
  const card = res.card;
  const owned = res.owned || { copies: 1, found: 1 };
  const lvl = levelInfo(owned.found);
  const power = cardPower(card, owned.found);
  const eyebrow = res.source === 'trade'
    ? `🤝 AFFARE FATTO${res.team ? ' · ' + esc(res.team) : ''}`
    : `🎁 BAULE APERTO${res.tier ? ' · ' + esc(res.tier.name) : ''}`;
  return `<div class="reveal rarity-${card.rarity}">
    <div class="reveal-eyebrow">${eyebrow}</div>
    <div class="reveal-badge ${res.isNew ? 'new' : 'dup'}">${res.isNew ? '✨ NUOVA!' : '🔁 DOPPIONE +1'}</div>
    ${res.pityHit ? `<div class="reveal-pity">Garanzia ${RARITIES[res.pityHit].name} attivata</div>` : ''}
    <div class="reveal-card fcard rarity-${card.rarity} owned">
      <div class="fc-top"><span class="fc-role r-${card.role}">${ROLE_EMOJI[card.role]} ${ROLE_NAMES[card.role].slice(0, 3)}</span>
        <span class="fc-rar">${RARITIES[card.rarity].name}</span></div>
      <div class="fc-art"><span>${ROLE_EMOJI[card.role]}</span></div>
      <div class="fc-name">${esc(card.name)}</div>
      <div class="fc-rating">★ ${power.skill.toFixed(1)} <span>Q${power.quotazione}</span></div>
      <div class="fc-level">${levelPips(lvl.level)}<b>Lv.${lvl.level}</b></div>
    </div>
    ${res.levelUp ? `<div class="reveal-levelup">⬆️ LIVELLO ${res.levelAfter}!</div>` : ''}
    <div class="reveal-progress">${lvl.max ? 'Livello massimo raggiunto' : `Prossimo livello: ${lvl.toNext} ${copyWord(lvl.toNext)}`}</div>
    <p class="reveal-hint">${res.isNew
      ? 'La trovi nella collezione: schierala quando vuoi.'
      : 'La copia extra è scambiabile col mercante.'}</p>
    <button class="btn-primary" data-action="close-modal">CONTINUA</button>
    <button class="btn-ghost" data-action="goto-collezione">VAI ALLA COLLEZIONE</button>
  </div>`;
}

export function replaceHtml(state, cardId) {
  const card = getCard(cardId);
  if (!card) return '';
  const players = state.players.slice().sort((a, b) => a.skill - b.skill);
  return `<div class="modal-icon">🔁</div><h2>Rosa al completo</h2>
    <p>Scegli chi lascia il posto a <b>${esc(card.name)}</b>. Il giocatore sostituito resta in collezione.</p>
    <div class="replace-list">${players.map(p => `<button class="replace-row"
        data-action="choose-replace" data-card-id="${cardId}" data-out-id="${p.id}">
      <span class="rr-role r-${p.role}">${ROLE_EMOJI[p.role]}</span>
      <span class="rr-name">${esc(p.name)}${p.cardId ? ' <em>carta</em>' : ''}</span>
      <span class="rr-skill">★ ${p.skill.toFixed(1)}</span>
    </button>`).join('')}</div>
    <button class="btn-ghost" data-action="close-modal">ANNULLA</button>`;
}
