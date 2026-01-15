// Mega Battle Logic
let mbCanvas, mbCtx;
let mbLoopId;
let mbLastTime = 0;
let mbEntities = [];
let mbProjectiles = [];
let mbTowers = [];
let mbElixir = 5;
let mbEnemyElixir = 5;
let mbHand = [];
let mbNextCard = null;
let mbSelectedCardIdx = -1;
let mbIsGameOver = false;

const MB_WIDTH = 400;
const MB_HEIGHT = 400; // Square field
const MB_ELIXIR_RATE = 0.35;

function initMegaBattle() {
    if (playerData.deck.length < 8) {
        alert('You need 8 cards in your deck to play Mega Battle!');
        showSection('deck');
        return;
    }

    document.getElementById('megaBattleMenu').style.display = 'none';
    document.getElementById('megaBattleGame').style.display = 'flex'; // Flex for column layout
    document.getElementById('mbGameOver').style.display = 'none';

    mbCanvas = document.getElementById('megaBattleCanvas');
    mbCtx = mbCanvas.getContext('2d');
    
    // Resize canvas
    const container = document.getElementById('megaBattleGame');
    const w = Math.min(window.innerWidth - 40, 400); // Responsive width
    mbCanvas.width = MB_WIDTH;
    mbCanvas.height = MB_HEIGHT;
    mbCanvas.style.width = w + 'px';
    mbCanvas.style.height = w + 'px'; // Square

    // Input
    mbCanvas.addEventListener('mousedown', handleMbInput);
    mbCanvas.addEventListener('touchstart', handleMbInput, {passive: false});

    startMegaBattleGame();
}

function closeMegaBattle() {
    if (mbLoopId) cancelAnimationFrame(mbLoopId);
    document.getElementById('megaBattleMenu').style.display = 'block';
    document.getElementById('megaBattleGame').style.display = 'none';
}

function startMegaBattleGame() {
    mbEntities = [];
    mbProjectiles = [];
    mbTowers = [];
    mbElixir = 5;
    mbEnemyElixir = 5;
    mbIsGameOver = false;
    mbSelectedCardIdx = -1;

    // Create Towers
    // Player
    mbTowers.push({x: MB_WIDTH/2, y: MB_HEIGHT - 50, team: 0, type: 'KING', hp: 3000, maxHp: 3000, range: 150, attackSpeed: 60, cooldown: 0, color: '#3498db'});
    mbTowers.push({x: 60, y: MB_HEIGHT - 100, team: 0, type: 'PRINCESS', hp: 2000, maxHp: 2000, range: 150, attackSpeed: 50, cooldown: 0, color: '#3498db'});
    mbTowers.push({x: MB_WIDTH - 60, y: MB_HEIGHT - 100, team: 0, type: 'PRINCESS', hp: 2000, maxHp: 2000, range: 150, attackSpeed: 50, cooldown: 0, color: '#3498db'});

    // Enemy
    mbTowers.push({x: MB_WIDTH/2, y: 50, team: 1, type: 'KING', hp: 3000, maxHp: 3000, range: 150, attackSpeed: 60, cooldown: 0, color: '#e74c3c'});
    mbTowers.push({x: 60, y: 100, team: 1, type: 'PRINCESS', hp: 2000, maxHp: 2000, range: 150, attackSpeed: 50, cooldown: 0, color: '#e74c3c'});
    mbTowers.push({x: MB_WIDTH - 60, y: 100, team: 1, type: 'PRINCESS', hp: 2000, maxHp: 2000, range: 150, attackSpeed: 50, cooldown: 0, color: '#e74c3c'});

    // Init Hand
    const deckIds = [...playerData.deck];
    // Shuffle
    for (let i = deckIds.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deckIds[i], deckIds[j]] = [deckIds[j], deckIds[i]];
    }
    
    mbHand = deckIds.slice(0, 4).map(id => getCardDataForBattle(id));
    mbNextCard = getCardDataForBattle(deckIds[4]); // Simplified deck cycle

    renderMbHand();

    mbLastTime = performance.now();
    if (mbLoopId) cancelAnimationFrame(mbLoopId);
    mbGameLoop(mbLastTime);
}

function getCardDataForBattle(cardId) {
    const card = allCards.find(c => c.id == cardId);
    const owned = playerData.collection[cardId];
    const level = owned ? owned.level : 1;
    
    // Map card stats to battle stats
    // Base stats from card definition
    let hp = card.defense * 20 * (1 + (level-1)*0.1);
    let dmg = card.attack * 5 * (1 + (level-1)*0.1);
    let speed = 1.5;
    let range = 30; // Melee default
    let type = 'ground';
    let cost = Math.max(1, Math.min(9, Math.floor((card.attack + card.defense) / 5)));
    let count = 1;

    // Custom logic based on rarity/name keywords
    if (card.rarity === 'common') { count = 2; hp *= 0.6; }
    if (card.name.includes('Archer') || card.name.includes('Mage') || card.name.includes('Wisp')) { range = 120; }
    if (card.name.includes('Dragon') || card.name.includes('Bird') || card.name.includes('Bat')) { type = 'flying'; speed = 2; }
    if (card.name.includes('Giant') || card.name.includes('Golem')) { speed = 0.8; hp *= 2; }

    return {
        id: card.id,
        name: card.name,
        emoji: card.emoji,
        cost: cost,
        hp: hp,
        maxHp: hp,
        dmg: dmg,
        speed: speed,
        range: range,
        type: type,
        count: count,
        attackSpeed: 60,
        cooldown: 0
    };
}

function mbGameLoop(timestamp) {
    if (mbIsGameOver) return;
    const dt = (timestamp - mbLastTime) / 1000;
    mbLastTime = timestamp;

    updateMb(dt);
    drawMb();

    mbLoopId = requestAnimationFrame(mbGameLoop);
}

function updateMb(dt) {
    // Elixir
    if (mbElixir < 10) mbElixir += MB_ELIXIR_RATE * dt * 2;
    if (mbEnemyElixir < 10) mbEnemyElixir += MB_ELIXIR_RATE * dt * 2;
    
    document.getElementById('mbElixirFill').style.width = (mbElixir * 10) + '%';
    document.getElementById('mbElixirText').textContent = Math.floor(mbElixir);

    // AI
    if (mbEnemyElixir > 4 && Math.random() < 0.02) {
        // Spawn random enemy
        const randomCardId = playerData.deck[Math.floor(Math.random() * playerData.deck.length)];
        const unitData = getCardDataForBattle(randomCardId);
        spawnMbUnit(unitData, Math.random() * MB_WIDTH, 150, 1);
        mbEnemyElixir -= unitData.cost; // Simplified cost
    }

    // Update Entities
    [...mbTowers, ...mbEntities].forEach(e => {
        if (e.hp <= 0) return; // Dead entities don't act
        if (e.cooldown > 0) e.cooldown--;
        
        // Attack
        const target = findMbTarget(e, e.team === 0 ? 1 : 0);
        if (target) {
            if (e.cooldown <= 0) {
                // Attack!
                // Projectile or instant
                mbProjectiles.push({
                    x: e.x, y: e.y,
                    target: target,
                    speed: 5,
                    dmg: e.dmg || 50,
                    color: e.team === 0 ? '#3498db' : '#e74c3c'
                });
                e.cooldown = e.attackSpeed || 60;
            }
        } else if (e.speed) {
            // Move
            // Target closest building
            const buildings = mbTowers.filter(t => t.team !== e.team && t.hp > 0);
            let closest = null;
            let minD = Infinity;
            buildings.forEach(b => {
                const d = Math.hypot(b.x - e.x, b.y - e.y);
                if (d < minD) { minD = d; closest = b; }
            });

            if (closest) {
                const angle = Math.atan2(closest.y - e.y, closest.x - e.x);
                e.x += Math.cos(angle) * e.speed;
                e.y += Math.sin(angle) * e.speed;
            }
        }
    });

    // Projectiles
    mbProjectiles.forEach(p => {
        const dx = p.target.x - p.x;
        const dy = p.target.y - p.y;
        const dist = Math.hypot(dx, dy);
        
        if (dist < 10) {
            p.target.hp -= p.dmg;
            p.active = false;
        } else {
            p.x += (dx / dist) * p.speed * 3; // Fast projectiles
            p.y += (dy / dist) * p.speed * 3;
        }
    });
    mbProjectiles = mbProjectiles.filter(p => p.active !== false && p.target.hp > 0);

    // Cleanup
    mbEntities = mbEntities.filter(e => e.hp > 0);
    mbTowers.forEach(t => { if(t.hp < 0) t.hp = 0; });

    // Check Win
    const playerKing = mbTowers.find(t => t.team === 0 && t.type === 'KING');
    const enemyKing = mbTowers.find(t => t.team === 1 && t.type === 'KING');

    if (playerKing.hp <= 0) endMegaBattle(false);
    else if (enemyKing.hp <= 0) endMegaBattle(true);
}

function findMbTarget(source, targetTeam) {
    const targets = [...mbTowers, ...mbEntities].filter(t => t.team === targetTeam && t.hp > 0);
    let closest = null;
    let minD = Infinity;
    
    targets.forEach(t => {
        const d = Math.hypot(t.x - source.x, t.y - source.y);
        if (d < minD) { minD = d; closest = t; }
    });

    if (closest && minD <= source.range) return closest;
    return null;
}

function spawnMbUnit(data, x, y, team) {
    for(let i=0; i<data.count; i++) {
        mbEntities.push({
            x: x + Math.random()*20 - 10,
            y: y + Math.random()*20 - 10,
            team: team,
            ...data,
            maxHp: data.hp
        });
    }
}

function drawMb() {
    // Background
    mbCtx.fillStyle = '#5D9634';
    mbCtx.fillRect(0, 0, MB_WIDTH, MB_HEIGHT);
    
    // River
    mbCtx.fillStyle = '#3498db';
    mbCtx.fillRect(0, MB_HEIGHT/2 - 10, MB_WIDTH, 20);
    // Bridges
    mbCtx.fillStyle = '#7f8c8d';
    mbCtx.fillRect(40, MB_HEIGHT/2 - 12, 40, 24);
    mbCtx.fillRect(MB_WIDTH - 80, MB_HEIGHT/2 - 12, 40, 24);

    // Towers
    mbTowers.forEach(t => {
        if (t.hp <= 0) return;
        mbCtx.fillStyle = t.color;
        mbCtx.fillRect(t.x - 15, t.y - 15, 30, 30);
        // HP Bar
        mbCtx.fillStyle = 'red';
        mbCtx.fillRect(t.x - 15, t.y - 25, 30, 5);
        mbCtx.fillStyle = '#2ecc71';
        mbCtx.fillRect(t.x - 15, t.y - 25, 30 * (t.hp / t.maxHp), 5);
    });

    // Entities
    mbEntities.forEach(e => {
        mbCtx.font = '20px Arial';
        mbCtx.textAlign = 'center';
        mbCtx.textBaseline = 'middle';
        mbCtx.fillText(e.emoji, e.x, e.y);
        
        // HP Bar
        mbCtx.fillStyle = 'red';
        mbCtx.fillRect(e.x - 10, e.y - 15, 20, 3);
        mbCtx.fillStyle = '#2ecc71';
        mbCtx.fillRect(e.x - 10, e.y - 15, 20 * (e.hp / e.maxHp), 3);
    });

    // Projectiles
    mbProjectiles.forEach(p => {
        mbCtx.fillStyle = p.color;
        mbCtx.beginPath();
        mbCtx.arc(p.x, p.y, 3, 0, Math.PI*2);
        mbCtx.fill();
    });
}

function renderMbHand() {
    const container = document.getElementById('mbHand');
    container.innerHTML = '';
    
    mbHand.forEach((card, idx) => {
        const div = document.createElement('div');
        div.className = `hand-card ${mbSelectedCardIdx === idx ? 'selected' : ''}`;
        div.onclick = (e) => {
            e.stopPropagation();
            if (mbElixir >= card.cost) {
                mbSelectedCardIdx = idx;
                renderMbHand();
            }
        };
        
        div.innerHTML = `
            <div class="hand-card-cost">${card.cost}</div>
            <div style="font-size: 1.5rem;">${card.emoji}</div>
            <div style="font-size: 0.6rem; font-weight: bold;">${card.name}</div>
        `;
        
        if (mbElixir < card.cost) {
            div.style.opacity = '0.5';
        }
        
        container.appendChild(div);
    });
}

function handleMbInput(e) {
    if (mbSelectedCardIdx === -1) return;
    
    const rect = mbCanvas.getBoundingClientRect();
    const scaleX = mbCanvas.width / rect.width;
    const scaleY = mbCanvas.height / rect.height;
    
    let clientX = e.clientX;
    let clientY = e.clientY;
    
    if (e.touches && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    }
    
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    // Spawn limit (player side)
    if (y < MB_HEIGHT / 2) {
        // Can't spawn on enemy side
        return;
    }

    const card = mbHand[mbSelectedCardIdx];
    if (mbElixir >= card.cost) {
        mbElixir -= card.cost;
        spawnMbUnit(card, x, y, 0);
        
        // Cycle card
        // In a real game, take from deck. Here just random from deck
        const randomId = playerData.deck[Math.floor(Math.random() * playerData.deck.length)];
        mbHand[mbSelectedCardIdx] = getCardDataForBattle(randomId);
        
        mbSelectedCardIdx = -1;
        renderMbHand();
    }
}

function endMegaBattle(win) {
    mbIsGameOver = true;
    document.getElementById('mbGameOver').style.display = 'block';
    const resultText = document.getElementById('mbResultText');
    
    if (win) {
        resultText.textContent = "VICTORY!";
        resultText.style.color = "#f1c40f";
        playerData.battlesWon++;
        addXP(100);
        playerData.gold += 500;
    } else {
        resultText.textContent = "DEFEAT!";
        resultText.style.color = "#e74c3c";
        addXP(20);
    }
    saveGame();
    updateUI();
}
