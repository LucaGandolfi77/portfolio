/* ============================================================
   Agente Zero — match rules for every mode (pure)
   ------------------------------------------------------------
   A match is a plain object. The UI asks shotSpec() where to
   shoot from, calls release() when the ball leaves the hands,
   applyShot() when the flight is over and tick() every frame.
   ============================================================ */
import { seededRandom, dailySeed } from '../../_kit/core.js';
import { spotAt, isThree, CONTEST_SPOTS, PRACTICE_SPOTS } from './court-data.js';
import { getMission, CHAPTERS } from './career.js';
import { addBomb, sober, multiplierOf, MAX } from './drunk.js';

export const MODES = ['training', 'career', 'timed', 'three', 'zero', 'daily', 'bomb'];
export const FIRE_AT = 3;
export const TIMED_SECONDS = 60;
export const DAILY_SHOTS = 10;
export const WORD = 'ZERO';
export const BOMB_SECONDS = 90;
export const STANDING_BONUS = 10;
export const CLEAN_BONUS = 1;

const base = (id) => ({
  id, score: 0, attempts: 0, makes: 0, swishes: 0, streak: 0, bestStreak: 0,
  timeLeft: null, inFlight: false, over: false, env: {}, place: 'bunker', log: [],
});

/** Points of a basket from a spot: 2 or 3, plus 1 when it is clean. */
export function basketPoints(spot, result) {
  return (isThree(spot) ? 3 : 2) + (result === 'swish' ? 1 : 0);
}

function timedSpot(match) {
  const level = Math.floor(match.makes / 5);
  const dist = Math.min(8.2, 3.5 + level * 0.8);
  const range = dist > 6.4 ? 60 : 70;
  const angle = Math.round((match.rng() * 2 - 1) * range);
  return spotAt(angle, dist + (match.rng() - 0.5) * 0.5);
}

/** The ten shots of a day: the same for everybody. */
export function dailyShots(seed) {
  const rng = seededRandom(seed);
  for (let i = 0; i < 8; i++) rng(); // the first values of close seeds are alike
  return Array.from({ length: DAILY_SHOTS }, (_, i) => {
    const angle = Math.round((rng() * 2 - 1) * 70);
    const dist = 3.4 + i * 0.36 + rng() * 0.8;
    const spot = spotAt(angle, Math.round(dist * 10) / 10);
    const env = {};
    if (rng() < 0.3) env.wind = [Math.round((rng() * 3 - 1.5) * 10) / 10, 0];
    return { spot, env };
  });
}

/** In the bomb mode he moves a little farther out with every drink. */
function bombSpot(match) {
  const dist = Math.min(5.8, 3.4 + match.bombs * 0.28) + (match.rng() - 0.5) * 0.4;
  return spotAt(Math.round((match.rng() * 2 - 1) * 55), dist);
}

export function newMatch(id, opts = {}) {
  const match = base(id);
  match.rng = opts.rng || Math.random;
  match.place = opts.place || 'bunker';
  if (id === 'training') {
    match.spot = { ...(opts.spot || PRACTICE_SPOTS[2]) };
  } else if (id === 'timed') {
    match.timeLeft = TIMED_SECONDS;
    match.spot = spotAt(0, 3.6);
  } else if (id === 'three') {
    match.timeLeft = TIMED_SECONDS;
    match.place = opts.place || 'arena';
    match.spot = { ...CONTEST_SPOTS[0] };
  } else if (id === 'bomb') {
    match.timeLeft = BOMB_SECONDS;
    match.place = opts.place || 'beach';
    match.spot = spotAt(0, 3.6);
    Object.assign(match, { level: 0, peak: 0, bombs: 0, cleanBombs: 0, pendingDrink: false, crashed: false });
  } else if (id === 'daily') {
    match.seed = opts.seed ?? dailySeed();
    match.shots = dailyShots(match.seed);
    match.spot = { ...match.shots[0].spot };
    match.env = match.shots[0].env;
    match.place = opts.place || ['bunker', 'gym', 'roof', 'beach'][match.seed % 4];
  } else if (id === 'zero') {
    match.skill = opts.skill ?? 0.55;
    match.letters = { you: 0, cpu: 0 };
    match.leader = 'you';
    match.phase = 'lead';
    match.spot = { ...PRACTICE_SPOTS[2] };
    match.place = opts.place || 'bunker';
  } else if (id === 'career') {
    const mission = getMission(opts.chapter, opts.mission);
    if (!mission) throw new Error('unknown mission');
    match.chapter = opts.chapter;
    match.mission = opts.mission;
    match.spec = mission;
    match.place = CHAPTERS[opts.chapter].place;
    match.spot = { ...mission.spots[0] };
    match.env = { wind: mission.wind, moving: mission.moving, defender: mission.defender };
    if (mission.type === 'clock') match.timeLeft = mission.time;
    if (mission.type === 'buzzer') match.shotClock = mission.clock;
    if (mission.type === 'duel') {
      // the rival's baskets are fixed: only their order is random
      const seq = Array.from({ length: mission.shots }, (_, i) => i < mission.rival);
      for (let i = seq.length - 1; i > 0; i--) {
        const j = Math.floor(match.rng() * (i + 1));
        [seq[i], seq[j]] = [seq[j], seq[i]];
      }
      match.rivalSeq = seq;
      match.rivalScore = 0;
    }
  } else {
    throw new Error('unknown mode ' + id);
  }
  return match;
}

/** Whose turn it is (only Z-E-R-O has a computer turn). */
export function turnOf(match) {
  if (match.id !== 'zero') return 'you';
  return match.phase === 'lead' ? match.leader : match.leader === 'you' ? 'cpu' : 'you';
}

/** True when the player may choose where to shoot from. */
export function canMove(match) {
  return match.id === 'training' || (match.id === 'zero' && match.phase === 'lead' && match.leader === 'you');
}

export function setSpot(match, spot) {
  if (!canMove(match) || match.inFlight) return false;
  match.spot = { x: spot.x, y: spot.y };
  return true;
}

export function isMoneyBall(match) {
  return match.id === 'three' && match.attempts % 5 === 4;
}

export function onFire(match) {
  return match.id !== 'zero' && match.id !== 'bomb' && match.streak >= FIRE_AT;
}

export function shotSpec(match) {
  return {
    spot: match.spot, env: match.env, who: turnOf(match),
    money: isMoneyBall(match), fire: onFire(match),
  };
}

export function release(match) {
  if (match.over || match.inFlight || match.pendingDrink) return false;
  if (match.timeLeft !== null && match.timeLeft <= 0) return false;
  match.inFlight = true;
  return true;
}

/** The value a career mission measures. */
export function goalValue(match) {
  switch (match.spec?.type) {
    case 'swish': return match.swishes;
    case 'streak': return match.bestStreak;
    case 'clock': return match.score;
    default: return match.makes;
  }
}

export function starsFor(spec, value) {
  return spec.stars.filter((s) => value >= s).length;
}

function careerDone(match) {
  const spec = match.spec;
  if (spec.type === 'clock') return match.score >= spec.stars[2];
  if (match.attempts >= spec.shots) return true;
  const value = goalValue(match);
  if (spec.type === 'duel') {
    // decided as soon as one star can no longer be reached
    return value + (spec.shots - match.attempts) < spec.stars[0] || value >= spec.stars[2];
  }
  if (value >= spec.stars[2]) return true;
  const left = spec.shots - match.attempts;
  const best = spec.type === 'streak' ? Math.max(match.bestStreak, match.streak + left) : value + left;
  return best < spec.stars[0];
}

function advanceZero(match, scored) {
  const shooter = turnOf(match);
  const out = {};
  if (match.phase === 'lead') {
    if (scored) match.phase = 'copy';
    else match.leader = match.leader === 'you' ? 'cpu' : 'you';
  } else {
    if (!scored) { match.letters[shooter]++; out.letter = shooter; }
    match.phase = 'lead';
  }
  if (match.letters.you >= WORD.length || match.letters.cpu >= WORD.length) {
    match.over = true;
    match.winner = match.letters.you >= WORD.length ? 'cpu' : 'you';
  } else if (match.phase === 'lead' && match.leader === 'cpu') {
    const pool = PRACTICE_SPOTS.filter((s) => s.id !== 'half' && s.id !== 'deep');
    const s = pool[Math.floor(match.rng() * pool.length)];
    match.spot = { x: s.x, y: s.y };
  }
  return out;
}

/**
 * Applies the result of the shot in flight.
 * res: {result, scored}. Returns {made, points, fire, ignited, ...}.
 */
export function applyShot(match, res) {
  if (match.over) return { made: false, points: 0 };
  match.inFlight = false;
  const made = !!res.scored;
  const shooter = turnOf(match);
  const wasFire = onFire(match);
  const money = isMoneyBall(match);
  const spot = { ...match.spot };
  let points = 0;
  const out = { made, result: res.result, who: shooter, money, spot };

  if (shooter === 'you') {
    match.attempts++;
    if (made) {
      match.makes++;
      if (res.result === 'swish') match.swishes++;
      match.streak++;
      match.bestStreak = Math.max(match.bestStreak, match.streak);
      if (match.id === 'three') points = money ? 2 : 1;
      else if (match.id === 'bomb') points = Math.round(basketPoints(spot, res.result) * multiplierOf(match.level));
      else if (match.id !== 'zero') points = basketPoints(spot, res.result) * (wasFire ? 2 : 1);
    } else {
      match.streak = 0;
    }
    match.score += points;
    match.log.push(made);
  }
  out.points = points;
  out.fire = onFire(match);
  out.ignited = !wasFire && out.fire;

  if (match.id === 'bomb') {
    out.drunk = match.level;
    // every basket must be drunk to, unless the siren has already gone
    if (made) {
      if (match.timeLeft > 0) match.pendingDrink = true;
      match.spot = bombSpot(match);
    }
  } else if (match.id === 'timed') {
    if (made) match.spot = timedSpot(match);
  } else if (match.id === 'three') {
    if (match.attempts >= 25) match.over = true;
    else match.spot = { ...CONTEST_SPOTS[Math.floor(match.attempts / 5)] };
  } else if (match.id === 'daily') {
    if (match.attempts >= DAILY_SHOTS) match.over = true;
    else {
      match.spot = { ...match.shots[match.attempts].spot };
      match.env = match.shots[match.attempts].env;
    }
  } else if (match.id === 'zero') {
    Object.assign(out, advanceZero(match, made));
  } else if (match.id === 'career') {
    const spec = match.spec;
    if (spec.type === 'duel') {
      if (match.rivalSeq[match.attempts - 1]) { match.rivalScore++; out.rivalMade = true; }
    }
    if (spec.type === 'buzzer') match.shotClock = spec.clock;
    if (careerDone(match)) match.over = true;
    // clock missions move after a basket, the others after every shot
    const n = spec.type === 'clock' ? match.makes : match.attempts;
    match.spot = { ...spec.spots[n % spec.spots.length] };
  }
  if (match.timeLeft !== null && match.timeLeft <= 0) timeUp(match);
  return out;
}

/** The siren: in the bomb mode, still being on your feet pays. */
function timeUp(match) {
  if (match.over) return;
  match.over = true;
  if (match.id === 'bomb' && !match.crashed && match.bombs > 0) {
    match.score += STANDING_BONUS;
    match.bonus = STANDING_BONUS;
  }
}

/** The drink is finished. `clean`: the shot landed in the glass. */
export function applyBomb(match, clean) {
  if (match.id !== 'bomb' || !match.pendingDrink || match.over) return null;
  match.pendingDrink = false;
  match.bombs++;
  if (clean) { match.cleanBombs++; match.score += CLEAN_BONUS; }
  match.level = addBomb(match.level, clean);
  match.peak = Math.max(match.peak, match.level);
  if (match.level >= MAX) { match.crashed = true; match.over = true; }
  return { level: match.level, crashed: match.crashed, clean };
}

/**
 * Advances the clocks. Returns 'buzzer' when time runs out, 'late' when a
 * shot clock expires (counted as a miss), otherwise null.
 */
export function tick(match, dt) {
  // the clock waits while he drinks
  if (match.over || match.pendingDrink) return null;
  if (match.id === 'bomb') match.level = sober(match.level, dt);
  if (match.timeLeft !== null && match.timeLeft > 0) {
    match.timeLeft = Math.max(0, match.timeLeft - dt);
    if (match.timeLeft === 0) {
      // a ball already in the air still counts
      if (!match.inFlight) timeUp(match);
      return 'buzzer';
    }
  }
  if (match.shotClock !== undefined && !match.inFlight) {
    match.shotClock = Math.max(0, match.shotClock - dt);
    if (match.shotClock === 0) {
      match.inFlight = true;
      applyShot(match, { scored: false, result: 'late' });
      return 'late';
    }
  }
  return null;
}

export function summaryOf(match) {
  const s = {
    id: match.id, score: match.score, makes: match.makes, attempts: match.attempts,
    swishes: match.swishes, bestStreak: match.bestStreak, stars: 0, won: false,
  };
  if (match.id === 'career') {
    s.value = goalValue(match);
    s.stars = starsFor(match.spec, s.value);
    s.won = s.stars > 0;
    s.chapter = match.chapter;
    s.mission = match.mission;
    if (match.spec.type === 'duel') s.rivalScore = match.rivalScore;
  } else if (match.id === 'bomb') {
    Object.assign(s, {
      won: !match.crashed && match.score > 0, bombs: match.bombs, cleanBombs: match.cleanBombs,
      level: match.level, peak: match.peak, crashed: match.crashed, bonus: match.bonus || 0,
    });
  } else if (match.id === 'zero') {
    s.won = match.winner === 'you';
    s.letters = { ...match.letters };
  } else {
    s.won = match.score > 0;
  }
  return s;
}
