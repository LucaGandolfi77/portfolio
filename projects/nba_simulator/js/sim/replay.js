/* Game replay log and highlight detection (pure) */

const HIGHLIGHT_KINDS = new Set(['dunk', 'shot3', 'block', 'steal', 'milestone', 'overtime', 'end']);

export function captureReplay(sim) {
  return {
    home: sim.teams.home.code,
    away: sim.teams.away.code,
    homeColor: sim.teams.home.color,
    awayColor: sim.teams.away.color,
    score: { ...sim.score },
    quarters: sim.quarters.slice(),
    date: Date.now(),
    events: sim.events.map((e, i) => ({
      i, kind: e.kind, q: e.q, clock: e.clock, it: e.it, en: e.en, score: { ...e.score }
    })),
    shots: sim.shots.map(s => ({ x: s.x, y: s.y, made: s.made, value: s.value, side: s.side, player: s.player }))
  };
}

export function detectHighlights(replay) {
  const out = [];
  let prevLeader = null;
  for (const e of replay.events) {
    const leader = e.score.home === e.score.away ? 'tie' : e.score.home > e.score.away ? 'home' : 'away';
    const leadChange = leader !== 'tie' && leader !== prevLeader;
    if (leadChange) prevLeader = leader;
    if (HIGHLIGHT_KINDS.has(e.kind) || leadChange) {
      out.push({ index: e.i, kind: leadChange ? 'lead' : e.kind, label: e.en || e.it });
    }
  }
  return out;
}

export function frameAt(replay, position) {
  const events = replay.events || [];
  if (!events.length) return null;
  const p = Math.max(0, Math.min(1, position));
  const index = Math.min(events.length - 1, Math.floor(p * events.length));
  const event = events[index];
  const shot = replay.shots.filter(s => s.side === (event.score.home >= event.score.away ? 'home' : 'away')).slice(-1)[0];
  return { event, index, progress: p, score: event.score, shot: shot || null };
}

export function trimReplays(list, limit = 5) {
  return (list || []).slice(-limit);
}
