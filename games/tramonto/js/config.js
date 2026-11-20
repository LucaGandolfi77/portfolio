/* Sunset Compass — configuration, phases and bilingual strings */

export const STR = {
  it: {
    appTitle: 'Sunset Compass',
    permTitle: 'Sunset Compass',
    permDesc: 'Scopri quando il sole scende sotto l’orizzonte. GPS, bussola e realtà aumentata per seguire ogni tramonto.',
    permPrivate: 'Servono permessi di posizione e orientamento.<br>I dati restano sul tuo dispositivo.',
    start: 'Inizia', loading: 'Caricamento…',
    navCompass: 'Bussola', navCamera: 'Camera', navTracker: 'Timeline',
    nextSunset: 'Prossimo tramonto', sunsetAt: 'Tramonto alle',
    sunriseIn: 'Alba tra', nightFallback: 'Notte',
    gpsUnknown: 'Posizione sconosciuta', gpsDenied: 'GPS non disponibile · Milano',
    sun: 'Sole', obstacles: 'ostacoli', obstacleOne: 'ostacolo',
    tapHint: 'Tocca l’orizzonte per segnare un ostacolo',
    cameraUnavailable: 'Camera non disponibile', cameraHint: 'Abilita i permessi della fotocamera',
    sunset: 'Tramonto', goldenHour: 'Golden hour', blueHour: 'Blue hour',
    belowObstacle: 'sotto ostacolo', sunrise: 'Alba',
    day: 'Giorno', golden: 'Luce dorata', blue: 'Blue hour', night: 'Notte',
    daysShort: 'g', hoursShort: 'h', minutesShort: 'm', secondsShort: 's',
    altitude: 'Altitudine', azimuth: 'Azimut', declination: 'Declinazione',
    clearObstacles: 'Cancella ostacoli', cleared: 'Ostacoli cancellati',
    demoTitle: 'Modalità demo', demoText: 'Posizione o permessi non disponibili: uso Milano come riferimento. Puoi continuare a esplorare l’interfaccia.',
    ok: 'OK', close: 'Chiudi', lang: 'IT / EN', phase: 'Fase', inMinutes: 'tra'
  },
  en: {
    appTitle: 'Sunset Compass',
    permTitle: 'Sunset Compass',
    permDesc: 'Find out when the sun dips below the horizon. GPS, compass and augmented reality to follow every sunset.',
    permPrivate: 'Location and orientation permissions are required.<br>Your data stays on your device.',
    start: 'Start', loading: 'Loading…',
    navCompass: 'Compass', navCamera: 'Camera', navTracker: 'Timeline',
    nextSunset: 'Next sunset', sunsetAt: 'Sunset at',
    sunriseIn: 'Sunrise in', nightFallback: 'Night',
    gpsUnknown: 'Unknown location', gpsDenied: 'GPS unavailable · Milan',
    sun: 'Sun', obstacles: 'obstacles', obstacleOne: 'obstacle',
    tapHint: 'Tap the horizon to mark an obstacle',
    cameraUnavailable: 'Camera unavailable', cameraHint: 'Enable camera permissions',
    sunset: 'Sunset', goldenHour: 'Golden hour', blueHour: 'Blue hour',
    belowObstacle: 'below obstacle', sunrise: 'Sunrise',
    day: 'Day', golden: 'Golden light', blue: 'Blue hour', night: 'Night',
    daysShort: 'd', hoursShort: 'h', minutesShort: 'm', secondsShort: 's',
    altitude: 'Altitude', azimuth: 'Azimuth', declination: 'Declination',
    clearObstacles: 'Clear obstacles', cleared: 'Obstacles cleared',
    demoTitle: 'Demo mode', demoText: 'Location or permissions unavailable: using Milan as a reference. You can still explore the interface.',
    ok: 'OK', close: 'Close', lang: 'IT / EN', phase: 'Phase', inMinutes: 'in'
  }
};

/* Sky palettes by sun altitude. Each phase is a full visual theme. */
export const PHASES = {
  day: {
    sky: ['#123b73', '#2f7bbf', '#f3b865'],
    glow: 'rgba(255,214,140,.75)', horizon: '#1c3550', accent: '#ffd166',
    txt: '#f6f3ff', dim: '#b9c9dd', card: 'rgba(12,26,46,.62)'
  },
  golden: {
    sky: ['#20143f', '#7a2e56', '#f08a3c'],
    glow: 'rgba(255,150,80,.8)', horizon: '#3a2030', accent: '#ff9f68',
    txt: '#fff3e6', dim: '#d2b6a6', card: 'rgba(30,16,36,.66)'
  },
  blue: {
    sky: ['#060b28', '#13264f', '#3c4a80'],
    glow: 'rgba(120,170,255,.55)', horizon: '#101a38', accent: '#7fb4ff',
    txt: '#e8eeff', dim: '#9aabc9', card: 'rgba(8,14,38,.7)'
  },
  night: {
    sky: ['#03040f', '#0a0c22', '#1a1538'],
    glow: 'rgba(150,140,255,.42)', horizon: '#08091c', accent: '#a98bff',
    txt: '#e8e5ff', dim: '#8f90b5', card: 'rgba(8,9,26,.74)'
  }
};

export const CARDINALS = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
  'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];

export const DEFAULT_POS = { lat: 45.4642, lon: 9.1900, name: 'Milano, IT' };
