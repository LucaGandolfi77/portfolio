# Seba 🍹 — il barista da taschino

Un animaletto virtuale per adulti: Seba fa i turni al bancone, gira il mondo tra rave e after, beve, fuma, combina figuracce e il giorno dopo paga il conto. Satira affettuosa, gioco originale, nessun acquisto né pubblicità. Alcolici, sigarette e locali sono inventati.

PWA offline in JavaScript vanilla (ES module), senza build.

## Cosa c'è

- **Sei bisogni** che calano in tempo reale (sete, fumo, fame, sonno, festa, igiene), recupero offline fino a 12 ore e schermata «mentre eri via».
- **Stati nascosti**: tasso, sbornia, fegato, polmoni. Gli eccessi hanno conseguenze comiche; non si muore mai e l'acqua è sempre gratis.
- **Seba** in SVG a strati: 16 espressioni, voce di borbottii sintetizzati, circa 300 battute IT/EN.
- **Casa** (bancone, cucina, bagno, divano, balcone): cibi e drink si toccano o si trascinano sulla bocca.
- **Sei minigiochi**: turno di cocktail, consolle a ritmo, pista, accendino nel vento, strada di casa all'alba, figuracce.
- **14 città** con rave e after, mappa a cartolina e sfondi dedicati. Il ritorno a casa è gratis.
- **Guardaroba** (oltre 60 pezzi), **cartoline** condivisibili, **40 medaglie**, registro delle storie.
- **Accessibilità**: meno movimento, testo grande, numeri sugli indicatori, minigiochi con un dito o da tastiera.

## Differenze rispetto al piano (`docs/PLAN-SEBA.md`)

- Il letargo dura 10 minuti (non mezza giornata) e si può interrompere con la secchiata d'acqua: mezza giornata avrebbe bloccato il gioco.
- I rave si fanno a qualsiasi ora; tra le 23 e le 5 vere le mance aumentano del 30%.
- Sfondi tutti in SVG (niente Blender): più leggeri e coerenti con il personaggio.
- La cicca alla menta si usa dal balcone, senza la variante «cerca nelle tasche» dell'accendino.
- Nessuna «modalità daltonici» separata: c'è l'opzione con i numeri sugli indicatori.

## Struttura

```
js/state.js, rules.js     logica pura (testata in Node)
js/seba/                  rig SVG e battute
js/places/                città e scenari SVG
js/games/                 cornice comune e i sei minigiochi
js/ui/                    stanze, mondo, diario, guardaroba, pannello
js/audio.js               voce, effetti e musica generativa
```

## Test

```bash
node games/seba/test/logic-test.mjs
```

```bash
cd tools/quality && npx playwright test e2e/seba.spec.mjs
```

Le icone si rigenerano dal rig:

```bash
node tools/quality/generate-seba-icons.mjs
```
