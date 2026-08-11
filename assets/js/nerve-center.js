// === NERVE CENTER ===
// Live dashboard: GitHub stats (public API, cached) + real-time site vitals.
// Uses only free public APIs — no keys needed.

(function () {
    'use strict';

    const GITHUB_USER = 'LucaGandolfi77';
    const CACHE_KEY = 'nerve_github_v1';
    const CACHE_TTL = 10 * 60 * 1000; // 10 minutes (respects 60 req/h rate limit)

    const LANG_COLORS = {
        'JavaScript': '#f1e05a', 'TypeScript': '#3178c6', 'HTML': '#e34c26',
        'CSS': '#563d7c', 'Python': '#3572A5', 'C': '#555555', 'C++': '#f34b7d',
        'Java': '#b07219', 'Go': '#00ADD8', 'Rust': '#dea584', 'Shell': '#89e051',
        'Jupyter Notebook': '#DA5B0B', 'Ruby': '#701516', 'PHP': '#4F5D95',
        'Vue': '#41b883', 'Dart': '#00B4AB', 'Kotlin': '#A97BFF'
    };

    function $(id) { return document.getElementById(id); }

    function saveCache(data) {
        try { localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data: data })); } catch (e) {}
    }

    function loadCache() {
        try {
            const raw = localStorage.getItem(CACHE_KEY);
            if (!raw) return null;
            const c = JSON.parse(raw);
            if (!c.data || Date.now() - c.ts > CACHE_TTL) return null;
            return c.data;
        } catch (e) { return null; }
    }

    async function fetchGitHub(force) {
        if (!force) {
            const cached = loadCache();
            if (cached) return cached;
        }
        try {
            const [userRes, reposRes] = await Promise.all([
                fetch('https://api.github.com/users/' + GITHUB_USER, { headers: { 'Accept': 'application/vnd.github+json' } }),
                fetch('https://api.github.com/users/' + GITHUB_USER + '/repos?per_page=100&sort=updated', { headers: { 'Accept': 'application/vnd.github+json' } })
            ]);
            if (!userRes.ok || !reposRes.ok) throw new Error('github-' + userRes.status);
            const user = await userRes.json();
            const repos = await reposRes.json();

            const totalStars = repos.reduce((s, r) => s + (r.stargazers_count || 0), 0);
            const langCount = {};
            repos.forEach(r => { if (r.language) langCount[r.language] = (langCount[r.language] || 0) + 1; });
            const langEntries = Object.entries(langCount).sort((a, b) => b[1] - a[1]).slice(0, 6);
            const langTotal = langEntries.reduce((s, e) => s + e[1], 0) || 1;

            const latestRepos = repos
                .filter(r => !r.fork)
                .slice(0, 4)
                .map(r => ({
                    name: r.name,
                    url: r.html_url,
                    desc: (r.description || '').slice(0, 60),
                    updated: new Date(r.updated_at).toLocaleDateString()
                }));

            const data = {
                repos: user.public_repos,
                followers: user.followers,
                stars: totalStars,
                gists: user.public_gists,
                topLang: langEntries[0] ? langEntries[0][0] : '—',
                langs: langEntries.map(([name, count]) => ({ name: name, pct: Math.round(count / langTotal * 100) })),
                latest: latestRepos
            };
            saveCache(data);
            return data;
        } catch (e) {
            console.warn('Nerve Center: GitHub fetch failed', e);
            return null;
        }
    }

    function collectVitals() {
        const v = { load: null, dom: null, resources: 0, memory: null };
        try {
            const nav = performance.getEntriesByType('navigation')[0];
            if (nav) {
                v.load = Math.round(nav.loadEventEnd - nav.startTime);
                v.dom = Math.round(nav.domContentLoadedEventEnd - nav.startTime);
            }
        } catch (e) {}
        try {
            v.resources = performance.getEntriesByType('resource').length;
        } catch (e) {}
        try {
            if (performance.memory && performance.memory.usedJSHeapSize) {
                v.memory = Math.round(performance.memory.usedJSHeapSize / 1048576);
            }
        } catch (e) {}
        return v;
    }

    function render(data, vitals) {
        if (!data) {
            const wrap = $('nerveCenterWrap');
            if (wrap) wrap.innerHTML = '<p class="nerve-status"><span class="nerve-dot nerve-error"></span> GitHub stats unavailable — offline or rate-limited.</p>';
            setStatus('GitHub unavailable', 'nerve-error');
            return;
        }

        const langsHtml = data.langs.map(l => `
            <div class="nerve-lang-row">
                <span class="nerve-lang-name">${escapeHtml(l.name)}</span>
                <div class="nerve-lang-bar">
                    <div class="nerve-lang-fill" data-lang="${escapeHtml(l.name)}" style="width:${l.pct}%"></div>
                </div>
                <span class="nerve-lang-pct">${l.pct}%</span>
            </div>`).join('');

        const reposHtml = data.latest.length ? data.latest.map(r => `
            <div class="nerve-repo-row">
                <span>📦</span>
                <a href="${r.url}" target="_blank" rel="noopener">${escapeHtml(r.name)}</a>
                <span class="nerve-repo-meta">${escapeHtml(r.desc)} · ${r.updated}</span>
            </div>`).join('') : '<div class="nerve-repo-row"><span>No public repos</span></div>';

        const wrap = $('nerveCenterWrap');
        if (!wrap) return;

        wrap.innerHTML = `
            <div class="nerve-grid">
                <div class="nerve-card">
                    <span class="nerve-icon">📦</span>
                    <div class="nerve-value">${data.repos}</div>
                    <div class="nerve-label">Public Repos</div>
                </div>
                <div class="nerve-card">
                    <span class="nerve-icon">⭐</span>
                    <div class="nerve-value">${data.stars}</div>
                    <div class="nerve-label">Stars</div>
                </div>
                <div class="nerve-card">
                    <span class="nerve-icon">👥</span>
                    <div class="nerve-value">${data.followers}</div>
                    <div class="nerve-label">Followers</div>
                </div>
                <div class="nerve-card">
                    <span class="nerve-icon">🌐</span>
                    <div class="nerve-value">${data.topLang}</div>
                    <div class="nerve-label">Top Language</div>
                </div>
                <div class="nerve-card nerve-wide">
                    <div class="nerve-langs">${langsHtml}</div>
                </div>
                <div class="nerve-card nerve-wide">
                    <div class="nerve-repos">${reposHtml}</div>
                </div>
                <div class="nerve-card">
                    <span class="nerve-icon">⚡</span>
                    <div class="nerve-value">${vitals.load !== null ? vitals.load + 'ms' : '—'}</div>
                    <div class="nerve-label">Page Load</div>
                    <div class="nerve-sub">${vitals.dom !== null ? 'DOM ready ' + vitals.dom + 'ms' : ''}</div>
                </div>
                <div class="nerve-card">
                    <span class="nerve-icon">🧩</span>
                    <div class="nerve-value">${vitals.resources}</div>
                    <div class="nerve-label">Resources</div>
                </div>
                <div class="nerve-card">
                    <span class="nerve-icon">🧠</span>
                    <div class="nerve-value">${vitals.memory !== null ? vitals.memory + 'MB' : '—'}</div>
                    <div class="nerve-label">JS Heap</div>
                </div>
            </div>`;

        // Color the language bars
        wrap.querySelectorAll('.nerve-lang-fill').forEach(el => {
            const name = el.dataset.lang;
            const c = LANG_COLORS[name] || '#00d4ff';
            el.style.background = c;
        });

        setStatus('Live · updated ' + new Date().toLocaleTimeString(), 'nerve-live');
    }

    function setStatus(text, cls) {
        const el = $('nerveStatus');
        if (!el) return;
        el.className = 'nerve-dot ' + (cls || '');
        const lbl = $('nerveStatusLabel');
        if (lbl) lbl.textContent = text;
    }

    function escapeHtml(s) {
        return String(s || '').replace(/[&<>"']/g, c => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        })[c]);
    }

    async function init(force) {
        if (!document.getElementById('nerveCenterWrap')) return;
        const [data, vitals] = [await fetchGitHub(force), collectVitals()];
        render(data, vitals);
    }

    // Re-collect vitals periodically (memory & resources change over time)
    function startVitalsLoop() {
        if (!document.getElementById('nerveCenterWrap')) return;
        setInterval(() => {
            const data = loadCache();
            if (data) render(data, collectVitals());
        }, 30000);
    }

    function setupRefreshButton() {
        const btn = $('nerveRefresh');
        if (!btn) return;
        btn.addEventListener('click', () => {
            btn.disabled = true;
            btn.textContent = 'Refreshing…';
            init(true).finally(() => {
                btn.disabled = false;
                btn.textContent = 'Refresh';
            });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            init(false);
            setupRefreshButton();
            startVitalsLoop();
        });
    } else {
        init(false);
        setupRefreshButton();
        startVitalsLoop();
    }
})();
