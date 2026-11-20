import { test, eq, ok, summary } from '../test-harness.js';

const store = new Map();
globalThis.localStorage = {
  getItem: k => store.has(k) ? store.get(k) : null,
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: k => store.delete(k)
};

const { createMetaLayer } = await import('../meta-layer.js');

let passed = 0, total = 0;
const run = (n, f) => { total++; if (test(n, f)) passed++; };

const defs = (id = 'v1') => ({
  key: 'test.meta.' + id,
  missions: [
    { id: 'coins3', event: 'coin', goal: 3, label: '3 coins', reward: 60 },
    { id: 'wins1', event: 'win', goal: 1, label: 'First win', reward: 40 }
  ],
  achievements: [
    { id: 'runs5', event: 'game', goal: 5, label: '5 runs', reward: 100 }
  ]
});

run('starts empty', () => {
  const m = createMetaLayer(defs(String(Math.random())));
  eq(m.summary().xp, 0);
  eq(m.summary().missions.length, 2);
});
run('records events and counts them', () => {
  const m = createMetaLayer(defs(String(Math.random())));
  m.record('coin'); m.record('coin'); m.record('coin');
  eq(m.summary().counters.coin, 3);
});
run('unlocks a mission at its goal and grants XP', () => {
  const m = createMetaLayer(defs(String(Math.random())));
  let unlocked = [];
  for (let i = 0; i < 3; i++) unlocked = m.record('coin');
  eq(unlocked.length, 1);
  eq(unlocked[0].id, 'coins3');
  eq(m.summary().xp, 60);
  ok(m.summary().missions.find(x => x.id === 'coins3').done);
});
run('does not unlock twice', () => {
  const m = createMetaLayer(defs(String(Math.random())));
  for (let i = 0; i < 3; i++) m.record('coin');
  eq(m.record('coin').length, 0);
});
run('achievement with function goal works', () => {
  const m = createMetaLayer({
    key: 'test.meta.v2',
    missions: [{ id: 'x', event: 'e', goal: s => 2, label: 'X', reward: 10 }],
    achievements: []
  });
  eq(m.record('e').length, 0);
  eq(m.record('e').length, 1);
});
run('streak updates once per day', () => {
  const m = createMetaLayer(defs(String(Math.random())));
  eq(m.daily(), 1);
  eq(m.daily(), 1);
});
run('state persists across instances', () => {
  const key = 'test.persist.' + Math.random();
  const a = createMetaLayer({ ...defs(), key });
  a.record('win'); a.record('win');
  const b = createMetaLayer({ ...defs(), key });
  eq(b.summary().counters.win, 2);
});
run('announce formats unlocked rewards', () => {
  const m = createMetaLayer(defs(String(Math.random())));
  const u = m.record('win');
  ok(m.announce(u).includes('First win'));
});

summary(passed, total);
