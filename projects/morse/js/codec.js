/* Morse Studio — pure encoding/decoding helpers */
import { MORSE, PROSIGNS } from './config.js';

const INV = {};
Object.keys(MORSE).forEach(k => { INV[MORSE[k]] = k; });

export function normalizeSymbols(value) {
  return String(value || '')
    .replace(/[•●◆]/g, '.')
    .replace(/[−–—―]/g, '-')
    .replace(/[|｜]/g, '/')
    .replace(/[  ]/g, ' ')
    .trim();
}

export function normalizeText(value) {
  return String(value || '').replace(/\r\n?/g, '\n').replace(/\t/g, ' ');
}

export function encode(text, opts = {}) {
  const unknown = [];
  const parts = [];
  let pendingSpace = false;
  for (const raw of normalizeText(text).toUpperCase()) {
    if (raw === ' ' || raw === '\n') { pendingSpace = true; continue; }
    const code = MORSE[raw];
    if (!code) { unknown.push(raw); continue; }
    if (pendingSpace && parts.length) parts.push('/');
    parts.push(code);
    pendingSpace = false;
  }
  return { morse: parts.join(' '), unknown: [...new Set(unknown)] };
}

function decodeToken(token, strict) {
  if (INV[token]) return { text: INV[token], ok: true };
  if (PROSIGNS[token]) return { text: '', ok: true, prosign: PROSIGNS[token] };
  return { text: strict ? '?' : '', ok: false };
}

export function decode(morse, opts = {}) {
  const strict = !!opts.strict;
  const cleaned = normalizeSymbols(morse).replace(/\s*\/\s*/g, ' / ');
  const tokens = cleaned.split(/\s+/).filter(Boolean);
  let out = '', errors = 0, prosigns = 0;
  let lastSpace = false;
  for (const token of tokens) {
    if (token === '/') {
      if (!lastSpace && out) out += ' ';
      lastSpace = true;
      continue;
    }
    const res = decodeToken(token, strict);
    out += res.text;
    if (res.prosign) prosigns++;
    if (!res.ok) errors++;
    lastSpace = false;
  }
  return { text: out.trimEnd(), errors, prosigns };
}

/* Segment a compact sequence (no spaces between letters) using longest codes first. */
export function decodeCompact(morse, opts = {}) {
  const source = normalizeSymbols(morse).replace(/\s+/g, '');
  if (!source) return { text: '', errors: 0 };
  const words = source.split('/');
  const allCodes = Object.keys(INV).sort((a, b) => b.length - a.length);
  const letterCodes = allCodes.filter(c => !/^[0-9]$/.test(INV[c]));
  function solveWith(codes, memo) {
    function go(s) {
      if (!s) return { text: '', ok: true };
      if (memo.has(s)) return memo.get(s);
      for (const code of codes) {
        if (s.startsWith(code)) {
          const rest = go(s.slice(code.length));
          if (rest.ok) {
            const out = { text: INV[code] + rest.text, ok: true };
            memo.set(s, out);
            return out;
          }
        }
      }
      const out = { text: opts.strict ? '?' : '', ok: false };
      memo.set(s, out);
      return out;
    }
    return go;
  }
  function solve(word) {
    const letters = solveWith(letterCodes, new Map())(word);
    return letters.ok ? letters : solveWith(allCodes, new Map())(word);
  }
  let text = '', errors = 0;
  words.forEach((word, i) => {
    if (i) text += ' ';
    const res = solve(word);
    text += res.text;
    if (!res.ok) errors++;
  });
  return { text: text.trimEnd(), errors };
}

export function autoDecode(morse, opts = {}) {
  const cleaned = normalizeSymbols(morse);
  if (/\s/.test(cleaned)) return decode(cleaned, opts);
  return decodeCompact(cleaned, opts);
}

export function validateMorse(morse) {
  const cleaned = normalizeSymbols(morse);
  const bad = cleaned.replace(/[.\-/ ]/g, '');
  return { valid: !bad, bad: [...new Set(bad)] };
}

export function stats(morse) {
  const s = normalizeSymbols(morse);
  const dots = (s.match(/\./g) || []).length;
  const dashes = (s.match(/-/g) || []).length;
  const gaps = (s.match(/[\/ ]/g) || []).length;
  return { dots, dashes, symbols: dots + dashes, gaps, units: dots + dashes * 3 + gaps };
}

export function durationSeconds(morse, wpm = 14) {
  const unit = 1.2 / Math.max(1, wpm);
  return stats(morse).units * unit;
}
