/* Neural Style Studio — ONNX Runtime Web engine (lazy, cached, cancellable) */

import { toNchw, fromNchw } from './pipeline.js';

const ORT_URL = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.21.0/dist/ort.all.min.mjs';
const WASM_PATH = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.21.0/dist/';
const CACHE = 'nst-models-v2';

async function cachedModel(url, onProgress = () => {}) {
  const cache = await caches.open(CACHE);
  const hit = await cache.match(url);
  if (hit) return await hit.arrayBuffer();

  const res = await fetch(url);
  if (!res.ok) throw new Error(`model HTTP ${res.status}`);
  const total = Number(res.headers.get('content-length')) || 0;
  const reader = res.body && res.body.getReader ? res.body.getReader() : null;
  let bytes;
  if (reader) {
    const chunks = [];
    let received = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      received += value.length;
      onProgress(total ? Math.min(1, received / total) : 0);
    }
    bytes = new Uint8Array(received);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  } else {
    bytes = new Uint8Array(await res.arrayBuffer());
    onProgress(1);
  }
  try { await cache.put(url, new Response(bytes.slice().buffer)); }
  catch (e) { console.warn('[NST] model cache skipped', e); }
  return bytes.buffer;
}

/* Ridimensiona un buffer RGBA quadrato con il canvas (qualità alta). */
async function resampleRgba(rgba, from, to) {
  const src = document.createElement('canvas');
  src.width = from; src.height = from;
  src.getContext('2d').putImageData(new ImageData(new Uint8ClampedArray(rgba), from, from), 0, 0);
  const dst = document.createElement('canvas');
  dst.width = to; dst.height = to;
  const cx = dst.getContext('2d');
  cx.imageSmoothingEnabled = true;
  cx.imageSmoothingQuality = 'high';
  cx.drawImage(src, 0, 0, to, to);
  return cx.getImageData(0, 0, to, to).data;
}

export class NeuralEngine {
  constructor() {
    this.ort = null;
    this.sessions = new Map();
    this.busy = false;
  }

  get ready() { return !!this.ort; }

  async loadRuntime() {
    if (this.ort) return this.ort;
    this.ort = await import(/* @vite-ignore */ ORT_URL);
    if (this.ort.env && this.ort.env.wasm) this.ort.env.wasm.wasmPaths = WASM_PATH;
    return this.ort;
  }

  async loadModel(style, onProgress = () => {}) {
    if (this.sessions.has(style.id)) return this.sessions.get(style.id);
    const ort = await this.loadRuntime();
    const buffer = await cachedModel(style.model, onProgress);
    let session;
    try {
      session = await ort.InferenceSession.create(buffer, { executionProviders: ['webgpu', 'wasm'] });
    } catch (e) {
      console.warn('[NST] WebGPU provider unavailable, using WASM', e);
      session = await ort.InferenceSession.create(buffer, { executionProviders: ['wasm'] });
    }
    this.sessions.set(style.id, session);
    return session;
  }

  async stylize(rgba, size, style, onProgress = () => {}) {
    if (this.busy) throw new Error('busy');
    this.busy = true;
    try {
      const ort = await this.loadRuntime();
      const session = await this.loadModel(style, onProgress);
      const inputName = session.inputNames[0];
      const key = session.outputNames[0];

      // Una passata alla dimensione data: se il modello e' a dimensione fissa,
      // ORT risponde con "Expected: N" (es. 224) e non accetta altro.
      const pass = async (dim) => {
        const work = dim === size ? rgba : await resampleRgba(rgba, size, dim);
        const tensor = new ort.Tensor('float32', toNchw(work, dim), [1, 3, dim, dim]);
        const output = await session.run({ [inputName]: tensor });
        const out = fromNchw(output[key || Object.keys(output)[0]].data, dim);
        return dim === size ? out : resampleRgba(out, dim, size);
      };

      try {
        return await pass(size);
      } catch (e) {
        const m = /Expected:\s*(\d+)/.exec(String(e && e.message));
        const fixed = m ? Number(m[1]) : 0;
        if (!fixed || fixed === size) throw e;
        return pass(fixed);
      }
    } finally {
      this.busy = false;
    }
  }
}
