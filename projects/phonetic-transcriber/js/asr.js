/**
 * asr.js — gestione dei modelli Whisper via Transformers.js.
 */

const LIB_URL = 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.3.1/+esm';

export const MODELS = [
  { id: 'tiny', model: 'onnx-community/whisper-tiny', fallback: 'Xenova/whisper-tiny', label: 'Tiny · veloce', size: '~75 MB' },
  { id: 'base', model: 'onnx-community/whisper-base', fallback: 'Xenova/whisper-base', label: 'Base · bilanciato', size: '~150 MB' },
  { id: 'small', model: 'onnx-community/whisper-small', fallback: 'Xenova/whisper-small', label: 'Small · preciso', size: '~500 MB' }
];

export function createASR({ onStatus = () => {}, onProgress = () => {} } = {}) {
  let library = null, pipe = null, pending = null, loadedId = null;

  async function load(modelId = 'tiny') {
    if (pipe && loadedId === modelId) return pipe;
    if (pending) return pending;
    const spec = MODELS.find((item) => item.id === modelId) || MODELS[0];
    pending = (async () => {
      onStatus('loading');
      if (!library) library = await import(/* @vite-ignore */ LIB_URL);
      const build = (name, device) => library.pipeline('automatic-speech-recognition', name, {
        dtype: 'q8',
        device,
        progress_callback: (event) => {
          if (event.status === 'progress' && event.total) onProgress((event.loaded / event.total) * 100);
          else if (event.status === 'done') onProgress(100);
        }
      });
      onProgress(4);
      let created = null;
      for (const device of ['webgpu', 'wasm']) {
        for (const name of [spec.model, spec.fallback]) {
          try { created = await build(name, device); break; } catch (e) { /* prova il successivo */ }
        }
        if (created) break;
      }
      if (!created) throw new Error('Modello Whisper non disponibile');
      pipe = created;
      loadedId = spec.id;
      onProgress(100);
      onStatus('ready', { device: created.device || 'auto' });
      return pipe;
    })().catch((error) => {
      onStatus('error', { message: error.message });
      pending = null;
      throw error;
    });
    return pending;
  }

  async function transcribe(samples, { modelId = 'tiny', language = null } = {}) {
    const pipeline = await load(modelId);
    const options = { chunk_length_s: 8, stride_length_s: 2, task: 'transcribe' };
    if (language) options.language = language;
    const result = await pipeline(samples, options);
    return {
      text: String((result && result.text) || ''),
      language: (result && result.language) || (result && result.chunks && result.chunks[0] && result.chunks[0].language) || null
    };
  }

  return {
    MODELS, load, transcribe,
    get ready() { return !!pipe; },
    get loadedId() { return loadedId; }
  };
}
