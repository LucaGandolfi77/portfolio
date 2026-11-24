/* T-SNE 3D — configuration, datasets, metrics and bilingual strings */

export const PALETTE = ['#3ee6ff','#b28dff','#ff8d5f','#52ff9e','#ffd166','#ff5f9e',
  '#8afff0','#ff9ecb','#9dffb0','#ffb56b','#7db8ff','#e6ff8f','#c98aff','#6bffd0','#ff7d8d','#a3d8ff'];

export const SAMPLES = [
  { id:'iris', en:'Iris (synthetic)', it:'Iris (sintetico)' },
  { id:'meteo', en:'Italian weather', it:'Meteo città italiane' },
  { id:'calcio', en:'Football · 5 leagues', it:'Calcio · 5 campionati' },
  { id:'mnist', en:'MNIST 8×8 reduced', it:'MNIST ridotto 8×8' },
  { id:'blobs', en:'Generated blobs', it:'Blobs generati' },
  { id:'wine', en:'Wine quality', it:'Qualità del vino' },
  { id:'nested', en:'Nested clusters', it:'Cluster annidati' }
];

export const METRICS = [
  { id:'silhouette', en:'Silhouette', it:'Silhouette', hint:{ en:'Cluster separation, −1…1', it:'Separazione cluster, −1…1' } },
  { id:'davies', en:'Davies–Bouldin', it:'Davies–Bouldin', hint:{ en:'Lower is better', it:'Più basso è meglio' } },
  { id:'calinski', en:'Calinski–Harabasz', it:'Calinski–Harabasz', hint:{ en:'Higher is better', it:'Più alto è meglio' } },
  { id:'variance', en:'Explained variance', it:'Varianza spiegata', hint:{ en:'Structure captured in 3D', it:'Struttura catturata in 3D' } }
];

export const DEFAULT_SETTINGS = Object.freeze({
  lang:'en', theme:'dark', perplexity:30, exaggeration:12, k:0,
  view:'cloud', label:'', metric:'silhouette', ghost:true
});

export const STR = {
  it: {
    skip:'Vai al contenuto', title:'T-SNE 3D', tagline:'Guarda i tuoi dati dispiegarsi nello spazio',
    data:'Dati', tsne:'t-SNE', view:'Vista', export:'Esporta', settings:'Impostazioni',
    sample:'Dataset di esempio', csv:'Carica CSV', paste:'Incolla CSV', drop:'Trascina un CSV qui',
    unfold:'Dispiegamento', perplexity:'Perplexity', exaggeration:'Esagerazione', iterations:'Iterazioni',
    coherence:'Coerenza del clustering', kmeans:'K-means', autoK:'K ottimale', focus:'Focus cluster',
    cloud:'Nuvola', planet:'Pianeta', map:'Mappa', plane:'2D', ghost:'Fantasma prima/dopo',
    replay:'Time-lapse', play:'Riproduci', pause:'Pausa', speed:'Velocità',
    inspect:'Ispezione', row:'Riga', copy:'Copia link', png:'Esporta PNG', json:'Esporta JSON', csvOut:'Esporta CSV',
    help:'Come funziona', loading:'Calcolo in corso…', ready:'Pronto', points:'punti',
    features:'feature', labels:'etichette', search:'Cerca…', close:'Chiudi',
    reset:'Ricomincia', orbit:'Rotazione auto', lang:'IT / EN', theme:'Tema',
    metrics:'Metriche', algorithm:'Algoritmo', docs:'Documentazione',
    noLabel:'Nessuna etichetta', selectLabel:'Colonna etichetta', openGuide:'Apri guida',
    time:'Tempo', frame:'Frame', ok:'OK', cancel:'Annulla',
    copied:'Link copiato', errors:'Errore', invalidCSV:'CSV non valido', optimalK:'K ottimale'
  },
  en: {
    skip:'Skip to content', title:'T-SNE 3D', tagline:'Watch your data unfold in space',
    data:'Data', tsne:'t-SNE', view:'View', export:'Export', settings:'Settings',
    sample:'Sample dataset', csv:'Load CSV', paste:'Paste CSV', drop:'Drop a CSV here',
    unfold:'Unfolding', perplexity:'Perplexity', exaggeration:'Exaggeration', iterations:'Iterations',
    coherence:'Clustering coherence', kmeans:'K-means', autoK:'Optimal K', focus:'Focus cluster',
    cloud:'Cloud', planet:'Planet', map:'Map', plane:'2D', ghost:'Before/after ghost',
    replay:'Time-lapse', play:'Play', pause:'Pause', speed:'Speed',
    inspect:'Inspection', row:'Row', copy:'Copy link', png:'Export PNG', json:'Export JSON', csvOut:'Export CSV',
    help:'How it works', loading:'Computing…', ready:'Ready', points:'points',
    features:'features', labels:'labels', search:'Search…', close:'Close',
    reset:'Restart', orbit:'Auto rotate', lang:'IT / EN', theme:'Theme',
    metrics:'Metrics', algorithm:'Algorithm', docs:'Documentation',
    noLabel:'No label', selectLabel:'Label column', openGuide:'Open guide',
    time:'Time', frame:'Frame', ok:'OK', cancel:'Cancel',
    copied:'Link copied', errors:'Error', invalidCSV:'Invalid CSV', optimalK:'Optimal K'
  }
};
