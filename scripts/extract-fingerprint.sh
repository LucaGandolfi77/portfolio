#!/bin/bash
# extract-fingerprint.sh — Extract SHA-256 fingerprint from signing keystore
# Usage: bash scripts/extract-fingerprint.sh [keystore-path]

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

KEYSTORE="${1:-$HOME/.android/debug.keystore}"
ALIAS="androiddebugkey"
PASS="android"

echo ""
echo "🔑 SHA-256 Fingerprint Extractor"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ ! -f "$KEYSTORE" ]; then
  echo -e "${YELLOW}Debug keystore not found at: $KEYSTORE${NC}"
  echo ""
  echo "To generate one, run:"
  echo "  keytool -genkey -v -keystore ~/.android/debug.keystore \\"
  echo "    -alias androiddebugkey -keyalg RSA -keysize 2048 -validity 10000 \\"
  echo "    -storepass android -keypass android \\"
  echo "    -dname 'CN=Android Debug,O=Android,C=US'"
  echo ""
  exit 1
fi

echo "Keystore: $KEYSTORE"
echo ""

# Extract SHA-256
FINGERPRINT=$(keytool -list -v -keystore "$KEYSTORE" -alias "$ALIAS" -storepass "$PASS" 2>/dev/null | grep "SHA256:" | awk '{print $2}')

if [ -z "$FINGERPRINT" ]; then
  echo "Failed to extract fingerprint. Check keystore password and alias."
  exit 1
fi

echo -e "${GREEN}SHA-256 Fingerprint:${NC}"
echo "  $FINGERPRINT"
echo ""

# Update assetlinks.json
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(dirname "$SCRIPT_DIR")"
ASSETLINKS="$REPO_ROOT/.well-known/assetlinks.json"

if [ -f "$ASSETLINKS" ]; then
  sed -i "s/TODO:REPLACE_WITH_ACTUAL_SHA256_FINGERPRINT/$FINGERPRINT/g" "$ASSETLINKS"
  echo "Updated assetlinks.json with real fingerprint"
fi

echo ""
echo "Copy this for Google Play Console:"
echo "  $FINGERPRINT"
