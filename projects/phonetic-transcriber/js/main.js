/**
 * main.js — Phonetic Transcriber: orchestrazione UI, audio, ASR e G2P.
 */

import { createG2P, VOICES } from './g2p.js';
import { createASR } from './asr.js';
import { createRecorder, decodeAudio, trimSilence, drawWave, drawSpectrum } from './audio.js';
import { normalizeText, analyzeWord, toKey } from './phonetics.js';
import { guessLanguage, LANGUAGES } from './language.js';
import { loadHistory, addEntry, removeEntry, clearHistory, searchHistory, toJSON, fromJSON } from './history.js';
import { t, getLang, initLang, setLang, applyStatic, onLanguageChange } from './i18n.js';
import {
  toast, esc, renderResult, renderLanguageBars, renderCompare, renderStats,
  renderHistory, setStatus, setProgress
} from './ui.js';

const $ = (id) => document.getElementById(id);
const g2p = createG2P();
const recorder = createRecorder();
const asr = createASR({
  onStatus: (status) => {
    const chip = $('modelChip');
    chip.className = 'chip ' + (status === 'ready' ? 'ok' : status === 'error' ? 'err' : '');
    $('modelTxt').textContent = t('status.' + status);
  },
  onProgress: (percent) => setProgress($('progLive'), $('fillLive'), $('pctLive'), percent, percent < 100)
});

let history = loadHistory();
let modelId = 'tiny';
let voice = 'it';
let currentFile = null;
let pendingCompare = null;

function copyText(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => toast(t('msg.copied'))).catch(() => fallbackCopy(text));
  } else fallbackCopy(text);
}
function fallbackCopy(text) {
  const area = document.createElement('textarea');
  area.value = text; document.body.appendChild(area); area.select();
  try { document.execCommand('copy'); toast(t('msg.copied')); } catch (e) { toast('Copy unavailable'); }
  area.remove();
}

async function ensureG2P() {
  if (g2p.ready) return true;
  try { await g2p.init(); toast(t('msg.espeakReady')); return true; }
  catch (e) { toast(t('msg.espeakFallback')); return false; }
}

async function analyze(text, output, statusEl, source, whisperLang = null) {
  const ortho = normalizeText(text);
  if (!ortho) { setStatus(statusEl, '', t('hint.manual')); return null; }
  setStatus(statusEl, '', t('msg.decoding'));
  const result = await g2p.analyze(ortho, voice);
  const data = {
    ortho: result.ortho,
    ipa: result.ipa,
    key: result.key,
    engine: result.engine,
    voice,
    source,
    whisperLang: whisperLang || (source === 'manuale' ? 'manuale' : 'auto'),
    spans: result.spans,
    guesses: guessLanguage([result.key], { whisperLang }),
    analysis: analyzeWord(result)
  };
  renderResult(output, data, t, { onCopy: copyResult, onGuess: openGuess, onExport: exportResultPNG });
  setStatus(statusEl, 'ok', t('msg.done'));
  history = addEntry(data);
  refreshHistory();
  return data;
}

function copyResult(data) {
  copyText(`${t('label.heard')}: ${data.ortho}\n${t('label.key')}: ${data.key}\n${t('label.ipa')}: ${data.ipa}`);
}
function openGuess(data) {
  $('guessInput').value = data.key;
  showTab('guess');
  $('guessBtn').click();
}

function exportResultPNG(data) {
  const canvas = document.createElement('canvas');
  canvas.width = 1000; canvas.height = 620;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createLinearGradient(0, 0, 1000, 620);
  gradient.addColorStop(0, '#070b16'); gradient.addColorStop(1, '#15183a');
  ctx.fillStyle = gradient; ctx.fillRect(0, 0, 1000, 620);
  ctx.strokeStyle = '#4de8ff'; ctx.lineWidth = 3; ctx.strokeRect(18, 18, 964, 584);
  ctx.fillStyle = '#a98bff'; ctx.font = '700 24px system-ui';
  ctx.fillText('PHONETIC TRANSCRIBER', 44, 66);
  ctx.fillStyle = '#eaf4ff'; ctx.font = '700 54px Georgia, serif';
  ctx.fillText(data.ortho.slice(0, 28), 44, 150);
  ctx.font = '30px ui-monospace, monospace'; ctx.fillStyle = '#5ef0a8';
  ctx.fillText(data.ipa.slice(0, 38), 44, 205);
  ctx.fillStyle = '#ffd166'; ctx.font = '30px ui-monospace, monospace';
  ctx.fillText(data.key.slice(0, 38), 44, 255);
  ctx.fillStyle = '#8ba4c8'; ctx.font = '20px system-ui';
  ctx.fillText(`${data.engine} · ${voice} · ${new Date().toLocaleString()}`, 44, 310);
  ctx.fillText(`${data.guesses.slice(0, 3).map((g) => `${(LANGUAGES[g.lang] && LANGUAGES[g.lang].name) || g.lang} ${g.pct}%`).join('  ·  ')}`, 44, 350);
  const link = document.createElement('a');
  link.href = canvas.toDataURL('image/png');
  link.download = 'phonetic-' + Date.now() + '.png';
  document.body.appendChild(link);
  link.click();
  setTimeout(() => link.remove(), 500);
}

function showTab(name) {
  document.querySelectorAll('.tab').forEach((tab) => tab.classList.toggle('on', tab.dataset.tab === name));
  document.querySelectorAll('.pane').forEach((pane) => pane.classList.toggle('on', pane.id === 'pane-' + name));
}

function refreshHistory() {
  const list = searchHistory(history, $('histSearch').value);
  renderStats($('histStats'), history);
  $('histEmpty').classList.toggle('hidden', list.length > 0);
  renderHistory($('histList'), list, t, {
    onCopy: (item) => copyText(`${item.ortho} — ${item.ipa} — ${item.key}`),
    onDelete: (index) => {
      const item = list[index];
      const realIndex = history.indexOf(item);
      if (realIndex >= 0) history = removeEntry(realIndex);
      refreshHistory();
      toast('Voce eliminata');
    }
  });
}

async function prepareSamples(blob, waveCanvas, spectrumCanvas, statusEl) {
  setStatus(statusEl, '', t('msg.decoding'));
  const decoded = await decodeAudio(blob);
  const trimmed = trimSilence(decoded.samples, decoded.rate);
  drawWave(waveCanvas, trimmed.samples);
  drawSpectrum(spectrumCanvas, trimmed.samples);
  if (trimmed.trimmedMs > 0) setStatus(statusEl, '', t('msg.vad', { ms: trimmed.trimmedMs }));
  return trimmed.samples;
}

async function transcribe(samples, output, statusEl, source) {
  setStatus(statusEl, '', t('msg.transcribing'));
  try {
    const result = await asr.transcribe(samples, { modelId, language: null });
    return await analyze(result.text, output, statusEl, source, result.language);
  } catch (error) {
    setStatus(statusEl, '', t('msg.needVoice'));
    output.innerHTML = `<p class="muted">${esc(t('msg.needVoice'))}</p>`;
    return null;
  }
}

function bindEvents() {
  document.querySelectorAll('.tab').forEach((tab) => tab.addEventListener('click', () => showTab(tab.dataset.tab)));
  $('modelSelect').addEventListener('change', async (event) => {
    modelId = event.target.value;
    try { await asr.load(modelId); toast(t('status.ready')); }
    catch (e) { toast(t('status.error')); }
  });
  $('voiceSelect').addEventListener('change', (event) => { voice = event.target.value; });
  $('langToggle').addEventListener('click', () => setLang(getLang() === 'it' ? 'en' : 'it'));

  $('manualBtn').addEventListener('click', () => analyze($('manualInput').value, $('manualOut'), $('manualStatus'), 'manuale'));
  $('manualClear').addEventListener('click', () => {
    $('manualInput').value = '';
    $('manualOut').innerHTML = `<p class="muted">${esc(t('hint.manual'))}</p>`;
  });
  $('guessBtn').addEventListener('click', () => {
    const raw = $('guessInput').value || history.map((item) => item.key).join('\n');
    const keys = raw.split('\n').map((line) => toKey(normalizeText(line))).filter(Boolean);
    renderLanguageBars($('guessOut'), guessLanguage(keys), t);
  });
  $('compareBtn').addEventListener('click', () => {
    const lines = $('compareInput').value.split('\n').map((line) => toKey(normalizeText(line))).filter(Boolean);
    if (lines.length < 2) { renderCompare($('compareOut'), '', '', t); return; }
    pendingCompare = lines;
    renderCompare($('compareOut'), lines[0], lines[1], t);
  });

  $('liveBtn').addEventListener('click', async () => {
    if (recorder.active) {
      const blob = await recorder.stop();
      $('liveBtn').textContent = t('action.start');
      if (!blob) { setStatus($('liveStatus'), '', t('hint.live')); return; }
      try {
        const samples = await prepareSamples(blob, $('liveWave'), $('liveSpectrum'), 'liveStatus');
        await transcribe(samples, $('liveOut'), $('liveStatus'), 'live');
      } catch (error) { setStatus($('liveStatus'), '', error.message); }
      return;
    }
    try {
      await recorder.start();
      $('liveBtn').textContent = t('action.stop');
      setStatus($('liveStatus'), 'on', t('hint.live'));
    } catch (error) { setStatus($('liveStatus'), '', error.message); }
  });

  const drop = $('dropzone'), input = $('fileInput');
  drop.addEventListener('click', () => input.click());
  input.addEventListener('change', () => input.files[0] && loadFile(input.files[0]));
  ['dragenter', 'dragover'].forEach((event) => drop.addEventListener(event, (e) => { e.preventDefault(); drop.classList.add('over'); }));
  ['dragleave', 'drop'].forEach((event) => drop.addEventListener(event, (e) => { e.preventDefault(); drop.classList.remove('over'); }));
  drop.addEventListener('drop', (event) => {
    const file = event.dataTransfer?.files?.[0] || event.dataTransfer?.items?.[0]?.getAsFile?.();
    if (file) loadFile(file);
  });
  $('trBtn').addEventListener('click', async () => {
    if (!currentFile) return;
    $('trBtn').disabled = true;
    try {
      const samples = await prepareSamples(currentFile, $('fileWave'), $('fileSpectrum'), 'fileStatus');
      await transcribe(samples, $('fileOut'), $('fileStatus'), 'file');
    } catch (error) { setStatus($('fileStatus'), '', error.message); }
    $('trBtn').disabled = false;
  });

  $('histSearch').addEventListener('input', refreshHistory);
  $('copyAll').addEventListener('click', () => {
    if (!history.length) return toast(t('hint.historyEmpty'));
    copyText(history.map((item) => `${item.ortho} | ${item.ipa} | ${item.key}`).join('\n'));
  });
  $('clearAll').addEventListener('click', () => { history = clearHistory(); refreshHistory(); toast(t('action.empty')); });
  $('expJSON').addEventListener('click', () => {
    const blob = new Blob([toJSON(history)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = 'phonetic-history.json'; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 500);
  });
  $('impJSON').addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = '.json,application/json';
    input.onchange = () => {
      const file = input.files[0];
      if (!file) return;
      file.text().then((text) => {
        try { history = fromJSON(text); refreshHistory(); toast(t('action.import')); }
        catch (e) { toast(e.message); }
      });
    };
    input.click();
  });

  document.addEventListener('keydown', (event) => {
    if (/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) return;
    const tabs = ['live', 'file', 'manual', 'guess'];
    const index = Number(event.key) - 1;
    if (index >= 0 && index < tabs.length) showTab(tabs[index]);
  });
  onLanguageChange(refreshTexts);
}

async function loadFile(file) {
  if (!file || !/^audio\//.test(file.type)) { toast(t('hint.file')); return; }
  currentFile = file;
  $('dropzone').innerHTML = `🎵 <b>${esc(file.name)}</b><br><small>${(file.size / 1048576).toFixed(2)} MB</small>`;
  $('trBtn').disabled = false;
  setStatus($('fileStatus'), '', t('hint.file'));
  try {
    const samples = await prepareSamples(file, $('fileWave'), $('fileSpectrum'), 'fileStatus');
    drawWave($('fileWave'), samples);
  } catch (error) { setStatus($('fileStatus'), '', error.message); }
}

function refreshTexts() {
  applyStatic(document);
  $('modelTxt').textContent = t(asr.ready ? 'status.ready' : 'status.idle');
  $('liveBtn').textContent = recorder.active ? t('action.stop') : t('action.start');
  $('trBtn').textContent = t('action.transcribe');
  $('manualBtn').textContent = t('action.analyze');
  $('manualClear').textContent = t('action.clear');
  $('guessBtn').textContent = t('action.guess');
  $('compareBtn').textContent = t('action.compare');
  $('copyAll').textContent = t('action.copyAll');
  $('expJSON').textContent = t('action.exportJSON');
  $('impJSON').textContent = t('action.import');
  $('clearAll').textContent = t('action.empty');
  $('langToggle').textContent = getLang() === 'it' ? '🇮🇹 IT' : '🇬🇧 EN';
  refreshHistory();
}

function init() {
  initLang();
  applyStatic(document);
  ['modelSelect', 'voiceSelect'].forEach((id) => {
    const select = $(id);
    select.innerHTML = id === 'modelSelect'
      ? asr.MODELS.map((model) => `<option value="${model.id}">${esc(model.label)} · ${model.size}</option>`).join('')
      : VOICES.map((code) => `<option value="${code}">${esc((LANGUAGES[code] && LANGUAGES[code].name) || code)}</option>`).join('');
    select.value = id === 'modelSelect' ? modelId : voice;
  });
  if (LANGUAGES[voice]) $('voiceSelect').value = voice;
  bindEvents();
  refreshHistory();
  refreshTexts();
  ensureG2P();
  window.__pt = {
    g2p, asr, analyze, guessLanguage, normalizeText, toKey,
    history: () => history,
    setLang, getLang
  };
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
