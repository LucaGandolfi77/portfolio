(function (root) {
  'use strict';
  const catalog = root.PORTFOLIO_CATALOG;
  if (!catalog) return;

  const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const labels = { ai: 'AI', audio: 'Audio', 'computer-vision': 'Vision', creative: 'Creative', data: 'Data', engineering: 'Engineering', tools: 'Tools', games: 'Games', quiz: 'Quiz', arcade: 'Arcade', multiplayer: 'Multiplayer', cards: 'Cards', party: 'Party', strategy: 'Strategy', puzzle: 'Puzzle', story: 'Story', simulation: 'Simulation' };

  function renderCards(container, items) {
    container.innerHTML = items.map((item, index) => `<a class="catalog-card" href="${escapeHtml(item.href)}">
      <div class="catalog-card__header"><span class="catalog-card__icon" aria-hidden="true">${escapeHtml(item.icon || item.emoji || '◈')}</span><span class="catalog-card__index">${String(index + 1).padStart(2, '0')}</span></div>
      <h3 class="catalog-card__title">${escapeHtml(item.title)}</h3>
      <p class="catalog-card__description">${escapeHtml(item.description)}</p>
      <div class="catalog-badges">${(item.badges || [item.badge]).filter(Boolean).slice(0, 3).map((badge) => `<span class="catalog-badge">${escapeHtml(badge)}</span>`).join('')}</div>
      <div class="catalog-card__footer"><span class="catalog-card__meta">${escapeHtml(labels[item.category] || item.category || 'Project')} · Open →</span></div>
    </a>`).join('');
  }

  function init() {
    const projects = document.getElementById('projectsContainer');
    const games = document.getElementById('gamesFeaturedGrid');
    if (projects) {
      renderCards(projects, catalog.projects.filter((item) => item.featured).slice(0, 2));
      const allLink = document.createElement('a');
      allLink.href = 'projects.html';
      allLink.className = 'btn btn-ghost';
      allLink.style.cssText = 'display:block;text-align:center;margin-top:12px;text-decoration:none;';
      allLink.innerHTML = 'Vedi tutti i progetti <span aria-hidden="true">→</span>';
      projects.after(allLink);
    }
    if (games) {
      renderCards(games, catalog.games.filter((item) => item.featured).slice(0, 2));
      const allLink = document.createElement('a');
      allLink.href = 'games.html';
      allLink.className = 'btn btn-ghost';
      allLink.style.cssText = 'display:block;text-align:center;margin-top:12px;text-decoration:none;';
      allLink.innerHTML = 'Vedi tutti i giochi <span aria-hidden="true">→</span>';
      games.after(allLink);
    }
    document.getElementById('legacyGamesContainer')?.remove();
  }

  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', init) : init();
}(window));
