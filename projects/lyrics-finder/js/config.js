/* Reverse Lyrics Finder — configuration and bilingual strings */

export const ITUNES = 'https://itunes.apple.com/search';
export const LYRICS_OVH = 'https://api.lyrics.ovh/v1';
export const GENIUS = 'https://genius.com/search?q=';

export const LIMIT = 20;
export const COUNTRIES = ['it', 'us', 'gb', 'de', 'fr', 'es'];
export const SEARCH_TTL = 10 * 60 * 1000;
export const LYRICS_TTL = 7 * 24 * 60 * 60 * 1000;
export const CACHE_LIMIT = 40;

export const DEMOS = [
  'never gonna give you up',
  'we will we will rock you',
  "l'estate addosso",
  'sapore di sale',
  'happy birthday to you',
  'bohemian rhapsody is this the real life'
];

export const STR = {
  en: {
    skip: 'Skip to content', title: 'Reverse Lyrics Finder', kicker: 'Lyrics · Music · Search',
    sub: 'Paste a line of lyrics — any line — and find the song. Preview it, open the full text and see your phrase highlighted.',
    searchPlaceholder: 'e.g. "is this the real life… is this just fantasy"',
    find: 'Find the song', searching: 'Searching…', clear: 'Clear', exact: 'exact phrase',
    tryLine: 'Try a line:', howTitle: 'How to get the best match:',
    how: 'Paste a distinctive full line (5+ words), not a single word. Search finds likely songs; press Text on a result to confirm the line in the real lyrics.',
    genius: 'Search Genius', matches: 'Matches', results: '{n} results · tap ▶ for a 30s preview',
    noResults: 'No song found for “{q}”. Try a more distinctive line or use the Genius button.',
    error: 'Could not reach the music search. Check your connection or try the Genius button.',
    offline: 'You appear to be offline — showing cached results when available.',
    cached: 'cached', play: 'Play preview', pause: 'Pause', text: 'Text', openApple: 'Open on Apple Music',
    favorite: 'Add to favorites', unfavorite: 'Remove from favorites', match: '{n}% match',
    recent: 'Recent searches', favorites: 'Favorites', settings: 'Settings', country: 'Store',
    lyrics: 'Full lyrics', loadingLyrics: 'Loading lyrics…', noLyrics: 'No community lyrics found for this track.',
    tryGenius: 'Try Genius or Google:', source: 'source', copy: 'Copy lyrics', share: 'Share',
    copied: 'Lyrics copied', copyFail: 'Could not copy', shareFail: 'Sharing unavailable',
    close: 'Close', lang: 'Language', theme: 'Theme', clearCache: 'Clear cache',
    footer: 'Song metadata & previews: iTunes Search API · full lyrics: Lyrics.ovh (community) · fallback: Genius. Nothing you type leaves your browser except these public lookups.',
    volume: 'Volume', seek: 'Seek', loading: 'Loading…', emptyFavs: 'No favorites yet'
  },
  it: {
    skip: 'Vai al contenuto', title: 'Reverse Lyrics Finder', kicker: 'Testi · Musica · Ricerca',
    sub: 'Incolla una frase di una canzone — qualsiasi frase — e trova il brano. Ascolta l’anteprima, apri il testo completo e vedi la tua frase evidenziata.',
    searchPlaceholder: 'es. "is this the real life… is this just fantasy"',
    find: 'Trova la canzone', searching: 'Ricerca…', clear: 'Pulisci', exact: 'frase esatta',
    tryLine: 'Prova una frase:', howTitle: 'Come ottenere il risultato migliore:',
    how: 'Incolla una frase lunga e distintiva (5+ parole), non una singola parola. La ricerca trova brani plausibili; premi Testo su un risultato per confermare la frase nel testo reale.',
    genius: 'Cerca su Genius', matches: 'Risultati', results: '{n} risultati · tocca ▶ per l’anteprima di 30s',
    noResults: 'Nessun brano trovato per “{q}”. Prova una frase più distintiva o usa il pulsante Genius.',
    error: 'Impossibile raggiungere la ricerca musicale. Controlla la connessione o prova il pulsante Genius.',
    offline: 'Sembra che tu sia offline — mostro i risultati in cache quando disponibili.',
    cached: 'in cache', play: 'Riproduci anteprima', pause: 'Pausa', text: 'Testo', openApple: 'Apri su Apple Music',
    favorite: 'Aggiungi ai preferiti', unfavorite: 'Rimuovi dai preferiti', match: '{n}% corrispondenza',
    recent: 'Ricerche recenti', favorites: 'Preferiti', settings: 'Impostazioni', country: 'Negozio',
    lyrics: 'Testo completo', loadingLyrics: 'Caricamento testo…', noLyrics: 'Nessun testo della community per questo brano.',
    tryGenius: 'Prova Genius o Google:', source: 'fonte', copy: 'Copia testo', share: 'Condividi',
    copied: 'Testo copiato', copyFail: 'Copia non riuscita', shareFail: 'Condivisione non disponibile',
    close: 'Chiudi', lang: 'Lingua', theme: 'Tema', clearCache: 'Cancella cache',
    footer: 'Metadati e anteprime: iTunes Search API · testi: Lyrics.ovh (community) · fallback: Genius. Nessun dato inserito lascia il browser tranne queste ricerche pubbliche.',
    volume: 'Volume', seek: 'Avanzamento', loading: 'Caricamento…', emptyFavs: 'Nessun preferito'
  }
};
