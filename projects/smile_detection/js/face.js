/**
 * face.js — wrapper MediaPipe FaceLandmarker con asset locali di vision-lab.
 */

import { FilesetResolver, FaceLandmarker } from '../../vision-lab/js/vendor/mediapipe/vision_bundle.js';

const WASM_ROOT = new URL('../../vision-lab/js/vendor/mediapipe/wasm/', import.meta.url).href;
const MODEL_URL = new URL('../../vision-lab/model/face_landmarker.task', import.meta.url).href;
const INNER_LIPS = [78, 95, 88, 178, 87, 14, 317, 402, 318, 324, 308, 415, 310, 311, 12, 13, 82, 81, 80, 191];

export class FaceTracker {
  constructor() {
    this.landmarker = null;
    this.timestamp = 0;
    this.crop = document.createElement('canvas');
    this.crop.width = 224;
    this.crop.height = 224;
    this.cropCtx = this.crop.getContext('2d');
  }

  static async create(onStatus = () => {}) {
    onStatus('loading');
    const fileset = await FilesetResolver.forVisionTasks(WASM_ROOT);
    const options = {
      baseOptions: { modelAssetPath: MODEL_URL, delegate: 'GPU' },
      runningMode: 'VIDEO',
      numFaces: 2,
      minFaceDetectionConfidence: 0.5,
      minFacePresenceConfidence: 0.5,
      minTrackingConfidence: 0.5,
      outputFaceBlendshapes: true,
      outputFacialTransformationMatrixes: true
    };
    let landmarker;
    try { landmarker = await FaceLandmarker.createFromOptions(fileset, options); }
    catch (e) {
      landmarker = await FaceLandmarker.createFromOptions(fileset, {
        ...options,
        baseOptions: { modelAssetPath: MODEL_URL, delegate: 'CPU' }
      });
    }
    onStatus('ready');
    const tracker = new FaceTracker();
    tracker.landmarker = landmarker;
    return tracker;
  }

  analyze(video) {
    if (!this.landmarker || !video || video.readyState < 2) return null;
    this.timestamp += 33;
    let result;
    try { result = this.landmarker.detectForVideo(video, this.timestamp); }
    catch (e) { return null; }
    const faces = (result && result.faceLandmarks) || [];
    if (!faces.length) return null;
    let primary = 0, best = -1;
    faces.forEach((landmarks, index) => {
      const width = Math.abs(landmarks[454].x - landmarks[234].x);
      if (width > best) { best = width; primary = index; }
    });
    const landmarks = faces[primary];
    const categories = result.faceBlendshapes && result.faceBlendshapes[primary]
      ? result.faceBlendshapes[primary].categories : [];
    const blend = {};
    categories.forEach((item) => { blend[item.categoryName] = item.score; });

    const left = landmarks[33], right = landmarks[263];
    const distance = Math.hypot(right.x - left.x, right.y - left.y) || 1e-4;
    const cx = (left.x + right.x) / 2, cy = (left.y + right.y) / 2;
    const ctx = this.cropCtx;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, 224, 224);
    ctx.save();
    ctx.translate(112, 100);
    ctx.scale(90 / distance, 90 / distance);
    ctx.translate(-cx, -cy);
    ctx.drawImage(video, 0, 0);
    ctx.restore();

    let minX = 1, minY = 1, maxX = 0, maxY = 0;
    for (const point of landmarks) {
      minX = Math.min(minX, point.x); maxX = Math.max(maxX, point.x);
      minY = Math.min(minY, point.y); maxY = Math.max(maxY, point.y);
    }
    return {
      landmarks,
      blend,
      faceCount: faces.length,
      box: { x: minX, y: minY, w: maxX - minX, h: maxY - minY },
      cropUrl: this.crop.toDataURL('image/jpeg', 0.86),
      innerLips: INNER_LIPS
    };
  }

  drawOverlay(ctx, landmarks, width, height, color = '#7ef7ff') {
    if (!ctx || !landmarks) return;
    ctx.clearRect(0, 0, width, height);
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(1, width / 400);
    ctx.globalAlpha = 0.75;
    ctx.beginPath();
    INNER_LIPS.forEach((index, i) => {
      const point = landmarks[index];
      if (!point) return;
      if (i === 0) ctx.moveTo(point.x * width, point.y * height);
      else ctx.lineTo(point.x * width, point.y * height);
    });
    ctx.closePath();
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  dispose() { if (this.landmarker) { try { this.landmarker.close(); } catch (e) {} this.landmarker = null; } }
}
