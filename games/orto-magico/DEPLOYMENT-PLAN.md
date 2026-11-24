# ORTO MAGICO — Mobile Deployment Plan

> *Coltiva, annaffia, raccogli*

Idle gardening simulation | DOM-based | Zero dependencies | PWA-ready (60 KB)

---

## 1. Product Overview

**ORTO MAGICO** is an idle/incremental gardening simulation where the player cultivates a virtual garden — plant seeds, water them, harvest crops, and watch coins roll in. Plants grow in real-time, progress continues offline, and a deep upgrade tree keeps players coming back. The game is entirely in Italian with a warm, emoji-driven aesthetic.

| Feature | Detail |
|---------|--------|
| Seeds | 11 varieties (Lattuga, Carota, Fragola, Pomodoro, Girasole, Rosa, Funghi, Cactus, Orchidea, Peperoncino, Lattuga Rossa) |
| Upgrades | 11 across 3 tiers (Auto-harvest, Auto-replant, Irrigation, Fertilizer, Offline Progress, Elioforo, Criostasi) |
| Achievements | 8 milestones with coin + gem rewards |
| Collection | Album tracking discovered seed varieties |
| Currencies | Coins (soft) + Gems (premium, 50% drop from harvest) |
| Plots | Buy up to 12, cost scales exponentially (`30 * 1.6^n`) |
| Level System | XP-based, `100 * 1.5^level` to next level, +10 XP per harvest |
| Offline Progress | Tiered: none → 1h → 6h → 24h based on upgrades |
| Storage | localStorage persistence (`orto-magico-state-v2`) |
| Platform | DOM-based, vanilla JS, zero dependencies, PWA manifest |

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Rendering | DOM manipulation (no Canvas) |
| Audio | **None** — placeholder button only (to implement) |
| Language | Vanilla JavaScript ES6+ (single module, 593 LOC) |
| Styling | CSS3 with custom properties, gradients, animations (441 LOC) |
| Storage | localStorage |
| Mobile | Touch-optimized, safe-area insets, viewport-fit=cover |
| PWA | manifest.webmanifest (no service worker yet) |
| Framework | **None** — zero external dependencies |

---

## 2. Market Analysis & KPIs

### Target Genre
Idle / Incremental / Simulation — optimized for high session frequency (4-10x/day), long-term retention (D30 8-25%), and monetization through rewarded ads + IAP + subscriptions.

### Why Idle Games Win on Mobile

| Characteristic | Benefit |
|----------------|---------|
| Low cognitive load | Players open 6-10x/day for 4-7 min each |
| Progress always happening | Creates "fear of missing out" (FOMO) |
| Long tail retention | D30 2-3x higher than action games |
| Natural ad placement | Rewarded ads = "boost" (opt-in, positive UX) |
| Deep IAP funnel | Currency packs, boosters, subscriptions |

### Key Performance Indicators

| Metrica | Conservativo | Target | Stretch |
|---------|:------------|:-------|:--------|
| **CPI** (Cost Per Install) | $1.20 | $0.60 | $0.30 |
| **D1 Retention** | 40% | 50% | 60% |
| **D7 Retention** | 18% | 28% | 38% |
| **D30 Retention** | 8% | 15% | 25% |
| **D60 Retention** | 4% | 9% | 16% |
| **Sessioni / Giorno** | 4.0 | 6.0 | 10.0 |
| **Durata Sessione** | 4 min | 7 min | 12 min |
| **Engagement / Giorno** | 16 min | 42 min | 120 min |
| **ARPU** (Mensile) | $0.06 | $0.12 | $0.25 |
| **LTV** (Lifetime Value) | $0.80 | $1.80 | $4.00 |
| **Download Mese 1** | 1,500 | 6,000 | 20,000 |
| **Download Mese 3** | 6,000 | 28,000 | 100,000 |
| **Download Mese 6** | 15,000 | 65,000 | 250,000 |

### Competitive Benchmarks

| Game | Genere | D1 | D7 | D30 | ARPU |
|------|--------|-----|-----|------|------|
| Merge Garden | Idle/Merge | 48% | 25% | 14% | $0.18 |
| Heavenly Daycare | Idle | 45% | 22% | 12% | $0.15 |
| Pocket Plants | Idle | 42% | 20% | 10% | $0.12 |
| **Orto Magico (target)** | **Idle** | **50%** | **28%** | **15%** | **$0.12** |

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
| **Ads (AdMob)** | $60 | $350 | $1,100 | **$3,200** |
| **IAP (Gemme, Booster)** | $25 | $160 | $550 | **$1,600** |
| **Remove Ads ($1.99)** | $15 | $90 | $300 | **$900** |
| **Starter Pack ($0.99)** | $10 | $60 | $200 | **$600** |
| **Season Pass ($3.99/mese)** | $5 | $40 | $180 | **$550** |
| **Totale** | **$115** | **$700** | **$2,330** | **$6,850** |

### Net ROI

| Scenario | Ricavi | Costo | Netto | ROI |
|----------|--------|-------|-------|-----|
| Conservativo | $3,200 | $124 | $3,076 | **+2,481%** |
| Target | $6,850 | $500 | $6,350 | **+1,270%** |
| Con UA ($1.5K) | $6,850 | $1,624 | $5,226 | **+322%** |

> **Break-even**: ~350 install a CPI $0.60 con ARPU $0.12/mese.

---

## 4. Monetization Strategy

### 4.1 Advertising (AdMob)

| Ad Type | Piazzamento | Trigger | eCPM stimato |
|---------|-------------|---------|-------------|
| Rewarded Video | Boost 2x velocita 60s | Opt-in dopo raccolta | $12–25 |
| Rewarded Video | +50% gemme prossimo raccolto | Opt-in dopo achievement | $12–25 |
| Interstitial | Tra sessioni | Ogni 3-4 harvest cycles | $8–15 |
| Banner | Bottom schermata titolo | Persistente (bassa intrusivita) | $1–3 |

### 4.2 In-App Purchases

| Prodotto | Prezzo | Contenuto |
|----------|--------|-----------|
| Borsellino Gemme S | $0.99 | 50 gemme |
| Borsellino Gemme M | $2.99 | 200 gemme |
| Borsellino Gemme L | $4.99 | 600 gemme |
| Starter Garden | $0.99 | 500 monete + 20 gemme + 1 plot extra |
| Remove Ads | $1.99 | Rimuovi tutti gli annunci |
| Season Pass | $3.99/mese | Semi esclusivi + gemme giornaliere + boost |

### 4.3 Season Pass (Subscription Model)

| Tier | Prezzo | Benefici |
|------|--------|----------|
| Free | $0 | Gioco base con ads |
| Giardiniere Pro | $3.99/mese | Semi esclusivi, +50% gemme, no ads, boost giornaliero |
| Mastro Ortolano | $7.99/mese | Tutto Pro + 200 gemme/mese, plot extra, tema esclusivo |

### 4.4 Retention Mechanics

- **Daily rewards** (streak-based gem bonuses)
- **Season Pass challenges** (weekly missions)
- **Achievement system** (8 milestones, expandable)
- **Collection album** (FOMO: "manca solo la Rosa d'Oro!")
- **Offline earnings toast** (creates return habit)
- **Push notifications** (promemoria piante成熟 = ready to harvest)

---

## 5. Technical Deployment Plan

### 5.1 Architecture

```
games/orto-magico/
  index.html                ← Existing HTML shell (46 LOC)
  style.css                 ← Existing styles (441 LOC)
  js/main.js                ← Existing game logic (593 LOC)
  manifest.webmanifest      ← Existing PWA manifest
  icons/                    ← Existing icons (to replace with production versions)
  package.json              ← NEW: Capacitor 6.x + plugins
  capacitor.config.json     ← NEW: App config
  www/                      ← NEW: Web assets (symlinked to root)
    index.html
    style.css
    js/main.js
    manifest.webmanifest
    icons/
  android/                  ← Generated by Capacitor
  ios/                      ← Generated by Capacitor
  resources/                ← NEW: App icons, splash screens
    icon.png                ← 512x512
    icon-1024.png           ← 1024x1024 (App Store)
    splash.png              ← 1024x1024
    screen-*.png            ← Store screenshots
    feature-graphic.png     ← 1024x500
```

### 5.2 Capacitor Configuration

- **App ID**: `com.lucagandolfi.ortomagico`
- **App Name**: Orto Magico
- **Splash Screen**: Background `#2d5016` (verde giardino), no spinner, 2s
- **Status Bar**: Dark style, green background
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

### 5.4 Platform Requirements

| Platform | Minimum | Target |
|----------|---------|--------|
| Android | API 24 (7.0) | API 34 (14) |
| iOS | 14.0 | 17.0 |
| Xcode | 15.0 | 16.0 |
| Android Studio | 2023.1 | 2024.1 |

---

## 6. AI Agent Task Breakdown

### Phase 1: Project Setup — `agent-setup` (15 min)

| Task | Detail |
|------|--------|
| Create `package.json` | Capacitor 6.x dependencies, npm scripts |
| Create `capacitor.config.json` | App ID, plugins, platform config |
| Create `www/` directory | Symlink index.html, style.css, js/, icons/ into www root |
| Run `npm install` | Install Capacitor packages |
| Verify structure | Validate config, test `cap sync` |

### Phase 2: Native Bridge — `agent-capacitor` (20 min)

| Task | Detail |
|------|--------|
| `npx cap add android` | Generate Android project |
| `npx cap add ios` | Generate iOS project |
| Configure splash screen | Background #2d5016, 2s duration |
| Configure status bar | Dark style, green background |
| Add haptics plugin | Vibration feedback on harvest |
| Test sync | `npx cap sync` + verify both platforms |

### Phase 3: Audio Implementation — `agent-audio` (25 min)

| Task | Detail |
|------|--------|
| Implement Web Audio API | Replace placeholder sound toggle |
| Plant sound | Short "pop" oscillator sweep |
| Water sound | Filtered noise burst (splash) |
| Harvest sound | Ascending arpeggio (coins) |
| Level-up sound | Fanfare chord progression |
| Achievement sound | Special jingle |
| UI tap sounds | Button feedback |
| Mute toggle | Persist mute state in localStorage |

### Phase 4: Store Assets — `agent-assets` (25 min)

| Asset | Size | Format |
|-------|------|--------|
| App Icon (Android) | 512x512 | PNG |
| App Icon (iOS) | 1024x1024 | PNG |
| Splash Screen | 1024x1024 | PNG (green gradient #2d5016 → #1a3a0a) |
| Feature Graphic | 1024x500 | PNG |
| Screenshot iPhone 6.7" | 1290x2796 | PNG |
| Screenshot iPhone 5.5" | 1242x2208 | PNG |
| Screenshot Tablet | 2048x2732 | PNG |

### Phase 5: Store Listings — `agent-store` (20 min)

| Task | Detail |
|------|--------|
| App Store description (EN) | 4000 char max, keyword-optimized |
| App Store description (IT) | Localized Italian version |
| Google Play short description | 80 char max |
| Google Play full description | 4000 char max |
| Keywords (iOS) | 100 char, comma-separated |
| Content rating questionnaire | IARC classification |
| Privacy policy | Hosted URL (GitHub Pages) |

### Phase 6: Ad Integration — `agent-ads` (35 min)

| Task | Detail |
|------|--------|
| Install AdMob plugin | `@nicepay/capacitor-admob` or Google Mobile Ads |
| Initialize AdMob SDK | App ID from AdMob console |
| Add rewarded video | Boost 2x speed (60s) + bonus gems |
| Add interstitial | Between harvest cycles (every 3-4) |
| Add banner | Title screen (low intrusiveness) |
| Handle ad failures | Graceful fallback, no crashes |
| Track ad events | Firebase Analytics integration |

### Phase 7: IAP Integration — `agent-iap` (30 min)

| Task | Detail |
|------|--------|
| Install RevenueCat | Cross-platform IAP management |
| Define products | 6 SKUs in App Store Connect + Play Console |
| Wire gem packs | 50/200/600 gem tiers |
| Wire Remove Ads | Persist flag in localStorage |
| Wire Starter Pack | One-time bundle |
| Add restore purchases | iOS requirement |
| Test receipt validation | Server-side or local verification |

### Phase 8: Analytics — `agent-analytics` (15 min)

| Task | Detail |
|------|--------|
| Install Firebase Analytics | `@capacitor-firebase/analytics` |
| Log game events | plant, water, harvest, level_up, achievement |
| Log IAP events | purchase_started, purchase_completed, purchase_failed |
| Log ad events | ad_impression, ad_clicked, ad_rewarded |
| Custom properties | seeds_owned, plots_owned, level, coins_earned |

### Phase 9: PWA Enhancement — `agent-pwa` (20 min)

| Task | Detail |
|------|--------|
| Implement service worker | Offline caching for all game files |
| Push notifications | "Le tue piante sono pronte!" reminders |
| Update manifest | Correct description, icons, theme color |
| Add install prompt | "Installa Orto Magico" button |
| Test offline mode | Verify full game works without network |

### Phase 10: QA & Testing — `agent-qa` (35 min)

| Test | Platform | Pass Criteria |
|------|----------|---------------|
| Touch controls | Android + iOS | Tap to plant/water/harvest responsive |
| Audio | Android + iOS | All 7 SFX play, mute toggle works |
| Save/Load | Android + iOS | Progress persists across restarts |
| Ads | Android + iOS | Rewarded, interstitial, banner all load |
| IAP | Android + iOS | Purchase + restore work |
| Offline | Android + iOS | Progress calculates correctly on return |
| Background/Foreground | Android + iOS | Game pauses, resumes correctly |
| Low Memory | Android | No crash on memory pressure |
| Orientation | Android + iOS | Portrait lock enforced |
| Safe Areas | iOS (notch) | HUD elements not clipped |
| Performance | Both | No jank on mid-range devices |

### Phase 11: Submission — `agent-submit` (20 min)

| Task | Detail |
|------|--------|
| Build AAB (Android) | Signed bundle via Android Studio |
| Build IPA (iOS) | Archive via Xcode |
| Upload to Play Console | Internal testing → closed testing → production |
| Upload to App Store Connect | TestFlight → App Review |
| Configure staged rollout | 10% → 50% → 100% over 7 days |
| Set up crash reporting | Firebase Crashlytics |

---

## 7. Timeline

```
Giorno 1-2  ████░░░░░░░░░░░░░░░░  Phase 1-2: Setup + Native Bridge
Giorno 3-4  ░░░░████░░░░░░░░░░░░  Phase 3-4: Audio + Store Assets
Giorno 5-7  ░░░░░░░░██████░░░░░░  Phase 5-6: Store Listings + Ads
Giorno 8-9  ░░░░░░░░░░░░░░████░░  Phase 7-9: IAP + Analytics + PWA
Giorno 10   ░░░░░░░░░░░░░░░░░░██  Phase 10-11: QA + Submission
Sett 2-3    ░░░░░░░░░░░░░░░░░░░░  Review + Staged Rollout
```

**Tempo totale stimato**: ~4.5 ore di lavoro agenti AI + 2-3 giorni di review store.

---

## 8. Risk Assessment

| Rischio | Impatto | Probabilita | Mitigazione |
|---------|---------|-------------|-------------|
| App Store rejection (quality) | Alto | Bassa | Pre-test con TestFlight, ensure polish |
| Ad SDK breaks game loop | Medio | Media | Ads solo tra sessioni, mai durante harvesting |
| IAP restore issues on iOS | Medio | Media | Receipt validation + pulsante restore |
| Low organic downloads | Medio | Alta | ASO + cross-portfolio promotion |
| Idle balance too slow/fast | Medio | Media | Tuning growth rates post-launch via analytics |
| Push notification opt-out | Basso | Alta |有价值 content, not spam; max 1/day |
| Offline progress exploit | Basso | Bassa | Server-side validation for premium currency |

---

## 9. Cross-Portfolio Promotion

Leverage the existing portfolio ecosystem (101 games):

| Channel | Action |
|---------|--------|
| Portfolio homepage | Add Orto Magico to featured games section |
| Arrowmatic cross-sell | "Anche tu Orchidée? Prova Orto Magico!" interstitial |
| Social media | Garden progress GIFs + store links |
| GitHub README | Badge + link to stores |
| Email newsletter | Announcement to existing subscribers |
| App Store cross-sell | "More by Luca Gandolfi" with Votopoli, Arrowmatic |

---

## 10. Post-Launch Optimization Roadmap

### Month 1: Foundation
- Monitor D1/D7 retention daily
- A/B test ad frequency (3 vs 5 harvest cycles)
- Fix crash reports within 24h
- Respond to all store reviews

### Month 2: Growth
- Add 3 new seed varieties (seasonal: pumpkin, tulip, lavender)
- Add 2 new achievements
- Implement daily reward streak
- Launch Season Pass

### Month 3: Monetization
- Optimize IAP pricing based on purchase data
- Add "Garden Theme" cosmetic packs ($0.99)
- Implement referral system ("Invite a friend, get 100 gems")
- Cross-promote with Arrowmatic players

### Month 6: Scale
- Localize to English, Spanish, Portuguese
- Add social features (visit friends' gardens)
- Consider tablet-optimized layout
- Evaluate premium version ($4.99 ad-free + all themes)

---

## 11. Success Metrics (Post-Launch)

| Timeframe | Goal |
|-----------|------|
| Week 1 | 500+ installs, D1 > 45%, crash-free > 99% |
| Month 1 | 6,000+ installs, D7 > 20%, first IAP revenue |
| Month 3 | 28,000+ cumulative, D30 > 12%, positive ROI |
| Month 6 | 65,000+ cumulative, $6.8K+ revenue, Season Pass live |

---

*Built by Luca Gandolfi — Full-Stack Engineer & Game Developer*
