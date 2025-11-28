// Configurazione gioco
const TILE_SIZE = 32;
const MAP_SIZE = 20;
const VISIBLE_TILES = 10;
const WALK_SPEED = 2;
const RUN_SPEED = 4;

// Colori Palette "Indie Cozy" + Biomi
const colors = {
    // Forest (Default)
    terrain: '#7ec850',
    grass: '#67b040',
    grassDetail: '#5a9e35',
    treeTrunk: '#8b5a2b',
    treeLeaves: '#4a8f3c',
    treeShadow: 'rgba(0,0,0,0.2)',
    flower: '#ff9d9d',
    flowerCenter: '#ffe082',
    
    // Desert
    sand: '#e1c699',
    sandDetail: '#d4b483',
    cactus: '#2ecc71',
    cactusSpike: '#27ae60',
    
    // Ice
    snow: '#dfe6e9',
    snowDetail: '#b2bec3',
    ice: '#81ecec',
    pine: '#2d3436', // Dark trunk
    pineLeaves: '#74b9ff', // Icy leaves
    
    // Tropical
    jungleGrass: '#00b894',
    jungleWater: '#0984e3',
    palmTrunk: '#e17055',
    palmLeaves: '#badc58',

    // Common
    water: '#5dade2',
    waterDeep: '#4a9ccf',
    waterHighlight: 'rgba(255,255,255,0.4)',
    bridge: '#d4a373',
    bridgeDark: '#b08055',
    
    // Entities
    playerBody: '#ff6b6b',
    playerHat: '#ff4757',
    playerSkin: '#ffeaa7',
    npcBody: '#a29bfe',
    npcHat: '#6c5ce7',
    shadow: 'rgba(0,0,0,0.15)',
    
    // House
    houseWall: '#f3a683',
    houseRoof: '#e77f67',
    houseDoor: '#596275',
    houseFloor: '#f7d794',
    houseMat: '#303952',
    
    // Objects
    rock: '#95a5a6',
    rockDark: '#7f8c8d',
    stump: '#8b5a2b',
    stumpTop: '#d7ccc8',
    tilled: '#5d4037',
    
    // Road
    road: '#95a5a6',
    roadDetail: '#7f8c8d',
    
    // Bar
    barCounter: '#8e44ad',
    barTable: '#d35400',
    barChair: '#c0392b',
    barFloor: '#34495e',

    // City
    cityRoad: '#57606f',
    citySidewalk: '#a4b0be',
    cityBuilding: '#747d8c',

    // Cave
    caveFloor: '#3d3d3d',
    caveWall: '#2d2d2d',
    caveEntrance: '#000000',

    // Rain
    rainGrass: '#2d3436',
    puddle: '#74b9ff',

    // Boat
    boatBody: '#8e44ad',
    boatFloor: '#9b59b6',
    boatSeat: '#2c3e50'
};

// Dialoghi NPC
const dialogues = [
    "Ciao! Che bella giornata per un'avventura!",
    "Hai visto dei Pokémon rari da queste parti?",
    "Attento all'erba alta, è piena di insetti!",
    "Mi piace stare qui a guardare l'acqua...",
    "Si dice che ci sia un tesoro nascosto oltre il ponte.",
    "Il mio Pokémon preferito è Snorlax. Dorme sempre!",
    "Ho perso le mie chiavi... o forse non le ho mai avute.",
    "Se premi 'B' puoi correre... ah no, aspetta, non è vero.",
    "La musica di questo posto è molto rilassante, vero?",
    "Sono qui da ore e non ho ancora catturato nulla...",
    "Usa l'ascia per tagliare gli alberi!",
    "Il piccone è utile per spaccare le rocce."
];

// Quiz NPC Casa
const houseQuizzes = [
    {
        question: "Qual è il Pokémon iniziale di tipo Fuoco a Kanto?",
        options: ["Bulbasaur", "Charmander", "Squirtle"],
        correct: 1,
        win: "Esatto! Charmander è il migliore!",
        lose: "Sbagliato! Riprova."
    },
    {
        question: "Cosa usa Pikachu per attaccare?",
        options: ["Fuoco", "Acqua", "Elettricità"],
        correct: 2,
        win: "Bzzzt! Corretto!",
        lose: "No, non credo proprio."
    }
];

// Tools System
const tools = [
    { id: 'axe', name: 'Ascia', icon: '🪓' },
    { id: 'pickaxe', name: 'Piccone', icon: '⛏️' },
    { id: 'hoe', name: 'Zappa', icon: '🌱' }
];
