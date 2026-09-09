const VOIDBOUND = (() => {
  'use strict';

  const MAP = {
    W: 4800, H: 3200,
    TILE: 64,
    lanes: {
      top: { y: 400, waypoints_blue: [[300,400],[1200,400],[2400,400],[3600,400],[4500,400]],
             waypoints_red: [[4500,400],[3600,400],[2400,400],[1200,400],[300,400]] },
      bot: { y: 2800, waypoints_blue: [[300,2800],[1200,2800],[2400,2800],[3600,2800],[4500,2800]],
             waypoints_red: [[4500,2800],[3600,2800],[2400,2800],[1200,2800],[300,2800]] }
    },
    jungle_spots: [
      { x: 1800, y: 1200 }, { x: 2200, y: 1200 },
      { x: 1800, y: 2000 }, { x: 2200, y: 2000 },
      { x: 1500, y: 1600 }, { x: 2400, y: 1600 },
      { x: 2000, y: 1000 }, { x: 2000, y: 2200 },
      { x: 1200, y: 1500 }, { x: 2800, y: 1700 },
      { x: 300, y: 1000 }, { x: 300, y: 700 },
      { x: 4500, y: 1000 }, { x: 4500, y: 700 },
      { x: 300, y: 2200 }, { x: 300, y: 2500 },
      { x: 4500, y: 2200 }, { x: 4500, y: 2500 },
    ],
    bushes: [
      { x: 1600, y: 600, w: 200, h: 120 },
      { x: 1600, y: 2480, w: 200, h: 120 },
      { x: 3200, y: 600, w: 200, h: 120 },
      { x: 3200, y: 2480, w: 200, h: 120 },
      { x: 2000, y: 1400, w: 160, h: 160 },
      { x: 2600, y: 1400, w: 160, h: 160 },
      { x: 2000, y: 1640, w: 160, h: 160 },
      { x: 2600, y: 1640, w: 160, h: 160 },
    ],
    jump_pads: [
      { x: 600, y: 1600, tx: 1800, ty: 1600 },
      { x: 4200, y: 1600, tx: 3000, ty: 1600 },
    ],
    speed_zones: [
      { x: 1000, y: 400, r: 150, mult: 1.4 },
      { x: 1000, y: 2800, r: 150, mult: 1.4 },
      { x: 3800, y: 400, r: 150, mult: 1.4 },
      { x: 3800, y: 2800, r: 150, mult: 1.4 },
    ]
  };

  const BASES = {
    blue: { x: 300, y: 1600, team: 0 },
    red:  { x: 4500, y: 1600, team: 1 }
  };

  const GOALS = [
    { id: 'bt1', team: 0, x: 800,  y: 400,  hp: 80,  lane: 'top', tier: 1, order: 1 },
    { id: 'bt2', team: 0, x: 1200, y: 400,  hp: 100, lane: 'top', tier: 2, order: 2 },
    { id: 'bb1', team: 0, x: 800,  y: 2800, hp: 80,  lane: 'bot', tier: 1, order: 1 },
    { id: 'bb2', team: 0, x: 1200, y: 2800, hp: 100, lane: 'bot', tier: 2, order: 2 },
    { id: 'bh',  team: 0, x: 400,  y: 1600, hp: 150, lane: 'base', tier: 3, order: 3 },

    { id: 'rt1', team: 1, x: 4000, y: 400,  hp: 80,  lane: 'top', tier: 1, order: 1 },
    { id: 'rt2', team: 1, x: 3600, y: 400,  hp: 100, lane: 'top', tier: 2, order: 2 },
    { id: 'rb1', team: 1, x: 4000, y: 2800, hp: 80,  lane: 'bot', tier: 1, order: 1 },
    { id: 'rb2', team: 1, x: 3600, y: 2800, hp: 100, lane: 'bot', tier: 2, order: 2 },
    { id: 'rh',  team: 1, x: 4400, y: 1600, hp: 150, lane: 'base', tier: 3, order: 3 },
  ];

  const CREEPS = [
    // Tier 0 - Voidlings (piccoli, veloci, deboli)
    { type: 'voidling',  hp: 80,  atk: 8,   xp: 15, shards: 3,  speed: 1.2, r: 14, color: '#7a4f8a', respawn: 30, aggro_r: 100, atk_type: 'melee' },
    { type: 'spitter',   hp: 60,  atk: 10,  xp: 18, shards: 4,  speed: 1.0, r: 12, color: '#6aaf4a', respawn: 30, aggro_r: 160, atk_type: 'ranged', atk_range: 120, proj_speed: 3, proj_color: '#80ff60' },
    { type: 'swarm',     hp: 45,  atk: 6,   xp: 12, shards: 2,  speed: 1.5, r: 10, color: '#aa6a3a', respawn: 25, aggro_r: 80,  atk_type: 'melee', count: 3 },
    { type: 'spore',     hp: 70,  atk: 5,   xp: 16, shards: 3,  speed: 0.9, r: 13, color: '#4aaa6a', respawn: 35, aggro_r: 100, atk_type: 'aoe', aoe_r: 60, aoe_dmg: 12 },

    // Tier 1 - Voidbeasts (medi, piu forti)
    { type: 'voidbeast', hp: 200, atk: 18,  xp: 40, shards: 8,  speed: 1.0, r: 22, color: '#9a5ab0', respawn: 50, aggro_r: 120, atk_type: 'melee' },
    { type: 'shrieker',  hp: 150, atk: 22,  xp: 45, shards: 9,  speed: 0.8, r: 18, color: '#d04080', respawn: 50, aggro_r: 180, atk_type: 'ranged', atk_range: 150, proj_speed: 4, proj_color: '#ff4080' },
    { type: 'charger',   hp: 250, atk: 30,  xp: 50, shards: 10, speed: 1.4, r: 20, color: '#c0a020', respawn: 55, aggro_r: 200, atk_type: 'charge', charge_dmg: 40, charge_spd: 4 },
    { type: 'lurker',    hp: 180, atk: 15,  xp: 38, shards: 7,  speed: 0.7, r: 20, color: '#2a8a6a', respawn: 45, aggro_r: 90,  atk_type: 'melee', stealth: true },

    // Tier 2 - Voidlords (grandi, molto forti)
    { type: 'voidlord',  hp: 500, atk: 35,  xp: 100, shards: 20, speed: 0.8, r: 32, color: '#c060e0', respawn: 80, aggro_r: 150, atk_type: 'melee' },
    { type: 'abominator',hp: 400, atk: 28,  xp: 90, shards: 18, speed: 0.6, r: 30, color: '#80c040', respawn: 75, aggro_r: 130, atk_type: 'aoe', aoe_r: 80, aoe_dmg: 25 },
    { type: 'harbinger', hp: 350, atk: 40,  xp: 95, shards: 16, speed: 0.9, r: 26, color: '#e04040', respawn: 70, aggro_r: 200, atk_type: 'ranged', atk_range: 200, proj_speed: 5, proj_color: '#ff6040' },
    { type: 'maw',        hp: 600, atk: 20,  xp: 110, shards: 22, speed: 0.5, r: 36, color: '#a040c0', respawn: 85, aggro_r: 120, atk_type: 'pull', pull_r: 100, pull_dmg: 15 },
    { type: 'warden',    hp: 450, atk: 32,  xp: 85, shards: 15, speed: 0.7, r: 28, color: '#4080c0', respawn: 70, aggro_r: 160, atk_type: 'melee', shield: 100 },

    // Tier 3 - Leggendari (rari, boss-like)
    { type: 'voidsentinel', hp: 800, atk: 50, xp: 200, shards: 40, speed: 0.6, r: 40, color: '#ff60a0', respawn: 120, aggro_r: 180, atk_type: 'ranged', atk_range: 250, proj_speed: 6, proj_color: '#ff80c0' },
    { type: 'colossus',  hp: 1200, atk: 45,  xp: 300, shards: 60, speed: 0.4, r: 48, color: '#c0c040', respawn: 150, aggro_r: 140, atk_type: 'aoe', aoe_r: 100, aoe_dmg: 35 },
  ];

  const BOSS = {
    type: 'aethermaw',
    hp: 3000, atk: 60, xp: 300, shards: 50, speed: 0.6, r: 50,
    x: 2400, y: 1600, spawn_time: 180, color: '#ff3060',
    special: 'expose_goals', expose_duration: 30
  };

  const ROSTER = [
    {
      id: 'galdric', name: 'Ser Galdric', subtitle: 'Lama Giurata', role: 'allrounder',
      color: '#e0c050', icon: '⚔',
      base_hp: 650, base_atk: 52, base_def: 30, base_spd: 3.0, atk_speed: 0.8, atk_range: 60,
      ab1: {
        name: 'Colpo di Lama', lv5: 'Fendente Oscuro', lv10: 'Tempesta di Lame',
        type: 'melee', base_dmg: 40, range: 80, cooldown: 3, area: false,
        upgrade5: { dmg: 55, cd: 2.5 }, upgrade10: { dmg: 75, cd: 2, area: true, area_r: 120 }
      },
      ab2: {
        name: 'Carica', lv5: 'Balzo del Giuramento', lv10: 'Impeto di Ferro',
        type: 'dash', base_dmg: 30, range: 200, cooldown: 5, dash_speed: 12,
        upgrade5: { dmg: 40, range: 250 }, upgrade10: { dmg: 55, range: 300, stun: 0.5 }
      },
      ultimate: { name: 'Rito della Lama Eterna', dmg: 200, range: 150, radius: 180, cd: 45, duration: 2 }
    },
    {
      id: 'lysa', name: 'Warden Lysa', subtitle: 'Occhio di Stella', role: 'attacker',
      color: '#50c0ff', icon: '🔭',
      base_hp: 500, base_atk: 62, base_def: 20, base_spd: 3.2, atk_speed: 0.6, atk_range: 250,
      ab1: {
        name: 'Colpo Fotonico', lv5: 'Lancia Stellare', lv10: 'Raggio di Annullamento',
        type: 'projectile', base_dmg: 50, range: 350, cooldown: 3, speed: 10,
        upgrade5: { dmg: 70, speed: 12 }, upgrade10: { dmg: 100, speed: 14, piercing: true }
      },
      ab2: {
        name: 'Mirino', lv5: 'Mira Potenziata', lv10: 'Colpo Preciso',
        type: 'buff', base_dmg: 0, range: 0, cooldown: 8, duration: 4, bonus_atk: 0.3,
        upgrade5: { bonus_atk: 0.45 }, upgrade10: { bonus_atk: 0.6, range_bonus: 80 }
      },
      ultimate: { name: 'Orrizonte di Distruzione', dmg: 280, range: 500, radius: 40, cd: 45, duration: 1.5 }
    },
    {
      id: 'kragg', name: 'Kragg', subtitle: "l'Inamovibile", role: 'defender',
      color: '#808080', icon: '🛡',
      base_hp: 900, base_atk: 35, base_def: 50, base_spd: 2.5, atk_speed: 0.6, atk_range: 55,
      ab1: {
        name: 'Scudo del Vuoto', lv5: 'Barriera Granitica', lv10: "Muro dell'Abisso",
        type: 'shield', base_dmg: 0, range: 0, cooldown: 6, shield_hp: 120, duration: 3,
        upgrade5: { shield_hp: 180 }, upgrade10: { shield_hp: 280, reflect: 0.2 }
      },
      ab2: {
        name: 'Urlo Gravitazionale', lv5: 'onda di Schianto', lv10: 'Terremoto',
        type: 'aoe', base_dmg: 30, range: 0, cooldown: 5, radius: 120, slow: 0.4,
        upgrade5: { dmg: 45, radius: 150 }, upgrade10: { dmg: 60, radius: 180, stun: 0.6 }
      },
      ultimate: { name: 'Forte del Destino', dmg: 150, range: 0, radius: 200, cd: 50, duration: 3 }
    },
    {
      id: 'mera', name: 'Sorella Mera', subtitle: 'Chirurgo del Coro', role: 'supporter',
      color: '#60e060', icon: '✚',
      base_hp: 550, base_atk: 30, base_def: 25, base_spd: 3.0, atk_speed: 0.7, atk_range: 200,
      ab1: {
        name: 'Cura del Coro', lv5: 'Benedizione Stella', lv10: 'Rinascita Divina',
        type: 'heal', base_dmg: 0, range: 250, cooldown: 5, heal: 60,
        upgrade5: { heal: 90, aoe: true, aoe_r: 100 }, upgrade10: { heal: 140, aoe: true, aoe_r: 150 }
      },
      ab2: {
        name: 'Raggio di Purificazione', lv5: 'Luce del Cenobita', lv10: 'Lama di Purità',
        type: 'projectile', base_dmg: 25, range: 300, cooldown: 4, speed: 8, purge: true,
        upgrade5: { dmg: 35 }, upgrade10: { dmg: 50, stun: 0.4 }
      },
      ultimate: { name: 'Inno della Rinascita', dmg: 0, range: 0, radius: 250, cd: 50, duration: 4, team_heal: 200 }
    },
    {
      id: 'vexa', name: 'Vexa', subtitle: 'Lama Cava', role: 'speedster',
      color: '#c040c0', icon: '🌀',
      base_hp: 450, base_atk: 55, base_def: 18, base_spd: 3.8, atk_speed: 1.0, atk_range: 50,
      ab1: {
        name: 'Affondo Vuoto', lv5: 'Taglio Dimensionale', lv10: 'Fenditura del Vuoto',
        type: 'dash', base_dmg: 45, range: 220, cooldown: 3, dash_speed: 14,
        upgrade5: { dmg: 60, range: 280 }, upgrade10: { dmg: 80, range: 350, reset: true }
      },
      ab2: {
        name: 'Fendente Mortale', lv5: 'Colpo di Ombra', lv10: 'Assassinio Perfetto',
        type: 'melee', base_dmg: 35, range: 70, cooldown: 2.5, backstab_bonus: 1.5,
        upgrade5: { dmg: 50 }, upgrade10: { dmg: 70, execute_threshold: 0.2 }
      },
      ultimate: { name: 'Danza delle Ombre', dmg: 180, range: 100, radius: 160, cd: 40, duration: 2.5 }
    },
    {
      id: 'vorn', name: 'Magister Vorn', subtitle: 'Ætermante', role: 'mage',
      color: '#a060ff', icon: '✦',
      base_hp: 480, base_atk: 45, base_def: 22, base_spd: 3.0, atk_speed: 0.5, atk_range: 220,
      ab1: {
        name: 'Palla di Ætere', lv5: "Orbe dell'Abisso", lv10: 'Supernova',
        type: 'aoe', base_dmg: 45, range: 300, cooldown: 4, radius: 100,
        upgrade5: { dmg: 65, radius: 120 }, upgrade10: { dmg: 95, radius: 160, dot: 15 }
      },
      ab2: {
        name: 'Vortice', lv5: 'Maelstrom', lv10: 'Buco Nero',
        type: 'aoe', base_dmg: 30, range: 250, cooldown: 5, radius: 130, pull: 0.5,
        upgrade5: { dmg: 45, pull: 0.7 }, upgrade10: { dmg: 65, pull: 1.0, duration: 2 }
      },
      ultimate: { name: 'Rito della Convergenza', dmg: 250, range: 0, radius: 220, cd: 48, duration: 3 }
    },
    {
      id: 'krog', name: 'Krog il Senzafreno', subtitle: 'Carne Vivente', role: 'allrounder',
      color: '#80b040', icon: '🥩',
      base_hp: 700, base_atk: 48, base_def: 35, base_spd: 2.8, atk_speed: 0.7, atk_range: 60,
      ab1: {
        name: 'Pugno Bruto', lv5: 'Colpo Genforgiato', lv10: 'Furia Primordiale',
        type: 'melee', base_dmg: 45, range: 75, cooldown: 3, area: false,
        upgrade5: { dmg: 65 }, upgrade10: { dmg: 90, knockback: 80 }
      },
      ab2: {
        name: 'Carica', lv5: 'Scatto Violento', lv10: 'Furia di Carne',
        type: 'dash', base_dmg: 35, range: 180, cooldown: 5, dash_speed: 10,
        upgrade5: { dmg: 50, range: 230 }, upgrade10: { dmg: 70, heal_on_hit: 0.2 }
      },
      ultimate: { name: 'Frenesia Bestiale', dmg: 160, range: 120, radius: 150, cd: 45, duration: 3 }
    },
    {
      id: 'elara', name: 'Sorella Elara', subtitle: 'Vegliante della Fede', role: 'defender',
      color: '#e0e050', icon: '🕯',
      base_hp: 850, base_atk: 32, base_def: 48, base_spd: 2.6, atk_speed: 0.55, atk_range: 55,
      ab1: {
        name: 'Aura di Protezione', lv5: 'Campo di Fede', lv10: 'Scudo Vivente',
        type: 'buff', base_dmg: 0, range: 0, cooldown: 7, aura: 0.15, duration: 4,
        upgrade5: { aura: 0.25 }, upgrade10: { aura: 0.35, heal_per_sec: 10 }
      },
      ab2: {
        name: 'Colpo Sacro', lv5: 'Flagello Divino', lv10: 'Giudizio',
        type: 'melee', base_dmg: 40, range: 80, cooldown: 4, chain: 1,
        upgrade5: { dmg: 55, chain: 2 }, upgrade10: { dmg: 75, chain: 3 }
      },
      ultimate: { name: 'Faro della Fede', dmg: 120, range: 0, radius: 200, cd: 50, duration: 5 }
    },
    {
      id: 'grul', name: 'Grul il Bruto', subtitle: 'Flagello della Strada', role: 'speedster',
      color: '#ff6030', icon: '🔥',
      base_hp: 500, base_atk: 50, base_def: 20, base_spd: 3.6, atk_speed: 0.9, atk_range: 55,
      ab1: {
        name: 'Carica Feroce', lv5: 'Sfondamento', lv10: 'Impeto di Fuoco',
        type: 'dash', base_dmg: 40, range: 200, cooldown: 3.5, dash_speed: 12,
        upgrade5: { dmg: 55, range: 260 }, upgrade10: { dmg: 75, range: 320, ignite: 10 }
      },
      ab2: {
        name: 'Fendente Rotante', lv5: 'Turbine di Lame', lv10: 'Trivella di Sangue',
        type: 'aoe', base_dmg: 30, range: 0, cooldown: 4, radius: 100,
        upgrade5: { dmg: 45, radius: 130 }, upgrade10: { dmg: 65, radius: 160 }
      },
      ultimate: { name: 'Ira della Cremazione', dmg: 200, range: 130, radius: 170, cd: 42, duration: 2 }
    },
    {
      id: 'ilyr', name: 'Ilyr', subtitle: 'Cacciatrice del Vuoto', role: 'speedster',
      color: '#5050a0', icon: '🌙',
      base_hp: 420, base_atk: 52, base_def: 16, base_spd: 4.0, atk_speed: 1.1, atk_range: 55,
      ab1: {
        name: 'Taglio Crescente', lv5: 'Falce della Luna', lv10: 'Eclissi Mortale',
        type: 'dash', base_dmg: 42, range: 240, cooldown: 3, dash_speed: 14,
        upgrade5: { dmg: 58, range: 300 }, upgrade10: { dmg: 80, range: 360, reset: true }
      },
      ab2: {
        name: 'Ombra Residua', lv5: 'Fenditura Ombrale', lv10: 'Passo nel Vuoto',
        type: 'shadow', base_dmg: 25, range: 0, cooldown: 6, duration: 3, slow: 0.3,
        upgrade5: { dmg: 35, duration: 4 }, upgrade10: { dmg: 50, duration: 5, stun: 0.4 }
      },
      ultimate: { name: 'Danza delle Lune Cadenti', dmg: 190, range: 120, radius: 160, cd: 40, duration: 2.5 }
    },
    {
      id: 'xan', name: 'Magister Xan', subtitle: 'Artefice del Vuoto', role: 'mage',
      color: '#a0a040', icon: '⚙',
      base_hp: 460, base_atk: 40, base_def: 24, base_spd: 2.8, atk_speed: 0.5, atk_range: 200,
      ab1: {
        name: 'Raggio Concentrato', lv5: 'Cannone Gravitazionale', lv10: 'Fucilata Cosmica',
        type: 'projectile', base_dmg: 48, range: 380, cooldown: 3.5, speed: 11,
        upgrade5: { dmg: 68, speed: 13 }, upgrade10: { dmg: 95, speed: 15, piercing: true }
      },
      ab2: {
        name: 'Dispositivo Esplosivo', lv5: 'Torretta Automatica', lv10: 'Batteria d\'Assedio',
        type: 'turret', base_dmg: 15, range: 200, cooldown: 10, turret_hp: 150, turret_dps: 12, turret_duration: 10,
        upgrade5: { turret_hp: 220, turret_dps: 18 }, upgrade10: { turret_hp: 300, turret_dps: 28, turret_count: 2 }
      },
      ultimate: { name: 'Sovraccarico Totale', dmg: 240, range: 0, radius: 200, cd: 48, duration: 3 }
    },
    {
      id: 'seraphina', name: 'Seraphina', subtitle: 'Custode del Sogno', role: 'supporter',
      color: '#d0a0d0', icon: '🔔',
      base_hp: 520, base_atk: 28, base_def: 22, base_spd: 3.0, atk_speed: 0.65, atk_range: 200,
      ab1: {
        name: 'Campana terapeutica', lv5: 'Melodia della Luce', lv10: 'Inno della Rinascita',
        type: 'heal', base_dmg: 0, range: 280, cooldown: 5, heal: 70, aoe: true, aoe_r: 120,
        upgrade5: { heal: 100, aoe_r: 150 }, upgrade10: { heal: 150, aoe_r: 200, clean: true }
      },
      ab2: {
        name: 'Sogno Condiviso', lv5: 'Rêverie', lv10: 'Incubo Collettivo',
        type: 'aoe_buff', base_dmg: 0, range: 0, cooldown: 8, speed_boost: 0.3, atk_boost: 0.2, duration: 4,
        upgrade5: { speed_boost: 0.4, atk_boost: 0.3 }, upgrade10: { speed_boost: 0.5, atk_boost: 0.4, duration: 5 }
      },
      ultimate: { name: 'Sinfonia dell\'Anima', dmg: 0, range: 0, radius: 280, cd: 50, duration: 5, team_heal: 180 }
    },
    {
      id: 'grim', name: 'Grim', subtitle: 'Il Collezionista', role: 'defender',
      color: '#7a7a7a', icon: '⛓',
      base_hp: 880, base_atk: 38, base_def: 45, base_spd: 2.4, atk_speed: 0.5, atk_range: 180,
      ab1: {
        name: 'Lancio Ancora', lv5: 'Catena del Destino', lv10: 'Abbraccio del Vuoto',
        type: 'hook', base_dmg: 30, range: 250, cooldown: 5, pull: true,
        upgrade5: { dmg: 45, range: 300 }, upgrade10: { dmg: 60, range: 350, stun: 0.6 }
      },
      ab2: {
        name: 'Ancore Pesanti', lv5: 'Pioggia di Ferro', lv10: 'Tempesta di Catene',
        type: 'aoe', base_dmg: 35, range: 0, cooldown: 6, radius: 140, slow: 0.5,
        upgrade5: { dmg: 50, radius: 170 }, upgrade10: { dmg: 70, radius: 200, pull: 0.3 }
      },
      ultimate: { name: 'Prigione delle Anime', dmg: 130, range: 0, radius: 220, cd: 50, duration: 4 }
    },
    {
      id: 'vex_eng', name: 'Vex', subtitle: 'Ingegnere Esiliato', role: 'attacker',
      color: '#40a040', icon: '🔧',
      base_hp: 480, base_atk: 55, base_def: 22, base_spd: 3.1, atk_speed: 0.7, atk_range: 220,
      ab1: {
        name: 'Colpo Preciso', lv5: 'Raggio Penetrante', lv10: 'Sovraccarico Mortale',
        type: 'projectile', base_dmg: 52, range: 350, cooldown: 3, speed: 12,
        upgrade5: { dmg: 72, speed: 14 }, upgrade10: { dmg: 100, speed: 16, execute: 0.25 }
      },
      ab2: {
        name: 'Granata EMP', lv5: 'Impulso Elettrico', lv10: 'Tempesta Magnetica',
        type: 'aoe', base_dmg: 35, range: 280, cooldown: 6, radius: 120, slow: 0.4,
        upgrade5: { dmg: 50, radius: 150 }, upgrade10: { dmg: 70, radius: 180, disarm: 2 }
      },
      ultimate: { name: 'Sovraccarico d\'Ingegno', dmg: 220, range: 400, radius: 60, cd: 45, duration: 2 }
    },
    {
      id: 'nyx', name: 'Nyx', subtitle: 'Predatrice Ombra', role: 'speedster',
      color: '#3a3a6a', icon: '🌑',
      base_hp: 430, base_atk: 58, base_def: 15, base_spd: 3.9, atk_speed: 1.2, atk_range: 45,
      ab1: {
        name: 'Artigli del Vuoto', lv5: 'Fendenti Ombrosi', lv10: 'Lama dell\'Oblio',
        type: 'melee', base_dmg: 48, range: 70, cooldown: 2.5, backstab_bonus: 1.6,
        upgrade5: { dmg: 65, backstab_bonus: 1.8 }, upgrade10: { dmg: 85, backstab_bonus: 2.0, execute: 0.2 }
      },
      ab2: {
        name: 'Mimetismo', lv5: 'Invisibilità Perfetta', lv10: 'Passo Spettrale',
        type: 'stealth', base_dmg: 0, range: 0, cooldown: 8, duration: 3, speed_boost: 0.3,
        upgrade5: { duration: 4 }, upgrade10: { duration: 5, speed_boost: 0.5, next_atk_bonus: 1.5 }
      },
      ultimate: { name: 'Razzio dell\'Ombra', dmg: 200, range: 100, radius: 140, cd: 40, duration: 2 }
    },
    {
      id: 'voss', name: 'Chirurgo Voss', subtitle: 'Mastro Meccanico', role: 'supporter',
      color: '#a07a4a', icon: '🩺',
      base_hp: 540, base_atk: 30, base_def: 28, base_spd: 2.9, atk_speed: 0.7, atk_range: 180,
      ab1: {
        name: 'Trapano Medico', lv5: 'Riparazione Avanzata', lv10: 'Saldatura Vitale',
        type: 'heal', base_dmg: 0, range: 200, cooldown: 4, heal: 80,
        upgrade5: { heal: 120 }, upgrade10: { heal: 180, shield: 60 }
      },
      ab2: {
        name: 'Trapano da Combattimento', lv5: 'Foratura Profonda', lv10: 'Perforatore di Fuoco',
        type: 'melee', base_dmg: 35, range: 70, cooldown: 3.5, armor_break: 0.2,
        upgrade5: { dmg: 50, armor_break: 0.3 }, upgrade10: { dmg: 70, armor_break: 0.4, dot: 12 }
      },
      ultimate: { name: 'Intervento d\'Emergenza', dmg: 0, range: 0, radius: 250, cd: 50, duration: 4, team_heal: 220 }
    },
    {
      id: 'zara', name: 'Zara', subtitle: 'Esploratrice Void', role: 'attacker',
      color: '#4a7ac0', icon: '🔫',
      base_hp: 470, base_atk: 50, base_def: 20, base_spd: 3.2, atk_speed: 0.8, atk_range: 230,
      ab1: {
        name: 'Raffica', lv5: 'Raffica Devastante', lv10: 'Pioggia di Fuoco',
        type: 'burst', base_dmg: 20, range: 300, cooldown: 3, burst_count: 3, burst_delay: 0.15,
        upgrade5: { dmg: 28, burst_count: 4 }, upgrade10: { dmg: 38, burst_count: 5, piercing: true }
      },
      ab2: {
        name: 'Granata Fumogena', lv5: 'Nube Corrosiva', lv10: 'Tempesta Atomica',
        type: 'aoe', base_dmg: 30, range: 280, cooldown: 5, radius: 130, slow: 0.35,
        upgrade5: { dmg: 45, radius: 160 }, upgrade10: { dmg: 65, radius: 190, dot: 10 }
      },
      ultimate: { name: 'Fuoco Concentrato', dmg: 250, range: 350, radius: 80, cd: 45, duration: 2 }
    }
  ];

  const MATCH_DURATION = 300;
  const DOUBLE_POINT_TIME = 60;
  const BOSS_SPAWN_TIME = 180;
  const CHANNEL_TIME = 1.2;
  const CHANNEL_INTERRUPTED_SHARD_LOSS = 0.5;
  const RESPAWN_BASE = 5;
  const RESPAWN_PER_LEVEL = 0.8;
  const XP_DECAY_DISTANCE = 800;
  const MAX_SHARDS_CARRIED = 50;
  const SHIELD_ON_SCORE = 80;
  const SHIELD_DURATION = 3;
  const LEVEL_UP_THRESHOLD = 100;

  return { MAP, BASES, GOALS, CREEPS, BOSS, ROSTER, MATCH_DURATION, DOUBLE_POINT_TIME, BOSS_SPAWN_TIME,
           CHANNEL_TIME, CHANNEL_INTERRUPTED_SHARD_LOSS, RESPAWN_BASE, RESPAWN_PER_LEVEL,
           XP_DECAY_DISTANCE, MAX_SHARDS_CARRIED, SHIELD_ON_SCORE, SHIELD_DURATION, LEVEL_UP_THRESHOLD };
})();

if (typeof module !== 'undefined') module.exports = VOIDBOUND;
