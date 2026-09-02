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
- **3 missioni al giorno** (cambiano ogni giorno) tra 20 obiettivi: chiacchiere, emote, oggetti, chat, stanze e minigiochi.

## Minigiochi
- 🧠 **Memoria di coppie** (con Leo) — trova le 6 coppie in tempo.
- 🕊️ **Whack-a-Tino!** (con Tino) — tocca i gabbiani, quello dorato vale 3 punti.
- 🎰 **Jackpot delle risate** (con Gigi) — punta 5 monete e allinea le emoji.
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
- ⭐ **Ospite del giorno**: un ospite diverso ogni giorno vale il doppio delle chiacchiere.
- ⬆️ **Livelli giocatore** (XP da ogni attività): dal livello 3 hai il **20% di sconto** nel guardaroba.
- 📖 **Diario del Miraggio**: registra missioni, storie, minigiochi e acquisti (copia/svuota).
- 📔 **Album degli amici**: figurine dei 12 ospiti (livello 2) + bonus +50 🪙 a collezione completa.
- 🧭 **Caccia al tesoro**: quarto minigioco (trova il forziere di Tino in 4 tentativi).
- 📡 **Chat tra schede**: i messaggi appaiono anche in altre schede aperte (BroadcastChannel).
- 🌙 **Atmosfera notte/giorno** sul pavimento delle stanze.
- 📸 **Salva il tuo look** come PNG · 🔊 **Mute** · haptic su iPhone · suoni extra.
- 📱 **PWA installabile**: manifest + service worker (funziona offline).
