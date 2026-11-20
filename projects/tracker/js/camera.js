/* Gestione fotocamera: permessi, switch, zoom, torcia */

import { RESOLUTIONS } from './config.js';

const listeners = {};
export function on(event, fn) { (listeners[event] ||= []).push(fn); return () => {
  listeners[event] = (listeners[event] || []).filter(f => f !== fn);
}; }
function emit(event, detail) { (listeners[event] || []).forEach(fn => { try { fn(detail || {}); } catch (e) { console.error(e); } }); }

let video = null;
let stream = null;
let track = null;
let capabilities = {};
let settings = { facingMode: 'environment', resolution: 'medium', mirror: false, zoom: 1 };
let torchOn = false;
let digitalZoom = 1;

export function configure(next) {
  settings = Object.assign({}, settings, next);
  if (settings.zoom && settings.zoom > 1) digitalZoom = settings.zoom;
}

export function getState() {
  return {
    active: !!stream,
    facingMode: settings.facingMode,
    resolution: settings.resolution,
    mirror: settings.mirror,
    zoom: digitalZoom,
    torch: torchOn,
    capabilities
  };
}

function resolutionPreset() {
  return RESOLUTIONS.find(r => r.id === settings.resolution) || RESOLUTIONS[1];
}

export async function start() {
  if (!video) throw new Error('video element missing');
  stop();
  const preset = resolutionPreset();
  const constraints = {
    audio: false,
    video: {
      facingMode: { ideal: settings.facingMode },
      width: { ideal: preset.width },
      height: { ideal: preset.height }
    }
  };

  try {
    stream = await navigator.mediaDevices.getUserMedia(constraints);
  } catch (firstError) {
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    } catch (error) {
      const denied = error && (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError');
      emit('error', { code: denied ? 'denied' : 'missing', message: error && error.message });
      throw error;
    }
  }

  video.srcObject = stream;
  track = stream.getVideoTracks()[0];
  capabilities = track.getCapabilities ? track.getCapabilities() : {};
  digitalZoom = settings.zoom || 1;
  torchOn = false;

  try { await video.play(); } catch (e) { /* autoplay può essere bloccato: l'utente può toccare lo schermo */ }
  emit('start', getState());
  return getState();
}

export function stop() {
  if (stream) {
    stream.getTracks().forEach(t => t.stop());
    stream = null;
    track = null;
    capabilities = {};
  }
  if (video) video.srcObject = null;
  emit('stop');
}

export async function switchFacing() {
  settings.facingMode = settings.facingMode === 'environment' ? 'user' : 'environment';
  return start();
}

export async function setResolution(id) {
  settings.resolution = id;
  if (stream) return start();
  return getState();
}

export async function setZoom(value) {
  const zoom = Math.max(1, Math.min(5, value));
  digitalZoom = zoom;
  if (track && capabilities.zoom) {
    try {
      const min = capabilities.zoom.min != null ? capabilities.zoom.min : 1;
      const max = capabilities.zoom.max != null ? capabilities.zoom.max : 5;
      const native = min + ((zoom - 1) / 4) * (max - min);
      await track.applyConstraints({ advanced: [{ zoom: native }] });
    } catch (e) { /* fallback digitale */ }
  }
  settings.zoom = zoom;
  emit('zoom', { zoom });
  return zoom;
}

export async function toggleTorch() {
  if (!track || !capabilities.torch) {
    emit('torchUnsupported');
    return false;
  }
  torchOn = !torchOn;
  try {
    await track.applyConstraints({ advanced: [{ torch: torchOn }] });
    emit('torch', { on: torchOn });
  } catch (e) {
    torchOn = false;
    emit('torchUnsupported');
  }
  return torchOn;
}

export function applyMirrorTransform(ctx, width, height) {
  if (settings.mirror || settings.facingMode === 'user') {
    ctx.translate(width, 0);
    ctx.scale(-1, 1);
  }
}

export function getVideoElement() { return video; }
export function attach(videoElement) { video = videoElement; }
