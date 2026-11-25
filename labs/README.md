# labs/

Progetti ed esperimenti che **non fanno parte del sito pubblicato** su GitHub Pages.
Restano nel repository per comodità, ma `scripts/build-site.mjs` non copia mai
nulla da qui dentro in `_site/`.

| Cartella | Cosa contiene | Perché non è sul sito |
|---|---|---|
| `emberfall/` | Gioco multiplayer React + Node (client/server/shared) | Richiede un server Socket.IO |
| `pi-agents/` | Agenti e dashboard di tracking dei progetti | Tooling interno |
| `newsroom/` | Pipeline editoriale con prompt e stato | Tooling interno |
| `fantasy-manager/` | Prototipo manageriale con dati di configurazione | Prototipo non finito |
| `pixel-stretch-app/` | Editor React + TypeScript + Electron | Richiede build Vite (candidato a `projects/` con uno step di build) |
| `rpg_game/` | Build locale (solo `dist/` e `node_modules/`, non tracciati) | Output locale |
| `book-writer/` | GUI desktop Python/Tkinter e config locali di Book Writer | Desktop. La web UI è in `projects/book-writer/` |
| `books/` | Romanzi generati, trame, CSV | Contenuti sorgente, non pagine |
| `tiny-ai-server/` | Server Flask + distilgpt2 per `projects/tiny-ai` | Backend Python locale |
| `python-tools/` | Script Python una tantum (asset store, traduzioni, sprite) | Script di manutenzione storici |

Le chiavi API (`*-api-key.txt`) e `book_writer_config.json` sono ignorate da git:
restano solo sul disco locale.
