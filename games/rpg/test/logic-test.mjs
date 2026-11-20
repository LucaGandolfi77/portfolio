import { test, eq, ok, near, summary } from '../../_kit/test-harness.js';
import { RPG } from '../js/engine.js';
import { DIFFICULTY, ENEMIES, ZONES } from '../js/config.js';

let passed = 0, total = 0;
const run = (n, f) => { total++; if (test(n, f)) passed++; };

function profile(over = {}) {
  return {
    difficulty: 'normal', level: 1, xp: 0, gold: 0, kills: 0, bosses: 0, wins: 0,
    inventory: { potion: 2, sword: 0, shield: 0 },
    equipped: { sword: false, shield: false }, ...over
  };
}

run('config has 3 zones and 5 enemies', () => {
  eq(ZONES.length, 3); eq(ENEMIES.length, 5);
  ok(ZONES[2].boss, 'last zone has a boss');
  eq(Object.keys(DIFFICULTY).length, 3);
});

run('start sets playing and spawns enemy', () => {
  const e = new RPG(profile());
  e.start(0);
  eq(e.status, 'playing');
  ok(e.enemy, 'enemy exists');
  eq(e.turn, 'player');
  eq(e.heroHp, e.maxHp);
});

run('attack damages enemy and passes turn', () => {
  const e = new RPG(profile());
  e.start(0);
  const hp = e.enemy.hp;
  e.playerAttack();
  ok(e.enemy.hp < hp || e.status !== 'playing');
});

run('guard reduces incoming damage', () => {
  const a = new RPG(profile()); a.start(0);
  const b = new RPG(profile()); b.start(0);
  a.enemy.atk = b.enemy.atk = 20;
  a.enemy.maxHp = b.enemy.maxHp = 999;
  a.guard(); b.playerAttack();
  ok(a.heroHp > b.heroHp, `guard ${a.heroHp} > plain ${b.heroHp}`);
});

run('potion consumes inventory and heals', () => {
  const e = new RPG(profile());
  e.start(0);
  e.heroHp = 10;
  eq(e.usePotion(), true);
  eq(e.profile.inventory.potion, 1);
  ok(e.heroHp > 10);
});

run('flee is blocked on bosses', () => {
  const e = new RPG(profile());
  e.start(2);
  e.enemy.isBoss = true;
  e.flee();
  eq(e.status, 'playing');
});

run('killing enemy grants gold and xp', () => {
  const e = new RPG(profile());
  e.start(0);
  e.enemy.hp = 1;
  e.enemy.maxHp = 1;
  e.playerAttack();
  ok(e.profile.gold > 0);
  ok(e.profile.xp > 0);
  ok(e.profile.kills >= 1);
});

run('level up raises max hp and attack', () => {
  const p = profile({ level: 1, xp: 0 });
  const e = new RPG(p);
  const hp = e.maxHp, atk = e.atk;
  const result = e.gainXP(200);
  ok(result.leveled, 'leveled up');
  ok(e.maxHp > hp);
  ok(e.atk > atk);
});

run('buy requires gold and adds item', () => {
  const e = new RPG(profile({ gold: 100 }));
  eq(e.buy('potion'), true);
  eq(e.profile.inventory.potion, 3);
  eq(e.profile.gold, 80);
  const poor = new RPG(profile({ gold: 0 }));
  eq(poor.buy('sword'), false);
});

run('equip sword increases attack', () => {
  const e = new RPG(profile({ inventory: { potion: 0, sword: 1, shield: 0 } }));
  const before = e.atk;
  eq(e.equip('sword'), true);
  ok(e.atk > before);
});

run('gameover at zero hp', () => {
  const e = new RPG(profile());
  e.start(0);
  e.heroHp = 1;
  e.enemy.atk = 999;
  e.guard();
  eq(e.status, 'gameover');
  eq(e.heroHp, 0);
});

summary(passed, total);
