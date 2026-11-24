/**
 * tracking.js — HandLandmarker locale + rilevamento gesti.
 */

import { FilesetResolver, HandLandmarker } from '../../vision-lab/js/vendor/mediapipe/vision_bundle.js';

const WASM_ROOT = new URL('../../vision-lab/js/vendor/mediapipe/wasm/', import.meta.url).href;
const MODEL_URL = new URL('../../tracker/model/hand_landmarker.task', import.meta.url).href;

export function createTracker({ onStatus = () => {} } = {}) {
  let landmarker = null, timestamp = 0, error = null;

  async function prepare() {
    if (landmarker) return true;
    onStatus('wasm');
    const fileset = await FilesetResolver.forVisionTasks(WASM_ROOT);
    const options = {
      baseOptions: { modelAssetPath: MODEL_URL, delegate: 'GPU' },
      runningMode: 'VIDEO',
      numHands: 4,
      minHandDetectionConfidence: 0.5,
      minHandPresenceConfidence: 0.5,
      minTrackingConfidence: 0.5
    };
    try {
      landmarker = await HandLandmarker.createFromOptions(fileset, options);
    } catch (e) {
      onStatus('cpu');
      landmarker = await HandLandmarker.createFromOptions(fileset, {
        ...options, baseOptions: { modelAssetPath: MODEL_URL, delegate: 'CPU' }
      });
    }
    onStatus('ready');
    return true;
  }

  function detect(video) {
    if (!landmarker || !video || video.readyState < 2) return null;
    timestamp += 33;
    try { return landmarker.detectForVideo(video, timestamp); }
    catch (e) { error = e; return null; }
  }

  return {
    prepare, detect,
    get ready() { return !!landmarker; },
    get error() { return error; },
    close() { if (landmarker) { try { landmarker.close(); } catch (e) {} landmarker = null; } }
  };
}
