/* RAVE — Main Application Orchestrator */

class RAVE {
  constructor() {
    this.video = document.getElementById('video');
    this.canvas = document.getElementById('glCanvas');
    this.loading = document.getElementById('loading');

    this.camera = new CameraController(this.video);
    this.shader = new ShaderEngine(this.canvas);
    this.ui = new UIController();
    this.voice = new VoiceController();
    this.recorder = new VideoRecorder();

    this.currentStyle = 'none';
    this.running = false;
    this._raf = null;
  }

  async init() {
    /* init shader engine */
    if (!this.shader.init()) {
      this.loading.textContent = 'WebGL non supportato';
      return;
    }

    /* init UI */
    this.ui.init();
    this.ui.onStyleChange = (s) => this.switchStyle(s);
    this.ui.onIntensityChange = (v) => this.shader.setIntensity(v);
    this.ui.onCapture = () => this.captureSnapshot();
    this.ui.onRecordToggle = () => this.toggleRecording();
    this.ui.onCameraSwitch = () => this.switchCamera();
    this.ui.onVoiceToggle = () => this.toggleVoice();
    this.ui.onFullscreen = (fs) => this.handleFullscreen(fs);

    /* voice commands */
    this.voice.onCommand = (cmd) => this.handleVoiceCommand(cmd);

    /* recorder callback */
    this.recorder.onStop = () => this.ui.showNotification('Video salvato');

    /* exit button */
    document.getElementById('btn-exit').addEventListener('click', () => {
      window.location.href = '../index.html#projects';
    });

    /* double-tap to switch camera */
    let lastTap = 0;
    this.canvas.addEventListener('click', () => {
      const now = Date.now();
      if (now - lastTap < 300) this.switchCamera();
      lastTap = now;
    });

    /* start camera */
    try {
      await this.camera.start('user');
      this.applyMirror();
      this.loading.style.display = 'none';
      this.running = true;
      this._loop();
    } catch (err) {
      this.loading.textContent = 'Camera non accessibile: ' + err.message;
      console.error(err);
    }
  }

  _loop() {
    if (!this.running) return;
    this.shader.render(this.video);
    this._raf = requestAnimationFrame(() => this._loop());
  }

  applyMirror() {
    if (this.camera.isFront) {
      this.video.classList.add('mirror');
      this.canvas.classList.add('mirror');
    } else {
      this.video.classList.remove('mirror');
      this.canvas.classList.remove('mirror');
    }
  }

  switchStyle(name) {
    this.currentStyle = name;
    this.shader.setStyle(name);
    this.ui.setActiveStyle(name);
    this.ui.showNotification(name === 'none' ? 'Originale' : this._styleLabel(name));
  }

  _styleLabel(name) {
    const labels = {
      vangogh: 'Van Gogh',
      picasso: 'Picasso',
      monet: 'Monet',
      hokusai: 'Hokusai',
    };
    return labels[name] || name;
  }

  async switchCamera() {
    this.loading.style.display = 'block';
    this.loading.textContent = 'Cambio camera...';
    try {
      await this.camera.switchCamera();
      this.applyMirror();
      this.loading.style.display = 'none';
      this.ui.showNotification(this.camera.isFront ? 'Frontale' : 'Posteriore');
    } catch (err) {
      this.loading.textContent = 'Errore: ' + err.message;
    }
  }

  captureSnapshot() {
    /* draw styled canvas to temp canvas for download */
    const tmp = document.createElement('canvas');
    tmp.width = this.canvas.width;
    tmp.height = this.canvas.height;
    const ctx = tmp.getContext('2d');

    /* mirror if front camera */
    if (this.camera.isFront) {
      ctx.translate(tmp.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(this.canvas, 0, 0);

    tmp.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      a.href = url;
      a.download = `rave_${ts}.jpg`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      this.ui.showNotification('Scatto salvato');
    }, 'image/jpeg', 0.92);
  }

  toggleRecording() {
    /* mirror-aware recording: use a temp canvas if front camera */
    if (this.recorder.recording) {
      this.recorder.stop();
      this.ui.setRecording(false);
      this.ui.showNotification('Registrazione fermata');
      return;
    }

    let recordCanvas = this.canvas;
    if (this.camera.isFront) {
      /* create mirrored canvas for recording */
      const tmp = document.createElement('canvas');
      tmp.width = this.canvas.width;
      tmp.height = this.canvas.height;
      const ctx = tmp.getContext('2d');

      /* mirror loop */
      const mirrorLoop = () => {
        if (!this.recorder.recording) return;
        ctx.save();
        ctx.translate(tmp.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(this.canvas, 0, 0);
        ctx.restore();
        requestAnimationFrame(mirrorLoop);
      };
      mirrorLoop();
      recordCanvas = tmp;
    }

    this.recorder.start(recordCanvas);
    this.ui.setRecording(true);
    this.ui.showNotification('Registrazione avviata');
  }

  toggleVoice() {
    const active = this.voice.toggle();
    this.ui.setVoice(active);
    this.ui.showNotification(active ? 'Comandi vocali attivi' : 'Comandi vocali disattivati');
  }

  handleVoiceCommand(cmd) {
    if (cmd === 'more') {
      const slider = document.getElementById('intensity');
      const newVal = Math.min(1, parseFloat(slider.value) + 0.1);
      slider.value = newVal;
      slider.dispatchEvent(new Event('input'));
      this.ui.showNotification('Intensità: ' + Math.round(newVal * 100) + '%');
    } else if (cmd === 'less') {
      const slider = document.getElementById('intensity');
      const newVal = Math.max(0, parseFloat(slider.value) - 0.1);
      slider.value = newVal;
      slider.dispatchEvent(new Event('input'));
      this.ui.showNotification('Intensità: ' + Math.round(newVal * 100) + '%');
    } else if (cmd === 'capture') {
      this.captureSnapshot();
    } else if (cmd === 'record') {
      this.toggleRecording();
    } else if (cmd === 'front') {
      if (!this.camera.isFront) this.switchCamera();
    } else if (cmd === 'back') {
      if (this.camera.isFront) this.switchCamera();
    } else if (cmd === 'fullscreen') {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen();
      }
    } else if (['vangogh', 'picasso', 'monet', 'hokusai', 'none'].includes(cmd)) {
      this.switchStyle(cmd);
    }
  }

  handleFullscreen(fs) {
    this.ui.showNotification(fs ? 'Schermo intero' : 'Esci schermo intero');
  }
}

/* ── Boot ── */
document.addEventListener('DOMContentLoaded', () => {
  const app = new RAVE();
  app.init();
});
