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

function updateInventoryUI() {
    document.getElementById('inv-money').textContent = player.inventory.money;
    document.getElementById('inv-wood').textContent = player.inventory.wood;
    document.getElementById('inv-stone').textContent = player.inventory.stone;
    document.getElementById('inv-grass').textContent = player.inventory.grass;
}

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

function switchTool() {
    currentToolIndex = (currentToolIndex + 1) % tools.length;
    updateToolUI();
}

function updateToolUI() {
    const tool = tools[currentToolIndex];
    document.getElementById('tool-name').textContent = tool.name;
    document.getElementById('tool-icon').textContent = tool.icon;
}
