import test from 'node:test';
import assert from 'node:assert/strict';
import { STYLES, findStyle, stylesByGroup, styleLabel, isValidStyle } from '../js/styles.js';
import { parseVoiceCommand, stylesFromCommands } from '../js/voice.js';
import { normalizeSettings, DEFAULTS } from '../js/settings.js';
import { SHADERS, VERT_SRC, MIX_FRAG, COMPOSITE_FRAG } from '../shaders.js';

test('registry stili: ID unici e metadati completi', () => {
  const ids = STYLES.map((style) => style.id);
  assert.ok(ids.length >= 10);
  assert.equal(new Set(ids).size, ids.length);
  for (const style of STYLES) {
    assert.ok(style.name && style.nameEn && style.icon && style.gradient && style.group);
  }
  assert.equal(findStyle('bogus').id, 'none');
  assert.ok(stylesByGroup('classic').length >= 5);
  assert.ok(isValidStyle('cyber'));
  assert.ok(!isValidStyle('bogus'));
  assert.equal(styleLabel('warhol', true), 'Warhol');
});

test('ogni stile ha uno shader GLSL', () => {
  for (const style of STYLES) {
    const source = SHADERS[style.id];
    assert.ok(source && source.includes('gl_FragColor'), style.id);
    assert.ok(source.includes('u_intensity'), style.id);
  }
  assert.ok(VERT_SRC.includes('a_pos'));
  assert.ok(MIX_FRAG.includes('u_mix'));
  assert.ok(COMPOSITE_FRAG.includes('u_split'));
});

test('parser comandi vocali IT/EN', () => {
  assert.equal(parseVoiceCommand('Mostra Van Gogh'), 'vangogh');
  assert.equal(parseVoiceCommand('applica cyberpunk'), 'cyber');
  assert.equal(parseVoiceCommand('più intensità'), 'more');
  assert.equal(parseVoiceCommand('less intensity'), 'less');
  assert.equal(parseVoiceCommand('scatta la foto'), 'capture');
  assert.equal(parseVoiceCommand('record video'), 'record');
  assert.equal(parseVoiceCommand('schermo intero'), 'fullscreen');
  assert.equal(parseVoiceCommand('frasi senza senso'), null);
  assert.deepEqual(stylesFromCommands(['vangogh', 'more', 'cyber']), ['vangogh', 'cyber']);
});

test('impostazioni normalizzate e limitate', () => {
  assert.deepEqual(normalizeSettings({}), { ...DEFAULTS });
  const next = normalizeSettings({ style: 'bogus', intensity: 5, lang: 'fr', mirror: false, split: -2 });
  assert.equal(next.style, 'none');
  assert.equal(next.intensity, 1);
  assert.equal(next.lang, 'it');
  assert.equal(next.mirror, false);
  assert.equal(next.split, 0);
  assert.equal(normalizeSettings({ intensity: -1 }).intensity, 0);
});
