# Miraggio Hotel 🏨

Un piccolo "hotel sociale" in stile Habbo, tutto colorato e simpatico, giocabile da
browser (iPhone-first).

## Come si gioca
1. Scegli un nickname e un look di partenza (pelle, capelli, tuta).
2. Entra al **Miraggio** e cammina toccando il pavimento.
3. Tocca gli ospiti per **chiacchierare**: ti rispondono con battute e ti regalano 🪙 monete.
4. Tocca gli oggetti che **luccicano** ✨ (valigie, slot, pallavolo…): easter egg e altre monete.
5. Usa la **💬 chat** in alto: salutali e reagiscono alle tue parole.
6. Fai le **😄 emote** (balla, saluta, abbraccia…) e guarda gli ospiti reagire.
7. Con le monete vai nel **👕 Guardaroba**: sblocca tagli, accessori (occhiali, cappellino,
   cuffie, coroncina 👑) e colori.
8. Guadagna e colleziona i **distintivi** (da "Neo-arrivato" a "Leggenda vivente" 🌟).

## Stanze
🏨 Atrio · 🕹️ Sala Giochi · 🏊 Piscina · 🪩 Discoteca · 🌷 Giardino · 🍹 Bar dello Spritz.
Ogni stanza ha ospiti fissi con la propria personalità (Lola alla reception, Max il dj,
Rigo il bagnino, Gigi il barman, Leo, Nina, Pino, Ugo e Bibi 🦄).
🔐 **Stanza Segreta** — sbloccata risolvendo il secondo mistero, accesso esclusivo ai detective.
🌦️ **Meteo stagionale** — durante gli eventi il meteo si trasforma (neve a Natale, nebbia a Halloween, petali a Pasqua, onde d'estate).
🏗️ **Room Builder** — entra nella camera per progettare stanze personalizzate con 12 slot, template, codice di condivisione e stanza della settimana.
🗝️ **Società Segreta** — sbloccata con tutti gli achievement completati. 10° piano nascosto, mercato ombra con Chiavi Oscure, NPC esclusivi (Ombra, Veil, Erica), missioni segrete e oggetti rari.

## Tecnica
- **Zero librerie**: canvas 2D, emoji per i mobili, avatar "chibi" disegnati proceduralmente
  (5 tagli di capelli, 5 accessori, palette colori).
- **Persistenza**: salvataggio automatico in localStorage (monete, look, stanza, distintivo).
- **iPhone**: tap-to-move, dock in basso, sheet nativi, safe-area, tastiera mai sotto il
  compositore (in alto), nessuno zoom, target ≥ 40px.
- I bot vagano, parlano tra loro con bolle, reagiscono alle emote e alle parole in chat.


## Personaggi, storie e missioni
- **12 ospiti** con ruolo, look e carattere: a ognuno piacciono certe emote (e glielo dimostrano).
- **Affinità a cuori**: parla e fai le emote giuste per salire di livello.
- **Storie segrete**: al livello 2 e 4 ogni ospite ti svela un segreto; al livello 5 ti regala un **trofeo**.
- **Espansione Storie NPC**: ogni ospite ha 4 archi narrativi completi — **Sogno** (🌟 lvl 1), **Paura** (🌙 lvl 2), **Talento** (⭐ lvl 3), **Relazioni** (💕 lvl 4). Svelando tutti gli archi di tutti i 15 ospiti si rivela il **Segreto dell'Hotel** (🌑). Dialogue inter-NPC che rivelano connessioni nascoste. Titoli speciali: Narratore, Sociologo, Segreto dell'Hotel.
- **3 missioni al giorno** (cambiano ogni giorno) tra 20 obiettivi: chiacchiere, emote, oggetti, chat, stanze e minigiochi.

## Minigiochi
- 🧠 **Memoria di coppie** (con Leo) — trova le 6 coppie in tempo.
- 🕊️ **Whack-a-Tino!** (con Tino) — tocca i gabbiani, quello dorato vale 3 punti.
- 🎰 **Jackpot delle risate** (con Gigi) — punta 5 monete e allinea le emoji.
- 🎪 **Carnival Minigame**: Whack-a-Mole con 4 bersagli, combo system, ricompense
- 💃 **Dance Battle**: rhythm game con 4 frecce, combo system, ricompense
Ogni partita paga in 🪙 e aggiorna i record.

## File
- `index.html` — struttura e stili (mobile-first, colorato)
- `js/data.js` — stanze, ospiti, battute, mobili interattivi, guardaroba, distintivi
- `js/core.js` — motore canvas, movimento, chat/bolle, monete, save

## Test
`node --check` su entrambi i js + smoke test headless (ingresso, stanza, dialogo,
interazioni, emote, chat, acquisti, save, paint su tutte le stanze e tutti i look).

## Extra (pacchetto "tutto")
- 🛏️ **La tua camera**: negozio di mobili (10 oggetti) → li posizioni negli slot e **producono monete ogni 30s**.
- ⏰ **Eventi a orari**: 🍹 Ora dello Spritz (12:00) e 🪩 Festa a sorpresa (21:00): per 30 minuti **le monete valgono il doppio**, con countdown in alto.
- 🏗️ **Room Builder / UGC**: 12 slot in griglia 4x3, template predefiniti, codice base64 per condividere, stanza della settimana con votazione community, badge "Architetto"
- 🗝️ **Società Segreta**: 10° piano nascosto, mercato ombra con Chiavi Oscure + monete, NPC esclusivi (Ombra/Veil/Erica), missioni segrete, oggetti rari. Badge "Soci Pieni" per tutti gli achievement
- ⭐ **Ospite del giorno**: un ospite diverso ogni giorno vale il doppio delle chiacchiere.
- ⬆️ **Livelli giocatore** (XP da ogni attività): dal livello 3 hai il **20% di sconto** nel guardaroba.
- 📖 **Diario del Miraggio**: registra missioni, storie, minigiochi e acquisti (copia/svuota).
- 📔 **Album degli amici**: figurine dei 12 ospiti (livello 2) + bonus +50 🪙 a collezione completa.
- 🧭 **Caccia al tesoro**: quarto minigioco (trova il forziere di Tino in 4 tentativi).
- 📡 **Chat tra schede**: i messaggi appaiono anche in altre schede aperte (BroadcastChannel).
- 🌙 **Atmosfera notte/giorno** sul pavimento delle stanze.
- ⭐ **Hall of Fame — Star Rating**: rating 0.00-5.00 per ogni ospite, media globale, tier Bronze→Diamond, aura stellata visuale, Hall of Fame in-app. Persistente in localStorage.
 - 🐾 **Pet Companion** — animali esotici e unicorni (12 specie), max 3 per volta, adozione dal Nido, **allevamento con 50+ combinazioni fisse** (unicorno+drago=fuoco unicorno, ecc.), catena di ibridazione, evoluzione permanente basata su cura (❤️ fame, felicità, trucchi), titoli: Allevatore, Master Allevatore, Evolver
- 🎭 **Fashion Show Events**: eventi temporizzati con fase pose + votazione bot, premi per top 3
- 🔮 **Fortune Wheel**: ruota giornaliera con 9 segmenti, 3 giri/giorno, premi (monete, XP, titoli, jackpot)
- 👻 **Ghost NPCs**: 5 fantasmi con dialogue unico, spawn notturno, missioni, ricompense, achievement "Paranormale"
- 🌧️ **Weather System**: 6 meteo (sereno, nuvoloso, pioggia, tempesta, neve, nebbia), fulmini, particelle
- 📸 **Photo Mode** con filtri e salva come PNG · 🔊 **Mute** · haptic su iPhone · suoni extra.
- 📱 **PWA installabile**: manifest + service worker (funziona offline).
- 🎓 **Tutorial interattivo**: 10 step progressivi con hint visivi, pulsing glow, skip button
- 👑 **Sistema Titoli**: 16 titoli sbloccabili, display nell'HUD, selezione personalizzata
- 🗺️ **Minimap migliorata**: layout griglia 3x3 con coordinate per ogni stanza, emoji indicatori
- 📸 **Photo Mode**: 10 filtri artistici, preview live, salva PNG ad alta risoluzione con watermark
- 🔍 **Mystery Detective Mode**: 5 storie multi-stanza, indizi da trovare, enigmi da risolvere, ricompense esclusive
- 🎆 **Eventi Stagionali Live**: Halloween (🎃 costume contest, caccia dolcetti, fantasmi), Christmas (🎄 calendario avvento 24 giorni, Secret Santa, pattinaggio), Easter (🥚 caccia uova, missione coniglietto, giardino), Summer (🌊 surf, festa in piscina, tramonto) — con meteo stagionale e particelle speciali

## TODO — Prossimi sviluppi

### 🏆 Grandi Idee Creative
1. ~~🔍 **Mystery Detective Mode** — 5 storie multi-stanza, parlare con NPC, trovare indizi, risolvere enigmi. Ricompense: mobili esclusivi, accesso a stanze segrete, titolo "Detective"~~ ✅ COMPLETATO
2. ~~🎃 **Eventi Stagionali Live** — Trasformazioni basate sul calendario reale: Halloween (fantasmi amichevoli, costume contest), Natale (calendario avvento, Secret Santa), Pasqua (caccia uova), Estate (party, surf)~~ ✅ COMPLETATO
3. ✅ **Hotel Tycoon / Management Sim** — Diventa il manager: assumi personale (Lola, Sergio, Max, Tino, Nina, Rigo), migliora l'hotel (tetto, casinò, penthouse, giardino, spa), riscuoti ricavi. Sbloccabile dopo il 3° mistero.
 4. ✅ **Allevamento ed Evoluzione Pet** — Incrocia due pet per creare ibridi (combinazioni fisse). Catena di ibridazione. Evoluzione permanente basata sulla cura (level 5+, happiness ≥ 90, hunger ≥ 70, 3+ azioni). 50+ combinazioni
5. 🎵 **Music Studio** — Sequencer in-game per creare tracce musicali con 6 strumenti (Batteria, Basso, Sintetizzatore, Melodia, Pad, Percussioni), 4 preset BPM, 8 generi. Salva brani in libreria, condividi codici. Contest DJ settimanali con votazione manuale. Sbloccabile a livello 2 o 100 🪙. Titoli: DJ Novice, DJ Producer, Contest Champion
6. ~~🏗️ **Room Builder / UGC** — Progetta stanze personalizzate. Condividi tramite codice. Feature "Stanza della settimana"~~ ✅ COMPLETATO
7. ~~🕵️ **Società Segreta / Underground** — Sblocca 10° piano con tutti gli achievement. Missioni esclusive, mercato ombra, oggetti rari~~ ✅ COMPLETATO
7. ~~🕵️ **Società Segreta / Underground** — Sblocca 10° piano con tutti gli achievement. Missioni esclusive, mercato ombra, oggetti rari~~ ✅ COMPLETATO
8. ✅ **Espansione Storie NPC** — Ogni NPC ha arco completo: sogno (lvl 1), paura (lvl 2), talento (lvl 3), relazioni (lvl 4). Svelare tutti gli archi di tutti i 15 NPC rivela il segreto dell'hotel (🌑 Segreto Hotel). Titoli: Narratore, Sociologo, Segreto dell'Hotel. Dialogue inter-NPC. Sheet "📖 Storie NPC" con 45/60 arc indicator.
9. ✅ **Dimensioni Parallele** — Versioni "specchio" delle stanze (dark, neon, steampunk). NPC, oggetti, enigmi unici per dimensione. Portali nelle stanze con gateway visivi, puzzle da risolvere per accedere. Titoli: Ombra Errante, Nuotatore Neon, Viaggiatore Temporale, Esploratore Dimensionale.
10. 🤖 **Conversazioni NPC con AI** — NPC che ricordano conversazioni. Dialogue generato. NPC formano opinioni e relazioni

### 🔧 Bug Corretti (12/12)
- [x] Bug #8: `D.bots.forEach()` crasha Fashion Show → `Object.keys()`
- [x] Bug #6: `ghost_bride` stanza `ballroom` → `discoteca`
- [x] Bug #7: `ghost_musician` stanza `lobby` → `bar`
- [x] Bug #9: Pet egg Fortune Wheel → ora adotta pet casuale
- [x] Bug #10: Title Fortune Wheel → ora assegna titolo casuale
- [x] Bug #5: `first_lvl` + `first_trophy` → aggiunti `unlockAch()` in `onLevelUp()`
- [x] Bug #3: `collect_5` → aggiunto contatore `st.stats.totalCollected`
- [x] Bug #1: Missioni fantasma → sistema `advanceGhostMission()` collegato a emote/collezioni
- [x] Bug #11: `dbEmotes` → rimosso `openFsOverlay()` da handler
- [x] Bug #12: Minimap → posizioni griglia calcolate dinamicamente
- [x] Bug #4: `night_visit` → aggiunte parentesi per precedenza operatori
- [x] Bug #2: `roomTransition` → implementata transizione fade 400ms

### 🎮 Funzionalità Mancanti
- [x] Tutorial/Onboarding: 10 step progressivi, hint visivi, skip button
- [x] Conferma adozione pet: modale con emoji, nome specie, tier
- [x] Rename pet: dialogo in-game con input, Enter/Escape support (attualmente usa `prompt()`)
- [x] Sistema titoli: 16 titoli, display in HUD, selezione, unlock da achievement
- [x] Minimap: coordinate x,y per ogni stanza, layout griglia 3x3, emoji stanze

### 🎨 Polish Visivo
- [x] Hover/touch feedback: scale animazioni, -webkit-tap-highlight-color, :active states
- [ ] Conferma modale per azioni importanti
- [ ] Animazioni UI migliorate

### 🎵 Audio
- [ ] Room music / ambient audio per stanza
- [ ] Sound engine migliorato (Web Audio API spaziale)
- [ ] Effetti sonori per: meteo, fantasma, lvl up, fashion show

### 📱 Mobile
- [x] Photo Mode: 10 filtri (vintage, noir, warm, cool, dramatic, dreamy, neon, retro, midnight), preview, salva PNG
- [ ] Gesture emote (swipe per ballare, etc.)
