# 🖥️ CelloOS — un desktop del 1994 nel browser

Evoluzione del clone di Cello 1.01a: il browser è ora **un'app dentro un vero sistema operativo desktop** ricreato con tecnologie web, zero dipendenze esterne.

## Cosa c'è

### Desktop
- Boot screen, sfondi selezionabili (verde acqua, tempesta, sabbia, stellato, prato)
- Icone desktop, doppio clic per aprire le app
- Taskbar con Start, pulsanti finestre, tray con suono, notifiche e orologio
- Start menu con griglia programmi, documenti recenti, impostazioni, info, spegnimento
- Centros notifiche, modal di sistema, toast

### Window manager
- Finestre trascinabili e ridimensionabili con Pointer Events (touch incluso)
- Focus/z-index, minimize, maximize, chiudi, taskbar sincronizzata
- `Alt+Tab` cambia finestra, `Alt+F4` chiude, `Win`/`Ctrl+Esc` apre Start

### App native
- **Cello Browser**: le 14 pagine del web 1994, link cliccabili, history, preferiti, modem live via `r.jina.ai`, suono moderno corretto
- **Esplora file** su file system virtuale in localStorage
- **Blocco note** con autosave su VFS, apre `.txt`
- **Terminale** con comandi reali (`help`, `ls`, `cd`, `cat`, `echo > file`, `mkdir`, `rm`, `open`, `date`, `ver`, `clear`)
- **Calcolatrice**, **Impostazioni**, **Informazioni di sistema**

### File system
`Cello:/Cello/Documents/WELCOME.TXT` e `NOTE.TXT` sono file reali modificabili. Le pagine `.html` salvate dall'utente possono essere aperte nel browser.

## Struttura
```
cello-browser/
├── index.html · styles.css · manifest.webmanifest · sw.js · icon.svg
├── pages.js                     # 14 pagine del 1994
├── js/
│   ├── core/{bus,state,vfs,html}.js
│   ├── wm.js                    # window manager
│   ├── shell.js                 # desktop, taskbar, Start, notifiche
│   ├── main.js
│   └── apps/{browser,files,notepad,settings,about,terminal,calculator}.js
└── test/logic-test.mjs
```

## Tecnologie
Script classici con namespace `window.CelloOS` (mantiene l'apertura via `file://`), CSS puro, WebAudio, localStorage, service worker versionato. Nessuna libreria, nessun CDN, nessun account.

## Test
```bash
node projects/cello-browser/test/logic-test.mjs
```

## Registro portfolio
`assets/js/projects-data.js` — id `cello-browser`, badge "Sim", icona 🖥️.
