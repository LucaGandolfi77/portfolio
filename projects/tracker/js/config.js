/* Camera Tracker — configurazione */

export const STORAGE_KEY = 'camera_tracker_v1';

export const FILTERS = [
  { id: 'normal', icon: '◉', key: 'filter.normal', deps: [] },
  { id: 'bw', icon: '◐', key: 'filter.bw', deps: [] },
  { id: 'contrast', icon: '◑', key: 'filter.contrast', deps: [], slider: 50 },
  { id: 'edges', icon: '⌁', key: 'filter.edges', deps: [], slider: 50 },
  { id: 'sepia', icon: '◍', key: 'filter.sepia', deps: [] },
  { id: 'invert', icon: '◒', key: 'filter.invert', deps: [] },
  { id: 'blur', icon: '◌', key: 'filter.blur', deps: [], slider: 20 },
  { id: 'pixelate', icon: '▦', key: 'filter.pixelate', deps: [], slider: 20 },
  { id: 'vignette', icon: '◎', key: 'filter.vignette', deps: [] },
  { id: 'sketch', icon: '✎', key: 'filter.sketch', deps: [] },
  { id: 'cartoon', icon: '✿', key: 'filter.cartoon', deps: [], slider: 60 },
  { id: 'thermal', icon: '♨', key: 'filter.thermal', deps: [] },
  { id: 'colorsplash', icon: '✧', key: 'filter.colorsplash', deps: [] },
  { id: 'objects', icon: '▣', key: 'filter.objects', deps: ['tfjs', 'cocossd'], ai: true },
  { id: 'face', icon: '☺', key: 'filter.face', deps: ['tfjs', 'blazeface', 'faceTracker'], ai: true },
  { id: 'hands', icon: '✋', key: 'filter.hands', deps: ['mediape', 'handTracker'], ai: true },
  { id: 'tracker', icon: '◎', key: 'filter.tracker', deps: ['tfjs', 'cocossd', 'mobilenet', 'aiTracker'], ai: true },
  { id: 'segment', icon: '◓', key: 'filter.segment', deps: ['tfjs', 'bodypix'], ai: true },
  { id: 'subtitles', icon: '💬', key: 'filter.subtitles', deps: [], voice: true }
];

export const LIBRARIES = {
  tfjs: {
    global: 'tf',
    urls: [
      'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js',
      'https://unpkg.com/@tensorflow/tfjs@4.22.0/dist/tf.min.js',
      'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@3.21.0/dist/tf.min.js'
    ]
  },
  cocossd: {
    global: 'cocoSsd',
    urls: [
      'https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd@2.2.3/dist/coco-ssd.min.js',
      'https://unpkg.com/@tensorflow-models/coco-ssd@2.2.3/dist/coco-ssd.min.js'
    ]
  },
  blazeface: {
    global: 'blazeface',
    urls: [
      'https://cdn.jsdelivr.net/npm/@tensorflow-models/blazeface@0.1.0/dist/blazeface.min.umd.js',
      'https://unpkg.com/@tensorflow-models/blazeface@0.1.0/dist/blazeface.min.umd.js'
    ]
  },
  mobilenet: {
    global: 'mobilenet',
    urls: [
      'https://cdn.jsdelivr.net/npm/@tensorflow-models/mobilenet@2.1.1/dist/mobilenet.min.js',
      'https://unpkg.com/@tensorflow-models/mobilenet@2.1.1/dist/mobilenet.min.js'
    ]
  },
  bodypix: {
    global: 'bodyPix',
    urls: [
      'https://cdn.jsdelivr.net/npm/@tensorflow-models/body-pix@2.2.1/dist/body-pix.min.umd.js',
      'https://unpkg.com/@tensorflow-models/body-pix@2.2.1/dist/body-pix.min.umd.js'
    ]
  },
  mediape: {
    global: 'Hands',
    urls: [
      'https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js',
      'https://unpkg.com/@mediapipe/hands/hands.js'
    ]
  }
};

export const LOCAL_MODULES = {
  faceTracker: { global: 'FaceTracker', url: '../../assets/js/face_tracker.js' },
  aiTracker: { global: 'AITracker', url: '../../assets/js/ai_tracker.js' },
  handTracker: { global: 'HandTracker', url: '../../assets/js/hand_tracker.js' }
};

export const RESOLUTIONS = [
  { id: 'low', labelKey: 'res.low', width: 640, height: 480 },
  { id: 'medium', labelKey: 'res.medium', width: 960, height: 540 },
  { id: 'high', labelKey: 'res.high', width: 1280, height: 720 }
];

export const DEFAULT_SETTINGS = {
  language: 'en-US',
  resolution: 'medium',
  facingMode: 'environment',
  mirror: false,
  zoom: 1,
  detectionFps: 10,
  timer: 0,
  sound: true,
  filter: 'normal'
};

export function findFilter(id) {
  return FILTERS.find(f => f.id === id) || FILTERS[0];
}
