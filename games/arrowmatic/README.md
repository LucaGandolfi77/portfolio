# ARROWMATIC — Mobile Deployment Plan

> *L'eroe pigro che spara solo da fermo*

Roguelite auto-archer | HTML5 Canvas | Zero dependencies | Single-file (68 KB)

---

## 1. Product Overview

**ARROWMATIC** is a wave-based survival roguelite where the hero automatically fires at the nearest enemy — but only when standing still. Between waves, a draft system offers power-ups. After all waves, a boss fight. Earn coins, buy permanent upgrades, unlock heroes and weapons, repeat.

| Feature | Detail |
|---------|--------|
| Enemies | 6 types (Slime, Bat, Shooter, Splitter, Tank, Mini) + Elite variants |
| Bosses | 6 chapter bosses + Omega bosses (level 30+) |
| Weapons | 5 (Bow, Twin Blades, Rainbow Staff, Boomerang, Cannon) |
| Heroes | 4 (Arcibaldo, Velocirina, Tankone, Fortunella) |
| Accessories | 4 (Revive Heart, Magnete XL, Wave Shield, Sneaky Dice) |
| Draft Upgrades | 16 across 4 rarity tiers (Common → Legendary) |
| Meta-Upgrades | 5 stats, 8 levels each, exponential cost scaling |
| Chapters | 6 visual themes with gradient backgrounds |
| Audio | 12+ procedural sound effects (Web Audio API, no files) |
| Storage | Full localStorage persistence (coins, upgrades, loadout) |
| Platform | HTML5 Canvas 2D, vanilla JS, zero dependencies |

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Rendering | HTML5 Canvas 2D |
| Audio | Web Audio API (oscillators + noise buffers) |
| Language | Vanilla JavaScript ES6+ (single IIFE, strict mode) |
| UI/HUD | HTML/CSS overlays with CSS variables |
| Storage | localStorage |
| Mobile | Touch joystick, safe-area insets, viewport-fit=cover |
| Framework | **None** — zero external dependencies |

---

## 2. Market Analysis & KPIs

### Target Genre
Hyper-casual / Roguelite / Auto-battler — optimized for short sessions (5-15 min), high replayability, and monetization through ads + IAP.

### Key Performance Indicators

| Metric | Conservative | Target | Stretch |
|--------|:------------|:-------|:--------|
| **CPI** (Cost Per Install) | $1.50 | $0.80 | $0.40 |
| **D1 Retention** | 35% | 45% | 55% |
| **D7 Retention** | 12% | 18% | 25% |
| **D30 Retention** | 4% | 7% | 12% |
| **Session Length** | 6 min | 10 min | 15 min |
| **Sessions / Day** | 2.5 | 4.0 | 6.0 |
| **ARPU** (Monthly) | $0.08 | $0.15 | $0.30 |
| **LTV** (Lifetime Value) | $0.60 | $1.20 | $2.50 |
| **Month 1 Downloads** | 2,000 | 8,000 | 25,000 |
| **Month 3 Downloads** | 8,000 | 35,000 | 120,000 |
| **Month 6 Downloads** | 20,000 | 80,000 | 300,000 |

### Competitive Benchmarks

| Game | D1 | D7 | ARPU |
|------|-----|-----|------|
| Archero | 45% | 20% | $0.25 |
| Survivor.io | 40% | 17% | $0.20 |
| Zombie Survivors | 38% | 14% | $0.15 |
| **Arrowmatic (target)** | **45%** | **18%** | **$0.15** |

---

## 3. ROI Projection (6-Month Window)

### Cost Structure

| Item | Cost | Notes |
|------|------|-------|
| Development (Capacitor wrap) | $0 | Self-built, ~40h |
| Store Assets (icons, screenshots) | $0 | AI-generated + Canvas exports |
| ASO / Store Listing | $0 | Organic optimization |
| UA Budget (paid) | $500–$2,000 | Optional, for scaling |
| AdMob Account | $0 | Free to register |
| Apple Developer | $99/year | Annual fee |
| Google Play Developer | $25 one-time | Lifetime |
| **Total Fixed Cost** | **$124–$2,124** | |

### Revenue Projections

| Source | Month 1 | Month 3 | Month 6 | 6-Month Total |
|--------|---------|---------|---------|---------------|
| **Ads (AdMob)** | $80 | $400 | $1,200 | **$3,600** |
| **IAP (Coins, Heroes)** | $30 | $180 | $600 | **$1,800** |
| **Remove Ads ($2.99)** | $20 | $100 | $350 | **$1,050** |
| **Starter Pack ($1.99)** | $15 | $75 | $250 | **$750** |
| **Total Revenue** | **$145** | **$755** | **$2,400** | **$7,200** |

### Net ROI

| Scenario | Revenue | Cost | Net Profit | ROI |
|----------|---------|------|------------|-----|
| Conservative | $3,600 | $124 | $3,476 | **+2,803%** |
| Target | $7,200 | $500 | $6,700 | **+1,340%** |
| With Paid UA ($2K) | $7,200 | $2,124 | $5,076 | **+239%** |

> **Break-even**: ~500 installs at target CPI of $0.80 with $0.15 ARPU.

---

## 4. Monetization Strategy

### 4.1 Advertising (AdMob)

| Ad Type | Placement | Trigger |
|---------|-----------|---------|
| Interstitial | Between levels | After boss defeat |
| Rewarded Video | Bonus coins | Opt-in after death (2x coins) |
| Banner | Title screen | Persistent (low impact) |

**eCPM estimates**: Interstitial $8-15, Rewarded $12-25, Banner $1-3.

### 4.2 In-App Purchases

| Product | Price | Content |
|---------|-------|---------|
| Coin Pack S | $0.99 | 2,000 coins |
| Coin Pack M | $2.99 | 8,000 coins |
| Coin Pack L | $4.99 | 20,000 coins |
| Starter Bundle | $1.99 | 5,000 coins + exclusive hero skin |
| Hero Unlock | $1.99 | Unlock any single hero |
| Weapon Unlock | $2.99 | Unlock any single weapon |
| Remove Ads | $2.99 | Permanent ad removal |

### 4.3 Retention Mechanics

- **Daily rewards** (streak-based coin bonuses)
- **Weekly challenge mode** (leaderboard-based)
- ** Achievement system** (unlock cosmetics)
- **Save sync** (cloud backup via Firebase)

---

## 5. Technical Deployment Plan

### 5.1 Architecture

```
games/arrowmatic/
  index.html              ← Existing game (1,478 LOC, 68 KB)
  package.json            ← Capacitor 6.x + plugins
  capacitor.config.json   ← App config
  www/                    ← Web assets (symlinked to root)
    index.html
  android/                ← Generated by Capacitor
  ios/                    ← Generated by Capacitor
  resources/              ← App icons, splash screens
    icon.png              ← 512x512
    icon-1024.png         ← 1024x1024 (App Store)
    splash.png            ← 1024x1024
    screen-*.png          ← Store screenshots
    feature-graphic.png   ← 1024x500
```

### 5.2 Capacitor Configuration

- **App ID**: `com.lucagandolfi.arrowmatic`
- **App Name**: Arrowmatic
- **Splash Screen**: Background `#12123a`, no spinner, 2s duration
- **Status Bar**: Dark style, transparent background
- **Android**: HTTPS scheme, mixed content allowed
- **iOS**: Min deployment 14.0, mobile content mode, safe area insets

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
| Create `www/` directory | Symlink `index.html` into www root |
| Run `npm install` | Install Capacitor packages |
| Verify structure | Validate config, test `cap sync` |

### Phase 2: Native Bridge — `agent-capacitor` (20 min)

| Task | Detail |
|------|--------|
| `npx cap add android` | Generate Android project |
| `npx cap add ios` | Generate iOS project |
| Configure splash screen | Background #12123a, 2s duration |
| Configure status bar | Dark style, matching color |
| Add haptics plugin | Vibration feedback on hits |
| Test sync | `npx cap sync` + verify both platforms |

### Phase 3: Store Assets — `agent-assets` (30 min)

| Asset | Size | Format |
|-------|------|--------|
| App Icon (Android) | 512x512 | PNG |
| App Icon (iOS) | 1024x1024 | PNG |
| Splash Screen | 1024x1024 | PNG |
| Feature Graphic | 1024x500 | PNG |
| Screenshot iPhone 6.7" | 1290x2796 | PNG |
| Screenshot iPhone 5.5" | 1242x2208 | PNG |
| Screenshot Tablet | 2048x2732 | PNG |

### Phase 4: Store Listings — `agent-store` (25 min)

| Task | Detail |
|------|--------|
| App Store description (EN) | 4000 char max, keyword-optimized |
| App Store description (IT) | Localized Italian version |
| Google Play short description | 80 char max |
| Google Play full description | 4000 char max |
| Keywords (iOS) | 100 char, comma-separated |
| Content rating questionnaire | IARC classification |
| Privacy policy | Hosted URL (GitHub Pages) |

### Phase 5: Ad Integration — `agent-ads` (40 min)

| Task | Detail |
|------|--------|
| Install `@nicepay/capacitor-admob` | Or Google Mobile Ads plugin |
| Initialize AdMob SDK | App ID from AdMob console |
| Add interstitial | Show after boss defeat |
| Add rewarded video | Opt-in for 2x coins after death |
| Add banner | Title screen only (low intrusiveness) |
| Handle ad failures | Graceful fallback, no crashes |

### Phase 6: IAP Integration — `agent-iap` (35 min)

| Task | Detail |
|------|--------|
| Install RevenueCat or Capacitor Purchase | Cross-platform IAP |
| Define products | 7 SKUs in App Store Connect + Play Console |
| Wire to existing functions | `buyHero()`, `buyWeapon()`, `buyAccessory()` |
| Add "Remove Ads" purchase | Persist flag in localStorage |
| Add restore purchases button | iOS requirement |
| Test receipt validation | Server-side or local verification |

### Phase 7: Analytics — `agent-analytics` (20 min)

| Task | Detail |
|------|--------|
| Install Firebase Analytics | `@capacitor-firebase/analytics` |
| Log events | level_start, level_complete, death, coin_earned |
| Log IAP events | purchase_started, purchase_completed, purchase_failed |
| Log ad events | ad_impression, ad_clicked, ad_rewarded |
| Custom properties | hero_used, weapon_used, level_reached, coins_earned |

### Phase 8: QA & Testing — `agent-qa` (40 min)

| Test | Platform | Pass Criteria |
|------|----------|---------------|
| Touch controls | Android + iOS | Joystick responsive, no ghost touches |
| Audio | Android + iOS | All 12+ SFX play, no glitches |
| Save/Load | Android + iOS | Progress persists across restarts |
| Ads | Android + iOS | Interstitial, rewarded, banner all load |
| IAP | Android + iOS | Purchase + restore work |
| Background/Foreground | Android + iOS | Game pauses, resumes correctly |
| Low Memory | Android | No crash on memory pressure |
| Orientation | Android + iOS | Portrait lock enforced |
| Safe Areas | iOS (notch) | HUD elements not clipped |
| Performance | Both | 60fps on mid-range devices |

### Phase 9: Submission — `agent-submit` (20 min)

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
Day 1-2  ████░░░░░░░░░░░░░░░░  Phase 1-2: Setup + Native Bridge
Day 3-4  ░░░░████░░░░░░░░░░░░  Phase 3-4: Store Assets + Listings
Day 5-7  ░░░░░░░░██████░░░░░░  Phase 5-6: Ads + IAP Integration
Day 8-9  ░░░░░░░░░░░░░░████░░  Phase 7-8: Analytics + QA
Day 10   ░░░░░░░░░░░░░░░░░░██  Phase 9: Submission
Week 2-3 ░░░░░░░░░░░░░░░░████  Review + Staged Rollout
```

**Total estimated time**: ~4.5 hours of AI agent work + 2-3 days of store review.

---

## 8. Risk Assessment

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| App Store rejection | High | Low | Pre-test with TestFlight, ensure polish |
| Ad SDK breaks game loop | Medium | Medium | Ads only between waves, never during combat |
| IAP restore issues on iOS | Medium | Medium | Implement receipt validation + restore button |
| Low organic downloads | Medium | High | ASO optimization + cross-portfolio promotion |
| Capacitor WebView performance | Low | Low | Pure Canvas 2D, already performant |
| Save data loss on update | Medium | Low | Version-guarded save format |
| Platform deprecation | Low | Low | Target latest stable APIs |

---

## 9. Cross-Portfolio Promotion

Leverage the existing portfolio ecosystem:

| Channel | Action |
|---------|--------|
| Portfolio homepage | Add Arrowmatic to featured games section |
| 101 other games | Add "More Games" interstitial linking to Arrowmatic |
| Social media | Gameplay GIFs + store links |
| GitHub README | Badge + link to stores |
| Email newsletter | Announcement to existing subscribers |
| App Store cross-sell | "More by Luca Gandolfi" with Votopoli, Wikithriving |

---

## 10. Success Metrics (Post-Launch)

| Timeframe | Goal |
|-----------|------|
| Week 1 | 500+ installs, D1 > 40%, crash-free > 99% |
| Month 1 | 8,000+ installs, D7 > 15%, first IAP revenue |
| Month 3 | 35,000+ cumulative, D30 > 5%, positive ROI |
| Month 6 | 80,000+ cumulative, $7K+ revenue, featured in "New Games" |

---

*Built by Luca Gandolfi — Full-Stack Engineer & Game Developer*
