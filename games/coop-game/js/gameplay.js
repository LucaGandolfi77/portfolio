function handleAction(characterId, actionType) {
  const game = appState.game;
  if (!game || game.outcome) {
    return;
  }

  if (game.localPlay.handoffPending || characterId !== getCurrentPlayableCharacterId(game)) {
    return;
  }

  const member = game.team.find((unit) => unit.id === characterId);
  const character = getCharacter(characterId);
  if (!member || member.ap < (actionType === "special" ? 2 : 1)) {
    return;
  }

  const actionTurn = game.turnsTaken + 1;
  game.currentLogTurn = actionTurn;
  const tags = new Set(character.tags);
  let summary = "";

  applyRoundFlaw(member, actionType);

  if (actionType === "work") {
    member.ap -= 1;
    applyEffects({ progress: 3, career: 1 }, `${character.name} pushes the dossier with bureaucratically suspicious stubbornness.`);
    tags.add("mission");
    tags.add("career");
    if (characterId === "teo") {
      applyEffects({ progress: 2, chaos: 1 }, `${character.name} opens an interdimensional debug window: useful but socially unstable.`);
      registerSolidarityPenance("Teo opened a lateral dimension during a job that looked normal.", "Teo's bug");
    }
    if (characterId === "brando") {
      applyEffects({ progress: 1 }, `${character.name} transforms a conceptual wall into an operational stepping stone.`);
    }
    summary = `${character.name} works on the dossier with the courage of someone who never read the fine print.`;
  }

  if (actionType === "calm") {
    member.ap -= 1;
    applyEffects({ chaos: -1, dignity: 1 }, `${character.name} patches the group's drama with near-professional style.`);
    tags.add("social");
    tags.add("wellbeing");
    if (characterId === "aldo") {
      applyEffects({ career: 1 }, `${character.name} rebuilds the team's reputation with an objection served at the bench.`);
      tags.add("law");
    }
    if (characterId === "evarista") {
      applyEffects({ stability: 1 }, `${character.name} doses calm with pharmaceutical precision and measured sarcasm.`);
    }
    summary = `${character.name} contains the drama before the drama opens a newsletter.`;
  }

  if (actionType === "recover") {
    member.ap -= 1;
    member.resource = clamp(member.resource + 1, 0, character.statMax);
    applyEffects({ stability: 1 }, `${character.name} catches their breath, posture, and a minimal grip on reality.`);
    tags.add("wellbeing");
    tags.add("prep");
    if (characterId === "miro") {
      applyEffects({ funds: 1 }, `${character.name} claims to have found an operational margin under a chair.`);
      tags.add("logistics");
    }
    if (characterId === "ubaldo") {
      applyEffects({ documents: 1 }, `${character.name} stacks spiral-bound papers and finds an attachment none of you remember.`);
      tags.add("bureaucracy");
    }
    summary = `${character.name} recharges with the emotional discipline of a monastic toaster.`;
  }

  if (actionType === "special") {
    member.ap -= 2;
    member.resource -= 1;
    summary = useSpecialAbility(characterId, tags);
  }

  if (actionType === "snack") {
    if (game.resources.snacks < 1 || member.ap >= 2) {
      return;
    }
    game.resources.snacks -= 1;
    member.ap += 1;
    applyEffects({ stability: 1 }, `${character.name} receives a tactical snack and remembers being a mammal.`);
    tags.add("wellbeing");
    summary = `${character.name} chews strategy and recovers one action point.`;
  }

  member.quoteIndex += 1;
  game.turnsTaken = actionTurn;
  addLog(summary, "action");
  advanceMissions(Array.from(tags));
  triggerSynergies(Array.from(tags));
  maybeAddFlavorLog();
  delete game.currentLogTurn;
  updateLocalPlayAfterAction(characterId);
  playSound(actionType === "special" ? "special" : "action");
  evaluateGameState();
  saveGame();
  renderGame();
}

function useSpecialAbility(characterId, tags) {
  const abilities = {
    ubaldo() {
      applyEffects({ chaos: -2, dignity: 1, progress: 8 }, "Ubaldo opens the backyard ledger and the group rediscovers order, stamps, and agricultural pride.");
      applyEffects({ documents: 1 }, "Among the folders, a document appears with a trace of residual faith still intact.");
      tags.add("bureaucracy");
      tags.add("logistics");
      return "Ubaldo Fiscozappa fills out destiny on graph paper and makes it surprisingly presentable.";
    },
    evarista() {
      applyEffects({ stability: 3, chaos: -1, dignity: 1 }, "Evarista administers calm, water, and knightly doses of realism.");
      appState.game.team.filter((member) => member.ap === 0).forEach((member) => {
        member.ap = 1;
      });
      tags.add("wellbeing");
      tags.add("social");
      return "Evarista Cerottini distributes shock chamomile and the group stops trembling in sans serif.";
    },
    brando() {
      applyEffects({ progress: 10, career: 1, chaos: -1 }, "Brando climbs the project up a conceptual wall and returns with results, wind, and a better plan.");
      tags.add("tech");
      tags.add("climb");
      tags.add("mission");
      return "Brando Arrampicrispr scales the impossible and plants a flag on your emotional backlog.";
    },
    aldo() {
      applyEffects({ chaos: -2, career: 2, dignity: 1, stability: -1 }, "Aldo recites the civil code like it's jazz and silences the echo of HR with a single eyebrow.");
      tags.add("law");
      tags.add("career");
      tags.add("social");
      return "Aldo Spritzforense delivers a closing argument over negronis of truth and even chaos asks for a break.";
    },
    miro() {
      applyEffects({ funds: 2, documents: 1, progress: 6, dignity: -1 }, "Miro optimizes the air, the budget, and an unattended drawer. Ethically questionable, strategically delicious.");
      registerSolidarityPenance("Miro also optimized the concept of moral private property.", "Miro's ability");
      tags.add("logistics");
      tags.add("bureaucracy");
      return "Miro KPI Lupin makes a creative withdrawal from the shared resource continuum.";
    },
    teo() {
      applyEffects({ progress: 8, chaos: -2, career: 1 }, "Teo reheats an oracular patch in the microwave and the project stops smoking for a few minutes.");
      appState.game.team.forEach((member) => {
        if (member.id === "teo") {
          return;
        }
        member.resource = clamp(member.resource + 1, 0, getCharacter(member.id).statMax);
      });
      tags.add("tech");
      tags.add("mission");
      return "Teo Kernel Tempesta corrects reality with a beta patch and the group pretends it's normal.";
    }
  };

  return abilities[characterId]();
}

function applyRoundFlaw(member, actionType) {
  if (member.flawTriggeredRound || actionType === "snack") {
    return;
  }

  member.flawTriggeredRound = true;
  const character = getCharacter(member.id);

  if (member.id === "ubaldo") {
    member.resource = clamp(member.resource - 1, 0, character.statMax);
    addLog("Ubaldo hears the word bonus, opens a folder, and sacrifices a Fertile Document to the cosmic order.", "warning");
    registerSolidarityPenance("Ubaldo opened the wrong folder due to fiscal enthusiasm.", "Ubaldo's flaw");
  }

  if (member.id === "evarista" && appState.game.resources.documents > 0) {
    appState.game.resources.documents -= 1;
    addLog("Evarista reads the instruction manual cover to cover and consumes a Document out of professional conscience.", "warning");
    registerSolidarityPenance("Evarista lost precious time in the cosmic instruction manual.", "Evarista's flaw");
  }

  if (member.id === "brando" && actionType === "recover") {
    applyEffects({ stability: -1, progress: 1 }, "Brando rests on an imaginary parapet. It's unsettling but slightly useful.");
    registerSolidarityPenance("Brando turned recovery into an inner-cornice performance.", "Brando's flaw");
  }

  if (member.id === "aldo" && actionType === "special") {
    applyEffects({ stability: -1 }, "Aldo's voice echoes through the neighborhood. The law wins, the eardrums don't.");
    registerSolidarityPenance("Aldo won the dispute but mistreated the neighborhood acoustics.", "Aldo's flaw");
  }
}

function advanceMissions(tags) {
  const missionsToComplete = [];
  appState.game.activeMissions.forEach((mission) => {
    if (mission.completed) {
      return;
    }

    const matches = mission.tags.some((tag) => tags.includes(tag));
    if (!matches) {
      return;
    }

    mission.progress = Math.min(mission.target, mission.progress + 1);
    if (mission.progress >= mission.target) {
      mission.completed = true;
      missionsToComplete.push(mission);
    }
  });

  missionsToComplete.forEach((mission) => {
    applyEffects(mission.reward, `Mission complete: ${mission.title}. The group applauds with moderate hysteria.`);
    addLog(`Side mission complete: ${mission.title}. Reward collected without getting caught by family voice messages.`, "synergy");
  });

  if (missionsToComplete.length) {
    appState.game.activeMissions = appState.game.activeMissions.filter((mission) => !mission.completed);
    fillActiveMissions();
  }
}

function triggerSynergies(tags) {
  const selectedIds = appState.game.selectedIds;
  const used = appState.game.synergyUsedThisRound;
  getActiveSynergies(selectedIds).forEach((synergy) => {
    const matches = synergy.tags.some((tag) => tags.includes(tag));
    if (!matches || used.includes(synergy.id)) {
      return;
    }

    applyEffects(synergy.effects, `Synergy active: ${synergy.title}. Cooperation stops looking like a mistake for a moment.`);
    addLog(`Synergy triggered: ${synergy.title}. ${synergy.description}`, "synergy");
    used.push(synergy.id);
  });
}

function fillActiveMissions() {
  const activeIds = new Set(appState.game.activeMissions.map((mission) => mission.id));
  while (appState.game.activeMissions.length < 2) {
    const candidates = SIDE_MISSION_TEMPLATES.filter((mission) => !activeIds.has(mission.id));
    if (!candidates.length) {
      break;
    }

    const template = randomItem(candidates);
    appState.game.activeMissions.push({
      ...template,
      progress: 0,
      expiresIn: template.duration,
      completed: false
    });
    activeIds.add(template.id);
  }
}

function drawEventCard(source, forceSpecial = false) {
  const hadCurrentLogTurn = Object.prototype.hasOwnProperty.call(appState.game, "currentLogTurn");
  const previousLogTurn = appState.game.currentLogTurn;
  if (!hadCurrentLogTurn) {
    appState.game.currentLogTurn = appState.game.turnsTaken + 1;
  }

  const triggeredByHighChaos = appState.game.resources.chaos >= 13;
  const useSpecial = forceSpecial || appState.game.specialEventRounds.includes(appState.game.round) || triggeredByHighChaos;
  const deck = useSpecial ? SPECIAL_EVENTS : EVENT_CARDS;
  const template = randomItem(deck);
  const intensity = 1 + Math.floor((appState.game.round - 1) / 3);
  const effects = scaleEffects(template.effects, intensity);

  appState.game.currentEvent = {
    title: template.title,
    text: template.text,
    tags: template.tags,
    effects,
    source,
    isSpecial: useSpecial
  };

  applyEffects(effects, `${template.title}: ${template.text}`);
  addLog(`${source}: ${template.title}. ${template.text}`, "event");
  if (triggeredByHighChaos) {
    registerSolidarityPenance("Chaos has risen so high it summoned an unsolicited special event.", "group chaos management");
  }
  if (hadCurrentLogTurn) {
    appState.game.currentLogTurn = previousLogTurn;
  } else {
    delete appState.game.currentLogTurn;
  }
  playSound(useSpecial ? "warning" : "event");
}

function drawMiniDrama() {
  if (!appState.game || appState.game.outcome) {
    return;
  }
  registerSolidarityPenance("You voluntarily clicked a mini-drama. This is questionable initiative.", "collective stunt");
  drawEventCard("Voluntary mini-drama", false);
  evaluateGameState();
  saveGame();
  renderGame();
}

function endRound() {
  const game = appState.game;
  if (!game || game.outcome) {
    return;
  }

  game.activeMissions.forEach((mission) => {
    mission.expiresIn -= 1;
  });

  const failed = game.activeMissions.filter((mission) => mission.expiresIn <= 0 && !mission.completed);
  failed.forEach((mission) => {
    applyEffects(mission.penalty, `Mission failed: ${mission.title}. Life laughs without discretion.`);
    addLog(`Mission expired: ${mission.title}. Penalty applied with a moral receipt attached.`, "warning");
    registerSolidarityPenance(`Mission failed: ${mission.title}.`, "ignored side mission");
  });

  game.activeMissions = game.activeMissions.filter((mission) => mission.expiresIn > 0 && !mission.completed);
  fillActiveMissions();

  const upkeepChaos = 1 + Math.floor(game.round / 3);
  applyEffects({ chaos: upkeepChaos }, "End of round: general chaos increases from social, digital, and salary inertia.");

  if (game.resources.stability <= 4) {
    applyEffects({ dignity: -1 }, "Low stability makes the group more fragile and theatrically susceptible.");
  }

  if (game.resources.career <= 4) {
    applyEffects({ chaos: 1 }, "Career wobbles and chaos notices immediately.");
  }

  game.round += 1;
  game.team.forEach((member) => {
    member.ap = 2;
    member.flawTriggeredRound = false;
  });
  game.synergyUsedThisRound = [];
  game.localPlay.activeCharacterId = game.team[0]?.id ?? null;
  game.localPlay.nextCharacterId = null;
  game.localPlay.handoffPending = false;

  if (game.round > 8) {
    evaluateGameState();
    saveGame();
    renderGame();
    return;
  }

  addLog(`Round ${game.round} begins. Nobody knows who's ready, but everyone pretends to be.`, "event");
  drawEventCard(`Round ${game.round} opening`);
  maybeAddFlavorLog(true);
  evaluateGameState();
  saveGame();
  renderGame();
}

function evaluateGameState() {
  const game = appState.game;
  if (!game || game.outcome) {
    return;
  }

  const { resources, missionGoal, round } = game;
  if (resources.progress >= missionGoal && resources.chaos < MAX_VALUES.chaos && resources.dignity > 0 && resources.career > 0 && resources.stability > 0) {
    finishGame("victory");
    return;
  }

  const defeated = resources.chaos >= MAX_VALUES.chaos || resources.dignity <= 0 || resources.career <= 0 || resources.stability <= 0 || round > 8;
  if (defeated) {
    finishGame("defeat");
  }
}

function finishGame(outcome) {
  const game = appState.game;
  game.outcome = outcome;
  appState.lastTeamSelection = game.selectedIds.slice();
  if (outcome === "defeat") {
    registerSolidarityPenance("The group imploded before the finish line. Final penance from a tragic sitcom.", "team defeat");
  }
  updateBestResults(game, outcome);
  saveGame();

  const summaryHtml = createOutcomeSummary(game);
  if (outcome === "victory") {
    dom.victoryText.textContent = randomItem(GAME_TEXT.victoryLines);
    dom.victorySummary.innerHTML = summaryHtml;
    showScreen("victory");
  } else {
    dom.defeatText.textContent = randomItem(GAME_TEXT.defeatLines);
    dom.defeatSummary.innerHTML = summaryHtml;
    showScreen("defeat");
  }

  playSound(outcome === "victory" ? "victory" : "warning");
}

function createOutcomeSummary(game) {
  const panels = [
    summaryPanel("Final Progress", `${Math.min(999, game.resources.progress)}/${game.missionGoal}`),
    summaryPanel("Final Chaos", `${game.resources.chaos}/${MAX_VALUES.chaos}`),
    summaryPanel("Remaining Dignity", game.resources.dignity),
    summaryPanel("Remaining Career", game.resources.career),
    summaryPanel("Remaining Stability", game.resources.stability),
    summaryPanel("Rounds Reached", game.round)
  ];

  if (game.modes.charityPenance) {
    panels.push(summaryPanel("Suggested Micro-Donations", `${game.donations.totalSuggested} x ${DONATION_AMOUNT} euros`));
    panels.push(summaryPanel("Marked as Donated", game.donations.completed));
  }

  return panels.join("");
}

function updateBestResults(game, outcome) {
  if (outcome === "victory") {
    appState.bestResults.wins += 1;
  } else {
    appState.bestResults.losses += 1;
  }

  const progressPercent = Math.round((game.resources.progress / game.missionGoal) * 100);
  appState.bestResults.bestProgress = Math.max(appState.bestResults.bestProgress, progressPercent);
  appState.bestResults.bestDignity = Math.max(appState.bestResults.bestDignity, game.resources.dignity);
  appState.bestResults.bestCareer = Math.max(appState.bestResults.bestCareer, game.resources.career);
  appState.bestResults.longestRun = Math.max(appState.bestResults.longestRun, Math.min(game.round, 8));
  saveToStorage(STORAGE_KEYS.bestResults, appState.bestResults);
  renderHome();
}

function showScreen(name) {
  Object.entries(dom.screens).forEach(([screenName, element]) => {
    element.classList.toggle("is-active", screenName === name);
  });

  if (name === "home") {
    renderHome();
  }
  if (name === "select") {
    renderSelection();
  }
  if (name === "game") {
    renderGame();
  }
}

function toggleCharacterSelection(characterId) {
  if (appState.selection.has(characterId)) {
    appState.selection.delete(characterId);
  } else {
    appState.selection.add(characterId);
  }
  renderSelection();
}

function toggleSound() {
  appState.preferences.soundOn = !appState.preferences.soundOn;
  updateSoundToggle();
  saveToStorage(STORAGE_KEYS.preferences, appState.preferences);
  if (appState.preferences.soundOn) {
    playSound("action");
  }
}

function updateSoundToggle() {
  dom.soundToggle.textContent = `Sound: ${appState.preferences.soundOn ? "ON" : "OFF"}`;
  dom.soundToggle.setAttribute("aria-pressed", String(appState.preferences.soundOn));
}

function toggleSolidarityMode() {
  appState.preferences.charityModeOn = !appState.preferences.charityModeOn;
  saveToStorage(STORAGE_KEYS.preferences, appState.preferences);
  renderSelection();
}

function queueLocalHandoff() {
  const game = appState.game;
  if (!game || game.outcome || game.localPlay.handoffPending) {
    return;
  }

  const nextCharacterId = findNextPlayableCharacter(game, getCurrentPlayableCharacterId(game));
  if (!nextCharacterId) {
    return;
  }

  game.localPlay.nextCharacterId = nextCharacterId;
  game.localPlay.handoffPending = true;
  addLog(`Pass the device: it's ${getCharacter(nextCharacterId).name}'s turn. The table cooperates physically too.`, "event");
  saveGame();
  renderGame();
}

function confirmLocalHandoff() {
  const game = appState.game;
  if (!game?.localPlay?.handoffPending || !game.localPlay.nextCharacterId) {
    return;
  }

  game.localPlay.activeCharacterId = game.localPlay.nextCharacterId;
  game.localPlay.nextCharacterId = null;
  game.localPlay.handoffPending = false;
  addLog(`Device handed off: ${getCharacter(game.localPlay.activeCharacterId).name} is now at the controls.`, "event");
  saveGame();
  renderGame();
}

function updateLocalPlayAfterAction(characterId) {
  const game = appState.game;
  const member = game.team.find((unit) => unit.id === characterId);
  if (!member) {
    return;
  }

  if (member.ap > 0) {
    game.localPlay.activeCharacterId = characterId;
    return;
  }

  const nextCharacterId = findNextPlayableCharacter(game, characterId);
  if (!nextCharacterId) {
    game.localPlay.activeCharacterId = characterId;
    game.localPlay.nextCharacterId = null;
    game.localPlay.handoffPending = false;
    return;
  }

  game.localPlay.nextCharacterId = nextCharacterId;
  game.localPlay.handoffPending = true;
}

function getCurrentPlayableCharacterId(game) {
  if (!game?.localPlay?.enabled) {
    return game?.team?.[0]?.id ?? null;
  }

  if (game.localPlay.handoffPending && game.localPlay.nextCharacterId) {
    return game.localPlay.nextCharacterId;
  }

  return game.localPlay.activeCharacterId ?? game.team[0]?.id ?? null;
}

function findNextPlayableCharacter(game, fromCharacterId) {
  const currentIndex = game.team.findIndex((member) => member.id === fromCharacterId);
  if (currentIndex === -1) {
    return null;
  }

  for (let offset = 1; offset < game.team.length + 1; offset += 1) {
    const member = game.team[(currentIndex + offset) % game.team.length];
    if (member.id !== fromCharacterId && member.ap > 0) {
      return member.id;
    }
  }

  return null;
}

function applyEffects(effects, narrative) {
  const resources = appState.game.resources;
  Object.entries(effects).forEach(([key, value]) => {
    const max = key === "progress" ? appState.game.missionGoal : MAX_VALUES[key];
    resources[key] = clamp(resources[key] + value, 0, max);
  });

  if (narrative) {
    addLog(narrative, effects.chaos && effects.chaos > 0 ? "warning" : "action");
  }
}

function addLog(text, type = "action") {
  appState.game.log.push({
    text,
    type,
    round: appState.game.round,
    turn: appState.game.currentLogTurn ?? (appState.game.turnsTaken + 1)
  });

  if (appState.game.log.length > 40) {
    appState.game.log = appState.game.log.slice(-40);
  }
}

function registerSolidarityPenance(reason, source) {
  const game = appState.game;
  if (!game?.modes?.charityPenance) {
    return;
  }

  if (game.donations.pending.length >= DONATION_PENDING_CAP) {
    game.donations.overflowBlocked += 1;
    addLog(`Moral cap reached: you already have ${DONATION_PENDING_CAP} pending penances. The new penance for "${reason}" remains suspended in universal judgment.`, "warning");
    return;
  }

  const entry = {
    id: String(game.donations.nextId),
    amount: DONATION_AMOUNT,
    round: game.round,
    reason,
    source,
    cause: randomItem(CHARITY_CAUSES)
  };

  game.donations.nextId += 1;
  game.donations.totalSuggested += 1;
  game.donations.pending.push(entry);
  addLog(`Solidarity penance: for ${source}, ${DONATION_AMOUNT} euros are suggested for ${entry.cause}. Keep it down: maximum ${DONATION_PENDING_CAP} pending.`, "warning");
}

function completeDonation(donationId) {
  const game = appState.game;
  if (!game?.modes?.charityPenance) {
    return;
  }

  const donation = game.donations.pending.find((entry) => entry.id === donationId);
  if (!donation) {
    return;
  }

  game.donations.pending = game.donations.pending.filter((entry) => entry.id !== donationId);
  game.donations.completed += 1;
  addLog(`Penance marked as donated: ${DONATION_AMOUNT} euros to ${donation.cause}. No numeric bonus, just a slightly less disheveled conscience.`, "synergy");
  saveGame();
  renderGame();
}
