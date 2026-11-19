/* Offline Library — small offline Markdown renderer (escape-first, no dependencies) */

export function escapeHtml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function safeUrl(url) {
  return /^(https?:|mailto:|\/|#|\.\/)/i.test(url) ? url : '#';
}

function inline(text) {
  return text
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>')
    .replace(/~~([^~]+)~~/g, '<del>$1</del>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (m, label, url) =>
      `<a href="${safeUrl(url)}" target="_blank" rel="noopener noreferrer">${label}</a>`);
}

export function renderMarkdown(source) {
  const lines = escapeHtml(String(source || '').replace(/\r\n?/g, '\n')).split('\n');
  const out = [];
  let paragraph = [];
  let i = 0;

  const flush = () => {
    if (paragraph.length) {
      out.push('<p>' + paragraph.join('<br>') + '</p>');
      paragraph = [];
    }
  };

  while (i < lines.length) {
    const line = lines[i];

    if (/^\s*```/.test(line)) {
      flush();
      const lang = line.trim().slice(3).trim().replace(/[^a-z0-9-]/gi, '');
      i++;
      const code = [];
      while (i < lines.length && !/^\s*```/.test(lines[i])) code.push(lines[i++]);
      i++;
      out.push(`<pre><code${lang ? ` class="lang-${lang}"` : ''}>${code.join('\n')}</code></pre>`);
      continue;
    }

    if (/^\s*$/.test(line)) { flush(); i++; continue; }

    const heading = line.match(/^\s*(#{1,6})\s+(.*)$/);
    if (heading) {
      flush();
      const n = heading[1].length;
      out.push(`<h${n}>${inline(heading[2])}</h${n}>`);
      i++;
      continue;
    }

    if (/^\s*([-*_])\1{2,}\s*$/.test(line)) {
      flush(); out.push('<hr>'); i++; continue;
    }

    if (/^\s*&gt;\s?/.test(line)) {
      flush();
      const quote = [];
      while (i < lines.length && /^\s*&gt;\s?/.test(lines[i])) {
        quote.push(lines[i].replace(/^\s*&gt;\s?/, ''));
        i++;
      }
      out.push('<blockquote>' + quote.map(inline).join('<br>') + '</blockquote>');
      continue;
    }

    if (/^\s*[-*+]\s+/.test(line)) {
      flush();
      const items = [];
      while (i < lines.length && /^\s*[-*+]\s+/.test(lines[i])) {
        items.push(inline(lines[i].replace(/^\s*[-*+]\s+/, '')));
        i++;
      }
      out.push('<ul>' + items.map(x => `<li>${x}</li>`).join('') + '</ul>');
      continue;
    }

    if (/^\s*\d+\.\s+/.test(line)) {
      flush();
      const items = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(inline(lines[i].replace(/^\s*\d+\.\s+/, '')));
        i++;
      }
      out.push('<ol>' + items.map(x => `<li>${x}</li>`).join('') + '</ol>');
      continue;
    }

    paragraph.push(inline(line));
    i++;
  }
  flush();
  return out.join('\n');
}

export function textStats(text) {
  const source = String(text || '');
  const words = (source.match(/\S+/g) || []).length;
  return {
    chars: source.length,
    words,
    pages: Math.max(1, Math.ceil(words / 700)),
    lines: source.split('\n').length
  };
}
