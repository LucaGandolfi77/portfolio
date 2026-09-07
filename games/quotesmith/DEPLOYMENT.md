# QuoteSmith — Deployment Guide

---

## Game Summary

| Field | Value |
|---|---|
| Title | QuoteSmith |
| Subtitle | Who Said It? |
| Version | 1.0 |
| Platform | Web (PWA), iOS (Capacitor), Android (Capacitor) |
| Genre | Trivia / Quiz |
| Languages | English, Italian |
| Quotes | 1,284 in 32 categories |
| Price | Free |
| Connectivity | Fully offline |

---

## Deployment Checklist

### 1. Capacitor Setup

- [ ] Install Capacitor dependencies
  ```bash
  npm init -y
  npm install @capacitor/core @capacitor/cli
  npx cap init "QuoteSmith" "com.lucagandolfi77.quotesmith" --web-dir .
  ```
- [ ] Add platforms
  ```bash
  npx cap add android
  npx cap add ios
  ```
- [ ] Configure `capacitor.config.ts` / `capacitor.config.json`
  - Set `webDir` to the quotesmith directory (or a build output)
  - Set `server.androidScheme` to `https`
  - Set `plugins.SplashScreen` with dark background matching the theme
  - Set `plugins.AndroidStatusBar` to dark style
- [ ] Sync web assets
  ```bash
  npx cap sync
  ```

### 2. App Icons & Assets

Generate icons from `icons/icon.svg` (source of truth):

| Platform | Sizes Required |
|---|---|
| Android | 48×48 (mdpi), 72×72 (hdpi), 96×96 (xhdpi), 144×144 (xxhdpi), 192×192 (xxxhdpi), 512×512 (Play Store) |
| iOS | 20×20, 29×29, 40×40, 58×58, 60×60, 76×76, 80×80, 87×87, 120×120, 152×152, 167×167, 180×180, 1024×1024 (App Store) |

- [ ] Export PNG icons at all required sizes
- [ ] Place Android icons in `android/app/src/main/res/mipmap-*/`
- [ ] Place iOS icons in `ios/App/App/Assets.xcassets/AppIcon.appiconset/`
- [ ] Create splash screen (1024×1024 or 2732×2732 for iOS)

### 3. Monetization

- [ ] No in-app purchases required (free app)
- [ ] No ads (ad-free by design)
- [ ] No analytics or tracking
- [ ] No accounts or cloud services

### 4. Quality Assurance

- [ ] Test on Android device (API 26+)
- [ ] Test on iOS device (iOS 14+)
- [ ] Verify offline functionality after install
- [ ] Verify quotes.json loads correctly
- [ ] Verify all 32 categories render
- [ ] Verify EN/IT language toggle
- [ ] Verify all 3 difficulty levels work
- [ ] Verify confetti triggers at 8/10
- [ ] Verify text-to-speech on both platforms
- [ ] Verify haptic feedback on both platforms
- [ ] Verify personal best persists across sessions
- [ ] Verify PWA install prompt on web
- [ ] Test with no network connection
- [ ] Test on various screen sizes (phone, tablet)
- [ ] Test with device accessibility settings (large text, high contrast)

### 5. Store Submission

- [ ] Write store listing (see `STORE_LISTING.md`)
- [ ] Prepare screenshots (see `PRESS_KIT.md` for specs)
- [ ] Complete content rating questionnaire
- [ ] Set privacy policy URL
- [ ] Set support URL
- [ ] Submit for review

---

## Build Commands

### Web (PWA)

```bash
# No build step — static files served directly
# Test locally:
npx serve .
# or
python3 -m http.server 8000
```

### Android (Capacitor)

```bash
# Build and sync
npx cap sync android

# Open in Android Studio
npx cap open android

# Or build APK from command line
cd android
./gradlew assembleDebug        # Debug APK
./gradlew assembleRelease      # Release APK (requires signing config)
```

### iOS (Capacitor)

```bash
# Build and sync
npx cap sync ios

# Open in Xcode
npx cap open ios

# Build from Xcode:
# Product → Archive → Distribute App
```

---

## Google Play Submission

### Prerequisites
- Google Play Developer account ($25 one-time fee)
- App icon (512×512 PNG)
- Feature graphic (1024×500 PNG)
- Screenshots (min 2, phone + tablet recommended)
- Privacy policy URL

### Steps
1. Build release AAB: `cd android && ./gradlew bundleRelease`
2. Sign the AAB with your keystore
3. Go to [Google Play Console](https://play.google.com/console)
4. Create new app → Choose app type (App) → Choose default language
5. Fill in store listing (title, short description, full description)
6. Upload screenshots (phone and tablet)
7. Upload feature graphic
8. Set content rating → Complete IARC questionnaire
9. Set pricing & distribution → Free
10. Upload AAB to production or internal testing track
11. Add privacy policy URL
12. Submit for review

### Content Rating (Google Play)
- Select "Everyone" in IARC questionnaire
- No violent content, no sexual content, no gambling, no user interaction
- Educational/trivia game

### Release Tracks
- **Internal testing** — for quick QA (100 testers max)
- **Closed testing** — for beta testers
- **Open testing** — for public beta
- **Production** — live on Play Store

---

## Apple App Store Submission

### Prerequisites
- Apple Developer Program ($99/year)
- App icon (1024×1024 PNG, no transparency)
- Screenshots for iPhone (6.7", 6.5", 5.5") and iPad (12.9")
- Privacy policy URL
- App Store Connect access

### Steps
1. Archive the app in Xcode: Product → Archive
2. Go to [App Store Connect](https://appstoreconnect.apple.com)
3. Create new app → Choose iOS platform
4. Fill in app information (name, subtitle, category: Games → Trivia)
5. Upload screenshots for all required device sizes
6. Enter description, keywords, support URL, privacy policy URL
7. Set age rating (4+)
8. Upload the build from Xcode Organizer
9. Set pricing (Free)
10. Submit for App Review

### Age Rating (App Store)
- Select age rating through App Store Connect questionnaire
- Expected: 4+ (no objectionable content)

### Review Guidelines
- Apple reviews for functionality, content, and design
- Offline-only apps are permitted
- No login required = faster review
- QuoteSmith complies with all App Store Review Guidelines

---

## Post-Deployment

- [ ] Monitor GitHub Issues for bug reports
- [ ] Update `quotes.json` version number for new quote batches
- [ ] Push updates through Capacitor + store submission
- [ ] Respond to user reviews
- [ ] Maintain privacy policy page
