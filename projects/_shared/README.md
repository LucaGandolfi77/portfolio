# Project Kit

Il livello condiviso dei progetti in `/projects`. Non è un framework: sono
token CSS, componenti e una shell JavaScript senza dipendenze.

## File

| File | Cosa fa |
|---|---|
| `tokens.css` | Colori, spazi, raggi, ombre, tipografia, safe area, tre skin (`lab`, `play`, `calm`). |
| `base.css` | Reset, accessibilità, bottoni, card, form, segmented control, chip, dialog, empty state. |
| `shell.css` | Barra progetto fissa, menu, toast, dialog di conferma. |
| `shell.js` | Costruisce la barra, gestisce preferiti, share, tema, lingua, toast e conferme. |
| `./_template.html` | Scheletro di partenza per una pagina nuova. |

## Uso minimo

```html
<html lang="en" data-skin="lab">
<head>
  <link rel="stylesheet" href="../projects/_shared/tokens.css">
  <link rel="stylesheet" href="../projects/_shared/base.css">
  <link rel="stylesheet" href="../projects/_shared/shell.css">
</head>
<body>
  <header
    data-project-shell
    data-title="My Project"
    data-id="my-project"
    data-back="../../projects.html"
    data-home="../../index.html"
    data-languages="en,it"></header>

  <main id="app" class="pf-container" data-app="my-project">
    ...
  </main>

  <script src="../projects/_shared/shell.js" defer></script>
</body>
</html>
```

## Regole

1. **Opt-in.** Una pagina usa la shell solo se ha `data-project-shell`. Le
   pagine non migrate continuano a funzionare con `top_buttons.js`.
2. **Un solo `<h1>`.** La shell rende il titolo come `<h1>` per le pagine
   nuove. Se la pagina ha già un suo `<h1>`, usa `data-heading="div"` sulla
   shell e mantieni l’`<h1>` nel contenuto.
3. **Niente `alert()`/`confirm()`.** Usa `ProjectShell.toast()` e
   `ProjectShell.confirm()`.
4. **Niente stili duplicati.** Se un componente esiste in `base.css`, usalo.
   Aggiungi stili solo per il layout specifico.
5. **Token, non colori.** Usa `var(--pf-accent)`, `var(--pf-surface)`, ecc.
6. **Safe area.** La shell gestisce già il notch. Per il contenuto usa
   `var(--pf-safe-bottom)` quando serve.
7. **Lingua.** La shell emette `project:langchange` con `detail.lang`. La
   pagina ascolta e aggiorna i propri testi. All’avvio leggi
   `window.__PROJECT_LANG__` oppure `document.documentElement.lang`.
8. **Storage.** Le chiavi della shell sono `pf.shell.*`. Le chiavi della
   pagina devono essere `pf.<project>.*`.
9. **Niente dipendenze dalla shell per la logica.** La pagina deve funzionare
   anche se `shell.js` non carica (con una barra minima o senza barra).

## API della shell

```js
ProjectShell.toast('Salvato');
await ProjectShell.confirm({ title: 'Cancellare?', message: '...', confirmText: 'Cancella' });
ProjectShell.setTitle('Nuovo titolo');
ProjectShell.getLang();       // 'en' | 'it' | ...
ProjectShell.setLang('it');   // aggiorna storage + evento
ProjectShell.getId();
ProjectShell.isFavorite();
ProjectShell.toggleFavorite();
```

## Migrazione di una pagina esistente

1. Aggiungi i tre `<link>` del kit.
2. Sostituisci `top_buttons.js` con `shell.js` e aggiungi l’header
   `data-project-shell`.
3. Rimuovi la vecchia barra/back-link e gli spazi compensati con
   `--site-top-bar-height`.
4. Se la pagina ha già un `<h1>`, passa `data-heading="div"`.
5. Verifica che il contenuto non finisca sotto la barra: la shell aggiunge
   `padding-top` al body.
6. Prova 320 px, 390 px e desktop; controlla focus, zoom e reduced motion.

## Test

Il kit è statico. La verifica minima:

```bash
node --check projects/_shared/shell.js
node scripts/audit-projects.mjs
```

Per le pagine che usano la shell, aggiungi uno smoke test DOM o Playwright che
verifichi: barra presente, titolo corretto, link “All projects”, menu apribile,
toast visibile, nessun errore console.

**Esempi completi:** `projects/qr-studio/`, `projects/atlas/`, `projects/vision-lab/` e `projects/text-lab/` mostrano il flusso
consigliato (logica pura, DOM/Playwright, PWA e cache versionata):

```bash
node --test projects/qr-studio/tests/*.test.mjs   # logica, raster, DOM, struttura
cd tools/quality && npm test                      # Playwright desktop + mobile
```

Il workflow `.github/workflows/quality.yml` esegue gli stessi comandi e viene
richiamato dal deploy: un test rosso blocca la pubblicazione. L’audit statico
usa `tools/quality/audit-baseline.json` per fallire solo sui problemi nuovi.
