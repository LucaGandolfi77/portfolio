/* RPG Adventure — pure combat and progression logic */

import { DIFFICULTY, ENEMIES, ZONES, ITEMS } from './config.js';
import { clamp, pick } from '../../_kit/core.js';

const byId = id => ENEMIES.find(e => e.id === id);

export class RPG {
  constructor(profile, hooks = {}) {
    this.profile = profile;
    this.hooks = hooks;
    this.reset();
  }

  reset() {
    this.status = 'menu';
    this.zone = 0;
    this.encounter = 0;
    this.enemy = null;
    this.turn = 'player';
    this.guarding = false;
    this.log = [];
    this.heroHp = this.maxHp;
  }

  get diff() { return DIFFICULTY[this.profile.difficulty] || DIFFICULTY.normal; }
  get level() { return this.profile.level || 1; }
  get maxHp() { return 60 + (this.level - 1) * 12; }
  get atk() { return 8 + (this.level - 1) * 2 + (this.profile.equipped?.sword ? ITEMS.sword.atk : 0); }
  get def() { return 2 + (this.profile.equipped?.shield ? ITEMS.shield.def : 0); }

  say(text) {
    this.log.unshift(text);
    if (this.log.length > 40) this.log.length = 40;
    this.hooks.onLog?.(text);
  }

  start(zone = 0) {
    this.reset();
    this.zone = clamp(zone, 0, ZONES.length - 1);
    this.heroHp = this.maxHp;
    this.status = 'playing';
    this.spawn();
  }

  spawn() {
    const cfg = ZONES[this.zone];
    const isBoss = this.encounter >= cfg.encounters && cfg.boss;
    const id = isBoss ? cfg.boss : pick(cfg.pool);
    const base = byId(id);
    const scale = this.diff.enemy * (1 + this.zone * 0.12);
    this.enemy = {
      ...base,
      maxHp: Math.round(base.hp * scale),
      hp: Math.round(base.hp * scale),
      atk: Math.round(base.atk * scale),
      isBoss
    };
    this.turn = 'player';
    this.guarding = false;
    this.say(`${isBoss ? 'BOSS ' : ''}${base.name} appears!`);
  }

  playerAttack() {
    if (this.status !== 'playing' || this.turn !== 'player' || !this.enemy) return;
    const dmg = Math.max(1, this.atk + Math.floor(Math.random() * 5) - this.enemy.maxHp * 0.02);
    const dealt = Math.round(dmg);
    this.enemy.hp -= dealt;
    this.say(`You hit ${this.enemy.name} for ${dealt}`);
    this.hooks.onHit?.({ target: 'enemy', amount: dealt });
    if (this.enemy.hp <= 0) { this.winEncounter(); return; }
    this.enemyTurn();
  }

  guard() {
    if (this.status !== 'playing' || this.turn !== 'player' || !this.enemy) return;
    this.guarding = true;
    this.say('You brace for impact');
    this.enemyTurn();
  }

  usePotion() {
    if (this.status !== 'playing' || this.turn !== 'player') return false;
    if (!this.profile.inventory?.potion) return false;
    this.profile.inventory.potion--;
    const heal = Math.min(ITEMS.potion.heal, this.maxHp - this.heroHp);
    this.heroHp += heal;
    this.say(`Potion restores ${heal} HP`);
    this.hooks.onHit?.({ target: 'hero', amount: heal, heal: true });
    this.enemyTurn();
    return true;
  }

  flee() {
    if (this.status !== 'playing' || !this.enemy) return;
    if (this.enemy.isBoss) { this.say('You cannot flee a boss!'); return; }
    this.say('You escaped');
    this.enemy = null;
    this.status = 'fled';
    this.hooks.onStatus?.('fled');
  }

  enemyTurn() {
    if (!this.enemy || this.status !== 'playing') return;
    this.turn = 'enemy';
    const raw = this.enemy.atk + Math.floor(Math.random() * 5);
    const dmg = Math.max(1, Math.round(raw * (this.guarding ? 0.4 : 1) - this.def * 0.5));
    this.heroHp -= dmg;
    this.say(`${this.enemy.name} hits you for ${dmg}`);
    this.hooks.onHit?.({ target: 'hero', amount: dmg });
    this.guarding = false;
    if (this.heroHp <= 0) {
      this.heroHp = 0;
      this.status = 'gameover';
      this.say('You were defeated');
      this.hooks.onStatus?.('gameover', { zone: this.zone });
      return;
    }
    this.turn = 'player';
  }

  winEncounter() {
    const e = this.enemy;
    const rewardScale = this.diff.reward;
    const gold = Math.round(e.gold * rewardScale);
    const xp = Math.round(e.xp * rewardScale);
    this.profile.gold += gold;
    this.profile.kills++;
    if (e.isBoss) this.profile.bosses++;
    this.say(`Defeated ${e.name}. +${gold} gold, +${xp} XP`);
    this.hooks.onReward?.({ gold, xp });
    const before = this.level;
    const result = this.gainXP(xp);
    if (result.level > before) {
      this.heroHp = this.maxHp;
      this.say(`LEVEL UP! You are now level ${result.level}`);
    }
    this.enemy = null;
    this.encounter++;
    const cfg = ZONES[this.zone];
    if (this.encounter > cfg.encounters || (e.isBoss && this.zone === ZONES.length - 1)) {
      this.status = this.zone === ZONES.length - 1 ? 'victory' : 'zoneclear';
      this.profile.wins++;
      this.hooks.onStatus?.(this.status, { zone: this.zone });
    } else {
      this.spawn();
    }
  }

  gainXP(amount) {
    const before = this.profile.level || 1;
    this.profile.xp += amount;
    let level = before;
    while (this.profile.xp >= level * level * 80 + 80 && level < 20) level++;
    const leveled = level > before;
    this.profile.level = level;
    if (leveled) this.hooks.onLevelUp?.(level);
    return { level, leveled };
  }

  buy(item) {
    const def = ITEMS[item];
    if (!def || this.profile.gold < def.price) return false;
    this.profile.gold -= def.price;
    this.profile.inventory[item] = (this.profile.inventory[item] || 0) + 1;
    this.hooks.onBuy?.(item);
    return true;
  }

  equip(item) {
    if (!this.profile.inventory?.[item]) return false;
    this.profile.equipped[item] = !this.profile.equipped[item];
    return true;
  }
}
