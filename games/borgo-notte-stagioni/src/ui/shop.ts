import { GARAGE_SLOTS, MAX_LEVEL, MODS, PAINT_COST, PAINTS, REPAIR_COST, nextPrice, type ModKind, type StoredCar, type Tune } from '../game/workshop';
import { SPECS } from '../game/vehicle';

/* The Officina and garage panels: plain HTML, buttons carry data-act. */

const hex = (c: number): string => `#${c.toString(16).padStart(6, '0')}`;
const euro = (n: number): string => `€ ${n.toLocaleString('it-IT')}`;

export function renderWorkshop(car: { label: string; health: number; color: number; tune: Tune; wrecked: boolean }, money: number): string {
  const damaged = car.health < 99 || car.wrecked;
  const repair = damaged
    ? `<button class="shop-row" data-act="repair" ${money < REPAIR_COST ? 'disabled' : ''}><span>Riparazione completa · ${Math.round(car.health)}%</span><b>${euro(REPAIR_COST)}</b></button>`
    : '<div class="shop-row is-done"><span>Carrozzeria e meccanica a posto</span><b>✓</b></div>';
  const mods = (Object.keys(MODS) as ModKind[])
    .map((k) => {
      const m = MODS[k];
      const lv = car.tune[k];
      const price = nextPrice(car.tune, k);
      const pips = Array.from({ length: MAX_LEVEL }, (_, i) => `<i class="${i < lv ? 'on' : ''}"></i>`).join('');
      return price === null
        ? `<div class="shop-row is-done"><span>${m.label}: ${m.levels[lv]} <em class="pips">${pips}</em></span><b>MAX</b></div>`
        : `<button class="shop-row" data-act="mod:${k}" ${money < price ? 'disabled' : ''}><span>${m.label}: ${m.levels[lv + 1]} <em class="pips">${pips}</em></span><b>${euro(price)}</b></button>`;
    })
    .join('');
  const paints = PAINTS.map(
    (p, i) => `<button class="swatch${p.color === car.color ? ' is-on' : ''}" data-act="paint:${i}" title="${p.name}" aria-label="${p.name}" style="background:${hex(p.color)}" ${money < PAINT_COST ? 'disabled' : ''}></button>`
  ).join('');
  return `<h3>${car.label}</h3>
    <ul class="shop-list">${repair}</ul>
    <h3>Elaborazioni</h3>
    <ul class="shop-list">${mods}</ul>
    <h3>Verniciatura · ${euro(PAINT_COST)}</h3>
    <div class="swatches">${paints}</div>
    <p class="shop-note">Ogni lavoro salva la partita.</p>`;
}

export function renderGarage(slots: StoredCar[], car: { label: string } | null, hidden: boolean): string {
  const rows = Array.from({ length: GARAGE_SLOTS }, (_, i) => {
    const c = slots[i];
    if (!c) return '<div class="shop-row is-done"><span>Posto libero</span><b>—</b></div>';
    const lv = c.tune.engine + c.tune.brakes + c.tune.grip;
    const extra = lv ? ` · elaborata ${lv}/9` : '';
    return car
      ? `<div class="shop-row is-done"><span><i class="dot" style="background:${hex(c.color)}"></i>${SPECS[c.type].label}${extra}</span><b>${Math.round(c.health)}%</b></div>`
      : `<button class="shop-row" data-act="take:${i}"><span><i class="dot" style="background:${hex(c.color)}"></i>${SPECS[c.type].label}${extra}</span><b>Prendi</b></button>`;
  }).join('');
  const store = car
    ? slots.length < GARAGE_SLOTS
      ? `<button class="shop-row" data-act="store"><span>Lascia qui: ${car.label}</span><b>Parcheggia</b></button>`
      : '<div class="shop-row is-done"><span>Garage pieno: prendi un\'auto a piedi per liberare un posto</span><b>4/4</b></div>'
    : '';
  return `${hidden ? '<p class="shop-note good">Saracinesca abbassata: la polizia ti ha perso.</p>' : ''}
    <ul class="shop-list">${store}${rows}</ul>
    <p class="shop-note">Le auto restano qui anche dopo aver chiuso il gioco.</p>`;
}
