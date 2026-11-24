import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeText, heuristicG2P, toKey, syllableCount, vowelConsonantRatio, analyzeWord, normalizeIPA
} from '../js/phonetics.js';
import { guessLanguage, LANGUAGES, languageLabel } from '../js/language.js';
import { levenshtein, similarity, alignment } from '../js/compare.js';

test('normalizzazione testo', () => {
  assert.equal(normalizeText('  Ciao,  MONDO!  '), 'ciao mondo');
  assert.equal(normalizeText(null), '');
});

test('G2P euristico produce IPA e chiave', () => {
  const a = heuristicG2P('schiverrrr');
  assert.ok(a.ipa.includes('ʃ'));
  assert.equal(a.key, 'siver');
  const b = heuristicG2P('finkure');
  assert.equal(b.key, 'finkure');
  assert.equal(b.engine, 'heuristic');
});

test('toKey rimuove diacritici e doppie', () => {
  assert.equal(toKey('ʃiverr'), 'siver');
  assert.equal(toKey('aːːbbc'), 'abc');
});

test('sillabe e rapporto V/C', () => {
  assert.equal(syllableCount('casa'), 2);
  assert.equal(syllableCount('a'), 1);
  assert.equal(syllableCount(''), 0);
  const vc = vowelConsonantRatio('kat');
  assert.equal(vc.vowels, 1);
  assert.equal(vc.consonants, 2);
  assert.equal(vc.ratio, 0.5);
  const analysis = analyzeWord({ ortho: 'finkure', ipa: 'fɪŋkuːrə', key: 'finkure' });
  assert.ok(analysis.syllables >= 2);
  assert.ok(Array.isArray(analysis.phonemes));
  assert.equal(normalizeIPA('ˈfɪŋːku'), 'fɪŋku');
});

test('guessLanguage restituisce percentuali ordinate', () => {
  const result = guessLanguage(['laskolaien', 'strasspaper']);
  assert.ok(result.length >= 5);
  assert.equal(result.reduce((sum, item) => sum + item.pct, 0) > 95, true);
  for (let i = 1; i < result.length; i += 1) assert.ok(result[i - 1].pct >= result[i].pct);
  const withPrior = guessLanguage(['strasspaper'], { whisperLang: 'it', priorWeight: 2 });
  assert.equal(withPrior[0].lang, 'it');
  assert.deepEqual(guessLanguage(['']), []);
  assert.ok(Object.keys(LANGUAGES).length >= 8);
  assert.equal(languageLabel('en', true), 'English');
});

test('Levenshtein, similarità e allineamento', () => {
  assert.equal(levenshtein('casa', 'casa').distance, 0);
  assert.equal(levenshtein('casa', 'caso').distance, 1);
  assert.equal(similarity('abc', 'abc'), 100);
  assert.equal(similarity('abc', 'xyz'), 0);
  assert.equal(similarity('', ''), 100);
  const aligned = alignment('finkure', 'finkur');
  assert.ok(aligned.length > 0);
  assert.ok(aligned.some((item) => item.type === 'match'));
  assert.ok(aligned.some((item) => item.type === 'delete'));
});
