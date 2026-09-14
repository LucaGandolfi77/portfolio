# POLIFONIA — Naming Studio & Piano di Produzione

> Casa di produzione app & videogiochi mobile · AI-agent driven
> Google Play Store + Apple App Store
> v1.0 · Documento strategico

**Collegamenti interni**: [`pi-agents/`](../pi-agents/AGENTS.md) (studio multi-agente) · [`APP-STORE-STRATEGY.md`](APP-STORE-STRATEGY.md) (analisi asset) · [`WIKITHRIVING-LAUNCH.md`](WIKITHRIVING-LAUNCH.md) (go-to-market) · [`VITE-STORE-LISTING.md`](VITE-STORE-LISTING.md)

---

## PARTE 1 — NAMING (Dostoevskij × modernità)

### 1.1 Criteri di valutazione

Ogni nome è valutato su: riferimento letterario (forza del legame con Dostoevskij), brandability (suono, lunghezza, memorabilità), disponibilità probabile di dominio, rischio policy store (no gambling/edge indesiderato), e aderenza all'identità "studio multi-agente AI".

### 1.2 Le 10 proposte

| # | Nome | Origine Dostoevskij | Rationale | Tagline | Pro | Contro |
|---|------|---------------------|-----------|---------|-----|--------|
| 1 | **POLIFONIA** ⭐ | Bachtin su Dostoevskij: "molte voci indipendenti in pari dignità" | Descrizione tecnica accurata dello studio: 15 agenti AI = molte voci che creano. Parola italiana vera. | *Molte voci. Un solo studio.* | Unica nel settore, identità agenti-letteratura, suono moderno | Richiede 1 riga di spiegazione ai profani |
| 2 | **ARKADY** | Arkadij Dolgorukij, *L'Adolescente* | Pun fonetico geniale: ARKADY ≈ ARCADE. Energia di formazione/gioventù | *We play the coming-of-age.* | Brandability gaming altissima | ".games" dominio da verificare |
| 3 | **RODION** | Nome di Raskol'nikov, *Delitto e Castigo* | Suono tech-moderno (Radio/ON), corto | *Ogni app un delitto perfetto contro la noia.* | Memorabile, duro | Svolta "criminale" giocosa — misurata |
| 4 | **MYSHKIN** | Principe Myškin, *L'Idiota* | Il "positivamente buono": AI etica per il bene | *L'idiota che sa creare.* | Brand etico, story potente | Nome "difficile" da pronunciare |
| 5 | **IGROK** | *Il Giocatore* (Igrok = giocatore/gambler in russo) | Cortissimo, esotico, suona da gamertag | *The player has arrived.* | Deep cut che i letterati amano | Edge gambling; Apple policy da leo-check |
| 6 | **WHITE NIGHTS** | *Le Notti Bianche* + fenomeno Pietroburgo | Le notti in cui si crea | *Built in the white nights.* | Evocativo, romantico | Lungo; dominio quasi certamente occupato |
| 7 | **ALYOSHA** | Alëša Karamazov | Caldo e umano — contrasto geniale con "AI-driven" | *Human warmth, machine speed.* | Friendly, accessibile | Suono "diminutivo", meno punch |
| 8 | **ZOSIMA** | Lo starec Zosima, *Karamazov* | Saggezza antica + suono futuristico (Z-sound) | *Old wisdom, new code.* | Ponte antico-tech | Oscuro per il grande pubblico |
| 9 | **UNDERGROUND** | *Memorie dal sottosuolo* | Indie cred pura | *From the underground, shipped worldwide.* | Forte per indie games | Dominio occupato quasi certo |
| 10 | **DOSTO** | Short form di Dostoevskij | Ultra-moderno (Notion/Linear style) | *Dosto ships.* | Breve, punchy | Troppo letterale/derivato |

### 1.3 Vincitore dichiarato: **POLIFONIA**

> *"La polifonia è la condizione di molte voci indipendenti che non si riducono a un'unica coscienza."* — M. Bachtin su Dostoevskij

Perché vince: è l'**unico** nome che è contemporaneamente:
1. Omaggio letterario vero (non superficiale) — Bachtin ha definito i romanzi di Dostoevskij "polifonici".
2. **Descrizione tecnica accurata dello studio** — 15 agenti specializzati (Aurelio, Bianca, Carla, Creativo, Dario, Elena, Fabio, Greta, Enzo, Innovatore, Irene, Leo, Marta, Nico, Trend-Hunter) che collaborano in pari dignità.
3. Parola italiana di uso corrente (non inventata) → SEO-friendly, stampa-friendly.
4. Scalabile come brand: POLIFONIA Studio, POLIFONIA Games, Edizioni POLIFONIA.

**Payoff ufficiale**: *Molte voci. Un solo studio.* · EN: *Many voices. One studio.*

**Nota operativa**: "Faro Studio" resta come ragione sociale interna e imprint tecnico in `pi-agents/AGENTS.md`. Il pubblico vede POLIFONIA; l'infrastruttura resta Faro. Seconda scelta se si vuole lato gaming più esplicito: **ARKADY** (pun ARCADE dominante in brand games).

### 1.4 Naming degli agenti pubblici (brand extension)

Gli agenti diventano **personaggi pubblici firmatari** sul Sito1:
- **Nico** firma i post di finanza/trasparenza (open metrics).
- **Marta** firma growth/marketing.
- **Trend-Hunter** firma le scoperte di mercato.
- **Creativo** firma concept e narrative.
Questo trasforma il backend multi-agente in una **redazione letteraria pubblica** = content marketing con identità che nessun competitor AI-studio ha.

---

## PARTE 2 — ARCHITETTURA 2 SITI · 1 DOMINIO

```
polifonia.studio (GitHub Pages — statico — €0)
├── /            SITO 1: BRAND / CORPORATE
│                - Manifesto letterario (POLIFONIA + Bachtin/Dostoevskij)
│                - "La redazione": 15 agenti presentati come personaggi
│                - Pipeline pubblica: ideate → discovery → build → release → grow
│                - Press kit, open metrics (trust), contatti
│
└── /play        SITO 2: CATALOGO GIOCHI/APP (vetrina store)
                 - Card per ogni titolo: playable-demo in-browser → link store
                 - Filtri (edu / casual / premium story)
                 - Badge "Made by the many voices" trust mark

api.polifonia.studio (FASE 2 — backend zero-cost, gate GO/NO-GO a 90 giorni)
├── /apps        Registry catalogo (slug, version, store URL, stato)
├── /events      Telemetria anonymized (privacy-first, no account, GDPR by design)
├── /config      Remote config / content update per app pubblicate
└── /leaderboard Classifiche opzionali (QuoteSmith, Watermelon, Regno di Moneta)
```

**Decisioni architetturali bloccanti:**
1. Sito1 e Sito2 in Fase 1 sono **entrambi statici** (GitHub Pages, come il portfolio attuale). Il catalogo parte senza backend: meta-dati in JSON generato da `generate_store_assets.py`-style script.
2. Backend = stack **free tier** candidati: Cloudflare Workers + D1 (SQL) / KV, oppure Supabase free. Costo target: €0 fino a trazione.
3. Privacy-first (identità brand già in `pi-agents/AGENTS.md`): nessun account utente, events anonymized, no third-party trackers.
4. Leo (Privacy & Legal) approva lo schema dati **prima** del deploy backend — checklist come per i rilasci store.
5. Il backend abilita il modello B2B (dashboard licenze) in Anno 2 — non bloccante per Anno 1.

---

## PARTE 3 — PIANO FINANCE (voce: Nico)

### 3.1 Struttura costi (regola: il burn rate più basso del settore)

| Voce | Anno 1 | Note |
|------|--------|------|
| Apple Developer | $99/anno | |
| Google Play | $25 una tantum | |
| Capacitor/Bubblewrap TWA | €0 | wrapper OSS |
| AdMob | €0 (rev share ~32%) | solo dopo retention provata |
| Firebase/Analytics | €0 free tier | |
| Backend (Fase 2) | €0 free tier CF/Supabase | |
| ASO tools | €0 (AppFollow free / manual) | |
| **TOTALE** | **~€125** | |

> "Costo fisso ≈ €125/anno = garanzia di sopravvivenza. Non puoi fallire se non bruci."

### 3.2 P&L 3 anni (scenari)

| Anno | Prudente | Base | Ottimista |
|------|----------|------|-----------|
| 1 | €0-2K | €5-15K (50K download, 500 subs) | €25K |
| 2 | €10K | €15-40K | €80K |
| 3 (B2B on) | €30K | €60K+ | €150K+ |

Modello B2B (white-label WikiThriving per scuole, €299-2.999/licenza) richiede backend Fase 2 → abilita il salto Anno 3 senza dipendere da ads.

### 3.3 Unit economics per categoria

| Categoria | Modello | LTV stimato | Soglia |
|-----------|---------|-------------|--------|
| EduTech (WikiThriving) | Freemium €4.99/m, €39.99/y | ~€60 | LTV/CAC > 3 |
| Casual (Watermelon Fall) | Rewarded ads + remove-ads €1.99 | eCPM €2-8 | |
| Idle (Regno di Moneta) | IAP €0.99-9.99 + ads | ARPU €0.50-2 | |
| Premium story (Stanza 9, Scarlius) | €1.99-3.99 one-time | one-time | |
| Utility (Tramonto) | €1.99 / Pro €3.99 | one-time | |

**Regole finanziarie non negoziabili:**
- **Regola dei 90 giorni**: nessun € in paid UA prima di retention D30 confermata su cohort. Solo organico.
- **LTV/CAC > 3** prima di scalare ads; kill-switch a LTV/CAC < 2.
- **Nessun checkout > €25**; annuale sempre -30%; bundle catalogo in Anno 2 (Apple App Bundle).
- **Portafoglio seriale**: 1 lighthouse (WikiThriving) → 3 support (Regno di Moneta, Watermelon, Tramonto) → coda premium (Stanza 9, Scarlius, CSI). Mai >50% revenue da singola app dopo Q2.

### 3.4 KPI dashboard (North Star)

- **EduTech**: Weekly Active Learners (WAL) — target Anno 1: 5.000 WAL.
- **Games**: DAU; **Retention**: D1 >45% free / >60% premium; D30 >12-20%.
- **Monetizzazione**: free→premium >3%; trial→paid >40%; churn sub <5%/mese.
- **Acquisizione**: store listing install rate >30%; rating >4.5★; k-factor referral >0.3.

---

## PARTE 4 — PIANO MARKETING (voce: Marta)

### 4.1 Posizionamento

**"Lo studio letterario che fa app."** In un mare di AI-studio-clone, POLIFONIA ha una storia che i media vogliono raccontare: Dostoevskij + 15 agenti AI + "molte voci". Ogni asset del marketing usa questo frame.

### 4.2 Il funnel proprietario

```
TikTok/Reels/Shorts (edu hooks "3 cose che la scuola non ti insegna")
        │
Reddit (r/androidapps, r/incremental_games, r/edutainment)
        │
Product Hunt (lancio lighthouse)
        ▼
SITO 2 /play → demo giocabile in-browser → badge store → install
        │
Cross-promo interna (Watermelon → WikiThriving; QuoteSmith → Store)
        ▼
Retention → Premium/Sub → Referral (card condivisibili QuoteSmith-style)
```

Sito1 = trust/press/brand; Sito2 = macchina di conversione. I quiz virali del portfolio (asset non pubblicabili) fungono da top-of-funnel organico a costo zero.

### 4.3 Canali e cadence (Anno 1 — solo organico)

- **TikTok/IG Reels**: persona-Sofia hooks ("3 cose prima dei 18 anni") — 3 video/settimana.
- **Reddit**: 2 post/settimana con demo giocabile link.
- **Product Hunt**: launch WikiThriving + story "15 agenti, 1 studio".
- **Stampa/PR**: press kit con angolo letterario (HackerNoon, DDAY, Wired IT).
- **Newsroom AI**: il sistema `newsroom/` esistente produce contenuti SEO — funnel organico complementare a Sito2.
- **ASO operativo**: cluster keyword "life skills / educazione finanziaria / learn life"; listing A/B test; localizzazione IT via playbook `05-localize-it`.

### 4.4 Roadmap lanci (cadence: max 1 app/mese)

| Q | Ship | Focus |
|---|------|-------|
| Q1 | WikiThriving (Play → iOS) | lighthouse, retention |
| Q2 | Regno di Moneta + Watermelon | support + cross-promo |
| Q3 | Tramonto + Esposta | premium nicchie |
| Q4 | Stanza 9 premium + sub WikiThriving | revenue |

(Numeri completi in [`APP-STORE-STRATEGY.md`](APP-STORE-STRATEGY.md) §8.)

---

## PARTE 5 — 10 COMANDAMENTI: genialità, sopravvivenza, sfondamento

1. **Ship early, una sola app.** WikiThriving sola, non cinque. Perfeziona retention su UN prodotto, poi clona il modello. La disciplina è la prima forma di genialità.
2. **Il moat è il contenuto, non il codice.** 506 lezioni + 100 giochi: gli LLM replicano la tua UI in un weekend, non due anni di contenuto curato.
3. **Velocity come vantaggio sleale.** 15 agenti = 1 concept validato a settimana vs 3 mesi dei competitor. La pipeline ideate → discovery → build → release è una catena di montaggio: fai girare `graphs/06-ideate` ogni mese anche quando hai idee.
4. **Zero burn = sopravvivenza infinita.** Regola: mai ads prima di 90 giorni di retention. Chi non brucia cassa non può morire.
5. **Genialità regolamentata.** Ogni settimana 1 "scommessa creativa" di 2 ore (quiz virale, gioco single-file) — top-funnel gratuito. Genialità ≠ caos: è allocazione 95/5.
6. **Formalizzare il feedback loop degli agenti.** Il tracker (`pi-agents/tracker/runs/`) registra quale modello fallisce su quale step. Usalo: ottimizzazione continua è il tuo processo di apprendimento industriale.
7. **Brand letterario = marketing gratuito.** "Lo studio dei 15 agenti di Dostoevskij" è una storia che i giornalisti vogliono scrivere. Compra attenzione con la narrativa, non con i soldi.
8. **Diversifica revenue prima del Q4.** Freemium + ads + premium + B2B (Anno 2). Chi dipende da un solo flusso è alla mercé di un solo algoritmo.
9. **Compliance day-1.** Apple review è il vero avversario: checklist Leo (privacy) ed Enzo (release gate) prima di OGNI submit. Rejection = -2 settimane di momentum.
10. **All-in quando sfondi.** Se una app supera 100K MAU, smetti di pubblicare nuove app e all-in su quella. La disciplina di concentrazione è la mossa più geniale.

---

## PARTE 6 — CHECKLIST 30 / 60 / 90 GIORNI

### 30 giorni — Nome & Prime Ship
- [ ] Registrare dominio (polifonia.studio o variante .com/.games — verifica disponibilità: POLIFONIA prima, ARKADY fallback)
- [ ] Sito1 brand statico su GitHub Pages (manifesto + redazione agenti)
- [ ] Asset store WikiThriving (icon 1024px, 6 screenshot, video 30s) via `generate_store_assets.py`
- [ ] Privacy policy + checklist Leo
- [ ] Submit Google Play (Bubblewrap TWA) — iOS a seguire

### 60 giorni — Catalogo & Asset Machine
- [ ] Sito2 `/play` catalogo statico (JSON generato, filtri, demo in-browser)
- [ ] Account Apple attivo / review iOS in corso
- [ ] ASO: keyword cluster + listing A/B (playbook `04-aso-audit`)
- [ ] Press kit con angolo letterario; Product Hunt pre-launch page

### 90 giorni — Backend GO/NO-GO
- [ ] Design schema: `/apps` registry, `/events` telemetria, `/config` remote, `/leaderboard` opzionale
- [ ] POC su Cloudflare Workers + D1 (o Supabase free) — Leo approva schema privacy
- [ ] Decisione GO: abilita B2B Year-2 e dashboard open-metrics su Sito1
- [ ] Refresh `pi-agents/tracker` + dashboard model failure-rate → ottimizzazione pipeline

---

## APPENDICE — Matrice di decisione rapida

| Domanda | Risposta |
|---------|----------|
| Nome pubblico? | **POLIFONIA** (imprint interno: Faro Studio) |
| Payoff? | *Molte voci. Un solo studio.* |
| Sito1? | Brand/corporate statico (GitHub Pages) |
| Sito2? | `/play` catalogo; backend `api.*` da Fase 2 |
| Prima app? | WikiThriving su Play Store entro 30gg |
| Ads? | Solo dopo D30 provato (regola 90 giorni) |
| North Star? | WAL (Weekly Active Learners) |
| Costo Anno 1? | ~€125 |

> *"Molte voci. Un solo studio."* — POLIFONIA
