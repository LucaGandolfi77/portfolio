import test from 'node:test';
import assert from 'node:assert/strict';

import {
  COURSES, GROUNDS, WEATHERS, DEFAULT_HORSES, mulberry32, makeHorses, createRace,
  updateHorse, stepRace, ranking, oddsOf, settleBet, seasonPoints, applySeason,
  photoFinishMargin, recordSample, pickMeeting, groundOf, weatherOf, courseOf
} from '../js/sim.js';

const makeRng = () => mulberry32(42);

test('configurazioni corse valide', () => {
  assert.ok(COURSES.length >= 3);
  assert.ok(GROUNDS.length >= 4);
  assert.ok(WEATHERS.length >= 4);
  assert.equal(courseOf('bogus').id, 'ascot');
  assert.equal(groundOf('bogus').id, 'good');
  assert.equal(weatherOf('bogus').id, 'cloud');
  const meeting = pickMeeting(makeRng());
  assert.ok(COURSES.some((c) => c.id === meeting.courseId));
  assert.ok(GROUNDS.some((g) => g.id === meeting.groundId));
});

test('RNG deterministico e cavalli iniziali', () => {
  const a = makeRng(), b = makeRng();
  assert.equal(a(), b());
  const horses = makeHorses({ rng: makeRng() });
  assert.equal(horses.length, DEFAULT_HORSES.length);
  assert.equal(new Set(horses.map((h) => h.id)).size, horses.length);
  assert.ok(horses.every((h) => h.rating > 0 && h.jockey));
  const custom = makeHorses({ names: { h0: 'Arthur' }, colors: { h0: '#123456' }, jockeys: { h0: 'J. Doe' }, rng: makeRng() });
  assert.equal(custom[0].name, 'Arthur');
  assert.equal(custom[0].jockey, 'J. Doe');
});

test('updateHorse avanza e assegna il finish con tempo interpolato', () => {
  const race = createRace({ rng: makeRng() });
  const horse = race.horses[0];
  let event = null;
  for (let i = 0; i < 2000 && event !== 'finish'; i += 1) {
    event = updateHorse(horse, 0.05, race.timer + i * 0.05, race);
  }
  assert.equal(event, 'finish');
  assert.ok(horse.finishTime > 0);
  assert.equal(horse.distance, race.distance);
  assert.ok(horse.splitTimes.length >= 1);
});

test('stepRace assegna posizioni uniche e termina', () => {
  const race = createRace({ courseId: 'newmarket', rng: makeRng() });
  let guard = 0;
  while (race.running && guard++ < 6000) stepRace(race, 0.05);
  assert.equal(race.running, false);
  assert.equal(race.finished.length, race.horses.length);
  assert.equal(new Set(race.horses.map((h) => h.place)).size, race.horses.length);
  const ranked = ranking(race);
  assert.equal(ranked[0].place, 1);
  assert.ok(ranked[0].finishTime <= ranked[1].finishTime);
  assert.ok(photoFinishMargin(race) >= 0);
  const sample = recordSample(race);
  assert.ok(sample.horses.length <= 4 && sample.horses.length > 0);
});

test('quote limitate e reattive al denaro', () => {
  const horses = makeHorses({ rng: makeRng() });
  const best = horses.reduce((a, b) => (a.rating > b.rating ? a : b));
  const base = oddsOf(horses, best);
  assert.ok(base >= 1.1);
  assert.ok(oddsOf(horses, best, { [best.id]: 5000 }) > base);
  assert.equal(oddsOf([], best), 1.1);
});

test('liquidazione di tutti i tipi di scommessa', () => {
  const horses = makeHorses({ rng: makeRng() });
  const ranked = [...horses].sort((a, b) => b.rating - a.rating);
  const first = ranked[0].id, second = ranked[1].id, last = ranked[ranked.length - 1].id;
  assert.ok(settleBet({ horseId: first, stake: 10, odds: 4, type: 'win' }, ranked).payout > 10);
  assert.equal(settleBet({ horseId: last, stake: 10, odds: 4, type: 'win' }, ranked).payout, 0);
  assert.ok(settleBet({ horseId: ranked[2].id, stake: 10, odds: 4, type: 'place' }, ranked).payout > 0);
  assert.equal(settleBet({ horseId: ranked[5].id, stake: 10, odds: 4, type: 'place' }, ranked).payout, 0);
  assert.ok(settleBet({ horseId: first, stake: 10, odds: 4, type: 'eachway' }, ranked).payout > 10);
  assert.ok(settleBet({ horseId: first, stake: 10, odds: 4, type: 'forecast', forecastId: second }, ranked).payout > 10);
  assert.equal(settleBet({ horseId: first, stake: 10, odds: 4, type: 'forecast', forecastId: last }, ranked).payout, 0);
  const loss = settleBet({ horseId: last, stake: 10, odds: 4, type: 'win' }, ranked);
  assert.equal(loss.gain, -10);
});

test('punti stagione e classifica cumulativa', () => {
  assert.equal(seasonPoints(1), 12);
  assert.equal(seasonPoints(2), 8);
  assert.equal(seasonPoints(7), 0);
  const horses = makeHorses({ rng: makeRng() });
  const ranked = [...horses].sort((a, b) => b.rating - a.rating);
  const season = applySeason({}, ranked, { course: COURSES[0] });
  assert.equal(season[ranked[0].id].points, 12);
  assert.equal(season[ranked[0].id].wins, 1);
  const again = applySeason(season, ranked, { course: COURSES[0] });
  assert.equal(again[ranked[0].id].points, 24);
});

test('condizioni meteo e terreno influenzano la velocità', () => {
  const firm = createRace({ groundId: 'firm', weatherId: 'sun', rng: makeRng() });
  const heavy = createRace({ groundId: 'heavy', weatherId: 'rain', rng: makeRng() });
  assert.ok(firm.multiplier > heavy.multiplier);
  const a = makeHorses({ rng: makeRng() })[0];
  const b = makeHorses({ rng: makeRng() })[0];
  a.baseSpeed = b.baseSpeed; a.accel = b.accel; a.stamina = b.stamina;
  for (let i = 0; i < 200; i += 1) { updateHorse(a, 0.05, i * 0.05, firm); updateHorse(b, 0.05, i * 0.05, heavy); }
  assert.ok(a.distance > b.distance);
});
