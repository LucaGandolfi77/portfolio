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
      const tensor = new ort.Tensor('float32', toNchw(rgba, size), [1, 3, size, size]);
      const output = await session.run({ [inputName]: tensor });
      const key = session.outputNames[0] || Object.keys(output)[0];
      return fromNchw(output[key].data, size);
    } finally {
      this.busy = false;
    }
  }
}
