#!/usr/bin/env bash
# Build script for Pixel Stretch TWA (Trusted Web Activity) — Google Play Store
# Requires: npx @nickvdh/nickvdh-cli (Bubblewrap)
# Usage: bash build-twa.sh
set -euo pipefail

echo "=== Pixel Stretch TWA Build ==="

# 1. Ensure Bubblewrap is available
if ! npx --yes @nickvdh/nickvdh-cli --version >/dev/null 2>&1; then
  echo "Installing Bubblewrap CLI..."
  npm install -g @nickvdh/nickvdh-cli
fi

# 2. Build the PWA
echo "Building PWA..."
npm run build

# 3. Generate signing key (first time only)
KEYSTORE="pixelstretch-release.keystore"
if [ ! -f "$KEYSTORE" ]; then
  echo "Generating signing key..."
  keytool -genkeypair \
    -alias pixelstretch \
    -keyalg RSA -keysize 2048 \
    -validity 10000 \
    -keystore "$KEYSTORE" \
    -storepass pixelstretch123 \
    -keypass pixelstretch123 \
    -dname "CN=Pixel Stretch, OU=App, O=PixelStretch, L=Cloud, ST=Web, C=IT"
  echo "Keystore created: $KEYSTORE"
  echo "⚠️  Back up this keystore! You need it for updates."
fi

# 4. Initialize/update TWA project
echo "Initializing Bubblewrap TWA..."
npx @nickvdh/nickvdh-cli update \
  --config bubblewrap.json \
  --skipVerification

# 5. Build the APK
echo "Building APK..."
npx @nickvdh/nickvdh-cli build \
  --config bubblewrap.json

echo ""
echo "=== Build Complete ==="
echo "APK: app/build/outputs/apk/release/app-release-signed.apk"
echo ""
echo "To build AAB (recommended for Play Store):"
echo "  npx @nickvdh/nickvdh-cli build --config bubblewrap.json --aab"
echo ""
echo "To upload to Play Store:"
echo "  1. Go to https://play.google.com/console"
echo "  2. Create new app or upload to existing"
echo "  3. Upload the AAB/APK"
echo "  4. Fill in store listing (see STORE-LISTING.md)"
echo "  5. Submit for review"
