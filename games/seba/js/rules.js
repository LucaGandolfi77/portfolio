/* ============================================================
   Seba — the tables: needs, consumables, thresholds, rewards
   ------------------------------------------------------------
   Pure data. Every bar runs 0..100 and 100 means "satisfied".
   Brands, drinks and venues are all invented.
   ============================================================ */
export const NEEDS = ['thirst', 'smoke', 'food', 'sleep', 'fun', 'hygiene'];
export const NEED_ICON = { thirst: '🍺', smoke: '🚬', food: '🥙', sleep: '😴', fun: '🎉', hygiene: '🧼' };

/** Points lost per real hour while awake. */
export const DECAY = { thirst: 9, smoke: 11, food: 7, sleep: 5.5, fun: 8, hygiene: 4 };
export const ASLEEP_DECAY = 0.35;     // other needs slow down in bed
export const SLEEP_GAIN = 18;         // sleep per hour in bed
export const OFFLINE_CAP_H = 12;

export const DRUNK = { tipsy: 60, wasted: 85, passOut: 100, fadeAwake: 15, fadeAsleep: 25 };
export const HANGOVER = { fadeAwake: 12, fadeAsleep: 22, max: 90 };
export const PASS_OUT_MS = 10 * 60 * 1000;
export const AFTERGLOW_MS = 30 * 60 * 1000;

/**
 * kind: drink | smoke | food | care
 * eff: added to needs; drunk/hangover/liver/lungs are the hidden states.
 */
export const ITEMS = {
  acqua:    { kind: 'drink', icon: '💧', price: 0, eff: { thirst: 28 }, drunk: -14, hangover: -10, liver: 1 },
  birra:    { kind: 'drink', icon: '🍺', price: 3, eff: { thirst: 28, fun: 4 }, drunk: 11 },
  spritz:   { kind: 'drink', icon: '🍹', price: 5, eff: { thirst: 24, fun: 9 }, drunk: 14 },
  shot:     { kind: 'drink', icon: '🥃', price: 4, eff: { thirst: 8, fun: 14 }, drunk: 22 },
  negroni:  { kind: 'drink', icon: '🍸', price: 7, eff: { thirst: 20, fun: 12 }, drunk: 20 },
  caffe:    { kind: 'drink', icon: '☕', price: 2, eff: { sleep: 14, thirst: 4 }, drunk: -5, hangover: -6 },
  sigaretta:{ kind: 'smoke', icon: '🚬', price: 2, eff: { smoke: 40 }, lungs: -3 },
  sigaro:   { kind: 'smoke', icon: '🪵', price: 6, eff: { smoke: 75, fun: 6 }, lungs: -6 },
  menta:    { kind: 'smoke', icon: '🍬', price: 1, eff: { smoke: 18 }, lungs: 1 },
  toast:    { kind: 'food', icon: '🥪', price: 3, eff: { food: 30 }, drunk: -4, hangover: -4 },
  pasta:    { kind: 'food', icon: '🍝', price: 5, eff: { food: 48 }, drunk: -6, hangover: -8 },
  kebab:    { kind: 'food', icon: '🥙', price: 6, eff: { food: 58, hygiene: -6, fun: 4 }, drunk: -9, hangover: -14 },
  frutta:   { kind: 'food', icon: '🍉', price: 2, eff: { food: 18, thirst: 10 }, liver: 4 },
  cornetto: { kind: 'food', icon: '🥐', price: 2, eff: { food: 22, fun: 5 }, hangover: -5 },
  deo:      { kind: 'care', icon: '🧴', price: 2, eff: { hygiene: 25 } },
};

/** The local drink of each city is a stronger, funnier consumable. */
export const LOCAL_DRINK = { kind: 'drink', icon: '🍶', eff: { thirst: 25, fun: 20 }, drunk: 17 };

export const GAMES = {
  shift:   { icon: '🍸', tips: 28, xp: 34, party: false, eff: { fun: 14, sleep: -7, hygiene: -6 } },
  dj:      { icon: '🎛️', tips: 14, xp: 30, party: true,  eff: { fun: 26, sleep: -6, thirst: -6 } },
  dance:   { icon: '🕺', tips: 10, xp: 28, party: true,  eff: { fun: 30, sleep: -8, hygiene: -12, thirst: -8 } },
  lighter: { icon: '🔥', tips: 4,  xp: 12, party: false, eff: { fun: 6 } },
  runner:  { icon: '🌅', tips: 12, xp: 26, party: false, eff: { fun: 14, sleep: -6, hygiene: -5 } },
  quiz:    { icon: '🙈', tips: 8,  xp: 20, party: false, eff: { fun: 16 } },
};

export const MIN_HYGIENE_FOR_RAVE = 15;
export const MIN_SLEEP_FOR_PLAY = 6;
