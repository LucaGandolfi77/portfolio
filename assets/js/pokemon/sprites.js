const sprites = new Image();
sprites.src = 'assets/img/pokemon/sprites.png';

const SPRITE_SIZE = 32; // Assuming 32x32 sprites in the sheet

// Sprite Definitions (x, y in grid units of SPRITE_SIZE)
const SPRITE_MAP = {
    // Player
    player: {
        down:  [{x:0, y:0}, {x:1, y:0}, {x:2, y:0}, {x:3, y:0}],
        left:  [{x:0, y:1}, {x:1, y:1}, {x:2, y:1}, {x:3, y:1}],
        right: [{x:0, y:2}, {x:1, y:2}, {x:2, y:2}, {x:3, y:2}],
        up:    [{x:0, y:3}, {x:1, y:3}, {x:2, y:3}, {x:3, y:3}]
    },
    
    // Tiles (Ground)
    grass: [{x:0, y:4}],
    water: [{x:1, y:4}, {x:2, y:4}, {x:3, y:4}], // Animated water
    sand:  [{x:4, y:4}],
    snow:  [{x:5, y:4}],
    rock_ground: [{x:6, y:4}], // Mountain
    dirt: [{x:7, y:4}],
    
    bridge: [{x:0, y:5}],
    floor: [{x:1, y:5}],
    mat: [{x:2, y:5}],
    tilled: [{x:3, y:5}],
    road: [{x:4, y:5}],
    bar_floor: [{x:5, y:5}],
    ice: [{x:6, y:5}],
    city_road: [{x:7, y:5}],
    city_sidewalk: [{x:8, y:5}],
    cave_entrance: [{x:9, y:5}],
    cave_floor: [{x:10, y:5}],
    cave_wall: [{x:11, y:5}],
    ladder: [{x:12, y:5}],
    tunnel: [{x:13, y:5}],

    // Objects
    tree:  [{x:0, y:6}], 
    rock:  [{x:1, y:6}],
    flower:[{x:2, y:6}],
    tall_grass: [{x:3, y:6}],
    cactus: [{x:4, y:6}],
    pine: [{x:5, y:6}],
    palm: [{x:6, y:6}],
    house_roof: [{x:7, y:6}],
    house_wall: [{x:8, y:6}],
    house_door: [{x:9, y:6}],
    stump: [{x:10, y:6}],
    bar_counter: [{x:11, y:6}],
    bar_table: [{x:12, y:6}],
    bar_chair: [{x:13, y:6}],
    puddle: [{x:14, y:6}],
    boat: [{x:15, y:6}],
    
    // Pokemon / NPCs
    pikachu: {
        idle: [{x:0, y:7}, {x:1, y:7}],
        move: [{x:2, y:7}, {x:3, y:7}]
    },
    charmander: {
        idle: [{x:0, y:8}, {x:1, y:8}],
        move: [{x:2, y:8}, {x:3, y:8}]
    },
    squirtle: {
        idle: [{x:0, y:9}, {x:1, y:9}],
        move: [{x:2, y:9}, {x:3, y:9}]
    },
    bulbasaur: {
        down: [{x:0, y:10}, {x:1, y:10}],
        left: [{x:2, y:10}, {x:3, y:10}],
        right: [{x:4, y:10}, {x:5, y:10}],
        up: [{x:6, y:10}, {x:7, y:10}]
    },
    lapras: {
        down: [{x:0, y:11}],
        left: [{x:1, y:11}],
        right: [{x:2, y:11}],
        up: [{x:3, y:11}]
    },
    sandshrew: {
        down: [{x:0, y:12}],
        left: [{x:1, y:12}],
        right: [{x:2, y:12}],
        up: [{x:3, y:12}]
    },
    spheal: {
        down: [{x:0, y:13}],
        left: [{x:1, y:13}],
        right: [{x:2, y:13}],
        up: [{x:3, y:13}]
    },
    caterpie: {
        down: [{x:0, y:14}],
        left: [{x:1, y:14}],
        right: [{x:2, y:14}],
        up: [{x:3, y:14}]
    },
    geodude: {
        down: [{x:0, y:15}],
        left: [{x:1, y:15}],
        right: [{x:2, y:15}],
        up: [{x:3, y:15}]
    },
    onix: {
        down: [{x:0, y:16}],
        left: [{x:1, y:16}],
        right: [{x:2, y:16}],
        up: [{x:3, y:16}]
    },
    wobbuffet: {
        down: [{x:0, y:17}],
        left: [{x:1, y:17}],
        right: [{x:2, y:17}],
        up: [{x:3, y:17}]
    }
};

// Animation State
let frameCounter = 0;
const ANIMATION_SPEED = 10; // Frames per switch

function updateAnimation() {
    frameCounter++;
}

function getSpriteFrame(spriteKey, action = 'idle', direction = 'down') {
    // Handle complex entities (Player/Pokemon)
    if (SPRITE_MAP[spriteKey]) {
        // Check for direction first (common for NPCs)
        if (direction && SPRITE_MAP[spriteKey][direction]) {
            const frames = SPRITE_MAP[spriteKey][direction];
            const frameIndex = Math.floor(frameCounter / ANIMATION_SPEED) % frames.length;
            return frames[frameIndex];
        }
        // Check for action (idle/move)
        if (action && SPRITE_MAP[spriteKey][action]) {
            const frames = SPRITE_MAP[spriteKey][action];
            const frameIndex = Math.floor(frameCounter / ANIMATION_SPEED) % frames.length;
            return frames[frameIndex];
        }
        // Check if it's a simple array (Tiles)
        if (Array.isArray(SPRITE_MAP[spriteKey])) {
            const frames = SPRITE_MAP[spriteKey];
            const frameIndex = Math.floor(frameCounter / (ANIMATION_SPEED * 2)) % frames.length; // Slower for tiles
            return frames[frameIndex];
        }
    }
    
    return null;
}

function drawSprite(ctx, key, screenX, screenY, actionOrDir = null) {
    if (!sprites.complete) return false; // Return false if not drawn

    let frame;
    // Try to deduce what actionOrDir is
    if (actionOrDir) {
        frame = getSpriteFrame(key, null, actionOrDir); // Try as direction
        if (!frame) frame = getSpriteFrame(key, actionOrDir); // Try as action
    } else {
        frame = getSpriteFrame(key);
    }
    
    if (!frame) return false;

    ctx.drawImage(
        sprites,
        frame.x * SPRITE_SIZE,
        frame.y * SPRITE_SIZE,
        SPRITE_SIZE,
        SPRITE_SIZE,
        screenX,
        screenY,
        TILE_SIZE,
        TILE_SIZE
    );
    return true;
}
