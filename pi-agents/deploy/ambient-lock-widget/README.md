# SHHH — Leggi in silenzio

> Il primo lettore che ha bisogno di silenzio. Il rumore punisce la lettura.

**SHHH** è un lettore offline-first che usa il microfono del dispositivo per monitorare il rumore ambientale. Quando l'ambiente supera la soglia impostata, SHHH **blocca o sfoca il contenuto** — costringendo l'utente a cercare il silenzio prima di poter continuare a leggere.

## Caratteristiche

- **Lettura offline-first**: PDF, ePub, TXT, MD, HTML
- **Monitoraggio acustico in tempo reale** (RMS → dB) — 100% on-device
- **Due modalità**: Soglia (blocco totale) e Dissolvenza (trasparenza progressiva)
- **Browser integrato** con blocco del rumore
- **Streak e statistiche** della sessione silenziosa
- **Nessun account, nessun server, nessun dato inviato**
- **100% offline** dopo l'installazione

## Avvio rapido

```bash
# Serve locale
npx serve . -l 8080
# oppure
npm run serve
```

## Pubblicazione

- **Google Play**: TWA via Bubblewrap (`bubblewrap.json` presente)
- **App Store**: wrapper Capacitor (proposto)
- **Web PWA**: manifest + service worker

## Licenza

MIT
