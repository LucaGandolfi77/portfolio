/* ===== MORFALIA · Resources, Placeables, Crops, Crafting & Cooking ===== */

export const ITEMS = {
  // --- Raw Resources ---
  wood: { id: 'wood', name: 'Ramo di Legno', icon: '🪵', cat: 'resource', desc: 'Legno raccolto da rami e tronchi secchi.' },
  stone: { id: 'stone', name: 'Pietra Grezza', icon: '🪨', cat: 'resource', desc: 'Roccia solida utile per sentieri e muratura.' },
  clay: { id: 'clay', name: 'Argilla Morbida', icon: '🧱', cat: 'resource', desc: 'Argilla umida plasmabile in mattoni e vasi.' },
  herb: { id: 'herb', name: 'Erba Profumata', icon: '🌿', cat: 'resource', desc: 'Foglie aromatiche che crescono sui prati vivi.' },
  berry: { id: 'berry', name: 'Bacca Dolce', icon: '🫐', cat: 'food', energy: 18, heart: 1, desc: 'Frutto succoso: ricarica 18 Energia o si può regalare.' },
  sand_ore: { id: 'sand_ore', name: 'Sabbia Silicea', icon: '⏳', cat: 'resource', desc: 'Sabbia fine costiera, base per il vetro.' },
  shell: { id: 'shell', name: 'Conchiglia Madreperla', icon: '🐚', cat: 'resource', desc: 'Conchiglia lucente trovata lungo la costa.' },
  iron_ore: { id: 'iron_ore', name: 'Ferro Grezzo', icon: '⛏️', cat: 'resource', desc: 'Minerale estratto dalle rocce di basalto.' },
  spark_core: { id: 'spark_core', name: 'Nucleo Scintilla', icon: '🔋', cat: 'resource', desc: 'Condensatore carico di energia statica.' },
  glow_mushroom: { id: 'glow_mushroom', name: 'Fungo Luminoso', icon: '🍄', cat: 'resource', desc: 'Fungo bioluminescente della Foresta di Nebbia.' },
  pollen: { id: 'pollen', name: 'Polline Dorato', icon: '🌼', cat: 'resource', desc: 'Polvere profumata che nutre fiori e dolci.' },
  crystal: { id: 'crystal', name: 'Cristallo Armonico', icon: '💎', cat: 'resource', desc: 'Gemma risonante delle Isole Sospese.' },

  // --- Refined Materials ---
  lumber: { id: 'lumber', name: 'Assi di Legno', icon: '🪵', cat: 'material', desc: 'Legname lavorato al banco da lavoro.' },
  brick: { id: 'brick', name: 'Mattoni Cotti', icon: '🧱', cat: 'material', desc: 'Mattoni resistenti cotti con argilla.' },
  glass: { id: 'glass', name: 'Lastra di Vetro', icon: '🪟', cat: 'material', desc: 'Vetro limpido ottenuto fondendo sabbia silicea.' },
  iron_bar: { id: 'iron_bar', name: 'Lingotto di Ferro', icon: '🔩', cat: 'material', desc: 'Ferro purificato per macchinari e strutture.' },

  // --- Seeds & Crops ---
  seed_turnip: { id: 'seed_turnip', name: 'Semi di Rapa', icon: '🌱', cat: 'seed', cropId: 'turnip', desc: 'Pianta su prato o terra coltivata e innaffia.' },
  seed_berry: { id: 'seed_berry', name: 'Semi di Fragola', icon: '🍓', cat: 'seed', cropId: 'strawberry', desc: 'Cresce in fragole di rugiada dolcissime.' },
  seed_wheat: { id: 'seed_wheat', name: 'Semi di Grano', icon: '🌾', cat: 'seed', cropId: 'wheat', desc: 'Spighe dorate per pane e biscotti.' },
  seed_moon: { id: 'seed_moon', name: 'Semi di Carota Lunare', icon: '🥕', cat: 'seed', cropId: 'moon_carrot', desc: 'Radice brillante molto amata dai Biomini rari.' },

  turnip: { id: 'turnip', name: 'Rapa Croccante', icon: '🥬', cat: 'food', energy: 24, heart: 1, desc: 'Ortaggio fresco coltivato da Mimo.' },
  strawberry: { id: 'strawberry', name: 'Fragola di Rugiada', icon: '🍓', cat: 'food', energy: 30, heart: 2, desc: 'Dolcissima e profumata.' },
  wheat: { id: 'wheat', name: 'Grano Dorato', icon: '🌾', cat: 'resource', desc: 'Ingrediente base per pane e dolci.' },
  moon_carrot: { id: 'moon_carrot', name: 'Carota Lunare', icon: '🥕', cat: 'food', energy: 36, heart: 2, desc: 'Brilla dolcemente al crepuscolo.' },

  // --- Cooked Dishes ---
  berry_soup: { id: 'berry_soup', name: 'Zuppa di Bacche', icon: '🥣', cat: 'food', energy: 55, heart: 3, desc: 'Calda e rigenerante (+55 Energia, +3 Amicizia).' },
  golden_bread: { id: 'golden_bread', name: 'Pane Dorato', icon: '🥖', cat: 'food', energy: 65, heart: 3, desc: 'Fragante appena sfornato (+65 Energia, +3 Amicizia).' },
  strawberry_cake: { id: 'strawberry_cake', name: 'Torta di Fragole', icon: '🍰', cat: 'food', energy: 85, heart: 4, desc: 'Il dolce preferito della valle (+85 Energia, +4 Amicizia).' },
  mushroom_broth: { id: 'mushroom_broth', name: 'Brodo di Funghi', icon: '🍲', cat: 'food', energy: 75, heart: 4, desc: 'Aromatico e luminoso (+75 Energia, +4 Amicizia).' },
  honey_cookies: { id: 'honey_cookies', name: 'Biscotti al Polline', icon: '🍪', cat: 'food', energy: 70, heart: 4, desc: 'Croccanti e dorati (+70 Energia, +4 Amicizia).' },
  harmony_elixir: { id: 'harmony_elixir', name: 'Elisir Armonico', icon: '🧪', cat: 'food', energy: 100, heart: 5, desc: 'Energia al massimo e gioia immediata (+100 Energia, +5 Amicizia).' },

  // --- Placeable Terrain & Structures ---
  path_kit: { id: 'path_kit', name: 'Sentiero in Pietra', icon: '🛤️', cat: 'placeable', placeTile: 'path', desc: 'Lastrica una casella con un sentiero ordinato.' },
  bridge_kit: { id: 'bridge_kit', name: 'Ponte di Legno', icon: '🌉', cat: 'placeable', placeTile: 'bridge', desc: 'Permette di attraversare l\'acqua.' },
  soil_kit: { id: 'soil_kit', name: 'Aiuola Orto', icon: '🟫', cat: 'placeable', placeTile: 'soil', desc: 'Terreno fertile pronto per i semi.' },
  flower_bed: { id: 'flower_bed', name: 'Vaso di Fiori', icon: '🌺', cat: 'placeable', objType: 'flower_bed', solid: false, harmony: 8, desc: 'Fioriera colorata adorata dai Biomini.' },
  campfire: { id: 'campfire', name: 'Falò', icon: '🔥', cat: 'placeable', objType: 'campfire', solid: true, light: true, ignitable: true, harmony: 10, desc: 'Scalda l\'area; accendilo con Fiammata o riposa per cambiare ora.' },
  log_bench: { id: 'log_bench', name: 'Panchina di Tronco', icon: '🪑', cat: 'placeable', objType: 'log_bench', solid: true, harmony: 8, desc: 'Seduta accogliente in legno naturale.' },
  workbench: { id: 'workbench', name: 'Banco da Lavoro', icon: '🛠️', cat: 'placeable', objType: 'workbench', solid: true, harmony: 12, desc: 'Stazione per costruire mobili e strutture.' },
  furnace: { id: 'furnace', name: 'Fornace di Argilla', icon: '🧱', cat: 'placeable', objType: 'furnace', solid: true, light: true, harmony: 14, desc: 'Fonde vetro, mattoni e lingotti.' },
  kitchen: { id: 'kitchen', name: 'Cucina da Campo', icon: '🍳', cat: 'placeable', objType: 'kitchen', solid: true, harmony: 14, desc: 'Prepara piatti gustosi per Mimo e i Biomini.' },
  lantern: { id: 'lantern', name: 'Lanterna di Giardino', icon: '🏮', cat: 'placeable', objType: 'lantern', solid: true, light: true, harmony: 10, desc: 'Illumina dolcemente la notte.' },
  picnic_table: { id: 'picnic_table', name: 'Tavolo da Picnic', icon: '🧺', cat: 'placeable', objType: 'picnic_table', solid: true, harmony: 12, desc: 'Punto d\'incontro conviviale per i vicini.' },
  moss_statue: { id: 'moss_statue', name: 'Statua di Muschio', icon: '🗿', cat: 'placeable', objType: 'moss_statue', solid: true, harmony: 14, desc: 'Antica scultura boschiva coperta di muschio.' },
  fountain: { id: 'fountain', name: 'Fontana di Rugiada', icon: '⛲', cat: 'placeable', objType: 'fountain', solid: true, harmony: 18, desc: 'Zampilla acqua fresca e attira creature acquatiche.' },
  shell_arch: { id: 'shell_arch', name: 'Arco di Conchiglie', icon: '🐚', cat: 'placeable', objType: 'shell_arch', solid: true, harmony: 15, desc: 'Decorazione marina scintillante.' },
  beach_umbrella: { id: 'beach_umbrella', name: 'Ombrellone Costiero', icon: '⛱️', cat: 'placeable', objType: 'beach_umbrella', solid: true, harmony: 12, desc: 'Offre ombra sulla sabbia dorata.' },
  generator: { id: 'generator', name: 'Generatore Solare', icon: '⚡', cat: 'placeable', objType: 'generator', solid: true, electrifiable: true, harmony: 16, desc: 'Caricalo con Scintilla per alimentare l\'area.' },
  street_lamp: { id: 'street_lamp', name: 'Lampione Elettrico', icon: '💡', cat: 'placeable', objType: 'street_lamp', solid: true, light: true, electrifiable: true, harmony: 14, desc: 'Luce brillante dei Custodi.' },
  windmill: { id: 'windmill', name: 'Mulino a Vento', icon: '🌬️', cat: 'placeable', objType: 'windmill', solid: true, harmony: 18, desc: 'Gira con la brezza e vivacizza l\'altopiano.' },
  mushroom_lamp: { id: 'mushroom_lamp', name: 'Lampada Fungo', icon: '🍄', cat: 'placeable', objType: 'mushroom_lamp', solid: true, light: true, harmony: 15, desc: 'Diffonde una luce verde smeraldo di notte.' },
  crystal_pillar: { id: 'crystal_pillar', name: 'Pilastro di Cristallo', icon: '💎', cat: 'placeable', objType: 'crystal_pillar', solid: true, light: true, harmony: 22, desc: 'Risuona di luce prismatica nelle Isole Sospese.' },
  cozy_tent: { id: 'cozy_tent', name: 'Tenda Rifugio', icon: '⛺', cat: 'placeable', objType: 'cozy_tent', solid: true, harmony: 16, desc: 'Un piccolo riparo accogliente per viandanti.' },
  wood_house: { id: 'wood_house', name: 'Casetta di Legno', icon: '🏡', cat: 'placeable', objType: 'wood_house', solid: true, harmony: 28, desc: 'Una vera casa calda per la comunità di Morfalia.' },
  botanic_shelf: { id: 'botanic_shelf', name: 'Scaffale Botanico', icon: '🪴', cat: 'placeable', objType: 'botanic_shelf', solid: true, harmony: 16, desc: 'Raccolta di semi, erbe e appunti di ricerca.' },
  prof_greenhouse: { id: 'prof_greenhouse', name: 'Serra del Professore', icon: '🏛️', cat: 'placeable', objType: 'prof_greenhouse', solid: true, light: true, harmony: 55, desc: 'Il sogno del Prof. Intreccio: una serra di vetro per custodire tutta la flora di Morfalia.' }
};

export const CROPS = {
  turnip: { id: 'turnip', name: 'Rapa', produce: 'turnip', growTime: 40, color: '#a8e67e' },
  strawberry: { id: 'strawberry', name: 'Fragola', produce: 'strawberry', growTime: 55, color: '#ff6f87' },
  wheat: { id: 'wheat', name: 'Grano', produce: 'wheat', growTime: 48, color: '#f2ce63' },
  moon_carrot: { id: 'moon_carrot', name: 'Carota Lunare', produce: 'moon_carrot', growTime: 65, color: '#ffad5e' }
};

export const RECIPES = [
  // Refined materials
  { id: 'r_lumber', out: 'lumber', qty: 2, tab: 'material', cost: { wood: 2 } },
  { id: 'r_brick', out: 'brick', qty: 2, tab: 'material', cost: { clay: 2, stone: 1 } },
  { id: 'r_glass', out: 'glass', qty: 2, tab: 'material', cost: { sand_ore: 2, wood: 1 } },
  { id: 'r_iron_bar', out: 'iron_bar', qty: 2, tab: 'material', cost: { iron_ore: 2, wood: 1 } },

  // Garden & Terrain
  { id: 'r_path', out: 'path_kit', qty: 4, tab: 'build', cost: { stone: 2 } },
  { id: 'r_bridge', out: 'bridge_kit', qty: 2, tab: 'build', cost: { wood: 3 } },
  { id: 'r_soil', out: 'soil_kit', qty: 3, tab: 'build', cost: { clay: 1, herb: 1 } },
  { id: 'r_flower_bed', out: 'flower_bed', qty: 1, tab: 'build', cost: { wood: 2, herb: 2 } },
  { id: 'r_campfire', out: 'campfire', qty: 1, tab: 'build', cost: { wood: 3, stone: 3 } },
  { id: 'r_log_bench', out: 'log_bench', qty: 1, tab: 'build', cost: { wood: 3 } },
  { id: 'r_lantern', out: 'lantern', qty: 1, tab: 'build', cost: { wood: 2, clay: 1 } },
  { id: 'r_picnic', out: 'picnic_table', qty: 1, tab: 'build', cost: { lumber: 3, herb: 1 } },
  { id: 'r_moss_statue', out: 'moss_statue', qty: 1, tab: 'build', cost: { stone: 4, herb: 2 } },
  { id: 'r_fountain', out: 'fountain', qty: 1, tab: 'build', cost: { stone: 5, clay: 3 } },
  { id: 'r_shell_arch', out: 'shell_arch', qty: 1, tab: 'build', cost: { shell: 3, sand_ore: 2 } },
  { id: 'r_umbrella', out: 'beach_umbrella', qty: 1, tab: 'build', cost: { lumber: 2, herb: 2 } },
  { id: 'r_generator', out: 'generator', qty: 1, tab: 'build', cost: { iron_bar: 2, spark_core: 2 } },
  { id: 'r_street_lamp', out: 'street_lamp', qty: 1, tab: 'build', cost: { iron_bar: 1, glass: 1, spark_core: 1 } },
  { id: 'r_windmill', out: 'windmill', qty: 1, tab: 'build', cost: { lumber: 4, iron_bar: 2 } },
  { id: 'r_mushroom_lamp', out: 'mushroom_lamp', qty: 1, tab: 'build', cost: { glow_mushroom: 2, wood: 2 } },
  { id: 'r_crystal_pillar', out: 'crystal_pillar', qty: 1, tab: 'build', cost: { crystal: 3, stone: 3 } },
  { id: 'r_tent', out: 'cozy_tent', qty: 1, tab: 'build', cost: { wood: 4, herb: 3 } },
  { id: 'r_house', out: 'wood_house', qty: 1, tab: 'build', cost: { lumber: 6, brick: 4, glass: 2 } },
  { id: 'r_botanic_shelf', out: 'botanic_shelf', qty: 1, tab: 'build', cost: { lumber: 3, herb: 3, pollen: 1 } },
  { id: 'r_workbench', out: 'workbench', qty: 1, tab: 'build', cost: { wood: 4, stone: 2 } },
  { id: 'r_furnace', out: 'furnace', qty: 1, tab: 'build', cost: { stone: 4, clay: 3 } },
  { id: 'r_kitchen', out: 'kitchen', qty: 1, tab: 'build', cost: { lumber: 3, stone: 3 } },
  { id: 'r_prof_greenhouse', out: 'prof_greenhouse', qty: 1, tab: 'build', cost: { lumber: 6, glass: 6, iron_bar: 4, crystal: 3 } },

  // Seeds synthesis
  { id: 'r_seed_turnip', out: 'seed_turnip', qty: 3, tab: 'seed', cost: { herb: 2 } },
  { id: 'r_seed_berry', out: 'seed_berry', qty: 2, tab: 'seed', cost: { berry: 2, herb: 1 } },
  { id: 'r_seed_wheat', out: 'seed_wheat', qty: 3, tab: 'seed', cost: { herb: 2, clay: 1 } },
  { id: 'r_seed_moon', out: 'seed_moon', qty: 2, tab: 'seed', cost: { glow_mushroom: 1, pollen: 1 } },

  // Cooking
  { id: 'c_berry_soup', out: 'berry_soup', qty: 1, tab: 'cook', cost: { berry: 2, herb: 1 } },
  { id: 'c_bread', out: 'golden_bread', qty: 1, tab: 'cook', cost: { wheat: 2 } },
  { id: 'c_cake', out: 'strawberry_cake', qty: 1, tab: 'cook', cost: { strawberry: 2, wheat: 1 } },
  { id: 'c_broth', out: 'mushroom_broth', qty: 1, tab: 'cook', cost: { glow_mushroom: 2, turnip: 1 } },
  { id: 'c_cookies', out: 'honey_cookies', qty: 1, tab: 'cook', cost: { wheat: 1, pollen: 2 } },
  { id: 'c_elixir', out: 'harmony_elixir', qty: 1, tab: 'cook', cost: { moon_carrot: 1, crystal: 1, berry: 1 } }
];
