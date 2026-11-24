/* Walkie Talkie — bootstrap and orchestration */

import { detect, initLang, setLang, getLang, t } from './i18n.js';
import { profile, setSettings, addRecent, pushMessage, clearMessages } from './storage.js';
import { QUICK_MSGS } from './config.js';
import { AudioEngine } from './audio.js';
import { WalkieNetwork } from './network.js';
import { ui } from './ui.js';
import * as glass from './glass.js';

const $ = id => document.getElementById(id);
const audio = new AudioEngine(profile.settings);
let net = null;
let selfId = null;
let talking = false;
let lockArmed = false;
let remoteVoices = new Map();

/* --- VU meter frame --- */
const vu = $('vu-bars');
for (let i = 0; i < 12; i++) vu.appendChild(document.createElement('i'));
function frame() {
  requestAnimationFrame(frame);
  ui.setVU(audio.level());
}

/* --- helpers --- */
function connected() { return !!net?.peer && !!net.selfId; }
function refreshPeers() {
  const talkingIds = new Set([...net?.records.keys() || []].filter(id => remoteVoices.get(id)?.talking));
  const entries = [{ id:'self', talking }];
  net?.records.forEach((rec, id) => entries.push({ id, talking: talkingIds.has(id) }));
  ui.renderPeers(entries);
  ui.setClients(entries.length - 1);
}
function status(key) {
  ui.setScreen(key);
  $('ptt-btn').disabled = !(key === 'connected' || key === 'listening' || key === 'transmitting' || key === 'receiving');
  if (key === 'offline') { talking = false; lockArmed = false; ui.setPTT(false, false, false); refreshPeers(); }
}
function remoteEl(id) {
  let el = remoteVoices.get(id)?.el;
  if (!el) {
    el = document.createElement('audio');
    el.id = 'remote-' + id;
    el.autoplay = true;
    el.volume = profile.settings.volume;
    el.muted = !!profile.settings.muted;
    $('remote-audio-container').appendChild(el);
    remoteVoices.set(id, { el, talking: false });
  }
  return el;
}

/* --- network handlers --- */
const handlers = {
  onSelf(id) { selfId = id; },
  onStatus(key) {
    status(key);
    if (key === 'connected') ui.toast(t('connected'));
  },
  onPeers() { refreshPeers(); },
  onTalking(id, active) {
    const rec = remoteVoices.get(id) || { el: remoteEl(id), talking: false };
    rec.talking = active;
    remoteVoices.set(id, rec);
    ui.setScreen(active ? 'receiving' : 'connected', active ? String(id).slice(0, 6) : '');
    refreshPeers();
    if (active && profile.settings.squelch) audio.beep(660, 0.05, 0.035);
  },
  onStream(id, stream) {
    const el = remoteEl(id);
    el.srcObject = stream;
    el.play?.().catch(() => {});
    ui.closeModal('connectModal');
    refreshPeers();
  },
  onLeave(id) {
    const rec = remoteVoices.get(id);
    if (rec?.el) rec.el.remove();
    remoteVoices.delete(id);
    refreshPeers();
  },
  onChat(id, text) {
    pushMessage(id, text);
    ui.renderChat(profile.messages);
  },
  onError(err) {
    const msg = typeof err === 'string' && err.length < 40 ? err : (err?.message || String(err));
    ui.toast(STR_SAFE(msg), true);
  }
};
function STR_SAFE(msg) {
  const known = ['noPeer','micDenied','error'];
  return known.includes(msg) ? t(msg) : msg;
}

/* --- actions --- */
async function acquire() {
  if (audio.stream) return audio.stream;
  try {
    const stream = await audio.init();
    const devices = await audio.listDevices();
    ui.renderDevices(devices, profile.settings.deviceId);
    return stream;
  } catch (e) {
    ui.toast(t('micDenied'), true);
    return null;
  }
}

async function create() {
  const stream = await acquire();
  if (!stream) return;
  net?.close();
  net = new WalkieNetwork(handlers, profile.settings);
  const id = await net.startHost(stream);
  addRecent(id);
  ui.setChannel(id, true);
  ui.menu('host');
  status('listening');
  ui.renderRecent();
  ui.toast(`${t('createTitle')}: ${id}`);
}

async function join(raw) {
  const id = String(raw || '').toUpperCase().trim();
  if (!id) { ui.toast(t('enterId'), true); return; }
  const stream = await acquire();
  if (!stream) return;
  net?.close();
  net = new WalkieNetwork(handlers, profile.settings);
  await net.join(id, stream);
  addRecent(id);
  ui.setChannel(id, false);
  ui.closeModal('connectModal');
  status('connecting');
  ui.renderRecent();
}

function startTalk() {
  if (!connected() || talking) return;
  audio.stream?.getAudioTracks().forEach(track => { track.enabled = true; });
  talking = true;
  ui.setPTT(true, !!profile.settings.pttLock, true);
  status('transmitting');
  net.sendTalking(true);
  refreshPeers();
}
function stopTalk() {
  if (!talking) return;
  audio.stream?.getAudioTracks().forEach(track => { track.enabled = false; });
  talking = false;
  lockArmed = false;
  ui.setPTT(false, !!profile.settings.pttLock, connected());
  status('connected');
  net?.sendTalking(false);
  refreshPeers();
  if (profile.settings.squelch) audio.playNoise();
}
function pttDown() {
  if (profile.settings.pttLock && lockArmed) { stopTalk(); return; }
  startTalk();
  if (profile.settings.pttLock && talking) lockArmed = true;
}
function pttUp() {
  if (profile.settings.pttLock && lockArmed) return;
  stopTalk();
}

function toggleMute() {
  setSettings({ muted: !profile.settings.muted });
  audio.muteRemote($('remote-audio-container'), profile.settings.muted);
  ui.setPTT(talking, !!profile.settings.pttLock, connected());
  ui.toast(profile.settings.muted ? t('muted') : t('connected'));
}
function toggleLock() {
  setSettings({ pttLock: !profile.settings.pttLock });
  if (!profile.settings.pttLock && lockArmed) { lockArmed = false; stopTalk(); }
  ui.fillSettings(profile.settings);
  ui.setPTT(talking, !!profile.settings.pttLock, connected());
}

async function copy(text, key) {
  try {
    await navigator.clipboard.writeText(text);
  } catch (e) {
    const ta = document.createElement('textarea');
    ta.value = text; document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); } catch (_) {}
    ta.remove();
  }
  ui.toast(t(key));
}
const channel = () => net?.channel || '';
const copyId = () => channel() ? copy(channel(), 'copied') : ui.toast(t('enterId'), true);
const copyLink = () => channel() ? copy(location.href.split('#')[0] + '#channel=' + channel(), 'linkCopied') : ui.toast(t('enterId'), true);

function disconnect() {
  net?.close(); net = null;
  audio.dispose();
  remoteVoices.forEach(v => v.el.remove());
  remoteVoices = new Map();
  selfId = null; talking = false; lockArmed = false;
  ui.setChannel('', false);
  status('offline');
  ui.menu('main');
  ui.closeModal('settingsModal');
  refreshPeers();
  ui.toast(t('offline'));
}

function sendChat(text) {
  const clean = net?.sendChat(text);
  if (!clean) return;
  pushMessage(selfId || 'self', clean);
  ui.renderChat(profile.messages);
}

async function applySettings(patch) {
  const oldDevice = profile.settings.deviceId;
  setSettings(patch);
  if (patch.volume != null) audio.applyVolume($('remote-audio-container'), patch.volume);
  if (patch.deviceId != null && patch.deviceId !== oldDevice && audio.stream) {
    try {
      await audio.switchDevice(patch.deviceId);
      const track = audio.stream.getAudioTracks()[0];
      net?.records.forEach(rec => {
        const senders = rec.call?.peerConnection?.getSenders?.() || [];
        senders.forEach(s => { if (s.track?.kind === 'audio') s.replaceTrack?.(track); });
      });
      ui.toast(t('device'));
    } catch (e) { ui.toast(t('micDenied'), true); }
  }
}

function renderAll() {
  ui.fillSettings(profile.settings);
  ui.renderChat(profile.messages);
  ui.renderQuick();
  ui.renderRecent();
  refreshPeers();
  ui.setPTT(talking, !!profile.settings.pttLock, connected());
}

initLang(detect());
document.body.dataset.theme = profile.settings.theme || 'dark';
ui.initUI({
  create, join, copyId, copyLink,
  pttDown, pttUp,
  mute: toggleMute, lock: toggleLock, reset: disconnect,
  chat: sendChat,
  quick: id => {
    const m = QUICK_MSGS.find(x => x.id === id);
    if (m) sendChat(m[getLang()]);
  },
  recent: id => { $('join-id-input').value = id; ui.menu('join'); ui.showModal('connectModal'); },
  settings: applySettings,
  lang: () => setLang(getLang() === 'en' ? 'it' : 'en'),
  theme: () => {
    setSettings({ theme: (profile.settings.theme === 'dark' ? 'light' : 'dark') });
    document.body.dataset.theme = profile.settings.theme;
  },
  renderAll
});
renderAll();
status('offline');
glass.enable($('walkie'), 36, 22);
glass.enable(document.querySelector('.topbar'), 20, 14);

const m = location.hash.match(/channel=([A-Za-z0-9]{4,8})/);
if (m) {
  $('join-id-input').value = m[1].toUpperCase();
  ui.menu('join');
  ui.showModal('connectModal');
}

requestAnimationFrame(frame);
if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(() => {});
