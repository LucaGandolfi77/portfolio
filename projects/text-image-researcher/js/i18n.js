/** i18n.js — IT/EN per Web Content Researcher. */

const KEY = 'tir.lang';
const IT = {
  'app.title': 'WEB CONTENT RESEARCHER',
  'app.subtitle': 'Ricerca parole chiave su siti e sottopagine',
  'label.url': 'URL del sito',
  'label.keywords': 'Parole chiave',
  'label.options': 'Opzioni di ricerca',
  'label.case': 'Case sensitive',
  'label.regex': 'Modalità regex',
  'label.deep': 'Scansiona sottopagine',
  'label.maxPages': 'Pagine max',
  'label.and': 'Tutte le parole (AND)',
  'label.or': 'Almeno una parola (OR)',
  'label.negative': ' negative',
  'action.search': 'Cerca',
  'action.stop': 'Ferma',
  'action.add': 'Aggiungi',
  'action.clear': 'Pulisci',
  'action.history': 'Cronologia',
  'action.export': 'Esporta',
  'action.theme': 'Tema',
  'action.lang': 'Lingua',
  'tab.links': 'Link', 'tab.images': 'Immagini', 'tab.text': 'Testo',
  'tab.headings': 'Titoli', 'tab.meta': 'Meta', 'tab.source': 'Sorgente',
  'filter.results': 'Filtra i risultati…',
  'filter.domain': 'Dominio…',
  'status.idle': 'Inserisci un URL e una keyword per iniziare',
  'status.loading': 'Ricerca in corso…',
  'status.done': 'Ricerca completata',
  'status.empty': 'Nessun risultato trovato',
  'status.source': 'Fonte: {name}',
  'msg.fetchFailed': 'Impossibile recuperare la pagina',
  'msg.invalidUrl': 'URL non valido',
  'msg.noKeywords': 'Aggiungi almeno una parola chiave',
  'msg.historyEmpty': 'Nessuna ricerca salvata',
  'msg.scanProgress': 'Scansione {current}/{total}',
  'msg.saved': 'Ricerca salvata',
  'msg.copied': 'Copiato',
  'footer.note': 'I dati vengono recuperati tramite fonti pubbliche: non inserire informazioni sensibili.'
};
const EN = {
  'app.title': 'WEB CONTENT RESEARCHER',
  'app.subtitle': 'Keyword search across sites and subpages',
  'label.url': 'Website URL',
  'label.keywords': 'Keywords',
  'label.options': 'Search options',
  'label.case': 'Case sensitive',
  'label.regex': 'Regex mode',
  'label.deep': 'Deep scan subpages',
  'label.maxPages': 'Max pages',
  'label.and': 'All words (AND)',
  'label.or': 'Any word (OR)',
  'label.negative': ' negative',
  'action.search': 'Search',
  'action.stop': 'Stop',
  'action.add': 'Add',
  'action.clear': 'Clear',
  'action.history': 'History',
  'action.export': 'Export',
  'action.theme': 'Theme',
  'action.lang': 'Language',
  'tab.links': 'Links', 'tab.images': 'Images', 'tab.text': 'Text',
  'tab.headings': 'Headings', 'tab.meta': 'Meta', 'tab.source': 'Source',
  'filter.results': 'Filter results…',
  'filter.domain': 'Domain…',
  'status.idle': 'Enter a URL and a keyword to start',
  'status.loading': 'Searching…',
  'status.done': 'Search complete',
  'status.empty': 'No results found',
  'status.source': 'Source: {name}',
  'msg.fetchFailed': 'Unable to fetch the page',
  'msg.invalidUrl': 'Invalid URL',
  'msg.noKeywords': 'Add at least one keyword',
  'msg.historyEmpty': 'No saved searches',
  'msg.scanProgress': 'Scanning {current}/{total}',
  'msg.saved': 'Search saved',
  'msg.copied': 'Copied',
  'footer.note': 'Pages are fetched through public sources: do not enter sensitive data.'
};
const DICTS = { it: IT, en: EN };
let current = 'it';
const listeners = [];
function supported(value) { return String(value || '').startsWith('en') ? 'en' : String(value || '').startsWith('it') ? 'it' : null; }
export function getLang() { return current; }
export function initLang(value) {
  current = supported(value) || (navigator.language && supported(navigator.language)) || 'it';
  document.documentElement.lang = current;
  return current;
}
export function setLang(value) {
  const next = supported(value);
  if (!next) return current;
  current = next;
  document.documentElement.lang = next;
  listeners.forEach((fn) => fn(next));
  return next;
}
export function t(key, vars) {
  let text = (DICTS[current] && DICTS[current][key]) || EN[key] || key;
  if (vars) Object.keys(vars).forEach((name) => { text = text.replace(new RegExp('\\{' + name + '\\}', 'g'), String(vars[name])); });
  return text;
}
export function applyStatic(root = document) {
  root.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
  root.querySelectorAll('[data-i18n-placeholder]').forEach((el) => { el.placeholder = t(el.dataset.i18nPlaceholder); });
}
export function onLanguageChange(fn) { listeners.push(fn); return () => listeners.splice(listeners.indexOf(fn), 1); }
