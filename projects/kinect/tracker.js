/* Kinetic — MediaPipe Gesture Recognizer wrapper (landmarks + gestures in one pass) */

const VISION_CDN = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18';
const MODEL_URL = 'https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task';

export function cameraErrorCode(err) {
  const name = (err && err.name) || '';
  if (/NotAllowed|Permission|SecurityError/.test(name)) return 'permission';
  if (/NotFound|DevicesNotFound|Overconstrained/.test(name)) return 'notfound';
  if (/NotReadable|TrackStart|Abort/.test(name)) return 'busy';
  return 'generic';
}

export class HandTracker {
  constructor(video, onProgress = () => {}) {
    this.video = video;
    this.onProgress = onProgress;
    this.recognizer = null;
    this.stream = null;
    this.delegate = null;
    this.mobile = matchMedia('(pointer: coarse)').matches ||
      (navigator.hardwareConcurrency || 8) <= 4;
    this.minInterval = this.mobile ? 1000 / 30 : 1000 / 45;
    this._lastTS = 0;
    this._lastVideoTime = -1;
    this._lastInfer = 0;
    this._cached = [];
    this._view = null;
  }

  get active() { return !!(this.stream && this.recognizer); }

  async startCamera() {
    if (!window.isSecureContext && !['localhost', '127.0.0.1'].includes(location.hostname)) throw 'insecure';
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || typeof WebAssembly === 'undefined') throw 'unsupported';

    this.onProgress('camera', 'active');
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: 'user',
          width: { ideal: this.mobile ? 640 : 960 },
          height: { ideal: this.mobile ? 480 : 540 },
          frameRate: { ideal: 30, max: 30 }
        }
      });
    } catch (e) {
      throw cameraErrorCode(e);
    }
    this.video.srcObject = this.stream;
    this.video.setAttribute('playsinline', '');
    this.video.muted = true;
    try { await this.video.play(); } catch (e) { throw cameraErrorCode(e) === 'generic' ? 'busy' : cameraErrorCode(e); }

    if (!this.video.videoWidth) {
      await new Promise(resolve => {
        const done = () => {
          this.video.removeEventListener('loadedmetadata', done);
          clearTimeout(timer);
          resolve();
        };
        const timer = setTimeout(done, 1500);
        this.video.addEventListener('loadedmetadata', done);
      });
    }
    this.onProgress('camera', 'done');
  }

  async loadModel() {
    this.onProgress('model', 'active');
    try {
      const vision = await import(/* @vite-ignore */ VISION_CDN + '/vision_bundle.mjs');
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
        this.recognizer = await vision.GestureRecognizer.createFromOptions(fileset, options('GPU'));
        this.delegate = 'GPU';
      } catch (gpuError) {
        console.warn('[Kinetic] GPU delegate unavailable, using CPU', gpuError);
        this.recognizer = await vision.GestureRecognizer.createFromOptions(fileset, options('CPU'));
        this.delegate = 'CPU';
      }
    } catch (e) {
      console.error('[Kinetic] gesture model load failed', e);
      throw 'model';
    }
    this.onProgress('model', 'done');
    return this.delegate;
  }

  detect(now) {
    if (!this.active || this.video.readyState < 2) return this._cached;
    if (this.video.currentTime === this._lastVideoTime) return this._cached;
    if (now - this._lastInfer < this.minInterval) return this._cached;

    this._lastVideoTime = this.video.currentTime;
    this._lastInfer = now;
    const ts = Math.max(this._lastTS + 1, Math.round(now));
    this._lastTS = ts;

    try {
      const result = this.recognizer.recognizeForVideo(this.video, ts);
      const hands = (result && result.landmarks) || [];
      this._cached = hands.map((points, i) => {
        const gesture = (result.gestures && result.gestures[i] && result.gestures[i][0]) || null;
        const handedness = (result.handedness && result.handedness[i] && result.handedness[i][0]) || null;
        return {
          points,
          world: (result.worldLandmarks && result.worldLandmarks[i]) || [],
          gesture: gesture ? gesture.categoryName : 'None',
          gestureScore: gesture ? gesture.score : 0,
          handedness: handedness ? handedness.categoryName : 'Unknown'
        };
      });
    } catch (e) {
      console.warn('[Kinetic] inference skipped', e);
    }
    return this._cached;
  }

  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach(t => t.stop());
      this.stream = null;
      this.video.srcObject = null;
      this._lastVideoTime = -1;
    }
  }

  stop() {
    this.stopCamera();
    if (this.recognizer) {
      try { this.recognizer.close(); } catch (e) { /* ignore */ }
      this.recognizer = null;
    }
    this._cached = [];
    this._lastTS = 0;
    this.delegate = null;
  }
}
