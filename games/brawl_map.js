// Map Configuration
const TILE_SIZE = 50;
const COLS = 100; // 5000px width
const ROWS = 100; // 5000px height
const MAP_WIDTH = COLS * TILE_SIZE;
const MAP_HEIGHT = ROWS * TILE_SIZE;

// Tile Definitions
const TILES = {
    GRASS: 0,
    WALL_GRASS: 1,
    SAND: 2,
    WALL_SAND: 3,
    SNOW: 4,
    WALL_SNOW: 5,
    DARK: 6,
    WALL_DARK: 7
};

let map = [];

function initMap() {
    map = new Array(COLS * ROWS).fill(0);
    
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            let floor, wall;
            
            // Biomes
            if (r < ROWS / 2) {
                if (c < COLS / 2) { // Top-Left: Grass
                    floor = TILES.GRASS;
                    wall = TILES.WALL_GRASS;
                } else { // Top-Right: Desert
                    floor = TILES.SAND;
                    wall = TILES.WALL_SAND;
                }
            } else {
                if (c < COLS / 2) { // Bottom-Left: Snow
                    floor = TILES.SNOW;
                    wall = TILES.WALL_SNOW;
                } else { // Bottom-Right: Dark
                    floor = TILES.DARK;
                    wall = TILES.WALL_DARK;
                }
            }

            // Random Obstacles (8% chance)
            if (Math.random() < 0.08) {
                map[r * COLS + c] = wall;
            } else {
                map[r * COLS + c] = floor;
            }
        }
    }

    // Clear Spawn Area (Center)
    const centerC = Math.floor(COLS / 2);
    const centerR = Math.floor(ROWS / 2);
    for(let r = centerR - 5; r <= centerR + 5; r++) {
        for(let c = centerC - 5; c <= centerC + 5; c++) {
            if (r >= 0 && r < ROWS && c >= 0 && c < COLS) {
                const t = map[r * COLS + c];
                if (t % 2 !== 0) { // If wall
                    map[r * COLS + c] = t - 1; // Convert to floor
                }
            }
        }
    }
}

function getTileAt(x, y) {
    const c = Math.floor(x / TILE_SIZE);
    const r = Math.floor(y / TILE_SIZE);
    if (c < 0 || c >= COLS || r < 0 || r >= ROWS) return TILES.WALL_GRASS; // Out of bounds
    return map[r * COLS + c];
}

function isSolid(x, y) {
    const t = getTileAt(x, y);
    return t % 2 !== 0; // Odd tiles are walls
}

// Initialize immediately
initMap();
