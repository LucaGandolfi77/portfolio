/* RAVE — UI Controller, Voice Commands, Video Recording */

class UIController {
  constructor() {
    this.onStyleChange = null;
    this.onIntensityChange = null;
    this.onCapture = null;
    this.onRecordToggle = null;
    this.onCameraSwitch = null;
    this.onVoiceToggle = null;
    this.onFullscreen = null;
  }

  init() {
    /* style buttons */
    document.querySelectorAll('.style-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.setActiveStyle(btn.dataset.style);
        if (this.onStyleChange) this.onStyleChange(btn.dataset.style);
      });
    });

    /* intensity slider */
    const slider = document.getElementById('intensity');
    const label = document.getElementById('intensity-val');
    if (slider) {
      slider.addEventListener('input', () => {
        const v = parseFloat(slider.value);
        if (label) label.textContent = Math.round(v * 100) + '%';
        if (this.onIntensityChange) this.onIntensityChange(v);
      });
    }

    /* capture button */
    const capBtn = document.getElementById('btn-capture');
    if (capBtn) capBtn.addEventListener('click', () => { if (this.onCapture) this.onCapture(); });

    /* record button */
    const recBtn = document.getElementById('btn-record');
    if (recBtn) recBtn.addEventListener('click', () => { if (this.onRecordToggle) this.onRecordToggle(); });

    /* camera switch */
    const camBtn = document.getElementById('btn-camera');
    if (camBtn) camBtn.addEventListener('click', () => { if (this.onCameraSwitch) this.onCameraSwitch(); });

    /* voice button */
    const voiceBtn = document.getElementById('btn-voice');
    if (voiceBtn) voiceBtn.addEventListener('click', () => { if (this.onVoiceToggle) this.onVoiceToggle(); });

    /* fullscreen */
    const fsBtn = document.getElementById('btn-fullscreen');
    if (fsBtn) fsBtn.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
        if (this.onFullscreen) this.onFullscreen(true);
      } else {
        document.exitFullscreen();
        if (this.onFullscreen) this.onFullscreen(false);
      }
    });
  }

  setActiveStyle(name) {
    document.querySelectorAll('.style-btn').forEach((b) => {
      b.classList.toggle('active', b.dataset.style === name);
    });
  }

  setRecording(active) {
    const btn = document.getElementById('btn-record');
    if (btn) {
      btn.classList.toggle('recording', active);
      btn.title = active ? 'Stop Recording' : 'Record Video';
    }
  }

  setVoice(active) {
    const btn = document.getElementById('btn-voice');
    if (btn) {
      btn.classList.toggle('listening', active);
      btn.title = active ? 'Stop Voice' : 'Voice Commands';
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
}

/* ── Voice Controller ── */
class VoiceController {
  constructor() {
    this.recognition = null;
    this.listening = false;
    this.onCommand = null;
    this._supported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  }

  start() {
    if (!this._supported) {
      console.warn('Speech recognition not supported');
      return false;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = false;
    this.recognition.lang = 'it-IT';

    this.recognition.onresult = (event) => {
      const last = event.results[event.results.length - 1];
      if (last.isFinal) {
        const transcript = last[0].transcript.trim().toLowerCase();
        this._process(transcript);
      }
    };

    this.recognition.onerror = (e) => {
      if (e.error !== 'no-speech') console.warn('Speech error:', e.error);
    };

    this.recognition.onend = () => {
      /* auto-restart if still supposed to be listening */
      if (this.listening) {
        try { this.recognition.start(); } catch (_) {}
      }
    };

    try {
      this.recognition.start();
      this.listening = true;
      return true;
    } catch (_) {
      return false;
    }
  }

  stop() {
    this.listening = false;
    if (this.recognition) {
      try { this.recognition.stop(); } catch (_) {}
    }
  }

  toggle() {
    if (this.listening) { this.stop(); return false; }
    return this.start();
  }

  _process(text) {
    let cmd = null;

    if (text.includes('van gogh') || text.includes('vangogh') || text.includes('vangoc')) cmd = 'vangogh';
    else if (text.includes('picasso') || text.includes('picassa')) cmd = 'picasso';
    else if (text.includes('monet') || text.includes('mone')) cmd = 'monet';
    else if (text.includes('hokusai') || text.includes('hokusay')) cmd = 'hokusai';
    else if (text.includes('none') || text.includes('originale') || text.includes('normale')) cmd = 'none';
    else if (text.includes('più') || text.includes('piu') || text.includes('more') || text.includes('aumenta')) cmd = 'more';
    else if (text.includes('meno') || text.includes('less') || text.includes('diminuisci') || text.includes('riduci')) cmd = 'less';
    else if (text.includes('scatta') || text.includes('capture') || text.includes('foto') || text.includes('snapshot')) cmd = 'capture';
    else if (text.includes('registra') || text.includes('record') || text.includes('video')) cmd = 'record';
    else if (text.includes('anteriore') || text.includes('front') || text.includes('frontale')) cmd = 'front';
    else if (text.includes('posteriore') || text.includes('back') || text.includes('retro')) cmd = 'back';
    else if (text.includes('schermo intero') || text.includes('fullscreen') || text.includes('pieno')) cmd = 'fullscreen';

    if (cmd && this.onCommand) this.onCommand(cmd, text);
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
    if (!mime) { console.warn('No supported recording MIME type'); return; }

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
      a.download = `rave_${ts}.webm`;
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
    if (this.recorder && this.recording) {
      this.recorder.stop();
    }
  }

  toggle(canvas) {
    if (this.recording) this.stop();
    else this.start(canvas);
    return this.recording;
  }
}
