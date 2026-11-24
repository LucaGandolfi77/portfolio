/* Tiny AI — advanced local backends (Flask server / WebLLM WebSocket) */

export async function serverGenerate({ prompt, maxTokens, signal }) {
  const res = await fetch('/generate', {
    method: 'POST', signal,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, max_length: maxTokens })
  });
  if (!res.ok) throw new Error('Server HTTP ' + res.status);
  const data = await res.json();
  return data.generated || data.error || 'No output';
}

export function socketGenerate({ prompt, maxTokens, signal }) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket('ws://127.0.0.1:11434/');
    const finish = (fn, v) => { clearTimeout(timer); try { ws.close(); } catch (e) {} fn(v); };
    const timer = setTimeout(() => finish(reject, new Error('WebSocket timeout')), 20000);
    ws.onopen = () => ws.send(JSON.stringify({ type: 'generate', input: prompt, parameters: { max_new_tokens: maxTokens } }));
    ws.onmessage = e => {
      try {
        const d = JSON.parse(e.data);
        const text = d.result || d.text || d.output;
        finish(resolve, text || (d.type === 'generation_chunk' && d.finished ? d.text : JSON.stringify(d)));
      } catch (err) { finish(resolve, e.data); }
    };
    ws.onerror = () => finish(reject, new Error('WebSocket error'));
    signal?.addEventListener('abort', () => finish(reject, new DOMException('Aborted', 'AbortError')));
  });
}
