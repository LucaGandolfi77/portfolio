# Deployment Guide — Esposta

## Prerequisites

- Node.js 18+ and npm
- Android Studio (latest stable, with SDK 34+)
- Xcode 15+ (macOS only, for iOS builds)
- Capacitor CLI (`npm install -g @capacitor/cli`)
- A valid Google Play Developer account
- A valid Apple Developer account
- App ID: `com.lucagandolfi.esposta`

## Build Commands

```bash
# Install dependencies
npm install

# Build the web assets
npm run build

# Sync Capacitor platforms with the built web assets
npx cap sync

# Sync only Android
npx cap sync android

# Sync only iOS
npx cap sync ios

# Open Android project in Android Studio
npx cap open android

# Open iOS project in Xcode
npx cap open ios
```

## Android Build

### Generate Signed AAB

1. Build the release AAB from Android Studio:
   - Open `android/` in Android Studio
   - Go to **Build → Generate Signed Bundle / APK**
   - Select **Android App Bundle**
   - Use your keystore (or create one)
   - Set build variant to `release`

2. Or build from command line:
   ```bash
   cd android
   ./gradlew bundleRelease
   ```
   Output: `android/app/build/outputs/bundle/release/app-release.aab`

### Signing

- Keep your keystore file and `key.properties` secure
- Never commit keystore or credentials to version control
- Store release keystore separately from debug keystore

### Upload to Google Play

1. Go to [Google Play Console](https://play.google.com/console)
2. Select your app (or create a new listing with `com.lucagandolfi.esposta`)
3. Navigate to **Production → Create new release**
4. Upload the `.aab` file
5. Add release notes
6. Submit for review

## iOS Build

### Archive and Export

1. Open the project in Xcode:
   ```bash
   npx cap open ios
   ```

2. In Xcode:
   - Select **Any iOS Device** as the build target
   - Go to **Product → Archive**
   - Wait for the archive to complete

3. In the Organizer:
   - Select your archive
   - Click **Distribute App**
   - Choose **App Store Connect**
   - Follow the export wizard (choose appropriate options for your team/signing)

### Upload to App Store Connect

1. Use **Xcode → Window → Organizer** to upload the archive
2. Or use `xcodebuild` + `altool` / `Transporter` app:
   ```bash
   xcodebuild -exportArchive \
     -archivePath path/to/YourApp.xcarchive \
     -exportOptionsPlist ExportOptions.plist \
     -exportPath output/
   ```

3. Go to [App Store Connect](https://appstoreconnect.apple.com)
4. Select your app (or create a new listing)
5. Navigate to the version you want to publish
6. Upload screenshots and metadata
7. Submit for review

## Google Play Console Submission

1. Create a new app in Google Play Console with package name `com.lucagandolfi.esposta`
2. Fill in store listing:
   - App name, short description, full description
   - Upload screenshots (phone, tablet, if applicable)
   - Upload feature graphic (1024x500)
   - Set category to **Education**
   - Set content rating questionnaire
3. Set pricing: **Free** (no in-app purchases)
4. Upload privacy policy URL
5. Upload AAB to internal testing or production track
6. Complete data safety section
7. Submit for review

## App Store Connect Submission

1. Create a new app in App Store Connect
2. Fill in app information:
   - Name, subtitle, description, keywords
   - Upload screenshots (6.7", 6.5", 5.5" iPhone; 12.9" iPad)
   - Upload app icon (1024x1024)
   - Set category to **Education**
3. Set pricing: **Free**
4. Upload privacy policy URL
5. Upload the build from Xcode
6. Complete App Privacy section
7. Submit for review

## Post-Launch Checklist

- [ ] Verify app is live on both stores
- [ ] Confirm ads (AdMob) are loading and displaying
- [ ] Test all 12 minigames in production build
- [ ] Test language switching (IT ↔ EN)
- [ ] Verify final exam certificate generation
- [ ] Verify endless agency mode
- [ ] Confirm analytics/tracking (if applicable)
- [ ] Monitor crash reports (Firebase Crashlytics / Xcode Organizer)
- [ ] Respond to initial user reviews
- [ ] Share press kit and store links
- [ ] Update portfolio website with store badges

## Rollback Plan

1. **Google Play**: In Google Play Console, go to **Production → Releases**, revert to the previous release by promoting the previous AAB to production. Users on older versions will receive the previous build.

2. **App Store Connect**: In App Store Connect, remove the current version from sale, then re-upload and re-approve the previous build. Alternatively, use **App Store → Version History** to revert if available.

3. **Emergency Hotfix**: If a critical bug is found post-launch:
   - Fix in source, bump the patch version (e.g., 1.0.0 → 1.0.1)
   - Build, test locally, then deploy to both stores
   - Communicate the fix in release notes

4. **Keystore Recovery**: If Android keystore is lost, you cannot update the existing app. You would need to create a new listing with a new package name and migrate users.
