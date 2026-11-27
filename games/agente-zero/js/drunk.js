/* ============================================================
   Agente Zero — how drunk he is, and what that does (pure)
   ------------------------------------------------------------
   Everything is a function of the level (0…100) and the match
   clock, never of chance: a player can learn the rhythm and
   shoot when the arrow passes through the middle.
   ============================================================ */

export const MAX = 100;
export const PER_BOMB = 18;
export const PER_SPILL = 12;
export const DECAY = 0.5;          // points per second of play
export const STAGES = [0, 20, 40, 60, 80];
export const MULT = [1, 1.5, 2, 2.5, 3];

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export function stageOf(level) {
  let s = 0;
  while (s + 1 < STAGES.length && level >= STAGES[s + 1]) s++;
  return s;
}

export const multiplierOf = (level) => MULT[stageOf(level)];
export const addBomb = (level, clean) => clamp(level + (clean ? PER_BOMB : PER_SPILL), 0, MAX);
export const sober = (level, dt) => clamp(level - DECAY * dt, 0, MAX);

/** 0 while sober, 1 when he can barely stand. */
export const strength = (level) => clamp((level - 15) / (MAX - 15), 0, 1);

export const AIM_AMP = 0.065;      // radians
export const POWER_AMP = 0.022;
export const HICCUP = { from: 40, every: 4.5, lasts: 0.22, drop: 0.06, at: 3.1 };
export const FLIP = { from: 80, every: 8, lasts: 1.8, at: 5 };

const within = (t, rule) => {
  const ph = (((t - rule.at) % rule.every) + rule.every) % rule.every;
  return ph < rule.lasts;
};

/**
 * The error added to a shot released at time t:
 * a figure of eight (aim once per turn, power twice), plus hiccups
 * and, when very drunk, short moments with left and right swapped.
 */
export function wobbleAt(t, level) {
  const k = strength(level);
  const w = Math.PI * 2 * (0.25 + 0.3 * strength(level));
  const hiccup = level >= HICCUP.from && within(t, HICCUP);
  return {
    aim: AIM_AMP * k * Math.sin(w * t),
    power: POWER_AMP * k * Math.sin(2 * w * t) - (hiccup ? HICCUP.drop : 0),
    hiccup,
    flip: level >= FLIP.from && within(t, FLIP),
  };
}

/** The player's release as the drunk hands deliver it. */
export function applyWobble(err, w) {
  const aim = err.aim ?? 0;
  return { ...err, power: (err.power ?? 1) + w.power, aim: (w.flip ? -aim : aim) + w.aim };
}

/**
 * The S the ball draws in the air. It starts and ends at zero with
 * zero sideways speed, so the ball still arrives where it was sent.
 */
export function swerveAt(tau, length, amp) {
  if (tau <= 0 || tau >= length) return 0;
  const s = tau / length;
  return amp * Math.sin(Math.PI * 2 * s) * Math.sin(Math.PI * s);
}

export const swerveAmp = (level) => (level < 40 ? 0 : 0.25 + 0.55 * clamp((level - 40) / 60, 0, 1));

/**
 * Bends the recorded flight of a simulated shot. `shot` is the release
 * state, `frame` the time between path samples. Returns a new result.
 */
export function swerve(sim, shot, level, frame, sign = 1) {
  const amp = swerveAmp(level) * sign;
  if (!amp) return sim;
  const [vx, vy] = shot.v;
  const vh = Math.hypot(vx, vy);
  const dist = Math.hypot(shot.p[0], shot.p[1]);
  const length = (0.82 * dist) / Math.max(1, vh); // over before the rim
  const rx = vy / vh, ry = -vx / vh;
  const path = sim.path.map((f, i) => {
    const o = swerveAt(i * frame, length, amp);
    return o ? { ...f, p: [f.p[0] + rx * o, f.p[1] + ry * o, f.p[2]] } : f;
  });
  return { ...sim, path };
}

/** What the screen does. Nothing here changes the shot. */
export function effects(t, level, calm = false) {
  const k = strength(level);
  const spin = level >= 80 ? (level - 80) / 20 : 0;
  const double = level >= 60 ? (level - 60) / 40 : 0;
  if (calm) return { rot: 0, dx: Math.sin(t * 0.9) * 3 * k, dy: 0, double: 0, offset: 0, vignette: k * 0.5 };
  return {
    rot: Math.sin(t * 1.1) * (0.025 * k + 0.07 * spin) + Math.sin(t * 0.47) * 0.04 * spin,
    dx: Math.sin(t * 0.83) * 14 * k,
    dy: Math.sin(t * 1.67) * 7 * k,
    double: double ? 0.18 + 0.22 * double : 0,
    offset: double ? Math.sin(t * 1.9) * (8 + 20 * double) : 0,
    vignette: k,
  };
}
