const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const transitionOverlay = document.getElementById('transition-overlay');
const dialogueBox = document.getElementById('dialogue-box');
const dialogueText = document.getElementById('dialogue-text');
const dialogueOptions = document.getElementById('dialogue-options');

// World State
const world = {}; // Cache: "x,y" -> { tiles: matrix, npcs: array }
let worldX = 0;
let worldY = 0;
let isTransitioning = false;
let isDialogueOpen = false;
let isIndoors = false;
let savedOutdoorPos = { x: 0, y: 0, wx: 0, wy: 0 };
let zoomLevel = 0; // Intro zoom start

// Time System
const gameTime = {
    hour: 12,
    minute: 0,
    timer: 0,
    day: true
};

// Quiz State
let quizState = {
    active: false,
    options: [],
    selected: 0,
    callback: null,
    quizRef: null
};

// Input State
const keys = {
    up: false,
    down: false,
    left: false,
    right: false,
    a: false,
    b: false,
    x: false,
    y: false
};

// Player
const player = {
    x: 10, // Grid X (Target)
    y: 10, // Grid Y (Target)
    pixelX: 10 * TILE_SIZE, // Visual X
    pixelY: 10 * TILE_SIZE, // Visual Y
    direction: 'down',
    moving: false,
    turnTimer: 0,
    stepAnim: 0,
    isSurfing: false,
    inventory: {
        money: 0,
        wood: 0,
        stone: 0,
        grass: 0
    }
};

// Camera
const camera = {
    x: 0,
    y: 0
};

let currentToolIndex = 0;
let currentData = null;
let currentMap = null;
let currentNPCs = [];
