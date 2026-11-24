/**
 * emotion.js — client del worker ViT FER con gestione dei frame in volo.
 */

export function createEmotionClient({ onStatus = () => {}, onProgress = () => {} } = {}) {
  const worker = new Worker(new URL('./emotion-worker.js', import.meta.url), { type: 'module' });
  let ready = false, busy = false, sequence = 0;
  const pending = new Map();

  worker.onmessage = (event) => {
    const message = event.data || {};
    if (message.type === 'progress') onProgress(message.pct);
    else if (message.type === 'ready') { ready = true; onStatus('ready', message.device); }
    else if (message.type === 'deviceFailed') onStatus('deviceFailed', message.device);
    else if (message.type === 'result' || message.type === 'error') {
      const resolve = pending.get(message.id);
      if (resolve) {
        pending.delete(message.id);
        resolve(message.type === 'error' ? null : message);
      }
      busy = false;
    }
  };
  worker.onerror = (error) => { onStatus('error', error.message); busy = false; };

  function load() {
    onStatus('loading');
    worker.postMessage({ type: 'load' });
  }

  function classify(dataUrl) {
    if (!ready || busy) return Promise.resolve(null);
    busy = true;
    const id = ++sequence;
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        if (pending.has(id)) { pending.delete(id); busy = false; resolve(null); }
      }, 5000);
      pending.set(id, (value) => { clearTimeout(timeout); resolve(value); });
      worker.postMessage({ type: 'classify', id, dataUrl });
    });
  }

  return {
    load, classify,
    get ready() { return ready; },
    get busy() { return busy; },
    dispose() { worker.terminate(); }
  };
}
