/* RPG Adventure — game data, progression tables and EN/IT strings */

export const VERSION = 1;

export const PALETTE = {
  gold:'#ffd166', hp:'#ff5d6c', mana:'#5aa9ff', xp:'#b28dff',
  cyan:'#3ee6ff', green:'#5ef0a8', violet:'#b28dff', red:'#ff5d6c'
};

export const ZONES = [
  {
    id:'grove', en:'Emerald Grove', it:'Bosco Smeraldo',
    sky:'#071a18', ground:'#0f2a24', grid:'rgba(94,240,168,.07)', accent:'#5ef0a8',
    enemies:[
      { id:'slime', en:'Slime', it:'Melma', hp:22, damage:5, speed:46, xp:12, gold:6, size:14, color:'#5ef0a8' },
      { id:'boar', en:'Boar', it:'Cinghiale', hp:36, damage:8, speed:62, xp:20, gold:10, size:17, color:'#ff9d6b' }
    ],
    npcs:[
      { id:'elder', name:'Elder', x:180, y:130,
        en:'Welcome, adventurer! Defeat the slimes to earn gold and experience.',
        it:'Benvenuto, avventuriero! Sconfiggi le melme per guadagnare oro ed esperienza.' },
      { id:'merchant', name:'Merchant', shop:true, x:620, y:150,
        en:'Potions and steel for honest gold. Spend wisely!',
        it:'Pozioni e acciaio per oro onesto. Spendi con saggezza!'}
    ],
    portals:[{ x:700, y:470, to:'dunes', en:'To the Dunes', it:'Verso le Dune' }]
  },
  {
    id:'dunes', en:'Sunlit Dunes', it:'Dune Assolate',
    sky:'#1b1207', ground:'#2c2010', grid:'rgba(255,209,102,.07)', accent:'#ffd166',
    enemies:[
      { id:'scorpion', en:'Scorpion', it:'Scorpione', hp:42, damage:10, speed:70, xp:26, gold:14, size:16, color:'#ffd166' },
      { id:'bandit', en:'Bandit', it:'Bandito', hp:54, damage:13, speed:58, xp:34, gold:20, size:18, color:'#ff8d5f' }
    ],
    npcs:[
      { id:'cartographer', name:'Cartographer', x:150, y:140,
        en:'The crypt lies east. Bring a shield — its guardians hit hard.',
        it:'La cripta è a est. Porta uno scudo: i suoi guardiani colpiscono forte.' }
    ],
    portals:[
      { x:110, y:490, to:'grove', en:'To the Grove', it:'Verso il Bosco' },
      { x:690, y:150, to:'crypt', en:'To the Crypt', it:'Verso la Cripta' }
    ]
  },
  {
    id:'crypt', en:'Ancient Crypt', it:'Cripta Antica',
    sky:'#0b0a1b', ground:'#151330', grid:'rgba(178,141,255,.08)', accent:'#b28dff',
    enemies:[
      { id:'sentry', en:'Sentry', it:'Sentinella', hp:70, damage:16, speed:52, xp:48, gold:28, size:19, color:'#b28dff' },
      { id:'wraith', en:'Wraith', it:'Spettro', hp:58, damage:20, speed:84, xp:60, gold:34, size:17, color:'#9be7ff' }
    ],
    npcs:[],
    portals:[{ x:120, y:490, to:'dunes', en:'To the Dunes', it:'Verso le Dune' }]
  }
];

export const ITEMS = [
  { id:'health_potion', en:'Health Potion', it:'Pozione di vita', icon:'🧪', type:'consumable', effect:{ type:'heal', value:30 }, price:12 },
  { id:'mana_potion', en:'Mana Potion', it:'Pozione di mana', icon:'💧', type:'consumable', effect:{ type:'mana', value:25 }, price:10 },
  { id:'wooden_sword', en:'Wooden Sword', it:'Spada di legno', icon:'🗡️', type:'equipment', slot:'weapon', effect:{ type:'attack', value:3 }, price:20 },
  { id:'iron_sword', en:'Iron Sword', it:'Spada di ferro', icon:'⚔️', type:'equipment', slot:'weapon', effect:{ type:'attack', value:7 }, price:55 },
  { id:'leather_armor', en:'Leather Armor', it:'Armatura di pelle', icon:'🥋', type:'equipment', slot:'armor', effect:{ type:'defense', value:2 }, price:30 },
  { id:'iron_shield', en:'Iron Shield', it:'Scudo di ferro', icon:'🛡️', type:'equipment', slot:'shield', effect:{ type:'defense', value:4 }, price:60 },
  { id:'ruby_ring', en:'Ruby Ring', it:'Anello di rubino', icon:'💍', type:'equipment', slot:'accessory', effect:{ type:'attack', value:4 }, price:80 },
  { id:'amber', en:'Amber', it:'Ambra', icon:'🔶', type:'material', price:8 }
];

export const SKILLS = [
  { id:'fireball', en:'Fireball', it:'Palla di fuoco', icon:'🔥', mana:15, cooldown:5, damage:34, radius:90, type:'offensive' },
  { id:'shield', en:'Shield', it:'Scudo', icon:'🛡️', mana:10, cooldown:8, duration:2.5, type:'defensive' },
  { id:'dash', en:'Dash', it:'Scatto', icon:'💨', mana:8, cooldown:3, duration:0.4, type:'utility' },
  { id:'heal', en:'Heal', it:'Curazione', icon:'💚', mana:20, cooldown:10, heal:35, type:'heal' }
];

export const QUESTS = [
  { id:'first_blood', en:'First Blood', it:'Primo sangue', goal:5, reward:40,
    enDesc:'Defeat 5 enemies', itDesc:'Sconfiggi 5 nemici' },
  { id:'treasure', en:'Treasure Hunter', it:'Cacciatore di tesori', goal:80, reward:60,
    enDesc:'Collect 80 gold', itDesc:'Raccogli 80 monete d’oro' },
  { id:'crypt_guardian', en:'Crypt Guardian', it:'Guardiano della cripta', goal:4, reward:120,
    enDesc:'Defeat 4 crypt enemies', itDesc:'Sconfiggi 4 nemici della cripta' }
];

export const COMBO_DAMAGE = [10, 16, 26];
export const COMBO_WINDOW = 3000;
export const LEVEL_XP = level => 60 + (level - 1) * 45;
export const WORLD = { width:820, height:560 };

export const STR = {
  it: {
    skip:'Vai al contenuto', title:'RPG ADVENTURE', tagline:'Tre zone, quest e combattimento',
    play:'Gioca', pause:'Pausa', resume:'Riprendi', menu:'Menu', inventory:'Inventario',
    quests:'Quest', map:'Mappa', settings:'Impostazioni', help:'Guida', lang:'IT / EN', theme:'Tema',
    health:'Vita', mana:'Mana', level:'Livello', gold:'Oro', xp:'ES', attack:'Attacco', defense:'Difesa',
    combo:'Combo', zone:'Zona', interact:'Interagisci', dodge:'Schiva', talk:'Parla', shop:'Negozio',
    buy:'Compra', equip:'Equipaggia', use:'Usa', drop:'Butta', close:'Chiudi', reset:'Nuova partita',
    saved:'Partita salvata', loaded:'Partita caricata', levelUp:'Livello aumentato!', questDone:'Quest completata!',
    noGold:'Oro insufficiente', noMana:'Mana insufficiente', cooldown:'In ricarica', full:'Inventario pieno',
    pauseTitle:'In pausa', settingsTitle:'Impostazioni', sound:'Suono', vibration:'Vibrazione',
    motion:'Effetti ridotti', showFps:'Mostra FPS', back:'Indietro', start:'Inizia',
    dead:'Sei sconfitto', retry:'Riprova', enemyRemaining:'Nemici',
    helpText:'Muoviti con WASD o con il joystick a sinistra. Tocca ATTACCA per colpire: tre colpi ravvicinati formano una combo. Usa le skill con 1-4 o i pulsanti in basso. E o il pulsante IPC parla con gli NPC; TAB schiva. Le portal ti portano in altre zone.',
    shopText:'Compra pozioni ed equipaggiamento con l’oro raccolto.',
    emptyInv:'Inventario vuoto', emptyQuest:'Nessuna quest attiva', confirmReset:'Cancella la partita e ricominciare?',
    ok:'OK', cancel:'Annulla', fps:'FPS', mute:'Muto', on:'Attivo', off:'Disattivo'
  },
  en: {
    skip:'Skip to content', title:'RPG ADVENTURE', tagline:'Three zones, quests and combat',
    play:'Play', pause:'Pause', resume:'Resume', menu:'Menu', inventory:'Inventory',
    quests:'Quests', map:'Map', settings:'Settings', help:'Guide', lang:'IT / EN', theme:'Theme',
    health:'Health', mana:'Mana', level:'Level', gold:'Gold', xp:'XP', attack:'Attack', defense:'Defense',
    combo:'Combo', zone:'Zone', interact:'Interact', dodge:'Dodge', talk:'Talk', shop:'Shop',
    buy:'Buy', equip:'Equip', use:'Use', drop:'Drop', close:'Close', reset:'New game',
    saved:'Game saved', loaded:'Game loaded', levelUp:'Level up!', questDone:'Quest complete!',
    noGold:'Not enough gold', noMana:'Not enough mana', cooldown:'On cooldown', full:'Inventory full',
    pauseTitle:'Paused', settingsTitle:'Settings', sound:'Sound', vibration:'Vibration',
    motion:'Reduced motion', showFps:'Show FPS', back:'Back', start:'Start',
    dead:'You were defeated', retry:'Retry', enemyRemaining:'Enemies',
    helpText:'Move with WASD or the left joystick. Tap ATTACK to strike: three quick hits build a combo. Use skills with 1-4 or the bottom buttons. E or the IPC button talks to NPCs; TAB dodges. Portals lead to other zones.',
    shopText:'Buy potions and gear with the gold you collect.',
    emptyInv:'Empty inventory', emptyQuest:'No active quests', confirmReset:'Delete your save and start over?',
    ok:'OK', cancel:'Cancel', fps:'FPS', mute:'Mute', on:'On', off:'Off'
  }
};
