# VOTOPOLI 🗳️

**La Democrazia è un Gioco — Multiplayer Voting Simulator PWA**

Inizia con una tenda a Bastardo, Umbria ⛺. Scala a un castello a Dubai 🏰. Gestisci business assurdi, vota sindaci corrotti, corrompi politici e naviga la burocrazia nei minigiochi. Ogni giorno ci sono elezioni locali, ogni settimana le nazionali.

---

## Features

### 🎮 Core Loop
- **13 business idle**: dalla Bancarella di Limonate 🍋 alla Media Company 📺 — il Partito Politico 🏛️ genera influenza
- **12 risorse**: 💰 Soldi, 🗳️ Influenza, ⚡ Energia
- **Idle earnings**: guadagni offline (2-24h in base alla casa)
- **Tasse dinamiche**: il sindaco eletto fissa le tasse 0-50%, il presidente modifica

### 🗳️ Sistema Elettorale
- **Elezioni locali giornaliere** (8:00-22:00): 4 candidati con nomi satirici (On. Tangentopoli, Dott.ssa Bustarella...), piattaforme fiscali, favori personali
- **Elezioni nazionali settimanali** (domenica): seed RNG condiviso → stessi risultati per tutti senza server
- **Candidatura**: con abbastanza influenza corri tu per sindaco/presidente
- **Favori**: vacanza fiscale, appalti pubblici, upgrade casa gratis
- **Corruzione**: sifona le casse del comune, rischi scandalo 📰

### 🎭 Satira Italiana
- Partiti: Movimento 5 Pizze 🍕, Lega dei Pigri 😴, Forza Bancomat 💳
- Città: Bastardo, Vergate sul Membro, Borgo Vaniglia, Città della Pizza
- Eventi: "Il sindaco ha inaugurato una fontana di Nutella", "Un piccione eletto consigliere"
- Bonus paesi: Svizzera (+30% banche), Francia (scioperi random), Emirati (zero tasse)

### 🎮 5 Minigiochi
1. **Dibattito TV** 🎤 — quiz satirici
2. **Schiva la Burocrazia** 📋 — runner
3. **Campagna Elettorale** 🤝 — timing: stringi mani, bacia bambini
4. **Busta Paga** 💸 — catch money, dodge tasse
5. **Promesse da Marinaio** 🧠 — memory

### 🌍 Mappa del Mondo
- **20 paesi** con bonus satirici unici
- **40 città** in 5 tier (da Bastardo a New York)
- Trasferisciti: costa in base alla tier differenza

### 📡 Multiplayer (PeerJS)
- Room P2P per città: cittadini reali, chat, elezioni condivise
- Host migration automatica
- Fallback bot se nessuno è online

### 💰 Monetizzazione
- Rewarded ads (+energia, +soldi)
- Remove ads €2.99, Premium €4.99
- Starter Pack €1.99

---

## Tech Stack

| Aspect | Detail |
|---|---|
| Language | Vanilla JavaScript (ES6+), HTML5, CSS3 |
| Dependencies | Zero (+ PeerJS CDN for multiplayer) |
| Persistence | localStorage |
| Audio | Web Audio API (11 effects) |
| PWA | Service Worker + manifest.webmanifest |
| Store | Capacitor (iOS) + TWA (Google Play) |

### File Structure

```
votopoli/
├── index.html              # Main HTML
├── manifest.webmanifest    # PWA manifest
├── sw.js                   # Service Worker
├── capacitor.config.json   # Capacitor config
├── package.json            # NPM config
├── twa-config.json         # TWA config
├── icons/                  # PWA icons
└── js/
    ├── world.js            # 20 countries, 40 cities
    ├── politicians.js      # Candidate generator
    ├── bots.js             # Simulated citizens
    ├── economy.js          # 13 businesses, taxes
    ├── housing.js          # 8 home tiers
    ├── elections.js        # Election engine
    ├── events.js           # Satirical events
    ├── room.js             # PeerJS multiplayer
    ├── minigames.js        # 5 satirical minigames
    ├── save.js             # Persistence
    ├── sounds.js           # 11 audio effects
    ├── monetization.js     # Ads/IAP
    └── main.js             # Router + UI
```

---

## Deploy

### GitHub Pages (auto)
Push to `main` → auto-deploy via GitHub Actions.
Live at: `https://lucagandolfi77.github.io/portfolio/games/votopoli/`

### Google Play Store (TWA)
```bash
npx @nicedoc/nicedoc-cli init --config twa-config.json
cd android && ./gradlew assembleRelease
```

### Apple App Store (Capacitor)
```bash
npm install && npx cap add ios && npx cap sync && npx cap open ios
```

### Verify
```bash
for f in js/*.js; do node --check "$f"; done
```

---

## License

Progetto personale di Luca Gandolfi. Tutti i diritti riservati.
