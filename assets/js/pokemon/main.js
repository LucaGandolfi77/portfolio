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
            // If running (B held), turn immediately (no delay)
            if (keys.b) {
                player.turnTimer = 0;
                attemptMove(dx, dy);
            } else {
                player.turnTimer = 5; // 5 frames delay to allow turning without moving
            }
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

if (dpad) {
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
}

// Inizializza
if (!loadGame()) {
    currentData = getCurrentData();
    currentMap = currentData.tiles;
    currentNPCs = currentData.npcs;
    updateCamera();
}
render();
