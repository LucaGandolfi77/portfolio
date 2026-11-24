/* Walkie Talkie — configuration, presets and bilingual strings */

export const QUICK_MSGS = [
  { id:'copy', en:'Copy that', it:'Ricevuto' },
  { id:'roger', en:'Roger', it:'Roger' },
  { id:'wait', en:'Stand by', it:'Attendi' },
  { id:'repeat', en:'Say again', it:'Ripeti' },
  { id:'over', en:'Over', it:'Passo' }
];

export const DEFAULT_SETTINGS = Object.freeze({
  lang:'en', theme:'dark', volume:0.8, pttLock:false, squelch:true, muted:false,
  echoCancel:true, noiseSuppression:true, autoGain:true,
  deviceId:'', signalingHost:'0.peerjs.com', signalingPort:443, signalingSecure:true
});

export const STR = {
  it: {
    skip:'Vai al contenuto', title:'WALKIE TALKIE', tagline:'Voce P2P nella tua tasca',
    create:'Crea canale', join:'Unisciti', channel:'Frequenza / Canale', share:'Condividi ID',
    copyLink:'Copia link', copy:'Copia', back:'Indietro', tune:'Sintonizza',
    createTitle:'Nuovo canale', joinTitle:'Entra nel canale', connect:'Connetti',
    waiting:'In attesa di operatori…', shareId:'Condividi questo ID con i tuoi amici',
    enterId:'Inserisci l’ID del canale', offline:'OFFLINE', listening:'IN ASCOLTO',
    connecting:'CONNESSIONE…', connected:'CONNESSO', transmitting:'TRASMISSIONE',
    receiving:'RICEZIONE DA', muted:'SILENZIATO', clients:'Operatori',
    hold:'Tieni premuto', toTalk:'per parlare', talk:'Parla', release:'Rilascia',
    lock:'Lock TX', settings:'Impostazioni', recent:'Canali recenti', chat:'Messaggi',
    send:'Invia', typeMessage:'Scrivi un messaggio…', close:'Chiudi', ok:'OK',
    cancel:'Annulla', error:'Errore', micDenied:'Microfono negato: controlla i permessi del browser',
    noPeer:'Canale non trovato o non raggiungibile', copied:'ID copiato', linkCopied:'Link copiato',
    mic:'Microfono', speaker:'Volume altoparlante', device:'Dispositivo audio',
    echo:'Cancellazione eco', noise:'Riduzione rumore', gain:'Guadagno automatico',
    squelch:'Squelch (rumore TX/RX)', lockMode:'PTT a blocco', signaling:'Server di segnalazione',
    host:'Host', port:'Porta', secure:'Connessione sicura (TLS)', reset:'Disconnetti',
    docs:'Documentazione', theme:'Tema', lang:'IT / EN', who:'In rete',
    echoNote:'La segnalazione richiede internet o un PeerServer locale.',
    emptyChat:'Nessun messaggio. Prova un messaggio rapido.', idle:'Pronto'
  },
  en: {
    skip:'Skip to content', title:'WALKIE TALKIE', tagline:'P2P voice in your pocket',
    create:'Create channel', join:'Join channel', channel:'Frequency / Channel', share:'Share ID',
    copyLink:'Copy link', copy:'Copy', back:'Back', tune:'Tune in',
    createTitle:'New channel', joinTitle:'Join a channel', connect:'Connect',
    waiting:'Waiting for operators…', shareId:'Share this ID with your friends',
    enterId:'Enter the channel ID', offline:'OFFLINE', listening:'LISTENING',
    connecting:'CONNECTING…', connected:'CONNECTED', transmitting:'TRANSMITTING',
    receiving:'RECEIVING FROM', muted:'MUTED', clients:'Operators',
    hold:'Hold', toTalk:'to talk', talk:'Talk', release:'Release',
    lock:'TX lock', settings:'Settings', recent:'Recent channels', chat:'Messages',
    send:'Send', typeMessage:'Type a message…', close:'Close', ok:'OK',
    cancel:'Cancel', error:'Error', micDenied:'Microphone denied: check browser permissions',
    noPeer:'Channel not found or unreachable', copied:'ID copied', linkCopied:'Link copied',
    mic:'Microphone', speaker:'Speaker volume', device:'Audio device',
    echo:'Echo cancellation', noise:'Noise suppression', gain:'Automatic gain',
    squelch:'Squelch (TX/RX noise)', lockMode:'PTT lock', signaling:'Signaling server',
    host:'Host', port:'Port', secure:'Secure connection (TLS)', reset:'Disconnect',
    docs:'Documentation', theme:'Theme', lang:'IT / EN', who:'Online',
    echoNote:'Signaling needs internet access or a local PeerServer.',
    emptyChat:'No messages yet. Try a quick message.', idle:'Ready'
  }
};
