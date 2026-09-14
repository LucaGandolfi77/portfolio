window.Games = window.Games || {};
window.Games.simon = function(ctx) {
  var stage = ctx.stage;
  var difficulty = ctx.difficulty || 'easy';
  var currentRound = 0;
  var score = 0;
  var isPlaying = false;
  var isShowingPattern = false;
  var playerSequence = [];
  var patternSequence = [];

  var colors = ['#ff4444', '#4444ff', '#44ff44', '#ffff44'];
  var colorNames = ['red', 'blue', 'green', 'yellow'];
  var frequencies = [329.63, 261.63, 392.00, 523.25];
  var pads = [];

  var speeds = {
    easy: 800,
    medium: 500,
    hard: 300
  };
  var showSpeed = speeds[difficulty] || speeds.easy;

  var audioCtx = null;
  var messageDisplay, scoreDisplay, roundDisplay;

  function initAudio() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  function playTone(frequency, duration) {
    initAudio();
    var oscillator = audioCtx.createOscillator();
    var gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);

    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + duration);
  }

  function flashPad(index, duration) {
    var pad = pads[index];
    pad.style.opacity = '1';
    pad.style.transform = 'scale(1.05)';
    pad.style.boxShadow = '0 0 20px ' + colors[index];

    playTone(frequencies[index], duration / 1000);

    setTimeout(function() {
      pad.style.opacity = '0.6';
      pad.style.transform = 'scale(1)';
      pad.style.boxShadow = 'none';
    }, duration);
  }

  function showPattern(callback) {
    isShowingPattern = true;
    messageDisplay.textContent = 'Watch the pattern!';
    var i = 0;

    function showNext() {
      if (i < patternSequence.length) {
        flashPad(patternSequence[i], showSpeed);
        i++;
        setTimeout(showNext, showSpeed + 200);
      } else {
        isShowingPattern = false;
        messageDisplay.textContent = 'Your turn!';
        if (callback) callback();
      }
    }

    setTimeout(showNext, 500);
  }

  function nextRound() {
    currentRound++;
    playerSequence = [];
    patternSequence.push(Math.floor(Math.random() * 4));
    updateDisplays();
    showPattern();
  }

  function checkSequence() {
    for (var i = 0; i < playerSequence.length; i++) {
      if (playerSequence[i] !== patternSequence[i]) {
        return false;
      }
    }
    return true;
  }

  function handlePadClick(index) {
    if (isShowingPattern || !isPlaying) return;

    flashPad(index, 200);
    playerSequence.push(index);

    if (playerSequence.length === patternSequence.length) {
      if (checkSequence()) {
        score = currentRound;
        messageDisplay.textContent = 'Correct!';
        updateDisplays();
        setTimeout(function() {
          nextRound();
        }, 1000);
      } else {
        endGame();
      }
    } else if (!checkSequence()) {
      endGame();
    }
  }

  function endGame() {
    isPlaying = false;
    score = currentRound;
    var won = score > 0;
    messageDisplay.textContent = 'Game Over! You reached round ' + (currentRound + 1);
    updateDisplays();

    pads.forEach(function(pad) {
      pad.style.pointerEvents = 'none';
    });

    ctx.Session.trackComplete('simon', score, won);
    ctx.Save.addScore('simon', score);
  }

  function updateDisplays() {
    roundDisplay.textContent = 'Round: ' + (currentRound + 1);
    scoreDisplay.textContent = 'Score: ' + score;
  }

  function init() {
    stage.innerHTML = '';
    stage.style.cssText = 'display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;font-family:Arial,sans-serif;background:#1a1a2e;color:white;';

    var container = document.createElement('div');
    container.style.cssText = 'text-align:center;width:90%;max-width:600px;';

    roundDisplay = document.createElement('div');
    roundDisplay.style.cssText = 'font-size:1.2em;margin-bottom:10px;color:#f4b860;';
    roundDisplay.textContent = 'Round: 1';

    var instructions = document.createElement('div');
    instructions.style.cssText = 'font-size:0.9em;color:#888;margin-bottom:15px;';
    instructions.textContent = 'Repeat the pattern! Watch the colors light up.';

    var gridContainer = document.createElement('div');
    gridContainer.style.cssText = 'display:grid;grid-template-columns:repeat(2,120px);grid-gap:12px;margin:20px auto;width:fit-content;';

    pads = [];
    for (var i = 0; i < 4; i++) {
      var pad = document.createElement('div');
      pad.style.cssText = 'width:120px;height:120px;background:' + colors[i] + ';opacity:0.6;border-radius:12px;cursor:pointer;transition:all 0.2s;display:flex;align-items:center;justify-content:center;font-size:1.5em;font-weight:bold;';
      pad.dataset.index = i;
      pad.textContent = colorNames[i][0].toUpperCase();

      pad.addEventListener('click', (function(index) {
        return function() {
          handlePadClick(index);
        };
      })(i));

      pads.push(pad);
      gridContainer.appendChild(pad);
    }

    scoreDisplay = document.createElement('div');
    scoreDisplay.style.cssText = 'font-size:1.3em;margin:15px 0;color:#f4b860;';
    scoreDisplay.textContent = 'Score: 0';

    messageDisplay = document.createElement('div');
    messageDisplay.style.cssText = 'font-size:1.1em;margin:10px 0;min-height:30px;color:#ffd93d;';

    container.appendChild(roundDisplay);
    container.appendChild(instructions);
    container.appendChild(gridContainer);
    container.appendChild(scoreDisplay);
    container.appendChild(messageDisplay);

    stage.appendChild(container);

    currentRound = 0;
    score = 0;
    isPlaying = true;
    playerSequence = [];
    patternSequence = [];

    updateDisplays();
    nextRound();
  }

  init();
};