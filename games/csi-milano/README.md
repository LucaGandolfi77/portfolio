# CSI: Milano — Orazio Caino, il detective dai capelli rossi

Parodia di **CSI: Miami** ambientata a Milano. Orazio Caino (sì, proprio quel
nome) ha i capelli rossi, gli occhiali da sole e un one-liner per ogni
occasione. Tu sei il suo assistente: tocchi, indaghi, interroghi e accusi. Lui
mette la faccia. E gli occhiali.

## Come si gioca (solo touch)

1. **Tocca i punti luminosi** sulla scena per raccogliere indizi.
2. **Interroga i sospetti** (si sblocca con abbastanza indizi): le domande
   giuste fanno emergere le contraddizioni.
3. **Apri il Quaderno degli Indizi**, scegli il colpevole e le prove che lo
   inchiodano.
4. Accusa giusta → occhiali da sole, one-liner, caso chiuso. Accusa sbagliata
   → il **Cervello di Caino** scende e Milano ride di te (in silenzio, da
   milanese).

Il pulsante 🕶 fa dire a Orazio una frase celebre in qualsiasi momento. Perché
sì.

## Due viste della scena

- **Scena illustrata** (default): Milano disegnata in tempo reale con PixiJS —
  Duomo con la Madonnina d'oro e folla animata, Navigli con barche e luci che
  scintillano, tram 19 che passa, neon del Bar Basso, stendini a Brera, il
  gatto di Baudelaire sul davanzale, il banco di frutta di Carmelo con le
  arance (presagio, presagio).
- **Mappa 2D dall'alto** (pulsante 🗺 nella barra): la stessa indagine su una
  pianta top-down della zona, con i punti da esaminare come spilli pulsanti.
  **È anche il fallback automatico**: se WebGL/Pixi non è disponibile sul
  dispositivo, il gioco passa da solo alla mappa 2D (Canvas 2D, niente WebGL)
  e resta perfettamente giocabile.

## I casi (difficoltà ascendente)

1. **Il Gatto di Brera è Scomparso** — Baudelaire, 40.000 follower, è stato
   "adottato". Con le virgolette.
2. **Il Panettone da Record** — 100 chili di Natale svaniti nel nulla.
3. **Il Tram 19 è Scomparso** — ritrovato rosa davanti a San Siro.
4. **Il Negroni Sbagliato Rubato** — il ricettario del 1967 al Bar Basso.
5. **La Madonnina è Scomparsa** — al suo posto, un cartello "OUT OF ORDER".
6. **L'Arancia-Killer** — il caso più famoso di Milano. Spoiler: il colpevole
   ha le ali e un ciuffo.

## Tecnica

- **PixiJS v8** (WebGL 2D, `vendor/pixi.min.js`) — scene, personaggi e avatar
  disegnati proceduralmente in tempo reale, zero asset.
- **GSAP 3** (`vendor/gsap.min.js`) — animazioni, flash degli occhiali,
  transizioni.
- Audio 100% WebAudio sintetizzato (zero file), salvataggio in localStorage,
  UI touch-only ottimizzata per iPhone (safe-area, pulsanti ≥ 52px).
- Funziona offline e da `file://`.

## Idee per la prossima versione

Vedi il messaggio dell'autore; in breve: indizi falsi che portano a
mini-casi, la modalità "Rallenty" (CSI docet), il panettone-killer come caso
bonus, più Milano (Area C, San Siro, la Darsena, i portici), battute in
dialetto, e un "Archivio di Fontana" con i casi risolti. E Gigio: Gigio merita
un DLC.

*CSI: Milano — parodia non ufficiale. Nessun gabbiano è stato ingiustamente
accusato. Beh, Gigio sì.*
