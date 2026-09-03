# 🖥️ Cello — il browser degli anni '90

Clone interattivo di **Cello 1.01a** (Cornell Law Information Institute, 1993–94): il primo browser grafico per Windows 3.x. UI stile Win3.1, navigazione in un web inventato del 1994, suono modem e modalità "Modem Live" che carica pagine reali via r.jina.ai rendendole in stile anni '90.

## Caratteristiche
- **Chrome Win 3.1**: title bar, menu bar, toolbar, campo Location, status bar con progress bar.
- **Mini motore HTML 2**: parsa un whitelist di tag (h1–h6, p, a, b/i/em/strong, ul/ol/li, pre, blockquote, table, blink, img…). Le immagini mostrano un segnaposto `[IMAGE]` (citazione storica: Cello non supportava le immagini).
- **Web 1994 offline**: 14 pagine collegate (Home, About, What's New, Yahoo Catalog, Surfing Guide, Gopher, FTP, USENET, WebRing, Guestbook, Under Construction, Image Test, modern domain, 404).
- **📡 Modem Live**: digita un URL reale → fetch via `r.jina.ai` (reader pubblico), rendering in stile '94. Timeout 8s con fallback a pagina di errore "Busy signal".
- **Storia Back/Forward**, Preferiti (localStorage), contatore pagine visitate.
- **Suono modem** sintetizzato (WebAudio, toggle).
- **iPhone-safe**: bottom toolbar touch, target ≥44px, area contenuto scrollabile.

## Tecnologie
- Vanilla HTML + CSS + JS (nessuna libreria esterna).
- PWA: no manifest (come `web-linux` nel portfolio).

## Navigazione
Apri `index.html` nel browser. Clicca i link, digita URL nella Location bar, o usa 📡 per il modem live.

## Registrato nel portfolio
- `assets/js/projects-data.js`: id `cello-browser`, badge "Sim", emoji 🖥️, colore `#ff9f43`.
- Appare nel catalogo progetti (`projects.html` e homepage).