/* Tiny AI — OpenRouter backend with SSE streaming */
import { OPENROUTER } from '../config.js';

export async function generate({ messages, modelId, maxTokens, apiKey, system, temperature, onToken, signal }) {
  if (!apiKey) throw new Error('Inserisci una chiave API OpenRouter (gratis su openrouter.ai/keys)');
  const body = {
    model: modelId,
    messages: system ? [{ role: 'system', content: system }, ...messages] : messages,
    max_tokens: maxTokens, temperature: temperature ?? 0.7, stream: true
  };
  const res = await fetch(OPENROUTER + '/chat/completions', {
    method: 'POST', signal,
    headers: {
      'Authorization': 'Bearer ' + apiKey,
      'Content-Type': 'application/json',
      'HTTP-Referer': location.href,
      'X-Title': 'Tiny AI Chat'
    },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'OpenRouter HTTP ' + res.status);
  }
  if (!res.body) {
    const data = await res.json();
    return data.choices?.[0]?.message?.content || 'No response';
  }

  const reader = res.body.getReader(), decoder = new TextDecoder();
  let buffer = '', full = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const payload = line.slice(6).trim();
      if (!payload || payload === '[DONE]') continue;
      try {
        const chunk = JSON.parse(payload);
        const delta = chunk.choices?.[0]?.delta?.content || '';
        if (delta) { full += delta; onToken?.(delta, full); }
      } catch (e) { /* ignore malformed chunk */ }
    }
  }
  return full || 'No response';
}
