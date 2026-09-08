# VITE — Deployment Checklist

## FASE A: Deploy Web (giorno 1)

- [ ] Scegli dominio: `vite-carrere.app` o simile
- [ ] Deploy su Vercel/Netlify
- [ ] Verifica HTTPS funzionante
- [ ] Testa PWA su Chrome (Lighthouse score > 90)
- [ ] Testa offline (disconnettiti e ricarica)
- [ ] Verifica manifest.json valido
- [ ] Verifica service worker registrato

## FASE B: Google Play Store (giorno 2-5)

- [ ] Crea Google Play Developer account ($25 one-time)
- [ ] Verifica identità (passaporto o carta d'identità)
- [ ] Installa Bubblewrap CLI
- [ ] Esegui `bubblewrap init` con il tuo dominio
- [ ] Esegui `bubblewrap build` per generare il .aab
- [ ] Crea keystore per la firma (o usa Google Play App Signing)
- [ ] Upload .aab su Google Play Console

## FASE C: Store Listing (giorno 3-5)

- [ ] Compila nome app: "VITE — Literary Lives"
- [ ] Compila short description (80 char)
- [ ] Compila full description (vedi docs/VITE-STORE-LISTING.md)
- [ ] Carica feature graphic (1024x500)
- [ ] Carica screenshot (min 2, max 8)
- [ ] Imposta categoria: Games > Adventure
- [ ] Compila IARC content rating questionnaire
- [ ] Compila Data Safety section

## FASE D: Digital Asset Links (giorno 5)

- [ ] Ottieni SHA256 fingerprint del keystore
- [ ] Aggiorna `.well-known/assetlinks.json`
- [ ] Deploy assetlinks.json sul tuo dominio
- [ ] Verifica su https://digitalassetlinks.googleapis.com/

## FASE E: Review e Launch (giorno 6-10)

- [ ] Submit app per review
- [ ] Attendi review (3-7 giorni)
- [ ] Se rejection: leggi motivazione, correggi, resubmit
- [ ] Se approvazione: app è live!
- [ ] Condividi link su social
- [ ] Invia PR a media letterari

## FASE F: Post-Launch

- [ ] Monitora rating e recensioni
- [ ] Rispondi alle recensioni
- [ ] Pianifica aggiornamenti (nuove features, bug fix)
- [ ] Raccogli feedback da utenti
- [ ] Considera App Store (Apple) se Play Store performa

## Note Tecniche

### assetlinks.json
Deve essere accessibile a:
```
https://vite-carrere.app/.well-known/assetlinks.json
```

### SHA256 Fingerprint
Per ottenerlo:
```bash
keytool -list -v -keystore keystore/vite-carrere.keystore -alias vite-carrere
```

### Target API Level
- 2026: API Level 36 (Android 16) richiesto entro agosto 2026
- Minimo: API Level 21 (Android 5.0)

### Review Tips
- Assicurati che il SW funzioni correttamente offline
- Assicurati che il manifest sia valido
- Assicurati che le icone siano corrette (maskable)
- Non usare alert() o funzioni che bloccano l'UI
- Assicurati che il contenuto sia appropriato per Everyone
