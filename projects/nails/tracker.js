/* Nail Art AR — MediaPipe Hand Landmarker wrapper */

const VISION_CDN = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18';
const MODEL_URL = 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';

function cameraErrorCode(err) {
  const name = (err && err.name) || '';
  if (/NotAllowed|Permission|SecurityError/.test(name)) return 'permission';
  if (/NotFound|DevicesNotFound/.test(name)) return 'notfound';
  if (/NotReadable|TrackStart/.test(name)) return 'busy';
  return 'generic';
}

export class HandTracker {
  constructor(video, onProgress = () => {}) {
    this.video = video;
    this.onProgress = onProgress;
    this.landmarker = null;
    this.stream = null;
    this._lastTS = 0;
  }

  get active() { return !!this.stream && !!this.landmarker; }

  async init() {
    if (!window.isSecureContext && !['localhost', '127.0.0.1'].includes(location.hostname)) {
      throw 'insecure';
    }
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || typeof WebAssembly === 'undefined') {
      throw 'unsupported';
    }
    this.onProgress('model');
    let vision;
    try {
      vision = await import(VISION_CDN + '/vision_bundle.mjs');
      const fileset = await vision.FilesetResolver.forVisionTasks(VISION_CDN + '/wasm');
      const options = delegate => ({
        baseOptions: { modelAssetPath: MODEL_URL, delegate },
        runningMode: 'VIDEO',
        numHands: 2,
        minHandDetectionConfidence: 0.5,
        minHandPresenceConfidence: 0.5,
        minTrackingConfidence: 0.5
      });
      try {
        this.landmarker = await vision.HandLandmarker.createFromOptions(fileset, options('GPU'));
      } catch (e) {
        this.landmarker = await vision.HandLandmarker.createFromOptions(fileset, options('CPU'));
      }
    } catch (e) {
      console.error('[Nails] model load failed', e);
      throw 'model';
    }
  }

  async start() {
    this.onProgress('camera');
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
    } catch (e) {
      console.error('[Nails] camera error', e);
      throw cameraErrorCode(e);
    }
    this.video.srcObject = this.stream;
    try {
      await this.video.play();
    } catch (e) {
      throw 'generic';
    }
    if (!this.video.videoWidth) {
      await new Promise(resolve => {
        const done = () => { this.video.removeEventListener('loadedmetadata', done); resolve(); };
        this.video.addEventListener('loadedmetadata', done);
        setTimeout(done, 1500);
      });
    }
  }

  detect(now) {
    if (!this.active || this.video.readyState < 2) return { landmarks: [], handedness: [] };
    const ts = Math.max(this._lastTS + 1, Math.round(now));
    this._lastTS = ts;
    try {
      const r = this.landmarker.detectForVideo(this.video, ts);
      return {
        landmarks: (r && r.landmarks) || [],
        handedness: (r && r.handedness) || []
      };
    } catch (e) {
      return { landmarks: [], handedness: [] };
    }
  }

  stop() {
    if (this.stream) {
      this.stream.getTracks().forEach(t => t.stop());
      this.stream = null;
    }
    if (this.landmarker) {
      try { this.landmarker.close(); } catch (e) { /* ignore */ }
      this.landmarker = null;
    }
    if (this.video) this.video.srcObject = null;
    this._lastTS = 0;
  }
}
