/* Morse Studio — bootstrap and wiring */
import { MORSE } from './config.js';
import { detect, initLang, setLang, getLang, t } from './i18n.js';
import { profile, save, setSettings, pushHistory, toggleFavorite, isFavorite, setRecord } from './storage.js';
import { encode, decode, autoDecode, validateMorse, stats, durationSeconds, normalizeSymbols } from './codec.js';
import { buildWav } from './wav.js';
import { Transmitter } from './audio.js';
import { Visualizer } from './visualize.js';
import { randomSymbol, dictationSequence, checkGuess, normalizeGuess } from './train.js';
import { ui } from './ui.js';

const $ = id => document.getElementById(id);
const input = $('inputText'), output = $('outputText');
const tx = new Transmitter();
const viz = new Visualizer($('scope'));
let converting = false, debounceTimer = null, time = 0;
let flash = null, dict = null, speed = null;

function opts() {
  const s = profile.settings;
  return { wpm: s.wpm, freq: s.freq, volume: s.volume };
}
function counts() { ui.counts(input.value.length, output.value.length); }
function schedule(fn, ms = 180) { clearTimeout(debounceTimer); debounceTimer = setTimeout(fn, ms); }

function toMorse(auto = false) {
  if (converting) return;
  const res = encode(input.value);
  if (!auto) ui.status(t('toMorse'));
  converting = true;
  output.value = res.morse;
  converting = false;
  ui.unknownNote(res.unknown);
  counts();
  if (!auto) pushHistory(input.value, output.value), ui.renderHistory();
  return res;
}
function toText(auto = false) {
  if (converting) return;
  const mode = profile.settings.strict ? { strict: true } : {};
  const res = autoDecode(output.value, mode);
  if (!auto) ui.status(t('toText'));
  converting = true;
  input.value = res.text;
  converting = false;
  ui.unknownNote([]);
  counts();
  if (!auto) pushHistory(input.value, output.value), ui.renderHistory();
  return res;
}
function autoConvert() { schedule(() => { if (output.value) toText(true); else toMorse(true); }); }
function swap() {
  const a = input.value; input.value = output.value; output.value = a;
  pushHistory(input.value, output.value); ui.renderHistory(); counts(); ui.status(t('swap'));
}
function clear() { input.value = ''; output.value = ''; counts(); ui.unknownNote([]); ui.status(t('clear')); }
async function copy(text) {
  try { await navigator.clipboard.writeText(text); ui.toast(t('copied')); }
  catch (e) {
    const ta = document.createElement('textarea'); ta.value = text;
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); ui.toast(t('copied')); } catch (er) { ui.toast(t('cancel')); }
    ta.remove();
  }
}
async function file(f) {
  if (!f) return;
  const text = await f.text();
  input.value = text; counts(); toMorse(); ui.toast(f.name);
}
function favorite() {
  const added = toggleFavorite({ input: input.value, output: output.value });
  ui.toast(added ? t('favorites') : t('clear'));
}
function download(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
function exportTxt() { download(new Blob([output.value], { type: 'text/plain' }), 'morse.txt'); }
function exportWav() {
  if (!output.value.trim()) { ui.toast(t('empty')); return; }
  download(new Blob([buildWav(output.value, opts())], { type: 'audio/wav' }), 'morse.wav');
}
async function share() {
  try {
    if (navigator.share) await navigator.share({ title: 'Morse Studio', text: output.value || input.value });
    else await copy(output.value);
  } catch (e) { if (e.name !== 'AbortError') ui.toast(t('shareFail')); }
}

function play() {
  if (!output.value.trim()) { ui.toast(t('empty')); return; }
  if (tx.isPlaying) tx.resume();
  else tx.play(output.value, opts());
  ui.status(t('playing'));
}
function pause() { tx.pause(); ui.status(t('pause')); }
function stop() { tx.stop(); ui.status(t('ready')); }
function refPlay(ch) {
  tx.stop();
  tx.play(MORSE[ch], opts());
  ui.status(ch + ' · ' + MORSE[ch]);
}
tx.onProgress = (p, elapsed, total) => {
  ui.status(p >= 1 ? t('ready') : t('playing'));
  $('durationLabel').textContent = `${Math.round(elapsed)}s / ${Math.round(total)}s`;
};
tx.onEnd = () => { ui.status(t('ready')); $('durationLabel').textContent = '0s / 0s'; };

function setting(patch) { setSettings(patch); }

// training
function trainData() {
  if (ui.trainTab === 'flashcards') return flash || {};
  if (ui.trainTab === 'dictation') return dict || {};
  return speed || {};
}
function nextFlash() {
  flash = { ...(flash || { score: 0, streak: 0 }), ...randomSymbol() };
  ui.renderTrain(flash);
}
function checkFlash(guess) {
  if (!flash) return nextFlash();
  const ok = checkGuess(flash.char, guess);
  flash.score = (flash.score || 0) + (ok ? 1 : 0);
  flash.streak = ok ? (flash.streak || 0) + 1 : 0;
  flash.feedback = ok ? t('correct') : `${t('wrong')} — ${flash.char}`;
  flash.feedbackClass = ok ? 'ok' : 'no';
  setRecord('flashcards', flash.streak || 0);
  ui.renderTrain(flash);
  setTimeout(nextFlash, 650);
}
function newDict() {
  dict = { ...(dict || { score: 0 }), ...dictationSequence(Math.random, 5) };
  ui.renderTrain(dict);
}
function playDictation() {
  if (!dict) return newDict();
  tx.stop(); tx.play(dict.morse, opts());
}
function checkDict(guess) {
  if (!dict) return;
  const ok = normalizeGuess(guess) === dict.chars;
  dict.score = (dict.score || 0) + (ok ? 1 : 0);
  dict.feedback = ok ? t('correct') : `${t('wrong')} — ${dict.chars}`;
  dict.feedbackClass = ok ? 'ok' : 'no';
  setRecord('dictation', dict.score || 0);
  ui.renderTrain(dict);
  setTimeout(newDict, 800);
}
function startSpeed() {
  if (speed?.timer) clearInterval(speed.timer);
  speed = { seconds: 60, score: 0, prompt: '', target: '', timer: null };
  nextSpeedTarget();
  speed.timer = setInterval(() => {
    speed.seconds--;
    const el = $('speedTime'); if (el) el.textContent = speed.seconds + 's';
    if (speed.seconds <= 0) {
      clearInterval(speed.timer); speed.timer = null;
      setRecord('speed', speed.score * 10);
      speed.prompt = `${t('timeLeft')}: 0 · ${t('score')}: ${speed.score}`;
      ui.renderTrain(speed);
    }
  }, 1000);
  ui.renderTrain(speed);
}
function nextSpeedTarget() {
  const symbol = randomSymbol();
  speed.target = symbol.char;
  speed.prompt = symbol.code;
  const el = $('speedScore'); if (el) el.textContent = speed.score;
}
function onSpeedGuess(value) {
  if (!speed || !speed.timer) return;
  if (normalizeGuess(value) === speed.target) {
    speed.score++;
    nextSpeedTarget();
    const el = $('speedScore'); if (el) el.textContent = speed.score;
  }
  const field = $('speedGuess'); if (field) field.value = '';
}

initLang(detect());
input.value = profile.lastInput || '';
output.value = profile.lastOutput || '';
ui.initUI({
  toMorse, toText, swap, clear, copy, file, favorite, exportTxt, exportWav, share,
  play, pause, stop, setting, refPlay, trainData,
  checkFlash, playDictation, checkDict, startSpeed,
  restore: i => {
    const h = profile.history[i]; if (!h) return;
    input.value = h.input; output.value = h.output; counts(); ui.status(t('history'));
  },
  autoDecode: () => { if (output.value) toText(true); }
});
input.addEventListener('input', () => { schedule(() => toMorse(true)); saveLast(); });
output.addEventListener('input', () => { if (!converting) schedule(autoConvert); saveLast(); });
function saveLast() { profile.lastInput = input.value; profile.lastOutput = output.value; save(); }

$('trainBody').addEventListener('input', e => { if (e.target.id === 'speedGuess') onSpeedGuess(e.target.value); });
document.addEventListener('visibilitychange', () => { if (document.hidden) tx.pause(); });
window.addEventListener('resize', () => viz.resize());

function frame(now) {
  requestAnimationFrame(frame);
  time += 0.016;
  const seq = output.value || '';
  const d = validateMorse(seq);
  viz.draw({
    morse: d.valid ? seq : '', time, playing: tx.isPlaying,
    progress: tx.isPlaying ? Math.min(1, (tx.total ? (tx.pausedAt || (performance.now() - (tx.startAt || performance.now()))) / 1000 / tx.total : 0)) : 0,
    freq: profile.settings.freq, label: t('signal'), tokenIndex: -1
  });
}
requestAnimationFrame(frame);
if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(() => {});
