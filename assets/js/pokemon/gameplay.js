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

function togglePokedex() {
    const modal = document.getElementById('pokedex-modal');
    if (modal.style.display === 'flex') {
        modal.style.display = 'none';
    } else {
        modal.style.display = 'flex';
        renderPokedex();
    }
}

function renderPokedex() {
    const grid = document.getElementById('pokedex-grid');
    grid.innerHTML = '';
    // Placeholder for Pokedex logic
    const pokemonList = ['Bulbasaur', 'Charmander', 'Squirtle', 'Pikachu', 'Caterpie', 'Geodude', 'Onix', 'Sandshrew', 'Spheal', 'Lapras', 'Wobbuffet'];
    
    pokemonList.forEach(pkmn => {
        const div = document.createElement('div');
        div.className = 'pokedex-entry';
        div.textContent = pkmn;
        // Check if caught (needs player.pokedex or similar)
        // For now just list them
        grid.appendChild(div);
    });
}
