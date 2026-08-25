/* Smile Detection — UI, Snapshot, Video Recording */

class UIController {
  constructor() {
    this.onCapture = null;
    this.onRecordToggle = null;
    this.onCameraSwitch = null;
    this.onFullscreen = null;
  }

  init() {
    const capBtn = document.getElementById('btn-capture');
    if (capBtn) capBtn.addEventListener('click', () => { if (this.onCapture) this.onCapture(); });

    const recBtn = document.getElementById('btn-record');
    if (recBtn) recBtn.addEventListener('click', () => { if (this.onRecordToggle) this.onRecordToggle(); });

    const camBtn = document.getElementById('btn-camera');
    if (camBtn) camBtn.addEventListener('click', () => { if (this.onCameraSwitch) this.onCameraSwitch(); });

    const fsBtn = document.getElementById('btn-fullscreen');
    if (fsBtn) fsBtn.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen();
      }
    });
  }

  updateScores(data) {
    if (!data) {
      this._setScore('smile', 0);
      this._setScore('whiteness', 0);
      this._setScore('alignment', 0);
      this._setOverall(0, 0);
      return;
    }

    this._setScore('smile', data.smile);
    this._setScore('whiteness', data.whiteness);
    this._setScore('alignment', data.alignment);
    this._setOverall(data.overall, this._overallStars(data.overall));
  }

  _setScore(key, val) {
    const num = document.getElementById('val-' + key);
    const bar = document.getElementById('bar-' + key);
    if (num) num.textContent = val + '%';
    if (bar) bar.style.width = val + '%';
  }

  _setOverall(score, stars) {
    const numEl = document.getElementById('val-overall');
    const starEl = document.getElementById('stars-overall');
    if (numEl) numEl.textContent = score;
    if (starEl) {
      starEl.innerHTML = '';
      for (let i = 0; i < 5; i++) {
        const s = document.createElement('span');
        s.className = i < stars ? 'star filled' : 'star';
        s.textContent = '★';
        starEl.appendChild(s);
      }
    }
  }

  _overallStars(score) {
    if (score >= 90) return 5;
    if (score >= 75) return 4;
    if (score >= 55) return 3;
    if (score >= 30) return 2;
    return 1;
  }

  setRecording(active) {
    const btn = document.getElementById('btn-record');
    if (btn) {
      btn.classList.toggle('recording', active);
      btn.title = active ? 'Stop Recording' : 'Record Video';
    }
  }

  showNotification(msg, duration) {
    let el = document.getElementById('toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'toast';
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(el._timer);
    el._timer = setTimeout(() => el.classList.remove('show'), duration || 2000);
  }

  setLoading(show, msg) {
    const el = document.getElementById('loading');
    if (el) {
      el.style.display = show ? 'block' : 'none';
      if (msg) el.textContent = msg;
    }
  }
}

/* ── Video Recorder ── */
class VideoRecorder {
  constructor() {
    this.recorder = null;
    this.chunks = [];
    this.recording = false;
    this.onStop = null;
  }

  start(canvas) {
    if (this.recording) { this.stop(); return; }

    const stream = canvas.captureStream(30);
    const mimeTypes = [
      'video/webm;codecs=vp9',
      'video/webm;codecs=vp8',
      'video/webm',
      'video/mp4',
    ];
    let mime = '';
    for (const mt of mimeTypes) {
      if (MediaRecorder.isTypeSupported(mt)) { mime = mt; break; }
    }
    if (!mime) return;

    this.recorder = new MediaRecorder(stream, { mimeType: mime });
    this.chunks = [];

    this.recorder.ondataavailable = (e) => {
      if (e.data.size > 0) this.chunks.push(e.data);
    };

    this.recorder.onstop = () => {
      this.recording = false;
      const blob = new Blob(this.chunks, { type: mime });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      a.href = url;
      a.download = `smile_${ts}.webm`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      if (this.onStop) this.onStop();
    };

    this.recorder.start(100);
    this.recording = true;
  }

  stop() {
    if (this.recorder && this.recording) this.recorder.stop();
  }

  toggle(canvas) {
    if (this.recording) this.stop();
    else this.start(canvas);
    return this.recording;
  }
}
