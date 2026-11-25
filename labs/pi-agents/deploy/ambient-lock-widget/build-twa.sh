#!/usr/bin/env bash
# Build script for SHHH TWA (Trusted Web Activity) — Google Play Store
# Requires: npx @bubblewrap/cli
# Usage: bash build-twa.sh
set -euo pipefail

echo "=== SHHH TWA Build ==="

# 1. Ensure Bubblewrap CLI
if ! npx --yes @bubblewrap/cli --version >/dev/null 2>&1; then
  echo "Installing Bubblewrap CLI..."
  npm install -g @bubblewrap/cli
fi

# 2. Build the PWA
echo "Building PWA..."
npm run build 2>/dev/null || true

# 3. Generate signing key (first time only)
KEYSTORE="shhh-release.keystore"
if [ ! -f "$KEYSTORE" ]; then
  echo "Generating signing key..."
  keytool -genkeypair \
    -alias shhh \
    -keyalg RSA -keysize 2048 \
    -validity 10000 \
    -keystore "$KEYSTORE" \
    -storepass shhh123 \
    -keypass shhh123 \
    -dname "CN=SHHH, OU=App, O=SHHH, L=Cloud, ST=Web, C=IT"
  echo "Keystore created: $KEYSTORE"
  echo "⚠️  Back up this keystore! You need it for updates."
fi

# 4. Initialize/update TWA project
echo "Initializing Bubblewrap TWA..."
npx @bubblewrap/cli init \
  --config bubblewrap.json \
  --skipVerification

# 5. Build the APK
echo "Building APK..."
npx @bubblewrap/cli build \
  --config bubblewrap.json

echo ""
echo "=== Build Complete ==="
echo "APK: app/build/outputs/apk/release/app-release-signed.apk"
echo ""
echo "To build AAB (recommended for Play Store):"
echo "  npx @bubblewrap/cli build --config bubblewrap.json --aab"
echo ""
echo "To upload to Play Store:"
echo "  1. Go to https://play.google.com/console"
echo "  2. Create app 'SHHH'"
echo "  3. Upload the AAB"
echo "  4. Fill in store listing (see STORE-LISTING.md)"
echo "  5. Complete Data Safety with microphone declaration"
echo "  6. Submit for review"
