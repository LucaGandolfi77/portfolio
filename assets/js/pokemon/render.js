// Disegna tile (Ground Layer)
function drawGround(x, y, type) {
    const screenX = x * TILE_SIZE;
    const screenY = y * TILE_SIZE;
    
    let spriteKey = null;

    // Determine sprite key based on type and biome
    if (type === 4) spriteKey = 'water';
    else if (type === 5) spriteKey = 'bridge';
    else if (type === 9) spriteKey = 'floor';
    else if (type === 10) spriteKey = 'mat';
    else if (type === 13) spriteKey = 'tilled';
    else if (type === 14) spriteKey = 'road';
    else if (type === 19) spriteKey = 'bar_floor';
    else if (type === 22) spriteKey = 'ice';
    else if (type === 25) spriteKey = 'city_road';
    else if (type === 26) spriteKey = 'city_sidewalk';
    else if (type === 30) spriteKey = 'cave_entrance';
    else if (type === 31) spriteKey = 'cave_floor';
    else if (type === 32) spriteKey = 'cave_wall';
    else if (type === 33) spriteKey = 'ladder';
    else if (type === 34) spriteKey = 'tunnel';
    else if (type === 0) {
        if (currentData.biome === 'desert') spriteKey = 'sand';
        else if (currentData.biome === 'ice') spriteKey = 'snow';
        else if (currentData.biome === 'mountain') spriteKey = 'rock_ground';
        else spriteKey = 'grass';
    }

    // Try to draw sprite
    if (spriteKey && drawSprite(ctx, spriteKey, screenX, screenY)) {
        return;
    }

    // Fallback: Default Ground
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

    let spriteKey = null;
    if (type === 1) spriteKey = 'tall_grass';
    else if (type === 2) spriteKey = 'tree';
    else if (type === 20) spriteKey = 'cactus';
    else if (type === 21) spriteKey = 'pine';
    else if (type === 23) spriteKey = 'palm';
    else if (type === 3) spriteKey = 'flower';
    else if (type === 7) {
        const isRoof = (y < currentMap.length-1 && (currentMap[y+1][x] === 7 || currentMap[y+1][x] === 8 || currentMap[y+1][x] === 18));
        spriteKey = isRoof ? 'house_roof' : 'house_wall';
    }
    else if (type === 8 || type === 18) spriteKey = 'house_door';
    else if (type === 11) spriteKey = 'rock';
    else if (type === 12) spriteKey = 'stump';
    else if (type === 15) spriteKey = 'bar_counter';
    else if (type === 16) spriteKey = 'bar_table';
    else if (type === 17) spriteKey = 'bar_chair';
    else if (type === 24) spriteKey = 'puddle';

    // Try to draw sprite
    if (spriteKey && drawSprite(ctx, spriteKey, screenX + shakeX, screenY)) {
        return;
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

    // Try to draw sprite
    const action = npc.moving ? 'move' : 'idle'; // Or just use direction
    if (drawSprite(ctx, npc.species, screenX, drawY, npc.direction)) {
        return;
    }

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
    // Try to draw sprite
    if (drawSprite(ctx, 'boat', x, y, dir)) {
        return;
    }

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

    // Try to draw sprite
    if (drawSprite(ctx, 'player', screenX, drawY, player.direction)) {
        return;
    }

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

// Render Loop (Y-Sorted)
function render() {
    updateAnimation(); // Update sprite animations

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
