# SCARLIUS — Free Beer Party 🍺

Avventura grafica **punta-e-clicca** (stile Monkey Island / Thimbleweed Park moderno) in una notte
folle dentro lo **Scarlius**, un bar iconico e vibrante. PWA con **Phaser 3**, ottimizzata per
**iPhone (verticale 9:16, tap a una mano, inventario a comparsa in basso)**. UI in **italiano**
con toggle **EN** in alto.

## La storia
Ti sei appena integrato nella fauna dello Scarlius. L'obiettivo: sbloccare situazioni assurde e
attivare l'evento leggendario: il **Free Beer Party alla Playa**. Ogni personaggio ha un bisogno
stravagante e solo risolvendoli tutti scatenerai la notte perfetta.

## Come si gioca
1. **Sala Principale** — parla con **Thomas**, il barista tuttofare con ansia da prestazione:
   raccogli i **5 bicchieri vuoti** (luccicano ✨ sui tavoli) e in cambio avrai la
   **Chiave Dorata del Bagno**.
2. **Bancone** — **Luca**, il Re del Flair, ti sfida a **Flair Master Touch** (tap a tempo sugli
   anelli). Vinci e ottieni lo **Scarlius Inferno**.
3. **Sala** — usa lo Scarlius Inferno su **Davide**, il proprietario sportivo in coma da
   highlights. Risvegliato, ti sfida a **Trash Can Basketball** (drag-and-release): 3 canestri di
   fila e arrivano i **Fusti di Birra** + il via libera ufficiale.
4. **Bagno** — entra con la chiave: **Ercole**, il DJ mitologico, fa la doccia cantando. Sincronizza
   le onde sonore sulla sua console (**DJ Deck Sync**) e, coi fusti approvati… **FREE BEER FOR EVERYONE!**
5. **La Playa** 🏖️ — epilogo: Ercole alla console sulla sabbia, Davide che passa i fusti, Luca che
   lancia bottiglie illuminate sotto le stelle e Thomas che finalmente si rilassa con una birra.

## Struttura del codice
- `js/data.js` — stato e quest + **tutti i testi i18n** (IT/EN): battute, alberi di dialogo,
  scena del bagno con Ercole.
- `js/main.js` — config Phaser 720×1280 (Scale.FIT) + BootScene (texture procedurali, zero asset).
- `js/rooms.js` — RoomScene: 4 stanze navigabili con swipe/frecce, hotspot, inventario bottom-sheet.
- `js/dialogue.js` — DialogueScene a scelta multipla.
- `js/minigames.js` — i 3 minigiochi touch.
- `js/audio.js` — sintetizzatore WebAudio (feedback minigiochi, beat della Playa).

## Tecnica
- **Phaser 3 vendored localmente** → PWA 100% offline (service worker cache-first).
- **Zero asset grafici**: personaggi e oggetti disegnati proceduralmente (neon-cartoon).
- **Auto-save** in localStorage: riprendi la notte da dove l'hai lasciata.
- iPhone: tap-to-interact, safe-area, niente zoom, target ≥ 40px.
