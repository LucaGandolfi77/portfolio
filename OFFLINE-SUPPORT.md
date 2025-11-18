# Offline Support - Portfolio PWA

## 📡 Cos'è l'Offline Support?

Il portfolio ora supporta la **modalità offline** tramite **Service Worker**. Questo significa che i visitatori possono accedere al sito anche senza connessione a Internet!

## ⚙️ Come Funziona

### Service Worker (`sw.js`)
Un Service Worker è uno script JavaScript che gira in background e intercetta le richieste di rete.

**Strategie implementate:**

1. **Cache First** (Risorse statiche)
   - HTML, CSS, JavaScript
   - Carica dalla cache se disponibile
   - Se non in cache, scarica dalla rete
   - Aggiorna la cache per la prossima volta

2. **Network First** (Dati dinamici)
   - File JSON (traduzioni, dati)
   - Tenta la rete per prima
   - Se offline, carica dalla cache
   - Mantiene i dati aggiornati

### Flusso di Funzionamento

```
Visita il sito
    ↓
Service Worker registrato
    ↓
File críticos cachati
    ↓
Utente offline?
    ├─ NO → Carica dal server (aggiorna cache)
    └─ SÌ → Carica dalla cache + pagina offline
```

## 📦 Cosa Viene Cachato

### Cache Critica (Al primo carico)
- `index.html`
- `timeline.html`
- `main.css`
- `main.js`
- `manifest.json`

### Cache Dinamica (Durante la navigazione)
- Altre pagine HTML
- Risorse CSS e JavaScript
- File JSON (traduzioni, dati)
- Immagini

### CDN Esterni
- Google Fonts
- Font Awesome

## 🎯 Funzionalità Offline

Quando offline, gli utenti possono:

✅ Visualizzare tutte le pagine cachate
✅ Leggere articoli e progetti
✅ Consultare il profilo
✅ Esplorare la timeline
✅ Cambiare tema (light/dark)
✅ Cambiare lingua

❌ Non disponibili offline:
- GitHub Projects in tempo reale
- Blog dinamico
- Moduli di contatto
- Streaming video

## 🔄 Aggiornamenti

Il Service Worker:
- Controlla aggiornamenti ogni ora
- Notifica l'utente quando c'è una nuova versione
- Aggiorna automaticamente i file in cache
- Supporta l'installazione come app

## 📱 Come Testare

### Desktop
1. Apri DevTools (F12)
2. Vai in **Application** → **Service Workers**
3. Seleziona "Offline"
4. Visita il sito - funzionerà offline!

### Chrome DevTools
```
F12 → Application → Service Workers → Offline (checkbox)
```

### Firefox DevTools
```
about:debugging#/runtime/this-firefox → Service Workers
```

### Simulare Offline
```
F12 → Network → Throttling: "Offline"
```

## 🛠️ Manutenzione

### Cancellare Cache
```javascript
// In console
caches.keys().then(names => names.forEach(name => caches.delete(name)));
```

### Aggiornare Versione Cache
In `sw.js`, cambia:
```javascript
const CACHE_NAME = 'portfolio-v2'; // Incrementa la versione
```

### Aggiungere File alla Cache

Modifica `urlsToCache` in `sw.js`:
```javascript
const urlsToCache = [
    '/',
    '/index.html',
    '/mia-nuova-pagina.html', // Aggiungi qui
    // ...
];
```

## 🚀 Benefici PWA

- ⚡ **Velocità**: Carica dalla cache (istantaneo)
- 📱 **Installabile**: Installa come app su telefono
- 🔔 **Notifiche**: Avvisa di aggiornamenti
- 📡 **Offline**: Funziona senza internet
- 💾 **Storage**: Persiste i dati localmente

## 🔒 Sicurezza

- ✅ HTTPS required per Service Workers
- ✅ Isolamento dominio
- ✅ No accesso a file locali
- ✅ Permessi espliciti per notifiche

## 📊 Statistiche Cache

Per visualizzare lo spazio utilizzato:
```javascript
navigator.storage.estimate().then(estimate => {
    console.log(`Usato: ${estimate.usage} bytes`);
    console.log(`Disponibile: ${estimate.quota} bytes`);
});
```

## 🔧 Troubleshooting

### Service Worker non registra
- ✓ Usa HTTPS (localhost va bene)
- ✓ Controlla la console per errori
- ✓ Cancella cache e ricarica

### Cache non si aggiorna
- ✓ Forza aggiornamento: `Ctrl+Shift+R`
- ✓ Incrementa CACHE_NAME
- ✓ Cancella dati di sito

### Offline ma ancora vede pagina online
- ✓ Cache potrebbe essere obsoleta
- ✓ Disattiva cache DevTools se attiva
- ✓ Ricarica il Service Worker

## 📚 Risorse

- [MDN Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [PWA Checklist](https://web.dev/pwa-checklist/)
- [Cache API](https://developer.mozilla.org/en-US/docs/Web/API/Cache)

---

**Stato**: ✅ Attivo  
**Versione**: v1.0  
**Ultimo aggiornamento**: Novembre 2025
