# Pixel Stretch — Deployment Checklist

## Pre-Launch (Complete)

### Store Listing
- [ ] App name: "Pixel Stretch — Photo Editor"
- [ ] Short description (80 chars)
- [ ] Full description (4000 chars)
- [ ] Category: Photography
- [ ] Tags: pixel stretch, photo editor, glitch art, AI, offline
- [ ] Feature Graphic (1024×500)
- [ ] Screenshots (4+ phone, 2+ tablet)
- [ ] Privacy Policy URL
- [ ] Contact email

### Technical
- [ ] bubblewrap.json configured
- [ ] Signing key generated and backed up
- [ ] assetlinks.json with correct SHA256 fingerprint
- [ ] app/build/outputs/apk/release/app-release-signed.apk ready
- [ ] minSdkVersion ≥ 21
- [ ] targetSdkVersion = 34
- [ ] Version code incremented for each release

### PWA Verification
- [ ] Lighthouse PWA score ≥ 90
- [ ] Service worker registered and caching
- [ ] manifest.json valid
- [ ] HTTPS enforced
- [ ] Offline functionality works

## Release Process

### 1. Generate Keystore (first time only)
```bash
keytool -genkeypair -alias pixelstretch -keyalg RSA -keysize 2048 \
  -validity 10000 -keystore pixelstretch-release.keystore
```

### 2. Build TWA
```bash
bash build-twa.sh
```

### 3. Get Signing Fingerprint
```bash
keytool -list -v -keystore pixelstretch-release.keystore -alias pixelstretch
```
Copy SHA256 fingerprint to `public/.well-known/assetlinks.json`.

### 4. Upload to Play Console
1. Go to https://play.google.com/console
2. Create app: "Pixel Stretch"
3. Upload AAB (preferred) or APK
4. Fill in store listing (see STORE-LISTING.md)
5. Set pricing: Free
6. Content rating: Everyone
7. Submit for review

### 5. Post-Launch
- [ ] Monitor crash reports
- [ ] Respond to reviews
- [ ] Plan updates (version code increment)
- [ ] Track install counts and ratings

## Update Process
1. Increment `pkgVersionCode` in bubblewrap.json
2. Run `bash build-twa.sh`
3. Upload new AAB to Play Console
4. Add "What's New" text
5. Submit for review

## Keystore Backup
⚠️ **CRITICAL**: Back up `pixelstretch-release.keystore` securely.
If lost, you cannot update the app on Play Store.
Store in: password manager, encrypted cloud backup, offline USB.
