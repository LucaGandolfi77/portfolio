        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        const transitionOverlay = document.getElementById('transition-overlay');
        const dialogueBox = document.getElementById('dialogue-box');
        const dialogueText = document.getElementById('dialogue-text');
        const dialogueOptions = document.getElementById('dialogue-options');
        
        // Configurazione gioco
        const TILE_SIZE = 32;
        const MAP_SIZE = 20;
        const VISIBLE_TILES = 10;
        const WALK_SPEED = 2;
        const RUN_SPEED = 4;
        
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

        function updateTime() {
            gameTime.timer++;
            if (gameTime.timer > 10) { // Update every 10 frames (fast time)
                gameTime.timer = 0;
                gameTime.minute++;
                if (gameTime.minute >= 60) {
                    gameTime.minute = 0;
                    gameTime.hour++;
                    if (gameTime.hour >= 24) {
                        gameTime.hour = 0;
                    }
                }
                
                // Update UI
                const h = gameTime.hour.toString().padStart(2, '0');
                const m = gameTime.minute.toString().padStart(2, '0');
                document.getElementById('clock-time').textContent = `${h}:${m}`;
                
                // Update Icon & Day/Night State
                const icon = document.getElementById('clock-icon');
                if (gameTime.hour >= 6 && gameTime.hour < 20) {
                    if (!gameTime.day) {
                        gameTime.day = true;
                        icon.textContent = '☀️';
                    }
                } else {
                    if (gameTime.day) {
                        gameTime.day = false;
                        icon.textContent = '🌙';
                    }
                }
            }
        }
        
        // Quiz State
        let quizState = {
            active: false,
            options: [],
            selected: 0,
            callback: null
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
        
        function updateInventoryUI() {
            document.getElementById('inv-money').textContent = player.inventory.money;
            document.getElementById('inv-wood').textContent = player.inventory.wood;
            document.getElementById('inv-stone').textContent = player.inventory.stone;
            document.getElementById('inv-grass').textContent = player.inventory.grass;
        }

        // Camera
        const camera = {
            x: 0,
            y: 0
        };
        
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
            puddle: '#74b9ff'
        };

        // Biome Helper
        function getBiome(wx, wy) {
            // Simple noise for biome
            const noise = Math.sin(wx * 0.3) + Math.cos(wy * 0.3);
            if (noise < -1.3) return 'frozen_lake'; // Frozen Lake
            if (noise < -1) return 'ice';
            if (noise < -0.5) return 'city';
            if (noise < -0.2) return 'forest';
            if (noise < 0.2) return 'lake'; // New Lake Biome
            if (noise < 0.5) return 'mountain'; // New Mountain Biome
            if (noise < 0.8) return 'tropical';
            if (noise < 1.2) return 'rain'; // Rain Biome
            return 'desert';
        }

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
        let currentToolIndex = 0;

        function switchTool() {
            currentToolIndex = (currentToolIndex + 1) % tools.length;
            updateToolUI();
        }

        function updateToolUI() {
            const tool = tools[currentToolIndex];
            document.getElementById('tool-name').textContent = tool.name;
            document.getElementById('tool-icon').textContent = tool.icon;
        }

        function useTool() {
            if (isIndoors) return; // No tools indoors for now

            // Get tile in front
            let tx = player.x;
            let ty = player.y;
            if (player.direction === 'up') ty--;
            if (player.direction === 'down') ty++;
            if (player.direction === 'left') tx--;
            if (player.direction === 'right') tx++;
            
            const mapW = currentMap[0].length;
            const mapH = currentMap.length;
            if (tx < 0 || tx >= mapW || ty < 0 || ty >= mapH) return;
            
            const tile = currentMap[ty][tx];
            const tool = tools[currentToolIndex].id;
            
            if (tool === 'axe' && tile === 2) { // Tree
                currentMap[ty][tx] = 12; // Stump
                createParticles(tx, ty, colors.treeLeaves);
                player.inventory.wood++;
                updateInventoryUI();
            } else if (tool === 'axe' && tile === 1) { // Grass (Axe can cut grass too)
                currentMap[ty][tx] = 0; // Ground
                createParticles(tx, ty, colors.grass);
                player.inventory.grass++;
                updateInventoryUI();
            } else if (tool === 'pickaxe' && tile === 11) { // Rock
                currentMap[ty][tx] = 0; // Ground
                createParticles(tx, ty, colors.rock);
                player.inventory.stone++;
                updateInventoryUI();
            } else if (tool === 'hoe' && tile === 0) { // Ground
                currentMap[ty][tx] = 13; // Tilled soil
                createParticles(tx, ty, colors.tilled);
            } else if (tool === 'hoe' && tile === 13) { // Tilled
                currentMap[ty][tx] = 0; // Back to ground
                createParticles(tx, ty, colors.terrain);
            } else if (tool === 'hoe' && tile === 1) { // Grass
                currentMap[ty][tx] = 0; // Ground
                createParticles(tx, ty, colors.grass);
                player.inventory.grass++;
                updateInventoryUI();
            }
        }

        function createParticles(x, y, color) {
            // Placeholder for particle effect
            // Could implement simple canvas particles here if needed
        }

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

        let currentData = getCurrentData();
        let currentMap = currentData.tiles;
        let currentNPCs = currentData.npcs;
        
        // Disegna tile
        // Disegna tile (Ground Layer)
        function drawGround(x, y, type) {
            const screenX = x * TILE_SIZE;
            const screenY = y * TILE_SIZE;
            
            // Default Ground
            if (currentData.biome === 'desert') ctx.fillStyle = colors.sand;
            else if (currentData.biome === 'ice') ctx.fillStyle = colors.snow;
            else if (currentData.biome === 'tropical') ctx.fillStyle = colors.jungleGrass;
            else if (currentData.biome === 'mountain') ctx.fillStyle = '#95a5a6'; // Mountain Grey
            else if (currentData.biome === 'rain') ctx.fillStyle = colors.rainGrass;
            else ctx.fillStyle = colors.terrain;
            
            ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);

            // Detail
            if ((x + y) % 2 === 0) {
                ctx.fillStyle = 'rgba(0,0,0,0.02)';
                ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
            }

            // Specific Ground Types
            if (type === 4) { // Water
                ctx.fillStyle = currentData.biome === 'tropical' ? colors.jungleWater : colors.water;
                ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
                const time = Date.now() / 500;
                const waveOffset = Math.sin(time + x + y) * 2;
                ctx.fillStyle = colors.waterHighlight;
                ctx.fillRect(screenX + 4 + waveOffset, screenY + 8, 6, 2);
                ctx.fillRect(screenX + 18 - waveOffset, screenY + 20, 8, 2);

                // Active Tile Effect (Shaking Water)
                if (currentData.activeTiles) {
                    const active = currentData.activeTiles.find(t => t.x === x && t.y === y);
                    if (active) {
                        const shake = Math.sin(Date.now() / 50) * 2;
                        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                        ctx.beginPath();
                        ctx.arc(screenX + 16 + shake, screenY + 16, 10 + shake, 0, Math.PI * 2);
                        ctx.stroke();
                    }
                }
            } else if (type === 5) { // Bridge
                ctx.fillStyle = currentData.biome === 'tropical' ? colors.jungleWater : colors.water;
                ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
                ctx.fillStyle = colors.bridge;
                ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
                ctx.fillStyle = colors.bridgeDark;
                for(let i=0; i<4; i++) {
                    ctx.fillRect(screenX, screenY + (i*8), TILE_SIZE, 1);
                }
            } else if (type === 0) { // Generic Ground (Sand/Snow check for active)
                // Default Ground
                if (currentData.biome === 'desert') ctx.fillStyle = colors.sand;
                else if (currentData.biome === 'ice') ctx.fillStyle = colors.snow;
                else if (currentData.biome === 'tropical') ctx.fillStyle = colors.jungleGrass;
                else if (currentData.biome === 'rain') ctx.fillStyle = colors.rainGrass;
                else ctx.fillStyle = colors.terrain;
                
                ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);

                // Detail
                if ((x + y) % 2 === 0) {
                    ctx.fillStyle = 'rgba(0,0,0,0.02)';
                    ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
                }

                if (currentData.activeTiles) {
                    const active = currentData.activeTiles.find(t => t.x === x && t.y === y);
                    if (active) {
                        const shake = Math.sin(Date.now() / 50) * 2;
                        ctx.fillStyle = currentData.biome === 'desert' ? '#d35400' : '#74b9ff';
                        ctx.fillRect(screenX + 14 + shake, screenY + 14, 4, 4);
                        ctx.fillRect(screenX + 10 - shake, screenY + 18, 3, 3);
                    }
                }
            } else if (type === 9) { // Floor
                ctx.fillStyle = colors.houseFloor;
                ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
            } else if (type === 10) { // Mat
                ctx.fillStyle = colors.houseFloor;
                ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
                ctx.fillStyle = colors.houseMat;
                ctx.fillRect(screenX + 4, screenY + 8, 24, 16);
            } else if (type === 13) { // Tilled
                ctx.fillStyle = colors.tilled;
                ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
                ctx.fillStyle = 'rgba(0,0,0,0.1)';
                for(let i=0; i<4; i++) {
                    ctx.fillRect(screenX, screenY + (i*8) + 2, TILE_SIZE, 2);
                }
            } else if (type === 14) { // Road
                ctx.fillStyle = colors.road;
                ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
                ctx.fillStyle = colors.roadDetail;
                // Gravel texture
                for(let i=0; i<4; i++) {
                    const rx = (x * 13 + i * 7) % 24;
                    const ry = (y * 17 + i * 11) % 24;
                    ctx.fillRect(screenX + rx + 2, screenY + ry + 2, 2, 2);
                }
            } else if (type === 19) { // Bar Floor
                ctx.fillStyle = colors.barFloor;
                ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
                // Checkerboard pattern
                if ((x+y)%2===0) {
                    ctx.fillStyle = 'rgba(255,255,255,0.05)';
                    ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
                }
            } else if (type === 22) { // Ice Patch
                ctx.fillStyle = colors.ice;
                ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
                ctx.fillStyle = 'rgba(255,255,255,0.3)';
                ctx.beginPath();
                ctx.moveTo(screenX, screenY);
                ctx.lineTo(screenX + 10, screenY + 32);
                ctx.stroke();
            } else if (type === 25) { // City Road
                ctx.fillStyle = colors.cityRoad;
                ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
                // Dashed line
                ctx.fillStyle = 'rgba(255,255,255,0.5)';
                if (x % 6 === 0 && y % 2 !== 0) ctx.fillRect(screenX + 14, screenY, 4, 32); // Vertical road marking
                if (y % 6 === 0 && x % 2 !== 0) ctx.fillRect(screenX, screenY + 14, 32, 4); // Horizontal road marking
            } else if (type === 26) { // City Sidewalk
                ctx.fillStyle = colors.citySidewalk;
                ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
                // Pavement pattern
                ctx.fillStyle = 'rgba(255,255,255,0.1)';
                ctx.fillRect(screenX, screenY, TILE_SIZE - 2, TILE_SIZE - 2);
            } else if (type === 30) { // Cave Entrance
                ctx.fillStyle = colors.rock;
                ctx.beginPath();
                ctx.arc(screenX + 16, screenY + 16, 14, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = colors.caveEntrance;
                ctx.beginPath();
                ctx.arc(screenX + 16, screenY + 18, 8, 0, Math.PI * 2);
                ctx.fill();
            } else if (type === 31) { // Cave Floor
                ctx.fillStyle = colors.caveFloor;
                ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
                // Texture
                if ((x+y)%3===0) {
                    ctx.fillStyle = 'rgba(0,0,0,0.1)';
                    ctx.fillRect(screenX + 8, screenY + 8, 4, 4);
                }
            } else if (type === 32) { // Cave Wall
                ctx.fillStyle = colors.caveWall;
                ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
                ctx.fillStyle = '#1a1a1a';
                ctx.fillRect(screenX + 4, screenY + 4, 24, 24);
            } else if (type === 33) { // Ladder Up
                ctx.fillStyle = colors.caveFloor;
                ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
                ctx.fillStyle = '#8b5a2b';
                ctx.fillRect(screenX + 8, screenY + 4, 4, 24); // Left rail
                ctx.fillRect(screenX + 20, screenY + 4, 4, 24); // Right rail
                for(let i=0; i<5; i++) {
                    ctx.fillRect(screenX + 8, screenY + 6 + (i*5), 16, 2); // Rungs
                }
            } else if (type === 34) { // Tunnel Down (Exit Random)
                ctx.fillStyle = colors.caveFloor;
                ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
                ctx.fillStyle = '#000';
                ctx.beginPath();
                ctx.arc(screenX + 16, screenY + 16, 10, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Disegna Oggetti (Sorted Layer)
        function drawObject(x, y, type) {
            const screenX = x * TILE_SIZE;
            const screenY = y * TILE_SIZE;

            // Calcola shake
            let shakeX = 0;
            if (currentData.activeTiles) {
                const active = currentData.activeTiles.find(t => t.x === x && t.y === y);
                if (active) {
                    shakeX = Math.sin(Date.now() / 50) * 2;
                }
            }

            // Helper per disegnare sprite cachati
            const drawTreeLike = (key, drawBodyFn, shadowWidth) => {
                // Ombra statica
                ctx.fillStyle = colors.shadow;
                ctx.beginPath();
                ctx.ellipse(screenX + 16, screenY + 28, shadowWidth, 4, 0, 0, Math.PI * 2);
                ctx.fill();
                
                // Corpo (Tremolante)
                const sprite = getCachedSprite(key, (c) => {
                    c.translate(0, 24); 
                    drawBodyFn(c);
                }, 32, 64);
                ctx.drawImage(sprite, screenX + shakeX, screenY - 24);
            };

            if (type === 1) { // Erba Alta
                const biome = currentData.biome;
                const variant = (x + y) % 4;
                const key = `grass_${biome}_${variant}`;
                
                // Wind Effect
                const wind = Math.sin(Date.now() / 500 + x * 0.5 + y * 0.5) * 2;

                const sprite = getCachedSprite(key, (c) => {
                    c.fillStyle = (biome === 'tropical') ? colors.jungleGrass : colors.grass;
                    c.fillStyle = colors.grassDetail;
                    for(let i=0; i<3; i++) {
                        const ox = (variant * 7 + i * 5) % 20;
                        const oy = (variant * 3 + i * 8) % 20;
                        c.fillRect(5 + ox, 5 + oy, 2, 4);
                    }
                }, 32, 32);
                ctx.drawImage(sprite, screenX + shakeX + wind, screenY);

            } else if (type === 2) { // Albero
                drawTreeLike('tree', (c) => {
                    const treeY = -16; 
                    c.fillStyle = colors.treeTrunk;
                    c.fillRect(12, treeY + 34, 8, 10);
                    c.fillStyle = colors.treeLeaves;
                    c.beginPath();
                    c.arc(16, treeY + 20, 14, 0, Math.PI * 2);
                    c.arc(8, treeY + 30, 10, 0, Math.PI * 2);
                    c.arc(24, treeY + 30, 10, 0, Math.PI * 2);
                    c.fill();
                }, 10);

            } else if (type === 20) { // Cactus
                drawTreeLike('cactus', (c) => {
                    const cY = -16;
                    c.fillStyle = colors.cactus;
                    c.beginPath();
                    c.roundRect(12, cY + 10, 8, 38, 4); 
                    c.roundRect(4, cY + 20, 8, 8, 4); 
                    c.roundRect(20, cY + 15, 8, 8, 4); 
                    c.fill();
                }, 8);

            } else if (type === 21) { // Pine
                drawTreeLike('pine', (c) => {
                    const pY = -20;
                    c.fillStyle = colors.pine;
                    c.fillRect(14, 20, 4, 10);
                    c.fillStyle = colors.pineLeaves;
                    c.beginPath();
                    c.moveTo(16, pY + 10);
                    c.lineTo(4, pY + 40);
                    c.lineTo(28, pY + 40);
                    c.fill();
                }, 10);

            } else if (type === 23) { // Palm
                drawTreeLike('palm', (c) => {
                    const pY = -24;
                    c.fillStyle = colors.palmTrunk;
                    c.beginPath();
                    c.moveTo(14, 28);
                    c.quadraticCurveTo(16, 10, 20, pY + 20);
                    c.lineTo(24, pY + 20);
                    c.quadraticCurveTo(20, 10, 18, 28);
                    c.fill();
                    c.fillStyle = colors.palmLeaves;
                    c.beginPath();
                    c.arc(22, pY + 20, 16, Math.PI, 0); 
                    c.fill();
                }, 8);

            } else if (type === 3) { // Fiore
                // Wind Effect
                const wind = Math.sin(Date.now() / 400 + x * 0.7 + y * 0.7) * 1.5;

                const sprite = getCachedSprite('flower', (c) => {
                    c.fillStyle = colors.flower;
                    for(let i=0; i<5; i++) {
                        const angle = (Math.PI * 2 / 5) * i;
                        const px = 16 + Math.cos(angle) * 5;
                        const py = 16 + Math.sin(angle) * 5;
                        c.beginPath();
                        c.arc(px, py, 3, 0, Math.PI * 2);
                        c.fill();
                    }
                    c.fillStyle = colors.flowerCenter;
                    c.beginPath();
                    c.arc(16, 16, 2.5, 0, Math.PI * 2);
                    c.fill();
                }, 32, 32);
                ctx.drawImage(sprite, screenX + wind, screenY);

            } else if (type === 7) { // Muro/Tetto Casa
                const isRoof = (y < currentMap.length-1 && (currentMap[y+1][x] === 7 || currentMap[y+1][x] === 8 || currentMap[y+1][x] === 18));
                const isBar = (y < currentMap.length-1 && currentMap[y+1][x] === 18);
                
                if (isRoof) {
                    const key = isBar ? 'roof_bar' : 'roof';
                    const sprite = getCachedSprite(key, (c) => {
                        c.translate(2, 16);
                        const roofY = -16;
                        c.fillStyle = colors.houseRoof;
                        c.beginPath();
                        c.moveTo(0, 32);
                        c.lineTo(16, roofY); 
                        c.lineTo(32, 32);
                        c.fill();
                        c.fillRect(-2, 20, 36, 12);

                        if (isBar) {
                            c.fillStyle = '#f1c40f';
                            c.font = 'bold 10px Arial';
                            c.textAlign = 'center';
                            c.fillText('BAR', 16, 28);
                        }
                    }, 40, 64);
                    ctx.drawImage(sprite, screenX - 2, screenY - 16);
                } else {
                    const sprite = getCachedSprite('wall', (c) => {
                        c.fillStyle = colors.houseWall;
                        c.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
                        c.fillStyle = '#dfe6e9';
                        c.fillRect(8, 8, 16, 16);
                        c.fillStyle = '#b2bec3';
                        c.fillRect(15, 8, 2, 16);
                        c.fillRect(8, 15, 16, 2);
                    }, 32, 32);
                    ctx.drawImage(sprite, screenX, screenY);
                }

            } else if (type === 8 || type === 18) { // Porta
                const key = (type === 18) ? 'door_bar' : 'door';
                const sprite = getCachedSprite(key, (c) => {
                    c.fillStyle = colors.houseWall;
                    c.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
                    c.fillStyle = type === 18 ? '#c0392b' : colors.houseDoor; 
                    c.fillRect(6, 8, 20, 24);
                    c.fillStyle = '#ffd700';
                    c.beginPath();
                    c.arc(22, 20, 2, 0, Math.PI * 2);
                    c.fill();
                    if (type === 18) {
                        c.fillStyle = 'rgba(255, 255, 0, 0.3)';
                        c.fillRect(6, 8, 20, 24);
                    }
                }, 32, 32);
                ctx.drawImage(sprite, screenX, screenY);

            } else if (type === 11) { // Roccia
                const sprite = getCachedSprite('rock', (c) => {
                    c.fillStyle = colors.rock;
                    c.beginPath();
                    c.arc(16, 16, 12, 0, Math.PI * 2);
                    c.fill();
                    c.fillStyle = colors.rockDark;
                    c.beginPath();
                    c.arc(12, 12, 4, 0, Math.PI * 2);
                    c.fill();
                }, 32, 32);
                ctx.drawImage(sprite, screenX + shakeX, screenY);

            } else if (type === 12) { // Ceppo
                const sprite = getCachedSprite('stump', (c) => {
                    c.fillStyle = colors.stump;
                    c.beginPath();
                    c.arc(16, 20, 10, 0, Math.PI * 2);
                    c.fill();
                    c.fillStyle = colors.stumpTop;
                    c.beginPath();
                    c.arc(16, 18, 8, 0, Math.PI * 2);
                    c.fill();
                    c.strokeStyle = colors.stump;
                    c.lineWidth = 1;
                    c.beginPath();
                    c.arc(16, 18, 5, 0, Math.PI * 2);
                    c.stroke();
                }, 32, 32);
                ctx.drawImage(sprite, screenX, screenY);

            } else if (type === 15) { // Bar Counter
                const sprite = getCachedSprite('bar_counter', (c) => {
                    c.fillStyle = colors.barCounter;
                    c.fillRect(0, 8, TILE_SIZE, 24);
                    c.fillStyle = '#9b59b6';
                    c.fillRect(0, 8, TILE_SIZE, 8);
                }, 32, 32);
                ctx.drawImage(sprite, screenX, screenY);

            } else if (type === 16) { // Bar Table
                const sprite = getCachedSprite('bar_table', (c) => {
                    c.fillStyle = colors.barTable;
                    c.beginPath();
                    c.ellipse(16, 20, 12, 8, 0, 0, Math.PI * 2);
                    c.fill();
                    c.fillStyle = '#e67e22';
                    c.beginPath();
                    c.ellipse(16, 18, 10, 6, 0, 0, Math.PI * 2);
                    c.fill();
                    c.fillStyle = '#f1c40f';
                    c.fillRect(14, 14, 4, 6);
                }, 32, 32);
                ctx.drawImage(sprite, screenX, screenY);

            } else if (type === 17) { // Bar Chair
                const sprite = getCachedSprite('bar_chair', (c) => {
                    c.fillStyle = colors.barChair;
                    c.beginPath();
                    c.arc(16, 20, 6, 0, Math.PI * 2);
                    c.fill();
                    c.fillStyle = '#c0392b';
                    c.beginPath();
                    c.arc(16, 20, 4, 0, Math.PI * 2);
                    c.fill();
                }, 32, 32);
                ctx.drawImage(sprite, screenX, screenY);

            } else if (type === 24) { // Puddle
                const sprite = getCachedSprite('puddle', (c) => {
                    c.fillStyle = colors.puddle;
                    c.beginPath();
                    c.ellipse(16, 20, 12, 6, 0, 0, Math.PI * 2);
                    c.fill();
                    c.fillStyle = 'rgba(255,255,255,0.3)';
                    c.beginPath();
                    c.ellipse(16, 18, 8, 3, 0, 0, Math.PI * 2);
                    c.fill();
                }, 32, 32);
                ctx.drawImage(sprite, screenX + shakeX, screenY);
            }
        }

        // Disegna NPC
        function drawNPC(npc) {
            const screenX = (npc.pixelX !== undefined ? npc.pixelX : npc.x * TILE_SIZE);
            const screenY = (npc.pixelY !== undefined ? npc.pixelY : npc.y * TILE_SIZE);
            
            // Animazione camminata (se si muove)
            const bounce = npc.moving ? Math.abs(Math.sin(Date.now() / 100)) * 3 : 0;
            const drawY = screenY - bounce;

            // Ombra
            ctx.fillStyle = colors.shadow;
            ctx.beginPath();
            ctx.ellipse(screenX + 16, screenY + 28, 8, 3, 0, 0, Math.PI * 2);
            ctx.fill();

            if (npc.species === 'bulbasaur') {
                drawBulbasaur(screenX, drawY, npc.direction);
                return;
            } else if (npc.species === 'lapras') {
                drawLapras(screenX, drawY, npc.direction);
                return;
            } else if (npc.species === 'sandshrew') {
                drawSandshrew(screenX, drawY, npc.direction);
                return;
            } else if (npc.species === 'spheal') {
                drawSpheal(screenX, drawY, npc.direction);
                return;
            } else if (npc.species === 'caterpie') {
                drawCaterpie(screenX, drawY, npc.direction);
                return;
            } else if (npc.species === 'geodude') {
                drawGeodude(screenX, drawY, npc.direction);
                return;
            } else if (npc.species === 'onix') {
                drawOnix(screenX, drawY, npc.direction);
                return;
            } else if (npc.species === 'wobbuffet') {
                drawWobbuffet(screenX, drawY, npc.direction);
                return;
            }

            // Corpo
            ctx.fillStyle = npc.color || colors.npcBody;
            ctx.beginPath();
            ctx.roundRect(screenX + 8, drawY + 14, 16, 14, 4);
            ctx.fill();

            // Testa
            ctx.fillStyle = colors.playerSkin;
            ctx.beginPath();
            ctx.roundRect(screenX + 6, drawY + 2, 20, 18, 6);
            ctx.fill();

            // Occhi
            ctx.fillStyle = '#333';
            if (npc.direction === 'left') {
                ctx.fillRect(screenX + 8, drawY + 10, 2, 4);
            } else if (npc.direction === 'right') {
                ctx.fillRect(screenX + 22, drawY + 10, 2, 4);
            } else if (npc.direction === 'up') {
                // No eyes visible from back
            } else {
                // Down (default)
                ctx.fillRect(screenX + 10, drawY + 10, 2, 4);
                ctx.fillRect(screenX + 20, drawY + 10, 2, 4);
            }
        }
        
        function drawBulbasaur(x, y, dir) {
            // Body (Teal)
            ctx.fillStyle = '#48d0b0';
            ctx.beginPath();
            ctx.roundRect(x + 4, y + 12, 24, 18, 6);
            ctx.fill();
            
            // Bulb (Green)
            ctx.fillStyle = '#2ecc71';
            ctx.beginPath();
            ctx.ellipse(x + 16, y + 10, 8, 8, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Head
            ctx.fillStyle = '#48d0b0';
            ctx.beginPath();
            ctx.roundRect(x + 6, y + 6, 20, 16, 5);
            ctx.fill();

            // Spots
            ctx.fillStyle = '#27ae60';

            ctx.fillRect(x + 8, y + 18, 4, 4);
            ctx.fillRect(x + 20, y + 22, 3, 3);

            // Eyes
            ctx.fillStyle = '#fff';
            if (dir === 'left') {
                ctx.fillRect(x + 6, y + 10, 4, 4);
                ctx.fillStyle = '#c0392b';
                ctx.fillRect(x + 6, y + 11, 2, 2);
            } else if (dir === 'right') {
                ctx.fillRect(x + 22, y + 10, 4, 4);
                ctx.fillStyle = '#c0392b';
                ctx.fillRect(x + 24, y + 11, 2, 2);
            } else if (dir === 'down' || !dir) {
                ctx.fillRect(x + 8, y + 10, 4, 4);
                ctx.fillRect(x + 20, y + 10, 4, 4);
                ctx.fillStyle = '#c0392b';
                ctx.fillRect(x + 9, y + 11, 2, 2);
                ctx.fillRect(x + 21, y + 11, 2, 2);
            }
        }

        function drawLapras(x, y, dir) {
            // Body (Blue)
            ctx.fillStyle = '#3498db';
            ctx.beginPath();
            ctx.ellipse(x + 16, y + 24, 14, 8, 0, 0, Math.PI * 2);
            ctx.fill();

            // Shell (Grey)
            ctx.fillStyle = '#95a5a6';
            ctx.beginPath();
            ctx.ellipse(x + 16, y + 20, 10, 8, 0, 0, Math.PI * 2);
            ctx.fill();
            // Shell bumps
            ctx.fillStyle = '#7f8c8d';
            ctx.beginPath();
            ctx.arc(x + 12, y + 18, 2, 0, Math.PI*2);
            ctx.arc(x + 20, y + 18, 2, 0, Math.PI*2);
            ctx.arc(x + 16, y + 16, 2, 0, Math.PI*2);
            ctx.fill();

            // Neck & Head
            ctx.fillStyle = '#3498db';
            ctx.beginPath();
            if (dir === 'left') {
                ctx.moveTo(x + 10, y + 24);
                ctx.quadraticCurveTo(x + 6, y + 16, x + 8, y + 8); // Neck
                ctx.ellipse(x + 8, y + 6, 6, 5, 0, 0, Math.PI*2); // Head
            } else if (dir === 'right') {
                ctx.moveTo(x + 22, y + 24);
                ctx.quadraticCurveTo(x + 26, y + 16, x + 24, y + 8); // Neck
                ctx.ellipse(x + 24, y + 6, 6, 5, 0, 0, Math.PI*2); // Head
            } else {
                ctx.moveTo(x + 16, y + 24);
                ctx.quadraticCurveTo(x + 16, y + 16, x + 16, y + 8); // Neck
                ctx.stroke(); // Just line for neck? No, fill
                ctx.fillRect(x + 14, y + 10, 4, 14);
                ctx.ellipse(x + 16, y + 6, 6, 5, 0, 0, Math.PI*2); // Head
            }
            ctx.fill();

            // Eyes
            ctx.fillStyle = '#000';
            if (dir === 'left') {
                ctx.fillRect(x + 6, y + 5, 2, 2);
            } else if (dir === 'right') {
                ctx.fillRect(x + 24, y + 5, 2, 2);
            } else {
                ctx.fillRect(x + 14, y + 5, 2, 2);
                ctx.fillRect(x + 18, y + 5, 2, 2);
            }
        }

        function drawSandshrew(x, y, dir) {
            // Body (Yellow/Brown)
            ctx.fillStyle = '#f1c40f';
            ctx.beginPath();
            ctx.ellipse(x + 16, y + 20, 12, 10, 0, 0, Math.PI * 2);
            ctx.fill();
            // Brick pattern (Scales)
            ctx.fillStyle = '#d35400';
            ctx.fillRect(x + 10, y + 16, 4, 2);
            ctx.fillRect(x + 18, y + 16, 4, 2);
            ctx.fillRect(x + 14, y + 20, 4, 2);
            
            // Head
            ctx.fillStyle = '#f1c40f';
            ctx.beginPath();
            ctx.arc(x + 16, y + 12, 10, 0, Math.PI * 2);
            ctx.fill();
            
            // Eyes
            ctx.fillStyle = '#000';
            ctx.fillRect(x + 12, y + 10, 3, 3);
            ctx.fillRect(x + 18, y + 10, 3, 3);
        }

        function drawSpheal(x, y, dir) {
            // Body (Blue Round)
            ctx.fillStyle = '#74b9ff';
            ctx.beginPath();
            ctx.arc(x + 16, y + 20, 14, 0, Math.PI * 2);
            ctx.fill();
            // Spots
            ctx.fillStyle = '#dfe6e9';
            ctx.beginPath();
            ctx.arc(x + 12, y + 16, 2, 0, Math.PI * 2);
            ctx.arc(x + 20, y + 16, 2, 0, Math.PI * 2);
            ctx.arc(x + 16, y + 12, 2, 0, Math.PI * 2);
            ctx.fill();
            
            // Eyes
            ctx.fillStyle = '#000';
            ctx.fillRect(x + 13, y + 18, 2, 2);
            ctx.fillRect(x + 17, y + 18, 2, 2);
        }

        function drawCaterpie(x, y, dir) {
            // Segments (Green)
            ctx.fillStyle = '#2ecc71';
            // Tail
            ctx.beginPath(); ctx.arc(x + 16, y + 28, 5, 0, Math.PI*2); ctx.fill();
            // Body
            ctx.beginPath(); ctx.arc(x + 16, y + 22, 6, 0, Math.PI*2); ctx.fill();
            // Head
            ctx.beginPath(); ctx.arc(x + 16, y + 14, 7, 0, Math.PI*2); ctx.fill();
            
            // Antennae (Red)
            ctx.fillStyle = '#e74c3c';
            ctx.fillRect(x + 14, y + 6, 2, 4);
            ctx.fillRect(x + 18, y + 6, 2, 4);
            
            // Eyes
            ctx.fillStyle = '#000';
            ctx.beginPath(); ctx.arc(x + 14, y + 14, 2, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(x + 18, y + 14, 2, 0, Math.PI*2); ctx.fill();
        }

        function drawGeodude(x, y, dir) {
            // Body (Grey/Brown)
            ctx.fillStyle = '#95a5a6';
            ctx.beginPath();
            ctx.arc(x + 16, y + 16, 10, 0, Math.PI * 2);
            ctx.fill();
            
            // Arms
            ctx.lineWidth = 4;
            ctx.strokeStyle = '#95a5a6';
            ctx.beginPath();
            // Left Arm
            ctx.moveTo(x + 8, y + 16);
            ctx.lineTo(x + 2, y + 10);
            // Right Arm
            ctx.moveTo(x + 24, y + 16);
            ctx.lineTo(x + 30, y + 10);
            ctx.stroke();
            ctx.lineWidth = 1;

            // Hands
            ctx.fillStyle = '#7f8c8d';
            ctx.beginPath(); ctx.arc(x + 2, y + 10, 4, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(x + 30, y + 10, 4, 0, Math.PI*2); ctx.fill();

            // Face
            ctx.fillStyle = '#000';
            ctx.fillRect(x + 12, y + 14, 2, 2); // Eye L
            ctx.fillRect(x + 18, y + 14, 2, 2); // Eye R
            ctx.beginPath(); ctx.arc(x + 16, y + 20, 3, 0, Math.PI, false); ctx.stroke(); // Mouth
        }

        function drawOnix(x, y, dir) {
            // Body segments (Grey)
            ctx.fillStyle = '#95a5a6';
            
            // Tail to Head
            ctx.beginPath(); ctx.arc(x + 24, y + 28, 4, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(x + 20, y + 24, 5, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(x + 16, y + 20, 6, 0, Math.PI*2); ctx.fill();
            
            // Head
            ctx.fillStyle = '#7f8c8d';
            ctx.beginPath(); ctx.arc(x + 12, y + 14, 8, 0, Math.PI*2); ctx.fill();
            
            // Horn
            ctx.fillStyle = '#bdc3c7';
            ctx.beginPath();
            ctx.moveTo(x + 12, y + 6);
            ctx.lineTo(x + 10, y + 2);
            ctx.lineTo(x + 14, y + 2);
            ctx.fill();

            // Eyes
            ctx.fillStyle = '#000';
            ctx.fillRect(x + 10, y + 12, 2, 2);
            ctx.fillRect(x + 14, y + 12, 2, 2);
        }

        function drawWobbuffet(x, y, dir) {
            // Body (Blue)
            ctx.fillStyle = '#3498db';
            ctx.beginPath();
            ctx.ellipse(x + 16, y + 20, 12, 14, 0, 0, Math.PI * 2); // Blob body
            ctx.fill();
            
            // Arms (Black/Blue)
            ctx.fillStyle = '#3498db';
            ctx.beginPath();
            ctx.ellipse(x + 4, y + 20, 4, 8, 0, 0, Math.PI * 2); // Left Arm
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(x + 28, y + 20, 4, 8, 0, 0, Math.PI * 2); // Right Arm
            ctx.fill();

            // Face (Wavy Mouth)
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x + 10, y + 22);
            ctx.quadraticCurveTo(x + 16, y + 26, x + 22, y + 22); // Smile
            ctx.stroke();
            
            // Eyes (Closed lines)
            ctx.beginPath();
            ctx.moveTo(x + 10, y + 16);
            ctx.lineTo(x + 14, y + 14); // Left Eye
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(x + 22, y + 16);
            ctx.lineTo(x + 18, y + 14); // Right Eye
            ctx.stroke();
            
            // Tail (Black - visible if back or side?)
            if (dir === 'up' || dir === 'left' || dir === 'right') {
                ctx.fillStyle = '#000';
                ctx.beginPath();
                ctx.ellipse(x + 20, y + 28, 6, 4, 0, 0, Math.PI * 2);
                ctx.fill();
                // Tail eyes
                ctx.fillStyle = '#fff';
                ctx.fillRect(x + 18, y + 27, 1, 1);
                ctx.fillRect(x + 22, y + 27, 1, 1);
            }
        }
        
        function drawBoat(x, y, dir) {
            // Hull
            ctx.fillStyle = colors.boatBody;
            ctx.beginPath();
            ctx.ellipse(x + 16, y + 24, 14, 6, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Interior
            ctx.fillStyle = colors.boatFloor;
            ctx.beginPath();
            ctx.ellipse(x + 16, y + 24, 10, 4, 0, 0, Math.PI * 2);
            ctx.fill();

            // Seat
            ctx.fillStyle = colors.boatSeat;
            ctx.fillRect(x + 10, y + 22, 12, 4);
        }

        // Disegna player
        function drawPlayer() {
            const screenX = player.pixelX; // Absolute world coords for sorting
            const screenY = player.pixelY;
            
            // Draw Boat if Surfing
            if (player.isSurfing) {
                drawBoat(screenX, screenY + 4, player.direction);
            }

            // Ombra
            if (!player.isSurfing) {
                ctx.fillStyle = colors.shadow;
                ctx.beginPath();
                ctx.ellipse(screenX + 16, screenY + 28, 8, 3, 0, 0, Math.PI * 2);
                ctx.fill();
            }

            // Animazione camminata
            const bounce = player.moving ? Math.abs(Math.sin(Date.now() / 100)) * 3 : 0;
            const drawY = screenY - bounce;

            // Corpo
            ctx.fillStyle = colors.playerBody;
            ctx.beginPath();
            ctx.roundRect(screenX + 8, drawY + 14, 16, 14, 4);
            ctx.fill();

            // Testa
            ctx.fillStyle = colors.playerSkin;
            ctx.beginPath();
            ctx.roundRect(screenX + 6, drawY + 2, 20, 18, 6);
            ctx.fill();

            // Cappello
            ctx.fillStyle = colors.playerHat;
            ctx.beginPath();
            ctx.moveTo(screenX + 6, drawY + 8);
            ctx.lineTo(screenX + 26, drawY + 8);
            ctx.arc(screenX + 16, drawY + 8, 10, Math.PI, 0);
            ctx.fill();
            ctx.fillRect(screenX + 6, drawY + 6, 20, 4);

            // Occhi
            ctx.fillStyle = '#333';
            if (player.direction === 'left') {
                ctx.fillRect(screenX + 8, drawY + 10, 2, 4);
            } else if (player.direction === 'right') {
                ctx.fillRect(screenX + 22, drawY + 10, 2, 4);
            } else {
                ctx.fillRect(screenX + 10, drawY + 10, 2, 4);
                ctx.fillRect(screenX + 20, drawY + 10, 2, 4);
            }
        }
        
        // Sprite Cache System
        const spriteCache = {};

        function getCachedSprite(key, drawFn, width = TILE_SIZE, height = TILE_SIZE) {
            if (spriteCache[key]) return spriteCache[key];

            const offscreen = document.createElement('canvas');
            offscreen.width = width;
            offscreen.height = height;
            const oCtx = offscreen.getContext('2d');
            
            // Mock context to redirect draw calls to offscreen
            // We need to pass 0,0 as coordinates to the draw function
            drawFn(oCtx, 0, 0);
            
            spriteCache[key] = offscreen;
            return offscreen;
        }

        function clearSpriteCache() {
            for (const key in spriteCache) delete spriteCache[key];
        }

        // Aggiorna camera (Smooth)
        function updateCamera() {
            const mapWidth = currentMap[0].length;
            const mapHeight = currentMap.length;

            // Camera segue il pixel position del player
            const targetCamX = (player.pixelX / TILE_SIZE) - (VISIBLE_TILES / 2);
            const targetCamY = (player.pixelY / TILE_SIZE) - (VISIBLE_TILES / 2);
            
            // Clamp ai bordi della mappa
            // Se la mappa è più piccola della view, centra
            if (mapWidth <= VISIBLE_TILES) {
                camera.x = -(VISIBLE_TILES - mapWidth) / 2;
            } else {
                camera.x = Math.max(0, Math.min(targetCamX, mapWidth - VISIBLE_TILES));
            }

            if (mapHeight <= VISIBLE_TILES) {
                camera.y = -(VISIBLE_TILES - mapHeight) / 2;
            } else {
                camera.y = Math.max(0, Math.min(targetCamY, mapHeight - VISIBLE_TILES));
            }
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

        // Interazione
        function interact() {
            if (quizState.active) {
                checkQuizAnswer();
                return;
            }

            if (isDialogueOpen) {
                closeDialogue();
                return;
            }

            let targetX = player.x;
            let targetY = player.y;

            if (player.direction === 'up') targetY--;
            if (player.direction === 'down') targetY++;
            if (player.direction === 'left') targetX--;
            if (player.direction === 'right') targetX++;

            // Check bounds
            if (targetX < 0 || targetX >= currentMap[0].length || targetY < 0 || targetY >= currentMap.length) return;

            // Check for Counter (15) - Talk over it
            if (currentMap[targetY][targetX] === 15) {
                if (player.direction === 'up') targetY--;
                if (player.direction === 'down') targetY++;
                if (player.direction === 'left') targetX--;
                if (player.direction === 'right') targetX++;
            }

            // Check for Active Tiles (Pokemon Hiding)
            if (currentData.activeTiles) {
                const activeIndex = currentData.activeTiles.findIndex(t => t.x === targetX && t.y === targetY);
                if (activeIndex !== -1) {
                    const activeTile = currentData.activeTiles[activeIndex];
                    currentData.activeTiles.splice(activeIndex, 1); // Remove effect
                    
                    // Spawn Pokemon
                    let species = 'bulbasaur';
                    if (activeTile.type === 1) species = 'bulbasaur';
                    else if (activeTile.type === 4) species = 'lapras';
                    else if (activeTile.type === 2) species = 'caterpie';
                    else if (activeTile.type === 11) {
                        if (currentData.biome === 'mountain') species = Math.random() > 0.5 ? 'onix' : 'geodude';
                        else species = 'geodude';
                    }
                    else if (activeTile.type === 0) {
                        if (currentData.biome === 'desert') species = 'sandshrew';
                        else if (currentData.biome === 'ice') species = 'spheal';
                    }
                    else if (activeTile.type === 24) species = 'wobbuffet';
                    
                    const name = species.charAt(0).toUpperCase() + species.slice(1);
                    
                    currentNPCs.push({
                        x: targetX,
                        y: targetY,
                        pixelX: targetX * TILE_SIZE,
                        pixelY: targetY * TILE_SIZE,
                        direction: 'down',
                        moving: false,
                        moveTimer: Math.random() * 100,
                        species: species,
                        text: `${name}: Verso!`,
                        color: '#fff' // Unused for pokemon
                    });
                    
                    showDialogue(`Un ${name} selvatico è apparso!`);
                    return;
                }
            }

            // Cerca NPC
            const npc = currentNPCs.find(n => n.x === targetX && n.y === targetY);
            if (npc) {
                if (npc.role === 'merchant') {
                    openShop();
                } else if (npc.quiz) {
                    startQuiz(npc.quiz);
                } else {
                    showDialogue(npc.text);
                }
            }
        }

        function openShop() {
            isDialogueOpen = true;
            quizState.active = true; // Reuse quiz state for input handling
            
            const shopOptions = [
                { label: "Vendi Legno (10$)", action: () => sellItem('wood', 10) },
                { label: "Vendi Sasso (15$)", action: () => sellItem('stone', 15) },
                { label: "Vendi Erba (5$)", action: () => sellItem('grass', 5) },
                { label: "Esci", action: () => { closeDialogue(); quizState.active = false; } }
            ];

            quizState.options = shopOptions.map(o => o.label);
            quizState.selected = 0;
            quizState.callback = (index) => {
                // Execute action
                if (index >= 0 && index < shopOptions.length) {
                    shopOptions[index].action();
                }
            };
            
            // Override render to keep shop open unless exit
            const originalCallback = quizState.callback;
            quizState.callback = (index) => {
                if (index === shopOptions.length - 1) { // Exit
                    closeDialogue();
                    quizState.active = false;
                } else {
                    originalCallback(index);
                    // Refresh shop UI to show updated inventory/money if needed, or just keep open
                    // For simplicity, we just keep it open.
                }
            };

            dialogueText.textContent = "Benvenuto al Bar! Cosa vuoi fare?";
            renderQuizOptions();
            dialogueOptions.style.display = 'block';
            dialogueBox.style.display = 'block';
        }

        function sellItem(item, price) {
            if (player.inventory[item] > 0) {
                player.inventory[item]--;
                player.inventory.money += price;
                updateInventoryUI();
                dialogueText.textContent = `Venduto 1 ${item} per ${price}$!`;
            } else {
                dialogueText.textContent = `Non hai abbastanza ${item}!`;
            }
        }

        function showDialogue(text) {
            isDialogueOpen = true;
            dialogueText.textContent = text;
            dialogueOptions.style.display = 'none';
            dialogueBox.style.display = 'block';
        }

        function closeDialogue() {
            isDialogueOpen = false;
            dialogueBox.style.display = 'none';
        }
        
        // Quiz Logic
        function startQuiz(quiz) {
            isDialogueOpen = true;
            quizState.active = true;
            quizState.options = quiz.options;
            quizState.selected = 0;
            quizState.quizRef = quiz;
            quizState.callback = (correct) => {
                quizState.active = false;
                showDialogue(correct ? quiz.win : quiz.lose);
            };
            
            dialogueText.textContent = quiz.question;
            renderQuizOptions();
            dialogueOptions.style.display = 'block';
            dialogueBox.style.display = 'block';
        }

        function renderQuizOptions() {
            dialogueOptions.innerHTML = '';
            quizState.options.forEach((opt, idx) => {
                const div = document.createElement('div');
                div.className = `dialogue-option ${idx === quizState.selected ? 'selected' : ''}`;
                div.textContent = opt;
                div.onclick = () => {
                    quizState.selected = idx;
                    renderQuizOptions();
                };
                dialogueOptions.appendChild(div);
            });
        }

        function checkQuizAnswer() {
            if (quizState.callback) {
                // If it's a quiz with a reference object
                if (quizState.quizRef) {
                    const isCorrect = quizState.selected === quizState.quizRef.correct;
                    quizState.callback(isCorrect);
                } else {
                    // Generic callback (Shop)
                    quizState.callback(quizState.selected);
                }
            }
        }
        
        // Save System
        function saveGame() {
            const saveData = {
                player: player,
                world: world,
                worldX: worldX,
                worldY: worldY,
                gameTime: gameTime,
                isIndoors: isIndoors,
                savedOutdoorPos: savedOutdoorPos,
                indoorData: isIndoors ? currentData : null
            };
            
            try {
                localStorage.setItem('pokemonSave', JSON.stringify(saveData));
                showDialogue("Gioco salvato con successo!");
                setTimeout(() => { if(isDialogueOpen) closeDialogue(); }, 2000);
            } catch (e) {
                console.error(e);
                showDialogue("Errore durante il salvataggio!");
                setTimeout(() => { if(isDialogueOpen) closeDialogue(); }, 2000);
            }
        }

        function loadGame() {
            const saveString = localStorage.getItem('pokemonSave');
            if (saveString) {
                try {
                    const saveData = JSON.parse(saveString);
                    
                    // Restore state
                    Object.assign(player, saveData.player);
                    Object.assign(world, saveData.world);
                    worldX = saveData.worldX;
                    worldY = saveData.worldY;
                    Object.assign(gameTime, saveData.gameTime);
                    isIndoors = saveData.isIndoors;
                    savedOutdoorPos = saveData.savedOutdoorPos;
                    
                    // Restore currentData
                    if (isIndoors && saveData.indoorData) {
                        currentData = saveData.indoorData;
                    } else {
                        currentData = getCurrentData();
                    }
                    
                    currentMap = currentData.tiles;
                    currentNPCs = currentData.npcs;
                    
                    // Reset visual position
                    player.pixelX = player.x * TILE_SIZE;
                    player.pixelY = player.y * TILE_SIZE;
                    player.moving = false;
                    
                    updateInventoryUI();
                    updateCamera();
                    
                    console.log("Game loaded!");
                    return true;
                } catch (e) {
                    console.error("Failed to load save", e);
                    return false;
                }
            }
            return false;
        }



        // Game Loop Logic
        function update() {
            updateTime(); // Always update time

            if (isTransitioning) return;

            // Safety Check: If on Exit Mat (10) and not transitioning, exit
            if (isIndoors && currentMap[player.y][player.x] === 10) {
                exitHouse();
                return;
            }

            // Update Fireflies (Night only)
            if (currentData.fireflies) {
                const isNight = gameTime.hour >= 20 || gameTime.hour < 6;
                
                if (isNight) {
                    // Spawn
                    if (Math.random() < 0.05) { // 5% chance per frame
                        const mapH = currentMap.length;
                        const mapW = currentMap[0].length;
                        const rx = Math.floor(Math.random() * mapW);
                        const ry = Math.floor(Math.random() * mapH);
                        const tile = currentMap[ry][rx];
                        
                        // Spawn near grass (1) or trees (2) or flowers (3)
                        if (tile === 1 || tile === 2 || tile === 3) {
                            currentData.fireflies.push({
                                x: rx * TILE_SIZE + Math.random() * TILE_SIZE,
                                y: ry * TILE_SIZE + Math.random() * TILE_SIZE,
                                vx: (Math.random() - 0.5) * 0.5,
                                vy: (Math.random() - 0.5) * 0.5,
                                life: 100 + Math.random() * 100,
                                maxLife: 200,
                                opacity: 1
                            });
                        }
                    }
                }

                // Update
                for (let i = currentData.fireflies.length - 1; i >= 0; i--) {
                    const f = currentData.fireflies[i];
                    f.x += f.vx;
                    f.y += f.vy;
                    f.life--;
                    
                    // Fade out
                    if (f.life < 20) f.opacity = f.life / 20;
                    else if (f.life > f.maxLife - 20) f.opacity = (f.maxLife - f.life) / 20;
                    else f.opacity = 1;

                    // Random drift change
                    if (Math.random() < 0.1) {
                        f.vx += (Math.random() - 0.5) * 0.1;
                        f.vy += (Math.random() - 0.5) * 0.1;
                    }

                    if (f.life <= 0) {
                        currentData.fireflies.splice(i, 1);
                    }
                }
            }

            // Update Active Tiles (Shaking)
            if (currentData.activeTiles && !isIndoors) {
                // Randomly add new active tile
                if (Math.random() < 0.05) { // 5% chance per frame
                    const mapH = currentMap.length;
                    const mapW = currentMap[0].length;
                    const rx = Math.floor(Math.random() * mapW);
                    const ry = Math.floor(Math.random() * mapH);
                    const tile = currentMap[ry][rx];
                    
                    let canBeActive = false;
                    
                    // Grass (1) or Water (4)
                    if (tile === 1 || tile === 4) canBeActive = true;
                    
                    // Tree (2)
                    if (tile === 2) canBeActive = true;

                    // Rock (11)
                    if (tile === 11) canBeActive = true;
                    
                    // Puddle (24)
                    if (tile === 24) canBeActive = true;
                    
                    // Sand/Snow (0)
                    if (tile === 0 && (currentData.biome === 'desert' || currentData.biome === 'ice')) canBeActive = true;

                    if (canBeActive) {
                        // Check if occupied
                        const occupied = currentNPCs.some(n => n.x === rx && n.y === ry) || (player.x === rx && player.y === ry);
                        const alreadyActive = currentData.activeTiles.some(t => t.x === rx && t.y === ry);
                        
                        if (!occupied && !alreadyActive) {
                            currentData.activeTiles.push({
                                x: rx,
                                y: ry,
                                type: tile,
                                timer: 300 // 5 seconds at 60fps
                            });
                        }
                    }
                }

                // Update timers
                for (let i = currentData.activeTiles.length - 1; i >= 0; i--) {
                    currentData.activeTiles[i].timer--;
                    if (currentData.activeTiles[i].timer <= 0) {
                        currentData.activeTiles.splice(i, 1);
                    }
                }
            }

            // Update Footprints
            if (currentData.footprints) {
                for (let i = currentData.footprints.length - 1; i >= 0; i--) {
                    currentData.footprints[i].timer--;
                    if (currentData.footprints[i].timer <= 0) {
                        currentData.footprints.splice(i, 1);
                    }
                }
            }

            // Update NPCs
            currentNPCs.forEach(npc => {
                if (npc.moving) {
                    const targetPixelX = npc.x * TILE_SIZE;
                    const targetPixelY = npc.y * TILE_SIZE;
                    const speed = WALK_SPEED; // NPCs always walk

                    if (npc.pixelX < targetPixelX) npc.pixelX = Math.min(npc.pixelX + speed, targetPixelX);
                    if (npc.pixelX > targetPixelX) npc.pixelX = Math.max(npc.pixelX - speed, targetPixelX);
                    if (npc.pixelY < targetPixelY) npc.pixelY = Math.min(npc.pixelY + speed, targetPixelY);
                    if (npc.pixelY > targetPixelY) npc.pixelY = Math.max(npc.pixelY - speed, targetPixelY);

                    if (npc.pixelX === targetPixelX && npc.pixelY === targetPixelY) {
                        npc.moving = false;
                        npc.moveTimer = Math.random() * 200 + 50; // Wait a bit
                        
                        // Add Footprint
                        addFootprint(npc.x, npc.y);
                    }
                } else {
                    if (npc.moveTimer > 0) {
                        npc.moveTimer--;
                    } else {
                        // Decide action
                        const action = Math.random();
                        if (action < 0.02) { // 2% chance to move per frame when timer is 0
                            const dirs = ['up', 'down', 'left', 'right'];
                            const dir = dirs[Math.floor(Math.random() * dirs.length)];
                            npc.direction = dir;

                            let tx = npc.x;
                            let ty = npc.y;
                            if (dir === 'up') ty--;
                            if (dir === 'down') ty++;
                            if (dir === 'left') tx--;
                            if (dir === 'right') tx++;

                            // Check bounds and collision
                            if (tx >= 0 && tx < currentMap[0].length && ty >= 0 && ty < currentMap.length) {
                                const tile = currentMap[ty][tx];
                                // Check if tile is walkable (0=ground, 1=grass, 9=floor, 10=mat, 13=tilled, 14=road)
                                // Also check if player is there
                                const playerHere = (player.x === tx && player.y === ty);
                                const npcHere = currentNPCs.some(n => n !== npc && n.x === tx && n.y === ty);
                                
                                const walkable = (tile === 0 || tile === 1 || tile === 9 || tile === 10 || tile === 13 || tile === 14);

                                if (walkable && !playerHere && !npcHere) {
                                    npc.x = tx;
                                    npc.y = ty;
                                    npc.moving = true;
                                } else {
                                    npc.moveTimer = Math.random() * 100 + 20; // Wait if blocked
                                }
                            }
                        } else if (action < 0.05) { // Just look around
                             const dirs = ['up', 'down', 'left', 'right'];
                             npc.direction = dirs[Math.floor(Math.random() * dirs.length)];
                             npc.moveTimer = Math.random() * 50 + 20;
                        }
                    }
                }
            });

            // Se il player si sta muovendo (animazione tra tile)
            if (player.moving) {
                const targetPixelX = player.x * TILE_SIZE;
                const targetPixelY = player.y * TILE_SIZE;
                
                const speed = keys.b ? RUN_SPEED : WALK_SPEED;

                if (player.pixelX < targetPixelX) player.pixelX = Math.min(player.pixelX + speed, targetPixelX);
                if (player.pixelX > targetPixelX) player.pixelX = Math.max(player.pixelX - speed, targetPixelX);
                if (player.pixelY < targetPixelY) player.pixelY = Math.min(player.pixelY + speed, targetPixelY);
                if (player.pixelY > targetPixelY) player.pixelY = Math.max(player.pixelY - speed, targetPixelY);

                // Arrivato a destinazione?
                if (player.pixelX === targetPixelX && player.pixelY === targetPixelY) {
                    player.moving = false;
                    addFootprint(player.x, player.y);

                    // SLIDING LOGIC (Ice)
                    const currentTile = currentMap[player.y][player.x];
                    if (currentTile === 22) { // Ice
                        let dx = 0; let dy = 0;
                        if (player.direction === 'up') dy = -1;
                        if (player.direction === 'down') dy = 1;
                        if (player.direction === 'left') dx = -1;
                        if (player.direction === 'right') dx = 1;
                        
                        // Attempt to continue moving
                        attemptMove(dx, dy);
                    }
                }
                updateCamera();
                return; // Non accettare nuovi input finché non finisce il movimento
            }

            // Se il dialogo è aperto, blocca movimento
            if (isDialogueOpen) {
                if (quizState.active) {
                    if (keys.up) {
                        keys.up = false; // Consume key
                        quizState.selected = (quizState.selected - 1 + quizState.options.length) % quizState.options.length;
                        renderQuizOptions();
                    }
                    if (keys.down) {
                        keys.down = false; // Consume key
                        quizState.selected = (quizState.selected + 1) % quizState.options.length;
                        renderQuizOptions();
                    }
                }
                return;
            }

            // Input Handling (Nuovo movimento)
            let dx = 0;
            let dy = 0;
            let newDir = player.direction;

            if (keys.up) { dy = -1; newDir = 'up'; }
            else if (keys.down) { dy = 1; newDir = 'down'; }
            else if (keys.left) { dx = -1; newDir = 'left'; }
            else if (keys.right) { dx = 1; newDir = 'right'; }

            if (dx !== 0 || dy !== 0) {
                if (player.direction !== newDir) {
                    player.direction = newDir;
                    player.turnTimer = 5; // 5 frames delay to allow turning without moving
                } else {
                    if (player.turnTimer > 0) {
                        player.turnTimer--;
                    } else {
                        attemptMove(dx, dy);
                    }
                }
            } else {
                player.turnTimer = 0;
            }
        }

        function attemptMove(dx, dy) {
                if (!currentMap || !currentMap[0]) return false;

                const newX = player.x + dx;
                const newY = player.y + dy;
                const mapW = currentMap[0].length;
                const mapH = currentMap.length;

                // Check confini (Cambio Mappa)
                if (newX < 0) { 
                    if (!isIndoors) { switchMap(-1, 0); return true; }
                    else return false; // Blocked
                }
                if (newX >= mapW) { 
                    if (!isIndoors) { switchMap(1, 0); return true; }
                    else return false; // Blocked
                }
                if (newY < 0) { 
                    if (!isIndoors) { switchMap(0, -1); return true; }
                    else return false; // Blocked
                }
                if (newY >= mapH) { 
                    if (!isIndoors) { switchMap(0, 1); return true; }
                    else return false; // Blocked
                }

                // Check collisioni
                const tile = currentMap[newY][newX];
                
                // Boat Logic
                if (currentData.boat && !player.isSurfing) {
                    if (currentData.boat.x === newX && currentData.boat.y === newY) {
                        // Enter Boat
                        player.isSurfing = true;
                        player.x = newX;
                        player.y = newY;
                        player.moving = true;
                        return true;
                    }
                }

                if (player.isSurfing) {
                    // Can move on Water (4)
                    if (tile === 4) {
                        player.x = newX;
                        player.y = newY;
                        player.moving = true;
                        return true;
                    }
                    
                    // Exit Boat (if moving to land)
                    // Land tiles: 0=Ground, 1=Grass, 5=Bridge, 9=Floor, 10=Mat, 13=Tilled, 14=Road, 25=CityRoad, 26=Sidewalk, 22=Ice, 19=BarFloor
                    const isLand = (t) => t === 0 || t === 1 || t === 5 || t === 9 || t === 10 || t === 13 || t === 14 || t === 25 || t === 26 || t === 22 || t === 19;
                    
                    if (isLand(tile)) {
                        // Leave boat at current pos (last water tile)
                        currentData.boat.x = player.x;
                        currentData.boat.y = player.y;
                        currentData.boat.direction = player.direction;
                        player.isSurfing = false;
                        // Fall through to normal movement to execute the move to land
                    } else {
                        return false; // Blocked (e.g. rock in water)
                    }
                }

                if (tile === 8) { // Door
                    enterHouse('house');
                    return true;
                }
                if (tile === 18) { // Bar Door
                    enterHouse('bar');
                    return true;
                }
                if (tile === 10) { // Mat
                    exitHouse();
                    return true;
                }
                if (tile === 30) { // Cave Entrance
                    enterDungeon();
                    return true;
                }
                if (tile === 33) { // Ladder Up (Exit Dungeon Back)
                    exitDungeon(false);
                    return true;
                }
                if (tile === 34) { // Tunnel Down (Exit Dungeon Random)
                    exitDungeon(true);
                    return true;
                }

                // Check NPC collision
                const npcHere = currentNPCs.some(n => n.x === newX && n.y === newY);

                // 2=Albero, 4=Acqua, 7=Muro, 11=Roccia, 15=Counter, 16=Table, 17=Chair, 20=Cactus, 21=Pino, 23=Palma, 32=CaveWall
                // Also check for other solid objects if added
                const isSolid = (tile === 2 || tile === 4 || tile === 7 || tile === 11 || tile === 15 || tile === 16 || tile === 17 || tile === 20 || tile === 21 || tile === 23 || tile === 32);

                if (!isSolid && !npcHere) {
                    player.x = newX;
                    player.y = newY;
                    player.moving = true;
                    return true;
                }
                return false;
        }
        
        function addFootprint(x, y) {
            if (!currentData.footprints) return;
            
            // Check if tile is sand or snow
            const tile = currentMap[y][x];
            if (tile === 0 && (currentData.biome === 'desert' || currentData.biome === 'ice')) {
                currentData.footprints.push({
                    x: x,
                    y: y,
                    timer: 300 // 5 seconds
                });
            }
        }

        // Render Loop (Y-Sorted)
        function render() {
            // Intro Zoom Logic
            if (zoomLevel < 1) {
                zoomLevel += 0.015;
                if (zoomLevel > 1) zoomLevel = 1;
            }

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const mapWidth = currentMap[0].length;
            const mapHeight = currentMap.length;

            ctx.save();

            // Apply Zoom centered on screen
            if (zoomLevel < 1) {
                ctx.translate(canvas.width / 2, canvas.height / 2);
                ctx.scale(zoomLevel, zoomLevel);
                ctx.translate(-canvas.width / 2, -canvas.height / 2);
            }

            ctx.translate(-(camera.x * TILE_SIZE), -(camera.y * TILE_SIZE));

            // Culling logic adjustment for zoom
            let startX = Math.floor(camera.x);
            let startY = Math.floor(camera.y);
            let endX = startX + VISIBLE_TILES + 1;
            let endY = startY + VISIBLE_TILES + 1;

            if (zoomLevel < 1) {
                // Draw everything during zoom out to avoid popping
                startX = 0;
                startY = 0;
                endX = mapWidth;
                endY = mapHeight;
            }

            // 1. Draw Ground Layer (All visible)
            for (let y = startY; y <= endY; y++) {
                for (let x = startX; x <= endX; x++) {
                    if (x >= 0 && x < mapWidth && y >= 0 && y < mapHeight) {
                        drawGround(x, y, currentMap[y][x]);
                    }
                }
            }

            // Draw Footprints
            if (currentData.footprints) {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
                currentData.footprints.forEach(fp => {
                    if (fp.x >= startX && fp.x <= endX && fp.y >= startY && fp.y <= endY) {
                        const sx = fp.x * TILE_SIZE;
                        const sy = fp.y * TILE_SIZE;
                        ctx.beginPath();
                        ctx.ellipse(sx + 16, sy + 16, 6, 4, 0, 0, Math.PI * 2);
                        ctx.fill();
                    }
                });
            }

            // 2. Collect Sprites for Y-Sorting
            const sprites = [];

            // Map Objects
            for (let y = startY; y <= endY; y++) {
                for (let x = startX; x <= endX; x++) {
                    if (x >= 0 && x < mapWidth && y >= 0 && y < mapHeight) {
                        const t = currentMap[y][x];
                        // If it's an object that needs sorting
                        if (t === 1 || t === 2 || t === 3 || t === 6 || t === 7 || t === 8 || t === 11 || t === 12 || t === 15 || t === 16 || t === 17 || t === 18 || t === 20 || t === 21 || t === 23 || t === 24) {
                            sprites.push({
                                type: 'tile',
                                tileType: t,
                                x: x,
                                y: y,
                                sortY: (y + 1) * TILE_SIZE // Bottom of tile
                            });
                        }
                    }
                }
            }

            // NPCs
            currentNPCs.forEach(npc => {
                // Only visible
                if (npc.x >= startX && npc.x <= endX &&
                    npc.y >= startY && npc.y <= endY) {
                    sprites.push({
                        type: 'npc',
                        data: npc,
                        sortY: (npc.y + 1) * TILE_SIZE
                    });
                }
            });

            // Boat (if not surfing)
            if (currentData.boat && !player.isSurfing) {
                // Only visible
                if (currentData.boat.x >= startX && currentData.boat.x <= endX &&
                    currentData.boat.y >= startY && currentData.boat.y <= endY) {
                    sprites.push({
                        type: 'boat',
                        data: currentData.boat,
                        sortY: (currentData.boat.y + 1) * TILE_SIZE
                    });
                }
            }

            // Player
            sprites.push({
                type: 'player',
                sortY: player.pixelY + TILE_SIZE
            });

            // Sort
            sprites.sort((a, b) => a.sortY - b.sortY);

            // Draw Sorted
            sprites.forEach(s => {
                if (s.type === 'tile') {
                    drawObject(s.x, s.y, s.tileType);
                } else if (s.type === 'npc' || s.type === 'player' || s.type === 'boat') {
                    // Reflection Logic
                    const tx = s.type === 'npc' ? s.data.x : (s.type === 'boat' ? s.data.x : player.x);
                    const ty = s.type === 'npc' ? s.data.y : (s.type === 'boat' ? s.data.y : player.y);
                    
                    // Check if on reflective surface (Water=4, Ice=22)
                    // Also check if valid coords
                    if (ty >= 0 && ty < mapHeight && tx >= 0 && tx < mapWidth) {
                        const tile = currentMap[ty][tx];
                        if (tile === 4 || tile === 22) {
                            ctx.save();
                            ctx.globalAlpha = 0.3;
                            // Translate to feet position
                            const feetY = s.sortY;
                            ctx.translate(0, feetY);
                            ctx.scale(1, -0.6); // Flip and squash
                            ctx.translate(0, -feetY);
                            
                            if (s.type === 'npc') drawNPC(s.data);
                            else if (s.type === 'boat') drawBoat(s.data.x * TILE_SIZE, s.data.y * TILE_SIZE, s.data.direction);
                            else drawPlayer();
                            
                            ctx.restore();
                        }
                    }

                    if (s.type === 'npc') {
                        drawNPC(s.data);
                    } else if (s.type === 'boat') {
                        drawBoat(s.data.x * TILE_SIZE, s.data.y * TILE_SIZE, s.data.direction);
                    } else if (s.type === 'player') {
                        drawPlayer();
                    }
                }
            });

            // Draw Fireflies (World Space)
            if (currentData.fireflies) {
                currentData.fireflies.forEach(f => {
                    // Only draw if visible
                    if (f.x >= startX * TILE_SIZE && f.x <= (endX + 1) * TILE_SIZE &&
                        f.y >= startY * TILE_SIZE && f.y <= (endY + 1) * TILE_SIZE) {
                        
                        ctx.fillStyle = `rgba(200, 255, 100, ${f.opacity})`;
                        ctx.beginPath();
                        ctx.arc(f.x, f.y, 2, 0, Math.PI * 2);
                        ctx.fill();
                    }
                });
            }

            // Rain Effect (World Space)
            if (currentData.biome === 'rain') {
                ctx.strokeStyle = 'rgba(174, 194, 224, 0.5)';
                ctx.lineWidth = 1;
                const time = Date.now() / 20;
                const rainCount = 100;
                
                // Simple rain simulation based on screen coords + time
                // We want it to look like it's falling across the screen
                // But we are in world space here? No, we are in world space.
                // Better to draw rain in screen space (after restore) or relative to camera to cover view.
                // Let's draw it in world space but relative to camera to cover view.
                
                const camX = camera.x * TILE_SIZE;
                const camY = camera.y * TILE_SIZE;
                
                for(let i=0; i<rainCount; i++) {
                    const rx = (Math.sin(i) * 10000 + time * 5) % (canvas.width / zoomLevel);
                    const ry = (Math.cos(i) * 10000 + time * 10) % (canvas.height / zoomLevel);
                    
                    // Adjust to world space
                    const wx = camX + Math.abs(rx);
                    const wy = camY + Math.abs(ry);
                    
                    ctx.beginPath();
                    ctx.moveTo(wx, wy);
                    ctx.lineTo(wx - 2, wy + 10);
                    ctx.stroke();
                }
            }

            ctx.restore();

            // Night Overlay (Screen Space)
            let darkness = 0;
            const h = gameTime.hour + gameTime.minute / 60;
            
            if (h >= 20 || h < 5) {
                darkness = 0.5; // Night
            } else if (h >= 18 && h < 20) {
                darkness = 0.5 * ((h - 18) / 2); // Sunset
            } else if (h >= 5 && h < 6) {
                darkness = 0.5 * (1 - (h - 5)); // Sunrise
            }
            
            if (darkness > 0) {
                ctx.fillStyle = `rgba(0, 0, 20, ${darkness})`;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
            
            // Debug Info
            const debugDiv = document.getElementById('debug-info');
            if (debugDiv) {
                debugDiv.innerHTML = `
                    v: ec0585e<br>
                    Pos: ${player.x}, ${player.y}<br>
                    Dir: ${player.direction}<br>
                    Mov: ${player.moving}<br>
                    Ind: ${isIndoors}<br>
                    Trans: ${isTransitioning}<br>
                    Dia: ${isDialogueOpen}<br>
                    Tile: ${currentMap && currentMap[player.y] ? currentMap[player.y][player.x] : 'N/A'}
                `;
            }

            update(); // Game Logic
            requestAnimationFrame(render);
        }
        
        // Input Listeners
        const updateKey = (key, state) => {
            if (key === 'ArrowUp') keys.up = state;
            if (key === 'ArrowDown') keys.down = state;
            if (key === 'ArrowLeft') keys.left = state;
            if (key === 'ArrowRight') keys.right = state;
            if (key === 'b' || key === 'B') keys.b = state; // Run Hold
            if (key === 'a' || key === 'A') {
                if (state && !keys.a) interact(); // Trigger on press only
                keys.a = state;
            }
            if (key === 'x' || key === 'X') {
                if (state && !keys.x) switchTool();
                keys.x = state;
            }
            if (key === 'y' || key === 'Y') {
                if (state && !keys.y) useTool();
                keys.y = state;
            }
        };

        document.addEventListener('keydown', (e) => updateKey(e.key, true));
        document.addEventListener('keyup', (e) => updateKey(e.key, false));

        // Touch Controls (Action Buttons)
        const actionButtons = document.querySelectorAll('.btn-action');
        actionButtons.forEach(btn => {
            const action = btn.dataset.action;
            const handleAction = (state) => {
                if (action === 'b') keys.b = state; // Hold for B
                else if (state) { // Trigger others on press
                    if (action === 'a') interact();
                    if (action === 'x') switchTool();
                    if (action === 'y') useTool();
                }
            };
            
            btn.addEventListener('touchstart', (e) => { e.preventDefault(); handleAction(true); });
            btn.addEventListener('touchend', (e) => { e.preventDefault(); handleAction(false); });
            btn.addEventListener('mousedown', (e) => { handleAction(true); });
        });
        
        document.addEventListener('mouseup', () => { 
            // Reset B if mouse released anywhere
            if(keys.b) keys.b = false;
        });

        // Touch Controls (Sliding D-pad)
        const dpad = document.getElementById('dpad');
        
        const handleDpad = (e) => {
            e.preventDefault(); // Prevent scrolling
            const touch = e.touches ? e.touches[0] : e;
            
            // Get element under finger
            const el = document.elementFromPoint(touch.clientX, touch.clientY);
            
            // Reset all directions first
            keys.up = false;
            keys.down = false;
            keys.left = false;
            keys.right = false;
            
            if (el && el.dataset.dir) {
                keys[el.dataset.dir] = true;
                // Add active class visual feedback manually since :active might not work well with touchmove
                document.querySelectorAll('#dpad .btn').forEach(b => b.style.transform = 'scale(1)');
                el.style.transform = 'scale(0.95)';
            } else {
                document.querySelectorAll('#dpad .btn').forEach(b => b.style.transform = 'scale(1)');
            }
        };

        dpad.addEventListener('touchstart', handleDpad);
        dpad.addEventListener('touchmove', handleDpad);
        dpad.addEventListener('touchend', (e) => {
            e.preventDefault();
            keys.up = keys.down = keys.left = keys.right = false;
            document.querySelectorAll('#dpad .btn').forEach(b => b.style.transform = 'scale(1)');
        });
        
        // Mouse support for testing on desktop
        let isMouseDown = false;
        dpad.addEventListener('mousedown', (e) => { isMouseDown = true; handleDpad(e); });
        document.addEventListener('mousemove', (e) => { if(isMouseDown) handleDpad(e); });
        document.addEventListener('mouseup', () => { 
            if(isMouseDown) {
                isMouseDown = false; 
                keys.up = keys.down = keys.left = keys.right = false; 
                document.querySelectorAll('#dpad .btn').forEach(b => b.style.transform = 'scale(1)');
            }
        });

        // Inizializza
        if (!loadGame()) {
            updateCamera();
        }
        render();
