/**
 * i18n.js — inglese e italiano per Atlas.
 * La lingua arriva dalla Project Shell (`project:langchange`) o da `pf.lang`.
 */

const DICT = {
  en: {
    skip: 'Skip to content',
    kicker: 'Weather · Distance · Map',
    title: 'The world, at a glance',
    subtitle: 'Search a place, read the next seven days, or measure the distance between two points.',
    searchLabel: 'Search a place',
    searchPlaceholder: 'City or address…',
    search: 'Search',
    searching: 'Searching…',
    searchResultsLabel: 'Search results',
    clearSearch: 'Clear search',
    resultsCount: '{n} results',
    noResults: 'No place found. Try a different search.',
    searchError: 'Search is unavailable right now. Check your connection and try again.',
    modeLabel: 'Atlas mode',
    weatherMode: 'Weather',
    measureMode: 'Measure',
    locate: 'My location',
    locating: 'Locating…',
    locationDenied: 'Location permission denied. Search a place instead.',
    locationUnsupported: 'Geolocation is not available in this browser.',
    locationError: 'Could not get your position. Try again.',
    unitsLabel: 'Temperature units',
    metric: '°C',
    imperial: '°F',
    mapLabel: 'Interactive map',
    mapHintWeather: 'Tap the map to read the weather, or search a place.',
    mapHintMeasure: 'Tap the map to set point A and point B.',
    mapData: 'Map data © OpenStreetMap contributors',
    mapError: 'The map library did not load. Search and coordinates still work.',
    weatherTitle: 'Weather',
    weatherEmptyTitle: 'Pick a place on the map',
    weatherEmptyText: 'Search a city or tap anywhere on the map. Weather data is cached on this device for offline reading.',
    weatherLoading: 'Reading the sky…',
    weatherError: 'Weather data is not available. Check your connection and retry.',
    weatherOffline: 'Offline — showing the last saved reading.',
    offlineNoCache: 'You are offline and there is no cached weather for this place yet.',
    retry: 'Retry',
    updated: 'Updated {time}',
    cached: 'cached',
    now: 'Now',
    savePlace: 'Save place',
    savedPlace: 'Saved',
    removePlace: 'Remove',
    sharePlace: 'Share',
    copyCoords: 'Copy coordinates',
    copied: 'Copied',
    copyFailed: 'Could not copy',
    openOsm: 'Open in OpenStreetMap',
    refresh: 'Refresh',
    feelsLike: 'Feels like',
    humidity: 'Humidity',
    precipitation: 'Precipitation',
    wind: 'Wind',
    highLow: 'High / low',
    sunrise: 'Sunrise',
    sunset: 'Sunset',
    hourlyTitle: 'Next hours',
    forecastTitle: '7-day forecast',
    today: 'Today',
    tomorrow: 'Tomorrow',
    placesTitle: 'Saved places',
    placesEmpty: 'No saved places yet. Tap “Save place” when you find one.',
    measureTitle: 'Distance',
    measureHint: 'Set two points on the map or type their coordinates. Distance uses the great-circle formula.',
    pointA: 'Point A',
    pointB: 'Point B',
    latitude: 'Latitude',
    longitude: 'Longitude',
    setFromMap: 'Set from map',
    distanceLabel: 'Distance',
    bearingLabel: 'Bearing',
    resetMeasure: 'Reset',
    swapPoints: 'Swap',
    midpoint: 'Midpoint',
    weatherAtMidpoint: 'Weather at midpoint',
    privacyTitle: 'Data & privacy',
    privacyText: 'Weather and place searches use Open-Meteo and OpenStreetMap Nominatim. Map tiles come from OpenStreetMap. Coordinates, saved places and the weather cache stay in this browser; no account, no tracking.',
    offlineNotice: 'You are offline. Cached data is still available.',
    footer: 'A Project Kit 2026 app · local-first, no tracking',
    footerProjects: 'All projects',
    confirmRemoveTitle: 'Remove this place?',
    confirmRemoveText: 'It will be removed from your saved places on this device.',
    cancel: 'Cancel',
    confirmRemove: 'Remove',
    placeSaved: 'Place saved',
    placeRemoved: 'Place removed',
    coordsCopied: 'Coordinates copied',
    shareUnavailable: 'Sharing is not available',
    shareText: 'Weather and distance atlas',
    invalidCoords: 'Enter a latitude between -90 and 90 and a longitude between -180 and 180.',
    invalidPoint: 'Invalid coordinates for {point}.',
    weatherClear: 'Clear sky',
    weatherMainlyClear: 'Mainly clear',
    weatherPartly: 'Partly cloudy',
    weatherOvercast: 'Overcast',
    weatherFog: 'Fog',
    weatherRimeFog: 'Rime fog',
    weatherDrizzle: 'Drizzle',
    weatherFreezingDrizzle: 'Freezing drizzle',
    weatherRain: 'Rain',
    weatherFreezingRain: 'Freezing rain',
    weatherSnow: 'Snow',
    weatherSnowGrains: 'Snow grains',
    weatherShowers: 'Rain showers',
    weatherSnowShowers: 'Snow showers',
    weatherStorm: 'Thunderstorm',
    weatherStormHail: 'Thunderstorm with hail',
    weatherUnknown: 'Unknown conditions'
  },
  it: {
    skip: 'Vai al contenuto',
    kicker: 'Meteo · Distanze · Mappa',
    title: 'Il mondo, a colpo d’occhio',
    subtitle: 'Cerca un luogo, leggi i prossimi sette giorni o misura la distanza tra due punti.',
    searchLabel: 'Cerca un luogo',
    searchPlaceholder: 'Città o indirizzo…',
    search: 'Cerca',
    searching: 'Ricerca…',
    searchResultsLabel: 'Risultati della ricerca',
    clearSearch: 'Cancella ricerca',
    resultsCount: '{n} risultati',
    noResults: 'Nessun luogo trovato. Prova con un’altra ricerca.',
    searchError: 'Ricerca non disponibile. Controlla la connessione e riprova.',
    modeLabel: 'Modalità di Atlas',
    weatherMode: 'Meteo',
    measureMode: 'Misura',
    locate: 'La mia posizione',
    locating: 'Localizzazione…',
    locationDenied: 'Permesso posizione negato. Cerca un luogo.',
    locationUnsupported: 'La geolocalizzazione non è disponibile in questo browser.',
    locationError: 'Impossibile ottenere la posizione. Riprova.',
    unitsLabel: 'Unità di temperatura',
    metric: '°C',
    imperial: '°F',
    mapLabel: 'Mappa interattiva',
    mapHintWeather: 'Tocca la mappa per leggere il meteo, oppure cerca un luogo.',
    mapHintMeasure: 'Tocca la mappa per impostare il punto A e il punto B.',
    mapData: 'Dati mappa © OpenStreetMap contributors',
    mapError: 'La libreria della mappa non è stata caricata. Ricerca e coordinate funzionano comunque.',
    weatherTitle: 'Meteo',
    weatherEmptyTitle: 'Scegli un luogo sulla mappa',
    weatherEmptyText: 'Cerca una città o tocca un punto qualsiasi. I dati meteo restano in cache su questo dispositivo per la lettura offline.',
    weatherLoading: 'Leggiamo il cielo…',
    weatherError: 'Dati meteo non disponibili. Controlla la connessione e riprova.',
    weatherOffline: 'Offline — mostro l’ultima lettura salvata.',
    offlineNoCache: 'Sei offline e non c’è ancora una lettura meteo in cache per questo luogo.',
    retry: 'Riprova',
    updated: 'Aggiornato {time}',
    cached: 'in cache',
    now: 'Ora',
    savePlace: 'Salva luogo',
    savedPlace: 'Salvato',
    removePlace: 'Rimuovi',
    sharePlace: 'Condividi',
    copyCoords: 'Copia coordinate',
    copied: 'Copiato',
    copyFailed: 'Copia non riuscita',
    openOsm: 'Apri in OpenStreetMap',
    refresh: 'Aggiorna',
    feelsLike: 'Percepita',
    humidity: 'Umidità',
    precipitation: 'Precipitazioni',
    wind: 'Vento',
    highLow: 'Max / min',
    sunrise: 'Alba',
    sunset: 'Tramonto',
    hourlyTitle: 'Prossime ore',
    forecastTitle: 'Previsioni 7 giorni',
    today: 'Oggi',
    tomorrow: 'Domani',
    placesTitle: 'Luoghi salvati',
    placesEmpty: 'Nessun luogo salvato. Tocca “Salva luogo” quando ne trovi uno.',
    measureTitle: 'Distanza',
    measureHint: 'Imposta due punti sulla mappa o digita le coordinate. La distanza usa la formula great-circle.',
    pointA: 'Punto A',
    pointB: 'Punto B',
    latitude: 'Latitudine',
    longitude: 'Longitudine',
    setFromMap: 'Imposta da mappa',
    distanceLabel: 'Distanza',
    bearingLabel: 'Direzione',
    resetMeasure: 'Azzera',
    swapPoints: 'Inverti',
    midpoint: 'Punto medio',
    weatherAtMidpoint: 'Meteo al punto medio',
    privacyTitle: 'Dati e privacy',
    privacyText: 'Meteo e ricerca luoghi usano Open-Meteo e OpenStreetMap Nominatim. Le tile arrivano da OpenStreetMap. Coordinate, luoghi salvati e cache meteo restano in questo browser; nessun account, nessun tracciamento.',
    offlineNotice: 'Sei offline. I dati in cache sono ancora disponibili.',
    footer: 'Un’app Project Kit 2026 · locale, senza tracciamento',
    footerProjects: 'Tutti i progetti',
    confirmRemoveTitle: 'Rimuovere questo luogo?',
    confirmRemoveText: 'Verrà rimosso dai luoghi salvati su questo dispositivo.',
    cancel: 'Annulla',
    confirmRemove: 'Rimuovi',
    placeSaved: 'Luogo salvato',
    placeRemoved: 'Luogo rimosso',
    coordsCopied: 'Coordinate copiate',
    shareUnavailable: 'Condivisione non disponibile',
    shareText: 'Atlante meteo e distanze',
    invalidCoords: 'Inserisci una latitudine tra -90 e 90 e una longitudine tra -180 e 180.',
    invalidPoint: 'Coordinate non valide per {point}.',
    weatherClear: 'Cielo sereno',
    weatherMainlyClear: 'Prevalentemente sereno',
    weatherPartly: 'Parzialmente nuvoloso',
    weatherOvercast: 'Coperto',
    weatherFog: 'Nebbia',
    weatherRimeFog: 'Nebbia con brina',
    weatherDrizzle: 'Pioggerella',
    weatherFreezingDrizzle: 'Pioggerella gelata',
    weatherRain: 'Pioggia',
    weatherFreezingRain: 'Pioggia gelata',
    weatherSnow: 'Neve',
    weatherSnowGrains: 'Granelli di neve',
    weatherShowers: 'Rovesci',
    weatherSnowShowers: 'Rovesci di neve',
    weatherStorm: 'Temporale',
    weatherStormHail: 'Temporale con grandine',
    weatherUnknown: 'Condizioni sconosciute'
  }
};

const WEATHER_KEYS = {
  clear: 'weatherClear',
  mainlyClear: 'weatherMainlyClear',
  partly: 'weatherPartly',
  overcast: 'weatherOvercast',
  fog: 'weatherFog',
  rimeFog: 'weatherRimeFog',
  drizzle: 'weatherDrizzle',
  freezingDrizzle: 'weatherFreezingDrizzle',
  rain: 'weatherRain',
  freezingRain: 'weatherFreezingRain',
  snow: 'weatherSnow',
  snowGrains: 'weatherSnowGrains',
  showers: 'weatherShowers',
  snowShowers: 'weatherSnowShowers',
  storm: 'weatherStorm',
  stormHail: 'weatherStormHail',
  unknown: 'weatherUnknown'
};

let current = 'en';

function normalize(value) {
  return String(value || '').toLowerCase().slice(0, 2) === 'it' ? 'it' : 'en';
}

export function initLang(value) {
  current = normalize(value);
  return current;
}

export function getLang() {
  return current;
}

export function setLang(value) {
  current = normalize(value);
  return current;
}

export function t(key, vars) {
  const dict = DICT[current] || DICT.en;
  let text = dict[key] ?? DICT.en[key] ?? key;
  if (vars) {
    for (const [name, value] of Object.entries(vars)) {
      text = text.replaceAll(`{${name}}`, String(value));
    }
  }
  return text;
}

export function weatherLabel(key) {
  return t(WEATHER_KEYS[key] || 'weatherUnknown');
}

export function dictKeys(lang = current) {
  return Object.keys(DICT[normalize(lang)] || DICT.en);
}

export function applyStatic(root) {
  if (!root || !root.querySelectorAll) return;
  root.querySelectorAll('[data-i18n]').forEach((el) => {
    el.textContent = t(el.getAttribute('data-i18n'));
  });
  root.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    el.setAttribute('placeholder', t(el.getAttribute('data-i18n-placeholder')));
  });
  root.querySelectorAll('[data-i18n-aria]').forEach((el) => {
    el.setAttribute('aria-label', t(el.getAttribute('data-i18n-aria')));
  });
  root.querySelectorAll('[data-i18n-title]').forEach((el) => {
    el.setAttribute('title', t(el.getAttribute('data-i18n-title')));
  });
}

function locale() {
  return current === 'it' ? 'it-IT' : 'en-GB';
}

export function formatTime(value) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  try {
    return new Intl.DateTimeFormat(locale(), { hour: '2-digit', minute: '2-digit' }).format(date);
  } catch {
    return date.toLocaleTimeString();
  }
}

export function formatClockFromIso(iso) {
  const match = String(iso || '').match(/T(\d{2}):(\d{2})/);
  return match ? `${match[1]}:${match[2]}` : '';
}

export function formatDay(dateIso) {
  const date = new Date(String(dateIso) + 'T12:00:00');
  if (Number.isNaN(date.getTime())) return '';
  try {
    return new Intl.DateTimeFormat(locale(), { weekday: 'short', day: 'numeric', month: 'short' }).format(date);
  } catch {
    return date.toLocaleDateString();
  }
}

export function formatNumber(value, digits = 0) {
  const number = Number(value);
  if (!Number.isFinite(number)) return '—';
  try {
    return new Intl.NumberFormat(locale(), {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits
    }).format(number);
  } catch {
    return number.toFixed(digits);
  }
}
