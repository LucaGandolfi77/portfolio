import { test, eq, ok, summary } from '../test-harness.js';

const store = new Map();
globalThis.localStorage = {
  getItem: k => store.has(k) ? store.get(k) : null,
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: k => store.delete(k)
};
const { createCampaign, tierFor } = await import('../campaign.js');

let passed = 0, total = 0;
const run = (n, f) => { total++; if (test(n, f)) passed++; };
const fresh = () => createCampaign({ key: 'campaign.test.' + Math.random() });

run('starts at 1000 rating / ROOKIE', () => {
  const c = fresh();
  eq(c.summary().rating, 1000);
  eq(c.summary().rank.name, 'ROOKIE');
});
run('win increases rating, loss decreases it', () => {
  const c = fresh();
  const w = c.result('win');
  ok(w.delta > 0); ok(c.summary().rating > 1000);
  const l = c.result('loss');
  ok(l.delta < 0);
});
run('draw gives small rating change', () => {
  const c = fresh();
  const d = c.result('draw');
  ok(Math.abs(d.delta) < 20);
});
run('streak grows on wins and resets on loss', () => {
  const c = fresh();
  c.result('win'); c.result('win');
  eq(c.summary().streak, 2);
  c.result('loss');
  eq(c.summary().streak, 0);
  eq(c.summary().bestStreak, 2);
});
run('rank changes at higher rating', () => {
  ok(tierFor(0).name === 'ROOKIE');
  ok(tierFor(1900).name === 'LEGEND');
  const c = fresh();
  c.state.rating = 1060;
  ok(c.summary().rank.name === 'BRONZE');
});
run('win rate is computed', () => {
  const c = fresh();
  c.result('win'); c.result('loss');
  eq(c.summary().winRate, 50);
});
run('daily goals are deterministic and unique', () => {
  const c = fresh();
  const date = new Date(2026, 0, 15);
  const a = c.daily(date), b = c.daily(date);
  eq(a.seed, b.seed);
  eq(JSON.stringify(a.goals), JSON.stringify(b.goals));
  eq(new Set(a.goals).size, a.goals.length);
});
run('state persists', () => {
  const key = 'campaign.persist.' + Math.random();
  const a = createCampaign({ key });
  a.result('win'); a.result('win');
  eq(createCampaign({ key }).summary().wins, 2);
});

summary(passed, total);
