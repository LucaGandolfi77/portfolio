import test from 'node:test';
import assert from 'node:assert/strict';
import { isValidUrl, normalizeUrl, resolveUrl, sameOrigin, isAssetUrl, dedupeUrls, hostname } from '../js/url.js';
import { cleanText, escapeHtml, extractItems } from '../js/parser.js';
import { parseKeywords, createMatcher, rankItems, snippet, highlight } from '../js/search.js';
import { emptyResults, mergeResults, dedupeResults, countResults, filterResults } from '../js/results.js';
import { escapeCsv, escapeMarkdown, toCSV, toJSON, toMarkdown, toHTML, exportData } from '../js/exporter.js';

test('URL: validazione, normalizzazione e risoluzione', () => {
  assert.equal(isValidUrl('https://example.com'), true);
  assert.equal(isValidUrl('javascript:alert(1)'), false);
  assert.equal(normalizeUrl('example.com/path#frag'), 'https://example.com/path');
  assert.equal(resolveUrl('/a', 'https://example.com/dir/page'), 'https://example.com/a');
  assert.equal(resolveUrl('#top', 'https://example.com/'), '');
  assert.equal(sameOrigin('https://example.com/a', 'https://example.com/b'), true);
  assert.equal(sameOrigin('https://other.com/a', 'https://example.com/b'), false);
  assert.equal(isAssetUrl('https://x.com/a.png?v=2'), true);
  assert.deepEqual(dedupeUrls(['https://a', 'https://a', 'https://b']), ['https://a', 'https://b']);
  assert.equal(hostname('https://www.example.com/a'), 'example.com');
});

test('parser: testo, escape ed estrazione item', () => {
  assert.equal(cleanText('  a\n  b  '), 'a b');
  assert.equal(escapeHtml('<b>"x"</b>'), '&lt;b&gt;&quot;x&quot;&lt;/b&gt;');
  const doc = {
    querySelectorAll: (selector) => {
      if (selector.includes('a[href]')) return [{ getAttribute: () => '/a', textContent: ' Link ', title: '', parentElement: null }];
      if (selector.includes('img')) return [{ getAttribute: (name) => name === 'src' ? '/i.png' : null, textContent: '', parentElement: null }];
      if (selector.includes('meta')) return [];
      return [];
    }
  };
  const items = extractItems(doc, 'https://example.com/', '<html></html>');
  assert.equal(items.links[0].url, 'https://example.com/a');
  assert.equal(items.links[0].text, 'Link');
  assert.equal(items.images[0].url, 'https://example.com/i.png');
  assert.equal(items.source[0].text, '<html></html>');
});

test('keyword: frasi, negativi e modalità', () => {
  const parsed = parseKeywords('"exact phrase" -bad and good');
  assert.deepEqual(parsed.positive, ['exact phrase', 'good']);
  assert.deepEqual(parsed.negative, ['bad']);
  assert.equal(parsed.mode, 'and');
  assert.equal(parseKeywords('one or two').mode, 'or');
});

test('matcher booleano e ranking', () => {
  const and = createMatcher({ positive: ['cat', 'dog'], negative: ['bird'], mode: 'and' });
  assert.equal(and('a cat and a dog').match, true);
  assert.equal(and('a cat').match, false);
  assert.equal(and('a cat and a dog and a bird').match, false);
  const or = createMatcher({ positive: ['cat', 'dog'], mode: 'or' });
  assert.equal(or('only a dog').match, true);
  const ranked = rankItems([{ text: 'dog dog dog' }, { text: 'dog' }], createMatcher({ positive: ['dog'] }));
  assert.ok(ranked[0].relevance > ranked[1].relevance);
  const regex = createMatcher({ positive: ['c.t'], regex: true });
  assert.equal(regex('a cat here').match, true);
});

test('snippet ed evidenziazione', () => {
  const text = 'prefix '.repeat(30) + 'target' + ' suffix'.repeat(30);
  const cut = snippet(text, ['target'], 120);
  assert.ok(cut.includes('target') && cut.length <= 122);
  const marked = highlight('Cat and cat', ['cat']);
  assert.ok(marked.includes('<mark>Cat</mark>') && marked.includes('<mark>cat</mark>'));
});

test('risultati: merge, dedupe, filtri e conteggi', () => {
  const a = emptyResults();
  const b = emptyResults();
  a.links.push({ url: 'https://example.com/a', text: 'A' });
  b.links.push({ url: 'https://example.com/a', text: 'A' }, { url: 'https://example.com/b', text: 'B' });
  mergeResults(a, b);
  dedupeResults(a);
  assert.equal(a.links.length, 2);
  const counts = countResults(a);
  assert.equal(counts.total, 2);
  assert.equal(filterResults(a, { tab: 'links', query: 'B' }).length, 1);
  assert.equal(filterResults(a, { tab: 'links', domain: 'other.com' }).length, 0);
});

test('export: CSV, JSON, Markdown, HTML', () => {
  assert.equal(escapeCsv('a,b"c'), '"a,b""c"');
  assert.ok(escapeMarkdown('a*b').includes('\\*'));
  const results = emptyResults();
  results.links.push({ url: 'https://example.com', text: 'Hello', context: 'world', relevance: 3 });
  const json = toJSON(results, { url: 'https://example.com' });
  assert.ok(JSON.parse(json).results.links.length === 1);
  assert.ok(toCSV(results).includes('Hello'));
  assert.ok(toMarkdown(results, { keywords: ['hello'] }).includes('Hello'));
  assert.ok(toHTML(results).includes('<ul>'));
  const exported = exportData('csv', results);
  assert.equal(exported.ext, 'csv');
  assert.equal(exported.mime, 'text/csv;charset=utf-8');
});
