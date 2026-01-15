// Scopa Battle Logic

let scopaPlayerDeck = [];
let scopaEnemyDeck = [];
let scopaTable = [];
let scopaPlayerHand = [];
let scopaEnemyHand = [];
let scopaPlayerHp = 300;
let scopaEnemyHp = 300;
let scopaTurn = 'player'; // 'player' or 'enemy'
let scopaLastCapturer = null;
let cachedStartScreen = null;

function initScopaBattle() {
    // 1. Create Player Deck (12 cards)
    let pDeck = [];
    if (playerData.scopaDeck && playerData.scopaDeck.length > 0) {
        pDeck = playerData.scopaDeck.map(id => {
            const baseCard = allCards.find(c => c.id == id);
            const owned = playerData.collection[id];
            return { ...baseCard, level: owned ? owned.level : 1 };
        });
    } else {
        // Fallback: Use owned cards
        pDeck = Object.keys(playerData.collection).map(id => {
            const baseCard = allCards.find(c => c.id == id);
            const owned = playerData.collection[id];
            return { ...baseCard, level: owned.level };
        });
    }
    
    // Fill/Trim to 12
    while (pDeck.length < 12) {
        const randomCard = allCards[Math.floor(Math.random() * allCards.length)];
        pDeck.push({ ...randomCard, level: 1 });
    }
    if (pDeck.length > 12) pDeck = pDeck.slice(0, 12);

    // 2. Create Enemy Deck (12 random cards, level 1)
    let eDeck = [];
    for (let i = 0; i < 12; i++) {
        const randomCard = allCards[Math.floor(Math.random() * allCards.length)];
        eDeck.push({ ...randomCard, level: 1 });
    }

    // Helper to process deck cards (add scopa values)
    const processDeck = (deck) => {
        return deck.map((card, index) => ({
            ...card,
            scopaValue: card.scopaValue || (index % 10) + 1,
            scopaSuit: card.element || ['Fire', 'Water', 'Earth', 'Air'][Math.floor(Math.random() * 4)],
            uid: Math.random().toString(36).substr(2, 9)
        }));
    };

    scopaPlayerDeck = processDeck(pDeck);
    scopaEnemyDeck = processDeck(eDeck);

    // Shuffle both
    const shuffle = (arr) => {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
    };
    shuffle(scopaPlayerDeck);
    shuffle(scopaEnemyDeck);

    // Reset State
    scopaTable = [];
    scopaPlayerHand = [];
    scopaEnemyHand = [];
    scopaPlayerHp = 100;
    scopaEnemyHp = 100;
    scopaTurn = 'player';
    scopaLastCapturer = null;

    // Deal Initial Hands (3 each)
    dealScopaCards(true); 
    
    console.log("Init Scopa - Player Hand:", scopaPlayerHand);
    console.log("Init Scopa - Enemy Hand:", scopaEnemyHand);
    console.log("Init Scopa - Table:", scopaTable);

    // Deal 4 to table (2 from player deck, 2 from enemy deck)
    for (let i = 0; i < 2; i++) {
        if (scopaPlayerDeck.length > 0) scopaTable.push(scopaPlayerDeck.pop());
        if (scopaEnemyDeck.length > 0) scopaTable.push(scopaEnemyDeck.pop());
    }

    document.getElementById('scopaStartScreen').style.display = 'none';
    updateScopaUI();
    document.getElementById('scopaMessage').textContent = "Your Turn!";
}

function dealScopaCards(initial = false) {
    // Deal up to 3 cards to each player from their respective decks
    const cardsToDeal = 3;
    
    console.log("Dealing cards... Player Deck Size:", scopaPlayerDeck.length, "Enemy Deck Size:", scopaEnemyDeck.length);

    // Player
    while (scopaPlayerHand.length < cardsToDeal && scopaPlayerDeck.length > 0) {
        scopaPlayerHand.push(scopaPlayerDeck.pop());
    }

    // Enemy
    while (scopaEnemyHand.length < cardsToDeal && scopaEnemyDeck.length > 0) {
        scopaEnemyHand.push(scopaEnemyDeck.pop());
    }
}

function updateScopaUI() {
    console.log("Updating Scopa UI");
    // Update HP
    document.getElementById('playerHpBar').style.width = `${scopaPlayerHp}%`;
    document.getElementById('playerHpText').textContent = `${scopaPlayerHp}/100`;
    document.getElementById('enemyHpBar').style.width = `${scopaEnemyHp}%`;
    document.getElementById('enemyHpText').textContent = `${scopaEnemyHp}/100`;

    // Render Table
    const tableEl = document.getElementById('scopaTable');
    // Keep start screen if hidden
    let startScreen = document.getElementById('scopaStartScreen');
    
    if (startScreen) {
        cachedStartScreen = startScreen;
    } else if (cachedStartScreen) {
        startScreen = cachedStartScreen;
    }

    tableEl.innerHTML = '';
    if (startScreen && startScreen.style.display !== 'none') {
        tableEl.appendChild(startScreen);
        return;
    }

    scopaTable.forEach(card => {
        const el = createScopaCardEl(card);
        tableEl.appendChild(el);
    });

    // Render Player Hand
    const playerHandEl = document.getElementById('playerHand');
    if (!playerHandEl) console.error("Player Hand Element NOT FOUND!");
    else console.log("Player Hand Element found. Rendering", scopaPlayerHand.length, "cards.");
    
    playerHandEl.innerHTML = '';
    scopaPlayerHand.forEach((card, idx) => {
        const el = createScopaCardEl(card);
        el.onclick = () => playScopaCard('player', idx);
        playerHandEl.appendChild(el);
    });

    // Render Enemy Hand (Backs)
    const enemyHandEl = document.getElementById('enemyHand');
    enemyHandEl.innerHTML = '';
    scopaEnemyHand.forEach(() => {
        const el = document.createElement('div');
        el.className = 'scopa-card back';
        enemyHandEl.appendChild(el);
    });
}

function createScopaCardEl(card) {
    const el = document.createElement('div');
    el.className = `scopa-card ${card.rarity}`;
    el.innerHTML = `
        <div class="scopa-card-val">${card.scopaValue === 1 ? 'A' : card.scopaValue}</div>
        <div class="scopa-card-suit">${card.emoji}</div>
        <div class="scopa-card-str">${card.attack}</div>
    `;
    return el;
}

function playScopaCard(who, cardIdx) {
    if (who === 'player' && scopaTurn !== 'player') return;

    const hand = who === 'player' ? scopaPlayerHand : scopaEnemyHand;
    const card = hand[cardIdx];
    
    // Remove from hand
    hand.splice(cardIdx, 1);

    // Check Capture
    const capture = checkScopaCapture(card, scopaTable);
    let extraTurn = false;

    if (capture) {
        // Capture Logic
        scopaTable = scopaTable.filter(c => !capture.captured.includes(c));
        scopaLastCapturer = who;
        
        // Apply Effects / Damage
        let damage = 0;
        
        // Base Damage from Card Attack
        damage += Math.floor(card.attack / 5);

        // Level Bonus
        damage += (card.level || 1) * 2;

        // Special Powers
        const powerResult = handleSpecialPowers(card, who, damage);
        damage = powerResult.damage;
        extraTurn = powerResult.extraTurn;

        // Scopa (Sweep) Bonus
        if (scopaTable.length === 0) {
            if (capture.type === 'ace_sweep') {
                damage += 20; // Ace Sweep deals more damage
                showDamage(who === 'player' ? 'enemy' : 'player', 20, "ACE POWER!");
            } else {
                damage += 10;
                showDamage(who === 'player' ? 'enemy' : 'player', 10, "SCOPA!");
            }
        }

        applyDamage(who === 'player' ? 'enemy' : 'player', damage);
        
        document.getElementById('scopaMessage').textContent = `${who === 'player' ? 'You' : 'Enemy'} captured ${capture.captured.length} cards!`;
    } else {
        // No capture, place on table
        scopaTable.push(card);
        document.getElementById('scopaMessage').textContent = `${who === 'player' ? 'You' : 'Enemy'} played ${card.name}.`;
    }

    updateScopaUI();

    // Check Win
    if (scopaPlayerHp <= 0 || scopaEnemyHp <= 0) {
        endScopaBattle();
        return;
    }

    // Check End of Round (Hands empty)
    if (scopaPlayerHand.length === 0 && scopaEnemyHand.length === 0) {
        if (scopaPlayerDeck.length > 0 || scopaEnemyDeck.length > 0) {
            dealScopaCards();
            updateScopaUI();
        } else {
            // End of game (Deck empty)
            // Last capturer takes remaining table cards (visual only for now)
            scopaTable = [];
            updateScopaUI();
            endScopaBattle();
            return;
        }
    }

    // Switch Turn
    if (!extraTurn) {
        if (who === 'player') {
            scopaTurn = 'enemy';
            setTimeout(enemyTurn, 1000);
        } else {
            scopaTurn = 'player';
        }
    } else {
        document.getElementById('scopaMessage').textContent += " Extra Turn!";
        if (who === 'enemy') {
            setTimeout(enemyTurn, 1000);
        }
    }
}

function checkScopaCapture(card, table) {
    // Ace Rule: If card is Ace (1) and NO Ace on table, take all
    if (card.scopaValue === 1) {
        const aceInTable = table.find(c => c.scopaValue === 1);
        if (!aceInTable && table.length > 0) {
            return { captured: [...table], type: 'ace_sweep' };
        }
    }

    // 1. Direct Match (Value)
    const directMatch = table.find(c => c.scopaValue === card.scopaValue);
    if (directMatch) {
        return { captured: [directMatch], type: 'match' };
    }

    // 2. Sum Match (Sum of values = card value)
    // Simple subset sum problem. Since N is small (table usually < 10 cards), we can brute force or use helper.
    const sumMatch = findSumMatch(card.scopaValue, table);
    if (sumMatch) {
        return { captured: sumMatch, type: 'sum' };
    }

    return null;
}

function findSumMatch(target, cards) {
    // Try to find a subset of cards that sum to target
    // Limit to 2 or 3 cards for simplicity and performance
    
    // Check 2 cards
    for (let i = 0; i < cards.length; i++) {
        for (let j = i + 1; j < cards.length; j++) {
            if (cards[i].scopaValue + cards[j].scopaValue === target) {
                return [cards[i], cards[j]];
            }
        }
    }
    
    // Check 3 cards
    for (let i = 0; i < cards.length; i++) {
        for (let j = i + 1; j < cards.length; j++) {
            for (let k = j + 1; k < cards.length; k++) {
                if (cards[i].scopaValue + cards[j].scopaValue + cards[k].scopaValue === target) {
                    return [cards[i], cards[j], cards[k]];
                }
            }
        }
    }
    
    return null;
}

function enemyTurn() {
    if (scopaTurn !== 'enemy') return;

    // Simple AI: Try to capture, else play random
    let bestMove = -1;
    
    // Check for captures
    for (let i = 0; i < scopaEnemyHand.length; i++) {
        const card = scopaEnemyHand[i];
        if (checkScopaCapture(card, scopaTable)) {
            bestMove = i;
            break;
        }
    }

    if (bestMove === -1) {
        bestMove = Math.floor(Math.random() * scopaEnemyHand.length);
    }

    playScopaCard('enemy', bestMove);
}

function applyDamage(target, amount) {
    if (target === 'player') {
        scopaPlayerHp = Math.max(0, scopaPlayerHp - amount);
        showDamage('player', amount);
    } else {
        scopaEnemyHp = Math.max(0, scopaEnemyHp - amount);
        showDamage('enemy', amount);
    }
}

function showDamage(target, amount, text = null, color = null) {
    const el = document.createElement('div');
    el.className = 'damage-popup';
    el.textContent = text || `-${amount}`;
    if (color) el.style.color = color;
    
    // Position
    const rect = target === 'player' ? 
        document.getElementById('playerHpBar').getBoundingClientRect() : 
        document.getElementById('enemyHpBar').getBoundingClientRect();
    
    el.style.left = (rect.left + rect.width / 2) + 'px';
    el.style.top = rect.top + 'px';
    
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1000);
}

function endScopaBattle() {
    let msg = "";
    if (scopaPlayerHp > scopaEnemyHp) {
        msg = "Victory!";
        playerData.battlesWon++;
        addGold(100); // Reward
        addXP(50);
    } else {
        msg = "Defeat!";
    }
    
    document.getElementById('scopaMessage').textContent = msg;
    setTimeout(() => {
        const tableEl = document.getElementById('scopaTable');
        tableEl.innerHTML = '';
        
        if (cachedStartScreen) {
            cachedStartScreen.style.display = 'block';
            tableEl.appendChild(cachedStartScreen);
        } else {
            // Should not happen if updateScopaUI ran
            const startScreen = document.getElementById('scopaStartScreen');
            if (startScreen) {
                startScreen.style.display = 'block';
                tableEl.appendChild(startScreen);
            }
        }
    }, 3000);
}

function heal(target, amount) {
    if (target === 'player') {
        scopaPlayerHp = Math.min(100, scopaPlayerHp + amount);
        showDamage('player', amount, "HEAL", "green");
    } else {
        scopaEnemyHp = Math.min(100, scopaEnemyHp + amount);
        showDamage('enemy', amount, "HEAL", "green");
    }
}

function handleSpecialPowers(card, who, currentDamage) {
    let damage = currentDamage;
    let extraTurn = false;
    const target = who === 'player' ? 'enemy' : 'player';

    switch (card.specialPower) {
        case 'Bomb': damage += 10; showDamage(target, 10, "BOMB!"); break;
        case 'Water Strike': damage += 12; showDamage(target, 12, "SPLASH!"); break;
        case 'Thief': damage += 5; heal(who, 5); showDamage(target, 5, "STOLEN!"); break;
        case 'Ice Wizard': case 'Freeze': damage += 8; showDamage(target, 8, "FROZEN!"); break;
        case 'Stealth': damage += 10; showDamage(target, 10, "SNEAK!"); break;
        case 'Witch': damage += 7; showDamage(target, 7, "CURSE!"); break;
        case 'Fire Breath': damage += 15; showDamage(target, 15, "BURN!"); break;
        case 'Heal Aura': case 'Warmth': heal(who, 15); break;
        case 'Dark Pact': damage += 20; applyDamage(who, 5); showDamage(target, 20, "DARKNESS!"); break;
        case 'Shield': heal(who, 10); damage += 5; break;
        case 'Giant': heal(who, 10); break;
        
        // Legendaries
        case 'Cataclysm': damage += 30; applyDamage(who, 5); showDamage(target, 30, "CATACLYSM!"); break;
        case 'Thunderstrike': damage += 25; showDamage(target, 25, "THUNDER!"); break;
        case 'Nature\'s Wrath': damage += 15; heal(who, 15); showDamage(target, 15, "WRATH!"); break;
        case 'Black Hole': damage += 35; showDamage(target, 35, "VOID!"); break;
        case 'Time Stop': damage += 15; extraTurn = true; showDamage(target, 15, "TIME STOP!"); break;
        case 'Quantum State': 
            if (Math.random() > 0.5) { damage += 25; showDamage(target, 25, "ALIVE!"); } 
            else { heal(who, 25); showDamage(who, 25, "DEAD?", "green"); } 
            break;
        case 'Erase History': case 'The Delete Button': damage += 50; showDamage(target, 50, "DELETED!"); break;
        case 'Gift Rain': damage += 20; heal(who, 10); showDamage(target, 20, "GIFTS!"); break;
        case 'Cookies': heal(who, 30); showDamage(who, 30, "YUM!", "green"); break;
        
        // Wacky
        case 'Slip': damage += 5; showDamage(target, 5, "OOPS!"); break;
        case 'Critical Pain': damage += 25; showDamage(target, 25, "OUCH!"); break;
        case 'Panic at the Disco': { let d = Math.floor(Math.random()*15)+5; damage += d; showDamage(target, d, "DISCO!"); break; }
        case 'Gas Cloud': damage += 18; showDamage(target, 18, "STINKY!"); break;
        case 'Randomize': { let d = Math.floor(Math.random()*30)+1; damage += d; showDamage(target, d, "GLITCH!"); break; }
        case 'Disconnect': damage += 15; showDamage(target, 15, "404!"); break;
        case 'Scream': damage += 15; showDamage(target, 15, "KAREN!"); break;
        case 'Steal Gift': damage += 10; heal(who, 10); showDamage(target, 10, "YOINK!"); break;
        case 'Bag Kidnap': damage += 20; showDamage(target, 20, "BAGGED!"); break;
        case 'Squeak': damage += 1; showDamage(target, 1, "SQUEAK!"); break;
        case 'Snap': damage += 12; showDamage(target, 12, "SNAP!"); break;
        case 'Flash': damage += 10; showDamage(target, 10, "FLASH!"); break;
        case 'Craft': heal(who, 5); break;
        case 'Evasion': heal(who, 5); break;
    }
    return { damage, extraTurn };
}
