/* ============================================================
   Ultimo Colore — the party: stats and skills (pure data)
   ------------------------------------------------------------
   skill: ap cost · taps (timed presses) · mult (per tap) ·
   target one|all|party · brk (break multiplier) · fx
   ============================================================ */

export const HEROES = {
  ilario: {
    name: 'Ilario', color: '#e8862c', hp: 132, atk: 19, spd: 10,
    role: { it: 'Lanternaio', en: 'Lantern maker' },
    passive: { it: 'Fiamma: ogni parata accende una scintilla. A tre, il prossimo colpo di Ilario divampa.', en: 'Flame: every parry lights a spark. At three, Ilario’s next blow flares.' },
    skills: [
      { id: 'stoppino', lv: 1, ap: 2, taps: 2, mult: 1.0, target: 'one', brk: 1, it: 'Stoppino', en: 'Wick', dit: 'Due colpi stretti di asta.', den: 'Two tight strikes with the pole.' },
      { id: 'lanterna', lv: 1, ap: 3, taps: 1, heal: 0.3, target: 'party', it: 'Lanterna alta', en: 'Lantern high', dit: 'Cura tutto il gruppo.', den: 'Heals the whole party.' },
      { id: 'brace', lv: 3, ap: 4, taps: 2, mult: 0.75, target: 'all', brk: 0.8, fx: 'burn', it: 'Brace', en: 'Embers', dit: 'Colpisce tutti e li lascia ardere.', den: 'Hits everyone and leaves them burning.' },
      { id: 'cera', lv: 5, ap: 6, taps: 3, mult: 1.25, target: 'one', brk: 1.4, it: 'Ultima cera', en: 'Last wax', dit: 'Tre colpi pesanti.', den: 'Three heavy blows.' },
    ],
  },
  nora: {
    name: 'Nora', color: '#f2c230', hp: 104, atk: 17, spd: 16,
    role: { it: 'Figlia, clandestina', en: 'Daughter, stowaway' },
    passive: { it: 'Ritmo: un’azione tutta perfetta alza il ritmo (+8% danno). Un errore o un colpo subito lo azzera.', en: 'Rhythm: an all-perfect action raises tempo (+8% damage). A slip or a hit resets it.' },
    skills: [
      { id: 'passo', lv: 1, ap: 2, taps: 2, mult: 1.05, target: 'one', brk: 1, it: 'Passo doppio', en: 'Double step', dit: 'Due fendenti veloci.', den: 'Two quick cuts.' },
      { id: 'sgambetto', lv: 1, ap: 2, taps: 1, mult: 0.9, target: 'one', brk: 2.8, it: 'Sgambetto', en: 'Trip', dit: 'Fa vacillare il nemico.', den: 'Knocks the enemy off balance.' },
      { id: 'raffica', lv: 3, ap: 4, taps: 4, mult: 0.7, target: 'one', brk: 0.9, it: 'Raffica', en: 'Flurry', dit: 'Quattro colpi a tempo.', den: 'Four timed hits.' },
      { id: 'controtempo', lv: 5, ap: 4, taps: 2, mult: 1.1, target: 'one', brk: 1, fx: 'stagger', it: 'Controtempo', en: 'Off-beat', dit: 'Se tutto è perfetto, il nemico salta il turno.', den: 'If all perfect, the enemy loses its turn.' },
    ],
  },
  tecla: {
    name: 'Tecla', color: '#c8323c', hp: 108, atk: 16, spd: 13,
    role: { it: 'Cartografa', en: 'Cartographer' },
    passive: { it: 'Mappe: il suo attacco scopre il punto debole.', en: 'Maps: her attack uncovers the weak point.' },
    skills: [
      { id: 'segna', lv: 1, ap: 1, taps: 1, mult: 0.7, target: 'one', brk: 0.8, fx: 'mark', it: 'Segna', en: 'Mark', dit: 'Scopre il punto debole: +25% danni.', den: 'Reveals the weak point: +25% damage.' },
      { id: 'rotta', lv: 1, ap: 3, taps: 1, target: 'party', fx: 'wide', it: 'Rotta sicura', en: 'Safe course', dit: 'Le finestre di difesa si allargano per due turni nemici.', den: 'Defence windows widen for two enemy turns.' },
      { id: 'meridiana', lv: 3, ap: 3, taps: 2, mult: 0.95, target: 'one', brk: 2.4, it: 'Meridiana', en: 'Sundial', dit: 'Colpo preciso che rompe la guardia.', den: 'A precise blow that breaks the guard.' },
      { id: 'strade', lv: 5, ap: 5, taps: 3, mult: 0.6, target: 'all', brk: 1, fx: 'mark', it: 'Tutte le strade', en: 'Every road', dit: 'Colpisce e segna tutti.', den: 'Hits and marks everyone.' },
    ],
  },
  bastiano: {
    name: 'Bastiano', color: '#b88a3a', hp: 156, atk: 21, spd: 7,
    role: { it: 'Campanaro', en: 'Bell ringer' },
    passive: { it: 'Rintocchi: accumula cariche (fino a 5) e le fa suonare insieme.', en: 'Tolls: stores charges (up to 5) and rings them all at once.' },
    skills: [
      { id: 'rintocco', lv: 1, ap: 0, taps: 1, mult: 0.7, target: 'one', brk: 1, fx: 'charge', it: 'Rintocco', en: 'Toll', dit: 'Una carica in più e 2 PA.', den: 'One more charge and 2 AP.' },
      { id: 'scampanata', lv: 1, ap: 3, taps: 1, mult: 0.45, target: 'all', brk: 1, fx: 'ring', it: 'Scampanata', en: 'Peal', dit: 'Colpisce tutti: più forte per ogni carica.', den: 'Hits everyone: stronger per charge.' },
      { id: 'eco', lv: 3, ap: 2, taps: 1, target: 'party', fx: 'shield', it: 'Eco', en: 'Echo', dit: 'Uno scudo di suono per il gruppo.', den: 'A shield of sound for the party.' },
      { id: 'morto', lv: 5, ap: 5, taps: 2, mult: 1.3, target: 'one', brk: 3, fx: 'ring', it: 'Campana a morto', en: 'Death knell', dit: 'Un colpo enorme che spezza.', den: 'A huge, breaking blow.' },
    ],
  },
};

export const HERO_IDS = Object.keys(HEROES);

/** Experience needed to reach each level (index 0 = level 1). */
export const XP_TABLE = [0, 50, 130, 240, 390, 580, 820, 1100, 1430];
export const levelFor = (xp) => XP_TABLE.filter((n) => xp >= n).length;

export function statsAt(id, level) {
  const h = HEROES[id];
  return { hp: Math.round(h.hp * (1 + 0.12 * (level - 1))), atk: Math.round(h.atk * (1 + 0.1 * (level - 1)) * 10) / 10, spd: h.spd };
}

export const skillsAt = (id, level) => HEROES[id].skills.filter((s) => s.lv <= level);

export const ITEMS = {
  olio: { it: 'Olio di lanterna', en: 'Lantern oil', dit: 'Cura il 50% a chi lo riceve.', den: 'Heals 50% of one ally.', heal: 0.5 },
  cera: { it: 'Cera benedetta', en: 'Blessed wax', dit: 'Rialza un caduto con il 40%.', den: 'Raises a fallen ally with 40%.', revive: 0.4 },
};
