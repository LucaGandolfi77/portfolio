# Echoes of the Last Dawn — Deployment Plan

**Game:** L'Ultimo Rintocco (Echoes of the Last Dawn)
**Engine:** Three.js r160 (vendored), ES Modules, zero build step
**App ID:** `com.lucagandolfi.echoes`
**Capacitor:** 6.x

## Summary

Turn-based JRPG with real-time parry, procedural 3D world, 5 zones, 5 bosses, 8 NPCs, 3 endings. Zero asset files — everything is code. 2,196 lines of custom JavaScript.

## Deployment Checklist

### ✅ Completed
- [x] Save system (3 slots + auto-save, localStorage)
- [x] Audio system (procedural Web Audio API, bell toll, combat, ambient)
- [x] PWA manifest + Service Worker (cache-first for vendor, network-first for src/)
- [x] Capacitor 6.x setup (package.json, capacitor.config.json)
- [x] Android native project (android/)
- [x] iOS native project (ios/)
- [x] www/ directory synced
- [x] Store assets (icons 192/512/1024, maskable, apple-touch-icon, splash, feature-graphic)
- [x] Store listings (EN + IT descriptions, keywords, content rating)

### ⏳ Pending (Phases 7-12)
- [ ] English localization (story.js, ui.js, combat.js)
- [ ] Touch optimization (joystick, parry button, safe areas)
- [ ] Monetization code (Free demo Zona 1 + Full Game $4.99)
- [ ] QA & Testing
- [ ] Submission (Google Play + Apple App Store)
- [ ] Marketing

## Build Commands

```bash
cd games/echoes-of-the-last-dawn

# Install dependencies
npm install

# Add platforms
npx cap add android
npx cap add ios

# Sync web assets
npx cap sync

# Open in IDE
npx cap open android    # Android Studio
npx cap open ios        # Xcode
```

## Store Submission

### Google Play
1. `npx cap sync android`
2. Open `android/` in Android Studio
3. Build → Generate Signed APK/AAB
4. Upload to Google Play Console
5. Fill store listing from `STORE_LISTING.md`

### Apple App Store
1. `npx cap sync ios`
2. Open `ios/` in Xcode
3. Archive → Upload to App Store Connect
4. Fill store listing from `STORE_LISTING.md`

## Content Rating
- IARC 7+ (fantasy violence, no gore, mild atmosphere)
- Apple: 9+
- Google Play: Everyone 10+

## Target Audience
- Primary: Ages 14-30 (JRPG fans, indie gamers)
- Secondary: Ages 10-14 (with parental guidance)
- Tertiary: Ages 30+ (narrative game enthusiasts)
