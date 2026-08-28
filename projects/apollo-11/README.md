# 🚀 Apollo 11 — AGC Source & Simulator

Wrapper educativo attorno al **codice sorgente originale dell'Apollo Guidance Computer (AGC)**
dell'Apollo 11, dal repository [chrislgarry/apollo-11](https://github.com/chrislgarry/apollo-11)
(pubblico dominio).

Questa cartella contiene una pagina web autonoma (`index.html`, zero dipendenze) che presenta
il progetto, lo **simula** e ne racconta i **casi d'uso**.

---

## Funzionalità

### 🖥️ Simulatore DSKY (Display and Keyboard)
L'interfaccia che gli astronauti usavano per parlare col computer:

- **Registri PROG / VERB / NOUN** a 7-segmenti verdi, come sul pannello reale.
- **Tastiera completa**: cifre 0–9, `VERB`, `NOUN`, `ENTR`, `CLEAR`, `PRO` (proceed).
- **Verbi reali**:
  - `VERB 37 NOUN xx` → carica il programma `xx` (es. NOUN 02 → lancio)
  - `VERB 06` → allineamento IMU · `VERB 21` → display · `VERB 05/25` → blank · `VERB 99` → reset
- **9 programmi di esempio** con telemetria animata (altitudine, velocità, ΔV, conto alla rovescia TIG):
  P01 Prelaunch · P02 Launch · P06 Allineamento · P20 SPS Burn · P21 APS Burn · P47 Refresh ·
  P63 Landing Braking · P64 Final Approach.
- **Frasi celebri autentiche** nel log: `MASTER IGNITION ROUTINE`, `BURN, BABY, BURN`,
  `PROGRAM ALARM 1202`, `EAGLE HAS LANDED`.
- **Lampade di allarme**: OPR ERR, NO ATT, GIMBAL LOCK, STBY, PROG, TEMP, PRIO DISP.
- **▶ Missione automatica**: una sequenza cinematografica che esegue l'intero profilo
  P01 → P02 → P06 → P20 → P63 → P64 senza toccare nulla.

### 📟 Browser dei sorgenti
Estratti **autentici** (pubblico dominio) dai file più celebri del repository:

| File | Modulo | Contenuto |
|---|---|---|
| `Luminary099/BURN_BABY_BURN--MASTER_IGNITION_ROUTINE.agc` | Lunare | Il commento più famoso dell'era spaziale |
| `Luminary099/THE_LUNAR_LANDING.agc` | Lunare | P63, la braking phase della discesa |
| `Luminary099/KALMAN_FILTER.agc` | Lunare | Il filtro di Kalman per il damping |
| `Comanche055/PINBALL_GAME_BUTTONS_AND_LIGHTS.agc` | Comando | Il "pinball game": tastiera e display |

### 🎯 Casi d'uso
Sezione dedicata che spiega a cosa serviva davvero il software:
guidance in tempo reale, interfaccia DSKY, discesa lunare, lancio/boost, allarmi e abort,
e il suo valore come artefatto storico/didattico.

### ℹ️ Cos'è
Scheda con le caratteristiche hardware del vero AGC (parole a 15 bit, memoria a corde,
2K/36K parole) e i riferimenti ufficiali.

---

## Come si usa

Apri `index.html` (o la voce "Apollo 11" dal portfolio).

**Prova rapida del simulatore:**

1. Premi `VERB`
2. Digita `3` `7`
3. Premi `ENTR`
4. Premi `NOUN`, digita `0` `2`, `ENTR`
5. Premi `PRO` → il programma P02 (Launch) parte e il log mostra `MASTER IGNITION ROUTINE`

Oppure tocca direttamente un preset (es. **P20 SPS Burn** per vedere `BURN, BABY, BURN`).

---

## Struttura

```
apollo-11/
├── index.html   # wrapper + simulatore DSKY + browser sorgenti + casi d'uso (zero dipendenze)
└── README.md    # questo file
```

## Note e limiti

- **Simulazione didattica, non una replica esatta**: riproduce interfaccia, flusso verbo/nome
  e frasi celebri a scopo dimostrativo. Per un emulatore AGC *fedele* vedi
  [Virtual AGC](https://www.ibiblio.org/apollo/).
- Il codice sorgente mostrato è **pubblico dominio** (trascrizione del MIT Museum via
  [chrislgarry/apollo-11](https://github.com/chrislgarry/apollo-11)).
- Zero librerie esterne: solo HTML/CSS/JS vanilla, ottimizzato per iPhone e desktop.
