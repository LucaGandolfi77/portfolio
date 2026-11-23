/* Timed chest shop and queue (pure, deterministic helpers) */

export const CHEST_TYPES = {
  silver: { key: 'silver', name: 'Silver', price: 250, unlockMs: 30000, minTier: 'common', color: '#9fb3c7' },
  gold: { key: 'gold', name: 'Gold', price: 700, unlockMs: 180000, minTier: 'rare', color: '#ffd166' },
  legendary: { key: 'legendary', name: 'Legendary', price: 1800, unlockMs: 600000, minTier: 'epic', color: '#ff9f1c' }
};

export const QUEUE_LIMIT = 4;
const TIER_ORDER = ['common', 'rare', 'epic', 'legendary'];

export function speedUpCost(chest, now = Date.now()) {
  const remaining = Math.max(0, chest.unlockAt - now);
  return Math.max(1, Math.round((remaining / 1000) * 2));
}

export function buyChest(career, type, now = Date.now()) {
  const def = CHEST_TYPES[type];
  if (!def) return { ok: false, reason: 'unknown' };
  career.chestQueue = career.chestQueue || [];
  if (career.chestQueue.length >= QUEUE_LIMIT) return { ok: false, reason: 'queue-full' };
  if ((career.credits || 0) < def.price) return { ok: false, reason: 'credits' };
  career.credits -= def.price;
  const chest = {
    id: `chest-${now}-${Math.floor(Math.random() * 1000)}`,
    type, unlockAt: now + def.unlockMs, boughtAt: now
  };
  career.chestQueue.push(chest);
  return { ok: true, chest };
}

export function activeChest(career, now = Date.now()) {
  const queue = career.chestQueue || [];
  return queue.length ? queue[0] : null;
}

export function isReady(chest, now = Date.now()) {
  return !!chest && chest.unlockAt <= now;
}

export function speedUpChest(career, now = Date.now()) {
  const chest = activeChest(career, now);
  if (!chest) return { ok: false, reason: 'empty' };
  const cost = speedUpCost(chest, now);
  if ((career.credits || 0) < cost) return { ok: false, reason: 'credits', cost };
  career.credits -= cost;
  chest.unlockAt = now;
  return { ok: true, chest, cost };
}

export function openChest(career, now = Date.now()) {
  const chest = activeChest(career, now);
  if (!isReady(chest, now)) return { ok: false, reason: 'locked' };
  career.chestQueue.shift();
  return { ok: true, chest };
}

export function enforceMinTier(tier, minTier) {
  if (TIER_ORDER.indexOf(tier) >= TIER_ORDER.indexOf(minTier)) return tier;
  return minTier;
}

export function timeLeft(chest, now = Date.now()) {
  if (!chest) return 0;
  return Math.max(0, chest.unlockAt - now);
}

export function formatTime(ms) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}
