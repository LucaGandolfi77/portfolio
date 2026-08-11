// === PORTFOLIO XP ===
// Gamification layer: XP points, levels, activity rewards.
// Adds a small HUD (bottom-left) with level + progress bar.
// Public API: window.PortfolioXP.add(amount, reason, {opts})

(function () {
    'use strict';

    const STORAGE_KEY = 'portfolio_xp_v1';
    const HUD_ID = 'xp-hud';
    const COOLDOWNS = {}; // reason -> timestamp

    // Level curve: level N requires LEVEL_XP[N] total XP to reach.
    // level 1 = 0 XP, level 2 = 80, level 3 = 220, level 4 = 440, ... grows +80 each time.
    function xpForLevel(level) {
        if (level <= 1) return 0;
        let total = 0;
        let step = 60;
        for (let l = 2; l <= level; l++) {
            total += step;
            step += 20;
        }
        return total;
    }

    function levelFromXp(xp) {
        let level = 1;
        while (xp >= xpForLevel(level + 1)) level++;
        return level;
    }

    function loadState() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const s = JSON.parse(raw);
                if (typeof s.xp === 'number') return { xp: s.xp, log: s.log || [] };
            }
        } catch (e) {}
        return { xp: 0, log: [] };
    }

    function saveState(state) {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {}
    }

    const state = loadState();
    let level = levelFromXp(state.xp);

    function toast(text) {
        let el = document.querySelector('.xp-toast');
        if (!el) {
            el = document.createElement('div');
            el.className = 'xp-toast';
            document.body.appendChild(el);
        }
        el.textContent = text;
        el.classList.add('xp-show');
        clearTimeout(el._t);
        el._t = setTimeout(() => el.classList.remove('xp-show'), 2000);
    }

    function levelUpToast(newLevel) {
        const el = document.createElement('div');
        el.className = 'xp-levelup';
        el.innerHTML = `<div class="xp-lv">Level ${newLevel}</div>
            <div class="xp-lv-label">You're leveling up your curiosity!</div>`;
        document.body.appendChild(el);
        requestAnimationFrame(() => el.classList.add('xp-show'));
        setTimeout(() => {
            el.classList.remove('xp-show');
            setTimeout(() => el.remove(), 400);
        }, 2200);
    }

    function buildHud() {
        if (document.getElementById(HUD_ID)) return;
        const hud = document.createElement('div');
        hud.id = HUD_ID;
        hud.innerHTML = `
            <div class="xp-level-badge" id="xpLevelBadge">1</div>
            <div class="xp-info">
                <div class="xp-label" id="xpLabel">Portfolio XP</div>
                <div class="xp-total" id="xpTotal">0 XP</div>
                <div class="xp-bar"><div class="xp-bar-fill" id="xpBarFill"></div></div>
            </div>`;
        document.body.appendChild(hud);
    }

    function renderHud() {
        const badge = document.getElementById('xpLevelBadge');
        const total = document.getElementById('xpTotal');
        const fill = document.getElementById('xpBarFill');
        if (badge) badge.textContent = level;
        if (total) total.textContent = state.xp + ' XP';
        if (fill) {
            const cur = xpForLevel(level);
            const next = xpForLevel(level + 1);
            const pct = next > cur ? Math.min(100, Math.round((state.xp - cur) / (next - cur) * 100)) : 100;
            fill.style.width = pct + '%';
        }
    }

    function add(amount, reason, opts) {
        opts = opts || {};
        const n = Number(amount);
        if (!isFinite(n) || n <= 0) return state.xp;

        const now = Date.now();
        const cd = opts.cooldown || 0;
        if (cd && COOLDOWNS[reason] && now - COOLDOWNS[reason] < cd) return state.xp;

        if (cd) COOLDOWNS[reason] = now;
        if (opts.daily) {
            const today = new Date().toDateString();
            if (state.log.indexOf('daily:' + today) >= 0) return state.xp;
            state.log.push('daily:' + today);
        }
        if (opts.once) {
            if (state.log.indexOf('once:' + reason) >= 0) return state.xp;
            state.log.push('once:' + reason);
        }

        state.xp += n;
        state.log = (state.log || []).slice(-100);
        saveState(state);

        const newLevel = levelFromXp(state.xp);
        if (newLevel > level) {
            level = newLevel;
            levelUpToast(newLevel);
        }

        renderHud();
        if (opts.toast !== false) toast('+' + n + ' XP · ' + reason);
        return state.xp;
    }

    function reset() {
        state.xp = 0;
        state.log = [];
        level = 1;
        saveState(state);
        renderHud();
    }

    // Expose public API
    window.PortfolioXP = {
        add: add,
        reset: reset,
        get: () => ({ xp: state.xp, level: level }),
        levelFromXp: levelFromXp
    };

    function init() {
        buildHud();
        renderHud();

        // Daily visit reward
        add(10, 'Daily visit', { daily: true, toast: false });

        // Hook: detect data-theme changes (theme toggling earns XP)
        const themeObserver = new MutationObserver((muts) => {
            muts.forEach(m => {
                if (m.attributeName === 'data-theme') {
                    add(2, 'Theme explorer', { cooldown: 5000, toast: false });
                }
                if (m.attributeName === 'data-mode') {
                    add(5, 'Switched mode', { cooldown: 10000, toast: false });
                }
            });
        });
        themeObserver.observe(document.documentElement, { attributes: true });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
