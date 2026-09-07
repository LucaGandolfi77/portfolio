// challenges.js — Daily challenges system
window.Challenges = (() => {
  const TYPES = [
    { type: 'vote',    templates: ['Vota in {n} elezioni', 'Esprimi {n} voti'],           field: 'votesCast',        range: [2, 5] },
    { type: 'minigame', templates: ['Gioca {n} minigiochi', 'Completa {n} minigiochi'],   field: 'minigameWins',     range: [1, 3] },
    { type: 'earn',    templates: ['Guadagna {n}€', 'Accumula {n}€'],                     field: 'totalEarned',      range: [2000, 50000], scale: 1000 },
    { type: 'buy',     templates: ['Compra {n} business', 'Acquista {n} attività'],       field: 'totalBusinessLevels', range: [1, 3] },
    { type: 'move',    templates: ['Trasferisciti {n} volte', 'Cambia città {n} volte'],   field: 'moveCount',        range: [1, 2] }
  ];

  const REWARDS = { vote: 1000, minigame: 800, earn: 1500, buy: 1200, move: 2000 };

  function today() { return new Date().toISOString().slice(0, 10); }

  function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

  function generate(state) {
    const dc = state.dailyChallenges;
    if (dc.date === today() && dc.challenges.length === 3) return;

    const shuffled = TYPES.slice().sort(() => Math.random() - 0.5).slice(0, 3);
    dc.challenges = shuffled.map(t => {
      const target = randInt(t.range[0], t.range[1]);
      const scaled = t.scale ? target * t.scale : target;
      const tpl = t.templates[randInt(0, t.templates.length - 1)];
      return {
        id: t.type,
        desc: tpl.replace('{n}', scaled),
        type: t.type,
        field: t.field,
        target: scaled,
        snapshot: state[t.field] || 0,
        reward: (REWARDS[t.type] || 1000) + (dc.streak * 200),
        completed: false
      };
    });
    dc.date = today();
  }

  function checkProgress(state) {
    const dc = state.dailyChallenges;
    let allDone = true;
    dc.challenges.forEach(c => {
      if (c.completed) return;
      const current = state[c.field] || 0;
      if (current - c.snapshot >= c.target) {
        c.completed = true;
        state.money += c.reward;
        if (window.Sounds) window.Sounds.play('coin');
        Haptic.success();
        if (window.Achievements) Achievements.checkAndNotify();
      } else {
        allDone = false;
      }
    });

    const completedCount = dc.challenges.filter(c => c.completed).length;
    if (allDone && completedCount === 3) {
      dc.streak++;
      state.money += dc.streak * 500;
    } else if (completedCount < 3) {
      // streak only resets at end of day if not all completed
    }
  }

  function render(state) {
    const dc = state.dailyChallenges;
    if (!dc.challenges.length) return '';

    const completedCount = dc.challenges.filter(c => c.completed).length;
    const html = dc.challenges.map(c => {
      const current = Math.min(c.target, (state[c.field] || 0) - c.snapshot);
      const pct = Math.min(100, Math.round((current / c.target) * 100));
      return `<div style="display:flex;align-items:center;gap:8px;padding:4px 0;font-size:11px">
        <span style="font-size:14px">${c.completed ? '✅' : '🎯'}</span>
        <div style="flex:1">
          <div style="color:${c.completed ? 'var(--green)' : 'var(--txt)'};${c.completed ? 'text-decoration:line-through;opacity:0.6' : ''}">${c.desc}</div>
          <div style="height:4px;background:var(--line);border-radius:2px;margin-top:3px;overflow:hidden">
            <div style="height:100%;width:${pct}%;background:${c.completed ? 'var(--green)' : 'var(--gold)'};border-radius:2px;transition:width 0.3s"></div>
          </div>
        </div>
        <span style="font-size:10px;color:var(--gold);font-weight:700">${c.completed ? '✓' : Save.formatMoney(c.reward)}</span>
      </div>`;
    }).join('');

    const streakText = dc.streak > 0 ? ` 🔥 ${dc.streak} giorni` : '';

    return `<div style="margin:8px 0;padding:8px 10px;background:var(--card);border:1px solid var(--line);border-radius:10px">
      <div style="font-size:12px;font-weight:700;margin-bottom:4px">📋 Sfide Quotidiane <span style="font-size:10px;color:var(--dim)">${completedCount}/3${streakText}</span></div>
      ${html}
    </div>`;
  }

  function reset() { return { date: '', challenges: [], streak: 0, totalCompleted: 0 }; }

  return { generate, checkProgress, render, reset };
})();
