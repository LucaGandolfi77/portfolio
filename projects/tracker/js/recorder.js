/** recorder.js — registrazione video del canvas filtrato + time-lapse. */

const MIME = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm', 'video/mp4'];

export function createRecorder({ onStop = () => {} } = {}) {
  let recorder = null, chunks = [], interval = null, frameCount = 0;

  function download(blob, extension) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `camera-tracker-${Date.now()}.${extension}`;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => { link.remove(); URL.revokeObjectURL(url); }, 500);
  }

  return {
    get recording() { return !!recorder && recorder.state === 'recording'; },
    get timelapse() { return !!interval; },
    start(canvas, { timelapseMs = 0, onFrame = null } = {}) {
      if (this.recording || !canvas.captureStream || typeof MediaRecorder === 'undefined') return false;
      const mime = MIME.find((type) => { try { return MediaRecorder.isTypeSupported(type); } catch (e) { return false; } });
      if (!mime) return false;
      chunks = [];
      frameCount = 0;
      try {
        const stream = canvas.captureStream(timelapseMs ? 2 : 30);
        recorder = new MediaRecorder(stream, { mimeType: mime });
      } catch (e) { return false; }
      recorder.ondataavailable = (event) => { if (event.data.size) chunks.push(event.data); };
      recorder.onstop = () => {
        if (chunks.length) download(new Blob(chunks, { type: mime }), mime.includes('mp4') ? 'mp4' : 'webm');
        recorder = null;
        onStop();
      };
      recorder.start(250);
      if (timelapseMs > 0) {
        interval = setInterval(() => {
          if (onFrame) onFrame(++frameCount);
        }, timelapseMs);
      }
      return true;
    },
    stop() {
      if (interval) { clearInterval(interval); interval = null; }
      if (recorder && recorder.state !== 'inactive') recorder.stop();
    }
  };
}
