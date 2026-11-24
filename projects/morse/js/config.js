/* Morse Studio — code table, constants and bilingual strings */

export const MORSE = {
  A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.', G: '--.', H: '....',
  I: '..', J: '.---', K: '-.-', L: '.-..', M: '--', N: '-.', O: '---', P: '.--.',
  Q: '--.-', R: '.-.', S: '...', T: '-', U: '..-', V: '...-', W: '.--', X: '-..-',
  Y: '-.--', Z: '--..',
  0: '-----', 1: '.----', 2: '..---', 3: '...--', 4: '....-',
  5: '.....', 6: '-....', 7: '--...', 8: '---..', 9: '----.',
  '.': '.-.-.-', ',': '--..--', '?': '..--..', '!': '-.-.--', '/': '-..-.',
  '(': '-.--.', ')': '-.--.-', '&': '.-...', ':': '---...', ';': '-.-.-.',
  '=': '-...-', '+': '.-.-.', '-': '-....-', '_': '..--.-', '"': '.-..-.',
  '$': '...-..-', '@': '.--.-.', "'": '.----.', 'À': '.--.-', 'È': '.-..-.',
  };

export const PROSIGNS = {
  '.-.-.': 'AA (new line)',
  '...-..-': 'SOS',
  '-.-.--': 'BT (new paragraph)',
  '........': 'HH (error)',
  '.-...': 'WAIT',
  '...-.': 'INT'
};

export const DEFAULT_SETTINGS = Object.freeze({
  wpm: 14, freq: 700, volume: 0.6, strict: false, theme: 'dark', showHints: true
});

export const STR = {
  it: {
    title: 'MORSE STUDIO', tagline: 'Trasmetti, decodifica, ascolta. E impara il codice.', skip: 'Vai al contenuto',
    input: 'Testo', output: 'Morse', live: 'Conversione live', toMorse: '→ Morse', toText: '→ Testo',
    swap: 'Inverti', copy: 'Copia', copied: 'Copiato', clear: 'Pulisci', share: 'Condividi',
    play: 'Riproduci', pause: 'Pausa', stop: 'Ferma', playing: 'Trasmissione…',
    wpm: 'WPM', freq: 'Frequenza', volume: 'Volume', strict: 'Decodifica rigorosa',
    exportWav: 'Esporta WAV', exportTxt: 'Esporta testo', import: 'Importa file',
    drop: 'Trascina un file .txt qui', history: 'Cronologia', favorites: 'Preferiti',
    reference: 'Tabella Morse', search: 'Cerca…', clickToPlay: 'Clicca per ascoltare',
    train: 'Allenamento', flashcards: 'Flashcard', dictation: 'Dettato', speed: 'Velocità',
    guess: 'Qual è il simbolo?', check: 'Verifica', correct: 'Corretto!', wrong: 'Sbagliato',
    score: 'Punteggio', streak: 'Serie', best: 'Record', timeLeft: 'Tempo rimasto',
    start: 'Inizia', again: 'Ancora', hint: 'Suggerimento', unknown: 'Caratteri non supportati',
    empty: 'Nessun contenuto', chars: 'caratteri', symbols: 'simboli',
    settings: 'Impostazioni', theme: 'Tema', reset: 'Azzera progressi',
    lang: 'IT / EN', ok: 'OK', cancel: 'Annulla', shareFail: 'Condivisione non disponibile',
    duration: 'Durata', signal: 'Segnale', ready: 'Pronto', decoding: 'Decodifica automatica'
  },
  en: {
    title: 'MORSE STUDIO', tagline: 'Transmit, decode, listen. And learn the code.', skip: 'Skip to content',
    input: 'Text', output: 'Morse', live: 'Live conversion', toMorse: '→ Morse', toText: '→ Text',
    swap: 'Swap', copy: 'Copy', copied: 'Copied', clear: 'Clear', share: 'Share',
    play: 'Play', pause: 'Pause', stop: 'Stop', playing: 'Transmitting…',
    wpm: 'WPM', freq: 'Frequency', volume: 'Volume', strict: 'Strict decoding',
    exportWav: 'Export WAV', exportTxt: 'Export text', import: 'Import file',
    drop: 'Drop a .txt file here', history: 'History', favorites: 'Favorites',
    reference: 'Morse chart', search: 'Search…', clickToPlay: 'Click to listen',
    train: 'Training', flashcards: 'Flashcards', dictation: 'Dictation', speed: 'Speed run',
    guess: 'Which symbol is it?', check: 'Check', correct: 'Correct!', wrong: 'Wrong',
    score: 'Score', streak: 'Streak', best: 'Best', timeLeft: 'Time left',
    start: 'Start', again: 'Again', hint: 'Hint', unknown: 'Unsupported characters',
    empty: 'Nothing here', chars: 'chars', symbols: 'symbols',
    settings: 'Settings', theme: 'Theme', reset: 'Reset progress',
    lang: 'IT / EN', ok: 'OK', cancel: 'Cancel', shareFail: 'Sharing unavailable',
    duration: 'Duration', signal: 'Signal', ready: 'Ready', decoding: 'Auto decode'
  }
};
