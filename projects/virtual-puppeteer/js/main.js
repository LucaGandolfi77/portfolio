/**
 * main.js — Virtual Puppeteer: tracking, scene graph, gesti e UI.
 */

import { CHARACTERS, SCENES, PARTICLES, PROPS, DEFAULT_SETTINGS, STORAGE_KEY, findCharacter, findScene, findParticles } from './config.js';
import { createRig, updateRig, handMetrics, tapRig } from './rig.js';
import { createTracker } from './tracking.js';
import { drawStage, drawSpotlightFloor } from './scene.js';
import { drawPuppet, drawParticles, spawnBurst, updateParticles } from './render.js';
import { createAudio } from './audio.js';
import { createSpeech, isSupported as speechSupported } from './speech.js';
import { createRecorder } from './recorder.js';
import { toast, setStatus, setProgress, logLine, showOverlay, renderAll } from './ui.js';

const $ = (id) => document.getElementById(id);
const canvas = $('canvas');
const ctx = canvas.getContext('2d');
const video = $('video');

function loadSettings() {
  try { return { ...DEFAULT_SETTINGS, ...(JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') || {}) }; }
  catch (e) { return { ...DEFAULT_SETTINGS }; }
}
const settings = loadSettings();
function persist() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(settings)); } catch (e) {} }

let tracker = null, stream = null, running = false, tapMode = false, paused = false;
let rigs = [createRig(), createRig()];
const touchRig = createRig();
let particles = [];
let audio = createAudio({ enabled: settings.sfx });
let speech = createSpeech();
let recorder = createRecorder();
let lastGestures = ['', ''];
let lastTalk = [0, 0];
let lastBlip = 0;
let width = 0, height = 0, dpr = 1;
let tapTarget = null, tapAt = 0;

speech.setEnabled(!!settings.speech);

function resize() {
  dpr = Math.min(2, Math.max(1, Number(settings.dpr) || 2));
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  canvas.style.width = width + 'px';
  canvas.style.height = height + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener('resize', resize);
resize();

function characterFor(index) {
  const base = CHARACTERS.findIndex((item) => item.id === settings.character);
  const step = settings.director || index > 0 ? index : 0;
  return findCharacter(CHARACTERS[(base + step) % CHARACTERS.length].id);
}

function propsFor(index) {
  const list = (settings.props || []).map((id) => PROPS.find((item) => item.id === id)).filter(Boolean);
  if (settings.director) return list.filter((_, propIndex) => propIndex % 2 === index % 2);
  return index === 0 ? list : list.slice(0, 1);
}

function onGesture(index, gesture, now) {
  const char = characterFor(index);
  const rig = rigs[index] || touchRig;
  if (gesture === lastGestures[index]) return;
  lastGestures[index] = gesture;
  if (gesture === 'peace') {
    const current = CHARACTERS.findIndex((item) => item.id === settings.character);
    settings.character = CHARACTERS[(current + 1) % CHARACTERS.length].id;
    persist();
    renderAll(settings, handlers);
    toast('Cast: ' + findCharacter(settings.character).name);
    audio.pop();
  } else if (gesture === 'wave') {
    spawnBurst(particles, char, rig, findParticles(settings.particles), 18);
    audio.boing();
  } else if (gesture === 'fist') {
    paused = !paused;
    toast(paused ? 'Paused' : 'Performing');
  } else if (gesture === 'pinch' && now - lastTalk[index] > 1600) {
    lastTalk[index] = now;
    spawnBurst(particles, char, rig, findParticles(settings.particles), 6);
    if (settings.speech) speech.speak(speech.pickLine(), char);
    else audio.blip(char);
  }
}

function processHands(result, now) {
  const faces = (result && result.faceLandmarks) || [];
  void faces;
  const hands = (result && result.landmarks) || [];
  if (!hands.length) {
    rigs.forEach((rig) => { rig.hasTarget = false; });
    lastGestures = ['', ''];
    return;
  }
  const count = settings.director ? Math.min(4, hands.length) : Math.min(2, hands.length);
  for (let index = 0; index < count; index += 1) {
    const metrics = handMetrics(hands[index], width, height);
    if (!metrics) continue;
    const rig = rigs[index] || createRig();
    rigs[index] = rig;
    updateRig(rig, metrics, 1 / 60);
    onGesture(index, metrics.gesture, now);
    if (metrics.gesture === 'pinch' && now - lastBlip > 260) {
      lastBlip = now;
      audio.blip(characterFor(index));
    }
  }
  for (let index = count; index < rigs.length; index += 1) rigs[index].hasTarget = false;
}

function frame(now) {
  if (!running) return;
  requestAnimationFrame(frame);
  const scene = findScene(settings.scene);
  const lead = rigs[0] || touchRig;
  drawStage(ctx, scene, width, height, now, { x: lead.x - width / 2, y: lead.y - height / 2 });

  if (!tapMode && tracker && tracker.ready && video.readyState >= 2 && !paused) {
    processHands(tracker.detect(video), now);
  }
  if (tapMode && tapTarget) {
    updateRig(touchRig, tapRig(tapTarget.x, tapTarget.y, now, 90), 1 / 60);
    if (now - tapAt > 1200) { spawnBurst(particles, characterFor(0), touchRig, findParticles(settings.particles), 3); tapAt = now; }
  }

  const activeRigs = tapMode ? [touchRig] : rigs;
  const visible = settings.director ? Math.max(2, activeRigs.length) : Math.min(activeRigs.length, 2);
  for (let index = 0; index < visible; index += 1) {
    const rig = activeRigs[index];
    if (!rig || !rig.hasTarget) continue;
    drawSpotlightFloor(ctx, rig, width, height);
    drawPuppet(ctx, characterFor(index), rig, { props: propsFor(index) });
  }
  updateParticles(particles, findParticles(settings.particles));
  drawParticles(ctx, particles);
}

async function prepareTracker() {
  if (!tracker) tracker = createTracker({ onStatus: (kind) => {
    setStatus('loading', kind === 'wasm' ? 'Loading WASM…' : kind === 'cpu' ? 'CPU fallback…' : 'Tracker ready');
    setProgress(kind === 'wasm' ? 0.35 : kind === 'ready' ? 1 : 0.6);
    logLine('[tracker] ' + kind);
  } });
  try {
    await tracker.prepare();
    setStatus('live', 'Hands: live');
    $('load-note').textContent = 'Hand tracking ready — pinch to talk!';
    return true;
  } catch (error) {
    logLine('[tracker] failed: ' + error.message);
    setStatus('error', 'Hands failed — tap mode');
    $('load-note').textContent = 'Tracker unavailable — tap the stage to perform.';
    return false;
  }
}

async function startCamera() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false });
    video.srcObject = stream;
    await video.play();
    tapMode = false;
    await prepareTracker();
  } catch (error) {
    $('cam-msg').textContent = error && error.message ? error.message : 'Camera permission denied';
    showOverlay('cam-overlay', true);
    return;
  }
  begin();
}

function begin() {
  if (running) return;
  running = true;
  showOverlay('loader-overlay', false);
  showOverlay('start-overlay', false);
  showOverlay('cam-overlay', false);
  requestAnimationFrame(frame);
  toast('Pinch your thumb and index to talk!');
}

function startTapMode() {
  tapMode = true;
  touchRig.hasTarget = true;
  touchRig.x = width / 2;
  touchRig.y = height / 2;
  setStatus('off', 'Tap mode');
  begin();
}

const handlers = {
  onCharacter: (id) => {
    settings.character = id;
    persist();
    renderAll(settings, handlers);
    toast(findCharacter(id).name);
    audio.pop();
  },
  onScene: (id) => { settings.scene = id; persist(); renderAll(settings, handlers); toast(findScene(id).name); },
  onParticles: (id) => { settings.particles = id; persist(); renderAll(settings, handlers); toast(findParticles(id).name); },
  onProp: (id) => {
    settings.props = settings.props || [];
    if (settings.props.includes(id)) settings.props = settings.props.filter((item) => item !== id);
    else settings.props.push(id);
    persist();
    renderAll(settings, handlers);
  }
};

function bindUI() {
  renderAll(settings, handlers);
  $('startBtn').addEventListener('click', startCamera);
  $('skipCam').addEventListener('click', startTapMode);
  $('cam-retry').addEventListener('click', startCamera);
  $('cam-tapmode').addEventListener('click', startTapMode);
  $('photoBtn').addEventListener('click', () => { recorder.exportPNG(canvas); audio.shutter(); toast('PNG saved'); });
  $('recordBtn').addEventListener('click', () => {
    if (recorder.recording) { recorder.stop(); $('recordBtn').classList.remove('on'); toast('Recording stopped'); }
    else if (recorder.start(canvas)) { $('recordBtn').classList.add('on'); toast('Recording…'); }
    else toast('Recording unsupported');
  });
  $('sfxBtn').addEventListener('click', () => {
    settings.sfx = !settings.sfx;
    audio.setEnabled(settings.sfx);
    persist();
    renderAll(settings, handlers);
  });
  $('speechBtn').addEventListener('click', () => {
    if (!speechSupported()) { toast('Speech synthesis unsupported'); return; }
    settings.speech = !settings.speech;
    speech.setEnabled(settings.speech);
    persist();
    renderAll(settings, handlers);
    toast(settings.speech ? 'Puppets can speak' : 'Puppet speech off');
  });
  $('directorBtn').addEventListener('click', () => {
    settings.director = !settings.director;
    persist();
    renderAll(settings, handlers);
    toast(settings.director ? 'Director mode: 4 puppets' : 'Director mode off');
  });
  canvas.addEventListener('pointerdown', (event) => {
    const rect = canvas.getBoundingClientRect();
    tapTarget = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    tapAt = performance.now();
    touchRig.hasTarget = true;
    audio.pop();
    if (tapMode) spawnBurst(particles, characterFor(0), touchRig, findParticles(settings.particles), 4);
  });
  window.addEventListener('beforeunload', () => { if (stream) stream.getTracks().forEach((track) => track.stop()); if (tracker) tracker.close(); });
}

function init() {
  bindUI();
  setProgress(0.08);
  logLine('[boot] MediaPipe Tasks Vision ready to load');
  setTimeout(() => {
    if (running || stream) return;
    showOverlay('loader-overlay', false);
    showOverlay('start-overlay', true);
    setStatus('off', 'Ready — tap mode');
  }, 900);
}

window.__PUPPET__ = { get settings() { return settings; }, get rigs() { return rigs; }, startCamera, startTapMode, onGesture, frame };
init();
