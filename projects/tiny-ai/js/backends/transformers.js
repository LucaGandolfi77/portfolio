/* Tiny AI — Transformers.js backend (ONNX, WebGPU → WASM fallback) */
import { MODELS } from '../config.js';

let pipe = null, pipeModel = null;
const UNSUPPORTED = new Set(['gpt_neo','gpt_neox','bart','t5','blenderbot']);

export async function generate({ messages, modelId, maxTokens, device, onProgress, signal }) {
  const lib = await import('https://cdn.jsdelivr.net/npm/@huggingface/transformers@4');
  const { pipeline, env } = lib;
  env.allowLocalModels = false;

  const want = device || 'auto';
  const hasGpu = typeof navigator !== 'undefined' && !!navigator.gpu;
  const devices = hasGpu && want !== 'wasm' ? ['webgpu', 'wasm'] : ['wasm'];
  /* q2f16 added for newer repos (e.g. gemma-4 E2B QAT), q8f16 as last resort. */
  const dtypes = ['q4', 'q4f16', 'fp16', 'q2f16', 'q8f16'];

  if (!pipe || pipeModel !== modelId) {
    const meta = MODELS.transformersjs.find(m => m.id === modelId);
    onProgress?.(`Caricamento ${meta?.label || modelId}…`);
    let lastError = null;

    try {
      const cfg = await fetch(`https://huggingface.co/${modelId}/resolve/main/config.json`, { signal });
      if (cfg.ok) {
        const type = (await cfg.json()).model_type;
        if (UNSUPPORTED.has(type)) throw new Error(`Architettura ${type} non supportata`);
      }
    } catch (e) { if (/non supportata/.test(e.message)) throw e; }

    for (const dev of devices) {
      for (const dtype of dtypes) {
        try {
          onProgress?.(`${dev} · ${dtype} — download in corso…`);
          pipe = await pipeline('text-generation', modelId, {
            dtype, device: dev,
            progress_callback: r => {
              if (r.status === 'progress' && typeof r.progress === 'number') {
                onProgress?.(`Download ${r.file || ''} ${Math.round(r.progress)}%`);
              } else if (r.status === 'ready') onProgress?.('Modello pronto');
            }
          });
          pipeModel = modelId;
          lastError = null;
          break;
        } catch (e) {
          lastError = e;
          try { await pipe?.dispose?.(); } catch (_) {}
          pipe = null; pipeModel = null;
        }
      }
      if (pipe) break;
    }
    if (!pipe) throw new Error(lastError?.message || 'Impossibile caricare il modello');
  }

  /* Prompt construction: use chat template when available, else plain text. */
  let input = messages;
  const tok = pipe.tokenizer;
  if (!tok || typeof tok.chat_template !== 'string' || !tok.chat_template.length) {
    input = messages.map(m => m.content).join('\n') + '\n';
  }
  onProgress?.('Generazione…');
  const out = await pipe(input, { max_new_tokens: maxTokens, return_full_text: false });
  const text = Array.isArray(out) && out[0] ? (out[0].generated_text ?? String(out[0])) : String(out);
  return String(text).trim();
}

export function clear() { pipe = null; pipeModel = null; }
