// Generazione Mappa Procedurale
function generateMap(wx, wy) {
    const newMap = [];
    const newNPCs = [];
    let boat = null;
    const biome = getBiome(wx, wy);
    
    // Inizializza mappa vuota
    for (let y = 0; y < MAP_SIZE; y++) {
        newMap[y] = [];
        for (let x = 0; x < MAP_SIZE; x++) {
            newMap[y][x] = 0;
        }
    }

    for (let y = 0; y < MAP_SIZE; y++) {
        for (let x = 0; x < MAP_SIZE; x++) {
            // Bordi (Acqua/Ponti)
            if (x === 0 || x === MAP_SIZE - 1 || y === 0 || y === MAP_SIZE - 1) {
                const isBridgeX = (y === Math.floor(MAP_SIZE/2) || y === Math.floor(MAP_SIZE/2)-1);
                const isBridgeY = (x === Math.floor(MAP_SIZE/2) || x === Math.floor(MAP_SIZE/2)-1);
                
                if ((x === 0 || x === MAP_SIZE - 1) && isBridgeX) newMap[y][x] = 5; 
                else if ((y === 0 || y === MAP_SIZE - 1) && isBridgeY) newMap[y][x] = 5; 
                else newMap[y][x] = 4; 
            } else {
                // Noise
                const globalX = wx * MAP_SIZE + x;
                const globalY = wy * MAP_SIZE + y;
                const noise = Math.sin(globalX * 0.5) * Math.cos(globalY * 0.5);
                const rand = Math.abs(Math.sin(globalX * 12.9898 + globalY * 78.233) * 43758.5453) % 1;

                // Biome Specific Generation
                if (biome === 'desert') {
                    if (rand < 0.05) newMap[y][x] = 20; // Cactus
                    else if (rand < 0.1) newMap[y][x] = 11; // Rock
                    else newMap[y][x] = 0; // Sand
                } else if (biome === 'lake') {
                    // Big Lake in the middle
                    const centerX = MAP_SIZE / 2;
                    const centerY = MAP_SIZE / 2;
                    const dist = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
                    
                    if (dist < 7) {
                        newMap[y][x] = 4; // Water
                    } else if (dist < 8 && rand < 0.5) {
                        newMap[y][x] = 4; // Irregular edge
                    } else {
                        // Shore
                        if (rand < 0.1) newMap[y][x] = 3; // Flower
                        else if (rand < 0.2) newMap[y][x] = 1; // Grass
                        else newMap[y][x] = 0; // Terrain
                    }
                } else if (biome === 'frozen_lake') {
                    // Big Ice Lake
                    const centerX = MAP_SIZE / 2;
                    const centerY = MAP_SIZE / 2;
                    const dist = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
                    
                    if (dist < 7) {
                        newMap[y][x] = 22; // Ice
                    } else if (dist < 8 && rand < 0.5) {
                        newMap[y][x] = 22; // Irregular edge
                    } else {
                        // Shore
                        if (rand < 0.1) newMap[y][x] = 11; // Rock
                        else if (rand < 0.2) newMap[y][x] = 21; // Pine
                        else newMap[y][x] = 0; // Snow
                    }
                } else if (biome === 'city') {
                    // City Pattern
                    if (x % 6 === 0 || y % 6 === 0) newMap[y][x] = 25; // Road
                    else newMap[y][x] = 26; // Sidewalk
                    
                    // Random details
                    if (rand < 0.02 && newMap[y][x] === 26) newMap[y][x] = 3; // Flower pot?
                } else if (biome === 'ice') {
                    if (rand < 0.1) newMap[y][x] = 21; // Pine
                    else if (rand < 0.15) newMap[y][x] = 11; // Rock
                    else if (noise > 0.3) newMap[y][x] = 22; // Ice Patch
                    else newMap[y][x] = 0; // Snow
                } else if (biome === 'tropical') {
                    if (rand < 0.15) newMap[y][x] = 23; // Palm
                    else if (rand < 0.25) newMap[y][x] = 3; // Flower
                    else if (noise > 0.1) newMap[y][x] = 1; // Grass
                    else newMap[y][x] = 0; // Jungle Grass
                } else if (biome === 'mountain') {
                    // Mountain Generation
                    if (rand < 0.3) newMap[y][x] = 11; // Lots of Rocks
                    else if (rand < 0.35) newMap[y][x] = 12; // Stump (Dead tree)
                    else if (rand < 0.4) newMap[y][x] = 21; // Pine
                    else newMap[y][x] = 0; // Ground (will be grey)
                } else if (biome === 'rain') {
                    // Rain Biome
                    if (rand < 0.1) newMap[y][x] = 24; // Puddle
                    else if (rand < 0.15) newMap[y][x] = 3; // Flower
                    else if (rand < 0.2) newMap[y][x] = 2; // Tree
                    else if (noise > 0.1) newMap[y][x] = 1; // Grass
                    else newMap[y][x] = 0; // Wet Ground
                } else {
                    // Forest
                    if (rand < 0.08) newMap[y][x] = 2; // Tree
                    else if (rand < 0.12) newMap[y][x] = 11; // Rock
                    else if (rand < 0.18) newMap[y][x] = 3; // Flower
                    else if (noise > 0.2) newMap[y][x] = 1; // Grass
                    else newMap[y][x] = 0; // Terrain
                }
            }
        }
    }

    // Generazione Case (Tentativo)
    let housePlaced = false;
    let houseX = 0;
    let houseY = 0;
    const houseRand = Math.abs(Math.sin(wx * 45.23 + wy * 23.11) * 12345.67) % 1;
    
    if (houseRand > 0.3 && biome !== 'ice') { // No houses in ice for now
        for(let attempt=0; attempt<50; attempt++) {
            const hx = Math.floor(Math.random() * (MAP_SIZE - 6)) + 3;
            const hy = Math.floor(Math.random() * (MAP_SIZE - 6)) + 3;
            
            let clear = true;
            for(let dy=0; dy<4; dy++) {
                for(let dx=0; dx<4; dx++) {
                    if (newMap[hy+dy][hx+dx] === 4 || newMap[hy+dy][hx+dx] === 5) clear = false;
                }
            }
            
            if (clear) {
                // Decide if House or Bar
                const isBar = Math.random() > 0.5;
                const doorTile = isBar ? 18 : 8;

                // Piazza casa
                for(let dx=0; dx<3; dx++) {
                    newMap[hy][hx+dx] = 7; // Tetto
                    newMap[hy+1][hx+dx] = 7; // Muro
                }
                newMap[hy+1][hx+1] = doorTile; // Porta
                newMap[hy+2][hx+1] = 0;
                housePlaced = true;
                houseX = hx + 1;
                houseY = hy + 1;
                
                // Spawn NPCs outside
                if (isBar) {
                        newNPCs.push({
                        x: hx + 1,
                        y: hy + 3,
                        pixelX: (hx + 1) * TILE_SIZE,
                        pixelY: (hy + 3) * TILE_SIZE,
                        direction: 'up',
                        moving: false,
                        moveTimer: 0,
                        text: "Stasera si beve!",
                        color: '#e74c3c'
                    });
                }
                break;
            }
        }
    }

    // Generazione Strade (Roads)
    // Main horizontal road
    const roadY = Math.floor(MAP_SIZE / 2) + Math.floor(Math.sin(wx * 10) * 2);
    for (let x = 1; x < MAP_SIZE - 1; x++) {
        if (newMap[roadY][x] !== 4 && newMap[roadY][x] !== 5 && newMap[roadY][x] !== 7 && newMap[roadY][x] !== 8 && newMap[roadY][x] !== 18) {
                newMap[roadY][x] = 14;
        }
    }

    // Connect house to road
    if (housePlaced) {
        const startY = houseY + 2;
        const endY = roadY;
        const dir = startY < endY ? 1 : -1;
        for (let y = startY; y !== endY + dir; y += dir) {
            if (newMap[y][houseX] !== 4 && newMap[y][houseX] !== 5 && newMap[y][houseX] !== 7 && newMap[y][houseX] !== 8 && newMap[y][houseX] !== 18) {
                newMap[y][houseX] = 14;
            }
        }
    }

    // Spawn NPC
    for (let y = 1; y < MAP_SIZE-1; y++) {
        for (let x = 1; x < MAP_SIZE-1; x++) {
            const t = newMap[y][x];
            if (t === 0 || t === 1 || t === 14) { // Can spawn on roads too
                const rand = Math.random();
                if (rand > 0.985) {
                        newNPCs.push({
                        x: x,
                        y: y,
                        pixelX: x * TILE_SIZE,
                        pixelY: y * TILE_SIZE,
                        direction: 'down',
                        moving: false,
                        moveTimer: Math.random() * 100,
                        text: dialogues[Math.floor(Math.random() * dialogues.length)],
                        color: `hsl(${Math.random() * 360}, 70%, 60%)`
                    });
                    // newMap[y][x] = 6; // Don't mark as solid 6, handle collision dynamically
                }
            }
        }
    }

    // Spawn Boat in Lake
    if (biome === 'lake') {
        // Find a shore spot for the boat
        for (let y = 5; y < MAP_SIZE - 5; y++) {
            for (let x = 5; x < MAP_SIZE - 5; x++) {
                if (newMap[y][x] === 4) {
                    // Check neighbors for land (0, 1, etc)
                    const isLand = (t) => t === 0 || t === 1 || t === 14;
                    if (isLand(newMap[y+1][x]) || isLand(newMap[y-1][x]) || isLand(newMap[y][x+1]) || isLand(newMap[y][x-1])) {
                        boat = { x: x, y: y, direction: 'right' };
                        break;
                    }
                }
            }
            if (boat) break;
        }
    }

    // Spawn Cave Entrance (Randomly)
    if (Math.random() < 0.05 && biome !== 'city' && biome !== 'lake' && biome !== 'frozen_lake') {
        // Try to place on a rock or empty spot
        const cx = Math.floor(Math.random() * (MAP_SIZE - 4)) + 2;
        const cy = Math.floor(Math.random() * (MAP_SIZE - 4)) + 2;
        if (newMap[cy][cx] === 11 || newMap[cy][cx] === 0) {
            newMap[cy][cx] = 30; // Cave Entrance
        }
    }

    return { tiles: newMap, npcs: newNPCs, activeTiles: [], footprints: [], fireflies: [], boat: boat, type: 'outdoor', biome: biome };
}

function generateDungeon() {
    const newMap = [];
    const newNPCs = [];
    const size = 15;
    
    for (let y = 0; y < size; y++) {
        newMap[y] = [];
        for (let x = 0; x < size; x++) {
            if (x === 0 || x === size-1 || y === 0 || y === size-1) {
                newMap[y][x] = 32; // Cave Wall
            } else {
                newMap[y][x] = 31; // Cave Floor
            }
        }
    }
    
    // Random Walls
    for (let i = 0; i < 30; i++) {
        const rx = Math.floor(Math.random() * (size - 2)) + 1;
        const ry = Math.floor(Math.random() * (size - 2)) + 1;
        newMap[ry][rx] = 32;
    }

    // Ladder Up (Back) - Always at start pos (will be set by enterDungeon logic, but default here)
    newMap[size-2][Math.floor(size/2)] = 33; 

    // Tunnel Down (Random Exit)
    let placedExit = false;
    while(!placedExit) {
        const ex = Math.floor(Math.random() * (size - 2)) + 1;
        const ey = Math.floor(Math.random() * (size - 2)) + 1;
        if (newMap[ey][ex] === 31) {
            newMap[ey][ex] = 34;
            placedExit = true;
        }
    }
    
    // Spawn Geodudes
    for(let i=0; i<3; i++) {
        const gx = Math.floor(Math.random() * (size - 2)) + 1;
        const gy = Math.floor(Math.random() * (size - 2)) + 1;
        if (newMap[gy][gx] === 31) {
            newNPCs.push({
                x: gx,
                y: gy,
                pixelX: gx * TILE_SIZE,
                pixelY: gy * TILE_SIZE,
                direction: 'down',
                moving: false,
                moveTimer: 0,
                species: 'geodude',
                text: "Geodude!",
                color: '#fff'
            });
        }
    }

    return { tiles: newMap, npcs: newNPCs, activeTiles: [], footprints: [], fireflies: [], type: 'dungeon' };
}

function enterDungeon() {
    isTransitioning = true;
    transitionOverlay.style.opacity = 1;
    
    savedOutdoorPos = { x: player.x, y: player.y, wx: worldX, wy: worldY };
    
    setTimeout(() => {
        isIndoors = true;
        currentData = generateDungeon();
        currentMap = currentData.tiles;
        currentNPCs = currentData.npcs;
        
        // Place player at Ladder Up
        const mapH = currentMap.length;
        const mapW = currentMap[0].length;
        // Find ladder
        let lx = Math.floor(mapW/2);
        let ly = mapH-2;
        for(let y=0; y<mapH; y++) {
            for(let x=0; x<mapW; x++) {
                if (currentMap[y][x] === 33) { lx = x; ly = y; }
            }
        }

        player.x = lx; 
        player.y = ly;
        player.pixelX = player.x * TILE_SIZE;
        player.pixelY = player.y * TILE_SIZE;
        player.direction = 'up';
        
        updateCamera();
        
        setTimeout(() => {
            transitionOverlay.style.opacity = 0;
            isTransitioning = false;
        }, 100);
    }, 300);
}

function exitDungeon(randomExit) {
    isTransitioning = true;
    transitionOverlay.style.opacity = 1;
    
    setTimeout(() => {
        isIndoors = false;
        
        if (randomExit) {
            // Random location
            worldX = Math.floor(Math.random() * 1000);
            worldY = Math.floor(Math.random() * 1000);
            currentData = getCurrentData();
            currentMap = currentData.tiles;
            currentNPCs = currentData.npcs;
            player.x = Math.floor(MAP_SIZE/2);
            player.y = Math.floor(MAP_SIZE/2);
        } else {
            // Back to entrance
            worldX = savedOutdoorPos.wx;
            worldY = savedOutdoorPos.wy;
            currentData = getCurrentData();
            currentMap = currentData.tiles;
            currentNPCs = currentData.npcs;
            player.x = savedOutdoorPos.x;
            player.y = savedOutdoorPos.y + 1;
        }
        
        player.pixelX = player.x * TILE_SIZE;
        player.pixelY = player.y * TILE_SIZE;
        player.direction = 'down';
        
        updateCamera();
        
        setTimeout(() => {
            transitionOverlay.style.opacity = 0;
            isTransitioning = false;
        }, 100);
    }, 300);
}

function generateInterior(type) {
    const newMap = [];
    const newNPCs = [];
    const size = 10; // Piccola stanza
    
    for (let y = 0; y < size; y++) {
        newMap[y] = [];
        for (let x = 0; x < size; x++) {
            if (x === 0 || x === size-1 || y === 0 || y === size-1) {
                newMap[y][x] = 7; // Muro
            } else {
                newMap[y][x] = type === 'bar' ? 19 : 9; // Pavimento (19=Bar Floor)
            }
        }
    }
    
    // Uscita
    newMap[size-1][Math.floor(size/2)] = 10; // Mat (Exit)
    
    if (type === 'bar') {
        // Counter
        for(let x=2; x<8; x++) {
            newMap[2][x] = 15; // Counter
        }
        newMap[2][2] = 15; // L-shape
        newMap[3][2] = 15;

        // Barman
        newNPCs.push({
            x: 5,
            y: 1,
            pixelX: 5 * TILE_SIZE,
            pixelY: 1 * TILE_SIZE,
            direction: 'down',
            moving: false,
            moveTimer: 0,
            text: "Benvenuto! Vuoi scambiare qualcosa?",
            color: '#2c3e50',
            role: 'merchant'
        });

        // Tables & Chairs
        const tables = [{x: 4, y: 5}, {x: 7, y: 5}, {x: 4, y: 8}, {x: 7, y: 8}];
        tables.forEach(t => {
            newMap[t.y][t.x] = 16; // Table
            // Chairs around
            if (newMap[t.y][t.x-1] !== 7) newMap[t.y][t.x-1] = 17;
            if (newMap[t.y][t.x+1] !== 7) newMap[t.y][t.x+1] = 17;
        });

        // Patrons
        newNPCs.push({
            x: 3,
            y: 5,
            pixelX: 3 * TILE_SIZE,
            pixelY: 5 * TILE_SIZE,
            direction: 'right',
            moving: false,
            moveTimer: 0,
            text: "Hic! Questo posto è fantastico.",
            color: '#e67e22'
        });

    } else {
        // NPC Quiz 1
        newNPCs.push({
            x: 3,
            y: 4,
            pixelX: 3 * TILE_SIZE,
            pixelY: 4 * TILE_SIZE,
            direction: 'down',
            moving: false,
            moveTimer: 0,
            quiz: houseQuizzes[0],
            color: '#ff9ff3'
        });
        newMap[4][3] = 6;

        // NPC Quiz 2
        newNPCs.push({
            x: 6,
            y: 4,
            pixelX: 6 * TILE_SIZE,
            pixelY: 4 * TILE_SIZE,
            direction: 'down',
            moving: false,
            moveTimer: 0,
            quiz: houseQuizzes[1],
            color: '#54a0ff'
        });
        newMap[4][6] = 6;
    }

    return { tiles: newMap, npcs: newNPCs, activeTiles: [], footprints: [], fireflies: [], type: 'indoor', width: size, height: size };
}

// Gestione Mappe
function getCurrentData() {
    const key = `${worldX},${worldY}`;
    if (!world[key]) {
        world[key] = generateMap(worldX, worldY);
    }
    return world[key];
}

// Cambio Mappa
function switchMap(dx, dy) {
    isTransitioning = true;
    transitionOverlay.style.opacity = 1;

    setTimeout(() => {
        worldX += dx;
        worldY += dy;
        currentData = getCurrentData();
        currentMap = currentData.tiles;
        currentNPCs = currentData.npcs;

        // Riposiziona player
        if (dx > 0) { player.x = 1; }
        else if (dx < 0) { player.x = MAP_SIZE - 2; }
        
        if (dy > 0) { player.y = 1; }
        else if (dy < 0) { player.y = MAP_SIZE - 2; }

        // Reset pixel position immediato
        player.pixelX = player.x * TILE_SIZE;
        player.pixelY = player.y * TILE_SIZE;
        player.moving = false;
        player.isSurfing = false; // Reset surfing on map switch

        updateCamera();
        
        setTimeout(() => {
            transitionOverlay.style.opacity = 0;
            isTransitioning = false;
        }, 100);
    }, 300);
}

function enterHouse(type = 'house') {
    isTransitioning = true;
    transitionOverlay.style.opacity = 1;
    
    savedOutdoorPos = { x: player.x, y: player.y, wx: worldX, wy: worldY };
    
    setTimeout(() => {
        isIndoors = true;
        currentData = generateInterior(type);
        currentMap = currentData.tiles;
        currentNPCs = currentData.npcs;
        
        // Place player at bottom center (above mat)
        player.x = 5; 
        player.y = 8;
        player.pixelX = player.x * TILE_SIZE;
        player.pixelY = player.y * TILE_SIZE;
        player.direction = 'up';
        player.moving = false; // Ensure not moving
        player.isSurfing = false; // Ensure not surfing indoors
        player.turnTimer = 0; // Reset turn timer
        
        updateCamera();
        
        setTimeout(() => {
            transitionOverlay.style.opacity = 0;
            isTransitioning = false;
        }, 100);
    }, 300);
}

function exitHouse() {
    isTransitioning = true;
    transitionOverlay.style.opacity = 1;
    
    setTimeout(() => {
        isIndoors = false;
        worldX = savedOutdoorPos.wx;
        worldY = savedOutdoorPos.wy;
        currentData = getCurrentData(); // Reload outdoor map
        currentMap = currentData.tiles;
        currentNPCs = currentData.npcs;
        
        player.x = savedOutdoorPos.x;
        player.y = savedOutdoorPos.y + 1; // Step out
        player.pixelX = player.x * TILE_SIZE;
        player.pixelY = player.y * TILE_SIZE;
        player.direction = 'down';
        player.moving = false;
        player.turnTimer = 0; // Reset turn timer

        // Reset keys
        keys.up = false;
        keys.down = false;
        keys.left = false;
        keys.right = false;
        
        updateCamera();
        
        setTimeout(() => {
            transitionOverlay.style.opacity = 0;
            isTransitioning = false;
        }, 100);
    }, 300);
}
