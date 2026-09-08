# SHHH — Deployment Checklist

## Pre-Launch (Complete)

### Store Listing
- [x] App name: "SHHH – Read in Silence"
- [x] Short description (80 chars)
- [x] Full description (4000 chars)
- [x] Category: Books & Reference
- [x] Tags: focus reading, silent reading, deep work, reader
- [x] Feature Graphic (1024×500)
- [x] Screenshots (4+ phone, 2+ tablet)
- [x] Privacy Policy URL
- [x] Contact email

### Technical
- [x] bubblewrap.json configured
- [x] Signing key generated and backed up
- [x] assetlinks.json with correct SHA256 fingerprint
- [x] APK/AAB ready
- [x] minSdkVersion ≥ 21
- [x] targetSdkVersion = 34
- [x] Version code incremented for each release
- [x] RECORD_AUDIO permission declared

### PWA Verification
- [x] manifest.webmanifest complete (icons, shortcuts, share_target)
- [x] Service worker registered and caching
- [x] Offline works (SW precaches CDN libs)
- [x] HTTPS enforced (Vercel)
- [x] Privacy policy includes microphone explanation
- [x] i18n IT/EN

### AdMob & Consent
- [x] AdMob app ID configured
- [x] UMP consent SDK loaded
- [x] Non-personalized ads for EU
- [x] Data Safety declares microphone usage
- [x] Privacy policy mentions ads

## Release Process

### 1. Generate Keystore (first time only)
```bash
keytool -genkeypair -alias shhh -keyalg RSA -keysize 2048 \
  -validity 10000 -keystore shhh-release.keystore
```

### 2. Build TWA
```bash
bash build-twa.sh
```

### 3. Get Signing Fingerprint
```bash
keytool -list -v -keystore shhh-release.keystore -alias shhh
```
Copy SHA256 fingerprint to `public/.well-known/assetlinks.json`.

### 4. Upload to Play Console
1. Go to https://play.google.com/console
2. Create app: "SHHH"
3. Upload AAB (preferred) or APK
4. Fill in store listing (see STORE-LISTING.md)
5. Set pricing: Free with ads
6. Content rating: Everyone
7. Declare microphone in Data Safety
8. Submit for review

### 5. iOS (via Capacitor)
1. Install Capacitor: `npm install @capacitor/core @capacitor/cli`
2. Init: `npx cap init`
3. Add iOS: `npx cap add ios`
4. Configure Info.plist (microphone permission string)
5. Build: `npx cap open ios`
6. Submit to App Store via Xcode

### 6. Post-Launch
- [ ] Monitor crash reports
- [ ] Respond to reviews
- [ ] Plan updates (version code increment)
- [ ] Track install counts and ratings
- [ ] A/B test icon & screenshots

## Update Process
1. Increment `pkgVersionCode` in bubblewrap.json
2. Run `bash build-twa.sh`
3. Upload new AAB to Play Console
4. Add "What's New" text
5. Submit for review

## Keystore Backup
⚠️ **CRITICAL**: Back up `shhh-release.keystore` securely.
If lost, you cannot update the app on Play Store.
Store in: password manager, encrypted cloud backup, offline USB.

## Review Risks
- Android: mic permission + Data Safety → low risk if declared correctly
- iOS: microphone + in-app browser → medium risk (mitigate with SFSafariViewController)
- Apple 4.2: ensure minimum functionality beyond web wrapper (focus timer, native haptics)
- App Store review rejection rate: ~40% (mitigable with proper docs)
