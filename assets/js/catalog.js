(function (root) {
  'use strict';
  const catalog = root.PORTFOLIO_CATALOG;
  if (!catalog) return;

  const state = { query: '', category: 'all', sort: 'featured', favoritesOnly: false };
  const labels = { all: 'All', ai: 'AI', audio: 'Audio', 'computer-vision': 'Vision', creative: 'Creative', data: 'Data', engineering: 'Engineering', tools: 'Tools', games: 'Games', quiz: 'Quiz', arcade: 'Arcade', action: 'Action', multiplayer: 'Multiplayer', cards: 'Cards', party: 'Party', strategy: 'Strategy', puzzle: 'Puzzle', story: 'Story', simulation: 'Simulation', accessibility: 'Accessibility' };

  function getRoot() { return document.querySelector('[data-catalog]'); }
  function getItems() { return catalog[getRoot()?.dataset.catalog] || []; }
  function resolveHref(item) {
    const rootEl = getRoot();
    const siteRoot = rootEl?.dataset.siteRoot || '';
    return `${siteRoot}${item.href}`;
  }
  function favoriteKey(item) { return `portfolio.favorite.${item.type}.${item.id}`; }
  function isFavorite(item) { try { return localStorage.getItem(favoriteKey(item)) === '1'; } catch (e) { return false; } }
  function setFavorite(item, value) { try { localStorage.setItem(favoriteKey(item), value ? '1' : '0'); } catch (e) {} }
  function escapeHtml(value) { return String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char])); }
  function matches(item) {
    const haystack = [item.title, item.description, item.category, ...(item.badges || []), ...(item.technologies || [])].join(' ').toLowerCase();
    return (!state.query || haystack.includes(state.query)) && (state.category === 'all' || item.category === state.category) && (!state.favoritesOnly || isFavorite(item));
  }
  function sorted(items) {
    return items.slice().sort((a, b) => state.sort === 'alpha' ? a.title.localeCompare(b.title) : Number(b.featured) - Number(a.featured) || a.title.localeCompare(b.title));
  }
  /* ---- raccolta "Quiz": tutti i quiz in un'unica card ---- */
  const QUIZ_GROUP = { category: 'quiz', hubId: 'quiz-lab', title: 'Quiz & Personality', icon: '🎯' };

  function groupBadges(children) {
    const freq = {};
    children.forEach((c) => (c.badges || []).forEach((b) => { freq[b] = (freq[b] || 0) + 1; }));
    return Object.keys(freq).sort((a, b) => freq[b] - freq[a]).slice(0, 3);
  }
  function groupItem(item, favorite) {
    const desc = String(item.description || '');
    const short = desc.length > 110 ? desc.slice(0, 110).replace(/\s+\S*$/, '') + '…' : desc;
    return `<div class="catalog-group__item${favorite ? ' is-favorite' : ''}">
      <a class="catalog-group__link" href="${escapeHtml(resolveHref(item))}" data-card-id="${escapeHtml(item.id)}">
        <span class="catalog-group__icon" aria-hidden="true">${escapeHtml(item.icon || '❓')}</span>
        <span class="catalog-group__text">
          <span class="catalog-group__title">${escapeHtml(item.title)}</span>
          <span class="catalog-group__desc">${escapeHtml(short)}</span>
        </span>
      </a>
      <button class="catalog-group__fav" type="button" aria-label="${favorite ? 'Remove from favorites' : 'Add to favorites'}" aria-pressed="${favorite}" data-favorite-id="${escapeHtml(item.id)}">${favorite ? '★' : '☆'}</button>
    </div>`;
  }
  function groupCard({ hub, children }, index) {
    const badges = groupBadges(children).map((b) => `<span class="catalog-badge">${escapeHtml(b)}</span>`).join('');
    const hubLink = hub ? `<a class="catalog-group__hub" href="${escapeHtml(resolveHref(hub))}">🧪 ${escapeHtml(hub.title)} — apri la collezione →</a>` : '';
    return `<div class="catalog-card catalog-card--group" data-card-id="quiz-collection">
      <div class="catalog-card__header">
        <span class="catalog-card__icon" aria-hidden="true">${escapeHtml(QUIZ_GROUP.icon)}</span>
        <span class="catalog-card__index">${String(index + 1).padStart(2, '0')} · collection</span>
      </div>
      <h3 class="catalog-card__title">${escapeHtml(QUIZ_GROUP.title)} <span class="catalog-group__count">${children.length}</span></h3>
      <p class="catalog-card__description">Tutti i quiz in un’unica card: personalità, cultura, demenziali e test seri. Scegli un quiz qui sotto o apri il lab completo.</p>
      <div class="catalog-badges">${badges}</div>
      <div class="catalog-group__grid">${children.map((c) => groupItem(c, isFavorite(c))).join('')}</div>
      <div class="catalog-card__footer">
        <span class="catalog-card__meta">Quiz · ${children.length} test</span>
        ${hubLink}
      </div>
    </div>`;
  }
  function card(item, index) {
    const favorite = isFavorite(item);
    const badges = (item.badges || []).slice(0, 3).map((badge) => `<span class="catalog-badge">${escapeHtml(badge)}</span>`).join('');
    return `<a class="catalog-card ${favorite ? 'is-favorite' : ''}" href="${escapeHtml(resolveHref(item))}" data-card-id="${escapeHtml(item.id)}">
      <div class="catalog-card__header"><span class="catalog-card__icon" aria-hidden="true">${escapeHtml(item.icon || '◈')}</span><span class="catalog-card__index">${String(index + 1).padStart(2, '0')}</span></div>
      <h3 class="catalog-card__title">${escapeHtml(item.title)}</h3>
      <p class="catalog-card__description">${escapeHtml(item.description)}</p>
      <div class="catalog-badges">${badges}</div>
      <div class="catalog-card__footer"><span class="catalog-card__meta">${escapeHtml(labels[item.category] || item.category)} · Open →</span><button class="catalog-card__favorite" type="button" aria-label="${favorite ? 'Remove from favorites' : 'Add to favorites'}" aria-pressed="${favorite}" data-favorite-id="${escapeHtml(item.id)}">${favorite ? '★' : '☆'}</button></div>
    </a>`;
  }
  function render() {
    const rootEl = getRoot(); if (!rootEl) return;
    const grid = rootEl.querySelector('[data-catalog-grid]');
    if (!grid) return;

    // La raccolta quiz vive solo nell'archivio dei progetti;
    // negli altri cataloghi (es. games) i quiz sono giochi veri e restano card singole.
    if ((rootEl.dataset.catalog || '') !== 'projects') {
      const result = sorted(getItems().filter(matches));
      grid.innerHTML = result.length ? result.map(card).join('') : '<div class="catalog-empty">No matching items. Clear a filter or try another search.</div>';
      const status = rootEl.querySelector('[data-catalog-status]');
      if (status) status.textContent = `Showing ${result.length} of ${getItems().length} ${rootEl.dataset.catalog}`;
      rootEl.querySelectorAll('[data-favorite-id]').forEach((button) => button.addEventListener('click', (event) => {
        event.preventDefault(); event.stopPropagation();
        const item = getItems().find((entry) => entry.id === button.dataset.favoriteId);
        if (item) { setFavorite(item, !isFavorite(item)); render(); }
      }));
      return;
    }

    const items = getItems();
    const quiz = items.filter((i) => i.category === QUIZ_GROUP.category);
    const rest = items.filter((i) => i.category !== QUIZ_GROUP.category);
    const hub = quiz.find((i) => i.id === QUIZ_GROUP.hubId) || null;
    const children = quiz.filter((i) => i !== hub);
    const catOk = state.category === 'all' || state.category === QUIZ_GROUP.category;

    const restMatched = sorted(rest.filter(matches));
    const childrenMatched = catOk ? sorted(children.filter(matches)) : [];
    const hubMatched = !!(catOk && hub && matches(hub));
    const showGroup = !!(childrenMatched.length || hubMatched);

    // ordina le card visibili (la raccolta quiz partecipa come una card)
    const ordered = [];
    restMatched.forEach((i) => ordered.push({ kind: 'item', item: i }));
    if (showGroup) ordered.push({
      kind: 'group',
      featured: childrenMatched.some((c) => c.featured),
      title: QUIZ_GROUP.title
    });
    ordered.sort((a, b) => {
      const at = (a.item || a).title, bt = (b.item || b).title;
      const af = (a.item || a).featured, bf = (b.item || b).featured;
      return state.sort === 'alpha' ? at.localeCompare(bt) : Number(bf) - Number(af) || at.localeCompare(bt);
    });

    grid.innerHTML = ordered.length ? ordered.map((entry, i) => entry.kind === 'group'
      ? groupCard({ hub: hubMatched ? hub : null, children: childrenMatched }, i)
      : card(entry.item, i)).join('')
      : '<div class="catalog-empty">No matching items. Clear a filter or try another search.</div>';

    const visibleCount = restMatched.length + childrenMatched.length + (hubMatched ? 1 : 0);
    const totalCount = rest.length + children.length + (hub ? 1 : 0);
    const status = rootEl.querySelector('[data-catalog-status]');
    if (status) status.textContent = `Showing ${visibleCount} of ${totalCount} ${rootEl.dataset.catalog}`;

    rootEl.querySelectorAll('[data-favorite-id]').forEach((button) => button.addEventListener('click', (event) => {
      event.preventDefault(); event.stopPropagation();
      const item = getItems().find((entry) => entry.id === button.dataset.favoriteId);
      if (item) { setFavorite(item, !isFavorite(item)); render(); }
    }));
  }
  function renderFilters() {
    const rootEl = getRoot(); if (!rootEl) return;
    const used = [...new Set(getItems().map((item) => item.category))];
    const filters = rootEl.querySelector('[data-catalog-filters]');
    filters.innerHTML = ['all', ...used].map((category) => `<button class="catalog-filter" type="button" data-category="${category}" aria-pressed="${state.category === category}">${labels[category] || category}</button>`).join('');
    filters.querySelectorAll('[data-category]').forEach((button) => button.addEventListener('click', () => { state.category = button.dataset.category; renderFilters(); render(); }));
  }
  function init() {
    const rootEl = getRoot(); if (!rootEl) return;
    const search = rootEl.querySelector('[data-catalog-search]');
    const sort = rootEl.querySelector('[data-catalog-sort]');
    const favorites = rootEl.querySelector('[data-catalog-favorites]');
    const clear = rootEl.querySelector('[data-catalog-clear]');
    search?.addEventListener('input', () => { state.query = search.value.trim().toLowerCase(); render(); });
    sort?.addEventListener('change', () => { state.sort = sort.value; render(); });
    favorites?.addEventListener('click', () => { state.favoritesOnly = !state.favoritesOnly; favorites.setAttribute('aria-pressed', String(state.favoritesOnly)); favorites.textContent = state.favoritesOnly ? 'Showing favorites' : 'Favorites only'; render(); });
    clear?.addEventListener('click', () => { state.query = ''; state.category = 'all'; state.sort = 'featured'; state.favoritesOnly = false; if (search) search.value = ''; if (sort) sort.value = 'featured'; if (favorites) { favorites.setAttribute('aria-pressed', 'false'); favorites.textContent = 'Favorites only'; } renderFilters(); render(); });
    renderFilters(); render();
  }
  root.Catalog = { init, render };
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', init) : init();
}(window));
