/**
 * main.js — orchestrazione ricerca, deep scan, export e UI.
 */

import { normalizeUrl, isValidUrl } from './url.js';
import { parseDocument, extractItems } from './parser.js';
import { parseKeywords, createMatcher } from './search.js';
import { emptyResults, mergeResults, dedupeResults, countResults, filterResults, sortByRelevance, TABS } from './results.js';
import { exportData } from './exporter.js';
import { fetchPage, strategyLabel } from './gateway.js';
import { loadSettings, saveSettings } from './storage.js';
import { loadHistory, addHistory, removeHistory, clearHistory } from './history.js';
import { initLang, getLang, setLang, t, applyStatic, onLanguageChange } from './i18n.js';
import { toast, setStatus, setProgress, setDeepProgress, renderKeywords, renderTabs, renderSource, renderItems, renderHistory } from './ui.js';

const $ = (id) => document.getElementById(id);
let settings = loadSettings();
let keywords = { positive: [], negative: [] };
let results = emptyResults();
let currentTab = 'links';
let lastMeta = { url: '', keywords: [] };
let cancelled = false;

function applyOptionsFromUI() {
  settings = saveSettings({
    caseSensitive: $('caseOpt').checked,
    regex: $('regexOpt').checked,
    deepScan: $('deepOpt').checked,
    maxPages: Math.max(1, Math.min(200, Number($('maxPagesOpt').value) || 10)),
    mode: $('modeSelect').value,
    includeProxies: $('proxyOpt').checked
  });
}

function syncOptionsUI() {
  $('caseOpt').checked = settings.caseSensitive;
  $('regexOpt').checked = settings.regex;
  $('deepOpt').checked = settings.deepScan;
  $('maxPagesOpt').value = String(settings.maxPages);
  $('modeSelect').value = settings.mode;
  $('proxyOpt').checked = settings.includeProxies !== false;
}

function buildMatcher() {
  return createMatcher({
    positive: keywords.positive,
    negative: keywords.negative,
    mode: settings.mode,
    regex: settings.regex,
    caseSensitive: settings.caseSensitive
  });
}

function addKeywordsFromInput() {
  const parsed = parseKeywords($('keywordInput').value);
  let added = 0;
  parsed.positive.forEach((value) => { if (!keywords.positive.includes(value)) { keywords.positive.push(value); added += 1; } });
  parsed.negative.forEach((value) => { if (!keywords.negative.includes(value)) { keywords.negative.push(value); added += 1; } });
  $('keywordInput').value = '';
  renderKeywords(keywords.positive, keywords.negative);
  if (!added) toast('Keyword già presente');
}

async function analyzePage(url, matcher) {
  const page = await fetchPage(url, {
    onStatus: (id, message) => setStatus(message, 'loading'),
    includeProxies: settings.includeProxies !== false
  });
  const { doc, rawHtml } = parseDocument(page.html, url);
  const items = extractItems(doc, url, rawHtml);
  const ranked = emptyResults();
  for (const tab of TABS) ranked[tab] = sortByRelevance(items[tab] ? items[tab].map((item, index) => {
    const match = matcher([item.text, item.context, item.url, item.name].filter(Boolean).join(' '));
    return { ...item, relevance: Math.round(match.score * 10) / 10, hitCount: match.hits, index };
  }).filter((item) => item.relevance > 0 || (keywords.positive.length === 0 && keywords.negative.length === 0)) : []);
  return { ranked, page, doc };
}

function collectLinks(doc, baseUrl) {
  const links = new Set();
  doc.querySelectorAll('a[href]').forEach((element) => {
    try {
      const resolved = new URL(element.getAttribute('href'), baseUrl);
      if (!/^https?:$/.test(resolved.protocol) || resolved.origin !== new URL(baseUrl).origin) return;
      resolved.hash = '';
      if (/\.(jpg|jpeg|png|gif|svg|webp|pdf|zip|mp3|mp4|css|js|ico|woff2?|ttf|eot)(\?.*)?$/i.test(resolved.pathname)) return;
      if (resolved.href !== normalizeUrl(baseUrl)) links.add(resolved.href);
    } catch (e) {}
  });
  return [...links];
}

async function deepScan(links, matcher, baseResults) {
  const queue = links.slice(0, settings.maxPages);
  let scanned = 0;
  setDeepProgress(true, 0, queue.length);
  const worker = async () => {
    while (queue.length && !cancelled) {
      const url = queue.shift();
      try {
        const page = await analyzePage(url, matcher);
        mergeResults(baseResults, page.ranked);
        renderSource(strategyLabel(page.page.strategy), page.page.cached);
      } catch (e) { /* una pagina fallita non blocca la scansione */ }
      scanned += 1;
      setDeepProgress(true, scanned, Math.min(settings.maxPages, links.length));
    }
  };
  await Promise.all(Array.from({ length: Math.min(3, queue.length) }, worker));
  setDeepProgress(false);
}

async function startSearch() {
  const url = normalizeUrl($('urlInput').value);
  if (!isValidUrl(url)) { toast(t('msg.invalidUrl'), 'error'); return; }
  if (!keywords.positive.length && !keywords.negative.length) { toast(t('msg.noKeywords'), 'error'); return; }
  applyOptionsFromUI();
  cancelled = false;
  $('fetchBtn').disabled = true;
  $('fetchBtnText').textContent = t('action.stop');
  setStatus(t('status.loading'), 'loading');
  setProgress(8);
  results = emptyResults();
  lastMeta = { url, keywords: [...keywords.positive, ...keywords.negative.map((value) => '-' + value)] };
  const matcher = buildMatcher();
  try {
    const first = await analyzePage(url, matcher);
    mergeResults(results, first.ranked);
    setProgress(35);
    renderSource(strategyLabel(first.page.strategy), first.page.cached);
    if (settings.deepScan) {
      await deepScan(collectLinks(first.doc, url), matcher, results);
    }
    dedupeResults(results);
    const counts = countResults(results);
    setProgress(100);
    setStatus(`${t('status.done')} · ${counts.total}`, 'ok');
    renderTabs(counts, currentTab);
    renderCurrent();
    $('tabBar').classList.add('on');
    $('emptyState').classList.add('hidden');
    renderHistory(addHistory({ url, keywords: lastMeta.keywords, options: { ...settings }, total: counts.total }));
  } catch (error) {
    setStatus(t('msg.fetchFailed') + (error.details ? ': ' + error.details.join(' · ') : ''), 'error');
    toast(t('msg.fetchFailed'), 'error');
  }
  $('fetchBtn').disabled = false;
  $('fetchBtnText').textContent = t('action.search');
}

function stopSearch() {
  cancelled = true;
  setDeepProgress(false);
  $('fetchBtn').disabled = false;
  $('fetchBtnText').textContent = t('action.search');
  setStatus(t('status.done'));
}

function renderCurrent() {
  const items = filterResults(results, {
    tab: currentTab,
    query: $('filterInput').value,
    domain: $('domainInput').value
  });
  renderItems(sortByRelevance(items), keywords.positive);
  const empty = $('resultsList').querySelector('.empty-note');
  $('emptyState').classList.toggle('hidden', !empty);
}

function doExport(format) {
  const payload = exportData(format, results, lastMeta);
  const blob = new Blob([payload.text], { type: payload.mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `research-${Date.now()}.${payload.ext}`;
  document.body.appendChild(link);
  link.click();
  setTimeout(() => { link.remove(); URL.revokeObjectURL(url); }, 500);
  $('exportMenu').classList.remove('on');
}

function refreshTexts() {
  applyStatic(document);
  $('btnLang').textContent = getLang() === 'it' ? '🇮🇹 IT' : '🇬🇧 EN';
  $('btnTheme').textContent = settings.theme === 'dark' ? '☀️' : '🌙';
  renderKeywords(keywords.positive, keywords.negative);
  renderTabs(countResults(results).counts, currentTab);
  renderHistory(loadHistory());
  if (results.links.length || results.text.length) renderCurrent();
}

function init() {
  initLang(settings.lang);
  document.documentElement.dataset.theme = settings.theme;
  syncOptionsUI();
  refreshTexts();

  $('addKeywordBtn').addEventListener('click', addKeywordsFromInput);
  $('keywordInput').addEventListener('keydown', (event) => { if (event.key === 'Enter') addKeywordsFromInput(); });
  $('keywordsContainer').addEventListener('click', (event) => {
    const button = event.target.closest('[data-remove]');
    if (!button) return;
    const value = button.dataset.remove;
    keywords.positive = keywords.positive.filter((item) => item !== value);
    keywords.negative = keywords.negative.filter((item) => item !== value);
    renderKeywords(keywords.positive, keywords.negative);
  });
  $('urlInput').addEventListener('keydown', (event) => { if (event.key === 'Enter') startSearch(); });
  $('fetchBtn').addEventListener('click', () => cancelled ? stopSearch() : startSearch());
  $('stopBtn').addEventListener('click', stopSearch);
  document.querySelectorAll('.tab-btn[data-tab]').forEach((button) => button.addEventListener('click', () => {
    currentTab = button.dataset.tab;
    renderTabs(countResults(results).counts, currentTab);
    renderCurrent();
  }));
  $('filterInput').addEventListener('input', renderCurrent);
  $('domainInput').addEventListener('input', renderCurrent);
  $('exportBtn').addEventListener('click', () => $('exportMenu').classList.toggle('on'));
  $('exportMenu').addEventListener('click', (event) => {
    const format = event.target.closest('[data-format]');
    if (format) doExport(format.dataset.format);
  });
  $('btnHistory').addEventListener('click', () => $('historySheet').classList.add('on'));
  $('historyClose').addEventListener('click', () => $('historySheet').classList.remove('on'));
  $('historyClear').addEventListener('click', () => { renderHistory(clearHistory()); toast(t('action.clear')); });
  $('historyList').addEventListener('click', (event) => {
    const replay = event.target.closest('[data-replay]');
    const remove = event.target.closest('[data-remove]');
    if (replay) {
      const entry = loadHistory().find((item) => item.id === replay.dataset.replay);
      if (entry) {
        $('urlInput').value = entry.url;
        $('keywordInput').value = (entry.keywords || []).join(' ');
        keywords = { positive: [], negative: [] };
        addKeywordsFromInput();
        toast(t('msg.saved'));
      }
      $('historySheet').classList.remove('on');
    } else if (remove) {
      renderHistory(removeHistory(remove.dataset.remove));
    }
  });
  $('btnTheme').addEventListener('click', () => {
    settings = saveSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' });
    document.documentElement.dataset.theme = settings.theme;
    $('btnTheme').textContent = settings.theme === 'dark' ? '☀️' : '🌙';
  });
  $('btnLang').addEventListener('click', () => {
    const lang = getLang() === 'it' ? 'en' : 'it';
    setLang(lang);
    saveSettings({ lang });
  });
  onLanguageChange(refreshTexts);
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js', { scope: './' }).catch(() => {});
  window.__TIR__ = { get results() { return results; }, startSearch, stopSearch, parseKeywords, createMatcher, doExport };
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
