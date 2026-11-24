/**
 * face-engine.js — wrapper attorno a MediaPipe FaceLandmarker.
 * Riutilizza il modello e il WASM vendorizzati in projects/vision-lab.
 * Espone analisi (landmark + descrittori) e overlay, senza logica UI.
 */

import * as m from './metrics.js';

const BUNDLE_URL = '../../vision-lab/js/vendor/mediapipe/vision_bundle.js';
const WASM_DIR = '../../vision-lab/js/vendor/mediapipe/wasm/';
const MODEL_URL = '../../vision-lab/model/face_landmarker.task';
const FACE_OVAL = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109];
const LIPS = [61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 308, 324, 318, 402, 317, 14, 87, 178, 88, 95];

export class FaceEngine {
  constructor(vision, landmarker) {
    this.vision = vision;
    this.landmarker = landmarker;
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
    this.stats = document.createElement('canvas');
    this.stats.width = 128;
    this.stats.height = 128;
    this.statsCtx = this.stats.getContext('2d', { willReadFrequently: true });
    this.aligned = document.createElement('canvas');
    this.aligned.width = 256;
    this.aligned.height = 256;
    this.alignedCtx = this.aligned.getContext('2d', { willReadFrequently: true });
    this.timestamp = 0;
    this.closed = false;
  }

  static async create(onStatus) {
    if (onStatus) onStatus('loading');
    const vision = await import(BUNDLE_URL);
    const wasmRoot = new URL(WASM_DIR, import.meta.url).href;
    const modelPath = new URL(MODEL_URL, import.meta.url).href;
    const fileset = await vision.FilesetResolver.forVisionTasks(wasmRoot);
    const options = {
      baseOptions: { modelAssetPath: modelPath, delegate: 'GPU' },
      runningMode: 'VIDEO',
      numFaces: 4,
      minFaceDetectionConfidence: 0.5,
      minFacePresenceConfidence: 0.5,
      minTrackingConfidence: 0.5
    };
    let landmarker;
    try {
      landmarker = await vision.FaceLandmarker.createFromOptions(fileset, options);
    } catch (error) {
      landmarker = await vision.FaceLandmarker.createFromOptions(fileset, {
        ...options,
        baseOptions: { modelAssetPath: modelPath, delegate: 'CPU' }
      });
    }
    if (onStatus) onStatus('ready');
    return new FaceEngine(vision, landmarker);
  }

  close() {
    this.closed = true;
    try { this.landmarker.close(); } catch (e) {}
  }

  /** Analizza un video, img o canvas. Ritorna sempre un oggetto (anche senza volto). */
  analyze(source) {
    const empty = {
      faceCount: 0,
      landmarks: null,
      geometry: new Float32Array(478 * 3),
      appearance: new Float32Array(256),
      quality: { score: 0, flags: ['noFace'] },
      pose: { yaw: 0, pitch: 0, roll: 0 },
      aligned: null,
      width: 0,
      height: 0
    };
    if (!source || this.closed) return empty;

    const sw = source.videoWidth || source.naturalWidth || source.width || 0;
    const sh = source.videoHeight || source.naturalHeight || source.height || 0;
    if (!sw || !sh) return empty;

    const scale = Math.min(1, 960 / Math.max(sw, sh));
    const w = Math.max(1, Math.round(sw * scale));
    const h = Math.max(1, Math.round(sh * scale));
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
    }
    try { this.ctx.drawImage(source, 0, 0, w, h); } catch (e) { return empty; }

    this.statsCtx.drawImage(this.canvas, 0, 0, 128, 128);
    const pixels = this.statsCtx.getImageData(0, 0, 128, 128).data;
    const sharpness = m.estimateSharpness(pixels, 128, 128);
    const brightness = m.estimateBrightness(pixels, 128, 128);

    this.timestamp += 33;
    let result;
    try { result = this.landmarker.detectForVideo(this.canvas, this.timestamp); }
    catch (e) { return empty; }

    const faces = (result && result.faceLandmarks) || [];
    if (!faces.length) {
      return { ...empty, quality: m.qualityScore({ faceCount: 0 }), width: sw, height: sh };
    }

    // scegli il volto più grande
    let primary = faces[0], bestArea = -1;
    for (const face of faces) {
      const box = boxOf(face);
      const area = box.w * box.h;
      if (area > bestArea) { bestArea = area; primary = face; }
    }
    const transform = m.canonicalTransform(primary, 256);
    if (!transform) {
      return { ...empty, faceCount: faces.length, quality: m.qualityScore({ faceCount: faces.length, sharpness, brightness }), width: sw, height: sh };
    }

    // crop allineato
    const ctx = this.alignedCtx;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#20242e';
    ctx.fillRect(0, 0, 256, 256);
    ctx.save();
    ctx.translate(transform.targetX, transform.targetY);
    ctx.rotate(-transform.angle);
    ctx.scale(transform.scale, transform.scale);
    ctx.translate(-transform.cx, -transform.cy);
    ctx.drawImage(this.canvas, 0, 0);
    ctx.restore();

    const alignedPixels = ctx.getImageData(0, 0, 256, 256).data;
    const box = boxOf(primary);
    const pose = m.poseFromLandmarks(primary);
    const quality = m.qualityScore({
      faceCount: faces.length,
      sizeRatio: (box.w * box.h) / (w * h),
      sharpness,
      brightness,
      pose
    });

    return {
      faceCount: faces.length,
      landmarks: primary,
      geometry: m.landmarkDescriptor(primary),
      appearance: m.gridDescriptor(alignedPixels, 256, 256, 16),
      quality,
      pose,
      aligned: this.aligned,
      width: sw,
      height: sh
    };
  }

  /** Disegna box, contorno del viso, labbra e punti campione sull'overlay. */
  drawOverlay(ctx, landmarks, width, height, color = '#00e5ff') {
    if (!ctx || !landmarks || !width || !height) return;
    ctx.clearRect(0, 0, width, height);
    const box = boxOf(landmarks);
    ctx.strokeStyle = color;
    ctx.globalAlpha = 0.9;
    ctx.lineWidth = Math.max(1, width / 400);
    ctx.strokeRect(box.x * width, box.y * height, box.w * width, box.h * height);

    ctx.globalAlpha = 0.75;
    ctx.beginPath();
    FACE_OVAL.forEach((index, i) => {
      const p = landmarks[index];
      if (!p) return;
      if (i === 0) ctx.moveTo(p.x * width, p.y * height);
      else ctx.lineTo(p.x * width, p.y * height);
    });
    ctx.closePath();
    ctx.stroke();

    ctx.beginPath();
    LIPS.forEach((index, i) => {
      const p = landmarks[index];
      if (!p) return;
      if (i === 0) ctx.moveTo(p.x * width, p.y * height);
      else ctx.lineTo(p.x * width, p.y * height);
    });
    ctx.closePath();
    ctx.stroke();

    ctx.globalAlpha = 0.55;
    ctx.fillStyle = color;
    const step = 3;
    const r = Math.max(1, width / 500);
    for (let i = 0; i < landmarks.length; i += step) {
      const p = landmarks[i];
      if (p) ctx.fillRect(p.x * width - r, p.y * height - r, r * 2, r * 2);
    }
    ctx.globalAlpha = 1;
  }
}

function boxOf(landmarks) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const p of landmarks) {
    if (!p) continue;
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  }
  if (!Number.isFinite(minX)) return { x: 0, y: 0, w: 0, h: 0 };
  return { x: minX, y: minY, w: Math.max(0, maxX - minX), h: Math.max(0, maxY - minY) };
}
