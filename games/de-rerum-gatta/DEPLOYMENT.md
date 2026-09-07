# DE RERUM GATTA — Mobile Deployment Plan

> *Il Giardino dell'Universo — matematica e fisica raccontate da un gatto, fiore dopo fiore*

Educational puzzle/narrative PWA | DOM + Canvas | Zero dependencies | 3,367 LOC | PWA-ready

---

## 1. Product Overview

**DE RERUM GATTA** is an educational puzzle/narrative game where players tend a secret garden where each flower represents a concept from mathematics or physics. To bloom a flower, the player reads a story from a cat character, plays a minigame that teaches the concept, and unlocks an Erbario (herbarium) card with formula, quote, practical application, philosophy, and deep formal explanation.

The game bridges the "two cultures" — science and humanities — through 18 minigames with real physics, literary quotes from Leopardi to Dante, and a love story told through 6 chapters and 6 letters.

| Feature | Detail |
|---------|--------|
| Minigames | 18 fully playable (Fibonacci petals, Pythagorean lyre, Newton's apples, Kepler's orbit, Schrodinger's box, Eratosthenes' sieve, Einstein's time dilation...) |
| Screens | 13 (Menu, Garden, Game, Library, Erbario, Journal, Night Sky, Letters, Walk Mode, Chapters, FAQ, Calendar, Greenhouse) |
| Flowers | 18 concepts across 4 seasons (math + physics) |
| Chapters | 6 (Prologo, Capitoli I-IV, Epilogo) |
| Letters | 6 narrative unlocks |
| Calendar | 12 monthly flowers (Animal Crossing-style) |
| Constellations | 7 on night sky canvas |
| FAQ | 12 university-style Q&A entries |
| Audio | Full Web Audio synthesis (purr, chime, meow, click, wrong — zero audio files) |
| Save | localStorage persistence (`dererumgatta_v1`) |
| PWA | manifest.webmanifest + Service Worker (full offline) |
| Platform | DOM + Canvas, vanilla JS, zero dependencies |

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Rendering | DOM manipulation + HTML5 Canvas (4 minigames + night sky) |
| Audio | Web Audio API (oscillators, noise, filters — all procedural) |
| Language | Vanilla JavaScript ES6+ (2,736 LOC across 5 files) |
| Styling | CSS3 with custom properties, animations (401 LOC) |
| Storage | localStorage |
| Mobile | Touch-optimized, safe-area insets, viewport-fit=cover, PWA installable |
| Offline | Service Worker with cache-first strategy |
| Framework | **None** — zero external dependencies |

---

## 2. Market Analysis & KPIs

### Target Audience

| Segment | Description |
|---------|-------------|
| **Primary** | Students 14-25 (liceo + universita) |
| **Secondary** | Curious adults who "hated math in school" |
| **Tertiary** | Educators looking for engaging teaching tools |
| **Quaternary** | Parents wanting educational screen time for teens |

### Key Performance Indicators

| Metrica | Conservativo | Target | Stretch |
|---------|:------------|:-------|:--------|
| **CPI** (Cost Per Install) | $1.00 | $0.50 | $0.25 |
| **D1 Retention** | 45% | 55% | 65% |
| **D7 Retention** | 22% | 32% | 42% |
| **D30 Retention** | 10% | 18% | 28% |
| **D60 Retention** | 6% | 12% | 20% |
| **Sessioni / Giorno** | 2.5 | 4.0 | 6.0 |
| **Durata Sessione** | 8 min | 14 min | 22 min |
| **Engagement / Giorno** | 20 min | 56 min | 132 min |
| **ARPU** (Mensile) | $0.08 | $0.18 | $0.35 |
| **LTV** (Lifetime Value) | $1.00 | $2.50 | $6.00 |
| **Download Mese 1** | 1,000 | 5,000 | 18,000 |
| **Download Mese 3** | 4,000 | 22,000 | 80,000 |
| **Download Mese 6** | 10,000 | 50,000 | 200,000 |

### Why Educational Games Win on Mobile

| Caratteristica | Beneficio |
|----------------|-----------|
| Apple "Educational" badge | Featured in App Store Education category |
| School adoption | Licenze istituzionali ($2-5/student) |
| Parent approval | "Gioco educativo" = meno resistenza all'acquisto |
| Long tail retention | D30 2-3x superiore ai giochi casual |
| Press coverage | Articoli su testate edu-tech (Wired, Repubblica, etc.) |
| No violent content | Classifica IARC 3+ (accessibile a tutti) |
| Premium pricing | Educational apps support $4.99-9.99 price points |

### Competitive Benchmarks

| Game | Genere | Prezzo | D7 | D30 |
|------|--------|--------|-----|------|
| DragonBox Algebra | Math puzzle | $7.99 | 35% | 15% |
| Monument Valley | Puzzle/narrative | $3.99 | 40% | 12% |
| The Room | Puzzle | $4.99 | 38% | 14% |
| **De Rerum Gatta** | **Edu/narrative** | **$4.99** | **32%** | **18%** |

---

## 3. ROI Projection (6-Month Window)

### Cost Structure

| Item | Costo | Note |
|------|-------|------|
| Sviluppo Capacitor | $0 | Self-built, ~40h |
| Store Assets (AI-generated) | $0 | Icons, screenshots, feature graphic |
| ASO / Store Listing | $0 | Organic optimization |
| Apple Developer | $99/anno | Annual fee |
| Google Play Developer | $25 one-time | Lifetime |
| UA Budget (opzionale) | $500–$1,500 | For scaling |
| **Totale Fisso** | **$124–$1,624** | |

### Revenue Projections

| Fonte | Mese 1 | Mese 3 | Mese 6 | Totale 6m |
|-------|--------|--------|--------|-----------|
| **Remove Ads ($2.99)** | $20 | $120 | $400 | **$1,200** |
| **Full Game ($4.99)** | $30 | $180 | $600 | **$1,800** |
| **Season Pass ($4.99/mese)** | $10 | $70 | $250 | **$750** |
| **School Licenses ($3/student)** | $0 | $60 | $300 | **$900** |
| **Ads (Rewarded, low freq)** | $10 | $60 | $200 | **$600** |
| **Totale** | **$70** | **$490** | **$1,750** | **$5,250** |

### Net ROI

| Scenario | Ricavi | Costo | Netto | ROI |
|----------|--------|-------|-------|-----|
| Conservativo | $2,500 | $124 | $2,376 | **+1,916%** |
| Target | $5,250 | $500 | $4,750 | **+950%** |
| Con UA ($1.5K) | $5,250 | $1,624 | $3,626 | **+223%** |

> **Break-even**: ~150 install a CPI $0.50 con $4.99 full game (conversione 5%).

---

## 4. Monetization Strategy

### 4.1 Freemium Model (Primary)

| Tier | Contenuto | Prezzo |
|------|-----------|--------|
| **Free** | 6 fiori (Primavera), 6 minigames, Walk Mode, 1 capitolo | $0 |
| **Full Game** | Tutti i 18 fiori, 18 minigames, 6 capitoli, 6 lettere, Erbario | $4.99 |
| **Remove Ads** | Rimuovi banner (solo menu, bassa frequenza) | $2.99 |

### 4.2 Premium / Subscription

| Prodotto | Prezzo | Contenuto |
|----------|--------|-----------|
| Giardiniere Pro | $4.99/mese | Full game + capitoli extra mensili + temi esclusivi |
| Bundle Scuola | $29.99/anno | Full game + materiale didattico + report progressi |

### 4.3 IAP Add-on

| Prodotto | Prezzo | Contenuto |
|----------|--------|-----------|
| Pacchetto Capitoli | $1.99 | 2 capitoli extra con 4 fiori nuovi |
| Temi Visivi | $0.99 | Palette colori alternative (notte, alba, autunno) |
| Soundtrack | $1.99 | Colonna sonora ambient |

### 4.4 School / Institutional Licensing

| Modello | Prezzo | Target |
|---------|--------|--------|
| Individual License | $2.99/student | Studenti singoli |
| Classroom Pack (30) | $49.99 | Professori |
| School License | $199.99/anno | Istituti completi |

### 4.5 Retention Mechanics

- **Daily garden reminder** (push notification: "I tuoi fiori hanno bisogno di te!")
- **Seasonal events** (new flowers per holiday/season)
- **Achievement badges** (shareable on social media)
- **Journal export** (students can use as study notes)
- **Night sky progress** (visual motivation to complete all constellations)

---

## 5. Technical Deployment Plan

### 5.1 Architecture

```
games/de-rerum-gatta/
  index.html                ← Existing HTML shell (230 LOC)
  style.css                 ← Existing styles (401 LOC)
  js/main.js                ← Existing game logic (762 LOC)
  js/data.js                ← Existing content data (585 LOC)
  js/minigames.js           ← Existing minigames engine (1,222 LOC)
  js/audio.js               ← Existing Web Audio (106 LOC)
  js/save.js                ← Existing save system (22 LOC)
  sw.js                     ← Existing service worker (39 LOC)
  manifest.webmanifest      ← Existing PWA manifest
  icons/                    ← Existing icons (to replace)
  README.md                 ← Existing design document (380 LOC)
  DEPLOYMENT.md             ← NEW: This deployment plan
  package.json              ← NEW: Capacitor 6.x + plugins
  capacitor.config.json     ← NEW: App config
  www/                      ← NEW: Web assets (symlinked to root)
    index.html
    style.css
    js/
    sw.js
    manifest.webmanifest
    icons/
  android/                  ← Generated by Capacitor
  ios/                      ← Generated by Capacitor
  resources/                ← NEW: App icons, splash screens
```

### 5.2 Capacitor Configuration

- **App ID**: `com.lucagandolfi.dererumgatta`
- **App Name**: De Rerum Gatta
- **Splash Screen**: Background `#fdf6ec` (cream), cat emoji, 2s
- **Status Bar**: Dark text, cream background
- **Android**: HTTPS scheme, mixed content allowed
- **iOS**: Min deployment 14.0, mobile content mode

### 5.3 Build Pipeline

```bash
# 1. Install dependencies
npm install

# 2. Add native platforms
npx cap add android
npx cap add ios

# 3. Sync web assets
npx cap sync

# 4. Open in IDE
npx cap open android    # Android Studio
npx cap open ios        # Xcode

# 5. Build
# Android: Build → Generate Signed Bundle/APK → AAB
# iOS: Product → Archive → Upload to App Store Connect
```

---

## 6. AI Agent Task Breakdown

### Phase 1: Project Setup — `agent-setup` (15 min)

| Task | Detail |
|------|--------|
| Create `package.json` | Capacitor 6.x dependencies, npm scripts |
| Create `capacitor.config.json` | App ID, plugins, platform config |
| Create `www/` directory | Symlink all game files into www root |
| Run `npm install` | Install Capacitor packages |
| Verify structure | Validate config, test `cap sync` |

### Phase 2: Native Bridge — `agent-capacitor` (20 min)

| Task | Detail |
|------|--------|
| `npx cap add android` | Generate Android project |
| `npx cap add ios` | Generate iOS project |
| Configure splash screen | Background #fdf6ec, cat emoji |
| Configure status bar | Dark text, cream background |
| Add haptics plugin | Vibration feedback on minigame events |
| Test sync | `npx cap sync` + verify both platforms |

### Phase 3: Store Assets — `agent-assets` (25 min)

| Asset | Size | Format |
|-------|------|--------|
| App Icon (Android) | 512x512 | PNG (cat + flower) |
| App Icon (iOS) | 1024x1024 | PNG |
| Splash Screen | 1024x1024 | PNG (cream gradient + cat) |
| Feature Graphic | 1024x500 | PNG |
| Screenshot iPhone 6.7" | 1290x2796 | PNG |
| Screenshot iPhone 5.5" | 1242x2208 | PNG |
| Screenshot Tablet | 2048x2732 | PNG |

### Phase 4: Store Listings — `agent-store` (20 min)

| Task | Detail |
|------|--------|
| App Store description (EN) | 4000 char, educational positioning |
| App Store description (IT) | Localized Italian |
| Google Play short description | 80 char |
| Google Play full description | 4000 char |
| Keywords (iOS) | 100 char, edu-game keywords |
| Content rating | IARC (educational, no violence) |
| Privacy policy | Hosted URL |

### Phase 5: Monetization — `agent-monetize` (30 min)

| Task | Detail |
|------|--------|
| Implement tier system | Free (6 flowers) vs Full ($4.99) |
| Add purchase gate | Lock flowers 7-18 behind paywall |
| Implement Remove Ads | Persist flag in localStorage |
| Add restore purchases | iOS requirement |
| Wire to existing save.js | Extend state with purchase flags |

### Phase 6: Ad Integration — `agent-ads` (25 min)

| Task | Detail |
|------|--------|
| Install AdMob plugin | Low-frequency banner |
| Banner placement | Title screen only (educational = minimal ads) |
| Rewarded video | Optional: "Watch for a hint" on hard minigames |
| Handle failures | Graceful fallback |

### Phase 7: Analytics — `agent-analytics` (15 min)

| Task | Detail |
|------|--------|
| Install Firebase Analytics | Event tracking |
| Log game events | flower_bloom, minigame_start, minigame_win |
| Log progression | chapter_complete, letter_unlock, constellation_light |
| Log IAP | purchase_started, purchase_completed |
| Custom properties | flowers_bloomed, season, purrometer_level |

### Phase 8: Localization — `agent-i18n` (30 min)

| Task | Detail |
|------|--------|
| English store listing | Description, keywords, screenshots |
| In-game labels | Key UI strings (Menu, Garden, Library, etc.) |
| Minigame instructions | English translations for 18 minigames |
| Preserve Italian | Game text remains Italian (unique selling point) |

### Phase 9: QA & Testing — `agent-qa` (40 min)

| Test | Platform | Pass Criteria |
|------|----------|---------------|
| 18 minigames | Android + iOS | All playable, no crashes |
| Audio | Android + iOS | Purr, chime, meow, click all play |
| Save/Load | Android + iOS | Progress persists across restarts |
| PWA offline | Android + iOS | Full game works without network |
| Night sky canvas | Android + iOS | Constellations render correctly |
| Touch controls | Android + iOS | All minigames responsive |
| Purchase flow | Android + iOS | Full game unlock works |
| Safe Areas | iOS | Notch elements not clipped |

### Phase 10: Submission — `agent-submit` (20 min)

| Task | Detail |
|------|--------|
| Build AAB | Signed bundle |
| Build IPA | Archive + upload |
| Play Console | Internal → Closed → Production |
| App Store Connect | TestFlight → Review |
| Staged rollout | 10% → 50% → 100% |

---

## 7. Timeline

```
Giorno 1-2  ████░░░░░░░░░░░░░░░░  Phase 1-2: Setup + Native Bridge
Giorno 3-4  ░░░░████░░░░░░░░░░░░  Phase 3-4: Store Assets + Listings
Giorno 5-7  ░░░░░░░░██████░░░░░░  Phase 5-6: Monetization + Ads
Giorno 8-9  ░░░░░░░░░░░░░░████░░  Phase 7-9: Analytics + Localization + QA
Giorno 10   ░░░░░░░░░░░░░░░░░░██  Phase 10: Submission
Sett 2-3    ░░░░░░░░░░░░░░░░░░░░  Review + Staged Rollout
```

**Tempo totale stimato**: ~4.5 ore di lavoro agenti AI + 2-3 giorni di review store.

---

## 8. Risk Assessment

| Rischio | Impatto | Probabilita | Mitigazione |
|---------|---------|-------------|-------------|
| App Store rejection (educational quality) | Alto | Bassa | Pre-test TestFlight, Apple loves edu apps |
| Ad SDK disrupts learning experience | Medio | Media | Banner solo nel menu, mai durante minigiochi |
| IAP restore issues on iOS | Medio | Media | Receipt validation + restore button |
| Low organic downloads | Medio | Alta | ASO + school outreach + edu-tech press |
| Italian-only limits market | Basso | Alta | Unique selling point; EN localization later |
| Minigame bugs (18 to test) | Medio | Media | Thorough QA on each minigame |
| Canvas rendering issues | Basso | Bassa | Simple 2D, well-tested pattern |

---

## 9. Cross-Portfolio Promotion

| Channel | Action |
|---------|--------|
| Portfolio homepage | Featured in "Educational" section |
| Arrowmatic cross-sell | "Impara la fisica che c'e dietro le orbite di Kepler!" |
| Orto Magico cross-sell | "La matematica dei fiori: Fibonacci ti aspetta" |
| Social media | Garden progress GIFs + minigame screenshots |
| GitHub README | Badge + link to stores |
| Edu-tech blogs | Press release to Italian edu-tech outlets |
| University groups | Share in physics/math Telegram groups |

---

## 10. Post-Launch Optimization Roadmap

### Month 1: Foundation
- Monitor D1/D7 retention daily
- A/B test free tier (6 vs 9 flowers)
- Fix crash reports within 24h
- Respond to all store reviews

### Month 2: Growth
- Add 2 new minigames (Chaos theory, Prime numbers)
- Add seasonal event (Spring Equinox flowers)
- Launch school outreach program
- Implement shareable achievement cards

### Month 3: Monetization
- Optimize IAP pricing based on purchase data
- Add "Professor Mode" (tracks student progress)
- Partner with Italian physics/math teachers
- Launch on TikTok (minigame clips)

### Month 6: Scale
- Full English localization
- Consider premium version ($9.99 ad-free + all extras)
- Evaluate tablet-optimized layout
- Academic paper on game-based learning outcomes

---

## 11. Success Metrics (Post-Launch)

| Timeframe | Goal |
|-----------|------|
| Week 1 | 500+ installs, D1 > 50%, crash-free > 99% |
| Month 1 | 5,000+ installs, D7 > 25%, first IAP revenue |
| Month 3 | 22,000+ cumulative, D30 > 15%, school pilot launched |
| Month 6 | 50,000+ cumulative, $5.2K+ revenue, edu-tech press coverage |

---

*Built by Luca Gandolfi — Full-Stack Engineer & Game Developer*
