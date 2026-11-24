/**
 * sim.js — simulazione delle corse (logica pura, senza DOM).
 * Cavalli, meteo, terreno, quote, scommesse, fotofinish e stagione.
 */

export const COURSES = [
  { id: 'ascot', name: 'Ascot', country: 'GB', laps: 2, lapM: 1100, shape: 'oval', surface: 'turf', note: 'The Royal Meeting' },
  { id: 'epsom', name: 'Epsom', country: 'GB', laps: 1.5, lapM: 1200, shape: 'downhill', surface: 'turf', note: 'The Derby' },
  { id: 'newmarket', name: 'Newmarket', country: 'GB', laps: 3, lapM: 900, shape: 'long', surface: 'turf', note: 'The Rowley Mile' }
];

export const GROUNDS = [
  { id: 'firm', speed: 1.02, stamina: 1.12, label: 'Firm' },
  { id: 'good', speed: 1, stamina: 1, label: 'Good' },
  { id: 'soft', speed: 0.94, stamina: 0.86, label: 'Soft' },
  { id: 'heavy', speed: 0.87, stamina: 0.7, label: 'Heavy' }
];

export const WEATHERS = [
  { id: 'sun', speed: 1.01, label: 'Sunshine' },
  { id: 'cloud', speed: 1, label: 'Cloudy' },
  { id: 'rain', speed: 0.96, label: 'Rain' },
  { id: 'wind', speed: 0.97, label: 'Windy' }
];

export const JOCKEYS = [
  'R. Mullen', 'A. Chadwick', 'J. Spencer', 'T. Queensbury', 'H. Fitzroy',
  'W. Cavendish', 'E. Harrington', 'L. Ashcombe', 'G. Pembroke', 'F. Rochester'
];

export const DEFAULT_HORSES = [
  { name: 'Thunder Bolt', color: '#9e2b25' },
  { name: 'Shadowfax', color: '#d4af37' },
  { name: 'Black Pearl', color: '#2c3550' },
  { name: 'Secretariat', color: '#c8791a' },
  { name: 'Pegasus', color: '#2b6ea8' },
  { name: 'Golden Wind', color: '#b8952b' },
  { name: 'Comet', color: '#6f4b8e' },
  { name: 'Biscuit', color: '#a6a8ae' }
];

export const BET_TYPES = ['win', 'place', 'eachway', 'forecast'];

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function random() {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const clamp01 = (v) => clamp(Number(v) || 0, 0, 1);
export function groundOf(id) { return GROUNDS.find((g) => g.id === id) || GROUNDS[1]; }
export function weatherOf(id) { return WEATHERS.find((w) => w.id === id) || WEATHERS[1]; }
export function courseOf(id) { return COURSES.find((c) => c.id === id) || COURSES[0]; }

/** Crea i cavalli della corsa; `names`, `colors` e `jockeys` vengono dalle impostazioni salvate. */
export function makeHorses({ names = {}, colors = {}, jockeys = {}, rng = Math.random } = {}) {
  return DEFAULT_HORSES.map((def, i) => {
    const id = 'h' + i;
    const baseSpeed = 88 + rng() * 11;
    const accel = 18 + rng() * 10;
    const stamina = 0.35 + rng() * 0.6;
    const form = 0.5 + rng() * 0.5;
    return {
      id,
      name: names[id] || def.name,
      color: colors[id] || def.color,
      jockey: jockeys[id] || JOCKEYS[i % JOCKEYS.length],
      baseSpeed, accel, stamina, form,
      rating: Math.round(baseSpeed * 0.5 + accel * 1.2 + stamina * 100 * 0.35 + form * 30),
      distance: 0, progress: 0, currentSpeed: 0, lane: i,
      laps: 0, finishTime: null, place: null,
      surge: 0, stateTimer: 0, stride: rng() * 6.283,
      lastLapAt: 0, splitTimes: [], maxSpeedSeen: 0,
      peakGap: 0
    };
  });
}

export function createRace({ courseId = 'ascot', weatherId = 'sun', groundId = 'good', rng = Math.random, names, colors, jockeys } = {}) {
  const course = courseOf(courseId);
  const weather = weatherOf(weatherId);
  const ground = groundOf(groundId);
  const distance = course.laps * course.lapM;
  const horses = makeHorses({ names, colors, jockeys, rng });
  return {
    course, weather, ground, distance, horses,
    timer: 0, placeCount: 0, finished: [], events: [], running: true,
    multiplier: weather.speed * ground.speed,
    rng
  };
}

/** Aggiorna un cavallo; ritorna 'lap' | 'finish' | null. */
export function updateHorse(horse, dt, raceT, race) {
  if (horse.finishTime !== null) return null;
  horse.stateTimer -= dt;
  if (horse.stateTimer <= 0) {
    const r = race.rng();
    if (r < 0.28) { horse.surge = 1; horse.stateTimer = 1 + race.rng() * 2; }
    else if (r < 0.48) { horse.surge = -1; horse.stateTimer = 1 + race.rng() * 2; }
    else { horse.surge = 0; horse.stateTimer = 2 + race.rng() * 3; }
  }
  const progress = clamp01(horse.distance / race.distance);
  const staminaFactor = 1 - Math.max(0, progress - 0.5) * (1 - horse.stamina * race.ground.stamina) * 1.5;
  let target = (horse.baseSpeed / 2.6) * race.multiplier * Math.max(0.4, staminaFactor);
  if (horse.surge === 1) target *= 1.14;
  if (horse.surge === -1) target *= 0.86;
  const approach = horse.accel * dt;
  horse.currentSpeed = horse.currentSpeed < target
    ? Math.min(target, horse.currentSpeed + approach)
    : Math.max(target, horse.currentSpeed - approach);

  const previous = horse.distance;
  horse.distance += horse.currentSpeed * dt;
  horse.maxSpeedSeen = Math.max(horse.maxSpeedSeen, horse.currentSpeed);
  horse.progress = clamp01(horse.distance / race.distance);
  horse.stride += horse.currentSpeed * dt * 1.6;

  const lapLength = race.distance / race.course.laps;
  const newLap = Math.floor((horse.distance / lapLength) + 1e-9);
  if (newLap > horse.laps) {
    horse.laps = newLap;
    horse.splitTimes.push({ lap: newLap, time: +(raceT - horse.lastLapAt).toFixed(2) });
    horse.lastLapAt = raceT;
    if (newLap < race.course.laps) return 'lap';
  }
  if (previous < race.distance && horse.distance >= race.distance) {
    // interpolazione sub-frame: il fotofinish si decide in centesimi
    const fraction = clamp01((race.distance - previous) / Math.max(1e-6, horse.distance - previous));
    horse.finishTime = +((raceT - dt + fraction * dt)).toFixed(3);
    horse.distance = race.distance;
    return 'finish';
  }
  return null;
}

/** Avanza tutta la corsa; restituisce gli eventi del frame. */
export function stepRace(race, dt) {
  race.events = [];
  if (!race.running) return race.events;
  race.timer += dt;
  const justFinished = [];
  for (const horse of race.horses) {
    const event = updateHorse(horse, dt, race.timer, race);
    if (event) race.events.push({ horse, event });
    if (event === 'finish') {
      justFinished.push({
        horse,
        // distanza virtuale oltre il traguardo: usata come tie-break secondario
        overshoot: horse.currentSpeed * (1 - clamp01((race.distance - (horse.distance - horse.currentSpeed * dt)) / Math.max(1e-6, horse.currentSpeed * dt)))
      });
    }
  }
  justFinished.sort((a, b) =>
    a.horse.finishTime - b.horse.finishTime || b.overshoot - a.overshoot
  );
  for (const item of justFinished) {
    race.placeCount += 1;
    item.horse.place = race.placeCount;
    race.finished.push(item.horse);
    race.events.push({ horse: item.horse, event: 'place', place: item.horse.place });
  }
  if (race.finished.length === race.horses.length) race.running = false;
  return race.events;
}

export function ranking(race) {
  return [...race.horses].sort((a, b) =>
    (a.place ?? 999) - (b.place ?? 999) ||
    (a.finishTime ?? Infinity) - (b.finishTime ?? Infinity) ||
    b.distance - a.distance
  );
}

/** Quote da valutazione + "denaro pubblico" opzionale. */
export function oddsOf(horses, horse, money = {}) {
  if (!horses.length) return 1.1;
  const average = horses.reduce((sum, h) => sum + h.rating, 0) / horses.length;
  const strength = (horse.rating / Math.max(1, average)) / (1 + (money[horse.id] || 0) / 1000);
  return Math.max(1.1, Math.round((1 / Math.max(0.2, strength) * 3.2 + 1.6) * 10) / 10);
}

/** Liquidazione scommesse: win, place, each-way, forecast. */
export function settleBet(bet, ranked) {
  if (!bet || !ranked || ranked.length < 2) return { stake: 0, payout: 0, gain: 0, won: false };
  const place = ranked.findIndex((h) => h.id === bet.horseId) + 1;
  const stake = Number(bet.stake) || 0;
  const odds = Number(bet.odds) || 1.1;
  let payout = 0;
  if (bet.type === 'win' && place === 1) payout = stake * odds;
  else if (bet.type === 'place' && place > 0 && place <= 3) payout = stake * odds * 0.55;
  else if (bet.type === 'eachway') {
    const half = stake / 2;
    if (place === 1) payout += half * odds;
    if (place > 0 && place <= 3) payout += half * odds * 0.2;
  } else if (bet.type === 'forecast' && place === 1 && ranked[1].id === bet.forecastId) {
    payout = stake * odds;
  }
  payout = Math.round(payout);
  return { stake, payout, gain: payout - stake, won: payout > 0, place };
}

export function seasonPoints(place) {
  return [12, 8, 6, 4, 2, 1][place - 1] || 0;
}

export function applySeason(standings, ranked, race) {
  const next = { ...standings };
  ranked.forEach((horse, index) => {
    const place = index + 1;
    const entry = next[horse.id] || { id: horse.id, name: horse.name, points: 0, wins: 0, podiums: 0, races: 0, earnings: 0 };
    entry.name = horse.name;
    entry.points += seasonPoints(place);
    entry.races += 1;
    if (place === 1) entry.wins += 1;
    if (place <= 3) entry.podiums += 1;
    next[horse.id] = entry;
  });
  return next;
}

export function photoFinishMargin(race) {
  const [first, second] = ranking(race);
  if (!first || !second || first.finishTime === null || second.finishTime === null) return null;
  return +Math.abs(second.finishTime - first.finishTime).toFixed(3);
}

/** Campione posizioni per il replay 3D (ultimi istanti prima del traguardo). */
export function recordSample(race) {
  const top = [...race.horses].sort((a, b) => b.progress - a.progress).slice(0, 4);
  return {
    t: +race.timer.toFixed(3),
    horses: top.map((h) => ({ id: h.id, progress: h.progress, speed: h.currentSpeed, lane: h.lane, color: h.color, name: h.name }))
  };
}

export function pickMeeting(rng = Math.random) {
  const course = COURSES[Math.floor(rng() * COURSES.length)];
  const weather = WEATHERS[Math.floor(rng() * WEATHERS.length)];
  const ground = GROUNDS[Math.floor(rng() * GROUNDS.length)];
  return { courseId: course.id, weatherId: weather.id, groundId: ground.id };
}
