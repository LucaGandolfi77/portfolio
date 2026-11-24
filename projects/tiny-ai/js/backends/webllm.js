/* Tiny AI — WebLLM / WebGPU backend */
let engine = null, current = null;

export async function generate({ messages, modelId, maxTokens, onProgress, signal }) {
  const { CreateMLCEngine, prebuiltAppConfig } = await import('https://esm.run/@mlc-ai/web-llm');
  if (!engine || current !== modelId) {
    onProgress?.(engine ? 'Cambio modello…' : `Caricamento ${modelId}…`);
    const opts = { appConfig: prebuiltAppConfig, initProgressCallback: r => onProgress?.(r.text || 'Caricamento…') };
    if (engine) await engine.reload(modelId, opts);
    else engine = await CreateMLCEngine(modelId, opts);
    current = modelId;
  }
  onProgress?.('Generazione…');
  const reply = await engine.chat.completions.create({ messages, max_tokens: maxTokens });
  return reply.choices?.[0]?.message?.content || 'No response';
}

export function clear() { engine = null; current = null; }
