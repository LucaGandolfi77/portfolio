import test from 'node:test';
import assert from 'node:assert/strict';
import { FILTERS, DEFAULT_SETTINGS, findFilter } from '../js/config.js';
import { parseVoiceCommand } from '../js/voice.js';
import { anchorPoint, faceSize, poseFromMatrix, STICKERS } from '../js/ar.js';
import { t, setLang, getLang } from '../js/i18n.js';

function faces() {
  const landmarks = Array.from({ length: 478 }, () => ({ x: 0.5, y: 0.5, z: 0 }));
  const set = (i, x, y) => { landmarks[i] = { x, y, z: 0 }; };
  set(33, 0.42, 0.45); set(263, 0.58, 0.45);
  set(10, 0.5, 0.2); set(13, 0.5, 0.7); set(50, 0.35, 0.6); set(280, 0.65, 0.6);
  set(234, 0.3, 0.5); set(454, 0.7, 0.5);
  return landmarks;
}

test('registry filtri: ID unici, nuovi filtri e impostazioni', () => {
  const ids = FILTERS.map((filter) => filter.id);
  assert.ok(ids.length >= 22);
  assert.equal(new Set(ids).size, ids.length);
  ['ar', 'pose', 'qr', 'face', 'hands', 'tracker', 'subtitles'].forEach((id) => assert.ok(ids.includes(id)));
  assert.equal(findFilter('bogus').id, 'normal');
  assert.equal(DEFAULT_SETTINGS.aiRuntime, 'mediapipe');
  assert.ok(Array.isArray(DEFAULT_SETTINGS.stickers));
});

test('comandi vocali IT/EN', () => {
  assert.equal(parseVoiceCommand('scatta la foto'), 'capture');
  assert.equal(parseVoiceCommand('take a shot'), 'capture');
  assert.equal(parseVoiceCommand('registra un video'), 'record');
  assert.equal(parseVoiceCommand('stop recording'), 'stop');
  assert.equal(parseVoiceCommand('mostra la griglia'), 'grid');
  assert.equal(parseVoiceCommand('frase qualunque'), null);
});

test('AR: anchor, dimensione volto e posa', () => {
  const landmarks = faces();
  const eyes = anchorPoint('eyes', landmarks, 400, 300);
  const forehead = anchorPoint('forehead', landmarks, 400, 300);
  assert.ok(eyes && forehead);
  assert.ok(Math.abs(eyes.x - 200) < 1);
  assert.ok(forehead.y < eyes.y);
  assert.ok(faceSize(landmarks, 400, 300) === 160);
  assert.ok(anchorPoint('eyes', null, 400, 300) === null);
  assert.ok(STICKERS.length >= 10 && STICKERS.every((item) => item.id && item.emoji && item.anchor));
  const pose = poseFromMatrix([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
  assert.ok(Math.abs(pose.yaw) < 1e-9 && Math.abs(pose.pitch) < 1e-9 && Math.abs(pose.roll) < 1e-9);
});

test('i18n: chiavi nuove in IT/EN', () => {
  setLang('it-IT');
  assert.equal(getLang(), 'it-IT');
  assert.ok(t('filter.ar') !== 'filter.ar');
  assert.ok(t('filter.pose') !== 'filter.pose');
  assert.ok(t('filter.qr') !== 'filter.qr');
  setLang('en-US');
  assert.ok(t('filter.ar').includes('AR'));
});
