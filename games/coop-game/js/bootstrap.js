const appState = {
  selection: new Set(),
  localPlayerNames: {},
  preferences: loadFromStorage(STORAGE_KEYS.preferences, DEFAULT_PREFERENCES),
  bestResults: loadFromStorage(STORAGE_KEYS.bestResults, DEFAULT_BEST_RESULTS),
  game: loadFromStorage(STORAGE_KEYS.lastGame, null),
  lastTeamSelection: []
};

const dom = {};

function init() {
  appState.preferences = { ...DEFAULT_PREFERENCES, ...appState.preferences };
  appState.bestResults = { ...DEFAULT_BEST_RESULTS, ...appState.bestResults };
  appState.game = normalizeGameState(appState.game);
  appState.localPlayerNames = { ...(appState.game?.localPlay?.playerNames || {}) };
  cacheDom();
  bindEvents();
  renderStaticContent();
  renderHome();
  renderSelection();
  updateSoundToggle();
  setupPwa();
  showScreen("home");
}

function cacheDom() {
  dom.screens = {
    home: document.getElementById("screen-home"),
    rules: document.getElementById("screen-rules"),
    select: document.getElementById("screen-select"),
    game: document.getElementById("screen-game"),
    victory: document.getElementById("screen-victory"),
    defeat: document.getElementById("screen-defeat")
  };

  dom.homeLore = document.getElementById("home-lore");
  dom.bestResults = document.getElementById("best-results");
  dom.missionHomeTitle = document.getElementById("mission-home-title");
  dom.missionHomeText = document.getElementById("mission-home-text");
  dom.resumeHome = document.getElementById("resume-game-home");
  dom.rulesContent = document.getElementById("rules-content");
  dom.selectionGrid = document.getElementById("character-selection-grid");
  dom.selectionCount = document.getElementById("selection-count");
  dom.selectionGoal = document.getElementById("selection-goal");
  dom.selectionSynergies = document.getElementById("selection-synergies");
  dom.selectionMissionText = document.getElementById("selection-mission-text");
  dom.selectionWarning = document.getElementById("selection-warning");
  dom.selectionModeCopy = document.getElementById("selection-mode-copy");
  dom.selectionModeTags = document.getElementById("selection-mode-tags");
  dom.selectionModeToggle = document.getElementById("toggle-solidarity-mode");
  dom.selectionPlayerNames = document.getElementById("selection-player-names");
  dom.startGame = document.getElementById("start-game");
  dom.installButton = document.getElementById("install-app");
  dom.soundToggle = document.getElementById("sound-toggle");
  dom.gameTitle = document.getElementById("game-title");
  dom.gameObjective = document.getElementById("game-objective");
  dom.roundCounter = document.getElementById("round-counter");
  dom.turnCounter = document.getElementById("turn-counter");
  dom.teamSizeCounter = document.getElementById("team-size-counter");
  dom.resourceBars = document.getElementById("resource-bars");
  dom.sharedResources = document.getElementById("shared-resources");
  dom.boardTrack = document.getElementById("board-track");
  dom.stageLabel = document.getElementById("current-stage-label");
  dom.teamGrid = document.getElementById("selected-team-grid");
  dom.teamTip = document.getElementById("team-tip");
  dom.localPlayPanel = document.getElementById("local-play-panel");
  dom.currentEventCard = document.getElementById("current-event-card");
  dom.missionsList = document.getElementById("missions-list");
  dom.solidarityPanel = document.getElementById("solidarity-panel");
  dom.solidaritySummary = document.getElementById("solidarity-summary");
  dom.solidarityList = document.getElementById("solidarity-list");
  dom.logList = document.getElementById("log-list");
  dom.endRound = document.getElementById("end-round");
  dom.manualSave = document.getElementById("manual-save");
  dom.drawChaosNow = document.getElementById("draw-chaos-now");
  dom.victoryText = document.getElementById("victory-text");
  dom.victorySummary = document.getElementById("victory-summary");
  dom.defeatText = document.getElementById("defeat-text");
  dom.defeatSummary = document.getElementById("defeat-summary");
}

function bindEvents() {
  document.getElementById("new-game-home").addEventListener("click", () => showScreen("select"));
  document.getElementById("resume-game-home").addEventListener("click", resumeSavedGame);
  document.getElementById("open-rules-home").addEventListener("click", () => showScreen("rules"));
  document.getElementById("back-from-rules").addEventListener("click", () => showScreen(appState.game && !appState.game.outcome ? "game" : "home"));
  document.getElementById("back-to-home").addEventListener("click", () => showScreen("home"));
  document.getElementById("open-rules-select").addEventListener("click", () => showScreen("rules"));
  document.getElementById("start-game").addEventListener("click", startNewGame);
  document.getElementById("go-home").addEventListener("click", () => showScreen("home"));
  document.getElementById("victory-new-game").addEventListener("click", () => showScreen("select"));
  document.getElementById("victory-home").addEventListener("click", () => showScreen("home"));
  document.getElementById("defeat-home").addEventListener("click", () => showScreen("home"));
  document.getElementById("defeat-retry").addEventListener("click", retryLastTeam);
  dom.soundToggle.addEventListener("click", toggleSound);
  dom.selectionModeToggle.addEventListener("click", toggleSolidarityMode);
  dom.endRound.addEventListener("click", endRound);
  dom.manualSave.addEventListener("click", saveGame);
  dom.drawChaosNow.addEventListener("click", drawMiniDrama);
}

function renderStaticContent() {
  dom.homeLore.textContent = GAME_TEXT.lore;
  dom.missionHomeTitle.textContent = GAME_TEXT.objectiveTitle;
  dom.missionHomeText.textContent = GAME_TEXT.objectiveBody;

  dom.rulesContent.innerHTML = GAME_TEXT.rules.map((rule) => `
    <article>
      <h3>${rule.title}</h3>
      <p>${rule.body}</p>
    </article>
  `).join("");
}

function renderHome() {
  const best = appState.bestResults;
  dom.bestResults.innerHTML = [
    renderStatItem("Wins", best.wins),
    renderStatItem("Losses", best.losses),
    renderStatItem("Best Progress", `${best.bestProgress}%`),
    renderStatItem("Best Dignity", best.bestDignity),
    renderStatItem("Career Peak", best.bestCareer),
    renderStatItem("Longest Run", best.longestRun)
  ].join("");

  dom.resumeHome.disabled = !(appState.game && !appState.game.outcome);
}

function renderSelection() {
  const selectedIds = Array.from(appState.selection);
  dom.selectionGrid.innerHTML = CHARACTERS.map((character) => {
    const isSelected = appState.selection.has(character.id);
    return `
      <article class="character-card ${isSelected ? "selected" : ""}" data-character-id="${character.id}">
        <div class="character-top">
          <div>
            <p class="character-meta">${character.title}</p>
            <h3>${character.name}</h3>
          </div>
          <button class="mini-button" type="button" data-toggle-character="${character.id}">${isSelected ? "Removed, painfully" : "Recruit"}</button>
        </div>
        <p class="character-copy">${character.description}</p>
        <ul>
          <li><strong>Ability:</strong> ${character.specialName} - ${character.specialText}</li>
          <li><strong>Flaw:</strong> ${character.flaw}</li>
          <li><strong>Resource:</strong> ${character.statLabel}</li>
          <li><strong>Role:</strong> ${character.role}</li>
        </ul>
        <p class="quote-line">"${character.quotes[0]}"</p>
      </article>
    `;
  }).join("");

  dom.selectionGrid.querySelectorAll("[data-toggle-character]").forEach((button) => {
    button.addEventListener("click", () => toggleCharacterSelection(button.dataset.toggleCharacter));
  });

  dom.selectionPlayerNames.innerHTML = selectedIds.length
    ? `
      <div>
        <h3>Who holds the device</h3>
        <p class="mode-copy">Give a local name to each selected character. If left blank, the game will use the classic "Player 1, 2, 3..."</p>
      </div>
      <div class="player-name-grid">${selectedIds.map((characterId, index) => {
        const character = getCharacter(characterId);
        const defaultName = getDefaultLocalPlayerName(index);
        const playerName = appState.localPlayerNames[characterId] || "";
        return `
          <label class="player-name-card" for="player-name-${characterId}">
            <span>${character.name}</span>
            <small>${character.title}</small>
            <input
              id="player-name-${characterId}"
              class="player-name-input"
              type="text"
              maxlength="18"
              placeholder="${defaultName}"
              value="${escapeHtml(playerName)}"
              data-player-name-for="${characterId}"
            >
          </label>
        `;
      }).join("")}</div>
    `
    : `
      <div>
        <h3>Who holds the device</h3>
        <p class="mode-copy">Select at least one character and the local player names will appear here.</p>
      </div>
    `;

  dom.selectionPlayerNames.querySelectorAll("[data-player-name-for]").forEach((input) => {
    input.addEventListener("input", () => syncLocalPlayerName(input.dataset.playerNameFor, input.value));
  });

  const goal = selectedIds.length >= 3 ? computeMissionGoal(selectedIds.length) : "--";
  dom.selectionCount.textContent = `${selectedIds.length} selected`;
  dom.selectionGoal.textContent = `Goal: ${goal === "--" ? "--" : `${goal} progress`}`;
  dom.startGame.disabled = selectedIds.length < 3;

  const synergies = getActiveSynergies(selectedIds);
  dom.selectionSynergies.innerHTML = synergies.length
    ? synergies.map((synergy) => `<span class="synergy-pill">${synergy.title}</span>`).join("")
    : '<span class="synergy-pill">No active synergies: you\'re just improvising with elegance.</span>';

  dom.selectionMissionText.textContent = selectedIds.length >= 3
    ? `With ${selectedIds.length} professionals, the group must reach ${goal} Progress points, keeping the four fundamental bars above zero and Chaos below ${MAX_VALUES.chaos}.`
    : "Choose at least three characters: a cooperative plan with two people is just a very tense chat.";

  dom.selectionWarning.textContent = appState.preferences.charityModeOn
    ? `Solidarity Penance active: serious errors suggest ${DONATION_AMOUNT} euros to a charity of your choice, with up to ${DONATION_PENDING_CAP} pending penances.`
    : selectedIds.length >= 5
      ? "Large team: you'll have more talent and more turns, but the final mission will become even more demanding."
      : "Tip: a team with at least one active synergy survives bureaucratic embarrassments better.";

  dom.selectionModeToggle.textContent = `Solidarity Penance: ${appState.preferences.charityModeOn ? "ON" : "OFF"}`;
  dom.selectionModeToggle.classList.toggle("is-on", appState.preferences.charityModeOn);
  dom.selectionModeToggle.setAttribute("aria-pressed", String(appState.preferences.charityModeOn));
  dom.selectionModeCopy.textContent = appState.preferences.charityModeOn
    ? "Every avoidable mistake can turn into a 1 euro micro-donation to a charity of your choice. The game doesn't overdo it: maximum two pending penances at a time."
    : "If you activate it, the team plays with a small moral pact: whoever creates the most avoidable mess gets a 1 euro penance for a solidarity cause.";
  dom.selectionModeTags.innerHTML = [
    `<span class="synergy-pill">${DONATION_AMOUNT} euros per penance</span>`,
    `<span class="synergy-pill">Maximum ${DONATION_PENDING_CAP} pending</span>`,
    `<span class="synergy-pill">Trigger: flaws, failed missions, badly managed chaos</span>`
  ].join("");
}

function startNewGame() {
  const selectedIds = Array.from(appState.selection);
  if (selectedIds.length < 3) {
    return;
  }

  appState.lastTeamSelection = selectedIds.slice();
  const localPlayerNames = buildLocalPlayerNames(selectedIds);
  appState.localPlayerNames = { ...appState.localPlayerNames, ...localPlayerNames };
  const game = {
    round: 1,
    turnsTaken: 0,
    selectedIds,
    missionGoal: computeMissionGoal(selectedIds.length),
    missionTitle: GAME_TEXT.objectiveTitle,
    missionText: GAME_TEXT.objectiveBody,
    resources: {
      chaos: 4,
      dignity: 8,
      career: 8,
      stability: 8,
      progress: 0,
      funds: 3 + Math.floor(selectedIds.length / 2),
      snacks: 3,
      documents: 2
    },
    team: selectedIds.map((id) => createTeamMember(id)),
    activeMissions: [],
    currentEvent: null,
    log: [],
    outcome: null,
    synergyUsedThisRound: [],
    specialEventRounds: [4, 7],
    modes: {
      charityPenance: appState.preferences.charityModeOn
    },
    localPlay: {
      enabled: true,
      activeCharacterId: selectedIds[0],
      nextCharacterId: null,
      handoffPending: false,
      playerNames: localPlayerNames
    },
    donations: {
      pending: [],
      completed: 0,
      totalSuggested: 0,
      overflowBlocked: 0,
      nextId: 1
    }
  };

  appState.game = game;
  addLog("The collective gathers around a crooked table, a dubious moka pot, and an irresponsible goal.", "event");
  if (game.modes.charityPenance) {
    addLog(`Solidarity Penance mode active: every serious error can suggest ${DONATION_AMOUNT} euros to a charity of your choice.`, "event");
  }
  fillActiveMissions();
  drawEventCard("Opening Curtain");
  saveGame();
  renderGame();
  showScreen("game");
}

function createTeamMember(id) {
  const character = getCharacter(id);
  return {
    id,
    ap: 2,
    resource: character.statStart,
    quoteIndex: 0,
    flawTriggeredRound: false
  };
}

function resumeSavedGame() {
  if (!appState.game || appState.game.outcome) {
    return;
  }

  renderGame();
  showScreen("game");
}

function retryLastTeam() {
  if (appState.lastTeamSelection.length) {
    appState.selection = new Set(appState.lastTeamSelection);
  }
  if (appState.game?.localPlay?.playerNames) {
    appState.localPlayerNames = { ...appState.game.localPlay.playerNames };
  }
  renderSelection();
  showScreen("select");
}
