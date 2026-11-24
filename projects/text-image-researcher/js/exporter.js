/** exporter.js — formati di export puri. */

import { TABS } from './results.js';

export function escapeCsv(value) {
  const text = String(value == null ? '' : value);
  return /[",\n]/.test(text) ? '"' + text.replace(/"/g, '""') + '"' : text;
}

export function escapeMarkdown(value) {
  return String(value == null ? '' : value).replace(/([\\`*_{}\[\]()#+\-.!|])/g, '\\$1').replace(/\s+/g, ' ').trim();
}

function rowsOf(results) {
  return TABS.flatMap((type) => (results[type] || []).map((item) => ({
    type,
    url: item.url || '',
    text: item.text || '',
    context: item.context || '',
    sourceUrl: item.sourceUrl || '',
    relevance: item.relevance || 0
  })));
}

export function toJSON(results, meta = {}) {
  return JSON.stringify({ meta, results }, null, 2);
}

export function toCSV(results, meta = {}) {
  const header = 'type,url,text,context,source_url,relevance\n';
  return header + rowsOf(results).map((row) => [
    row.type, row.url, row.text, row.context, row.sourceUrl, row.relevance
  ].map(escapeCsv).join(',')).join('\n') + (meta.url ? '\n' : '');
}

export function toMarkdown(results, meta = {}) {
  const lines = ['# Web Content Researcher', ''];
  if (meta.url) lines.push(`**URL:** ${meta.url}`, '');
  if (meta.keywords && meta.keywords.length) lines.push(`**Keywords:** ${meta.keywords.join(', ')}`, '');
  for (const type of TABS) {
    const items = results[type] || [];
    if (!items.length) continue;
    lines.push(`## ${type} (${items.length})`, '');
    for (const item of items) {
      const label = escapeMarkdown(item.text || item.name || item.url || '');
      const url = item.url ? ` (${item.url})` : '';
      lines.push(`- ${label}${url}${item.relevance ? ` — relevance ${item.relevance}` : ''}`);
    }
    lines.push('');
  }
  return lines.join('\n');
}

export function toHTML(results, meta = {}) {
  const escape = (value) => String(value == null ? '' : value).replace(/[&<>"']/g, (character) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
  const sections = TABS.filter((type) => (results[type] || []).length).map((type) => {
    const rows = results[type].map((item) => `<li>${escape(item.text || item.name || '')}${item.url ? ` <a href="${escape(item.url)}">${escape(item.url)}</a>` : ''}${item.relevance ? ` <small>${item.relevance}</small>` : ''}</li>`).join('');
    return `<h2>${type}</h2><ul>${rows}</ul>`;
  }).join('\n');
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Research results</title></head><body><h1>Web Content Researcher</h1>${meta.url ? `<p>${escape(meta.url)}</p>` : ''}${sections}</body></html>`;
}

export function exportData(format, results, meta = {}) {
  if (format === 'csv') return { text: toCSV(results, meta), mime: 'text/csv;charset=utf-8', ext: 'csv' };
  if (format === 'md') return { text: toMarkdown(results, meta), mime: 'text/markdown;charset=utf-8', ext: 'md' };
  if (format === 'html') return { text: toHTML(results, meta), mime: 'text/html;charset=utf-8', ext: 'html' };
  return { text: toJSON(results, meta), mime: 'application/json;charset=utf-8', ext: 'json' };
}
