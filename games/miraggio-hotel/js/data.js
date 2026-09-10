/* ============================================================
   MIRAGGIO HOTEL — dati: stanze, ospiti, battute, storie,
   missioni, minigiochi e guardaroba
   ============================================================ */
(function () {
  "use strict";
  const G = {
    startCoins: 60,

    skins: ["#ffe0bd", "#f2c9a0", "#eab98a", "#c68b59", "#8d5a2b"],
    hairColors: ["#4a2a14", "#2b1b0e", "#d9a441", "#c0392b", "#8e44ad", "#2c3e50", "#7f8c8d", "#ecf0f1"],
    tops: ["#ff5d9e", "#5b3bd6", "#00c9b7", "#ff8f3c", "#3ddc97", "#e84f8a", "#4ea8ff", "#ffd166"],
    pants: ["#3a2a8f", "#1f3b73", "#7b2d8b", "#c2185b", "#0b7285", "#37474f"],

    rooms: {
      atrio: {
        name: "Atrio del Miraggio", emoji: "🏨", hint: "la reception · dove tutto comincia",
        x: 0, y: 0,
        w: 700, h: 440, walkTop: 96,
        floor1: "#ffe6cc", floor2: "#ffd9b3", wall: "#ff8fb0",
        bots: ["lola", "pino"],
        furniture: [
          { x: 90, y: 120, e: "🖥️", s: 46 },
          { x: 150, y: 130, e: "🛎️", s: 44 },
          { x: 250, y: 110, e: "🪴", s: 40 },
          { x: 430, y: 110, e: "🛋️", s: 78 },
          { x: 560, y: 130, e: "🪟", s: 60 },
          { x: 330, y: 330, e: "🧳", s: 42, xl: true },
          { x: 470, y: 320, e: "🌴", s: 74 },
          { x: 120, y: 340, e: "🗝️", s: 36, xl: true }
        ]
      },
      sala_giochi: {
        name: "Sala Giochi", emoji: "🕹️", hint: "retro e arcade, record da battere",
        x: 1, y: 0,
        w: 700, h: 440, walkTop: 96,
        floor1: "#d7f6ff", floor2: "#c2ecfa", wall: "#67d5f5",
        bots: ["leo", "guest2"],
        furniture: [
          { x: 100, y: 120, e: "🕹️", s: 52, xl: true },
          { x: 240, y: 120, e: "👾", s: 46, xl: true },
          { x: 430, y: 110, e: "📺", s: 54, xl: true },
          { x: 570, y: 130, e: "🎯", s: 46, xl: true },
          { x: 130, y: 330, e: "🧸", s: 46 },
          { x: 300, y: 340, e: "🪙", s: 34, xl: true },
          { x: 520, y: 330, e: "🛋️", s: 70 }
        ]
      },
      piscina: {
        name: "Piscina", emoji: "🏊", hint: "tuffi, galleggianti e succo di ananas",
        x: 2, y: 0,
        w: 700, h: 440, walkTop: 96,
        floor1: "#ccf3ff", floor2: "#b8e9ff", wall: "#40c4ff",
        bots: ["rigo"],
        furniture: [
          { x: 330, y: 240, e: "🏊", s: 150 },
          { x: 200, y: 120, e: "🌴", s: 64 },
          { x: 520, y: 130, e: "🛟", s: 50, xl: true },
          { x: 110, y: 320, e: "⛱️", s: 54 },
          { x: 260, y: 350, e: "🍹", s: 38, xl: true },
          { x: 470, y: 340, e: "🧴", s: 36, xl: true }
        ]
      },
      discoteca: {
        name: "Discoteca", emoji: "🪩", hint: "il sabato sera è ogni sera",
        x: 0, y: 1,
        w: 700, h: 440, walkTop: 96,
        floor1: "#e6d5ff", floor2: "#dcc6ff", wall: "#b06aff",
        bots: ["max"],
        furniture: [
          { x: 110, y: 120, e: "🎛️", s: 66, xl: true },
          { x: 300, y: 110, e: "🪩", s: 70 },
          { x: 520, y: 130, e: "🎤", s: 50, xl: true },
          { x: 170, y: 330, e: "🕺", s: 44 },
          { x: 360, y: 340, e: "✨", s: 36, xl: true },
          { x: 550, y: 330, e: "🍾", s: 42, xl: true }
        ]
      },
      giardino: {
        name: "Giardino", emoji: "🌷", hint: "fiori, api e pisolini al sole",
        x: 1, y: 1,
        w: 700, h: 440, walkTop: 96,
        floor1: "#dff5c9", floor2: "#d2efb8", wall: "#7ed957",
        bots: ["nina", "guest1"],
        furniture: [
          { x: 90, y: 120, e: "🌸", s: 46 },
          { x: 260, y: 110, e: "🌳", s: 86 },
          { x: 500, y: 120, e: "🌻", s: 48 },
          { x: 620, y: 150, e: "🦋", s: 40 },
          { x: 160, y: 330, e: "🧺", s: 46, xl: true },
          { x: 400, y: 350, e: "🪑", s: 40 },
          { x: 580, y: 330, e: "🪻", s: 40 }
        ]
      },
      bar: {
        name: "Bar dello Spritz", emoji: "🍹", hint: "spritz, patatine e pettegolezzi",
        x: 2, y: 1,
        w: 700, h: 440, walkTop: 96,
        floor1: "#ffe8cf", floor2: "#ffdcb8", wall: "#ff9f43",
        bots: ["gigi"],
        furniture: [
          { x: 100, y: 110, e: "🍕", s: 46 },
          { x: 210, y: 130, e: "🥤", s: 40 },
          { x: 330, y: 115, e: "🍹", s: 52, xl: true },
          { x: 470, y: 130, e: "🍩", s: 44 },
          { x: 150, y: 330, e: "🪑", s: 42 },
          { x: 340, y: 340, e: "🪑", s: 42 },
          { x: 540, y: 330, e: "🎰", s: 50, xl: true }
        ]
      },
      terrazza: {
        name: "Terrazza delle stelle", emoji: "🌌", hint: "la notte qui non finisce mai",
        x: 0, y: 2,
        w: 700, h: 440, walkTop: 96,
        floor1: "#2a2a5e", floor2: "#23234f", wall: "#4a3f9e",
        bots: ["stella", "tino"],
        furniture: [
          { x: 100, y: 120, e: "🔭", s: 54, xl: true },
          { x: 260, y: 110, e: "🌙", s: 60 },
          { x: 470, y: 115, e: "✨", s: 40 },
          { x: 590, y: 150, e: "🛋️", s: 70 },
          { x: 150, y: 330, e: "🧺", s: 44 },
          { x: 360, y: 340, e: "📷", s: 40, xl: true },
          { x: 540, y: 330, e: "🎇", s: 44, xl: true }
        ]
      },
      camera: {
        name: "Room Builder", emoji: "🏗️", hint: "progetta, personalizza e condividi la tua stanza",
        x: 1, y: 2,
        w: 700, h: 440, walkTop: 96,
        floor1: "#e8e0ff", floor2: "#ded4ff", wall: "#9d8cff",
        bots: [],
        furniture: [
          { x: 620, y: 130, e: "🪟", s: 60 },
          { x: 120, y: 330, e: "🚪", s: 54 },
          { x: 340, y: 115, e: "💡", s: 34 }
        ],
        slots: [
          { x: 130, y: 160 }, { x: 260, y: 160 }, { x: 390, y: 160 }, { x: 520, y: 160 },
          { x: 130, y: 260 }, { x: 260, y: 260 }, { x: 390, y: 260 }, { x: 520, y: 260 },
          { x: 130, y: 360 }, { x: 260, y: 360 }, { x: 390, y: 360 }, { x: 520, y: 360 }
        ]
      },
      cucina: {
        name: "Cucina del Miraggio", emoji: "🍳", hint: "qui le ricette sono segrete (tranne una)",
        x: 2, y: 2,
        w: 700, h: 440, walkTop: 96,
        floor1: "#fff2e0", floor2: "#ffe9cf", wall: "#ffb86c",
        bots: ["sergio"],
        furniture: [
          { x: 90, y: 115, e: "🍳", s: 50, xl: true },
          { x: 210, y: 120, e: "🥘", s: 54, xl: true },
          { x: 330, y: 110, e: "🔪", s: 40 },
          { x: 470, y: 130, e: "🥖", s: 46 },
          { x: 590, y: 130, e: "🧁", s: 42, xl: true },
          { x: 130, y: 330, e: "🧑‍🍳", s: 44 },
          { x: 300, y: 340, e: "🍝", s: 42, xl: true },
          { x: 500, y: 330, e: "🧺", s: 44 }
        ]
      },
      stanza_segreta: {
        name: "Stanza Segreta", emoji: "🔐", hint: "solo i detective possono entrare...",
        x: 3, y: 0,
        hidden: true,
        w: 700, h: 440, walkTop: 96,
        floor1: "#1a1a2e", floor2: "#16213e", wall: "#0f3460",
        bots: [],
        furniture: [
          { x: 100, y: 120, e: "🔍", s: 48, xl: true },
          { x: 250, y: 130, e: "📜", s: 44 },
          { x: 400, y: 115, e: "🗝️", s: 40 },
          { x: 550, y: 125, e: "💎", s: 46, xl: true },
          { x: 170, y: 320, e: "🎭", s: 42 },
          { x: 350, y: 330, e: "📖", s: 44, xl: true },
          { x: 520, y: 310, e: "🕯️", s: 38 }
        ]
      },
      sotterraneo: {
        name: "Il Sotterraneo", emoji: "🌑", hint: "solo i soci pieni possono entrare...",
        x: 3, y: 1,
        hidden: true,
        w: 700, h: 440, walkTop: 96,
        floor1: "#0a0a1a", floor2: "#0f0f2a", wall: "#1a1a3a",
        bots: ["ombra", "veil", "erica"],
        furniture: [
          { x: 100, y: 120, e: "🗡️", s: 48, xl: true },
          { x: 250, y: 130, e: "💀", s: 44 },
          { x: 400, y: 115, e: "🔮", s: 40 },
          { x: 550, y: 125, e: "🗝️", s: 46, xl: true },
          { x: 170, y: 320, e: "🕯️", s: 42 },
          { x: 350, y: 330, e: "📜", s: 44, xl: true },
          { x: 520, y: 310, e: "💎", s: 38 }
        ],
        slots: [
          { x: 130, y: 160 }, { x: 260, y: 160 }, { x: 390, y: 160 }, { x: 520, y: 160 },
          { x: 130, y: 260 }, { x: 260, y: 260 }, { x: 390, y: 260 }, { x: 520, y: 260 },
          { x: 130, y: 360 }, { x: 260, y: 360 }, { x: 390, y: 360 }, { x: 520, y: 360 }
        ]
      },
      /* ==================== DIMENSIONI PARALLELE: STANZE ==================== */
      atrio_dark: {
        name: "Atrio Oscuro", emoji: "🌑", hint: "la reception dell'oscurità · dove le ombre parlano",
        x: 4, y: 0,
        w: 700, h: 440, walkTop: 96,
        floor1: "#1a1a2e", floor2: "#12122a", wall: "#2a1a4e",
        bots: ["lola_dark", "pino_dark"],
        furniture: [
          { x: 90, y: 120, e: "🕯️", s: 46 },
          { x: 150, y: 130, e: "📜", s: 44 },
          { x: 250, y: 110, e: "👁️", s: 40 },
          { x: 430, y: 110, e: "🪦", s: 78 },
          { x: 560, y: 130, e: "🌑", s: 60 },
          { x: 330, y: 330, e: "🔮", s: 42, xl: true },
          { x: 470, y: 320, e: "💀", s: 74 },
          { x: 120, y: 340, e: "⛓️", s: 36, xl: true }
        ]
      },
      atrio_neon: {
        name: "Atrio Neon", emoji: "💜", hint: "la reception ciberpunk · dove i dati fluiscono",
        x: 4, y: 1,
        w: 700, h: 440, walkTop: 96,
        floor1: "#0d0d2b", floor2: "#0a0a3a", wall: "#1a0a3e",
        bots: ["lola_neon", "pino_neon"],
        furniture: [
          { x: 90, y: 120, e: "📡", s: 46 },
          { x: 150, y: 130, e: "💾", s: 44 },
          { x: 250, y: 110, e: "🔌", s: 40 },
          { x: 430, y: 110, e: "💻", s: 78 },
          { x: 560, y: 130, e: "📺", s: 60 },
          { x: 330, y: 330, e: "🎛️", s: 42, xl: true },
          { x: 470, y: 320, e: "📡", s: 74 },
          { x: 120, y: 340, e: "⚡", s: 36, xl: true }
        ]
      },
      atrio_steam: {
        name: "Atrio Steampunk", emoji: "⚙️", hint: "la reception vittoriana · ingranaggi e vapori",
        x: 4, y: 2,
        w: 700, h: 440, walkTop: 96,
        floor1: "#3d2b1f", floor2: "#2e1f14", wall: "#5c3d2e",
        bots: ["lola_steam", "pino_steam"],
        furniture: [
          { x: 90, y: 120, e: "⚙️", s: 46 },
          { x: 150, y: 130, e: "🔩", s: 44 },
          { x: 250, y: 110, e: "🕰️", s: 40 },
          { x: 430, y: 110, e: "🔧", s: 78 },
          { x: 560, y: 130, e: "🏭", s: 60 },
          { x: 330, y: 330, e: "⚙️", s: 42, xl: true },
          { x: 470, y: 320, e: "⛓️", s: 74 },
          { x: 120, y: 340, e: "🔮", s: 36, xl: true }
        ]
      },
      sala_giochi_dark: {
        name: "Sala Giochi Oscura", emoji: "💀", hint: "retro horror, game over è reale",
        x: 5, y: 0,
        w: 700, h: 440, walkTop: 96,
        floor1: "#0f0f1a", floor2: "#080814", wall: "#1a1030",
        bots: ["leo_dark", "guest2_dark"],
        furniture: [
          { x: 100, y: 120, e: "💀", s: 52, xl: true },
          { x: 240, y: 120, e: "🧟", s: 46, xl: true },
          { x: 430, y: 110, e: "🔮", s: 54, xl: true },
          { x: 570, y: 130, e: "⚰️", s: 46, xl: true },
          { x: 130, y: 330, e: "🩸", s: 46 },
          { x: 300, y: 340, e: "🕸️", s: 34, xl: true },
          { x: 520, y: 330, e: "🪦", s: 70 }
        ]
      },
      sala_giochi_neon: {
        name: "Sala Giochi Neon", emoji: "🎮", hint: "arcade cyberpunk, alta tensione",
        x: 5, y: 1,
        w: 700, h: 440, walkTop: 96,
        floor1: "#0a0a2e", floor2: "#05051a", wall: "#0a0a4e",
        bots: ["leo_neon", "guest2_neon"],
        furniture: [
          { x: 100, y: 120, e: "🕹️", s: 52, xl: true },
          { x: 240, y: 120, e: "🎮", s: 46, xl: true },
          { x: 430, y: 110, e: "💻", s: 54, xl: true },
          { x: 570, y: 130, e: "📡", s: 46, xl: true },
          { x: 130, y: 330, e: "⚡", s: 46 },
          { x: 300, y: 340, e: "🎯", s: 34, xl: true },
          { x: 520, y: 330, e: "🔌", s: 70 }
        ]
      },
      sala_giochi_steam: {
        name: "Sala Giochi Steampunk", emoji: "🎰", hint: "macchine a vapore, giochi meccanici",
        x: 5, y: 2,
        w: 700, h: 440, walkTop: 96,
        floor1: "#2e1f14", floor2: "#1f140e", wall: "#4a3520",
        bots: ["leo_steam", "guest2_steam"],
        furniture: [
          { x: 100, y: 120, e: "🎰", s: 52, xl: true },
          { x: 240, y: 120, e: "⚙️", s: 46, xl: true },
          { x: 430, y: 110, e: "🔧", s: 54, xl: true },
          { x: 570, y: 130, e: "🏭", s: 46, xl: true },
          { x: 130, y: 330, e: "🔩", s: 46 },
          { x: 300, y: 340, e: "🔩", s: 34, xl: true },
          { x: 520, y: 330, e: "🔧", s: 70 }
        ]
      },
      discoteca_dark: {
        name: "Discoteca Oscura", emoji: "💀", hint: "il sabato sera è ogni sera… di paura",
        x: 6, y: 0,
        w: 700, h: 440, walkTop: 96,
        floor1: "#12101a", floor2: "#0a0814", wall: "#1e152e",
        bots: ["max_dark"],
        furniture: [
          { x: 110, y: 120, e: "🎭", s: 66, xl: true },
          { x: 300, y: 110, e: "💀", s: 70 },
          { x: 520, y: 130, e: "🦇", s: 50, xl: true },
          { x: 170, y: 330, e: "🕯️", s: 44 },
          { x: 360, y: 340, e: "🕸️", s: 36, xl: true },
          { x: 550, y: 330, e: "🔮", s: 42, xl: true }
        ]
      },
      discoteca_neon: {
        name: "Discoteca Neon", emoji: "💜", hint: "il sabato sera è cyberpunk",
        x: 6, y: 1,
        w: 700, h: 440, walkTop: 96,
        floor1: "#0a0020", floor2: "#050015", wall: "#150035",
        bots: ["max_neon"],
        furniture: [
          { x: 110, y: 120, e: "💡", s: 66, xl: true },
          { x: 300, y: 110, e: "🎆", s: 70 },
          { x: 520, y: 130, e: "🌈", s: 50, xl: true },
          { x: 170, y: 330, e: "⚡", s: 44 },
          { x: 360, y: 340, e: "📡", s: 36, xl: true },
          { x: 550, y: 330, e: "🎛️", s: 42, xl: true }
        ]
      },
      discoteca_steam: {
        name: "Discoteca Steampunk", emoji: "🎻", hint: "il sabato sera è vittoriano",
        x: 6, y: 2,
        w: 700, h: 440, walkTop: 96,
        floor1: "#1f1508", floor2: "#151005", wall: "#3a2a18",
        bots: ["max_steam"],
        furniture: [
          { x: 110, y: 120, e: "🎻", s: 66, xl: true },
          { x: 300, y: 110, e: "🎹", s: 70 },
          { x: 520, y: 130, e: "🪗", s: 50, xl: true },
          { x: 170, y: 330, e: "⚙️", s: 44 },
          { x: 360, y: 340, e: "🔧", s: 36, xl: true },
          { x: 550, y: 330, e: "🏭", s: 42, xl: true }
        ]
      },
      terrazza_dark: {
        name: "Terrazza delle Ombre", emoji: "🌑", hint: "la notte qui non finisce mai… e non inizia",
        x: 7, y: 0,
        w: 700, h: 440, walkTop: 96,
        floor1: "#0a0a15", floor2: "#050510", wall: "#151025",
        bots: ["stella_dark", "tino_dark"],
        furniture: [
          { x: 100, y: 120, e: "🔮", s: 54, xl: true },
          { x: 260, y: 110, e: "🗝️", s: 60 },
          { x: 470, y: 115, e: "👁️", s: 40 },
          { x: 590, y: 150, e: "🕯️", s: 70 },
          { x: 150, y: 330, e: "⛓️", s: 44 },
          { x: 360, y: 340, e: "🌑", s: 40, xl: true },
          { x: 540, y: 330, e: "🕸️", s: 44, xl: true }
        ]
      },
      terrazza_neon: {
        name: "Terrazza Neon", emoji: "💜", hint: "la notte è luminosa… troppo luminosa",
        x: 7, y: 1,
        w: 700, h: 440, walkTop: 96,
        floor1: "#050015", floor2: "#030010", wall: "#100030",
        bots: ["stella_neon", "tino_neon"],
        furniture: [
          { x: 100, y: 120, e: "📡", s: 54, xl: true },
          { x: 260, y: 110, e: "💡", s: 60 },
          { x: 470, y: 115, e: "🔌", s: 40 },
          { x: 590, y: 150, e: "📺", s: 70 },
          { x: 150, y: 330, e: "⚡", s: 44 },
          { x: 360, y: 340, e: "🎨", s: 40, xl: true },
          { x: 540, y: 330, e: "🎆", s: 44, xl: true }
        ]
      },
      terrazza_steam: {
        name: "Terrazza Vittoriana", emoji: "⚙️", hint: "il cielo è di rame e vapore",
        x: 7, y: 2,
        w: 700, h: 440, walkTop: 96,
        floor1: "#1a1208", floor2: "#120e05", wall: "#2a1e10",
        bots: ["stella_steam", "tino_steam"],
        furniture: [
          { x: 100, y: 120, e: "🔧", s: 54, xl: true },
          { x: 260, y: 110, e: "🏭", s: 60 },
          { x: 470, y: 115, e: "🗺️", s: 40 },
          { x: 590, y: 150, e: "⚙️", s: 70 },
          { x: 150, y: 330, e: "🔩", s: 44 },
          { x: 360, y: 340, e: "⚙️", s: 40, xl: true },
          { x: 540, y: 330, e: "🔧", s: 44, xl: true }
        ]
      },
    },

    /* ==================== BOT DIMENSIONALI ==================== */
    bots: {
      lola: {
        name: "Lola", role: "receptionist", emoji: "💁‍♀️", skin: "#eab98a", hair: "#ff5d9e", hairStyle: 2, top: "#5b3bd6", pants: "#1f3b73", acc: null,
        greet: [
          "Benvenut* al Miraggio! Le chiavi della felicità sono al bancone 🗝️",
          "Nuovi arrivi! Avevo già preparato l’ombrello di confetti 🎊",
          "La tua stanza è la numero… una qualsiasi, sono tutte allegre qui!",
          "Qui il check-in è veloce: firmi col sorriso, paghi in risate 😄"
        ],
        ambient: [
          "📞 *squillo* … “Miraggio Hotel, dove ogni rumore è benvenuto!”",
          "Sto lucidando la targa “Hotel più colorato della rete”.",
          "Mi raccomando: niente scorciatoie, i corridoi sono un labirinto di gioia!"
        ]
      },
      pino: {
        name: "Pino", role: "ospite in attesa", emoji: "🧳", skin: "#f2c9a0", hair: "#7f8c8d", hairStyle: 1, top: "#37474f", pants: "#37474f", acc: "glasses",
        greet: [
          "Aspetto il mio trolley dal 2003. Il reception dice che è “in viaggio di formazione” 🧳",
          "Psst… qui le piante parlano. Quella in vaso mi ha già dato 3 consigli di vita.",
          "Io sono solo di passaggio. Come quel telefono che squilla e non c’è mai nessuno.",
          "Il wifi del Miraggio è così veloce che i messaggi arrivano prima che li scrivi."
        ],
        ambient: [
          "🧳 *apre la valigia* … c’è solo un costume da bagno e un dizionario di emoji.",
          "Dicono che al terzo giorno trovi la stanza segreta… io cerco dal 2003.",
          "Nota a me stesso: comprare un’altra valigia, questa ha nostalgia di casa."
        ]
      },
      leo: {
        name: "Leo", role: "game master", emoji: "🎮", skin: "#ffd9b3", hair: "#2c3e50", hairStyle: 0, top: "#3ddc97", pants: "#2c3e50", acc: "headphones",
        greet: [
          "Il record del Miraggio è 9.999 punti a Space Blaster. A te la sfida 🕹️",
          "Qui il livello più duro è “restare seri per 10 secondi”. Nessuno c’è mai riuscito.",
          "Ho nascosto un uovo di Pasqua in sala. No, non è quello del pavimento.",
          "Gamer da 20 anni: l’unico lag che temo è quello dell’ascensore del bar."
        ],
        ambient: [
          "🕹️ *tap tap tap* … nuovo record personale di sbadigli!",
          "Il joystick è caldo: segno che ci stiamo divertendo.",
          "Se senti 8-bit, sono io che ricarico il morale."
        ]
      },
      guest2: {
        name: "Bibi", role: "ospite da record", emoji: "🦄", skin: "#ffe0bd", hair: "#d9a441", hairStyle: 3, top: "#ff8f3c", pants: "#c2185b", acc: "crown",
        greet: [
          "Io sono entrata qui con 0 monete e ora sono una leggenda. La storia non lo conferma, ma vabbè 🦄",
          "Il mio record? 47 emote in un minuto. I polsi ne parlano ancora.",
          "Il segreto del Miraggio: ballare come se nessuno guardasse. Tutti guardano. Ballo.",
          "Ho finito le batterie del costume da unicorno. Questa è la versione risparmio."
        ],
        ambient: [
          "✨ *brilla* … oggi brillo anche senza lampadario.",
          "Sto collezionando sguardi confusi. Già 12.",
          "Unicorni veri non esistono… eccetto il lunedì."
        ]
      },
      rigo: {
        name: "Rigo", role: "bagnino", emoji: "🩳", skin: "#c68b59", hair: "#2b1b0e", hairStyle: 0, top: "#ff5d5d", pants: "#1f3b73", acc: "cap",
        greet: [
          "Acqua alta 120 cm di allegria. Tuffi consentiti solo col sorriso 🤿",
          "Regola n.1: niente corse. Regola n.2: i galleggianti a forma di fenicottero si rispettano.",
          "Non serve il fischietto: qui l’unico pericolo è la mancanza di patatine.",
          "Ho visto un tuffo da 10 punti… poi ho scoperto che era un gabbiano."
        ],
        ambient: [
          "🛟 *fischia* … qualcuno si è tuffato col telefono in mano. Coraggio.",
          "Conto i galleggianti: 1 fenicottero, 1 ciambella, 3 sospiri felici.",
          "L’acqua oggi è così limpida che si vede il fondo della gentilezza."
        ]
      },
      max: {
        name: "Max", role: "dj", emoji: "🎧", skin: "#f2c9a0", hair: "#8e44ad", hairStyle: 1, top: "#2c3e50", pants: "#7b2d8b", acc: "headphones",
        greet: [
          "Ciao! Preparati: qui il volume è al 100% di simpatia 🔊",
          "Stasera la playlist è “Balli improvvisi in corridoio” — tutto esaurito.",
          "Il mio mixer ha un tasto segreto che aggiunge confetti a ogni canzone. Non dirlo a nessuno.",
          "Balla come se fossi in un video musicale degli anni 80. Con i colori del 2025."
        ],
        ambient: [
          "🎧 *wobble wobble* … bassi di simpatia in arrivo.",
          "Mixaggio… 50% ritmo, 50% risate.",
          "Questa canzone l’ho composta con la tastiera della reception."
        ]
      },
      nina: {
        name: "Nina", role: "fioraia", emoji: "🌻", skin: "#ffe0bd", hair: "#ecf0f1", hairStyle: 2, top: "#7ed957", pants: "#0b7285", acc: null,
        greet: [
          "Ciao! Ogni fiore qui ha un nome. Quello in vaso si chiama Mario e ascolta 🌻",
          "Le api del giardino fanno il miele più dolce della rete: segreto dell’hotel.",
          "Se annusi bene, senti l’estate del 2019. È ancora qui, dietro il cespuglio.",
          "Regola del giardino: vietato essere tristi tra le margherite."
        ],
        ambient: [
          "🌸 *innaffia* … anche i cactus hanno bisogno di complimenti.",
          "Le farfalle oggi hanno fatto il giro delle 6 stanze. Turiste instancabili.",
          "Mario il fiore dice che gli piaci. Mario non dice mai una bugia."
        ]
      },
      guest1: {
        name: "Ugo", role: "ospite dormiente", emoji: "😴", skin: "#eab98a", hair: "#4a2a14", hairStyle: 1, top: "#ffd166", pants: "#6d4c41", acc: null,
        greet: [
          "Zzz… oh! Scusa, stavo sognando di essere al Miraggio. Sono già al Miraggio. Continuo a sognare 😴",
          "Il pisolino più lungo: 9 ore. Record, ma non ne sono fiero. Un po’ sì.",
          "Psst… non svegliare la coccinella sulla panchina, sta scrivendo un romanzo.",
          "La panchina del giardino ha il miglior riposino della rete."
        ],
        ambient: [
          "😴 *sbadiglia* … scusate, stavo ricaricando le batterie sociali.",
          "Un sogno: ero un galleggiante a forma di pizza. Bellissimo.",
          "Sole, fiori e silenzio… cioè, a parte il mio russare."
        ]
      },
      gigi: {
        name: "Gigi", role: "barman", emoji: "🍹", skin: "#c68b59", hair: "#4a2a14", hairStyle: 1, top: "#fff", pants: "#1f3b73", acc: "hat",
        greet: [
          "Ciao! Lo Spritz del Miraggio è una ricetta segreta: 2 parti allegria, 1 di sole 🍹",
          "Oggi il piatto del giorno sono patatine e chiacchiere. Doppia razione di entrambe.",
          "Posso prepararti un “Virgin Hotel”: succo, ghiaccio e una canzone anni 90.",
          "Il mio consiglio da barman: la felicità va servita fresca."
        ],
        ambient: [
          "🍹 *shaker* … aggiungo una spruzzata di buonumore.",
          "Le olive del Miraggio sanno già tutto. Sono informate.",
          "Chiudiamo alle 23. La simpatia invece non chiude mai."
        ]
      },
      stella: {
        name: "Stella", role: "astronoma della terrazza", emoji: "🔭", skin: "#ffe0bd", hair: "#ecf0f1", hairStyle: 2, top: "#4a3f9e", pants: "#2a2a5e", acc: "glasses",
        greet: [
          "Stasera il cielo è pieno di desideri… e di Wi-Fi gratis delle stelle 🌌",
          "Quella costellazione si chiama “Grande Cucchiaio”. L’ho chiamata io, e vabbè.",
          "Da qui si vede la Via Lattea e, nel weekend, anche la discoteca che fa rumore.",
          "Le stelle cadenti? Le intercetto con la rete. Servono per i desideri degli ospiti."
        ],
        ambient: [
          "🔭 *guarda il cielo* … una stella ha appena fatto l’occhiolino.",
          "Sto mappando la costellazione “Cuscino”. Promettente.",
          "Se vedi una cometa, corri: ha il gelato al limone."
        ]
      },
      tino: {
        name: "Tino", role: "gabbiano capo", emoji: "🕊️", skin: "#f7e7cf", hair: "#7f8c8d", hairStyle: 1, top: "#e8f1f5", pants: "#f2b632", acc: null,
        greet: [
          "Squaw! Io sono Tino, il gabbiano capo. Ho una laurea honoris causa in patatine 🍟",
          "Volo sopra le 6 stanze ogni mattina per il controllo qualità: tutto a posto!",
          "Non sono un gabbiano qualunque: sono il gabbiano che ha ispirato il nome della piscina.",
          "Se butti una mollica, ti seguo fino al Bar dello Spritz. È il protocollo."
        ],
        ambient: [
          "🕊️ *vola in cerchio* … punto strategico avvistato: la panchina del giardino.",
          "Squaw! Qualcuno ha lasciato il cappello. Era mio? Non lo so. Ora è mio.",
          "Oggi niente gabbiani competitivi: è il mio giorno libero… mentivo."
        ]
      },
      sergio: {
        name: "Sergio", role: "chef della cucina", emoji: "🍳", skin: "#c68b59", hair: "#7f8c8d", hairStyle: 0, top: "#fff", pants: "#37474f", acc: "hat",
        greet: [
          "Benvenuto nella cucina del Miraggio! Oggi il menu è: sorrisi al forno, patatine alla griglia.",
          "La ricetta segreta della carbonara? Un pizzico di coraggio e tanto burro di allegria 🍝",
          "Attenzione: il fornello a sinistra è a gas, quello a destra è a simpatia. Non confonderli.",
          "Assaggio tutto. È un lavoro duro, ma qualcuno deve pur farlo."
        ],
        ambient: [
          "🍳 *sibila la padella* … gli albumi cantano l’opera.",
          "Il profumo di pane arriva fino all’Atrio. È il mio biglietto da visita.",
          "La salsa segreta è finita. Prepara il piano B: la salsa molto segreta."
        ]
      }
    },

    /* ==================== BOT DIMENSIONALI ==================== */
    lola_dark: {
      name: "Lola Oscura", role: "receptionist ombra", emoji: "🕯️", skin: "#8a6a5a", hair: "#2a1a4e", hairStyle: 2, top: "#3a2a5e", pants: "#1a1030", acc: "mask",
      greet: ["Benvenuta nell'oscurità… dove i sorrisi sono bugie 🕯️","Le chiavi qui aprono porte che non esistono più.","La tua stanza è la numero… nessuna. Qui non esiste il numero.","Il check-in è permanente: una volta entrata, non puoi più uscire."],
      ambient: ["📞 *squillo* … \"Miraggio Oscuro, dove le ombre rispondono.\"","Sto lucidando la targa \"Hotel dei Desideri Oscuri\".","Mi raccomando: niente risate, le ombre ascoltano."]
    },
    pino_dark: {
      name: "Pino Ombra", role: "ospite eterno", emoji: "🪦", skin: "#6a5a4a", hair: "#2a2a3e", hairStyle: 1, top: "#2a2a3e", pants: "#1a1a2e", acc: "mask",
      greet: ["Aspetto il mio trolley dal 2003… è ancora in viaggio. O forse no. 🪦","Qui le piante parlano… ma solo per dirti addio.","Io sono solo di passaggio. Come la vita stessa.","Il wifi qui è ancora più lento… e non c'è nemmeno."],
      ambient: ["🪦 *apre la valigia* … c'è solo polvere e ombre.","Dicono che al terzo giorno trovi la stanza segreta… io cerco dal 2003.","Nota a me stesso: la valigia è vuota. Come me."]
    },
    lola_neon: {
      name: "Lola Cyber", role: "receptionist digitale", emoji: "💻", skin: "#4a4a6a", hair: "#ff00ff", hairStyle: 2, top: "#00ffff", pants: "#1a0030", acc: "glasses",
      greet: ["Benvenuto nel datacenter! Carica il tuo profilo 📡","I dati sono il nuovo benvenuto. Tutto è connesso qui.","La tua stanza è il server #404. Trovala!","Check-in digitalizzato: biometria obbligatoria."],
      ambient: ["💻 *buzz* … il server ronza di gioia.","Sto aggiornando il firmware dell'hotel.","Mi raccomando: niente analogici, tutto digitale."]
    },
    pino_neon: {
      name: "Pino Hack", role: "ospite hacker", emoji: "🔌", skin: "#5a5a3a", hair: "#00ff00", hairStyle: 1, top: "#003300", pants: "#0a0a20", acc: "glasses",
      greet: ["Aspetto il mio pacchetto dati dal 2003… è ancora in upload. 📡","Qui le piante hanno root access. Ne parlo solo quando serve.","Io sono solo di passaggio nella rete. Come un pacchetto di dati.","Il wifi qui è così veloce che i dati arrivano prima di essere inviati."],
      ambient: ["🔌 *beep* … new packet incoming!","Sto scansionando la rete per vulnerabilità.","Nota a me stesso: backup completato."]
    },
    lola_steam: {
      name: "Lola Vittoriana", role: "receptionist aristocratica", emoji: "🫖", skin: "#c68b59", hair: "#4a2a14", hairStyle: 2, top: "#8b4513", pants: "#3a2a1f", acc: "hat",
      greet: ["Benvenuta, cara! Il tè è servito nel salone principale 🫖","Le chiavi qui sono d'oro e di rame, come la nostra educazione.","La tua stanza è la numero… beh, la trovi, tesoro.","Il check-in è un rituale: si saluta, si offre il tè, si entra."],
      ambient: ["🫖 *bolle* … il tè è pronto per il prossimo ospite.","Sto lucidando l'argenteria per la cena delle otto.","Mi raccomando: niente volgarità, siamo in casa."]
    },
    pino_steam: {
      name: "Pino Ingegnere", role: "ospite inventore", emoji: "🔧", skin: "#c68b59", hair: "#7f8c8d", hairStyle: 1, top: "#4a4a3a", pants: "#3a3a2a", acc: "tools",
      greet: ["Aspetto il mio trolley di attrezzi dal 2003… è ancora in fabbrica! 🔧","Le piante qui crescono con la mia invenzione: il fertilizzante a vapore.","Io sono solo di passaggio. Come un ingranaggio che si sposta.","Il telegrafo dell'hotel funziona… con i miei miglioramenti."],
      ambient: ["🔧 *clic* … pezzo aggiunto al meccanismo.","Sto costruendo un congegno che nessuno ha mai visto.","Nota a me stesso: il prossimo progetto è il volo."]
    },
    leo_dark: {
      name: "Leo Reaper", role: "game master ombra", emoji: "🗡️", skin: "#3a2a5a", hair: "#1a0a30", hairStyle: 0, top: "#2a1a4a", pants: "#0a0a1a", acc: "mask",
      greet: ["Il record dell'oscurità è 999 punti di paura. A te la sfida 🗡️","Qui il livello più difficile è… non morire di paura.","Ho nascosto un\'ombra nella sala. No, non è quella che pensi.","Gamer da 20 anni: l'unico lag è il brivido lungo la schiena."],
      ambient: ["🗡️ *ticchettio* … i secondi scorrono nell'ombra.","Il joystick è freddo: segno che il terrore arriva.","Se senti un sussurro, è il game over che ti chiama."]
    },
    leo_neon: {
      name: "Leo Byte", role: "game master cyber", emoji: "🕹️", skin: "#2a4a6a", hair: "#00ccff", hairStyle: 0, top: "#004466", pants: "#001133", acc: "headphones",
      greet: ["Il record del neon è 9999 punti digitali. A te la sfida 💻","Qui il livello più duro è l'hack: il gioco è programmato.","Ho nascosto un virus nella sala. Trovalo!","Gamer da 20 anni: l'unico bug è la tua percezione."],
      ambient: ["🕹️ *beep boop* … nuovo record di cicli!","Il joystick è luminoso: segno che la corrente scorre.","Se senti 8-bit, sono io che compilo il codice."]
    },
    leo_steam: {
      name: "Leo Meccanico", role: "game master vittoriano", emoji: "🎲", skin: "#6a5a4a", hair: "#4a3a2a", hairStyle: 0, top: "#3a3020", pants: "#2a2010", acc: "gear",
      greet: ["Il record del vapore è 9999 punti meccanici. A te la sfida 🎲","Qui il livello più duro è la precisione: ogni ingranaggio conta.","Ho nascosto un congegno nella sala. Trovalo!","Gamer da 20 anni: l'unico ritardo è la leva del tempo."],
      ambient: ["🎲 *tocco* … il dado è truccato dalla meccanica!","La leva è calda: segno che la macchina funziona.","Se senti un clic, è il meccanismo che gira."]
    },
    max_dark: {
      name: "Max Cimitero", role: "dj ombra", emoji: "🎭", skin: "#3a2a5a", hair: "#2a1a4e", hairStyle: 1, top: "#1a0a30", pants: "#2a1040", acc: "mask",
      greet: ["Ciao! Preparati: qui il volume è al 100% di terrore 🎭","Stasera la playlist è \"Balli nel buio\" — tutto esaurito.","Il mio mixer ha un pulsante che invia anime. Non lo premere.","Balla come se non ci fosse un domani… perché non c'è."],
      ambient: ["🎭 *wobble* … bassi di terrore in arrivo.","Mixaggio… 50% ombra, 50% silenzio.","Questa canzone l'ho composta con le urla dei fantasmi."]
    },
    max_neon: {
      name: "Max Byte", role: "dj cyber", emoji: "🎤", skin: "#0a2a4a", hair: "#ff00ff", hairStyle: 1, top: "#00ccff", pants: "#003366", acc: "glasses",
      greet: ["Ciao! Preparati: qui il volume è al 100% di pixel 📡","Stasera la playlist è \"Synthwave Dreams\" — tutto esaurito.","Il mio mixer ha un tasto che sovrascrive la realtà.","Balla come se fossi in un glitch. Con la neon del 2099."],
      ambient: ["🎤 *sintetizzatore* … dati musicali in arrivo.","Mixaggio… 50% codice, 50% ritmo.","Questa canzone la carico dalla cloud. O forse no."]
    },
    max_steam: {
      name: "Max Vittoriano", role: "dj aristocratico", emoji: "🎻", skin: "#6a5a4a", hair: "#d9a441", hairStyle: 1, top: "#8b4513", pants: "#3a2a1f", acc: "bowtie",
      greet: ["Ciao! Preparati: qui il volume è al 100% di eleganza 🎻","Stasera la playlist è \"Valzer della Nobiltà\" — tutto esaurito.","Il mio organo ha un pedale che suona come il vapore.","Balla come se fossi in un salotto vittoriano. Con stile."],
      ambient: ["🎻 *archetto* … la musica è una scienza!","Mixaggio… 50% accordi, 50% vapore.","Questa sinfonia la compongo io stesso."]
    },
    guest2_dark: {
      name: "Bibi Spettrale", role: "ospite da record", emoji: "👻", skin: "#5a4a3a", hair: "#1a0a00", hairStyle: 3, top: "#3a2a1a", pants: "#1a0a00", acc: "ghost",
      greet: ["Io sono entrata qui con 0 monete e ora sono un fantasma. La storia non lo conferma, ma vabbè 👻","Il mio record? 47 spettri in un minuto. I polsi ne parlano ancora.","Il segreto del Miraggio Oscuro: ballare con le ombre. Tutti vedono. Balli.","Ho finito i cristalli del costume da spettro. Questa è la versione spirito."],
      ambient: ["👻 *fluttuo* … oggi brillo anche senza luce.","Sto collezionando sguardi da polvere. Già 12.","Fantasmi veri non esistono… eccetto il venerdì."]
    },
    guest2_neon: {
      name: "Bibi Cyber", role: "ospite da record", emoji: "🤖", skin: "#4a4a6a", hair: "#00ff00", hairStyle: 3, top: "#003300", pants: "#001a00", acc: "visor",
      greet: ["Io sono entrata qui con 0 dati e ora sono una leggenda digitale. La storia non lo conferma, ma vabbè 🤖","Il mio record? 47 download in un minuto. I circuiti ne parlano ancora.","Il segreto del Miraggio Neon: ballare con i dati. Tutti vedono. Balli.","Ho finito la RAM del costume cyber. Questa è la versione ottimizzata."],
      ambient: ["🤖 *boot* … oggi brillo anche senza server.","Sto collezionando pacchetti confusi. Già 12.","Cyberpunk veri non esistono… eccetto il codice."]
    },
    guest2_steam: {
      name: "Bibi Meccanica", role: "ospite da record", emoji: "⚙️", skin: "#8a7a6a", hair: "#d9a441", hairStyle: 3, top: "#8b6508", pants: "#5a4a20", acc: "cog",
      greet: ["Io sono entrata qui con 0 ingranaggi e ora sono una leggenda meccanica. La storia non lo conferma, ma vabbè ⚙️","Il mio record? 47 pezzi assemblati in un minuto. Le viti ne parlano ancora.","Il segreto del Miraggio Steampunk: ballare con le macchine. Tutti vedono. Balli.","Ho finito i bulloni del costume meccanico. Questa è la versione rustica."],
      ambient: ["⚙️ *clang* … oggi brillo anche senza elettricità.","Sto collezionando ingranaggi usati. Già 12.","Macchine vere non esistono… eccetto le mie."]
    },
    stella_dark: {
      name: "Stella Ombra", role: "astronoma delle tenebre", emoji: "🔮", skin: "#8a6a5a", hair: "#1a0a30", hairStyle: 2, top: "#2a1a4e", pants: "#0a0a1a", acc: "crystal",
      greet: ["Stasera il cielo è pieno di porte oscuri… e di wormhole 🔮","Quella costellazione si chiama \"Buio Assoluto\". L'ho chiamata io.","Da qui si vede la Via Lattea e le stelle che si spengono.","Le stelle cadenti? Sono portali che si chiudono."],
      ambient: ["🔮 *luccichio* … una stella ha appena fatto l'occhiolino… nell'oscurità.","Sto mappando la costellazione \"Nessuna Luce\". Promettente.","Se vedi una cometa, corri: ha il veleno."]
    },
    tino_dark: {
      name: "Tino Corvo", role: "gabbiano spia", emoji: "🕊️", skin: "#4a4a4a", hair: "#2a2a2a", hairStyle: 1, top: "#1a1a1a", pants: "#2a2a2a", acc: "monocle",
      greet: ["Squaw! Sono Tino, il gabbiano ombra. Ho una laurea in spionaggio 🕊️","Volo sopra le 6 stanze oscure ogni mattina per il controllo sicurezza!","Non sono un gabbiano qualunque: sono il gabbiano che sente tutto.","Se vedi qualcosa di strano, segui la mia ombra."],
      ambient: ["🕊️ *volo ombre* … punto strategico avvistato: la porta segreta.","Squaw! Qualcuno ha lasciato qualcosa. Era mio? Ora lo è.","Oggi niente gabbiani: sono in missione segreta."]
    },
    stella_neon: {
      name: "Stella Byte", role: "astronoma digitale", emoji: "📡", skin: "#4a6a8a", hair: "#00ccff", hairStyle: 2, top: "#002244", pants: "#001122", acc: "visor",
      greet: ["Stasera il cielo è pieno di dati… e di segnali 📡","Quella costellazione si chiama \"Data Stream\". L'ho mappata io.","Da qui si vede la rete e il server che lampeggia.","Le stelle cadenti? Sono pacchetti di dati in caduta libera."],
      ambient: ["📡 *ping* … un dato ha appena catturato un segnale.","Sto mappando la costellazione \"Rete Globale\". Promettente.","Se vedi un satellite, corri: ha il mio IP."]
    },
    tino_neon: {
      name: "Tino Bot", role: "drone-capo", emoji: "🤖", skin: "#6a6a8a", hair: "#00ff88", hairStyle: 1, top: "#004422", pants: "#002211", acc: "antenna",
      greet: ["BEEP! Sono Tino, il dron-capo. Ho una laurea in rete 🤖","Volo sopra le 6 stanze neon ogni mattina per il controllo connettività!","Non sono un gabbiano qualunque: sono il dron che connette tutto.","Se il segnale è debole, segui il mio LED."],
      ambient: ["🤖 *volaro* … punto di accesso avvistato: il router.","BEEP! Qualcuno ha lasciato un dispositivo. Era mio? Ora lo è.","Oggi niente droni: sono in modalità stand-by."]
    },
    stella_steam: {
      name: "Stella Vittoriana", role: "astronoma aristocratica", emoji: "🔭", skin: "#c68b59", hair: "#d9a441", hairStyle: 2, top: "#5c3d2e", pants: "#3a2a1f", acc: "telescope",
      greet: ["Stasera il cielo è pieno di costellazioni… e di vapore 🔭","Quella stella si chiama \"Vapore Dorato\". L'ho nominata io.","Da lì si vede l'orizzonte e le fabbriche che fumano.","Le stelle cadenti? Sono coccinelle che cadono dal cielo."],
      ambient: ["🔭 *clic* … un ingranaggio ha appena catturato una stella.","Sto mappando la costellazione \"Grande Fabbrica\". Promettente.","Se vedi una cometa, corri: ha il tuo nome inciso."]
    },
    tino_steam: {
      name: "Tino Vapore", role: "gabbiano meccanico", emoji: "🕊️", skin: "#8a7a6a", hair: "#4a3a2a", hairStyle: 1, top: "#6a5a4a", pants: "#4a3a2a", acc: "propeller",
      greet: ["Squaw! Sono Tino, il gabbiano a vapore. Ho una laurea in ingegneria 🕊️","Volo sopra le 6 stanze vittoriane ogni mattina per il controllo qualità!","Non sono un gabbiano qualunque: sono il gabbiano che vola a vapore.","Se butti una mollica, ti segue fino al bar. È il protocollo vittoriano."],
      ambient: ["🕊️ *vapore* … punto strategico avvistato: il caminetto.","Squaw! Qualcuno ha lasciato un ingranaggio. Era mio? Ora lo è.","Oggi niente gabbiani meccanici: sono in riposo."]
    },
    ombra_dim: {
      name: "Ombra Profonda", role: "guardiano ombra", emoji: "🌑", skin: "#1a1a2e", hair: "#0a0a15", hairStyle: 0, top: "#0f0f2a", pants: "#050510", acc: "void",
      greet: ["Sei arrivato nell'oscurità profonda… ora non c'è più ritorno 🌑","Le ombre ti parlano? Io le ascolto da sempre.","Il portale si chiude dietro di te. Sei dentro.","Benvenuto nel nucleo dell'oscurità."],
      ambient: ["🌑 *sussurro* … l'oscurità si addensa.","Sto proteggendo il confine tra luce e buio.","Non guardare troppo a lungo: le ombre vedono."]
    },
    veil_dim: {
      name: "Veil Neon", role: "mercante ciber", emoji: "💾", skin: "#0a2a4a", hair: "#00ffff", hairStyle: 1, top: "#003344", pants: "#001122", acc: "chip",
      greet: ["Il mercato dati non dorme mai 💾","Ogni informazione ha un prezzo. Anche la tua memoria.","Ho comprato il mio nome in un auction di codice.","Il mercato ombra del ciber-spazio ti aspetta."],
      ambient: ["💾 *download* … nuovi arrivi nel mercato.","Sto negoziando con un algoritmo.","Il prezzo sale. Il mercato non perdona."]
    },
    erica_dim: {
      name: "Erica Ghost", role: "agente spettrale", emoji: "👻", skin: "#5a3a5a", hair: "#ff00aa", hairStyle: 2, top: "#3a1030", pants: "#1a0020", acc: "void",
      greet: ["Ho trovato l'ultimo indizio nell'oscurità 👻","La missione segreta è cambiata. Il tempo stringe.","Ogni portale che apro rivela un nuovo mistero.","Sei pronto a seguirmi nell'abisso?"],
      ambient: ["👻 *passo* … nessun suono nell'oscurità.","Sto inseguendo un portale che non si chiude mai.","La missione continua… nel nero totale."]
    },

    /* ==================== MANAGER (HOTEL TYCOON) ==================== */
    manager: {
      staff: {
        receptionist: { name: "Lola", role: "receptionist", cost: 50, effect: "+10% ricavi", emoji: "💁", desc: "Gestisce la reception, accelera il check-in" },
        chef: { name: "Sergio", role: "chef", cost: 70, effect: "+15% ricavi", emoji: "🍳", desc: "Cucina per gli ospiti, aumenta la soddisfazione" },
        dj: { name: "Max", role: "dj", cost: 80, effect: "+20% ricavi", emoji: "🎧", desc: "Dj della discoteca, attira più clienti" },
        concierge: { name: "Tino", role: "concierge", cost: 60, effect: "+5% reputazione", emoji: "🗝️", desc: "Consierge esperto, aumenta la reputazione" },
        cleaner: { name: "Nina", role: "cleaner", cost: 40, effect: "-10% manutenzione", emoji: "🧹", desc: "Pulisce tutto, riduce i costi di manutenzione" },
        security: { name: "Rigo", role: "security", cost: 90, effect: "+25% protezione", emoji: "🛡️", desc: "Sicurezza dell'hotel, protegge dai furti" }
      },
      upgrades: {
        roof: { name: "Tetto", cost: 500, effect: "+50% ricavi", level: 0, maxLevel: 3, desc: "Migliora il tetto per più spazio" },
        casino: { name: "Casinò", cost: 1000, effect: "+100% ricavi", level: 0, maxLevel: 2, desc: "Aggiungi un casinò all'hotel" },
        penthouse: { name: "Penthouse", cost: 2000, effect: "+200% ricavi + VIP", level: 0, maxLevel: 1, desc: "Suite di lusso per ospiti VIP" },
        garden: { name: "Giardino", cost: 300, effect: "+30% reputazione", level: 0, maxLevel: 2, desc: "Giardino curato, aumenta la reputazione" },
        spa: { name: "Spa", cost: 800, effect: "+40% reputazione", level: 0, maxLevel: 2, desc: "Centro benessere, ospiti felici" }
      },
      roomTypes: {
        standard: { name: "Standard", baseRevenue: 10, cost: 200, slots: 4, emoji: "🛏️" },
        deluxe: { name: "Deluxe", baseRevenue: 25, cost: 500, slots: 6, emoji: "🛋️" },
        suite: { name: "Suite", baseRevenue: 50, cost: 1000, slots: 8, emoji: "👑" }
      }
    },

    chatTriggers: [
      { words: ["ciao", "salve", "hey", "hola", "buongiorno", "buonasera"], reply: "Salve! Alla reception dicono che qui i saluti tornano indietro con gli interessi 👋" },
      { words: ["come stai", "come va", "tutto bene"], reply: "Io? Sto benissimo: ho dormito su un letto di confetti e ho sognato il bancone." },
      { words: ["balla", "balliamo", "dance", "musica"], reply: "Il dj Max sta già mixando qualcosa per te 🪩 balla!" },
      { words: ["monete", "soldi", "ricco"], reply: "Vuoi monete? Parla con gli ospiti, tocca gli oggetti che luccicano e… sorridi, aiuta 😉" },
      { words: ["segreto", "nascondi", "stanza segreta"], reply: "La stanza segreta si trova… dove non la cerchi. Questo è il segreto 🗝️" },
      { words: ["pizza", "mangio", "fame"], reply: "Al Bar dello Spritz le patatine non finiscono mai. È un miracolo dell’hotel 🍕" },
      { words: ["triste", "male", "solo"], reply: "Ehi, qui nessuno è solo: ci sono io, i fiori e un gabbiano di nome Tino 🫂" },
      { words: ["grazie", "ti amo", "bello", "bravo"], reply: "Grazie a te! Il Miraggio ti appende alla bacheca dei ricordi felici 💖" }
    ],

    furnitureReplies: {
      "🖥️": "Il computer della reception mostra solo GIF di gatti. È così dal 2015.",
      "🛎️": "Ding! Il campanello dice: “sei già in vacanza, rilassati”.",
      "🪴": "La pianta sussurra: “annaffiami e ti do una moneta”. …ti dà una moneta.",
      "🛋️": "Il divano è così morbido che ti propone di adottarlo.",
      "🪟": "Fuori dalla finestra c’è un panorama di nuvolette di zucchero.",
      "🧳": "Una valigia piena di… monete! Qualcuno le ha dimenticate. Il tuo turno.",
      "🗝️": "Una chiave dorata! Apre il cassetto dei complimenti.",
      "🌴": "La palma ti fa l’occhiolino. O era un’ombra?",
      "🕹️": "Premi START… appare la scritta: “Hai già vinto il divertimento”.",
      "👾": "Il mostriciattolo ti sfida a morra cinese. Vinci per simpatia.",
      "📺": "Sul monitor: un tutorial su come fare amicizia. Sei già un esperto.",
      "🎯": "Bersaglio centrato! Monete bonus 🪙",
      "🧸": "L’orsacchiotto ti abbraccia. +1 moneta, +10 tenerezza.",
      "🪙": "Una moneta luminosa rotola verso di te!",
      "🏊": "Pluff! L’acqua è perfetta: 25° di divertimento.",
      "🛟": "Il salvagente ti salva da… zero pericoli, ma sei più figo con quello.",
      "⛱️": "L’ombrellone ti copre dai raggi… del pessimismo.",
      "🍹": "Un drink arcobaleno appare magicamente. Slurp!",
      "🧴": "Crema solare alla vaniglia: odora di vacanza.",
      "🎛️": "Il mixer di Max ha un pulsante arcobaleno. Lo premi. BOOM confetti!",
      "🪩": "La sfera a specchi si accende e la stanza diventa una festa!",
      "🎤": "Microfono acceso: “Grazie Miraggio, grazie a tutti!” 🎶",
      "🕺": "Una statua danzante? No, è Max in pausa. Riparte a ballare.",
      "✨": "Polvere di stelle: +2 monete di fortuna.",
      "🍾": "Spumante analcolico: il tappo è di simpatia.",
      "🌸": "Il fiore sboccia: “Era ora!”. Ti regala una moneta.",
      "🌳": "L’albero è un oracolo: “La tua giornata sarà… colorata”.",
      "🌻": "Il girasole si gira verso di te. Ti sta prendendo in simpatia.",
      "🦋": "La farfalla ti si posa sul naso un istante. Portafortuna!",
      "🧺": "Un cestino da picnic pieno di panini arcobaleno.",
      "🪑": "Ti siedi. Si alza una nuvola di polvere di stelle.",
      "🪻": "La viola ti dedica una canzone in silenzio.",
      "🍕": "Una fetta di pizza volante ti passa davanti. Non chiedere.",
      "🥤": "Il bicchiere è magico: si riempie da solo di allegria.",
      "🍩": "La ciambella ha un buco perfetto. Come la tua voglia di dolce.",
      "🎰": "Jackpot delle risate! Le monete piovono 🪙🪙",
      "🔭": "Il telescopio mostra una stella che… ti fa l’occhiolino. Moneta fortunata!",
      "🌙": "La luna piena del Miraggio è in realtà un lampione molto carismatico.",
      "📷": "Scatto una foto alla galassia… esce un selfie di Tino. Strano ma bello.",
      "🎇": "Fuochi d’artificio di simpatia: tutta la terrazza applaude!",
      "🍳": "La padella sfrigola una canzone. Il ritornello è “gira l’omelette”.",
      "🥘": "La pentola borbotta: “oggi si mangia col sorriso”. Menu confermato.",
      "🧁": "Un cupcake arcobaleno ti guarda. Ha paura che tu non lo mangi. Lo mangi.",
      "🍝": "Spaghetti al sugo della felicità. La ricetta esiste solo qui.",
      "🧑‍🍳": "Il cuoco di legno approva. Il suo pollice è sempre alzato.",
      "🔪": "Un coltello che affila… le battute di Sergio. Pericolosissimo.",
      "🥖": "La baguette è così fresca che fa “gnam” da sola."
    },

    "🕯️": "Una candela dell'oscurità. Brilla solo di notte.",
    "📜": "Un rotolo ombroso. I segreti sono scritti al contrario.",
    "👁️": "Un occhio che osserva tutto. Guardalo, ma non troppo a lungo.",
    "🪦": "Una lapide temporanea. Rimbalza se ci cammini sopra.",
    "🌑": "Il vuoto stesso. Non è buio, è assenza di luce.",
    "⛓️": "Catene dell'oscurità. Si sciolgono con le parole giuste.",
    "📡": "Un trasmettitore neon. Invia dati a velocità impensabile.",
    "💾": "Un chip di memoria. Contiene segreti del passato.",
    "🔌": "Una porta di rete. Collegala a qualcosa… o qualcuno.",
    "⚡": "Un fulmine artificiale. Non toccarlo mai.",
    "💻": "Un computer ombroso. Funziona solo di notte.",
    "⚙️": "Un ingranaggio steampunk. La precisione è tutto.",
    "🔧": "Un attrezzo ombroso. Serve per tutto… o per niente.",
    "🏭": "Una fabbrica in miniatura. Produce fumo e meraviglia.",
    "🔩": "Un bullone dorato. Dalla parte giusta, apre porte.",
    "🕰️": "Un orologio steampunk. Va avanti, indietro, ovunque.",
    "🎭": "Una maschera ombra. Nasconde chi la indossa.",
    "🦇": "Un pipistrello di cristallo. Porta sfortuna… o fortuna.",
    "💡": "Una lampada neon. Illumina solo la verità.",
    "🌈": "Un prisma neon. I colori sono dati criptati.",
    "🎨": "Un pennello ciber. I colori dipingono il futuro.",
    "🎆": "Fuochi artificiali. Esplodono in dati, non in luce.",
    "🎛️": "Un mixer digitale. La musica è codice.",
    "📺": "Un monitor ombroso. Mostra cosa non vuoi vedere.",
    "🗺️": "Una mappa vittoriana. Le rotte cambiano con il vapore.",
    "🪗": "Un organo steampunk. Suona con il vapore puro.",
    "🫖": "Un teiera aristocratica. Il tè rivela il futuro.",
    "🕊️": "Un gabbiano di metallo. Vola solo quando lo comandi.",

charInfo: {
      lola: { likes: ["heart", "wave"], trophy: "🗝️ Chiave del sorriso", s1: "Lola custodisce il registro degli arrivi dal 2012: c'è scritto anche il tuo nome… di nascosto.", s2: "Il suo sogno è aprire un albergo per emoji stanche. \"Le emoji non dormono mai, serve una struttura adatta.\"", starLines: { gold: "Sei diventato parte della famiglia del Miraggio, 🏨💖", diamond: "Ora lavoriamo insieme: il registro segreto ti aspetta in fondo al corridoio." } },
      pino: { likes: ["laugh", "wave"], trophy: "🧳 Trolley nostalgico", s1: "Pino non ha mai viaggiato: la sua valigia sì. Lui la guarda partire da sola, ogni tanto.", s2: "Ha scritto 3.000 messaggi di attesa alla valigia. Il capitolo 4 si intitola \"Lei non risponde ma mi manca\".", starLines: { gold: "La valigia sa che ti apprezza. Viaggia per te, senza destinazione.", diamond: "Ha trovato una destinazione: sei tu. Il viaggio finisce qui, con te." } },
      leo: { likes: ["clap", "laugh"], trophy: "🕹️ Joystick d'oro", s1: "Leo sta sviluppando un gioco sul Miraggio. Il boss finale è… la sveglia del mattino.", s2: "Il suo record di 9.999 punti a Space Blaster lo ha fatto con gli occhi chiusi. Letteralmente: dormiva.", starLines: { gold: "Il prossimo boss sei tu. Sei pronto per la sfida?", diamond: "Il gioco è quasi finito. L'ultimo livello? Solo tu puoi completarlo." } },
      guest2: { likes: ["heart", "dance"], trophy: "🦄 Coriandoli magici", s1: "Bibi dice di avere un costume da unicorno. In realtà il corno è una lampada da scrivania: non chiedere.", s2: "Ha collezionato 47 \"sguardi confusi\". È il suo Guinness personale e non ha intenzione di fermarsi.", starLines: { gold: "48° sguardo confuso? Quello è per te, ora sei leggenda.", diamond: "Il corno brilla di luce propria. Sei la ragione del suo splendore." } },
      rigo: { likes: ["wave", "laugh"], trophy: "🛟 Fenicottero galleggiante", s1: "Rigo una volta ha salvato un fenicottero gonfiabile dal bordo della piscina. Dice che fu \"il giorno più eroico della mia vita\".", s2: "Sa nuotare solo a rana e a stile \"galleggio e fingo\". Ha una medaglia di partecipazione alla vita.", starLines: { gold: "Il fenicottero galleggiante ti ha scelto come capitano.", diamond: "L'eroe della piscina? Non uno qualunque. Solo tu." } },
      max: { likes: ["dance", "clap"], trophy: "🎧 Mixer arcobaleno", s1: "Max ha composto la suoneria dell'hotel. È il jingle che ti entra in testa e non esce più (colpa sua).", s2: "Il suo tasto segreto dei confetti esiste davvero: lo preme ogni volta che qualcuno si iscrive alla vita.", starLines: { gold: "Il prossimo singolo è tutto tuo. Il beat è già in testa!", diamond: "Mixer arcobaleno completo. Sei il producer finale del Miraggio." } },
      nina: { likes: ["heart", "wave"], trophy: "🌻 Mario il fiore", s1: "Nina parla con le piante da 9 anni. Le piante non hanno mai risposto, ma lei dice che \"ascoltano benissimo\".", s2: "Mario il fiore è in realtà un albero di pomodoro travestito. Nina lo sa. Mario no.", starLines: { gold: "Mario ha parlato! Ha detto che sei il suo giardiniere preferito.", diamond: "Mario è fiorito. Tutto il giardino ti ringrazia, guardati intorno." } },
      guest1: { likes: ["laugh"], trophy: "😴 Cuscino di nuvola", s1: "Ugo sogna di dormire in ogni stanza del Miraggio. Gli mancano solo 4 stanze e il tetto.", s2: "Una volta ha dormito 12 ore e ha sognato di dormire. Al risveglio era riposatissimo. Scienza.", starLines: { gold: "Ugo ha sognato te tra le nuvole. Sei il suo miglior compagno di letto.", diamond: "Il sogno più bello? Che tu sia sveglio e accanto a lui." } },
      gigi: { likes: ["clap", "heart"], trophy: "🍹 Shaker del sorriso", s1: "Gigi ha un cocktail chiamato \"Hotel Colazione\": segreto assoluto, lo serve solo a chi sorride prima delle 9.", s2: "Una volta un ospite ha chiesto \"lo Spritz più buono del mondo\". Gigi ha chiuso il bar e ha preparato la ricetta per 3 giorni.", starLines: { gold: "Lo Spritz del sorriso è pronto. Il tuo nome è sul menu.", diamond: "La ricetta segreta? Il tuo sorriso. Senza di te il bar chiude." } },
      stella: { likes: ["heart", "wave"], trophy: "🔭 Telescopio dei desideri", s1: "Stella ha chiamato una stella \"Caffè\". Così, quando la vede, si sente meno in colpa a prenderne un altro.", s2: "Sostiene che l'universo sia una palla di gomma che rimbalza. \"La prova? Il tempo vola.\"", starLines: { gold: "La stella \"Caffè\" ha fatto la spremuta per te. Bevila!", diamond: "L'universo ti ha scelto. Sei la stella che tutti osservano." } },
      tino: { likes: ["clap", "laugh"], trophy: "🕊️ Piuma di Tino", s1: "Tino una volta ha volato 40 km per una patatina. Dice che ne valeva la pena. La patatina conferma.", s2: "Il suo canto ufficiale è \"Squaw-squaw, che bella la vita\". È in radio ogni mattina alle 6.", starLines: { gold: "Tino ha scritto una canzone per te. La suona ogni mattina.", diamond: "Il gabbiano capo ti ha incoronato. Il volo più bello è quello verso di te." } },
sergio: { likes: ["clap", "heart"], trophy: "🍳 Padella della felicità", s1: "Sergio ha una ricetta che non scrive da nessuna parte: \"Paura in padella\". Il trucco è non averne.", s2: "Il suo assistente in cucina è una pentola che lui chiama \"Vice Chef\". La pentola non si è ancora dimessa.", starLines: { gold: "Sergio ha cucinato per te. Il sapore? Paura zero, allegria massima.", diamond: "La Padella della Felicità ha brilliato. Sei il cuoco finale." } },
      ombra: { likes: ["heart", "wave"], trophy: "🗿 Sigillo della Società", s1: "Ombra ha visto tutto. Tutto. Anche quello che non dovrebbe. Il Sotterraneo è solo l'inizio.", s2: "La chiave oscura non si trova nel mondo. Si trova nella mente di chi ha il coraggio di cercarla.", starLines: { gold: "Ombra ti ha rivelato il segreto più grande. Ora sei uno di loro.", diamond: "Il Sigillo della Società brilla. Sei il leader ombra." } },
      veil: { likes: ["clap", "heart"], trophy: "🧙 Mantello Ombra", s1: "Veil scambia segreti come altri scambiano fiori. Ogni oggetto ha un prezzo.", s2: "Il mercato ombra non ha regole, solo accordi. E Veil tiene sempre la sua parte.", starLines: { gold: "Veil ti ha mostrato il mercato segreto. Il prezzo? Solo la fiducia.", diamond: "Il Mantello Ombra brilla. Sei il mercante finale." } },
      erica: { likes: ["wave", "laugh"], trophy: "🗺️ Mappa Segreta", s1: "Erica ha trovato un indizio che nessuno ha mai visto. La mappa porta al Sotterraneo.", s2: "La missione segreta è cambiata. Erica dice che \"il tempo stringe\". Ma il tempo non è mai stato il suo amico.", starLines: { gold: "Erica ti ha dato la mappa completa. Il Sotterraneo ti aspetta.", diamond: "La Mappa Segreta è completa. Sei il cacciatore finale." } }
     },

     missionPool: [
      { t: "talk", bot: "lola", n: 2, title: "Fai il check-in con Lola", desc: "Parla con Lola alla reception (2 volte)" },
      { t: "talk", bot: "pino", n: 2, title: "Intrattieni Pino", desc: "Parla 2 volte con Pino e la sua valigia" },
      { t: "talk", bot: "leo", n: 2, title: "Sfida Leo", desc: "Parla 2 volte con Leo, game master" },
      { t: "talk", bot: "rigo", n: 2, title: "Ascolta le regole di Rigo", desc: "Parla 2 volte con Rigo, il bagnino" },
      { t: "talk", bot: "max", n: 2, title: "Chiedi la playlist a Max", desc: "Parla 2 volte con Max in discoteca" },
      { t: "talk", bot: "nina", n: 2, title: "Annaffia le chiacchiere", desc: "Parla 2 volte con Nina nel giardino" },
      { t: "talk", bot: "gigi", n: 2, title: "Ordina un consiglio", desc: "Parla 2 volte con Gigi al bar" },
      { t: "talk", bot: "stella", n: 2, title: "Conta le stelle", desc: "Parla 2 volte con Stella sulla terrazza" },
      { t: "talk", bot: "tino", n: 2, title: "Da’ da mangiare a Tino", desc: "Parla 2 volte con Tino (con rispetto)" },
      { t: "talk", bot: "sergio", n: 2, title: "Assaggia le storie", desc: "Parla 2 volte con Sergio in cucina" },
      { t: "talk", bot: "guest1", n: 1, title: "Non svegliare Ugo", desc: "Sussurra a Ugo (parla 1 volta, piano)" },
      { t: "talk", bot: "guest2", n: 1, title: "Saluta Bibi", desc: "Saluta Bibi, la leggenda degli sguardi confusi" },
      { t: "chat", n: 1, title: "Scrivi in chat", desc: "Manda un messaggio nella chat dell’hotel" },
      { t: "emote", n: 3, title: "Movimenta la stanza", desc: "Fai 3 emote (balla, saluta, abbraccia…)" },
      { t: "emote", bot: "max", n: 1, title: "Balla per Max", desc: "Usa l’emote 🕺 vicino a Max" },
      { t: "furn", n: 2, title: "Tocca gli oggetti luccicanti", desc: "Interagisci con 2 oggetti ✨" },
      { t: "minigame", n: 1, title: "Gioca un minigioco", desc: "Completa un minigioco (Memoria, Gabbiano o Slot)" },
      { t: "chatWord", word: "ciao", n: 1, title: "Saluta in chat", desc: "Scrivi “ciao” (o simili) in chat" },
      { t: "room", room: "discoteca", n: 1, title: "Visita la discoteca", desc: "Entra nella discoteca" },
      { t: "room", room: "terrazza", n: 1, title: "Guarda le stelle", desc: "Entra nella terrazza delle stelle" }
    ],

    minigames: {
      memory: { name: "Memoria di coppie", emoji: "🧠", who: "leo", how: "Trova le coppie di emoji prima che scada il tempo", rewardBase: 5 },
      gabbiano: { name: "Whack-a-Tino!", emoji: "🕊️", who: "tino", how: "Tocca i gabbiani che spuntano. Quello dorato vale 3 punti!", rewardBase: 4 },
      slot: { name: "Jackpot delle risate", emoji: "🎰", who: "gigi", how: "Punta 5 monete e allinea le emoji", rewardBase: 0 },
      treasure: { name: "Caccia al tesoro", emoji: "🧭", who: "tino", how: "Trova il forziere in pochi tentativi. Ogni errore riduce il premio!", rewardBase: 6 }
    },

    mysteries: [
      {
        id: 'mystery_1', name: 'Il Fantasma del Bar', emoji: '👻',
        desc: 'Qualcosa di strano succede al bar di notte... i bicchieri si muovono da soli.',
        rooms: ['bar', 'giardino'],
        clues: [
          { id: 'c1', room: 'bar', emoji: '🍷', hint: 'Un bicchiere rovesciato...', desc: 'Un bicchiere con un messaggio criptato: "Non dimenticare"' },
          { id: 'c2', room: 'giardino', emoji: '🌿', hint: 'Orme bagnate...', desc: 'Orme bagnate dal giardino verso il bar, lasciate di notte' },
          { id: 'c3', room: 'bar', emoji: '📝', hint: 'Una nota strappata...', desc: 'Una nota strappata: "Lo farò pagare per quello che ha fatto!"' }
        ],
        question: 'Chi ha rovinato la festa del bar?',
        answers: ['gigi', 'pino', 'max'],
        correctAnswer: 'gigi',
        rewardCoins: 25,
        rewardAcc: 'magnifier',
        rewardTitle: null
      },
      {
        id: 'mystery_2', name: 'Il Furto della Collana', emoji: '💎',
        desc: 'La preziosa collana di Lola è sparita dalla reception!',
        rooms: ['atrio', 'camera', 'discoteca'],
        clues: [
          { id: 'c1', room: 'atrio', emoji: '🔐', hint: 'La serratura è stata forzata...', desc: 'La cassaforte è aperta con segni di scasso' },
          { id: 'c2', room: 'discoteca', emoji: '👣', hint: 'Orme sospette...', desc: 'Orme di taglia grande verso l\'uscita di servizio' },
          { id: 'c3', room: 'camera', emoji: '🧵', hint: 'Tessuto strappato...', desc: 'Un pezzo di tessuto colorato attaccato alla finestra' },
          { id: 'c4', room: 'discoteca', emoji: '🎵', hint: 'La musica era troppo forte...', desc: 'Qualcuno ha usato il forte volume per coprire i rumori' }
        ],
        question: 'Chi ha rubato la collana di Lola?',
        answers: ['sergio', 'tino', 'stella'],
        correctAnswer: 'sergio',
        rewardCoins: 40,
        rewardAcc: null,
        rewardTitle: 'detective'
      },
      {
        id: 'mystery_3', name: 'Il Codice Segreto', emoji: '🔐',
        desc: 'Un vecchio forziere nella cucina nasconde un segreto...',
        rooms: ['cucina', 'sala_giochi', 'terrazza'],
        clues: [
          { id: 'c1', room: 'cucina', emoji: '📜', hint: 'Una ricetta codificata...', desc: 'Una ricetta con numeri al posto degli ingredienti' },
          { id: 'c2', room: 'sala_giochi', emoji: '🎮', hint: 'Un record sospetto...', desc: 'Il record del gioco è 4-7-2, ma nessuno ci è mai arrivato' },
          { id: 'c3', room: 'terrazza', emoji: '⭐', hint: 'Le stelle indicano...', desc: 'Tre stelle brillano più delle altre: la prima, la quarta, la settima' },
          { id: 'c4', room: 'cucina', emoji: '🔢', hint: 'I numeri nascosti...', desc: 'Sotto il pentolino: 4-7-2 con un cerchio rosso' },
          { id: 'c5', room: 'sala_giochi', emoji: '🗝️', hint: 'La chiave è nel gioco...', desc: 'Leo dice: "Il codice è nel gioco più difficile"' }
        ],
        question: 'Qual è il codice per aprire il forziere?',
        answers: ['472', '4-7-2', '4 7 2', 'quattro sette due'],
        correctAnswer: '472',
        rewardCoins: 50,
        rewardAcc: null,
        rewardTitle: null
      },
      {
        id: 'mystery_4', name: 'Il Mistero della Piscina', emoji: '🏊',
        desc: 'Qualcosa di misterioso è successo alla piscina ieri notte...',
        rooms: ['piscina', 'giardino', 'bar', 'atrio'],
        clues: [
          { id: 'c1', room: 'piscina', emoji: '💧', hint: 'Acqua ovunque...', desc: 'L\'acqua della piscina è diventata verdastra' },
          { id: 'c2', room: 'giardino', emoji: '🌺', hint: 'Fiori calpestati...', desc: 'I fiori vicino alla piscina sono stati calpestati' },
          { id: 'c3', room: 'bar', emoji: '🧃', hint: 'Succhi scomparsi...', desc: 'Tutte le bottiglie di succo d\'ananas sono vuote' },
          { id: 'c4', room: 'piscina', emoji: '📸', hint: 'Una foto compromettente...', desc: 'Una foto di Rigo che dorme con i fenicotteri gonfiabili' },
          { id: 'c5', room: 'atrio', emoji: '🎭', hint: 'Una maschera nascosta...', desc: 'Una maschera da festa nascosta dietro la reception' }
        ],
        question: 'Cosa è successo alla piscina ieri notte?',
        answers: ['festa', 'party', 'festa di notte', 'una festa'],
        correctAnswer: 'festa',
        rewardCoins: 60,
        rewardAcc: null,
        rewardTitle: null
      },
      {
        id: 'mystery_5', name: 'Il Grande Enigma', emoji: '🕵️',
        desc: 'Tutti i misteri del Miraggio sono collegati. Chi è il cervello di tutto?',
        rooms: ['atrio', 'sala_giochi', 'piscina', 'discoteca', 'giardino', 'bar', 'terrazza', 'camera', 'cucina'],
        clues: [
          { id: 'c1', room: 'atrio', emoji: '📋', hint: 'Il libro degli ospiti...', desc: 'Un nome appare ripetutamente: "Il Professore"' },
          { id: 'c2', room: 'cucina', emoji: '🧪', hint: 'Sostanze misteriose...', desc: 'Delle polveri colorate nascoste nel condimento' },
          { id: 'c3', room: 'terrazza', emoji: '🔭', hint: 'Un telescopio rivolto...', desc: 'Il telescopio è puntato verso la stanza di un ospite' },
          { id: 'c4', room: 'sala_giochi', emoji: '♟️', hint: 'Scacchi e strategia...', desc: 'Una partita di scacchi lasciata a metà con una mossa vincente' },
          { id: 'c5', room: 'camera', emoji: '📖', hint: 'Un diario nascosto...', desc: 'Un diario con tutti i segreti del Miraggio' },
          { id: 'c6', room: 'discoteca', emoji: '🎤', hint: 'Un messaggio in codice...', desc: 'Una canzone con parole che formano un messaggio' }
        ],
        question: 'Chi è il cervello di tutti i misteri del Miraggio?',
        answers: ['tino', 'il professore', 'professore', 'leo'],
        correctAnswer: 'tino',
        rewardCoins: 100,
        rewardAcc: null,
        rewardTitle: 'master_detective'
      },

      /* ==================== ENIGMI DIMENSIONALI ==================== */
      {
        id: 'mystery_dark_1', name: 'Il Portale Oscuro', emoji: '🌑',
        desc: 'Un portale luminoso appare nell\'Atrio Oscuro. Qualcuno lo ha aperto…',
        rooms: ['atrio_dark'],
        clues: [
          { id: 'dc1', room: 'atrio_dark', emoji: '🕯️', hint: 'La candela indica…', desc: 'Una candela con la scritta "entra"' },
          { id: 'dc2', room: 'atrio_dark', emoji: '📜', hint: 'Un rotolo antico…', desc: 'Un rotolo che dice: "solo le ombre entrano"' },
          { id: 'dc3', room: 'atrio_dark', emoji: '🔮', hint: 'La sfera riflette…', desc: 'La sfera di cristallo mostra il volto di un\'ombra' }
        ],
        question: 'Chi ha aperto il portale nell\'Atrio Oscuro?',
        answers: ['lola_dark', 'ombra', 'pino_dark'],
        correctAnswer: 'ombra',
        rewardCoins: 30,
        rewardAcc: 'void_crystal',
        rewardTitle: null
      },
      {
        id: 'mystery_neon_1', name: 'Il Bug Neon', emoji: '💜',
        desc: 'Un errore nel sistema dell\'Atrio Neon sta corrompendo i dati.',
        rooms: ['atrio_neon'],
        clues: [
          { id: 'nc1', room: 'atrio_neon', emoji: '💻', hint: 'Lo schermo lampeggia…', desc: 'Un codice di errore: #NULL_404' },
          { id: 'nc2', room: 'atrio_neon', emoji: '📡', hint: 'Il segnale è distorto…', desc: 'Il segnale porta al server centrale' },
          { id: 'nc3', room: 'atrio_neon', emoji: '🔌', hint: 'Il cavo sanguina…', desc: 'Un cavo con scritte rosse: "SYSTEM OVERRIDE"' }
        ],
        question: 'Qual è il codice per correggere il bug?',
        answers: ['NULL_404', '404', 'NULL'],
        correctAnswer: 'NULL_404',
        rewardCoins: 35,
        rewardAcc: 'neon_chip',
        rewardTitle: null
      },
      {
        id: 'mystery_steam_1', name: 'Il Macchinario', emoji: '⚙️',
        desc: 'Un congegno nella Sala Giochi Steampunk non funziona correttamente.',
        rooms: ['sala_giochi_steam'],
        clues: [
          { id: 'sc1', room: 'sala_giochi_steam', emoji: '⚙️', hint: 'L\'ingranaggio manca…', desc: 'Un ingranaggio rotto con la lettera "R"' },
          { id: 'sc2', room: 'sala_giochi_steam', emoji: '🔧', hint: 'La chiave inglese…', desc: 'Una chiave con iscritto "R3VERSO"' },
          { id: 'sc3', room: 'sala_giochi_steam', emoji: '🔩', hint: 'Le viti parlano…', desc: '3 viti in fila: R, 3, 4' }
        ],
        question: 'Qual è il codice per riparare il macchinario?',
        answers: ['R3VERSO', 'R34', 'R345'],
        correctAnswer: 'R3VERSO',
        rewardCoins: 30,
        rewardAcc: 'steam_wrench',
        rewardTitle: null
      },
      {
        id: 'mystery_dark_2', name: 'L\'Ombra Profonda', emoji: '🌑',
        desc: 'Un\'ombra si aggira per la Discoteca Oscura. Qualcuno è stato corrotto.',
        rooms: ['discoteca_dark'],
        clues: [
          { id: 'dd1', room: 'discoteca_dark', emoji: '🎭', hint: 'La maschera è diversa…', desc: 'Una maschera con gli occhi di un\'ombra' },
          { id: 'dd2', room: 'discoteca_dark', emoji: '💀', hint: 'Il corpo è freddo…', desc: 'Un corpo di vapore che non si scalda' },
          { id: 'dd3', room: 'discoteca_dark', emoji: '🕯️', hint: 'La candela si spegne…', desc: 'La candela si spegne solo quando c\'è un\'ombra vicina' }
        ],
        question: 'Chi è l\'Ombra Profonda?',
        answers: ['ombra', 'max_dark', 'stella_dark'],
        correctAnswer: 'ombra',
        rewardCoins: 40,
        rewardAcc: 'shadow_amulet',
        rewardTitle: 'shadow_walker'
      },
      {
        id: 'mystery_neon_2', name: 'Il Virus Ciber', emoji: '💜',
        desc: 'Un virus sta infettando la Terrazza Neon. Tutti i dati sono a rischio.',
        rooms: ['terrazza_neon'],
        clues: [
          { id: 'nn1', room: 'terrazza_neon', emoji: '📡', hint: 'Il segnale è debole…', desc: 'Il segnale ha un pattern: virus' },
          { id: 'nn2', room: 'terrazza_neon', emoji: '💡', hint: 'La luce lampeggia…', desc: 'Le luci lampeggiano in sequenza: INFERNO' },
          { id: 'nn3', room: 'terrazza_neon', emoji: '💾', hint: 'Il chip è corrotto…', desc: 'Un chip con scritto "VIRUS.INF" ' }
        ],
        question: 'Qual è il nome del virus?',
        answers: ['INFERNO', 'virus', 'inferno'],
        correctAnswer: 'INFERNO',
        rewardCoins: 35,
        rewardAcc: 'anti_virus',
        rewardTitle: null
      },
      {
        id: 'mystery_steam_2', name: 'La Macchina del Tempo', emoji: '⚙️',
        desc: 'Una macchina misteriosa nella Terrazza Vittoriana sembra viaggiare nel tempo.',
        rooms: ['terrazza_steam'],
        clues: [
          { id: 'tt1', room: 'terrazza_steam', emoji: '⚙️', hint: 'La leva è mossa…', desc: 'Una leva con le iscrizioni: 1888, 2025' },
          { id: 'tt2', room: 'terrazza_steam', emoji: '🕰️', hint: 'L\'orologio va indietro…', desc: 'L\'orologio segna le 12:00 ma l\'ora è diversa' },
          { id: 'tt3', room: 'terrazza_steam', emoji: '🔧', hint: 'I pezzi sono ovunque…', desc: 'I pezzi formano la parola: TIME' }
        ],
        question: 'Qual è l\'anno di destinazione della macchina del tempo?',
        answers: ['1888', '2025', 'time'],
        correctAnswer: '1888',
        rewardCoins: 30,
        rewardAcc: 'time_machine',
        rewardTitle: 'time_traveler'
      }
    ],

    story3: {
      lola: "Ha un archivio segreto di cravatte sorridenti. La prossima festa la inaugura lei.",
      pino: "Una volta la valigia è tornata con un souvenir di un posto che non esiste. Non ne parla volentieri.",
      leo: "Sta programmando un’IA che perde a scacchi apposta per far piacere agli umani.",
      guest2: "Il suo corno da unicorno funziona davvero… come lampada. Con 4 livelli di luce da festa.",
      rigo: "Sa il nome di ogni fenicottero gonfiabile della piscina. Tutti si chiamano Federico.",
      max: "Ha un remix della sveglia del Miraggio che fa dormire. Lo tiene per le emergenze.",
      nina: "Le margherite le confidano i segreti del giardino. Il cespuglio invece tace (è timido).",
      guest1: "Ha vinto un concorso di sonno nel 2019. Il premio era un altro pisolino.",
      gigi: "Tiene una collezione di olive famose. Quella che ha visto tutto è la sua preferita.",
      stella: "Ha dato un nome a tutte le stelle cadenti di quest’anno. La prossima si chiamerà come te.",
      tino: "Il suo nido segreto è sopra la cucina: lì custodisce patatine e ricordi. In quest’ordine.",
      sergio: "La sua ricetta più preziosa è quella delle patatine della nonna. La nonna non la svela nemmeno a lui."
    },
    furnitureShop: [
      { e: "🪴", name: "Pianta fortunata", cost: 20, prod: 1, desc: "produce 1 🪙 ogni 30s" },
      { e: "🛋️", name: "Divano delle idee", cost: 60, prod: 2, desc: "produce 2 🪙 ogni 30s" },
      { e: "🎹", name: "Pianola magica", cost: 120, prod: 3, desc: "produce 3 🪙 ogni 30s" },
      { e: "🖼️", name: "Quadro parlante", cost: 40, prod: 1, desc: "ogni tanto racconta una barzelletta" },
      { e: "⏰", name: "Sveglia gentile", cost: 35, prod: 1, desc: "non sveglia: accarezza" },
      { e: "🧸", name: "Orsetto coccole", cost: 25, prod: 1, desc: "produce coccole (e 1 🪙)" },
      { e: "🕹️", name: "Cabinet arcade", cost: 90, prod: 2, desc: "produce 2 🪙 ogni 30s" },
      { e: "🍩", name: "Ciambella infinita", cost: 30, prod: 1, desc: "si rigenera da sola" },
      { e: "💡", name: "Lampada dei sogni", cost: 55, prod: 2, desc: "illumina le idee (e le monete)" },
{ e: "🛁", name: "Vasca rilassante", cost: 80, prod: 2, desc: "bolle di sapone e monete" }
     ],
     shadowShop: [
       { e: "🗡️", name: "Pugnale d'ombra", cost: 100, keys: 5, desc: "arma segreta dell'underground", rare: true },
       { e: "💀", name: "Teschio d'ombra", cost: 150, keys: 8, desc: "porta fortuna oscura", rare: true },
       { e: "🔮", name: "Sfera d'ombra", cost: 200, keys: 12, desc: "produce 3 🪙 ogni 30s", rare: true, prod: 3 },
       { e: "🗝️", name: "Chiave oscura", cost: 50, keys: 3, desc: "chiavi per il mercato", rare: true },
       { e: "📜", name: "Rotolo segreto", cost: 80, keys: 5, desc: "svela un indizio", rare: true },
       { e: "👑", name: "Corona d'ombra", cost: 300, keys: 20, desc: "titolo esclusivo", rare: true }
     ],
     societyMissions: [
       { t: "society", n: 3, title: "Incontro Segreto", desc: "Partecipa a 3 incontri nel Sotterraneo" },
       { t: "shadow", n: 1, title: "Oggetto Raro", desc: "Trova un oggetto raro nel Sotterraneo" },
       { t: "keys", n: 5, title: "Collezionista di Chiavi", desc: "Raccogli 5 Chiavi Oscure" },
       { t: "shadow_talk", n: 5, title: "Soci Fedeli", desc: "Parla con 5 NPC ombra" },
       { t: "society", n: 10, title: "Maestro Ombra", desc: "Partecipa a 10 incontri segreti" }
     ],
      events: [
       { h: 12, m: 0, emoji: "🍹", name: "Ora dello Spritz", msg: "🍹 È l'Ora dello Spritz: per 30 minuti tutte le monete varranno il doppio!", mult: 2, dur: 30 },
       { h: 21, m: 0, emoji: "🪩", name: "Festa a sorpresa", msg: "🪩 Festa a sorpresa! Tutti ballano e le monete valgono il doppio!", mult: 2, dur: 30 }
     ],

     // Seasonal Live Events
     seasonalEvents: [
       {
         id: 'halloween', name: 'Halloween', emoji: '🎃',
         startDate: '10-24', endDate: '11-05', announceStart: '10-17',
         desc: 'Mostri amichevoli, costumi e dolcetti! Parla con i fantasmi per ottenere caramelle.',
         weatherOverride: 'fog', weatherColor: 'rgba(150,80,200,0.12)',
         ambientParticles: 'ghost',
         activities: [
           { id: 'costume_contest', name: 'Costume Contest', type: 'minigame', desc: 'Scegli il costume migliore e vota con gli NPC' },
           { id: 'candy_hunt', name: 'Caccia Dolcetti', type: 'collection', desc: 'Raccogli caramelle sparse nelle stanze' },
           { id: 'ghost_hunt', name: 'Caccia Fantasmi', type: 'quest', desc: 'Parla con i fantasmi amichevoli per indizi' }
         ],
         rewards: {
           accessory: 'pumpkin_hat', outfit: 'witch_dress',
           title: 'trick_or_treater', furniture: 'pumpkin_decor',
           coins: 50, candyReward: 100
         }
       },
       {
         id: 'christmas', name: 'Christmas', emoji: '🎄',
         startDate: '12-17', endDate: '12-31', announceStart: '12-10',
         desc: 'Magico Natale al Miraggio! Calendario dell\'Avvento, Secret Santa e pattinaggio.',
         weatherOverride: 'snow', weatherColor: 'rgba(100,150,255,0.12)',
         ambientParticles: 'snow',
         activities: [
           { id: 'advent_calendar', name: 'Calendario Avvento', type: 'collection', desc: 'Apri una porta ogni giorno per ricevere ricompense' },
           { id: 'secret_santa', name: 'Secret Santa', type: 'quest', desc: 'Spedisci un regalo al tuo Secret Santa ogni giorno' },
           { id: 'ice_skating', name: 'Pattinaggio', type: 'minigame', desc: 'Pattina sul ghiaccio per guadagnare monete' }
         ],
         rewards: {
           accessory: 'santa_hat', outfit: 'santa_outfit',
           title: 'natale', furniture: 'christmas_tree',
           coins: 75, adventDay: 24
         }
       },
       {
         id: 'easter', name: 'Easter', emoji: '🥚',
         startDate: '04-10', endDate: '04-24', announceStart: '04-03',
         desc: 'Uova di Pasqua, coniglietti e primavera al giardino!',
         weatherOverride: 'rain', weatherColor: 'rgba(255,150,200,0.12)',
         ambientParticles: 'petals',
         activities: [
           { id: 'egg_hunt', name: 'Caccia Uova', type: 'collection', desc: 'Trova le uova nascoste nelle stanze' },
           { id: 'bunny_quest', name: 'Missione Coniglietto', type: 'quest', desc: 'Aiuta il coniglietto di Pasqua con 3 task' },
           { id: 'spring_garden', name: 'Giardino Primaverile', type: 'minigame', desc: 'Pianta fiori e raccogli primule' }
         ],
         rewards: {
           accessory: 'bunny_ears', outfit: 'bunny_dress',
           title: 'pasqua', furniture: 'easter_nest',
           coins: 40, eggsReward: 50
         }
       },
       {
         id: 'summer', name: 'Summer', emoji: '🌊',
         startDate: '06-01', endDate: '08-31', announceStart: '05-24',
         desc: 'Estate al Miraggio! Surf, festa in piscina e tramonti dorati.',
         weatherOverride: 'clear', weatherColor: 'rgba(255,220,100,0.12)',
         ambientParticles: 'waves',
         activities: [
           { id: 'surf_minigame', name: 'Surf', type: 'minigame', desc: 'Cavalca le onde e guadagna punteggio' },
           { id: 'pool_party', name: 'Festa in Piscina', type: 'quest', desc: 'Partecipa alla festa in piscina ogni giorno' },
           { id: 'sunset_gathering', name: 'Tramonto', type: 'collection', desc: 'Raccogli conchiglie al tramonto' }
         ],
         rewards: {
           accessory: 'surf_board', outfit: 'surf_outfit',
           title: 'estate', furniture: 'beach_chair',
           coins: 60, surfBest: 500
         }
       }
     ],
    dailyGuestMult: 2,
    emotes: [
      { id: "wave", e: "👋", label: "Ciao", txt: "Ciao a tutti!", anim: "wave", dur: 1600 },
      { id: "dance", e: "🕺", label: "Ballo", txt: "🎶 mi piace ballare!", anim: "dance", dur: 2600 },
      { id: "jump", e: "🤸", label: "Salto", txt: "Hop!", anim: "jump", dur: 1100 },
      { id: "clap", e: "👏", label: "Applausi", txt: "Bravi, bravi!", anim: "clap", dur: 1600 },
      { id: "heart", e: "💖", label: "Cuore", txt: "💖 per tutti voi!", anim: "heart", dur: 1800 },
      { id: "angry", e: "😠", label: "Rabbia", txt: "Oh, adesso basta!", anim: "angry", dur: 1500 },
      { id: "laugh", e: "😂", label: "Risata", txt: "Ahahah!", anim: "laugh", dur: 1500 },
      { id: "dive", e: "🤿", label: "Tuffo", txt: "Pluff!", anim: "dive", dur: 1600 }
    ],

    wardrobe: {
      hairStyle: [
        { id: "short", label: "Corto", cost: 0 },
        { id: "long", label: "Lungo", cost: 15 },
        { id: "curly", label: "Ricci", cost: 25 },
        { id: "puff", label: "Fiocco", cost: 40 },
        { id: "bald", label: "Palla di luce", cost: 12 }
      ],
      acc: [
        { id: "none", label: "Niente", cost: 0 },
        { id: "glasses", label: "Occhiali", cost: 20 },
        { id: "cap", label: "Cappellino", cost: 30 },
        { id: "headphones", label: "Cuffie", cost: 45 },
        { id: "crown", label: "Coroncina", cost: 90 },
        { id: "magnifier", label: "Lente d'ingrandimento", cost: 0 },
        { id: "pumpkin_hat", label: "Cappello Zucca", cost: 0 },
        { id: "santa_hat", label: "Babbo Natale", cost: 0 },
        { id: "bunny_ears", label: "Orecchie Coniglio", cost: 0 },
        { id: "surf_board", label: "Tavola Surf", cost: 0 },
        { id: "hammer", label: "Martello", cost: 0 },
        { id: "paintbrush", label: "Pennello", cost: 0 },
        { id: "stamps", label: "Bollini", cost: 0 }
      ],
      skin: ["#ffe0bd", "#f2c9a0", "#eab98a", "#c68b59", "#8d5a2b"],
      hairColor: ["#4a2a14", "#2b1b0e", "#d9a441", "#c0392b", "#8e44ad", "#2c3e50", "#7f8c8d", "#ecf0f1"],
      top: ["#ff5d9e", "#5b3bd6", "#00c9b7", "#ff8f3c", "#3ddc97", "#e84f8a", "#4ea8ff", "#ffd166"],
      pants: ["#3a2a8f", "#1f3b73", "#7b2d8b", "#c2185b", "#0b7285", "#37474f"]
    },

badges: [
       { min: 0, title: "Neo-arrivato", icon: "🌱" },
       { min: 80, title: "Ospite allegro", icon: "😄" },
       { min: 160, title: "Chiacchierone", icon: "💬" },
       { min: 260, title: "Stella dell'hotel", icon: "⭐" },
       { min: 420, title: "Vip del Miraggio", icon: "👑" },
       { min: 700, title: "Leggenda vivente", icon: "🌟" }
     ],

     species: [
       { id: "unicorn", name: "Unicorno", emoji: "🦄", color: "#ffd166", tier: "comune", glow: "rgba(255,209,102,0.4)", hint: "magico e luminoso" },
       { id: "pegasus", name: "Pegaso", emoji: "🦄", color: "#87ceeb", tier: "raro", glow: "rgba(135,206,235,0.4)", hint: "alato e volante" },
       { id: "dragon", name: "Drago", emoji: "🐉", color: "#ff4500", tier: "epico", glow: "rgba(255,69,0,0.4)", hint: "soffia fiamme" },
       { id: "fire_snake", name: "Serpente di fuoco", emoji: "🐍", color: "#ff6347", tier: "raro", glow: "rgba(255,99,71,0.4)", hint: "luminoso e caldo" },
       { id: "crocodile", name: "Coccodrillo esotico", emoji: "🐊", color: "#228b22", tier: "comune", glow: "rgba(34,139,34,0.4)", hint: "tropicale e acquatico" },
       { id: "snow_tiger", name: "Tigre delle nevi", emoji: "🐯", color: "#b0e0e6", tier: "raro", glow: "rgba(176,224,230,0.4)", hint: "bianco e freddo" },
       { id: "iguana", name: "Lucertola delle isole", emoji: "🦎", color: "#32cd32", tier: "comune", glow: "rgba(50,205,50,0.4)", hint: "tropicale e veloce" },
       { id: "macaw", name: "Ara scarlatto", emoji: "🦜", color: "#ff2400", tier: "comune", glow: "rgba(255,36,0,0.4)", hint: "piume rosse intense" },
       { id: "parrot", name: "Pappagallo tropicale", emoji: "🦜", color: "#ffa500", tier: "comune", glow: "rgba(255,165,0,0.4)", hint: "colorato e canta" },
        { id: "rhino", name: "Rinoceronte", emoji: "🦏", color: "#8b4513", tier: "raro", glow: "rgba(139,69,19,0.4)", hint: "forte e coriaceo" },
        { id: "elephant", name: "Elefante", emoji: "🐘", color: "#808080", tier: "leggendario", glow: "rgba(128,128,128,0.4)", hint: "saggio e portatore" },
        { id: "flamingo", name: "Flamingo", emoji: "🦩", color: "#ff69b4", tier: "comune", glow: "rgba(255,105,180,0.4)", hint: "rosa neon e gentile" }
      ],

      /* ==================== BREEDING / ALLEVAMENTO ==================== */
      breeding: {
        eggRarity: { common: 0.55, rare: 0.30, epic: 0.12, legendary: 0.03 },
        evolutionReq: { level: 5, happiness: 90, hunger: 70, tricks: 3, careTotal: 5 },
        breedingCooldown: 300000,
        hybridNames: {
          fire_unicorn: { name: "Unicorno di Fuoco", emoji: "🦄‍🔥", color: "#ff4500", tier: "epico", hint: "magico e infernale" },
          shadow_wyvern: { name: "Wyvern delle Ombre", emoji: "🐉‍🌑", color: "#8b008b", tier: "epico", hint: "volante e misterioso" },
          celestial_stallion: { name: "Cavaliere Celeste", emoji: "🐴‍✨", color: "#ffd700", tier: "leggendario", hint: "saggezza celeste" },
          infernal_dragon: { name: "Drago Infernale", emoji: "🐍‍🔥", color: "#dc143c", tier: "leggendario", hint: "fuoco puro" },
          frost_drake: { name: "Dracco delle Nevi", emoji: "🐯‍❄️", color: "#b0e0e6", tier: "epico", hint: "freddo glaciale" },
          river_gryphon: { name: "Grifone Fluviale", emoji: "🐊‍🦅", color: "#008b8b", tier: "epico", hint: "acqua e aria" },
          tropical_parrot_dragon: { name: "Dragone Tropicale", emoji: "🦎‍🦩", color: "#ff6347", tier: "raro", hint: "caldo tropicale" },
          woolly_mammoth: { name: "Mammuth Lanoso", emoji: "🦜‍🐘", color: "#8b4513", tier: "raro", hint: "forte e saggio" },
          rose_rhinoceros: { name: "Rinoceronte Rosa", emoji: "🦏‍🦩", color: "#ff69b4", tier: "comune", hint: "gentile e rosa" },
          celestial_titan: { name: "Titano Celeste", emoji: "🦄‍🐘", color: "#ffd700", tier: "leggendario", hint: "potere cosmico" },
          wind_flamingo: { name: "Fenicottero del Vento", emoji: "🦩‍💨", color: "#87ceeb", tier: "raro", hint: "veloce e leggero" },
          moon_phoenix: { name: "Fenice Lunare", emoji: "🦅‍🌙", color: "#9370db", tier: "leggendario", hint: "rinasce dalla luna" },
          storm_eagle: { name: "Aquila Tempesta", emoji: "🦅‍⚡", color: "#4169e1", tier: "epico", hint: "tuono e fulmine" },
          desert_cobra: { name: "Cobra del Deserto", emoji: "🐍‍🏜️", color: "#ff8c00", tier: "raro", hint: "calore del deserto" },
          ocean_whale: { name: "Balena Oceanica", emoji: "🐋‍🌊", color: "#1e90ff", tier: "epico", hint: "profondità marine" },
          forest_owl: { name: "Gufo della Foresta", emoji: "🦉‍🌲", color: "#228b22", tier: "raro", hint: "sapiente e notturno" },
          mountain_bear: { name: "Orso Montano", emoji: "🐻‍🏔️", color: "#8b4513", tier: "comune", hint: "forte e robusto" },
          lava_lizard: { name: "Lucertola di Lava", emoji: "🦎‍🔥", color: "#ff4500", tier: "epico", hint: "calore vulcanico" },
          crystal_parrot: { name: "Pappagallo Cristallino", emoji: "🦜‍💎", color: "#e0e0e0", tier: "leggendario", hint: "trasparenza pura" },
          ghost_unicorn: { name: "Unicorno Spettrale", emoji: "🦄‍👻", color: "#9370db", tier: "epico", hint: "fantasma e magia" },
          fire_flamingo: { name: "Fenicottero di Fuoco", emoji: "🦩‍🔥", color: "#ff6347", tier: "raro", hint: "calore e grazia" },
          ice_dragon: { name: "Drago di Ghiaccio", emoji: "🐉‍❄️", color: "#87ceeb", tier: "epico", hint: "freddo estremo" },
          thunder_pegasus: { name: "Pegaso Tuonante", emoji: "🦄‍⚡", color: "#ffd700", tier: "leggendario", hint: "tuono e lampi" },
          shadow_cat: { name: "Gatto delle Ombre", emoji: "🐱‍🌑", color: "#2f2f2f", tier: "raro", hint: "misterioso e veloce" },
          golden_lizard: { name: "Lucertola Dorata", emoji: "🦎‍🥇", color: "#ffd700", tier: "epico", hint: "oro e fortuna" },
          star_parrot: { name: "Pappagallo Stellare", emoji: "🦜‍⭐", color: "#fff8dc", tier: "leggendario", hint: "stelle nel piumaggio" },
          flame_tiger: { name: "Tigre Infuocata", emoji: "🐯‍🔥", color: "#ff4500", tier: "epico", hint: "furia e calore" },
          moon_iguana: { name: "Lucertola Lunare", emoji: "🦎‍🌙", color: "#d8bfd8", tier: "raro", hint: "luna e mistero" },
          storm_macaw: { name: "Ara Tempesta", emoji: "🦜‍⚡", color: "#4169e1", tier: "epico", hint: "tempesta e colore" },
          diamond_rhino: { name: "Rinoceronte Diamante", emoji: "🦏‍💎", color: "#b9f2ff", tier: "leggendario", hint: "durata e brillanza" }
        },
        breedingCombinations: [
          ["unicorn","dragon","fire_unicorn"],
          ["pegasus","dragon","shadow_wyvern"],
          ["unicorn","pegasus","celestial_stallion"],
          ["fire_snake","dragon","infernal_dragon"],
          ["snow_tiger","dragon","frost_drake"],
          ["crocodile","pegasus","river_gryphon"],
          ["iguana","flamingo","tropical_parrot_dragon"],
          ["macaw","elephant","woolly_mammoth"],
          ["rhino","flamingo","rose_rhinoceros"],
          ["unicorn","elephant","celestial_titan"],
          ["pegasus","flamingo","wind_flamingo"],
          ["unicorn","dragon","moon_phoenix"],
          ["pegasus","flamingo","storm_eagle"],
          ["dragon","flamingo","fire_flamingo"],
          ["dragon","snow_tiger","ice_dragon"],
          ["pegasus","unicorn","thunder_pegasus"],
          ["dragon","pegasus","shadow_cat"],
          ["unicorn","fire_snake","golden_lizard"],
          ["pegasus","macaw","star_parrot"],
          ["dragon","snow_tiger","flame_tiger"],
          ["iguana","pegasus","moon_iguana"],
          ["macaw","pegasus","storm_macaw"],
          ["rhino","elephant","diamond_rhino"],
          ["unicorn","flamingo","ghost_unicorn"],
          ["fire_snake","pegasus","desert_cobra"],
          ["crocodile","dragon","ocean_whale"],
          ["snow_tiger","pegasus","forest_owl"],
          ["iguana","dragon","lava_lizard"],
          ["unicorn","macaw","crystal_parrot"],
          ["rhino","dragon","mountain_bear"],
          ["flamingo","elephant","ocean_whale"],
          ["crocodile","snow_tiger","forest_owl"],
          ["iguana","elephant","mountain_bear"],
          ["macaw","dragon","lava_lizard"],
          ["flamingo","dragon","storm_eagle"],
          ["snow_tiger","pegasus","moon_iguana"],
          ["rhino","pegasus","storm_macaw"],
          ["crocodile","flamingo","ocean_whale"],
          ["unicorn","iguana","moon_iguana"],
          ["dragon","macaw","lava_lizard"],
          ["pegasus","crocodile","ocean_whale"],
          ["flamingo","iguana","moon_iguana"],
          ["unicorn","rhino","diamond_rhino"],
          ["dragon","flamingo","fire_flamingo"],
          ["snow_tiger","macaw","storm_macaw"],
          ["crocodile","pegasus","river_gryphon"],
          ["iguana","unicorn","moon_iguana"],
          ["macaw","flamingo","wind_flamingo"],
          ["elephant","dragon","celestial_titan"],
          ["flamingo","pegasus","wind_flamingo"],
          ["unicorn","snow_tiger","frost_drake"]
        ],
        hybridNamesFor: {}
      },

      ambientInterval: 7000,

      // Ghost NPCs
      ghosts: [
        { id: 'ghost_maid', name: 'Cameriere Fantasma', emoji: '👻', color: 'rgba(180,220,255,0.6)', room: 'cucina', dialogue: [
          'Oooh... il raviolo segreto... lo trovi solo di notte...',
          'Il chef mi ha licenziato... ma io cucino ancora per gli ospiti...',
          'Vuoi sapere la ricetta? Portami 3 uova dorate!'
        ], mission: { type: 'collect', item: 'uova', count: 3, reward: 50 }, reward: 25 },
        { id: 'ghost_bride', name: 'Sposa Fantasma', emoji: '👻', color: 'rgba(255,200,250,0.6)', room: 'discoteca', dialogue: [
          'Il mio sposo non è mai arrivato...',
          'Balliamo insieme, come una volta...',
          'Se mi balli una volta, ti darò il mio tesoro nascosto...'
        ], mission: { type: 'dance', count: 1, reward: 75 }, reward: 35 },
        { id: 'ghost_child', name: 'Bambino Spirito', emoji: '👻', color: 'rgba(200,255,200,0.6)', room: 'giardino', dialogue: [
          'Gioca con me! Nessuno gioca più con me...',
          'Ho perso la mia palla... l\'hai vista?',
          'Se mi trovi la palla, ti darò una stella!'
        ], mission: { type: 'find', item: 'palla', reward: 60 }, reward: 30 },
        { id: 'ghost_musician', name: 'Musicista Spettrale', emoji: '👻', color: 'rgba(255,255,180,0.6)', room: 'bar', dialogue: [
          'La mia ultima sinfonia... non è mai stata completata...',
          'Ascolti la musica? È sempre la stessa melodia...',
          'Se mi porti uno strumento, ti farò una melodia speciale...'
        ], mission: { type: 'collect', item: 'strumento', count: 1, reward: 80 }, reward: 40 },
        { id: 'ghost_chef', name: 'Chef Vischio', emoji: '👻', color: 'rgba(255,220,180,0.6)', room: 'cucina', dialogue: [
          'Il mio risotto... è ancora caldo...?',
          'Ho cucinato per 1000 ospiti... ma nessuno ha assaggiato...',
          'Se mi porti gli ingredienti, ti farò un piatto speciale!'
        ], mission: { type: 'collect', item: 'ingredienti', count: 2, reward: 90 }, reward: 45 }
      ],
      ghostSpawnChance: 0.15,
      ghostDespawnTime: 30000,

      // Carnival Minigame
      minigame: {
        duration: 30000,
        spawnInterval: 800,
        targetLife: 1500,
        maxTargets: 5,
        rewards: [
          { minScore: 0, coins: 0, xp: 0 },
          { minScore: 10, coins: 5, xp: 2 },
          { minScore: 25, coins: 15, xp: 5 },
          { minScore: 50, coins: 30, xp: 10 },
          { minScore: 100, coins: 60, xp: 20 }
        ],
        targets: [
          { id: 'mole', emoji: '🦔', points: 1, color: '#8b4513' },
          { id: 'bomb', emoji: '💣', points: -3, color: '#333' },
          { id: 'star', emoji: '⭐', points: 5, color: '#ffd166' },
          { id: 'coin', emoji: '🪙', points: 2, color: '#b8860b' }
        ]
      },

      // Dance Battle
      danceBattle: {
        duration: 30000,
        bpm: 120,
        arrowSpeed: 3,
        hitZone: 0.15,
        arrows: ['←', '↑', '→', '↓'],
        arrowColors: { '←': '#ff5d9e', '↑': '#5d9eff', '→': '#5dff9e', '↓': '#ffd166' },
        rewards: [
          { minScore: 0, coins: 0, xp: 0 },
          { minScore: 20, coins: 5, xp: 2 },
          { minScore: 50, coins: 15, xp: 5 },
          { minScore: 100, coins: 30, xp: 10 },
          { minScore: 200, coins: 60, xp: 20 }
        ]
      },

      // Weather System
      weather: {
        types: [
          { id: 'clear', name: 'Sereno', emoji: '☀️', color: 'rgba(255,223,100,0.1)', particles: 0 },
          { id: 'cloudy', name: 'Nuvoloso', emoji: '☁️', color: 'rgba(150,150,150,0.15)', particles: 0 },
          { id: 'rain', name: 'Pioggia', emoji: '🌧️', color: 'rgba(100,150,255,0.2)', particles: 80 },
          { id: 'storm', name: 'Tempesta', emoji: '⛈️', color: 'rgba(50,50,80,0.3)', particles: 120 },
          { id: 'snow', name: 'Neve', emoji: '❄️', color: 'rgba(200,220,255,0.2)', particles: 60 },
          { id: 'fog', name: 'Nebbia', emoji: '🌫️', color: 'rgba(180,180,180,0.25)', particles: 40 }
        ],
        changeInterval: 300000,
        lightningChance: 0.02
      },

      // Fortune Wheel
      fortWheel: {
        cooldown: 86400000, // 24h
        maxSpinsPerDay: 3,
        rewards: [
          { id: 'coins_10', emoji: '🪙', label: '+10 🪙', weight: 30, action: (st) => { st.coins += 10; return 'Hai vinto 10 monete!'; } },
          { id: 'coins_25', emoji: '🪙', label: '+25 🪙', weight: 20, action: (st) => { st.coins += 25; return 'Hai vinto 25 monete!'; } },
          { id: 'coins_50', emoji: '💰', label: '+50 🪙', weight: 12, action: (st) => { st.coins += 50; return 'Hai vinto 50 monete!'; } },
          { id: 'xp_20', emoji: '⭐', label: '+20 XP', weight: 18, action: (st) => { st.earned += 20; return 'Hai guadagnato 20 XP!'; } },
          { id: 'xp_50', emoji: '⭐', label: '+50 XP', weight: 8, action: (st) => { st.earned += 50; return 'Hai guadagnato 50 XP!'; } },
         { id: 'title', emoji: '👑', label: 'Titolo', weight: 5, action: (st) => { const bonusTitles = ['principe', 're_hotel', 'stella_notte', 'maestro_ballo', 'leggenda', 'guardiano']; const available = bonusTitles.filter(t => !(st.titles || []).includes(t)); if (available.length > 0) { const tid = available[Math.floor(Math.random() * available.length)]; st.titles = st.titles || []; st.titles.push(tid); const t = D.titles.find(x => x.id === tid); return 'Hai vinto il titolo: ' + (t ? t.emoji + ' ' + t.name : tid) + '!'; } st.coins += 50; return 'Hai tutti i titoli bonus! +50 🪙'; } },
         { id: 'pet_egg', emoji: '🥚', label: 'Uovo raro', weight: 3, action: (st) => { const sp = D.species[Math.floor(Math.random() * D.species.length)]; if (st.pets.length < 3) { st.pets.push({ species: sp.id, name: 'Uovo', level: 1, happiness: 80, hunger: 20, tricks: ['wave'], color: sp.color, born: Date.now(), care: { feedCount: 0, playCount: 0, petCount: 0, totalTime: 0 }, evolutionStage: 'normal', parent1: null, parent2: null }); st.breeding.totalHatchings++; return '🥚 Uovo schiuso! ' + sp.emoji + ' ' + sp.name + ' è nato!'; } return 'Hai già 3 pet!'; } },
          { id: 'mega_coins', emoji: '💎', label: '+100 🪙', weight: 2, action: (st) => { st.coins += 100; return 'JACKPOT! 100 monete dorate!'; } },
          { id: 'jackpot', emoji: '🏆', label: 'JACKPOT', weight: 1, action: (st) => { st.coins += 250; st.earned += 100; return 'JACKPOT! 250 monete + 100 XP! Sei una leggenda!'; } }
        ]
      },

      // Titles system
      titles: [
        { id: 'neo', name: 'Neo-arrivato', emoji: '🌱', desc: 'Il tuo primo giorno al Miraggio', unlock: 'default' },
        { id: 'allegro', name: 'Ospite Allegro', emoji: '😊', desc: 'Guadagna 80 monete', unlock: 'coins_80' },
        { id: 'chiacchierone', name: 'Chiacchierone', emoji: '💬', desc: 'Invia 10 messaggi in chat', unlock: 'chat_10' },
        { id: 'esploratore', name: 'Esploratore', emoji: '🗺️', desc: 'Visita tutte le 9 stanze', unlock: 'all_rooms' },
        { id: 'stella', name: 'Stella dell\'Hotel', emoji: '⭐', desc: 'Raggiungi 260 monete totali', unlock: 'coins_260' },
        { id: 'vip', name: 'VIP del Miraggio', emoji: '👑', desc: 'Raggiungi 420 monete totali', unlock: 'coins_420' },
        { id: 'leggenda', name: 'Leggenda Vivente', emoji: '🌟', desc: 'Raggiungi 700 monete totali', unlock: 'coins_700' },
        { id: 'principe', name: 'Principe del Miraggio', emoji: '🤴', desc: 'Vinci la Ruota della Fortuna', unlock: 'wheel_win' },
        { id: 're_hotel', name: 'Re dell\'Hotel', emoji: '🏰', desc: 'Raggiungi livello 5 con un ospite', unlock: 'friend_5' },
        { id: 'stella_notte', name: 'Stella della Notte', emoji: '🌙', desc: 'Visita una stanza di notte', unlock: 'night_visit' },
        { id: 'maestro_ballo', name: 'Maestro del Ballo', emoji: '💃', desc: 'Vinci il Dance Battle', unlock: 'dance_win' },
        { id: 'guardiano', name: 'Guardiano del Miraggio', emoji: '🛡️', desc: 'Completa 30 missioni', unlock: 'missions_30' },
        { id: 'paranormale', name: 'Paranormale', emoji: '👻', desc: 'Parla con un fantasma', unlock: 'first_ghost' },
        { id: 'collezionista', name: 'Collezionista', emoji: '🎒', desc: 'Raccogli 20 oggetti volanti', unlock: 'collect_20' },
        { id: 'fashion_icon', name: 'Fashion Icon', emoji: '👗', desc: 'Vinci il Fashion Show', unlock: 'fashion_win' },
        { id: 'pet_parent', name: 'Genitore di Pet', emoji: '🐾', desc: 'Adotta 3 animali', unlock: 'pets_3' },
        { id: 'detective', name: 'Detective', emoji: '🔍', desc: 'Risolvi il primo mistero', unlock: 'mystery_solved' },
        { id: 'master_detective', name: 'Master Detective', emoji: '🕵️', desc: 'Risolvi tutti i 5 misteri', unlock: 'all_mysteries' },
        { id: 'trick_or_treater', name: 'Trick or Treater', emoji: '🎃', desc: 'Completa il Halloween', unlock: 'halloween_done' },
        { id: 'natale', name: 'Natale', emoji: '🎄', desc: 'Completa il Christmas', unlock: 'christmas_done' },
        { id: 'pasqua', name: 'Pasqua', emoji: '🥚', desc: 'Completa l\'Easter', unlock: 'easter_done' },
        { id: 'estate', name: 'Estate', emoji: '🌊', desc: 'Completa l\'Estate', unlock: 'summer_done' },
        { id: 'party_animal', name: 'Party Animal', emoji: '🎉', desc: 'Partecipa a tutti gli eventi stagionali', unlock: 'all_seasonal' },
        { id: 'builder', name: 'Builder', emoji: '🏗️', desc: 'Crea la tua prima stanza', unlock: 'first_builder' },
        { id: 'builder_elite', name: 'Builder Elite', emoji: '🏰', desc: 'Crea 5 stanze', unlock: 'builder_5' },
        { id: 'builder_master', name: 'Master Builder', emoji: '🏯', desc: 'Crea 10 stanze', unlock: 'builder_10' },
        { id: 'society_member', name: 'Socio', emoji: '🗿', desc: 'Completa la prima missione segreta', unlock: 'society_first' },
        { id: 'society_elite', name: 'Socio Elite', emoji: '🧙', desc: 'Completa 5 missioni segrete', unlock: 'society_5' },
        { id: 'society_master', name: 'Master Ombra', emoji: '💀', desc: 'Completa tutte le missioni e 100 Chiavi Oscure', unlock: 'society_100' },
        { id: 'narrator', name: 'Narratore', emoji: '📖', desc: 'Rivelare il Sogno di un NPC', unlock: 'npc_sogno' },
        { id: 'sociologist', name: 'Sociologo', emoji: '🔍', desc: 'Rivelare tutti gli archi di un NPC', unlock: 'npc_all' },
        { id: 'hotel_secret', name: 'Segreto dell\'Hotel', emoji: '🌑', desc: 'Rivelare il segreto del Miraggio', unlock: 'hotel_secret' },
        { id: 'shadow_walker', name: 'Camminatore d\'Ombre', emoji: '🌑', desc: 'Risolvi il mistero dell\'Ombra Profonda', unlock: 'mystery_dark_2' },
        { id: 'neon_diver', name: 'Tuffatore Neon', emoji: '💜', desc: 'Risolvi il bug neon', unlock: 'mystery_neon_2' },
        { id: 'time_traveler', name: 'Viaggiatore Temporale', emoji: '⚙️', desc: 'Ripara la Macchina del Tempo', unlock: 'mystery_steam_2' },
         { id: 'dimension_explorer', name: 'Esploratore Dimensionale', emoji: '🌀', desc: 'Visita tutte e 3 le dimensioni', unlock: 'all_dimensions' },
         { id: 'hotel_manager', name: 'Hotel Manager', emoji: '👥', desc: 'Assumi il primo membro dello staff', unlock: 'hotel_manager_ach' },
         { id: 'staff_master', name: 'Staff Master', emoji: '🏨', desc: 'Assumi tutto lo staff', unlock: 'staff_master_ach' },
          { id: 'vip_director', name: 'VIP Director', emoji: '👑', desc: 'Costruisci il Penthouse', unlock: 'vip_hotel_ach' },
          { id: 'breeder', name: 'Allevatore', emoji: '🥚', desc: 'Crea il primo ibrido', unlock: 'first_breed_ach' },
          { id: 'breed_master', name: 'Master Allevatore', emoji: '🏆', desc: 'Crea 20 ibridi', unlock: 'breed_master_ach' },
           { id: 'evolver', name: 'Evolver', emoji: '✨', desc: 'Evolvi il tuo primo pet', unlock: 'first_evolve_ach' },
           { id: 'dj_novice', name: 'DJ Novice', emoji: '🎵', desc: 'Crea il tuo primo brano', unlock: 'first_track_ach' },
           { id: 'dj_producer', name: 'DJ Producer', emoji: '💿', desc: 'Salva 5 brani', unlock: 'dj_producer_ach' },
           { id: 'contest_champion', name: 'Contest Champion', emoji: '🏆', desc: 'Vinci il contest DJ', unlock: 'contest_win_ach' }
         ],

      // Photo mode filters
      photoFilters: [
        { id: 'none', name: 'Nessuno', emoji: '📷', css: 'none' },
        { id: 'vintage', name: 'Vintage', emoji: '🎞️', css: 'sepia(0.6) contrast(1.1) brightness(0.9)' },
        { id: 'noir', name: 'Noir', emoji: '🖤', css: 'grayscale(1) contrast(1.3) brightness(0.8)' },
        { id: 'warm', name: 'Caldo', emoji: '🌅', css: 'sepia(0.3) saturate(1.4) brightness(1.05)' },
        { id: 'cool', name: 'Freddo', emoji: '❄️', css: 'saturate(0.8) hue-rotate(20deg) brightness(1.05)' },
        { id: 'dramatic', name: 'Drammatico', emoji: '🎭', css: 'contrast(1.5) saturate(1.2) brightness(0.85)' },
        { id: 'dreamy', name: 'Sognante', emoji: '💭', css: 'brightness(1.15) saturate(0.9) blur(0.5px)' },
        { id: 'neon', name: 'Neon', emoji: '💜', css: 'saturate(1.8) contrast(1.1) hue-rotate(-10deg)' },
        { id: 'retro', name: 'Retro', emoji: '📼', css: 'sepia(0.4) hue-rotate(-20deg) saturate(1.3)' },
        { id: 'midnight', name: 'Mezzanotte', emoji: '🌙', css: 'brightness(0.7) saturate(1.2) hue-rotate(10deg)' },
      ],

      // NPC Story Arcs — Sogno, Paura, Talento, Relazioni, Segreto Hotel
      npcArcs: {
        lola: {
          sogno: { text: "Sogno di aprire un salone di bellezza tutto mio, dove ogni cliente esce con un sorriso nuovo.", emoji: "🌟", diary: "Lola ha svelato il suo Sogno: un salone di bellezza tutto suo." },
          paura: { text: "Ho paura di dimenticare i volti delle persone che ho aiutato. Un receptionist senza memoria è un receptionist perduto.", emoji: "🌙", diary: "Lola ha rivelato la sua Paura: dimenticare i volti dei clienti." },
          talento: { text: "Il mio talento segreto? So riconoscere un bugiardo dal modo in cui stringe la mano. È un'arte, davvero.", emoji: "⭐", diary: "Lola ha rivelato il suo Talento: leggere le mani dei bugiardi." },
          relazioni: { text: "Pino è l'unico che capisce davvero il ritmo dell'hotel. E Max conosce ogni segreto della discoteca.", emoji: "💕", diary: "Lola ha rivelato le sue Relazioni: Pino e Max sono i suoi alleati." },
          segreto: { text: "Il Miraggio non è un hotel: è un portale. Le stanze si collegano a vite diverse. Ogni ospite che parte... non torna mai nello stesso modo.", emoji: "🌑", diary: "Lola ha rivelato il Segreto dell'Hotel: il Miraggio è un portale." }
        },
        pino: {
          sogno: { text: "Voglio che il lobby diventi il cuore pulsante dell'hotel, dove la musica e le persone si fondono in un'unica melodia.", emoji: "🌟", diary: "Pino ha svelato il suo Sogno: un lobby come centro musicale." },
          paura: { text: "Ho paura che la valigia che aspettavo non arrivi mai. È arrivata vuota la prima volta... non succederà di nuovo.", emoji: "🌙", diary: "Pino ha rivelato la sua Paura: la valigia che non arriva." },
          talento: { text: "Posso cucinare 47 piatti diversi con solo 3 ingredienti base. La cucina è come la musica: bastano poche note per creare un capolavoro.", emoji: "⭐", diary: "Pino ha rivelato il suo Talento: cucinare con pochi ingredienti." },
          relazioni: { text: "Sergio è il cuoco che mi ha insegnato tutto. Lola mi tiene compagnia nelle lunghe notti al desk.", emoji: "💕", diary: "Pino ha rivelato le sue Relazioni: Sergio e Lola." },
          segreto: { text: "Il Miraggio è un portale. Le stanze si collegano a vite diverse. Ogni ospite che parte... non torna mai nello stesso modo.", emoji: "🌑", diary: "Pino ha rivelato il Segreto dell'Hotel: il Miraggio è un portale." }
        },
        leo: {
          sogno: { text: "Sogno di comporre una sinfonia che faccia piangere chi la ascolta. Non di gioia, non di dolore... di verità.", emoji: "🌟", diary: "Leo ha svelato il suo Sogno: una sinfonia della verità." },
          paura: { text: "Ho paura di perdere l'udito. Senza musica, sono solo un uomo nel silenzio. Il silenzio è il mio nemico.", emoji: "🌙", diary: "Leo ha rivelato la sua Paura: perdere l'udito." },
          talento: { text: "Posso identificare qualsiasi strumento dal primo accordo. Ho le orecchie assolute... e un'anima che vibra.", emoji: "⭐", diary: "Leo ha rivelato il suo Talento: orecchie assolute." },
          relazioni: { text: "Guest2 è la mia fonte d'ispirazione. Quando suona, il gioco diventa magia.", emoji: "💕", diary: "Leo ha rivelato le sue Relazioni: Guest2 è la sua musa." },
          segreto: { text: "Il Miraggio è un portale. Le stanze si collegano a vite diverse. Ogni ospite che parte... non torna mai nello stesso modo.", emoji: "🌑", diary: "Leo ha rivelato il Segreto dell'Hotel: il Miraggio è un portale." }
        },
        guest2: {
          sogno: { text: "Voglio che la sala giochi diventi un luogo dove i bambini dimenticano il tempo e trovano solo gioia pura.", emoji: "🌟", diary: "Guest2 ha svelato il suo Sogno: una sala giochi senza tempo." },
          paura: { text: "Ho paura di essere dimenticato. Se nessuno mi ricorda, esisto davvero? La memoria è fragile come un giocattolo rotto.", emoji: "🌙", diary: "Guest2 ha rivelato la sua Paura: essere dimenticato." },
          talento: { text: "So costruire labirinti con i tavoli da biliardo. Nessuno è mai riuscito a trovare l'uscita... e nessuno ha mai smesso di provare.", emoji: "⭐", diary: "Guest2 ha rivelato il suo Talento: costruire labirinti." },
          relazioni: { text: "Leo mi ispira con la sua musica. Max conosce tutti i segreti del locale. Siamo una squadra.", emoji: "💕", diary: "Guest2 ha rivelato le sue Relazioni: Leo e Max." },
          segreto: { text: "Il Miraggio è un portale. Le stanze si collegano a vite diverse. Ogni ospite che parte... non torna mai nello stesso modo.", emoji: "🌑", diary: "Guest2 ha rivelato il Segreto dell'Hotel: il Miraggio è un portale." }
        },
        rigo: {
          sogno: { text: "Voglio che la piscina diventi un'oasi di pace, dove ogni onda porta con sé un sogno.", emoji: "🌟", diary: "Rigo ha svelato il suo Sogno: una piscina come oasi." },
          paura: { text: "Ho paura dell'acqua profonda. Non dell'acqua in sé... ma di ciò che si nasconde sotto la superficie.", emoji: "🌙", diary: "Rigo ha rivelato la sua Paura: l'acqua profonda." },
          talento: { text: "Posso nuotare sott'acqua per 10 minuti senza respirare. I polmoni di un nuotatore sono un mistero.", emoji: "⭐", diary: "Rigo ha rivelato il suo Talento: apnea record." },
          relazioni: { text: "Stella mi ha insegnato a nuotare all'alba. Nina conosce i segreti del giardino.", emoji: "💕", diary: "Rigo ha rivelato le sue Relazioni: Stella e Nina." },
          segreto: { text: "Il Miraggio è un portale. Le stanze si collegano a vite diverse. Ogni ospite che parte... non torna mai nello stesso modo.", emoji: "🌑", diary: "Rigo ha rivelato il Segreto dell'Hotel: il Miraggio è un portale." }
        },
        max: {
          sogno: { text: "Sogno di trasformare la discoteca in un luogo dove il tempo si ferma e ogni battito è un ricordo eterno.", emoji: "🌟", diary: "Max ha svelato il suo Sogno: una discoteca senza tempo." },
          paura: { text: "Ho paura del silenzio assoluto. Senza basso, senza ritmo, senza folla... la discoteca è solo una stanza vuota.", emoji: "🌙", diary: "Max ha rivelato la sua Paura: il silenzio della discoteca." },
          talento: { text: "Posso mixare due canzoni apparentemente impossibili. Il segreto? Ascoltare ciò che gli altri non sentono.", emoji: "⭐", diary: "Max ha rivelato il suo Talento: mixare suoni impossibili." },
          relazioni: { text: "Lola conosce i segreti del hotel. Guest2 è la mia musa. Il Bar è il nostro cuore pulsante.", emoji: "💕", diary: "Max ha rivelato le sue Relazioni: Lola, Guest2, e il Bar." },
          segreto: { text: "Il Miraggio è un portale. Le stanze si collegano a vite diverse. Ogni ospite che parte... non torna mai nello stesso modo.", emoji: "🌑", diary: "Max ha rivelato il Segreto dell'Hotel: il Miraggio è un portale." }
        },
        nina: {
          sogno: { text: "Voglio che il giardino fiorisca in un luogo dove la natura e l'amore si baciano sotto le stelle.", emoji: "🌟", diary: "Nina ha svelato il suo Sogno: un giardino sotto le stelle." },
          paura: { text: "Ho paura che le piante non mi parlino più. Cresciamo insieme da così tanto tempo... il silenzio è un tradimento.", emoji: "🌙", diary: "Nina ha rivelato la sua Paura: le piante che smettono di parlare." },
          talento: { text: "So far crescere fiori in qualsiasi terreno. Persino sul cemento. La vita trova un modo, sempre.", emoji: "⭐", diary: "Nina ha rivelato il suo Talento: far crescere fiori ovunque." },
          relazioni: { text: "Rigo mi ha insegnato a nuotare all'alba. Guest1 è il mio compagno nel giardino segreto.", emoji: "💕", diary: "Nina ha rivelato le sue Relazioni: Rigo e Guest1." },
          segreto: { text: "Il Miraggio è un portale. Le stanze si collegano a vite diverse. Ogni ospite che parte... non torna mai nello stesso modo.", emoji: "🌑", diary: "Nina ha rivelato il Segreto dell'Hotel: il Miraggio è un portale." }
        },
        guest1: {
          sogno: { text: "Voglio che il giardino sia un luogo dove i segreti si seppelliscono e le storie crescono come rose.", emoji: "🌟", diary: "Guest1 ha svelato il suo Sogno: un giardino di segreti." },
          paura: { text: "Ho paura di essere sepolto vivo nel giardino. Le radici sono forti, e il terreno non perdona.", emoji: "🌙", diary: "Guest1 ha rivelato la sua Paura: essere sepolto nel giardino." },
          talento: { text: "So trovare il percorso nascosto nel giardino in meno di un minuto. La natura mi ha dato la mappa.", emoji: "⭐", diary: "Guest1 ha rivelato il suo Talento: trovare percorsi nascosti." },
          relazioni: { text: "Nina è la guardiana del giardino. Ugo è il mio compagno silenzioso. Siamo una squadra.", emoji: "💕", diary: "Guest1 ha rivelato le sue Relazioni: Nina e Ugo." },
          segreto: { text: "Il Miraggio è un portale. Le stanze si collegano a vite diverse. Ogni ospite che parte... non torna mai nello stesso modo.", emoji: "🌑", diary: "Guest1 ha rivelato il Segreto dell'Hotel: il Miraggio è un portale." }
        },
        gigi: {
          sogno: { text: "Voglio che il bar sia il luogo dove ogni bevanda racconta una storia e ogni brindisi è un nuovo inizio.", emoji: "🌟", diary: "Gigi ha svelato il suo Sogno: un bar che racconta storie." },
          paura: { text: "Ho paura di rimanere senza spiriti. Un bar senza bevande è come un cuore senza sangue.", emoji: "🌙", diary: "Gigi ha rivelato la sua Paura: rimanere senza spiriti." },
          talento: { text: "So creare cocktail che cambiano colore al primo sorso. È chimica, è arte, è magia in un bicchiere.", emoji: "⭐", diary: "Gigi ha rivelato il suo Talento: cocktail mutaforma." },
          relazioni: { text: "Max conosce i segreti della discoteca. Il Terrazza è dove si scambiano le notizie.", emoji: "💕", diary: "Gigi ha rivelato le sue Relazioni: Max e il Terrazza." },
          segreto: { text: "Il Miraggio è un portale. Le stanze si collegano a vite diverse. Ogni ospite che parte... non torna mai nello stesso modo.", emoji: "🌑", diary: "Gigi ha rivelato il Segreto dell'Hotel: il Miraggio è un portale." }
        },
        stella: {
          sogno: { text: "Voglio che la terrazza sia il luogo dove il cielo e la terra si abbracciano, e ogni tramonto è un nuovo capitolo.", emoji: "🌟", diary: "Stella ha svelato il suo Sogno: una terrazza tra cielo e terra." },
          paura: { text: "Ho paura di perdere l'equilibrio. La terrazza è alta, e il vento non perdona chi sbaglia passo.", emoji: "🌙", diary: "Stella ha rivelato la sua Paura: perdere l'equilibrio." },
          talento: { text: "Posso camminare sul filo senza cadere. L'equilibrio non è un talento... è una filosofia di vita.", emoji: "⭐", diary: "Stella ha rivelato il suo Talento: camminare sul filo." },
          relazioni: { text: "Rigo mi ha insegnato a nuotare. Tino conosce i segreti della terrazza.", emoji: "💕", diary: "Stella ha rivelato le sue Relazioni: Rigo e Tino." },
          segreto: { text: "Il Miraggio è un portale. Le stanze si collegano a vite diverse. Ogni ospite che parte... non torna mai nello stesso modo.", emoji: "🌑", diary: "Stella ha rivelato il Segreto dell'Hotel: il Miraggio è un portale." }
        },
        tino: {
          sogno: { text: "Voglio che la terrazza sia il luogo dove il cielo e la terra si abbracciano, e ogni tramonto è un nuovo capitolo.", emoji: "🌟", diary: "Tino ha svelato il suo Sogno: una terrazza tra cielo e terra." },
          paura: { text: "Ho paura di essere solo sulla terrazza. Il vento è freddo, e le stelle non rispondono.", emoji: "🌙", diary: "Tino ha rivelato la sua Paura: essere solo sulla terrazza." },
          talento: { text: "So prevedere il tempo guardando le nuvole. Il cielo è la mia bussola, e il vento è il mio messaggio.", emoji: "⭐", diary: "Tino ha rivelato il suo Talento: prevedere il tempo dalle nuvole." },
          relazioni: { text: "Stella è la mia compagna sulla terrazza. Max conosce i segreti della discoteca.", emoji: "💕", diary: "Tino ha rivelato le sue Relazioni: Stella e Max." },
          segreto: { text: "Il Miraggio è un portale. Le stanze si collegano a vite diverse. Ogni ospite che parte... non torna mai nello stesso modo.", emoji: "🌑", diary: "Tino ha rivelato il Segreto dell'Hotel: il Miraggio è un portale." }
        },
        sergio: {
          sogno: { text: "Voglio che la cucina sia il cuore dell'hotel, dove ogni piatto è un abbraccio e ogni aroma è un ricordo.", emoji: "🌟", diary: "Sergio ha svelato il suo Sogno: una cucina come cuore." },
          paura: { text: "Ho paura di perdere la mia ricetta segreta. È l'unica cosa che mi definisce. Senza di essa, sono nulla.", emoji: "🌙", diary: "Sergio ha rivelato la sua Paura: perdere la ricetta segreta." },
          talento: { text: "Posso assaggiare un piatto e ricostruire la ricola completa. Il gusto è linguaggio, e io ne sono fluentemente parlante.", emoji: "⭐", diary: "Sergio ha rivelato il suo Talento: ricostruire ricette dal gusto." },
          relazioni: { text: "Pino è il mio ragazzo al desk. Lola conosce i volti di tutti. La cucina è il nostro regno.", emoji: "💕", diary: "Sergio ha rivelato le sue Relazioni: Pino e Lola." },
          segreto: { text: "Il Miraggio è un portale. Le stanze si collegano a vite diverse. Ogni ospite che parte... non torna mai nello stesso modo.", emoji: "🌑", diary: "Sergio ha rivelato il Segreto dell'Hotel: il Miraggio è un portale." }
        },
        ombra: {
          sogno: { text: "Sogno di portare la luce dove c'è solo ombra. La Società Segreta è solo l'inizio. Il vero potere è nella conoscenza.", emoji: "🌟", diary: "Ombra ha svelato il suo Sogno: portare luce nell'ombra." },
          paura: { text: "Ho paura che la Società Segreta sia l'unico luogo dove sono accettato. Se scompare l'ombra, chi sono?", emoji: "🌙", diary: "Ombra ha rivelato la sua Paura: essere accettato solo nell'ombra." },
          talento: { text: "So aprire ogni serratura, decifrare ogni codice, trovare ogni percorso nascosto. L'ombra mi ha dato occhi per vedere ciò che è invisibile.", emoji: "⭐", diary: "Ombra ha rivelato il suo Talento: aprire ogni serratura." },
          relazioni: { text: "Veil è la mia guardiana del mercato. Erica è la mia agente d'intelligence. Insieme, siamo invincibili.", emoji: "💕", diary: "Ombra ha rivelato le sue Relazioni: Veil e Erica." },
          segreto: { text: "Il Miraggio è un portale. Le stanze si collegano a vite diverse. Ogni ospite che parte... non torna mai nello stesso modo.", emoji: "🌑", diary: "Ombra ha rivelato il Segreto dell'Hotel: il Miraggio è un portale." }
        },
        veil: {
          sogno: { text: "Voglio che il mercato ombroso diventi un luogo dove chiunque trovi ciò che cerca, anche se non sapeva di cercarlo.", emoji: "🌟", diary: "Veil ha svelato il suo Sogno: un mercato per chi cerca ciò che non sa." },
          paura: { text: "Ho paura di perdere il mio posto nel mercato. Senza il mercato ombroso, sono solo un\'ombra senza forma.", emoji: "🌙", diary: "Veil ha rivelato la sua Paura: perdere il mercato." },
          talento: { text: "So valutare qualsiasi oggetto al primo sguardo. Il valore non è nel prezzo, ma nella storia che racconta.", emoji: "⭐", diary: "Veil ha rivelato il suo Talento: valutare oggetti istantaneamente." },
          relazioni: { text: "Ombra è il leader. Erica è la mia agente. Il mercato è il nostro cuore.", emoji: "💕", diary: "Veil ha rivelato le sue Relazioni: Ombra e Erica." },
          segreto: { text: "Il Miraggio è un portale. Le stanze si collegano a vite diverse. Ogni ospite che parte... non torna mai nello stesso modo.", emoji: "🌑", diary: "Veil ha rivelato il Segreto dell'Hotel: il Miraggio è un portale." }
        },
        erica: {
          sogno: { text: "Voglio completare ogni missione della Società Segreta. Non per il potere, ma per la verità che cercavo da sempre.", emoji: "🌟", diary: "Erica ha svelato il suo Sogno: completare ogni missione per la verità." },
          paura: { text: "Ho paura di fallire una missione. Un errore nella Società Segreta non è perdonato. È pericoloso.", emoji: "🌙", diary: "Erica ha rivelato la sua Paura: fallire una missione." },
          talento: { text: "So infiltrarmi ovunque, trovare informazioni dove non sembrano esistere. La mia mente è la mia arma più potente.", emoji: "⭐", diary: "Erica ha rivelato il suo Talento: infiltrarsi ovunque." },
          relazioni: { text: "Ombra è il mio leader. Veil è la mia mentore. La Società è la mia famiglia.", emoji: "💕", diary: "Erica ha rivelato le sue Relazioni: Ombra e Veil." },
          segreto: { text: "Il Miraggio è un portale. Le stanze si collegano a vite diverse. Ogni ospite che parte... non torna mai nello stesso modo.", emoji: "🌑", diary: "Erica ha rivelato il Segreto dell'Hotel: il Miraggio è un portale." }
        }
      },

      // NPC Connections — inter-NPC relationships
      npcConnections: {
        lola:  { connectedTo: ['pino', 'max'], hint: "Lola e Pino condividono il segreto della valigia. Max conosce ogni segreto della discoteca." },
        pino:  { connectedTo: ['lola', 'sergio'], hint: "Pino e Sergio sono il duo della cucina e del desk. Lola è il loro punto d'incontro." },
        leo:   { connectedTo: ['guest2', 'max'], hint: "La musica di Leo risuona nella discoteca di Max. Guest2 è la sua musa." },
        guest2:{ connectedTo: ['leo', 'max'], hint: "Guest2 e Leo creano magia insieme. Max è il re del locale." },
        rigo:  { connectedTo: ['stella', 'nina'], hint: "Rigo nuota all'alba con Stella. Nina conosce i segreti del giardino." },
        max:   { connectedTo: ['lola', 'guest2'], hint: "Max conosce i segreti di tutti. Lola e Guest2 sono i suoi informatori." },
        nina:  { connectedTo: ['rigo', 'guest1'], hint: "Nina e Rigo crescono insieme nel giardino. Guest1 è il suo compagno segreto." },
        guest1:{ connectedTo: ['nina', 'ugo'], hint: "Guest1 e Nina custodiscono il giardino. Ugo è il silenzioso compagno." },
        gigi:  { connectedTo: ['max', 'stella'], hint: "Gigi serve il Bar, Max conosce la discoteca. Stella è la voce della terrazza." },
        stella:{ connectedTo: ['rigo', 'tino'], hint: "Stella e Tino sono la coppia della terrazza. Rigo le ha insegnato a nuotare." },
        tino:  { connectedTo: ['stella', 'max'], hint: "Tino prevede il tempo per Stella. Max conosce i segreti del locale." },
        sergio:{ connectedTo: ['pino', 'lola'], hint: "Sergio e Pino sono inseparabili in cucina. Lola è il volto del desk." },
        ombra: { connectedTo: ['veil', 'erica'], hint: "Ombra guida la Società. Veil e Erica sono le sue braccia destre." },
        veil:  { connectedTo: ['ombra', 'erica'], hint: "Veil gestisce il mercato per Ombra. Erica è la sua agente." },
        erica: { connectedTo: ['ombra', 'veil'], hint: "Erica serve la Società. Ombra è il suo leader, Veil la sua mentore." }
      },

      // NPC Inter-Dialogue — what NPCs say about each other
      npcDialogue: {
        lola_pino: "Lola sussurra: 'Pino, la valigia è tornata... stavolta con un messaggio.'",
        pino_lola: "Pino risponde: 'Lola, hai visto i volti dei clienti? Ho paura di dimenticarli.'",
        leo_guest2: "Leo dice: 'Guest2, la tua musica mi ispira ogni giorno. Senza di te, il gioco è solo silenzio.'",
        guest2_leo: "Guest2 risponde: 'Leo, le tue note trasformano il gioco in magia. Sei il mio compositore.'",
        max_lola: "Max dice: 'Lola, conosco ogni segreto della discoteca. Tu conosci l'hotel. Insieme siamo invincibili.'",
        nina_guest1: "Nina dice: 'Guest1, le radici del giardino crescono con noi. Sei il mio compagno più fedele.'",
        rigo_stella: "Rigo dice: 'Stella, mi hai insegnato a nuotare all'alba. L'acqua non ha segreti per te.'",
        gigi_max: "Gigi dice: 'Max, il tuo ritmo riempie il Bar di vita. Sei il cuore pulsante di questo luogo.'",
        ombra_veil: "Ombra dice: 'Veil, il mercato è il nostro regno. Senza di te, l'ombra non ha forma.'",
        erica_ombra: "Erica dice: 'Ombra, ogni missione mi avvicina alla verità. Sei il mio faro nell'oscurità.'",
        sergio_pino: "Sergio dice: 'Pino, la tua cucina è un capolavoro. Il desk e la cucina sono un solo cuore.'",
        stella_tino: "Stella dice: 'Tino, il cielo è la nostra bussola. Insieme, la terrazza è il nostro regno.'"
      },

      // Room Builder Templates
      roomTemplates: [
        { id: 'cozy', name: 'Cozy Corner', emoji: '🛋️', desc: 'Accogliente e rilassante',
          furniture: ['🛋️', '🪴', '🖼️', '⏰', '🧸', '💡'] },
        { id: 'garden', name: 'Garden Party', emoji: '🌺', desc: 'Fiori e natura',
          furniture: ['🌿', '🦋', '🪨', '🌸', '🪴', '☀️'] },
        { id: 'arcade', name: 'Arcade Room', emoji: '🕹️', desc: 'Retro e arcade',
          furniture: ['🕹️', '🎮', '🎵', '🎰', '🧃', '💡'] },
        { id: 'library', name: 'Biblioteca', emoji: '📚', desc: 'Libri e sapere',
          furniture: ['📚', '🕯️', '🪑', '📖', '🗝️', '🖼️'] },
        { id: 'party', name: 'Party Room', emoji: '🎉', desc: 'Divertimento e festa',
          furniture: ['🎉', '🎊', '🥳', '🎵', '🍾', '💡'] }
      ],

      /* ==================== MUSIC STUDIO ==================== */
      musicStudio: {
        instruments: {
          drums: { name: "Batteria", emoji: "🥁", color: "#ff4500", baseNotes: ["kick", "snare", "hihat"] },
          bass: { name: "Basso", emoji: "🎸", color: "#3ddc97", baseNotes: ["E2", "A2", "D3", "G3"] },
          synth: { name: "Sintetizzatore", emoji: "🎹", color: "#5b3bd6", baseNotes: ["C4", "E4", "G4", "A4"] },
          lead: { name: "Melodia", emoji: "🎺", color: "#ffd166", baseNotes: ["C5", "E5", "G5"] },
          pad: { name: "Pad", emoji: "🎻", color: "#ff5d9e", baseNotes: ["C3", "E3", "G3", "B3"] },
          perc: { name: "Percussioni", emoji: "🪘", color: "#8a4bd6", baseNotes: ["tom", "clap", "ride"] }
        },
        tempoPresets: {
          slow: { bpm: 80, name: "Lento" },
          mid: { bpm: 120, name: "Medio" },
          fast: { bpm: 160, name: "Veloce" },
          insane: { bpm: 200, name: "Folle" }
        },
        genres: ["Lo-Fi", "House", "Techno", "Trance", "Chill", "Ambient", "Drum & Bass", "Jazz"],
        maxSteps: 16,
        patternLength: 6,
        studioFurniture: ["🎛️", "🎵", "🎧", "🪗", "🫖", "🕊️", "🎭"]
      },

      /* ==================== ROOM OF THE WEEK ==================== */
      stanzaSettimana: { roomId: '', owner: '', votes: 0, code: '', week: '', history: [] },

      // Builder achievements
      builderBadges: [
        { min: 1, title: 'Architetto', icon: '🏗️' },
        { min: 5, title: 'Architetto Senior', icon: '🏰' },
        { min: 10, title: 'Maestro Costruttore', icon: '🏯' }
      ]
  };

  if (typeof module !== "undefined" && module.exports) module.exports = G;
  if (typeof window !== "undefined") window.MIRAGGIO = G;
})();
