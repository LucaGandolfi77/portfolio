/* Pure combat math */
import { COMBO_DAMAGE, COMBO_WINDOW, WORLD } from '../config.js';
import { stats } from './progression.js';
import { distance, clamp, moveTowards } from './entities.js';

export function comboFor(combo, now, lastAttack) {
  return (now - lastAttack < COMBO_WINDOW) ? Math.min(3, combo + 1) : 1;
}

export function meleeDamage(state, combo) {
  return COMBO_DAMAGE[Math.min(2, Math.max(0, combo - 1))] + stats(state).attack;
}

export function inRange(a, b, range) { return distance(a, b) <= range; }

export function damageTaken(state, amount, invulnerable) {
  if (invulnerable) return 0;
  return Math.max(1, Math.round(amount - stats(state).defense * 0.8));
}

export function canCast(state, skill) {
  if (!skill) return 'missing';
  if (state.cooldowns[skill.id] > 0) return 'cooldown';
  if (state.mana < skill.mana) return 'mana';
  return null;
}

export function cast(state, skill) {
  const next = JSON.parse(JSON.stringify(state));
  next.mana -= skill.mana;
  next.cooldowns[skill.id] = skill.cooldown;
  if (skill.heal) next.hp = Math.min(next.maxHp, next.hp + skill.heal);
  return next;
}

export function projectile(start, facing, speed, dt) {
  const p = { x: start.x + facing * speed * dt, y: start.y };
  const c = clamp(p, -40);
  return c;
}

export function dashTarget(pos, facing, distancePx) {
  return clamp({ x: pos.x + facing * distancePx, y: pos.y }, 18);
}

export function nearestEnemy(pos, enemies, range) {
  let best = null, bd = range;
  enemies.forEach(e => {
    if (!e.alive) return;
    const d = distance(pos, e);
    if (d < bd) { bd = d; best = e; }
  });
  return best;
}

export function worldBounds() { return { ...WORLD }; }
export { moveTowards };
