/** recorder.js — registrazione video e export. */

const MIME = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'];

function download(url, filename, revoke = true) {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  setTimeout(() => { link.remove(); if (revoke) URL.revokeObjectURL(url); }, 500);
}

export function createRecorder({ onStop = () => {} } = {}) {
  let recorder = null, chunks = [];

  return {
    get recording() { return !!recorder && recorder.state === 'recording'; },
    start(canvas) {
      if (this.recording || !canvas.captureStream || typeof MediaRecorder === 'undefined') return false;
      const mime = MIME.find((type) => { try { return MediaRecorder.isTypeSupported(type); } catch (e) { return false; } });
      if (!mime) return false;
      try { recorder = new MediaRecorder(canvas.captureStream(30), { mimeType: mime }); }
      catch (e) { return false; }
      chunks = [];
      recorder.ondataavailable = (event) => { if (event.data.size) chunks.push(event.data); };
      recorder.onstop = () => {
        if (chunks.length) download(URL.createObjectURL(new Blob(chunks, { type: mime })), `puppeteer-${Date.now()}.webm`);
        recorder = null;
        onStop();
      };
      recorder.start(200);
      return true;
    },
    stop() { if (recorder && recorder.state !== 'inactive') recorder.stop(); },
    exportPNG(canvas) { download(canvas.toDataURL('image/png'), `puppeteer-${Date.now()}.png`, false); }
  };
}
