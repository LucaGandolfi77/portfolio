/* Streaming — sources, categories, sorting and bilingual strings */

export const API = 'https://archive.org/advancedsearch.php';
export const METADATA = 'https://archive.org/metadata/';
export const DOWNLOAD = 'https://archive.org/download/';
export const DETAILS = 'https://archive.org/details/';

export const CATEGORIES = [
  { id:'popular', en:'Trending', it:'Di tendenza', query:'', sort:'week desc', icon:'🔥' },
  { id:'documentary', en:'Documentaries', it:'Documentari', query:'documentary', sort:'downloads desc', icon:'🎥' },
  { id:'prelinger', en:'Prelinger Archives', it:'Archivio Prelinger', query:'collection:prelinger', sort:'downloads desc', icon:'📼', license:true },
  { id:'feature', en:'Feature Films', it:'Film classici', query:'collection:feature_films', sort:'downloads desc', icon:'🎬' },
  { id:'cartoons', en:'Cartoons', it:'Cartoni', query:'collection:classic_cartoons', sort:'downloads desc', icon:'🎨' },
  { id:'nasa', en:'NASA', it:'NASA', query:'collection:nasa', sort:'downloads desc', icon:'🚀' },
  { id:'news', en:'Newsreels', it:'Cinegiornali', query:'newsreel', sort:'downloads desc', icon:'📰' },
  { id:'concerts', en:'Concerts', it:'Concerti', query:'concerts', sort:'downloads desc', icon:'🎵' },
  { id:'science', en:'Science', it:'Scienza', query:'science', sort:'downloads desc', icon:'🔬' },
  { id:'silent', en:'Silent Films', it:'Film muti', query:'silent films', sort:'downloads desc', icon:'🎞️' },
  { id:'italy', en:'Italy', it:'Italia', query:'italy', sort:'downloads desc', icon:'🇮🇹' }
];

export const SORTS = [
  { id:'week desc', en:'This week', it:'Questa settimana' },
  { id:'month desc', en:'This month', it:'Questo mese' },
  { id:'downloads desc', en:'All time', it:'Sempre' },
  { id:'publicdate desc', en:'Recently added', it:'Aggiunti di recente' },
  { id:'titleSorter asc', en:'Title A–Z', it:'Titolo A–Z' }
];

export const FLAG_NAMES = { en:'Public domain only', it:'Solo pubblico dominio' };
export const PAGE_SIZE = 24;

export const STR = {
  it: {
    skip:'Vai al contenuto', title:'STREAMING', tagline:'Film liberi e archivi pubblici — diretti dal browser',
    search:'Cerca video, collezioni, autori…', find:'Cerca', urlPlaceholder:'Incolla URL mp4 / webm o link YouTube…',
    play:'Riproduci', results:'Risultati', loading:'Caricamento…', noResults:'Nessun risultato. Prova termini più generici.',
    error:'Errore di ricerca. Riprova.', retry:'Riprova', loadMore:'Carica altri',
    publicDomain:'Pubblico dominio', yearFrom:'Anno da', yearTo:'Anno a', sort:'Ordina',
    queue:'Coda', addToQueue:'Aggiungi alla coda', playNext:'Riproduci ora', remove:'Rimuovi',
    favorites:'Preferiti', history:'Cronologia', clear:'Cancella', resume:'Riprendi',
    nowPlaying:'In riproduzione', openArchive:'Apri su Archive.org', openYoutube:'Apri su YouTube',
    pip:'Picture-in-Picture', fullscreen:'Schermo intero', speed:'Velocità', close:'Chiudi',
    saved:'Salvato', removed:'Rimosso', addedQueue:'Aggiunto alla coda', copied:'Link copiato',
    copyLink:'Copia link', share:'Condividi', next:'Successivo', prev:'Precedente',
    stop:'Ferma', detail:'Dettagli', downloads:'download', added:'aggiunto',
    hint:'Streaming diretto da Internet Archive e YouTube — nessun upload, nessuna registrazione.',
    licenseHint:'I filtri per licenza si basano sui metadati caricati dagli utenti: verifica sempre i diritti.',
    emptyQueue:'La coda è vuota', emptyFavorites:'Nessun preferito', emptyHistory:'Nessuna cronologia',
    source:'Fonte', category:'Categoria', all:'Tutti', lang:'IT / EN', theme:'Tema',
    ok:'OK', cancel:'Annulla', filter:'Filtri', showing:'Mostrati'
  },
  en: {
    skip:'Skip to content', title:'STREAMING', tagline:'Free films and public archives — straight from your browser',
    search:'Search videos, collections, creators…', find:'Search', urlPlaceholder:'Paste mp4 / webm URL or YouTube link…',
    play:'Play', results:'Results', loading:'Loading…', noResults:'No results. Try broader terms.',
    error:'Search failed. Try again.', retry:'Retry', loadMore:'Load more',
    publicDomain:'Public domain', yearFrom:'Year from', yearTo:'Year to', sort:'Sort',
    queue:'Queue', addToQueue:'Add to queue', playNext:'Play now', remove:'Remove',
    favorites:'Favorites', history:'History', clear:'Clear', resume:'Resume',
    nowPlaying:'Now playing', openArchive:'Open on Archive.org', openYoutube:'Open on YouTube',
    pip:'Picture-in-Picture', fullscreen:'Fullscreen', speed:'Speed', close:'Close',
    saved:'Saved', removed:'Removed', addedQueue:'Added to queue', copied:'Link copied',
    copyLink:'Copy link', share:'Share', next:'Next', prev:'Previous',
    stop:'Stop', detail:'Details', downloads:'downloads', added:'added',
    hint:'Direct streaming from Internet Archive and YouTube — no upload, no tracking.',
    licenseHint:'License filters rely on user-uploaded metadata: always verify rights.',
    emptyQueue:'Queue is empty', emptyFavorites:'No favorites', emptyHistory:'No history',
    source:'Source', category:'Category', all:'All', lang:'IT / EN', theme:'Theme',
    ok:'OK', cancel:'Cancel', filter:'Filters', showing:'Showing'
  }
};
