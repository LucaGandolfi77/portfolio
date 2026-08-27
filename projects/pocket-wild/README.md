# 🐾 POCKET WILD — Catch. Build. Mutate.

A **2D top-down creature-capture survival game** in the spirit of Palworld — but super-minimalist, 100% vanilla HTML/CSS/JS, zero assets (every creature is drawn with code as a flat geometric shape). Plays in the browser, works on iPhone and desktop, autosaves to localStorage.

---

## ✅ Playable now (v1 + Phases 2a–3b + PWA & finale + seasons + test engine + Beyond)

- **Procedural world** — seeded value-noise biomes: grass, forest, desert, snow, ocean, with deterministic trees, rocks, berry bushes and grass bushes to gather (grass/wood/berry/stone).
- **🌦 Weather** — rain, desert sandstorms and aurora nights (snow, at night) with full-screen effects and combat modifiers.
- **Capture** — aim with your movement direction and throw **spheres** (3 tiers, craftable): catch chance depends on HP, rarity and sphere tier. Wild Pals wander, chase and attack you; low-HP Pals are easier to catch.
- **Your team** — caught Pals follow you; the **active** one auto-fights nearby wild Pals, gains XP, levels up (HP/ATK/SPD) and **learns skills**. **26 species** (incl. 4 seasonal), 5 types + **dual-type** Pals (defenses use the stronger type).
- **🍖 Hunger** — hunger drains over time; starving drains HP; eat berries, cooked berries or stew.
- **⚔️ Weapons** — craft a **Sword** (melee) or **Bow** (+ arrows) and fight wild Pals actively (F / K, or buttons on mobile).
- **⛏ Pal work** — set any non-active Pal to **Gather**: it auto-collects nearby resources into your inventory.
- **🐎 Riding** — mount your active Pal and cross the map at its speed.
- **🌱 Farming** — plant berry seeds on grass, watch them grow, harvest berries.
- **📜 Skill scrolls** — teach any Pal extra skills beyond level-up.
- **🔊 Sound** — creature chirps, capture fanfares, weather ambience (mutable).
- **🥚 Breeding** — pair same-species Pals at a Ranch → eggs → inheriting offspring.
- **🪙 Trader** — sell resources, buy spheres/items with coins.
- **🏛 Ruins** — 3-floor dungeons: floor 3 has spike traps, a hidden secret room, a Ruin Key and a final Vault with premium loot.
- **⚔️ Arena + wandering trainers** — build an Arena for a quick duel, or battle roaming named trainers with 1–2 Pal teams and rematches.
- **📖 Paldex** — photo gallery of all 26 species with live-drawn portraits, silhouettes for unseen Pals, and full dossiers.
- **📋 Quest chain** — 4 sequential chapters (First Steps → Rise → Frontiers → The Reckoning): quests unlock chapter by chapter, with the final chapter opening a **Void Rift**.
- **🌑 Final boss** — the **Void Sovereign**: a colossal rift boss that summons minions below 70% HP and pulses a damaging aura. Defeat it for the **🏆 GAME COMPLETE** screen with your run stats.
- **📲 PWA** — installable on Android/desktop (manifest + service worker + generated icons), fully playable **offline** after first visit; iOS via "Add to Home Screen".
- **🌸 Seasons** — a 28-day seasonal cycle (Spring → Summer → Autumn → Winter): 4 **season-exclusive Pals** (Bloompuff, Suncub, Maplewisp, Snowfawn — 26 species total), season-tinted maps with spring flowers / autumn leaves, seasonal weather (heatwaves, winter auroras, spring rains), gathering bonuses (spring berries ×2, autumn harvest ×2) and in-season spawn boosts.
- **🎨 Custom Pal Lab** — synthesize your own Pal (shape, color, type, HP/ATK/SPD sliders, trait, up to 3 skills) for 20 essence, add it to your team, and **share the design as a URL** — anyone opening the link meets your Pal as a wild "CUSTOM" visitor they can catch.
- **🏆 Achievements** — 16 profile-level achievements (first catch, collector, evolutionist, trainer slayer, hero…) unlocked live, persisted separately from the save.
- **🏮 Night lighting** — a real **light-mask** at night: player, active Pal, campfires, beds, workbenches, chests and the new craftable **Lantern** push back the darkness; bosses and the rift glow.
- **🧪 Parallel Test Engine** — a sandbox that **pauses your world, snapshots it, lets a bot play the game at ×1–×20 speed** (built on the exact same update code), shows a live report (catches, deaths, quests, goal), then **restores your state** (or keeps it). Includes experiment buttons (give items, teleport, spawn Alpha/trainer/rift, force seasons, complete quests).
- **🎬 Story intro + cutscenes** — a cinematic opening (eight fading slides) plus **11 in-game cutscenes** with narrator voice-over (🎙) and character dialogues (💬) at key moments: first catch, evolution, day 7 (the flashback), Alphas, the eclipse, the Tower champion, fishing, flight, your first death, the **confession** at the Rift, and the **redemption** after the final boss — a cruel-but-sweet story of death and forgiveness inspired by **Proust, Dostoevskij and Valérie Perrin** (full lore + character biographies in the section below).
- **🎬 Story intro** — a cinematic opening: eight fading slides tell the story of **Lina**, the girl who drew the Pals before she could see them — the tear-jerker behind every catch, every quest, and the Void Sovereign itself. *"The world remembers her. Let it remember you too."*
- **🗺 Expanded world** — the map is now **2,200×2,200 tiles**, with two new biomes: **Volcano** (lava cracks, ash storms, fire Pals) and **Crystal Plains** (refracting auroras, shard crystals) → **7 biomes, 30 species**, **5 ruins** and **5 Alpha bosses** (one per major biome).
- **📋 Chapter 5 — The Wilds Beyond**: post-final-boss quests — catch a volcano & crystal Pal, travel 3,000 tiles, witness a crystal aurora, and listen to Elder Mira 3 times.
- **🌙 Elder Mira** — a wandering storyteller who shares fragments of Lina's story (each talk +2 essence, on a cooldown).
- **🔨 Blacksmith Bram** — a wandering smith selling permanent upgrades for coins: **Sharpen Sword** (+8 dmg), **Bowstring** (+5 arrow dmg), **Iron Plating** (+25 max HP).
- **🗼 Tower of Trials** — build the tower and climb **10 floors** of escalating waves (per-floor essence + partial heal); floor 10 pits you against the **CHAMPION** for +50 essence, +40 coins, 3 Ultra Spheres and a scroll.
- **🌒 Eclipse Night** — every 9th night the Void bleeds in: **echo Pals** (translucent, +7 essence when dissolved), 1.5× team damage, void/fire spawn floods, and a pulsing red-eclipse sky.
- **🤖 Playstyle imprinting** — your actions leave "habits": every ~40 actions your Pals **imprint your dominant style** permanently (Brawler +15% ATK, Forager +12% SPD, Wanderer +15% XP, Collector +15% HP, Undying +20% HP). The game literally learns from you.
- **🐟 Fishing** — craft a 🎣 Rod (+ Lures), cast from any shore, wait for the bite, press E to reel in — catch 3 exclusive **sea Pals** (Finling, Jellyvolt, Abyssoul) → 33 species.
- **🐉 Flying mounts** — ride a `fly` Pal (Ashmoth/Prismoth): soar over water and obstacles at +25% speed, open minimap, wilds can't touch you from the air.
- **☄️ Meteor showers** — rare Pals fall every 3rd night.
- **Evolution** — Pals evolve at set levels into stronger forms with new stats and skills.
- **🧬 Gene Lab** — splice DNA from a donor Pal into a target: HP / ATK / SPD / **Color** / random **Trait** — costs essence.
- **🔀 Fusion** — merge two Pals of the same species into a stronger hybrid.
- **Survival** — HP, wild Pals attack, potions auto-drink, campfires heal at night, beds are your respawn point.
- **🏗 Base building** — Campfire, Bed, Workbench, Chest (extra storage) placed on the map.
- **🎒 Crafting** — spheres (3 tiers), potions, food, weapons, arrows.
- **🌙 Day/night** — a ~90 s cycle; nocturnal Pals appear at night.
- **🏆 3 Alpha bosses** (one per major biome) with big essence rewards.
- **📋 Quests** — catch / defeat / craft / gather / build / boss objectives with rewards.
- **🗺 Minimap** — biomes, your position, buildings.
- **💾 Save** — autosave every 10 s + manual; continue from the start screen.

### Controls
- **Desktop**: WASD / arrows to move · **E** interact (melee kick, open chest, rest) · **SPACE** throw sphere · **I** craft · **B** build · **Esc** close
- **Mobile**: virtual joystick (left half) · **🔮 Throw** / **🤝 Interact** buttons · tap ground to place buildings

### Balancing notes
- Catch rate ≈ `rarityBase × (1 − 0.72·HP%) × tierMult`, clamped 0.05–0.95.
- Skills deal type-multiplied damage; bosses have 6× HP.
- Gathering near trees/rocks/bushes is instant with a short cooldown (forgiving on purpose).

---

## 📖 La Storia — "La Ragazza che Disegnava il Mondo"

> **Morte e redenzione.** Ispirata a Marcel Proust (la *memoria involontaria*: un odore, una canzone, un gesto riaprono il passato), a Fëdor Dostoevskij (*"la sofferenza è l'origine della coscienza"* — la colpa si redime solo attraversandola) e a Valérie Perrin (*"i morti non se ne vanno; cambiano l'acqua ai fiori"* — ogni piccola cura è una preghiera laica).

Tu non sei qui per catturare creature. Tu sei qui per **non ricordare** — e il mondo non te lo permette. Quando eri bambino, in una cucina che odorava di lana bagnata e zucchero bruciato, litigasti con tua sorella **Lina** e gridasti: *"Ti odio! Vorrei che il mondo si fermasse!"* Il mondo ti ascoltò. Quella notte il cielo si squarciò, nacque il **Void Sovereign** — non un mostro, ma la tua rabbia di sette anni cresciuta sola nel buio — e l'inverno che prese Lina fu l'inverno che **tu** avevi desiderato.

Ogni meccanica del gioco è un pezzo di redenzione: **catturare un Pal** è restituire una memoria che Lina non ha potuto vivere; **evolvere** è imparare che il dolore può muoversi; **morire e svegliarsi al letto** è venire disegnato di nuovo da qualcuno che non ha smesso di credere; **sconfiggere il Sovereign** è perdonare te stesso. Il gioco è un lungo corridoio di cose che hai detto — e ogni porta è una parola che non hai mai ritirato.

### 🎬 Cutscene (voce fuori campo)

Il **Narratore 🎙** accompagna i momenti chiave con descrizioni; i personaggi rispondono con dialoghi 💬. Ogni cutscene si vede **una sola volta per run** (flag `memories` persistito) e mette in pausa il mondo — *il tempo passa solo nei ricordi*.

| Trigger | Cutscene |
|---|---|
| Prima cattura | **"Pebble"** — Lina battezza il Pal e ti ricorda che i morti restano |
| Prima evoluzione | **"Niente resta piccolo per sempre"** — il lutto che impara a muoversi |
| Giorno 7 | **Il flashback** — la cucina, la lite, il desiderio, la colpa (Proust + Dostoevskij) |
| Primo Alpha | **"Ogni rancore sepolto diventa una creatura"** — Mira e le corone di dolore |
| Notte dell'Eclissi | **"I ricordi con gli abiti migliori"** — il Void non ti odia |
| Campione della Torre | **La coroncina di carta** — la promessa di tornare |
| Prima pesca | **"Il mare è il cielo che si è stancato di cadere"** |
| Primo volo | **"Torna per te, non per me"** |
| Prima morte | **"Disegna tutti quelli che ama mentre si svegliano"** — la redenzione è non smettere di cadere e venire disegnato |
| Alla Rift (confessione) | **La confessione** — "Mi dispiace". "Allora posalo e attraversa." (Dostoevskij) |
| Sconfitta del Sovereign | **La redenzione** — il mostro era la tua rabbia cresciuta sola; l'inverno è finito, il giardino è tuo (Perrin) |

---

## 👥 Personaggi — Biografie & Personalità

### 🧒 Lina — *La sorella* (la presenza assente)
- **Biografia**: 12 anni, morta la notte del suo compleanno, nell'inverno che tu hai evocato. Disegnava creature nei margini dei quaderni di scuola: orbi, stelle, triangoli con gli occhi rotondi. Il suo quaderno — 33 specie, nomi, cuoricini accanto ai preferiti — è l'unica mappa del gioco.
- **Personalità**: paziente fino all'inesauribile, gentile fino alla ferocia, con un'ironia dolce che non scompare nemmeno da morta. Perdona prima che tu chieda scusa. È la *madeleine* di Proust: appare quando un ricordo involontario si risveglia.
- **Voce (nelle cutscene)**: 💬 LINA — rosa, tenera, assolutamente sicura di te.

### 🎙 Il Narratore — *La memoria del mondo*
- **Biografia**: la voce fuori campo che descrive ciò che accade quando il gioco smette di essere un gioco. Non è onnisciente: è il *tuo* stesso pensiero, quello che hai evitato per anni, vestito da voce.
- **Personalità**: implacabile ma mai crudele; cita Dostoevskij senza citarlo, ricorda Proust con gli odori, e a volte — solo a volte — è gentile.
- **Voce**: 🎙 NARRATOR — ocra, lenta, definitiva.

### 🌙 Elder Mira — *La nonna di Lina / la guardiana*
- **Biografia**: l'unica adulta che ha creduto alle creature di Lina. Dopo la morte della nipote ha piantato un giardino sulla sua tomba e ne cura i fiori da dieci inverni. Vaga per il mondo per dire a chi arriva: *"i morti non se ne vanno; cambiano l'acqua ai fiori"* (Perrin). È lei che ti dà +2 essenza per ogni dialogo — pagamento in memoria.
- **Personalità**: burbera e dolce, parla per parabole, non ha mai alzato la voce in vita sua. Sa esattamente chi sei e non te lo dice.
- **Voce**: 💬 MIRA — viola, saggia, con l'accento di chi ha smesso di avere fretta.

### 🔨 Bram — *Il fabbro pentito*
- **Biografia**: ex soldato della guerra che seguì la prima Rift. Perso il suo plotone nell'inverno, non è più tornato a casa: ha trasformato il senso di colpa in ferro — spade affilate, archi tesi, piastrine che non salvano nessuno. Ogni potenziamento che ti vende è una promessa che lui non ha potuto mantenere.
- **Personalità**: taciturno, onesto, con l'umorismo secco di chi ha visto troppo. La sua prima vendita è accompagnata da una confessione: *"ogni lama che affilo è una promessa che non ho mantenuto. Mantieni la tua."*
- **Voce**: 💬 BRAM — grigio-ferro, bassa, senza orpelli.

### 🗡 Ace Avery — *L'amico d'infanzia di Lina*
- **Biografia**: il bambino che Lina batteva a ogni gioco. Diventato allenatore errante per cercarla — *"la conosco: se è da qualche parte, è con le sue creature"*. È il primo nome nella lista dei trainer (TRAINER_NAMES[0]). Quando lo sconfiggi, per la prima volta perde volentieri.
- **Personalità**: competitivo, leale, con una malinconia che nasconde dietro i "battiti". Non parla mai di lei per primo — ma se vinci, lo fa.
- **Voce**: 💬 AVERY — oro, energica, fragile sotto la vernice.

### 🌑 Il Void Sovereign — *La tua rabbia cresciuta sola*
- **Biografia**: non è nato da un dio né da un male cosmico. È la tua frase di sette anni — *"vorrei che il mondo si fermasse"* — che ha preso forma, è cresciuta nel buio e ha imparato ad avere artigli. Ha ucciso per amore di un'ombra. E ti ha aspettato per anni.
- **Personalità**: non è malvagio. È **lutto con gli artigli** (lo dice Mira). Quando muore, non si dissolve in polvere ma in luce — e tu capisci cosa hai tenuto stretto per tutto questo tempo.
- **Voce**: 💬 SOVEREIGN — rosso, enorme, e alla fine quasi tenero.

### 🌊 Vesper — *Il mercante di ricordi* (il Trader 🪙)
- **Biografia**: compra risorse, vende sfere e oggetti — ma il suo vero commercio è la memoria. Le monete che ti dà per l'erba e il legno sono "quanto vale ricordare una cosa piccola". Non lo dice mai. I suoi prezzi sono giusti per questo.
- **Personalità**: professionale, con un sorriso stanco; l'unico che non ti chiede mai perché sei qui.

### 🧬 Tu — *Il giocatore / il colpevole*
- **Biografia**: non hai un nome — o meglio, l'hai lasciato nella cucina che odorava di lana bagnata. Hai passato gli anni a non ricordare; sei venuto nel Mondo Selvaggio per chiudere la Rift, e ti sei ritrovato a raccogliere i sogni di tua sorella uno a uno.
- **Personalità**: determinato, impaziente, più gentile di quanto credi. Le tue *abitudini* (il sistema di imprinting 🤖) sono il tuo vero carattere: il gioco impara da come giochi e lo incide sui tuoi Pal. Se combatti molto, sei un Brawler. Se viaggi, sei un Wanderer. Se muori spesso… sei Undying. E va bene così.
- **Voce**: 💬 YOU — ciano, rotta, e alla fine libera.

---

## 🎙 Approfondimento narrativo — voci, diario, e la voce del nemico

### 🗣 Voci per bioma
Il Narratore sussurra **una sola volta per bioma** (per run): voci brevi e poetiche legate alla storia. Esempi: *"Grass, she wrote, is the colour of a promise kept."* · *"Snow. Be careful here. This is where the winter lives."* · *"Crystals. She said they hum her song when the moon is out. Listen."*

### 📓 Il Diario di Lina (33 pagine)
Il quaderno è ora **collezionabile**: bottone 📓 nell'HUD → un libro con **una pagina per ognuna delle 33 specie**. Ogni pagina si sblocca **vedendo** la creatura (schizzo + nome), si completa **catturandola** (nota manoscritta di Lina, con ♥ sui suoi 6 preferiti). Le note sono il cuore della storia — esempi:
- *"SPARKLET. ♥♥♥ My absolute favourite. Static on four legs. I once made him spark on purpose to light the hallway."*
- *"Grief does that — it laughs when it can."* (Voltmouse)
- *"Some things you only keep by letting go."* (Glimmerfly)
- *"That's what sisters do, they draw what they don't understand."* (Torrentail)
Completare il diario sblocca l'achievement **"Keeper of Dreams"** e la quest cap.5 **"Complete Lina's diary"**.

### 🌑 La voce del Sovereign in battaglia
Durante il boss fight il Sovereign **parla**: allo spawn (*"So. You came back. I kept the light on for you."*) e alle soglie di HP **75% / 50% / 30%** — la sua voce è la tua colpa che risponde:
- 75%: *"I remember that kitchen. I remember every word you said that night."*
- 50%: *"You wished the world to stop, so it did — for her. Was it worth it?"*
- 30%: *"Look at me. I am the part of you you buried. You cannot bury me — you can only forgive me."*

---
## ⚙️ Difficoltà & Lingua (schermata iniziale)

Prima di iniziare puoi scegliere:

### Difficoltà (salvata nel save)
| Livello | Danno subito | HP nemici | Danno inflitto | Catture | Spawn | Fame |
|---|---|---|---|---|---|---|
| 🌱 **Easy** | ×0.7 | ×0.8 | ×1.2 | ×1.2 | ×0.8 | ×0.7 |
| ⚖️ **Normal** | ×1 | ×1 | ×1 | ×1 | ×1 | ×1 |
| 🔥 **Hard** | ×1.4 | ×1.25 | ×0.85 | ×0.85 | ×1.15 | ×1.2 |
| 💀 **Nightmare** | ×1.8 | ×1.5 | ×0.7 | ×0.7 | ×1.3 | ×1.4 |

Tutti i moltiplicatori passano da `diffMult(k)` e si applicano a wild, duelli, boss, catture, fame, spawn e armi del giocatore.

### Lingua (salvata nel browser, si applica subito)
- **🇬🇧 English** (default) · **🇮🇹 Italiano** — via dizionario `L[lang]` + `t(key)` con fallback all'inglese.
- Copertura: HUD, pannelli, schermata iniziale, titoli dei 5 capitoli, **tutte le 21 descrizioni missione**, difficoltà, schermate respawn/game-complete. La voce narrativa (cutscene, diario, whisper) resta in inglese — è la voce di Lina, e parla la sua lingua.

---
## 🎮 Modalità di gioco (schermata iniziale)

Terzo selettore, accanto a Lingua e Difficoltà:

### 🌍 Story (default)
L'esperienza completa: fame, morte, capitoli, boss finale.

### 🧘 Zen / Sandbox
Per esplorare la storia e collezionare senza pressione:
- **niente fame** (l'indicatore non scende mai)
- **niente morte** (la vita non può scendere sotto 1 — niente schermata faint)
- **risorse abbondanti** all'avvio (999 di tutto, 99 sfere, canna e attrezzi inclusi)
- **raccolta ×10** (raccogli e costruisci senza limiti)

### ⏱️ Speedrun
Il cronometro parte al primo mondo e si ferma alla sconfitta del **Void Sovereign**:
- timer **⏱️** sempre visibile nell'HUD
- al completamento, il tempo entra nel pannello GAME COMPLETE e il **record personale** (il miglior tempo) viene salvato nel browser e mostrato nella schermata iniziale
- difficile? Allora è perfetto per i velocisti.

---
## 🗺 Roadmap

The game is playable end-to-end; these are the planned layers, in priority order. **Checkmarks = shipped.**

### ✅ Phase 2a — Depth (shipped)
- [x] **Hunger + food**: hunger drains, starving drains HP, auto-eat berries / cooked berries / stew
- [x] **22 species** (up from 14) with **dual types** (sporeling grass+void, frosthoof ice+water, voltmouse void+fire…) and signature skills
- [x] **Weather**: rain (water +25% / fire −20%), sandstorms in the desert, aurora nights over the snow, with full-screen effects
- [x] **Weapons**: craftable **Sword** (melee 18 dmg, F) and **Bow** (+ arrows, K) — the player can fight actively
- [x] **Pal work assignments**: set any non-active Pal to **Gather** — it auto-collects nearby resources for you
- [x] Weather-aware combat: `dmgCalc` honors type2 defenses + weather modifiers

### ✅ Phase 2b — Depth (shipped)
- [x] **Riding Pals**: mount your active Pal (🐎 button / R) — it carries you at its speed
- [x] **Sound**: WebAudio chirps for nearby Pals, capture fanfare, fail blip, level-up & evolution jingles, quest chimes, ambient rain/sandstorm/aurora drones (🔊 mute toggle)
- [x] **Farming**: craft Berry Seeds, plant on grass (🌱), watch seed → sprout → ready, harvest +2 berries
- [x] **Skill Scrolls**: craft scrolls (essence + wood) and teach any Pal a new skill in the Team panel — skills are used in combat

### ✅ Phase 3a — Systems (shipped)
- [x] **Breeding**: build a **Ranch**, pair two Pals of the same species → egg grows 30s → hatch a weaker-but-inheriting offspring (level ≈ parents−1, 50% chance to inherit a parent's trait or spliced color)
- [x] **Coins + Wandering Trader**: sell resources for coins, buy spheres/potions/seeds/scrolls/weapons — a golden trader roams near you
- [x] **Ruins / dungeons**: 3 procedural ruins (one per major biome, seeded) → enter, fight **3 floors** of rare Pals → floor-3 clear rewards essence, coins, a sphere and sometimes a scroll
- [x] **Arena PvP**: build an **Arena**, duel an AI trainer's Pal with your active one — win essence + coins
- [x] **Meteor shower event**: every 3rd night, rare void/fire Pals rain from the sky for 25 s

### ✅ Phase 3b — Systems (shipped)
- [x] **Photo mode / Paldex gallery**: 📖 button opens a gallery of all 26 species with **geometric portraits** drawn in real time — seen species show their true colors, unseen ones stay dark silhouettes with "???"; tap a portrait for the full dossier (types, stats, biome, night-only, evolution chain, skills, caught count). **Seen** is tracked per species: spawns, dungeon waves, duels and catches all count.
- [x] **Dungeon depth**: the final ruin floor (3) is now a gauntlet — **spike traps** (deterministic positions per ruin, deal 10 HP and re-arm on a 3 s cooldown), a **Ruin Key** granted on floor 2, a hidden **secret shimmer** room with bonus loot, and a **Vault** that unlocks on floor-3 clear — walk into it with the key for +12 essence, +35 coins, a skill scroll and an Ultra Sphere. Without the key you still get base loot. Fixed a latent `circleHitsSolid` bug (tile coords vs pixels) that also hardens player/riding collision.
- [x] **Wandering AI trainers**: named trainers (Ace Avery, Ranger Rio, Dr. Nova…) roam near you every ~55 s with a **team of 1–2 Pals** scaled to your level. Battle them (🤝) — beat every Pal in their team for essence + coins + XP, then they offer a **rematch** after a 15 s breather.
- [x] **Performance**: minimap now redraws at 4 fps instead of every frame, and wild-Pals AI is **staggered** — half the wilds update each frame (duel enemies always run) — roughly halving per-frame AI cost; the procedural value-noise world is already O(1) per tile, so there is no chunk state to stream.

### ✅ Phase 6 — Crazy Features (shipped, user-picked)
- [x] **🗼 Tower of Trials**: 10-floor gauntlet structure, per-floor essence + heal, CHAMPION finale, tower quest + achievement
- [x] **🌒 Eclipse Night**: day-9 event, echo Pals (+7 ess), ×1.5 team damage, void/fire floods, eclipse overlay + achievement
- [x] **🤖 Playstyle imprinting**: 5 habit traits learned from your dominant playstyle, one per Pal, engine-driven
- [x] **🐟 Fishing**: rod/lures, shore casting, bite mini-game, 3 sea species (33 total), angler achievement + quest
- [x] **🐉 Flying mounts**: `fly` flag on Ashmoth/Prismoth, no-collision flight over water, open minimap, airborne immunity
- [x] **Tests**: all 5 features validated by the parallel engine (in-game 🧪 + 218-test Node suite in `tests/`)

### ✅ Phase 4 — Scale (mostly shipped)
- [x] **Quest chains / storyline**: 4 sequential chapters with locked-unlock progression; completing Chapter 3 opens the Void Rift to the final boss
- [x] **Final boss**: the **Void Sovereign** — minion summoning + pulsing aura, GAME COMPLETE screen with run stats, rewards and a "continue exploring" mode (fixed a pre-existing bug where Alpha bosses were never spawned into the world)
- [x] **Mobile PWA install** + offline manifest: `manifest.webmanifest`, generated 192/512 icons, `sw.js` service worker (cache-first, network-first for navigations), install button via `beforeinstallprompt`
- [x] **Seasonal events**: 28-day season cycle — **4 season-exclusive Pals** (Bloompuff / Suncub / Maplewisp / Snowfawn), season-tinted maps with spring flowers & autumn leaves, seasonal weather (summer heatwaves without rain, winter auroras everywhere, spring rains), gathering bonuses (spring berries ×2, autumn wood/berry/grass ×1.5–2), in-season spawn weighting ×5
- [x] **Custom Pal editor**: 🎨 panel (from the Gene Lab) to design a Pal — shape, color, type, HP/ATK/SPD sliders, trait, up to 3 skills — synthesize for 20 essence into your team, or **encode the design into a shareable URL** (`#pal=…`): opening the link spawns your Pal as a wild "CUSTOM" visitor to catch; custom species persist in the save
- [ ] **Co-op / shared world** via WebRTC data channels (peer-to-peer)
- [ ] **Save cloud sync** (export/import save string)

### ✅ Phase 5 — Beyond (shipped)
- [x] **Story intro**: 8-slide cinematic about Lina with fade transitions, per-slide geometric art, skip support
- [x] **World expansion**: map 1500→2200 tiles; **+2 biomes** (volcano, crystal) → 7 total; **+4 species** → 30; **+2 ruins** → 5; **+2 Alpha bosses** → 5; biome decor (lava cracks, crystals); volcano ash-storms & crystal auroras
- [x] **Chapter 5 quests** ("The Wilds Beyond"): volcano/crystal catches, 3,000-tile travel counter, aurora sighting, talk to Mira ×3
- [x] **New NPCs**: Elder Mira (storyteller, lore + essence) and Blacksmith Bram (permanent weapon/HP upgrades with coins)

---

## Files

```
projects/pocket-wild.html          → intro screen (wrapper)
projects/pocket-wild/index.html    → HTML shell + CSS + 28 <script src="js/..."> in ordine
projects/pocket-wild/js/           → the game logic, split by domain (see below)
projects/pocket-wild/README.md     → this file
projects/pocket-wild/manifest.webmanifest → PWA manifest
projects/pocket-wild/sw.js         → offline service worker (caches index + js/)
projects/pocket-wild/icon-192.png  → PWA icon (generated)
projects/pocket-wild/icon-512.png  → PWA icon (generated)
projects/pocket-wild/tests/          → Node test suite + engine docs (see tests/README.md)
```

### Code layout (`js/`, load order = file order)

| File | Contenuto |
|---|---|
| `00-core.js` | utils (clamp/dist/mulberry32/toast/SILENT), TILE/WORLD_T, noise, biomes, `solidAt`/`circleHitsSolid` |
| `01-world.js` | TYPES/TYPE_MULT, SPECIES (30), sphere tiers, rarity |
| `02-data.js` | SEASONS, `seasonOf`/`curSeason`/`anytimePool`, trait/skill pools, `speciesOf` + custom registry |
| `03-state.js` | global `G`, save/load (localStorage) |
| `04-pals.js` | makeWild/scalePal/makeOwned, XP/level/evolution, `dmgCalc`, `catchChance` |
| `05-quests.js` | 18 quests in 5 chapters, unlock logic, rewards |
| `06-ach.js` | achievements profile + `checkAch` |
| `07-crafting.js` | recipes + structures |
| `08-spawn.js` | wild spawn pools, ruins, Alpha bosses |
| `09-lab.js` | gene lab (splice/fuse), traits |
| `10-custom.js` | custom Pal editor logic + URL share/import |
| `11-testlab.js` | parallel test engine (bot, stepSim, experiments) |
| `12-combat.js` | spheres, projectiles, capture, active-Pal combat, `defeatPal` |
| `13-sound.js` | WebAudio SFX |
| `14-actions.js` | riding, farming, skill scrolls |
| `15-economy.js` | trader (sell/buy), coins |
| `16-ranch.js` | breeding |
| `17-dungeon.js` | ruins: traps/key/secret/vault |
| `18-npcs.js` | arena duel, wandering trainers, Elder Mira, Blacksmith Bram |
| `19-boss.js` | Void Rift + Void Sovereign + game complete |
| `20-time.js` | day/night, seasons, weather, hunger, Pal work |
| `21-player.js` | input, building, interact, weapons |
| `22-panels.js` | all UI panels (team/craft/lab/build/quests/chest/trade/dex) |
| `23-customui.js` | custom Pal lab UI (`renderEdit`) |
| `24-render.js` | canvas rendering, light-mask, minimap, HUD refresh |
| `25-main.js` | main loop (`step`/`loop`) |
| `26-story.js` | cinematic intro (Lina's story) |
| `27-start.js` | new world/continue, PWA install, bootstrap |

> **Architecture note**: the game started as a single-file app (portfolio convention, GitHub Pages/Codespaces robustness, zero build, `file://` friendly). At ~3,000 lines it was refactored into the ordered-scripts layout above — same global state, same behaviour, still works by double-clicking `index.html`, and the 189 Node tests keep the split honest (they concatenate `js/*.js` in order and run the same logic with DOM stubs).
```

## Tests (Node)

- Biome noise deterministic; all 5 biomes appear; tile objects deterministic.
- Catch chance: low HP > full HP; rare species harder.
- Type table: fire>grass, water>fire, grass>water; damage in range.
- Leveling: Grassling reaches Lv 8 and evolves; stats recalculated.
- Gene splice: essence consumed, ATK increased toward donor.
- Fusion: same-species merge removes one Pal, level increases.
- Paldex: spawns/catches mark species as seen; caught counts tracked.
- Dungeon: traps deterministic, placed away from the player and off solids; rewards scale with key + secret; floor 1→2→3 progression grants key + secret + traps; floor-3 clear spawns the vault; traps deal 10 HP then re-arm; vault triggers the clear reward.
- Trainers: team size 1–2 based on your roster, levels scale; challenge sends the first member; mid-chain defeat advances the team with no reward; final defeat grants rewards + rematch cooldown; rematch blocked while cooling; spawn/despawn timers work; next member spawns after the intermission.
- Arena duels still function without a trainer.
- Quest chain: 13 quests in 4 chapters; later chapters locked until earlier ones complete; locked quests don't progress; unlocking Chapter 4 spawns the Void Rift; fresh quests progress without NaN regression.
- Final boss: spawning consumes the rift; boss is huge; minions spawn under 70% HP; aura deals damage up close; defeat sets `complete`, grants rewards, cleans up minions and completes the final quest; no rift after completion.
- PWA assets: manifest parses as valid JSON; icons are valid PNGs (192/512) with transparent corners; all assets serve HTTP 200.
- Seasons: 26 species with exactly 4 seasonal; `seasonOf` maps days 1–7→spring … 22–28→winter and wraps; seasonal species gated in/out of spawn pools per season; summer never rains and favors sandstorms; winter nights produce auroras outside snow; spring rains more; harvest multipliers (spring ×2 berries, autumn ×1.5 berries, summer ×1); statistical spawn sim shows Bloompuff only in spring and Snowfawn only in winter.
- Story: 8 slides, all with text/color/shape; skip/show flow don't crash.
- World expansion: 7 biomes defined and all reachable in a 200×200 area; 30 species (2 volcano + 2 crystal); 5 ruins and 5 Alphas spawn; map is 2,200 tiles.
- Chapter 5: 18 quests in 5 chapters; ch5 locked until ch4 done; travel/aurora/talk quests progress and complete via their events.
- NPCs: Mira spawns on cooldown, grants +2 essence per talk with a gift cooldown and cycles lore lines; Bram spawns, upgrades cost coins, blocked without coins, sword +8 dmg and Iron Plating +25 HP persist.
- Custom Pal editor: URL encode/decode round-trips unicode names and skill lists (base64url, no padding); `sanitizeCustom` clamps stats (HP 30–130, ATK 6–34, SPD 0.9–2.0), validates type/shape/trait/skills; `speciesOf` resolves custom species first; synthesizing costs 20 essence, applies traits and registers the species; no synth without essence or skills; wild custom Pals spawn with scaled level and are marked seen; `#pal=` URL import sets the pending visitor and clears the hash.
- Audit + engine: seasonal multipliers apply to manual gathering too (`gatherMultOf`); 16 achievements unlock from stats/state and persist via the profile key; snapshot/restore round-trips the world; bot decisions map to goals (rest/eat/catch/craft/rift…); `stepSim` runs thousands of steps without exceptions; faint → bot auto-respawns at full HP and deaths are counted; experiments (spheres/essence/heal/quests/rift) mutate the world as expected; **spawn regression: `findSpawn` never places the player in ocean/solid tiles across seeds 1, 2, 3, 42, 777** (fixes a historical bug where the world centre is ocean for every seed).

## 🔍 Audit findings (found & fixed)

| Bug | Found by | Fix |
|---|---|---|
| `circleHitsSolid` passed tile coords to a pixel-based `solidAt` → traps, secret rooms and player/riding collision checked the wrong tiles | dungeon Phase 3b tests | pass `tx*TILE, ty*TILE` |
| Alpha bosses were created but **never spawned into the world** → "Defeat an Alpha" quest impossible | quest-chain Phase 4 work | push `G.bosses` into `G.wilds` on new/continue |
| Quests without a `done` field progressed to `NaN` and never completed | quest tests | `initQuests` seeds `done:0` |
| **Player spawned in the ocean** — world centre tile (750,750) is ocean for every seed → completely stuck | parallel Test Engine smoke run | `findSpawn()` scans for the first non-ocean, non-solid tile near centre + migration for old saves |
| Manual gathering ignored seasonal multipliers (work Pals had them) | audit pass | shared `gatherMultOf(res)` helper |
| Minimal night lighting (only campfires) | audit pass | full light-mask (player, Pal, lanterns, beds, workbench, chest, boss, rift) |
| Minimap showed only buildings | audit pass | markers for ruins, trader, trainer, rift, bosses, dungeon |
| Test-lab bot never executed build/craft goals (null target) | engine smoke | immediate-action goals in `botMove` + flee-from-danger logic |
