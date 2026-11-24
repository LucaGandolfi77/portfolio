/**
 * recorder.js — registrazione video del canvas filtrato.
 */

const MIME_TYPES = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm', 'video/mp4'];

export class VideoRecorder {
  constructor(onStop = () => {}) {
    this.recorder = null;
    this.chunks = [];
    this.recording = false;
    this.onStop = onStop;
  }

  start(canvas) {
    if (this.recording || !canvas.captureStream) return false;
    const supported = typeof MediaRecorder !== 'undefined';
    if (!supported) return false;
    const mime = MIME_TYPES.find((type) => {
      try { return MediaRecorder.isTypeSupported(type); } catch (e) { return false; }
    });
    if (!mime) return false;
    const stream = canvas.captureStream(30);
    this.recorder = new MediaRecorder(stream, { mimeType: mime });
    this.chunks = [];
    this.recorder.ondataavailable = (event) => { if (event.data.size) this.chunks.push(event.data); };
    this.recorder.onstop = () => {
      this.recording = false;
      if (this.chunks.length) {
        const blob = new Blob(this.chunks, { type: mime });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `rave_${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}.webm`;
        document.body.appendChild(link);
        link.click();
        setTimeout(() => { link.remove(); URL.revokeObjectURL(url); }, 500);
      }
      this.onStop();
    };
    this.recorder.start(100);
    this.recording = true;
    return true;
  }

  stop() {
    if (this.recorder && this.recording) this.recorder.stop();
  }
}
