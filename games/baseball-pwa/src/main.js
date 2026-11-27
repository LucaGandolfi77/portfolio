/*
 * DIAMOND & OVAL POLY '99 · Unified Baseball + Cricket Controller & iPhone Touch Input
 * ------------------------------------------------------------------------------------
 * Baseball Modes:
 *   - "match"  : 3-Inning Pennant Match
 *   - "derby"  : Home Run Derby (10 Outs)
 *   - "clutch" : 9th Inning Walk-off (Bases loaded, 2 outs, down by 2)
 * Cricket Modes:
 *   - "super_over" : T20 Super Over (2 Overs / 12 Balls, 3 Wickets)
 *   - "sixes"      : Sixes Derby (10 Balls · Clear the 72m rope!)
 *   - "chase"      : Last Over Chase (6 Balls · Need 18 runs, 2 Wickets)
 */
import CONFIG from "./config.js";
import { loadSave, writeSave, recordGameRun } from "./storage.js";
import {
  FIELDER_HOME_POS,
  CRICKET_FIELDER_POS,
  BASE_COORDS,
  CRICKET_STUMPS_STRIKER,
  CRICKET_STUMPS_BOWLER,
  createPitch,
  samplePitchPos,
  evaluateContact,
  stepBallPhysics,
  lerpBasePos,
  createCricketDelivery,
  sampleCricketDeliveryPos,
  evaluateCricketShot,
  stepCricketBallPhysics,
  isCricketBowledOrLbw,
  isCricketWide,
  lerpCricketCreasePos
} from "./physics.js";
import { initRenderer, renderFrame } from "./render.js";
import {
  setSoundEnabled,
  isSoundEnabled,
  sfxPitchWhoosh,
  sfxPitchBounce,
  sfxSwingMiss,
  sfxBatCrack,
  sfxCricketKnock,
  sfxStumpsShatter,
  sfxMittPop,
  sfxStep,
  sfxSlide,
  sfxOrganCharge,
  sfxCricketFanfare,
  sfxCrowdCheer,
  sfxUmpireOut
} from "./audio.js";

const save = loadSave();
setSoundEnabled(save.soundEnabled !== false);

const MODE_DEFS = {
  baseball: [
    { id: "match",  icon: "🏟️", title: "Pennant Match",    sub: "3-Inning game · Hit, sprint & slide" },
    { id: "derby",  icon: "🎆", title: "Home Run Derby",   sub: "10 Outs · Crush moonshots for distance" },
    { id: "clutch", icon: "🔥", title: "9th Inning Clutch", sub: "Bases loaded, 2 outs, down by 2!" }
  ],
  cricket: [
    { id: "super_over", icon: "🏏", title: "T20 Super Over",  sub: "2 Overs (12 balls) · 3 Wickets" },
    { id: "sixes",      icon: "💥", title: "Sixes Derby",     sub: "10 Balls · Clear the 72m rope!" },
    { id: "chase",      icon: "🔥", title: "Last Over Chase", sub: "Need 18 off 6 balls · 2 Wickets!" }
  ]
};

const STANCE_DEFS = {
  baseball: [
    { id: "contact", label: "⚡ CONTACT" },
    { id: "power",   label: "💥 POWER" },
    { id: "bunt",    label: "🎯 BUNT" }
  ],
  cricket: [
    { id: "drive", label: "🛡️ DRIVE" },
    { id: "slog",  label: "💥 SLOG 6" },
    { id: "sweep", label: "🎯 SWEEP" }
  ]
};

const state = {
  sport: save.sport || "baseball",
  mode: save.sport === "cricket" ? (save.selectedCricketMode || "super_over") : (save.selectedMode || "match"),
  oppTeamId: save.sport === "cricket" ? (save.selectedCricketTeam || "ind") : (save.selectedTeam || "tokyo"),
  skyKey: save.selectedSky || "day",
  batId: save.sport === "cricket" ? (save.selectedCricketBat || "willow") : (save.selectedBat || "ash"),

  // Baseball scoreboard
  inning: 1,
  maxInnings: 3,
  balls: 0,
  strikes: 0,
  outs: 0,
  homeRuns: 0,
  awayRuns: 0,
  derbyHrs: 0,

  // Cricket scoreboard
  cricketRuns: 0,
  cricketWickets: 0,
  cricketMaxWickets: 3,
  cricketBalls: 0,
  cricketMaxBalls: 12,
  cricketTarget: 0,
  cricketSixes: 0,
  cricketOverLog: [],
  stumpsBroken: false,

  sessionStart: Date.now(),

  // Phase: "menu" | "ready" | "windup" | "pitch" | "in_play" | "homerun" | "gameover"
  phase: "menu",
  phaseTimer: 0,
  clock: 0,

  // Visual juice
  shake: 0,
  hitFlash: 0,
  hitPos: null,
  crowdExcite: 0,

  // Batting & Aiming
  stance: save.sport === "cricket" ? "drive" : "contact",
  aimX: 0,
  aimZ: 0.96,
  charging: false,
  swung: false,
  swingAnim: 0,
  currentPitch: null,
  currentDelivery: null,

  // Ball in 3D space
  ball: {
    visible: false,
    active: false,
    x: 0, y: 18.44, z: 1.5,
    vx: 0, vy: 0, vz: 0,
    bounced: false,
    overWall: false,
    isHomer: false,
    trail: [],
    holder: null,
    throwTargetBase: null
  },

  // Baserunners / Cricket Runners
  basesOccupied: [false, false, false],
  runners: [],
  sprintBoost: 0.5,

  // Defensive fielders
  fielders: FIELDER_HOME_POS.map((f) => ({ ...f, Moving: false, heading: Math.PI })),
  particles: []
};

function $(id) { return document.getElementById(id); }

function spawnParticles(x, y, z, color, count = 14, speed = 7) {
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2;
    const sp = (0.3 + Math.random() * 0.7) * speed;
    state.particles.push({
      x, y, z,
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp,
      vz: 2 + Math.random() * sp,
      size: 4 + Math.random() * 5,
      life: 0.5 + Math.random() * 0.55,
      maxLife: 1.05,
      color
    });
  }
}

function showCallout(mainText, subText = "", dur = 1750) {
  const box = $("callout");
  const m = $("callout-main");
  const s = $("callout-sub");
  if (!box || !m || !s) return;
  m.textContent = mainText;
  s.textContent = subText;
  box.classList.remove("hidden");
  clearTimeout(showCallout._timer);
  showCallout._timer = setTimeout(() => {
    box.classList.add("hidden");
  }, dur);
}

function resetFielders() {
  const src = state.sport === "cricket" ? CRICKET_FIELDER_POS : FIELDER_HOME_POS;
  state.fielders = src.map((f) => ({
    ...f,
    Moving: false,
    heading: Math.atan2(-f.x, -f.y)
  }));
}

function syncRunnersFromOccupancy() {
  state.runners = [];
  if (state.sport === "cricket") return;
  for (let b = 0; b < 3; b++) {
    if (state.basesOccupied[b]) {
      state.runners.push({
        progress: b + 1,
        targetBase: b + 1,
        speedBonus: 0,
        sliding: false,
        slideTimer: 0
      });
    }
  }
}

function updateOccupancyFromRunners() {
  if (state.sport === "cricket") return;
  state.basesOccupied = [false, false, false];
  state.runners.forEach((r) => {
    const b = Math.round(r.progress);
    if (b >= 1 && b <= 3) state.basesOccupied[b - 1] = true;
  });
}

function updateStanceButtons() {
  const defs = STANCE_DEFS[state.sport];
  const btns = document.querySelectorAll(".stance-btn");
  btns.forEach((btn, i) => {
    const def = defs[i];
    if (!def) return;
    btn.setAttribute("data-mode", def.id);
    btn.textContent = def.label;
    btn.classList.toggle("active", state.stance === def.id);
  });

  // Update running buttons labels for Baseball vs Cricket
  const isCricket = state.sport === "cricket";
  $("btn-retreat").innerHTML = isCricket
    ? "<span>🛑 STAY IN CREASE</span><small>Hold ground</small>"
    : "<span>↩ HOLD / TAG UP</span><small>Stay on base</small>";
  $("btn-sprint").innerHTML = isCricket
    ? "<span>👟 TAP TO SPRINT!</span><small>Run between wickets</small>"
    : "<span>👟 TAP TO SPRINT!</span><small>Pump legs faster</small>";
  $("btn-advance").innerHTML = isCricket
    ? "<span>🔄 PUSH +1 RUN</span><small>Turn for another</small>"
    : "<span>⏭ ROUND BASE (+1)</span><small>Push for extra base</small>";
  $("btn-slide").innerHTML = isCricket
    ? "<span>💨 DIVE CREASE!</span><small>Stretch bat in</small>"
    : "<span>💨 DIVE / SLIDE!</span><small>Evade the tag</small>";
  $("swing-icon").textContent = isCricket ? "🏏" : "⚾";
}

function updateHUD() {
  const isCricket = state.sport === "cricket";
  $("baseball-scorebug").classList.toggle("hidden", isCricket);
  $("cricket-scorebug").classList.toggle("hidden", !isCricket);

  if (isCricket) {
    const opp = CONFIG.cricketTeams.find((t) => t.id === state.oppTeamId) || CONFIG.cricketTeams[0];
    $("cr-opp-abbr").textContent = opp.abbr;
    $("cr-opp-dot").style.background = opp.primary;
    $("cr-score").textContent = `${state.cricketRuns}/${state.cricketWickets}`;
    const ov = `${Math.floor(state.cricketBalls / 6)}.${state.cricketBalls % 6}`;
    $("cr-overs").textContent = `OV ${ov}`;
    if (state.mode === "chase") {
      const need = Math.max(0, state.cricketTarget - state.cricketRuns);
      const rem = Math.max(0, state.cricketMaxBalls - state.cricketBalls);
      $("cr-meta").textContent = `NEED ${need} (${rem}B)`;
    } else if (state.mode === "sixes") {
      $("cr-meta").textContent = `${state.cricketSixes} SIXES · ${state.cricketMaxBalls - state.cricketBalls}B`;
    } else {
      $("cr-meta").textContent = `${state.cricketMaxBalls / 6} OV · ${state.cricketMaxWickets}W`;
    }

    // 6-ball over tracker dots
    const overWrap = $("cr-over-balls");
    if (overWrap) {
      const currentOverStart = Math.floor(Math.max(0, state.cricketBalls - 1) / 6) * 6;
      const recent = state.cricketOverLog.slice(Math.max(0, state.cricketOverLog.length - 6));
      overWrap.innerHTML = "";
      for (let i = 0; i < 6; i++) {
        const tag = recent[i] || "";
        const pill = document.createElement("span");
        pill.className = "ov-dot" +
          (tag === "6" ? " six" : tag === "4" ? " four" : tag === "W" ? " wkt" : tag ? " run" : "");
        pill.textContent = tag || "·";
        overWrap.appendChild(pill);
      }
      void currentOverStart;
    }
  } else {
    const opp = CONFIG.teams.find((t) => t.id === state.oppTeamId) || CONFIG.teams[0];
    $("away-name").textContent = opp.abbr;
    $("away-dot").style.background = opp.primary;
    $("home-dot").style.background = "#22c55e";
    $("away-runs").textContent = state.mode === "derby" ? state.outs : state.awayRuns;
    $("home-runs").textContent = state.mode === "derby" ? state.derbyHrs : state.homeRuns;

    if (state.mode === "derby") {
      $("sb-half").textContent = "DERBY";
      $("sb-mode-tag").textContent = "10 OUTS";
    } else {
      $("sb-half").textContent = "▼" + state.inning;
      $("sb-mode-tag").textContent = state.mode === "clutch" ? "9TH INN" : state.maxInnings + " INN";
    }

    const setDots = (id, count) => {
      const el = $(id);
      if (!el) return;
      Array.from(el.children).forEach((d, idx) => d.classList.toggle("on", idx < count));
    };
    setDots("balls-dots", state.balls);
    setDots("strikes-dots", state.strikes);
    setDots("outs-dots", state.outs % 3);

    $("hud-b1").classList.toggle("on", !!state.basesOccupied[0]);
    $("hud-b2").classList.toggle("on", !!state.basesOccupied[1]);
    $("hud-b3").classList.toggle("on", !!state.basesOccupied[2]);
  }

  const inPlay = state.phase === "in_play";
  $("batting-controls").classList.toggle("hidden", inPlay);
  $("running-controls").classList.toggle("hidden", !inPlay);
  $("btn-sound").textContent = isSoundEnabled() ? "🔊" : "🔇";
}

function updateModalUI() {
  const isCricket = state.sport === "cricket";
  $("wallet-stars").textContent = save.stars;

  // Sport switcher pills
  document.querySelectorAll(".sport-tab").forEach((t) => {
    t.classList.toggle("active", t.getAttribute("data-sport") === state.sport);
  });

  // Title & Tagline
  $("modal-title").innerHTML = isCricket
    ? "OVAL <span>POLY '99</span>"
    : "DIAMOND <span>POLY '99</span>";
  $("modal-tagline").textContent = isCricket
    ? "Low-Poly 3D Cricket Stadium · Smash Sixes & Run Between Wickets"
    : "Low-Poly 3D Stadium Baseball · Swing the Bat & Run the Bases";
  $("btn-start-game").textContent = isCricket ? "▶ PLAY CRICKET!" : "▶ PLAY BALL!";

  // Mode cards
  const modes = MODE_DEFS[state.sport];
  const cards = document.querySelectorAll(".mode-card");
  if (!modes.some((m) => m.id === state.mode)) {
    state.mode = modes[0].id;
  }
  cards.forEach((card, i) => {
    const m = modes[i];
    if (!m) return;
    card.setAttribute("data-mode", m.id);
    card.querySelector(".mc-icon").textContent = m.icon;
    card.querySelector("strong").textContent = m.title;
    card.querySelector("small").textContent = m.sub;
    card.classList.toggle("active", state.mode === m.id);
  });

  // Career stats strip
  if (isCricket) {
    $("stat-1-val").textContent = save.cricketSixes;
    $("stat-1-lbl").textContent = "Sixes (6)";
    $("stat-2-val").textContent = save.cricketFours;
    $("stat-2-lbl").textContent = "Fours (4)";
    $("stat-3-val").textContent = save.cricketRuns;
    $("stat-3-lbl").textContent = "Total Runs";
    $("stat-4-val").textContent = save.cricketLongestM + " m";
    $("stat-4-lbl").textContent = "Longest Six";
    $("stat-5-val").textContent = save.cricketWins;
    $("stat-5-lbl").textContent = "Wins";
  } else {
    $("stat-1-val").textContent = save.hrs;
    $("stat-1-lbl").textContent = "Home Runs";
    $("stat-2-val").textContent = save.hits;
    $("stat-2-lbl").textContent = "Base Hits";
    $("stat-3-val").textContent = save.longestFt + " ft";
    $("stat-3-lbl").textContent = "Longest";
    $("stat-4-val").textContent = save.slides;
    $("stat-4-lbl").textContent = "Slides";
    $("stat-5-val").textContent = save.wins;
    $("stat-5-lbl").textContent = "Wins";
  }

  // Team Selector
  const teamSel = $("team-select");
  const teams = isCricket ? CONFIG.cricketTeams : CONFIG.teams;
  $("team-label").textContent = isCricket ? "RIVAL XI" : "RIVAL CLUB";
  if (teamSel) {
    teamSel.innerHTML = "";
    teams.forEach((t) => {
      const opt = document.createElement("option");
      opt.value = t.id;
      opt.textContent = `${t.name} (${t.abbr})`;
      teamSel.appendChild(opt);
    });
    if (!teams.some((t) => t.id === state.oppTeamId)) state.oppTeamId = teams[0].id;
    teamSel.value = state.oppTeamId;
  }

  const skySel = $("sky-select");
  if (skySel) skySel.value = state.skyKey;

  // Bat Selector
  const batSel = $("bat-select");
  const bats = isCricket ? CONFIG.cricketBats : CONFIG.bats;
  const unlockedList = isCricket ? save.unlockedCricketBats : save.unlockedBats;
  $("bat-label").textContent = isCricket ? "WILLOW BAT" : "EQUIPPED BAT";
  if (batSel) {
    batSel.innerHTML = "";
    bats.forEach((b) => {
      const unlocked = unlockedList.includes(b.id) || save.stars >= b.cost;
      const opt = document.createElement("option");
      opt.value = b.id;
      opt.textContent = unlocked
        ? `${b.name} (x${b.power.toFixed(2)})`
        : `🔒 ${b.name} (${b.cost}⭐)`;
      batSel.appendChild(opt);
    });
    if (!bats.some((b) => b.id === state.batId)) state.batId = bats[0].id;
    batSel.value = state.batId;
  }
}

function startNewGame() {
  const isCricket = state.sport === "cricket";
  state.oppTeamId = $("team-select").value || (isCricket ? "ind" : "tokyo");
  state.skyKey = $("sky-select").value || "day";

  const bats = isCricket ? CONFIG.cricketBats : CONFIG.bats;
  const unlockedList = isCricket ? save.unlockedCricketBats : save.unlockedBats;
  const chosenBat = $("bat-select").value || bats[0].id;
  const batObj = bats.find((b) => b.id === chosenBat) || bats[0];
  if (!unlockedList.includes(batObj.id) && save.stars >= batObj.cost) {
    save.stars -= batObj.cost;
    unlockedList.push(batObj.id);
  }
  if (unlockedList.includes(batObj.id)) {
    state.batId = batObj.id;
    if (isCricket) save.selectedCricketBat = batObj.id;
    else save.selectedBat = batObj.id;
  }

  save.sport = state.sport;
  save.selectedSky = state.skyKey;
  if (isCricket) {
    save.selectedCricketTeam = state.oppTeamId;
    save.selectedCricketMode = state.mode;
  } else {
    save.selectedTeam = state.oppTeamId;
    save.selectedMode = state.mode;
  }
  writeSave(save);

  state.stance = isCricket ? "drive" : "contact";
  state.sessionStart = Date.now();
  state.stumpsBroken = false;
  state.aimX = 0;
  state.aimZ = isCricket ? 0.82 : 0.96;

  if (isCricket) {
    state.cricketRuns = 0;
    state.cricketWickets = 0;
    state.cricketBalls = 0;
    state.cricketSixes = 0;
    state.cricketOverLog = [];

    if (state.mode === "chase") {
      state.cricketMaxBalls = 6;
      state.cricketMaxWickets = 2;
      state.cricketTarget = 18;
      sfxCricketFanfare();
      showCallout("LAST OVER CHASE! 🏏", "NEED 18 RUNS OFF 6 BALLS · 2 WICKETS", 2300);
    } else if (state.mode === "sixes") {
      state.cricketMaxBalls = 10;
      state.cricketMaxWickets = 10;
      state.cricketTarget = 0;
      sfxCricketFanfare();
      showCallout("SIXES DERBY! 💥", "10 BALLS · CLEAR THE 72m BOUNDARY ROPE!", 2100);
    } else {
      state.cricketMaxBalls = 12;
      state.cricketMaxWickets = 3;
      state.cricketTarget = 0;
      sfxCricketFanfare();
      showCallout("T20 SUPER OVER! 🏏", "2 OVERS (12 BALLS) · SCORE BIG!", 2000);
    }
  } else {
    state.balls = 0;
    state.strikes = 0;
    state.outs = 0;
    state.derbyHrs = 0;

    if (state.mode === "clutch") {
      state.inning = 9;
      state.maxInnings = 9;
      state.awayRuns = 4;
      state.homeRuns = 2;
      state.outs = 2;
      state.basesOccupied = [true, true, true];
      sfxOrganCharge();
      showCallout("BOTTOM 9TH · BASES LOADED!", "2 OUTS · DOWN 4–2 · DRIVE THEM HOME!", 2400);
    } else if (state.mode === "derby") {
      state.inning = 1;
      state.awayRuns = 0;
      state.homeRuns = 0;
      state.basesOccupied = [false, false, false];
      showCallout("HOME RUN DERBY!", "10 OUTS · SWING FOR THE BLEACHERS!", 2000);
    } else {
      state.inning = 1;
      state.maxInnings = 3;
      state.awayRuns = Math.floor(Math.random() * 2);
      state.homeRuns = 0;
      state.basesOccupied = [false, false, false];
      sfxOrganCharge();
      showCallout("PLAY BALL!", "SWING THE BAT & SPRINT THE BASES!", 1900);
    }
  }

  updateStanceButtons();
  $("menu-modal").classList.add("hidden");
  $("btn-resume-game").classList.remove("hidden");
  prepareNextPitch();
}

function prepareNextPitch() {
  resetFielders();
  syncRunnersFromOccupancy();
  state.swung = false;
  state.swingAnim = 0;
  state.stumpsBroken = false;
  state.ball.visible = true;
  state.ball.active = false;
  state.ball.trail = [];
  state.ball.holder = null;
  state.ball.throwTargetBase = null;
  state.ball.isHomer = false;

  if (state.sport === "cricket") {
    state.ball.x = 0.34;
    state.ball.y = CONFIG.cricketField.pitchLength - 0.4;
    state.ball.z = 2.05;
    $("pitch-type-label").textContent = "RUN-UP";
    $("pitch-mph-label").textContent = "-- KPH";
  } else {
    state.ball.x = -0.18;
    state.ball.y = 18.0;
    state.ball.z = 1.85;
    $("pitch-type-label").textContent = "WINDUP";
    $("pitch-mph-label").textContent = "-- MPH";
  }

  state.phase = "windup";
  state.phaseTimer = 0.82;
  updateHUD();
}

function launchPitch() {
  if (state.sport === "cricket") {
    const opp = CONFIG.cricketTeams.find((t) => t.id === state.oppTeamId) || CONFIG.cricketTeams[0];
    state.currentDelivery = createCricketDelivery(opp.rating);
    state.currentPitch = null;
    state.phase = "pitch";
    $("pitch-type-label").textContent = state.currentDelivery.spec.name;
    $("pitch-mph-label").textContent = state.currentDelivery.kph + " KPH";
    sfxPitchWhoosh();
  } else {
    const opp = CONFIG.teams.find((t) => t.id === state.oppTeamId) || CONFIG.teams[0];
    state.currentPitch = createPitch(opp.rating);
    state.currentDelivery = null;
    state.phase = "pitch";
    $("pitch-type-label").textContent = state.currentPitch.spec.name;
    $("pitch-mph-label").textContent = state.currentPitch.mph + " MPH";
    sfxPitchWhoosh();
  }
}

/* ===================== BASEBALL PROGRESSION ===================== */
function handleWalk() {
  showCallout("BALL FOUR · TAKE YOUR BASE!", "WALK TO 1ST BASE", 1600);
  state.balls = 0;
  state.strikes = 0;
  if (state.basesOccupied[0] && state.basesOccupied[1] && state.basesOccupied[2]) {
    state.homeRuns++;
  } else if (state.basesOccupied[0] && state.basesOccupied[1]) {
    state.basesOccupied[2] = true;
  } else if (state.basesOccupied[0]) {
    state.basesOccupied[1] = true;
  } else {
    state.basesOccupied[0] = true;
  }
  checkGameProgress();
}

function registerOut(reason = "OUT!") {
  sfxUmpireOut();
  state.outs++;
  state.balls = 0;
  state.strikes = 0;
  showCallout(reason, `${state.outs} OUT`, 1600);
  checkGameProgress();
}

/* ===================== CRICKET PROGRESSION ===================== */
function recordCricketBall(logSymbol, runsAdded = 0, isWicket = false, isExtraWide = false) {
  state.cricketOverLog.push(logSymbol);
  if (!isExtraWide) state.cricketBalls++;
  if (runsAdded > 0) {
    state.cricketRuns += runsAdded;
    save.cricketRuns += runsAdded;
  }
  if (isWicket) {
    state.cricketWickets++;
  }
  writeSave(save);
  updateHUD();

  // Chase victory check
  if (state.mode === "chase" && state.cricketRuns >= state.cricketTarget) {
    finishGame(true, `CHASE COMPLETE! 🏆 (${state.cricketRuns}/${state.cricketWickets})`);
    return;
  }

  // All out or balls exhausted
  if (state.cricketWickets >= state.cricketMaxWickets || state.cricketBalls >= state.cricketMaxBalls) {
    if (state.mode === "chase") {
      finishGame(false, `SHORT BY ${state.cricketTarget - state.cricketRuns} RUNS`);
    } else if (state.mode === "sixes") {
      finishGame(state.cricketSixes >= 3, `DERBY OVER · ${state.cricketSixes} SIXES!`);
    } else {
      const won = state.cricketRuns >= 22;
      finishGame(won, `INNINGS COMPLETE · ${state.cricketRuns}/${state.cricketWickets}`);
    }
    return;
  }

  setTimeout(prepareNextPitch, 1150);
}

function checkGameProgress() {
  if (state.sport === "cricket") return;
  updateHUD();

  if (state.mode !== "derby" && state.inning >= state.maxInnings && state.homeRuns > state.awayRuns) {
    finishGame(true, "WALK-OFF VICTORY! 🏆");
    return;
  }

  if (state.mode === "derby") {
    if (state.outs >= 10) {
      finishGame(true, `DERBY COMPLETE! ${state.derbyHrs} HOME RUNS!`);
      return;
    }
    setTimeout(prepareNextPitch, 1100);
    return;
  }

  if (state.outs >= 3) {
    state.outs = 0;
    state.basesOccupied = [false, false, false];
    if (state.inning >= state.maxInnings) {
      if (state.homeRuns === state.awayRuns) {
        state.inning++;
        state.awayRuns += Math.random() < 0.45 ? 1 : 0;
        showCallout(`EXTRA INNINGS · INNING ${state.inning}`, `SCORE ${state.homeRuns}–${state.awayRuns}`, 2000);
        setTimeout(prepareNextPitch, 1400);
      } else {
        const won = state.homeRuns > state.awayRuns;
        finishGame(won, won ? "BALLGAME · YOU WIN! 🏆" : "FINAL OUT · TOUGH LOSS");
      }
      return;
    }
    state.inning++;
    const oppScored = Math.random() < 0.42 ? 1 : 0;
    state.awayRuns += oppScored;
    showCallout(
      `INNING ${state.inning}`,
      oppScored ? `OPPONENT SCORED 1 RUN (${state.homeRuns}–${state.awayRuns})` : `SHUTOUT INNING! (${state.homeRuns}–${state.awayRuns})`,
      1900
    );
    setTimeout(prepareNextPitch, 1400);
    return;
  }

  setTimeout(prepareNextPitch, 1100);
}

function finishGame(won, headline) {
  state.phase = "gameover";
  const isCricket = state.sport === "cricket";
  if (isCricket) {
    save.cricketGames++;
    if (won) { save.cricketWins++; save.stars += 25; sfxCrowdCheer(); state.crowdExcite = 2.0; }
    else { save.stars += 8; }
  } else {
    save.games++;
    if (won) { save.wins++; save.stars += 25; sfxCrowdCheer(); state.crowdExcite = 2.0; }
    else { save.stars += 8; }
  }
  writeSave(save);
  recordGameRun(
    isCricket ? state.cricketRuns : (state.mode === "derby" ? state.derbyHrs : state.homeRuns),
    won ? "win" : "loss",
    Date.now() - state.sessionStart,
    { sport: state.sport, mode: state.mode }
  );
  showCallout(headline, `EARNED +${won ? 25 : 8} ⭐ STUBS`, 2600);
  setTimeout(() => {
    updateModalUI();
    $("btn-resume-game").classList.add("hidden");
    $("menu-modal").classList.remove("hidden");
  }, 2400);
}

/* ===================== SWING HANDLER ===================== */
function triggerSwing() {
  if (state.phase !== "pitch" || state.swung) return;

  if (state.sport === "cricket") {
    if (!state.currentDelivery) return;
    state.swung = true;
    state.swingAnim = 0.01;

    const batSpec = CONFIG.cricketBats.find((b) => b.id === state.batId) || CONFIG.cricketBats[0];
    const res = evaluateCricketShot(state.currentDelivery, state.aimX, state.aimZ, state.stance, batSpec);

    if (!res.hit) {
      sfxSwingMiss();
      const dismissal = isCricketBowledOrLbw(state.currentDelivery);
      if (dismissal === "BOWLED") {
        state.stumpsBroken = true;
        state.shake = 14;
        sfxStumpsShatter();
        spawnParticles(0, 0, 0.45, "#f5d08a", 20, 8);
        spawnParticles(0, 0, 0.72, "#ef4444", 10, 9);
        showCallout("BOWLED! TIMBER! 💥", "CLEAN THROUGH THE GATE!", 1800);
        state.phase = "ready";
        recordCricketBall("W", 0, true, false);
      } else if (dismissal === "LBW") {
        sfxUmpireOut();
        showCallout("OUT · LBW! ☝️", "PLUMB IN FRONT OF MIDDLE STUMP!", 1700);
        state.phase = "ready";
        recordCricketBall("W", 0, true, false);
      } else {
        showCallout(res.reason, "DOT BALL", 1150);
        state.phase = "ready";
        recordCricketBall("•", 0, false, false);
      }
      return;
    }

    // Sweet willow contact!
    sfxCricketKnock(0.85 + res.quality * 0.55);
    const pos = sampleCricketDeliveryPos(state.currentDelivery);
    state.hitFlash = 1.0;
    state.hitPos = [pos.x, pos.y, pos.z];
    state.shake = res.quality > 0.78 ? 10 : 4;
    spawnParticles(pos.x, pos.y, pos.z, "#fde047", 16, 9);

    state.ball.active = true;
    state.ball.bounced = false;
    state.ball.overWall = false;
    state.ball.isHomer = res.quality > 0.78 && res.launchDeg >= 18;
    state.ball.x = pos.x;
    state.ball.y = pos.y;
    state.ball.z = pos.z;
    state.ball.vx = res.vx;
    state.ball.vy = res.vy;
    state.ball.vz = res.vz;
    state.ball.holder = null;
    state.ball.throwTargetBase = null;

    // Striker starts running between the wickets (0 -> 1)
    state.runners = [{
      progress: 0.02,
      targetBase: 1,
      completedRuns: 0,
      sliding: false,
      slideTimer: 0
    }];
    state.sprintBoost = 0.58;
    state.phase = "in_play";
    $("runner-status").textContent = `CRACKED (${res.exitKph} KPH) · TAP SPRINT!`;
    updateHUD();
    return;
  }

  // ---- BASEBALL SWING ----
  if (!state.currentPitch) return;
  state.swung = true;
  state.swingAnim = 0.01;

  const batSpec = CONFIG.bats.find((b) => b.id === state.batId) || CONFIG.bats[0];
  const res = evaluateContact(state.currentPitch, state.aimX, state.aimZ, state.stance, batSpec);

  if (!res.hit) {
    sfxSwingMiss();
    state.strikes++;
    if (state.strikes >= 3) {
      registerOut(state.mode === "derby" ? "SWING & A MISS · OUT!" : "STRIKE THREE · SWINGING!");
    } else {
      showCallout(res.reason, `COUNT ${state.balls}–${state.strikes}`, 1200);
      setTimeout(prepareNextPitch, 950);
    }
    return;
  }

  const isAlloy = state.batId !== "ash";
  sfxBatCrack(0.85 + res.quality * 0.5, isAlloy);

  const pos = samplePitchPos(state.currentPitch);
  state.hitFlash = 1.0;
  state.hitPos = [pos.x, pos.y, pos.z];
  state.shake = res.quality > 0.80 ? 11 : 4;
  spawnParticles(pos.x, pos.y, pos.z, "#fde047", 16, 9);

  if (res.foul) {
    if (state.strikes < 2) state.strikes++;
    showCallout("FOUL BALL!", `${res.exitMph} MPH EXIT VELO · COUNT ${state.balls}–${state.strikes}`, 1300);
    state.ball.active = true;
    state.ball.x = pos.x; state.ball.y = pos.y; state.ball.z = pos.z;
    state.ball.vx = res.vx; state.ball.vy = res.vy; state.ball.vz = res.vz;
    state.phase = "homerun";
    setTimeout(prepareNextPitch, 1250);
    return;
  }

  state.balls = 0;
  state.strikes = 0;
  state.ball.active = true;
  state.ball.bounced = false;
  state.ball.overWall = false;
  state.ball.isHomer = res.quality > 0.84 && res.launchDeg >= 20 && res.launchDeg <= 38;
  state.ball.x = pos.x;
  state.ball.y = pos.y;
  state.ball.z = pos.z;
  state.ball.vx = res.vx;
  state.ball.vy = res.vy;
  state.ball.vz = res.vz;
  state.ball.holder = null;
  state.ball.throwTargetBase = null;

  syncRunnersFromOccupancy();
  state.runners.forEach((r) => {
    r.targetBase = Math.min(4, Math.floor(r.progress) + 1);
  });
  state.runners.unshift({
    progress: 0.02,
    targetBase: 1,
    speedBonus: 0,
    sliding: false,
    slideTimer: 0
  });

  state.sprintBoost = 0.55;
  state.phase = "in_play";
  $("runner-status").textContent = `FAIR BALL (${res.exitMph} MPH) · TAP SPRINT!`;
  updateHUD();
}

/* ===================== LIVE PLAY STEP (CRICKET) ===================== */
function stepCricketInPlay(dt) {
  const evt = stepCricketBallPhysics(state.ball, dt);
  if (state.ball.visible) {
    state.ball.trail.push([state.ball.x, state.ball.y, state.ball.z]);
    if (state.ball.trail.length > 20) state.ball.trail.shift();
  }

  if (evt && (evt.event === "six" || evt.event === "four")) {
    const isSix = evt.event === "six";
    sfxCrowdCheer();
    state.crowdExcite = 2.4;
    state.shake = isSix ? 12 : 6;
    if (isSix) {
      state.cricketSixes++;
      save.cricketSixes++;
      save.stars += 10;
      if (evt.distanceM > save.cricketLongestM) save.cricketLongestM = evt.distanceM;
      spawnParticles(-14, 72, 14, "#fbbf24", 26, 14);
      spawnParticles(14,  72, 14, "#38bdf8", 26, 14);
      spawnParticles(0,   76, 16, "#ec4899", 22, 14);
      showCallout("MAXIMUM SIX! 🎆", `${evt.distanceM}m MONSTER HIT · +10 ⭐`, 2200);
    } else {
      save.cricketFours++;
      save.stars += 5;
      spawnParticles(state.ball.x, state.ball.y, 1.5, "#22c55e", 18, 10);
      showCallout("CRACKING FOUR! 🏏", `BOUNDARY ROPE · +5 ⭐`, 1800);
    }
    state.runners = [];
    state.phase = "homerun";
    recordCricketBall(isSix ? "6" : "4", isSix ? 6 : 4, false, false);
    return;
  }

  // Decay sprint boost
  state.sprintBoost = Math.max(0.22, state.sprintBoost - dt * 0.25);
  $("sprint-fill").style.width = Math.round(state.sprintBoost * 100) + "%";

  // Move Cricket runner between creases
  const r = state.runners[0];
  if (r) {
    if (r.slideTimer > 0) {
      r.slideTimer -= dt;
      if (r.slideTimer <= 0) r.sliding = false;
    }
    const runSpeed = (0.42 + state.sprintBoost * 0.24) * (r.sliding ? 1.32 : 1.0);
    const diff = r.targetBase - r.progress;
    if (Math.abs(diff) > 0.015) {
      const step = Math.sign(diff) * runSpeed * dt;
      if (Math.abs(step) >= Math.abs(diff)) r.progress = r.targetBase;
      else r.progress += step;
    } else {
      r.progress = r.targetBase;
    }

    const done = Math.floor(r.progress + 0.02);
    if (done > r.completedRuns) {
      r.completedRuns = done;
      sfxStep();
      $("runner-status").textContent = `${done} RUN${done > 1 ? "S" : ""} COMPLETED! PUSH +1 OR STAY!`;
    }
  }

  // AI Fielders chase ball or throw at the stumps!
  if (!state.ball.holder && state.ball.throwTargetBase === null) {
    let nearest = null;
    let bestDist = Infinity;
    state.fielders.forEach((f) => {
      const d = Math.hypot(f.x - state.ball.x, f.y - state.ball.y);
      if (d < bestDist) { bestDist = d; nearest = f; }
    });

    if (nearest) {
      const dx = state.ball.x - nearest.x;
      const dy = state.ball.y - nearest.y;
      const dist = Math.hypot(dx, dy);
      if (dist > 0.5) {
        const fSpeed = 7.6;
        nearest.x += (dx / dist) * fSpeed * dt;
        nearest.y += (dy / dist) * fSpeed * dt;
        nearest.heading = Math.atan2(dx, dy);
        nearest.Moving = true;
      }

      if (dist < 1.85 && state.ball.z < 2.3) {
        if (!state.ball.bounced && Math.hypot(state.ball.x, state.ball.y) > 7.0) {
          // CAUGHT ON THE FULL!
          sfxMittPop();
          sfxUmpireOut();
          showCallout(`CAUGHT BY ${nearest.role}! ☝️`, "OUT ON THE FULL!", 1750);
          state.runners = [];
          state.phase = "ready";
          recordCricketBall("W", 0, true, false);
          return;
        }

        state.ball.holder = nearest;
        state.ball.active = false;
        sfxMittPop();

        if (state.mode === "sixes") {
          showCallout("FIELDED · NO SIX", "DOT BALL", 1300);
          state.runners = [];
          state.phase = "ready";
          recordCricketBall("•", 0, false, false);
          return;
        }

        // Check if runner is safely inside crease
        const inCrease = !r || Math.abs(r.progress - Math.round(r.progress)) <= 0.06;
        if (inCrease) {
          const runs = r ? r.completedRuns : 0;
          showCallout(runs > 0 ? `${runs} RUN${runs > 1 ? "S" : ""}! 🏏` : "DOT BALL", "SAFE IN CREASE", 1400);
          state.runners = [];
          state.phase = "ready";
          recordCricketBall(runs > 0 ? String(runs) : "•", runs, false, false);
          return;
        }

        // Throw to the stumps the batter is running toward!
        state.ball.throwTargetBase = (r.targetBase % 2 === 1) ? 1 : 0;
        $("runner-status").textContent = "THROW AT THE STUMPS! DIVE FOR CREASE!";
      }
    }
  } else if (state.ball.throwTargetBase !== null) {
    const targetStumps = state.ball.throwTargetBase === 1 ? CRICKET_STUMPS_BOWLER : CRICKET_STUMPS_STRIKER;
    const dx = targetStumps[0] - state.ball.x;
    const dy = targetStumps[1] - state.ball.y;
    const dist = Math.hypot(dx, dy);
    const throwSpeed = 35.0;

    if (dist <= throwSpeed * dt + 0.65) {
      state.ball.x = targetStumps[0];
      state.ball.y = targetStumps[1];
      state.ball.z = 0.5;
      state.ball.throwTargetBase = null;

      const margin = (r && r.sliding) ? 0.18 : 0.05;
      if (r && Math.abs(r.progress - r.targetBase) <= margin) {
        // SAFE IN CREASE!
        sfxMittPop();
        const runs = Math.max(r.completedRuns, Math.round(r.targetBase));
        if (r.sliding) { save.stars += 3; }
        showCallout(`SAFE! ${runs} RUN${runs > 1 ? "S" : ""}! 💨`, r.sliding ? "DIVE BEAT THE THROW!" : "MADE THE CREASE!", 1550);
        state.runners = [];
        state.phase = "ready";
        recordCricketBall(runs > 0 ? String(runs) : "•", runs, false, false);
      } else {
        // RUN OUT!
        state.stumpsBroken = true;
        state.shake = 12;
        sfxStumpsShatter();
        spawnParticles(targetStumps[0], targetStumps[1], 0.45, "#f5d08a", 16, 8);
        const completed = r ? r.completedRuns : 0;
        showCallout("RUN OUT! 💥", "DIRECT HIT AT THE STUMPS!", 1750);
        state.runners = [];
        state.phase = "ready";
        recordCricketBall("W", completed, true, false);
      }
    } else {
      state.ball.x += (dx / dist) * throwSpeed * dt;
      state.ball.y += (dy / dist) * throwSpeed * dt;
      state.ball.z = 1.25;
    }
  }
}

/* ===================== LIVE PLAY STEP (BASEBALL) ===================== */
function stepInPlay(dt) {
  if (state.sport === "cricket") {
    stepCricketInPlay(dt);
    return;
  }

  const evt = stepBallPhysics(state.ball, dt);
  if (state.ball.visible) {
    state.ball.trail.push([state.ball.x, state.ball.y, state.ball.z]);
    if (state.ball.trail.length > 18) state.ball.trail.shift();
  }

  if (evt && evt.event === "homerun") {
    sfxCrowdCheer();
    state.crowdExcite = 2.6;
    state.shake = 12;
    save.hrs++;
    save.hits++;
    save.stars += 10;
    if (evt.distanceFt > save.longestFt) save.longestFt = evt.distanceFt;
    writeSave(save);

    const runsScored = state.runners.length;
    state.homeRuns += runsScored;
    state.derbyHrs++;
    state.basesOccupied = [false, false, false];
    state.runners = [];
    state.phase = "homerun";

    spawnParticles(-12, 118, 16, "#fbbf24", 24, 14);
    spawnParticles(12,  118, 16, "#38bdf8", 24, 14);
    spawnParticles(0,   122, 20, "#ec4899", 24, 14);

    const label = runsScored === 4 ? "GRAND SLAM HOME RUN! 🎆" : `HOME RUN! (${runsScored} RUN${runsScored > 1 ? "S" : ""})`;
    showCallout(label, `${evt.distanceFt} FT BLAST · +10 ⭐`, 2300);
    setTimeout(checkGameProgress, 1900);
    return;
  }

  state.sprintBoost = Math.max(0.2, state.sprintBoost - dt * 0.25);
  $("sprint-fill").style.width = Math.round(state.sprintBoost * 100) + "%";

  const baseSpeed = 0.28 + state.sprintBoost * 0.16;
  for (let i = state.runners.length - 1; i >= 0; i--) {
    const r = state.runners[i];
    if (r.slideTimer > 0) {
      r.slideTimer -= dt;
      if (r.slideTimer <= 0) r.sliding = false;
    }
    const slideBoost = r.sliding ? 1.28 : 1.0;
    const diff = r.targetBase - r.progress;
    if (Math.abs(diff) > 0.015) {
      const step = Math.sign(diff) * baseSpeed * slideBoost * dt;
      if (Math.abs(step) >= Math.abs(diff)) r.progress = r.targetBase;
      else r.progress += step;
    } else {
      r.progress = r.targetBase;
    }

    if (r.progress >= 3.98) {
      state.runners.splice(i, 1);
      state.homeRuns++;
      save.stars += 4;
      writeSave(save);
      sfxCrowdCheer();
      state.crowdExcite = 1.6;
      spawnParticles(0, 0, 0.5, "#22c55e", 18, 8);
      showCallout("RUN SCORES! ⚾", `SCORE ${state.homeRuns}–${state.awayRuns}`, 1400);
      updateHUD();
    }
  }

  if (!state.ball.holder && state.ball.throwTargetBase === null) {
    let nearest = null;
    let bestDist = Infinity;
    state.fielders.forEach((f) => {
      const d = Math.hypot(f.x - state.ball.x, f.y - state.ball.y);
      if (d < bestDist) { bestDist = d; nearest = f; }
    });

    if (nearest) {
      const dx = state.ball.x - nearest.x;
      const dy = state.ball.y - nearest.y;
      const dist = Math.hypot(dx, dy);
      if (dist > 0.5) {
        const fSpeed = 7.4;
        nearest.x += (dx / dist) * fSpeed * dt;
        nearest.y += (dy / dist) * fSpeed * dt;
        nearest.heading = Math.atan2(dx, dy);
        nearest.Moving = true;
      }

      if (dist < 1.85 && state.ball.z < 2.3) {
        if (!state.ball.bounced && state.ball.y > 6.0) {
          sfxMittPop();
          registerOut(state.mode === "derby" ? "FLY OUT · NO HOME RUN" : `CAUGHT BY ${nearest.role}!`);
          return;
        }

        state.ball.holder = nearest;
        state.ball.active = false;
        sfxMittPop();

        if (state.mode === "derby") {
          registerOut("GROUND BALL · NO HOME RUN");
          return;
        }

        const activeRunner = state.runners.find((r) => Math.abs(r.progress - Math.round(r.progress)) > 0.04);
        if (!activeRunner) {
          save.hits++;
          writeSave(save);
          updateOccupancyFromRunners();
          showCallout("BASE HIT! SAFE!", "RUNNERS HOLD", 1400);
          setTimeout(checkGameProgress, 1100);
          return;
        }

        const tBase = Math.max(1, Math.min(4, activeRunner.targetBase));
        state.ball.throwTargetBase = tBase;
        $("runner-status").textContent = `THROW TO ${tBase === 4 ? "HOME" : tBase + "B"}! SWIPE / TAP SLIDE!`;
      }
    }
  } else if (state.ball.throwTargetBase !== null) {
    const targetCoord = BASE_COORDS[state.ball.throwTargetBase];
    const dx = targetCoord[0] - state.ball.x;
    const dy = targetCoord[1] - state.ball.y;
    const dist = Math.hypot(dx, dy);
    const throwSpeed = 36.5;

    if (dist <= throwSpeed * dt + 0.6) {
      state.ball.x = targetCoord[0];
      state.ball.y = targetCoord[1];
      state.ball.z = 0.8;
      sfxMittPop();

      const tBase = state.ball.throwTargetBase;
      state.ball.throwTargetBase = null;

      const idx = state.runners.findIndex((r) => r.targetBase === tBase);
      if (idx !== -1) {
        const runner = state.runners[idx];
        const margin = runner.sliding ? 0.16 : 0.04;
        if (Math.abs(runner.progress - tBase) <= margin) {
          runner.progress = tBase;
          if (runner.sliding) { save.slides++; save.stars += 3; }
          save.hits++;
          writeSave(save);
          if (tBase === 4) {
            state.runners.splice(idx, 1);
            state.homeRuns++;
            sfxCrowdCheer();
            showCallout("SAFE AT HOME! 💨", "SLIDE BEAT THE TAG!", 1600);
          } else {
            showCallout(`SAFE AT ${tBase}B!`, runner.sliding ? "GREAT SLIDE UNDER THE TAG!" : "BEAT THE THROW!", 1500);
          }
          updateOccupancyFromRunners();
          setTimeout(checkGameProgress, 1100);
        } else {
          state.runners.splice(idx, 1);
          updateOccupancyFromRunners();
          registerOut(`OUT AT ${tBase === 4 ? "HOME" : tBase + "B"}!`);
        }
      } else {
        updateOccupancyFromRunners();
        setTimeout(checkGameProgress, 950);
      }
    } else {
      state.ball.x += (dx / dist) * throwSpeed * dt;
      state.ball.y += (dy / dist) * throwSpeed * dt;
      state.ball.z = 1.3;
    }
  }
}

/* ===================== MAIN 60FPS LOOP ===================== */
let lastTime = 0;
function loop(now) {
  const dt = lastTime ? Math.min((now - lastTime) / 1000, 0.05) : 0.016;
  lastTime = now;
  state.clock += dt;

  if (state.swingAnim > 0) {
    state.swingAnim = Math.min(1, state.swingAnim + dt * 6.5);
  }

  if (state.phase === "windup") {
    state.phaseTimer -= dt;
    if (state.phaseTimer <= 0) launchPitch();
  } else if (state.phase === "pitch") {
    if (state.sport === "cricket" && state.currentDelivery) {
      state.currentDelivery.elapsed += dt;
      const pos = sampleCricketDeliveryPos(state.currentDelivery);
      if (pos.bounced && !state.currentDelivery.bouncedSoundPlayed) {
        state.currentDelivery.bouncedSoundPlayed = true;
        sfxPitchBounce();
        spawnParticles(state.currentDelivery.bounceX, state.currentDelivery.bounceY, 0.08, "#e2c08d", 7, 3);
      }
      state.ball.x = pos.x;
      state.ball.y = pos.y;
      state.ball.z = pos.z;
      state.ball.trail.push([pos.x, pos.y, pos.z]);
      if (state.ball.trail.length > 10) state.ball.trail.shift();

      if (pos.u >= 1.14 && !state.swung) {
        state.phase = "ready";
        if (isCricketWide(state.currentDelivery)) {
          sfxMittPop();
          showCallout("WIDE BALL! +1", "EXTRA RUN · RE-BOWL", 1300);
          recordCricketBall("Wd", 1, false, true);
        } else {
          const dismissal = isCricketBowledOrLbw(state.currentDelivery);
          if (dismissal === "BOWLED") {
            state.stumpsBroken = true;
            state.shake = 14;
            sfxStumpsShatter();
            spawnParticles(0, 0, 0.45, "#f5d08a", 20, 8);
            showCallout("BOWLED! TIMBER! 💥", "STUMPS SHATTERED!", 1800);
            recordCricketBall("W", 0, true, false);
          } else {
            sfxMittPop();
            showCallout("LEFT ALONE", "DOT BALL · THROUGH TO KEEPER", 1100);
            recordCricketBall("•", 0, false, false);
          }
        }
      }
    } else if (state.currentPitch) {
      state.currentPitch.elapsed += dt;
      const pos = samplePitchPos(state.currentPitch);
      state.ball.x = pos.x;
      state.ball.y = pos.y;
      state.ball.z = pos.z;
      state.ball.trail.push([pos.x, pos.y, pos.z]);
      if (state.ball.trail.length > 10) state.ball.trail.shift();

      if (pos.u >= 1.16 && !state.swung) {
        sfxMittPop();
        const inStrikeZone = Math.abs(state.currentPitch.targetX) <= 0.46 &&
          state.currentPitch.targetZ >= 0.54 && state.currentPitch.targetZ <= 1.44;

        if (inStrikeZone) {
          state.strikes++;
          if (state.strikes >= 3) registerOut("STRIKE THREE · LOOKING!");
          else {
            showCallout("STRIKE!", `CALLED STRIKE · ${state.balls}–${state.strikes}`, 1100);
            setTimeout(prepareNextPitch, 900);
          }
        } else {
          state.balls++;
          if (state.balls >= 4 && state.mode !== "derby") handleWalk();
          else {
            showCallout("BALL!", `OUTSIDE ZONE · ${state.balls}–${state.strikes}`, 1100);
            setTimeout(prepareNextPitch, 900);
          }
        }
        state.phase = "ready";
        updateHUD();
      }
    }
  } else if (state.phase === "in_play") {
    stepInPlay(dt);
  } else if (state.phase === "homerun") {
    if (state.sport === "cricket") stepCricketBallPhysics(state.ball, dt);
    else stepBallPhysics(state.ball, dt);
  }

  renderFrame(state, dt);
  requestAnimationFrame(loop);
}

/* ===================== iPHONE PORTRAIT TOUCH & KEYBOARD CONTROLS ===================== */
function initControls() {
  const canvasEl = $("game-canvas");

  // Stance buttons
  document.querySelectorAll(".stance-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.stance = btn.getAttribute("data-mode") || (state.sport === "cricket" ? "drive" : "contact");
      document.querySelectorAll(".stance-btn").forEach((b) => b.classList.toggle("active", b === btn));
    });
  });

  // Relative drag aiming on canvas (thumb never blocks the reticle on vertical iPhone!)
  let ptrDown = false;
  let startX = 0, startY = 0;
  let startAimX = 0, startAimZ = 0;

  canvasEl.addEventListener("pointerdown", (e) => {
    ptrDown = true;
    startX = e.clientX;
    startY = e.clientY;
    startAimX = state.aimX;
    startAimZ = state.aimZ;
    if (state.phase === "pitch" || state.phase === "windup") {
      state.charging = true;
      $("btn-swing").classList.add("charging");
    } else if (state.phase === "in_play") {
      pumpSprint();
    }
  });

  window.addEventListener("pointermove", (e) => {
    if (!ptrDown) return;
    if (state.phase === "pitch" || state.phase === "windup" || state.phase === "ready") {
      const sensX = 1.65 / Math.max(280, window.innerWidth);
      const sensZ = 1.55 / Math.max(420, window.innerHeight * 0.55);
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      state.aimX = Math.max(-0.58, Math.min(0.58, startAimX + dx * sensX));
      state.aimZ = Math.max(0.28, Math.min(1.48, startAimZ - dy * sensZ));
    }
  });

  window.addEventListener("pointerup", (e) => {
    if (!ptrDown) return;
    ptrDown = false;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    if (state.phase === "pitch") {
      state.charging = false;
      $("btn-swing").classList.remove("charging");
      triggerSwing();
    } else if (state.phase === "in_play") {
      if (dy > 35) triggerSlide();
      else if (dy < -35 || dx > 45) triggerAdvanceBase();
    }
    state.charging = false;
    $("btn-swing").classList.remove("charging");
  });

  // Big Thumb Swing Button
  const swingBtn = $("btn-swing");
  swingBtn.addEventListener("pointerdown", (e) => {
    e.stopPropagation();
    state.charging = true;
    swingBtn.classList.add("charging");
    const activeObj = state.sport === "cricket" ? state.currentDelivery : state.currentPitch;
    if (state.phase === "pitch" && activeObj && activeObj.elapsed / activeObj.flightTime > 0.70) {
      triggerSwing();
    }
  });
  swingBtn.addEventListener("pointerup", (e) => {
    e.stopPropagation();
    state.charging = false;
    swingBtn.classList.remove("charging");
    triggerSwing();
  });

  function pumpSprint() {
    state.sprintBoost = Math.min(1.0, state.sprintBoost + 0.19);
    sfxStep();
    state.runners.forEach((r) => {
      const pos = state.sport === "cricket" ? lerpCricketCreasePos(r.progress, false) : lerpBasePos(r.progress);
      spawnParticles(pos[0], pos[1], 0.1, state.sport === "cricket" ? "#e2c08d" : "#d97706", 4, 3);
    });
  }

  function triggerAdvanceBase() {
    state.runners.forEach((r) => {
      const cap = state.sport === "cricket" ? 4 : 4;
      r.targetBase = Math.min(cap, r.targetBase + 1);
    });
    pumpSprint();
    $("runner-status").textContent = state.sport === "cricket"
      ? "PUSHING FOR ANOTHER RUN!"
      : "ROUNDING THE BAG FOR AN EXTRA BASE!";
  }

  function triggerRetreatBase() {
    state.runners.forEach((r) => {
      r.targetBase = Math.max(state.sport === "cricket" ? 0 : 1, Math.floor(r.progress));
    });
    $("runner-status").textContent = state.sport === "cricket"
      ? "HOLDING GROUND IN THE CREASE!"
      : "HOLDING / TAGGING UP ON BASE!";
  }

  function triggerSlide() {
    sfxSlide();
    state.runners.forEach((r) => {
      r.sliding = true;
      r.slideTimer = 0.68;
      const pos = state.sport === "cricket" ? lerpCricketCreasePos(r.progress, false) : lerpBasePos(r.progress);
      spawnParticles(pos[0], pos[1], 0.15, "#f59e0b", 12, 6);
    });
    $("runner-status").textContent = state.sport === "cricket"
      ? "FULL-STRETCH CREASE DIVE! 💨"
      : "HEADFIRST DIVE SLIDE! 💨";
  }

  $("btn-sprint").addEventListener("click", pumpSprint);
  $("btn-advance").addEventListener("click", triggerAdvanceBase);
  $("btn-retreat").addEventListener("click", triggerRetreatBase);
  $("btn-slide").addEventListener("click", triggerSlide);

  // Keyboard support
  window.addEventListener("keydown", (e) => {
    if (!$("menu-modal").classList.contains("hidden")) return;
    if (e.code === "Space") {
      e.preventDefault();
      if (state.phase === "pitch") triggerSwing();
      else if (state.phase === "in_play") pumpSprint();
    } else if (e.code === "ArrowUp") {
      if (state.phase === "in_play") triggerAdvanceBase();
      else state.aimZ = Math.min(1.48, state.aimZ + 0.08);
    } else if (e.code === "ArrowDown") {
      if (state.phase === "in_play") triggerSlide();
      else state.aimZ = Math.max(0.28, state.aimZ - 0.08);
    } else if (e.code === "ArrowLeft") {
      state.aimX = Math.max(-0.55, state.aimX - 0.08);
    } else if (e.code === "ArrowRight") {
      state.aimX = Math.min(0.55, state.aimX + 0.08);
    }
  });

  // Sport Switcher Tabs (Baseball / Cricket)
  document.querySelectorAll(".sport-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      const nextSport = tab.getAttribute("data-sport") || "baseball";
      if (nextSport === state.sport) return;
      state.sport = nextSport;
      save.sport = nextSport;
      state.mode = nextSport === "cricket" ? (save.selectedCricketMode || "super_over") : (save.selectedMode || "match");
      state.oppTeamId = nextSport === "cricket" ? (save.selectedCricketTeam || "ind") : (save.selectedTeam || "tokyo");
      state.batId = nextSport === "cricket" ? (save.selectedCricketBat || "willow") : (save.selectedBat || "ash");
      state.stance = nextSport === "cricket" ? "drive" : "contact";
      writeSave(save);
      resetFielders();
      updateStanceButtons();
      updateModalUI();
      updateHUD();
    });
  });

  // Mode cards
  document.querySelectorAll(".mode-card").forEach((card) => {
    card.addEventListener("click", () => {
      const m = card.getAttribute("data-mode");
      if (!m) return;
      state.mode = m;
      if (state.sport === "cricket") save.selectedCricketMode = m;
      else save.selectedMode = m;
      document.querySelectorAll(".mode-card").forEach((c) => c.classList.toggle("active", c === card));
    });
  });

  // Sound toggle
  $("btn-sound").addEventListener("click", () => {
    const next = !isSoundEnabled();
    setSoundEnabled(next);
    save.soundEnabled = next;
    writeSave(save);
    updateHUD();
  });

  $("btn-menu").addEventListener("click", () => {
    updateModalUI();
    $("menu-modal").classList.remove("hidden");
  });

  $("btn-start-game").addEventListener("click", startNewGame);
  $("btn-resume-game").addEventListener("click", () => {
    $("menu-modal").classList.add("hidden");
  });
}

function boot() {
  initRenderer($("game-canvas"));
  resetFielders();
  initControls();
  updateStanceButtons();
  updateModalUI();
  updateHUD();
  requestAnimationFrame(loop);
}

boot();
