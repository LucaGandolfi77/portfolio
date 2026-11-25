/* emotion-worker.js — ViT FER in Web Worker (Transformers.js) */
import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.3.1/+esm';

env.allowLocalModels = false;
env.useBrowserCache = true;

const MODEL = 'Xenova/facial_emotions_image_detection';
let classifier = null;

async function load() {
  if (classifier) return;
  // WASM diretto: in Transformers.js 3.3.1 un tentativo WebGPU fallito
  // avvelena la promessa condivisa e impedisce il fallback WASM nello stesso worker.
  classifier = await pipeline('image-classification', MODEL, {
    dtype: 'q8',
    device: 'wasm',
    progress_callback: (event) => {
      if (event.status === 'progress' && event.total) {
        self.postMessage({ type: 'progress', pct: (event.loaded / event.total) * 100 });
      } else if (event.status === 'done') {
        self.postMessage({ type: 'progress', pct: 100 });
      }
    }
  });
  self.postMessage({ type: 'ready', device: 'wasm' });
}

self.onmessage = async (event) => {
  const message = event.data || {};
  try {
    if (message.type === 'load') {
      await load();
    } else if (message.type === 'classify') {
      if (!classifier) await load();
      let output;
      try { output = await classifier(message.dataUrl, { top_k: 7 }); }
      catch (e) {
        const blob = await (await fetch(message.dataUrl)).blob();
        output = await classifier(blob, { top_k: 7 });
      }
      const rows = Array.isArray(output) ? output : [output];
      self.postMessage({
        type: 'result',
        id: message.id,
        labels: rows.map((row) => String(row.label || '')),
        probabilities: rows.map((row) => Number(row.score) || 0)
      });
    }
  } catch (error) {
    self.postMessage({
      type: 'error',
      id: message.id || null,
      message: String(error && error.message || error)
    });
  }
};
