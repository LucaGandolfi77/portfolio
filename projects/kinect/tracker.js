/* Kinetic — MediaPipe Tasks Vision hand tracking wrapper */

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

    this.onProgress('model', 'active');
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
      } catch (gpuError) {
        this.landmarker = await vision.HandLandmarker.createFromOptions(fileset, options('CPU'));
      }
    } catch (e) {
      console.error('[Kinetic] model load failed', e);
      throw 'model';
    }
    this.onProgress('model', 'done');
  }

  async start() {
    this.onProgress('camera', 'active');
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
      });
    } catch (e) {
      console.error('[Kinetic] camera error', e);
      throw cameraErrorCode(e);
    }
    this.video.srcObject = this.stream;
    try {
      await this.video.play();
    } catch (e) {
      console.error('[Kinetic] video play error', e);
      throw 'generic';
    }
    // Wait until a real frame size is known so cover-mapping is correct.
    if (!this.video.videoWidth) {
      await new Promise(resolve => {
        const done = () => { this.video.removeEventListener('loadedmetadata', done); resolve(); };
        this.video.addEventListener('loadedmetadata', done);
        setTimeout(done, 1500);
      });
    }
    this.onProgress('camera', 'done');
    this.onProgress('ready', 'done');
  }

  detect(now) {
    if (!this.active || this.video.readyState < 2) return [];
    const ts = Math.max(this._lastTS + 1, Math.round(now));
    this._lastTS = ts;
    try {
      const result = this.landmarker.detectForVideo(this.video, ts);
      return result && result.landmarks ? result.landmarks : [];
    } catch (e) {
      return [];
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
