import { test, eq, ok, summary } from '../../_kit/test-harness.js';

const store = new Map();
globalThis.localStorage = {
  getItem: k => store.has(k) ? store.get(k) : null,
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: k => store.delete(k)
};

const { readCampaigns, readMetaXP, CAMPAIGN_GAMES } = await import('../js/campaign-data.js');

let passed = 0, total = 0;
const run = (n, f) => { total++; if (test(n, f)) passed++; };

run('campaign list covers 12 ranked games', () => {
  eq(CAMPAIGN_GAMES.length, 12);
});
run('missing campaigns fall back to 1000 / ROOKIE', () => {
  const rows = readCampaigns(localStorage);
  eq(rows.length, 12);
  ok(rows.every(r => r.rating === 1000 && !r.active));
});
run('ratings are read and sorted descending', () => {
  store.set('chess.campaign.v1', JSON.stringify({ rating: 1500, wins: 3, games: 4 }));
  store.set('dama.campaign.v1', JSON.stringify({ rating: 1200, wins: 1, games: 2 }));
  const rows = readCampaigns(localStorage);
  eq(rows[0].id, 'chess');
  ok(rows[0].active);
  eq(rows[0].rank.name, 'PLATINUM');
});
run('win rate is computed from saved games', () => {
  store.set('forza4.campaign.v1', JSON.stringify({ rating: 1100, wins: 3, games: 4 }));
  const row = readCampaigns(localStorage).find(r => r.id === 'forza4');
  eq(row.winRate, 75);
});
run('meta XP is aggregated across games', () => {
  store.set('tokyo.save.v1', JSON.stringify({ xp: 120, level: 2 }));
  store.set('aviator.save.v1', JSON.stringify({ xp: 80, level: 2 }));
  const result = readMetaXP(localStorage, ['tokyo.save.v1', 'aviator.save.v1', 'missing']);
  eq(result.total, 200);
  eq(result.perGame.length, 2);
});
run('corrupt saves are ignored', () => {
  store.set('scopa.campaign.v1', '{not json');
  const row = readCampaigns(localStorage).find(r => r.id === 'scopa');
  eq(row.rating, 1000);
  ok(!row.active);
});

summary(passed, total);
