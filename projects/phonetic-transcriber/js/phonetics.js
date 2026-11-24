/**
 * phonetics.js — trasformazioni fonetiche pure (nessun DOM, testabile in Node).
 */

const PHON = { ph: 'f', ck: 'k', gh: 'g', gn: 'ɲ', sch: 'ʃ', sh: 'ʃ', ch: 'tʃ', ll: 'ʎ', rr: 'r', th: 'θ', igh: 'ai', eigh: 'ei' };
const SIMPLE = { j: 'ʒ', w: 'w', k: 'k', x: 'ks', q: 'kw', z: 'z', v: 'v', b: 'b', n: 'n', r: 'r', l: 'l', m: 'm', d: 'd', t: 't', s: 's', p: 'p', f: 'f', g: 'g', c: 'k', h: 'h', y: 'j' };

export function normalizeText(value) {
  return String(value == null ? '' : value).toLowerCase()
    .replace(/[.,;:!?„""''\-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function stripAccents(value) {
  return String(value || '')
    .replace(/[àáâäã]/g, 'a').replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i').replace(/[òóôöõ]/g, 'o')
    .replace(/[ùúûü]/g, 'u');
}

/** G2P euristico di fallback (ipa approssimato + chiave astratta). */
export function heuristicG2P(word) {
  const w = stripAccents(normalizeText(word));
  let ipa = '';
  for (let i = 0; i < w.length; i += 1) {
    const two = w.slice(i, i + 2), three = w.slice(i, i + 3);
    const four = w.slice(i, i + 4), five = w.slice(i, i + 5);
    let segment;
    if (five === 'eigh') { segment = 'ei'; i += 4; }
    else if (four === 'ight') { segment = 'ait'; i += 3; }
    else if (three === 'sch') { segment = 'ʃ'; i += 2; }
    else if (three === 'gli') { segment = 'ʎi'; i += 2; }
    else if (three === 'igh') { segment = 'ai'; i += 2; }
    else if (PHON[two]) { segment = PHON[two]; i += 1; }
    else if (w[i] === w[i + 1]) { segment = SIMPLE[w[i]] || w[i]; i += 1; }
    else segment = SIMPLE[w[i]] || w[i];
    ipa += segment;
  }
  return { ipa, key: toKey(ipa), engine: 'heuristic' };
}

/** Rende un IPA leggibile come chiave fonetica astratta senza alfabeto. */
export function toKey(ipa) {
  return String(ipa || '')
    .replace(/ʃ/g, 's').replace(/tʃ/g, 'c').replace(/ʒ/g, 'z')
    .replace(/θ/g, 't').replace(/ð/g, 'd').replace(/ŋ/g, 'n')
    .replace(/ʎ/g, 'li').replace(/ɲ/g, 'ni')
    .replace(/œ/g, 'e').replace(/ø/g, 'e').replace(/ç/g, 'c').replace(/ß/g, 's')
    .replace(/j/g, 'i').replace(/ks/g, 'x')
    .replace(/[ˈˌː͡]/g, '')
    .replace(/[^a-z]/g, '')
    .replace(/(.)\1+/g, '$1');
}

/** Sillabe stimate da gruppi vocalici (approssimazione dichiarata). */
export function syllableCount(text) {
  const clean = String(text || '').toLowerCase().replace(/[^a-z]/g, '');
  if (!clean) return 0;
  const groups = clean.match(/[aeiouy]+/g) || [];
  return Math.max(1, groups.length - (/e$/.test(clean) && groups.length > 1 ? 1 : 0));
}

export function vowelConsonantRatio(text) {
  const clean = String(text || '').toLowerCase().replace(/[^a-z]/g, '');
  const vowels = (clean.match(/[aeiou]/g) || []).length;
  const consonants = (clean.match(/[bcdfghjklmnpqrstvwxyz]/g) || []).length;
  return {
    vowels,
    consonants,
    ratio: consonants ? +(vowels / consonants).toFixed(2) : vowels ? 1 : 0
  };
}

export function phonemeGrid(ipa) {
  const tokens = String(ipa || '').match(/[a-zɑɐæəɜɛɘɤɨɪɵɯʊʌœøʏũɪ̈ʃʒθðŋʎɲtʃdʒaɪaʊeɪoʊɔɪːˈˌ͡]|./gu) || [];
  const vowels = new Set('aeiouɑɐæəɜɛɘɤɨɪɵɯʊʌœøʏ'.split(''));
  return tokens.filter((token) => /[a-zɑ-ʯ]/iu.test(token) && !'ˈˌː͡'.includes(token)).map((token) => ({
    symbol: token,
    type: vowels.has(token.toLowerCase()) ? 'vowel' : 'consonant'
  }));
}

export function analyzeWord({ ortho = '', ipa = '', key = '' } = {}) {
  const vc = vowelConsonantRatio(key);
  return {
    syllables: syllableCount(key || ortho),
    vowels: vc.vowels,
    consonants: vc.consonants,
    vcRatio: vc.ratio,
    stressMarks: (String(ipa).match(/[ˈˌ]/g) || []).length,
    length: String(key).length,
    phonemes: phonemeGrid(ipa)
  };
}

export function normalizeIPA(value) {
  return String(value || '').replace(/[ˈˌː͡]/g, '').replace(/\s+/g, ' ').trim();
}
