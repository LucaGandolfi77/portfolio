import test from 'node:test';
import assert from 'node:assert/strict';

import {
  DEFAULT_LANGUAGE,
  SUPPORTED_LANGUAGES,
  confidenceBand,
  confidenceFrom,
  extractOcr,
  fileNameFor,
  formatDuration,
  historyPreview,
  languageList,
  languageNameKey,
  normalizeLanguage,
  normalizeOcrText,
  progressKey,
  textStats,
  toggleLanguage,
  truncateText,
  validateImageFile
} from '../js/text.js';

test('lingue: default, normalizzazione e toggle', () => {
  assert.deepEqual(SUPPORTED_LANGUAGES, ['eng', 'ita']);
  assert.equal(DEFAULT_LANGUAGE, 'eng+ita');
  assert.equal(normalizeLanguage('ita+eng'), 'eng+ita');
  assert.equal(normalizeLanguage('fra'), 'eng+ita');
  assert.equal(normalizeLanguage('ita+ita'), 'ita');
  assert.deepEqual(languageList('ita'), ['ita']);
  assert.equal(toggleLanguage('eng', 'ita'), 'eng+ita');
  assert.equal(toggleLanguage('eng+ita', 'eng'), 'ita');
  assert.equal(toggleLanguage('ita', 'ita'), 'ita');
  assert.equal(languageNameKey('eng'), 'langEnglish');
  assert.equal(languageNameKey('ita'), 'langItalian');
});

test('normalizeOcrText unisce hyphen, spazi e righe vuote', () => {
  assert.equal(
    normalizeOcrText('  Ciao   mondo \r\n\r\n\r\nriga-\nsuccessiva  '),
    'Ciao mondo\n\nrigasuccessiva'
  );
  assert.equal(normalizeOcrText('A\u00a0B\nC'), 'A B\nC');
  assert.equal(normalizeOcrText(null), '');
});

test('textStats conta parole, caratteri, righe e lettura', () => {
  const stats = textStats("Ciao mondo!\nÈ l'ora di Text Lab.");
  assert.equal(stats.words, 7);
  assert.equal(stats.lines, 2);
  assert.equal(stats.chars, 32);
  assert.equal(stats.charsNoSpaces, 26);
  assert.equal(stats.readingMinutes, 1);
  assert.deepEqual(textStats(''), {
    chars: 0,
    charsNoSpaces: 0,
    words: 0,
    lines: 0,
    readingMinutes: 0
  });
});

test('confidenceFrom usa confidence o la media pesata delle parole', () => {
  assert.equal(confidenceFrom({ confidence: 87.4 }), 87);
  assert.equal(confidenceFrom({ confidence: 150 }), 100);
  assert.equal(confidenceFrom({ words: [] }), 0);
  assert.equal(
    confidenceFrom({
      words: [
        { text: 'ciao', confidence: 90 },
        { text: 'mondo', confidence: 70 }
      ]
    }),
    79
  );
  assert.equal(confidenceBand(90), 'high');
  assert.equal(confidenceBand(60), 'medium');
  assert.equal(confidenceBand(20), 'low');
});

test('extractOcr restituisce testo pulito e statistiche', () => {
  const result = extractOcr(
    { text: '  HELLO\n\n\nWORLD  ', confidence: 91 },
    'eng'
  );
  assert.equal(result.text, 'HELLO\n\nWORLD');
  assert.equal(result.confidence, 91);
  assert.equal(result.language, 'eng');
  assert.equal(result.stats.words, 2);
});

test('progressKey mappa gli stati Tesseract', () => {
  assert.equal(progressKey('loading tesseract core'), 'progressCore');
  assert.equal(progressKey('loading language traineddata'), 'progressLang');
  assert.equal(progressKey('recognizing text'), 'progressRecognize');
  assert.equal(progressKey('altro'), '');
});

test('validateImageFile controlla tipo e dimensione', () => {
  assert.deepEqual(validateImageFile(null), { ok: false, code: 'EMPTY' });
  assert.deepEqual(validateImageFile({ type: 'text/plain', size: 10 }), {
    ok: false,
    code: 'IMAGE_TYPE'
  });
  assert.deepEqual(validateImageFile({ type: 'image/png', size: 30 * 1024 * 1024 }), {
    ok: false,
    code: 'IMAGE_SIZE'
  });
  assert.deepEqual(validateImageFile({ type: 'image/png', size: 1000 }), {
    ok: true,
    code: ''
  });
});

test('utility di output', () => {
  assert.match(fileNameFor(new Date('2026-11-20T15:04:05Z')), /^text-lab-2026-11-20_15-04-05\.txt$/);
  assert.equal(historyPreview('  Ciao   mondo  '), 'Ciao mondo');
  assert.match(historyPreview('parola '.repeat(40), 20), /…$/);
  assert.equal(formatDuration(900), '900 ms');
  assert.equal(formatDuration(1500), '1.5 s');
  assert.equal(formatDuration(65000), '1m 5s');
  assert.equal(truncateText('abcdef', 3), 'abc');
});
