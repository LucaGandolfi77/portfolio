# 🏗️ Google Play Publishing Guide

## Panoramica

Guida passo-passo per pubblicare le prime 3 app su Google Play:
1. **WikiThriving** — Life skills gamified
2. **Il Regno di Moneta** — Financial literacy idle game
3. **Votopoli** — Satirical voting simulator

**Costo totale**: €25 (Google Play developer account, one-time)

---

## Prerequisiti

### Account Google Play Console
1. Vai a https://play.google.com/console
2. Crea un developer account (€25 one-time fee)
3. Completa il profilo sviluppatore (nome, email, telefono)

### Strumenti necessari
- **Node.js** 18+ (https://nodejs.org)
- **Java JDK** 17+ (https://adoptium.net)
- **Android SDK** (https://developer.android.com/studio)
- **Git**

### Verifica installazione
```bash
node --version      # >= 18.0.0
java --version      # >= 17.0.0
echo $ANDROID_HOME  # path to Android SDK
```

---

## Fase 1: Setup (10 minuti)

### 1.1 Installa le dipendenze
```bash
cd /path/to/portfolio

# Per WikiThriving
cd games/wikithriving && npm install && cd ../..

# Per Regno di Moneta
cd games/regno-di-moneta && npm install && cd ../..

# Per Votopoli
cd games/votopoli && npm install && cd ../..
```

### 1.2 Verifica assetlinks.json
```bash
cat .well-known/assetlinks.json
```
Dovrebbe contenere le 3 app con fingerprint `TODO`. Verranno aggiornate dopo il build.

---

## Fase 2: Build TWA (15 minuti per app)

### 2.1 Build automatico (consigliato)
```bash
# Build tutte e 3 le app
bash scripts/build-twa.sh

# Oppure singola app
bash scripts/build-twa.sh wikithriving
bash scripts/build-twa.sh regno-di-moneta
bash scripts/build-twa.sh votopoli
```

### 2.2 Build manuale (per singola app)
```bash
cd games/wikithriving

# Inizializza progetto Android
npx @nickvdh/pwa-to-twa \
  --config twa-config.json \
  --directory . \
  --force

# Build APK
cd android
chmod +x gradlew
./gradlew assembleRelease

# Trova l'APK
find . -name "*.apk" -path "*/release/*"
```

### 2.3 Estrai la fingerprint SHA-256
```bash
# Dopo il build, esegui:
bash scripts/extract-fingerprint.sh

# Output:
# SHA-256 Fingerprint: AB:CD:EF:...
# Updated assetlinks.json with real fingerprint
```

---

## Fase 3: Screenshots (30 minuti)

### 3.1 Cattura screenshot
Segui la guida in `scripts/screenshot-guide.md`

**Per ogni app**: cattura 4 screenshot (1080x1920 px)
- Gameplay screenshot
- Menu principale
- Feature highlight
- Stats/Achievement

### 3.2 Rinomina i file
```
screenshots/
├── wiki-1.png (1080x1920)
├── wiki-2.png
├── wiki-3.png
├── wiki-4.png
├── regno-1.png
├── regno-2.png
├── regno-3.png
├── regno-4.png
├── voto-1.png
├── voto-2.png
├── voto-3.png
└── voto-4.png
```

---

## Fase 4: Google Play Console (20 minuti per app)

### 4.1 Crea il listing
1. Vai a Google Play Console → "Crea app"
2. Seleziona "Gioco"
3. Inserisci il titolo (da `docs/store-listings/`)
4. Completa tutti i campi obbligatori

### 4.2 Store listing
Per ogni app, copia da `docs/store-listings/`:
- **Titolo**: come specificato nel file
- **Descrizione breve** (80 chars): come specificato
- **Descrizione completa** (4000 chars): come specificato
- **Screenshot**: carica i 4 screenshot
- **Categoria**: Games > Educational (o Simulation per Votopoli)
- **Contenuto**: Everyone (o Teen per Votopoli)

### 4.3 Content rating
Completa il questionario IARC (Interactive Application Rating Coalition)
- Seleziona "No" per tutte le domande su violenza, contenuti sessual espliciti, ecc.
- Per Votopoli: seleziona "Satira politica" se disponibile

### 4.4 Data safety
Dichiara:
- "No data collected" (tutte le app usano solo localStorage)
- "Data stored on device only"
- "No data shared with third parties"

### 4.5 Pricing
- Prezzo: Gratis
- Contenuti in-app: Sì (ads, premium upgrade)
- Ads: Sì (per Regno di Moneta e Votopoli)

### 4.6 Upload
1. Vai a "Pubblicazione" → "Percorso di pubblicazione"
2. Crea una nuova release di production
3. Carica l'APK (o AAB)
4. Aggiungi descrizione release ("Initial release")
5. Salva

---

## Fase 5: Verifica Dominio (5 minuti)

### 5.1 Upload assetlinks.json
Il file `.well-known/assetlinks.json` deve essere accessibile a:
```
https://lucagandolfi77.github.io/.well-known/assetlinks.json
```

GitHub Pages serve automaticamente dalla root del repo, quindi il file è già al posto giusto dopo il push.

### 5.2 Verifica
Dopo il push, verifica:
```bash
curl https://lucagandolfi77.github.io/.well-known/assetlinks.json
```
Dovrebbe mostrare il JSON con le fingerprint reali.

### 5.3 Google Play verification
Google Play verificherà automaticamente il file. Se non lo trova:
- Assicurati che il file sia accessibile pubblicamente
- Controlla che non ci siano errori CORS
- Aspetta 24 ore per la propagazione

---

## Fase 6: Submit (5 minuti)

### 6.1 Checklist finale
- [ ] APK/AAB caricato
- [ ] Screenshot caricati (4 per app)
- [ ] Store listing completa
- [ ] Content rating completato
- [ ] Data safety dichiarato
- [ ] Pricing configurato
- [ ] assetlinks.json aggiornato con fingerprint reali
- [ ] privacy.html accessibile

### 6.2 Submit per revisione
1. Vai a "Pubblicazione" → "Rivedi e pubblica"
2. Clicca "Invia per revisione"
3. Aspetta 1-7 giorni per la revisione

### 6.3 Monitora
- Controlla email per eventuali rejection
- Se reject: leggi il motivo, fixa, resubmit
- Dopo approvazione: l'app sarà live entro 24 ore

---

## Troubleshooting

### Build fallisce con "Android SDK not found"
```bash
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
```

### Gradle fallisce con "SDK not found"
```bash
cd android
echo "sdk.dir=$ANDROID_HOME" > local.properties
```

### APK non trovato dopo build
```bash
cd android
./gradlew assembleDebug  # debug mode funziona sempre
find . -name "*.apk"
```

### assetlinks.json non trovato
```bash
# Verifica che GitHub Pages lo serva:
curl -I https://lucagandolfi77.github.io/.well-known/assetlinks.json
# Dovrebbe restituire 200 OK
```

### App non si apre come standalone
- Verifica che la fingerprint in assetlinks.json sia corretta
- Verifica che il package name sia esatto
- Prova a disinstallare e reinstallare l'app

---

## Link Utili
- Google Play Console: https://play.google.com/console
- Bubblewrap docs: https://github.com/nickvdh/nickvdh.github.io
- TWA docs: https://developers.google.com/web/updates/2019/02/twa
- Content rating: https://support.google.com/googleplay/android-developer/answer/9859673
