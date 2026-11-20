/* Caricamento articoli Wikipedia e calcolo della "famosità". */

const WIKI_API = lang => `https://${lang}.wikipedia.org/w/api.php`;
const BATCH_SIZE = 50;

function paramsForBatch(batchSize) {
  return new URLSearchParams({
    action: 'query',
    format: 'json',
    origin: '*',
    generator: 'random',
    grnnamespace: '0',
    grnlimit: String(batchSize),
    prop: 'pageviews|extracts|info|pageimages',
    pvipdays: '30',
    inprop: 'url',
    exintro: '1',
    explaintext: '1',
    exsentences: '3',
    pithumbsize: '480'
  });
}

export function fameFromViews(avgViews, length) {
  const base = Math.log10(Math.max(0, avgViews) + 1);
  const depth = Math.min(0.35, Math.log10(Math.max(1, length || 1) + 1) / 14);
  return Math.round((base + depth) * 100) / 100;
}

function cleanExtract(text) {
  if (!text) return '';
  return String(text).replace(/\s+/g, ' ').replace(/\[[^\]]*\]/g, '').trim();
}

function parsePage(page) {
  const views = page.pageviews || {};
  const values = Object.keys(views)
    .map(k => views[k])
    .filter(v => typeof v === 'number' && isFinite(v));
  const avg = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  const extract = cleanExtract(page.extract);
  return {
    id: page.pageid,
    title: page.title,
    extract,
    image: page.thumbnail && page.thumbnail.source ? page.thumbnail.source : null,
    url: page.fullurl || (page.canonicalurl || ''),
    length: page.length || 0,
    views: Math.round(avg * 10) / 10,
    fame: fameFromViews(avg, page.length || 0)
  };
}

async function fetchBatch(lang, size) {
  const url = WIKI_API(lang) + '?' + paramsForBatch(size);
  const response = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error('Wikipedia API HTTP ' + response.status);
  const data = await response.json();
  if (data.error) throw new Error(data.error.info || 'Wikipedia API error');
  const pages = data.query && data.query.pages ? data.query.pages : {};
  return Object.keys(pages).map(k => parsePage(pages[k]));
}

/** Carica un lotto di articoli casuali già corredati di punteggio di famosità. */
export async function fetchArticles(lang, targetCount) {
  const count = targetCount || 100;
  const batches = Math.max(1, Math.ceil(count / BATCH_SIZE));
  const results = await Promise.allSettled(
    Array.from({ length: batches }, (_, i) =>
      fetchBatch(lang, Math.min(BATCH_SIZE, count - i * BATCH_SIZE)))
  );

  const seen = new Set();
  const articles = [];
  results.forEach(r => {
    if (r.status !== 'fulfilled') return;
    r.value.forEach(article => {
      if (seen.has(article.id)) return;
      if (!article.title || article.extract.length < 70) return;
      seen.add(article.id);
      articles.push(article);
    });
  });

  if (!articles.length) throw new Error('Nessun articolo utilizzabile');
  return articles;
}
