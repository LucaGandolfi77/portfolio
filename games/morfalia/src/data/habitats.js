/* ===== MORFALIA · 30 Buildable Habitat Blueprints ===== */
/*
  Each habitat is detected automatically in any 5×5 neighborhood around newly placed
  tiles or objects!
  - tiles: { tileType: minCount }
  - objs: { objType: minCount }
  - lit: true -> requires at least one lit/powered object in the cluster
  - time: 'notte' | 'sera' | null (optional hint/condition)
  - region: optional preferred region (null = anywhere)
*/

export const HABITATS = [
  // --- LANDA INARIDITA (Early & Core) ---
  {
    id: 'hab_prato_rugiada', name: 'Prato di Rugiada', icon: '🌱',
    region: 'landa', attracts: 'fogliolo', harmony: 28,
    reqs: { tiles: { tall_grass: 3, grass: 3 } },
    hint: 'Usa Germoglio su terreno arido (o crea 3 caselle di Erba Alta vicino a 3 di Prato).'
  },
  {
    id: 'hab_stagno_vivo', name: 'Stagno Vivo', icon: '💧',
    region: 'landa', attracts: 'gocciolino', harmony: 30,
    reqs: { tiles: { water: 2, grass: 3 } },
    hint: 'Vicino a 2 caselle d\'Acqua e 3 di Prato Verde.'
  },
  {
    id: 'hab_focolare', name: 'Focolare Accogliente', icon: '🔥',
    region: null, attracts: 'bracino', harmony: 32,
    reqs: { objs: { campfire: 1, log_bench: 1 } },
    hint: 'Posiziona 1 Falò accanto a 1 Panchina di Tronco.'
  },
  {
    id: 'hab_angolo_muschio', name: 'Angolo del Muschio', icon: '🦔',
    region: null, attracts: 'muschietto', harmony: 30,
    reqs: { objs: { log_bench: 1 }, tiles: { tall_grass: 2, flowers: 1 } },
    hint: '1 Panchina di Tronco circondata da 2 Erba Alta e 1 Prato Fiorito.'
  },
  {
    id: 'hab_aiuola_miele', name: 'Giardino del Polline', icon: '🌼',
    region: null, attracts: 'pollinello', harmony: 32,
    reqs: { objs: { flower_bed: 2 }, tiles: { flowers: 2 } },
    hint: '2 Vasi di Fiori vicino a 2 caselle di Prato Fiorito.'
  },
  {
    id: 'hab_orto_rustico', name: 'Orto del Contadino', icon: '🥬',
    region: null, attracts: 'fogliolo', harmony: 30,
    reqs: { tiles: { soil: 4, water: 1 } },
    hint: '4 Aiuole Orto vicine ad almeno 1 casella d\'Acqua.'
  },
  {
    id: 'hab_picnic_valle', name: 'Radura da Picnic', icon: '🧺',
    region: null, attracts: 'muschietto', harmony: 34,
    reqs: { objs: { picnic_table: 1, flower_bed: 1 }, tiles: { grass: 3 } },
    hint: '1 Tavolo da Picnic + 1 Vaso di Fiori sul prato.'
  },
  {
    id: 'hab_campo_rifugio', name: 'Campo Base', icon: '⛺',
    region: null, attracts: 'bracino', harmony: 36,
    reqs: { objs: { cozy_tent: 1, campfire: 1 } },
    hint: '1 Tenda Rifugio vicino a 1 Falò.'
  },

  // --- COSTA DI CENERE ---
  {
    id: 'hab_boschetto_rami', name: 'Siepe Costiera', icon: '🦎',
    region: 'costa', attracts: 'ramosauro', harmony: 34,
    reqs: { objs: { workbench: 1 }, tiles: { grass: 3 } },
    hint: 'Sulla Costa: 1 Banco da Lavoro accanto a 3 caselle di Prato (usa Germoglio/Zampillo).'
  },
  {
    id: 'hab_spiaggia_dorata', name: 'Spiaggia Dorata', icon: '🦀',
    region: 'costa', attracts: 'sabbietta', harmony: 32,
    reqs: { tiles: { sand: 4, water: 2 } },
    hint: '4 caselle di Sabbia Dorata (lava la cenere con Zampillo!) accanto a 2 d\'Acqua.'
  },
  {
    id: 'hab_arco_corallo', name: 'Terrazza di Corallo', icon: '🐚',
    region: 'costa', attracts: 'corallina', harmony: 36,
    reqs: { objs: { shell_arch: 1 }, tiles: { sand: 3, water: 1 } },
    hint: '1 Arco di Conchiglie sulla Sabbia Dorata vicino all\'Acqua.'
  },
  {
    id: 'hab_lido_sole', name: 'Lido del Sole', icon: '⛱️',
    region: null, attracts: 'ondolina', harmony: 36,
    reqs: { objs: { beach_umbrella: 1, log_bench: 1 }, tiles: { sand: 2 } },
    hint: '1 Ombrellone Costiero + 1 Panchina di Tronco sulla Sabbia Dorata.'
  },
  {
    id: 'hab_ponte_stagno', name: 'Pontile delle Ninfee', icon: '🐸',
    region: null, attracts: 'rugiadina', harmony: 34,
    reqs: { tiles: { bridge: 2, water: 2 }, objs: { flower_bed: 1 } },
    hint: '2 caselle di Ponte di Legno sopra l\'Acqua con 1 Vaso di Fiori vicino.'
  },
  {
    id: 'hab_fontana_baia', name: 'Piazzetta della Fontana', icon: '⛲',
    region: null, attracts: 'ondolina', harmony: 38,
    reqs: { objs: { fountain: 1, lantern: 1 }, tiles: { path: 2 } },
    hint: '1 Fontana di Rugiada + 1 Lanterna su 2 caselle di Sentiero.'
  },

  // --- CRESTE DI BASALTO ---
  {
    id: 'hab_cava_pietra', name: 'Terrazza di Basalto', icon: '🪨',
    region: 'creste', attracts: 'ciotolino', harmony: 36,
    reqs: { objs: { moss_statue: 1 }, tiles: { rock: 3 } },
    hint: 'Sulle Creste: 1 Statua di Muschio circondata da 3 caselle di Basalto.'
  },
  {
    id: 'hab_officina_scintilla', name: 'Officina Elettrica', icon: '⚡',
    region: null, attracts: 'voltacchio', harmony: 40,
    reqs: { objs: { generator: 1, street_lamp: 1 } },
    hint: '1 Generatore Solare accanto a 1 Lampione Elettrico.'
  },
  {
    id: 'hab_fucina_calda', name: 'Fucina del Fabbro', icon: '🔩',
    region: null, attracts: 'ferrotto', harmony: 38,
    reqs: { objs: { furnace: 1, workbench: 1 } },
    hint: '1 Fornace di Argilla vicino a 1 Banco da Lavoro.'
  },
  {
    id: 'hab_bistrot_forno', name: 'Locanda della Fornace', icon: '🐢',
    region: null, attracts: 'fornacino', harmony: 40,
    reqs: { objs: { furnace: 1, kitchen: 1, log_bench: 1 } },
    hint: '1 Fornace + 1 Cucina da Campo + 1 Panchina di Tronco.'
  },
  {
    id: 'hab_collina_vento', name: 'Belvedere del Vento', icon: '🌬️',
    region: null, attracts: 'piumavento', harmony: 40,
    reqs: { objs: { windmill: 1, flower_bed: 1 } },
    hint: '1 Mulino a Vento con 1 Vaso di Fiori accanto.'
  },
  {
    id: 'hab_viale_luci', name: 'Viale dei Custodi', icon: '💡',
    region: null, attracts: 'voltacchio', harmony: 38,
    reqs: { objs: { street_lamp: 2 }, tiles: { path: 3 } },
    hint: '2 Lampioni Elettrici lungo 3 caselle di Sentiero in Pietra.'
  },

  // --- FORESTA DI NEBBIA ---
  {
    id: 'hab_radura_brezza', name: 'Radura della Brezza', icon: '🍃',
    region: 'foresta', attracts: 'zefirino', harmony: 42,
    reqs: { objs: { windmill: 1 }, tiles: { flowers: 2 } },
    hint: 'Nella Foresta: 1 Mulino a Vento vicino a 2 caselle di Prato Fiorito.'
  },
  {
    id: 'hab_bosco_lucciole', name: 'Cerchio dei Funghi', icon: '🍄',
    region: null, attracts: 'lumifungo', harmony: 42,
    reqs: { objs: { mushroom_lamp: 2 }, tiles: { tall_grass: 2 } },
    hint: '2 Lampade Fungo vicino a 2 caselle di Erba Alta.'
  },
  {
    id: 'hab_sentiero_notturno', name: 'Santuario del Gufo', icon: '🦉',
    region: null, attracts: 'ombraluce', harmony: 44,
    reqs: { objs: { lantern: 1, moss_statue: 1, mushroom_lamp: 1 } },
    hint: '1 Lanterna + 1 Statua di Muschio + 1 Lampada Fungo.'
  },
  {
    id: 'hab_giardino_sole', name: 'Giardino Solare', icon: '🌻',
    region: null, attracts: 'solaris', harmony: 42,
    reqs: { objs: { flower_bed: 2, botanic_shelf: 1 }, tiles: { flowers: 2 } },
    hint: '2 Vasi di Fiori + 1 Scaffale Botanico + 2 Prati Fioriti.'
  },
  {
    id: 'hab_borgo_bosco', name: 'Casetta nel Bosco', icon: '🏡',
    region: null, attracts: 'lumifungo', harmony: 46,
    reqs: { objs: { wood_house: 1, lantern: 1, flower_bed: 1 } },
    hint: '1 Casetta di Legno + 1 Lanterna + 1 Vaso di Fiori.'
  },

  // --- ISOLE SOSPESE & ENDGAME ---
  {
    id: 'hab_corte_quarzo', name: 'Corte di Quarzo', icon: '🦊',
    region: 'isole', attracts: 'cristallino', harmony: 48,
    reqs: { objs: { crystal_pillar: 1 }, tiles: { crystal_floor: 4 } },
    hint: 'Nelle Isole Sospese: 1 Pilastro di Cristallo su 4 Pietre Celesti.'
  },
  {
    id: 'hab_altare_gemme', name: 'Altare d\'Ametista', icon: '💎',
    region: null, attracts: 'gemmoro', harmony: 50,
    reqs: { objs: { crystal_pillar: 2, moss_statue: 1 } },
    hint: '2 Pilastri di Cristallo accanto a 1 Statua di Muschio.'
  },
  {
    id: 'hab_terrazza_nuvole', name: 'Terrazza delle Nuvole', icon: '☁️',
    region: 'isole', attracts: 'nubolino', harmony: 48,
    reqs: { objs: { wood_house: 1, windmill: 1 } },
    hint: '1 Casetta di Legno accanto a 1 Mulino a Vento sulle Isole Sospese.'
  },
  {
    id: 'hab_prisma_armonico', name: 'Giardino Prismatico', icon: '🦋',
    region: null, attracts: 'luminella', harmony: 54,
    reqs: { objs: { crystal_pillar: 1, fountain: 1, flower_bed: 1 } },
    hint: '1 Pilastro di Cristallo + 1 Fontana di Rugiada + 1 Vaso di Fiori.'
  },
  {
    id: 'hab_serra_professore', name: 'Serra dei Tesori del Professore', icon: '🏛️',
    region: null, attracts: 'astralio', harmony: 85,
    reqs: { objs: { prof_greenhouse: 1, botanic_shelf: 1, fountain: 1, flower_bed: 1 } },
    hint: 'La grande opera finale: Serra del Professore + Scaffale Botanico + Fontana + Vaso di Fiori!'
  },
  // --- 10 NUOVI HABITAT (Totale 40) ---
  {
    id: 'hab_quadrifoglio', name: 'Radura Fortunata', icon: '🍀',
    region: 'landa', attracts: 'trifoglino', harmony: 30,
    reqs: { tiles: { flowers: 3, grass: 4 } },
    hint: 'Nella Landa: 3 caselle di Prato Fiorito vicino a 4 di Prato Verde.'
  },
  {
    id: 'hab_galleria_argilla', name: 'Orto Sotterraneo', icon: '🐾',
    region: null, attracts: 'talpino', harmony: 32,
    reqs: { tiles: { soil: 5, path: 2 } },
    hint: '5 Aiuole Orto lungo 2 caselle di Sentiero in Pietra.'
  },
  {
    id: 'hab_sentiero_lucciole', name: 'Viale delle Lucciole', icon: '✨',
    region: null, attracts: 'lucciolina', harmony: 34,
    reqs: { objs: { lantern: 2 }, tiles: { flowers: 2 } },
    hint: '2 Lanterne di Giardino vicino a 2 caselle di Prato Fiorito.'
  },
  {
    id: 'hab_laguna_trasparente', name: 'Laguna delle Meduse', icon: '🪼',
    region: 'costa', attracts: 'medusella', harmony: 36,
    reqs: { tiles: { water: 4, sand: 3 } },
    hint: 'Sulla Costa: 4 caselle d\'Acqua vicino a 3 di Sabbia Dorata.'
  },
  {
    id: 'hab_approdo_tartarughe', name: 'Approdo delle Tartarughe', icon: '🐢',
    region: null, attracts: 'tartamar', harmony: 38,
    reqs: { objs: { beach_umbrella: 1 }, tiles: { bridge: 2, sand: 3 } },
    hint: '1 Ombrellone Costiero con 2 caselle di Ponte di Legno e 3 di Sabbia Dorata.'
  },
  {
    id: 'hab_salotto_perla', name: 'Salotto di Madreperla', icon: '🦪',
    region: null, attracts: 'perletta', harmony: 40,
    reqs: { objs: { shell_arch: 1, fountain: 1 } },
    hint: '1 Arco di Conchiglie accanto a 1 Fontana di Rugiada.'
  },
  {
    id: 'hab_piazza_dinamo', name: 'Piazza della Dinamo', icon: '🌋',
    region: 'creste', attracts: 'magmino', harmony: 40,
    reqs: { objs: { furnace: 2, campfire: 1 } },
    hint: 'Sulle Creste: 2 Fornaci di Argilla vicino a 1 Falò.'
  },
  {
    id: 'hab_nido_correnti', name: 'Nido delle Correnti', icon: '🦅',
    region: null, attracts: 'falchetto', harmony: 42,
    reqs: { objs: { windmill: 1, cozy_tent: 1 }, tiles: { rock: 3 } },
    hint: '1 Mulino a Vento + 1 Tenda Rifugio su 3 caselle di Basalto.'
  },
  {
    id: 'hab_radura_volpe', name: 'Radura della Volpe', icon: '🦊',
    region: 'foresta', attracts: 'volpombra', harmony: 44,
    reqs: { objs: { mushroom_lamp: 1, picnic_table: 1 }, tiles: { grass: 4 } },
    hint: 'Nella Foresta: 1 Lampada Fungo + 1 Tavolo da Picnic su 4 caselle di Prato.'
  },
  {
    id: 'hab_osservatorio_comete', name: 'Osservatorio delle Comete', icon: '🌟',
    region: 'isole', attracts: 'cometa', harmony: 52,
    reqs: { objs: { crystal_pillar: 1, street_lamp: 1, log_bench: 1 } },
    hint: 'Nelle Isole Sospese: 1 Pilastro di Cristallo + 1 Lampione Elettrico + 1 Panchina.'
  }
];

export const HABITATS_BY_ID = Object.fromEntries(HABITATS.map((h) => [h.id, h]));
