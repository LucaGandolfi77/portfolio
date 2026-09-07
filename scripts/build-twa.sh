#!/bin/bash
# build-twa.sh — Build TWA bundles for all 3 apps
# Usage: bash scripts/build-twa.sh [app-name]
# Examples:
#   bash scripts/build-twa.sh              # Build all 3 apps
#   bash scripts/build-twa.sh wikithriving  # Build only WikiThriving

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BUILD_DIR="$REPO_ROOT/build-twa"
APPS=(
  "wikithriving|com.lucagandolfi.wikithriving|games/wikithriving"
  "regno-di-moneta|com.lucagandolfi.regnodimoneta|games/regno-di-moneta"
  "votopoli|com.lucagandolfi.votopoli|games/votopoli"
)

log()  { echo -e "${GREEN}[✓]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
err()  { echo -e "${RED}[✗]${NC} $1"; }

# Check dependencies
check_deps() {
  if ! command -v node &>/dev/null; then
    err "Node.js not found. Install from https://nodejs.org"
    exit 1
  fi
  if ! command -v java &>/dev/null; then
    warn "Java not found. Android SDK requires Java 17+."
    warn "Install: sudo apt install openjdk-17-jdk (Linux) or brew install openjdk (macOS)"
  fi
  if [ -z "$ANDROID_HOME" ] && [ -z "$ANDROID_SDK_ROOT" ]; then
    warn "ANDROID_HOME not set. Android SDK may not be found."
    warn "Install Android SDK: https://developer.android.com/studio"
  fi
}

# Install Bubblewrap if not present
install_bubblewrap() {
  if ! npx --yes @nickvdh/pwa-to-twa --help &>/dev/null 2>&1; then
    warn "Installing @nickvdh/pwa-to-twa..."
    npm install -g @nickvdh/pwa-to-twa 2>/dev/null || true
  fi
}

# Build TWA for one app
build_app() {
  local name="$1"
  local pkg="$2"
  local path="$3"
  local config="$REPO_ROOT/$path/twa-config.json"
  local app_build="$BUILD_DIR/$name"

  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  log "Building TWA: $name"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

  if [ ! -f "$config" ]; then
    err "Config not found: $config"
    return 1
  fi

  mkdir -p "$app_build"
  cd "$app_build"

  # Initialize Android project if not exists
  if [ ! -d "android" ]; then
    log "Initializing Android project..."
    npx --yes @nickvdh/pwa-to-twa \
      --config "$config" \
      --directory "$app_build" \
      --force 2>&1 | tail -5
  fi

  # Build APK
  if [ -d "android" ]; then
    cd android
    log "Building APK..."
    if [ -f "./gradlew" ]; then
      chmod +x ./gradlew
      ./gradlew assembleRelease 2>&1 | tail -3
      APK_PATH=$(find . -name "*.apk" -path "*/release/*" | head -1)
      if [ -n "$APK_PATH" ]; then
        cp "$APK_PATH" "$app_build/$name.apk"
        log "APK built: $app_build/$name.apk"
        # Extract signing fingerprint
        log "Extracting SHA-256 fingerprint..."
        KEYSTORE=$(find ~/.android -name "debug.keystore" 2>/dev/null | head -1)
        if [ -n "$KEYSTORE" ]; then
          FINGERPRINT=$(keytool -list -v -keystore "$KEYSTORE" -alias androiddebugkey -storepass android 2>/dev/null | grep "SHA256:" | awk '{print $2}')
          if [ -n "$FINGERPRINT" ]; then
            echo "$FINGERPRINT" > "$app_build/fingerprint.txt"
            log "Fingerprint: $FINGERPRINT"
          fi
        fi
      else
        err "APK not found after build"
      fi
    else
      err "gradlew not found"
    fi
  else
    err "Android project not created"
  fi

  cd "$REPO_ROOT"
}

# Main
main() {
  echo ""
  echo "🏗️  TWA Builder — Votopoli, Regno di Moneta, WikiThriving"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""

  check_deps
  install_bubblewrap

  mkdir -p "$BUILD_DIR"

  local target="${1:-all}"

  for app in "${APPS[@]}"; do
    IFS='|' read -r name pkg path <<< "$app"
    if [ "$target" = "all" ] || [ "$target" = "$name" ]; then
      build_app "$name" "$pkg" "$path"
    fi
  done

  # Generate combined assetlinks.json with real fingerprints
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  log "Generating assetlinks.json with fingerprints..."
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

  ASSETLINKS='['
  FIRST=true
  for app in "${APPS[@]}"; do
    IFS='|' read -r name pkg path <<< "$app"
    FP_FILE="$BUILD_DIR/$name/fingerprint.txt"
    FP="TODO:REPLACE_WITH_ACTUAL_SHA256_FINGERPRINT"
    if [ -f "$FP_FILE" ]; then
      FP=$(cat "$FP_FILE")
    fi
    if [ "$FIRST" = true ]; then FIRST=false; else ASSETLINKS+=','; fi
    ASSETLINKS+="
  {
    \"relation\": [\"delegate_permission/common.handle_all_urls\"],
    \"target\": {
      \"namespace\": \"android_app\",
      \"package_name\": \"$pkg\",
      \"sha256_cert_fingerprints\": [\"$FP\"]
    }
  }"
  done
  ASSETLINKS+="
]"

  echo "$ASSETLINKS" > "$REPO_ROOT/.well-known/assetlinks.json"
  log "assetlinks.json updated at .well-known/assetlinks.json"

  # Summary
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  log "Build complete!"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "APKs:"
  ls -la "$BUILD_DIR"/*.apk 2>/dev/null || echo "  (none built yet)"
  echo ""
  echo "Next steps:"
  echo "  1. Upload APKs to Google Play Console"
  echo "  2. Add screenshots (1080x1920)"
  echo "  3. Use store listings from docs/store-listings/"
  echo "  4. Submit for review"
  echo ""
}

main "$@"
