/* Smile Detection — MediaPipe FaceLandmarker Wrapper (tasks-vision) */

class FaceTracker {
  constructor() {
    this.landmarker = null;
    this.running = false;
    this.lastResult = null;
  }

  async init(onProgress) {
    const vision = await import(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/vision_bundle.mjs'
    );
    const { FaceLandmarker, FilesetResolver } = vision;

    if (onProgress) onProgress('Caricamento modello...');

    const filesetResolver = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm'
    );

    this.landmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
      baseOptions: {
        modelAssetPath:
          'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
        delegate: 'GPU',
      },
      outputFaceBlendshapes: true,
      outputFacialTransformationMatrixes: false,
      runningMode: 'VIDEO',
      numFaces: 1,
      minFaceDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    if (onProgress) onProgress('Pronto');
    return true;
  }

  detect(video, timestamp) {
    if (!this.landmarker || video.readyState < 2) return null;

    try {
      const result = this.landmarker.detectForVideo(video, timestamp);
      this.lastResult = result;
      return result;
    } catch (_) {
      return null;
    }
  }

  destroy() {
    if (this.landmarker) {
      this.landmarker.close();
      this.landmarker = null;
    }
  }
}
