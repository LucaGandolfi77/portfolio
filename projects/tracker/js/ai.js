/* Gestione modelli AI: preparazione lazy e inferenza */

import { ensureFilterDeps, isOnline } from './loader.js';

const models = {
  coco: null,
  bodyPix: null,
  face: false,
  hands: false,
  tracker: false
};

let activeFilter = null;
let lastError = null;

export function getActiveFilter() { return activeFilter; }
export function getLastError() { return lastError; }
export function resetActive() { activeFilter = null; }

function alreadyReady(filter) {
  switch (filter.id) {
    case 'objects': return !!models.coco;
    case 'face': return models.face;
    case 'hands': return models.hands;
    case 'tracker': return !!models.coco && models.tracker;
    case 'segment': return !!models.bodyPix;
    default: return true;
  }
}

/** Prepara il modello necessario al filtro. */
export async function prepare(filter, onProgress) {
  lastError = null;
  if (!filter.ai && !filter.voice) {
    activeFilter = filter.id;
    return { ok: true };
  }
  if (filter.voice) {
    activeFilter = filter.id;
    return { ok: true };
  }
  if (!isOnline() && !alreadyReady(filter)) {
    lastError = 'offline';
    return { ok: false, reason: 'offline' };
  }

  try {
    await ensureFilterDeps(filter, onProgress);
    switch (filter.id) {
      case 'objects':
      case 'tracker':
        if (!models.coco) models.coco = await window.cocoSsd.load();
        break;
      case 'face':
        if (!models.face) { await window.FaceTracker.load(); models.face = true; }
        break;
      case 'hands':
        if (!models.hands) { await window.HandTracker.load(); models.hands = true; }
        break;
      case 'segment':
        if (!models.bodyPix) models.bodyPix = await window.bodyPix.load();
        break;
    }
    if (filter.id === 'tracker' && !models.tracker) {
      await window.AITracker.load();
      models.tracker = true;
    }
    activeFilter = filter.id;
    return { ok: true };
  } catch (error) {
    lastError = error && error.message || String(error);
    activeFilter = null;
    return { ok: false, reason: lastError };
  }
}

/** Esegue l'inferenza per il filtro attivo. */
export async function detect(filter, video) {
  try {
    if (filter.id === 'objects' && models.coco) return await models.coco.detect(video);
    if (filter.id === 'face' && window.FaceTracker) {
      const result = await window.FaceTracker.detect(video);
      return result || [];
    }
    if (filter.id === 'hands' && window.HandTracker) {
      await window.HandTracker.detect(video);
      return { hands: window.HandTracker.results || null };
    }
    if (filter.id === 'tracker' && models.coco && window.AITracker) {
      const all = await models.coco.detect(video);
      if (window.AITracker.targetEmbedding) {
        const tracked = await window.AITracker.track(video, all);
        return { all, tracked };
      }
      return { all, tracked: null };
    }
    if (filter.id === 'segment' && models.bodyPix) {
      return await models.bodyPix.segmentPerson(video, {
        internalResolution: 'medium',
        segmentationThreshold: 0.7
      });
    }
  } catch (error) {
    lastError = error && error.message || String(error);
  }
  return null;
}

export async function setTrackerTarget(video, bbox, filter) {
  if (filter.id !== 'tracker' || !window.AITracker) return false;
  try {
    await window.AITracker.setTarget(video, bbox);
    return true;
  } catch (error) {
    lastError = error && error.message || String(error);
    return false;
  }
}

export function getModelStatus(filter) {
  if (!filter) return 'none';
  if (!filter.ai) return 'none';
  return alreadyReady(filter) ? 'ready' : 'loading';
}
