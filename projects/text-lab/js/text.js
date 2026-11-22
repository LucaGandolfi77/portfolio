/**
 * text.js — logica pura di Text Lab: lingue, pulizia OCR, statistiche e progress.
 * Nessuna dipendenza dal DOM.
 */

export const SUPPORTED_LANGUAGES = ['eng', 'ita'];
export const DEFAULT_LANGUAGE = 'eng+ita';
export const MAX_IMAGE_BYTES = 25 * 1024 * 1024;
export const HISTORY_TEXT_LIMIT = 50000;

const PROGRESS_KEYS = {
  'loading tesseract core': 'progressCore',
  'initializing tesseract': 'progressInit',
  'loading language traineddata': 'progressLang',
  'initializing api': 'progressApi',
  'recognizing text': 'progressRecognize'
};

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, Number(value) || 0));
}

export function normalizeLanguage(value) {
  const selected = String(value || '')
    .split('+')
    .map((code) => code.trim().toLowerCase())
    .filter((code, index, list) => SUPPORTED_LANGUAGES.includes(code) && list.indexOf(code) === index);
  if (!selected.length) return DEFAULT_LANGUAGE;
  return SUPPORTED_LANGUAGES.filter((code) => selected.includes(code)).join('+');
}

export function languageList(value) {
  return normalizeLanguage(value).split('+');
}

export function toggleLanguage(current, code) {
  const target = String(code || '').toLowerCase();
  if (!SUPPORTED_LANGUAGES.includes(target)) return normalizeLanguage(current);
  const selected = new Set(languageList(current));
  if (selected.has(target)) {
    if (selected.size === 1) return normalizeLanguage(current);
    selected.delete(target);
  } else {
    selected.add(target);
  }
  return SUPPORTED_LANGUAGES.filter((item) => selected.has(item)).join('+');
}

export function languageNameKey(code) {
  if (code === 'ita') return 'langItalian';
  if (code === 'eng') return 'langEnglish';
  return 'languageLabel';
}

export function progressKey(status) {
  return PROGRESS_KEYS[status] || '';
}

/**
 * Pulizia conservativa del testo OCR: unisce le parole spezzate a fine riga,
 * normalizza spazi e righe vuote senza alterare i paragrafi.
 */
export function normalizeOcrText(input) {
  return String(input == null ? '' : input)
    .replace(/\r\n?/g, '\n')
    .replace(/\u00a0/g, ' ')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/([\p{L}\p{N}])-\n([\p{L}])/gu, '$1$2')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function textStats(input) {
  const text = String(input == null ? '' : input);
  const trimmed = text.trim();
  const words = trimmed
    ? (trimmed.match(/[\p{L}\p{N}]+(?:['’\-][\p{L}\p{N}]+)*/gu) || []).length
    : 0;
  const lines = trimmed ? trimmed.split('\n').length : 0;
  const readingMinutes = words > 0 ? Math.max(1, Math.ceil(words / 200)) : 0;
  return {
    chars: text.length,
    charsNoSpaces: text.replace(/\s/g, '').length,
    words,
    lines,
    readingMinutes
  };
}

export function confidenceFrom(data) {
  if (!data) return 0;
  const direct = Number(data.confidence);
  if (Number.isFinite(direct)) return clamp(Math.round(direct), 0, 100);
  const words = Array.isArray(data.words) ? data.words : [];
  if (!words.length) return 0;
  let weighted = 0;
  let total = 0;
  for (const word of words) {
    const length = String(word.text || '').replace(/\s/g, '').length || 1;
    weighted += (Number(word.confidence) || 0) * length;
    total += length;
  }
  return total ? clamp(Math.round(weighted / total), 0, 100) : 0;
}

export function confidenceBand(value) {
  const score = clamp(value, 0, 100);
  if (score >= 80) return 'high';
  if (score >= 55) return 'medium';
  return 'low';
}

export function extractOcr(data, language = DEFAULT_LANGUAGE) {
  const text = normalizeOcrText(data && data.text);
  return {
    text,
    confidence: confidenceFrom(data),
    language: normalizeLanguage(language),
    stats: textStats(text)
  };
}

export function validateImageFile(file) {
  if (!file) return { ok: false, code: 'EMPTY' };
  if (!/^image\//i.test(String(file.type || ''))) return { ok: false, code: 'IMAGE_TYPE' };
  if (Number(file.size) > MAX_IMAGE_BYTES) return { ok: false, code: 'IMAGE_SIZE' };
  return { ok: true, code: '' };
}

export function fileNameFor(date = new Date()) {
  const value = date instanceof Date && !Number.isNaN(date.getTime()) ? date : new Date();
  const stamp = value
    .toISOString()
    .replace(/[:.]/g, '-')
    .replace('T', '_')
    .slice(0, 19);
  return `text-lab-${stamp}.txt`;
}

export function historyPreview(text, max = 96) {
  const clean = String(text || '').replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  return clean.slice(0, max).replace(/\s+\S*$/, '') + '…';
}

export function formatDuration(milliseconds) {
  const value = Math.max(0, Number(milliseconds) || 0);
  if (value < 1000) return `${Math.round(value)} ms`;
  if (value < 60000) return `${(value / 1000).toFixed(value < 10000 ? 1 : 0)} s`;
  const minutes = Math.floor(value / 60000);
  const seconds = Math.round((value % 60000) / 1000);
  return `${minutes}m ${seconds}s`;
}

export function truncateText(text, max = HISTORY_TEXT_LIMIT) {
  const value = String(text || '');
  return value.length > max ? value.slice(0, max) : value;
}
