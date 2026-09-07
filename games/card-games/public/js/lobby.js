function renderLobby(room) {
    window.currentRoom = room;
    $('room-code-display').textContent = room.code;
    $('lobby-game-name').textContent = room.gameName + ' — ' + (room.gameDescription || '');
    const list = $('lobby-players');
    list.innerHTML = '';
    const diffLabels = { easy: 'Facile', medium: 'Medio', hard: 'Difficile' };
    for (const p of room.players) {
      const row = document.createElement('div');
      row.className = 'player-row';
      const initial = (p.nickname || '?')[0].toUpperCase();
      const diffBadge = p.isBot && p.difficulty ? `<span class="diff-badge diff-${p.difficulty}">${diffLabels[p.difficulty]}</span>` : '';
      const hostControls = p.isBot && room.hostId === window.playerId ? `
        <select class="bot-diff-select" data-bot-id="${p.id}">
          <option value="easy" ${p.difficulty === 'easy' ? 'selected' : ''}>Facile</option>
          <option value="medium" ${p.difficulty === 'medium' ? 'selected' : ''}>Medio</option>
          <option value="hard" ${p.difficulty === 'hard' ? 'selected' : ''}>Difficile</option>
        </select>

        <button class="btn small primary" id="edit-diff-btn" data-pid="${p.id}">Modifica Difficoltà</button>
      ` : '';
      row.innerHTML = `
        <div class="player-info">
          <span class="player-initial">${initial}</span>
          <span class="player-name">${p.nickname || 'Guest'}</span>
          ${p.isBot ? `<span class="player-bot">${p.difficulty}</span>` : ''}
          ${hostControls}
          ${diffBadge}
        </div>
        ${p.isBot ? `
          <div class="bot-controls">
            <button class="btn small" id="kick-bot-btn" data-bot-id="${p.id}">Rimuovi Bot</button>
            <button class="btn small" id="make-human-btn" data-bot-id="${p.id}">Rendi Umano</button>
          </div>
        ` : ''}
      `;
      list.appendChild(row);
    }

    // Game card showing lobby details and OPTIMIZED GRAPHIC button
    const gameCard = document.createElement('div');
    gameCard.className = 'game-card';
    const gameName = room.gameName;
    const gameDesc = room.gameDescription || GAME_NAMES[room.gameId] || 'Gioco di carte';
    const gameMin = room.minPlayers || 2;
    const gameMax = room.maxPlayers || 6;
    gameCard.innerHTML = `
      <span class="icon">${icons[room.gameId] || '🃏'}</span>
      <div class="name">${gameName}</div>
      <div class="desc">${gameDesc}</div>
      <div class="players">${gameMin}-${gameMax} giocatori</div>
      <button class="btn small primary optimized-graphic-btn" data-game-id="${room.gameId}">OPTIMIZED GRAPHIC</button>
    `;
    grid.appendChild(gameCard);

    // Attach click handler to OPTIMIZED GRAPHIC button
    const ogBtn = gameCard.querySelector('.optimized-graphic-btn');
    if (ogBtn) {
      ogBtn.addEventListener('click', () => {
        const isEnabled = document.body.classList.toggle('optimized-graphic');
        ogBtn.textContent = isEnabled ? '🔍 RESTORE NORMAL' : 'OPTIMIZED GRAPHIC';
        ogBtn.classList.toggle('btn-primary', isEnabled);
        if (window.toggleOptimizedGraphic) window.toggleOptimizedGraphic(isEnabled);
      });
    }
  }