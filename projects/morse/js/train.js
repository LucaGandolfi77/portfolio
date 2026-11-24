/* Morse Studio — training primitives (pure) */
import { MORSE } from './config.js';

const CHARS = Object.keys(MORSE).filter(c => /^[A-Z0-9]$/.test(c));

export function randomItem(list, rng = Math.random) { return list[Math.floor(rng() * list.length)]; }
export function randomSymbol(rng = Math.random) {
  const char = randomItem(CHARS, rng);
  return { char, code: MORSE[char] };
}
export function dictationSequence(rng = Math.random, length = 5) {
  const chars = Array.from({ length }, () => randomItem(CHARS, rng));
  return { chars: chars.join(''), morse: chars.map(c => MORSE[c]).join(' ') };
}
export function normalizeGuess(guess) { return String(guess || '').toUpperCase().replace(/[^A-Z0-9]/g, ''); }
export function checkGuess(expected, guess) { return normalizeGuess(guess) === normalizeGuess(expected); }
export function accuracy(correct, total) { return total ? Math.round(correct / total * 100) : 0; }
export function speedWpm(chars, seconds) {
  const minutes = Math.max(seconds, 1) / 60;
  return Math.round((String(chars).length / 5) / minutes);
}
