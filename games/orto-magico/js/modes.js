/** modes.js — configurazioni stagionali e sfide (puro). */

import { SEASONS, WEATHER, SEEDS, findSeason, findWeather } from './config.js';

export function dailySeed(date = new Date()) {
  return date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
}

export function mulberry32(seed) {
  let state = (Number(seed) || 1) >>> 0;
  return function random() {
    state = (state + 0x6d2b79f5) | 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

export function seasonForDate(date = new Date()) {
  const month = date.getMonth();
  if (month <= 1 || month === 11) return SEASONS[3];
  if (month <= 4) return SEASONS[0];
  if (month <= 7) return SEASONS[1];
  return SEASONS[2];
}

export function weatherForDate(date = new Date()) {
  const seed = dailySeed(date);
  return WEATHER[seed % WEATHER.length];
}

export function timeAttackConfig() {
  return { duration: 60, goal: 6, reward: 150 };
}

export function dailyConfig(date = new Date()) {
  return { seed: dailySeed(date), season: seasonForDate(date), weather: weatherForDate(date), goal: 5 };
}

export function greenhouseSeeds() {
  return Object.values(SEEDS).filter((seed) => seed.mutant);
}

export function modeEnv(state = {}, date = new Date()) {
  const mode = state.mode || 'garden';
  const seasonId = state.season || seasonForDate(date).id;
  const weatherId = state.weather || weatherForDate(date).id;
  return {
    mode,
    seasonId,
    weatherId,
    season: findSeason(seasonId),
    weather: findWeather(weatherId)
  };
}

export function modeLabel(id) {
  return ({ garden: 'Giardino', seasons: 'Stagioni', time: 'Sfida 60s', daily: 'Quotidiana', zen: 'Zen', greenhouse: 'Serra Mutanti' })[id] || id;
}

export function modeGoal(id, date = new Date()) {
  if (id === 'time') return timeAttackConfig().goal;
  if (id === 'daily') return dailyConfig(date).goal;
  if (id === 'greenhouse') return greenhouseSeeds().length;
  return null;
}
