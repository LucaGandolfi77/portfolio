/**
 * parser.js — estrazione degli elementi da un documento HTML.
 * Le funzioni pure sono testabili in Node; parseDocument richiede DOMParser.
 */

import { resolveUrl } from './url.js';

const BLOCK_TAGS = new Set(['P', 'DIV', 'LI', 'TD', 'TH', 'BLOCKQUOTE', 'FIGCAPTION', 'DT', 'DD', 'ARTICLE', 'SECTION', 'SUMMARY']);
const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE', 'SVG', 'MATH', 'NAV', 'FOOTER']);

export function cleanText(value) {
  return String(value == null ? '' : value)
    .replace(/\s+/g, ' ')
    .replace(/\u00a0/g, ' ')
    .trim();
}

export function escapeHtml(value) {
  return String(value == null ? '' : value).replace(/[&<>"']/g, (character) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
}

export function parseDocument(html, url) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(String(html || ''), 'text/html');
  ['href', 'src', 'data-src', 'poster'].forEach((attr) => {
    doc.querySelectorAll(`[${attr}]`).forEach((element) => {
      const raw = element.getAttribute(attr);
      if (!raw) return;
      const resolved = resolveUrl(raw, url);
      if (resolved) element.setAttribute(attr, resolved);
    });
  });
  return { doc, rawHtml: String(html || '') };
}

function contextOf(element) {
  const parent = element.parentElement;
  if (!parent) return '';
  return cleanText(parent.textContent || '').slice(0, 260);
}

function isSkipped(element) {
  let node = element.parentElement;
  while (node) {
    if (SKIP_TAGS.has(node.tagName)) return true;
    node = node.parentElement;
  }
  return false;
}

export function extractItems(doc, baseUrl, rawHtml = '') {
  const result = { links: [], images: [], text: [], headings: [], meta: [], source: [] };
  if (!doc) return result;

  doc.querySelectorAll('a[href]').forEach((element) => {
    const url = resolveUrl(element.getAttribute('href'), baseUrl);
    const text = cleanText(element.textContent || element.title || url);
    if (!url || !text && !element.getAttribute('aria-label')) return;
    result.links.push({ url, text: text || cleanText(element.getAttribute('aria-label')), context: contextOf(element), sourceUrl: baseUrl });
  });

  doc.querySelectorAll('img[src], img[data-src], source[srcset]').forEach((element) => {
    const raw = element.getAttribute('src') || element.getAttribute('data-src') || (element.getAttribute('srcset') || '').split(',')[0].trim().split(' ')[0];
    const url = resolveUrl(raw, baseUrl);
    if (!url) return;
    result.images.push({
      url,
      text: cleanText(element.getAttribute('alt') || element.getAttribute('title') || ''),
      context: contextOf(element),
      sourceUrl: baseUrl
    });
  });

  const seenText = new Set();
  Array.from(doc.querySelectorAll('h1,h2,h3,h4,h5,h6,p,li,td,th,blockquote,figcaption,dt,dd,article,section'))
    .forEach((element) => {
      if (SKIP_TAGS.has(element.tagName) || isSkipped(element)) return;
      if (BLOCK_TAGS.has(element.tagName) && Array.from(element.children).some((child) => BLOCK_TAGS.has(child.tagName))) return;
      const text = cleanText(element.textContent || '');
      if (text.length < 3 || seenText.has(text)) return;
      seenText.add(text);
      result.text.push({ text, tag: element.tagName.toLowerCase(), context: contextOf(element), sourceUrl: baseUrl });
    });

  doc.querySelectorAll('h1,h2,h3,h4,h5,h6').forEach((element) => {
    const text = cleanText(element.textContent || '');
    if (text) result.headings.push({ text, level: Number(element.tagName.slice(1)), sourceUrl: baseUrl });
  });

  const metaSeen = new Set();
  doc.querySelectorAll('meta[name], meta[property], title').forEach((element) => {
    const name = element.tagName === 'TITLE' ? 'title' : cleanText(element.getAttribute('name') || element.getAttribute('property'));
    const content = cleanText(element.tagName === 'TITLE' ? element.textContent : element.getAttribute('content'));
    if (!content || metaSeen.has(name + '|' + content)) return;
    metaSeen.add(name + '|' + content);
    result.meta.push({ name, text: content, context: '', sourceUrl: baseUrl });
  });

  if (rawHtml) result.source.push({ url: baseUrl, text: rawHtml, context: '', sourceUrl: baseUrl });
  return result;
}

export function toSearchText(item) {
  return [item.text, item.context, item.url].filter(Boolean).join(' ');
}
