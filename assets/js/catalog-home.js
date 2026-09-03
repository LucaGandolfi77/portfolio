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
    const interests = document.getElementById('interestsContainer');

    function makeScrollable(container, items, type) {
      if (!container) return;
      renderCards(container, items);
      container.style.display = 'flex';
      container.style.overflowX = 'auto';
      container.style.scrollSnapType = 'x mandatory';
      container.style.gap = '16px';
      container.style.padding = '0 20px';
      container.style.WebkitOverflowScrolling = 'touch';
      container.style.scrollBehavior = 'smooth';
      container.querySelectorAll('.catalog-card').forEach(function(card) {
        card.style.flex = '0 0 auto';
        card.style.width = 'calc(100vw - 80px)';
        card.style.scrollSnapAlign = 'start';
      });
    }

    if (projects) {
      makeScrollable(projects, catalog.projects.filter(function(item) { return item.featured; }), 'projects');
      var allLink = document.createElement('a');
      allLink.href = 'projects.html';
      allLink.className = 'btn btn-ghost';
      allLink.style.cssText = 'display:block;text-align:center;margin-top:12px;text-decoration:none;';
      allLink.innerHTML = 'Vedi tutti i progetti <span aria-hidden="true">\2192</span>';
      projects.after(allLink);
    }
    if (games) {
      makeScrollable(games, catalog.games.filter(function(item) { return item.featured; }), 'games');
      var allLink = document.createElement('a');
      allLink.href = 'games.html';
      allLink.className = 'btn btn-ghost';
      allLink.style.cssText = 'display:block;text-align:center;margin-top:12px;text-decoration:none;';
      allLink.innerHTML = 'Vedi tutti i giochi <span aria-hidden="true">\2192</span>';
      games.after(allLink);
    }
    if (interests) {
      interests.style.display = 'flex';
      interests.style.overflowX = 'auto';
      interests.style.scrollSnapType = 'x mandatory';
      interests.style.gap = '16px';
      interests.style.padding = '0 20px';
      interests.style.WebkitOverflowScrolling = 'touch';
      interests.style.scrollBehavior = 'smooth';
      Array.prototype.forEach.call(interests.querySelectorAll('.showcase-card'), function(card) {
        card.style.flex = '0 0 auto';
        card.style.width = 'calc(100vw - 80px)';
        card.style.scrollSnapAlign = 'start';
      });
    }
    document.getElementById('legacyGamesContainer') && document.getElementById('legacyGamesContainer').remove();
  }

  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', init) : init();
}(window));
