window.Games = window.Games || {};
window.Games.pattern = function(ctx) {
  var stage = ctx.stage;
  var difficulty = ctx.difficulty || 'easy';
  var currentRound = 0;
  var totalRounds = 5;
  var gridSize = 3;
  var targetPattern = [];
  var playerPattern = [];
  var isPlaying = false;
  var isShowingPattern = false;
  var score = 0;
  var roundScore = 0;

  var difficulties = {
    easy: { colors: 3, lit: 4 },
    medium: { colors: 4, lit: 5 },
    hard: { colors: 5, lit: 6 }
  };

  var config = difficulties[difficulty] || difficulties.easy;
  var colorPalette = ['#ff4444', '#4444ff', '#44ff44', '#ffff44', '#ff44ff'];
  var colorNames = ['red', 'blue', 'green', 'yellow', 'purple'];
  var availableColors = colorPalette.slice(0, config.colors);

  var gridContainer, messageDisplay, scoreDisplay, roundDisplay, timerDisplay;
  var cells = [];
  var showingTimeout = null;

  function shuffleArray(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = arr[i];
      arr[i] = arr[j];
      arr[j] = temp;
    }
    return arr;
  }

  function generatePattern() {
    var positions = [];
    for (var i = 0; i < gridSize * gridSize; i++) {
      positions.push(i);
    }
    positions = shuffleArray(positions);
    var pattern = [];
    for (var i = 0; i < config.lit; i++) {
      var pos = positions[i];
      var colorIndex = Math.floor(Math.random() * config.colors);
      pattern.push({ pos: pos, color: availableColors[colorIndex] });
    }
    return pattern;
  }

  function createGrid() {
    gridContainer.innerHTML = '';
    cells = [];
    gridContainer.style.cssText = 'display:grid;grid-template-columns:repeat(3,80px);grid-gap:8px;margin:20px auto;width:fit-content;';

    for (var i = 0; i < gridSize * gridSize; i++) {
      var cell = document.createElement('div');
      cell.style.cssText = 'width:80px;height:80px;background:#2d2d44;border:2px solid #444;border-radius:8px;cursor:pointer;transition:all 0.2s;display:flex;align-items:center;justify-content:center;';
      cell.dataset.index = i;
      cell.dataset.color = '#2d2d44';

      cell.addEventListener('click', (function(index) {
        return function() {
          if (isShowingPattern || !isPlaying) return;
          toggleCell(index);
        };
      })(i));

      cells.push(cell);
      gridContainer.appendChild(cell);
    }
  }

  function toggleCell(index) {
    var cell = cells[index];
    var currentColor = cell.dataset.color;
    var nextColorIndex = (availableColors.indexOf(currentColor) + 1) % (availableColors.length + 1);

    if (nextColorIndex >= availableColors.length) {
      cell.style.background = '#2d2d44';
      cell.dataset.color = '#2d2d44';
      var playerIdx = playerPattern.findIndex(function(p) { return p.pos === index; });
      if (playerIdx !== -1) {
        playerPattern.splice(playerIdx, 1);
      }
    } else {
      cell.style.background = availableColors[nextColorIndex];
      cell.dataset.color = availableColors[nextColorIndex];
      var existingIdx = playerPattern.findIndex(function(p) { return p.pos === index; });
      if (existingIdx !== -1) {
        playerPattern[existingIdx].color = availableColors[nextColorIndex];
      } else {
        playerPattern.push({ pos: index, color: availableColors[nextColorIndex] });
      }
    }
  }

  function showPattern(callback) {
    isShowingPattern = true;
    playerPattern = [];
    cells.forEach(function(cell) {
      cell.style.background = '#2d2d44';
      cell.dataset.color = '#2d2d44';
    });

    setTimeout(function() {
      targetPattern.forEach(function(item) {
        cells[item.pos].style.background = item.color;
        cells[item.pos].dataset.color = item.color;
      });

      setTimeout(function() {
        cells.forEach(function(cell) {
          cell.style.background = '#2d2d44';
          cell.dataset.color = '#2d2d44';
        });
        isShowingPattern = false;
        if (callback) callback();
      }, 2000);
    }, 500);
  }

  function checkPattern() {
    var correct = 0;
    var total = targetPattern.length;

    targetPattern.forEach(function(item) {
      var playerItem = playerPattern.find(function(p) { return p.pos === item.pos; });
      if (playerItem && playerItem.color === item.color) {
        correct++;
      }
    });

    var accuracy = correct / total;
    roundScore = Math.round(accuracy * 100);
    score += roundScore;
    return accuracy;
  }

  function nextRound() {
    currentRound++;
    if (currentRound >= totalRounds) {
      endGame();
      return;
    }

    playerPattern = [];
    targetPattern = generatePattern();
    messageDisplay.textContent = 'Memorize the pattern!';
    updateDisplays();

    showPattern(function() {
      messageDisplay.textContent = 'Recreate the pattern!';
    });
  }

  function endGame() {
    isPlaying = false;
    var won = score > 0;
    messageDisplay.textContent = 'Game Over! Final Score: ' + score;
    ctx.Session.trackComplete('pattern', score, won);
    ctx.Save.addScore('pattern', score);
  }

  function updateDisplays() {
    roundDisplay.textContent = 'Round: ' + (currentRound + 1) + '/' + totalRounds;
    scoreDisplay.textContent = 'Score: ' + score;
  }

  function init() {
    stage.innerHTML = '';
    stage.style.cssText = 'display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;font-family:Arial,sans-serif;background:#1a1a2e;color:white;';

    var container = document.createElement('div');
    container.style.cssText = 'text-align:center;width:90%;max-width:600px;';

    roundDisplay = document.createElement('div');
    roundDisplay.style.cssText = 'font-size:1.2em;margin-bottom:10px;color:#c084fc;';
    roundDisplay.textContent = 'Round: 1/' + totalRounds;

    var instructions = document.createElement('div');
    instructions.style.cssText = 'font-size:0.9em;color:#888;margin-bottom:15px;';
    instructions.textContent = 'Memorize the pattern, then recreate it by clicking squares.';

    gridContainer = document.createElement('div');
    createGrid();

    messageDisplay = document.createElement('div');
    messageDisplay.style.cssText = 'font-size:1.1em;margin:15px 0;min-height:30px;color:#ffd93d;';

    scoreDisplay = document.createElement('div');
    scoreDisplay.style.cssText = 'font-size:1.3em;margin:10px 0;color:#c084fc;';
    scoreDisplay.textContent = 'Score: 0';

    var submitBtn = document.createElement('button');
    submitBtn.textContent = 'Submit Pattern';
    submitBtn.style.cssText = 'padding:10px 25px;font-size:1.1em;background:#c084fc;color:white;border:none;border-radius:8px;cursor:pointer;margin:10px;';
    submitBtn.addEventListener('click', function() {
      if (isShowingPattern || !isPlaying) return;
      var accuracy = checkPattern();
      messageDisplay.textContent = 'Accuracy: ' + Math.round(accuracy * 100) + '%';
      updateDisplays();
      setTimeout(function() {
        nextRound();
      }, 1500);
    });

    container.appendChild(roundDisplay);
    container.appendChild(instructions);
    container.appendChild(gridContainer);
    container.appendChild(messageDisplay);
    container.appendChild(scoreDisplay);
    container.appendChild(submitBtn);

    stage.appendChild(container);

    currentRound = 0;
    score = 0;
    isPlaying = true;

    targetPattern = generatePattern();
    updateDisplays();

    showPattern(function() {
      messageDisplay.textContent = 'Recreate the pattern!';
    });
  }

  init();
};