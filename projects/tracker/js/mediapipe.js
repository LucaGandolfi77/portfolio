/**
 * mediapipe.js — motore unico MediaPipe Tasks Vision per Camera Tracker.
 * Usa bundle/WASM vendorizzati in vision-lab e modelli locali in model/.
 */

import {
  FilesetResolver, FaceLandmarker, HandLandmarker, PoseLandmarker, ObjectDetector
} from '../../vision-lab/js/vendor/mediapipe/vision_bundle.js';

const WASM_ROOT = new URL('../../vision-lab/js/vendor/mediapipe/wasm/', import.meta.url).href;
const MODELS = {
  face: new URL('../../vision-lab/model/face_landmarker.task', import.meta.url).href,
  hands: new URL('../model/hand_landmarker.task', import.meta.url).href,
  pose: new URL('../model/pose_landmarker_lite.task', import.meta.url).href,
  objects: new URL('../model/object_detector.tflite', import.meta.url).href
};

const TASK_CLASSES = {
  face: FaceLandmarker,
  hands: HandLandmarker,
  pose: PoseLandmarker,
  objects: ObjectDetector
};

export class MediaPipeEngine {
  constructor() {
    this.fileset = null;
    this.tasks = new Map();
    this.timestamps = { face: 0, hands: 0, pose: 0, objects: 0 };
    this.errors = new Map();
  }

  async prepare(names, onStatus = () => {}) {
    if (!this.fileset) {
      onStatus('wasm');
      this.fileset = await FilesetResolver.forVisionTasks(WASM_ROOT);
    }
    for (const name of names) {
      if (this.tasks.has(name) || this.errors.has(name)) continue;
      const TaskClass = TASK_CLASSES[name];
      if (!TaskClass) continue;
      onStatus(name);
      const common = { baseOptions: { modelAssetPath: MODELS[name], delegate: 'GPU' }, runningMode: 'VIDEO', numFaces: 4 };
      try {
        const task = await TaskClass.createFromOptions(this.fileset, common);
        this.tasks.set(name, task);
      } catch (error) {
        try {
          const task = await TaskClass.createFromOptions(this.fileset, {
            ...common, baseOptions: { modelAssetPath: MODELS[name], delegate: 'CPU' }
          });
          this.tasks.set(name, task);
        } catch (fallbackError) {
          this.errors.set(name, fallbackError);
        }
      }
    }
    return names.every((name) => this.tasks.has(name));
  }

  detect(name, video) {
    const task = this.tasks.get(name);
    if (!task || !video || video.readyState < 2) return null;
    this.timestamps[name] += 33;
    try {
      return task.detectForVideo(video, this.timestamps[name]);
    } catch (error) {
      return null;
    }
  }

  has(name) { return this.tasks.has(name); }
  get ready() { return this.tasks.size > 0; }

  dispose() {
    this.tasks.forEach((task) => { try { task.close(); } catch (e) {} });
    this.tasks.clear();
    this.fileset = null;
  }
}

export const MP_FILTERS = {
  face: ['face'],
  hands: ['hands'],
  pose: ['pose'],
  objects: ['objects'],
  tracker: ['objects', 'face'],
  segment: ['pose'],
  ar: ['face'],
  qr: []
};

export function modelLabel(name) {
  return ({ face: 'Face Landmarker', hands: 'Hand Landmarker', pose: 'Pose Landmarker', objects: 'Object Detector' })[name] || name;
}
