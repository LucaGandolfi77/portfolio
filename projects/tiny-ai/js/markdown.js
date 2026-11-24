/* Tiny AI — minimal safe markdown renderer (no dependency) */
export function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[c]);
}

export function render(text) {
  const safe = escapeHtml(text);
  const blocks = [];
  safe.split(/```/).forEach((part, i) => {
    if (i % 2 === 1) {
      const nl = part.indexOf('\n');
      const lang = nl >= 0 ? part.slice(0, nl).trim() : '';
      const code = nl >= 0 ? part.slice(nl + 1) : part;
      blocks.push(`<pre class="code-block"><div class="code-head"><span>${escapeHtml(lang || 'code')}</span><button data-copy>copy</button></div><code>${code.replace(/^\n|\n$/g, '')}</code></pre>`);
    } else {
      blocks.push(part.split(/\n\n+/).map(p => {
        if (/^#{1,4}\s/.test(p)) {
          const m = p.match(/^(#{1,4})\s([\s\S]+)$/);
          const lvl = m[1].length;
          return `<h${lvl}>${m[2]}</h${lvl}>`;
        }
        return `<p>${p.replace(/\n/g, '<br>')
          .replace(/`([^`]+)`/g, '<code>$1</code>')
          .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
          .replace(/\*([^*]+)\*/g, '<em>$1</em>')}</p>`;
      }).join(''));
    }
  });
  return blocks.join('');
}
