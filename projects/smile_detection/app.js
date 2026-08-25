/* Smile Detection — Main Orchestrator */

class SmileDetection {
  constructor() {
    this.video = document.getElementById('video');
    this.canvas = document.getElementById('overlayCanvas');
    this.ctx = this.canvas.getContext('2d');

    this.tracker = new FaceTracker();
    this.analyzer = new SmileAnalyzer();
    this.ui = new UIController();
    this.recorder = new VideoRecorder();

    this.running = false;
    this._raf = null;
    this._lastData = null;
  }

  async init() {
    this.ui.init();
    this.ui.setLoading(true, 'Caricamento modello AI...');

    /* exit button */
    document.getElementById('btn-exit').addEventListener('click', () => {
      window.location.href = '../index.html#projects';
    });

    /* camera switch */
    this.ui.onCameraSwitch = () => this.switchCamera();
    this.ui.onCapture = () => this.captureSnapshot();
    this.ui.onRecordToggle = () => this.toggleRecording();

    /* recorder callback */
    this.recorder.onStop = () => this.ui.showNotification('Video salvato');

    /* double-tap to switch camera */
    let lastTap = 0;
    this.canvas.addEventListener('click', () => {
      const now = Date.now();
      if (now - lastTap < 350) this.switchCamera();
      lastTap = now;
    });

    /* init tracker */
    try {
      await this.tracker.init((msg) => this.ui.setLoading(true, msg));
    } catch (err) {
      this.ui.setLoading(true, 'Errore modello: ' + err.message);
      console.error(err);
      return;
    }

    /* start camera */
    try {
      await this.startCamera('user');
      this.ui.setLoading(false);
      this.running = true;
      this._loop();
    } catch (err) {
      this.ui.setLoading(true, 'Camera non accessibile: ' + err.message);
      console.error(err);
    }
  }

  async startCamera(facing) {
    if (this.stream) this.stream.getTracks().forEach(t => t.stop());

    const constraints = {
      video: {
        facingMode: facing,
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
      audio: false,
    };

    try {
      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
    } catch (_) {
      delete constraints.video.facingMode;
      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
    }

    this.video.srcObject = this.stream;
    this.analyzer._videoEl = this.video;

    return new Promise((resolve) => {
      this.video.onloadedmetadata = () => {
        this.video.play();
        this._resizeCanvas();
        this._applyMirror(facing === 'user');
        resolve();
      };
    });
  }

  _resizeCanvas() {
    this.canvas.width = this.video.videoWidth || 640;
    this.canvas.height = this.video.videoHeight || 480;
  }

  _applyMirror(mirror) {
    if (mirror) {
      this.video.classList.add('mirror');
      this.canvas.classList.add('mirror');
    } else {
      this.video.classList.remove('mirror');
      this.canvas.classList.remove('mirror');
    }
  }

  async switchCamera() {
    const newFacing = this._currentFacing === 'user' ? 'environment' : 'user';
    this._currentFacing = newFacing;
    this.ui.setLoading(true, 'Cambio camera...');
    try {
      await this.startCamera(newFacing);
      this.analyzer.reset();
      this.ui.setLoading(false);
      this.ui.showNotification(newFacing === 'user' ? 'Frontale' : 'Posteriore');
    } catch (err) {
      this.ui.setLoading(true, 'Errore: ' + err.message);
    }
  }

  _loop() {
    if (!this.running) return;

    const result = this.tracker.detect(this.video, performance.now());

    if (result && result.faceLandmarks && result.faceLandmarks.length > 0) {
      this._lastData = this.analyzer.analyze(result, this.video.videoWidth, this.video.videoHeight);
      this.ui.updateScores(this._lastData);
      this._drawOverlay(this._lastData);
    } else {
      this._lastData = null;
      this.ui.updateScores(null);
      this._clearOverlay();
    }

    this._raf = requestAnimationFrame(() => this._loop());
  }

  /* ── Overlay Drawing ── */
  _drawOverlay(data) {
    if (!data) return;
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    ctx.clearRect(0, 0, w, h);

    const lm = data.landmarks;

    /* draw outer lips */
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(46, 204, 113, 0.6)';
    ctx.lineWidth = 2;
    for (let i = 0; i < this.analyzer.OUTER_LIPS.length; i++) {
      const idx = this.analyzer.OUTER_LIPS[i];
      const x = lm[idx].x * w;
      const y = lm[idx].y * h;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();

    /* draw inner lips */
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(233, 69, 96, 0.7)';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < this.analyzer.INNER_LIPS.length; i++) {
      const idx = this.analyzer.INNER_LIPS[i];
      const x = lm[idx].x * w;
      const y = lm[idx].y * h;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();

    /* highlight teeth region when mouth open */
    if (data.jawOpen > 0.03 && data.whiteness > 5) {
      const box = data.innerLipsBox;
      ctx.strokeStyle = 'rgba(46, 204, 113, 0.3)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(box.x, box.y, box.w, box.h);
      ctx.setLineDash([]);

      /* label */
      ctx.fillStyle = 'rgba(46, 204, 113, 0.8)';
      ctx.font = '11px -apple-system, sans-serif';
      ctx.fillText('TEETH', box.x + 2, box.y - 4);
    }

    /* draw mouth corners */
    [this.analyzer.LEFT_CORNER, this.analyzer.RIGHT_CORNER].forEach(idx => {
      ctx.beginPath();
      ctx.arc(lm[idx].x * w, lm[idx].y * h, 3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(241, 196, 15, 0.8)';
      ctx.fill();
    });
  }

  _clearOverlay() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /* ── Snapshot ── */
  captureSnapshot() {
    const tmp = document.createElement('canvas');
    tmp.width = this.canvas.width;
    tmp.height = this.canvas.height;
    const ctx = tmp.getContext('2d');

    /* mirror if front camera */
    if (this._currentFacing === 'user') {
      ctx.translate(tmp.width, 0);
      ctx.scale(-1, 1);
    }

    /* draw video frame */
    ctx.drawImage(this.video, 0, 0, tmp.width, tmp.height);

    /* draw overlay */
    ctx.drawImage(this.canvas, 0, 0);

    /* draw scores */
    if (this._lastData) {
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(8, tmp.height - 80, 180, 72);
      ctx.fillStyle = '#2ecc71';
      ctx.font = 'bold 14px -apple-system, sans-serif';
      ctx.fillText(`Smile: ${this._lastData.smile}%`, 16, tmp.height - 56);
      ctx.fillText(`Whiteness: ${this._lastData.whiteness}%`, 16, tmp.height - 38);
      ctx.fillText(`Alignment: ${this._lastData.alignment}%`, 16, tmp.height - 20);
      ctx.fillStyle = '#f1c40f';
      ctx.font = 'bold 18px -apple-system, sans-serif';
      ctx.fillText(`Overall: ${this._lastData.overall}`, 140, tmp.height - 30);
    }

    tmp.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      a.href = url;
      a.download = `smile_${ts}.jpg`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      this.ui.showNotification('Scatto salvato');
    }, 'image/jpeg', 0.92);
  }

  /* ── Video Recording ── */
  toggleRecording() {
    if (this.recorder.recording) {
      this.recorder.stop();
      this.ui.setRecording(false);
      this.ui.showNotification('Registrazione fermata');
      return;
    }

    /* composite canvas for recording */
    const recordCanvas = document.createElement('canvas');
    recordCanvas.width = this.canvas.width;
    recordCanvas.height = this.canvas.height;
    const rCtx = recordCanvas.getContext('2d');

    const drawFrame = () => {
      if (!this.recorder.recording) return;
      rCtx.save();
      if (this._currentFacing === 'user') {
        rCtx.translate(recordCanvas.width, 0);
        rCtx.scale(-1, 1);
      }
      rCtx.drawImage(this.video, 0, 0, recordCanvas.width, recordCanvas.height);
      rCtx.restore();
      rCtx.drawImage(this.canvas, 0, 0);

      /* draw scores on recording */
      if (this._lastData) {
        rCtx.fillStyle = 'rgba(0,0,0,0.5)';
        rCtx.fillRect(8, recordCanvas.height - 80, 180, 72);
        rCtx.fillStyle = '#2ecc71';
        rCtx.font = 'bold 14px -apple-system, sans-serif';
        rCtx.fillText(`Smile: ${this._lastData.smile}%`, 16, recordCanvas.height - 56);
        rCtx.fillText(`Whiteness: ${this._lastData.whiteness}%`, 16, recordCanvas.height - 38);
        rCtx.fillText(`Alignment: ${this._lastData.alignment}%`, 16, recordCanvas.height - 20);
        rCtx.fillStyle = '#f1c40f';
        rCtx.font = 'bold 18px -apple-system, sans-serif';
        rCtx.fillText(`Overall: ${this._lastData.overall}`, 140, recordCanvas.height - 30);
      }

      requestAnimationFrame(drawFrame);
    };

    this.recorder.start(recordCanvas);
    this.ui.setRecording(true);
    this.ui.showNotification('Registrazione avviata');
    drawFrame();
  }
}

/* ── Boot ── */
document.addEventListener('DOMContentLoaded', () => {
  const app = new SmileDetection();
  app._currentFacing = 'user';
  app.init();
});
