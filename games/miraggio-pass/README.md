# Miraggio Pass 🏅

Un'unica progressione cross-game per tutto il portfolio. Legge i salvataggi `localStorage`
già esistenti dei giochi, assegna XP, livelli, sfide quotidiane, streak e badge.
Nessun server, nessun account, funziona offline come PWA.

## File

- `index.html` — hub (dashboard, giochi, sfide, badge, profilo)
- `css/style.css` — tema med-tech arcade, responsive e iPhone-friendly
- `js/catalog.js` — catalogo di ~80 giochi con adapter sui **veri** `localStorage` del portfolio
- `js/app.js` — motore XP, streak, sfide, badge, backup
- `js/bridge.js` — script opzionale da includere nei giochi per il rilevamento automatico
- `manifest.webmanifest`, `icon.svg`, `sw.js` — PWA offline

## Come funziona

1. **Rilevamento automatico**: all'apertura l'hub scansiona `localStorage` e, per ogni
   gioco del catalogo, estrae il record (es. `snake_highScore`, `flappy-neon-v1`,
   `scalpel_save`, `royale-lab-v1`). Se il record è migliorato, assegna XP proporzionali.
   Nessuna modifica ai giochi è necessaria.
2. **Sfide quotidiane**: 3 sfide diverse al giorno, scelte in modo deterministico dalla
   data (seed condiviso): "gioca 3 giochi", "batti un record", "gioca 2 arcade", ecc.
3. **Streak e badge**: giorni consecutivi, collezioni per categoria, traguardi XP.
4. **Check-in manuale**: per i giochi senza chiavi note, l'utente può premere "Check-in":
   conta comunque per le sfide giornaliere.

## Integrare un nuovo gioco (opzionale)

Aggiungi **una riga** nel `<head>` del gioco:

```html
<!-- giochi in games/ -->
<script src="../miraggio-pass/js/bridge.js"></script>

<!-- giochi in projects/ o sottocartelle: adatta il percorso -->
<script src="../../games/miraggio-pass/js/bridge.js"></script>
```

Il bridge:

- intercetta `localStorage.setItem` e accoda automaticamente ogni cambio di record;
- invia un `pageview` con il percorso della pagina;
- espone `Miraggio.emit('custom', {...})` per eventi espliciti;
- espone `Miraggio.getProfile()` → `{ level, xp, title, streak, badges }`.

L'hub svuota la coda `miraggio_events` e aggiorna XP/sfide. Tutto resta sul dispositivo.

## Aggiungere un gioco al catalogo

In `js/catalog.js` aggiungi una voce:

```js
G('id','Nome','🎮','arcade','nome-file.html','games',num('chiave_record'),'Record',5)
```

Adapter disponibili: `num(key)`, `prefMax(prefix)`, `jsonFields(key, [campi])`, `exists([chiavi])`.

## livelli

Tirocinante → Specializzando → Residente → Medico di Guardia → Primario →
Direttore → Professore → Leggenda del Miraggio → Immortale.

## Privacy

Solo `localStorage` del browser. Nessuna rete, nessun analytics, nessun tracciamento.
I progressi si possono esportare/importare come JSON dal profilo.
