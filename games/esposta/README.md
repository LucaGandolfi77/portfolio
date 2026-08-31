# 📸 ESPONI — L'Archivio di Nonna Olga

PWA installabile · Italiano · Camera oscura vintage · iPhone-optimized

## Come giocare

1. **Apri `index.html`** nel browser (consiglia: Safari su iPhone)
2. **Install come PWA**: Safari → Condividi → "Aggiungi a schermata Home"
3. **Gioca offline** — il service worker memorizza tutto

## Struttura

### 📖 3 Atti, 12 Capitoli

**Atto I — L'Arte della Luce (Fotografia)**
1. 🎞️ L'Esposizione (ISO, diaframma, tempo, legge di reciprocità)
2. 📐 La Composizione (regola dei terzi, sezione aurea, linee guida)
3. ☀️ La Luce (temperatura colore Kelvin, golden/blue hour, direzione)
4. ⚡ Il Momento Decisivo (Barthes punctum/studium, Cartier-Bresson, Sontag)

**Atto II — La Piazza Digitale (Social Media)**
5. 🧠 L'Algoritmo (feed ranking, reach, shadowban, viralità K>1)
6. 🪝 Il Contenuto (content pillars, hook, STEPPS di Berger)
7. 💬 La Community (ER, UGC, 1000 true fans, crisi, etica)
8. 📊 Le Analytics (reach vs impressions, CTR, CPM, CPC, ROAS)

**Atto III — La Macchina del Valore (Marketing)**
9. 🎯 Il Marketing Mix (7P di Kotler, prezzo come segnale)
10. 🌪️ Il Funnel (TOFU/MOFU/BOFU, AIDA, modelli di attribuzione)
11. 🏷️ Il Brand (positioning Ries & Trout, USP, Byron Sharp, tono di voce)
12. ✍️ La Persuasione (6 armi di Cialdini, copy Ogilvy, 5 livelli Schwartz)

### ⚔️ Esame del Feed
Quiz finale a 18 domande con casi reali. Serve ≥70% per aprire l'Agenzia.

### 🏢 L'Agenzia Infinita
Modalità endless: accetta brief da clienti procedurali (ristoranti, fashion, tech, no-profit...), gestisci budget e reputazione, esegui campagne, ottieni gradi dalla S alla D.

## 🎮 12 Minigiochi veri

| # | Minigame | Cosa impari |
|---|----------|-------------|
| 1 | Sviluppa il Negativo | Triangolo esposizione (ISO/f/T) con sliders live |
| 2 | Componi la Scena | Drag & drop sulla griglia dei terzi |
| 3 | Caccia alla Luce | Abbina scenario luce → impostazioni corrette |
| 4 | Scatta al Momento Giusto | Timing click sulla zona dorata |
| 5 | Sfida l'Algoritmo | Scegli l'opzione che l'algoritmo premia |
| 6 | Hook in 3 Secondi | Identifica l'hook migliore per formato |
| 7 | Gestione Crisi | Simulazione risposta a crisi social |
| 8 | Leggi il Dashboard | Interpreta metriche (CTR, ROAS, reach) |
| 9 | Il Mix Perfetto | Abbina le 7P alle definizioni |
| 10 | Costruisci il Funnel | Drag contenuti nel TOFU/MOFU/BOFU |
| 11 | Posiziona il Brand | Mappa percettiva qualità/prezzo |
| 12 | Il Copy che Converte | Identifica copy Cialdini/Schwartz |
| ⚔️ | Esame del Feed | 18 domande comprehensive |

## 📚 Contenuto accademico

Ogni capitolo include:
- **Dialoghi** con Zio Peppe (caldo, colloquiale) + Note di Nonna Olga (accademico)
- **Filtro Verde** (il cugino social media manager, voce contemporary)
- **Schede Concettuali** con formule reali, citazioni e paper
- **Casi Reali** con metriche: Oreo, Taffo, ALS Ice Bucket, Barilla, Ferragni, Ryanair, Dove, Coca-Cola, Nike, NYX, Apple, Airbnb, FC Barcelona

### Citazioni incluse
- Cartier-Bresson, "Il momento decisivo" (1952)
- Roland Barthes, "La Camera Chiara" (1980)
- Susan Sontag, "Sulla Fotografia" (1977)
- Philip Kotler, "Principi di Marketing" (2021)
- Robert Cialdini, "Influence" (1984/2021)
- David Ogilvy, "Confessions" (1963)
- Jonah Berger, "Contagious" (2013)
- Byron Sharp, "How Brands Grow" (2010)
- Eugene Schwartz, "Breakthrough Advertising" (1966)
- Kevin Kelly, "1000 True Fans" (2008)
- Ansel Adams, "The Camera" (1980)
- Michael Freeman, "The Photographer's Eye" (2007)

## 🎨 Palette: Camera Oscura Vintage

- Background: `#1a1208` (nero camera oscura)
- Card: `#3d2b1a` (legno antico)
- Gold: `#d4a853` (ottone obiettivo)
- Sepia: `#8B7355` (carta vintage)
- Cream: `#faf3e8` (bianco stanco)
- Font: Georgia / Palatino (serif per accademico)

## 📱 PWA Features

- **Manifest**: standalone, portrait, theme seppia
- **Service Worker**: cache-first offline
- **Safe area**: iPhone notch support
- **100dvh**: altezza schermo reale
- **Grain overlay**: texture film vintage animata
- **No scroll**: tutto nel viewport
- **Touch**: niente delay 300ms

## File

```
esposta/
├── index.html            # Shell + CSS camera oscura
├── manifest.webmanifest  # PWA manifest
├── sw.js                 # Service worker offline
├── icons/                # Icone PIL (192/512/apple)
├── js/
│   ├── story.js          # 12 capitoli dialoghi
│   ├── concepts.js       # Schede accademiche
│   ├── cases.js          # 12 casi reali
│   ├── minigames.js      # 12 minigiochi + Esame
│   ├── agency.js         # Agenzia infinita
│   └── main.js           # Router + UI
└── README.md
```
