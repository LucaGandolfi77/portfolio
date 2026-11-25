import { test, eq, ok, summary } from '../../_kit/test-harness.js';
import {
  MAX_LEVEL, xpToNext, totalXpForLevel, levelFromXp, levelInfo,
  levelReward, xpFromStats, migratedProgress, sanitizeProgress, addXp, nextLevels,
  XP_MATCH, XP_WIN, XP_CHEST
} from '../js/game/levels.js';

let passed = 0;
let total = 0;
const run = (name, fn) => { total += 1; if (test(name, fn)) passed += 1; };

run('XP curve starts fast and stops at max level', () => {
  eq(xpToNext(1), 80);
  eq(xpToNext(2), 100);
  eq(xpToNext(MAX_LEVEL), 0);
  ok(totalXpForLevel(MAX_LEVEL) > totalXpForLevel(MAX_LEVEL - 1));
});

run('level is derived from cumulative XP', () => {
  eq(levelFromXp(0), 1);
  eq(levelFromXp(79), 1);
  eq(levelFromXp(80), 2);
  eq(levelFromXp(179), 2);
  eq(levelFromXp(180), 3);
  eq(levelFromXp(totalXpForLevel(MAX_LEVEL)), MAX_LEVEL);
  eq(levelFromXp(totalXpForLevel(MAX_LEVEL) + 5000), MAX_LEVEL);
});

run('level info reports current progress and next level', () => {
  const info = levelInfo({ xp: 90, level: 2 });
  eq(info.level, 2);
  eq(info.current, 10);
  eq(info.next, 100);
  ok(info.ratio > 0 && info.ratio < 1);
  eq(info.nextLevel, 3);
  const max = levelInfo({ xp: totalXpForLevel(MAX_LEVEL) });
  eq(max.max, true);
  eq(max.ratio, 1);
});

run('level rewards never include chests', () => {
  for (let level = 2; level <= MAX_LEVEL; level += 1) {
    const reward = levelReward(level);
    ok(reward && reward.coins > 0);
    ok(!Object.prototype.hasOwnProperty.call(reward, 'chest'));
  }
  eq(levelReward(5).wildcards.rare, 1);
  eq(levelReward(10).wildcards.epic, 1);
  eq(levelReward(20).wildcards.legendary, 1);
});

run('addXp levels up once and grants each reward once', () => {
  const progress = { xp: 0, level: 1, rewardsLevel: 1 };
  const first = addXp(progress, XP_MATCH);
  eq(first.gained.length, 0);
  eq(progress.level, 1);
  const second = addXp(progress, XP_WIN + XP_CHEST);
  eq(second.gained.length, 0);
  const third = addXp(progress, 20);
  eq(progress.level, 2);
  eq(third.gained.length, 1);
  eq(third.gained[0].level, 2);
  eq(addXp(progress, 0).gained.length, 0);
});

run('one large XP award grants all crossed levels', () => {
  const progress = { xp: 0, level: 1, rewardsLevel: 1 };
  const result = addXp(progress, totalXpForLevel(5));
  eq(progress.level, 5);
  eq(result.gained.length, 4);
  eq(result.gained[result.gained.length - 1].level, 5);
});

run('XP is never lost and progress cannot exceed max level', () => {
  const progress = { xp: 0, level: 1, rewardsLevel: 1 };
  addXp(progress, 10);
  addXp(progress, 10);
  eq(progress.xp, 20);
  addXp(progress, 999999);
  eq(progress.level, MAX_LEVEL);
  eq(progress.rewardsLevel, MAX_LEVEL);
  eq(addXp(progress, 100).gained.length, 0);
});

run('existing stats map to a sensible migrated level', () => {
  const progress = migratedProgress({ matches: 12, wins: 8, chestsOpened: 22, cashOuts: 1, tournamentsWon: 0 });
  ok(progress.level > 1);
  eq(progress.rewardsLevel, progress.level);
  const empty = migratedProgress({});
  eq(empty.level, 1);
  eq(empty.xp, 0);
  ok(xpFromStats({ matches: 1, wins: 1 }) > xpFromStats({ matches: 1, wins: 0 }));
});

run('saved progress is sanitized', () => {
  const clean = sanitizeProgress({ xp: 80, level: 99, rewardsLevel: 99 });
  eq(clean.level, 2);
  eq(clean.rewardsLevel, 2);
  const fallback = sanitizeProgress({});
  eq(fallback.level, 1);
  eq(fallback.rewardsLevel, 1);
});

run('next level previews stay within the cap', () => {
  const levels = nextLevels({ xp: totalXpForLevel(MAX_LEVEL - 1) }, 5);
  eq(levels.length, 1);
  eq(levels[0].level, MAX_LEVEL);
});

summary(passed, total);
