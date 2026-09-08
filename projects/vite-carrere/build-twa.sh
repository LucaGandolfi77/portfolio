#!/bin/bash
# VITE — TWA Build Script
# Prerequisiti: npm install -g @aspect-build/rules_js bubblewrap-cli
#
# Uso:
#   1. Deploy su Vercel/Netlify e ottieni URL HTTPS
#   2. Aggiorna bubblewrap.json con il tuo dominio
#   3. Esegui: bash build-twa.sh
#   4. Upload il .aab su Google Play Console

set -e

echo "=== VITE — TWA Build ==="
echo ""

# Check dependencies
if ! command -v bubblewrap &> /dev/null; then
    echo "Instal bubblewrap-cli:"
    echo "  npm install -g @aspect-build/rules_js"
    echo "  oppure"
    echo "  npx @aspect-build/rules_js init"
    exit 1
fi

# Check keystore
if [ ! -f "./keystore/vite-carrere.keystore" ]; then
    echo "Genero keystore..."
    mkdir -p keystore
    keytool -genkeypair \
        -alias vite-carrere \
        -keyalg RSA \
        -keysize 2048 \
        -validity 10000 \
        -keystore ./keystore/vite-carrere.keystore \
        -storepass vitecarrere \
        -keypass vitecarrere \
        -dname "CN=VITE, OU=Portfolio, O=Portfolio, L=Unknown, ST=Unknown, C=IT"
    echo "Keystore creato."
fi

echo ""
echo "Step 1: Init bubblewrap..."
bubblewrap init --manifest=https://vite-carrere.app/manifest.json

echo ""
echo "Step 2: Build APK..."
bubblewrap build

echo ""
echo "Build completata!"
echo "Il file .aab è nella directory corrente."
echo "Upload su Google Play Console: https://play.google.com/console"
echo ""
echo "Prossimi passi:"
echo "  1. Vai su https://play.google.com/console"
echo "  2. Crea una nuova app"
echo "  3. Upload il .aab nella sezione 'App signing'"
echo "  4. Compila il listing (vedi docs/VITE-STORE-LISTING.md)"
echo "  5. Imposta il content rating (IARC)"
echo "  6. Aggiungi assetlinks.json al tuo dominio"
echo "  7. Submit per review"
