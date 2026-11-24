/**
 * g2p.js — G2P con eSpeak NG in WASM (CDN) + source-map + fallback euristico.
 */

import { normalizeText, heuristicG2P, toKey, normalizeIPA } from './phonetics.js';

const VERSION = '0.2.1';
const MODULE_URL = `https://cdn.jsdelivr.net/npm/@spelling-creator/spellophone@${VERSION}/dist/browser.js`;
const WASM_URL = `https://cdn.jsdelivr.net/npm/@spelling-creator/spellophone@${VERSION}/wasm/espeak-ng.wasm`;
export const VOICES = ['it', 'en', 'es', 'fr', 'de', 'pt'];

export function createG2P() {
  let engine = null, pending = null, error = null;

  async function init() {
    if (engine) return engine;
    if (pending) return pending;
    pending = (async () => {
      const module = await import(/* @vite-ignore */ MODULE_URL);
      engine = await module.createEspeak({
        cdn: 'jsdelivr',
        wasmUrl: WASM_URL,
        languages: VOICES,
        phonemeEvents: false
      });
      return engine;
    })().catch((err) => {
      error = err;
      engine = null;
      pending = null;
      throw err;
    });
    return pending;
  }

  async function phonemes(text, voice = 'it') {
    await init();
    const selected = VOICES.includes(voice) ? voice : 'it';
    try { await engine.loadVoice(selected); } catch (e) { /* voce di default */ }
    return normalizeIPA(engine.phonemes(text, { voice: selected, ipa: true, separator: '' }));
  }

  /** IPA per parola, allineato al testo sorgente (source-map a livello di parola). */
  async function sourceMap(text, voice = 'it') {
    const words = normalizeText(text).split(' ').filter(Boolean);
    const spans = [];
    for (const word of words) {
      let ipa;
      try { ipa = await phonemes(word, voice); }
      catch (e) { ipa = heuristicG2P(word).ipa; }
      spans.push({ text: word, ipa: normalizeIPA(ipa) });
    }
    return { text: words.join(' '), ipa: spans.map((s) => s.ipa).join(' '), spans };
  }

  async function analyze(text, voice = 'it') {
    const ortho = normalizeText(text);
    if (!ortho) return null;
    let ipa, engineName, spans;
    try {
      const mapped = await sourceMap(ortho, voice);
      ipa = mapped.ipa;
      spans = mapped.spans;
      engineName = 'espeak-ng';
    } catch (e) {
      spans = ortho.split(' ').filter(Boolean).map((word) => ({ text: word, ipa: heuristicG2P(word).ipa }));
      ipa = spans.map((s) => s.ipa).join(' ');
      engineName = 'heuristic';
    }
    return { ortho, ipa, key: toKey(ipa), engine: engineName, spans, voice };
  }

  return {
    init, phonemes, sourceMap, analyze,
    get ready() { return !!engine; },
    get error() { return error; },
    dispose() { if (engine) { try { engine.dispose(); } catch (e) {} engine = null; pending = null; } }
  };
}
