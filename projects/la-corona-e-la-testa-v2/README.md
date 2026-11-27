# LA CORONA E LA TESTA · 3D

La leggenda di San Donnino, patrono di Fidenza, in un film animato in 3D di
circa 21 minuti, girato dal vivo nel browser con Three.js.

**Guarda:** <https://lucagandolfi77.github.io/portfolio/projects/la-corona-e-la-testa-v2/>

Milano, anno 303. Donnino custodisce la corona dell'imperatore Massimiano e ne
veglia le notti insonni. Riceve il battesimo in una prigione, restituisce la
corona davanti alla corte e fugge lungo la via Emilia. L'imperatore ordina a
Valerio, il centurione che lo ha lasciato scappare, di riportarlo indietro.
Allo Stirone il viaggio finisce; all'alba comincia il miracolo che darà il nome
a Borgo San Donnino, l'odierna Fidenza. Una bambina e sua madre, davanti al
Duomo di oggi, aprono e chiudono la storia.

- Prologo, otto atti con titoli latini, epilogo: 39 inquadrature e 135 battute
  in italiano e inglese, scritte come confessioni: dubbi, colpa, libertà. Le parole latine compaiono come iscrizioni.
- Scene in 3D con luce, ombre morbide, nebbia, bagliori, pioggia, neve e polvere
  nella luce: l'aula imperiale di porfido e mosaici d'oro, la prigione, la
  locanda, la pianura con i pioppi, il ponte romano sullo Stirone, il cantiere
  medievale e la facciata del Duomo.
- Attori articolati che camminano, cavalcano, si inginocchiano, parlano,
  sbattono le palpebre e guardano chi parla; la regia stacca da sola tra campo,
  controcampo, primo piano e inquadrature sulla spalla.
- Musica originale nei modi antichi, voce narrante facoltativa.
- Verticale e orizzontale, dal telefono al desktop; qualità adattiva,
  installabile e offline. Serve WebGL.

L'esecuzione non è mai mostrata: la camera guarda il fiume. Il santo che porta
la propria testa è una figura luminosa e serena, senza nulla di cruento.

## Sviluppo

```bash
npm install
npm run dev
npm test           # sceneggiatura, tempi e coerenza delle inquadrature
npm run build
```

| File | Contenuto |
|---|---|
| `src/film/script.ts` | La sceneggiatura: capitoli, inquadrature, battute. I tempi si calcolano da qui. |
| `src/film/shots/` | Un'inquadratura per scena: set, camera, attori e i loro movimenti, suoni. |
| `src/film/three/sets.ts` | I set 3D, con cielo, nebbia e luci. Le coordinate sono documentate qui. |
| `src/film/three/kit.ts` | Colonne, archi, bracieri, case, pioppi, ponte romano, Duomo di Fidenza. |
| `src/film/three/figure.ts` | Gli attori: corpo, volto, pose, costumi, oggetti. |
| `src/film/three/fx.ts` | Pioggia, neve, nebbia, braci, lucciole, polvere nella luce. |
| `src/film/three/assets.ts` | Carica il kit scolpito in Blender; senza kit ogni pezzo torna alle forme semplici. |
| `blender/build_kit.py` | Il kit in Blender: teste, mani, calzari, vesti e mantelli con le pieghe, colonne, trono, anfore, bracieri. |
| `src/film/stage.ts` | La regia: attori, inquadrature automatiche, render con bloom, transizioni, sottotitoli. |

### Il kit di Blender

Teste, mani, calzari, busti, vesti e mantelli degli attori, le colonne con
base attica, fusto scanalato e capitello a ovoli, il trono intagliato, le anfore
e i bracieri sono generati da uno script Python in Blender, con l'occlusione
ambientale calcolata in Cycles e salvata nei colori dei vertici. Il risultato è
compresso con meshopt in `public/models/kit.glb` (circa 320 kB).

```bash
BLENDER=/percorso/di/Blender npm run kit   # rigenera public/models/kit.glb
```

La versione 2D, disegnata a mano in Canvas, è in `projects/la-corona-e-la-testa`.

## Crediti

Dalla leggenda tradizionale di San Donnino (martire nel 304). Testo, scene e
musica originali. Three.js (MIT). Caratteri: Cormorant Garamond e Inter (SIL OFL).
