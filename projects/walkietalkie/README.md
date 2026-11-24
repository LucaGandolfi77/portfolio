# 📻 Walkie Talkie

Walkie talkie P2P con interfaccia **liquid glass**: push-to-talk, audio in rete mesh fra tutti gli operatori, messaggi rapidi, VU meter e controlli radio. Nessun server audio: la voce viaggia direttamente fra i browser via WebRTC.

## Quickstart

```bash
# dalla root del portfolio
python3 -m http.server 8000
# apri http://localhost:8000/projects/walkietalkie/index.html
```

1. Clicca **Crea canale**: viene generato un ID a 4 caratteri (es. `K7Q2`).
2. Condividi l'ID o il link `#channel=K7Q2`.
3. Gli altri cliccano **Unisciti**, inseriscono l'ID e premono **Sintonizza**.
4. Tieni premuto il pulsante rosso (o la **barra spaziatrice**) per trasmettere.

Al primo accesso il browser chiede il permesso microfono. La traccia locale resta **disattivata** finché non trasmetti: non c'è ascolto passivo.

## Funzionalità

- **Mesh P2P reale**: l'host coordina la lista operatori; ogni client si collega agli altri (la parte con ID lessicograficamente minore apre la connessione, evitando duplicati). Non c'è un solo canale host↔client.
- **PTT**: mouse, touch e tastiera, più **lock TX** per parlare a mani libere (premi di nuovo per rilasciare).
- **Indicatori TX/RX**: LED, testo sul display e lista operatori evidenziano chi sta parlando.
- **VU meter** live sul microfono, volume altoparlante, mute remoto, scelta del dispositivo audio.
- **Audio processing**: cancellazione eco, riduzione rumore e guadagno automatico configurabili.
- **Squelch**: burst di statica e beep RX generati con un unico `AudioContext` riutilizzato.
- **Chat** sul data channel con messaggi rapidi ("Ricevuto", "Roger", "Attendi", "Ripeti", "Passo").
- **Link condivisibile** con hash `#channel=XXXX`, cronologia canali recenti, riconnessione automatica e timeout chiamate.
- **Server di segnalazione configurabile** (host, porta, TLS) per usare un PeerServer locale.
- **Liquid glass**: layer CSS universale + rifrazione SVG solo Chromium, EN/IT, PWA offline, responsive.

## Architettura

```
walkietalkie/
├── index.html · css/app.css · manifest · icon.svg · icons/ · sw.js
├── vendor/peerjs.min.js        PeerJS 1.5.2 vendoriato (nessun CDN)
├── js/
│   ├── config.js               default, messaggi rapidi, stringhe EN/IT
│   ├── i18n.js · storage.js · glass.js
│   ├── audio.js                getUserMedia, analyser, VU, static burst, beep
│   ├── network.js              PeerJS: host/join, mesh, peer list, chat, riconnessione
│   ├── ui.js                   display radio, PTT, peer list, chat, modali, toast
│   └── main.js                 orchestrazione
└── tests/logic-test.mjs
```

I moduli `audio.js`, `network.js` e `storage.js` non contengono markup: la logica di rete è testabile in Node con stub.

## Come funziona la mesh

- Il joiner apre sempre un data channel e una chiamata verso l'host.
- L'host invia al nuovo arrivato la lista degli altri peer e avvisa gli altri del nuovo arrivo.
- Per ogni coppia di client, **solo il peer con ID minore** apre data channel e chiamata: così non si creano connessioni doppie.
- Chiusure ed errori propagano `peer_leave` e rimuovono l'elemento `<audio>` corrispondente.

## Limiti

- PeerJS usa un **server di segnalazione** (default `0.peerjs.com`) per scambiare gli ID: serve internet o un PeerServer locale in LAN. La voce, invece, è end-to-end via WebRTC.
- Dietro NAT restrittivi può essere necessario uno STUN/TURN configurato in `network.js`.
- Ogni peer apre N−1 connessioni audio: oltre ~8 operatori il carico cresce rapidamente (per gruppi grandi serve un SFU).
- `getUserMedia` richiede `https://` o `localhost`.

## PeerServer locale (opzionale)

```bash
npm i -g peer
peerjs --port 9000 --path /myapp
```

Poi in **Impostazioni** imposta Host `localhost`, Porta `9000`, disattiva TLS.

## Test

```bash
node projects/walkietalkie/tests/logic-test.mjs
```

Copre configurazione/i18n, storage, codec canale, struttura dei moduli, PWA e assenza di CDN.
