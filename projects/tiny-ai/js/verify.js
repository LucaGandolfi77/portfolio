/* Tiny AI — live model verification against HF API and WebLLM config */

import { HF_API, WEBLLM_CONFIG, MODELS } from './config.js';

async function json(url, signal) {
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  return res.json();
}

export async function verifyTransformersModel(id, opts = {}) {
  try {
    const meta = await json(HF_API + id, opts.signal);
    const configRes = await fetch(`https://huggingface.co/${id}/resolve/main/config.json`, { signal: opts.signal });
    const modelType = configRes.ok ? (await configRes.json()).model_type || '' : '';
    const tree = await json(`https://huggingface.co/api/models/${id}/tree/main/onnx`, opts.signal);
    const hasOnnx = Array.isArray(tree) && tree.some(f => /model.*\.onnx$/.test(f.path || ''));
    return { id, ok: !!meta.id && hasOnnx, modelType, hasOnnx, pipeline: meta.pipeline_tag || '' };
  } catch (e) {
    return { id, ok: false, error: e.message || 'unreachable' };
  }
}

export async function verifyWebllmModel(id, opts = {}) {
  try {
    const res = await fetch(WEBLLM_CONFIG, { signal: opts.signal });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const text = await res.text();
    const ok = text.includes(`"${id}"`) || text.includes(`model_id: "${id}"`);
    return { id, ok };
  } catch (e) { return { id, ok: false, error: e.message || 'unreachable' }; }
}

export async function verifyOpenRouterKey(opts = {}) {
  try {
    const res = await fetch('https://openrouter.ai/api/v1/models', { signal: opts.signal });
    return { ok: res.ok, status: res.status };
  } catch (e) { return { ok: false, error: e.message }; }
}

export async function verifyAll(backend = 'transformersjs', opts = {}) {
  const list = MODELS[backend] || [];
  if (backend === 'webgpu') return Promise.all(list.map(m => verifyWebllmModel(m.id, opts)));
  if (backend === 'openrouter') return [await verifyOpenRouterKey(opts)];
  return Promise.all(list.map(m => verifyTransformersModel(m.id, opts)));
}
