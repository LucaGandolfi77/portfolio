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
    const result = sorted(getItems().filter(matches));
    grid.innerHTML = result.length ? result.map(card).join('') : '<div class="catalog-empty">No matching items. Clear a filter or try another search.</div>';
    const status = rootEl.querySelector('[data-catalog-status]');
    if (status) status.textContent = `Showing ${result.length} of ${getItems().length} ${rootEl.dataset.catalog}`;
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
