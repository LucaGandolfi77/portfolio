# ♛ THE ROYAL DERBY

Simulatore di corse ippiche in stile "very British royal": scommesse, paddock, meteo, tre ippodromi, telecronaca bilingue e un **fotofinish 3D** con replay rallentato.

**Live:** <https://lucagandolfi77.github.io/portfolio/projects/horse-simulator/>

## Cosa fa

- **Vista 2D della corsa**: prato texture, pista a corsie, ringhiera, tribune, scacchi del traguardo, polvere, ombre, alone oro sulle puntate e condizioni meteo.
- **Fotofinish 3D**: scena Three.js low-poly con cavalli e fantini, linea d'arrivo a scacchi, tribune, bandiere, luci e coriandoli. Replay con velocità 0.25×/0.5×/1×, tre angolazioni e barra di scrub; il verdetto usa tempi interpolati al centesimo.
- **Scommesse**: Win, Place, Each-way (1/5 quote) e Forecast (primi due in ordine), quote dinamiche, ticket e rimborsi.
- **Meteo e terreno**: Sun/Cloud/Rain/Wind e Firm/Good/Soft/Heavy; modificano velocità, resistenza e scatto.
- **Ippodromi**: Ascot (ovale 2 giri), Epsom (1,5 giri in discesa), Newmarket (3 giri).
- **Paddock**: rinomina cavalli, cambia silks, jockey assegnati, statistiche e carriera.
- **Stagione**: punti 12-8-6-4-2-1, vittorie e trofei persistiti in `localStorage`.
- **Audio** sintetizzato (campanello, galoppo, boato, flash), export PNG della result card, bilingue IT/EN.

## Architettura

```text
projects/horse-simulator/
├─ index.html              # shell + importmap Three.js
├─ css/app.css             # design system regale
├─ js/
│  ├─ sim.js               # PURO: fisica, quote, scommesse, meteo, stagione
│  ├─ track.js             # renderer 2D
│  ├─ finish3d.js          # scena Three.js + replay
│  ├─ ui.js                # pannelli e liste
│  ├─ audio.js             # WebAudio
│  ├─ i18n.js / storage.js
│  └─ main.js              # state machine e orchestrazione
├─ tests/sim.test.mjs
└─ icon.svg / manifest / sw.js
```

Il fotofinish registra gli ultimi ~150 campioni (≈2,5 s) di corsa e li interpola nella scena 3D. La simulazione è separata dal DOM ed è testata in Node.

## Dati e privacy

`royalderby_v1` contiene wallet, nomi, colori, jockey, carriera, classifica e preferenze; `royalderby.lang` la lingua. Nessun dato lascia il dispositivo. Three.js e il font serif arrivano da CDN al primo avvio.

## Sviluppo e test

```bash
python3 -m http.server 8080
# http://localhost:8080/projects/horse-simulator/

node --test projects/horse-simulator/tests/*.test.mjs
node --check projects/horse-simulator/js/main.js
```

Gli hook `window.__DERBY__` (runFull, step, reset, toggleBet) permettono test end-to-end della corsa completa.
